
class LegalModal extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                .overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 200;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }
                .overlay.open {
                    opacity: 1;
                    pointer-events: auto;
                }
                .modal-container {
                    position: relative;
                    width: 100%;
                    max-width: 800px; /* Wider for legal content */
                    background-color: transparent; /* CHANGED: Removed black background */
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                    padding: 0; /* No padding here, iframe will have its own */
                    margin: 1rem;
                    height: 80vh; /* Fixed height for iframe container */
                    display: flex;
                    flex-direction: column;
                    overflow: hidden; /* Hide scrollbars of container */
                }
                .close-button {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: background-color 0.2s ease;
                    z-index: 201; /* Ensure close button is above iframe */
                }
                .close-button:hover {
                    color: #00CFFF;
                    background-color: rgba(0, 207, 255, 0.1);
                }
                .modal-iframe {
                    flex-grow: 1; /* Allow iframe to take remaining space */
                    width: 100%;
                    border: none;
                    margin: 0;
                    padding: 0;
                    background-color: #08080A; /* Background for iframe content */
                }
                .modal-footer {
                    margin-top: auto; /* Push to bottom */
                    text-align: center;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 1rem 2rem;
                    flex-shrink: 0; /* Prevent footer from shrinking */
                }
                .full-page-link {
                    color: #00CFFF;
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }
                .full-page-link:hover {
                    text-decoration: underline;
                    color: white;
                }

                @media (max-width: 600px) {
                    .modal-container {
                        margin: 0.5rem;
                        height: 95vh; /* Taller on small mobile */
                        border-radius: 0.5rem;
                    }
                    .modal-footer { padding: 0.75rem 1.25rem; }
                }
            </style>
            <div class="overlay" id="legal-overlay">
                <div class="modal-container">
                    <button class="close-button" id="close-legal-modal">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <iframe class="modal-iframe" id="legal-iframe" src="about:blank" title="Legal Document"></iframe>
                    <div class="modal-footer">
                        <a href="#" target="_blank" class="full-page-link" id="full-page-link">View Full Page in New Tab</a>
                    </div>
                </div>
            </div>
        `;
    }

    connectedCallback() {
        const overlay = this.shadowRoot.getElementById('legal-overlay');
        const closeButton = this.shadowRoot.getElementById('close-legal-modal');
        const iframe = this.shadowRoot.getElementById('legal-iframe');
        
        const closeModal = () => {
            overlay.classList.remove('open');
            document.body.style.overflow = 'auto';
            iframe.src = 'about:blank'; // Clear iframe content when closing
        };

        closeButton.addEventListener('click', closeModal);
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeModal();
            }
        });

        // NEW: Event listener for iframe load to inject styles
        iframe.addEventListener('load', () => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    const style = iframeDoc.createElement('style');
                    // Hide header and footer from the iframe content
                    // Also adjust main's padding to compensate for the removed header
                    style.textContent = `
                        refiniti-header { display: none !important; }
                        refiniti-footer { display: none !important; }
                        main { padding-top: 2rem !important; }
                    `;
                    iframeDoc.head.appendChild(style);
                }
            } catch (e) {
                console.warn('Could not inject styles into iframe (due to cross-origin policy or other issue): ', e);
            }
        });
    }

    show(title, url) {
        const overlay = this.shadowRoot.getElementById('legal-overlay');
        const iframe = this.shadowRoot.getElementById('legal-iframe');

        // Removed: this.shadowRoot.getElementById('modal-title-slot').textContent = title;
        iframe.src = url; // Set iframe source to the legal page URL
        this.shadowRoot.getElementById('full-page-link').href = url;
        
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

customElements.define('legal-modal', LegalModal);
