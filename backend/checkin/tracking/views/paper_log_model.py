from django.contrib import admin
from django.db import models
from django.db.models.query import EmptyQuerySet
from django.utils.translation import ugettext, ugettext_lazy as _
from django.core.validators import DecimalValidator
from django import forms
from dal import autocomplete
from ..models import Checkin, Location, Profile, Origin
from django.utils.html import format_html
from django.http import HttpResponse, HttpResponseRedirect
import datetime
from django.contrib import messages
from django.forms import BaseInlineFormSet
from django.core.exceptions import ValidationError
from django.forms.fields import TimeInput, to_current_timezone, TimeField


class PaperLog(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, verbose_name=_("Person"))
    first_name = models.CharField(verbose_name=_("Vorname"), max_length=255, blank=True)
    last_name = models.CharField(verbose_name=_("Nachname"), max_length=255, blank=True)
    phone = models.CharField(verbose_name=_("Telefonnummer"), max_length=20, blank=True)
    student_number = models.CharField(verbose_name=_("Matrikelnummer"), max_length=20, blank=True)
    date = models.DateField(verbose_name=_("Datum"))
    signed = models.BooleanField(verbose_name=_("Unterschrift vorhanden"))
    created_at = models.DateTimeField(auto_now_add=True, editable=False, verbose_name=_("Erstellt am"))

    class Meta:
        verbose_name = _("Manuelle Besuchsdokumentation")
        verbose_name_plural = _("Manuelle Besuchsdokumentationen")

    def __str__(self):
        return ugettext("Besuchsdokumentation von %s am %s" % (self.profile.get_full_name(), self.date))

    def __repr__(self):
        type_ = type(self)
        module = type_.__module__
        qualname = type_.__qualname__
        return f"<{module}.{qualname} object at {hex(id(self))}>"


class PaperCheckin(Checkin):
    log = models.ForeignKey(PaperLog, editable=False, on_delete=models.CASCADE)
    location_comment = models.CharField(verbose_name=_("persönliche Referenz"), max_length=255, blank=True)

    class Meta:
        verbose_name = _("Manuell eingegebener Aufenthalt")
        verbose_name_plural = _("Manuell eingegebene Aufenthalte")


class LocationAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated and self.request.user.is_staff:
            return Location.objects.none()
        qs = Location.objects.all()
        if self.q:
            qs = qs.filter(code__istartswith=self.q)
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
            qs = qs.filter(first_name__contains=self.q)
        return qs

    def get_result_label(self, item):
        return format_html("%04d – %s" % (item.pk, item.get_full_name()))

    def get_selected_result_label(self, item):
        return self.get_result_label(item)


class TimezoneAwareTimeField(TimeField):

    def prepare_value(self, datetime_value):
        value = datetime_value
        if isinstance(datetime_value, datetime.datetime):
            datetime_value = to_current_timezone(datetime_value)
            print(datetime_value)
            value = datetime_value.time
        return value


class PaperLogSingleLineForm(forms.ModelForm):
    location = forms.ModelChoiceField(
        queryset=Location.objects.all(),
        widget=autocomplete.ModelSelect2(url='paper-location-autocomplete', attrs={'data-html': True})
    )
    time_entered = TimezoneAwareTimeField(label=_("Uhrzeit Eingang"))
    time_left = TimezoneAwareTimeField(label=_("Uhrzeit Ausgang"))

    class Meta:
        model = PaperCheckin
        fields = ('location', 'location_comment', 'time_entered', 'time_left')

    def __init__(self, *args, parent_instance, **kwargs):
        self.parent_instance = parent_instance
        super(PaperLogSingleLineForm, self).__init__(*args, **kwargs)

    def full_clean(self, *args, **kwargs):
        if not self.parent_instance and not isinstance(self.parent_instance, PaperLog):
            raise ValidationError("parent_instance of type PaperLog is missing and needed for validation. Did you set the custom BaseInlineFormSet?")
        super(PaperLogSingleLineForm, self).full_clean(*args, **kwargs)

    def clean_time_entered(self):
        date = self.parent_instance.date
        time = self.cleaned_data['time_entered']
        value = datetime.datetime.combine(date, time)
        return value

    def clean_time_left(self):
        date = self.parent_instance.date
        time = self.cleaned_data['time_left']
        value = datetime.datetime.combine(date, time)
        return value

    def clean(self):
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
        widget=autocomplete.ModelSelect2(url='paper-profile-autocomplete'),
        blank=True,
        required=False,
        label=_("Suche nach vorhandenem Profil")
    )
    signed = forms.BooleanField(label=_("Unterschrift vorhanden?"), help_text=_("Aktivieren sie das Feld, wenn das Papierprotokoll unterschrieben wurde."), required=False)
    save_profile_changes = forms.BooleanField(required=False, initial=True, label=_("Änderungen an vorhandenem Profil speichern?"),
                                              help_text=_("Aktivieren sie das Feld, um Ihre Änderungen in diesem Formular in den Personendatensatz zu übernhemen. Neue Profile werden immer gespeichert."))

    class Meta:
        model = PaperLog
        fields = ('__all__')

    def clean(self):
        super(PaperLogAdminForm, self).clean()
        new = False
        profile = self.cleaned_data['profile']
        if not profile:
            profile = Profile()
            new = True
        print(self.cleaned_data)
        profile.first_name = self.cleaned_data.get('first_name')
        profile.last_name = self.cleaned_data.get('last_name')
        profile.phone = self.cleaned_data.get('phone')
        profile.student_number = self.cleaned_data.get('student_number')
        if self.cleaned_data.get('save_profile_changes', False) or new:
            # save and return profile
            profile.save()
            self.cleaned_data['profile'] = profile
        elif not new:
            # do nothing and keep assigned profile
            pass
        else:
            # else do not validate further if still empty
            raise ValidationError(
                _("Bitte aktivieren sie die Speicherung eines neuen Profils oder wählen sie ein vorhandenes."))


class PaperLogAdmin(admin.ModelAdmin):
    inlines = [PaperLogSingleLineInline]
    form = PaperLogAdminForm
    autocomplete_fields = ['profile']
    list_display = ['profile', 'date', 'signed']
    fieldsets = (
        ('Personendaten suchen', {
            'fields': ('profile', 'save_profile_changes'),
        }),
        ('Oder: Personendaten hinzufügen, falls Person nicht zu finden ist', {
            'fields': ('first_name', 'last_name', 'phone', 'student_number')
        }),
        (None, {
            'fields': ('date', 'signed'),
        }),
    )

    # TODO use transactions!!!!!!!!!!!!!!!!
    # TODO load exisitng user into form when updating?!

admin.site.register(PaperLog, PaperLogAdmin)
