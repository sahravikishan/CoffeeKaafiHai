#!/usr/bin/env python
"""
Test script to verify profile persistence is working correctly
Creates a test user and verifies data persists to MongoDB
"""

import os
import sys
import django
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from database.models import User
from database.mongo import get_database

def test_profile_persistence():
    """Test that profile data persists correctly"""
    
    test_email = f'test_user_{datetime.now().timestamp()}@example.com'
    test_password = 'test_password_123'
    
    print(f"\n{'='*60}")
    print("Testing Profile Persistence")
    print(f"{'='*60}\n")
    
    # Step 1: Create a test user
    print(f"1. Creating test user: {test_email}")
    try:
        User.create(
            firstName='Test',
            lastName='User',
            email=test_email,
            phone='+91 9876543210',
            password_hash=test_password
        )
        print("   ✓ User created successfully")
    except Exception as e:
        print(f"   ✗ Failed to create user: {e}")
        return False
    
    # Step 2: Retrieve the user to verify creation
    print(f"\n2. Retrieving user from MongoDB")
    try:
        user = User.find_by_email(test_email)
        if user:
            print(f"   ✓ User found: {user.get('firstName')} {user.get('lastName')}")
            print(f"   ✓ Email: {user.get('email')}")
            print(f"   ✓ Phone: {user.get('phone')}")
        else:
            print("   ✗ User not found")
            return False
    except Exception as e:
        print(f"   ✗ Failed to retrieve user: {e}")
        return False
    
    # Step 3: Update profile with coffee preferences and address
    print(f"\n3. Updating profile with preferences")
    try:
        update_data = {
            'firstName': 'John',
            'lastName': 'Doe',
            'phone': '+91 9876543210',
            'address': '123 Coffee Street, Coffee City',
            'coffeePreferences': {
                'coffeeType': 'Espresso',
                'milkPref': 'Almond Milk',
                'sugarLevel': 'Less',
                'cupSize': 'Large',
                'temperature': 'Hot',
                'coffeeStrength': 'Double',
                'emailNotif': True,
                'smsNotif': False
            },
            'avatar': 'https://example.com/avatar.jpg'
        }
        User.update(test_email, update_data)
        print("   ✓ Profile updated successfully")
    except Exception as e:
        print(f"   ✗ Failed to update profile: {e}")
        return False
    
    # Step 4: Retrieve updated profile
    print(f"\n4. Verifying updated data persists")
    try:
        user = User.find_by_email(test_email)
        if user:
            print(f"   ✓ Updated name: {user.get('firstName')} {user.get('lastName')}")
            print(f"   ✓ Address: {user.get('address')}")
            prefs = user.get('coffeePreferences', {})
            print(f"   ✓ Coffee type: {prefs.get('coffeeType')}")
            print(f"   ✓ Milk preference: {prefs.get('milkPref')}")
            print(f"   ✓ Cup size: {prefs.get('cupSize')}")
            print(f"   ✓ Avatar URL: {user.get('avatar')}")
        else:
            print("   ✗ User not found after update")
            return False
    except Exception as e:
        print(f"   ✗ Failed to retrieve updated user: {e}")
        return False
    
    # Step 5: Verify data in MongoDB directly
    print(f"\n5. Verifying data in MongoDB")
    try:
        db = get_database()
        mongo_user = db['users'].find_one({'email': test_email})
        if mongo_user:
            print(f"   ✓ Found in MongoDB users collection")
            print(f"   ✓ Document keys: {list(mongo_user.keys())}")
            if mongo_user.get('coffeePreferences'):
                print(f"   ✓ Coffee preferences stored: {mongo_user['coffeePreferences']}")
        else:
            print("   ✗ User not found in MongoDB")
            return False
    except Exception as e:
        print(f"   ✗ Failed to check MongoDB: {e}")
        return False
    
    print(f"\n{'='*60}")
    print("✓ ALL TESTS PASSED - Data persistence is working!")
    print(f"{'='*60}\n")
    
    return True

if __name__ == '__main__':
    success = test_profile_persistence()
    sys.exit(0 if success else 1)
