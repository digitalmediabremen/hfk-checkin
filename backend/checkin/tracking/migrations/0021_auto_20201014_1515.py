# Generated by Django 3.1.2 on 2020-10-14 13:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0020_auto_20201013_2111'),
    ]

    operations = [
        migrations.RenameField(
            model_name='activityprofile',
            old_name='distance_rule',
            new_name='distance_rule_de',
        ),
        migrations.RenameField(
            model_name='activityprofile',
            old_name='name',
            new_name='name_de',
        ),
        migrations.RenameField(
            model_name='activityprofile',
            old_name='other_rules',
            new_name='other_rules_de',
        ),
        migrations.RemoveField(
            model_name='activityprofile',
            name='description',
        ),
        migrations.AddField(
            model_name='activityprofile',
            name='description_de',
            field=models.TextField(default='no translation', verbose_name='Beschreibung DE'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='activityprofile',
            name='description_en',
            field=models.TextField(default='no translation', verbose_name='Beschreibung EN'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='activityprofile',
            name='distance_rule_en',
            field=models.CharField(blank=True, default='1,5 m', max_length=50, null=True, verbose_name='Mindestabstand'),
        ),
        migrations.AddField(
            model_name='activityprofile',
            name='name_en',
            field=models.CharField(default='no translation', max_length=255, verbose_name='Bezeichnung'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='activityprofile',
            name='other_rules_en',
            field=models.TextField(blank=True, null=True, verbose_name='Regeln, Sonstige Maßnahmen'),
        ),
    ]
