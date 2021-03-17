# Generated by Django 3.1.7 on 2021-03-17 14:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0004_auto_20210317_1540'),
        ('tracking', '0056_migration_to_v2'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='_name',
            field=models.CharField(help_text='Used if not attached to resource.', max_length=255, verbose_name='Title'),
        ),
        migrations.AlterField(
            model_name='location',
            name='_number',
            field=models.CharField(blank=True, help_text='Used if not attached to resource.', max_length=24, verbose_name='Subtitle / No.'),
        ),
        migrations.AlterField(
            model_name='location',
            name='resource',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='checkinlocation', to='resources.resource', verbose_name='Resource'),
        ),
    ]
