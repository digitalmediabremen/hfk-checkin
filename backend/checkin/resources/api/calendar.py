from __future__ import unicode_literals
from .base import register_view
from rest_framework import serializers
from rest_framework.permissions import IsAdminUser
from .reservation import ReservationSerializer, ReservationListViewSet, Reservation, DjangoFilterBackend, \
    ReservationFilterBackend, PastFilterBackend, \
    NeedManualConfirmationFilterBackend, StateFilterBackend, CanApproveFilterBackend
from django_filters import filters
from .resource import ResourceSerializer, ResourceListViewSet, Resource
from django.urls import reverse
from django.http import Http404
from django.core.exceptions import ValidationError

class ReservationCalendarEventSerializer(ReservationSerializer):
    start = serializers.DateTimeField(source='begin')
    end = serializers.DateTimeField()
    title = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    id = serializers.CharField(source='uuid')
    resourceId = serializers.CharField(source='resource.uuid')
    classNames = serializers.SerializerMethodField(required=False)

    def get_url(self, obj):
        return reverse('admin:{0}_{1}_change'.format(obj._meta.app_label, obj._meta.model_name), args=(obj.pk,))

    def get_title(self, obj):
        return "%(user)s (%(attendees)d) (%(id)s)" % {
            'user':obj.organizer,
            'attendees':obj.number_of_attendees,
            'id': obj.identifier
        }

    # FIXME remove render-specific attributes form representation!
    def get_classNames(self, obj):
        class_names = []
        if obj.state not in [Reservation.CONFIRMED]:
            class_names.append('inactive')
        current_uuid = self.context['request'].query_params.get('current_uuid', None)
        if current_uuid and str(obj.uuid) == current_uuid:
            class_names.append('current')
        return " ".join(class_names)

    class Meta:
        model = Reservation
        fields = ['url', 'id', 'identifier', 'start', 'end', 'title','resourceId','classNames']


class ReservationCalendarViewSet(ReservationListViewSet):
    pagination_class = None
    http_method_names = ['get', 'head']
    permission_classes = (IsAdminUser,)
    filter_backends = (ReservationFilterBackend,)


    def get_serializer_class(self):
        return ReservationCalendarEventSerializer

    def get_user_filtered_queryset(self, queryset):
        # Do not filter Admin Calendar view.
        return queryset

    # def get_serializer_context(self, *args, **kwargs):
    #     return {**super().get_serializer_context(*args, **kwargs), **self.request.query_params}

    def get_queryset(self):
        resource = self.kwargs.get('resource', None)
        resources = self.request.query_params.get('resources', None)
        # only display current reservations
        qs = super().get_queryset().current()
        try:
            if resource and resource != 'all':
                return qs.filter(resource__pk=resource)
            if resources:
                resources = resources.split('.')
                return qs.filter(resource__uuid__in=resources)
        except (ValidationError, Resource.DoesNotExist):
            raise Http404
        return qs


register_view(ReservationCalendarViewSet, 'calendar/event', base_name='calendarevent')


class CalendarResourceSerializer(ResourceSerializer):
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


class ResourceCalendarViewSet(ResourceListViewSet):
    pagination_class = None
    http_method_names = ['get', 'head']
    permission_classes = (IsAdminUser,)

    def get_serializer_class(self):
        return CalendarResourceSerializer

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


register_view(ResourceCalendarViewSet, 'calendar/resource', base_name='calendarresource')