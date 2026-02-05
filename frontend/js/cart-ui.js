// Cart UI - Sidebar Cart Display
class CartUI {
    constructor() {
        this.cartSidebar = null;
        this.init();
    }

    init() {
        this.createCartButton();
        this.createCartSidebar();
        this.attachEventListeners();
        
        // Listen for cart updates
        window.addEventListener('cartUpdated', (e) => {
            this.refreshCart();
            this._animateCartBadge();
        });

        // Inject improved cart styles (isolated to cart UI)
        this._injectStyles();
    }

    _injectStyles() {
        if (document.getElementById('cart-ui-enhancements-style')) return;
        const css = `
        /* Cart UI Enhancements - isolated */
        .cart-sidebar { transition: transform 280ms ease, opacity 280ms ease; }
        .cart-sidebar .cart-sidebar-content { width: 380px; max-width: 92vw; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .cart-item { display:flex; gap:12px; padding:12px; border-bottom:1px solid rgba(0,0,0,0.06); align-items:center; }
        .cart-item:hover { background: rgba(0,0,0,0.02); }
        .cart-item-image img { width:72px; height:72px; object-fit:cover; border-radius:8px; }
        .cart-item-details { flex:1; }
        .cart-item-name { margin:0 0 4px 0; font-weight:600; }
        .cart-item-size, .cart-item-price { margin:0; color:#666; font-size:0.9rem; }
        .cart-item-actions { display:flex; align-items:center; gap:8px; margin-top:8px; }
        .cart-item-quantity button { width:34px; height:34px; border-radius:8px; border:1px solid rgba(0,0,0,0.08); background:white; cursor:pointer; }
        .cart-item-quantity button:disabled { opacity:0.45; cursor:not-allowed; }
        .cart-item-total { min-width:72px; text-align:right; font-weight:700; }
        .cart-empty { text-align:center; padding:36px; }
        .btn-browse-menu { margin-top:12px; }
        .cart-summary-total { font-size:1.1rem; font-weight:800; border-top:1px dashed rgba(0,0,0,0.06); padding-top:10px; }
        .cart-checkout-btn[disabled] { opacity:0.5; cursor:not-allowed; }
        .cart-badge-animate { transform: scale(1.25); transition: transform 220ms ease; }
        
        /* Custom Confirmation Modal */
        .cart-confirm-modal { position:fixed; inset:0; z-index:10000; display:none; align-items:center; justify-content:center; }
        .cart-confirm-modal.active { display:flex; }
        .cart-confirm-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); }
        .cart-confirm-content { position:relative; background:white; border-radius:16px; padding:28px; max-width:420px; width:90%; box-shadow:0 25px 60px rgba(0,0,0,0.3); }
        .cart-confirm-header { text-align:center; margin-bottom:20px; }
        .cart-confirm-header i { font-size:3rem; color:#D2691E; margin-bottom:12px; }
        .cart-confirm-header h3 { font-size:1.4rem; font-weight:700; color:#654321; margin:0 0 8px 0; }
        .cart-confirm-header p { color:#666; margin:0; }
        .cart-confirm-actions { display:flex; gap:12px; margin-top:24px; }
        .cart-confirm-actions button { flex:1; padding:12px 20px; border:none; border-radius:10px; font-weight:600; cursor:pointer; transition:all 0.3s ease; }
        .cart-confirm-btn-cancel { background:#e0e0e0; color:#333; }
        .cart-confirm-btn-cancel:hover { background:#d0d0d0; transform:translateY(-2px); }
        .cart-confirm-btn-confirm { background:linear-gradient(135deg,#D2691E,#8B4513); color:white; }
        .cart-confirm-btn-confirm:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(210,105,30,0.4); }
        `;
        const s = document.createElement('style');
        s.id = 'cart-ui-enhancements-style';
        s.appendChild(document.createTextNode(css));
        document.head.appendChild(s);
    }

    createCartButton() {
        // Add cart button to navbar if not already present
        if (document.getElementById('cartIcon')) return;
        const navbar = document.querySelector('.navbar-nav') || document.querySelector('nav');
        if (!navbar) return;

        const cartButton = document.createElement('li');
        cartButton.className = 'nav-item';
        cartButton.innerHTML = `
            <a class="nav-link cart-nav-link" href="#" id="cartIcon">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-badge" id="cartCount">0</span>
            </a>
        `;

        // Insert before profile dropdown if present
        const profileDropdown = navbar.querySelector('.nav-item.dropdown') || navbar.querySelector('.dropdown');
        if (profileDropdown) navbar.insertBefore(cartButton, profileDropdown);
        else navbar.appendChild(cartButton);

        // Click to open cart (guard)
        const cartIconEl = document.getElementById('cartIcon');
        if (cartIconEl) {
            cartIconEl.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCart();
            });
        }

        // Update initial cart count after button creation
        if (typeof cartManager !== 'undefined' && cartManager.updateCartCount) {
            cartManager.updateCartCount();
        }
    }

    createCartSidebar() {
        // Avoid creating duplicate sidebar
        if (document.getElementById('cartSidebar')) {
            this.cartSidebar = document.getElementById('cartSidebar');
            return;
        }

        const sidebarHTML = `
            <div id="cartSidebar" class="cart-sidebar">
                <div class="cart-sidebar-overlay"></div>
                <div class="cart-sidebar-content">
                    <div class="cart-sidebar-header">
                        <h2 class="cart-sidebar-title">
                            <i class="fas fa-shopping-cart"></i>
                            Your Cart
                        </h2>
                        <button class="cart-sidebar-close" id="closeCartSidebar" aria-label="Close cart">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="cart-sidebar-body" id="cartItemsContainer">
                        <!-- Cart items will be rendered here -->
                    </div>
                    
                    <div class="cart-sidebar-footer">
                        <div class="cart-summary">
                            <div class="cart-summary-row">
                                <span>Subtotal:</span>
                                <span id="cartSubtotal">₹0</span>
                            </div>
                            <div class="cart-summary-row">
                                <span>Tax (5% GST):</span>
                                <span id="cartTax">₹0</span>
                            </div>
                            <div class="cart-summary-row cart-summary-total">
                                <span>Total:</span>
                                <span id="cartTotal">₹0</span>
                            </div>
                        </div>
                        <button class="cart-checkout-btn" id="proceedToCheckout">
                            <i class="fas fa-lock"></i>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Custom Confirmation Modal -->
            <div id="cartConfirmModal" class="cart-confirm-modal">
                <div class="cart-confirm-overlay"></div>
                <div class="cart-confirm-content">
                    <div class="cart-confirm-header">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Remove Item?</h3>
                        <p id="cartConfirmMessage">Are you sure you want to remove this item from your cart?</p>
                    </div>
                    <div class="cart-confirm-actions">
                        <button class="cart-confirm-btn-cancel" id="cartConfirmCancel">Cancel</button>
                        <button class="cart-confirm-btn-confirm" id="cartConfirmOk">Remove</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', sidebarHTML);
        this.cartSidebar = document.getElementById('cartSidebar');
        
        // Setup confirmation modal handlers
        this._setupConfirmModal();
    }

    _setupConfirmModal() {
        const modal = document.getElementById('cartConfirmModal');
        const overlay = modal.querySelector('.cart-confirm-overlay');
        const cancelBtn = document.getElementById('cartConfirmCancel');
        
        if (overlay) overlay.addEventListener('click', () => this._closeConfirmModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this._closeConfirmModal());
    }

    _showConfirmModal(message, onConfirm) {
        const modal = document.getElementById('cartConfirmModal');
        const messageEl = document.getElementById('cartConfirmMessage');
        const confirmBtn = document.getElementById('cartConfirmOk');
        
        if (messageEl) messageEl.textContent = message;
        
        // Remove old listeners and add new one
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            this._closeConfirmModal();
            if (typeof onConfirm === 'function') onConfirm();
        });
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    _closeConfirmModal() {
        const modal = document.getElementById('cartConfirmModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    attachEventListeners() {
        // Close button
        const closeBtn = document.getElementById('closeCartSidebar');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeCart());

        // Overlay click
        const overlay = this.cartSidebar ? this.cartSidebar.querySelector('.cart-sidebar-overlay') : null;
        if (overlay) overlay.addEventListener('click', () => this.closeCart());

        // Checkout button
        const checkoutBtn = document.getElementById('proceedToCheckout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (!isLoggedIn) {
                    if (window.cartManager && typeof window.cartManager.showLoginRequiredModal === 'function') {
                        window.cartManager.showLoginRequiredModal();
                    } else if (window.cartManager && typeof window.cartManager.showToast === 'function') {
                        window.cartManager.showToast('Please log in to place orders.', 'warning');
                    }
                    return;
                }
                let currentCart = [];
                try { if (window.cartManager && typeof window.cartManager.getCart === 'function') currentCart = window.cartManager.getCart(); } catch (e) { currentCart = []; }
                if (!currentCart || currentCart.length === 0) {
                    if (window.cartManager && typeof window.cartManager.showToast === 'function') window.cartManager.showToast('Your cart is empty', 'warning');
                    return;
                }
                // disable button to prevent duplicate clicks
                checkoutBtn.disabled = true;
                this.closeCart();
                if (typeof checkoutManager !== 'undefined' && checkoutManager && typeof checkoutManager.open === 'function') {
                    checkoutManager.open();
                }
                setTimeout(() => { checkoutBtn.disabled = false; }, 1000);
            });
        }

        // Keyboard: close cart with Escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.cartSidebar && this.cartSidebar.classList.contains('cart-sidebar-active')) {
                this.closeCart();
            }
        });
    }

    openCart() {
        this.refreshCart();
        if (!this.cartSidebar) this.cartSidebar = document.getElementById('cartSidebar');
        if (!this.cartSidebar) return;
        this.cartSidebar.classList.add('cart-sidebar-active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        if (this.cartSidebar) this.cartSidebar.classList.remove('cart-sidebar-active');
        document.body.style.overflow = 'auto';
    }

    refreshCart() {
        const cart = (window.cartManager && typeof window.cartManager.getCart === 'function') ? window.cartManager.getCart() : [];
        const container = document.getElementById('cartItemsContainer');
        
        if (cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty — find something delicious!</p>
                    <button class="btn-browse-menu btn btn-primary" onclick="document.getElementById('closeCartSidebar').click(); document.querySelector('#menu').scrollIntoView({behavior: 'smooth'});">
                        Browse Menu
                    </button>
                </div>
            `;
            // ensure checkout disabled
            const checkoutBtn = document.getElementById('proceedToCheckout'); if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            container.innerHTML = cart.map(item => this.renderCartItem(item)).join('');
            // enable checkout
            const checkoutBtn = document.getElementById('proceedToCheckout'); if (checkoutBtn) checkoutBtn.disabled = false;
            
            // Attach quantity buttons
            container.querySelectorAll('.cart-item-decrease').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const row = e.target.closest('.cart-item'); if (!row) return;
                    const itemId = row.dataset.itemId;
                    const size = row.dataset.size;
                    // prevent decrease if disabled
                    if (btn.disabled) return;
                    if (window.cartManager && typeof window.cartManager.updateQuantity === 'function') window.cartManager.updateQuantity(itemId, size, -1);
                });
            });
            
            container.querySelectorAll('.cart-item-increase').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const row = e.target.closest('.cart-item'); if (!row) return;
                    const itemId = row.dataset.itemId;
                    const size = row.dataset.size;
                    if (window.cartManager && typeof window.cartManager.updateQuantity === 'function') window.cartManager.updateQuantity(itemId, size, 1);
                });
            });
            
            container.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const row = e.target.closest('.cart-item'); if (!row) return;
                    const itemId = row.dataset.itemId;
                    const size = row.dataset.size;
                    const itemName = row.querySelector('.cart-item-name')?.textContent || 'this item';
                    
                    // Use custom styled confirmation modal instead of browser confirm
                    this._showConfirmModal(
                        `Remove ${itemName} from your cart?`,
                        () => {
                            if (window.cartManager && typeof window.cartManager.removeFromCart === 'function') {
                                window.cartManager.removeFromCart(itemId, size);
                            }
                        }
                    );
                });
            });
        }
        
        // Update totals
        const subEl = document.getElementById('cartSubtotal'); if (subEl && window.cartManager) subEl.textContent = `₹${window.cartManager.getSubtotal() || 0}`;
        const taxEl = document.getElementById('cartTax'); if (taxEl && window.cartManager) taxEl.textContent = `₹${window.cartManager.getTax() || 0}`;
        const totalEl = document.getElementById('cartTotal'); if (totalEl && window.cartManager) totalEl.textContent = `₹${window.cartManager.getTotal() || 0}`;
    }

    renderCartItem(item) {
        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const disableMinus = qty <= 1 ? 'disabled' : '';
        const imgSrc = item.image || '/images/CartItem.jpg';
        return `
            <div class="cart-item" data-item-id="${item.id}" data-size="${item.size}">
                <div class="cart-item-image">
                    <img src="${imgSrc}" alt="${item.name}" onerror="this.onerror=null;this.src='/images/CartItem.jpg'">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-size">Size: ${typeof item.size === 'string' ? (item.size.charAt(0).toUpperCase() + item.size.slice(1)) : item.size}</p>
                    <p class="cart-item-price">₹${price} each</p>
                    <div class="cart-item-actions">
                        <div class="cart-item-quantity" role="group" aria-label="Quantity controls">
                            <button class="cart-item-decrease" ${disableMinus} aria-label="Decrease quantity" tabindex="0">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="cart-item-qty" aria-live="polite">${qty}</span>
                            <button class="cart-item-increase" aria-label="Increase quantity" tabindex="0">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="cart-item-remove" aria-label="Remove item" tabindex="0">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    ₹${price * qty}
                </div>
            </div>
        `;
    }

    _animateCartBadge() {
        try {
            const badge = document.getElementById('cartCount');
            if (!badge) return;
            badge.classList.add('cart-badge-animate');
            setTimeout(() => badge.classList.remove('cart-badge-animate'), 300);
        } catch (e) {}
    }
}

// Initialize cart UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CartUI();
});

