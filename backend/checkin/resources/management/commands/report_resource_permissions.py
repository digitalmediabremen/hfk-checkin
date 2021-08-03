from django.core.management.base import BaseCommand, CommandError

from guardian.shortcuts import get_users_with_perms
from guardian.managers import UserObjectPermissionManager
from guardian.utils import get_user_obj_perms_model
from django.contrib.auth.models import Permission
from checkin.resources.models.resource import Resource

UserObjectPermission = get_user_obj_perms_model()
PERMISSION_CODENAME = "resource:has_permanent_access"

class Command(BaseCommand):
    help = ""

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        permission = Permission.objects.get(codename=PERMISSION_CODENAME)

        resources_with_access_restriction = Resource.objects.filter(access_restricted=True)
        print("Number of  resources with restricted access")
        print(resources_with_access_restriction.count())

        resources_with_permissions = UserObjectPermission.objects.filter(permission=permission).distinct("object_pk")
        print("Number of distinct resources with `%s`" % PERMISSION_CODENAME)
        print(resources_with_permissions.count())

        users_with_permission = UserObjectPermission.objects.filter(permission=permission).distinct("user")
        print("Number of users with `%s`" % PERMISSION_CODENAME)
        print(users_with_permission.count())

        assigned_permissions = UserObjectPermission.objects.filter(permission=permission)
        print("Number assigned permissions of type `%s`" % PERMISSION_CODENAME)
        print(assigned_permissions.count())