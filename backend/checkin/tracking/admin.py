from django.contrib import admin
from django import forms
from mptt.admin import MPTTModelAdmin
from .models import *
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from simple_history.admin import SimpleHistoryAdmin


class ProfileAdmin(SimpleHistoryAdmin):
    list_display = ('id','first_name', 'last_name','phone_obfuscated','email_obfuscated','verified')
    # readonly_fields = ('last_checkin',)
    list_editable = ('verified',)
    list_filter = ('updated_at','created_at','verified')
    search_fields = ['first_name', 'last_name','phone','email']

    def get_queryset(self, request):
        qs = super(ProfileAdmin, self).get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.exclude(verified=True)

    def phone_obfuscated(self, object):
        if object.phone:
            m = object.phone
            return f'{m[0]}{m[1]}{m[2]}{m[3]}{m[4]}{"*" * (len(m) - 6)}{m[-1]}'
    phone_obfuscated.short_description = _("Telefon")

    def email_obfuscated(self, object):
        if object.email:
            m = object.email.split('@')
            return f'{m[0][0]}{m[0][1]}{"*" * (len(m[0]) - 4)}{m[0][-2]}{m[0][-1]}@{m[1]}'
    email_obfuscated.short_description = _("E-Mail")


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
    list_display = ('org_name', 'org_number', 'org_size', 'capacity', 'code', 'updated_at')
    list_display_with_loads = ('org_name', 'org_number', 'org_size', 'capacity', 'code', 'load', 'load_descendants', 'updated_at')
    inlines = [CapacityForActivityProfileInline]
    actions = [generate_pdfs_for_selected_objects]
    list_filter = ('updated_at',)
    #ordering = ('org_number',)
    search_fields = ['org_name', 'org_number','code']

    def get_list_display(self, request):
        if request.user.has_perm('tracking.can_display_location_loads'):
            return self.list_display_with_loads
        return self.list_display


class CheckinAdmin(admin.ModelAdmin):
    """Disables all editing capabilities."""
    list_display = ('location','profile_id','time_entered','origin_entered','time_left','origin_left')
    list_filter = ('location', 'time_entered', 'time_left')

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