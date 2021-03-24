# django's admin autocomplete views
# with custom permissions to allow autocomplete on models without "view" permission.

from django.contrib.admin.views.autocomplete import AutocompleteJsonView


class ResourceAutocompleteJsonView(AutocompleteJsonView):

    def has_perm(self, request, obj=None):
        #return self.model_admin.has_view_permission(request, obj=obj)
        return True