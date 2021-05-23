from django.contrib.auth.models import Group
from django.db import models
from django.utils.translation import gettext_lazy as _

class ReservationUserGroup(Group):

    visible_in_reservation = models.BooleanField(_("Show in reservation backend"), default=True)

    class Meta:
        verbose_name = _("Usergroup for reservations")
        verbose_name_plural = _("Usergroups for reservations")