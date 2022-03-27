from django.contrib import admin
from ..models import Resource
from django.utils.translation import gettext_lazy as _
from admin_auto_filters.filters import AutocompleteFilter
from django.utils.timezone import now
from django.utils import timezone
import datetime, re
from ..models.reservation import Reservation, StaticReservationPurpose
from ..models.reservation import UNIVERSAL_OVERLAP_Q
from django.core.exceptions import ImproperlyConfigured
from django.conf import settings


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
        if self.value() == None: # None == "All" value
            return queryset
        return queryset.filter(purpose=self.value())


class MyResourceRelationFilter(admin.SimpleListFilter):
    title = _('my relation')
    parameter_name = 'delegate'

    def lookups(self, request, model_admin):
        return (
            ('reservation', _('Reservations by me')),
            ('access', _('Access by me')),
            ('ureservation', _('Reservations by me (incl. unit)')),
            ('uaccess', _('Access by me (incl. unit)')),
        )

    def choices(self, changelist):
        # change default "all" label
        choices = list(super().choices(changelist))
        choices[0]['display'] = _('indifferent')
        return choices

    def queryset(self, request, queryset):
        if self.value() == 'all':
            return queryset
        elif self.value() == 'reservation':
            return queryset.filter(pk__in=Resource.objects.get_resources_reservation_delegated_to_user(request.user, with_unit=False))
        elif self.value() == 'access':
            return queryset.filter(pk__in=Resource.objects.get_resources_access_delegated_to_user(request.user, with_unit=False))
        elif self.value() == 'ureservation':
            return queryset.filter(pk__in=Resource.objects.get_resources_reservation_delegated_to_user(request.user, with_unit=True))
        elif self.value() == 'uaccess':
            return queryset.filter(pk__in=Resource.objects.get_resources_access_delegated_to_user(request.user, with_unit=True))


class MyReservationRelationFilter(admin.SimpleListFilter):
    title = _('my relation')
    parameter_name = 'delegate'

    def lookups(self, request, model_admin):
        return (
            ('delegatedtome', _('In my responsibility')),
            ('udelegatedtome', _('In my responsibility (incl. unit)')),
            ('myown', _('Created by me')),
            ('myedits', _('Last edited by me')),
        )

    def choices(self, changelist):
        # change default "all" label
        choices = list(super().choices(changelist))
        choices[0]['display'] = _('indifferent')
        return choices

    def queryset(self, request, queryset):
        if self.value() == 'all':
            return queryset
        elif self.value() == 'delegatedtome':
            return queryset.filter(resource__in=Resource.objects.get_resources_reservation_delegated_to_user(request.user, with_unit=False))
        elif self.value() == 'udelegatedtome':
            return queryset.filter(resource__in=Resource.objects.get_resources_reservation_delegated_to_user(request.user, with_unit=True))
        elif self.value() == 'myown':
            return queryset.filter(created_by=request.user)
        elif self.value() == 'myedits':
            return queryset.filter(modified_by=request.user)


class RangeBasedBeginEndDateHierarchyListFilter(admin.ListFilter):
    # from: https://hakibenita.com/django-admin-range-based-date-hierarchy
    # and: https://github.com/hakib/django-admin-lightweight-date-hierarchy/blob/master/django_admin_lightweight_date_hierarchy/admin.py
    # modified to accommodate begin and end fields
    title = ''

    def __init__(self, request, params, model, model_admin):
        self.date_hierarchy_field = model_admin.date_hierarchy
        if not hasattr(model_admin, 'range_begin_field') or not hasattr(model_admin, 'range_end_field'):
            raise ImproperlyConfigured(
                'RangeBasedBeginEndDateHierarchyListFilter requires range_begin_field and range_end_field to be set in the ModelAdmin'
            )

        self.begin_field = model_admin.range_begin_field
        self.end_field = model_admin.range_end_field

        if self.date_hierarchy_field is None:
            raise ImproperlyConfigured(
                'RangeBasedBeginEndDateHierarchyListFilter requires date_hierarchy to be set in the ModelAdmin'
            )

        self.date_hierarchy = {}

        date_hierarchy_field_re = re.compile(fr'^{self.date_hierarchy_field}__(day|month|year)$')

        # Django applies filters one by one on the params requested in the URL's.
        # By poping the date hierarchy from the params list we prevent the
        # default behaviour.
        for param in list(params.keys()):
            match = date_hierarchy_field_re.match(param)
            if match:
                period = match.group(1)
                self.date_hierarchy[period] = int(params.pop(param))

    def has_output(self):
        # Is there a date hierarchy filter?
        return bool(self.date_hierarchy)

    def choices(self, changelist):
        # Required.
        return {}

    def queryset(self, request, queryset):
        tz = timezone.get_default_timezone() if settings.USE_TZ else None
        from_date, to_date = get_date_range_for_hierarchy(self.date_hierarchy, tz)

        Q = UNIVERSAL_OVERLAP_Q(from_date, to_date, self.begin_field, self.end_field)
        print(Q)
        return queryset.filter(Q)


def get_date_range_for_hierarchy(date_hierarchy, tz):
    """Generate date range for date hierarchy.

    date_hierarchy <dict>:
        year (int)
        month (int or None)
        day (int or None)
    tz <timezone or None>:
        The timezone in which to generate the datetimes.
        If None, the datetimes will be naive.

    Returns (tuple):
        from_date (datetime.datetime, aware if tz is set) inclusive
        to_date (datetime.datetime, aware if tz is set) exclusive
    """
    from_date = datetime.datetime(
        date_hierarchy['year'],
        date_hierarchy.get('month', 1),
        date_hierarchy.get('day', 1),
    )

    if tz:
        from_date = tz.localize(from_date)

    if 'day' in date_hierarchy:
        to_date = from_date + datetime.timedelta(days=1)

    elif 'month' in date_hierarchy:
        assert from_date.day == 1
        to_date = (from_date + datetime.timedelta(days=32)).replace(day=1)

    else:
        to_date = from_date.replace(year=from_date.year + 1)

    return from_date, to_date


