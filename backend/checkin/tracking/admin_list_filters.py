from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from admin_auto_filters.filters import AutocompleteFilter

class UserFilter(AutocompleteFilter):
    title = _("User")
    field_name = 'user'

class ProfileFilter(AutocompleteFilter):
    title = _("Profile")
    field_name = 'profile'

class LocationFilter(AutocompleteFilter):
    title = _("Location")
    field_name = 'location'