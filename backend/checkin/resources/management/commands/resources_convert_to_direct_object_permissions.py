# -*- coding: utf-8 -*-
from optparse import make_option
from django.core.management.base import BaseCommand, CommandError

from checkin.tracking.legacy import Location
from checkin.tracking.models import Location as CheckinLocation
from checkin.resources.models import Resource, Unit, ResourceGroup
from checkin.resources.models.objectpermissions import (
    TimeEnabledResourceUserObjectPermission, TimeEnabledResourceGroupObjectPermission,
    TimeEnabledUnitGroupObjectPermission, TimeEnabledUnitUserObjectPermission,
)
from guardian.shortcuts import get_user_obj_perms_model, get_group_obj_perms_model
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict

FIELDS_TO_TRANSFER_USER = ('created_at', 'modified_at', 'synced_at', 'permission', 'user')
FIELDS_TO_TRANSFER_GROUP = ('created_at', 'modified_at', 'synced_at', 'permission', 'group')

CONVERSION_TYPES = [
    # (Model, (legacy) GenericPermsModel, (new) DirectPermsModel, transfer_fields
    (Resource, get_user_obj_perms_model(), TimeEnabledResourceUserObjectPermission, FIELDS_TO_TRANSFER_USER),
    (Resource, get_group_obj_perms_model(), TimeEnabledResourceGroupObjectPermission, FIELDS_TO_TRANSFER_GROUP),
    (Unit, get_user_obj_perms_model(), TimeEnabledUnitUserObjectPermission, FIELDS_TO_TRANSFER_USER),
    (Unit, get_group_obj_perms_model(), TimeEnabledUnitGroupObjectPermission, FIELDS_TO_TRANSFER_GROUP),
]


def generate_direct_permission_dict(generic_permission_instance, transfer_fields, using='default'):
    gp = generic_permission_instance
    d = {}
    for field in transfer_fields:
        d[field] = getattr(gp, field)
    d['content_object_id'] = gp.object_pk
    return d

def convert_type(model, generic_model, direct_model, transfer_fields, out_method=print, using='default', no_input=False):
    ct = ContentType.objects.get_for_model(model)
    qs = generic_model.objects.filter(content_type=ct)
    created_count = 0
    deleted_count = 0

    if qs.exists():
        count = qs.count()
    else:
        out_method('No permissions found.')
        return

    if no_input:
        pass
    else:
        confirm = input("You are about to convert %i permissions \nof generic type:\n%s\ninto direct permissions of type: \n%s\n for model of type: \n%s\nin your database. Proceed? (Y/n) " %
                        (count, generic_model, direct_model, model))
        while 1:
            if confirm not in ('Y', 'n', 'yes', 'no'):
                confirm = input('Please enter either "yes" or "no": ')
                continue
            if confirm in ('Y', 'yes'):
                break
            else:
                out_method('Aborted.')
                return

    for instance in qs:
        dp_dict = generate_direct_permission_dict(instance, transfer_fields, using)
        out_method("DEBUG: ")
        out_method(dp_dict)
        direct_model.objects.create(**dp_dict)
        created_count += 1
        instance.delete()
        deleted_count += 1

    out_method('Successfully converted %i permissions. %d directs were created, %d generics were deleted.' % (count, created_count, deleted_count))
    return created_count, deleted_count

def convert_all(out_method=print, using='default', no_input=False):
    out_method("Starting to convert all defined types.")

    for type_dict in CONVERSION_TYPES:
        convert_type(type_dict[0], type_dict[1], type_dict[2], type_dict[3], out_method, using, no_input)

    out_method("Finished converting all types.")


class Command(BaseCommand):
    help = "Migrate all generic object permissions to Resource and Unit direct object permissions. " \
    "See: https://django-guardian.readthedocs.io/en/stable/userguide/performance.html#direct-foreign-keys"

    importer_types = ['resources']

    def add_arguments(self, parser):
        parser.add_argument('--no-input', action="store_true", help='Skip confirmation.')

    def handle(self, *args, **options):
        self.stdout.write(self.help)
        convert_all(out_method=self.stdout.write, no_input=options['no_input'])
