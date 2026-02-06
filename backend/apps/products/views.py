"""
API view functions for authentication, payments, OTP handling, and products.
These views handle JSON requests from the frontend.
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required, user_passes_test
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

        # Create Django auth user for admin/permissions visibility
        django_user = None
        try:
            user_model = get_user_model()
            if user_model.objects.filter(username=email).exists() or user_model.objects.filter(email=email).exists():
                return JsonResponse({
                    'message': 'Email already registered'
                }, status=400)
            django_user = user_model.objects.create_user(username=email, email=email, password=password)
            django_user.first_name = firstName
            django_user.last_name = lastName
            django_user.save()
        except Exception as e:
            print(f"Error creating Django user for {email}: {e}")
            return JsonResponse({
                'message': 'Unable to create account'
            }, status=500)

        # Hash password with bcrypt before saving
        try:
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        except Exception as e:
            if django_user:
                try:
                    django_user.delete()
                except Exception:
                    pass
            print(f"Error hashing password during signup for {email}: {e}")
            return JsonResponse({
                'message': 'Internal error'
            }, status=500)

        # Save user to MongoDB
        try:
            user_id = User.create(firstName, lastName, email, phone, password_hash)
        except Exception as e:
            if django_user:
                try:
                    django_user.delete()
                except Exception:
                    pass
            print(f"Error creating Mongo user for {email}: {e}")
            return JsonResponse({
                'message': 'Unable to create account'
            }, status=500)

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
# PROFILE + ORDER STATS UTILITIES
# ==========================================

def _compute_loyalty_stats(email):
    """Compute loyalty stats from orders."""
    try:
        orders = Order.get_by_email(email)
    except Exception:
        orders = []

    # Only count non-cancelled orders
    active_orders = [o for o in orders if o.get('status') != 'cancelled']
    total_orders = len(active_orders)

    total_spent = 0
    for o in active_orders:
        try:
            total_spent += float(o.get('totalAmount') or o.get('total') or 0)
        except Exception:
            pass

    points = int(total_spent // 10)

    member_tier = 'Bronze'
    if total_orders > 20:
        member_tier = 'Gold'
    elif total_orders > 10:
        member_tier = 'Silver'

    return {
        'totalOrders': total_orders,
        'totalSpent': total_spent,
        'loyaltyPoints': points,
        'memberTier': member_tier
    }

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
        status = data.get('status') or 'pending'

        if not amount or not receipt or not email:
            return JsonResponse({
                'success': False,
                'message': 'Amount, receipt, and email are required'
            }, status=400)

        # Optional metadata from frontend
        extra_fields = {
            'clientOrderId': data.get('clientOrderId'),
            'orderType': data.get('orderType'),
            'deliveryAddress': data.get('deliveryAddress'),
            'paymentMethod': data.get('paymentMethod'),
            'paymentStatus': data.get('paymentStatus'),
            'subtotal': data.get('subtotal'),
            'tax': data.get('tax')
        }

        # Create order in MongoDB
        order_id = Order.create(email, items, amount, status=status, extra_fields=extra_fields)

        # TODO: Create order in Razorpay using razorpay SDK
        razorpay_order_id = f'order_{datetime.now().timestamp()}'.replace('.', '_')

        # Create payment record in MongoDB
        Payment.create(str(order_id), email, amount, razorpay_order_id, status='pending')

        # Update user profile summary fields (stats + last order)
        try:
            stats = _compute_loyalty_stats(email)
            User.update(email, {
                **stats,
                'lastOrderItems': items,
                'lastOrderAt': datetime.now().isoformat()
            })
        except Exception as e:
            print(f"Profile stats update failed for {email}: {e}")
            stats = None

        return JsonResponse({
            'success': True,
            'razorpay_order_id': razorpay_order_id,
            'amount': amount,
            'currency': currency,
            'order': {
                'orderId': str(order_id),
                'clientOrderId': extra_fields.get('clientOrderId'),
                'email': email,
                'items': items,
                'totalAmount': amount,
                'status': status
            },
            'stats': stats
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

            # Refresh user loyalty stats after successful payment
            try:
                if email:
                    stats = _compute_loyalty_stats(email)
                    User.update(email, stats)
            except Exception as e:
                print(f"Profile stats refresh failed for {email}: {e}")
        
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
        
        # Convert ObjectId to string and normalize fields for frontend
        orders_data = []
        for order in orders:
            order['_id'] = str(order['_id'])
            order['orderId'] = order.get('orderId') or order.get('clientOrderId') or order.get('_id')
            if 'total' not in order:
                order['total'] = order.get('totalAmount')
            if 'date' not in order:
                order['date'] = order.get('orderDate') or order.get('createdAt')
            if 'dateDisplay' not in order and order.get('createdAt'):
                try:
                    order['dateDisplay'] = order.get('createdAt').isoformat() if hasattr(order.get('createdAt'), 'isoformat') else str(order.get('createdAt'))
                except Exception:
                    order['dateDisplay'] = str(order.get('createdAt'))
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


# ==========================================
# ADMIN MONGO USER MANAGEMENT
# ==========================================

@login_required
@user_passes_test(lambda u: u.is_staff or u.is_superuser)
@csrf_exempt
@require_http_methods(["GET"])
def admin_mongo_users(request):
    """List MongoDB users for admin dashboard (excludes passwords)."""
    try:
        db = get_database()
        users = list(db['users'].find({}, {'password': 0}))
        for user in users:
            if '_id' in user:
                user['_id'] = str(user['_id'])
        return JsonResponse({'users': users})
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)


@login_required
@user_passes_test(lambda u: u.is_staff or u.is_superuser)
@csrf_exempt
@require_http_methods(["PATCH", "DELETE"])
def admin_mongo_user_detail(request, email):
    """Update or delete a MongoDB user by email."""
    try:
        if request.method == "DELETE":
            db = get_database()
            result = db['users'].delete_one({'email': email})
            if result.deleted_count == 0:
                return JsonResponse({'message': 'User not found'}, status=404)
            return JsonResponse({'message': 'User deleted'})

        data = json.loads(request.body or '{}')
        update_fields = {}
        for field in ('firstName', 'lastName', 'phone'):
            if field in data and data[field] is not None:
                update_fields[field] = data[field]

        if not update_fields:
            return JsonResponse({'message': 'No fields to update'}, status=400)

        User.update(email, update_fields)
        updated = User.find_by_email(email)
        if updated and '_id' in updated:
            updated['_id'] = str(updated['_id'])
        if updated and 'password' in updated:
            del updated['password']
        return JsonResponse({'message': 'User updated', 'user': updated})
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)
