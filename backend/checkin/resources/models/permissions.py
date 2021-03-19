from django.utils.translation import ugettext_lazy as _
#from ..enums import UnitAuthorizationLevel, UnitGroupAuthorizationLevel
from guardian.core import ObjectPermissionChecker

# Always update permissions.rst documentation accordingly after modifying this file!

RESERVATION_VALIDATION_PERMISSIONS = (
    ('is_hardship_case', _('Hardship treatment')),
)

RESERVATION_PERMISSIONS = (*RESERVATION_VALIDATION_PERMISSIONS,)

SHARED_PERMISSIONS = (
    ('can_modify_reservations', _('Can modify reservations')),
)

RESOURCE_PERMISSIONS = (
    *SHARED_PERMISSIONS,
    ('can_make_reservations', _('Can make reservations')),
    #('can_approve_reservations', _('Can approve reservations')),
    ('can_modify_access', _('Can give access')),
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