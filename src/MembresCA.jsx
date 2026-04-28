
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

// Chiffrement NAS (XOR + base64) - evite lecture directe en BD
function chiffrerNAS(nas){
  var key="Predictek2026Key";var out=[];
  var clean=nas.replace(/[^0-9]/g,"");
  for(var i=0;i<clean.length;i++){out.push(clean.charCodeAt(i)^key.charCodeAt(i%key.length));}
  return btoa(String.fromCharCode.apply(null,out));
}
function dechiffrerNAS(enc){
  if(!enc)return"";
  try{
    var key="Predictek2026Key";
    var bytes=atob(enc).split("").map(function(c){return c.charCodeAt(0);});
    return bytes.map(function(b,i){return String.fromCharCode(b^key.charCodeAt(i%key.length));}).join("");
  }catch(e){return"";}
}
function masquerNAS(nas){
  if(!nas||nas.length<4)return"***";
  return"***-***-"+nas.slice(-3);
}

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}{p.req&&<span style={{color:T.red}}> *</span>}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Badge(p){var C={president:{bg:"#E8F2EC",tc:"#1B5E3B"},vice:{bg:"#EFF6FF",tc:"#1A56DB"},tresorier:{bg:"#FEF3E2",tc:"#B86020"},secretaire:{bg:"#F3EEFF",tc:"#6B3FA0"},membre:{bg:"#F0EDE8",tc:"#7C7568"}};var c=C[p.r]||C.membre;return <span style={{background:c.bg,color:c.tc,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{p.l}</span>;}

var ROLES=[{id:"president",l:"President(e)"},{id:"vice",l:"Vice-president(e)"},{id:"tresorier",l:"Tresorier(e)"},{id:"secretaire",l:"Secretaire"},{id:"membre",l:"Membre"}];

function CarteMembreCA(p){
  var m=p.membre;
  var s0=useState(false);var showNAS=s0[0];var setShowNAS=s0[1];
  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
            <Badge r={m.role_ca} l={ROLES.find(function(r){return r.id===m.role_ca;})?ROLES.find(function(r){return r.id===m.role_ca;}).l:m.role_ca||"Membre"}/>
            <span style={{fontSize:13,fontWeight:700,color:T.navy}}>{m.prenom} {m.nom}</span>
            {m.unite&&<span style={{fontSize:11,color:T.muted}}>Unite {m.unite}</span>}
            {!m.actif&&<span style={{fontSize:10,color:T.red,fontWeight:700}}>INACTIF</span>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11,color:T.muted}}>
            {m.courriel&&<div>Courriel: <span style={{color:T.navy}}>{m.courriel}</span></div>}
            {m.cellulaire&&<div>Cellulaire: <span style={{color:T.navy}}>{m.cellulaire}</span></div>}
            {m.adresse_civique&&<div style={{gridColumn:"1/-1"}}>Adresse: <span style={{color:T.navy}}>{m.adresse_civique}{m.ville?", "+m.ville:""}{m.code_postal?" "+m.code_postal:""}</span></div>}
            {m.date_debut_mandat&&<div>Mandat depuis: <span style={{color:T.navy}}>{m.date_debut_mandat}</span></div>}
            {m.date_fin_mandat&&<div>Fin mandat: <span style={{color:T.navy}}>{m.date_fin_mandat}</span></div>}
            {m.nas_chiffre&&(
              <div style={{gridColumn:"1/-1",display:"flex",gap:8,alignItems:"center"}}>
                <span>NAS: </span>
                <span style={{color:T.navy,fontFamily:"monospace",letterSpacing:"0.05em"}}>{showNAS?dechiffrerNAS(m.nas_chiffre):masquerNAS(dechiffrerNAS(m.nas_chiffre))}</span>
                <button onClick={function(){setShowNAS(!showNAS);}} style={{background:T.amber,border:"none",borderRadius:4,padding:"2px 8px",fontSize:10,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>{showNAS?"Masquer":"Voir"}</button>
                <span style={{fontSize:10,color:T.amber}}>Confidentiel</span>
              </div>
            )}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:12}}>
          <Btn sm bg={T.blue} onClick={function(){p.onEdit(m);}}>Modifier</Btn>
          <Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){p.onDelete(m.id);}}>Retirer</Btn>
        </div>
      </div>
    </div>
  );
}

var VIDE_NF={nom:"",prenom:"",role_ca:"membre",unite:"",courriel:"",cellulaire:"",adresse_civique:"",ville:"",province:"QC",code_postal:"",nas:"",date_debut_mandat:"",date_fin_mandat:"",actif:true};

function FormMembreCA(p){
  var nf=p.nf;var setField=p.setField;
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div><Lbl l="Prenom" req/><input value={nf.prenom||""} onChange={function(e){setField("prenom",e.target.value);}} style={INP} placeholder="Jean-Francois"/></div>
      <div><Lbl l="Nom" req/><input value={nf.nom||""} onChange={function(e){setField("nom",e.target.value);}} style={INP} placeholder="Laroche"/></div>
      <div><Lbl l="Role au CA" req/><select value={nf.role_ca||"membre"} onChange={function(e){setField("role_ca",e.target.value);}} style={INP}>{ROLES.map(function(r){return <option key={r.id} value={r.id}>{r.l}</option>;})}</select></div>
      <div><Lbl l="No unite"/><input value={nf.unite||""} onChange={function(e){setField("unite",e.target.value);}} style={INP} placeholder="301"/></div>
      <div><Lbl l="Courriel" req/><input type="email" value={nf.courriel||""} onChange={function(e){setField("courriel",e.target.value);}} style={INP} placeholder="prenom@email.com"/></div>
      <div><Lbl l="Cellulaire"/><input value={nf.cellulaire||""} onChange={function(e){setField("cellulaire",e.target.value);}} style={INP} placeholder="418-555-0000"/></div>
      <div style={{gridColumn:"1/-1"}}><Lbl l="Adresse civique"/><input value={nf.adresse_civique||""} onChange={function(e){setField("adresse_civique",e.target.value);}} style={INP} placeholder="123 rue Principale"/></div>
      <div><Lbl l="Ville"/><input value={nf.ville||""} onChange={function(e){setField("ville",e.target.value);}} style={INP} placeholder="Quebec"/></div>
      <div><Lbl l="Province"/><select value={nf.province||"QC"} onChange={function(e){setField("province",e.target.value);}} style={INP}><option>QC</option><option>ON</option><option>BC</option><option>AB</option></select></div>
      <div><Lbl l="Code postal"/><input value={nf.code_postal||""} onChange={function(e){setField("code_postal",e.target.value.toUpperCase());}} style={INP} placeholder="G1A 1A1"/></div>
      <div><Lbl l="Date debut mandat"/><input type="date" value={nf.date_debut_mandat||""} onChange={function(e){setField("date_debut_mandat",e.target.value);}} style={INP}/></div>
      <div><Lbl l="Date fin mandat"/><input type="date" value={nf.date_fin_mandat||""} onChange={function(e){setField("date_fin_mandat",e.target.value);}} style={INP}/></div>
      <div style={{gridColumn:"1/-1",background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:10,padding:12}}>
        <div style={{fontSize:11,fontWeight:700,color:T.amber,marginBottom:6}}>NAS - Information confidentielle (chiffree)</div>
        <input value={nf.nas||""} onChange={function(e){setField("nas",e.target.value.replace(/[^0-9]/g,"").slice(0,9));}} style={INP} placeholder="000000000" maxLength={9} type="password"/>
        <div style={{fontSize:10,color:T.amber,marginTop:4}}>Le NAS est chiffre automatiquement avant sauvegarde. Il ne peut etre lu directement dans la base de donnees.</div>
      </div>
      <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={function(){setField("actif",!nf.actif);}}>
        <div style={{width:18,height:18,borderRadius:4,border:"2px solid "+(nf.actif?T.accent:T.border),background:nf.actif?T.accent:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {nf.actif&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>V</span>}
        </div>
        <span style={{fontSize:12}}>Membre actif au CA</span>
      </div>
    </div>
  );
}

export default function MembresCA(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var membres=s2[0];var setMembres=s2[1];
  var s3=useState(false);var showForm=s3[0];var setShowForm=s3[1];
  var s4=useState(VIDE_NF);var nf=s4[0];var setNf=s4[1];
  var s5=useState(null);var editId=s5[0];var setEditId=s5[1];
  var s6=useState(false);var saving=s6[0];var setSaving=s6[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setMembres([]);
    sb.select("membres_ca",{eq:{syndicat_id:sel.id},order:"role_ca.asc"}).then(function(res){
      if(res&&res.data)setMembres(res.data);
    }).catch(function(){});
  },[sel]);

  function setField(k,v){setNf(function(pr){
    if(k==="nom")return Object.assign({},pr,{nom:v});
    if(k==="prenom")return Object.assign({},pr,{prenom:v});
    if(k==="role_ca")return Object.assign({},pr,{role_ca:v});
    if(k==="unite")return Object.assign({},pr,{unite:v});
    if(k==="courriel")return Object.assign({},pr,{courriel:v});
    if(k==="cellulaire")return Object.assign({},pr,{cellulaire:v});
    if(k==="adresse_civique")return Object.assign({},pr,{adresse_civique:v});
    if(k==="ville")return Object.assign({},pr,{ville:v});
    if(k==="province")return Object.assign({},pr,{province:v});
    if(k==="code_postal")return Object.assign({},pr,{code_postal:v});
    if(k==="nas")return Object.assign({},pr,{nas:v});
    if(k==="date_debut_mandat")return Object.assign({},pr,{date_debut_mandat:v});
    if(k==="date_fin_mandat")return Object.assign({},pr,{date_fin_mandat:v});
    if(k==="actif")return Object.assign({},pr,{actif:v});
    return pr;
  });}

  function sauvegarder(){
    if(!nf.nom||!nf.prenom||!sel)return;
    setSaving(true);
    var row={syndicat_id:sel.id,nom:nf.nom,prenom:nf.prenom,role_ca:nf.role_ca||"membre",unite:nf.unite||"",courriel:nf.courriel||"",cellulaire:nf.cellulaire||"",adresse_civique:nf.adresse_civique||"",ville:nf.ville||"",province:nf.province||"QC",code_postal:nf.code_postal||"",date_debut_mandat:nf.date_debut_mandat||null,date_fin_mandat:nf.date_fin_mandat||null,actif:nf.actif!==false};
    if(nf.nas&&nf.nas.length===9)row.nas_chiffre=chiffrerNAS(nf.nas);
    var op=editId?sb.update("membres_ca",editId,row):sb.insert("membres_ca",row);
    op.then(function(res){
      if(editId){
        setMembres(function(prev){return prev.map(function(m){return m.id===editId?Object.assign({},m,row,{nas_chiffre:row.nas_chiffre||m.nas_chiffre}):m;});});
      }else if(res&&res.data){
        setMembres(function(prev){return prev.concat([res.data]);});
      }
      sb.log("membres_ca",editId?"modification":"ajout",(editId?"Modification":"Ajout")+" membre CA: "+nf.prenom+" "+nf.nom,"",sel.code||"");
      setShowForm(false);setNf(VIDE_NF);setEditId(null);setSaving(false);
    }).catch(function(){setSaving(false);});
  }

  function editer(m){
    setNf({nom:m.nom||"",prenom:m.prenom||"",role_ca:m.role_ca||"membre",unite:m.unite||"",courriel:m.courriel||"",cellulaire:m.cellulaire||"",adresse_civique:m.adresse_civique||"",ville:m.ville||"",province:m.province||"QC",code_postal:m.code_postal||"",nas:"",date_debut_mandat:m.date_debut_mandat||"",date_fin_mandat:m.date_fin_mandat||"",actif:m.actif!==false});
    setEditId(m.id);setShowForm(true);
  }

  function supprimer(id){
    sb.delete("membres_ca",id).then(function(){
      setMembres(function(prev){return prev.filter(function(m){return m.id!==id;});});
    }).catch(function(){});
  }

  var actifs=membres.filter(function(m){return m.actif;});
  var inactifs=membres.filter(function(m){return !m.actif;});

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Membres du Conseil d administration</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{marginLeft:"auto"}}>
          <Btn onClick={function(){setNf(VIDE_NF);setEditId(null);setShowForm(true);}}>+ Ajouter un membre</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        {showForm&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>{editId?"Modifier le membre":"Nouveau membre du CA"}</div>
            <FormMembreCA nf={nf} setField={setField}/>
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <Btn onClick={sauvegarder} dis={saving||!nf.nom||!nf.prenom}>{saving?"Sauvegarde...":"Sauvegarder"}</Btn>
              <Btn onClick={function(){setShowForm(false);setEditId(null);setNf(VIDE_NF);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}

        {actifs.length===0&&!showForm&&(
          <div style={{textAlign:"center",padding:40,background:T.surface,border:"1px solid "+T.border,borderRadius:12,color:T.muted,fontSize:12}}>Aucun membre du CA - cliquez "+ Ajouter un membre"</div>
        )}

        {actifs.length>0&&(
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Membres actifs ({actifs.length})</div>
            {actifs.map(function(m){return <CarteMembreCA key={m.id} membre={m} onEdit={editer} onDelete={supprimer}/>;})}
          </div>
        )}

        {inactifs.length>0&&(
          <div style={{marginTop:20}}>
            <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Anciens membres ({inactifs.length})</div>
            {inactifs.map(function(m){return <CarteMembreCA key={m.id} membre={m} onEdit={editer} onDelete={supprimer}/>;})}
          </div>
        )}
      </div>
    </div>
  );
}
