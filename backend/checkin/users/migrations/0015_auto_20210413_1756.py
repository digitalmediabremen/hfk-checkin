# Generated by Django 3.1.7 on 2021-04-13 15:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_auto_20210327_2031'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='profile',
            options={'permissions': [('can_view_any_user', 'Can view any user or userprofile'), ('can_lookup_any_user', 'Can lookup any user'), ('can_view_external_users', 'Can view external users'), ('can_view_regular_users', 'Can view non-external users'), ('can_view_unverified_users', 'Can view unverified users'), ('can_view_real_names', 'Can display full names'), ('can_view_full_email', 'Can display full e-mail addresses'), ('can_view_full_phone_number', 'Can display full phone numbers'), ('can_view_student_number', 'Can display student numbers')], 'verbose_name': 'Userprofile', 'verbose_name_plural': 'Userprofiles'},
        ),
        migrations.AlterField(
            model_name='historicalprofile',
            name='user',
            field=models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to=settings.AUTH_USER_MODEL, verbose_name='User'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='user',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='User'),
        ),
    ]
