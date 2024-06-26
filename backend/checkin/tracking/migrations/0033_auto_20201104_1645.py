# Generated by Django 3.1.2 on 2020-11-04 15:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0032_historicallocation'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicallocation',
            name='removed',
            field=models.BooleanField(default=False, help_text='Diese Raum ist deaktiviert oder entfernt. Eine Löschung ist jedoch noch nicht möglich, weil noch Checkins am Raum hängen. (Soft-Delete)', verbose_name='Entfernt'),
        ),
        migrations.AddField(
            model_name='location',
            name='removed',
            field=models.BooleanField(default=False, help_text='Diese Raum ist deaktiviert oder entfernt. Eine Löschung ist jedoch noch nicht möglich, weil noch Checkins am Raum hängen. (Soft-Delete)', verbose_name='Entfernt'),
        ),
    ]
