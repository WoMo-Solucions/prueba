window.wsN8n=(function(){
  const C="static/config.json"; let cfg=null;
  async function load(){ if(cfg) return cfg; try{ const r=await fetch(C,{cache:'no-store'}); cfg=await r.json(); }catch(e){ cfg={n8nWebhookUrl:'',siteId:'womo-site'} } return cfg; }
  async function post(path,payload){ const {n8nWebhookUrl,siteId}=await load(); if(!n8nWebhookUrl){ console.warn('Configura static/config.json'); return {ok:false}; } const body={siteId:siteId||'womo-site',ts:new Date().toISOString(),...payload}; const res=await fetch(n8nWebhookUrl+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!res.ok) throw new Error('HTTP '+res.status); return res.json().catch(()=>({ok:true})); }
  return { msg:(p)=>post('/msg',{intent:'msg',...p}), quote:(p)=>post('/quote',{intent:'quote',...p}), handoff:(p)=>post('/handoff',{intent:'handoff',...p}) };
})();