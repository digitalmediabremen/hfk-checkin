from rest_framework import serializers, viewsets
from rest_framework.permissions import AllowAny

import django_filters
#from munigeo import api as munigeo_api
from .base import NullableDateTimeField, TranslatedModelSerializer, register_view, DRFFilterBooleanWidget
from ..models import Unit
#from resources.models.accessibility import get_unit_accessibility_url
#from .accessibility import UnitAccessibilitySerializer
from .base import ExtraDataMixin, ModifiableModelSerializerMixin


class UnitFilterSet(django_filters.FilterSet):
    resource_group = django_filters.Filter(field_name='resources__groups__identifier', lookup_expr='in',
                                           widget=django_filters.widgets.CSVWidget, distinct=True)
    unit_has_resource = django_filters.BooleanFilter(method='filter_unit_has_resource', widget=DRFFilterBooleanWidget)

    def filter_unit_has_resource(self, queryset, name, value):
        return queryset.exclude(resources__isnull=value)

    class Meta:
        model = Unit
        fields = ('resource_group',)


class UnitSerializer(ExtraDataMixin, TranslatedModelSerializer, ModifiableModelSerializerMixin):#, munigeo_api.GeoModelSerializer):
    # opening_hours_today = serializers.DictField(
    #     source='get_opening_hours',
    #     child=serializers.ListField(
    #         child=serializers.DictField(
    #             child=NullableDateTimeField())
    #     )
    # )
    # depracated, available for backwards compatibility
    # reservable_days_in_advance = serializers.ReadOnlyField(source='reservable_max_days_in_advance')
    # reservable_max_days_in_advance = serializers.ReadOnlyField()
    # reservable_before = serializers.SerializerMethodField()
    # reservable_min_days_in_advance = serializers.ReadOnlyField()
    # reservable_after = serializers.SerializerMethodField()
    #accessibility_base_url = serializers.SerializerMethodField()

    def get_extra_fields(self, includes, context):
        """ Define extra fields that can be included via query parameters. Method from ExtraDataMixin."""
        extra_fields = {}
        # if 'accessibility_summaries' in includes:
        #     # TODO: think about populating "unknown" results here if no data is available
        #     extra_fields['accessibility_summaries'] = UnitAccessibilitySerializer(
        #         many=True, read_only=True, context=context)
        return extra_fields

    # def get_accessibility_base_url(self, obj):
    #     return get_unit_accessibility_url(obj)

    # def get_reservable_before(self, obj):
    #     request = self.context.get('request')
    #     user = request.user if request else None
    #
    #     if user and obj.is_admin(user):
    #         return None
    #     else:
    #         return obj.get_reservable_before()
    #
    # def get_reservable_after(self, obj):
    #     request = self.context.get('request')
    #     user = request.user if request else None
    #
    #     if user and obj.is_admin(user):
    #         return None
    #     else:
    #         return obj.get_reservable_after()

    class Meta:
        model = Unit
        fields = ('url','uuid','name','slug','description','time_zone') + tuple(ModifiableModelSerializerMixin.Meta.fields)


class UnitViewSet(viewsets.ReadOnlyModelViewSet): #munigeo_api.GeoModelAPIView
    queryset = Unit.objects.filter(public=True).all() # .prefetch_related('identifiers')
    serializer_class = UnitSerializer
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filterset_class = UnitFilterSet
    permission_classes = (AllowAny,)


register_view(UnitViewSet, 'building')
