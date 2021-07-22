from ..models import Location, Profile
from django.views.generic import FormView
from django.contrib.auth.mixins import PermissionRequiredMixin
from django import forms
from django.utils.translation import gettext_lazy as _
from ..report import ContactReport
from datetime import timedelta
import io, pytz
from django.http import HttpResponse
from dal import autocomplete
from django.contrib.admin import ModelAdmin, site
from ..models import Checkin
#from ..admin import CheckinAdmin
from django.utils import timezone

OUTPUT_FILENAME_XLSX = 'hfk-checkin-auswertung_%s.xlsx'
OUTPUT_FILENAME_CSV = 'hfk-checkin-auswertung_%s.csv'


class CaseEvaluationSettingsForm(forms.Form):
    #profile = forms.ModelChoiceField(label=_('Profil'),queryset=Profile.objects.order_by('pk').all(), help_text=_("Profil der Person, die in der nachverfolgt werden soll."))
    profile = forms.ModelChoiceField(
        queryset=Profile.objects.all(),
        widget=autocomplete.ModelSelect2(url='paper-profile-autocomplete', attrs={'data-html': True}),
        blank=True,
        required=True,
        label=_("Profil"),
        help_text=_("Sie können nach Vornamen, Nachnamen, Telefonnummer (T), Matrikelnummer (M) und E-Mail-Addressen (E) suchen.<br/>" \
                    "Bei der Suche wird anhand von Abkürzungen angegeben, welche Informationen im Profil hinterlegt sind.")
    )
    exclude_locations = forms.ModelMultipleChoiceField(label=_('Auszuschließende Standorte'), required=False, queryset=Location.objects.all(), help_text=_("Optional: Ein oder mehrere Standorte, die in der Auswertung ignoriert werden sollen. z.B. ganze Gebäude / Eingänge etc."))
    report_checkins = forms.BooleanField(label=_('Checkins ausgeben'), initial=True, required=False, help_text=_("Checkins der gesuchten Person werden in der Ausgabe einschlossen."))
    report_encounters = forms.BooleanField(label=_('Begegnungen ausgeben'), initial=True, required=False, help_text=_("Checkins der gesuchten Person mit einer anderen Person werden in der Ausgabe einschlossen."))
    report_personal_data = forms.BooleanField(label=_('Kontaktdaten ausgeben'), required=False, help_text=_("Klarnamen und Kontaktdaten werden in der Ausgabe einschlossen."))

    checkin_default_length = forms.DurationField(label=_('Standarddauer'), initial=ContactReport.CHECKIN_DEFAULT_LENGTH, help_text=_("Dauer in Stunden, nach der ein Aufenthalt als ausgecheckt gilt, wenn ein Checkout vergessen wurde."))
    #checkin_default_length = forms.TimeField(label=_('Checkout Maximaldauer'), required=False, help_text=_("Dauer in Stunden, nachdem ein Checkin zwangsweise als beendet gilt"))
    infection_lookback_buffer = forms.DurationField(label=_('Kontaktkorrekturzeit'), initial=ContactReport.INFECTION_LOOKBACK_BUFFER, help_text=_("Dauer, um die die tasächliche Aufenthaltsdauer der inf. Person verlängert (bei positiven Wert) oder verkürzt (bei negativen Wert) werden soll."))
    infection_lookback_time = forms.DurationField(label=_('Zeitraum'),
                                                  initial=ContactReport.INFECTION_LOOKBACK_TIME, help_text=_(
            "Dauer ab jetzt in die Vergangenheit, die für die Protokollauswertung durchsucht werden soll. (21 00:00:00 = 21 Tage = 3 Wochen)"))
    TIMEZONE_CHOICES = zip(pytz.all_timezones, pytz.all_timezones)
    timezone = forms.ChoiceField(label=_('Timezone'), initial=timezone.get_current_timezone(), choices=TIMEZONE_CHOICES, help_text=_('Zeitzone der Protokollauswertung / Anzeige'))


class CaseEvaluationView(PermissionRequiredMixin, FormView):
    template_name = 'admin/tracking/checkin/contact_report.html'
    form_class = CaseEvaluationSettingsForm
    permission_required = 'tracking.can_evaluate_case'

    def has_permission(self):
        # check users real permission, ignoring is_superuser
        perms = self.get_permission_required()
        is_superuser_org = self.request.user.is_superuser
        self.request.user.is_superuser = False
        r = self.request.user.has_perms(perms)
        self.request.user.is_superuser = is_superuser_org
        return r

    def get_context_data(self, **kwargs):
        model_admin = ModelAdmin(Checkin, admin_site=site)
        context = super().get_context_data(**kwargs)
        context['media'] = model_admin.media + self.get_form().media
        context['title'] = _('Kontaktnachverfolgung')
        return context

    def form_valid(self, form):
        context = self.get_context_data()
        profile_id = form.cleaned_data['profile'].pk
        exclude_location_ids = [l.pk for l in form.cleaned_data['exclude_locations']]
        tz = form.cleaned_data['timezone']

        timezone.activate(tz)

        output = io.StringIO()
        ContactReport.INFECTION_LOOKBACK_TIME = form.cleaned_data['infection_lookback_time']
        ContactReport.INFECTION_LOOKBACK_BUFFER = form.cleaned_data['infection_lookback_buffer']
        ContactReport.CHECKIN_DEFAULT_LENGTH = form.cleaned_data['checkin_default_length']
        report = ContactReport(profile_id=profile_id, exclude_location_ids=exclude_location_ids, tz=tz)

        format = self.request.GET.get('format')
        if format == 'xlsx':
            data = report.report(form.cleaned_data['report_checkins'], form.cleaned_data['report_encounters'],
                          form.cleaned_data['report_personal_data'], output_format=ContactReport.XLSX_FORMAT)
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename=%s' % OUTPUT_FILENAME_XLSX % timezone.localtime(report.now).strftime("%Y-%m-%d_%H-%M-%S")  # force browser to download file
            response.write(data)
            timezone.deactivate()
            return response

        # else text / html out

        def write(str):
            output.write(str + '\n')
        report.set_output(write)
        report.report(form.cleaned_data['report_checkins'], form.cleaned_data['report_encounters'], form.cleaned_data['report_personal_data'])

        context['result'] = output.getvalue()
        timezone.deactivate()
        return super().render_to_response(context)

case_evaluation_view = CaseEvaluationView.as_view()