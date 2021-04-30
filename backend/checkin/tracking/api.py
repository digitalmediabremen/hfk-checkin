from __future__ import unicode_literals
from rest_framework import serializers
from rest_framework import viewsets, views, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated, IsAdminUser,\
    DjangoModelPermissions, DjangoModelPermissionsOrAnonReadOnly
from rest_framework.response import  Response
from rest_framework.renderers import JSONRenderer
from .models import *
from .serializers import *
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.db.utils import IntegrityError
from django.http import Http404
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.utils.translation import gettext_lazy as _
from netaddr import IPNetwork, IPAddress
from django.utils import timezone

from .models import Profile


ERROR_NOT_VERIFIED = _("Bitte bestätigen Sie Ihre Identität vor dem ersten Checkin beim Personal am Empfang.")
ERROR_NO_PROFILE = _("Bitte legen Sie ein Profil an.")
ERROR_DENIED = _("Sie sind nicht berechtigt diese Aktion auszuführen.")
ERROR_NOT_COMPLETE = _("Ihr Profil ist unvollständig.")
ERROR_NOT_VALID = _("Ihre Eingaben sind nicht korrekt.")
ERROR_NOT_VALID_WITH_SUMMARY = _("Bitte korregieren Sie: %s")
ERROR_NOT_CHECKED_IN_HERE = _("Sie sind hier nicht eingecheckt.")
ERROR_LOCATION_NOT_FOUND = _("Raum oder Standort nicht gefunden.")
ERROR_PROFILE_NOT_SAVED = _("Beim Speichern deiner Kontaktdaten ist ein Fehler aufgetreten.")
ERROR_PROFILE_INCOMPLETE = _("Ihr Profil ist unvollstädnig.")
SUCCESS_LOGOUT = _("Abmeldung erfolgreich. Danke!")

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


def profile_is_verified_and_complete(request):
    try:
        profile = request.user.profile
    except AttributeError:
        raise PermissionDenied(ERROR_NO_PROFILE)

    if not profile.verified:
        return Response({'detail': ERROR_NOT_VERIFIED}, status=status.HTTP_401_UNAUTHORIZED)

    if not profile.complete:
        return Response({'detail': ERROR_PROFILE_INCOMPLETE}, status=status.HTTP_401_UNAUTHORIZED)


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]
    lookup_field = 'code'
    authentication_classes = (CSRFExemptSessionAuthentication,)

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except Http404:
            return Response({'detail': ERROR_LOCATION_NOT_FOUND}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get','post'], permission_classes=[IsAuthenticated])
    # fails with method 'PUT' because of call to get_serializer() in renderers.py:552
    def checkin(self, request, pk=None, **kwargs):

        check = profile_is_verified_and_complete(request)
        if check:
            return check

        profile = request.user.profile

        origin = request.query_params.get('origin', None)
        checkin, new = Checkin.objects.only_user_generated().checkin(profile=profile, location=self.get_object(), origin=origin)
        checkin_serializer = CheckinSerializer(checkin)
        if not new:
            return Response(checkin_serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(checkin_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAuthenticated])
    # fails with method 'PUT' because of call to get_serializer() in renderers.py:552
    def checkout(self, request, pk=None, **kwargs):

        check = profile_is_verified_and_complete(request)
        if check:
            return check

        profile = request.user.profile

        origin = request.query_params.get('origin', None)
        try:
            checkout, new = Checkin.objects.only_user_generated().checkout(profile=profile, location=self.get_object(), origin=origin)
            checkin_serializer = CheckinSerializer(checkout)
            if not new:
                return Response(checkin_serializer.data, status=status.HTTP_202_ACCEPTED)
            return Response(checkin_serializer.data, status=status.HTTP_201_CREATED)
        except Checkin.DoesNotExist:
            return Response({'detail': ERROR_NOT_CHECKED_IN_HERE}, status=status.HTTP_400_BAD_REQUEST)


class CheckinViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SimpleCheckinSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = (CSRFExemptSessionAuthentication,)

    def get_queryset(self):
        profile = self.request.user.profile
        filter_active = self.request.query_params.get('active', None)
        filter_active = filter_active == "True" or filter_active == ""
        qs = Checkin.objects.only_user_generated().filter(profile=profile)
        if filter_active:
            return qs.active()
        return qs
