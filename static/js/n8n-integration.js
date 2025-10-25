window.n8nIntegration=(function(){
  const C="/static/config.json",Q="womo_offline_queue_v1";const H=new Set();let cfg=null;
  async function load(){if(cfg)return cfg;const r=await fetch(C,{cache:"no-store"});cfg=await r.json();return cfg}
  function enq(job){const q=JSON.parse(localStorage.getItem(Q)||"[]");q.push(job);localStorage.setItem(Q,JSON.stringify(q))}
  async function flush(){const q=JSON.parse(localStorage.getItem(Q)||"[]");const rest=[];for(const job of q){try{await post(job.path,job.body,1)}catch{rest.push(job)}}localStorage.setItem(Q,JSON.stringify(rest))}
  window.addEventListener("online",flush);
  function hash(o){try{return btoa(unescape(encodeURIComponent(JSON.stringify(o))).slice(0,128))}catch(e){return Math.random().toString(36).slice(2)}}
  async function post(path,payload,attempt=1){
    const {n8nWebhookUrl,siteId}=await load(); if(!n8nWebhookUrl) throw new Error("Configura n8nWebhookUrl en static/config.json");
    const body={siteId:siteId||"womo-site",url:location.href,ua:navigator.userAgent,ts:new Date().toISOString(),...payload};
    const h=hash(body); if(H.has(h)) return {ok:true,deduped:true}; H.add(h);
    try{
      const res=await fetch(n8nWebhookUrl+(path||""),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if(!res.ok) throw new Error("HTTP "+res.status);
      return await res.json().catch(()=>({ok:true}));
    }catch(e){
      if(!navigator.onLine){ enq({path,body}); return {ok:false,queued:true} }
      if(attempt<3){ await new Promise(r=>setTimeout(r,800*attempt)); return post(path,payload,attempt+1) }
      enq({path,body}); return {ok:false,queued:true}
    }
  }
  return {
    sendLead:p=>post("/lead",{intent:"lead",...p}),
    sendQuote:p=>post("/quote",{intent:"quote",...p}),
    handoff:p=>post("/handoff",{intent:"handoff",...p}),
    sendMsg:p=>post("/msg",{intent:"msg",...p}),
    track:(e,m={})=>post("/event",{intent:"event",event:e,meta:m})
  }
})();