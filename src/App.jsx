import { useState } from "react";
import Hub from "./Hub";
import CRM from "./CRM";
import Fournisseurs from "./Fournisseurs";
import Piedmont from "./Piedmont";
var M=[{id:"hub",l:"Administration"},{id:"crm",l:"CRM"},{id:"fournisseurs",l:"Fournisseurs"},{id:"piedmont",l:"Portail"}];
export default function App(){
  var s=useState("hub");var a=s[0];var sa=s[1];
  return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}><div style={{background:"#13233A",display:"flex",alignItems:"center",height:50,padding:"0 20px"}}><span style={{color:"#fff",fontWeight:800,fontSize:15,marginRight:20,fontFamily:"Georgia,serif"}}>Predictek</span>{M.map(function(m){var x=a===m.id;return(<button key={m.id} onClick={function(){sa(m.id);}} style={{background:x?"#ffffff15":"none",border:"none",borderBottom:x?"2px solid #3CAF6E":"2px solid transparent",color:x?"#fff":"#8da0bb",padding:"0 14px",height:"100%",cursor:"pointer",fontSize:12}}>{m.l}</button>);})}</div><div style={{flex:1,background:"#F5F3EE",overflow:"auto"}}>{a==="hub"&&<Hub/>}{a==="crm"&&<CRM/>}{a==="fournisseurs"&&<Fournisseurs/>}{a==="piedmont"&&<Piedmont/>}</div></div>);
}