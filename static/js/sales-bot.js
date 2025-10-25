
(function(){
  const SEL={box:"#chatbot",input:"#chat-input",send:"#chat-send"};
  const st={step:"greet",name:null,email:null,topic:null,details:null,errors:0};
  const el=s=>document.querySelector(s);
  function say(m,who="bot"){const d=document.createElement("div");d.className=`msg ${who}`;d.textContent=m;el(SEL.box)&&el(SEL.box).appendChild(d);el(SEL.box)&&(el(SEL.box).scrollTop=el(SEL.box).scrollHeight);}
  const valEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  function ask(q,next){ st.step=next; say(q); }
  function offerHandoff(){ say("¿Quieres comunicarte con nuestro personal certificado? (sí/no)"); st.step="handoff_confirm"; }
  function offerQuote(){ say("¿Deseas que te enviemos una cotización? (sí/no)"); st.step="quote_offer"; }
  function greet(){ say("Hola 👋 Soy WoMi. Puedo ayudarte con una **cotización**, agendar una **sesión**, o responder **preguntas**."); say("Cuéntame brevemente tu necesidad (o escribe 'cotización' / 'asesor')."); st.step="intent"; }
  async function onUser(t){
    t=(t||"").trim(); if(!t) return;
    switch(st.step){
      case "greet": return greet();
      case "intent":
        if(/coti|precio|licen|valor/i.test(t)){ st.topic="quote"; return ask("Perfecto, ¿cómo te llamas?", "name"); }
        if(/asesor|humano|llamar|contact/i.test(t)){ st.topic="handoff"; return ask("Claro, ¿tu nombre?", "name_handoff"); }
        if(/demo|muestra|ver/i.test(t)){ st.topic="demo"; return ask("¡Genial! ¿Cuál es tu nombre?", "name"); }
        st.topic="qa"; say("Entiendo, puedo ayudarte. Haré algunas preguntas rápidas."); return ask("¿Cuál es tu nombre?", "name");
      case "name":
        if(t.length<2){ say("Nombre muy corto, ¿puedes confirmarlo?"); return; }
        st.name=t; return ask("¿Cuál es tu correo?", "email");
      case "email":
        if(!valEmail(t)){ say("Formato de correo no válido. Ej: nombre@dominio.com"); return; }
        st.email=t; return ask("Describe el alcance (usuarios, módulos, fecha objetivo, etc.)", "details");
      case "details":
        st.details=t; say("Gracias. Con esta info ya puedo preparar la propuesta."); return offerQuote();
      case "quote_offer":
        if(/^s[ií]$/i.test(t)){
          try{ await n8nIntegration.sendQuote({name:st.name,email:st.email,details:st.details,source:"chatbot"}); say("¡Listo! Te enviamos un correo de confirmación."); }
          catch(e){ say("Tuvimos un problema enviando la cotización. Intenta más tarde."); }
          return offerHandoff();
        } else { return offerHandoff(); }
      case "handoff_confirm":
        if(/^s[ií]$/i.test(t)){
          try{ await n8nIntegration.handoff({name:st.name,email:st.email,topic:st.topic||"general",details:st.details,source:"chatbot"}); say("Un asesor se comunicará contigo pronto."); }
          catch(e){ say("No pudimos agendar ahora, lo intentaremos nuevamente."); }
          st.step="greet"; return say("¿Hay algo más en lo que te pueda ayudar?");
        } else { st.step="greet"; return say("Perfecto, quedo atento si necesitas algo más."); }
      case "name_handoff":
        if(t.length<2){ say("Nombre muy corto, ¿puedes confirmarlo?"); return; }
        st.name=t; return ask("Tu correo:", "email_handoff");
      case "email_handoff":
        if(!valEmail(t)){ say("Formato de correo no válido. Ej: nombre@dominio.com"); return; }
        st.email=t; return ask("Cuéntame brevemente el motivo:", "details_handoff");
      case "details_handoff":
        st.details=t;
        try{ await n8nIntegration.handoff({name:st.name,email:st.email,details:st.details,source:"chatbot"}); say("Listo. Un asesor te contactará."); }
        catch(e){ say("Tuvimos un problema, intentaremos de nuevo."); }
        st.step="greet"; return say("¿Deseas además una cotización? (sí/no)");
      default:
        st.errors=(st.errors||0)+1;
        if(st.errors>=2){ st.errors=0; return offerHandoff(); }
        return say("No estoy seguro de haber entendido. ¿Puedes reformular o escribir 'cotización' / 'asesor'?");
    }
  }
  function wire(){
    const input=el(SEL.input),send=el(SEL.send);
    if(!input||!send||!el(SEL.box)) return;
    send.onclick=()=>{ const v=input.value; if(!v) return; say(v,"you"); input.value=""; onUser(v); };
    input.onkeydown=e=>{ if(e.key==="Enter") send.click(); };
    greet();
  }
  document.addEventListener("DOMContentLoaded", wire);
})();