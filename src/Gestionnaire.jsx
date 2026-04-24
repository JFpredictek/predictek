import { useState } from "react";
const T={bg:"#F5F3EE",surface:"#FFF",surfaceAlt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentMid:"#2D8653",accentLight:"#E8F2EC",accentPop:"#3CAF6E",gold:"#B8943A",goldLight:"#FAF3E0",red:"#B83232",redLight:"#FDECEA",amber:"#B86020",amberLight:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueLight:"#EFF6FF",purple:"#6B3FA0",purpleLight:"#F3EEFF"};
var money=function(n){if(!n&&n!==0)return"—";return(n<0?"-":"")+Math.abs(n).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var td=function(){return new Date().toISOString().slice(0,10);};
var du=function(d){return d?Math.ceil((new Date(d)-new Date())/86400000):9999;};
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

// ============ DONNEES INITIALES ============
const SYNDICAT={nom:"Syndicat Piedmont",adresse:"Ch. du Hibou, Stoneham-et-Tewkesbury QC G3C 1T1",president:"Jean-Francois Laroche",immatriculation:"1144524577",exercice:"1 nov au 31 oct",nbUnites:36};
const COMPTES=[
  {id:1,nom:"Compte operation",no:"021258-1",solde:7361.88,type:"operation"},
  {id:2,nom:"Fonds de prevoyance",no:"0212558-ET1",solde:64235.01,type:"prevoyance"},
  {id:3,nom:"Fonds assurance",no:"0212558-ET3",solde:36178.37,type:"assurance"},
];
const BUDGET_INIT=[
  {id:1,cat:"Administration",sous:"Honoraires gestion",budget:28800,reel:14400,mois:6},
  {id:2,cat:"Administration",sous:"Frais legaux et notariaux",budget:2000,reel:450,mois:6},
  {id:3,cat:"Administration",sous:"Assurance syndicat",budget:18500,reel:18500,mois:6},
  {id:4,cat:"Entretien",sous:"Deneigement",budget:22000,reel:18750,mois:6},
  {id:5,cat:"Entretien",sous:"Paysagement",budget:8500,reel:5200,mois:6},
  {id:6,cat:"Entretien",sous:"Entretien batiment",budget:15000,reel:6830,mois:6},
  {id:7,cat:"Entretien",sous:"Nettoyage parties communes",budget:4800,reel:2400,mois:6},
  {id:8,cat:"Services",sous:"Electricite parties communes",budget:6000,reel:3150,mois:6},
  {id:9,cat:"Services",sous:"Aqueduc et egouts",budget:3600,reel:1800,mois:6},
  {id:10,cat:"Fonds de prevoyance",sous:"Cotisation prevoyance",budget:36000,reel:18000,mois:6},
  {id:11,cat:"Imprevus",sous:"Reserve imprevus",budget:5000,reel:1200,mois:6},
];
const FACTURES_INIT=[
  {id:1,fournisseur:"Deneigement Express",date:"2026-04-10",montant:3750.00,desc:"Deneigement mars 2026",statut:"approuvee",compte:1,ref:"FRNC-089",approuvePar:"J-F Laroche",dateApprob:"2026-04-11"},
  {id:2,fournisseur:"Paysagement Horizon",date:"2026-04-15",montant:1200.00,desc:"Entretien printemps - phase 1",statut:"en_attente",compte:1,ref:"FRNC-090",approuvePar:"",dateApprob:""},
  {id:3,fournisseur:"Plomberie ProFlo",date:"2026-04-22",montant:485.00,desc:"Reparation fuite unite 527",statut:"en_attente",compte:1,ref:"FRNC-091",approuvePar:"",dateApprob:""},
  {id:4,fournisseur:"AscenseurTech QC",date:"2026-03-31",montant:2200.00,desc:"Inspection annuelle ascenseur",statut:"approuvee",compte:1,ref:"FRNC-088",approuvePar:"J-F Laroche",dateApprob:"2026-04-01"},
  {id:5,fournisseur:"Hydro-Quebec",date:"2026-04-01",montant:892.50,desc:"Electricite parties communes - mars",statut:"approuvee",compte:1,ref:"FRNC-087",approuvePar:"J-F Laroche",dateApprob:"2026-04-02"},
];
const PRELEVEMENTS_INIT=[
  {id:1,date:"2026-05-01",desc:"Cotisations mensuelles - mai 2026",montant:14297.28,statut:"planifie",nbUnites:36,approuvePar:"",dateApprob:""},
  {id:2,date:"2026-04-01",desc:"Cotisations mensuelles - avril 2026",montant:14297.28,statut:"effectue",nbUnites:36,approuvePar:"J-F Laroche",dateApprob:"2026-03-28"},
  {id:3,date:"2026-03-01",desc:"Cotisations mensuelles - mars 2026",montant:14297.28,statut:"effectue",nbUnites:36,approuvePar:"J-F Laroche",dateApprob:"2026-02-26"},
];
const REUNIONS_INIT=[
  {id:1,type:"CA",date:"2026-05-15",heure:"19:00",lieu:"Salle comm. Piedmont",statut:"planifiee",ordre:[{item:"Approbation PV 18 mars"},{item:"Rapport financier Q2"},{item:"Soumissions deneigement 2026-2027"},{item:"Divers"}],pv:"",participants:[]},
  {id:2,type:"CA",date:"2026-03-18",heure:"19:00",lieu:"Salle comm. Piedmont",statut:"tenue",ordre:[{item:"Approbation PV janvier"},{item:"Rapport financier"},{item:"Factures a approuver"}],pv:"Seance ouverte a 19h02. Quorum atteint (4/5 membres). Rapport financier presente et accepte. Factures approuvees a l'unanimite. Seance levee a 20h45.",participants:["J-F Laroche","M. Fredette","C. Pinard","R. Donnelly"]},
  {id:3,type:"AGO",date:"2026-01-25",heure:"14:00",lieu:"Centre communautaire Stoneham",statut:"tenue",ordre:[{item:"Ouverture et quorum"},{item:"Rapport annuel administrateur"},{item:"Etats financiers 2024-2025"},{item:"Budget 2025-2026"},{item:"Election CA"},{item:"Questions des coproprietaires"}],pv:"AGO 2025-2026 tenue le 25 janvier 2026. Quorum: 22 unites representees (61%). Etats financiers adoptes. Budget 2025-2026 approuve. CA reconduit pour un an.",participants:["J-F Laroche","J-F Begin","M. Beaudoin","L. Tremblay","E. Poulin","C. Pinard","R. Donnelly","S. Grondin"]},
];
const CARNET_INIT=[
  {id:1,composante:"Toiture — asphalte",installation:"2015-06-01",dureeVie:25,cout:85000,notes:"Inspection 2024: bon etat",dernierEntretien:"2024-09-15"},
  {id:2,composante:"Systeme de chauffage central",installation:"2013-09-01",dureeVie:20,cout:42000,notes:"Entretien annuel requis",dernierEntretien:"2025-10-01"},
  {id:3,composante:"Ascenseur",installation:"2013-09-01",dureeVie:25,cout:95000,notes:"Inspection annuelle AscenseurTech",dernierEntretien:"2026-03-31"},
  {id:4,composante:"Revelement exterieur — brique",installation:"2013-09-01",dureeVie:40,cout:320000,notes:"RAS",dernierEntretien:"2023-06-01"},
  {id:5,composante:"Portes et fenetres parties communes",installation:"2020-08-01",dureeVie:25,cout:28000,notes:"Remplacement partiel 2020",dernierEntretien:"2024-06-01"},
  {id:6,composante:"Systeme incendie et gicleurs",installation:"2013-09-01",dureeVie:25,cout:38000,notes:"Inspection annuelle obligatoire",dernierEntretien:"2025-11-15"},
  {id:7,composante:"Stationnement — asphalte",installation:"2019-05-01",dureeVie:15,cout:45000,notes:"Fissures mineures secteur B",dernierEntretien:"2024-05-01"},
  {id:8,composante:"Systeme electrique parties communes",installation:"2013-09-01",dureeVie:30,cout:55000,notes:"Inspection 5 ans",dernierEntretien:"2023-09-01"},
  {id:9,composante:"Plomberie parties communes",installation:"2013-09-01",dureeVie:30,cout:48000,notes:"Verification annuelle",dernierEntretien:"2025-06-01"},
  {id:10,composante:"Amenagement paysager",installation:"2014-05-01",dureeVie:15,cout:22000,notes:"Renovation partielle prevue 2027",dernierEntretien:"2025-09-15"},
];

// ============ TAB: TABLEAU DE BORD ============
function TabBord(p){
  var totalBudget=BUDGET_INIT.reduce(function(a,b){return a+b.budget;},0);
  var totalReel=BUDGET_INIT.reduce(function(a,b){return a+b.reel;},0);
  var totalSoldes=COMPTES.reduce(function(a,c){return a+c.solde;},0);
  var factEnAttente=p.factures.filter(function(f){return f.statut==="en_attente";});
  var prevPlanifie=p.prelevements.filter(function(pr){return pr.statut==="planifie";});
  var prochReunion=p.reunions.filter(function(r){return r.statut==="planifiee";}).sort(function(a,b){return a.date.localeCompare(b.date);})[0];
  var alertesCarnet=p.carnet.filter(function(c){var annees=(new Date().getFullYear()-parseInt(c.installation.substring(0,4)));return (annees/c.dureeVie)>=0.8;}).length;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[
          {l:"Solde total comptes",v:money(totalSoldes),c:T.accent,bg:T.accentLight,sub:"3 comptes bancaires"},
          {l:"Factures en attente",v:factEnAttente.length,c:factEnAttente.length>0?T.amber:T.accent,bg:factEnAttente.length>0?T.amberLight:T.accentLight,sub:money(factEnAttente.reduce(function(a,f){return a+f.montant;},0))},
          {l:"Budget utilise (6 mois)",v:Math.round(totalReel/totalBudget*100)+"%",c:T.navy,bg:T.blueLight,sub:money(totalReel)+" / "+money(totalBudget)},
          {l:"Alertes carnet",v:alertesCarnet,c:alertesCarnet>0?T.red:T.accent,bg:alertesCarnet>0?T.redLight:T.accentLight,sub:"composantes > 80% duree de vie"},
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
              <div>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>{c.nom}</div>
                <div style={{fontSize:10,color:T.muted}}>No {c.no}</div>
              </div>
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
            <SH l="Factures en attente d'approbation"/>
            {factEnAttente.length===0&&<div style={{color:T.muted,fontSize:12}}>Aucune facture en attente</div>}
            {factEnAttente.map(function(f){return(
              <div key={f.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid "+T.border}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:T.text}}>{f.fournisseur}</div>
                  <div style={{fontSize:10,color:T.muted}}>{f.date} — {f.desc.substring(0,35)}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.amber}}>{money(f.montant)}</div>
                </div>
              </div>
            );})}
          </Card>
          {prochReunion&&<Card>
            <SH l="Prochaine reunion CA"/>
            <div style={{fontSize:14,fontWeight:700,color:T.navy}}>{prochReunion.date} a {prochReunion.heure}</div>
            <div style={{fontSize:12,color:T.muted,marginTop:4}}>{prochReunion.lieu}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:8}}>{prochReunion.ordre.length} points a l'ordre du jour</div>
          </Card>}
          {prevPlanifie.length>0&&<Card s={{marginTop:12}}>
            <SH l="Prelevement planifie"/>
            {prevPlanifie.map(function(pr){return(
              <div key={pr.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:12,fontWeight:600,color:T.text}}>{pr.date}</div><div style={{fontSize:10,color:T.muted}}>{pr.nbUnites} unites</div></div>
                <div style={{fontSize:14,fontWeight:700,color:T.blue}}>{money(pr.montant)}</div>
              </div>
            );})}
          </Card>}
        </div>
      </div>
    </div>
  );
}

// ============ TAB: FINANCES ============
function TabFinances(p){
  var s1=useState("budget"); var sousOng=s1[0]; var setSousOng=s1[1];
  var s2=useState(null); var modal=s2[0]; var setModal=s2[1];
  var s3=useState({}); var form=s3[0]; var setForm=s3[1];
  function sf(k,v){setForm(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}

  function approuverFacture(id){
    p.setFactures(function(prev){return prev.map(function(f){return f.id===id?Object.assign({},f,{statut:"approuvee",approuvePar:"J-F Laroche",dateApprob:td()}):f;});});
  }
  function approuverPrelevement(id){
    p.setPrelevements(function(prev){return prev.map(function(pr){return pr.id===id?Object.assign({},pr,{statut:"approuve",approuvePar:"J-F Laroche",dateApprob:td()}):pr;});});
  }

  var catTotaux={};
  BUDGET_INIT.forEach(function(b){
    if(!catTotaux[b.cat])catTotaux[b.cat]={budget:0,reel:0};
    catTotaux[b.cat].budget+=b.budget;
    catTotaux[b.cat].reel+=b.reel;
  });
  var totalB=BUDGET_INIT.reduce(function(a,b){return a+b.budget;},0);
  var totalR=BUDGET_INIT.reduce(function(a,b){return a+b.reel;},0);

  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["budget","Budget annuel"],["factures","Approbation factures"],["prelevements","Prelevements"]].map(function(t){var a=sousOng===t[0];return(
          <button key={t[0]} onClick={function(){setSousOng(t[0]);}} style={{background:a?T.navy:"#fff",border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"5px 14px",color:a?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>
        );})}
      </div>

      {sousOng==="budget"&&(
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <b style={{fontSize:14,color:T.navy}}>Budget 2025-2026 — 6 mois ecoules</b>
            <Badge bg={T.blueLight} c={T.blue}>{Math.round(totalR/totalB*100)}% utilise</Badge>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:T.surfaceAlt}}>
                {["Categorie","Poste","Budget annuel","Reel 6 mois","Ecart","% utilise"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:h==="Budget annuel"||h==="Reel 6 mois"||h==="Ecart"||h==="% utilise"?"right":"left",fontSize:10,color:T.muted,fontWeight:600}}>{h}</th>;})}
              </tr>
            </thead>
            <tbody>
              {BUDGET_INIT.map(function(b){var pct=Math.round(b.reel/b.budget*100);var over=b.reel>(b.budget/2);return(
                <tr key={b.id} style={{borderBottom:"1px solid "+T.border}}>
                  <td style={{padding:"8px 10px",color:T.muted,fontSize:11}}>{b.cat}</td>
                  <td style={{padding:"8px 10px",color:T.text}}>{b.sous}</td>
                  <td style={{padding:"8px 10px",textAlign:"right",color:T.text}}>{money(b.budget)}</td>
                  <td style={{padding:"8px 10px",textAlign:"right",color:over?T.amber:T.text}}>{money(b.reel)}</td>
                  <td style={{padding:"8px 10px",textAlign:"right",color:over?T.amber:T.muted}}>{money(b.budget/2-b.reel)}</td>
                  <td style={{padding:"8px 10px",textAlign:"right"}}><span style={{fontSize:10,fontWeight:700,color:pct>100?T.red:pct>85?T.amber:T.accent}}>{pct}%</span></td>
                </tr>
              );})}
              <tr style={{background:T.surfaceAlt,fontWeight:700}}>
                <td colSpan={2} style={{padding:"10px 10px",color:T.navy}}>TOTAL</td>
                <td style={{padding:"10px 10px",textAlign:"right",color:T.navy}}>{money(totalB)}</td>
                <td style={{padding:"10px 10px",textAlign:"right",color:T.navy}}>{money(totalR)}</td>
                <td style={{padding:"10px 10px",textAlign:"right",color:T.navy}}>{money(totalB/2-totalR)}</td>
                <td style={{padding:"10px 10px",textAlign:"right",color:T.navy}}>{Math.round(totalR/totalB*100)}%</td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {sousOng==="factures"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <b style={{fontSize:14,color:T.navy}}>Factures a approuver</b>
            <Btn onClick={function(){setForm({fournisseur:"",date:td(),montant:"",desc:"",compte:1,ref:""});setModal("facture");}}>+ Nouvelle facture</Btn>
          </div>
          <Card>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{background:T.surfaceAlt}}>
                  {["Fournisseur","Date","Description","Ref","Montant","Statut","Action"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:h==="Montant"?"right":"left",fontSize:10,color:T.muted,fontWeight:600}}>{h}</th>;})}
                </tr>
              </thead>
              <tbody>
                {p.factures.map(function(f){return(
                  <tr key={f.id} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"8px 10px",fontWeight:600,color:T.text}}>{f.fournisseur}</td>
                    <td style={{padding:"8px 10px",color:T.muted}}>{f.date}</td>
                    <td style={{padding:"8px 10px",color:T.text,maxWidth:200}}>{f.desc}</td>
                    <td style={{padding:"8px 10px",color:T.muted}}>{f.ref}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:T.text}}>{money(f.montant)}</td>
                    <td style={{padding:"8px 10px"}}>
                      <Badge bg={f.statut==="approuvee"?T.accentLight:T.amberLight} c={f.statut==="approuvee"?T.accent:T.amber}>{f.statut==="approuvee"?"Approuvee":"En attente"}</Badge>
                    </td>
                    <td style={{padding:"8px 10px"}}>
                      {f.statut==="en_attente"&&<Btn sm onClick={function(){approuverFacture(f.id);}}>Approuver</Btn>}
                      {f.statut==="approuvee"&&<span style={{fontSize:10,color:T.muted}}>{f.approuvePar} {f.dateApprob}</span>}
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </Card>
          <Modal open={modal==="facture"} onClose={function(){setModal(null);}} title="Nouvelle facture" w={500}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <F l="Fournisseur" s={{gridColumn:"1/-1"}}><input value={form.fournisseur||""} onChange={function(e){sf("fournisseur",e.target.value);}} style={inp}/></F>
              <F l="Date"><input type="date" value={form.date||""} onChange={function(e){sf("date",e.target.value);}} style={inp}/></F>
              <F l="Montant ($)"><input type="number" value={form.montant||""} onChange={function(e){sf("montant",parseFloat(e.target.value)||0);}} style={inp}/></F>
              <F l="Description" s={{gridColumn:"1/-1"}}><input value={form.desc||""} onChange={function(e){sf("desc",e.target.value);}} style={inp}/></F>
              <F l="Reference"><input value={form.ref||""} onChange={function(e){sf("ref",e.target.value);}} style={inp}/></F>
              <F l="Compte">
                <select value={form.compte||1} onChange={function(e){sf("compte",parseInt(e.target.value));}} style={inp}>
                  {COMPTES.map(function(c){return <option key={c.id} value={c.id}>{c.nom}</option>;})}
                </select>
              </F>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={function(){p.setFactures(function(prev){return prev.concat([Object.assign({},form,{id:Date.now(),statut:"en_attente",approuvePar:"",dateApprob:""})]);});setModal(null);}}>Enregistrer</Btn>
              <Btn onClick={function(){setModal(null);}} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </Modal>
        </div>
      )}

      {sousOng==="prelevements"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <b style={{fontSize:14,color:T.navy}}>Prelevements bancaires</b>
            <Btn onClick={function(){setForm({date:"",desc:"Cotisations mensuelles",montant:14297.28,nbUnites:36});setModal("prlv");}}>+ Nouveau prelevement</Btn>
          </div>
          <Card>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{background:T.surfaceAlt}}>
                  {["Date","Description","Unites","Montant total","Statut","Action"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:h==="Montant total"?"right":"left",fontSize:10,color:T.muted,fontWeight:600}}>{h}</th>;})}
                </tr>
              </thead>
              <tbody>
                {p.prelevements.map(function(pr){return(
                  <tr key={pr.id} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"8px 10px",fontWeight:600,color:T.text}}>{pr.date}</td>
                    <td style={{padding:"8px 10px",color:T.text}}>{pr.desc}</td>
                    <td style={{padding:"8px 10px",color:T.muted}}>{pr.nbUnites}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:T.navy}}>{money(pr.montant)}</td>
                    <td style={{padding:"8px 10px"}}>
                      <Badge bg={pr.statut==="effectue"?T.accentLight:pr.statut==="approuve"?T.blueLight:T.amberLight} c={pr.statut==="effectue"?T.accent:pr.statut==="approuve"?T.blue:T.amber}>
                        {pr.statut==="effectue"?"Effectue":pr.statut==="approuve"?"Approuve":"Planifie"}
                      </Badge>
                    </td>
                    <td style={{padding:"8px 10px"}}>
                      {pr.statut==="planifie"&&<Btn sm onClick={function(){approuverPrelevement(pr.id);}}>Approuver</Btn>}
                      {pr.statut!=="planifie"&&<span style={{fontSize:10,color:T.muted}}>{pr.approuvePar||""}</span>}
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </Card>
          <Modal open={modal==="prlv"} onClose={function(){setModal(null);}} title="Nouveau prelevement" w={440}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <F l="Date prevue"><input type="date" value={form.date||""} onChange={function(e){sf("date",e.target.value);}} style={inp}/></F>
              <F l="Nb unites"><input type="number" value={form.nbUnites||36} onChange={function(e){sf("nbUnites",parseInt(e.target.value)||0);}} style={inp}/></F>
              <F l="Montant total ($)" s={{gridColumn:"1/-1"}}><input type="number" value={form.montant||""} onChange={function(e){sf("montant",parseFloat(e.target.value)||0);}} style={inp}/></F>
              <F l="Description" s={{gridColumn:"1/-1"}}><input value={form.desc||""} onChange={function(e){sf("desc",e.target.value);}} style={inp}/></F>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={function(){p.setPrelevements(function(prev){return prev.concat([Object.assign({},form,{id:Date.now(),statut:"planifie",approuvePar:"",dateApprob:""})]);});setModal(null);}}>Enregistrer</Btn>
              <Btn onClick={function(){setModal(null);}} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}

// ============ TAB: REUNIONS ============
function TabReunions(p){
  var s1=useState(null); var sel=s1[0]; var setSel=s1[1];
  var s2=useState(null); var modal=s2[0]; var setModal=s2[1];
  var s3=useState({}); var form=s3[0]; var setForm=s3[1];
  function sf(k,v){setForm(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}
  var selR=sel?p.reunions.find(function(r){return r.id===sel;}):null;
  return(
    <div style={{display:"flex",gap:14}}>
      <div style={{width:320,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <b style={{fontSize:14,color:T.navy}}>Reunions du CA</b>
          <Btn sm onClick={function(){setForm({type:"CA",date:"",heure:"19:00",lieu:"Salle comm. Piedmont",statut:"planifiee",ordre:[],pv:"",participants:[]});setModal("reunion");}}>+ Nouvelle</Btn>
        </div>
        {p.reunions.sort(function(a,b){return b.date.localeCompare(a.date);}).map(function(r){return(
          <div key={r.id} onClick={function(){setSel(r.id);}} style={{background:sel===r.id?T.accentLight:T.surface,border:"1px solid "+(sel===r.id?T.accent:T.border),borderRadius:10,padding:12,marginBottom:8,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <Badge bg={r.type==="AGO"?T.purpleLight:T.blueLight} c={r.type==="AGO"?T.purple:T.blue}>{r.type}</Badge>
              <Badge bg={r.statut==="tenue"?T.accentLight:T.amberLight} c={r.statut==="tenue"?T.accent:T.amber}>{r.statut==="tenue"?"Tenue":"Planifiee"}</Badge>
            </div>
            <div style={{fontSize:13,fontWeight:600,color:T.text}}>{r.date} a {r.heure}</div>
            <div style={{fontSize:11,color:T.muted}}>{r.lieu}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:4}}>{r.ordre.length} pts ordre du jour{r.pv?" • PV disponible":""}</div>
          </div>
        );})}
      </div>
      <div style={{flex:1}}>
        {!selR&&<div style={{textAlign:"center",color:T.muted,padding:60,fontSize:13}}>Selectionnez une reunion pour voir les details</div>}
        {selR&&(
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:T.navy}}>{selR.type} — {selR.date}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>{selR.heure} | {selR.lieu}</div>
              </div>
              <Badge bg={selR.statut==="tenue"?T.accentLight:T.amberLight} c={selR.statut==="tenue"?T.accent:T.amber}>{selR.statut==="tenue"?"Tenue":"Planifiee"}</Badge>
            </div>
            <SH l="Ordre du jour"/>
            {selR.ordre.map(function(o,i){return(
              <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:"1px solid "+T.border,alignItems:"center"}}>
                <span style={{width:20,height:20,borderRadius:"50%",background:T.navy,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
                <span style={{fontSize:12,color:T.text}}>{o.item}</span>
              </div>
            );})}
            {selR.participants&&selR.participants.length>0&&(
              <div style={{marginTop:14}}>
                <SH l="Participants ({selR.participants.length})"/>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {selR.participants.map(function(pt){return <Badge key={pt} bg={T.blueLight} c={T.blue}>{pt}</Badge>;})}
                </div>
              </div>
            )}
            {selR.pv&&(
              <div style={{marginTop:14}}>
                <SH l="Proces-verbal"/>
                <div style={{background:T.surfaceAlt,borderRadius:8,padding:14,fontSize:12,color:T.text,lineHeight:1.6}}>{selR.pv}</div>
              </div>
            )}
            {!selR.pv&&selR.statut==="planifiee"&&(
              <div style={{marginTop:12,background:T.amberLight,borderRadius:8,padding:12,fontSize:11,color:T.amber}}>Proces-verbal a rediger apres la tenue de la reunion</div>
            )}
          </Card>
        )}
      </div>
      <Modal open={modal==="reunion"} onClose={function(){setModal(null);}} title="Nouvelle reunion" w={480}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <F l="Type"><select value={form.type||"CA"} onChange={function(e){sf("type",e.target.value);}} style={inp}><option value="CA">Reunion CA</option><option value="AGO">Assemblee generale (AGO)</option><option value="AGE">Assemblee speciale (AGE)</option></select></F>
          <F l="Statut"><select value={form.statut||"planifiee"} onChange={function(e){sf("statut",e.target.value);}} style={inp}><option value="planifiee">Planifiee</option><option value="tenue">Tenue</option></select></F>
          <F l="Date"><input type="date" value={form.date||""} onChange={function(e){sf("date",e.target.value);}} style={inp}/></F>
          <F l="Heure"><input type="time" value={form.heure||"19:00"} onChange={function(e){sf("heure",e.target.value);}} style={inp}/></F>
          <F l="Lieu" s={{gridColumn:"1/-1"}}><input value={form.lieu||""} onChange={function(e){sf("lieu",e.target.value);}} style={inp}/></F>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){p.setReunions(function(prev){return prev.concat([Object.assign({},form,{id:Date.now(),ordre:[],pv:"",participants:[]})]);});setModal(null);}}>Creer</Btn>
          <Btn onClick={function(){setModal(null);}} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ============ TAB: CARNET D'ENTRETIEN ============
function TabCarnet(p){
  var s1=useState(null); var modal=s1[0]; var setModal=s1[1];
  var s2=useState({}); var form=s2[0]; var setForm=s2[1];
  function sf(k,v){setForm(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}

  function statCarnet(c){
    var anneeInstall=parseInt(c.installation.substring(0,4));
    var ageAns=new Date().getFullYear()-anneeInstall;
    var pct=Math.round(ageAns/c.dureeVie*100);
    var anneeRemplacement=anneeInstall+c.dureeVie;
    if(pct>=100)return{c:T.red,bg:T.redLight,l:"Remplacement du",pct:100,annee:anneeRemplacement};
    if(pct>=80)return{c:T.red,bg:T.redLight,l:"Urgent - "+anneeRemplacement,pct:pct,annee:anneeRemplacement};
    if(pct>=60)return{c:T.amber,bg:T.amberLight,l:"Attention - "+anneeRemplacement,pct:pct,annee:anneeRemplacement};
    return{c:T.accent,bg:T.accentLight,l:"OK - "+anneeRemplacement,pct:pct,annee:anneeRemplacement};
  }

  var coutTotal=p.carnet.reduce(function(a,c){return a+c.cout;},0);
  var alertes=p.carnet.filter(function(c){return statCarnet(c).pct>=80;}).length;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <b style={{fontSize:14,color:T.navy,display:"block"}}>Carnet d'entretien — Loi 16</b>
          <span style={{fontSize:11,color:T.muted}}>{p.carnet.length} composantes | Valeur totale: {money(coutTotal)} | {alertes} alerte(s)</span>
        </div>
        <Btn onClick={function(){setForm({composante:"",installation:"",dureeVie:20,cout:0,notes:"",dernierEntretien:""});setModal("composante");}}>+ Ajouter composante</Btn>
      </div>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:T.navy}}>
              {["Composante","Annee install.","Duree vie","Remplacement","Cout estim.","% utilise","Statut","Dernier entretien"].map(function(h){return <th key={h} style={{padding:"8px 10px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>;})}
            </tr>
          </thead>
          <tbody>
            {p.carnet.map(function(c){var st=statCarnet(c);return(
              <tr key={c.id} style={{borderBottom:"1px solid "+T.border,background:st.pct>=80?st.bg:"transparent"}}>
                <td style={{padding:"9px 10px",fontWeight:600,color:T.text,fontSize:12}}>{c.composante}</td>
                <td style={{padding:"9px 10px",color:T.muted,fontSize:11}}>{c.installation.substring(0,4)}</td>
                <td style={{padding:"9px 10px",color:T.muted,fontSize:11}}>{c.dureeVie} ans</td>
                <td style={{padding:"9px 10px",fontWeight:600,color:st.c,fontSize:11}}>{st.annee}</td>
                <td style={{padding:"9px 10px",color:T.text,fontSize:11}}>{money(c.cout)}</td>
                <td style={{padding:"9px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{flex:1,height:6,background:T.border,borderRadius:3,overflow:"hidden",minWidth:60}}>
                      <div style={{width:Math.min(st.pct,100)+"%",height:"100%",background:st.c,borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:st.c,whiteSpace:"nowrap"}}>{st.pct}%</span>
                  </div>
                </td>
                <td style={{padding:"9px 10px"}}>
                  <Badge bg={st.bg} c={st.c}>{st.l}</Badge>
                </td>
                <td style={{padding:"9px 10px",color:T.muted,fontSize:11}}>{c.dernierEntretien||"—"}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
      <div style={{marginTop:12,background:T.amberLight,borderRadius:8,padding:"10px 14px",fontSize:11,color:T.amber,display:"flex",gap:8,alignItems:"center"}}>
        <b>Loi 16:</b> Le syndicat doit maintenir ce carnet a jour et realiser une etude du fonds de prevoyance tous les 5 ans. Prochaine etude: 2028.
      </div>
      <Modal open={modal==="composante"} onClose={function(){setModal(null);}} title="Ajouter une composante" w={500}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <F l="Composante" s={{gridColumn:"1/-1"}}><input value={form.composante||""} onChange={function(e){sf("composante",e.target.value);}} style={inp}/></F>
          <F l="Date installation"><input type="date" value={form.installation||""} onChange={function(e){sf("installation",e.target.value);}} style={inp}/></F>
          <F l="Duree de vie (ans)"><input type="number" value={form.dureeVie||20} onChange={function(e){sf("dureeVie",parseInt(e.target.value)||20);}} style={inp}/></F>
          <F l="Cout de remplacement ($)"><input type="number" value={form.cout||""} onChange={function(e){sf("cout",parseInt(e.target.value)||0);}} style={inp}/></F>
          <F l="Dernier entretien"><input type="date" value={form.dernierEntretien||""} onChange={function(e){sf("dernierEntretien",e.target.value);}} style={inp}/></F>
          <F l="Notes" s={{gridColumn:"1/-1"}}><input value={form.notes||""} onChange={function(e){sf("notes",e.target.value);}} style={inp}/></F>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){p.setCarnet(function(prev){return prev.concat([Object.assign({},form,{id:Date.now()})]);});setModal(null);}}>Ajouter</Btn>
          <Btn onClick={function(){setModal(null);}} bg={T.surfaceAlt} tc={T.muted} border={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ============ MODULE PRINCIPAL ============
export default function Gestionnaire(){
  var s1=useState("bord"); var onglet=s1[0]; var setOnglet=s1[1];
  var s2=useState(FACTURES_INIT); var factures=s2[0]; var setFactures=s2[1];
  var s3=useState(PRELEVEMENTS_INIT); var prelevements=s3[0]; var setPrelevements=s3[1];
  var s4=useState(REUNIONS_INIT); var reunions=s4[0]; var setReunions=s4[1];
  var s5=useState(CARNET_INIT); var carnet=s5[0]; var setCarnet=s5[1];

  var TABS=[
    {id:"bord",l:"Tableau de bord",icon:"📊"},
    {id:"finances",l:"Finances",icon:"💰"},
    {id:"fournisseurs",l:"Fournisseurs",icon:"🔧"},
    {id:"reunions",l:"Reunions & PV",icon:"📋"},
    {id:"carnet",l:"Carnet entretien",icon:"🏗"},
    {id:"docs",l:"Documents",icon:"📁"},
  ];
  var factEnAttente=factures.filter(function(f){return f.statut==="en_attente";}).length;

  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>{SYNDICAT.nom}</div>
          <div style={{fontSize:12,color:T.muted}}>{SYNDICAT.adresse} | President: {SYNDICAT.president} | {SYNDICAT.nbUnites} unites</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {factEnAttente>0&&<Badge bg={T.amberLight} c={T.amber}>{factEnAttente} facture(s) en attente</Badge>}
          <Badge bg={T.accentLight} c={T.accent}>Exercice: {SYNDICAT.exercice}</Badge>
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
      {onglet==="fournisseurs"&&(
        <div style={{textAlign:"center",padding:60,color:T.muted}}>
          <div style={{fontSize:40,marginBottom:12}}>🔧</div>
          <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:8}}>Module Fournisseurs</div>
          <div style={{fontSize:12}}>Ce module est deja disponible dans l'onglet "Fournisseurs" de l'interface principale.</div>
        </div>
      )}
      {onglet==="docs"&&(
        <div style={{textAlign:"center",padding:60,color:T.muted}}>
          <div style={{fontSize:40,marginBottom:12}}>📁</div>
          <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:8}}>Bibliotheque de documents</div>
          <div style={{fontSize:12}}>Declarations de copropriete, reglements, polices d'assurance, rapports annuels — a venir dans la prochaine version.</div>
        </div>
      )}
    </div>
  );
}
