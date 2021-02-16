# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-11-18 10:17
from __future__ import unicode_literals

import django.contrib.postgres.fields.ranges
from django.db import migrations, models
import django.db.models.deletion
import resources.models.gistindex


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0062_add_reservation_origin_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='ResourceDailyOpeningHours',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('open_between', django.contrib.postgres.fields.ranges.DateTimeRangeField()),
                ('resource', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='opening_hours', to='resources.Resource')),
            ],
        ),
        migrations.RemoveField(
            model_name='period',
            name='duration',
        ),
        migrations.AddIndex(
            model_name='resourcedailyopeninghours',
            index=resources.models.gistindex.GistIndex(fields=['open_between'], name='resources_r_open_be_1b6956_gist'),
        ),
        migrations.AlterUniqueTogether(
            name='resourcedailyopeninghours',
            unique_together=set([('resource', 'open_between')]),
        ),
    ]
