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

from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin



class ActivityProfileAdmin(admin.ModelAdmin):
    list_display = ('name_de', 'distance_rule_de', 'name_en', 'distance_rule_en')


class CapacityForActivityProfileInline(admin.TabularInline):
    model = CapacityForActivityProfile
    max_num = 3


def generate_pdfs_for_selected_objects(modeladmin, request, queryset):
    selected = queryset.values_list('code', flat=True)
    return HttpResponseRedirect(reverse('pdf-export') + '?codes=%s' % ','.join(str(code) for code in selected))


generate_pdfs_for_selected_objects.short_description = _("PDF-Raumkarten für ausgewählte Standorte generieren")


class LocationAdmin(MPTTModelAdmin, SimpleHistoryAdmin, DynamicArrayMixin):
    readonly_fields = ('code',)
    list_display = ('org_name_method', 'org_number', 'org_size', 'capacity_1', 'capacity_2', 'capacity_3', 'code', 'updated_at')
    list_display_with_loads = ('org_name_method', 'org_number', 'org_size', 'capacity_1', 'capacity_2', 'capacity_3', 'code',  'checkins_sum', 'real_load', 'updated_at')
    inlines = [CapacityForActivityProfileInline]
    actions = [generate_pdfs_for_selected_objects]
    list_filter = ('updated_at','removed','org_usage','org_bookable','org_book_via','org_activities')
    #ordering = ('org_number','checkin_')
    search_fields = ['org_name', 'org_number','code']
    list_max_show_all = 1000
    mptt_indent_field = "org_name_method"
    search_fields = ['code','org_name', 'org_number']

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

    # TODO: do not repeat yourself.

    def capacity_1(self, obj):
        activities = obj.org_activities.through.objects.filter(location=obj).order_by('capacity').all()
        return activities[0].capacity if len(activities) > 0 else None
    capacity_1.short_description = _("K 1")

    def capacity_2(self, obj):
        activities = obj.org_activities.through.objects.filter(location=obj).order_by('capacity').all()
        return activities[1].capacity if len(activities) > 1 else None
    capacity_2.short_description = _("K 2")

    def capacity_3(self, obj):
        activities = obj.org_activities.through.objects.filter(location=obj).order_by('capacity').all()
        return activities[2].capacity if len(activities) > 2 else None
    capacity_3.short_description = _("K 3")


class CheckinAdmin(admin.ModelAdmin):
    """Disables all editing capabilities."""
    list_display = ('pk','location','profile_id','time_entered','origin_entered','time_left','origin_left')
    list_filter = ('location', 'time_entered', 'time_left')

    actions = None

    def get_queryset(self, request):
        return Checkin.objects

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

admin.site.register(Location, LocationAdmin)
admin.site.register(Checkin, CheckinAdmin)
admin.site.register(ActivityProfile, ActivityProfileAdmin)
admin.site.register(LocationUsage)
admin.site.register(BookingMethod)