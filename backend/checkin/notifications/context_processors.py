from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from urllib.parse import urljoin

def email_notifications(request=None):
    return {
        "SUPPORT_EMAIL": settings.SUPPORT_EMAIL,
        "FRONTEND_BASE_URL": settings.FRONTEND_BASE_URL,
        "BACKEND_BASE_URL": ''.join(['http://', settings.SITE_DOMAIN]),
        "HELP_URL": urljoin(settings.FRONTEND_BASE_URL, 'help')
    }