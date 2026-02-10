/* =========================================================
   DYNAMIC ORDER & PROFILE MANAGEMENT SYSTEM
   Purpose: Manages user profiles, orders, avatars, and PDF generation
   Features:
   - User profile management with coffee preferences
   - Order history and tracking
   - Avatar upload/removal with compression
   - PDF report generation
   - Toast notifications
   - Modal management
   Version: 2.1 - Fixed date filtering, auto-fill from auth, and cancel order stats
========================================================= */

/* =========================================================
   GLOBAL VARIABLES
========================================================= */
let logoBase64 = "";
let userProfileData = null;
//let activeToast = null;
//let toastTimeout = null;
console.log("🔥 orders-manager.js LOADED");


/* =========================================================
   SECTION 1: USER PROFILE MANAGEMENT
   Purpose: Initialize, save, and display user profile data
========================================================= */

/**
 * Initialize user profile from localStorage or return default profile
 * @returns {Object} User profile data
 */
function initializeUserProfile() {
    const defaultProfile = {
        firstName: "FirstName",
        lastName: "LastName",
        email: "user@mail.com",
        phone: "+91 98765 43210",
        address: "",
        coffeePreferences: {
            coffeeType: "Latte",
            milkPref: "Regular Milk",
            sugarLevel: "Regular",
            cupSize: "Medium",
            temperature: "Hot",
            coffeeStrength: "Regular",
            emailNotif: true,
            smsNotif: false
        },
        avatar: "https://ui-avatars.com/api/?name=User&size=200&background=D2691E&color=fff&bold=true",
        memberSince: "January 2024"
    };

    // Only load persistent user profile when user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = localStorage.getItem('currentUser');
    if (!isLoggedIn || !currentUser) {
        // Return transient default profile for guests
        userProfileData = Object.assign({}, defaultProfile);
        return userProfileData;
    }

    const savedProfile = localStorage.getItem(`userProfile_${currentUser}`);
    if (!savedProfile) {
        // Get user data from users database instead of potentially stale global keys
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const userData = users[currentUser];
        
        if (userData) {
            // Create profile from user database
            defaultProfile.firstName = userData.firstName || 'FirstName';
            defaultProfile.lastName = userData.lastName || 'LastName';
            defaultProfile.email = currentUser; // email is the key
            defaultProfile.phone = userData.phone || '+91 98765 43210';
            // Address stays as default since it's not stored in users database
            
            // Generate avatar from name
            const firstName = defaultProfile.firstName || 'User';
            const lastName = defaultProfile.lastName || 'Name';
            defaultProfile.avatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&size=200&background=D2691E&color=fff&bold=true`;
        } else {
            // Fallback: try to get from global keys (for backward compatibility)
            const authName = localStorage.getItem('name') || '';
            const authEmail = localStorage.getItem('email') || '';
            const authPhone = localStorage.getItem('phone') || '';
            const authProfilePhoto = localStorage.getItem('profilePhoto') || '';
            
            // Split name into first and last
            const nameParts = authName.trim().split(/\s+/);
            if (nameParts.length > 0 && nameParts[0]) {
                defaultProfile.firstName = nameParts[0];
                if (nameParts.length > 1) {
                    defaultProfile.lastName = nameParts.slice(1).join(' ');
                } else {
                    defaultProfile.lastName = '';
                }
            }
            
            if (authEmail) defaultProfile.email = authEmail;
            if (authPhone) defaultProfile.phone = authPhone;
            if (authProfilePhoto && authProfilePhoto !== 'https://ui-avatars.com/api/?name=User&size=200&background=D2691E&color=fff&bold=true') {
                defaultProfile.avatar = authProfilePhoto;
            } else {
                // Generate avatar from name
                const firstName = defaultProfile.firstName || 'User';
                const lastName = defaultProfile.lastName || 'Name';
                defaultProfile.avatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&size=200&background=D2691E&color=fff&bold=true`;
            }
        }
        
        try {
            localStorage.setItem(`userProfile_${currentUser}`, JSON.stringify(defaultProfile));
        } catch (e) {
            console.warn('Failed to save default profile:', e);
        }
        userProfileData = defaultProfile;
    } else {
        try { 
            userProfileData = JSON.parse(savedProfile);
            // Ensure all preference fields exist with defaults
            if (!userProfileData.coffeePreferences) {
                userProfileData.coffeePreferences = defaultProfile.coffeePreferences;
            } else {
                // Add missing fields with defaults
                const prefs = userProfileData.coffeePreferences;
                if (!prefs.cupSize) prefs.cupSize = "Medium";
                if (!prefs.temperature) prefs.temperature = "Hot";
                if (!prefs.coffeeStrength) prefs.coffeeStrength = "Regular";
            }
        } catch (e) { 
            console.error('Failed to parse saved profile:', e);
            userProfileData = defaultProfile; 
        }
    }

    return userProfileData;
}

/**
 * Save user profile to BOTH localStorage AND backend MongoDB
 * @param {Object} profileData - Profile data to save
 * @returns {boolean} Success status
 */
async function saveUserProfile(profileData) {
    // Only allow saving profile for logged-in users
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        showToast('Please log in to save your profile.', 'warning');
        return false;
    }

    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            showToast('User session expired. Please log in again.', 'error');
            return false;
        }
        
        // PERMANENT FIX: Save to localStorage
        localStorage.setItem(`userProfile_${currentUser}`, JSON.stringify(profileData));
        userProfileData = profileData;
        updateProfileDisplay();
        updateProfileStats();
        
        // Notify other tabs/components
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: userProfileData }));
        
        // Mirror key auth info for quick access
        localStorage.setItem('name', `${userProfileData.firstName} ${userProfileData.lastName}`.trim());
        localStorage.setItem('email', userProfileData.email || '');
        localStorage.setItem('profilePhoto', userProfileData.avatar || '');
        
        // Update users database with profile changes (for consistency)
        try {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (users[currentUser]) {
                users[currentUser].firstName = userProfileData.firstName;
                users[currentUser].lastName = userProfileData.lastName;
                users[currentUser].phone = userProfileData.phone;
                localStorage.setItem('users', JSON.stringify(users));
            }
        } catch (e) {
            console.warn('Failed to update users database:', e);
        }
        
        // PERMANENT FIX: ALSO save to backend MongoDB via API
        try {
            await persistProfileToBackend(profileData);
        } catch (e) {
            console.warn('saveUserProfile: failed to persist to backend', e);
            // Don't fail the save if backend persistence fails - localStorage is primary
        }
        
        return true;
    } catch (err) {
        console.error('saveUserProfile: failed to save to localStorage', err);
        showToast('Unable to save profile (storage full). Try a smaller image.', 'error');
        return false;
    }
}

/**
 * PERMANENT FIX: Persist profile data to backend MongoDB via API
 * This ensures data survives across sessions and syncs across devices
 * @param {Object} profileData - Profile data to persist
 * @returns {Promise<boolean>} Success status
 */
async function persistProfileToBackend(profileData) {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            console.warn('persistProfileToBackend: no current user');
            return false;
        }
        
        // Prepare data for backend
        const backendPayload = {
            // Explicit source marker so backend can block checkout-driven profile writes.
            source: 'profile',
            email: currentUser,
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            coffeePreferences: profileData.coffeePreferences || {},
            avatar: profileData.avatar || ''
        };
        
        // Call backend API to save profile
        const response = await fetch('/profile/', { // Session-auth profile sync
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken() || ''
            },
            credentials: 'same-origin',
            body: JSON.stringify(backendPayload)
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.warn('Backend profile save failed:', error);
            return false;
        }
        
        const result = await response.json();
        console.log('Profile persisted to backend successfully');
        return result.success === true;
        
    } catch (error) {
        console.error('persistProfileToBackend error:', error);
        return false;
    }
}

/**
 * Helper function to get CSRF token (for backend persistence)
 * @returns {string|null} CSRF token or null
 */
function getCSRFToken() {
    try {
        const name = 'csrftoken';
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    return decodeURIComponent(cookie.substring(name.length + 1));
                }
            }
        }
        // Try meta tag
        const meta = document.querySelector('[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : null;
    } catch (e) {
        return null;
    }
}

/**
 * Update profile display in the UI
 */
function updateProfileDisplay() {
    if (!userProfileData) return;
    
    // Update form fields
    const elements = {
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        address: document.getElementById('address'),
        displayName: document.getElementById('displayName'),
        displayEmail: document.getElementById('displayEmail'),
        profileAvatar: document.getElementById('profileAvatar')
    };
    
    if (elements.firstName) elements.firstName.value = userProfileData.firstName;
    if (elements.lastName) elements.lastName.value = userProfileData.lastName;
    if (elements.email) elements.email.value = userProfileData.email;
    if (elements.phone) elements.phone.value = userProfileData.phone;
    if (elements.address) elements.address.value = userProfileData.address;
    if (elements.displayName) elements.displayName.textContent = `${userProfileData.firstName} ${userProfileData.lastName}`;
    if (elements.displayEmail) elements.displayEmail.textContent = userProfileData.email;
    
    // Update avatar image
    if (elements.profileAvatar && userProfileData.avatar) {
        try {
            elements.profileAvatar.setAttribute('src', userProfileData.avatar);
            elements.profileAvatar.src = userProfileData.avatar;
            elements.profileAvatar.onerror = function(e) { 
                console.warn('profileAvatar failed to load', e); 
            };
        } catch (e) {
            console.warn('Error updating profileAvatar src', e);
        }
    }
    
    // Show or hide Remove button for custom avatars
    updateRemoveAvatarButton();
    
    // Update coffee preferences and stats
    updateCoffeePreferencesDisplay();
    updateProfileStats();
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('profileUpdated', { detail: userProfileData }));
}

/**
 * Update the visibility of the Remove Avatar button
 */
function updateRemoveAvatarButton() {
    try {
        const removeBtn = document.getElementById('removeAvatarBtn');
        const avatar = String(userProfileData.avatar || '');
        const isDefault = avatar.indexOf('ui-avatars.com') !== -1 || 
                         avatar.indexOf('/images/Avatar.jpg') !== -1 || 
                         avatar.indexOf('default') !== -1 || 
                         (avatar.indexOf('data:') === -1 && avatar.trim() === '');
        if (removeBtn) removeBtn.style.display = isDefault ? 'none' : 'inline-block';
    } catch (e) {
        console.warn('Error updating remove avatar button:', e);
    }
}

/**
 * Update coffee preferences display in the UI
 */
function updateCoffeePreferencesDisplay() {
    if (!userProfileData || !userProfileData.coffeePreferences) return;
    
    const prefs = userProfileData.coffeePreferences;
    const elements = {
        coffeeType: document.getElementById('coffeeType'),
        milkPref: document.getElementById('milkPref'),
        sugarLevel: document.getElementById('sugarLevel'),
        cupSize: document.getElementById('cupSize'),
        temperature: document.getElementById('temperature'),
        coffeeStrength: document.getElementById('coffeeStrength'),
        emailNotif: document.getElementById('emailNotif'),
        smsNotif: document.getElementById('smsNotif')
    };
    
    if (elements.coffeeType && prefs.coffeeType) elements.coffeeType.value = prefs.coffeeType;
    if (elements.milkPref && prefs.milkPref) elements.milkPref.value = prefs.milkPref;
    if (elements.sugarLevel && prefs.sugarLevel) elements.sugarLevel.value = prefs.sugarLevel;
    if (elements.cupSize && prefs.cupSize) elements.cupSize.value = prefs.cupSize;
    if (elements.temperature && prefs.temperature) elements.temperature.value = prefs.temperature;
    if (elements.coffeeStrength && prefs.coffeeStrength) elements.coffeeStrength.value = prefs.coffeeStrength;
    if (elements.emailNotif) elements.emailNotif.checked = prefs.emailNotif || false;
    if (elements.smsNotif) elements.smsNotif.checked = prefs.smsNotif || false;
}

/**
 * Save coffee preferences to user profile
 * @returns {Object} Saved coffee preferences
 */
function saveCoffeePreferences() {
    if (!userProfileData) userProfileData = initializeUserProfile();
    
    const coffeeType = document.getElementById('coffeeType')?.value || "Latte";
    const milkPref = document.getElementById('milkPref')?.value || "Regular Milk";
    const sugarLevel = document.getElementById('sugarLevel')?.value || "Regular";
    const cupSize = document.getElementById('cupSize')?.value || "Medium";
    const temperature = document.getElementById('temperature')?.value || "Hot";
    const coffeeStrength = document.getElementById('coffeeStrength')?.value || "Regular";
    const emailNotif = document.getElementById('emailNotif')?.checked || false;
    const smsNotif = document.getElementById('smsNotif')?.checked || false;
    
    userProfileData.coffeePreferences = {
        coffeeType,
        milkPref,
        sugarLevel,
        cupSize,
        temperature,
        coffeeStrength,
        emailNotif,
        smsNotif
    };
    
    saveUserProfile(userProfileData);
    return userProfileData.coffeePreferences;
}

/* =========================================================
   SECTION 2: ORDER MANAGEMENT
   Purpose: Handle order creation, retrieval, and filtering
========================================================= */

/**
 * Get all orders for the current logged-in user
 * @returns {Promise<Array>} Array of order objects
 */
async function getAllOrders() {
    try {
        // Guests should have no orders
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) return [];

        const userId = localStorage.getItem('currentUser') || localStorage.getItem('userId') || localStorage.getItem('userEmail');
        if (!userId) return [];
        
        // MongoDB Query: db.collection("orders").find({ email: userId })
        const response = await fetch('/api/orders/', { credentials: 'same-origin' });
        if (response.ok) {
            const data = await response.json();
            const orders = Array.isArray(data.orders) ? data.orders : [];
            const existingIds = new Set();
            const orderIdMap = loadOrderIdMap(userId);
            let mapDirty = false;
            orders.forEach(order => {
                if (ensureOrderIdOnce(order, existingIds, orderIdMap)) {
                    mapDirty = true;
                }
            });
            if (mapDirty) {
                saveOrderIdMap(userId, orderIdMap);
            }
            return orders;
        }
        return [];
    } catch (e) {
        console.error('Error parsing orders:', e);
        return [];
    }
}

/**
 * Get recent orders with optional limit
 * @param {number} limit - Number of orders to return
 * @returns {Promise<Array>} Array of recent order objects
 */
async function getRecentOrders(limit = 3) {
    const allOrders = await getAllOrders();
    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    return allOrders.slice(0, limit);
}

/**
 * Filter orders by date range
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {Promise<Array>} Filtered array of orders
 */
async function filterOrdersByDateRange(startDate, endDate) {
    const allOrders = await getAllOrders();
    
    // FIX ISSUE 1: Allow empty dates - return all orders if both are empty
    if (!startDate && !endDate) {
        return allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // If only one date is provided, use it as both start and end
    if (!startDate && endDate) {
        startDate = endDate;
    }
    if (startDate && !endDate) {
        endDate = startDate;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start) || isNaN(end)) {
        console.warn('Invalid date format');
        return allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // Set start to beginning of day, end to end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return allOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= start && orderDate <= end;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Calculate profile statistics from orders
 * @returns {Promise<Object>} Statistics object with totalOrders, points, memberTier, totalSpent
 */
async function calculateProfileStats() {
    const allOrders = await getAllOrders();
    
    // FIX ISSUE 3: Only count non-cancelled orders for stats
    const activeOrders = allOrders.filter(order => order.status !== 'cancelled');
    const totalOrders = activeOrders.length;
    
    const totalSpent = activeOrders.reduce((sum, order) => sum + (
        (typeof order.total === 'number') ? order.total : (
            (typeof order.totalAmount === 'number') ? order.totalAmount : Number(order.totalAmount || order.total || order.amount || 0)
        )
    ), 0);
    const points = Math.floor(totalSpent / 10);
    
    let memberTier = 'Bronze';
    if (totalOrders > 20) {
        memberTier = 'Gold';
    } else if (totalOrders > 10) {
        memberTier = 'Silver';
    }
    
    return {
        totalOrders,
        points,
        memberTier,
        totalSpent
    };
}

/**
 * Update profile statistics display in the UI
 * @returns {Promise<Object>} Statistics object
 */
async function updateProfileStats() {
    const stats = await calculateProfileStats();
    
    const ordersCountEl = document.getElementById('ordersCount');
    const pointsCountEl = document.getElementById('pointsCount');
    const memberTierEl = document.getElementById('memberTier');
    
    if (ordersCountEl) ordersCountEl.textContent = stats.totalOrders;
    if (pointsCountEl) pointsCountEl.textContent = stats.points;
    if (memberTierEl) memberTierEl.textContent = stats.memberTier;
    
    return stats;
}

const ORDER_ID_PREFIX = 'CKH';
const MIN_ORDER_ID_LENGTH = 8;
const ORDER_ID_RANDOM_LEN = 6;
const ORDER_ID_PATTERN = new RegExp(`^${ORDER_ID_PREFIX}-\\d{8}-(?:[A-Z0-9]{3}-)?[A-Z0-9]{4,}$`, 'i');

function getCoffeeTypeCode(data) {
    const raw = data && (data.coffeeTypeCode || data.coffeeType || data.coffee || data.type);
    if (!raw) return '';
    const cleaned = String(raw).replace(/[^a-z0-9]/gi, '').toUpperCase();
    return cleaned.length >= 3 ? cleaned.slice(0, 3) : '';
}

function isWeakOrderId(value) {
    if (value === null || value === undefined) return true;
    const str = String(value).trim();
    if (!str) return true;
    if (/^\d+$/.test(str)) return true;
    if (str.length < MIN_ORDER_ID_LENGTH) return true;
    if (!ORDER_ID_PATTERN.test(str)) return true;
    return false;
}

function randomAlphaNum(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const out = new Array(length);
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        let raw = '';
        while (raw.length < length) {
            raw += window.crypto.randomUUID().replace(/-/g, '');
        }
        raw = raw.toUpperCase();
        for (let i = 0; i < length; i++) {
            const nibble = parseInt(raw[i], 16);
            out[i] = chars[nibble % chars.length];
        }
    } else if (window.crypto && window.crypto.getRandomValues) {
        const bytes = new Uint8Array(length);
        window.crypto.getRandomValues(bytes);
        for (let i = 0; i < length; i++) {
            out[i] = chars[bytes[i] % chars.length];
        }
    } else {
        for (let i = 0; i < length; i++) {
            out[i] = chars[Math.floor(Math.random() * chars.length)];
        }
    }
    return out.join('');
}

function getOrderIdStorageKey(userId) {
    return `orderIdMap_${userId || 'guest'}`;
}

function loadOrderIdMap(userId) {
    try {
        const raw = localStorage.getItem(getOrderIdStorageKey(userId));
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.warn('Failed to load orderId map:', e);
        return {};
    }
}

function saveOrderIdMap(userId, map) {
    try {
        localStorage.setItem(getOrderIdStorageKey(userId), JSON.stringify(map));
    } catch (e) {
        console.warn('Failed to save orderId map:', e);
    }
}

function getOrderIdStableKey(order) {
    const key = order && (order._id || order.id || order.orderId || order.createdAt || order.date || order.orderDate);
    return key ? String(key).trim() : '';
}

function ensureOrderIdOnce(order, existingIds, orderIdMap) {
    const current = order.orderId || order._id || order.id;
    if (!isWeakOrderId(current)) {
        order.orderId = String(current);
        if (existingIds) existingIds.add(order.orderId);
        return false;
    }

    const stableKey = getOrderIdStableKey(order);
    if (stableKey && orderIdMap && orderIdMap[stableKey]) {
        order.orderId = String(orderIdMap[stableKey]);
        if (existingIds) existingIds.add(order.orderId);
        return false;
    }

    const newId = generateOrderId(existingIds, order);
    order.orderId = String(newId);
    if (stableKey && orderIdMap) {
        orderIdMap[stableKey] = order.orderId;
        return true;
    }
    return false;
}

function generateOrderId(existingIds, data) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const datePart = `${y}${m}${d}`;
    const coffeeCode = getCoffeeTypeCode(data);
    const prefix = coffeeCode
        ? `${ORDER_ID_PREFIX}-${datePart}-${coffeeCode}-`
        : `${ORDER_ID_PREFIX}-${datePart}-`;
    let candidate = '';
    let attempts = 0;
    do {
        candidate = `${prefix}${randomAlphaNum(ORDER_ID_RANDOM_LEN)}`;
        attempts += 1;
    } while (existingIds && existingIds.has(candidate) && attempts < 10);
    if (existingIds) existingIds.add(candidate);
    return candidate;
}

/**
 * Display recent orders in the UI
 * @param {number} limit - Optional limit for number of orders to display
 */
async function displayRecentOrders(limit) {
    const ordersContainer = document.getElementById('recentOrdersContainer');
    if (!ordersContainer) return;

    ordersContainer.innerHTML = '';

    let ordersToShow;
    if (typeof limit === 'number') {
        ordersToShow = await getRecentOrders(limit);
    } else {
        // Show all orders by default, sorted by date desc
        const all = await getAllOrders();
        ordersToShow = all.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (!ordersToShow || ordersToShow.length === 0) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-coffee"></i>
                <p>No orders yet.</p>
            </div>
        `;
        updateProfileStats();
        return;
    }

    ordersToShow.forEach(order => {
        const displayOrderId = order.orderId || '';

        // Get status text for display
        function getStatusText(status) {
            const statusMap = {
                'pending': 'Order Placed',
                'confirmed': 'Confirmed',
                'preparing': 'Preparing',
                'ready': 'Ready for Pickup',
                'delivered': 'Delivered',
                'cancelled': 'Cancelled'
            };
            return statusMap[status] || status;
        }
        
        const orderStatus = order.status || (order.paymentStatus === 'paid' ? 'completed' : 'pending');
        const statusText = getStatusText(orderStatus);
        const statusClass = `status-${orderStatus}`;
        
        // Build items summary
        let itemsSummary = '';
        if (Array.isArray(order.items)) {
            itemsSummary = order.items.map(i => `${i.name || i.title || 'Item'} x ${i.quantity || 1}`).join(', ');
        } else {
            itemsSummary = order.items || '';
        }

        const dateDisplay = order.dateDisplay || 
                           (order.date ? new Date(order.date).toLocaleString() : 
                           (order.orderDate ? new Date(order.orderDate).toLocaleString() : ''));
        
        const totalAmount = (typeof order.total === 'number') ? order.total : 
                           (typeof order.totalAmount === 'number') ? order.totalAmount : 
                           (order.total ? Number(order.total) : 
                           (order.totalAmount ? Number(order.totalAmount) : 
                           (order.subtotal ? order.subtotal + (order.tax || 0) : 0)));

        const canCancel = order.status !== 'delivered' && order.status !== 'cancelled';

        const orderHTML = `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">${displayOrderId}</span>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <div class="order-details">
                    <p class="mb-1">${itemsSummary}</p>
                    <small class="text-muted">${dateDisplay}</small>
                </div>
                <div class="order-total">Total: ₹${totalAmount}</div>
                <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
                    <a href="/order-tracking/?orderId=${encodeURIComponent(displayOrderId)}" class="btn btn-sm" style="background:linear-gradient(135deg,#6f4e37,#8b5e3c);color:#fff;border-radius:12px;padding:8px 14px;text-decoration:none">&nbsp;<i class="fas fa-route"></i>&nbsp;Track</a>
                    ${canCancel ? `<button class="btn btn-sm btn-danger profile-cancel-order" data-order-id="${displayOrderId}" style="padding:8px 14px;border-radius:12px">&nbsp;<i class="fas fa-times-circle"></i>&nbsp;Cancel</button>` : ''}
                </div>
            </div>
        `;
        ordersContainer.innerHTML += orderHTML;
    });

    // Attach cancel button handlers
    attachCancelOrderHandlers(ordersContainer, limit);
    updateProfileStats();
}

/**
 * Attach event handlers to cancel order buttons
 * @param {HTMLElement} container - Container element with cancel buttons
 * @param {number} displayLimit - Display limit for refresh after cancel
 */
function attachCancelOrderHandlers(container, displayLimit) {
    container.querySelectorAll('.profile-cancel-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            if (!orderId) return;
            
            // Show custom cancel order modal
            showCancelOrderModal(orderId, displayLimit);
        });
    });
}

/**
 * Add a new order to the user's order history
 * @param {Object} orderData - Order data object
 * @param {Object} [options] - Optional flags
 * @param {boolean} [options.suppressToast=false] - Skip success toast
 * @returns {Promise<Object|null>} Created order or null if failed
 */
async function addNewOrder(orderData, options = {}) {
    const suppressToast = !!options.suppressToast;
    // Persist orders per user
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        showToast('Please log in to place orders.', 'warning');
        return null;
    }

    const userId = localStorage.getItem('currentUser') || localStorage.getItem('userId') || localStorage.getItem('userEmail');
    if (!userId) {
        showToast('User session expired. Please log in again.', 'error');
        return null;
    }

    // Refresh from DB instead of local manipulation
    await displayRecentOrders();

    // Preserve incoming orderData shape
    const newOrder = Object.assign({}, orderData || {});

    // Ensure an orderId/id exists
    const allOrders = await getAllOrders();
    const safeOrders = Array.isArray(allOrders) ? allOrders : [];
    const existingIds = new Set(
        safeOrders
            .map(o => o.orderId)
            .filter(Boolean)
            .map(v => String(v))
    );
    const incomingId = orderData.orderId || newOrder.orderId;
    let finalId = incomingId;
    if (isWeakOrderId(finalId) || existingIds.has(String(finalId))) {
        finalId = generateOrderId(existingIds, orderData);
    } else {
        existingIds.add(String(finalId));
    }
    newOrder.orderId = String(finalId);

    // Normalize date fields
    newOrder.orderDate = orderData.orderDate || orderData.date || new Date().toISOString();
    newOrder.date = newOrder.date || newOrder.orderDate;
    newOrder.dateDisplay = orderData.dateDisplay || new Date(newOrder.date).toLocaleString();

    // Preserve items as array when provided
    if (Array.isArray(orderData.items)) {
        newOrder.items = orderData.items;
    } else if (typeof orderData.items === 'string' && orderData.items.trim().length) {
        // Convert simple comma-separated summary to minimal item objects
        newOrder.items = orderData.items.split(',').map(s => ({ 
            name: s.trim(), 
            quantity: 1, 
            price: 0 
        }));
    } else {
        newOrder.items = orderData.items || [];
    }

    // Normalize numeric totals
    newOrder.total = (typeof orderData.total === 'number') ? orderData.total : 
                     Number(orderData.total || orderData.subtotal || 0);

    // Normalize status
    newOrder.status = (orderData.status || 
                      (orderData.paymentStatus === 'paid' ? 'delivered' : 'pending') || 
                      '').toString().toLowerCase();

    // Notify UI and other components
    // window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: allOrders }));

    await displayRecentOrders();
    if (!suppressToast) {
        showToast('New order placed successfully!', 'success');
    }
    return newOrder;
}

/* =========================================================
   SECTION 3: ORDERS MANAGER CLASS
   Purpose: Advanced order management with tracking and cancellation
========================================================= */

class OrdersManager {
    constructor() {
        this.userId = localStorage.getItem('currentUser') || localStorage.getItem('userId') || localStorage.getItem('userEmail') || null;
        // No in-memory storage
    }

    /**
     * Load orders for current user from localStorage
     */
    loadOrders() {
        // Deprecated: Use getAllOrders() which fetches from DB
    }

    /**
     * Reinitialize for a new/different user (called on login)
     */
    reinit() {
        this.userId = localStorage.getItem('currentUser') || localStorage.getItem('userId') || localStorage.getItem('userEmail') || null;
    }

    /**
     * Save orders for current user to localStorage
     */
    saveOrders() {
        // Deprecated: Data is saved to DB via API
    }

    /**
     * Add new order to the beginning of the list
     * @param {Object} order - Order object
     */
    addOrder(order) {
        // Deprecated
    }

    /**
     * Get all orders
     * @returns {Promise<Array>} Array of all orders
     */
    async getOrders() {
        return await getAllOrders();
    }

    /**
     * Get order by ID
     * @param {string} orderId - Order ID
     * @returns {Promise<Object|undefined>} Order object or undefined
     */
    async getOrderById(orderId) {
        // MongoDB Query: db.collection("orders").findOne(...)
        const allOrders = await getAllOrders();
        return allOrders.find(order => 
            (order.orderId && order.orderId === orderId)
        );
    }


    /**
     * Cancel an order
     * @param {string} orderId - Order ID to cancel
     * @param {string} reason - Cancellation reason
     * @returns {Object} Result object with success status and message
     */
    async cancelOrder(orderId, reason = '') {
        const order = await this.getOrderById(orderId);
        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        // Check if order can be cancelled
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return { success: false, message: `Cannot cancel ${order.status} order` };
        }

        // Persist cancellation to backend
        try {
            const payload = {
                orderId: order.orderId,
                clientOrderId: order.clientOrderId || null,
                reason: reason || ''
            };
            const resp = await fetch('/api/orders/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(payload)
            });
            if (!resp.ok) {
                return { success: false, message: `Cancel failed (HTTP ${resp.status})` };
            }
            const data = await resp.json();
            if (!data || !data.success) {
                return { success: false, message: data && data.message ? data.message : 'Cancel failed' };
            }
        } catch (e) {
            return { success: false, message: 'Cancel failed' };
        }

        // Update local view state
        order.status = 'cancelled';
        order.cancelledAt = new Date().toISOString();
        order.cancellationReason = reason;
        
        // FIX ISSUE 3: Update profile stats after cancellation
        await updateProfileStats();
        
        return { success: true, message: 'Order cancelled successfully', order };
    }

    /**
     * Update order status for tracking
     * @param {string} orderId - Order ID
     * @param {string} newStatus - New status
     * @returns {boolean} Success status
     */
    async updateOrderStatus(orderId, newStatus) {
        const order = await this.getOrderById(orderId);
        if (!order) return false;

        order.status = newStatus;
        order.lastUpdated = new Date().toISOString();
        
        // Add tracking history
        if (!order.trackingHistory) {
            order.trackingHistory = [];
        }
        order.trackingHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString()
        });

        return true;
    }

    /**
     * Get human-readable status text
     * @param {string} status - Status code
     * @returns {string} Display text
     */
    getStatusText(status) {
        const statusMap = {
            'pending': 'Order Placed',
            'confirmed': 'Confirmed',
            'preparing': 'Preparing',
            'ready': 'Ready for Pickup',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    /**
     * Get status color for UI display
     * @param {string} status - Status code
     * @returns {string} Hex color code
     */
    getStatusColor(status) {
        const colorMap = {
            'pending': '#FFA500',
            'confirmed': '#2196F3',
            'preparing': '#9C27B0',
            'ready': '#4CAF50',
            'delivered': '#00C851',
            'cancelled': '#ff4444'
        };
        return colorMap[status] || '#666';
    }
}

// Initialize global orders manager instance
const ordersManager = new OrdersManager();
window.ordersManager = ordersManager;

/* =========================================================
   SECTION 4: AVATAR MANAGEMENT
   Purpose: Handle avatar upload, compression, and removal
========================================================= */

/**
 * Upload and compress avatar image
 * @returns {Promise<boolean>} Success status
 */
function uploadAvatar() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.addEventListener('change', function onchange(e) {
            const file = (e.target && e.target.files && e.target.files[0]) || null;
            if (!file) {
                resolve(false);
                input.removeEventListener('change', onchange);
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image size should be less than 5MB', 'error');
                resolve(false);
                input.removeEventListener('change', onchange);
                return;
            }

            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                showToast('User session expired. Please log in again.', 'error');
                resolve(false);
                input.removeEventListener('change', onchange);
                return;
            }

            const reader = new FileReader();
            reader.onload = async function(event) {
                const imageDataUrl = event.target.result;
                try {
                    // Compress image before saving
                    const processed = await compressImage(imageDataUrl);

                    if (!userProfileData) userProfileData = initializeUserProfile();
                    userProfileData.avatar = processed;
                    const saved = saveUserProfile(userProfileData);
                    
                    if (!saved) {
                        showToast('Failed to save avatar. Please try again.', 'error');
                        resolve(false);
                        return;
                    }

                    showToast('Profile picture uploaded successfully!', 'success');

                    // Mark that user uploaded an avatar
                    localStorage.setItem(`userHasUploadedAvatar_${currentUser}`, 'true');

                    // Show Remove button after upload
                    const removeBtn = document.getElementById('removeAvatarBtn');
                    if (removeBtn) removeBtn.style.display = 'inline-block';

                    // Force immediate DOM update of avatar
                    const imgEl = document.getElementById('profileAvatar');
                    if (imgEl) {
                        imgEl.src = '';
                        setTimeout(() => { imgEl.src = processed; }, 60);
                    }

                    // Dispatch profile updated event to update navbar
                    window.dispatchEvent(new CustomEvent('profileUpdated'));

                    resolve(true);
                } catch (err) {
                    console.error('uploadAvatar error:', err);
                    showToast('Failed to upload avatar. Please try again.', 'error');
                    resolve(false);
                } finally {
                    input.removeEventListener('change', onchange);
                }
            };
            
            reader.onerror = function(err) {
                console.error('FileReader error:', err);
                showToast('Failed to read image file', 'error');
                resolve(false);
                input.removeEventListener('change', onchange);
            };
            
            reader.readAsDataURL(file);
        });

        input.click();
    });
}

/**
 * Compress image to reduce file size
 * @param {string} dataUrl - Image data URL
 * @returns {Promise<string>} Compressed image data URL
 */
function compressImage(dataUrl) {
    return new Promise((resolve) => {
        try {
            const img = new Image();
            img.onload = function() {
                const maxDim = 1024; // max width/height
                let { width, height } = img;
                
                if (width > maxDim || height > maxDim) {
                    const ratio = Math.min(maxDim / width, maxDim / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Prefer JPEG for smaller size
                let output;
                try {
                    output = canvas.toDataURL('image/jpeg', 0.8);
                } catch (e) {
                    output = canvas.toDataURL();
                }
                resolve(output);
            };
            img.onerror = function() { 
                resolve(dataUrl); 
            };
            img.src = dataUrl;
        } catch (e) { 
            resolve(dataUrl); 
        }
    });
}

/**
 * Remove custom avatar and restore default
 * @returns {boolean} Success status
 */
function removeAvatar() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showToast('User session expired. Please log in again.', 'error');
        return false;
    }
    
    if (!userProfileData) userProfileData = initializeUserProfile();
    
    const firstName = userProfileData.firstName || 'User';
    const lastName = userProfileData.lastName || 'Name';
    const defaultAvatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&size=200&background=D2691E&color=fff&bold=true`;
    
    userProfileData.avatar = defaultAvatar;
    saveUserProfile(userProfileData);
    
    showToast('Profile picture removed successfully!', 'success');
    localStorage.setItem(`userHasUploadedAvatar_${currentUser}`, 'false');
    
    // Dispatch profile updated event to update navbar
    window.dispatchEvent(new CustomEvent('profileUpdated'));
    
    // Update the profile page avatar immediately
    const profileAvatarEl = document.getElementById('profileAvatar');
    if (profileAvatarEl) {
        profileAvatarEl.src = defaultAvatar;
    }
    
    // Hide the remove button since we're back to default avatar
    const removeBtn = document.getElementById('removeAvatarBtn');
    if (removeBtn) {
        removeBtn.style.display = 'none';
    }
    
    return true;
}

/* =========================================================
   SECTION 5: PDF GENERATION
   Purpose: Generate PDF reports with user data and orders
========================================================= */

/**
 * Load logo image as base64 for PDF embedding
 */
async function loadLogoBase64() {
    try {
        // The file may be served as a static JS asset (Django template tags won't be processed).
        // Fallback strategy:
        // 1) If the template tag was processed (unlikely for .js served statically) use it.
        // 2) Otherwise try the common static path '/static/images/logo.png'.
        const rawPath = "{% static 'images/logo.png' %}";
        const candidatePaths = [];
        if (rawPath && rawPath.indexOf('{%') === -1) {
            candidatePaths.push(rawPath);
        }
        // Common Django static path fallback (works on dev server and production if collected)
        candidatePaths.push('/static/images/logo.png');
        // Relative fallback
        candidatePaths.push('images/logo.png');

        let resp = null;
        for (const p of candidatePaths) {
            try {
                resp = await fetch(p);
                if (resp && resp.ok) break;
            } catch (err) {
                // ignore and try next
            }
        }

        if (!resp || !resp.ok) {
            console.warn('Logo fetch failed for all candidates');
            return;
        }

        const blob = await resp.blob();
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        logoBase64 = dataUrl;
    } catch (e) {
        console.warn('Logo failed to load via fetch:', e);
    }
}

/**
 * Generate PDF report with user data and orders
 * @param {string} startDate - Optional start date for order filtering
 * @param {string} endDate - Optional end date for order filtering
 * @returns {Promise<boolean>} Success status
 */
async function generateUserDataPDF(startDate = null, endDate = null) {
    try {
        const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || window.jspdf;
        if (!jsPDFClass) {
            showToast('PDF library is loading, please try again in a moment.', 'warning');
            return false;
        }

        const doc = new jsPDFClass();
        
        const marginLeft = 20;
        const marginRight = 20;
        const pageWidth = 210;
        const maxLineWidth = pageWidth - marginLeft - marginRight;
        
        let yPos = 108;
        
        // Helper function to add page styling
        function addPageStyling() {
            doc.setFillColor(250, 248, 245);
            doc.rect(0, 0, 210, 297, 'F');
            doc.setDrawColor(139, 69, 19);
            doc.setLineWidth(1.5);
            doc.rect(10, 10, 190, 277);
        }
        
        // Helper function to check page break
        function checkPageBreak(requiredSpace) {
            if (yPos + requiredSpace > 270) {
                doc.addPage();
                addPageStyling();
                yPos = 25;
                return true;
            }
            return false;
        }
        
        // Helper function to add wrapped text
        function addWrappedText(text, x, y, maxWidth, lineHeight = 6) {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach(line => {
                checkPageBreak(lineHeight + 2);
                doc.text(line, x, yPos);
                yPos += lineHeight;
            });
        }
        
        addPageStyling();
        
        // Add logo
        await addLogo(doc, pageWidth);
        
       // ================= HEADER (UNCHANGED) =================
        doc.setFont('times', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(101, 67, 33);
        doc.text('CoffeeKaafiHai', pageWidth / 2, 70, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(139, 69, 19);
        doc.text('User Data Report', pageWidth / 2, 80, { align: 'center' });

        function formatPdfDateTime(value) {
            const d = value ? new Date(value) : null;
            if (!d || isNaN(d.getTime())) return '';
            const parts = new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).formatToParts(d);
            const map = {};
            parts.forEach(p => { map[p.type] = p.value; });
            const dayPeriod = (map.dayPeriod || '').toLowerCase();
            return `${map.day} ${map.month} ${map.year}, ${map.hour}:${map.minute} ${dayPeriod}`.trim();
        }

        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Generated: ${formatPdfDateTime(new Date())}`, pageWidth / 2, 88, { align: 'center' });

        doc.setDrawColor(210, 180, 140);
        doc.setLineWidth(0.5);
        doc.line(30, 95, 180, 95);

        // ================= HELPER FOR LABEL : VALUE =================
        function labelValue(label, value) {
            doc.setFont('helvetica', 'bold');
            doc.text(label + ':', marginLeft + 5, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value || 'Not set', marginLeft + 55, yPos);
            yPos += 6;
        }

        // ================= PERSONAL INFORMATION =================
        addSection(doc, 'Personal Information', marginLeft, yPos);
        yPos += 10;

        const profile = userProfileData || initializeUserProfile();
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);

        labelValue('Full Name', `${profile.firstName} ${profile.lastName}`);
        labelValue('Email', profile.email);
        labelValue('Phone', profile.phone);
        labelValue('Address', profile.address);

        // section divider
        doc.setDrawColor(220, 220, 220);
        doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
        yPos += 8;

        // ================= COFFEE PREFERENCES =================
        addSection(doc, 'Coffee Preferences', marginLeft, yPos);
        yPos += 10;

        const prefs = profile.coffeePreferences || {};
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);

        labelValue('Favorite Coffee', prefs.coffeeType);
        labelValue('Milk Preference', prefs.milkPref);
        labelValue('Sugar Level', prefs.sugarLevel);
        labelValue('Cup Size', prefs.cupSize);
        labelValue('Temperature', prefs.temperature);
        labelValue('Coffee Strength', prefs.coffeeStrength);
        labelValue('Email Notifications', prefs.emailNotif ? 'Enabled' : 'Disabled');
        labelValue('SMS Notifications', prefs.smsNotif ? 'Enabled' : 'Disabled');

        doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
        yPos += 8;

        // ================= ACCOUNT STATISTICS =================
        const stats = calculateProfileStats();
        addSection(doc, 'Account Statistics', marginLeft, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        
        labelValue('Total Orders', String(stats.totalOrders));
        labelValue('Loyalty Points', `${stats.points} points`);
        labelValue('Membership', `${stats.memberTier} Member`);
        labelValue('Total Spent', `Rs.${stats.totalSpent}`);
        labelValue('Member Since', profile.memberSince || 'January 2024');

        doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
        yPos += 8;

        // ================= ORDER HISTORY =================
        addSection(doc, 'Order History', marginLeft, yPos);
        yPos += 10;

        doc.setFontSize(10);

        let ordersToDisplay;
        if (startDate || endDate) {
            ordersToDisplay = await filterOrdersByDateRange(startDate, endDate);
            ordersToDisplay = ordersToDisplay.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            const all = await getAllOrders();
            ordersToDisplay = all.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        if (ordersToDisplay.length === 0) {
            doc.text('No orders found for the selected date range.', marginLeft + 5, yPos);
            yPos += 6;
        } else {
            ordersToDisplay.forEach(order => {
                const titleHeight = 6;
                const lineHeight = 5;

                const itemsText = Array.isArray(order.items)
                    ? order.items.map(i => `${i.name || i.title} x ${i.quantity || 1}`).join(', ')
                    : (order.items || '');

                const availableWidthForItems = pageWidth - marginLeft - marginRight - 10;
                const itemsLines = doc.splitTextToSize(`Items: ${itemsText}`, availableWidthForItems);
                const itemsHeight = Math.max(itemsLines.length, 1) * lineHeight;

                const dateValue =
                    formatPdfDateTime(order.date) ||
                    formatPdfDateTime(order.orderDate);
                const dateLines = doc.splitTextToSize(`Date: ${dateValue || ''}`, availableWidthForItems);
                const dateHeight = Math.max(dateLines.length, 1) * lineHeight;

                const totalHeight = 6;
                const dividerHeight = 8;

                const requiredSpace = titleHeight + itemsHeight + dateHeight + totalHeight + dividerHeight + 6;
                checkPageBreak(requiredSpace);

                // Order header
                const pdfOrderId = (order && order.orderId) ? String(order.orderId) : 'N/A';
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(139, 69, 19); // keep original brown
                doc.text(
                    `Order ID: ${pdfOrderId} — ${order.status}`,
                    marginLeft + 5,
                    yPos
                );
                yPos += titleHeight;

                doc.setFontSize(10);

                // Render items (label bold, value normal)
                itemsLines.forEach((line, idx) => {
                    if (idx === 0) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(60, 60, 60); // keep original normal text color
                        doc.text('Items: ', marginLeft + 10, yPos);

                        doc.setFont('helvetica', 'normal');
                        doc.text(line.replace(/^Items:\s*/, ''), marginLeft + 10 + doc.getTextWidth('Items: '), yPos);
                    } else {
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(60, 60, 60);
                        doc.text(line, marginLeft + 10, yPos);
                    }
                    yPos += lineHeight;
                });

                // Render date (label bold, value normal)
                dateLines.forEach((line, idx) => {
                    if (idx === 0) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(60, 60, 60);
                        doc.text('Date: ', marginLeft + 10, yPos);

                        doc.setFont('helvetica', 'normal');
                        doc.text(line.replace(/^Date:\s*/, ''), marginLeft + 10 + doc.getTextWidth('Date: '), yPos);
                    } else {
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(60, 60, 60);
                        doc.text(line, marginLeft + 10, yPos);
                    }
                    yPos += lineHeight;
                });

                // Render total
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(60, 60, 60); // keep dark gray
                doc.text(`Total: Rs.${order.total}`, marginLeft + 10, yPos);
                yPos += totalHeight;

                // divider after each order
                doc.setDrawColor(210, 210, 210);
                doc.line(marginLeft + 5, yPos, pageWidth - marginRight, yPos);
                yPos += dividerHeight;

            });
        }

        // ================= FOOTER (UNCHANGED) =================
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setDrawColor(210, 180, 140);
            doc.setLineWidth(0.5);
            doc.line(30, 280, 180, 280);

            doc.setFont('times', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(101, 67, 33);
            doc.text('CoffeeKaafiHai', pageWidth / 2, 285, { align: 'center' });

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text(`Page ${i} - Where Every Sip Tells a Story`, pageWidth / 2, 292, { align: 'center' });
        }

        const fileName = `CoffeeKaafiHai_UserData_${Date.now()}.pdf`;
        doc.save(fileName);
        return true;
    } catch (error) {
        console.error('PDF generation error:', error);
        return false;
    }
}

/**
 * Add logo to PDF document
 * @param {Object} doc - jsPDF document instance
 * @param {number} pageWidth - Page width
 */
async function addLogo(doc, pageWidth) {
    try {
        let logoDataUrl = logoBase64;
        
        if (!logoDataUrl) {
            const headerLogoEl = document.getElementById('headerLogo');
            const headerSrc = headerLogoEl && headerLogoEl.src ? headerLogoEl.src : null;
            let candidate = headerSrc || '/images/Logo.jpg';

            if (location && location.protocol === 'file:') {
                candidate = '/images/Logo.jpg';
            }

            if (typeof candidate === 'string' && candidate.indexOf('file:') === 0) {
                candidate = '/images/Logo.jpg';
            }

            if (candidate && candidate.indexOf('data:') === 0) {
                logoDataUrl = candidate;
            } else if (candidate) {
                try {
                    const r = await fetch(candidate);
                    if (r.ok) {
                        const blob = await r.blob();
                        logoDataUrl = await new Promise((res, rej) => {
                            const fr = new FileReader();
                            fr.onload = () => res(fr.result);
                            fr.onerror = rej;
                            fr.readAsDataURL(blob);
                        });
                    }
                } catch (fetchErr) {
                    console.warn('Failed to fetch logo:', fetchErr);
                }
            }
        }

        if (logoDataUrl) {
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function() {
                    try {
                        const logoSize = 35;
                        const logoX = (pageWidth - logoSize) / 2;
                        const canvas = document.createElement('canvas');
                        const size = 200;
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d');
                        const minSide = Math.min(img.width, img.height);
                        const sx = (img.width - minSide) / 2;
                        const sy = (img.height - minSide) / 2;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
                        ctx.restore();
                        const pngData = canvas.toDataURL('image/png');
                        doc.addImage(pngData, 'PNG', logoX, 20, logoSize, logoSize);
                        resolve();
                    } catch (err) { 
                        reject(err); 
                    }
                };
                img.onerror = function(err) { 
                    reject(err || new Error('logo image error')); 
                };
                img.src = logoDataUrl;
            });
        } else {
            // Fallback circle
            doc.setFillColor(210, 105, 30);
            doc.circle(pageWidth / 2, 37.5, 17.5, 'F');
        }
    } catch (e) {
        console.warn('Logo rendering failed:', e);
        doc.setFillColor(210, 105, 30);
        doc.circle(pageWidth / 2, 37.5, 17.5, 'F');
    }
}

/**
 * Add section header to PDF
 * @param {Object} doc - jsPDF document instance
 * @param {string} title - Section title
 * @param {number} x - X position
 * @param {number} y - Y position (will be modified by reference through yPos)
 */
function addSection(doc, title, x, y) {
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(101, 67, 33);
    doc.text(title, x, y);
}

/* =========================================================
   SECTION 6: NOTIFICATION MANAGEMENT
   Purpose: Handle notification preferences per user
========================================================= */

/**
 * Get notification storage key for current user
 * @returns {string} Storage key
 */
function getNotifStorageKey() {
    const userId = localStorage.getItem('currentUser') || localStorage.getItem('userId') || localStorage.getItem('userEmail') || 'guest';
    return `notifPrefs_${userId}`;
}

/**
 * Load notification preferences from storage
 * @returns {Object} Notification preferences
 */
function loadNotificationPreferences() {
    try {
        const stored = localStorage.getItem(getNotifStorageKey());
        let prefs = null;
        
        if (stored) {
            try { 
                prefs = JSON.parse(stored); 
            } catch (e) { 
                prefs = null; 
            }
        }

        if (!prefs && userProfileData && userProfileData.coffeePreferences) {
            prefs = {
                emailNotif: !!userProfileData.coffeePreferences.emailNotif,
                smsNotif: !!userProfileData.coffeePreferences.smsNotif
            };
        }

        if (!prefs) prefs = { emailNotif: true, smsNotif: false };

        const emailEl = document.getElementById('emailNotif');
        const smsEl = document.getElementById('smsNotif');
        if (emailEl) emailEl.checked = !!prefs.emailNotif;
        if (smsEl) smsEl.checked = !!prefs.smsNotif;

        // Mirror into in-memory profile for consistency
        if (!userProfileData) userProfileData = initializeUserProfile();
        if (!userProfileData.coffeePreferences) userProfileData.coffeePreferences = {};
        userProfileData.coffeePreferences.emailNotif = !!prefs.emailNotif;
        userProfileData.coffeePreferences.smsNotif = !!prefs.smsNotif;

        return prefs;
    } catch (e) {
        console.warn('loadNotificationPreferences failed', e);
        return { emailNotif: true, smsNotif: false };
    }
}

/**
 * Save notification preferences to storage
 * @param {Object} prefs - Preferences object with emailNotif and smsNotif
 * @returns {boolean} Success status
 */
function saveNotificationPreferences(prefs) {
    try {
        if (!prefs || typeof prefs !== 'object') return false;
        
        const key = getNotifStorageKey();
        localStorage.setItem(key, JSON.stringify({
            emailNotif: !!prefs.emailNotif,
            smsNotif: !!prefs.smsNotif
        }));

        // Also keep in userProfile for backward compatibility
        if (!userProfileData) userProfileData = initializeUserProfile();
        if (!userProfileData.coffeePreferences) userProfileData.coffeePreferences = {};
        userProfileData.coffeePreferences.emailNotif = !!prefs.emailNotif;
        userProfileData.coffeePreferences.smsNotif = !!prefs.smsNotif;
        
        localStorage.setItem('userProfile', JSON.stringify(userProfileData));
        return true;
    } catch (e) {
        console.warn('saveNotificationPreferences failed', e);
        return false;
    }
}

/* =========================================================
   SECTION 7: UI UTILITIES
   Purpose: Toast notifications and modal management
========================================================= */

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 */
/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 */
function showToast(message, type = 'success') {
    const toastState = window.__profileToastState || (window.__profileToastState = {
        activeToast: null,
        toastTimeout: null
    });
    const toastContainer = document.getElementById('toastContainer') || (function() {
        const c = document.createElement('div');
        c.id = 'toastContainer';
        c.className = 'toast-container';
        document.body.appendChild(c);
        return c;
    })();

    if (toastState.activeToast && toastState.activeToast.parentNode) {
        clearTimeout(toastState.toastTimeout);
        toastState.activeToast.remove();
        toastState.activeToast = null;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    
    let icon = '';
    switch(type) {
        case 'success': icon = '<i class="fas fa-check-circle toast-icon"></i>'; break;
        case 'error': icon = '<i class="fas fa-times-circle toast-icon"></i>'; break;
        case 'warning': icon = '<i class="fas fa-exclamation-triangle toast-icon"></i>'; break;
        case 'info': icon = '<i class="fas fa-info-circle toast-icon"></i>'; break;
    }
    
    toast.innerHTML = `${icon}<div class="toast-content"><p class="toast-message">${message}</p></div>`;
    toastContainer.appendChild(toast);
    toastState.activeToast = toast;
    
    toastState.toastTimeout = setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
            if (toastState.activeToast === toast) {
                toastState.activeToast = null;
            }
        }
    }, 4000);
}

/**
 * Open modal by ID
 * @param {string} modalId - Modal element ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close modal by ID
 * @param {string} modalId - Modal element ID
 */
function closeModal(modalId) {
    const modal = typeof modalId === 'string'
        ? document.getElementById(modalId)
        : (modalId && modalId.classList && modalId.classList.contains('modal')
            ? modalId
            : (modalId && modalId.closest ? modalId.closest('.modal') : null));
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active', 'show', 'open');

        // Reset inputs/forms inside the modal
        modal.querySelectorAll('form').forEach(form => form.reset());
        modal.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = false;
            } else {
                el.value = '';
            }
        });
        modal.querySelectorAll('.active').forEach(el => {
            if (el !== modal) el.classList.remove('active');
        });

        const anyOpen = Array.from(document.querySelectorAll('.modal')).some(m =>
            m.style.display === 'block' || m.classList.contains('active') || m.classList.contains('show') || m.classList.contains('open')
        );
        if (!anyOpen) {
            document.body.style.overflow = '';
        }
    }
}

/**
 * Show custom cancel order modal
 * @param {string} orderId - Order ID to cancel
 * @param {number} displayLimit - Display limit for refresh after cancel
 */
function showCancelOrderModal(orderId, displayLimit) {
    let modal = document.getElementById('cancelOrderModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cancelOrderModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Cancel Order</h2>
                    <span class="close" data-modal="cancelOrderModal">&times;</span>
                </div>
                <div class="modal-body">
                    <i class="fas fa-exclamation-triangle modal-icon icon-warning"></i>
                    <p><strong>Are you sure you want to cancel this order?</strong></p>
                    <p>Order ID: <span id="cancelOrderId"></span></p>
                    <p style="color: #666; margin-top: 15px;">This action cannot be undone. The order will be marked as cancelled.</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-cancel" id="cancelOrderModalCancel">No, Keep Order</button>
                    <button class="modal-btn modal-btn-danger" id="confirmCancelOrderBtn">Yes, Cancel Order</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Set the order ID in modal
    document.getElementById('cancelOrderId').textContent = orderId;

    // Set up confirm button handler
    const confirmBtn = document.getElementById('confirmCancelOrderBtn');
    
    // Remove old listeners by cloning the button
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new click handler
    newConfirmBtn.addEventListener('click', async function() {
        try {
            if (window.ordersManager && typeof window.ordersManager.cancelOrder === 'function') {
                const res = await window.ordersManager.cancelOrder(orderId, 'Cancelled by user from Profile');
                if (res && res.success) {
                    closeModal('cancelOrderModal');
                    showToast('Order cancelled successfully', 'success');
                    displayRecentOrders(displayLimit);
                    // FIX ISSUE 3: Explicitly update stats after cancel
                    updateProfileStats();
                    window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: res.order }));
                } else {
                    closeModal('cancelOrderModal');
                    showToast(res && res.message ? res.message : 'Unable to cancel order', 'error');
                }
            } else {
                closeModal('cancelOrderModal');
                showToast('Orders manager unavailable', 'error');
            }
        } catch (e) {
            console.error('Order cancel error:', e);
            closeModal('cancelOrderModal');
            showToast('Error cancelling order', 'error');
        }
    });

    openModal('cancelOrderModal');
}

/* =========================================================
   SECTION 8: USER DATA MANAGEMENT
   Purpose: Clear user data and handle logout
========================================================= */

/**
 * Clear all user-specific data and switch to guest mode
 * @returns {boolean} Success status
 */
function clearAllUserData() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        
        // Remove user from users database
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            delete users[currentUser];
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Remove user-specific keys
        const keys = ['userProfile', 'userEmail', 'isLoggedIn', 'currentUser', 'userHasUploadedAvatar', 
                     'name', 'profilePhoto', 'email', 'userFirstName', 'userLastName', 'userPhone'];
        keys.forEach(k => localStorage.removeItem(k));
        
        // Remove per-user profile and avatar flag
        if (currentUser) {
            localStorage.removeItem(`userProfile_${currentUser}`);
            localStorage.removeItem(`userHasUploadedAvatar_${currentUser}`);
        }
        
        // Remove per-user orders and carts
        if (currentUser) {
            localStorage.removeItem(`cart_${currentUser}`);
            localStorage.removeItem(`orders_${currentUser}`);
        }
        
        // Remove legacy keys
        localStorage.removeItem('userOrders');
        localStorage.removeItem('coffeeOrders');
        
        // Clear in-memory cart if available
        if (window.cartManager && typeof window.cartManager.clearCart === 'function') {
            window.cartManager.clearCart();
        }
        
        // Notify components
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        window.dispatchEvent(new Event('storage'));
        
        // Refresh state
        userProfileData = initializeUserProfile();
        updateProfileDisplay();
        displayRecentOrders();
        updateProfileStats();
        
        // Reload page
        window.location.reload();
        return true;
    } catch (err) {
        console.error('clearAllUserData failed', err);
        return false;
    }
}

/**
 * Clear only auth/session keys on logout (preserve user data for next login)
 * @returns {boolean} Success status
 */
function clearAuthSessionOnly() {
    try {
        // PERMANENT FIX: Reset in-memory profile data BEFORE clearing auth keys
        // This prevents stale data from interfering with the next login
        userProfileData = null;
        
        // Attempt server-side logout to clear session
        try {
            const name = 'csrftoken';
            let csrfToken = '';
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    csrfToken = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
            fetch('/api/auth/logout/', {
                method: 'POST',
                headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
                credentials: 'include'
            }).catch(() => {});
        } catch (e) { /* ignore */ }

        // Remove only auth/session keys
        const keys = ['userEmail', 'isLoggedIn', 'currentUser',
                     'name', 'profilePhoto', 'email', 'phone', 'userFirstName', 'userLastName', 'userPhone',
                     'accessToken', 'refreshToken', 'userSession', 'rememberMe'];
        keys.forEach(k => localStorage.removeItem(k));
        try { sessionStorage.removeItem('userSession'); } catch (e) { /* ignore */ }

        window.dispatchEvent(new CustomEvent('profileUpdated'));
        window.dispatchEvent(new Event('storage'));

        return true;
    } catch (err) {
        console.error('clearAuthSessionOnly failed', err);
        return false;
    }
}

/* =========================================================
   SECTION 9: EVENT LISTENERS SETUP
   Purpose: Initialize all event listeners on page load
========================================================= */

/**
 * Setup all event listeners for the page
 */
function setupEventListeners() {
    // Save Profile Form
    const personalInfoForm = document.getElementById("personalInfoForm");
    if (personalInfoForm) {
        personalInfoForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            if (!userProfileData) userProfileData = initializeUserProfile();
            
            userProfileData.firstName = document.getElementById('firstName')?.value || userProfileData.firstName || '';
            userProfileData.lastName = document.getElementById('lastName')?.value || userProfileData.lastName || '';
            userProfileData.email = document.getElementById('email')?.value || userProfileData.email || '';
            userProfileData.phone = document.getElementById('phone')?.value || userProfileData.phone || '';
            userProfileData.address = document.getElementById('address')?.value || userProfileData.address || '';

            saveUserProfile(userProfileData);
            showToast("Profile updated successfully!", "success");
        });
    }
    
    // Save Preferences
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', function() {
            saveCoffeePreferences();
            showToast('Coffee preferences saved successfully!', 'success');
        });
    }

    // Notification toggles
    setupNotificationToggles();
    
    // Avatar management
    setupAvatarHandlers();
    
    // Download PDF
    const downloadDataBtn = document.getElementById('downloadDataBtn');
    if (downloadDataBtn) {
        downloadDataBtn.addEventListener('click', function() {
            openModal('downloadModal');
        });
    }

    // Toggle orders view
    setupOrdersToggle();
    
    // Confirm download PDF
    const confirmDownloadBtn = document.getElementById('confirmDownloadBtn');
    if (confirmDownloadBtn) {
        confirmDownloadBtn.addEventListener('click', async function() {
            const startDate = document.getElementById('startDate')?.value;
            const endDate = document.getElementById('endDate')?.value;
            
            const success = await generateUserDataPDF(startDate, endDate);
            if (success) {
                closeModal('downloadModal');
                showToast('Data downloaded successfully as PDF!', 'success');
            } else {
                showToast('Error generating PDF. Please try again.', 'error');
            }
        });
    }
    
    // Logout
    setupLogoutHandlers();
    
    // Delete Account
    setupDeleteAccountHandlers();

    // Reset to Guest
    setupResetGuestHandlers();
}

/**
 * Setup notification toggle handlers
 */
function setupNotificationToggles() {
    const emailNotifEl = document.getElementById('emailNotif');
    const smsNotifEl = document.getElementById('smsNotif');
    
    if (emailNotifEl) {
        emailNotifEl.addEventListener('change', function() {
            const prefs = { 
                emailNotif: !!emailNotifEl.checked, 
                smsNotif: !!(smsNotifEl && smsNotifEl.checked) 
            };
            saveNotificationPreferences(prefs);
            saveUserProfile(userProfileData || initializeUserProfile());
            showToast(`Email notifications ${prefs.emailNotif ? 'enabled' : 'disabled'}`, 
                     prefs.emailNotif ? 'success' : 'info');
        });
    }
    
    if (smsNotifEl) {
        smsNotifEl.addEventListener('change', function() {
            const prefs = { 
                emailNotif: !!(emailNotifEl && emailNotifEl.checked), 
                smsNotif: !!smsNotifEl.checked 
            };
            saveNotificationPreferences(prefs);
            saveUserProfile(userProfileData || initializeUserProfile());
            showToast(`SMS notifications ${prefs.smsNotif ? 'enabled' : 'disabled'}`, 
                     prefs.smsNotif ? 'success' : 'info');
        });
    }
}

/**
 * Setup avatar upload and removal handlers
 */
function setupAvatarHandlers() {
    const uploadAvatarBtn = document.getElementById("uploadAvatarBtn");
    if (uploadAvatarBtn) {
        uploadAvatarBtn.addEventListener('click', function() {
            uploadAvatar();
        });
    }

    // Make avatar overlay and image clickable
    const avatarOverlay = document.getElementById('avatarOverlay');
    if (avatarOverlay) {
        avatarOverlay.addEventListener('click', function() { uploadAvatar(); });
        avatarOverlay.addEventListener('keypress', function(e) { 
            if (e.key === 'Enter' || e.key === ' ') uploadAvatar(); 
        });
    }

    const profileAvatarEl = document.getElementById('profileAvatar');
    if (profileAvatarEl) {
        profileAvatarEl.style.cursor = 'pointer';
        profileAvatarEl.addEventListener('click', function() { uploadAvatar(); });
    }
    
    // Remove Avatar
    const removeAvatarBtn = document.getElementById('removeAvatarBtn');
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', function() {
            openModal('removeAvatarModal');
        });
    }
    
    const confirmRemoveAvatarBtn = document.getElementById('confirmRemoveAvatarBtn');
    if (confirmRemoveAvatarBtn) {
        confirmRemoveAvatarBtn.addEventListener('click', function() {
            removeAvatar();
            closeModal('removeAvatarModal');
        });
    }
}

/**
 * Setup orders toggle button
 */
function setupOrdersToggle() {
    const toggleOrdersBtn = document.getElementById('toggleOrdersBtn');
    let showingAllOrders = true;
    
    if (toggleOrdersBtn) {
        toggleOrdersBtn.textContent = showingAllOrders ? 'Show Top 3' : 'Show All Orders';
        toggleOrdersBtn.addEventListener('click', function() {
            showingAllOrders = !showingAllOrders;
            if (showingAllOrders) {
                displayRecentOrders();
                toggleOrdersBtn.textContent = 'Show Top 3';
            } else {
                displayRecentOrders(3);
                toggleOrdersBtn.textContent = 'Show All Orders';
            }
        });
    }
}

/**
 * Setup logout handlers
 */
function setupLogoutHandlers() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            openModal('logoutModal');
        });
    }
    
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', async function() {
            try {
                if (!userProfileData) userProfileData = initializeUserProfile();

                // Sync latest form values before persisting
                try {
                    userProfileData.firstName = document.getElementById('firstName')?.value || userProfileData.firstName || '';
                    userProfileData.lastName = document.getElementById('lastName')?.value || userProfileData.lastName || '';
                    userProfileData.email = document.getElementById('email')?.value || userProfileData.email || '';
                    userProfileData.phone = document.getElementById('phone')?.value || userProfileData.phone || '';
                    userProfileData.address = document.getElementById('address')?.value || userProfileData.address || '';

                    if (!userProfileData.coffeePreferences) userProfileData.coffeePreferences = {};
                    userProfileData.coffeePreferences.coffeeType = document.getElementById('coffeeType')?.value || userProfileData.coffeePreferences.coffeeType || '';
                    userProfileData.coffeePreferences.milkPref = document.getElementById('milkPref')?.value || userProfileData.coffeePreferences.milkPref || '';
                    userProfileData.coffeePreferences.sugarLevel = document.getElementById('sugarLevel')?.value || userProfileData.coffeePreferences.sugarLevel || '';
                    userProfileData.coffeePreferences.cupSize = document.getElementById('cupSize')?.value || userProfileData.coffeePreferences.cupSize || '';
                    userProfileData.coffeePreferences.temperature = document.getElementById('temperature')?.value || userProfileData.coffeePreferences.temperature || '';
                    userProfileData.coffeePreferences.coffeeStrength = document.getElementById('coffeeStrength')?.value || userProfileData.coffeePreferences.coffeeStrength || '';

                    const emailNotifEl = document.getElementById('emailNotif');
                    const smsNotifEl = document.getElementById('smsNotif');
                    if (emailNotifEl) userProfileData.coffeePreferences.emailNotif = !!emailNotifEl.checked;
                    if (smsNotifEl) userProfileData.coffeePreferences.smsNotif = !!smsNotifEl.checked;
                } catch (e) { /* ignore */ }

                // Persist profile to backend BEFORE logout
                try {
                    await persistProfileToBackend(userProfileData);
                } catch (e) {
                    console.warn('logout: failed to persist profile before logout', e);
                }
            } catch (e) {
                console.warn('logout: failed during profile persistence', e);
            }
            closeModal('logoutModal');
            showToast('Logged out successfully.', 'info');
            clearAuthSessionOnly();
            setTimeout(function() {
                if (location.href && location.href.indexOf('/profile/') !== -1) {
                    window.location.href = '/login/';
                } else {
                    window.location.href = '/';
                }
            }, 3500);
        });
    }
}

/**
 * Setup delete account handlers
 */
function setupDeleteAccountHandlers() {
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            openModal('deleteModal');
        });
    }
    
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async function() {
            const email = localStorage.getItem('currentUser') || localStorage.getItem('userEmail');
            if (!email) {
                closeModal('deleteModal');
                showToast('User session expired. Please log in again.', 'error');
                return;
            }

            try {
                const resp = await fetch(`/api/admin/mongo-users/${encodeURIComponent(email)}/`, {
                    method: 'DELETE',
                    credentials: 'same-origin'
                });

                if (!resp.ok) {
                    const errData = await resp.json().catch(() => ({}));
                    closeModal('deleteModal');
                    showToast(errData && errData.message ? errData.message : 'Unable to delete account. Please try again.', 'error');
                    return;
                }

                closeModal('deleteModal');
                clearAuthSessionOnly();
                localStorage.clear();
                try { sessionStorage.clear(); } catch (e) { /* ignore */ }
                showToast('Account deleted. Redirecting to home page...', 'warning');
                setTimeout(function() {
                    window.location.href = '/';
                }, 2500);
            } catch (e) {
                closeModal('deleteModal');
                showToast('Unable to delete account. Please try again.', 'error');
            }
        });
    }
}

/**
 * Setup reset to guest handlers
 */
function setupResetGuestHandlers() {
    const resetGuestBtn = document.getElementById('resetGuestBtn');
    if (resetGuestBtn) {
        resetGuestBtn.addEventListener('click', function() {
            openModal('resetGuestModal');
        });
    }

    const confirmResetGuestBtn = document.getElementById('confirmResetGuestBtn');
    if (confirmResetGuestBtn) {
        confirmResetGuestBtn.addEventListener('click', function() {
            clearAllUserData();
            closeModal('resetGuestModal');
            showToast('Cleared user data. Now in guest mode.', 'info');
        });
    }
}

/**
 * Setup modal close handlers
 */
function setupModalHandlers() {
    if (window.__modalDelegationReady) return;
    window.__modalDelegationReady = true;

    document.addEventListener('click', function(event) {
        const closeTrigger = event.target.closest('.close, .modal-btn-cancel');
        if (closeTrigger) {
            const modalId = closeTrigger.getAttribute('data-modal');
            closeModal(modalId || closeTrigger);
            return;
        }

        if (event.target.classList && event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            const openModals = Array.from(document.querySelectorAll('.modal')).filter(m =>
                m.style.display === 'block' || m.classList.contains('active') || m.classList.contains('show') || m.classList.contains('open')
            );
            if (openModals.length > 0) {
                closeModal(openModals[openModals.length - 1]);
            }
        }
    });
}

/* =========================================================
   SECTION 10.1: BACKEND SYNC
   Purpose: Ensure data persistence by fetching from DB on load
========================================================= */

/**
 * Sync profile and orders from backend to ensure persistence
 * Fixes Bug #1: Data loss on refresh/restart
 */
async function syncUserData() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) return;

    try {
        // 1. Sync Profile from DB (Source of Truth)
        const profileResp = await fetch('/profile/', { credentials: 'same-origin' }); // Session-auth profile sync
        if (profileResp.ok) {
            const data = await profileResp.json();
            if (data.success && data.user) {
                userProfileData = data.user;
                const currentUser = localStorage.getItem('currentUser') || data.user.email;
                if (currentUser) {
                    localStorage.setItem(`userProfile_${currentUser}`, JSON.stringify(userProfileData));
                    // Update legacy keys for compatibility
                    localStorage.setItem('name', `${userProfileData.firstName} ${userProfileData.lastName}`);
                    localStorage.setItem('email', userProfileData.email);
                    localStorage.setItem('phone', userProfileData.phone);
                }
                updateProfileDisplay();
                updateProfileStats();
            }
        }

        // 2. Sync Orders from DB
        const email = userProfileData?.email || localStorage.getItem('currentUser');
        if (email) {
            // Fix: Use the consistent API endpoint or authAPI helper
            if (window.authAPI && typeof window.authAPI.getUserOrders === 'function') {
                const response = await window.authAPI.getUserOrders();
                if (response && response.success && Array.isArray(response.orders) && response.orders.length > 0) {
                    const currentUser = localStorage.getItem('currentUser');
                    localStorage.setItem(`orders_${currentUser}`, JSON.stringify(response.orders));
                    window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: response.orders }));
                }
            } else {
                // Fallback to direct fetch with correct endpoint /api/orders/
                const ordersResp = await fetch('/api/orders/', { credentials: 'same-origin' });
                if (ordersResp.ok) {
                    const data = await ordersResp.json();
                    if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
                        const currentUser = localStorage.getItem('currentUser');
                        localStorage.setItem(`orders_${currentUser}`, JSON.stringify(data.orders));
                        window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: data.orders }));
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Backend sync failed:', e);
    }
}

/* =========================================================
   SECTION 10: INITIALIZATION
   Purpose: Initialize the application on page load
========================================================= */

/**
 * Initialize orders manager on load
 */
function initOrdersManager() {
    // Initialize profile
    initializeUserProfile();
    updateProfileDisplay();

    // Render orders only for logged-in users
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        displayRecentOrders(3);
    } else {
        const container = document.getElementById('recentOrdersContainer');
        if (container) container.innerHTML = '';
        updateProfileStats();
    }

    // React to order updates
    window.addEventListener('ordersUpdated', () => {
        displayRecentOrders(3);
    });

    // React to profile changes
    window.addEventListener('profileUpdated', () => {
        const logged = localStorage.getItem('isLoggedIn') === 'true';
        if (logged) {
            displayRecentOrders(3);
        } else {
            const c = document.getElementById('recentOrdersContainer');
            if (c) c.innerHTML = '';
            updateProfileStats();
        }
    });
}

// Initialize orders manager on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initOrdersManager);

/**
 * Main initialization on DOMContentLoaded
 */
window.addEventListener("DOMContentLoaded", async () => {
    console.log("Dynamic Profile Manager: Initializing");
    
    await loadLogoBase64();
    
    // Update header logo if loaded
    if (logoBase64) {
        const headerLogo = document.getElementById('headerLogo');
        if (headerLogo) {
            headerLogo.src = logoBase64;
        }
    }

    // Reset userProfileData to ensure fresh load for current user
    userProfileData = null;
    
    // Initialize user profile
    userProfileData = initializeUserProfile();
    
    // Redirect to login if not logged in on profile page
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn && location.href && location.href.indexOf('/profile/') !== -1) {
        window.location.href = '/login/';
        return;
    }

    // Enable/disable profile controls based on login state
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) saveBtn.disabled = !isLoggedIn;
    
    const inputs = document.querySelectorAll('#personalInfoForm input, #personalInfoForm textarea, #personalInfoForm select');
    inputs.forEach(i => { i.disabled = !isLoggedIn; });
    
    // Update profile display
    updateProfileDisplay();
    
    // Load notification preferences
    loadNotificationPreferences();
    
    // Display recent orders
    displayRecentOrders(3);
    
    // Setup modal handlers
    setupModalHandlers();
    
    // Setup all event listeners
    setupEventListeners();

    // PERMANENT FIX: Fetch latest data from backend to prevent data loss
    syncUserData();
});

/**
 * PERMANENT FIX: Listen for storage changes from same/other tabs and sync profile
 * This ensures profile data stays consistent across tabs and after login/logout
 */
window.addEventListener('storage', function(e) {
    // Reload profile when authentication state changes
    if (e.key === 'isLoggedIn' || e.key === 'currentUser') {
        console.log('Storage changed: Authentication state updated. Reloading profile...');
        // Reset profile data to force reload from localStorage
        userProfileData = null;
        // Reinitialize with new user data
        userProfileData = initializeUserProfile();
        // Update UI if on profile page
        if (typeof updateProfileDisplay === 'function') {
            try {
                updateProfileDisplay();
            } catch (err) {
                console.warn('Failed to update profile display on storage event', err);
            }
        }
    }
});

/* =========================================================
   SECTION 11: EXPORTS
   Purpose: Export functions for use in other scripts
========================================================= */

window.DynamicProfileManager = {
    // Profile Management
    initializeUserProfile,
    saveUserProfile,
    updateProfileDisplay,
    saveCoffeePreferences,
    
    // Order Management
    getAllOrders,
    getRecentOrders,
    filterOrdersByDateRange,
    calculateProfileStats,
    updateProfileStats,
    displayRecentOrders,
    addNewOrder,
    
    // Avatar Management
    uploadAvatar,
    removeAvatar,
    
    // PDF Generation
    generateUserDataPDF,
    
    // Utilities
    showToast,
    openModal,
    closeModal,
    showCancelOrderModal
};

