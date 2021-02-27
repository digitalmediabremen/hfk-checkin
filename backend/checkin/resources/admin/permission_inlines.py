from .generic_permission_inline import UserPermissionInline, SingleUserPermissionInline
from guardian.shortcuts import get_perms_for_model
from ..models.resource import Resource, Unit
from django.utils.translation import ugettext_lazy as _


class AccessAllowedToResourceUserPermissionInline(SingleUserPermissionInline):
    permission_codenames = ['resource:has_permanent_access']
    model_for_permissions = Resource
    verbose_name = _("User with permitted access")
    verbose_name_plural = _("Users with permitted access")

    def has_permission(self, request, obj):
        if obj:
            return obj.can_modify_access(request.user)
        return True

class AccessDelegatesForResourceUserPermissionInline(SingleUserPermissionInline):
    permission_codenames = ['resource:can_modify_access']
    model_for_permissions = Resource
    verbose_name = _("Access control delegate")
    verbose_name_plural = _("Access control delegates")

class ReservationDelegatesForResourceUserPermissionInline(SingleUserPermissionInline):
    permission_codenames = ['resource:can_modify_reservations']
    model_for_permissions = Resource
    verbose_name = _("Reservation delegate")
    verbose_name_plural = _("Reservation delegates")

class ReservationDelegatesForUnitUserPermissionInline(SingleUserPermissionInline):
    permission_codenames = ['unit:can_modify_reservations']
    model_for_permissions = Unit
    verbose_name = _("Unit reservation delegate")
    verbose_name_plural = _("Unit reservation delegates")

class UserConfirmationDelegatesForUnitUserPermissionInline(SingleUserPermissionInline):
    permission_codenames = ['unit:can_confirm_users']
    model_for_permissions = Unit
    verbose_name = _("(External) user confirmation delegate")
    verbose_name_plural = _("(External) user confirmation delegates")