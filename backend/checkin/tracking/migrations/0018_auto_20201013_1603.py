# Generated by Django 3.1.2 on 2020-10-13 14:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0017_auto_20201013_1559'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='bookingmethod',
            options={'verbose_name': 'Buchungsmethode', 'verbose_name_plural': 'Buchungsmethoden'},
        ),
        migrations.AlterModelOptions(
            name='locationusage',
            options={'verbose_name': 'Raumnutzungsart', 'verbose_name_plural': 'Raumnutzungsarten'},
        ),
        migrations.RenameField(
            model_name='bookingmethod',
            old_name='title',
            new_name='name',
        ),
        migrations.RenameField(
            model_name='locationusage',
            old_name='title',
            new_name='name',
        ),
    ]
