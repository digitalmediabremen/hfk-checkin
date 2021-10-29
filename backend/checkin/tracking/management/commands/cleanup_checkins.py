# TODO: command to remove old (3 weeks old) checkins for data protection
from datetime import timedelta
from django.core.management.base import BaseCommand, CommandError
from checkin.tracking.models import Checkin, CHECKIN_RETENTION_TIME, Profile, PaperLog
from django.conf import settings
from django.contrib.auth import get_user_model

USER_MODEL = get_user_model()
ANONYMOUS_USER_NAME = getattr(settings, 'ANONYMOUS_USER_NAME', "AnonymousUser")
ANONYMOUS_USER_PK = getattr(settings, 'ANONYMOUS_USER_PK', -1)


def get_anonymous_user():
    """
    Create or get the anonymous user using USER_MODEL.
    According to settings.ANONYMOUS_USER_NAME default to "AnonymousUser".

    :return: User (or custom UserModel)
    """
    anonymous_user = {
        USER_MODEL.USERNAME_FIELD: ANONYMOUS_USER_NAME,
        'pk': ANONYMOUS_USER_PK,
    }
    try:
        return USER_MODEL.objects.get(pk=ANONYMOUS_USER_PK)
    except USER_MODEL.DoesNotExist:
        return USER_MODEL.objects.get_or_create(**anonymous_user)


def get_anonymous_profile():
    """
    Create or get the anonymous profile.

    :return: Profile
    """
    user = get_anonymous_user()
    anonymous_profile = {
        'user': user,
        'first_name': 'Anonymous',
        'last_name': 'Profile',
        'id': ANONYMOUS_USER_PK,
    }
    try:
        return Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        return Profile.objects.create(**anonymous_profile)


# class MyModel(models.Model):
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.SET(get_sentinel_user),
#     )


class Command(BaseCommand):
    help = 'Clean up recorded checkins and paper logs from DB older then CHECKIN_RETENTION_TIME %s' % CHECKIN_RETENTION_TIME

    def add_arguments(self, parser):
        parser.add_argument('--no-input', action="store_true", help='Skip confirmation.')

    def handle(self, *args, **options):
        self.stdout.write(self.help)

        self.anonymize_checkin_objects(*args, **options)
        self.delete_paperlog_objects(*args, **options)

    def anonymize_checkin_objects(self, *args, **options):
        # anonymize Checkin objects

        # self.stdout.write('CHECKIN_RETENTION_TIME: %s' % CHECKIN_RETENTION_TIME)
        qs = Checkin.all.older_then(CHECKIN_RETENTION_TIME)
        update_kwargs = {
            'profile': get_anonymous_profile(),
        }
        qs = qs.exclude(**update_kwargs)

        if qs.exists():
            count = qs.count()
        else:
            self.stdout.write('No objects found.')
            return

        if options['no_input']:
            pass
        else:
            confirm = input('You are about to anonymize %i checkin records from your database. Proceed? (Y/n) ' % count)
            while 1:
                if confirm not in ('Y', 'n', 'yes', 'no'):
                    confirm = input('Please enter either "yes" or "no": ')
                    continue
                if confirm in ('Y', 'yes'):
                    break
                else:
                    self.stdout.write('Aborted.')
                    return

        row_num = qs.update(**update_kwargs)
        self.stdout.write('Successfully anonymized %i objects.' % row_num)

    def delete_paperlog_objects(self, *args, **options):
        # delete PaperLog objects (!)

        qs = PaperLog.all.older_then(CHECKIN_RETENTION_TIME)

        if qs.exists():
            count = qs.count()
        else:
            self.stdout.write('No objects found.')
            return

        if options['no_input']:
            pass
        else:
            confirm = input('You are about to permanently delete %i paperlog records from your database. Proceed? (Y/n) ' % count)
            while 1:
                if confirm not in ('Y', 'n', 'yes', 'no'):
                    confirm = input('Please enter either "yes" or "no": ')
                    continue
                if confirm in ('Y', 'yes'):
                    break
                else:
                    self.stdout.write('Aborted.')
                    return

        row_num, deleted_dict = qs.delete()
        self.stdout.write('Successfully deleted %i objects.' % row_num)

