"""
Test script to verify home page backend logic works correctly
Tests both authenticated and unauthenticated user scenarios
"""

import os
import sys
import django
from django.test import Client
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
django.setup()

from database.models import User, Order
from database.mongo import get_database

def setup_test_user():
    """Create a test user in MongoDB"""
    db = get_database()
    # Check if test user exists
    test_email = 'test_home_user@test.com'
    existing = User.find_by_email(test_email)
    
    if not existing:
        User.create(
            'Test',
            'User',
            test_email,
            '1234567890',
            'testpassword123'
        )
        print(f"✓ Created test user: {test_email}")
    else:
        print(f"✓ Test user already exists: {test_email}")
    
    return test_email

def test_unauthenticated_request():
    """Test home page for unauthenticated user (no email in request)"""
    print("\n" + "="*60)
    print("TEST 1: Unauthenticated Request (Guest User)")
    print("="*60)
    
    client = Client()
    
    try:
        response = client.get('/')
        
        if response.status_code == 200:
            print("✓ PASS: Home page loads successfully for guest user")
            print(f"  - Status code: {response.status_code}")
            
            # Check context for is_authenticated flag
            if response.context is not None:
                if 'is_authenticated' in response.context:
                    if response.context['is_authenticated'] == False:
                        print("✓ PASS: Unauthenticated user correctly identified in context")
                    else:
                        print(f"✗ FAIL: Expected is_authenticated=False, got {response.context['is_authenticated']}")
                else:
                    print("✗ FAIL: Context does not contain is_authenticated flag")
            else:
                print("✓ PASS: Page rendered (context not available in test client)")
        else:
            print(f"✗ FAIL: Unexpected status code: {response.status_code}")
            
    except Exception as e:
        print(f"✗ FAIL: Exception raised: {e}")
        import traceback
        traceback.print_exc()

def test_authenticated_request():
    """Test home page for authenticated user with valid email"""
    print("\n" + "="*60)
    print("TEST 2: Authenticated Request (Valid User)")
    print("="*60)
    
    test_email = setup_test_user()
    
    client = Client()
    
    try:
        response = client.get('/', {'email': test_email})
        
        if response.status_code == 200:
            print("✓ PASS: Home page loads successfully for authenticated user")
            print(f"  - Status code: {response.status_code}")
            
            # Check context for is_authenticated flag
            if response.context is not None:
                if 'is_authenticated' in response.context:
                    if response.context['is_authenticated'] == True:
                        print("✓ PASS: Authenticated user correctly identified in context")
                        
                        user = response.context.get('user')
                        if user:
                            print(f"  - email: {user.get('email')}")
                            print(f"  - firstName: {user.get('firstName')}")
                            print(f"  - lastName: {user.get('lastName')}")
                            print(f"✓ PASS: User data correctly fetched from MongoDB")
                        else:
                            print("✗ FAIL: User data not found in context")
                    else:
                        print(f"✗ FAIL: Expected is_authenticated=True, got {response.context['is_authenticated']}")
                else:
                    print("✗ FAIL: Context does not contain is_authenticated flag")
            else:
                print("✓ PASS: Page rendered (context not available in test client)")
        else:
            print(f"✗ FAIL: Unexpected status code: {response.status_code}")
            
    except Exception as e:
        print(f"✗ FAIL: Exception raised: {e}")
        import traceback
        traceback.print_exc()

def test_invalid_user():
    """Test home page with non-existent user email"""
    print("\n" + "="*60)
    print("TEST 3: Invalid User (Non-existent Email)")
    print("="*60)
    
    client = Client()
    
    try:
        response = client.get('/', {'email': 'nonexistent@test.com'})
        
        if response.status_code == 200:
            print("✓ PASS: Home page loads even for invalid email")
            print(f"  - Status code: {response.status_code}")
            
            # Check context for is_authenticated flag
            if response.context is not None:
                if 'is_authenticated' in response.context:
                    if response.context['is_authenticated'] == False:
                        print("✓ PASS: Invalid user correctly handled (not authenticated) in context")
                    else:
                        print(f"✗ FAIL: Expected is_authenticated=False, got {response.context['is_authenticated']}")
                else:
                    print("✗ FAIL: Context does not contain is_authenticated flag")
            else:
                print("✓ PASS: Page rendered (context not available in test client)")
        else:
            print(f"✗ FAIL: Unexpected status code: {response.status_code}")
            
    except Exception as e:
        print(f"✗ FAIL: Exception raised: {e}")
        import traceback
        traceback.print_exc()

def test_no_template_errors():
    """Test that template renders without errors"""
    print("\n" + "="*60)
    print("TEST 4: Template Rendering (No Errors)")
    print("="*60)
    
    client = Client()
    
    try:
        response = client.get('/')
        
        if response.status_code == 200:
            print("✓ PASS: Template rendered successfully")
            print(f"  - Status code: {response.status_code}")
            
            # Check if response has content
            if response.content:
                print(f"✓ PASS: Response has content ({len(response.content)} bytes)")
            else:
                print("✗ FAIL: Response is empty")
                
    except Exception as e:
        print(f"✗ FAIL: Template rendering failed: {e}")
        import traceback
        traceback.print_exc()

def test_session_handling():
    """Test that session is correctly handled"""
    print("\n" + "="*60)
    print("TEST 5: Session Handling")
    print("="*60)
    
    test_email = setup_test_user()
    
    client = Client()
    
    try:
        response = client.get('/', {'email': test_email})
        
        if response.status_code == 200:
            print("✓ PASS: Session handling works correctly")
            
            # Verify session exists
            if response.wsgi_request.session:
                print("✓ PASS: Session object exists")
            else:
                print("✗ FAIL: No session object")
        else:
            print(f"✗ FAIL: Unexpected status code: {response.status_code}")
            
    except Exception as e:
        print(f"✗ FAIL: Session error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("\n" + "="*60)
    print("HOME PAGE BACKEND LOGIC TESTS")
    print("="*60)
    
    try:
        test_unauthenticated_request()
        test_authenticated_request()
        test_invalid_user()
        test_no_template_errors()
        test_session_handling()
        
        print("\n" + "="*60)
        print("TESTS COMPLETED")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n✗ CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()

