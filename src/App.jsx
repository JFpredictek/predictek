import { useState, useEffect } from "react";
import sb from "./lib/supabase";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import HubDashboard from "./HubDashboard";
import Hub from "./Hub";
import FournisseursAdmin from "./FournisseursAdmin";
import PortailCopro from "./PortailCopro";
import Notifications from "./Notifications";
import ModuleIA from "./ModuleIA";
import Historique from "./Historique";
import GestionAuto from "./GestionAuto";
import MembresCA from "./MembresCA";
import GestionDocuments from "./GestionDocuments";
import BudgetCompta from "./BudgetCompta";
import Encaissements from "./Encaissements";
import Assemblees from "./Assemblees";
import CarnetEntretien from "./CarnetEntretien";
import TableauBordCA from "./TableauBordCA";
import GestionCopros from "./GestionCopros";
import GestionFactures from "./GestionFactures";
import ModuleT4 from "./ModuleT4";
import ReconnaissanceDoc from "./ReconnaissanceDoc";
import Communications from "./Communications";
import RapportsFinanciers from "./RapportsFinanciers";
import BonsTravail from "./BonsTravail";
import CotisationsSpeciales from "./CotisationsSpeciales";
import SoldesOuverture from "./SoldesOuverture";
import PVReunion from "./PVReunion";
import RelevesCompte from "./RelevesCompte";
import GestionUtilisateurs from "./GestionUtilisateurs";
import AgendaCalendrier from "./AgendaCalendrier";
import GestionEmployes from "./GestionEmployes";
import GestionRoles from "./GestionRoles";
import RegistreIncidents from "./RegistreIncidents";
import Registre1070 from "./Registre1070";
import Sinistres from "./Sinistres";
import RequetesCopros from "./RequetesCopros";
import Conformite from "./Conformite";
import ConfigSyndicat from "./ConfigSyndicat";
import Facturation from "./Facturation";
import PredictekCompta from "./PredictekCompta";
import Unites from "./Unites";

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
      {id:"facturation",label:"Facturation clients",icon:"FC"},
      {id:"comptaentreprise",label:"Comptabilite Predictek",icon:"CE"},
      {id:"roles",label:"Roles",icon:"ROL"},
      {id:"crm",label:"CRM - Requetes et tickets",icon:"CRM"},
      {id:"ia",label:"IA",icon:"IA"},
      {id:"loi25",label:"Loi 25",icon:"L25"},
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
      {id:"unites",label:"Unites",icon:"UN"},
            {id:"factures",label:"Factures",icon:"FA"},
      {id:"budget",label:"Budget et cotisations",icon:"BU"},
      {id:"plancomptable",label:"Plan comptable",icon:"PC"},
      {id:"etatsfin",label:"Etats financiers",icon:"EF"},
      {id:"fondsview",label:"Comptabilite par fonds",icon:"FD"},
      {id:"banques",label:"Comptes bancaires",icon:"CB"},
      {id:"journalgl",label:"Journal des transactions",icon:"JL"},
      {id:"soldesouv",label:"Soldes d ouverture",icon:"SO"},
      {id:"encaissements",label:"Encaissements",icon:"EN"},
      {id:"speciales",label:"Cotisations speciales",icon:"CSP"},
      {id:"bons",label:"Bons travaux",icon:"BT"},
      {id:"comm",label:"Communications",icon:"CO"},
      
      {id:"rapports",label:"Rapports",icon:"RF"},
      {id:"assemblees",label:"Assemblees",icon:"AG"},
      {id:"pv",label:"PV Reunion",icon:"PV"},
      {id:"registre",label:"Registre 1070",icon:"RG"},
      {id:"sinistres",label:"Sinistres",icon:"SN"},
      {id:"requetes",label:"Requetes copros",icon:"RQ"},
      {id:"conformite",label:"Avis de non-conformite",icon:"NC"},
      {id:"notif",label:"Centre de notifications",icon:"N"},
      {id:"configsynd",label:"Configuration du syndicat",icon:"CS"},
      {id:"usagersca",label:"Acces des utilisateurs",icon:"USR"},
      {id:"ca",label:"Membres CA",icon:"MC"},
      {id:"fournisseurs",label:"Fournisseurs",icon:"F"},
      {id:"agenda",label:"Agenda",icon:"AGD"},
      {id:"carnet",label:"Carnet entretien",icon:"L16"},
      {id:"docs",label:"Documents",icon:"DO"},
      {id:"reconn",label:"Lire docs IA",icon:"LD"},
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
    ]
  }
];

// Navigation VERTICALE par categories (les sous-titres regroupent sans etre cliquables)
var NAV={
  predictek:[
    {titre:"Tableau de bord",items:[{id:"dashboard"}]},
    {titre:"Configuration",items:[{id:"onboarding"},{id:"gestion"}]},
    {titre:"Equipe",items:[{id:"employes"},{id:"paie"},{id:"usagers"},{id:"roles"}]},
    {titre:"Entreprise",items:[{id:"facturation"},{id:"comptaentreprise"},{id:"ia"},{id:"loi25"},{id:"historique"}]},
    {titre:"CRM",items:[{id:"crm"}]}
  ],
  ca:[
    {titre:"Tableau de bord",items:[{id:"tableau"}]},
    {titre:"Immeuble",items:[{id:"unites"},{id:"carnet"},{id:"sinistres"},{id:"agenda"}]},
    {titre:"Finances",items:[{sub:"Payables"},{id:"factures"},{sub:"Recevables"},{id:"encaissements"},{id:"speciales"},{sub:"Comptabilite"},{id:"budget"},{id:"fondsview"},{id:"journalgl"},{sub:"Rapports"},{id:"etatsfin"},{id:"rapports"}]},
    {titre:"Fournisseurs",items:[{id:"fournisseurs"},{id:"bons"}]},
    {titre:"Instances",items:[{id:"assemblees"},{id:"pv"},{id:"ca"},{id:"registre"}]},
    {titre:"Communications",items:[{id:"comm"},{id:"conformite"},{id:"notif"}]},
    {titre:"Requetes",items:[{id:"requetes"}]},
    {titre:"Documents",items:[{id:"docs"}]},
    {titre:"Configuration",items:[{id:"configsynd"},{id:"plancomptable"},{id:"banques"},{id:"soldesouv"},{id:"usagersca"},{id:"reconn"}]}
  ],
  portail:[
    {titre:"Mon espace",items:[{id:"copro"},{id:"releves"}]}
  ]
};

var ALL_IDS=[];
SECTIONS.forEach(function(s){s.modules.forEach(function(m){ALL_IDS.push(m.id);});});

// Navigation selon le role de l utilisateur connecte
function sectionsPourRole(role){
  if(role==="admin")return SECTIONS;
  if(role==="gestionnaire"){
    var interdits=["usagers","roles","employes","paie","crm","loi25","facturation","comptaentreprise"];
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
  var sLogo=useState(function(){try{return localStorage.getItem("predictek_logo")||null;}catch(e){return null;}});
  var logoApp=sLogo[0];var setLogoApp=sLogo[1];
  var s1=useState(true);var checking=s1[0];var setChecking=s1[1];
  var s2=useState("dashboard");var active=s2[0];var setActive=s2[1];
  var s3=useState("predictek");var activeSec=s3[0];var setActiveSec=s3[1];
  var s4=useState(null);var menuOuvert=s4[0];var setMenuOuvert=s4[1];
  var s5=useState(0);var nbRequetes=s5[0];var setNbRequetes=s5[1];

  // Compteur de requetes a traiter (badge sur le menu Requetes) - rafraichi periodiquement
  useEffect(function(){
    if(!user)return;
    var charger=function(){
      sb.select("tickets",{cols:"id,statut",limit:1000}).then(function(r){
        if(r&&r.data)setNbRequetes(r.data.filter(function(t){var st=t.statut||"nouveau";return st==="nouveau"||st==="en_cours";}).length);
      }).catch(function(){});
    };
    charger();
    var iv=setInterval(charger,120000);
    var onFocus=function(){charger();};
    window.addEventListener("focus",onFocus);
    return function(){clearInterval(iv);window.removeEventListener("focus",onFocus);};
  },[user]);

  useEffect(function(){
    sb.checkSession().then(function(u){
      if(u)setUser(u);
      setChecking(false);
    }).catch(function(){setChecking(false);});
    // Renouvellement continu de la session: toutes les 10 min + au retour sur l onglet
    var iv=setInterval(function(){sb.checkSession().catch(function(){});},600000);
    var onFocus=function(){sb.checkSession().catch(function(){});};
    window.addEventListener("focus",onFocus);
    // Logo de l entreprise (configure dans Predictek > Configuration > Parametres > Logo)
    sb.selectOne("config_publique",{eq:{cle:"logo"}}).then(function(r){
      if(r&&r.data&&r.data.valeur){setLogoApp(r.data.valeur);try{localStorage.setItem("predictek_logo",r.data.valeur);}catch(e){}}
    }).catch(function(){});
    return function(){clearInterval(iv);window.removeEventListener("focus",onFocus);};
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
    <div style={{height:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0d1b2a",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",height:64,borderBottom:"1px solid #ffffff10"}}>
          {sectionsVisibles.map(function(sec){
            var isActive=activeSec===sec.id;
            if(sec.id==="predictek"){
              // Le LOGO est le menu maitre Predictek
              return(
                <button key={sec.id} onClick={function(){setActiveSec(sec.id);var first=sec.modules[0];if(first)setActive(first.id);}} title="Predictek" style={{display:"flex",alignItems:"center",gap:10,height:64,padding:"0 16px",background:isActive?sec.bg+"cc":"transparent",border:"none",borderBottom:isActive?"3px solid "+sec.color:"3px solid transparent",cursor:"pointer",fontFamily:"Georgia,serif",flexShrink:0}}>
                  {logoApp?(
                    <img src={logoApp} alt="Predictek" style={{width:46,height:46,borderRadius:10,objectFit:"contain",background:"#fff",flexShrink:0}}/>
                  ):(
                    <div style={{width:46,height:46,borderRadius:10,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{color:"#fff",fontWeight:900,fontSize:22,fontFamily:"Georgia,serif"}}>P</span>
                    </div>
                  )}
                </button>
              );
            }
            return(
              <button key={sec.id} onClick={function(){setActiveSec(sec.id);var first=sec.modules[0];if(first)setActive(first.id);}} style={{display:"flex",alignItems:"center",gap:8,height:64,padding:"0 22px",background:isActive?sec.bg+"cc":"transparent",border:"none",borderBottom:isActive?"3px solid "+sec.color:"3px solid transparent",cursor:"pointer",fontFamily:"Georgia,serif",color:isActive?sec.color:"#9fb0c6",fontSize:14,fontWeight:isActive?700:500,flexShrink:0,transition:"all 0.15s"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:isActive?sec.color:"#ffffff30",flexShrink:0}}/>
                {sec.label}
              </button>
            );
          })}
          <div style={{flex:1}}/>
          <div style={{padding:"0 14px",display:"flex",alignItems:"center",gap:10,flexShrink:0,borderLeft:"1px solid #ffffff15",height:64}}>
            <span style={{fontSize:12,color:"#c6d2e2",whiteSpace:"nowrap"}}>{user.nom||user.email}</span>
            <button onClick={handleLogout} style={{background:"#ffffff15",border:"1px solid #ffffff25",borderRadius:7,padding:"6px 12px",color:"#c6d2e2",fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Quitter</button>
          </div>
        </div>
        <div style={{display:"flex",height:46,background:activeSectionDef.bg+"55",borderTop:"1px solid #ffffff08",position:"relative",zIndex:50}}>
          {(NAV[activeSectionDef.id]||[]).map(function(gr){
            var items=gr.items.filter(function(it){return it.sub||activeSectionDef.modules.some(function(m){return m.id===it.id;});});
            var modItems=items.filter(function(it){return it.id;});
            if(modItems.length===0)return null;
            var contientActif=modItems.some(function(it){return it.id===active;});
            var cle=activeSectionDef.id+"_"+gr.titre;
            var ouvert=menuOuvert===cle;
            var unique=modItems.length===1;
            return(
              <div key={gr.titre} style={{position:"relative"}}>
                <button onClick={function(){
                  if(unique){setActive(modItems[0].id);setMenuOuvert(null);}
                  else setMenuOuvert(ouvert?null:cle);
                }} style={{display:"flex",alignItems:"center",gap:7,height:46,padding:"0 18px",background:contientActif||ouvert?"#ffffff18":"transparent",border:"none",borderBottom:contientActif?"3px solid "+activeSectionDef.color:"3px solid transparent",cursor:"pointer",fontFamily:"Georgia,serif",color:contientActif||ouvert?"#fff":"#9fb0c6",fontSize:13,fontWeight:contientActif?700:500,whiteSpace:"nowrap",position:"relative"}}>
                  {gr.titre}
                  {gr.titre==="Requetes"&&nbRequetes>0&&<span style={{background:"#B83232",color:"#fff",borderRadius:10,minWidth:18,height:18,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,padding:"0 5px"}}>{nbRequetes}</span>}
                  {!unique&&<span style={{fontSize:9}}>{ouvert?"\u25B4":"\u25BE"}</span>}
                </button>
                {ouvert&&!unique&&(
                  <div style={{position:"absolute",top:46,left:0,background:"#13233A",border:"1px solid #ffffff22",borderRadius:"0 0 10px 10px",boxShadow:"0 10px 26px rgba(0,0,0,0.45)",minWidth:250,padding:"6px 0",zIndex:60}}>
                    {items.map(function(it,ix){
                      if(it.sub)return <div key={"s"+ix} style={{fontSize:9,fontWeight:800,color:"#7d90aa",textTransform:"uppercase",letterSpacing:"0.09em",padding:"8px 16px 3px"}}>{it.sub}</div>;
                      var m=activeSectionDef.modules.find(function(x){return x.id===it.id;});
                      var isActive=active===it.id;
                      return(
                        <button key={it.id} onClick={function(){setActive(it.id);setMenuOuvert(null);}} style={{display:"flex",alignItems:"center",gap:9,width:"100%",background:isActive?activeSectionDef.color+"33":"transparent",border:"none",borderLeft:isActive?"3px solid "+activeSectionDef.color:"3px solid transparent",padding:"8px 14px",cursor:"pointer",fontFamily:"Georgia,serif",textAlign:"left"}}>
                          <div style={{width:22,height:22,borderRadius:5,background:isActive?activeSectionDef.color:"#ffffff14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:isActive?"#fff":"#9fb0c6",flexShrink:0}}>{m?m.icon:""}</div>
                          <span style={{fontSize:13,fontWeight:isActive?700:500,color:isActive?"#fff":"#c6d2e2",whiteSpace:"nowrap"}}>{m?m.label:it.id}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {menuOuvert&&<div onClick={function(){setMenuOuvert(null);}} style={{position:"fixed",inset:0,zIndex:40}}/>}
      <div style={{flex:1,display:"flex",minHeight:0}}>
        <div style={{flex:1,background:"#F5F3EE",overflow:"auto"}}>
        {active==="dashboard"&&<HubDashboard onNavigate={function(id){var sec=sectionsVisibles.find(function(s){return s.modules.some(function(m){return m.id===id;});});if(sec)setMod(sec.id,id);}}/>}
        {active==="onboarding"&&<Hub/>}
        {active==="tableau"&&<TableauBordCA onNavigate={function(id){setMod("ca",id);}}/>}
        {active==="copros"&&<GestionCopros/>}
        {active==="unites"&&<Unites/>}
        {active==="gestion"&&<GestionAuto/>}
        {active==="factures"&&<GestionFactures/>}
        {active==="budget"&&<BudgetCompta key="bud"/>}
        {active==="plancomptable"&&<BudgetCompta key="pc" onglet="charte"/>}
        {active==="etatsfin"&&<BudgetCompta key="ef" onglet="etats"/>}
        {active==="fondsview"&&<BudgetCompta key="fd" onglet="fonds"/>}
        {active==="banques"&&<BudgetCompta key="bq" onglet="banques"/>}
        {active==="journalgl"&&<BudgetCompta key="jl" onglet="journal"/>}
        {active==="encaissements"&&<Encaissements/>}
        {active==="speciales"&&<CotisationsSpeciales/>}
        {active==="soldesouv"&&<SoldesOuverture/>}
        {active==="assemblees"&&<Assemblees/>}
        {active==="paie"&&<ModuleT4/>}
        {active==="carnet"&&<CarnetEntretien/>}
        {active==="ca"&&<MembresCA/>}
        {active==="docs"&&<GestionDocuments/>}
        {active==="reconn"&&<ReconnaissanceDoc/>}
        {active==="comm"&&<Communications/>}
        {active==="rapports"&&<RapportsFinanciers/>}
        {active==="bons"&&<BonsTravail/>}
        {active==="pv"&&<PVReunion/>}
        {active==="registre"&&<Registre1070/>}
        {active==="sinistres"&&<Sinistres/>}
        {active==="requetes"&&<RequetesCopros/>}
        {active==="conformite"&&<Conformite/>}
        {active==="configsynd"&&<ConfigSyndicat onNavigate={function(id){setMod("ca",id);}}/>}
        {active==="facturation"&&<Facturation/>}
        {active==="comptaentreprise"&&<PredictekCompta/>}
        {active==="releves"&&<RelevesCompte/>}
        {active==="crm"&&<RequetesCopros/>}
        {active==="usagersca"&&<GestionUtilisateurs contexte="ca"/>}
        {active==="fournisseurs"&&<FournisseursAdmin onNavigate={function(id){setMod("ca",id);}}/>}
        {active==="copro"&&<PortailCopro role={user.role||""}/>}
        {active==="notif"&&<Notifications onNavigate={function(id){setMod("ca",id);}}/>}
        {active==="ia"&&<ModuleIA/>}
        {active==="historique"&&<Historique/>}
        {active==="employes"&&<GestionEmployes/>}
        {active==="roles"&&<GestionRoles/>}
        {active==="usagers"&&<GestionUtilisateurs/>}
        {active==="agenda"&&<AgendaCalendrier/>}
        {active==="loi25"&&<RegistreIncidents/>}
        </div>
      </div>
    </div>
  );
}
