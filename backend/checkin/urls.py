from django.contrib import admin
from django.urls import path, include
from microsoft_auth.views import to_ms_redirect
from django.conf import settings
from django.conf.urls.static import static

from checkin.tracking.views import RoomCardView
from rest_framework import routers
from checkin.tracking.api import LocationViewSet, CheckinViewSet, ProfileViewSet
from microsoft_auth.models import MicrosoftAccount

from django.contrib import admin

router = routers.SimpleRouter()
router.register(r'location', LocationViewSet)
router.register(r'checkin', CheckinViewSet)
router.register(r'profile', ProfileViewSet)

admin.site.unregister(MicrosoftAccount)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', include('microsoft_auth.urls', namespace='microsoft')),
    path('login/redirect/', to_ms_redirect),
    path('room-card/<int:pk>/', RoomCardView.as_view(), name='pdf-view'),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)