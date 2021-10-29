from guardian.models import UserObjectPermissionAbstract, GroupObjectPermissionAbstract
from django.db import models
from django.utils.translation import gettext as _

class TimeEnabledAbstract(models.Model):
    created_at = models.DateTimeField(verbose_name=_('Time of creation'), auto_now_add=True, editable=False)
    modified_at = models.DateTimeField(verbose_name=_('Time of modification'), auto_now=True, editable=False)
    synced_at = models.DateTimeField(verbose_name=_('Time of sync'), editable=False, null=True, blank=True)

    class Meta:
        abstract = True


class TimeEnabledUserObjectPermission(TimeEnabledAbstract, UserObjectPermissionAbstract):
    pass


class TimeEnabledGroupObjectPermission(TimeEnabledAbstract, GroupObjectPermissionAbstract):
    pass
