from __future__ import unicode_literals
from django.contrib import admin
from django.db import models
from django.contrib.admin import ModelAdmin
from django.utils.translation import gettext_lazy as _
from guardian.shortcuts import get_user_obj_perms_model
from .list_filters import UserFilter
from ..models.resource import Resource
from admin_auto_filters.filters import AutocompleteFilter

UserPermission = get_user_obj_perms_model()
PERMISSION_CODENAMES = ('resource:has_permanent_access', 'resource:can_modify_access')

class ResourceFilter(admin.SimpleListFilter):
    title = _("Resource")
    field_name = 'content_object'
    parameter_name = 'content_object'

    def lookups(self, request, model_admin):
        resource_permissions = UserPermission.objects.filter(permission__codename__in=PERMISSION_CODENAMES).distinct('object_pk')
        permitted_resources = Resource.objects.filter(pk__in=[r.object_pk for r in resource_permissions])
        return [(r.pk, r.display_name) for r in permitted_resources]

    def queryset(self, request, queryset):
        if not self.value():
            return queryset
        return queryset.filter(object_pk=self.value())


class ResourcePermission(UserPermission):

    class Meta:
        proxy = True
        verbose_name = _("Resource access permission")
        verbose_name_plural = _("Resource access permissions")
        default_permissions = ('view',)

    # def __str__(self):
    #     return _("%(profile)s on %(date)s for reservation %(reservation)s") % \
    #            {'profile': self.user, 'date': self.reservation.display_duration, 'reservation': self.reservation}


class AccessPermissionAdmin(ModelAdmin):
    # list_editable = ()
    list_display = ('get_first_name', 'get_last_name', 'get_resource', 'get_permission_name', 'modified_at')
    # readonly_fields = (
    # 'user', 'content_object', 'modified_at')
    readonly_fields = ('get_first_name', 'get_last_name', 'get_student_number', 'get_email', 'get_resource','get_permission_name', 'modified_at')
    fields = readonly_fields
    list_display_links = ('get_first_name', 'get_last_name', 'get_resource')
    list_filter = (UserFilter,ResourceFilter)
    search_fields = ('user__first_name', 'user__last_name',)

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        qs = qs.filter(permission__codename__in=PERMISSION_CODENAMES)
        return qs

    def get_first_name(self, obj):
        return obj.user.first_name
    get_first_name.short_description = _("First name")
    get_first_name.admin_order_field = ('user__first_name')

    def get_last_name(self, obj):
        return obj.user.last_name
    get_last_name.short_description = _("Last name")
    get_last_name.admin_order_field = ('user__last_name')

    def get_student_number(self, obj):
        if hasattr(obj.user, "profile"):
            return obj.user.profile.student_number
    get_student_number.short_description = _("Student number")
    get_student_number.admin_order_field = ('user__profile__student_number')

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = _("Email")
    get_email.admin_order_field = ('user__email')

    def get_resource(self, obj):
        return obj.content_object
    get_resource.short_description = _("Resource")
    get_resource.admin_order_field = ('conent_object')

    def get_permission_name(self, obj):
        return _(obj.permission.name)
    get_permission_name.short_description = _("Permission")
    get_permission_name.admin_order_field = ('permission__codename')

admin.site.register(ResourcePermission, AccessPermissionAdmin)