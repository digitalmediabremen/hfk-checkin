import datetime
import os
import re
import pytz
from collections import OrderedDict
from decimal import Decimal

import arrow
import django.db.models as dbm
from django.db.models import Q
from django.apps import apps
from django.conf import settings
from django.db import models
from django_better_admin_arrayfield.models.fields import ArrayField
from django.core.exceptions import ValidationError, ImproperlyConfigured
from django.core.files.base import ContentFile
from django.core.validators import MinValueValidator
from django.urls import reverse
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.functional import cached_property
from six import BytesIO
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy
from django.contrib.postgres.fields import HStoreField, DateTimeRangeField
#from .gistindex import GistIndex
from psycopg2.extras import DateTimeTZRange
#from image_cropping import ImageRatioField
#from PIL import Image
from guardian.shortcuts import get_objects_for_user, get_users_with_perms
from guardian.core import ObjectPermissionChecker
from simple_history.models import HistoricalRecords
from django.db import connection

from ..auth import is_authenticated_user, is_general_admin, is_superuser
#from ..errors import InvalidImage
#from ..fields import EquipmentField
#from .accessibility import AccessibilityValue, AccessibilityViewpoint, ResourceAccessibility
from .base import AutoIdentifiedModel, NameIdentifiedModel, ModifiableModel, UUIDModelMixin, PROFILE_MODEL
from .utils import create_datetime_days_from_now, get_translated, get_translated_name, humanize_duration
#from .equipment import Equipment
from .unit import Unit
#from .availability import get_opening_hours
from .permissions import RESOURCE_GROUP_PERMISSIONS, RESOURCE_PERMISSIONS
#from ..enums import UnitAuthorizationLevel, UnitGroupAuthorizationLevel
from .mixins import AbstractReservableModel, AbstractAccessRestrictedModel
from .permissions import NoSuperuserObjectPermissionChecker
from .objectpermissions import *
from django.db.models import Prefetch


# TODO remove UNIT_ROLE_PERMISSIONS
UNIT_ROLE_PERMISSIONS = {}


# FIXME not in use
def generate_access_code(access_code_type):
    if access_code_type == Resource.ACCESS_CODE_TYPE_NONE:
        return ''
    elif access_code_type == Resource.ACCESS_CODE_TYPE_PIN4:
        return get_random_string(4, '0123456789')
    elif access_code_type == Resource.ACCESS_CODE_TYPE_PIN6:
        return get_random_string(6, '0123456789')
    else:
        raise NotImplementedError('Don\'t know how to generate an access code of type "%s"' % access_code_type)

# FIXME not in use
def validate_access_code(access_code, access_code_type):
    if access_code_type == Resource.ACCESS_CODE_TYPE_NONE:
        return
    elif access_code_type == Resource.ACCESS_CODE_TYPE_PIN4:
        if not re.match('^[0-9]{4}$', access_code):
            raise ValidationError(dict(access_code=_('Invalid value')))
    elif access_code_type == Resource.ACCESS_CODE_TYPE_PIN6:
        if not re.match('^[0-9]{6}$', access_code):
            raise ValidationError(dict(access_code=_('Invalid value')))
    else:
        raise NotImplementedError('Don\'t know how to validate an access code of type "%s"' % access_code_type)

    return access_code


def determine_hours_time_range(begin, end, tz):
    if begin is None:
        begin = tz.localize(datetime.datetime.now()).date()
    if end is None:
        end = begin

    midnight = datetime.time(0, 0)
    begin = tz.localize(datetime.datetime.combine(begin, midnight))
    end = tz.localize(datetime.datetime.combine(end, midnight))
    end += datetime.timedelta(days=1)

    return begin, end


class ResourceFeature(ModifiableModel, UUIDModelMixin):
    #identifier = models.CharField(verbose_name=_('Identifier'), max_length=100)
    name = models.CharField(verbose_name=_('Name'), max_length=200)

    class Meta:
        verbose_name = _('Resource feature')
        verbose_name_plural = _('Resource features')
        ordering = ('name',)

    def __str__(self):
        return self.name


class ResourceType(ModifiableModel, UUIDModelMixin):
    MAIN_TYPES = (
        ('space', _('Space')),
        ('person', _('Person')),
        ('item', _('Item'))
    )
    main_type = models.CharField(verbose_name=_('Main type'), max_length=20, choices=MAIN_TYPES)
    name = models.CharField(verbose_name=_('Name'), max_length=200)
    #history = HistoricalRecords()

    class Meta:
        verbose_name = _("resource type")
        verbose_name_plural = _("resource types")
        ordering = ('name',)

    def __str__(self):
        return "%s" % (get_translated(self, 'name'),)


class ResourceQuerySet(models.QuerySet):
    def visible_for(self, user):
        # Resource.public is currently not available
        # TODO restrict visibility?!
        return self.filter(reservable=True)
        is_public = Q(is_public=True, unit__is_public=True)
        # is_public = Q(unit__public=True)
        return self.filter(is_public)
        # if not user.is_authenticated:
        #     return self.filter(is_public)
        # if is_general_admin(user):
        #     return self
        # is_in_managed_units = Q(unit__in=Unit.objects.managed_by(user))
        # return self.filter(is_in_managed_units | is_public)

    def modifiable_by(self, user):
        if not is_authenticated_user(user):
            return self.none()

        if is_general_admin(user):
            return self

        units = Unit.objects.managed_by(user)
        return self.filter(unit__in=units)

    def with_perm(self, perm, user):
        units = get_objects_for_user(user, 'unit:%s' % perm, klass=Unit,
                                     with_superuser=False)
        resource_groups = get_objects_for_user(user, 'group:%s' % perm, klass=ResourceGroup,
                                               with_superuser=False)
        allowed_roles = UNIT_ROLE_PERMISSIONS.get(perm)
        units_where_role = Unit.objects.by_roles(user, allowed_roles)
        return self.filter(Q(unit__in=list(units) + list(units_where_role)) | Q(groups__in=resource_groups)).distinct()

    def annotate_capacity_calculation(self):
        from django.db.models import Case, Value, Min, Max, When, PositiveIntegerField, F
        from django.db.models.functions import Floor, Least
        capacity_field_name = 'people_capacity_default'
        capacity_policies_related_name = 'capacity_policies__value'
        # calculate min or max of applying ResourceCapacityPolicies for this Resource
        q = self.annotate(capacity_policies_value=Case(
            When(people_capacity_calculation_type=Resource.CAPACITY_CALCULATION_MIN, then=Min(capacity_policies_related_name)),
            When(people_capacity_calculation_type=Resource.CAPACITY_CALCULATION_MAX, then=Max(capacity_policies_related_name)),
            default = capacity_field_name,
            output_field = PositiveIntegerField(),
        ))
        # calculate min or max between default and calculated policy value
        q = q.annotate(people_capacity=Case(
            When(people_capacity_calculation_type=Resource.CAPACITY_CALCULATION_MIN,
                 then=Least(F('capacity_policies_value'),capacity_field_name)),
            When(people_capacity_calculation_type=Resource.CAPACITY_CALCULATION_MAX,
                 then=Least(F('capacity_policies_value'),capacity_field_name)),
            default=capacity_field_name,
            output_field=PositiveIntegerField(),
        ))
        return q

    def prefetch_permissions_with_users(self, include_group=False):
        q = self.prefetch_related(
            Prefetch('timeenabledresourceuserobjectpermission_set',
                     queryset=TimeEnabledResourceUserObjectPermission.objects.select_related('user','permission')
                     ))
        if include_group:
            q = q.prefetch_related(
                Prefetch('timeenabledresourcegroupobjectpermission_set',
                         queryset=TimeEnabledResourceGroupObjectPermission.objects.select_related('group','permission')
                         ))
        return q

    def prefetch_features(self):
        return self.prefetch_related('features')

# FIXME not in use
class Attachment(ModifiableModel, UUIDModelMixin):
    name = models.CharField(verbose_name=_('Name'), max_length=200)
    attachment_file = models.FileField(verbose_name=_('File'), upload_to='attachment_files')

    def __str__(self):
        return self.name


# class AbstractResource(ModifiableModel, UUIDModelMixin, AbstractReservableModel, AbstractAccessRestrictedModel):
#     """
#     A Resource is anything that can be reserved
#     """
#
#     class Meta:
#         abstract = True

class ResourceManager(models.Manager.from_queryset(ResourceQuerySet)):
    def get_queryset(self):
        return super(ResourceManager, self).get_queryset() \
            .annotate_capacity_calculation()

    def get_resources_reservation_delegated_to_user(self, user, with_unit=True):
        """ returns the QS of Resources `user` is allowed to / assigned to manage Reservations of """
        resources_qs = get_objects_for_user(user, ['resource:can_modify_reservations','resource:can_modify_reservations_without_notifications'], any_perm=True, accept_global_perms=False, with_superuser=False, klass=self.model)
        if with_unit:
            units_qs = get_objects_for_user(user, ['unit:can_modify_reservations','unit:can_modify_reservations_without_notifications'], any_perm=True, accept_global_perms=False, with_superuser=False, klass=Unit)
            # return all resources with permission 'can_modify_reservations' on Resource or on Resource.unit
            resources_qs |= self.get_queryset().filter(unit__in=units_qs)
        return resources_qs

    def get_resources_access_delegated_to_user(self, user, with_unit=True):
        """ returns the QS of Resources `user` is allowed to / assigned to manage Reservations of """
        resources_qs = get_objects_for_user(user, ['resource:can_modify_access','resource:can_modify_access_without_notifications'], any_perm=True, accept_global_perms=False, with_superuser=False, klass=self.model)
        if with_unit:
            units_qs = get_objects_for_user(user, ['unit:can_modify_access','unit:can_modify_access_without_notifications'], any_perm=True, accept_global_perms=False, with_superuser=False, klass=Unit)
            # return all resources with permission 'can_modify_access' on Resource or on Resource.unit
            resources_qs |= self.get_queryset().filter(unit__in=units_qs)
        return resources_qs

    def get_resources_user_can_manage(self, user):
        """
        returns the QS of Resources `user` can manage (access in backend)
        includes all resources from self.get_resources_reservation_delegated_to_user(), so delegates can
        use resource list as well.
        """
        resources_qs = self.get_resources_reservation_delegated_to_user(user)
        resources_qs |= get_objects_for_user(user, ['resource:view_resource','resource:change_resource','resource:delete_resource'], any_perm=True, accept_global_perms=False, klass=self.model)
        units_qs = get_objects_for_user(user, ['unit:view_resource','unit:change_resource','unit:delete_resource'], any_perm=True, accept_global_perms=False, klass=Unit)
        # return all resources with permission 'can_modify_reservations' on Resource or on Resource.unit
        resources_qs |= self.get_queryset().filter(unit__in=units_qs)
        return resources_qs


# def get_default_unit():
    # FIXME this fill fail in mirgations, because the migration will then referance the wrong version
    # use apps.get_model() to use the version from app registry
    # unit_pk = Unit.objects.order_by('pk').values('pk')[:1]
    # if not unit_pk:
    #     unit, created = Unit.objects.get_or_create(slug='default', name="Default Unit")
    # return unit.pk


class Resource(ModifiableModel, UUIDModelMixin, AbstractReservableModel, AbstractAccessRestrictedModel):
    """
    A Resource, here a room, is a bookable object. Reservations will relate to Resources.
    Fields related to reservation parameters of a Resource are abstracted in AbstractReservableModel and shared with Units.
    Fields related to permissions are abstracted in AbstractAccessRestrictedModel.
    FIXME AbstractAccessRestrictedModel overlaps with the model for UnitAuthorizations and/or object permissions (guardian).
    """
    # TODO might be renamed to Room or Space (and abstracted from Resource, which can also be a Person or Item)
    # TODO rename to Room

    # from respa: access codes
    # currently not used and bypassed, but not removed from source
    # Resource.access_code_type defaults to ACCESS_CODE_TYPE_NONE

    # FIXME not in use
    # defaults to ACCESS_CODE_TYPE_NONE
    ACCESS_CODE_TYPE_NONE = 'none'
    ACCESS_CODE_TYPE_PIN4 = 'pin4'
    ACCESS_CODE_TYPE_PIN6 = 'pin6'
    ACCESS_CODE_TYPES = (
        (ACCESS_CODE_TYPE_NONE, _('None')),
        (ACCESS_CODE_TYPE_PIN4, _('4-digit PIN code')),
        (ACCESS_CODE_TYPE_PIN6, _('6-digit PIN code')),
    )

    CAPACITY_CALCULATION_NONE = 'None'
    CAPACITY_CALCULATION_MIN = 'Min'
    CAPACITY_CALCULATION_MAX = 'Max'
    CAPACITY_CALCULATION_TYPES = (
        (CAPACITY_CALCULATION_NONE, _('Default without policies')),
        (CAPACITY_CALCULATION_MIN, _('Minimum according to policies')),
        (CAPACITY_CALCULATION_MAX, _('Maximum according to policies')),
    )

    #id = models.CharField(primary_key=True, max_length=100)
    is_public = models.BooleanField(default=True, verbose_name=_('Public'))
    numbers = ArrayField(models.CharField(max_length=24), verbose_name=_("Room number(s)"), blank=True, null=True,
                         help_text=_("Speicher XI: X.XX.XXX / Dechanatstraße: X.XX(x)"))
    name = models.CharField(_("Name"), max_length=200)
    alternative_names = ArrayField(models.CharField(max_length=200), verbose_name=_("Alternative names"), blank=True, null=True)
    description = models.TextField(verbose_name=_("Description"), help_text=_("Displayed publicly"), blank=True, null=True)

    unit = models.ForeignKey('Unit', verbose_name=_('Unit'), db_index=True,
                             related_name="resources", on_delete=models.PROTECT)
    type = models.ForeignKey(ResourceType, verbose_name=_('Resource type'), db_index=True, null=True, blank=True,
                             on_delete=models.PROTECT)
    # FIXME type would be better named category? what are types actually?
    #purposes = models.ManyToManyField(Purpose, verbose_name=_('Purposes'), blank=True)
    # FIXME purposes = usages?
    features = models.ManyToManyField(ResourceFeature, verbose_name=_('Features'), blank=True)

    people_capacity = None # will be annotated through queryset with `annotate_capacity_calculation()`
    people_capacity_default = models.PositiveIntegerField(verbose_name=_('Default people capacity'), null=True, blank=True)
    people_capacity_calculation_type = models.CharField(verbose_name=_('Capacity calculation'), max_length=20, choices=CAPACITY_CALCULATION_TYPES, default=CAPACITY_CALCULATION_MIN)
    area = models.DecimalField(verbose_name=_('Area (m²)'), help_text=_("in Quadratmetern"), max_digits=8,
                                    decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))],
                                    blank=True, null=True)
    floor_number = models.IntegerField(verbose_name=_('Floor number'), help_text=_("-1: Basement, 0: Ground Floor, 1: First Floor"), null=True, blank=True)
    floor_name = models.CharField(verbose_name=_('Floor name'), max_length=200, null=True, blank=True)
    #history = HistoricalRecords()
    phone_number = models.CharField(verbose_name=_('Phone extension'), help_text=_("Usually 4 digits. Please do not enter the full phone number."), max_length=20, null=True, blank=True)
    email = models.EmailField(verbose_name=_('Email'), help_text=_("Use only if the room has an 'own' email address. Other contacts can be entered as delegates."), max_length=200, null=True, blank=True)

    objects = ResourceManager()
    objects_without_annotations = ResourceQuerySet.as_manager()

    class Meta:
        verbose_name = _("Space")
        verbose_name_plural = _("Spaces")
        ordering = ('unit', 'name',)
        permissions = RESOURCE_PERMISSIONS

    def __str__(self):
        name = str()
        if self.numbers:
            name += "%s " % self.display_numbers
        name += "%s" % (get_translated(self, 'name'),)
        cap = getattr(self, 'people_capacity', None)
        # if self.alternative_names:
        #     name += " (" + " / ".join(self.alternative_names) + ")"
        if cap is not None:
            name += " (%d)" % cap
        return name

    def clean(self, *args, **kwargs):
        if self.reservable and self.external_reservation_url:
            raise ValidationError(_("Resources can not be reservable in this system and use a external reservation service url at the same time."))
        super().clean(*args, **kwargs)

    @property
    def access_code_type(self):
        DeprecationWarning("Resource do not implement access code types any more.")
        return Resource.ACCESS_CODE_TYPE_NONE

    # @property
    # def display_name(self):
    #     name = "%s" % (get_translated(self, 'name'),)
    #     if self.numbers:
    #         name += " (%s)" % self.display_numbers
    #     cap = getattr(self, 'people_capacity', None)
    #     if cap:
    #         name += " (%d)" % cap
    #     return name
    # display_name.fget.short_description = _('Name')

    @property
    def display_name(self):
        name = str()
        if self.numbers:
            name += "%s " % self.display_numbers
        name += "%s" % (get_translated(self, 'name'),)
        cap = getattr(self, 'people_capacity', None)
        if cap:
            name += " (%d)" % cap
        return name
    display_name.fget.short_description = _('Name')

    @property
    def email_sender_name(self):
        name = "%s" % (get_translated(self, 'name'),)
        if self.numbers:
            name += " (%s)" % self.display_numbers
        return name.replace("\n", "").strip()

    @property
    def display_numbers(self):
        if self.numbers:
            return " / ".join(self.numbers)
        else:
            return str()
    display_numbers.fget.short_description = _('Numbers')
    display_numbers.fget.admin_order_field = 'numbers'

    @cached_property
    def time_zone(self):
        if self.unit and self.unit.time_zone:
            return self.unit.time_zone
        return str(timezone.get_default_timezone())

    def get_tz(self):
        return pytz.timezone(self.time_zone)

    def validate_reservation_period(self, reservation, user, data=None):
        """
        Check that given reservation if valid for given user.

        Reservation may be provided as Reservation or as a data dict.
        When providing the data dict from a serializer, reservation
        argument must be present to indicate the reservation being edited,
        or None if we are creating a new reservation.
        If the reservation is not valid raises a ValidationError.

        Staff members have no restrictions at least for now.

        Normal users cannot make multi day reservations or reservations
        outside opening hours.

        :type reservation: Reservation
        :type user: User
        :type data: dict[str, Object]
        """

        # no restrictions for staff
        if self.is_admin(user):
            return

        tz = self.get_tz()
        # check if data from serializer is present:
        if data:
            begin = data['begin']
            end = data['end']
        else:
            # if data is not provided, the reservation object has the desired data:
            begin = reservation.begin
            end = reservation.end

        if begin.tzinfo:
            begin = begin.astimezone(tz)
        else:
            begin = tz.localize(begin)
        if end.tzinfo:
            end = end.astimezone(tz)
        else:
            end = tz.localize(end)

        # TODO multi-day reservation
        # if begin.date() != end.date():
        #     raise ValidationError(_("You cannot make a multi day reservation"))

        if not self.can_ignore_opening_hours(user):
            opening_hours = self.get_opening_hours(begin.date(), end.date())
            days = opening_hours.get(begin.date(), None)
            if days is None or not any(day['opens'] and begin >= day['opens'] and end <= day['closes'] for day in days):
                raise ValidationError(_("You must start and end the reservation during opening hours"))

        if not self.can_ignore_max_period(user) and (self.max_period and (end - begin) > self.max_period):
            raise ValidationError(_("The maximum reservation length is %(max_period)s") %
                                  {'max_period': humanize_duration(self.max_period)})

    def validate_max_reservations_per_user(self, user):
        """
        Check maximum number of active reservations per user per resource.
        If the user has too many reservations raises ValidationError.

        Staff members have no reservation limits.

        :type user: User
        """
        if self.can_ignore_max_reservations_per_user(user):
            return

        max_count = self.max_reservations_per_user
        if max_count is not None:
            reservation_count = self.reservations.filter(user=user).active().count()
            if reservation_count >= max_count:
                raise ValidationError(_("Maximum number of active reservations for this resource exceeded."))

    def get_reservation_collisions_qs(self, begin, end, reservation=None):
        # only collide with current() reservations (!)
        overlapping = self.reservations.current().confirmed().overlaps(begin, end)
        if reservation:
            overlapping = overlapping.exclude(pk=reservation.pk)
        return overlapping

    def check_reservation_collision(self, begin, end, reservation):
        return self.get_reservation_collisions_qs(begin, end, reservation).exists()

    def get_total_number_of_attendees_for_period(self, begin, end, reservation=None):
        overlaps = self.get_reservation_collisions_qs(begin, end, reservation)
        aggregate_sum = overlaps.aggregate_sum_of_total_number_of_attendees()
        # total_number_of_attendees = sum(c.total_number_of_attendees for c in overlaps)
        return aggregate_sum['sum_of_total_number_of_attendees']

    def check_capacity_exhausted(self, begin, end, reservation=None):
        if not self.people_capacity:
            return False
        if self.get_total_number_of_attendees_for_period(begin, end, reservation) >= self.people_capacity:
            return True
        return False

    def get_available_hours(self, start=None, end=None, duration=None, reservation=None, during_closing=False):
        """
        Returns hours that the resource is not reserved for a given date range

        If include_closed=True, will also return hours when the resource is closed, if it is not reserved.
        This is so that admins can book resources during closing hours. Returns
        the available hours as a list of dicts. The optional reservation argument
        is for disregarding a given reservation during checking, if we wish to
        move an existing reservation. The optional duration argument specifies
        minimum length for periods to be returned.

        :rtype: list[dict[str, datetime.datetime]]
        :type start: datetime.datetime
        :type end: datetime.datetime
        :type duration: datetime.timedelta
        :type reservation: Reservation
        :type during_closing: bool
        """
        today = arrow.get(timezone.now())
        if start is None:
            start = today.floor('day').naive
        if end is None:
            end = today.replace(days=+1).floor('day').naive
        if not start.tzinfo and not end.tzinfo:
            """
            Only try to localize naive dates
            """
            tz = timezone.get_current_timezone()
            start = tz.localize(start)
            end = tz.localize(end)

        if not during_closing:
            """
            Check open hours only
            """
            open_hours = self.get_opening_hours(start, end)
            hours_list = []
            for date, open_during_date in open_hours.items():
                for period in open_during_date:
                    if period['opens']:
                        # if the start or end straddle opening hours
                        opens = period['opens'] if period['opens'] > start else start
                        closes = period['closes'] if period['closes'] < end else end
                        # include_closed to prevent recursion, opening hours need not be rechecked
                        hours_list.extend(self.get_available_hours(start=opens,
                                                                   end=closes,
                                                                   duration=duration,
                                                                   reservation=reservation,
                                                                   during_closing=True))
            return hours_list

        reservations = self.reservations.filter(
            end__gte=start, begin__lte=end).order_by('begin')
        hours_list = [({'starts': start})]
        first_checked = False
        for res in reservations:
            # skip the reservation that is being edited
            if res == reservation:
                continue
            # check if the reservation spans the beginning
            if not first_checked:
                first_checked = True
                if res.begin < start:
                    if res.end > end:
                        return []
                    hours_list[0]['starts'] = res.end
                    # proceed to the next reservation
                    continue
            if duration:
                if res.begin - hours_list[-1]['starts'] < duration:
                    # the free period is too short, discard this period
                    hours_list[-1]['starts'] = res.end
                    continue
            hours_list[-1]['ends'] = timezone.localtime(res.begin)
            # check if the reservation spans the end
            if res.end > end:
                return hours_list
            hours_list.append({'starts': timezone.localtime(res.end)})
        # after the last reservation, we must check if the remaining free period is too short
        if duration:
            if end - hours_list[-1]['starts'] < duration:
                hours_list.pop()
                return hours_list
        # otherwise add the remaining free period
        hours_list[-1]['ends'] = end
        return hours_list

    def get_opening_hours(self, begin=None, end=None, opening_hours_cache=None):
        tz = pytz.timezone(self.time_zone)
        begin, end = determine_hours_time_range(begin, end, tz)
        opening_hours = dict()
        date = begin.date()
        end = end.date()
        while date < end:
            opening_hours[date] = [OrderedDict(opens=datetime.time(0,0,0), closes=datetime.time(23,59,59))]
            date += datetime.timedelta(days=1)

        return opening_hours

    # def get_opening_hours(self, begin=None, end=None, opening_hours_cache=None):
    #     """
    #     :rtype : dict[str, datetime.datetime]
    #     :type begin: datetime.date
    #     :type end: datetime.date
    #     """
    #     tz = pytz.timezone(self.unit.time_zone)
    #     begin, end = determine_hours_time_range(begin, end, tz)
    #
    #     if opening_hours_cache is None:
    #         hours_objs = self.opening_hours.filter(open_between__overlap=(begin, end, '[)'))
    #     else:
    #         hours_objs = opening_hours_cache
    #
    #     opening_hours = dict()
    #     for h in hours_objs:
    #         opens = h.open_between.lower.astimezone(tz)
    #         closes = h.open_between.upper.astimezone(tz)
    #         date = opens.date()
    #         hours_item = OrderedDict(opens=opens, closes=closes)
    #         date_item = opening_hours.setdefault(date, [])
    #         date_item.append(hours_item)
    #
    #     # Set the dates when the resource is closed.
    #     date = begin.date()
    #     end = end.date()
    #     while date < end:
    #         if date not in opening_hours:
    #             opening_hours[date] = [OrderedDict(opens=None, closes=None)]
    #         date += datetime.timedelta(days=1)
    #
    #     return opening_hours

    def update_opening_hours(self):
        return

    # def update_opening_hours(self):
    #     hours = self.opening_hours.order_by('open_between')
    #     existing_hours = {}
    #     for h in hours:
    #         assert h.open_between.lower not in existing_hours
    #         existing_hours[h.open_between.lower] = h.open_between.upper
    # 
    #     unit_periods = list(self.unit.periods.all())
    #     resource_periods = list(self.periods.all())
    # 
    #     # Periods set for the resource always carry a higher priority. If
    #     # nothing is defined for the resource for a given day, use the
    #     # periods configured for the unit.
    #     for period in unit_periods:
    #         period.priority = 0
    #     for period in resource_periods:
    #         period.priority = 1
    # 
    #     earliest_date = None
    #     latest_date = None
    #     all_periods = unit_periods + resource_periods
    #     for period in all_periods:
    #         if earliest_date is None or period.start < earliest_date:
    #             earliest_date = period.start
    #         if latest_date is None or period.end > latest_date:
    #             latest_date = period.end
    # 
    #     # Assume we delete everything, but remove items from the delete
    #     # list if the hours are identical.
    #     to_delete = existing_hours
    #     to_add = {}
    #     if all_periods:
    #         hours = get_opening_hours(self.unit.time_zone, all_periods,
    #                                   earliest_date, latest_date)
    #         for hours_items in hours.values():
    #             for h in hours_items:
    #                 if not h['opens'] or not h['closes']:
    #                     continue
    #                 if h['opens'] in to_delete and h['closes'] == to_delete[h['opens']]:
    #                         del to_delete[h['opens']]
    #                         continue
    #                 to_add[h['opens']] = h['closes']
    # 
    #     if to_delete:
    #         ret = ResourceDailyOpeningHours.objects.filter(
    #             open_between__in=[(opens, closes, '[)') for opens, closes in to_delete.items()],
    #             resource=self
    #         ).delete()
    #         assert ret[0] == len(to_delete)
    # 
    #     add_objs = [
    #         ResourceDailyOpeningHours(resource=self, open_between=(opens, closes, '[)'))
    #         for opens, closes in to_add.items()
    #     ]
    #     if add_objs:
    #         ResourceDailyOpeningHours.objects.bulk_create(add_objs)

    def is_admin(self, user):
        """
        Check if the given user is an administrator of this resource.

        :type user: users.models.User
        :rtype: bool
        """
        # UserFilterBackend and ReservationFilterSet in resources.api.reservation assume the same behaviour,
        # so if this is changed those need to be changed as well.
        if not self.unit:
            return is_general_admin(user)
        return self.unit.is_admin(user)

    def is_manager(self, user):
        """
        Check if the given user is a manager of this resource.

        :type user: users.models.User
        :rtype: bool
        """
        if not self.unit:
            return False
        return self.unit.is_manager(user)

    def is_viewer(self, user):
        """
        Check if the given user is a viewer of this resource.

        :type user: users.models.User
        :rtype: bool
        """
        if not self.unit:
            return False
        return self.unit.is_viewer(user)

    def _has_perm(self, user, perm, allow_admin=False, allow_global=False):
        if not is_authenticated_user(user):
            return False

        # if (self.is_admin(user) and allow_admin) or user.is_superuser:
        #     return True

        return self._has_explicit_perm(user, perm, allow_admin, allow_global)

    def _has_explicit_perm(self, user, perm, allow_admin=False, allow_global=False):
        """
        :param user: User instance
        :param perm: String permission codename
        :param allow_admin: Use User.is_admin to always return True if set
        :param allow_global: Use User.has_perm to evaluate non-object-specific/global permissions form django.auth
        :return: bool
        """
        if allow_admin and is_general_admin(user):
            return True

        if allow_global and (user.has_perm('resource:%s' % perm) or user.has_perm('unit:%s' % perm)):
            return True

        if hasattr(self, '_permission_checker'):
            checker = self._permission_checker
        else:
            checker = NoSuperuserObjectPermissionChecker(user)
            checker.prefetch_perms((self,))
            checker.prefetch_perms((self.unit,))

        # Permissions can be given by resource
        if checker.has_perm('resource:%s' % perm, self):
            return True
        # Permissions can be given per-unit
        if checker.has_perm('unit:%s' % perm, self.unit):
            return True
        # # ... or through Resource Groups
        # resource_group_perms = [checker.has_perm('group:%s' % perm, rg) for rg in self.groups.all()]
        # return any(resource_group_perms)
        return False

    def get_users_with_perm(self, perm):
        # TODO
        return {}
        users = {u for u in get_users_with_perms(self.unit) if u.has_perm('unit:%s' % perm, self.unit)}
        for rg in self.groups.all():
            users |= {u for u in get_users_with_perms(rg) if u.has_perm('group:%s' % perm, rg)}
        return users

    def has_access(self, user):
        return not self.access_restricted or self._has_perm(user, 'has_permanent_access')

    def can_modify_access(self, user):
        return self._has_perm(user, 'can_modify_access', allow_global=True, allow_admin=True) or self._has_perm(user, 'can_modify_access_without_notifications')

    def can_make_reservations(self, user):
        return self.reservable and self.has_access(user)

    def can_modify_reservations(self, user):
        return self._has_perm(user, 'can_modify_reservations') or self._has_perm(user, 'can_modify_reservations_without_notifications')

    def can_comment_reservations(self, user):
        return self._has_perm(user, 'can_comment_reservations')

    def can_ignore_opening_hours(self, user):
        return True
        # TODO
        return self._has_perm(user, 'can_ignore_opening_hours')

    # def can_view_reservation_extra_fields(self, user):
    #     return self._has_perm(user, 'can_view_reservation_extra_fields')

    def can_view_reservation_user(self, user):
        return self._has_perm(user, 'can_view_reservation_user')

    def can_access_reservation_comments(self, user):
        return self._has_perm(user, 'can_access_reservation_comments')

    # def can_view_reservation_catering_orders(self, user):
    #     return self._has_perm(user, 'can_view_reservation_catering_orders')
    #
    # def can_modify_reservation_catering_orders(self, user):
    #     return self._has_perm(user, 'can_modify_reservation_catering_orders')
    #
    # def can_view_reservation_product_orders(self, user):
    #     return self._has_perm(user, 'can_view_reservation_product_orders', allow_admin=False)
    #
    # def can_modify_paid_reservations(self, user):
    #     return self._has_perm(user, 'can_modify_paid_reservations', allow_admin=False)

    def can_approve_reservations(self, user):
        return self._has_perm(user, 'can_approve_reservation', allow_admin=False)

    # def can_view_reservation_access_code(self, user):
    #     return self._has_perm(user, 'can_view_reservation_access_code')
    #
    # def can_bypass_payment(self, user):
    #     return self._has_perm(user, 'can_bypass_payment')
    #
    # def can_create_staff_event(self, user):
    #     return self._has_perm(user, 'can_create_staff_event')

    def can_create_special_type_reservation(self, user):
        return self._has_perm(user, 'can_create_special_type_reservation')

    def can_bypass_manual_confirmation(self, user):
        # TODO nobody should bypass?
        return False
        #return self._has_perm(user, 'can_bypass_manual_confirmation')

    def can_create_reservations_for_other_users(self, user):
        return self._has_perm(user, 'can_create_reservations_for_other_users')

    def can_create_overlapping_reservations(self, user):
        return False
        #return self._has_perm(user, 'can_create_overlapping_reservations')

    def can_ignore_max_reservations_per_user(self, user):
        return self._has_perm(user, 'can_ignore_max_reservations_per_user')

    def can_ignore_max_period(self, user):
        return self._has_perm(user, 'can_ignore_max_period')

    # def can_set_custom_price_for_reservations(self, user):
    #     return self._has_perm(user, 'can_set_custom_price_for_reservations')

    def is_access_code_enabled(self):
        return self.access_code_type != Resource.ACCESS_CODE_TYPE_NONE

    def get_reservable_max_days_in_advance(self):
        return self.reservable_max_days_in_advance or self.unit.reservable_max_days_in_advance

    def get_reservable_before(self):
        return create_datetime_days_from_now(self.get_reservable_max_days_in_advance())

    def get_reservable_min_days_in_advance(self):
        return self.reservable_min_days_in_advance or self.unit.reservable_min_days_in_advance

    def get_reservable_after(self):
        return create_datetime_days_from_now(self.get_reservable_min_days_in_advance())

    # def has_rent(self):
    #     return self.products.current().rents().exists()

    def get_supported_reservation_extra_field_names(self, cache=None):
        return []
    #     if not self.reservation_metadata_set_id:
    #         return []
    #     if cache:
    #         metadata_set = cache[self.reservation_metadata_set_id]
    #     else:
    #         metadata_set = self.reservation_metadata_set
    #     return [x.field_name for x in metadata_set.supported_fields.all()]

    def get_required_reservation_extra_field_names(self, cache=None):
        return []
    #     if not self.reservation_metadata_set:
    #         return []
    #     if cache:
    #         metadata_set = cache[self.reservation_metadata_set_id]
    #     else:
    #         metadata_set = self.reservation_metadata_set
    #     return [x.field_name for x in metadata_set.required_fields.all()]
    #
    # def clean(self):
    #     if self.min_period % self.slot_size != datetime.timedelta(0):
    #         raise ValidationError({'min_period': _('This value must be a multiple of slot_size')})


# class ResourceImage(ModifiableModel):
#     TYPES = (
#         ('main', _('Main photo')),
#         ('ground_plan', _('Ground plan')),
#         ('map', _('Map')),
#         ('other', _('Other')),
#     )
#     resource = models.ForeignKey('Resource', verbose_name=_('Resource'), db_index=True,
#                                  related_name='images', on_delete=models.CASCADE)
#     type = models.CharField(max_length=20, verbose_name=_('Type'), choices=TYPES)
#     caption = models.CharField(max_length=100, verbose_name=_('Caption'), null=True, blank=True)
#     # FIXME: name images based on resource, type, and sort_order
#     image = models.ImageField(verbose_name=_('Image'), upload_to='resource_images')
#     image_format = models.CharField(max_length=10)
#     cropping = ImageRatioField('image', '800x800', verbose_name=_('Cropping'))
#     sort_order = models.PositiveSmallIntegerField(verbose_name=_('Sort order'))
#
#     def save(self, *args, **kwargs):
#         self._process_image()
#         if self.sort_order is None:
#             other_images = self.resource.images.order_by('-sort_order')
#             if not other_images:
#                 self.sort_order = 0
#             else:
#                 self.sort_order = other_images[0].sort_order + 1
#         if self.type == "main":
#             other_main_images = self.resource.images.filter(type="main")
#             if other_main_images.exists():
#                 # Demote other main images to "other".
#                 # The other solution would be to raise an error, but that would
#                 # lead to a more awkward API experience (having to first patch other
#                 # images for the resource, then fix the last one).
#                 other_main_images.update(type="other")
#         return super(ResourceImage, self).save(*args, **kwargs)
#
#     def full_clean(self, exclude=(), validate_unique=True):
#         if "image" not in exclude:
#             self._process_image()
#         return super(ResourceImage, self).full_clean(exclude, validate_unique)
#
#     def _process_image(self):
#         """
#         Preprocess the uploaded image file, if required.
#
#         This may transcode the image to a JPEG or PNG if it's not either to begin with.
#
#         :raises InvalidImage: Exception raised if the uploaded file is not valid.
#         """
#         if not self.image:  # No image set - we can't do this right now
#             return
#
#         if self.image_format:  # Assume that if image_format is set, no further processing is required
#             return
#
#         try:
#             img = Image.open(self.image)
#             img.load()
#         except Exception as exc:
#             raise InvalidImage("Image %s not valid (%s)" % (self.image, exc)) from exc
#
#         if img.format not in ("JPEG", "PNG"):  # Needs transcoding.
#             if self.type in ("map", "ground_plan"):
#                 target_format = "PNG"
#                 save_kwargs = {}
#             else:
#                 target_format = "JPEG"
#                 save_kwargs = {"quality": 75, "progressive": True}
#             image_bio = BytesIO()
#             img.save(image_bio, format=target_format, **save_kwargs)
#             self.image = ContentFile(
#                 image_bio.getvalue(),
#                 name=os.path.splitext(self.image.name)[0] + ".%s" % target_format.lower()
#             )
#             self.image_format = target_format
#         else:  # All good -- keep the file as-is.
#             self.image_format = img.format
#
#     def get_full_url(self):
#         base_url = getattr(settings, 'RESPA_IMAGE_BASE_URL', None)
#         if not base_url:
#             return None
#         return base_url.rstrip('/') + reverse('resource-image-view', args=[str(self.pk)])
#
#     def __str__(self):
#         return "%s image for %s" % (self.get_type_display(), str(self.resource))
#
#     class Meta:
#         verbose_name = _('resource image')
#         verbose_name_plural = _('resource images')
#         unique_together = (('resource', 'sort_order'),)


# class ResourceEquipment(ModifiableModel):
#     """This model represents equipment instances in resources.
#
#     Contains data and description related to a specific equipment instance.
#     Data field can be used to set custom attributes for more flexible and fast filtering.
#     """
#     resource = models.ForeignKey(Resource, related_name='resource_equipment', on_delete=models.CASCADE)
#     equipment = models.ForeignKey(Equipment, related_name='resource_equipment', on_delete=models.CASCADE)
#     data = HStoreField(null=True, blank=True)
#     description = models.TextField(blank=True)
#
#     class Meta:
#         verbose_name = pgettext_lazy('singular', 'resource equipment')
#         verbose_name_plural = pgettext_lazy('plural', 'resource equipment')
#
#     def __str__(self):
#         return "%s / %s" % (self.equipment, self.resource)


class ResourceGroup(ModifiableModel, UUIDModelMixin):
    name = models.CharField(verbose_name=_('Name'), max_length=200)
    resources = models.ManyToManyField(Resource, verbose_name=_('Resources'), related_name='groups', blank=True)

    class Meta:
        verbose_name = _('Resource group')
        verbose_name_plural = _('Resource groups')
        permissions = RESOURCE_GROUP_PERMISSIONS
        ordering = ('name',)

    def __str__(self):
        return self.name


class ResourceDailyOpeningHours(models.Model):
    """
    Calculated automatically for each day the resource is open
    """
    resource = models.ForeignKey(
        Resource, related_name='opening_hours', on_delete=models.CASCADE, db_index=True
    )
    open_between = DateTimeRangeField()

    def clean(self):
        super().clean()
        if self.objects.filter(resource=self.resource, open_between__overlaps=self.open_between):
            raise ValidationError(_("Overlapping opening hours"))

    class Meta:
        unique_together = [
            ('resource', 'open_between')
        ]
        # indexes = [
        #     GistIndex(fields=['open_between'])
        # ]

    def __str__(self):
        if isinstance(self.open_between, tuple):
            lower = self.open_between[0]
            upper = self.open_between[1]
        else:
            lower = self.open_between.lower
            upper = self.open_between.upper
        return "%s: %s -> %s" % (self.resource, lower, upper)



class ResourceCapacityPolicy(ModifiableModel, UUIDModelMixin):
    CAPACITY_POLICY_TYPES = (
        ('ABS', _('Absolute value')),
        # ('RATIO', _('Percentage of original capacity'))
    )
    name = models.CharField(verbose_name=_("Name"), max_length=255)
    description = models.TextField(verbose_name=_("Description"), null=True, blank=True)
    value = models.PositiveIntegerField(_("Value"))
    type = models.CharField(choices=CAPACITY_POLICY_TYPES, max_length=20, default='ABS')
    resources = models.ManyToManyField(Resource, verbose_name=_('Resources'), related_name='capacity_policies')

    class Meta:
        verbose_name = _("Capacity policy for resources")
        verbose_name_plural = _("Capacity policies for resources")
        
    def __str__(self):
        return self.name


