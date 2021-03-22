from django.core.management.base import BaseCommand, CommandError
from post_office import mail
from post_office.models import EmailTemplate
from checkin.notifications.models import NotificationEmailTemplate
from django.core.mail import send_mail
from django import template
from datetime import datetime
from checkin.resources.models.reservation import Reservation
from checkin.resources.api.reservation import ReservationSerializer

class Command(BaseCommand):
    help = 'Send test Email notification.'

    def add_arguments(self, parser):
        parser.add_argument('-r', '--recipient', type=str, required=True, help='Address of recipient.')
        parser.add_argument('-t', '--template', type=str, default='test_notification', help='Name of the template to use.')
        parser.add_argument('-l', '--language', type=str, default='de', help='Language to use.')

    @classmethod
    def get_context(cls):
        context = {
            'title': "This is a test notification.",
            'subtitle': "Hello World!",
            'message': "If you receive this message your settings might be correct.",
            # 'subject': "Test Notification from management command",
            'reservation': Reservation.objects.last()
        }
        return context

    @classmethod
    #def get_template_object(cls, name='test_notification'):
    def get_template_object(cls, name='test_notification'):
        return NotificationEmailTemplate.objects.get(name=name)

    def handle(self, *args, **options):

        sender = '"Glasurlabor (1.16.030)" <noreply@checkin.hfk-bremen.de>'
        recipients = [options['recipient']]

        mail.send(
            recipients,
            sender,
            priority = 'now',
            template=self.get_template_object(options['template']),
            context=self.get_context(),
            language=options['language'],
            headers={
                'Sender': 'getin@hfk-bremen.de',
                'Reply-To': 'reply-to@hfk-bremen.de',
            }
        )