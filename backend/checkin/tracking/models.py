from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django.utils.translation import ugettext, ugettext_lazy as _
from random import randint
from django.urls import reverse
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import timedelta
from django.core.exceptions import ValidationError
from simple_history.models import HistoricalRecords
from simple_history import register as register_history
from django.db.models import Count
from django.contrib.postgres.search import SearchVector
from dirtyfields import DirtyFieldsMixin
from django_better_admin_arrayfield.models.fields import ArrayField
import random, string
from django.db.models import Prefetch

CHECKIN_RETENTION_TIME = timedelta(weeks=4)
CHECKIN_LIFETIME = timedelta(hours=24)
LOAD_LOOKBACK_TIME = CHECKIN_LIFETIME

from checkin.users.models import Profile
#if not 'checkin.resources' in settings.INSTALLED_APPS:
from checkin.resources.models.resource import Resource

class ActivityProfile(models.Model):
    name_de = models.CharField(_("Bezeichnung DE"), max_length=255)
    name_en = models.CharField(_("Bezeichnung EN"), max_length=255)
    description_de = models.TextField(_("Beschreibung DE"))
    description_en = models.TextField(_("Beschreibung EN"))
    distance_rule_de = models.CharField(_("Mindestabstand DE"), max_length=50, default="1,5 m", blank=True, null=True)
    distance_rule_en = models.CharField(_("Mindestabstand EN"), max_length=50, default="1,5 m", blank=True, null=True)
    other_rules_de = models.TextField(_("Regeln, Sonstige Maßnahmen DE"), blank=True, null=True)
    other_rules_en = models.TextField(_("Regeln, Sonstige Maßnahmen EN"), blank=True, null=True)

    class Meta:
        verbose_name = _("Aktivitätsprofil")
        verbose_name_plural = _("Aktivitätsprofile")

    def __str__(self):
        return "%s / %s" % (self.name_de, self.name_en)


def pkgen():
    return "%04d" % randint(1000,9999)


class LocationUsage(models.Model):
    name = models.CharField(_("Bezeichnung"), max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Raumnutzungsart")
        verbose_name_plural = _("Raumnutzungsarten")


class BookingMethod(models.Model):
    name = models.CharField(_("Bezeichnung"), max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Buchungsmethode")
        verbose_name_plural = _("Buchungsmethoden")

# Checkin-App Model (2021-03-03)
# class Location(MPTTModel):
#     code = models.CharField(_("Raumcode"), max_length=4, unique=True, default=pkgen)
#     parent = TreeForeignKey('self', verbose_name=_('Teil von'), on_delete=models.CASCADE, null=True, blank=True, related_name='children', default=3)
#     org_number = models.CharField(_("Raumnummer"), max_length=24, blank=True, help_text=_("Speicher XI: X.XX.XXX / Dechanatstraße: K.XX"))
#     org_name = models.CharField(_("Raumname / Standort"), max_length=255)
#     org_alternative_name = ArrayField(models.CharField(max_length=255), verbose_name=_("Alternative Bezeichnungen"), blank=True, null=True)
#     org_responsible = models.CharField(_("Raumverantwortliche(r)"), max_length=255, blank=True, null=True)
#     org_size = models.DecimalField(verbose_name=_("Größe"), help_text=_("in Quadratmetern"), max_digits=8, decimal_places=2, blank=True, null=True)
#     org_floor_number = models.IntegerField(verbose_name=_("Etage"), help_text=_("-1: Keller, 0: Erdgeschoss, 1: Erste Etage, usw."), blank=True, null=True)
#     org_comment = models.TextField(verbose_name=_("Anmerkungen"), blank=True, null=True)
#     org_usage = models.ManyToManyField(LocationUsage, verbose_name=_("Nutzungsarten"), blank=True)
#     org_capacity_comment = models.TextField(_("Bemerkung zur Nutzung / Kapazität"), blank=True, null=True)
#     org_bookable = models.BooleanField(_("Buchbar / Reservierbar"))
#     org_book_via = models.ForeignKey(BookingMethod, verbose_name=_("Buchung via"), on_delete=models.SET_NULL, null=True, blank=True)
#     org_activities = models.ManyToManyField(ActivityProfile, through='CapacityForActivityProfile', verbose_name=_("Aktivitätsprofile und Kapazitäten"))
#     updated_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))
#     hide_load = models.BooleanField(verbose_name=_("Checkins verstecken"), default=False)
#     removed = models.BooleanField(verbose_name=_("Entfernt"), default=False, help_text=_("Diese Raum ist deaktiviert oder entfernt. Eine Löschung ist jedoch noch nicht möglich, weil noch Checkins am Raum hängen. (Soft-Delete)"))
#     # history = is registered via register_history (see below)


class LocationQuerySet(models.QuerySet):
    def prefetch_activities(self):
        return self.prefetch_related(
        Prefetch(
            'org_activities',
            queryset=CapacityForActivityProfile.objects.select_related(
                'profile',
            ),
        ),
    )


class LocationManager(models.Manager.from_queryset(LocationQuerySet)):
    def get_queryset(self):
        return super(LocationManager, self).get_queryset() \
            .prefetch_activities() \
            .prefetch_related(Prefetch('resource', queryset=Resource.objects.annotate_capacity_calculation()))
            #.select_related('resource')


# Getin/Checkin-App Model
class Location(MPTTModel):
    # FIXME resource needs to be OneToOne (or inheritance)
    resource = models.OneToOneField(Resource, verbose_name=_("Resource"), on_delete=models.PROTECT, null=True, blank=True, related_name='checkinlocation')
    code = models.CharField(_("Raumcode"), max_length=4, unique=True, default=pkgen)
    parent = TreeForeignKey('self', verbose_name=_('Teil von'), on_delete=models.CASCADE, null=True, blank=True, related_name='children', default=3)
    _number = models.CharField(_("Subtitle / No."), max_length=24, blank=True, help_text=_("Used if not attached to resource."))
    _name = models.CharField(_("Title"), max_length=255, help_text=_("Used if not attached to resource."))
    # org_responsible = models.CharField(_("Raumverantwortliche(r)"), max_length=255, blank=True, null=True)
    # org_size = models.DecimalField(verbose_name=_("Größe"), help_text=_("in Quadratmetern"), max_digits=8, decimal_places=2, blank=True, null=True)
    # org_comment = models.TextField(verbose_name=_("Anmerkungen"), blank=True, null=True)
    # org_usage = models.ManyToManyField(LocationUsage, verbose_name=_("Nutzungsarten"), blank=True)
    # org_capacity_comment = models.TextField(_("Bemerkung zur Nutzung / Kapazität"), blank=True, null=True)
    # org_bookable = models.BooleanField(_("Buchbar / Reservierbar"))
    # org_book_via = models.ForeignKey(BookingMethod, verbose_name=_("Buchung via"), on_delete=models.SET_NULL, null=True, blank=True)
    org_activities = models.ManyToManyField(ActivityProfile, through='CapacityForActivityProfile', verbose_name=_("Aktivitätsprofile und Kapazitäten"))
    updated_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))
    hide_load = models.BooleanField(verbose_name=_("Anzahl der Anwesenden verstecken"), default=False, help_text=_("Anzahl der aktuell eingecheckten Personen den Nutzern nicht anzeigen. z.B. für Gebäude etc."))
    removed = models.BooleanField(verbose_name=_("Entfernt"), default=False, help_text=_("Diese Checkin-Standort ist deaktiviert oder entfernt. Eine Löschung ist jedoch noch nicht möglich, weil noch Checkins am Raum hängen. (Soft-Delete)"))
    # history = is registered via register_history (see below)

    # random name for data migration from v1 to v2 only
    random_name = property(lambda self: ''.join(random.choices(string.ascii_uppercase + string.digits, k=10)))

    display_numbers = property(lambda self: self.resource.display_numbers if self.resource else None)
    display_numbers.fget.short_description = _('Numbers')
    number = property(lambda self: self.resource.display_numbers if self.resource else getattr(self, '_number', None))
    org_number = property(lambda self: self.resource.display_numbers if self.resource else getattr(self, '_number', None))
    name = property(lambda self: self.resource.name if self.resource else getattr(self, '_name', self.random_name))
    org_name = property(lambda self: self.resource.name if self.resource else getattr(self, '_name', self.random_name))
    org_responsible = property(lambda self: self.resource.get_reservation_delegates() if self.resource else None)
    org_size = property(lambda self: self.resource.area if self.resource else None)
    area = property(lambda self: self.resource.area if self.resource else None)

    # FIXME order_insertion_by on FK
    # class MPTTMeta:
    #     order_insertion_by = ['org_numbers']

    objects = LocationManager()

    class Meta:
        verbose_name = _("Checkin-Standort")
        verbose_name_plural = _("Checkin-Standorte")
        permissions = [
            ("can_print_location", _("Kann PDF-Raumausweise erstellen")),
            ("can_display_location_loads", _("Kann aktuelle aktuelle Checkins anzeigen")),
        ]

    def load(self):
        if self.hide_load:
            return -1
        return self.load_descendants()
        #return Checkin.objects.filter(location=self).not_older_then(LOAD_LOOKBACK_TIME).active().count()
    load.short_description = _('# jetzt')

    def load_user_generated(self):
        if self.hide_load:
            return -1
        locations = self.get_descendants(include_self=True)
        return Checkin.objects.filter(location__in=locations).order_by('profile','time_entered').distinct('profile').not_older_then(LOAD_LOOKBACK_TIME).only_user_generated().active().count()
    load_user_generated.short_description = _('# jetzt (selbstdok.)')

    def load_descendants(self):
        locations = self.get_descendants(include_self=True)
        return Checkin.objects.filter(location__in=locations).order_by('profile','time_entered').distinct('profile').not_older_then(LOAD_LOOKBACK_TIME).active().count()
    load_descendants.short_description = _('# jetzt (kumuliert)')

    def real_load(self):
        return Checkin.objects.filter(location=self).order_by('profile','time_entered').distinct('profile').active().count()
    real_load.short_description = _('# jetzt')

    def checkins_sum(self):
        return Checkin.objects.filter(location=self).order_by('profile','time_entered').distinct('profile').count()
    checkins_sum.short_description = _('# Summe')
    #checkins_sum.admin_order_field = Count()

    @property
    def current_checkins(self):
        return Checkin.objects.filter(location=self)

    @property
    def capacity(self):
        if self.resource:
            # use resource.capacity if existing
            return self.resource.people_capacity
        activities = self.capacityforactivityprofile_set.all()
        if activities:
            max_capacity = max([act.capacity for act in activities])
            return max_capacity
        return None
    capacity.fget.short_description = _('Max. Kapazität')

    @property
    def capacities(self):
        activities = self.capacityforactivityprofile_set.all()
        return activities

    def get_local_display_name(self):
        name = "%s" % self.name
        if self.number:
            name += " (%s)" % self.number
        return name

    def __str__(self):
        if self.resource:
            return "%s / %s" % (self.code, self.resource.display_name,)
        local_name = self.get_local_display_name().strip()
        if len(local_name) > 1:
            return "%s / %s" % (self.code, local_name,)
        return "%s" % (self.code,)

    # def get_absolute_url(self):
    #     return reverse('pdf-view', kwargs={'pk': self.pk }) + "?as=html"

    def get_checkin_url(self):
        return reverse('location-checkin', kwargs={'code': self.code})


# registering history instead of using HistoricalRecords() on Location model
# reason: HistoricalRecords() is not compatible with MPTT
# see: https://github.com/jazzband/django-simple-history/issues/87
# register_history(Location)


class CapacityForActivityProfile(models.Model):
    profile = models.ForeignKey(ActivityProfile, on_delete=models.CASCADE, verbose_name=_("Profil"))
    location = models.ForeignKey(Location, on_delete=models.CASCADE, verbose_name=_("Standort"))
    capacity = models.PositiveIntegerField(_("Maximalkapazität"))
    comment_de = models.CharField(_("Zusatz DE"), max_length=40, blank=True, null=True)
    comment_en = models.CharField(_("Zusatz EN"), max_length=40, blank=True, null=True)

    class Meta:
        verbose_name = _("Aktivitätsprofil und Kapzitäten")
        verbose_name_plural = _("Aktivitätsprofile und Kapzitäten")

    def __str__(self):
        return "%s / %s" % (self.profile.name_de, self.profile.name_en)


class CheckinQuerySet(models.QuerySet):
    def active(self):
        return self.filter(time_left=None).filter(time_entered__gte=timezone.now()-CHECKIN_LIFETIME)

    def not_older_then(self, oldest=LOAD_LOOKBACK_TIME):
        return self.filter(time_entered__gte=timezone.now()-oldest)

    def older_then(self, timedelta=LOAD_LOOKBACK_TIME):
        return self.filter(time_entered__lt=timezone.now()-timedelta)

    def checkins_for_profile_at_location(self, profile, location):
        return self.order_by('-time_entered').filter(profile=profile, location=location)

    def last_checkin_for_profile_at_location(self, profile, location):
        return self.checkins_for_profile_at_location(profile, location)[:1]

    def get_last_checkin_for_profile_at_location_if_active(self, profile, location):
        checkin = self.checkins_for_profile_at_location(profile, location)[:1].get()
        if checkin.is_active():
            return checkin
        else:
            raise Checkin.DoesNotExist

    def checkin(self, profile, location, origin, time=None, include_ancestors=True):
        """
        Like Djangos default get_or_create()
        Looks up existing checkin or creates a new one.
        Return a tuple of (object, created), where created is a boolean
        specifying whether an object was created.
        """
        if not time:
            time = timezone.now()

        try:
            checkin = self.get_last_checkin_for_profile_at_location_if_active(location=location, profile=profile)
            if checkin:
                return checkin, False
        except Checkin.DoesNotExist:
            # no (active) checkin here yet
            pass

        if include_ancestors:
            ancestors = location.get_ancestors(include_self=False)
            ancestor_checkins = []
            for ancestor in ancestors:
                ancestor_checkin, new = self.checkin(profile, ancestor, origin=Origin.PARENT_CHECKIN, time=time, include_ancestors=False)
                ancestor_checkins.append(ancestor_checkin)

        return self.create(profile=profile, location=location, origin_entered=origin, time_entered=time), True

    def checkout(self, profile, location, origin, time=None, include_descendants=True, for_checkin=None):
        """
        Like Djangos default get_or_create()
        Looks up existing checkout or creates a new one (updates last checkin).
        Return a tuple of (object, created), where created is a boolean
        specifying whether an object was created.
        """
        if not time:
            time = timezone.now()

        if not for_checkin:
            checkin = self.get_last_checkin_for_profile_at_location_if_active(location=location, profile=profile)
        else:
            # if a checkin is passed (optionally) we will try to checkout this one instead.
            checkin = for_checkin
            profile = checkin.profile
            location = checkin.location

        if not checkin.is_active():
            # Checkout already exists. Return existing checkout.
            checkout = checkin
            return checkout, False
            # else: checkin exits but is not checkout out yet. continue...

        if include_descendants:
            descendants = location.get_descendants(include_self=False)
            descendant_checkins = []
            for descendant in descendants:
                try:
                    descendant_checkin, new = self.checkout(profile, descendant, origin=Origin.PARENT_CHECKOUT, time=time, include_descendants=False)
                    descendant_checkins.append(descendant_checkin)
                except Checkin.DoesNotExist:
                    # trying to checkout a descendant, which is not checked in
                    pass

        checkin.time_left = time
        checkin.origin_left = origin
        checkin.save()

        return checkin, True

    def only_user_generated(self):
        exclude_types = (Origin.ADMIN_MANUAL, Origin.FRONTDESK_MANUAL, Origin.IMPORT)
        return self.exclude(origin_entered__in=exclude_types).exclude(origin_left__in=exclude_types)


class LimitedCheckinManager(models.Manager):

    def get_queryset(self):
        now = timezone.now()
        lookback_start = now - CHECKIN_RETENTION_TIME - CHECKIN_LIFETIME
        qs = CheckinQuerySet(self.model, using=self._db)
        qs = qs.filter(time_entered__gte=lookback_start)
        return qs


class LimitedPaperLogManager(models.Manager):

    def get_queryset(self):
        now = timezone.now()
        lookback_start = now - CHECKIN_RETENTION_TIME - CHECKIN_LIFETIME
        qs = CheckinQuerySet(self.model, using=self._db)
        qs = qs.filter(date__gte=lookback_start)
        return qs


class PaperLogQuerySet(models.QuerySet):

    def not_older_then(self, oldest=LOAD_LOOKBACK_TIME):
        return self.filter(date__gte=timezone.now()-oldest)

    def older_then(self, timedelta=LOAD_LOOKBACK_TIME):
        return self.filter(date__lt=timezone.now()-timedelta)


class Origin(models.TextChoices):
    QR_SCAN = 'QR_SCAN', _("Scan eines QR-Codes")
    USER_MANUAL = 'USER_MANUAL', _("Manuelle Eingabe durch Nutzer")
    ADMIN_MANUAL = 'ADMIN_MANUAL', _("Manuelle Eingabe durch Betreiber")
    FRONTDESK_MANUAL = 'FRONTDESK_MANUAL', _("Manuelle Eingabe durch Empfangspersonal")
    FOREIGN_SCAN = 'FOREIGN_SCAN', _("Scan eines QR-Codes durch andere Person")
    PARENT_CHECKIN = 'PARENT_CHECKIN', _("Checkin durch untergeordnetes Objekt")
    PARENT_CHECKOUT = 'PARENT_CHECKOUT', _("Checkout durch übergeordnetes Objekt")
    IMPORT = 'IMPORT'


class Checkin(models.Model):
    profile = models.ForeignKey(Profile, verbose_name=_("Userprofile"), on_delete=models.PROTECT, null=True)
    location = models.ForeignKey(Location, verbose_name=_("Standort"), on_delete=models.PROTECT, null=True)
    time_entered = models.DateTimeField(_("Eingang"))
    time_left = models.DateTimeField(_("Ausgang"), blank=True, null=True)
    # created_at = models.DateTimeField(auto_now_add=True)
    origin_entered = models.CharField(_("Datenquelle Eingang"), choices=Origin.choices, blank=True, null=True, max_length=100)
    origin_left = models.CharField(_("Datenquelle Ausgang"), choices=Origin.choices, blank=True, null=True, max_length=100)

    attendance = models.ForeignKey('resources.Attendance', null=True, on_delete=models.SET_NULL, blank=True)

    # NOTICE: the order of managers is important
    all = CheckinQuerySet.as_manager() # this needs to come first, so the manger uses is not LimitedCheckinManager.
    objects = LimitedCheckinManager().from_queryset(CheckinQuerySet)()
    default_manager = objects

    class Meta:
        verbose_name = _("Checkin")
        ordering = ('-time_entered',)
        constraints = [
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_origins_valid",
                check=models.Q(origin_entered__in=Origin.values) & models.Q(origin_left__in=Origin.values),
            )
        ]
        permissions = [
            ("can_evaluate_case", _("Kann Nachverfolgung durchführen")),
        ]

    def __str__(self):
        return "Checkin in %s" % (self.location)

    # @property
    # def profile_id(self):
    #     if self.profile:
    #         return self.profile.pk
    #     return None

    def is_checked_out(self):
        return bool(self.time_left)

    def is_active(self):
        return (not self.time_left) and (self.time_entered >= timezone.now()-CHECKIN_LIFETIME)

    def checkout(self, origin=None, include_descendants=True):
        return self.__class__.objects.checkout(location=self.location, profile=self.profile, origin=origin, for_checkin=self, include_descendants=include_descendants)

    def save(self, *args, **kwargs):
        if self.time_entered is None:
            self.time_entered = timezone.now()
        super().save(*args, **kwargs)

    # def save(self, ignore_double=False, include_ancestors=True, *args, **kwargs):
    #     if not ignore_double:
    #         already_made_checkin = self.__class__.objects.active().last_checkin_for_profile_at_location(
    #             location=self.location, profile=self.profile)
    #         if already_made_checkin.count() > 0:
    #             raise ValidationError(_("Mehrfache Checkins am gleichen Ort sind nicht möglich."))
    #     return super(Checkin, self).save(*args, **kwargs)


class PaperLog(models.Model):
    profile = models.ForeignKey(Profile, verbose_name=_("Userprofile"), on_delete=models.PROTECT, null=True)
    first_name = models.CharField(verbose_name=_("Vorname"), max_length=255, blank=True)
    last_name = models.CharField(verbose_name=_("Nachname"), max_length=255, blank=True)
    # TODO add email (is currently not on paper form)
    # email = models.CharField(verbose_name=_("Telefonnummer"), max_length=20, blank=True)
    phone = models.CharField(verbose_name=_("Telefonnummer"), max_length=20, blank=True)
    student_number = models.CharField(verbose_name=_("Matrikelnummer"), max_length=20, blank=True)
    date = models.DateField(verbose_name=_("Datum"), help_text=_("Ohne Datum ist die Eingabe und Kontaktnachverfolgung nicht möglich. Bitte stellen Sie anderweitig Nachforschungen an, falls das Datum fehlt oder unlesbar ist, und wiederholen Sie dann die Eingabe.<br/>Alle Zeitangaben werden in Ihrer Zeitzone (%(timezone)s) interpretiert.") % {'timezone': timezone.get_current_timezone()})
    signed = models.BooleanField(verbose_name=_("Unterschrift vorhanden"))
    created_at = models.DateTimeField(auto_now_add=True, editable=False, verbose_name=_("Eingegeben am"))
    comment = models.TextField(_("Eingabekommentar"), blank=True, null=True, help_text=_("Nutzen die dieses Feld für alle weiteren Bemerkugen zum vorliegenden Papierprotokoll oder zu Ihrer Eingabe."))

    class Meta:
        verbose_name = _("Papierprotokoll")
        verbose_name_plural = _("Papierprotokolle")

    # NOTICE: the order of managers is important
    all = PaperLogQuerySet.as_manager()  # this needs to come first, so the manger uses is not LimitedPaperLogManager.
    objects = LimitedPaperLogManager().from_queryset(PaperLogQuerySet)()
    default_manager = objects

    def __str__(self):
        return ugettext("Besuchsdokumentation von %s am %s" % (self.profile.get_full_name(), self.date))

    def __repr__(self):
        type_ = type(self)
        module = type_.__module__
        qualname = type_.__qualname__
        return f"<{module}.{qualname} object at {hex(id(self))}>"


class PaperCheckin(Checkin):
    log = models.ForeignKey(PaperLog, editable=False, on_delete=models.CASCADE)
    location_comment = models.CharField(verbose_name=_("persönliche Referenz"), max_length=255, blank=True)
    entered_after_midnight = models.BooleanField(verbose_name=_("Eingang nach 23:59 (Folgetag)"), blank=True)
    left_after_midnight = models.BooleanField(verbose_name=_("Ausgang nach 23:59 (Folgetag)"), blank=True)

    # prevent old checkins to be inaccessible (filtered out) on the form
    objects = CheckinQuerySet.as_manager()

    class Meta:
        verbose_name = _("Aufenthalt (per Papierprotokoll)")
        verbose_name_plural = _("Aufenthalte (per Papierprotokoll)")
        ordering = ('pk',)

