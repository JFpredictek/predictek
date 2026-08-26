// GESTION DOCUMENTAIRE v3 - ARBORESCENCE DE DOSSIERS (comme l explorateur Windows)
// - Dossiers et sous-dossiers par syndicat: ajout, renommage, retrait
// - NIVEAU D ACCES PAR DOSSIER: CA (oui/non) + Coproprietaires (non / portail / sur demande)
//   Le gestionnaire (producteur) voit toujours tout; un utilisateur CA ne voit pas les
//   dossiers reserves au gestionnaire; le portail copro ne montre que les dossiers "portail"
//   et propose une demande de consultation pour les dossiers "sur demande".
// - Les TYPES de documents se gerent dans Configuration du syndicat (onglet Types de documents)
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

// Anciens types (compatibilite avec les documents deja classes)
var TYPES_LEGACY={pv:"Proces-verbal",budget:"Budget",contrat:"Contrat fournisseur",assurance:"Assurance",carnet:"Carnet entretien Loi 16",declaration:"Declaration de copropriete",regl:"Reglement immeuble",plan:"Plan et certificat",avis:"Avis / Correspondance",autre:"Autre"};

// Dossiers modeles (bases sur la pratique reelle des syndicats; chaque syndicat peut differer)
var DOSSIERS_MODELES=[
  {nom:"Acte de copropriete",ca:true,copro:"portail"},
  {nom:"Assemblees generales",ca:true,copro:"portail"},
  {nom:"Assurance",ca:true,copro:"portail"},
  {nom:"Assurance - reclamations",ca:true,copro:"non"},
  {nom:"Avis d infraction",ca:true,copro:"non"},
  {nom:"Avis de non-conformite",ca:true,copro:"non"},
  {nom:"Budget",ca:true,copro:"portail"},
  {nom:"Certificats de localisation",ca:true,copro:"non"},
  {nom:"Communications",ca:true,copro:"non"},
  {nom:"Comptabilite",ca:true,copro:"non"},
  {nom:"Declaration de copropriete et reglements",ca:true,copro:"portail"},
  {nom:"Divers",ca:true,copro:"non"},
  {nom:"Entretien",ca:true,copro:"portail"},
  {nom:"Etats financiers",ca:true,copro:"portail"},
  {nom:"Expertises",ca:true,copro:"portail"},
  {nom:"Factures, contrats et soumissions",ca:true,copro:"demande"},
  {nom:"Formulaires et procedures",ca:true,copro:"portail"},
  {nom:"Location",ca:true,copro:"non"},
  {nom:"Logo",ca:true,copro:"non"},
  {nom:"Photos de la copropriete",ca:true,copro:"non"},
  {nom:"Plans, cadastres et certificats",ca:true,copro:"non"},
  {nom:"Proces-verbaux",ca:true,copro:"portail"},
  {nom:"REQ",ca:true,copro:"non"},
  {nom:"Resolutions",ca:true,copro:"portail"},
  {nom:"Vente d unites",ca:true,copro:"non"},
];

function BadgeAcces(p){
  var d=p.d;
  return(
    <span style={{display:"inline-flex",gap:3}}>
      {d.acces_ca!==false&&<span style={{background:T.blueL,color:T.blue,borderRadius:8,padding:"0 5px",fontSize:8,fontWeight:800}}>CA</span>}
      {d.acces_copro==="portail"&&<span style={{background:T.accentL,color:T.accent,borderRadius:8,padding:"0 5px",fontSize:8,fontWeight:800}}>COPRO</span>}
      {d.acces_copro==="demande"&&<span style={{background:T.amberL,color:T.amber,borderRadius:8,padding:"0 5px",fontSize:8,fontWeight:800}}>SUR DEMANDE</span>}
      {d.acces_ca===false&&<span style={{background:T.purpleL,color:T.purple,borderRadius:8,padding:"0 5px",fontSize:8,fontWeight:800}}>GEST.</span>}
    </span>
  );
}

function DocCard(p){
  var d=p.doc;var types=p.types||[];
  var ty=types.find(function(t){return t.id===d.type_id;});
  var lblType=ty?ty.nom:(TYPES_LEGACY[d.type_doc]||d.type_doc||"");
  return(
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:T.surface,border:"1px solid "+T.border,borderRadius:10,marginBottom:8}}>
      <div style={{width:36,height:36,borderRadius:8,background:T.alt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:15,fontWeight:800,color:T.muted}}>{d.nom&&d.nom.toLowerCase().endsWith(".pdf")?"P":d.nom&&/\.(xlsx|xls|csv)$/i.test(d.nom||"")?"X":/\.(jpg|jpeg|png)$/i.test(d.nom||"")?"I":"D"}</span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.nom}</div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {lblType&&<span style={{background:T.alt,color:T.muted,borderRadius:20,padding:"1px 9px",fontSize:10,fontWeight:700}}>{lblType}</span>}
          {d.date_doc&&<span style={{fontSize:11,color:T.muted}}>{d.date_doc}</span>}
          {d.taille_kb?<span style={{fontSize:11,color:T.muted}}>{d.taille_kb} KB</span>:null}
          {d.confidentiel&&<span style={{fontSize:10,color:T.red,fontWeight:700}}>CONFIDENTIEL</span>}
          {d.coproprietaire_id&&<span style={{fontSize:10,color:T.purple,fontWeight:700}}>PERSONNEL (portail d un copro)</span>}
        </div>
        {d.description&&<div style={{fontSize:11,color:T.muted,marginTop:3}}>{d.description}</div>}
      </div>
      <div style={{display:"flex",gap:6,flexShrink:0,alignItems:"center"}}>
        <select value="" onChange={function(e){if(e.target.value)p.onDeplacer(d,e.target.value);}} title="Deplacer vers un autre dossier" style={{border:"1px solid "+T.border,borderRadius:7,padding:"5px 6px",fontSize:10,fontFamily:"inherit",background:"#FFF",maxWidth:120}}>
          <option value="">Deplacer...</option>
          {p.dossiersPlats.map(function(x){return <option key={x.d.id} value={x.d.id}>{Array(x.prof+1).join("-- ")+x.d.nom}</option>;})}
          <option value="__racine__">(Non classes)</option>
        </select>
        {d.url&&<Btn sm bg={T.blue} onClick={function(){p.onOuvrir(d);}}>Ouvrir</Btn>}
        <Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){p.onRetirer(d.id);}}>X</Btn>
      </div>
    </div>
  );
}

export default function GestionDocuments(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var dossiers=s2[0];var setDossiers=s2[1];
  var s3=useState([]);var docs=s3[0];var setDocs=s3[1];
  var s4=useState([]);var types=s4[0];var setTypes=s4[1];
  var s5=useState(null);var dossierSel=s5[0];var setDossierSel=s5[1];   // id du dossier ouvert (null = Non classes)
  var s6=useState({});var replies=s6[0];var setReplies=s6[1];           // id dossier -> replie true/false
  var s7=useState("");var err=s7[0];var setErr=s7[1];
  var s8=useState("");var msg=s8[0];var setMsg=s8[1];
  var s9=useState(false);var showDoc=s9[0];var setShowDoc=s9[1];
  var s10=useState({nom:"",type_id:"",description:"",date_doc:"",confidentiel:false});var nf=s10[0];var setNf=s10[1];
  var s11=useState("");var filtre=s11[0];var setFiltre=s11[1];
  var s12=useState(null);var editDossier=s12[0];var setEditDossier=s12[1]; // {id?,parent_id,nom,acces_ca,acces_copro}
  var s13=useState(false);var busy=s13[0];var setBusy=s13[1];

  var USER={};try{USER=JSON.parse(localStorage.getItem("predictek_user")||"{}")||{};}catch(e){}
  var roleCA=(USER.role||"")==="ca";

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  function charger(){
    if(!sel)return;
    sb.select("dossiers_documents",{eq:{syndicat_id:sel.id},order:"nom.asc",limit:500}).then(function(r){
      if(r&&r.error){setErr("Chargement des dossiers impossible: "+(r.error.message||"executez le bloc SQL fourni (dossiers_documents)."));setDossiers([]);return;}
      setDossiers((r&&r.data?r.data:[]).filter(function(d){return d.statut!=="retire";}));
    }).catch(function(){setDossiers([]);});
    sb.select("documents",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:2000}).then(function(r){
      if(r&&r.data)setDocs(r.data.filter(function(d){return d.statut!=="supprime";}));
    }).catch(function(){});
    sb.select("types_documents",{eq:{syndicat_id:sel.id},order:"nom.asc",limit:200}).then(function(r){
      setTypes((r&&r.data?r.data:[]).filter(function(t){return t.statut!=="retire";}));
    }).catch(function(){setTypes([]);});
  }
  useEffect(function(){charger();setDossierSel(null);},[sel&&sel.id]);

  // Arborescence a plat (dossier + profondeur), enfants sous leur parent
  function aplatir(){
    var out=[];
    var parId={};dossiers.forEach(function(d){var p=d.parent_id||"";if(!parId[p])parId[p]=[];parId[p].push(d);});
    function walk(pid,prof){
      (parId[pid]||[]).forEach(function(d){
        if(roleCA&&d.acces_ca===false)return; // un membre CA ne voit pas les dossiers reserves au gestionnaire
        out.push({d:d,prof:prof});
        if(!replies[d.id])walk(d.id,prof+1);
      });
    }
    walk("",0);
    return out;
  }
  function aplatirTous(){ // pour les selects Deplacer / parent (sans tenir compte du repli)
    var out=[];var parId={};dossiers.forEach(function(d){var p=d.parent_id||"";if(!parId[p])parId[p]=[];parId[p].push(d);});
    function walk(pid,prof){(parId[pid]||[]).forEach(function(d){out.push({d:d,prof:prof});walk(d.id,prof+1);});}
    walk("",0);return out;
  }
  function aEnfants(id){return dossiers.some(function(d){return d.parent_id===id;});}
  function nbDocs(id){return docs.filter(function(x){return (x.dossier_id||null)===(id||null)&&!x.coproprietaire_id;}).length;}

  // ===== DOSSIERS =====
  function sauverDossier(){
    if(!editDossier||!editDossier.nom){setErr("ECHEC: le nom du dossier est obligatoire.");return;}
    var row={syndicat_id:sel.id,parent_id:editDossier.parent_id||null,nom:editDossier.nom,acces_ca:editDossier.acces_ca!==false,acces_copro:editDossier.acces_copro||"non",statut:"actif"};
    var op=editDossier.id?sb.update("dossiers_documents",editDossier.id,row):sb.insert("dossiers_documents",row);
    op.then(function(res){
      if(res&&res.error){setErr("ECHEC de la sauvegarde du dossier: "+(res.error.message||""));return;}
      setEditDossier(null);setMsg("Dossier sauvegarde.");charger();
    }).catch(function(e){setErr("ECHEC: "+((e&&e.message)||""));});
  }
  function retirerDossier(d){
    if(nbDocs(d.id)>0||aEnfants(d.id)){setErr("ECHEC: le dossier \""+d.nom+"\" n est pas vide (documents ou sous-dossiers). Deplacez son contenu d abord.");return;}
    sb.update("dossiers_documents",d.id,{statut:"retire"}).then(function(res){
      if(res&&res.error){setErr("ECHEC du retrait: "+(res.error.message||""));return;}
      if(dossierSel===d.id)setDossierSel(null);
      setMsg("Dossier retire.");charger();
    }).catch(function(e){setErr("ECHEC: "+((e&&e.message)||""));});
  }
  function creerModeles(){
    setBusy(true);setErr("");
    var chaine=Promise.resolve();
    DOSSIERS_MODELES.forEach(function(m){
      chaine=chaine.then(function(){return sb.insert("dossiers_documents",{syndicat_id:sel.id,parent_id:null,nom:m.nom,acces_ca:m.ca,acces_copro:m.copro,statut:"actif"});});
    });
    chaine.then(function(){setBusy(false);setMsg("Dossiers modeles crees - ajustez les noms et les acces selon VOTRE syndicat.");charger();})
      .catch(function(e){setBusy(false);setErr("ECHEC de la creation des dossiers modeles: "+((e&&e.message)||""));});
  }

  // ===== DOCUMENTS =====
  function handleFile(e){
    var file=e.target.files[0];
    if(!file)return;
    setNf(function(pr){return Object.assign({},pr,{nom:file.name,taille_kb:Math.round(file.size/1024),_fichier:file});});
  }
  function ajouterDoc(){
    if(!nf.nom){setErr("ECHEC: choisissez un fichier.");return;}
    setBusy(true);setErr("");
    var ty=types.find(function(t){return t.id===nf.type_id;});
    var row={niveau:"syndicat",syndicat_id:sel.id,dossier_id:dossierSel||null,nom:nf.nom,type_id:nf.type_id||null,type_doc:ty?ty.nom:"autre",description:nf.description,date_doc:nf.date_doc||null,confidentiel:nf.confidentiel,url:"",taille_kb:nf.taille_kb||0,statut:"actif"};
    var envoi=Promise.resolve(row);
    if(nf._fichier){
      var ext=(nf._fichier.name.split(".").pop()||"pdf").toLowerCase().replace(/[^a-z0-9]/g,"");
      var chemin=sel.id+"/documents/"+Date.now()+"."+ext;
      envoi=sb.uploadFichier("preuves",chemin,nf._fichier).then(function(up){
        if(up&&up.chemin){row.url="storage:"+up.chemin;return row;}
        throw new Error("Televersement echoue: "+((up&&up.error&&up.error.message)||""));
      });
    }
    envoi.then(function(r2){return sb.insert("documents",r2);}).then(function(res){
      if(res&&res.error){
        // repli si la colonne type_id n existe pas encore
        if(String(res.error.message||"").indexOf("type_id")>=0){
          var r3=Object.assign({},row);delete r3.type_id;
          return sb.insert("documents",r3);
        }
        throw new Error(res.error.message||"insertion refusee");
      }
      return res;
    }).then(function(res){
      if(res&&res.error)throw new Error(res.error.message||"insertion refusee");
      setBusy(false);setShowDoc(false);setNf({nom:"",type_id:"",description:"",date_doc:"",confidentiel:false});
      setMsg("Document ajoute.");charger();
      sb.log("documents","ajout","Document ajoute: "+row.nom,"","");
    }).catch(function(e){setBusy(false);setErr("ECHEC de l ajout du document: "+((e&&e.message)||""));});
  }
  function ouvrirDoc(d){
    if(!d.url)return;
    if(d.url.indexOf("storage:")===0){
      sb.lienFichier("preuves",d.url.substring(8)).then(function(u){
        if(u)window.open(u,"_blank");
        else setErr("ECHEC: impossible de generer le lien du document.");
      });
    }else{window.open(d.url,"_blank");}
  }
  function retirerDoc(id){
    sb.update("documents",id,{statut:"supprime"}).then(function(res){
      if(res&&res.error){setErr("ECHEC du retrait: "+(res.error.message||""));return;}
      setDocs(function(prev){return prev.filter(function(d){return d.id!==id;});});
    }).catch(function(e){setErr("ECHEC: "+((e&&e.message)||""));});
  }
  function deplacerDoc(d,cible){
    var val=cible==="__racine__"?null:cible;
    sb.update("documents",d.id,{dossier_id:val}).then(function(res){
      if(res&&res.error){setErr("ECHEC du deplacement: "+(res.error.message||""));return;}
      setMsg("Document deplace.");charger();
    }).catch(function(e){setErr("ECHEC: "+((e&&e.message)||""));});
  }

  var arbre=aplatir();
  var arbreTous=aplatirTous();
  var dossierOuvert=dossiers.find(function(d){return d.id===dossierSel;})||null;
  var docsVisibles=docs.filter(function(d){
    if((d.dossier_id||null)!==(dossierSel||null))return false;
    if(filtre&&!(d.nom||"").toLowerCase().includes(filtre.toLowerCase())&&!((d.description||"").toLowerCase().includes(filtre.toLowerCase())))return false;
    return true;
  });

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Documents</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{fontSize:10,color:"#ffffffAA"}}>L acces se regle PAR DOSSIER - les types de documents se gerent dans Configuration du syndicat</div>
      </div>

      {err&&<div style={{margin:"12px 20px 0",background:T.redL,border:"1px solid "+T.red+"55",color:T.red,borderRadius:10,padding:"10px 14px",fontSize:12,fontWeight:700}}>{err} <span onClick={function(){setErr("");}} style={{cursor:"pointer",textDecoration:"underline",marginLeft:8}}>fermer</span></div>}
      {msg&&<div style={{margin:"12px 20px 0",background:T.accentL,border:"1px solid "+T.accent+"55",color:T.accent,borderRadius:10,padding:"10px 14px",fontSize:12,fontWeight:700}}>{msg} <span onClick={function(){setMsg("");}} style={{cursor:"pointer",textDecoration:"underline",marginLeft:8}}>fermer</span></div>}

      <div style={{display:"grid",gridTemplateColumns:"300px 1fr",minHeight:"calc(100vh - 52px)"}}>
        {/* ===== ARBORESCENCE ===== */}
        <div style={{background:T.surface,borderRight:"1px solid "+T.border,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700}}>Dossiers</div>
            {!roleCA&&<Btn sm onClick={function(){setEditDossier({parent_id:dossierSel||null,nom:"",acces_ca:true,acces_copro:"non"});}}>+ Dossier</Btn>}
          </div>

          {dossiers.length===0&&!roleCA&&(
            <div style={{background:T.blueL,borderRadius:10,padding:12,marginBottom:10}}>
              <div style={{fontSize:11,color:T.navy,marginBottom:8}}>Aucun dossier pour ce syndicat. Creez votre propre structure avec "+ Dossier", ou partez des dossiers modeles (modifiables).</div>
              <Btn sm dis={busy} onClick={creerModeles}>{busy?"Creation...":"Creer les dossiers modeles"}</Btn>
            </div>
          )}

          <div onClick={function(){setDossierSel(null);}} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 8px",borderRadius:8,cursor:"pointer",background:dossierSel===null?T.accentL:"transparent",marginBottom:2}}>
            <span style={{fontSize:12,fontWeight:dossierSel===null?800:600,color:dossierSel===null?T.accent:T.navy}}>(Non classes)</span>
            <span style={{fontSize:10,color:T.muted}}>{nbDocs(null)}</span>
          </div>

          {arbre.map(function(x){
            var d=x.d;var a=dossierSel===d.id;var enf=aEnfants(d.id);
            return(
              <div key={d.id} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 8px",paddingLeft:8+x.prof*16,borderRadius:8,cursor:"pointer",background:a?T.accentL:"transparent",marginBottom:2}} onClick={function(){setDossierSel(d.id);}}>
                <span onClick={function(e){e.stopPropagation();if(enf)setReplies(function(pr){var n=Object.assign({},pr);n[d.id]=!n[d.id];return n;});}} style={{width:12,fontSize:9,color:T.muted,flexShrink:0}}>{enf?(replies[d.id]?">":"v"):""}</span>
                <span style={{fontSize:13,flexShrink:0,color:T.amber}}>[D]</span>
                <span style={{flex:1,minWidth:0,fontSize:12,fontWeight:a?800:600,color:a?T.accent:T.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.nom}</span>
                <span style={{fontSize:10,color:T.muted,flexShrink:0}}>{nbDocs(d.id)}</span>
                <BadgeAcces d={d}/>
              </div>
            );
          })}
        </div>

        {/* ===== CONTENU DU DOSSIER ===== */}
        <div style={{padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:T.navy}}>{dossierOuvert?dossierOuvert.nom:"(Non classes)"}</div>
              <div style={{fontSize:11,color:T.muted}}>
                {docsVisibles.length} document(s)
                {dossierOuvert&&<span> - Acces: {dossierOuvert.acces_ca!==false?"CA":"gestionnaire seulement"}{dossierOuvert.acces_copro==="portail"?" + coproprietaires (portail)":dossierOuvert.acces_copro==="demande"?" + coproprietaires SUR DEMANDE":""}</span>}
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {dossierOuvert&&!roleCA&&<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){setEditDossier({id:dossierOuvert.id,parent_id:dossierOuvert.parent_id||null,nom:dossierOuvert.nom,acces_ca:dossierOuvert.acces_ca!==false,acces_copro:dossierOuvert.acces_copro||"non"});}}>Modifier / acces</Btn>}
              {dossierOuvert&&!roleCA&&<Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){retirerDossier(dossierOuvert);}}>Retirer le dossier</Btn>}
              <Btn onClick={function(){setShowDoc(true);}}>+ Ajouter un document</Btn>
            </div>
          </div>

          <input value={filtre} onChange={function(e){setFiltre(e.target.value);}} placeholder="Rechercher dans ce dossier..." style={Object.assign({},INP,{maxWidth:320,marginBottom:14})}/>

          {/* ----- formulaire dossier ----- */}
          {editDossier&&(
            <div style={{background:T.surface,border:"2px solid "+T.blue+"44",borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:800,color:T.blue,marginBottom:10}}>{editDossier.id?"Modifier le dossier":"Nouveau dossier"}</div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
                <div><Lbl l="Nom du dossier"/><input value={editDossier.nom} onChange={function(e){var v=e.target.value;setEditDossier(function(pr){return Object.assign({},pr,{nom:v});});}} style={INP}/></div>
                <div><Lbl l="Dossier parent"/>
                  <select value={editDossier.parent_id||""} onChange={function(e){var v=e.target.value||null;setEditDossier(function(pr){return Object.assign({},pr,{parent_id:v});});}} style={INP}>
                    <option value="">(Racine)</option>
                    {arbreTous.filter(function(x){return x.d.id!==editDossier.id;}).map(function(x){return <option key={x.d.id} value={x.d.id}>{Array(x.prof+1).join("-- ")+x.d.nom}</option>;})}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:T.navy,cursor:"pointer"}}>
                  <input type="checkbox" checked={editDossier.acces_ca!==false} onChange={function(e){var v=e.target.checked;setEditDossier(function(pr){return Object.assign({},pr,{acces_ca:v});});}}/>
                  Accessible aux membres du CA
                </label>
                <div>
                  <Lbl l="Acces des coproprietaires"/>
                  <select value={editDossier.acces_copro||"non"} onChange={function(e){var v=e.target.value;setEditDossier(function(pr){return Object.assign({},pr,{acces_copro:v});});}} style={INP}>
                    <option value="non">Aucun acces</option>
                    <option value="portail">Visible au portail coproprietaire</option>
                    <option value="demande">Consultation SUR DEMANDE (le copro fait une requete)</option>
                  </select>
                </div>
              </div>
              <div style={{fontSize:10,color:T.muted,marginBottom:10}}>Le gestionnaire voit toujours tous les dossiers. Un document peut etre accessible a la fois au CA et aux coproprietaires.</div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={sauverDossier}>Sauvegarder</Btn>
                <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setEditDossier(null);}}>Annuler</Btn>
              </div>
            </div>
          )}

          {/* ----- formulaire document ----- */}
          {showDoc&&(
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:10}}>Nouveau document dans "{dossierOuvert?dossierOuvert.nom:"(Non classes)"}"</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div style={{gridColumn:"1/-1"}}>
                  <Lbl l="Fichier"/>
                  <input type="file" id="fileUpDoc" onChange={handleFile} style={{display:"none"}} accept=".pdf,.PDF,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png"/>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <Btn onClick={function(){document.getElementById("fileUpDoc").click();}}>{nf.nom?"Changer":"Choisir un fichier"}</Btn>
                    {nf.nom&&<span style={{fontSize:11,color:T.muted}}>{nf.nom}</span>}
                  </div>
                </div>
                <div>
                  <Lbl l="Type de document"/>
                  <select value={nf.type_id} onChange={function(e){var v=e.target.value;setNf(function(pr){return Object.assign({},pr,{type_id:v});});}} style={INP}>
                    <option value="">Choisir...</option>
                    {types.map(function(t){return <option key={t.id} value={t.id}>{t.nom}</option>;})}
                  </select>
                  {types.length===0&&<div style={{fontSize:9,color:T.muted,marginTop:3}}>Les types se creent dans Configuration du syndicat - Types de documents.</div>}
                </div>
                <div><Lbl l="Date du document"/><input type="date" value={nf.date_doc} onChange={function(e){var v=e.target.value;setNf(function(pr){return Object.assign({},pr,{date_doc:v});});}} style={INP}/></div>
                <div style={{gridColumn:"1/-1"}}><Lbl l="Description (optionnel)"/><input value={nf.description} onChange={function(e){var v=e.target.value;setNf(function(pr){return Object.assign({},pr,{description:v});});}} style={INP}/></div>
                <label style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8,fontSize:12,color:T.red,fontWeight:600,cursor:"pointer"}}>
                  <input type="checkbox" checked={nf.confidentiel} onChange={function(e){var v=e.target.checked;setNf(function(pr){return Object.assign({},pr,{confidentiel:v});});}}/>
                  Document confidentiel (jamais montre aux coproprietaires, meme dans un dossier partage)
                </label>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={ajouterDoc} dis={!nf.nom||busy}>{busy?"Ajout...":"Ajouter"}</Btn>
                <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowDoc(false);}}>Annuler</Btn>
              </div>
            </div>
          )}

          {docsVisibles.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12,background:T.surface,border:"1px solid "+T.border,borderRadius:10}}>Aucun document dans ce dossier{filtre?" pour cette recherche":""}.</div>}
          {docsVisibles.map(function(d){return <DocCard key={d.id} doc={d} types={types} dossiersPlats={arbreTous} onOuvrir={ouvrirDoc} onRetirer={retirerDoc} onDeplacer={deplacerDoc}/>;})}
        </div>
      </div>
    </div>
  );
}
