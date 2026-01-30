# Quick Reference: Running the Application

## 📋 Prerequisites
```bash
pip install django djangorestframework django-cors-headers pymongo
```

## 🚀 Starting the Server

```bash
cd backend
python manage.py migrate        # First time only (applies Django migrations)
python manage.py runserver      # Start server on http://127.0.0.1:8000/
```

## 🌐 Access Points

| URL | What Opens |
|-----|-----------|
| http://localhost:8000/ | Homepage |
| http://localhost:8000/login/ | Login Page |
| http://localhost:8000/signup/ | Signup Page |
| http://localhost:8000/admin-panel/ | Django Admin |

## 🔌 API Testing (cURL)

### Test OTP Endpoint
```bash
curl -X POST http://localhost:8000/api/send-otp-email/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### Test Payment Creation
```bash
curl -X POST http://localhost:8000/api/payment/create-order/ \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"currency":"INR","receipt":"order_123"}'
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/apps/products/template_views.py` | Renders HTML pages |
| `backend/apps/products/api_views.py` | API endpoints |
| `backend/config/urls.py` | URL routing |
| `backend/config/settings.py` | Django config |
| `frontend/pages/public/index.html` | Homepage |

## ✅ What Works

- ✅ Frontend pages render as HTML
- ✅ API endpoints respond with JSON
- ✅ CORS enabled for development
- ✅ Static files served (CSS, JS, images)

## ⚠️ What Still Needs Work

- Database storage (MongoDB integration)
- Password hashing
- JWT token generation
- Email sending (OTP delivery)
- Razorpay payment processing

## 📚 Full Documentation

See:
- `INTEGRATION_GUIDE.md` - Complete integration details
- `INTEGRATION_SUMMARY.md` - Changes made

---

**Server Status**: Ready for Phase 2 (Database Integration)
