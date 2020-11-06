from django.contrib import admin
from django import forms
from mptt.admin import MPTTModelAdmin, DraggableMPTTAdmin
from .models import *
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from simple_history.admin import SimpleHistoryAdmin
from django.utils.html import format_html
from django.urls import reverse, path
from .views.contact_report import case_evaluation_view
from django.utils.html import format_html

class ProfileAdmin(SimpleHistoryAdmin):
    # TODO: default query set nur nicht Verifiziert
    # TODO: default query set nur neue Nutzer

    list_display = ('id','first_name', 'last_name','phone_obfuscated','email_obfuscated','verified','created_at')
    # readonly_fields = ('last_checkin',)
    list_editable = ('verified',)
    list_filter = ('updated_at','created_at','verified')
    search_fields = ['first_name', 'last_name','phone','email']
    readonly_fields = ('created_at', 'updated_at')

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

    def has_add_permission(self, request):
        return False


class ActivityProfileAdmin(admin.ModelAdmin):
    list_display = ('name_de', 'distance_rule_de', 'name_en', 'distance_rule_en')


class CapacityForActivityProfileInline(admin.TabularInline):
    model = CapacityForActivityProfile
    max_num = 3


def generate_pdfs_for_selected_objects(modeladmin, request, queryset):
    selected = queryset.values_list('code', flat=True)
    return HttpResponseRedirect(reverse('pdf-export') + '?codes=%s' % ','.join(str(code) for code in selected))

generate_pdfs_for_selected_objects.short_description = _("PDF-Raumkarten für ausgewählte Standorte generieren")

class LocationAdmin(MPTTModelAdmin, SimpleHistoryAdmin):
    readonly_fields = ('code',)
    list_display = ('org_name_method', 'org_number', 'org_size', 'capacity', 'code', 'updated_at')
    list_display_with_loads = ('org_name_method', 'org_number', 'org_size', 'capacity', 'code',  'checkins_sum', 'real_load', 'updated_at')
    inlines = [CapacityForActivityProfileInline]
    actions = [generate_pdfs_for_selected_objects]
    #ordering = ('org_number',)
    list_filter = ('updated_at','removed')
    search_fields = ['org_name', 'org_number','code']
    list_max_show_all = 1000
    mptt_indent_field = "org_name_method"

    def get_list_display(self, request):
        if request.user.has_perm('tracking.can_display_location_loads'):
            return self.list_display_with_loads
        return self.list_display

    def org_name_method(self, obj):
        if obj.removed:
            return format_html(
                '<strike>{}</strike>',
                obj.org_name,
            )
        return obj.org_name
    org_name_method.short_description = _("Raumname / Standort")
    org_name_method.admin_order_field = 'org_name'


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

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('evaluate/', self.admin_site.admin_view(case_evaluation_view), name='checkin-evaluation'),
        ]
        return custom_urls + urls

admin.site.register(Location,LocationAdmin)
admin.site.register(Checkin,CheckinAdmin)
admin.site.register(Profile,ProfileAdmin)
admin.site.register(ActivityProfile,ActivityProfileAdmin)
admin.site.register(LocationUsage)
admin.site.register(BookingMethod)