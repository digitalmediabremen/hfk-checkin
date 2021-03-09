import datetime
from django.db import models
from django.core.exceptions import ValidationError, ImproperlyConfigured
from django.utils.translation import ugettext_lazy as _
from .base import AUTH_USER_MODEL
import logging
from guardian.shortcuts import get_users_with_perms

logger = logging.getLogger(__name__)

class AbstractReservableModel(models.Model):
    """
    Abstracting all fields that are required on a reservable Resource / Room.
    These fields might be shared between Units and Resources.
    """

    reservable = models.BooleanField(_("Buchbar"), default=True)
    # reservation_delegates = models.ManyToManyField(AUTH_USER_MODEL, verbose_name=_("Buchungsverantwortliche"),
    #                                                blank=True,
    #                                                related_name='%(app_label)s_%(class)s_reservation_delegated')
    #_need_manual_confirmation = models.BooleanField(verbose_name=_('Need manual confirmation'), default=False, blank=True)
    #usage = models.ManyToManyField(LocationUsage, verbose_name=_("Nutzungsarten"), blank=True)
    #capacity_comment = models.TextField(_("Bemerkung zur Nutzung / Einschränkungen / Kapazität"), blank=True, null=True)
    # book_via = models.ForeignKey(BookingMethod, verbose_name=_("Buchung via"), on_delete=models.SET_NULL, null=True,
    #                              blank=True)
    reservation_info = models.TextField(verbose_name=_("Instructions / Comments"), blank=True, null=True)
    #specific_terms = models.TextField(verbose_name=_('Specific terms'), blank=True)

    # period, slots, limitations
    min_period = models.DurationField(verbose_name=_('Minimum reservation time'),
                                      default=datetime.timedelta(minutes=30))
    max_period = models.DurationField(verbose_name=_('Maximum reservation time'), null=True, blank=True)
    slot_size = models.DurationField(verbose_name=_('Slot size for reservation time'), null=True, blank=True,
                                     default=datetime.timedelta(minutes=30))
    max_reservations_per_user = models.PositiveIntegerField(
        verbose_name=_('Maximum number of active reservations per user'),
        null=True, blank=True)

    # notification extra
    reservation_requested_notification_extra = models.TextField(verbose_name=_(
        'Extra content to "reservation requested" notification'), blank=True)
    reservation_confirmed_notification_extra = models.TextField(verbose_name=_(
        'Extra content to "reservation confirmed" notification'), blank=True)

    # timing
    reservable_max_days_in_advance = models.PositiveSmallIntegerField(verbose_name=_('Reservable max. days in advance'),
                                                                      null=True, blank=True)
    reservable_min_days_in_advance = models.PositiveSmallIntegerField(verbose_name=_('Reservable min. days in advance'),
                                                                      null=True, blank=True)
    # allow_overlapping_reservations = models.BooleanField(
    #     verbose_name=_('Allow overlapping reservations'),
    #     default=False,
    # )

    # third party URL
    external_reservation_url = models.URLField(
        verbose_name=_('External reservation URL'),
        help_text=_('A link to an external reservation system if this resource is managed elsewhere'),
        null=True, blank=True)

    class Meta:
        abstract = True

    @property
    def need_manual_confirmation(self):
        # all resources need manual confirmation
        return True

    @property
    def allow_overlapping_reservations(self):
        # all resources need manual confirmation
        return False

    @property
    def disallow_overlapping_reservations(self):
        # all resources need manual confirmation
        return not self.allow_overlapping_reservations

    def get_reservation_delegates_display(self):
        return ", ".join([d.get_display_name() for d in self.get_reservation_delegates()])

    def get_reservation_delegates(self):
        """
        Returns list of Users delegated to manage reservations on this resource.
        If resource has none, it will use reservation_delegates of Unit.

        :return:
        """
        users = []
        users += get_users_with_perms(self, only_with_perms_in=['resource:can_modify_reservations'])
        if self.unit:
            users += get_users_with_perms(self.unit, only_with_perms_in=['unit:can_modify_reservations'])
        logger.error("%s: No reservation delegates found." % self)
        return users

    def get_user_confirmation_delegates(self):
        if self.unit:
            delegates = get_users_with_perms(self.unit, only_with_perms_in=['unit:can_confirm_users'])
            return delegates
        raise ValueError("Resource has no Unit to get user_confirmation_delegates from.")


class AbstractAccessRestrictedModel(models.Model):
    """

    """
    access_restricted = models.BooleanField(_("Access restricted"), blank=True, default=False)
    # now handeled with guardian object permissions:
    # access_delegates = models.ManyToManyField(AUTH_USER_MODEL, verbose_name=_("Access delegates"), blank=True,
    #                                           related_name='%(app_label)s_%(class)s_access_delegated')
    # access_allowed_to = models.ManyToManyField(AUTH_USER_MODEL, verbose_name=_("Access allowed to"), blank=True,
    #                                           related_name='%(app_label)s_%(class)s_access_allowed')

    class Meta:
        abstract = True


