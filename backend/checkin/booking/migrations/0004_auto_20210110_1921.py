# Generated by Django 3.1.5 on 2021-01-10 18:21

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0037_auto_20210110_1534'),
        ('booking', '0003_roombookingrequest_uuid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='roombookingrequest',
            name='agreed_to_phone_contact',
            field=models.BooleanField(blank=True, null=True, verbose_name='Telefonkontakt zugestimmt'),
        ),
        migrations.AlterField(
            model_name='roombookingrequest',
            name='guests',
            field=models.ManyToManyField(blank=True, related_name='guest_in_booking', to='tracking.Profile', verbose_name='Zusätzliche Personen'),
        ),
        migrations.AlterField(
            model_name='roombookingrequest',
            name='uuid',
            field=models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, verbose_name='UUID'),
        ),
    ]
