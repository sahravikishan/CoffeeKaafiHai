from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('products', '0002_add_order_snapshot_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='order_name',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='order',
            name='order_email',
            field=models.EmailField(blank=True, default='', max_length=254),
        ),
        migrations.AddField(
            model_name='order',
            name='order_phone',
            field=models.CharField(blank=True, default='', max_length=32),
        ),
        migrations.AddField(
            model_name='order',
            name='order_address',
            field=models.TextField(blank=True, default=''),
        ),
    ]
