
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0"};

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

function LigneRapport(p){
  var pct=p.total>0?Math.round(Math.abs(p.v)/p.total*100):0;
  return(
    <tr style={{borderBottom:"1px solid "+T.border,background:p.bold?"#f8f8f6":"transparent"}}>
      <td style={{padding:"8px 12px",paddingLeft:(12+(p.indent||0)*16)+"px",fontSize:p.bold?13:12,fontWeight:p.bold?700:400,color:p.bold?T.navy:T.text}}>{p.l}</td>
      <td style={{padding:"8px 12px",textAlign:"right",fontWeight:p.bold?700:400,color:p.v<0?T.red:T.navy,fontSize:p.bold?13:12}}>{p.v!==undefined&&p.v!==null?Number(p.v).toFixed(2)+" $":""}</td>
      <td style={{padding:"8px 12px",textAlign:"right",fontSize:11,color:T.muted}}>{pct>0?pct+"%":""}</td>
    </tr>
  );
}

function RapportEtatResultats(p){
  var paiements=p.paiements||[];
  var factures=p.factures||[];
  var budget=p.budget||null;

  var revenus={cotisations:paiements.filter(function(x){return x.statut==="paye";}).reduce(function(a,x){return a+Number(x.montant);},0),autres:0};
  var totalRevenus=revenus.cotisations+revenus.autres;

  var depenses={};
  factures.filter(function(f){return f.statut==="payee";}).forEach(function(f){
    var cat=f.categorie_depense||"Depenses diverses";
    if(!depenses[cat])depenses[cat]=0;
    depenses[cat]+=Number(f.total||0);
  });
  var totalDepenses=Object.values(depenses).reduce(function(a,v){return a+v;},0);
  var solde=totalRevenus-totalDepenses;

  function imprimer(){
    var win=window.open("","_blank");
    var depHTML=Object.entries(depenses).map(function(e){return "<tr><td style='padding:6px 12px 6px 24px'>"+e[0]+"</td><td style='text-align:right;padding:6px 12px'>"+e[1].toFixed(2)+" $</td></tr>";}).join("");
    win.document.write("<!DOCTYPE html><html><head><title>Etat des resultats</title><style>body{font-family:Arial,sans-serif;margin:30px;font-size:12px}h2{color:#13233A}table{width:100%;border-collapse:collapse}tr{border-bottom:1px solid #eee}td{padding:6px 12px}.section{background:#f5f5f5;font-weight:bold;font-size:13px}.total{background:#e8f2ec;font-weight:bold;font-size:14px}.deficit{background:#fdecea;font-weight:bold;color:#B83232}</style></head><body>");
    win.document.write("<h2>Etat des resultats</h2>");
    win.document.write("<p><b>Syndicat:</b> "+(p.nomSyndicat||"")+" | <b>Periode:</b> "+new Date().getFullYear()+" | <b>Genere:</b> "+new Date().toLocaleDateString("fr-CA")+"</p>");
    win.document.write("<table><tr class='section'><td>REVENUS</td><td></td></tr>");
    win.document.write("<tr><td style='padding:6px 12px 6px 24px'>Cotisations percues</td><td style='text-align:right;padding:6px 12px'>"+revenus.cotisations.toFixed(2)+" $</td></tr>");
    win.document.write("<tr class='total'><td>Total revenus</td><td style='text-align:right'>"+totalRevenus.toFixed(2)+" $</td></tr>");
    win.document.write("<tr class='section'><td>DEPENSES</td><td></td></tr>"+depHTML);
    win.document.write("<tr class='total'><td>Total depenses</td><td style='text-align:right'>"+totalDepenses.toFixed(2)+" $</td></tr>");
    win.document.write("<tr class='"+(solde>=0?"total":"deficit")+"'><td>"+(solde>=0?"SURPLUS":"DEFICIT")+"</td><td style='text-align:right'>"+solde.toFixed(2)+" $</td></tr>");
    win.document.write("</table></body></html>");
    win.document.close();win.print();
  }

  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:800,color:T.navy}}>Etat des resultats</div>
        <Btn sm onClick={imprimer}>Imprimer PDF</Btn>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{background:T.alt}}>
          <th style={{padding:"8px 12px",textAlign:"left",color:T.navy,fontWeight:700}}>Poste</th>
          <th style={{padding:"8px 12px",textAlign:"right",color:T.navy,fontWeight:700}}>Montant</th>
          <th style={{padding:"8px 12px",textAlign:"right",color:T.navy,fontWeight:700}}>%</th>
        </tr></thead>
        <tbody>
          <tr style={{background:T.accentL}}><td colSpan={3} style={{padding:"6px 12px",fontWeight:700,color:T.accent,fontSize:11,textTransform:"uppercase"}}>Revenus</td></tr>
          <LigneRapport l="Cotisations percues" v={revenus.cotisations} total={totalRevenus}/>
          <LigneRapport l="Total revenus" v={totalRevenus} bold={true}/>
          <tr><td colSpan={3} style={{padding:4}}></td></tr>
          <tr style={{background:T.redL}}><td colSpan={3} style={{padding:"6px 12px",fontWeight:700,color:T.red,fontSize:11,textTransform:"uppercase"}}>Depenses</td></tr>
          {Object.entries(depenses).map(function(e){return <LigneRapport key={e[0]} l={e[0]} v={e[1]} total={totalDepenses} indent={1}/>;  })}
          {Object.keys(depenses).length===0&&<tr><td colSpan={3} style={{padding:"8px 12px",color:T.muted,fontSize:11}}>Aucune facture payee enregistree</td></tr>}
          <LigneRapport l="Total depenses" v={totalDepenses} bold={true}/>
          <tr><td colSpan={3} style={{padding:4}}></td></tr>
          <tr style={{background:solde>=0?T.accentL:T.redL}}>
            <td style={{padding:"10px 12px",fontWeight:800,fontSize:14,color:solde>=0?T.accent:T.red}}>{solde>=0?"SURPLUS":"DEFICIT"}</td>
            <td style={{padding:"10px 12px",textAlign:"right",fontWeight:800,fontSize:16,color:solde>=0?T.accent:T.red}}>{solde.toFixed(2)} $</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function RapportBudgetVsReel(p){
  var lignes=p.lignes||[];
  var revenus=lignes.filter(function(l){return l.type_ligne==="revenu";});
  var depenses=lignes.filter(function(l){return l.type_ligne==="depense";});

  function imprimer(){
    var win=window.open("","_blank");
    var rows=lignes.map(function(l){
      var ecart=Number(l.montant_reel)-Number(l.montant_prevu);
      var pct=l.montant_prevu>0?Math.round(Number(l.montant_reel)/Number(l.montant_prevu)*100):0;
      return "<tr><td>"+l.categorie+"</td><td>"+l.type_ligne+"</td><td style='text-align:right'>"+Number(l.montant_prevu).toFixed(2)+"</td><td style='text-align:right'>"+Number(l.montant_reel).toFixed(2)+"</td><td style='text-align:right;color:"+(ecart>0?"#B83232":"#1B5E3B")+"'>"+ecart.toFixed(2)+"</td><td style='text-align:right'>"+pct+"%</td></tr>";
    }).join("");
    win.document.write("<!DOCTYPE html><html><head><title>Budget vs Reel</title><style>body{font-family:Arial,sans-serif;margin:30px;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 8px}th{background:#f0f0f0}</style></head><body><h2>Budget vs Reel - "+(p.nomSyndicat||"")+"</h2><table><thead><tr><th>Categorie</th><th>Type</th><th>Prevu</th><th>Reel</th><th>Ecart</th><th>%</th></tr></thead><tbody>"+rows+"</tbody></table></body></html>");
    win.document.close();win.print();
  }

  if(lignes.length===0)return <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:30,textAlign:"center",color:T.muted,fontSize:12}}>Aucun budget cree pour ce syndicat. Creez un budget dans le module BU.</div>;

  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:800,color:T.navy}}>Budget vs Reel</div>
        <Btn sm onClick={imprimer}>Imprimer PDF</Btn>
      </div>
      {[{titre:"Revenus",data:revenus,color:T.accent},{titre:"Depenses",data:depenses,color:T.red}].map(function(section){
        var totPrevu=section.data.reduce(function(a,l){return a+Number(l.montant_prevu);},0);
        var totReel=section.data.reduce(function(a,l){return a+Number(l.montant_reel);},0);
        return(
          <div key={section.titre} style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:section.color,textTransform:"uppercase",marginBottom:8}}>{section.titre}</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.alt}}>{["Categorie","Prevu","Reel","Ecart","%"].map(function(h){return <th key={h} style={{padding:"7px 10px",textAlign:h==="Categorie"?"left":"right",fontWeight:600,color:T.navy}}>{h}</th>;})}</tr></thead>
              <tbody>
                {section.data.map(function(l){
                  var ecart=Number(l.montant_reel)-Number(l.montant_prevu);
                  var pct=l.montant_prevu>0?Math.round(Number(l.montant_reel)/Number(l.montant_prevu)*100):0;
                  return(
                    <tr key={l.id} style={{borderBottom:"1px solid "+T.border}}>
                      <td style={{padding:"7px 10px"}}>{l.categorie}</td>
                      <td style={{padding:"7px 10px",textAlign:"right"}}>{Number(l.montant_prevu).toFixed(2)} $</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:600}}>{Number(l.montant_reel).toFixed(2)} $</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:600,color:ecart>0?T.red:ecart<0?T.accent:T.muted}}>{ecart.toFixed(2)} $</td>
                      <td style={{padding:"7px 10px",textAlign:"right",color:T.muted}}>{pct}%</td>
                    </tr>
                  );
                })}
                <tr style={{background:T.alt,fontWeight:700}}>
                  <td style={{padding:"7px 10px"}}>TOTAL</td>
                  <td style={{padding:"7px 10px",textAlign:"right"}}>{totPrevu.toFixed(2)} $</td>
                  <td style={{padding:"7px 10px",textAlign:"right"}}>{totReel.toFixed(2)} $</td>
                  <td style={{padding:"7px 10px",textAlign:"right",color:(totReel-totPrevu)>0?T.red:T.accent}}>{(totReel-totPrevu).toFixed(2)} $</td>
                  <td style={{padding:"7px 10px",textAlign:"right"}}>{totPrevu>0?Math.round(totReel/totPrevu*100):0}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export default function RapportsFinanciers(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var paiements=s2[0];var setPaiements=s2[1];
  var s3=useState([]);var factures=s3[0];var setFactures=s3[1];
  var s4=useState([]);var budgetLignes=s4[0];var setBudgetLignes=s4[1];
  var s5=useState("resultats");var rapport=s5[0];var setRapport=s5[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    var annee=new Date().getFullYear();
    var debut=annee+"-01-01";var fin=annee+"-12-31";
    sb.select("paiements",{eq:{syndicat_id:sel.id},order:"date_paiement.desc"}).then(function(res){if(res&&res.data)setPaiements(res.data);}).catch(function(){});
    sb.select("factures",{eq:{syndicat_id:sel.id},order:"date_facture.desc"}).then(function(res){if(res&&res.data)setFactures(res.data);}).catch(function(){});
    sb.select("budgets",{eq:{syndicat_id:sel.id},order:"annee_debut.desc",limit:1}).then(function(res){
      if(res&&res.data&&res.data.length>0){
        sb.select("budget_lignes",{eq:{budget_id:res.data[0].id}}).then(function(r){if(r&&r.data)setBudgetLignes(r.data);}).catch(function(){});
      }
    }).catch(function(){});
  },[sel]);

  var RAPPORTS=[{id:"resultats",l:"Etat des resultats"},{id:"budget",l:"Budget vs Reel"},{id:"gl",l:"Par compte GL"}];

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Rapports financiers</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
          {RAPPORTS.map(function(r){var a=rapport===r.id;return <button key={r.id} onClick={function(){setRapport(r.id);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",padding:"6px 14px",color:a?"#fff":"#8da0bb",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:400}}>{r.l}</button>;})}
        </div>
      </div>
      <div style={{padding:20}}>
        {rapport==="resultats"&&<RapportEtatResultats paiements={paiements} factures={factures} nomSyndicat={sel?sel.nom:""}/>}
        {rapport==="budget"&&<RapportBudgetVsReel lignes={budgetLignes} nomSyndicat={sel?sel.nom:""}/>}
        {rapport==="gl"&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20}}>
            <div style={{fontSize:14,fontWeight:800,color:T.navy,marginBottom:16}}>Depenses par compte GL</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.alt}}>{["Compte GL","Description","Montant total","Nb factures"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:h==="Montant total"||h==="Nb factures"?"right":"left",fontWeight:600,color:T.navy}}>{h}</th>;})}</tr></thead>
              <tbody>
                {Object.entries(factures.filter(function(f){return f.statut==="payee"&&f.no_compte_gl;}).reduce(function(acc,f){var k=f.no_compte_gl;if(!acc[k])acc[k]={gl:k,desc:f.categorie_depense||"",total:0,nb:0};acc[k].total+=Number(f.total||0);acc[k].nb++;return acc;},{})).sort(function(a,b){return a[0].localeCompare(b[0]);}).map(function(e){var g=e[1];return(
                  <tr key={g.gl} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"8px 10px",fontWeight:700,color:T.accent}}>{g.gl}</td>
                    <td style={{padding:"8px 10px"}}>{g.desc}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",fontWeight:600}}>{g.total.toFixed(2)} $</td>
                    <td style={{padding:"8px 10px",textAlign:"right",color:T.muted}}>{g.nb}</td>
                  </tr>
                );})}
                {factures.filter(function(f){return f.statut==="payee";}).length===0&&<tr><td colSpan={4} style={{padding:20,textAlign:"center",color:T.muted}}>Aucune facture payee</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
