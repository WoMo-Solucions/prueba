(function(){
  const MAP = { es: "static/i18n/es.json", en: "static/i18n/en.json", pt:"static/i18n/pt.json", de:"static/i18n/de.json" };
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
  window.i18nSet = (lang)=>load(lang);
  document.addEventListener("DOMContentLoaded", ()=>{
    load(localStorage.getItem("preferredLanguage") || (document.documentElement.lang||"es").slice(0,2));
  });
})();