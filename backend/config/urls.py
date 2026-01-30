from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include, re_path
from django.views.static import serve
from django.shortcuts import redirect
from pathlib import Path
import os
from apps.products.template_views import (
    index, privacy_policy, terms_and_conditions,
    login, signup, forgot_password, reset_password,
    customer_profile, order_tracking,
    admin_login, admin_signup, admin_forgot_password,
    admin_reset_password, admin_dashboard
)

# Base directory of the project (parent of `backend`)
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_ROOT = str(BASE_DIR.parent / 'frontend')

urlpatterns = [
    path('', index, name='home'),                           # Root: render index.html
    path('admin-panel/', admin.site.urls),                   # Django admin (different path to avoid conflicts)
    
    # API Routes (now consolidated from api_urls)
    path('api/', include('apps.products.urls')),        # All API endpoints (auth, payments, OTP, products)
    
    # Public Pages
    path('privacy-policy/', privacy_policy, name='privacy_policy'),
    path('terms-conditions/', terms_and_conditions, name='terms_conditions'),
    
    # Customer Auth Pages
    path('login/', login, name='login'),
    # Redirect any direct file access to the canonical Django route
    path('login/index.html', lambda req: redirect('login')),
    path('login.html', lambda req: redirect('login')),
    path('signup.html', lambda req: redirect('signup')),
    path('signup/index.html', lambda req: redirect('signup')),
    path('forgot-password.html', lambda req: redirect('forgot_password')),
    path('reset-password.html', lambda req: redirect('reset_password')),
    path('profile.html', lambda req: redirect('profile')),
    path('order-tracking.html', lambda req: redirect('order_tracking')),
    path('index.html', lambda req: redirect('home')),
    path('signup/', signup, name='signup'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('reset-password/', reset_password, name='reset_password'),
    
    # Customer Pages
    path('profile/', customer_profile, name='profile'),
    path('order-tracking/', order_tracking, name='order_tracking'),
    
    # Admin Auth Pages
    path('admin/login/', admin_login, name='admin_login'),
    path('admin/signup/', admin_signup, name='admin_signup'),
    path('admin/forgot-password/', admin_forgot_password, name='admin_forgot_password'),
    path('admin/reset-password/', admin_reset_password, name='admin_reset_password'),
    path('admin/dashboard/', admin_dashboard, name='admin_dashboard'),
    # Redirect direct admin HTML access to canonical admin routes
    path('admin-login.html', lambda req: redirect('admin_login')),
    path('admin-signup.html', lambda req: redirect('admin_signup')),
    path('admin-forgot-password.html', lambda req: redirect('admin_forgot_password')),
    path('admin-reset-password.html', lambda req: redirect('admin_reset_password')),
    path('admin-dashboard.html', lambda req: redirect('admin_dashboard')),
    
    # Development-only: serve frontend static files (CSS/JS/images) from the frontend folder
    # This fallback will serve files like js/, css/, images/, etc.
    re_path(r'^(?P<path>.*)$', serve, {
        'document_root': FRONTEND_ROOT,
        'show_indexes': False
    }),
]
