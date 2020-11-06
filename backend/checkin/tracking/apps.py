from django.apps import AppConfig

class TrackingConfig(AppConfig):
    name = 'checkin.tracking'
    verbose_name = 'Dokumentation und Nachverfolgung'

    # correct site_domain is required for microsoft-auth to work properly.
    # triggered after migration.

    def ready(self):
        from django.conf import settings
        from os import environ
        domain = environ.get("SITE_DOMAIN", default="checkin.hfk-bremen.de")
        site_id = settings.SITE_ID
        print("Setting Site with SITE_ID (from Settings) == %i to envvar SITE_DOMAIN %s." % (site_id, domain))
        if settings.DEBUG:
            print("... Skipping because DEBUG is True.")
            return
        if 'django.contrib.sites' in settings.INSTALLED_APPS:
            from django.contrib.sites.models import Site
            Site.objects.filter(id=site_id).update(domain=domain)
        else:
            print("... Skipping because sites framework is not installed.")