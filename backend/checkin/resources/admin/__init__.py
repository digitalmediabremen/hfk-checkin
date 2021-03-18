from django.contrib.admin import site as admin_site
from django.contrib import admin
from modeltranslation.admin import TranslationAdmin

# use absolute imports in __init__.py
# otherwise tests will not work

from checkin.resources.admin.other import (
    #ReservationAdmin,
    #Day,
    ResourceGroupAdmin,
    ResourceCapacityPolicyAdmin,
)

from checkin.resources.admin.reservation import ReservationAdmin

from checkin.resources.admin.resource import (
    ResourceAdmin, ResourceTypeAdmin,
)
from checkin.resources.admin.resource_access import ResourceAccessAdmin
from checkin.resources.admin.reception import *

from checkin.resources.admin.unit import (
    UnitAdmin,
)

from checkin.resources.models import (
    Resource,
    ResourceType, Reservation,
    Unit,
    #Day,
    ResourceGroup,
    ResourceFeature,
    ResourceCapacityPolicy
)

#admin_site.register(ResourceImage, ResourceImageAdmin)
admin_site.register(Resource, ResourceAdmin)
admin_site.register(Reservation, ReservationAdmin)
admin_site.register(ResourceType, ResourceTypeAdmin)
admin_site.register(ResourceFeature, TranslationAdmin)
#admin_site.register(Purpose, PurposeAdmin)
#admin_site.register(Day)
admin_site.register(Unit, UnitAdmin)
#admin_site.register(Equipment, EquipmentAdmin)
#admin_site.register(ResourceEquipment, ResourceEquipmentAdmin)
#admin_site.register(EquipmentCategory, EquipmentCategoryAdmin)
#admin_site.register(TermsOfUse, TermsOfUseAdmin)
#admin_site.register(ReservationMetadataField, ReservationMetadataFieldAdmin)
#admin_site.register(ReservationMetadataSet, ReservationMetadataSetAdmin)
admin.site.register(ResourceGroup, ResourceGroupAdmin)
admin.site.register(ResourceCapacityPolicy, ResourceCapacityPolicyAdmin)
#if admin.site.is_registered(Municipality):
#    admin.site.unregister(Municipality)
#admin.site.register(Municipality, MunicipalityAdmin)
#admin.site.register(AccessibilityViewpoint, AccessibilityViewpointAdmin)
#admin.site.register(AccessibilityValue)
#admin.site.register(ResourceAccessibility, ResourceAccessibilityAdmin)

# if admin.site.is_registered(Token):
#     admin.site.unregister(Token)
# admin_site.register(Token, RespaTokenAdmin)

#admin_site.register(ReservationCancelReason, ReservationCancelReasonAdmin)
#admin_site.register(ReservationCancelReasonCategory, ReservationCancelReasonCategoryAdmin)
