"""
URL routing for products and API endpoints (authentication, payments, OTP).
"""

from django.urls import path
from . import views, password_reset_views

urlpatterns = [
    # Product Endpoints
    path('products/', views.product_list),
    
    # OTP Endpoints
    path('send-otp-email/', views.send_otp_email, name='send_otp_email'),
    path('validate-otp/', views.validate_otp, name='validate_otp'),
    
    # Authentication Endpoints
    path('auth/login/', views.login, name='api_login'),
    path('auth/signup/', views.signup, name='api_signup'),
    path('auth/logout/', views.logout, name='api_logout'),
    path('auth/profile/', views.profile, name='api_profile'),
    path('auth/forgot-password/', views.forgot_password, name='api_forgot_password'),
    path('auth/reset-password/', views.reset_password, name='api_reset_password'),
    # Django User password reset (email OTP)
    path('auth/password/forgot/', password_reset_views.forgot_password, name='api_password_forgot'),
    path('auth/password/verify-otp/', password_reset_views.verify_otp, name='api_password_verify_otp'),
    path('auth/password/reset/', password_reset_views.reset_password, name='api_password_reset'),
    
    # Admin Mongo User Management
    path('admin/mongo-users/', views.admin_mongo_users, name='admin_mongo_users'),
    path('admin/mongo-users/<str:email>/', views.admin_mongo_user_detail, name='admin_mongo_user_detail'),

    # Payment Endpoints
    path('payment/create-order/', views.create_order, name='create_order'),
    path('payment/verify-payment/', views.verify_payment, name='verify_payment'),
    path('payment/process-payment/', views.process_payment, name='process_payment'),
    
    # Data Endpoints
    path('orders/', views.get_orders, name='get_orders'),
    path('payments/', views.get_payments, name='get_payments'),
    path('notifications/', views.notifications_list, name='notifications_list'),
    path('notifications/broadcast/', views.broadcast_notification, name='broadcast_notification'),
    
]
