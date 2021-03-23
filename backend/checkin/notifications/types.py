from django.db import models
from django.utils.translation import ugettext_lazy as _

class NotificationType(models.TextChoices):
    RESERVATION_REQUESTED = 'reservation_requested', _('Reservation requested')
    RESERVATION_REQUESTED_OFFICIAL = 'reservation_requested_official', _('Reservation requested to delegtes')
    RESERVATION_EXTERNAL_USER_REQUESTED_OFFICIAL = 'reservation_external_user_requested_official', _('External attendee requested to delegtes')
    RESERVATION_ACCESS_REQUESTED_OFFICIAL = 'reservation_access_requested_official', _('Resource access requested to access delegtes')
    RESERVATION_CANCELLED = 'reservation_cancelled', _('Reservation cancelled')
    RESERVATION_CONFIRMED = 'reservation_confirmed', _('Reservation confirmed')
    RESERVATION_DENIED = 'reservation_denied', _('Reservation denied')
    RESERVATION_CREATED = 'reservation_created', _('Reservation created')
    # If the access code is known at reservation time, this notification
    # type is used.
    # RESERVATION_CREATED_WITH_ACCESS_CODE = 'reservation_created_with_access_code', _('Reservation created with access code')
    # In some cases, the access code is known only some time after the
    # reservation is made. A separate notification type is used so that
    # we don't confuse the user with "new reservation created"-style
    # messaging.
    # RESERVATION_ACCESS_CODE_CREATED = 'reservation_access_code_created', _('Reservation reservation_access_code_created')
    # RESERVATION_WAITING_FOR_PAYMENT = 'reservation_waiting_for_payment', _('Reservation reservation_waiting_for_payment')
    # RESERVATION_COMMENT_CREATED = 'reservation_comment_created', _('Reservation comment created')