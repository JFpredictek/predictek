
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var ROLES_DEF=[
  {id:"admin",l:"Administrateur Predictek",desc:"Acces complet a tous les modules et syndicats",color:T.purple,perms:["tout"]},
  {id:"gestionnaire",l:"Gestionnaire de syndicat",desc:"Acces complet a son/ses syndicats assignes",color:T.accent,perms:["syndicat","copros","factures","budget","ca","docs","gestion","t4","carnet","bons","comm","rapports","assurances","pv"]},
  {id:"ca",l:"Membre du CA",desc:"Lecture + approbation factures de son syndicat",color:T.blue,perms:["tableau","factures_approbation","docs_lecture","pv_lecture","reunions"]},
  {id:"copropri-taire",l:"Coproprietaire",desc:"Portail personnel uniquement",color:T.amber,perms:["portail_copro"]},
];

var VIDE_USER={nom:"",prenom:"",courriel:"",role:"gestionnaire",syndicat_id:"",actif:true,mot_de_passe:""};

function CarteUtilisateur(p){
  var u=p.user;
  var role=ROLES_DEF.find(function(r){return r.id===u.role;})||ROLES_DEF[1];
  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
            <div style={{width:36,height:36,borderRadius:10,background:role.color+"22",border:"1px solid "+role.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:role.color,flexShrink:0}}>
              {(u.prenom||u.nom||"U").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{u.prenom} {u.nom}</div>
              <div style={{fontSize:11,color:T.muted}}>{u.courriel}</div>
            </div>
            <span style={{background:role.color+"22",color:role.color,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{role.l}</span>
            {!u.actif&&<span style={{background:T.redL,color:T.red,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>INACTIF</span>}
          </div>
          {u.syndicat_nom&&<div style={{fontSize:11,color:T.muted}}>Syndicat: <span style={{color:T.navy,fontWeight:600}}>{u.syndicat_nom}</span></div>}
          <div style={{fontSize:10,color:T.muted,marginTop:4}}>Cree le: {u.created_at?u.created_at.substring(0,10):"-"}</div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:12}}>
          <Btn sm onClick={function(){p.onEdit(u);}}>Modifier</Btn>
          <Btn sm bg={u.actif?T.amberL:T.accentL} tc={u.actif?T.amber:T.accent} bdr={"1px solid "+(u.actif?T.amber:T.accent)+"44"} onClick={function(){p.onToggle(u.id,!u.actif);}}>
            {u.actif?"Desactiver":"Reactiver"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default function GestionUtilisateurs(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState([]);var users=s1[0];var setUsers=s1[1];
  var s2=useState(false);var showForm=s2[0];var setShowForm=s2[1];
  var s3=useState(VIDE_USER);var nf=s3[0];var setNf=s3[1];
  var s4=useState(null);var editId=s4[0];var setEditId=s4[1];
  var s5=useState(false);var saving=s5[0];var setSaving=s5[1];
  var s6=useState("actifs");var filtre=s6[0];var setFiltre=s6[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){if(res&&res.data)setSyndicats(res.data);}).catch(function(){});
    sb.select("usagers",{order:"nom.asc"}).then(function(res){
      if(res&&res.data)setUsers(res.data);
    }).catch(function(){});
  },[]);

  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function sauvegarder(){
    if(!nf.nom||!nf.courriel)return;
    setSaving(true);
    var synd=syndicats.find(function(s){return s.id===nf.syndicat_id;});
    var row={nom:nf.nom,prenom:nf.prenom||"",courriel:nf.courriel,role:nf.role||"gestionnaire",syndicat_id:nf.syndicat_id||null,syndicat_nom:synd?synd.nom:"",actif:nf.actif!==false};
    var op=editId?sb.update("usagers",editId,row):sb.insert("usagers",row);
    op.then(function(res){
      if(editId){setUsers(function(prev){return prev.map(function(u){return u.id===editId?Object.assign({},u,row):u;});});}
      else if(res&&res.data){setUsers(function(prev){return [res.data].concat(prev);});}
      sb.log("usagers",editId?"modification":"creation",(editId?"Modification":"Creation")+" usager: "+nf.prenom+" "+nf.nom+" ("+nf.role+")","",nf.syndicat_id||"");
      setShowForm(false);setNf(VIDE_USER);setEditId(null);setSaving(false);
    }).catch(function(){setSaving(false);});
  }

  function editer(u){
    setNf({nom:u.nom||"",prenom:u.prenom||"",courriel:u.courriel||"",role:u.role||"gestionnaire",syndicat_id:u.syndicat_id||"",actif:u.actif!==false});
    setEditId(u.id);setShowForm(true);
  }

  function toggle(id,actif){
    sb.update("usagers",id,{actif:actif}).then(function(){
      setUsers(function(prev){return prev.map(function(u){return u.id===id?Object.assign({},u,{actif:actif}):u;});});
    }).catch(function(){});
  }

  var filtres=users.filter(function(u){return filtre==="tous"||(filtre==="actifs"?u.actif:!u.actif);});

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Gestion des utilisateurs</div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {["actifs","inactifs","tous"].map(function(f){var a=filtre===f;return <button key={f} onClick={function(){setFiltre(f);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",padding:"6px 12px",color:a?"#fff":"#8da0bb",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:400,textTransform:"capitalize"}}>{f}</button>;})}
          <Btn onClick={function(){setNf(VIDE_USER);setEditId(null);setShowForm(true);}}>+ Ajouter utilisateur</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
          {ROLES_DEF.map(function(r){var count=users.filter(function(u){return u.role===r.id&&u.actif;}).length;return(
            <div key={r.id} style={{background:T.surface,border:"1px solid "+r.color+"33",borderRadius:12,padding:14}}>
              <div style={{fontSize:11,fontWeight:700,color:r.color,marginBottom:4}}>{r.l}</div>
              <div style={{fontSize:22,fontWeight:800,color:T.navy}}>{count}</div>
              <div style={{fontSize:10,color:T.muted,marginTop:4}}>{r.desc}</div>
            </div>
          );})}
        </div>

        {showForm&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>{editId?"Modifier l utilisateur":"Nouvel utilisateur"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div><Lbl l="Prenom"/><input value={nf.prenom} onChange={function(e){setN("prenom",e.target.value);}} style={INP} placeholder="Jean-Francois"/></div>
              <div><Lbl l="Nom"/><input value={nf.nom} onChange={function(e){setN("nom",e.target.value);}} style={INP} placeholder="Laroche"/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Courriel (identifiant de connexion)"/><input type="email" value={nf.courriel} onChange={function(e){setN("courriel",e.target.value);}} style={INP} placeholder="jf@predictek.ca"/></div>
              <div><Lbl l="Role"/><select value={nf.role} onChange={function(e){setN("role",e.target.value);}} style={INP}>{ROLES_DEF.map(function(r){return <option key={r.id} value={r.id}>{r.l}</option>;})}</select></div>
              <div><Lbl l="Syndicat assigne" hint="Pour gestionnaire et membre CA"/><select value={nf.syndicat_id} onChange={function(e){setN("syndicat_id",e.target.value);}} style={INP}><option value="">Tous les syndicats</option>{syndicats.map(function(s){return <option key={s.id} value={s.id}>{s.nom}</option>;})}</select></div>
              <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={function(){setN("actif",!nf.actif);}}>
                <div style={{width:18,height:18,borderRadius:4,border:"2px solid "+(nf.actif?T.accent:T.border),background:nf.actif?T.accent:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{nf.actif&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>V</span>}</div>
                <span style={{fontSize:12}}>Compte actif</span>
              </div>
            </div>
            <div style={{background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:T.blue}}>
              L invitation par courriel sera envoyee automatiquement. L utilisateur devra definir son mot de passe via le lien recu.
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={sauvegarder} dis={saving||!nf.nom||!nf.courriel}>{saving?"Sauvegarde...":"Sauvegarder"}</Btn>
              <Btn onClick={function(){setShowForm(false);setEditId(null);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}

        {filtres.map(function(u){return <CarteUtilisateur key={u.id} user={u} onEdit={editer} onToggle={toggle}/>;})}
        {filtres.length===0&&<div style={{textAlign:"center",padding:40,color:T.muted,fontSize:12}}>Aucun utilisateur - cliquez "+ Ajouter utilisateur"</div>}
      </div>
    </div>
  );
}
