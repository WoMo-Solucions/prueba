(function(){
  const SEL={box:"#chatbot",input:"#chat-input",send:"#chat-send"};
  const PROJECTS_URL="/proyectos/proyecto.json"; const FAQ_URL="/static/data/faq.json";
  const st={step:"idle",intent:null,lang:(localStorage.getItem("preferredLanguage")||"es").slice(0,2),
    name:null,email:null,project:null,details:null,projects:[],faq:[]};
  const el=s=>document.querySelector(s);
  function say(m,who="bot"){const d=document.createElement("div");d.className=`msg ${who}`;d.textContent=m;el(SEL.box)&&el(SEL.box).appendChild(d);el(SEL.box)&& (el(SEL.box).scrollTop=el(SEL.box).scrollHeight);}
  const valEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  async function loadProjects(){try{const r=await fetch(PROJECTS_URL,{cache:"no-store"});const data=await r.json();
    st.projects=(Array.isArray(data)?data:(data.items||[])).map((p,i)=>({
      key:(p.key||p.id||`p${i+1}`).toString(),name:p.name||p.titulo||p.nombre||`Proyecto ${i+1}`,desc:p.desc||p.descripcion||"",price:p.price||p.precio||null
    }));}catch{st.projects=[];}}
  async function loadFAQ(){try{const r=await fetch(FAQ_URL,{cache:"no-store"});st.faq=await r.json();}catch{st.faq=[];}}
  function listProjects(){if(!el(SEL.box))return;const lines=(st.projects.length?st.projects:[{key:"PortiFy",name:"PortiFy"},{key:"ProTrack",name:"ProTrack"}]).map(p=>`• ${p.name} (${p.key})`).join("\n");say("¿Sobre cuál proyecto quieres hablar? Escribe el código entre paréntesis.\n"+lines);}
  function showFAQ(){if(!st.faq.length||!el(SEL.box))return;const top=st.faq.slice(0,3).map(f=>`• ${f.q}`).join("\n");say("Preguntas frecuentes:\n"+top+"\n(Escribe la pregunta o 'cotización').");}
  function reset(){st.step="idle";st.intent=null;st.name=st.email=st.project=st.details=null;}
  async function start(intent){st.intent=intent||"discovery";await Promise.all([loadProjects(),loadFAQ()]);st.step="pick";listProjects();}
  function next(){if(!st.name){st.step="ask_name";return say("¿Cuál es tu nombre?");}
    if(!st.email){st.step="ask_email";return say("¿Cuál es tu correo?");}
    if(!st.details){st.step="ask_details";return say("Cuéntame el alcance (usuarios, módulos, fecha objetivo, etc.).");}
    st.step="confirm";const price=st.project?.price?`• Precio/desde: ${st.project.price}\n`:"";
    say(`Confirmo:
• Proyecto: ${st.project?.name}
${price}• Nombre: ${st.name}
• Correo: ${st.email}
• Detalles: ${st.details}

¿Envío tu solicitud? (sí/no)`);}
  async function onUser(t){
    t=(t||"").trim(); if(/^(salir|cancelar|menu)$/i.test(t)){say("Cerrado. Si necesitas, escribe 'cotización', 'demo' o 'servicios'.");return reset();}
    const fq=st.faq.find(x=>new RegExp(x.rx||"^$","i").test(t)); if(fq && st.step==="idle"){say(fq.a);return;}
    switch(st.step){
      case "idle":
        if(/coti|precio|licen|valor/i.test(t))return start("quote");
        if(/demo|ver|muestra/i.test(t))return start("demo");
        if(/servi|proyec|ayuda|info/i.test(t)){await start("discovery");showFAQ();return;}
        say("Hola 👋 Puedo ayudarte con **cotización**, **demo** o dudas sobre nuestros **proyectos**. Escribe 'cotización' para empezar.");break;
      case "pick":{
        const pick=st.projects.find(p=>p.key.toLowerCase()===t.toLowerCase());
        if(!pick){say("No identifiqué ese código. Intenta de nuevo (o escribe 'salir').");return listProjects();}
        st.project=pick; return next();
      }
      case "ask_name": if(t.length<2){say("Nombre muy corto, ¿puedes confirmarlo?");return;} st.name=t; return next();
      case "ask_email": if(!valEmail(t)){say("Formato de correo no válido. Ej: nombre@dominio.com");return;} st.email=t; return next();
      case "ask_details": st.details=t; return next();
      case "confirm":
        if(!/^s[ií]$/i.test(t)){say("Entendido, no envío. Puedes escribir 'cotización' cuando quieras reiniciar."); return reset();}
        try{
          await n8nIntegration.sendQuote({intent:st.intent||"quote",projectKey:st.project.key,projectName:st.project.name,name:st.name,email:st.email,details:st.details,language:st.lang});
          say("¡Listo! Envié tu solicitud. Te contactaremos pronto.");
          n8nIntegration.track("quote_submitted",{project:st.project.key});
        }catch(e){console.error(e);say("Hubo un problema enviando tu solicitud. Intenta más tarde.");}
        return reset();
    }
  }
  function wire(){const box=el(SEL.box),input=el(SEL.input),send=el(SEL.send); if(!input||!send)return;
    send.onclick=()=>{const v=input.value;if(!v)return;say(v,"you");input.value="";onUser(v);};
    input.onkeydown=e=>{if(e.key==="Enter")send.click();};
    setTimeout(()=>say("Hola 👋 Soy WoMi. ¿Quieres una **cotización**, una **demo**, o saber de nuestros **proyectos**?"),400);
  }
  document.addEventListener("DOMContentLoaded", wire);
})();