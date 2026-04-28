
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var TYPES_ASS=[
  {id:"immeuble",l:"Assurance immeuble",desc:"Batiment + parties communes"},
  {id:"responsabilite",l:"Responsabilite civile CA",desc:"Protection administrateurs"},
  {id:"erreurs",l:"Erreurs et omissions",desc:"Fautes des administrateurs"},
  {id:"chaudiere",l:"Chaudiere et machinerie",desc:"Equipements mecaniques"},
  {id:"administrateurs",l:"Administrateurs et dirigeants",desc:"D&O Insurance"},
  {id:"autre",l:"Autre couverture",desc:""},
];

var VIDE_ASS={type_ass:"immeuble",cie:"",no_police:"",courtier:"",tel_courtier:"",courriel_courtier:"",montant_couverture:"",franchise:"",prime_annuelle:"",date_debut:"",date_fin:"",notes:""};

function CarteAssurance(p){
  var a=p.ass;
  var today=new Date();
  var exp=a.date_fin?new Date(a.date_fin):null;
  var jours=exp?Math.round((exp-today)/(1000*60*60*24)):null;
  var urgent=jours!==null&&jours<60;
  var type=TYPES_ASS.find(function(t){return t.id===a.type_ass;})||{l:a.type_ass,desc:""};
  return(
    <div style={{background:T.surface,border:"2px solid "+(urgent?T.amber:T.border),borderRadius:12,padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
            <div style={{background:urgent?T.amberL:T.blueL,border:"1px solid "+(urgent?T.amber:T.blue)+"44",borderRadius:8,padding:"6px 12px"}}>
              <div style={{fontSize:11,fontWeight:700,color:urgent?T.amber:T.blue}}>{type.l}</div>
              <div style={{fontSize:10,color:T.muted}}>{type.desc}</div>
            </div>
            {urgent&&<span style={{background:T.amberL,color:T.amber,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{jours<=0?"EXPIREE":"Renouvellement dans "+jours+"j"}</span>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,fontSize:11}}>
            <div><span style={{color:T.muted}}>Compagnie: </span><span style={{fontWeight:600,color:T.navy}}>{a.cie||"-"}</span></div>
            <div><span style={{color:T.muted}}>No police: </span><span style={{fontWeight:600,color:T.navy}}>{a.no_police||"-"}</span></div>
            <div><span style={{color:T.muted}}>Courtier: </span><span>{a.courtier||"-"}</span></div>
            <div><span style={{color:T.muted}}>Couverture: </span><span style={{fontWeight:700,color:T.accent}}>{a.montant_couverture?Number(a.montant_couverture).toLocaleString("fr-CA")+" $":"-"}</span></div>
            <div><span style={{color:T.muted}}>Franchise: </span><span>{a.franchise?Number(a.franchise).toLocaleString("fr-CA")+" $":"-"}</span></div>
            <div><span style={{color:T.muted}}>Prime: </span><span style={{fontWeight:600,color:T.navy}}>{a.prime_annuelle?Number(a.prime_annuelle).toLocaleString("fr-CA")+" $/an":"-"}</span></div>
            <div><span style={{color:T.muted}}>Debut: </span><span>{a.date_debut||"-"}</span></div>
            <div><span style={{color:urgent?T.amber:T.muted,fontWeight:urgent?700:400}}>Expiration: </span><span style={{color:urgent?T.amber:T.navy,fontWeight:urgent?700:400}}>{a.date_fin||"-"}</span></div>
            {a.tel_courtier&&<div><span style={{color:T.muted}}>Tel: </span><span>{a.tel_courtier}</span></div>}
          </div>
          {a.notes&&<div style={{fontSize:11,color:T.muted,marginTop:8,fontStyle:"italic"}}>{a.notes}</div>}
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:12}}>
          <Btn sm onClick={function(){p.onEdit(a);}}>Modifier</Btn>
          <Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){p.onDelete(a.id);}}>Retirer</Btn>
        </div>
      </div>
    </div>
  );
}

function FormAssurance(p){
  var nf=p.nf;var sf=p.setField;
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={{gridColumn:"1/-1"}}><Lbl l="Type de couverture"/><select value={nf.type_ass} onChange={function(e){sf("type_ass",e.target.value);}} style={INP}>{TYPES_ASS.map(function(t){return <option key={t.id} value={t.id}>{t.l}</option>;})}</select></div>
      <div><Lbl l="Compagnie d assurance"/><input value={nf.cie||""} onChange={function(e){sf("cie",e.target.value);}} style={INP} placeholder="Intact, Desjardins..."/></div>
      <div><Lbl l="No de police"/><input value={nf.no_police||""} onChange={function(e){sf("no_police",e.target.value);}} style={INP} placeholder="HO-123456"/></div>
      <div><Lbl l="Nom du courtier"/><input value={nf.courtier||""} onChange={function(e){sf("courtier",e.target.value);}} style={INP} placeholder="Nom du courtier..."/></div>
      <div><Lbl l="Tel courtier"/><input value={nf.tel_courtier||""} onChange={function(e){sf("tel_courtier",e.target.value);}} style={INP} placeholder="418-555-0000"/></div>
      <div><Lbl l="Courriel courtier"/><input value={nf.courriel_courtier||""} onChange={function(e){sf("courriel_courtier",e.target.value);}} style={INP} placeholder="courtier@assurance.ca"/></div>
      <div><Lbl l="Montant couverture ($)"/><input type="number" step="10000" value={nf.montant_couverture||""} onChange={function(e){sf("montant_couverture",e.target.value);}} style={INP} placeholder="5000000"/></div>
      <div><Lbl l="Franchise ($)"/><input type="number" step="500" value={nf.franchise||""} onChange={function(e){sf("franchise",e.target.value);}} style={INP} placeholder="2500"/></div>
      <div><Lbl l="Prime annuelle ($)"/><input type="number" step="100" value={nf.prime_annuelle||""} onChange={function(e){sf("prime_annuelle",e.target.value);}} style={INP} placeholder="12000"/></div>
      <div><Lbl l="Vide"/></div>
      <div><Lbl l="Date debut"/><input type="date" value={nf.date_debut||""} onChange={function(e){sf("date_debut",e.target.value);}} style={INP}/></div>
      <div><Lbl l="Date expiration"/><input type="date" value={nf.date_fin||""} onChange={function(e){sf("date_fin",e.target.value);}} style={INP}/></div>
      <div style={{gridColumn:"1/-1"}}><Lbl l="Notes"/><textarea value={nf.notes||""} onChange={function(e){sf("notes",e.target.value);}} style={Object.assign({},INP,{minHeight:50,resize:"vertical"})} placeholder="Observations, exclusions importantes..."/></div>
    </div>
  );
}

export default function ModuleAssurances(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var assurances=s2[0];var setAssurances=s2[1];
  var s3=useState(false);var showForm=s3[0];var setShowForm=s3[1];
  var s4=useState(VIDE_ASS);var nf=s4[0];var setNf=s4[1];
  var s5=useState(null);var editId=s5[0];var setEditId=s5[1];
  var s6=useState(false);var saving=s6[0];var setSaving=s6[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setAssurances([]);
    sb.select("documents",{eq:{syndicat_id:sel.id,type_doc:"assurance"},order:"created_at.desc"}).then(function(res){
      if(res&&res.data)setAssurances(res.data.map(function(d){
        try{return Object.assign(JSON.parse(d.url||"{}"),{id:d.id});}catch(e){return {id:d.id,type_ass:"autre",cie:d.nom};}
      }));
    }).catch(function(){});
  },[sel]);

  function setField(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function sauvegarder(){
    if(!nf.cie||!sel)return;
    setSaving(true);
    var contenu=JSON.stringify(nf);
    var type=TYPES_ASS.find(function(t){return t.id===nf.type_ass;})||{l:nf.type_ass};
    var row={niveau:"syndicat",syndicat_id:sel.id,nom:type.l+" - "+nf.cie+(nf.no_police?" ("+nf.no_police+")":""),type_doc:"assurance",description:nf.cie,date_doc:nf.date_fin||null,url:contenu};
    var op=editId?sb.update("documents",editId,row):sb.insert("documents",row);
    op.then(function(res){
      if(editId){
        setAssurances(function(prev){return prev.map(function(a){return a.id===editId?Object.assign({},nf,{id:editId}):a;});});
      }else if(res&&res.data){
        setAssurances(function(prev){return [Object.assign({},nf,{id:res.data.id})].concat(prev);});
      }
      sb.log("assurances","ajout",(editId?"Modification":"Ajout")+" assurance: "+nf.cie+" - "+type.l,"",sel.code||"");
      setShowForm(false);setNf(VIDE_ASS);setEditId(null);setSaving(false);
    }).catch(function(){setSaving(false);});
  }

  function editer(a){setNf({type_ass:a.type_ass||"immeuble",cie:a.cie||"",no_police:a.no_police||"",courtier:a.courtier||"",tel_courtier:a.tel_courtier||"",courriel_courtier:a.courriel_courtier||"",montant_couverture:a.montant_couverture||"",franchise:a.franchise||"",prime_annuelle:a.prime_annuelle||"",date_debut:a.date_debut||"",date_fin:a.date_fin||"",notes:a.notes||""});setEditId(a.id);setShowForm(true);}

  function supprimer(id){
    sb.delete("documents",id).then(function(){setAssurances(function(prev){return prev.filter(function(a){return a.id!==id;});});}).catch(function(){});
  }

  var today=new Date();
  var urgentes=assurances.filter(function(a){if(!a.date_fin)return false;var j=Math.round((new Date(a.date_fin)-today)/(1000*60*60*24));return j<60;});
  var totalPrimes=assurances.reduce(function(acc,a){return acc+Number(a.prime_annuelle||0);},0);

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Assurances syndicat</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{marginLeft:"auto"}}><Btn onClick={function(){setNf(VIDE_ASS);setEditId(null);setShowForm(true);}}>+ Ajouter police</Btn></div>
      </div>

      <div style={{padding:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Polices actives</div><div style={{fontSize:26,fontWeight:800,color:T.navy}}>{assurances.length}</div></div>
          <div style={{background:urgentes.length>0?T.amberL:T.surface,border:"1px solid "+(urgentes.length>0?T.amber+"44":T.border),borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>A renouveler bientot</div><div style={{fontSize:26,fontWeight:800,color:urgentes.length>0?T.amber:T.muted}}>{urgentes.length}</div></div>
          <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Total primes annuelles</div><div style={{fontSize:20,fontWeight:800,color:T.accent}}>{totalPrimes.toLocaleString("fr-CA")} $</div></div>
        </div>

        {showForm&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>{editId?"Modifier la police":"Nouvelle police d assurance"}</div>
            <FormAssurance nf={nf} setField={setField}/>
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <Btn onClick={sauvegarder} dis={saving||!nf.cie}>{saving?"Sauvegarde...":"Sauvegarder"}</Btn>
              <Btn onClick={function(){setShowForm(false);setEditId(null);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}

        {urgentes.length>0&&(
          <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:12,padding:14,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:8}}>Renouvellements urgents</div>
            {urgentes.map(function(a){var j=Math.round((new Date(a.date_fin)-today)/(1000*60*60*24));return <div key={a.id} style={{fontSize:12,marginBottom:4}}><b>{a.cie}</b> - expire {j<=0?"le "+a.date_fin:"dans "+j+" jours"}</div>;})}
          </div>
        )}

        {assurances.map(function(a){return <CarteAssurance key={a.id} ass={a} onEdit={editer} onDelete={supprimer}/>;})}
        {assurances.length===0&&!showForm&&(
          <div style={{textAlign:"center",padding:40,color:T.muted,fontSize:12}}>Aucune police d assurance enregistree - cliquez "+ Ajouter police"</div>
        )}
      </div>
    </div>
  );
}
