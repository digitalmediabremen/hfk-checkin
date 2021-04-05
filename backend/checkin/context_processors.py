from django.conf import settings

def admin(request):
    return {
        'APP_ADMIN_COLOR': settings.APP_ADMIN_COLOR,
        'APP_ADMIN_TITLE': settings.APP_ADMIN_TITLE,
        # django default context var `site_title`
        'site_title': settings.APP_ADMIN_TITLE,
    }