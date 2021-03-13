import logging
from django.contrib import admin
from django.utils.translation import ugettext_lazy as _
from modeltranslation.admin import TranslationAdmin, TranslationStackedInline
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from .other import FixedGuardedModelAdminMixin
from django.urls import reverse, path
from django.template.response import TemplateResponse
from django import forms
from django.contrib.admin.widgets import AutocompleteSelect
from django.contrib.admin.options import get_content_type_for_model, unquote, capfirst, PermissionDenied, IS_POPUP_VAR

logger = logging.getLogger(__name__)

from .mixins import PopulateCreatedAndModifiedMixin, CommonExcludeMixin, ModifiableModelAdminMixin
from .other import ResourceGroupInline #, PeriodInline
from .permission_inlines import (
    AccessAllowedToResourceUserPermissionInline,
    AccessDelegatesForResourceUserPermissionInline,
    ReservationDelegatesForResourceUserPermissionInline,
)


class ResourceTypeAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, TranslationAdmin):
    list_display = ('name', 'main_type','pk')
    pass


class SelectResourceForm(forms.Form):
    from ..models import Resource, Reservation
    resource = forms.ModelChoiceField(
        queryset=Resource.objects.all(),
        widget=AutocompleteSelect(Reservation._meta.get_field('resource').remote_field, admin.site)
    )


class ResourceAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, DynamicArrayMixin, ModifiableModelAdminMixin,
                       FixedGuardedModelAdminMixin, admin.ModelAdmin):
    inlines = [
        # PeriodInline,
        # ResourceEquipmentInline,
        # ResourceGroupInline,
        # RoomAccessPolicyInline
        # TODO
        AccessDelegatesForResourceUserPermissionInline,
        ReservationDelegatesForResourceUserPermissionInline,
        AccessAllowedToResourceUserPermissionInline,
    ]

    fieldsets = (
        (None, {
            'fields': ('numbers','name','alternative_names','unit')
        }),
        (_('Details'), {
            # 'classes': ('collapse',),
            'fields': ('type','description','people_capacity','area','floor_number','floor_name'),#'purposes'
        }),
        (_('Features'), {
            'fields': ('features',),
        }),
        (_('Reservation'), {
            #'classes': ('collapse',),
            'fields': ('reservable', 'reservation_info','need_manual_confirmation',# 'reservation_delegates',
                       'min_period','max_period','slot_size','max_reservations_per_user',
                       'reservation_requested_notification_extra','reservation_confirmed_notification_extra',
                       'reservable_max_days_in_advance','reservable_min_days_in_advance',
                       'external_reservation_url'),
        }),
        (_('Access'), {
            # 'classes': ('collapse',),
            'fields': ('access_restricted',)#, 'access_delegates', 'access_allowed_to'),
        }),
        (_('Changes'), {
            # 'classes': ('collapse',),
            'fields': ModifiableModelAdminMixin._fields,
        }),
    )
    #readonly_fields = ('uuid',)
    #autocomplete_fields = ('reservation_delegates','access_delegates', 'access_allowed_to')
    # list_display extra 'need_manual_confirmation',
    list_display = ('display_numbers','name','get_unit_slug','people_capacity','area','reservable','access_restricted','modified_at') # ,'need_manual_confirmation'
    list_filter = ('unit','reservable','people_capacity','access_restricted','features','type','floor_number','need_manual_confirmation') #,'need_manual_confirmation') # 'public',
    list_select_related = ('unit',)
    ordering = ('unit', 'name')
    search_fields = ('name','numbers','unit__name')
    list_display_links = ('display_numbers', 'name')
    readonly_fields = ModifiableModelAdminMixin._fields
    list_max_show_all = 1000
    filter_horizontal = ('features',)

    def get_unit_slug(self, obj):
        if obj.unit:
            return obj.unit.slug
    get_unit_slug.short_description = _('Unit')
    get_unit_slug.admin_order_field = 'unit__slug'

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        form.instance.update_opening_hours()

    def get_urls(self):
        # get the default urls
        urls = super(ResourceAdmin, self).get_urls()
        # define security urls
        custom_urls = [
            path('<path:object_id>/calendar/', self.admin_site.admin_view(self.calendar_view),
                name='resources_resource_calendar')
        ]
        # Make sure here you place your added urls first than the admin default urls
        return custom_urls + urls

    @staticmethod
    def get_resource_calendar_extra_context(object_id=None):
        return dict(
            calendar_resource_id=object_id,
            calendar_select_resource_form=SelectResourceForm(),
        )

    # def calendar_view(self, request, uuid):
    #     context = dict(
    #         **self.admin_site.each_context(request), # Include common variables for rendering the admin template.
    #         **self.get_resource_calendar_extra_context(uuid)
    #     )
    #     return TemplateResponse(request, "admin/resources/resource_calendar.html", context)



    def calendar_view(self, request, object_id, extra_context=None):
        "The 'history' admin view for this model."
        from django.contrib.admin.models import LogEntry

        # First check if the user can see this history.
        model = self.model
        obj = self.get_object(request, unquote(object_id))
        if obj is None:
            return self._get_obj_does_not_exist_redirect(request, model._meta, object_id)

        if not self.has_view_or_change_permission(request, obj):
            raise PermissionDenied

        # Then get the history for this object.
        opts = model._meta
        app_label = opts.app_label
        action_list = LogEntry.objects.filter(
            object_id=unquote(object_id),
            content_type=get_content_type_for_model(model)
        ).select_related().order_by('action_time')

        context = {
            **self.admin_site.each_context(request),
            **self.get_resource_calendar_extra_context(object_id),
            # 'title': _('Calendar: %s') % obj,
            'action_list': action_list,
            'module_name': str(capfirst(opts.verbose_name_plural)),
            'object': obj,
            'opts': opts,
            'is_popup': IS_POPUP_VAR in request.POST or IS_POPUP_VAR in request.GET,
            'preserved_filters': self.get_preserved_filters(request),
            **(extra_context or {}),
        }

        request.current_app = self.admin_site.name

        return TemplateResponse(request, "admin/resources/resource_calendar.html", context)