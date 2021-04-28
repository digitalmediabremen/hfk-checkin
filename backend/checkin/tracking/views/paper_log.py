from django.contrib import admin
from django.db import models
from django.db.models.query import EmptyQuerySet
from django.utils.translation import ugettext, ugettext_lazy as _
from django.core.validators import DecimalValidator
from django import forms
from dal import autocomplete
from ..models import Checkin, Location, Profile, Origin, LimitedCheckinManager, CheckinQuerySet, PaperCheckin, PaperLog
from django.utils.html import format_html
from django.http import HttpResponse, HttpResponseRedirect
import datetime
from django.contrib import messages
from django.forms import BaseInlineFormSet
from django.core.exceptions import ValidationError, ImproperlyConfigured
from django.forms.fields import TimeInput, to_current_timezone, TimeField, from_current_timezone
from django.utils import timezone
from rangefilter.filter import DateRangeFilter, DateTimeRangeFilter
from django.db.models import Q

import logging
log = logging.getLogger(__name__)
# convert the errors to text
from django.utils.encoding import force_text


class TimezoneAwareTimeField(TimeField):
    def prepare_value(self, datetime_value):
        value = datetime_value
        if isinstance(datetime_value, datetime.datetime):
            datetime_value = to_current_timezone(datetime_value)
            value = datetime_value.time
        return value


def combine_date_and_time(date, cleaned_data, time_field_name):
    time = cleaned_data[time_field_name]
    if date is None or time is None:
        raise ValidationError("Die Zeit- und Datumaangaben sind unvollständig.")
    value = datetime.datetime.combine(date, time)
    return value


class PaperLogSingleLineForm(forms.ModelForm):
    # NOTICE: this form will not validate, if the checkin_ptr is not accessible (out of managers access range)
    # this will cause non-displaying field error like "Please correct the error below.", but with no fields highlighted.
    # solution: use not-limited manager: Checkin.all and PaperCheckin.objects
    # (observe the right order of managers on Checkin!)

    location = forms.ModelChoiceField(
        queryset=Location.objects.all(),
        widget=autocomplete.ModelSelect2(url='paper-location-autocomplete', attrs={'data-html': True})
    )
    time_entered = TimezoneAwareTimeField(label=_("Uhrzeit Eingang"))
    entered_after_midnight = forms.BooleanField(label="> 23:59", required=False)
    time_left = TimezoneAwareTimeField(label=_("Uhrzeit Ausgang"))
    left_after_midnight = forms.BooleanField(label="> 23:59", required=False)

    # field_order is important for validation of time_*
    field_order = ('location', 'location_comment', 'entered_after_midnight', 'left_after_midnight', 'time_entered', 'time_left')

    class Meta:
        model = PaperCheckin
        fields = ('location', 'location_comment', 'time_entered', 'entered_after_midnight', 'time_left', 'left_after_midnight')

    def __init__(self, *args, parent_instance, **kwargs):
        self.parent_instance = parent_instance
        super(PaperLogSingleLineForm, self).__init__(*args, **kwargs)

    def full_clean(self, *args, **kwargs):
        if not self.parent_instance and not isinstance(self.parent_instance, PaperLog):
            raise ImproperlyConfigured("parent_instance of type PaperLog is missing and needed for validation. Did you set the custom BaseInlineFormSet?")
        super(PaperLogSingleLineForm, self).full_clean(*args, **kwargs)

    def clean_time_entered(self):
        # entered_after_midnight needs to be validated first! see field_order
        date = self.parent_instance.date
        if self.cleaned_data['entered_after_midnight']:
            date += datetime.timedelta(days=1)
        return from_current_timezone(combine_date_and_time(date, self.cleaned_data, 'time_entered'))

    def clean_time_left(self):
        # left_after_midnight needs to be validated first! see field_order
        date = self.parent_instance.date
        if self.cleaned_data['left_after_midnight']:
            date += datetime.timedelta(days=1)
        return from_current_timezone(combine_date_and_time(date, self.cleaned_data, 'time_left'))

    def clean(self):
        if not self.cleaned_data.get('time_entered', None) or not self.cleaned_data.get('time_left', None):
            return
        if self.cleaned_data['time_entered'] > self.cleaned_data['time_left']:
            raise ValidationError(_("Uhrzeiten: Der Eingang muss vor dem Ausgang liegen."))
        try:
            self.instance.profile = self.parent_instance.profile
        except Profile.DoesNotExist:
            raise ValidationError(_("Profilangabe fehlt."))
        self.instance.origin_entered = Origin.ADMIN_MANUAL
        self.instance.origin_left = Origin.ADMIN_MANUAL
        super(PaperLogSingleLineForm, self).clean()


class BasePaperLogSingleLineFormSet(BaseInlineFormSet):
    def __init__(self, *args, **kwargs):
        form_kwargs = kwargs.get('form_kwargs', {})
        form_kwargs['parent_instance'] = kwargs.get('instance', None)
        kwargs['form_kwargs'] = form_kwargs
        super(BasePaperLogSingleLineFormSet, self).__init__(*args, **kwargs)


class PaperLogSingleLineInline(admin.TabularInline):
    model = PaperCheckin
    form = PaperLogSingleLineForm
    min_num = 1
    extra = 9
    autocomplete_fields = ['location']
    formset = BasePaperLogSingleLineFormSet


class PaperLogAdminForm(forms.ModelForm):
    profile = forms.ModelChoiceField(
        queryset=Profile.objects.all(),
        widget=autocomplete.ModelSelect2(url='paper-profile-autocomplete', attrs={'data-html': True}),
        blank=True,
        required=False,
        label=_("Suche nach vorhandenem Profil"),
        help_text=_("Sie können nach Vornamen, Nachnamen, Telefonnummer (T), Matrikelnummer (M) und E-Mail-Addressen (E) suchen.<br/>" \
                    "Geprüfte Profile sind bevorzugt auszuwählen. Bei der Suche wird anhand von Abkürzungen angegeben, welche Informationen im Profil hinterlegt sind.")
    )
    signed = forms.BooleanField(label=_("Unterschrift vorhanden?"), initial=True, help_text=_("Aktivieren Sie das Feld, wenn das Papierprotokoll unterschrieben wurde."), required=False)
    # save_profile_changes = forms.BooleanField(required=False, initial=True, label=_("Änderungen an vorhandenem Profil speichern?"),
    #                                           help_text=_("Aktivieren Sie das Feld, um Ihre Änderungen in diesem Formular in den Personendatensatz zu übernhemen. Neue Profile werden immer gespeichert."))

    class Meta:
        model = PaperLog
        fields = ('__all__')
        widgets = {
            'comment': forms.Textarea(attrs={'rows': 2, 'cols': 100}),
        }

    def clean(self):
        super(PaperLogAdminForm, self).clean()
        new = False
        profile = self.cleaned_data['profile']
        if not profile:
            profile = Profile()
            new = True
        profile.first_name = self.cleaned_data.get('first_name')
        profile.last_name = self.cleaned_data.get('last_name')
        profile.phone = self.cleaned_data.get('phone')
        profile.student_number = self.cleaned_data.get('student_number')
        if self.cleaned_data.get('save_profile_changes', True) or new and profile.is_dirty():
            # save and return profile
            profile.save()
            self.cleaned_data['profile'] = profile
        elif not new:
            # do nothing and keep assigned profile
            pass
        else:
            # else do not validate further if still empty
            raise ValidationError(
                _("Bitte aktivieren Sie die Speicherung eines neuen Profils oder wählen Sie ein vorhandenes."))


