
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

// Taux 2025 (approximatifs - a mettre a jour annuellement)
var TAUX={
  fedExemption:15705,
  fedTaux1:0.15,fedMax1:55867,
  fedTaux2:0.205,fedMax2:111733,
  fedTaux3:0.26,fedMax3:154906,
  fedTaux4:0.29,fedMax4:220000,
  fedTaux5:0.33,
  qcExemption:17183,
  qcTaux1:0.14,qcMax1:51780,
  qcTaux2:0.19,qcMax2:103545,
  qcTaux3:0.24,qcMax3:126000,
  qcTaux4:0.2575,
  rqTaux:0.0640,rqMax:68500,rqExemption:3500,
  aeTaux:0.01649,aeMax:63200,
  rqap:0.00494,rqapMax:97000,
};

function calculerRetenues(salaireAnnuel, statut){
  var brut=parseFloat(salaireAnnuel)||0;

  // Impot federal
  var taxFedBase=Math.max(0,brut-TAUX.fedExemption);
  var impotFed=0;
  if(taxFedBase>TAUX.fedMax4)impotFed=taxFedBase*TAUX.fedTaux5-(TAUX.fedMax4*TAUX.fedTaux5-TAUX.fedMax4*TAUX.fedTaux4);
  else if(taxFedBase>TAUX.fedMax3)impotFed=taxFedBase*TAUX.fedTaux4-(TAUX.fedMax3*TAUX.fedTaux4-TAUX.fedMax3*TAUX.fedTaux3);
  else if(taxFedBase>TAUX.fedMax2)impotFed=taxFedBase*TAUX.fedTaux3-(TAUX.fedMax2*TAUX.fedTaux3-TAUX.fedMax2*TAUX.fedTaux2);
  else if(taxFedBase>TAUX.fedMax1)impotFed=taxFedBase*TAUX.fedTaux2-(TAUX.fedMax1*TAUX.fedTaux2-TAUX.fedMax1*TAUX.fedTaux1);
  else impotFed=taxFedBase*TAUX.fedTaux1;
  impotFed=Math.max(0,Math.round(impotFed*100)/100);

  // Impot QC
  var taxQcBase=Math.max(0,brut-TAUX.qcExemption);
  var impotQc=0;
  if(taxQcBase>TAUX.qcMax3)impotQc=TAUX.qcMax3*TAUX.qcTaux3+(taxQcBase-TAUX.qcMax3)*TAUX.qcTaux4;
  else if(taxQcBase>TAUX.qcMax2)impotQc=TAUX.qcMax2*TAUX.qcTaux2+(taxQcBase-TAUX.qcMax2)*TAUX.qcTaux3;
  else if(taxQcBase>TAUX.qcMax1)impotQc=TAUX.qcMax1*TAUX.qcTaux1+(taxQcBase-TAUX.qcMax1)*TAUX.qcTaux2;
  else impotQc=taxQcBase*TAUX.qcTaux1;
  impotQc=Math.max(0,Math.round(impotQc*100)/100);

  // RQ
  var rq=Math.round(Math.min(TAUX.rqMax-TAUX.rqExemption,Math.max(0,brut-TAUX.rqExemption))*TAUX.rqTaux*100)/100;

  // AE
  var ae=Math.round(Math.min(TAUX.aeMax,brut)*TAUX.aeTaux*100)/100;

  // RQAP
  var rqap=Math.round(Math.min(TAUX.rqapMax,brut)*TAUX.rqap*100)/100;

  var totalRetenues=impotFed+impotQc+rq+ae+rqap;
  var net=Math.round((brut-totalRetenues)*100)/100;

  return {brut:brut,impotFed:impotFed,impotQc:impotQc,rq:rq,ae:ae,rqap:rqap,total:totalRetenues,net:net};
}

function GenererT4(p){
  var emp=p.employe;var calc=p.calcul;var annee=p.annee;
  var win=window.open("","_blank");
  win.document.write("<!DOCTYPE html><html><head><title>T4 "+annee+"</title><style>body{font-family:Arial,sans-serif;margin:20px;font-size:11px}h2{color:#13233A;margin-bottom:4px}.box{border:1px solid #000;padding:8px;display:inline-block;margin:4px;vertical-align:top;min-width:140px}.box label{font-size:9px;display:block;color:#555}.box b{font-size:13px;display:block}.header{display:flex;gap:20px;margin-bottom:16px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}.title{background:#13233A;color:#fff;padding:6px 12px;font-size:14px;font-weight:bold;margin-bottom:12px}hr{border:1px solid #000}</style></head><body>");
  win.document.write("<div class='title'>FEUILLET T4 - Etat de la remuneration payee "+annee+"</div>");
  win.document.write("<div class='header'><div><b>Employeur:</b> Predictek / Syndicat des coproprietaires<br><b>Annee d imposition:</b> "+annee+"</div><div><b>Employe:</b> "+emp.prenom+" "+emp.nom+"<br><b>NAS:</b> "+("***-***-XXX")+"<br><b>Adresse:</b> "+(emp.adresse||"-")+"</div></div><hr/>");
  win.document.write("<div class='grid'>");
  var boxes=[
    {no:"14",l:"Revenus d emploi",v:calc.brut},
    {no:"22",l:"Impot federal retenu",v:calc.impotFed},
    {no:"16",l:"Cotisations RPC/RRQ",v:calc.rq},
    {no:"18",l:"Cotisations AE",v:calc.ae},
    {no:"52",l:"Cotisations RQAP",v:calc.rqap},
    {no:"20",l:"Cotisation REER",v:0},
  ];
  boxes.forEach(function(b){win.document.write("<div class='box'><label>Case "+b.no+"</label><b>"+Number(b.v).toFixed(2)+" $</b><label>"+b.l+"</label></div>");});
  win.document.write("</div><hr/><p style='font-size:9px;color:#888'>Ce feuillet est fourni a titre informatif. Veuillez verifier les montants avec votre comptable avant de produire les T4 officiels aupres de l ARC.</p>");
  win.document.write("</body></html>");
  win.document.close();win.print();
}

function GenererReleve1(p){
  var emp=p.employe;var calc=p.calcul;var annee=p.annee;
  var win=window.open("","_blank");
  win.document.write("<!DOCTYPE html><html><head><title>Releve 1 "+annee+"</title><style>body{font-family:Arial,sans-serif;margin:20px;font-size:11px}h2{color:#003da5}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}.box{border:1px solid #000;padding:8px}.box label{font-size:9px;display:block;color:#555}.box b{font-size:13px;display:block}.title{background:#003da5;color:#fff;padding:6px 12px;font-size:14px;font-weight:bold;margin-bottom:12px}hr{border:1px solid #003da5}</style></head><body>");
  win.document.write("<div class='title'>RELEVE 1 - Revenus d emploi et revenus divers "+annee+"</div>");
  win.document.write("<p><b>Employeur:</b> Syndicat des coproprietaires | <b>Annee:</b> "+annee+"<br><b>Employe:</b> "+emp.prenom+" "+emp.nom+"</p><hr/>");
  win.document.write("<div class='grid'>");
  var cases=[
    {c:"A",l:"Revenus d emploi",v:calc.brut},
    {c:"E",l:"Cotisations au RRQ",v:calc.rq},
    {c:"B",l:"Cotisations a l assurance-emploi",v:calc.ae},
    {c:"J",l:"Cotisations RQAP (employe)",v:calc.rqap},
    {c:"D",l:"Cotisations a un REER",v:0},
    {c:"G",l:"Salaire admissible au RRQ",v:calc.brut},
    {c:"I",l:"Impot du Quebec retenu",v:calc.impotQc},
  ];
  cases.forEach(function(b){win.document.write("<div class='box'><label>Case "+b.c+"</label><b>"+Number(b.v).toFixed(2)+" $</b><label>"+b.l+"</label></div>");});
  win.document.write("</div><hr/><p style='font-size:9px;color:#888'>Ce releve est fourni a titre informatif. Veuillez verifier avec Revenu Quebec avant soumission.</p>");
  win.document.write("</body></html>");
  win.document.close();win.print();
}

export default function ModuleT4(){
  var s0=useState([]);var employes=s0[0];var setEmployes=s0[1];
  var s1=useState(new Date().getFullYear()-1);var annee=s1[0];var setAnnee=s1[1];
  var s2=useState(null);var selEmp=s2[0];var setSelEmp=s2[1];

  useEffect(function(){
    sb.select("employes",{eq:{actif:true},order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){
        setEmployes(res.data);
        setSelEmp(res.data[0]);
      }
    }).catch(function(){});
  },[]);

  var calcul=selEmp?calculerRetenues(selEmp.salaire,selEmp.federal):null;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>T4 et Releve 1</div>
        <div style={{marginLeft:"auto",fontSize:11,color:"#8da0bb"}}>Calculs 2025 - Valeurs approximatives</div>
      </div>

      <div style={{padding:20,maxWidth:900,margin:"0 auto"}}>
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <div><Lbl l="Annee d imposition"/>
            <select value={annee} onChange={function(e){setAnnee(parseInt(e.target.value));}} style={Object.assign({},INP,{width:120})}>
              {[2023,2024,2025].map(function(a){return <option key={a}>{a}</option>;})}
            </select>
          </div>
          <div style={{flex:1}}><Lbl l="Employe"/>
            <select value={selEmp?selEmp.id:""} onChange={function(e){var em=employes.find(function(x){return x.id===e.target.value;});if(em)setSelEmp(em);}} style={INP}>
              {employes.map(function(e){return <option key={e.id} value={e.id}>{e.nom} {e.prenom} - {Number(e.salaire||0).toFixed(0)} $/an</option>;})}
            </select>
          </div>
        </div>

        {selEmp&&calcul&&(
          <div>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>{selEmp.prenom} {selEmp.nom} - Annee {annee}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
                <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:10,padding:14}}>
                  <div style={{fontSize:11,color:T.muted}}>Salaire brut</div>
                  <div style={{fontSize:22,fontWeight:800,color:T.accent}}>{calcul.brut.toFixed(2)} $</div>
                </div>
                <div style={{background:T.redL,border:"1px solid "+T.red+"44",borderRadius:10,padding:14}}>
                  <div style={{fontSize:11,color:T.muted}}>Total retenues</div>
                  <div style={{fontSize:22,fontWeight:800,color:T.red}}>{calcul.total.toFixed(2)} $</div>
                  <div style={{fontSize:10,color:T.muted}}>{Math.round(calcul.total/calcul.brut*100)}% du brut</div>
                </div>
                <div style={{background:T.navy,borderRadius:10,padding:14}}>
                  <div style={{fontSize:11,color:"#8da0bb"}}>Salaire net</div>
                  <div style={{fontSize:22,fontWeight:800,color:"#fff"}}>{calcul.net.toFixed(2)} $</div>
                </div>
              </div>

              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:T.alt}}>
                    {["Deduction","Case T4","Case R1","Montant annuel","Par periode (26p)"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:T.navy}}>{h}</th>;})}
                  </tr></thead>
                  <tbody>
                    {[
                      {l:"Impot federal",t4:"22",r1:"-",v:calcul.impotFed},
                      {l:"Impot Quebec",t4:"-",r1:"I",v:calcul.impotQc},
                      {l:"RQ (Retraite Quebec)",t4:"16",r1:"E",v:calcul.rq},
                      {l:"Assurance-emploi (AE)",t4:"18",r1:"B",v:calcul.ae},
                      {l:"RQAP",t4:"52",r1:"J",v:calcul.rqap},
                    ].map(function(r,i){return(
                      <tr key={i} style={{borderBottom:"1px solid "+T.border}}>
                        <td style={{padding:"8px 10px",fontWeight:600}}>{r.l}</td>
                        <td style={{padding:"8px 10px",color:T.blue}}>{r.t4}</td>
                        <td style={{padding:"8px 10px",color:T.accent}}>{r.r1}</td>
                        <td style={{padding:"8px 10px",fontWeight:700}}>{r.v.toFixed(2)} $</td>
                        <td style={{padding:"8px 10px",color:T.muted}}>{(r.v/26).toFixed(2)} $</td>
                      </tr>
                    );})}
                    <tr style={{background:T.alt,fontWeight:700}}>
                      <td style={{padding:"8px 10px"}} colSpan={3}>TOTAL RETENUES</td>
                      <td style={{padding:"8px 10px",color:T.red}}>{calcul.total.toFixed(2)} $</td>
                      <td style={{padding:"8px 10px",color:T.red}}>{(calcul.total/26).toFixed(2)} $</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{display:"flex",gap:12,marginTop:16}}>
                <Btn onClick={function(){GenererT4({employe:selEmp,calcul:calcul,annee:annee});}}>Generer T4 PDF</Btn>
                <Btn onClick={function(){GenererReleve1({employe:selEmp,calcul:calcul,annee:annee});}} bg={T.blue}>Generer Releve 1 PDF</Btn>
              </div>
            </div>

            <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:12,padding:16}}>
              <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:8}}>Remises DAS mensuelles</div>
              <div style={{fontSize:12,color:T.navy,marginBottom:4}}>Total a remettre mensuellement a l ARC:</div>
              <div style={{fontSize:20,fontWeight:800,color:T.amber}}>{((calcul.impotFed+calcul.rq+calcul.ae+calcul.rqap)/12).toFixed(2)} $ / mois</div>
              <div style={{fontSize:11,color:T.muted,marginTop:8}}>Comprend: impot federal ({(calcul.impotFed/12).toFixed(2)} $) + RRQ ({(calcul.rq/12).toFixed(2)} $) + AE ({(calcul.ae/12).toFixed(2)} $) + RQAP ({(calcul.rqap/12).toFixed(2)} $)</div>
              <div style={{fontSize:11,color:T.muted,marginTop:4}}>Remises Revenu Quebec (impot QC): {(calcul.impotQc/12).toFixed(2)} $ / mois</div>
            </div>
          </div>
        )}

        {employes.length===0&&(
          <div style={{textAlign:"center",padding:40,color:T.muted,fontSize:12}}>Aucun employe actif. Ajoutez des employes dans le module Comptabilite.</div>
        )}
      </div>
    </div>
  );
}
