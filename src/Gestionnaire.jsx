import { useState } from "react";
const T={bg:"#F5F3EE",surface:"#FFF",surfaceAlt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentMid:"#2D8653",accentLight:"#E8F2EC",accentPop:"#3CAF6E",gold:"#B8943A",goldLight:"#FAF3E0",red:"#B83232",redLight:"#FDECEA",amber:"#B86020",amberLight:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueLight:"#EFF6FF",purple:"#6B3FA0",purpleLight:"#F3EEFF"};
var money=function(n){if(!n&&n!==0)return"—";return(n<0?"-":"")+Math.abs(n).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var td=function(){return new Date().toISOString().slice(0,10);};
function Badge(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 7px",borderRadius:20,background:p.bg||T.accentLight,color:p.c||T.accent,whiteSpace:"nowrap",display:"inline-block"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} style={{background:p.bg||T.accent,border:p.border||"none",borderRadius:7,padding:p.sm?"4px 10px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",...(p.s||{})}}>{p.children}</button>;}
function Card(p){return <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,...(p.s||{})}}>{p.children}</div>;}
function SH(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,fontWeight:600,...(p.s||{})}}>{p.l}</div>;}
function Modal(p){
  if(!p.open)return null;
  return <div style={{position:"fixed",inset:0,background:"#00000060",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={function(e){if(e.target===e.currentTarget)p.onClose();}}>
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:24,width:p.w||520,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <b style={{fontSize:15,color:T.text}}>{p.title}</b>
        <button onClick={p.onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:T.muted}}>x</button>
      </div>
      {p.children}
    </div>
  </div>;
}
var inp={width:"100%",border:"1px solid "+T.border,borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:T.surface,outline:"none",boxSizing:"border-box"};
function F(p){return <div style={p.s}><div style={{fontSize:10,color:T.muted,marginBottom:3}}>{p.l}</div>{p.children}</div>;}

const SYNDICAT={nom:"Syndicat Piedmont",adresse:"Ch. du Hibou, Stoneham-et-Tewkesbury QC G3C 1T1",president:"Jean-Francois Laroche",immatriculation:"1144524577",exercice:"1 nov au 31 oct",nbUnites:36};
const COMPTES=[
  {id:1,nom:"Compte operation",no:"021258-1",solde:7361.88,type:"operation"},
  {id:2,nom:"Fonds de prevoyance",no:"0212558-ET1",solde:64235.01,type:"prevoyance"},
  {id:3,nom:"Fonds assurance",no:"0212558-ET3",solde:36178.37,type:"assurance"},
];
const BUDGET_INIT=[
  {id:1,cat:"Administration",sous:"Honoraires gestion",budget:28800,reel:14400},
  {id:2,cat:"Administration",sous:"Frais legaux",budget:2000,reel:450},
  {id:3,cat:"Administration",sous:"Assurance syndicat",budget:18500,reel:18500},
  {id:4,cat:"Entretien",sous:"Deneigement",budget:22000,reel:18750},
  {id:5,cat:"Entretien",sous:"Paysagement",budget:8500,reel:5200},
  {id:6,cat:"Entretien",sous:"Entretien batiment",budget:15000,reel:6830},
  {id:7,cat:"Entretien",sous:"Nettoyage",budget:4800,reel:2400},
  {id:8,cat:"Services",sous:"Electricite communes",budget:6000,reel:3150},
  {id:9,cat:"Services",sous:"Aqueduc",budget:3600,reel:1800},
  {id:10,cat:"Fonds prevoyance",sous:"Cotisation prevoyance",budget:36000,reel:18000},
  {id:11,cat:"Imprevus",sous:"Reserve",budget:5000,reel:1200},
];
const FACTURES_INIT=[
  {id:1,fournisseur:"Deneigement Express",date:"2026-04-10",montant:3750.00,desc:"Deneigement mars 2026",statut:"approuvee",compte:1,ref:"FRNC-089",approuvePar:"J-F Laroche",dateApprob:"2026-04-11"},
  {id:2,fournisseur:"Paysagement Horizon",date:"2026-04-15",montant:1200.00,desc:"Entretien printemps phase 1",statut:"en_attente",compte:1,ref:"FRNC-090",approuvePar:"",dateApprob:""},
  {id:3,fournisseur:"Plomberie ProFlo",date:"2026-04-22",montant:485.00,desc:"Reparation fuite unite 527",statut:"en_attente",compte:1,ref:"FRNC-091",approuvePar:"",dateApprob:""},
  {id:4,fournisseur:"AscenseurTech QC",date:"2026-03-31",montant:2200.00,desc:"Inspection annuelle ascenseur",statut:"approuvee",compte:1,ref:"FRNC-088",approuvePar:"J-F Laroche",dateApprob:"2026-04-01"},
  {id:5,fournisseur:"Hydro-Quebec",date:"2026-04-01",montant:892.50,desc:"Electricite parties communes",statut:"approuvee",compte:1,ref:"FRNC-087",approuvePar:"J-F Laroche",dateApprob:"2026-04-02"},
];
const PRELEVEMENTS_INIT=[
  {id:1,date:"2026-05-01",desc:"Cotisations mensuelles - mai 2026",montant:14297.28,statut:"planifie",nbUnites:36,approuvePar:"",dateApprob:""},
  {id:2,date:"2026-04-01",desc:"Cotisations mensuelles - avril 2026",montant:14297.28,statut:"effectue",nbUnites:36,approuvePar:"J-F Laroche",dateApprob:"2026-03-28"},
  {id:3,date:"2026-03-01",desc:"Cotisations mensuelles - mars 2026",montant:14297.28,statut:"effectue",nbUnites:36,approuvePar:"J-F Laroche",dateApprob:"2026-02-26"},
];
const REUNIONS_INIT=[
  {id:1,type:"CA",date:"2026-05-15",heure:"19:00",lieu:"Salle comm. Piedmont",statut:"planifiee",ordre:[{item:"Approbation PV 18 mars"},{item:"Rapport financier Q2"},{item:"Soumissions deneigement 2026-2027"},{item:"Divers"}],pv:"",participants:[]},
  {id:2,type:"CA",date:"2026-03-18",heure:"19:00",lieu:"Salle comm. Piedmont",statut:"tenue",ordre:[{item:"Approbation PV janvier"},{item:"Rapport financier"},{item:"Factures a approuver"}],pv:"Seance ouverte a 19h02. Quorum atteint (4/5 membres). Rapport financier presente et accepte. Factures approuvees a l unanimite. Seance levee a 20h45.",participants:["J-F Laroche","M. Fredette","C. Pinard","R. Donnelly"]},
  {id:3,type:"AGO",date:"2026-01-25",heure:"14:00",lieu:"Centre communautaire Stoneham",statut:"tenue",ordre:[{item:"Ouverture et quorum"},{item:"Rapport annuel"},{item:"Etats financiers 2024-2025"},{item:"Budget 2025-2026"},{item:"Election CA"},{item:"Questions"}],pv:"AGO 2025-2026 tenue le 25 janvier 2026. Quorum: 22 unites (61%). Etats financiers adoptes. Budget approuve. CA reconduit.",participants:["J-F Laroche","J-F Begin","M. Beaudoin","L. Tremblay","C. Pinard","R. Donnelly"]},
];
const CARNET_INIT=[
  {id:1,composante:"Toiture asphalte",installation:"2015-06-01",dureeVie:25,cout:85000,notes:"Inspection 2024: bon etat",dernierEntretien:"2024-09-15"},
  {id:2,composante:"Systeme chauffage central",installation:"2013-09-01",dureeVie:20,cout:42000,notes:"Entretien annuel requis",dernierEntretien:"2025-10-01"},
  {id:3,composante:"Ascenseur",installation:"2013-09-01",dureeVie:25,cout:95000,notes:"Inspection annuelle AscenseurTech",dernierEntretien:"2026-03-31"},
  {id:4,composante:"Revetement exterieur brique",installation:"2013-09-01",dureeVie:40,cout:320000,notes:"RAS",dernierEntretien:"2023-06-01"},
  {id:5,composante:"Portes et fenetres communes",installation:"2020-08-01",dureeVie:25,cout:28000,notes:"Remplacement partiel 2020",dernierEntretien:"2024-06-01"},
  {id:6,composante:"Systeme incendie gicleurs",installation:"2013-09-01",dureeVie:25,cout:38000,notes:"Inspection annuelle obligatoire",dernierEntretien:"2025-11-15"},
  {id:7,composante:"Stationnement asphalte",installation:"2019-05-01",dureeVie:15,cout:45000,notes:"Fissures mineures secteur B",dernierEntretien:"2024-05-01"},
  {id:8,composante:"Systeme electrique commun",installation:"2013-09-01",dureeVie:30,cout:55000,notes:"Inspection 5 ans",dernierEntretien:"2023-09-01"},
  {id:9,composante:"Plomberie parties communes",installation:"2013-09-01",dureeVie:30,cout:48000,notes:"Verification annuelle",dernierEntretien:"2025-06-01"},
  {id:10,composante:"Amenagement paysager",installation:"2014-05-01",dureeVie:15,cout:22000,notes:"Renovation partielle prevue 2027",dernierEntretien:"2025-09-15"},
];

// COPROPRIÉTAIRES pour export
const COPROS_EXPORT=[
  {u:"515",nom:"Michel Beaudoin",tel:"418-555-0101",courriel:"m.beaudoin@email.com",fraction:3.875,cotisation:530.59,statut:"Proprietaire"},
  {u:"517",nom:"Marilou Noreau",tel:"",courriel:"",fraction:2.666,cotisation:365.05,statut:"Proprietaire"},
  {u:"519",nom:"Tommy Boulianne",tel:"",courriel:"",fraction:2.666,cotisation:365.05,statut:"Proprietaire"},
  {u:"521",nom:"Jean-Francois Begin",tel:"",courriel:"",fraction:2.666,cotisation:365.05,statut:"Proprietaire"},
  {u:"523",nom:"Joyce McCartney",tel:"",courriel:"",fraction:2.666,cotisation:365.05,statut:"Proprietaire"},
  {u:"525",nom:"Simon Pellerin",tel:"",courriel:"",fraction:3.833,cotisation:524.84,statut:"Proprietaire"},
  {u:"527",nom:"Fabienne Maltais",tel:"",courriel:"",fraction:3.874,cotisation:530.45,statut:"Proprietaire"},
  {u:"529",nom:"K. Bolduc & A. Fortier",tel:"",courriel:"",fraction:2.133,cotisation:292.06,statut:"Proprietaire"},
  {u:"531",nom:"J-F Laroche & M. Fredette",tel:"819-479-4203",courriel:"jf.laroche@email.com",fraction:2.133,cotisation:292.06,statut:"President CA"},
  {u:"533",nom:"D. Lemaire & K. Marchand",tel:"",courriel:"",fraction:2.389,cotisation:327.12,statut:"Proprietaire"},
  {u:"535",nom:"Guillaume Rouillard",tel:"",courriel:"",fraction:2.133,cotisation:292.06,statut:"Proprietaire"},
  {u:"537",nom:"Catherine Perreault",tel:"",courriel:"",fraction:2.133,cotisation:292.06,statut:"Proprietaire"},
  {u:"539",nom:"Lucette Tremblay",tel:"418-555-0539",courriel:"l.tremblay@email.com",fraction:3.840,cotisation:525.80,statut:"Location"},
  {u:"541",nom:"Emile Poulin",tel:"",courriel:"",fraction:3.847,cotisation:526.76,statut:"Proprietaire"},
  {u:"543",nom:"Michel Salvas",tel:"",courriel:"",fraction:2.133,cotisation:292.06,statut:"Proprietaire"},
  {u:"545",nom:"Julie Bergeron",tel:"",courriel:"",fraction:2.133,cotisation:292.06,statut:"Proprietaire"},
  {u:"547",nom:"Denis Audet",tel:"",courriel:"",fraction:2.392,cotisation:327.53,statut:"Proprietaire"},
  {u:"549",nom:"Nicolas Gignac",tel:"",courriel:"",fraction:2.133,cotisation:292.06,statut:"Proprietaire"},
  {u:"551",nom:"M. Baril & M. Poisson",tel:"",courriel:"",fraction:2.133,cotisation:292.06,statut:"Proprietaire"},
  {u:"553",nom:"Claude Pinard",tel:"",courriel:"",fraction:3.865,cotisation:529.22,statut:"Proprietaire"},
  {u:"555",nom:"Robert Donnelly",tel:"",courriel:"",fraction:3.747,cotisation:513.06,statut:"Proprietaire"},
  {u:"557",nom:"K. Villeneuve & J-S Gagnon",tel:"",courriel:"",fraction:2.067,cotisation:283.03,statut:"Proprietaire"},
  {u:"559",nom:"B. Dufour & N. Massey",tel:"",courriel:"",fraction:2.067,cotisation:283.03,statut:"Proprietaire"},
  {u:"561",nom:"Raymond April",tel:"",courriel:"",fraction:2.328,cotisation:318.77,statut:"Proprietaire"},
  {u:"563",nom:"Luc-Andre Lussier",tel:"",courriel:"",fraction:2.067,cotisation:283.03,statut:"Proprietaire"},
  {u:"565",nom:"M-A Gravel & C. Desjardins",tel:"",courriel:"",fraction:2.067,cotisation:283.03,statut:"Proprietaire"},
  {u:"567",nom:"M-A Gravel & C. Desjardins",tel:"",courriel:"",fraction:3.724,cotisation:509.91,statut:"Proprietaire"},
  {u:"569",nom:"Algest & A. Pelletier",tel:"",courriel:"",fraction:3.569,cotisation:488.69,statut:"Proprietaire"},
  {u:"571",nom:"T. Martineau & C. Deschamps",tel:"",courriel:"",fraction:2.012,cotisation:275.50,statut:"Proprietaire"},
  {u:"573",nom:"V. Tremblay & E. Blanchet",tel:"",courriel:"",fraction:2.012,cotisation:275.50,statut:"Proprietaire"},
  {u:"575",nom:"Caroline Dompierre",tel:"",courriel:"",fraction:2.264,cotisation:310.00,statut:"Proprietaire"},
  {u:"577",nom:"S. Gobeil & M-E Vaillancourt",tel:"",courriel:"",fraction:2.012,cotisation:275.50,statut:"Proprietaire"},
  {u:"579",nom:"Sylvie Bergeron",tel:"",courriel:"",fraction:2.012,cotisation:275.50,statut:"Proprietaire"},
  {u:"581",nom:"Doris Poitras",tel:"",courriel:"",fraction:3.703,cotisation:507.04,statut:"Proprietaire"},
  {u:"583",nom:"S. Grondin & X. Grondin",tel:"418-555-0583",courriel:"s.grondin@email.com",fraction:4.353,cotisation:596.04,statut:"Location (Airbnb)"},
  {u:"585",nom:"Y. Dusseault & A. Beauchesne",tel:"",courriel:"",fraction:4.353,cotisation:596.04,statut:"Proprietaire"},
];

// ========== EXPORT FUNCTIONS ==========
function exportCSV(cols, data, filename) {
  var headers = cols.map(function(c){return c.label;}).join(",");
  var rows = data.map(function(row){
    return cols.map(function(c){
      var val = row[c.key] !== undefined ? row[c.key] : "";
      var s = String(val).replace(/"/g,"""");
      return s.includes(",") || s.includes(""") || s.includes("\n") ? """+s+""" : s;
    }).join(",");
  });
  var csv = [headers].concat(rows).join("\n");
  var bom = "\uFEFF";
  var blob = new Blob([bom+csv],{type:"text/csv;charset=utf-8;"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = filename+".csv"; a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(title, cols, data, subtitle) {
  var win = window.open("","_blank");
  if(!win)return;
  var rows = data.map(function(row){
    return "<tr>"+cols.map(function(c){
      var val = row[c.key] !== undefined ? row[c.key] : "";
      return "<td style=\"padding:5px 8px;border-bottom:1px solid #eee;font-size:11px\">"+val+"</td>";
    }).join("")+"</tr>";
  }).join("");
  var html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>"+title+"</title>";
  html += "<style>body{font-family:Arial,sans-serif;margin:20px;color:#1C1A17}";
  html += "h1{color:#13233A;font-size:18px;margin-bottom:4px}";
  html += ".sub{color:#7C7568;font-size:12px;margin-bottom:16px}";
  html += "table{width:100%;border-collapse:collapse}";
  html += "th{background:#13233A;color:#fff;padding:7px 8px;font-size:11px;text-align:left}";
  html += "tr:nth-child(even){background:#F5F3EE}";
  html += ".footer{margin-top:20px;font-size:10px;color:#7C7568;text-align:right}</style></head><body>";
  html += "<h1>"+title+"</h1>";
  if(subtitle)html += "<div class=\"sub\">"+subtitle+"</div>";
  html += "<table><thead><tr>"+cols.map(function(c){return "<th>"+c.label+"</th>";}).join("")+"</tr></thead><tbody>"+rows+"</tbody></table>";
  html += "<div class=\"footer\">Genere le "+new Date().toLocaleDateString("fr-CA")+" | Syndicat Piedmont | Predictek</div>";
  html += "</body></html>";
  win.document.write(html);
  win.document.close();
  win.print();
}

// ========== EXPORT MODAL ==========
function ExportModal(p) {
  var s1 = useState("copros"); var typeExp = s1[0]; var setTypeExp = s1[1];
  var s2 = useState({u:true,nom:true,tel:true,courriel:true,fraction:true,cotisation:true,statut:true});
  var cols = s2[0]; var setCols = s2[1];
  var s3 = useState("csv"); var fmt = s3[0]; var setFmt = s3[1];

  var ALL_COLS = [
    {key:"u",label:"Unite"},{key:"nom",label:"Proprietaire"},{key:"tel",label:"Telephone"},
    {key:"courriel",label:"Courriel"},{key:"fraction",label:"Fraction %"},
    {key:"cotisation",label:"Cotisation/mois"},{key:"statut",label:"Statut"},
  ];
  var selCols = ALL_COLS.filter(function(c){return cols[c.key];});

  function doExport() {
    var data = COPROS_EXPORT;
    var title = "Registre des coproprietaires - Syndicat Piedmont";
    var subtitle = "36 unites | Exercice 2025-2026 | Total cotisations: "+money(data.reduce(function(a,r){return a+r.cotisation;},0))+"/mois";
    if(fmt==="csv") {
      exportCSV(selCols, data, "registre-copropriétaires-piedmont-"+td());
    } else {
      exportPDF(title, selCols.map(function(c){return {key:c.key,label:c.label};}), data.map(function(r){
        var row = {};
        selCols.forEach(function(c){
          if(c.key==="fraction")row[c.key]=r[c.key].toFixed(3)+"%";
          else if(c.key==="cotisation")row[c.key]=money(r[c.key]);
          else row[c.key]=r[c.key];
        });
        return row;
      }), subtitle);
    }
    p.onClose();
  }

  return (
    <Modal open={p.open} onClose={p.onClose} title="Exporter la liste des coproprietaires" w={480}>
      <div style={{marginBottom:14}}>
        <SH l="Format d export"/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={function(){setFmt("csv");}} style={{flex:1,padding:"10px",border:"2px solid "+(fmt==="csv"?T.accent:T.border),borderRadius:8,background:fmt==="csv"?T.accentLight:T.surface,color:fmt==="csv"?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontWeight:fmt==="csv"?700:400}}>Excel / CSV</button>
          <button onClick={function(){setFmt("pdf");}} style={{flex:1,padding:"10px",border:"2px solid "+(fmt==="pdf"?T.navy:T.border),borderRadius:8,background:fmt==="pdf"?T.blueLight:T.surface,color:fmt==="pdf"?T.navy:T.muted,cursor:"pointer",fontFamily:"inherit",fontWeight:fmt==="pdf"?700:400}}>PDF (impression)</button>
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <SH l="Colonnes a inclure"/>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {ALL_COLS.map(function(c){var on=cols[c.key];return(
            <button key={c.key} onClick={function(){setCols(function(prev){var n=Object.assign({},prev);n[c.key]=!n[c.key];return n;});}} style={{padding:"4px 10px",border:"1px solid "+(on?T.accent:T.border),borderRadius:20,background:on?T.accentLight:T.surface,color:on?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:on?600:400}}>{c.label}</button>
          );})}
        </div>
        <div style={{fontSize:11,color:T.muted,marginTop:8}}>{selCols.length} colonne(s) selectionnee(s)</div>
      </div>
      <div style={{background:T.surfaceAlt,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:11,color:T.muted}}>
        36 coproprietaires | Syndicat Piedmont | Genere le {td()}
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={doExport} s={{flex:1}}>Exporter {fmt==="csv"?"CSV":"PDF"}</Btn>
        <Btn onClick={p.onClose} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn>
      </div>
    </Modal>
  );
}

// ========== TAB BORD ==========
function TabBord(p){
  var totalBudget=BUDGET_INIT.reduce(function(a,b){return a+b.budget;},0);
  var totalReel=BUDGET_INIT.reduce(function(a,b){return a+b.reel;},0);
  var totalSoldes=COMPTES.reduce(function(a,c){return a+c.solde;},0);
  var factEnAttente=p.factures.filter(function(f){return f.statut==="en_attente";});
  var prevPlanifie=p.prelevements.filter(function(pr){return pr.statut==="planifie";});
  var prochReunion=p.reunions.filter(function(r){return r.statut==="planifiee";}).sort(function(a,b){return a.date.localeCompare(b.date);})[0];
  var alertesCarnet=p.carnet.filter(function(c){var a=(new Date().getFullYear()-parseInt(c.installation.substring(0,4)));return (a/c.dureeVie)>=0.8;}).length;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[
          {l:"Solde total comptes",v:money(totalSoldes),c:T.accent,bg:T.accentLight,sub:"3 comptes bancaires"},
          {l:"Factures en attente",v:factEnAttente.length,c:factEnAttente.length>0?T.amber:T.accent,bg:factEnAttente.length>0?T.amberLight:T.accentLight,sub:money(factEnAttente.reduce(function(a,f){return a+f.montant;},0))},
          {l:"Budget utilise 6 mois",v:Math.round(totalReel/totalBudget*100)+"%",c:T.navy,bg:T.blueLight,sub:money(totalReel)+" / "+money(totalBudget)},
          {l:"Alertes carnet Loi 16",v:alertesCarnet,c:alertesCarnet>0?T.red:T.accent,bg:alertesCarnet>0?T.redLight:T.accentLight,sub:"composantes > 80% duree"},
        ].map(function(s,i){return(
          <div key={i} style={{background:s.bg,borderRadius:12,padding:"14px 16px",border:"1px solid "+s.c+"30"}}>
            <div style={{fontSize:10,color:s.c,fontWeight:600,marginBottom:4,textTransform:"uppercase"}}>{s.l}</div>
            <div style={{fontSize:22,fontWeight:800,color:s.c,marginBottom:2}}>{s.v}</div>
            <div style={{fontSize:10,color:s.c+"99"}}>{s.sub}</div>
          </div>
        );})}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <SH l="Comptes bancaires"/>
          {COMPTES.map(function(c){return(
            <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+T.border}}>
              <div><div style={{fontSize:13,fontWeight:600,color:T.text}}>{c.nom}</div><div style={{fontSize:10,color:T.muted}}>No {c.no}</div></div>
              <div style={{fontSize:15,fontWeight:700,color:T.accent}}>{money(c.solde)}</div>
            </div>
          );})}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:10}}>
            <b style={{fontSize:12,color:T.text}}>Total</b>
            <b style={{fontSize:14,color:T.navy}}>{money(totalSoldes)}</b>
          </div>
        </Card>
        <div>
          <Card s={{marginBottom:12}}>
            <SH l="Factures en attente d approbation"/>
            {factEnAttente.length===0&&<div style={{color:T.muted,fontSize:12}}>Aucune facture en attente</div>}
            {factEnAttente.map(function(f){return(
              <div key={f.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+T.border}}>
                <div><div style={{fontSize:12,fontWeight:600,color:T.text}}>{f.fournisseur}</div><div style={{fontSize:10,color:T.muted}}>{f.date} — {f.desc.substring(0,30)}</div></div>
                <div style={{fontSize:13,fontWeight:700,color:T.amber}}>{money(f.montant)}</div>
              </div>
            );})}
          </Card>
          {prochReunion&&<Card s={{marginBottom:12}}>
            <SH l="Prochaine reunion CA"/>
            <div style={{fontSize:14,fontWeight:700,color:T.navy}}>{prochReunion.date} a {prochReunion.heure}</div>
            <div style={{fontSize:12,color:T.muted,marginTop:4}}>{prochReunion.lieu}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:8}}>{prochReunion.ordre.length} points ordre du jour</div>
          </Card>}
          {prevPlanifie.length>0&&<Card>
            <SH l="Prelevement planifie"/>
            {prevPlanifie.map(function(pr){return(
              <div key={pr.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:12,fontWeight:600}}>{pr.date}</div><div style={{fontSize:10,color:T.muted}}>{pr.nbUnites} unites</div></div>
                <div style={{fontSize:14,fontWeight:700,color:T.blue}}>{money(pr.montant)}</div>
              </div>
            );})}
          </Card>}
        </div>
      </div>
    </div>
  );
}

// ========== TAB FINANCES ==========
function TabFinances(p){
  var s1=useState("budget"); var sousOng=s1[0]; var setSousOng=s1[1];
  var s2=useState(null); var modal=s2[0]; var setModal=s2[1];
  var s3=useState({}); var form=s3[0]; var setForm=s3[1];
  function sf(k,v){setForm(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}
  function approuverFacture(id){p.setFactures(function(prev){return prev.map(function(f){return f.id===id?Object.assign({},f,{statut:"approuvee",approuvePar:"J-F Laroche",dateApprob:td()}):f;});});}
  function approuverPrelevement(id){p.setPrelevements(function(prev){return prev.map(function(pr){return pr.id===id?Object.assign({},pr,{statut:"approuve",approuvePar:"J-F Laroche",dateApprob:td()}):pr;});});}
  var totalB=BUDGET_INIT.reduce(function(a,b){return a+b.budget;},0);
  var totalR=BUDGET_INIT.reduce(function(a,b){return a+b.reel;},0);
  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["budget","Budget"],["factures","Approbation factures"],["prelevements","Prelevements"]].map(function(t){var a=sousOng===t[0];return(
          <button key={t[0]} onClick={function(){setSousOng(t[0]);}} style={{background:a?T.navy:"#fff",border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"5px 14px",color:a?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>
        );})}
      </div>
      {sousOng==="budget"&&(
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <b style={{fontSize:14,color:T.navy}}>Budget 2025-2026 — 6 mois</b>
            <div style={{display:"flex",gap:8}}>
              <Badge bg={T.blueLight} c={T.blue}>{Math.round(totalR/totalB*100)}% utilise</Badge>
              <Btn sm onClick={function(){exportCSV([{key:"cat",label:"Categorie"},{key:"sous",label:"Poste"},{key:"budget",label:"Budget"},{key:"reel",label:"Reel 6 mois"}],BUDGET_INIT,"budget-piedmont-"+td());}}>Export CSV</Btn>
              <Btn sm bg={T.navy} onClick={function(){exportPDF("Budget 2025-2026 - Syndicat Piedmont",[{key:"cat",label:"Categorie"},{key:"sous",label:"Poste"},{key:"budget",label:"Budget annuel"},{key:"reel",label:"Reel 6 mois"}],BUDGET_INIT.map(function(b){return Object.assign({},b,{budget:money(b.budget),reel:money(b.reel)});}));}}>Export PDF</Btn>
            </div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:T.surfaceAlt}}>
                {["Categorie","Poste","Budget","Reel 6 mois","% utilise"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:h==="Budget"||h==="Reel 6 mois"?"right":"left",fontSize:10,color:T.muted,fontWeight:600}}>{h}</th>;})}
              </tr>
            </thead>
            <tbody>
              {BUDGET_INIT.map(function(b){var pct=Math.round(b.reel/b.budget*100);return(
                <tr key={b.id} style={{borderBottom:"1px solid "+T.border}}>
                  <td style={{padding:"8px 10px",color:T.muted,fontSize:11}}>{b.cat}</td>
                  <td style={{padding:"8px 10px",color:T.text}}>{b.sous}</td>
                  <td style={{padding:"8px 10px",textAlign:"right"}}>{money(b.budget)}</td>
                  <td style={{padding:"8px 10px",textAlign:"right",color:b.reel>(b.budget/2)?T.amber:T.text}}>{money(b.reel)}</td>
                  <td style={{padding:"8px 10px",textAlign:"right"}}><span style={{fontSize:10,fontWeight:700,color:pct>100?T.red:pct>85?T.amber:T.accent}}>{pct}%</span></td>
                </tr>
              );})}
              <tr style={{background:T.surfaceAlt,fontWeight:700}}>
                <td colSpan={2} style={{padding:"10px",color:T.navy}}>TOTAL</td>
                <td style={{padding:"10px",textAlign:"right",color:T.navy}}>{money(totalB)}</td>
                <td style={{padding:"10px",textAlign:"right",color:T.navy}}>{money(totalR)}</td>
                <td style={{padding:"10px",textAlign:"right",color:T.navy}}>{Math.round(totalR/totalB*100)}%</td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}
      {sousOng==="factures"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <b style={{fontSize:14,color:T.navy}}>Factures</b>
            <div style={{display:"flex",gap:8}}>
              <Btn sm onClick={function(){exportCSV([{key:"fournisseur",label:"Fournisseur"},{key:"date",label:"Date"},{key:"montant",label:"Montant"},{key:"desc",label:"Description"},{key:"ref",label:"Ref"},{key:"statut",label:"Statut"},{key:"approuvePar",label:"Approuve par"}],p.factures,"factures-piedmont-"+td());}}>Export CSV</Btn>
              <Btn sm bg={T.navy} onClick={function(){exportPDF("Factures - Syndicat Piedmont",[{key:"fournisseur",label:"Fournisseur"},{key:"date",label:"Date"},{key:"montant",label:"Montant"},{key:"statut",label:"Statut"}],p.factures.map(function(f){return Object.assign({},f,{montant:money(f.montant),statut:f.statut==="approuvee"?"Approuvee":"En attente"});}));}}>PDF</Btn>
              <Btn sm onClick={function(){setForm({fournisseur:"",date:td(),montant:"",desc:"",compte:1,ref:""});setModal("facture");}}>+ Facture</Btn>
            </div>
          </div>
          <Card>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.surfaceAlt}}>{["Fournisseur","Date","Description","Ref","Montant","Statut","Action"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:h==="Montant"?"right":"left",fontSize:10,color:T.muted,fontWeight:600}}>{h}</th>;})}</tr></thead>
              <tbody>
                {p.factures.map(function(f){return(
                  <tr key={f.id} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"8px 10px",fontWeight:600}}>{f.fournisseur}</td>
                    <td style={{padding:"8px 10px",color:T.muted}}>{f.date}</td>
                    <td style={{padding:"8px 10px",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.desc}</td>
                    <td style={{padding:"8px 10px",color:T.muted}}>{f.ref}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700}}>{money(f.montant)}</td>
                    <td style={{padding:"8px 10px"}}><Badge bg={f.statut==="approuvee"?T.accentLight:T.amberLight} c={f.statut==="approuvee"?T.accent:T.amber}>{f.statut==="approuvee"?"Approuvee":"En attente"}</Badge></td>
                    <td style={{padding:"8px 10px"}}>{f.statut==="en_attente"&&<Btn sm onClick={function(){approuverFacture(f.id);}}>Approuver</Btn>}{f.statut==="approuvee"&&<span style={{fontSize:10,color:T.muted}}>{f.approuvePar}</span>}</td>
                  </tr>
                );})}
              </tbody>
            </table>
          </Card>
          <Modal open={modal==="facture"} onClose={function(){setModal(null);}} title="Nouvelle facture" w={500}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <F l="Fournisseur" s={{gridColumn:"1/-1"}}><input value={form.fournisseur||""} onChange={function(e){sf("fournisseur",e.target.value);}} style={inp}/></F>
              <F l="Date"><input type="date" value={form.date||""} onChange={function(e){sf("date",e.target.value);}} style={inp}/></F>
              <F l="Montant"><input type="number" value={form.montant||""} onChange={function(e){sf("montant",parseFloat(e.target.value)||0);}} style={inp}/></F>
              <F l="Description" s={{gridColumn:"1/-1"}}><input value={form.desc||""} onChange={function(e){sf("desc",e.target.value);}} style={inp}/></F>
              <F l="Reference"><input value={form.ref||""} onChange={function(e){sf("ref",e.target.value);}} style={inp}/></F>
              <F l="Compte"><select value={form.compte||1} onChange={function(e){sf("compte",parseInt(e.target.value));}} style={inp}>{COMPTES.map(function(c){return <option key={c.id} value={c.id}>{c.nom}</option>;})}</select></F>
            </div>
            <div style={{display:"flex",gap:8}}><Btn onClick={function(){p.setFactures(function(prev){return prev.concat([Object.assign({},form,{id:Date.now(),statut:"en_attente",approuvePar:"",dateApprob:""})]);});setModal(null);}}>Enregistrer</Btn><Btn onClick={function(){setModal(null);}} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn></div>
          </Modal>
        </div>
      )}
      {sousOng==="prelevements"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <b style={{fontSize:14,color:T.navy}}>Prelevements bancaires</b>
            <div style={{display:"flex",gap:8}}>
              <Btn sm onClick={function(){exportCSV([{key:"date",label:"Date"},{key:"desc",label:"Description"},{key:"nbUnites",label:"Unites"},{key:"montant",label:"Montant"},{key:"statut",label:"Statut"},{key:"approuvePar",label:"Approuve par"}],p.prelevements,"prelevements-piedmont-"+td());}}>Export CSV</Btn>
              <Btn sm onClick={function(){setForm({date:"",desc:"Cotisations mensuelles",montant:14297.28,nbUnites:36});setModal("prlv");}}>+ Prelevement</Btn>
            </div>
          </div>
          <Card>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.surfaceAlt}}>{["Date","Description","Unites","Montant","Statut","Action"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:h==="Montant"?"right":"left",fontSize:10,color:T.muted,fontWeight:600}}>{h}</th>;})}</tr></thead>
              <tbody>
                {p.prelevements.map(function(pr){return(
                  <tr key={pr.id} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"8px 10px",fontWeight:600}}>{pr.date}</td>
                    <td style={{padding:"8px 10px"}}>{pr.desc}</td>
                    <td style={{padding:"8px 10px",color:T.muted}}>{pr.nbUnites}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:T.navy}}>{money(pr.montant)}</td>
                    <td style={{padding:"8px 10px"}}><Badge bg={pr.statut==="effectue"?T.accentLight:pr.statut==="approuve"?T.blueLight:T.amberLight} c={pr.statut==="effectue"?T.accent:pr.statut==="approuve"?T.blue:T.amber}>{pr.statut==="effectue"?"Effectue":pr.statut==="approuve"?"Approuve":"Planifie"}</Badge></td>
                    <td style={{padding:"8px 10px"}}>{pr.statut==="planifie"&&<Btn sm onClick={function(){approuverPrelevement(pr.id);}}>Approuver</Btn>}{pr.statut!=="planifie"&&<span style={{fontSize:10,color:T.muted}}>{pr.approuvePar}</span>}</td>
                  </tr>
                );})}
              </tbody>
            </table>
          </Card>
          <Modal open={modal==="prlv"} onClose={function(){setModal(null);}} title="Nouveau prelevement" w={440}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <F l="Date"><input type="date" value={form.date||""} onChange={function(e){sf("date",e.target.value);}} style={inp}/></F>
              <F l="Nb unites"><input type="number" value={form.nbUnites||36} onChange={function(e){sf("nbUnites",parseInt(e.target.value)||0);}} style={inp}/></F>
              <F l="Montant total" s={{gridColumn:"1/-1"}}><input type="number" value={form.montant||""} onChange={function(e){sf("montant",parseFloat(e.target.value)||0);}} style={inp}/></F>
              <F l="Description" s={{gridColumn:"1/-1"}}><input value={form.desc||""} onChange={function(e){sf("desc",e.target.value);}} style={inp}/></F>
            </div>
            <div style={{display:"flex",gap:8}}><Btn onClick={function(){p.setPrelevements(function(prev){return prev.concat([Object.assign({},form,{id:Date.now(),statut:"planifie",approuvePar:"",dateApprob:""})]);});setModal(null);}}>Enregistrer</Btn><Btn onClick={function(){setModal(null);}} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn></div>
          </Modal>
        </div>
      )}
    </div>
  );
}

// ========== TAB REUNIONS ==========
function TabReunions(p){
  var s1=useState(null); var sel=s1[0]; var setSel=s1[1];
  var s2=useState(null); var modal=s2[0]; var setModal=s2[1];
  var s3=useState({}); var form=s3[0]; var setForm=s3[1];
  function sf(k,v){setForm(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}
  var selR=sel?p.reunions.find(function(r){return r.id===sel;}):null;
  return(
    <div style={{display:"flex",gap:14}}>
      <div style={{width:300,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <b style={{fontSize:14,color:T.navy}}>Reunions</b>
          <div style={{display:"flex",gap:6}}>
            <Btn sm onClick={function(){exportPDF("Reunions CA - Syndicat Piedmont",[{key:"type",label:"Type"},{key:"date",label:"Date"},{key:"statut",label:"Statut"}],p.reunions.map(function(r){return Object.assign({},r,{statut:r.statut==="tenue"?"Tenue":"Planifiee"});}));}}>PDF</Btn>
            <Btn sm onClick={function(){setForm({type:"CA",date:"",heure:"19:00",lieu:"Salle comm. Piedmont",statut:"planifiee"});setModal("reunion");}}>+ Nouvelle</Btn>
          </div>
        </div>
        {p.reunions.sort(function(a,b){return b.date.localeCompare(a.date);}).map(function(r){return(
          <div key={r.id} onClick={function(){setSel(r.id);}} style={{background:sel===r.id?T.accentLight:T.surface,border:"1px solid "+(sel===r.id?T.accent:T.border),borderRadius:10,padding:12,marginBottom:8,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <Badge bg={r.type==="AGO"?T.purpleLight:T.blueLight} c={r.type==="AGO"?T.purple:T.blue}>{r.type}</Badge>
              <Badge bg={r.statut==="tenue"?T.accentLight:T.amberLight} c={r.statut==="tenue"?T.accent:T.amber}>{r.statut==="tenue"?"Tenue":"Planifiee"}</Badge>
            </div>
            <div style={{fontSize:13,fontWeight:600,color:T.text}}>{r.date} a {r.heure}</div>
            <div style={{fontSize:11,color:T.muted}}>{r.lieu}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:4}}>{r.ordre.length} pts{r.pv?" • PV disponible":""}</div>
          </div>
        );})}
      </div>
      <div style={{flex:1}}>
        {!selR&&<div style={{textAlign:"center",color:T.muted,padding:60,fontSize:13}}>Selectionnez une reunion</div>}
        {selR&&(
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:T.navy}}>{selR.type} — {selR.date}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>{selR.heure} | {selR.lieu}</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <Btn sm bg={T.navy} onClick={function(){exportPDF("PV - "+selR.type+" du "+selR.date+" - Syndicat Piedmont",[{key:"num",label:"#"},{key:"item",label:"Point a l ordre du jour"}],selR.ordre.map(function(o,i){return {num:i+1,item:o.item};}),selR.pv?"Proces-verbal: "+selR.pv:"");}}>Imprimer PV</Btn>
                <Badge bg={selR.statut==="tenue"?T.accentLight:T.amberLight} c={selR.statut==="tenue"?T.accent:T.amber}>{selR.statut==="tenue"?"Tenue":"Planifiee"}</Badge>
              </div>
            </div>
            <SH l="Ordre du jour"/>
            {selR.ordre.map(function(o,i){return(
              <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:"1px solid "+T.border,alignItems:"center"}}>
                <span style={{width:20,height:20,borderRadius:"50%",background:T.navy,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
                <span style={{fontSize:12,color:T.text}}>{o.item}</span>
              </div>
            );})}
            {selR.participants&&selR.participants.length>0&&<div style={{marginTop:14}}><SH l="Participants"/><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{selR.participants.map(function(pt){return <Badge key={pt} bg={T.blueLight} c={T.blue}>{pt}</Badge>;})}</div></div>}
            {selR.pv&&<div style={{marginTop:14}}><SH l="Proces-verbal"/><div style={{background:T.surfaceAlt,borderRadius:8,padding:14,fontSize:12,color:T.text,lineHeight:1.6}}>{selR.pv}</div></div>}
          </Card>
        )}
      </div>
      <Modal open={modal==="reunion"} onClose={function(){setModal(null);}} title="Nouvelle reunion" w={440}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <F l="Type"><select value={form.type||"CA"} onChange={function(e){sf("type",e.target.value);}} style={inp}><option value="CA">Reunion CA</option><option value="AGO">AGO</option><option value="AGE">AGE</option></select></F>
          <F l="Statut"><select value={form.statut||"planifiee"} onChange={function(e){sf("statut",e.target.value);}} style={inp}><option value="planifiee">Planifiee</option><option value="tenue">Tenue</option></select></F>
          <F l="Date"><input type="date" value={form.date||""} onChange={function(e){sf("date",e.target.value);}} style={inp}/></F>
          <F l="Heure"><input type="time" value={form.heure||"19:00"} onChange={function(e){sf("heure",e.target.value);}} style={inp}/></F>
          <F l="Lieu" s={{gridColumn:"1/-1"}}><input value={form.lieu||""} onChange={function(e){sf("lieu",e.target.value);}} style={inp}/></F>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={function(){p.setReunions(function(prev){return prev.concat([Object.assign({},form,{id:Date.now(),ordre:[],pv:"",participants:[]})]);});setModal(null);}}>Creer</Btn><Btn onClick={function(){setModal(null);}} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn></div>
      </Modal>
    </div>
  );
}

// ========== TAB CARNET ==========
function TabCarnet(p){
  var s1=useState(null); var modal=s1[0]; var setModal=s1[1];
  var s2=useState({}); var form=s2[0]; var setForm=s2[1];
  function sf(k,v){setForm(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}
  function statC(c){
    var age=new Date().getFullYear()-parseInt(c.installation.substring(0,4));
    var pct=Math.round(age/c.dureeVie*100);
    var yr=parseInt(c.installation.substring(0,4))+c.dureeVie;
    if(pct>=100)return{c:T.red,bg:T.redLight,l:"Remplacement du",pct:100,yr:yr};
    if(pct>=80)return{c:T.red,bg:T.redLight,l:"Urgent "+yr,pct:pct,yr:yr};
    if(pct>=60)return{c:T.amber,bg:T.amberLight,l:"Attention "+yr,pct:pct,yr:yr};
    return{c:T.accent,bg:T.accentLight,l:"OK - "+yr,pct:pct,yr:yr};
  }
  var coutTotal=p.carnet.reduce(function(a,c){return a+c.cout;},0);
  var alertes=p.carnet.filter(function(c){return statC(c).pct>=80;}).length;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <b style={{fontSize:14,color:T.navy,display:"block"}}>Carnet d entretien — Loi 16</b>
          <span style={{fontSize:11,color:T.muted}}>{p.carnet.length} composantes | {money(coutTotal)} | {alertes} alerte(s)</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn sm onClick={function(){exportCSV([{key:"composante",label:"Composante"},{key:"installation",label:"Installation"},{key:"dureeVie",label:"Duree vie (ans)"},{key:"cout",label:"Cout ($)"},{key:"pct",label:"% utilise"},{key:"yr",label:"Remplacement"},{key:"notes",label:"Notes"}],p.carnet.map(function(c){var st=statC(c);return Object.assign({},c,{pct:st.pct+"%",yr:st.yr});}), "carnet-entretien-piedmont-"+td());}}>Export CSV</Btn>
          <Btn sm bg={T.navy} onClick={function(){exportPDF("Carnet d entretien - Syndicat Piedmont (Loi 16)",[{key:"composante",label:"Composante"},{key:"installation",label:"Install."},{key:"dureeVie",label:"Duree"},{key:"cout",label:"Cout"},{key:"pct",label:"% utilise"},{key:"yr",label:"Remplacement"}],p.carnet.map(function(c){var st=statC(c);return Object.assign({},c,{cout:money(c.cout),dureeVie:c.dureeVie+" ans",pct:st.pct+"%",yr:st.yr});}));}}>PDF</Btn>
          <Btn sm onClick={function(){setForm({composante:"",installation:"",dureeVie:20,cout:0,notes:"",dernierEntretien:""});setModal("comp");}}>+ Composante</Btn>
        </div>
      </div>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:T.navy}}>{["Composante","Install.","Duree","Remplacement","Cout","% utilise","Statut","Dernier entretien"].map(function(h){return <th key={h} style={{padding:"8px 10px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>;})}</tr></thead>
          <tbody>
            {p.carnet.map(function(c){var st=statC(c);return(
              <tr key={c.id} style={{borderBottom:"1px solid "+T.border,background:st.pct>=80?st.bg:"transparent"}}>
                <td style={{padding:"9px 10px",fontWeight:600,fontSize:12}}>{c.composante}</td>
                <td style={{padding:"9px 10px",color:T.muted,fontSize:11}}>{c.installation.substring(0,4)}</td>
                <td style={{padding:"9px 10px",color:T.muted,fontSize:11}}>{c.dureeVie} ans</td>
                <td style={{padding:"9px 10px",fontWeight:600,color:st.c,fontSize:11}}>{st.yr}</td>
                <td style={{padding:"9px 10px",fontSize:11}}>{money(c.cout)}</td>
                <td style={{padding:"9px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{flex:1,height:6,background:T.border,borderRadius:3,overflow:"hidden",minWidth:50}}>
                      <div style={{width:Math.min(st.pct,100)+"%",height:"100%",background:st.c,borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:st.c,whiteSpace:"nowrap"}}>{st.pct}%</span>
                  </div>
                </td>
                <td style={{padding:"9px 10px"}}><Badge bg={st.bg} c={st.c}>{st.l}</Badge></td>
                <td style={{padding:"9px 10px",color:T.muted,fontSize:11}}>{c.dernierEntretien||"—"}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
      <div style={{marginTop:10,background:T.amberLight,borderRadius:8,padding:"10px 14px",fontSize:11,color:T.amber}}>Loi 16: Le syndicat doit maintenir ce carnet a jour et realiser une etude du fonds de prevoyance tous les 5 ans. Prochaine etude: 2028.</div>
      <Modal open={modal==="comp"} onClose={function(){setModal(null);}} title="Nouvelle composante" w={480}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <F l="Composante" s={{gridColumn:"1/-1"}}><input value={form.composante||""} onChange={function(e){sf("composante",e.target.value);}} style={inp}/></F>
          <F l="Date installation"><input type="date" value={form.installation||""} onChange={function(e){sf("installation",e.target.value);}} style={inp}/></F>
          <F l="Duree de vie (ans)"><input type="number" value={form.dureeVie||20} onChange={function(e){sf("dureeVie",parseInt(e.target.value)||20);}} style={inp}/></F>
          <F l="Cout remplacement ($)"><input type="number" value={form.cout||""} onChange={function(e){sf("cout",parseInt(e.target.value)||0);}} style={inp}/></F>
          <F l="Dernier entretien"><input type="date" value={form.dernierEntretien||""} onChange={function(e){sf("dernierEntretien",e.target.value);}} style={inp}/></F>
          <F l="Notes" s={{gridColumn:"1/-1"}}><input value={form.notes||""} onChange={function(e){sf("notes",e.target.value);}} style={inp}/></F>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={function(){p.setCarnet(function(prev){return prev.concat([Object.assign({},form,{id:Date.now()})]);});setModal(null);}}>Ajouter</Btn><Btn onClick={function(){setModal(null);}} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn></div>
      </Modal>
    </div>
  );
}

// ========== MODULE PRINCIPAL ==========
export default function Gestionnaire(){
  var s1=useState("bord"); var onglet=s1[0]; var setOnglet=s1[1];
  var s2=useState(FACTURES_INIT); var factures=s2[0]; var setFactures=s2[1];
  var s3=useState(PRELEVEMENTS_INIT); var prelevements=s3[0]; var setPrelevements=s3[1];
  var s4=useState(REUNIONS_INIT); var reunions=s4[0]; var setReunions=s4[1];
  var s5=useState(CARNET_INIT); var carnet=s5[0]; var setCarnet=s5[1];
  var s6=useState(false); var showExport=s6[0]; var setShowExport=s6[1];

  var TABS=[
    {id:"bord",l:"Tableau de bord",icon:"📊"},
    {id:"finances",l:"Finances",icon:"💰"},
    {id:"reunions",l:"Reunions & PV",icon:"📋"},
    {id:"carnet",l:"Carnet entretien",icon:"🏗"},
  ];
  var factEnAttente=factures.filter(function(f){return f.statut==="en_attente";}).length;

  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>{SYNDICAT.nom}</div>
          <div style={{fontSize:12,color:T.muted}}>{SYNDICAT.adresse} | President: {SYNDICAT.president} | {SYNDICAT.nbUnites} unites | Immat: {SYNDICAT.immatriculation}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {factEnAttente>0&&<Badge bg={T.amberLight} c={T.amber}>{factEnAttente} facture(s) a approuver</Badge>}
          <Btn onClick={function(){setShowExport(true);}} bg={T.navy}>Liste copropriétaires</Btn>
        </div>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap",background:T.surface,padding:6,borderRadius:10,border:"1px solid "+T.border}}>
        {TABS.map(function(t){var a=onglet===t.id;return(
          <button key={t.id} onClick={function(){setOnglet(t.id);}} style={{display:"flex",alignItems:"center",gap:6,background:a?T.navy:"transparent",border:"none",borderRadius:8,padding:"7px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>
            <span style={{fontSize:14}}>{t.icon}</span>{t.l}
          </button>
        );})}
      </div>
      {onglet==="bord"&&<TabBord factures={factures} prelevements={prelevements} reunions={reunions} carnet={carnet}/>}
      {onglet==="finances"&&<TabFinances factures={factures} setFactures={setFactures} prelevements={prelevements} setPrelevements={setPrelevements}/>}
      {onglet==="reunions"&&<TabReunions reunions={reunions} setReunions={setReunions}/>}
      {onglet==="carnet"&&<TabCarnet carnet={carnet} setCarnet={setCarnet}/>}
      <ExportModal open={showExport} onClose={function(){setShowExport(false);}}/>
    </div>
  );
}
