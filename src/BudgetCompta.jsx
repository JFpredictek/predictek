// Budget et comptabilite v3.0 - REFONTE COMPLETE
// 1) L exercice financier est CHOISI d apres les dates de l exercice du syndicat (parametres).
// 2) Budget par compte GRAND LIVRE; la charte de comptes (modele riche fourni) se configure
//    PAR SYNDICAT: comptes actifs / inactifs (onglet Charte GL).
// 3) Comptes bancaires relies aux fonds: operation, prevoyance, assurance.
// 4) COTISATIONS PAR UNITE calculees du budget: (cotisations annuelles x quote-part) / 12,
//    appliquees aux unites (lecture seule dans le module Unites).

import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
var money=function(n){return (Number(n)||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

// ===== CHARTE DE COMPTES PAR DEFAUT (modele riche - copropriete quebecoise) =====
// type: revenu | depense | fonds. Les comptes inactifs n apparaissent pas au budget.
var CHARTE_DEFAUT=[
  {no:"4100",nom:"Cotisations regulieres (charges communes)",type:"revenu",groupe:"Revenus"},
  {no:"4150",nom:"Cotisations speciales",type:"revenu",groupe:"Revenus"},
  {no:"4200",nom:"Revenus de location (espaces communs)",type:"revenu",groupe:"Revenus"},
  {no:"4250",nom:"Frais de location court terme",type:"revenu",groupe:"Revenus"},
  {no:"4300",nom:"Interets et placements",type:"revenu",groupe:"Revenus"},
  {no:"4400",nom:"Penalites et interets de retard",type:"revenu",groupe:"Revenus"},
  {no:"4500",nom:"Frais de certificats et documents",type:"revenu",groupe:"Revenus"},
  {no:"4900",nom:"Autres revenus",type:"revenu",groupe:"Revenus"},

  {no:"5100",nom:"Assurance de l immeuble",type:"depense",groupe:"Administration"},
  {no:"5105",nom:"Assurance administrateurs (D et O)",type:"depense",groupe:"Administration"},
  {no:"5110",nom:"Frais de gestion",type:"depense",groupe:"Administration"},
  {no:"5120",nom:"Honoraires comptables",type:"depense",groupe:"Administration"},
  {no:"5125",nom:"Honoraires juridiques",type:"depense",groupe:"Administration"},
  {no:"5130",nom:"Frais bancaires",type:"depense",groupe:"Administration"},
  {no:"5135",nom:"Interets et frais de financement",type:"depense",groupe:"Administration"},
  {no:"5140",nom:"Papeterie, poste et fournitures",type:"depense",groupe:"Administration"},
  {no:"5145",nom:"Logiciels et informatique",type:"depense",groupe:"Administration"},
  {no:"5150",nom:"Taxes, permis et immatriculation",type:"depense",groupe:"Administration"},
  {no:"5155",nom:"Assemblees et reunions",type:"depense",groupe:"Administration"},
  {no:"5160",nom:"Etude aux fins d assurance",type:"depense",groupe:"Administration"},
  {no:"5165",nom:"Etude du fonds de prevoyance",type:"depense",groupe:"Administration"},
  {no:"5190",nom:"Depenses administratives diverses",type:"depense",groupe:"Administration"},

  {no:"5210",nom:"Entretien paysager et pelouse",type:"depense",groupe:"Entretien exterieur"},
  {no:"5220",nom:"Deneigement",type:"depense",groupe:"Entretien exterieur"},
  {no:"5225",nom:"Asphalte et stationnements",type:"depense",groupe:"Entretien exterieur"},
  {no:"5230",nom:"Toitures",type:"depense",groupe:"Entretien exterieur"},
  {no:"5235",nom:"Gouttieres et drainage",type:"depense",groupe:"Entretien exterieur"},
  {no:"5240",nom:"Portes, fenetres et balcons",type:"depense",groupe:"Entretien exterieur"},
  {no:"5245",nom:"Cloture et amenagement",type:"depense",groupe:"Entretien exterieur"},

  {no:"5310",nom:"Entretien du batiment (general)",type:"depense",groupe:"Entretien batiment"},
  {no:"5315",nom:"Conciergerie et nettoyage",type:"depense",groupe:"Entretien batiment"},
  {no:"5320",nom:"Ascenseur",type:"depense",groupe:"Entretien batiment"},
  {no:"5325",nom:"Chauffage, ventilation, climatisation",type:"depense",groupe:"Entretien batiment"},
  {no:"5330",nom:"Plomberie",type:"depense",groupe:"Entretien batiment"},
  {no:"5335",nom:"Electricite (reparations)",type:"depense",groupe:"Entretien batiment"},
  {no:"5340",nom:"Systeme d alarme et gicleurs",type:"depense",groupe:"Entretien batiment"},
  {no:"5345",nom:"Extermination",type:"depense",groupe:"Entretien batiment"},
  {no:"5350",nom:"Piscine et spa",type:"depense",groupe:"Entretien batiment"},
  {no:"5355",nom:"Gym et salles communes",type:"depense",groupe:"Entretien batiment"},
  {no:"5360",nom:"Garage et porte de garage",type:"depense",groupe:"Entretien batiment"},

  {no:"5410",nom:"Electricite (parties communes)",type:"depense",groupe:"Services publics"},
  {no:"5420",nom:"Gaz naturel",type:"depense",groupe:"Services publics"},
  {no:"5430",nom:"Eau et egouts",type:"depense",groupe:"Services publics"},
  {no:"5440",nom:"Telecom, internet et interphone",type:"depense",groupe:"Services publics"},
  {no:"5450",nom:"Collecte des ordures",type:"depense",groupe:"Services publics"},

  {no:"5510",nom:"Salaires des employes",type:"depense",groupe:"Salaires"},
  {no:"5520",nom:"Charges sociales et avantages",type:"depense",groupe:"Salaires"},
  {no:"5530",nom:"Sous-traitants",type:"depense",groupe:"Salaires"},

  {no:"5910",nom:"Creances douteuses",type:"depense",groupe:"Divers"},
  {no:"5990",nom:"Imprevus et contingences",type:"depense",groupe:"Divers"},

  {no:"5810",nom:"Apport au FONDS DE PREVOYANCE",type:"fonds",groupe:"Apports aux fonds"},
  {no:"5820",nom:"Apport au FONDS D AUTO-ASSURANCE",type:"fonds",groupe:"Apports aux fonds"},
];

// ===== Exercices financiers derives de l exercice du syndicat =====
var MOIS_FR={"jan":0,"fev":1,"mar":2,"avr":3,"mai":4,"jun":5,"juin":5,"jul":6,"juil":6,"aou":7,"sep":8,"oct":9,"nov":10,"dec":11};
function parseExercice(txt){
  // ex: "1 nov au 31 oct" -> {moisDebut:10, jourDebut:1}
  var m=String(txt||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").match(/(\d{1,2})\s*([a-z]{3,5})/);
  if(m){
    var cle=m[2].substring(0,4);
    var mois=MOIS_FR[cle]!==undefined?MOIS_FR[cle]:MOIS_FR[m[2].substring(0,3)];
    if(mois!==undefined)return {jour:parseInt(m[1])||1,mois:mois};
  }
  return {jour:1,mois:0}; // defaut: annee civile
}
function pad2(n){return (n<10?"0":"")+n;}
function optionsExercices(exerciceTxt){
  var p=parseExercice(exerciceTxt);
  var now=new Date();
  var opts=[];
  for(var a=now.getFullYear()-1;a<=now.getFullYear()+2;a++){
    var debut=new Date(a,p.mois,p.jour);
    var fin=new Date(a+1,p.mois,p.jour);fin.setDate(fin.getDate()-1);
    // exercice sur l annee civile si debut = 1er janvier
    if(p.mois===0&&p.jour===1){fin=new Date(a,11,31);}
    var d=debut.getFullYear()+"-"+pad2(debut.getMonth()+1)+"-"+pad2(debut.getDate());
    var f=fin.getFullYear()+"-"+pad2(fin.getMonth()+1)+"-"+pad2(fin.getDate());
    opts.push({debut:d,fin:f,label:"Exercice "+debut.getFullYear()+(fin.getFullYear()!==debut.getFullYear()?"-"+fin.getFullYear():"")+" ("+d+" au "+f+")"});
  }
  return opts;
}
function exerciceCourant(opts){
  var auj=new Date().toISOString().substring(0,10);
  var c=opts.find(function(o){return o.debut<=auj&&auj<=o.fin;});
  return c||opts[1]||opts[0];
}

// ===== Onglet CHARTE GL =====
function TabCharte(p){
  var syndicat=p.syndicat;
  var comptes=p.comptes;var recharger=p.recharger;
  var s0=useState("");var msg=s0[0];var setMsg=s0[1];

  function basculer(c){
    var ligne=comptes.find(function(x){return x.no_compte===c.no;});
    if(!ligne)return;
    sb.update("comptes_syndicat",ligne.id,{actif:!ligne.actif}).then(function(r){
      if(r&&r.error){setMsg("Echec: "+(r.error.message||""));return;}
      recharger();
    });
  }

  var groupes=[];
  CHARTE_DEFAUT.forEach(function(c){if(groupes.indexOf(c.groupe)<0)groupes.push(c.groupe);});
  var nbActifs=comptes.filter(function(x){return x.actif;}).length;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:T.navy}}>Charte de comptes grand livre - {syndicat?syndicat.nom:""}</div>
          <div style={{fontSize:11,color:T.muted}}>{nbActifs} compte(s) actif(s) sur {comptes.length}. Le modele de base est fourni: desactivez ce qui ne s applique pas (les comptes inactifs n apparaissent pas au budget).</div>
        </div>
      </div>
      {msg&&<div style={{background:T.redL,borderRadius:8,padding:"8px 12px",fontSize:12,color:T.red,fontWeight:700,marginBottom:10}}>{msg}</div>}
      {groupes.map(function(g){
        var lignes=CHARTE_DEFAUT.filter(function(c){return c.groupe===g;});
        return(
          <div key={g} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>{g}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:6}}>
              {lignes.map(function(c){
                var ligne=comptes.find(function(x){return x.no_compte===c.no;});
                var actif=ligne?ligne.actif:true;
                return(
                  <div key={c.no} onClick={function(){basculer(c);}} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,border:"1px solid "+(actif?T.accent+"55":T.border),background:actif?T.accentL:T.alt,cursor:"pointer",opacity:actif?1:0.55}}>
                    <div style={{width:34,height:20,borderRadius:10,background:actif?T.accent:T.border,position:"relative",flexShrink:0,transition:"background 0.15s"}}>
                      <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:actif?17:3,transition:"left 0.15s"}}/>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:T.navy,flexShrink:0}}>{c.no}</span>
                    <span style={{fontSize:11,color:T.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nom}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== Onglet BUDGET et COTISATIONS =====
function TabBudget(p){
  var syndicat=p.syndicat;var comptes=p.comptes;
  var s0=useState(null);var exo=s0[0];var setExo=s0[1];
  var s1=useState({});var montants=s1[0];var setMontants=s1[1];
  var s2=useState("");var msg=s2[0];var setMsg=s2[1];
  var s3=useState("");var err=s3[0];var setErr=s3[1];
  var s4=useState(false);var enCours=s4[0];var setEnCours=s4[1];
  var s5=useState([]);var unites=s5[0];var setUnites=s5[1];
  var s6=useState(false);var applEnCours=s6[0];var setApplEnCours=s6[1];

  var opts=optionsExercices(syndicat?syndicat.exercice:"");
  useEffect(function(){
    if(!syndicat)return;
    setExo(exerciceCourant(optionsExercices(syndicat.exercice)));
  },[syndicat&&syndicat.id]);

  useEffect(function(){
    if(!syndicat||!exo)return;
    sb.select("budgets_gl",{eq:{syndicat_id:syndicat.id,exercice_debut:exo.debut},limit:200}).then(function(r){
      var m={};
      if(r&&r.data)r.data.forEach(function(x){m[x.no_compte]=String(x.montant);});
      setMontants(m);
    }).catch(function(){});
    sb.select("unites",{eq:{syndicat_id:syndicat.id},order:"no_unite.asc",limit:1000}).then(function(r){
      if(r&&r.data)setUnites(r.data);
    }).catch(function(){});
  },[syndicat&&syndicat.id,exo&&exo.debut]);

  var actifsNos=comptes.filter(function(c){return c.actif;}).map(function(c){return c.no_compte;});
  var lignesBudget=CHARTE_DEFAUT.filter(function(c){return actifsNos.indexOf(c.no)>=0;});

  function setM(no,v){setMontants(function(pr){var n=Object.assign({},pr);n[no]=v;return n;});}

  var totDep=lignesBudget.filter(function(c){return c.type==="depense";}).reduce(function(a,c){return a+(parseFloat(montants[c.no])||0);},0);
  var totFonds=lignesBudget.filter(function(c){return c.type==="fonds";}).reduce(function(a,c){return a+(parseFloat(montants[c.no])||0);},0);
  // Revenus AUTRES que les cotisations (4100/4150) - reduisent les cotisations requises
  var totRevAutres=lignesBudget.filter(function(c){return c.type==="revenu"&&c.no!=="4100"&&c.no!=="4150";}).reduce(function(a,c){return a+(parseFloat(montants[c.no])||0);},0);
  var cotisationsAnnuelles=Math.max(0,totDep+totFonds-totRevAutres);
  var totalFraction=unites.reduce(function(a,u){return a+(parseFloat(u.fraction)||0);},0);

  function sauvegarderBudget(){
    if(!syndicat||!exo||enCours)return;
    setEnCours(true);setMsg("");setErr("");
    var rows=lignesBudget.filter(function(c){return montants[c.no]!==undefined&&montants[c.no]!=="";}).map(function(c){
      return {syndicat_id:syndicat.id,exercice_debut:exo.debut,exercice_fin:exo.fin,no_compte:c.no,nom_compte:c.nom,type_compte:c.type,montant:parseFloat(montants[c.no])||0};
    });
    if(rows.length===0){setErr("Entrez au moins un montant.");setEnCours(false);return;}
    sb.upsert("budgets_gl",rows,"syndicat_id,exercice_debut,no_compte").then(function(r){
      setEnCours(false);
      if(r&&r.error){setErr("ECHEC de la sauvegarde du budget: "+(r.error.message||r.error.hint||"erreur"));return;}
      setMsg("Budget sauvegarde ("+rows.length+" ligne(s)) pour "+exo.label+".");
      sb.log("budget","modification","Budget "+exo.debut+" sauvegarde: "+cotisationsAnnuelles.toFixed(2)+" $ de cotisations annuelles","",syndicat.code||"");
      setTimeout(function(){setMsg("");},5000);
    }).catch(function(e){setEnCours(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  // Applique les cotisations calculees a chaque unite (et aux coproprietaires actifs au prorata)
  function appliquerCotisations(){
    if(!syndicat||applEnCours||unites.length===0)return;
    setApplEnCours(true);setMsg("");setErr("");
    var maj=unites.map(function(u){
      var annuel=cotisationsAnnuelles*(parseFloat(u.fraction)||0)/100;
      var mensuel=Math.round(annuel/12*100)/100;
      return {u:u,mensuel:mensuel};
    });
    Promise.all(maj.map(function(x){return sb.update("unites",x.u.id,{cotisation_mensuelle:x.mensuel});}))
    .then(function(){
      return sb.select("coproprietaires",{eq:{syndicat_id:syndicat.id},limit:2000});
    }).then(function(rc){
      var copros=(rc&&rc.data)||[];
      var actifs=copros.filter(function(c){return c.statut!=="ancien";});
      return Promise.all(actifs.map(function(c){
        var x=maj.find(function(m){return (c.unite_id&&c.unite_id===m.u.id)||(!c.unite_id&&c.unite===m.u.no_unite);});
        if(!x)return Promise.resolve();
        var part=(parseFloat(c.part_pourcent)||100)/100;
        return sb.update("coproprietaires",c.id,{cotisation_mensuelle:Math.round(x.mensuel*part*100)/100});
      }));
    }).then(function(){
      setApplEnCours(false);
      setMsg("Cotisations appliquees a "+unites.length+" unite(s): total "+money(cotisationsAnnuelles/12)+" par mois. Elles s affichent en lecture seule dans le module Unites.");
      sb.log("budget","modification","Cotisations recalculees du budget "+(exo?exo.debut:"")+" et appliquees aux unites","",syndicat.code||"");
    }).catch(function(e){setApplEnCours(false);setErr("Erreur lors de l application: "+(e&&e.message?e.message:""));});
  }

  if(!syndicat)return null;
  var groupes=[];
  lignesBudget.forEach(function(c){if(groupes.indexOf(c.groupe)<0)groupes.push(c.groupe);});

  return(
    <div>
      <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap",marginBottom:14}}>
        <div style={{minWidth:340}}>
          <Lbl l={"Exercice financier (selon les parametres du syndicat: "+(syndicat.exercice||"annee civile")+")"}/>
          <select value={exo?exo.debut:""} onChange={function(e){var o=opts.find(function(x){return x.debut===e.target.value;});if(o)setExo(o);}} style={INP}>
            {opts.map(function(o){return <option key={o.debut} value={o.debut}>{o.label}</option>;})}
          </select>
        </div>
        <Btn onClick={sauvegarderBudget} dis={enCours}>{enCours?"Sauvegarde...":"Sauvegarder le budget"}</Btn>
      </div>
      {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
      {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <div style={{background:T.redL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Depenses budgetees</div><div style={{fontSize:18,fontWeight:800,color:T.red}}>{money(totDep)}</div></div>
        <div style={{background:T.purpleL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Apports aux fonds</div><div style={{fontSize:18,fontWeight:800,color:T.purple}}>{money(totFonds)}</div></div>
        <div style={{background:T.blueL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Autres revenus (-)</div><div style={{fontSize:18,fontWeight:800,color:T.blue}}>{money(totRevAutres)}</div></div>
        <div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.accent,fontWeight:700}}>COTISATIONS ANNUELLES</div><div style={{fontSize:18,fontWeight:800,color:T.accent}}>{money(cotisationsAnnuelles)}</div><div style={{fontSize:10,color:T.muted}}>{money(cotisationsAnnuelles/12)} /mois</div></div>
      </div>

      {lignesBudget.length===0&&<div style={{background:T.amberL,borderRadius:10,padding:14,fontSize:12,color:T.amber,fontWeight:600,marginBottom:12}}>Aucun compte actif - activez des comptes dans l onglet Charte GL.</div>}

      {groupes.map(function(g){
        var lignes=lignesBudget.filter(function(c){return c.groupe===g;});
        var sousTotal=lignes.reduce(function(a,c){return a+(parseFloat(montants[c.no])||0);},0);
        return(
          <div key={g} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em"}}>{g}</div>
              <div style={{fontSize:11,fontWeight:800,color:T.navy}}>{money(sousTotal)}</div>
            </div>
            {lignes.map(function(c){return(
              <div key={c.no} style={{display:"flex",alignItems:"center",gap:10,padding:"4px 0"}}>
                <span style={{fontSize:11,fontWeight:700,color:T.muted,width:44,flexShrink:0}}>{c.no}</span>
                <span style={{fontSize:12,color:T.text,flex:1}}>{c.nom}{c.no==="4100"||c.no==="4150"?<span style={{fontSize:9,color:T.muted}}> (calcule - n entre pas dans le total)</span>:null}</span>
                <input type="number" step="0.01" value={montants[c.no]||""} onChange={function(e){setM(c.no,e.target.value);}} style={Object.assign({},INP,{width:130,textAlign:"right"})} placeholder="0.00" disabled={c.no==="4100"||c.no==="4150"}/>
              </div>
            );})}
          </div>
        );
      })}

      <div style={{background:T.surface,border:"2px solid "+T.accent+"66",borderRadius:12,padding:16,marginTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.navy}}>Cotisations par unite (budget x quote-part / 12)</div>
            <div style={{fontSize:11,color:T.muted}}>{unites.length} unite(s) - fractions totales: {totalFraction.toFixed(3)} %</div>
          </div>
          <Btn onClick={appliquerCotisations} dis={applEnCours||unites.length===0||cotisationsAnnuelles<=0}>{applEnCours?"Application en cours...":"Appliquer aux unites"}</Btn>
        </div>
        {unites.length===0?(
          <div style={{fontSize:12,color:T.muted,padding:10}}>Aucune unite pour ce syndicat.</div>
        ):(
          <div style={{maxHeight:300,overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.alt,position:"sticky",top:0}}>
                {["Unite","Quote-part","Cotisation annuelle","Cotisation mensuelle","Actuelle"].map(function(h){return <th key={h} style={{padding:"6px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}
              </tr></thead>
              <tbody>
                {unites.map(function(u){
                  var annuel=cotisationsAnnuelles*(parseFloat(u.fraction)||0)/100;
                  return(
                    <tr key={u.id} style={{borderTop:"1px solid "+T.border}}>
                      <td style={{padding:"5px 10px",fontWeight:700}}>{u.no_unite}</td>
                      <td style={{padding:"5px 10px"}}>{(parseFloat(u.fraction)||0).toFixed(3)} %</td>
                      <td style={{padding:"5px 10px",textAlign:"right"}}>{money(annuel)}</td>
                      <td style={{padding:"5px 10px",textAlign:"right",fontWeight:700,color:T.accent}}>{money(annuel/12)}</td>
                      <td style={{padding:"5px 10px",textAlign:"right",color:T.muted}}>{u.cotisation_mensuelle?money(u.cotisation_mensuelle):"-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Onglet COMPTES BANCAIRES (relies aux fonds) =====
var FONDS=[
  {id:"operation",l:"Fonds d OPERATION",desc:"Compte courant - depenses et cotisations regulieres",c:"#1A56DB",bg:"#EFF6FF"},
  {id:"prevoyance",l:"Fonds de PREVOYANCE",desc:"Reserve Loi 16 - reparations majeures et remplacements",c:"#6B3FA0",bg:"#F3EEFF"},
  {id:"assurance",l:"Fonds d AUTO-ASSURANCE",desc:"Franchise d assurance (minimum legal)",c:"#B86020",bg:"#FEF3E2"},
];
function TabBanques(p){
  var syndicat=p.syndicat;
  var s0=useState({});var formes=s0[0];var setFormes=s0[1];
  var s1=useState("");var msg=s1[0];var setMsg=s1[1];
  var s2=useState("");var err=s2[0];var setErr=s2[1];
  var s3=useState("");var enCours=s3[0];var setEnCours=s3[1];

  useEffect(function(){
    if(!syndicat)return;
    sb.select("comptes_bancaires",{eq:{syndicat_id:syndicat.id},limit:10}).then(function(r){
      var f={};
      if(r&&r.data)r.data.forEach(function(x){f[x.fonds]=x;});
      setFormes(f);
    }).catch(function(){});
  },[syndicat&&syndicat.id]);

  function ch(fonds,k,v){
    setFormes(function(pr){
      var n=Object.assign({},pr);
      n[fonds]=Object.assign({},n[fonds]||{fonds:fonds},{});
      n[fonds]=Object.assign({},pr[fonds]||{fonds:fonds});
      n[fonds][k]=v;
      return n;
    });
  }

  function sauver(fonds){
    if(!syndicat)return;
    var f=formes[fonds]||{};
    setEnCours(fonds);setMsg("");setErr("");
    var row={syndicat_id:syndicat.id,fonds:fonds,banque:f.banque||"",institution:(f.institution||"").replace(/\D/g,"").slice(0,3),transit:(f.transit||"").replace(/\D/g,"").slice(0,5),no_compte:(f.no_compte||"").replace(/\D/g,"").slice(0,12),solde_ouverture:parseFloat(f.solde_ouverture)||0,date_solde:f.date_solde||null};
    sb.upsert("comptes_bancaires",[row],"syndicat_id,fonds").then(function(r){
      setEnCours("");
      if(r&&r.error){setErr("ECHEC: "+(r.error.message||r.error.hint||"erreur"));return;}
      setMsg("Compte bancaire du "+fonds+" sauvegarde.");
      sb.log("budget","modification","Compte bancaire "+fonds+" configure","",syndicat.code||"");
      setTimeout(function(){setMsg("");},4000);
    }).catch(function(e){setEnCours("");setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  return(
    <div>
      <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>Comptes bancaires relies aux fonds</div>
      <div style={{fontSize:11,color:T.muted,marginBottom:14}}>La loi exige des comptes distincts pour le fonds de prevoyance et le fonds d auto-assurance. Chaque fonds est relie a son compte.</div>
      {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
      {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14}}>
        {FONDS.map(function(fd){
          var f=formes[fd.id]||{};
          return(
            <div key={fd.id} style={{background:fd.bg,border:"2px solid "+fd.c+"44",borderRadius:12,padding:16}}>
              <div style={{fontSize:12,fontWeight:800,color:fd.c,marginBottom:2}}>{fd.l}</div>
              <div style={{fontSize:10,color:T.muted,marginBottom:12}}>{fd.desc}</div>
              <div style={{display:"grid",gap:8}}>
                <div><Lbl l="Banque / caisse"/><input value={f.banque||""} onChange={function(e){ch(fd.id,"banque",e.target.value);}} style={INP} placeholder="Desjardins, BNC..."/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><Lbl l="Institution (3)"/><input value={f.institution||""} onChange={function(e){ch(fd.id,"institution",e.target.value.replace(/\D/g,"").slice(0,3));}} style={INP} placeholder="815"/></div>
                  <div><Lbl l="Transit (5)"/><input value={f.transit||""} onChange={function(e){ch(fd.id,"transit",e.target.value.replace(/\D/g,"").slice(0,5));}} style={INP} placeholder="30040"/></div>
                </div>
                <div><Lbl l="No de compte"/><input value={f.no_compte||""} onChange={function(e){ch(fd.id,"no_compte",e.target.value.replace(/\D/g,"").slice(0,12));}} style={INP}/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><Lbl l="Solde d ouverture ($)"/><input type="number" step="0.01" value={f.solde_ouverture||""} onChange={function(e){ch(fd.id,"solde_ouverture",e.target.value);}} style={INP} placeholder="0.00"/></div>
                  <div><Lbl l="En date du"/><input type="date" value={f.date_solde||""} onChange={function(e){ch(fd.id,"date_solde",e.target.value);}} style={INP}/></div>
                </div>
                <Btn bg={fd.c} dis={enCours===fd.id} onClick={function(){sauver(fd.id);}}>{enCours===fd.id?"Sauvegarde...":"Sauvegarder ce compte"}</Btn>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Onglet JOURNAL (transactions reelles) =====
var CATEGORIES_DEPENSES=["Administration","Assurances","Entretien","Deneigement","Paysagement","Energie","Reparations","Salaires","Autre depense"];
var CATEGORIES_REVENUS=["Cotisations","Cotisations speciales","Location","Interets","Autre revenu"];
function TabJournal(p){
  var syndicat=p.syndicat;
  var s0=useState([]);var journal=s0[0];var setJournal=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({date_transaction:new Date().toISOString().substring(0,10),description:"",categorie:"Administration",montant_debit:0,montant_credit:0,reference:""});var nf=s2[0];var setNf=s2[1];
  var s3=useState("");var err=s3[0];var setErr=s3[1];

  useEffect(function(){
    if(!syndicat)return;
    sb.select("journal",{eq:{syndicat_id:syndicat.id},order:"date_transaction.desc",limit:100}).then(function(res){
      if(res&&res.data)setJournal(res.data);
    }).catch(function(){});
  },[syndicat&&syndicat.id]);

  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function ajouter(){
    if(!nf.description||!syndicat)return;
    setErr("");
    var row={syndicat_id:syndicat.id,date_transaction:nf.date_transaction,description:nf.description,categorie:nf.categorie,montant_debit:parseFloat(nf.montant_debit)||0,montant_credit:parseFloat(nf.montant_credit)||0,reference:nf.reference};
    sb.insert("journal",row).then(function(res){
      if(res&&res.error){setErr("ECHEC: "+(res.error.message||"erreur"));return;}
      if(res&&res.data)setJournal(function(prev){return [res.data].concat(prev);});
      setShowN(false);setNf({date_transaction:new Date().toISOString().substring(0,10),description:"",categorie:"Administration",montant_debit:0,montant_credit:0,reference:""});
    }).catch(function(e){setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  var totalDebit=journal.reduce(function(a,j){return a+Number(j.montant_debit||0);},0);
  var totalCredit=journal.reduce(function(a,j){return a+Number(j.montant_credit||0);},0);

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:T.navy}}>Journal des transactions</div>
          <div style={{fontSize:11,color:T.muted}}>{journal.length} transactions</div>
        </div>
        <Btn onClick={function(){setShowN(true);}}>+ Ajouter</Btn>
      </div>
      {err&&<div style={{background:T.redL,borderRadius:8,padding:"8px 12px",fontSize:12,color:T.red,fontWeight:700,marginBottom:10}}>{err}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={{background:T.redL,border:"1px solid "+T.red+"44",borderRadius:10,padding:14}}><div style={{fontSize:11,color:T.muted}}>Total debits</div><div style={{fontSize:20,fontWeight:800,color:T.red}}>{totalDebit.toFixed(2)} $</div></div>
        <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:10,padding:14}}><div style={{fontSize:11,color:T.muted}}>Total credits</div><div style={{fontSize:20,fontWeight:800,color:T.accent}}>{totalCredit.toFixed(2)} $</div></div>
      </div>
      {showN&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20,marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div><Lbl l="Date"/><input type="date" value={nf.date_transaction} onChange={function(e){setN("date_transaction",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Categorie"/><select value={nf.categorie} onChange={function(e){setN("categorie",e.target.value);}} style={INP}>
              <optgroup label="Depenses (debit)">{CATEGORIES_DEPENSES.map(function(c){return <option key={c}>{c}</option>;})}</optgroup>
              <optgroup label="Revenus (credit)">{CATEGORIES_REVENUS.map(function(c){return <option key={c}>{c}</option>;})}</optgroup>
            </select></div>
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

// ===== MODULE PRINCIPAL =====
export default function BudgetCompta(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState("budget");var ong=s2[0];var setOng=s2[1];
  var s3=useState([]);var comptes=s3[0];var setComptes=s3[1];
  var s4=useState("");var errInit=s4[0];var setErrInit=s4[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  // Charge la charte du syndicat; si vide, SEME le modele de base (tous actifs)
  function chargerComptes(){
    if(!sel)return;
    sb.select("comptes_syndicat",{eq:{syndicat_id:sel.id},limit:200}).then(function(r){
      var rows=(r&&r.data)||[];
      if(rows.length===0){
        var seed=CHARTE_DEFAUT.map(function(c){return {syndicat_id:sel.id,no_compte:c.no,nom_compte:c.nom,type_compte:c.type,groupe:c.groupe,actif:true};});
        sb.upsert("comptes_syndicat",seed,"syndicat_id,no_compte").then(function(r2){
          if(r2&&r2.error){setErrInit("Impossible d initialiser la charte de comptes: "+(r2.error.message||""));return;}
          setComptes(r2&&r2.data?r2.data:seed);
        }).catch(function(e){setErrInit("Erreur d initialisation: "+(e&&e.message?e.message:""));});
      }else{
        setComptes(rows);
      }
    }).catch(function(){});
  }
  useEffect(function(){chargerComptes();},[sel&&sel.id]);

  var TABS=[{id:"budget",l:"Budget et cotisations"},{id:"charte",l:"Charte GL"},{id:"banques",l:"Comptes bancaires"},{id:"journal",l:"Journal"}];

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat - creez d abord un syndicat via Configuration.</div>;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Budget et comptabilite</div>
        <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{display:"flex",marginLeft:"auto"}}>
          {TABS.map(function(t){var a=ong===t.id;return <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"3px solid #3CAF6E":"3px solid transparent",padding:"8px 16px",color:a?"#fff":"#9fb0c6",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:500}}>{t.l}</button>;})}
        </div>
      </div>
      <div style={{padding:20}}>
        {errInit&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{errInit}</div>}
        {ong==="budget"&&<TabBudget syndicat={sel} comptes={comptes}/>}
        {ong==="charte"&&<TabCharte syndicat={sel} comptes={comptes} recharger={chargerComptes}/>}
        {ong==="banques"&&<TabBanques syndicat={sel}/>}
        {ong==="journal"&&<TabJournal syndicat={sel}/>}
      </div>
    </div>
  );
}
