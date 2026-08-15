// Centre de notifications - GERE PAR SYNDICAT (et non par Predictek).
// Chaque syndicat active/desactive ses relances automatiques et consulte
// le registre des envois qui LE concernent. Les delais (avis d assurance,
// approbations, convocations) se reglent dans Configuration du syndicat.
import sb from "./lib/supabase";
import RelancesAuto from "./RelancesAuto";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF"};
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

export default function Notifications(p){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState("");var msg=s2[0];var setMsg=s2[1];
  var s3=useState(false);var sauve=s3[0];var setSauve=s3[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(r){
      if(r&&r.data){setSyndicats(r.data);if(r.data.length>0)setSel(r.data[0]);}
    }).catch(function(){});
  },[]);

  function basculerRelances(){
    if(!sel)return;
    var nouveau=!(sel.relances_actives!==false); // etat actuel -> inverse
    setSauve(true);setMsg("");
    sb.update("syndicats",sel.id,{relances_actives:nouveau}).then(function(r){
      setSauve(false);
      if(r&&r.error){setMsg("ECHEC de la sauvegarde ("+(r.error.message||"")+"). Rien n a ete modifie.");return;}
      var maj=Object.assign({},sel,{relances_actives:nouveau});
      setSel(maj);
      setSyndicats(function(prev){return prev.map(function(s){return s.id===maj.id?maj:s;});});
      setMsg(nouveau?"Relances automatiques ACTIVEES pour "+sel.nom+".":"Relances automatiques DESACTIVEES pour "+sel.nom+" - le moteur quotidien ignorera ce syndicat.");
      sb.log("notifications","modification","Relances automatiques "+(nouveau?"activees":"desactivees")+" pour "+sel.nom,"",sel.code||"");
      setTimeout(function(){setMsg("");},4000);
    }).catch(function(){setSauve(false);setMsg("ECHEC de la sauvegarde. Rien n a ete modifie.");});
  }

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat - creez d abord un syndicat via Configuration Predictek.</div>;
  if(!sel)return null;

  var actives=sel.relances_actives!==false;

  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{background:T.navy,borderRadius:12,padding:"14px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Centre de notifications</div>
          <div style={{fontSize:11,color:"#8da0bb"}}>Relances automatiques et registre des envois - gere par syndicat</div>
        </div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s){setSel(s);setMsg("");}}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
      </div>

      {msg&&<div style={{background:msg.indexOf("ECHEC")===0?T.redL:T.accentL,border:"1px solid "+(msg.indexOf("ECHEC")===0?T.red:T.accent)+"44",borderRadius:8,padding:"9px 13px",fontSize:12,fontWeight:700,color:msg.indexOf("ECHEC")===0?T.red:T.accent,marginBottom:12}}>{msg}</div>}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:8}}>Relances automatiques - {sel.nom}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <button onClick={basculerRelances} disabled={sauve} style={{width:48,height:26,borderRadius:13,background:actives?T.accent:T.border,border:"none",cursor:sauve?"wait":"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:actives?25:3,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
            </button>
            <span style={{fontSize:13,fontWeight:700,color:actives?T.accent:T.red}}>{actives?"ACTIVES":"DESACTIVEES"}</span>
          </div>
          <div style={{fontSize:11,color:T.muted,lineHeight:1.6}}>
            Quand elles sont actives, le moteur quotidien (8 h) traite ce syndicat: cotisations en retard (J+5/15/30),
            preuves d assurance des unites, assurance du syndicat, convocations d assemblees, factures a approuver (courriel aux membres du CA)
            et avis de non-conformite. Desactive, le syndicat est completement ignore par le moteur.
          </div>
        </div>
        <div style={{background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:10,padding:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:8}}>Ou se configurent les regles de CE syndicat?</div>
          <div style={{fontSize:11,color:T.navy,lineHeight:1.7,marginBottom:10}}>
            Les delais d avis d assurance (avant/apres echeance), l avis de non-conformite automatique,
            les paliers d approbation des factures, le quorum et le delai de convocation se reglent dans
            <b> Configuration du syndicat</b>.
          </div>
          <Btn sm bg={T.surface} tc={T.blue} bdr={"1px solid "+T.blue+"55"} onClick={function(){if(p&&p.onNavigate)p.onNavigate("configsynd");}}>Ouvrir Configuration du syndicat</Btn>
        </div>
      </div>

      <RelancesAuto syndicatId={sel.id} syndicatNom={sel.nom}/>
    </div>
  );
}
