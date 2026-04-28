import { useState, useEffect } from "react";
import sb from "./lib/supabase";
import Login from "./Login";
import HubDashboard from "./HubDashboard";
import Hub from "./Hub";
import CRM from "./CRM";
import FournisseursAdmin from "./FournisseursAdmin";
import Gestionnaire from "./Gestionnaire";
import PortailCopro from "./PortailCopro";
import Notifications from "./Notifications";
import Comptabilite from "./Comptabilite";
import ModuleIA from "./ModuleIA";
import Historique from "./Historique";
import GestionAuto from "./GestionAuto";
import MembresCA from "./MembresCA";
import GestionDocuments from "./GestionDocuments";
import BudgetCompta from "./BudgetCompta";
import CarnetEntretien from "./CarnetEntretien";
import TableauBordCA from "./TableauBordCA";
import GestionCopros from "./GestionCopros";
import GestionFactures from "./GestionFactures";
import ModuleT4 from "./ModuleT4";
import ReconnaissanceDoc from "./ReconnaissanceDoc";
import Communications from "./Communications";
import RapportsFinanciers from "./RapportsFinanciers";
import BonsTravail from "./BonsTravail";
import PVReunion from "./PVReunion";
import ModuleAssurances from "./ModuleAssurances";
import RelevesCompte from "./RelevesCompte";
import GestionUtilisateurs from "./GestionUtilisateurs";
import RechercheGlobale from "./RechercheGlobale";

var MODS=[
  {id:"dashboard",label:"Accueil",icon:"P",color:"#3CAF6E"},
  {id:"onboarding",label:"Onboarding",icon:"HUB",color:"#3CAF6E"},
  {id:"tableau",label:"Tableau CA",icon:"TB",color:"#1A56DB"},
  {id:"copros",label:"Coproprietaires",icon:"CP",color:"#1A56DB"},
  {id:"gestion",label:"Gestion Auto",icon:"GA",color:"#1A56DB"},
  {id:"factures",label:"Factures",icon:"FA",color:"#B86020"},
  {id:"budget",label:"Budget",icon:"BU",color:"#1B5E3B"},
  {id:"t4",label:"T4 / R1",icon:"T4",color:"#B86020"},
  {id:"carnet",label:"Carnet Loi 16",icon:"L16",color:"#6B3FA0"},
  {id:"ca",label:"Membres CA",icon:"MC",color:"#6B3FA0"},
  {id:"docs",label:"Documents",icon:"DO",color:"#B86020"},
  {id:"reconn",label:"Lire docs IA",icon:"LD",color:"#6B3FA0"},
  {id:"comm",label:"Communications",icon:"CO",color:"#13233A"},
  {id:"rapports",label:"Rapports",icon:"RF",color:"#6B3FA0"},
  {id:"bons",label:"Bons travaux",icon:"BT",color:"#1B5E3B"},
  {id:"pv",label:"PV Reunion",icon:"PV",color:"#13233A"},
  {id:"assurances",label:"Assurances",icon:"AS",color:"#1A56DB"},
  {id:"releves",label:"Releves",icon:"RL",color:"#1B5E3B"},
  {id:"crm",label:"CRM Support",icon:"C",color:"#13233A"},
  {id:"fournisseurs",label:"Fournisseurs",icon:"F",color:"#13233A"},
  {id:"gestionnaire",label:"Portail CA",icon:"CA",color:"#13233A"},
  {id:"copro",label:"Portail Copro",icon:"CO",color:"#13233A"},
  {id:"notif",label:"Notifications",icon:"N",color:"#13233A"},
  {id:"compta",label:"Comptabilite",icon:"CPA",color:"#13233A"},
  {id:"ia",label:"Intelligence IA",icon:"IA",color:"#9C6FD0"},
  {id:"historique",label:"Historique",icon:"HIS",color:"#B86020"},
  {id:"usagers",label:"Utilisateurs",icon:"USR",color:"#6B3FA0"},
];

export default function App(){
  var s0=useState(null);var user=s0[0];var setUser=s0[1];
  var s1=useState(true);var checking=s1[0];var setChecking=s1[1];
  var s2=useState("dashboard");var active=s2[0];var setActive=s2[1];
  var s3=useState(null);var logo=s3[0];var setLogo=s3[1];
  var s4=useState(false);var showNav=s4[0];var setShowNav=s4[1];

  useEffect(function(){
    var u=sb.getUser();if(u)setUser(u);
    setChecking(false);
    try{var saved=localStorage.getItem("predictek_logo");if(saved)setLogo(saved);}catch(e){}
  },[]);

  function handleLogin(u){setUser(u);}
  function handleLogout(){sb.logout();setUser(null);}

  if(checking)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",color:"#7C7568"}}>Chargement...</div>;
  if(!user)return <Login onLogin={handleLogin}/>;

  var modActif=MODS.find(function(m){return m.id===active;})||MODS[0];

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#13233A",borderBottom:"1px solid #ffffff15",display:"flex",alignItems:"center",height:52,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 14px",borderRight:"1px solid #ffffff15",height:"100%",flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:8,background:logo?"#fff":"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
            {logo?<img src={logo} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain",padding:2}}/>:<span style={{color:"#fff",fontWeight:900,fontSize:16,fontFamily:"Georgia,serif"}}>P</span>}
          </div>
          <div style={{display:"none"}}>
            <div style={{fontSize:12,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",lineHeight:1}}>Predictek</div>
          </div>
        </div>
        <RechercheGlobale onNavigate={setActive}/>
        <div style={{display:"flex",height:"100%",overflowX:"auto",flex:1}}>
          {MODS.map(function(m){
            var a=active===m.id;
            return(
              <button key={m.id} onClick={function(){setActive(m.id);}} style={{display:"flex",alignItems:"center",gap:4,padding:"0 8px",height:"100%",background:a?"#ffffff12":"none",border:"none",borderBottom:a?"2px solid "+(m.color||"#3CAF6E"):"2px solid transparent",cursor:"pointer",fontFamily:"Georgia,serif",whiteSpace:"nowrap",flexShrink:0}}>
                <div style={{width:20,height:20,borderRadius:5,background:a?(m.color||"#1B5E3B"):"#ffffff18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,color:a?"#fff":"#8da0bb",flexShrink:0}}>{m.icon}</div>
                <span style={{fontSize:9,fontWeight:a?700:400,color:a?"#fff":"#8da0bb"}}>{m.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{padding:"0 12px",display:"flex",alignItems:"center",gap:8,flexShrink:0,borderLeft:"1px solid #ffffff15"}}>
          <span style={{fontSize:10,color:"#8da0bb"}}>{user.nom||user.email}</span>
          <button onClick={handleLogout} style={{background:"#ffffff18",border:"1px solid #ffffff30",borderRadius:6,padding:"4px 10px",color:"#8da0bb",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Quitter</button>
        </div>
      </div>
      <div style={{flex:1,background:"#F5F3EE",overflow:"auto"}}>
        {active==="dashboard"&&<HubDashboard onNavigate={setActive}/>}
        {active==="onboarding"&&<Hub/>}
        {active==="tableau"&&<TableauBordCA/>}
        {active==="copros"&&<GestionCopros/>}
        {active==="gestion"&&<GestionAuto/>}
        {active==="factures"&&<GestionFactures/>}
        {active==="budget"&&<BudgetCompta/>}
        {active==="t4"&&<ModuleT4/>}
        {active==="carnet"&&<CarnetEntretien/>}
        {active==="ca"&&<MembresCA/>}
        {active==="docs"&&<GestionDocuments/>}
        {active==="reconn"&&<ReconnaissanceDoc/>}
        {active==="comm"&&<Communications/>}
        {active==="rapports"&&<RapportsFinanciers/>}
        {active==="bons"&&<BonsTravail/>}
        {active==="pv"&&<PVReunion/>}
        {active==="assurances"&&<ModuleAssurances/>}
        {active==="releves"&&<RelevesCompte/>}
        {active==="crm"&&<CRM/>}
        {active==="fournisseurs"&&<FournisseursAdmin/>}
        {active==="gestionnaire"&&<Gestionnaire/>}
        {active==="copro"&&<PortailCopro/>}
        {active==="notif"&&<Notifications/>}
        {active==="compta"&&<Comptabilite/>}
        {active==="ia"&&<ModuleIA/>}
        {active==="historique"&&<Historique/>}
        {active==="usagers"&&<GestionUtilisateurs/>}
      </div>
    </div>
  );
}
