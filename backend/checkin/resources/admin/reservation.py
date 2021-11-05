import logging
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.translation import gettext, ngettext
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
from .other import FixedGuardedModelAdminMixin, ExtendedGuardedModelAdminMixin
from .resource import ResourceAdmin
from .list_filters import ResourceFilter, UserFilter, PastReservationFilter, ReservationStateFilter, PurposeFilter, MyReservationRelationFilter
from django.contrib.admin.utils import format_html
from ..models.reservation import StaticReservationPurpose
from ..models.resource import Resource
from ..models.users import ReservationUserGroup
from ..models.utils import user_list_to_email_formatted_addresses, join_email_list
from .other import DisableableRadioSelect
from ..auth import is_general_admin
from guardian.shortcuts import get_objects_for_user
from django.contrib.humanize.templatetags.humanize import naturaltime
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from django.contrib.admin.widgets import AutocompleteSelect
from django.db.models import BLANK_CHOICE_DASH
from django.utils.safestring import mark_safe


logger = logging.getLogger(__name__)
User = get_user_model()


# model-wide filter on Users that can be assigned to reservations.
# use as qs.filter(**USERS_IN_RESERVATIONS_QS_FILTER)
USERS_IN_RESERVATIONS_QS_FILTER = {
    'profile__is_external': False,
}

RESERVATION_STATE_COLORS = {
    Reservation.CREATED: '#555',
    Reservation.CANCELLED: '#E2574C',
    Reservation.CONFIRMED: '#58AD69',
    Reservation.DENIED: '#E2574C',
    Reservation.REQUESTED: '#FFBC49',
    Reservation.WAITING_FOR_PAYMENT: '#FFBC49',
}

class AttendanceInline(admin.TabularInline):
    autocomplete_fields = ('user',)
    model = Attendance
    fields = ('get_organizer', 'user', 'state', 'comment', 'modified_at')
    # readonly_fields = ('get_organizer', 'modified_at','modified_by')
    readonly_fields = ('modified_at', 'modified_by', 'get_organizer')
    extra = 0

    def get_organizer(self, obj):
        return _('🎩') if obj.is_organizer else ''
    get_organizer.short_description = ''
    # get_organizer.boolean = True


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
    user = forms.ModelChoiceField(queryset=User.objects.filter_internal_and_verifed_users(),
                                  widget=AutocompleteSelect(Reservation._meta.get_field('user').remote_field, admin.site),
                                  label=_('Organizer'))
    PURPOSE_CHOICES = BLANK_CHOICE_DASH + StaticReservationPurpose.choices # add blank option
    purpose = forms.ChoiceField(required=False, label=_("Purpose"), initial=None, choices=PURPOSE_CHOICES)
    state = forms.ChoiceField(required=True, label=_("State"), choices=Reservation.STATE_CHOICES, initial=Reservation.CREATED,
                              widget=DisableableRadioSelect(
                                  disabled_choices=[Reservation.CREATED]))
    message_state_update = forms.CharField(required=False, label=_('Notification Message'),
                                           widget=forms.Textarea(attrs={'cols': 80, 'rows': 5}),
                                           help_text=_(
                                               'This message might be used in the notification send to the organizer on this update. The message will not be saved.'))

    class Meta:
        model = Reservation
        fields = ('__all__')

    def clean_state(self):
        value = self.cleaned_data['state']
        if value == Reservation.CREATED:
            raise ValidationError(_("Already existing reservations can not have state %s" % Reservation.CREATED))
        return value

    def clean_user(self):
        organizer = self.cleaned_data['user']
        if not hasattr(organizer, 'profile') or organizer.profile is None: #or not organizer.profile.complete:
            raise ValidationError(_("'%s' can not be set as organizer, until they have a valid user profile." % organizer))
        return organizer


class ReservationAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, ExtraReadonlyFieldsOnUpdateMixin,
                       admin.ModelAdmin):
    # extra_readonly_fields_on_update = ('access_code',)
    list_display = (
    'get_state_colored', 'get_organizer_display', 'resource', 'get_date_display', 'get_time_display', 'number_of_attendees', 'title', 'get_collisions',
    'get_exclusive', 'get_created_at_display') #'get_priority',
    list_filter = (MyReservationRelationFilter, ResourceFilter, UserFilter, PastReservationFilter, ReservationStateFilter, 'resource__unit', 'resource__groups', 'resource__features', 'has_priority', 'exclusive_resource_usage', PurposeFilter,
                   # 'resources', 'start', 'end', 'status', 'is_important',
                   ('begin', DateTimeRangeFilter),
                   ('end', DateTimeRangeFilter),
                   'type',
                   ('modified_at', DateTimeRangeFilter),
                   )
    search_fields = (
    'uuid', 'resource__name', 'resource__numbers', 'user__first_name', 'user__last_name', 'user__email')
    autocomplete_fields = ('user', 'resource')
    readonly_fields = (
    'uuid', 'approver', 'agreed_to_phone_contact', 'number_of_attendees', 'get_reservation_info', 'get_reservation_delegates',
    'get_phone_number', 'created_at','created_by','modified_at','modified_by')
    #extra_readonly_fields_edit = ('user', 'purpose','organizer_is_attending', 'type', 'message', 'purpose')
    extra_readonly_fields_edit = ('user', 'organizer_is_attending', 'type')
    inlines = [AttendanceInline, RelatedEmailInline]
    form = ReservationAdminForm
    date_hierarchy = 'begin'
    actions_on_top = True
    list_display_links = ('get_organizer_display', 'resource')
    list_max_show_all = 50
    list_per_page = 30
    save_on_top = True
    ordering = ['-created_at']
    actions = ['action_confirm', 'action_deny', 'action_request', 'action_email_organizers']

    fieldsets = (
        (None, {
            'fields': ('user', 'resource', 'begin', 'end', 'number_of_attendees', 'exclusive_resource_usage',
                       'purpose', 'title', 'message', 'link')  # 'short_uuid')
        }),
        (_('State'), {
            'fields': ('state', 'message_state_update', 'approver', 'get_reservation_info','get_reservation_delegates','comment'),
        }),
        (_('Request details'), {
            # 'classes': ('collapse',),
            'fields': ('has_priority', 'number_of_extra_attendees','organizer_is_attending','agreed_to_phone_contact', 'get_phone_number', 'type', 'uuid'),
        }),
        (_('Creation and modifications'), {
            'classes': ('collapse',),
            'fields': ('created_at','created_by','modified_at','modified_by'),
        }),
    )
    radio_fields = {'state': admin.HORIZONTAL}

    # def get_list_filter(self, request):
    #     return map(lambda x: x if x != ResourceFilter else 'resource', self.list_filter)

    def action_email_organizers(self, request, queryset):
        emails = []
        for reservation in queryset:
            emails.append(reservation.user.get_email_notation())
        emails = set(emails)
        self.message_user(request,
                          mark_safe(format_html("{} <a href='mailto:{}'>{}</a>",
                                                _("%(num_recipients)d organizers in %(num_reservations)d reservations selected:") % {
                                                    'num_recipients':  len(emails),
                                                    'num_reservations': len(queryset)
                                                },
                                                join_email_list(emails),
                                                _("Open new email")
                          )), messages.WARNING)
    action_email_organizers.short_description = _('Email organizers of selected reservations')

    # @admin.action(description='Mark selected stories as published')
    def action_confirm(self, request, queryset):
        self._action_change_state(request, queryset, Reservation.CONFIRMED)
    action_confirm.short_description = _('Confirm selected reservations')

    def action_deny(self, request, queryset):
        self._action_change_state(request, queryset, Reservation.DENIED)
    action_deny.short_description = _('Deny selected reservations')

    # def action_cancel(self, request, queryset):
    #     self._action_change_state(request, queryset, Reservation.CANCELLED)
    # action_cancel.short_description = _('Cancel selected reservations')

    def action_request(self, request, queryset):
        self._action_change_state(request, queryset, Reservation.REQUESTED)
    action_request.short_description = _('Change state of selected reservations to requested')

    def _action_change_state(self, request, queryset, state):
        success = []
        skipped = []
        failed = []
        for reservation in queryset.all():
            try:
                original_state = reservation.state
                reservation.state = state
                self.process_state_change_and_warn(request, reservation, original_state=original_state)
                reservation.save()
                success.append(reservation)
            except Exception as e:
                self.message_user(request, _('Could not process reservation %s. An error occurred: %s' % (reservation.id, str(e))))
                logger.error(e)
                failed.append(reservation)
        self.message_user(request, ngettext(
            '%(num)d reservation was successfully changed to %(state)s.',
            '%(num)d reservations were successfully changed to %(state)s.',
            len(success),
        ) % {'num': len(success), 'state': state}, messages.SUCCESS)
        if skipped:
            self.message_user(request, ngettext(
                '%d reservation was skipped during update.',
                '%d reservations were skipped during update.',
                len(skipped),
            ) % len(skipped), messages.WARNING)
        if failed:
            self.message_user(request, ngettext(
                'Failed to update %d reservation.',
                'Failed to update %d reservations.',
                len(failed),
            ) % len(failed), messages.ERROR)


    def has_change_permission(self, request, obj=None):
        if obj:
            return super().has_change_permission(request, obj) or obj.resource._has_perm(request.user, perm='can_modify_reservations') or obj.resource._has_perm(request.user, perm='can_modify_reservations_without_notifications')
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        # all reservations are soft deletable via state
        return False

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related('user', 'user__profile')
        if is_general_admin(request.user):
            return qs
        qs = qs.filter(resource__in=Resource.objects.get_resources_reservation_delegated_to_user(request.user))
        return qs

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

    def get_reservation_delegates(self, obj):
        if obj and obj.resource:
            return user_list_to_email_formatted_addresses(obj.resource.get_reservation_delegates())
        return self.get_empty_value_display()
    get_reservation_delegates.short_description = _("Resource reservation delegates")


    def get_organizer_display(self, obj):
        return obj.user.get_display_name()
    get_organizer_display.short_description = _("Organizer")
    get_organizer_display.admin_order_field = 'user'

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

    def get_purpose_display(self, obj):
        if obj and obj.purpose is not None:
            purpose = str(obj.purpose)
            return getattr(StaticReservationPurpose, purpose).label if hasattr(StaticReservationPurpose,
                                                                                   purpose) else obj.purpose
        return '-'
    get_purpose_display.short_description = _("Purpose")
    get_purpose_display.admin_order_field = 'purpose'

    def get_display_duration(self, obj):
        return obj.display_duration
    get_display_duration.short_description = _("Timespan")
    get_display_duration.admin_order_field = 'begin'

    def get_date_display(self, obj):
        return obj.get_display_duration_date(humanize=True)
    get_date_display.short_description = _("Date")
    get_date_display.admin_order_field = 'begin'

    def get_time_display(self, obj):
        return obj.get_display_duration_time()
    get_time_display.short_description = _("Time")
    get_time_display.admin_order_field = 'begin'

    def get_created_at_display(self, obj):
        return naturaltime(obj.created_at)
    get_created_at_display.short_description = _("Created at")
    get_created_at_display.admin_order_field = 'created_at'

    def get_collisions(self, obj):
        # FIXME this causes an extra query for each reservation displayed. optimize!
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
        if obj.type == obj.TYPE_BLOCKED:
            return _("BLOCKED")
        return format_html(
            '<b style="color:{};">{}</b>',
            RESERVATION_STATE_COLORS[obj.state],
            gettext(obj.get_state_display()),
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
            if obj.user and obj.user.get_preferred_language() != request.user.get_preferred_language():
                messages.add_message(request, messages.INFO, _("%s preferred language is: %s" % (obj.user, obj.user.get_preferred_language())))
            if obj.is_inactive:
                messages.add_message(request, messages.ERROR, _("Has been cancelled or denied."))
            if obj.has_priority:
                messages.add_message(request, messages.WARNING, _("Has priority."))
            if obj.exclusive_resource_usage:
                messages.add_message(request, messages.WARNING, _("Uses space exclusively."))
            if obj.end < now():
                messages.add_message(request, messages.WARNING, _("Reservation occurred in the past."))
            if not obj.organizer_is_attending:
                if obj.organizer in obj.attendees.all():
                    messages.add_message(request, messages.WARNING, _(
                        "Organizer does not want to attend. Yet the organizer is in the attendance list."))
                else:
                    messages.add_message(request, messages.WARNING, _("Organizer does not want to attend."))
            if obj.organizer_is_attending and obj.organizer not in obj.attendees.all():
                messages.add_message(request, messages.WARNING, _("Organizer is missing from attendance list."))

            groups_to_display = ReservationUserGroup.objects.filter(visible_in_reservation=True)
            assigned_groups = obj.user.groups.filter(pk__in=groups_to_display).all()
            if len(assigned_groups) > 0:
                message = gettext("%(user)s has one or more group assignments: %(assigned_groups)s") % {
                    'assigned_groups': ", ".join([g.name for g in assigned_groups]),
                    'user': obj.user}
                messages.add_message(request, messages.INFO, message)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        # add extra content for resource calendar
        # FIXME move to template tag
        extra_context = ResourceAdmin.get_resource_calendar_extra_context()
        # hide 'show_save_and_add_another' from submit_row
        extra_context['show_save_and_add_another'] = False
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
        form = super().get_form(request, obj, **kwargs)
        # limit users to non-external users only
        # FIXME does not work if user is autocomplete field
        # form.base_fields['user'].queryset = form.base_fields['user'].queryset.filter(**USERS_IN_RESERVATIONS_QS_FILTER)
        return form

    def process_state_change_and_warn(self, request, obj, form=None, change=None, original_state=None):
        # FIXME what if no _original_state. New object?
        if not original_state:
            original_state = self._original_state or Reservation.CREATED

        # process state change and catch all warnings as messages
        # FIXME improve warnings and notifications in general. Make DRY.
        with warnings.catch_warnings(record=True) as warns:
            if form:
                message_state_update = form.cleaned_data.get('message_state_update', None)
            else:
                message_state_update = None
            obj.process_state_change(original_state, obj.state, request.user, update_message=message_state_update)
            for w in warns:
                messages.add_message(request, messages.INFO, str(w.message))
        # show resulted (new state verbose) state as message
        # messages.add_message(request, messages.INFO,
        #                      _("New state: %(state_verbose)s" % {'state_verbose': str(obj.get_state_verbose())}))
        # actually save obj

    def save_model(self, request, obj, form, change):
        self.process_state_change_and_warn(request, obj, form, change)
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
