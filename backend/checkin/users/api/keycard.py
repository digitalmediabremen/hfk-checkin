from django.contrib.auth import get_user_model
from rest_framework import permissions, serializers, generics, mixins, viewsets
from rest_framework import serializers
from rest_framework import viewsets, views, status, permissions
from .base import CSRFExemptSessionAuthentication, register_view
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated, IsAdminUser,\
    DjangoModelPermissions, DjangoModelPermissionsOrAnonReadOnly
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.utils import html, model_meta, representation
from ..models import Keycard
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.db.utils import IntegrityError
from django.utils.translation import gettext_lazy as _

from django.contrib.auth import login
from django.contrib.auth.backends import ModelBackend
from django.utils import timezone
from logging import getLogger
from django.conf import settings
from django.utils.translation import get_language_from_request
import uuid
from ..models import Keycard
from .user import (
    ERROR_NOT_LOGGED_IN, ERROR_NO_PROFILE
)

logger = getLogger(__name__)


class KeycardSerializer(serializers.Serializer):
    number = serializers.CharField(source='keycard_number', read_only=True)
    requested_at = serializers.DateTimeField(source='keycard_requested_at', read_only=True)
    permissions_last_synced_at = serializers.DateTimeField(read_only=True, default=None)
    permissions_last_modified_at = serializers.DateTimeField(read_only=True, default=None)
    total_permission_count = serializers.IntegerField(read_only=True)
    synced_permission_count = serializers.IntegerField(read_only=True)
    not_synced_permission_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Keycard


class KeycardViewSet(viewsets.ViewSet, generics.GenericAPIView, mixins.RetrieveModelMixin):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Keycard.objects.exclude_anonymous_users()
    serializer_class = KeycardSerializer
    authentication_classes = (CSRFExemptSessionAuthentication,)

    def get_queryset(self):
        user = self.request.user
        profile = user.profile
        if user.is_superuser:
            return self.queryset
        else:
            return self.queryset.filter(user=user.pk)

    def get_object(self):
        pk = self.kwargs.get('pk', None) # pk = user pk as of now
        if pk:
            qs = self.get_queryset()
            obj = generics.get_object_or_404(qs, user=pk)
        else:
            obj = self.request.user.get_keycard()
        return obj

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def me(self, request, pk=None):
        if not request.user or request.user.is_anonymous:
            raise PermissionDenied(ERROR_NOT_LOGGED_IN)
        if not hasattr(request.user, 'profile'):
            raise NotFound(ERROR_NO_PROFILE)
        return self.retrieve(self, request)

register_view(KeycardViewSet, 'keycard')