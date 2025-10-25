const chatbotDatabase = {
    discovery: {
        manualProcesses: "¿Qué tarea repetitiva te quita más tiempo y te gustaría automatizar hoy?",
        scatteredData: "Cuando necesitas información importante, ¿en cuántos lugares diferentes tienes que buscarla?",
        rapidGrowth: "¿Qué proceso se ha vuelto un cuello de botella con el crecimiento de tu negocio?",
        customerService: "¿Cómo evitan que los pedidos de clientes se pierdan entre lo solicitado y lo entregado?",
        multipleLocations: "¿Cómo mantienen alineada la información entre tus diferentes sucursales o equipos?"
    },

    solutions: {
        inventory: {
            problem: "Nuestro inventario nunca coincide",
            response: "Implementamos sistemas de seguimiento en tiempo real con alertas automáticas. ¿Te gustaría ver cómo funciona?"
        },
        scheduling: {
            problem: "Las citas se nos solapan",
            response: "Creamos agendas inteligentes que gestionan automáticamente los horarios. ¿Quieres que te muestre una demo?"
        },
        reporting: {
            problem: "Los reportes nos consumen mucho tiempo",
            response: "Automatizamos la generación de reportes con los datos que necesitas. ¿Qué información requieres regularmente?"
        },
        communication: {
            problem: "Ventas y operaciones no están alineadas",
            response: "Implementamos tableros compartidos que actualizan información en vivo. ¿Cómo manejan actualmente esta coordinación?"
        },
        documents: {
            problem: "Perdemos mucho tiempo con documentos físicos",
            response: "Digitalizamos procesos completos con firmas electrónicas. ¿Qué tipo de documentos te gustaría convertir a digital?"
        }
    },

    closing: {
        interest: [
            "¡Perfecto! Por favor completa estos datos para programar una demostración:\n[Formulario de contacto]\nO si prefieres, dime:\n📅 ¿Qué día te vendría bien?\n⏰ ¿Qué hora prefieres?",
            "Entendido. Para asignarte un asesor especializado:\n[Formulario de contacto]\nTambién puedes indicarme:\n🗓️ ¿Cuál es tu disponibilidad?\n🕒 ¿Horario preferido?"
        ],
        contact: [
            "Claro que sí. Para conectarte con nuestro equipo:\n[Formulario de contacto]\nO dime directamente:\n📆 ¿Qué día tienes disponible?\n⏳ ¿Mañana o tarde?",
            "Ideal. Un asesor se comunicará contigo. Necesitamos:\n[Formulario de contacto]\nO respóndeme:\n📅 ¿Día que te funciona?\n⌚ ¿Hora ideal?"
        ],
        generalInterest: "Entiendo tu interés. Por favor déjanos tus datos para contactarte:\n[Formulario de contacto]\n¿O prefieres que te llame un asesor? (Di 'Sí' o 'No')"
    },

    // Función para conversación fluida
    getResponse: function(phase, specific) {
        let response;
        switch(phase) {
            case 'discovery':
                response = this.discovery[specific];
                break;
            case 'solution':
                const solution = this.solutions[specific];
                response = `"${solution.problem}"\n${solution.response}`;
                break;
            case 'close':
                if(specific === 'interest') {
                    response = this.closing.interest[Math.floor(Math.random() * this.closing.interest.length)];
                } else if(specific === 'contact') {
                    response = this.closing.contact[Math.floor(Math.random() * this.closing.contact.length)];
                } else {
                    response = this.closing.generalInterest;
                }
                break;
            default:
                response = "Cuéntame más sobre los desafíos operativos que estás enfrentando";
        }
        return response;
    }
};