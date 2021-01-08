from ..models import Location, Profile
from django.views.generic import FormView
from django.contrib.auth.mixins import PermissionRequiredMixin
from django import forms
from django.forms.formsets import formset_factory
from django.core.validators import DecimalValidator
from django.utils.translation import ugettext_lazy as _
from django.views.generic import TemplateView
from ..report import ContactReport
from datetime import timedelta
import io
from django.http import HttpResponse


class PaperLogForm(forms.Form):
    name = forms.CharField(label=_("Vor- und Nachname"))
    phonenumber = forms.CharField(label=_("Telefonnummer"))
    studentnumber = forms.CharField(label=_("Matrikelnummer"))
    date = forms.CharField(label=_("heutiges Datum"))
    signed = forms.BooleanField(label=_("Unterschrift vorhanden"))


class PaperLogSingleLineForm(forms.Form):
    location_id = forms.CharField(label=_("Standort-Nr"), validators=[DecimalValidator(max_digits=4, decimal_places=0)])
    location_name = forms.CharField(label=_("persönliche Referenz"))
    time_entered = forms.TimeField(label=_("Uhrzeit Eingang"))
    time_left = forms.TimeField(label=_("Uhrzeit Ausgang"))


SHEET_FORM_PREFIX = "sheet"
ENTRY_FORMSET_PREFIX = "entry"


class PaperLogEntryView(PermissionRequiredMixin, TemplateView):
    template_name = 'admin/tracking/checkin/paper_log_entry.html'
    permission_required = 'tracking.can_enter_paper_sheet'

    def get_form_class(self):
        return formset_factory(PaperLogSingleLineForm, min_num=10)

    def get_context_data(self, **kwargs):
        sheet_form = PaperLogForm
        entry_formset = formset_factory(PaperLogSingleLineForm, min_num=10)
        if self.request.method == 'POST':
            form = sheet_form(self.request.POST, self.request.FILES, prefix=SHEET_FORM_PREFIX)
            formset = entry_formset(self.request.POST, self.request.FILES, prefix=ENTRY_FORMSET_PREFIX)
            if formset.is_valid():
                # do something with the formset.cleaned_data
                pass
        else:
            form = sheet_form(prefix=SHEET_FORM_PREFIX)
            formset = entry_formset(prefix=ENTRY_FORMSET_PREFIX)
        return {'form': form, 'formset': formset}


    # def form_valid(self, form):
    #     context = self.get_context_data()
    #     profile_id = form.cleaned_data['profile'].pk
    #     exclude_location_ids = [l.pk for l in form.cleaned_data['exclude_locations']]
    #
    #     output = io.StringIO()
    #     ContactReport.INFECTION_LOOKBACK_TIME = form.cleaned_data['infection_lookback_time']
    #     ContactReport.INFECTION_LOOKBACK_BUFFER = form.cleaned_data['infection_lookback_buffer']
    #     ContactReport.CHECKIN_DEFAULT_LENGTH = form.cleaned_data['checkin_default_length']
    #     report = ContactReport(profile_id=profile_id, exclude_location_ids=exclude_location_ids)
    #
    #     format = self.request.GET.get('format')
    #     if format == 'xlsx':
    #         data = report.report(form.cleaned_data['report_checkins'], form.cleaned_data['report_encounters'],
    #                       form.cleaned_data['report_personal_data'], output_format=ContactReport.XLSX_FORMAT)
    #         response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    #         response['Content-Disposition'] = 'attachment; filename=%s' % OUTPUT_FILENAME_XLSX % report.now.strftime("%Y-%m-%d_%H-%M-%S")  # force browser to download file
    #         response.write(data)
    #         return response
    #
    #     # else text / html out
    #
    #     def write(str):
    #         output.write(str + '\n')
    #     report.set_output(write)
    #     report.report(form.cleaned_data['report_checkins'], form.cleaned_data['report_encounters'], form.cleaned_data['report_personal_data'])
    #
    #     context['result'] = output.getvalue()
    #     return super().render_to_response(context)

paper_log_entry_view = PaperLogEntryView.as_view()