// Initialize EmailJS with your Public Key
(function() {
    // emailjs.init removido
})();

// Global variables for floating elements control
let activeFloatingElement = null; // 'chatbot', 'gif' or 'contact'
let inactivityTimeout = null;
let gifWindowTimeout = null;

// ========== IMPROVED VISIT COUNTER ========== //
const visitCounter = {
  config: {
    repo: 'ramiju81/womo_visit',
    issueNumber: 2,
    minTimeBetweenVisits: 10000
  },
  lastVisitTime: 0,

  shouldRegisterVisit() {
    const now = Date.now();
    if (now - this.lastVisitTime < this.config.minTimeBetweenVisits) {
      console.log('Recent visit detected, not registering');
      return false;
    }
    this.lastVisitTime = now;
    return true;
  },

  async registerVisitSafe() {
    if (!this.shouldRegisterVisit()) return;
    
    try {
      const visitData = {
        date: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer || 'direct',
        device: this.getDeviceType()
      };

      await this.addVisitComment(visitData);
      console.log('Visit registered successfully');
    } catch (error) {
      console.error('Error registering visit:', error);
    }
  },

  async registerVisitDev() {
    if (!this.shouldRegisterVisit()) return;
    
    try {
      if (!this.config.token) {
        const response = await fetch('womo-config.json');
        if (!response.ok) throw new Error('Configuration file not found');
        const config = await response.json();
        this.config.token = config.github.token;
      }

      const visitData = {
        date: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent.slice(0, 120)
      };

      await this.addVisitComment(visitData);
      console.log('Visit registered successfully');
    } catch (error) {
      console.error('Error registering visit:', error.message);
    }
  },

  async addVisitComment(visitData) {
    const response = await fetch(
      `https://api.github.com/repos/${this.config.repo}/issues/${this.config.issueNumber}/comments`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: `📍 New visit:\n` +
                `- Date: ${new Date().toLocaleString()}\n` +
                `- From: ${visitData.device || visitData.userAgent?.slice(0, 50) || 'Unknown device'}\n` +
                `- URL: ${visitData.url}\n` +
                `- Referrer: ${visitData.referrer}`
        })
      }
    );

    if (!response.ok) throw new Error('GitHub API error');
  },

  getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "mobile";
    }
    return "desktop";
  }
};

// Call the appropriate function based on environment
setTimeout(() => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    visitCounter.registerVisitDev();
  } else {
    visitCounter.registerVisitSafe();
  }
}, 2000);

// Variables for automatic carousel
let currentSlide = 0;
let slideInterval;
const slideTimes = [2000, 9000, 6000];
let hasCompletedCycle = false;
let autoCloseTimeout;

function goToNextSlide() {
    if (hasCompletedCycle) return;
    
    document.getElementById('modal-carousel').style.transition = 'transform 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    
    currentSlide = (currentSlide + 1) % 3;
    document.getElementById('modal-carousel').style.transform = `translateX(-${currentSlide * 33.333}%)`;
    
    updateSlideDots();
    
    if (currentSlide === 2) {
        hasCompletedCycle = true;
        setTimeout(() => {
            resetSlides();
        }, slideTimes[2]);
        return;
    }
    
    slideInterval = setTimeout(goToNextSlide, slideTimes[currentSlide]);
}

function resetSlides() {
    document.getElementById('modal-carousel').style.transition = 'none';
    currentSlide = 0;
    document.getElementById('modal-carousel').style.transform = 'translateX(0)';
    stopAutoSlide();
    updateSlideDots();
    setTimeout(() => {
        document.getElementById('play-button').style.display = 'flex';
    }, 100);
}

function updateSlideDots() {
    const dots = document.querySelectorAll('.modal-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function startAutoSlide() {
    hasCompletedCycle = false;
    stopAutoSlide();
    document.getElementById('play-button').style.display = 'none';
    
    if (currentSlide === 2) {
        currentSlide = 0;
        document.getElementById('modal-carousel').style.transition = 'none';
        document.getElementById('modal-carousel').style.transform = 'translateX(0)';
        setTimeout(() => {
            document.getElementById('modal-carousel').style.transition = 'transform 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
            slideInterval = setTimeout(goToNextSlide, slideTimes[0]);
        }, 50);
    } else {
        slideInterval = setTimeout(goToNextSlide, slideTimes[currentSlide]);
    }
    
    updateSlideDots();
    clearTimeout(autoCloseTimeout);
    autoCloseTimeout = setTimeout(closeModal, 300000);
}

function stopAutoSlide() {
    clearTimeout(slideInterval);
    slideInterval = null;
}

// ========== COMPLETE MODAL CODE ========== //
const modal = document.getElementById('explanation-modal');
const closeButton = document.getElementById('modal-close');
const discoverBtn = document.getElementById('discover-btn');
const transformBtn = document.getElementById('transform-btn');
const playButton = document.getElementById('play-button');

playButton.addEventListener('click', startAutoSlide);

function openModal() {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    currentSlide = 0;
    document.getElementById('modal-carousel').style.transition = 'none';
    document.getElementById('modal-carousel').style.transform = 'translateX(0)';
    document.getElementById('play-button').style.display = 'flex';
    stopAutoSlide();
    
    setTimeout(() => {
        document.getElementById('modal-carousel').style.transition = 'transform 0.8s ease-in-out';
    }, 50);
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    stopAutoSlide();
}

modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
});

closeButton.addEventListener('click', closeModal);
discoverBtn.addEventListener('click', openModal);

transformBtn.addEventListener('click', function() {
    closeModal();
    openContactPopup();
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    const menuLinks = document.querySelectorAll('.top-menu-link');
    menuLinks.forEach(link => link.classList.remove('active'));
    menuLinks[0].classList.add('active');
}

// Side contact popup control
function openContactPopup(prefilledMessage = '') {
    // 1. Close chatbot if open
    closeChatbot();
    
    // 2. Immediately hide chatbot icon
    const chatbotIcon = document.querySelector('.chatbot-icon');
    if (chatbotIcon) {
        chatbotIcon.style.opacity = '0';
        chatbotIcon.style.pointerEvents = 'none';
        setTimeout(() => {
            chatbotIcon.style.display = 'none';
        }, 300);
    }
    
    // 3. Show contact popup
    const contactPopup = document.getElementById('contact-popup');
    if (contactPopup) {
        contactPopup.classList.add('active');
    }
    
    // 4. Update state
    document.body.style.overflow = 'hidden';
    activeFloatingElement = 'contact';
    
    // 5. Ensure WhatsApp button is clickable and visible
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.style.width = '50px';
        whatsappBtn.style.height = '50px';
        whatsappBtn.style.padding = '0';
        whatsappBtn.style.display = 'flex';
        whatsappBtn.style.alignItems = 'center';
        whatsappBtn.style.justifyContent = 'center';
        whatsappBtn.style.pointerEvents = 'auto';
        whatsappBtn.style.zIndex = '1';
    }

    // 6. NEW CODE - Add prefilled message if provided
    if (prefilledMessage) {
        const messageField = document.getElementById('contact-message');
        const currentValue = messageField.value.trim();
        
        if (!currentValue.includes(prefilledMessage)) {
            messageField.value = prefilledMessage + (currentValue ? '\n\n' + currentValue : '');
        }
        
        setTimeout(() => {
            messageField.focus();
        }, 500);
    }
}

function closeContactPopup() {
    const contactPopup = document.getElementById('contact-popup');
    if (contactPopup) {
        contactPopup.classList.remove('active');
    }
    
    document.body.style.overflow = 'auto';
    activeFloatingElement = null;
    
    // Show chatbot icon only if no other active elements
    if (!isPopupActive && !isGifWindowOpen) {
        const chatbotIcon = document.querySelector('.chatbot-icon');
        if (chatbotIcon) {
            chatbotIcon.style.display = 'flex';
            setTimeout(() => {
                chatbotIcon.style.opacity = '1';
                chatbotIcon.style.pointerEvents = 'auto';
            }, 50);
        }
    }
    
    resetInactivityTimer();
}

function validateFields() {
    let isValid = true;
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-celular').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    document.querySelectorAll('input, textarea').forEach(el => {
        el.style.borderColor = '#e2e8f0';
    });

    if (name.length < 3) {
        document.getElementById('contact-name').style.borderColor = '#EF4444';
        isValid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('contact-email').style.borderColor = '#EF4444';
        isValid = false;
    }

    if (!/^\d{10}$/.test(phone)) {
        document.getElementById('contact-celular').style.borderColor = '#EF4444';
        isValid = false;
    }

    if (message.length < 10) {
        document.getElementById('contact-message').style.borderColor = '#EF4444';
        isValid = false;
    }

    return isValid;
}

async function sendContactRequest() {
    if (!validateFields()) {
        showNotification('Please fill all fields correctly', 'error');
        return;
    }

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-celular').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    const plainText = createPlainText(name, email, phone, message);
    const jsonData = createJSONData(name, email, phone, message);

    try {
        await sendWithEmailJS(name, email, phone, plainText, jsonData);
        showNotification('Message sent successfully!', 'success');
    } catch (error) {
        console.error('Error with EmailJS:', error);
        showNotification('Using alternative method...', 'warning');
        
        try {
            await sendWithFormSubmit(name, email, phone, message, jsonData);
            showNotification('Message sent via alternative method!', 'success');
        } catch (backupError) {
            console.error('Error with alternative method:', backupError);
            showNotification('Error: Please contact us via WhatsApp', 'error');
            return;
        }
    }

    clearForm();
    closeContactPopup();
}

function createPlainText(name, email, phone, message) {
    return `
== NEW WOMO STUDIO CONTACT ==
Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}
Date: ${new Date().toLocaleString()}
==============================================
`;
}

function createJSONData(name, email, phone, message) {
    return {
        date: new Date().toISOString(),
        contact: {
            name: name,
            email: email,
            phone: phone
        },
        message: message,
        metadata: {
            page: window.location.href,
            userAgent: navigator.userAgent
        }
    };
}

async function sendWithEmailJS(name, email, phone, plainText, jsonData) {
    return n8nIntegration.sendLead(formData).catch(console.error);
}

async function sendWithFormSubmit(name, email, phone, message, metadata) {
    const formData = new FormData();
    formData.append('nombre', name);
    formData.append('email', email);
    formData.append('telefono', phone);
    formData.append('mensaje', message);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await fetch('https://formsubmit.co/ajax/womostd@gmail.com', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Error in FormSubmit');
    }
}

function clearForm() {
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-celular').value = '';
    document.getElementById('contact-message').value = '';
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

document.getElementById('contact-celular').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 10);
});

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        particle.style.left = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 10 + 10;
        particle.style.animationDuration = `${duration}s`;
        
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// ========== INTERACTIVE CHATBOT AND GIF ========== //
const chatbotConfig = {
    greetings: [
        "Hello! I'm WoMi, your strategic automation consultant. 😊 How can I help you today with process optimization?",
        "Hi, I'm WoMi from WoMo Solutionˢ. Specialists in transforming operational challenges into measurable efficiency. What process is currently taking most of your time?",
        "Hello! 👋 WoMo Solutionˢ here. We automate processes with tangible results. Which area of your operation needs more efficiency?"
    ],
    responses: {
        "hello": {
            messages: [
                "Hello! 👋 I'm WoMi, your automation expert from WoMo Solutionˢ.",
                "We work with businesses like yours to:",
                "• Recover valuable work hours",
                "• Minimize operational errors",
                "• Optimize resource usage",
                "",
                "What type of processes are causing you inefficiencies?"
            ],
            quickReplies: ["service", "time", "Contact", "Talk to consultant"]
        },
        "service": {
            messages: [
                "🚀 Our professional approach:",
                "",
                "1. <strong>Process Analysis</strong>: Detailed evaluation of your operations (paid service)",
                "",
                "2. <strong>Solution Proposal</strong>: Customized plan with clear KPIs",
                "",
                "3. <strong>Guaranteed Implementation</strong>: Deployment with full support",
                "",
                "4. <strong>Results Measurement</strong>: Periodic improvement reports",
                "",
                "Would you like to see a real implementation example?"
            ],
            quickReplies: ["See success case", "Initial costs", "Estimated times", "Contact team"]
        },
        "time": {
            messages: [
                "⏱️ Our typical implementations impact:",
                "",
                "• Significant reduction in execution times",
                "• Elimination of redundant manual steps",
                "• End-to-end optimized workflows",
                "",
                "Real example: A client in your sector reduced document processing time from 3 days to a few hours.",
                "",
                "Would you like to analyze how we'd apply this to your operations?"
            ],
            quickReplies: ["Analyze my case", "See demo", "Ask expert", "Request proposal"]
        },
        "contact": {
            messages: [
                "📅 Schedule a strategy session with our team:",
                "",
                "Availability for initial meetings:",
                "• Monday to Friday: 9am - 6pm",
                "• Requires prior information",
                "",
                "We'll show you exactly how we can optimize your operations"
            ],
            actions: [{
                type: "button",
                text: "📝 Schedule Initial Session",
                action: "showExpertCalendar()"
            }]
        },
        "price": {
            messages: [
                "💰 Results-based investment model:",
                "",
                "Our WoMo Solutions are structured in phases:",
                "",
                "1. <strong>Initial Evaluation</strong>: $X (applicable to implementation)",
                "2. <strong>Solution Development</strong>: From $Y (depending on complexity)",
                "3. <strong>Maintenance</strong>: Optional with monthly reporting",
                "",
                "92% of our clients recover their investment in the first 3 months.",
                "",
                "Would you like us to send you specific examples from your industry?"
            ],
            quickReplies: ["See similar cases", "Detailed process", "Executive WhatsApp", "Technical documentation"]
        },
        "thanks": {
            messages: [
                "Thank you for considering a professional solution. 🚀",
                "When you're ready to transform your operations with clear metrics, we'll be here."
            ],
            quickReplies: ["Additional material", "Consulting team", "LinkedIn"]
        },
        "goodbye": {
            messages: [
                "It was a pleasure to assist you! ⚡",
                "Remember: Strategic automation can be your competitive advantage.",
                "Success in your operations!"
            ],
            quickReplies: []
        },
        "default": {
            messages: [
                "I understand your query. Let me better contextualize:",
                "",
                "At WoMo Solutionˢ we don't offer generic solutions.",
                "To give you a precise answer, I'd need to know more about:",
                "• Your current operational volumes",
                "• Identified bottlenecks",
                "• Your strategic goals",
                "",
                "Would you like to schedule an initial session with our team?"
            ],
            quickReplies: ["Schedule session", "Send information", "Specific question", "Relevant cases"]
        }
    },
    leadForms: {
        "consulting": {
            title: "Initial Strategy Session",
            description: "Complete this information so our team can properly prepare for your case",
            fields: [
                { 
                    name: "name", 
                    placeholder: "Full name", 
                    type: "text", 
                    required: true,
                    validation: "You must enter your full name"
                },
                { 
                    name: "company", 
                    placeholder: "Company name", 
                    type: "text", 
                    required: true 
                },
                { 
                    name: "email", 
                    placeholder: "Corporate email", 
                    type: "email", 
                    required: true,
                    validation: "Please enter a valid email"
                },
                { 
                    name: "phone", 
                    placeholder: "WhatsApp for contact", 
                    type: "tel", 
                    required: true 
                },
                { 
                    name: "process", 
                    placeholder: "Describe your main operational challenge", 
                    type: "textarea", 
                    required: false,
                    helperText: "Example: Manual invoice management, slow approvals, etc."
                },
                { 
                    name: "employees", 
                    placeholder: "Approximate number of employees", 
                    type: "select",
                    options: ["1-10", "11-50", "51-200", "200+"],
                    required: true
                }
            ],
            submitText: "Request Strategy Session",
            successMessage: "✅ Perfect! We've received your information. A senior consultant will contact you within the next 24 hours to coordinate the strategy session. Would you like to receive our success cases dossier in your industry in the meantime?",
            successActions: [
                {
                    text: "Receive Dossier",
                    action: "sendDossier()"
                },
                {
                    text: "Watch Explanatory Video",
                    action: "showVideo('intro')"
                }
            ]
        }
    },
    farewells: [
        "Thank you for your interest in professional solutions. We're here when you decide to optimize your operations.",
        "It was a pleasure talking. Remember that operational efficiency is the foundation of sustainable growth.",
        "See you soon! When you need to transform challenges into results, you'll find us here."
    ],
    fallbackStrategy: {
        unknownQuery: [
            "Interesting question. To give you a precise answer, I'd need to better understand your operational context.",
            "Would you like us to connect this query with one of our specialists?"
        ],
        technicalQuestion: [
            "This is a specific technical query. Let me refer you to our engineering team.",
            "An expert will contact you with the detailed information you need."
        ],
        pricingQuery: [
            "I understand you need financial clarity. To give exact numbers, we first need to evaluate:",
            "1. The complexity of your current processes",
            "2. Operational volume",
            "3. Expected results",
            "Would you like to schedule a brief session to analyze this?"
        ]
    }
};

// Chatbot variables
let isTyping = false;
let currentLeadForm = null;

// Main chatbot functions
function toggleChatbot() {
    const chatbotWindow = document.getElementById('chatbot-window');
    
    if (chatbotWindow.classList.contains('active')) {
        closeChatbot();
    } else {
        openChatbot();
    }
}

function openChatbot() {
    // Close other floating elements
    hideInactivityPopup();
    closeContactPopup();
    
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotIcon = document.querySelector('.chatbot-icon');
    
    chatbotWindow.classList.add('active');
    chatbotIcon.style.display = 'none';
    activeFloatingElement = 'chatbot';
    
    if (document.getElementById('chatbot-messages').children.length === 0) {
        showInitialGreeting();
    }
    
    resetInactivityTimer();
}

function closeChatbot() {
    const chatbotWindow = document.getElementById('chatbot-window');
    if (chatbotWindow) {
        chatbotWindow.classList.remove('active');
    }
    activeFloatingElement = null;
    updateChatbotIconVisibility();
    resetInactivityTimer();
}

function showInitialGreeting() {
    showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        const randomGreeting = chatbotConfig.greetings[Math.floor(Math.random() * chatbotConfig.greetings.length)];
        addBotMessage(randomGreeting);
        showQuickReplies(chatbotConfig.responses["hello"].quickReplies);
    }, 1500);
}

function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.innerHTML += `
        <div class="message user-message">${text}</div>
    `;
    scrollToBottom();
    
    setTimeout(() => {
        processUserInput(text);
    }, 500);
}

function addBotMessage(text) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    
    paragraphs.forEach(paragraph => {
        if (paragraph.trim() !== '') {
            messagesContainer.innerHTML += `
                <div class="message bot-message">${paragraph}</div>
            `;
        }
    });
    
    scrollToBottom();
}

function showTypingIndicator() {
    if (isTyping) return;
    
    isTyping = true;
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.innerHTML += `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    scrollToBottom();
}

function removeTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function showQuickReplies(options) {
    const quickOptionsContainer = document.getElementById('quick-options');
    quickOptionsContainer.innerHTML = options.map(option => `
        <div class="quick-option" onclick="handleQuickReply('${option}')">${option}</div>
    `).join('');
}

function handleQuickReply(option) {
    addUserMessage(option);
}

function processUserInput(input) {
    showTypingIndicator();
    document.getElementById('quick-options').innerHTML = '';
    
    setTimeout(() => {
        removeTypingIndicator();
        
        const lowerInput = input.toLowerCase();
        let responseFound = false;
        
        // Check keywords
        if (lowerInput.includes('thanks') || lowerInput.includes('thank')) {
            const randomResponse = chatbotConfig.responses["thanks"].messages;
            randomResponse.forEach(msg => addBotMessage(msg));
            showQuickReplies(chatbotConfig.responses["thanks"].quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('goodbye') || lowerInput.includes('see you') || lowerInput.includes('bye')) {
            const randomFarewell = chatbotConfig.farewells[Math.floor(Math.random() * chatbotConfig.farewells.length)];
            addBotMessage(randomFarewell);
            responseFound = true;
        }
        else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
            const response = chatbotConfig.responses["hello"];
            response.messages.forEach(msg => addBotMessage(msg));
            showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('service') || lowerInput.includes('what do you do') || lowerInput.includes('what you offer')) {
            const response = chatbotConfig.responses["service"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.quickReplies) showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('time') || lowerInput.includes('fast') || lowerInput.includes('slow')) {
            const response = chatbotConfig.responses["time"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.quickReplies) showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('contact') || lowerInput.includes('talk') || lowerInput.includes('call')) {
            const response = chatbotConfig.responses["contact"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.actions) {
                response.actions.forEach(action => {
                    if (action.type === "button") {
                        setTimeout(() => {
                            eval(action.action);
                        }, 500);
                    }
                });
            }
            responseFound = true;
        }
        else if (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('how much')) {
            const response = chatbotConfig.responses["price"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.quickReplies) showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        
        // Default response if no match found
        if (!responseFound) {
            chatbotConfig.responses.default.messages.forEach(msg => addBotMessage(msg));
            if (chatbotConfig.responses.default.quickReplies) {
                showQuickReplies(chatbotConfig.responses.default.quickReplies);
            }
        }
    }, 1000 + Math.random() * 1000);
}

function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        input.value = '';
    }
    
    input.focus();
}

function showLeadForm(formType) {
    const formConfig = chatbotConfig.leadForms[formType];
    if (!formConfig) return;
    
    currentLeadForm = formType;
    
    const messagesContainer = document.getElementById('chatbot-messages');
    let formHTML = `
        <div class="lead-form" id="lead-form">
            <h4>${formConfig.title}</h4>
    `;
    
    formConfig.fields.forEach(field => {
        if (field.type === 'textarea') {
            formHTML += `
                <textarea name="${field.name}" placeholder="${field.placeholder}" 
                    ${field.required ? 'required' : ''}></textarea>
            `;
        } else {
            formHTML += `
                <input type="${field.type}" name="${field.name}" placeholder="${field.placeholder}" 
                    ${field.required ? 'required' : ''}>
            `;
        }
    });
    
    formHTML += `
            <button onclick="submitLeadForm('${formType}')">${formConfig.submitText}</button>
        </div>
    `;
    
    messagesContainer.innerHTML += formHTML;
    scrollToBottom();
}

function submitLeadForm(formType) {
    const form = document.getElementById('lead-form');
    const formData = {};
    let isValid = true;
    
    chatbotConfig.leadForms[formType].fields.forEach(field => {
        if (field.required) {
            const input = form.querySelector(`[name="${field.name}"]`);
            if (!input.value.trim()) {
                input.style.borderColor = '#EF4444';
                isValid = false;
            } else {
                input.style.borderColor = '#e2e8f0';
                formData[field.name] = input.value.trim();
            }
        }
    });
    
    if (!isValid) {
        addBotMessage("Please complete all required fields.");
        return;
    }
    
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        form.remove();
        
        addBotMessage(chatbotConfig.leadForms[formType].successMessage);
        
        if (formType === 'consulting') {
            showQuickReplies(["See similar case", "How to prepare", "Thanks"]);
        }
        
        sendLeadDataToBackend(formData, formType);
    }, 2000);
}

function sendLeadDataToBackend(data, formType) {
    const plainText = `
== NEW CHATBOT LEAD ==
Type: ${formType}
Name: ${data.name || 'Not provided'}
Email: ${data.email || 'Not provided'}
Phone: ${data.phone || 'Not provided'}
Message: ${data.need || 'Chatbot inquiry'}
Date: ${new Date().toLocaleString()}
==============================================
`;

    const jsonData = {
        date: new Date().toISOString(),
        source: "chatbot",
        form_type: formType,
        contact: {
            name: data.name || null,
            email: data.email || null,
            phone: data.phone || null
        },
        message: data.need || 'Chatbot inquiry',
        metadata: {
            page: window.location.href,
            userAgent: navigator.userAgent,
            interactions: document.getElementById('chatbot-messages').children.length
        }
    };

    n8nIntegration.sendLead(formData).catch(console.error);
    })
    .catch(error => {
        console.error('Error sending:', error);
        sendWithFormSubmit(data, formType);
    });
}

function sendWithFormSubmit(data, formType) {
    const jsonData = {
        date: new Date().toISOString(),
        source: "chatbot",
        form_type: formType,
        contact: {
            name: data.name || null,
            email: data.email || null,
            phone: data.phone || null
        },
        message: data.need || 'Chatbot inquiry',
        metadata: {
            page: window.location.href,
            userAgent: navigator.userAgent
        }
    };

    const formData = new FormData();
    formData.append('name', data.name || '');
    formData.append('email', data.email || '');
    formData.append('phone', data.phone || '');
    formData.append('message', data.need || 'Chatbot inquiry');
    formData.append('metadata', JSON.stringify(jsonData));
    formData.append('_subject', `[Chatbot] ${formType} - ${data.name || 'Anonymous'}`);
    
    fetch('https://formsubmit.co/ajax/womostd@gmail.com', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => console.log('FormSubmit success:', data))
    .catch(error => console.error('FormSubmit error:', error));
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Floating assistant WoMi configuration
const inactivityConfig = {
    timeout: 15000, // 15 seconds to show popup
    messages: [
        "Do you need help optimizing your processes?",
        "Hello! Ready to transform your productivity? We have the ideal solution for you.",
        "Would you like to know how to automate your operations?",
        "Transform your manual processes into automatic systems. Shall we talk?",
        "I'd love to show you how we can help!"
    ],
    displayDuration: 0, // Changed to 0 to not hide automatically
    cooldown: 60000, // 30 seconds before reappearing
    positions: ['position-bottom-right', 'position-bottom-center', 'position-bottom-left']
};

let inactivityTimer;
let isPopupActive = false;
let lastInteractionTime = Date.now();
let hideTimeout;
let currentPosition = '';
let isGifWindowOpen = false;

function getRandomMessage() {
    return inactivityConfig.messages[Math.floor(Math.random() * inactivityConfig.messages.length)];
}

function getRandomPosition() {
    currentPosition = inactivityConfig.positions[Math.floor(Math.random() * inactivityConfig.positions.length)];
    return currentPosition;
}

function showInactivityPopup() {
    // Don't show if another floating element is active
    if (activeFloatingElement || isGifWindowOpen) return;
    
    // Close chatbot if open
    closeChatbot();
    
    const popup = document.getElementById('inactivity-popup');
    const message = document.getElementById('inactivity-message');
    const gif = document.getElementById('inactivity-gif');
    const chatbotIcon = document.querySelector('.chatbot-icon');
    
    // Hide chatbot icon
    chatbotIcon.style.display = 'none';
    
    popup.className = 'inactivity-popup ' + getRandomPosition();
    message.textContent = getRandomMessage();
    
    popup.style.display = 'flex';
    setTimeout(() => {
        popup.style.opacity = '1';
        setTimeout(() => {
            message.classList.add('active');
        }, 300);
    }, 50);
    
    gif.onclick = function(e) {
        e.stopPropagation();
        openGifWindow();
    };
    
    // Removed timeout for automatic hiding
    isPopupActive = true;
    activeFloatingElement = 'gif';
    document.addEventListener('click', closePopupOnOutsideClick, true);
}
    
function closePopupOnOutsideClick(e) {
    const popup = document.getElementById('inactivity-popup');
    const gifWindow = document.getElementById('gif-window');
    
    // Check if clicked outside popup or GIF
    if ((!popup.contains(e.target) && !isGifWindowOpen) || 
        (isGifWindowOpen && !gifWindow.contains(e.target))) {
        hideInactivityPopup();
    }
}

function openGifWindow() {
    if (isGifWindowOpen) return;
    
    const initialMessage = document.getElementById('inactivity-message');
    if (initialMessage) {
        initialMessage.classList.remove('active');
    }
    
    const popup = document.getElementById('inactivity-popup');
    const gifWindow = document.getElementById('gif-window');
    const gifWindowContent = document.getElementById('gif-window-content');
    
    // More concrete and actionable options
    gifWindowContent.innerHTML = `
        <div class="gif-window-header">
            <h3>What problem do you need to solve?</h3>
            <button class="close-gif-window" onclick="closeGifWindow()">×</button>
        </div>
        <div class="gif-window-body">
            <div class="gif-window-grid">
                <!-- ProTrack -->
                <button class="gif-option-btn" onclick="handleGifOption('Manual process coordination')">
                    <strong>⚙️ Disorganized processes</strong><br>
                    <small>Modular management system</small>
                </button>

                <!-- Unistock -->
                <button class="gif-option-btn" onclick="handleGifOption('Inaccurate inventory control')">
                    <strong>📦 Unreliable stock</strong><br>
                    <small>Automatic inventory alerts</small>
                </button>

                <!-- PortiFy -->
                <button class="gif-option-btn" onclick="handleGifOption('Project/client tracking')">
                    <strong>📊 Fragmented information</strong><br>
                    <small>Visual CRM for portfolios</small>
                </button>

                <!-- PCAF -->
                <button class="gif-option-btn" onclick="handleGifOption('Client/membership management')">
                    <strong>🏋️ Manual records</strong><br>
                    <small>Integrated control system</small>
                </button>

                <!-- Messungen -->
                <button class="gif-option-btn" onclick="handleGifOption('Physical progress tracking')">
                    <strong>📏 Unsystematized measurements</strong><br>
                    <small>Digitized history</small>
                </button>

                <!-- PocketFlow -->
                <button class="gif-option-btn" onclick="handleGifOption('Finance organization')">
                    <strong>💰 Uncategorized expenses</strong><br>
                    <small>Personalized financial control</small>
                </button>
            </div>
            <button class="gif-option-btn no-thanks" onclick="handleNoThanks()">
                Not now, thanks
            </button>
        </div>
    `;
    
    document.querySelector('.close-gif-window').onclick = closeGifWindow;
    positionGifWindow(popup, gifWindow);
    
    gifWindow.style.display = 'flex';
    setTimeout(() => {
        gifWindow.style.opacity = '1';
        gifWindow.style.transform = 'translateY(0)';
    }, 50);
    
    isGifWindowOpen = true;
    document.getElementById('inactivity-gif').classList.add('talking');
    clearTimeout(hideTimeout);
}

function handleNoThanks() {
    // Hide initial message if still visible
    const initialMessage = document.getElementById('inactivity-message');
    if (initialMessage) {
        initialMessage.classList.remove('active');
    }
    
    // Close GIF window
    closeGifWindow();
    
    // Show farewell message
    showWoMoBubble("Understood! 😊 I'll be around if you need me.");
    
    // Hide everything after 3 seconds
    hideTimeout = setTimeout(() => {
        hideInactivityPopup();
    }, 3000);
}

function showWoMoBubble(message) {
    // Ensure initial message is hidden
    const initialMessage = document.getElementById('inactivity-message');
    if (initialMessage) {
        initialMessage.classList.remove('active');
    }
    
    const gif = document.getElementById('inactivity-gif');
    const gifRect = gif.getBoundingClientRect();
    
    // Create bubble
    const bubble = document.createElement('div');
    bubble.className = 'womo-bubble';
    bubble.innerHTML = `
        <div class="bubble-arrow"></div>
        <div class="bubble-content">${message}</div>
    `;
    
    // Precise positioning
    bubble.style.position = 'fixed';
    bubble.style.bottom = `${gifRect.bottom + window.scrollY}px`;
    bubble.style.left = `${gifRect.left - 200}px`;
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(10px)';
    bubble.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(bubble);
    
    // Entrance animation
    setTimeout(() => {
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';
    }, 50);
    
    // Talking animation
    gif.classList.add('womo-talking');
    
    // Disappear after 3 seconds
    setTimeout(() => {
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(10px)';
        gif.classList.remove('womo-talking');
        
        setTimeout(() => {
            document.body.removeChild(bubble);
        }, 300);
    }, 3000);
}

function closeGifWindow() {
    if (!isGifWindowOpen) return;
    
    const gifWindow = document.getElementById('gif-window');
    const gif = document.getElementById('inactivity-gif');
    
    gifWindow.style.opacity = '0';
    gifWindow.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        gifWindow.style.display = 'none';
        isGifWindowOpen = false;
        gif.classList.remove('talking');
        
        hideTimeout = setTimeout(() => {
            hideInactivityPopup();
        }, 1000);
    }, 300);
}

function handleGifOption(option) {
    closeGifWindow();
    openChatbot();
    
    // Initial response based on selected option
    let botResponse = "";
    switch(option) {
        case 'Manual process coordination':
            botResponse = "I understand you want to optimize manual processes. Could you tell me what type of tasks they are? For example:\n1. Order processing\n2. Invoicing\n3. Monthly reports\n4. Other (specify)";
            break;
        case 'Inaccurate inventory control':
            botResponse = "Inventory control is crucial. What specific problems do you have?\n1. Inaccurate stock\n2. Unidentified losses\n3. Unnecessary purchases\n4. Other (describe)";
            break;
        case 'Project/client tracking':
            botResponse = "Client communication is key. Which area needs improvement?\n1. Response to inquiries\n2. Sales follow-up\n3. Payment reminders\n4. Other (which)";
            break;
        default:
            botResponse = "Tell me more about this challenge to give you a precise solution.";
    }
    
    // Show user message and bot response
    addUserMessage(option);
    setTimeout(() => {
        addBotMessage(botResponse);
    }, 800);
}

function positionGifWindow(popup, gifWindow) {
    const popupRect = popup.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // For mobile, center horizontally and position above
        gifWindow.style.left = '50%';
        gifWindow.style.right = 'auto';
        gifWindow.style.transform = 'translateX(-50%)';
        gifWindow.style.bottom = `${popupRect.height + 20}px`;
        gifWindow.style.top = 'auto';
    } else {
        // For desktop maintain original behavior
        if (currentPosition === 'position-bottom-right') {
            gifWindow.style.bottom = '20px';
            gifWindow.style.right = `${popupRect.width + 30}px`;
            gifWindow.style.left = 'auto';
            gifWindow.style.top = 'auto';
        } else if (currentPosition === 'position-bottom-left') {
            gifWindow.style.bottom = '20px';
            gifWindow.style.left = `${popupRect.width + 30}px`;
            gifWindow.style.right = 'auto';
            gifWindow.style.top = 'auto';
        }
    }
}

function hideInactivityPopup() {
    if (!isPopupActive) return;
    
    // Mark that first appearance has passed
    if (inactivityConfig.firstAppearance) {
        inactivityConfig.firstAppearance = false;
    }
    
    // Rest of the function remains the same...
    const popup = document.getElementById('inactivity-popup');
    const message = document.getElementById('inactivity-message');
    const gif = document.getElementById('inactivity-gif');
    const chatbotIcon = document.querySelector('.chatbot-icon');
    
    clearTimeout(hideTimeout);
    message.classList.remove('active');
    
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.style.display = 'none';
            isPopupActive = false;
            gif.classList.remove('idle', 'talking');
            document.removeEventListener('click', closePopupOnOutsideClick, true);
            setTimeout(resetInactivityTimer, inactivityConfig.cooldown);
            activeFloatingElement = null;
            
            if (!activeFloatingElement && !isGifWindowOpen) {
                chatbotIcon.style.display = 'flex';
            }
        }, 500);
    }, 100);
    
    if (isGifWindowOpen) {
        closeGifWindow();
    }
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    lastInteractionTime = Date.now();
    
    // Only show chatbot icon if no other floating elements active
    const chatbotIcon = document.querySelector('.chatbot-icon');
    if (!activeFloatingElement && !isPopupActive && !isGifWindowOpen) {
        chatbotIcon.style.display = 'flex';
    }
    
    inactivityTimer = setTimeout(checkInactivity, inactivityConfig.timeout);
}

function checkInactivity() {
    const currentTime = Date.now();
    const elapsed = currentTime - lastInteractionTime;
    
    if (elapsed >= inactivityConfig.timeout && !isPopupActive && !isGifWindowOpen && !activeFloatingElement) {
        showInactivityPopup();
    } else {
        resetInactivityTimer();
    }
}

function setupActivityTracking() {
    // Reset firstAppearance on page load
    inactivityConfig.firstAppearance = true;
    
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
        window.addEventListener(event, () => {
            lastInteractionTime = Date.now();
            if (!isPopupActive && !isGifWindowOpen && !activeFloatingElement) {
                resetInactivityTimer();
            }
        }, { passive: true });
    });
    
    resetInactivityTimer();
}

// Initialization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Preload GIF
    const gif = new Image();
    gif.src = 'WoMi1.webp';
    
    // Preload chatbot icon
    const chatbotIconImg = new Image();
    chatbotIconImg.src = 'WoMi.webp';
    
    // Preload WhatsApp logo
    const whatsappImg = new Image();
    whatsappImg.src = 'wp.webp';
    
    // Start activity tracking
    setupActivityTracking();
    
    // Create necessary elements if they don't exist
    if (!document.getElementById('gif-window')) {
        const gifWindow = document.createElement('div');
        gifWindow.id = 'gif-window';
        gifWindow.innerHTML = '<div id="gif-window-content"></div>';
        document.body.appendChild(gifWindow);
    }
    
    // Configure chatbot events
    const chatbotWindow = document.getElementById('chatbot-window');
    chatbotWindow.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Event to send message with Enter
    document.getElementById('chatbot-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Close chatbot when clicking contact links
    document.querySelectorAll('[onclick="openContactPopup()"]').forEach(link => {
        link.addEventListener('click', closeChatbot);
    });
    
    // Create particles for hero
    createParticles();
    
    // Ensure icon is visible on load (if no popups open)
    updateChatbotIconVisibility();
    
    // Ensure WhatsApp button is clickable
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.style.pointerEvents = 'auto';
        whatsappBtn.style.zIndex = '1';
    }
});

// Menu navigation configuration
const menu = document.querySelector('.top-menu');
const menuLinks = document.querySelectorAll('.top-menu-link');
const sections = {
    home: { 
        element: document.querySelector('.hero-impact'), 
        link: document.querySelector('.top-menu-link[onclick="scrollToTop()"]') 
    },
    services: { 
        element: document.querySelector('#services'), 
        link: document.querySelector('.top-menu-link[href="#services"]') 
    },
    benefits: { 
        element: document.querySelector('#benefits'), 
        link: document.querySelector('.top-menu-link[href="#benefits"]') 
    },
    portfolio: { 
        element: document.querySelector('#portfolio'), 
        link: document.querySelector('.top-menu-link[href="#portfolio"]') 
    },
    impact: { 
        element: document.querySelector('#antes-despues'), 
        link: document.querySelector('.top-menu-link[href="#antes-despues"]') 
    }
};

function updateMenu() {
    const scrollPos = window.scrollY + 100;
    
    menuLinks.forEach(link => link.classList.remove('active'));
    
    let activeSection = 'home';
    
    if (scrollPos > sections.services.element.offsetTop - 100) activeSection = 'services';
    if (scrollPos > sections.benefits.element.offsetTop - 100) activeSection = 'benefits';
    if (scrollPos > sections.portfolio.element.offsetTop - 100) activeSection = 'portfolio';
    if (sections.impact && scrollPos > sections.impact.element.offsetTop - 100) activeSection = 'impact';
    
    if (sections[activeSection] && sections[activeSection].link) {
        sections[activeSection].link.classList.add('active');
    }
    
    if (scrollPos > 100) {
        menu.classList.add('scrolled');
    } else {
        menu.classList.remove('scrolled');
    }
}

updateMenu();
window.addEventListener('scroll', updateMenu);
window.addEventListener('resize', updateMenu);

menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href !== 'javascript:void(0);') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Handle Escape key to close elements
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (modal.style.display === 'flex') closeModal();
        if (document.getElementById('contact-popup').classList.contains('active')) closeContactPopup();
        if (document.getElementById('process-popup-overlay').style.display === 'flex') closeProcessPopup();
        if (document.getElementById('chatbot-window').classList.contains('active')) closeChatbot();
        if (isPopupActive) hideInactivityPopup();
    }
});

document.querySelectorAll('.modal-close, .close-btn, .chatbot-close').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.classList.contains('modal-close')) closeModal();
        if (this.classList.contains('close-btn')) {
            if (document.getElementById('process-popup-overlay').style.display === 'flex') {
                closeProcessPopup();
            } else if (document.getElementById('contact-popup').classList.contains('active')) {
                closeContactPopup();
            }
        }
        if (this.classList.contains('chatbot-close')) closeChatbot();
    });
});

const processPopupData = {
    time: {
        title: "Time Transformation",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #10B981; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">We transform hours into minutes</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Satisfied clients, optimized time</p>
                
                <div style="position: relative; height: 150px; margin: 20px 0; background: repeating-linear-gradient(0deg, transparent, transparent 29px, #f0f0f0 30px, #f0f0f0 30px), 
                    repeating-linear-gradient(90deg, transparent, transparent 59px, #f0f0f0 60px, #f0f0f0 60px); 
                    background-size: 60px 30px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;">
                    <div style="display: flex; justify-content: space-around; height: 100%; align-items: flex-end; position: relative; z-index: 1;">
                        <div style="width: 40px; background: #10B981; height: 60%; border-radius: 4px 4px 0 0;"></div>
                        <div style="width: 40px; background: #10B981; height: 20%; border-radius: 4px 4px 0 0;"></div>
                        <div style="width: 40px; background: #10B981; height: 40%; border-radius: 4px 4px 0 0;"></div>
                    </div>
                </div>
                
                <ul style="list-style-type: none; padding-left: 20px;">
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #10B981; font-weight: bold;">•</span> 
                        Significant process optimization.
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #10B981; font-weight: bold;">•</span> 
                        Say goodbye to manual and repetitive tasks
                    </li>
                </ul>
            </div>
        `
    },
    workflow: {
        title: "Smart Automation",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #2563EB; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Flexible automation</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Power your internal processes</p>
                
                <div style="position: relative; height: 150px; margin: 20px 0; background: repeating-linear-gradient(0deg, transparent, transparent 29px, #f0f0f0 30px, #f0f0f0 30px), 
                    repeating-linear-gradient(90deg, transparent, transparent 59px, #f0f0f0 60px, #f0f0f0 60px); 
                    background-size: 60px 30px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;">
                    <div style="display: flex; justify-content: space-around; height: 100%; align-items: flex-end; position: relative; z-index: 1;">
                        <div style="width: 40px; background: #2563EB; height: 30%; border-radius: 4px 4px 0 0;"></div>
                        <div style="width: 40px; background: #2563EB; height: 57%; border-radius: 4px 4px 0 0;"></div>
                        <div style="width: 40px; background: #2563EB; height: 45%; border-radius: 4px 4px 0 0;"></div>
                    </div>
                </div>
                
                <ul style="list-style-type: none; padding-left: 20px;">
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #2563EB; font-weight: bold;">•</span> 
                        Independent and autonomous solution
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #2563EB; font-weight: bold;">•</span> 
                        Adapts to your specific processes
                    </li>
                </ul>
            </div>
        `
    },
    profit: {
        title: "Efficiency That Generates Value",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #7C3AED; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Smart Financial Optimization</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Transform your efficiency into results</p>
                
                <div style="position: relative; height: 150px; margin: 20px 0; background: repeating-linear-gradient(0deg, transparent, transparent 29px, #f0f0f0 30px, #f0f0f0 30px), 
                    repeating-linear-gradient(90deg, transparent, transparent 59px, #f0f0f0 60px, #f0f0f0 60px); 
                    background-size: 60px 30px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;">
                    <div style="display: flex; justify-content: space-around; height: 100%; align-items: flex-end; position: relative; z-index: 1;">
                        <div style="width: 40px; background: #7C3AED; height: 60%; border-radius: 4px 4px 0 0;"></div>
                        <div style="width: 40px; background: #7C3AED; height: 40%; border-radius: 4px 4px 0 0;"></div>
                        <div style="width: 40px; background: #7C3AED; height: 70%; border-radius: 4px 4px 0 0;"></div>
                    </div>
                </div>
                
                <ul style="list-style-type: none; padding-left: 20px;">
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #7C3AED; font-weight: bold;">•</span> 
                        Sustainable improvement in your profitability
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #7C3AED; font-weight: bold;">•</span> 
                        More efficient resource management
                    </li>
                </ul>
            </div>
        `
    },
    analytics: {
        title: "Strategic Intelligence",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #F59E0B; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Stay ahead</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Discover patterns before the competition</p>
                
                <div style="position: relative; height: 150px; margin: 20px 0; background: repeating-linear-gradient(0deg, transparent, transparent 29px, #f0f0f0 30px, #f0f0f0 30px), 
                    repeating-linear-gradient(90deg, transparent, transparent 59px, #f0f0f0 60px, #f0f0f0 60px); 
                    background-size: 60px 30px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;">
                    <div style="display: flex; justify-content: space-around; height: 100%; align-items: flex-end; position: relative; z-index: 1;">
                        <div style="width: 40px; background: #F59E0B; height: 23%; border-radius: 4px 4px 0 0;"></div>
                        <div style="width: 40px; background: #F59E0B; height: 55%; border-radius: 4px 4px 0 0;"></div>
                        <div style="width: 40px; background: #F59E0B; height: 67%; border-radius: 4px 4px 0 0;"></div>
                    </div>
                </div>
                
                <ul style="list-style-type: none; padding-left: 20px;">
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #F59E0B; font-weight: bold;">•</span> 
                        Reliable and actionable forecasts
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #F59E0B; font-weight: bold;">•</span> 
                        Early detection of key opportunities
                    </li>
                </ul>
            </div>
        `
    }
};

function openServicePopup(type) {
    document.getElementById('services-popup-content').innerHTML = processPopupData[type].content;
    document.getElementById('services-popup-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('services-popup-overlay').onclick = function(e) {
        if (e.target === this) closeServicePopup();
    };
}

function closeServicePopup() {
    document.getElementById('services-popup-overlay').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function getColorByType(type) {
    const colors = {
        'time': 'var(--verde)',
        'workflow': 'var(--azul)',
        'profit': 'var(--morado)',
        'analytics': 'var(--naranja)'
    };
    return colors[type] || 'var(--gris-oscuro)';
}

// Function to update chatbot icon visibility
function updateChatbotIconVisibility() {
    const chatbotIcon = document.querySelector('.chatbot-icon');
    if (!chatbotIcon) return;
    
    // Hide if contact popup is open or other active elements
    const contactPopupActive = document.getElementById('contact-popup').classList.contains('active');
    if (contactPopupActive || activeFloatingElement || isPopupActive || isGifWindowOpen) {
        chatbotIcon.style.display = 'none';
    } else {
        chatbotIcon.style.display = 'flex';
    }
}

// Data for the 6 projects
const projects = [
    {   "id": 1,
        "title": "ProTrack",
        "shortDesc": "Universal modular process management platform",
        "fullDesc": "The engine that turns operational chaos into high-performance automated flows. For leaders who demand excellence in every process.",
        "icon": "⚙️",
        "image": "../proyectos/imagen3.webp"
    },{ "id": 2,
        "title": "Unistock",
        "shortDesc": "Proprietary inventory management system",
        "fullDesc": "The logistics brain that anticipates shortages, optimizes purchases and turns inventory into cash flow. For businesses that don't tolerate errors.",
        "icon": "📦",
        "image": "../proyectos/imagen2.webp"
    },{ "id": 3,
        "title": "PortiFy",
        "shortDesc": "CRM specialized in technology portfolios",
        "fullDesc": "Your portfolio as a commercial weapon: turns technical projects into irresistible narratives for demanding clients.",
        "icon": "📊",
        "image": "../proyectos/imagen6.webp"
    },{ "id": 4,
        "title": "PCAF",
        "shortDesc": "Gym management system",
        "fullDesc": "The system that makes your clients feel like they're training in a luxury gym: measurable progress instantly and exclusive communication. The secret tool to retain 3 times more.",
        "icon": "🏋️",
        "image": "../proyectos/imagen1.webp"
    },{ "id": 5,
        "title": "Messungen",
        "shortDesc": "Physical progress tracking",
        "fullDesc": "System that links workouts with results: records measurements, correlates routines and demonstrates the tangible impact of your methodology. The proof that your work transforms.",
        "icon": "📏",
        "image": "../proyectos/imagen4.webp"
    },{ "id": 6,
        "title": "PocketFlow",
        "shortDesc": "Personal financial management",
        "fullDesc": "Smart personal financial control: take charge of your money with professional clarity and precision.",
        "icon": "💰",
        "image": "../proyectos/imagen5.webp"
    }
];

// Preload CRITICAL IMAGES (WebP)
function preloadImages() {
    projects.forEach(project => {
        const img = new Image();
        img.src = project.image; // Background preload
    });
}

// Render portfolio (ULTRA fast load)
function renderPortfolio() {
    const container = document.getElementById('portfolio-container');
    
    // 1. Preload images
    preloadImages();
    
    // 2. Create cards
    container.innerHTML = projects.map(project => `
        <div class="portfolio-card" data-id="${project.id}">
            <img 
                src="${project.image}" 
                alt="${project.title}" 
                loading="eager"     <!-- Immediate load! -->
                width="400"         <!-- Fixed width -->
                height="300"        <!-- Fixed height -->
                style="width:100%; border-radius:8px;"
            >
            <div class="card-content">
                <div class="card-icon">${project.icon}</div>
                <h3>${project.title}</h3>
                <p>${project.shortDesc}</p>
            </div>
        </div>
    `).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', renderPortfolio);


// Initialize portfolio
function initPortfolio() {
    const container = document.getElementById('portfolio-container');
    
    if (!container) return;
    
    container.innerHTML = projects.map(project => `
        <div class="portfolio-card" data-id="${project.id}">
            <div class="card-icon">${project.icon}</div>
            <h3 class="card-title">${project.title}</h3>
            <p class="card-desc">${project.shortDesc}</p>
        </div>
    `).join('');
    
    // Events for cards
    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = parseInt(card.dataset.id);
            const project = projects.find(p => p.id === projectId);
            openPopup(project);
        });
    });
}

// Open popup
function openPopup(project) {
    const popup = document.getElementById('project-popup');
    const content = document.getElementById('popup-content-wrapper');
    
    content.innerHTML = `
        <h2>${project.title}</h2>
        <img src="${project.image}" alt="${project.title}" onerror="this.src='img/default-project.webp'">
        <p>${project.fullDesc}</p>
        <button class="popup-btn" onclick="requestProject(${project.id})">I'll take it... </button>
    `;
    
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close popup
function closePopup() {
    document.getElementById('project-popup').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Request project
function requestProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Close project popup
    closePopup();
    
    // Open contact popup
    openContactPopup();
    
    // Add project name to message field (without deleting existing content)
    const messageField = document.getElementById('contact-message');
    const currentValue = messageField.value.trim();
    const projectText = `I'm interested in the project ${project.title}. `;
    
    // Only add if not already present
    if (!currentValue.includes(project.title)) {
        messageField.value = projectText + (currentValue ? '\n\n' + currentValue : '');
    }
    
    // Focus message field
    setTimeout(() => {
        messageField.focus();
    }, 500);
}

// Modify popup HTML button to correctly pass ID
function openPopup(project) {
    const popup = document.getElementById('project-popup');
    const content = document.getElementById('popup-content-wrapper');
    
    content.innerHTML = `
        <h2>${project.title}</h2>
        <img src="${project.image}" alt="${project.title}" onerror="this.src='img/default-project.webp'">
        <p>${project.fullDesc}</p>
        <button class="popup-btn" onclick="requestProject(${project.id})">I'll take it... </button>
    `;
    
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initPortfolio();
    
    // Close button
    document.querySelector('.close-popup').addEventListener('click', closePopup);
    
    // Close when clicking outside
    document.getElementById('project-popup').addEventListener('click', (e) => {
        if (e.target === document.getElementById('project-popup')) {
            closePopup();
        }
    });
    
    // Close with Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('project-popup').classList.contains('active')) {
            closePopup();
        }
    });
});