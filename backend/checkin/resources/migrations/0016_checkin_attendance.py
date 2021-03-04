# Generated by Django 3.1.7 on 2021-02-27 19:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0051_transfer_profile_to_users_app'),
        ('users', '0010_auto_20210227_0101'),
        ('resources', '0015_auto_20210227_2059'),
    ]

    operations = [
        migrations.CreateModel(
            name='AttendanceCheckin',
            fields=[
            ],
            options={
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('tracking.checkin',),
        ),
        migrations.CreateModel(
            name='CheckinAttendance',
            fields=[
            ],
            options={
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('resources.attendance',),
        ),
        migrations.AlterField(
            model_name='attendance',
            name='reservation',
            field=models.ForeignKey(editable=False, on_delete=django.db.models.deletion.CASCADE, to='resources.reservation', verbose_name='Reservation'),
        ),
        migrations.AlterUniqueTogether(
            name='attendance',
            unique_together={('reservation', 'user')},
        ),
        migrations.AlterModelOptions(
            name='checkinattendance',
            options={'verbose_name': 'Attendance for recording'},
        ),
    ]
