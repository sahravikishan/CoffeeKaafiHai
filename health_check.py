#!/usr/bin/env python
"""
Quick Health Check - Run this to verify integration is working
"""

import os
import sys
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.test import RequestFactory
from apps.products import api_views
from database.mongo import get_database
from pymongo import MongoClient

factory = RequestFactory()

print("\n" + "=" * 70)
print("INTEGRATION HEALTH CHECK")
print("=" * 70)

results = []

# 1. MongoDB Connection
try:
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
    client.admin.command('ping')
    results.append(('MongoDB Connection', True))
    print("✅ MongoDB is running")
except:
    results.append(('MongoDB Connection', False))
    print("❌ MongoDB is not running")
    sys.exit(1)

# 2. Database Models Import
try:
    from database.models import User, OTP, Order, Payment
    results.append(('Database Models', True))
    print("✅ Database models import successfully")
except:
    results.append(('Database Models', False))
    print("❌ Database models failed to import")

# 3. Signup Endpoint
try:
    request = factory.post(
        '/api/auth/signup/',
        data=json.dumps({
            'firstName': 'Health',
            'lastName': 'Check',
            'email': 'healthcheck@test.com',
            'phone': '1111111111',
            'password': 'test123'
        }),
        content_type='application/json'
    )
    response = api_views.signup(request)
    status = response.status_code == 201
    results.append(('Signup Endpoint', status))
    print(f"{'✅' if status else '❌'} Signup endpoint (status {response.status_code})")
except Exception as e:
    results.append(('Signup Endpoint', False))
    print(f"❌ Signup endpoint error: {e}")

# 4. Login Endpoint
try:
    request = factory.post(
        '/api/auth/login/',
        data=json.dumps({
            'email': 'healthcheck@test.com',
            'password': 'test123'
        }),
        content_type='application/json'
    )
    response = api_views.login(request)
    status = response.status_code == 200
    results.append(('Login Endpoint', status))
    print(f"{'✅' if status else '❌'} Login endpoint (status {response.status_code})")
except Exception as e:
    results.append(('Login Endpoint', False))
    print(f"❌ Login endpoint error: {e}")

# 5. Frontend Integration
try:
    with open('frontend/pages/customer/signup.html', 'r') as f:
        html = f.read()
    has_script = 'auth-api-integration.js' in html
    has_csrf = 'csrf-token' in html
    has_handler = 'authAPI.handleSignup' in html
    status = has_script and has_csrf and has_handler
    results.append(('Frontend Integration', status))
    print(f"{'✅' if status else '❌'} Frontend integration (script, CSRF, handler)")
except:
    results.append(('Frontend Integration', False))
    print("❌ Frontend integration check failed")

# 6. JavaScript Module
try:
    with open('frontend/js/auth-api-integration.js', 'r') as f:
        js = f.read()
    has_functions = (
        'async function handleSignup' in js and
        'async function handleLogin' in js and
        'function getCSRFToken' in js and
        'const API_BASE_URL' in js
    )
    status = has_functions
    results.append(('JavaScript Module', status))
    print(f"{'✅' if status else '❌'} JavaScript module (all functions present)")
except:
    results.append(('JavaScript Module', False))
    print("❌ JavaScript module check failed")

# Summary
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

passed = sum(1 for _, status in results if status)
total = len(results)

for component, status in results:
    symbol = "✅" if status else "❌"
    print(f"{symbol} {component}")

print(f"\nStatus: {passed}/{total} components healthy")

if passed == total:
    print("\n✅ INTEGRATION IS FULLY OPERATIONAL")
    print("\nYou can:")
    print("  • Start Django: python manage.py runserver")
    print("  • Test signup form: http://localhost:8000/signup/")
    print("  • Test login form: http://localhost:8000/login/")
    print("  • Check API: http://localhost:8000/api/auth/login/")
else:
    print(f"\n⚠️  {total - passed} component(s) need attention")
    print("Review the errors above")

print()
