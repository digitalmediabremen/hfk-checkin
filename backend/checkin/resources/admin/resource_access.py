from .resource import ResourceAdmin, AccessAllowedToResourceUserPermissionInline
from ..models.resource import Resource
from django.contrib import admin
from django.utils.translation import ugettext_lazy as _


class ResourceAccess(Resource):
    class Meta:
        proxy = True
        managed = False
        verbose_name = _("Access Permissions")
        verbose_name_plural = _("Access Permissions for Spaces")


class ResourceAccessAdmin(ResourceAdmin):
    #autocomplete_fields = ('access_delegates','booking_delegates')
    inlines = [AccessAllowedToResourceUserPermissionInline]
    fields = ('name','numbers')
    fieldsets = None
    readonly_fields = fields
    list_display = ResourceAdmin.list_display

    # hide model admin from admin list
    get_model_perms = lambda self, req: {}

    def has_change_permission(self, request, obj=None):
        if request.user and obj:
            return obj.can_modify_access(request.user) or super().has_change_permission(request, obj)
        return False

admin.site.register(ResourceAccess, ResourceAccessAdmin)