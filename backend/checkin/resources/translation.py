from modeltranslation.translator import TranslationOptions, register
from .models import *


@register(ResourceGroup)
class ResourceGroupTranslationOptions(TranslationOptions):
    fields = ['name']


@register(Unit)
class UnitTranslationOptions(TranslationOptions):
    fields = ('name', 'description')


@register(Resource)
class ResourceTranslationOptions(TranslationOptions):
    pass
    # fields = ('name', 'description', 'specific_terms',
    #           'reservation_confirmed_notification_extra',
    #           'reservation_requested_notification_extra',
    #           'reservation_info', 'responsible_contact_info')


@register(ResourceType)
class ResourceTypeTranslationOptions(TranslationOptions):
    fields = ('name',)
    required_languages = ('de', 'en')


@register(ResourceFeature)
class ResourceFeatureTranslationOptions(TranslationOptions):
    fields = ('name',)
    required_languages = ('de', 'en')

# @register(ResourceImage)
# class ResourceImageTranslationOptions(TranslationOptions):
#     fields = ('caption',)


@register(ReservationPurpose)
class ReservationPurposeTranslationOptions(TranslationOptions):
    fields = ('name',)
    required_languages = ('de', 'en')


# @register(Equipment)
# class EquipmentTranslationOptions(TranslationOptions):
#     fields = ('name',)


# @register(ResourceEquipment)
# class ResourceEquipmentTranslationOptions(TranslationOptions):
#     fields = ('description',)


# @register(EquipmentCategory)
# class EquipmentCategoryTranslationOptions(TranslationOptions):
#     fields = ('name',)


# @register(TermsOfUse)
# class TermsOfUserTranslationOptions(TranslationOptions):
#     fields = ('name', 'text')


# @register(AccessibilityViewpoint)
# class AccessibilityViewpointTranslationOptions(TranslationOptions):
#     fields = ('name',)


# @register(ReservationCancelReasonCategory)
# class ReservationCancelReasonCategoryTranslationOptions(TranslationOptions):
#     fields = ('name', 'description')
