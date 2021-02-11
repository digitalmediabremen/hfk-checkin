# Generated by Django 3.1.5 on 2021-02-11 14:03

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0037_auto_20210110_1534'),
        ('booking', '0004_auto_20210126_2237'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReservationAttendance',
            fields=[
            ],
            options={
                'verbose_name': 'Teilnahmelisten und -berechtigungen',
                'verbose_name_plural': 'Teilnahmelisten und -berechtigungen zu Buchungen',
                'managed': False,
                'proxy': True,
            },
            bases=('booking.roombookingrequest',),
        ),
        migrations.CreateModel(
            name='GuestInRoomBooking',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reason', models.CharField(blank=True, max_length=1000, null=True, verbose_name='Grund')),
                ('is_external', models.BooleanField(blank=True, null=True, verbose_name='HfK-Extern')),
            ],
            options={
                'verbose_name': 'Teilnehmedender an Raumnutzung',
                'verbose_name_plural': 'Teilnehmedende an Raumnutzung',
            },
        ),
        migrations.DeleteModel(
            name='RoomAccess',
        ),
        migrations.RemoveField(
            model_name='room',
            name='delegates',
        ),
        migrations.AddField(
            model_name='room',
            name='access_delegates',
            field=models.ManyToManyField(blank=True, default=True, related_name='access_delegate_for_room', to='tracking.Profile', verbose_name='Raumverantwortliche'),
        ),
        migrations.AddField(
            model_name='room',
            name='booking_delegates',
            field=models.ManyToManyField(blank=True, default=True, related_name='booking_delegate_for_room', to='tracking.Profile', verbose_name='Buchungsverantwortliche'),
        ),
        migrations.AddField(
            model_name='roombookingrequest',
            name='created_at',
            field=models.DateTimeField(auto_now=True, verbose_name='Letzte Änderung'),
        ),
        migrations.AddField(
            model_name='roombookingrequest',
            name='exclusive_room_usage',
            field=models.BooleanField(blank=True, null=True, verbose_name='Exklusive Raumnutzung'),
        ),
        migrations.AddField(
            model_name='roombookingrequest',
            name='number_of_guests',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Erwartete Personenanzahl'),
        ),
        migrations.AddField(
            model_name='roombookingrequest',
            name='organizer_not_attending',
            field=models.BooleanField(blank=True, null=True, verbose_name='Anfragender nimmt selbst nicht teil'),
        ),
        migrations.AddField(
            model_name='roombookingrequest',
            name='status',
            field=models.CharField(choices=[('REQUEST', 'Offene Anfrage'), ('ACCEPT', 'Gebucht'), ('DECLINED', 'Abgelehnt'), ('WAITING_FOR_APPROVAL', 'Wartet auf Genehmigung'), ('Storniert', 'Storniert'), ('Geändert', 'Geändert (macht keinen Sinn)'), ('INVITE', 'Einladung (unserseits) an Nutzer'), ('OTHER', 'Sonstiges')], default='REQUEST', max_length=20, verbose_name='Status'),
        ),
        migrations.AddField(
            model_name='roombookingrequest',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, verbose_name='Letzte Änderung'),
        ),
        migrations.CreateModel(
            name='RoomAccess',
            fields=[
            ],
            options={
                'verbose_name': 'Zugangsberechtigungen',
                'verbose_name_plural': 'Zugangsberechtigungen zu Räumen',
                'managed': False,
                'proxy': True,
            },
            bases=('booking.room',),
        ),
        migrations.AddField(
            model_name='guestinroombooking',
            name='bookingrequest',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='booking.roombookingrequest'),
        ),
        migrations.AddField(
            model_name='guestinroombooking',
            name='profile',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='tracking.profile'),
        ),
    ]
