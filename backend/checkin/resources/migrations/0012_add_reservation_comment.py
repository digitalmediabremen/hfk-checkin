# Generated by Django 3.1.7 on 2021-03-23 11:28

import django.contrib.auth.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_auto_20210315_1803'),
        ('resources', '0011_auto_20210322_2119'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reservation',
            name='comment',
            field=models.TextField(blank=True, help_text='For internal use only. Shall not be displayed to users.', null=True, verbose_name='Comment'),
        ),
    ]