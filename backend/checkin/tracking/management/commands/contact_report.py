from django.core.management.base import BaseCommand, CommandError
from checkin.tracking.report import ContactReport

class Command(BaseCommand):
    help = '(COVID-infection test analysis) Return encounters of a (infected) person with other persons.'

    def add_arguments(self, parser):
        parser.add_argument('--profile', nargs=1, type=int, required=True, help='ID of infected profile.')
        parser.add_argument('--exclude-locations', nargs='+', type=int, help='ID(s) of locations to exclude.')
        parser.add_argument('--show-checkins', action="store_true", help='Output list of checkins by infected persons')
        parser.add_argument('--show-encounters', action="store_true", help='Output list of checkins with encountered persons')
        parser.add_argument('--show-personal-data', action="store_true", help='Output personal data: full name and contact info')

    def handle(self, *args, **options):
        report = ContactReport(profile_id=options['profile'][0], exclude_location_ids=options['exclude_locations'])
        report.set_output(self.stdout.write)
        report.report(options['show_checkins'], options['show_encounters'], options['show_personal_data'])