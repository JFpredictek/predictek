import { useState } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",pop:"#3CAF6E",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var fmt=function(n){if(!n&&n!==0)return"-";return Math.abs(n).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
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
var SYNDICAT={nom:"",adr:"",president:"",courriel:"",tel:"",immat:"",nbUnites:0,cotMensuelle:0};
var COMPTES=[];
var BUDGET=[];
var FACT0=[];
var PREV0=[];
var REUN0=[];
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
var UNITES0=[];

// ===== HELPERS =====
function expSt(d){
  var j=daysLeft(d);
  if(!d)return{c:T.muted,bg:"transparent",l:"-"};
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
  win.document.write("<div class='foot'>Genere le "+new Date().toLocaleDateString("fr-CA")+" | Predictek</div>");
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
    {l:"Solde total",v:fmt(totS),c:T.accent,bg:T.accentL,sub:COMPTES.length+" compte(s) bancaire(s)"},
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
  var SUBS=[];
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
            <b style={{fontSize:13,color:T.navy}}>Budget 2025-2026 - 6 mois</b>
            <div style={{display:"flex",gap:8}}>
              <Bdg bg={T.blueL} c={T.blue}>{Math.round(totR/totB*100)}% utilise</Bdg>
              <Btn sm bg={T.navy} onClick={function(){pdfPrint("Budget - "+syndicat.nom,[{k:"cat",l:"Cat"},{k:"poste",l:"Poste"},{k:"budgetF",l:"Budget"},{k:"reelF",l:"Reel 6 mois"},{k:"pct",l:"% utilise"}],BUDGET.map(function(b){return Object.assign({},b,{budgetF:fmt(b.budget),reelF:fmt(b.reel),pct:Math.round(b.reel/b.budget*100)+"%"});}));}}>PDF</Btn>
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
              <Btn sm bg={T.navy} onClick={function(){pdfPrint("Factures - "+syndicat.nom,[{k:"four",l:"Fournisseur"},{k:"date",l:"Date"},{k:"mntF",l:"Montant"},{k:"desc",l:"Description"},{k:"st",l:"Statut"}],p.fact.map(function(f){return Object.assign({},f,{mntF:fmt(f.mnt),st:f.statut==="approuvee"?"Approuvee":"En attente"});}));}}>PDF</Btn>
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
              <Btn sm onClick={function(){setPf({date:"",desc:"Cotisations mensuelles",mnt:0,nb:36});setShowP(true);}}>+ Prelevement</Btn>
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
          <Btn sm onClick={function(){setNf({type:"CA",date:"",heure:"19:00",lieu:"",statut:"planifiee"});setShowN(true);}}>+ Nouvelle</Btn>
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
                <div style={{fontSize:15,fontWeight:800,color:T.navy}}>{selR.type} - {selR.date}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>{selR.heure} | {selR.lieu}</div>
              </div>
              <Btn sm bg={T.navy} onClick={function(){pdfPrint("PV "+selR.type+" du "+selR.date+" ",[{k:"n",l:"No"},{k:"item",l:"Point ordre du jour"}],selR.ordre.map(function(o,i){return {n:i+1,item:o};}),selR.pv?"Proces-verbal: "+selR.pv:"");}}>Imprimer PV</Btn>
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
          <b style={{fontSize:13,color:T.navy,display:"block"}}>Carnet entretien - Loi 16</b>
          <span style={{fontSize:11,color:T.muted}}>{p.carnet.length} composantes | {fmt(totCout)} | {alts} alerte(s)</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <Btn sm bg={T.navy} onClick={function(){pdfPrint("Carnet entretien - Carnet entretien Loi 16",[{k:"comp",l:"Composante"},{k:"install",l:"Installation"},{k:"duree",l:"Duree vie"},{k:"coutF",l:"Cout"},{k:"pct",l:"% utilise"},{k:"yr",l:"Remplacement"},{k:"notes",l:"Notes"}],p.carnet.map(function(c){var st=carnetSt(c);return Object.assign({},c,{coutF:fmt(c.cout),duree:c.duree+" ans",pct:st.pct+"%",yr:st.yr});}));}}>PDF</Btn>
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
                <td style={{padding:"8px 10px",fontSize:11,color:T.muted}}>{c.entretien||"-"}</td>
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
    var ALL_COLS=[];
    var cols=ALL_COLS.filter(function(c){return expCols[c.k]!==false;});
    var rows=unites.map(function(u){return Object.assign({},u,{papL:u.pap?"Oui":"Non",locL:u.loc?"Oui":"Non"});});
    if(expFmt==="csv"){csvDL(cols,rows,"registre-copropri-taires-"+today());}
    else{pdfPrint("Registre - "+syndicat.nom,cols,rows,"unites: "+unites.length+" | "+today());}
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
                        <td style={{padding:"7px 8px",textAlign:"center"}}>{u.loc?<span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:8,background:T.amberL,color:T.amber}}>Loue</span>:<span style={{color:T.muted,fontSize:10}}>-</span>}</td>
                        <td style={{padding:"7px 8px",textAlign:"center"}}>{u.animaux>0?<span style={{fontSize:11}}>{u.animaux}</span>:<span style={{color:T.muted,fontSize:10}}>-</span>}</td>
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

// ===== EXPORT COPROPRI-TAIRES =====
function ExportCopros(p){
  var s0=useState({u:true,nom:true,fraction:true,cot:true,pap:true,ce:true,ass:true,loc:true});var cols=s0[0];var setCols=s0[1];
  var s1=useState("csv");var fmt2=s1[0];var setFmt2=s1[1];
  var ALL=[];
  var selCols=ALL.filter(function(c){return cols[c.k]!==false;});
  function doExport(){
    var rows=UNITES0.map(function(u){return Object.assign({},u,{papL:u.pap?"Oui":"Non",locL:u.loc?"Oui":"Non"});});
    if(fmt2==="csv"){csvDL(selCols,rows,"registre-copropri-taires-"+today());}
    else{pdfPrint("Registre - "+syndicat.nom,selCols,rows,"unites: "+unites.length+" | "+today());}
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


// ===== SOLDES OUVERTURE SYNDICAT =====
var COMPTES_SYND=[];

var ECRITURES_SYND=[];

function TabSoldesOuvSynd(){
  var s0=useState([]);
  var comptes=s0[0];var setComptes=s0[1];
  var s1=useState("");var savedMsg=s1[0];var setSavedMsg=s1[1];
  function upd(no,val){setComptes(function(prev){return prev.map(function(c){return c.no===no?Object.assign({},c,{soldeOuv:parseFloat(val)||0}):c;});});}
  var totalActif=comptes.filter(function(c){return c.type==="actif";}).reduce(function(a,c){return a+c.soldeOuv;},0);
  var totalPassif=comptes.filter(function(c){return c.type==="passif";}).reduce(function(a,c){return a+c.soldeOuv;},0);
  var totalCapitaux=comptes.filter(function(c){return c.type==="capitaux";}).reduce(function(a,c){return a+c.soldeOuv;},0);
  var balance=totalActif-(totalPassif+totalCapitaux);
  var balanced=Math.abs(balance)<0.01;
  var groups={};
  comptes.forEach(function(c){if(!groups[c.type])groups[c.type]=[];groups[c.type].push(c);});
  function sauvegarder(){try{localStorage.setItem("predictek_soldes_synd_PIED",JSON.stringify(comptes));}catch(e){}setSavedMsg("Sauvegardes!");setTimeout(function(){setSavedMsg("");},3000);}
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[{l:"Total actif",v:fmt(totalActif),c:T.accent,bg:T.accentL},{l:"Total passif",v:fmt(totalPassif),c:T.red,bg:T.redL},{l:"Capitaux",v:fmt(totalCapitaux),c:T.purple,bg:T.purpleL},{l:"Balance",v:fmt(balance),c:balanced?T.accent:T.red,bg:balanced?T.accentL:T.redL}].map(function(s,i){return(
          <div key={i} style={{background:s.bg,borderRadius:10,padding:"11px 13px",border:"1px solid "+s.c+"33"}}>
            <div style={{fontSize:9,color:s.c,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{s.l}</div>
            <div style={{fontSize:17,fontWeight:800,color:s.c}}>{s.v}</div>
          </div>
        );})}
      </div>
      {!balanced&&<div style={{background:T.redL,borderRadius:8,padding:"9px 14px",fontSize:12,color:T.red,marginBottom:12}}>Bilan desequilibre - Verifiez les soldes.</div>}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12,gap:8,alignItems:"center"}}>
        {savedMsg&&<Bdg bg={T.accentL} c={T.accent}>{savedMsg}</Bdg>}
        <Btn sm onClick={sauvegarder}>Sauvegarder</Btn>
      </div>
      {["actif","passif","capitaux","produit","charge"].map(function(type){if(!groups[type])return null;return(
        <div key={type} style={{marginBottom:14}}>
          <div style={{background:T.navy,color:"#fff",padding:"7px 14px",fontSize:11,fontWeight:700,borderRadius:"8px 8px 0 0",textTransform:"uppercase"}}>{type}</div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:T.alt}}><th style={{padding:"6px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted}}>No</th><th style={{padding:"6px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted}}>Compte</th><th style={{padding:"6px 12px",textAlign:"right",fontSize:10,fontWeight:700,color:T.muted}}>Solde ouverture</th></tr></thead>
              <tbody>
                {groups[type].map(function(c){return(
                  <tr key={c.no} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"6px 12px",fontSize:11,color:T.muted}}>{c.no}</td>
                    <td style={{padding:"6px 12px",fontSize:12,color:T.text}}>{c.nom}</td>
                    <td style={{padding:"6px 12px",textAlign:"right"}}>
                      <input type="number" value={c.soldeOuv} onChange={function(e){upd(c.no,e.target.value);}} style={{width:130,border:"1px solid "+T.border,borderRadius:6,padding:"4px 8px",fontSize:12,fontFamily:"inherit",textAlign:"right",outline:"none"}} step="0.01"/>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      );})}
    </div>
  );
}

function TabGrandLivreSynd(){
  var s0=useState(COMPTES_SYND.length>0?COMPTES_SYND[0].no:"");var selCpt=s0[0];var setSelCpt=s0[1];
  var cpt=COMPTES_SYND.find(function(c){return c.no===selCpt;})||{no:"",nom:"Aucun compte",type:"actif",solde:0,cat:""};
  var isDebitNormal=cpt.type==="actif"||cpt.type==="charge";
  var solde=cpt.solde||0;
  var soldeInit=solde;
  var lignes=[];
  ECRITURES_SYND.forEach(function(e){
    e.debit.forEach(function(d){
      if(d.cpt===selCpt){var delta=isDebitNormal?d.mnt:-d.mnt;solde+=delta;lignes.push({date:e.date,no:e.no,desc:e.desc,debit:d.mnt,credit:0,solde:solde});}
    });
    e.credit.forEach(function(c){
      if(c.cpt===selCpt){var delta=isDebitNormal?-c.mnt:c.mnt;solde+=delta;lignes.push({date:e.date,no:e.no,desc:e.desc,debit:0,credit:c.mnt,solde:solde});}
    });
  });
  lignes.sort(function(a,b){return a.date>b.date?1:-1;});
  return(
    <div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,color:T.muted,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Compte</div>
        <select value={selCpt} onChange={function(e){setSelCpt(e.target.value);}} style={INP}>
          {COMPTES_SYND.map(function(c){return <option key={c.no} value={c.no}>{c.no} - {c.nom}</option>;})}
        </select>
      </div>
      <div style={{background:T.navy,color:"#fff",padding:"12px 16px",borderRadius:"10px 10px 0 0",display:"flex",justifyContent:"space-between"}}>
        <span style={{fontWeight:800,fontSize:14}}>{cpt.no} - {cpt.nom}</span>
        <span style={{fontSize:16,fontWeight:800,color:"#3CAF6E"}}>{fmt(solde)}</span>
      </div>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:T.alt}}>{["Date","Ref.","Description","Debit","Credit","Solde"].map(function(h){return <th key={h} style={{padding:"7px 12px",textAlign:["Debit","Credit","Solde"].includes(h)?"right":"left",fontSize:10,fontWeight:700,color:T.muted}}>{h}</th>;})}</tr></thead>
          <tbody>
            <tr style={{background:"#FFFBF0"}}><td style={{padding:"7px 12px",fontSize:11,color:T.muted}}>-</td><td style={{padding:"7px 12px",fontSize:11,color:T.muted}}>-</td><td style={{padding:"7px 12px",fontSize:12,fontWeight:600}}>Solde d ouverture</td><td style={{padding:"7px 12px",textAlign:"right"}}>-</td><td style={{padding:"7px 12px",textAlign:"right"}}>-</td><td style={{padding:"7px 12px",textAlign:"right",fontWeight:700,color:T.navy}}>{fmt(soldeInit)}</td></tr>
            {lignes.map(function(l,i){return(
              <tr key={i} style={{borderBottom:"1px solid "+T.border}}>
                <td style={{padding:"7px 12px",fontSize:11,color:T.muted}}>{l.date}</td>
                <td style={{padding:"7px 12px",fontSize:11,color:T.accent}}>{l.no}</td>
                <td style={{padding:"7px 12px",fontSize:12,color:T.text}}>{l.desc}</td>
                <td style={{padding:"7px 12px",textAlign:"right",fontSize:12,fontWeight:l.debit>0?600:400,color:l.debit>0?T.navy:T.muted}}>{l.debit>0?fmt(l.debit):"-"}</td>
                <td style={{padding:"7px 12px",textAlign:"right",fontSize:12,fontWeight:l.credit>0?600:400,color:l.credit>0?T.red:T.muted}}>{l.credit>0?fmt(l.credit):"-"}</td>
                <td style={{padding:"7px 12px",textAlign:"right",fontSize:12,fontWeight:700,color:l.solde>=0?T.navy:T.red}}>{fmt(l.solde)}</td>
              </tr>
            );})}
            {lignes.length===0&&<tr><td colSpan={6} style={{padding:30,textAlign:"center",color:T.muted,fontSize:13}}>Aucune ecriture pour ce compte.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabBudgetSynd(){
  var MOIS=[];
  var s0=useState({
    "Cotisations mensuelles":[0,0,0,0,0,0,0,0,0,0,0,0],
    "Honoraires Predictek":  [2400,2400,2400,2400,2400,2400,2400,2400,2400,2400,2400,2400],
    "Deneigement":           [3200,3200,2100,1800,800,0,0,0,0,0,200,2400],
    "Paysagement":           [0,0,0,600,800,900,900,900,900,900,800,0],
    "Electricite":           [320,320,320,320,280,280,280,280,280,280,280,280],
    "Assurance syndicat":    [0,0,0,0,0,0,0,0,8900,0,0,0],
    "Plomberie et urgences": [400,400,400,400,400,400,400,400,400,400,400,400],
    "Entretien ascenseur":   [0,0,0,0,0,2200,0,0,0,0,0,0],
    "Chauffage":             [180,180,180,150,150,150,150,150,150,150,150,150],
    "Fournitures et divers": [80,80,80,80,80,80,80,80,80,80,80,80],
  });
  var budget=s0[0];var setBudget=s0[1];

  var PRODUITS=[];
  var CHARGES=[];
  var REEL={"Cotisations mensuelles":0,"Honoraires Predictek":0,"Deneigement":0,"Paysagement":0,"Electricite":0,"Assurance syndicat":0,"Plomberie et urgences":0,"Entretien ascenseur":0,"Chauffage":0,"Fournitures et divers":940};

  function ligneTotal(k){return budget[k]?budget[k].reduce(function(a,v){return a+v;},0):0;}
  var totalProd=PRODUITS.reduce(function(a,k){return a+ligneTotal(k);},0);
  var totalCharg=CHARGES.reduce(function(a,k){return a+ligneTotal(k);},0);
  var surplus=totalProd-totalCharg;
  function upd(k,i,val){setBudget(function(prev){var n=Object.assign({},prev);n[k]=n[k].slice();n[k][i]=parseFloat(val)||0;return n;});}

  function BudgetRows(p){return p.keys.map(function(k){
    var total=ligneTotal(k);var reel=REEL[k]||0;var ecart=reel-total;
    return(
      <tr key={k} style={{borderBottom:"1px solid "+T.border}}>
        <td style={{padding:"6px 12px",fontSize:12,fontWeight:600,color:T.text,whiteSpace:"nowrap"}}>{k}</td>
        {(budget[k]||[]).map(function(val,i){return(
          <td key={i} style={{padding:"4px 5px",textAlign:"right"}}>
            <input type="number" value={val} onChange={function(e){upd(k,i,e.target.value);}} style={{width:62,border:"1px solid "+T.border,borderRadius:5,padding:"3px 4px",fontSize:11,fontFamily:"inherit",textAlign:"right",outline:"none"}}/>
          </td>
        );})}
        <td style={{padding:"6px 10px",textAlign:"right",fontSize:12,fontWeight:700,color:T.navy}}>{fmt(total)}</td>
        <td style={{padding:"6px 10px",textAlign:"right",fontSize:12,color:T.accent}}>{fmt(reel)}</td>
        <td style={{padding:"6px 10px",textAlign:"right",fontSize:12,fontWeight:700,color:ecart>=0?T.accent:T.red}}>{fmt(ecart)}</td>
      </tr>
    );
  });}

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[{l:"Revenus budgetes",v:fmt(totalProd),c:T.accent,bg:T.accentL},{l:"Charges budgetees",v:fmt(totalCharg),c:T.red,bg:T.redL},{l:"Surplus projete",v:fmt(surplus),c:surplus>=0?T.accent:T.red,bg:surplus>=0?T.accentL:T.redL}].map(function(s,i){return(
          <div key={i} style={{background:s.bg,borderRadius:10,padding:"11px 13px",border:"1px solid "+s.c+"33"}}>
            <div style={{fontSize:9,color:s.c,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{s.l}</div>
            <div style={{fontSize:17,fontWeight:800,color:s.c}}>{s.v}</div>
          </div>
        );})}
      </div>
      <div style={{overflowX:"auto",background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:1100}}>
          <thead>
            <tr style={{background:T.navy}}>
              <th style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#8da0bb"}}>Poste</th>
              {MOIS.map(function(m){return <th key={m} style={{padding:"8px 5px",textAlign:"right",fontSize:10,fontWeight:700,color:"#8da0bb"}}>{m}</th>;})}
              <th style={{padding:"8px 10px",textAlign:"right",fontSize:10,fontWeight:700,color:"#8da0bb"}}>Budget</th>
              <th style={{padding:"8px 10px",textAlign:"right",fontSize:10,fontWeight:700,color:"#8da0bb"}}>Reel</th>
              <th style={{padding:"8px 10px",textAlign:"right",fontSize:10,fontWeight:700,color:"#8da0bb"}}>Ecart</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{background:T.accentL}}><td colSpan={15} style={{padding:"6px 12px",fontSize:11,fontWeight:700,color:T.accent}}>PRODUITS</td></tr>
            <BudgetRows keys={PRODUITS}/>
            <tr style={{background:T.redL}}><td colSpan={15} style={{padding:"6px 12px",fontSize:11,fontWeight:700,color:T.red}}>CHARGES</td></tr>
            <BudgetRows keys={CHARGES}/>
            <tr style={{background:T.navy}}>
              <td style={{padding:"9px 12px",fontSize:13,fontWeight:700,color:"#fff"}}>SURPLUS NET</td>
              {MOIS.map(function(m,i){var sum=PRODUITS.reduce(function(a,k){return a+(budget[k]?budget[k][i]:0);},0)-CHARGES.reduce(function(a,k){return a+(budget[k]?budget[k][i]:0);},0);return <td key={i} style={{padding:"9px 5px",textAlign:"right",fontSize:11,fontWeight:700,color:sum>=0?"#3CAF6E":"#ff8080"}}>{fmt(sum)}</td>;})}
              <td style={{padding:"9px 10px",textAlign:"right",fontSize:13,fontWeight:800,color:"#3CAF6E"}}>{fmt(surplus)}</td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}



var COPROS_INIT=[];
var TICKETS_COPRO={};
function genCode(){return Math.floor(1000+Math.random()*9000).toString();}
function TabCopros(){
  var s0=useState(COPROS_INIT);var copros=s0[0];var setCopros=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState("");var search=s2[0];var setSearch=s2[1];
  var s3=useState("tous");var filtre=s3[0];var setFiltre=s3[1];
  var s4=useState(false);var showFiche=s4[0];var setShowFiche=s4[1];
  var s5=useState(false);var showCode=s5[0];var setShowCode=s5[1];
  var s6=useState("");var codeGenere=s6[0];var setCodeGenere=s6[1];
  function upd(id,changes){setCopros(function(prev){return prev.map(function(c){return c.id===id?Object.assign({},c,changes):c;});});}
  var liste=copros.filter(function(c){
    if(search){var q=search.toLowerCase();if(!(c.u+c.prenom+c.nom+c.courriel).toLowerCase().includes(q))return false;}
    if(filtre==="acces")return c.acces;if(filtre==="sans_acces")return !c.acces;if(filtre==="sans_courriel")return !c.courriel;
    if(filtre==="alertes"){var ceS=expSt(c.ce);var aS=expSt(c.ass);return ceS.c===T.red||aS.c===T.red||!c.pap;}
    return true;
  });
  var selC=sel?copros.find(function(c){return c.id===sel;}):null;
  var nAcces=copros.filter(function(c){return c.acces;}).length;
  var nAlertes=copros.filter(function(c){var ceS=expSt(c.ce);var aS=expSt(c.ass);return ceS.c===T.red||aS.c===T.red||!c.pap;}).length;
  function activerAcces(id){var code=genCode();setCodeGenere(code);upd(id,{acces:true,codeActif:true});setShowCode(true);}
  function reinitCode(id){var code=genCode();setCodeGenere(code);upd(id,{codeActif:true});setShowCode(true);}
  function desactiverAcces(id){upd(id,{acces:false,codeActif:false,derniereConnexion:""});}
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[{l:"Total",v:copros.length,c:T.navy,bg:T.blueL},{l:"Portail actif",v:nAcces,c:T.accent,bg:T.accentL},{l:"Sans courriel",v:copros.filter(function(c){return !c.courriel;}).length,c:T.amber,bg:T.amberL},{l:"Alertes",v:nAlertes,c:nAlertes>0?T.red:T.accent,bg:nAlertes>0?T.redL:T.accentL}].map(function(s,i){return(
          <div key={i} style={{background:s.bg,borderRadius:10,padding:"11px 13px",border:"1px solid "+s.c+"33"}}><div style={{fontSize:9,color:s.c,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{s.l}</div><div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div></div>
        );})}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
        {[["tous","Tous"],["acces","Portail actif"],["sans_acces","Sans acces"],["alertes","Alertes"]].map(function(f){var a=filtre===f[0];return(
          <button key={f[0]} onClick={function(){setFiltre(f[0]);}} style={{background:a?T.navy:"#fff",border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"4px 12px",color:a?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{f[1]}</button>
        );})}
        <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Chercher..." style={{border:"1px solid "+T.border,borderRadius:20,padding:"4px 12px",fontSize:11,fontFamily:"inherit",outline:"none",flex:1,minWidth:160}}/>
      </div>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:T.navy}}>{["Unite","Nom","Courriel","Cotisation","PAP","CE","Ass.","Portail","Actions"].map(function(h){return <th key={h} style={{padding:"7px 9px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>;})}</tr></thead>
            <tbody>
              {liste.map(function(c){var ceS=expSt(c.ce);var aS=expSt(c.ass);var alts=(ceS.c===T.red?1:0)+(aS.c===T.red?1:0)+(!c.pap?1:0);return(
                <tr key={c.id} style={{borderBottom:"1px solid "+T.border,background:alts>=2?T.redL:alts>=1?"#FFFBF0":T.surface,cursor:"pointer"}} onClick={function(){setSel(c.id);setShowFiche(true);}}>
                  <td style={{padding:"7px 9px",fontWeight:700,color:T.navy,fontSize:12}}>{c.u}</td>
                  <td style={{padding:"7px 9px",fontSize:12,color:T.text,whiteSpace:"nowrap"}}>{c.prenom} {c.nom}</td>
                  <td style={{padding:"7px 9px",fontSize:11,color:c.courriel?T.muted:T.red,fontStyle:c.courriel?"normal":"italic"}}>{c.courriel||"Manquant"}</td>
                  <td style={{padding:"7px 9px",fontSize:11,fontWeight:600}}>{Math.round(c.cot*100)/100} $</td>
                  <td style={{padding:"7px 9px",textAlign:"center"}}><span style={{width:14,height:14,borderRadius:"50%",background:c.pap?T.accent:T.red,display:"inline-block",fontSize:8,color:"#fff",lineHeight:"14px",textAlign:"center",fontWeight:700}}>{c.pap?"V":"!"}</span></td>
                  <td style={{padding:"7px 9px"}}><span style={{fontSize:9,fontWeight:700,color:ceS.c,background:ceS.bg,padding:"1px 5px",borderRadius:9}}>{ceS.l}</span></td>
                  <td style={{padding:"7px 9px"}}><span style={{fontSize:9,fontWeight:700,color:aS.c,background:aS.bg,padding:"1px 5px",borderRadius:9}}>{aS.l}</span></td>
                  <td style={{padding:"7px 9px",textAlign:"center"}}><Bdg bg={c.acces?T.accentL:T.alt} c={c.acces?T.accent:T.muted}>{c.acces?"Actif":"Inactif"}</Bdg></td>
                  <td style={{padding:"7px 9px"}} onClick={function(e){e.stopPropagation();}}>
                    <div style={{display:"flex",gap:4}}>
                      {!c.acces&&c.courriel&&<Btn sm onClick={function(){activerAcces(c.id);}}>Activer</Btn>}
                      {c.acces&&<Btn sm bg={T.amber} onClick={function(){reinitCode(c.id);}}>Code</Btn>}
                      {c.acces&&<Btn sm bg={T.red} onClick={function(){desactiverAcces(c.id);}}>Off</Btn>}
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
        <div style={{padding:"7px 12px",background:T.alt,fontSize:10,color:T.muted,borderTop:"1px solid "+T.border}}>{liste.length} coproprietaire(s) sur {copros.length}</div>
      </div>
      <Modal show={showFiche} onClose={function(){setShowFiche(false);setSel(null);}} title={"Fiche - Unite "+(selC?selC.u:"")} w={480}>
        {selC&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[{l:"Nom",v:selC.prenom+" "+selC.nom},{l:"Unite",v:selC.u},{l:"Courriel",v:selC.courriel||"-"},{l:"Cotisation",v:selC.cot+" $/mois"}].map(function(item,i){return(
                <div key={i} style={{background:T.alt,borderRadius:8,padding:"9px 11px"}}><div style={{fontSize:9,color:T.muted,fontWeight:600,textTransform:"uppercase",marginBottom:3}}>{item.l}</div><div style={{fontSize:13,fontWeight:600,color:T.text}}>{item.v}</div></div>
              );})}
            </div>
            <div style={{background:T.alt,borderRadius:8,padding:"11px 13px",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T.navy,marginBottom:8}}>Acces Portail</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <Bdg bg={selC.acces?T.accentL:T.alt} c={selC.acces?T.accent:T.muted}>{selC.acces?"Portail actif":"Portail inactif"}</Bdg>
                <div style={{display:"flex",gap:6}}>
                  {!selC.acces&&selC.courriel&&<Btn sm onClick={function(){activerAcces(selC.id);setShowFiche(false);}}>Activer</Btn>}
                  {selC.acces&&<Btn sm bg={T.amber} onClick={function(){reinitCode(selC.id);setShowFiche(false);}}>Reinit code</Btn>}
                  {selC.acces&&<Btn sm bg={T.red} onClick={function(){desactiverAcces(selC.id);setShowFiche(false);}}>Desactiver</Btn>}
                </div>
              </div>
            </div>
            {TICKETS_COPRO[selC.u]&&TICKETS_COPRO[selC.u].map(function(t,i){return(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:T.alt,borderRadius:7,marginBottom:5}}>
                <div><div style={{fontSize:12,color:T.text}}>{t.titre}</div><div style={{fontSize:10,color:T.muted}}>{t.date}</div></div>
                <Bdg bg={t.statut==="ferme"?T.accentL:T.blueL} c={t.statut==="ferme"?T.accent:T.blue}>{t.statut}</Bdg>
              </div>
            );})}
          </div>
        )}
      </Modal>
      <Modal show={showCode} onClose={function(){setShowCode(false);}} title="Code d acces genere" w={360}>
        <div style={{textAlign:"center",padding:"10px 0"}}>
          <div style={{fontSize:48,fontWeight:900,color:T.navy,letterSpacing:12,background:T.blueL,borderRadius:12,padding:20,marginBottom:16}}>{codeGenere}</div>
          <Btn onClick={function(){setShowCode(false);}}>Compris</Btn>
        </div>
      </Modal>
    </div>
  );
}


var FOURNISSEURS_CA=[];
var BONS_CA_INIT=[];
function TabFournisseursCA(){
  var s0=useState(BONS_CA_INIT);var bons=s0[0];var setBons=s0[1];
  var s1=useState("bons");var ong=s1[0];var setOng=s1[1];
  var s2=useState(false);var showN=s2[0];var setShowN=s2[1];
  var s3=useState({});var nf=s3[0];var setNf=s3[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  var BON_ST={nouveau:{c:T.blue,bg:T.blueL,l:"Nouveau"},approuve:{c:T.amber,bg:T.amberL,l:"Approuve"},complete:{c:T.accent,bg:T.accentL,l:"Complete"}};
  var PRIO_ST={urgence:{c:T.red,bg:T.redL},haute:{c:T.amber,bg:T.amberL},normale:{c:T.accent,bg:T.accentL}};
  return(
    <div>
      <div style={{display:"flex",gap:3,marginBottom:12,background:T.surface,padding:4,borderRadius:9,border:"1px solid "+T.border}}>
        {[["bons","Bons de travail"],["fournisseurs","Nos fournisseurs"]].map(function(t){var a=ong===t[0];return(
          <button key={t[0]} onClick={function(){setOng(t[0]);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"6px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400}}>{t[1]}</button>
        );})}
        <div style={{marginLeft:"auto"}}><Btn sm onClick={function(){setNf({four:FOURNISSEURS_CA[0].nom,cat:"Plomberie",unite:"",desc:"",date:today(),mnt:"",prio:"normale"});setShowN(true);}}>+ Bon de travail</Btn></div>
      </div>
      {ong==="bons"&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:T.navy}}>{["Fournisseur","Unite","Description","Date","Montant","Priorite","Statut","Action"].map(function(h){return <th key={h} style={{padding:"7px 10px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>;})}</tr></thead>
            <tbody>
              {bons.map(function(b){var st=BON_ST[b.statut]||BON_ST.nouveau;var pr=PRIO_ST[b.prio]||PRIO_ST.normale;return(
                <tr key={b.id} style={{borderBottom:"1px solid "+T.border}}>
                  <td style={{padding:"8px 10px",fontWeight:600,fontSize:12}}>{b.four}</td>
                  <td style={{padding:"8px 10px",fontSize:11,color:T.muted}}>{b.unite}</td>
                  <td style={{padding:"8px 10px",fontSize:12,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.desc}</td>
                  <td style={{padding:"8px 10px",fontSize:11,color:T.muted}}>{b.date}</td>
                  <td style={{padding:"8px 10px",fontSize:12,fontWeight:600}}>{b.mnt>0?fmt(b.mnt):"A definir"}</td>
                  <td style={{padding:"8px 10px"}}><Bdg bg={pr.bg} c={pr.c}>{b.prio}</Bdg></td>
                  <td style={{padding:"8px 10px"}}><Bdg bg={st.bg} c={st.c}>{st.l}</Bdg></td>
                  <td style={{padding:"8px 10px"}}>
                    {b.statut==="nouveau"&&<Btn sm onClick={function(){setBons(function(prev){return prev.map(function(x){return x.id===b.id?Object.assign({},x,{statut:"approuve"}):x;});});}}>Approuver</Btn>}
                    {b.statut==="approuve"&&<Btn sm bg={T.blueL} tc={T.blue} onClick={function(){setBons(function(prev){return prev.map(function(x){return x.id===b.id?Object.assign({},x,{statut:"complete"}):x;});});}}>Completer</Btn>}
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      )}
      {ong==="fournisseurs"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {FOURNISSEURS_CA.map(function(f){return(
            <div key={f.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>{f.nom}</div><Bdg bg={T.alt} c={T.muted}>{f.cat}</Bdg></div>
                <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:f.note>=4.5?T.accent:T.amber}}>{f.note}</div><div style={{fontSize:8,color:T.muted}}>sur 5</div></div>
              </div>
              <div style={{fontSize:11,color:T.muted}}>{f.contact} | {f.tel}</div>
            </div>
          );})}
        </div>
      )}
      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouveau bon de travail" w={460}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div style={{gridColumn:"1/-1"}}><Lbl l="Fournisseur"/><select value={nf.four||""} onChange={function(e){snf("four",e.target.value);}} style={INP}>{FOURNISSEURS_CA.map(function(f){return <option key={f.id} value={f.nom}>{f.nom}</option>;})}</select></div>
          <div><Lbl l="Unite"/><input value={nf.unite||""} onChange={function(e){snf("unite",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Date"/><input type="date" value={nf.date||""} onChange={function(e){snf("date",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Priorite"/><select value={nf.prio||"normale"} onChange={function(e){snf("prio",e.target.value);}} style={INP}><option value="normale">Normale</option><option value="haute">Haute</option><option value="urgence">URGENCE</option></select></div>
          <div><Lbl l="Montant ($)"/><input type="number" value={nf.mnt||""} onChange={function(e){snf("mnt",parseFloat(e.target.value)||0);}} style={INP}/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl l="Description"/><textarea value={nf.desc||""} onChange={function(e){snf("desc",e.target.value);}} rows={3} style={Object.assign({},INP,{resize:"vertical"})}/></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){if(!nf.desc)return;setBons(function(prev){return prev.concat([Object.assign({},nf,{id:Date.now(),statut:"nouveau"})]);});setShowN(false);}}>Creer</Btn>
          <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
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
  var TABS=[];

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
      {ong==="copros"&&<TabCopros/>}
      {ong==="fournisseurs"&&<TabFournisseursCA/>}
      {ong==="soldes"&&<TabSoldesOuvSynd/>}
      {ong==="grandlivre"&&<TabGrandLivreSynd/>}
      {ong==="budget"&&<TabBudgetSynd/>}
      <ExportCopros show={showExp} onClose={function(){setShowExp(false);}}/>
    </div>
  );
}
