from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _
from logging import getLogger

logger = getLogger(__name__)

class TrackingConfig(AppConfig):
    name = 'checkin.tracking'
    verbose_name = _('Dokumentation und Nachverfolgung')