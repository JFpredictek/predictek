
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",accentG:"#3CAF6E",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Card(p){return <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:p.p||16,marginBottom:p.mb||12}}>{p.children}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"6px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit",opacity:p.dis?0.7:1}}>{p.children}</button>;}
function Badge(p){var colors={vert:{bg:"#D4EDDA",tc:"#155724"},rouge:{bg:"#F8D7DA",tc:"#721C24"},amber:{bg:"#FEF3E2",tc:"#B86020"},bleu:{bg:"#EFF6FF",tc:"#1A56DB"},gris:{bg:"#F0EDE8",tc:"#7C7568"}};var c=colors[p.c]||colors.gris;return <span style={{background:c.bg,color:c.tc,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{p.l}</span>;}

// ============================================================
// TAB: COTISATIONS
// ============================================================
function TabCotisations({syndicat, copros}){
  var s0=useState([]);var cotisations=s0[0];var setCotisations=s0[1];
  var s1=useState(false);var loading=s1[0];var setLoading=s1[1];
  var s2=useState("");var msg=s2[0];var setMsg=s2[1];
  var s3=useState(new Date().getFullYear());var annee=s3[0];var setAnnee=s3[1];
  var s4=useState((new Date().getMonth()+1).toString().padStart(2,"0"));var mois=s4[0];var setMois=s4[1];

  var moisNoms=["","Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"];

  useEffect(function(){
    if(!syndicat)return;
    sb.select("paiements",{eq:{syndicat_id:syndicat.id},order:"date_paiement.desc"}).then(function(res){
      if(res&&res.data)setCotisations(res.data);
    }).catch(function(){});
  },[syndicat]);

  function genererCotisations(){
    if(!syndicat||!copros||copros.length===0){setMsg("Aucun coproprietaire dans ce syndicat.");return;}
    setLoading(true);
    var dateStr=annee+"-"+mois+"-01";
    var rows=copros.filter(function(c){return c.statut==="actif";}).map(function(c){
      return {syndicat_id:syndicat.id,coproprietaire_id:c.id,date_paiement:dateStr,montant:c.cotisation_mensuelle||0,description:"Cotisation "+moisNoms[parseInt(mois)]+" "+annee,statut:"en_attente",moyen:"virement"};
    });
    var promises=rows.map(function(r){return sb.insert("paiements",r);});
    Promise.all(promises).then(function(results){
      var newPaie=results.filter(function(r){return r&&r.data;}).map(function(r){return r.data;});
      setCotisations(function(prev){return newPaie.concat(prev);});
      setMsg(rows.length+" cotisations generees pour "+moisNoms[parseInt(mois)]+" "+annee);
      sb.log("cotisation","generation","Cotisations "+moisNoms[parseInt(mois)]+" "+annee,rows.length+" unites",syndicat.code);
      setLoading(false);
      setTimeout(function(){setMsg("");},4000);
    }).catch(function(){setLoading(false);setMsg("Erreur lors de la generation.");});
  }

  function marquerPaye(id){
    sb.update("paiements",id,{statut:"paye"}).then(function(){
      setCotisations(function(prev){return prev.map(function(c){return c.id===id?Object.assign({},c,{statut:"paye"}):c;});});
    }).catch(function(){});
  }

  function imprimerAvis(){
    var coprosPeriode=cotisations.filter(function(c){return c.date_paiement&&c.date_paiement.substring(0,7)===annee+"-"+mois;});
    var win=window.open("","_blank");
    var html="<!DOCTYPE html><html><head><title>Avis de cotisation</title>";
    html+="<style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f0f0f0}.total{font-weight:bold;background:#e8f2ec}</style></head><body>";
    html+="<h2>Avis de cotisation - "+moisNoms[parseInt(mois)]+" "+annee+"</h2>";
    html+="<p><b>Syndicat:</b> "+(syndicat?syndicat.nom:"")+"</p>";
    html+="<table><thead><tr><th>Unite</th><th>Coproprietaire</th><th>Montant</th><th>Statut</th></tr></thead><tbody>";
    coprosPeriode.forEach(function(c){
      var cp=copros.find(function(x){return x.id===c.coproprietaire_id;})||{};
      html+="<tr><td>"+(cp.unite||"")+"</td><td>"+(cp.nom||"")+"</td><td>"+Number(c.montant).toFixed(2)+" $</td><td>"+c.statut+"</td></tr>";
    });
    var total=coprosPeriode.reduce(function(a,c){return a+Number(c.montant);},0);
    html+="<tr class='total'><td colspan='2'>TOTAL</td><td>"+total.toFixed(2)+" $</td><td></td></tr>";
    html+="</tbody></table></body></html>";
    win.document.write(html);win.document.close();win.print();
  }

  var enAttente=cotisations.filter(function(c){return c.statut==="en_attente";});
  var payes=cotisations.filter(function(c){return c.statut==="paye";});
  var totalMois=cotisations.filter(function(c){return c.date_paiement&&c.date_paiement.substring(0,7)===annee+"-"+mois;}).reduce(function(a,c){return a+Number(c.montant);},0);

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        <Card p={14}>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>En attente</div>
          <div style={{fontSize:28,fontWeight:800,color:T.amber}}>{enAttente.length}</div>
          <div style={{fontSize:11,color:T.muted}}>cotisations</div>
        </Card>
        <Card p={14}>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Payees ce mois</div>
          <div style={{fontSize:28,fontWeight:800,color:T.accent}}>{payes.length}</div>
          <div style={{fontSize:11,color:T.muted}}>cotisations</div>
        </Card>
        <Card p={14}>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Total periode</div>
          <div style={{fontSize:24,fontWeight:800,color:T.navy}}>{totalMois.toFixed(0)} $</div>
          <div style={{fontSize:11,color:T.muted}}>prevu ce mois</div>
        </Card>
      </div>

      <Card>
        <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap",marginBottom:12}}>
          <div>
            <Lbl l="Annee"/>
            <select value={annee} onChange={function(e){setAnnee(parseInt(e.target.value));}} style={Object.assign({},INP,{width:100})}>
              {[2024,2025,2026,2027].map(function(y){return <option key={y}>{y}</option>;})}
            </select>
          </div>
          <div>
            <Lbl l="Mois"/>
            <select value={mois} onChange={function(e){setMois(e.target.value);}} style={Object.assign({},INP,{width:140})}>
              {moisNoms.slice(1).map(function(m,i){return <option key={i+1} value={String(i+1).padStart(2,"0")}>{m}</option>;})}
            </select>
          </div>
          <Btn onClick={genererCotisations} dis={loading}>{loading?"Generation...":"Generer cotisations"}</Btn>
          <Btn onClick={imprimerAvis} bg={T.navy}>Imprimer avis</Btn>
        </div>
        {msg&&<div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:8,padding:"8px 14px",fontSize:12,color:T.accent,marginBottom:10}}>{msg}</div>}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:T.alt}}>
                <th style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>Unite</th>
                <th style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>Coproprietaire</th>
                <th style={{padding:"8px 10px",textAlign:"right",fontWeight:600,color:T.navy}}>Montant</th>
                <th style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>Periode</th>
                <th style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>Statut</th>
                <th style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cotisations.slice(0,50).map(function(c){
                var cp=copros.find(function(x){return x.id===c.coproprietaire_id;})||{};
                return(
                  <tr key={c.id} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"8px 10px"}}>{cp.unite||"-"}</td>
                    <td style={{padding:"8px 10px"}}>{cp.nom||"-"}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",fontWeight:600}}>{Number(c.montant).toFixed(2)} $</td>
                    <td style={{padding:"8px 10px",color:T.muted}}>{c.date_paiement?c.date_paiement.substring(0,7):"-"}</td>
                    <td style={{padding:"8px 10px"}}><Badge l={c.statut} c={c.statut==="paye"?"vert":c.statut==="en_attente"?"amber":"gris"}/></td>
                    <td style={{padding:"8px 10px"}}>
                      {c.statut==="en_attente"&&<Btn sm onClick={function(){marquerPaye(c.id);}}>Marquer paye</Btn>}
                    </td>
                  </tr>
                );
              })}
              {cotisations.length===0&&<tr><td colSpan={6} style={{padding:20,textAlign:"center",color:T.muted}}>Aucune cotisation - generez la periode ci-dessus</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// TAB: ALERTES AUTOMATIQUES
// ============================================================
function TabAlertes({syndicat, copros}){
  var s0=useState([]);var alertes=s0[0];var setAlertes=s0[1];

  useEffect(function(){
    if(!copros||copros.length===0)return;
    var today=new Date();
    var list=[];
    copros.forEach(function(c){
      // Certificat d eau
      if(c.ce_expiry){
        var exp=new Date(c.ce_expiry);
        var jours=Math.round((exp-today)/(1000*60*60*24));
        if(jours<90){
          list.push({id:"ce-"+c.id,type:"CE",unite:c.unite,nom:c.nom,jours:jours,date:c.ce_expiry,couleur:jours<0?"rouge":jours<30?"rouge":jours<60?"amber":"bleu"});
        }
      }
      // Assurance
      if(c.ass_expiry){
        var expA=new Date(c.ass_expiry);
        var joursA=Math.round((expA-today)/(1000*60*60*24));
        if(joursA<90){
          list.push({id:"ass-"+c.id,type:"Assurance",unite:c.unite,nom:c.nom,jours:joursA,date:c.ass_expiry,couleur:joursA<0?"rouge":joursA<30?"rouge":joursA<60?"amber":"bleu"});
        }
      }
      // PAP expire
      if(c.pap&&c.pap_date_exp){
        var expP=new Date(c.pap_date_exp);
        var joursP=Math.round((expP-today)/(1000*60*60*24));
        if(joursP<60){
          list.push({id:"pap-"+c.id,type:"PAP",unite:c.unite,nom:c.nom,jours:joursP,date:c.pap_date_exp,couleur:joursP<0?"rouge":joursP<30?"amber":"bleu"});
        }
      }
    });
    list.sort(function(a,b){return a.jours-b.jours;});
    setAlertes(list);
  },[copros]);

  var rouges=alertes.filter(function(a){return a.couleur==="rouge";});
  var ambers=alertes.filter(function(a){return a.couleur==="amber";});
  var bleus=alertes.filter(function(a){return a.couleur==="bleu";});

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        <Card p={14}><div style={{fontSize:11,color:T.muted,marginBottom:4}}>Urgentes</div><div style={{fontSize:28,fontWeight:800,color:T.red}}>{rouges.length}</div><div style={{fontSize:11,color:T.muted}}>alertes</div></Card>
        <Card p={14}><div style={{fontSize:11,color:T.muted,marginBottom:4}}>Attention</div><div style={{fontSize:28,fontWeight:800,color:T.amber}}>{ambers.length}</div><div style={{fontSize:11,color:T.muted}}>alertes</div></Card>
        <Card p={14}><div style={{fontSize:11,color:T.muted,marginBottom:4}}>A surveiller</div><div style={{fontSize:28,fontWeight:800,color:T.blue}}>{bleus.length}</div><div style={{fontSize:11,color:T.muted}}>alertes</div></Card>
      </div>
      <Card>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:T.alt}}>
                {["Unite","Coproprietaire","Type","Expiration","Jours restants","Statut"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>{h}</th>;})}
              </tr>
            </thead>
            <tbody>
              {alertes.map(function(a){
                return(
                  <tr key={a.id} style={{borderBottom:"1px solid "+T.border,background:a.couleur==="rouge"?"#FFF5F5":"transparent"}}>
                    <td style={{padding:"8px 10px",fontWeight:600}}>{a.unite}</td>
                    <td style={{padding:"8px 10px"}}>{a.nom}</td>
                    <td style={{padding:"8px 10px"}}><Badge l={a.type} c={a.type==="CE"?"bleu":a.type==="Assurance"?"purple":"amber"}/></td>
                    <td style={{padding:"8px 10px",color:T.muted}}>{a.date}</td>
                    <td style={{padding:"8px 10px",fontWeight:700,color:a.jours<0?T.red:a.jours<30?T.amber:T.blue}}>{a.jours<0?"Expire il y a "+(Math.abs(a.jours))+" jours":a.jours+" jours"}</td>
                    <td style={{padding:"8px 10px"}}><Badge l={a.jours<0?"Expire":a.jours<30?"Urgent":a.jours<60?"Attention":"OK"} c={a.couleur}/></td>
                  </tr>
                );
              })}
              {alertes.length===0&&<tr><td colSpan={6} style={{padding:20,textAlign:"center",color:T.muted}}>Aucune alerte - tous les certificats et assurances sont a jour</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// TAB: REUNIONS
// ============================================================
function TabReunions({syndicat}){
  var s0=useState([]);var reunions=s0[0];var setReunions=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({type:"CA",heure:"19:00",lieu:"",ordre:""});var nf=s2[0];var setNf=s2[1];
  function sn(k,v){
    if(k==="type")setNf(function(p){return Object.assign({},p,{type:v});});
    else if(k==="date_reunion")setNf(function(p){return Object.assign({},p,{date_reunion:v});});
    else if(k==="heure")setNf(function(p){return Object.assign({},p,{heure:v});});
    else if(k==="lieu")setNf(function(p){return Object.assign({},p,{lieu:v});});
    else if(k==="ordre")setNf(function(p){return Object.assign({},p,{ordre:v});});
  }

  useEffect(function(){
    if(!syndicat)return;
    sb.select("reunions",{eq:{syndicat_id:syndicat.id},order:"date_reunion.desc"}).then(function(res){
      if(res&&res.data)setReunions(res.data);
    }).catch(function(){});
  },[syndicat]);

  function ajouterReunion(){
    if(!nf.date_reunion)return;
    var row={syndicat_id:syndicat.id,date_reunion:nf.date_reunion,heure:nf.heure||"19:00",lieu:nf.lieu||"",type:nf.type||"CA",ordre_du_jour:nf.ordre||"",statut:"planifie"};
    sb.insert("reunions",row).then(function(res){
      if(res&&res.data){setReunions(function(prev){return [res.data].concat(prev);});}
      setShowN(false);setNf({type:"CA",heure:"19:00",lieu:"",ordre:""});
      sb.log("reunion","creation","Reunion "+row.type+" planifiee le "+row.date_reunion,"",syndicat.code);
    }).catch(function(){});
  }

  function genererConvocation(r){
    var win=window.open("","_blank");
    var date=new Date(r.date_reunion);
    var moisNoms=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];
    var dateStr=date.getDate()+" "+moisNoms[date.getMonth()]+" "+date.getFullYear();
    var html="<!DOCTYPE html><html><head><title>Convocation</title>";
    html+="<style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#1C1A17}.titre{font-size:18px;font-weight:bold;text-align:center;margin:20px 0}.soustitre{text-align:center;color:#555;margin-bottom:30px}p{margin:10px 0;line-height:1.6}.signature{margin-top:60px}hr{border:1px solid #ddd;margin:20px 0}</style></head><body>";
    html+="<p><b>Syndicat des coproprietaires</b><br>"+(syndicat?syndicat.nom:"")+"</p>";
    html+="<hr/>";
    html+="<div class='titre'>CONVOCATION - "+(r.type==="CA"?"CONSEIL D ADMINISTRATION":r.type==="AGO"?"ASSEMBLEE GENERALE ORDINAIRE":"ASSEMBLEE SPECIALE")+"</div>";
    html+="<p>Les membres du "+(r.type==="CA"?"conseil d administration":"syndicat")+" sont convies a la reunion qui se tiendra le:</p>";
    html+="<p style='text-align:center;font-size:16px;font-weight:bold'>"+dateStr+" a "+r.heure+"</p>";
    html+="<p style='text-align:center'>"+(r.lieu||"Lieu a confirmer")+"</p>";
    html+="<p><b>Ordre du jour:</b></p>";
    html+="<ol>";
    var points=(r.ordre_du_jour||"Ouverture\nAdoption ordre du jour\nDivers\nFermeture").split("\n");
    points.forEach(function(p){if(p.trim())html+="<li>"+p.trim()+"</li>";});
    html+="</ol>";
    html+="<div class='signature'><p>Le secretaire du conseil d administration,</p><p>&nbsp;</p><p>___________________________</p><p>Date: "+new Date().toLocaleDateString("fr-CA")+"</p></div>";
    html+="</body></html>";
    win.document.write(html);win.document.close();win.print();
  }

  var prochaines=reunions.filter(function(r){return r.statut==="planifie"&&new Date(r.date_reunion)>=new Date();});
  var passees=reunions.filter(function(r){return r.statut!=="planifie"||new Date(r.date_reunion)<new Date();});

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,color:T.navy}}>Reunions - {syndicat?syndicat.nom:""}</div>
        <Btn onClick={function(){setShowN(true);}}>+ Planifier une reunion</Btn>
      </div>

      {showN&&(
        <Card>
          <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>Nouvelle reunion</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div><Lbl l="Type"/><select value={nf.type||"CA"} onChange={function(e){sn("type",e.target.value);}} style={INP}><option value="CA">Conseil d administration (CA)</option><option value="AGO">Assemblee generale ordinaire (AGO)</option><option value="AGE">Assemblee generale extraordinaire (AGE)</option></select></div>
            <div><Lbl l="Date"/><input type="date" value={nf.date_reunion||""} onChange={function(e){sn("date_reunion",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Heure"/><input value={nf.heure||"19:00"} onChange={function(e){sn("heure",e.target.value);}} style={INP} placeholder="19:00"/></div>
            <div><Lbl l="Lieu"/><input value={nf.lieu||""} onChange={function(e){sn("lieu",e.target.value);}} style={INP} placeholder="Salle communautaire..."/></div>
            <div style={{gridColumn:"1/-1"}}><Lbl l="Ordre du jour (1 point par ligne)"/><textarea value={nf.ordre||""} onChange={function(e){sn("ordre",e.target.value);}} style={Object.assign({},INP,{minHeight:80,resize:"vertical"})} placeholder={"Ouverture de la seance\nAdoption de l ordre du jour\nBudget 2025-2026\nDivers\nFermeture"}/></div>\n          </div>\n          <div style={{display:"flex",gap:8}}>\n            <Btn onClick={ajouterReunion}>Planifier</Btn>\n            <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>\n          </div>\n        </Card>\n      )}\n\n      {prochaines.length>0&&(\n        <div style={{marginBottom:16}}>\n          <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Prochaines reunions</div>\n          {prochaines.map(function(r){\n            return(\n              <Card key={r.id} p={14}>\n                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>\n                  <div>\n                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>\n                      <Badge l={r.type} c="bleu"/>\n                      <span style={{fontSize:13,fontWeight:700,color:T.navy}}>{new Date(r.date_reunion).toLocaleDateString("fr-CA",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>
                      <span style={{fontSize:12,color:T.muted}}>a {r.heure}</span>
                    </div>
                    <div style={{fontSize:12,color:T.muted}}>{r.lieu||"Lieu a confirmer"}</div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <Btn sm onClick={function(){genererConvocation(r);}}>Convocation PDF</Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {passees.length>0&&(
        <div>
          <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Reunions passees</div>
          {passees.map(function(r){
            return(
              <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:T.surface,border:"1px solid "+T.border,borderRadius:8,marginBottom:8}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <Badge l={r.type} c="gris"/>
                  <span style={{fontSize:12,color:T.muted}}>{new Date(r.date_reunion).toLocaleDateString("fr-CA")}</span>
                  <span style={{fontSize:12,color:T.text}}>{r.lieu||""}</span>
                </div>
                <Badge l={r.statut==="tenu"?"Tenu":"Planifie"} c={r.statut==="tenu"?"vert":"gris"}/>
              </div>
            );
          })}
        </div>
      )}

      {reunions.length===0&&!showN&&(
        <Card><div style={{textAlign:"center",padding:20,color:T.muted,fontSize:12}}>Aucune reunion planifiee - cliquez sur "Planifier une reunion" pour commencer</div></Card>
      )}
    </div>
  );
}

// ============================================================
// TAB: PRELEVEMENTS PAP
// ============================================================
function TabPrelevements({syndicat, copros}){
  var s0=useState([]);var prevs=s0[0];var setPrevs=s0[1];
  var s1=useState(false);var loading=s1[0];var setLoading=s1[1];
  var s2=useState("");var msg=s2[0];var setMsg=s2[1];
  var s3=useState(new Date().toISOString().substring(0,10));var datePrev=s3[0];var setDatePrev=s3[1];

  useEffect(function(){
    if(!syndicat)return;
    sb.select("prelevements",{eq:{syndicat_id:syndicat.id},order:"date_prev.desc"}).then(function(res){
      if(res&&res.data)setPrevs(res.data);
    }).catch(function(){});
  },[syndicat]);

  var papCopros=copros.filter(function(c){return c.pap&&c.statut==="actif";});
  var totalPAP=papCopros.reduce(function(a,c){return a+Number(c.cotisation_mensuelle||0);},0);

  function genererPAP(){
    if(papCopros.length===0){setMsg("Aucun coproprietaire avec PAP actif.");return;}
    setLoading(true);
    var rows=papCopros.map(function(c){
      return {syndicat_id:syndicat.id,coproprietaire_id:c.id,date_prev:datePrev,montant:c.cotisation_mensuelle||0,description:"PAP - "+(c.nom||c.unite),statut:"planifie"};
    });
    Promise.all(rows.map(function(r){return sb.insert("prelevements",r);})).then(function(results){
      var newP=results.filter(function(r){return r&&r.data;}).map(function(r){return r.data;});
      setPrevs(function(prev){return newP.concat(prev);});
      setMsg(rows.length+" prelevements PAP generes pour le "+datePrev);
      sb.log("pap","generation","Prelevements PAP "+datePrev,rows.length+" unites",syndicat.code);
      setLoading(false);
      setTimeout(function(){setMsg("");},4000);
    }).catch(function(){setLoading(false);});
  }

  function exporterEFT(){
    var lines=["PRELEVEMENT PREAUTHORISE - "+new Date().toLocaleDateString("fr-CA"),"Syndicat: "+(syndicat?syndicat.nom:""),"","No Unite,Nom,Montant,Date"];
    papCopros.forEach(function(c){
      lines.push((c.unite||"")+","+(c.nom||"")+","+Number(c.cotisation_mensuelle||0).toFixed(2)+","+datePrev);
    });
    lines.push("","TOTAL,"+totalPAP.toFixed(2));
    var blob=new Blob([lines.join("
")],{type:"text/csv"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;a.download="PAP_"+datePrev+".csv";a.click();
    URL.revokeObjectURL(url);
  }

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        <Card p={14}><div style={{fontSize:11,color:T.muted,marginBottom:4}}>Inscrits PAP</div><div style={{fontSize:28,fontWeight:800,color:T.accent}}>{papCopros.length}</div><div style={{fontSize:11,color:T.muted}}>coproprietaires</div></Card>
        <Card p={14}><div style={{fontSize:11,color:T.muted,marginBottom:4}}>Total PAP mensuel</div><div style={{fontSize:24,fontWeight:800,color:T.navy}}>{totalPAP.toFixed(0)} $</div><div style={{fontSize:11,color:T.muted}}>par mois</div></Card>
        <Card p={14}><div style={{fontSize:11,color:T.muted,marginBottom:4}}>Prelevements total</div><div style={{fontSize:28,fontWeight:800,color:T.blue}}>{prevs.length}</div><div style={{fontSize:11,color:T.muted}}>transactions</div></Card>
      </div>

      <Card>
        <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap",marginBottom:12}}>
          <div><Lbl l="Date de prelevement"/><input type="date" value={datePrev} onChange={function(e){setDatePrev(e.target.value);}} style={Object.assign({},INP,{width:160})}/></div>
          <Btn onClick={genererPAP} dis={loading||papCopros.length===0}>{loading?"Generation...":"Generer prelevements PAP"}</Btn>
          <Btn onClick={exporterEFT} bg={T.navy} dis={papCopros.length===0}>Exporter CSV / EFT</Btn>
        </div>
        {msg&&<div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:8,padding:"8px 14px",fontSize:12,color:T.accent,marginBottom:10}}>{msg}</div>}

        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:8}}>Coproprietaires PAP actifs</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.alt}}>{["Unite","Nom","Cotisation","Exp. PAP","Statut"].map(function(h){return <th key={h} style={{padding:"7px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>{h}</th>;})}</tr></thead>
              <tbody>
                {papCopros.map(function(c){
                  var exp=c.pap_date_exp?new Date(c.pap_date_exp):null;
                  var jours=exp?Math.round((exp-new Date())/(1000*60*60*24)):999;
                  return(
                    <tr key={c.id} style={{borderBottom:"1px solid "+T.border}}>
                      <td style={{padding:"7px 10px",fontWeight:600}}>{c.unite}</td>
                      <td style={{padding:"7px 10px"}}>{c.nom}</td>
                      <td style={{padding:"7px 10px",fontWeight:600,color:T.accent}}>{Number(c.cotisation_mensuelle||0).toFixed(2)} $</td>
                      <td style={{padding:"7px 10px",color:T.muted}}>{c.pap_date_exp||"-"}</td>
                      <td style={{padding:"7px 10px"}}><Badge l={jours<0?"Expire":jours<30?"Bientot":jours<60?"Attention":"Actif"} c={jours<30?"rouge":jours<60?"amber":"vert"}/></td>
                    </tr>
                  );
                })}
                {papCopros.length===0&&<tr><td colSpan={5} style={{padding:16,textAlign:"center",color:T.muted}}>Aucun coproprietaire avec PAP actif</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// MODULE PRINCIPAL: GestionAuto
// ============================================================
export default function GestionAuto(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var selSynd=s1[0];var setSelSynd=s1[1];
  var s2=useState([]);var copros=s2[0];var setCopros=s2[1];
  var s3=useState("cotisations");var ong=s3[0];var setOng=s3[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){
        setSyndicats(res.data);
        setSelSynd(res.data[0]);
      }
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!selSynd)return;
    setCopros([]);
    sb.select("coproprietaires",{eq:{syndicat_id:selSynd.id},order:"unite.asc"}).then(function(res){
      if(res&&res.data)setCopros(res.data);
    }).catch(function(){});
  },[selSynd]);

  var TABS=[
    {id:"cotisations",l:"Cotisations",icon:"$"},
    {id:"alertes",l:"Alertes",icon:"!"},
    {id:"reunions",l:"Reunions CA",icon:"C"},
    {id:"pap",l:"PAP",icon:"P"},
  ];

  if(syndicats.length===0){
    return(
      <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif"}}>
        <div style={{fontSize:18,fontWeight:700,color:T.navy,marginBottom:8}}>Gestion automatique</div>
        <div style={{fontSize:13,color:T.muted}}>Aucun syndicat trouve. Creez d abord un syndicat dans le module Predictek.</div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Gestion automatique</div>
        <select value={selSynd?selSynd.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSelSynd(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
          {TABS.map(function(t){var a=ong===t.id;return(
            <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",padding:"6px 14px",color:a?"#fff":"#8da0bb",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:400,whiteSpace:"nowrap"}}>
              {t.l}
            </button>
          );})}
        </div>
      </div>

      <div style={{padding:16}}>
        {ong==="cotisations"&&<TabCotisations syndicat={selSynd} copros={copros}/>}
        {ong==="alertes"&&<TabAlertes syndicat={selSynd} copros={copros}/>}
        {ong==="reunions"&&<TabReunions syndicat={selSynd}/>}
        {ong==="pap"&&<TabPrelevements syndicat={selSynd} copros={copros}/>}
      </div>
    </div>
  );
}
