import { useState, useEffect } from "react";
import Hub from "./Hub";
import CRM from "./CRM";
import Fournisseurs from "./Fournisseurs";
import Gestionnaire from "./Gestionnaire";
import PortailCopro from "./PortailCopro";
import Notifications from "./Notifications";

var MODS=[
  {id:"hub",label:"Administration",icon:"H",desc:"Syndicats, usagers, fournisseurs"},
  {id:"crm",label:"CRM Support",icon:"C",desc:"Tickets, IA, bons de travail"},
  {id:"fournisseurs",label:"Fournisseurs",icon:"F",desc:"Vue globale tous syndicats"},
  {id:"gestionnaire",label:"Portail du CA",icon:"CA",desc:"Finances, reunions, unites"},
  {id:"copro",label:"Portail Coproprietaire",icon:"CO",desc:"Acces coproprietaire"},
  {id:"notif",label:"Notifications",icon:"N",desc:"Alertes et communications"},
];

function LogoUploader(p){
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
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <input type="file" accept="image/*" id="logoInput" onChange={handleFile} style={{display:"none"}}/>
      <button onClick={function(){document.getElementById("logoInput").click();}} style={{background:"#ffffff18",border:"1px solid #ffffff30",borderRadius:6,padding:"3px 9px",color:"#8da0bb",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Logo</button>
      {p.logo&&<button onClick={resetLogo} style={{background:"none",border:"none",color:"#55687a",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>x</button>}
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
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 14px",borderRight:"1px solid #ffffff15",height:"100%",flexShrink:0}}>
          {logo?(
            <img src={logo} alt="Logo" style={{width:30,height:30,borderRadius:6,objectFit:"contain",background:"#fff",padding:2}}/>
          ):(
            <div style={{width:30,height:30,borderRadius:6,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontWeight:900,fontSize:15,fontFamily:"Georgia,serif"}}>P</span>
            </div>
          )}
          <div>
            <div style={{fontSize:12,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",lineHeight:1}}>Predictek</div>
            <div style={{fontSize:8,color:"#3CAF6E",letterSpacing:"0.06em"}}>GESTION COPROPRIETE</div>
          </div>
          <LogoUploader logo={logo} onLogoChange={setLogo}/>
        </div>
        <div style={{display:"flex",height:"100%"}}>
          {MODS.map(function(m){var a=active===m.id;var isNotif=m.id==="notif";return(
            <button key={m.id} onClick={function(){setActive(m.id);}} style={{display:"flex",alignItems:"center",gap:6,padding:"0 12px",height:"100%",background:a?"#ffffff12":"none",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",cursor:"pointer",fontFamily:"Georgia,serif",whiteSpace:"nowrap",position:"relative"}}>
              <div style={{width:20,height:20,borderRadius:5,background:a?"#3CAF6E":"#ffffff18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:a?"#fff":"#8da0bb",flexShrink:0}}>{m.icon}</div>
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
        {active==="fournisseurs"&&<Fournisseurs/>}
        {active==="gestionnaire"&&<Gestionnaire/>}
        {active==="copro"&&<PortailCopro/>}
        {active==="notif"&&<Notifications/>}
      </div>
    </div>
  );
}
