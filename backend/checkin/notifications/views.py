from __future__ import unicode_literals
from django.views.generic.base import ContextMixin, TemplateResponseMixin, TemplateView
from django.views import View
from django.utils import timezone
from checkin.notifications.models import NotificationEmailTemplate
from django.http import HttpResponse
from django.template import loader
from .management.commands.send_test_email import Command as SendTestEmailCommand
from post_office.utils import get_email_template
from post_office.models import Email, get_template_engine

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


class TemplatePreviewView(View):

    def get(self, request, *args, **kwargs):
        #t = SendTestEmailCommand.get_template_object()
        # context = {
        #     'title': "This is a test notification.",
        #     'subtitle': "Hello World!",
        #     'message': "If you receive this message your settings might be correct.",
        #     'subject': "Test Notification from management command",
        # }
        context = SendTestEmailCommand.get_context()
        tt = get_email_template('test_notification')
        email = Email(template=tt, context=context)
        # message = message.email_message()
        # print(message)
        engine = get_template_engine()
        html_message = engine.from_string(email.template.html_content).render(context)
        return HttpResponse(content=html_message)