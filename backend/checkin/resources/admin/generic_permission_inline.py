from django.contrib.contenttypes.admin import GenericTabularInline
from django.contrib.admin import TabularInline
from guardian.shortcuts import get_perms_for_model
from guardian.utils import get_user_obj_perms_model as get_guardian_user_obj_perms_model, get_obj_perms_model
from guardian.utils import get_group_obj_perms_model as get_guardian_group_obj_perms_model
from django import forms
from ..models.unit import Unit
from django.core.exceptions import ImproperlyConfigured
from django.contrib.auth import get_permission_codename
from ..models.resource import Resource
from guardian.models import UserObjectPermissionBase, UserObjectPermission, GroupObjectPermissionBase, GroupObjectPermission


# Generic Object Permissions (django-guardian) Inlines
# Use in ModelAdmin to set ObjectPermissions "in place"


class UserPermissionInlineForm(forms.ModelForm):

    permission_codenames = None
    model_for_permissions = None

    def get_available_permissions_qs(self):
        # get available permissions
        # TODO validate permissions qs
        if self.permission_codenames is None:
            self.available_permissions_qs = get_perms_for_model(self.model_for_permissions)
        return get_perms_for_model(self.model_for_permissions).filter(
            codename__in=self.permission_codenames)

    def set_querysets(self):
        self.base_fields['permission'].queryset = self.available_permissions_qs

    def __init__(self, *args, **kwargs):
        self.available_permissions_qs = self.get_available_permissions_qs()
        # try if configured permissions exists. fail otherwise.
        if self.available_permissions_qs.count() < len(self.permission_codenames):
            raise ImproperlyConfigured('Some of the the set in %s permissions do not exist: %s' % (self.__class__.__name__, str(self.permission_codenames)))
        self.set_querysets()
        super().__init__(*args, **kwargs)


class SingleUserPermissionInlineForm(UserPermissionInlineForm):

    def __init__(self, *args, **kwargs):
        if len(self.permission_codenames) > 1:
            raise ImproperlyConfigured("SingleUserPermission.permission_codenames must only contain 1 codename.")
        super().__init__(*args, **kwargs)

    def set_querysets(self):
        pass

    def save(self, commit=True):
        # set permission before saving
        self.instance.permission = self.available_permissions_qs.get()
        return super().save(commit)


def permission_inlineform_factory(model, permission_codenames, form=UserPermissionInlineForm):
    class_name = model.__name__ + 'Form'

    # # Class attributes for the new form class.
    form_class_attrs = {
        #'Meta': Meta,
        'permission_codenames': permission_codenames,
        'model_for_permissions': model
    }

    # Instantiate type(form) in order to use the same metaclass as form.
    return type(form)(class_name, (form,), form_class_attrs)


# class UserPermissionInline(GenericTabularInline):
#     ct_field = "content_type"
#     ct_fk_field = "object_pk"
#     model = get_guardian_user_obj_perms_model()
#     fields = ('user', 'permission', 'modified_at')
#     readonly_fields = ('modified_at',)
#     autocomplete_fields = ('user',)
#     extra = 0
#
#     permission_codenames = None
#     model_for_permissions = None
#     base_form = UserPermissionInlineForm
#
#     def __init__(self, *args, **kwargs):
#         self.form = permission_inlineform_factory(self.model_for_permissions, self.permission_codenames, form=self.base_form)
#         return super().__init__(*args, **kwargs)
#
#     def get_queryset(self, request):
#         qs = super().get_queryset(request)
#         return qs.filter(permission__codename__in=self.permission_codenames)
#
#     def has_permission(self, request, obj, codename='change'):
#         """
#         Can be implemented by subclass.
#         """
#         opts = self.model_for_permissions._meta
#         codename = get_permission_codename(codename, opts)
#         # FIXME add , obj=obj to check object specific permission?
#         return request.user.has_perm("%s.%s" % (opts.app_label, codename))
#
#     def has_change_permission(self, request, obj=None):
#         return self.has_permission(request, obj) #or obj.has_change_permission(request, obj)
#
#     def has_add_permission(self, request, obj=None):
#         return self.has_permission(request, obj) #or obj.has_add_permission(request, obj)
#
#     def has_delete_permission(self, request, obj=None):
#         return self.has_permission(request, obj) #or obj.has_delete_permission(request, obj)
#
#
# class SingleUserPermissionInline(UserPermissionInline):
#     fields = ('user', 'modified_at')
#     readonly_fields = ('modified_at',)
#     base_form = SingleUserPermissionInlineForm
#
#
# class GroupPermissionInline(GenericTabularInline):
#     ct_field = "content_type"
#     ct_fk_field = "object_pk"
#     model = get_guardian_group_obj_perms_model()
#     fields = ('group', 'permission', 'modified_at')
#     readonly_fields = ('modified_at',)
#     autocomplete_fields = ('group',)
#     extra = 0
#
# class SingleGroupPermissionInline(GroupPermissionInline):
#     fields = ('group', 'modified_at')
#     readonly_fields = ('modified_at',)
#     base_form = SingleUserPermissionInlineForm



# Direct object permissions related to Resource

class UserResourcePermissionInline(TabularInline):
    model = get_obj_perms_model(Resource(), UserObjectPermissionBase, UserObjectPermission)
    fields = ('user', 'permission', 'modified_at')
    readonly_fields = ('modified_at',)
    autocomplete_fields = ('user',)
    extra = 0

    permission_codenames = None
    model_for_permissions = None
    base_form = UserPermissionInlineForm

    def __init__(self, *args, **kwargs):
        self.form = permission_inlineform_factory(self.model_for_permissions, self.permission_codenames, form=self.base_form)
        return super().__init__(*args, **kwargs)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(permission__codename__in=self.permission_codenames)

    def has_permission(self, request, obj, codename='change'):
        """
        Can be implemented by subclass.
        """
        opts = self.model_for_permissions._meta
        codename = get_permission_codename(codename, opts)
        # FIXME add , obj=obj to check object specific permission?
        return request.user.has_perm("%s.%s" % (opts.app_label, codename))

    def has_change_permission(self, request, obj=None):
        return self.has_permission(request, obj) #or obj.has_change_permission(request, obj)

    def has_add_permission(self, request, obj=None):
        return self.has_permission(request, obj) #or obj.has_add_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        return self.has_permission(request, obj) #or obj.has_delete_permission(request, obj)


class SingleUserResourcePermissionInline(UserResourcePermissionInline):
    fields = ('user', 'modified_at')
    readonly_fields = ('modified_at',)
    base_form = SingleUserPermissionInlineForm


class GroupResourcePermissionInline(TabularInline):
    model = get_obj_perms_model(Resource(), GroupObjectPermissionBase, GroupObjectPermission)
    fields = ('group', 'permission', 'modified_at')
    readonly_fields = ('modified_at',)
    autocomplete_fields = ('group',)
    extra = 0


class SingleGroupResourcePermissionInline(GroupResourcePermissionInline):
    fields = ('group', 'modified_at')
    readonly_fields = ('modified_at',)
    base_form = SingleUserPermissionInlineForm


class UserUnitPermissionInline(UserResourcePermissionInline):
    model = get_obj_perms_model(Unit(), UserObjectPermissionBase, UserObjectPermission)