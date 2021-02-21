from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.crypto import get_random_string
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
#from checkin.resources.models import Resource
# import for backwards compatibility:
from checkin.tracking.models import Profile


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """
        Create and save a user with the given username, email, and password.
        """
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    # removing things we don't need
    username = None
    #first_name = None # usually blank=True
    #last_name = None # usually blank=True
    email = models.EmailField(_('email address'), unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    # def _get_username_val(self):
    #     return getattr(self, self.USERNAME_FIELD)
    #
    # def _set_username_val(self, value):
    #     return setattr(self, self.USERNAME_FIELD, value)
    #
    # username = property(_get_username_val, _set_username_val)

    # ical_token = models.SlugField(
    #     max_length=16, null=True, blank=True, unique=True, db_index=True, verbose_name="iCal token"
    # )
    # preferred_language = models.CharField(max_length=8, null=True, blank=True,
    #                                       verbose_name="Preferred UI language",
    #                                       choices=settings.LANGUAGES)
    # favorite_resources = models.ManyToManyField(Resource, blank=True, verbose_name=_('Favorite resources'),
    #                                             related_name='favorited_by')

    # Duplicate the is staff field from the abstract base class to here
    # so that we can override the verbose name and help text.
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_(
            "Designates whether the user can log into "
            "Django Admin or Respa Admin sites."))

    is_general_admin = models.BooleanField(
        default=False, verbose_name=_("general administrator status"),
        help_text=_(
            "Designates whether the user is a General Administrator "
            "with special permissions to many objects within Respa. "
            "This is almost as powerful as superuser."))

    class Meta(AbstractUser.Meta):
        ordering = ('id',)

    def get_display_name(self):
        if self.first_name or self.last_name:
            return '{0} {1}'.format(self.first_name, self.last_name).strip()
        else:
            return self.email

    def get_email_notation(self):
        name_part = '{0} {1}'.format(self.first_name, self.last_name).strip()
        address_part = self.email
        return '{0} <{1}>'.format(name_part, address_part).strip()

    def __str__(self):
        return self.get_email_notation()

    # def save(self, *args, **kwargs):
    #     # update email on Person as well.
    #     # FIXME we could do this with loose coupling through signals.
    #     from .persons import Person
    #     if hasattr(self, 'person') and isinstance(self.person, Person):
    #         self.person.email = self.email
    #         self.person.save()
    #
    #     return super().save(*args, **kwargs)

    # def get_or_create_ical_token(self, recreate=False):
    #     if not self.ical_token or recreate:
    #         self.ical_token = get_random_string(length=16)
    #         self.save()
    #     return self.ical_token
    #
    # def get_preferred_language(self):
    #     if not self.preferred_language:
    #         return settings.LANGUAGES[0][0]
    #     else:
    #         return self.preferred_language
