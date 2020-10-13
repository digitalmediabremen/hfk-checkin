from __future__ import unicode_literals
from .models import *
from rest_framework import serializers


class ActivityProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityProfile
        fields = ['name', 'description', 'distance_rule', 'other_rules']


class CapacityForActivityProfileSerializer(serializers.ModelSerializer):
    capacity = serializers.ReadOnlyField()
    profile = ActivityProfileSerializer()

    class Meta:
        model = CapacityForActivityProfile
        fields = ['capacity', 'profile']


class LocationSerializer(serializers.ModelSerializer):
    capacities = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Location
        fields = ['id', 'code', 'org_number', 'org_name', 'capacity', 'load', 'parent', 'capacities']

    def get_capacities(self, obj):
        qset = CapacityForActivityProfile.objects.filter(location=obj)
        return [CapacityForActivityProfileSerializer(m).data for m in qset]


class SimpleCheckinSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    class Meta:
        model = Checkin
        fields = ['id','time_entered', 'time_left', 'location']


class ProfileSerializer(serializers.ModelSerializer):
    last_checkins = SimpleCheckinSerializer(many=True, read_only=True)
    class Meta:
        model = Profile
        fields = ['id','first_name', 'last_name', 'phone', 'email', 'verified', 'complete', 'last_checkins']

    def validate_phone(self, value):
        return value.strip()


class CheckinSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    location = LocationSerializer(read_only=True)

    class Meta:
        model = Checkin
        fields = ['id','time_entered', 'time_left', 'origin_entered', 'origin_left', 'profile', 'location']
