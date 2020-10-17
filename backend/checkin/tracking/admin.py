from django.contrib import admin
from django import forms
from mptt.admin import MPTTModelAdmin
from .models import *
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _


class ProfileAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name','verified')
    # readonly_fields = ('last_checkin',)
    list_editable = ('verified',)
    list_filter = ('updated_at','created_at')

    def get_queryset(self, request):
        qs = super(ProfileAdmin, self).get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.exclude(verified=True)


class ActivityProfileAdmin(admin.ModelAdmin):
    list_display = ('name_de', 'distance_rule_de', 'name_en', 'distance_rule_en')


class CapacityForActivityProfileInline(admin.TabularInline):
    model = CapacityForActivityProfile
    max_num = 3


def generate_pdfs_for_selected_objects(modeladmin, request, queryset):
    selected = queryset.values_list('code', flat=True)
    return HttpResponseRedirect(reverse('pdf-export') + '?codes=%s' % ','.join(str(code) for code in selected))

generate_pdfs_for_selected_objects.short_description = _("PDF-Raumkarten für ausgewählte Standorte generieren")

class LocationAdmin(MPTTModelAdmin):
    readonly_fields = ('code',)
    list_display = ('org_name', 'org_number', 'org_size', 'capacity', 'load', 'load_descendants', 'code', 'updated_at')
    inlines = [CapacityForActivityProfileInline]
    actions = [generate_pdfs_for_selected_objects]
    list_filter = ('updated_at',)
    ordering = ('org_number',)


class CheckinAdmin(admin.ModelAdmin):
    """Disables all editing capabilities."""
    list_display = ('location','profile_id','time_entered','origin_entered','time_left','origin_left')
    list_filter = ('location', 'time_entered','time_left')

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