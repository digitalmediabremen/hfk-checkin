from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django_better_admin_arrayfield.models.fields import ArrayField

from .models import LocationUsage, BookingMethod, pkgen, ActivityProfile, CapacityForActivityProfile, _, Location as NewLocation



# Checkin-App Model (2021-03-03)
class Location(MPTTModel):
    code = models.CharField(_("Raumcode"), max_length=4, unique=True, default=pkgen)
    parent = TreeForeignKey('self', verbose_name=_('Teil von'), on_delete=models.CASCADE, null=True, blank=True, related_name='children', default=3)
    org_number = models.CharField(_("Raumnummer"), max_length=24, blank=True, help_text=_("Speicher XI: X.XX.XXX / Dechanatstraße: K.XX"))
    org_name = models.CharField(_("Raumname / Standort"), max_length=255)
    org_alternative_name = ArrayField(models.CharField(max_length=255), verbose_name=_("Alternative Bezeichnungen"), blank=True, null=True)
    org_responsible = models.CharField(_("Raumverantwortliche(r)"), max_length=255, blank=True, null=True)
    org_size = models.DecimalField(verbose_name=_("Größe"), help_text=_("in Quadratmetern"), max_digits=8, decimal_places=2, blank=True, null=True)
    org_floor_number = models.IntegerField(verbose_name=_("Etage"), help_text=_("-1: Keller, 0: Erdgeschoss, 1: Erste Etage, usw."), blank=True, null=True)
    org_comment = models.TextField(verbose_name=_("Anmerkungen"), blank=True, null=True)
    org_usage = models.ManyToManyField(LocationUsage, through='LocationForLocationUsage', through_fields=('location', 'locationusage'), verbose_name=_("Nutzungsarten"), blank=True)
    org_capacity_comment = models.TextField(_("Bemerkung zur Nutzung / Kapazität"), blank=True, null=True)
    org_bookable = models.BooleanField(_("Buchbar / Reservierbar"))
    org_book_via = models.ForeignKey(BookingMethod, verbose_name=_("Buchung via"), on_delete=models.SET_NULL, null=True, blank=True)
    #org_activities = models.ManyToManyField(ActivityProfile, through='CapacityForActivityProfile', verbose_name=_("Aktivitätsprofile und Kapazitäten"))
    updated_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))
    hide_load = models.BooleanField(verbose_name=_("Checkins verstecken"), default=False)
    removed = models.BooleanField(verbose_name=_("Entfernt"), default=False, help_text=_("Diese Raum ist deaktiviert oder entfernt. Eine Löschung ist jedoch noch nicht möglich, weil noch Checkins am Raum hängen. (Soft-Delete)"))
    # history = is registered via register_history (see below)

    class Meta:
        db_table = 'tracking_location'
        managed = False
        app_label = 'tracking_legacy'
        default_related_name = 'location'

    def get_org_usages(self):
        return LocationUsage.objects.filter(location_id=self.pk)

    @property
    def capacity(self):
        # use new Location to get (legacy) activity profiles
        activities = CapacityForActivityProfile.objects.filter(location=NewLocation.objects.get(pk=self.pk)).all()
        if activities:
            max_capacity = max([act.capacity for act in activities])
            return max_capacity
        return None
    capacity.fget.short_description = _('Kapazität')


class LocationForLocationUsage(models.Model):
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    locationusage = models.ForeignKey(LocationUsage, on_delete=models.CASCADE)

    class Meta:
        db_table = 'tracking_location_org_usage'
        managed = False
        app_label = 'tracking_legacy'