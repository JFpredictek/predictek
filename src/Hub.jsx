import { useState } from "react";
import Hub from "./Hub";
import CRM from "./CRM";
import Fournisseurs from "./Fournisseurs";
import Piedmont from "./Piedmont";

var MODS=[
  {id:"hub",label:"Administration",icon:"H"},
  {id:"crm",label:"CRM Support",icon:"C"},
  {id:"fournisseurs",label:"Fournisseurs",icon:"F"},
  {id:"piedmont",label:"Portail Unités",icon:"P"},
];

export default function App(){
  var s=useState("hub");
  var active=s[0]; var setActive=s[1];
  return(
    <div style={{minHeight:"100vh",background:"#13233A",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#13233A",borderBottom:"1px solid #ffffff15",display:"flex",alignItems:"center",height:50,flexShrink:0,padding:"0 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginRight:20}}>
          <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:15,fontFamily:"Georgia,serif"}}>P</span>
          </div>
          <span style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>Predictek</span>
        </div>
        {MODS.map(function(m){
          var isActive=active===m.id;
          return(
            <button key={m.id} onClick={function(){setActive(m.id);}}
              style={{display:"flex",alignItems:"center",gap:8,padding:"0 16px",height:"100%",background:isActive?"#ffffff12":"none",border:"none",borderBottom:isActive?"2px solid #3CAF6E":"2px solid transparent",cursor:"pointer",color:isActive?"#fff":"#8da0bb",fontSize:12,fontFamily:"Georgia,serif"}}>
              {m.label}
            </button>
          );
        })}
      </div>
      <div style={{flex:1,background:"#F5F3EE",overflow:"auto"}}>
        {active==="hub"&&<Hub/>}
        {active==="crm"&&<CRM/>}
        {active==="fournisseurs"&&<Fournisseurs/>}
        {active==="piedmont"&&<Piedmont/>}
      </div>
    </div>
  );
}
