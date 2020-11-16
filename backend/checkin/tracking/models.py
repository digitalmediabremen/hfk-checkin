from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django.utils.translation import gettext_lazy as _
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

CHECKIN_RETENTION_TIME = timedelta(weeks=3)
CHECKIN_LIFETIME = timedelta(hours=24)
LOAD_LOOKBACK_TIME = CHECKIN_LIFETIME

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, editable=False)
    first_name = models.CharField(_("Vorname"), max_length=1000)
    last_name = models.CharField(_("Nachname"), max_length=1000)
    phone_regex = RegexValidator(regex=r'^\+?1?[\d ()]{9,15}$',
                                 message=_("Die Telefonnummer benötigt das Format +(XX) XXXXXXXXXXX."))
    phone = models.CharField(_("Telefonnummer"), validators=[phone_regex], max_length=20, blank=True, null=True) # validators should be a list
    email = models.EmailField(_("E-Mail Adresse"), blank=True, null=True)
    verified = models.BooleanField(_("Identität geprüft"),blank=True, null=True, default=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))
    created_at = models.DateTimeField(auto_now_add=True, editable=False, verbose_name=_("Registrierung"))
    # last_checkin = models.DateTimeField(_("Zuletzt Eingecheckt"), blank=True, null=True)
    history = HistoricalRecords()

    def __str__(self):
        return _("Person mit Profil-ID %i") % (self.id, )

    def get_full_name(self):
        return _("%s %s") % (self.first_name, self.last_name)

    def get_full_profile(self):
        return _("%s %s (P: %s / E: %s)") % (self.first_name, self.last_name, self.phone, self.email)

    @property
    def complete(self):
        return (bool(self.first_name) and bool(self.last_name) and bool(self.phone))

    class Meta:
        verbose_name = _("Person")
        verbose_name_plural = _("Personen")

    @property
    def last_checkins(self):
        return Checkin.objects.filter(profile=self)[:10]


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    """ Update profile on every save or if user is created."""
    # if created:
    if not instance.first_name or not instance.last_name or not instance.email:
        return
    profile, new = Profile.objects.get_or_create(user=instance)
    profile.first_name = instance.first_name
    profile.last_name = instance.last_name
    profile.email = instance.email
    profile.verified = True
    profile.save()


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


class Location(MPTTModel):
    code = models.CharField(_("Raumcode"), max_length=4, unique=True, default=pkgen)
    parent = TreeForeignKey('self', verbose_name=_('Teil von'), on_delete=models.CASCADE, null=True, blank=True, related_name='children', default=3)
    org_number = models.CharField(_("Raumnummer"), max_length=24, blank=True, help_text=_("Speicher XI: X.XX.XXX / Dechanatstraße: K.XX"))
    org_name = models.CharField(_("Raumname / Standort"), max_length=255)
    org_responsible = models.CharField(_("Raumverantwortliche(r)"), max_length=255, blank=True, null=True)
    org_size = models.DecimalField(verbose_name=_("Größe"), help_text=_("in Quadratmetern"), max_digits=8, decimal_places=2, blank=True, null=True)
    org_comment = models.TextField(verbose_name=_("Anmerkungen"), blank=True, null=True)
    org_usage = models.ManyToManyField(LocationUsage, verbose_name=_("Nutzungsarten"), blank=True)
    org_capacity_comment = models.TextField(_("Bemerkung zur Nutzung / Kapazität"), blank=True, null=True)
    org_bookable = models.BooleanField(_("Buchbar / Reservierbar"))
    org_book_via = models.ForeignKey(BookingMethod, verbose_name=_("Buchung via"), on_delete=models.SET_NULL, null=True, blank=True)
    org_activities = models.ManyToManyField(ActivityProfile, through='CapacityForActivityProfile', verbose_name=_("Aktivitätsprofile und Kapazitäten"))
    updated_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))
    hide_load = models.BooleanField(verbose_name=_("Checkins verstecken"), default=False)
    removed = models.BooleanField(verbose_name=_("Entfernt"), default=False, help_text=_("Diese Raum ist deaktiviert oder entfernt. Eine Löschung ist jedoch noch nicht möglich, weil noch Checkins am Raum hängen. (Soft-Delete)"))
    # history = is registered via register_history (see below)

    class MPTTMeta:
        order_insertion_by = ['org_number']

    class Meta:
        verbose_name = _("Raum / Standort")
        verbose_name_plural = _("Räume / Standorte")
        permissions = [
            ("can_print_location", _("Kann PDF-Raumausweise erstellen.")),
            ("can_display_location_loads", _("Kann aktuelle aktuelle Checkins anzeigen.")),
        ]

    def load(self):
        if self.hide_load:
            return -1
        return self.load_descendants()
        #return Checkin.objects.filter(location=self).not_older_then(LOAD_LOOKBACK_TIME).active().count()
    load.short_description = _('# jetzt')

    def load_descendants(self):
        locations = self.get_descendants(include_self=True)
        # only works in postgres: .distinct('profile')
        # not_older_then(LOAD_LOOKBACK_TIME).active()
        return Checkin.objects.filter(location__in=locations).not_older_then(LOAD_LOOKBACK_TIME).active().count()
    load_descendants.short_description = _('# jetzt (kumuliert)')

    def real_load(self):
        return Checkin.objects.filter(location=self).active().count()
    real_load.short_description = _('# jetzt')

    def checkins_sum(self):
        return Checkin.objects.filter(location=self).count()
    checkins_sum.short_description = _('# Summe')
    #checkins_sum.admin_order_field = Count()

    @property
    def current_checkins(self):
        return Checkin.objects.filter(location=self)

    @property
    def capacity(self):
        activities = self.org_activities.through.objects.filter(location=self).all()
        if activities:
            max_capacity = max([act.capacity for act in activities])
            return max_capacity
        return None
    capacity.fget.short_description = _('Kapazität')

    @property
    def capacities(self):
        activities = self.org_activities.through.objects.filter(location=self).all()
        return activities

    def __str__(self):
        if self.org_number:
            return "%s (%s)" % (self.org_name, self.org_number)
        else:
            return "%s" % (self.org_name,)

    # def get_absolute_url(self):
    #     return reverse('pdf-view', kwargs={'pk': self.pk }) + "?as=html"

    def get_checkin_url(self):
        return reverse('location-checkin', kwargs={'code': self.code})


# registering history instead of using HistoricalRecords() on Location model
# reason: HistoricalRecords() is not compatible with MPTT
# see: https://github.com/jazzband/django-simple-history/issues/87
register_history(Location)


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


class LimitedCheckinManager(models.Manager):

    def get_queryset(self):
        now = timezone.now()
        lookback_start = now - CHECKIN_RETENTION_TIME - CHECKIN_LIFETIME
        qs = CheckinQuerySet(self.model, using=self._db)
        qs = qs.filter(time_entered__gte=lookback_start)
        return qs


class Origin(models.TextChoices):
    QR_SCAN = 'QR_SCAN', _("Scan eines QR-Codes")
    USER_MANUAL = 'USER_MANUAL', _("Manuelle Eingabe durch Nutzer")
    ADMIN_MANUAL = 'ADMIN_MANUAL', _("Manuelle Eingabe durch Betreiber")
    FOREIGN_SCAN = 'FOREIGN_SCAN', _("Scan eines QR-Codes durch andere Person")
    PARENT_CHECKIN = 'PARENT_CHECKIN', _("Checkin durch untergeordnetes Objekt")
    PARENT_CHECKOUT = 'PARENT_CHECKOUT', _("Checkout durch übergeordnetes Objekt")
    IMPORT = 'IMPORT'


class Checkin(models.Model):
    profile = models.ForeignKey(Profile, verbose_name=_("Person"), on_delete=models.PROTECT, null=True)
    location = models.ForeignKey(Location, verbose_name=_("Standort"), on_delete=models.PROTECT, null=True)
    time_entered = models.DateTimeField(_("Checkin"), auto_now_add=True)
    time_left = models.DateTimeField(_("Checkout"), blank=True, null=True)
    # created_at = models.DateTimeField(auto_now_add=True)
    origin_entered = models.CharField(_("Datenquelle Checkin"), choices=Origin.choices, blank=True, null=True, max_length=100)
    origin_left = models.CharField(_("Datenquelle Checkout"), choices=Origin.choices, blank=True, null=True, max_length=100)

    objects = LimitedCheckinManager().from_queryset(CheckinQuerySet)()
    # objects = CheckinQuerySet.as_manager()
    all = CheckinQuerySet.as_manager()

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
            ("can_evaluate_case", _("Kann Nachverfolgung durchführen.")),
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

    def checkout(self, origin=None):
        return self.__class__.objects.checkout(location=self.location, profile=self.profile, origin=origin, for_checkin=self)

    # def save(self, ignore_double=False, include_ancestors=True, *args, **kwargs):
    #     if not ignore_double:
    #         already_made_checkin = self.__class__.objects.active().last_checkin_for_profile_at_location(
    #             location=self.location, profile=self.profile)
    #         if already_made_checkin.count() > 0:
    #             raise ValidationError(_("Mehrfache Checkins am gleichen Ort sind nicht möglich."))
    #     return super(Checkin, self).save(*args, **kwargs)