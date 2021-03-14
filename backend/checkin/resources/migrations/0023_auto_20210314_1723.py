# Generated by Django 3.1.7 on 2021-03-14 16:23

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('resources', '0022_auto_20210313_0335'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='checkinattendance',
            options={'verbose_name': 'Attendance registration'},
        ),
        migrations.AddField(
            model_name='resource',
            name='people_capacity_calculation_type',
            field=models.CharField(choices=[('None', 'Default'), ('Min', 'Minimum'), ('Max', 'Maximum')], default='Min', max_length=20, verbose_name='Capacity calculation'),
        ),
        migrations.CreateModel(
            name='ResourceCapacityPolicy',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, verbose_name='UUID')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Time of creation')),
                ('modified_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Time of modification')),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('value', models.PositiveIntegerField(verbose_name='Value')),
                ('type', models.CharField(choices=[('ABS', 'Absolute value')], default='ABS', max_length=20)),
                ('created_by', models.ForeignKey(blank=True, editable=False, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='resourcecapacitypolicy_created', to=settings.AUTH_USER_MODEL, verbose_name='Created by')),
                ('modified_by', models.ForeignKey(blank=True, editable=False, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='resourcecapacitypolicy_modified', to=settings.AUTH_USER_MODEL, verbose_name='Modified by')),
                ('resources', models.ManyToManyField(related_name='capacity_policies', to='resources.Resource')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
