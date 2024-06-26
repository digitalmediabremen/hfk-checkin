import operator
import uuid
from functools import reduce

import arrow
import django_filters
from arrow.parser import ParserError
from .. import settings
from ..models.permissions import NoSuperuserObjectPermissionChecker, ObjectPermissionChecker
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import (
    PermissionDenied, ValidationError as DjangoValidationError
)
from django.db.models import Q
from django.db import transaction
from django.core.exceptions import MultipleObjectsReturned
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, serializers, filters, exceptions, permissions, mixins
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.fields import BooleanField, IntegerField, EmailField
from rest_framework import renderers
from rest_framework.exceptions import NotAcceptable, ValidationError
from rest_framework.settings import api_settings as drf_settings
from rest_framework import status
from rest_framework.response import Response
from django.urls import reverse
from django.utils.functional import cached_property
from rest_framework.decorators import action
from django.utils.timezone import localtime
import warnings

# from munigeo import api as munigeo_api
from .resource import ResourceSerializer, ResourceListViewSet

from ..models import (
    Reservation, Resource, RESERVATION_EXTRA_FIELDS,
    # ReservationMetadataSet, ReservationCancelReasonCategory, ReservationCancelReason
)
from ..models.attendance import Attendance
from ..models.reservation import StaticReservationPurpose
# from resources.pagination import ReservationPagination
# from resources.models.utils import generate_reservation_xlsx
from ..models.utils import get_object_or_none

from ..auth import is_general_admin, is_staff
from .base import (
    NullableDateTimeField, TranslatedModelSerializer, register_view, DRFFilterBooleanWidget,
    ExtraDataMixin, ModifiableModelSerializerMixin, NullableCharField
)

ResourcesBrowsableAPIRenderer = renderers.BrowsableAPIRenderer
# from respa.renderers import ResourcesBrowsableAPIRenderer

User = get_user_model()

# FIXME: Make this configurable?
USER_ID_ATTRIBUTE = 'id'
try:
    User._meta.get_field('uuid')
    USER_ID_ATTRIBUTE = 'uuid'
except Exception:
    pass


# class UserSerializer(TranslatedModelSerializer):
#     display_name = serializers.ReadOnlyField(source='get_display_name')
#     email = serializers.ReadOnlyField()
#
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#
#         if USER_ID_ATTRIBUTE == 'id':
#             # id field is read_only by default, that needs to be changed
#             # so that the field will be validated
#             self.fields['id'] = IntegerField(label='ID')
#         else:
#             # if the user id attribute isn't id, modify the id field to point to the right attribute.
#             # the field needs to be of the right type so that validation works correctly
#             model_field_type = type(get_user_model()._meta.get_field(USER_ID_ATTRIBUTE))
#             serializer_field = self.serializer_field_mapping[model_field_type]
#             self.fields['id'] = serializer_field(source=USER_ID_ATTRIBUTE, label='ID')
#
#     class Meta:
#         model = get_user_model()
#         fields = ('id', 'display_name', 'email')
#

class AttendanceSerializer(serializers.ModelSerializer):
    profile_id = serializers.ReadOnlyField(source='user.id', read_only=True)
    display_name = serializers.ReadOnlyField(source='get_display_name', read_only=True)
    is_external = serializers.BooleanField(source='is_external_user', allow_null=False, read_only=True, initial=True,
                                           default=True)
    is_organizer = serializers.BooleanField(read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    phone = serializers.CharField(source='user.phone', write_only=True)

    # email = serializers.EmailField(source='user.email', write_only=True)

    class Meta:
        model = Attendance
        fields = ('uuid', 'profile_id', 'first_name', 'last_name', 'display_name', 'phone', 'state', 'is_external',
                  'is_organizer')

    def validate(self, data):
        # profile_data = data.pop('user')
        # profile_data = ProfileSerializer.validate(profile_data)
        # data['user'] = profile_data
        return data

    def create(self, validated_data):
        from checkin.users.api import UserProfileSerializer
        # create Profile (attr: user) first, pass user instance to super().create(data)
        user_data = validated_data.pop('user')
        user_instance = UserProfileSerializer().create(validated_data={'profile': user_data},
                                                       profile_extra={'is_external': True})
        # FIXME Attendance.user is currently a Profile object. Either it should be .user = type(User) or .profile = type(Profile)!
        validated_data['user'] = user_instance.profile
        return super().create(validated_data=validated_data)


def not_in_past_validator(value):
    if value < timezone.now():
        raise serializers.ValidationError('Cannot make reservations in the past.')

class ReservationSerializer(ExtraDataMixin, TranslatedModelSerializer, ModifiableModelSerializerMixin):
    from checkin.users.api import SimpleUserProfileSerializer
    # uuid = serializers.ReadOnlyField()
    identifier = serializers.ReadOnlyField(source='short_uuid')
    resource = ResourceSerializer(read_only=True)
    resource_uuid = serializers.PrimaryKeyRelatedField(queryset=ResourceListViewSet.queryset, source='resource')
    begin = NullableDateTimeField()
    end = NullableDateTimeField(validators=[not_in_past_validator])
    # organizer = EmailField(source='user.email', read_only=True) # or depending on permission
    # TODO do all users have permission to show / see organizers?!
    organizer = SimpleUserProfileSerializer(source='user', read_only=True)
    is_own = serializers.SerializerMethodField()
    state = serializers.ReadOnlyField()
    state_verbose = serializers.ReadOnlyField(source='get_state_verbose')
    purpose = NullableCharField(allow_null=True, allow_blank=False,
                                required=False)  # choices=StaticReservationPurpose.choices) # will limit values!
    link = NullableCharField(allow_null=True, allow_blank=False, required=False)
    title = NullableCharField(allow_null=True, allow_blank=False, required=False)
    need_manual_confirmation = serializers.ReadOnlyField()
    attendees = AttendanceSerializer(many=True, source='attendance_set', required=False)
    # comment or reason or usage
    number_of_attendees = serializers.IntegerField(read_only=True)
    number_of_extra_attendees = serializers.IntegerField(initial=0, default=0, required=False)
    # has_priority = serializers.BooleanField(initial=False)
    agreed_to_phone_contact = serializers.BooleanField(default=False, required=False)
    exclusive_resource_usage = serializers.BooleanField(initial=False, default=False, required=False)
    organizer_is_attending = serializers.BooleanField(initial=True, default=True, write_only=True)
    # user_permissions = serializers.SerializerMethodField()
    # cancel_reason = ReservationCancelReasonSerializer(required=False)

    # TODO Patch?
    patchable_fields = ['state']  # , 'cancel_reason']

    class Meta:
        model = Reservation
        fields = [
                     'url', 'uuid', 'identifier', 'resource', 'resource_uuid', 'organizer', 'begin', 'end', 'message',
                     'title', 'link', 'purpose',
                     'is_own', 'state', 'state_verbose', 'need_manual_confirmation',
                     'attendees', 'number_of_attendees', 'number_of_extra_attendees',  # 'cancel_reason'
                 ] + list(RESERVATION_EXTRA_FIELDS) + list(ModifiableModelSerializerMixin.Meta.fields)
        read_only_fields = list(RESERVATION_EXTRA_FIELDS)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        data = self.get_initial()
        resource = None

        # FIXME using intital data to set resource fails
        # # try to find out the related resource using initial data if that is given
        # resource_pk = data.get('resource') if data else None
        # if resource_pk:
        #     resource = get_object_or_none(Resource, pk=resource_pk)

        # if that didn't work out use the reservation's old resource if such exists
        if not resource:
            if isinstance(self.instance, Reservation) and isinstance(self.instance.resource, Resource):
                resource = self.instance.resource

        # set supported and required extra fields
        if resource:
            cache = self.context.get('reservation_metadata_set_cache')
            supported = resource.get_supported_reservation_extra_field_names(cache=cache)
            required = resource.get_required_reservation_extra_field_names(cache=cache)

            # staff events have less requirements
            if self.context.get('request', None):
                request_user = self.context['request'].user
                is_staff_event = data.get('staff_event', False)

                if is_staff_event and resource.can_create_staff_event(request_user):
                    required = {'reserver_name', 'event_description'}

            # we don't need to remove a field here if it isn't supported, as it will be read-only and will be more
            # easily removed in to_representation()
            for field_name in supported:
                self.fields[field_name].read_only = False

            for field_name in required:
                self.fields[field_name].required = True

        self.context.update({'resource': resource})

    def create(self, validated_data):
        attendances_data = validated_data.pop('attendance_set', [])
        reservation = super().create(validated_data)
        for attendance_data in attendances_data:
            attendance_data['reservation'] = reservation
            AttendanceSerializer().create(validated_data=attendance_data)
        return reservation

    def warn_and_serialize(self, request, **kwargs):
        # FIXME unify with corresponding methods ReservationAdmin / Reservation. DRY.
        self.is_valid()

        result = {
            'errors': dict(),  # serializer.errors
            'warnings': list()  # custom models-specific warnings
        }

        assert hasattr(self, '_errors'), (
            'You must call `.is_valid()` before calling `.validate_and_warn()`.'
        )

        if self.errors:
            result['errors'] = self.errors
            # error_list = result['errors']
            # for key, item in self.errors.items():
            #     error_list.append({key: item})

            return result
            # finish here since validation needs validated_data

        validated_data = {**self.validated_data, **kwargs}
        # remove attendance_set_data, see create() and update()
        attendance_set_data = validated_data.pop('attendance_set', [])

        obj = self.Meta.model(**validated_data)
        warning_list = result['warnings']
        with warnings.catch_warnings(record=True) as warns:
            try:
                obj.validate_reservation()
            except ValidationError as e:
                warning_serialized = ReservationValidationResultItemSerializer(e)
                warning_list.append(warning_serialized.data)
                # warning_list.append(e)
            for w in warns:
                warning_serialized = ReservationValidationResultItemSerializer(w)
                warning_list.append(warning_serialized.data)
                # warning_list.append(w)

        return result

    def get_extra_fields(self, includes, context):
        from .resource import ResourceInlineSerializer

        """ Define extra fields that can be included via query parameters. Method from ExtraDataMixin."""
        extra_fields = {}
        if 'resource_detail' in includes:
            extra_fields['resource'] = ResourceInlineSerializer(read_only=True, context=context)
        return extra_fields

    def validate_state(self, value):
        instance = self.instance
        request_user = self.context['request'].user

        # new reservations will get their value regardless of this value
        if not instance:
            return value

        # state not changed
        if instance.state == value:
            return value

        if instance.resource.can_approve_reservations(request_user):
            allowed_states = (Reservation.REQUESTED, Reservation.CONFIRMED,
                              Reservation.DENIED, Reservation.WAITING_FOR_PAYMENT)
            if instance.state in allowed_states and value in allowed_states:
                return value

        if instance.can_modify(request_user) and value == Reservation.CANCELLED:
            return value

        raise ValidationError(_('Illegal state change'))

    def extend_data_with_default_values(self, data):
        request_user = self.context['request'].user
        override_data = {'created_by': request_user, 'modified_by': request_user}
        if 'user' not in data:
            override_data['user'] = request_user
        override_data['state'] = Reservation.CREATED
        return {**data, **override_data}

    def validate(self, data):
        reservation = self.instance
        request_user = self.context['request'].user

        # this check is probably only needed for PATCH
        # FIXME this fails
        try:
            resource = data['resource']
        except KeyError:
            resource = reservation.resource

        # if not resource.can_make_reservations(request_user):
        #     raise PermissionDenied(_('You are not allowed to make reservations in this resource.'))

        if 'end' in data and data['end'] < timezone.now():
            raise ValidationError(_('You cannot make a reservation in the past'))

        if not (resource.can_modify_reservations(request_user)):  # or is_general_admin(request_user)):
            # allow do make collision bookings for resource "manager"
            collisions_type_blocked = resource.reservations.current().overlaps(data['begin'], data['end']).filter(
                type=Reservation.TYPE_BLOCKED)
            # if original_reservation:
            #     collisions_type_blocked = collisions_type_blocked.exclude(pk=original_reservation)
            if collisions_type_blocked.exists():
                raise ValidationError(_("This resource is blocked during this time. Sorry."))

        if not resource.can_ignore_opening_hours(request_user):
            reservable_before = resource.get_reservable_before()
            if reservable_before and data['begin'] >= reservable_before:
                raise ValidationError(_('The resource is reservable only before %(datetime)s' %
                                        {'datetime': reservable_before}))
            reservable_after = resource.get_reservable_after()
            if reservable_after and data['begin'] < reservable_after:
                raise ValidationError(_('The resource is reservable only after %(datetime)s' %
                                        {'datetime': reservable_after}))

        # normal users cannot make reservations for other people
        if not resource.can_create_reservations_for_other_users(request_user):
            data.pop('user', None)

        # Check user specific reservation restrictions relating to given period.
        resource.validate_reservation_period(reservation, request_user, data=data)

        if data.get('staff_event', False):
            if not resource.can_create_staff_event(request_user):
                raise ValidationError(dict(staff_event=_('Only allowed to be set by resource managers')))

        if 'type' in data:
            if (data['type'] != Reservation.TYPE_NORMAL and
                    not resource.can_create_special_type_reservation(request_user)):
                raise ValidationError({'type': _('You are not allowed to make a reservation of this type')})

        if 'comments' in data:
            if not resource.can_comment_reservations(request_user):
                raise ValidationError(dict(comments=_('Only allowed to be set by staff members')))

        if 'access_code' in data:
            if data['access_code'] is None:
                data['access_code'] = ''

            access_code_enabled = resource.is_access_code_enabled()

            if not access_code_enabled and data['access_code']:
                raise ValidationError(dict(access_code=_('This field cannot have a value with this resource')))

            if access_code_enabled and reservation and data['access_code'] != reservation.access_code:
                raise ValidationError(dict(access_code=_('This field cannot be changed')))

        # add user, created_by, modified_by and state to data
        data = self.extend_data_with_default_values(data)

        # remove attendances for Reservation validation
        # Reservation.attendees.set() or add() must be called explicitly and can not validate form **data
        # TODO validate attendances ?
        attendance_set_data = data.pop('attendance_set', [])

        with transaction.atomic():

            # Mark begin of a critical section. Subsequent calls with this same resource will block here until the first
            # request is finished. This is needed so that the validations and possible reservation saving are
            # executed in one block and concurrent requests cannot be validated incorrectly.
            Resource.objects_without_annotations.select_for_update().get(pk=resource.pk)

            # Check maximum number of active reservations per user per resource.
            # Only new reservations are taken into account ie. a normal user can modify an existing reservation
            # even if it exceeds the limit. (one that was created via admin ui for example).
            if reservation is None:
                resource.validate_max_reservations_per_user(request_user)

            if self.context['request'] and self.context['request'].method == 'PATCH':
                for key, val in data.items():
                    if key not in self.patchable_fields:
                        raise ValidationError(_('Patching of field %(field)s is not allowed' % {'field': key}))
            else:
                # Run model clean
                instance = Reservation(**data)

                try:
                    instance.clean(original_reservation=reservation, user=request_user)
                except DjangoValidationError as exc:

                    # Convert Django ValidationError to DRF ValidationError so that in the response
                    # field specific error messages are added in the field instead of in non_field_messages.
                    if not hasattr(exc, 'error_dict'):
                        raise ValidationError(exc)
                    error_dict = {}
                    for key, value in exc.error_dict.items():
                        error_dict[key] = [error.message for error in value]
                    raise ValidationError(error_dict)

            # TODO
            data['attendance_set'] = attendance_set_data
            return data

    def to_internal_value(self, data):
        from checkin.users.api import UserProfileSerializer as UserSerializer
        # FIXME why copy and not get('user', default=None) see Rollbar #44
        user_data = data.copy().pop('user', None)  # handle user manually
        deserialized_data = super().to_internal_value(data)

        # validate user and convert it to User object
        if user_data:
            UserSerializer(data=user_data).is_valid(raise_exception=True)
            try:
                deserialized_data['user'] = User.objects.get(**{USER_ID_ATTRIBUTE: user_data['id']})
            except User.DoesNotExist:
                raise ValidationError({
                    'user': {
                        'id': [_('Invalid pk "{pk_value}" - object does not exist.').format(pk_value=user_data['id'])]
                    }
                })
        return deserialized_data

    def to_representation(self, instance):
        data = super(ReservationSerializer, self).to_representation(instance)
        resource = instance.resource
        prefetched_user = self.context.get('prefetched_user', None)
        user = prefetched_user or self.context['request'].user

        # if self.context['request'].accepted_renderer.format == 'xlsx':
        #     # Return somewhat different data in case we are dealing with xlsx.
        #     # The excel renderer needs datetime objects, so begin and end are passed as objects
        #     # to avoid needing to convert them back and forth.
        #     data.update(**{
        #         'unit': resource.unit.name,  # additional
        #         'resource': resource.name,  # resource name instead of id
        #         'begin': instance.begin,  # datetime object
        #         'end': instance.end,  # datetime object
        #         'user': instance.user.email if instance.user else '',  # just email
        #         'created_at': instance.created_at
        #     })

        if 'comments' in data and not resource.can_access_reservation_comments(user):
            del data['comments']

        # FIXME can_view_reservation_user currently not used
        # if 'organizer' in data and not resource.can_view_reservation_user(user):
        #     del data['organizer']

        # if instance.are_extra_fields_visible(user):
        #     cache = self.context.get('reservation_metadata_set_cache')
        #     supported_fields = set(resource.get_supported_reservation_extra_field_names(cache=cache))
        # else:
        #     del data['cancel_reason']
        #     supported_fields = set()

        # for field_name in RESERVATION_EXTRA_FIELDS:
        #     if field_name not in supported_fields:
        #         data.pop(field_name, None)

        if not (resource.is_access_code_enabled() and instance.can_view_access_code(user)):
            data.pop('access_code', default=None)

        if 'access_code' in data and data['access_code'] == '':
            data['access_code'] = None

        if instance.can_view_catering_orders(user):
            data['has_catering_order'] = instance.catering_orders.exists()

        return data

    def update(self, instance, validated_data):
        request = self.context['request']

        # cancel_reason = validated_data.pop('cancel_reason', None)
        new_state = validated_data.pop('state', instance.state)

        validated_data['modified_by'] = request.user
        reservation = super().update(instance, validated_data)

        if new_state in [Reservation.DENIED, Reservation.CANCELLED]:  # and cancel_reason:
            if hasattr(instance, 'cancel_reason'):
                instance.cancel_reason.delete()

            # cancel_reason['reservation'] = reservation
            # reservation.cancel_reason = ReservationCancelReason(**cancel_reason)
            # reservation.cancel_reason.save()

        # This instance is somehow missing order relation after calling super().update(). Refreshing fixes this.
        reservation.refresh_from_db()

        reservation.set_state(new_state, request.user)

        return reservation

    def get_is_own(self, obj):
        return obj.user == self.context['request'].user

    def get_user_permissions(self, obj):
        request = self.context.get('request')
        prefetched_user = self.context.get('prefetched_user', None)
        user = prefetched_user or request.user

        can_modify_and_delete = obj.can_modify(user) if request else False
        return {
            'can_modify': can_modify_and_delete,
            'can_delete': can_modify_and_delete,
        }


class UserFilterBackend(filters.BaseFilterBackend):
    """
    Filter by user uuid and by is_own.
    """

    def filter_queryset(self, request, queryset, view):
        user = request.query_params.get('user', None)
        if user:
            try:
                user_uuid = uuid.UUID(user)
            except ValueError:
                raise exceptions.ParseError(_('Invalid value in filter %(filter)s') % {'filter': 'user'})
            queryset = queryset.filter(user__uuid=user_uuid)

        if not request.user.is_authenticated:
            return queryset

        is_own = request.query_params.get('is_own', None)
        if is_own is not None:
            is_own = is_own.lower()
            if is_own in ('true', 't', 'yes', 'y', '1'):
                queryset = queryset.filter(user=request.user)
            elif is_own in ('false', 'f', 'no', 'n', '0'):
                queryset = queryset.exclude(user=request.user)
            else:
                raise exceptions.ParseError(_('Invalid value in filter %(filter)s') % {'filter': 'is_own'})
        return queryset


class PastFilterBackend(filters.BaseFilterBackend):
    """
    Default: Exclude reservations in the past. (future only)
    With past=True, show past only.
    With all=True, show all.
    """

    def filter_queryset(self, request, queryset, view):
        all = request.query_params.get('all', 'false')
        all = BooleanField().to_internal_value(all)
        past = request.query_params.get('past', 'false')
        past = BooleanField().to_internal_value(past)
        now = timezone.now()
        if past:
            return queryset.filter(end__lte=now)
        elif not all:
            return queryset.filter(end__gte=now)
        return queryset


class ReservationFilterBackend(filters.BaseFilterBackend):
    """
    Filter reservations by time.
    """

    def filter_queryset(self, request, queryset, view):
        params = request.query_params
        times = {}
        past = False

        for name in ('start', 'end'):
            if name not in params:
                continue
            # whenever date filtering is in use, include past reservations
            past = True
            try:
                times[name] = arrow.get(params[name]).to('utc').datetime
            except ParserError:
                raise exceptions.ParseError("'%s' must be a timestamp in ISO 8601 format" % name)
        is_detail_request = 'pk' in request.parser_context['kwargs']
        # moved to PastFilterBackend
        # if not past and not is_detail_request:
        #     past = params.get('all', 'false')
        #     past = BooleanField().to_internal_value(past)
        #     if not past:
        #         now = timezone.now()
        #         queryset = queryset.filter(end__gte=now)
        if times.get('start', None):
            queryset = queryset.filter(end__gte=times['start'])
        if times.get('end', None):
            queryset = queryset.filter(begin__lte=times['end'])
        return queryset


class NeedManualConfirmationFilterBackend(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        filter_value = request.query_params.get('need_manual_confirmation', None)
        if filter_value is not None:
            need_manual_confirmation = BooleanField().to_internal_value(filter_value)
            return queryset.filter(resource__need_manual_confirmation=need_manual_confirmation)
        return queryset


class StateFilterBackend(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        state = request.query_params.get('state', None)
        if state:
            queryset = queryset.filter(state__in=state.replace(' ', '').split(','))
        return queryset


class CanApproveFilterBackend(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        filter_value = request.query_params.get('can_approve', None)
        if filter_value:
            queryset = queryset.filter(resource__need_manual_confirmation=True)
            allowed_resources = Resource.objects.with_perm('can_approve_reservation', request.user)
            can_approve = BooleanField().to_internal_value(filter_value)
            if can_approve:
                queryset = queryset.filter(resource__in=allowed_resources)
            else:
                queryset = queryset.exclude(resource__in=allowed_resources)
        return queryset


class ReservationFilterSet(django_filters.rest_framework.FilterSet):
    class Meta:
        model = Reservation
        fields = ('event_subject', 'host_name', 'reserver_name', 'resource_name', 'is_favorite_resource', 'unit')

    @property
    def qs(self):
        qs = super().qs
        user = self.request.user
        query_params = set(self.request.query_params)

        # if any of the extra field related filters are used, restrict results to reservations
        # the user has right to see
        if bool(query_params & set(RESERVATION_EXTRA_FIELDS)):
            qs = qs.extra_fields_visible(user)

        if 'has_catering_order' in query_params:
            qs = qs.catering_orders_visible(user)

        return qs

    # TODO update query
    event_subject = django_filters.CharFilter(lookup_expr='icontains')
    host_name = django_filters.CharFilter(lookup_expr='icontains')
    reserver_name = django_filters.CharFilter(lookup_expr='icontains')
    resource_name = django_filters.CharFilter(field_name='resource', lookup_expr='name__icontains')
    is_favorite_resource = django_filters.BooleanFilter(method='filter_is_favorite_resource',
                                                        widget=DRFFilterBooleanWidget)
    resource_group = django_filters.Filter(field_name='resource__groups__identifier', lookup_expr='in',
                                           widget=django_filters.widgets.CSVWidget, distinct=True)
    unit = django_filters.CharFilter(field_name='resource__unit__uuid')
    has_catering_order = django_filters.BooleanFilter(method='filter_has_catering_order', widget=DRFFilterBooleanWidget)
    resource = django_filters.Filter(lookup_expr='in', widget=django_filters.widgets.CSVWidget)

    reserver_info_search = django_filters.CharFilter(method="filter_reserver_info_search")

    def filter_is_favorite_resource(self, queryset, name, value):
        user = self.request.user

        if not user.is_authenticated:
            return queryset.none() if value else queryset

        filtering = {'resource__favorited_by': user}
        return queryset.filter(**filtering) if value else queryset.exclude(**filtering)

    def filter_has_catering_order(self, queryset, name, value):
        return queryset.exclude(catering_orders__isnull=value)

    def filter_reserver_info_search(self, queryset, name, value):
        """
        A partial copy of rest_framework.filters.SearchFilter.filter_queryset.
        Needed due to custom filters applied to queryset within this ReservationFilterSet.

        Does not support comma separation of values, i.e. '?reserver_info_search=foo,bar' will
        be considered as one string - 'foo,bar'.
        """
        if not value:
            return queryset

        fields = ('user__first_name', 'user__last_name', 'user__email')
        conditions = []
        for field in fields:
            conditions.append(Q(**{field + '__icontains': value}))

        # assume that first_name and last_name were provided if empty space was found
        if ' ' in value and value.count(' ') == 1:
            name1, name2 = value.split()
            filters = Q(
                user__first_name__icontains=name1,
                user__last_name__icontains=name2,
            ) | Q(
                user__first_name__icontains=name2,
                user__last_name__icontains=name1,
            )
            conditions.append(filters)

        return queryset.filter(reduce(operator.or_, conditions))


class ReservationPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.can_view(request.user)
        return obj.can_modify(request.user)


# class ReservationExcelRenderer(renderers.BaseRenderer):
#     media_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
#     format = 'xlsx'
#     charset = None
#     render_style = 'binary'
#
#     def render(self, data, media_type=None, renderer_context=None):
#         if not renderer_context or renderer_context['response'].status_code == 404:
#             return bytes()
#         if renderer_context['view'].action == 'retrieve':
#             return generate_reservation_xlsx([data])
#         elif renderer_context['view'].action == 'list':
#             return generate_reservation_xlsx(data['results'])
#         else:
#             return NotAcceptable()


class ReservationCacheMixin:
    def _preload_permissions(self):
        units = set()
        resource_groups = set()
        resources = set()
        checker = NoSuperuserObjectPermissionChecker(self.request.user)

        for rv in self._page:
            resources.add(rv.resource)
            rv.resource._permission_checker = checker

        for res in resources:
            if res.unit:
                units.add(res.unit)
            for g in res.groups.all():
                resource_groups.add(g)

        if units:
            checker.prefetch_perms(units)
        if resource_groups:
            checker.prefetch_perms(resource_groups)
        if resources:
            checker.prefetch_perms(resources)

    def _get_cache_context(self):
        context = {}
        # set_list = ReservationMetadataSet.objects.all().prefetch_related('supported_fields', 'required_fields')
        # context['reservation_metadata_set_cache'] = {x.pk: x for x in set_list}

        self._preload_permissions()
        return context


class ReservationViewSetMixin(ReservationCacheMixin):
    queryset = Reservation.objects.select_related('user', 'user__profile') \
        .prefetch_related('resource__groups', 'attendance_set', 'attendance_set__user') \
        .order_by('begin', 'resource__unit__name', 'resource__name')
    # .prefetch_related('catering_orders')\
    if getattr(settings, 'RESPA_PAYMENTS_ENABLED', False):
        queryset = queryset.prefetch_related('order', 'order__order_lines', 'order__order_lines__product')
    filter_backends = (
    DjangoFilterBackend, filters.OrderingFilter, UserFilterBackend, ReservationFilterBackend, PastFilterBackend, \
    NeedManualConfirmationFilterBackend, StateFilterBackend, CanApproveFilterBackend)
    filterset_class = ReservationFilterSet
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, ReservationPermission)
    renderer_classes = (renderers.JSONRenderer, ResourcesBrowsableAPIRenderer)  # , ReservationExcelRenderer)
    # pagination_class = ReservationPagination
    authentication_classes = (
            list(drf_settings.DEFAULT_AUTHENTICATION_CLASSES) +
            [TokenAuthentication, SessionAuthentication])
    ordering_fields = ('begin',)

    def get_serializer_class(self):
        if getattr(settings, 'RESPA_PAYMENTS_ENABLED', False):
            from payments.api.reservation import PaymentsReservationSerializer  # noqa
            return PaymentsReservationSerializer
        else:
            return ReservationSerializer

    def get_serializer(self, *args, **kwargs):
        if 'data' not in kwargs and len(args) == 1:
            # It's a read operation
            instance_or_page = args[0]
            if isinstance(instance_or_page, Reservation):
                self._page = [instance_or_page]
            else:
                self._page = instance_or_page

        return super().get_serializer(*args, **kwargs)

    @cached_property
    def request_user_object(self):
        return get_user_model().objects.get(pk=self.request.user.pk)  # .prefetch_related('profile')
        # .prefetch_related('unit_authorizations', 'unit_group_authorizations__subject__members')

    def get_serializer_context(self, *args, **kwargs):
        context = super().get_serializer_context(*args, **kwargs)
        if hasattr(self, '_page'):
            context.update(self._get_cache_context())

        if self.request:
            request_user = self.request.user

            if request_user.is_authenticated:
                prefetched_user = self.request_user_object  # .prefetch_related('profile')
                # .prefetch_related('unit_authorizations', 'unit_group_authorizations__subject__members')

                context['prefetched_user'] = prefetched_user

        return context

    def get_user_filtered_queryset(self, queryset):
        user = self.request.user
        if not user or not user.is_authenticated:
            return queryset.none()

        # General Administrators can see all reservations
        # does not make sense for current forntend implementation
        # FIXME move to filter with query param
        # if is_staff(user):
        #     return queryset

        # normal users can see only their own reservations and reservations that are confirmed, requested or
        # waiting for payment
        # filters = Q(state__in=(Reservation.CONFIRMED, Reservation.REQUESTED, Reservation.WAITING_FOR_PAYMENT))
        # if user.is_authenticated:
        #     filters |= Q(user=user)
        queryset = queryset.filter(user=user)

        queryset = queryset.filter(resource__in=Resource.objects.visible_for(user))

        return queryset

    def get_queryset(self):
        queryset = super().get_queryset()
        return self.get_user_filtered_queryset(queryset)

    def perform_create(self, serializer):
        data = serializer.validated_data
        # data = serializer.extend_validated_data_on_create(serializer.validated_data)
        instance = serializer.save(**data)
        resource = instance.resource

        if not resource.reservable:
            raise ValidationError('Reservations for this resource are disabled.')

        # if resource.need_manual_confirmation and not resource.can_bypass_manual_confirmation(self.request.user):
        # FIXME auto confirmation
        new_state = Reservation.REQUESTED
        new_state = instance.get_automatic_state(user=self.request.user, default_state=new_state)
        # else:
        # new_state = Reservation.CONFIRMED
        # else:
        #     if instance.get_order():
        #         new_state = Reservation.WAITING_FOR_PAYMENT

        instance.try_to_set_state(new_state, self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.end < timezone.now():
            raise ValidationError(_("Can not cancel event in the past."))
        self.perform_destroy(instance)
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_destroy(self, instance):
        instance.set_state(Reservation.CANCELLED, self.request.user)

    # def list(self, request, *args, **kwargs):
    #     response = super().list(request, *args, **kwargs)
    #     if request.accepted_renderer.format == 'xlsx':
    #         response['Content-Disposition'] = 'attachment; filename={}.xlsx'.format(_('reservations'))
    #     return response
    #
    # def retrieve(self, request, *args, **kwargs):
    #     response = super().retrieve(request, *args, **kwargs)
    #     if request.accepted_renderer.format == 'xlsx':
    #         response['Content-Disposition'] = 'attachment; filename={}-{}.xlsx'.format(_('reservation'), kwargs['pk'])
    #     return response

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        # Perform the lookup filtering.
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        assert lookup_url_kwarg in self.kwargs, (
                'Expected view %s to be called with a URL keyword argument '
                'named "%s". Fix your URL conf, or set the `.lookup_field` '
                'attribute on the view correctly.' %
                (self.__class__.__name__, lookup_url_kwarg)
        )
        filter_kwargs = {self.lookup_field + '__istartswith': self.kwargs[lookup_url_kwarg]}
        try:
            obj = get_object_or_404(queryset, **filter_kwargs)
        except MultipleObjectsReturned:
            raise Http404

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)

        return obj

    @action(detail=False, methods=['post'])
    def validate(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        ew_list = serializer.warn_and_serialize(request)
        serialized_warnings = ew_list
        # serialized_warnings = ReservationValidationResultItemSerializer(ew_list, many=True)
        # serialized_warnings = ReservationValidationResultSerializer(data={
        #     'results': ew_list,
        # })
        # serialized_warnings.is_valid()
        # self.perform_create(serializer)
        # headers = self.get_success_headers(serializer.data)
        return Response(serialized_warnings, status=status.HTTP_200_OK)


# class ReservationCancelReasonCategoryViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = ReservationCancelReasonCategory.objects.all()
#     filter_backends = (DjangoFilterBackend,)
#     serializer_class = ReservationCancelReasonCategorySerializer
#     filterset_fields = ['reservation_type']
#     pagination_class = None

# class ReservationValidationSerializer(serializers.Serializer):
#     count = IntegerField()
#


class ReservationValidationResultItemSerializer(serializers.Serializer):
    # "type": "ResourceCapacityResourceExceededWarning",
    # "level": "warning" | "error",
    # "detail": "Die Kapazität dieser Resource ist erschöpft.",
    # "context": ["datetime", "resource"],
    type = serializers.CharField(required=False, default="UnknownError")
    level = serializers.CharField(required=False, default="error")
    detail = serializers.CharField(required=True)
    context = serializers.ListField(required=True, allow_empty=True)

    def to_representation(self, instance):
        ''' convert Exception or Warnings to representation '''
        if isinstance(instance, Exception):
            return {
                'type': type(instance),
                'detail': str(instance),
                'level': 'error',
            }
        elif isinstance(instance, warnings.WarningMessage):
            return {
                'type': str(instance.category.__name__),
                'detail': str(instance.message.args[0]),
                'level': 'warning',
                'context': instance.message.ui_context,
            }
        elif isinstance(instance, Warning):
            return {
                'type': str(instance.category),
                'detail': str(instance.message),
                'level': 'warning',
            }
        else:
            return {
                'detail': str(instance),
                'level': 'error',
            }


class ReservationValidationResultSerializer(serializers.Serializer):
    results = serializers.ListField(child=ReservationValidationResultItemSerializer())



class ReservationListViewSet(ReservationViewSetMixin, mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    pass


class ReservationDetailViewSet(ReservationViewSetMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    filter_backends = (DjangoFilterBackend, ReservationFilterBackend,)


register_view(ReservationDetailViewSet, 'reservation')
register_view(ReservationListViewSet, 'reservation')
# register_view(ReservationCancelReasonCategoryViewSet, 'cancel_reason_category')
