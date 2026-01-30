# How to Test the Integration

## Verify Everything is Working

### Option 1: Automated Health Check (Recommended - 30 seconds)

```bash
cd c:\Users\Hp\DjangoProjects\CoffeeKaafiHai
python health_check.py
```

**Expected Output:**
```
✅ MongoDB Connection
✅ Database Models
✅ Signup Endpoint (status 201)
✅ Login Endpoint (status 200)
✅ Frontend Integration (script, CSRF, handler)
✅ JavaScript Module (all functions present)

Status: 6/6 components healthy

✅ INTEGRATION IS FULLY OPERATIONAL
```

---

### Option 2: Full Integration Test (1 minute)

```bash
python test_integration.py
```

**Expected Output:**
```
[STEP 1] Cleaning test data from MongoDB...
✅ Test data cleaned

[STEP 2] Testing Signup Endpoint...
✅ Signup endpoint working correctly

[STEP 3] Verifying User Created in MongoDB...
✅ User successfully stored in MongoDB

[STEP 4] Testing Login Endpoint...
✅ Login endpoint working correctly

[STEP 5] Testing Invalid Login (negative test)...
✅ Error handling working correctly

[STEP 6] Verifying Frontend Integration Points...
✅ auth-api-integration.js loaded
✅ CSRF meta tag present
✅ handleSignup called

[STEP 7] Verifying JavaScript API Module...
✅ handleSignup function
✅ handleLogin function
✅ apiRequest function
✅ getCSRFToken function
✅ API_BASE_URL defined
✅ window.authAPI exported

✅ ALL TESTS PASSED - END-TO-END INTEGRATION WORKING
```

---

### Option 3: All Endpoints Test (2 minutes)

```bash
python test_all_endpoints.py
```

**Expected Output:**
```
[1/10] POST /api/auth/signup/          Status: 201 ✅
[2/10] POST /api/auth/login/           Status: 200 ✅
[3/10] POST /api/auth/forgot-password/ Status: 200 ✅
[4/10] POST /api/validate-otp/         Status: 400 ✅
[5/10] POST /api/auth/reset-password/  Status: 400 ✅
[6/10] POST /api/payment/create-order/ Status: 200 ✅
[7/10] POST /api/payment/verify-pment/ Status: 400 ✅
[8/10] GET /api/orders/                Status: 200 ✅
[9/10] GET /api/payments/              Status: 200 ✅
[10/10] POST /api/send-otp-email/      Status: 200 ✅

Endpoints Working: 10/10

✅ ALL ENDPOINTS VERIFIED AND WORKING
```

---

### Option 4: Manual Browser Testing (5 minutes)

#### Step 1: Start Django Server
```bash
cd c:\Users\Hp\DjangoProjects\CoffeeKaafiHai\backend
python manage.py runserver 8000
```

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
```

#### Step 2: Test Signup
1. Open browser: `http://localhost:8000/signup/`
2. Fill form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Phone: `9876543210`
   - Password: `password123`
   - Agree to terms: ✓
3. Click "Sign Up"

**Expected Result:**
- Form submits
- No errors in console
- Success toast shows: "Account created successfully!"
- Page redirects to login.html after 2 seconds

#### Step 3: Test Login
1. On login page, enter:
   - Email: `john@example.com`
   - Password: `password123`
2. Click "Sign In"

**Expected Result:**
- Form submits
- No errors in console
- Success toast shows: "Login successful"
- Page may redirect or show dashboard

#### Step 4: Check Network Traffic
1. Open DevTools: F12
2. Go to Network tab
3. Refresh page
4. Click signup/login button
5. In Network tab, look for:
   - `POST auth/signup/` - Status 201
   - `POST auth/login/` - Status 200

**Expected:**
- POST requests appear
- Status codes are 201/200
- Response has `accessToken`
- Response has user data

#### Step 5: Check Browser Storage
1. Open DevTools: F12
2. Go to Application tab
3. Click Local Storage
4. Click `http://localhost:8000`
5. Look for keys: `accessToken`, `refreshToken`, `userEmail`

**Expected:**
- After signup/login, these keys should exist
- Values should contain the tokens

---

## Troubleshooting

### If tests fail, check:

#### 1. MongoDB Running?
```bash
mongosh
# or
mongo
```

Should connect without error.

#### 2. Django Check?
```bash
cd c:\Users\Hp\DjangoProjects\CoffeeKaafiHai\backend
python manage.py check
```

Should show: `System check identified no issues (0 silenced).`

#### 3. Python Imports?
```bash
python -c "from database.models import User; print('OK')"
```

Should print: `OK`

#### 4. JavaScript File Exists?
```bash
ls frontend/js/auth-api-integration.js
```

Should exist (no error).

#### 5. HTML Has Script Tag?
```bash
grep "auth-api-integration.js" frontend/pages/customer/signup.html
```

Should find the line with the script tag.

---

## Common Issues & Solutions

### Issue: "MongoDB connection refused"
**Solution:** Start MongoDB
```bash
mongod
```

### Issue: "Module not found: database.models"
**Solution:** Make sure you're in the backend directory
```bash
cd backend
```

### Issue: "CSRF token missing" in JavaScript console
**Solution:** This is OK - token is retrieved from cookie/meta tag automatically

### Issue: "No module named 'pymongo'"
**Solution:** Install pymongo
```bash
pip install pymongo
```

### Issue: API returns 400 error
**Solution:** Check the request payload matches backend expectations:
- Signup needs: firstName, lastName, email, phone, password
- Login needs: email, password
- create_order needs: amount, currency, receipt, email, items

### Issue: "Page shows form but no API calls made"
**Solution:** Check:
1. Is auth-api-integration.js loaded? (Check Network tab)
2. Is form calling authAPI function? (Check console)
3. Any JavaScript errors? (Check console for red errors)

---

## Verification Checklist

Use this to verify the integration is working:

- [ ] Run `python health_check.py` - all 6 components pass
- [ ] Run `python test_integration.py` - all tests pass
- [ ] Run `python test_all_endpoints.py` - all 10 endpoints work
- [ ] Start Django and open http://localhost:8000/signup/
- [ ] Fill signup form and submit
- [ ] See success message (no errors)
- [ ] Open DevTools Network tab
- [ ] See POST request to `auth/signup/`
- [ ] Response status is 201
- [ ] Response has `accessToken`
- [ ] Open Application tab
- [ ] Check localStorage has `accessToken`
- [ ] Try login with same credentials
- [ ] See success message
- [ ] Try invalid password
- [ ] See error message "Invalid email or password"

---

## What Each Test Does

| Test | What It Tests | Time |
|------|---------------|------|
| health_check.py | 6 components check | 30s |
| test_integration.py | Full signup/login flow | 1m |
| test_all_endpoints.py | All 10 API endpoints | 2m |
| Manual browser test | Real user experience | 5m |

---

## Success Indicators

### At the Code Level
✅ No exceptions in Python
✅ MongoDB stores documents
✅ Django returns correct status codes
✅ JSON responses are valid

### At the Browser Level
✅ Form submits without page reload
✅ Success/error toast messages appear
✅ Page redirects after success
✅ No red errors in console
✅ Network tab shows POST requests
✅ Tokens appear in localStorage

### At the Database Level
✅ User documents appear in users collection
✅ `_id`, `firstName`, `lastName`, `email` fields exist
✅ `createdAt` and `updatedAt` timestamps present
✅ `password` field contains the value

---

## Integration Points Being Tested

```
✅ HTML → JavaScript (forms load scripts, call functions)
✅ JavaScript → Django (fetch requests reach endpoints)
✅ Django → MongoDB (data gets saved)
✅ MongoDB → Django (data gets retrieved)
✅ Django → JavaScript (JSON responses)
✅ JavaScript → UI (messages display, tokens stored)
```

Each test verifies one or more of these points.

---

## Next Steps If Something Is Wrong

1. **Run health_check.py** to identify which component failed
2. **Check the error message** - it tells you what's wrong
3. **Look at the relevant file** in the error message
4. **Fix the issue** (or contact support)
5. **Re-run the test** to verify fix

---

## Questions to Ask When Debugging

- Is MongoDB running?
- Is Django running?
- Are there Python errors in the console?
- Are there JavaScript errors in the browser?
- Do the network requests show up?
- Is the response status code correct?
- Does the response contain the expected fields?
- Are tokens being stored in localStorage?

---

**Remember:** If all tests pass, the integration is working correctly. No code changes needed!
