from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django_better_admin_arrayfield.models.fields import ArrayField
from django.contrib.postgres.fields import DateTimeRangeField
from django.utils.translation import gettext_lazy as _
import uuid

from checkin.tracking.models import LocationUsage, ActivityProfile, BookingMethod, Profile, CapacityForActivityProfile

# TODO move into this app: BookingMethod
# TODO move into this shared space: Profile

class RoomQuerySet(models.QuerySet):
    def bookable(self):
        return self.filter(bookable=True)


#class Room(MPTTModel):
class Room(models.Model):
#     checkin_code code = models.CharField(_("Raumcode"), max_length=4, unique=True, default=pkgen)
#     parent = TreeForeignKey('self', verbose_name=_('Teil von'), on_delete=models.CASCADE, null=True, blank=True, related_name='children', default=3)
    numbers = ArrayField(models.CharField(max_length=24), verbose_name=_("Raumnummer(n)"), blank=True, help_text=_("Speicher XI: X.XX.XXX / Dechanatstraße: K.XX"))
    name = models.CharField(_("Raumname"), max_length=255)
    # alternative_names = ArrayField
    access_delegates = models.ManyToManyField(Profile, verbose_name=_("Raumverantwortliche(r)"), blank=True, default=True, related_name='access_delegate_for_room')
    # TODO booking_delegate -> default=raumteam
    booking_delegates = models.ManyToManyField(Profile, verbose_name=_("Raumverantwortliche(r)"), blank=True, default=True, related_name='booking_delegate_for_room')
    room_size = models.DecimalField(verbose_name=_("Größe"), help_text=_("in Quadratmetern"), max_digits=8, decimal_places=2, blank=True, null=True)
    comment = models.TextField(verbose_name=_("Beschreibung / Anmerkungen"), blank=True, null=True)
    usage = models.ManyToManyField(LocationUsage, verbose_name=_("Nutzungsarten"), blank=True)
    capacity_comment = models.TextField(_("Bemerkung zur Nutzung / Einschränkungen / Kapazität"), blank=True, null=True)
    bookable = models.BooleanField(_("Buchbar / Reservierbar"))
    book_via = models.ForeignKey(BookingMethod, verbose_name=_("Buchung via"), on_delete=models.SET_NULL, null=True, blank=True)
    access_restricted = models.BooleanField(_("Zugangsbeschränkt"), blank=True)
    access_allowd_to = models.ManyToManyField(Profile, through='RoomAccessPolicy', verbose_name=_("Zugangsberechtigt"), related_name='allowed_to_book_in')

    BOOKING_PROCCESS_TYPES = (
        ('s', 'Anfragender → Raumverantwortliche → Raumteam'),
        ('s', 'Anfragender → Raumteam → Raumverantwortliche → Raumteam'),
        ('s', 'Anfragender → Raumteam'),
    )
    # Here: Algo / Workflow auswahl

    #booking_process = models.CharField(choices=BOOKING_PROCCESS_TYPES, max_length=100)
    #activities = models.ManyToManyField(ActivityProfile, through='CapacityForActivityProfile', verbose_name=_("Aktivitätsprofile und Kapazitäten"))
    updated_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))

    objects = RoomQuerySet.as_manager()

    class Meta:
        verbose_name = _("Raum")
        verbose_name_plural = _("Räume")

    def __str__(self):
        return "Raum %s – %s" % (self.display_numbers, self.name)

    @property
    def display_name(self):
        if self.numbers:
            return "%s (%s)" % (self.name, self.display_numbers)
        else:
            return "%s" % (self.name,)

    @property
    def display_numbers(self):
        return "/".join(self.numbers)

class RoomAccessPolicy(models.Model):

    ACCESS_POLICY_TYPES = (
        ('ALLOWED', 'ist zugangsberechtigt'),
        ('DECLINED', 'ist nicht zugangsberechtigt'),
        ('REQUESTED', 'hat angefragt'),
    )

    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    person = models.ForeignKey(Profile, on_delete=models.CASCADE)
    type = models.CharField(choices=ACCESS_POLICY_TYPES, default='ALLOWED', blank=True, null=True, max_length=25)
    start = models.DateField(_("Von"), blank=True, null=True)
    end = models.DateField(_("Bis"), blank=True, null=True)
    comment = models.CharField(_("Bemerkung"), blank=True, null=True, max_length=255)
    updated_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))

    class Meta:
        verbose_name = _("Zugangsberechtigung")
        verbose_name_plural = _("Zugangsberechtigungen")

    def __str__(self):
        return "Zugangsberechtigung %i" % self.pk

#     hide_load = models.BooleanField(verbose_name=_("Checkins verstecken"), default=False)
#     removed = models.BooleanField(verbose_name=_("Entfernt"), default=False, help_text=_("Diese Raum ist deaktiviert oder entfernt. Eine Löschung ist jedoch noch nicht möglich, weil noch Checkins am Raum hängen. (Soft-Delete)"))
#     # history = is registered via register_history (see below)
#
#     code / checkin_code
#     numbers = ArrayField
#     name = CharField
#     alternative_names = ArrayField
#     type = Room / Segment / Area / Building
#     description = TextField -> comment
#     #features = wheelchair access, projector, tags ...
#     floor_number = autofill?
#     floor_name = autofill?
#     segment_number = autofill?
#
#     activities = models.ManyToManyField(ActivityProfile, through='CapacityForActivityProfile',
#                                         verbose_name=_("Aktivitätsprofile und Kapazitäten"))
#     max_capacity = from activity profile?
#
#     bookable = models.BooleanField(_("Buchbar / Reservierbar"))
#     book_via = models.ForeignKey(BookingMethod, verbose_name=_("Buchung via"), on_delete=models.SET_NULL, null=True,
#                                  blank=True)
#     access_restricted = models.BooleanField(_("Zugangsbeschränkt"))
#     # access_allowed_to_currect_user = API ownly
#     access_manager = ArrayList or Relation
#     access_rules = TextField
#     access_allowd_to = ArrayList or Relation
#     relation allows lookups! array_field as well!
#     tags = features
#
#     ## from exchange
#     # should via relation
#     # ExchangeGuid: 929f5868-5884-4001-9ee7-d87fc1cd443d
#     # IsResource
#     # ResourceCapacity:
#     # ResourceCustom: {}
#     # ResourceType: Room
#     # SamAccountName: raum_500881805741214
#     # UserPrincipalName: raum_230 @ ja365test.onmicrosoft.com
#     # AccountDisabled                           : True
#     # Alias: raum_230
#     # OrganizationalUnit: deup281a003.prod.outlook.com / Microsoft
#     # Exchange
#     # Hosted
#     # Organizations / ja365test.onmicrosoft.com
#     # CustomAttribute1:
#     # CustomAttribute15:
#     # ExtensionCustomAttribute1: {}
#     # ExtensionCustomAttribute5: {}
#     # DisplayName: XI 2.04.000 - Speicherbühne(10)
#     # EmailAddresses: {smtp: raum_230 @ ja365test.onmicrosoft.com,
#     #                  SMTP: XI_2.04.000 @ ja365test.onmicrosoft.com}
#     # PrimarySmtpAddress                        : XI_2.04.000@ja365test.onmicrosoft.com
#     # RecipientType                             : UserMailbox
#     # RecipientTypeDetails                      : RoomMailbox
#     # Identity                                  : XI 2.04.000 - Speicherbühne (10)
#     # Id                                        : XI 2.04.000 - Speicherbühne (10)
#     # IsValid                                   : True
#     # ExchangeVersion                           : 0.20 (15.0.0.0)
#     # Name                                      : XI 2.04.000 - Speicherbühne (10)
#     # DistinguishedName                         : CN=XI 2.04.000 - Speicherbühne
#     # Guid                                      : 13caaab3-10d1-4bf1-b281-56e89ef6b45d

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
    timerange = DateTimeRangeField(_("Zeitraum"), blank=True, null=True)
    organizer = models.ForeignKey(Profile, verbose_name=_("Anfragender"), on_delete=models.PROTECT)
    #attendants = combine ORGANIZER and GUESTS
    guests = models.ManyToManyField(Profile, through='GuestInRoomBooking', verbose_name=_("Zusätzliche Personen"), related_name='guest_in_booking', blank=True)
    number_of_guests = models.PositiveIntegerField(_("Erwartete Personenanzahl"), blank=True, null=True)
    # TODO update API for extended guest
    comment = models.TextField(_("Kommentar"), blank=True, null=True)
    title = models.CharField(_("Titel der Nutzung"), blank=True, null=True, max_length=255)
    is_important = models.BooleanField(_("!"), blank=True, help_text=_("Nur mit Begründung. (Siehe Kommentar.) z.B. Prüfungen, Ausnahmeregelungen, Verasnstaltungen etc. "))
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
    def attendants(self):
        return [self.organizer] + list(self.guests.all())
    attendants.fget.short_description = _('Alle Teilnehmer')

    @property
    def number_of_attendants(self):
        return len(self.attendants)
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
