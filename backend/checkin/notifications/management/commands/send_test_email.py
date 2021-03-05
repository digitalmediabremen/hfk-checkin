from django.core.management.base import BaseCommand, CommandError
from post_office import mail
from post_office.models import EmailTemplate
from checkin.notifications.models import NotificationEmailTemplate
from django.core.mail import send_mail
from django import template
from datetime import datetime

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
            'reservation': {
                "url": "https://hfk-getin-backend-staging.herokuapp.com/api/reservation/ea83532f-730e-42cb-b672-334f8f57c67b/",
                "uuid": "ea83532f-730e-42cb-b672-334f8f57c67b",
                "identifier": "EA83532",
                "resource": {
                    "url": "https://hfk-getin-backend-staging.herokuapp.com/api/space/a8be03f3-11ee-4f11-83ce-104b87cad6c3/",
                    "uuid": "a8be03f3-11ee-4f11-83ce-104b87cad6c3",
                    "name": "Glasurlabor",
                    "alternative_names": None,
                    "numbers": [
                        "1.16.030"
                    ],
                    "display_name": "Glasurlabor (1.16.030)",
                    "display_numbers": "1.16.030",
                    "unit": {
                        "url": "https://hfk-getin-backend-staging.herokuapp.com/api/building/6ffd5e37-69cf-4c50-8348-1af73bd0fdac/",
                        "uuid": "6ffd5e37-69cf-4c50-8348-1af73bd0fdac",
                        "name": "Dechanatstraße",
                        "slug": "DE",
                        "description": None,
                        "time_zone": "Europe/Berlin",
                        "created_at": "2021-02-21T19:52:58.153000+01:00",
                        "modified_at": "2021-02-21T19:52:58.153000+01:00"
                    },
                    "type": None,
                    "floor_number": None,
                    "floor_name": None,
                    "area": None,
                    "description": None,
                    "capacity": None,
                    "min_period": "00:30:00",
                    "max_period": None,
                    "slot_size": "00:30:00",
                    "max_reservations_per_user": None,
                    "reservable_max_days_in_advance": None,
                    "reservable_min_days_in_advance": None,
                    "external_reservation_url": None,
                    "access_restricted": False,
                    "access_allowed_to_current_user": True,
                    "created_at": "2021-02-25T20:38:12.628926+01:00",
                    "modified_at": "2021-02-25T20:38:12.628946+01:00"
                },
                "resource_uuid": "a8be03f3-11ee-4f11-83ce-104b87cad6c3",
                "begin": datetime(2021,2,27,10,0,0),
                "end": datetime(2021,2,27,21,0,0),
                "message": "Hallo! Ich würde gerne das Glasurlabor buchen. Danke!",
                "purpose": "Prüfungsvorbereitung",
                "is_own": True,
                "state": "requested",
                "state_verbose": "Reservation EA83532 has now state requested.",
                "need_manual_confirmation": True,
                "attendees": [
                    {
                        "uuid": "361c5b94-8ada-408a-bac5-d469b9a7f0d1",
                        "profile_id": 521,
                        "first_name": "Leonard",
                        "last_name": "Puhl",
                        "display_name": "Leonard Puhl",
                        "state": None,
                        "is_external": False
                    }
                ],
                "number_of_attendees": 1,
                "number_of_extra_attendees": 0,
                "has_priority": False,
                "agreed_to_phone_contact": False,
                "exclusive_resource_usage": False,
                "created_at": "2021-02-27T21:08:53.222571+01:00",
                "modified_at": "2021-02-27T21:08:53.222626+01:00"
            }
        }
        return context

    @classmethod
    def get_template_object(cls):
        return NotificationEmailTemplate.objects.get(name='test_notification')

    def handle(self, *args, **options):

        sender = '"Glasurlabor (1.16.030)" <noreply@checkin.hfk-bremen.de>'
        recipients = [options['recipient']]

        mail.send(
            recipients,
            sender,
            priority = 'now',
            template=self.get_template_object(),
            context=self.get_context()
        )