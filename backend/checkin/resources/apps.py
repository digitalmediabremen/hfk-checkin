from django.apps import AppConfig
from django.utils.translation import ugettext_lazy

class ResourceConfig(AppConfig):
    name = 'checkin.resources'
    verbose_name = ugettext_lazy('Resources and booking')
