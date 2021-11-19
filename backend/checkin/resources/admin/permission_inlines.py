from .generic_permission_inline import UserPermissionInlineForm, SingleUserPermissionInlineForm
from .generic_permission_inline import *
from guardian.shortcuts import get_perms_for_model
from ..models.resource import Resource, Unit
from django.utils.translation import gettext_lazy as _


class MakeDelegateStaffUserInlineFormMixin():

    def save(self, commit=True):
        if commit:
            # FIXME move out of here
            # FIXME optimize queries to one update()
            self.instance.user.is_staff = True
            self.instance.user.save()
        return super().save(commit)


class MakeDelegateStaffUserInlineFormBase(MakeDelegateStaffUserInlineFormMixin, UserPermissionInlineForm):
    pass


class SingleMakeDelegateStaffUserInlineFormBase(MakeDelegateStaffUserInlineFormMixin, SingleUserPermissionInlineForm):
    pass


class AccessAllowedToResourceUserPermissionInline(SingleUserResourcePermissionInline):
    permission_codenames = ['resource:has_permanent_access']
    model_for_permissions = Resource
    verbose_name = _("User with permitted access")
    verbose_name_plural = _("Users with permitted access")

    def has_permission(self, request, obj):
        if obj:
            return obj.can_modify_access(request.user)
        return True

class AccessDelegatesForResourceUserPermissionInline(UserResourcePermissionInline):
    permission_codenames = ['resource:can_modify_access', 'resource:can_modify_access_without_notifications', 'resource:notify_for_access']
    model_for_permissions = Resource
    verbose_name = _("Access control delegate")
    verbose_name_plural = _("Access control delegates")
    base_form = MakeDelegateStaffUserInlineFormBase


class ReservationDelegatesForResourceUserPermissionInline(UserResourcePermissionInline):
    permission_codenames = ['resource:can_modify_reservations', 'resource:can_modify_reservations_without_notifications', 'resource:notify_for_reservations']
    model_for_permissions = Resource
    verbose_name = _("Reservation delegate")
    verbose_name_plural = _("Reservation delegates")
    base_form = MakeDelegateStaffUserInlineFormBase


class AccessDelegatesForUnitUserPermissionInline(UserUnitPermissionInline):
    permission_codenames = ['unit:can_modify_access', 'unit:can_modify_access_without_notifications', 'unit:notify_for_access']
    model_for_permissions = Unit
    verbose_name = _("Unit access delegate")
    verbose_name_plural = _("Unit access delegates")
    base_form = MakeDelegateStaffUserInlineFormBase
    min_num = 1


class ReservationDelegatesForUnitUserPermissionInline(UserUnitPermissionInline):
    permission_codenames = ['unit:can_modify_reservations', 'unit:can_modify_reservations_without_notifications', 'unit:notify_for_reservations']
    model_for_permissions = Unit
    verbose_name = _("Unit reservation delegate")
    verbose_name_plural = _("Unit reservation delegates")
    base_form = MakeDelegateStaffUserInlineFormBase
    min_num = 1


class UserConfirmationDelegatesForUnitUserPermissionInline(UserUnitPermissionInline):
    permission_codenames = ['unit:can_confirm_users', 'unit:can_confirm_users_without_notifications', 'unit:notify_for_users']
    model_for_permissions = Unit
    verbose_name = _("(External) user confirmation delegate")
    verbose_name_plural = _("(External) user confirmation delegates")
    base_form = MakeDelegateStaffUserInlineFormBase
    min_num = 1