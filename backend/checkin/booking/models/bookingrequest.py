from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django_better_admin_arrayfield.models.fields import ArrayField
from django.contrib.postgres.fields import DateTimeRangeField
from django.utils.translation import gettext_lazy as _
import uuid

from checkin.tracking.models import LocationUsage, ActivityProfile, BookingMethod, Profile, CapacityForActivityProfile
# TODO move into this app: BookingMethod
# TODO move into this shared space: Profile

from .room import Room, RoomAccessPolicy

class BookingStatus(models.TextChoices):
    REQUEST = 'REQUEST', _("Offene Anfrage")
    ACCEPT = 'ACCEPT', _("Gebucht")
    DECLINED = 'DECLINED', _("Abgelehnt")
    WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL', _("Wartet auf Genehmigung")
    CANCELED = 'Storniert', _("Storniert")
    CHANGED = 'Geändert', _("Geändert (macht keinen Sinn)")
    INVITE = 'INVITE', _("Einladung (unserseits) an Nutzer")
    OTHER = 'OTHER', _("Sonstiges")

class RoomBookingRequest(models.Model):
    status = models.CharField(_("Status"), choices=BookingStatus.choices, max_length=20, default=BookingStatus.REQUEST)
    uuid = models.UUIDField("UUID", db_index=True, default=uuid.uuid4, editable=False)
    rooms = models.ManyToManyField(Room, verbose_name=_("Raum"))
    # TODO or durationfield!
    start = models.DateTimeField(_("Beginn"))
    end = models.DateTimeField(_("Ende"))
    #timerange = DateTimeRangeField(_("Zeitraum"), blank=True, null=True)
    organizer = models.ForeignKey(Profile, verbose_name=_("Anfragender"), on_delete=models.PROTECT)
    #attendants = combine ORGANIZER and GUESTS
    attendees = models.ManyToManyField(Profile, through='GuestInRoomBooking', verbose_name=_("Teilnehmer"), related_name='guest_in_booking', blank=True)
    number_of_guests = models.PositiveIntegerField(_("Erwartete Personenanzahl"), blank=True, null=True)
    # TODO update API for extended guest
    comment = models.TextField(_("Kommentar"), blank=True, null=True)
    title = models.CharField(_("Titel der Nutzung"), blank=True, null=True, max_length=255)
    is_important = models.BooleanField(_("Prioritär"), blank=True, help_text=_("Nur mit Begründung. (Siehe Kommentar.) z.B. Prüfungen, Ausnahmeregelungen, Verasnstaltungen etc. "))
    agreed_to_phone_contact = models.BooleanField(_("Telefonkontakt zugestimmt"), blank=True, default=False)
    organizer_not_attending = models.BooleanField(_("Anfragender nimmt selbst nicht teil"), blank=True,null=True)
    exclusive_room_usage = models.BooleanField(_("Exklusive Raumnutzung"), blank=True,null=True)
    # type = Einzelbuchung, Gruppenbuchung, Lehrversanstaltung, Öffentliche Veranstaltung, Sonstige
    # stornierung -> notification
    created_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))
    updated_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))
    # TODO doch ein externes "Ticket" Modell auf dem der Status und seine Änderungen erfasst werden können?!
    #uuid
    #history

    # TODO form validation of standard failures: end before start etc.

    class Meta:
        verbose_name = _("Buchungsanfrage")
        verbose_name_plural = _("Buchungsanfragen")

    def __str__(self):
        return "%s %s" % (self._meta.verbose_name, self.uuid)

    @property
    def short_uuid(self):
        return str(self.uuid)[:7].upper()
    short_uuid.fget.short_description = _("UUID")

    @property
    def number_of_attendants(self):
        return self.attendees.count()
    number_of_attendants.fget.short_description = _('N')


class Attendance(models.Model):

    ATTENDANCE_STATUS = (
        ('WAITING', 'benötigt Genehmigung'),
        ('CONFIRMED', 'ist genehmigt'),
        ('DENIED', 'abgelehnt'),
    )

    reservation = models.ForeignKey(RoomBookingRequest, on_delete=models.CASCADE)
    person = models.ForeignKey(Profile, on_delete=models.CASCADE)
    status = models.CharField(choices=ATTENDANCE_STATUS, blank=True, null=True, max_length=25)
    comment = models.CharField(_("Bemerkung"), blank=True, null=True, max_length=255)
    updated_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))

    class Meta:
        verbose_name = _("Teilnahmer")
        verbose_name_plural = _("Teilnahmer")


class GuestInRoomBooking(models.Model):
    bookingrequest = models.ForeignKey(RoomBookingRequest, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.PROTECT)
    reason = models.CharField(_("Grund"), max_length=1000, blank=True, null=True)
    is_external = models.BooleanField(_("HfK-Extern"), blank=True, null=True)
    #status =

    class Meta:
        verbose_name = _("Teilnehmedender an Raumnutzung")
        verbose_name_plural = _("Teilnehmedende an Raumnutzung")
