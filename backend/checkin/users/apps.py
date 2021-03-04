from django.apps import AppConfig
from django.utils.translation import ugettext_lazy
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class UsersConfig(AppConfig):
    name = 'checkin.users'
    verbose_name = ugettext_lazy('Users and Profiles')

    # correct site_domain is required for microsoft-auth to work properly.
    # triggered after migration.

    def ready(self):
        # FIXME move this out of here! Dependency: microsoft_auth.
        # FIXME replace microsoft_auth with allauth or python-social-auth
        # does not belong here and should not even be necessary from the start.
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

def fix_microsoft_auth_user_admin():
    """
    Replaces UserAdmin set by `microsoft_auth`
    FIXME microsoft_auth should not do this in the first place.
    :return:
    """
    if 'microsoft_auth' in settings.INSTALLED_APPS:
        from microsoft_auth.models import MicrosoftAccount
        from django.contrib import admin
        from django.contrib.auth import get_user_model
        User = get_user_model()

        from checkin.users.admin import UserAdmin

        logger.info("Removing microsoft_auth hijacked Admin views.")

        admin.site.unregister(MicrosoftAccount)
        # register microsoft_account's hijacked UserAdmin
        admin.site.unregister(User)
        # put our own UserAdmin back in to place
        admin.site.register(User, UserAdmin)