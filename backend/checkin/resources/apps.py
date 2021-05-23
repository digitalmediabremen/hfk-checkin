from django.apps import AppConfig
from django.utils.translation import gettext_lazy

class ResourceConfig(AppConfig):
    name = 'checkin.resources'
    verbose_name = gettext_lazy('Resources and booking')
