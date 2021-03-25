import logging
from django.contrib import admin
from django.utils.translation import ugettext_lazy as _
from modeltranslation.admin import TranslationAdmin, TranslationStackedInline
from .mixins import PopulateCreatedAndModifiedMixin, CommonExcludeMixin
from .other import FixedGuardedModelAdminMixin
from .permission_inlines import (
    ReservationDelegatesForUnitUserPermissionInline,
    UserConfirmationDelegatesForUnitUserPermissionInline,
    AccessDelegatesForUnitUserPermissionInline,
)


logger = logging.getLogger(__name__)


class UnitAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, FixedGuardedModelAdminMixin, TranslationAdmin):
    inlines = [
        # PeriodInline,
        AccessDelegatesForUnitUserPermissionInline,
        ReservationDelegatesForUnitUserPermissionInline,
        UserConfirmationDelegatesForUnitUserPermissionInline,
    ]

    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'public','description','time_zone')
        }),
        # (_('Reservation policy'), {
        #     # 'classes': ('collapse',),
        #     'description': _("These parameters will apply to resources assigned to this unit. They will only apply if the resource does not define its own parameters."),
        #     'fields': ('reservation_delegates','user_confirmation_delegates')
        #             # 'reservable',  'reservation_info', #'need_manual_confirmation',
        #             #    'min_period', 'max_period', 'slot_size', 'max_reservations_per_user',
        #             #    'reservation_requested_notification_extra', 'reservation_confirmed_notification_extra',
        #             #    'reservable_max_days_in_advance', 'reservable_min_days_in_advance',
        #             #    'external_reservation_url'),
        # }),
    )
    # readonly_fields = ('uuid',)
    #autocomplete_fields = ('reservation_delegates','user_confirmation_delegates')
    list_display = ('name', 'slug', 'modified_at')
    #list_filter = ('reservable',)
    ordering = ('name',)

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        form.instance.update_opening_hours()

    # respa functions from importing units from other data sources
    #
    # change_list_template = 'admin/units/import_buttons.html'
    # import_template = 'admin/units/import_template.html'
    # def get_urls(self):
    #     urls = super(UnitAdmin, self).get_urls()
    #     extra_urls = [
    #         url(r'^tprek_import/$', self.admin_site.admin_view(self.tprek_import),
    #             name='tprek_import'),
    #         url(r'^libraries_import/$', self.admin_site.admin_view(self.libraries_import),
    #             name='libraries_import'),
    #     ]
    #     return extra_urls + urls
    #
    # def tprek_import(self, request):
    #     context = dict(
    #         self.admin_site.each_context(request),
    #     )
    #     out = StringIO()
    #     with redirect_stdout(out):
    #         try:
    #             call_command('resources_import', '--all', 'tprek', stdout=out)
    #             context['command_output'] = out.getvalue()
    #         except Exception as e:
    #             context['command_output'] = 'Running import script caused the following exception: {0}'.format(str(e))
    #             logger.exception('Running import script caused an exception')
    #     context['title'] = _('Import Service Map')
    #     context['opts'] = self.model._meta
    #     return TemplateResponse(request, self.import_template, context)
    #
    # def libraries_import(self, request):
    #     context = dict(
    #         self.admin_site.each_context(request),
    #     )
    #     out = StringIO()
    #     with redirect_stdout(out):
    #         try:
    #             call_command('resources_import', '--all', 'kirjastot', stdout=out)
    #             context['command_output'] = out.getvalue()
    #         except Exception as e:
    #             context['command_output'] = 'Running import script caused the following exception: {0}'.format(str(e))
    #             logger.exception('Running import script caused an exception')
    #     context['title'] = _('Import Kirkanta')
    #     context['opts'] = self.model._meta
    #     return TemplateResponse(request, self.import_template, context)

