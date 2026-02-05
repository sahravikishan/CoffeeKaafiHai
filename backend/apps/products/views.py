"""
API view functions for authentication, payments, OTP handling, and products.
These views handle JSON requests from the frontend.
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime, timedelta
import random
from database.models import User, OTP, Order, Payment
from database.mongo import get_database
import bcrypt


# ==========================================
# PRODUCT ENDPOINTS
# ==========================================

@csrf_exempt
def product_list(request):
    """Get list of products or create a new product"""
    db = get_database()
    collection = db["products"]

    if request.method == "GET":
        products = collection.find({}, {"_id": 0})
        return JsonResponse({
            "status": "success",
            "data": list(products)
        })

    if request.method == "POST":
        data = json.loads(request.body)

        product = {
            "name": data.get("name"),
            "price": data.get("price"),
            "category": data.get("category")
        }

        collection.insert_one(product)

        return JsonResponse({
            "status": "success",
            "message": "Product added successfully"
        })


# ==========================================
# OTP ENDPOINTS
# ==========================================

@csrf_exempt
@require_http_methods(["POST"])
def send_otp_email(request):
    """
    Send OTP to user's email for password reset.
    Expected request body: { "email": "user@example.com", "otp": "123456" }
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')
        
        if not email or not otp:
            return JsonResponse({
                'success': False,
                'message': 'Email and OTP are required'
            }, status=400)
        
        # Save OTP to MongoDB
        OTP.create(email, otp, expiry_minutes=10)
        
        # TODO: Integrate with email service (SendGrid, AWS SES, Nodemailer, etc.)
        # For now, just log it
        print(f"OTP Email Request: Email={email}, OTP={otp}")
        
        return JsonResponse({
            'success': True,
            'message': 'OTP sent successfully',
            'email': email
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def validate_otp(request):
    """
    Validate OTP provided by user.
    Expected request body: { "email": "user@example.com", "otp": "123456" }
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')
        
        if not email or not otp:
            return JsonResponse({
                'valid': False,
                'message': 'Email and OTP are required'
            }, status=400)
        
        # Verify OTP against MongoDB
        is_valid = OTP.verify(email, otp)
        
        if is_valid:
            return JsonResponse({
                'valid': True,
                'message': 'OTP is valid'
            })
        else:
            return JsonResponse({
                'valid': False,
                'message': 'Invalid or expired OTP'
            }, status=400)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'valid': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'valid': False,
            'message': str(e)
        }, status=500)


# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """
    User login endpoint.
    Expected request body: { "email": "user@example.com", "password": "password123" }
    Sets Django session and returns JWT tokens for frontend authentication.
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({
                'message': 'Email and password are required'
            }, status=400)
        
        # Find user in MongoDB
        user = User.find_by_email(email)
        if not user:
            return JsonResponse({
                'message': 'Invalid email or password'
            }, status=400)

        # Secure password verification
        stored_password = user.get('password')
        authenticated = False

        try:
            if isinstance(stored_password, str) and stored_password.startswith('$2'):
                # bcrypt hash stored
                authenticated = bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8'))
            else:
                # Legacy plaintext fallback: compare and migrate to bcrypt on success
                if stored_password == password:
                    authenticated = True
                    try:
                        new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                        User.update(email, {'password': new_hash})
                    except Exception as e:
                        print(f"Password migration failed for {email}: {e}")
        except Exception as e:
            print(f"Error verifying password for {email}: {e}")

        if not authenticated:
            return JsonResponse({
                'message': 'Invalid email or password'
            }, status=400)

        # Set minimal Django session for server-side authentication
        request.session['email'] = email
        # store user id as string to avoid ObjectId serialization issues
        try:
            request.session['user_id'] = str(user.get('_id')) if user.get('_id') else None
        except Exception:
            request.session['user_id'] = None
        # remove any previously stored name fields to keep session minimal
        for _k in ('firstName', 'lastName'):
            if _k in request.session:
                try:
                    del request.session[_k]
                except Exception:
                    pass
        request.session.modified = True
        request.session.save()
        
        # TODO: Generate JWT tokens
        
        response = JsonResponse({
            'message': 'Login successful',
            'accessToken': f'token_for_{email}',
            'refreshToken': f'refresh_token_for_{email}',
            'user': {
                'email': email,
                'firstName': user.get('firstName'),
                'lastName': user.get('lastName'),
                'phone': user.get('phone')
            }
        })
        return response
        
    except json.JSONDecodeError:
        return JsonResponse({
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def signup(request):
    """
    User signup endpoint.
    Expected request body: { 
        "firstName": "John", 
        "lastName": "Doe",
        "email": "john@example.com", 
        "phone": "9876543210",
        "password": "password123" 
    }
    Sets Django session for authenticated users after signup.
    """
    try:
        data = json.loads(request.body)
        firstName = data.get('firstName')
        lastName = data.get('lastName')
        email = data.get('email')
        phone = data.get('phone')
        password = data.get('password')
        
        if not all([firstName, lastName, email, phone, password]):
            return JsonResponse({
                'message': 'All fields are required'
            }, status=400)
        
        # Check if email already exists in MongoDB
        existing_user = User.find_by_email(email)
        if existing_user:
            return JsonResponse({
                'message': 'Email already registered'
            }, status=400)
        
        # Hash password with bcrypt before saving
        try:
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        except Exception as e:
            print(f"Error hashing password during signup for {email}: {e}")
            return JsonResponse({
                'message': 'Internal error'
            }, status=500)

        # Save user to MongoDB
        user_id = User.create(firstName, lastName, email, phone, password_hash)

        # Set minimal Django session for server-side authentication
        request.session['email'] = email
        try:
            request.session['user_id'] = str(user_id) if user_id else None
        except Exception:
            request.session['user_id'] = None
        request.session.modified = True
        request.session.save()
        
        # TODO: Generate JWT tokens
        
        return JsonResponse({
            'message': 'Account created successfully',
            'accessToken': f'token_for_{email}',
            'refreshToken': f'refresh_token_for_{email}',
            'user': {
                'email': email,
                'firstName': firstName,
                'lastName': lastName,
                'phone': phone
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def logout(request):
    """
    User logout endpoint.
    Clears Django session and returns success message.
    """
    try:
        # Clear Django session
        request.session.flush()
        
        return JsonResponse({
            'message': 'Logout successful'
        })
        
    except Exception as e:
        return JsonResponse({
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def forgot_password(request):
    """
    Forgot password endpoint - sends OTP to user email.
    Expected request body: { "email": "user@example.com" }
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        if not email:
            return JsonResponse({
                'message': 'Email is required'
            }, status=400)
        
        # Check if user exists in MongoDB
        user = User.find_by_email(email)
        if not user:
            return JsonResponse({
                'message': 'Email not found'
            }, status=400)
        
        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Save OTP to MongoDB with expiry (10 minutes)
        OTP.create(email, otp, expiry_minutes=10)
        
        # TODO: Send OTP email using email service
        print(f"Password Reset OTP for {email}: {otp}")
        
        return JsonResponse({
            'message': 'OTP sent to your email'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def reset_password(request):
    """
    Reset password endpoint - verifies OTP and updates password.
    Expected request body: { 
        "email": "user@example.com", 
        "otp": "123456",
        "newPassword": "newpassword123" 
    }
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')
        newPassword = data.get('newPassword')
        
        if not all([email, otp, newPassword]):
            return JsonResponse({
                'message': 'Email, OTP, and new password are required'
            }, status=400)
        
        # Validate OTP
        is_valid = OTP.verify(email, otp)
        if not is_valid:
            return JsonResponse({
                'message': 'Invalid or expired OTP'
            }, status=400)
        
        # Check password strength (TODO) and hash with bcrypt
        try:
            password_hash = bcrypt.hashpw(newPassword.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        except Exception as e:
            print(f"Error hashing new password for {email}: {e}")
            return JsonResponse({'message': 'Internal error'}, status=500)

        # Update user password in MongoDB
        User.update(email, {'password': password_hash})
        
        return JsonResponse({
            'message': 'Password reset successfully'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def profile(request):
    """
    Get or update user profile by email.
    GET: ?email=user@example.com
    POST body: { "email": "...", "firstName": "...", "lastName": "...", "phone": "...", "address": "...", ... }
    """
    try:
        if request.method == "GET":
            email = request.GET.get('email')
            if not email:
                return JsonResponse({'success': False, 'message': 'Email is required'}, status=400)

            user = User.find_by_email(email)
            if not user:
                return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

            # Remove sensitive fields
            user_safe = {k: v for k, v in user.items() if k != 'password'}
            # Convert ObjectId to string if present
            try:
                if '_id' in user_safe:
                    user_safe['_id'] = str(user_safe['_id'])
            except Exception:
                pass

            return JsonResponse({'success': True, 'user': user_safe})

        # POST: update profile
        data = json.loads(request.body)
        email = data.get('email') or request.session.get('email')
        if not email:
            return JsonResponse({'success': False, 'message': 'Email is required'}, status=400)

        user = User.find_by_email(email)
        if not user:
            return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

        # Whitelist fields to update
        update_fields = {}
        for key in ('firstName', 'lastName', 'phone', 'address', 'coffeePreferences', 'avatar'):
            if key in data:
                update_fields[key] = data.get(key)

        if not update_fields:
            return JsonResponse({'success': False, 'message': 'No profile fields to update'}, status=400)

        User.update(email, update_fields)
        updated = User.find_by_email(email)
        user_safe = {k: v for k, v in updated.items() if k != 'password'}
        try:
            if '_id' in user_safe:
                user_safe['_id'] = str(user_safe['_id'])
        except Exception:
            pass

        return JsonResponse({'success': True, 'message': 'Profile updated', 'user': user_safe})
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


# ==========================================
# PAYMENT ENDPOINTS
# ==========================================

@csrf_exempt
@require_http_methods(["POST"])
def create_order(request):
    """
    Create payment order endpoint for Razorpay.
    Expected request body: { 
        "amount": 1000, 
        "currency": "INR",
        "receipt": "order_id_123",
        "email": "user@example.com",
        "items": []
    }
    """
    try:
        data = json.loads(request.body)
        amount = data.get('amount')
        currency = data.get('currency', 'INR')
        receipt = data.get('receipt')
        email = data.get('email')
        items = data.get('items', [])
        
        if not amount or not receipt:
            return JsonResponse({
                'success': False,
                'message': 'Amount and receipt are required'
            }, status=400)
        
        # Create order in MongoDB
        order_id = Order.create(email, items, amount, status='pending')
        
        # TODO: Create order in Razorpay using razorpay SDK
        
        razorpay_order_id = f'order_{datetime.now().timestamp()}'.replace('.', '_')
        
        # Create payment record in MongoDB
        Payment.create(str(order_id), email, amount, razorpay_order_id, status='pending')
        
        return JsonResponse({
            'success': True,
            'razorpay_order_id': razorpay_order_id,
            'amount': amount,
            'currency': currency
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def verify_payment(request):
    """
    Verify payment signature from Razorpay.
    Expected request body: { 
        "razorpay_order_id": "order_123",
        "razorpay_payment_id": "pay_123",
        "razorpay_signature": "signature_123",
        "email": "user@example.com"
    }
    """
    try:
        data = json.loads(request.body)
        order_id = data.get('razorpay_order_id')
        payment_id = data.get('razorpay_payment_id')
        signature = data.get('razorpay_signature')
        email = data.get('email')
        
        if not all([order_id, payment_id, signature]):
            return JsonResponse({
                'verified': False,
                'message': 'Missing payment details'
            }, status=400)
        
        # TODO: Verify signature using Razorpay SDK
        # For now, assume signature is valid
        
        # Find payment in MongoDB by Razorpay order ID
        payment = Payment.get_by_razorpay_order_id(order_id)
        if payment:
            # Update payment status to verified in MongoDB
            Payment.update_status(payment['_id'], 'verified', payment_id, signature)
            
            # Update order status
            order_id_str = payment.get('orderId')
            if order_id_str:
                Order.update_status(order_id_str, 'paid')
        
        return JsonResponse({
            'verified': True,
            'message': 'Payment verified successfully'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'verified': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'verified': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def process_payment(request):
    """
    Process payment endpoint (alternative to Razorpay if needed).
    Expected request body: { 
        "amount": 1000,
        "method": "razorpay",
        "email": "user@example.com",
        "orderId": "order_123"
    }
    """
    try:
        data = json.loads(request.body)
        amount = data.get('amount')
        method = data.get('method')
        email = data.get('email')
        order_id = data.get('orderId')
        
        if not all([amount, method, email]):
            return JsonResponse({
                'success': False,
                'message': 'Amount, method, and email are required'
            }, status=400)
        
        # TODO: Process payment based on method
        
        # Create payment record in MongoDB
        payment_id = Payment.create(order_id, email, amount, '', status='processing')
        
        # Update order status
        if order_id:
            Order.update_status(order_id, 'processing')
        
        return JsonResponse({
            'success': True,
            'message': 'Payment processed successfully',
            'transaction_id': f'txn_{datetime.now().timestamp()}'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


# ==========================================
# ADDITIONAL DATA ENDPOINTS
# ==========================================

@csrf_exempt
@require_http_methods(["GET"])
def get_orders(request):
    """
    Get orders for a user.
    Expected query params: ?email=user@example.com
    """
    try:
        email = request.GET.get('email')
        
        if not email:
            return JsonResponse({
                'success': False,
                'message': 'Email is required'
            }, status=400)
        
        # Fetch orders from MongoDB
        orders = Order.get_by_email(email)
        
        # Convert ObjectId to string for JSON serialization
        orders_data = []
        for order in orders:
            order['_id'] = str(order['_id'])
            orders_data.append(order)
        
        return JsonResponse({
            'success': True,
            'orders': orders_data,
            'total': len(orders_data)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_payments(request):
    """
    Get payment history for a user.
    Expected query params: ?email=user@example.com
    """
    try:
        email = request.GET.get('email')
        
        if not email:
            return JsonResponse({
                'success': False,
                'message': 'Email is required'
            }, status=400)
        
        # Fetch payments from MongoDB
        payments = Payment.get_by_email(email)
        
        # Convert ObjectId to string for JSON serialization
        payments_data = []
        for payment in payments:
            payment['_id'] = str(payment['_id'])
            payments_data.append(payment)
        
        return JsonResponse({
            'success': True,
            'payments': payments_data,
            'total': len(payments_data)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)
