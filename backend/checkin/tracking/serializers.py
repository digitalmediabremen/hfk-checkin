from __future__ import unicode_literals
from .models import *
from rest_framework import serializers
from rest_framework.fields import ReadOnlyField


class ActivityProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityProfile
        fields = ['name_de', 'name_en', 'description_de','description_en', 'distance_rule_de', 'other_rules_de', 'distance_rule_en', 'other_rules_en']


class CapacityForActivityProfileSerializer(serializers.ModelSerializer):
    capacity = serializers.ReadOnlyField()
    profile = ActivityProfileSerializer()

    class Meta:
        model = CapacityForActivityProfile
        fields = ['capacity', 'profile']


class LocationSerializer(serializers.ModelSerializer):
    capacities = serializers.SerializerMethodField(read_only=True)
    id = ReadOnlyField()

    class Meta:
        model = Location
        fields = ['id', 'code', 'org_number', 'org_name', 'capacity', 'load', 'parent', 'capacities']

    def get_capacities(self, obj):
        qset = CapacityForActivityProfile.objects.filter(location=obj)
        return [CapacityForActivityProfileSerializer(m).data for m in qset]


class SimpleCheckinSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    id = ReadOnlyField()

    class Meta:
        model = Checkin
        fields = ['id','time_entered', 'time_left', 'location','is_active']


class ProfileSerializer(serializers.ModelSerializer):
    last_checkins = SimpleCheckinSerializer(many=True, read_only=True)
    verified = ReadOnlyField()
    complete = ReadOnlyField()
    id = ReadOnlyField()

    class Meta:
        model = Profile
        fields = ['id','first_name', 'last_name', 'phone', 'email', 'student_number', 'verified', 'complete', 'last_checkins']

    def validate_phone(self, value):
        return value.strip()


class CheckinSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    id = ReadOnlyField()

    class Meta:
        model = Checkin
        fields = ['id','time_entered', 'time_left', 'origin_entered', 'origin_left', 'profile', 'location','is_active']
