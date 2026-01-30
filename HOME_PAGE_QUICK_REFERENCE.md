# Home Page Backend Implementation - Quick Reference

## Summary
The home page now has proper backend logic that:
- Fetches user data from MongoDB when user is authenticated
- Handles both guest and authenticated users gracefully
- Manages sessions for server-side authentication
- Provides a logout endpoint
- Fails gracefully without breaking the UI

## Frontend Integration

### How to Pass User Email to Home Page
The frontend needs to send the user's email as a query parameter when navigating to the home page:

```javascript
// After user logs in successfully
const userEmail = localStorage.getItem('userEmail');

// Navigate to home page with email
window.location.href = `/?email=${encodeURIComponent(userEmail)}`;
```

### Using User Data in Templates
In the HTML template, access user data like this:

```html
{% if is_authenticated %}
    <!-- User is authenticated -->
    <p>Welcome, {{ user.firstName }} {{ user.lastName }}</p>
    <p>Email: {{ user.email }}</p>
    <p>Phone: {{ user.phone }}</p>
    
    <!-- Show recent orders if available -->
    {% if user_orders %}
        <ul>
        {% for order in user_orders %}
            <li>Order ID: {{ order._id }} - Total: {{ order.totalAmount }}</li>
        {% endfor %}
        </ul>
    {% endif %}
{% else %}
    <!-- User is not authenticated (guest) -->
    <p>Welcome, Guest!</p>
{% endif %}
```

## API Endpoints

### 1. Login - Sets Session
**Endpoint:** `POST /api/auth/login/`

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "message": "Login successful",
    "accessToken": "token_for_user@example.com",
    "refreshToken": "refresh_token_for_user@example.com",
    "user": {
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
    }
}
```

**Side Effect:** Django session is automatically set on the server

### 2. Signup - Sets Session
**Endpoint:** `POST /api/auth/signup/`

**Request Body:**
```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123"
}
```

**Response:**
```json
{
    "message": "Account created successfully",
    "accessToken": "token_for_john@example.com",
    "refreshToken": "refresh_token_for_john@example.com",
    "user": {
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
    }
}
```

**Side Effect:** Django session is automatically set after user creation

### 3. Logout - Clears Session
**Endpoint:** `POST /api/auth/logout/`

**Request Body:** (empty)

**Response:**
```json
{
    "message": "Logout successful"
}
```

**Side Effect:** Django session is cleared

## Context Variables Available in Template

| Variable | Type | Description |
|----------|------|-------------|
| `is_authenticated` | Boolean | True if user is valid and authenticated |
| `user.email` | String | User's email address |
| `user.firstName` | String | User's first name |
| `user.lastName` | String | User's last name |
| `user.phone` | String | User's phone number |
| `user_orders` | List | Last 5 orders from MongoDB (empty list if none) |

## Error Handling

### Guest User (No Email Provided)
- `is_authenticated` = False
- No user data in context
- Page renders normally

### Invalid User (Email Provided but User Not Found)
- `is_authenticated` = False
- No user data in context
- Page renders normally
- No error displayed (graceful degradation)

### MongoDB Connection Error
- `is_authenticated` = False
- Error logged internally (check Django logs)
- No user data in context
- Page renders normally

## Example Template Implementation

```html
{% load static %}
<!DOCTYPE html>
<html>
<head>
    <title>Home - CoffeeKaafiHai</title>
</head>
<body>
    <!-- Navigation -->
    <nav>
        {% if is_authenticated %}
            <span>Hello, {{ user.firstName }}!</span>
            <a href="/logout">Logout</a>
        {% else %}
            <a href="/login">Login</a>
            <a href="/signup">Sign Up</a>
        {% endif %}
    </nav>

    <!-- Hero Section (for all users) -->
    <section class="hero">
        <h1>Welcome to CoffeeKaafiHai</h1>
        {% if is_authenticated %}
            <p>Where {{ user.firstName }}, every sip tells a story</p>
        {% else %}
            <p>Where Every Sip Tells a Story</p>
        {% endif %}
    </section>

    <!-- User Dashboard (authenticated users only) -->
    {% if is_authenticated %}
    <section class="dashboard">
        <h2>Your Profile</h2>
        <p>Email: {{ user.email }}</p>
        <p>Phone: {{ user.phone }}</p>
        
        {% if user_orders %}
        <h3>Recent Orders</h3>
        <table>
            <tr>
                <th>Order ID</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
            </tr>
            {% for order in user_orders %}
            <tr>
                <td>{{ order._id }}</td>
                <td>${{ order.totalAmount }}</td>
                <td>{{ order.status }}</td>
                <td>{{ order.createdAt }}</td>
            </tr>
            {% endfor %}
        </table>
        {% else %}
        <p>No orders yet. Place your first order!</p>
        {% endif %}
    </section>
    {% endif %}
</body>
</html>
```

## Testing

### Test Guest User Access
```bash
curl http://localhost:8000/
```

### Test Authenticated User Access
```bash
curl "http://localhost:8000/?email=user@example.com"
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout/
```

## Files Changed

1. **template_views.py** - Enhanced index() view
2. **views.py** - Enhanced login/signup, added logout
3. **urls.py** - Added logout endpoint route

## No Changes To

✓ Frontend HTML files
✓ Frontend CSS files
✓ Frontend JavaScript files
✓ UI/UX behavior
✓ Animations or styles
✓ API contract (fully backward compatible)

## Debugging Tips

### Check Django Logs
MongoDB errors and exceptions are logged to Django console:
```
Error fetching user data for home page: [error details]
```

### Verify Session
In Django shell:
```python
from django.contrib.sessions.models import Session
Session.objects.all()  # Check active sessions
```

### Check MongoDB Data
Verify user exists in MongoDB:
```python
from database.models import User
user = User.find_by_email('user@example.com')
print(user)
```

## Future Enhancements

Potential improvements (not implemented yet):
- JWT token validation on home page
- User profile picture display
- Real-time order status updates
- Wishlist or saved items
- Personalized recommendations based on order history
