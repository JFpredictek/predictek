
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var CATEGORIES_REVENUS=["Cotisations ordinaires","Cotisations fonds prevoyance","Interets bancaires","Revenus divers"];
var CATEGORIES_DEPENSES=["Administration","Entretien et reparations","Nettoyage","Deneigement","Electricite","Assurances","Honoraires professionnels","Securite","Amenagement paysager","Gestion immobiliere","Frais bancaires","Autres depenses"];

function TabBudget(p){
  var syndicat=p.syndicat;
  var s0=useState([]);var budgets=s0[0];var setBudgets=s0[1];
  var s1=useState(null);var selBudget=s1[0];var setSelBudget=s1[1];
  var s2=useState([]);var lignes=s2[0];var setLignes=s2[1];
  var s3=useState(false);var showNew=s3[0];var setShowNew=s3[1];
  var s4=useState({annee_debut:new Date().getFullYear(),annee_fin:new Date().getFullYear()+1});var newB=s4[0];var setNewB=s4[1];

  useEffect(function(){
    if(!syndicat)return;
    sb.select("budgets",{eq:{syndicat_id:syndicat.id},order:"annee_debut.desc"}).then(function(res){
      if(res&&res.data){setBudgets(res.data);if(res.data.length>0)setSelBudget(res.data[0]);}
    }).catch(function(){});
  },[syndicat]);

  useEffect(function(){
    if(!selBudget)return;
    sb.select("budget_lignes",{eq:{budget_id:selBudget.id},order:"type_ligne.asc"}).then(function(res){
      if(res&&res.data)setLignes(res.data);
    }).catch(function(){});
  },[selBudget]);

  function creerBudget(){
    if(!syndicat)return;
    var row={syndicat_id:syndicat.id,annee_debut:parseInt(newB.annee_debut),annee_fin:parseInt(newB.annee_fin),statut:"brouillon",total_revenus:0,total_depenses:0,fonds_prevoyance:0};
    sb.insert("budgets",row).then(function(res){
      if(res&&res.data){
        setBudgets(function(prev){return [res.data].concat(prev);});
        setSelBudget(res.data);
        setShowNew(false);
        // Creer les lignes par defaut
        var lignesDefaut=[];
        CATEGORIES_REVENUS.forEach(function(c){lignesDefaut.push({budget_id:res.data.id,categorie:c,montant_prevu:0,montant_reel:0,type_ligne:"revenu"});});
        CATEGORIES_DEPENSES.forEach(function(c){lignesDefaut.push({budget_id:res.data.id,categorie:c,montant_prevu:0,montant_reel:0,type_ligne:"depense"});});
        Promise.all(lignesDefaut.map(function(l){return sb.insert("budget_lignes",l);})).then(function(results){
          var newL=results.filter(function(r){return r&&r.data;}).map(function(r){return r.data;});
          setLignes(newL);
        }).catch(function(){});
      }
    }).catch(function(){});
  }

  function updateLigne(id, field, val){
    var v=parseFloat(val)||0;
    sb.update("budget_lignes",id,field==="montant_prevu"?{montant_prevu:v}:{montant_reel:v}).then(function(){
      setLignes(function(prev){return prev.map(function(l){
        if(l.id!==id)return l;
        return field==="montant_prevu"?Object.assign({},l,{montant_prevu:v}):Object.assign({},l,{montant_reel:v});
      });});
    }).catch(function(){});
  }

  function imprimer(){
    if(!selBudget)return;
    var totalPrev=lignes.reduce(function(a,l){return l.type_ligne==="depense"?a+Number(l.montant_prevu):a;},0);
    var totalReel=lignes.reduce(function(a,l){return l.type_ligne==="depense"?a+Number(l.montant_reel):a;},0);
    var totalRevPrev=lignes.reduce(function(a,l){return l.type_ligne==="revenu"?a+Number(l.montant_prevu):a;},0);
    var win=window.open("","_blank");
    var rows=lignes.map(function(l){return "<tr><td>"+l.categorie+"</td><td style='text-align:right'>"+Number(l.montant_prevu).toFixed(2)+" $</td><td style='text-align:right'>"+Number(l.montant_reel).toFixed(2)+" $</td><td style='text-align:right;color:"+(Number(l.montant_reel)>Number(l.montant_prevu)?"#B83232":"#1B5E3B")+"'>"+(Number(l.montant_reel)-Number(l.montant_prevu)).toFixed(2)+" $</td></tr>";}).join("");
    win.document.write("<html><head><title>Budget</title><style>body{font-family:Arial,sans-serif;margin:20px}h2{color:#13233A}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background:#f0f0f0}.t{font-weight:bold;background:#e8f2ec}</style></head><body><h2>Budget "+selBudget.annee_debut+"-"+selBudget.annee_fin+"</h2><p><b>Syndicat:</b> "+(syndicat?syndicat.nom:"")+" | <b>Statut:</b> "+selBudget.statut+"</p><table><thead><tr><th>Categorie</th><th>Prevu</th><th>Reel</th><th>Ecart</th></tr></thead><tbody>"+rows+"<tr class='t'><td>TOTAL DEPENSES</td><td style='text-align:right'>"+totalPrev.toFixed(2)+" $</td><td style='text-align:right'>"+totalReel.toFixed(2)+" $</td><td style='text-align:right'>"+(totalReel-totalPrev).toFixed(2)+" $</td></tr><tr class='t'><td>TOTAL REVENUS PREVUS</td><td style='text-align:right'>"+totalRevPrev.toFixed(2)+" $</td><td></td><td></td></tr></tbody></table></body></html>");
    win.document.close();win.print();
  }

  var revenus=lignes.filter(function(l){return l.type_ligne==="revenu";});
  var depenses=lignes.filter(function(l){return l.type_ligne==="depense";});
  var prevoyance=lignes.filter(function(l){return l.type_ligne==="prevoyance";});
  var totalRevPrev=revenus.reduce(function(a,l){return a+Number(l.montant_prevu);},0);
  var totalDepPrev=depenses.reduce(function(a,l){return a+Number(l.montant_prevu);},0);
  var totalDepReel=depenses.reduce(function(a,l){return a+Number(l.montant_reel);},0);
  var solde=totalRevPrev-totalDepPrev;

  function renderLignes(lst, titre, couleur){
    return(
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:700,color:couleur,background:couleur+"11",border:"1px solid "+couleur+"33",borderRadius:8,padding:"8px 14px",marginBottom:8}}>{titre}</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:T.alt}}>
            <th style={{padding:"7px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>Categorie</th>
            <th style={{padding:"7px 10px",textAlign:"right",fontWeight:600,color:T.navy}}>Prevu ($)</th>
            <th style={{padding:"7px 10px",textAlign:"right",fontWeight:600,color:T.navy}}>Reel ($)</th>
            <th style={{padding:"7px 10px",textAlign:"right",fontWeight:600,color:T.navy}}>Ecart ($)</th>
          </tr></thead>
          <tbody>
            {lst.map(function(l){
              var ecart=Number(l.montant_reel)-Number(l.montant_prevu);
              return(<tr key={l.id} style={{borderBottom:"1px solid "+T.border}}>
                <td style={{padding:"7px 10px"}}>{l.categorie}</td>
                <td style={{padding:"7px 10px",textAlign:"right"}}><input type="number" value={l.montant_prevu} onChange={function(e){updateLigne(l.id,"montant_prevu",e.target.value);}} style={{width:100,border:"1px solid "+T.border,borderRadius:5,padding:"3px 6px",fontSize:12,textAlign:"right",fontFamily:"inherit"}}/></td>
                <td style={{padding:"7px 10px",textAlign:"right"}}><input type="number" value={l.montant_reel} onChange={function(e){updateLigne(l.id,"montant_reel",e.target.value);}} style={{width:100,border:"1px solid "+T.border,borderRadius:5,padding:"3px 6px",fontSize:12,textAlign:"right",fontFamily:"inherit"}}/></td>
                <td style={{padding:"7px 10px",textAlign:"right",fontWeight:600,color:ecart>0?T.red:ecart<0?T.accent:T.muted}}>{ecart.toFixed(2)} $</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return(
    <div>
      <div style={{display:"flex",gap:12,alignItems:"flex-end",marginBottom:16,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <Lbl l="Exercice financier"/>
          <select value={selBudget?selBudget.id:""} onChange={function(e){var b=budgets.find(function(x){return x.id===e.target.value;});if(b)setSelBudget(b);}} style={Object.assign({},INP,{width:220})}>
            {budgets.map(function(b){return <option key={b.id} value={b.id}>{b.annee_debut}-{b.annee_fin} ({b.statut})</option>;})}
            {budgets.length===0&&<option value="">Aucun budget</option>}
          </select>
        </div>
        <Btn onClick={function(){setShowNew(true);}}>+ Nouveau budget</Btn>
        {selBudget&&<Btn onClick={imprimer} bg={T.navy}>Imprimer</Btn>}
      </div>

      {showNew&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>Nouvel exercice financier</div>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            <div><Lbl l="Annee debut"/><input type="number" value={newB.annee_debut} onChange={function(e){setNewB(function(pr){return Object.assign({},pr,{annee_debut:e.target.value});});}} style={Object.assign({},INP,{width:120})}/></div>
            <div><Lbl l="Annee fin"/><input type="number" value={newB.annee_fin} onChange={function(e){setNewB(function(pr){return Object.assign({},pr,{annee_fin:e.target.value}});});}} style={Object.assign({},INP,{width:120})}/></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={creerBudget}>Creer le budget</Btn>
            <Btn onClick={function(){setShowNew(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
          </div>
        </div>
      )}

      {selBudget&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Total revenus prevus</div><div style={{fontSize:22,fontWeight:800,color:T.accent}}>{totalRevPrev.toFixed(0)} $</div></div>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Total depenses prevues</div><div style={{fontSize:22,fontWeight:800,color:T.navy}}>{totalDepPrev.toFixed(0)} $</div></div>
            <div style={{background:solde>=0?T.accentL:T.redL,border:"1px solid "+(solde>=0?T.accent:T.red)+"44",borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Solde prevu</div><div style={{fontSize:22,fontWeight:800,color:solde>=0?T.accent:T.red}}>{solde.toFixed(0)} $</div></div>
          </div>
          {renderLignes(revenus,"Revenus",T.accent)}
          {renderLignes(depenses,"Depenses",T.navy)}
          {prevoyance.length>0&&renderLignes(prevoyance,"Fonds de prevoyance",T.purple)}
        </div>
      )}
      {!selBudget&&budgets.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucun budget - cliquez "+ Nouveau budget" pour commencer</div>}
    </div>
  );
}

function TabJournal(p){
  var syndicat=p.syndicat;
  var s0=useState([]);var journal=s0[0];var setJournal=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({date_transaction:new Date().toISOString().substring(0,10),description:"",categorie:"Administration",montant_debit:0,montant_credit:0,reference:""});var nf=s2[0];var setNf=s2[1];

  useEffect(function(){
    if(!syndicat)return;
    sb.select("journal",{eq:{syndicat_id:syndicat.id},order:"date_transaction.desc",limit:100}).then(function(res){
      if(res&&res.data)setJournal(res.data);
    }).catch(function(){});
  },[syndicat]);

  function setN(k,v){setNf(function(pr){
    if(k==="date_transaction")return Object.assign({},pr,{date_transaction:v});
    if(k==="description")return Object.assign({},pr,{description:v});
    if(k==="categorie")return Object.assign({},pr,{categorie:v});
    if(k==="montant_debit")return Object.assign({},pr,{montant_debit:v});
    if(k==="montant_credit")return Object.assign({},pr,{montant_credit:v});
    if(k==="reference")return Object.assign({},pr,{reference:v});
    return pr;
  });}

  function ajouter(){
    if(!nf.description||!syndicat)return;
    var row={syndicat_id:syndicat.id,date_transaction:nf.date_transaction,description:nf.description,categorie:nf.categorie,montant_debit:parseFloat(nf.montant_debit)||0,montant_credit:parseFloat(nf.montant_credit)||0,reference:nf.reference};
    sb.insert("journal",row).then(function(res){
      if(res&&res.data)setJournal(function(prev){return [res.data].concat(prev);});
      setShowN(false);setNf({date_transaction:new Date().toISOString().substring(0,10),description:"",categorie:"Administration",montant_debit:0,montant_credit:0,reference:""});
    }).catch(function(){});
  }

  var totalDebit=journal.reduce(function(a,j){return a+Number(j.montant_debit);},0);
  var totalCredit=journal.reduce(function(a,j){return a+Number(j.montant_credit);},0);

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:T.navy}}>Journal des transactions</div>
          <div style={{fontSize:11,color:T.muted}}>{journal.length} transactions</div>
        </div>
        <Btn onClick={function(){setShowN(true);}}>+ Ajouter</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={{background:T.redL,border:"1px solid "+T.red+"44",borderRadius:10,padding:14}}><div style={{fontSize:11,color:T.muted}}>Total debits</div><div style={{fontSize:20,fontWeight:800,color:T.red}}>{totalDebit.toFixed(2)} $</div></div>
        <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:10,padding:14}}><div style={{fontSize:11,color:T.muted}}>Total credits</div><div style={{fontSize:20,fontWeight:800,color:T.accent}}>{totalCredit.toFixed(2)} $</div></div>
      </div>
      {showN&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20,marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div><Lbl l="Date"/><input type="date" value={nf.date_transaction} onChange={function(e){setN("date_transaction",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Categorie"/><select value={nf.categorie} onChange={function(e){setN("categorie",e.target.value);}} style={INP}>{CATEGORIES_DEPENSES.map(function(c){return <option key={c}>{c}</option>;})}</select></div>
            <div style={{gridColumn:"1/-1"}}><Lbl l="Description"/><input value={nf.description} onChange={function(e){setN("description",e.target.value);}} style={INP} placeholder="Description de la transaction..."/></div>
            <div><Lbl l="Debit ($)"/><input type="number" step="0.01" value={nf.montant_debit} onChange={function(e){setN("montant_debit",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Credit ($)"/><input type="number" step="0.01" value={nf.montant_credit} onChange={function(e){setN("montant_credit",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Reference"/><input value={nf.reference} onChange={function(e){setN("reference",e.target.value);}} style={INP} placeholder="No facture, cheque..."/></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={ajouter} dis={!nf.description}>Ajouter</Btn>
            <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
          </div>
        </div>
      )}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:T.alt}}>
            {["Date","Description","Categorie","Debit","Credit","Reference"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>{h}</th>;})}
          </tr></thead>
          <tbody>
            {journal.map(function(j){return(<tr key={j.id} style={{borderBottom:"1px solid "+T.border}}>
              <td style={{padding:"8px 10px",color:T.muted,whiteSpace:"nowrap"}}>{j.date_transaction}</td>
              <td style={{padding:"8px 10px"}}>{j.description}</td>
              <td style={{padding:"8px 10px",color:T.muted}}>{j.categorie}</td>
              <td style={{padding:"8px 10px",color:T.red,fontWeight:600,textAlign:"right"}}>{Number(j.montant_debit)>0?Number(j.montant_debit).toFixed(2)+" $":""}</td>
              <td style={{padding:"8px 10px",color:T.accent,fontWeight:600,textAlign:"right"}}>{Number(j.montant_credit)>0?Number(j.montant_credit).toFixed(2)+" $":""}</td>
              <td style={{padding:"8px 10px",color:T.muted}}>{j.reference}</td>
            </tr>);})}
            {journal.length===0&&<tr><td colSpan={6} style={{padding:20,textAlign:"center",color:T.muted}}>Aucune transaction</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BudgetCompta(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState("budget");var ong=s2[0];var setOng=s2[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  var TABS=[{id:"budget",l:"Budget"},{id:"journal",l:"Journal"}];

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:"#7C7568"}}>Aucun syndicat. Creez d abord un syndicat dans Predictek.</div>;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Budget et comptabilite</div>
        <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
          {TABS.map(function(t){var a=ong===t.id;return <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",padding:"6px 14px",color:a?"#fff":"#8da0bb",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:400}}>{t.l}</button>;})}
        </div>
      </div>
      <div style={{padding:20}}>
        {ong==="budget"&&<TabBudget syndicat={sel}/>}
        {ong==="journal"&&<TabJournal syndicat={sel}/>}
      </div>
    </div>
  );
}
