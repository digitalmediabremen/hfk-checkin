from .base import *  # noqa
from .base import getenv

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = True
# https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
SECRET_KEY = getenv(
    "DJANGO_SECRET_KEY",
    default="3lf+h+$$l6!7!6meyv0vw*0p=)z^zw&wl2(ac&^=r2f75s-f&@",
)
# https://docs.djangoproject.com/en/dev/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ["localhost", "0.0.0.0", "127.0.0.1"]

# CACHES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#caches
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': Path.joinpath(BASE_DIR, 'db.sqlite3'),
    }
}

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-host
# EMAIL_HOST = "localhost"
# https://docs.djangoproject.com/en/dev/ref/settings/#email-port
# EMAIL_PORT = 1025
# alternative: use with python -m smtpd -n -c DebuggingServer localhost:1025

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# WhiteNoise
# ------------------------------------------------------------------------------
# http://whitenoise.evans.io/en/latest/django.html#using-whitenoise-in-development
INSTALLED_APPS = ["whitenoise.runserver_nostatic"] + INSTALLED_APPS  # noqa F405


# django-debug-toolbar
# ------------------------------------------------------------------------------
# https://django-debug-toolbar.readthedocs.io/en/latest/installation.html#prerequisites
# INSTALLED_APPS += ["debug_toolbar"]  # noqa F405
# # https://django-debug-toolbar.readthedocs.io/en/latest/installation.html#middleware
# MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]  # noqa F405
# # https://django-debug-toolbar.readthedocs.io/en/latest/configuration.html#debug-toolbar-config
# DEBUG_TOOLBAR_CONFIG = {
#     "DISABLE_PANELS": ["debug_toolbar.panels.redirects.RedirectsPanel"],
#     "SHOW_TEMPLATE_CONTEXT": True,
# }
# # # https://django-debug-toolbar.readthedocs.io/en/latest/installation.html#internal-ips
# INTERNAL_IPS = ["127.0.0.1", "10.0.2.2"]


# django-extensions
# ------------------------------------------------------------------------------
# https://django-extensions.readthedocs.io/en/latest/installation_instructions.html#configuration
# INSTALLED_APPS += ["django_extensions"]  # noqa F405

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    '*',
]