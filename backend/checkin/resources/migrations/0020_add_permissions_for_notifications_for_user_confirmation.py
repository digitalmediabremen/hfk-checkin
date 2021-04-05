# Generated by Django 3.1.7 on 2021-04-03 12:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0019_add_permissions_for_notifications'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='unit',
            options={'ordering': ('name',), 'permissions': [('unit:can_modify_reservations', 'Can modify reservations'), ('unit:can_modify_access', 'Can modify access'), ('unit:can_modify_reservations_without_notifications', 'Can modify reservations, but do not notify or use as Reply-To'), ('unit:can_modify_access_without_notifications', 'Can modify access, but do not notify or use as Reply-To'), ('unit:notify_for_reservations', 'Receive notifications for reservation requests, but do not allow access to backend'), ('unit:notify_for_access', 'Receive notifications for access requests, but do not allow access to backend'), ('unit:can_confirm_users', 'Can confirm (external) users'), ('unit:can_confirm_users_without_notifications', 'Can confirm (external) users, but do not notify or use as Reply-To'), ('unit:notify_for_users', 'Receive notifications for user requests, but do not allow access to backend'), ('unit:view_resource', 'Can view Spaces within Unit'), ('unit:change_resource', 'Can change Spaces within Unit'), ('unit:delete_resource', 'Can delete Spaces within Unit'), ('unit:add_resource', 'Can add Spaces within Unit')], 'verbose_name': 'Building', 'verbose_name_plural': 'Buildings'},
        ),
    ]
