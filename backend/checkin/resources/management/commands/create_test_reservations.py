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

## helper

def random_date_between(start_date, end_date):
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + datetime.timedelta(days=random_number_of_days)

    return random_date

def random_time_between(start_h, end_h):
    h_between_times = end_h - start_h
    random_hour = start_h + random.randrange(h_between_times)
    random_time = datetime.time(random_hour, 00)

    return random_time

def get_or_create_test_users(count=10):
    """
    Returns a list of users.
    :return:
    """
    for i in range(0,count):
        yield get_or_create_user('testuser-%i@example.com' % i, 'Testuser', str(i))

def get_or_create_user(email, first_name, last_name):
    user, created = User.objects.get_or_create(email=email)
    user.first_name = first_name
    user.last_name = last_name
    user.phone = '0000000000000'
    user.email = email
    user.save()
    return user

MAX_DURATION = 10
ERLIEST_START_HOUR = 10
LATEST_START_HOUR = 16

def get_or_create_test_resources(count=10):
    # FIXME create some test resources
    # uuids = [
    #     '8528652d-b34c-49a4-a6a2-146b7a7d8aac',
    # ]
    # return Resource.objects.filter(uuid__in=uuids)
    return Resource.objects.all()[:count]


class Command(BaseCommand):
    help = "Create a bunch of test reservations."

    importer_types = ['resources']

    def add_arguments(self, parser):
        parser.add_argument('-n', '--count', type=int, nargs='?', default=5, help='Number of requests to send.')
        parser.add_argument('-w', '--wait', type=int, nargs='?', default=0,
                            help='Number seconds to wait after each request sent.')
        parser.add_argument('-sd', '--startdate', required=True,
                            type=lambda d: datetime.datetime.strptime(d, '%Y-%m-%d'),
                            help='Daterange begin. Format: YYYY-MM-DD.')
        parser.add_argument('-ed', '--enddate', required=True, type=lambda d: datetime.datetime.strptime(d, '%Y-%m-%d'),
                            help='Daterange begin. Format: YYYY-MM-DD.')


    def handle(self, *args, **options):
        print = self.stdout.write

        possible_users = list(get_or_create_test_users())
        possible_resources = list(get_or_create_test_resources(20))

        number_of_requests = options['count']
        run_id = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(4))
        now = datetime.datetime.now()

        print("Run ID: %s" % run_id)

        for i in range(0, number_of_requests):

            print("## New request ##")

            print("Request %i / %i" % (i + 1, number_of_requests))

            try:

                start_datetime = datetime.datetime.combine(
                    random_date_between(options['startdate'], options['enddate']),
                    random_time_between(ERLIEST_START_HOUR, LATEST_START_HOUR)
                )
                end_datetime = start_datetime + datetime.timedelta(hours=random.randrange(MAX_DURATION))

                user = random.choice(possible_users)
                resource = random.choice(possible_resources)

                # continue

                case_id = "%s-%i" % (run_id, i + 1)

                reservation = Reservation(**{
                    'resource': resource,
                    'user': user,
                    'begin': make_aware(start_datetime, resource.get_tz()),
                    'end': make_aware(end_datetime, resource.get_tz()),
                    'has_priority': bool(random.getrandbits(1)),
                    'message': "Test message from test run via command %s %s" % (case_id, now.strftime("%d.%m.%Y %H:%M")),
                })
                # FIXME template missing! Does not fail gracefully. :/
                # reservation.process_state_change(Reservation.CREATED, Reservation.REQUESTED, user)
                reservation.save()
                # pprint.pprint(reservation)

                waittime = options['wait']
                if waittime:
                    print("Waiting %i seconds..." % waittime)
                    time.sleep(waittime)
                    print("Finished waiting.")

            except Exception as e:
                logger.error(traceback.format_exc())

            print("## End request ##")

        print("Run ID: %s" % run_id)

        print("Run finished.")