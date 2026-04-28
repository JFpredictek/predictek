
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}

var MOIS_FR=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];

function genererRelevePDF(copro,syndicat,paiements,annee){
  var paiesAnnee=paiements.filter(function(p){return p.date_paiement&&p.date_paiement.startsWith(String(annee));});
  var totalPaye=paiesAnnee.filter(function(p){return p.statut==="paye";}).reduce(function(a,p){return a+Number(p.montant||0);},0);
  var totalDu=paiesAnnee.filter(function(p){return p.statut!=="paye";}).reduce(function(a,p){return a+Number(p.montant||0);},0);
  var lignes=paiesAnnee.map(function(p){
    var statutColor=p.statut==="paye"?"#155724":p.statut==="retard"?"#B83232":"#B86020";
    return "<tr><td>"+p.date_paiement+"</td><td>"+(p.description||"Cotisation")+"</td><td style='text-align:right'>"+Number(p.montant||0).toFixed(2)+" $</td><td style='color:"+statutColor+";font-weight:bold'>"+p.statut+"</td></tr>";
  }).join("");

  var solde=totalPaye-((copro.cotisation_mensuelle||0)*12);
  var win=window.open("","_blank");
  win.document.write("<!DOCTYPE html><html><head><title>Releve de compte "+annee+"</title><style>body{font-family:Arial,sans-serif;margin:30px;color:#1C1A17;font-size:12px}h2{color:#13233A;margin-bottom:4px}.entete{display:flex;justify-content:space-between;margin-bottom:24px}.bloc{background:#f5f5f5;padding:14px;border-radius:6px;margin-bottom:16px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ddd;padding:8px 10px}th{background:#e8f2ec;color:#1B5E3B;font-size:11px}.total{background:#e8f2ec;font-weight:bold;font-size:13px}.retard{background:#fdecea}.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:bold}.ok{background:#D4EDDA;color:#155724}.due{background:#FEF3E2;color:#B86020}hr{border:1px solid #ddd}</style></head><body>");
  win.document.write("<div class='entete'><div><h2>Releve de compte "+annee+"</h2><div style='font-size:11px;color:#555'>Syndicat: "+syndicat.nom+"<br>Adresse: "+(syndicat.adr||"-")+"</div></div><div style='text-align:right;font-size:11px;color:#555'>Date d emission: "+new Date().toLocaleDateString("fr-CA")+"<br>Predictek - Gestion de copropriete</div></div><hr/>");
  win.document.write("<div class='bloc'><b>Coproprietaire</b><br>Unite: "+copro.unite+"<br>Nom: "+copro.nom+(copro.prenom?" "+copro.prenom:"")+"<br>Courriel: "+(copro.courriel||"-")+"<br>Cotisation mensuelle: "+Number(copro.cotisation_mensuelle||0).toFixed(2)+" $"+(copro.pap?" (PAP actif)":"")+"</div>");
  win.document.write("<b>Historique des transactions - "+annee+"</b>");
  win.document.write("<table><thead><tr><th>Date</th><th>Description</th><th>Montant</th><th>Statut</th></tr></thead><tbody>");
  win.document.write(lignes||"<tr><td colspan='4' style='text-align:center;color:#888'>Aucune transaction pour cette annee</td></tr>");
  win.document.write("</tbody></table>");
  win.document.write("<table><tr class='total'><td>Total paye "+annee+"</td><td style='text-align:right;color:#1B5E3B'>"+totalPaye.toFixed(2)+" $</td></tr>");
  if(totalDu>0)win.document.write("<tr style='background:#FEF3E2'><td>Montants en attente</td><td style='text-align:right;color:#B86020'>"+totalDu.toFixed(2)+" $</td></tr>");
  win.document.write("<tr class='total'><td>Solde au 31 decembre "+annee+"</td><td style='text-align:right;color:"+(solde>=0?"#1B5E3B":"#B83232")+"'>"+(solde>=0?"Credit":"Debit")+" : "+Math.abs(solde).toFixed(2)+" $</td></tr></table>");
  win.document.write("<p style='font-size:10px;color:#888;margin-top:24px'>Ce releve est genere automatiquement par Predictek. Pour toute question, contactez votre gestionnaire.</p>");
  win.document.write("</body></html>");
  win.document.close();win.print();
}

export default function RelevesCompte(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var copros=s2[0];var setCopros=s2[1];
  var s3=useState(null);var coproSel=s3[0];var setCoproSel=s3[1];
  var s4=useState([]);var paiements=s4[0];var setPaiements=s4[1];
  var s5=useState(new Date().getFullYear());var annee=s5[0];var setAnnee=s5[1];
  var s6=useState("");var recherche=s6[0];var setRecherche=s6[1];
  var s7=useState(false);var loading=s7[0];var setLoading=s7[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setCopros([]);setCoproSel(null);
    sb.select("coproprietaires",{eq:{syndicat_id:sel.id,statut:"actif"},order:"unite.asc"}).then(function(res){
      if(res&&res.data)setCopros(res.data);
    }).catch(function(){});
  },[sel]);

  useEffect(function(){
    if(!coproSel)return;
    setLoading(true);
    sb.select("paiements",{eq:{coproprietaire_id:coproSel.id},order:"date_paiement.desc"}).then(function(res){
      if(res&&res.data)setPaiements(res.data);
      setLoading(false);
    }).catch(function(){setLoading(false);});
  },[coproSel]);

  var filtresCopros=copros.filter(function(c){return !recherche||c.unite.toLowerCase().includes(recherche.toLowerCase())||c.nom.toLowerCase().includes(recherche.toLowerCase());});
  var paiementsAnnee=paiements.filter(function(p){return p.date_paiement&&p.date_paiement.startsWith(String(annee));});
  var totalPaye=paiementsAnnee.filter(function(p){return p.statut==="paye";}).reduce(function(a,p){return a+Number(p.montant||0);},0);
  var totalDu=paiementsAnnee.filter(function(p){return p.statut!=="paye";}).reduce(function(a,p){return a+Number(p.montant||0);},0);

  function genererTous(){
    copros.forEach(function(c,i){
      setTimeout(function(){
        sb.select("paiements",{eq:{coproprietaire_id:c.id},order:"date_paiement.desc"}).then(function(res){
          if(res&&res.data)genererRelevePDF(c,sel,res.data,annee);
        }).catch(function(){});
      },i*500);
    });
  }

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Releves de compte</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <select value={annee} onChange={function(e){setAnnee(parseInt(e.target.value));}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {[2023,2024,2025,2026].map(function(a){return <option key={a} value={a} style={{color:"#000"}}>{a}</option>;})}
        </select>
        {copros.length>0&&<Btn sm bg="#ffffff18" bdr="1px solid #ffffff40" onClick={genererTous}>Tous les releves PDF</Btn>}
      </div>

      <div style={{padding:20,display:"grid",gridTemplateColumns:"280px 1fr",gap:20}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:10}}>{copros.length} coproprietaires</div>
          <input value={recherche} onChange={function(e){setRecherche(e.target.value);}} placeholder="Rechercher unite ou nom..." style={Object.assign({},INP,{marginBottom:10})}/>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
            {filtresCopros.map(function(c){var sel2=coproSel&&coproSel.id===c.id;return(
              <div key={c.id} onClick={function(){setCoproSel(c);}} style={{padding:"10px 14px",cursor:"pointer",background:sel2?T.accentL:"transparent",borderBottom:"1px solid "+T.border,borderLeft:sel2?"3px solid "+T.accent:"3px solid transparent"}}>
                <div style={{fontSize:12,fontWeight:sel2?700:600,color:sel2?T.accent:T.navy}}>Unite {c.unite} - {c.nom}</div>
                <div style={{fontSize:10,color:T.muted}}>{Number(c.cotisation_mensuelle||0).toFixed(2)} $/mois{c.pap?" | PAP":""}</div>
              </div>
            );})}
            {filtresCopros.length===0&&<div style={{padding:20,textAlign:"center",color:T.muted,fontSize:11}}>Aucun coproprietaire</div>}
          </div>
        </div>

        <div>
          {!coproSel&&<div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:40,textAlign:"center",color:T.muted}}>Selectionnez un coproprietaire pour voir son releve</div>}
          {coproSel&&(
            <div>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div>
                    <div style={{fontSize:16,fontWeight:800,color:T.navy}}>Unite {coproSel.unite} - {coproSel.nom}{coproSel.prenom?" "+coproSel.prenom:""}</div>
                    <div style={{fontSize:11,color:T.muted}}>{coproSel.courriel||""} - Cotisation: {Number(coproSel.cotisation_mensuelle||0).toFixed(2)} $/mois</div>
                  </div>
                  <Btn onClick={function(){genererRelevePDF(coproSel,sel,paiements,annee);}}>Generer PDF {annee}</Btn>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
                  <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:10,padding:12}}><div style={{fontSize:11,color:T.muted}}>Total paye {annee}</div><div style={{fontSize:20,fontWeight:800,color:T.accent}}>{totalPaye.toFixed(2)} $</div></div>
                  <div style={{background:totalDu>0?T.amberL:T.alt,border:"1px solid "+(totalDu>0?T.amber+"44":T.border),borderRadius:10,padding:12}}><div style={{fontSize:11,color:T.muted}}>En attente</div><div style={{fontSize:20,fontWeight:800,color:totalDu>0?T.amber:T.muted}}>{totalDu.toFixed(2)} $</div></div>
                  <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:12}}><div style={{fontSize:11,color:T.muted}}>Transactions {annee}</div><div style={{fontSize:20,fontWeight:800,color:T.navy}}>{paiementsAnnee.length}</div></div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:T.alt}}>{["Date","Description","Montant","Statut"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:h==="Montant"?"right":"left",fontWeight:600,color:T.navy}}>{h}</th>;})}</tr></thead>
                  <tbody>
                    {paiementsAnnee.map(function(p){return(<tr key={p.id} style={{borderBottom:"1px solid "+T.border,background:p.statut==="retard"?T.redL:"transparent"}}>
                      <td style={{padding:"8px 10px",color:T.muted}}>{p.date_paiement}</td>
                      <td style={{padding:"8px 10px"}}>{p.description||"Cotisation"}</td>
                      <td style={{padding:"8px 10px",textAlign:"right",fontWeight:600}}>{Number(p.montant||0).toFixed(2)} $</td>
                      <td style={{padding:"8px 10px"}}><span style={{background:p.statut==="paye"?T.accentL:p.statut==="retard"?T.redL:T.amberL,color:p.statut==="paye"?T.accent:p.statut==="retard"?T.red:T.amber,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>{p.statut}</span></td>
                    </tr>);})}
                    {paiementsAnnee.length===0&&<tr><td colSpan={4} style={{padding:20,textAlign:"center",color:T.muted}}>{loading?"Chargement...":"Aucune transaction en "+annee}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
