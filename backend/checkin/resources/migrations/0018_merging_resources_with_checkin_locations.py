# Generated by Django 3.1.7 on 2021-03-03 18:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0016_checkin_attendance'),
        ('resources', '0017_auto_20210303_1813'),
    ]

    operations = [
        migrations.DeleteModel(
            name='AttendanceCheckin',
        ),
        migrations.AlterModelOptions(
            name='checkinattendance',
            options={'verbose_name': 'Registration'},
        ),
    ]
