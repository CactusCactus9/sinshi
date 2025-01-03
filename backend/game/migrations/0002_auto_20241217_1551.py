# Generated by Django 3.2.25 on 2024-12-17 15:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='end_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='game',
            name='game_duration',
            field=models.DurationField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='game',
            name='player1_level',
            field=models.FloatField(default=1.0),
        ),
        migrations.AddField(
            model_name='game',
            name='player2_level',
            field=models.FloatField(default=1.0),
        ),
        migrations.AddField(
            model_name='game',
            name='start_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='game',
            name='status',
            field=models.CharField(choices=[('Pending', 'Pending'), ('active', 'Active'), ('completed', 'Completed')], default='Pending', max_length=10),
        ),
    ]
