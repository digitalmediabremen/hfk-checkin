from dal import autocomplete
from ..models import Resource
from django.contrib.auth import get_user_model

User = get_user_model()

class ResourceAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated:
            return Resource.objects.none()
        qs = Resource.objects.all()
        if self.q:
            qs = qs.filter(name__istartswith=self.q)
        return qs


class UserAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated:
            return User.objects.none()
        qs = User.objects.all()
        if self.q:
            qs = qs.filter(first_name__istartswith=self.q) | qs.filter(last_name__istartswith=self.q) | qs.filter(email__istartswith=self.q)
        return qs