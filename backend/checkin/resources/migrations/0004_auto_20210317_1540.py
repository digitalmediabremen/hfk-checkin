# Generated by Django 3.1.7 on 2021-03-17 14:40

from django.db import migrations, models
import django_better_admin_arrayfield.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0003_all_apps_v2'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='checkinattendance',
            options={'verbose_name': 'Attendance registration', 'verbose_name_plural': 'Attendance registrations'},
        ),
        migrations.AlterModelOptions(
            name='resourcecapacitypolicy',
            options={'verbose_name': 'Capacity policies for resources'},
        ),
        migrations.AlterField(
            model_name='resource',
            name='floor_number',
            field=models.IntegerField(blank=True, help_text='-1: Basement, 0: Ground Floor, 1: First Floor', null=True, verbose_name='Floor number'),
        ),
        migrations.AlterField(
            model_name='resource',
            name='numbers',
            field=django_better_admin_arrayfield.models.fields.ArrayField(base_field=models.CharField(max_length=24), blank=True, help_text='Speicher XI: X.XX.XXX / Dechanatstraße: X.XX(x)', null=True, size=None, verbose_name='Room number(s)'),
        ),
    ]
