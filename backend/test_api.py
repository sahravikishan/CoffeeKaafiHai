#!/usr/bin/env python
"""
Quick API test to verify profile persistence endpoint is working
"""

import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from database.models import User

# Create test client
client = Client()

def test_profile_api():
    """Test the profile API endpoint"""
    
    test_email = 'testapi@example.com'
    test_password = 'test123'
    
    print("\n" + "="*70)
    print("PROFILE PERSISTENCE API TEST")
    print("="*70 + "\n")
    
    # Step 1: Create a user directly
    print("Step 1: Create test user in MongoDB")
    try:
        # Delete if exists
        print(f"  Creating user: {test_email}")
        User.create(
            firstName='API',
            lastName='Tester',
            email=test_email,
            phone='+91 1234567890',
            password_hash=test_password
        )
        print("  ✓ User created\n")
    except Exception as e:
        print(f"  ! Warning: {e}\n")
    
    # Step 2: Test GET /api/auth/profile/
    print("Step 2: GET profile endpoint")
    try:
        response = client.get(f'/api/auth/profile/?email={test_email}')
        print(f"  Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✓ Profile retrieved")
            print(f"    - Name: {data.get('user', {}).get('firstName')} {data.get('user', {}).get('lastName')}")
            print(f"    - Email: {data.get('user', {}).get('email')}\n")
        else:
            print(f"  ✗ Error: {response.content}\n")
    except Exception as e:
        print(f"  ✗ Failed: {e}\n")
    
    # Step 3: Test POST /api/auth/profile/ (Save profile)
    print("Step 3: POST profile endpoint (Save profile)")
    profile_data = {
        'email': test_email,
        'firstName': 'John',
        'lastName': 'Doe',
        'phone': '+91 9876543210',
        'address': '123 Coffee Street',
        'coffeePreferences': {
            'coffeeType': 'Espresso',
            'milkPref': 'Oat Milk',
            'sugarLevel': 'Medium',
            'cupSize': 'Large',
            'temperature': 'Hot',
            'coffeeStrength': 'Double',
            'emailNotif': True,
            'smsNotif': False
        },
        'avatar': 'https://example.com/avatar.jpg'
    }
    
    try:
        response = client.post(
            '/api/auth/profile/',
            data=json.dumps(profile_data),
            content_type='application/json'
        )
        print(f"  Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✓ Profile saved successfully")
            print(f"    - {data.get('message')}\n")
        else:
            print(f"  ! Response: {response.content.decode()}\n")
    except Exception as e:
        print(f"  ✗ Failed: {e}\n")
    
    # Step 4: GET profile again to verify persistence
    print("Step 4: GET profile to verify data persisted")
    try:
        response = client.get(f'/api/auth/profile/?email={test_email}')
        
        if response.status_code == 200:
            user = response.json().get('user', {})
            print(f"  ✓ Data persisted in MongoDB:")
            print(f"    - Name: {user.get('firstName')} {user.get('lastName')}")
            print(f"    - Address: {user.get('address')}")
            
            prefs = user.get('coffeePreferences', {})
            if prefs:
                print(f"    - Coffee Type: {prefs.get('coffeeType')}")
                print(f"    - Milk: {prefs.get('milkPref')}")
                print(f"    - Cup Size: {prefs.get('cupSize')}")
                print(f"    - Avatar: {user.get('avatar')}\n")
            else:
                print(f"    • Coffee preferences: {prefs}\n")
        else:
            print(f"  ✗ Failed to retrieve: {response.content}\n")
    except Exception as e:
        print(f"  ✗ Failed: {e}\n")
    
    print("="*70)
    print("✓ API TEST COMPLETE")
    print("="*70 + "\n")
    
    return True

if __name__ == '__main__':
    try:
        test_profile_api()
    except Exception as e:
        print(f"\n✗ TEST FAILED: {e}\n")
        sys.exit(1)
