# Generated by Django 3.1.7 on 2021-02-27 19:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0016_checkin_attendance'),
        ('tracking', '0051_transfer_profile_to_users_app'),
    ]

    operations = [
        migrations.AddField(
            model_name='checkin',
            name='attendance',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='resources.attendance'),
        ),
    ]
