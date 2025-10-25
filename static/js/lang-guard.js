(function(){
  const FALLBACK="es";
  const HREF_PAT=/(index_en\.html|index_pt\.html|index_fr\.html|index_de\.html|\/lang\/)/i;
  function setLang(lang){
    const code=(lang||FALLBACK).slice(0,2).toLowerCase();
    localStorage.setItem("preferredLanguage",code);
    document.documentElement.lang=code;
    if(window.i18nSet){window.i18nSet(code);}else{console.warn("[lang-guard] i18nSet no definido");}
  }
  document.addEventListener("click",(ev)=>{
    let el=ev.target.closest('[data-lang],a[id^="lang-"],a[href*="index_en"],a[href*="index_pt"],a[href*="index_fr"],a[href*="index_de"],a[href*="/lang/"]');
    if(!el)return;
    ev.preventDefault();
    const d=el.getAttribute("data-lang");const id=el.id||"";
    let code=d||(id.startsWith("lang-")?id.replace("lang-",""):null);
    if(!code){const href=(el.getAttribute("href")||"").toLowerCase();
      if(HREF_PAT.test(href)){
        code=href.includes("index_en")?"en":href.includes("index_pt")?"pt":href.includes("index_de")?"de":href.includes("index_fr")?"fr":FALLBACK;
      }}
    setLang(code||FALLBACK);
  },true);
})();