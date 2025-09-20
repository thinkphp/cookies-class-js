 /**
         * CookieConsent - Clasă pentru gestionarea consimțământului cookies GDPR
         * @author Your Name
         * @version 1.0.0
         */
        class CookieConsent {
            constructor(options = {}) {
                // Configurări default
                this.config = {
                    cookieName: 'cookieConsent',
                    expirationDays: 365,
                    autoShow: true,
                    position: 'bottom', // 'bottom', 'top', 'center'
                    theme: 'default',
                    language: 'ro',
                    categories: {
                        essential: { required: true, enabled: true },
                        analytics: { required: false, enabled: false },
                        marketing: { required: false, enabled: false }
                    },
                    callbacks: {
                        onAcceptAll: null,
                        onDenyAll: null,
                        onSavePreferences: null,
                        onShow: null,
                        onHide: null
                    },
                    texts: {
                        title: 'Acest site folosește cookie-uri',
                        description: 'Folosim cookie-uri pentru a îmbunătăți experiența ta pe site-ul nostru.',
                        acceptAll: 'Acceptă',
                        denyAll: 'Refuză',
                        settings: 'Setări',
                        savePreferences: 'Salvează preferințele',
                        cancel: 'Anulează'
                    },
                    ...options
                };

                this.consent = { ...this.config.categories };
                this.isVisible = false;
                this.elements = {};
                
                this.init();
            }

            /**
             * Inițializează componenta
             */
            init() {
                this.createElements();
                this.bindEvents();
                
                if (this.config.autoShow && !this.hasConsent()) {
                    this.show();
                }
                
                this.executeCallback('onInit');
            }

            /**
             * Creează elementele DOM
             */
            createElements() {
                // Container principal
                this.elements.overlay = document.createElement('div');
                this.elements.overlay.className = 'cookie-overlay';
                this.elements.overlay.style.display = 'none';
                
                this.elements.consent = document.createElement('div');
                this.elements.consent.className = 'cookie-consent';
                
                // Header
                this.createHeader();
                
                // Settings modal
                this.createSettingsModal();
                
                // Success message
                this.createSuccessMessage();
                
                // Asamblare
                this.elements.overlay.appendChild(this.elements.consent);
                document.body.appendChild(this.elements.overlay);
            }

            /**
             * Creează header-ul cu acțiuni rapide
             */
            createHeader() {
                const header = document.createElement('div');
                header.className = 'cookie-header';
                
                header.innerHTML = `
                    <span class="cookie-icon">🍪</span>
                    <div class="cookie-header-content">
                        <h2 class="cookie-title">${this.config.texts.title}</h2>
                        <p class="cookie-subtitle">${this.config.texts.description}</p>
                    </div>
                    <div class="banner-actions">
                        <button class="btn btn-outline btn-small" data-action="settings">${this.config.texts.settings}</button>
                        <button class="btn btn-secondary btn-small" data-action="deny">${this.config.texts.denyAll}</button>
                        <button class="btn btn-primary btn-small" data-action="accept">${this.config.texts.acceptAll}</button>
                    </div>
                `;
                
                this.elements.header = header;
                this.elements.consent.appendChild(header);
            }

            /**
             * Creează modal-ul de setări
             */
            createSettingsModal() {
                const settingsModal = document.createElement('div');
                settingsModal.className = 'cookie-tabs';
                settingsModal.style.display = 'none';
                settingsModal.innerHTML = `
                    <button class="tab-button active" data-tab="details">Setări Cookie</button>
                    <button class="tab-button" data-tab="about">Informații</button>
                `;
                
                const modalContent = document.createElement('div');
                modalContent.className = 'tab-content';
                modalContent.style.display = 'none';
                
                // Details tab
                const detailsTab = this.createDetailsTab();
                const aboutTab = this.createAboutTab();
                
                modalContent.appendChild(detailsTab);
                modalContent.appendChild(aboutTab);
                
                this.elements.settingsModal = settingsModal;
                this.elements.modalContent = modalContent;
                
                this.elements.consent.appendChild(settingsModal);
                this.elements.consent.appendChild(modalContent);
            }

            /**
             * Creează tab-ul cu detalii
             */
            createDetailsTab() {
                const detailsTab = document.createElement('div');
                detailsTab.id = 'details';
                detailsTab.className = 'tab-pane active';
                
                let categoriesHTML = '';
                Object.keys(this.config.categories).forEach(categoryKey => {
                    const category = this.config.categories[categoryKey];
                    const categoryInfo = this.getCategoryInfo(categoryKey);
                    
                    categoriesHTML += `
                        <div class="cookie-category ${categoryKey}">
                            <div class="category-header">
                                <span class="category-name">${categoryInfo.icon} ${categoryInfo.name}</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" 
                                           id="${categoryKey}" 
                                           ${category.enabled ? 'checked' : ''} 
                                           ${category.required ? 'disabled' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <p class="category-description">${categoryInfo.description}</p>
                        </div>
                    `;
                });
                
                detailsTab.innerHTML = `
                    ${categoriesHTML}
                    <div class="cookie-actions">
                        <button class="btn btn-outline" data-action="close">${this.config.texts.cancel}</button>
                        <button class="btn btn-secondary" data-action="deny">${this.config.texts.denyAll}</button>
                        <button class="btn btn-primary" data-action="save">${this.config.texts.savePreferences}</button>
                    </div>
                `;
                
                return detailsTab;
            }

            /**
             * Creează tab-ul despre
             */
            createAboutTab() {
                const aboutTab = document.createElement('div');
                aboutTab.id = 'about';
                aboutTab.className = 'tab-pane';
                
                aboutTab.innerHTML = `
                    <p class="consent-description">
                        <strong>Ce sunt cookie-urile?</strong><br>
                        Cookie-urile sunt fișiere mici de text care sunt plasate pe computerul sau dispozitivul mobil atunci când vizitați un site web.
                    </p>
                    
                    <p class="consent-description">
                        <strong>Cum folosim cookie-urile?</strong><br>
                        Folosim cookie-uri pentru a îmbunătăți experiența dvs. de navigare, pentru a personaliza conținutul și pentru a analiza traficul site-ului.
                    </p>

                    <p class="consent-description">
                        <strong>Drepturile dvs.:</strong><br>
                        Aveți dreptul să acceptați sau să refuzați cookie-urile și să vă modificați preferințele în orice moment.
                    </p>

                    <div class="cookie-actions">
                        <button class="btn btn-primary" data-action="show-settings">Înapoi la Setări</button>
                    </div>
                `;
                
                return aboutTab;
            }

            /**
             * Creează mesajul de succes
             */
            createSuccessMessage() {
                const successMessage = document.createElement('div');
                successMessage.id = 'successMessage';
                successMessage.className = 'success-message';
                successMessage.innerHTML = `
                    <div class="success-icon">✅</div>
                    <h3 class="success-title">Preferințele au fost salvate!</h3>
                    <p class="success-subtitle">Mulțumim pentru timp. Puteți modifica aceste setări oricând.</p>
                `;
                
                this.elements.successMessage = successMessage;
                this.elements.consent.appendChild(successMessage);
            }

            /**
             * Asociază event listeners
             */
            bindEvents() {
                // Click pe butoane
                this.elements.consent.addEventListener('click', (e) => {
                    const action = e.target.getAttribute('data-action');
                    if (action) {
                        e.preventDefault();
                        this.handleAction(action);
                    }
                });

                // Tab navigation
                this.elements.consent.addEventListener('click', (e) => {
                    if (e.target.classList.contains('tab-button')) {
                        const tabName = e.target.getAttribute('data-tab');
                        this.showTab(tabName);
                    }
                });

                // Close modal when clicking outside
                this.elements.overlay.addEventListener('click', (e) => {
                    if (e.target === this.elements.overlay && this.config.allowClickOutside) {
                        this.hide();
                    }
                });
            }

            /**
             * Gestionează acțiunile utilizatorului
             */
            handleAction(action) {
                switch (action) {
                    case 'accept':
                        this.acceptAll();
                        break;
                    case 'deny':
                        this.denyAll();
                        break;
                    case 'settings':
                        this.showSettings();
                        break;
                    case 'save':
                        this.savePreferences();
                        break;
                    case 'close':
                        this.hide();
                        break;
                    case 'show-settings':
                        this.showTab('details');
                        break;
                }
            }

            /**
             * Acceptă toate cookie-urile
             */
            acceptAll() {
                Object.keys(this.consent).forEach(category => {
                    this.consent[category].enabled = true;
                });
                
                this.saveConsent();
                this.showSuccess();
                this.executeCallback('onAcceptAll', this.consent);
            }

            /**
             * Refuză toate cookie-urile opționale
             */
            denyAll() {
                Object.keys(this.consent).forEach(category => {
                    this.consent[category].enabled = this.consent[category].required || false;
                });
                
                this.saveConsent();
                this.showSuccess();
                this.executeCallback('onDenyAll', this.consent);
            }

            /**
             * Salvează preferințele utilizatorului
             */
            savePreferences() {
                // Actualizează consent-ul din checkboxuri
                Object.keys(this.consent).forEach(category => {
                    const checkbox = document.getElementById(category);
                    if (checkbox && !this.consent[category].required) {
                        this.consent[category].enabled = checkbox.checked;
                    }
                });
                
                this.saveConsent();
                this.showSuccess();
                this.executeCallback('onSavePreferences', this.consent);
            }

            /**
             * Afișează modal-ul de setări
             */
            showSettings() {
                const headerContent = this.elements.header.querySelector('.cookie-header-content');
                const bannerActions = this.elements.header.querySelector('.banner-actions');
                const cookieIcon = this.elements.header.querySelector('.cookie-icon');
                
                headerContent.style.display = 'none';
                bannerActions.style.display = 'none';
                cookieIcon.style.display = 'none';
                
                this.elements.settingsModal.style.display = 'flex';
                this.elements.modalContent.style.display = 'block';
            }

            /**
             * Afișează un tab specific
             */
            showTab(tabName) {
                // Ascunde toate tab-urile
                this.elements.consent.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // Dezactivează toate butoanele de tab
                this.elements.consent.querySelectorAll('.tab-button').forEach(button => {
                    button.classList.remove('active');
                });
                
                // Afișează tab-ul selectat
                const targetTab = this.elements.consent.querySelector(`#${tabName}`);
                const targetButton = this.elements.consent.querySelector(`[data-tab="${tabName}"]`);
                
                if (targetTab) targetTab.classList.add('active');
                if (targetButton) targetButton.classList.add('active');
            }

            /**
             * Afișează mesajul de succes
             */
            showSuccess() {
                const tabContent = this.elements.consent.querySelector('.tab-content');
                const settingsModal = this.elements.settingsModal;
                
                if (tabContent) tabContent.style.display = 'none';
                if (settingsModal) settingsModal.style.display = 'none';
                
                this.elements.successMessage.classList.add('show');
                
                setTimeout(() => {
                    this.hide();
                }, 2000);
            }

            /**
             * Afișează banner-ul de consimțământ
             */
            show() {
                if (this.isVisible) return;
                
                this.elements.overlay.style.display = 'block';
                
                setTimeout(() => {
                    this.elements.consent.classList.add('show');
                    this.isVisible = true;
                    this.executeCallback('onShow');
                }, 100);
            }

            /**
             * Ascunde banner-ul de consimțământ
             */
            hide() {
                if (!this.isVisible) return;
                
                this.elements.consent.classList.remove('show');
                
                setTimeout(() => {
                    this.elements.overlay.style.display = 'none';
                    this.isVisible = false;
                    this.executeCallback('onHide');
                }, 300);
            }

            /**
             * Salvează consimțământul în cookie
             */
            saveConsent() {
                const consentData = {
                    consent: this.consent,
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                };
                
                this.setCookie(this.config.cookieName, JSON.stringify(consentData), this.config.expirationDays);
            }

            /**
             * Verifică dacă utilizatorul a dat deja consimțământul
             */
            hasConsent() {
                return this.getCookie(this.config.cookieName) !== null;
            }

            /**
             * Obține consimțământul salvat
             */
            getConsent() {
                const saved = this.getCookie(this.config.cookieName);
                return saved ? JSON.parse(saved) : null;
            }

            /**
             * Resetează consimțământul
             */
            reset() {
                this.deleteCookie(this.config.cookieName);
                this.consent = { ...this.config.categories };
                
                if (this.config.autoShow) {
                    this.show();
                }
            }

            /**
             * Verifică dacă o categorie este acceptată
             */
            isAccepted(category) {
                const saved = this.getConsent();
                return saved && saved.consent[category] && saved.consent[category].enabled;
            }

            /**
             * Utility: Set cookie
             */
            setCookie(name, value, days) {
                const expires = new Date();
                expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
                document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
            }

            /**
             * Utility: Get cookie
             */
            getCookie(name) {
                const nameEQ = name + "=";
                const ca = document.cookie.split(';');
                for(let i = 0; i < ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
                }
                return null;
            }

            /**
             * Utility: Delete cookie
             */
            deleteCookie(name) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }

            /**
             * Obține informații despre o categorie
             */
            getCategoryInfo(category) {
                const categoryInfo = {
                    essential: {
                        name: 'Cookie-uri Esențiale',
                        icon: '🔒',
                        description: 'Aceste cookie-uri sunt necesare pentru funcționarea corectă a site-ului și nu pot fi dezactivate.'
                    },
                    analytics: {
                        name: 'Cookie-uri de Analiză',
                        icon: '📊',
                        description: 'Ne ajută să înțelegem cum interactionează vizitatorii cu site-ul nostru prin colectarea și raportarea informațiilor în mod anonim.'
                    },
                    marketing: {
                        name: 'Cookie-uri de Marketing',
                        icon: '🎯',
                        description: 'Sunt folosite pentru a urmări vizitatorii pe site-uri web pentru a afișa reclame relevante și atractive.'
                    }
                };
                
                return categoryInfo[category] || { name: category, icon: '🍪', description: '' };
            }

            /**
             * Execută callback dacă există
             */
            executeCallback(callbackName, ...args) {
                const callback = this.config.callbacks[callbackName];
                if (typeof callback === 'function') {
                    callback.apply(this, args);
                }
            }
        }

        // Instanțiere și funcții globale pentru compatibilitate
        let cookieConsentInstance;

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Configurare personalizată
            cookieConsentInstance = new CookieConsent({
                autoShow: true,
                callbacks: {
                    onAcceptAll: function(consent) {
                        console.log('All cookies accepted:', consent);
                        // Aici poți activa Google Analytics, Facebook Pixel, etc.
                        if (consent.analytics.enabled) {
                            console.log('Analytics cookies enabled');
                            // enableGoogleAnalytics();
                        }
                        if (consent.marketing.enabled) {
                            console.log('Marketing cookies enabled');
                            // enableFacebookPixel();
                            // enableGoogleAds();
                        }
                    },
                    onDenyAll: function(consent) {
                        console.log('Optional cookies denied:', consent);
                    },
                    onSavePreferences: function(consent) {
                        console.log('Preferences saved:', consent);
                        
                        // Activează/dezactivează serviciile bazate pe preferințe
                        if (consent.analytics.enabled) {
                            console.log('Enabling analytics...');
                        } else {
                            console.log('Disabling analytics...');
                        }
                        
                        if (consent.marketing.enabled) {
                            console.log('Enabling marketing cookies...');
                        } else {
                            console.log('Disabling marketing cookies...');
                        }
                    }
                }
            });
        });

        // Demo function pentru reset (doar pentru testare)
        function resetCookieConsent() {
            if (cookieConsentInstance) {
                cookieConsentInstance.reset();
            }
        }

        // API public pentru interacțiunea externă
        window.CookieConsent = {
            getInstance: () => cookieConsentInstance,
            show: () => cookieConsentInstance?.show(),
            hide: () => cookieConsentInstance?.hide(),
            reset: () => cookieConsentInstance?.reset(),
            isAccepted: (category) => cookieConsentInstance?.isAccepted(category),
            getConsent: () => cookieConsentInstance?.getConsent()
        };
