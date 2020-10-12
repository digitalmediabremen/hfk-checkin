from __future__ import unicode_literals
from rest_framework import serializers
from rest_framework import viewsets, views, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import  Response
from rest_framework.renderers import JSONRenderer
from .models import *
from .serializers import *
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.db.utils import IntegrityError
from django.http import Http404
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.contrib.auth import login
from django.contrib.auth.backends import ModelBackend
from django.utils.translation import gettext as _
from netaddr import IPNetwork, IPAddress

from .models import Profile


ERROR_NOT_VERIFIED = _("Bitte bestätigen Sie Ihre Identität vor dem ersten Checkin.")
ERROR_NO_PROFILE = _("Bitte legen Sie ein Profil an.")
ERROR_DENIED = _("Sie sind nicht berechtigt diese Aktion auszuführen.")
ERROR_NOT_COMPLETE = _("Ihr Profil ist unvollständig.")
ERROR_NOT_VALID = _("Ihre Eingaben sind nicht korrekt.")
ERROR_NOT_VALID_WITH_SUMMARY = _("Bitte korregieren Sie: %s")
ERROR_NOT_CHECKED_IN_HERE = _("Sie sind hier nicht eingecheckt.")

ON_CAMPUS_IP_NETWORKS_WHITELIST = [
    IPNetwork("172.16.0.0/24"),
    IPNetwork("192.168.0.0/24"),
    IPNetwork("10.10.0.0/16"),
]

class CSRFExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening


class OnCampusPermission(permissions.BasePermission):
    """
    Global permission check for blocked IPs.
    """

    def has_permission(self, request, view):
        ip_addr = request.META['REMOTE_ADDR']
        for network in ON_CAMPUS_IP_NETWORKS_WHITELIST:
            if ip_addr in network:
                return True
        return False


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
            return Response({'detail': ERROR_NOT_VERIFIED}, status=status.HTTP_401_UNAUTHORIZED)

        origin = request.data.get('origin', None)
        checkin, new = Checkin.objects.checkin_or_return(profile=profile, location=self.get_object(), origin=origin)
        serializer = CheckinSerializer(checkin)
        if not new:
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post', 'put'])
    def checkout(self, request, pk=None, **kwargs):
        try:
            profile = request.user.profile
        except AttributeError:
            raise PermissionDenied(ERROR_NO_PROFILE)

        origin = request.data.get('origin', None)
        try:
            checkin = Checkin.objects.last_checkin_for_profile_at_location(profile=profile, location=self.get_object()).get()
            serializer = CheckinSerializer(checkin)
            if checkin.is_active():
                checkin.checkout(origin=origin)
            else:
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Checkin.DoesNotExist:
            return Response({'detail': ERROR_NOT_CHECKED_IN_HERE}, status=status.HTTP_400_BAD_REQUEST)


class CheckinViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Checkin.objects.all()
    serializer_class = CheckinSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = (CSRFExemptSessionAuthentication,)

    def get_queryset(self):
        profile = self.request.user.profile
        return Checkin.objects.filter(profile=profile)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = (CSRFExemptSessionAuthentication,)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def me(self, request, pk=None):
        if request.user.is_anonymous:
            raise PermissionDenied(ERROR_NO_PROFILE)

        try:
            serializer = ProfileSerializer(request.user.profile)
        except AttributeError:
            raise NotFound(ERROR_NO_PROFILE)
        return Response(serializer.data)

    @action(url_path="me/save", detail=False, methods=['post','put'], permission_classes=[AllowAny])
    def save(self, request, pk=None):
        profile = ProfileSerializer(data=request.data)
        if not profile.is_valid():
            return Response({
                'detail': ERROR_NOT_VALID_WITH_SUMMARY % ", ".join([", ".join(err) for key, err in profile.errors.items()]) if profile.errors else ERROR_NOT_VALID,
                'errors': profile.errors,
                'non_field_errors': getattr(profile, 'non_field_errors', None),
            }, status=status.HTTP_400_BAD_REQUEST)

        # TODO join User + Profile model OR session against Profile OR custom User without username etc. OR subclass User
        # FIXME unique user will now fail

        # this is basically .create()
        # see: https://www.django-rest-framework.org/api-guide/serializers/#accessing-the-initial-data-and-instance

        #if new / anonymous user
        if request.user and request.user.is_anonymous:
            username = "%s@gast.hfk-bremen.de" % (profile.validated_data['phone'],)
            username = username.lower()
            try:
                user = User.objects.create_user(first_name=profile.validated_data['first_name'], last_name=profile.validated_data['last_name'], username=username)
                # FIXME This is might be crap!
                login(request, user, backend="django.contrib.auth.backends.ModelBackend")
            except (ValidationError, IntegrityError) as e:
                return Response({'detail': ERROR_NOT_VALID}, status=status.HTTP_400_BAD_REQUEST)
        else:
            user = request.user

        profile_instance = profile.save()
        profile_instance.user = user
        profile_instance.save()

        return Response(profile.data)
