# Generated by Django 3.1.7 on 2021-02-23 19:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0008_transfer_profile_to_users_app'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='roombookingrequest',
            name='timerange',
        ),
    ]
