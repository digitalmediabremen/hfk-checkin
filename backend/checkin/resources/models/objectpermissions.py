from django.db import models
from .resource import Resource
from .unit import Unit
from guardian.models import UserObjectPermissionBase, GroupObjectPermissionBase
from checkin.users.models.permissions import TimeEnabledAbstract
from django.utils.translation import gettext as _


class TimeEnabledResourceUserObjectPermission(TimeEnabledAbstract, UserObjectPermissionBase):
    content_object = models.ForeignKey(Resource, on_delete=models.CASCADE)
    synced_at = models.DateTimeField(verbose_name=_('Time of sync'), editable=False, null=True, blank=True)
    enabled = True


class TimeEnabledResourceGroupObjectPermission(TimeEnabledAbstract, GroupObjectPermissionBase):
    content_object = models.ForeignKey(Resource, on_delete=models.CASCADE)
    synced_at = models.DateTimeField(verbose_name=_('Time of sync'), editable=False, null=True, blank=True)
    enabled = True


class TimeEnabledUnitUserObjectPermission(TimeEnabledAbstract, UserObjectPermissionBase):
    content_object = models.ForeignKey(Unit, on_delete=models.CASCADE)
    synced_at = models.DateTimeField(verbose_name=_('Time of sync'), editable=False, null=True, blank=True)
    enabled = True


class TimeEnabledUnitGroupObjectPermission(TimeEnabledAbstract, GroupObjectPermissionBase):
    content_object = models.ForeignKey(Unit, on_delete=models.CASCADE)
    synced_at = models.DateTimeField(verbose_name=_('Time of sync'), editable=False, null=True, blank=True)
    enabled = True