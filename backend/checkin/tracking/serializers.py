from __future__ import unicode_literals
from .models import Location, Checkin, Profile
from rest_framework import serializers


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'code', 'org_number', 'org_name', 'capacity', 'load','parent']

class SimpleCheckinSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    class Meta:
        model = Checkin
        fields = ['id','time_entered', 'time_left', 'location']

class ProfileSerializer(serializers.ModelSerializer):
    last_checkins = SimpleCheckinSerializer(many=True)
    class Meta:
        model = Profile
        fields = ['id','first_name', 'last_name', 'phone', 'email', 'verified', 'complete', 'last_checkins']


class CheckinSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    class Meta:
        model = Checkin
        fields = ['id','time_entered', 'time_left', 'profile', 'location']
