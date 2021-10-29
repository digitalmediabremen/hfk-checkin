import datetime
from django.db import models
from django.core.exceptions import ValidationError, ImproperlyConfigured
from django.utils.translation import gettext_lazy as _
from .base import AUTH_USER_MODEL
import logging
from guardian.shortcuts import get_users_with_perms
from .permissions import prefix_resource_perm_codenames, prefix_unit_perm_codenames
from checkin.users.models import User, Group

logger = logging.getLogger(__name__)


def get_users_with_resource_or_unit_perms_for_resource(resource, resource_perms=[], unit_perms=[], include_unit=True):
    users = []
    #users += get_users_with_perms(resource, only_with_perms_in=resource_perms)
    resource_users_perms = resource.timeenabledresourceuserobjectpermission_set.all()#.filter(permission__codename__in=resource_perms).select_related('user').only('user')
    users += [p.user for p in filter(lambda x: x.permission.codename in resource_perms, resource_users_perms)]
    if include_unit and len(users) < 1 and hasattr(resource, 'unit'):
    #     # only use "unit" permission if object has no explicit permission
    #     #users += get_users_with_perms(resource.unit, only_with_perms_in=unit_perms)
        unit_user_perms = resource.unit.timeenabledunituserobjectpermission_set.all()#.filter(permission__codename__in=unit_perms).select_related('user').only('user')
        users += [p.user for p in filter(lambda x: x.permission.codename in unit_perms, unit_user_perms)]
    return users


class AbstractReservableModel(models.Model):
    """
    Abstracting all fields that are required on a reservable Resource / Room.
    These fields might be shared between Units and Resources.
    """

    reservable = models.BooleanField(_("Reservable"), default=True)
    # reservation_delegates = models.ManyToManyField(AUTH_USER_MODEL, verbose_name=_("Buchungsverantwortliche"),
    #                                                blank=True,
    #                                                related_name='%(app_label)s_%(class)s_reservation_delegated')
    need_manual_confirmation = models.BooleanField(verbose_name=_('Need manual confirmation'), default=True)
    #usage = models.ManyToManyField(LocationUsage, verbose_name=_("Nutzungsarten"), blank=True)
    #capacity_comment = models.TextField(_("Bemerkung zur Nutzung / Einschränkungen / Kapazität"), blank=True, null=True)
    # book_via = models.ForeignKey(BookingMethod, verbose_name=_("Buchung via"), on_delete=models.SET_NULL, null=True,
    #                              blank=True)
    reservation_info = models.TextField(verbose_name=_("Instructions / Comments"), help_text=_("For internal use only. Shall not be displayed to users."), blank=True, null=True)
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
        help_text=_('A link to an external reservation system if this resource is managed elsewhere. Can not be combined with reservable.'),
        null=True, blank=True)

    class Meta:
        abstract = True

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

    def get_reservation_delegates(self, include_unit=True):
        """
        Returns list of Users delegated to manage reservations on this resource.
        If resource has none, it will use reservation_delegates of Unit.

        :return:
        """
        base_perms = ['can_modify_reservations', 'can_modify_reservations_without_notifications']
        return get_users_with_resource_or_unit_perms_for_resource(self,
            resource_perms=prefix_resource_perm_codenames(base_perms),
            unit_perms=prefix_unit_perm_codenames(base_perms),
            include_unit=include_unit
        )

    def get_reservation_delegates_to_notify(self):
        """
        Returns list of Users delegated to manage reservations on this resource.
        If resource has none, it will use reservation_delegates of Unit.

        :return:
        """
        base_perms = ['can_modify_reservations', 'notify_for_reservations']
        return get_users_with_resource_or_unit_perms_for_resource(self,
            resource_perms=prefix_resource_perm_codenames(base_perms),
            unit_perms=prefix_unit_perm_codenames(base_perms)
        )

    def get_user_confirmation_delegates(self):
        if self.unit:
            delegates = get_users_with_perms(self.unit, only_with_perms_in=['unit:can_confirm_users'])
            return delegates
        raise ValueError("Resource has no Unit to get user_confirmation_delegates from.")

    def get_user_confirmation_delegates_to_notify(self):
        unit_perms = ['can_confirm_users', 'notify_for_users']
        return get_users_with_resource_or_unit_perms_for_resource(
            self,
            resource_perms=[],
            unit_perms=prefix_unit_perm_codenames(unit_perms)
        )


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

    def get_access_delegates_display(self):
        return ", ".join([d.get_display_name() for d in self.get_access_delegates()])

    def get_access_delegates(self, include_unit=True):
        """
        Returns list of Users delegated to manage reservations on this resource.
        If resource has none, it will use reservation_delegates of Unit.

        :return:
        """
        base_perms = ['can_modify_access', 'can_modify_access_without_notifications']
        return get_users_with_resource_or_unit_perms_for_resource(
            self,
            resource_perms=prefix_resource_perm_codenames(base_perms),
            unit_perms=prefix_unit_perm_codenames(base_perms),
            include_unit=include_unit
        )

    def get_access_delegates_to_notify(self):
        base_perms = ['can_modify_access', 'notify_for_access']
        return get_users_with_resource_or_unit_perms_for_resource(
            self,
            resource_perms=prefix_resource_perm_codenames(base_perms),
            unit_perms=prefix_unit_perm_codenames(base_perms)
        )


