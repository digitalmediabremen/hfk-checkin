from django.contrib import admin
from django.urls import path, include, re_path
from microsoft_auth.views import to_ms_redirect
from django.conf import settings
from django.conf.urls.static import static
from django.views import defaults as default_views
from django.views.generic import RedirectView

from rest_framework import routers
from rest_framework.schemas import get_schema_view

from django.contrib import admin
from django.contrib.auth.views import LogoutView
from django.contrib.auth import get_user_model
User = get_user_model()

from checkin.resources.api import RespaAPIRouter

admin.site.enable_nav_sidebar = False
urlpatterns = []
checkin_api_router = routers.SimpleRouter()

if 'checkin.tracking' in settings.INSTALLED_APPS:
    urlpatterns += [path('', include('checkin.tracking.urls'))]

respa_router = RespaAPIRouter()

if 'microsoft_auth' in settings.INSTALLED_APPS:
    from checkin.users.apps import fix_microsoft_auth_user_admin
    fix_microsoft_auth_user_admin()

urlpatterns += [
    path('', RedirectView.as_view(url='/backend/', permanent=False, query_string=True)),
    path('backend/', admin.site.urls),
    re_path('admin/(?P<rest>.*)', RedirectView.as_view(url='/backend/%(rest)s', permanent=True, query_string=True)),
    path('impersonate/', include('impersonate.urls')),
    path('login/redirect/', to_ms_redirect),
    path('logout/', LogoutView.as_view(success_url_allowed_hosts=settings.SUCCESS_URLS_ALLOWED)), # deprecated: replaced with API endpoint auth/logout
    path('api/', include(respa_router.urls)),
    path('resources/', include('checkin.resources.urls')),
    path('openapi', get_schema_view(
            title="Checkin API",
            description="API for a little web service to make space and people find each other. (Currently limited to booking-related functions.)",
            version="2.0.0",
            patterns=[path('api/booking/', include(respa_router.urls))]
        ), name='openapi-schema'),
]

if 'checkin.notifications' in settings.INSTALLED_APPS:
    urlpatterns += [path('notifications/', include('checkin.notifications.urls'))]

if 'microsoft_auth' in settings.INSTALLED_APPS:
    urlpatterns += [path('login/', include('microsoft_auth.urls', namespace='microsoft'))]

if "debug_toolbar" in settings.INSTALLED_APPS:
    import debug_toolbar
    urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]

if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        path(
            "400/",
            default_views.bad_request,
            kwargs={"exception": Exception("Bad Request!")},
        ),
        path(
            "403/",
            default_views.permission_denied,
            kwargs={"exception": Exception("Permission Denied")},
        ),
        path(
            "404/",
            default_views.page_not_found,
            kwargs={"exception": Exception("Page not Found")},
        ),
        path("500/", default_views.server_error),
    ]

    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

