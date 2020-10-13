from django.views.generic.detail import SingleObjectMixin, DetailView
from django.views import View
from .models import Location

import functools

from django.conf import settings
from django.views.generic import DetailView

from django_weasyprint import WeasyTemplateResponseMixin
from django_weasyprint.views import CONTENT_TYPE_PNG

import segno

QR_URL_WITH_CODE = "https://checkin.hfk-bremen.de/checkin/%s"

def make_qr_code(code):
    url = QR_URL_WITH_CODE % code
    return segno.make(url, micro=False).svg_data_uri()

class RoomCardView(DetailView):
    # vanilla Django DetailView
    model = Location
    template_name = 'roomcard.html'
    slug_url_kwarg = 'code'
    slug_field = 'code'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['qr_svg_uri'] = make_qr_code(self.get_object().code)
        return context

# class CustomWeasyTemplateResponse(WeasyTemplateResponse):
#     # customized response class to change the default URL fetcher
#     def get_url_fetcher(self):
#         # disable host and certificate check
#         context = ssl.create_default_context()
#         context.check_hostname = False
#         context.verify_mode = ssl.CERT_NONE
#         return functools.partial(django_url_fetcher, ssl_context=context)

class MyModelPrintView(WeasyTemplateResponseMixin, RoomCardView):
    # output of MyModelView rendered as PDF with hardcoded CSS
    # pdf_stylesheets = [
    #     settings.STATIC_ROOT + '/tracking/css/room-card.css',
    # ]
    # show pdf in-line (default: True, show download dialog)
    pdf_attachment = False
    # custom response class to configure url-fetcher
    # response_class = CustomWeasyTemplateResponse

class MyModelDownloadView(WeasyTemplateResponseMixin, RoomCardView):
    # suggested filename (is required for attachment/download!)
    pdf_filename = 'foo.pdf'

class MyModelImageView(WeasyTemplateResponseMixin, RoomCardView):
    # generate a PNG image instead
    content_type = CONTENT_TYPE_PNG

    # dynamically generate filename
    def get_pdf_filename(self):
        return 'foo-{at}.pdf'.format(
            at=timezone.now().strftime('%Y%m%d-%H%M'),
        )



# class RoomCardView(PDFTemplateView):
#     model = Location
#     template_name = "roomcard.html"
#     filename = None
#     title = "Test"
#
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         context['object'] = self.model.objects.get(code=kwargs['code'])
#         return context