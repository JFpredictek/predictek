import { useState } from "react";
import sb from "./lib/supabase";

export default function Login({ onLogin }) {
  var s0 = useState(""); var email = s0[0]; var setEmail = s0[1];
  var s1 = useState(""); var password = s1[0]; var setPassword = s1[1];
  var s2 = useState(""); var err = s2[0]; var setErr = s2[1];
  var s3 = useState(false); var loading = s3[0]; var setLoading = s3[1];

  async function submit() {
    if(!email || !password) { setErr("Veuillez remplir tous les champs."); return; }
    setLoading(true); setErr("");
    var result = await sb.signIn(email, password);
    setLoading(false);
    if(result.error) { setErr(result.error.message || "Connexion echouee. Verifiez vos identifiants."); }
    else { onLogin(result.data.user); }
  }

  function onKey(e) { if(e.key === "Enter") submit(); }

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0D1B2A 0%,#13233A 50%,#1B5E3B 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif"}}>
      <div style={{background:"rgba(255,255,255,0.97)",borderRadius:18,padding:40,width:400,maxWidth:"95vw",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 4px 16px rgba(27,94,59,0.4)"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:28,fontFamily:"Georgia,serif"}}>P</span>
          </div>
          <div style={{fontSize:22,fontWeight:800,color:"#13233A"}}>Predictek</div>
          <div style={{fontSize:11,color:"#7C7568",letterSpacing:"0.08em",textTransform:"uppercase",marginTop:2}}>Gestion de copropriete</div>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"#7C7568",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Courriel</div>
          <input
            type="email"
            value={email}
            onChange={function(e){setEmail(e.target.value);}}
            onKeyDown={onKey}
            placeholder="admin@predictek.ca"
            style={{width:"100%",border:"1px solid #DDD9CF",borderRadius:8,padding:"10px 12px",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
            autoFocus
          />
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#7C7568",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Mot de passe</div>
          <input
            type="password"
            value={password}
            onChange={function(e){setPassword(e.target.value);}}
            onKeyDown={onKey}
            placeholder="--------"
            style={{width:"100%",border:"1px solid #DDD9CF",borderRadius:8,padding:"10px 12px",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
          />
        </div>

        {err&&<div style={{background:"#FDECEA",border:"1px solid #B8323244",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#B83232",marginBottom:16}}>{err}</div>}

        <button
          onClick={submit}
          disabled={loading}
          style={{width:"100%",background:loading?"#ccc":"linear-gradient(135deg,#1B5E3B,#2E7D52)",border:"none",borderRadius:10,padding:"13px",color:"#fff",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",boxShadow:loading?"none":"0 4px 14px rgba(27,94,59,0.4)"}}
        >
          {loading?"Connexion en cours...":"Se connecter"}
        </button>

        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:"#7C7568"}}>
          Acces reserve aux employes Predictek
        </div>
      </div>
    </div>
  );
}
