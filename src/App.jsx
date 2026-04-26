import { useState, useEffect } from "react";
import Hub from "./Hub";
import CRM from "./CRM";
import FournisseursAdmin from "./FournisseursAdmin";
import Gestionnaire from "./Gestionnaire";
import PortailCopro from "./PortailCopro";
import Notifications from "./Notifications";
import Comptabilite from "./Comptabilite";
import ModuleIA from "./ModuleIA";
import ModuleHistorique from "./Historique";
import Login from "./Login";

var MODS=[
  {id:"hub",label:"Predictek",icon:"P"},
  {id:"crm",label:"CRM Support",icon:"C"},
  {id:"fournisseurs",label:"Fournisseurs",icon:"F"},
  {id:"gestionnaire",label:"Portail CA",icon:"CA"},
  {id:"copro",label:"Portail Copro",icon:"CO"},
  {id:"notif",label:"Notifications",icon:"N"},
  {id:"compta",label:"Comptabilite",icon:"CPA"},
  {id:"ia",label:"Intelligence IA",icon:"IA"},
  {id:"historique",label:"Historique",icon:"HIS"},
];

export default function App(){
  var s0=useState("hub");var active=s0[0];var setActive=s0[1];
  var s1=useState(null);var logo=s1[0];var setLogo=s1[1];
  var s2=useState(null);var user=s2[0];var setUser=s2[1];
  var s3=useState(true);var checking=s3[0];var setChecking=s3[1];

  useEffect(function(){
    // Check existing session
    try{
      var token=localStorage.getItem("predictek_token");
      var savedUser=JSON.parse(localStorage.getItem("predictek_user")||"null");
      if(token&&savedUser){setUser(savedUser);}
      var savedLogo=localStorage.getItem("predictek_logo");
      if(savedLogo)setLogo(savedLogo);
    }catch(e){}
    setChecking(false);

    function onSt(e){if(e.key==="predictek_logo")setLogo(e.newValue);}
    window.addEventListener("storage",onSt);
    return function(){window.removeEventListener("storage",onSt);};
  },[]);

  function handleLogin(u){
    setUser(u);
    try{localStorage.setItem("predictek_current_user",JSON.stringify({nom:u.email,id:u.id}));}catch(e){}
  }

  function handleLogout(){
    try{
      localStorage.removeItem("predictek_token");
      localStorage.removeItem("predictek_user");
      localStorage.removeItem("predictek_current_user");
    }catch(e){}
    setUser(null);
  }

  if(checking){
    return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#13233A",color:"#fff",fontFamily:"Georgia,serif",fontSize:18}}>Chargement...</div>;
  }

  if(!user){
    return <Login onLogin={handleLogin}/>;
  }

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#13233A",borderBottom:"1px solid #ffffff15",display:"flex",alignItems:"center",height:52,flexShrink:0,overflowX:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 14px",borderRight:"1px solid #ffffff15",height:"100%",flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:8,background:logo?"#fff":"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
            {logo?<img src={logo} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain",padding:2}}/>:<span style={{color:"#fff",fontWeight:900,fontSize:16,fontFamily:"Georgia,serif"}}>P</span>}
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",lineHeight:1}}>Predictek</div>
            <div style={{fontSize:8,color:"#3CAF6E",letterSpacing:"0.06em"}}>GESTION COPROPRIETE</div>
          </div>
        </div>
        <div style={{display:"flex",height:"100%",overflowX:"auto",flex:1}}>
          {MODS.map(function(m){
            var a=active===m.id;
            var isPred=m.id==="hub";
            var isIA=m.id==="ia";
            var isHIS=m.id==="historique";
            var bc=isPred?"#3CAF6E":isIA?"#9C6FD0":isHIS?"#B86020":"#3CAF6E";
            var ib=isPred?"#1B5E3B":isIA?"#6B3FA0":isHIS?"#B86020":"#3CAF6E";
            return(
              <button key={m.id} onClick={function(){setActive(m.id);}} style={{display:"flex",alignItems:"center",gap:6,padding:"0 12px",height:"100%",background:a?"#ffffff12":"none",border:"none",borderBottom:a?"2px solid "+bc:"2px solid transparent",cursor:"pointer",fontFamily:"Georgia,serif",whiteSpace:"nowrap",flexShrink:0}}>
                <div style={{width:22,height:22,borderRadius:6,background:a?ib:"#ffffff18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:a?"#fff":"#8da0bb",flexShrink:0}}>{m.icon}</div>
                <span style={{fontSize:10,fontWeight:a?700:400,color:a?"#fff":"#8da0bb"}}>{m.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{padding:"0 14px",borderLeft:"1px solid #ffffff15",height:"100%",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:10,color:"#8da0bb"}}>{user.email}</span>
          <button onClick={handleLogout} style={{background:"#ffffff18",border:"none",borderRadius:6,padding:"4px 10px",color:"#8da0bb",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Deconnexion</button>
        </div>
      </div>
      <div style={{flex:1,background:"#F5F3EE",overflow:"auto"}}>
        {active==="hub"&&<Hub/>}
        {active==="crm"&&<CRM/>}
        {active==="fournisseurs"&&<FournisseursAdmin/>}
        {active==="gestionnaire"&&<Gestionnaire/>}
        {active==="copro"&&<PortailCopro/>}
        {active==="notif"&&<Notifications/>}
        {active==="compta"&&<Comptabilite/>}
        {active==="ia"&&<ModuleIA/>}
        {active==="historique"&&<ModuleHistorique/>}
      </div>
    </div>
  );
}
