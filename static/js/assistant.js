(function(){
  const css=`
  .womi{position:fixed;right:18px;bottom:18px;z-index:9999;display:flex;gap:10px;align-items:flex-end}
  .womi-bubble{display:none;background:#800080;color:#fff;padding:10px 12px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18);max-width:260px}
  .womi-avatar{width:72px;height:72px;border-radius:50%;background:url('/img/WoMi1.webp') center/cover no-repeat;box-shadow:0 8px 24px rgba(0,0,0,.18);cursor:pointer;animation:floatY 3s ease-in-out infinite}
  @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  .womi-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;z-index:10000}
  .womi-card{background:#fff;width:min(680px,95vw);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.25);padding:18px}
  .womi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin:10px 0}
  .womi-item{border:1px solid #eee;border-radius:12px;padding:10px;cursor:pointer}
  .womi-expl{background:#f8f7fb;border-radius:12px;padding:10px;border:1px dashed #d9c8e6;min-height:54px}
  .womi-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}
  .btn{padding:10px 14px;border-radius:10px;border:none;cursor:pointer}
  .btn.primary{background:#800080;color:#fff}`;
  const s=document.createElement("style");s.textContent=css;document.head.appendChild(s);

  const root=document.createElement("div");root.className="womi";
  const bubble=document.createElement("div");bubble.className="womi-bubble";bubble.textContent="¿Te muestro cómo podemos ayudarte?";
  const avatar=document.createElement("div");avatar.className="womi-avatar";avatar.title="Asistente WoMi";
  root.appendChild(bubble);root.appendChild(avatar);document.body.appendChild(root);

  const modal=document.createElement("div");modal.className="womi-modal";
  modal.innerHTML=`<div class="womi-card">
      <h3 style="margin:0 0 8px">¿En qué te ayudo hoy?</h3>
      <div class="womi-grid" id="womi-grid"></div>
      <div class="womi-expl" id="womi-expl">Selecciona un servicio para ver cómo lo resolvemos.</div>
      <div class="womi-actions">
        <button class="btn" id="womi-close">Cerrar</button>
        <button class="btn primary" id="womi-cta">Quiero este servicio</button>
      </div></div>`;
  document.body.appendChild(modal);

  let offerings=[];
  fetch("/static/data/offerings.json",{cache:"no-store"}).then(r=>r.json()).then(d=>{offerings=d;renderGrid();});
  function renderGrid(){
    const grid=document.getElementById("womi-grid"); if(!grid) return;
    grid.innerHTML=""; offerings.forEach(o=>{const it=document.createElement("div"); it.className="womi-item"; it.dataset.k=o.key; it.textContent=o.name; it.onclick=()=>select(o.key); grid.appendChild(it);});
  }
  const EXPL={automatizacion:"Conectamos formularios, CRM y correos con n8n. Flujos verificables y alertas.",integraciones:"APIs y Supabase con RLS, auditoría y escalabilidad.",web:"Landing y apps modulares, SEO y performance real.",chatbot:"Chatbot guiado (sin bucles) con intención + handoff a humano por n8n.",reportes:"KPIs, embudos y exportables para decisiones.",pagos:"Submódulo/pasarela (Stripe/Wompi/PayPal) en repo aparte."};
  function select(k){modal.setAttribute("data-k",k); const x=document.getElementById("womi-expl"); if(x) x.textContent=EXPL[k]||"Servicio seleccionado.";}
  let idle=null; function resetIdle(){clearTimeout(idle); idle=setTimeout(()=>bubble.style.display="block", 35000);}
  ["mousemove","keydown","scroll","touchstart"].forEach(ev=>document.addEventListener(ev,()=>{bubble.style.display="none";resetIdle();},{passive:true}));
  resetIdle();
  function open(){modal.style.display="flex"; if(offerings[0]) select(offerings[0].key);}
  function close(){modal.style.display="none";}
  avatar.onclick=open; bubble.onclick=open; modal.onclick=e=>{if(e.target===modal) close();};
  modal.querySelector("#womi-close").onclick=close;
  modal.querySelector("#womi-cta").onclick=async()=>{
    const k=modal.getAttribute("data-k")||"general";
    const name=prompt("Tu nombre:"); const email=prompt("Tu correo:"); const msg=prompt("Cuéntanos brevemente tu necesidad:");
    if(!name||!email) return alert("Faltan datos.");
    try{ await n8nIntegration.sendLead({name,email,message:msg,interest:k}); alert("¡Recibido! Te contactaremos en breve."); close(); }
    catch(e){ console.error(e); alert("No fue posible enviar tu mensaje."); }
  };
})();