from django.core.management.base import BaseCommand, CommandError
from django.db.models import F, Sum, Value, ExpressionWrapper, fields, Q, Count, Avg, Max, Min
from django.db.models.functions import Coalesce, Greatest, Least
from datetime import timedelta, datetime
from django.utils import timezone
import tablib

from checkin.tracking.models import Checkin, Profile, Location, CHECKIN_LIFETIME, CHECKIN_RETENTION_TIME

def OVERLAP_Q(start, end):
    return Q(time_entered__lt=start) & Q(time_left_or_default__gt=start) | \
           Q(time_entered__lt=end) & Q(time_left_or_default__gt=end) | \
           Q(time_entered__gte=start) & Q(time_left_or_default__lte=end)
    # this one does not work:
    # return  Q(time_entered__lte=start, time_left_or_default__gte=start) | \
    #         Q(time_entered__lt=end, time_left_or_default__gte=end)

def format_datetime(dt):
    return timezone.localtime(dt).strftime("%Y-%m-%d %H:%M:%S")

def format_timedelta(tdelta):
    if timedelta(seconds=1) > tdelta > timedelta(seconds=0):
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

    def __init__(self, profile_id, exclude_location_ids=None, tz=timezone.get_default_timezone()):

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
        self.timezone = tz

    def report(self, include_infected_checkins=True, include_encountered_checkins=True, include_personal_data=False, output_format=OUTPUT_WRITE_FORMAT):

        #change tz
        try:
            timezone.activate(self.timezone)
            print(self.timezone)
            print(timezone.now())
            print(timezone.localtime(timezone.now()))


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
                    self.write_headline("Protokolleinträge der gesuchten Person:")
                    self.write_dataset(infected_checkins_ds)

                if include_encountered_checkins:
                    self.write_headline("Protokolleinträge von anderen Personen mit Überlappungen zur gesuchten Person:")
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

        finally:
            # end tz change
            timezone.deactivate()


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
        ds.append(('Gesuchtes Profil (ID)', self.infected_profile_id))
        ds.append(('Zeitpunkt der Auswertung', format_datetime(self.now)))
        ds.append(('Beginn des Auswertungszeitraums', format_datetime(self.lookback_start)))
        ds.append(('Standardaufenthaltsdauer', format_timedelta(self.CHECKIN_DEFAULT_LENGTH)))
        ds.append(('Kontaktkorrekturzeit', format_timedelta(self.INFECTION_LOOKBACK_BUFFER)))
        ds.append(('Ausgeschlossene Standorte (IDs)', ','.join([str(l) for l in self.exclude_location_ids])))
        ds.append(('Ausgeschlossene Standorte (Bezeichnung)', ','.join([l.__str__() for l in Location.objects.filter(pk__in=self.exclude_location_ids)])))
        ds.append(('Zeitzone', self.timezone))

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
        ds.append(['Gesucht', p.id, p.first_name, p.last_name, p.phone, p.email, format_datetime(p.created_at),
                   format_datetime(p.updated_at), ''])

        for profile_id in sorted(encountered_profiles, key=encountered_profiles.get, reverse=True): # reverse but most duration on top
            p = Profile.objects.get(pk=profile_id)
            ds.append(['Kontakt',p.id, p.first_name, p.last_name, p.phone, p.email, format_datetime(p.created_at), format_datetime(p.updated_at), format_timedelta(encountered_profiles[profile_id])])

        return ds

class UsageReport(object):

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

    def __init__(self, exclude_location_ids=None):
        self.exclude_location_ids = exclude_location_ids or []
        self.CHECKIN_DEFAULT_LENGTH = CHECKIN_LIFETIME

    def report(self):

        now = timezone.now()
        lookback_start = now - CHECKIN_RETENTION_TIME - CHECKIN_LIFETIME
        lookback_end = now - CHECKIN_LIFETIME

        profile_qs = Profile.objects
        checkin_qs = Checkin.objects

        # add checkin count to profiles
        profiles_with_checkin_count = profile_qs.annotate(checkin_count=Count('checkin'))

        # annotate and replace checkins with default checkout time
        checkout_calc_expression = ExpressionWrapper(F('time_entered') + self.CHECKIN_DEFAULT_LENGTH, output_field=fields.DateTimeField())
        checkin_qs = checkin_qs.annotate(time_left_or_default=Coalesce('time_left', checkout_calc_expression))

        # filter lookup window
        checkin_qs = checkin_qs.filter(time_entered__gte=lookback_start).filter(time_left_or_default__lte=lookback_end) \
        # remove default order
        checkin_qs = checkin_qs.order_by()

        # add duration
        duration_expression = ExpressionWrapper(F('time_left') - F('time_entered'),
                                                output_field=fields.DurationField())
        checkins_with_duration = checkin_qs.exclude(time_left__isnull=True)\
            .annotate(duration=duration_expression)


        from django.db.models.functions import TruncDay

        ds = tablib.Dataset(title="Auswertung Checkin")
        ds.headers = ['Abfrage', 'Wert']

        # not in use yet:
        ds.append(('Auswertungsbeginn', format_datetime(lookback_start)))
        ds.append(('Auswertungsende', format_datetime(lookback_end)))

        active_locations = Location.objects.filter(removed=False)
        ds.append(('L: Alle (aktiven) Standorte', active_locations.count()))
        ds.append(('Y: Besondere Standorte (IDs)', self.exclude_location_ids))
        ds.append(('Y: Besondere Standorte (Anazhl)', active_locations.filter(id__in=self.exclude_location_ids).count()))
        ds.append(('X: Normale Standorte (Anzahl)', active_locations.exclude(id__in=self.exclude_location_ids).count()))

        ds.append(('Systemseitige Ablaufzeit von Checkins', format_timedelta(CHECKIN_LIFETIME)))
        ds.append(('A: Aufenthalte insgesamt', checkin_qs.count()))
        ds.append(('Aufenthalte insgesamt ohne Y', checkin_qs.exclude(location__in=self.exclude_location_ids).count()))
        ds.append(('Aufenthalte insgesamt nur Y', checkin_qs.filter(location__in=self.exclude_location_ids).count()))
        ds.append(('Aufenthalte ohne Checkout', checkin_qs.filter(time_left__isnull=True).count()))
        ds.append(('Aufenthalte ohne Checkout ohne Y', checkin_qs.exclude(location__in=self.exclude_location_ids).filter(time_left__isnull=True).count()))
        ds.append(('Aufenthalte mit In und Out', checkin_qs.exclude(time_left__isnull=True).count()))
        ds.append(('Aufenthalte durchschnittliche Dauer', checkins_with_duration.aggregate(Avg('duration'))['duration__avg']))
        ds.append(('Aufenthalte durchschnittliche Dauer nur Y', checkins_with_duration.filter(location__in=self.exclude_location_ids).aggregate(Avg('duration'))['duration__avg']))
        ds.append(('Aufenthalte durchschnittliche Dauer ohne Y', checkins_with_duration.exclude(location__in=self.exclude_location_ids).aggregate(Avg('duration'))['duration__avg']))
        ds.append(('Aufenthalte maximale Dauer', checkins_with_duration.aggregate(Max('duration'))['duration__max']))
        ds.append(('Personen pro Tag (über alle Standorte) durchsch.', checkin_qs.annotate(checkin_date=TruncDay('time_entered'))
                                                                      .values('checkin_date','profile')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Avg('id__count'))\
                                                                      ['id__count__avg']
                                                                     ))
        ds.append(('Personen pro Tag (über alle Standorte) min.', checkin_qs.annotate(checkin_date=TruncDay('time_entered'))
                                                                      .values('checkin_date','profile')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Min('id__count'))\
                                                                      ['id__count__min']
                                                                     ))
        ds.append(('Personen pro Tag (über alle Standorte) max.', checkin_qs.annotate(checkin_date=TruncDay('time_entered'))
                                                                      .values('checkin_date','profile')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Max('id__count'))\
                                                                      ['id__count__max']
                                                                     ))
        ds.append(('Aufenthalte pro Tag (über alle Nutzer) durchsch.', checkin_qs.annotate(checkin_date=TruncDay('time_entered'))
                                                                      .values('checkin_date')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Avg('id__count'))\
                                                                      ['id__count__avg']
                                                                     ))
        ds.append(('Aufenthalte pro Tag (über alle Nutzer) ohne Y durchsch.', checkin_qs.exclude(location__in=self.exclude_location_ids).annotate(checkin_date=TruncDay('time_entered'))
                                                                      .values('checkin_date')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Avg('id__count'))\
                                                                      ['id__count__avg']
                                                                     ))
        ds.append(('Aufenthalte pro Tag (über alle Nutzer) nur Y durchsch.', checkin_qs.filter(location__in=self.exclude_location_ids).annotate(checkin_date=TruncDay('time_entered'))
                                                                      .values('checkin_date')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Avg('id__count'))\
                                                                      ['id__count__avg']
                                                                     ))
        ds.append(('Aufenthalte pro Tag pro Nutzer durchsch.', checkin_qs.annotate(checkin_date=TruncDay('time_entered'))
                                                                      .values('checkin_date','profile')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Avg('id__count'))\
                                                                      ['id__count__avg']
                                                                     ))
        ds.append(('Aufenthalte pro Tag pro Standort ohne Y durchsch.', checkin_qs.exclude(location__in=self.exclude_location_ids).annotate(checkin_date=TruncDay('time_entered'))
                                                                      .values('checkin_date','location')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Avg('id__count'))\
                                                                      ['id__count__avg']
                                                                     ))
        ds.append(('Aufenthalte pro Tag pro Standort nur Y durchsch.', checkin_qs.filter(location__in=self.exclude_location_ids).annotate(checkin_date=TruncDay('time_entered'))
                                                                      .values('checkin_date','location')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Avg('id__count'))\
                                                                      ['id__count__avg']
                                                                     ))
        ds.append(('Aufenthalte pro Tag pro Standort nur Y durchsch. Mo - Fr', checkin_qs.filter(time_entered__iso_week_day__gte=1).filter(time_entered__iso_week_day__lte=5).filter(location__in=self.exclude_location_ids).annotate(checkin_date=TruncDay('time_entered'))
                                                                      .values('checkin_date','location')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Avg('id__count'))\
                                                                      ['id__count__avg']
                                                                     ))
        ds.append(('Aufenthalte pro Tag pro Standort nur Y durchsch. Sa - So', checkin_qs.filter(time_entered__iso_week_day__gte=6).filter(time_entered__iso_week_day__lte=7).filter(location__in=self.exclude_location_ids).annotate(checkin_date=TruncDay('time_entered'))
                                                                      .values('checkin_date','location')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Avg('id__count'))\
                                                                      ['id__count__avg']
                                                                     ))

        # ds.append(('Checkins pro Nutzungstag echt durchsch.', checkins_with_duration.aggregate(Max('duration'))['duration__max']))
        # ds.append(('Checkins pro Nutzungstag ohne Aussschlussorte durchsch.', checkins_with_duration.aggregate(Max('duration'))['duration__max']))
        ds.append(('Anzahl von Nutzern', Profile.objects.count()))
        ds.append(('Anzahl von Nutzern mit mind. 1 Checkin', profiles_with_checkin_count.filter(checkin_count__gte=1).count()))
        ds.append(('Anzahl von Nutzern mit mind. 5 Checkin', profiles_with_checkin_count.filter(checkin_count__gte=5).count()))
        ds.append(('Anzahl von Nutzern mit mind. 10 Checkin', profiles_with_checkin_count.filter(checkin_count__gte=10).count()))
        ds.append(('Anzahl von Nutzern mit mind. 15 Checkin', profiles_with_checkin_count.filter(checkin_count__gte=15).count()))
        ds.append(('Anzahl von Nutzern mit mind. 25 Checkin', profiles_with_checkin_count.filter(checkin_count__gte=25).count()))
        ds.append(('Anzahl von Nutzern mit mind. 50 Checkin', profiles_with_checkin_count.filter(checkin_count__gte=50).count()))
        ds.append(('Anzahl von Nutzern mit mind. 100 Checkin', profiles_with_checkin_count.filter(checkin_count__gte=100).count()))
        checkins_at_Y = checkin_qs.filter(location__in=self.exclude_location_ids)
        checkins_at_X = checkin_qs.exclude(location__in=self.exclude_location_ids)
        ds.append(('Anzahl von Nutzern mit Checkin anhand Y', checkins_at_Y.distinct('profile').count()))
        ds.append(('Anzahl von Nutzern mit Checkin anhand X', checkins_at_X.distinct('profile').count()))
        ds.append(('Anzahl von Nutzern mit Checkin anhand X intersect Y', checkins_at_X.intersection(checkins_at_Y).distinct('profile').count()))
        ds.append(('Anzahl von Nutzern mit Checkin anhand X difference Y', checkins_at_X.difference(checkins_at_Y).distinct('profile').count()))
        ds.append(('Anzahl von Nutzern mit Checkin anhand Y', checkin_qs.filter(location__in=self.exclude_location_ids)
                                                                      .values('profile')
                                                                      .annotate(Count('id'))
                                                                      .order_by()
                                                                      .aggregate(Avg('id__count'))\
                                                                      ['id__count__avg']
                                                                     ))
        profiles_with_checkin_count_at_x_and_y = profile_qs.annotate(checkin_at_y_count=Count('checkin', filter=Q(checkin__location__in=self.exclude_location_ids))) \
            .annotate(checkin_at_x_count=Count('checkin', exclude=Q(checkin__location__in=self.exclude_location_ids)))
        ds.append(('Anzahl von Nutzern mit Annotation (Test)', profiles_with_checkin_count_at_x_and_y.count()))
        ds.append(('Anzahl von Nutzern mit Annotation mit Checkins bei Y', profiles_with_checkin_count_at_x_and_y.filter(checkin_at_y_count__gt=0).count()))
        ds.append(('Anzahl von Nutzern mit Annotation mit Checkins bei X', profiles_with_checkin_count_at_x_and_y.filter(checkin_at_x_count__gt=0).count()))
        ds.append(('Anzahl von Nutzern mit Annotation mit Checkins bei X und Y', profiles_with_checkin_count_at_x_and_y.filter(checkin_at_y_count__gt=0).filter(checkin_at_x_count__gt=0).count()))
        ds.append(('Anzahl von Nutzern mit Annotation mit Checkins ohne X und ohne Y', profiles_with_checkin_count_at_x_and_y.exclude(checkin_at_y_count__gt=0).exclude(checkin_at_x_count__gt=0).count()))
        # ds.append(('Anzahl von Nutzern mit Checkin ohne Y', Checkin.objects.filter(location__in=self.exclude_location_ids)
        #                                                               .values('profile')
        #                                                              ~ .annotate(Count('id'))
        #                                                               .order_by()
        #                                                               .aggregate(Avg('id__count'))\
        #                                                               ['id__count__avg']
        #                                                              ))
        ds.append(('Anzahl von Nutzern ohne Checkins', profiles_with_checkin_count.filter(checkin_count__lte=0).count()))
        ds.append(('Anzahl von Nutzern ohne Checkin an X nach Checkin an Y binnen 24h', ''))
        # funktioniert nicht:
        # ds.append(('Durchs. Checkins pro Person', checkin_qs.values('profile').annotate(num_checkins=Count('profile', distinct=True)).aggregate(Avg('num_checkins'))['num_checkins__avg']))
        # ds.append(('Maximale Checkins pro Person', checkin_qs.values('profile').annotate(num_checkins=Count('profile', distinct=True)).aggregate(Max('num_checkins'))['num_checkins__max']))
        # ds.append(('Durchs. Standorte pro Person', checkin_qs.values('profile','location').annotate(num_checkins=Count('location', distinct=True)).aggregate(Avg('num_checkins'))['num_checkins__avg']))
        # ds.append(('Checkins pro Person pro Nutzungstag',
        # ds.append(('Checkins nur Am Speicher XI (diese sollten wir strategisch besonders behandeln)',
        # ds.append(('Checkins nur Am Speicher XI (diese sollten wir strategisch besonders behandeln)',

        # ds.append(('Zurückverfolge Kontake', profiles_with_checkin_count.filter(checkin_count__gte=100).count()))
        # ds.append(('Durchschnittliche Kontaktzeit', profiles_with_checkin_count.filter(checkin_count__gte=100).count()))
        # ds.append(('Durchschnittliche Kontakte am Nutzungstag', profiles_with_checkin_count.filter(checkin_count__gte=100).count()))
        # ds.append(('Maximale Kontakte am Nutzungstag', profiles_with_checkin_count.filter(checkin_count__gte=100).count()))
        # ds.append(('Unklare Kontakte', profiles_with_checkin_count.filter(checkin_count__gte=100).count()))

        # Checkins ohne Buchung
        # Buchungen ohne Checkin

        # Checkins über Tageszeiten
        # Checkins in Testräumen
        # 1.11.090
        # 10 – 22
        # 16.11.2020

        # aktive Fälle ausschließen. 24 Stunden zurück.
        # TODO: Statt Anzahl lieber alles in Prozent. z.B. Gruppe A vs. Gruppe B.

        self.write_dataset(ds)

        # TODO: performance: Select related -> .select_related('blog') and prefetch_related reduces num of queries