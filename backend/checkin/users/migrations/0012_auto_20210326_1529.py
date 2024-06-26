# Generated by Django 3.1.7 on 2021-03-26 14:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_update_permissions'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='historicalprofile',
            options={'get_latest_by': 'history_date', 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'historical Userprofile'},
        ),
        migrations.AlterModelOptions(
            name='profile',
            options={'permissions': [('can_view_external_users', 'Can view external Users'), ('can_view_regular_users', 'Can view regular Users'), ('can_view_unverified_users', 'Can view unverified Users'), ('can_view_any_user', 'Can view unverified Users'), ('can_view_real_names', 'Can view full names'), ('can_view_full_email', 'Can view full e-mail addresses'), ('can_view_full_phone_number', 'Can view full phone numbers')], 'verbose_name': 'Userprofile', 'verbose_name_plural': 'Userprofiles'},
        ),
    ]
