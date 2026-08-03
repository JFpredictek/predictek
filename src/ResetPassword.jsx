// ResetPassword v1.0 - traite le lien "Mot de passe oublie" de Supabase
// Affiche selon le cas: formulaire de nouveau mot de passe (jeton valide)
// ou message de lien expire (le lien de courriel est a usage unique).

import sb from "./lib/supabase";
import { useState } from "react";

var INP={width:"100%",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"12px 14px",fontSize:13,fontFamily:"inherit",background:"rgba(255,255,255,0.06)",color:"#fff",outline:"none",boxSizing:"border-box"};

function GradBtn(p){return <button onClick={p.onClick} disabled={p.dis} style={{width:"100%",background:p.dis?"#ccc":"linear-gradient(135deg,#1B5E3B,#3CAF6E)",border:"none",borderRadius:10,padding:"14px",color:"#fff",fontSize:14,fontWeight:700,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit",letterSpacing:"0.02em"}}>{p.children}</button>;}

export default function ResetPassword(p){
  var s0=useState("");var pwd=s0[0];var setPwd=s0[1];
  var s1=useState("");var pwd2=s1[0];var setPwd2=s1[1];
  var s2=useState("");var err=s2[0];var setErr=s2[1];
  var s3=useState(false);var loading=s3[0];var setLoading=s3[1];
  var s4=useState(false);var done=s4[0];var setDone=s4[1];
  var s5=useState(false);var showPwd=s5[0];var setShowPwd=s5[1];

  function retourConnexion(){
    try{window.history.replaceState(null,"",window.location.pathname);}catch(e){}
    window.location.reload();
  }

  function valider(){
    if(!pwd||pwd.length<10){setErr("Le mot de passe doit contenir au moins 10 caracteres.");return;}
    if(pwd!==pwd2){setErr("Les deux mots de passe ne correspondent pas.");return;}
    setLoading(true);setErr("");
    sb.setNewPassword(p.token,pwd).then(function(res){
      if(res&&res.error){setErr(res.error.message);}
      else{setDone(true);}
      setLoading(false);
    }).catch(function(){setErr("Erreur de connexion. Verifiez votre connexion internet.");setLoading(false);});
  }

  var expire=!p.token;

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
          {expire&&(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:8}}>Lien expire ou invalide</div>
              <div style={{fontSize:12,color:"#8da0bb",marginBottom:24}}>Le lien de reinitialisation est a usage unique et expire rapidement. Retournez a la connexion et cliquez de nouveau sur "Mot de passe oublie?" pour recevoir un nouveau lien.</div>
              <GradBtn onClick={retourConnexion}>Retour a la connexion</GradBtn>
            </div>
          )}

          {!expire&&!done&&(
            <div>
              <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:8,textAlign:"center"}}>Nouveau mot de passe</div>
              <div style={{fontSize:12,color:"#8da0bb",marginBottom:24,textAlign:"center"}}>Choisissez un mot de passe fort: au moins 10 caracteres.</div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,color:"#8da0bb",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Nouveau mot de passe</div>
                <div style={{position:"relative"}}>
                  <input value={pwd} onChange={function(e){setPwd(e.target.value);setErr("");}} type={showPwd?"text":"password"} placeholder="Minimum 10 caracteres" style={INP}/>
                  <button onClick={function(){setShowPwd(!showPwd);}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#8da0bb",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{showPwd?"Cacher":"Voir"}</button>
                </div>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,color:"#8da0bb",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Confirmez le mot de passe</div>
                <input value={pwd2} onChange={function(e){setPwd2(e.target.value);setErr("");}} type={showPwd?"text":"password"} placeholder="Retapez le meme mot de passe" style={INP}/>
              </div>
              {err&&<div style={{background:"rgba(184,50,50,0.15)",border:"1px solid rgba(184,50,50,0.3)",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#ff7070",marginBottom:16,textAlign:"center"}}>{err}</div>}
              <GradBtn onClick={valider} dis={loading}>{loading?"Enregistrement...":"Enregistrer le nouveau mot de passe"}</GradBtn>
            </div>
          )}

          {done&&(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:8}}>Mot de passe change!</div>
              <div style={{fontSize:12,color:"#8da0bb",marginBottom:24}}>Votre nouveau mot de passe est enregistre. Vous pouvez maintenant vous connecter.</div>
              <GradBtn onClick={retourConnexion}>Aller a la connexion</GradBtn>
            </div>
          )}
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:10,color:"rgba(255,255,255,0.3)"}}>Predictek - Plateforme SaaS de gestion de copropriete - v2.0</div>
      </div>
    </div>
  );
}
