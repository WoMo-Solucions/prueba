
# WSs — Integración WoMi + Chatbot (n8n)
1) Configura `static/config.json` con tu webhook de n8n.
2) Pega en `index.html` **antes de `</body>`**:
```html
<link rel="stylesheet" href="static/css/assistant.css"/>
<script src="static/js/n8n-integration.js"></script>
<script src="static/js/emailjs-shim.js"></script>
<script src="static/js/i18n.js"></script>
<script src="static/js/assistant.js"></script>
<script src="static/js/sales-bot.js"></script>
```
3) Banderas: usa `data-lang="es|en|pt|de|fr"` o ids `lang-es`, `lang-en`, etc.
4) El asistente (inactividad) aparece a ~90s, con popup 2 pasos (lista → detalle, X y Volver).
5) El chatbot es independiente, ofrece cotización y/o escalar a humano (handoff). Todo via n8n.
