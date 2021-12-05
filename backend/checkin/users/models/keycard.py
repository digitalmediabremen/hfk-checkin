from django.db import models
from django.utils.translation import gettext_lazy as _
from .userprofile import Profile
#from checkin.resources.admin.permission import PERMISSION_CODENAMES as KEYCARD_PERMISSION_CODENAMES
KEYCARD_PERMISSION_CODENAMES = ('resource:has_permanent_access', 'resource:can_modify_access')


class KeyCardManager(models.Manager):

    def get_queryet(self):
        qs = super().get_queryset()
        # add permissions relation
        qs.prefetch_related('user__timeenabledresourceuserobjectpermission_set')
        return qs

class Keycard(Profile):

    # pk = keycard_id

    class Meta:
        proxy = True # if not proxy anymore: move to separate app!
        verbose_name = _("Keycard")
        verbose_name_plural = _("Keycards")
        default_permissions = ('view','change')

    def __init__(self, *args, **kwargs):
        super(Keycard, self).__init__(*args, **kwargs)
        # FIXME use reverse_table_name from instance of permission.Resourcepermission instead of hard coding
        self.assigned_permissions = self.user.timeenabledresourceuserobjectpermission_set.filter(
            permission__codename__in=KEYCARD_PERMISSION_CODENAMES)

    def __repr__(self):
        return '<KeyCard (Proxy) "{0}" for User "{0}">'.format(self.keycard_number, self.user)

    def __str__(self):
        return self.__repr__()

    def total_permission_count(self):
        return self.assigned_permissions.count()

    def synced_permission_count(self):
        return self.assigned_permissions.filter(synced_at__isnull=False).count()

    def not_synced_permission_count(self):
        return self.assigned_permissions.filter(synced_at__isnull=True).count()

    def permissions_last_synced_at(self):
        last_list = self.assigned_permissions.filter(synced_at__isnull=False).order_by('-synced_at')[:1].values_list('synced_at')
        if len(last_list) > 0:
            return last_list[0][0]
        return None

    def permissions_last_modified_at(self):
        last_list = self.assigned_permissions.order_by('-modified_at')[:1].values_list('modified_at')
        if len(last_list) > 0:
            return last_list[0][0]
        return None
