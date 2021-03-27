# -*- coding: utf-8 -*-
from optparse import make_option
from django.core.management.base import BaseCommand, CommandError
import datetime, random, string, time
import logging, traceback
from checkin.tracking.models import Location
from checkin.resources.models import Resource, Reservation
from checkin.users.models import User, Profile
from django.utils.timezone import make_aware

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Block resources for given period."

    importer_types = ['resources']

    def add_arguments(self, parser):
        parser.add_argument('--resources', type=str, help='UUIDs of resources, sperated by comma or `all`.')
        parser.add_argument('--user', type=str, help='User ID/UUID/pk for reservations.')
        parser.add_argument('-s', '--start', required=True,
                            type=lambda d: datetime.datetime.strptime(d, '%Y-%m-%d-%H-%M'),
                            help='Datetime begin. Format: YYYY-MM-DD-HH-mm.')
        parser.add_argument('-e', '--end', required=True, type=lambda d: datetime.datetime.strptime(d, '%Y-%m-%d-%H-%M'),
                            help='Daterange begin. Format: YYYY-MM-DD-HH-mm.')


    def handle(self, *args, **options):
        print = self.stdout.write

        user = User.objects.get(pk=options['user'])
        if options['resources'] == 'all':
            resources = Resource.objects.filter(reservable=True)
        else:
            resource_uuids = options['resources'].split(",")
            resources = Resource.objects.filter(reservable=True).filter(pk__in=resource_uuids)

        for resource in resources:

            print("## New reservation ##")
            print("Resource: %s" % resource)

            try:

                reservation = Reservation(**{
                    'resource': resource,
                    'user': user,
                    'begin': make_aware(options['start'], resource.get_tz()),
                    'end': make_aware(options['end'], resource.get_tz()),
                    'message': "Blocked via command %s" % (datetime.datetime.now().strftime("%d.%m.%Y %H:%M")),
                    'type': Reservation.TYPE_BLOCKED,
                })
                reservation.save()

            except Exception as e:
                logger.error(traceback.format_exc())

            print("## End reservation ##")

        print("Run finished.")