from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django.utils.translation import gettext as _
from random import randint
from django.urls import reverse
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext as _
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import timedelta
from django.core.exceptions import ValidationError

LOAD_LOOKBACK_TIME = timedelta(hours=24)


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, editable=False)
    first_name = models.CharField(_("Vorname"), max_length=255)
    last_name = models.CharField(_("Nachname"), max_length=255)
    phone_regex = RegexValidator(regex=r'^\+?1?[\d ()]{9,15}$',
                                 message=_("Die Telefonnummer benötigt das Format +(XX) XXXXXXXXXXX."))
    phone = models.CharField(_("Telefonnummer"), validators=[phone_regex], max_length=20, blank=True, null=True) # validators should be a list
    email = models.EmailField(_("E-Mail Adresse"), blank=True, null=True)
    verified = models.BooleanField(_("Identität geprüft"),blank=True, null=True, default=False)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # last_checkin = models.DateTimeField(_("Zuletzt Eingecheckt"), blank=True, null=True)

    def __str__(self):
        return "%s %s" % (self.first_name, self.last_name)

    @property
    def complete(self):
        return (bool(self.first_name) and bool(self.last_name) and bool(self.phone))

    class Meta:
        verbose_name = _("Person")
        verbose_name_plural = _("Personen")

    @property
    def last_checkins(self):
        return Checkin.objects.filter(profile=self)[:5]


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
    parent = TreeForeignKey('self', verbose_name=_('Teil von'), on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    org_number = models.CharField(_("Raumnummer"), max_length=30, blank=True, help_text=_("Speicher XI: X.XX.XXX / Dechanatstraße: K.XX"))
    org_name = models.CharField(_("Raumname / Standort"), max_length=255)
    org_responsible = models.CharField(_("Raumverantwortliche(r)"), max_length=255, blank=True, null=True)
    org_size = models.DecimalField(verbose_name=_("Größe in Quadratmetern"), max_digits=8, decimal_places=2, blank=True, null=True)
    org_comment = models.TextField(verbose_name=_("Anmerkungen"), blank=True, null=True)
    org_usage = models.ManyToManyField(LocationUsage, verbose_name=_("Nutzungsarten"), blank=True)
    org_capacity_comment = models.TextField(_("Bemerkung zur Nutzung / Kapazität"), blank=True, null=True)
    org_bookable = models.BooleanField(_("Buchbar / Reservierbar"))
    org_book_via = models.ForeignKey(BookingMethod, verbose_name=_("Buchung via"), on_delete=models.SET_NULL, null=True, blank=True)
    org_activities = models.ManyToManyField(ActivityProfile, through='CapacityForActivityProfile', verbose_name=_("Aktivitätsprofile und Kapazitäten"))
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class MPTTMeta:
        order_insertion_by = ['org_number']

    class Meta:
        verbose_name = _("Raum / Standort")
        verbose_name_plural = _("Räume / Standorte")

    def load(self):
        return Checkin.objects.filter(location=self).not_older_then(LOAD_LOOKBACK_TIME).active().count()

    def load_descendants(self):
        locations = self.get_descendants(include_self=True)
        # only works in postgres: .distinct('profile')
        return Checkin.objects.filter(location__in=locations).not_older_then(LOAD_LOOKBACK_TIME).active().count()

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
        return self.filter(time_left=None)

    def not_older_then(self, oldest=LOAD_LOOKBACK_TIME):
        return self.filter(time_entered__lte=timezone.now()-oldest)

    def last_checkin_for_profile_at_location(self, profile, location):
        return self.order_by('-time_entered').filter(profile=profile, location=location)[:1]

    def checkin_or_return(self, profile, location, origin):
        """
        Like get_or_create()
        Looks up existing checkin or creates a new one.
        Return a tuple of (object, created), where created is a boolean
        specifying whether an object was created.
        """
        already_made_checkin = self.active().last_checkin_for_profile_at_location(location=location, profile=profile)
        if already_made_checkin.count() > 0:
            return already_made_checkin.get(), False
        return self.create(profile=profile, location=location, origin_entered=origin), True


class Checkin(models.Model):
    QR_SCAN = 'QR_SCAN'
    USER_MANUAL = 'USER_MANUAL'
    ADMIN_MANUAL = 'ADMIN_MANUAL'
    FOREIGN_SCAN = 'FOREIGN_SCAN'
    PARENT_CHECKOUT = 'PARENT_CHECKOUT'
    IMPORT = 'IMPORT'

    CHECKIN_ORIGINS = [
        ('QR_SCAN', _("Scan eines QR-Codes")),
        ('USER_MANUAL', _("Manuelle Eingabe durch Nutzer")),
        ('ADMIN_MANUAL', _("Manuelle Eingabe durch Betreiber")),
        ('FOREIGN_SCAN', _("Scan eines QR-Codes durch andere Person")),
        ('PARENT_CHECKOUT', _("Checkout durch übergeordnetes Objekt")),
        ('IMPORT', _("Datenimport")),
    ]

    profile = models.ForeignKey(Profile, verbose_name=_("Person"), on_delete=models.PROTECT)
    location = models.ForeignKey(Location, verbose_name=_("Standort"), on_delete=models.PROTECT)
    time_entered = models.DateTimeField(_("Checkin"), auto_now=True)
    time_left = models.DateTimeField(_("Checkout"), blank=True, null=True)
    # created_at = models.DateTimeField(auto_now_add=True)
    origin_entered = models.CharField(_("Datenquelle Checkin"), choices=CHECKIN_ORIGINS, blank=True, null=True, max_length=100)
    origin_left = models.CharField(_("Datenquelle Checkout"), choices=CHECKIN_ORIGINS, blank=True, null=True, max_length=100)

    objects = CheckinQuerySet.as_manager()

    class Meta:
        verbose_name = _("Checkin")
        ordering = ('-time_entered',)

    def __str__(self):
        return "Checkin in %s" % (self.location)

    # @property
    # def profile_id(self):
    #     if self.profile:
    #         return self.profile.pk
    #     return None

    def checkout(self, origin=None, include_descendants=True):
        if self.is_active():
            self.time_left = timezone.now()
            self.origin_left = origin
            if include_descendants:
                locations = self.location.get_descendants(include_self=False)
                descendant_checkins = self.__class__.objects.active().filter(location__in=locations).filter(profile=self.profile)
                descendant_checkins.update(time_left=self.time_left, origin_left=Checkin.PARENT_CHECKOUT)
            self.save(ignore_double=True)

    def is_active(self):
        return not self.time_left

    def save(self, ignore_double=False, *args, **kwargs):
        if not ignore_double:
            already_made_checkin = self.__class__.objects.active().last_checkin_for_profile_at_location(location=self.location, profile=self.profile)
            if already_made_checkin.count() > 0:
                raise ValidationError(_("Mehrfache Checkins am gleichen Ort sind nicht möglich."))
        return super(Checkin, self).save(*args, **kwargs)
