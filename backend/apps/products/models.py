from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    """Persistent user profile data stored in the database."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='profile',
        null=True,
        blank=True
    )
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True, default='')
    last_name = models.CharField(max_length=150, blank=True, default='')
    phone = models.CharField(max_length=32, blank=True, default='')
    address = models.TextField(blank=True, default='')
    coffee_preferences = models.JSONField(blank=True, default=dict)
    avatar = models.TextField(blank=True, default='')
    member_since = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_order_at = models.DateTimeField(null=True, blank=True)
    last_order_items = models.JSONField(blank=True, default=list)
    total_orders = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    loyalty_points = models.PositiveIntegerField(default=0)
    member_tier = models.CharField(max_length=32, default='Bronze')

    def __str__(self):
        return self.email


class Order(models.Model):
    """Persistent order data stored in the database."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='orders',
        null=True,
        blank=True
    )
    email = models.EmailField(db_index=True)
    # Snapshot fields captured at checkout time (one-way: profile -> checkout)
    # NOTE: Order fields are strictly separate from profile/user fields.
    order_name = models.CharField(max_length=200, blank=True, default='')
    order_email = models.EmailField(blank=True, default='')
    order_phone = models.CharField(max_length=32, blank=True, default='')
    order_address = models.TextField(blank=True, default='')
    # Legacy snapshot fields kept for backward compatibility (do not write from checkout)
    customer_name = models.CharField(max_length=200, blank=True, default='')
    customer_email = models.EmailField(blank=True, default='')
    customer_phone = models.CharField(max_length=32, blank=True, default='')
    customer_address = models.TextField(blank=True, default='')
    items = models.JSONField(default=list)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=32, default='pending', db_index=True)
    extra_fields = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.email} - {self.id}"


class Payment(models.Model):
    """Persistent payment data stored in the database."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='payments',
        null=True,
        blank=True
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        related_name='payments',
        null=True,
        blank=True
    )
    email = models.EmailField(db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    razorpay_order_id = models.CharField(max_length=128, blank=True, default='', db_index=True)
    razorpay_payment_id = models.CharField(max_length=128, blank=True, default='')
    razorpay_signature = models.CharField(max_length=256, blank=True, default='')
    status = models.CharField(max_length=32, default='pending', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)


class UserActivity(models.Model):
    """Persistent user activity history stored in the database."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='activities',
        null=True,
        blank=True
    )
    email = models.EmailField(db_index=True)
    action = models.CharField(max_length=128)
    metadata = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)


class Notification(models.Model):
    """Notification outbox for email/mobile delivery with per-user preferences."""
    CHANNEL_CHOICES = (
        ('email', 'Email'),
        ('mobile', 'Mobile'),
    )
    CATEGORY_CHOICES = (
        ('order', 'Order'),
        ('offer', 'Offer'),
        ('announcement', 'Announcement'),
    )
    STATUS_CHOICES = (
        ('queued', 'Queued'),
        ('sent', 'Sent'),
        ('skipped', 'Skipped'),
        ('failed', 'Failed'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='notifications',
        null=True,
        blank=True
    )
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=32, blank=True, default='')
    channel = models.CharField(max_length=16, choices=CHANNEL_CHOICES, db_index=True)
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, db_index=True)
    event = models.CharField(max_length=64, db_index=True)
    title = models.CharField(max_length=200, blank=True, default='')
    message = models.TextField(blank=True, default='')
    payload = models.JSONField(blank=True, default=dict)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='queued', db_index=True)
    status_reason = models.CharField(max_length=200, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    sent_at = models.DateTimeField(null=True, blank=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)


class PasswordResetOTP(models.Model):
    """One-time password for Django User password reset."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_reset_otps'
    )
    email = models.EmailField(db_index=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    expires_at = models.DateTimeField(db_index=True)
    is_used = models.BooleanField(default=False)
    attempts = models.PositiveSmallIntegerField(default=0)
    last_attempt_at = models.DateTimeField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.email} - {self.otp}"


class Feedback(models.Model):
    """Persistent customer feedback stored in the database."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='feedbacks',
        null=True,
        blank=True
    )
    email = models.EmailField(blank=True, default='', db_index=True)
    name = models.CharField(max_length=150, blank=True, default='')
    category = models.CharField(max_length=100, blank=True, default='')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
