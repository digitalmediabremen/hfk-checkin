from django.contrib import admin
from ..models import Resource
from dal_admin_filters import AutocompleteFilter

class ResourceFilter(AutocompleteFilter):
    title = 'Resource'
    field_name = 'resource'
    autocomplete_url = 'resource-autocomplete'
    #is_placeholder_title = True

class UserFilter(AutocompleteFilter):
    title = 'User'
    field_name = 'user'
    autocomplete_url = 'user-autocomplete'
    #is_placeholder_title = True