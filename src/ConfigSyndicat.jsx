// Predictek - CONFIGURATION DU SYNDICAT (cote CA)
// Regroupe TOUTES les regles configurables du syndicat: avis d assurance (delais,
// avis de non-conformite automatique), approbation des factures, quorum et convocation,
// interets sur arrerages, et liens vers le plan comptable.
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

function Carte(p){
  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:18,marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:2}}>{p.titre}</div>
      <div style={{fontSize:11,color:T.muted,marginBottom:12}}>{p.desc}</div>
      {p.children}
    </div>
  );
}

export default function ConfigSyndicat(p){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState({});var f=s2[0];var setF=s2[1];
  var s3=useState("");var msg=s3[0];var setMsg=s3[1];
  var s4=useState("");var err=s4[0];var setErr=s4[1];
  var s5=useState({delaiConv:"15",taux:"0"});var glob=s5[0];var setGlob=s5[1];
  var s6=useState(false);var saving=s6[0];var setSaving=s6[1];
  var s7=useState([{max:"1000",nb:"1"},{max:"5000",nb:"2"},{max:"10000",nb:"3"}]);var paliers=s7[0];var setPaliers=s7[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(r){
      if(r&&r.data&&r.data.length>0){setSyndicats(r.data);setSel(r.data[0]);}
    }).catch(function(){});
    sb.select("config_publique",{limit:100}).then(function(r){
      if(r&&r.data){
        var g={delaiConv:"15",taux:"0"};
        r.data.forEach(function(x){
          if(x.cle==="delai_convocation_jours")g.delaiConv=x.valeur;
          if(x.cle==="taux_interet_retard")g.taux=x.valeur;
        });
        setGlob(g);
      }
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setF({
      ass_avis_avant1:sel.ass_avis_avant1!==null&&sel.ass_avis_avant1!==undefined?String(sel.ass_avis_avant1):"90",
      ass_avis_avant2:sel.ass_avis_avant2!==null&&sel.ass_avis_avant2!==undefined?String(sel.ass_avis_avant2):"30",
      ass_avis_apres:sel.ass_avis_apres!==null&&sel.ass_avis_apres!==undefined?String(sel.ass_avis_apres):"15",
      ass_nc_auto:!!sel.ass_nc_auto,
      ass_nc_delai:sel.ass_nc_delai!==null&&sel.ass_nc_delai!==undefined?String(sel.ass_nc_delai):"30",
      approb_seuil:sel.approb_seuil!==null&&sel.approb_seuil!==undefined?String(sel.approb_seuil):"0",
      approb_nb_max:sel.approb_nb_max?String(sel.approb_nb_max):"3",
      quorum_ago:sel.quorum_ago?String(sel.quorum_ago):"50"
    });
    try{
      var pl=JSON.parse(sel.approb_paliers||"");
      if(Array.isArray(pl)&&pl.length>0)setPaliers(pl.slice(0,3).map(function(x){return {max:String(x.max),nb:String(x.nb)};}));
    }catch(e){}
  },[sel&&sel.id]);

  function majPalier(i,k,v){
    setPaliers(function(pr){var n=pr.slice();n[i]=Object.assign({},n[i]);n[i][k]=v;return n;});
  }

  function sf(k,v){setF(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function sauvegarder(){
    if(!sel||saving)return;
    setSaving(true);setErr("");setMsg("");
    var maj={
      ass_avis_avant1:parseInt(f.ass_avis_avant1)||90,
      ass_avis_avant2:parseInt(f.ass_avis_avant2)||30,
      ass_avis_apres:parseInt(f.ass_avis_apres)||15,
      ass_nc_auto:!!f.ass_nc_auto,
      ass_nc_delai:parseInt(f.ass_nc_delai)||30,
      approb_seuil:parseFloat(f.approb_seuil)||0,
      approb_nb_max:Math.max(1,parseInt(f.approb_nb_max)||3),
      approb_paliers:JSON.stringify(paliers.filter(function(x){return parseFloat(x.max)>0;}).map(function(x){return {max:parseFloat(x.max)||0,nb:Math.max(1,parseInt(x.nb)||1)};}).sort(function(a,b){return a.max-b.max;})),
      approb_requises:Math.max(1,parseInt(paliers[0]&&paliers[0].nb)||1),
      quorum_ago:parseInt(f.quorum_ago)||50
    };
    sb.update("syndicats",sel.id,maj).then(function(r){
      if(r&&r.error){setSaving(false);setErr("ECHEC de la sauvegarde: "+(r.error.message||"les colonnes ass_avis_* existent-elles? (SQL fourni)"));return;}
      return sb.upsert("config_publique",[
        {cle:"delai_convocation_jours",valeur:String(parseInt(glob.delaiConv)||15)},
        {cle:"taux_interet_retard",valeur:String(parseFloat(glob.taux)||0)}
      ],"cle").then(function(){
        setSaving(false);
        setSel(Object.assign({},sel,maj));
        setMsg("Configuration sauvegardee pour "+sel.nom+".");
        sb.log("configuration","modification","Configuration du syndicat mise a jour (avis assurance "+maj.ass_avis_avant1+"/"+maj.ass_avis_avant2+"/+"+maj.ass_avis_apres+"j"+(maj.ass_nc_auto?", NC auto "+maj.ass_nc_delai+"j":"")+", approbation par paliers, quorum "+maj.quorum_ago+"%)","",sel.code||"");
        setTimeout(function(){setMsg("");},5000);
      });
    }).catch(function(e){setSaving(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat - creez d abord un syndicat via Configuration Predictek.</div>;
  if(!sel)return null;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Configuration du syndicat</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Toutes les regles configurables au meme endroit</div>
        </div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{marginLeft:"auto"}}>
          <Btn onClick={sauvegarder} dis={saving}>{saving?"Sauvegarde...":"Sauvegarder la configuration"}</Btn>
        </div>
      </div>

      <div style={{padding:20,maxWidth:980}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <Carte titre="Avis d assurance des unites" desc="Chaque unite doit fournir sa preuve d assurance. Le moteur de relances envoie automatiquement les avis par courriel selon ces delais; le coproprietaire transmet son certificat via son portail.">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
            <div><Lbl l="1er avis AVANT l echeance (jours)"/><input type="number" min="0" value={f.ass_avis_avant1||""} onChange={function(e){sf("ass_avis_avant1",e.target.value);}} style={INP}/></div>
            <div><Lbl l="2e avis AVANT l echeance (jours)"/><input type="number" min="0" value={f.ass_avis_avant2||""} onChange={function(e){sf("ass_avis_avant2",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Relance APRES l echeance (jours)"/><input type="number" min="0" value={f.ass_avis_apres||""} onChange={function(e){sf("ass_avis_apres",e.target.value);}} style={INP}/></div>
          </div>
          <div style={{display:"flex",gap:14,alignItems:"flex-end",flexWrap:"wrap",background:f.ass_nc_auto?T.amberL:T.alt,borderRadius:10,padding:12}}>
            <div>
              <Lbl l="Avis de non-conformite AUTOMATIQUE si non fournie"/>
              <button onClick={function(){sf("ass_nc_auto",!f.ass_nc_auto);}} style={{background:f.ass_nc_auto?T.amberL:T.alt,border:"2px solid "+(f.ass_nc_auto?T.amber:T.border),borderRadius:20,padding:"6px 16px",fontSize:11,fontWeight:800,color:f.ass_nc_auto?T.amber:T.muted,cursor:"pointer",fontFamily:"inherit"}}>{f.ass_nc_auto?"ACTIF":"Inactif"}</button>
            </div>
            {f.ass_nc_auto&&<div style={{width:220}}><Lbl l="Delai pour corriger sur l avis (jours)"/><input type="number" min="1" value={f.ass_nc_delai||""} onChange={function(e){sf("ass_nc_delai",e.target.value);}} style={INP}/></div>}
            <div style={{fontSize:10,color:T.muted,flex:1,minWidth:220}}>Si la preuve n est toujours pas fournie apres la relance post-echeance, un avis de non-conformite est cree automatiquement (module Avis de non-conformite). Activez seulement si votre reglement de l immeuble l exige et le permet.</div>
          </div>
        </Carte>

        <Carte titre="Approbation des factures - PAR PALIERS" desc="En dessous du seuil d approbation automatique, la facture est approuvee sans intervention. Au-dela, le nombre d approbations du CA requis depend du montant (avis courriel automatique aux membres du CA).">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
            <div><Lbl l="Approbation AUTOMATIQUE en dessous de ($)"/><input type="number" step="0.01" min="0" value={f.approb_seuil||""} onChange={function(e){sf("approb_seuil",e.target.value);}} style={INP} placeholder="0 = tout requiert approbation"/></div>
          </div>
          <table style={{width:"100%",maxWidth:520,borderCollapse:"collapse",fontSize:12,marginBottom:8}}>
            <thead><tr style={{background:T.alt}}>
              <th style={{padding:"6px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>Palier (montant et moins)</th>
              <th style={{padding:"6px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>Approbations requises</th>
            </tr></thead>
            <tbody>
              {paliers.map(function(pl,i){return(
                <tr key={i} style={{borderTop:"1px solid "+T.border}}>
                  <td style={{padding:"6px 10px"}}><input type="number" step="0.01" min="0" value={pl.max} onChange={function(e){majPalier(i,"max",e.target.value);}} style={INP} placeholder={i===0?"1000":i===1?"5000":"10000"}/></td>
                  <td style={{padding:"6px 10px"}}><input type="number" min="1" max="9" value={pl.nb} onChange={function(e){majPalier(i,"nb",e.target.value);}} style={INP}/></td>
                </tr>
              );})}
              <tr style={{borderTop:"1px solid "+T.border,background:T.amberL}}>
                <td style={{padding:"6px 10px",fontWeight:700,color:T.amber}}>AU-DELA du dernier palier</td>
                <td style={{padding:"6px 10px"}}><input type="number" min="1" max="9" value={f.approb_nb_max||""} onChange={function(e){sf("approb_nb_max",e.target.value);}} style={INP}/></td>
              </tr>
            </tbody>
          </table>
          <div style={{fontSize:10,color:T.muted}}>Exemple: 1000 $ et moins = 1 approbation; 5000 $ et moins = 2; 10 000 $ et moins = 3; au-dela = le nombre au-dela.</div>
        </Carte>

        <Carte titre="Assemblees" desc="Quorum requis aux assemblees (selon votre declaration de copropriete) et delai minimal de convocation.">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <div><Lbl l="Quorum AGO (%)"/><input type="number" min="10" max="90" value={f.quorum_ago||""} onChange={function(e){sf("quorum_ago",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Delai de convocation (jours) - global"/><input type="number" min="1" value={glob.delaiConv} onChange={function(e){setGlob(Object.assign({},glob,{delaiConv:e.target.value}));}} style={INP}/></div>
          </div>
        </Carte>

        <Carte titre="Interets sur les arrerages" desc="Taux annuel applique au calcul des arrerages dans Encaissements (selon votre declaration de copropriete).">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <div><Lbl l="Taux d interet annuel (%) - global"/><input type="number" step="0.01" min="0" value={glob.taux} onChange={function(e){setGlob(Object.assign({},glob,{taux:e.target.value}));}} style={INP}/></div>
          </div>
        </Carte>

        <Carte titre="Autres configurations" desc="Regles gerees dans leurs modules respectifs - acces direct.">
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){if(p&&p.onNavigate)p.onNavigate("plancomptable");}}>Plan comptable du syndicat</Btn>
            <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){if(p&&p.onNavigate)p.onNavigate("banques");}}>Comptes bancaires par fonds</Btn>
            <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){if(p&&p.onNavigate)p.onNavigate("fondsview");}}>Comptabilite par fonds</Btn>
          </div>
          <div style={{fontSize:10,color:T.muted,marginTop:10}}>Les intervalles des etudes (assurance, prevoyance) et le logo se configurent dans Predictek - Configuration - Parametres. Les informations du syndicat (adresse, courriels, exercice) aussi.</div>
        </Carte>
      </div>
    </div>
  );
}
