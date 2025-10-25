(function(){
  const IDLE_MS=90*1000;
  function $(s,c=document){return c.querySelector(s)}
  function el(t,c,h){const n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n;}
  function build(){
    const root=el('div','womi');const bubble=el('div','womi-bubble','¿Necesitas ayuda para optimizar tus procesos?');const avatar=el('div','womi-avatar');avatar.title='Asistente WoMi';root.append(bubble,avatar);document.body.appendChild(root);
    const pop=el('div','womi-pop');
    pop.innerHTML=`<div class='womi-head'><span>¿Qué problema necesitas resolver?</span><span class='womi-x'>✕</span></div>
      <div class='womi-body'>
        <div class='womi-step1'>
          <div class='womi-list' id='womi-list'></div>
          <div class='womi-row'><button class='womi-btn' id='womi-later'>Ahora no, gracias</button><button class='womi-btn primary' id='womi-talk'>Hablar con asesor</button></div>
        </div>
        <div class='womi-step2'>
          <div class='womi-back'>← Volver</div>
          <div id='womi-detail' style='margin-top:8px'></div>
          <div class='womi-row'><button class='womi-btn' id='womi-quote'>Quiero una cotización</button><button class='womi-btn primary' id='womi-ask'>Hacer una pregunta</button></div>
        </div>
      </div>`;
    document.body.appendChild(pop);
    const items=[
      {t:'Procesos desorganizados',s:'Sistema modular de gestión'},
      {t:'Stock no confiable',s:'Alertas automáticas de inventario'},
      {t:'Información fragmentada',s:'CRM visual para portafolios'},
      {t:'Registros manuales',s:'Sistema integrado de control'},
      {t:'Mediciones no sistematizadas',s:'Historial digitalizado'},
      {t:'Gastos no categorizados',s:'Control financiero personalizado'}
    ];
    const list=$('#womi-list',pop);
    items.forEach(b=>{const card=el('div','womi-card',`<strong>• ${b.t}</strong><small>${b.s}</small>`);card.onclick=()=>openStep2(b);list.append(card)});
    const step1=$('.womi-step1',pop), step2=$('.womi-step2',pop), detail=$('#womi-detail',pop);
    function openStep1(){step2.style.display='none';step1.style.display='block'}
    function openStep2(b){detail.innerHTML=`<h4>${b.t}</h4><p>${b.s}. Integramos datos, automatizamos alertas y entregamos paneles.</p>`;step1.style.display='none';step2.style.display='block'}
    function open(){pop.style.display='block'} function close(){pop.style.display='none'} function showB(){bubble.style.display='block'} function hideB(){bubble.style.display='none'}
    let idle=null; function reset(){clearTimeout(idle); idle=setTimeout(()=>{showB(); open();}, IDLE_MS)}
    ;['mousemove','keydown','scroll','touchstart'].forEach(e=>document.addEventListener(e,()=>{hideB(); reset();},{passive:true})); reset();
    avatar.onclick=()=>open(); bubble.onclick=()=>{open(); hideB();}
    $('.womi-x',pop).onclick=close; $('#womi-later',pop).onclick=close; $('.womi-back',pop).onclick=openStep1;
    $('#womi-quote',pop).onclick=()=>window.WSForms?.openQuote();
    $('#womi-ask',pop).onclick=()=>window.WSForms?.openHandoff();
    $('#womi-talk',pop).onclick=()=>window.WSForms?.openHandoff();
  }
  document.addEventListener('DOMContentLoaded', build);
})();