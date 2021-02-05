# Generated by Django 3.1.5 on 2021-02-02 13:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0039_papercheckin_paperlog'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='papercheckin',
            options={'ordering': ('pk',), 'verbose_name': 'Aufenthalt (per Papierprotokoll)', 'verbose_name_plural': 'Aufenthalte (per Papierprotokoll)'},
        ),
        migrations.AlterModelOptions(
            name='paperlog',
            options={'verbose_name': 'Papierprotokoll', 'verbose_name_plural': 'Papierprotokolle'},
        ),
        migrations.AlterField(
            model_name='paperlog',
            name='comment',
            field=models.TextField(blank=True, help_text='Nutzen die dieses Feld für alle weiteren Bemerkugen zum vorliegenden Papierprotokoll oder zu Ihrer Eingabe.', null=True, verbose_name='Eingabekommentar'),
        ),
    ]