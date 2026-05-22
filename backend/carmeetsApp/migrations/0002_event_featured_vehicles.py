from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('carmeetsApp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='featured_vehicles',
            field=models.ManyToManyField(blank=True, related_name='featured_in_events', to='carmeetsApp.car'),
        ),
    ]
