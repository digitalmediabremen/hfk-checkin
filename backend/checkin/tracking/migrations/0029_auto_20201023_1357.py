# Generated by Django 3.1.2 on 2020-10-23 11:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0028_historicalprofile'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='location',
            options={'permissions': [('can_print_location', 'Kann PDF-Raumausweise erstellen.'), ('can_display_location_loads', 'Kann aktuelle aktuelle Checkins anzeigen.')], 'verbose_name': 'Raum / Standort', 'verbose_name_plural': 'Räume / Standorte'},
        ),
    ]
