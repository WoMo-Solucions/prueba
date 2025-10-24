// Inicializar EmailJS con tu Public Key
(function() {
    // emailjs.init removido
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
      console.log('Visita reciente detectada, no se registra');
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
      console.log('Visita registrada exitosamente');
    } catch (error) {
      console.error('Error registrando visita:', error);
    }
  },

  async registerVisitDev() {
    if (!this.shouldRegisterVisit()) return;
    
    try {
      if (!this.config.token) {
        const response = await fetch('womo-config.json');
        if (!response.ok) throw new Error('Archivo de configuración no encontrado');
        const config = await response.json();
        this.config.token = config.github.token;
      }

      const visitData = {
        date: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent.slice(0, 120)
      };

      await this.addVisitComment(visitData);
      console.log('Visita registrada exitosamente');
    } catch (error) {
      console.error('Error registrando visita:', error.message);
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
          body: `📍 Nueva visita:\n` +
                `- Fecha: ${new Date().toLocaleString()}\n` +
                `- Desde: ${visitData.device || visitData.userAgent?.slice(0, 50) || 'Dispositivo desconocido'}\n` +
                `- URL: ${visitData.url}\n` +
                `- Referencia: ${visitData.referrer}`
        })
      }
    );

    if (!response.ok) throw new Error('Error en la API de GitHub');
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
        mostrarNotificacion('Por favor complete todos los campos correctamente', 'error');
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
        mostrarNotificacion('¡Mensaje enviado con éxito!', 'success');
    } catch (error) {
        console.error('Error con EmailJS:', error);
        mostrarNotificacion('Usando método alternativo...', 'warning');
        
        try {
            await enviarConFormSubmit(name, email, celular, message, datosJSON);
            mostrarNotificacion('¡Mensaje enviado por método alternativo!', 'success');
        } catch (backupError) {
            console.error('Error con método alternativo:', backupError);
            mostrarNotificacion('Error: Por favor contáctenos por WhatsApp', 'error');
            return;
        }
    }

    limpiarFormulario();
    closeContactPopup();
}

function crearTextoPlano(name, email, phone, message) {
    return `
== NUEVO CONTACTO WOMO STUDIO ==
Nombre: ${name}
Email: ${email}
Teléfono: ${phone}
Mensaje: ${message}
Fecha: ${new Date().toLocaleString()}
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
    return n8nIntegration.sendLead(formData).catch(console.error);
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
        throw new Error('Error en FormSubmit');
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
        "¡Hola! Soy WoMi, tu consultor en automatización estratégica. 😊 ¿En qué puedo ayudarte hoy con la optimización de tus procesos?",
        "Hola, soy WoMi de WoMo Soluciónˢ. Especialistas en transformar desafíos operativos en eficiencia medible. ¿Qué proceso te está quitando más tiempo actualmente?",
        "¡Hola! 👋 WoMo Soluciónˢ aquí. Automatizamos procesos con resultados tangibles. ¿Qué área de tu operación necesita mayor eficiencia?"
    ],
    responses: {
        "hola": {
            messages: [
                "¡Hola! 👋 Soy WoMi, tu experto en automatización de WoMo Soluciónˢ.",
                "Trabajamos con negocios como el tuyo para:",
                "• Recuperar horas valiosas de trabajo",
                "• Minimizar errores operativos",
                "• Optimizar el uso de tus recursos",
                "",
                "¿Qué tipo de procesos te generan más ineficiencias actualmente?"
            ],
            quickReplies: ["servicio", "tiempo", "Contacto", "Hablar con consultor"]
        },
        "servicio": {
            messages: [
                "🚀 Nuestro enfoque profesional:",
                "",
                "1. <strong>Análisis de Procesos</strong>: Evaluación detallada de tus operaciones (servicio con costo)",
                "",
                "2. <strong>Propuesta de Solución</strong>: Plan personalizado con KPIs claros",
                "",
                "3. <strong>Implementación Garantizada</strong>: Despliegue con acompañamiento completo",
                "",
                "4. <strong>Medición de Resultados</strong>: Reportes periódicos de mejoras",
                "",
                "¿Quieres conocer nuestro proceso con un ejemplo real de implementación?"
            ],
            quickReplies: ["Ver caso de éxito", "Costos iniciales", "Tiempos estimados", "Contactar equipo"]
        },
        "tiempo": {
            messages: [
                "⏱️ Nuestras implementaciones típicamente impactan:",
                "",
                "• Reducción significativa en tiempos de ejecución",
                "• Eliminación de pasos manuales redundantes",
                "• Flujos de trabajo optimizados de extremo a extremo",
                "",
                "Ejemplo real: Un cliente en tu sector logró reducir el tiempo de procesamiento de documentos de 3 días a pocas horas.",
                "",
                "¿Quieres analizar cómo aplicaríamos esto a tus operaciones?"
            ],
            quickReplies: ["Analizar mi caso", "Ver demostración", "Preguntar a experto", "Solicitar propuesta"]
        },
        "contacto": {
            messages: [
                "📅 Agenda una sesión estratégica con nuestro equipo:",
                "",
                "Disponibilidad para reuniones iniciales:",
                "• Lunes a viernes: 9am - 6pm",
                "• Requiere información previa",
                "",
                "Te mostraremos exactamente cómo podemos optimizar tus operaciones"
            ],
            actions: [{
                type: "button",
                text: "📝 Agendar Sesión Inicial",
                action: "showExpertCalendar()"
            }]
        },
		
        "precio": {
            messages: [
                "💰 Modelo de inversión basado en resultados:",
                "",
                "Nuestros WoMo Soluciones se estructuran en fases:",
                "",
                "1. <strong>Evaluación Inicial</strong>: $X (aplicable a implementación)",
                "2. <strong>Desarrollo de Solución</strong>: Desde $Y (según complejidad)",
                "3. <strong>Mantenimiento</strong>: Opcional con reporting mensual",
                "",
                "El 92% de nuestros clientes recuperan su inversión en los primeros 3 meses.",
                "",
                "¿Prefieres que te enviemos ejemplos específicos de tu industria?"
            ],
            quickReplies: ["Ver casos similares", "Proceso detallado", "WhatsApp ejecutivo", "Documentación técnica"]
        },
        "gracias": {
            messages: [
                "Gracias por considerar una solución profesional. 🚀",
                "Cuando estés listo para transformar tus operaciones con métricas claras, aquí estaremos."
            ],
            quickReplies: ["Material adicional", "Equipo consultor", "LinkedIn"]
        },
        "adios": {
            messages: [
                "¡Fue un gusto asistirte! ⚡",
                "Recuerda: La automatización estratégica puede ser tu ventaja competitiva.",
                "¡Éxito en tus operaciones!"
            ],
            quickReplies: []
        },
        "default": {
            messages: [
                "Entiendo tu consulta. Permíteme contextualizar mejor:",
                "",
                "En WoMo Soluciónˢ no ofrecemos soluciones genéricas.",
                "Para darte una respuesta precisa, necesitaría conocer más sobre:",
                "• Tus volúmenes operativos actuales",
                "• Los cuellos de botella identificados",
                "• Tus objetivos estratégicos",
                "",
                "¿Quieres programar una sesión inicial con nuestro equipo?"
            ],
            quickReplies: ["Programar sesión", "Enviar información", "Pregunta específica", "Casos relevantes"]
        }
    },
    leadForms: {
        "asesoria": {
            title: "Sesión Estratégica Inicial",
            description: "Completa esta información para que nuestro equipo se prepare adecuadamente para tu caso",
            fields: [
                { 
                    name: "nombre", 
                    placeholder: "Nombre completo", 
                    type: "text", 
                    required: true,
                    validation: "Debes ingresar tu nombre completo"
                },
                { 
                    name: "empresa", 
                    placeholder: "Nombre de tu empresa", 
                    type: "text", 
                    required: true 
                },
                { 
                    name: "email", 
                    placeholder: "Email corporativo", 
                    type: "email", 
                    required: true,
                    validation: "Por favor ingresa un email válido"
                },
                { 
                    name: "telefono", 
                    placeholder: "WhatsApp para contacto", 
                    type: "tel", 
                    required: true 
                },
                { 
                    name: "proceso", 
                    placeholder: "Descríbenos tu principal desafío operativo", 
                    type: "textarea", 
                    required: false,
                    helperText: "Ej: Gestión manual de facturas, aprobaciones lentas, etc."
                },
                { 
                    name: "empleados", 
                    placeholder: "Número aproximado de empleados", 
                    type: "select",
                    options: ["1-10", "11-50", "51-200", "200+"],
                    required: true
                }
            ],
            submitText: "Solicitar Sesión Estratégica",
            successMessage: "✅ ¡Perfecto! Hemos recibido tu información. Un consultor senior se contactará contigo en las próximas 24 horas para coordinar la sesión estratégica. ¿Te gustaría recibir mientras tanto nuestro dossier de casos de éxito en tu industria?",
            successActions: [
                {
                    text: "Recibir Dossier",
                    action: "sendDossier()"
                },
                {
                    text: "Ver Video Explicativo",
                    action: "showVideo('intro')"
                }
            ]
        }
    },
    farewells: [
        "Gracias por tu interés en soluciones profesionales. Estamos aquí cuando decidas optimizar tus operaciones.",
        "Fue un gusto conversar. Recuerda que la eficiencia operativa es la base del crecimiento sostenible.",
        "¡Hasta pronto! Cuando necesites transformar desafíos en resultados, aquí nos encontrarás."
    ],
    fallbackStrategy: {
        unknownQuery: [
            "Interesante pregunta. Para darte una respuesta precisa, necesitaría entender mejor tu contexto operativo.",
            "¿Te gustaría que conectemos esta consulta con uno de nuestros especialistas?"
        ],
        technicalQuestion: [
            "Esta es una consulta técnica específica. Permíteme derivarte con nuestro equipo de ingeniería.",
            "Un experto te contactará con la información detallada que necesitas."
        ],
        pricingQuery: [
            "Entiendo que necesitas claridad financiera. Para darte números exactos, primero debemos evaluar:",
            "1. La complejidad de tus procesos actuales",
            "2. El volumen operativo",
            "3. Los resultados esperados",
            "¿Quieres que programemos una breve sesión para analizar esto?"
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
        addBotMessage("Por favor completa todos los campos requeridos.");
        return;
    }
    
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        form.remove();
        
        addBotMessage(chatbotConfig.leadForms[formType].successMessage);
        
        if (formType === 'consultoria') {
            showQuickReplies(["Ver caso similar", "Cómo prepararme", "Gracias"]);
        }
        
        sendLeadDataToBackend(formData, formType);
    }, 2000);
}

function sendLeadDataToBackend(data, formType) {
    const textoPlano = `
== NUEVO LEAD DEL CHATBOT ==
Tipo: ${formType}
Nombre: ${data.nombre || 'No proporcionado'}
Email: ${data.email || 'No proporcionado'}
Teléfono: ${data.telefono || 'No proporcionado'}
Mensaje: ${data.necesidad || 'Consulta desde chatbot'}
Fecha: ${new Date().toLocaleString()}
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
        mensaje: data.necesidad || 'Consulta desde chatbot',
        metadata: {
            pagina: window.location.href,
            userAgent: navigator.userAgent,
            interacciones: document.getElementById('chatbot-messages').children.length
        }
    };

    n8nIntegration.sendLead(formData).catch(console.error);
    })
    .catch(error => {
        console.error('Error al enviar:', error);
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
        mensaje: data.necesidad || 'Consulta desde chatbot',
        metadata: {
            pagina: window.location.href,
            userAgent: navigator.userAgent
        }
    };

    const formData = new FormData();
    formData.append('nombre', data.nombre || '');
    formData.append('email', data.email || '');
    formData.append('telefono', data.telefono || '');
    formData.append('mensaje', data.necesidad || 'Consulta desde chatbot');
    formData.append('metadata', JSON.stringify(datosJSON));
    formData.append('_subject', `[Chatbot] ${formType} - ${data.nombre || 'Anónimo'}`);
    
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
        "¿Necesitas ayuda para optimizar tus procesos?",
        "¡Hola! ¿Listo para transformar tu productividad? Tenemos la solución ideal para ti.",
        "¿Te gustaría saber cómo automatizar tus operaciones?",
        "Transforma tus procesos manuales en sistemas automáticos. ¿Hablamos?",
        "¡Me encantaría mostrarte cómo podemos ayudarte!"
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
            <h3>¿Qué problema necesitas resolver?</h3>
            <button class="close-gif-window" onclick="closeGifWindow()">×</button>
        </div>
        <div class="gif-window-body">
            <div class="gif-window-grid">
                <!-- ProTrack -->
                <button class="gif-option-btn" onclick="handleGifOption('Coordinación de procesos manuales')">
                    <strong>⚙️ Procesos desorganizados</strong><br>
                    <small>Sistema modular de gestión</small>
                </button>

                <!-- Unistock -->
                <button class="gif-option-btn" onclick="handleGifOption('Control de inventario impreciso')">
                    <strong>📦 Stock no confiable</strong><br>
                    <small>Alertas automáticas de inventario</small>
                </button>

                <!-- PortiFy -->
                <button class="gif-option-btn" onclick="handleGifOption('Seguimiento de proyectos/clientes')">
                    <strong>📊 Información fragmentada</strong><br>
                    <small>CRM visual para portafolios</small>
                </button>

                <!-- PCAF -->
                <button class="gif-option-btn" onclick="handleGifOption('Gestión de clientes/membresías')">
                    <strong>🏋️ Registros manuales</strong><br>
                    <small>Sistema integrado de control</small>
                </button>

                <!-- Messungen -->
                <button class="gif-option-btn" onclick="handleGifOption('Seguimiento de progreso físico')">
                    <strong>📏 Mediciones no sistematizadas</strong><br>
                    <small>Historial digitalizado</small>
                </button>

                <!-- PocketFlow -->
                <button class="gif-option-btn" onclick="handleGifOption('Organización de finanzas')">
                    <strong>💰 Gastos no categorizados</strong><br>
                    <small>Control financiero personalizado</small>
                </button>
            </div>
            <button class="gif-option-btn no-thanks" onclick="handleNoThanks()">
                Ahora no, gracias
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
    showWoMoBubble("¡Entendido! 😊 Estaré por aquí si me necesitas.");
    
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
            botResponse = "Entiendo que quieres optimizar procesos manuales. ¿Podrías decirme qué tipo de tareas son? Por ejemplo:\n1. Procesamiento de pedidos\n2. Facturación\n3. Reportes mensuales\n4. Otra (especificar)";
            break;
        case 'Errores en inventario que generan pérdidas':
            botResponse = "El control de inventario es crucial. ¿Qué problemas específicos tienes?\n1. Stock inexacto\n2. Pérdidas no identificadas\n3. Compras innecesarias\n4. Otro (describir)";
            break;
        case 'Clientes insatisfechos por mala comunicación':
            botResponse = "La comunicación con clientes es clave. ¿Qué área necesita mejorar?\n1. Respuesta a consultas\n2. Seguimiento de ventas\n3. Recordatorios de pagos\n4. Otro (cuál)";
            break;
        default:
            botResponse = "Cuéntame más sobre este desafío para darte una solución precisa.";
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
        title: "Transformación de Tiempo",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #10B981; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Transformamos horas en minutos</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Clientes satisfechos, tiempo optimizado</p>
                
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
                        Optimización de los procesos de manera notable.
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #10B981; font-weight: bold;">•</span> 
                        Di adiós a las tareas manuales y repetitivas
                    </li>
                </ul>
            </div>
        `
    },
    workflow: {
        title: "Automatización Inteligente",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #2563EB; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Automatización flexible</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Potencia tus procesos internos</p>
                
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
                        Solución independiente y autónoma
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #2563EB; font-weight: bold;">•</span> 
                        Se adapta a tus procesos específicos
                    </li>
                </ul>
            </div>
        `
    },
    profit: {
        title: "Eficiencia que Genera Valor",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #7C3AED; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Optimización Financiera Inteligente</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Transforma tu eficiencia en resultados</p>
                
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
                        Mejora sostenible en tu rentabilidad
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #7C3AED; font-weight: bold;">•</span> 
                        Gestión más eficiente de tus recursos
                    </li>
                </ul>
            </div>
        `
    },
    analytics: {
        title: "Inteligencia Estratégica",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #F59E0B; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Toma la delantera</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Descubre patrones antes que la competencia</p>
                
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
                        Pronósticos confiables y accionables
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #F59E0B; font-weight: bold;">•</span> 
                        Detección temprana de oportunidades clave
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
        "shortDesc": "Plataforma modular universal de gestión de procesos",
        "fullDesc": "Es el motor que convierte el caos operativo en flujos automatizados de alto rendimiento. Para líderes que exigen excelencia en cada proceso.",
        "icon": "⚙️",
        "image": "proyectos/imagen3.webp"
    },{ "id": 2,
        "title": "Unistock",
        "shortDesc": "Sistema propietario de gestión de inventarios",
        "fullDesc": "Es el cerebro logístico que anticipa escasez, optimiza compras y convierte inventarios en flujo de caja. Para negocios que no toleran errores.",
        "icon": "📦",
        "image": "proyectos/imagen2.webp"
    },{ "id": 3,
        "title": "PortiFy",
        "shortDesc": "CRM especializado en portafolios tecnológicos",
        "fullDesc": "Sera tú portafolio como arma comercial: convierte proyectos técnicos en narrativas irresistibles para clientes exigentes.",
        "icon": "📊",
        "image": "proyectos/imagen6.webp"
    },{ "id": 4,
        "title": "PCAF",
        "shortDesc": "Sistema de gestión para gimnasios",
        "fullDesc": "El sistema que hace sentir a tus clientes que entrenan en un gimnasio de lujo: progreso medible al instante y comunicación exclusiva. La herramienta secreta para retener 3 veces más.",
        "icon": "🏋️",
        "image": "proyectos/imagen1.webp"
    },{ "id": 5,
        "title": "Messungen",
        "shortDesc": "Seguimiento del progreso físico",
        "fullDesc": "Sistema que vincula entrenamientos con resultados: registra mediciones, correlaciona rutinas y demuestra el impacto tangible de tu metodología. La prueba de que tu trabajo transforma.",
        "icon": "📏",
        "image": "proyectos/imagen4.webp"
    },{ "id": 6,
        "title": "PocketFlow",
        "shortDesc": "Gestión financiera personal",
        "fullDesc": "Es el control financiero personal inteligente: toma el mando de tu dinero con claridad y precisión profesional.",
        "icon": "💰",
        "image": "proyectos/imagen5.webp"
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
        <button class="popup-btn" onclick="requestProject(${project.id})">Me lo llevo... </button>
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
    const projectText = `Estoy interesado en el proyecto ${project.title}. `;
    
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
        <button class="popup-btn" onclick="requestProject(${project.id})">Me lo llevo... </button>
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