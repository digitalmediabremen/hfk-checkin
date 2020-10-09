# Generated by Django 3.1.2 on 2020-10-08 22:59

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tracking', '0003_profile_last_checkin'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='authenticated',
            field=models.BooleanField(blank=True, editable=False, null=True, verbose_name='Identität geprüft'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='last_checkin',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Zuletzt Eingecheckt'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='phone',
            field=models.CharField(blank=True, max_length=17, validators=[django.core.validators.RegexValidator(message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.", regex='^\\+?1?\\d{9,15}$')], verbose_name='Telefonnummer'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='user',
            field=models.OneToOneField(blank=True, editable=False, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
