from django.contrib import admin
from django.urls import path, include
from microsoft_auth.views import to_ms_redirect
from django.conf import settings
from django.conf.urls.static import static
from django.views import defaults as default_views

# from django.utils.translation import ugettext_lazy as _
# admin.site.site_header = _("HFK CHECKIN")
# admin.site.site_title = _("HFK CHECKIN")
# admin.site.index_title = _("Übersicht")

from checkin.tracking.views.location import LocationsPDFView, LocationsView
from rest_framework import routers
from checkin.tracking.api import LocationViewSet, ProfileViewSet, LogoutViewSet, CheckinViewSet
from checkin.booking.api import RoomViewSet, BookingRequestViewSet
from microsoft_auth.models import MicrosoftAccount
from checkin.tracking.views.paper_log import LocationAutocomplete, ProfileAutocomplete

from django.contrib import admin
from django.contrib.auth.views import LogoutView

from django.contrib.auth import get_user_model
User = get_user_model()
from checkin.users.admin import UserAdmin

router = routers.SimpleRouter()
router.register(r'location', LocationViewSet)
router.register(r'checkin', CheckinViewSet, basename='checkin')
router.register(r'profile', ProfileViewSet, basename='profile')
router.register(r'auth', LogoutViewSet, basename='auth')
router.register(r'room', RoomViewSet, basename='room')
router.register(r'bookingrequest', BookingRequestViewSet, basename='bookingrequest')

admin.site.unregister(MicrosoftAccount)
# register microsoft_account's hijacked UserAdmin
admin.site.unregister(User)
# put our own UserAdmin back in to place
admin.site.register(User, UserAdmin)

admin.site.enable_nav_sidebar = False

urlpatterns = [
    path('admin/', admin.site.urls),
    path('paperlog-location-autocomplete/', LocationAutocomplete.as_view(), name='paper-location-autocomplete'),
    path('paperlog-profile-autocomplete/', ProfileAutocomplete.as_view(), name='paper-profile-autocomplete'),
    path('impersonate/', include('impersonate.urls')),
    path('login/', include('microsoft_auth.urls', namespace='microsoft')),
    path('login/redirect/', to_ms_redirect),
    path('logout/', LogoutView.as_view()), # deprecated: replaced with API endpoint auth/logout
    path('location/html/', LocationsView.as_view(), name='html-export'),
    path('location/pdf/', LocationsPDFView.as_view(), name='pdf-export'),
    path('api/', include(router.urls)),
]

if "debug_toolbar" in settings.INSTALLED_APPS:
    import debug_toolbar
    urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns

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

