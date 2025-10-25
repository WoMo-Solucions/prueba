window.n8nIntegration=(function(){
  const C="static/config.json",Q="womo_offline_queue_v1";
  let cfg=null; const H=new Set();
  async function load(){ if(cfg) return cfg; const r=await fetch(C,{cache:"no-store"}); cfg=await r.json(); return cfg; }
  function enq(job){ const q=JSON.parse(localStorage.getItem(Q)||"[]"); q.push(job); localStorage.setItem(Q,JSON.stringify(q)); }
  async function post(path,payload,attempt=1){
    const {n8nWebhookUrl,siteId}=await load();
    if(!n8nWebhookUrl){ console.warn("[n8n] Configura static/config.json"); return {ok:false}; }
    const body={siteId:siteId||"womo-site", ts:new Date().toISOString(), url:location.href, ...payload};
    try{
      const res=await fetch(n8nWebhookUrl+(path||""),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if(!res.ok) throw new Error("HTTP "+res.status);
      return await res.json().catch(()=>({ok:true}));
    }catch(e){
      if(attempt<3){ await new Promise(r=>setTimeout(r,700*attempt)); return post(path,payload,attempt+1); }
      enq({path,body}); return {ok:false,queued:true};
    }
  }
  return {
    sendMsg:(p)=>post("/msg",{intent:"msg",...p}),
    sendQuote:(p)=>post("/quote",{intent:"quote",...p}),
    handoff:(p)=>post("/handoff",{intent:"handoff",...p}),
    track:(e,m={})=>post("/event",{intent:"event",event:e,meta:m})
  };
})();