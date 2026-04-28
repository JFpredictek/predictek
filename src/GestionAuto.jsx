import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",accentG:"#3CAF6E",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Card(p){return <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:p.p||16,marginBottom:p.mb||12}}>{p.children}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"6px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Badge(p){var colors={vert:{bg:"#D4EDDA",tc:"#155724"},rouge:{bg:"#F8D7DA",tc:"#721C24"},amber:{bg:"#FEF3E2",tc:"#B86020"},bleu:{bg:"#EFF6FF",tc:"#1A56DB"},gris:{bg:"#F0EDE8",tc:"#7C7568"},purple:{bg:"#F3EEFF",tc:"#6B3FA0"}};var c=colors[p.c]||colors.gris;return <span style={{background:c.bg,color:c.tc,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{p.l}</span>;}

function TabCotisations(p){
  var syndicat=p.syndicat;var copros=p.copros;
  var s0=useState([]);var cotisations=s0[0];var setCotisations=s0[1];
  var s1=useState(false);var loading=s1[0];var setLoading=s1[1];
  var s2=useState("");var msg=s2[0];var setMsg=s2[1];
  var s3=useState(new Date().getFullYear());var annee=s3[0];var setAnnee=s3[1];
  var s4=useState(String(new Date().getMonth()+1).padStart(2,"0"));var mois=s4[0];var setMois=s4[1];
  var MNOMS=["","Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"];
  useEffect(function(){
    if(!syndicat)return;
    sb.select("paiements",{eq:{syndicat_id:syndicat.id},order:"date_paiement.desc"}).then(function(res){
      if(res&&res.data)setCotisations(res.data);
    }).catch(function(){});
  },[syndicat]);
  function generer(){
    if(!syndicat||!copros||copros.length===0){setMsg("Aucun coproprietaire.");return;}
    setLoading(true);
    var dateStr=annee+"-"+mois+"-01";
    var actifs=copros.filter(function(c){return c.statut==="actif";});
    var rows=actifs.map(function(c){return {syndicat_id:syndicat.id,coproprietaire_id:c.id,date_paiement:dateStr,montant:c.cotisation_mensuelle||0,description:"Cotisation "+MNOMS[parseInt(mois)]+" "+annee,statut:"en_attente",moyen:"virement"};});
    Promise.all(rows.map(function(r){return sb.insert("paiements",r);})).then(function(results){
      var newP=results.filter(function(r){return r&&r.data;}).map(function(r){return r.data;});
      setCotisations(function(prev){return newP.concat(prev);});
      setMsg(rows.length+" cotisations generees");
      setLoading(false);
      setTimeout(function(){setMsg("");},3000);
    }).catch(function(){setLoading(false);});
  }
  function marquerPaye(id){
    sb.update("paiements",id,{statut:"paye"}).then(function(){
      setCotisations(function(prev){return prev.map(function(c){return c.id===id?Object.assign({},c,{statut:"paye"}):c;});});
    }).catch(function(){});
  }
  function imprimer(){
    var periode=annee+"-"+mois;
    var filtre=cotisations.filter(function(c){return c.date_paiement&&c.date_paiement.substring(0,7)===periode;});
    var win=window.open("","_blank");
    var lignes=filtre.map(function(c){
      var cp=copros.find(function(x){return x.id===c.coproprietaire_id;})||{};
      return "<tr><td>"+(cp.unite||"")+"</td><td>"+(cp.nom||"")+"</td><td>"+Number(c.montant).toFixed(2)+" $</td><td>"+c.statut+"</td></tr>";
    }).join("");
    var total=filtre.reduce(function(a,c){return a+Number(c.montant);},0);
    win.document.write("<html><head><title>Cotisations</title><style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px}th{background:#f0f0f0}.t{font-weight:bold}</style></head><body><h2>Cotisations "+MNOMS[parseInt(mois)]+" "+annee+"</h2><p><b>Syndicat:</b> "+(syndicat?syndicat.nom:"")+"</p><table><thead><tr><th>Unite</th><th>Nom</th><th>Montant</th><th>Statut</th></tr></thead><tbody>"+lignes+"<tr class='t'><td colspan='2'>TOTAL</td><td>"+total.toFixed(2)+" $</td><td></td></tr></tbody></table></body></html>");
    win.document.close();win.print();
  }
  var enAttente=cotisations.filter(function(c){return c.statut==="en_attente";});
  var payes=cotisations.filter(function(c){return c.statut==="paye";});
  var totalMois=cotisations.filter(function(c){return c.date_paiement&&c.date_paiement.substring(0,7)===annee+"-"+mois;}).reduce(function(a,c){return a+Number(c.montant);},0);
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        <Card p={14}><div style={{fontSize:11,color:T.muted}}>En attente</div><div style={{fontSize:28,fontWeight:800,color:T.amber}}>{enAttente.length}</div></Card>
        <Card p={14}><div style={{fontSize:11,color:T.muted}}>Payees</div><div style={{fontSize:28,fontWeight:800,color:T.accent}}>{payes.length}</div></Card>
        <Card p={14}><div style={{fontSize:11,color:T.muted}}>Total periode</div><div style={{fontSize:24,fontWeight:800,color:T.navy}}>{totalMois.toFixed(0)} $</div></Card>
      </div>
      <Card>
        <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap",marginBottom:12}}>
          <div><Lbl l="Annee"/><select value={annee} onChange={function(e){setAnnee(parseInt(e.target.value));}} style={Object.assign({},INP,{width:100})}>{[2024,2025,2026,2027].map(function(y){return <option key={y}>{y}</option>;})}</select></div>
          <div><Lbl l="Mois"/><select value={mois} onChange={function(e){setMois(e.target.value);}} style={Object.assign({},INP,{width:140})}>{MNOMS.slice(1).map(function(m,i){return <option key={i+1} value={String(i+1).padStart(2,"0")}>{m}</option>;})}</select></div>
          <Btn onClick={generer} dis={loading}>{loading?"En cours...":"Generer cotisations"}</Btn>
          <Btn onClick={imprimer} bg={T.navy}>Imprimer avis PDF</Btn>
        </div>
        {msg&&<div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:8,padding:"8px 14px",fontSize:12,color:T.accent,marginBottom:10}}>{msg}</div>}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:T.alt}}>{["Unite","Coproprietaire","Montant","Periode","Statut","Action"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>{h}</th>;})}</tr></thead>
            <tbody>
              {cotisations.slice(0,50).map(function(c){
                var cp=copros.find(function(x){return x.id===c.coproprietaire_id;})||{};
                return(<tr key={c.id} style={{borderBottom:"1px solid "+T.border}}>
                  <td style={{padding:"8px 10px"}}>{cp.unite||"-"}</td>
                  <td style={{padding:"8px 10px"}}>{cp.nom||"-"}</td>
                  <td style={{padding:"8px 10px",fontWeight:600}}>{Number(c.montant).toFixed(2)} $</td>
                  <td style={{padding:"8px 10px",color:T.muted}}>{c.date_paiement?c.date_paiement.substring(0,7):"-"}</td>
                  <td style={{padding:"8px 10px"}}><Badge l={c.statut} c={c.statut==="paye"?"vert":"amber"}/></td>
                  <td style={{padding:"8px 10px"}}>{c.statut==="en_attente"&&<Btn sm onClick={function(){marquerPaye(c.id);}}>Paye</Btn>}</td>
                </tr>);
              })}
              {cotisations.length===0&&<tr><td colSpan={6} style={{padding:20,textAlign:"center",color:T.muted}}>Aucune cotisation - generez la periode ci-dessus</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TabAlertes(p){
  var copros=p.copros;
  var alertes=[];
  var today=new Date();
  (copros||[]).forEach(function(c){
    if(c.ce_expiry){var exp=new Date(c.ce_expiry);var j=Math.round((exp-today)/(1000*60*60*24));if(j<90)alertes.push({id:"ce-"+c.id,type:"CE",unite:c.unite,nom:c.nom,jours:j,date:c.ce_expiry,col:j<0?"rouge":j<30?"rouge":j<60?"amber":"bleu"});}
    if(c.ass_expiry){var expA=new Date(c.ass_expiry);var jA=Math.round((expA-today)/(1000*60*60*24));if(jA<90)alertes.push({id:"ass-"+c.id,type:"Assurance",unite:c.unite,nom:c.nom,jours:jA,date:c.ass_expiry,col:jA<0?"rouge":jA<30?"rouge":jA<60?"amber":"bleu"});}
    if(c.pap&&c.pap_date_exp){var expP=new Date(c.pap_date_exp);var jP=Math.round((expP-today)/(1000*60*60*24));if(jP<60)alertes.push({id:"pap-"+c.id,type:"PAP",unite:c.unite,nom:c.nom,jours:jP,date:c.pap_date_exp,col:jP<0?"rouge":jP<30?"amber":"bleu"});}
  });
  alertes.sort(function(a,b){return a.jours-b.jours;});
  var rouges=alertes.filter(function(a){return a.col==="rouge";}).length;
  var ambers=alertes.filter(function(a){return a.col==="amber";}).length;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        <Card p={14}><div style={{fontSize:11,color:T.muted}}>Urgentes</div><div style={{fontSize:28,fontWeight:800,color:T.red}}>{rouges}</div></Card>
        <Card p={14}><div style={{fontSize:11,color:T.muted}}>Attention</div><div style={{fontSize:28,fontWeight:800,color:T.amber}}>{ambers}</div></Card>
        <Card p={14}><div style={{fontSize:11,color:T.muted}}>Total alertes</div><div style={{fontSize:28,fontWeight:800,color:T.navy}}>{alertes.length}</div></Card>
      </div>
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:T.alt}}>{["Unite","Coproprietaire","Type","Date expiration","Jours restants","Statut"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>{h}</th>;})}</tr></thead>
          <tbody>
            {alertes.map(function(a){return(<tr key={a.id} style={{borderBottom:"1px solid "+T.border,background:a.col==="rouge"?"#FFF5F5":"transparent"}}>
              <td style={{padding:"8px 10px",fontWeight:600}}>{a.unite}</td>
              <td style={{padding:"8px 10px"}}>{a.nom}</td>
              <td style={{padding:"8px 10px"}}><Badge l={a.type} c="bleu"/></td>
              <td style={{padding:"8px 10px",color:T.muted}}>{a.date}</td>
              <td style={{padding:"8px 10px",fontWeight:700,color:a.jours<0?T.red:a.jours<30?T.amber:T.blue}}>{a.jours<0?"Expire "+Math.abs(a.jours)+"j":a.jours+" jours"}</td>
              <td style={{padding:"8px 10px"}}><Badge l={a.jours<0?"Expire":a.jours<30?"Urgent":a.jours<60?"Attention":"OK"} c={a.col}/></td>
            </tr>);})}
            {alertes.length===0&&<tr><td colSpan={6} style={{padding:20,textAlign:"center",color:T.muted}}>Aucune alerte - tout est a jour!</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function TabReunions(p){
  var syndicat=p.syndicat;
  var s0=useState([]);var reunions=s0[0];var setReunions=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({type:"CA",heure:"19:00",lieu:"",ordre:""});var nf=s2[0];var setNf=s2[1];
  useEffect(function(){
    if(!syndicat)return;
    sb.select("reunions",{eq:{syndicat_id:syndicat.id},order:"date_reunion.desc"}).then(function(res){
      if(res&&res.data)setReunions(res.data);
    }).catch(function(){});
  },[syndicat]);
  function setType(v){setNf(function(pr){return Object.assign({},pr,{type:v});});}
  function setDate(v){setNf(function(pr){return Object.assign({},pr,{date_reunion:v});});}
  function setHeure(v){setNf(function(pr){return Object.assign({},pr,{heure:v});});}
  function setLieu(v){setNf(function(pr){return Object.assign({},pr,{lieu:v});});}
  function setOrdre(v){setNf(function(pr){return Object.assign({},pr,{ordre:v});});}
  function ajouter(){
    if(!nf.date_reunion)return;
    var row={syndicat_id:syndicat.id,date_reunion:nf.date_reunion,heure:nf.heure||"19:00",lieu:nf.lieu||"",type:nf.type||"CA",ordre_du_jour:nf.ordre||"",statut:"planifie"};
    sb.insert("reunions",row).then(function(res){
      if(res&&res.data)setReunions(function(prev){return [res.data].concat(prev);});
      setShowN(false);setNf({type:"CA",heure:"19:00",lieu:"",ordre:""});
    }).catch(function(){});
  }
  function convocation(r){
    var win=window.open("","_blank");
    var d=new Date(r.date_reunion);
    var MOIS=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];
    var ds=d.getDate()+" "+MOIS[d.getMonth()]+" "+d.getFullYear();
    var pts=(r.ordre_du_jour||"Ouverture - Divers - Fermeture").split(",").filter(function(x){return x.trim();});
    var li=pts.map(function(pt){return "<li>"+pt.trim()+"</li>";}).join("");
    win.document.write("<html><head><title>Convocation</title><style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:20px}h2{text-align:center}.c{text-align:center;font-size:16px;font-weight:bold;margin:20px 0}p{line-height:1.6}.sig{margin-top:60px}</style></head><body><p><b>Syndicat: </b>"+(syndicat?syndicat.nom:"")+"</p><hr/><h2>CONVOCATION - "+(r.type||"CA")+"</h2><p>Les membres sont convoques a la reunion du:</p><div class='c'>"+ds+" a "+r.heure+"</div><p style='text-align:center'>"+(r.lieu||"Lieu a confirmer")+"</p><p><b>Ordre du jour:</b></p><ol>"+li+"</ol><div class='sig'><p>Le secretaire,</p><p>&nbsp;</p><p>___________________</p><p>Date: "+new Date().toLocaleDateString("fr-CA")+"</p></div></body></html>");
    win.document.close();win.print();
  }
  var prochaines=reunions.filter(function(r){return new Date(r.date_reunion)>=new Date();});
  var passees=reunions.filter(function(r){return new Date(r.date_reunion)<new Date();});
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,color:T.navy}}>Reunions - {syndicat?syndicat.nom:""}</div>
        <Btn onClick={function(){setShowN(true);}}>+ Planifier</Btn>
      </div>
      {showN&&<Card>
        <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>Nouvelle reunion</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div><Lbl l="Type"/><select value={nf.type||"CA"} onChange={function(e){setType(e.target.value);}} style={INP}><option value="CA">Conseil d administration</option><option value="AGO">Assemblee generale ordinaire</option><option value="AGE">Assemblee generale extraordinaire</option></select></div>
          <div><Lbl l="Date"/><input type="date" value={nf.date_reunion||""} onChange={function(e){setDate(e.target.value);}} style={INP}/></div>
          <div><Lbl l="Heure"/><input value={nf.heure||"19:00"} onChange={function(e){setHeure(e.target.value);}} style={INP}/></div>
          <div><Lbl l="Lieu"/><input value={nf.lieu||""} onChange={function(e){setLieu(e.target.value);}} style={INP} placeholder="Salle communautaire..."/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl l="Ordre du jour (virgule entre chaque point)"/><textarea value={nf.ordre||""} onChange={function(e){setOrdre(e.target.value);}} style={Object.assign({},INP,{minHeight:60,resize:"vertical"})} placeholder="Ouverture, Adoption PV, Budget, Divers, Fermeture"/></div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={ajouter}>Planifier</Btn><Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn></div>
      </Card>}
      {prochaines.length>0&&<div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Prochaines reunions</div>
        {prochaines.map(function(r){return(<Card key={r.id} p={14}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><Badge l={r.type} c="bleu"/><span style={{fontSize:13,fontWeight:700,color:T.navy}}>{new Date(r.date_reunion).toLocaleDateString("fr-CA",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span><span style={{fontSize:12,color:T.muted}}>{r.heure}</span></div>
              <div style={{fontSize:12,color:T.muted}}>{r.lieu||"Lieu a confirmer"}</div>
            </div>
            <Btn sm onClick={function(){convocation(r);}}>Convocation PDF</Btn>
          </div>
        </Card>);})}
      </div>}
      {passees.length>0&&<div>
        <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Reunions passees</div>
        {passees.slice(0,5).map(function(r){return(<div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:T.surface,border:"1px solid "+T.border,borderRadius:8,marginBottom:6}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}><Badge l={r.type} c="gris"/><span style={{fontSize:12,color:T.muted}}>{new Date(r.date_reunion).toLocaleDateString("fr-CA")}</span><span style={{fontSize:12}}>{r.lieu||""}</span></div>
        </div>);})}
      </div>}
      {reunions.length===0&&!showN&&<Card><div style={{textAlign:"center",padding:20,color:T.muted,fontSize:12}}>Aucune reunion - cliquez Planifier</div></Card>}
    </div>
  );
}

function TabPAP(p){
  var syndicat=p.syndicat;var copros=p.copros;
  var s0=useState([]);var prevs=s0[0];var setPrevs=s0[1];
  var s1=useState(false);var loading=s1[0];var setLoading=s1[1];
  var s2=useState(new Date().toISOString().substring(0,10));var datePrev=s2[0];var setDatePrev=s2[1];
  var s3=useState("");var msg=s3[0];var setMsg=s3[1];
  useEffect(function(){
    if(!syndicat)return;
    sb.select("prelevements",{eq:{syndicat_id:syndicat.id},order:"date_prev.desc"}).then(function(res){
      if(res&&res.data)setPrevs(res.data);
    }).catch(function(){});
  },[syndicat]);
  var papCopros=(copros||[]).filter(function(c){return c.pap&&c.statut==="actif";});
  var totalPAP=papCopros.reduce(function(a,c){return a+Number(c.cotisation_mensuelle||0);},0);
  function generer(){
    if(papCopros.length===0){setMsg("Aucun coproprietaire PAP.");return;}
    setLoading(true);
    var rows=papCopros.map(function(c){return {syndicat_id:syndicat.id,coproprietaire_id:c.id,date_prev:datePrev,montant:c.cotisation_mensuelle||0,description:"PAP "+(c.nom||c.unite),statut:"planifie"};});
    Promise.all(rows.map(function(r){return sb.insert("prelevements",r);})).then(function(results){
      var newP=results.filter(function(r){return r&&r.data;}).map(function(r){return r.data;});
      setPrevs(function(prev){return newP.concat(prev);});
      setMsg(rows.length+" prelevements generes");
      setLoading(false);
      setTimeout(function(){setMsg("");},3000);
    }).catch(function(){setLoading(false);});
  }
  function exporter(){
    var lines=["Unite,Nom,Montant,Date"];
    papCopros.forEach(function(c){lines.push((c.unite||"")+","+(c.nom||"")+","+Number(c.cotisation_mensuelle||0).toFixed(2)+","+datePrev);});
    lines.push("TOTAL,,"+totalPAP.toFixed(2));
    var blob=new Blob([lines.join("")],{type:"text/csv"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;a.download="PAP_"+datePrev+".csv";a.click();
    URL.revokeObjectURL(url);
  }
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        <Card p={14}><div style={{fontSize:11,color:T.muted}}>Inscrits PAP</div><div style={{fontSize:28,fontWeight:800,color:T.accent}}>{papCopros.length}</div></Card>
        <Card p={14}><div style={{fontSize:11,color:T.muted}}>Total PAP mensuel</div><div style={{fontSize:24,fontWeight:800,color:T.navy}}>{totalPAP.toFixed(0)} $</div></Card>
        <Card p={14}><div style={{fontSize:11,color:T.muted}}>Prelevements</div><div style={{fontSize:28,fontWeight:800,color:T.blue}}>{prevs.length}</div></Card>
      </div>
      <Card>
        <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap",marginBottom:12}}>
          <div><Lbl l="Date de prelevement"/><input type="date" value={datePrev} onChange={function(e){setDatePrev(e.target.value);}} style={Object.assign({},INP,{width:160})}/></div>
          <Btn onClick={generer} dis={loading||papCopros.length===0}>{loading?"En cours...":"Generer PAP"}</Btn>
          <Btn onClick={exporter} bg={T.navy} dis={papCopros.length===0}>Exporter CSV</Btn>
        </div>
        {msg&&<div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:8,padding:"8px 14px",fontSize:12,color:T.accent,marginBottom:10}}>{msg}</div>}
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:T.alt}}>{["Unite","Nom","Cotisation","Exp. PAP","Statut"].map(function(h){return <th key={h} style={{padding:"7px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>{h}</th>;})}</tr></thead>
          <tbody>
            {papCopros.map(function(c){var exp=c.pap_date_exp?new Date(c.pap_date_exp):null;var j=exp?Math.round((exp-new Date())/(1000*60*60*24)):999;return(<tr key={c.id} style={{borderBottom:"1px solid "+T.border}}>
              <td style={{padding:"7px 10px",fontWeight:600}}>{c.unite}</td>
              <td style={{padding:"7px 10px"}}>{c.nom}</td>
              <td style={{padding:"7px 10px",color:T.accent,fontWeight:600}}>{Number(c.cotisation_mensuelle||0).toFixed(2)} $</td>
              <td style={{padding:"7px 10px",color:T.muted}}>{c.pap_date_exp||"-"}</td>
              <td style={{padding:"7px 10px"}}><Badge l={j<0?"Expire":j<30?"Bientot":j<60?"Attention":"Actif"} c={j<30?"rouge":j<60?"amber":"vert"}/></td>
            </tr>);})}
            {papCopros.length===0&&<tr><td colSpan={5} style={{padding:16,textAlign:"center",color:T.muted}}>Aucun coproprietaire avec PAP actif</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default function GestionAuto(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var copros=s2[0];var setCopros=s2[1];
  var s3=useState("cotisations");var ong=s3[0];var setOng=s3[1];
  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);
  useEffect(function(){
    if(!sel)return;
    setCopros([]);
    sb.select("coproprietaires",{eq:{syndicat_id:sel.id},order:"unite.asc"}).then(function(res){
      if(res&&res.data)setCopros(res.data);
    }).catch(function(){});
  },[sel]);
  var TABS=[{id:"cotisations",l:"Cotisations"},{id:"alertes",l:"Alertes"},{id:"reunions",l:"Reunions CA"},{id:"pap",l:"PAP"}];
  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat. Creez d abord un syndicat dans Predictek.</div>;
  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Gestion automatique</div>
        <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
          {TABS.map(function(t){var a=ong===t.id;return <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",padding:"6px 14px",color:a?"#fff":"#8da0bb",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:400}}>{t.l}</button>;})}
        </div>
      </div>
      <div style={{padding:16}}>
        {ong==="cotisations"&&<TabCotisations syndicat={sel} copros={copros}/>}
        {ong==="alertes"&&<TabAlertes syndicat={sel} copros={copros}/>}
        {ong==="reunions"&&<TabReunions syndicat={sel}/>}
        {ong==="pap"&&<TabPAP syndicat={sel} copros={copros}/>}
      </div>
    </div>
  );
}
