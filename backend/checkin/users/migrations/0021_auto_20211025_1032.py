# Generated by Django 3.1.12 on 2021-10-25 08:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0020_change_permission_meta'),
    ]

    operations = [
        migrations.CreateModel(
            name='Keycard',
            fields=[
            ],
            options={
                'verbose_name': 'Keycard',
                'verbose_name_plural': 'Keycards',
                'proxy': True,
                'default_permissions': ('view', 'change'),
                'indexes': [],
                'constraints': [],
            },
            bases=('users.profile',),
        ),
        migrations.AlterField(
            model_name='historicalprofile',
            name='keycard_requested_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Keycard requested date'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='keycard_requested_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Keycard requested date'),
        ),
    ]
