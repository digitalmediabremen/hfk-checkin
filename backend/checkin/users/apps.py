from django.apps import AppConfig
from django.utils.translation import gettext_lazy
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class UsersConfig(AppConfig):
    name = 'checkin.users'
    label = 'users'
    verbose_name = gettext_lazy('Users and Profiles')

    # correct site_domain is required for microsoft-auth to work properly.
    # triggered after migration.

    def ready(self):
        # define signal handlers
        from .signals import handlers
        # FIXME move this out of here! Dependency: microsoft_auth.
        # FIXME replace microsoft_auth with allauth or python-social-auth
        # does not belong here and should not even be necessary from the start.
        from django.conf import settings
        from os import environ
        domain = getattr(settings, 'SITE_DOMAIN', None)
        if domain:
            site_id = getattr(settings, 'SITE_ID', 1)
            logger.info("Setting Site with SITE_ID (from Settings) == %i to envvar SITE_DOMAIN %s." % (site_id, domain))
            if settings.DEBUG:
                logger.info("... Setting to 'localhost:8000' because DEBUG is True.")
                domain = 'localhost:8000'
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

        # if admin.site.is_registered(MicrosoftAccount):
        #     admin.site.unregister(MicrosoftAccount)
        # register microsoft_account's hijacked UserAdmin
        if admin.site.is_registered(User):
            admin.site.unregister(User)
            # put our own UserAdmin back in to place
            admin.site.register(User, UserAdmin)