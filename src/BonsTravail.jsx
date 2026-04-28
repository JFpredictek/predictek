
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var STATUTS_BT={nouveau:{l:"Nouveau",bg:"#EFF6FF",tc:"#1A56DB"},soumis:{l:"Soumis",bg:"#FEF3E2",tc:"#B86020"},approuve:{l:"Approuve",bg:"#D4EDDA",tc:"#155724"},en_cours:{l:"En cours",bg:"#E8F2EC",tc:"#1B5E3B"},termine:{l:"Termine",bg:"#D4EDDA",tc:"#155724"},annule:{l:"Annule",bg:"#F0EDE8",tc:"#7C7568"}};
var PRIORITES={basse:{l:"Basse",c:"#7C7568"},normale:{l:"Normale",c:"#1A56DB"},haute:{l:"Haute",c:"#B86020"},urgente:{l:"Urgente",c:"#B83232"}};

function CardBon(p){
  var b=p.bon;
  var s=STATUTS_BT[b.statut]||STATUTS_BT.nouveau;
  var prio=PRIORITES[b.priorite]||PRIORITES.normale;
  return(
    <div style={{background:T.surface,border:"1px solid "+(b.priorite==="urgente"?T.red:T.border),borderRadius:12,padding:16,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
            <span style={{background:s.bg,color:s.tc,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{s.l}</span>
            <span style={{fontSize:11,fontWeight:700,color:prio.c}}>Priorite: {prio.l}</span>
            {b.no_bon&&<span style={{fontSize:10,color:T.muted}}>No: {b.no_bon}</span>}
          </div>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>{b.titre}</div>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>{b.description}</div>
          <div style={{display:"flex",gap:12,fontSize:11,color:T.muted,flexWrap:"wrap"}}>
            {b.fournisseur_nom&&<span>Fournisseur: <b style={{color:T.navy}}>{b.fournisseur_nom}</b></span>}
            {b.unite&&<span>Unite: <b style={{color:T.navy}}>{b.unite}</b></span>}
            {b.date_debut&&<span>Debut: {b.date_debut}</span>}
            {b.cout_estime&&<span>Cout: <b style={{color:T.accent}}>{Number(b.cout_estime).toFixed(2)} $</b></span>}
            {b.cout_final&&<span>Final: <b style={{color:T.navy}}>{Number(b.cout_final).toFixed(2)} $</b></span>}
          </div>
          {b.notes&&<div style={{fontSize:11,color:T.muted,marginTop:6,fontStyle:"italic"}}>{b.notes}</div>}
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:12,flexWrap:"wrap"}}>
          <Btn sm onClick={function(){p.onEdit(b);}}>Modifier</Btn>
          {b.statut==="nouveau"&&<Btn sm bg={T.amberL} tc={T.amber} bdr={"1px solid "+T.amber+"44"} onClick={function(){p.onChangeStatut(b.id,"soumis");}}>Soumettre</Btn>}
          {b.statut==="soumis"&&<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){p.onChangeStatut(b.id,"approuve");}}>Approuver</Btn>}
          {b.statut==="approuve"&&<Btn sm bg={T.blue} onClick={function(){p.onChangeStatut(b.id,"en_cours");}}>Demarrer</Btn>}
          {b.statut==="en_cours"&&<Btn sm onClick={function(){p.onChangeStatut(b.id,"termine");}}>Terminer</Btn>}
        </div>
      </div>
    </div>
  );
}

var VIDE_B={titre:"",description:"",priorite:"normale",statut:"nouveau",fournisseur_nom:"",unite:"",date_debut:"",date_fin:"",cout_estime:"",cout_final:"",no_bon:"",notes:""};

export default function BonsTravail(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var bons=s2[0];var setBons=s2[1];
  var s3=useState(false);var showForm=s3[0];var setShowForm=s3[1];
  var s4=useState(VIDE_B);var nf=s4[0];var setNf=s4[1];
  var s5=useState(null);var editId=s5[0];var setEditId=s5[1];
  var s6=useState("actifs");var vue=s6[0];var setVue=s6[1];
  var s7=useState(false);var saving=s7[0];var setSaving=s7[1];
  var s8=useState([]);var fournisseurs=s8[0];var setFournisseurs=s8[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
    sb.select("fournisseurs",{eq:{actif:true},order:"nom.asc"}).then(function(res){
      if(res&&res.data)setFournisseurs(res.data);
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setBons([]);
    sb.select("bons_travail",{eq:{syndicat_id:sel.id},order:"created_at.desc"}).then(function(res){
      if(res&&res.data)setBons(res.data);
    }).catch(function(){});
  },[sel]);

  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function sauvegarder(){
    if(!nf.titre||!sel)return;
    setSaving(true);
    var no=nf.no_bon||("BT-"+new Date().getFullYear()+"-"+String(bons.length+1).padStart(3,"0"));
    var row={syndicat_id:sel.id,titre:nf.titre,description:nf.description||"",priorite:nf.priorite||"normale",statut:nf.statut||"nouveau",fournisseur_nom:nf.fournisseur_nom||"",unite:nf.unite||"",date_debut:nf.date_debut||null,date_fin:nf.date_fin||null,cout_estime:parseFloat(nf.cout_estime)||null,cout_final:parseFloat(nf.cout_final)||null,no_bon:no,notes:nf.notes||""};
    var op=editId?sb.update("bons_travail",editId,row):sb.insert("bons_travail",row);
    op.then(function(res){
      if(editId){setBons(function(prev){return prev.map(function(b){return b.id===editId?Object.assign({},b,row):b;});});}
      else if(res&&res.data){setBons(function(prev){return [res.data].concat(prev);});}
      sb.log("bons_travail",editId?"modification":"creation",(editId?"Modification":"Creation")+" bon de travail: "+nf.titre,"",sel.code||"");
      setShowForm(false);setNf(VIDE_B);setEditId(null);setSaving(false);
    }).catch(function(){setSaving(false);});
  }

  function editer(b){
    setNf({titre:b.titre||"",description:b.description||"",priorite:b.priorite||"normale",statut:b.statut||"nouveau",fournisseur_nom:b.fournisseur_nom||"",unite:b.unite||"",date_debut:b.date_debut||"",date_fin:b.date_fin||"",cout_estime:b.cout_estime||"",cout_final:b.cout_final||"",no_bon:b.no_bon||"",notes:b.notes||""});
    setEditId(b.id);setShowForm(true);
  }

  function changerStatut(id,statut){
    sb.update("bons_travail",id,{statut:statut}).then(function(){
      setBons(function(prev){return prev.map(function(b){return b.id===id?Object.assign({},b,{statut:statut}):b;});});
    }).catch(function(){});
  }

  var VUES=[{id:"actifs",l:"Actifs"},{id:"termines",l:"Termines"},{id:"tous",l:"Tous"}];
  var filtres=bons.filter(function(b){
    if(vue==="actifs")return b.statut!=="termine"&&b.statut!=="annule";
    if(vue==="termines")return b.statut==="termine";
    return true;
  });

  var totEstime=filtres.filter(function(b){return b.cout_estime;}).reduce(function(a,b){return a+Number(b.cout_estime||0);},0);
  var totFinal=filtres.filter(function(b){return b.cout_final;}).reduce(function(a,b){return a+Number(b.cout_final||0);},0);
  var urgents=bons.filter(function(b){return b.priorite==="urgente"&&b.statut!=="termine"&&b.statut!=="annule";}).length;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Bons de travail</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
          {VUES.map(function(v){var a=vue===v.id;return <button key={v.id} onClick={function(){setVue(v.id);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",padding:"6px 14px",color:a?"#fff":"#8da0bb",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:400}}>{v.l}</button>;})}
        </div>
        <Btn onClick={function(){setNf(VIDE_B);setEditId(null);setShowForm(true);}}>+ Nouveau bon</Btn>
      </div>

      <div style={{padding:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Actifs</div><div style={{fontSize:26,fontWeight:800,color:T.navy}}>{bons.filter(function(b){return b.statut!=="termine"&&b.statut!=="annule";}).length}</div></div>
          <div style={{background:urgents>0?T.redL:T.surface,border:"1px solid "+(urgents>0?T.red+"44":T.border),borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Urgents</div><div style={{fontSize:26,fontWeight:800,color:urgents>0?T.red:T.muted}}>{urgents}</div></div>
          <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Cout estime</div><div style={{fontSize:20,fontWeight:800,color:T.accent}}>{totEstime.toFixed(0)} $</div></div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Cout final</div><div style={{fontSize:20,fontWeight:800,color:T.navy}}>{totFinal.toFixed(0)} $</div></div>
        </div>

        {showForm&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>{editId?"Modifier le bon":"Nouveau bon de travail"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Titre"/><input value={nf.titre} onChange={function(e){setN("titre",e.target.value);}} style={INP} placeholder="Remplacement pompe circulatrice..."/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Description"/><textarea value={nf.description} onChange={function(e){setN("description",e.target.value);}} style={Object.assign({},INP,{minHeight:70,resize:"vertical"})} placeholder="Details des travaux requis..."/></div>
              <div><Lbl l="Priorite"/><select value={nf.priorite} onChange={function(e){setN("priorite",e.target.value);}} style={INP}>{Object.entries(PRIORITES).map(function(e){return <option key={e[0]} value={e[0]}>{e[1].l}</option>;})}</select></div>
              <div><Lbl l="Statut"/><select value={nf.statut} onChange={function(e){setN("statut",e.target.value);}} style={INP}>{Object.entries(STATUTS_BT).map(function(e){return <option key={e[0]} value={e[0]}>{e[1].l}</option>;})}</select></div>
              <div><Lbl l="Fournisseur assign-"/><select value={nf.fournisseur_nom} onChange={function(e){setN("fournisseur_nom",e.target.value);}} style={INP}><option value="">-- Choisir fournisseur --</option>{fournisseurs.map(function(f){return <option key={f.id}>{f.nom}</option>;})}</select></div>
              <div><Lbl l="Unite concernee"/><input value={nf.unite} onChange={function(e){setN("unite",e.target.value);}} style={INP} placeholder="101 ou Parties communes"/></div>
              <div><Lbl l="Date debut prevue"/><input type="date" value={nf.date_debut} onChange={function(e){setN("date_debut",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Date fin prevue"/><input type="date" value={nf.date_fin} onChange={function(e){setN("date_fin",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Cout estime ($)"/><input type="number" step="100" value={nf.cout_estime} onChange={function(e){setN("cout_estime",e.target.value);}} style={INP} placeholder="0.00"/></div>
              <div><Lbl l="Cout final ($) si connu"/><input type="number" step="0.01" value={nf.cout_final} onChange={function(e){setN("cout_final",e.target.value);}} style={INP} placeholder="0.00"/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Notes"/><textarea value={nf.notes} onChange={function(e){setN("notes",e.target.value);}} style={Object.assign({},INP,{minHeight:50,resize:"vertical"})} placeholder="Observations, acces requis..."/></div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={sauvegarder} dis={saving||!nf.titre}>{saving?"Sauvegarde...":"Sauvegarder"}</Btn>
              <Btn onClick={function(){setShowForm(false);setEditId(null);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}

        {filtres.map(function(b){return <CardBon key={b.id} bon={b} onEdit={editer} onChangeStatut={changerStatut}/>;  })}
        {filtres.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucun bon de travail dans cette categorie</div>}
      </div>
    </div>
  );
}
