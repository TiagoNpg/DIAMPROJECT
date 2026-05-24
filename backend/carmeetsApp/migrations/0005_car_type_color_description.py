from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('carmeetsApp', '0004_event_type_alter_car_id_alter_comment_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='car',
            name='type',
            field=models.CharField(
                choices=[('Car', 'Car'), ('Moto', 'Moto')],
                default='Car',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='car',
            name='color',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='car',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='car',
            name='year',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
