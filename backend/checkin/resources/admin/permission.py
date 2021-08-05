from __future__ import unicode_literals
from django.contrib import admin
from django.db import models
from django.contrib.admin import ModelAdmin
from django.utils.translation import gettext_lazy as _
from guardian.shortcuts import get_user_obj_perms_model
from .list_filters import UserFilter
from ..models.resource import Resource
from django.utils.functional import cached_property

UserPermission = get_user_obj_perms_model()

class ResourceAccessPermission(UserPermission):

    class Meta:
        proxy = True
        verbose_name = _("Resource access permission")
        verbose_name_plural = _("Resource access permissions")
        default_permissions = ('view',)

    # def __str__(self):
    #     return _("%(profile)s on %(date)s for reservation %(reservation)s") % \
    #            {'profile': self.user, 'date': self.reservation.display_duration, 'reservation': self.reservation}

class AccessPermissionAdmin(ModelAdmin):
    readonly_fields = (
    'user', 'content_object', 'modified_at')
    fields = readonly_fields
    # list_editable = ()
    list_display = ('user', 'content_object', 'modified_at')
    list_filter = (UserFilter,)
    search_fields = ('user__first_name', 'user__last_name',)

    # list_display_links = ('user','resource')

    PERMISSION_CODENAMES = ('resource:has_permanent_access',)

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        qs = qs.filter(permission__codename__in=self.PERMISSION_CODENAMES)
        return qs

admin.site.register(ResourceAccessPermission, AccessPermissionAdmin)