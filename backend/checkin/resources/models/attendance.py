from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django_better_admin_arrayfield.models.fields import ArrayField
from django.contrib.postgres.fields import DateTimeRangeField
from django.utils.translation import gettext_lazy as _
import uuid

from .reservation import Reservation, USER_MODEL
from .base import ModifiableModel, UUIDModelMixin

class Attendance(ModifiableModel, UUIDModelMixin, models.Model):

    ATTENDANCE_STATUS = (
        ('WAITING', 'benötigt Genehmigung'),
        ('CONFIRMED', 'ist genehmigt'),
        ('DENIED', 'abgelehnt'),
    )

    reservation = models.ForeignKey(Reservation, verbose_name=_("Reservation"), on_delete=models.CASCADE)
    user = models.ForeignKey(USER_MODEL, verbose_name=_("Person"), on_delete=models.PROTECT)
    state = models.CharField(choices=ATTENDANCE_STATUS, verbose_name=_("State"), blank=True, null=True, max_length=25)
    comment = models.CharField(_("Comment"), blank=True, null=True, max_length=255)

    class Meta:
        verbose_name = _("Attendance")
        verbose_name_plural = _("Attendances")

    def __str__(self):
        return "%s %s @ %s" % (self._meta.verbose_name, self.user, self.reservation)


# class AttendantInReservation(models.Model):
#     bookingrequest = models.ForeignKey(RoomBookingRequest, on_delete=models.CASCADE)
#     profile = models.ForeignKey(Profile, on_delete=models.PROTECT)
#     reason = models.CharField(_("Grund"), max_length=1000, blank=True, null=True)
#     is_external = models.BooleanField(_("HfK-Extern"), blank=True, null=True)
#     #status =
#
#     class Meta:
#         verbose_name = _("Teilnehmedender an Raumnutzung")
#         verbose_name_plural = _("Teilnehmedende an Raumnutzung")
