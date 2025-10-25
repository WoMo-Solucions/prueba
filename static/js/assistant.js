
(function(){
  const IDLE_MS = 90*1000;
  let idle=null;
  function $(s,ctx=document){ return ctx.querySelector(s); }
  function el(tag,cls,html){ const n=document.createElement(tag); if(cls) n.className=cls; if(html!=null) n.innerHTML=html; return n; }

  function mountAssistant(){
    const root=el('div','womi');
    const bubble=el('div','womi-bubble','¿Necesitas ayuda para optimizar tus procesos?');
    const avatar=el('div','womi-avatar'); avatar.title="Asistente WoMi";
    root.appendChild(bubble); root.appendChild(avatar); document.body.appendChild(root);

    const pop=el('div','womi-pop');
    pop.innerHTML=`
      <div class="womi-head">
        <span>¿Qué problema necesitas resolver?</span>
        <span class="womi-x">✕</span>
      </div>
      <div class="womi-body">
        <div class="womi-step1">
          <div class="womi-list" id="womi-list"></div>
          <div class="womi-row">
            <button class="womi-btn" id="womi-later">Ahora no, gracias</button>
            <button class="womi-btn primary" id="womi-talk">Hablar con asesor</button>
          </div>
        </div>
        <div class="womi-step2">
          <div class="womi-back">← Volver</div>
          <div id="womi-detail" style="margin-top:8px"></div>
          <div class="womi-row">
            <button class="womi-btn" id="womi-quote">Quiero una cotización</button>
            <button class="womi-btn primary" id="womi-ask">Hacer una pregunta</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(pop);

    const benes=[
      {k:"procesos",t:"Procesos desorganizados",s:"Sistema modular de gestión"},
      {k:"stock",t:"Stock no confiable",s:"Alertas automáticas de inventario"},
      {k:"info",t:"Información fragmentada",s:"CRM visual para portafolios"},
      {k:"registros",t:"Registros manuales",s:"Sistema integrado de control"},
      {k:"mediciones",t:"Mediciones no sistematizadas",s:"Historial digitalizado"},
      {k:"gastos",t:"Gastos no categorizados",s:"Control financiero personalizado"}
    ];

    const list=$("#womi-list",pop);
    benes.forEach(b=>{
      const card=el('div','womi-card', `<strong>• ${b.t}</strong><small>${b.s}</small>`);
      card.addEventListener("click",()=>openStep2(b));
      list.appendChild(card);
    });

    const step1=$('.womi-step1',pop);
    const step2=$('.womi-step2',pop);
    const detail=$("#womi-detail",pop);

    function openStep1(){ step2.style.display="none"; step1.style.display="block"; }
    function openStep2(b){
      detail.innerHTML = `<h4 style="margin:4px 0">${b.t}</h4>
      <p style="margin:6px 0 10px">Así lo resolvemos: ${b.s}. Integramos tus datos, automatizamos notificaciones y paneles de control.</p>`;
      step1.style.display="none"; step2.style.display="block";
    }

    function open(){ pop.style.display="block"; }
    function close(){ pop.style.display="none"; }
    function showBubble(){ bubble.style.display="block"; }
    function hideBubble(){ bubble.style.display="none"; }

    function resetIdle(){ clearTimeout(idle); idle=setTimeout(()=>{ showBubble(); open(); }, IDLE_MS); }
    ["mousemove","keydown","scroll","touchstart"].forEach(e=>document.addEventListener(e,()=>{ hideBubble(); resetIdle(); },{passive:true}));
    resetIdle();

    avatar.addEventListener("click",()=>{ open(); });
    bubble.addEventListener("click",()=>{ open(); hideBubble(); });
    $(".womi-x",pop).addEventListener("click",close);
    $("#womi-later",pop).addEventListener("click",close);
    $("#womi-talk",pop).addEventListener("click",()=>handoff());
    $(".womi-back",pop).addEventListener("click",openStep1);
    $("#womi-quote",pop).addEventListener("click",()=>quote());
    $("#womi-ask",pop).addEventListener("click",()=>question());

    async function quote(){
      const name=prompt("Tu nombre:"); const email=prompt("Tu correo:"); const details=prompt("¿Qué necesitas cotizar?");
      if(!name||!email) return;
      try{ await n8nIntegration.sendQuote({name,email,details,source:"idle_gif"}); alert("¡Listo! Te enviamos confirmación al correo."); }catch(e){ alert("No se pudo enviar. Intenta más tarde."); }
    }
    async function question(){
      const name=prompt("Tu nombre:"); const email=prompt("Tu correo:"); const msg=prompt("Escribe tu pregunta:");
      if(!name||!email) return;
      try{ await n8nIntegration.sendMsg({name,email,message:msg,source:"idle_gif"}); alert("Gracias, te responderemos muy pronto."); }catch(e){ alert("No se pudo enviar. Intenta más tarde."); }
    }
    async function handoff(){
      const name=prompt("Tu nombre:"); const email=prompt("Tu correo:"); const phone=prompt("Tu WhatsApp o teléfono (opcional):");
      if(!name||!email) return;
      try{ await n8nIntegration.handoff({name,email,phone,source:"idle_gif"}); alert("Agendaremos un asesor para contactarte."); }catch(e){ alert("No se pudo enviar. Intenta más tarde."); }
    }
  }

  document.addEventListener("DOMContentLoaded", mountAssistant);
})();