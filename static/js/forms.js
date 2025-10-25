(function(){
  function mount(){
    if(document.getElementById("ws-modals"))return;
    const wrap=document.createElement("div");wrap.id="ws-modals";
    wrap.innerHTML=`
      <div class="ws-modal" id="ws-quote">
        <div class="ws-card">
          <div class="ws-head">Solicitar cotización <span class="ws-x" data-close="ws-quote">✕</span></div>
          <div class="ws-grid">
            <input class="full" id="q-name" placeholder="Nombre completo*"/>
            <input id="q-email" placeholder="Correo electrónico*"/>
            <input id="q-company" placeholder="Empresa (opcional)"/>
            <input id="q-phone" placeholder="WhatsApp/Teléfono (opcional)"/>
            <select id="q-project" class="full">
              <option value="">Proyecto/Servicio de interés</option>
              <option>Automatización (n8n)</option>
              <option>Integraciones (APIs/Supabase)</option>
              <option>Sitios y Apps Web</option>
              <option>Chatbot de Ventas</option>
              <option>Reportes y Paneles</option>
            </select>
            <input id="q-budget" placeholder="Presupuesto estimado (opcional)"/>
            <input id="q-deadline" placeholder="Fecha objetivo (opcional)"/>
            <textarea id="q-notes" class="full" rows="4" placeholder="Alcance / módulos / objetivos*"></textarea>
          </div>
          <div class="ws-actions">
            <button class="ws-btn" data-close="ws-quote">Cancelar</button>
            <button class="ws-btn primary" id="q-send">Enviar</button>
          </div>
        </div>
      </div>
      <div class="ws-modal" id="ws-handoff">
        <div class="ws-card">
          <div class="ws-head">Solicitar asesoría <span class="ws-x" data-close="ws-handoff">✕</span></div>
          <div class="ws-grid">
            <input class="full" id="h-name" placeholder="Nombre completo*"/>
            <input id="h-email" placeholder="Correo electrónico*"/>
            <input id="h-phone" placeholder="WhatsApp/Teléfono (opcional)"/>
            <input id="h-time" placeholder="Horario preferido (opcional)"/>
            <textarea id="h-notes" class="full" rows="4" placeholder="Describe brevemente tu caso*"></textarea>
          </div>
          <div class="ws-actions">
            <button class="ws-btn" data-close="ws-handoff">Cancelar</button>
            <button class="ws-btn primary" id="h-send">Enviar</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    wrap.addEventListener("click",(e)=>{
      const id=e.target.getAttribute("data-close");
      if(id) document.getElementById(id).style.display="none";
      if(e.target.classList.contains("ws-modal")) e.target.style.display="none";
    });

    document.getElementById("q-send").onclick=async()=>{
      const p={
        name: q-name.value.trim(),
        email: q-email.value.trim(),
        company: q-company.value.trim(),
        phone: q-phone.value.trim(),
        project: q-project.value,
        budget: q-budget.value.trim(),
        deadline: q-deadline.value.trim(),
        notes: q-notes.value.trim(),
        source: 'web_quote_form'
      };
      if(!p.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) || !p.notes){
        return alert('Completa nombre, correo y alcance.');
      }
      try{ await n8nIntegration.sendQuote(p); alert('¡Solicitud enviada! Te llegará un correo de confirmación.'); document.getElementById('ws-quote').style.display='none'; }
      catch{ alert('No se pudo enviar en este momento.'); }
    };

    document.getElementById("h-send").onclick=async()=>{
      const p={
        name: h-name.value.trim(),
        email: h-email.value.trim(),
        phone: h-phone.value.trim(),
        time: h-time.value.trim(),
        notes: h-notes.value.trim(),
        source: 'web_handoff_form'
      };
      if(!p.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) || !p.notes){
        return alert('Completa nombre, correo y descripción.');
      }
      try{ await n8nIntegration.handoff(p); alert('¡Listo! Te contactará un asesor.'); document.getElementById('ws-handoff').style.display='none'; }
      catch{ alert('No se pudo enviar en este momento.'); }
    };
  }

  function openQuote(){ document.getElementById('ws-quote').style.display='flex'; }
  function openHandoff(){ document.getElementById('ws-handoff').style.display='flex'; }

  document.addEventListener('DOMContentLoaded', ()=>{
    mount(); window.WSForms={ openQuote, openHandoff };
  });
})();