# Generated by Django 3.1.7 on 2021-03-18 12:59

from decimal import Decimal
from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0004_auto_20210317_1540'),
    ]

    operations = [
        migrations.DeleteModel(
            name='resourcegroup',
        ),
        migrations.CreateModel(
            name='ResourceGroup',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False,
                                          verbose_name='UUID')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False,
                                                    verbose_name='Time of creation')),
                ('modified_at', models.DateTimeField(default=django.utils.timezone.now, editable=False,
                                                     verbose_name='Time of modification')),
                ('name', models.CharField(max_length=200, verbose_name='Name')),
                ('name_de', models.CharField(max_length=200, null=True, verbose_name='Name')),
                ('name_en', models.CharField(max_length=200, null=True, verbose_name='Name')),
                ('created_by',
                 models.ForeignKey(blank=True, editable=False, null=True, on_delete=django.db.models.deletion.SET_NULL,
                                   related_name='resourcegroup_created', to=settings.AUTH_USER_MODEL,
                                   verbose_name='Created by')),
                ('modified_by',
                 models.ForeignKey(blank=True, editable=False, null=True, on_delete=django.db.models.deletion.SET_NULL,
                                   related_name='resourcegroup_modified', to=settings.AUTH_USER_MODEL,
                                   verbose_name='Modified by')),
                ('resources', models.ManyToManyField(blank=True, related_name='groups', to='resources.Resource',
                                                     verbose_name='Resources')),
            ],
            options={
                'verbose_name': 'Resource group',
                'verbose_name_plural': 'Resource groups',
                'ordering': ('name',),
                'permissions': [],
            },
        ),
    ]
