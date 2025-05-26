/* ===================================
   Clinical Connect - Components JavaScript
   =================================== */

(function() {
    'use strict';

    // ===================================
    // Audience Selector Component
    // ===================================
    class AudienceSelector {
        constructor(container) {
            this.container = container;
            this.tabs = container.querySelectorAll('.audience-tab');
            this.panels = container.querySelectorAll('.audience-panel');
            this.currentTab = 0;

            this.init();
        }

        init() {
            this.bindEvents();
            this.showTab(0); // Show first tab by default
        }

        bindEvents() {
            this.tabs.forEach((tab, index) => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showTab(index);
                });

                // Keyboard support
                tab.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.showTab(index);
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        const direction = e.key === 'ArrowLeft' ? -1 : 1;
                        const newIndex = (index + direction + this.tabs.length) % this.tabs.length;
                        this.tabs[newIndex].focus();
                        this.showTab(newIndex);
                    }
                });
            });
        }

        showTab(index) {
            if (index === this.currentTab) return;

            // Update tabs
            this.tabs.forEach((tab, i) => {
                tab.classList.toggle('active', i === index);
                tab.setAttribute('aria-selected', i === index);
                tab.setAttribute('tabindex', i === index ? '0' : '-1');
            });

            // Update panels with animation
            this.panels.forEach((panel, i) => {
                if (i === index) {
                    panel.style.display = 'block';
                    setTimeout(() => {
                        panel.classList.add('active');
                    }, 10);
                } else {
                    panel.classList.remove('active');
                    setTimeout(() => {
                        if (!panel.classList.contains('active')) {
                            panel.style.display = 'none';
                        }
                    }, 300);
                }
            });

            this.currentTab = index;
        }
    }

    // ===================================
    // Audience Navigation Component
    // ===================================
    class AudienceNavigation {
        constructor(container) {
            this.container = container;
            this.buttons = container.querySelectorAll('.audience-nav-btn');
            this.contents = document.querySelectorAll('.audience-content');
            this.currentContent = 0;

            this.init();
        }

        init() {
            this.bindEvents();
            this.showContent(0); // Show first content by default
        }

        bindEvents() {
            this.buttons.forEach((button, index) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showContent(index);
                });

                // Keyboard support
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.showContent(index);
                    }
                });
            });
        }

        showContent(index) {
            if (index === this.currentContent) return;

            // Update buttons
            this.buttons.forEach((button, i) => {
                button.classList.toggle('active', i === index);
                button.setAttribute('aria-selected', i === index);
            });

            // Get target content
            const targetId = this.buttons[index].getAttribute('data-target');
            const targetContent = document.getElementById(targetId);

            // Update content with smooth transition
            this.contents.forEach((content) => {
                if (content.id === targetId) {
                    content.style.opacity = '0';
                    content.style.display = 'block';
                    setTimeout(() => {
                        content.classList.add('active');
                        content.style.opacity = '1';
                    }, 10);
                } else {
                    content.classList.remove('active');
                    content.style.opacity = '0';
                    setTimeout(() => {
                        if (!content.classList.contains('active')) {
                            content.style.display = 'none';
                        }
                    }, 300);
                }
            });

            this.currentContent = index;
        }
    }

    // ===================================
    // Job Search Component
    // ===================================
    class JobSearch {
        constructor(form) {
            this.form = form;
            this.inputs = {
                title: form.querySelector('#job-title'),
                location: form.querySelector('#location'),
                type: form.querySelector('#job-type')
            };
            this.filterButtons = form.querySelectorAll('.filter-btn');
            this.activeFilters = new Set();

            this.init();
        }

        init() {
            this.bindEvents();
            this.setupAutocomplete();
        }

        bindEvents() {
            // Form submission
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });

            // Filter buttons
            this.filterButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleFilter(button);
                });
            });

            // Input validation and suggestions
            Object.values(this.inputs).forEach(input => {
                if (input) {
                    input.addEventListener('input', () => {
                        this.validateInput(input);
                        this.showSuggestions(input);
                    });

                    input.addEventListener('focus', () => {
                        this.showSuggestions(input);
                    });

                    input.addEventListener('blur', () => {
                        // Hide suggestions after a delay to allow clicking
                        setTimeout(() => this.hideSuggestions(input), 200);
                    });
                }
            });

            // Popular tag clicks
            const popularTags = document.querySelectorAll('.popular-tag');
            popularTags.forEach(tag => {
                tag.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (this.inputs.title) {
                        this.inputs.title.value = tag.textContent.trim();
                        this.handleSearch();
                    }
                });
            });
        }

        handleSearch() {
            const searchData = {
                title: this.inputs.title?.value || '',
                location: this.inputs.location?.value || '',
                type: this.inputs.type?.value || '',
                filters: Array.from(this.activeFilters)
            };

            // Show loading state
            this.showLoading();

            // Simulate search (in real implementation, this would make an API call)
            setTimeout(() => {
                this.hideLoading();
                this.displayResults(searchData);
            }, 1000);

            // Track search event
            this.trackSearch(searchData);
        }

        toggleFilter(button) {
            const filter = button.getAttribute('data-filter');
            
            if (this.activeFilters.has(filter)) {
                this.activeFilters.delete(filter);
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
            } else {
                this.activeFilters.add(filter);
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            }

            this.updateFilterDisplay();
        }

        validateInput(input) {
            const value = input.value.trim();
            const isValid = value.length >= 2;
            
            input.classList.toggle('invalid', !isValid && value.length > 0);
            input.setAttribute('aria-invalid', !isValid && value.length > 0);
        }

        setupAutocomplete() {
            // Job title suggestions
            const jobTitles = [
                'Registered Nurse', 'Travel Nurse', 'ICU Nurse', 'Emergency Nurse',
                'Physician', 'Family Medicine', 'Emergency Medicine', 'Internal Medicine',
                'Physical Therapist', 'Occupational Therapist', 'Speech Therapist',
                'Radiology Tech', 'Lab Technician', 'Pharmacy Tech',
                'Medical Assistant', 'CNA', 'LPN', 'Nurse Practitioner'
            ];

            // Location suggestions
            const locations = [
                'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
                'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
                'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL'
            ];

            this.suggestions = {
                'job-title': jobTitles,
                'location': locations
            };
        }

        showSuggestions(input) {
            const inputId = input.id;
            const suggestions = this.suggestions[inputId];
            
            if (!suggestions || input.value.length < 2) {
                this.hideSuggestions(input);
                return;
            }

            const query = input.value.toLowerCase();
            const matches = suggestions.filter(item => 
                item.toLowerCase().includes(query)
            ).slice(0, 5);

            if (matches.length === 0) {
                this.hideSuggestions(input);
                return;
            }

            this.createSuggestionsList(input, matches);
        }

        createSuggestionsList(input, matches) {
            // Remove existing suggestions
            this.hideSuggestions(input);

            const suggestionsList = document.createElement('ul');
            suggestionsList.className = 'suggestions-list';
            suggestionsList.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid var(--border-light);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                max-height: 200px;
                overflow-y: auto;
                margin: 0;
                padding: 0;
                list-style: none;
            `;

            matches.forEach((match, index) => {
                const li = document.createElement('li');
                li.textContent = match;
                li.style.cssText = `
                    padding: var(--space-3) var(--space-4);
                    cursor: pointer;
                    border-bottom: 1px solid var(--border-light);
                    transition: background-color var(--transition-fast);
                `;

                li.addEventListener('mouseenter', () => {
                    li.style.backgroundColor = 'var(--gray-50)';
                });

                li.addEventListener('mouseleave', () => {
                    li.style.backgroundColor = 'transparent';
                });

                li.addEventListener('click', () => {
                    input.value = match;
                    this.hideSuggestions(input);
                    input.focus();
                });

                suggestionsList.appendChild(li);
            });

            // Position suggestions
            const inputGroup = input.closest('.input-group');
            inputGroup.style.position = 'relative';
            inputGroup.appendChild(suggestionsList);
        }

        hideSuggestions(input) {
            const inputGroup = input.closest('.input-group');
            const existingSuggestions = inputGroup.querySelector('.suggestions-list');
            if (existingSuggestions) {
                existingSuggestions.remove();
            }
        }

        showLoading() {
            const submitBtn = this.form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <div class="loading-spinner"></div>
                    Searching...
                `;
            }
        }

        hideLoading() {
            const submitBtn = this.form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <svg data-lucide="search"></svg>
                    Search Jobs
                `;
                // Recreate icons
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        }

        displayResults(searchData) {
            // In a real implementation, this would navigate to results page
            // or update the current page with results
            console.log('Search performed:', searchData);
            
            // Show success message
            this.showNotification('Search completed! Redirecting to results...', 'success');
            
            // Simulate redirect
            setTimeout(() => {
                // window.location.href = '/jobs/search?' + new URLSearchParams(searchData);
                console.log('Would redirect to search results page');
            }, 1500);
        }

        updateFilterDisplay() {
            // Update filter count display if needed
            const filterCount = this.activeFilters.size;
            const filterDisplay = this.form.querySelector('.filter-count');
            
            if (filterDisplay) {
                filterDisplay.textContent = filterCount > 0 ? `(${filterCount})` : '';
            }
        }

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification--${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--success-green);
                color: white;
                padding: var(--space-4) var(--space-6);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform var(--transition-normal);
            `;

            document.body.appendChild(notification);

            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 10);

            // Remove after delay
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        trackSearch(searchData) {
            // Track search analytics
            if (window.gtag) {
                window.gtag('event', 'job_search', {
                    search_term: searchData.title,
                    location: searchData.location,
                    job_type: searchData.type
                });
            }
        }
    }

    // ===================================
    // Interactive Showcase Component
    // ===================================
    class InteractiveShowcase {
        constructor(container) {
            this.container = container;
            this.items = container.querySelectorAll('.showcase-item, .job-card, .metric-card');
            this.currentIndex = 0;
            this.autoPlayInterval = null;
            this.isPlaying = true;

            this.init();
        }

        init() {
            if (this.items.length <= 1) return;

            this.createControls();
            this.bindEvents();
            this.startAutoPlay();
        }

        createControls() {
            const controls = document.createElement('div');
            controls.className = 'showcase-controls';
            controls.style.cssText = `
                display: flex;
                justify-content: center;
                align-items: center;
                gap: var(--space-3);
                margin-top: var(--space-4);
            `;

            // Previous button
            const prevBtn = document.createElement('button');
            prevBtn.innerHTML = '<svg data-lucide="chevron-left"></svg>';
            prevBtn.className = 'showcase-btn showcase-btn--prev';
            prevBtn.setAttribute('aria-label', 'Previous item');

            // Play/Pause button
            const playBtn = document.createElement('button');
            playBtn.innerHTML = '<svg data-lucide="pause"></svg>';
            playBtn.className = 'showcase-btn showcase-btn--play';
            playBtn.setAttribute('aria-label', 'Pause autoplay');

            // Next button
            const nextBtn = document.createElement('button');
            nextBtn.innerHTML = '<svg data-lucide="chevron-right"></svg>';
            nextBtn.className = 'showcase-btn showcase-btn--next';
            nextBtn.setAttribute('aria-label', 'Next item');

            // Indicators
            const indicators = document.createElement('div');
            indicators.className = 'showcase-indicators';
            indicators.style.cssText = `
                display: flex;
                gap: var(--space-2);
                margin-left: var(--space-4);
            `;

            this.items.forEach((_, index) => {
                const indicator = document.createElement('button');
                indicator.className = 'showcase-indicator';
                indicator.setAttribute('aria-label', `Go to item ${index + 1}`);
                indicator.style.cssText = `
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    border: none;
                    background: var(--gray-300);
                    cursor: pointer;
                    transition: background-color var(--transition-fast);
                `;
                indicator.addEventListener('click', () => this.goToItem(index));
                indicators.appendChild(indicator);
            });

            controls.appendChild(prevBtn);
            controls.appendChild(playBtn);
            controls.appendChild(nextBtn);
            controls.appendChild(indicators);

            this.container.appendChild(controls);
            this.controls = { prevBtn, playBtn, nextBtn, indicators };

            // Style buttons
            [prevBtn, playBtn, nextBtn].forEach(btn => {
                btn.style.cssText = `
                    width: 40px;
                    height: 40px;
                    border: 1px solid var(--border-medium);
                    background: var(--white);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                `;
            });

            // Recreate icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }

        bindEvents() {
            if (!this.controls) return;

            this.controls.prevBtn.addEventListener('click', () => this.previousItem());
            this.controls.nextBtn.addEventListener('click', () => this.nextItem());
            this.controls.playBtn.addEventListener('click', () => this.toggleAutoPlay());

            // Pause on hover
            this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.container.addEventListener('mouseleave', () => {
                if (this.isPlaying) this.startAutoPlay();
            });

            // Keyboard controls
            this.container.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousItem();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextItem();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.toggleAutoPlay();
                        break;
                }
            });
        }

        goToItem(index) {
            if (index === this.currentIndex) return;

            // Update items
            this.items.forEach((item, i) => {
                item.classList.toggle('active', i === index);
                item.style.transform = `translateX(${(i - index) * 100}%)`;
            });

            // Update indicators
            if (this.controls) {
                const indicators = this.controls.indicators.querySelectorAll('.showcase-indicator');
                indicators.forEach((indicator, i) => {
                    indicator.style.backgroundColor = i === index ? 'var(--primary-blue)' : 'var(--gray-300)';
                });
            }

            this.currentIndex = index;
        }

        nextItem() {
            const nextIndex = (this.currentIndex + 1) % this.items.length;
            this.goToItem(nextIndex);
        }

        previousItem() {
            const prevIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
            this.goToItem(prevIndex);
        }

        startAutoPlay() {
            this.pauseAutoPlay();
            this.autoPlayInterval = setInterval(() => {
                this.nextItem();
            }, 4000);
        }

        pauseAutoPlay() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }

        toggleAutoPlay() {
            this.isPlaying = !this.isPlaying;
            
            if (this.controls) {
                const playBtn = this.controls.playBtn;
                const icon = playBtn.querySelector('svg');
                
                if (this.isPlaying) {
                    icon.setAttribute('data-lucide', 'pause');
                    playBtn.setAttribute('aria-label', 'Pause autoplay');
                    this.startAutoPlay();
                } else {
                    icon.setAttribute('data-lucide', 'play');
                    playBtn.setAttribute('aria-label', 'Start autoplay');
                    this.pauseAutoPlay();
                }
                
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        }

        destroy() {
            this.pauseAutoPlay();
        }
    }

    // ===================================
    // Component Manager
    // ===================================
    class ComponentManager {
        constructor() {
            this.components = new Map();
            this.init();
        }

        init() {
            this.initializeComponents();
            this.bindGlobalEvents();
        }

        initializeComponents() {
            // Initialize Audience Selectors
            const audienceSelectors = document.querySelectorAll('.hero__audience-selector');
            audienceSelectors.forEach((selector, index) => {
                const component = new AudienceSelector(selector);
                this.components.set(`audienceSelector_${index}`, component);
            });

            // Initialize Audience Navigation
            const audienceNavigations = document.querySelectorAll('.audience-tabs-container');
            audienceNavigations.forEach((nav, index) => {
                const component = new AudienceNavigation(nav);
                this.components.set(`audienceNavigation_${index}`, component);
            });

            // Initialize Job Search
            const jobSearchForms = document.querySelectorAll('#job-search-form');
            jobSearchForms.forEach((form, index) => {
                const component = new JobSearch(form);
                this.components.set(`jobSearch_${index}`, component);
            });

            // Initialize Interactive Showcases
            const showcases = document.querySelectorAll('.opportunity-showcase, .metrics-dashboard');
            showcases.forEach((showcase, index) => {
                const component = new InteractiveShowcase(showcase);
                this.components.set(`showcase_${index}`, component);
            });
        }

        bindGlobalEvents() {
            // Handle dynamic content loading
            document.addEventListener('contentLoaded', () => {
                this.reinitializeComponents();
            });

            // Handle component-specific events
            document.addEventListener('componentUpdate', (e) => {
                this.updateComponent(e.detail.componentId, e.detail.data);
            });
        }

        reinitializeComponents() {
            // Destroy existing components
            this.components.forEach(component => {
                if (component.destroy && typeof component.destroy === 'function') {
                    component.destroy();
                }
            });
            this.components.clear();

            // Reinitialize
            this.initializeComponents();
        }

        updateComponent(componentId, data) {
            const component = this.components.get(componentId);
            if (component && component.update && typeof component.update === 'function') {
                component.update(data);
            }
        }

        getComponent(componentId) {
            return this.components.get(componentId);
        }

        destroy() {
            this.components.forEach(component => {
                if (component.destroy && typeof component.destroy === 'function') {
                    component.destroy();
                }
            });
            this.components.clear();
        }
    }

    // ===================================
    // Initialize Components
    // ===================================
    let componentManager;

    function initializeComponents() {
        if (componentManager) {
            componentManager.destroy();
        }
        componentManager = new ComponentManager();
        console.log('Clinical Connect components initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeComponents);
    } else {
        initializeComponents();
    }

    // Make component manager globally available
    window.ClinicalConnectComponents = componentManager;

})();