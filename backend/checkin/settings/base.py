"""
Base settings to build other settings files upon.
"""

import dj_database_url
from pathlib import Path
from os import environ
import logging
getenv = environ.get

BASE_DIR = Path(__file__).resolve().parent.parent.parent
APPS_DIR = Path.joinpath(BASE_DIR, "checkin")

READ_DOT_ENV_FILE = getenv("DJANGO_READ_DOT_ENV_FILE", default=False)

logger = logging.getLogger(__name__)

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = getenv("DJANGO_DEBUG", False)
# Local time zone. Choices are
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# though not all of them may be available with every OS.
# In Windows, this must be set to your system time zone.
TIME_ZONE = "Europe/Berlin"
# https://docs.djangoproject.com/en/dev/ref/settings/#language-code
LANGUAGE_CODE = "de" # default or fallback language
# https://docs.djangoproject.com/en/dev/ref/settings/#site-id
SITE_ID = 1
# https://docs.djangoproject.com/en/dev/ref/settings/#use-i18n
USE_I18N = True
# https://docs.djangoproject.com/en/dev/ref/settings/#use-l10n
USE_L10N = True
# https://docs.djangoproject.com/en/dev/ref/settings/#use-tz
USE_TZ = True
# https://docs.djangoproject.com/en/dev/ref/settings/#locale-paths
LOCALE_PATHS = [str(Path.joinpath(APPS_DIR, "locale"))]

from django.utils.translation import gettext_lazy as _

LANGUAGES = [
    ('de', _('Deutsch')),
    ('en', _('Englisch')),
]

# custom fallback language
# needs CustomFallbackLocaleMiddleware
LANGUAGE_FALLBACK = 'en'

# DATABASES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#databases

DATABASES = {
    "default": dj_database_url.config(default='postgres:///checkin')
}
DATABASES["default"]["ATOMIC_REQUESTS"] = True

# URLS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#root-urlconf
ROOT_URLCONF = "checkin.urls"
# https://docs.djangoproject.com/en/dev/ref/settings/#wsgi-application
WSGI_APPLICATION = "checkin.wsgi.application"

# APPS
# ------------------------------------------------------------------------------
DJANGO_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.sites",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.forms",
    # dal = django-autocomplete-light needs to come BEFORE django.contrib.admin
    'dal',
    'dal_select2',
    #"nucleus", # before django.contrib.admin
    'modeltranslation', # before django.contrib.admin
    "django.contrib.admin",
]
THIRD_PARTY_APPS = [
    'mptt',
    'simple_history',
    #'import_export',
    'wkhtmltopdf',
    'rest_framework',
    'microsoft_auth',
    'corsheaders',
    'impersonate',
    'rangefilter',
    'django_better_admin_arrayfield',
    'post_office',
    'guardian',
    'django_filters',
    'django_premailer',
]

LOCAL_APPS = [
    'checkin.users',
    'checkin.tracking',
    #'checkin.booking',
    'checkin.resources',
    'checkin.notifications',
]
# https://docs.djangoproject.com/en/dev/ref/settings/#installed-apps
INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# MIGRATIONS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#migration-modules
# MIGRATION_MODULES = {"sites": "checkin.contrib.sites.migrations"}

# AUTHENTICATION
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#authentication-backends
AUTHENTICATION_BACKENDS = [
    'microsoft_auth.backends.MicrosoftAuthenticationBackend',
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
]
# # https://docs.djangoproject.com/en/dev/ref/settings/#auth-user-model
# AUTH_USER_MODEL = "people.User"
AUTH_USER_MODEL = "users.User"
# # https://docs.djangoproject.com/en/dev/ref/settings/#login-redirect-url
# LOGIN_REDIRECT_URL = "users:redirect"
# # https://docs.djangoproject.com/en/dev/ref/settings/#login-url
# LOGIN_URL = "account_login"
# Custom model for django-guardian
GUARDIAN_USER_OBJ_PERMS_MODEL = 'users.TimeEnabledUserObjectPermission'
GUARDIAN_GROUP_OBJ_PERMS_MODEL = 'users.TimeEnabledGroupObjectPermission'

# PASSWORDS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#password-hashers
PASSWORD_HASHERS = [
    # https://docs.djangoproject.com/en/dev/topics/auth/passwords/#using-argon2-with-django
    # "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]
# https://docs.djangoproject.com/en/dev/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# MIDDLEWARE
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#middleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "checkin.middleware.CustomFallbackLocaleMiddleware",
    'corsheaders.middleware.CorsMiddleware',
    "checkin.middleware.JSON404Middleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    'corsheaders.middleware.CorsPostCsrfMiddleware',
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    'impersonate.middleware.ImpersonateMiddleware',
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.common.BrokenLinkEmailsMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    'simple_history.middleware.HistoryRequestMiddleware',
]

# STATIC
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#static-root
STATIC_ROOT = str(Path.joinpath(BASE_DIR, "staticfiles"))
# https://docs.djangoproject.com/en/dev/ref/settings/#static-url
STATIC_URL = "/static/"
# https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#std:setting-STATICFILES_DIRS
STATICFILES_DIRS = [str(Path.joinpath(APPS_DIR,"static"))]
# https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#staticfiles-finders
STATICFILES_FINDERS = [
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
]

# MEDIA
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#media-root
MEDIA_ROOT = str(Path.joinpath(APPS_DIR,"media"))
# https://docs.djangoproject.com/en/dev/ref/settings/#media-url
MEDIA_URL = "/media/"

# TEMPLATES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#templates
TEMPLATES = [
    {
        # https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-TEMPLATES-BACKEND
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # https://docs.djangoproject.com/en/dev/ref/settings/#template-dirs
        "DIRS": [str(Path.joinpath(APPS_DIR,"templates"))],
        #"APP_DIRS": True,
        "OPTIONS": {
            # https://docs.djangoproject.com/en/dev/ref/settings/#template-loaders
            # https://docs.djangoproject.com/en/dev/ref/templates/api/#loader-types
            "loaders": [
                "django.template.loaders.filesystem.Loader",
                "django.template.loaders.app_directories.Loader",
            ],
            # https://docs.djangoproject.com/en/dev/ref/settings/#template-context-processors
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.i18n",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.template.context_processors.tz",
                "django.contrib.messages.context_processors.messages",
                #"nucleus.context_processors.nucleus",
                'microsoft_auth.context_processors.microsoft',
            ],
        },
    }
]


# https://docs.djangoproject.com/en/dev/ref/settings/#form-renderer
FORM_RENDERER = "django.forms.renderers.TemplatesSetting"

# http://django-crispy-forms.readthedocs.io/en/latest/install.html#template-packs
CRISPY_TEMPLATE_PACK = "bootstrap4"

# FIXTURES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#fixture-dirs
FIXTURE_DIRS = (str(Path.joinpath(APPS_DIR,"fixtures")),)

# SECURITY
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#session-cookie-httponly
SESSION_COOKIE_HTTPONLY = True
# https://docs.djangoproject.com/en/dev/ref/settings/#csrf-cookie-httponly
CSRF_COOKIE_HTTPONLY = True
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-browser-xss-filter
SECURE_BROWSER_XSS_FILTER = True
# https://docs.djangoproject.com/en/dev/ref/settings/#x-frame-options
X_FRAME_OPTIONS = "DENY"

SESSION_COOKIE_AGE = 15780000 # 6 month

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
EMAIL_BACKEND = getenv(
    "DJANGO_EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend"
)
# https://docs.djangoproject.com/en/2.2/ref/settings/#email-timeout
EMAIL_TIMEOUT = 5

# ADMIN
# ------------------------------------------------------------------------------
# Django Admin URL.
ADMIN_URL = "admin/"
# https://docs.djangoproject.com/en/dev/ref/settings/#admins
ADMINS = []
# https://docs.djangoproject.com/en/dev/ref/settings/#managers
MANAGERS = ADMINS
# We are currently English only: The default language middleware was disabled. See MIDDLEWARE
ADMIN_LANGUAGE_CODE="de-de"
LANGUAGE_CODE = "de-de"

# LOGGING
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#logging
# See https://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "%(levelname)s %(asctime)s %(module)s "
            "%(process)d %(thread)d %(message)s"
        }
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        }
    },
    "root": {"level": "DEBUG", "handlers": ["console"]},
}

# django-reset-framework
# -------------------------------------------------------------------------------
# django-rest-framework - https://www.django-rest-framework.org/api-guide/settings/
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "checkin.api_auth.CSRFExemptSessionAuthentication",
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "EXCEPTION_HANDLER": "checkin.api_exception_handler.custom_exception_handler",
}
handler500 = 'rest_framework.exceptions.server_error'
handler400 = 'rest_framework.exceptions.bad_request'

# values you got from step 2 from your Mirosoft app
MICROSOFT_AUTH_CLIENT_ID = '94b11d1a-f375-46aa-9b1f-e9da0de19114'
MICROSOFT_AUTH_CLIENT_SECRET = getenv("MICROSOFT_AUTH_CLIENT_SECRET", default=None)
# Tenant ID is also needed for single tenant applications
MICROSOFT_AUTH_TENANT_ID = '09e769ef-38f0-4cf4-a9e2-194cccd24761'
environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = 'true' # does not use django.conf. Set os.env instead.

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://checkin.hfk-bremen.de",
    "http://checkin.hfk-bremen.de",
    "https://staging.checkin.uiuiui.digital",
    "http://staging.checkin.uiuiui.digital",
    "https://hfk-checkin-frontend.herokuapp.com",
    "http://hfk-checkin-frontend.herokuapp.com",
    "https://checkin.uiuiui.digital",
    "http://checkin.uiuiui.digital",
    "http://hfk-bremen.de",
    "https://hfk-checkin-frontend-staging.herokuapp.com",
    "http://hfk-checkin-frontend-staging.herokuapp.com",
    "https://getin.uiuiui.digital",
    "http://getin.uiuiui.digital",
    "https://staging.getin.uiuiui.digital",
    "http://staging.getin.uiuiui.digital",
    "https://getin.hfk-bremen.de",
    "http://getin.hfk-bremen.de",
    "https://staging.getin.hfk-bremen.de",
    "http://staging.getin.hfk-bremen.de",
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    '*',
]

# user impersination

IMPERSONATE = {
    'REDIRECT_URL': '/admin/',
    'PAGINATE_COUNT': 10,
    'REQUIRE_SUPERUSER': True,
    'URI_EXCLUSIONS': ['api/'],
}

# fast time entry

TIME_INPUT_FORMATS = [
    '%H:%M:%S',     # '14:30:59'
    '%H:%M:%S.%f',  # '14:30:59.000200'
    '%H:%M',        # '14:30'
    '%H%M',         # '1430' - for faster entry
    #'%H%M%S',       # '143059' - for faster entry
]

# THEMING with Nucleus
# -------------------------------------------------------------------------------
NUCLEUS = {
    'sidebar': {
        # Title
        'title': _('Custom title'),

        # Footer
        'footer': {
            'title': _('Custom title'),
            'description': _('Longer text displayed below the title'),
        },

        # Navigation
        'navigation': {
            # Application
            'auth': {
                'title': _('Accounts'),  # Override title
                'icon': 'img/custom-icon.svg'  # Optional
            },

            # Model
            'auth.User': {
                'title': _('Users'),
                'icon': 'img/custom-icon.svg'  # Optional
            }
        }
    }
}

# TESTING
# -------------------------------------------------------------------------------
import sys
TESTING = sys.argv[1:2] == ['test']
if TESTING and 'microsoft_auth' in INSTALLED_APPS:
    logger.warn("TESTING MODE: removing microsoft_auth from INSTALLED_APPS.")
    INSTALLED_APPS.remove('microsoft_auth')
# INSTALLED_APPS += ('django_nose',)
# TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'
# NOSE_ARGS = [
#     str(BASE_DIR),
#     '-s',
#     '--nologcapture',
#     '--with-coverage',
#     # '--with-progressive',
#     # '--cover-package=pandaid-rest-api'
#     '--exclude-path=*/*/admin',
#     '--exclude-path=*/*/models',
#     '--exclude-path=*/*/api',
# ]