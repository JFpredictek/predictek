// Cotisations speciales - module separe (Finances - Recevables)
// Creation (repartition automatique par quote-part sur N versements) et suivi.
// Les VERSEMENTS du mois apparaissent automatiquement dans le tableau des Encaissements.
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
var money=function(n){return (Number(n)||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

export default function CotisationsSpeciales(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var unites=s2[0];var setUnites=s2[1];
  var s3=useState([]);var speciales=s3[0];var setSpeciales=s3[1];
  var s4=useState("");var msg=s4[0];var setMsg=s4[1];
  var s5=useState("");var err=s5[0];var setErr=s5[1];
  var s6=useState({titre:"",montant_total:"",date_vote:new Date().toISOString().substring(0,10),nb_versements:"1",date_premier_versement:new Date().toISOString().substring(0,10),notes:""});
  var nfSp=s6[0];var setNfSp=s6[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  function charger(){
    if(!sel)return;
    sb.select("unites",{eq:{syndicat_id:sel.id},order:"no_unite.asc",limit:1000}).then(function(r){if(r&&r.data)setUnites(r.data);}).catch(function(){});
    sb.select("cotisations_speciales",{eq:{syndicat_id:sel.id},order:"date_vote.desc",limit:100}).then(function(r){if(r&&r.data)setSpeciales(r.data);}).catch(function(){});
  }
  useEffect(function(){charger();},[sel&&sel.id]);

  function setSp(k,v){setNfSp(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}
  function creerSpeciale(){
    if(!sel||!nfSp.titre||!parseFloat(nfSp.montant_total)){setErr("Titre et montant total requis.");return;}
    setErr("");setMsg("");
    var row={syndicat_id:sel.id,titre:nfSp.titre,montant_total:parseFloat(nfSp.montant_total)||0,date_vote:nfSp.date_vote||null,nb_versements:parseInt(nfSp.nb_versements)||1,date_premier_versement:nfSp.date_premier_versement||null,notes:nfSp.notes||""};
    sb.insert("cotisations_speciales",row).then(function(r){
      if(!r||!r.data||!r.data.id){setErr("ECHEC de la creation: "+((r&&r.error&&r.error.message)||"erreur"));return;}
      setMsg("Cotisation speciale creee - repartie automatiquement par quote-part sur "+row.nb_versements+" versement(s). Les versements du mois apparaissent dans Encaissements.");
      sb.log("encaissements","creation","Cotisation speciale: "+row.titre+" ("+row.montant_total+" $)","",sel.code||"");
      setNfSp({titre:"",montant_total:"",date_vote:new Date().toISOString().substring(0,10),nb_versements:"1",date_premier_versement:new Date().toISOString().substring(0,10),notes:""});
      charger();
      setTimeout(function(){setMsg("");},8000);
    });
  }

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat.</div>;
  if(!sel)return null;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Cotisations speciales</div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{marginLeft:"auto",fontSize:10,color:"#9fb0c6"}}>Les versements dus du mois s encaissent dans Finances - Recevables - Encaissements</div>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:18,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:10}}>Nouvelle cotisation speciale (repartie par quote-part automatiquement)</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
            <div><Lbl l="Objet / titre"/><input value={nfSp.titre} onChange={function(e){setSp("titre",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Montant TOTAL ($)"/><input type="number" step="0.01" value={nfSp.montant_total} onChange={function(e){setSp("montant_total",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Date du vote (AG)"/><input type="date" value={nfSp.date_vote} onChange={function(e){setSp("date_vote",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Nb versements"/><select value={nfSp.nb_versements} onChange={function(e){setSp("nb_versements",e.target.value);}} style={INP}>{["1","2","3","4","6","12","24"].map(function(x){return <option key={x} value={x}>{x}</option>;})}</select></div>
            <div><Lbl l="1er versement"/><input type="date" value={nfSp.date_premier_versement} onChange={function(e){setSp("date_premier_versement",e.target.value);}} style={INP}/></div>
          </div>
          {parseFloat(nfSp.montant_total)>0&&unites.length>0&&(
            <div style={{background:T.blueL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.blue,marginBottom:10}}>
              Apercu: unite avec la plus grande quote-part = {money(Math.max.apply(null,unites.map(function(u){return (parseFloat(nfSp.montant_total)||0)*(parseFloat(u.fraction)||0)/100;})))} au total, reparti sur {nfSp.nb_versements} versement(s) mensuel(s).
            </div>
          )}
          <Btn onClick={creerSpeciale}>Creer la cotisation speciale</Btn>
        </div>

        {speciales.map(function(spx){
          return(
            <div key={spx.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:T.navy}}>{spx.titre}</div>
                  <div style={{fontSize:11,color:T.muted}}>Votee le {spx.date_vote||"-"} | {spx.nb_versements||1} versement(s) a partir de {String(spx.date_premier_versement||"").substring(0,10)||"-"}</div>
                </div>
                <div style={{fontSize:17,fontWeight:800,color:T.purple}}>{money(spx.montant_total)}</div>
              </div>
              <div style={{marginTop:8,maxHeight:170,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead><tr style={{background:T.alt}}><th style={{padding:"4px 8px",textAlign:"left"}}>Unite</th><th style={{padding:"4px 8px",textAlign:"right"}}>Quote-part</th><th style={{padding:"4px 8px",textAlign:"right"}}>Part totale</th><th style={{padding:"4px 8px",textAlign:"right"}}>Par versement</th></tr></thead>
                  <tbody>
                    {unites.map(function(u){
                      var part=(Number(spx.montant_total)||0)*(parseFloat(u.fraction)||0)/100;
                      return <tr key={u.id} style={{borderTop:"1px solid "+T.border}}><td style={{padding:"3px 8px",fontWeight:700}}>{u.no_unite}</td><td style={{padding:"3px 8px",textAlign:"right"}}>{(parseFloat(u.fraction)||0).toFixed(3)} %</td><td style={{padding:"3px 8px",textAlign:"right"}}>{money(part)}</td><td style={{padding:"3px 8px",textAlign:"right",fontWeight:700}}>{money(part/(parseInt(spx.nb_versements)||1))}</td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {speciales.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucune cotisation speciale.</div>}
      </div>
    </div>
  );
}
