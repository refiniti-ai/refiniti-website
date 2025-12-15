class RefinitiFooter extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        // IMPORTANT: Legal content strings are removed.
        // The legal-modal will now load the actual HTML pages via iframe.

        shadow.innerHTML = `
            <style>
                /* --- Existing Footer Styles --- */
                :host {
                    display: block;
                    font-family: 'Space Grotesk', sans-serif;
                }
                
                .relative { position: relative; }
                .py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
                .bg-transparent { background-color: transparent; }
                .text-white { color: white; }
                .max-w-7xl { max-width: 80rem; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }

                .footer-pill {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 2rem;
                    padding: 2.5rem;
                    border-radius: 1.5rem;
                    background-color: rgba(16, 21, 28, 0.6);
                    -webkit-backdrop-filter: blur(12px);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .flex-col { flex-direction: column; }
                .gap-6 { gap: 1.5rem; }
                .max-w-sm { max-width: 24rem; }
                .footer-logo-anchor { text-decoration: none; cursor: pointer; }
                .footer-logo { height: 2.5rem; width: auto; object-fit: contain; align-self: flex-start; }
                .footer-text { font-size: 0.875rem; color: white; line-height: 1.625; }
                .copyright { font-size: 0.75rem; color: #9ca3af; margin-top: 1rem; }
                .flex { display: flex; }
                .gap-12 { gap: 3rem; }
                .links-heading { font-weight: 700; color: #9ca3af; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; margin-bottom: 1rem; }
                .footer-link { display: block; color: white; text-decoration: none; margin-bottom: 0.75rem; font-size: 0.875rem; transition: color 0.3s; }
                .footer-link:hover { color: #00CFFF; }
                .footer-social-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 9999px; background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: white; transition: all 0.3s; text-decoration: none; }
                .footer-social-icon:hover { background-color: #00CFFF; color: black; }
                .mobile-copyright { width: 100%; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center; }

                /* --- Booking Modal Styles --- */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }

                .modal-overlay.open {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .modal-container {
                    position: relative;
                    width: 100%;
                    max-width: 600px;
                    background-color: #0d1117;
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                    padding: 2rem;
                    margin: 1rem;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .modal-container label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 0.9em;
                    font-weight: 600;
                    color: #e6edf3;
                }

                .close-button {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    padding: 0.5rem; /* Added for click area */
                }
                .close-button:hover {
                    color: #00CFFF;
                }
                
                .form-input { 
                    width: 100%; 
                    padding: 12px 16px; 
                    border: 1px solid #30363d; 
                    border-radius: 6px; 
                    background-color: #010409; 
                    color: #ffffff; 
                    font-size: 1em;
                    box-sizing: border-box;
                }
                .form-input:focus {
                    border-color: #00CFFF;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(0, 207, 255, 0.2);
                }

                .services-group {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-top: 10px;
                }
                
                .service-option {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 15px 5px;
                    border: 1px solid #30363d;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    user-select: none;
                    background-color: #0d1117;
                    text-align: center;
                    min-height: 90px;
                }
                
                .service-option:hover {
                    border-color: #8b949e;
                    background-color: #161b22;
                }
                
                .service-option svg {
                    width: 24px;
                    height: 24px;
                    margin-bottom: 10px;
                    color: #8b949e;
                    transition: color 0.2s;
                }
                
                .service-option span {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #c9d1d9;
                    line-height: 1.2;
                }

                .service-option.selected {
                    border-color: #00CFFF;
                    background-color: rgba(0, 207, 255, 0.1);
                }
                
                .service-option.selected svg,
                .service-option.selected span {
                    color: #00CFFF;
                }
                
                .consent-group { display: flex; align-items: flex-start; gap: 12px; margin-top: 1rem; padding: 1rem; background-color: rgba(255, 255, 255, 0.03); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); }
                .consent-checkbox { appearance: none; -webkit-appearance: none; margin-top: 4px; flex-shrink: 0; height: 18px; width: 18px; background-color: #0d1117; border: 1px solid #30363d; border-radius: 4px; cursor: pointer; position: relative; transition: all 0.2s ease; }
                .consent-checkbox:checked { background-color: #00CFFF; border-color: #00CFFF; }
                .consent-checkbox:checked::after { content: ''; position: absolute; top: 1px; left: 5px; width: 6px; height: 12px; border: solid black; border-width: 0 2px 2px 0; transform: rotate(45deg); }
                .consent-label { font-size: 0.75rem; line-height: 1.5; color: #888; cursor: pointer; }
                /* --- END: Booking Modal Styles --- */


                @media (max-width: 767px) {
                    .footer-pill { flex-direction: column; }
                    .md\\:hidden { display: block; }
                    .hidden.md\\:block { display: none; }
                    .social-links-container { flex-direction: row; }
                    .links-container { flex-wrap: wrap; }
                    .services-group { grid-template-columns: repeat(2, 1fr); }
                }

                @media (min-width: 768px) {
                    .py-10.md\\:py-20 { padding-top: 5rem; padding-bottom: 5rem; }
                    .px-2.md\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
                    .md\\:flex-row { flex-direction: row; }
                    .md\\:hidden { display: none; }
                    .social-links-container { flex-direction: column; }
                }
            </style>
            
            <footer class="relative py-10 md:py-20 bg-transparent text-white">
                <div class="max-w-7xl mx-auto px-2 md:px-6">
                    <div class="footer-pill">
                        
                        <div class="flex flex-col gap-6 max-w-sm">
                             <a href="index.html" class="footer-logo-anchor">
                                <img src="Images/Refiniti-AI-Vertical-Logo (1).png" alt="Refiniti AI" class="footer-logo">
                            </a>
                            <p class="footer-text">
                                Built for ambitious teams. The only AI growth system that diagnoses, automates, and scales revenue with mathematical precision.
                            </p>
                            <p class="copyright hidden md:block">© ${new Date().getFullYear()} RefinitiAI. All rights reserved.</p>
                        </div>

                        <div class="flex gap-12 links-container">
                            <div>
                                <h4 class="links-heading">Product</h4>
                                <a href="index.html#system" class="footer-link">Process</a>
                                <a href="index.html#product-suite" class="footer-link">Engine</a>
                                <a href="index.html#how-it-works" class="footer-link">Difference</a>
                                <a href="index.html#results" class="footer-link">Results</a>
                                <a href="index.html#faq" class="footer-link">FAQ</a>
                            </div>
                             <!-- <div>
                                <h4 class="links-heading">Company</h4>
                                <a href="#" class="footer-link">Roadmap</a>
                                <a href="#" class="footer-link">Helpdesk</a>
                                <a href="#" class="footer-link">Blog</a>
                                <a href="#" class="footer-link">Affiliate</a>
                            </div> -->
                            <div>
                                <h4 class="links-heading">Legal</h4>
                                <a data-modal-trigger="privacy" class="footer-link">Privacy Policy</a>
                                <a data-modal-trigger="terms" class="footer-link">Terms & Conditions</a>
                            </div>
                        </div>

                        <div class="flex flex-col gap-4 social-links-container">
                            <!-- Social Icons -->
                        </div>

                        <div class="md:hidden mobile-copyright">
                            <p class="copyright">© ${new Date().getFullYear()} RefinitiAI. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
            
            <!-- Booking Modal -->
            <div id="booking-modal" class="modal-overlay">
                <div class="modal-container">
                    <button id="closeModalButton" class="close-button">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <h2 class="text-2xl font-bold text-white mb-6 text-center" style="font-size: 1.5rem;">Claim Your Exclusive Offer</h2>
                    <form id="custom-marketing-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            <input type="text" name="first_name" placeholder="First Name" required class="form-input">
                            <input type="text" name="last_name" placeholder="Last Name" required class="form-input">
                        </div>
                        <input type="email" name="email" placeholder="Email" required class="form-input">
                        <input type="tel" name="phone" placeholder="Phone" required class="form-input">
                        <input type="number" name="marketing_budget" placeholder="Marketing Budget ($)" required class="form-input" min="0">
                        
                        <!-- NEW: Service Needed Section -->
                        <div>
                            <label>Service Needed (Select all that apply)</label>
                            <div id="servicesNeededContainer" class="services-group">
                                <div class="service-option" data-value="Rebranding">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                                    <span>Rebranding</span>
                                </div>
                                <div class="service-option" data-value="Funnels">
                                     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L12 14.414l-8.707-8.707A1 1 0 013 6V4z"></path></svg>
                                    <span>Funnels</span>
                                </div>
                                <div class="service-option" data-value="Conversion Optimization">
                                     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                    <span>Conversion Opt.</span>
                                </div>
                                <div class="service-option" data-value="Social Media">
                                     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>
                                    <span>Social Media</span>
                                </div>
                            </div>
                            <input type="hidden" id="service_needed" name="service_needed">
                        </div>
                        
                        <div class="consent-group">
                            <input type="checkbox" id="sms_consent" name="sms_consent" class="consent-checkbox" required>
                            <label for="sms_consent" class="consent-label">I consent to receive recurring SMS/MMS messages from Refiniti AI at the mobile number I provided. Message frequency may vary. Msg & data rates may apply. Text STOP to cancel or HELP for help.</label>
                        </div>
                        <button type="submit" style="padding: 0.75rem 0; background-color: #00CFFF; color: black; font-weight: bold; border-radius: 99px; border: none; cursor: pointer;">Submit Application</button>
                    </form>
                </div>
            </div>
            <legal-modal id="legal-modal-instance"></legal-modal>
        `;

        const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
        const links = shadow.querySelectorAll('.footer-link');
        const logoAnchor = shadow.querySelector('.footer-logo-anchor');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('index.html#')) {
                if (isHomePage) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const targetId = href.split('#')[1];
                        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                    });
                }
            }
        });

        if (logoAnchor) {
            logoAnchor.addEventListener('click', (e) => {
                if (isHomePage) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }

        // --- BOOKING MODAL & FORM LOGIC ---
        const bookingModal = shadow.getElementById('booking-modal');
        const form = shadow.getElementById('custom-marketing-form');
        const closeBookingModalButton = shadow.getElementById('closeModalButton');
        const serviceContainer = shadow.getElementById('servicesNeededContainer');
        const hiddenServiceInput = shadow.getElementById('service_needed');
        const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/itcUlMQJDKPVgPxLNDGk/webhook-trigger/57552fa2-ef08-48d1-af2d-d2f6a5d87719';

        const openBookingModal = () => {
            bookingModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        const closeBookingModal = () => {
            bookingModal.classList.remove('open');
            document.body.style.overflow = 'auto';
        };

        document.addEventListener('open-booking-modal', openBookingModal);
        
        closeBookingModalButton.addEventListener('click', closeBookingModal);
        
        bookingModal.addEventListener('click', (event) => {
            if (event.target === bookingModal) {
                closeBookingModal();
            }
        });

        // --- Multi-Select Logic (for booking modal) ---
        const updateHiddenServiceInput = () => {
            const selectedServices = Array.from(serviceContainer.querySelectorAll('.service-option.selected'))
                .map(option => option.getAttribute('data-value'));
            hiddenServiceInput.value = selectedServices.join(', ');
        };

        if (serviceContainer) {
            serviceContainer.addEventListener('click', (event) => {
                let target = event.target.closest('.service-option');
                if (target) {
                    target.classList.toggle('selected');
                    updateHiddenServiceInput();
                }
            });
        }

        // --- Form Submission Logic (for booking modal) ---
        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.textContent = 'Submitting...';
                submitButton.disabled = true;

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                data.sms_consent = form.querySelector('#sms_consent').checked ? "true" : "false";

                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (response.ok) {
                        form.reset();
                        serviceContainer.querySelectorAll('.service-option').forEach(el => el.classList.remove('selected'));
                        updateHiddenServiceInput();
                         // Construct the URL with merge fields from form data using the actual form input names
                         const redirectUrl = `schedule-meeting.html?first_name=${encodeURIComponent(data.first_name || '')}&last_name=${encodeURIComponent(data.last_name || '')}&email=${encodeURIComponent(data.email || '')}&phone=${encodeURIComponent(data.phone || '')}`;
                         window.location.href = redirectUrl;
                    } else {
                        alert('Submission Failed. Please try again.');
                    }
                })
                .catch(error => {
                    alert('A network error occurred. Please try again.');
                    console.error('Fetch error:', error);
                })
                .finally(() => {
                    submitButton.textContent = 'Submit Application';
                    submitButton.disabled = false;
                });
            });
        }

        // --- LEGAL MODAL LOGIC ---
        // Ensure legal-modal.js is loaded and custom element is defined before trying to use it
        customElements.whenDefined('legal-modal').then(() => {
            const legalModal = shadow.getElementById('legal-modal-instance');

            if (legalModal) {
                shadow.querySelector('[data-modal-trigger="privacy"]')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    legalModal.show('Privacy Policy', 'privacy-policy.html'); // Pass URL only
                });

                shadow.querySelector('[data-modal-trigger="terms"]')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    legalModal.show('Terms & Conditions', 'terms-conditions.html'); // Pass URL only
                });
            } else {
                console.error('Legal modal instance not found in footer shadow DOM.');
            }
        }).catch(error => {
            console.error('Error defining legal-modal custom element:', error);
        });
    }
}

customElements.define('refiniti-footer', RefinitiFooter);
