import logging
from django.contrib import admin
from django.utils.translation import ugettext_lazy as _
from modeltranslation.admin import TranslationAdmin, TranslationStackedInline
from .mixins import ExtraReadonlyFieldsOnUpdateMixin, CommonExcludeMixin, PopulateCreatedAndModifiedMixin
from rangefilter.filter import DateRangeFilter, DateTimeRangeFilter
from ..models import Attendance, Reservation
from ..models.reservation import ReservationWarning, ReservationCriticalWarning, ReservationNotice
from django.contrib import messages
import warnings
from django.core.exceptions import ValidationError
from django import forms
from post_office.models import Email
from django.urls import reverse
from .other import FixedGuardedModelAdminMixin
from .resource import ResourceAdmin
from .list_filters import ResourceFilter, UserFilter
from django.contrib.admin.utils import format_html

logger = logging.getLogger(__name__)


class AttendanceInline(admin.TabularInline):
    autocomplete_fields = ('user',)
    model = Attendance
    fields = ('get_organizer','user','state','comment','modified_at')
    #readonly_fields = ('get_organizer', 'modified_at','modified_by')
    readonly_fields = ('modified_at','modified_by','get_organizer')
    extra = 0

    def get_organizer(self, obj):
        return _('🎩') if obj.is_organizer else ''
    get_organizer.short_description = ''
    #get_organizer.boolean = True


class RelatedEmailInline(admin.TabularInline):
    model = Reservation.related_emails.through
    extra = 0
    fields = ('message_id_link', 'subject', 'to')
    readonly_fields = fields
    classes = ['collapse']

    def message_id(self, instance):
        return instance.email.message_id

    def subject(self, instance):
        return instance.email.subject

    def to(self, instance):
        return instance.email.to

    def message_id_link(self, instance):
        url = reverse("admin:%s_%s_change" % (instance.email._meta.app_label, instance.email._meta.module_name),
                      args=(instance.email.pk,))
        return '<a href="%s">%s</a>' % (url, instance.email.message_id)
    message_id_link.allow_tags = True

    def has_change_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request, obj):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class ReservationAdminForm(forms.ModelForm):
    message_state_update = forms.CharField(required=False, label=_('Notification Message'), widget=forms.Textarea(attrs={'cols':80, 'rows':5}),
                                           help_text=_('This message might be used in the notification send to the organizer on this update. The message will not be saved.'))
    class Meta:
        model = Reservation
        fields = ('__all__')

    def clean_state(self):
        value = self.cleaned_data['state']
        if value == Reservation.CREATED:
            raise ValidationError(_("Already existing reservations can not have state %s" % Reservation.CREATED))
        return value


class ReservationAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, ExtraReadonlyFieldsOnUpdateMixin, admin.ModelAdmin):
    #extra_readonly_fields_on_update = ('access_code',)
    list_display = ('get_state_colored','user','resource','get_display_duration','number_of_attendees','get_collisions','get_priority','get_exclusive')
    list_filter = (ResourceFilter,'resource__unit','state','has_priority','exclusive_resource_usage','purpose',
                   UserFilter,
                   # 'resources', 'start', 'end', 'status', 'is_important',
                   ('begin', DateTimeRangeFilter),
                   ('end', DateTimeRangeFilter),
                   'type',
                   ('modified_at', DateTimeRangeFilter),
                   )
    search_fields = ('uuid','resource__name', 'resource__numbers', 'user__first_name', 'user__last_name', 'user__email')
    autocomplete_fields = ('user', 'resource')
    readonly_fields = ('uuid','approver','agreed_to_phone_contact','number_of_attendees','get_reservation_info','get_phone_number')
    extra_readonly_fields_edit = ('organizer_is_attending','type','message','purpose',) # 'user',
    inlines = [AttendanceInline, RelatedEmailInline]
    form = ReservationAdminForm
    date_hierarchy = 'begin'
    actions_on_top = True
    list_display_links = ('user','resource')

    fieldsets = (
        (None, {
            'fields': ('resource', 'user',  'begin', 'end')# 'short_uuid')
        }),
        (_('State'), {
            'fields': ('state','message_state_update','approver','get_reservation_info'),
        }),
        (_('Request details'), {
            #'classes': ('collapse',),
            'fields': ('message', 'purpose', 'has_priority', 'exclusive_resource_usage', 'number_of_extra_attendees', 'number_of_attendees', 'agreed_to_phone_contact', 'get_phone_number','organizer_is_attending', 'type', 'uuid'),
        }),
        # (_('Creation and modifications'), {
        #     'classes': ('collapse',),
        #     'fields': ('created_at','created_by','modified_at','modified_by'),
        # }),
    )
    radio_fields = {'state': admin.HORIZONTAL}
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'user__profile')\
            .prefetch_resource_and_unit()

    def get_readonly_fields(self, request, obj=None):
        if obj:  # obj is not None, so this is an edit
            return self.readonly_fields + self.extra_readonly_fields_edit
        else:  # This is an addition
            return self.readonly_fields

    def get_reservation_info(self, obj):
        if obj and obj.resource:
            return obj.resource.reservation_info
        return self.get_empty_value_display()
    get_reservation_info.short_description = _("Resource instructions")

    def get_phone_number(self, obj):
        # FIXME add permission 'can_display_phone_number_if_agreed'
        if obj.agreed_to_phone_contact:
            return obj.organizer.phone
        return _('(phone contact not allowed)')
    get_phone_number.short_description = _("Phone number")

    def get_priority(self, obj):
        return obj.has_priority
    get_priority.short_description = _("Prio.")
    get_priority.admin_order_field = 'has_priority'
    get_priority.boolean = True

    def get_exclusive(self, obj):
        return obj.exclusive_resource_usage
    get_exclusive.short_description = _("Excl.")
    get_exclusive.admin_order_field = 'exclusive_resource_usage'
    get_exclusive.boolean = True

    def get_display_duration(self, obj):
        return obj.display_duration
    get_display_duration.short_description = _("Timespan")
    get_display_duration.admin_order_field = 'begin'

    def get_collisions(self, obj):
        all_attendees_count = obj.resource.get_total_number_of_attendees_for_period(obj.begin, obj.end)
        if not obj.resource.people_capacity:
            return "%d / ?" % (all_attendees_count,)
        if all_attendees_count > obj.resource.people_capacity:
            return format_html(
                '<b style="color:red;">{} / {}</b>',
                all_attendees_count, obj.resource.people_capacity
            )
        else:
            return "%d / %d" % (all_attendees_count, obj.resource.people_capacity)
    get_collisions.short_description = _("Avail.")

    def get_state_colored(self, obj):
        colors = {
            Reservation.CREATED: '#555',#('green', ''),
            Reservation.CANCELLED: '#E2574C',
            Reservation.CONFIRMED: '#58AD69',
            Reservation.DENIED: '#E2574C',
            Reservation.REQUESTED: '#FFBC49',
            Reservation.WAITING_FOR_PAYMENT: '#FFBC49',
        }
        return format_html(
            '<b style="color:{};">{}</b>',
            colors[obj.state],
            obj.state,
        )
    get_state_colored.short_description = _("State")

    _original_state = None

    def validate_and_warn(self, request, obj):
        with warnings.catch_warnings(record=True) as warns:
            try:
                obj.validate_reservation()
            except ValidationError as e:
                pass
                # form will validate and show errors anyway
                # messages.add_message(request, messages.ERROR, str(e.message))
            for w in warns:
                if issubclass(w.category, ReservationCriticalWarning):
                    messages.add_message(request, messages.ERROR, str(w.message))
                else:
                    messages.add_message(request, messages.WARNING, str(w.message))
        # give some info
        # TODO move all warnings to validate_reservation()
        if obj:
            if obj.is_inactive:
                messages.add_message(request, messages.ERROR, _("Has been cancelled or denied."))
            if obj.has_priority:
                messages.add_message(request, messages.WARNING, _("Has priority."))
            if obj.exclusive_resource_usage:
                messages.add_message(request, messages.WARNING, _("Uses space exclusively."))
            if not obj.organizer_is_attending:
                if obj.organizer in obj.attendees.all():
                    messages.add_message(request, messages.WARNING, _("Organizer does not want to attend. Yet the organizer is in the attendance list."))
                else:
                    messages.add_message(request, messages.WARNING, _("Organizer does not want to attend."))
            if obj.organizer_is_attending and obj.organizer not in obj.attendees.all():
                messages.add_message(request, messages.WARNING, _("The organizer is missing from attendance list."))

    def change_view(self, request, object_id, form_url='', extra_context=None):
        # add extra content for resource calendar
        # FIXME move to template tag
        extra_context = ResourceAdmin.get_resource_calendar_extra_context()
        return super().change_view(
            request, object_id, form_url, extra_context=extra_context,
        )

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

    def process_state_change_and_warn(self,request,obj,form,change):
        # FIXME what if no _original_state. New object?
        if not self._original_state:
            self._original_state = Reservation.CREATED

        # process state change and catch all warnings as messages
        # FIXME improve warnings and notifications in general. Make DRY.
        with warnings.catch_warnings(record=True) as warns:
            message_state_update = form.cleaned_data.get('message_state_update', None)
            obj.process_state_change(self._original_state, obj.state, request.user, update_message=message_state_update)
            for w in warns:
                messages.add_message(request, messages.INFO, str(w.message))
        # show resulted (new state verbose) state as message
        messages.add_message(request, messages.INFO, _("New state: %(state_verbose)s" % {'state_verbose': str(obj.get_state_verbose())}))
        # actually save obj

    def save_model(self, request, obj, form, change):
        self.process_state_change_and_warn(request,obj,form,change)
        super().save_model(request, obj, form, change)

    def save_related(self, request, form, formsets, change):
        # FIXME improve warnings and notifications in general. Make DRY.
        with warnings.catch_warnings(record=True) as warns:
            super().save_related(request, form, formsets, change)
            for w in warns:
                messages.add_message(request, messages.INFO, str(w.message))

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

