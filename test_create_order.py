#!/usr/bin/env python
"""
Test the create_order endpoint with correct parameters
"""

import os
import sys
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.test import RequestFactory
from apps.products.api_views import create_order

factory = RequestFactory()

print("Testing POST /api/payment/create-order/ with correct parameters...")
print()

# Try with correct parameters
request = factory.post(
    '/api/payment/create-order/',
    data=json.dumps({
        'amount': 1000,
        'currency': 'INR',
        'receipt': 'order_123',
        'email': 'test@example.com',
        'items': []
    }),
    content_type='application/json'
)

response = create_order(request)
data = json.loads(response.content)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(data, indent=2)}")

if response.status_code == 200 and data.get('success'):
    print("\n✅ ENDPOINT WORKS CORRECTLY")
    print("   The endpoint expects: amount, currency, receipt, email, items")
    print("   The test sent these correct parameters")
else:
    print("\n⚠️  Status is not 200 success")
