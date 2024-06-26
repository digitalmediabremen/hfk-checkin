# Generated by Django 3.1.2 on 2020-10-10 03:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0010_auto_20201010_0423'),
    ]

    operations = [
        migrations.AlterField(
            model_name='checkin',
            name='location',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='tracking.location', verbose_name='Standort'),
        ),
        migrations.AlterField(
            model_name='checkin',
            name='origin',
            field=models.CharField(blank=True, choices=[('QR_SCAN', 'Scan eines QR-Codes'), ('USER_MANUAL', 'Manuelle Eingabe durch Nutzer'), ('ADMIN_MANUAL', 'Manuelle Eingabe durch Betreiber'), ('FOREIGN_SCAN', 'Scan eines QR-Codes durch andere Person'), ('PARENT_CHECKOUT', 'Checkout durch übergeordnetes Objekt'), ('IMPORT', 'Datenimport')], max_length=100, verbose_name='Datenquelle'),
        ),
        migrations.AlterField(
            model_name='checkin',
            name='profile',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='tracking.profile', verbose_name='Person'),
        ),
        migrations.AlterField(
            model_name='checkin',
            name='time_entered',
            field=models.DateTimeField(auto_now=True, verbose_name='Checkin'),
        ),
        migrations.AlterField(
            model_name='checkin',
            name='time_left',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Checkout'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='verified',
            field=models.BooleanField(blank=True, default=False, null=True, verbose_name='Identität geprüft'),
        ),
    ]
