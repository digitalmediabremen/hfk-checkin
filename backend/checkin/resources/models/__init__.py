# use absolute imports in __init__.py
# otherwise tests will not work

#from .accessibility import AccessibilityValue, AccessibilityViewpoint, ResourceAccessibility, UnitAccessibility
#from .availability import Day, Period, get_opening_hours
from checkin.resources.models.reservation import (
    Reservation, RESERVATION_EXTRA_FIELDS,
    #ReservationMetadataField, ReservationMetadataSet,
    #ReservationCancelReasonCategory, ReservationCancelReason
    ReservationWarning
)
from checkin.resources.models.resource import (
    Resource, ResourceType, ResourceGroup, ResourceFeature,
    # Purpose, ResourceEquipment,
    # ResourceDailyOpeningHours, TermsOfUse,
    Attachment, ResourceCapacityPolicy
)
#from checkin.resources.models.equipment import Equipment, EquipmentAlias, EquipmentCategory
from checkin.resources.models.unit import Unit
#from checkin.resources.models.unit_group import UnitGroup, UnitGroupAuthorization

from checkin.resources.models.attendance import Attendance

# __all__ = [
#     'AccessibilityValue',
#     'AccessibilityViewpoint',
#     'Day',
#     'Equipment',
#     'EquipmentAlias',
#     'EquipmentCategory',
#     'Period',
#     'Purpose',
#     'RESERVATION_EXTRA_FIELDS',
#     'Reservation',
#     'ReservationMetadataField',
#     'ReservationMetadataSet',
#     'ReservationCancelReasonCategory',
#     'ReservationCancelReason',
#     'Resource',
#     'ResourceAccessibility',
#     'ResourceDailyOpeningHours',
#     'ResourceEquipment',
#     'ResourceGroup',
#     'ResourceImage',
#     'ResourceType',
#     'TermsOfUse',
#     'Unit',
#     'UnitAccessibility',
#     'UnitAuthorization',
#     'UnitGroup',
#     'UnitGroupAuthorization',
#     'UnitIdentifier',
#     'get_opening_hours',
#     'Attachment'
# ]
