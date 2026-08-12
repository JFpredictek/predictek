// Relances automatiques - vue reelle du moteur (table relances_envoyees)
// Le moteur roule chaque jour a 8h (heure de l Est) via le cron Vercel.
// Un admin peut aussi le declencher manuellement ici.

import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",blue:"#1A56DB",blueL:"#EFF6FF"};
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:"none",borderRadius:7,padding:"8px 16px",color:"#fff",fontSize:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var LIBELLES={
  cotisation_j5:"Cotisation J+5",cotisation_j15:"Cotisation J+15",cotisation_j30:"Cotisation J+30",
  assurance_90:"Assurance - 90 jours",assurance_30:"Assurance - 30 jours",assurance_expiree:"Assurance EXPIREE"
};

export default function RelancesAuto(){
  var s0=useState([]);var relances=s0[0];var setRelances=s0[1];
  var s1=useState(false);var running=s1[0];var setRunning=s1[1];
  var s2=useState(null);var rapport=s2[0];var setRapport=s2[1];
  var s3=useState("");var err=s3[0];var setErr=s3[1];

  function charger(){
    sb.select("relances_envoyees",{order:"created_at.desc",limit:100}).then(function(res){
      if(res&&res.data)setRelances(res.data);
    }).catch(function(){});
  }
  useEffect(charger,[]);

  function executer(){
    setRunning(true);setErr("");setRapport(null);
    fetch("/api/relances",{method:"POST",headers:sb.apiHeaders()})
      .then(function(r){return r.json().then(function(d){return {status:r.status,data:d};});})
      .then(function(resp){
        if(resp.status!==200){setErr((resp.data&&resp.data.error)||"Erreur du moteur. Note: fonctionne sur le site deploye (Vercel), pas en dev local.");}
        else{setRapport(resp.data);charger();}
        setRunning(false);
      })
      .catch(function(){setErr("API injoignable. Le moteur fonctionne sur le site deploye (Vercel), pas en dev local.");setRunning(false);});
  }

  return(
    <div>
      <div style={{background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:12,color:T.navy,lineHeight:1.6}}>
        <b>Moteur reel.</b> Chaque jour a 8 h, le systeme verifie automatiquement: cotisations du mois non recues (rappels J+5, J+15, J+30) et assurances qui expirent (90 jours, 30 jours, expirees). Les courriels sont rediges par l IA, envoyes par courriel, consignes ici et dans l Historique. Un rapport quotidien est envoye a l administrateur.
        <b> Tant que le mode production n est pas active dans Vercel, tous les courriels sont rediriges vers l administrateur (aucun coproprietaire ne recoit rien).</b>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
        <Btn onClick={executer} dis={running}>{running?"Analyse en cours...":"Executer le moteur maintenant"}</Btn>
        <span style={{fontSize:11,color:T.muted}}>{relances.length} relance(s) au registre</span>
      </div>
      {err&&<div style={{background:T.redL,border:"1px solid "+T.red+"44",borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,marginBottom:12}}>{err}</div>}
      {rapport&&(
        <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,marginBottom:12}}>
          Analyse du {rapport.date}: {rapport.coproprietaires_analyses} coproprietaire(s) analyse(s), {rapport.relances} relance(s) {rapport.mode==="test"?"(MODE TEST - courriels rediriges vers l admin)":"envoyee(s)"}.
          {!rapport.envoi_configure&&" ATTENTION: RESEND_API_KEY absente - relances simulees seulement."}
        </div>
      )}
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:T.alt}}>
            {["Date","Type","Destinataire","Sujet","Statut"].map(function(h){return <th key={h} style={{padding:"8px 12px",textAlign:"left",fontWeight:600,color:T.navy}}>{h}</th>;})}
          </tr></thead>
          <tbody>
            {relances.map(function(x){return(
              <tr key={x.id} style={{borderBottom:"1px solid "+T.border}}>
                <td style={{padding:"7px 12px",color:T.muted,fontSize:11,whiteSpace:"nowrap"}}>{x.created_at?new Date(x.created_at).toLocaleString("fr-CA",{hour12:false}).replace(",","").substring(0,17):"-"}</td>
                <td style={{padding:"7px 12px",fontWeight:600,color:x.type&&x.type.indexOf("expiree")>=0?T.red:T.navy,fontSize:11,whiteSpace:"nowrap"}}>{LIBELLES[x.type]||x.type}</td>
                <td style={{padding:"7px 12px",color:T.muted,fontSize:11}}>{x.courriel}</td>
                <td style={{padding:"7px 12px",fontSize:11}}>{x.sujet}</td>
                <td style={{padding:"7px 12px"}}><span style={{background:x.statut==="envoyee"?T.accentL:x.statut==="echec"?T.redL:T.amberL,color:x.statut==="envoyee"?T.accent:x.statut==="echec"?T.red:T.amber,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{(x.statut||"").toUpperCase()}</span>{x.detail?<span style={{fontSize:10,color:T.muted,marginLeft:6}}>{x.detail}</span>:null}</td>
              </tr>
            );})}
            {relances.length===0&&<tr><td colSpan={5} style={{padding:24,textAlign:"center",color:T.muted}}>Aucune relance encore - le moteur roule chaque matin, ou cliquez "Executer le moteur maintenant".</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
