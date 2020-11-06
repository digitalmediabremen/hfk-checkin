from django.core.management.base import BaseCommand, CommandError
from django.db.models import F, Sum, Value, ExpressionWrapper, fields, Q
from django.db.models.functions import Coalesce, Greatest, Least
from datetime import timedelta, datetime
from django.utils import timezone

from checkin.tracking.models import Checkin, Profile, Location

SEPARATOR_CHAR_COUNT = 40

def OVERLAP_Q(start, end):
    return Q(time_entered__lt=start) & Q(time_left_or_default__gt=start) | \
           Q(time_entered__lt=end) & Q(time_left_or_default__gt=end) | \
           Q(time_entered__gte=start) & Q(time_left_or_default__lte=end)
    # this one does not work:
    # return  Q(time_entered__lte=start, time_left_or_default__gte=start) | \
    #         Q(time_entered__lt=end, time_left_or_default__gte=end)

class Command(BaseCommand):
    help = '(COVID-infection test analysis) Return encounters of a (infected) person with other persons.'

    def add_arguments(self, parser):
        parser.add_argument('--profile', nargs=1, type=int, required=True, help='ID of infected profile.')
        parser.add_argument('--exclude_locations', nargs='+', type=int, help='ID(s) of locations to exclude.')
        parser.add_argument('--show_infected_checkins', action="store_true", help='Output list of checkins by infected persons')
        parser.add_argument('--show_encountered_checkins', action="store_true", help='Output list of checkins with encountered persons')
        parser.add_argument('--show_personal_data', action="store_true", help='Output personal data: full name and contact info')

    def handle(self, *args, **options):

        checkin_default_length = timedelta(hours=12)
        infection_lookback_time = timedelta(days=100)  # defaults to CHECKIN_RETENTION_TIME
        # if positive: adds extra time to checkins, so they might overlap (even if they do not by raw data). encouters-set is larger.
        # if negative: removes time from checkins, so "brief" encounters are excluded. encounter-set is smaller.
        infection_lookback_buffer = timedelta(minutes=10)

        infection_exclusion_locations = Location.objects.filter(id=1)

        profile_id = options['profile'][0]
        try:
            infected_profile = Profile.objects.get(id=profile_id)
        except Profile.DoesNotExist:
            raise CommandError('Profile "%s" does not exist' % profile_id)

        checkin_qs = Checkin.objects

        # annotate and replace checkins with default checkout time
        checkout_calc_expression = ExpressionWrapper(F('time_entered') + checkin_default_length, output_field=fields.DateTimeField())
        checkin_qs = checkin_qs.annotate(time_left_or_default=Coalesce('time_left', checkout_calc_expression))

        # add duration
        duration_expression = ExpressionWrapper(F('time_left_or_default') - F('time_entered'), output_field=fields.DurationField())
        checkin_qs = checkin_qs.annotate(duration=duration_expression)

        # filter by profile
        infected_checkins = checkin_qs.filter(profile=infected_profile)

        now = timezone.now()
        lookback_start = now - infection_lookback_time - checkin_default_length
        infected_checkins = infected_checkins.filter(time_entered__gte=lookback_start)

        if options['exclude_locations']:
            exclude_locations_ids = options['exclude_locations']
            try:
                infected_checkins = infected_checkins.exclude(location__in=infection_exclusion_locations)
            except Location.DoesNotExist:
                raise CommandError('(Some) Locations "%s" do not exist' % exclude_locations_ids)

        self.stdout.write(SEPARATOR_CHAR_COUNT * "#")
        self.stdout.write("INFECTED PERSON:")
        self.stdout.write(SEPARATOR_CHAR_COUNT * "#")
        self.stdout.write(str(infected_profile))
        if options['show_personal_data']:
            self.stdout.write(infected_profile.get_full_profile())

        if options['show_infected_checkins']:
            self.stdout.write(SEPARATOR_CHAR_COUNT * "#")
            self.stdout.write("CHECKINS BY INFECTED PERSON:")
            self.stdout.write(SEPARATOR_CHAR_COUNT * "#")
            for c in infected_checkins:
                self.stdout.write("ID: %i # In: %s # Out: %s # Duration: %s # %s" % (c.id, c.time_entered, c.time_left_or_default, c.duration, c.location))

        if options['show_infected_checkins']:
            self.stdout.write(SEPARATOR_CHAR_COUNT * "#")
            self.stdout.write("ENCOUNTERS WITH INFECTED PERSON AND OTHERS:")
            self.stdout.write(SEPARATOR_CHAR_COUNT * "#")

        encountered_checkins = checkin_qs
        # exclude checkins by infected person themselves
        encountered_checkins = encountered_checkins.exclude(profile=infected_profile)

        # store encountered profiles here
        encountered_profiles = {}

        for c in infected_checkins:

            # modify times to include "buffer" / wiggle time
            c.time_entered -= infection_lookback_buffer
            c.time_left_or_default += infection_lookback_buffer
            if c.time_left:
                c.time_left += infection_lookback_buffer

            qs = encountered_checkins.filter(location=c.location)
            qs = qs.filter(OVERLAP_Q(c.time_entered, c.time_left_or_default))

            # annotate overlap start and end
            qs = qs.annotate(overlap_start=Greatest('time_entered', Value(c.time_entered)))
            qs = qs.annotate(overlap_end=Least('time_left_or_default', Value(c.time_left_or_default)))

            # add overlap duration
            duration_expression = ExpressionWrapper(F('overlap_end') - F('overlap_start'),
                                                    output_field=fields.DurationField())
            qs = qs.annotate(overlap_duration=duration_expression)

            # add encountered checkin (for debugging)
            qs = qs.annotate(encountered_checkin=Value(c.pk, output_field=fields.IntegerField()))

            for c in qs.order_by('overlap_duration'):
                try:
                    encountered_profiles[c.profile.pk] += c.overlap_duration
                except KeyError:
                    encountered_profiles[c.profile.pk] = c.overlap_duration
                if options['show_encountered_checkins']:
                    self.stdout.write("ID: %i # In: %s # Out: %s # Duration: %s # %s # %s # Overlap: %s (Start: %s – End: %s) with ID %i" % \
                                      (c.id,
                                       c.time_entered,
                                       c.time_left_or_default,
                                       c.duration,
                                       c.location,
                                       c.profile,
                                       c.overlap_duration,
                                       c.overlap_start,
                                       c.overlap_end,
                                       c.encountered_checkin))

        self.stdout.write(SEPARATOR_CHAR_COUNT * "#")
        self.stdout.write("PERSONS WITH CONTACTS TO INFECTED PERSON:")
        self.stdout.write(SEPARATOR_CHAR_COUNT * "#")

        for p in sorted(encountered_profiles, key=encountered_profiles.get, reverse=False):
            self.stdout.write("Profile ID: %i # contact overlap duration sum %s" % (p, encountered_profiles[p]))
            if options['show_personal_data']:
                profile = Profile.objects.get(pk=p)
                self.stdout.write(profile.get_full_profile())