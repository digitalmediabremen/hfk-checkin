import logging
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from modeltranslation.admin import TranslationAdmin, TranslationStackedInline
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from .other import FixedGuardedModelAdminMixin, ExtendedGuardedModelAdminMixin
from django.urls import reverse, path
from django.template.response import TemplateResponse
from django import forms
from django.contrib.admin.widgets import AutocompleteSelect
from django.contrib.admin.options import get_content_type_for_model, unquote, capfirst, PermissionDenied, IS_POPUP_VAR
from django.contrib.admin.options import get_permission_codename
from checkin.tracking.models import Location as CheckinLocation
from django.contrib.messages import add_message, WARNING
from django.http import Http404

logger = logging.getLogger(__name__)

from .mixins import PopulateCreatedAndModifiedMixin, CommonExcludeMixin, ModifiableModelAdminMixin
from .other import ResourceGroupInline #, PeriodInline
from ..auth import is_general_admin, is_superuser
from .permission_inlines import (
    AccessAllowedToResourceUserPermissionInline,
    AccessDelegatesForResourceUserPermissionInline,
    ReservationDelegatesForResourceUserPermissionInline,
)

from .autocomplete_views import *


class ResourceTypeAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, TranslationAdmin):
    list_display = ('name', 'main_type','pk')
    pass


class SelectResourceForm(forms.Form):
    from ..models import Resource, Reservation
    resource = forms.ModelChoiceField(
        queryset=Resource.objects.filter(reservable=True).all(),
        widget=AutocompleteSelect(Reservation._meta.get_field('resource').remote_field, admin.site)
    )

class CheckinLocationInline(admin.StackedInline):
    model = CheckinLocation
    fields = ('code','parent','removed')
    readonly_fields = ('code',)
    verbose_name = _('Checkin location')
    verbose_name_plural = _('Checkin locations')
    extra = 0
    max = 1

    def has_delete_permission(self, request, obj=None):
        return False

class ResourceAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, DynamicArrayMixin, ModifiableModelAdminMixin,
                       FixedGuardedModelAdminMixin, admin.ModelAdmin):
    inlines = [
        # PeriodInline,
        # ResourceEquipmentInline,
        ResourceGroupInline,
        # RoomAccessPolicyInline
        AccessDelegatesForResourceUserPermissionInline,
        ReservationDelegatesForResourceUserPermissionInline,
        AccessAllowedToResourceUserPermissionInline,
        CheckinLocationInline,
    ]

    fieldsets = (
        (None, {
            'fields': ('numbers','name','alternative_names','unit')
        }),
        (_('Details'), {
            # 'classes': ('collapse',),
            'fields': ('type','description','people_capacity_default','people_capacity_calculation_type','get_people_capacity','get_people_capacity_policy','area','floor_number','floor_name'),#'purposes'
        }),
        (_('Features'), {
            'fields': ('features',),
        }),
        (_('Reservation'), {
            #'classes': ('collapse',),
            'fields': ('reservable', 'need_manual_confirmation', 'reservation_info',# 'reservation_delegates',
                       'min_period','max_period','slot_size','max_reservations_per_user',
                       'reservable_max_days_in_advance','reservable_min_days_in_advance',
                       'reservation_requested_notification_extra','reservation_confirmed_notification_extra',
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
    list_display = ('display_numbers','name','alternative_names','get_unit_slug','get_people_capacity','area','reservable','access_restricted','modified_at') # ,'need_manual_confirmation'
    list_filter = ('unit','reservable','people_capacity_default','access_restricted','features','type','groups','floor_number','need_manual_confirmation') #,'need_manual_confirmation') # 'public',
    list_select_related = ('unit',)
    ordering = ('unit', 'name')
    search_fields = ('name','alternative_names','numbers','unit__name')
    list_display_links = ('display_numbers', 'name')
    readonly_fields = ('get_people_capacity', 'get_people_capacity_policy', *ModifiableModelAdminMixin._fields)
    list_max_show_all = 1000
    filter_horizontal = ('features',)
    save_on_top = True

    def get_queryset(self, request):
        """
        returns QS of all Resources the request.user shall be able to "manage" (lookup, view, change or delete)
        in the Admin Backend.
        Uses Resource.get_resources_user_can_manage() to generate object-permission based QS form
        Unit, Group and Resource.

        Overloading get_queryset() from ExtendedGuardedModelAdminMixin and ModelAdmin.
        Therefore permission-based queryset for general (django.auth) or object-specific (django-guardian) will not be returned until implemented here.

        :param request:
        :return: QuerySet of Resource
        """
        # return all objects if user has "global" (django.auth) view permission or is "general admin"
        if is_general_admin(request.user) or super().has_view_permission(request):
            return self.model.objects.all()
        return self.model.objects.get_resources_user_can_manage(request.user)

    def has_change_permission(self, request, obj=None):
        """
        Checks has_change_permission similar to ExtendedGuardedModelAdminMixin but using custom row/object-level
        checker in Resource._has_perm().
        """
        if super().has_change_permission(request, obj):
            return True
        if obj is None:
            # Here check global 'view' permission or queryset exists
            return super().has_view_permission(request) or self.get_queryset(request).exists()
        else:
            # Row-level checking
            return obj._has_perm(request.user, get_permission_codename('change', self.opts), allow_admin=False, allow_global=False)

    def has_view_permission(self, request, obj=None):
        """
        Checks has_view_permission similar to ExtendedGuardedModelAdminMixin but using custom row/object-level
        checker in Resource._has_perm(). Allows to view with following permissions:
        - 'view' or
        - 'can_modify_reservations' or
        - 'can_modify_reservations_without_notification'
        """
        if super().has_view_permission(request, obj):
            return True
        if obj is None:
            # Here check global 'view' permission or queryset exists
            return super().has_view_permission(request) or self.get_queryset(request).exists()
        else:
            # Row-level checking
            return obj._has_perm(request.user, get_permission_codename('view', self.opts), allow_admin=False, allow_global=False) or \
            obj._has_perm(request.user, perm='can_modify_reservations') or \
            obj._has_perm(request.user, perm='can_modify_reservations_without_notification')

    def has_delete_permission(self, request, obj=None):
        """
        Checks has_delete_permission similar to ExtendedGuardedModelAdminMixin but using custom row/object-level
        checker in Resource._has_perm().
        """
        return super().has_delete_permission(request, obj) \
               or (obj is not None and obj._has_perm(request.user, get_permission_codename('delete', self.opts), allow_admin=False, allow_global=False))

    def get_search_results(self, request, queryset, search_term):
        queryset, use_distinct = super().get_search_results(request, queryset, search_term)
        # queryset is already filtered based on permissions of request.user in get_queryset (see ExtendedGuardedModelAdminMixin)
        # filter to only reservable resource if requested for autocomplete field or if user is not a general admin.
        if '/autocomplete/' in request.path or not is_general_admin(request.user):
            queryset = queryset.filter(reservable=True)
        return queryset, use_distinct

    def get_people_capacity(self, obj):
        return obj.people_capacity
    get_people_capacity.short_description = _("Active Capacity")

    def get_people_capacity_policy(self, obj):
        return ", ".join(["%s (%s: %d)" % (p.name, p.type, p.value) for p in obj.capacity_policies.all()])
    get_people_capacity_policy.short_description = _("Associated capacity policies")

    def get_unit_slug(self, obj):
        if obj.unit:
            return obj.unit.slug
    get_unit_slug.short_description = _('Unit')
    get_unit_slug.admin_order_field = 'unit__slug'

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        form.instance.update_opening_hours()

    def autocomplete_view(self, request):
        return ResourceAutocompleteJsonView.as_view(model_admin=self)(request)

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

        if obj and not obj.reservable:
            add_message(request=request, message=_('%s is not reservable.') % str(obj), level=WARNING)
            return TemplateResponse(request, "admin/base_site.html", context)

        return TemplateResponse(request, "admin/resources/resource_calendar.html", context)