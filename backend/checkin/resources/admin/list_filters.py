from django.contrib import admin
from ..models import Resource
from django.utils.translation import gettext_lazy as _
from admin_auto_filters.filters import AutocompleteFilter
from django.utils.timezone import now
from ..models.reservation import Reservation, StaticReservationPurpose


class ResourceFilter(AutocompleteFilter):
    title = _("Space")
    field_name = 'resource'


class UserFilter(AutocompleteFilter):
    title = _("Organizer")
    field_name = 'user'

class PastReservationFilter(admin.SimpleListFilter):
    title = _('Past / Future')
    parameter_name = 'end'

    def lookups(self, request, model_admin):
        return (
            #('future', _('Now and future')), # default choice, renamed in choices()
            ('past', _('Past')),
            ('all', _('All')),
        )

    def choices(self, changelist):
        '''
        Return the available choices, while setting a new default.

        :return: Available choices
        :rtype: list
        '''
        choices = list(super().choices(changelist))
        choices[0]['display'] = _('Now and future')
        return choices

    def queryset(self, request, queryset):
        if self.value() == 'all':
            return queryset
        elif self.value() == 'past':
            return queryset.filter(end__lt=now())
        else:
            return queryset.filter(end__gte=now())

class ReservationStateFilter(admin.SimpleListFilter):
    title = _('State')
    parameter_name = 'state'

    def lookups(self, request, model_admin):
        return (
            (None, _('requested')),
            (Reservation.CREATED, _('newly created')),
            (Reservation.CONFIRMED, _('confirmed')),
            (Reservation.DENIED, _('denied')),
            (Reservation.CANCELLED, _('cancelled')),
            ('all', _('All')),
        )

    def choices(self, cl):
        for lookup, title in self.lookup_choices:
            yield {
                'selected': self.value() == lookup,
                'query_string': cl.get_query_string({
                    self.parameter_name: lookup,
                }, []),
                'display': title,
            }

    def queryset(self, request, queryset):
        if self.value() == 'all':
            return queryset
        elif self.value() == None:
            return queryset.filter(state=Reservation.REQUESTED)
        else:
            return queryset.filter(state=self.value())

class PurposeFilter(admin.SimpleListFilter):
    parameter_name = 'purpose'
    title = _("Purpose")

    def lookups(self, request, model_admin):
        return StaticReservationPurpose.choices

    def queryset(self, request, queryset):
        return queryset.filter(purpose=self.value())