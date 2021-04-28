from django.urls import path, include
from rest_framework import routers
from .views.location import LocationsPDFView, LocationsView
from .api import LocationViewSet, CheckinViewSet
from .views.autocomplete import LocationAutocomplete, ProfileAutocomplete

checkin_api_router = routers.SimpleRouter()

checkin_api_router.register(r'location', LocationViewSet)
checkin_api_router.register(r'checkin', CheckinViewSet, basename='checkin')
#checkin_api_router.register(r'auth', LogoutViewSet, basename='auth')

urlpatterns = [
    path('location/html/', LocationsView.as_view(), name='html-export'),
    path('location/pdf/', LocationsPDFView.as_view(), name='pdf-export'),
    path('api/', include(checkin_api_router.urls)),
    path('paperlog-location-autocomplete/', LocationAutocomplete.as_view(), name='paper-location-autocomplete'),
    path('paperlog-profile-autocomplete/', ProfileAutocomplete.as_view(), name='paper-profile-autocomplete'),
]