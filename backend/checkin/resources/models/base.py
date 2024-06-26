from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
import uuid
from .utils import generate_id
from post_office.models import Email

from checkin.users.models import Profile, User
PROFILE_MODEL = 'users.Profile'
AUTH_USER_MODEL = 'users.User'


class EmailRelatedMixin(models.Model):
    related_emails = models.ManyToManyField(Email, verbose_name=_('Related sent E-Mails'))
    class Meta:
        abstract = True


class UUIDModelMixin(models.Model):
    uuid = models.UUIDField(verbose_name='UUID', primary_key=True, default=uuid.uuid4, editable=False)

    @property
    def id(self):
        return self.uuid

    @property
    def short_uuid(self):
        return str(self.uuid)[:7].upper()
    short_uuid.fget.short_description = _("UUID")

    class Meta:
        abstract = True

class AutoIdentifiedModel(models.Model):

    def save(self, *args, **kwargs):
        pk_type = self._meta.pk.get_internal_type()
        if pk_type == 'CharField':
            if not self.pk:
                self.pk = generate_id()
        elif pk_type == 'AutoField':
            pass
        else:
            raise Exception('Unsupported primary key field: %s' % pk_type)
        super().save(*args, **kwargs)

    class Meta:
        abstract = True


class NameIdentifiedModel(models.Model):

    def save(self, *args, **kwargs):
        pk_type = self._meta.pk.get_internal_type()
        if pk_type == 'CharField':
            if not self.pk:
                if self.name_en:
                    self.pk = slugify(self.name_en)
                else:
                    self.pk = slugify(self.name_de)
        elif pk_type == 'AutoField':
            pass
        else:
            raise Exception('Unsupported primary key field: %s' % pk_type)
        super().save(*args, **kwargs)

    class Meta:
        abstract = True


class ModifiableModel(models.Model):
    """
    Abstract "Mixin" to generalize created_by/at and modified_by/at fields for many models.
    """
    created_at = models.DateTimeField(verbose_name=_('Time of creation'), auto_now_add=True, editable=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name=_('Created by'),
                                   null=True, blank=True, related_name="%(class)s_created",
                                   on_delete=models.SET_NULL, editable=False)
    modified_at = models.DateTimeField(verbose_name=_('Time of modification'), auto_now=True, editable=False)
    modified_by = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name=_('Modified by'),
                                    null=True, blank=True, related_name="%(class)s_modified",
                                    on_delete=models.SET_NULL, editable=False)

    class Meta:
        abstract = True
