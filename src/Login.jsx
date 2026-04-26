import { useState } from "react";
import sb from "./lib/supabase";
var T={navy:"#13233A",accent:"#1B5E3B",accentG:"#3CAF6E",muted:"#7C7568",border:"#DDD9CF",red:"#B83232",redL:"#FDECEA"};
export default function Login({ onLogin }) {
  var s0=useState("");var email=s0[0];var setEmail=s0[1];
  var s1=useState("");var pwd=s1[0];var setPwd=s1[1];
  var s2=useState("");var err=s2[0];var setErr=s2[1];
  var s3=useState(false);var loading=s3[0];var setLoading=s3[1];
  async function submit(){
    if(!email||!pwd){setErr("Veuillez remplir tous les champs.");return;}
    setLoading(true);setErr("");
    var res=await sb.login(email,pwd);
    setLoading(false);
    if(res.error){setErr(res.error.message||"Connexion echouee.");}
    else{onLogin(sb.getUser());}
  }
  function onKey(e){if(e.key==="Enter")submit();}
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0D1B2A 0%,#13233A 60%,#1B5E3B 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif"}}>
      <div style={{background:"rgba(255,255,255,0.97)",borderRadius:18,padding:40,width:400,maxWidth:"95vw",boxShadow:"0 20px 60px rgba(0,0,0,0.35)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:28,fontFamily:"Georgia,serif"}}>P</span>
          </div>
          <div style={{fontSize:22,fontWeight:800,color:T.navy}}>Predictek</div>
          <div style={{fontSize:11,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:2}}>Gestion de copropriete</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Courriel</div>
          <input type="email" value={email} onChange={function(e){setEmail(e.target.value);}} onKeyDown={onKey} placeholder="admin@predictek.ca" autoFocus style={{width:"100%",border:"1px solid "+T.border,borderRadius:8,padding:"10px 12px",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Mot de passe</div>
          <input type="password" value={pwd} onChange={function(e){setPwd(e.target.value);}} onKeyDown={onKey} placeholder="..." style={{width:"100%",border:"1px solid "+T.border,borderRadius:8,padding:"10px 12px",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
        </div>
        {err&&<div style={{background:T.redL,border:"1px solid "+T.red+"44",borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,marginBottom:16}}>{err}</div>}
        <button onClick={submit} disabled={loading} style={{width:"100%",background:loading?"#ccc":"linear-gradient(135deg,#1B5E3B,#2E7D52)",border:"none",borderRadius:10,padding:13,color:"#fff",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
          {loading?"Connexion en cours...":"Se connecter"}
        </button>
        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:T.muted}}>Acces reserve aux employes Predictek</div>
      </div>
    </div>
  );
}
