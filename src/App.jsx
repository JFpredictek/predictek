import { useState, useEffect } from "react";
import sb from "./lib/supabase";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
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
import AgendaCalendrier from "./AgendaCalendrier";
import GestionEmployes from "./GestionEmployes";
import GestionRoles from "./GestionRoles";
import ImportCSVCopros from "./ImportCSVCopros";

var SECTIONS=[
  {
    id:"predictek",
    label:"Predictek",
    icon:"P",
    color:"#3CAF6E",
    bg:"#1B5E3B",
    modules:[
      {id:"dashboard",label:"Accueil",icon:"P"},
      {id:"onboarding",label:"Configuration",icon:"CFG"},
      {id:"gestion",label:"Gestion Auto",icon:"GA"},
      {id:"usagers",label:"Utilisateurs",icon:"USR"},
      {id:"historique",label:"Historique",icon:"HIS"},
      {id:"employes",label:"Employes",icon:"EMP"},
      {id:"paie",label:"Paie / T4 / R1",icon:"PAI"},
      {id:"roles",label:"Roles",icon:"ROL"},
      {id:"crm",label:"CRM",icon:"CRM"},
      {id:"ia",label:"IA",icon:"IA"},
    ]
  },
  {
    id:"ca",
    label:"Conseil d administration",
    icon:"CA",
    color:"#64B5F6",
    bg:"#1A3A5C",
    modules:[
      {id:"tableau",label:"Tableau CA",icon:"TB"},
      {id:"copros",label:"Coproprietaires",icon:"CP"},
            {id:"factures",label:"Factures",icon:"FA"},
      {id:"budget",label:"Budget",icon:"BU"},
      {id:"bons",label:"Bons travaux",icon:"BT"},
      {id:"comm",label:"Communications",icon:"CO"},
      
      {id:"rapports",label:"Rapports",icon:"RF"},
      {id:"attestation",label:"Attestation copropriete",icon:"AT"},
      {id:"assurances",label:"Assurances",icon:"AS"},
      {id:"pv",label:"PV Reunion",icon:"PV"},
      {id:"ca",label:"Membres CA",icon:"MC"},
      {id:"fournisseurs",label:"Fournisseurs",icon:"F"},
      {id:"agenda",label:"Agenda",icon:"AGD"},
    ]
  },
  {
    id:"portail",
    label:"Portail Coproprietaire",
    icon:"CP",
    color:"#FFB74D",
    bg:"#4A2800",
    modules:[
      {id:"copro",label:"Mon portail",icon:"CO"},
      {id:"releves",label:"Releves",icon:"RL"},
      {id:"reconn",label:"Lire docs IA",icon:"LD"},
      {id:"notif",label:"Notifications",icon:"N"},
      {id:"carnet",label:"Carnet entretien",icon:"L16"},
      {id:"docs",label:"Documents",icon:"DO"},
    ]
  }
];

var ALL_IDS=[];
SECTIONS.forEach(function(s){s.modules.forEach(function(m){ALL_IDS.push(m.id);});});

// Navigation selon le role de l utilisateur connecte
function sectionsPourRole(role){
  if(role==="admin")return SECTIONS;
  if(role==="gestionnaire"){
    var interdits=["usagers","roles","employes","paie","crm"];
    return SECTIONS.map(function(s){
      if(s.id!=="predictek")return s;
      return Object.assign({},s,{modules:s.modules.filter(function(m){return interdits.indexOf(m.id)<0;})});
    });
  }
  if(role==="ca")return SECTIONS.filter(function(s){return s.id!=="predictek";});
  return SECTIONS.filter(function(s){return s.id==="portail";});
}

export default function App(){
  var s0=useState(null);var user=s0[0];var setUser=s0[1];
  var s1=useState(true);var checking=s1[0];var setChecking=s1[1];
  var s2=useState("dashboard");var active=s2[0];var setActive=s2[1];
  var s3=useState("predictek");var activeSec=s3[0];var setActiveSec=s3[1];

  useEffect(function(){
    sb.checkSession().then(function(u){
      if(u)setUser(u);
      setChecking(false);
    }).catch(function(){setChecking(false);});
  },[]);

  function handleLogin(u){setUser(u);}
  function handleLogout(){sb.logout();setUser(null);}

  // Si le role ne permet pas la section/module actifs, replier vers le premier permis
  useEffect(function(){
    if(!user)return;
    var secs=sectionsPourRole(user.role||"");
    var sec=secs.find(function(s){return s.id===activeSec;});
    if(!sec){
      var s0=secs[0];
      if(s0){setActiveSec(s0.id);setActive(s0.modules[0]?s0.modules[0].id:"");}
      return;
    }
    if(!sec.modules.some(function(m){return m.id===active;})){
      var m0=sec.modules[0];
      if(m0)setActive(m0.id);
    }
  },[user]);  // volontairement limite a user: activeSec/active sont geres a l interieur

  function setMod(secId,modId){
    setActiveSec(secId);
    setActive(modId);
  }

  // Lien "Mot de passe oublie" de Supabase: le jeton arrive dans le fragment d URL
  var hashParams={};
  try{
    window.location.hash.replace(/^#/,"").split("&").forEach(function(kv){
      var pr=kv.split("=");if(pr[0])hashParams[pr[0]]=decodeURIComponent(pr[1]||"");
    });
  }catch(e){}
  if((hashParams.type==="recovery"||hashParams.type==="invite")&&hashParams.access_token)return <ResetPassword token={hashParams.access_token}/>;
  if(hashParams.error_code==="otp_expired"||hashParams.error==="access_denied")return <ResetPassword token={null}/>;

  if(checking)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",color:"#7C7568"}}>Chargement...</div>;
  if(!user)return <Login onLogin={handleLogin}/>;

  var sectionsVisibles=sectionsPourRole(user.role||"");
  var activeSectionDef=sectionsVisibles.find(function(s){return s.id===activeSec;})||sectionsVisibles[0]||SECTIONS[0];

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0d1b2a",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",borderBottom:"1px solid #ffffff10"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 14px",borderRight:"1px solid #ffffff15",height:44,flexShrink:0}}>
            <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{color:"#fff",fontWeight:900,fontSize:14,fontFamily:"Georgia,serif"}}>P</span>
            </div>
            <span style={{color:"#fff",fontWeight:800,fontSize:12,fontFamily:"Georgia,serif",whiteSpace:"nowrap"}}>Predictek</span>
          </div>
          <div style={{flex:1,padding:"0 8px"}}>
            <RechercheGlobale onNavigate={function(id){
              var sec=sectionsVisibles.find(function(s){return s.modules.some(function(m){return m.id===id;});});
              if(sec)setMod(sec.id,id);
            }}/>
          </div>
          <div style={{padding:"0 12px",display:"flex",alignItems:"center",gap:8,flexShrink:0,borderLeft:"1px solid #ffffff15",height:44}}>
            <span style={{fontSize:10,color:"#8da0bb",whiteSpace:"nowrap"}}>{user.nom||user.email}</span>
            <button onClick={handleLogout} style={{background:"#ffffff15",border:"1px solid #ffffff25",borderRadius:6,padding:"3px 8px",color:"#8da0bb",fontSize:10,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Quitter</button>
          </div>
        </div>
        <div style={{display:"flex",height:40}}>
          {sectionsVisibles.map(function(sec){
            var isActive=activeSec===sec.id;
            return(
              <button key={sec.id} onClick={function(){setActiveSec(sec.id);var first=sec.modules[0];if(first)setActive(first.id);}} style={{display:"flex",alignItems:"center",gap:6,padding:"0 16px",background:isActive?sec.bg+"cc":"transparent",border:"none",borderBottom:isActive?"2px solid "+sec.color:"2px solid transparent",cursor:"pointer",fontFamily:"Georgia,serif",color:isActive?sec.color:"#8da0bb",fontSize:11,fontWeight:isActive?700:400,flexShrink:0,transition:"all 0.15s"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:isActive?sec.color:"#ffffff30",flexShrink:0}}/>
                {sec.label}
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",height:36,background:activeSectionDef.bg+"55",borderTop:"1px solid #ffffff08",overflowX:"auto"}}>
          {activeSectionDef.modules.map(function(m){
            var isActive=active===m.id;
            return(
              <button key={m.id} onClick={function(){setActive(m.id);}} style={{display:"flex",alignItems:"center",gap:4,padding:"0 10px",background:isActive?"#ffffff15":"transparent",border:"none",borderBottom:isActive?"2px solid "+activeSectionDef.color:"2px solid transparent",cursor:"pointer",fontFamily:"Georgia,serif",color:isActive?"#fff":"#8da0bb",fontSize:10,fontWeight:isActive?700:400,flexShrink:0,whiteSpace:"nowrap"}}>
                <div style={{width:16,height:16,borderRadius:4,background:isActive?activeSectionDef.color:"#ffffff18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,fontWeight:700,color:isActive?"#fff":"#8da0bb",flexShrink:0}}>{m.icon}</div>
                {m.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{flex:1,background:"#F5F3EE",overflow:"auto"}}>
        {active==="dashboard"&&<HubDashboard onNavigate={function(id){var sec=sectionsVisibles.find(function(s){return s.modules.some(function(m){return m.id===id;});});if(sec)setMod(sec.id,id);}}/>}
        {active==="onboarding"&&<Hub/>}
        {active==="tableau"&&<TableauBordCA/>}
        {active==="copros"&&<GestionCopros/>}
        {active==="gestion"&&<GestionAuto/>}
        {active==="factures"&&<GestionFactures/>}
        {active==="budget"&&<BudgetCompta/>}
        {active==="paie"&&<ModuleT4/>}
        {active==="carnet"&&<CarnetEntretien/>}
        {active==="ca"&&<MembresCA/>}
        {active==="docs"&&<GestionDocuments/>}
        {active==="reconn"&&<ReconnaissanceDoc/>}
        {active==="comm"&&<Communications/>}
        {active==="rapports"&&<RapportsFinanciers/>}
        {active==="attestation"&&<RapportsFinanciers/>}
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
        {active==="employes"&&<GestionEmployes/>}
        {active==="roles"&&<GestionRoles/>}
        {active==="usagers"&&<GestionUtilisateurs/>}
        {active==="agenda"&&<AgendaCalendrier/>}
      </div>
    </div>
  );
}
