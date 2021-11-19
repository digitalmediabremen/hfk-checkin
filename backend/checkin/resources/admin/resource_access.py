from .resource import ResourceAdmin, AccessAllowedToResourceUserPermissionInline
from .reservation import ReservationAdmin, AttendanceInline
from ..models.resource import Resource
from ..models.reservation import Reservation
from django.contrib import admin
from django.utils.translation import ugettext_lazy as _
from .other import ExtendedGuardedModelAdminMixin
from django.shortcuts import redirect


class ResourceAccess(Resource):
    class Meta:
        proxy = True
        managed = False
        verbose_name = _("Access Permissions")
        verbose_name_plural = _("Access Permissions for Spaces")
        default_permissions = ()


class ResourceAccessAdmin(ResourceAdmin):
    #autocomplete_fields = ('access_delegates','booking_delegates')
    inlines = [AccessAllowedToResourceUserPermissionInline]
    fields = ('name','numbers')
    fieldsets = None
    readonly_fields = fields
    list_display = ResourceAdmin.list_display

    # hide model admin from admin list
    get_model_perms = lambda self, req: {}

    def changelist_view(self, request, extra_context=None):
        return redirect('admin:resources_resource_changelist')

    def has_change_permission(self, request, obj=None):
        if request.user and obj:
            return obj.can_modify_access(request.user) or super().has_change_permission(request, obj)
        return False

    def has_delete_permission(self, request, obj=None):
        return False

admin.site.register(ResourceAccess, ResourceAccessAdmin)


class ReservationAttendance(Reservation):
    class Meta:
        proxy = True
        managed = False
        verbose_name = _("Attendance list for reservation")
        verbose_name_plural = _("Attendance list for reservations")
        default_permissions = ()


class ReservationAttendanceAdmin(ReservationAdmin):
    #autocomplete_fields = ('access_delegates','booking_delegates')
    inlines = [AttendanceInline]
    fields = ('resource','user','display_duration','state', 'message')
    readonly_fields = fields
    fieldsets = None
    list_display = ReservationAdmin.list_display

    # hide model admin from admin list
    get_model_perms = lambda self, req: {}

    def has_change_permission(self, request, obj=None):
        if request.user and obj:
            return super().has_change_permission(request, obj)
        return False

    def validate_and_warn(self,request,obj):
        # skip validation for this limited view
        pass

admin.site.register(ReservationAttendance, ReservationAttendanceAdmin)