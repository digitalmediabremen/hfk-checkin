# Generated by Django 3.1.2 on 2020-10-28 16:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0030_auto_20201023_1438'),
    ]

    operations = [
        migrations.AlterField(
            model_name='checkin',
            name='origin_entered',
            field=models.CharField(blank=True, choices=[('QR_SCAN', 'Scan eines QR-Codes'), ('USER_MANUAL', 'Manuelle Eingabe durch Nutzer'), ('ADMIN_MANUAL', 'Manuelle Eingabe durch Betreiber'), ('FOREIGN_SCAN', 'Scan eines QR-Codes durch andere Person'), ('PARENT_CHECKIN', 'Checkin durch untergeordnetes Objekt'), ('PARENT_CHECKOUT', 'Checkout durch übergeordnetes Objekt'), ('IMPORT', 'Import')], max_length=100, null=True, verbose_name='Datenquelle Checkin'),
        ),
        migrations.AlterField(
            model_name='checkin',
            name='origin_left',
            field=models.CharField(blank=True, choices=[('QR_SCAN', 'Scan eines QR-Codes'), ('USER_MANUAL', 'Manuelle Eingabe durch Nutzer'), ('ADMIN_MANUAL', 'Manuelle Eingabe durch Betreiber'), ('FOREIGN_SCAN', 'Scan eines QR-Codes durch andere Person'), ('PARENT_CHECKIN', 'Checkin durch untergeordnetes Objekt'), ('PARENT_CHECKOUT', 'Checkout durch übergeordnetes Objekt'), ('IMPORT', 'Import')], max_length=100, null=True, verbose_name='Datenquelle Checkout'),
        ),
        migrations.AddConstraint(
            model_name='checkin',
            constraint=models.CheckConstraint(check=models.Q(('origin_entered__in', ['QR_SCAN', 'USER_MANUAL', 'ADMIN_MANUAL', 'FOREIGN_SCAN', 'PARENT_CHECKIN', 'PARENT_CHECKOUT', 'IMPORT']), ('origin_left__in', ['QR_SCAN', 'USER_MANUAL', 'ADMIN_MANUAL', 'FOREIGN_SCAN', 'PARENT_CHECKIN', 'PARENT_CHECKOUT', 'IMPORT'])), name='tracking_checkin_origins_valid'),
        ),
    ]
