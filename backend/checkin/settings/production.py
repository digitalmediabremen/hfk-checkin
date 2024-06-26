from .base import *  # noqa
from .base import getenv

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
SECRET_KEY = getenv("DJANGO_SECRET_KEY")
# https://docs.djangoproject.com/en/dev/ref/settings/#allowed-hosts
ALLOWED_HOSTS = getenv("DJANGO_ALLOWED_HOSTS", default=["*"])

# DATABASES
# ------------------------------------------------------------------------------
DATABASES["default"] = dj_database_url.config(conn_max_age=600)  # noqa F405
#DATABASES["default"]["ATOMIC_REQUESTS"] = True  # noqa F405
#DATABASES["default"]["CONN_MAX_AGE"] = getenv("CONN_MAX_AGE", default=60)  # noqa F405

# CACHES
# ------------------------------------------------------------------------------
# CACHES = {
#     "default": {
#         "BACKEND": "django_redis.cache.RedisCache",
#         "LOCATION": getenv("REDIS_URL"),
#         "OPTIONS": {
#             "CLIENT_CLASS": "django_redis.client.DefaultClient",
#             # Mimicing memcache behavior.
#             # http://niwinz.github.io/django-redis/latest/#_memcached_exceptions_behavior
#             "IGNORE_EXCEPTIONS": True,
#         },
#     }
# }

# SECURITY
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-proxy-ssl-header
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-ssl-redirect
SECURE_SSL_REDIRECT = getenv("DJANGO_SECURE_SSL_REDIRECT", default=True)
# https://docs.djangoproject.com/en/dev/ref/settings/#session-cookie-secure
SESSION_COOKIE_SECURE = True
# https://docs.djangoproject.com/en/dev/ref/settings/#csrf-cookie-secure
CSRF_COOKIE_SECURE = True
# https://docs.djangoproject.com/en/dev/topics/security/#ssl-https
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-hsts-seconds
# TODO: set this to 60 seconds first and then to 518400 once you prove the former works
SECURE_HSTS_SECONDS = 60
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-hsts-include-subdomains
SECURE_HSTS_INCLUDE_SUBDOMAINS = getenv(
    "DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS", default=True
)
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-hsts-preload
SECURE_HSTS_PRELOAD = getenv("DJANGO_SECURE_HSTS_PRELOAD", default=True)
# https://docs.djangoproject.com/en/dev/ref/middleware/#x-content-type-options-nosniff
SECURE_CONTENT_TYPE_NOSNIFF = getenv(
    "DJANGO_SECURE_CONTENT_TYPE_NOSNIFF", default=True
)

MIDDLEWARE += [
    'rollbar.contrib.django.middleware.RollbarNotifierMiddleware',
]

ROLLBAR = {
    'access_token': getenv('ROLLBAR_ACCESS_TOKEN'),
    #'environment': 'development' if DEBUG else 'production',
    'environment': getenv("ROLLBAR_ENVIRONMENT", default="production"),
    'root': BASE_DIR,
}
import rollbar
rollbar.init(**ROLLBAR)

# STATIC
# ------------------------
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# MEDIA
# ------------------------------------------------------------------------------

# TEMPLATES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#templates
TEMPLATES[-1]["OPTIONS"]["loaders"] = [  # type: ignore[index] # noqa F405
    (
        "django.template.loaders.cached.Loader",
        [
            "django.template.loaders.filesystem.Loader",
            "django.template.loaders.app_directories.Loader",
        ],
    )
]

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#default-from-email
DEFAULT_FROM_EMAIL = getenv(
    "DJANGO_DEFAULT_FROM_EMAIL", default="checkin <noreply@getin.hfk-bremen.de>"
)
# https://docs.djangoproject.com/en/dev/ref/settings/#server-email
SERVER_EMAIL = getenv("DJANGO_SERVER_EMAIL", default=DEFAULT_FROM_EMAIL)
# https://docs.djangoproject.com/en/dev/ref/settings/#email-subject-prefix
EMAIL_SUBJECT_PREFIX = getenv(
    "DJANGO_EMAIL_SUBJECT_PREFIX", default="[checkin]"
)

POST_OFFICE.update({
    'BACKENDS': {
        'default': 'django.core.mail.backends.smtp.EmailBackend',
    },
    'LOG_LEVEL': 2, # Logs everything
})
if getenv('MAILJET_API_KEY'):
    # FIXME Single reply_to: Mailjet’s API only supports a single Reply-To email address.
    ANYMAIL = {
        'MAILJET_API_KEY': getenv('MAILJET_API_KEY'),
        'MAILJET_SECRET_KEY': getenv('MAILJET_SECRET_KEY'),
    }
    POST_OFFICE.update({
        'BACKENDS': {
            'default': 'anymail.backends.mailjet.EmailBackend',
        },
    })

elif getenv('MAILGUN_API_KEY'):
    ANYMAIL = {
        'MAILGUN_API_KEY': getenv('MAILGUN_API_KEY'),
        'MAILGUN_SENDER_DOMAIN': MESSAGE_FQDN,
        'MAILGUN_API_URL': getenv("MAILGUN_API_URL", default="https://api.mailgun.net/v3"),
    }
    POST_OFFICE.update({
        'BACKENDS': {
            'default': 'anymail.backends.mailgun.EmailBackend',
        },
    })
else:
    EMAIL_HOST = getenv("EMAIL_HOST")
    EMAIL_HOST_USER = getenv("EMAIL_HOST_USER")
    EMAIL_HOST_PASSWORD = getenv("EMAIL_HOST_PASSWORD")
    EMAIL_PORT = getenv("EMAIL_PORT")

override_recipients = getenv("EMAIL_HOST_OVERRIDE_RECIPIENTS", default=None)
if override_recipients:
    POST_OFFICE.update({
        'OVERRIDE_RECIPIENTS': override_recipients.split(","),
    })

# ADMIN
# ------------------------------------------------------------------------------
# Django Admin URL regex.
ADMIN_URL = getenv("DJANGO_ADMIN_URL", default="/admin/")

# Anymail (Mailgun)
# ------------------------------------------------------------------------------
# https://anymail.readthedocs.io/en/stable/installation/#installing-anymail
#INSTALLED_APPS += ["anymail"]  # noqa F405
#EMAIL_BACKEND = "anymail.backends.mailgun.EmailBackend"
# https://anymail.readthedocs.io/en/stable/installation/#anymail-settings-reference
# ANYMAIL = {
#     "MAILGUN_API_KEY": getenv("MAILGUN_API_KEY"),
#     "MAILGUN_SENDER_DOMAIN": getenv("MAILGUN_DOMAIN"),
#     "MAILGUN_API_URL": getenv("MAILGUN_API_URL", default="https://api.mailgun.net/v3"),
# }


# LOGGING
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#logging
# See https://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {"require_debug_false": {"()": "django.utils.log.RequireDebugFalse"}},
    "formatters": {
        "verbose": {
            "format": "%(levelname)s %(asctime)s %(module)s "
            "%(process)d %(thread)d %(message)s"
        }
    },
    "handlers": {
        "mail_admins": {
            "level": "ERROR",
            "filters": ["require_debug_false"],
            "class": "django.utils.log.AdminEmailHandler",
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {"level": getenv("DJANGO_LOGGING_ROOT_LEVEL", default="INFO"), "handlers": ["console"]},
    "loggers": {
        "django.request": {
            "handlers": ["mail_admins"],
            "level": "ERROR",
            "propagate": True,
        },
        "django.security.DisallowedHost": {
            "level": "ERROR",
            "handlers": ["console", "mail_admins"],
            "propagate": True,
        },
    },
}

# Your stuff...
# ------------------------------------------------------------------------------

SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_DOMAIN = getenv("SESSION_COOKIE_DOMAIN", default="checkin.hfk-bremen.de")
extra_cors = getenv("CORS_ALLOWED_ORIGINS", default=None)
if extra_cors:
    CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS + extra_cors.split(",")

# TODO remove together with microsoft_auth
# for now we need this. see tracking.users.apps.fix_microsoft_auth_user_admin() for details
SILENCED_SYSTEM_CHECKS = ["admin.E033"]