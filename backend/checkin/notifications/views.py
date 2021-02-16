from __future__ import unicode_literals
from django.views.generic.base import ContextMixin, TemplateResponseMixin, TemplateView
from django.views import View
from django.utils import timezone

class PreviewView(TemplateView):
    template_name = 'notifications/email_base.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return {
            'name': 'alice',
            'title': "Anfrage eingegangen.",
            'subject': "Test",
            'body': "Hi liebes Raumteam, ich habe am 30.01.2021 meine Prüfung und würde gerne den Raum schon ab dem 27.01. buchen, um aufzubauen. Den 31. Brauche ich dann zum Abbauen. Es kommen außerdem zwei Fotograf*innen, die meine Präsentation filmen und fotografieren. Ich hoffe, dass alles klappt und freu mich auf eure Rückmeldung.  ",
            'button_label': 'Buchungsanfrage öffnen',
            'button_link': 'http://',
        }
        #return context