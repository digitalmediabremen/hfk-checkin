from django.db import models
from django.db.models.constants import LOOKUP_SEP
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.crypto import get_random_string
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import RegexValidator
from simple_history.models import HistoricalRecords
from django.contrib.postgres.search import SearchVector
from dirtyfields import DirtyFieldsMixin

# set to anonyoumous user
# def get_sentinel_user():
#     return get_user_model().objects.get_or_create(username='deleted')[0]
#
# class MyModel(models.Model):
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.SET(get_sentinel_user),
#     )


class Q(models.Q):
    """
    A custom Q implementation that allows prefixing existing Q objects with some
    related field name dynamically.
    """

    def prefix(self, prefix):
        """Recursively copies the Q object, prefixing all lookup keys.

        The prefix and the existing filter key are delimited by the lookup separator __.
        Use this feature to delegate existing query constraints to a related field.
        """
        return type(self)(
            *(
                child.prefix(prefix)
                if isinstance(child, Q)
                else (prefix + LOOKUP_SEP + child[0], child[1])
                for child in self.children
            ),
            _connector=self.connector,
            _negated=self.negated,
        )


class NonAnonyoumusUserQuerySetMixin():
    def exclude_anonymous_users(self):
        return self.filter(id__gte=0)


class UserQuerySet(models.QuerySet):
    def exclude_anonymous_users(self):
        return self.filter(id__gte=0)

    def filter_for_user(self, user, force_any=False):
        qs = self
        if force_any or user.is_superuser or user.has_perm('users.can_view_any_user'):
            return qs
        # exclude non-profile users for non-admin users
        qs = qs.exclude(profile__isnull=True)
        if user.has_perm('users.can_lookup_any_user'):
            return qs

        filter = ProfileQuerySet.generate_profile_Q_filter_for_user(user, Q()).prefix('profile')
        if not filter:
            # Q() is empty
            return qs.none()
        # apply filters
        return qs.filter(filter)


class UserManager(BaseUserManager.from_queryset(UserQuerySet)):
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
    '''
    User model swapped in for auth.User.
    Holds django-typical is_admin, is_staff (via AbstractBaseUser), permissions (via PermissionMixin) as well
    application-specific preferences and app-wide properties (is_external, is_verified) related to `profile`.
    Personal information (falling under GDPR regulation) are modeled as
    UserProfile with a OneToOne Relation to User.

    Using `email` instead of `username` (as USERNAME_FILED).
    Has no first_name or last_name field.
    (Still) uses IDs as PKs. TODO Replace with UUIDs?
    '''
    #first_name = None # usually blank=True
    #last_name = None # usually blank=True
    email = models.EmailField(_('email address'), unique=True)
    #username = email # FIXME needed for microsoft_auth.admin.UserAdmin

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

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
    preferred_language = models.CharField(max_length=8, null=True, blank=True,
                                          verbose_name="Preferred UI language",
                                          choices=settings.LANGUAGES)
    disable_notifications = models.BooleanField(verbose_name=_("Do not send email notifciations to this user"), default=False)
    # favorite_resources = models.ManyToManyField(Resource, blank=True, verbose_name=_('Favorite resources'),
    #                                             related_name='favorited_by')
    #
    # # Duplicate the is staff field from the abstract base class to here
    # # so that we can override the verbose name and help text.
    # is_staff = models.BooleanField(
    #     _("staff status"),
    #     default=False,
    #     help_text=_(
    #         "Designates whether the user can log into "
    #         "Django Admin or Respa Admin sites."))
    #
    # is_general_admin = models.BooleanField(
    #     default=False, verbose_name=_("general administrator status"),
    #     help_text=_(
    #         "Designates whether the user is a General Administrator "
    #         "with special permissions to many objects within Respa. "
    #         "This is almost as powerful as superuser."))

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

    @property
    def is_verified(self):
        if hasattr(self, 'profile'):
            return self.profile.verified
        else:
            return True

    @property
    def is_external(self):
        if hasattr(self, 'profile'):
            return self.profile.is_external
        else:
            return False

    def __str__(self):
        if not hasattr(self, 'profile') or not self.profile:
            return '{0} <{1}>'.format(self.pk, getattr(self, self.USERNAME_FIELD)).strip()
        return self.profile.__str__()

    @property
    def username(self):
        return self.email

    @username.setter
    def username(self, value):
        pass

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

    def get_preferred_language(self):
        if not self.preferred_language:
            return settings.LANGUAGES[0][0]
        return self.preferred_language


class ProfileQuerySet(NonAnonyoumusUserQuerySetMixin, models.QuerySet):

    def annotate_search(self):
        qs = self.annotate(search=SearchVector('first_name', 'last_name','email','student_number','phone'))
        return qs

    @staticmethod
    def generate_profile_Q_filter_for_user(user, q):
        filter = q # start q
        if user.has_perm('users.can_view_external_users'):
            filter |= Q(is_external=True) | Q(is_external__isnull=True)
        if user.has_perm('users.can_view_regular_users'):
            filter |= Q(is_external=False) | Q(is_external__isnull=True)
        if user.has_perm('users.can_view_unverified_users'):
            filter |= Q(verified=False) | Q(verified__isnull=True)
        return filter

    def filter_for_user(self, user, force_any=False):
        qs = self
        if force_any or user.is_superuser or user.has_perm('users.can_view_any_user'):
            return qs
        filter = Q()
        filter = self.generate_profile_Q_filter_for_user(user, filter)
        if not filter:
            # Q() is empty
            return qs.none()
        # apply filters
        return qs.filter(filter)


class ProfileManager(models.Manager.from_queryset(ProfileQuerySet)):
    pass


class Profile(DirtyFieldsMixin, models.Model):
    '''
    UserProfile models all user-related information, that hold personal data.
    These profiles might be subject to GDPR deletion policies.

    Profiles are a core part of the `tracking` applications and are used to trace possible contacts.
    '''
    user = models.OneToOneField(settings.AUTH_USER_MODEL, verbose_name=_("User"), on_delete=models.CASCADE, blank=True, null=True)
    first_name = models.CharField(_("Vorname"), max_length=1000)
    last_name = models.CharField(_("Nachname"), max_length=1000)
    phone_regex = RegexValidator(regex=r'^\+?1?[\d ()]{9,15}$',
                                 message=_("Die Telefonnummer benötigt das Format +(XX) XXXXXXXXXXX."))
    phone = models.CharField(_("Telefonnummer"), validators=[phone_regex], max_length=20, blank=True, null=True) # validators should be a list
    email = models.EmailField(_("E-Mail Adresse"), blank=True, null=True)
    verified = models.BooleanField(_("Identität geprüft"),blank=True, null=True, default=True)
    student_number = models.CharField(_("Matrikelnummer"), max_length=20, blank=True, null=True)
    is_external = models.BooleanField(_("External"),blank=True, null=True, default=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False, verbose_name=_("Letzte Änderung"))
    created_at = models.DateTimeField(auto_now_add=True, editable=False, verbose_name=_("Registrierung"))
    # last_checkin = models.DateTimeField(_("Zuletzt Eingecheckt"), blank=True, null=True)
    history = HistoricalRecords()

    objects = ProfileManager()

    def __str__(self):
        return self.get_display_name()
        # return _("Person mit Profil-ID %i") % (self.id, )

    def get_display_name(self):
        name = self.get_email_notation()
        if self.is_external:
            name = _("%s (External)") % name
        if not self.verified:
            name = _("%s (Unverified)") % name
        return name

    def get_email_notation(self):
        name_part = '{0} {1}'.format(self.first_name, self.last_name).strip()
        if self.email:
            address_part = self.email
            return '{0} <{1}>'.format(name_part, address_part).strip()
        return name_part

    def get_full_name(self):
        return _("%s %s") % (self.first_name, self.last_name)

    def get_full_profile(self):
        return _("%s %s (P: %s / E: %s)") % (self.first_name, self.last_name, self.phone, self.email)

    @property
    def complete(self):
        return (bool(self.first_name) and bool(self.last_name) and bool(self.phone))

    class Meta:
        verbose_name = _("Userprofile")
        verbose_name_plural = _("Userprofiles")
        permissions = [
            ("can_view_any_user", _("Can view any user or userprofile")), # applies to ProfileQuerySet
            ("can_lookup_any_user", _("Can lookup any user")), # applies to UserQuerySet, used for autocomplete lookup
            ("can_view_external_users", _("Can view external users")),
            ("can_view_regular_users", _("Can view non-external users")),
            ("can_view_unverified_users", _("Can view unverified users")),
            ("can_view_real_names", _("Can display full names")),
            ("can_view_full_email", _("Can display full e-mail addresses")),
            ("can_view_full_phone_number", _("Can display full phone numbers")),
            ("can_view_student_number", _("Can display student numbers")),
        ]

    @property
    def last_checkins(self):
        if 'checkin.tracking' in settings.INSTALLED_APPS:
            from checkin.tracking.models import Checkin
            return Checkin.objects.filter(profile=self)[:10]
        return []

@receiver(post_save, sender=Profile)
def create_user(sender, instance, created, **kwargs):
    """ Update user on every save or if profile is created."""
    # if created:
    if not instance.email:
        return
    user, new = User.objects.get_or_create(profile=instance)
    user.first_name = instance.first_name
    user.last_name = instance.last_name
    user.email = instance.email
    user.save()
    # do not forget to update the relation (do not use save(), otherwise this will loop infinitely)
    Profile.objects.filter(pk=instance.pk).update(user=user)

# @receiver(post_save, sender=User)
# def create_profile(sender, instance, created, **kwargs):
#     """ Update profile on every save or if user is created."""
#     # if created:
#     if not instance.first_name or not instance.last_name or not instance.email:
#         return
#     profile, new = Profile.objects.get_or_create(user=instance)
#     profile.first_name = instance.first_name
#     profile.last_name = instance.last_name
#     profile.email = instance.email
#     profile.save()

from guardian.models import UserObjectPermissionAbstract, GroupObjectPermissionAbstract

class TimeEnabledAbstract(models.Model):
    created_at = models.DateTimeField(verbose_name=_('Time of creation'), auto_now_add=True, editable=False)
    modified_at = models.DateTimeField(verbose_name=_('Time of modification'), auto_now=True, editable=False)

    class Meta:
        abstract = True


class TimeEnabledUserObjectPermission(TimeEnabledAbstract, UserObjectPermissionAbstract):
    pass


class TimeEnabledGroupObjectPermission(TimeEnabledAbstract, GroupObjectPermissionAbstract):
    pass