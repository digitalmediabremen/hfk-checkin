# Generated by Django 3.1.2 on 2020-10-13 11:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0014_auto_20201013_1337'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activityprofile',
            name='distance_rule',
            field=models.CharField(blank=True, default='1,5m', max_length=50, null=True, verbose_name='Mindestabstand'),
        ),
        migrations.AlterField(
            model_name='activityprofile',
            name='other_rules',
            field=models.TextField(blank=True, null=True, verbose_name='Regeln, Sonstige Maßnahmen'),
        ),
    ]