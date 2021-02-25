# -*- coding: utf-8 -*-
from optparse import make_option
from django.core.management.base import BaseCommand, CommandError

from checkin.tracking.models import Location
from checkin.resources.models import Resource


class Command(BaseCommand):
    help = "Import all (legacy) Locations as Resources."

    importer_types = ['resources']

    def add_arguments(self, parser):
        parser.add_argument('--no-input', action="store_true", help='Skip confirmation.')

    def resource_from_location(self, l):
        r = Resource()
        r.name = l.org_name
        r.numbers = [l.org_number]
        r.area = l.org_size
        r.people_capacity = l.capacity
        r.reservation_info = "\n".join([l.org_comment, l.org_capacity_comment])
        r.reservable = l.org_bookable
        # TODO nutzungsarten as group?
        # TODO floor number and name
        # TODO use parent for Unit
        # TODO use org_responsible
        # TODO set resource_type
        # TODO set reverse relation to Location / CheckinLocation
        return r

    def handle(self, *args, **options):
        self.stdout.write(self.help)
        # self.stdout.write('CHECKIN_RETENTION_TIME: %s' % CHECKIN_RETENTION_TIME)
        qs = Location.objects.all()

        if qs.exists():
            count = qs.count()
        else:
            self.stdout.write('No objects found.')
            return

        resources = [self.resource_from_location(location) for location in qs]

        if options['no_input']:
            pass
        else:
            confirm = input('You to create %i Resources in your database. Proceed? (Y/n) ' % count)
            while 1:
                if confirm not in ('Y', 'n', 'yes', 'no'):
                    confirm = input('Please enter either "yes" or "no": ')
                    continue
                if confirm in ('Y', 'yes'):
                    break
                else:
                    self.stdout.write('Aborted.')
                    return

        objs = Resource.objects.bulk_create(resources)
        self.stdout.write('Successfully created %i objects.' % len(objs))
