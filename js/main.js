/* ===================================
   Clinical Connect - Main JavaScript
   =================================== */

(function() {
    'use strict';

    // ===================================
    // Constants and Configuration
    // ===================================
    const CONFIG = {
        scrollOffset: 100,
        animationDelay: 150,
        throttleDelay: 16,
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1280
        }
    };

    // ===================================
    // Utility Functions
    // ===================================
    
    /**
     * Throttle function to limit function calls
     */
    function throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    /**
     * Debounce function to delay function calls
     */
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const elementHeight = rect.bottom - rect.top;
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        return visibleHeight / elementHeight >= threshold;
    }

    /**
     * Get current viewport width
     */
    function getViewportWidth() {
        return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    }

    /**
     * Check if device is mobile
     */
    function isMobile() {
        return getViewportWidth() < CONFIG.breakpoints.mobile;
    }

    /**
     * Smooth scroll to element
     */
    function smoothScrollTo(target, offset = 0) {
        if (!target) return;
        
        const targetPosition = target.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = Math.min(Math.abs(distance) / 2, 1000);
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        function easeInOutCubic(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        }

        requestAnimationFrame(animation);
    }

    // ===================================
    // Navigation Management
    // ===================================
    class Navigation {
        constructor() {
            this.header = document.getElementById('header');
            this.nav = document.querySelector('.nav');
            this.navMenu = document.getElementById('nav-menu');
            this.navToggle = document.getElementById('nav-toggle');
            this.navLinks = document.querySelectorAll('.nav__link');
            this.isMenuOpen = false;

            this.init();
        }

        init() {
            this.bindEvents();
            this.handleActiveLink();
            this.handleScrollEffects();
        }

        bindEvents() {
            // Mobile menu toggle
            if (this.navToggle) {
                this.navToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleMobileMenu();
                });
            }

            // Close menu when clicking nav links
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    this.handleNavLinkClick(e);
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (this.isMenuOpen && !this.nav.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            // Handle escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });

            // Handle scroll effects
            window.addEventListener('scroll', throttle(() => {
                this.handleScrollEffects();
                this.handleActiveLink();
            }, CONFIG.throttleDelay));

            // Handle resize
            window.addEventListener('resize', debounce(() => {
                if (!isMobile() && this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            }, 200));
        }

        toggleMobileMenu() {
            if (this.isMenuOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }

        openMobileMenu() {
            this.navMenu.classList.add('active');
            this.navToggle.innerHTML = '<svg><use href="#x"></use></svg>';
            this.isMenuOpen = true;
            document.body.style.overflow = 'hidden';
            
            // Update toggle icon to X
            const icon = this.navToggle.querySelector('svg');
            if (icon) {
                icon.setAttribute('data-lucide', 'x');
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        }

        closeMobileMenu() {
            this.navMenu.classList.remove('active');
            this.isMenuOpen = false;
            document.body.style.overflow = '';
            
            // Update toggle icon back to menu
            const icon = this.navToggle.querySelector('svg');
            if (icon) {
                icon.setAttribute('data-lucide', 'menu');
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        }

        handleNavLinkClick(e) {
            const href = e.target.getAttribute('href');
            
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    this.closeMobileMenu();
                    setTimeout(() => {
                        smoothScrollTo(targetElement, this.header ? this.header.offsetHeight : 80);
                    }, isMobile() ? 300 : 0);
                }
            }

            // Close mobile menu for any nav link click
            if (this.isMenuOpen) {
                this.closeMobileMenu();
            }
        }

        handleScrollEffects() {
            if (!this.header) return;

            const scrollY = window.pageYOffset;
            
            if (scrollY > CONFIG.scrollOffset) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        }

        handleActiveLink() {
            const sections = document.querySelectorAll('section[id]');
            const scrollY = window.pageYOffset;
            const headerHeight = this.header ? this.header.offsetHeight : 80;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeight - 50;
                const sectionBottom = sectionTop + section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionBottom) {
                    this.navLinks.forEach(link => {
                        link.classList.remove('active-link');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active-link');
                        }
                    });
                }
            });
        }
    }

    // ===================================
    // Animation Controller
    // ===================================
    class AnimationController {
        constructor() {
            this.animatedElements = new Set();
            this.observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            this.init();
        }

        init() {
            this.setupIntersectionObserver();
            this.setupScrollAnimations();
        }

        setupIntersectionObserver() {
            if (!('IntersectionObserver' in window)) {
                // Fallback for browsers without IntersectionObserver
                this.fallbackAnimation();
                return;
            }

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                        this.animateElement(entry.target);
                        this.animatedElements.add(entry.target);
                    }
                });
            }, this.observerOptions);

            this.observeElements();
        }

        observeElements() {
            const elementsToAnimate = document.querySelectorAll(`
                .service-card,
                .benefit-item,
                .feature-item,
                .contact-method,
                .value-item,
                .team-member,
                .metric-card,
                .job-card,
                .success-metric
            `);

            elementsToAnimate.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                this.observer.observe(element);
            });
        }

        animateElement(element) {
            const delay = Array.from(element.parentNode.children).indexOf(element) * 100;
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, delay);
        }

        fallbackAnimation() {
            const elements = document.querySelectorAll(`
                .service-card,
                .benefit-item,
                .feature-item,
                .contact-method,
                .value-item,
                .team-member
            `);

            elements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('animate-fade-in');
                }, index * CONFIG.animationDelay);
            });
        }

        setupScrollAnimations() {
            const counters = document.querySelectorAll('.stat-number, .metric-value, .impact-number');
            const hasAnimated = new Set();

            const animateCounters = throttle(() => {
                counters.forEach(counter => {
                    if (isInViewport(counter) && !hasAnimated.has(counter)) {
                        this.animateCounter(counter);
                        hasAnimated.add(counter);
                    }
                });
            }, CONFIG.throttleDelay);

            window.addEventListener('scroll', animateCounters);
            animateCounters(); // Run once on load
        }

        animateCounter(element) {
            const target = element.textContent.trim();
            const isPercentage = target.includes('%');
            const isCurrency = target.includes('$');
            const isTime = target.includes('s') || target.includes('hr');
            
            let numericTarget = parseFloat(target.replace(/[^\d.]/g, ''));
            if (isNaN(numericTarget)) return;

            let current = 0;
            const increment = numericTarget / 50;
            const duration = 1000;
            const stepTime = duration / 50;

            const updateCounter = () => {
                current += increment;
                if (current >= numericTarget) {
                    current = numericTarget;
                }

                let displayValue = Math.floor(current);
                
                if (isCurrency) {
                    if (numericTarget >= 1000000) {
                        displayValue = (current / 1000000).toFixed(1) + 'M';
                    } else if (numericTarget >= 1000) {
                        displayValue = (current / 1000).toFixed(1) + 'K';
                    }
                    displayValue = '$' + displayValue;
                } else if (isPercentage) {
                    displayValue = Math.floor(current) + '%';
                } else if (isTime) {
                    if (target.includes('hrs')) {
                        displayValue = Math.floor(current) + 'hrs';
                    } else {
                        displayValue = Math.floor(current) + 's';
                    }
                } else if (numericTarget >= 1000) {
                    displayValue = displayValue.toLocaleString();
                }

                // Handle special cases
                if (target.includes('+')) {
                    displayValue += '+';
                }

                element.textContent = displayValue;

                if (current < numericTarget) {
                    setTimeout(updateCounter, stepTime);
                }
            };

            updateCounter();
        }

        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }
        }
    }

    // ===================================
    // Performance Optimizations
    // ===================================
    class PerformanceOptimizer {
        constructor() {
            this.init();
        }

        init() {
            this.lazyLoadImages();
            this.preloadCriticalAssets();
            this.optimizeScrolling();
        }

        lazyLoadImages() {
            if ('IntersectionObserver' in window) {
                const images = document.querySelectorAll('img[data-src]');
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                images.forEach(img => imageObserver.observe(img));
            }
        }

        preloadCriticalAssets() {
            // Preload critical fonts
            const fontUrls = [
                'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
                'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
            ];

            fontUrls.forEach(url => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'style';
                link.href = url;
                document.head.appendChild(link);
            });
        }

        optimizeScrolling() {
            // Passive event listeners for better scroll performance
            let ticking = false;
            
            const updateScrollElements = () => {
                // Update any scroll-dependent elements here
                ticking = false;
            };

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(updateScrollElements);
                    ticking = true;
                }
            }, { passive: true });
        }
    }

    // ===================================
    // Accessibility Enhancements
    // ===================================
    class AccessibilityController {
        constructor() {
            this.init();
        }

        init() {
            this.setupKeyboardNavigation();
            this.setupFocusManagement();
            this.setupARIA();
            this.setupReducedMotion();
        }

        setupKeyboardNavigation() {
            // Tab trap for mobile menu
            const navMenu = document.getElementById('nav-menu');
            const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && navMenu && navMenu.classList.contains('active')) {
                    const focusable = navMenu.querySelectorAll(focusableElements);
                    const firstFocusable = focusable[0];
                    const lastFocusable = focusable[focusable.length - 1];

                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            lastFocusable.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            firstFocusable.focus();
                            e.preventDefault();
                        }
                    }
                }
            });
        }

        setupFocusManagement() {
            // Skip to main content link
            const skipLink = document.createElement('a');
            skipLink.href = '#main';
            skipLink.textContent = 'Skip to main content';
            skipLink.className = 'sr-only';
            skipLink.style.cssText = `
                position: fixed;
                top: -40px;
                left: 6px;
                background: var(--primary-blue);
                color: white;
                padding: 8px;
                border-radius: 4px;
                text-decoration: none;
                z-index: 1000;
                transition: top 0.3s;
            `;

            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });

            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });

            document.body.insertBefore(skipLink, document.body.firstChild);

            // Add main landmark if not present
            const main = document.querySelector('main');
            if (main && !main.id) {
                main.id = 'main';
            }
        }

        setupARIA() {
            // Enhanced ARIA labels and descriptions
            const navToggle = document.getElementById('nav-toggle');
            if (navToggle) {
                navToggle.setAttribute('aria-label', 'Toggle navigation menu');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-controls', 'nav-menu');
            }

            // Update ARIA states
            document.addEventListener('click', (e) => {
                if (e.target.id === 'nav-toggle') {
                    const isExpanded = e.target.getAttribute('aria-expanded') === 'true';
                    e.target.setAttribute('aria-expanded', !isExpanded);
                }
            });
        }

        setupReducedMotion() {
            // Respect user's motion preferences
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            
            if (prefersReducedMotion.matches) {
                document.documentElement.style.setProperty('--transition-fast', '0ms');
                document.documentElement.style.setProperty('--transition-normal', '0ms');
                document.documentElement.style.setProperty('--transition-slow', '0ms');
            }

            prefersReducedMotion.addEventListener('change', (e) => {
                if (e.matches) {
                    document.documentElement.style.setProperty('--transition-fast', '0ms');
                    document.documentElement.style.setProperty('--transition-normal', '0ms');
                    document.documentElement.style.setProperty('--transition-slow', '0ms');
                } else {
                    document.documentElement.style.removeProperty('--transition-fast');
                    document.documentElement.style.removeProperty('--transition-normal');
                    document.documentElement.style.removeProperty('--transition-slow');
                }
            });
        }
    }

    // ===================================
    // Error Handling
    // ===================================
    class ErrorHandler {
        constructor() {
            this.init();
        }

        init() {
            window.addEventListener('error', this.handleError.bind(this));
            window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
        }

        handleError(event) {
            console.error('JavaScript Error:', event.error);
            // Could send to analytics or error reporting service
        }

        handlePromiseRejection(event) {
            console.error('Unhandled Promise Rejection:', event.reason);
            // Could send to analytics or error reporting service
        }
    }

    // ===================================
    // Main Application Controller
    // ===================================
    class ClinicalConnectApp {
        constructor() {
            this.components = {};
            this.isInitialized = false;
        }

        init() {
            if (this.isInitialized) return;

            try {
                // Initialize core components
                this.components.navigation = new Navigation();
                this.components.animations = new AnimationController();
                this.components.performance = new PerformanceOptimizer();
                this.components.accessibility = new AccessibilityController();
                this.components.errorHandler = new ErrorHandler();

                this.isInitialized = true;
                this.dispatchReadyEvent();
                
                console.log('Clinical Connect application initialized successfully');
            } catch (error) {
                console.error('Error initializing Clinical Connect application:', error);
            }
        }

        dispatchReadyEvent() {
            const event = new CustomEvent('clinicalConnectReady', {
                detail: { app: this }
            });
            document.dispatchEvent(event);
        }

        destroy() {
            Object.values(this.components).forEach(component => {
                if (component.destroy && typeof component.destroy === 'function') {
                    component.destroy();
                }
            });
            this.components = {};
            this.isInitialized = false;
        }
    }

    // ===================================
    // Application Initialization
    // ===================================
    const app = new ClinicalConnectApp();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            app.init();
        });
    } else {
        app.init();
    }

    // Make app instance globally available for debugging
    window.ClinicalConnectApp = app;

})();