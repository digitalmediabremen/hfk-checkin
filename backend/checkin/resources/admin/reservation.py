import logging
from django.contrib import admin
from django.utils.translation import ugettext_lazy as _
from modeltranslation.admin import TranslationAdmin, TranslationStackedInline
from .mixins import ExtraReadonlyFieldsOnUpdateMixin, CommonExcludeMixin, PopulateCreatedAndModifiedMixin
from rangefilter.filter import DateRangeFilter, DateTimeRangeFilter
from ..models import Attendance
from django.contrib import messages
import warnings


logger = logging.getLogger(__name__)


class AttendanceInline(admin.TabularInline):
    autocomplete_fields = ('user',)
    model = Attendance
    readonly_fields = ('modified_at','modified_by')
    extra = 0


class ReservationAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, ExtraReadonlyFieldsOnUpdateMixin,
                       admin.ModelAdmin):
    #extra_readonly_fields_on_update = ('access_code',)
    list_display = ('short_uuid', 'user','resource','begin','end','state','modified_at')
    list_filter = ('type','resource','resource__unit','state',
                   # 'resources', 'start', 'end', 'status', 'is_important',
                   ('created_at', DateRangeFilter),
                   ('modified_at', DateTimeRangeFilter),)
    search_fields = ('uuid','user__first_name', 'user__last_name', 'user__username', 'user__email')
    autocomplete_fields = ('user', 'resource')
    readonly_fields = ('uuid','approver','number_of_attendees')
    extra_readonly_fields_edit = ('agreed_to_phone_contact','organizer_is_attending','type')
    inlines = [AttendanceInline]

    fieldsets = (
        (None, {
            'fields': ('resource', 'user',  'begin', 'end', 'uuid')# 'short_uuid')
        }),
        (_('State'), {
            'fields': ('state', 'approver'),
        }),
        (_('Details'), {
            # 'classes': ('collapse',),
            'fields': ('comments', 'has_priority', 'exclusive_resource_usage', 'number_of_extra_attendees', 'number_of_attendees', 'agreed_to_phone_contact', 'organizer_is_attending', 'type'),
        }),
        # (_('Creation and modifications'), {
        #     'classes': ('collapse',),
        #     'fields': ('created_at','created_by','modified_at','modified_by'),
        # }),
    )
    radio_fields = {'state': admin.HORIZONTAL}

    def get_readonly_fields(self, request, obj=None):
        if obj:  # obj is not None, so this is an edit
            return self.readonly_fields + self.extra_readonly_fields_edit
        else:  # This is an addition
            return self.readonly_fields

    _original_state = None

    def validate_and_warn(self, request, obj):
        with warnings.catch_warnings(record=True) as warns:
            obj.validate_reservation()
        for w in warns:
            messages.add_message(request, messages.WARNING, str(w.message))

    def render_change_form(self, request, context, add=False, change=False, form_url='', obj=None):
        if obj:
            self.validate_and_warn(request, obj)
        return super().render_change_form(request, context, add, change, form_url, obj)

    # process state changes between original Reservation.state and new state
    # FIXME can the model handle the state change by itself?

    def get_form(self, request, obj=None, **kwargs):
        if obj:
            self._original_state = obj.state
        return super().get_form(request, obj, **kwargs)

    def save_model(self, request, obj, form, change):
        if self._original_state:
            obj.process_state_change(self._original_state, obj.state, request.user)
        messages.add_message(request, messages.INFO, str(obj.get_state_verbose()))
        super().save_model(request, obj, form, change)

    # def save_formset(self, request, form, formset, change):
    #     #super(ReservationAdmin, self).save_model(request, obj, form, change)
    #     print(form.state)
    #     #obj.set_state(obj.state, request.user)
    #     #obj.save()
    #     super().save_formset(request, form, formset, change)


class ReservationCancelReasonCategoryAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, TranslationAdmin):
    pass


class ReservationCancelReasonAdmin(PopulateCreatedAndModifiedMixin, admin.ModelAdmin):
    raw_id_fields = ('reservation',)
    readonly_fields = ('created_by', 'modified_by')

