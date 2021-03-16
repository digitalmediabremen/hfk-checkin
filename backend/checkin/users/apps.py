from django.apps import AppConfig
from django.utils.translation import ugettext_lazy
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class UsersConfig(AppConfig):
    name = 'checkin.users'
    label = 'users'
    verbose_name = ugettext_lazy('Users and Profiles')

    # correct site_domain is required for microsoft-auth to work properly.
    # triggered after migration.

    def ready(self):
        from django.conf import settings
        from os import environ
        domain = environ.get("SITE_DOMAIN", default="checkin.hfk-bremen.de")
        site_id = settings.SITE_ID
        logger.info("Setting Site with SITE_ID (from Settings) == %i to envvar SITE_DOMAIN %s." % (site_id, domain))
        if settings.DEBUG:
            logger.info("... Skipping because DEBUG is True.")
            return
        if 'django.contrib.sites' in settings.INSTALLED_APPS:
            from django.contrib.sites.models import Site
            Site.objects.filter(id=site_id).update(domain=domain)
        else:
            logger.info("... Skipping because sites framework is not installed.")