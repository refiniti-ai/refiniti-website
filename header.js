
class RefinitiHeader extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                /* ... [existing styles] ... */
                :host {
                    display: block;
                    font-family: 'Space Grotesk', sans-serif;
                }

                .fixed { position: fixed; }
                .top-6 { top: 1.5rem; }
                .left-0 { left: 0; }
                .right-0 { right: 0; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .w-\\[92\\%\\] { width: 92%; }
                .max-w-7xl { max-width: 80rem; }
                .z-50 { z-index: 50; }
                .px-4 { padding-left: 1rem; padding-right: 1rem; }
                .h-\\[72px\\] { height: 72px; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-between { justify-content: space-between; }
                .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 300ms; }
                .rounded-full { border-radius: 9999px; }

                .nav-glass {
                    background-color: rgba(16, 21, 28, 0.6);
                    -webkit-backdrop-filter: blur(12px);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .flex-shrink-0 { flex-shrink: 0; }
                .cursor-pointer { cursor: pointer; }
                
                .logo-img {
                    height: 2.125rem;
                    width: auto;
                    object-fit: contain;
                }
                
                .logo-anchor {
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    z-index: 10;
                }

                .hidden { display: none; }
                
                .gap-8 { gap: 1.5rem; }
                @media (min-width: 1024px) {
                    .gap-8 { gap: 2rem; }
                }

                .nav-links-container {
                    display: none;
                }

                @media (min-width: 850px) {
                    .nav-links-container {
                        display: flex;
                        align-items: center;
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        white-space: nowrap;
                    }
                }

                @media (min-width: 1100px) {
                    .nav-links-container {
                        gap: 2rem;
                    }
                }

                .nav-link {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: white;
                    text-decoration: none;
                    transition: color 0.3s;
                }
                .nav-link:hover {
                    color: #00CFFF;
                }

                .btn-primary {
                    background-color: #00CFFF;
                    color: black;
                    padding: 0.625rem 1.5rem;
                    border-radius: 9999px;
                    font-weight: 600;
                    font-size: 0.875rem;
                    border: none;
                    cursor: pointer;
                    transition: box-shadow 0.3s;
                }
                .btn-primary:hover {
                    box-shadow: 0 0 15px rgba(0, 207, 255, 0.4);
                }

                .mobile-menu-overlay {
                    position: fixed;
                    inset: 0;
                    background-color: black;
                    z-index: 40;
                    transform: translateX(100%);
                    transition: transform 0.3s ease-in-out;
                    padding-top: 8rem;
                    padding-left: 1.5rem;
                    padding-right: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .mobile-menu-overlay.open {
                    transform: translateX(0);
                }
                
                .mobile-link {
                    font-size: 1.5rem;
                    font-weight: 500;
                    color: white;
                    text-decoration: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding-bottom: 1rem;
                }
                
                .mobile-cta {
                    width: 100%;
                    padding: 1rem 0;
                    border-radius: 0.5rem;
                    font-weight: 700;
                    font-size: 1.125rem;
                    margin-top: 1rem;
                    box-shadow: 0 0 20px rgba(0, 207, 255, 0.2);
                    background-color: #00CFFF;
                    color: black; border: none; cursor: pointer;
                }

                .hamburger-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 5px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    z-index: 100;
                }
                .hamburger-btn .line {
                    height: 2px;
                    width: 24px;
                    background-color: white;
                    transition: all 0.3s ease-in-out;
                    border-radius: 2px;
                }
                .hamburger-btn.open .line-1 { transform: translateY(7px) rotate(45deg); }
                .hamburger-btn.open .line-2 { opacity: 0; }
                .hamburger-btn.open .line-3 { transform: translateY(-7px) rotate(-45deg); }

                @media (min-width: 850px) {
                    .hamburger-btn {
                        display: none;
                    }
                }

                @media (min-width: 768px) {
                    .md\:flex { display: flex; }
                    .logo-img { height: 2.5rem; }
                    nav { padding-left: 1.5rem; padding-right: 1.5rem; }
                }
            <nav class="fixed top-6 left-0 right-0 mx-auto w-[92%] max-w-7xl z-50 nav-glass rounded-full px-4 h-[72px] flex items-center justify-between transition-all">
                <a href="index.html" class="logo-anchor cursor-pointer">
                    <img src="Images/Refiniti-AI-Vertical-Logo (1).png" alt="Refiniti AI" class="logo-img">
                </a>
                <div class="nav-links-container gap-8">
                    <a href="index.html#system" class="nav-link">Process</a>
                    <a href="index.html#product-suite" class="nav-link">Engine</a>
                    <a href="index.html#how-it-works" class="nav-link">Difference</a>
                    <a href="index.html#results" class="nav-link">Results</a>
                    <a href="index.html#faq" class="nav-link">FAQ</a>
                </div>
                <div class="flex items-center gap-4">
                    <div class="hidden md:flex">
                        <button class="btn-primary" id="desktop-cta">See if you Qualify</button>
                    </div>
                    <button class="hamburger-btn" id="mobile-menu-button" aria-label="Menu">
                        <span class="line line-1"></span>
                        <span class="line line-2"></span>
                        <span class="line line-3"></span>
                    </button>
                </div>
            </nav>

            <div class="mobile-menu-overlay" id="mobile-menu">
                <a href="index.html#system" class="mobile-link">Process</a>
                <a href="index.html#product-suite" class="mobile-link">Engine</a>
                <a href="index.html#how-it-works" class="mobile-link">Difference</a>
                <a href="index.html#results" class="mobile-link">Results</a>
                <a href="index.html#faq" class="mobile-link">FAQ</a>
                <button class="mobile-cta" id="mobile-cta">See if you Qualify</button>
            </div>
        `;

        const mobileMenu = this.shadowRoot.getElementById('mobile-menu');
        const hamburgerBtn = this.shadowRoot.getElementById('mobile-menu-button');
        const mobileLinks = this.shadowRoot.querySelectorAll('.mobile-link'); // Note: CTA is separate
        const desktopLinks = this.shadowRoot.querySelectorAll('.nav-link');
        const logoAnchor = this.shadowRoot.querySelector('.logo-anchor');
        const desktopCta = this.shadowRoot.getElementById('desktop-cta');
        const mobileCta = this.shadowRoot.getElementById('mobile-cta');

        const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

        const setupNavLinks = (links) => {
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('index.html#')) {
                    if (isHomePage) {
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            const targetId = href.split('#')[1];
                            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                            if (mobileMenu.classList.contains('open')) {
                                toggleMenu();
                            }
                        });
                    }
                }
            });
        };
        
        setupNavLinks(desktopLinks);
        setupNavLinks(mobileLinks);
        
        logoAnchor.addEventListener('click', (e) => {
            if (isHomePage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        const toggleMenu = () => {
            const isOpen = hamburgerBtn.classList.toggle('open');
            mobileMenu.classList.toggle('open');
            document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        };

        hamburgerBtn.addEventListener('click', toggleMenu);
        
        const dispatchOpenModalEvent = () => {
             // Dispatch a custom event that can bubble up out of the Shadow DOM
            const event = new CustomEvent('open-booking-modal', {
                bubbles: true, // Allows the event to travel up through the DOM
                composed: true // Allows the event to cross the Shadow DOM boundary
            });
            this.dispatchEvent(event);
        };
        
        desktopCta.addEventListener('click', dispatchOpenModalEvent);
        
        mobileCta.addEventListener('click', () => {
            if (mobileMenu.classList.contains('open')) {
                toggleMenu();
            }
            // Add a small delay to allow the menu to animate out before the modal appears
            setTimeout(dispatchOpenModalEvent, 300); 
        });
    }
}
customElements.define('refiniti-header', RefinitiHeader);
