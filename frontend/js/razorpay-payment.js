/**
 * Razorpay Payment Gateway Integration
 * Complete frontend implementation ready for backend connectivity
 * 
 * Features:
 * - Professional payment UI matching site design
 * - Complete payment flow with validation
 * - Error handling and retry mechanism
 * - Payment status tracking
 * - Receipt generation
 * - Backend integration ready
 */

class RazorpayPaymentGateway {
    constructor() {
        this.razorpayKey = 'rzp_test_1DP5mmOlF5G5ag'; // Test key - replace with live key in production
        this.apiEndpoint = '/api/payment'; // Backend API endpoint
        this.paymentInProgress = false;
        this.currentOrderData = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.init();
    }

    init() {
        // Verify Razorpay script is loaded
        if (typeof Razorpay === 'undefined') {
            console.error('Razorpay SDK not loaded. Please include the script in your HTML.');
            this.loadRazorpayScript();
        }
        
        // Inject payment gateway styles
        this.injectStyles();
    }

    /**
     * Load Razorpay script dynamically if not already loaded
     */
    loadRazorpayScript() {
        return new Promise((resolve, reject) => {
            if (typeof Razorpay !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
            document.head.appendChild(script);
        });
    }

    /**
     * Inject custom styles for payment UI
     */
    injectStyles() {
        if (document.getElementById('razorpay-payment-styles')) return;

        const styles = `
            /* Razorpay Payment Gateway Styles */
            .razorpay-payment-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(8px);
                z-index: 99999;
                display: none;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }

            .razorpay-payment-overlay.active {
                display: flex;
            }

            .razorpay-payment-modal {
                background: white;
                border-radius: 20px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                animation: slideUpBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                position: relative;
            }

            @keyframes slideUpBounce {
                0% {
                    transform: translateY(100px) scale(0.8);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
            }

            .razorpay-payment-header {
                background: linear-gradient(135deg, #1a1a1a 0%, #8B4513 100%);
                padding: 25px 30px;
                border-radius: 20px 20px 0 0;
                color: white;
                position: relative;
            }

            .razorpay-payment-header h2 {
                margin: 0;
                font-family: 'Playfair Display', serif;
                font-size: 1.8rem;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .razorpay-payment-header p {
                margin: 8px 0 0 0;
                opacity: 0.9;
                font-size: 0.95rem;
            }

            .razorpay-payment-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-size: 1.2rem;
            }

            .razorpay-payment-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }

            .razorpay-payment-body {
                padding: 30px;
            }

            .razorpay-order-summary {
                background: rgba(248, 244, 233, 0.5);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 25px;
            }

            .razorpay-order-summary h3 {
                font-size: 1.2rem;
                font-weight: 700;
                color: #1a1a1a;
                margin: 0 0 15px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .razorpay-summary-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid rgba(0, 0, 0, 0.08);
                font-size: 0.95rem;
                color: #666;
            }

            .razorpay-summary-row:last-child {
                border-bottom: none;
            }

            .razorpay-summary-row.total {
                font-size: 1.3rem;
                font-weight: 700;
                color: #1a1a1a;
                padding-top: 15px;
                margin-top: 10px;
                border-top: 2px solid rgba(210, 105, 30, 0.3);
            }

            .razorpay-summary-row.total span:last-child {
                color: #D2691E;
            }

            .razorpay-payment-methods {
                margin-bottom: 25px;
            }

            .razorpay-payment-methods h3 {
                font-size: 1.1rem;
                font-weight: 700;
                color: #1a1a1a;
                margin: 0 0 15px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .razorpay-method-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }

            .razorpay-method-card {
                background: white;
                border: 2px solid rgba(210, 105, 30, 0.2);
                border-radius: 12px;
                padding: 15px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            }

            .razorpay-method-card:hover {
                border-color: #D2691E;
                background: rgba(210, 105, 30, 0.05);
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(210, 105, 30, 0.2);
            }

            .razorpay-method-card.selected {
                border-color: #D2691E;
                background: rgba(210, 105, 30, 0.1);
                box-shadow: 0 4px 15px rgba(210, 105, 30, 0.3);
            }

            .razorpay-method-card i {
                font-size: 2rem;
                color: #D2691E;
                margin-bottom: 8px;
                display: block;
            }

            .razorpay-method-card span {
                display: block;
                font-size: 0.9rem;
                font-weight: 600;
                color: #1a1a1a;
            }

            .razorpay-security-badge {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px;
                background: rgba(0, 200, 81, 0.1);
                border: 1px solid rgba(0, 200, 81, 0.3);
                border-radius: 10px;
                margin-bottom: 20px;
                font-size: 0.9rem;
                color: #00C851;
            }

            .razorpay-security-badge i {
                font-size: 1.2rem;
            }

            .razorpay-pay-button {
                width: 100%;
                background: linear-gradient(45deg, #D2691E, #8B4513);
                color: white;
                border: none;
                padding: 16px;
                font-size: 1.1rem;
                font-weight: 700;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                box-shadow: 0 6px 20px rgba(210, 105, 30, 0.4);
                position: relative;
                overflow: hidden;
            }

            .razorpay-pay-button:hover:not(:disabled) {
                transform: translateY(-3px);
                box-shadow: 0 8px 30px rgba(210, 105, 30, 0.6);
            }

            .razorpay-pay-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .razorpay-pay-button.processing {
                background: #6c757d;
            }

            .razorpay-spinner {
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .razorpay-powered-by {
                text-align: center;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(0, 0, 0, 0.08);
                font-size: 0.85rem;
                color: #999;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .razorpay-powered-by img {
                height: 20px;
                opacity: 0.7;
            }

            /* Payment Status Modal */
            .razorpay-status-modal {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 999999;
                display: none;
                align-items: center;
                justify-content: center;
            }

            .razorpay-status-modal.active {
                display: flex;
            }

            .razorpay-status-content {
                background: white;
                border-radius: 20px;
                padding: 40px;
                max-width: 450px;
                width: 90%;
                text-align: center;
                animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }

            @keyframes scaleIn {
                0% {
                    transform: scale(0.5);
                    opacity: 0;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            .razorpay-status-icon {
                font-size: 5rem;
                margin-bottom: 20px;
                animation: iconPop 0.6s ease;
            }

            @keyframes iconPop {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }

            .razorpay-status-icon.success {
                color: #00C851;
            }

            .razorpay-status-icon.error {
                color: #ff4444;
            }

            .razorpay-status-title {
                font-family: 'Playfair Display', serif;
                font-size: 1.8rem;
                font-weight: 700;
                color: #1a1a1a;
                margin: 0 0 15px 0;
            }

            .razorpay-status-message {
                font-size: 1rem;
                color: #666;
                margin-bottom: 25px;
                line-height: 1.6;
            }

            .razorpay-status-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }

            .razorpay-status-btn {
                padding: 12px 30px;
                border: none;
                border-radius: 10px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .razorpay-status-btn.primary {
                background: linear-gradient(45deg, #D2691E, #8B4513);
                color: white;
                box-shadow: 0 4px 15px rgba(210, 105, 30, 0.3);
            }

            .razorpay-status-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(210, 105, 30, 0.5);
            }

            .razorpay-status-btn.secondary {
                background: white;
                color: #1a1a1a;
                border: 2px solid rgba(0, 0, 0, 0.1);
            }

            .razorpay-status-btn.secondary:hover {
                background: rgba(0, 0, 0, 0.05);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .razorpay-payment-modal {
                    width: 95%;
                }

                .razorpay-payment-header {
                    padding: 20px;
                }

                .razorpay-payment-header h2 {
                    font-size: 1.5rem;
                }

                .razorpay-payment-body {
                    padding: 20px;
                }

                .razorpay-method-grid {
                    grid-template-columns: 1fr;
                }

                .razorpay-status-content {
                    padding: 30px 20px;
                }

                .razorpay-status-actions {
                    flex-direction: column;
                }

                .razorpay-status-btn {
                    width: 100%;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'razorpay-payment-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * Create order on backend and get order ID
     * This is where you'll integrate with your backend
     */
    async createOrder(orderData) {
        try {
            // BACKEND INTEGRATION POINT
            // Replace this with actual API call to your backend
            /*
            const response = await fetch(`${this.apiEndpoint}/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    amount: orderData.amount,
                    currency: 'INR',
                    receipt: orderData.receipt,
                    notes: orderData.notes
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const data = await response.json();
            return data.razorpay_order_id;
            */

            // DEMO: Generate mock order ID
            return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    }

    /**
     * Verify payment on backend
     * This is where you'll verify the payment signature
     */
    async verifyPayment(paymentData) {
        try {
            // BACKEND INTEGRATION POINT
            // Replace this with actual API call to your backend
            /*
            const response = await fetch(`${this.apiEndpoint}/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    razorpay_order_id: paymentData.razorpay_order_id,
                    razorpay_payment_id: paymentData.razorpay_payment_id,
                    razorpay_signature: paymentData.razorpay_signature
                })
            });

            if (!response.ok) {
                throw new Error('Payment verification failed');
            }

            const data = await response.json();
            return data.verified;
            */

            // DEMO: Mock verification (always returns true)
            console.log('Payment verification data:', paymentData);
            return true;
        } catch (error) {
            console.error('Verify payment error:', error);
            throw error;
        }
    }

    /**
     * Initialize payment with order details
     */
    async initiatePayment(orderDetails) {
        if (this.paymentInProgress) {
            this.showToast('Payment already in progress', 'warning');
            return;
        }

        try {
            this.paymentInProgress = true;
            this.currentOrderData = orderDetails;

            // Validate order details
            if (!this.validateOrderDetails(orderDetails)) {
                throw new Error('Invalid order details');
            }

            // Show payment UI
            this.showPaymentModal(orderDetails);

        } catch (error) {
            console.error('Payment initiation error:', error);
            this.showToast('Failed to initiate payment', 'error');
            this.paymentInProgress = false;
        }
    }

    /**
     * Validate order details
     */
    validateOrderDetails(orderDetails) {
        if (!orderDetails || typeof orderDetails !== 'object') {
            return false;
        }

        const required = ['amount', 'customerName', 'customerEmail', 'customerPhone'];
        return required.every(field => orderDetails[field]);
    }

    /**
     * Show payment modal UI
     */
    showPaymentModal(orderDetails) {
        // Remove existing modal if any
        const existing = document.getElementById('razorpayPaymentOverlay');
        if (existing) existing.remove();

        const modalHTML = `
            <div id="razorpayPaymentOverlay" class="razorpay-payment-overlay active">
                <div class="razorpay-payment-modal">
                    <div class="razorpay-payment-header">
                        <h2><i class="fas fa-credit-card"></i> Secure Payment</h2>
                        <p>Complete your order with Razorpay</p>
                        <button class="razorpay-payment-close" onclick="razorpayGateway.closePaymentModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="razorpay-payment-body">
                        <div class="razorpay-order-summary">
                            <h3><i class="fas fa-receipt"></i> Order Summary</h3>
                            <div class="razorpay-summary-row">
                                <span>Subtotal</span>
                                <span>₹${orderDetails.subtotal || 0}</span>
                            </div>
                            <div class="razorpay-summary-row">
                                <span>Tax (5% GST)</span>
                                <span>₹${orderDetails.tax || 0}</span>
                            </div>
                            <div class="razorpay-summary-row total">
                                <span>Total Amount</span>
                                <span>₹${orderDetails.amount}</span>
                            </div>
                        </div>

                        <div class="razorpay-payment-methods">
                            <h3><i class="fas fa-wallet"></i> Payment Methods</h3>
                            <div class="razorpay-method-grid">
                                <div class="razorpay-method-card selected" data-method="upi">
                                    <i class="fas fa-mobile-alt"></i>
                                    <span>UPI</span>
                                </div>
                                <div class="razorpay-method-card" data-method="card">
                                    <i class="fas fa-credit-card"></i>
                                    <span>Card</span>
                                </div>
                                <div class="razorpay-method-card" data-method="netbanking">
                                    <i class="fas fa-university"></i>
                                    <span>Net Banking</span>
                                </div>
                                <div class="razorpay-method-card" data-method="wallet">
                                    <i class="fas fa-wallet"></i>
                                    <span>Wallet</span>
                                </div>
                            </div>
                        </div>

                        <div class="razorpay-security-badge">
                            <i class="fas fa-shield-alt"></i>
                            <span>Secure payment powered by Razorpay</span>
                        </div>

                        <button class="razorpay-pay-button" id="razorpayPayBtn">
                            <i class="fas fa-lock"></i>
                            <span>Pay ₹${orderDetails.amount}</span>
                        </button>

                        <div class="razorpay-powered-by">
                            <span>Powered by</span>
                            <strong>Razorpay</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';

        // Attach event listeners
        this.attachPaymentModalEvents(orderDetails);
    }

    /**
     * Attach event listeners to payment modal
     */
    attachPaymentModalEvents(orderDetails) {
        // Method selection
        document.querySelectorAll('.razorpay-method-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.razorpay-method-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        // Pay button
        const payBtn = document.getElementById('razorpayPayBtn');
        if (payBtn) {
            payBtn.addEventListener('click', () => this.processPayment(orderDetails));
        }
    }

    /**
     * Process payment through Razorpay
     */
    async processPayment(orderDetails) {
        const payBtn = document.getElementById('razorpayPayBtn');
        if (!payBtn) return;

        try {
            // Disable button and show processing state
            payBtn.disabled = true;
            payBtn.classList.add('processing');
            payBtn.innerHTML = '<div class="razorpay-spinner"></div><span>Processing...</span>';

            // Create order on backend
            const razorpayOrderId = await this.createOrder({
                amount: orderDetails.amount * 100, // Convert to paise
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
                notes: {
                    orderId: orderDetails.orderId || '',
                    customerName: orderDetails.customerName
                }
            });

            // Configure Razorpay options
            const options = {
                key: this.razorpayKey,
                amount: orderDetails.amount * 100,
                currency: 'INR',
                name: 'CoffeeKaafiHai',
                description: 'Coffee Order Payment',
                image: '/images/Coffee.jpg',
                order_id: razorpayOrderId,
                handler: (response) => this.handlePaymentSuccess(response, orderDetails),
                prefill: {
                    name: orderDetails.customerName,
                    email: orderDetails.customerEmail,
                    contact: orderDetails.customerPhone
                },
                notes: {
                    address: orderDetails.deliveryAddress || ''
                },
                theme: {
                    color: '#D2691E'
                },
                modal: {
                    ondismiss: () => {
                        this.handlePaymentDismiss();
                        payBtn.disabled = false;
                        payBtn.classList.remove('processing');
                        payBtn.innerHTML = '<i class="fas fa-lock"></i><span>Pay ₹' + orderDetails.amount + '</span>';
                    }
                }
            };

            // Open Razorpay checkout
            const rzp = new Razorpay(options);
            
            rzp.on('payment.failed', (response) => {
                this.handlePaymentFailure(response);
            });

            rzp.open();

        } catch (error) {
            console.error('Payment processing error:', error);
            this.showPaymentStatus('error', 'Payment Failed', error.message || 'An error occurred while processing your payment. Please try again.');
            
            // Reset button
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.classList.remove('processing');
                payBtn.innerHTML = '<i class="fas fa-lock"></i><span>Pay ₹' + orderDetails.amount + '</span>';
            }
        }
    }

    /**
     * Handle successful payment
     */
    async handlePaymentSuccess(response, orderDetails) {
        try {
            // Verify payment on backend
            const verified = await this.verifyPayment(response);

            if (verified) {
                // Close payment modal
                this.closePaymentModal();

                // Show success status
                this.showPaymentStatus(
                    'success',
                    'Payment Successful!',
                    `Your payment of ₹${orderDetails.amount} has been processed successfully. Order ID: ${orderDetails.orderId}`,
                    {
                        paymentId: response.razorpay_payment_id,
                        orderId: orderDetails.orderId,
                        amount: orderDetails.amount
                    }
                );

                // Trigger success callback if provided
                if (typeof orderDetails.onSuccess === 'function') {
                    orderDetails.onSuccess({
                        ...response,
                        verified: true,
                        orderDetails: orderDetails
                    });
                }
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            console.error('Payment success handler error:', error);
            this.showPaymentStatus('error', 'Verification Failed', 'Payment was successful but verification failed. Please contact support.');
        } finally {
            this.paymentInProgress = false;
        }
    }

    /**
     * Handle payment failure
     */
    handlePaymentFailure(response) {
        console.error('Payment failed:', response.error);
        
        const errorMessage = response.error.description || 'Payment failed. Please try again.';
        
        this.showPaymentStatus(
            'error',
            'Payment Failed',
            errorMessage
        );

        // Trigger failure callback if provided
        if (this.currentOrderData && typeof this.currentOrderData.onFailure === 'function') {
            this.currentOrderData.onFailure(response.error);
        }

        this.paymentInProgress = false;
    }

    /**
     * Handle payment modal dismiss
     */
    handlePaymentDismiss() {
        this.showToast('Payment cancelled', 'warning');
        this.paymentInProgress = false;
    }

    /**
     * Close payment modal
     */
    closePaymentModal() {
        const overlay = document.getElementById('razorpayPaymentOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
        document.body.style.overflow = 'auto';
        this.paymentInProgress = false;
    }

    /**
     * Show payment status modal
     */
    showPaymentStatus(type, title, message, data = null) {
        // Remove existing status modal
        const existing = document.getElementById('razorpayStatusModal');
        if (existing) existing.remove();

        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-times-circle';
        const iconColorClass = type === 'success' ? 'success' : 'error';

        const statusHTML = `
            <div id="razorpayStatusModal" class="razorpay-status-modal active">
                <div class="razorpay-status-content">
                    <div class="razorpay-status-icon ${iconColorClass}">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <h2 class="razorpay-status-title">${title}</h2>
                    <p class="razorpay-status-message">${message}</p>
                    ${data ? `
                        <div class="razorpay-order-summary" style="margin-bottom: 20px; text-align: left;">
                            <div class="razorpay-summary-row">
                                <span>Payment ID</span>
                                <span style="font-family: monospace; font-size: 0.85rem;">${data.paymentId || 'N/A'}</span>
                            </div>
                            <div class="razorpay-summary-row">
                                <span>Order ID</span>
                                <span style="font-family: monospace; font-size: 0.85rem;">${data.orderId || 'N/A'}</span>
                            </div>
                            <div class="razorpay-summary-row total">
                                <span>Amount Paid</span>
                                <span>₹${data.amount || 0}</span>
                            </div>
                        </div>
                    ` : ''}
                    <div class="razorpay-status-actions">
                        ${type === 'success' ? `
                            <button class="razorpay-status-btn primary" onclick="razorpayGateway.closeStatusModal(); window.location.href='order-tracking.html?orderId=${data?.orderId || ''}'">
                                Track Order
                            </button>
                        ` : `
                            <button class="razorpay-status-btn primary" onclick="razorpayGateway.retryPayment()">
                                Retry Payment
                            </button>
                        `}
                        <button class="razorpay-status-btn secondary" onclick="razorpayGateway.closeStatusModal()">
                            ${type === 'success' ? 'Continue Shopping' : 'Close'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', statusHTML);
    }

    /**
     * Close status modal
     */
    closeStatusModal() {
        const modal = document.getElementById('razorpayStatusModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Retry payment
     */
    retryPayment() {
        this.closeStatusModal();
        if (this.currentOrderData && this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.initiatePayment(this.currentOrderData);
        } else {
            this.showToast('Maximum retry attempts reached. Please try again later.', 'error');
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Use existing toast system if available
        if (window.showToast && typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else if (window.cartManager && typeof window.cartManager.showToast === 'function') {
            window.cartManager.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Get payment history (for backend integration)
     */
    async getPaymentHistory(userId) {
        try {
            // BACKEND INTEGRATION POINT
            /*
            const response = await fetch(`${this.apiEndpoint}/payment-history/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch payment history');
            }

            return await response.json();
            */

            // DEMO: Return empty array
            return [];
        } catch (error) {
            console.error('Get payment history error:', error);
            return [];
        }
    }

    /**
     * Refund payment (for backend integration)
     */
    async refundPayment(paymentId, amount, reason) {
        try {
            // BACKEND INTEGRATION POINT
            /*
            const response = await fetch(`${this.apiEndpoint}/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    payment_id: paymentId,
                    amount: amount,
                    reason: reason
                })
            });

            if (!response.ok) {
                throw new Error('Refund request failed');
            }

            return await response.json();
            */

            // DEMO: Mock refund
            console.log('Refund requested:', { paymentId, amount, reason });
            return { success: true, refund_id: `rfnd_${Date.now()}` };
        } catch (error) {
            console.error('Refund error:', error);
            throw error;
        }
    }
}

// Initialize Razorpay Gateway
const razorpayGateway = new RazorpayPaymentGateway();

// Expose globally
window.razorpayGateway = razorpayGateway;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RazorpayPaymentGateway;
}

