from django.contrib.auth import get_user_model
from rest_framework import permissions, serializers, generics, mixins, viewsets
from .models import Profile
from rest_framework import serializers
from rest_framework import viewsets, views, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated, IsAdminUser,\
    DjangoModelPermissions, DjangoModelPermissionsOrAnonReadOnly
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from .models import *
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.db.utils import IntegrityError
from django.utils.translation import gettext_lazy as _

from django.contrib.auth import login
from django.contrib.auth.backends import ModelBackend
from django.utils import timezone
from logging import getLogger
from django.conf import settings
from django.utils.translation import get_language_from_request

logger = getLogger(__name__)

# from resources.models.utils import build_ical_feed_url
# from resources.models import Unit

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


all_views = []
User = get_user_model()

def register_view(klass, name, base_name=None):
    entry = {'class': klass, 'name': name}
    if base_name is not None:
        entry['base_name'] = base_name
    all_views.append(entry)


class CSRFExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening


# class ProfileSerializer(serializers.ModelSerializer):
#     id = serializers.ReadOnlyField()
#     display_name = serializers.ReadOnlyField(source='get_display_name')
#
#     class Meta:
#         model = Profile
#         fields = ['id','first_name', 'last_name', 'display_name', 'phone', 'email']

def generate_username_for_new_user(validated_userprofile_data):
    # should return a email address "lookalike", since our user model has no explicit username field
    # FIXME move this to settings
    return ("%s-%s@gast.hfk-bremen.de" % (\
        validated_userprofile_data['phone'], timezone.now().strftime("%Y-%m-%d-%H-%M-%S"))\
    ).lower()


class BaseUserProfileSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='pk')
    profile_id = serializers.ReadOnlyField(source='profile.pk')
    display_name = serializers.ReadOnlyField(source='get_display_name', read_only=True)
    first_name = serializers.CharField(source='profile.first_name')
    last_name = serializers.CharField(source='profile.last_name')
    phone = serializers.CharField(source='profile.phone')
    email = serializers.EmailField(source='profile.email', read_only=True) # can only be writable if we validate emails
    is_external = serializers.BooleanField(source='profile.is_external', read_only=True)
    preferred_language = serializers.ChoiceField(choices=settings.LANGUAGES, required=False, read_only=True)
    #reservations = SimpleReservationSerializer(many=True, read_only=True, source='user.reservation_set')
    # TODO limited qs on reservations etc. ListField to ReservationsViewSet?
    #reservations = serializers.ListField(serializers=)
    verified = serializers.ReadOnlyField(source='profile.verified', read_only=True)
    complete = serializers.ReadOnlyField(source='profile.complete', read_only=True)

    class Meta:
        model = User
        fields = ['id','profile_id','first_name', 'last_name', 'display_name', 'phone', 'email', 'verified', 'complete', 'preferred_language', 'is_external']

    def validate_phone(self, value):
        return value.strip()

    def get_preferred_language(self, validated_data):
        request = self.context.get("request")
        # take language from serializer data if exists
        # FIXME 'preferred_language' is not in validated_data. why?
        # if 'preferred_language' in validated_data:
        #     return {'preferred_language': validated_data['preferred_language']}
        # take language form request otherwise
        if request and hasattr(request, "user"):
            preferred_language = get_language_from_request(request)
            return{'preferred_language': preferred_language}
        return {}

    def create(self, validated_data, user_extra={}, profile_extra={}):
        userprofile_data = validated_data.pop('profile')

        user = User.objects.create_user(**{
            User.USERNAME_FIELD: generate_username_for_new_user(userprofile_data),
            'first_name': userprofile_data['first_name'],
            'last_name': userprofile_data['last_name'],
            **self.get_preferred_language(userprofile_data),
            **user_extra,
        })
        # create profile object
        profile_dict = {
            'user': user,
            'first_name': userprofile_data['first_name'],
            'last_name': userprofile_data['last_name'],
            'phone': userprofile_data['phone'],
            #'email': userprofile_data['email'], # can only be writable if we validate emails
            'verified': False,
            **profile_extra,
            #'is_external': True,
        }
        try:
            # FIXME will never exists if the username is time dependent
            profile = Profile.objects.get(user=user)
            profile.__dict__.update(**profile_dict)
            profile.save()
        except Profile.DoesNotExist:
            profile = Profile.objects.create(**profile_dict)
        user.profile = profile
        return user

    def update(self, instance, validated_data):
        userprofile_data = validated_data.pop('profile')
        # update user object
        instance.__dict__.update(**{
            'first_name': userprofile_data['first_name'],
            'last_name': userprofile_data['last_name'],
            **self.get_preferred_language(userprofile_data),
        })
        # update profile object
        instance.profile.__dict__.update(**{
            'first_name': userprofile_data['first_name'],
            'last_name': userprofile_data['last_name'],
            'phone': userprofile_data['phone'],
            #'email': userprofile_data['email'], # can only be writable if we validate emails
        })
        instance.profile.save()
        instance.save()
        return instance

class SimpleUserProfileSerializer(BaseUserProfileSerializer):
    pass
    # class Meta(BaseUserProfileSerializer.Meta):
    #     fields = ['id','first_name', 'last_name', 'display_name', 'phone', 'email', 'verified', 'complete']

class UserProfileSerializer(BaseUserProfileSerializer):
    # if 'checkin.tracking' in settings.INSTALLED_APPS:
    from checkin.tracking.serializers import SimpleCheckinSerializer
    last_checkins = serializers.SerializerMethodField('get_last_checkins')
    # if 'checkin.resources' in settings.INSTALLED_APPS:
    # from checkin.resources.api.nested import SimpleReservationSerializer
    # reservations = SimpleReservationSerializer(many=True, read_only=True, source='reservation_set')

    def get_last_checkins(self, obj):
        from checkin.tracking.serializers import SimpleCheckinSerializer
        items = obj.profile.checkin_set.only_user_generated()[:30]
        serializer = SimpleCheckinSerializer(many=True, instance=items)
        return serializer.data

    class Meta(BaseUserProfileSerializer.Meta):
        fields = ['id','first_name', 'last_name', 'display_name', 'phone', 'email', 'verified', 'complete', 'preferred_language', 'last_checkins']
        # if 'checkin.tracking' in settings.INSTALLED_APPS:
        #     fields += ['last_checkins']
        # if 'checkin.resources' in settings.INSTALLED_APPS:
        #     fields += ['reservations']


# class UserSerializer(serializers.ModelSerializer):
#     from checkin.resources.api.nested import SimpleReservationSerializer
#     display_name = serializers.ReadOnlyField(source='get_display_name')
#     # reservations = serializers.ListField(read_only=True, child=SimpleReservationSerializer(many=True), allow_empty=True, source='reservation_set')
#     reservations = SimpleReservationSerializer(many=True, read_only=True, source='reservation_set')
#     #ical_feed_url = serializers.SerializerMethodField()
#     #staff_perms = serializers.SerializerMethodField()
#
#     class Meta:
#         fields = [
#             'last_login', 'email', 'date_joined',
#             'first_name', 'last_name', 'id',
#             'is_staff', 'display_name', 'reservations' # 'ical_feed_url', 'staff_perms', 'favorite_resources'
#         ]
#         model = get_user_model()

    # def get_ical_feed_url(self, obj):
    #     return build_ical_feed_url(obj.get_or_create_ical_token(), self.context['request'])

    # def get_staff_perms(self, obj):
    #     perm_objs = obj.userobjectpermission_set.all()
    #     perms = {}
    #     # We support only units for now
    #     for p in perm_objs:
    #         if p.content_type.model_class() != Unit:
    #             continue
    #         obj_perms = perms.setdefault(p.object_pk, [])
    #         perm_name = p.permission.codename
    #         if perm_name.startswith('unit:'):
    #             perm_name = perm_name[5:]
    #         obj_perms.append(perm_name)
    #     if not perms:
    #         return {}
    #     return {'unit': perms}


class UserProfileViewSet(viewsets.ViewSet, generics.GenericAPIView, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.CreateModelMixin):
    permission_classes = [permissions.IsAuthenticated]
    queryset = get_user_model().objects.exclude_anonymous_users().all()
    serializer_class = UserProfileSerializer
    authentication_classes = (CSRFExemptSessionAuthentication,)

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return self.queryset
        else:
            return self.queryset.filter(pk=user.pk)

    def get_object(self):
        pk = self.kwargs.get('pk', None)
        if pk:
            qs = self.get_queryset()
            obj = generics.get_object_or_404(qs, pk=pk)
        else:
            obj = self.request.user
        return obj

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def me(self, request, pk=None):
        if request.user.is_anonymous or not hasattr(request.user, 'profile'):
            raise PermissionDenied(ERROR_NO_PROFILE)
        return self.retrieve(self, request)

    # def perform_update(self, serializer):
    #     # update existing profile, e.g. on phone number change
    #     # nothing unusual
    #     serializer.save()

    def create(self, request, *args, **kwargs):
        """
        create new (guest) profile, for users that are not created via a authentication backend
        validate and extend object
        create user
        log new user in
        """
        if not request.user.is_anonymous:
            raise ValueError("Only anonymous users should be created. Call update() instead of create().")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # create user and profile object
        # custom custom create() and update() on serializer!
        self.perform_create(serializer)
        login(request, serializer.instance, backend="django.contrib.auth.backends.ModelBackend")
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        # except (ValidationError, IntegrityError) as e:
        #     logger.debug(e)
        #     return Response({'detail': ERROR_NOT_VALID}, status=status.HTTP_400_BAD_REQUEST)

    @action(url_path="me/save", detail=False, methods=['post','put'], permission_classes=[AllowAny])
    def save(self, request, pk=None):
        if request.user and not request.user.is_anonymous:
            return self.partial_update(request)
        return self.create(request)

            # try:
            #     profile = request.user.profile
            #     profile_serializer = self.get_serializer(profile, data=request.data)
            # except AttributeError:
            #     pass

        # if not profile_serializer.is_valid():
        #     return Response({
        #         'detail': ERROR_NOT_VALID_WITH_SUMMARY % ", ".join([", ".join(err) for key, err in profile_serializer.errors.items()]) if profile_serializer.errors else ERROR_NOT_VALID,
        #         'errors': profile_serializer.errors,
        #         'non_field_errors': getattr(profile_serializer, 'non_field_errors', None),
        #     }, status=status.HTTP_400_BAD_REQUEST)

        # FIXME unique user will now fail

        # this is basically .create()
        # see: https://www.django-rest-framework.org/api-guide/serializers/#accessing-the-initial-data-and-instance

        #if new / anonymous user
        # if request.user and request.user.is_anonymous:
        #     username = "%s-%s@gast.hfk-bremen.de" % (profile_serializer.validated_data['phone'],timezone.now().strftime("%Y-%m-%d-%H-%M-%S"))
        #     username = username.lower()
        #     try:
        #         user = User.objects.create_user(first_name=profile_serializer.validated_data['first_name'], last_name=profile_serializer.validated_data['last_name'], username=username)
        #         # FIXME This is might be crap!
        #         login(request, user, backend="django.contrib.auth.backends.ModelBackend")
        #     except (ValidationError, IntegrityError) as e:
        #         return Response({'detail': ERROR_NOT_VALID}, status=status.HTTP_400_BAD_REQUEST)
        # else:
        #     user = request.user
        # try:
        #     profile = profile_serializer.save()
        #     profile.user = user
        #     profile.save()
        #
        #     return Response(profile_serializer.data)
        #
        # except (ValidationError, IntegrityError) as e:
        #     return Response({'detail': ERROR_PROFILE_NOT_SAVED}, status=status.HTTP_400_BAD_REQUEST)


register_view(UserProfileViewSet, 'profile')


from django.contrib.auth import logout as auth_logout


class LogoutViewSet(viewsets.ViewSet):
    """
    Logout current user and return result.
    see django/contrib/auth/views.py LogoutView for template.
    """

    @action(methods=['post','get'], detail=False)
    def logout(self, request, *args, **kwargs):
        auth_logout(request)
        return Response({'detail': SUCCESS_LOGOUT}, status=status.HTTP_200_OK)

register_view(LogoutViewSet, 'auth', base_name='auth')