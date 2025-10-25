(function(){
  function ensure(){
    if(document.getElementById('ws-chat-box')) return;
    const t=document.createElement('button'); t.id='ws-chat-toggle'; t.className='ws-chat-toggle'; t.textContent='Asistente WoMi'; document.body.appendChild(t);
    const b=document.createElement('div'); b.id='ws-chat-box'; b.className='ws-chat ws-hidden'; b.innerHTML=`
      <link rel="stylesheet" href="static/css/ws-widgets.css">
      <div class="ws-chat-head"><div><strong>WoMi</strong> <small data-i18n="chat.subtitle">¿En qué puedo ayudarte hoy?</small></div><button id="ws-chat-close">✕</button></div>
      <div class="ws-chat-body" id="ws-chat-body"></div>
      <div class="ws-chat-actions">
        <button class="ws-ghost" id="ws-open-quote" data-i18n="chat.quote">Solicitar cotización</button>
        <button class="ws-ghost" id="ws-open-info" data-i18n="chat.info">Solicitar información</button>
      </div>
      <div class="ws-chat-input">
        <input id="ws-chat-input" placeholder="Escribe tu mensaje..." data-placeholder-es="Escribe tu mensaje..." data-placeholder-en="Type your message..." data-placeholder-pt="Digite sua mensagem..." data-placeholder-de="Schreibe deine Nachricht...">
        <button id="ws-chat-send" class="ws-btn" data-i18n="chat.send">Enviar</button>
      </div>`;
    document.body.appendChild(b);
  }
  const el=s=>document.querySelector(s);
  const say=(t,who='ws-bot')=>{ const d=document.createElement('div'); d.className=`ws-msg ${who==='ws-you'?'ws-you':'ws-bot'}`; d.textContent=t; el('#ws-chat-body').appendChild(d); el('#ws-chat-body').scrollTop=el('#ws-chat-body').scrollHeight; };
  const st={name:null,email:null,history:[]};
  function greet(){ say('Hola 👋 Soy WoMi. Puedo ayudarte con automatización (n8n), integraciones, web y reportes.'); say('Para empezar dime tu nombre.'); }
  async function ask(text){ try{ const r=await wsN8n.msg({text,name:st.name,email:st.email,history:st.history.slice(-10)}); return r; }catch{ return {reply:'¿Quieres que te contacte un asesor? Puedo abrir el formulario.', suggest_handoff:true}; } }
  async function onUser(t){ t=(t||'').trim(); if(!t) return; say(t,'ws-you'); st.history.push({role:'user',text:t}); if(!st.name){ st.name=t; say('Gracias, ¿tu correo?'); return; } if(!st.email){ if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)){ say('Formato de correo inválido.'); return; } st.email=t; say('Perfecto. Cuéntame tu necesidad y te ayudo.'); return; } const {reply,suggest_quote,suggest_handoff}=await ask(t); if(reply) say(reply); if(/cotiz|precio|propuest/i.test(t)||suggest_quote){ WSForms.openQuote(); return; } if(/asesor|humano|contact|llamar/i.test(t)||suggest_handoff){ WSForms.openInfo(); return; } }
  document.addEventListener('DOMContentLoaded',()=>{
    ensure();
    el('#ws-chat-toggle').onclick=()=>{ el('#ws-chat-box').classList.remove('ws-hidden'); if(!st._g){ greet(); st._g=true; } };
    el('#ws-chat-close').onclick=()=> el('#ws-chat-box').classList.add('ws-hidden');
    el('#ws-chat-send').onclick=()=>{ const v=el('#ws-chat-input').value; if(!v) return; el('#ws-chat-input').value=''; onUser(v); };
    el('#ws-chat-input').onkeydown=e=>{ if(e.key==='Enter') el('#ws-chat-send').click(); };
    el('#ws-open-quote').onclick=()=>WSForms.openQuote();
    el('#ws-open-info').onclick=()=>WSForms.openInfo();
  });
})();