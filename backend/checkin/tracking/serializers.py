from __future__ import unicode_literals
from .models import Location, Checkin, Profile
from rest_framework import serializers


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'code', 'org_number', 'org_name', 'capacity', 'load','parent']


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id','first_name', 'last_name', 'phone', 'email', 'verified', 'complete']


class CheckinSerializer(serializers.ModelSerializer):
    person = PersonSerializer()
    location = LocationSerializer()
    class Meta:
        model = Checkin
        fields = ['time', 'person', 'location']
