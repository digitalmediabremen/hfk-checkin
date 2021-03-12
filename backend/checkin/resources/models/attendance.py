from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django_better_admin_arrayfield.models.fields import ArrayField
from django.contrib.postgres.fields import DateTimeRangeField
from django.utils.translation import gettext_lazy as _
from django.utils.translation import gettext
import uuid
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from .utils import humanize_duration

from .reservation import Reservation, PROFILE_MODEL
from .base import ModifiableModel, UUIDModelMixin


class AttendanceStates(models.TextChoices):
    REQUESTED = 'requested', _('needs approval')
    CONFIRMED = 'confirmed', _('approved')
    DENIED = 'denied', _('denied')


class Attendance(ModifiableModel, UUIDModelMixin, models.Model):

    reservation = models.ForeignKey(Reservation, verbose_name=_("Reservation"), on_delete=models.CASCADE, editable=False)
    user = models.ForeignKey(PROFILE_MODEL, verbose_name=_("Person"), on_delete=models.PROTECT)
    state = models.CharField(choices=AttendanceStates.choices, verbose_name=_("State"), blank=True, null=True, max_length=25)
    comment = models.CharField(_("Comment"), blank=True, null=True, max_length=255)

    # for `checkin_set` see tracking.Checkin.attendance FK-relation

    class Meta:
        verbose_name = _("Attendance")
        verbose_name_plural = _("Attendances")
        unique_together = ('reservation', 'user') # a user can only attend the same reservation once

    def __str__(self):
        return "%s %s @ %s %s" % (self._meta.verbose_name, self.get_display_name(), self.reservation._meta.verbose_name, self.reservation)

    def __init__(self, *args, **kwargs):
        super(Attendance, self).__init__(*args, **kwargs)
        self.previous_state = self.state

    @property
    def is_external_user(self):
        #return self.state == AttendanceStates.REQUESTED or False
        return self.user.is_external
    is_external_user.fget.short_description = _("External")

    @property
    def is_organizer(self):
        # return self.state == AttendanceStates.REQUESTED or False
        return self.user == self.reservation.organizer

    @property
    def resource(self):
        return self.reservation.resource

    def get_display_name(self):
        name = self.user.get_full_name()
        if self.is_external_user:
            name += " " + gettext("(External)")
        if self.is_organizer:
            name += " " + gettext("(Organizer)")
        return name

    def save(self, *args, **kwargs):
        """
        Set state of new Attendace to REQUESTED if user is_external is True.
        Or set to REQUESTED if no states has been set yet.
        :param args:
        :param kwargs:
        :return:
        """
        if self.user.is_external and (self._state.adding or not self.state):
            self.state = AttendanceStates.REQUESTED
        super().save(*args, **kwargs)

if not 'checkin.tracking' in settings.INSTALLED_APPS:
    raise ImproperlyConfigured("Trying to import AttendanceCheckin, but checkin.tracking is not in INSTALLED_APPS.")


class CheckinAttendance(Attendance):

    class Meta:
        proxy = True
        verbose_name = _("Registration")

    def __str__(self):
        return "%(profile)s on %(date)s for reservation %(reservation)s" % \
               { 'profile': self.user, 'date': self.reservation.duration, 'reservation': self.reservation }