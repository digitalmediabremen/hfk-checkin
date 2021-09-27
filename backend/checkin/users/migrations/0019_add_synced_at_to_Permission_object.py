# Generated by Django 3.1.13 on 2021-09-20 16:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0018_add_keycards_to_Profile_and_Permission'),
    ]

    operations = [
        migrations.AddField(
            model_name='timeenabledgroupobjectpermission',
            name='synced_at',
            field=models.DateTimeField(blank=True, editable=False, null=True, verbose_name='Time of sync'),
        ),
        migrations.AddField(
            model_name='timeenableduserobjectpermission',
            name='synced_at',
            field=models.DateTimeField(blank=True, editable=False, null=True, verbose_name='Time of sync'),
        ),
    ]