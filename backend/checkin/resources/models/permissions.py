from django.utils.translation import gettext_lazy as _
#from ..enums import UnitAuthorizationLevel, UnitGroupAuthorizationLevel
from guardian.core import ObjectPermissionChecker

# Always update permissions.rst documentation accordingly after modifying this file!

UNIT_PREFIX = 'unit:'
RESOURCE_PREFIX = 'resource:'
RESOURCE_GROUP_PREFIX = 'group:'

def prefix_perm_codenames(prefix, codenames):
    return [prefix + codename for codename in codenames]

def prefix_perm_tuple(prefix, perm_tuple):
    return [(prefix + codename, description) for (codename, description) in perm_tuple]

prefix_unit_perm_codenames = lambda x: prefix_perm_codenames(UNIT_PREFIX, x)
prefix_resource_perm_codenames = lambda x: prefix_perm_codenames(RESOURCE_PREFIX, x)
prefix_resource_group_perm_codenames = lambda x: prefix_perm_codenames(RESOURCE_GROUP_PREFIX, x)

RESERVATION_PERMISSIONS = (
    # will cause superusers to "have" the permission and thus not receive notifications
    # ('skip_reservation_notification', _('Do not send notifications for reservations')),
)

SHARED_PERMISSIONS = (
    ('can_modify_reservations', _('Can modify reservations')),
    ('can_modify_access', _('Can modify access')),
    ('can_modify_reservations_without_notifications', _('Can modify reservations, but do not notify or use as Reply-To')),
    ('can_modify_access_without_notifications', _('Can modify access, but do not notify or use as Reply-To')),
    ('notify_for_reservations', _('Receive notifications for reservation requests, but do not allow access to backend')),
    ('notify_for_access', _('Receive notifications for access requests, but do not allow access to backend')),
)

RESOURCE_PERMISSIONS = (
    *SHARED_PERMISSIONS,
    ('can_make_reservations', _('Can make reservations')),
    #('can_approve_reservations', _('Can approve reservations')),
    ('has_permanent_access', _('Has permanent access')),
    #('can_ignore_opening_hours', _('Can make reservations outside opening hours')),
    #('can_view_reservation_access_code', _('Can view reservation access code')),
    #('can_view_reservation_extra_fields', _('Can view reservation extra fields')),
    ('can_view_reservation_user', _('Can view reservation user')),
    #('can_access_reservation_comments', _('Can access reservation comments')),
    #('can_comment_reservations', _('Can create comments for a reservation')),
    #('can_view_reservation_catering_orders', _('Can view reservation catering orders')),
    #('can_modify_reservation_catering_orders', _('Can modify reservation catering orders')),
    #('can_view_reservation_product_orders', _('Can view reservation product orders')),
    #('can_modify_paid_reservations', _('Can modify paid reservations')),
    #('can_bypass_payment', _('Can bypass payment for paid reservations')),
    #('can_create_staff_event', _('Can create a reservation that is a staff event')),
    #('can_create_special_type_reservation', _('Can create reservations of a non-normal type')),
    ('can_bypass_manual_confirmation', _('Can bypass manual confirmation requirement for resources')),
    #('can_create_reservations_for_other_users', _('Can create reservations for other registered users')),
    ('can_create_overlapping_reservations', _('Can create overlapping reservations')),
    ('can_ignore_max_reservations_per_user', _('Can ignore resources max reservations per user rule')),
    ('can_ignore_max_period', _('Can ignore resources max period rule')),
    #('can_set_custom_price_for_reservations', _('Can set custom price for individual reservations')),
)

UNIT_PERMISSIONS = [
    ('unit:' + name, description)
    for (name, description) in
    (
        *SHARED_PERMISSIONS,
        ('can_confirm_users', _('Can confirm (external) users')),
        ('can_confirm_users_without_notifications', _('Can confirm (external) users, but do not notify or use as Reply-To')),
        ('notify_for_users', _('Receive notifications for user requests, but do not allow access to backend')),
        ('view_resource', _('Can view Spaces within Unit')),
        ('change_resource', _('Can change Spaces within Unit')),
        ('delete_resource', _('Can delete Spaces within Unit')),
        ('add_resource', _('Can add Spaces within Unit')),
    )
]

RESOURCE_GROUP_PERMISSIONS = [
    # ('group:' + name, description)
    # for (name, description) in SHARED_RESOURCE_PERMISSIONS
]

RESOURCE_PERMISSIONS = [
    ('resource:' + name, description)
    for (name, description) in RESOURCE_PERMISSIONS
]

from guardian.conf import settings as guardian_settings
from guardian.ctypes import get_content_type
from django.contrib.auth.models import Permission
from itertools import chain

class NoSuperuserObjectPermissionChecker(ObjectPermissionChecker):

    def has_perm(self, perm, obj):
        """
        Checks if user/group has given permission for object.

        :param perm: permission as string, may or may not contain app_label
          prefix (if not prefixed, we grab app_label from ``obj``)
        :param obj: Django model instance for which permission should be checked

        """
        if self.user and not self.user.is_active:
            return False
        # elif self.user and self.user.is_superuser:
        #     return True
        if '.' in perm:
            _, perm = perm.split('.', 1)
        return perm in self.get_perms(obj)

    def get_perms(self, obj):
        """
        Returns list of ``codename``'s of all permissions for given ``obj``.

        :param obj: Django model instance for which permission should be checked

        """
        if self.user and not self.user.is_active:
            return []

        if guardian_settings.AUTO_PREFETCH:
            self._prefetch_cache()

        # ctype = get_content_type(obj)
        key = self.get_local_cache_key(obj)
        if key not in self._obj_perms_cache:
            # If auto-prefetching enabled, do not hit database
            if guardian_settings.AUTO_PREFETCH:
                return []
            # if self.user and self.user.is_superuser:
            #     perms = list(chain(*Permission.objects
            #                        .filter(content_type=ctype)
            #                        .values_list("codename")))
            elif self.user:
                # Query user and group permissions separately and then combine
                # the results to avoid a slow query
                user_perms = self.get_user_perms(obj)
                group_perms = self.get_group_perms(obj)
                perms = list(set(chain(user_perms, group_perms)))
            else:
                perms = list(set(self.get_group_perms(obj)))
            self._obj_perms_cache[key] = perms
        return self._obj_perms_cache[key]
