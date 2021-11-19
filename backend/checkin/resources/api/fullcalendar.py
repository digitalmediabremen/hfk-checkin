from __future__ import unicode_literals
from .base import register_view
from rest_framework import serializers, exceptions, response, viewsets, mixins
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .reservation import ReservationSerializer, ReservationListViewSet, Reservation, DjangoFilterBackend, \
    ReservationFilterBackend, PastFilterBackend, \
    NeedManualConfirmationFilterBackend, StateFilterBackend, CanApproveFilterBackend
from django_filters import filters
from .resource import ResourceSerializer, ResourceListViewSet, Resource
from django.urls import reverse
from django.http import Http404
from django.core.exceptions import ValidationError
from ..admin.reservation import RESERVATION_STATE_COLORS
from django.utils.translation import gettext
from django.utils.translation import gettext as _
from .resource import deserialize_datetime
from django.db.models import TextChoices


class FullcalendarReservationEventSerializer(ReservationSerializer):
    """
    Serializes reservations.
    Outputs into fullcalendar.io-compatible format.
    """

    start = serializers.DateTimeField(source='begin')
    end = serializers.DateTimeField()
    title = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    id = serializers.CharField(source='uuid')
    resourceId = serializers.CharField(source='resource.uuid')
    classNames = serializers.SerializerMethodField(required=False)
    textColor = serializers.SerializerMethodField(required=False, method_name='get_color')
    borderColor = serializers.SerializerMethodField(required=False, method_name='get_color')

    class Meta:
        model = Reservation
        fields = ['url', 'id', 'identifier', 'start', 'end', 'title','resourceId','classNames','textColor','borderColor']

    def get_url(self, obj):
        return reverse('admin:{0}_{1}_change'.format(obj._meta.app_label, obj._meta.model_name), args=(obj.pk,))

    def get_title(self, obj):
        flags = {
            gettext('has priority'): obj.has_priority,
            gettext('exclusive resource usage'): obj.exclusive_resource_usage,
        }
        flags_str_list = [key for (key, value) in flags.items() if value]
        return "%(title)s%(user)s (%(flags)s%(attendees)s) #%(id)s (%(state)s)" % {
            'title': "\"%s\" " % obj.title if obj.title else "",
            'user':obj.organizer.get_full_name(),
            'attendees': str(obj.number_of_attendees),
            'flags': ', '.join(flags_str_list) + ": " if flags_str_list else "",
            'id': obj.identifier,
            'state': obj.get_state_display(),
            #'description': obj.get_state_display(),
        }

    # FIXME remove render-specific attributes form representation!
    def get_classNames(self, obj):
        class_names = []
        if obj.state not in [Reservation.CONFIRMED]:
            class_names.append('inactive')
        if obj.state in [Reservation.DENIED, Reservation.CANCELLED]:
            class_names.append('canceled')
        current_uuid = self.context['request'].query_params.get('current_uuid', None)
        if current_uuid and str(obj.uuid) == current_uuid:
            class_names.append('current')
        return " ".join(class_names)

    # FIXME remove render-specific attributes form representation!
    def get_color(self, obj):
        try:
            return RESERVATION_STATE_COLORS[obj.state]
        except (KeyError, LookupError):
            return None


class FullcalendarResourceAvailabilityReservationSerializer(FullcalendarReservationEventSerializer):

    """
    Serializes fictitious "availability timeframes", which determine availability times from reservations.
    Outputs into fullcalendar.io-compatible format.
    """

    #title = serializers.CharField(source='status')
    display = serializers.CharField(default='background', read_only=True)

    class Meta:
        model = Reservation
        fields = ['id', 'identifier', 'start', 'end', 'resourceId', 'display']



class FullcalendarReservationEventViewSet(ReservationListViewSet):
    pagination_class = None
    http_method_names = ['get', 'head']
    permission_classes = (IsAdminUser,)
    filter_backends = (ReservationFilterBackend,)

    def get_serializer_class(self):
        return FullcalendarReservationEventSerializer

    def get_user_filtered_queryset(self, queryset):
        # Do not filter Admin Calendar view.
        return queryset

    # def get_serializer_context(self, *args, **kwargs):
    #     return {**super().get_serializer_context(*args, **kwargs), **self.request.query_params}

    def get_queryset(self):
        resource = self.kwargs.get('resource', None)
        resources = self.request.query_params.get('resources', None)
        # only display current reservations
        qs = super().get_queryset()

        if resources is None and resource is None:
            raise exceptions.ParseError("`resource` or `resources` must be defined to retrieve calendar events.")

        try:
            if resource and resource != 'all':
                return qs.filter(resource__pk=resource)
            if resources:
                resources = resources.split('.')
                return qs.filter(resource__uuid__in=resources)
        except (ValidationError, Resource.DoesNotExist):
            raise Http404

        return qs

register_view(FullcalendarReservationEventViewSet, 'calendar/event', base_name='calendarevent')




class AvailabilityStatus(TextChoices):
    free = 'FREE', _('free')
    busy = 'BUSY', _('busy')


# class FullcalendarResourceAvailabilityTimeframeSerializer(serializers.Serializer):
#
#     """
#     Serializes fictitious "availability timeframes", which determine availability times from reservations.
#     Outputs into fullcalendar.io-compatible format.
#     """
#
#     start = serializers.DateTimeField(source='begin')
#     end = serializers.DateTimeField()
#     reservation_count = serializers.IntegerField()
#     number_of_attendances = serializers.IntegerField()
#     total_number_of_attendees = serializers.IntegerField()
#     status = serializers.ChoiceField(AvailabilityStatus.choices)
#     resourceId = serializers.CharField(source='resource_uuid')
#     id = serializers.CharField(source='uuid')
#     title = serializers.CharField(source='status')
#     rendering = serializers.CharField(default='background', read_only=True)
#
#
# class FullcalendarResourceAvailabilityTimeframeViewSet(viewsets.GenericViewSet):
#     pagination_class = None
#     http_method_names = ['get', 'head']
#     permission_classes = (IsAuthenticated,)
#     filter_backends = (ReservationFilterBackend,)
#     queryset = Resource.objects.filter(reservable=True)
#
#     def get_queryset(self):
#         resource = self.request.query_params.get('resource', None)
#         resources = self.request.query_params.get('resources', None)
#         # only display current reservations
#         qs = super().get_queryset()
#
#         if resources is None and resource is None:
#             raise exceptions.ParseError("`resource` or `resources` must be defined to retrieve calendar availability.")
#
#         try:
#             if resources == 'all':
#                 return qs
#             if resource:
#                 return qs.filter(uuid=resource)
#             if resources:
#                 resources = resources.split(',')
#                 return qs.filter(uuid__in=resources)
#         except (ValidationError, Resource.DoesNotExist):
#             raise Http404
#
#         return qs
#
#     def list(self, request, resources=None, *args, **kwargs):
#         #FIXME DUPLICATE of api.resource @action freebusy
#
#         user = request.user
#         query_params = self.request.query_params
#
#         if 'start' not in query_params or 'end' not in query_params:
#             raise exceptions.ParseError("Availability requests require `start` and `end` query parameters.")
#
#         available_start = deserialize_datetime(query_params['start'])
#         available_end = deserialize_datetime(query_params['end'])
#
#         resources = self.get_queryset()
#         availability_result = list()
#         for resource in resources:
#             availability_result += resource.get_availability_from_reservations(available_start, available_end)
#             # TODO cache db result
#         serializer = FullcalendarResourceAvailabilityTimeframeSerializer(availability_result, many=True)
#
#         return response.Response(serializer.data)
#
# register_view(FullcalendarResourceAvailabilityTimeframeViewSet, 'calendar/availability', base_name='calendaravailability')


class FullcalendarResourceSerializer(ResourceSerializer):
    title = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    id = serializers.CharField(source='uuid')
    index = serializers.SerializerMethodField()
    unit_name = serializers.CharField(source='unit.name', default=None, required=False)

    def get_url(self, obj):
        return reverse('admin:{0}_{1}_change'.format(obj._meta.app_label, obj._meta.model_name), args=(obj.pk,))

    def get_title(self, obj):
        return str(obj)

    def get_index(self, obj):
        ordered_uuids = self.context.get('ordered_uuids', None)
        if ordered_uuids:
            return ordered_uuids.index(str(obj.pk))
        return None

    class Meta:
        model = Resource
        fields = ['url', 'id', 'title', 'name', 'display_numbers', 'display_name', 'index', 'capacity', 'unit_name']


class FullcalendarResourceViewSet(ResourceListViewSet):
    pagination_class = None
    http_method_names = ['get', 'head']
    permission_classes = (IsAdminUser,)

    def get_serializer_class(self):
        return FullcalendarResourceSerializer

    def get_resources_from_query_params(self):
        resources_filter = self.request.query_params.get('resources', None)
        if resources_filter:
            return resources_filter.split('.')
        return None

    def get_queryset(self):
        qs = super().get_queryset().filter(reservable=True)
        resources = self.get_resources_from_query_params()
        if resources:
            try:
                return qs.filter(uuid__in=resources)
            except (ValidationError, Resource.DoesNotExist):
                raise Http404
        return qs

    # def get_object(self, *args, **kwargs):
    #     print(self.queryset)
    #     super().get_object(*args, **kwargs)

    # def list(self, request, *args, **kwargs):
    #     super().list(request, *args, **kwargs)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request:
            context['ordered_uuids'] = self.get_resources_from_query_params()
        return context


register_view(FullcalendarResourceViewSet, 'calendar/resource', base_name='calendarresource')