import { useState, useEffect } from "react";
import Hub from "./Hub";
import CRM from "./CRM";
import Gestionnaire from "./Gestionnaire";
import PortailCopro from "./PortailCopro";
import Notifications from "./Notifications";
import FournisseursAdmin from "./FournisseursAdmin";

var MODS=[
  {id:"hub",label:"Administration",icon:"H",desc:"Syndicats, usagers, fournisseurs"},
  {id:"crm",label:"CRM Support",icon:"C",desc:"Tickets, IA, bons de travail"},
  {id:"fournisseurs",label:"Fournisseurs",icon:"F",desc:"Vue globale Predictek"},
  {id:"gestionnaire",label:"Portail du CA",icon:"CA",desc:"Finances, reunions, unites"},
  {id:"copro",label:"Portail Coproprietaire",icon:"CO",desc:"Acces coproprietaire"},
  {id:"notif",label:"Notifications",icon:"N",desc:"Alertes et communications"},
  {id:"params",label:"Parametres",icon:"PG",desc:"Logo, theme, configuration"},
];

function Parametres(p){
  var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF"};
  function handleFile(e){
    var file=e.target.files[0];
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      try{localStorage.setItem("predictek_logo",ev.target.result);}catch(err){}
      p.onLogoChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  }
  function resetLogo(){
    try{localStorage.removeItem("predictek_logo");}catch(e){}
    p.onLogoChange(null);
  }
  return(
    <div style={{padding:24,fontFamily:"Georgia,serif",maxWidth:700,margin:"0 auto"}}>
      <div style={{fontSize:18,fontWeight:800,color:T.navy,marginBottom:4}}>Parametres Predictek</div>
      <div style={{fontSize:12,color:T.muted,marginBottom:24}}>Configuration generale de la plateforme</div>

      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:24,marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:4}}>Logo de la plateforme</div>
        <div style={{fontSize:12,color:T.muted,marginBottom:20}}>Le logo s affiche dans la barre de navigation en haut de toutes les pages. Formats acceptes: PNG, JPG, SVG. Taille recommandee: 200x200px (carre).</div>
        <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
          <div style={{flexShrink:0}}>
            <div style={{fontSize:10,color:T.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Apercu actuel</div>
            <div style={{width:80,height:80,borderRadius:12,background:p.logo?"#fff":"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid "+T.border,overflow:"hidden"}}>
              {p.logo?(
                <img src={p.logo} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain",padding:4}}/>
              ):(
                <span style={{color:"#fff",fontWeight:900,fontSize:32,fontFamily:"Georgia,serif"}}>P</span>
              )}
            </div>
            <div style={{fontSize:10,color:T.muted,marginTop:6,textAlign:"center"}}>{p.logo?"Logo personnalise":"Logo par defaut"}</div>
          </div>
          <div style={{flex:1}}>
            <input type="file" accept="image/*" id="logoInputParams" onChange={handleFile} style={{display:"none"}}/>
            <div style={{display:"grid",gap:10}}>
              <button onClick={function(){document.getElementById("logoInputParams").click();}} style={{background:T.accent,color:"#fff",border:"none",borderRadius:8,padding:"12px 20px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>+</span>
                <div>
                  <div>Choisir un nouveau logo</div>
                  <div style={{fontSize:10,fontWeight:400,opacity:0.8}}>PNG, JPG ou SVG — max 2MB recommande</div>
                </div>
              </button>
              {p.logo&&(
                <button onClick={resetLogo} style={{background:T.redL,color:T.red,border:"1px solid "+T.red,borderRadius:8,padding:"10px 20px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                  Retirer le logo — Revenir au P vert par defaut
                </button>
              )}
            </div>
            {!p.logo&&(
              <div style={{marginTop:12,background:T.blueL,borderRadius:8,padding:"10px 14px",fontSize:11,color:T.blue}}>
                Aucun logo personnalise. Le logo Predictek par defaut est utilise. Cliquez sur le bouton ci-dessus pour ajouter le votre.
              </div>
            )}
            {p.logo&&(
              <div style={{marginTop:12,background:T.accentL,borderRadius:8,padding:"10px 14px",fontSize:11,color:T.accent}}>
                Logo personnalise actif. Il est sauvegarde dans votre navigateur et s affiche dans la barre de navigation.
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:24,marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:4}}>Informations de la plateforme</div>
        <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Informations generales sur votre instance Predictek.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[
            {l:"Nom de la plateforme",v:"Predictek"},
            {l:"Version",v:"v7.0 — Avril 2026"},
            {l:"Syndicats actifs",v:"3"},
            {l:"URL de l application",v:"predictek-d9sy.vercel.app"},
            {l:"Base de donnees",v:"Mode demo (Supabase a venir)"},
            {l:"Envois courriel",v:"Mode simulation (SendGrid a venir)"},
          ].map(function(item,i){return(
            <div key={i} style={{background:T.alt,borderRadius:8,padding:"10px 14px"}}>
              <div style={{fontSize:9,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{item.l}</div>
              <div style={{fontSize:12,fontWeight:600,color:T.text}}>{item.v}</div>
            </div>
          );})}
        </div>
      </div>

      <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:12,padding:20}}>
        <div style={{fontSize:13,fontWeight:700,color:T.amber,marginBottom:6}}>Prochaines fonctionnalites</div>
        <div style={{fontSize:12,color:T.amber,lineHeight:1.8}}>
          Connexion Supabase (donnees persistantes) | Envoi courriel reel (SendGrid) | SMS (Twilio) | Authentification securisee | Sauvegarde automatique | Theme de couleurs personnalisable
        </div>
      </div>
    </div>
  );
}

export default function App(){
  var s=useState("hub");var active=s[0];var setActive=s[1];
  var sl=useState(null);var logo=sl[0];var setLogo=sl[1];
  var sn=useState(2);var nbNotif=sn[0];

  useEffect(function(){
    try{var saved=localStorage.getItem("predictek_logo");if(saved)setLogo(saved);}catch(e){}
  },[]);

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#13233A",borderBottom:"1px solid #ffffff15",display:"flex",alignItems:"center",height:52,flexShrink:0,overflowX:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 16px",borderRight:"1px solid #ffffff15",height:"100%",flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:7,background:logo?"#fff":"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
            {logo?(
              <img src={logo} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain",padding:2}}/>
            ):(
              <span style={{color:"#fff",fontWeight:900,fontSize:16,fontFamily:"Georgia,serif"}}>P</span>
            )}
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",lineHeight:1}}>Predictek</div>
            <div style={{fontSize:8,color:"#3CAF6E",letterSpacing:"0.06em"}}>GESTION COPROPRIETE</div>
          </div>
        </div>
        <div style={{display:"flex",height:"100%"}}>
          {MODS.map(function(m){var a=active===m.id;var isNotif=m.id==="notif";return(
            <button key={m.id} onClick={function(){setActive(m.id);}} style={{display:"flex",alignItems:"center",gap:6,padding:"0 12px",height:"100%",background:a?"#ffffff12":"none",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",cursor:"pointer",fontFamily:"Georgia,serif",whiteSpace:"nowrap",position:"relative"}}>
              <div style={{width:20,height:20,borderRadius:5,background:a?"#3CAF6E":"#ffffff18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,color:a?"#fff":"#8da0bb",flexShrink:0}}>{m.icon}</div>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:10,fontWeight:a?700:400,color:a?"#fff":"#8da0bb"}}>{m.label}</div>
                <div style={{fontSize:7,color:a?"#3CAF6E":"#55687a"}}>{m.desc}</div>
              </div>
              {isNotif&&nbNotif>0&&<div style={{position:"absolute",top:8,right:6,width:14,height:14,borderRadius:"50%",background:"#B83232",color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{nbNotif}</div>}
            </button>
          );})}
        </div>
      </div>
      <div style={{flex:1,background:"#F5F3EE",overflow:"auto"}}>
        {active==="hub"&&<Hub/>}
        {active==="crm"&&<CRM/>}
        {active==="fournisseurs"&&<FournisseursAdmin/>}
        {active==="gestionnaire"&&<Gestionnaire/>}
        {active==="copro"&&<PortailCopro/>}
        {active==="notif"&&<Notifications/>}
        {active==="params"&&<Parametres logo={logo} onLogoChange={setLogo}/>}
      </div>
    </div>
  );
}
