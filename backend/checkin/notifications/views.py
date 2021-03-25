from __future__ import unicode_literals
from django.views.generic.base import ContextMixin, TemplateResponseMixin, TemplateView
from django.views import View
from django.utils import timezone
from checkin.notifications.models import NotificationEmailTemplate
from django.http import HttpResponse
from django.template import loader
from .management.commands.send_test_email import Command as SendTestEmailCommand
from post_office.utils import get_email_template
from post_office.models import Email, get_template_engine, EmailTemplate
from django.conf import settings
from django.http import Http404
from django.utils import translation
from django.template import RequestContext, Template
from .context_processors import email_notifications as email_notifications_processor

class TemplatePreviewView(View):

    def get(self, request, *args, **kwargs):
        #t = SendTestEmailCommand.get_template_object()
        # context = {
        #     'title': "This is a test notification.",
        #     'subtitle': "Hello World!",
        #     'message': "If you receive this message your settings might be correct.",
        #     'subject': "Test Notification from management command",
        # }
        template_id = kwargs.get('object_id')
        language = request.GET.get('language', default=settings.LANGUAGE_CODE)
        if language not in [l[0] for l in settings.LANGUAGES]:
            raise Http404("Language '%s' not in settings.LANGUAGES." % language)
        context = RequestContext(request, SendTestEmailCommand.get_context(), processors=[
            email_notifications_processor,
        ])
        # EmailTemplate != NotificationEmailTemplate
        tt = EmailTemplate.objects.get(default_template_id=template_id, language=language)
        #tt = get_email_template(tt.name)
        email = Email(template=tt, context=context)
        # message = message.email_message()
        translation.activate(language)
        engine = get_template_engine()
        subject = Template(email.template.subject).render(context)
        context['subject'] = subject
        html_message = Template(email.template.html_content).render(context)
        translation.deactivate()
        return HttpResponse(content=html_message)