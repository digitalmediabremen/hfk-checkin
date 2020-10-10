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

LOAD_LOOKBACK_TIME = timedelta(hours=24)


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, editable=False)
    first_name = models.CharField(_("Vorname"), max_length=255)
    last_name = models.CharField(_("Nachname"), max_length=255)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$',
                                 message=_("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."))
    phone = models.CharField(_("Telefonnummer"), validators=[phone_regex], max_length=17, blank=True) # validators should be a list
    email = models.EmailField(_("E-Mail Adresse"), blank=True)
    verified = models.BooleanField(_("Identität geprüft"),blank=True, null=True, default=False)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_checkin = models.DateTimeField(_("Zuletzt Eingecheckt"), blank=True, null=True)

    def __str__(self):
        return "%s %s" % (self.first_name, self.last_name)

    def complete(self):
        return bool(self.first_name and self.last_name and self.phone and self.email)

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


def pkgen():
    return "%04d" % randint(1000,9999)

class Location(MPTTModel):
    code = models.CharField(_("Raumcode"), max_length=4, unique=True, default=pkgen)
    org_number = models.CharField(_("Raumnummer"), max_length=30, blank=True, help_text=_("Speicher XI: X.XX.XXX / Dechanatstraße: K.XX"))
    org_name = models.CharField(_("Raumname / Standort"), max_length=255, blank=True)
    capacity = models.IntegerField(_("Maximalkapazität"), blank=True, null=True)
    parent = TreeForeignKey('self', verbose_name=_('Teil von'), on_delete=models.CASCADE, null=True, blank=True, related_name='children')

    class MPTTMeta:
        order_insertion_by = ['org_name']

    class Meta:
        verbose_name = _("Raum / Standort")
        verbose_name_plural = _("Räume / Standorte")

    def load(self):
        return Checkin.objects.filter(location=self,time_entered__lte=timezone.now()-LOAD_LOOKBACK_TIME, time_left=None).count()

    def load_descendants(self):
        locations = self.get_descendants(include_self=True)
        return Checkin.objects.filter(location__in=locations,time_entered__lte=timezone.now()-LOAD_LOOKBACK_TIME, time_left=None).distinct('profile').count()

    def __str__(self):
        return "%s (%s)" % (self.org_name, self.org_number)

    def get_absolute_url(self):
        return reverse('pdf-view', kwargs={'pk': self.pk }) + "?as=html"

    def get_checkin_url(self):
        return reverse('location-checkin', kwargs={'code': self.code})


class Checkin(models.Model):

    CHECKIN_ORIGINS = [
        ('QR_SCAN', "Scan eines QR-Codes",),
        ('USER_MANUAL', "Manuelle Eingabe durch Nutzer",),
        ('ADMIN_MANUAL', "Manuelle Eingabe durch Betreiber",),
        ('FOREIGN_SCAN', "Scan eines QR-Codes durch andere Person",),
        ('PARENT_CHECKOUT', "Checkout durch übergeordnetes Objekt",),
        ('IMPORT', "Datenimport",),
    ]

    profile = models.ForeignKey(Profile, verbose_name=_("Person"), on_delete=models.PROTECT)
    location = models.ForeignKey(Location, verbose_name=_("Standort"), on_delete=models.PROTECT)
    time_entered = models.DateTimeField(_("Checkin"), auto_now=True)
    time_left = models.DateTimeField(_("Checkout"), blank=True, null=True)
    # created_at = models.DateTimeField(auto_now_add=True)
    origin = models.CharField(_("Datenquelle"), choices=CHECKIN_ORIGINS, blank=True, max_length=100)

    class Meta:
        verbose_name = _("Checkin")
        ordering = ('-time_entered',)

    def __str__(self):
        return "Checkin in %s" % (self.location)

    def checkout(self):
        if not self.time_left:
            self.time_left = timezone.now()
            self.save()