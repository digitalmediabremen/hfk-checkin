from django.views.generic.detail import SingleObjectMixin, DetailView
from wkhtmltopdf.views import PDFTemplateView

from .models import Location

class RoomCardView(PDFTemplateView):
    model = Location
    template_name = "roomcard.html"
    filename = None
    title = "Test"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object'] = self.model.objects.get(pk=kwargs['pk'])
        return context