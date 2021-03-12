from django.urls import path
from .views.autocomplete import ResourceAutocomplete, UserAutocomplete

urlpatterns = [
    path('resource-autocomplete', ResourceAutocomplete.as_view(), name='resource-autocomplete',),
    path('user-autocomplete', UserAutocomplete.as_view(), name='user-autocomplete',),
]