# MongoDB Integration - Quick Reference

## Files Created/Modified

### New Files

1. **`backend/database/models.py`** (215 lines)
   - User class: find_by_email, create, update, get_by_id
   - OTP class: create, verify, get_latest
   - Order class: create, update_status, get_by_email, get_by_id
   - Payment class: create, update_status, get_by_email, get_by_razorpay_order_id

### Modified Files

1. **`backend/apps/products/api_views.py`** (+95 lines)
   - Added import: `from database.models import User, OTP, Order, Payment`
   - Added import: `import random` for OTP generation
   - Updated `send_otp_email()`: Now saves OTP to MongoDB
   - Updated `validate_otp()`: Now verifies OTP against MongoDB
   - Updated `signup()`: Now checks email existence, saves user to MongoDB
   - Updated `login()`: Now retrieves user from MongoDB
   - Updated `forgot_password()`: Now generates OTP, saves to MongoDB, checks user exists
   - Updated `reset_password()`: Now verifies OTP, updates password in MongoDB
   - Updated `create_order()`: Now saves order and payment to MongoDB
   - Updated `verify_payment()`: Now updates payment and order status in MongoDB
   - Updated `process_payment()`: Now saves payment and updates order in MongoDB
   - Added `get_orders()`: New endpoint to fetch user orders from MongoDB
   - Added `get_payments()`: New endpoint to fetch user payments from MongoDB

2. **`backend/apps/products/api_urls.py`** (+2 lines)
   - Added `path('orders/', api_views.get_orders, name='get_orders')`
   - Added `path('payments/', api_views.get_payments, name='get_payments')`

3. **`backend/apps/products/template_views.py`** (+50 lines)
   - Added import: `from database.models import Order, Payment`
   - Updated `customer_profile()`: Now passes orders context from MongoDB
   - Updated `order_tracking()`: Now passes orders context from MongoDB
   - Updated `admin_dashboard()`: Now shows stats and recent orders from MongoDB

---

## Database Collections

MongoDB database: `coffeekaafihai_db`

### Collections Created Automatically

1. **`users`** - User accounts
   - Fields: _id, firstName, lastName, email, phone, password, createdAt, updatedAt
   - Index: email (unique)

2. **`otps`** - One-time passwords for reset
   - Fields: _id, email, otp, createdAt, expiresAt, verified
   - Index: email, createdAt

3. **`orders`** - Customer orders
   - Fields: _id, email, items, totalAmount, status, createdAt, updatedAt
   - Index: email, createdAt

4. **`payments`** - Payment transactions
   - Fields: _id, orderId, email, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature, status, createdAt, updatedAt
   - Index: email, razorpayOrderId

---

## API Endpoints Summary

### Authentication (4 endpoints)
- `POST /api/auth/login/` - Checks credentials in MongoDB
- `POST /api/auth/signup/` - Creates user in MongoDB
- `POST /api/auth/forgot-password/` - Generates OTP, saves to MongoDB
- `POST /api/auth/reset-password/` - Validates OTP, updates password

### OTP (2 endpoints)
- `POST /api/send-otp-email/` - Creates OTP record in MongoDB
- `POST /api/validate-otp/` - Verifies OTP from MongoDB

### Payments (3 endpoints)
- `POST /api/payment/create-order/` - Creates order and payment in MongoDB
- `POST /api/payment/verify-payment/` - Updates payment status in MongoDB
- `POST /api/payment/process-payment/` - Creates payment record in MongoDB

### Data Retrieval (2 NEW endpoints)
- `GET /api/orders/?email=user@example.com` - Fetches orders from MongoDB
- `GET /api/payments/?email=user@example.com` - Fetches payments from MongoDB

---

## Usage Examples

### Create User
```python
from database.models import User

user_id = User.create(
    firstName="John",
    lastName="Doe",
    email="john@example.com",
    phone="9876543210",
    password_hash="hashed_password"
)
```

### Find User
```python
user = User.find_by_email("john@example.com")
```

### Create OTP
```python
from database.models import OTP

OTP.create(
    email="john@example.com",
    otp="123456",
    expiry_minutes=10
)
```

### Verify OTP
```python
is_valid = OTP.verify("john@example.com", "123456")
```

### Create Order
```python
from database.models import Order

order_id = Order.create(
    email="john@example.com",
    items=[{"name": "Coffee", "qty": 1, "price": 250}],
    total_amount=250,
    status="pending"
)
```

### Get Orders
```python
orders = Order.get_by_email("john@example.com")
```

### Create Payment
```python
from database.models import Payment

payment_id = Payment.create(
    order_id=order_id,
    email="john@example.com",
    amount=250,
    razorpay_order_id="order_123",
    status="pending"
)
```

---

## Variable Names Preserved

✅ No variable names changed
✅ No HTML structure modified
✅ No styling changed
✅ Minimal code additions

---

## Testing

Run Django checks:
```bash
python manage.py check
```

Import models:
```bash
python -c "from database.models import User, OTP, Order, Payment; print('OK')"
```

Test API endpoint:
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

Test data retrieval:
```bash
curl "http://localhost:8000/api/orders/?email=john@example.com"
```

---

## Key Design Decisions

1. **Minimal Code Addition**: Only essential MongoDB operations added
2. **Preserved Naming**: All variable names unchanged from original code
3. **Centralized Models**: All database operations in `database/models.py`
4. **Error Handling**: Try-except blocks on all endpoints
5. **No Encryption Yet**: TODO comments mark areas for bcrypt, JWT, email service
6. **ObjectId Handling**: Automatic conversion to string for JSON responses
7. **Timestamps**: Auto-added createdAt and updatedAt to documents
8. **Expiry Handling**: OTP automatically checks expiry on verification

---

## Integration Checklist

✅ MongoDB models created
✅ User authentication with database
✅ OTP management with expiry
✅ Order tracking
✅ Payment recording
✅ Data retrieval endpoints
✅ Template views with context
✅ Admin dashboard statistics
✅ Django checks passing
✅ Imports validated

---

## Next Steps (Optional Enhancements)

### Priority 1: Security
- [ ] Implement bcrypt for password hashing
  ```bash
  pip install bcrypt
  ```
- [ ] Add JWT token generation and validation
  ```bash
  pip install PyJWT
  ```

### Priority 2: Email
- [ ] Integrate SendGrid/AWS SES/Nodemailer for OTP delivery
- [ ] Add email templates

### Priority 3: Payments
- [ ] Implement Razorpay signature verification
- [ ] Add transaction logging

### Priority 4: Validation
- [ ] Add input validation (email format, password strength, phone)
- [ ] Add database constraints (unique indexes)
- [ ] Add error logging and monitoring

---

## Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Database Connection | ✅ | MongoDB running on localhost:27017 |
| Models | ✅ | User, OTP, Order, Payment |
| API Integration | ✅ | All 11 endpoints with MongoDB |
| Template Views | ✅ | Profile, tracking, admin dashboard |
| Variable Names | ✅ | All preserved |
| HTML Structure | ✅ | No changes |
| Django Checks | ✅ | Passing |
| Imports | ✅ | All working |
| Data Persistence | ✅ | MongoDB storing data |

---

## Support

For detailed documentation, see: `MONGODB_INTEGRATION.md`

All database operations are self-contained and require only the MongoDB connection to be available.
