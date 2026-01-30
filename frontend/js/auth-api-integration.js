/**
 * Auth Backend Integration
 * Connects login and signup forms to Django backend API
 * Handles CSRF tokens and API communication
 */

// API configuration
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Get CSRF token from cookie
 * Django sends this token in the page or in a cookie
 */
function getCSRFToken() {
    // Try to get from cookie first
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    
    // If not in cookie, try to get from meta tag
    if (!cookieValue) {
        const meta = document.querySelector('[name="csrf-token"]');
        if (meta) {
            cookieValue = meta.getAttribute('content');
        }
    }
    
    return cookieValue;
}

/**
 * Make API request with proper headers
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    
    // Add CSRF token for POST requests
    if (method !== 'GET') {
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
    }
    
    const options = {
        method: method,
        headers: headers,
        credentials: 'include', // Include cookies for sessions
    };
    
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        // Handle empty response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return null;
        
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

/**
 * Signup handler - sends data to Django backend
 */
async function handleSignup(formData) {
    try {
        const response = await apiRequest('/auth/signup/', 'POST', {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
        });
        
        // Store user token if returned
        if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        // Store user info for client-side use
        if (response.user) {
            localStorage.setItem('userEmail', response.user.email);
            localStorage.setItem('userFirstName', response.user.firstName);
            localStorage.setItem('userLastName', response.user.lastName);
        }
    
        // Ensure client-side session keys are consistent with login flow
        if (response.user && response.user.email) {
            try {
                // Set currentUser so other modules (orders, profile) can find the user
                localStorage.setItem('currentUser', response.user.email);

                // Mirror into users database used by the client for profile autofill/fallback
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                users[response.user.email] = users[response.user.email] || {};
                users[response.user.email].firstName = response.user.firstName || users[response.user.email].firstName || '';
                users[response.user.email].lastName = response.user.lastName || users[response.user.email].lastName || '';
                users[response.user.email].phone = response.user.phone || users[response.user.email].phone || '';
                try { localStorage.setItem('users', JSON.stringify(users)); } catch(e) { /* ignore storage errors */ }

                // Initialize a basic userProfile_{email} so profile UI can auto-fill immediately
                const profileKey = `userProfile_${response.user.email}`;
                if (!localStorage.getItem(profileKey)) {
                    const starterProfile = {
                        firstName: response.user.firstName || '',
                        lastName: response.user.lastName || '',
                        email: response.user.email || '',
                        phone: response.user.phone || '',
                        coffeePreferences: {},
                        avatar: response.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((response.user.firstName||'') + ' ' + (response.user.lastName||''))}&size=200&background=D2691E&color=fff&bold=true`,
                        memberSince: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
                    };
                    try { localStorage.setItem(profileKey, JSON.stringify(starterProfile)); } catch(e) { /* ignore */ }
                }
            } catch (e) {
                console.warn('signup: failed to persist additional client-side user info', e);
            }
        }

        localStorage.setItem('isLoggedIn', 'true');
        
        return response;
        
    } catch (error) {
        throw new Error(error.message || 'Signup failed. Please try again.');
    }
}

/**
 * Login handler - validates credentials with Django backend
 */
async function handleLogin(email, password) {
    try {
        const response = await apiRequest('/auth/login/', 'POST', {
            email: email,
            password: password
        });
        
        // Store user token
        if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        // Store user info
        if (response.user) {
            localStorage.setItem('userEmail', response.user.email);
            localStorage.setItem('userFirstName', response.user.firstName);
            localStorage.setItem('userLastName', response.user.lastName);
        }
        
        localStorage.setItem('currentUser', email);
        localStorage.setItem('isLoggedIn', 'true');
        
        return response;
        
    } catch (error) {
        throw new Error(error.message || 'Invalid email or password');
    }
}

/**
 * Forgot password handler - sends email to backend
 */
async function handleForgotPassword(email) {
    try {
        const response = await apiRequest('/auth/forgot-password/', 'POST', {
            email: email
        });
        
        return response;
        
    } catch (error) {
        throw new Error(error.message || 'Failed to send reset email');
    }
}

/**
 * Reset password handler - verifies OTP and updates password
 */
async function handleResetPassword(email, otp, newPassword) {
    try {
        const response = await apiRequest('/auth/reset-password/', 'POST', {
            email: email,
            otp: otp,
            newPassword: newPassword
        });
        
        return response;
        
    } catch (error) {
        throw new Error(error.message || 'Password reset failed');
    }
}

/**
 * Validate OTP - checks OTP against backend
 */
async function handleValidateOTP(email, otp) {
    try {
        const response = await apiRequest('/validate-otp/', 'POST', {
            email: email,
            otp: otp
        });
        
        return response.valid || false;
        
    } catch (error) {
        console.error('OTP validation error:', error);
        return false;
    }
}

/**
 * Get authenticated headers with access token
 */
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    
    const token = localStorage.getItem('accessToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const csrfToken = getCSRFToken();
    if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
    }
    
    return headers;
}

/**
 * Fetch user orders from backend
 */
async function getUserOrders() {
    try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            throw new Error('No user logged in');
        }
        
        const response = await fetch(
            `${API_BASE_URL}/orders/?email=${encodeURIComponent(email)}`,
            {
                method: 'GET',
                headers: getAuthHeaders(),
                credentials: 'include'
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { success: false, orders: [] };
    }
}

/**
 * Fetch user payment history from backend
 */
async function getUserPayments() {
    try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            throw new Error('No user logged in');
        }
        
        const response = await fetch(
            `${API_BASE_URL}/payments/?email=${encodeURIComponent(email)}`,
            {
                method: 'GET',
                headers: getAuthHeaders(),
                credentials: 'include'
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Error fetching payments:', error);
        return { success: false, payments: [] };
    }
}

/**
 * Create order with backend
 */
async function createOrder(items, totalAmount) {
    try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            throw new Error('No user logged in');
        }
        
        const response = await apiRequest('/payment/create-order/', 'POST', {
            email: email,
            items: items,
            amount: totalAmount,
            currency: 'INR',
            receipt: `order_${Date.now()}`
        });
        
        return response;
        
    } catch (error) {
        throw new Error(error.message || 'Failed to create order');
    }
}

/**
 * Verify payment with backend
 */
async function verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            throw new Error('No user logged in');
        }
        
        const response = await apiRequest('/payment/verify-payment/', 'POST', {
            email: email,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature
        });
        
        return response;
        
    } catch (error) {
        throw new Error(error.message || 'Payment verification failed');
    }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true' &&
           localStorage.getItem('userEmail') !== null;
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        
        // This endpoint would need to be implemented in Django
        // For now, just clear auth if refresh fails
        logout();
        return false;
        
    } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
        return false;
    }
}

// Export functions for use in HTML
window.authAPI = {
    handleSignup,
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    handleValidateOTP,
    getUserOrders,
    getUserPayments,
    createOrder,
    verifyPayment,
    isAuthenticated,
    logout,
    apiRequest,
    getCSRFToken,
    getAuthHeaders
};
