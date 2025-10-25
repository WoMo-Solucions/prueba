window.WSForms=(function(){
  function ensure(){ if(document.getElementById('ws-popups')) return; const d=document.createElement('div'); d.id='ws-popups'; d.innerHTML=`
  <div id="ws-quote" class="ws-overlay ws-hidden">
    <div class="ws-card">
      <div class="ws-card-head">
        <h3 data-i18n="quote.title">Solicitar cotización</h3>
        <button onclick="WSForms.close('ws-quote')">✕</button>
      </div>
      <div class="ws-grid">
        <input id="ws-q-company" placeholder="Empresa*"/>
        <input id="ws-q-name" placeholder="Nombre completo*"/>
        <input id="ws-q-id" placeholder="NIT o Cédula*"/>
        <input id="ws-q-email" placeholder="Email*" type="email"/>
        <input id="ws-q-phone" placeholder="Celular*"/>
        <textarea id="ws-q-scope" class="ws-full" rows="3" placeholder="Alcance (opcional)"></textarea>
        <textarea id="ws-q-message" class="ws-full" rows="3" placeholder="Mensaje adicional*"></textarea>
      </div>
      <div class="ws-actions">
        <button class="ws-ghost" onclick="WSForms.close('ws-quote')" data-i18n="ui.cancel">Cancelar</button>
        <button class="ws-btn" onclick="WSForms.sendQuote()" data-i18n="ui.send">Enviar</button>
      </div>
    </div>
  </div>

  <div id="ws-info" class="ws-overlay ws-hidden">
    <div class="ws-card">
      <div class="ws-card-head">
        <h3 data-i18n="info.title">Solicitar información</h3>
        <button onclick="WSForms.close('ws-info')">✕</button>
      </div>
      <div class="ws-grid">
        <input id="ws-i-name" placeholder="Nombre completo*"/>
        <input id="ws-i-email" placeholder="Email*" type="email"/>
        <input id="ws-i-phone" placeholder="Celular*"/>
        <textarea id="ws-i-notes" class="ws-full" rows="3" placeholder="Cuéntanos tu caso*"></textarea>
      </div>
      <div class="ws-actions">
        <button class="ws-ghost" onclick="WSForms.close('ws-info')" data-i18n="ui.cancel">Cancelar</button>
        <button class="ws-btn" onclick="WSForms.sendInfo()" data-i18n="ui.send">Enviar</button>
      </div>
    </div>
  </div>`; document.body.appendChild(d); }
  function open(id){ ensure(); document.getElementById(id).classList.remove('ws-hidden'); }
  function close(id){ document.getElementById(id).classList.add('ws-hidden'); }
  async function sendQuote(){
    ensure();
    const p={
      company: ws-q-company.value.trim(),
      name: ws-q-name.value.trim(),
      nid: ws-q-id.value.trim(),
      email: ws-q-email.value.trim(),
      phone: ws-q-phone.value.trim(),
      scope: ws-q-scope.value.trim(),
      message: ws-q-message.value.trim(),
      source: 'popup_quote'
    };
    if(!p.company||!p.name||!p.nid||!p.email||!p.phone||!p.message){ alert('Completa Empresa, Nombre, NIT/Cédula, Email, Celular y Mensaje.'); return; }
    try{ await wsN8n.quote(p); alert('¡Cotización enviada!'); close('ws-quote'); }catch(e){ alert('No se pudo enviar.'); }
  }
  async function sendInfo(){
    ensure();
    const p={
      name: ws-i-name.value.trim(),
      email: ws-i-email.value.trim(),
      phone: ws-i-phone.value.trim(),
      notes: ws-i-notes.value.trim(),
      source: 'popup_info'
    };
    if(!p.name||!p.email||!p.phone||!p.notes){ alert('Completa Nombre, Email, Celular y Mensaje.'); return; }
    try{ await wsN8n.handoff(p); alert('¡Solicitud enviada!'); close('ws-info'); }catch(e){ alert('No se pudo enviar.'); }
  }
  return {openQuote:()=>open('ws-quote'), openInfo:()=>open('ws-info'), close, sendQuote, sendInfo};
})();