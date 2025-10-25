(function(){
  const IDLE_MS=90*1000;
  function ensure(){
    if(document.getElementById('ws-womi-wrap')) return;
    const wrap=document.createElement('div'); wrap.id='ws-womi-wrap'; wrap.className='ws-womi'; wrap.innerHTML=`
      <link rel="stylesheet" href="static/css/ws-widgets.css">
      <div class="ws-bubble ws-hidden" id="ws-bubble" data-i18n="idle.bubble">¿Necesitas ayuda para optimizar tus procesos?</div>
      <img src="static/img/womi.gif" class="ws-avatar" id="ws-avatar" alt="WoMi"/>
      <div class="ws-womi-pop ws-hidden" id="ws-womi-pop">
        <div class="ws-womi-head">
          <span data-i18n="idle.title">¿Qué problema necesitas resolver?</span>
          <button id="ws-womi-x">✕</button>
        </div>
        <div class="ws-womi-body">
          <div id="ws-idle1">
            <div class="ws-womi-list" id="ws-list"></div>
            <div class="ws-actions">
              <button class="ws-ghost" id="ws-later" data-i18n="idle.later">Ahora no, gracias</button>
              <button class="ws-btn" id="ws-talk" data-i18n="idle.talk">Hablar con asesor</button>
            </div>
          </div>
          <div id="ws-idle2" class="ws-hidden">
            <button class="ws-ghost" id="ws-back">← <span data-i18n="idle.back">Volver</span></button>
            <div id="ws-detail" class="ws-detail"></div>
            <div class="ws-actions">
              <button class="ws-ghost" id="ws-quote" data-i18n="idle.quote">Quiero una cotización</button>
              <button class="ws-btn" id="ws-ask" data-i18n="idle.ask">Hacer una pregunta</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }
  const items=[
    {t:'Procesos desorganizados',s:'Sistema modular de gestión'},
    {t:'Stock no confiable',s:'Alertas automáticas de inventario'},
    {t:'Información fragmentada',s:'CRM visual para portafolios'},
    {t:'Registros manuales',s:'Sistema integrado de control'},
    {t:'Mediciones no sistematizadas',s:'Historial digitalizado'},
    {t:'Gastos no categorizados',s:'Control financiero personalizado'}
  ];
  let idle=null; function $(id){return document.getElementById(id);}
  function list(){ const ul=$('ws-list'); ul.innerHTML=''; items.forEach(b=>{ const d=document.createElement('div'); d.className='ws-womi-item'; d.innerHTML=`<strong>• ${b.t}</strong><small>${b.s}</small>`; d.onclick=()=>open2(b); ul.appendChild(d); }); }
  function open1(){ $('ws-idle1').classList.remove('ws-hidden'); $('ws-idle2').classList.add('ws-hidden'); $('ws-womi-pop').classList.remove('ws-hidden'); }
  function open2(b){ $('ws-idle1').classList.add('ws-hidden'); $('ws-idle2').classList.remove('ws-hidden'); $('ws-detail').innerHTML=`<h4>${b.t}</h4><p>${b.s}. Integramos datos, automatizamos notificaciones y paneles.</p>`; }
  function close(){ $('ws-womi-pop').classList.add('ws-hidden'); }
  function showB(){ $('ws-bubble').classList.remove('ws-hidden'); } function hideB(){ $('ws-bubble').classList.add('ws-hidden'); }
  function reset(){ clearTimeout(idle); idle=setTimeout(()=>{ showB(); open1(); }, IDLE_MS); }
  document.addEventListener('DOMContentLoaded',()=>{
    ensure(); list(); reset();
    ['mousemove','keydown','scroll','touchstart'].forEach(e=>document.addEventListener(e,()=>{ hideB(); reset(); },{passive:true}));
    $('ws-avatar').onclick=()=>open1(); $('ws-bubble').onclick=()=>{ open1(); hideB(); };
    $('ws-womi-x').onclick=close; $('ws-later').onclick=close; $('ws-back').onclick=open1;
    $('ws-quote').onclick=()=>WSForms.openQuote(); $('ws-ask').onclick=()=>WSForms.openInfo(); $('ws-talk').onclick=()=>WSForms.openInfo();
  });
})();