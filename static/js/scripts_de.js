// Inicializar EmailJS con tu Public Key
(function() {
    emailjs.init('RRR4M2sCr-NgEf8ul');
})();

// Variables globales para control de elementos flotantes
let activeFloatingElement = null; // 'chatbot', 'gif' o 'contact'
let inactivityTimeout = null;
let gifWindowTimeout = null;

// ========== BESUCHERZÄHLER VERBESSERT ========== //
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
      console.log('Kürzlicher Besuch erkannt, wird nicht registriert');
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
        referrer: document.referrer || 'direkt',
        device: this.getDeviceType()
      };

      await this.addVisitComment(visitData);
      console.log('Besuch erfolgreich registriert');
    } catch (error) {
      console.error('Fehler bei der Besuchsregistrierung:', error);
    }
  },

  async registerVisitDev() {
    if (!this.shouldRegisterVisit()) return;
    
    try {
      if (!this.config.token) {
        const response = await fetch('womo-config.json');
        if (!response.ok) throw new Error('Konfigurationsdatei nicht gefunden');
        const config = await response.json();
        this.config.token = config.github.token;
      }

      const visitData = {
        date: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent.slice(0, 120)
      };

      await this.addVisitComment(visitData);
      console.log('Besuch erfolgreich registriert');
    } catch (error) {
      console.error('Fehler bei der Besuchsregistrierung:', error.message);
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
          body: `📍 Neuer Besuch:\n` +
                `- Datum: ${new Date().toLocaleString()}\n` +
                `- Von: ${visitData.device || visitData.userAgent?.slice(0, 50) || 'Unbekanntes Gerät'}\n` +
                `- URL: ${visitData.url}\n` +
                `- Referrer: ${visitData.referrer}`
        })
      }
    );

    if (!response.ok) throw new Error('Fehler in der GitHub API');
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

// Llamar a la función adecuada según el entorno
setTimeout(() => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    visitCounter.registerVisitDev();
  } else {
    visitCounter.registerVisitSafe();
  }
}, 2000);

// Variables para el carrusel automático
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

// ========== VOLLSTÄNDIGER MODAL-CODE ========== //
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

// Control de popup de contacto lateral
function openContactPopup(prefilledMessage = '') {
    // 1. Cerrar el chatbot si está abierto
    closeChatbot();
    
    // 2. Ocultar el icono del chatbot inmediatamente
    const chatbotIcon = document.querySelector('.chatbot-icon');
    if (chatbotIcon) {
        chatbotIcon.style.opacity = '0';
        chatbotIcon.style.pointerEvents = 'none';
        setTimeout(() => {
            chatbotIcon.style.display = 'none';
        }, 300);
    }
    
    // 3. Mostrar el popup de contacto
    const contactPopup = document.getElementById('contact-popup');
    if (contactPopup) {
        contactPopup.classList.add('active');
    }
    
    // 4. Actualizar estado
    document.body.style.overflow = 'hidden';
    activeFloatingElement = 'contact';
    
    // 5. Asegurar que el botón de WhatsApp sea clickeable y visible
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

    // 6. NUEVO CÓDIGO - Agregar mensaje prefijado si se proporcionó
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
    
    // Mostrar el icono del chatbot solo si no hay otros elementos activos
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

function validarCampos() {
    let valido = true;
    const nombre = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const celular = document.getElementById('contact-celular').value.trim();
    const mensaje = document.getElementById('contact-message').value.trim();

    document.querySelectorAll('input, textarea').forEach(el => {
        el.style.borderColor = '#e2e8f0';
    });

    if (nombre.length < 3) {
        document.getElementById('contact-name').style.borderColor = '#EF4444';
        valido = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('contact-email').style.borderColor = '#EF4444';
        valido = false;
    }

    if (!/^\d{10}$/.test(celular)) {
        document.getElementById('contact-celular').style.borderColor = '#EF4444';
        valido = false;
    }

    if (mensaje.length < 10) {
        document.getElementById('contact-message').style.borderColor = '#EF4444';
        valido = false;
    }

    return valido;
}

async function sendContactRequest() {
    if (!validarCampos()) {
        mostrarNotificacion('Bitte füllen Sie alle Felder korrekt aus', 'error');
        return;
    }

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const celular = document.getElementById('contact-celular').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    const textoPlano = crearTextoPlano(name, email, celular, message);
    const datosJSON = crearDatosJSON(name, email, celular, message);

    try {
        await enviarConEmailJS(name, email, celular, textoPlano, datosJSON);
        mostrarNotificacion('Nachricht erfolgreich gesendet!', 'success');
    } catch (error) {
        console.error('Fehler mit EmailJS:', error);
        mostrarNotificacion('Alternative Methode wird verwendet...', 'warning');
        
        try {
            await enviarConFormSubmit(name, email, celular, message, datosJSON);
            mostrarNotificacion('Nachricht erfolgreich per alternativer Methode gesendet!', 'success');
        } catch (backupError) {
            console.error('Fehler mit alternativer Methode:', backupError);
            mostrarNotificacion('Fehler: Bitte kontaktieren Sie uns per WhatsApp', 'error');
            return;
        }
    }

    limpiarFormulario();
    closeContactPopup();
}

function crearTextoPlano(name, email, phone, message) {
    return `
== NEUER KONTAKT WOMO STUDIO ==
Name: ${name}
Email: ${email}
Telefon: ${phone}
Nachricht: ${message}
Datum: ${new Date().toLocaleString()}
==============================================
`;
}

function crearDatosJSON(name, email, phone, message) {
    return {
        fecha: new Date().toISOString(),
        contacto: {
            nombre: name,
            email: email,
            telefono: phone
        },
        mensaje: message,
        metadata: {
            pagina: window.location.href,
            userAgent: navigator.userAgent
        }
    };
}

async function enviarConEmailJS(name, email, phone, textoPlano, datosJSON) {
    return emailjs.send('service_42rjl6k', 'template_iszllup', {
        from_name: name,
        from_email: email,
        from_phone: phone,
        message: textoPlano,
        reply_to: email,
        subject: `[WOMO] Kontakt: ${name}`,
        datos_json: JSON.stringify(datosJSON, null, 2)
    });
}

async function enviarConFormSubmit(name, email, phone, message, metadata) {
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
        throw new Error('Fehler in FormSubmit');
    }
}

function limpiarFormulario() {
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-celular').value = '';
    document.getElementById('contact-message').value = '';
}

function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.remove();
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

// ========== CHATBOT UND INTERAKTIVES GIF ========== //
const chatbotConfig = {
    greetings: [
        "Hallo! Ich bin WoMi, dein Berater für strategische Automatisierung. 😊 Wie kann ich dir heute bei der Optimierung deiner Prozesse helfen?",
        "Hallo, ich bin WoMi von WoMo Soluciónˢ. Spezialisten für die Transformation operativer Herausforderungen in messbare Effizienz. Welcher Prozess kostet dich derzeit am meisten Zeit?",
        "Hallo! 👋 WoMo Soluciónˢ hier. Wir automatisieren Prozesse mit greifbaren Ergebnissen. Welcher Bereich deines Betriebs benötigt mehr Effizienz?"
    ],
    responses: {
        "hola": {
            messages: [
                "Hallo! 👋 Ich bin WoMi, dein Automatisierungsexperte von WoMo Soluciónˢ.",
                "Wir arbeiten mit Unternehmen wie deinem, um:",
                "• Wertvolle Arbeitsstunden zurückzugewinnen",
                "• Betriebliche Fehler zu minimieren",
                "• Die Nutzung deiner Ressourcen zu optimieren",
                "",
                "Welche Art von Prozessen verursachen derzeit die meisten Ineffizienzen?"
            ],
            quickReplies: ["Dienstleistung", "Zeit", "Kontakt", "Mit Berater sprechen"]
        },
        "servicio": {
            messages: [
                "🚀 Unser professioneller Ansatz:",
                "",
                "1. <strong>Prozessanalyse</strong>: Detaillierte Bewertung deiner Abläufe (kostenpflichtige Dienstleistung)",
                "",
                "2. <strong>Lösungsvorschlag</strong>: Personalisierter Plan mit klaren KPIs",
                "",
                "3. <strong>Garantierte Implementierung</strong>: Bereitstellung mit vollständiger Begleitung",
                "",
                "4. <strong>Ergebnismessung</strong>: Regelmäßige Berichte über Verbesserungen",
                "",
                "Möchtest du unseren Prozess anhand eines realen Implementierungsbeispiels kennenlernen?"
            ],
            quickReplies: ["Erfolgsfall sehen", "Anfangskosten", "Geschätzte Zeiten", "Team kontaktieren"]
        },
        "tiempo": {
            messages: [
                "⏱️ Unsere typischen Implementierungen wirken sich aus auf:",
                "",
                "• Deutliche Reduzierung der Ausführungszeiten",
                "• Beseitigung redundanter manueller Schritte",
                "• Optimierte End-to-End-Arbeitsabläufe",
                "",
                "Reales Beispiel: Ein Kunde in deiner Branche konnte die Bearbeitungszeit von Dokumenten von 3 Tagen auf wenige Stunden reduzieren.",
                "",
                "Möchtest du analysieren, wie wir dies auf deine Abläufe anwenden würden?"
            ],
            quickReplies: ["Meinen Fall analysieren", "Demo sehen", "Experten fragen", "Angebot anfordern"]
        },
        "contacto": {
            messages: [
                "📅 Vereinbare eine strategische Sitzung mit unserem Team:",
                "",
                "Verfügbarkeit für erste Besprechungen:",
                "• Montag bis Freitag: 9-18 Uhr",
                "• Erfordert vorherige Informationen",
                "",
                "Wir zeigen dir genau, wie wir deine Abläufe optimieren können"
            ],
            actions: [{
                type: "button",
                text: "📝 Erste Sitzung buchen",
                action: "showExpertCalendar()"
            }]
        },
		
        "precio": {
            messages: [
                "💰 Ergebnisbasierte Investitionsmodelle:",
                "",
                "Unsere WoMo-Lösungen sind in Phasen strukturiert:",
                "",
                "1. <strong>Erstbewertung</strong>: $X (auf Implementierung anrechenbar)",
                "2. <strong>Lösungsentwicklung</strong>: Ab $Y (je nach Komplexität)",
                "3. <strong>Wartung</strong>: Optional mit monatlicher Berichterstattung",
                "",
                "92% unserer Kunden amortisieren ihre Investition in den ersten 3 Monaten.",
                "",
                "Möchtest du branchenspezifische Beispiele erhalten?"
            ],
            quickReplies: ["Ähnliche Fälle sehen", "Detaillierter Prozess", "WhatsApp-Vertrieb", "Technische Dokumentation"]
        },
        "gracias": {
            messages: [
                "Danke, dass du eine professionelle Lösung in Betracht ziehst. 🚀",
                "Wenn du bereit bist, deine Abläufe mit klaren Metriken zu transformieren, sind wir hier."
            ],
            quickReplies: ["Zusätzliches Material", "Beraterteam", "LinkedIn"]
        },
        "adios": {
            messages: [
                "Es war mir eine Freude, dir zu helfen! ⚡",
                "Denk daran: Strategische Automatisierung kann dein Wettbewerbsvorteil sein.",
                "Viel Erfolg bei deinen Abläufen!"
            ],
            quickReplies: []
        },
        "default": {
            messages: [
                "Ich verstehe deine Anfrage. Lass mich besser kontextualisieren:",
                "",
                "Bei WoMo Soluciónˢ bieten wir keine generischen Lösungen an.",
                "Um dir eine präzise Antwort zu geben, müsste ich mehr wissen über:",
                "• Deine aktuellen operativen Volumina",
                "• Die identifizierten Engpässe",
                "• Deine strategischen Ziele",
                "",
                "Möchtest du eine erste Sitzung mit unserem Team vereinbaren?"
            ],
            quickReplies: ["Sitzung buchen", "Informationen senden", "Spezifische Frage", "Relevante Fälle"]
        }
    },
    leadForms: {
        "asesoria": {
            title: "Erste strategische Sitzung",
            description: "Fülle diese Informationen aus, damit sich unser Team angemessen auf deinen Fall vorbereiten kann",
            fields: [
                { 
                    name: "nombre", 
                    placeholder: "Vollständiger Name", 
                    type: "text", 
                    required: true,
                    validation: "Bitte gib deinen vollständigen Namen ein"
                },
                { 
                    name: "empresa", 
                    placeholder: "Name deines Unternehmens", 
                    type: "text", 
                    required: true 
                },
                { 
                    name: "email", 
                    placeholder: "Geschäfts-E-Mail", 
                    type: "email", 
                    required: true,
                    validation: "Bitte gib eine gültige E-Mail-Adresse ein"
                },
                { 
                    name: "telefono", 
                    placeholder: "WhatsApp für Kontakt", 
                    type: "tel", 
                    required: true 
                },
                { 
                    name: "proceso", 
                    placeholder: "Beschreibe deine Haupt-Herausforderung", 
                    type: "textarea", 
                    required: false,
                    helperText: "Beispiel: Manuelle Rechnungsverwaltung, langsame Genehmigungen etc."
                },
                { 
                    name: "empleados", 
                    placeholder: "Ungefähre Anzahl der Mitarbeiter", 
                    type: "select",
                    options: ["1-10", "11-50", "51-200", "200+"],
                    required: true
                }
            ],
            submitText: "Strategische Sitzung anfordern",
            successMessage: "✅ Perfekt! Wir haben deine Informationen erhalten. Ein Senior-Berater wird sich innerhalb der nächsten 24 Stunden mit dir in Verbindung setzen, um die strategische Sitzung zu koordinieren. Möchtest du in der Zwischenzeit unser Dossier mit Erfolgsfällen in deiner Branche erhalten?",
            successActions: [
                {
                    text: "Dossier erhalten",
                    action: "sendDossier()"
                },
                {
                    text: "Erklärvideo ansehen",
                    action: "showVideo('intro')"
                }
            ]
        }
    },
    farewells: [
        "Danke für dein Interesse an professionellen Lösungen. Wir sind hier, wenn du deine Abläufe optimieren möchtest.",
        "Es war schön, mit dir zu sprechen. Denk daran, dass operative Effizienz die Grundlage für nachhaltiges Wachstum ist.",
        "Bis bald! Wenn du Herausforderungen in Ergebnisse verwandeln möchtest, findest du uns hier."
    ],
    fallbackStrategy: {
        unknownQuery: [
            "Interessante Frage. Um dir eine präzise Antwort zu geben, müsste ich deinen operativen Kontext besser verstehen.",
            "Möchtest du, dass wir diese Anfrage mit einem unserer Spezialisten verbinden?"
        ],
        technicalQuestion: [
            "Dies ist eine spezifische technische Anfrage. Lass mich dich mit unserem Ingenieursteam verbinden.",
            "Ein Experte wird sich mit den detaillierten Informationen melden, die du benötigst."
        ],
        pricingQuery: [
            "Ich verstehe, dass du finanzielle Klarheit benötigst. Um genaue Zahlen zu geben, müssen wir zunächst bewerten:",
            "1. Die Komplexität deiner aktuellen Prozesse",
            "2. Das operative Volumen",
            "3. Die erwarteten Ergebnisse",
            "Möchtest du eine kurze Sitzung vereinbaren, um dies zu analysieren?"
        ]
    }
};

// Variables del chatbot
let isTyping = false;
let currentLeadForm = null;

// Funciones principales del chatbot
function toggleChatbot() {
    const chatbotWindow = document.getElementById('chatbot-window');
    
    if (chatbotWindow.classList.contains('active')) {
        closeChatbot();
    } else {
        openChatbot();
    }
}

function openChatbot() {
    // Cerrar otros elementos flotantes
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
        showQuickReplies(chatbotConfig.responses["hola"].quickReplies);
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
        
        // Verificar palabras clave
        if (lowerInput.includes('gracias') || lowerInput.includes('thank')) {
            const randomResponse = chatbotConfig.responses["gracias"].messages;
            randomResponse.forEach(msg => addBotMessage(msg));
            showQuickReplies(chatbotConfig.responses["gracias"].quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('adios') || lowerInput.includes('hasta luego') || lowerInput.includes('bye')) {
            const randomFarewell = chatbotConfig.farewells[Math.floor(Math.random() * chatbotConfig.farewells.length)];
            addBotMessage(randomFarewell);
            responseFound = true;
        }
        else if (lowerInput.includes('hola') || lowerInput.includes('hi')) {
            const response = chatbotConfig.responses["hola"];
            response.messages.forEach(msg => addBotMessage(msg));
            showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('servicio') || lowerInput.includes('qué hacen') || lowerInput.includes('que ofrecen')) {
            const response = chatbotConfig.responses["servicio"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.quickReplies) showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('tiempo') || lowerInput.includes('rápido') || lowerInput.includes('lento')) {
            const response = chatbotConfig.responses["tiempo"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.quickReplies) showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('contacto') || lowerInput.includes('hablar') || lowerInput.includes('llamar')) {
            const response = chatbotConfig.responses["contacto"];
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
        else if (lowerInput.includes('precio') || lowerInput.includes('costo') || lowerInput.includes('cuánto cuesta')) {
            const response = chatbotConfig.responses["precio"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.quickReplies) showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        
        // Respuesta por defecto si no se encontró coincidencia
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
        addBotMessage("Bitte fülle alle erforderlichen Felder aus.");
        return;
    }
    
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        form.remove();
        
        addBotMessage(chatbotConfig.leadForms[formType].successMessage);
        
        if (formType === 'consultoria') {
            showQuickReplies(["Ähnlichen Fall sehen", "Wie vorbereiten", "Danke"]);
        }
        
        sendLeadDataToBackend(formData, formType);
    }, 2000);
}

function sendLeadDataToBackend(data, formType) {
    const textoPlano = `
== NEUER LEAD VOM CHATBOT ==
Typ: ${formType}
Name: ${data.nombre || 'Nicht angegeben'}
Email: ${data.email || 'Nicht angegeben'}
Telefon: ${data.telefono || 'Nicht angegeben'}
Nachricht: ${data.necesidad || 'Anfrage vom Chatbot'}
Datum: ${new Date().toLocaleString()}
==============================================
`;

    const datosJSON = {
        fecha: new Date().toISOString(),
        origen: "chatbot",
        tipo_formulario: formType,
        contacto: {
            nombre: data.nombre || null,
            email: data.email || null,
            telefono: data.telefono || null
        },
        mensaje: data.necesidad || 'Anfrage vom Chatbot',
        metadata: {
            pagina: window.location.href,
            userAgent: navigator.userAgent,
            interacciones: document.getElementById('chatbot-messages').children.length
        }
    };

    emailjs.send('service_42rjl6k', 'template_iszllup', {
        from_name: data.nombre || 'Chatbot-Nutzer',
        from_email: data.email || 'no-email@chatbot.com',
        from_phone: data.telefono || '',
        message: textoPlano,
        reply_to: data.email || 'womostd@gmail.com',
        subject: `[WOMO] Chatbot-Lead: ${formType} - ${data.nombre || 'Anonym'}`,
        datos_json: JSON.stringify(datosJSON, null, 2)
    })
    .then(response => {
        console.log('Email gesendet!', response.status, response.text);
    })
    .catch(error => {
        console.error('Fehler beim Senden:', error);
        sendWithFormSubmit(data, formType);
    });
}

function sendWithFormSubmit(data, formType) {
    const datosJSON = {
        fecha: new Date().toISOString(),
        origen: "chatbot",
        tipo_formulario: formType,
        contacto: {
            nombre: data.nombre || null,
            email: data.email || null,
            telefono: data.telefono || null
        },
        mensaje: data.necesidad || 'Anfrage vom Chatbot',
        metadata: {
            pagina: window.location.href,
            userAgent: navigator.userAgent
        }
    };

    const formData = new FormData();
    formData.append('nombre', data.nombre || '');
    formData.append('email', data.email || '');
    formData.append('telefono', data.telefono || '');
    formData.append('mensaje', data.necesidad || 'Anfrage vom Chatbot');
    formData.append('metadata', JSON.stringify(datosJSON));
    formData.append('_subject', `[Chatbot] ${formType} - ${data.nombre || 'Anonym'}`);
    
    fetch('https://formsubmit.co/ajax/womostd@gmail.com', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => console.log('FormSubmit-Erfolg:', data))
    .catch(error => console.error('FormSubmit-Fehler:', error));
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Configuración del asistente flotante WoMi
const inactivityConfig = {
    timeout: 15000, // 15 segundos para mostrar el popup
    messages: [
        "Brauchst du Hilfe bei der Optimierung deiner Prozesse?",
        "Hallo! Bereit, deine Produktivität zu transformieren? Wir haben die ideale Lösung für dich.",
        "Möchtest du wissen, wie du deine Abläufe automatisieren kannst?",
        "Verwandle manuelle Prozesse in automatische Systeme. Sollen wir reden?",
        "Ich würde dir gerne zeigen, wie wir dir helfen können!"
    ],
    displayDuration: 0, // Cambiado a 0 para que no se oculte automáticamente
    cooldown: 60000, // 30 segundos antes de reaparecer
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
    // No mostrar si ya hay otro elemento flotante activo
    if (activeFloatingElement || isGifWindowOpen) return;
    
    // Cerrar el chatbot si está abierto
    closeChatbot();
    
    const popup = document.getElementById('inactivity-popup');
    const message = document.getElementById('inactivity-message');
    const gif = document.getElementById('inactivity-gif');
    const chatbotIcon = document.querySelector('.chatbot-icon');
    
    // Ocultar el icono del chatbot
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
    
    // Eliminado el timeout para ocultar automáticamente
    isPopupActive = true;
    activeFloatingElement = 'gif';
    document.addEventListener('click', closePopupOnOutsideClick, true);
}
    
function closePopupOnOutsideClick(e) {
    const popup = document.getElementById('inactivity-popup');
    const gifWindow = document.getElementById('gif-window');
    
    // Verificar si se hizo clic fuera del popup o del GIF
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
    
    // Opciones más concretas y accionables
    gifWindowContent.innerHTML = `
        <div class="gif-window-header">
            <h3>Welches Problem möchtest du lösen?</h3>
            <button class="close-gif-window" onclick="closeGifWindow()">×</button>
        </div>
        <div class="gif-window-body">
            <div class="gif-window-grid">
                <!-- ProTrack -->
                <button class="gif-option-btn" onclick="handleGifOption('Koordination manueller Prozesse')">
                    <strong>⚙️ Unorganisierte Prozesse</strong><br>
                    <small>Modulares Managementsystem</small>
                </button>

                <!-- Unistock -->
                <button class="gif-option-btn" onclick="handleGifOption('Ungenauigkeit in der Bestandskontrolle')">
                    <strong>📦 Unzuverlässiger Bestand</strong><br>
                    <small>Automatische Bestandsalarme</small>
                </button>

                <!-- PortiFy -->
                <button class="gif-option-btn" onclick="handleGifOption('Verfolgung von Projekten/Kunden')">
                    <strong>📊 Fragmentierte Informationen</strong><br>
                    <small>Visuelle CRM für Portfolios</small>
                </button>

                <!-- PCAF -->
                <button class="gif-option-btn" onclick="handleGifOption('Verwaltung von Kunden/Mitgliedschaften')">
                    <strong>🏋️ Manuelle Aufzeichnungen</strong><br>
                    <small>Integriertes Kontrollsystem</small>
                </button>

                <!-- Messungen -->
                <button class="gif-option-btn" onclick="handleGifOption('Verfolgung des körperlichen Fortschritts')">
                    <strong>📏 Nicht systematisierte Messungen</strong><br>
                    <small>Digitalisierter Verlauf</small>
                </button>

                <!-- PocketFlow -->
                <button class="gif-option-btn" onclick="handleGifOption('Organisation der Finanzen')">
                    <strong>💰 Nicht kategorisierte Ausgaben</strong><br>
                    <small>Personalisiertes Finanzmanagement</small>
                </button>
            </div>
            <button class="gif-option-btn no-thanks" onclick="handleNoThanks()">
                Jetzt nicht, danke
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
    // Ocultar mensaje inicial si aún está visible
    const initialMessage = document.getElementById('inactivity-message');
    if (initialMessage) {
        initialMessage.classList.remove('active');
    }
    
    // Cerrar ventana GIF
    closeGifWindow();
    
    // Mostrar mensaje de despedida
    showWoMoBubble("Alles klar! 😊 Ich bin hier, falls du mich brauchst.");
    
    // Ocultar todo después de 3 segundos
    hideTimeout = setTimeout(() => {
        hideInactivityPopup();
    }, 3000);
}

function showWoMoBubble(message) {
    // Asegurarse de que el mensaje inicial esté oculto
    const initialMessage = document.getElementById('inactivity-message');
    if (initialMessage) {
        initialMessage.classList.remove('active');
    }
    
    const gif = document.getElementById('inactivity-gif');
    const gifRect = gif.getBoundingClientRect();
    
    // Crear burbuja
    const bubble = document.createElement('div');
    bubble.className = 'womo-bubble';
    bubble.innerHTML = `
        <div class="bubble-arrow"></div>
        <div class="bubble-content">${message}</div>
    `;
    
    // Posicionamiento preciso
    bubble.style.position = 'fixed';
    bubble.style.bottom = `${gifRect.bottom + window.scrollY}px`;
    bubble.style.left = `${gifRect.left - 200}px`;
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(10px)';
    bubble.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(bubble);
    
    // Animación de entrada
    setTimeout(() => {
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';
    }, 50);
    
    // Animación de hablar
    gif.classList.add('womo-talking');
    
    // Desaparecer después de 3 segundos
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
    
    // Mensaje inicial basado en la opción seleccionada
    let botResponse = "";
    switch(option) {
        case 'Tareas repetitivas que consumen mucho tiempo':
            botResponse = "Ich verstehe, dass du manuelle Prozesse optimieren möchtest. Könntest du mir sagen, um welche Art von Aufgaben es sich handelt? Zum Beispiel:\n1. Auftragsabwicklung\n2. Rechnungsstellung\n3. Monatliche Berichte\n4. Andere (spezifizieren)";
            break;
        case 'Errores en inventario que generan pérdidas':
            botResponse = "Die Bestandskontrolle ist entscheidend. Welche spezifischen Probleme hast du?\n1. Ungenauer Bestand\n2. Nicht identifizierte Verluste\n3. Unnötige Einkäufe\n4. Andere (beschreiben)";
            break;
        case 'Clientes insatisfechos por mala comunicación':
            botResponse = "Die Kommunikation mit Kunden ist entscheidend. Welcher Bereich muss verbessert werden?\n1. Beantwortung von Anfragen\n2. Verkaufsverfolgung\n3. Zahlungserinnerungen\n4. Andere (welche)";
            break;
        default:
            botResponse = "Erzähl mir mehr über diese Herausforderung, damit ich dir eine präzise Lösung geben kann.";
    }
    
    // Mostrar mensaje del usuario y respuesta del bot
    addUserMessage(option);
    setTimeout(() => {
        addBotMessage(botResponse);
    }, 800);
}

function positionGifWindow(popup, gifWindow) {
    const popupRect = popup.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Para móviles, centramos horizontalmente y posicionamos arriba
        gifWindow.style.left = '50%';
        gifWindow.style.right = 'auto';
        gifWindow.style.transform = 'translateX(-50%)';
        gifWindow.style.bottom = `${popupRect.height + 20}px`;
        gifWindow.style.top = 'auto';
    } else {
        // Para desktop mantenemos el comportamiento original
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
    
    // Marcar que ya pasó la primera aparición
    if (inactivityConfig.firstAppearance) {
        inactivityConfig.firstAppearance = false;
    }
    
    // Resto de la función permanece igual...
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
    
    // Solo mostrar el icono del chatbot si no hay otros elementos flotantes activos
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
    // Restablecer firstAppearance al cargar la página
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

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Precargar el GIF
    const gif = new Image();
    gif.src = 'WoMi1.webp';
    
    // Precargar el icono del chatbot
    const chatbotIconImg = new Image();
    chatbotIconImg.src = 'WoMi.webp';
    
    // Precargar el logo de WhatsApp
    const whatsappImg = new Image();
    whatsappImg.src = 'wp.webp';
    
    // Iniciar el seguimiento de actividad
    setupActivityTracking();
    
    // Crear elementos necesarios si no existen
    if (!document.getElementById('gif-window')) {
        const gifWindow = document.createElement('div');
        gifWindow.id = 'gif-window';
        gifWindow.innerHTML = '<div id="gif-window-content"></div>';
        document.body.appendChild(gifWindow);
    }
    
    // Configurar eventos del chatbot
    const chatbotWindow = document.getElementById('chatbot-window');
    chatbotWindow.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Evento para enviar mensaje con Enter
    document.getElementById('chatbot-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Cerrar chatbot al hacer clic en enlaces de contacto
    document.querySelectorAll('[onclick="openContactPopup()"]').forEach(link => {
        link.addEventListener('click', closeChatbot);
    });
    
    // Crear partículas para el hero
    createParticles();
    
    // Asegurar que el icono esté visible al cargar (si no hay popups abiertos)
    updateChatbotIconVisibility();
    
    // Asegurar que el botón de WhatsApp sea clickeable
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.style.pointerEvents = 'auto';
        whatsappBtn.style.zIndex = '1';
    }
});

// Configuración de navegación del menú
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

// Manejar tecla Escape para cerrar elementos
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
        title: "Zeittransformation",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #10B981; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Wir verwandeln Stunden in Minuten</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Zufriedene Kunden, optimierte Zeit</p>
                
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
                        Deutliche Optimierung der Prozesse.
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #10B981; font-weight: bold;">•</span> 
                        Sag Lebewohl zu manuellen und repetitiven Aufgaben
                    </li>
                </ul>
            </div>
        `
    },
    workflow: {
        title: "Intelligente Automatisierung",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #2563EB; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Flexible Automatisierung</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Stärke deine internen Prozesse</p>
                
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
                        Unabhängige und autonome Lösung
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #2563EB; font-weight: bold;">•</span> 
                        Passt sich deinen spezifischen Prozessen an
                    </li>
                </ul>
            </div>
        `
    },
    profit: {
        title: "Effizienz die Wert schafft",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #7C3AED; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Intelligente finanzielle Optimierung</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Verwandle Effizienz in Ergebnisse</p>
                
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
                        Nachhaltige Verbesserung deiner Rentabilität
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #7C3AED; font-weight: bold;">•</span> 
                        Effizienteres Management deiner Ressourcen
                    </li>
                </ul>
            </div>
        `
    },
    analytics: {
        title: "Strategische Intelligenz",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #F59E0B; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Sei der Konkurrenz voraus</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Entdecke Muster vor der Konkurrenz</p>
                
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
                        Zuverlässige und umsetzbare Prognosen
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #F59E0B; font-weight: bold;">•</span> 
                        Früherkennung von Schlüsselchancen
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

// Función para actualizar la visibilidad del icono del chatbot
function updateChatbotIconVisibility() {
    const chatbotIcon = document.querySelector('.chatbot-icon');
    if (!chatbotIcon) return;
    
    // Ocultar si hay popup de contacto abierto u otros elementos activos
    const contactPopupActive = document.getElementById('contact-popup').classList.contains('active');
    if (contactPopupActive || activeFloatingElement || isPopupActive || isGifWindowOpen) {
        chatbotIcon.style.display = 'none';
    } else {
        chatbotIcon.style.display = 'flex';
    }
}

// Datos de los 6 proyectos
const projects = [
    {   "id": 1,
        "title": "ProTrack",
        "shortDesc": "Modulare universelle Prozessmanagement-Plattform",
        "fullDesc": "Es ist die Engine, die operatives Chaos in Hochleistungs-Automatisierungsflüsse verwandelt. Für Führungskräfte, die Exzellenz in jedem Prozess fordern.",
        "icon": "⚙️",
        "image": "../proyectos/imagen3.webp"
    },{ "id": 2,
        "title": "Unistock",
        "shortDesc": "Eigenes Bestandsverwaltungssystem",
        "fullDesc": "Es ist das logistische Gehirn, das Engpässe vorhersagt, Einkäufe optimiert und Bestände in Cashflow verwandelt. Für Unternehmen, die keine Fehler tolerieren.",
        "icon": "📦",
        "image": "../proyectos/imagen2.webp"
    },{ "id": 3,
        "title": "PortiFy",
        "shortDesc": "Spezialisiertes CRM für Technologieportfolios",
        "fullDesc": "Macht dein Portfolio zur kommerziellen Waffe: verwandelt technische Projekte in unwiderstehliche Narrative für anspruchsvolle Kunden.",
        "icon": "📊",
        "image": "../proyectos/imagen6.webp"
    },{ "id": 4,
        "title": "PCAF",
        "shortDesc": "Verwaltungssystem für Fitnessstudios",
        "fullDesc": "Das System, das deine Kunden das Gefühl gibt, in einem Luxus-Fitnessstudio zu trainieren: sofort messbarer Fortschritt und exklusive Kommunikation. Das geheime Tool, um 3-mal mehr zu halten.",
        "icon": "🏋️",
        "image": "../proyectos/imagen1.webp"
    },{ "id": 5,
        "title": "Messungen",
        "shortDesc": "Verfolgung des körperlichen Fortschritts",
        "fullDesc": "System, das Training mit Ergebnissen verknüpft: zeichnet Messungen auf, korreliert Routinen und zeigt die greifbaren Auswirkungen deiner Methodik. Der Beweis, dass deine Arbeit transformiert.",
        "icon": "📏",
        "image": "../proyectos/imagen4.webp"
    },{ "id": 6,
        "title": "PocketFlow",
        "shortDesc": "Persönliches Finanzmanagement",
        "fullDesc": "Es ist die intelligente persönliche Finanzkontrolle: übernimm mit professioneller Klarheit und Präzision die Kontrolle über dein Geld.",
        "icon": "💰",
        "image": "../proyectos/imagen5.webp"
    }
];

// Precarga IMÁGENES CRÍTICAS (WebP)
function preloadImages() {
    projects.forEach(project => {
        const img = new Image();
        img.src = project.image; // Precarga en segundo plano
    });
}

// Renderiza el portafolio (carga ULTRA rápida)
function renderPortfolio() {
    const container = document.getElementById('portfolio-container');
    
    // 1. Precarga las imágenes
    preloadImages();
    
    // 2. Crea las tarjetas
    container.innerHTML = projects.map(project => `
        <div class="portfolio-card" data-id="${project.id}">
            <img 
                src="${project.image}" 
                alt="${project.title}" 
                loading="eager"     <!-- ¡Carga inmediata! -->
                width="400"         <!-- Ancho fijo -->
                height="300"        <!-- Alto fijo -->
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

// Inicializa al cargar la página
document.addEventListener('DOMContentLoaded', renderPortfolio);


// Inicializar portafolio
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
    
    // Eventos para las tarjetas
    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = parseInt(card.dataset.id);
            const project = projects.find(p => p.id === projectId);
            openPopup(project);
        });
    });
}

// Abrir popup
function openPopup(project) {
    const popup = document.getElementById('project-popup');
    const content = document.getElementById('popup-content-wrapper');
    
    content.innerHTML = `
        <h2>${project.title}</h2>
        <img src="${project.image}" alt="${project.title}" onerror="this.src='img/default-project.webp'">
        <p>${project.fullDesc}</p>
        <button class="popup-btn" onclick="requestProject(${project.id})">Ich nehme es... </button>
    `;
    
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar popup
function closePopup() {
    document.getElementById('project-popup').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Solicitar proyecto
function requestProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Cerrar el popup del proyecto
    closePopup();
    
    // Abrir el popup de contacto
    openContactPopup();
    
    // Agregar el nombre del proyecto al campo de mensaje (sin borrar contenido existente)
    const messageField = document.getElementById('contact-message');
    const currentValue = messageField.value.trim();
    const projectText = `Ich interessiere mich für das Projekt ${project.title}. `;
    
    // Solo agregar si no está ya presente
    if (!currentValue.includes(project.title)) {
        messageField.value = projectText + (currentValue ? '\n\n' + currentValue : '');
    }
    
    // Enfocar el campo de mensaje
    setTimeout(() => {
        messageField.focus();
    }, 500);
}

// Modificar el HTML del botón en openPopup para pasar el ID correctamente
function openPopup(project) {
    const popup = document.getElementById('project-popup');
    const content = document.getElementById('popup-content-wrapper');
    
    content.innerHTML = `
        <h2>${project.title}</h2>
        <img src="${project.image}" alt="${project.title}" onerror="this.src='img/default-project.webp'">
        <p>${project.fullDesc}</p>
        <button class="popup-btn" onclick="requestProject(${project.id})">Ich nehme es... </button>
    `;
    
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initPortfolio();
    
    // Botón cerrar
    document.querySelector('.close-popup').addEventListener('click', closePopup);
    
    // Cerrar al hacer clic fuera
    document.getElementById('project-popup').addEventListener('click', (e) => {
        if (e.target === document.getElementById('project-popup')) {
            closePopup();
        }
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('project-popup').classList.contains('active')) {
            closePopup();
        }
    });
});