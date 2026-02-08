from django import forms
from .models import Order


class OrderForm(forms.ModelForm):
    """Order-only form to prevent any profile/user writes from checkout."""
    class Meta:
        model = Order
        fields = [
            'items',
            'total_amount',
            'status',
            'extra_fields',
            'order_name',
            'order_email',
            'order_phone',
            'order_address',
        ]
