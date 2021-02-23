# Generated by Django 3.1.7 on 2021-02-23 19:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_transfer_profile_to_users_app'),
        ('booking', '0007_roombookingrequest_attendees'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterField(
                    model_name='attendance',
                    name='person',
                    field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.profile'),
                ),
                migrations.AlterField(
                    model_name='guestinroombooking',
                    name='profile',
                    field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='users.profile'),
                ),
                migrations.AlterField(
                    model_name='room',
                    name='access_allowd_to',
                    field=models.ManyToManyField(related_name='allowed_to_book_in', through='booking.RoomAccessPolicy', to='users.Profile', verbose_name='Zugangsberechtigt'),
                ),
                migrations.AlterField(
                    model_name='room',
                    name='access_delegates',
                    field=models.ManyToManyField(blank=True, default=True, related_name='access_delegate_for_room', to='users.Profile', verbose_name='Raumverantwortliche'),
                ),
                migrations.AlterField(
                    model_name='room',
                    name='booking_delegates',
                    field=models.ManyToManyField(blank=True, default=True, related_name='booking_delegate_for_room', to='users.Profile', verbose_name='Buchungsverantwortliche'),
                ),
                migrations.AlterField(
                    model_name='roomaccesspolicy',
                    name='person',
                    field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.profile'),
                ),
                migrations.AlterField(
                    model_name='roombookingrequest',
                    name='attendees',
                    field=models.ManyToManyField(blank=True, related_name='guest_in_booking', through='booking.GuestInRoomBooking', to='users.Profile', verbose_name='Teilnehmer'),
                ),
                migrations.AlterField(
                    model_name='roombookingrequest',
                    name='is_important',
                    field=models.BooleanField(blank=True, help_text='Nur mit Begründung. (Siehe Kommentar.) z.B. Prüfungen, Ausnahmeregelungen, Verasnstaltungen etc. ', verbose_name='Prioritär'),
                ),
                migrations.AlterField(
                    model_name='roombookingrequest',
                    name='organizer',
                    field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='users.profile', verbose_name='Anfragender'),
                ),
            ],
            # Table already exists. checkin/tracking/migrations/0038_transfer_profile_to_users_app.py
            database_operations=[],
        )
    ]
