import { useState } from "react";
import Hub from "./Hub";
import CRM from "./CRM";
import Fournisseurs from "./Fournisseurs";
import Gestionnaire from "./Gestionnaire";
import PortailCopro from "./PortailCopro";
var MODS=[
  {id:"hub",label:"Administration",icon:"H",desc:"Syndicats, usagers, fournisseurs"},
  {id:"crm",label:"CRM Support",icon:"C",desc:"Tickets, IA, bons de travail"},
  {id:"fournisseurs",label:"Fournisseurs",icon:"F",desc:"Vue globale tous syndicats"},
  {id:"gestionnaire",label:"Portail du CA",icon:"CA",desc:"Finances, reunions, unites"},
  {id:"copro",label:"Portail Coproprietaire",icon:"CO",desc:"Acces coproprietaire"},
];
export default function App(){
  var s=useState("hub");var active=s[0];var setActive=s[1];
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#13233A",borderBottom:"1px solid #ffffff15",display:"flex",alignItems:"center",height:52,flexShrink:0,overflowX:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 16px",borderRight:"1px solid #ffffff15",height:"100%",flexShrink:0}}>
          <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:15,fontFamily:"Georgia,serif"}}>P</span>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",lineHeight:1}}>Predictek</div>
            <div style={{fontSize:8,color:"#3CAF6E",letterSpacing:"0.08em"}}>GESTION COPROPRIETE</div>
          </div>
        </div>
        <div style={{display:"flex",height:"100%"}}>
          {MODS.map(function(m){var a=active===m.id;return(
            <button key={m.id} onClick={function(){setActive(m.id);}} style={{display:"flex",alignItems:"center",gap:8,padding:"0 14px",height:"100%",background:a?"#ffffff12":"none",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",cursor:"pointer",fontFamily:"Georgia,serif",whiteSpace:"nowrap"}}>
              <div style={{width:22,height:22,borderRadius:5,background:a?"#3CAF6E":"#ffffff18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:a?"#fff":"#8da0bb",flexShrink:0}}>{m.icon}</div>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:10,fontWeight:a?700:400,color:a?"#fff":"#8da0bb"}}>{m.label}</div>
                <div style={{fontSize:8,color:a?"#3CAF6E":"#55687a"}}>{m.desc}</div>
              </div>
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
      </div>
    </div>
  );
}
