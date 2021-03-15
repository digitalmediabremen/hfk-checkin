from django.contrib.auth import get_user_model
from rest_framework import permissions, serializers, generics, mixins, viewsets
from .models import Profile

# from resources.models.utils import build_ical_feed_url
# from resources.models import Unit


all_views = []
User = get_user_model()

def register_view(klass, name, base_name=None):
    entry = {'class': klass, 'name': name}
    if base_name is not None:
        entry['base_name'] = base_name
    all_views.append(entry)


class ProfileSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    display_name = serializers.ReadOnlyField(source='get_display_name')

    class Meta:
        model = Profile
        fields = ['id','first_name', 'last_name', 'display_name', 'phone', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    from django.conf import settings
    if 'checkin.tracking' in settings.INSTALLED_APPS:
        from checkin.tracking.serializers import SimpleCheckinSerializer
        last_checkins = SimpleCheckinSerializer(many=True, read_only=True, source='profile.checkin_set')
    if 'checkin.resources' in settings.INSTALLED_APPS:
        from checkin.resources.api.nested import SimpleReservationSerializer
        reservations = SimpleReservationSerializer(many=True, read_only=True, source='reservation_set')
    id = serializers.ReadOnlyField(source='profile.pk')
    display_name = serializers.ReadOnlyField(source='get_display_name')
    first_name = serializers.CharField(source='profile.first_name')
    last_name = serializers.CharField(source='profile.last_name')
    phone = serializers.CharField(source='profile.phone')
    email = serializers.EmailField(source='profile.email')
    is_external = serializers.EmailField(source='profile.is_external')
    #reservations = SimpleReservationSerializer(many=True, read_only=True, source='user.reservation_set')
    # TODO limited qs on reservations etc. ListField to ReservationsViewSet?
    #reservations = serializers.ListField(serializers=)
    verified = serializers.ReadOnlyField(source='profile.verified')
    complete = serializers.ReadOnlyField(source='profile.complete')

    class Meta:
        model = User
        fields = ['id','first_name', 'last_name', 'display_name', 'phone', 'email', 'verified', 'complete', 'last_checkins', 'reservations', 'is_external']

    def validate_phone(self, value):
        return value.strip()


class SimpleUserProfileSerializer(UserProfileSerializer):
    class Meta(UserProfileSerializer.Meta):
        fields = ['id','first_name', 'last_name', 'display_name', 'phone', 'email', 'verified', 'complete',]


class UserSerializer(serializers.ModelSerializer):
    from checkin.resources.api.nested import SimpleReservationSerializer
    display_name = serializers.ReadOnlyField(source='get_display_name')
    # reservations = serializers.ListField(read_only=True, child=SimpleReservationSerializer(many=True), allow_empty=True, source='reservation_set')
    reservations = SimpleReservationSerializer(many=True, read_only=True, source='reservation_set')
    #ical_feed_url = serializers.SerializerMethodField()
    #staff_perms = serializers.SerializerMethodField()

    class Meta:
        fields = [
            'last_login', 'email', 'date_joined',
            'first_name', 'last_name', 'id',
            'is_staff', 'display_name', 'reservations' # 'ical_feed_url', 'staff_perms', 'favorite_resources'
        ]
        model = get_user_model()

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


class UserViewSet(viewsets.ReadOnlyModelViewSet):

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return self.queryset
        else:
            return self.queryset.filter(pk=user.pk)

    def get_object(self):
        username = self.kwargs.get('username', None)
        if username:
            qs = self.get_queryset()
            obj = generics.get_object_or_404(qs, username=username)
        else:
            obj = self.request.user
        return obj

    permission_classes = [permissions.IsAuthenticated]
    queryset = get_user_model().objects.all()
    serializer_class = UserProfileSerializer

register_view(UserViewSet, 'profile')
