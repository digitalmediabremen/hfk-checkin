# Generated by Django 3.1.7 on 2021-03-25 23:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0014_add_reservationusergroup'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='attendance',
            options={'permissions': (('can_register_attendance', 'Can register attendances'),), 'verbose_name': 'Attendance', 'verbose_name_plural': 'Attendances'},
        ),
        migrations.AlterModelOptions(
            name='checkinattendance',
            options={'default_permissions': (), 'verbose_name': 'Attendance registration', 'verbose_name_plural': 'Attendance registrations'},
        ),
        migrations.AlterModelOptions(
            name='reservation',
            options={'ordering': ('begin', 'end'), 'permissions': (('skip_notification', 'Do not send notifications for reservations'),), 'verbose_name': 'Reservation', 'verbose_name_plural': 'Reservations'},
        ),
        migrations.AlterModelOptions(
            name='reservationattendance',
            options={'default_permissions': (), 'managed': False, 'verbose_name': 'Attendance list for reservation', 'verbose_name_plural': 'Attendance list for reservations'},
        ),
        migrations.AlterModelOptions(
            name='resourceaccess',
            options={'default_permissions': (), 'managed': False, 'verbose_name': 'Access Permissions', 'verbose_name_plural': 'Access Permissions for Spaces'},
        ),
        migrations.AlterModelOptions(
            name='unit',
            options={'ordering': ('name',), 'permissions': [('unit:can_modify_reservations', 'Can modify reservations'), ('unit:can_modify_access', 'Can modify access'), ('unit:can_confirm_users', 'Can confirm (external) users'), ('unit:view_resource', 'Can view Spaces within Unit'), ('unit:change_resource', 'Can change Spaces within Unit'), ('unit:delete_resource', 'Can delete Spaces within Unit'), ('unit:add_resource', 'Can add Spaces within Unit')], 'verbose_name': 'Building', 'verbose_name_plural': 'Buildings'},
        ),
    ]