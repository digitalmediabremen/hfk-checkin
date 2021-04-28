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
from rangefilter.filter import DateRangeFilter, DateTimeRangeFilter

from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from .admin_list_filters import ProfileFilter, LocationFilter



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
    list_display = ('get_name', 'display_numbers', 'area', 'capacity', 'code', 'updated_at')
    list_display_with_loads = ('get_name', 'display_numbers', 'area', 'capacity', 'code',  'checkins_sum', 'real_load', 'updated_at')
    inlines = [CapacityForActivityProfileInline]
    actions = [generate_pdfs_for_selected_objects]
    list_filter = ('updated_at','removed')
    search_fields = ['_number', '_number', 'resource__name', 'resource__numbers','code']
    list_max_show_all = 1000
    mptt_indent_field = "get_name"

    def get_list_display(self, request):
        if request.user.has_perm('tracking.can_display_location_loads'):
            return self.list_display_with_loads
        return self.list_display

    def get_name(self, obj):
        if obj.removed:
            return format_html(
                '<strike>{}</strike>',
                str(obj)
            )
        return str(obj)
    get_name.short_description = _("Raumname / Standort")
    get_name.admin_order_field = 'resource.name'

    # TODO: do not repeat yourself.

    # FIXME: these make too many queries

    # def capacity_1(self, obj):
    #     activities = obj.org_activities.through.objects.filter(location=obj).order_by('capacity').all()
    #     return activities[0].capacity if len(activities) > 0 else None
    # capacity_1.short_description = _("K 1")
    #
    # def capacity_2(self, obj):
    #     activities = obj.org_activities.through.objects.filter(location=obj).order_by('capacity').all()
    #     return activities[1].capacity if len(activities) > 1 else None
    # capacity_2.short_description = _("K 2")
    #
    # def capacity_3(self, obj):
    #     activities = obj.org_activities.through.objects.filter(location=obj).order_by('capacity').all()
    #     return activities[2].capacity if len(activities) > 2 else None
    # capacity_3.short_description = _("K 3")


class CheckinAdmin(admin.ModelAdmin):
    """Disables all editing capabilities."""
    list_display = ('pk','location','profile_id','time_entered','origin_entered','time_left','origin_left')
    search_fields = ('profile__id', 'profile__first_name', 'profile__last_name', 'location___name', 'location__resource__name', 'location___number', 'location__resource__numbers',)
    list_filter = (ProfileFilter, LocationFilter, ('time_entered', DateRangeFilter),'origin_entered',('time_left', DateTimeRangeFilter),'origin_left')

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


from .views.paper_log import PaperLogSingleLineInline, PaperLogAdminForm

class PaperLogAdmin(admin.ModelAdmin):
    inlines = [PaperLogSingleLineInline]
    form = PaperLogAdminForm
    autocomplete_fields = ['profile']
    list_display = ['profile', 'date', 'entries_number', 'signed', 'created_at', 'comment']
    list_filter = (('date', DateRangeFilter),('created_at', DateTimeRangeFilter),'signed')
    date_hierarchy = 'date'
    search_fields = ('profile__id', 'profile__first_name', 'profile__last_name')
    fieldsets = (
        ('Personendaten suchen', {
            'fields': ('profile',),
        }),
        ('Personendaten hinzufügen, falls Person nicht zu finden ist oder vorhandenes Profil ändern', {
            'fields': ('first_name', 'last_name', 'phone', 'student_number'),
            #'classes': ('collapse',),
            'description': 'Achtung: Falls oben ein Profil ausgewählt wurde, werden die hier eingegebenen Daten gewählten Profil gespeichert.<br/>' \
            'Stellen Sie sicher, dass oben kein Profil gewählt ist, falls sie eine bisher nicht erfasste Person hinterlegen wollen.</br>',
        }),
        (None, {
            'fields': ('date', 'signed','comment'),
        }),
        (None, {
            'fields': [],
            'description': 'Geben Sie nachfolgend die Aufenthalte in einzelen Räumen / an einzelnen Standtorten ein. '\
            'Uhrzeiten müssen das Format <strong>HH:MM</strong> oder verkürzt <strong>HHMM</strong> (ohne Doppelpunkt) haben. Zweistellige Eingaben sind ungültig. Bitte achten sie darauf Uhrzeiten, die auf den <strong>Folgetag (nach 23:59)</strong> fallen, mit der entsp. Checkbox zu markieren. Anderfalls würden die Zeitangaben falsch erfasst werden. '\
            'Das Feld "Persönliche Referenz" muss nur bei wichtigen Mitteilungen eingegeben werden.<br/>Bitte konsultieren Sie bei Fragen und Problemen mit der Eingabe die Gebrauchsanweisung oder melden Sie sich bei ' \
            'checkin@hfk-bremen.de.',
        }),
    )

    def entries_number(self, object):
        return object.papercheckin_set.count()
    entries_number.short_description = _("Anazhl der Aufenthalte")

    # TODO add instructions what to do now. Stamp the paper log for example.
    # TODO default first inline to location Speicher XI / 9270. (need some kind of setting option)
    # TODO auf "Persönliche Referenz" verzichten? Lieber nicht, da sonst keinn vollständiges Digitalisat erstellt werden kann.
    # TODO Warnung bei Doppelten oder Ähnlichen profilen?


admin.site.register(Location, LocationAdmin)
admin.site.register(Checkin, CheckinAdmin)
admin.site.register(ActivityProfile, ActivityProfileAdmin)
admin.site.register(LocationUsage)
admin.site.register(BookingMethod)
admin.site.register(PaperLog, PaperLogAdmin)