// Registre des incidents de confidentialite (Loi 25) - v1.0
// Obligation legale: consigner tout incident implicant des renseignements personnels.

import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var VIDE={date_incident:"",description:"",renseignements_vises:"",personnes_touchees:"",risque_prejudice:"faible",mesures_prises:"",avis_cai:false,avis_personnes:false,statut:"ouvert"};

export default function RegistreIncidents(){
  var s0=useState([]);var incidents=s0[0];var setIncidents=s0[1];
  var s1=useState(false);var showForm=s1[0];var setShowForm=s1[1];
  var s2=useState(VIDE);var nf=s2[0];var setNf=s2[1];
  var s3=useState(false);var saving=s3[0];var setSaving=s3[1];

  useEffect(function(){
    sb.select("registre_incidents",{order:"created_at.desc"}).then(function(res){
      if(res&&res.data)setIncidents(res.data);
    }).catch(function(){});
  },[]);

  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function ajouter(){
    if(!nf.description||!nf.date_incident)return;
    setSaving(true);
    var user=sb.getUser();
    var row={
      date_incident:nf.date_incident,description:nf.description,
      renseignements_vises:nf.renseignements_vises||"",
      personnes_touchees:parseInt(nf.personnes_touchees)||0,
      risque_prejudice:nf.risque_prejudice||"faible",
      mesures_prises:nf.mesures_prises||"",
      avis_cai:!!nf.avis_cai,avis_personnes:!!nf.avis_personnes,
      statut:nf.statut||"ouvert",cree_par:user?(user.nom||user.email):"?"
    };
    sb.insert("registre_incidents",row).then(function(res){
      if(res&&res.data)setIncidents(function(prev){return [res.data].concat(prev);});
      sb.log("loi25","incident","Incident consigne au registre: "+nf.description.substring(0,80),"","");
      setShowForm(false);setNf(VIDE);setSaving(false);
    }).catch(function(){setSaving(false);});
  }

  function fermer(id){
    sb.update("registre_incidents",id,{statut:"resolu"}).then(function(){
      setIncidents(function(prev){return prev.map(function(x){return x.id===id?Object.assign({},x,{statut:"resolu"}):x;});});
    }).catch(function(){});
  }

  var ouverts=incidents.filter(function(x){return x.statut!=="resolu";}).length;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Loi 25 - Registre des incidents de confidentialite</div>
        <div style={{marginLeft:"auto"}}>
          <Btn onClick={function(){setNf(VIDE);setShowForm(true);}}>+ Consigner un incident</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:T.amber}}>
          La Loi 25 exige de consigner TOUT incident implicant des renseignements personnels (acces non autorise, perte, vol, envoi au mauvais destinataire...). Si un incident presente un risque de prejudice serieux: aviser la Commission d acces a l information (CAI) et les personnes concernees.
          {ouverts>0&&<b> {ouverts} incident(s) ouvert(s).</b>}
        </div>

        {showForm&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>Nouvel incident</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
              <div><Lbl l="Date de l incident"/><input type="date" value={nf.date_incident} onChange={function(e){setN("date_incident",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Personnes touchees (nombre)"/><input type="number" value={nf.personnes_touchees} onChange={function(e){setN("personnes_touchees",e.target.value);}} style={INP} placeholder="0"/></div>
              <div><Lbl l="Risque de prejudice"/><select value={nf.risque_prejudice} onChange={function(e){setN("risque_prejudice",e.target.value);}} style={INP}><option value="faible">Faible</option><option value="moyen">Moyen</option><option value="serieux">Serieux (avis CAI requis)</option></select></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Description de l incident"/><textarea value={nf.description} onChange={function(e){setN("description",e.target.value);}} rows={2} style={Object.assign({},INP,{resize:"vertical"})} placeholder="Ce qui s est passe, quand, comment il a ete decouvert..."/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Renseignements vises"/><input value={nf.renseignements_vises} onChange={function(e){setN("renseignements_vises",e.target.value);}} style={INP} placeholder="Ex: noms et courriels de 12 coproprietaires"/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Mesures prises"/><textarea value={nf.mesures_prises} onChange={function(e){setN("mesures_prises",e.target.value);}} rows={2} style={Object.assign({},INP,{resize:"vertical"})} placeholder="Correctifs appliques, personnes avisees..."/></div>
              <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={function(){setN("avis_cai",!nf.avis_cai);}}>
                <div style={{width:18,height:18,borderRadius:4,border:"2px solid "+(nf.avis_cai?T.accent:T.border),background:nf.avis_cai?T.accent:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{nf.avis_cai&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>V</span>}</div>
                <span style={{fontSize:12}}>CAI avisee</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={function(){setN("avis_personnes",!nf.avis_personnes);}}>
                <div style={{width:18,height:18,borderRadius:4,border:"2px solid "+(nf.avis_personnes?T.accent:T.border),background:nf.avis_personnes?T.accent:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{nf.avis_personnes&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>V</span>}</div>
                <span style={{fontSize:12}}>Personnes avisees</span>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={ajouter} dis={saving||!nf.description||!nf.date_incident}>{saving?"Sauvegarde...":"Consigner au registre"}</Btn>
              <Btn onClick={function(){setShowForm(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}

        {incidents.map(function(x){return(
          <div key={x.id} style={{background:T.surface,border:"1px solid "+(x.statut==="resolu"?T.border:T.red+"55"),borderRadius:12,padding:16,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:700,color:T.navy}}>{x.date_incident||"-"}</span>
                  <span style={{background:x.risque_prejudice==="serieux"?T.redL:x.risque_prejudice==="moyen"?T.amberL:T.accentL,color:x.risque_prejudice==="serieux"?T.red:x.risque_prejudice==="moyen"?T.amber:T.accent,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>Risque {x.risque_prejudice||"faible"}</span>
                  <span style={{background:x.statut==="resolu"?T.accentL:T.redL,color:x.statut==="resolu"?T.accent:T.red,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{x.statut==="resolu"?"RESOLU":"OUVERT"}</span>
                  {x.avis_cai?<span style={{fontSize:10,color:T.muted}}>CAI avisee</span>:null}
                </div>
                <div style={{fontSize:12,color:T.navy,marginBottom:4}}>{x.description}</div>
                {x.renseignements_vises?<div style={{fontSize:11,color:T.muted}}>Renseignements: {x.renseignements_vises} {x.personnes_touchees?"("+x.personnes_touchees+" personne(s))":""}</div>:null}
                {x.mesures_prises?<div style={{fontSize:11,color:T.muted}}>Mesures: {x.mesures_prises}</div>:null}
                <div style={{fontSize:10,color:T.muted,marginTop:4}}>Consigne par {x.cree_par||"-"} le {x.created_at?x.created_at.substring(0,10):"-"}</div>
              </div>
              {x.statut!=="resolu"&&<Btn sm onClick={function(){fermer(x.id);}}>Marquer resolu</Btn>}
            </div>
          </div>
        );})}
        {incidents.length===0&&<div style={{textAlign:"center",padding:40,color:T.muted,fontSize:12}}>Aucun incident consigne. C est une bonne nouvelle - mais le registre doit exister et etre tenu a jour.</div>}
      </div>
    </div>
  );
}
