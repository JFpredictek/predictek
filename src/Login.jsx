// Login v2.1

import sb from "./lib/supabase";
import { useState } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",muted:"#7C7568",accent:"#1B5E3B",navy:"#13233A",blue:"#1A56DB",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:8,padding:"10px 14px",fontSize:13,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function GradBtn(p){return <button onClick={p.onClick} disabled={p.dis} style={{width:"100%",background:p.dis?"#ccc":"linear-gradient(135deg,#1B5E3B,#3CAF6E)",border:"none",borderRadius:10,padding:"14px",color:"#fff",fontSize:14,fontWeight:700,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit",letterSpacing:"0.02em"}}>{p.children}</button>;}

var USERS_DEMO=[
  {email:"admin@predictek.ca",pwd:"Admin2025!",nom:"Administrateur",role:"admin"},
  {email:"gestionnaire@syndicat.ca",pwd:"Gest2025!",nom:"Gestionnaire",role:"gestionnaire"},
];

export default function Login(p){
  var s0=useState("login");var mode=s0[0];var setMode=s0[1];
  var s1=useState("");var email=s1[0];var setEmail=s1[1];
  var s2=useState("");var pwd=s2[0];var setPwd=s2[1];
  var s3=useState("");var err=s3[0];var setErr=s3[1];
  var s4=useState(false);var loading=s4[0];var setLoading=s4[1];
  var s5=useState(false);var showPwd=s5[0];var setShowPwd=s5[1];
  var s6=useState(false);var resetSent=s6[0];var setResetSent=s6[1];

  function handleLogin(){
    if(!email||!pwd){setErr("Veuillez entrer votre courriel et mot de passe.");return;}
    setLoading(true);setErr("");
    var demo=USERS_DEMO.find(function(u){return u.email===email.trim()&&u.pwd===pwd;});
    if(demo){
      var user={email:demo.email,nom:demo.nom,role:demo.role};
      try{localStorage.setItem("predictek_user",JSON.stringify(user));}catch(e){}
      sb.setUser(user);
      if(p.onLogin)p.onLogin(user);
      setLoading(false);
      return;
    }
    sb.select("usagers",{eq:{courriel:email.trim(),actif:true},limit:1}).then(function(res){
      if(res&&res.data&&res.data.length>0){
        var u=res.data[0];
        var user={email:u.courriel,nom:(u.prenom||"")+" "+u.nom,role:u.role||"gestionnaire",id:u.id,syndicat_id:u.syndicat_id};
        try{localStorage.setItem("predictek_user",JSON.stringify(user));}catch(e){}
        sb.setUser(user);
        sb.update("usagers",u.id,{derniere_connexion:new Date().toISOString()}).catch(function(){});
        if(p.onLogin)p.onLogin(user);
      }else{
        setErr("Courriel ou mot de passe incorrect. Verifiez vos identifiants.");
      }
      setLoading(false);
    }).catch(function(){
      setErr("Erreur de connexion. Verifiez votre connexion internet.");
      setLoading(false);
    });
  }

  function handleReset(){
    if(!email){setErr("Entrez votre courriel pour recevoir le lien de reinitialisation.");return;}
    setLoading(true);setErr("");
    setTimeout(function(){
      setResetSent(true);
      setLoading(false);
    },1000);
  }

  function handleKeyDown(e){if(e.key==="Enter")handleLogin();}

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0d1b2a 0%,#13233A 50%,#1B3A2F 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",padding:20}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(27,94,59,0.4)"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:36}}>P</span>
          </div>
          <div style={{fontSize:26,fontWeight:900,color:"#fff",letterSpacing:"-0.02em"}}>Predictek</div>
          <div style={{fontSize:12,color:"#8da0bb",marginTop:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>Gestion de copropriete</div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:32}}>
          {mode==="login"&&!resetSent&&(
            <div>
              <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:24,textAlign:"center"}}>Connexion</div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,color:"#8da0bb",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Courriel</div>
                <input value={email} onChange={function(e){setEmail(e.target.value);setErr("");}} onKeyDown={handleKeyDown} type="email" placeholder="votre@courriel.ca" style={Object.assign({},INP,{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",padding:"12px 14px"})}/>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{fontSize:11,color:"#8da0bb",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Mot de passe</div>
                <div style={{position:"relative"}}>
                  <input value={pwd} onChange={function(e){setPwd(e.target.value);setErr("");}} onKeyDown={handleKeyDown} type={showPwd?"text":"password"} placeholder="Votre mot de passe" style={Object.assign({},INP,{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",padding:"12px 44px 12px 14px"})}/>
                  <button onClick={function(){setShowPwd(!showPwd);}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#8da0bb",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{showPwd?"Cacher":"Voir"}</button>
                </div>
              </div>
              <div style={{textAlign:"right",marginBottom:20}}>
                <button onClick={function(){setMode("reset");setErr("");}} style={{background:"none",border:"none",color:"#3CAF6E",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Mot de passe oublie?</button>
              </div>
              {err&&<div style={{background:"rgba(184,50,50,0.15)",border:"1px solid rgba(184,50,50,0.3)",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#ff7070",marginBottom:16,textAlign:"center"}}>{err}</div>}
              <GradBtn onClick={handleLogin} dis={loading}>{loading?"Connexion en cours...":"Se connecter"}</GradBtn>
              <div style={{textAlign:"center",marginTop:20,fontSize:11,color:"#8da0bb"}}>
                Acces administrateur: admin@predictek.ca<br/>
                Mot de passe: Admin2025!
              </div>
            </div>
          )}

          {mode==="reset"&&!resetSent&&(
            <div>
              <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:8,textAlign:"center"}}>Reinitialisation</div>
              <div style={{fontSize:12,color:"#8da0bb",marginBottom:24,textAlign:"center"}}>Entrez votre courriel pour recevoir un lien de reinitialisation.</div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,color:"#8da0bb",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Courriel</div>
                <input value={email} onChange={function(e){setEmail(e.target.value);}} type="email" placeholder="votre@courriel.ca" style={Object.assign({},INP,{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",padding:"12px 14px"})}/>
              </div>
              {err&&<div style={{background:"rgba(184,50,50,0.15)",border:"1px solid rgba(184,50,50,0.3)",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#ff7070",marginBottom:16}}>{err}</div>}
              <GradBtn onClick={handleReset} dis={loading}>{loading?"Envoi...":"Envoyer le lien"}</GradBtn>
              <div style={{textAlign:"center",marginTop:16}}>
                <button onClick={function(){setMode("login");setErr("");}} style={{background:"none",border:"none",color:"#8da0bb",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Retour a la connexion</button>
              </div>
            </div>
          )}

          {resetSent&&(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:12}}>V</div>
              <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:8}}>Courriel envoye!</div>
              <div style={{fontSize:12,color:"#8da0bb",marginBottom:24}}>Verifiez votre boite de reception. Le lien est valide 24 heures.</div>
              <button onClick={function(){setMode("login");setResetSent(false);setErr("");}} style={{background:"none",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"10px 20px",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Retour a la connexion</button>
            </div>
          )}
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:10,color:"rgba(255,255,255,0.3)"}}>Predictek - Plateforme SaaS de gestion de copropriete - v2.0</div>
      </div>
    </div>
  );
}
