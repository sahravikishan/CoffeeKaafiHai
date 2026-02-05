// Cart Management System - UPDATED to use in-memory storage
class CartManager {
    constructor() {
        // Initialize cart in memory only
        this.cart = [];
        this.cartCount = 0;
        this.loadCartForUser();
        this.updateCartCount();

        // Listen for logout events to clear cart
        window.addEventListener('storage', (e) => {
            if (e.key === 'isLoggedIn' && e.newValue === 'false') {
                this.clearCart();
            }
        });
    }

    // Add item to cart
    addToCart(item, size = 'medium') {
        // Require login to add items to cart
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            // Show login required modal with progress bar
            this.showLoginRequiredModal();
            return false; // Indicate not added
        }

        const existingItemIndex = this.cart.findIndex(
            cartItem => cartItem.id === item.id && cartItem.size === size
        );

        if (existingItemIndex > -1) {
            // Item exists, increase quantity
            this.cart[existingItemIndex].quantity += 1;
        } else {
            // New item, add to cart
            const cartItem = {
                id: item.id,
                name: item.name,
                category: item.category || 'Espresso Bliss',
                size: size,
                price: (item.sizes && item.sizes[size] && typeof item.sizes[size].price === 'number') ? item.sizes[size].price : (typeof item.price === 'number' ? item.price : 0),
                quantity: 1,
                image: item.image,
                description: item.description
            };
            this.cart.push(cartItem);
        }

        this.updateCartCount();
        this.notifyCartUpdate();
        this.showToast(`${item.name} (${size}) added to cart!`, 'success');
        this.animateCartIcon();
        return true; // Indicate added
    }

    // Update item quantity
    updateQuantity(itemId, size, change) {
        const itemIndex = this.cart.findIndex(
            item => item.id === itemId && item.size === size
        );

        if (itemIndex > -1) {
            this.cart[itemIndex].quantity += change;

            if (this.cart[itemIndex].quantity <= 0) {
                this.removeFromCart(itemId, size);
            } else {
                this.updateCartCount();
                this.notifyCartUpdate();
            }
        }
    }

    // Remove item from cart
    removeFromCart(itemId, size) {
        this.cart = this.cart.filter(
            item => !(item.id === itemId && item.size === size)
        );
        this.updateCartCount();
        this.notifyCartUpdate();
        this.showToast('Item removed from cart', 'info');
    }

    // Clear entire cart
    clearCart() {
        this.cart = [];
        this.updateCartCount();
        this.notifyCartUpdate();

        // Note: Do not delete stored carts from localStorage here.
        // We clear only in-memory cart so users or guests can retain stored cart across sessions.
    }

    // Get cart items
    getCart() {
        return this.cart;
    }

    // Calculate subtotal
    getSubtotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Calculate tax (5% GST)
    getTax() {
        return Math.round(this.getSubtotal() * 0.05);
    }

    // Calculate grand total
    getTotal() {
        return this.getSubtotal() + this.getTax();
    }

    // Update cart count badge
    updateCartCount() {
        this.cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartBadge = document.getElementById('cartCount');
        if (cartBadge) {
            cartBadge.textContent = this.cartCount;
            cartBadge.style.display = this.cartCount > 0 ? 'flex' : 'none';
        }
    }

    // Animate cart icon when item added
    animateCartIcon() {
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.classList.add('cart-bounce');
            setTimeout(() => {
                cartIcon.classList.remove('cart-bounce');
            }, 600);
        }
    }

    // Notify cart update (for UI refresh)
    notifyCartUpdate() {
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cart: this.cart, count: this.cartCount }
        }));
        // Persist cart only for logged-in users
        try {
            const userId = localStorage.getItem('userId') || localStorage.getItem('userEmail') || localStorage.getItem('currentUser');
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (userId && isLoggedIn) {
                localStorage.setItem(`cart_${userId}`, JSON.stringify(this.cart));
            } else {
                // Persist guest cart so users returning to the site keep their selections
                localStorage.setItem('cart_guest', JSON.stringify(this.cart));
            }
        } catch (e) { /* ignore */ }
    }

    loadCartForUser() {
        try {
            const userId = localStorage.getItem('userId') || localStorage.getItem('userEmail') || localStorage.getItem('currentUser');
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (userId && isLoggedIn) {
                const data = localStorage.getItem(`cart_${userId}`);
                if (data) {
                    try { this.cart = JSON.parse(data) || []; } catch (e) { this.cart = []; }
                } else {
                    // Fallback to guest cart if user had no saved cart
                    const guestData = localStorage.getItem('cart_guest');
                    if (guestData) {
                        try { this.cart = JSON.parse(guestData) || []; } catch (e) { this.cart = []; }
                    } else {
                        this.cart = [];
                    }
                }
            } else {
                // Load guest cart if present
                const guestData = localStorage.getItem('cart_guest');
                if (guestData) {
                    try { this.cart = JSON.parse(guestData) || []; } catch (e) { this.cart = []; }
                } else {
                    this.cart = [];
                }
            }
        } catch (e) { this.cart = []; }
    }

    // Reload cart for current user (useful when login status changes)
    reloadCart() {
        this.loadCartForUser();
        this.updateCartCount();
        this.notifyCartUpdate();
    }

    // Show toast notification - ENHANCED
    showToast(message, type = 'success') {
        // Prefer a single global in-page toast if available, then DynamicProfileManager, then fallback local toast
        if (window.showToast && typeof window.showToast === 'function') {
            try { window.showToast(message, type); return; } catch (e) { /* fallback below */ }
        }
        if (window.DynamicProfileManager && typeof window.DynamicProfileManager.showToast === 'function') {
            try { window.DynamicProfileManager.showToast(message, type); return; } catch (e) { /* fallback below */ }
        }

        const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `cart-toast cart-toast-${type}`;

        let icon = '';
        switch(type) {
            case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
            case 'error': icon = '<i class="fas fa-times-circle"></i>'; break;
            case 'info': icon = '<i class="fas fa-info-circle"></i>'; break;
            case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
        }

        toast.innerHTML = `${icon}<span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('cart-toast-fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // Create toast container if it doesn't exist
    createToastContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'cart-toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // Show login required modal with progress bar
    showLoginRequiredModal() {
        const modal = document.getElementById('loginRequiredModal');
        const progressBar = document.getElementById('loginProgressBar');
        if (!modal || !progressBar) return;

        modal.style.display = 'block';
        progressBar.style.width = '0%';

        // Animate progress bar
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 100);

        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = '/login/';
        }, 3000);
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Expose for other scripts/tests
window.cartManager = cartManager;

