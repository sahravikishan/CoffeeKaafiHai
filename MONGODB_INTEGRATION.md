# MongoDB Integration Documentation

## Overview

MongoDB operations have been integrated into the CoffeeKaafiHai backend to provide persistent data storage for users, orders, payments, and OTPs.

---

## Database Models

### Located: `backend/database/models.py`

Four main models handle all database operations:

#### 1. User Model
**Purpose:** Manage user accounts and authentication

**Methods:**
- `User.find_by_email(email)` - Find user by email address
- `User.create(firstName, lastName, email, phone, password_hash)` - Create new user
- `User.update(email, data)` - Update user information
- `User.get_by_id(user_id)` - Get user by MongoDB ObjectId

**Collections Used:** `users`

**Document Structure:**
```json
{
    "_id": ObjectId,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "hashed_password",
    "createdAt": "2026-01-30T10:00:00",
    "updatedAt": "2026-01-30T10:00:00"
}
```

---

#### 2. OTP Model
**Purpose:** Manage one-time passwords for password reset

**Methods:**
- `OTP.create(email, otp, expiry_minutes=10)` - Create OTP record
- `OTP.verify(email, otp)` - Verify OTP (checks expiry and marks as verified)
- `OTP.get_latest(email)` - Get most recent OTP for email

**Collections Used:** `otps`

**Document Structure:**
```json
{
    "_id": ObjectId,
    "email": "user@example.com",
    "otp": "123456",
    "createdAt": "2026-01-30T10:00:00",
    "expiresAt": "2026-01-30T10:10:00",
    "verified": false
}
```

---

#### 3. Order Model
**Purpose:** Track customer orders

**Methods:**
- `Order.create(email, items, total_amount, status='pending')` - Create new order
- `Order.update_status(order_id, status)` - Update order status
- `Order.get_by_email(email)` - Get all orders for a user
- `Order.get_by_id(order_id)` - Get specific order

**Collections Used:** `orders`

**Document Structure:**
```json
{
    "_id": ObjectId,
    "email": "user@example.com",
    "items": [
        {
            "name": "Cappuccino",
            "quantity": 2,
            "price": 250
        }
    ],
    "totalAmount": 500,
    "status": "pending",
    "createdAt": "2026-01-30T10:00:00",
    "updatedAt": "2026-01-30T10:00:00"
}
```

**Status Values:** `pending`, `processing`, `paid`, `completed`, `cancelled`

---

#### 4. Payment Model
**Purpose:** Track payment transactions

**Methods:**
- `Payment.create(order_id, email, amount, razorpay_order_id, status='pending')` - Create payment record
- `Payment.update_status(payment_id, status, razorpay_payment_id, razorpay_signature)` - Update payment status
- `Payment.get_by_email(email)` - Get all payments for a user
- `Payment.get_by_razorpay_order_id(razorpay_order_id)` - Find payment by Razorpay order ID

**Collections Used:** `payments`

**Document Structure:**
```json
{
    "_id": ObjectId,
    "orderId": "ObjectId",
    "email": "user@example.com",
    "amount": 500,
    "razorpayOrderId": "order_123456",
    "razorpayPaymentId": "pay_123456",
    "razorpaySignature": "signature_hash",
    "status": "pending",
    "createdAt": "2026-01-30T10:00:00",
    "updatedAt": "2026-01-30T10:00:00"
}
```

**Status Values:** `pending`, `processing`, `verified`, `completed`, `failed`

---

## API Endpoints with MongoDB Integration

### Authentication Endpoints

#### POST `/api/auth/signup/`
Creates new user account and saves to MongoDB

**Request:**
```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123"
}
```

**MongoDB Operation:**
```python
User.find_by_email(email)  # Check if exists
User.create(firstName, lastName, email, phone, password_hash)  # Save to users collection
```

**Response:**
```json
{
    "message": "Account created successfully",
    "accessToken": "token_for_john@example.com",
    "user": {
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
    }
}
```

---

#### POST `/api/auth/login/`
Authenticates user against MongoDB records

**Request:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**MongoDB Operation:**
```python
User.find_by_email(email)  # Retrieve user
# Verify password (currently plaintext, TODO: use bcrypt)
```

**Response:**
```json
{
    "message": "Login successful",
    "accessToken": "token_for_john@example.com",
    "user": {
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
    }
}
```

---

#### POST `/api/auth/forgot-password/`
Generates OTP and saves to MongoDB

**Request:**
```json
{
    "email": "john@example.com"
}
```

**MongoDB Operation:**
```python
User.find_by_email(email)  # Check if user exists
OTP.create(email, otp, expiry_minutes=10)  # Save to otps collection
```

---

#### POST `/api/auth/reset-password/`
Validates OTP and updates password in MongoDB

**Request:**
```json
{
    "email": "john@example.com",
    "otp": "123456",
    "newPassword": "newpassword123"
}
```

**MongoDB Operation:**
```python
OTP.verify(email, otp)  # Check OTP validity and expiry
User.update(email, {'password': password_hash})  # Update users collection
```

---

### OTP Endpoints

#### POST `/api/send-otp-email/`
Saves OTP to MongoDB

**Request:**
```json
{
    "email": "user@example.com",
    "otp": "123456"
}
```

**MongoDB Operation:**
```python
OTP.create(email, otp, expiry_minutes=10)
```

---

#### POST `/api/validate-otp/`
Validates OTP from MongoDB

**Request:**
```json
{
    "email": "user@example.com",
    "otp": "123456"
}
```

**MongoDB Operation:**
```python
OTP.verify(email, otp)  # Checks expiry and marks as verified
```

---

### Payment Endpoints

#### POST `/api/payment/create-order/`
Creates order and payment records in MongoDB

**Request:**
```json
{
    "amount": 500,
    "currency": "INR",
    "receipt": "order_abc123",
    "email": "user@example.com",
    "items": [{"name": "Coffee", "qty": 1, "price": 500}]
}
```

**MongoDB Operation:**
```python
Order.create(email, items, amount, status='pending')  # Save to orders collection
Payment.create(order_id, email, amount, razorpay_order_id, status='pending')  # Save to payments collection
```

---

#### POST `/api/payment/verify-payment/`
Updates payment and order status after Razorpay verification

**Request:**
```json
{
    "razorpay_order_id": "order_123",
    "razorpay_payment_id": "pay_123",
    "razorpay_signature": "signature_hash",
    "email": "user@example.com"
}
```

**MongoDB Operation:**
```python
Payment.get_by_razorpay_order_id(razorpay_order_id)  # Find payment record
Payment.update_status(payment_id, 'verified', payment_id, signature)  # Update payment
Order.update_status(order_id, 'paid')  # Update order status
```

---

#### POST `/api/payment/process-payment/`
Creates payment record for direct processing

**Request:**
```json
{
    "amount": 500,
    "method": "razorpay",
    "email": "user@example.com",
    "orderId": "order_123"
}
```

**MongoDB Operation:**
```python
Payment.create(order_id, email, amount, '', status='processing')
Order.update_status(order_id, 'processing')
```

---

### Data Endpoints

#### GET `/api/orders/?email=user@example.com`
Fetches all orders for a user from MongoDB

**MongoDB Operation:**
```python
Order.get_by_email(email)  # Retrieve from orders collection
```

**Response:**
```json
{
    "success": true,
    "orders": [
        {
            "_id": "507f1f77bcf86cd799439011",
            "email": "user@example.com",
            "items": [...],
            "totalAmount": 500,
            "status": "paid",
            "createdAt": "2026-01-30T10:00:00"
        }
    ],
    "total": 1
}
```

---

#### GET `/api/payments/?email=user@example.com`
Fetches all payments for a user from MongoDB

**MongoDB Operation:**
```python
Payment.get_by_email(email)  # Retrieve from payments collection
```

**Response:**
```json
{
    "success": true,
    "payments": [
        {
            "_id": "507f1f77bcf86cd799439012",
            "email": "user@example.com",
            "amount": 500,
            "razorpayOrderId": "order_123",
            "status": "verified",
            "createdAt": "2026-01-30T10:00:00"
        }
    ],
    "total": 1
}
```

---

## Template Views with MongoDB Integration

### Pages Serving Data Context

#### `/profile/` - Customer Profile
**View:** `customer_profile(request)`

**MongoDB Operation:**
```python
email = request.session.get('email')
orders = Order.get_by_email(email)  # Fetch user's orders
```

**Context Passed to Template:**
```python
{
    'orders': [...],
    'email': 'user@example.com'
}
```

---

#### `/order-tracking/` - Order Tracking
**View:** `order_tracking(request)`

**MongoDB Operation:**
```python
email = request.session.get('email')
orders = Order.get_by_email(email)  # Fetch user's orders
```

**Context Passed to Template:**
```python
{
    'orders': [...],
    'email': 'user@example.com'
}
```

---

#### `/admin/dashboard/` - Admin Dashboard
**View:** `admin_dashboard(request)`

**MongoDB Operations:**
```python
db['orders'].count_documents({})  # Total orders
db['orders'].count_documents({'status': 'pending'})  # Pending
db['orders'].count_documents({'status': 'paid'})  # Completed
db['users'].count_documents({})  # Total users
db['orders'].find({}).sort('createdAt', -1).limit(10)  # Recent orders
```

**Context Passed to Template:**
```python
{
    'total_orders': 15,
    'pending_orders': 3,
    'completed_orders': 12,
    'total_users': 8,
    'recent_orders': [...]
}
```

---

## MongoDB Connection

**File:** `backend/database/mongo.py`

```python
from pymongo import MongoClient

def get_database():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["coffeekaafihai_db"]
    return db
```

**Database Name:** `coffeekaafihai_db`
**Collections:** `users`, `otps`, `orders`, `payments`

---

## Import Usage

To use MongoDB models in any view or API endpoint:

```python
from database.models import User, OTP, Order, Payment

# Create user
user_id = User.create("John", "Doe", "john@example.com", "9876543210", "hashed_password")

# Find user
user = User.find_by_email("john@example.com")

# Create order
order_id = Order.create("john@example.com", items, 500, status='pending')

# Get user orders
orders = Order.get_by_email("john@example.com")

# Create payment
payment_id = Payment.create(order_id, "john@example.com", 500, "razorpay_order_id")

# Verify OTP
is_valid = OTP.verify("john@example.com", "123456")
```

---

## TODO: Next Steps for Full Integration

1. **Password Hashing:** Implement bcrypt for secure password storage
   ```bash
   pip install bcrypt
   ```

2. **JWT Tokens:** Generate and validate JWT tokens for authentication
   ```bash
   pip install PyJWT
   ```

3. **Email Service:** Implement email service for OTP delivery
   - SendGrid, AWS SES, or Nodemailer integration
   - Refer to `frontend/js/auth-backend-setup.js` for examples

4. **Razorpay Integration:** Implement Razorpay SDK for payment verification
   ```bash
   pip install razorpay
   ```

5. **Input Validation:** Add comprehensive validation for all endpoints
   ```bash
   pip install django-rest-framework
   ```

6. **Error Handling:** Improve error messages and logging

---

## Testing MongoDB Integration

### Test User Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123"
  }'
```

### Test User Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Test Forgot Password (Generate OTP)
```bash
curl -X POST http://localhost:8000/api/auth/forgot-password/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### Test Get Orders
```bash
curl "http://localhost:8000/api/orders/?email=john@example.com"
```

### Test Create Order
```bash
curl -X POST http://localhost:8000/api/payment/create-order/ \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "currency": "INR",
    "receipt": "order_123",
    "email": "john@example.com",
    "items": [{"name": "Coffee", "qty": 1, "price": 500}]
  }'
```

---

## Checklist

✅ MongoDB models created with User, OTP, Order, Payment classes
✅ API endpoints integrated with MongoDB operations
✅ Template views updated to fetch data from MongoDB
✅ OTP creation and verification
✅ User signup and login with database checks
✅ Order creation and status tracking
✅ Payment creation and verification
✅ Data retrieval endpoints for orders and payments
✅ Admin dashboard with statistics
✅ All variable names preserved
✅ Minimal code additions to existing structure

---

## Configuration Status

| Component | Status | Notes |
|-----------|--------|-------|
| MongoDB Connection | ✅ Active | Configured in `database/mongo.py` |
| User Model | ✅ Integrated | 4 methods for CRUD operations |
| OTP Model | ✅ Integrated | Expiry validation and verification |
| Order Model | ✅ Integrated | Status tracking and retrieval |
| Payment Model | ✅ Integrated | Razorpay integration ready |
| API Endpoints | ✅ Integrated | 9 endpoints + 2 data endpoints |
| Template Views | ✅ Integrated | Profile, tracking, admin dashboard |
| Email Service | ⏳ Pending | Requires SendGrid/AWS SES/Nodemailer setup |
| Password Hashing | ⏳ Pending | Requires bcrypt implementation |
| JWT Tokens | ⏳ Pending | Requires PyJWT implementation |
| Razorpay SDK | ⏳ Pending | Requires signature verification |

---

## Summary

MongoDB integration is complete and minimal. All database operations use existing models without modifying variable names or HTML structure. The backend now:

- Saves and retrieves user accounts
- Manages OTP for password reset
- Tracks orders and their status
- Records payment transactions
- Provides data endpoints for frontend consumption
- Displays admin statistics

The system is ready for email service, password hashing, and payment gateway integration to be added independently.
