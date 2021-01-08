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

class PaperLog(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, verbose_name=_("Suche"), blank=True)
    save_changes = models.BooleanField(verbose_name=_("Änderungen speichern"), default=False)
    first_name = models.CharField(verbose_name=_("Vorname"), max_length=255, blank=True)
    last_name = models.CharField(verbose_name=_("Nachname"), max_length=255, blank=True)
    phone = models.CharField(verbose_name=_("Telefonnummer"), max_length=20, blank=True)
    student_number = models.CharField(verbose_name=_("Matrikelnummer"), max_length=20, blank=True)
    date = models.DateField(verbose_name=_("Datum"))
    signed = models.BooleanField(verbose_name=_("Unterschrift vorhanden"))

    class Meta:
        managed = False
        db_table = None
        verbose_name = _("Besuchsdokumentation")
        verbose_name_plural = _("Besuchsdokumentationen")

    def __str__(self):
        return ugettext("%s am %s" % (self.profile.get_full_name(), self.date))

    def has_change_permission(self, request, obj=None):
        return False

    def has_view_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_module_permission(self, request):
        return False

    def save(self, *args, **kwargs):
        raise NotImplementedError("PaperLog can not be saved to the database. Model exists for form creation only.")


class PaperLogSingleLine(models.Model):
    location = models.ForeignKey(Location, on_delete=models.CASCADE, verbose_name=_("Standort-Nr"))
    # location_code = models.CharField(verbose_name=_("Standort-Nr"), validators=[DecimalValidator(max_digits=4, decimal_places=0)], max_length=4)
    location_comment = models.CharField(verbose_name=_("persönliche Referenz"), max_length=255, blank=True)
    time_entered = models.TimeField(verbose_name=_("Uhrzeit Eingang"))
    time_left = models.TimeField(verbose_name=_("Uhrzeit Ausgang"))
    log = models.ForeignKey(PaperLog, on_delete=models.CASCADE)

    class Meta:
        managed = False
        verbose_name = _("Aufenthalt")
        verbose_name_plural = _("Aufenthalte")

    def save(self, *args, **kwargs):
        raise NotImplementedError(
            "PaperLogSingleLine can not be saved to the database. Model exists for form creation only.")


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


class PaperLogSingleLineForm(forms.ModelForm):
    location = forms.ModelChoiceField(
        queryset=Location.objects.all(),
        widget=autocomplete.ModelSelect2(url='paper-location-autocomplete', attrs={'data-html': True})
    )

    class Meta:
        model = PaperLogSingleLine
        fields = ('__all__')


class PaperLogSingleLineInline(admin.TabularInline):
    model = PaperLogSingleLine
    form = PaperLogSingleLineForm
    min_num = 1
    extra = 9
    autocomplete_fields = ['location']
    # can_delete = False
    # prepopulated_fields = {"location_name": ("location__code",)}


class PaperLogAdminForm(forms.ModelForm):
    signed = forms.TypedChoiceField(coerce=lambda x: x == 'True', choices=((False, 'fehlt'), (True, 'vorhanden')),
                                    widget=forms.RadioSelect, label=_("Unterschrift"))
    save_changes = forms.TypedChoiceField(coerce=lambda x: x == 'True', choices=(
    (False, 'Nein'), (True, 'Ja, Änderungen aus untentehendem Formular in Profil übertragen.')),
                                          widget=forms.RadioSelect, label=_("Änderungen speichern"))

    class Meta:
        model = PaperLog
        fields = ('__all__')

    # data processing and saving is done on the fake models clean() and save()


class PaperLogAdmin(admin.ModelAdmin):
    inlines = [PaperLogSingleLineInline]
    form = PaperLogAdminForm
    autocomplete_fields = ['profile']
    fieldsets = (
        ('Personendaten suchen', {
            'fields': ('profile', 'save_changes'),
        }),
        ('Oder: Personendaten hinzufügen, falls Person nicht zu finden ist', {
            'fields': ('first_name', 'last_name', 'phone', 'student_number')
        }),
        (None, {
            'fields': ('date', 'signed'),
        }),
    )

    def get_changelist_instance(self, request):
        raise NotImplementedError("PaperLog can not be retrieved from database. Model exists for form creation only.")

    # data processing and saving is done on the fake models clean() and save()
    # TODO: does not work. both form and formset need to be handeled at the same time.

    def save_form(self, request, form, change):
        """
        Given a ModelForm return an unsaved instance. ``change`` is True if
        the object is being changed, and False if it's being added.
        """
        # TODO update profile here or in model.
        return form.save(commit=False)

    def save_model(self, request, obj, form, change):
        """
        Given a model instance save it to the database.
        """
        return
        obj.save()

    def save_formset(self, request, form, formset, change):
        """
        Given an inline formset save it to the database.
        """
        if not form.is_valid():
            raise ValidationError
        profile = form.instance.profile
        date = form.instance.date
        # print(form.instance)
        # print(formset.extra_forms)
        for line_form in formset.extra_forms:
            if line_form.has_changed() and line_form.is_valid():
                entry = line_form.instance
                Checkin.objects.create(profile=profile,
                                       location=entry.location,
                                       # FIXME: time_entered is currently not used because model field has autoaddnow=True.
                                       # Changes might break API!
                                       time_entered=datetime.datetime.combine(date, entry.time_entered),
                                       time_left=datetime.datetime.combine(date, entry.time_left),
                                       origin_entered=Origin.ADMIN_MANUAL,
                                       origin_left=Origin.ADMIN_MANUAL)
        return
        # TODO add checkins here.
        formset.save()

    def save_related(self, request, form, formsets, change):
        """
        Given the ``HttpRequest``, the parent ``ModelForm`` instance, the
        list of inline formsets and a boolean value based on whether the
        parent is being added or changed, save the related objects to the
        database. Note that at this point save_form() and save_model() have
        already been called.
        """
        for formset in formsets:
            self.save_formset(request, form, formset, change=change)
        return
        form.save_m2m()
        for formset in formsets:
            self.save_formset(request, form, formset, change=change)

    def construct_change_message(self, request, form, formsets, add=False):
        return "Besuchsdokumentation übertragen."

    def response_add(self, request, new_object, **kwargs):
        msg = _("Die Enträge des Besuchsprotokolls wurden erfolgreich übertragen und als Checkins gespeichert. Sie können nun ein weiteres Protokoll eingeben.")
        self.message_user(request, msg, messages.SUCCESS)
        redirect_url = request.path
        # redirect_url = add_preserved_filters({'preserved_filters': preserved_filters, 'opts': opts}, redirect_url)
        return HttpResponseRedirect(redirect_url)

    # TODO use transactions!!!!!!!!!!!!!!!!


admin.site.register(PaperLog, PaperLogAdmin)
