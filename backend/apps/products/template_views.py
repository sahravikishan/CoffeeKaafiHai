"""
Template rendering views for serving HTML pages.
These views handle rendering frontend templates without adding business logic.
"""

from django.shortcuts import render
from django.http import JsonResponse
from database.models import Order, Payment


# ==========================================
# PUBLIC PAGES
# ==========================================

def index(request):
    """Render main landing/home page"""
    return render(request, 'pages/public/index.html')


def privacy_policy(request):
    """Render privacy policy page"""
    return render(request, 'pages/public/privacy-policy.html')


def terms_and_conditions(request):
    """Render terms and conditions page"""
    return render(request, 'pages/public/terms-conditions.html')


# ==========================================
# CUSTOMER PAGES
# ==========================================

def login(request):
    """Render customer login page"""
    return render(request, 'pages/customer/login.html')


def signup(request):
    """Render customer signup page"""
    return render(request, 'pages/customer/signup.html')


def forgot_password(request):
    """Render forgot password page"""
    return render(request, 'pages/customer/forgot-password.html')


def reset_password(request):
    """Render reset password page"""
    return render(request, 'pages/customer/reset-password.html')


def customer_profile(request):
    """Render customer profile page with user data"""
    context = {}
    try:
        # Get email from session or request parameter
        email = request.session.get('email') or request.GET.get('email')
        if email:
            # Fetch user orders from MongoDB
            orders = Order.get_by_email(email)
            context['orders'] = orders
            context['email'] = email
    except Exception as e:
        print(f"Error fetching profile data: {e}")
    
    return render(request, 'pages/customer/profile.html', context)


def order_tracking(request):
    """Render order tracking page with orders data"""
    context = {}
    try:
        # Get email from session or request parameter
        email = request.session.get('email') or request.GET.get('email')
        if email:
            # Fetch user orders from MongoDB
            orders = Order.get_by_email(email)
            context['orders'] = orders
            context['email'] = email
    except Exception as e:
        print(f"Error fetching orders: {e}")
    
    return render(request, 'pages/customer/order-tracking.html', context)


# ==========================================
# ADMIN PAGES
# ==========================================

def admin_login(request):
    """Render admin login page"""
    return render(request, 'pages/admin/admin-login.html')


def admin_signup(request):
    """Render admin signup page"""
    return render(request, 'pages/admin/admin-signup.html')


def admin_forgot_password(request):
    """Render admin forgot password page"""
    return render(request, 'pages/admin/admin-forgot-password.html')


def admin_reset_password(request):
    """Render admin reset password page"""
    return render(request, 'pages/admin/admin-reset-password.html')


def admin_dashboard(request):
    """Render admin dashboard page with admin data"""
    context = {}
    try:
        from database.mongo import get_database
        db = get_database()
        
        # Fetch dashboard statistics
        total_orders = db['orders'].count_documents({})
        pending_orders = db['orders'].count_documents({'status': 'pending'})
        completed_orders = db['orders'].count_documents({'status': 'paid'})
        total_users = db['users'].count_documents({})
        
        # Fetch recent orders
        recent_orders = list(db['orders'].find({}).sort('createdAt', -1).limit(10))
        
        context = {
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
            'total_users': total_users,
            'recent_orders': recent_orders
        }
    except Exception as e:
        print(f"Error fetching admin data: {e}")
    
    return render(request, 'pages/admin/admin-dashboard.html', context)
