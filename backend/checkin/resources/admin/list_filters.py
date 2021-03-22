from django.contrib import admin
from ..models import Resource
from django.utils.translation import gettext_lazy as _
from admin_auto_filters.filters import AutocompleteFilter


class ResourceFilter(AutocompleteFilter):
    title = _("Space")
    field_name = 'resource'


class UserFilter(AutocompleteFilter):
    title = _("User")
    field_name = 'user'