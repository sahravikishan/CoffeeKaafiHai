import json
from decimal import Decimal
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings

from .models import Notification, Order, Payment, UserProfile


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    DEFAULT_FROM_EMAIL='noreply@coffeekaafihai.test',
)
class NotificationEmailFlowTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username='customer@example.com',
            email='customer@example.com',
            password='StrongPass123!',
        )
        UserProfile.objects.create(
            user=self.user,
            email=self.user.email,
            coffee_preferences={},
        )

    def test_password_forgot_sends_otp_email_with_shared_template(self):
        response = self.client.post(
            '/api/auth/password/forgot/',
            data=json.dumps({'email': self.user.email}),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Your Password Reset OTP')
        self.assertIn('CoffeeKaafiHai', mail.outbox[0].alternatives[0][0])
        self.assertIn('Your OTP Code', mail.outbox[0].alternatives[0][0])

    def test_legacy_send_otp_endpoint_sends_real_email(self):
        response = self.client.post(
            '/api/send-otp-email/',
            data=json.dumps({'email': self.user.email, 'otp': '123456'}),
            content_type='application/json',
        )

        body = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(body.get('success'))
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Your Password Reset OTP')
        self.assertIn('CoffeeKaafiHai', mail.outbox[0].alternatives[0][0])

    def test_order_status_update_sends_notification_email(self):
        order = Order.objects.create(
            user=self.user,
            email=self.user.email,
            items=[{'name': 'Americano', 'qty': 1}],
            total_amount=Decimal('120.00'),
            status='pending',
            extra_fields={'clientOrderId': 'CKH-1001'},
        )
        self.client.force_login(self.user)

        response = self.client.post(
            '/api/orders/',
            data=json.dumps({
                'action': 'update_status',
                'orderId': order.id,
                'status': 'ready',
            }),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get('success'))
        order.refresh_from_db()
        self.assertEqual(order.status, 'ready')

        email_notification = Notification.objects.filter(
            email=self.user.email,
            channel='email',
            event='order_status_update',
        ).order_by('-id').first()
        self.assertIsNotNone(email_notification)
        self.assertEqual(email_notification.status, 'sent')
        self.assertEqual(email_notification.payload.get('status'), 'ready')
        self.assertEqual(len(mail.outbox), 1)

    def test_payment_verify_sends_paid_status_email(self):
        order = Order.objects.create(
            user=self.user,
            email=self.user.email,
            items=[{'name': 'Latte', 'qty': 1}],
            total_amount=Decimal('220.00'),
            status='pending',
            extra_fields={'clientOrderId': 'CKH-2001'},
        )
        Payment.objects.create(
            user=self.user,
            order=order,
            email=self.user.email,
            amount=Decimal('220.00'),
            razorpay_order_id='order_test_2001',
            status='pending',
        )

        mock_client = Mock()
        mock_client.utility.verify_payment_signature.return_value = None

        with patch('apps.products.views._get_razorpay_client', return_value=mock_client):
            response = self.client.post(
                '/api/payment/verify-payment/',
                data=json.dumps({
                    'razorpay_order_id': 'order_test_2001',
                    'razorpay_payment_id': 'pay_test_2001',
                    'razorpay_signature': 'sig_test_2001',
                    'email': self.user.email,
                }),
                content_type='application/json',
            )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get('verified'))
        order.refresh_from_db()
        self.assertEqual(order.status, 'paid')

        email_notification = Notification.objects.filter(
            email=self.user.email,
            channel='email',
            event='order_status_update',
        ).order_by('-id').first()
        self.assertIsNotNone(email_notification)
        self.assertEqual(email_notification.status, 'sent')
        self.assertEqual(email_notification.payload.get('status'), 'paid')
        self.assertEqual(len(mail.outbox), 1)
