# Generated by Django 3.1.7 on 2021-03-27 13:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_auto_20210326_1529'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='disable_notifications',
            field=models.BooleanField(default=False, verbose_name='Do not send email notifciations to this user'),
        ),
    ]
