# Generated by Django 3.1.7 on 2021-02-27 14:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0011_auto_20210227_0031'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservation',
            name='purpose',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Purpose'),
        ),
    ]