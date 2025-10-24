// Inicializar EmailJS con tu Public Key
(function() {
    emailjs.init('RRR4M2sCr-NgEf8ul');
})();

// Variables globales para control de elementos flotantes
let activeFloatingElement = null; // 'chatbot', 'gif' ou 'contact'
let inactivityTimeout = null;
let gifWindowTimeout = null;

// ========== CONTADOR DE VISITAS MELHORADO ========== //
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
      console.log('Visita recente detectada, não será registrada');
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
      console.log('Visita registrada com sucesso');
    } catch (error) {
      console.error('Erro ao registrar visita:', error);
    }
  },

  async registerVisitDev() {
    if (!this.shouldRegisterVisit()) return;
    
    try {
      if (!this.config.token) {
        const response = await fetch('womo-config.json');
        if (!response.ok) throw new Error('Arquivo de configuração não encontrado');
        const config = await response.json();
        this.config.token = config.github.token;
      }

      const visitData = {
        date: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent.slice(0, 120)
      };

      await this.addVisitComment(visitData);
      console.log('Visita registrada com sucesso');
    } catch (error) {
      console.error('Erro ao registrar visita:', error.message);
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
          body: `📍 Nova visita:\n` +
                `- Data: ${new Date().toLocaleString()}\n` +
                `- Dispositivo: ${visitData.device || visitData.userAgent?.slice(0, 50) || 'Dispositivo desconhecido'}\n` +
                `- URL: ${visitData.url}\n` +
                `- Referência: ${visitData.referrer}`
        })
      }
    );

    if (!response.ok) throw new Error('Erro na API do GitHub');
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

// Chamar a função adequada conforme o ambiente
setTimeout(() => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    visitCounter.registerVisitDev();
  } else {
    visitCounter.registerVisitSafe();
  }
}, 2000);

// Variáveis para o carrossel automático
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

// ========== CÓDIGO COMPLETO DO MODAL ========== //
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

// Controle do popup de contato lateral
function openContactPopup(prefilledMessage = '') {
    // 1. Fechar o chatbot se estiver aberto
    closeChatbot();
    
    // 2. Ocultar o ícone do chatbot imediatamente
    const chatbotIcon = document.querySelector('.chatbot-icon');
    if (chatbotIcon) {
        chatbotIcon.style.opacity = '0';
        chatbotIcon.style.pointerEvents = 'none';
        setTimeout(() => {
            chatbotIcon.style.display = 'none';
        }, 300);
    }
    
    // 3. Mostrar o popup de contato
    const contactPopup = document.getElementById('contact-popup');
    if (contactPopup) {
        contactPopup.classList.add('active');
    }
    
    // 4. Atualizar estado
    document.body.style.overflow = 'hidden';
    activeFloatingElement = 'contact';
    
    // 5. Garantir que o botão do WhatsApp seja clicável e visível
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

    // 6. NOVO CÓDIGO - Adicionar mensagem pré-definida se fornecida
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
    
    // Mostrar o ícone do chatbot apenas se não houver outros elementos ativos
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
    const nome = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const celular = document.getElementById('contact-celular').value.trim();
    const mensagem = document.getElementById('contact-message').value.trim();

    document.querySelectorAll('input, textarea').forEach(el => {
        el.style.borderColor = '#e2e8f0';
    });

    if (nome.length < 3) {
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

    if (mensagem.length < 10) {
        document.getElementById('contact-message').style.borderColor = '#EF4444';
        valido = false;
    }

    return valido;
}

async function sendContactRequest() {
    if (!validarCampos()) {
        mostrarNotificacao('Por favor preencha todos os campos corretamente', 'error');
        return;
    }

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const celular = document.getElementById('contact-celular').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    const textoPlano = criarTextoPlano(name, email, celular, message);
    const dadosJSON = criarDadosJSON(name, email, celular, message);

    try {
        await enviarComEmailJS(name, email, celular, textoPlano, dadosJSON);
        mostrarNotificacao('Mensagem enviada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro com EmailJS:', error);
        mostrarNotificacao('Usando método alternativo...', 'warning');
        
        try {
            await enviarComFormSubmit(name, email, celular, message, dadosJSON);
            mostrarNotificacao('Mensagem enviada por método alternativo!', 'success');
        } catch (backupError) {
            console.error('Erro com método alternativo:', backupError);
            mostrarNotificacao('Erro: Por favor entre em contato pelo WhatsApp', 'error');
            return;
        }
    }

    limparFormulario();
    closeContactPopup();
}

function criarTextoPlano(name, email, phone, message) {
    return `
== NOVO CONTATO WOMO STUDIO ==
Nome: ${name}
Email: ${email}
Telefone: ${phone}
Mensagem: ${message}
Data: ${new Date().toLocaleString()}
==============================================
`;
}

function criarDadosJSON(name, email, phone, message) {
    return {
        data: new Date().toISOString(),
        contato: {
            nome: name,
            email: email,
            telefone: phone
        },
        mensagem: message,
        metadata: {
            pagina: window.location.href,
            userAgent: navigator.userAgent
        }
    };
}

async function enviarComEmailJS(name, email, phone, textoPlano, dadosJSON) {
    return emailjs.send('service_42rjl6k', 'template_iszllup', {
        from_name: name,
        from_email: email,
        from_phone: phone,
        message: textoPlano,
        reply_to: email,
        subject: `[WOMO] Contato: ${name}`,
        dados_json: JSON.stringify(dadosJSON, null, 2)
    });
}

async function enviarComFormSubmit(name, email, phone, message, metadata) {
    const formData = new FormData();
    formData.append('nome', name);
    formData.append('email', email);
    formData.append('telefone', phone);
    formData.append('mensagem', message);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await fetch('https://formsubmit.co/ajax/womostd@gmail.com', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Erro no FormSubmit');
    }
}

function limparFormulario() {
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-celular').value = '';
    document.getElementById('contact-message').value = '';
}

function mostrarNotificacao(mensagem, tipo) {
    const notificacao = document.createElement('div');
    notificacao.className = `notification ${tipo}`;
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.remove();
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

// ========== CHATBOT E GIF INTERATIVO ========== //
const chatbotConfig = {
    greetings: [
        "Olá! Sou WoMi, seu consultor em automação estratégica. 😊 Como posso te ajudar hoje com a otimização dos seus processos?",
        "Oi, sou WoMi da WoMo Soluçãoˢ. Especialistas em transformar desafios operacionais em eficiência mensurável. Qual processo está tomando mais do seu tempo atualmente?",
        "Olá! 👋 WoMo Soluçãoˢ aqui. Automatizamos processos com resultados tangíveis. Qual área da sua operação precisa de mais eficiência?"
    ],
    responses: {
        "olá": {
            messages: [
                "Olá! 👋 Sou WoMi, seu especialista em automação da WoMo Soluçãoˢ.",
                "Trabalhamos com negócios como o seu para:",
                "• Recuperar horas valiosas de trabalho",
                "• Minimizar erros operacionais",
                "• Otimizar o uso dos seus recursos",
                "",
                "Que tipo de processos geram mais ineficiências para você atualmente?"
            ],
            quickReplies: ["serviço", "tempo", "Contato", "Falar com consultor"]
        },
        "serviço": {
            messages: [
                "🚀 Nossa abordagem profissional:",
                "",
                "1. <strong>Análise de Processos</strong>: Avaliação detalhada das suas operações (serviço com custo)",
                "",
                "2. <strong>Proposta de Solução</strong>: Plano personalizado com KPIs claros",
                "",
                "3. <strong>Implantação Garantida</strong>: Desdobramento com acompanhamento completo",
                "",
                "4. <strong>Medição de Resultados</strong>: Relatórios periódicos de melhorias",
                "",
                "Quer conhecer nosso processo com um exemplo real de implementação?"
            ],
            quickReplies: ["Ver caso de sucesso", "Custos iniciais", "Prazos estimados", "Contatar equipe"]
        },
        "tempo": {
            messages: [
                "⏱️ Nossas implantações tipicamente impactam:",
                "",
                "• Redução significativa nos tempos de execução",
                "• Eliminação de etapas manuais redundantes",
                "• Fluxos de trabalho otimizados de ponta a ponta",
                "",
                "Exemplo real: Um cliente do seu setor reduziu o tempo de processamento de documentos de 3 dias para poucas horas.",
                "",
                "Quer analisar como aplicaríamos isso às suas operações?"
            ],
            quickReplies: ["Analisar meu caso", "Ver demonstração", "Perguntar a especialista", "Solicitar proposta"]
        },
        "contato": {
            messages: [
                "📅 Agende uma sessão estratégica com nossa equipe:",
                "",
                "Disponibilidade para reuniões iniciais:",
                "• Segunda a sexta: 9h - 18h",
                "• Requer informações prévias",
                "",
                "Mostraremos exatamente como podemos otimizar suas operações"
            ],
            actions: [{
                type: "button",
                text: "📝 Agendar Sessão Inicial",
                action: "showExpertCalendar()"
            }]
        },
		
        "preço": {
            messages: [
                "💰 Modelo de investimento baseado em resultados:",
                "",
                "Nossas WoMo Soluções são estruturadas em fases:",
                "",
                "1. <strong>Avaliação Inicial</strong>: $X (aplicável à implantação)",
                "2. <strong>Desenvolvimento da Solução</strong>: A partir de $Y (segundo complexidade)",
                "3. <strong>Manutenção</strong>: Opcional com relatórios mensais",
                "",
                "92% dos nossos clientes recuperam seu investimento nos primeiros 3 meses.",
                "",
                "Prefere que enviemos exemplos específicos do seu setor?"
            ],
            quickReplies: ["Ver casos similares", "Processo detalhado", "WhatsApp executivo", "Documentação técnica"]
        },
        "obrigado": {
            messages: [
                "Obrigado por considerar uma solução profissional. 🚀",
                "Quando estiver pronto para transformar suas operações com métricas claras, estaremos aqui."
            ],
            quickReplies: ["Material adicional", "Equipe consultora", "LinkedIn"]
        },
        "adeus": {
            messages: [
                "Foi um prazer ajudar! ⚡",
                "Lembre-se: A automação estratégica pode ser sua vantagem competitiva.",
                "Sucesso nas suas operações!"
            ],
            quickReplies: []
        },
        "default": {
            messages: [
                "Entendo sua consulta. Permita-me contextualizar melhor:",
                "",
                "Na WoMo Soluçãoˢ não oferecemos soluções genéricas.",
                "Para dar uma resposta precisa, precisaria conhecer mais sobre:",
                "• Seus volumes operacionais atuais",
                "• Os gargalos identificados",
                "• Seus objetivos estratégicos",
                "",
                "Quer agendar uma sessão inicial com nossa equipe?"
            ],
            quickReplies: ["Agendar sessão", "Enviar informações", "Pergunta específica", "Casos relevantes"]
        }
    },
    leadForms: {
        "assessoria": {
            title: "Sessão Estratégica Inicial",
            description: "Complete esta informação para que nossa equipe se prepare adequadamente para o seu caso",
            fields: [
                { 
                    name: "nome", 
                    placeholder: "Nome completo", 
                    type: "text", 
                    required: true,
                    validation: "Você deve inserir seu nome completo"
                },
                { 
                    name: "empresa", 
                    placeholder: "Nome da sua empresa", 
                    type: "text", 
                    required: true 
                },
                { 
                    name: "email", 
                    placeholder: "Email corporativo", 
                    type: "email", 
                    required: true,
                    validation: "Por favor insira um email válido"
                },
                { 
                    name: "telefone", 
                    placeholder: "WhatsApp para contato", 
                    type: "tel", 
                    required: true 
                },
                { 
                    name: "processo", 
                    placeholder: "Descreva seu principal desafio operacional", 
                    type: "textarea", 
                    required: false,
                    helperText: "Ex: Gestão manual de faturas, aprovações lentas, etc."
                },
                { 
                    name: "funcionarios", 
                    placeholder: "Número aproximado de funcionários", 
                    type: "select",
                    options: ["1-10", "11-50", "51-200", "200+"],
                    required: true
                }
            ],
            submitText: "Solicitar Sessão Estratégica",
            successMessage: "✅ Perfeito! Recebemos suas informações. Um consultor sênior entrará em contato nas próximas 24 horas para coordenar a sessão estratégica. Gostaria de receber enquanto isso nosso dossiê de casos de sucesso no seu setor?",
            successActions: [
                {
                    text: "Receber Dossiê",
                    action: "sendDossier()"
                },
                {
                    text: "Ver Vídeo Explicativo",
                    action: "showVideo('intro')"
                }
            ]
        }
    },
    farewells: [
        "Obrigado pelo interesse em soluções profissionais. Estamos aqui quando decidir otimizar suas operações.",
        "Foi um prazer conversar. Lembre-se que a eficiência operacional é a base do crescimento sustentável.",
        "Até logo! Quando precisar transformar desafios em resultados, nos encontrará aqui."
    ],
    fallbackStrategy: {
        unknownQuery: [
            "Pergunta interessante. Para dar uma resposta precisa, precisaria entender melhor seu contexto operacional.",
            "Gostaria que conectássemos esta consulta com um de nossos especialistas?"
        ],
        technicalQuestion: [
            "Esta é uma consulta técnica específica. Permita-me encaminhá-lo para nossa equipe de engenharia.",
            "Um especialista entrará em contato com as informações detalhadas que você precisa."
        ],
        pricingQuery: [
            "Entendo que precisa de clareza financeira. Para dar números exatos, primeiro devemos avaliar:",
            "1. A complexidade dos seus processos atuais",
            "2. O volume operacional",
            "3. Os resultados esperados",
            "Quer que agendemos uma breve sessão para analisar isso?"
        ]
    }
};

// Variáveis do chatbot
let isTyping = false;
let currentLeadForm = null;

// Funções principais do chatbot
function toggleChatbot() {
    const chatbotWindow = document.getElementById('chatbot-window');
    
    if (chatbotWindow.classList.contains('active')) {
        closeChatbot();
    } else {
        openChatbot();
    }
}

function openChatbot() {
    // Fechar outros elementos flutuantes
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
        showQuickReplies(chatbotConfig.responses["olá"].quickReplies);
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
        
        // Verificar palavras-chave
        if (lowerInput.includes('obrigado') || lowerInput.includes('thank')) {
            const randomResponse = chatbotConfig.responses["obrigado"].messages;
            randomResponse.forEach(msg => addBotMessage(msg));
            showQuickReplies(chatbotConfig.responses["obrigado"].quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('adeus') || lowerInput.includes('até logo') || lowerInput.includes('bye')) {
            const randomFarewell = chatbotConfig.farewells[Math.floor(Math.random() * chatbotConfig.farewells.length)];
            addBotMessage(randomFarewell);
            responseFound = true;
        }
        else if (lowerInput.includes('olá') || lowerInput.includes('oi')) {
            const response = chatbotConfig.responses["olá"];
            response.messages.forEach(msg => addBotMessage(msg));
            showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('serviço') || lowerInput.includes('o que fazem') || lowerInput.includes('que oferecem')) {
            const response = chatbotConfig.responses["serviço"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.quickReplies) showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('tempo') || lowerInput.includes('rápido') || lowerInput.includes('lento')) {
            const response = chatbotConfig.responses["tempo"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.quickReplies) showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        else if (lowerInput.includes('contato') || lowerInput.includes('falar') || lowerInput.includes('ligar')) {
            const response = chatbotConfig.responses["contato"];
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
        else if (lowerInput.includes('preço') || lowerInput.includes('custo') || lowerInput.includes('quanto custa')) {
            const response = chatbotConfig.responses["preço"];
            response.messages.forEach(msg => addBotMessage(msg));
            if (response.quickReplies) showQuickReplies(response.quickReplies);
            responseFound = true;
        }
        
        // Resposta padrão se não encontrar correspondência
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
        addBotMessage("Por favor preencha todos os campos obrigatórios.");
        return;
    }
    
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        form.remove();
        
        addBotMessage(chatbotConfig.leadForms[formType].successMessage);
        
        if (formType === 'consultoria') {
            showQuickReplies(["Ver caso similar", "Como me preparar", "Obrigado"]);
        }
        
        sendLeadDataToBackend(formData, formType);
    }, 2000);
}

function sendLeadDataToBackend(data, formType) {
    const textoPlano = `
== NOVO LEAD DO CHATBOT ==
Tipo: ${formType}
Nome: ${data.nome || 'Não fornecido'}
Email: ${data.email || 'Não fornecido'}
Telefone: ${data.telefone || 'Não fornecido'}
Mensagem: ${data.necessidade || 'Consulta do chatbot'}
Data: ${new Date().toLocaleString()}
==============================================
`;

    const dadosJSON = {
        data: new Date().toISOString(),
        origem: "chatbot",
        tipo_formulario: formType,
        contato: {
            nome: data.nome || null,
            email: data.email || null,
            telefone: data.telefone || null
        },
        mensagem: data.necessidade || 'Consulta do chatbot',
        metadata: {
            pagina: window.location.href,
            userAgent: navigator.userAgent,
            interacoes: document.getElementById('chatbot-messages').children.length
        }
    };

    emailjs.send('service_42rjl6k', 'template_iszllup', {
        from_name: data.nome || 'Usuário Chatbot',
        from_email: data.email || 'no-email@chatbot.com',
        from_phone: data.telefone || '',
        message: textoPlano,
        reply_to: data.email || 'womostd@gmail.com',
        subject: `[WOMO] Lead Chatbot: ${formType} - ${data.nome || 'Anônimo'}`,
        dados_json: JSON.stringify(dadosJSON, null, 2)
    })
    .then(response => {
        console.log('Email enviado!', response.status, response.text);
    })
    .catch(error => {
        console.error('Erro ao enviar:', error);
        sendWithFormSubmit(data, formType);
    });
}

function sendWithFormSubmit(data, formType) {
    const dadosJSON = {
        data: new Date().toISOString(),
        origem: "chatbot",
        tipo_formulario: formType,
        contato: {
            nome: data.nome || null,
            email: data.email || null,
            telefone: data.telefone || null
        },
        mensagem: data.necessidade || 'Consulta do chatbot',
        metadata: {
            pagina: window.location.href,
            userAgent: navigator.userAgent
        }
    };

    const formData = new FormData();
    formData.append('nome', data.nome || '');
    formData.append('email', data.email || '');
    formData.append('telefone', data.telefone || '');
    formData.append('mensagem', data.necessidade || 'Consulta do chatbot');
    formData.append('metadata', JSON.stringify(dadosJSON));
    formData.append('_subject', `[Chatbot] ${formType} - ${data.nome || 'Anônimo'}`);
    
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

// Configuração do assistente flutuante WoMi
const inactivityConfig = {
    timeout: 15000, // 15 segundos para mostrar o popup
    messages: [
        "Precisa de ajuda para otimizar seus processos?",
        "Olá! Pronto para transformar sua produtividade? Temos a solução ideal para você.",
        "Gostaria de saber como automatizar suas operações?",
        "Transforme seus processos manuais em sistemas automáticos. Vamos conversar?",
        "Adoraria mostrar como podemos te ajudar!"
    ],
    displayDuration: 0, // Alterado para 0 para não ocultar automaticamente
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
    // Não mostrar se já houver outro elemento flutuante ativo
    if (activeFloatingElement || isGifWindowOpen) return;
    
    // Fechar o chatbot se estiver aberto
    closeChatbot();
    
    const popup = document.getElementById('inactivity-popup');
    const message = document.getElementById('inactivity-message');
    const gif = document.getElementById('inactivity-gif');
    const chatbotIcon = document.querySelector('.chatbot-icon');
    
    // Ocultar o ícone do chatbot
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
    
    // Removido o timeout para ocultar automaticamente
    isPopupActive = true;
    activeFloatingElement = 'gif';
    document.addEventListener('click', closePopupOnOutsideClick, true);
}
    
function closePopupOnOutsideClick(e) {
    const popup = document.getElementById('inactivity-popup');
    const gifWindow = document.getElementById('gif-window');
    
    // Verificar se clicou fora do popup ou do GIF
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
    
    // Opções mais concretas e acionáveis
    gifWindowContent.innerHTML = `
        <div class="gif-window-header">
            <h3>Qual problema você precisa resolver?</h3>
            <button class="close-gif-window" onclick="closeGifWindow()">×</button>
        </div>
        <div class="gif-window-body">
            <div class="gif-window-grid">
                <!-- ProTrack -->
                <button class="gif-option-btn" onclick="handleGifOption('Coordenação de processos manuais')">
                    <strong>⚙️ Processos desorganizados</strong><br>
                    <small>Sistema modular de gestão</small>
                </button>

                <!-- Unistock -->
                <button class="gif-option-btn" onclick="handleGifOption('Controle de inventário impreciso')">
                    <strong>📦 Estoque não confiável</strong><br>
                    <small>Alertas automáticos de inventário</small>
                </button>

                <!-- PortiFy -->
                <button class="gif-option-btn" onclick="handleGifOption('Acompanhamento de projetos/clientes')">
                    <strong>📊 Informação fragmentada</strong><br>
                    <small>CRM visual para portfólios</small>
                </button>

                <!-- PCAF -->
                <button class="gif-option-btn" onclick="handleGifOption('Gestão de clientes/membresias')">
                    <strong>🏋️ Registros manuais</strong><br>
                    <small>Sistema integrado de controle</small>
                </button>

                <!-- Messungen -->
                <button class="gif-option-btn" onclick="handleGifOption('Acompanhamento de progresso físico')">
                    <strong>📏 Medições não sistematizadas</strong><br>
                    <small>Histórico digitalizado</small>
                </button>

                <!-- PocketFlow -->
                <button class="gif-option-btn" onclick="handleGifOption('Organização de finanças')">
                    <strong>💰 Gastos não categorizados</strong><br>
                    <small>Controle financeiro personalizado</small>
                </button>
            </div>
            <button class="gif-option-btn no-thanks" onclick="handleNoThanks()">
                Agora não, obrigado
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
    // Ocultar mensagem inicial se ainda estiver visível
    const initialMessage = document.getElementById('inactivity-message');
    if (initialMessage) {
        initialMessage.classList.remove('active');
    }
    
    // Fechar janela GIF
    closeGifWindow();
    
    // Mostrar mensagem de despedida
    showWoMoBubble("Entendido! 😊 Estarei por aqui se precisar.");
    
    // Ocultar tudo depois de 3 segundos
    hideTimeout = setTimeout(() => {
        hideInactivityPopup();
    }, 3000);
}

function showWoMoBubble(message) {
    // Garantir que a mensagem inicial esteja oculta
    const initialMessage = document.getElementById('inactivity-message');
    if (initialMessage) {
        initialMessage.classList.remove('active');
    }
    
    const gif = document.getElementById('inactivity-gif');
    const gifRect = gif.getBoundingClientRect();
    
    // Criar bolha
    const bubble = document.createElement('div');
    bubble.className = 'womo-bubble';
    bubble.innerHTML = `
        <div class="bubble-arrow"></div>
        <div class="bubble-content">${message}</div>
    `;
    
    // Posicionamento preciso
    bubble.style.position = 'fixed';
    bubble.style.bottom = `${gifRect.bottom + window.scrollY}px`;
    bubble.style.left = `${gifRect.left - 200}px`;
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(10px)';
    bubble.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(bubble);
    
    // Animação de entrada
    setTimeout(() => {
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';
    }, 50);
    
    // Animação de falar
    gif.classList.add('womo-talking');
    
    // Desaparecer depois de 3 segundos
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
    
    // Mensagem inicial baseada na opção selecionada
    let botResponse = "";
    switch(option) {
        case 'Tarefas repetitivas que consomem muito tempo':
            botResponse = "Entendo que quer otimizar processos manuais. Poderia me dizer que tipo de tarefas são? Por exemplo:\n1. Processamento de pedidos\n2. Faturamento\n3. Relatórios mensais\n4. Outra (especificar)";
            break;
        case 'Erros em inventário que geram perdas':
            botResponse = "O controle de inventário é crucial. Que problemas específicos você tem?\n1. Estoque inexato\n2. Perdas não identificadas\n3. Compras desnecessárias\n4. Outro (descrever)";
            break;
        case 'Clientes insatisfeitos por má comunicação':
            botResponse = "A comunicação com clientes é chave. Qual área precisa melhorar?\n1. Resposta a consultas\n2. Acompanhamento de vendas\n3. Lembretes de pagamentos\n4. Outro (qual)";
            break;
        default:
            botResponse = "Conte-me mais sobre este desafio para dar uma solução precisa.";
    }
    
    // Mostrar mensagem do usuário e resposta do bot
    addUserMessage(option);
    setTimeout(() => {
        addBotMessage(botResponse);
    }, 800);
}

function positionGifWindow(popup, gifWindow) {
    const popupRect = popup.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Para móveis, centralizamos horizontalmente e posicionamos acima
        gifWindow.style.left = '50%';
        gifWindow.style.right = 'auto';
        gifWindow.style.transform = 'translateX(-50%)';
        gifWindow.style.bottom = `${popupRect.height + 20}px`;
        gifWindow.style.top = 'auto';
    } else {
        // Para desktop mantemos o comportamento original
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
    
    // Marcar que já passou a primeira aparição
    if (inactivityConfig.firstAppearance) {
        inactivityConfig.firstAppearance = false;
    }
    
    // Resto da função permanece igual...
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
    
    // Só mostrar o ícone do chatbot se não houver outros elementos flutuantes ativos
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
    // Restabelecer firstAppearance ao carregar a página
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

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Pré-carregar o GIF
    const gif = new Image();
    gif.src = 'WoMi1.webp';
    
    // Pré-carregar o ícone do chatbot
    const chatbotIconImg = new Image();
    chatbotIconImg.src = 'WoMi.webp';
    
    // Pré-carregar o logo do WhatsApp
    const whatsappImg = new Image();
    whatsappImg.src = 'wp.webp';
    
    // Iniciar o acompanhamento de atividade
    setupActivityTracking();
    
    // Criar elementos necessários se não existirem
    if (!document.getElementById('gif-window')) {
        const gifWindow = document.createElement('div');
        gifWindow.id = 'gif-window';
        gifWindow.innerHTML = '<div id="gif-window-content"></div>';
        document.body.appendChild(gifWindow);
    }
    
    // Configurar eventos do chatbot
    const chatbotWindow = document.getElementById('chatbot-window');
    chatbotWindow.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Evento para enviar mensagem com Enter
    document.getElementById('chatbot-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Fechar chatbot ao clicar em links de contato
    document.querySelectorAll('[onclick="openContactPopup()"]').forEach(link => {
        link.addEventListener('click', closeChatbot);
    });
    
    // Criar partículas para o hero
    createParticles();
    
    // Garantir que o ícone esteja visível ao carregar (se não houver popups abertos)
    updateChatbotIconVisibility();
    
    // Garantir que o botão do WhatsApp seja clicável
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.style.pointerEvents = 'auto';
        whatsappBtn.style.zIndex = '1';
    }
});

// Configuração de navegação do menu
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

// Lidar com tecla Escape para fechar elementos
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
        title: "Transformação de Tempo",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #10B981; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Transformamos horas em minutos</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Clientes satisfeitos, tempo otimizado</p>
                
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
                        Otimização dos processos de maneira notável.
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #10B981; font-weight: bold;">•</span> 
                        Diga adeus às tarefas manuais e repetitivas
                    </li>
                </ul>
            </div>
        `
    },
    workflow: {
        title: "Automatização Inteligente",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #2563EB; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Automatização flexível</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Potencialize seus processos internos</p>
                
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
                        Solução independente e autônoma
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #2563EB; font-weight: bold;">•</span> 
                        Adapta-se aos seus processos específicos
                    </li>
                </ul>
            </div>
        `
    },
    profit: {
        title: "Eficiência que Gera Valor",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #7C3AED; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Otimização Financeira Inteligente</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Transforme sua eficiência em resultados</p>
                
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
                        Melhoria sustentável na sua rentabilidade
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #7C3AED; font-weight: bold;">•</span> 
                        Gestão mais eficiente dos seus recursos
                    </li>
                </ul>
            </div>
        `
    },
    analytics: {
        title: "Inteligência Estratégica",
        content: `
            <div style="padding: 20px;">
                <h2 style="color: #F59E0B; font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center;">Tome a dianteira</h2>
                <p style="color: #4B5563; margin-bottom: 1.5rem; text-align: center;">Descubra padrões antes da concorrência</p>
                
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
                        Previsões confiáveis e acionáveis
                    </li>
                    <li style="margin-bottom: 0.8rem; position: relative;">
                        <span style="position: absolute; left: -20px; color: #F59E0B; font-weight: bold;">•</span> 
                        Detecção precoce de oportunidades-chave
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

// Função para atualizar a visibilidade do ícone do chatbot
function updateChatbotIconVisibility() {
    const chatbotIcon = document.querySelector('.chatbot-icon');
    if (!chatbotIcon) return;
    
    // Ocultar se houver popup de contato aberto ou outros elementos ativos
    const contactPopupActive = document.getElementById('contact-popup').classList.contains('active');
    if (contactPopupActive || activeFloatingElement || isPopupActive || isGifWindowOpen) {
        chatbotIcon.style.display = 'none';
    } else {
        chatbotIcon.style.display = 'flex';
    }
}

// Dados dos 6 projetos
const projects = [
    {   "id": 1,
        "title": "ProTrack",
        "shortDesc": "Plataforma modular universal de gestão de processos",
        "fullDesc": "É o motor que transforma o caos operacional em fluxos automatizados de alto desempenho. Para líderes que exigem excelência em cada processo.",
        "icon": "⚙️",
        "image": "../proyectos/imagen3.webp"
    },{ "id": 2,
        "title": "Unistock",
        "shortDesc": "Sistema proprietário de gestão de inventários",
        "fullDesc": "É o cérebro logístico que antecipa escassez, otimiza compras e transforma inventários em fluxo de caixa. Para negócios que não toleram erros.",
        "icon": "📦",
        "image": "../proyectos/imagen2.webp"
    },{ "id": 3,
        "title": "PortiFy",
        "shortDesc": "CRM especializado em portfólios tecnológicos",
        "fullDesc": "Será seu portfólio como arma comercial: transforma projetos técnicos em narrativas irresistíveis para clientes exigentes.",
        "icon": "📊",
        "image": "../proyectos/imagen6.webp"
    },{ "id": 4,
        "title": "PCAF",
        "shortDesc": "Sistema de gestão para academias",
        "fullDesc": "O sistema que faz seus clientes sentirem que treinam em uma academia de luxo: progresso mensurável instantâneo e comunicação exclusiva. A ferramenta secreta para reter 3 vezes mais.",
        "icon": "🏋️",
        "image": "../proyectos/imagen1.webp"
    },{ "id": 5,
        "title": "Messungen",
        "shortDesc": "Acompanhamento do progresso físico",
        "fullDesc": "Sistema que vincula treinos com resultados: registra medições, correlaciona rotinas e demonstra o impacto tangível da sua metodologia. A prova de que seu trabalho transforma.",
        "icon": "📏",
        "image": "../proyectos/imagen4.webp"
    },{ "id": 6,
        "title": "PocketFlow",
        "shortDesc": "Gestão financeira pessoal",
        "fullDesc": "É o controle financeiro pessoal inteligente: tome as rédeas do seu dinheiro com clareza e precisão profissional.",
        "icon": "💰",
        "image": "../proyectos/imagen5.webp"
    }
];

// Pré-carregar IMAGENS CRÍTICAS (WebP)
function preloadImages() {
    projects.forEach(project => {
        const img = new Image();
        img.src = project.image; // Pré-carregar em segundo plano
    });
}

// Renderizar o portfólio (carregamento ULTRA rápido)
function renderPortfolio() {
    const container = document.getElementById('portfolio-container');
    
    // 1. Pré-carregar as imagens
    preloadImages();
    
    // 2. Criar os cartões
    container.innerHTML = projects.map(project => `
        <div class="portfolio-card" data-id="${project.id}">
            <img 
                src="${project.image}" 
                alt="${project.title}" 
                loading="eager"     <!-- Carregamento imediato! -->
                width="400"         <!-- Largura fixa -->
                height="300"        <!-- Altura fixa -->
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

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', renderPortfolio);


// Inicializar portfólio
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
    
    // Eventos para os cartões
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
        <button class="popup-btn" onclick="requestProject(${project.id})">Eu levo... </button>
    `;
    
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fechar popup
function closePopup() {
    document.getElementById('project-popup').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Solicitar projeto
function requestProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Fechar o popup do projeto
    closePopup();
    
    // Abrir o popup de contato
    openContactPopup();
    
    // Adicionar o nome do projeto ao campo de mensagem (sem apagar conteúdo existente)
    const messageField = document.getElementById('contact-message');
    const currentValue = messageField.value.trim();
    const projectText = `Estou interessado no projeto ${project.title}. `;
    
    // Só adicionar se não estiver já presente
    if (!currentValue.includes(project.title)) {
        messageField.value = projectText + (currentValue ? '\n\n' + currentValue : '');
    }
    
    // Focar o campo de mensagem
    setTimeout(() => {
        messageField.focus();
    }, 500);
}

// Modificar o HTML do botão em openPopup para passar o ID corretamente
function openPopup(project) {
    const popup = document.getElementById('project-popup');
    const content = document.getElementById('popup-content-wrapper');
    
    content.innerHTML = `
        <h2>${project.title}</h2>
        <img src="${project.image}" alt="${project.title}" onerror="this.src='img/default-project.webp'">
        <p>${project.fullDesc}</p>
        <button class="popup-btn" onclick="requestProject(${project.id})">Eu levo... </button>
    `;
    
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initPortfolio();
    
    // Botão fechar
    document.querySelector('.close-popup').addEventListener('click', closePopup);
    
    // Fechar ao clicar fora
    document.getElementById('project-popup').addEventListener('click', (e) => {
        if (e.target === document.getElementById('project-popup')) {
            closePopup();
        }
    });
 
    // Fechar com Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('project-popup').classList.contains('active')) {
            closePopup();
        }
    });
});