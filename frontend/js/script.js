// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    console.log('CoffeeKaafiHai website loaded successfully!');
    
    // Intersection Observer for drink cards animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const drinkCards = document.querySelectorAll('.drink-card');
    drinkCards.forEach(card => {
        observer.observe(card);
    });
    
    // Observe feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        observer.observe(card);
    });

    // Observe testimonial cards
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(card => {
        observer.observe(card);
    });
    
    // Add animation class for cards
    const style = document.createElement('style');
    style.textContent = `
        .drink-card, .feature-card, .testimonial-card {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .drink-card.animate-in, .feature-card.animate-in, .testimonial-card.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .drink-card:nth-child(1) { transition-delay: 0.1s; }
        .drink-card:nth-child(2) { transition-delay: 0.2s; }
        .drink-card:nth-child(3) { transition-delay: 0.3s; }
        .drink-card:nth-child(4) { transition-delay: 0.4s; }
        .drink-card:nth-child(5) { transition-delay: 0.5s; }
        .drink-card:nth-child(6) { transition-delay: 0.6s; }
        .drink-card:nth-child(7) { transition-delay: 0.7s; }
        .drink-card:nth-child(8) { transition-delay: 0.8s; }

        .feature-card:nth-child(1) { transition-delay: 0.1s; }
        .feature-card:nth-child(2) { transition-delay: 0.2s; }
        .feature-card:nth-child(3) { transition-delay: 0.3s; }

        .testimonial-card:nth-child(1) { transition-delay: 0.1s; }
        .testimonial-card:nth-child(2) { transition-delay: 0.2s; }
        .testimonial-card:nth-child(3) { transition-delay: 0.3s; }
    `;
    document.head.appendChild(style);
    
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        
        if (heroSection && scrolled < window.innerHeight) {
            // Apply subtle parallax effect
            heroSection.style.backgroundPositionY = scrolled * 0.5 + 'px';
        }
    });
    
    // Add hover effect for CTA button
    const ctaButton = document.querySelector('.hero-cta');
    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.05)';
        });
        
        ctaButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    }
    
    // View Coffee button functionality
    const viewCoffeeButtons = document.querySelectorAll('.btn-view-coffee');
    viewCoffeeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const drinkCard = this.closest('.drink-card');
            const drinkName = drinkCard.querySelector('.drink-name').textContent;

            // --- FIX: Add smooth fade-in animation instead of abrupt display ---
            const menuModal = document.getElementById('menuModal');
            if (menuModal) {
                menuModal.style.opacity = '0';  // Start hidden
                menuModal.style.display = 'block';  // Make visible
                setTimeout(() => {
                    menuModal.style.transition = 'opacity 0.5s ease';  // Animate
                    menuModal.style.opacity = '1';
                }, 10);  // Small delay for display to take effect
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        console.log('All resources loaded');
    });
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        console.log('Window resized - adjusting layout');
    }, 250);
});

// Prevent default drag behavior for images
document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navbar = document.getElementById('mainNav');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

