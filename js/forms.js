/* ===================================
   Clinical Connect - Forms JavaScript
   =================================== */

(function() {
    'use strict';

    // ===================================
    // Form Validation Rules
    // ===================================
    const VALIDATION_RULES = {
        required: {
            test: (value) => value.trim().length > 0,
            message: 'This field is required'
        },
        email: {
            test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Please enter a valid email address'
        },
        phone: {
            test: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')),
            message: 'Please enter a valid phone number'
        },
        minLength: (min) => ({
            test: (value) => value.trim().length >= min,
            message: `Must be at least ${min} characters long`
        }),
        maxLength: (max) => ({
            test: (value) => value.trim().length <= max,
            message: `Must not exceed ${max} characters`
        })
    };

    // ===================================
    // Form Field Class
    // ===================================
    class FormField {
        constructor(element, rules = []) {
            this.element = element;
            this.rules = rules;
            this.isValid = false;
            this.errorElement = null;
            this.touchedByUser = false;

            this.init();
        }

        init() {
            this.createErrorElement();
            this.bindEvents();
            this.setupAccessibility();
        }

        createErrorElement() {
            this.errorElement = document.createElement('div');
            this.errorElement.className = 'field-error';
            this.errorElement.style.cssText = `
                color: var(--error-red);
                font-size: var(--text-sm);
                margin-top: var(--space-1);
                min-height: 1.2em;
                opacity: 0;
                transition: opacity var(--transition-fast);
            `;
            this.errorElement.setAttribute('role', 'alert');
            this.errorElement.setAttribute('aria-live', 'polite');

            // Insert error element after the field
            this.element.parentNode.insertBefore(this.errorElement, this.element.nextSibling);
        }

        bindEvents() {
            // Validate on blur (after user interaction)
            this.element.addEventListener('blur', () => {
                this.touchedByUser = true;
                this.validate();
            });

            // Real-time validation after first interaction
            this.element.addEventListener('input', () => {
                if (this.touchedByUser) {
                    this.validate();
                }
            });

            // Clear errors on focus
            this.element.addEventListener('focus', () => {
                if (!this.touchedByUser) {
                    this.clearError();
                }
            });
        }

        setupAccessibility() {
            // Create unique ID for error element
            const errorId = `error-${this.element.id || Math.random().toString(36).substr(2, 9)}`;
            this.errorElement.id = errorId;
            this.element.setAttribute('aria-describedby', errorId);
        }

        validate() {
            const value = this.element.value;
            let isValid = true;
            let errorMessage = '';

            // Check each validation rule
            for (const rule of this.rules) {
                if (!rule.test(value)) {
                    isValid = false;
                    errorMessage = rule.message;
                    break;
                }
            }

            this.isValid = isValid;
            
            if (isValid) {
                this.clearError();
            } else {
                this.showError(errorMessage);
            }

            return isValid;
        }

        showError(message) {
            this.errorElement.textContent = message;
            this.errorElement.style.opacity = '1';
            this.element.classList.add('invalid');
            this.element.setAttribute('aria-invalid', 'true');
        }

        clearError() {
            this.errorElement.textContent = '';
            this.errorElement.style.opacity = '0';
            this.element.classList.remove('invalid');
            this.element.setAttribute('aria-invalid', 'false');
        }

        reset() {
            this.touchedByUser = false;
            this.isValid = false;
            this.clearError();
            this.element.value = '';
        }
    }

    // ===================================
    // Contact Form Class
    // ===================================
    class ContactForm {
        constructor(form) {
            this.form = form;
            this.fields = new Map();
            this.submitButton = form.querySelector('button[type="submit"]');
            this.isSubmitting = false;

            this.init();
        }

        init() {
            this.setupFields();
            this.bindEvents();
            this.setupDependentFields();
        }

        setupFields() {
            // Contact type field
            const contactType = this.form.querySelector('#contact-type');
            if (contactType) {
                this.fields.set('contactType', new FormField(contactType, [
                    VALIDATION_RULES.required
                ]));
            }

            // First name field
            const firstName = this.form.querySelector('#first-name');
            if (firstName) {
                this.fields.set('firstName', new FormField(firstName, [
                    VALIDATION_RULES.required,
                    VALIDATION_RULES.minLength(2),
                    VALIDATION_RULES.maxLength(50)
                ]));
            }

            // Last name field
            const lastName = this.form.querySelector('#last-name');
            if (lastName) {
                this.fields.set('lastName', new FormField(lastName, [
                    VALIDATION_RULES.required,
                    VALIDATION_RULES.minLength(2),
                    VALIDATION_RULES.maxLength(50)
                ]));
            }

            // Email field
            const email = this.form.querySelector('#email');
            if (email) {
                this.fields.set('email', new FormField(email, [
                    VALIDATION_RULES.required,
                    VALIDATION_RULES.email
                ]));
            }

            // Phone field (optional but validate if provided)
            const phone = this.form.querySelector('#phone');
            if (phone) {
                this.fields.set('phone', new FormField(phone, [
                    {
                        test: (value) => value === '' || VALIDATION_RULES.phone.test(value),
                        message: VALIDATION_RULES.phone.message
                    }
                ]));
            }

            // Organization field
            const organization = this.form.querySelector('#organization');
            if (organization) {
                this.fields.set('organization', new FormField(organization, [
                    VALIDATION_RULES.maxLength(100)
                ]));
            }

            // Subject field
            const subject = this.form.querySelector('#subject');
            if (subject) {
                this.fields.set('subject', new FormField(subject, [
                    VALIDATION_RULES.required
                ]));
            }

            // Message field
            const message = this.form.querySelector('#message');
            if (message) {
                this.fields.set('message', new FormField(message, [
                    VALIDATION_RULES.required,
                    VALIDATION_RULES.minLength(10),
                    VALIDATION_RULES.maxLength(1000)
                ]));
            }

            // Privacy checkbox
            const privacy = this.form.querySelector('#privacy');
            if (privacy) {
                this.fields.set('privacy', new FormField(privacy, [
                    {
                        test: (value) => privacy.checked,
                        message: 'You must agree to the privacy policy'
                    }
                ]));
            }
        }

        bindEvents() {
            // Form submission
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });

            // Real-time form validation
            this.form.addEventListener('input', () => {
                this.updateSubmitButton();
            });

            this.form.addEventListener('change', () => {
                this.updateSubmitButton();
            });

            // Enhanced UX for certain fields
            this.setupFieldEnhancements();
        }

        setupFieldEnhancements() {
            // Phone number formatting
            const phoneField = this.form.querySelector('#phone');
            if (phoneField) {
                phoneField.addEventListener('input', (e) => {
                    this.formatPhoneNumber(e.target);
                });
            }

            // Character counter for message field
            const messageField = this.form.querySelector('#message');
            if (messageField) {
                this.addCharacterCounter(messageField, 1000);
            }

            // Email suggestions
            const emailField = this.form.querySelector('#email');
            if (emailField) {
                this.addEmailSuggestions(emailField);
            }
        }

        setupDependentFields() {
            const contactType = this.form.querySelector('#contact-type');
            const organizationField = this.form.querySelector('#organization');
            
            if (contactType && organizationField) {
                contactType.addEventListener('change', () => {
                    const value = contactType.value;
                    const organizationGroup = organizationField.closest('.form-group');
                    const label = organizationGroup.querySelector('label');
                    
                    // Update label based on contact type
                    if (value === 'facility') {
                        label.textContent = 'Facility/Organization Name *';
                        // Make organization required for facilities
                        const field = this.fields.get('organization');
                        if (field) {
                            field.rules = [VALIDATION_RULES.required, VALIDATION_RULES.maxLength(100)];
                        }
                    } else if (value === 'agency') {
                        label.textContent = 'Agency Name *';
                        const field = this.fields.get('organization');
                        if (field) {
                            field.rules = [VALIDATION_RULES.required, VALIDATION_RULES.maxLength(100)];
                        }
                    } else {
                        label.textContent = 'Organization/Facility Name';
                        const field = this.fields.get('organization');
                        if (field) {
                            field.rules = [VALIDATION_RULES.maxLength(100)];
                        }
                    }
                });
            }
        }

        formatPhoneNumber(input) {
            const value = input.value.replace(/\D/g, '');
            let formattedValue = value;

            if (value.length >= 6) {
                formattedValue = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            } else if (value.length >= 3) {
                formattedValue = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            }

            input.value = formattedValue;
        }

        addCharacterCounter(field, maxLength) {
            const counter = document.createElement('div');
            counter.className = 'character-counter';
            counter.style.cssText = `
                text-align: right;
                font-size: var(--text-sm);
                color: var(--text-muted);
                margin-top: var(--space-1);
            `;

            field.parentNode.appendChild(counter);

            const updateCounter = () => {
                const remaining = maxLength - field.value.length;
                counter.textContent = `${remaining} characters remaining`;
                counter.style.color = remaining < 50 ? 'var(--error-red)' : 'var(--text-muted)';
            };

            field.addEventListener('input', updateCounter);
            updateCounter();
        }

        addEmailSuggestions(field) {
            const commonDomains = [
                'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
                'aol.com', 'icloud.com', 'protonmail.com'
            ];

            field.addEventListener('blur', () => {
                const email = field.value.trim();
                const atIndex = email.indexOf('@');
                
                if (atIndex > 0 && atIndex < email.length - 1) {
                    const domain = email.substring(atIndex + 1).toLowerCase();
                    
                    // Find similar domains
                    const suggestions = commonDomains.filter(commonDomain => {
                        return commonDomain.startsWith(domain) && commonDomain !== domain;
                    });

                    if (suggestions.length > 0) {
                        this.showEmailSuggestion(field, email.substring(0, atIndex + 1) + suggestions[0]);
                    }
                }
            });
        }

        showEmailSuggestion(field, suggestion) {
            // Remove existing suggestion
            const existingSuggestion = field.parentNode.querySelector('.email-suggestion');
            if (existingSuggestion) {
                existingSuggestion.remove();
            }

            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'email-suggestion';
            suggestionElement.style.cssText = `
                margin-top: var(--space-2);
                padding: var(--space-2) var(--space-3);
                background-color: var(--gray-50);
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
                color: var(--text-secondary);
            `;

            suggestionElement.innerHTML = `
                Did you mean <button type="button" class="suggestion-link" style="
                    background: none;
                    border: none;
                    color: var(--primary-blue);
                    text-decoration: underline;
                    cursor: pointer;
                    font-size: inherit;
                ">${suggestion}</button>?
            `;

            const suggestionLink = suggestionElement.querySelector('.suggestion-link');
            suggestionLink.addEventListener('click', () => {
                field.value = suggestion;
                field.focus();
                suggestionElement.remove();
                // Trigger validation
                this.fields.get('email').validate();
            });

            field.parentNode.appendChild(suggestionElement);

            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (suggestionElement.parentNode) {
                    suggestionElement.remove();
                }
            }, 10000);
        }

        validateForm() {
            let isValid = true;
            
            this.fields.forEach((field) => {
                if (!field.validate()) {
                    isValid = false;
                }
            });

            return isValid;
        }

        updateSubmitButton() {
            if (!this.submitButton) return;

            const isFormValid = this.isFormValid();
            this.submitButton.disabled = !isFormValid || this.isSubmitting;
            
            if (isFormValid && !this.isSubmitting) {
                this.submitButton.classList.remove('btn--disabled');
            } else {
                this.submitButton.classList.add('btn--disabled');
            }
        }

        isFormValid() {
            let isValid = true;
            
            this.fields.forEach((field) => {
                // Only validate touched fields for real-time validation
                if (field.touchedByUser && !field.validate()) {
                    isValid = false;
                }
            });

            return isValid;
        }

        async handleSubmit() {
            // Validate all fields
            if (!this.validateForm()) {
                this.showNotification('Please correct the errors below', 'error');
                // Focus on first invalid field
                const firstInvalidField = Array.from(this.fields.values()).find(field => !field.isValid);
                if (firstInvalidField) {
                    firstInvalidField.element.focus();
                }
                return;
            }

            // Prevent double submission
            if (this.isSubmitting) return;

            this.setSubmittingState(true);

            try {
                const formData = this.collectFormData();
                await this.submitForm(formData);
                this.handleSubmitSuccess();
            } catch (error) {
                this.handleSubmitError(error);
            } finally {
                this.setSubmittingState(false);
            }
        }

        collectFormData() {
            const data = {};
            
            this.fields.forEach((field, key) => {
                if (field.element.type === 'checkbox') {
                    data[key] = field.element.checked;
                } else {
                    data[key] = field.element.value.trim();
                }
            });

            // Add timestamp
            data.timestamp = new Date().toISOString();
            data.userAgent = navigator.userAgent;
            data.referrer = document.referrer;

            return data;
        }

        async submitForm(formData) {
            // Simulate API call (replace with actual endpoint)
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate random success/failure for demo
                    if (Math.random() > 0.1) {
                        resolve({ success: true, id: Date.now() });
                    } else {
                        reject(new Error('Network error'));
                    }
                }, 2000);
            });
        }

        setSubmittingState(isSubmitting) {
            this.isSubmitting = isSubmitting;
            
            if (this.submitButton) {
                if (isSubmitting) {
                    this.submitButton.disabled = true;
                    this.submitButton.innerHTML = `
                        <div class="loading-spinner"></div>
                        Sending Message...
                    `;
                } else {
                    this.submitButton.disabled = false;
                    this.submitButton.innerHTML = `
                        <svg data-lucide="send"></svg>
                        Send Message
                    `;
                    // Recreate icons
                    if (window.lucide) {
                        window.lucide.createIcons();
                    }
                }
            }

            // Disable all form fields during submission
            const formElements = this.form.querySelectorAll('input, select, textarea, button');
            formElements.forEach(element => {
                element.disabled = isSubmitting;
            });
        }

        handleSubmitSuccess() {
            this.showNotification('Thank you! Your message has been sent successfully. We\'ll get back to you within 2 hours.', 'success');
            this.resetForm();
            
            // Track successful submission
            if (window.gtag) {
                window.gtag('event', 'form_submit', {
                    form_name: 'contact_form',
                    success: true
                });
            }

            // Scroll to top of form
            this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        handleSubmitError(error) {
            console.error('Form submission error:', error);
            this.showNotification('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
            
            // Track failed submission
            if (window.gtag) {
                window.gtag('event', 'form_submit', {
                    form_name: 'contact_form',
                    success: false,
                    error: error.message
                });
            }
        }

        resetForm() {
            this.fields.forEach((field) => {
                field.reset();
            });
            this.form.reset();
            this.updateSubmitButton();
        }

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification--${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                padding: var(--space-4) var(--space-6);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-xl);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform var(--transition-normal);
                font-size: var(--text-sm);
                line-height: var(--leading-relaxed);
            `;

            // Set colors based on type
            switch (type) {
                case 'success':
                    notification.style.backgroundColor = 'var(--success-green)';
                    notification.style.color = 'white';
                    break;
                case 'error':
                    notification.style.backgroundColor = 'var(--error-red)';
                    notification.style.color = 'white';
                    break;
                default:
                    notification.style.backgroundColor = 'var(--primary-blue)';
                    notification.style.color = 'white';
            }

            // Add close button
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '×';
            closeButton.style.cssText = `
                position: absolute;
                top: var(--space-2);
                right: var(--space-3);
                background: none;
                border: none;
                color: inherit;
                font-size: var(--text-xl);
                cursor: pointer;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            closeButton.addEventListener('click', () => {
                this.hideNotification(notification);
            });

            notification.textContent = message;
            notification.appendChild(closeButton);
            document.body.appendChild(notification);

            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 10);

            // Auto-hide after delay
            setTimeout(() => {
                this.hideNotification(notification);
            }, type === 'error' ? 8000 : 6000);
        }

        hideNotification(notification) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    // ===================================
    // Quick Action Forms
    // ===================================
    class QuickActionHandler {
        constructor() {
            this.init();
        }

        init() {
            this.bindQuickActions();
        }

        bindQuickActions() {
            // Schedule demo buttons
            const demoBtns = document.querySelectorAll('[href="#schedule-demo"], .action-btn[href="#schedule-demo"]');
            demoBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleScheduleDemo();
                });
            });

            // Request quote buttons
            const quoteBtns = document.querySelectorAll('[href="#request-quote"], .action-btn[href="#request-quote"]');
            quoteBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleRequestQuote();
                });
            });

            // Emergency staffing buttons
            const emergencyBtns = document.querySelectorAll('[href="#emergency-staffing"], .action-btn[href="#emergency-staffing"]');
            emergencyBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleEmergencyStaffing();
                });
            });
        }

        handleScheduleDemo() {
            // In a real application, this would open a calendar widget or modal
            this.showQuickActionModal('Schedule Demo', `
                <p>Thank you for your interest in Clinical Connect!</p>
                <p>To schedule a personalized demo, please contact us at:</p>
                <ul style="margin: var(--space-4) 0; padding-left: var(--space-6);">
                    <li><strong>Phone:</strong> <a href="tel:+1-800-CLINICAL">1-800-CLINICAL</a></li>
                    <li><strong>Email:</strong> <a href="mailto:demo@clinicalconnect.net">demo@clinicalconnect.net</a></li>
                </ul>
                <p>Or fill out the contact form below with "Demo Request" as the subject.</p>
            `);
        }

        handleRequestQuote() {
            this.showQuickActionModal('Request Quote', `
                <p>Get a customized quote for your staffing needs.</p>
                <p>Please use the contact form below and select "General Inquiry" as the subject. Include details about:</p>
                <ul style="margin: var(--space-4) 0; padding-left: var(--space-6);">
                    <li>Type of positions needed</li>
                    <li>Number of staff required</li>
                    <li>Duration of assignment</li>
                    <li>Location and facility type</li>
                    <li>Timeline for placement</li>
                </ul>
            `);
        }

        handleEmergencyStaffing() {
            this.showQuickActionModal('Emergency Staffing', `
                <div style="background: var(--error-red); color: white; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4);">
                    <h4 style="margin: 0 0 var(--space-2); color: white;">24/7 Emergency Support</h4>
                    <p style="margin: 0; font-size: var(--text-lg);">
                        <strong>Call now: <a href="tel:+1-800-CLINICAL" style="color: white;">1-800-CLINICAL</a></strong>
                    </p>
                </div>
                <p>For immediate staffing needs, our emergency response team is available 24/7.</p>
                <p>We can typically provide qualified staff within 2-4 hours for urgent situations.</p>
            `, true);
        }

        showQuickActionModal(title, content, isUrgent = false) {
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--space-4);
                opacity: 0;
                transition: opacity var(--transition-normal);
            `;

            // Create modal content
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: white;
                border-radius: var(--radius-xl);
                padding: var(--space-8);
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                transform: scale(0.9);
                transition: transform var(--transition-normal);
            `;

            // Add content
            modal.innerHTML = `
                <button class="modal-close" style="
                    position: absolute;
                    top: var(--space-4);
                    right: var(--space-4);
                    background: none;
                    border: none;
                    font-size: var(--text-2xl);
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color var(--transition-fast);
                ">×</button>
                <h3 style="margin-bottom: var(--space-4); color: var(--text-primary);">${title}</h3>
                <div class="modal-content">${content}</div>
                <div style="margin-top: var(--space-6); text-align: center;">
                    <button class="btn btn--primary modal-action">
                        ${isUrgent ? 'Call Now' : 'Go to Contact Form'}
                    </button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // Animate in
            setTimeout(() => {
                overlay.style.opacity = '1';
                modal.style.transform = 'scale(1)';
            }, 10);

            // Bind events
            const closeBtn = modal.querySelector('.modal-close');
            const actionBtn = modal.querySelector('.modal-action');

            const closeModal = () => {
                overlay.style.opacity = '0';
                modal.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    document.body.style.overflow = '';
                }, 300);
            };

            closeBtn.addEventListener('click', closeModal);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal();
            });

            actionBtn.addEventListener('click', () => {
                if (isUrgent) {
                    window.location.href = 'tel:+1-800-CLINICAL';
                } else {
                    closeModal();
                    // Scroll to contact form
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });

            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            // Close on escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        }
    }

    // ===================================
    // Forms Manager
    // ===================================
    class FormsManager {
        constructor() {
            this.forms = new Map();
            this.quickActions = new QuickActionHandler();
            this.init();
        }

        init() {
            this.initializeForms();
            this.addGlobalStyles();
        }

        initializeForms() {
            // Initialize contact forms
            const contactForms = document.querySelectorAll('#contact-form');
            contactForms.forEach((form, index) => {
                const formInstance = new ContactForm(form);
                this.forms.set(`contact_${index}`, formInstance);
            });

            console.log(`Initialized ${this.forms.size} forms`);
        }

        addGlobalStyles() {
            const styles = `
                .field-error {
                    color: var(--error-red);
                    font-size: var(--text-sm);
                    margin-top: var(--space-1);
                }
                
                .form-group input.invalid,
                .form-group select.invalid,
                .form-group textarea.invalid {
                    border-color: var(--error-red);
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }
                
                .loading-spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s ease-in-out infinite;
                    margin-right: var(--space-2);
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .modal-close:hover {
                    background-color: var(--gray-100);
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        getForm(formId) {
            return this.forms.get(formId);
        }

        reinitialize() {
            // Clear existing forms
            this.forms.clear();
            
            // Reinitialize all forms
            this.initializeForms();
        }
    }

    // ===================================
    // Initialize Forms
    // ===================================
    let formsManager;

    function initializeForms() {
        if (formsManager) {
            formsManager.reinitialize();
        } else {
            formsManager = new FormsManager();
        }
        console.log('Clinical Connect forms initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeForms);
    } else {
        initializeForms();
    }

    // Make forms manager globally available
    window.ClinicalConnectForms = formsManager;

})();