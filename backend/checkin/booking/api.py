from __future__ import unicode_literals
from rest_framework import serializers
from rest_framework import viewsets, views, status, permissions, filters, pagination
from rest_framework.viewsets import mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated, IsAdminUser,\
    DjangoModelPermissions, DjangoModelPermissionsOrAnonReadOnly
from rest_framework.response import  Response
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.db.utils import IntegrityError
from django.http import Http404
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.contrib.auth import login
from django.contrib.auth.backends import ModelBackend
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.auth import logout as auth_logout

from .models import *
from .serializers import *


ERROR_NOT_VERIFIED = _("Bitte bestätigen Sie Ihre Identität vor dem ersten Checkin beim Personal am Empfang.")
ERROR_NO_PROFILE = _("Bitte legen Sie ein Profil an.")
ERROR_DENIED = _("Sie sind nicht berechtigt diese Aktion auszuführen.")
ERROR_NOT_COMPLETE = _("Ihr Profil ist unvollständig.")
ERROR_NOT_VALID = _("Ihre Eingaben sind nicht korrekt.")
ERROR_NOT_VALID_WITH_SUMMARY = _("Bitte korregieren Sie: %s")
ERROR_NOT_CHECKED_IN_HERE = _("Sie sind hier nicht eingecheckt.")
ERROR_ROOM_NOT_FOUND = _("Raum oder Standort nicht gefunden.")
ERROR_PROFILE_NOT_SAVED = _("Beim Speichern deiner Kontaktdaten ist ein Fehler aufgetreten.")
ERROR_PROFILE_INCOMPLETE = _("Ihr Profil ist unvollstädnig.")
SUCCESS_LOGOUT = _("Abmeldung erfolgreich. Danke!")

class CSRFExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening


def profile_is_verified_and_complete(request):
    try:
        profile = request.user.profile
    except AttributeError:
        raise PermissionDenied(ERROR_NO_PROFILE)

    if not profile.verified:
        return Response({'detail': ERROR_NOT_VERIFIED}, status=status.HTTP_401_UNAUTHORIZED)

    if not profile.complete:
        return Response({'detail': ERROR_PROFILE_INCOMPLETE}, status=status.HTTP_401_UNAUTHORIZED)


class RoomViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin,
                   viewsets.GenericViewSet):
    """
    Returns a list of rooms within the system. Usually only bookable rooms are returned.
    If you want to return all rooms use `?only_bookable=false`.

    :post
    CREATE not allowed.

    :del
    DELETE not allowed.

    :filtering
    use `?search=<search_string>` to filter results. The following fields will be used to search in:
    `numbers`, `name`, `alternative_names`.
    NOT IMPLEMENTED YET: use `?section=XI` to filter on a building (or similar grouping).

    :pagination
    results can be paginated using `limit` and `offset`.
    See documentation for [LimitOffsetPagination](https://www.django-rest-framework.org/api-guide/pagination/#limitoffsetpagination).
    """
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = (CSRFExemptSessionAuthentication,)
    filter_backends = [filters.SearchFilter]
    search_fields = ['numbers','name']#,'alternative_names']
    pagination_class = pagination.LimitOffsetPagination

    ## TODO permissions!

    def get_queryset(self):
        """
        Optionally filter on `bookable` field.
        """
        # TODO use `django-filter` instead?!
        queryset = self.__class__.queryset
        only_bookable = self.request.query_params.get('only_bookable', 'true')
        if only_bookable.lower() != "false".lower():
            queryset = queryset.filter(bookable=True)
        return queryset

class BookingRequestViewSet(mixins.CreateModelMixin,mixins.ListModelMixin,mixins.RetrieveModelMixin,
                   viewsets.GenericViewSet):
    """
    This endpoint will accept booking requests and will process these in the booking pipeline.
    Requests are not stored and can not be retrieved later. (At least not via this endpoint.)
    You can only POST to this endpoint.

    returns:
    HTTP 200: request accepted and forwarded to proccessing
    HTTP 403: not authenticated
    HTTP 400: request incomplete (or not allowed) – see `details`.
    HTTP XXX: Guest not proccessed - Profile.get_or_create ... match by email (or phone, but needs standardised phone numbers)



        request ID or UUID
        state
    """

    serializer_class = RoomBookingRequestSerializer
    permission_classes = [AllowAny]
    authentication_classes = (CSRFExemptSessionAuthentication,)
    lookup_field = 'uuid'

    def get_queryset(self):
        profile = self.request.user.profile
        qs = RoomBookingRequest.objects.filter(organizer=profile)
        return qs

    def create(self, request, *args, **kwargs):
        check = profile_is_verified_and_complete(request)
        if check:
            return check
        # FIXME: do this check in permission class

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = request.user.profile
        serializer.save(organizer=profile)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_create(serializer)
    #     headers = self.get_success_headers(serializer.data)
    #     return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    #
    # def process_new_bookingrequest(self, bookingrequest):
    #     # place on Model?
    #
    #
    #     # send mail to "delegate"
    #     # or queue mail for sending
    #
    #
    #     # TODO need to check booking_permissions first
    #     # TODO need to seperate BUISNISS LOGIC form API
    #
    #     from django.core.files.base import ContentFile
    #     from post_office import mail
    #
    #     # seperate multiple rooms into multiple mails / different content and recipient ? -> no.
    #     mail.send(
    #         #[a.full_email for a in bookingrequest.attendants],
    #         ["\"%s → %s\" <%s>" % (r.delegate.full_name, r.display_name, r.delegate.email) for r in bookingrequest.rooms],
    #         bookingrequest.organizer.full_email,
    #         subject=_("Buchung %s in %s" % (bookingrequest.organizer.full_name, ", ".join([r.display_name for r in bookingrequest.rooms]))),
    #         #template='booking_request_email',
    #         message='Hello World.',
    #         #context={'booking': bookingrequest},
    #         priority='now',
    #     )
    #
    # def perform_create(self, serializer):
    #     instance = serializer.save()
    #     self.process_new_bookingrequest(instance)
    #
    # def create(self, request, pk=None):
    #
    #     ## TODO: this is stupid
    #     check = profile_is_verified_and_complete(request)
    #     if check:
    #         return check
    #
    #     serializer = self.get_serializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_create(serializer)
    #
    #     # save request to database
    #     # or save pre-booking to database
    #
    #     # send mail to "delegate"
    #     # or queue mail for sending
    #
    #     from django.core.files.base import ContentFile
    #     from post_office import mail
    #
    #     mail.send(
    #         ['recipient1@example.com'],
    #         'from@example.com',
    #         template='booking_request_email',
    #         context={'foo': 'bar'},
    #         priority='now',
    #     )
    #
    #     try:
    #         profile = profile_serializer.save()
    #         profile.user = user
    #         profile.save()
    #
    #         return Response(profile_serializer.data)
    #
    #     except (ValidationError, IntegrityError) as e:
    #         return Response({'detail': ERROR_PROFILE_NOT_SAVED}, status=status.HTTP_400_BAD_REQUEST)
