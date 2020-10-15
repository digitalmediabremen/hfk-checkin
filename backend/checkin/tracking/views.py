from django.views.generic.detail import SingleObjectMixin, DetailView
from django.views.generic.base import ContextMixin, TemplateResponseMixin
from django.views import View
from .models import Location
from django.core.exceptions import SuspiciousOperation
from django.utils import timezone

import functools

from django.conf import settings
from django.views.generic import DetailView, ListView

from django_weasyprint import WeasyTemplateResponseMixin, WeasyTemplateView
from django_weasyprint.views import CONTENT_TYPE_PNG

import segno
from os import environ

QR_URL_WITH_CODE = environ.get("QR_URL_WITH_CODE", default="https://checkin.hfk-bremen.de/checkin/%s")

def make_qr_code(code):
    url = QR_URL_WITH_CODE % code
    return segno.make(url, micro=False).svg_data_uri()


class LocationsView(TemplateResponseMixin, ContextMixin, View):
    template_name = 'roomcards.html'

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        codes = request.GET.get('codes', None)
        if codes:
            codes = codes.split(',')
            locations = Location.objects.filter(code__in=codes)
        else:
            locations = Location.objects.all()
        for l in locations:
            l.qr_svg_uri = make_qr_code(l.code)
        context['objects'] = locations
        return self.render_to_response(context)


class LocationsPDFView(WeasyTemplateResponseMixin, LocationsView):
    # show pdf in-line (default: True, show download dialog)
    pdf_attachment = False
    pdf_filename = 'hfk-checkin-label.pdf'

    def get_pdf_filename(self):
        return 'hfk-checkin-label_%s.pdf' % timezone.now().strftime("%Y-%m-%d_%H-%M-%S")