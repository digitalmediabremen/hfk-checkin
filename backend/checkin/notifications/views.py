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


class TemplatePreviewView(View):

    def get(self, request, *args, **kwargs):
        #t = SendTestEmailCommand.get_template_object()
        # context = {
        #     'title': "This is a test notification.",
        #     'subtitle': "Hello World!",
        #     'message': "If you receive this message your settings might be correct.",
        #     'subject': "Test Notification from management command",
        # }
        template_id = request.GET.get('template', default=NotificationEmailTemplate.objects.last().pk)
        context = SendTestEmailCommand.get_context()
        tt = NotificationEmailTemplate.objects.get(pk=template_id)
        #tt = get_email_template(tt.name)
        email = Email(template=tt, context=context)
        # message = message.email_message()
        # print(message)
        engine = get_template_engine()
        subject = engine.from_string(email.template.subject).render(context)
        context['subject'] = subject
        html_message = engine.from_string(email.template.html_content).render(context)
        return HttpResponse(content=html_message)