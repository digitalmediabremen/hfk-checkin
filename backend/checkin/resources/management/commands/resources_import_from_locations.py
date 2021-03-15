# -*- coding: utf-8 -*-
from optparse import make_option
from django.core.management.base import BaseCommand, CommandError

from checkin.tracking.legacy import Location
from checkin.tracking.models import Location as CheckinLocation
from checkin.resources.models import Resource, Unit, ResourceGroup

def create_resource_from_location(location, using='default'):
    l = location
    # skip root nodes, make them units below
    if l.is_root_node():
        return None
    # assume regular Resource otherwise
    r = Resource()
    r.name = l.org_name
    if hasattr(l, 'org_alternative_name'):
        r.alternative_names = l.org_alternative_name
    r.numbers = [n.strip() for n in l.org_number.split("/")]
    r.area = l.org_size
    r.people_capacity_default = l.capacity
    r.reservation_info = "\n".join(filter(None,[l.org_responsible, l.org_comment, l.org_capacity_comment]))
    r.reservable = l.org_bookable
    # r.reservable = True # set all to bookable
    # org_usage fails with: django.core.exceptions.FieldError: Cannot resolve keyword 'location' into field. Choices are: id, name
    # print(l.org_usage.all())
    # groups = [ResourceGroup.objects.using(using).get_or_create(name=usage.name, identifier=usage.name[:100].lower())[0] for usage in l.org_usage.all()]
    if hasattr(l, 'org_floor_number'):
        r.floor_number = l.org_floor_number
    r.unit, created = Unit.objects.using(using).get_or_create(name=l.get_root().org_name,
                                                              slug=l.get_root().org_name.lower()[:20])
    # r.checkinlocation = l
    r.save(using=using)
    # r.groups.add(*groups)
    l = CheckinLocation.objects.using(using).filter(pk=l.pk).update(resource=r)
    return r


class Command(BaseCommand):
    help = "Import all (legacy) Locations as Resources."

    importer_types = ['resources']

    def add_arguments(self, parser):
        parser.add_argument('--no-input', action="store_true", help='Skip confirmation.')

    def handle(self, *args, **options):
        self.stdout.write(self.help)
        # self.stdout.write('CHECKIN_RETENTION_TIME: %s' % CHECKIN_RETENTION_TIME)
        qs = Location.objects.all()

        if qs.exists():
            count = qs.count()
        else:
            self.stdout.write('No objects found.')
            return

        if options['no_input']:
            pass
        else:
            confirm = input('You to create about %i Resources in your database. Proceed? (Y/n) ' % count)
            while 1:
                if confirm not in ('Y', 'n', 'yes', 'no'):
                    confirm = input('Please enter either "yes" or "no": ')
                    continue
                if confirm in ('Y', 'yes'):
                    break
                else:
                    self.stdout.write('Aborted.')
                    return

        resources = [create_resource_from_location(location) for location in qs]
        self.stdout.write('Successfully created %i objects.' % len(resources))
