# Generated by Django 3.1.7 on 2021-02-26 22:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0009_auto_20210226_2228'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='resource',
            options={'ordering': ('unit', 'name'), 'permissions': [('resource:can_make_reservations', 'Can make reservations'), ('resource:can_modify_access', 'Can give access'), ('resource:can_modify_reservations', 'Can modify reservations'), ('resource:has_permanent_access', 'Has permanent access'), ('resource:can_view_reservation_user', 'Can view reservation user'), ('resource:can_bypass_manual_confirmation', 'Can bypass manual confirmation requirement for resources'), ('resource:can_create_overlapping_reservations', 'Can create overlapping reservations'), ('resource:can_ignore_max_reservations_per_user', 'Can ignore resources max reservations per user rule'), ('resource:can_ignore_max_period', 'Can ignore resources max period rule')], 'verbose_name': 'Space', 'verbose_name_plural': 'Spaces'},
        ),
    ]
