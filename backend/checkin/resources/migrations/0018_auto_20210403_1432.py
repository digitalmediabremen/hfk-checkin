# Generated by Django 3.1.7 on 2021-04-03 12:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0017_auto_20210327_1437'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='reservation',
            options={'ordering': ('begin', 'end'), 'permissions': (), 'verbose_name': 'Reservation', 'verbose_name_plural': 'Reservations'},
        ),
    ]
