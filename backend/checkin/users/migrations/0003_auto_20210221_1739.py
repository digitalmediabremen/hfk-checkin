# Generated by Django 3.1.5 on 2021-02-21 16:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_rename_user_table'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={'ordering': ('id',), 'verbose_name': 'user', 'verbose_name_plural': 'users'},
        ),
        migrations.AddField(
            model_name='user',
            name='is_general_admin',
            field=models.BooleanField(default=False, help_text='Designates whether the user is a General Administrator with special permissions to many objects within Respa. This is almost as powerful as superuser.', verbose_name='general administrator status'),
        ),
        migrations.AlterField(
            model_name='user',
            name='is_staff',
            field=models.BooleanField(default=False, help_text='Designates whether the user can log into Django Admin or Respa Admin sites.', verbose_name='staff status'),
        ),
    ]
