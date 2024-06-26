# Generated by Django 3.1.7 on 2021-03-18 13:05

from decimal import Decimal
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0005_reset_resourcegroups'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='resourcecapacitypolicy',
            options={'verbose_name': 'Capacity policy for resources', 'verbose_name_plural': 'Capacity policies for resources'},
        ),
        migrations.AlterField(
            model_name='reservation',
            name='state',
            field=models.CharField(choices=[('created', 'newly created'), ('requested', 'requested'), ('confirmed', 'confirmed'), ('denied', 'denied'), ('cancelled', 'cancelled')], default='created', max_length=32, verbose_name='State'),
        ),
        migrations.AlterField(
            model_name='resource',
            name='area',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='in Quadratmetern', max_digits=8, null=True, validators=[django.core.validators.MinValueValidator(Decimal('0.01'))], verbose_name='Area (m²)'),
        ),
        migrations.AlterField(
            model_name='resource',
            name='external_reservation_url',
            field=models.URLField(blank=True, help_text='A link to an external reservation system if this resource is managed elsewhere. Can not be combined with reservable.', null=True, verbose_name='External reservation URL'),
        ),
        migrations.AlterField(
            model_name='resource',
            name='people_capacity_calculation_type',
            field=models.CharField(choices=[('None', 'Default without policies'), ('Min', 'Minimum according to policies'), ('Max', 'Maximum according to policies')], default='Min', max_length=20, verbose_name='Capacity calculation'),
        ),
        migrations.AlterField(
            model_name='resource',
            name='reservable',
            field=models.BooleanField(default=True, verbose_name='Reservable'),
        ),
        migrations.AlterField(
            model_name='resource',
            name='reservation_info',
            field=models.TextField(blank=True, help_text='For internal use only. Shall not be displayed to users.', null=True, verbose_name='Instructions / Comments'),
        ),
    ]
