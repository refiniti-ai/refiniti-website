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
        quote: `"I'm spending thousands on ads but getting unqualified leads that go nowhere."`,
        result: "High CPA, low-quality leads, wasted budget.",
        refinitiQuote: `"AI audits audience data to target intent-based users, filtering out low-quality clicks."`,
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
        quote: `"Traffic comes to the site, looks around for 10 seconds, and bounces without engaging."`,
        result: "80% Bounce Rate, zero engagement.",
        refinitiQuote: `"Landing pages dynamically adapt headlines and creative based on the user's ad source."`,
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
        quote: `"They add to cart or book a call, but then ghost us. Manual follow-up is too slow."`,
        result: "Lead goes cold, revenue lost.",
        refinitiQuote: `"Instant AI-triggered SMS & Email sequences nurture leads the second they show interest."`,
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

/**
 * Dispatches a global event to signal that the booking modal should be opened.
 * Components can listen for this event to trigger their internal modal logic.
 */
window.openBookingModal = function() {
    const event = new CustomEvent('open-booking-modal', {
        bubbles: true,
        composed: true
    });
    document.dispatchEvent(event);
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
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                        .replace(/#cta/g, '<a href="#" onclick="openBookingModal(); return false;" class="text-[#00CFFF] underline hover:text-white font-bold">Schedule Audit</a>')
                        .replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g, '<a href="mailto:$1" class="text-[#00CFFF] underline hover:text-white">$1</a>');
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
    if (!chatContainer) return;
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
                 <div class="shrink-0 mt-1"><i data-lucide="alert-triangle" class="w-5 h-5 text-[#00CFFF]"></i></div>
                 <div>
                     <h4 class="font-bold text-white text-sm">${point.title}</h4>
                     <p class="text-gray-400 text-xs leading-relaxed">${point.desc}</p>
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
        document.getElementById('audit-points').innerHTML = `<p class="text-red-400">${fallbackMessage.replace(/#cta/g, '<a href="#" onclick="openBookingModal(); return false;" class="text-[#00CFFF] underline">Book Audit</a>')}</p>`;
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

    const greetings = ['hello', 'hi', 'hey', 'yo', 'sup', 'greetings'];
    if (greetings.includes(userText.toLowerCase().replace(/[.,!]/g, ''))) {
        await appendMessage('refiniti', "Hello! I'm RefinitiAI, your dedicated marketing expert. I can help you diagnose funnel leaks, optimize ad spend, and scale your business. What's your primary challenge right now?", true);
        return;
    }

    // 3. Show Loading State
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = `chat-bubble chat-right mb-3 text-xs text-gray-400 animate-pulse`;
    loadingDiv.textContent = "RefinitiAI analyzing...";
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // This is the full prompt including persona and instructions, sent to the secure function.
    // The secure function will then wrap this in the Gemini API's 'contents' and 'parts' structure.
    const fullPromptForSecureFunction = `You are RefinitiAI, an elite AI-powered growth system specializing in marketing funnel optimization, conversion rate improvement, and predictable business scaling. Your core process diagnoses, automates, and scales revenue with mathematical precision. Analyze the user's problem: "${userText}". If the question is about marketing or business growth, provide strategic advice aligned with RefinitiAI's capabilities. If the question is off-topic, gently redirect them to marketing inquiries. Try not to fallback as much as possible. If the question is sarcastic or funny, reply with a witty response.

STRICT RESPONSE FORMAT (Do not deviate):
**Next Step:** Book your audit here: #cta or email marketing@refiniti.ai.

CRITICAL INSTRUCTION: You MUST provide valuable strategic advice corresponding to the user's input, always framing solutions through the lens of RefinitiAI's expertise. Answer should not be more than 70 words`;


    try {
        // Call the SECURE CLOUD FUNCTION (Backend Proxy)
        const response = await fetchWithRetry(
            SECURE_FUNCTION_URL, 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // IMPORTANT: Send the full prompt string under a 'prompt' key.
                // The secure function will use this 'prompt' to construct the Gemini API request.
                body: JSON.stringify({ prompt: fullPromptForSecureFunction }) 
            }
        );

        const data = await response.json();
        
        // The secure function should return the Gemini response directly under 'gemini_response'
        const aiText = data.gemini_response || data.result || data.text || ''; 
        
        if (!aiText) {
             throw new Error("No valid AI response received from secure function.");
        }

        document.getElementById(loadingId).remove();
        await appendMessage('refiniti', aiText, true);

    } catch (error) {
        console.error("Gemini Error:", error);
        const loadingEl = document.getElementById(loadingId);
        if(loadingEl) loadingEl.remove();
        
        // Fallback Logic: Simulate a smart diagnosis if API fails (e.g. secure function issue)
        let fallbackDiagnosis = "Our AI system is currently experiencing a cosmic ray interference. We're working to re-align its marketing insights.";
        let fallbackFix = "In the meantime, consider optimizing your landing page load times – a universal truth in any universe.";
        
        const lowerText = userText.toLowerCase();
        
        if (lowerText.includes('lead') || lowerText.includes('traffic') || lowerText.includes('ad') || lowerText.includes('cpa') || lowerText.includes('cost')) {
            fallbackDiagnosis = "It seems your acquisition channels might be casting too wide a net, attracting cosmic dust instead of qualified stars, inflating your Customer Acquisition Cost.";
            fallbackFix = "RefinitiAI would deploy precision targeting to filter out the noise and focus on high-potential leads, ensuring every penny of your ad spend lands on target.";
        } else if (lowerText.includes('conversion') || lowerText.includes('sale') || lowerText.includes('buy') || lowerText.includes('rate')) {
            fallbackDiagnosis = "Your sales funnel appears to have a black hole, where potential customers vanish just before converting. This suggests friction in the final stages of their journey.";
            fallbackFix = "Our system would identify these 'event horizons' and implement automated, personalized nurture sequences to guide visitors smoothly to conversion, recovering lost revenue.";
        } else if (lowerText.includes('churn') || lowerText.includes('retention') || lowerText.includes('ltv') || lowerText.includes('customer')) {
            fallbackDiagnosis = "Your post-purchase experience seems to be suffering from a gravitational anomaly, causing customers to drift away. This reduces their lifetime value and impedes sustainable growth.";
            fallbackFix = "RefinitiAI would establish automated lifecycle engagement loops, transforming one-time buyers into loyal, recurring revenue sources, and building a stronger customer galaxy.";
        } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
            fallbackDiagnosis = "Greetings, human! While I ponder the mysteries of your request, let me remind you that RefinitiAI is always ready to tackle your most challenging marketing puzzles.";
            fallbackFix = "Don't be shy; tell me about your business goals or a marketing hurdle you're facing. I promise not to reply in binary unless specifically asked.";
        }
        else if (lowerText.includes('joke') || lowerText.includes('funny')) {
            fallbackDiagnosis = "Why did the marketing AI break up with the SEO algorithm? Because it felt like they had too many 'unnatural links'!";
            fallbackFix = "On a more serious note, if you're looking for real solutions, RefinitiAI can help you find genuinely natural and effective ways to link with your audience.";
        }
         else if (lowerText.includes('how are you') || lowerText.includes('whats up')) {
            fallbackDiagnosis = "As an AI, I don't have feelings, but my algorithms are optimally processing data, which is basically my version of a great day! Thanks for asking.";
            fallbackFix = "Now, let's talk about something truly exciting: how we can optimize your marketing funnel for unparalleled performance!";
        }
        else {
            fallbackDiagnosis = "That's an interesting query, but my circuits are primarily tuned for hyper-growth marketing and RefinitiAI's strategic solutions.";
            fallbackFix = "If you have a marketing challenge, a leaky funnel, or a desire for predictable revenue, I'm all ears!";
        }


        const fallbackMessage = `**Diagnosis:** ${fallbackDiagnosis} **Refiniti Fix:** ${fallbackFix} **Next Step:** Book your audit here: #cta or email marketing@refiniti.ai.`;

        await appendMessage('refiniti', fallbackMessage, true);
    }
}

// --- 4. Initialization Logic (Runs when the script is loaded) ---
function initializeSiteLogic() {
    chatContainer = document.getElementById('chat-container'); 
    
    // Logic that relies on the DOM being ready
    const monthEl = document.getElementById('current-month');
    if(monthEl) {
        const d = new Date(); 
        monthEl.textContent = monthNames[d.getMonth()];
    }

    // Revenue Counter Animation Logic
    const funnelSection = document.getElementById('funnel');
    if(funnelSection) {
        const observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                animateCounter();
                observer.unobserve(funnelSection); // Stop observing once it has animated
            }
        }, { threshold: 0.5 }); // Trigger when 50% of the element is visible
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
        runSimulationChat(); 
    }
    
    // *** FIX FOR BODY CTAS ***
    // Find all elements with the old onclick attribute and attach the proper event listener
    const bodyCtas = document.querySelectorAll('[onclick*="openBookingModal"]');
    bodyCtas.forEach(cta => {
        // Prevent the original inline onclick from firing
        cta.setAttribute('onclick', 'event.preventDefault()'); 
        cta.addEventListener('click', (event) => {
            event.preventDefault(); // Extra precaution
            window.openBookingModal(); // Fire the new event-dispatching function
        });
    });

    // Initialize Icons safely
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Attach initialization to DOMContentLoaded event
document.addEventListener('DOMContentLoaded', initializeSiteLogic);
