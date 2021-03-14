from __future__ import unicode_literals
from .base import register_view
from rest_framework import serializers
from rest_framework.permissions import IsAdminUser
from .reservation import ReservationSerializer, ReservationViewSet, Reservation, DjangoFilterBackend, \
    ReservationFilterBackend, ExcludePastFilterBackend, \
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
        if obj.state not in [Reservation.CONFIRMED]:
            return 'inactive'

    class Meta:
        model = Reservation
        fields = ['url', 'id', 'identifier', 'start', 'end', 'title','resourceId','classNames']


class ReservationCalendarViewSet(ReservationViewSet):
    pagination_class = None
    http_method_names = ['get', 'head']
    permission_classes = (IsAdminUser,)
    filter_backends = (ReservationFilterBackend,)


    def get_serializer_class(self):
        return ReservationCalendarEventSerializer

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

register_view(ReservationCalendarViewSet, 'calendar/event')



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
        return self.request.query_params.get('resources', None).split('.')

    def get_queryset(self):
        resources = self.get_resources_from_query_params()
        if resources:
            try:
                return super().get_queryset().filter(uuid__in=resources)
            except (ValidationError, Resource.DoesNotExist):
                raise Http404
        return super().get_queryset()

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


register_view(ResourceCalendarViewSet, 'calendar/resource')