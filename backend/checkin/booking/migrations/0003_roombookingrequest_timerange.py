# Generated by Django 3.1.5 on 2021-01-26 16:01

import django.contrib.postgres.fields.ranges
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0002_auto_20210126_1635'),
    ]

    operations = [
        migrations.AddField(
            model_name='roombookingrequest',
            name='timerange',
            field=django.contrib.postgres.fields.ranges.DateTimeRangeField(blank=True, null=True, verbose_name='Zeitraum'),
        ),
    ]
