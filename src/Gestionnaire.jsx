import { useState } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",pop:"#3CAF6E",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var fmt=function(n){if(!n&&n!==0)return"—";return Math.abs(n).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var today=function(){return new Date().toISOString().slice(0,10);};
var daysLeft=function(d){return d?Math.ceil((new Date(d)-new Date())/86400000):9999;};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Bdg(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap",display:"inline-block"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} style={{background:p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Row(p){return <div style={{display:"flex",justifyContent:"space-between",alignItems:p.al||"center",padding:"9px 0",borderBottom:p.last?"none":"1px solid "+T.border}}>{p.children}</div>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:6}}>{p.l}</div>;}
function FRow(p){return <div style={p.full?{gridColumn:"1/-1"}:{}}><Lbl l={p.l}/>{p.children}</div>;}

function Modal(p){
  if(!p.show)return null;
  return(
    <div onClick={function(e){if(e.target===e.currentTarget)p.onClose();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:24,width:p.w||500,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <b style={{fontSize:14,color:T.text}}>{p.title}</b>
          <button onClick={p.onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.muted,lineHeight:1}}>x</button>
        </div>
        {p.children}
      </div>
    </div>
  );
}

// ===== DONNEES =====
var SYNDICAT={nom:"Syndicat Piedmont",adr:"Ch. du Hibou, Stoneham QC G3C 1T1",president:"Jean-Francois Laroche",immat:"1144524577",exercice:"1 nov au 31 oct",nbUnites:36};
var COMPTES=[{id:1,nom:"Compte operation",no:"021258-1",solde:7361.88},{id:2,nom:"Fonds prevoyance",no:"0212558-ET1",solde:64235.01},{id:3,nom:"Fonds assurance",no:"0212558-ET3",solde:36178.37}];
var BUDGET=[
  {id:1,cat:"Administration",poste:"Honoraires gestion",budget:28800,reel:14400},
  {id:2,cat:"Administration",poste:"Frais legaux",budget:2000,reel:450},
  {id:3,cat:"Administration",poste:"Assurance syndicat",budget:18500,reel:18500},
  {id:4,cat:"Entretien",poste:"Deneigement",budget:22000,reel:18750},
  {id:5,cat:"Entretien",poste:"Paysagement",budget:8500,reel:5200},
  {id:6,cat:"Entretien",poste:"Entretien batiment",budget:15000,reel:6830},
  {id:7,cat:"Entretien",poste:"Nettoyage",budget:4800,reel:2400},
  {id:8,cat:"Services",poste:"Electricite communes",budget:6000,reel:3150},
  {id:9,cat:"Services",poste:"Aqueduc",budget:3600,reel:1800},
  {id:10,cat:"Prevoyance",poste:"Cotisation prevoyance",budget:36000,reel:18000},
  {id:11,cat:"Imprevus",poste:"Reserve",budget:5000,reel:1200},
];
var FACT0=[
  {id:1,four:"Deneigement Express",date:"2026-04-10",mnt:3750,desc:"Deneigement mars 2026",statut:"approuvee",ref:"F-089",par:"J-F Laroche",dateA:"2026-04-11"},
  {id:2,four:"Paysagement Horizon",date:"2026-04-15",mnt:1200,desc:"Entretien printemps ph.1",statut:"attente",ref:"F-090",par:"",dateA:""},
  {id:3,four:"Plomberie ProFlo",date:"2026-04-22",mnt:485,desc:"Reparation fuite unite 527",statut:"attente",ref:"F-091",par:"",dateA:""},
  {id:4,four:"AscenseurTech QC",date:"2026-03-31",mnt:2200,desc:"Inspection annuelle ascenseur",statut:"approuvee",ref:"F-088",par:"J-F Laroche",dateA:"2026-04-01"},
  {id:5,four:"Hydro-Quebec",date:"2026-04-01",mnt:892.50,desc:"Electricite parties communes",statut:"approuvee",ref:"F-087",par:"J-F Laroche",dateA:"2026-04-02"},
];
var PREV0=[
  {id:1,date:"2026-05-01",desc:"Cotisations mai 2026",mnt:14297.28,statut:"planifie",nb:36,par:"",dateA:""},
  {id:2,date:"2026-04-01",desc:"Cotisations avril 2026",mnt:14297.28,statut:"effectue",nb:36,par:"J-F Laroche",dateA:"2026-03-28"},
  {id:3,date:"2026-03-01",desc:"Cotisations mars 2026",mnt:14297.28,statut:"effectue",nb:36,par:"J-F Laroche",dateA:"2026-02-26"},
];
var REUN0=[
  {id:1,type:"CA",date:"2026-05-15",heure:"19:00",lieu:"Salle comm. Piedmont",statut:"planifiee",ordre:["Approbation PV 18 mars","Rapport financier Q2","Soumissions deneigement 2026-2027","Divers"],pv:"",participants:[]},
  {id:2,type:"CA",date:"2026-03-18",heure:"19:00",lieu:"Salle comm. Piedmont",statut:"tenue",ordre:["Approbation PV janvier","Rapport financier","Factures a approuver"],pv:"Seance ouverte a 19h02. Quorum atteint 4 sur 5 membres. Rapport financier presente et accepte. Factures approuvees a l unanimite. Seance levee a 20h45.",participants:["J-F Laroche","M. Fredette","C. Pinard","R. Donnelly"]},
  {id:3,type:"AGO",date:"2026-01-25",heure:"14:00",lieu:"Centre comm. Stoneham",statut:"tenue",ordre:["Ouverture et quorum","Rapport annuel","Etats financiers 2024-2025","Budget 2025-2026","Election CA","Questions"],pv:"AGO 2025-2026 tenue le 25 janvier 2026. Quorum: 22 unites representees soit 61 pourcent. Etats financiers adoptes. Budget approuve. CA reconduit pour un an.",participants:["J-F Laroche","J-F Begin","M. Beaudoin","L. Tremblay","C. Pinard","R. Donnelly"]},
];
var CARNET0=[
  {id:1,comp:"Toiture asphalte",install:"2015-06-01",duree:25,cout:85000,notes:"Inspection 2024: bon etat",entretien:"2024-09-15"},
  {id:2,comp:"Chauffage central",install:"2013-09-01",duree:20,cout:42000,notes:"Entretien annuel requis",entretien:"2025-10-01"},
  {id:3,comp:"Ascenseur",install:"2013-09-01",duree:25,cout:95000,notes:"Inspection annuelle AscenseurTech",entretien:"2026-03-31"},
  {id:4,comp:"Revetement brique",install:"2013-09-01",duree:40,cout:320000,notes:"RAS",entretien:"2023-06-01"},
  {id:5,comp:"Portes et fenetres communes",install:"2020-08-01",duree:25,cout:28000,notes:"Remplacement partiel 2020",entretien:"2024-06-01"},
  {id:6,comp:"Systeme incendie",install:"2013-09-01",duree:25,cout:38000,notes:"Inspection annuelle obligatoire",entretien:"2025-11-15"},
  {id:7,comp:"Stationnement asphalte",install:"2019-05-01",duree:15,cout:45000,notes:"Fissures mineures secteur B",entretien:"2024-05-01"},
  {id:8,comp:"Electrique parties communes",install:"2013-09-01",duree:30,cout:55000,notes:"Inspection 5 ans",entretien:"2023-09-01"},
  {id:9,comp:"Plomberie parties communes",install:"2013-09-01",duree:30,cout:48000,notes:"Verification annuelle",entretien:"2025-06-01"},
  {id:10,comp:"Amenagement paysager",install:"2014-05-01",duree:15,cout:22000,notes:"Renovation prevue 2027",entretien:"2025-09-15"},
];
var UNITES0=[
  {u:"515",nom:"Michel Beaudoin",fraction:3.875,cot:530.59,pap:true,ce:"2029-03-15",ass:"2026-12-31",loc:false,animaux:0},
  {u:"517",nom:"Marilou Noreau",fraction:2.666,cot:365.05,pap:false,ce:"2028-06-01",ass:"2026-09-15",loc:false,animaux:0},
  {u:"519",nom:"Tommy Boulianne",fraction:2.666,cot:365.05,pap:true,ce:"2027-11-20",ass:"2026-11-30",loc:false,animaux:0},
  {u:"521",nom:"Jean-Francois Begin",fraction:2.666,cot:365.05,pap:true,ce:"2031-05-10",ass:"2027-01-15",loc:false,animaux:0},
  {u:"523",nom:"Joyce McCartney",fraction:2.666,cot:365.05,pap:true,ce:"2030-08-22",ass:"2026-08-31",loc:false,animaux:0},
  {u:"525",nom:"Simon Pellerin",fraction:3.833,cot:524.84,pap:true,ce:"2028-03-14",ass:"2027-03-01",loc:false,animaux:0},
  {u:"527",nom:"Fabienne Maltais",fraction:3.874,cot:530.45,pap:false,ce:"2029-09-01",ass:"2026-10-31",loc:true,animaux:0},
  {u:"529",nom:"K. Bolduc & A. Fortier",fraction:2.133,cot:292.06,pap:true,ce:"2027-07-15",ass:"2026-07-31",loc:false,animaux:1},
  {u:"531",nom:"J-F Laroche & M. Fredette",fraction:2.133,cot:292.06,pap:true,ce:"2030-09-10",ass:"2026-08-01",loc:false,animaux:1},
  {u:"533",nom:"D. Lemaire & K. Marchand",fraction:2.389,cot:327.12,pap:true,ce:"2028-12-01",ass:"2027-02-28",loc:false,animaux:0},
  {u:"535",nom:"Guillaume Rouillard",fraction:2.133,cot:292.06,pap:true,ce:"2029-04-20",ass:"2026-12-15",loc:false,animaux:0},
  {u:"537",nom:"Catherine Perreault",fraction:2.133,cot:292.06,pap:false,ce:"2028-02-14",ass:"2026-06-30",loc:false,animaux:0},
  {u:"539",nom:"Lucette Tremblay",fraction:3.840,cot:525.80,pap:true,ce:"2024-04-22",ass:"2026-06-15",loc:true,animaux:2},
  {u:"541",nom:"Emile Poulin",fraction:3.847,cot:526.76,pap:true,ce:"2031-01-08",ass:"2027-01-31",loc:false,animaux:0},
  {u:"543",nom:"Michel Salvas",fraction:2.133,cot:292.06,pap:true,ce:"2027-05-30",ass:"2026-05-31",loc:false,animaux:0},
  {u:"545",nom:"Julie Bergeron",fraction:2.133,cot:292.06,pap:true,ce:"2029-11-15",ass:"2026-11-30",loc:false,animaux:0},
  {u:"547",nom:"Denis Audet",fraction:2.392,cot:327.53,pap:false,ce:"2028-08-10",ass:"2026-08-31",loc:false,animaux:0},
  {u:"549",nom:"Nicolas Gignac",fraction:2.133,cot:292.06,pap:true,ce:"2030-03-22",ass:"2026-09-30",loc:false,animaux:0},
  {u:"551",nom:"M. Baril & M. Poisson",fraction:2.133,cot:292.06,pap:true,ce:"2027-10-05",ass:"2026-10-31",loc:false,animaux:0},
  {u:"553",nom:"Claude Pinard",fraction:3.865,cot:529.22,pap:true,ce:"2029-06-18",ass:"2026-06-30",loc:false,animaux:0},
  {u:"555",nom:"Robert Donnelly",fraction:3.747,cot:513.06,pap:true,ce:"2028-09-25",ass:"2027-04-30",loc:false,animaux:0},
  {u:"557",nom:"K. Villeneuve & J-S Gagnon",fraction:2.067,cot:283.03,pap:true,ce:"2031-07-12",ass:"2026-07-31",loc:false,animaux:0},
  {u:"559",nom:"B. Dufour & N. Massey",fraction:2.067,cot:283.03,pap:false,ce:"2027-03-08",ass:"2026-03-31",loc:false,animaux:0},
  {u:"561",nom:"Raymond April",fraction:2.328,cot:318.77,pap:true,ce:"2030-12-01",ass:"2026-12-31",loc:false,animaux:0},
  {u:"563",nom:"Luc-Andre Lussier",fraction:2.067,cot:283.03,pap:true,ce:"2028-04-15",ass:"2026-04-30",loc:false,animaux:0},
  {u:"565",nom:"M-A Gravel & C. Desjardins",fraction:2.067,cot:283.03,pap:true,ce:"2029-08-20",ass:"2027-08-31",loc:false,animaux:0},
  {u:"567",nom:"M-A Gravel & C. Desjardins",fraction:3.724,cot:509.91,pap:true,ce:"2030-01-14",ass:"2027-01-31",loc:false,animaux:0},
  {u:"569",nom:"Algest & A. Pelletier",fraction:3.569,cot:488.69,pap:true,ce:"2028-11-30",ass:"2026-11-30",loc:false,animaux:0},
  {u:"571",nom:"T. Martineau & C. Deschamps",fraction:2.012,cot:275.50,pap:false,ce:"2027-06-25",ass:"2026-06-30",loc:false,animaux:0},
  {u:"573",nom:"V. Tremblay & E. Blanchet",fraction:2.012,cot:275.50,pap:true,ce:"2029-02-18",ass:"2026-02-28",loc:false,animaux:0},
  {u:"575",nom:"Caroline Dompierre",fraction:2.264,cot:310.00,pap:true,ce:"2030-07-04",ass:"2027-07-31",loc:false,animaux:0},
  {u:"577",nom:"S. Gobeil & M-E Vaillancourt",fraction:2.012,cot:275.50,pap:true,ce:"2028-05-12",ass:"2026-05-31",loc:false,animaux:0},
  {u:"579",nom:"Sylvie Bergeron",fraction:2.012,cot:275.50,pap:true,ce:"2031-09-28",ass:"2026-09-30",loc:false,animaux:0},
  {u:"581",nom:"Doris Poitras",fraction:3.703,cot:507.04,pap:true,ce:"2029-10-15",ass:"2026-10-31",loc:false,animaux:0},
  {u:"583",nom:"S. Grondin & X. Grondin",fraction:4.353,cot:596.04,pap:true,ce:"2032-01-15",ass:"2026-10-01",loc:true,animaux:0},
  {u:"585",nom:"Y. Dusseault & A. Beauchesne",fraction:4.353,cot:596.04,pap:true,ce:"2030-04-22",ass:"2027-04-30",loc:false,animaux:0},
];

// ===== HELPERS =====
function expSt(d){
  var j=daysLeft(d);
  if(!d)return{c:T.muted,bg:"transparent",l:"—"};
  if(j<0)return{c:T.red,bg:T.redL,l:"EXPIRE"};
  if(j<=30)return{c:T.red,bg:T.redL,l:j+"j"};
  if(j<=90)return{c:T.amber,bg:T.amberL,l:j+"j"};
  return{c:T.accent,bg:T.accentL,l:"OK"};
}
function carnetSt(item){
  var age=new Date().getFullYear()-parseInt(item.install.substring(0,4));
  var pct=Math.min(Math.round(age/item.duree*100),100);
  var yr=parseInt(item.install.substring(0,4))+item.duree;
  if(pct>=80)return{c:T.red,bg:T.redL,pct:pct,yr:yr,l:"Urgent "+yr};
  if(pct>=60)return{c:T.amber,bg:T.amberL,pct:pct,yr:yr,l:"Attention "+yr};
  return{c:T.accent,bg:T.accentL,pct:pct,yr:yr,l:"OK "+yr};
}
function csvDL(cols,rows,name){
  var q=String.fromCharCode(34);
  var hdr=cols.map(function(c){return c.l;}).join(",");
  var body=rows.map(function(row){
    return cols.map(function(c){
      var v=row[c.k]!==undefined?String(row[c.k]):"";
      var s=v.replace(new RegExp(q,"g"),q+q);
      return s.indexOf(",")>=0||s.indexOf(q)>=0?q+s+q:s;
    }).join(",");
  });
  var blob=new Blob(["\uFEFF"+hdr+"\n"+body.join("\n")],{type:"text/csv;charset=utf-8;"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=name+".csv";
  a.click();
}
function pdfPrint(title,cols,rows,sub){
  var win=window.open("","_blank");
  if(!win)return;
  var trs=rows.map(function(r){return "<tr>"+cols.map(function(c){return "<td style='padding:5px 8px;border-bottom:1px solid #eee;font-size:11px'>"+( r[c.k]!==undefined?r[c.k]:"")+"</td>";}).join("")+"</tr>";}).join("");
  var ths=cols.map(function(c){return "<th style='padding:7px 8px;background:#13233A;color:#fff;font-size:11px;text-align:left'>"+c.l+"</th>";}).join("");
  win.document.write("<!DOCTYPE html><html><head><meta charset='utf-8'><title>"+title+"</title><style>body{font-family:Arial,sans-serif;margin:20px;color:#1C1A17}h2{color:#13233A;font-size:17px;margin-bottom:4px}.sub{color:#7C7568;font-size:11px;margin-bottom:16px}table{width:100%;border-collapse:collapse}tr:nth-child(even){background:#F5F3EE}.foot{margin-top:16px;font-size:10px;color:#7C7568;text-align:right}@media print{button{display:none}}</style></head><body>");
  win.document.write("<button onclick='window.print()' style='background:#1B5E3B;color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;margin-bottom:12px'>Imprimer</button>");
  win.document.write("<h2>"+title+"</h2>");
  if(sub)win.document.write("<div class='sub'>"+sub+"</div>");
  win.document.write("<table><thead><tr>"+ths+"</tr></thead><tbody>"+trs+"</tbody></table>");
  win.document.write("<div class='foot'>Genere le "+new Date().toLocaleDateString("fr-CA")+" | Syndicat Piedmont | Predictek</div>");
  win.document.write("</body></html>");
  win.document.close();
}

// ===== TAB BORD =====
function TabBord(p){
  var totB=BUDGET.reduce(function(a,b){return a+b.budget;},0);
  var totR=BUDGET.reduce(function(a,b){return a+b.reel;},0);
  var totS=COMPTES.reduce(function(a,c){return a+c.solde;},0);
  var fatts=p.fact.filter(function(f){return f.statut==="attente";});
  var prevP=p.prev.filter(function(pr){return pr.statut==="planifie";});
  var prochR=p.reun.filter(function(r){return r.statut==="planifiee";}).sort(function(a,b){return a.date.localeCompare(b.date);})[0];
  var altC=p.carnet.filter(function(c){return carnetSt(c).pct>=80;}).length;
  var stats=[
    {l:"Solde total",v:fmt(totS),c:T.accent,bg:T.accentL,sub:"3 comptes bancaires"},
    {l:"Factures en attente",v:fatts.length,c:fatts.length>0?T.amber:T.accent,bg:fatts.length>0?T.amberL:T.accentL,sub:fmt(fatts.reduce(function(a,f){return a+f.mnt;},0))},
    {l:"Budget utilise",v:Math.round(totR/totB*100)+"%",c:T.navy,bg:T.blueL,sub:fmt(totR)+" sur "+fmt(totB)},
    {l:"Alertes carnet",v:altC,c:altC>0?T.red:T.accent,bg:altC>0?T.redL:T.accentL,sub:"composantes plus de 80 pct"},
  ];
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {stats.map(function(s,i){return(
          <div key={i} style={{background:s.bg,borderRadius:10,padding:"12px 14px",border:"1px solid "+s.c+"33"}}>
            <div style={{fontSize:9,color:s.c,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.07em"}}>{s.l}</div>
            <div style={{fontSize:20,fontWeight:800,color:s.c,marginBottom:2}}>{s.v}</div>
            <div style={{fontSize:9,color:s.c+"aa"}}>{s.sub}</div>
          </div>
        );})}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
          <Lbl l="Comptes bancaires"/>
          {COMPTES.map(function(c){return(
            <Row key={c.id}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:T.text}}>{c.nom}</div>
                <div style={{fontSize:10,color:T.muted}}>No {c.no}</div>
              </div>
              <div style={{fontSize:14,fontWeight:700,color:T.accent}}>{fmt(c.solde)}</div>
            </Row>
          );})}
          <Row last>
            <b style={{fontSize:12}}>Total</b>
            <b style={{fontSize:14,color:T.navy}}>{fmt(totS)}</b>
          </Row>
        </div>
        <div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:12}}>
            <Lbl l="Factures en attente"/>
            {fatts.length===0&&<div style={{color:T.muted,fontSize:12}}>Aucune facture en attente</div>}
            {fatts.map(function(f){return(
              <Row key={f.id}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:T.text}}>{f.four}</div>
                  <div style={{fontSize:10,color:T.muted}}>{f.date}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:T.amber}}>{fmt(f.mnt)}</div>
              </Row>
            );})}
          </div>
          {prochR&&(
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
              <Lbl l="Prochaine reunion CA"/>
              <div style={{fontSize:14,fontWeight:700,color:T.navy}}>{prochR.date} a {prochR.heure}</div>
              <div style={{fontSize:12,color:T.muted,marginTop:3}}>{prochR.lieu}</div>
              <div style={{fontSize:11,color:T.muted,marginTop:6}}>{prochR.ordre.length} points a l ordre du jour</div>
            </div>
          )}
          {prevP.length>0&&(
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginTop:12}}>
              <Lbl l="Prelevement planifie"/>
              {prevP.map(function(pr){return(
                <Row key={pr.id} last>
                  <div>
                    <div style={{fontSize:12,fontWeight:600}}>{pr.date}</div>
                    <div style={{fontSize:10,color:T.muted}}>{pr.nb} unites</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:T.blue}}>{fmt(pr.mnt)}</div>
                </Row>
              );})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== TAB FINANCES =====
function TabFinances(p){
  var s0=useState("budget");var sub=s0[0];var setSub=s0[1];
  var s1=useState(false);var showF=s1[0];var setShowF=s1[1];
  var s2=useState(false);var showP=s2[0];var setShowP=s2[1];
  var s3=useState({});var ff=s3[0];var setFf=s3[1];
  var s4=useState({});var pf=s4[0];var setPf=s4[1];
  function sff(k,v){setFf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  function spf(k,v){setPf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  var totB=BUDGET.reduce(function(a,b){return a+b.budget;},0);
  var totR=BUDGET.reduce(function(a,b){return a+b.reel;},0);
  var SUBS=[["budget","Budget"],["factures","Factures"],["prelevements","Prelevements"]];
  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {SUBS.map(function(t){var a=sub===t[0];return(
          <button key={t[0]} onClick={function(){setSub(t[0]);}} style={{background:a?T.navy:"#fff",border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"5px 14px",color:a?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400}}>{t[1]}</button>
        );})}
      </div>
      {sub==="budget"&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",borderBottom:"1px solid "+T.border}}>
            <b style={{fontSize:13,color:T.navy}}>Budget 2025-2026 — 6 mois</b>
            <div style={{display:"flex",gap:8}}>
              <Bdg bg={T.blueL} c={T.blue}>{Math.round(totR/totB*100)}% utilise</Bdg>
              <Btn sm bg={T.navy} onClick={function(){pdfPrint("Budget 2025-2026 - Syndicat Piedmont",[{k:"cat",l:"Cat"},{k:"poste",l:"Poste"},{k:"budgetF",l:"Budget"},{k:"reelF",l:"Reel 6 mois"},{k:"pct",l:"% utilise"}],BUDGET.map(function(b){return Object.assign({},b,{budgetF:fmt(b.budget),reelF:fmt(b.reel),pct:Math.round(b.reel/b.budget*100)+"%"});}));}}>PDF</Btn>
              <Btn sm onClick={function(){csvDL([{k:"cat",l:"Categorie"},{k:"poste",l:"Poste"},{k:"budget",l:"Budget"},{k:"reel",l:"Reel 6 mois"}],BUDGET,"budget-"+today());}}>CSV</Btn>
            </div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:T.alt}}>
                {["Categorie","Poste","Budget","Reel 6 mois","% utilise"].map(function(h,i){return <th key={h} style={{padding:"8px 10px",textAlign:i>1?"right":"left",fontSize:10,color:T.muted,fontWeight:600}}>{h}</th>;})}
              </tr>
            </thead>
            <tbody>
              {BUDGET.map(function(b){var pct=Math.round(b.reel/b.budget*100);return(
                <tr key={b.id} style={{borderBottom:"1px solid "+T.border}}>
                  <td style={{padding:"8px 10px",color:T.muted,fontSize:11}}>{b.cat}</td>
                  <td style={{padding:"8px 10px",color:T.text}}>{b.poste}</td>
                  <td style={{padding:"8px 10px",textAlign:"right"}}>{fmt(b.budget)}</td>
                  <td style={{padding:"8px 10px",textAlign:"right",color:b.reel>b.budget/2?T.amber:T.text}}>{fmt(b.reel)}</td>
                  <td style={{padding:"8px 10px",textAlign:"right"}}><span style={{fontSize:10,fontWeight:700,color:pct>100?T.red:pct>85?T.amber:T.accent}}>{pct}%</span></td>
                </tr>
              );})}
              <tr style={{background:T.alt,fontWeight:700}}>
                <td colSpan={2} style={{padding:"9px 10px",color:T.navy}}>TOTAL</td>
                <td style={{padding:"9px 10px",textAlign:"right",color:T.navy}}>{fmt(totB)}</td>
                <td style={{padding:"9px 10px",textAlign:"right",color:T.navy}}>{fmt(totR)}</td>
                <td style={{padding:"9px 10px",textAlign:"right",color:T.navy}}>{Math.round(totR/totB*100)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {sub==="factures"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <b style={{fontSize:13,color:T.navy}}>Factures</b>
            <div style={{display:"flex",gap:6}}>
              <Btn sm bg={T.navy} onClick={function(){pdfPrint("Factures - Syndicat Piedmont",[{k:"four",l:"Fournisseur"},{k:"date",l:"Date"},{k:"mntF",l:"Montant"},{k:"desc",l:"Description"},{k:"st",l:"Statut"}],p.fact.map(function(f){return Object.assign({},f,{mntF:fmt(f.mnt),st:f.statut==="approuvee"?"Approuvee":"En attente"});}));}}>PDF</Btn>
              <Btn sm onClick={function(){csvDL([{k:"four",l:"Fournisseur"},{k:"date",l:"Date"},{k:"mnt",l:"Montant"},{k:"desc",l:"Description"},{k:"statut",l:"Statut"},{k:"par",l:"Approuve par"}],p.fact,"factures-"+today());}}>CSV</Btn>
              <Btn sm onClick={function(){setFf({four:"",date:today(),mnt:"",desc:"",ref:""});setShowF(true);}}>+ Facture</Btn>
            </div>
          </div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.alt}}>{["Fournisseur","Date","Description","Ref","Montant","Statut","Action"].map(function(h,i){return <th key={h} style={{padding:"8px 10px",textAlign:i===4?"right":"left",fontSize:10,color:T.muted,fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>;})}</tr></thead>
              <tbody>
                {p.fact.map(function(f){return(
                  <tr key={f.id} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"8px 10px",fontWeight:600,color:T.text}}>{f.four}</td>
                    <td style={{padding:"8px 10px",color:T.muted,whiteSpace:"nowrap"}}>{f.date}</td>
                    <td style={{padding:"8px 10px",color:T.text,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.desc}</td>
                    <td style={{padding:"8px 10px",color:T.muted}}>{f.ref}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700}}>{fmt(f.mnt)}</td>
                    <td style={{padding:"8px 10px"}}><Bdg bg={f.statut==="approuvee"?T.accentL:T.amberL} c={f.statut==="approuvee"?T.accent:T.amber}>{f.statut==="approuvee"?"Approuvee":"En attente"}</Bdg></td>
                    <td style={{padding:"8px 10px"}}>
                      {f.statut==="attente"&&<Btn sm onClick={function(){p.setFact(function(prev){return prev.map(function(x){return x.id===f.id?Object.assign({},x,{statut:"approuvee",par:"J-F Laroche",dateA:today()}):x;});});}}> Approuver</Btn>}
                      {f.statut!=="attente"&&<span style={{fontSize:10,color:T.muted}}>{f.par}</span>}
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
          <Modal show={showF} onClose={function(){setShowF(false);}} title="Nouvelle facture" w={480}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <FRow l="Fournisseur" full><input value={ff.four||""} onChange={function(e){sff("four",e.target.value);}} style={INP}/></FRow>
              <FRow l="Date"><input type="date" value={ff.date||""} onChange={function(e){sff("date",e.target.value);}} style={INP}/></FRow>
              <FRow l="Montant"><input type="number" value={ff.mnt||""} onChange={function(e){sff("mnt",parseFloat(e.target.value)||0);}} style={INP}/></FRow>
              <FRow l="Description" full><input value={ff.desc||""} onChange={function(e){sff("desc",e.target.value);}} style={INP}/></FRow>
              <FRow l="Reference"><input value={ff.ref||""} onChange={function(e){sff("ref",e.target.value);}} style={INP}/></FRow>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={function(){p.setFact(function(prev){return prev.concat([Object.assign({},ff,{id:Date.now(),statut:"attente",par:"",dateA:""})]);});setShowF(false);}}>Enregistrer</Btn>
              <Btn onClick={function(){setShowF(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </Modal>
        </div>
      )}
      {sub==="prelevements"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <b style={{fontSize:13,color:T.navy}}>Prelevements bancaires</b>
            <div style={{display:"flex",gap:6}}>
              <Btn sm onClick={function(){csvDL([{k:"date",l:"Date"},{k:"desc",l:"Description"},{k:"nb",l:"Unites"},{k:"mnt",l:"Montant"},{k:"statut",l:"Statut"},{k:"par",l:"Approuve par"}],p.prev,"prelevements-"+today());}}>CSV</Btn>
              <Btn sm onClick={function(){setPf({date:"",desc:"Cotisations mensuelles",mnt:14297.28,nb:36});setShowP(true);}}>+ Prelevement</Btn>
            </div>
          </div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.alt}}>{["Date","Description","Unites","Montant","Statut","Action"].map(function(h,i){return <th key={h} style={{padding:"8px 10px",textAlign:i===3?"right":"left",fontSize:10,color:T.muted,fontWeight:600}}>{h}</th>;})}</tr></thead>
              <tbody>
                {p.prev.map(function(pr){return(
                  <tr key={pr.id} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"8px 10px",fontWeight:600,whiteSpace:"nowrap"}}>{pr.date}</td>
                    <td style={{padding:"8px 10px",color:T.text}}>{pr.desc}</td>
                    <td style={{padding:"8px 10px",color:T.muted}}>{pr.nb}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:T.navy}}>{fmt(pr.mnt)}</td>
                    <td style={{padding:"8px 10px"}}><Bdg bg={pr.statut==="effectue"?T.accentL:pr.statut==="approuve"?T.blueL:T.amberL} c={pr.statut==="effectue"?T.accent:pr.statut==="approuve"?T.blue:T.amber}>{pr.statut==="effectue"?"Effectue":pr.statut==="approuve"?"Approuve":"Planifie"}</Bdg></td>
                    <td style={{padding:"8px 10px"}}>
                      {pr.statut==="planifie"&&<Btn sm onClick={function(){p.setPrev(function(prev){return prev.map(function(x){return x.id===pr.id?Object.assign({},x,{statut:"approuve",par:"J-F Laroche",dateA:today()}):x;});});}}> Approuver</Btn>}
                      {pr.statut!=="planifie"&&<span style={{fontSize:10,color:T.muted}}>{pr.par}</span>}
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
          <Modal show={showP} onClose={function(){setShowP(false);}} title="Nouveau prelevement" w={440}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <FRow l="Date"><input type="date" value={pf.date||""} onChange={function(e){spf("date",e.target.value);}} style={INP}/></FRow>
              <FRow l="Nb unites"><input type="number" value={pf.nb||36} onChange={function(e){spf("nb",parseInt(e.target.value)||0);}} style={INP}/></FRow>
              <FRow l="Montant total" full><input type="number" value={pf.mnt||""} onChange={function(e){spf("mnt",parseFloat(e.target.value)||0);}} style={INP}/></FRow>
              <FRow l="Description" full><input value={pf.desc||""} onChange={function(e){spf("desc",e.target.value);}} style={INP}/></FRow>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={function(){p.setPrev(function(prev){return prev.concat([Object.assign({},pf,{id:Date.now(),statut:"planifie",par:"",dateA:""})]);});setShowP(false);}}>Enregistrer</Btn>
              <Btn onClick={function(){setShowP(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}

// ===== TAB REUNIONS =====
function TabReunions(p){
  var s0=useState(null);var sel=s0[0];var setSel=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({});var nf=s2[0];var setNf=s2[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  var selR=sel?p.reun.find(function(r){return r.id===sel;}):null;
  return(
    <div style={{display:"flex",gap:14}}>
      <div style={{width:280,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <b style={{fontSize:13,color:T.navy}}>Reunions</b>
          <Btn sm onClick={function(){setNf({type:"CA",date:"",heure:"19:00",lieu:"Salle comm. Piedmont",statut:"planifiee"});setShowN(true);}}>+ Nouvelle</Btn>
        </div>
        {p.reun.slice().sort(function(a,b){return b.date.localeCompare(a.date);}).map(function(r){return(
          <div key={r.id} onClick={function(){setSel(r.id);}} style={{background:sel===r.id?T.accentL:T.surface,border:"1px solid "+(sel===r.id?T.accent:T.border),borderRadius:9,padding:11,marginBottom:7,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <Bdg bg={r.type==="AGO"?T.purpleL:T.blueL} c={r.type==="AGO"?T.purple:T.blue}>{r.type}</Bdg>
              <Bdg bg={r.statut==="tenue"?T.accentL:T.amberL} c={r.statut==="tenue"?T.accent:T.amber}>{r.statut==="tenue"?"Tenue":"Planifiee"}</Bdg>
            </div>
            <div style={{fontSize:12,fontWeight:600,color:T.text}}>{r.date} a {r.heure}</div>
            <div style={{fontSize:10,color:T.muted}}>{r.lieu}</div>
          </div>
        );})}
      </div>
      <div style={{flex:1}}>
        {!selR&&<div style={{textAlign:"center",color:T.muted,padding:50,fontSize:13}}>Selectionnez une reunion</div>}
        {selR&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:T.navy}}>{selR.type} — {selR.date}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>{selR.heure} | {selR.lieu}</div>
              </div>
              <Btn sm bg={T.navy} onClick={function(){pdfPrint("PV "+selR.type+" du "+selR.date+" — Syndicat Piedmont",[{k:"n",l:"No"},{k:"item",l:"Point ordre du jour"}],selR.ordre.map(function(o,i){return {n:i+1,item:o};}),selR.pv?"Proces-verbal: "+selR.pv:"");}}>Imprimer PV</Btn>
            </div>
            <Lbl l="Ordre du jour"/>
            {selR.ordre.map(function(o,i){return(
              <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:"1px solid "+T.border,alignItems:"center"}}>
                <span style={{width:20,height:20,borderRadius:"50%",background:T.navy,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
                <span style={{fontSize:12,color:T.text}}>{o}</span>
              </div>
            );})}
            {selR.participants.length>0&&(
              <div style={{marginTop:12}}>
                <Lbl l="Participants"/>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {selR.participants.map(function(pt){return <Bdg key={pt} bg={T.blueL} c={T.blue}>{pt}</Bdg>;})}
                </div>
              </div>
            )}
            {selR.pv&&(
              <div style={{marginTop:12}}>
                <Lbl l="Proces-verbal"/>
                <div style={{background:T.alt,borderRadius:8,padding:12,fontSize:12,color:T.text,lineHeight:1.6}}>{selR.pv}</div>
              </div>
            )}
            {!selR.pv&&selR.statut==="planifiee"&&<div style={{marginTop:10,background:T.amberL,borderRadius:8,padding:"9px 12px",fontSize:11,color:T.amber}}>PV a rediger apres la tenue de la reunion</div>}
          </div>
        )}
      </div>
      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouvelle reunion" w={440}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <FRow l="Type"><select value={nf.type||"CA"} onChange={function(e){snf("type",e.target.value);}} style={INP}><option value="CA">Reunion CA</option><option value="AGO">AGO</option><option value="AGE">AGE</option></select></FRow>
          <FRow l="Statut"><select value={nf.statut||"planifiee"} onChange={function(e){snf("statut",e.target.value);}} style={INP}><option value="planifiee">Planifiee</option><option value="tenue">Tenue</option></select></FRow>
          <FRow l="Date"><input type="date" value={nf.date||""} onChange={function(e){snf("date",e.target.value);}} style={INP}/></FRow>
          <FRow l="Heure"><input type="time" value={nf.heure||"19:00"} onChange={function(e){snf("heure",e.target.value);}} style={INP}/></FRow>
          <FRow l="Lieu" full><input value={nf.lieu||""} onChange={function(e){snf("lieu",e.target.value);}} style={INP}/></FRow>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){p.setReun(function(prev){return prev.concat([Object.assign({},nf,{id:Date.now(),ordre:[],pv:"",participants:[]})]);});setShowN(false);}}>Creer</Btn>
          <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ===== TAB CARNET =====
function TabCarnet(p){
  var s0=useState(false);var showN=s0[0];var setShowN=s0[1];
  var s1=useState({});var nf=s1[0];var setNf=s1[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  var totCout=p.carnet.reduce(function(a,c){return a+c.cout;},0);
  var alts=p.carnet.filter(function(c){return carnetSt(c).pct>=80;}).length;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <b style={{fontSize:13,color:T.navy,display:"block"}}>Carnet entretien — Loi 16</b>
          <span style={{fontSize:11,color:T.muted}}>{p.carnet.length} composantes | {fmt(totCout)} | {alts} alerte(s)</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <Btn sm bg={T.navy} onClick={function(){pdfPrint("Carnet entretien - Syndicat Piedmont (Loi 16)",[{k:"comp",l:"Composante"},{k:"install",l:"Installation"},{k:"duree",l:"Duree vie"},{k:"coutF",l:"Cout"},{k:"pct",l:"% utilise"},{k:"yr",l:"Remplacement"},{k:"notes",l:"Notes"}],p.carnet.map(function(c){var st=carnetSt(c);return Object.assign({},c,{coutF:fmt(c.cout),duree:c.duree+" ans",pct:st.pct+"%",yr:st.yr});}));}}>PDF</Btn>
          <Btn sm onClick={function(){csvDL([{k:"comp",l:"Composante"},{k:"install",l:"Installation"},{k:"duree",l:"Duree (ans)"},{k:"cout",l:"Cout"},{k:"notes",l:"Notes"},{k:"entretien",l:"Dernier entretien"}],p.carnet,"carnet-"+today());}}>CSV</Btn>
          <Btn sm onClick={function(){setNf({comp:"",install:"",duree:20,cout:0,notes:"",entretien:""});setShowN(true);}}>+ Composante</Btn>
        </div>
      </div>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:T.navy}}>
              {["Composante","Annee","Duree","Remplacement","Cout","% vie","Statut","Dernier entretien"].map(function(h){return <th key={h} style={{padding:"7px 10px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>;})}
            </tr>
          </thead>
          <tbody>
            {p.carnet.map(function(c){var st=carnetSt(c);return(
              <tr key={c.id} style={{borderBottom:"1px solid "+T.border,background:st.pct>=80?st.bg:"transparent"}}>
                <td style={{padding:"8px 10px",fontWeight:600,fontSize:12,color:T.text}}>{c.comp}</td>
                <td style={{padding:"8px 10px",fontSize:11,color:T.muted}}>{c.install.substring(0,4)}</td>
                <td style={{padding:"8px 10px",fontSize:11,color:T.muted}}>{c.duree} ans</td>
                <td style={{padding:"8px 10px",fontSize:11,fontWeight:600,color:st.c}}>{st.yr}</td>
                <td style={{padding:"8px 10px",fontSize:11}}>{fmt(c.cout)}</td>
                <td style={{padding:"8px 10px",minWidth:90}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{flex:1,height:5,background:T.border,borderRadius:3,overflow:"hidden"}}>
                      <div style={{width:st.pct+"%",height:"100%",background:st.c,borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:9,fontWeight:700,color:st.c,whiteSpace:"nowrap"}}>{st.pct}%</span>
                  </div>
                </td>
                <td style={{padding:"8px 10px"}}><Bdg bg={st.bg} c={st.c}>{st.l}</Bdg></td>
                <td style={{padding:"8px 10px",fontSize:11,color:T.muted}}>{c.entretien||"—"}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
      <div style={{marginTop:10,background:T.amberL,borderRadius:8,padding:"9px 13px",fontSize:11,color:T.amber}}>Loi 16: Etude du fonds de prevoyance requise tous les 5 ans. Prochaine etude: 2028.</div>
      <Modal show={showN} onClose={function(){setShowN(false);}} title="Ajouter composante" w={460}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <FRow l="Composante" full><input value={nf.comp||""} onChange={function(e){snf("comp",e.target.value);}} style={INP}/></FRow>
          <FRow l="Date installation"><input type="date" value={nf.install||""} onChange={function(e){snf("install",e.target.value);}} style={INP}/></FRow>
          <FRow l="Duree de vie (ans)"><input type="number" value={nf.duree||20} onChange={function(e){snf("duree",parseInt(e.target.value)||20);}} style={INP}/></FRow>
          <FRow l="Cout ($)"><input type="number" value={nf.cout||""} onChange={function(e){snf("cout",parseInt(e.target.value)||0);}} style={INP}/></FRow>
          <FRow l="Dernier entretien"><input type="date" value={nf.entretien||""} onChange={function(e){snf("entretien",e.target.value);}} style={INP}/></FRow>
          <FRow l="Notes" full><input value={nf.notes||""} onChange={function(e){snf("notes",e.target.value);}} style={INP}/></FRow>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){p.setCarnet(function(prev){return prev.concat([Object.assign({},nf,{id:Date.now()})]);});setShowN(false);}}>Ajouter</Btn>
          <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ===== TAB UNITES (ex-Piedmont) =====
function TabUnites(){
  var s0=useState(UNITES0);var unites=s0[0];var setUnites=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState("tous");var filtre=s2[0];var setFiltre=s2[1];
  var s3=useState("");var search=s3[0];var setSearch=s3[1];
  var s4=useState(false);var showExport=s4[0];var setShowExport=s4[1];
  var s5=useState(false);var showImport=s5[0];var setShowImport=s5[1];
  var s6=useState({u:true,nom:true,fraction:true,cot:true,pap:true,ce:true,ass:true,loc:true});var expCols=s6[0];var setExpCols=s6[1];
  var s7=useState("csv");var expFmt=s7[0];var setExpFmt=s7[1];
  var s8=useState("");var importMsg=s8[0];var setImportMsg=s8[1];

  var totM=unites.reduce(function(a,u){return a+u.cot;},0);
  var nPap=unites.filter(function(u){return !u.pap;}).length;
  var nCE=unites.filter(function(u){return expSt(u.ce).c===T.red;}).length;
  var nAss=unites.filter(function(u){return expSt(u.ass).c===T.red;}).length;
  var nLoc=unites.filter(function(u){return u.loc;}).length;

  var liste=unites.filter(function(u){
    if(search){var q=search.toLowerCase();if(!u.u.includes(q)&&!u.nom.toLowerCase().includes(q))return false;}
    if(filtre==="pap")return !u.pap;
    if(filtre==="ce")return expSt(u.ce).c===T.red;
    if(filtre==="ass")return expSt(u.ass).c===T.red;
    if(filtre==="loc")return u.loc;
    if(filtre==="alertes"){var ceS=expSt(u.ce);var aS=expSt(u.ass);return ceS.c===T.red||aS.c===T.red||!u.pap;}
    return true;
  });

  var selU=sel?unites.find(function(u){return u.u===sel;}):null;

  function doExport(){
    var ALL_COLS=[{k:"u",l:"Unite"},{k:"nom",l:"Proprietaire"},{k:"fraction",l:"Fraction %"},{k:"cot",l:"Cotisation"},{k:"papL",l:"PAP"},{k:"ce",l:"CE expiry"},{k:"ass",l:"Ass. expiry"},{k:"locL",l:"Location"},{k:"animaux",l:"Animaux"}];
    var cols=ALL_COLS.filter(function(c){return expCols[c.k]!==false;});
    var rows=unites.map(function(u){return Object.assign({},u,{papL:u.pap?"Oui":"Non",locL:u.loc?"Oui":"Non"});});
    if(expFmt==="csv"){csvDL(cols,rows,"registre-copropriétaires-"+today());}
    else{pdfPrint("Registre coproprietaires — Syndicat Piedmont",cols,rows,"36 unites | "+today());}
    setShowExport(false);
  }

  function parseCSV(text){
    var lines=text.trim().split("\n");
    if(lines.length<2)return null;
    var headers=lines[0].split(",").map(function(h){return h.trim().replace(/"/g,"");});
    var rows=[];
    for(var i=1;i<lines.length;i++){
      var vals=lines[i].split(",");
      var row={};
      headers.forEach(function(h,j){row[h]=(vals[j]||"").trim().replace(/"/g,"");});
      if(row["Unite"]||row["u"]){
        rows.push({
          u:row["Unite"]||row["u"]||"",
          nom:row["Proprietaire"]||row["nom"]||"",
          fraction:parseFloat(row["Fraction %"]||row["fraction"])||0,
          cot:parseFloat(row["Cotisation"]||row["cot"])||0,
          pap:(row["PAP"]||row["pap"]||"").toLowerCase()==="oui",
          ce:row["CE expiry"]||row["ce"]||"",
          ass:row["Ass. expiry"]||row["ass"]||"",
          loc:(row["Location"]||row["loc"]||"").toLowerCase()==="oui",
          animaux:parseInt(row["Animaux"]||row["animaux"])||0,
          id:Date.now()+Math.random()
        });
      }
    }
    return rows;
  }

  function handleCSV(e){
    var file=e.target.files[0];
    if(!file){return;}
    var reader=new FileReader();
    reader.onload=function(ev){
      var rows=parseCSV(ev.target.result);
      if(rows&&rows.length>0){
        setUnites(rows);
        setImportMsg("Import reussi: "+rows.length+" unites chargees");
      }else{setImportMsg("Erreur: format CSV invalide");}
    };
    reader.readAsText(file);
  }

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        {[
          {l:"Unites",v:unites.length,c:T.navy,bg:T.blueL},
          {l:"Total mensuel",v:fmt(totM),c:T.accent,bg:T.accentL},
          {l:"PAP manquant",v:nPap,c:nPap>0?T.red:T.accent,bg:nPap>0?T.redL:T.accentL},
          {l:"Alertes CE/Ass",v:nCE+nAss,c:(nCE+nAss)>0?T.red:T.accent,bg:(nCE+nAss)>0?T.redL:T.accentL},
          {l:"Unites louees",v:nLoc,c:nLoc>0?T.amber:T.accent,bg:nLoc>0?T.amberL:T.accentL},
        ].map(function(s,i){return(
          <div key={i} style={{background:s.bg,borderRadius:10,padding:"11px 13px",border:"1px solid "+s.c+"33"}}>
            <div style={{fontSize:9,color:s.c,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{s.l}</div>
            <div style={{fontSize:17,fontWeight:800,color:s.c}}>{s.v}</div>
          </div>
        );})}
      </div>

      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
        {[["tous","Tous"],["alertes","Alertes"],["pap","PAP manquant"],["ce","CE expire"],["ass","Ass. expiree"],["loc","Locataires"]].map(function(f){var a=filtre===f[0];return(
          <button key={f[0]} onClick={function(){setFiltre(f[0]);}} style={{background:a?T.navy:"#fff",border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"4px 12px",color:a?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{f[1]}</button>
        );})}
        <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Rechercher..." style={{border:"1px solid "+T.border,borderRadius:20,padding:"4px 12px",fontSize:11,fontFamily:"inherit",outline:"none",marginLeft:"auto"}}/>
        <Btn sm bg={T.navy} onClick={function(){setShowExport(true);}}>Exporter liste</Btn>
        <Btn sm bg={T.purple} onClick={function(){setShowImport(true);setImportMsg("");}}>Importer CSV</Btn>
      </div>

      <div style={{display:"flex",gap:12}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:T.navy}}>
                    {["Unite","Proprietaire","Fraction","Cotisation","PAP","Chauffe-eau","Assurance","Location","Animaux","Alertes"].map(function(h){return(
                      <th key={h} style={{padding:"7px 8px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:h==="Cotisation"||h==="Fraction"?"right":"left",whiteSpace:"nowrap"}}>{h}</th>
                    );})}
                  </tr>
                </thead>
                <tbody>
                  {liste.map(function(u){
                    var ceS=expSt(u.ce);var aS=expSt(u.ass);
                    var alts=(ceS.c===T.red?1:0)+(aS.c===T.red?1:0)+(!u.pap?1:0);
                    var rowBg=sel===u.u?T.accentL:alts>=2?T.redL:alts>=1?"#FFF9F0":T.surface;
                    return(
                      <tr key={u.u} onClick={function(){setSel(sel===u.u?null:u.u);}} style={{cursor:"pointer",background:rowBg,borderBottom:"1px solid "+T.border}}>
                        <td style={{padding:"7px 8px",fontSize:12,fontWeight:700,color:T.navy}}>{u.u}</td>
                        <td style={{padding:"7px 8px",fontSize:12,color:T.text,maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.nom}</td>
                        <td style={{padding:"7px 8px",fontSize:11,color:T.muted,textAlign:"right"}}>{u.fraction.toFixed(3)}%</td>
                        <td style={{padding:"7px 8px",fontSize:12,fontWeight:600,textAlign:"right"}}>{fmt(u.cot)}</td>
                        <td style={{padding:"7px 8px",textAlign:"center"}}><span style={{display:"inline-block",width:16,height:16,borderRadius:"50%",background:u.pap?T.accent:T.red,color:"#fff",fontSize:8,fontWeight:700,lineHeight:"16px",textAlign:"center"}}>{u.pap?"V":"!"}</span></td>
                        <td style={{padding:"7px 8px",textAlign:"center"}}><span style={{fontSize:10,fontWeight:600,color:ceS.c,background:ceS.bg,padding:"1px 6px",borderRadius:10}}>{ceS.l}</span></td>
                        <td style={{padding:"7px 8px",textAlign:"center"}}><span style={{fontSize:10,fontWeight:600,color:aS.c,background:aS.bg,padding:"1px 6px",borderRadius:10}}>{aS.l}</span></td>
                        <td style={{padding:"7px 8px",textAlign:"center"}}>{u.loc?<span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:8,background:T.amberL,color:T.amber}}>Loue</span>:<span style={{color:T.muted,fontSize:10}}>—</span>}</td>
                        <td style={{padding:"7px 8px",textAlign:"center"}}>{u.animaux>0?<span style={{fontSize:11}}>{u.animaux}</span>:<span style={{color:T.muted,fontSize:10}}>—</span>}</td>
                        <td style={{padding:"7px 8px",textAlign:"center"}}>{alts>0?<span style={{fontSize:10,fontWeight:700,color:"#fff",background:T.red,padding:"1px 6px",borderRadius:10}}>{alts}</span>:<span style={{fontSize:10,color:T.accent}}>ok</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{padding:"7px 12px",background:T.alt,fontSize:10,color:T.muted,borderTop:"1px solid "+T.border}}>{liste.length} unite(s) sur {unites.length}</div>
          </div>
        </div>

        {sel&&selU&&(
          <div style={{width:260,flexShrink:0}}>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <b style={{fontSize:14,color:T.navy}}>Unite {sel}</b>
                <button onClick={function(){setSel(null);}} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:16,lineHeight:1}}>x</button>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:2}}>{selU.nom}</div>
              <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Fraction: {selU.fraction.toFixed(3)}% | {fmt(selU.cot)}/mois</div>
              {[
                {l:"PAP autorise",v:selU.pap?"Oui":"Non",c:selU.pap?T.accent:T.red,bg:selU.pap?T.accentL:T.redL},
                {l:"Chauffe-eau",v:expSt(selU.ce).l+" ("+selU.ce+")",c:expSt(selU.ce).c,bg:expSt(selU.ce).bg},
                {l:"Assurance",v:expSt(selU.ass).l+" ("+selU.ass+")",c:expSt(selU.ass).c,bg:expSt(selU.ass).bg},
                {l:"Location",v:selU.loc?"Oui":"Non",c:selU.loc?T.amber:T.accent,bg:selU.loc?T.amberL:T.accentL},
                {l:"Animaux",v:selU.animaux>0?selU.animaux+" animal(aux)":"Aucun",c:T.muted,bg:T.alt},
              ].map(function(item,i){return(
                <div key={i} style={{marginBottom:8,background:item.bg,borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:item.c,fontWeight:600,marginBottom:2,textTransform:"uppercase"}}>{item.l}</div>
                  <div style={{fontSize:12,fontWeight:600,color:item.c}}>{item.v}</div>
                </div>
              );})}
            </div>
          </div>
        )}
      </div>

      <Modal show={showExport} onClose={function(){setShowExport(false);}} title="Exporter la liste" w={440}>
        <div style={{marginBottom:12}}>
          <Lbl l="Format"/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={function(){setExpFmt("csv");}} style={{flex:1,padding:9,border:"2px solid "+(expFmt==="csv"?T.accent:T.border),borderRadius:8,background:expFmt==="csv"?T.accentL:T.surface,color:expFmt==="csv"?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontWeight:expFmt==="csv"?700:400}}>Excel / CSV</button>
            <button onClick={function(){setExpFmt("pdf");}} style={{flex:1,padding:9,border:"2px solid "+(expFmt==="pdf"?T.navy:T.border),borderRadius:8,background:expFmt==="pdf"?T.blueL:T.surface,color:expFmt==="pdf"?T.navy:T.muted,cursor:"pointer",fontFamily:"inherit",fontWeight:expFmt==="pdf"?700:400}}>PDF impression</button>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <Lbl l="Colonnes"/>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {[{k:"u",l:"Unite"},{k:"nom",l:"Proprietaire"},{k:"fraction",l:"Fraction"},{k:"cot",l:"Cotisation"},{k:"pap",l:"PAP"},{k:"ce",l:"Chauffe-eau"},{k:"ass",l:"Assurance"},{k:"loc",l:"Location"},{k:"animaux",l:"Animaux"}].map(function(c){var on=expCols[c.k]!==false;return(
              <button key={c.k} onClick={function(){setExpCols(function(o){var n=Object.assign({},o);n[c.k]=!on;return n;});}} style={{padding:"3px 10px",border:"1px solid "+(on?T.accent:T.border),borderRadius:20,background:on?T.accentL:T.surface,color:on?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:on?600:400}}>{c.l}</button>
            );})}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={doExport} style={{flex:1,background:T.accent,color:"#fff",border:"none",borderRadius:7,padding:"9px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Exporter</button>
          <Btn onClick={function(){setShowExport(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>

      <Modal show={showImport} onClose={function(){setShowImport(false);}} title="Importer depuis CSV" w={440}>
        <div style={{background:T.blueL,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.blue,marginBottom:14}}>
          Format attendu: colonnes Unite, Proprietaire, Fraction %, Cotisation, PAP (Oui/Non), CE expiry (AAAA-MM-JJ), Ass. expiry, Location (Oui/Non), Animaux (nombre)
        </div>
        <div style={{marginBottom:14}}>
          <Lbl l="Fichier CSV"/>
          <input type="file" accept=".csv,.txt" onChange={handleCSV} style={{width:"100%",padding:"8px",border:"1px solid "+T.border,borderRadius:7,fontFamily:"inherit",fontSize:12,boxSizing:"border-box"}}/>
        </div>
        {importMsg&&<div style={{padding:"8px 12px",borderRadius:7,background:importMsg.includes("Erreur")?T.redL:T.accentL,color:importMsg.includes("Erreur")?T.red:T.accent,fontSize:12,marginBottom:12}}>{importMsg}</div>}
        <div style={{background:T.amberL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.amber,marginBottom:12}}>Attention: l import remplace toutes les donnees actuelles.</div>
        <Btn onClick={function(){setShowImport(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Fermer</Btn>
      </Modal>
    </div>
  );
}

// ===== EXPORT COPROPRIÉTAIRES =====
function ExportCopros(p){
  var s0=useState({u:true,nom:true,fraction:true,cot:true,pap:true,ce:true,ass:true,loc:true});var cols=s0[0];var setCols=s0[1];
  var s1=useState("csv");var fmt2=s1[0];var setFmt2=s1[1];
  var ALL=[{k:"u",l:"Unite"},{k:"nom",l:"Proprietaire"},{k:"fraction",l:"Fraction %"},{k:"cot",l:"Cotisation"},{k:"papL",l:"PAP"},{k:"ce",l:"CE expiry"},{k:"ass",l:"Ass. expiry"},{k:"locL",l:"Location"}];
  var selCols=ALL.filter(function(c){return cols[c.k]!==false;});
  function doExport(){
    var rows=UNITES0.map(function(u){return Object.assign({},u,{papL:u.pap?"Oui":"Non",locL:u.loc?"Oui":"Non"});});
    if(fmt2==="csv"){csvDL(selCols,rows,"registre-copropriétaires-"+today());}
    else{pdfPrint("Registre coproprietaires — Syndicat Piedmont",selCols,rows,"36 unites | "+today());}
    p.onClose();
  }
  return(
    <Modal show={p.show} onClose={p.onClose} title="Liste des coproprietaires" w={440}>
      <div style={{marginBottom:12}}>
        <Lbl l="Format"/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={function(){setFmt2("csv");}} style={{flex:1,padding:9,border:"2px solid "+(fmt2==="csv"?T.accent:T.border),borderRadius:8,background:fmt2==="csv"?T.accentL:T.surface,color:fmt2==="csv"?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontWeight:fmt2==="csv"?700:400}}>Excel / CSV</button>
          <button onClick={function(){setFmt2("pdf");}} style={{flex:1,padding:9,border:"2px solid "+(fmt2==="pdf"?T.navy:T.border),borderRadius:8,background:fmt2==="pdf"?T.blueL:T.surface,color:fmt2==="pdf"?T.navy:T.muted,cursor:"pointer",fontFamily:"inherit",fontWeight:fmt2==="pdf"?700:400}}>PDF impression</button>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <Lbl l="Colonnes"/>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {ALL.map(function(c){var on=cols[c.k]!==false;return(
            <button key={c.k} onClick={function(){setCols(function(o){var n=Object.assign({},o);n[c.k]=!on;return n;});}} style={{padding:"3px 10px",border:"1px solid "+(on?T.accent:T.border),borderRadius:20,background:on?T.accentL:T.surface,color:on?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:on?600:400}}>{c.l}</button>
          );})}
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={doExport} style={{flex:1,background:T.accent,color:"#fff",border:"none",borderRadius:7,padding:"9px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Exporter</button>
        <Btn onClick={p.onClose} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
      </div>
    </Modal>
  );
}

// ===== MODULE PRINCIPAL =====
export default function Gestionnaire(){
  var s0=useState("bord");var ong=s0[0];var setOng=s0[1];
  var s1=useState(FACT0);var fact=s1[0];var setFact=s1[1];
  var s2=useState(PREV0);var prev=s2[0];var setPrev=s2[1];
  var s3=useState(REUN0);var reun=s3[0];var setReun=s3[1];
  var s4=useState(CARNET0);var carnet=s4[0];var setCarnet=s4[1];
  var s5=useState(false);var showExp=s5[0];var setShowExp=s5[1];

  var fatts=fact.filter(function(f){return f.statut==="attente";}).length;
  var TABS=[{id:"bord",l:"Tableau de bord"},{id:"finances",l:"Finances"},{id:"reunions",l:"Reunions et PV"},{id:"carnet",l:"Carnet entretien"},{id:"unites",l:"Unites"}];

  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:17,fontWeight:800,color:T.navy}}>{SYNDICAT.nom}</div>
          <div style={{fontSize:11,color:T.muted}}>{SYNDICAT.adr} | President: {SYNDICAT.president} | Immat: {SYNDICAT.immat}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {fatts>0&&<Bdg bg={T.amberL} c={T.amber}>{fatts} facture(s) a approuver</Bdg>}
          <Btn sm bg={T.navy} onClick={function(){setShowExp(true);}}>Liste coproprietaires</Btn>
        </div>
      </div>

      <div style={{display:"flex",gap:3,marginBottom:16,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border,flexWrap:"wrap"}}>
        {TABS.map(function(t){var a=ong===t.id;return(
          <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"7px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t.l}</button>
        );})}
      </div>

      {ong==="bord"&&<TabBord fact={fact} prev={prev} reun={reun} carnet={carnet}/>}
      {ong==="finances"&&<TabFinances fact={fact} setFact={setFact} prev={prev} setPrev={setPrev}/>}
      {ong==="reunions"&&<TabReunions reun={reun} setReun={setReun}/>}
      {ong==="carnet"&&<TabCarnet carnet={carnet} setCarnet={setCarnet}/>}
      {ong==="unites"&&<TabUnites/>}
      <ExportCopros show={showExp} onClose={function(){setShowExp(false);}}/>
    </div>
  );
}
