
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var CATEGORIES=["Entretien","Plomberie","Electricite","Chauffage","Nettoyage","Paysagement","Deneigement","Securite","Ascenseur","Assurance","Services professionnels","Informatique","Autre"];

var VIDE={nom:"",categorie:"Entretien",telephone:"",courriel:"",adresse:"",site_web:"",notes:""};

function CarteFournisseur(p){
  var f=p.fournisseur;
  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
            <div style={{width:36,height:36,borderRadius:8,background:T.accentL,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:14,fontWeight:800,color:T.accent}}>{f.nom.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{f.nom}</div>
              <span style={{background:T.blueL,color:T.blue,borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:600}}>{f.categorie}</span>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,fontSize:11,color:T.muted,paddingLeft:46}}>
            {f.telephone&&<div>Tel: <span style={{color:T.navy}}>{f.telephone}</span></div>}
            {f.courriel&&<div>Courriel: <span style={{color:T.navy}}>{f.courriel}</span></div>}
            {f.adresse&&<div style={{gridColumn:"1/-1"}}>Adresse: <span style={{color:T.navy}}>{f.adresse}</span></div>}
            {f.site_web&&<div style={{gridColumn:"1/-1"}}>Web: <a href={f.site_web} target="_blank" rel="noreferrer" style={{color:T.blue}}>{f.site_web}</a></div>}
            {f.notes&&<div style={{gridColumn:"1/-1",color:T.muted,fontStyle:"italic"}}>{f.notes}</div>}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:12}}>
          <Btn sm onClick={function(){p.onEdit(f);}}>Modifier</Btn>
          <Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){p.onToggle(f.id,!f.actif);}}>
            {f.actif?"Archiver":"Reactiver"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default function FournisseursAdmin(){
  var s0=useState([]);var fournisseurs=s0[0];var setFournisseurs=s0[1];
  var s1=useState(false);var showForm=s1[0];var setShowForm=s1[1];
  var s2=useState(VIDE);var nf=s2[0];var setNf=s2[1];
  var s3=useState(null);var editId=s3[0];var setEditId=s3[1];
  var s4=useState("");var recherche=s4[0];var setRecherche=s4[1];
  var s5=useState("tout");var catFiltre=s5[0];var setCatFiltre=s5[1];
  var s6=useState(false);var showArchives=s6[0];var setShowArchives=s6[1];
  var s7=useState(false);var saving=s7[0];var setSaving=s7[1];

  useEffect(function(){
    sb.select("fournisseurs",{order:"nom.asc"}).then(function(res){
      if(res&&res.data)setFournisseurs(res.data);
    }).catch(function(){});
  },[]);

  function setN(k,v){setNf(function(pr){
    if(k==="nom")return Object.assign({},pr,{nom:v});
    if(k==="categorie")return Object.assign({},pr,{categorie:v});
    if(k==="telephone")return Object.assign({},pr,{telephone:v});
    if(k==="courriel")return Object.assign({},pr,{courriel:v});
    if(k==="adresse")return Object.assign({},pr,{adresse:v});
    if(k==="site_web")return Object.assign({},pr,{site_web:v});
    if(k==="notes")return Object.assign({},pr,{notes:v});
    return pr;
  });}

  function sauvegarder(){
    if(!nf.nom)return;
    setSaving(true);
    var row={nom:nf.nom,categorie:nf.categorie||"Autre",telephone:nf.telephone||"",courriel:nf.courriel||"",adresse:nf.adresse||"",site_web:nf.site_web||"",notes:nf.notes||"",actif:true};
    var op=editId?sb.update("fournisseurs",editId,row):sb.insert("fournisseurs",row);
    op.then(function(res){
      if(editId){
        setFournisseurs(function(prev){return prev.map(function(f){return f.id===editId?Object.assign({},f,row):f;});});
      }else if(res&&res.data){
        setFournisseurs(function(prev){return [res.data].concat(prev);});
      }
      setShowForm(false);setNf(VIDE);setEditId(null);setSaving(false);
    }).catch(function(){setSaving(false);});
  }

  function editer(f){
    setNf({nom:f.nom||"",categorie:f.categorie||"Entretien",telephone:f.telephone||"",courriel:f.courriel||"",adresse:f.adresse||"",site_web:f.site_web||"",notes:f.notes||""});
    setEditId(f.id);setShowForm(true);
  }

  function toggleActif(id,actif){
    sb.update("fournisseurs",id,{actif:actif}).then(function(){
      setFournisseurs(function(prev){return prev.map(function(f){return f.id===id?Object.assign({},f,{actif:actif}):f;});});
    }).catch(function(){});
  }

  var actifs=fournisseurs.filter(function(f){return f.actif;});
  var archives=fournisseurs.filter(function(f){return !f.actif;});

  var filtres=actifs.filter(function(f){
    var matchCat=catFiltre==="tout"||f.categorie===catFiltre;
    var matchText=!recherche||f.nom.toLowerCase().includes(recherche.toLowerCase())||(f.notes&&f.notes.toLowerCase().includes(recherche.toLowerCase()));
    return matchCat&&matchText;
  });

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Repertoire fournisseurs</div>
        <Btn onClick={function(){setNf(VIDE);setEditId(null);setShowForm(true);}}>+ Ajouter fournisseur</Btn>
      </div>

      <div style={{padding:20}}>
        <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
          <input value={recherche} onChange={function(e){setRecherche(e.target.value);}} placeholder="Rechercher..." style={Object.assign({},INP,{flex:1,minWidth:160})}/>
          <select value={catFiltre} onChange={function(e){setCatFiltre(e.target.value);}} style={Object.assign({},INP,{width:180})}>
            <option value="tout">Toutes categories</option>
            {CATEGORIES.map(function(c){return <option key={c}>{c}</option>;})}
          </select>
        </div>

        {showForm&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>{editId?"Modifier le fournisseur":"Nouveau fournisseur"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Nom du fournisseur"/><input value={nf.nom} onChange={function(e){setN("nom",e.target.value);}} style={INP} placeholder="Nom de l entreprise..."/></div>
              <div><Lbl l="Categorie"/><select value={nf.categorie} onChange={function(e){setN("categorie",e.target.value);}} style={INP}>{CATEGORIES.map(function(c){return <option key={c}>{c}</option>;})}</select></div>
              <div><Lbl l="Telephone"/><input value={nf.telephone} onChange={function(e){setN("telephone",e.target.value);}} style={INP} placeholder="418-555-0000"/></div>
              <div><Lbl l="Courriel"/><input type="email" value={nf.courriel} onChange={function(e){setN("courriel",e.target.value);}} style={INP} placeholder="info@fournisseur.ca"/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Adresse"/><input value={nf.adresse} onChange={function(e){setN("adresse",e.target.value);}} style={INP} placeholder="123 rue Principale, Quebec QC"/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Site web"/><input value={nf.site_web} onChange={function(e){setN("site_web",e.target.value);}} style={INP} placeholder="https://www.fournisseur.ca"/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Notes internes"/><textarea value={nf.notes} onChange={function(e){setN("notes",e.target.value);}} style={Object.assign({},INP,{minHeight:60,resize:"vertical"})} placeholder="Specialites, tarifs, contacts preferes..."/></div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={sauvegarder} dis={saving||!nf.nom}>{saving?"Sauvegarde...":"Sauvegarder"}</Btn>
              <Btn onClick={function(){setShowForm(false);setEditId(null);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}

        <div style={{fontSize:12,color:T.muted,marginBottom:12}}>{filtres.length} fournisseur(s) actif(s){catFiltre!=="tout"?" - "+catFiltre:""}</div>
        {filtres.map(function(f){return <CarteFournisseur key={f.id} fournisseur={f} onEdit={editer} onToggle={toggleActif}/>;})}
        {filtres.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucun fournisseur{recherche?" pour cette recherche":""}</div>}

        {archives.length>0&&(
          <div style={{marginTop:20}}>
            <button onClick={function(){setShowArchives(!showArchives);}} style={{background:"none",border:"none",color:T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
              {showArchives?"Masquer":"Afficher"} les archives ({archives.length})
            </button>
            {showArchives&&archives.map(function(f){return <CarteFournisseur key={f.id} fournisseur={f} onEdit={editer} onToggle={toggleActif}/>;})}
          </div>
        )}
      </div>
    </div>
  );
}
