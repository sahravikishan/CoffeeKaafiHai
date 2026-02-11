from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(db_index=True, max_length=254)),
                ('phone', models.CharField(blank=True, default='', max_length=32)),
                ('channel', models.CharField(choices=[('email', 'Email'), ('mobile', 'Mobile')], db_index=True, max_length=16)),
                ('category', models.CharField(choices=[('order', 'Order'), ('offer', 'Offer'), ('announcement', 'Announcement')], db_index=True, max_length=32)),
                ('event', models.CharField(db_index=True, max_length=64)),
                ('title', models.CharField(blank=True, default='', max_length=200)),
                ('message', models.TextField(blank=True, default='')),
                ('payload', models.JSONField(blank=True, default=dict)),
                ('status', models.CharField(choices=[('queued', 'Queued'), ('sent', 'Sent'), ('skipped', 'Skipped'), ('failed', 'Failed')], db_index=True, default='queued', max_length=16)),
                ('status_reason', models.CharField(blank=True, default='', max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('sent_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
