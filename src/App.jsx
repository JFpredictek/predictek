import { useState } from "react";
import Hub from "./Hub";
import CRM from "./CRM";
import Fournisseurs from "./Fournisseurs";
import Piedmont from "./Piedmont";
var MODS=[{id:"hub",label:"Administration"},{id:"crm",label:"CRM Support"},{id:"fournisseurs",label:"Fournisseurs"},{id:"piedmont",label:"Portail Unites"}];
export default function App(){
  var s=useState("hub");var active=s[0];var setActive=s[1];
  return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
    <div style={{background:"#13233A",display:"flex",alignItems:"center",height:50,padding:"0 20px",gap:4}}>
      <span style={{color:"#fff",fontWeight:800,fontSize:15,marginRight:16,fontFamily:"Georgia,serif"}}>Predictek</span>
      {MODS.map(function(m){var a=active===m.id;return(<button key={m.id} onClick={function(){setActive(m.id);}} style={{background:a?"#ffffff15":"none",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",color:a?"#fff":"#8da0bb",padding:"0 14px",height:"100%",cursor:"pointer",fontSize:12,fontFamily:"Georgia,serif"}}>{m.label}</button>);})}
    </div>
    <div style={{flex:1,background:"#F5F3EE",overflow:"auto"}}>
      {active==="hub"&&<Hub/>}{active==="crm"&&<CRM/>}{active==="fournisseurs"&&<Fournisseurs/>}{active==="piedmont"&&<Piedmont/>}
    </div>
  </div>);
}