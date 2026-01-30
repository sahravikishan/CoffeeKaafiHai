"""
URL routing for products and API endpoints (authentication, payments, OTP).
"""

from django.urls import path
from . import views

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
    path('auth/forgot-password/', views.forgot_password, name='api_forgot_password'),
    path('auth/reset-password/', views.reset_password, name='api_reset_password'),
    
    # Payment Endpoints
    path('payment/create-order/', views.create_order, name='create_order'),
    path('payment/verify-payment/', views.verify_payment, name='verify_payment'),
    path('payment/process-payment/', views.process_payment, name='process_payment'),
    
    # Data Endpoints
    path('orders/', views.get_orders, name='get_orders'),
    path('payments/', views.get_payments, name='get_payments'),
]
