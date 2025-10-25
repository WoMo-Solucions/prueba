
(function(){
  const MAP = { es: "/static/i18n/es.json", en: "/static/i18n/en.json" };
  let dict = {};
  async function load(lang){
    const url = MAP[lang] || MAP.es;
    const r = await fetch(url, {cache:"no-store"});
    dict = await r.json();
    apply();
    localStorage.setItem("preferredLanguage", lang);
    document.documentElement.lang = lang;
  }
  function apply(){
    document.querySelectorAll("[data-i18n]").forEach(n=>{
      const key = n.getAttribute("data-i18n");
      const val = key.split(".").reduce((a,k)=>a&&a[k], dict);
      if(typeof val==="string") n.textContent = val;
    });
  }
  function init(){ load(localStorage.getItem("preferredLanguage") || (document.documentElement.lang||"es").slice(0,2)); }
  window.i18nSet = (lang)=>load(lang);
  document.addEventListener("click", (e)=>{
    let el = e.target.closest && e.target.closest('[data-lang], a[id^="lang-"], a[href*="index_en"], a[href*="index_pt"], a[href*="index_de"], a[href*="index_fr"], a[href*="/lang/"]');
    if(!el) return;
    e.preventDefault();
    const data = el.getAttribute("data-lang");
    const id = el.id||"";
    const href = (el.getAttribute("href")||"").toLowerCase();
    const code = data || (id.startsWith("lang-")? id.replace("lang-","") : (href.includes("index_en")?"en":href.includes("index_pt")?"pt":href.includes("index_de")?"de":href.includes("index_fr")?"fr":"es"));
    window.i18nSet(code);
  }, true);
  document.addEventListener("DOMContentLoaded", init);
})();
