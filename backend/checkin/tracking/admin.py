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
from impersonate.admin import UserAdminImpersonateMixin
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin

from .views.paper_log import PaperLogAdmin


class NewUserAdmin(UserAdminImpersonateMixin, UserAdmin):
    open_new_window = True
    pass


admin.site.unregister(User)
admin.site.register(User, NewUserAdmin)


class ProfileAdmin(SimpleHistoryAdmin):
    # TODO: default query set nur nicht Verifiziert
    # TODO: default query set nur neue Nutzer

    list_display = ('id','first_name', 'last_name','phone_obfuscated','email_obfuscated','verified','created_at')
    # ! overwritten by get_list_display to upgrade permission
    # readonly_fields = ('last_checkin',)
    list_editable = ('verified',)
    list_filter = ('updated_at','created_at','verified')
    search_fields = ['first_name', 'last_name','phone','email']
    readonly_fields = ('created_at', 'updated_at')
    search_fields = ['first_name', 'last_name', 'phone']

    def get_list_display(self, request):
        phone = 'phone' if request.user.has_perm('tracking.can_view_full_phone_number') else 'phone_obfuscated'
        email = 'email' if request.user.has_perm('tracking.can_view_full_email') else 'email_obfuscated'
        list_display = ['id', 'first_name', 'last_name', phone, email, 'verified', 'created_at']
        return list_display

    # TODO hide email in change view or make sure people understand change view will display all fields.

    def get_queryset(self, request):
        qs = super(ProfileAdmin, self).get_queryset(request)
        if request.user.has_perm('tracking.can_view_all_users'):
            return qs
        return qs.exclude(verified=True)

    def phone_obfuscated(self, object):
        if object.phone:
            m = object.phone
            return f'{m[0]}{m[1]}{m[2]}{m[3]}{m[4]}{"*" * (len(m) - 6)}{m[-1]}'
    phone_obfuscated.short_description = _("Telefonnummer")

    def email_obfuscated(self, object):
        if object.email:
            m = object.email.split('@')
            return f'{m[0][0]}{m[0][1]}{"*" * (len(m[0]) - 4)}{m[0][-2]}{m[0][-1]}@{m[1]}'
    email_obfuscated.short_description = _("E-Mail Adresse")

    # def has_add_permission(self, request):
    #     return False
    # Needed to add person in bookingrequests (and paper entry)


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
admin.site.register(Profile, ProfileAdmin)
admin.site.register(ActivityProfile, ActivityProfileAdmin)
admin.site.register(LocationUsage)
admin.site.register(BookingMethod)