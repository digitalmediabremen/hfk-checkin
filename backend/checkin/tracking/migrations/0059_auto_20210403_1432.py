# Generated by Django 3.1.7 on 2021-04-03 12:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0058_auto_20210326_1529'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='removed',
            field=models.BooleanField(default=False, help_text='Diese Checkin-Standort ist deaktiviert oder entfernt. Eine Löschung ist jedoch noch nicht möglich, weil noch Checkins am Raum hängen. (Soft-Delete)', verbose_name='Entfernt'),
        ),
    ]