from __future__ import unicode_literals
from rest_framework import serializers
from rest_framework import viewsets, views, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.response import  Response
from rest_framework.renderers import JSONRenderer
from .models import *
from .serializers import *
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.http import Http404
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.contrib.auth import login
from django.contrib.auth.backends import ModelBackend
from django.utils.translation import gettext as _

from .models import Profile


ERROR_NOT_VERIFIED = _("Bitte bestätigen Sie Ihre Identität vor dem ersten Checkin.")
ERROR_NO_PROFILE = _("Bitte legen Sie ein Profil an.")
ERROR_DENIED = _("Sie sind nicht berechtigt diese Aktion auszuführen.")
ERROR_NOT_COMPLETE = _("Ihr Profil ist unvollständig.")


class CSRFExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'code'
    authentication_classes = (CSRFExemptSessionAuthentication,)

    @action(detail=True, methods=['get','post','put'])
    def checkin(self, request, pk=None, **kwargs):
        try:
            profile = request.user.profile
        except AttributeError:
            raise PermissionDenied(ERROR_NO_PROFILE)

        if not profile.verified:
            raise PermissionDenied(ERROR_NOT_VERIFIED)

        checkin = Checkin.objects.create(profile=profile, location=self.get_object())
        serializer = CheckinSerializer(checkin)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post', 'put'])
    def checkout(self, request, pk=None, **kwargs):
        try:
            profile = request.user.profile
        except AttributeError:
            return PermissionDenied(ERROR_NO_PROFILE)

        checkin = Checkin.objects.order_by('-time_entered').filter(profile=profile, location=self.get_object())[:1].get()
        checkin.checkout()
        serializer = CheckinSerializer(checkin)
        return Response(serializer.data)


class CheckinViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Checkin.objects.all()
    serializer_class = CheckinSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = (CSRFExemptSessionAuthentication,)

    def get_queryset(self):
        profile = self.request.user.profile
        return Checkin.objects.filter(profile=profile)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = (CSRFExemptSessionAuthentication,)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request, pk=None):
        if not request.user or request.user.is_anonymous:
            raise PermissionDenied(ERROR_NO_PROFILE)

        try:
            serializer = ProfileSerializer(request.user.profile)
        except AttributeError:
            raise NotFound(ERROR_NO_PROFILE)
        return Response(serializer.data)


    @action(url_path="me/save", detail=False, methods=['post','put'], permission_classes=[AllowAny])
    def save(self, request, pk=None):
        if request.user and not request.user.is_anonymous:
            profile = ProfileSerializer(data=request.data)
            if not profile.is_valid():
                raise ValidationError
            #profile.save()
            # TODO join User + Profile model OR session agains Profile OR custom User without username etc. OR subclass User
            # FIXME unique user will now fail

            # this is basially .create()
            # see: https://www.django-rest-framework.org/api-guide/serializers/#accessing-the-initial-data-and-instance
            username = "%s@gast.hfk-bremen.de" % (profile.validated_data['phone'],)
            username = username.lower()
            user = User.objects.create_user(first_name=profile.validated_data['first_name'], last_name=profile.validated_data['last_name'], username=username)

            # FIXME This is crap!
            login(request, user, backend="django.contrib.auth.backends.ModelBackend")

            profile_instance = profile.save()
            profile_instance.user = user
            profile_instance.save()

            return Response(profile.data)

        if request.user:
            raise PermissionDenied(ERROR_DENIED)
