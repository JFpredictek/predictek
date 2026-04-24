import { useState } from "react";
const T={bg:"#F5F3EE",surface:"#FFF",surfaceAlt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentMid:"#2D8653",accentLight:"#E8F2EC",accentPop:"#3CAF6E",gold:"#B8943A",goldLight:"#FAF3E0",red:"#B83232",redLight:"#FDECEA",amber:"#B86020",amberLight:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueLight:"#EFF6FF",purple:"#6B3FA0",purpleLight:"#F3EEFF"};
const ROLES={
  predictek_super:{id:"predictek_super",niv:1,label:"Super Administrateur",grp:"Predictek",c:T.gold,bg:T.goldLight,desc:"Acces complet, facturation, clients, configuration.",perms:{syndicats:"complet",comptabilite:"complet",unites:"complet",documents:"complet",usagers:"complet",facturation:"complet",config:"complet",rapports:"complet",votes:"complet",demandes:"complet"}},
  predictek_admin:{id:"predictek_admin",niv:1,label:"Administrateur",grp:"Predictek",c:T.navy,bg:"#EEF2FF",desc:"Gestion syndicats, support, pas facturation Predictek.",perms:{syndicats:"complet",comptabilite:"complet",unites:"complet",documents:"complet",usagers:"gestion",facturation:"lecture",config:"partiel",rapports:"complet",votes:"complet",demandes:"complet"}},
  predictek_user:{id:"predictek_user",niv:1,label:"Utilisateur",grp:"Predictek",c:T.blue,bg:T.blueLight,desc:"Acces lecture, support client.",perms:{syndicats:"lecture",comptabilite:"lecture",unites:"lecture",documents:"lecture",usagers:"lecture",facturation:"aucun",config:"aucun",rapports:"lecture",votes:"lecture",demandes:"lecture"}},
  synd_president:{id:"synd_president",niv:2,label:"Président du CA",grp:"Syndicat",c:T.accent,bg:T.accentLight,rang:1,desc:"Admin principal. Approbations, acces complet au syndicat.",perms:{syndicats:"propre",comptabilite:"complet",unites:"complet",documents:"complet",usagers:"gestion_synd",facturation:"aucun",config:"synd",rapports:"complet",votes:"admin",demandes:"complet"}},
  synd_tresorier:{id:"synd_tresorier",niv:2,label:"Trésorier du CA",grp:"Syndicat",c:T.accentMid,bg:T.accentLight,rang:2,desc:"Gestion financiere, approbation factures.",perms:{syndicats:"lecture",comptabilite:"complet",unites:"lecture",documents:"complet",usagers:"lecture",facturation:"aucun",config:"aucun",rapports:"complet",votes:"vote",demandes:"lecture"}},
  synd_secretaire:{id:"synd_secretaire",niv:2,label:"Secrétaire du CA",grp:"Syndicat",c:T.accentMid,bg:T.accentLight,rang:3,desc:"Documents, PV assemblee, communications.",perms:{syndicats:"lecture",comptabilite:"lecture",unites:"lecture",documents:"complet",usagers:"lecture",facturation:"aucun",config:"aucun",rapports:"lecture",votes:"vote",demandes:"complet"}},
  synd_admin:{id:"synd_admin",niv:2,label:"Administrateur CA",grp:"Syndicat",c:T.accentMid,bg:T.accentLight,rang:4,desc:"Membre CA. Lecture + vote.",perms:{syndicats:"lecture",comptabilite:"lecture",unites:"lecture",documents:"lecture",usagers:"aucun",facturation:"aucun",config:"aucun",rapports:"lecture",votes:"vote",demandes:"lecture"}},
  synd_gestionnaire:{id:"synd_gestionnaire",niv:2,label:"Gestionnaire externe",grp:"Syndicat",c:T.purple,bg:T.purpleLight,rang:5,desc:"Gestionnaire mandate. Acces operationnel complet.",perms:{syndicats:"propre",comptabilite:"complet",unites:"complet",documents:"complet",usagers:"aucun",facturation:"aucun",config:"aucun",rapports:"complet",votes:"aucun",demandes:"complet"}},
  copro:{id:"copro",niv:3,label:"Copropriétaire",grp:"Copropriétaire",c:T.amber,bg:T.amberLight,desc:"Acces sa propre unite. Permissions configurables par syndicat.",perms:{syndicats:"aucun",comptabilite:"propre",unites:"propre",documents:"configurable",usagers:"aucun",facturation:"aucun",config:"aucun",rapports:"aucun",votes:"configurable",demandes:"configurable"}},
};
const SYNDICATS=[
  {id:1,nom:"Syndicat des copropriétaires Piedmont",ville:"Stoneham-et-Tewkesbury",unites:36,plan:"Pro",actif:true,pilote:true},
  {id:2,nom:"Condos du Vieux-Port",ville:"Québec",unites:32,plan:"Essentiel",actif:true,pilote:false},
  {id:3,nom:"Tour des Laurentides",ville:"Laval",unites:128,plan:"Prestige",actif:true,pilote:false},
];
const CFG_INIT={
  1:{mode:"seuil",seuil:500,max_admins:5,copro_solde:true,copro_cotisations:true,copro_avis:true,copro_releve:true,copro_documents:true,copro_votes:true,copro_demandes:true,copro_ce:false,copro_ass:false},
  2:{mode:"toujours_1",seuil:0,max_admins:3,copro_solde:true,copro_cotisations:true,copro_avis:true,copro_releve:false,copro_documents:false,copro_votes:false,copro_demandes:true,copro_ce:false,copro_ass:false},
  3:{mode:"toujours_2",seuil:0,max_admins:7,copro_solde:true,copro_cotisations:true,copro_avis:true,copro_releve:true,copro_documents:true,copro_votes:true,copro_demandes:true,copro_ce:true,copro_ass:true},
};

// Postes CA fixes (rang obligatoire 1=Pres, 2=Tres, 3=Sec, 4-7=Admin)
const POSTES_CA=[
  {rang:1,titre:"Président",roleId:"synd_president",obligatoire:true},
  {rang:2,titre:"Trésorier",roleId:"synd_tresorier",obligatoire:true},
  {rang:3,titre:"Secrétaire",roleId:"synd_secretaire",obligatoire:false},
  {rang:4,titre:"Administrateur 1",roleId:"synd_admin",obligatoire:false},
  {rang:5,titre:"Administrateur 2",roleId:"synd_admin",obligatoire:false},
  {rang:6,titre:"Administrateur 3",roleId:"synd_admin",obligatoire:false},
  {rang:7,titre:"Administrateur 4",roleId:"synd_admin",obligatoire:false},
];

// Mandats CA par syndicat
const MANDATS_INIT={
  1:[
    {id:1,synd:1,rang:1,prenom:"Jean-François",nom:"Laroche",courriel:"jf.laroche@coproprietepiedmont.com",debut:"2024-11-27",fin:"2026-11-27",actif:true,notes:"Elu a l'AGA 2024. President fondateur."},
    {id:2,synd:1,rang:2,prenom:"Jean-François",nom:"Bégin",courriel:"jf.begin@coproprietepiedmont.com",debut:"2024-11-27",fin:"2026-11-27",actif:true,notes:"Elu a l'AGA 2024."},
    {id:3,synd:1,rang:4,prenom:"Michel",nom:"Beaudoin",courriel:"m.beaudoin@email.com",debut:"2025-05-27",fin:"2027-05-27",actif:true,notes:"Coopte en mai 2025."},
    // Historique
    {id:10,synd:1,rang:1,prenom:"Robert",nom:"Gagnon",courriel:"r.gagnon@email.com",debut:"2022-11-01",fin:"2024-11-27",actif:false,notes:"President fondateur. N a pas sollicite de renouvellement."},
  ],
  2:[
    {id:4,synd:2,rang:1,prenom:"Anne",nom:"Morin",courriel:"a.morin@condosvieuxport.com",debut:"2024-06-15",fin:"2026-06-15",actif:true,notes:""},
    {id:5,synd:2,rang:2,prenom:"Pierre",nom:"Duval",courriel:"p.duval@email.com",debut:"2024-06-15",fin:"2026-06-15",actif:true,notes:""},
  ],
  3:[
    {id:6,synd:3,rang:1,prenom:"Robert",nom:"Hébert",courriel:"r.hebert@laurentides.com",debut:"2023-09-01",fin:"2025-09-01",actif:true,notes:""},
    {id:7,synd:3,rang:2,prenom:"Sylvie",nom:"Côté",courriel:"s.cote@laurentides.com",debut:"2023-09-01",fin:"2025-09-01",actif:true,notes:""},
    {id:8,synd:3,rang:3,prenom:"Marc",nom:"Laberge",courriel:"m.laberge@laurentides.com",debut:"2023-09-01",fin:"2025-09-01",actif:true,notes:""},
    {id:9,synd:3,rang:4,prenom:"Julie",nom:"Paquin",courriel:"j.paquin@laurentides.com",debut:"2024-01-15",fin:"2026-01-15",actif:true,notes:"Cooptee jan 2024."},
  ],
};
const USERS_INIT=[
  {id:1,prenom:"Jean-François",nom:"Laroche",courriel:"jf.laroche@predictek.com",role:"predictek_super",synd:null,unite:null,statut:"actif",created:"2024-01-15",lastLogin:"2026-04-22"},
  {id:2,prenom:"Marie-Claude",nom:"Bouchard",courriel:"mc.bouchard@predictek.com",role:"predictek_admin",synd:null,unite:null,statut:"actif",created:"2024-03-01",lastLogin:"2026-04-21"},
  {id:3,prenom:"Patrick",nom:"Simard",courriel:"p.simard@predictek.com",role:"predictek_user",synd:null,unite:null,statut:"actif",created:"2024-06-15",lastLogin:"2026-04-19"},
  {id:4,prenom:"Jean-François",nom:"Laroche",courriel:"jf.laroche@coproprietepiedmont.com",role:"synd_president",synd:1,unite:"531",statut:"actif",created:"2024-11-01",lastLogin:"2026-04-22"},
  {id:5,prenom:"Jean-François",nom:"Bégin",courriel:"jf.begin@coproprietepiedmont.com",role:"synd_tresorier",synd:1,unite:"521",statut:"actif",created:"2024-11-01",lastLogin:"2026-04-20"},
  {id:6,prenom:"Michel",nom:"Beaudoin",courriel:"m.beaudoin@email.com",role:"copro",synd:1,unite:"515",statut:"actif",created:"2025-01-10",lastLogin:"2026-04-15"},
  {id:7,prenom:"Lucette",nom:"Tremblay",courriel:"l.tremblay@email.com",role:"copro",synd:1,unite:"539",statut:"actif",created:"2025-01-10",lastLogin:"2026-03-28"},
  {id:8,prenom:"Sébastien",nom:"Grondin",courriel:"s.grondin@email.com",role:"copro",synd:1,unite:"583",statut:"invitation",created:"2026-04-20",lastLogin:null},
  {id:9,prenom:"Anne",nom:"Morin",courriel:"a.morin@condosvieuxport.com",role:"synd_president",synd:2,unite:null,statut:"actif",created:"2025-02-01",lastLogin:"2026-04-18"},
];
const INVITES_INIT=[
  {id:1,courriel:"fabienne.maltais@email.com",role:"copro",synd:1,unite:"527",dateEnvoi:"2026-04-20",expiry:"2026-04-27"},
  {id:2,courriel:"nouveau.admin@piedmont.com",role:"synd_admin",synd:1,unite:null,dateEnvoi:"2026-04-22",expiry:"2026-04-29"},
];
const TSYND={
  1:[
    {id:1001,cat:"copro_question",sujet:"Location Airbnb permise?",auteur:"Michel Beaudoin",unite:"515",statut:"resolu",date:"2026-04-15",agentId:4},
    {id:1002,cat:"copro_plainte",sujet:"Bruit excessif — Unité 533",auteur:"Jean-François Laroche",unite:"531",statut:"en_cours",date:"2026-04-19",agentId:4},
    {id:1004,cat:"admin_approbation",sujet:"Approbation facture Déneigement 5 297$",auteur:"Jean-François Laroche",unite:null,statut:"en_cours",date:"2026-04-20",agentId:4},
    {id:1006,cat:"copro_reparation",sujet:"Fuite d'eau — plafond salon unité 527",auteur:"Fabienne Maltais",unite:"527",statut:"nouveau",date:"2026-04-22",agentId:5},
    {id:1008,cat:"copro_document",sujet:"État certifié des charges — vente unité 539",auteur:"Lucette Tremblay",unite:"539",statut:"nouveau",date:"2026-04-22",agentId:5},
  ],
  2:[{id:2001,cat:"copro_question",sujet:"Règles pour animaux",auteur:"Lucie Tremblay",unite:"204",statut:"ai_repond",date:"2026-04-22",agentId:null}],
  3:[{id:3001,cat:"interne_bug",sujet:"Erreur génération rapport",auteur:"Robert Hébert",unite:null,statut:"nouveau",date:"2026-04-22",agentId:null}],
};
const TST={nouveau:{l:"Nouveau",c:T.blue},ai_repond:{l:"IA",c:T.purple},en_cours:{l:"En cours",c:T.amber},attente_client:{l:"Att. client",c:T.gold},resolu:{l:"Résolu",c:T.accent},ferme:{l:"Fermé",c:T.muted}};
const TCAT={copro_question:{l:"Question",c:T.blue},copro_plainte:{l:"Plainte",c:T.red},copro_reparation:{l:"Répar.",c:T.amber},copro_autorisation:{l:"Author.",c:T.purple},copro_document:{l:"Document",c:T.accentMid},admin_decision:{l:"Décision",c:T.accent},admin_approbation:{l:"Approbation",c:T.accentMid},admin_rapport:{l:"Rapport",c:T.navy},interne_bug:{l:"Bug",c:T.red},interne_support:{l:"Support",c:T.purple}};


var td=function(){return new Date().toISOString().slice(0,10);};
var iniN=function(p,n){return((p||"").charAt(0)+(n||"").charAt(0)).toUpperCase();};
var money=function(n){if(!n&&n!==0)return"—";return(n<0?"-":"")+Math.abs(n).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var daysUntil=function(d){return d?Math.ceil((new Date(d)-new Date())/86400000):9999;};

function Btn(p){return <button onClick={p.onClick} style={{background:p.bg||T.accent,border:p.border||"none",borderRadius:7,padding:p.sm?"4px 10px":"8px 15px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",...(p.s||{})}}>{p.children}</button>;}
function Tag(p){return <span style={{fontSize:p.sz||10,padding:"2px 7px",borderRadius:20,background:(p.c||T.accent)+"18",color:p.c||T.accent,fontWeight:600,whiteSpace:"nowrap"}}>{p.l}</span>;}
function Card(p){return <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,...(p.s||{})}}>{p.children}</div>;}
function SH(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8,fontWeight:600,...(p.s||{})}}>{p.l}</div>;}
var inp={width:"100%",border:"1px solid "+T.border,borderRadius:7,padding:"7px 10px",fontSize:13,fontFamily:"inherit",boxSizing:"border-box",background:T.surface,outline:"none"};
function F(p){return <div style={p.s}><div style={{fontSize:10,color:T.muted,marginBottom:3}}>{p.l}</div>{p.children}</div>;}
function Modal(p){
  if(!p.open)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"#00000060",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={function(e){if(e.target===e.currentTarget)p.onClose();}}>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:22,width:p.w||500,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <b style={{fontSize:15,color:T.text}}>{p.title}</b>
          <button onClick={p.onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:T.muted}}>x</button>
        </div>
        {p.children}
      </div>
    </div>
  );
}
function Avatar(p){var r=p.roleId?ROLES[p.roleId]:null;var bg=r?r.c:T.muted;var sz=p.size||34;return <div style={{width:sz,height:sz,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*0.33,fontWeight:700,color:"#fff",flexShrink:0}}>{p.ini}</div>;}
function PermBadge(p){var c={complet:T.accent,lecture:T.blue,gestion:T.accentMid,partiel:T.amber,vote:T.accentMid,admin:T.accent,propre:T.purple,configurable:T.gold,"gestion_synd":T.accentMid,synd:T.amber,aucun:T.muted}[p.v]||T.muted;var lbl={complet:"Complet",lecture:"Lecture",gestion:"Gestion",partiel:"Partiel",vote:"Vote",admin:"Admin",propre:"Propre",configurable:"Config.","gestion_synd":"Gestion",synd:"Syndicat",aucun:"—"}[p.v]||p.v;if(p.v==="aucun")return <span style={{fontSize:9,color:T.muted}}>—</span>;return <span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:c+"18",color:c,fontWeight:600}}>{lbl}</span>;}

// MODULE CA
function ModuleCA(p){
  var selSyndExternal=p?p.selSyndId:null;
  var [selSyndLocal,setSelSyndLocal]=useState(1);
  var selSynd=selSyndExternal||selSyndLocal;
  function setSelSynd(v){if(!selSyndExternal)setSelSyndLocal(v);}
  var [mandats,setMandats]=useState(MANDATS_INIT);
  var [modal,setModal]=useState(null);
  var [form,setForm]=useState({});
  var [showHist,setShowHist]=useState(false);
  function sf(k,v){setForm(function(p){var n=Object.assign({},p);n[k]=v;return n;});}

  var sy=SYNDICATS.find(function(s){return s.id===selSynd;});
  var cfg=CFG_INIT[selSynd]||{};
  var actifs=(mandats[selSynd]||[]).filter(function(m){return m.actif;});
  var hist=(mandats[selSynd]||[]).filter(function(m){return !m.actif;});

  function openNomination(poste,mandatExist){
    setModal("nominer");
    if(mandatExist){
      setForm({rang:poste.rang,prenom:mandatExist.prenom,nom:mandatExist.nom,courriel:mandatExist.courriel,debut:mandatExist.debut,fin:mandatExist.fin,notes:mandatExist.notes||"",replace:mandatExist.id});
    } else {
      setForm({rang:poste.rang,prenom:"",nom:"",courriel:"",debut:td(),fin:"",notes:"",replace:null});
    }
  }

  function sauveMandat(){
    if(!form.prenom||!form.nom)return;
    setMandats(function(prev){
      var arr=[].concat(prev[selSynd]||[]);
      // Si remplacement: terminer ancien mandat
      if(form.replace){
        arr=arr.map(function(m){return m.id===form.replace?Object.assign({},m,{actif:false,fin:td()}):m;});
      }
      // Ajouter nouveau mandat
      var newM={id:Date.now(),synd:selSynd,rang:form.rang,prenom:form.prenom,nom:form.nom,courriel:form.courriel,debut:form.debut||td(),fin:form.fin,actif:true,notes:form.notes||""};
      arr=arr.concat([newM]);
      var n=Object.assign({},prev);n[selSynd]=arr;return n;
    });
    setModal(null);
  }

  function terminerMandat(id){
    setMandats(function(prev){
      var arr=(prev[selSynd]||[]).map(function(m){return m.id===id?Object.assign({},m,{actif:false,fin:td()}):m;});
      var n=Object.assign({},prev);n[selSynd]=arr;return n;
    });
  }

  var mandatExpire=function(m){var j=daysUntil(m.fin);return{exp:j<0,bientot:j>=0&&j<=90,jours:j};};

  return(
    <div>
      {/* Sélecteur syndicat */}
      {!selSyndExternal&&<div style={{display:"flex",gap:8,marginBottom:18}}>
        {SYNDICATS.map(function(s){return(
          <button key={s.id} onClick={function(){setSelSynd(s.id);}} style={{background:selSynd===s.id?T.accent:T.surface,border:"1px solid "+(selSynd===s.id?T.accent:T.border),borderRadius:8,padding:"7px 14px",color:selSynd===s.id?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:selSynd===s.id?600:400}}>
            {s.nom.split(" ").slice(0,3).join(" ")}
          </button>
        );})}
      </div>}

      {/* Header syndicat */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,padding:"12px 16px",background:T.accentLight,borderRadius:10,border:"1px solid "+T.accent+"20"}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.accent}}>{sy?sy.nom:""}</div>
          <div style={{fontSize:11,color:T.muted}}>{actifs.length} / {cfg.max_admins||5} postes occupés · Max {cfg.max_admins||5} administrateurs</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){setShowHist(!showHist);}} bg={T.surfaceAlt} tc={T.muted} s={{border:"1px solid "+T.border,fontSize:11}}>{showHist?"Masquer":"Voir"} historique ({hist.length})</Btn>
          <Btn onClick={function(){openNomination({rang:4},null);}} s={{fontSize:11}}>+ Nommer un admin</Btn>
        </div>
      </div>

      {/* Grille des postes CA */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:16}}>
        {POSTES_CA.slice(0,cfg.max_admins||5).map(function(poste){
          var mandat=actifs.find(function(m){return m.rang===poste.rang;});
          var me=mandat?mandatExpire(mandat):{};
          var borderColor=mandat?(me.exp?T.red:me.bientot?T.amber:T.accent):T.border;
          var r=ROLES[poste.roleId]||{};
          return(
            <Card key={poste.rang} s={{border:"2px solid "+borderColor+(mandat?"":"60"),background:mandat?T.surface:T.surfaceAlt}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:7,background:r.c+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:r.c}}>{poste.rang}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:T.text}}>{poste.titre}</div>
                    <Tag l={r.label} c={r.c} sz={9}/>
                    {poste.obligatoire&&<Tag l="Obligatoire" c={T.red} sz={8}/>}
                  </div>
                </div>
                {mandat&&(
                  <div style={{display:"flex",gap:5}}>
                    <Btn sm onClick={function(){openNomination(poste,mandat);}} bg={T.accentLight} tc={T.accent} s={{border:"1px solid "+T.accent+"30"}}>Remplacer</Btn>
                    <Btn sm onClick={function(){terminerMandat(mandat.id);}} bg={T.redLight} tc={T.red}>Terminer</Btn>
                  </div>
                )}
                {!mandat&&(
                  <Btn sm onClick={function(){openNomination(poste,null);}} bg={T.accent}>Nommer</Btn>
                )}
              </div>

              {mandat?(
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:9,padding:"9px",background:T.surfaceAlt,borderRadius:8,marginBottom:8}}>
                    <Avatar ini={iniN(mandat.prenom,mandat.nom)} roleId={poste.roleId} size={36}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:T.text}}>{mandat.prenom} {mandat.nom}</div>
                      <div style={{fontSize:10,color:T.muted}}>{mandat.courriel}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <div style={{background:T.surfaceAlt,borderRadius:6,padding:"5px 9px"}}><span style={{fontSize:9,color:T.muted}}>Début: </span><span style={{fontSize:10,fontWeight:600,color:T.text}}>{mandat.debut}</span></div>
                    <div style={{background:mandat.fin&&me.exp?T.redLight:mandat.fin&&me.bientot?T.amberLight:T.surfaceAlt,borderRadius:6,padding:"5px 9px"}}><span style={{fontSize:9,color:T.muted}}>Fin: </span><span style={{fontSize:10,fontWeight:600,color:mandat.fin?(me.exp?T.red:me.bientot?T.amber:T.text):T.muted}}>{mandat.fin||"Indét."}</span></div>
                    {!mandat.fin&&<Tag l="En cours" c={T.accent} sz={9}/>}
                    {mandat.fin&&me.exp&&<Tag l="EXPIRE" c={T.red} sz={9}/>}
                    {mandat.fin&&me.bientot&&!me.exp&&<Tag l={"J-"+me.jours} c={T.amber} sz={9}/>}
                    {mandat.fin&&!me.exp&&!me.bientot&&<Tag l={"J-"+me.jours} c={T.accent} sz={9}/>}
                  </div>
                  {mandat.notes&&<div style={{marginTop:7,fontSize:10,color:T.muted,fontStyle:"italic"}}>Note: {mandat.notes}</div>}
                  {(function(){
                    var uUser=USERS_INIT.find(function(u){return u.synd===selSynd&&u.courriel===mandat.courriel;});
                    var tixList=(TSYND[selSynd]||[]).filter(function(t){return uUser?t.agentId===uUser.id:false;});
                    if(!tixList.length)return null;
                    return(
                      <div style={{marginTop:8,borderTop:"1px solid "+T.border+"50",paddingTop:7}}>
                        <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",fontWeight:600,marginBottom:5}}>Tickets assignés ({tixList.length})</div>
                        {tixList.slice(0,3).map(function(t,ti){
                          var ts=TST[t.statut]||{};var tc=TCAT[t.cat]||{};
                          return(
                            <div key={ti} style={{display:"flex",gap:6,alignItems:"center",padding:"4px 6px",background:T.surfaceAlt,borderRadius:5,marginBottom:3}}>
                              <span style={{fontSize:8,padding:"1px 5px",borderRadius:10,background:tc.c+"18",color:tc.c,fontWeight:600,flexShrink:0}}>{tc.l}</span>
                              <span style={{fontSize:9,color:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.sujet}</span>
                              <span style={{fontSize:8,padding:"1px 5px",borderRadius:10,background:ts.c+"18",color:ts.c,fontWeight:600,flexShrink:0}}>{ts.l}</span>
                            </div>
                          );
                        })}
                        {tixList.length>3&&<div style={{fontSize:9,color:T.muted,textAlign:"right"}}>+{tixList.length-3} autre(s)</div>}
                      </div>
                    );
                  })()}
                </div>
              ):(
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Poste vacant</div>
                  {poste.obligatoire&&<div style={{fontSize:10,color:T.red}}>Ce poste doit être comblé</div>}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Historique des mandats */}
      {showHist&&hist.length>0&&(
        <Card s={{marginBottom:16}}>
          <SH l={"Historique des mandats — "+hist.length+" mandat(s) terminé(s)"}/>
          <div style={{border:"1px solid "+T.border,borderRadius:8,overflow:"hidden"}}>
            {hist.map(function(m,i){var po=(POSTES_CA.find(function(p){return p.rang===m.rang;})||{titre:"Admin"});return(
              <div key={i} style={{display:"flex",gap:9,alignItems:"center",padding:"7px 12px",borderBottom:i<hist.length-1?"1px solid "+T.border+"40":"none",background:i%2===0?T.surfaceAlt+"60":"transparent"}}>
                <Tag l={po.titre.split(" ")[0]} c={T.muted}/>
                <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:T.text}}>{m.prenom} {m.nom}</div><div style={{fontSize:9,color:T.muted}}>{m.courriel}</div></div>
                <div style={{fontSize:9,color:T.muted,flexShrink:0}}>{m.debut}{m.fin?" — "+m.fin:""}</div>
              </div>
            );})}
          </div>        </Card>
      )}

      {/* Modal nomination */}
      <Modal open={modal==="nominer"} onClose={function(){setModal(null);}} title={form.replace?"Remplacer un administrateur":"Nommer un administrateur"} w={520}>
        {form.replace&&(
          <div style={{background:T.amberLight,borderRadius:8,padding:"9px 12px",marginBottom:14,fontSize:11,color:T.amber}}>
            Le mandat actuel sera terminé aujourd'hui. Un nouveau mandat sera créé pour la personne nommée.
          </div>
        )}
        {/* Sélection du poste */}
        <F l="Poste au CA" s={{marginBottom:12}}>
          <select value={form.rang} onChange={function(e){sf("rang",parseInt(e.target.value));}} style={inp}>
            {POSTES_CA.map(function(p,i){
              var r=ROLES[p.roleId]||{};
              return <option key={i} value={p.rang}>{p.titre} — {r.label}{p.obligatoire?" (obligatoire)":""}</option>;
            })}
          </select>
        </F>
        {(function(){var _p=POSTES_CA.find(function(p){return p.rang===(form.rang||1);})||POSTES_CA[0];var _r=ROLES[_p.roleId]||{c:T.accentMid,bg:T.accentLight,desc:""};return _r.desc?<div style={{background:_r.bg,borderRadius:6,padding:"6px 10px",marginBottom:10,fontSize:10,color:_r.c}}>{_r.desc}</div>:null;})()}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <F l="Prénom *"><input value={form.prenom||""} onChange={function(e){sf("prenom",e.target.value);}} style={inp}/></F>
          <F l="Nom *"><input value={form.nom||""} onChange={function(e){sf("nom",e.target.value);}} style={inp}/></F>
        </div>
        <F l="Courriel" s={{marginBottom:10}}><input value={form.courriel||""} onChange={function(e){sf("courriel",e.target.value);}} placeholder="prenom.nom@email.com" style={inp}/></F>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <F l="Début du mandat *"><input type="date" value={form.debut||td()} onChange={function(e){sf("debut",e.target.value);}} style={inp}/></F>
          <F l="Fin du mandat (optionnel)"><input type="date" value={form.fin||""} onChange={function(e){sf("fin",e.target.value);}} style={inp}/></F>
        </div>
        <F l="Notes / contexte" s={{marginBottom:14}}><input value={form.notes||""} onChange={function(e){sf("notes",e.target.value);}} placeholder="ex: Élu à l'AGA 2026, coopté, remplace M. X..." style={inp}/></F>
        <div style={{background:T.blueLight,borderRadius:6,padding:"6px 10px",marginBottom:12,fontSize:10,color:T.blue}}>Un accès Predictek sera créé et un courriel d'invitation envoyé.</div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={sauveMandat} s={{flex:1}}>{form.replace?"Confirmer le remplacement":"Nommer au CA"}</Btn>
          <Btn onClick={function(){setModal(null);}} bg={T.surfaceAlt} tc={T.muted} s={{border:"1px solid "+T.border}}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}

// MODULE USAGERS (compact)
function ModuleUsagers(){
  var [users,setUsers]=useState(USERS_INIT);
  var [invites,setInvites]=useState(INVITES_INIT);
  var [filtre,setFiltre]=useState("tous");
  var [grp,setGrp]=useState("tous");
  var [q,setQ]=useState("");
  var [modal,setModal]=useState(false);
  var [form,setForm]=useState({prenom:"",nom:"",courriel:"",role:"copro",synd:1,unite:""});
  var [selU,setSelU]=useState(null);
  function sf(k,v){setForm(function(p){var n=Object.assign({},p);n[k]=v;return n;});}
  var filt=users.filter(function(u){
    var okS=filtre==="tous"||(filtre==="actif"&&u.statut==="actif")||(filtre==="invite"&&u.statut==="invitation");
    var okG=grp==="tous"||ROLES[u.role].grp.toLowerCase()===grp;
    var okQ=q===""||u.nom.toLowerCase().includes(q.toLowerCase())||u.courriel.toLowerCase().includes(q.toLowerCase());
    return okS&&okG&&okQ;
  });
  function inviter(){
    if(!form.courriel)return;
    var nu={id:Date.now(),prenom:form.prenom||"?",nom:form.nom||"?",courriel:form.courriel,role:form.role,synd:ROLES[form.role].niv>=2?form.synd:null,unite:form.role==="copro"?form.unite:null,statut:"invitation",created:td(),lastLogin:null};
    setUsers(function(p){return[nu].concat(p);});
    setInvites(function(p){return[{id:Date.now(),courriel:form.courriel,role:form.role,synd:nu.synd,unite:nu.unite,dateEnvoi:td(),expiry:new Date(Date.now()+7*86400000).toISOString().slice(0,10)}].concat(p);});
    setModal(false);setForm({prenom:"",nom:"",courriel:"",role:"copro",synd:1,unite:""});
  }
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
        {[{l:"Actifs Predictek",v:users.filter(function(u){return u.statut==="actif"&&ROLES[u.role]&&ROLES[u.role].niv===1;}).length,c:T.accent},{l:"Invitations en attente",v:invites.length,c:T.blue},{l:"Total usagers",v:users.length,c:T.navy}].map(function(k,i){return(
          <Card key={i} s={{borderLeft:"4px solid "+k.c,padding:"9px 12px"}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:2}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c}}>{k.v}</div></Card>
        );})}
      </div>
      <div style={{display:"flex",gap:7,marginBottom:11,flexWrap:"wrap",alignItems:"center"}}>
        <input value={q} onChange={function(e){setQ(e.target.value);}} placeholder="Rechercher..." style={{...inp,width:160,fontSize:11}}/>
        <div style={{display:"flex",gap:3}}>{[{id:"tous",l:"Tous"},{id:"actif",l:"Actifs"},{id:"invite",l:"Invités"}].map(function(o){return <button key={o.id} onClick={function(){setFiltre(o.id);}} style={{background:filtre===o.id?T.accent:T.surface,border:"1px solid "+(filtre===o.id?T.accent:T.border),borderRadius:5,padding:"3px 9px",color:filtre===o.id?"#fff":T.muted,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{o.l}</button>;})}</div>
        <div style={{display:"flex",gap:3}}>{[{id:"predictek",l:"Predictek"},{id:"tous",l:"Tous les niveaux"},{id:"syndicat",l:"Syndicat"},{id:"copropriétaire",l:"Copros"}].map(function(o){return <button key={o.id} onClick={function(){setGrp(o.id);}} style={{background:grp===o.id?T.navy:T.surface,border:"1px solid "+(grp===o.id?T.navy:T.border),borderRadius:5,padding:"3px 9px",color:grp===o.id?"#fff":T.muted,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{o.l}</button>;})}</div>
        <Btn onClick={function(){setModal(true);}} s={{marginLeft:"auto",fontSize:11}}>+ Inviter un usager</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:selU?"1.4fr 1fr":"1fr",gap:13}}>
        <Card s={{padding:0}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 110px 80px",gap:6,padding:"7px 12px",background:T.surfaceAlt,borderRadius:"12px 12px 0 0",borderBottom:"1px solid "+T.border}}>
            {["Usager","Rôle","Syndicat","Dernière conn.","Statut"].map(function(h,i){return <div key={i} style={{fontSize:9,color:T.muted,textTransform:"uppercase",fontWeight:600}}>{h}</div>;})}
          </div>
          {filt.map(function(u,i){var r=ROLES[u.role]||{};var sy=SYNDICATS.find(function(s){return s.id===u.synd;});var s=selU&&selU.id===u.id;return(
            <div key={u.id} onClick={function(){setSelU(s?null:u);}} style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 110px 80px",gap:6,alignItems:"center",padding:"9px 12px",borderBottom:i<filt.length-1?"1px solid "+T.border+"50":"none",cursor:"pointer",background:s?T.accentLight:"transparent"}}>
              <div style={{display:"flex",gap:7,alignItems:"center"}}><Avatar ini={iniN(u.prenom,u.nom)} roleId={u.role} size={28}/><div><div style={{fontSize:11,fontWeight:600,color:T.text}}>{u.prenom} {u.nom}</div><div style={{fontSize:9,color:T.muted}}>{u.courriel}</div></div></div>
              <div><div style={{fontSize:10,color:r.c,fontWeight:600}}>{r.label}</div>{u.unite&&<div style={{fontSize:9,color:T.muted}}>Unité {u.unite}</div>}</div>
              <div style={{fontSize:10,color:T.muted}}>{sy?sy.nom.split(" ").slice(0,2).join(" "):"—"}</div>
              <div style={{fontSize:9,color:T.muted}}>{u.lastLogin||"Jamais"}</div>
              <Tag l={u.statut==="actif"?"Actif":u.statut==="invitation"?"Invité":"Inactif"} c={u.statut==="actif"?T.accent:u.statut==="invitation"?T.blue:T.muted}/>
            </div>
          );})}
        </Card>
        {selU&&(function(){var r=ROLES[selU.role]||{};var sy=SYNDICATS.find(function(s){return s.id===selU.synd;});return(
          <Card s={{position:"sticky",top:70}}>
            <div style={{textAlign:"center",marginBottom:11,padding:"11px",background:r.bg||T.surfaceAlt,borderRadius:8}}>
              <Avatar ini={iniN(selU.prenom,selU.nom)} roleId={selU.role} size={44}/>
              <div style={{fontSize:13,fontWeight:700,color:T.text,marginTop:6}}>{selU.prenom} {selU.nom}</div>
              <div style={{fontSize:10,color:T.muted,marginBottom:4}}>{selU.courriel}</div>
              <Tag l={r.label} c={r.c}/>
            </div>
            <div style={{marginBottom:10}}>{[["Syndicat",sy?sy.nom:"—"],["Unité",selU.unite||"—"],["Statut",selU.statut],["Dernière conn.",selU.lastLogin||"Jamais"]].map(function(row,i){return <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<3?"1px solid "+T.border+"40":"none"}}><span style={{fontSize:10,color:T.muted}}>{row[0]}</span><span style={{fontSize:10,color:T.text,fontWeight:500}}>{row[1]}</span></div>;})}</div>
            <div style={{display:"flex",gap:6}}>
              <Btn s={{flex:1,fontSize:10}} bg={T.accentLight} tc={T.accent}>Modifier</Btn>
              <Btn s={{fontSize:10}} bg={T.blueLight} tc={T.blue}>Renvoyer</Btn>
              <Btn s={{fontSize:10}} bg={T.redLight} tc={T.red} onClick={function(){setUsers(function(p){return p.map(function(u){return u.id===selU.id?Object.assign({},u,{statut:"inactif"}):u;});});setSelU(null);}}>Désact.</Btn>
            </div>
          </Card>
        );}())}
      </div>

      {invites.length>0&&(
        <Card s={{marginTop:12}}>
          <SH l={"Invitations en attente ("+invites.length+")"}/>
          {invites.map(function(inv,i){
            var r=ROLES[inv.role]||{};var dl=Math.ceil((new Date(inv.expiry)-new Date())/86400000);
            var sy=SYNDICATS.find(function(s){return s.id===inv.synd;});
            return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",background:T.blueLight,borderRadius:7,marginBottom:4,border:"1px solid "+T.blue+"30"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.text}}>{inv.courriel}</div>
                  <div style={{fontSize:9,color:T.muted}}>{r.label}{sy?" · "+sy.nom.split(" ").slice(0,2).join(" "):""}{inv.unite?" · Unité "+inv.unite:""}</div>
                </div>
                <Tag l={dl>0?"Expire dans "+dl+"j":"Expirée"} c={dl<=2?T.red:T.blue}/>
                <Btn sm bg={T.blueLight} tc={T.blue} s={{border:"1px solid "+T.blue+"30"}}>Renvoyer</Btn>
              </div>
            );
          })}
        </Card>
      )}
      <Modal open={modal} onClose={function(){setModal(false);}} title="Inviter un usager" w={480}>
        <div style={{background:T.accentLight,borderRadius:7,padding:"6px 10px",marginBottom:11,fontSize:11,color:T.accent}}>Lien d'activation valide 7 jours. L'usager définit son mot de passe à la première connexion.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}><F l="Prénom"><input value={form.prenom} onChange={function(e){sf("prenom",e.target.value);}} style={inp}/></F><F l="Nom"><input value={form.nom} onChange={function(e){sf("nom",e.target.value);}} style={inp}/></F></div>
        <F l="Courriel *" s={{marginBottom:9}}><input value={form.courriel} onChange={function(e){sf("courriel",e.target.value);}} style={inp}/></F>
        <F l="Rôle *" s={{marginBottom:9}}><select value={form.role} onChange={function(e){sf("role",e.target.value);}} style={inp}><optgroup label="Predictek"><option value="predictek_super">Super Administrateur</option><option value="predictek_admin">Administrateur</option><option value="predictek_user">Utilisateur</option></optgroup><optgroup label="Syndicat"><option value="synd_president">Président du CA</option><option value="synd_tresorier">Trésorier du CA</option><option value="synd_secretaire">Secrétaire du CA</option><option value="synd_admin">Administrateur CA</option><option value="synd_gestionnaire">Gestionnaire externe</option></optgroup><optgroup label="Copropriétaire"><option value="copro">Copropriétaire</option></optgroup></select></F>
        {ROLES[form.role]&&ROLES[form.role].niv>=2&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
            <F l="Syndicat"><select value={form.synd} onChange={function(e){sf("synd",parseInt(e.target.value));}} style={inp}>{SYNDICATS.map(function(s){return <option key={s.id} value={s.id}>{s.nom}</option>;})}</select></F>
            {form.role==="copro"&&<F l="Unité"><input value={form.unite||""} onChange={function(e){sf("unite",e.target.value);}} placeholder="ex: 531" style={inp}/></F>}
          </div>
        )}
        <div style={{display:"flex",gap:8,marginTop:12}}><Btn onClick={inviter} s={{flex:1}}>Envoyer l'invitation</Btn><Btn onClick={function(){setModal(false);}} bg={T.surfaceAlt} tc={T.muted} s={{border:"1px solid "+T.border}}>Annuler</Btn></div>
      </Modal>
    </div>
  );
}

// MODULE RÔLES (compact)
function ModuleRoles(){
  var [sel,setSel]=useState("predictek_super");
  var r=ROLES[sel];
  var grps={"Predictek":["predictek_super","predictek_admin","predictek_user"],"Syndicat":["synd_president","synd_tresorier","synd_secretaire","synd_admin","synd_gestionnaire"],"Copropriétaire":["copro"]};
  var pmods=["syndicats","comptabilite","unites","documents","usagers","facturation","config","rapports","votes","demandes"];
  var plab=["Syndicats","Comptab.","Unités","Docs","Usagers","Factur.","Config.","Rapports","Votes","Demandes"];
  return(
    <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:14}}>
      <div>{Object.entries(grps).map(function(e){var gn=e[0];var ids=e[1];return <div key={gn} style={{marginBottom:10}}><SH l={gn} s={{paddingLeft:4}}/>{ids.map(function(id){var ro=ROLES[id];var s=sel===id;return <div key={id} onClick={function(){setSel(id);}} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",borderRadius:7,marginBottom:2,cursor:"pointer",background:s?ro.bg:"transparent",border:s?"1px solid "+ro.c+"30":"1px solid transparent"}}><div style={{width:7,height:7,borderRadius:"50%",background:ro.c,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:11,fontWeight:s?600:400,color:s?ro.c:T.text}}>{ro.label}</div><div style={{fontSize:9,color:T.muted}}>Niv.{ro.niv}{ro.rang?" · Rang "+ro.rang:""}</div></div></div>;})}</div>;})}</div>
      <div>
        <Card s={{borderTop:"4px solid "+r.c,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}><div style={{width:38,height:38,borderRadius:9,background:r.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{r.niv===1?"P":r.niv===2?"S":"C"}</div><div><div style={{fontSize:14,fontWeight:700,color:r.c}}>{r.label}</div><div style={{display:"flex",gap:4}}><Tag l={"Niv."+r.niv} c={r.c}/><Tag l={r.grp} c={T.muted}/>{r.rang&&<Tag l={"Rang "+r.rang} c={r.c}/>}</div></div></div>
          <div style={{fontSize:11,color:T.muted,lineHeight:1.5,padding:"7px 9px",background:r.bg,borderRadius:6}}>{r.desc}</div>
        </Card>
        <Card><SH l="Matrice des permissions"/><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>{pmods.map(function(k,i){var v=r.perms[k]||"aucun";var c={complet:T.accent,lecture:T.blue,gestion:T.accentMid,partiel:T.amber,vote:T.accentMid,admin:T.accent,propre:T.purple,configurable:T.gold,"gestion_synd":T.accentMid,synd:T.amber,aucun:T.muted}[v]||T.muted;return <div key={k} style={{background:v==="aucun"?T.surfaceAlt:c+"10",border:"1px solid "+(v==="aucun"?T.border:c+"30"),borderRadius:7,padding:"8px 5px",textAlign:"center"}}><div style={{fontSize:9,color:T.muted,marginBottom:4}}>{plab[i]}</div><PermBadge v={v}/></div>;})}</div></Card>
      </div>
    </div>
  );
}

// MODULE CONFIG (compact)
function ModuleConfig(){
  var [selSynd,setSelSynd]=useState(1);
  var [cfgs,setCfgs]=useState(CFG_INIT);
  var [saved,setSaved]=useState(false);
  var [cfgTab,setCfgTab]=useState("ca");
  var cfg=cfgs[selSynd];
  function upd(k,v){setCfgs(function(p){var n=Object.assign({},p);n[selSynd]=Object.assign({},n[selSynd]);n[selSynd][k]=v;return n;});setSaved(false);}
  function save(){setSaved(true);setTimeout(function(){setSaved(false);},2500);}
  var coproItems=[{k:"copro_solde",l:"Solde et état de compte"},{k:"copro_cotisations",l:"Cotisations"},{k:"copro_avis",l:"Avis de cotisation"},{k:"copro_releve",l:"Relevé détaillé"},{k:"copro_documents",l:"Documents"},{k:"copro_votes",l:"Votes en ligne"},{k:"copro_demandes",l:"Demandes"},{k:"copro_ce",l:"Chauffe-eau"},{k:"copro_ass",l:"Assurance"}];
  return(
    <div>
      <div style={{display:"flex",gap:7,marginBottom:12}}>{SYNDICATS.map(function(s){return <button key={s.id} onClick={function(){setSelSynd(s.id);}} style={{background:selSynd===s.id?T.accent:T.surface,border:"1px solid "+(selSynd===s.id?T.accent:T.border),borderRadius:7,padding:"6px 12px",color:selSynd===s.id?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:selSynd===s.id?600:400}}>{s.nom.split(" ").slice(0,3).join(" ")}</button>;})}</div>
      <div style={{display:"flex",gap:2,borderBottom:"1px solid "+T.border,marginBottom:16}}>
        {[{id:"ca",l:"Conseil d'administration"},{id:"usagers_synd",l:"Usagers du syndicat"},{id:"config",l:"Approbations & portail"}].map(function(t){return(
          <button key={t.id} onClick={function(){setCfgTab(t.id);}} style={{background:"none",border:"none",borderBottom:cfgTab===t.id?"2px solid "+T.accent:"2px solid transparent",color:cfgTab===t.id?T.text:T.muted,padding:"9px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:cfgTab===t.id?600:400,whiteSpace:"nowrap"}}>{t.l}</button>
        );})}</div>
      {cfgTab==="ca"&&<ModuleCA selSyndId={selSynd}/>}
      {cfgTab==="usagers_synd"&&(function(){
        var syndUsers=USERS_INIT.filter(function(u){return u.synd===selSynd;});
        var sy=SYNDICATS.find(function(s){return s.id===selSynd;})||{};
        var groupes={"Conseil d'administration":["synd_president","synd_tresorier","synd_secretaire","synd_admin","synd_gestionnaire"],"Copropriétaires":["copro"]};
        return(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:13,color:T.muted}}>{syndUsers.length} usager(s) — {sy.nom}</div>
              <Btn s={{fontSize:11}} onClick={function(){}}>+ Inviter un usager</Btn>
            </div>
            {Object.entries(groupes).map(function(e){
              var gNom=e[0];var gRoles=e[1];
              var gUsers=syndUsers.filter(function(u){return gRoles.includes(u.role);});
              if(!gUsers.length)return null;
              return(
                <div key={gNom} style={{marginBottom:16}}>
                  <SH l={gNom+" ("+gUsers.length+")"}/>
                  <div style={{border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
                    {gUsers.map(function(u,i){
                      var r=ROLES[u.role]||{};
                      return(
                        <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<gUsers.length-1?"1px solid "+T.border+"50":"none",background:i%2===0?T.surfaceAlt+"60":"transparent"}}>
                          <Avatar ini={iniN(u.prenom,u.nom)} roleId={u.role} size={32}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12,fontWeight:600,color:T.text}}>{u.prenom} {u.nom}</div>
                            <div style={{fontSize:10,color:T.muted}}>{u.courriel}{u.unite?" · Unité "+u.unite:""}</div>
                          </div>
                          <Tag l={r.label} c={r.c||T.muted}/>
                          <Tag l={u.statut==="actif"?"Actif":u.statut==="invitation"?"Invité":"Inactif"} c={u.statut==="actif"?T.accent:u.statut==="invitation"?T.blue:T.muted}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{background:T.blueLight,borderRadius:8,padding:"9px 14px",fontSize:11,color:T.blue}}>
              Pour gérer les accès Predictek (niveaux et permissions), rendez-vous dans <b>Usagers & Permissions</b>.
            </div>
          </div>
        );
      })()}
      {cfgTab==="config"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
        <Card>
          <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Approbations de factures</div>
          {[{v:"toujours_1",l:"Toujours 1 administrateur"},{v:"toujours_2",l:"Toujours 2 administrateurs"},{v:"seuil",l:"Selon le montant (seuil)"}].map(function(o,i){return <div key={i} onClick={function(){upd("mode",o.v);}} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 9px",borderRadius:6,marginBottom:4,cursor:"pointer",background:cfg.mode===o.v?T.accentLight:T.surfaceAlt,border:"1px solid "+(cfg.mode===o.v?T.accent+"30":T.border)}}><div style={{width:13,height:13,borderRadius:"50%",border:"2px solid "+(cfg.mode===o.v?T.accent:T.border),background:cfg.mode===o.v?T.accent:"transparent",flexShrink:0}}/><span style={{fontSize:11,color:T.text}}>{o.l}</span></div>;})}
          {cfg.mode==="seuil"&&<div style={{marginTop:7}}><div style={{fontSize:10,color:T.muted,marginBottom:3}}>Seuil ($)</div><input type="number" value={cfg.seuil} onChange={function(e){upd("seuil",parseInt(e.target.value)||0);}} style={inp}/></div>}
          <div style={{marginTop:10,background:T.accentLight,borderRadius:6,padding:"7px 10px",fontSize:11,color:T.accent}}>{cfg.mode==="toujours_1"?"1 admin requis pour toutes les factures":cfg.mode==="toujours_2"?"2 admins requis pour toutes les factures":"Seuil "+money(cfg.seuil)+" : 1 ou 2 admins selon le montant"}</div>
        </Card>
        <Card>
          <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Portail copropriétaire</div>
          {coproItems.map(function(item,i){return <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<coproItems.length-1?"1px solid "+T.border+"40":"none"}}><span style={{fontSize:11,color:T.text}}>{item.l}</span><div onClick={function(){upd(item.k,!cfg[item.k]);}} style={{width:34,height:18,borderRadius:18,background:cfg[item.k]?T.accent:T.border,cursor:"pointer",position:"relative",flexShrink:0}}><div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:cfg[item.k]?18:2,transition:"left .2s",boxShadow:"0 1px 3px #0003"}}/></div></div>;})}
        </Card>
        <Card s={{gridColumn:"span 2"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text}}>Résumé — Configuration active</div>
            <Btn onClick={save} bg={saved?T.accentMid:T.accent} s={{fontSize:11}}>{saved?"Sauvegardée !":"Sauvegarder"}</Btn>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {coproItems.map(function(item,i){return <Tag key={i} l={item.l.split(" ")[0]} c={cfg[item.k]?T.accent:T.muted}/>;}) }
          </div>
        </Card>
      </div>}
    </div>
  );
}

// APP
export default function Hub(){
  var [section,setSection]=useState("dashboard");
  var [tab,setTab]=useState("usagers");
  var curUser=USERS_INIT[0];
  var r=ROLES[curUser.role];
  var TABS=[{id:"usagers",l:"Gestion des usagers"},{id:"roles",l:"Rôles & Permissions"}];
  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"Georgia,serif"}}>
      <div style={{background:T.navy,padding:"0 22px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,"+T.accent+","+T.accentPop+")",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontWeight:900,fontSize:15,fontFamily:"Georgia,serif"}}>P</span></div>
          <div style={{fontSize:13,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>Predictek</div>
          <div style={{width:1,height:24,background:"#ffffff20",margin:"0 6px"}}/>
          {[{id:"dashboard",l:"Tableau de bord"},{id:"syndicats",l:"Syndicats"},{id:"usagers",l:"Usagers & Permissions"}].map(function(s){return <button key={s.id} onClick={function(){setSection(s.id);if(s.id==="usagers")setTab("ca");}} style={{background:section===s.id?"#ffffff15":"transparent",border:"none",borderBottom:section===s.id?"2px solid "+T.accentPop:"2px solid transparent",color:section===s.id?"#fff":"#8da0bb",padding:"0 12px",height:50,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:section===s.id?600:400}}>{s.l}</button>;})}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{background:r.bg,borderRadius:20,padding:"3px 10px",fontSize:9,color:r.c,fontWeight:600}}>{r.label}</div>
          <Avatar ini={iniN(curUser.prenom,curUser.nom)} roleId={curUser.role} size={28}/>
          <span style={{fontSize:10,color:"#8da0bb"}}>{curUser.prenom} {curUser.nom}</span>
        </div>
      </div>

      {section==="dashboard"&&(
        <div style={{padding:"22px 26px",maxWidth:1300,margin:"0 auto"}}>
          <h2 style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>Tableau de bord — Administration Predictek</h2>
          <p style={{color:T.muted,fontSize:12,marginBottom:20}}>Vue globale du portefeuille clients et des usagers</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
            {[{l:"Syndicats actifs",v:3,c:T.accent,sub:"3 clients"},{l:"Unités gérées",v:196,c:T.accentMid,sub:"3 syndicats"},{l:"Usagers actifs",v:USERS_INIT.filter(function(u){return u.statut==="actif";}).length,c:T.navy,sub:"Tous niveaux"},{l:"Invitations",v:INVITES_INIT.length,c:T.blue,sub:"En attente"}].map(function(k,i){return <Card key={i} s={{borderLeft:"4px solid "+k.c,padding:"12px 14px"}}><div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:4}}>{k.l}</div><div style={{fontSize:24,fontWeight:700,color:k.c}}>{k.v}</div><div style={{fontSize:9,color:T.muted,marginTop:2}}>{k.sub}</div></Card>;})}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card><SH l="Syndicats clients"/>{SYNDICATS.map(function(s,i){var pc=s.plan==="Prestige"?T.gold:s.plan==="Pro"?T.accent:T.muted;return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<2?"1px solid "+T.border:"none"}}><div style={{width:34,height:34,borderRadius:8,background:s.pilote?T.goldLight:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>S</div><div style={{flex:1}}><div style={{display:"flex",gap:5,alignItems:"center"}}><span style={{fontSize:12,fontWeight:600,color:T.text}}>{s.nom}</span>{s.pilote&&<Tag l="Pilote" c={T.gold}/>}</div><div style={{fontSize:10,color:T.muted}}>{s.unites} unités · {s.ville}</div></div><Tag l={s.plan} c={pc}/><div style={{width:7,height:7,borderRadius:"50%",background:T.accentPop}}/></div>;})}</Card>
            <Card>
              <SH l="CA & Mandats — Alertes"/>
              {(function(){
                var al=[];
                Object.entries(MANDATS_INIT).forEach(function(e){
                  var sid=parseInt(e[0]);var ms=e[1];var sy=SYNDICATS.find(function(s){return s.id===sid;});var sn=sy?sy.nom.split(" ").slice(0,2).join(" "):"?";
                  POSTES_CA.slice(0,2).forEach(function(p){if(!ms.find(function(m){return m.actif&&m.rang===p.rang;}))al.push({c:T.red,txt:sn+" — "+p.titre+": Poste vacant"});});
                  ms.filter(function(m){return m.actif&&m.fin;}).forEach(function(m){var j=daysUntil(m.fin);var po=(POSTES_CA.find(function(p){return p.rang===m.rang;})||{titre:"Admin"}).titre;if(j<0)al.push({c:T.red,txt:sn+" — "+m.prenom+" "+m.nom+" ("+po+"): Mandat expiré"});else if(j<=60)al.push({c:T.amber,txt:sn+" — "+m.prenom+" "+m.nom+" ("+po+"): Expire dans "+j+"j"});});
                });
                if(!al.length)return <div style={{fontSize:11,color:T.muted,textAlign:"center",padding:"10px"}}>Tous les mandats sont en ordre.</div>;
                return al.map(function(a,i){return <div key={i} style={{display:"flex",gap:7,padding:"6px 9px",background:a.c+"10",borderRadius:6,marginBottom:4,border:"1px solid "+a.c+"20"}}><div style={{width:6,height:6,borderRadius:"50%",background:a.c,flexShrink:0,marginTop:4}}/><div style={{fontSize:10,color:T.text}}>{a.txt}</div></div>;});
              })()}
              <button onClick={function(){setSection("syndicats");}} style={{width:"100%",background:T.accentLight,border:"none",borderRadius:6,padding:"7px",color:T.accent,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:10}}>Gérer le CA →</button>
            </Card>
          </div>
        </div>
      )}

      {section==="usagers"&&(
        <div>
          <div style={{background:T.surface,borderBottom:"1px solid "+T.border,padding:"0 22px",display:"flex",gap:2}}>
            {TABS.map(function(t){return <button key={t.id} onClick={function(){setTab(t.id);}} style={{background:"none",border:"none",borderBottom:tab===t.id?"2px solid "+T.accent:"2px solid transparent",color:tab===t.id?T.text:T.muted,padding:"11px 15px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:tab===t.id?600:400,whiteSpace:"nowrap"}}>{t.l}</button>;}) }
          </div>
          <div style={{padding:"22px 26px",maxWidth:1300,margin:"0 auto"}}>

            {tab==="usagers"&&<div><h2 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>Gestion des usagers</h2><p style={{color:T.muted,fontSize:12,marginBottom:18}}>Inviter, configurer et gérer les accès à Predictek</p><ModuleUsagers/></div>}
            {tab==="roles"&&<div><h2 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>Rôles & Permissions</h2><p style={{color:T.muted,fontSize:12,marginBottom:18}}>Architecture complète — 3 niveaux, 9 rôles, 10 modules</p><ModuleRoles/></div>}

          </div>
        </div>
      )}

      {section==="syndicats"&&(
        <div>
          <div style={{background:T.surface,borderBottom:"1px solid "+T.border,padding:"0 22px",display:"flex",gap:2}}>
            <button style={{background:"none",border:"none",borderBottom:"2px solid "+T.accent,color:T.text,padding:"11px 15px",fontSize:12,fontFamily:"inherit",fontWeight:600}}>Configuration des syndicats</button>
          </div>
          <div style={{padding:"22px 26px",maxWidth:1300,margin:"0 auto"}}>
            <h2 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>Configuration des syndicats</h2>
            <p style={{color:T.muted,fontSize:12,marginBottom:18}}>Conseil d'administration, approbations de factures et portail copropriétaire par syndicat</p>
            <ModuleConfig/>
          </div>
        </div>
      )}
    </div>
  );
}
