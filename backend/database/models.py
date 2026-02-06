"""
MongoDB models and utilities for user, order, and payment data.
Provides minimal abstraction layer for common database operations.
"""

from database.mongo import get_database
from datetime import datetime, timedelta
from bson.objectid import ObjectId


class User:
    """User model for authentication and profile management"""
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        db = get_database()
        return db['users'].find_one({'email': email})
    
    @staticmethod
    def create(firstName, lastName, email, phone, password_hash):
        """Create new user"""
        db = get_database()
        user = {
            'firstName': firstName,
            'lastName': lastName,
            'email': email,
            'phone': phone,
            'password': password_hash,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        }
        result = db['users'].insert_one(user)
        return result.inserted_id
    
    @staticmethod
    def update(email, data):
        """Update user data"""
        db = get_database()
        db['users'].update_one(
            {'email': email},
            {'$set': {**data, 'updatedAt': datetime.now()}}
        )
    
    @staticmethod
    def get_by_id(user_id):
        """Get user by ID"""
        db = get_database()
        return db['users'].find_one({'_id': ObjectId(user_id)})


class OTP:
    """OTP model for password reset and verification"""
    
    @staticmethod
    def create(email, otp, expiry_minutes=10):
        """Create OTP record"""
        db = get_database()
        otp_record = {
            'email': email,
            'otp': str(otp),
            'createdAt': datetime.now(),
            'expiresAt': datetime.now() + timedelta(minutes=expiry_minutes),
            'verified': False
        }
        db['otps'].insert_one(otp_record)
    
    @staticmethod
    def verify(email, otp):
        """Verify OTP for email"""
        db = get_database()
        otp_record = db['otps'].find_one({
            'email': email,
            'otp': str(otp),
            'expiresAt': {'$gt': datetime.now()}
        })
        
        if otp_record:
            db['otps'].update_one({'_id': otp_record['_id']}, {'$set': {'verified': True}})
            return True
        return False
    
    @staticmethod
    def get_latest(email):
        """Get latest OTP for email"""
        db = get_database()
        return db['otps'].find_one(
            {'email': email},
            sort=[('createdAt', -1)]
        )


class Order:
    """Order model for order management"""
    
    @staticmethod
    def create(email, items, total_amount, status='pending', extra_fields=None):
        """Create new order"""
        db = get_database()
        order = {
            'email': email,
            'items': items,
            'totalAmount': total_amount,
            'status': status,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        }
        if isinstance(extra_fields, dict) and extra_fields:
            order.update(extra_fields)
        result = db['orders'].insert_one(order)
        return result.inserted_id
    
    @staticmethod
    def update_status(order_id, status):
        """Update order status"""
        db = get_database()
        db['orders'].update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'status': status, 'updatedAt': datetime.now()}}
        )
    
    @staticmethod
    def get_by_email(email):
        """Get all orders for user email"""
        db = get_database()
        return list(db['orders'].find({'email': email}).sort('createdAt', -1))
    
    @staticmethod
    def get_by_id(order_id):
        """Get order by ID"""
        db = get_database()
        return db['orders'].find_one({'_id': ObjectId(order_id)})


class Payment:
    """Payment model for transaction tracking"""
    
    @staticmethod
    def create(order_id, email, amount, razorpay_order_id, status='pending'):
        """Create payment record"""
        db = get_database()
        payment = {
            'orderId': order_id,
            'email': email,
            'amount': amount,
            'razorpayOrderId': razorpay_order_id,
            'status': status,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        }
        result = db['payments'].insert_one(payment)
        return result.inserted_id
    
    @staticmethod
    def update_status(payment_id, status, razorpay_payment_id=None, razorpay_signature=None):
        """Update payment status after verification"""
        db = get_database()
        update_data = {'status': status, 'updatedAt': datetime.now()}
        if razorpay_payment_id:
            update_data['razorpayPaymentId'] = razorpay_payment_id
        if razorpay_signature:
            update_data['razorpaySignature'] = razorpay_signature
        
        db['payments'].update_one(
            {'_id': ObjectId(payment_id)},
            {'$set': update_data}
        )
    
    @staticmethod
    def get_by_email(email):
        """Get all payments for user email"""
        db = get_database()
        return list(db['payments'].find({'email': email}).sort('createdAt', -1))
    
    @staticmethod
    def get_by_razorpay_order_id(razorpay_order_id):
        """Get payment by Razorpay order ID"""
        db = get_database()
        return db['payments'].find_one({'razorpayOrderId': razorpay_order_id})
