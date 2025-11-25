// --- SECURE BACKEND PROXY ENDPOINT ---
// CRITICAL: All API calls are routed through this secure Cloud Function URL.
const SECURE_FUNCTION_URL = "https://gemini-secure-handler-lnqiwbygjq-wn.a.run.app"; 
// -------------------------------------

let isChatInteractive = false;
let chatContainer; // Declare globally, assign in DOMContentLoaded
let simulationIntervalId; // To store the interval ID for the simulation
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// --- TABS LOGIC ---
const comparisons = {
    acquisition: {
        quote: "\"I'm spending thousands on ads but getting unqualified leads that go nowhere.\"",
        result: "High CPA, low-quality leads, wasted budget.",
        refinitiQuote: "\"AI audits audience data to target intent-based users, filtering out low-quality clicks.\"",
        refinitiResult: "CPA drops by 40%, lead quality skyrockets.",
        chat: [
            { role: 'client', text: "Our ad spend is through the roof, but our leads aren't converting." },
            { role: 'refiniti', text: "That's a common acquisition problem. We'll audit your targeting and creative." },
            { role: 'client', text: "So, you're saying we're attracting the wrong people?" },
            { role: 'refiniti', text: "Precisely. Our AI will refine your audience to attract high-intent users." },
            { role: 'client', text: "Amazing! Our lead quality has never been better." },
            { role: 'refiniti', text: "Focused acquisition leads to predictable, profitable growth. Always." }
        ]
    },
    behavior: {
        quote: "\"Traffic comes to the site, looks around for 10 seconds, and bounces without engaging.\"",
        result: "80% Bounce Rate, zero engagement.",
        refinitiQuote: "\"Landing pages dynamically adapt headlines and creative based on the user's ad source.\"",
        refinitiResult: "Time on site +300%, bounce rate plummets.",
        chat: [
            { role: 'client', text: "People visit our site, but they just leave without doing anything." },
            { role: 'refiniti', text: "That indicates a behavioral disconnect. We need to optimize their journey." },
            { role: 'client', text: "How do you get them to stay and engage?" },
            { role: 'refiniti', text: "Dynamic content and clear calls to action, personalized for each visitor." },
            { role: 'client', text: "Our engagement metrics are through the roof now!" },
            { role: 'refiniti', text: "Engaged users are converting users. It's the core of smart funnels." }
        ]
    },
    conversion: {
        quote: "\"They add to cart or book a call, but then ghost us. Manual follow-up is too slow.\"",
        result: "Lead goes cold, revenue lost.",
        refinitiQuote: "\"Instant AI-triggered SMS & Email sequences nurture leads the second they show interest.\"",
        refinitiResult: "Conversion rate doubles, revenue scales.",
        chat: [
            { role: 'client', text: "We get leads, but they never close. Our team can't keep up." },
            { role: 'refiniti', text: "That's a conversion velocity issue. We automate follow-up instantly." },
            { role: 'client', text: "You mean, no more lost leads because of slow responses?" },
            { role: 'refiniti', text: "Exactly. AI triggers personalized sequences the moment interest is shown." },
            { role: 'client', text: "Our conversion rate just doubled! This is incredible." },
            { role: 'refiniti', text: "Automated, intelligent nurturing closes more deals, faster. That's Refiniti." }
        ]
    }
};

let currentChatMessages = comparisons.acquisition.chat; // Default chat messages

// --- 1. GLOBAL UI FUNCTIONS ---

window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('translate-x-full');
    document.body.classList.toggle('overflow-hidden');
}

window.openBookingModal = function() {
    const modal = document.getElementById('booking-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

window.closeBookingModal = function() {
    const modal = document.getElementById('booking-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

window.toggleFAQ = function(button) {
    const item = button.parentElement;
    document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
            otherItem.classList.remove('open');
        }
    });
    item.classList.toggle('open');
}

window.handleEnter = function(event) {
    if (event.key === 'Enter') {
        window.sendToGemini();
    }
}

window.switchTab = function(tabName, btn) {
    const data = comparisons[tabName];
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const container = document.getElementById('comparison-container');
    container.style.opacity = '0';
    setTimeout(() => {
        document.getElementById('reality-quote').textContent = data.quote;
        document.getElementById('reality-result').textContent = data.result;
        document.getElementById('refiniti-quote').textContent = data.refinitiQuote;
        document.getElementById('refiniti-result').textContent = data.refinitiResult;
        container.style.opacity = '1';
    }, 200);

    // Update chat for the new tab
    currentChatMessages = data.chat;
    isChatInteractive = false; // Reset interactive mode
    if (chatContainer) {
        chatContainer.dataset.mode = 'simulation';
        clearInterval(simulationIntervalId); // Stop any ongoing simulation
        runSimulationChat(); // Start simulation for the new tab
    }
}

// --- CORE HELPER FUNCTIONS ---

function animateCounter() {
    const counterEl = document.getElementById('revenue-counter');
    if(!counterEl) return;
    let start = 0;
    const end = 128500; 
    const duration = 2500; 
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(easeOutQuad * (end - start) + start);
        counterEl.textContent = '$' + current.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            setTimeout(() => {
                startTime = null;
                window.requestAnimationFrame(step);
            }, 2000); 
        }
    }
    window.requestAnimationFrame(step);
}

async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    try {
        const response = await fetch(url, options);
        
        if (response.status === 429 || response.status >= 500) {
            throw new Error(`Retryable HTTP error! status: ${response.status}`);
        }
        
        if (!response.ok) {
            try {
                const errorBody = await response.json();
                console.error("API Error Body:", errorBody);
            } catch(e) { /* ignore parsing error */ }

            const error = new Error(`HTTP error! status: ${response.status}`);
            error.retryable = false;
            throw error;
        }

        return response;
    } catch (error) {
        if (retries > 0 && (error.retryable !== false)) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        } else {
            throw error;
        }
    }
}

async function appendMessage(role, text, typeEffect = false) {
    const div = document.createElement('div');
    div.className = `chat-bubble ${role === 'client' ? 'chat-left' : 'chat-right'} mb-3`;
    
    if(role === 'refiniti') {
        div.style.border = '1px solid rgba(0, 207, 255, 0.3)';
        div.style.boxShadow = '0 0 15px rgba(0, 207, 255, 0.1)';
    }

    chatContainer.appendChild(div);

    if (typeEffect) {
        let i = 0;
        div.textContent = '';
        return new Promise(resolve => {
            function type() {
                if (i < text.length) {
                    div.textContent += text.charAt(i);
                    i++;
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    setTimeout(type, 10);
                } else {
                    div.innerHTML = div.textContent
                        .replace(/\*\*(.*?)\*\*/g, '<strong class=\"text-white\">$1</strong>')
                        .replace(/#cta/g, '<a href=\"#\" onclick=\"openBookingModal(); return false;\" class=\"text-[#00CFFF] underline hover:text-white font-bold\">Schedule Audit</a>')
                        .replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g, '<a href=\"mailto:$1\" class=\"text-[#00CFFF] underline hover:text-white\">$1</a>');
                    resolve();
                }
            }
            type();
        });
    } else {
        div.textContent = text;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// --- CHAT SIMULATION LOGIC FUNCTION ---
async function runSimulationChat() {
    chatContainer.innerHTML = ''; 
    for (const msg of currentChatMessages) {
        if(chatContainer.dataset.mode === 'interactive') break; // Stop if mode changes
        await appendMessage(msg.role, msg.text);
        await new Promise(r => setTimeout(r, 1500));
    }
    if(chatContainer.dataset.mode !== 'interactive') {
        // Only restart simulation if still in simulation mode
        simulationIntervalId = setTimeout(runSimulationChat, 3000); 
    }
}


// --- 3. SECURE API CALL FUNCTIONS ---

window.runSiteAudit = async function() {
    const input = document.getElementById('audit-url');
    const url = input.value.trim();
    if(!url) return;

    // Show loading
    document.getElementById('audit-loading').classList.remove('hidden');
    document.getElementById('audit-loading').classList.add('flex');
    document.getElementById('audit-results').classList.add('hidden');

    // Construct the prompt that the secure backend will execute
    const auditPrompt = `Analyze the domain name '${url}' and generate a page speed and SEO marketing audit. Return valid JSON with: { "score": integer 0-100, "headline": "string", "points": [ { "title": "string", "desc": "string" } (3 items) ] }`;

    try {
        // Call the SECURE CLOUD FUNCTION (Backend Proxy)
        const response = await fetchWithRetry(
            SECURE_FUNCTION_URL, 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: auditPrompt }) // Send the prompt securely
            }
        );
        
        const data = await response.json();
        const rawResponseText = data.gemini_response || data.result || data.text || '';
        
        const cleanText = rawResponseText.replace(/```json/g, '').replace(/```/g, '');
        const report = JSON.parse(cleanText);

        // Populate Results
        document.getElementById('audit-score').innerText = report.score;
        document.getElementById('audit-headline').innerText = report.headline;
        
        const pointsContainer = document.getElementById('audit-points');
        pointsContainer.innerHTML = '';
        
        report.points.forEach(point => {
             const div = document.createElement('div');
             div.className = 'flex gap-4';
             div.innerHTML = `
                 <div class=\"shrink-0 mt-1\"><i data-lucide=\"alert-triangle\" class=\"w-5 h-5 text-[#00CFFF]\"></i></div>
                 <div>
                     <h4 class=\"font-bold text-white text-sm\">${point.title}</h4>
                     <p class=\"text-gray-400 text-xs leading-relaxed\">${point.desc}</p>
                 </div>
             `;
             pointsContainer.appendChild(div);
        });
        if(window.lucide) lucide.createIcons();

    } catch (e) {
        // Fallback logic for display if API fails
        console.error("Secure Audit Failed:", e);
        const fallbackMessage = `**Diagnosis:** Service Connection Failed. **Refiniti Fix:** Verify the Cloud Function is running and check console for errors. **Next Step:** Book your audit here: #cta or email marketing@refiniti.ai.`;
        
        document.getElementById('audit-score').innerText = "42";
        document.getElementById('audit-headline').innerText = "ERROR: Connection Failed";
        document.getElementById('audit-points').innerHTML = `<p class=\"text-red-400\">${fallbackMessage}</p>`;
        if(window.lucide) lucide.createIcons();
    }

    // Hide loading, show results
    setTimeout(() => {
        document.getElementById('audit-loading').classList.add('hidden');
        document.getElementById('audit-loading').classList.remove('flex');
        document.getElementById('audit-results').classList.remove('hidden');
    }, 1500);
}

window.sendToGemini = async function() {
    const inputField = document.getElementById('ai-prompt-input');
    const userText = inputField.value.trim();
    if (!userText) return;

    // 1. Switch to Interactive Mode and Show User Message
    if (!isChatInteractive) {
        isChatInteractive = true;
        chatContainer.dataset.mode = 'interactive'; // Set to interactive mode
        chatContainer.innerHTML = '';
        clearInterval(simulationIntervalId); // Stop the simulation when entering interactive mode
    }
    inputField.value = '';
    await appendMessage('client', userText);

    // 3. Show Loading State
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = `chat-bubble chat-right mb-3 text-xs text-gray-400 animate-pulse`;
    loadingDiv.textContent = "RefinitiAI analyzing...";
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 4. Call Secure Proxy with Retry Logic
    try {
        const response = await fetchWithRetry(
            SECURE_FUNCTION_URL, // Hitting the secure proxy URL
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userText }) // Sending only the user text
            }
        );

        const data = await response.json();
        
        // Check if we actually got a successful response back from the secure backend
        if (data.status !== "SUCCESS" || !data.gemini_response) {
             throw new Error(data.message || "API call failed on the backend.");
        }

        const aiText = data.gemini_response; // Get the response from your backend's final JSON
        document.getElementById(loadingId).remove();
        await appendMessage('refiniti', aiText, true);

    } catch (error) {
        // Fallback Logic: (Original fallback logic remains the same)
        console.error("Gemini Error:", error);
        const loadingEl = document.getElementById(loadingId);
        if(loadingEl) loadingEl.remove();

        const fallbackMessage = `**Diagnosis:** Service Connection Lost. **Refiniti Fix:** Please check the console for infrastructure errors. **Next Step:** Book your audit here: #cta or email marketing@refiniti.ai.`;
        await appendMessage('refiniti', fallbackMessage, true);
    }
}

// --- NEW: Custom Form Submission Logic ---
function initializeCustomForm() {
    const form = document.getElementById('betaAccessForm');
    const serviceContainer = document.getElementById('servicesNeededContainer');
    const hiddenServiceInput = document.getElementById('service_needed');
    const messageElement = document.getElementById('message');
    const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/itcUlMQJDKPVgPxLNDGk/webhook-trigger/57552fa2-ef08-48d1-af2d-d2f6a5d87719';

    if (!form || !serviceContainer || !hiddenServiceInput || !messageElement) return;

    // --- 1. Multi-Select Logic ---
    serviceContainer.addEventListener('click', function(event) {
        let target = event.target.closest('.service-option');
        if (target) {
            target.classList.toggle('selected');
            updateHiddenServiceInput();
        }
    });

    function updateHiddenServiceInput() {
        const selectedServices = Array.from(serviceContainer.querySelectorAll('.service-option.selected'))
            .map(option => option.getAttribute('data-value'));
        
        // Join the selected services into a comma-separated string for GHL
        hiddenServiceInput.value = selectedServices.join(', ');
    }


    // --- 2. Form Submission Logic ---
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Stop default HTML submission

        // Clear previous messages
        messageElement.textContent = 'Submitting...';
        messageElement.style.color = '#c9d1d9'; 

        // Get data from the form inputs
        const formData = new FormData(form);
        const data = {};
        
        // Convert form data into a simple object matching the GHL field names
        formData.forEach((value, key) => {
            // Only include fields that have a name attribute
            if(key) {
                data[key] = value;
            }
        });

        // Ensure the services field is updated right before submission
        updateHiddenServiceInput();
        data['service_needed'] = hiddenServiceInput.value;


        // Send the data to the Webhook URL
        fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Send data as JSON
            },
            body: JSON.stringify(data) 
        })
        .then(response => {
            // Note: Webhooks usually return a 200 or 202 status on receipt, 
            // even if the GHL workflow fails later. We check if the connection was successful.
            if (response.ok || response.status === 200 || response.status === 202) {
                messageElement.textContent = 'Application Submitted Successfully! Check your email.';
                messageElement.style.color = '#3fb950';
                form.reset();
                // Remove 'selected' class from service options after successful submission
                serviceContainer.querySelectorAll('.service-option').forEach(el => el.classList.remove('selected'));
                updateHiddenServiceInput(); // Clear the hidden input value
                
                // Close modal after delay
                setTimeout(() => {
                     window.closeBookingModal();
                     messageElement.textContent = '';
                }, 3000);
            } else {
                // This means the Webhook URL or server had an issue
                messageElement.textContent = 'Submission Failed. Server connection error.';
                messageElement.style.color = '#ff7b72';
                console.error('Webhook response status:', response.status);
            }
        })
        .catch(error => {
            messageElement.textContent = 'Network Error. Could not connect to Webhook.';
            messageElement.style.color = '#ff7b72';
            console.error('Fetch error:', error);
        });
    });
}


// --- 4. Initialization Logic (Runs when the script is loaded) ---
function initializeSiteLogic() {
    chatContainer = document.getElementById('chat-container'); // Assign chatContainer here
    // FIX for 'd is not defined'
    const d = new Date(); 
    
    // Logic that relies on the DOM being ready
    const monthEl = document.getElementById('current-month');
    if(monthEl) monthEl.textContent = monthNames[d.getMonth()];

    // Revenue Counter Animation Logic
    const funnelSection = document.getElementById('funnel');
    if(funnelSection) {
        const observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) animateCounter();
        });
        observer.observe(funnelSection);
    }
    
    // Before/After Slider Logic
    const sliderContainer = document.getElementById('comparison-slider');
    if (sliderContainer) {
        let isDragging = false;
        const sliderForeground = document.getElementById('slider-foreground');
        const sliderHandle = document.getElementById('slider-handle');

        function updateSlider(x) {
            const rect = sliderContainer.getBoundingClientRect();
            let percentage = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
            sliderForeground.style.width = `${percentage}%`;
            sliderHandle.style.left = `${percentage}%`;
        }
        sliderContainer.addEventListener('mousedown', (e) => { isDragging = true; updateSlider(e.clientX); });
        window.addEventListener('mousemove', (e) => { if (isDragging) updateSlider(e.clientX); });
        window.addEventListener('mouseup', () => { isDragging = false; });
        sliderContainer.addEventListener('touchstart', (e) => { isDragging = true; updateSlider(e.touches[0].clientX); });
        window.addEventListener('touchmove', (e) => { if (isDragging) updateSlider(e.touches[0].clientX); });
        window.addEventListener('touchend', () => { isDragging = false; });
    }

    // Chat Simulation Logic
    if (chatContainer) {
        chatContainer.dataset.mode = 'simulation';
        runSimulationChat(); // Start Simulation on Load
    }
    
    // Initialize Custom Form
    initializeCustomForm();

    // Initialize Icons safely (moved from DOMContentLoaded)
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Attach initialization to DOMContentLoaded event
document.addEventListener('DOMContentLoaded', initializeSiteLogic);