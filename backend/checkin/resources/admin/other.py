import logging
from io import StringIO
from contextlib import redirect_stdout
from django.conf.urls import url
from django.contrib import admin
from django.contrib.admin.utils import unquote
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
#from django.contrib.gis.admin import OSMGeoAdmin
from django.core.management import call_command
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils.translation import ugettext_lazy as _
from django import forms
from django.template.response import TemplateResponse
from guardian import admin as guardian_admin
#from image_cropping import ImageCroppingMixin
from modeltranslation.admin import TranslationAdmin, TranslationStackedInline

#from checkin.resources.models import RESERVATION_EXTRA_FIELDS
from .mixins import ExtraReadonlyFieldsOnUpdateMixin, CommonExcludeMixin, PopulateCreatedAndModifiedMixin
#from checkin.resources.admin.period_inline import PeriodInline

# from ..models import (
#     AccessibilityValue, AccessibilityViewpoint, Attachment, Day, Equipment, EquipmentAlias, EquipmentCategory, Purpose,
#     Reservation, ReservationMetadataField, ReservationMetadataSet, Resource, ResourceAccessibility,
#     ResourceEquipment, ResourceGroup, ResourceType, TermsOfUse,
#     Unit, UnitAuthorization, UnitIdentifier, UnitGroup, UnitGroupAuthorization,
#     ReservationCancelReason, ReservationCancelReasonCategory)
from ..models import Reservation, Resource, Unit, ResourceGroup, ResourceType#, Day
from ..models import Attachment
#from munigeo.models import Municipality
#from rest_framework.authtoken.admin import Token

logger = logging.getLogger(__name__)


class _CommonMixin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin):
    pass


class EmailAndUsernameChoiceField(forms.ModelChoiceField):
    def label_from_instance(self, obj):
        return '%s | %s' % (obj.email, obj.username) if obj.email else obj.username


class CustomUserManage(forms.Form):
    """
    Show only apikey and staff users in a dropdown on object permission manage page
    """
    user = EmailAndUsernameChoiceField(
        queryset=get_user_model().objects.filter(
            #Q(auth_token__isnull=False) | Q(is_staff=True)
            Q(is_staff=True)
        ).distinct().order_by('email')
    )


class CustomGroupManage(forms.Form):
    group = forms.ModelChoiceField(Group.objects.all())


class FixedGuardedModelAdminMixin(guardian_admin.GuardedModelAdminMixin):
    # def get_obj_perms_user_select_form(self, request):
    #     return CustomUserManage
    #
    # def get_obj_perms_group_select_form(self, request):
    #     return CustomGroupManage

    # fix editing an object with quoted chars in pk
    def obj_perms_manage_user_view(self, request, object_pk, user_id):
        return super().obj_perms_manage_user_view(request, unquote(object_pk), user_id)


# class HttpsFriendlyGeoAdmin(OSMGeoAdmin):
#     openlayers_url = 'https://cdnjs.cloudflare.com/ajax/libs/openlayers/2.13.1/OpenLayers.js'


# class DayInline(admin.TabularInline):
#     model = Day


# class ResourceEquipmentInline(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, TranslationStackedInline):
#     model = ResourceEquipment
#     fields = ('equipment', 'description', 'data')
#     extra = 0


class ResourceGroupInline(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, admin.TabularInline):
    model = ResourceGroup.resources.through
    fields = ('resourcegroup',)
    verbose_name = _('Resource group')
    verbose_name_plural = _('Resource groups')
    extra = 0


# class UnitIdentifierInline(admin.StackedInline):
#     model = UnitIdentifier
#     fields = ('namespace', 'value')
#     extra = 0


# @admin.register(Attachment)
# class AttachmentAdmin(admin.ModelAdmin):
#     readonly_fields = ['created_at', 'created_by', 'modified_at', 'modified_by']


class LimitAuthorizedToStaff(admin.ModelAdmin):
    def get_field_queryset(self, db, db_field, request):
        qs = super().get_field_queryset(db, db_field, request)
        if db_field.name == 'authorized':
            return qs.filter(is_staff=True).order_by(
                'last_name', 'first_name', 'email')
        return qs


# @admin.register(UnitAuthorization)
# class UnitAuthorizationAdmin(_CommonMixin, LimitAuthorizedToStaff, admin.ModelAdmin):
#     list_display = ['id', 'subject', 'level', 'authorized']
#
#
# @admin.register(UnitGroup)
# class UnitGroupAdmin(_CommonMixin, TranslationAdmin):
#     pass
#
#
# @admin.register(UnitGroupAuthorization)
# class UnitGroupAuthorizationAdmin(_CommonMixin, LimitAuthorizedToStaff, admin.ModelAdmin):
#     list_display = ['id', 'subject', 'level', 'authorized']
#
#
# class ResourceImageAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, ImageCroppingMixin, TranslationAdmin):
#     exclude = ('sort_order', 'image_format')


# class EquipmentAliasInline(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, admin.TabularInline):
#     model = EquipmentAlias
#     readonly_fields = ()
#     exclude = CommonExcludeMixin.exclude + ('id',)
#     extra = 1
#
#
# class EquipmentAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, TranslationAdmin):
#     inlines = (
#         EquipmentAliasInline,
#     )


# class ResourceEquipmentAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, TranslationAdmin):
#     fields = ('resource', 'equipment', 'description', 'data')




# class EquipmentCategoryAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, TranslationAdmin):
#     pass
#
#
# class PurposeAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, TranslationAdmin):
#     pass
#
#
# class TermsOfUseAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, TranslationAdmin):
#     list_display = ['name', 'terms_type']
#     pass


# class ReservationMetadataSetForm(forms.ModelForm):
#     class Meta:
#         model = ReservationMetadataSet
#         exclude = CommonExcludeMixin.exclude + ('id',)
#
#     def clean(self):
#         supported = set(self.cleaned_data.get('supported_fields'))
#         required = set(self.cleaned_data.get('required_fields'))
#         if not required.issubset(supported):
#             raise ValidationError(_('Required fields must be a subset of supported fields'))
#         return self.cleaned_data


# class ReservationMetadataSetAdmin(PopulateCreatedAndModifiedMixin, admin.ModelAdmin):
#     exclude = CommonExcludeMixin.exclude + ('id',)
#     form = ReservationMetadataSetForm


class ResourceGroupAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, FixedGuardedModelAdminMixin,
                         admin.ModelAdmin):
    pass


# class MunicipalityAdmin(PopulateCreatedAndModifiedMixin, CommonExcludeMixin, admin.ModelAdmin):
#     change_list_template = 'admin/municipalities/import_buttons.html'
#     import_template = 'admin/municipalities/import_template.html'
#
#     def has_delete_permission(self, request, obj=None):
#         return False
#
#     def get_actions(self, request):
#         actions = super().get_actions(request)
#         if 'delete_selected' in actions:
#             del actions['delete_selected']
#         return actions
#
#     def get_urls(self):
#         urls = super(MunicipalityAdmin, self).get_urls()
#         extra_urls = [
#             url(r'^municipalities_import/$', self.admin_site.admin_view(self.municipalities_import),
#                 name='municipalities_import'),
#             url(r'^divisions_helsinki_import/$', self.admin_site.admin_view(self.divisions_helsinki_import),
#                 name='divisions_helsinki_import'),
#         ]
#         return extra_urls + urls
#
#     def municipalities_import(self, request):
#         context = dict(
#             self.admin_site.each_context(request),
#         )
#         out = StringIO()
#         with redirect_stdout(out):
#             try:
#                 call_command('geo_import', '--municipalities', 'finland', stdout=out)
#                 context['command_output'] = out.getvalue()
#             except Exception as e:
#                 context['command_output'] = 'Running import script caused the following exception: {0}'.format(str(e))
#                 logger.exception('Running import script caused an exception')
#         context['title'] = _('Import municipalities')
#         context['opts'] = self.model._meta
#         return TemplateResponse(request, self.import_template, context)
#
#     def divisions_helsinki_import(self, request):
#         context = dict(
#             self.admin_site.each_context(request),
#         )
#         out = StringIO()
#         with redirect_stdout(out):
#             try:
#                 call_command('geo_import', '--divisions', 'helsinki', stdout=out)
#                 context['command_output'] = out.getvalue()
#             except Exception as e:
#                 context['command_output'] = 'Running import script caused the following exception: {0}'.format(str(e))
#                 logger.exception('Running import script caused an exception')
#         context['title'] = _('Import divisions')
#         context['opts'] = self.model._meta
#         return TemplateResponse(request, self.import_template, context)


# class AccessibilityViewpointAdmin(TranslationAdmin):
#     pass


# class ResourceAccessibilityAdmin(admin.ModelAdmin):
#     list_display = ('resource', 'viewpoint', 'value')
#     list_filter = ('value',)
#     raw_id_fields = ('resource',)
#     search_fields = ('resource__name', 'viewpoint__name')


# class ReservationMetadataFieldForm(forms.ModelForm):
#     class Meta:
#         model = ReservationMetadataField
#         fields = ('field_name',)
#         widgets = {
#             'field_name': forms.Select()
#         }


# class ReservationMetadataFieldAdmin(admin.ModelAdmin):
#     form = ReservationMetadataFieldForm
#     ordering = ('field_name',)
#
#     def get_label(self, obj):
#         return str(obj.field_name)
#
#     def formfield_for_dbfield(self, db_field, **kwargs):
#         if db_field.name == 'field_name':
#             # limit choices to valid field names that are not yet in use
#             all_choices = [(f, str(f)) for f in sorted(RESERVATION_EXTRA_FIELDS)]
#             kwargs['widget'].choices = [
#                 c for c in all_choices
#                 if c[0] not in ReservationMetadataField.objects.values_list('field_name', flat=True)
#             ]
#         return super().formfield_for_dbfield(db_field, **kwargs)


# Override TokenAdmin of django rest framework
# to use raw_id_field on user
class RespaTokenAdmin(admin.ModelAdmin):
    list_display = ('key', 'user', 'created')
    fields = ('user',)
    ordering = ('-created',)
    raw_id_fields = ('user',)