# Generated by Django 3.1.7 on 2021-04-13 16:54

import django.contrib.postgres.fields.citext
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0015_auto_20210413_1756'),
    ]

    operations = [
        migrations.RunSQL('CREATE EXTENSION citext'),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=django.contrib.postgres.fields.citext.CIEmailField(max_length=254, unique=True, verbose_name='email address'),
        ),
    ]
