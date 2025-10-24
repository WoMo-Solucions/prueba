// Inicializar EmailJS con tu Public Key
(function() {
    emailjs.init('RRR4M2sCr-NgEf8ul');
})();

// Variables globales para control de elementos flotantes
let activeFloatingElement = null; // 'chatbot', 'gif' o 'contact'
let inactivityTimeout = null;
let gifWindowTimeout = null;

// ========== CONTADOR DE VISITAS MEJORADO ========== //
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
      console.log('Visite récente détectée, non enregistrée');
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
      console.log('Visite enregistrée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la visite:', error);
    }
  },

  async registerVisitDev() {
    if (!this.shouldRegisterVisit()) return;
    
    try {
      if (!this.config.token) {
        const response = await fetch('womo-config.json');
        if (!response.ok) throw new Error('Fichier de configuration introuvable');
        const config = await response.json();
        this.config.token = config.github.token;
      }

      const visitData = {
        date: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent.slice(0, 120)
      };

      await this.addVisitComment(visitData);
      console.log('Visite enregistrée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la visite:', error.message);
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
          body: `📍 Nouvelle visite:\n` +
                `- Date: ${new Date().toLocaleString()}\n` +
                `- Depuis: ${visitData.device || visitData.userAgent?.slice(0, 50) || 'Appareil inconnu'}\n` +
                `- URL: ${visitData.url}\n` +
                `- Référence: ${visitData.referrer}`
        })
      }
    );

    if (!response.ok) throw new Error('Erreur dans l\'API GitHub');
  },

  getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablette";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "mobile";
    }
    return "ordinateur";
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

// ========== CÓDIGO COMPLETO DEL MODAL ========== //
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

    // 6. Agregar mensaje prefijado si se proporcionó
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
        mostrarNotificacion('Veuillez remplir tous les champs correctement', 'error');
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
        mostrarNotificacion('Message envoyé avec succès !', 'success');
    } catch (error) {
        console.error('Erreur avec EmailJS:', error);
        mostrarNotificacion('Utilisation d\'une méthode alternative...', 'warning');
        
        try {
            await enviarConFormSubmit(name, email, celular, message, datosJSON);
            mostrarNotificacion('Message envoyé par méthode alternative !', 'success');
        } catch (backupError) {
            console.error('Erreur avec la méthode alternative:', backupError);
            mostrarNotificacion('Erreur : Veuillez nous contacter par WhatsApp', 'error');
            return;
        }
    }

    limpiarFormulario();
    closeContactPopup();
}

function crearTextoPlano(name, email, phone, message) {
    return `
== NOUVEAU CONTACT WOMO STUDIO ==
Nom: ${name}
Email: ${email}
Téléphone: ${phone}
Message: ${message}
Date: ${new Date().toLocaleString()}
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
        subject: `[WOMO] Contact: ${name}`,
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
        throw new Error('Erreur dans FormSubmit');
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

// ========== CHATBOT Y GIF INTERACTIVO ========== //
const chatbotConfig = {
    greetings: [
        "Bonjour ! Je suis WoMi, votre consultant en automatisation stratégique. 😊 Comment puis-je vous aider aujourd'hui avec l'optimisation de vos processus ?",
        "Bonjour, je suis WoMi de WoMo Soluciónˢ. Spécialistes dans la transformation des défis opérationnels en efficacité mesurable. Quel processus vous prend le plus de temps actuellement ?",
        "Bonjour ! 👋 WoMo Soluciónˢ ici. Nous automatisons les processus avec des résultats tangibles. Quel domaine de votre opération a besoin de plus d'efficacité ?"
    ],
    responses: {
        "bonjour": {
            messages: [
                "Bonjour ! 👋 Je suis WoMi, votre expert en automatisation de WoMo Soluciónˢ.",
                "Nous travaillons avec des entreprises comme la vôtre pour :",
                "• Récupérer des heures précieuses de travail",
                "• Minimiser les erreurs opérationnelles",
                "• Optimiser l'utilisation de vos ressources",
                "",
                "Quel type de processus génère le plus d'inefficacités actuellement ?"
            ],
            quickReplies: ["service", "temps", "Contact", "Parler avec consultant"]
        },
        "service": {
            messages: [
                "🚀 Notre approche professionnelle :",
                "",
                "1. <strong>Analyse des Processus</strong> : Évaluation détaillée de vos opérations (service avec coût)",
                "",
                "2. <strong>Proposition de Solution</strong> : Plan personnalisé avec des KPI clairs",
                "",
                "3. <strong>Implémentation Garantie</strong> : Déploiement avec accompagnement complet",
                "",
                "4. <strong>Mesure des Résultats</strong> : Rapports périodiques des améliorations",
                "",
                "Voulez-vous connaître notre processus avec un exemple réel d'implémentation ?"
            ],
            quickReplies: ["Voir cas de succès", "Coûts initiaux", "Délais estimés", "Contacter équipe"]
        },
        "temps": {
            messages: [
                "⏱️ Nos implémentations impactent typiquement :",
                "",
                "• Réduction significative des temps d'exécution",
                "• Élimination des étapes manuelles redondantes",
                "• Flux de travail optimisés de bout en bout",
                "",
                "Exemple réel : Un client dans votre secteur a réduit le temps de traitement des documents de 3 jours à quelques heures.",
                "",
                "Voulez-vous analyser comment nous appliquerions cela à vos opérations ?"
            ],
            quickReplies: ["Analyser mon cas", "Voir démonstration", "Demander à expert", "Demander proposition"]
        },
        "contact": {
            messages: [
                "📅 Planifiez une session stratégique avec notre équipe :",
                "",
                "Disponibilité pour les réunions initiales :",
                "• Lundi à vendredi : 9h - 18h",
                "• Nécessite des informations préalables",
                "",
                "Nous vous montrerons exactement comment nous pouvons optimiser vos opérations"
            ],
            actions: [{
                type: "button",
                text: "📝 Planifier Session Initiale",
                action: "showExpertCalendar()"
            }]
        },
        "prix": {
            messages: [
                "💰 Modèle d'investissement basé sur les résultats :",
                "",
                "Nos WoMo Solutions sont structurées en phases :",
                "",
                "1. <strong>Évaluation Initiale</strong> : $X (applicable à l'implémentation)",
                "2. <strong>Développement de Solution</strong> : À partir de $Y (selon complexité)",
                "3. <strong>Maintenance</strong> : Optionnelle avec reporting mensuel",
                "",
                "92% de nos clients récupèrent leur investissement dans les 3 premiers mois.",
                "",
                "Préférez-vous que nous vous envoyions des exemples spécifiques de votre industrie ?"
            ],
            quickReplies: ["Voir cas similaires", "Processus détaillé", "WhatsApp exécutif", "Documentation technique"]
        },
        "merci": {
            messages: [
                "Merci d'envisager une solution professionnelle. 🚀",
                "Quand vous serez prêt à transformer vos opérations avec des métriques claires, nous serons là."
            ],
            quickReplies: ["Matériel supplémentaire", "Équipe consultante", "LinkedIn"]
        },
        "au revoir": {
            messages: [
                "Ce fut un plaisir de vous assister ! ⚡",
                "Rappelez-vous : L'automatisation stratégique peut être votre avantage concurrentiel.",
                "Succès dans vos opérations !"
            ],
            quickReplies: []
        },
        "default": {
            messages: [
                "Je comprends votre demande. Permettez-moi de mieux contextualiser :",
                "",
                "Chez WoMo Soluciónˢ, nous n'offrons pas de solutions génériques.",
                "Pour vous donner une réponse précise, j'aurais besoin de connaître :",
                "• Vos volumes opérationnels actuels",
                "• Les goulots d'étranglement identifiés",
                "• Vos objectifs stratégiques",
                "",
                "Voulez-vous programmer une session initiale avec notre équipe ?"
            ],
            quickReplies: ["Programmer session", "Envoyer information", "Question spécifique", "Cas pertinents"]
        }
    },
    leadForms: {
        "conseil": {
            title: "Session Stratégique Initiale",
            description: "Complétez ces informations pour que notre équipe se prépare adéquatement pour votre cas",
            fields: [
                { 
                    name: "nom", 
                    placeholder: "Nom complet", 
                    type: "text", 
                    required: true,
                    validation: "Vous devez entrer votre nom complet"
                },
                { 
                    name: "entreprise", 
                    placeholder: "Nom de votre entreprise", 
                    type: "text", 
                    required: true 
                },
                { 
                    name: "email", 
                    placeholder: "Email professionnel", 
                    type: "email", 
                    required: true,
                    validation: "Veuillez entrer un email valide"
                },
                { 
                    name: "telephone", 
                    placeholder: "WhatsApp pour contact", 
                    type: "tel", 
                    required: true 
                },
                { 
                    name: "processus", 
                    placeholder: "Décrivez-nous votre principal défi opérationnel", 
                    type: "textarea", 
                    required: false,
                    helperText: "Ex: Gestion manuelle des factures, approbations lentes, etc."
                },
                { 
                    name: "employes", 
                    placeholder: "Nombre approximatif d'employés", 
                    type: "select",
                    options: ["1-10", "11-50", "51-200", "200+"],
                    required: true
                }
            ],
            submitText: "Demander une Session Stratégique",
            successMessage: "✅ Parfait ! Nous avons reçu vos informations. Un consultant senior vous contactera dans les prochaines 24 heures pour coordonner la session stratégique. Souhaitez-vous recevoir entre-temps notre dossier de cas de succès dans votre industrie ?",
            successActions: [
                {
                    text: "Recevoir Dossier",
                    action: "sendDossier()"
                },
                {
                    text: "Voir Vidéo Explicative",
                    action: "showVideo('intro')"
                }
            ]
        }
    },
    farewells: [
        "Merci pour votre intérêt dans des solutions professionnelles. Nous sommes là quand vous déciderez d'optimiser vos opérations.",
        "Ce fut un plaisir de discuter. Rappelez-vous que l'efficacité opérationnelle est la base d'une croissance durable.",
        "À bientôt ! Quand vous aurez besoin de transformer des défis en résultats, vous nous trouverez ici."
    ],
    fallbackStrategy: {
        unknownQuery: [
            "Question intéressante. Pour vous donner une réponse précise, j'aurais besoin de mieux comprendre votre contexte opérationnel.",
            "Voulez-vous que nous connectons cette demande avec l'un de nos spécialistes ?"
        ],
        technicalQuestion: [
            "Ceci est une demande technique spécifique. Permettez-moi de vous orienter vers notre équipe d'ingénierie.",
            "Un expert vous contactera avec les informations détaillées dont vous avez besoin."
        ],
        pricingQuery: [
            "Je comprends que vous avez besoin de clarté financière. Pour vous donner des chiffres exacts, nous devons d'abord évaluer :",
            "1. La complexité de vos processus actuels",
            "2. Le volume opérationnel",
            "3. Les résultats attendus",
            "Voulez-vous que nous programmions une brève session pour analyser cela ?"
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
        showQuickReplies(chatbotConfig.responses["bonjour"].quickReplies);
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
        if (lowerInput.includes('merci') || lowerInput.includes('thank')) {
            const randomResponse = chatbotConfig.responses["merci"].messages;
            randomResponse.forEach(msg => addBotMessage(msg));
            showQuickReplies(chatbotConfig.responses["merci"].quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('au revoir') || lowerInput.includes('à bientôt') || lowerInput.includes('bye')) {
            const randomFarewell = chatbotConfig.farewells[Math.floor(Math.random() * chatbotConfig.farewells.length)];
            addBotMessage(randomFarewell);
            responseFound = true;
        }
        else if (lowerInput.includes('bonjour') || lowerInput.includes('salut') || lowerInput.includes('hi')) {
            const response = chatbotConfig.responses["bonjour"];
            response.messages.forEach(msg => addBotMessage(msg));
            showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('service') || lowerInput.includes('que faites-vous') || lowerInput.includes('que proposez-vous')) {
            const response = chatbotConfig.responses["service"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.quickReplies) showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('temps') || lowerInput.includes('rapide') || lowerInput.includes('lent')) {
            const response = chatbotConfig.responses["temps"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.quickReplies) showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('contact') || lowerInput.includes('parler') || lowerInput.includes('appeler')) {
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
        else if (lowerInput.includes('prix') || lowerInput.includes('coût') || lowerInput.includes('combien ça coûte')) {
            const response = chatbotConfig.responses["prix"];
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
        addBotMessage("Veuillez remplir tous les champs requis.");
        return;
    }
    
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        form.remove();
        
        addBotMessage(chatbotConfig.leadForms[formType].successMessage);
        
        if (formType === 'conseil') {
            showQuickReplies(["Voir cas similaire", "Comment me préparer", "Merci"]);
        }
        
        sendLeadDataToBackend(formData, formType);
    }, 2000);
}

function sendLeadDataToBackend(data, formType) {
    const textoPlano = `
== NOUVEAU LEAD DU CHATBOT ==
Type: ${formType}
Nom: ${data.nom || 'Non fourni'}
Email: ${data.email || 'Non fourni'}
Téléphone: ${data.telephone || 'Non fourni'}
Message: ${data.besoin || 'Demande depuis chatbot'}
Date: ${new Date().toLocaleString()}
==============================================
`;

    const datosJSON = {
        fecha: new Date().toISOString(),
        origen: "chatbot",
        tipo_formulario: formType,
        contacto: {
            nombre: data.nom || null,
            email: data.email || null,
            telefono: data.telephone || null
        },
        message: data.besoin || 'Demande depuis chatbot',
        metadata: {
            pagina: window.location.href,
            userAgent: navigator.userAgent,
            interacciones: document.getElementById('chatbot-messages').children.length
        }
    };

    emailjs.send('service_42rjl6k', 'template_iszllup', {
        from_name: data.nom || 'Utilisateur Chatbot',
        from_email: data.email || 'no-email@chatbot.com',
        from_phone: data.telephone || '',
        message: textoPlano,
        reply_to: data.email || 'womostd@gmail.com',
        subject: `[WOMO] Lead Chatbot: ${formType} - ${data.nom || 'Anonyme'}`,
        datos_json: JSON.stringify(datosJSON, null, 2)
    })
    .then(response => {
        console.log('Email envoyé !', response.status, response.text);
    })
    .catch(error => {
        console.error('Erreur lors de l\'envoi:', error);
        sendWithFormSubmit(data, formType);
    });
}

function sendWithFormSubmit(data, formType) {
    const datosJSON = {
        fecha: new Date().toISOString(),
        origen: "chatbot",
        tipo_formulario: formType,
        contacto: {
            nom: data.nom || null,
            email: data.email || null,
            telephone: data.telephone || null
        },
        message: data.besoin || 'Demande depuis chatbot',
        metadata: {
            pagina: window.location.href,
            userAgent: navigator.userAgent
        }
    };

    const formData = new FormData();
    formData.append('nom', data.nom || '');
    formData.append('email', data.email || '');
    formData.append('telephone', data.telephone || '');
    formData.append('message', data.besoin || 'Demande depuis chatbot');
    formData.append('metadata', JSON.stringify(datosJSON));
    formData.append('_subject', `[Chatbot] ${formType} - ${data.nom || 'Anonyme'}`);
    
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

// Configuración del asistente flotante WoMi
const inactivityConfig = {
    timeout: 15000, // 15 segundos para mostrar el popup
    messages: [
        "Besoin d'aide pour optimiser vos processus ?",
        "Bonjour ! Prêt à transformer votre productivité ? Nous avons la solution idéale pour vous.",
        "Voudriez-vous savoir comment automatiser vos opérations ?",
        "Transformez vos processus manuels en systèmes automatiques. Parlons-en ?",
        "J'adorerais vous montrer comment nous pouvons vous aider !"
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
            <h3>Quel problème devez-vous résoudre ?</h3>
            <button class="close-gif-window" onclick="closeGifWindow()">×</button>
        </div>
        <div class="gif-window-body">
            <div class="gif-window-grid">
                <!-- ProTrack -->
                <button class="gif-option-btn" onclick="handleGifOption('Coordination de processus manuels')">
                    <strong>⚙️ Processus désorganisés</strong><br>
                    <small>Système modulaire de gestion</small>
                </button>

                <!-- Unistock -->
                <button class="gif-option-btn" onclick="handleGifOption('Contrôle d\'inventaire imprécis')">
                    <strong>📦 Stock non fiable</strong><br>
                    <small>Alertes automatiques d'inventaire</small>
                </button>

                <!-- PortiFy -->
                <button class="gif-option-btn" onclick="handleGifOption('Suivi de projets/clients')">
                    <strong>📊 Information fragmentée</strong><br>
                    <small>CRM visuel pour portefeuilles</small>
                </button>

                <!-- PCAF -->
                <button class="gif-option-btn" onclick="handleGifOption('Gestion de clients/membres')">
                    <strong>🏋️ Registres manuels</strong><br>
                    <small>Système intégré de contrôle</small>
                </button>

                <!-- Messungen -->
                <button class="gif-option-btn" onclick="handleGifOption('Suivi de progrès physique')">
                    <strong>📏 Mesures non systématisées</strong><br>
                    <small>Historique numérisé</small>
                </button>

                <!-- PocketFlow -->
                <button class="gif-option-btn" onclick="handleGifOption('Organisation des finances')">
                    <strong>💰 Dépenses non catégorisées</strong><br>
                    <small>Contrôle financier personnalisé</small>
                </button>
            </div>
            <button class="gif-option-btn no-thanks" onclick="handleNoThanks()">
                Pas maintenant, merci
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
    showWoMoBubble("Compris ! 😊 Je serai là si vous avez besoin de moi.");
    
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
        case 'Tâches répétitives qui prennent beaucoup de temps':
            botResponse = "Je comprends que vous voulez optimiser les processus manuels. Pourriez-vous me dire quel type de tâches il s'agit ? Par exemple :\n1. Traitement des commandes\n2. Facturation\n3. Rapports mensuels\n4. Autre (précisez)";
            break;
        case 'Erreurs dans l\'inventaire qui génèrent des pertes':
            botResponse = "Le contrôle des stocks est crucial. Quels problèmes spécifiques avez-vous ?\n1. Stock inexact\n2. Pertes non identifiées\n3. Achats inutiles\n4. Autre (décrivez)";
            break;
        case 'Clients insatisfaits par une mauvaise communication':
            botResponse = "La communication avec les clients est essentielle. Quel domaine doit être amélioré ?\n1. Réponse aux demandes\n2. Suivi des ventes\n3. Rappels de paiement\n4. Autre (lequel)";
            break;
        default:
            botResponse = "Dites-m'en plus sur ce défi pour vous donner une solution précise.";
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
    gif.src = '../img/WoMi1.webp';
    
    // Precargar el icono del chatbot
    const chatbotIconImg = new Image();
    chatbotIconImg.src = '../img/womi.webp';
    
    // Precargar el logo de WhatsApp
    const whatsappImg = new Image();
    whatsappImg.src = '../img/wp.webp';
    
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
        title: "Transformation du Temps",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #10B981; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Nous transformons les heures en minutes</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Clients satisfaits, temps optimisé</p>
                
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
                        Optimisation notable des processus.
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #10B981; font-weight: bold;">•</span> 
                        Dites adieu aux tâches manuelles et répétitives
                    </li>
                </ul>
            </div>
        `
    },
    workflow: {
        title: "Automatisation Intelligente",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #2563EB; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Automatisation flexible</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Boostez vos processus internes</p>
                
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
                        Solution indépendante et autonome
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #2563EB; font-weight: bold;">•</span> 
                        S'adapte à vos processus spécifiques
                    </li>
                </ul>
            </div>
        `
    },
    profit: {
        title: "Efficacité qui Génère de la Valeur",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #7C3AED; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Optimisation Financière Intelligente</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Transformez votre efficacité en résultats</p>
                
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
                        Amélioration durable de votre rentabilité
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #7C3AED; font-weight: bold;">•</span> 
                        Gestion plus efficace de vos ressources
                    </li>
                </ul>
            </div>
        `
    },
    analytics: {
        title: "Intelligence Stratégique",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #F59E0B; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Prenez de l'avance</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Découvrez des modèles avant la concurrence</p>
                
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
                        Prévisions fiables et actionnables
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #F59E0B; font-weight: bold;">•</span> 
                        Détection précoce d'opportunités clés
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
        "shortDesc": "Plateforme modulaire universelle de gestion des processus",
        "fullDesc": "C'est le moteur qui transforme le chaos opérationnel en flux automatisés haute performance. Pour les leaders qui exigent l'excellence dans chaque processus.",
        "icon": "⚙️",
        "image": "../proyectos/imagen3.webp"
    },{ "id": 2,
        "title": "Unistock",
        "shortDesc": "Système propriétaire de gestion des stocks",
        "fullDesc": "C'est le cerveau logistique qui anticipe les pénuries, optimise les achats et transforme les stocks en flux de trésorerie. Pour les entreprises qui ne tolèrent pas les erreurs.",
        "icon": "📦",
        "image": "../proyectos/imagen2.webp"
    },{ "id": 3,
        "title": "PortiFy",
        "shortDesc": "CRM spécialisé dans les portefeuilles technologiques",
        "fullDesc": "Transformez votre portefeuille en arme commerciale : convertissez des projets techniques en récits irrésistibles pour des clients exigeants.",
        "icon": "📊",
        "image": "../proyectos/imagen6.webp"
    },{ "id": 4,
        "title": "PCAF",
        "shortDesc": "Système de gestion pour salles de sport",
        "fullDesc": "Le système qui fait sentir à vos clients qu'ils s'entraînent dans une salle de sport de luxe : progrès mesurable instantanément et communication exclusive. L'outil secret pour retenir 3 fois plus.",
        "icon": "🏋️",
        "image": "../proyectos/imagen1.webp"
    },{ "id": 5,
        "title": "Messungen",
        "shortDesc": "Suivi des progrès physiques",
        "fullDesc": "Système qui relie les entraînements aux résultats : enregistre les mesures, corrèle les routines et démontre l'impact tangible de votre méthodologie. La preuve que votre travail transforme.",
        "icon": "📏",
        "image": "../proyectos/imagen4.webp"
    },{ "id": 6,
        "title": "PocketFlow",
        "shortDesc": "Gestion financière personnelle",
        "fullDesc": "C'est le contrôle financier personnel intelligent : prenez le contrôle de votre argent avec clarté et précision professionnelle.",
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
        <button class="popup-btn" onclick="requestProject(${project.id})">Je le prends... </button>
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
    const projectText = `Je suis intéressé par le projet ${project.title}. `;
    
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
        <button class="popup-btn" onclick="requestProject(${project.id})">Je le prends... </button>
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