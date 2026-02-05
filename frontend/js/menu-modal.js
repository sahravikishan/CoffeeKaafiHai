// Menu Modal System with Story Display - Performance Optimized
class MenuModal {
    constructor() {
        this.modal = null;
        this.currentCategory = null;
        this.storyToggleDebounce = new Map();
        this.init();
    }

    init() {
        // Create modal HTML
        this.createModal();
        
        // Attach event listeners to "View Coffee" buttons
        this.attachButtonListeners();
    }

    createModal() {
        const modalHTML = `
            <div id="menuModal" class="menu-modal">
                <div class="menu-modal-overlay"></div>
                <div class="menu-modal-content">
                    <div class="menu-modal-header">
                        <h2 id="menuModalTitle" class="menu-modal-title"></h2>
                        <button type="button" class="menu-modal-close" id="closeMenuModal" aria-label="Close modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <p id="menuModalDescription" class="menu-modal-description"></p>
                    <div id="menuModalItems" class="menu-modal-items"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('menuModal');

        // Store instance globally for onclick
        window.menuModalInstance = this;

        // Ensure close button is clickable and attach a single listener
        const closeBtn = this.modal ? this.modal.querySelector('#closeMenuModal') : null;
        if (closeBtn) {
            closeBtn.style.pointerEvents = 'auto';
            closeBtn.style.zIndex = '10002';
            closeBtn.style.position = 'relative';

            // Ensure the close button closes the modal and fully hides it
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.close();
                // ensure the modal is hidden after animation
                try {
                    if (this.modal) this.modal.style.pointerEvents = 'none';
                    setTimeout(() => {
                        if (this.modal) this.modal.style.display = 'none';
                    }, 350);
                } catch (err) { /* ignore */ }
            });

            // Make sure hover styles are responsive by ensuring the element is not covered
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.pointerEvents = 'auto';
            });
        } else {
            console.error('Close button not found!');
        }

        // Click overlay to close (safe-guard for missing modal)
        const overlay = this.modal ? this.modal.querySelector('.menu-modal-overlay') : null;
        if (overlay) overlay.addEventListener('click', () => this.close());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('menu-modal-active')) {
                this.close();
            }
        });
    }

    attachButtonListeners() {
        // Use event delegation to handle "View Coffee/Options/Snacks/Biscuits" buttons
        // This works for both existing and dynamically added buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-view-coffee');
            if (!button) return;

            e.preventDefault();
            e.stopPropagation();

            console.log('View button clicked!');

            const drinkCard = button.closest('.drink-card');
            if (!drinkCard) {
                console.error('Could not find drink-card');
                return this.showEnhancedToast('Could not find drink information', 'error');
            }

            const nameEl = drinkCard.querySelector('.drink-name');
            const drinkName = nameEl ? nameEl.textContent.trim() : '';

            console.log('Drink name:', drinkName);

            // Map drink names to category slugs
            const categoryMap = {
                'Espresso Bliss': 'espresso-bliss',
                'Milk Brew Classics': 'milk-brew-classics',
                'Mocha Magic': 'mocha-magic',
                'Caramel Dream & Flavored Delights': 'caramel-dream-flavored',
                'Cold Brew Creations': 'cold-brew-creations',
                'Special Choices': 'special-choices',
                'Chocolate Indulgence (Non-Coffee)': 'chocolate-indulgence',
                'Add-Ons & Customization': 'addons-customization',
                'Crispy Fried': 'savory-snacks-crispy',
                'Fresh & Grilled' : 'sandwiches-fresh-grilled',
                'Indian Street Food' : 'savory-snacks-indian-street-food',
                'Crunchy & Chewy' : 'biscuits-cookies-crunchy',
                'Buttery & Flaky' : 'croissants-pastries-buttery',
                'Decadent Chocolate' : 'sweet-treats-decadent',
                'Delicate & Creamy' : 'macarons-desserts-delicate',
                'Mixed Platter' : 'savory-snacks-mixed-platter',
                'Soft & Fluffy' : 'biscuits-cookies-soft-fluffy',
                'Crispy & Buttery' : 'croissants-pastries-crispy-buttery',
                'Moist & Nutty' : 'sweet-treats-moist-nutty',
                'Luxury Assortment' : 'sweet-treats-luxury-assortment',
            };

            const categorySlug = categoryMap[drinkName];
            console.log('Category slug:', categorySlug);

            if (categorySlug) {
                this.open(categorySlug);
            } else {
                this.showEnhancedToast('This menu is coming soon!', 'info');
            }
        });
    }

    open(categorySlug) {
        // Get menu data - with fallback support
        let menuData = null;
        
        // Try to get from global coffeeMenu if it exists
        if (typeof coffeeMenu !== 'undefined' && coffeeMenu[categorySlug]) {
            menuData = coffeeMenu[categorySlug];
        } 
        // Otherwise try using getMenuByCategory function if it exists
        else if (typeof getMenuByCategory === 'function') {
            menuData = getMenuByCategory(categorySlug);
        }
        
        if (!menuData) {
            console.error('Menu data not found for category:', categorySlug);
            this.showEnhancedToast('Menu not found. Please refresh the page.', 'error');
            return;
        }

        this.currentCategory = menuData;

        // Update modal content
        document.getElementById('menuModalTitle').textContent = menuData.category;
        document.getElementById('menuModalDescription').textContent = menuData.description;

        // Render items with performance optimization
        this.renderItems(menuData.items);

        // Ensure modal is visible and animate in
        try { if (this.modal) this.modal.style.display = 'flex'; } catch (e) {}
        requestAnimationFrame(() => {
            if (this.modal) this.modal.classList.add('menu-modal-active');
            document.body.style.overflow = 'hidden';
            if (this.modal) this.modal.style.pointerEvents = 'auto';
        });
    }

    renderItems(items) {
        const container = document.getElementById('menuModalItems');
        container.innerHTML = '';
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        items.forEach(item => {
            const itemCard = this.createItemCard(item);
            fragment.appendChild(itemCard);
        });
        
        container.appendChild(fragment);
    }

    createItemCard(item) {
        const itemCard = document.createElement('div');
        itemCard.className = 'menu-item-card';
        if (item.popular) {
            itemCard.classList.add('menu-item-popular');
        }
        
        // Helper function to get size display text
        const getSizeDisplay = (sizeData) => {
            if (sizeData.ml !== undefined) {
                return `${sizeData.ml}ml`;
            } else if (sizeData.quantity !== undefined) {
                return `${sizeData.quantity} ${sizeData.quantity === 1 ? 'piece' : 'pieces'}`;
            }
            return '';
        };
        
        itemCard.innerHTML = `
            ${item.popular ? '<span class="menu-item-badge"><i class="fas fa-star"></i> Popular</span>' : ''}
            <div class="menu-item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="menu-item-info">
                <h3 class="menu-item-name">${item.name}</h3>
                <p class="menu-item-description">${item.description}</p>
                
                <div class="menu-item-story-section">
                    <button class="story-toggle-btn" aria-expanded="false">
                        <i class="fas fa-book-open"></i>
                        <span>Read the Story</span>
                        <i class="fas fa-chevron-down story-arrow"></i>
                    </button>
                    <div class="menu-item-story">
                        <p>${item.story}</p>
                    </div>
                </div>
                
                <div class="menu-item-sizes">
                    <button class="size-btn" data-size="small" data-item-id="${item.id}">
                        <span class="size-label">Small</span>
                        <span class="size-price">₹${item.sizes.small.price}</span>
                        <span class="size-ml">${getSizeDisplay(item.sizes.small)}</span>
                    </button>
                    <button class="size-btn size-btn-recommended" data-size="medium" data-item-id="${item.id}">
                        <span class="size-label">Medium</span>
                        <span class="size-price">₹${item.sizes.medium.price}</span>
                        <span class="size-ml">${getSizeDisplay(item.sizes.medium)}</span>
                        <span class="recommended-tag"><i class="fas fa-crown"></i> Best</span>
                    </button>
                    <button class="size-btn" data-size="large" data-item-id="${item.id}">
                        <span class="size-label">Large</span>
                        <span class="size-price">₹${item.sizes.large.price}</span>
                        <span class="size-ml">${getSizeDisplay(item.sizes.large)}</span>
                    </button>
                </div>
            </div>
        `;
        
        // Story toggle functionality with debouncing
        const storyToggleBtn = itemCard.querySelector('.story-toggle-btn');
        const storySection = itemCard.querySelector('.menu-item-story');
        const storyArrow = itemCard.querySelector('.story-arrow');
        
        storyToggleBtn.addEventListener('click', () => {
            const isExpanded = storySection.classList.contains('expanded');
            
            if (isExpanded) {
                storySection.classList.remove('expanded');
                storyArrow.style.transform = 'rotate(0deg)';
                storyToggleBtn.querySelector('span').textContent = 'Read the Story';
                storyToggleBtn.setAttribute('aria-expanded', 'false');
            } else {
                storySection.classList.add('expanded');
                storyArrow.style.transform = 'rotate(180deg)';
                storyToggleBtn.querySelector('span').textContent = 'Hide Story';
                storyToggleBtn.setAttribute('aria-expanded', 'true');
            }
        });
        
        // Add to cart buttons - Enhanced with better feedback
        const sizeButtons = itemCard.querySelectorAll('.size-btn');
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = btn.getAttribute('data-size');
                const itemWithCategory = { ...item, category: this.currentCategory.category };
                
                // Add visual feedback
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
                
                // Add to cart using cartManager
                if (typeof cartManager !== 'undefined') {
                    const added = cartManager.addToCart(itemWithCategory, size);
                    if (added) {
                        this.showEnhancedToast(
                            `${item.name} (${size}) added to cart!`,
                            'success',
                            item.sizes[size].price
                        );
                    }
                } else {
                    console.error('cartManager is not defined');
                    this.showEnhancedToast(
                        `${item.name} (${size}) - ₹${item.sizes[size].price} added!`,
                        'success'
                    );
                }
            });
        });
        
        return itemCard;
    }

    showEnhancedToast(message, type = 'success', price = null) {
        // Remove existing toasts
        document.querySelectorAll('.cart-toast').forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `cart-toast cart-toast-${type}`;
        
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'info') icon = 'fa-info-circle';
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
                ${price ? `<div class="toast-price">₹${price}</div>` : ''}
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
        });
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 400);
        }, 3500);
    }

    close() {
        if (!this.modal) return;
        // Remove active class to trigger hide animation
        this.modal.classList.remove('menu-modal-active');
        document.body.style.overflow = 'auto';

        // Allow animation to finish then hide fully and clean up
        setTimeout(() => {
            try { if (this.modal) this.modal.style.display = 'none'; } catch (e) {}
            const items = document.getElementById('menuModalItems');
            if (items) items.innerHTML = '';
            try { if (this.modal) this.modal.style.pointerEvents = 'none'; } catch (e) {}
        }, 320);
    }

}

// Helper function to get menu by category - defined globally
function getMenuByCategory(categorySlug) {
    if (typeof coffeeMenu !== 'undefined' && coffeeMenu[categorySlug]) {
        return coffeeMenu[categorySlug];
    }
    console.warn('Menu category not found:', categorySlug);
    return null;
}

// Initialize menu modal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MenuModal();
});

