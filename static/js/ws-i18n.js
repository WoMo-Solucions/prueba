(function(){
  const MAP={es:"static/i18n/es.json",en:"static/i18n/en.json",pt:"static/i18n/pt.json",de:"static/i18n/de.json"}; let dict={};
  async function load(lang){const r=await fetch(MAP[lang]||MAP.es,{cache:"no-store"}); dict=await r.json(); apply(); localStorage.setItem("preferredLanguage",lang); document.documentElement.lang=lang; const ci=document.querySelector('#ws-chat-input'); if(ci){ const ph=ci.getAttribute('data-placeholder-'+lang); if(ph) ci.placeholder=ph; }}
  function apply(){document.querySelectorAll("[data-i18n]").forEach(n=>{const k=n.getAttribute("data-i18n"); const v=k.split(".").reduce((a,b)=>a&&a[b],dict); if(typeof v==="string") n.textContent=v;});}
  window.wsI18nSet=(l)=>load(l);
  document.addEventListener("DOMContentLoaded",()=>{load(localStorage.getItem("preferredLanguage")||(document.documentElement.lang||"es").slice(0,2));});

  // Intercepta clics a banderas/links que lleven a index_xx.html y cambia idioma en la misma página
  document.addEventListener("click",(e)=>{
    const a=e.target.closest("a,button");
    if(!a) return;
    const href=a.getAttribute("href")||"";
    const id=a.getAttribute("id")||"";
    const data=a.dataset.lang||a.dataset.language;
    const match = href.match(/index[_-](es|en|pt|de)\.html/i) || id.match(/lang-(es|en|pt|de)/i) || (data && [data]);
    const code = match ? (match[1]|| (Array.isArray(match)?match[0]:match) ) : null;
    if(code){ e.preventDefault(); load(code.toLowerCase()); }
  }, true);
})();