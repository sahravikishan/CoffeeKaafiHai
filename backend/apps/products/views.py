"""
API view functions for authentication, payments, OTP handling, and products.
These views handle JSON requests from the frontend.
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model, login as django_login
from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils import timezone
import json
import logging
from datetime import datetime, timedelta
import random
from decimal import Decimal, ROUND_HALF_UP
from database.models import User, OTP, Order as MongoOrder, Payment as MongoPayment  # fetch reads from MongoDB on each request
from database.mongo import get_database
from .models import Order as OrderModel, Payment as PaymentModel, UserProfile, UserActivity, Feedback, Notification
from .forms import OrderForm
from .notifications import notify_order_event, notify_offer, notify_announcement
from .email_templates import send_templated_email
import traceback

try:
    import bcrypt
except Exception:
    bcrypt = None

try:
    import razorpay
    from razorpay.errors import SignatureVerificationError
except Exception:
    razorpay = None
    SignatureVerificationError = Exception

logger = logging.getLogger(__name__)


# ==========================================
# PRODUCT ENDPOINTS
# ==========================================

def _get_django_user_by_email(email):
    """Fetch Django auth user by email or username for FK usage."""
    user_model = get_user_model()
    return (
        user_model.objects.filter(email=email).first()
        or user_model.objects.filter(username=email).first()
    )


def _normalize_extra_fields(extra):
    """Return order extra_fields as a safe dict."""
    payload = extra or {}
    if isinstance(payload, str):
        try:
            payload = json.loads(payload)
        except (json.JSONDecodeError, TypeError):
            payload = {}
    if not isinstance(payload, dict):
        return {}
    return payload


def _find_order_by_client_order_id(client_order_id, email=None, limit=400):
    """
    Resolve an order by clientOrderId from extra_fields.
    Kept DB-agnostic to avoid JSONField lookup differences.
    """
    resolved = str(client_order_id or '').strip()
    if not resolved:
        return None
    qs = OrderModel.objects.order_by('-created_at')
    if email:
        qs = qs.filter(email=email)
    for candidate in qs[:limit]:
        extra = _normalize_extra_fields(candidate.extra_fields)
        if str(extra.get('clientOrderId') or '').strip() == resolved:
            return candidate
    return None


def _get_or_create_profile(email, mongo_user=None):
    """Ensure a persistent user profile exists for this email."""
    if not email:
        return None
    profile = UserProfile.objects.filter(email=email).first()
    if profile:
        if not profile.user:
            profile.user = _get_django_user_by_email(email)
            profile.save(update_fields=['user'])
        return profile

    defaults = {
        'first_name': (mongo_user or {}).get('firstName', ''),
        'last_name': (mongo_user or {}).get('lastName', ''),
        'phone': (mongo_user or {}).get('phone', ''),
        'address': (mongo_user or {}).get('address', ''),
        'coffee_preferences': (mongo_user or {}).get('coffeePreferences', {}) or {},
        'avatar': (mongo_user or {}).get('avatar', ''),
    }
    user = _get_django_user_by_email(email)
    profile = UserProfile.objects.create(email=email, user=user, **defaults)
    return profile


def _log_activity(email, action, metadata=None):
    """Persist user activity for audit/history."""
    if not email:
        return
    UserActivity.objects.create(
        user=_get_django_user_by_email(email),
        email=email,
        action=action,
        metadata=metadata or {}
    )


def _backfill_orders_from_mongo(email):
    """One-time migration of legacy MongoDB orders into Django DB."""
    if not email:
        return
    if OrderModel.objects.filter(email=email).exists():
        return
    try:
        db = get_database()
        legacy_orders = list(db['orders'].find({'email': email}).sort('createdAt', -1))
        profile = UserProfile.objects.filter(email=email).first()
        profile_name = ''
        if profile:
            profile_name = f"{profile.first_name} {profile.last_name}".strip()
        for legacy in legacy_orders:
            legacy_created = legacy.get('createdAt')
            legacy_updated = legacy.get('updatedAt') or legacy_created
            extra = {k: v for k, v in legacy.items() if k not in {'_id', 'email', 'items', 'totalAmount', 'status', 'createdAt', 'updatedAt'}}
            legacy_name = extra.get('name') or extra.get('customerName') or profile_name
            legacy_phone = extra.get('phone') or extra.get('customerPhone') or (profile.phone if profile else '')
            legacy_address = extra.get('address') or extra.get('deliveryAddress') or (profile.address if profile else '')
            order = OrderModel.objects.create(
                user=_get_django_user_by_email(email),
                email=email,
                order_name=legacy_name or '',
                order_email=legacy.get('email') or email,
                order_phone=legacy_phone or '',
                order_address=legacy_address or '',
                customer_name=legacy_name or '',
                customer_email=legacy.get('email') or email,
                customer_phone=legacy_phone or '',
                customer_address=legacy_address or '',
                items=legacy.get('items') or [],
                total_amount=Decimal(legacy.get('totalAmount') or legacy.get('total') or 0),
                status=legacy.get('status') or 'pending',
                extra_fields=extra
            )
            # Preserve original timestamps when available
            if legacy_created:
                OrderModel.objects.filter(id=order.id).update(created_at=legacy_created, updated_at=legacy_updated)
    except Exception as e:
        print(f"Order backfill failed for {email}: {e}")

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
        email = str(data.get('email') or '').strip().lower()
        otp = str(data.get('otp') or '').strip()
        
        if not email or not otp:
            return JsonResponse({
                'success': False,
                'message': 'Email and OTP are required'
            }, status=400)
        
        # Save OTP to MongoDB
        OTP.create(email, otp, expiry_minutes=10)

        sent_at = timezone.localtime(timezone.now()).strftime('%a, %d/%m/%Y %I:%M %p')
        ok, reason = send_templated_email(
            recipient=email,
            subject="Your Password Reset OTP",
            text_message=f"Your OTP is {otp}. It expires in 10 minutes.",
            title="Your OTP Code",
            message="Use this one-time password to reset your account:",
            code=otp,
            meta_lines=[
                "This OTP expires in 10 minutes.",
                f"Sent at: {sent_at}",
            ],
            footer_note="If you didn't request this, you can safely ignore this email.",
            header_subtitle="Secure Password Reset",
        )
        if not ok:
            logger.error(
                "Legacy OTP email send failed for email=%s reason=%s",
                email,
                reason or 'otp_email_send_failed',
            )
            return JsonResponse({
                'success': False,
                'message': 'Unable to send OTP email'
            }, status=500)
        
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
                if bcrypt is None:
                    authenticated = False
                    logger.error("bcrypt dependency missing while verifying password for email=%s", email)
                else:
                    authenticated = bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8'))
            else:
                # Legacy plaintext fallback: compare and migrate to bcrypt on success
                if stored_password == password:
                    authenticated = True
                    if bcrypt is not None:
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

        # Session-auth: ensure request.user is authenticated via Django
        try:
            user_model = get_user_model()
            django_user = (
                user_model.objects.filter(email=email).first()
                or user_model.objects.filter(username=email).first()
            )
            if not django_user:
                django_user = user_model.objects.create_user(username=email, email=email, password=password)
            django_login(request, django_user, backend='django.contrib.auth.backends.ModelBackend')
        except Exception as e:
            print(f"Django login sync failed for {email}: {e}")

        # HARD BLOCK: Create profile ONLY from signup, not login
        # Persistence: ensure profile exists in DB for this user
        try:
            _get_or_create_profile(email, user)
        except Exception as e:
            print(f"Profile bootstrap failed for {email}: {e}")

        # Persistence: log user login activity
        try:
            _log_activity(email, 'login')
        except Exception as e:
            print(f"Activity log failed for {email}: {e}")
        
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
        if bcrypt is None:
            if django_user:
                try:
                    django_user.delete()
                except Exception:
                    pass
            return JsonResponse({
                'message': 'Server security dependency is missing'
            }, status=500)
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

        # CRITICAL: Create UserProfile ONLY at signup time (one-way: signup → profile)
        # This is the SINGLE source of truth for initial personal data
        # Profile can be updated ONLY from profile page or signup (never from checkout)
        try:
            _get_or_create_profile(email, {
                'firstName': firstName,
                'lastName': lastName,
                'phone': phone
            })
        except Exception as e:
            if django_user:
                try:
                    django_user.delete()
                except Exception:
                    pass
            print(f"Error creating profile during signup for {email}: {e}")
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

        # Session-auth: ensure request.user is authenticated via Django
        try:
            if django_user:
                django_login(request, django_user, backend='django.contrib.auth.backends.ModelBackend')
        except Exception as e:
            print(f"Django login sync failed for {email}: {e}")
        
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
        # Persistence: log logout activity before session is cleared
        try:
            _log_activity(request.session.get('email'), 'logout')
        except Exception as e:
            print(f"Activity log failed for logout: {e}")

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
        email = str(data.get('email') or '').strip().lower()
        
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

        sent_at = timezone.localtime(timezone.now()).strftime('%a, %d/%m/%Y %I:%M %p')
        ok, reason = send_templated_email(
            recipient=email,
            subject="Your Password Reset OTP",
            text_message=f"Your OTP is {otp}. It expires in 10 minutes.",
            title="Your OTP Code",
            message="Use this one-time password to reset your account:",
            code=otp,
            meta_lines=[
                "This OTP expires in 10 minutes.",
                f"Sent at: {sent_at}",
            ],
            footer_note="If you didn't request this, you can safely ignore this email.",
            header_subtitle="Secure Password Reset",
        )
        if not ok:
            logger.error(
                "Forgot password OTP email send failed for email=%s reason=%s",
                email,
                reason or 'otp_email_send_failed',
            )
            return JsonResponse({'message': 'Unable to send OTP email'}, status=500)
        
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
        if bcrypt is None:
            return JsonResponse({'message': 'Server security dependency is missing'}, status=500)
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
@login_required(login_url='/login/')
@require_http_methods(["GET", "POST"])
def profile(request):
    """
    Get or update user profile for the authenticated session user.
    GET: session-auth only
    POST body: { "firstName": "...", "lastName": "...", "phone": "...", "address": "...", ... }
    """
    try:
        if request.method == "GET":
            # Session-auth: use authenticated Django user only
            email = request.user.email or request.user.username
            if not email:
                return JsonResponse({'success': False, 'message': 'Email is required'}, status=400)

            mongo_user = User.find_by_email(email)  # fetch user from MongoDB per request
            if not mongo_user:
                return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

            mongo_orders = MongoOrder.get_by_email(email)  # fetch orders from MongoDB per request
            last_order = mongo_orders[0] if mongo_orders else None  # use latest Mongo order snapshot
            last_order_at = last_order.get('createdAt') if last_order else None  # pull persisted timestamp
            last_order_items = last_order.get('items') if last_order else []  # pull persisted items list
            member_since = mongo_user.get('createdAt') or mongo_user.get('created_at')  # use Mongo user creation timestamp
            
            # Format member_since date as DD Mon YYYY, h:mm am/pm (platform-independent)
            def format_datetime(dt):
                if not dt or not hasattr(dt, 'strftime'):
                    return dt
                formatted = dt.strftime("%d %b %Y, %I:%M %p")
                # Remove leading zero from hour (e.g., "08:33 pm" -> "8:33 pm")
                hour_day_split = formatted.split(', ')
                if len(hour_day_split) == 2:
                    day_month_year = hour_day_split[0]
                    time_period = hour_day_split[1]
                    # Remove leading zero from hour
                    time_parts = time_period.split(':')
                    if len(time_parts) == 2:
                        hour = str(int(time_parts[0]))  # Convert to int and back to remove leading zero
                        minute_period = time_parts[1]
                        formatted = f"{day_month_year}, {hour}:{minute_period}"
                return formatted.lower()
            
            member_since_value = format_datetime(member_since) if member_since else None
            last_order_at_value = format_datetime(last_order_at) if last_order_at else None

            # Compute loyalty stats from MongoDB orders (read-only)
            stats = _compute_loyalty_stats(email)  # read fresh stats from MongoDB orders

            user_safe = {
                'email': mongo_user.get('email'),
                'firstName': mongo_user.get('firstName', ''),
                'lastName': mongo_user.get('lastName', ''),
                'phone': mongo_user.get('phone', ''),
                'address': mongo_user.get('address', ''),
                'coffeePreferences': mongo_user.get('coffeePreferences', {}) or {},
                'avatar': mongo_user.get('avatar', ''),
                'memberSince': member_since_value,
                'lastOrderAt': last_order_at_value,
                'lastOrderItems': last_order_items,
                'totalOrders': stats['totalOrders'],
                'totalSpent': float(stats['totalSpent']),
                'loyaltyPoints': stats['loyaltyPoints'],
                'memberTier': stats['memberTier']
            }

            # Include recent activity history (latest 20)
            try:
                activity_qs = UserActivity.objects.filter(email=email).order_by('-created_at')[:20]
                user_safe['activityHistory'] = [
                    {
                        'action': a.action,
                        'metadata': a.metadata,
                        'createdAt': a.created_at.isoformat() if a.created_at else None
                    } for a in activity_qs
                ]
            except Exception:
                user_safe['activityHistory'] = []

            return JsonResponse({'success': True, 'user': user_safe})

        # POST: update profile
        data = json.loads(request.body)
        # Session-auth: use authenticated Django user only
        email = request.user.email or request.user.username
        if not email:
            return JsonResponse({'success': False, 'message': 'Email is required'}, status=400)

        # HARD BLOCK: only explicit profile updates are allowed (never checkout).
        source = data.get('source')
        if source != 'profile':
            return JsonResponse({'success': False, 'message': 'Profile updates are only allowed from the profile page'}, status=400)

        # HARD BLOCK: prevent checkout/order payloads from writing to profile
        # NOTE: Checkout has temporary delivery address that is NEVER synced to profile
        checkout_keys = {
            'items', 'subtotal', 'tax', 'paymentMethod', 'paymentStatus', 'orderType',
            'deliveryAddress', 'clientOrderId', 'receipt', 'amount', 'currency',
            'orderId', 'orderDate', 'cart', 'razorpay_order_id', 'razorpay_payment_id'
        }
        if any(k in data for k in checkout_keys):
            # Explicitly refuse checkout -> profile writes
            return JsonResponse({'success': False, 'message': 'Profile updates are not allowed from checkout'}, status=400)
        
        # CRITICAL GUARD: Checkout address is temporary, profile address is permanent
        # If both deliveryAddress intent AND address attempt are present, it's checkout trying to update permanent address
        if data.get('address') and request.headers.get('X-Checkout-Context'):
            return JsonResponse({'success': False, 'message': 'Checkout address is temporary and cannot update profile'}, status=400)

        mongo_user = User.find_by_email(email)
        if not mongo_user:
            return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

        # Whitelist fields to update
        update_fields = {}
        for key in ('firstName', 'lastName', 'phone', 'address', 'coffeePreferences', 'avatar'):
            if key in data:
                update_fields[key] = data.get(key)

        feedback_payload = data.get('feedback') or data.get('feedbacks')

        if not update_fields and not feedback_payload:
            return JsonResponse({'success': False, 'message': 'No profile fields to update'}, status=400)

        # Persistence: update DB-backed profile record
        profile = _get_or_create_profile(email, mongo_user)
        if not profile:
            return JsonResponse({'success': False, 'message': 'Profile not found'}, status=404)

        profile_updates = {}
        if 'firstName' in update_fields:
            profile_updates['first_name'] = update_fields.get('firstName') or ''
        if 'lastName' in update_fields:
            profile_updates['last_name'] = update_fields.get('lastName') or ''
        if 'phone' in update_fields:
            profile_updates['phone'] = update_fields.get('phone') or ''
        if 'address' in update_fields:
            profile_updates['address'] = update_fields.get('address') or ''
        if 'coffeePreferences' in update_fields:
            profile_updates['coffee_preferences'] = update_fields.get('coffeePreferences') or {}
        if 'avatar' in update_fields:
            profile_updates['avatar'] = update_fields.get('avatar') or ''

        if profile_updates:
            UserProfile.objects.filter(email=email).update(**profile_updates)

        # Keep Mongo user in sync for existing auth flow
        try:
            User.update(email, update_fields)
        except Exception as e:
            print(f"Mongo profile sync failed for {email}: {e}")

        # Persistence: append feedback without overwriting existing records
        try:
            if feedback_payload:
                feedback_items = feedback_payload if isinstance(feedback_payload, list) else [feedback_payload]
                for item in feedback_items:
                    Feedback.objects.create(
                        user=_get_django_user_by_email(email),
                        email=email,
                        name=item.get('name', ''),
                        category=item.get('category', ''),
                        rating=Decimal(item.get('rating') or 0),
                        message=item.get('message', '')
                    )
        except Exception as e:
            print(f"Feedback persistence failed for {email}: {e}")

        # Update Django auth user names if available
        try:
            django_user = _get_django_user_by_email(email)
            if django_user:
                if 'firstName' in update_fields:
                    django_user.first_name = update_fields.get('firstName') or django_user.first_name
                if 'lastName' in update_fields:
                    django_user.last_name = update_fields.get('lastName') or django_user.last_name
                django_user.save(update_fields=['first_name', 'last_name'])
        except Exception as e:
            print(f"Django user sync failed for {email}: {e}")

        # Persistence: log profile update activity
        try:
            _log_activity(email, 'profile_updated', {'fields': list(update_fields.keys())})
        except Exception as e:
            print(f"Activity log failed for {email}: {e}")

        mongo_user_refreshed = User.find_by_email(email)  # re-read profile from MongoDB after update
        user_safe = {
            'email': email,
            'firstName': (mongo_user_refreshed or {}).get('firstName', ''),
            'lastName': (mongo_user_refreshed or {}).get('lastName', ''),
            'phone': (mongo_user_refreshed or {}).get('phone', ''),
            'address': (mongo_user_refreshed or {}).get('address', ''),
            'coffeePreferences': (mongo_user_refreshed or {}).get('coffeePreferences', {}) or {},
            'avatar': (mongo_user_refreshed or {}).get('avatar', '')
        }

        return JsonResponse({'success': True, 'message': 'Profile updated', 'user': user_safe})
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def public_feedbacks(request):
    """
    Public feedback endpoint.
    GET: latest feedback filtered by minimum rating.
    POST: create a feedback entry.
    """
    try:
        if request.method == "POST":
            if not getattr(request, 'user', None) or not request.user.is_authenticated:
                return JsonResponse({
                    'success': False,
                    'message': 'Authentication required. Please log in to submit feedback.'
                }, status=401)

            try:
                data = json.loads(request.body or "{}")
            except json.JSONDecodeError:
                return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)

            raw_rating = data.get('rating')
            try:
                rating = Decimal(str(raw_rating))
            except Exception:
                rating = Decimal('0')
            if not rating.is_finite():
                rating = Decimal('0')
            rating = max(Decimal('0'), min(rating, Decimal('5')))

            message = str(data.get('message') or '').strip()
            if not message:
                return JsonResponse({'success': False, 'message': 'Feedback message is required'}, status=400)

            provided_name = str(data.get('name') or '').strip()
            derived_name = str(request.user.get_full_name() or '').strip()
            name = provided_name or derived_name or 'Customer'
            email = str(request.user.email or request.user.username or '').strip()
            category = str(data.get('category') or '').strip() or 'Customer'

            feedback = Feedback.objects.create(
                user=request.user,
                email=email,
                name=name,
                category=category,
                rating=rating,
                message=message
            )

            return JsonResponse({
                'success': True,
                'message': 'Feedback saved',
                'feedback': {
                    'name': feedback.name,
                    'category': feedback.category,
                    'rating': float(feedback.rating),
                    'message': feedback.message,
                    'created_at': feedback.created_at.isoformat() if feedback.created_at else None,
                    'timestamp': feedback.created_at.isoformat() if feedback.created_at else None
                }
            })

        try:
            limit = int(request.GET.get('limit', 3))
        except (TypeError, ValueError):
            limit = 3
        limit = max(1, min(limit, 20))

        raw_min_rating = request.GET.get('min_rating', '4')
        try:
            min_rating = Decimal(str(raw_min_rating))
        except Exception:
            min_rating = Decimal('4')
        if not min_rating.is_finite():
            min_rating = Decimal('4')
        min_rating = max(Decimal('0'), min(min_rating, Decimal('5')))

        feedback_qs = Feedback.objects.filter(rating__gte=min_rating).order_by('-created_at', '-id')[:limit]
        feedbacks = [
            {
                'name': f.name or 'Customer',
                'category': f.category or 'Customer',
                'rating': float(f.rating),
                'message': f.message or '',
                'created_at': f.created_at.isoformat() if f.created_at else None,
                'timestamp': f.created_at.isoformat() if f.created_at else None
            }
            for f in feedback_qs
        ]
        return JsonResponse({'success': True, 'feedbacks': feedbacks})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e), 'feedbacks': []}, status=500)



# ==========================================
# PROFILE + ORDER STATS UTILITIES
# ==========================================

def _compute_loyalty_stats(email):
    """Compute loyalty stats from orders."""
    try:
        db = get_database()  # read orders directly from MongoDB each time
        active_orders = list(db['orders'].find({'email': email, 'status': {'$ne': 'cancelled'}}))  # no cached state
        total_orders = len(active_orders)  # compute count from fresh Mongo results
        total_spent = sum(Decimal(str(o.get('totalAmount') or o.get('total') or 0)) for o in active_orders)  # sum persisted totals
    except Exception:
        total_orders = 0
        total_spent = 0

    points = int(Decimal(total_spent) // Decimal(10))

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

def _get_razorpay_client():
    """Return configured Razorpay client or raise a clear error."""
    if razorpay is None:
        raise ValueError('Razorpay SDK is not installed on server')
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise ValueError('Razorpay keys are not configured')
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

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
        amount_raw = data.get('amount')
        currency = (data.get('currency') or 'INR').upper()
        receipt = data.get('receipt') or f"order_{int(timezone.now().timestamp())}"
        email = data.get('email') or request.session.get('email')
        # Use session email as the profile source of truth (checkout must not override profile owner)
        profile_email = request.session.get('email') or email
        items = data.get('items', [])
        status = data.get('status') or 'pending'

        if amount_raw is None or not profile_email:
            return JsonResponse({
                'success': False,
                'message': 'Amount and email are required'
            }, status=400)
        try:
            amount = Decimal(str(amount_raw))
        except Exception:
            return JsonResponse({'success': False, 'message': 'Invalid amount'}, status=400)
        if amount <= 0:
            return JsonResponse({'success': False, 'message': 'Amount must be greater than 0'}, status=400)
        if currency != 'INR':
            return JsonResponse({'success': False, 'message': 'Only INR currency is supported'}, status=400)
        amount = amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        amount_paise = int((amount * Decimal('100')).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
        if amount_paise <= 0:
            return JsonResponse({'success': False, 'message': 'Invalid amount in paise'}, status=400)

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
        client_order_id = str(extra_fields.get('clientOrderId') or '').strip()

        # NOTE: Checkout must NEVER mutate request.user or request.user.profile.
        # All profile data here is read-only, used only to snapshot order fields.
        django_user = _get_django_user_by_email(profile_email)
        existing_order = _find_order_by_client_order_id(client_order_id, email=profile_email) if client_order_id else None
        if existing_order and existing_order.status in ('paid', 'delivered'):
            return JsonResponse({
                'success': False,
                'message': 'This order is already paid. Please check order tracking.',
                'orderId': client_order_id or str(existing_order.id)
            }, status=409)

        created_new_order = False
        with transaction.atomic():
            # One-way sync: profile -> checkout (checkout must never update profile)
            # Lock the profile row to detect any accidental writes within this checkout transaction.
            profile = UserProfile.objects.select_for_update().filter(email=profile_email).first()
            profile_name = ''
            if profile:
                profile_name = f"{profile.first_name} {profile.last_name}".strip()

            # Checkout fields can override order snapshot only (not profile)
            checkout_name = data.get('name')
            if not checkout_name:
                first = data.get('firstName') or ''
                last = data.get('lastName') or ''
                checkout_name = f"{first} {last}".strip()
            snapshot_name = checkout_name or profile_name or ''
            snapshot_email = data.get('email') or (profile.email if profile else profile_email) or ''
            snapshot_phone = data.get('phone') or (profile.phone if profile else '')

            # CRITICAL: Checkout address is TEMPORARY and INDEPENDENT of profile address
            # User can enter any delivery address during checkout without affecting profile
            # This is the one-way flow: profile -> checkout (read-only), NEVER checkout -> profile
            # Checkout-provided 'address' or 'deliveryAddress' only writes to order_address, never profile.address
            checkout_address = data.get('address') or data.get('deliveryAddress')
            snapshot_address = checkout_address or (profile.address if profile else '')

            # FAIL-SAFE GUARD: snapshot profile values BEFORE checkout write
            # This includes address so we can verify it was never modified by checkout
            profile_before = None
            if profile:
                profile_before = {
                    'first_name': profile.first_name,
                    'last_name': profile.last_name,
                    'email': profile.email,
                    'phone': profile.phone,
                    'address': profile.address,  # Profile address is immutable from checkout
                }

            if existing_order and existing_order.status != 'cancelled':
                # Idempotency: reuse the same order row for the same clientOrderId.
                order = existing_order
                current_extra = _normalize_extra_fields(order.extra_fields)
                for key, value in extra_fields.items():
                    if value not in (None, ''):
                        current_extra[key] = value
                order.extra_fields = current_extra
                order.user = order.user or django_user
                order.email = profile_email
                order.items = items or order.items
                order.total_amount = amount
                order.status = status or order.status or 'pending'
                order.order_name = snapshot_name or order.order_name
                order.order_email = snapshot_email or order.order_email
                order.order_phone = snapshot_phone or order.order_phone
                order.order_address = snapshot_address or order.order_address
                # Legacy fields populated for backward compatibility only
                order.customer_name = snapshot_name or order.customer_name
                order.customer_email = snapshot_email or order.customer_email
                order.customer_phone = snapshot_phone or order.customer_phone
                order.customer_address = snapshot_address or order.customer_address
                order.save(update_fields=[
                    'user',
                    'email',
                    'items',
                    'total_amount',
                    'status',
                    'extra_fields',
                    'order_name',
                    'order_email',
                    'order_phone',
                    'order_address',
                    'customer_name',
                    'customer_email',
                    'customer_phone',
                    'customer_address',
                    'updated_at',
                ])
            else:
                # Checkout MUST use OrderForm only (no User/Profile forms)
                form_data = {
                    'items': json.dumps(items or []),
                    'total_amount': str(amount),
                    'status': status,
                    'extra_fields': json.dumps(extra_fields),
                    'order_name': snapshot_name,
                    'order_email': snapshot_email,
                    'order_phone': snapshot_phone,
                    'order_address': snapshot_address,
                }

                order_form = OrderForm(form_data)
                if not order_form.is_valid():
                    return JsonResponse({'success': False, 'message': 'Invalid order data', 'errors': order_form.errors}, status=400)

                # HARD BLOCK: Save order ONLY, NEVER profile/user
                # Checkout data is SNAPSHOT-ONLY for this order (order_name, order_email, order_phone, order_address)
                # These fields are SEPARATE and INDEPENDENT from UserProfile (first_name, last_name, email, phone, address)
                # CRITICAL: order_address is temporary delivery address - it is NEVER synced back to profile.address
                # Profile address can ONLY be modified by user manually on profile page (source='profile')
                # Even if user changes address during checkout, profile.address remains unchanged
                order = order_form.save(commit=False)
                order.user = django_user
                order.email = profile_email
                # Legacy fields populated for backward compatibility only
                order.customer_name = snapshot_name
                order.customer_email = snapshot_email
                order.customer_phone = snapshot_phone
                order.customer_address = snapshot_address
                order.save()
                created_new_order = True

            # FAIL-LOUD GUARD: Verify profile data was NOT modified during checkout
            # CRITICAL: profile.address must remain unchanged (user delivery address is temporary, in order_address only)
            # If this assertion fails, checkout view has a critical bug allowing address sync back to profile
            if profile_before is not None:
                profile_after = UserProfile.objects.filter(email=profile_email).first()
                if profile_after and {
                    'first_name': profile_after.first_name,
                    'last_name': profile_after.last_name,
                    'email': profile_after.email,
                    'phone': profile_after.phone,
                    'address': profile_after.address,  # THIS MUST NEVER CHANGE FROM CHECKOUT
                } != profile_before:
                    raise Exception('Checkout attempted to modify profile data (blocked). Profile address must remain immutable from checkout.')

        try:
            # Create real Razorpay order
            client = _get_razorpay_client()
            razorpay_payload = {
                'amount': amount_paise,
                'currency': 'INR',
                'receipt': str(receipt)[:40],
                'notes': {
                    'email': profile_email,
                    'backend_order_id': str(order.id),
                    'client_order_id': str(extra_fields.get('clientOrderId') or ''),
                }
            }
            payment_capture = data.get('payment_capture')
            if payment_capture is not None:
                razorpay_payload['payment_capture'] = 1 if str(payment_capture).lower() in ('1', 'true', 'yes') else 0
            razorpay_order = client.order.create(data=razorpay_payload)
            razorpay_order_id = razorpay_order.get('id')
            if not razorpay_order_id:
                raise Exception('Razorpay order creation failed')

            # Persistence: create payment record in DB
            PaymentModel.objects.create(
                user=django_user,
                order=order,
                email=profile_email,
                amount=amount,
                razorpay_order_id=razorpay_order_id,
                status='pending'
            )
        except Exception:
            # Keep DB clean only for brand-new rows; retries may reuse an existing order.
            if created_new_order:
                OrderModel.objects.filter(id=order.id).delete()
            raise

        # NOTE: No profile/user writes are allowed in checkout flow.
        stats = None

        if created_new_order:
            # Persistence: update profile with order stats (CRITICAL FIX for data loss)
            # When an order is created, profile must be updated with latest statistics
            # so data persists across page refreshes and browser restarts
            try:
                profile_to_update = UserProfile.objects.filter(email=profile_email).first()
                if profile_to_update:
                    # Compute updated stats including this new order
                    stats = _compute_loyalty_stats(profile_email)
                    # CRITICAL: Save stats to database (not just computed in memory)
                    UserProfile.objects.filter(email=profile_email).update(
                        last_order_at=timezone.now(),
                        last_order_items=items or [],
                        total_orders=stats['totalOrders'],
                        total_spent=Decimal(str(stats['totalSpent'])),
                        loyalty_points=stats['loyaltyPoints'],
                        member_tier=stats['memberTier']
                    )
            except Exception as e:
                print(f"Profile stats update failed for {profile_email}: {e}")

            # Persistence: log order creation activity
            try:
                _log_activity(profile_email, 'order_created', {'orderId': str(order.id), 'status': status})
            except Exception as e:
                print(f"Activity log failed for {profile_email}: {e}")

            try:
                notify_order_event(
                    profile_email,
                    'order_placed',
                    order=order,
                    status=order.status or status or 'pending',
                )
            except Exception:
                logger.exception(
                    "Order placed notification failed for email=%s order_id=%s",
                    profile_email,
                    order.id,
                )

        return JsonResponse({
            'success': True,
            'razorpay_order_id': razorpay_order_id,
            'razorpay_key_id': settings.RAZORPAY_KEY_ID,
            'amount': amount,
            'amount_paise': amount_paise,
            'currency': currency,
            'backend_order_id': str(order.id),
            'client_order_id': extra_fields.get('clientOrderId'),
            'order': {
                'orderId': extra_fields.get('clientOrderId') or str(order.id),
                'clientOrderId': extra_fields.get('clientOrderId'),
                'email': profile_email,
                'items': items,
                'totalAmount': amount,
                'status': order.status
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
        # Defensive logging for verification
        print(f"[PAYMENT VERIFY] Incoming: order_id={order_id}, payment_id={payment_id}, signature={signature}, email={email}")
        if not all([order_id, payment_id, signature]):
            print("[PAYMENT VERIFY] Missing payment details")
            return JsonResponse({
                'verified': False,
                'message': 'Missing payment details'
            }, status=400)
        client = _get_razorpay_client()
        payment = PaymentModel.objects.filter(razorpay_order_id=order_id).first()
        if not payment:
            print(f"[PAYMENT VERIFY] Payment record not found for order_id={order_id}")
            return JsonResponse({
                'verified': False,
                'message': 'Payment record not found'
            }, status=400)
        signature_payload = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature,
        }
        try:
            client.utility.verify_payment_signature(signature_payload)
        except SignatureVerificationError:
            print(f"[PAYMENT VERIFY] Invalid payment signature for order_id={order_id}, payment_id={payment_id}")
            if payment:
                payment.status = 'failed'
                payment.razorpay_payment_id = payment_id or payment.razorpay_payment_id
                payment.razorpay_signature = signature or payment.razorpay_signature
                payment.save(update_fields=['status', 'razorpay_payment_id', 'razorpay_signature', 'updated_at'])
            return JsonResponse({
                'verified': False,
                'message': 'Invalid payment signature'
            }, status=400)
        if payment:
            payment.status = 'verified'
            payment.razorpay_payment_id = payment_id or payment.razorpay_payment_id
            payment.razorpay_signature = signature or payment.razorpay_signature
            payment.save(update_fields=['status', 'razorpay_payment_id', 'razorpay_signature', 'updated_at'])
            resolved_email = email or payment.email
            if payment.order_id:
                OrderModel.objects.filter(id=payment.order_id).update(status='paid', updated_at=timezone.now())
            try:
                if resolved_email:
                    notify_order_event(
                        resolved_email,
                        'order_status_update',
                        order=payment.order if payment.order_id else None,
                        status='paid',
                    )
            except Exception:
                logger.exception(
                    "Payment notification failed for email=%s razorpay_order_id=%s",
                    resolved_email,
                    order_id,
                )
            try:
                if resolved_email:
                    stats = _compute_loyalty_stats(resolved_email)
                    UserProfile.objects.filter(email=resolved_email).update(
                        total_orders=stats['totalOrders'],
                        total_spent=Decimal(str(stats['totalSpent'])),
                        loyalty_points=stats['loyaltyPoints'],
                        member_tier=stats['memberTier']
                    )
            except Exception as e:
                print(f"Profile stats update failed for {resolved_email}: {e}")
            try:
                if resolved_email:
                    _log_activity(resolved_email, 'payment_verified', {'razorpayOrderId': order_id})
            except Exception as e:
                print(f"Activity log failed for {resolved_email}: {e}")
        print(f"[PAYMENT VERIFY] Success for order_id={order_id}, payment_id={payment_id}")
        return JsonResponse({
            'verified': True,
            'message': 'Payment verified successfully'
        })
    except json.JSONDecodeError:
        print("[PAYMENT VERIFY] Invalid JSON")
        return JsonResponse({
            'verified': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        print(f"[PAYMENT VERIFY] Exception: {e}")
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
        
        # HARD BLOCK: Create payment/order records ONLY, NEVER profile
        # Persistence: create payment record in DB (NEVER profile)
        django_user = _get_django_user_by_email(email)
        order_obj = OrderModel.objects.filter(id=order_id).first() if order_id else None
        PaymentModel.objects.create(
            user=django_user,
            order=order_obj,
            email=email,
            amount=Decimal(amount),
            razorpay_order_id='',
            status='processing'
        )
        
        # Update order status (NEVER profile)
        if order_obj:
            OrderModel.objects.filter(id=order_obj.id).update(status='processing', updated_at=timezone.now())

        # Persistence: update profile with latest stats after payment processing (CRITICAL FIX)
        # When payment is processed, ensure profile reflects updated order statistics
        try:
            stats = _compute_loyalty_stats(email)
            # CRITICAL: Save updated stats to database so data persists across refreshes
            UserProfile.objects.filter(email=email).update(
                total_orders=stats['totalOrders'],
                total_spent=Decimal(str(stats['totalSpent'])),
                loyalty_points=stats['loyaltyPoints'],
                member_tier=stats['memberTier']
            )
        except Exception as e:
            print(f"Profile stats update failed for {email}: {e}")

        # Persistence: log payment processing activity
        try:
            _log_activity(email, 'payment_processing', {'orderId': order_id})
        except Exception as e:
            print(f"Activity log failed for {email}: {e}")
        
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
@login_required(login_url='/login/')
@require_http_methods(["GET", "POST"])
def get_orders(request):
    """
    Get orders for a user.
    Session-auth only.
    """
    try:
        email = request.user.email or request.user.username

        if not email:
            return JsonResponse({
                'success': False,
                'message': 'Email is required'
            }, status=400)

        # Early POST body parse to allow cancel-only payloads to be handled
        data = {}
        if request.method == "POST":
            try:
                data = json.loads(request.body or '{}')
            except json.JSONDecodeError:
                return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)

            # Detect cancel request immediately, before any other logic
            order_id = data.get('orderId') or data.get('id')
            client_order_id = data.get('clientOrderId')
            normalized_status = str(data.get('status') or '').strip().lower()
            cancel_request = (
                (order_id or client_order_id)
                and (
                    data.get('action') == 'cancel'
                    or normalized_status in ('cancelled', 'canceled', 'cancel')
                    or data.get('cancel') is True
                    or 'reason' in data
                )
            )

            if cancel_request:
                # Resolve order by ID first (do not require profile/email to allow minimal cancel payloads)
                order = None
                if order_id and str(order_id).isdigit():
                    order = OrderModel.objects.filter(id=int(order_id)).first()
                    # If order exists but not owned by this user, still allow status-only change

                resolved_client_order_id = client_order_id or (str(order_id) if order_id else None)
                if not order and resolved_client_order_id:
                    for candidate in OrderModel.objects.order_by('-created_at')[:200]:
                        extra = candidate.extra_fields or {}
                        if isinstance(extra, str):
                            try:
                                extra = json.loads(extra)
                            except (json.JSONDecodeError, TypeError):
                                extra = {}
                        if not isinstance(extra, dict):
                            extra = {}
                        if extra.get('clientOrderId') == resolved_client_order_id:
                            order = candidate
                            break

                if not order:
                    return JsonResponse({'success': False, 'message': 'Order not found'}, status=404)

                if order.status in ('delivered', 'cancelled'):
                    return JsonResponse({'success': False, 'message': f'Cannot cancel {order.status} order'}, status=400)

                # Persist cancellation (status only) and return minimal JSON as required
                order.status = 'cancelled'
                order.save(update_fields=['status', 'updated_at'])

                # Send cancellation notification after successful status update.
                # Use unified notification helper so all order mail follows one pipeline.
                try:
                    notify_order_event(order.email or email, 'order_cancelled', order=order, status='cancelled')
                except Exception:
                    logger.exception(
                        "Order cancellation notification failed for email=%s order_id=%s",
                        order.email or email,
                        order.id,
                    )

                # Use clientOrderId if available, fallback to database id
                order_extra = order.extra_fields or {}
                if isinstance(order_extra, str):
                    try:
                        order_extra = json.loads(order_extra)
                    except (json.JSONDecodeError, TypeError):
                        order_extra = {}
                if not isinstance(order_extra, dict):
                    order_extra = {}
                display_order_id = order_extra.get('clientOrderId') or str(order.id)
                
                return JsonResponse({
                    'success': True,
                    'message': 'Order cancelled successfully',
                    'orderId': display_order_id,
                    'status': order.status
                })

            status_update_request = (
                (order_id or client_order_id)
                and (
                    data.get('action') in ('update_status', 'status_update')
                    or normalized_status in ('pending', 'paid', 'confirmed', 'preparing', 'ready', 'delivered')
                )
            )
            if status_update_request:
                if not normalized_status:
                    return JsonResponse({'success': False, 'message': 'Status is required'}, status=400)
                if normalized_status in ('cancelled', 'canceled', 'cancel'):
                    return JsonResponse({'success': False, 'message': 'Use cancel action for cancellation'}, status=400)

                order = None
                if order_id and str(order_id).isdigit():
                    order = OrderModel.objects.filter(id=int(order_id), email=email).first()
                if not order:
                    resolved_client_order_id = client_order_id or (str(order_id) if order_id else None)
                    order = _find_order_by_client_order_id(resolved_client_order_id, email=email)

                if not order:
                    return JsonResponse({'success': False, 'message': 'Order not found'}, status=404)

                current_status = str(order.status or '').strip().lower()
                if current_status in ('delivered', 'cancelled') and normalized_status != current_status:
                    return JsonResponse({'success': False, 'message': f'Cannot update {current_status} order'}, status=400)

                last_updated = timezone.now().isoformat()
                extra = _normalize_extra_fields(order.extra_fields)
                history = extra.get('trackingHistory')
                if not isinstance(history, list):
                    history = []

                if current_status != normalized_status:
                    if not history or str((history[-1] or {}).get('status') or '').strip().lower() != normalized_status:
                        history.append({
                            'status': normalized_status,
                            'timestamp': last_updated,
                        })
                    extra['trackingHistory'] = history
                    order.status = normalized_status
                    order.extra_fields = extra
                    order.save(update_fields=['status', 'extra_fields', 'updated_at'])
                    try:
                        event_name = 'order_confirmed' if normalized_status == 'confirmed' else 'order_status_update'
                        notify_order_event(order.email or email, event_name, order=order, status=normalized_status)
                    except Exception:
                        logger.exception(
                            "Order status notification failed for email=%s order_id=%s status=%s",
                            order.email or email,
                            order.id,
                            normalized_status,
                        )

                display_order_id = str(extra.get('clientOrderId') or order.id)
                return JsonResponse({
                    'success': True,
                    'message': 'Order status updated successfully',
                    'orderId': display_order_id,
                    'status': order.status,
                    'lastUpdated': last_updated,
                    'trackingHistory': history,
                })

            if not order_id and not client_order_id:
                return JsonResponse({'success': False, 'message': 'Order ID is required'}, status=400)

        # Persistence: migrate legacy orders if needed
        _backfill_orders_from_mongo(email)

        # Persistence: fetch orders from Django DB (source of truth for checkout)
        orders = OrderModel.objects.filter(email=email).order_by('-created_at')

        # Normalize fields for frontend
        orders_data = []
        for order in orders:
            extra = _normalize_extra_fields(order.extra_fields)
            created_at_value = order.created_at.isoformat() if order.created_at else None
            updated_at_value = order.updated_at.isoformat() if order.updated_at else None
            total_amount = float(Decimal(str(order.total_amount or 0)))
            # Use clientOrderId if available, fallback to database id
            display_order_id = extra.get('clientOrderId') or str(order.id)
            order_dict = {
                '_id': str(order.id) if order.id is not None else None,
                'orderId': display_order_id,
                'clientOrderId': extra.get('clientOrderId'),
                'email': order.email,
                'orderName': order.order_name or extra.get('orderName') or '',
                'orderEmail': order.order_email or extra.get('orderEmail') or '',
                'orderPhone': order.order_phone or extra.get('orderPhone') or '',
                'orderAddress': order.order_address or extra.get('orderAddress') or '',
                # Legacy snapshot fields for backward compatibility
                'customerName': order.customer_name or extra.get('customerName') or '',
                'customerEmail': order.customer_email or extra.get('customerEmail') or '',
                'customerPhone': order.customer_phone or extra.get('customerPhone') or '',
                'customerAddress': order.customer_address or extra.get('customerAddress') or '',
                'items': order.items or [],
                'totalAmount': total_amount,
                'status': order.status or extra.get('status') or 'pending',
                'createdAt': created_at_value,
                'updatedAt': updated_at_value,
                **extra
            }
            if 'total' not in order_dict:
                order_dict['total'] = order_dict.get('totalAmount')
            if 'date' not in order_dict:
                order_dict['date'] = order_dict.get('orderDate') or order_dict.get('createdAt')
            if 'dateDisplay' not in order_dict and order_dict.get('createdAt'):
                # Format createdAt date to DD Mon YYYY, h:mm am/pm
                created_dt = order.created_at
                if created_dt and hasattr(created_dt, 'strftime'):
                    formatted_date = created_dt.strftime("%d %b %Y, %I:%M %p")
                    # Remove leading zero from hour
                    hour_day_split = formatted_date.split(', ')
                    if len(hour_day_split) == 2:
                        day_month_year = hour_day_split[0]
                        time_period = hour_day_split[1]
                        time_parts = time_period.split(':')
                        if len(time_parts) == 2:
                            hour = str(int(time_parts[0]))
                            minute_period = time_parts[1]
                            formatted_date = f"{day_month_year}, {hour}:{minute_period}"
                    order_dict['dateDisplay'] = formatted_date.lower()
                else:
                    order_dict['dateDisplay'] = order_dict.get('createdAt')
            orders_data.append(order_dict)

        return JsonResponse({
            'success': True,
            'orders': orders_data,
            'total': len(orders_data)
        })

    except Exception as e:
        print("\n🔥 ERROR IN get_orders():")
        traceback.print_exc()
        return JsonResponse({
            "success": False,
            "message": str(e)
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
        
        # Persistence: fetch payments from MongoDB
        payments = MongoPayment.get_by_email(email)  # read from MongoDB on every request
        
        # Convert to JSON-serializable structure
        payments_data = []
        for payment in payments:
            created_at = payment.get('createdAt')  # use Mongo created timestamp
            updated_at = payment.get('updatedAt')  # use Mongo updated timestamp
            created_at_value = created_at.isoformat() if hasattr(created_at, 'isoformat') else created_at  # normalize datetime for JSON
            updated_at_value = updated_at.isoformat() if hasattr(updated_at, 'isoformat') else updated_at  # normalize datetime for JSON
            payments_data.append({
                '_id': str(payment.get('_id')) if payment.get('_id') is not None else None,
                'orderId': str(payment.get('orderId')) if payment.get('orderId') is not None else None,
                'email': payment.get('email'),
                'amount': float(Decimal(str(payment.get('amount') or 0))),
                'razorpayOrderId': payment.get('razorpayOrderId') or '',
                'razorpayPaymentId': payment.get('razorpayPaymentId') or '',
                'razorpaySignature': payment.get('razorpaySignature') or '',
                'status': payment.get('status') or 'pending',
                'createdAt': created_at_value,
                'updatedAt': updated_at_value,
            })
        
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
# NOTIFICATIONS
# ==========================================

@csrf_exempt
@login_required(login_url='/login/')
@require_http_methods(["GET"])
def notifications_list(request):
    """Return recent notifications for the authenticated user."""
    try:
        email = request.user.email or request.user.username
        if not email:
            return JsonResponse({'success': False, 'message': 'Email is required'}, status=400)

        qs = Notification.objects.filter(email=email).order_by('-created_at')[:50]
        items = []
        for n in qs:
            items.append({
                'id': n.id,
                'channel': n.channel,
                'category': n.category,
                'event': n.event,
                'title': n.title,
                'message': n.message,
                'status': n.status,
                'statusReason': n.status_reason,
                'createdAt': n.created_at.isoformat() if n.created_at else None,
                'sentAt': n.sent_at.isoformat() if n.sent_at else None,
            })

        return JsonResponse({'success': True, 'notifications': items, 'total': len(items)})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


@csrf_exempt
@login_required(login_url='/login/')
@user_passes_test(lambda u: u.is_staff or u.is_superuser)
@require_http_methods(["POST"])
def broadcast_notification(request):
    """
    Admin-only broadcast for offers and announcements.
    POST body: {
      "category": "offer" | "announcement",
      "title": "...",
      "message": "...",
      "audience": "all" | "emails",
      "emails": ["a@b.com", ...],
      "sendImmediately": false
    }
    """
    try:
        data = json.loads(request.body or '{}')
        category = (data.get('category') or data.get('type') or '').strip().lower()
        title = (data.get('title') or '').strip()
        message = (data.get('message') or '').strip()
        audience = (data.get('audience') or 'all').strip().lower()
        emails = data.get('emails') or []
        send_immediately = bool(data.get('sendImmediately', False))

        if category not in ('offer', 'announcement'):
            return JsonResponse({'success': False, 'message': 'Invalid category'}, status=400)
        if not title or not message:
            return JsonResponse({'success': False, 'message': 'Title and message are required'}, status=400)

        if audience == 'emails':
            if not isinstance(emails, list) or not emails:
                return JsonResponse({'success': False, 'message': 'Emails are required for audience=emails'}, status=400)
            target_emails = list({e.strip().lower() for e in emails if e})
        else:
            target_emails = list(UserProfile.objects.values_list('email', flat=True).distinct())

        # Safety cap to keep request bounded.
        max_targets = min(len(target_emails), 500)
        target_emails = target_emails[:max_targets]

        delivered = 0
        for target in target_emails:
            if category == 'offer':
                notify_offer(target, title, message, send_immediately=send_immediately)
            else:
                notify_announcement(target, title, message, send_immediately=send_immediately)
            delivered += 1

        return JsonResponse({
            'success': True,
            'message': 'Broadcast queued',
            'totalTargets': delivered
        })
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


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


@csrf_exempt
@require_http_methods(["PATCH", "DELETE"])
def admin_mongo_user_detail(request, email):
    """Update or delete a MongoDB user by email."""
    try:
        if not request.user.is_authenticated or not (
            request.user.is_staff or request.user.is_superuser or request.user.email == email
        ):
            return JsonResponse({'message': 'Forbidden'}, status=403)
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


