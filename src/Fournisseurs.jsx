import { useState, useRef } from "react";

const T={bg:"#F5F3EE",surface:"#FFF",surfaceAlt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentMid:"#2D8653",accentLight:"#E8F2EC",accentPop:"#3CAF6E",gold:"#B8943A",goldLight:"#FAF3E0",red:"#B83232",redLight:"#FDECEA",amber:"#B86020",amberLight:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueLight:"#EFF6FF",purple:"#6B3FA0",purpleLight:"#F3EEFF",teal:"#0E7490",tealLight:"#ECFEFF"};

//  SPÉCIALITÉS 
const SPECIALITES={
  comptabilite:{label:"Comptabilité",icon:"$",c:T.accent},
  entretien:{label:"Entretien",icon:"W",c:T.amber},
  juridique:{label:"Juridique",icon:"J",c:T.navy},
  support:{label:"Support tech.",icon:"?",c:T.blue},
  administration:{label:"Administration",icon:"A",c:T.accentMid},
  sinistres:{label:"Sinistres",icon:"S",c:T.red},
};

//  EMPLOYÉS PREDICTEK 
const AGENTS_INIT=[
  {id:1,prenom:"Jean-François",nom:"Laroche",initiales:"JL",titre:"Directeur général",courriel:"jf.laroche@predictek.com",tel:"819-479-4203",role:"predictek_super",actif:true,
    specialites:[
      {id:"comptabilite",priorite:1,actif:true},
      {id:"juridique",priorite:2,actif:true},
      {id:"administration",priorite:3,actif:true},
    ],
    charge:3, maxCharge:15,
  },
  {id:2,prenom:"Marie-Claude",nom:"Bouchard",initiales:"MB",titre:"Gestionnaire senior",courriel:"mc.bouchard@predictek.com",tel:"418-555-0200",role:"predictek_admin",actif:true,
    specialites:[
      {id:"entretien",priorite:1,actif:true},
      {id:"sinistres",priorite:2,actif:true},
      {id:"administration",priorite:3,actif:true},
    ],
    charge:5, maxCharge:15,
  },
  {id:3,prenom:"Patrick",nom:"Simard",initiales:"PS",titre:"Technicien support",courriel:"p.simard@predictek.com",tel:"418-555-0300",role:"predictek_user",actif:true,
    specialites:[
      {id:"support",priorite:1,actif:true},
      {id:"comptabilite",priorite:2,actif:true},
    ],
    charge:4, maxCharge:10,
  },
];

//  CONFIG IA PAR CATÉGORIE 
const AI_CONFIG_INIT={
  copro_question:    {mode:"auto",   label:"Auto — IA envoie directement"},
  copro_autorisation:{mode:"approbation", label:"Approbation requise"},
  copro_document:    {mode:"auto",   label:"Auto — IA envoie directement"},
  copro_plainte:     {mode:"humain", label:"Humain seulement"},
  copro_reparation:  {mode:"humain", label:"Humain seulement"},
  admin_decision:    {mode:"humain", label:"Humain seulement"},
  admin_approbation: {mode:"approbation", label:"Approbation requise"},
  admin_rapport:     {mode:"auto",   label:"Auto — IA envoie directement"},
  interne_bug:       {mode:"humain", label:"Humain seulement"},
  interne_support:   {mode:"approbation", label:"Approbation requise"},
};
const AI_MODES={
  auto:        {label:"Auto",        c:T.purple,desc:"L'IA répond directement sans approbation"},
  approbation: {label:"Approbation", c:T.amber, desc:"L'IA rédige, employé approuve avant envoi"},
  humain:      {label:"Humain",      c:T.red,   desc:"Assigné à un employé, IA en aide seulement"},
};

//  FOURNISSEURS 
const CATEGORIES_FOUR={
  deneigement:    {label:"Déneigement",    icon:"*",c:T.blue},
  paysagement:    {label:"Paysagement",    icon:"L",c:T.accentPop},
  plomberie:      {label:"Plomberie",      icon:"P",c:T.teal},
  electricite:    {label:"Électricité",    icon:"E",c:T.gold},
  toiture:        {label:"Toiture",        icon:"T",c:T.amber},
  menuiserie:     {label:"Menuiserie",     icon:"M",c:T.amber},
  nettoyage:      {label:"Nettoyage",      icon:"N",c:T.accentMid},
  ascenseur:      {label:"Ascenseur",      icon:"V",c:T.navy},
  securite:       {label:"Sécurité",       icon:"S",c:T.red},
  assurance:      {label:"Assurance",      icon:"A",c:T.purple},
  juridique:      {label:"Juridique",      icon:"J",c:T.navy},
  inspection:     {label:"Inspection",     icon:"I",c:T.accentMid},
  autre:          {label:"Autre",          icon:"?",c:T.muted},
};
const STATUTS_BON={
  cree:       {label:"Créé",          c:T.muted},
  envoye:     {label:"Envoyé",        c:T.blue},
  accepte:    {label:"Accepté",       c:T.accentMid},
  en_cours:   {label:"En cours",      c:T.amber},
  inspecte:   {label:"Inspecté",      c:T.purple},
  termine:    {label:"Terminé",       c:T.accent},
  facture:    {label:"Facturé",       c:T.gold},
  paye:       {label:"Payé",          c:T.accentPop},
};
const FOURNISSEURS_INIT=[
  {id:1,nom:"Déneigement Express",contact:"Mario Leblanc",courriel:"mario@deneigement-express.com",tel:"418-555-1001",categories:["deneigement"],territoire:["Stoneham","Lac-Beauport","Charlesbourg"],note:4.7,nbTravaux:12,certifie:true,actif:true,adresse:"1234 rue Industrielle, Québec",notes:"Contrat annuel depuis 2022.",historiqueFactures:87500,portalAcces:true,portailPwd:"demo123",
    travaux:[
      {id:1,titre:"Déneigement saison 2025-2026",statut:"en_cours",dateDebut:"2025-11-01",dateFin:"2026-04-30",montant:31800,synd:1,notes:"Contrat annuel. 24/7."}
    ]},
  {id:2,nom:"Paysagement Horizon",contact:"Sophie Gagnon",courriel:"sophie@paysagement-horizon.com",tel:"418-555-1002",categories:["paysagement"],territoire:["Stoneham","Tewkesbury","Shannon"],note:4.4,nbTravaux:8,certifie:true,actif:true,adresse:"567 ch. des Pins, Stoneham",notes:"Parfois délais sur soumissions.",historiqueFactures:42000,portalAcces:true,portailPwd:"horizon2024",
    travaux:[
      {id:3,titre:"Entretien paysager printemps 2026",statut:"accepte",dateDebut:"2026-05-01",dateFin:"2026-06-15",montant:14000,synd:1,notes:"Inclus taille arbustes et ensemencement."},
    ]},
  {id:3,nom:"Plomberie ProFlo",contact:"Denis Carrier",courriel:"denis@proflo.ca",tel:"418-555-1003",categories:["plomberie"],territoire:["Région de Québec"],note:4.9,nbTravaux:15,certifie:true,actif:true,adresse:"890 boul. Wilfrid-Hamel, Québec",notes:"Urgences 24/7. Maître plombier.",historiqueFactures:28500,portalAcces:true,portailPwd:"proflo2026",
    travaux:[
      {id:101,titre:"Inspection et réparation fuite plafond — Unité 527",statut:"envoye",dateDebut:"2026-04-23",dateFin:"2026-04-24",montant:850,synd:1,ticketId:1006,notes:"Urgent — infiltration active. Ticket CRM #1006."},
    ]},
  {id:4,nom:"AscenseurTech QC",contact:"Pierre Fontaine",courriel:"pfontaine@ascenseurtech.com",tel:"418-555-1004",categories:["ascenseur","inspection"],territoire:["Province de Québec"],note:4.6,nbTravaux:6,certifie:true,actif:true,adresse:"123 rue Newton, Québec",notes:"Certification RBQ.",historiqueFactures:18750,portalAcces:true,portailPwd:"asctech99",
    travaux:[
      {id:4,titre:"Certification annuelle ascenseur 2026",statut:"envoye",dateDebut:"2026-06-01",dateFin:"2026-06-01",montant:2127,synd:1,notes:"Inspection annuelle obligatoire."},
    ]},
  {id:5,nom:"Travaux Escaliers inc.",contact:"Luc Morin",courriel:"luc@travauxescaliers.com",tel:"418-555-1005",categories:["menuiserie","toiture"],territoire:["Stoneham","Beauport","Charlesbourg"],note:3.8,nbTravaux:3,certifie:false,actif:true,adresse:"456 rang Saint-Ange, Stoneham",notes:"Travaux mineurs. Délais à surveiller.",historiqueFactures:45200,portalAcces:true,portailPwd:"escaliers2026",
    travaux:[
      {id:5,titre:"FP — Escaliers communs phase 2",statut:"facture",dateDebut:"2026-01-15",dateFin:"2026-04-10",montant:33849,synd:1,notes:"Phase 2 complétée. Facture soumise."},
    ]},
];

const SOUMISSIONS_INIT=[
  {id:1,titre:"Remplacement garde-corps balcons — phase 1",synd:1,categorie:"menuiserie",description:"Remplacement de 12 garde-corps de balcons. Aluminium ou acier inox. Norme BNQ.",dateEnvoi:"2026-04-15",dateLimite:"2026-04-30",statut:"ouverte",fournisseursInvites:[3,4,5],reponses:[
    {fourId:5,montant:28500,delai:"6 semaines",notes:"Aluminium anodisé. Garantie 5 ans.",dateReponse:"2026-04-18",selectionne:false},
  ]},
  {id:2,titre:"Contrat déneigement 2026-2027",synd:1,categorie:"deneigement",description:"Déneigement des allées, stationnements et entrées pour la saison 2026-2027. Service 24/7.",dateEnvoi:"2026-04-20",dateLimite:"2026-09-01",statut:"ouverte",fournisseursInvites:[1],reponses:[]},
];

const TICKETS_MINI={
  1001:{sujet:"Location Airbnb permise?",unite:"515",statut:"resolu"},
  1002:{sujet:"Bruit excessif — Unité 533",unite:"531",statut:"en_cours"},
  1003:{sujet:"Demande installation thermopompe",unite:"525",statut:"nouveau"},
  1004:{sujet:"Approbation facture Déneigement 5 297$",unite:null,statut:"en_cours"},
  1006:{sujet:"Fuite d'eau dans le plafond du salon",unite:"527",statut:"en_cours"},
  1007:{sujet:"Erreur génération rapport financier",unite:null,statut:"nouveau"},
  1008:{sujet:"Etat certifié des charges — vente",unite:"539",statut:"nouveau"},
};

const now=()=>new Date().toLocaleString("fr-CA",{dateStyle:"short",timeStyle:"short"});
const today=()=>new Date().toISOString().slice(0,10);

function Tag({l,c,sz}){return <span style={{fontSize:sz||10,padding:"2px 7px",borderRadius:20,background:(c||T.accent)+"18",color:c||T.accent,fontWeight:600,whiteSpace:"nowrap"}}>{l}</span>;}
function Card({children,s}){return <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,...(s||{})}}>{children}</div>;}
function SH({l,s}){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8,fontWeight:600,...(s||{})}}>{l}</div>;}
function Av({ini,c,sz}){var size=sz||32;return <div style={{width:size,height:size,borderRadius:"50%",background:c||T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color:"#fff",flexShrink:0}}>{ini}</div>;}
var inp={width:"100%",border:"1px solid "+T.border,borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",boxSizing:"border-box",background:T.surface,outline:"none"};
function Btn({onClick,children,bg,tc,sm,s,border}){return <button onClick={onClick} style={{background:bg||T.accent,border:border||"none",borderRadius:7,padding:sm?"4px 10px":"8px 15px",color:tc||"#fff",fontSize:sm?10:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",...(s||{})}}>{children}</button>;}
function Modal({open,onClose,title,w,children}){
  if(!open)return null;
  return <div style={{position:"fixed",inset:0,background:"#00000060",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:22,width:w||520,maxWidth:"95vw",maxHeight:"92vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <b style={{fontSize:15,color:T.text}}>{title}</b>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:T.muted}}>x</button>
      </div>
      {children}
    </div>
  </div>;
}
function F({l,s,children}){return <div style={s}><div style={{fontSize:10,color:T.muted,marginBottom:3}}>{l}</div>{children}</div>;}
function Stars({n}){return <span style={{fontSize:12,color:T.gold}}>{Array.from({length:5},(_,i)=>i<Math.floor(n)?"★":"☆").join("")} <span style={{fontSize:10,color:T.muted}}>{n}/5</span></span>;}
function ProgBar({val,total,c,h}){var p=total>0?Math.min(100,Math.round(val/total*100)):0;return <div style={{background:T.surfaceAlt,borderRadius:h||5,height:h||5,overflow:"hidden"}}><div style={{width:p+"%",height:"100%",background:c||T.accent,borderRadius:h||5}}/></div>;}

//  MODULE EMPLOYÉS 
function SpecialtiesPanel({sel,setAgents,setSel}){
  if(!sel)return null;
  function toggleSpec(agentId,specId){
    setAgents(p=>p.map(a=>{
      if(a.id!==agentId)return a;
      var exists=a.specialites.find(s=>s.id===specId);
      if(exists)return {...a,specialites:a.specialites.map(s=>s.id===specId?{...s,actif:!s.actif}:s)};
      return {...a,specialites:[...a.specialites,{id:specId,priorite:a.specialites.length+1,actif:true}]};
    }));
  }
  return(
    <Card s={{position:"sticky",top:70}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
        <b style={{fontSize:13,color:T.text}}>Config — {sel.prenom} {sel.nom}</b>
        <button onClick={()=>setSel(null)} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:T.muted}}>x</button>
      </div>
      <SH l="Spécialités & priorités d'assignation"/>
      <div style={{marginBottom:12}}>
        {Object.entries(SPECIALITES).map(function(e){var k=e[0];var v=e[1];
          var sp=sel.specialites.find(function(s){return s.id===k;});
          var actif=sp&&sp.actif;
          return(
            <div key={k} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 9px",borderRadius:7,marginBottom:3,background:actif?v.c+"10":T.surfaceAlt,border:"1px solid "+(actif?v.c+"30":T.border)}}>
              <div onClick={()=>toggleSpec(sel.id,k)} style={{width:34,height:18,borderRadius:18,background:actif?v.c:T.border,cursor:"pointer",position:"relative",flexShrink:0}}>
                <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:actif?18:2,transition:"left .2s",boxShadow:"0 1px 3px #0003"}}/>
              </div>
              <div style={{width:22,height:22,borderRadius:5,background:v.c+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:v.c,flexShrink:0}}>{v.icon}</div>
              <span style={{fontSize:11,fontWeight:actif?700:400,color:actif?T.text:T.muted,flex:1}}>{v.label}</span>
              {actif&&sp&&(
                <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                  <span style={{fontSize:9,color:T.muted}}>P</span>
                  <input type="number" min={1} max={6} value={sp.priorite} onChange={e=>setAgents(p=>p.map(a=>a.id===sel.id?{...a,specialites:a.specialites.map(s=>s.id===k?{...s,priorite:parseInt(e.target.value)||1}:s)}:a))} style={{width:34,border:"1px solid "+v.c+"50",borderRadius:4,padding:"1px 4px",fontSize:11,textAlign:"center",fontFamily:"inherit",background:T.surface}}/>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <SH l="Charge de travail"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <F l="Tickets actuels"><input type="number" value={sel.charge} onChange={e=>setAgents(p=>p.map(a=>a.id===sel.id?{...a,charge:parseInt(e.target.value)||0}:a))} style={inp}/></F>
        <F l="Capacité max"><input type="number" value={sel.maxCharge} onChange={e=>setAgents(p=>p.map(a=>a.id===sel.id?{...a,maxCharge:parseInt(e.target.value)||1}:a))} style={inp}/></F>
      </div>
      <div style={{background:T.blueLight,borderRadius:6,padding:"5px 9px",fontSize:9,color:T.blue}}>Assignation: spécialité P1 puis charge disponible.</div>
    </Card>
  );
}

function ModuleEmployes(){
  const [agents,setAgents]=useState(AGENTS_INIT);
  const [sel,setSel]=useState(null);
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  function sf(k,v){setForm(function(p){var n=Object.assign({},p);n[k]=v;return n;});}

  function saveAgent(){
    setAgents(p=>p.map(a=>a.id===form.id?{...a,...form}:a));
    setModal(null);
  }

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:sel?"1fr 1fr":"1fr",gap:16}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <h3 style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:2}}>Équipe Predictek</h3>
              <div style={{fontSize:11,color:T.muted}}>{agents.filter(a=>a.actif).length} employés actifs · Spécialités et charges configurables</div>
            </div>
            <Btn onClick={()=>{setForm({id:null,prenom:"",nom:"",titre:"",courriel:"",tel:"",role:"predictek_user",actif:true,specialites:[],charge:0,maxCharge:10});setModal("agent");}}>+ Ajouter</Btn>
          </div>
          {agents.map(a=>{
            var pct=Math.round(a.charge/a.maxCharge*100);
            var chargeColor=pct>80?T.red:pct>60?T.amber:T.accent;
            return(
              <Card key={a.id} s={{marginBottom:10,cursor:"pointer",border:"1px solid "+(sel&&sel.id===a.id?T.accent:T.border)}} onClick={()=>setSel(sel&&sel.id===a.id?null:a)}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <Av ini={a.initiales} c={a.role==="predictek_super"?T.gold:a.role==="predictek_admin"?T.navy:T.blue} sz={42}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:T.text}}>{a.prenom} {a.nom}</div>
                        <div style={{fontSize:11,color:T.muted}}>{a.titre} · {a.courriel}</div>
                      </div>
                      <div style={{display:"flex",gap:5,flexShrink:0}}>
                        <Tag l={a.actif?"Actif":"Inactif"} c={a.actif?T.accent:T.muted}/>
                        <Btn sm bg={T.accentLight} tc={T.accent} onClick={e=>{e.stopPropagation();setForm({...a});setModal("agent");}}>Edit</Btn>
                      </div>
                    </div>
                    {/* Spécialités */}
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                      {a.specialites.filter(s=>s.actif).sort((x,y)=>x.priorite-y.priorite).map(s=>{
                        var sp=SPECIALITES[s.id];
                        return sp?<div key={s.id} style={{display:"flex",alignItems:"center",gap:3,background:sp.c+"12",border:"1px solid "+sp.c+"30",borderRadius:20,padding:"2px 8px"}}>
                          <span style={{fontSize:9,fontWeight:700,color:sp.c}}>P{s.priorite}</span>
                          <span style={{fontSize:9,color:sp.c}}>{sp.label}</span>
                        </div>:null;
                      })}
                    </div>
                    {/* Charge de travail */}
                    <div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:9,color:T.muted}}>Charge de travail</span>
                        <span style={{fontSize:9,fontWeight:700,color:chargeColor}}>{a.charge}/{a.maxCharge} tickets</span>
                      </div>
                      <ProgBar val={a.charge} total={a.maxCharge} c={chargeColor} h={6}/>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {sel&&<SpecialtiesPanel sel={sel} setAgents={setAgents} setSel={setSel}/>}
      </div>

      {/* Modal agent */}
      <Modal open={modal==="agent"} onClose={()=>setModal(null)} title={form.id?"Modifier l'employé":"Nouvel employé"}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <F l="Prénom"><input value={form.prenom||""} onChange={e=>sf("prenom",e.target.value)} style={inp}/></F>
          <F l="Nom"><input value={form.nom||""} onChange={e=>sf("nom",e.target.value)} style={inp}/></F>
          <F l="Titre / Poste"><input value={form.titre||""} onChange={e=>sf("titre",e.target.value)} placeholder="ex: Gestionnaire senior" style={inp}/></F>
          <F l="Courriel"><input value={form.courriel||""} onChange={e=>sf("courriel",e.target.value)} style={inp}/></F>
          <F l="Téléphone"><input value={form.tel||""} onChange={e=>sf("tel",e.target.value)} style={inp}/></F>
          <F l="Capacité max (tickets)"><input type="number" value={form.maxCharge||10} onChange={e=>sf("maxCharge",parseInt(e.target.value)||1)} style={inp}/></F>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <input type="checkbox" checked={!!form.actif} onChange={e=>sf("actif",e.target.checked)} style={{width:14,height:14}}/>
          <label style={{fontSize:12,color:T.text}}>Employé actif</label>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={saveAgent} s={{flex:1}}>Enregistrer</Btn>
          <Btn onClick={()=>setModal(null)} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}

//  MODULE CONFIG IA 
function ModuleConfigIA(){
  const [cfg,setCfg]=useState(AI_CONFIG_INIT);
  const [saved,setSaved]=useState(false);
  const cats={
    copro_question:"Question copropriétaire",copro_autorisation:"Autorisation",copro_document:"Document",
    copro_plainte:"Plainte",copro_reparation:"Réparation",admin_decision:"Décision CA",
    admin_approbation:"Approbation CA",admin_rapport:"Rapport",interne_bug:"Bug technique",interne_support:"Support",
  };
  const catGroups=[
    {titre:"Demandes copropriétaires",keys:["copro_question","copro_autorisation","copro_document","copro_plainte","copro_reparation"]},
    {titre:"Demandes administrateurs",keys:["admin_decision","admin_approbation","admin_rapport"]},
    {titre:"Tickets internes Predictek",keys:["interne_bug","interne_support"]},
  ];
  function setMode(cat,mode){setCfg(function(p){var n=Object.assign({},p);n[cat]=Object.assign({},p[cat],{mode:mode});return n;});setSaved(false);}
  return(
    <div>
      <div style={{background:"linear-gradient(135deg,"+T.purpleLight+","+T.blueLight+")",borderRadius:10,padding:"14px 18px",marginBottom:18,border:"1px solid "+T.purple+"20"}}>
        <div style={{fontSize:13,fontWeight:700,color:T.purple,marginBottom:4}}>Modes de réponse IA par catégorie</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {Object.entries(AI_MODES).map(function(e){var k=e[0];var v=e[1];return(
            <div key={k} style={{background:"rgba(255,255,255,0.6)",borderRadius:8,padding:"8px 11px",border:"1px solid "+v.c+"30"}}>
              <div style={{fontSize:11,fontWeight:700,color:v.c,marginBottom:2}}>{v.label}</div>

            </div>
          );})}
        </div>
      </div>
      {catGroups.map(grp=>(
        <Card key={grp.titre} s={{marginBottom:14}}>
          <SH l={grp.titre}/>
          {grp.keys.map(catKey=>{
            var catCfg=cfg[catKey]||{mode:"humain"};
            return(
              <div key={catKey} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,marginBottom:5,background:T.surfaceAlt}}>
                <span style={{fontSize:12,color:T.text,flex:1,fontWeight:500}}>{cats[catKey]||catKey}</span>
                <div style={{display:"flex",gap:4}}>
                  {Object.entries(AI_MODES).map(function(e){var mode=e[0];var mv=e[1];return(
                    <button key={mode} onClick={function(){setMode(catKey,mode);}} style={{background:catCfg.mode===mode?mv.c:T.surface,border:"1px solid "+(catCfg.mode===mode?mv.c:T.border),borderRadius:6,padding:"4px 10px",color:catCfg.mode===mode?"#fff":T.muted,fontSize:10,fontWeight:catCfg.mode===mode?700:400,cursor:"pointer",fontFamily:"inherit"}}>
                      {mv.label}
                    </button>
                  );})}
                </div>
              </div>
            );
          })}
        </Card>
      ))}
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <Btn onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);}} bg={saved?T.accentMid:T.accent}>
          {saved?"Configuration sauvegardée !":"Sauvegarder la configuration"}
        </Btn>
      </div>
    </div>
  );
}

//  MODULE FOURNISSEURS 
function FournisseurDetail({sel,setSel,subTab,setSubTab,setModal,setForm,setFournisseurs}){
  if(!sel)return null;
  return(
    <Card s={{position:"sticky",top:70}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
        <b style={{fontSize:14,color:T.text}}>{sel.nom}</b>
        <div style={{display:"flex",gap:5}}>
          <Btn sm bg={T.accentLight} tc={T.accent} onClick={function(){setForm(Object.assign({},sel));setModal("four");}}>Edit</Btn>
          <button onClick={function(){setSel(null);}} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:T.muted}}>x</button>
        </div>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:12,borderBottom:"1px solid "+T.border,paddingBottom:10}}>
        {[{id:"profil",l:"Profil"},{id:"travaux",l:"Travaux ("+sel.travaux.length+")"},{id:"portail",l:"Portail"}].map(function(t){return(
          <button key={t.id} onClick={function(){setSubTab(t.id);}} style={{background:subTab===t.id?T.accent:T.surfaceAlt,border:"none",borderRadius:6,padding:"4px 10px",color:subTab===t.id?"#fff":T.muted,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:subTab===t.id?600:400}}>{t.l}</button>
        );})}
      </div>
      {subTab==="profil"&&(
        <div>
          {[["Contact",sel.contact],["Courriel",sel.courriel],["Telephone",sel.tel],["Adresse",sel.adresse],["Certifie",sel.certifie?"Oui":"Non"],["Total facture",sel.historiqueFactures.toLocaleString("fr-CA")+" $"]].map(function(e,i){var l=e[0];var v=e[1];return(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<5?"1px solid "+T.border+"40":"none"}}>
              <span style={{fontSize:11,color:T.muted}}>{l}</span>
              <span style={{fontSize:11,fontWeight:500,color:T.text}}>{v}</span>
            </div>
          );})}
          <div style={{marginTop:8}}><Stars n={sel.note}/></div>
          {sel.notes&&<div style={{marginTop:6,fontSize:10,color:T.muted,fontStyle:"italic",padding:"6px 9px",background:T.surfaceAlt,borderRadius:6}}>{sel.notes}</div>}
          <Btn s={{width:"100%",fontSize:11,marginTop:10}} bg={T.navy} onClick={function(){setModal("bon_travail");}}>+ Creer un bon de travail</Btn>
        </div>
      )}
      {subTab==="travaux"&&(
        <div>
          {sel.travaux.length===0&&<div style={{fontSize:11,color:T.muted,textAlign:"center",padding:"14px"}}>Aucun travail enregistre</div>}
          {sel.travaux.map(function(t,i){var st=STATUTS_BON[t.statut]||{};return(
            <div key={i} style={{padding:"8px 11px",background:T.surfaceAlt,borderRadius:8,marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:11,fontWeight:600,color:T.text}}>{t.titre}</span>
                <Tag l={st.label} c={st.c}/>
              </div>
              <div style={{display:"flex",gap:8,fontSize:9,color:T.muted}}>
                <span>{t.dateDebut} — {t.dateFin}</span>
                <span style={{fontWeight:600,color:T.accent}}>{t.montant.toLocaleString("fr-CA")} $</span>
              </div>
              {t.ticketId&&TICKETS_MINI[t.ticketId]&&<div style={{marginTop:4,fontSize:9,color:T.teal}}>CRM #{t.ticketId} — {TICKETS_MINI[t.ticketId].sujet}</div>}
            </div>
          );})}
        </div>
      )}
      {subTab==="portail"&&(
        <div>
          <div style={{background:sel.portalAcces?T.accentLight:T.surfaceAlt,borderRadius:8,padding:"10px 12px",marginBottom:10,border:"1px solid "+(sel.portalAcces?T.accent+"30":T.border)}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:sel.portalAcces?8:0}}>
              <div style={{fontSize:11,fontWeight:700,color:sel.portalAcces?T.accent:T.muted}}>Acces portail fournisseur</div>
              <div onClick={function(){setFournisseurs(function(p){return p.map(function(f){return f.id===sel.id?Object.assign({},f,{portalAcces:!f.portalAcces}):f;});});setSel(function(p){return Object.assign({},p,{portalAcces:!p.portalAcces});});}} style={{width:34,height:18,borderRadius:18,background:sel.portalAcces?T.accent:T.border,cursor:"pointer",position:"relative",flexShrink:0}}>
                <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:sel.portalAcces?18:2,transition:"left .2s",boxShadow:"0 1px 3px #0003"}}/>
              </div>
            </div>
            {sel.portalAcces&&(
              <div>
                <div style={{fontSize:9,color:T.muted,marginBottom:3}}>Identifiants d'acces</div>
                <div style={{background:T.surface,borderRadius:5,padding:"5px 8px",fontSize:10,fontFamily:"monospace",color:T.text,marginBottom:6}}>
                  <div>Courriel: {sel.courriel}</div>
                  <div>Mot de passe: {sel.portailPwd||"—"}</div>
                </div>
                <Btn sm bg={T.blueLight} tc={T.blue} s={{border:"1px solid "+T.blue+"30"}}>Envoyer les acces</Btn>
              </div>
            )}
          </div>
          {sel.portalAcces&&<div style={{background:T.purpleLight,borderRadius:7,padding:"8px 12px",fontSize:10,color:T.purple,border:"1px solid "+T.purple+"20"}}>Le fournisseur peut voir et mettre a jour le statut de ses bons de travail.</div>}
        </div>
      )}
    </Card>
  );
}

function SectionListe({fournisseurs,setFournisseurs,sel,setSel,subTab,setSubTab,setModal,setForm}){
  return(
    <div style={{display:"grid",gridTemplateColumns:sel?"1.2fr 1fr":"1fr",gap:16}}>
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
              {fournisseurs.map(f=>{
                var s=sel&&sel.id===f.id;
                return(
                  <Card key={f.id} s={{cursor:"pointer",border:"2px solid "+(s?T.accent:T.border),transition:"border .15s"}} onClick={()=>setSel(s?null:{...f})}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:5,marginBottom:3,flexWrap:"wrap"}}>
                          {f.categories.map(c=>{const cat=CATEGORIES_FOUR[c];return cat?<Tag key={c} l={cat.label} c={cat.c} sz={9}/>:null;})}
                          {f.certifie&&<Tag l="Certifié" c={T.accent} sz={9}/>}
                          {f.portalAcces&&<Tag l="Portail" c={T.purple} sz={9}/>}
                        </div>
                        <div style={{fontSize:13,fontWeight:700,color:T.text}}>{f.nom}</div>
                        <div style={{fontSize:10,color:T.muted}}>{f.contact} · {f.tel}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                        <Stars n={f.note}/>
                        <div style={{fontSize:9,color:T.muted,marginTop:2}}>{f.nbTravaux} travaux</div>
                      </div>
                    </div>
                    <div style={{fontSize:9,color:T.muted,marginBottom:6}}>{f.territoire.join(", ")}</div>
                    {f.travaux.filter(t=>["accepte","en_cours","envoye"].includes(t.statut)).length>0&&(
                      <div style={{background:T.amberLight,borderRadius:6,padding:"4px 8px",fontSize:9,color:T.amber}}>
                        {f.travaux.filter(t=>["accepte","en_cours","envoye"].includes(t.statut)).length} travaux en cours
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
          {sel&&<FournisseurDetail sel={sel} setSel={setSel} subTab={subTab} setSubTab={setSubTab} setModal={setModal} setForm={setForm} setFournisseurs={setFournisseurs}/>}
    </div>
  );
}

function SectionSoumissions({soumissions,setSoumissions,fournisseurs,form,setForm,setModal}){
  function sf(k,v){setForm(function(p){var n=Object.assign({},p);n[k]=v;return n;});}
  function selectReponse(soumId,fourId){
    setSoumissions(p=>p.map(s=>{
      if(s.id!==soumId)return s;
      return {...s,statut:"attribuee",reponses:s.reponses.map(r=>({...r,selectionne:r.fourId===fourId}))};
    }));
  }
      {/*  APPELS D'OFFRES  */}
      {onglet==="soumissions"&&(
        <div>
          {soumissions.map(s=>{
            var cat=CATEGORIES_FOUR[s.categorie]||{};
            var nbRep=s.reponses.length;
            var nbInv=s.fournisseursInvites.length;
            var dl=Math.ceil((new Date(s.dateLimite)-new Date())/86400000);
            return(
              <Card key={s.id} s={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div>
                    <div style={{display:"flex",gap:6,marginBottom:5}}>
                      <Tag l={cat.label||s.categorie} c={cat.c||T.muted}/>
                      <Tag l={s.statut==="ouverte"?"Ouverte":s.statut==="attribuee"?"Attribuée":"Fermée"} c={s.statut==="ouverte"?T.blue:s.statut==="attribuee"?T.accent:T.muted}/>
                      {dl>=0&&dl<=14&&<Tag l={"Ferme dans "+dl+"j"} c={dl<=3?T.red:T.amber}/>}
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:3}}>{s.titre}</div>
                    <div style={{fontSize:11,color:T.muted}}>{FOURNISSEURS_INIT.find(f=>f.id===s.synd)?FOURNISSEURS_INIT.find(f=>f.id===s.synd).nom:""} · Envoyé {s.dateEnvoi} · Limite {s.dateLimite}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:22,fontWeight:700,color:T.accent}}>{nbRep}/{nbInv}</div>
                    <div style={{fontSize:10,color:T.muted}}>réponses reçues</div>
                  </div>
                </div>
                <div style={{background:T.surfaceAlt,borderRadius:8,padding:"9px 12px",marginBottom:12,fontSize:11,color:T.muted}}>{s.description}</div>
                {/* Fournisseurs invités */}
                <div style={{marginBottom:12}}>
                  <SH l={"Fournisseurs invités ("+nbInv+")"}/>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {s.fournisseursInvites.map(fid=>{
                      var f=fournisseurs.find(x=>x.id===fid);
                      var rep=s.reponses.find(r=>r.fourId===fid);
                      return f?<div key={fid} style={{display:"flex",alignItems:"center",gap:5,background:rep?T.accentLight:T.surfaceAlt,borderRadius:20,padding:"3px 10px",border:"1px solid "+(rep?T.accent+"30":T.border)}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:rep?T.accent:T.muted}}/>
                        <span style={{fontSize:10,color:T.text,fontWeight:rep?600:400}}>{f.nom}</span>
                        {rep&&<span style={{fontSize:9,color:T.accent}}>✓</span>}
                      </div>:null;
                    })}
                  </div>
                </div>
                {/* Réponses reçues */}
                {nbRep>0&&(
                  <div>
                    <SH l="Soumissions reçues"/>
                    {s.reponses.map((rep,i)=>{
                      var f=fournisseurs.find(x=>x.id===rep.fourId);
                      return(
                        <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",background:rep.selectionne?T.accentLight:T.surfaceAlt,borderRadius:8,marginBottom:6,border:"1px solid "+(rep.selectionne?T.accent+"30":T.border)}}>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12,fontWeight:700,color:T.text}}>{f?f.nom:"?"}</div>
                            <div style={{fontSize:10,color:T.muted}}>Délai: {rep.delai} · {rep.dateReponse}</div>
                            {rep.notes&&<div style={{fontSize:10,color:T.muted,fontStyle:"italic"}}>{rep.notes}</div>}
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontSize:16,fontWeight:700,color:rep.selectionne?T.accent:T.text}}>{rep.montant.toLocaleString("fr-CA")} $</div>
                            {f&&<Stars n={f.note}/>}
                          </div>
                          {!rep.selectionne&&s.statut==="ouverte"&&(
                            <Btn sm onClick={()=>selectReponse(s.id,rep.fourId)} bg={T.accentLight} tc={T.accent} s={{border:"1px solid "+T.accent+"30"}}>Choisir</Btn>
                          )}
                          {rep.selectionne&&<Tag l="Sélectionné" c={T.accent}/>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {nbRep===0&&<div style={{fontSize:11,color:T.muted,textAlign:"center",padding:"10px",background:T.surfaceAlt,borderRadius:7}}>En attente de réponses des fournisseurs...</div>}
              </Card>
            );
          })}
        </div>
      )}
}

function SectionBons({fournisseurs}){
      {/*  BONS DE TRAVAIL  */}
      {onglet==="bons_travail"&&(
        <div>
          <div style={{border:"1px solid "+T.border,borderRadius:12,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 120px 100px 80px",gap:8,padding:"9px 14px",background:T.surfaceAlt,borderBottom:"1px solid "+T.border}}>
              {["Titre","Fournisseur","Montant","Statut","Dates","Action"].map((h,i)=><div key={i} style={{fontSize:9,color:T.muted,textTransform:"uppercase",fontWeight:600}}>{h}</div>)}
            </div>
            {fournisseurs.flatMap(f=>f.travaux.map(t=>({...t,four:f}))).sort((a,b)=>b.id-a.id).map((t,i,arr)=>{
              var st=STATUTS_BON[t.statut]||{};
              var ETAPES=["cree","envoye","accepte","en_cours","inspecte","termine","facture","paye"];
              var ep=ETAPES.indexOf(t.statut);
              return(
                <div key={t.id} style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 120px 100px 80px",gap:8,alignItems:"center",padding:"11px 14px",borderBottom:i<arr.length-1?"1px solid "+T.border+"50":"none"}}>
                  <div><div style={{fontSize:12,fontWeight:600,color:T.text}}>{t.titre}</div><div style={{fontSize:9,color:T.muted,display:"flex",gap:3}}>{ETAPES.map((_,j)=><div key={j} style={{flex:1,height:3,borderRadius:2,background:j<=ep?st.c:T.border}}/>)}</div></div>
                  <div style={{fontSize:11,color:T.text}}>{t.four.nom}</div>
                  <div style={{fontSize:12,fontWeight:600,color:T.accent}}>{t.montant.toLocaleString("fr-CA")} $</div>
                  <Tag l={st.label} c={st.c}/>
                  <div style={{fontSize:9,color:T.muted}}>{t.dateDebut}<br/>{t.dateFin}</div>
                  <Btn sm bg={T.accentLight} tc={T.accent}>Voir</Btn>
                </div>
              );
            })}
          </div>
        </div>
      )}

}

function ModuleFournisseurs(){
  var [fournisseurs,setFournisseurs]=useState(FOURNISSEURS_INIT);
  var [soumissions,setSoumissions]=useState(SOUMISSIONS_INIT);
  var [sel,setSel]=useState(null);
  var [onglet,setOnglet]=useState("liste");
  var [subTab,setSubTab]=useState("profil");
  var [modal,setModal]=useState(null);
  var [form,setForm]=useState({});
  function sf(k,v){setForm(function(p){var n=Object.assign({},p);n[k]=v;return n;});}
  function saveFour(){
    if(form.id){setFournisseurs(function(p){return p.map(function(f){return f.id===form.id?Object.assign({},f,form):f;});});}
    else{setFournisseurs(function(p){return p.concat([Object.assign({},form,{id:Date.now(),nbTravaux:0,historiqueFactures:0,travaux:[],portalAcces:false,portailPwd:""})]);});}
    setModal(null);
  }
  function saveSoum(){
    if(!form.titre||!form.description)return;
    setSoumissions(function(p){return p.concat([Object.assign({},form,{id:Date.now(),dateEnvoi:today(),statut:"ouverte",reponses:[],fournisseursInvites:form.fournisseursInvites||[]})]);});
    setModal(null);
  }
  function navStyle(id){
    return {background:onglet===id?T.accent:T.surface,border:"1px solid "+(onglet===id?T.accent:T.border),borderRadius:8,padding:"7px 14px",color:onglet===id?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"};
  }
  return(
    <div>
      <div style={{display:"flex",gap:7,marginBottom:16,flexWrap:"wrap"}}>
        <button onClick={function(){setOnglet("liste");setSel(null);}} style={navStyle("liste")}>Repertoire fournisseurs</button>
        <button onClick={function(){setOnglet("soumissions");setSel(null);}} style={navStyle("soumissions")}>Appels d offres ({soumissions.filter(function(s){return s.statut==="ouverte";}).length})</button>
        <button onClick={function(){setOnglet("bons_travail");setSel(null);}} style={navStyle("bons_travail")}>Bons de travail</button>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          <Btn onClick={function(){setForm({nom:"",contact:"",courriel:"",tel:"",categories:[],territoire:[],note:0,certifie:false,actif:true,adresse:"",notes:""});setModal("four");}} s={{fontSize:11}}>+ Fournisseur</Btn>
          {onglet==="soumissions"&&<Btn onClick={function(){setForm({titre:"",synd:1,categorie:"deneigement",description:"",dateLimite:"",fournisseursInvites:[]});setModal("soumission");}} s={{fontSize:11}} bg={T.navy}>+ Appel offres</Btn>}
        </div>
      </div>
      {onglet==="liste"&&<SectionListe fournisseurs={fournisseurs} setFournisseurs={setFournisseurs} sel={sel} setSel={setSel} subTab={subTab} setSubTab={setSubTab} setModal={setModal} setForm={setForm}/>}
      {onglet==="soumissions"&&<SectionSoumissions soumissions={soumissions} setSoumissions={setSoumissions} fournisseurs={fournisseurs} form={form} setForm={setForm} setModal={setModal}/>}
      {onglet==="bons_travail"&&<SectionBons fournisseurs={fournisseurs}/>}
      <Modal open={modal==="four"} onClose={function(){setModal(null);}} title={form.id?"Modifier fournisseur":"Nouveau fournisseur"} w={540}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <F l="Nom *"><input value={form.nom||""} onChange={function(e){sf("nom",e.target.value);}} style={inp}/></F>
          <F l="Contact"><input value={form.contact||""} onChange={function(e){sf("contact",e.target.value);}} style={inp}/></F>
          <F l="Courriel"><input value={form.courriel||""} onChange={function(e){sf("courriel",e.target.value);}} style={inp}/></F>
          <F l="Telephone"><input value={form.tel||""} onChange={function(e){sf("tel",e.target.value);}} style={inp}/></F>
        </div>
        <F l="Adresse" s={{marginBottom:10}}><input value={form.adresse||""} onChange={function(e){sf("adresse",e.target.value);}} style={inp}/></F>
        <F l="Categories de services" s={{marginBottom:10}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {Object.entries(CATEGORIES_FOUR).map(function(e){var k=e[0];var v=e[1];var sel2=(form.categories||[]).includes(k);return(
              <button key={k} onClick={function(){sf("categories",sel2?(form.categories||[]).filter(function(c){return c!==k;}):(form.categories||[]).concat([k]));}} style={{background:sel2?v.c:T.surfaceAlt,border:"1px solid "+(sel2?v.c:T.border),borderRadius:20,padding:"3px 10px",color:sel2?"#fff":T.muted,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{v.label}</button>
            );})}
          </div>
        </F>
        <F l="Notes" s={{marginBottom:12}}><input value={form.notes||""} onChange={function(e){sf("notes",e.target.value);}} style={inp}/></F>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <label style={{display:"flex",gap:6,alignItems:"center",fontSize:11,color:T.text}}><input type="checkbox" checked={!!form.certifie} onChange={function(e){sf("certifie",e.target.checked);}}/>Certifie RBQ</label>
          <label style={{display:"flex",gap:6,alignItems:"center",fontSize:11,color:T.text}}><input type="checkbox" checked={form.actif!==false} onChange={function(e){sf("actif",e.target.checked);}}/>Actif</label>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={saveFour} s={{flex:1}}>Enregistrer</Btn><Btn onClick={function(){setModal(null);}} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn></div>
      </Modal>
      <Modal open={modal==="soumission"} onClose={function(){setModal(null);}} title="Nouvel appel d offres" w={540}>
        <F l="Titre *" s={{marginBottom:10}}><input value={form.titre||""} onChange={function(e){sf("titre",e.target.value);}} style={inp}/></F>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <F l="Categorie"><select value={form.categorie||"deneigement"} onChange={function(e){sf("categorie",e.target.value);}} style={inp}>{Object.entries(CATEGORIES_FOUR).map(function(e){var k=e[0];var v=e[1];return <option key={k} value={k}>{v.label}</option>;})}</select></F>
          <F l="Date limite"><input type="date" value={form.dateLimite||""} onChange={function(e){sf("dateLimite",e.target.value);}} style={inp}/></F>
        </div>
        <F l="Description *" s={{marginBottom:10}}><textarea value={form.description||""} onChange={function(e){sf("description",e.target.value);}} rows={3} style={Object.assign({},inp,{height:70,resize:"vertical"})}/></F>
        <F l="Fournisseurs a inviter" s={{marginBottom:14}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {fournisseurs.filter(function(f){return f.actif;}).map(function(f){var isInv=(form.fournisseursInvites||[]).includes(f.id);return(
              <button key={f.id} onClick={function(){sf("fournisseursInvites",isInv?(form.fournisseursInvites||[]).filter(function(id){return id!==f.id;}):(form.fournisseursInvites||[]).concat([f.id]));}} style={{background:isInv?T.accent:T.surfaceAlt,border:"1px solid "+(isInv?T.accent:T.border),borderRadius:20,padding:"3px 10px",color:isInv?"#fff":T.muted,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{f.nom}</button>
            );})}
          </div>
        </F>
        <div style={{display:"flex",gap:8}}><Btn onClick={saveSoum} s={{flex:1}}>Envoyer l appel d offres</Btn><Btn onClick={function(){setModal(null);}} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn></div>
      </Modal>
    </div>
  );
}

function PortailFournisseur(){
  var [fourId,setFourId]=useState(1);
  var f=FOURNISSEURS_INIT.find(function(x){return x.id===fourId;})||FOURNISSEURS_INIT[0];
  var nbActifs=f.travaux.filter(function(t){return !["paye","ferme"].includes(t.statut);}).length;
  return(
    <div>
      <div style={{background:T.accentLight,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid "+T.accent+"20"}}>
        <div><div style={{fontSize:13,fontWeight:700,color:T.accent}}>Portail Fournisseur — Demo</div><div style={{fontSize:10,color:T.muted}}>Vue simulée du fournisseur connecté</div></div>
        <select value={fourId} onChange={function(e){setFourId(parseInt(e.target.value));}} style={{border:"1px solid "+T.border,borderRadius:6,padding:"5px 9px",fontSize:11,fontFamily:"inherit",background:T.surface}}>
          {FOURNISSEURS_INIT.filter(function(x){return x.portalAcces;}).map(function(x){return <option key={x.id} value={x.id}>{x.nom}</option>;})}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[{l:"Bons actifs",v:nbActifs,c:T.accent},{l:"En cours",v:f.travaux.filter(function(t){return t.statut==="en_cours";}).length,c:T.amber},{l:"Total facture",v:f.historiqueFactures.toLocaleString("fr-CA")+" $",c:T.navy}].map(function(k,i){return(
          <Card key={i} s={{borderLeft:"4px solid "+k.c,padding:"10px 12px"}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:3}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c}}>{k.v}</div></Card>
        );})}
      </div>
      <SH l="Mes bons de travail"/>
      {f.travaux.length===0&&<div style={{fontSize:11,color:T.muted,textAlign:"center",padding:"16px"}}>Aucun bon de travail.</div>}
      {f.travaux.map(function(t,i){
        var st=STATUTS_BON[t.statut]||{};
        var ETAPES=["cree","envoye","accepte","en_cours","inspecte","termine","facture","paye"];
        var ep=ETAPES.indexOf(t.statut);
        var nextEtape=ETAPES[ep+1];
        return(
          <Card key={i} s={{marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:3}}>{t.titre}</div>
                {t.ticketId&&TICKETS_MINI[t.ticketId]&&<div style={{fontSize:9,color:T.teal}}>CRM #{t.ticketId} — {TICKETS_MINI[t.ticketId].sujet}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                <Tag l={st.label} c={st.c}/>
                <div style={{fontSize:12,fontWeight:700,color:T.accent,marginTop:3}}>{t.montant.toLocaleString("fr-CA")} $</div>
              </div>
            </div>
            <div style={{display:"flex",gap:3,marginBottom:8}}>
              {ETAPES.map(function(e,j){return <div key={j} style={{flex:1,height:4,borderRadius:2,background:j<=ep?st.c:T.border}}/>;}) }
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:10,color:T.muted}}>Etape {ep+1}/8 — {st.label}</span>
              {nextEtape&&<Btn sm onClick={function(){}} bg={T.accentLight} tc={T.accent} s={{border:"1px solid "+T.accent+"30",marginLeft:"auto"}}>Passer a: {STATUTS_BON[nextEtape]?STATUTS_BON[nextEtape].l:nextEtape}</Btn>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function Fournisseurs(){
  const [tab,setTab]=useState("fournisseurs");
  const TABS=[
    {id:"fournisseurs",l:"Fournisseurs & Bons de travail"},
    {id:"employes",l:"Employés & Spécialités"},
    {id:"ia_config",l:"Configuration IA"},
    {id:"portail_four",l:"Portail fournisseur (demo)"},
  ];
  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"Georgia,serif"}}>
      <div style={{background:T.navy,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,"+T.accent+","+T.accentPop+")",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:15,fontFamily:"Georgia,serif"}}>P</span>
          </div>
          <div style={{fontSize:13,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>Predictek</div>
          <div style={{width:1,height:22,background:"#ffffff20",margin:"0 6px"}}/>
          <span style={{fontSize:11,color:T.accentPop,fontWeight:600}}>Fournisseurs · Équipe · Configuration IA</span>
        </div>
        <Av ini="JL" c={T.gold} sz={28}/>
      </div>
      <div style={{background:T.surface,borderBottom:"1px solid "+T.border,padding:"0 20px",display:"flex",gap:2,overflowX:"auto"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",borderBottom:tab===t.id?"2px solid "+T.accent:"2px solid transparent",color:tab===t.id?T.text:T.muted,padding:"11px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:tab===t.id?600:400,whiteSpace:"nowrap"}}>{t.l}</button>)}
      </div>
      <div style={{padding:"20px 24px",maxWidth:1300,margin:"0 auto"}}>
        {tab==="fournisseurs"&&<div><h2 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>Fournisseurs & Bons de travail</h2><p style={{color:T.muted,fontSize:12,marginBottom:16}}>Répertoire, appels d'offres, bons de travail en 8 étapes</p><ModuleFournisseurs/></div>}
        {tab==="employes"&&<div><h2 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>Employés Predictek — Spécialités & Assignation</h2><p style={{color:T.muted,fontSize:12,marginBottom:16}}>Définir les spécialités avec priorités pour l'assignation automatique des tickets CRM</p><ModuleEmployes/></div>}
        {tab==="ia_config"&&<div><h2 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>Configuration IA — Mode de réponse par catégorie</h2><p style={{color:T.muted,fontSize:12,marginBottom:16}}>Auto (IA envoie directement), Approbation (IA rédige, employé approuve), Humain seulement</p><ModuleConfigIA/></div>}
        {tab==="portail_four"&&<div><h2 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>Portail fournisseur — Simulation</h2><p style={{color:T.muted,fontSize:12,marginBottom:16}}>Vue que voit le fournisseur connecté — suivi et mise à jour des bons de travail</p><PortailFournisseur/></div>}
      </div>
    </div>
  );
}
