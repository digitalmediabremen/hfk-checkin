from __future__ import unicode_literals
from .models import *
from rest_framework import serializers
from rest_framework.fields import ReadOnlyField, SerializerMethodField

from checkin.tracking.models import Location
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['display_numbers', 'numbers', 'name', 'comment']#'max_capacity', 'access_allowed_to_currect_user']
    # number
    # name
    # subtitle # = category
    # alternative_names
    # id
    # description
    # floor_number
    # floor_name
    # segment_number
    # capacity
    # access_restricted
    # access_allowed_to_currect_user
    # access_manager
    # access_rules
    #
    # features
    # bookable
    #
    #
    # capacities = serializers.SerializerMethodField(read_only=True)
    # id = ReadOnlyField()
    #
    # class Meta:
    #     model = Location
    #     fields = ['id', 'code', 'org_number', 'org_name', 'capacity', 'load', 'parent', 'capacities']
    #
    # def get_capacities(self, obj):
    #     qset = CapacityForActivityProfile.objects.filter(location=obj)
    #     return [CapacityForActivityProfileSerializer(m).data for m in qset]

class GuestSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField(allow_blank=True)

class RoomBookingRequestSerializer(serializers.Serializer):
    rooms = serializers.PrimaryKeyRelatedField(queryset=Location.objects, many=True)
    guests = GuestSerializer(many=True)
    # include current user itself?
    begin = serializers.DateTimeField()
    end = serializers.DateTimeField()
    comment = serializers.CharField(allow_blank=True)
    title = serializers.CharField(allow_blank=True)
    is_important = serializers.BooleanField()
    agreed_to_phone_contact = serializers.BooleanField()
    send_confirmation_to_self = serializers.BooleanField()

#     # extra on model:
#     attendents = List
#
# class RoomBookingRequest(models.Model):
#     rooms = models.ManyToManyField(Room)
#     organizer = models.ForeignKey(Profile)
#     attendants = combine ORGANIZER and GUESTS
#     guests = models.ManyToManyField(Profile)
#     begin = models.DateTimeField()
#     end = models.DateTimeField()
#     comment = models.CharField(allow_blank=True)
#     title = models.CharField(allow_blank=True)
#     is_important = models.BooleanField()
#     agreed_to_phone_contact = models.BooleanField()
#     uuid
#
#
