from django.contrib import admin
from django import forms
from mptt.admin import MPTTModelAdmin
from .models import *


class ProfileAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name','verified')
    # readonly_fields = ('last_checkin',)
    list_editable = ('verified',)


class ActivityProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')


class CapacityForActivityProfileInline(admin.TabularInline):
    model = CapacityForActivityProfile


class LocationAdmin(MPTTModelAdmin):
    readonly_fields = ('code',)
    list_display = ('org_name', 'org_number', 'org_size', 'capacity', 'load', 'load_descendants', 'code')
    inlines = [CapacityForActivityProfileInline]


class CheckinAdmin(admin.ModelAdmin):
    """Disables all editing capabilities."""
    list_display = ('location','profile','time_entered','origin_entered','time_left','origin_left')

    actions = None

    # We cannot call super().get_fields(request, obj) because that method calls
    # get_readonly_fields(request, obj), causing infinite recursion. Ditto for
    # super().get_form(request, obj). So we  assume the default ModelForm.
    def get_readonly_fields(self, request, obj=None):
        return self.fields or [f.name for f in self.model._meta.fields]

    def has_add_permission(self, request):
        return False

    # Allow viewing objects but not actually changing them.
    def has_change_permission(self, request, obj=None):
        return (request.method in ['GET', 'HEAD'] and
                super().has_change_permission(request, obj))

    def has_delete_permission(self, request, obj=None):
        return False

admin.site.register(Location,LocationAdmin)
admin.site.register(Checkin,CheckinAdmin)
admin.site.register(Profile,ProfileAdmin)
admin.site.register(ActivityProfile,ActivityProfileAdmin)
admin.site.register(LocationUsage)
admin.site.register(BookingMethod)