import pytz
from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
import random, string

from .base import AutoIdentifiedModel, ModifiableModel, UUIDModelMixin
from .utils import create_datetime_days_from_now, get_translated, get_translated_name
#from .availability import get_opening_hours
from .permissions import UNIT_PERMISSIONS
from .mixins import AUTH_USER_MODEL
from ..auth import is_authenticated_user, is_general_admin, is_superuser, is_staff
#from ..auth import is_unit_admin, is_unit_manager, is_unit_viewer


def _get_default_timezone():
    return timezone.get_default_timezone().zone


def _get_timezone_choices():
    return [(x, x) for x in pytz.all_timezones]


#class AbstractLocatableModel(models.Model):
    # street_address = models.CharField(verbose_name=_('Street address'), max_length=100, null=True)
    # address_zip = models.CharField(verbose_name=_('Postal code'), max_length=10, null=True, blank=True)
    # phone = models.CharField(verbose_name=_('Phone number'), max_length=30, null=True, blank=True)
    # email = models.EmailField(verbose_name=_('Email'), max_length=100, null=True, blank=True)
    # www_url = models.URLField(verbose_name=_('WWW link'), max_length=400, null=True, blank=True)
    # address_postal_full = models.CharField(verbose_name=_('Full postal address'), max_length=100,
    #                                        null=True, blank=True)
    #  municipality = models.ForeignKey(Municipality, null=True, blank=True, verbose_name=_('Municipality'),
    #                                     on_delete=models.SET_NULL)

def _generate_slug():
    return ''.join(random.sample(string.ascii_lowercase, 10))

class Unit(ModifiableModel, UUIDModelMixin):
    """
    A unit is representing a (physical) location or building.
    Resources, Rooms and Equipment might be assigned to Units.

    Previously the Unit was used to authorization (=/= permissions).

    Translated.

    TODO The model could be named Location instead.
    TODO fix authorization.
    """
    name = models.CharField(verbose_name=_('Name'), max_length=200)
    slug = models.SlugField(verbose_name=_('Abbreviation'), max_length=20, unique=True, blank=True)
    description = models.TextField(verbose_name=_('Description'), null=True, blank=True)
    time_zone = models.CharField(verbose_name=_('Time zone'), max_length=50,
                                 default=_get_default_timezone, choices=_get_timezone_choices())
    # reservation_delegates = models.ManyToManyField(AUTH_USER_MODEL, verbose_name=_("Buchungsverantwortliche"),
    #                                                blank=False, related_name='%(app_label)s_%(class)s_reservation_delegated')
    # user_confirmation_delegates = models.ManyToManyField(AUTH_USER_MODEL, verbose_name=_("User confirmation delegates"),
    #                                                blank=True,
    #                                                related_name='%(app_label)s_%(class)s_user_confirmation_delegated')

#    objects = UnitQuerySet.as_manager()

    class Meta:
        verbose_name = _("Building")
        verbose_name_plural = _("Buildings")
        permissions = UNIT_PERMISSIONS
        ordering = ('name',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set the time zone choices here in order to avoid spawning
        # spurious migrations.
        self._meta.get_field('time_zone').choices = _get_timezone_choices()

    def __str__(self):
        return "%s" % (get_translated(self, 'name'),)

    def get_opening_hours(self, begin=None, end=None):
        """
        :rtype : dict[str, list[dict[str, datetime.datetime]]]
        :type begin: datetime.date
        :type end: datetime.date
        """
        return get_opening_hours(self.time_zone, list(self.periods.all()), begin, end)

    def update_opening_hours(self):
        for res in self.resources.all():
            res.update_opening_hours()

    def get_tz(self):
        return pytz.timezone(self.time_zone)

    def get_reservable_before(self):
        return create_datetime_days_from_now(self.reservable_max_days_in_advance)

    def get_reservable_after(self):
        return create_datetime_days_from_now(self.reservable_min_days_in_advance)

    def is_admin(self, user):
        return is_authenticated_user(user) and (
            is_general_admin(user))# or
            #is_unit_admin(user.unit_authorizations.all(), user.unit_group_authorizations.all(), self))

    def is_manager(self, user):
        return is_staff(user)
        #return is_authenticated_user(user) and is_unit_manager(user.unit_authorizations.all(), self)

    def is_viewer(self, user):
        return True
        #return is_authenticated_user(user) and is_unit_viewer(user.unit_authorizations.all(), self)


# class UnitIdentifier(models.Model):
#     unit = models.ForeignKey('Unit', verbose_name=_('Unit'), db_index=True, related_name='identifiers',
#                              on_delete=models.CASCADE)
#     namespace = models.CharField(verbose_name=_('Namespace'), max_length=50)
#     value = models.CharField(verbose_name=_('Value'), max_length=100)
#
#     class Meta:
#         verbose_name = _("unit identifier")
#         verbose_name_plural = _("unit identifiers")
#         unique_together = (('namespace', 'value'), ('namespace', 'unit'))
#
#     def __str__(self):
#         return '{namespace}: {value}'.format(
#             namespace=self.namespace, value=self.value
#         )
