(function () {
  const UI = { box: "#chatbot", input: "#chat-input", send: "#chat-send" };
  const el = (s) => document.querySelector(s);
  const say = (m, who = "bot") => {
    const d = document.createElement("div");
    d.className = `msg ${who}`;
    d.textContent = m;
    el(UI.box)?.appendChild(d);
    el(UI.box).scrollTop = el(UI.box).scrollHeight;
  };
  const state = { name:null, email:null, history:[] };

  function push(role, text){ state.history.push({role, text}); }
  async function askN8N(text){
    try {
      const res = await n8nIntegration.sendMsg({
        text,
        name: state.name,
        email: state.email,
        history: state.history.slice(-10),
        source: "chatbot"
      });
      return res; // { reply, intent, suggest_quote, suggest_handoff }
    } catch {
      return { reply: "Puedo pasarte con un asesor para continuar.", intent: "handoff_suggest", suggest_handoff: true };
    }
  }

  async function onUser(text){
    text = (text||"").trim(); if(!text) return;
    say(text,"you"); push("user",text);

    if(!state.name){ state.name=text; say("Gracias, ¿tu correo?"); return; }
    if(!state.email){
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)){ say("Formato de correo inválido."); return; }
      state.email=text; say("Perfecto. Cuéntame tu necesidad y te ayudo."); return;
    }

    const { reply, suggest_quote, suggest_handoff } = await askN8N(text);
    if(reply){ say(reply); push("bot", reply); }

    if(/cotiz|precio|valor|propuest/i.test(text) || suggest_quote){ window.WSForms?.openQuote(); return; }
    if(/asesor|humano|llamar|contact/i.test(text) || suggest_handoff){ window.WSForms?.openHandoff(); return; }
  }

  function wire(){
    const input=el(UI.input), send=el(UI.send), box=el(UI.box);
    if(!input||!send||!box) return;
    setTimeout(()=>{
      say("Hola 👋 Soy WoMi. Puedo ayudarte con **automatización (n8n)**, **integraciones**, **web** y **reportes**.");
      say("Para empezar dime tu nombre.");
    }, 300);
    send.onclick=()=>{ const v=input.value; if(!v) return; input.value=''; onUser(v); };
    input.onkeydown=(e)=>{ if(e.key==='Enter') send.click(); };
  }
  document.addEventListener("DOMContentLoaded", wire);
})();