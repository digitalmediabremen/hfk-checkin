from dal import autocomplete
from ..models import Checkin, Location, Profile, Origin, LimitedCheckinManager, CheckinQuerySet, PaperCheckin, PaperLog
from django.utils.html import format_html
from django.db.models import Q


class LocationAutocomplete(autocomplete.Select2QuerySetView):
    # TODO privacy? do not allow to display all users here?
    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated and self.request.user.is_staff:
            return Location.objects.none()
        qs = Location.objects.all()
        if self.q:
            qs = qs.filter(Q(code__istartswith=self.q) | Q(_name__istartswith=self.q) | Q(_number__istartswith=self.q) | Q(resource__name__istartswith=self.q) | Q(resource__numbers__istartswith=self.q))
        return qs

    def get_result_label(self, item):
        return format_html("<strong>%s</strong> – %s" % (item.code, item))

    def get_selected_result_label(self, item):
        return self.get_result_label(item)


class ProfileAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated and self.request.user.is_staff:
            return Profile.objects.none()
        qs = Profile.objects.all()
        if self.q:
            qs = qs.annotate_search().filter(search=self.q)
        return qs

    def get_result_label(self, item):
        extra_markers = []
        if item.phone:
            extra_markers.append("T")
        if item.email:
            extra_markers.append("E")
        if item.student_number:
            extra_markers.append("M")
        if item.verified:
            extra_markers.append("Geprüft")
        extra = " ".join(extra_markers)
        return format_html("<strong>%s</strong> %s" % (item.get_full_name(), extra))

    def get_selected_result_label(self, item):
        return self.get_result_label(item)
