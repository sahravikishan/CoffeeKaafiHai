"""
Template rendering views for serving HTML pages.
These views handle rendering frontend templates without adding business logic.
"""

from django.shortcuts import render, redirect
from django.http import JsonResponse
from database.models import User
from .models import Order
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required, user_passes_test


# ==========================================
# PUBLIC PAGES
# ==========================================

@ensure_csrf_cookie
def index(request):
    """
    Render main landing/home page.
    Fetches user data from MongoDB if user is authenticated.
    If user is authenticated, still show home page but client-side JS will redirect to profile if needed.
    """
    context = {
        'is_authenticated': False,
        'user': None,
        'user_orders': []
    }
    
    try:
        # Check session first (most reliable authentication indicator)
        user_email = request.session.get('email')

        if user_email:
            user = User.find_by_email(user_email)
            if user:
                context['is_authenticated'] = True
                context['user'] = {
                    'email': user.get('email'),
                    'firstName': user.get('firstName', ''),
                    'lastName': user.get('lastName', ''),
                    'phone': user.get('phone', ''),
                }
                # Fetch user's recent orders (limit to 5)
                orders = Order.objects.filter(email=user_email).order_by('-created_at')
                context['user_orders'] = list(orders[:5]) if orders else []
    except Exception as e:
        # Handle MongoDB connection or query failures gracefully
        print(f"Error fetching user data for home page: {e}")
        context['is_authenticated'] = False
    
    return render(request, 'pages/public/index.html', context)


@ensure_csrf_cookie
def privacy_policy(request):
    """Render privacy policy page"""
    return render(request, 'pages/public/privacy-policy.html')


@ensure_csrf_cookie
def terms_and_conditions(request):
    """Render terms and conditions page"""
    return render(request, 'pages/public/terms-conditions.html')


# ==========================================
# CUSTOMER PAGES
# ==========================================

@ensure_csrf_cookie
def login(request):
    """Render customer login page"""
    return render(request, 'pages/customer/login.html')


@ensure_csrf_cookie
def signup(request):
    """Render customer signup page"""
    return render(request, 'pages/customer/signup.html')


@ensure_csrf_cookie
def forgot_password(request):
    """Render forgot password page"""
    return render(request, 'pages/customer/forgot-password.html')


@ensure_csrf_cookie
def reset_password(request):
    """Render reset password page"""
    return render(request, 'pages/customer/reset-password.html')


@login_required(login_url='/login/')
@ensure_csrf_cookie
def customer_profile(request):
    """
    Render customer profile page with user data.
    Redirects to login if user is not authenticated via session.
    """
    accept_header = request.headers.get('Accept', '')
    wants_json = 'text/html' not in accept_header
    if wants_json:
        from . import views as api_views
        # Session-auth: return JSON profile data for fetch("/profile/")
        return api_views.profile(request)

    context = {
        'is_authenticated': False,
        'user': None,
        'orders': []
    }
    
    try:
        # Session-auth: require authenticated Django user
        email = request.user.email or request.user.username
        # --- FIX: Comment out the redirect to let JS handle it ---
        # if not email:
        #     return redirect('login')

        # Fetch user from MongoDB (even if no email, context remains empty and JS will redirect)
        user = User.find_by_email(email) if email else None
        if user:
            context['is_authenticated'] = True
            context['user'] = {
                'email': user.get('email'),
                'firstName': user.get('firstName', ''),
                'lastName': user.get('lastName', ''),
                'phone': user.get('phone', ''),
            }

            # Fetch user orders from MongoDB
            orders = Order.objects.filter(email=email).order_by('-created_at')
            context['orders'] = list(orders) if orders else []
    except Exception as e:
        print(f"Error fetching profile data: {e}")
        # --- FIX: No redirect here; let JS handle ---
        # return redirect('login')

    return render(request, 'pages/customer/profile.html', context)


@ensure_csrf_cookie
def order_tracking(request):
    """Render order tracking page with orders data"""
    context = {}
    try:
        # Require authenticated session
        email = request.session.get('email')
        # --- FIX: Comment out the redirect to let JS handle it ---
        # if not email:
        #     return redirect('login')

        # Fetch user orders from MongoDB (even if no email, context empty and JS will redirect)
        orders = Order.objects.filter(email=email).order_by('-created_at') if email else []
        context['orders'] = list(orders) if orders else []
        context['email'] = email
    except Exception as e:
        print(f"Error fetching orders: {e}")

    return render(request, 'pages/customer/order-tracking.html', context)


# ==========================================
# ADMIN PAGES
# ==========================================

@ensure_csrf_cookie
def admin_login(request):
    """Render admin login page"""
    return render(request, 'pages/staff-admin/staff-login.html')


@ensure_csrf_cookie
def admin_signup(request):
    """Render admin signup page"""
    return render(request, 'pages/staff-admin/staff-signup.html')


@ensure_csrf_cookie
def admin_forgot_password(request):
    """Render admin forgot password page"""
    return render(request, 'pages/staff-admin/staff-forgot-password.html')


@ensure_csrf_cookie
def admin_reset_password(request):
    """Render admin reset password page"""
    return render(request, 'pages/staff-admin/staff-reset-password.html')


@ensure_csrf_cookie
def admin_dashboard(request):
    """Render admin dashboard page with admin data"""
    context = {}
    try:
        from django.contrib.auth import get_user_model
        # Fetch dashboard statistics from DB-backed orders
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()
        completed_orders = Order.objects.filter(status='paid').count()
        total_users = get_user_model().objects.count()

        # Fetch recent orders
        recent_orders = list(Order.objects.order_by('-created_at')[:10])

        context = {
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
            'total_users': total_users,
            'recent_orders': recent_orders
        }
    except Exception as e:
        print(f"Error fetching admin data: {e}")

    return render(request, 'pages/staff-admin/staff-dashboard.html', context)

@login_required
@user_passes_test(lambda u: u.is_staff or u.is_superuser)
@ensure_csrf_cookie
def admin_mongo_users(request):
    """Render admin page for MongoDB user management."""
    return render(request, 'pages/staff-admin/staff-mongo-users.html')
