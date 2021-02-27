import logging
from django.contrib import admin
from django.utils.translation import ugettext_lazy as _
from modeltranslation.admin import TranslationAdmin, TranslationStackedInline
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from .other import FixedGuardedModelAdminMixin
from django.urls import reverse, path

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
        (_('Reservation'), {
            #'classes': ('collapse',),
            'fields': ('reservable', 'reservation_info',#'need_manual_confirmation', 'reservation_delegates',
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
    list_display = ('display_numbers', 'name', 'get_unit_slug', 'people_capacity','area','reservable','access_restricted','modified_at') # ,'need_manual_confirmation'
    list_filter = ('unit', 'reservable')#,'need_manual_confirmation') # 'public',
    list_select_related = ('unit',)
    ordering = ('unit', 'name')
    search_fields = ('name','numbers','unit__name')
    list_display_links = ('display_numbers', 'name')
    readonly_fields = ModifiableModelAdminMixin._fields
    list_max_show_all = 1000

    def get_unit_slug(self, obj):
        if obj.unit:
            return obj.unit.slug
    get_unit_slug.short_description = _('Unit')
    get_unit_slug.admin_order_field = 'unit__slug'

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        form.instance.update_opening_hours()

    # def get_urls(self):
    #     # try: FIXME
    #     from .resource_access import AccessToResourceAdmin, AccessToResource
    #     urls = super().get_urls()
    #     info = self.model._meta.app_label, self.model._meta.model_name
    #     access_resource_model_admin = AccessToResourceAdmin(AccessToResource, self.admin_site)
    #     myurls = [
    #         path('<object_pk>/access/',
    #              view=self.admin_site.admin_view(
    #                  access_resource_model_admin.change_view),
    #              name='%s_%s_access' % info),
    #     ]
    #     urls = myurls + urls
    #     return urls

