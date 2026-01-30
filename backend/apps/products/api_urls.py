"""
API URL routing for authentication, payments, and OTP endpoints.
"""

from django.urls import path
from . import api_views

urlpatterns = [
    # OTP Endpoints
    path('send-otp-email/', api_views.send_otp_email, name='send_otp_email'),
    path('validate-otp/', api_views.validate_otp, name='validate_otp'),
    
    # Authentication Endpoints
    path('auth/login/', api_views.login, name='api_login'),
    path('auth/signup/', api_views.signup, name='api_signup'),
    path('auth/forgot-password/', api_views.forgot_password, name='api_forgot_password'),
    path('auth/reset-password/', api_views.reset_password, name='api_reset_password'),
    
    # Payment Endpoints
    path('payment/create-order/', api_views.create_order, name='create_order'),
    path('payment/verify-payment/', api_views.verify_payment, name='verify_payment'),
    path('payment/process-payment/', api_views.process_payment, name='process_payment'),
    
    # Data Endpoints
    path('orders/', api_views.get_orders, name='get_orders'),
    path('payments/', api_views.get_payments, name='get_payments'),
]
