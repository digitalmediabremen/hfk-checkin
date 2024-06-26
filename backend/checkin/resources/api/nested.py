from rest_framework import serializers
from ..models.reservation import Reservation, Resource


class SimpleResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ('uuid','name','display_name','display_numbers')


# class ReservationSerializer(ExtraDataMixin, TranslatedModelSerializer, ModifiableModelSerializerMixin):
class SimpleReservationSerializer(serializers.ModelSerializer):
    resource = SimpleResourceSerializer()
    class Meta:
        model = Reservation
        fields = ('uuid','begin','end','state','identifier','resource')