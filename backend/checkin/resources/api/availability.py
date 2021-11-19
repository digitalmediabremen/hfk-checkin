import django_filters.rest_framework
from rest_framework import generics, filters, viewsets, serializers, mixins
from .base import register_view
from django.db.models import TextChoices
from django.utils.translation import gettext as _

class AvailabilityStatus(TextChoices):
    free = 'FREE', _('free')
    busy = 'BUSY', _('busy')

class FullcalendarResourceAvailabilityTimeframeSerializer(serializers.Serializer):

    """
    Serializes fictitious "availability timeframes", which determine availability times from reservations.
    Outputs into fullcalendar.io-compatible format.
    """

    start = serializers.DateTimeField(source='begin')
    end = serializers.DateTimeField()
    reservation_count = serializers.IntegerField()
    number_of_attendances = serializers.IntegerField()
    total_number_of_attendees = serializers.IntegerField()
    status = serializers.ChoiceField(AvailabilityStatus.choices)
    resourceId = serializers.CharField(source='resource_uuid')
    id = serializers.CharField(source='uuid')
    title = serializers.CharField(source='status')

# class ResourceFilterSet(django_filters.rest_framework.FilterSet):
#     begin = django_filters.CharFilter(field_name='begin', lookup_expr='lt')
#     end = django_filters.CharFilter(field_name='end', lookup_expr='gt')
#
#
# # class EventFilter(filters.FilterSet):
# #     timestamp_gte = django_filters.DateTimeFilter(name="timestamp", lookup_expr='gte')
# #     class Meta:
# #         model = Reservation
# #         fields = ['event_type', 'event_model', 'timestamp', 'timestamp_gte']
#
# class ResourceAvailabilityView(viewsets.GenericViewSet):
#     # serializer_class = ReservationSerializer
#     filter_backends = [ResourceFilterSet]
#
#
#     def list(self, request, *args, **kwargs):
#         queryset = self.filter_queryset(self.get_queryset())
#
#         page = self.paginate_queryset(queryset)
#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(serializer.data)
#
#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data)
#
#
# register_view(ResourceAvailabilityView, 'availability', base_name='availability')