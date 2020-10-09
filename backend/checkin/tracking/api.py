from __future__ import unicode_literals
from rest_framework import serializers
from rest_framework import viewsets, views, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import  Response
from rest_framework.renderers import JSONRenderer
from .models import *
from .serializers import *
from rest_framework.exceptions import PermissionDenied, NotFound
from django.http import Http404

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'code'

    @action(detail=True, methods=['get','post','put'])
    def checkin(self, request, pk=None, **kwargs):
        try:
            profile = request.user.profile
        except AttributeError:
            return PermissionDenied

        checkin = Checkin.objects.create(person=profile, location=self.get_object())
        serializer = CheckinSerializer(checkin)
        return Response(serializer.data)


class CheckinViewSet(viewsets.ModelViewSet):
    queryset = Checkin.objects.all()
    serializer_class = CheckinSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = PersonSerializer

    @action(detail=False, methods=['get'])
    def me(self, request, pk=None):
        if not request.user or request.user.is_anonymous:
            raise PermissionDenied

        try:
            serializer = PersonSerializer(request.user.profile)
        except AttributeError:
            raise NotFound
        return Response(serializer.data)