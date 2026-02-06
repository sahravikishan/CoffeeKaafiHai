// Checkout Manager - UPDATED WITH RAZORPAY INTEGRATION
class CheckoutManager {
    constructor() {
        this.checkoutModal = null;
        this.selectedPaymentMethod = null;
        this.deliveryAddress = '';
        this.currentStep = 1;
        this.orderType = 'delivery'; // default order type
        this.init();
    }

    init() {
        this.createCheckoutModal();
    }

    createCheckoutModal() {
        const existing = document.getElementById('checkoutModal');
        if (existing) {
            this.checkoutModal = existing;
            return;
        }

        const modalHTML = `
            <div id="checkoutModal" class="checkout-modal">
                <div class="checkout-modal-overlay"></div>
                <div class="checkout-modal-content">
                    <div class="checkout-modal-header">
                        <h2 class="checkout-modal-title">
                            <i class="fas fa-shopping-bag"></i>
                            Checkout
                        </h2>
                        <button class="checkout-modal-close" id="closeCheckoutModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="checkout-steps">
                        <div class="checkout-step active" id="step1Indicator">
                            <div class="step-number">1</div>
                            <div class="step-label">Delivery Address</div>
                        </div>
                        <div class="checkout-step-divider"></div>
                        <div class="checkout-step" id="step2Indicator">
                            <div class="step-number">2</div>
                            <div class="step-label">Payment</div>
                        </div>
                    </div>
                    
                    <div class="checkout-modal-body">
                        <div class="checkout-section">
                            <h3 class="checkout-section-title">
                                <i class="fas fa-store"></i>
                                Order Type
                            </h3>
                            <div class="order-type-options">
                                <label class="order-type-card">
                                    <input type="radio" name="orderType" value="delivery" checked>
                                    <div class="order-type-content">
                                        <h4>Delivery</h4>
                                        <p>Home delivery to your address</p>
                                    </div>
                                </label>
                                
                                <label class="order-type-card">
                                    <input type="radio" name="orderType" value="in_shop">
                                    <div class="order-type-content">
                                        <h4>In-Shop Pickup (Customer is here)</h4>
                                        <p>Pickup from store counter</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div id="addressStep" class="checkout-step-content active">
                            <div class="checkout-section">
                                <h3 class="checkout-section-title">
                                    <i class="fas fa-map-marker-alt"></i>
                                    Delivery Address
                                </h3>
                                <div class="address-form">
                                    <div class="form-group">
                                        <label for="fullName">Full Name *</label>
                                        <input type="text" id="fullName" class="form-control" placeholder="Enter your full name" required>
                                        <div class="error-message" id="fullNameError"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="phoneNumber">Phone Number (10 digits) *</label>
                                        <input type="tel" id="phoneNumber" class="form-control" placeholder="Enter 10 digit phone number" maxlength="10" required>
                                        <div class="error-message" id="phoneNumberError"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="addressLine">Address *</label>
                                        <textarea id="addressLine" class="form-control" rows="3" placeholder="House no., Building name, Street" required></textarea>
                                        <div class="error-message" id="addressLineError"></div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="city">City *</label>
                                            <input type="text" id="city" class="form-control" placeholder="City" required>
                                            <div class="error-message" id="cityError"></div>
                                        </div>
                                        <div class="form-group">
                                            <label for="pincode">Pincode (6 digits) *</label>
                                            <input type="text" id="pincode" class="form-control" placeholder="Enter 6 digit pincode" maxlength="6" required>
                                            <div class="error-message" id="pincodeError"></div>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="landmark">Landmark (Optional)</label>
                                        <input type="text" id="landmark" class="form-control" placeholder="Nearby landmark">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="paymentStep" class="checkout-step-content" style="display:none;">
                            <div class="checkout-section">
                                <h3 class="checkout-section-title">
                                    <i class="fas fa-list"></i>
                                    Order Summary
                                </h3>
                                <div id="checkoutOrderSummary" class="checkout-order-summary">
                                    <!-- Cart-style items will be rendered here -->
                                </div>
                                <div class="checkout-totals">
                                    <div class="checkout-total-row">
                                        <span>Subtotal:</span>
                                        <span id="checkoutSubtotal">₹0</span>
                                    </div>
                                    <div class="checkout-total-row">
                                        <span>Tax (5% GST):</span>
                                        <span id="checkoutTax">₹0</span>
                                    </div>
                                    <div class="checkout-total-row checkout-grand-total">
                                        <span>Total:</span>
                                        <span id="checkoutGrandTotal">₹0</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="checkout-section">
                                <h3 class="checkout-section-title">
                                    <i class="fas fa-credit-card"></i>
                                    Payment Method
                                </h3>
                                <div class="payment-methods">
                                    <label class="payment-method-card">
                                        <input type="radio" name="paymentMethod" value="razorpay" checked>
                                        <div class="payment-method-content">
                                            <div class="payment-method-icon">
                                                <i class="fas fa-mobile-alt"></i>
                                            </div>
                                            <div class="payment-method-info">
                                                <h4>UPI / Card / Netbanking</h4>
                                                <p>Pay securely via Razorpay</p>
                                            </div>
                                        </div>
                                    </label>
                                    
                                    <label class="payment-method-card">
                                        <input type="radio" name="paymentMethod" value="cod">
                                        <div class="payment-method-content">
                                            <div class="payment-method-icon">
                                                <i class="fas fa-money-bill-wave"></i>
                                            </div>
                                            <div class="payment-method-info">
                                                <h4 id="codLabel">Cash on Delivery</h4>
                                                <p id="codDesc">Pay at the counter</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="checkout-modal-footer">
                        <button class="checkout-btn-cancel" id="cancelCheckout">Cancel</button>
                        <button class="checkout-btn-back" id="backToAddress" style="display: none;">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <button class="checkout-btn-next" id="proceedToPayment">
                            Next <i class="fas fa-arrow-right"></i>
                        </button>
                        <button class="checkout-btn-place-order" id="placeOrderBtn" style="display: none;">
                            <i class="fas fa-check"></i> Place Order
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.checkoutModal = document.getElementById('checkoutModal');

        const closeEl = document.getElementById('closeCheckoutModal'); 
        if (closeEl) closeEl.addEventListener('click', () => this.close());
        
        const cancelEl = document.getElementById('cancelCheckout'); 
        if (cancelEl) cancelEl.addEventListener('click', () => this.close());
        
        const overlay = this.checkoutModal?.querySelector('.checkout-modal-overlay'); 
        if (overlay) overlay.addEventListener('click', () => this.close());

        const nextBtn = document.getElementById('proceedToPayment');
        if (nextBtn) nextBtn.addEventListener('click', () => this.proceedToPayment());

        const backBtn = document.getElementById('backToAddress');
        if (backBtn) backBtn.addEventListener('click', () => this.backToAddress());

        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedPaymentMethod = e.target.value;
            });
        });

        // Add order type change listeners
        document.querySelectorAll('input[name="orderType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.orderType = e.target.value;
                this.toggleAddressStep();
            });
        });

        const placeBtn = document.getElementById('placeOrderBtn'); 
        if (placeBtn) placeBtn.addEventListener('click', () => this.placeOrder());

        // Add input validation listeners
        this.setupInputValidation();
    }

    toggleAddressStep() {
        const addressStep = document.getElementById('addressStep');
        if (this.orderType === 'in_shop') {
            addressStep.style.display = 'none';
            this.deliveryAddress = 'In-Shop Pickup – Customer Present';
        } else {
            addressStep.style.display = 'block';
        }
        this.updatePaymentLabels();
    }

    updatePaymentLabels() {
        const codLabel = document.getElementById('codLabel');
        const codDesc = document.getElementById('codDesc');
        if (this.orderType === 'in_shop') {
            if (codLabel) codLabel.textContent = 'Pay at Counter';
            if (codDesc) codDesc.textContent = 'Pay when picking up your order';
        } else {
            if (codLabel) codLabel.textContent = 'Cash on Delivery';
            if (codDesc) codDesc.textContent = 'Pay at the counter';
        }
    }

    setupInputValidation() {
        // Phone number validation - only allow digits
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                this.clearError('phoneNumberError');
            });
        }

        // Pincode validation - only allow digits
        const pincodeInput = document.getElementById('pincode');
        if (pincodeInput) {
            pincodeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                this.clearError('pincodeError');
            });
        }

        // Clear errors on input for other fields
        ['fullName', 'addressLine', 'city'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.clearError(fieldId + 'Error');
                });
            }
        });
    }

    showError(errorId, message) {
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            errorEl.style.color = '#ff4444';
            errorEl.style.fontSize = '0.9rem';
            errorEl.style.marginTop = '5px';
            errorEl.style.fontWeight = '500';
        }
    }

    clearError(errorId) {
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }

    clearAllErrors() {
        ['fullNameError', 'phoneNumberError', 'addressLineError', 'cityError', 'pincodeError'].forEach(errorId => {
            this.clearError(errorId);
        });
    }

    open() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            if (window.cartManager && typeof window.cartManager.showLoginRequiredModal === 'function') {
                window.cartManager.showLoginRequiredModal();
            } else if (window.cartManager && typeof window.cartManager.showToast === 'function') {
                window.cartManager.showToast('Please log in to place orders.', 'warning');
            }
            return;
        }
        const cart = cartManager.getCart();
        if (cart.length === 0) {
            if (window.showToast) window.showToast('Your cart is empty!', 'warning'); 
            else if (cartManager?.showToast) cartManager.showToast('Your cart is empty!', 'warning');
            return;
        }
        
        // Clear all errors
        this.clearAllErrors();
        
        // FORCE CLEAR ALL ADDRESS FIELDS - Fix for Issue 2
        this.forceResetAllFields();

        // Load name/phone from saved profile or signup values (but NOT address)
        this.loadUserBasicInfo();

        // Reset to step 1
        this.currentStep = 1;
        this.showStep(1);

        // Reset order type to delivery
        this.orderType = 'delivery';
        const deliveryRadio = document.querySelector('input[name="orderType"][value="delivery"]');
        if (deliveryRadio) deliveryRadio.checked = true;
        this.toggleAddressStep();

        this.checkoutModal.classList.add('checkout-modal-active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.checkoutModal.classList.remove('checkout-modal-active');
        document.body.style.overflow = 'auto';
        this.currentStep = 1;
        this.clearAllErrors();
    }

    forceResetAllFields() {
        // AGGRESSIVE CLEAR: Clear ALL address-related fields completely
        const addressFields = ['addressLine', 'city', 'pincode', 'landmark'];

        addressFields.forEach(fieldId => {
            const el = document.getElementById(fieldId);
            if (el) {
                el.value = '';
                el.defaultValue = '';
                el.setAttribute('value', '');
                // Force DOM update
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }

    loadUserBasicInfo() {
        // Load ONLY name and phone - NOT address fields
        const currentUser = localStorage.getItem('currentUser');

        // Try to load from user-specific profile first
        let profile = null;
        if (currentUser) {
            try {
                profile = JSON.parse(localStorage.getItem(`userProfile_${currentUser}`) || 'null');
            } catch (e) {
                profile = null;
            }
        }

        // Fallback to global userProfile
        if (!profile) {
            try {
                profile = JSON.parse(localStorage.getItem('userProfile') || 'null');
            } catch (e) {
                profile = null;
            }
        }

        const fullNameEl = document.getElementById('fullName');
        const phoneEl = document.getElementById('phoneNumber');

        if (profile) {
            const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
            if (fullNameEl && name && name !== 'FirstName LastName') fullNameEl.value = name;
            if (phoneEl && profile.phone) {
                // Clean phone number - remove any non-digits
                const cleanPhone = String(profile.phone).replace(/[^0-9]/g, '');
                if (cleanPhone.length >= 10) phoneEl.value = cleanPhone;
            }
            return;
        }

        // Fallback to users database
        if (currentUser) {
            try {
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                const userData = users[currentUser];

                if (userData) {
                    const name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
                    if (fullNameEl && name) fullNameEl.value = name;
                    if (phoneEl && userData.phone) {
                        const cleanPhone = String(userData.phone).replace(/[^0-9]/g, '');
                        phoneEl.value = cleanPhone;
                    }
                    return;
                }
            } catch (e) {
                console.warn('Failed to load from users database:', e);
            }
        }

        // Final fallback to legacy signup keys
        const firstName = localStorage.getItem('userFirstName') || '';
        const lastName = localStorage.getItem('userLastName') || '';
        const phone = localStorage.getItem('userPhone') || '';

        if (fullNameEl && (firstName || lastName)) {
            fullNameEl.value = `${firstName} ${lastName}`.trim();
        }
        if (phoneEl && phone) {
            const cleanPhone = String(phone).replace(/[^0-9]/g, '');
            phoneEl.value = cleanPhone;
        }
    }

    validateAddress() {
        this.clearAllErrors();
        let isValid = true;

        const fullName = document.getElementById('fullName')?.value.trim() || '';
        const phone = document.getElementById('phoneNumber')?.value.trim() || '';
        const address = document.getElementById('addressLine')?.value.trim() || '';
        const city = document.getElementById('city')?.value.trim() || '';
        const pincode = document.getElementById('pincode')?.value.trim() || '';

        // Validate full name
        if (!fullName) {
            this.showError('fullNameError', 'Please enter your full name');
            isValid = false;
        }

        // Validate phone number
        if (!phone) {
            this.showError('phoneNumberError', 'Please enter your phone number');
            isValid = false;
        } else if (!/^\d{10}$/.test(phone)) {
            this.showError('phoneNumberError', 'Phone number must be exactly 10 digits');
            isValid = false;
        }

        // Validate address
        if (!address) {
            this.showError('addressLineError', 'Please enter your address');
            isValid = false;
        }

        // Validate city
        if (!city) {
            this.showError('cityError', 'Please enter your city');
            isValid = false;
        }

        // Validate pincode
        if (!pincode) {
            this.showError('pincodeError', 'Please enter your pincode');
            isValid = false;
        } else if (!/^\d{6}$/.test(pincode)) {
            this.showError('pincodeError', 'Pincode must be exactly 6 digits');
            isValid = false;
        }

        return isValid;
    }

    proceedToPayment() {
        if (this.orderType === 'delivery' && !this.validateAddress()) return;

        if (this.orderType === 'delivery') {
            const fullName = document.getElementById('fullName').value.trim();
            const phone = document.getElementById('phoneNumber').value.trim();
            const address = document.getElementById('addressLine').value.trim();
            const city = document.getElementById('city').value.trim();
            const pincode = document.getElementById('pincode').value.trim();
            const landmark = document.getElementById('landmark').value.trim();

            this.deliveryAddress = `${fullName}, ${phone}, ${address}, ${city}, ${pincode}${landmark ? ', Near ' + landmark : ''}`;

            // Save address to profile if user is logged in
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const currentUser = localStorage.getItem('currentUser');
            if (isLoggedIn && currentUser) {
                try {
                    const profileKey = `userProfile_${currentUser}`;
                    let profile = JSON.parse(localStorage.getItem(profileKey) || 'null') || {};
                    profile.phone = phone;
                    profile.address = address;
                    profile.city = city;
                    profile.pincode = pincode;
                    profile.landmark = landmark;
                    localStorage.setItem(profileKey, JSON.stringify(profile));
                } catch (e) {
                    console.error('Failed to save address to profile:', e);
                }
            }
        } // For in_shop, deliveryAddress is already set in toggleAddressStep

        this.currentStep = 2;
        this.showStep(2);
        this.renderOrderSummary();
    }

    backToAddress() {
        this.currentStep = 1;
        this.showStep(1);
    }

    showStep(step) {
        const step1 = document.getElementById('step1Indicator');
        const step2 = document.getElementById('step2Indicator');
        const addressStep = document.getElementById('addressStep');
        const paymentStep = document.getElementById('paymentStep');
        const nextBtn = document.getElementById('proceedToPayment');
        const backBtn = document.getElementById('backToAddress');
        const placeBtn = document.getElementById('placeOrderBtn');

        if (step === 1) {
            if (step1) {
                step1.classList.add('active');
                step1.classList.remove('completed');
            }
            if (step2) step2.classList.remove('active');

            if (addressStep) {
                addressStep.classList.add('active');
                addressStep.style.display = 'block';
            }
            if (paymentStep) {
                paymentStep.classList.remove('active');
                paymentStep.style.display = 'none';
            }

            if (nextBtn) nextBtn.style.display = 'flex';
            if (backBtn) backBtn.style.display = 'none';
            if (placeBtn) placeBtn.style.display = 'none';
        } else {
            if (step1) step1.classList.add('active', 'completed');
            if (step2) step2.classList.add('active');

            if (addressStep) {
                addressStep.classList.remove('active');
                addressStep.style.display = 'none';
            }
            if (paymentStep) {
                paymentStep.classList.add('active');
                paymentStep.style.display = 'block';
            }

            if (nextBtn) nextBtn.style.display = 'none';
            if (backBtn) backBtn.style.display = 'flex';
            if (placeBtn) placeBtn.style.display = 'flex';
        }
    }

    renderOrderSummary() {
        const cart = cartManager.getCart();
        const container = document.getElementById('checkoutOrderSummary');

        // MATCH CART UI DESIGN: Use same card layout as cart sidebar
        container.innerHTML = cart.map(item => {
            const qty = Number(item.quantity || 0);
            const price = Number(item.price || 0);
            const sizeText = (item.size && typeof item.size === 'string')
                ? (item.size.charAt(0).toUpperCase() + item.size.slice(1))
                : (item.size || 'N/A');
            const imgSrc = item.image || '/images/Cart.jpg';

            // EXACT SAME STRUCTURE AS CART UI
            return `
                <div class="cart-item" style="border-bottom: 1px solid rgba(0,0,0,0.06); padding: 12px 0;">
                    <div class="cart-item-image">
                        <img src="${imgSrc}" alt="${item.name}" style="width:72px; height:72px; object-fit:cover; border-radius:8px;" onerror="this.onerror=null;this.src='/images/Cart.jpg'">
                    </div>
                    <div class="cart-item-details" style="flex:1;">
                        <h4 class="cart-item-name" style="margin:0 0 4px 0; font-weight:600;">${item.name}</h4>
                        <p class="cart-item-size" style="margin:0; color:#666; font-size:0.9rem;">Size: ${sizeText}</p>
                        <p class="cart-item-price" style="margin:0; color:#666; font-size:0.9rem;">₹${price} each × ${qty}</p>
                    </div>
                    <div class="cart-item-total" style="min-width:72px; text-align:right; font-weight:700;">
                        ₹${price * qty}
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('checkoutSubtotal').textContent = `₹${cartManager.getSubtotal()}`;
        document.getElementById('checkoutTax').textContent = `₹${cartManager.getTax()}`;
        document.getElementById('checkoutGrandTotal').textContent = `₹${cartManager.getTotal()}`;
    }

    async placeOrder() {
        const paymentMethod = this.selectedPaymentMethod || 'razorpay';

        if (paymentMethod === 'razorpay') {
            this.initiateRazorpayPayment();
        } else if (paymentMethod === 'cod') {
            this.placeCODOrder();
        }
    }

    initiateRazorpayPayment() {
        // Check if Razorpay Gateway is available
        if (typeof razorpayGateway === 'undefined') {
            if (window.showToast) window.showToast('Payment gateway not initialized. Please refresh the page.', 'error');
            else if (cartManager?.showToast) cartManager.showToast('Payment gateway not initialized. Please refresh the page.', 'error');
            return;
        }

        const total = cartManager.getTotal();
        const subtotal = cartManager.getSubtotal();
        const tax = cartManager.getTax();
        const orderId = this.generateOrderId();

        const fullName = document.getElementById('fullName').value.trim();
        const email = localStorage.getItem('userEmail') || 'customer@coffeekaafihai.com';
        const phone = document.getElementById('phoneNumber').value.trim();

        // Prepare order details for Razorpay Gateway
        const orderDetails = {
            orderId: orderId,
            amount: total,
            subtotal: subtotal,
            tax: tax,
            customerName: fullName,
            customerEmail: email,
            customerPhone: phone,
            deliveryAddress: this.deliveryAddress,
            items: cartManager.getCart(),
            onSuccess: (paymentData) => {
                // Payment successful callback
                this.handlePaymentSuccess(paymentData, orderId);
            },
            onFailure: (error) => {
                // Payment failure callback
                console.error('Payment failed:', error);
            }
        };

        // Close checkout modal before opening Razorpay
        this.close();

        // Initiate payment through Razorpay Gateway
        razorpayGateway.initiatePayment(orderDetails);
    }

    handlePaymentSuccess(paymentData, orderId) {
        const order = this.createOrder(orderId, 'razorpay', 'paid', paymentData);
        this.saveOrder(order);
        cartManager.clearCart();

        // Success is handled by Razorpay Gateway status modal
        // No need to show additional confirmation here
    }

    placeCODOrder() {
        const orderId = this.generateOrderId();
        const order = this.createOrder(orderId, 'cod', 'pending');
        this.saveOrder(order);
        this.close();
        cartManager.clearCart();
        this.showOrderConfirmation(order);
    }

    createOrder(orderId, paymentMethod, paymentStatus, paymentData = null) {
        const order = {
            orderId: orderId,
            items: cartManager.getCart(),
            subtotal: cartManager.getSubtotal(),
            tax: cartManager.getTax(),
            total: cartManager.getTotal(),
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            orderDate: new Date().toISOString(),
            date: new Date().toISOString(),
            dateDisplay: new Date().toLocaleString(),
            status: 'pending',
            deliveryAddress: this.deliveryAddress,
            orderType: this.orderType
        };

        // Add payment data if available
        if (paymentData) {
            order.paymentId = paymentData.razorpay_payment_id || null;
            order.paymentOrderId = paymentData.razorpay_order_id || null;
            order.paymentSignature = paymentData.razorpay_signature || null;
        }

        return order;
    }

    saveOrder(order) {
        try {
            // Persist to backend for profile + loyalty stats
            if (typeof createOrder === 'function') {
                const extra = {
                    status: (order.paymentStatus === 'paid') ? 'paid' : (order.status || 'pending'),
                    clientOrderId: order.orderId,
                    orderType: order.orderType || '',
                    deliveryAddress: order.deliveryAddress || '',
                    paymentMethod: order.paymentMethod || '',
                    paymentStatus: order.paymentStatus || '',
                    subtotal: order.subtotal || 0,
                    tax: order.tax || 0
                };
                createOrder(order.items || [], order.total || 0, extra)
                    .then((resp) => {
                        if (resp && resp.order && resp.order.orderId) {
                            order.backendOrderId = resp.order.orderId;
                        }
                    })
                    .catch((e) => {
                        console.warn('saveOrder: backend persist failed', e);
                    });
            }

            if (typeof addNewOrder === 'function') {
                addNewOrder(order, { suppressToast: true });
                return;
            }

            // Fallback: save to per-user orders
            const userId = localStorage.getItem('currentUser') || localStorage.getItem('userId') || localStorage.getItem('userEmail');
            if (userId) {
                const orders = JSON.parse(localStorage.getItem(`orders_${userId}`) || '[]');
                orders.unshift(order);
                localStorage.setItem(`orders_${userId}`, JSON.stringify(orders));
            }
        } catch (e) {
            console.error('saveOrder: failed to persist order', e);
        }
    }

    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${random}`;
    }

    showOrderConfirmation(order) {
        const existing = document.getElementById('orderConfirmationModal');
        if (existing) existing.remove();

        if (!document.getElementById('order-confirmation-style')) {
            const style = document.createElement('style');
            style.id = 'order-confirmation-style';
            style.textContent = `
                .order-confirmation-modal { position: fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; }
                .order-confirmation-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); }
                .order-confirmation-content { position:relative; align-items:center; z-index:10000; background:#fff; border-radius:35px; width:90%; max-width:720px; max-height:90vh; overflow:auto; box-shadow:0 30px 80px rgba(0,0,0,0.3); padding:20px 22px; }
                .order-confirmation-actions{ display:flex; gap:12px; justify-content:center; padding:14px 0 8px; }
                body.order-confirmation-open nav, body.order-confirmation-open footer { opacity:0.4; pointer-events:none; }
            `;
            document.head.appendChild(style);
        }

        const confirmationHTML = `
            <div id="orderConfirmationModal" class="order-confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="orderConfirmationTitle">
                <div class="order-confirmation-overlay"></div>
                <div class="order-confirmation-content">
                    <div class="order-confirmation-icon">
                        <i class="fas fa-check-circle" aria-hidden="true"></i>
                    </div>
                    <h2 class="order-confirmation-title" id="orderConfirmationTitle">Order Placed Successfully!</h2>
                    <div class="order-confirmation-details">
                        <p><strong>Order ID:</strong> ${order.orderId}</p>
                        <p><strong>Total Amount:</strong> ₹${order.total}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</p>
                        <p><strong>Payment Status:</strong> ${order.paymentStatus === 'paid' ? 'Paid' : 'Pay at Counter'}</p>
                        <p><strong>Order Type:</strong> ${order.orderType === 'in_shop' ? 'In-Shop Pickup' : 'Delivery'}</p>
                        <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
                        <div class="order-confirmation-items">
                            <h4>Items:</h4>
                            ${Array.isArray(order.items) ? order.items.map(item => `
                                <div class="oc-item-row"><span>${item.name} (${item.size}) x ${item.quantity}</span></div>
                            `).join('') : ''}
                        </div>
                    </div>
                    <div class="order-confirmation-actions">
                        <button class="order-confirmation-btn" id="oc-track-order">Track Order</button>
                        <button class="order-confirmation-btn-secondary" id="oc-continue">Continue Shopping</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', confirmationHTML);
        document.body.classList.add('order-confirmation-open');
        document.body.style.overflow = 'hidden';

        const modal = document.getElementById('orderConfirmationModal');
        const btnTrack = document.getElementById('oc-track-order');
        const btnContinue = document.getElementById('oc-continue');

        function closeAndCleanup(redirectToTracking = false) {
            try { modal.remove(); } catch (e) {}
            try { document.body.style.overflow = 'auto'; } catch (e) {}
            try { document.body.classList.remove('order-confirmation-open'); } catch (e) {}
            if (redirectToTracking) {
                window.location.href = `/order-tracking/?orderId=${encodeURIComponent(order.orderId)}`;
            }
        }

        if (btnTrack) btnTrack.addEventListener('click', () => { closeAndCleanup(true); });
        if (btnContinue) btnContinue.addEventListener('click', () => { closeAndCleanup(false); });
    }
}

// Initialize checkout manager
const checkoutManager = new CheckoutManager();
