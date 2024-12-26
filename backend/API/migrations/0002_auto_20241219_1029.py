# Generated by Django 3.2.25 on 2024-12-19 10:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='userprofile',
            old_name='losses',
            new_name='consecutiveWins',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='win_streak',
        ),
        migrations.AddField(
            model_name='userprofile',
            name='fastVictory',
            field=models.DurationField(blank=True, null=True),
        ),
    ]
