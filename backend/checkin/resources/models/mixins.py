import datetime
from django.db import models
from django.core.exceptions import ValidationError, ImproperlyConfigured
from django.utils.translation import ugettext_lazy as _
from .base import AUTH_USER_MODEL
import logging

logger = logging.getLogger(__name__)

class AbstractReservableModel(models.Model):
    """
    Abstracting all fields that are required on a reservable Resource / Room.
    These fields are shared between Units and Resources.
    If a Resource has not defined a certain property it shall be "inherited" from its Unit.
    If not Unit is assigned it shall fail gracefully.

    The field name of its parent is defined as PARENT_FIELD_NAME.
    """
    PARENT_FIELD_NAME = None # can be defined in child
    PARENT = None # will be loaded in __init__

    reservable = models.BooleanField(_("Buchbar"), default=True)
    reservation_delegates = models.ManyToManyField(AUTH_USER_MODEL, verbose_name=_("Buchungsverantwortliche"),
                                                   blank=True,
                                                   related_name='%(app_label)s_%(class)s_reservation_delegated')
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

    def __init__(self, *args, **kwargs):
        super(AbstractReservableModel, self).__init__(*args, **kwargs)
        if self.PARENT_FIELD_NAME:
            self.PARENT = getattr(self, self.PARENT_FIELD_NAME)
            if not self._meta.get_field(self.PARENT_FIELD_NAME).get_internal_type() is 'ForeignKey':
                raise ImproperlyConfigured("AbstractRervable: A reservable Resource might have a 'parent' to 'inherit' attributes from. Define the 'parent field' in PARENT_FIELD_NAME. This field must be a ForeignKey.")

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

        FIXME could use Resource.can_approve_reservations or is_manager instead!
        :return:
        """
        if self.reservation_delegates.exists():
            return self.reservation_delegates.all()
        else:
            if self.unit:
                return self.unit.reservation_delegates.all()
        logger.error("%s: No reservation delegates found." % self)
        return []


class AbstractAccessRestrictedModel(models.Model):
    """

    """
    # FIXME could be handled with django-guardian instead
    access_restricted = models.BooleanField(_("Access restricted"), blank=True, default=False)
    access_delegates = models.ManyToManyField(AUTH_USER_MODEL, verbose_name=_("Access delegates"), blank=True,
                                              related_name='%(app_label)s_%(class)s_access_delegated')
    access_allowed_to = models.ManyToManyField(AUTH_USER_MODEL, verbose_name=_("Access allowed to"), blank=True,
                                              related_name='%(app_label)s_%(class)s_access_allowed')
    # TODO was: through='RoomAccessPolicy',

    class Meta:
        abstract = True


