from django.core.management.base import BaseCommand, CommandError
from post_office import mail
from post_office.models import EmailTemplate
from checkin.notifications.models import NotificationEmailTemplate
from django.core.mail import send_mail
from django import template

class Command(BaseCommand):
    help = 'Send test Email notification.'

    def add_arguments(self, parser):
        parser.add_argument('-r', '--recipient', type=str, required=True, help='Address of recipient.')

    @classmethod
    def get_context(cls):
        context = {
            'title': "This is a test notification.",
            'subtitle': "Hello World!",
            'message': "If you receive this message your settings might be correct.",
            'subject': "Test Notification from management command",
        }
        return context

    @classmethod
    def get_template_object(cls):
        return NotificationEmailTemplate.objects.get(name='test_notification')

    def handle(self, *args, **options):

        sender = 'from@example.com'
        recipients = [options['recipient']]

        mail.send(
            recipients,
            sender,
            priority = 'now',
            template=self.get_template_object(),
            context=self.get_context()
        )