from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.crypto import get_random_string
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import RegexValidator
from simple_history.models import HistoricalRecords


# set to anonyoumous user
# def get_sentinel_user():
#     return get_user_model().objects.get_or_create(username='deleted')[0]
#
# class MyModel(models.Model):
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.SET(get_sentinel_user),
#     )


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



class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, editable=False)
    first_name = models.CharField(_("Vorname"), max_length=1000)
    last_name = models.CharField(_("Nachname"), max_length=1000)
    phone_regex = RegexValidator(regex=r'^\+?1?[\d ()]{9,15}$',
                                 message=_("Die Telefonnummer benötigt das Format +(XX) XXXXXXXXXXX."))
    phone = models.CharField(_("Telefonnummer"), validators=[phone_regex], max_length=20, blank=True, null=True) # validators should be a list
    email = models.EmailField(_("E-Mail Adresse"), blank=True, null=True)
    verified = models.BooleanField(_("Identität geprüft"),blank=True, null=True, default=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))
    created_at = models.DateTimeField(auto_now_add=True, editable=False, verbose_name=_("Registrierung"))
    # last_checkin = models.DateTimeField(_("Zuletzt Eingecheckt"), blank=True, null=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.get_full_name()
        # return _("Person mit Profil-ID %i") % (self.id, )

    def get_full_name(self):
        return _("%s %s") % (self.first_name, self.last_name)

    def get_full_profile(self):
        return _("%s %s (P: %s / E: %s)") % (self.first_name, self.last_name, self.phone, self.email)

    @property
    def complete(self):
        return (bool(self.first_name) and bool(self.last_name) and bool(self.phone))

    class Meta:
        verbose_name = _("Person")
        verbose_name_plural = _("Personen")
        db_table = 'tracking.profile'
        permissions = [
            ("can_view_all_users", _("Kann alle Personen anzeigen")),
            ("can_view_real_names", _("Kann Klarnamen anzeigen")),
            ("can_view_full_email", _("Kann vollständige E-Mail-Adresse anzeigen")),
            ("can_view_full_phone_number", _("Kann vollständige Telefonnummer anzeigen")),
        ]

    @property
    def last_checkins(self):
        if 'checkin.tracking' in settings.INSTALLED_APPS:
            from checkin.tracking.models import Checkin
            return Checkin.objects.filter(profile=self)[:10]
        return []


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    """ Update profile on every save or if user is created."""
    # if created:
    if not instance.first_name or not instance.last_name or not instance.email:
        return
    profile, new = Profile.objects.get_or_create(user=instance)
    profile.first_name = instance.first_name
    profile.last_name = instance.last_name
    profile.email = instance.email
    profile.verified = True
    profile.save()