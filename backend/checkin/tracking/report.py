from django.core.management.base import BaseCommand, CommandError
from django.db.models import F, Sum, Value, ExpressionWrapper, fields, Q
from django.db.models.functions import Coalesce, Greatest, Least
from datetime import timedelta, datetime
from django.utils import timezone
import tablib

from checkin.tracking.models import Checkin, Profile, Location, CHECKIN_LIFETIME

def OVERLAP_Q(start, end):
    return Q(time_entered__lt=start) & Q(time_left_or_default__gt=start) | \
           Q(time_entered__lt=end) & Q(time_left_or_default__gt=end) | \
           Q(time_entered__gte=start) & Q(time_left_or_default__lte=end)
    # this one does not work:
    # return  Q(time_entered__lte=start, time_left_or_default__gte=start) | \
    #         Q(time_entered__lt=end, time_left_or_default__gte=end)

def format_datetime(dt):
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def format_timedelta(tdelta):
    if tdelta < timedelta(seconds=1):
        return "weniger als 1 Sek."
    fmt = "{days} Tage {hours}:{minutes}:{seconds}"
    d = {"days": tdelta.days}
    d["hours"], rem = divmod(tdelta.seconds, 3600)
    d["minutes"], d["seconds"] = divmod(rem, 60)
    return fmt.format(**d)

class ContactReport(object):

    CHECKIN_DEFAULT_LENGTH = CHECKIN_LIFETIME
    INFECTION_LOOKBACK_TIME = timedelta(days=21)  # defaults to CHECKIN_RETENTION_TIME
    # if positive: adds extra time to checkins, so they might overlap (even if they do not by raw data).
    # encounter-set is larger.
    # if negative: removes time from checkins, so "brief" encounters are excluded.
    # encounter-set is smaller.
    INFECTION_LOOKBACK_BUFFER = timedelta(minutes=0)

    out_callable = None

    OUTPUT_WRITE_FORMAT = 'strout'
    XLSX_FORMAT = 'xlsx'
    CSV_FORMAT = 'csv'

    def set_output(self, output_callable):
        if not callable(output_callable):
            raise RuntimeError("Must be a callable to put output to.")
        self.out_callable = output_callable

    def write_out(self, text):
        self.out_callable(str(text))

    def write_dataset(self, ds):
        # ['simple', 'plain', 'grid', 'fancy_grid', 'github', 'pipe', 'orgtbl',
        #  'jira', 'presto', 'psql', 'rst', 'mediawiki', 'moinmoin', 'youtrack',
        #  'html', 'latex', 'latex_raw', 'latex_booktabs', 'tsv', 'textile']
        # self.write_out(ds.export("cli", tablefmt="grid"))
        self.write_out(ds.export("cli", tablefmt="simple"))

    def write_headline(self, headline):

        self.write_out("")
        self.write_out(len(headline) * "-")
        self.write_out(headline)
        self.write_out(len(headline) * "-")
        self.write_out("")

    def __init__(self, profile_id, exclude_location_ids=None):

        if not isinstance(profile_id, int):
            raise TypeError("'profile_id' must be a integer.")

        try:
            if not all(isinstance(n, int) for n in exclude_location_ids):
                raise TypeError("'exclude_location_ids' must be a list of integers.")
        except TypeError:
            raise TypeError("'exclude_location_ids' must be a list of integers.")

        self.now = timezone.now()
        self.infected_profile_id = profile_id
        self.exclude_location_ids = exclude_location_ids or []
        self.lookback_start = self.now - self.INFECTION_LOOKBACK_TIME - self.CHECKIN_DEFAULT_LENGTH

    def report(self, include_infected_checkins=True, include_encountered_checkins=True, include_personal_data=False, output_format=OUTPUT_WRITE_FORMAT):

        try:
            infected_profile = Profile.objects.get(id=self.infected_profile_id)
        except Profile.DoesNotExist:
            raise CommandError('Profile "%s" does not exist' % self.infected_profile_id)

        # ANALYSE

        (infected_checkins, infected_checkins_ds) = self.get_infected_checkins_ds(infected_profile)
        (encountered_checkins, encountered_profiles, encountered_checkins_ds) = self.get_encountered_checkins_ds(infected_profile, infected_checkins)
        encountered_profiles_ds = self.get_encounterd_profiles_ds(encountered_profiles)

        # OUTPUT

        if output_format is self.OUTPUT_WRITE_FORMAT:

            if not self.out_callable:
                raise RuntimeError("Output not set. Please set_output first.")

            self.write_headline("Konfiguration dieses Reports:")
            self.write_dataset(self.get_report_info_ds())

            if include_infected_checkins:
                self.write_headline("Protokolleinträge der infizierten Person:")
                self.write_dataset(infected_checkins_ds)

            if include_encountered_checkins:
                self.write_headline("Protokolleinträge von anderen Personen mit Überlappungen zur infizierten Person:")
                self.write_dataset(encountered_checkins_ds)

            if include_personal_data:
                self.write_headline("Personendaten und Kontaktdaten mit Überlappungszeit:")
                self.write_dataset(encountered_profiles_ds)

        if output_format is self.XLSX_FORMAT:

            book = tablib.Databook()
            book.add_sheet(self.get_report_info_ds())

            if include_infected_checkins:
                book.add_sheet(infected_checkins_ds)

            if include_encountered_checkins:
                book.add_sheet(encountered_checkins_ds)

            if include_personal_data:
                book.add_sheet(encountered_profiles_ds)

            return book.export(format='xlsx')


    def _checkin_base_qs(self):

        checkin_qs = Checkin.objects

        # annotate and replace checkins with default checkout time
        checkout_calc_expression = ExpressionWrapper(F('time_entered') + self.CHECKIN_DEFAULT_LENGTH, output_field=fields.DateTimeField())
        checkin_qs = checkin_qs.annotate(time_left_or_default=Coalesce('time_left', checkout_calc_expression))

        # add duration
        duration_expression = ExpressionWrapper(F('time_left_or_default') - F('time_entered'), output_field=fields.DurationField())
        checkin_qs = checkin_qs.annotate(duration=duration_expression)

        return checkin_qs

    def get_report_info_ds(self):

        ds = tablib.Dataset(title="Parameter")
        ds.append(('Infiziertes Profil (ID)', self.infected_profile_id))
        ds.append(('Zeitpunkt der Auswertung', format_datetime(self.now)))
        ds.append(('Beginn des Auswertungszeitraums', format_datetime(self.lookback_start)))
        ds.append(('Standardaufenthaltsdauer', format_timedelta(self.CHECKIN_DEFAULT_LENGTH)))
        ds.append(('Kontaktkorrekturzeit', format_timedelta(self.INFECTION_LOOKBACK_BUFFER)))
        ds.append(('Ausgeschlossene Standorte (IDs)', ','.join([str(l) for l in self.exclude_location_ids])))
        ds.append(('Ausgeschlossene Standorte (Bezeichnung)', ','.join([l.__str__() for l in Location.objects.filter(pk__in=self.exclude_location_ids)])))

        return ds

    def get_infected_checkins_ds(self, infected_profile):

        checkin_qs = self._checkin_base_qs()

        # filter by profile
        infected_checkins = checkin_qs.filter(profile=infected_profile)

        infected_checkins = infected_checkins.filter(time_entered__gte=self.lookback_start)

        if self.exclude_location_ids:
            exclude_locations_ids = self.exclude_location_ids
            try:
                infected_checkins = infected_checkins.exclude(location__in=exclude_locations_ids)
            except Location.DoesNotExist:
                raise CommandError('(Some) Locations "%s" do not exist' % exclude_locations_ids)

        ds = tablib.Dataset(title="Aufenthalte")
        ds.headers = ['ID', 'Profil ID', 'Standort', 'Checkin', 'Checkout', 'Dauer']
        for c in infected_checkins:
            ds.append((c.id, c.profile.pk, c.location, format_datetime(c.time_entered), format_datetime(c.time_left_or_default), format_timedelta(c.duration)))

        return infected_checkins, ds

    def get_encountered_checkins_ds(self, infected_profile, infected_checkins):
        if not infected_checkins:
            RuntimeError("Evaluate infected checkins first.")

        encountered_checkins = self._checkin_base_qs()
        # exclude checkins by infected person themselves
        encountered_checkins = encountered_checkins.exclude(profile=infected_profile)

        # store encountered profiles here
        encountered_profiles = {}

        ds = tablib.Dataset(title="Kontakte")
        ds.headers = ['ID', 'Profil ID', 'Standort', 'Checkin', 'Checkout', 'Dauer', 'Dauer Überschneidung', 'Begin Überschneidung', 'Ende Überschneidung']

        for c in infected_checkins:

            # modify times to include "buffer" / wiggle time
            c.time_entered -= self.INFECTION_LOOKBACK_BUFFER
            c.time_left_or_default += self.INFECTION_LOOKBACK_BUFFER
            if c.time_left:
                c.time_left += self.INFECTION_LOOKBACK_BUFFER

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

            for co in qs.order_by('overlap_duration'):
                try:
                    encountered_profiles[co.profile.pk] += co.overlap_duration
                except KeyError:
                    encountered_profiles[co.profile.pk] = co.overlap_duration
                ds.append((co.id,
                           co.profile.pk,
                           co.location,
                           format_datetime(co.time_entered),
                           format_datetime(co.time_left_or_default),
                           format_timedelta(co.duration),
                           format_timedelta(co.overlap_duration),
                           format_datetime(co.overlap_start),
                           format_datetime(co.overlap_end)))

        return encountered_checkins, encountered_profiles, ds

    def get_encounterd_profiles_ds(self, encountered_profiles):

        ds = tablib.Dataset(title="Personendaten")
        ds.headers = ['','ID', 'Vorname', 'Nachname', 'Telefon', 'Email', 'Registriert seit', 'Zuletzt geändert', 'Summe Überlappungszeit']

        p = Profile.objects.get(pk=self.infected_profile_id)
        ds.append(['Infiziert', p.id, p.first_name, p.last_name, p.phone, p.email, format_datetime(p.created_at),
                   format_datetime(p.updated_at), ''])

        for profile_id in sorted(encountered_profiles, key=encountered_profiles.get, reverse=True): # reverse but most duration on top
            p = Profile.objects.get(pk=profile_id)
            ds.append(['Kontakt',p.id, p.first_name, p.last_name, p.phone, p.email, format_datetime(p.created_at), format_datetime(p.updated_at), format_timedelta(encountered_profiles[profile_id])])

        return ds