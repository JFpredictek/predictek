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
  // ---- ACTIFS ----
  {no:"1100",nom:"Encaisse - compte d operation",type:"actif",groupe:"Actifs - Encaisse"},
  {no:"1110",nom:"Petite caisse",type:"actif",groupe:"Actifs - Encaisse"},
  {no:"1112",nom:"Encaisse - fonds de prevoyance",type:"actif",groupe:"Actifs - Encaisse"},
  {no:"1114",nom:"Encaisse - fonds d auto-assurance",type:"actif",groupe:"Actifs - Encaisse"},
  {no:"1115",nom:"Encaisse - fonds travaux speciaux",type:"actif",groupe:"Actifs - Encaisse"},
  {no:"1117",nom:"Parts sociales (caisse)",type:"actif",groupe:"Actifs - Encaisse"},
  {no:"1200",nom:"Comptes a recevoir",type:"actif",groupe:"Actifs - A recevoir"},
  {no:"1210",nom:"Contributions a recevoir",type:"actif",groupe:"Actifs - A recevoir"},
  {no:"1220",nom:"Autres comptes a recevoir des coproprietaires",type:"actif",groupe:"Actifs - A recevoir"},
  {no:"1300",nom:"Frais payes d avance",type:"actif",groupe:"Actifs - Payes d avance"},
  {no:"1310",nom:"Assurances payees d avance",type:"actif",groupe:"Actifs - Payes d avance"},
  {no:"1320",nom:"Taxes municipales et scolaires",type:"actif",groupe:"Actifs - Payes d avance"},
  {no:"1330",nom:"Contrats d entretien payes d avance",type:"actif",groupe:"Actifs - Payes d avance"},
  {no:"1340",nom:"Paiements prepayes aux fournisseurs",type:"actif",groupe:"Actifs - Payes d avance"},
  {no:"1400",nom:"Inventaire",type:"actif",groupe:"Actifs - Inventaire"},
  {no:"1430",nom:"Cles, puces et telecommandes",type:"actif",groupe:"Actifs - Inventaire"},
  {no:"1500",nom:"Placements",type:"actif",groupe:"Actifs - Placements"},
  {no:"1510",nom:"Placements - fonds d exploitation",type:"actif",groupe:"Actifs - Placements"},
  {no:"1530",nom:"Placements - fonds de prevoyance",type:"actif",groupe:"Actifs - Placements"},
  {no:"1550",nom:"Placements - fonds d assurances",type:"actif",groupe:"Actifs - Placements"},
  {no:"1600",nom:"Immobilisations",type:"actif",groupe:"Actifs - Immobilisations"},
  {no:"1630",nom:"Equipements et mobilier",type:"actif",groupe:"Actifs - Immobilisations"},
  // ---- PASSIFS ----
  {no:"2100",nom:"Financement a court terme",type:"passif",groupe:"Passifs - Financement court terme"},
  {no:"2110",nom:"Marge de credit",type:"passif",groupe:"Passifs - Financement court terme"},
  {no:"2120",nom:"Emprunt bancaire",type:"passif",groupe:"Passifs - Financement court terme"},
  {no:"2130",nom:"Carte de credit",type:"passif",groupe:"Passifs - Financement court terme"},
  {no:"2140",nom:"Portion court terme de l emprunt long terme",type:"passif",groupe:"Passifs - Financement court terme"},
  {no:"2200",nom:"Comptes a payer",type:"passif",groupe:"Passifs - Comptes a payer"},
  {no:"2210",nom:"Comptes fournisseurs",type:"passif",groupe:"Passifs - Comptes a payer"},
  {no:"2220",nom:"Autres comptes a payer",type:"passif",groupe:"Passifs - Comptes a payer"},
  {no:"2290",nom:"Frais courus",type:"passif",groupe:"Passifs - Comptes a payer"},
  {no:"2300",nom:"Salaires et charges sociales a payer",type:"passif",groupe:"Passifs - Salaires a payer"},
  {no:"2310",nom:"Salaires a payer",type:"passif",groupe:"Passifs - Salaires a payer"},
  {no:"2320",nom:"Vacances a payer",type:"passif",groupe:"Passifs - Salaires a payer"},
  {no:"2330",nom:"Deductions a la source a remettre",type:"passif",groupe:"Passifs - Salaires a payer"},
  {no:"2400",nom:"Sommes dues aux coproprietaires",type:"passif",groupe:"Passifs - Dus aux coproprietaires"},
  {no:"2410",nom:"Contributions percues d avance",type:"passif",groupe:"Passifs - Dus aux coproprietaires"},
  {no:"2420",nom:"Depots",type:"passif",groupe:"Passifs - Dus aux coproprietaires"},
  {no:"2500",nom:"Financement a long terme",type:"passif",groupe:"Passifs - Financement long terme"},
  {no:"2510",nom:"Hypotheques",type:"passif",groupe:"Passifs - Financement long terme"},
  {no:"2530",nom:"Autres emprunts bancaires",type:"passif",groupe:"Passifs - Financement long terme"},
  {no:"2601",nom:"TPS a remettre",type:"passif",groupe:"Passifs - Taxes de vente"},
  {no:"2602",nom:"TVQ a remettre",type:"passif",groupe:"Passifs - Taxes de vente"},
  // ---- CAPITAUX ----
  {no:"3100",nom:"Surplus du fonds d exploitation",type:"capitaux",groupe:"Capitaux - Surplus des fonds"},
  {no:"3110",nom:"Reserve pour franchise d assurance",type:"capitaux",groupe:"Capitaux - Surplus des fonds"},
  {no:"3200",nom:"Surplus du fonds de prevoyance",type:"capitaux",groupe:"Capitaux - Surplus des fonds"},
  {no:"3400",nom:"Surplus du fonds de projets speciaux",type:"capitaux",groupe:"Capitaux - Surplus des fonds"},
  {no:"3500",nom:"Surplus du fonds d assurances",type:"capitaux",groupe:"Capitaux - Surplus des fonds"},
  // ---- REVENUS ----
  {no:"4100",nom:"Contributions",type:"revenu",groupe:"Revenus - Contributions"},
  {no:"4110",nom:"Contributions regulieres",type:"revenu",groupe:"Revenus - Contributions"},
  {no:"4120",nom:"Contributions au fonds de prevoyance",type:"revenu",groupe:"Revenus - Contributions"},
  {no:"4130",nom:"Contributions speciales",type:"revenu",groupe:"Revenus - Contributions"},
  {no:"4160",nom:"Contribution au fonds d assurances",type:"revenu",groupe:"Revenus - Contributions"},
  {no:"4190",nom:"Contributions du promoteur",type:"revenu",groupe:"Revenus - Contributions"},
  {no:"4300",nom:"Revenus de location",type:"revenu",groupe:"Revenus - Location"},
  {no:"4310",nom:"Salle commune",type:"revenu",groupe:"Revenus - Location"},
  {no:"4340",nom:"Stationnements",type:"revenu",groupe:"Revenus - Location"},
  {no:"4350",nom:"Casiers et celliers",type:"revenu",groupe:"Revenus - Location"},
  {no:"4400",nom:"Vente de produits",type:"revenu",groupe:"Revenus - Vente de produits"},
  {no:"4410",nom:"Cles et cartes d acces",type:"revenu",groupe:"Revenus - Vente de produits"},
  {no:"4420",nom:"Telecommandes",type:"revenu",groupe:"Revenus - Vente de produits"},
  {no:"4500",nom:"Revenus d interets",type:"revenu",groupe:"Revenus - Interets"},
  {no:"4510",nom:"Interets - fonds d exploitation",type:"revenu",groupe:"Revenus - Interets"},
  {no:"4520",nom:"Interets - fonds de prevoyance",type:"revenu",groupe:"Revenus - Interets"},
  {no:"4550",nom:"Interets - fonds d assurances",type:"revenu",groupe:"Revenus - Interets"},
  {no:"4590",nom:"Interets - paiements retardataires",type:"revenu",groupe:"Revenus - Interets"},
  {no:"4600",nom:"Frais aux coproprietaires",type:"revenu",groupe:"Revenus - Frais aux coproprietaires"},
  {no:"4620",nom:"Infractions et penalites",type:"revenu",groupe:"Revenus - Frais aux coproprietaires"},
  {no:"4630",nom:"Insuffisance de fonds",type:"revenu",groupe:"Revenus - Frais aux coproprietaires"},
  {no:"4640",nom:"Frais de retard",type:"revenu",groupe:"Revenus - Frais aux coproprietaires"},
  {no:"4650",nom:"Refacturation aux coproprietaires",type:"revenu",groupe:"Revenus - Frais aux coproprietaires"},
  {no:"4660",nom:"Indemnites d assurances",type:"revenu",groupe:"Revenus - Frais aux coproprietaires"},
  {no:"4800",nom:"Subvention energetique",type:"revenu",groupe:"Revenus - Autres"},
  {no:"4900",nom:"Autres revenus",type:"revenu",groupe:"Revenus - Autres"},
  // ---- DEPENSES ----
  {no:"5100",nom:"Mazout",type:"depense",groupe:"Depenses - Energie"},
  {no:"5110",nom:"Electricite",type:"depense",groupe:"Depenses - Energie"},
  {no:"5120",nom:"Gaz naturel",type:"depense",groupe:"Depenses - Energie"},
  {no:"5200",nom:"Entretien et reparation",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5210",nom:"Ascenseurs",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5215",nom:"Ramonage et entretien de cheminee",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5225",nom:"Plomberie",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5235",nom:"Entretien electrique",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5240",nom:"Nettoyage des espaces communs",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5245",nom:"Portes et serrures",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5260",nom:"Autres entretiens",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5290",nom:"Sinistres assumes par le syndicat",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5300",nom:"Conciergerie",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5315",nom:"Paysagement",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5320",nom:"Deneigement",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5325",nom:"Reparation asphalte et stationnement",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5330",nom:"Traitements parasitaires (extermination)",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5335",nom:"Cueillette des ordures",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5340",nom:"Securite",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5350",nom:"Protection incendie et gicleurs",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5395",nom:"Piscine, spa et sauna",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5410",nom:"Gym et installations",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5422",nom:"Imprevus",type:"depense",groupe:"Depenses - Entretien et operations"},
  {no:"5500",nom:"Honoraires gestionnaires",type:"depense",groupe:"Depenses - Administration"},
  {no:"5510",nom:"Honoraires professionnels",type:"depense",groupe:"Depenses - Administration"},
  {no:"5520",nom:"Honoraires conseiller juridique",type:"depense",groupe:"Depenses - Administration"},
  {no:"5525",nom:"Frais bancaires",type:"depense",groupe:"Depenses - Administration"},
  {no:"5535",nom:"Assurances",type:"depense",groupe:"Depenses - Administration"},
  {no:"5540",nom:"Frais de bureau et informatique",type:"depense",groupe:"Depenses - Administration"},
  {no:"5545",nom:"Remuneration des administrateurs",type:"depense",groupe:"Depenses - Administration"},
  {no:"5550",nom:"Frais d assemblee",type:"depense",groupe:"Depenses - Administration"},
  {no:"5555",nom:"Etude aux fins d assurance",type:"depense",groupe:"Depenses - Administration"},
  {no:"5556",nom:"Etude du fonds de prevoyance",type:"depense",groupe:"Depenses - Administration"},
  {no:"5560",nom:"Autres frais administratifs",type:"depense",groupe:"Depenses - Administration"},
  {no:"5700",nom:"Interets",type:"depense",groupe:"Depenses - Interets"},
  {no:"5715",nom:"Interets - marge de credit",type:"depense",groupe:"Depenses - Interets"},
  {no:"5720",nom:"Interets - autres emprunts",type:"depense",groupe:"Depenses - Interets"},
  {no:"5800",nom:"Charges faisant l objet de refacturation",type:"depense",groupe:"Depenses - Refacturation"},
  {no:"5805",nom:"Sinistres assumes par les coproprietaires",type:"depense",groupe:"Depenses - Refacturation"},
  // ---- TRANSFERTS INTERFONDS (entrent dans le calcul des cotisations) ----
  {no:"5901",nom:"Transfert interfonds - FONDS DE PREVOYANCE",type:"fonds",groupe:"Transferts interfonds"},
  {no:"5902",nom:"Transfert interfonds - FONDS D AUTO-ASSURANCE",type:"fonds",groupe:"Transferts interfonds"},
  {no:"5903",nom:"Transfert interfonds - fonds de travaux speciaux",type:"fonds",groupe:"Transferts interfonds"},
  // ---- DEPENSES DU FONDS DE PREVOYANCE (hors budget des cotisations) ----
  {no:"7000",nom:"Fonds de prevoyance - general",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7060",nom:"Balcons et terrasses",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7070",nom:"Revetements exterieurs",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7080",nom:"Toitures",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7090",nom:"Portes et fenetres",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7100",nom:"Cheminees",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7110",nom:"Escaliers communs",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7200",nom:"Chaussees et aires de stationnement",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7220",nom:"Amenagement des terrains",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7270",nom:"Plomberie (prevoyance)",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7280",nom:"CVCA (chauffage, ventilation, clim)",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7300",nom:"Electricite (prevoyance)",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  {no:"7340",nom:"Equipements (prevoyance)",type:"prevoyance",groupe:"Fonds de prevoyance (depenses)"},
  // ---- FONDS D ASSURANCE ----
  {no:"8200",nom:"Fonds d assurance",type:"autre",groupe:"Fonds d assurance"},
  {no:"8201",nom:"Franchise d assurance",type:"autre",groupe:"Fonds d assurance"},
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

// ===== Onglet CHARTE GL (pilote par la base - comptes par defaut + comptes ajoutes manuellement) =====
function TabCharte(p){
  var syndicat=p.syndicat;
  var comptes=p.comptes;var recharger=p.recharger;
  var s0=useState("");var msg=s0[0];var setMsg=s0[1];
  var s1=useState(null);var ajoutGroupe=s1[0];var setAjoutGroupe=s1[1];
  var s2=useState({no:"",nom:"",type:"depense"});var nfc=s2[0];var setNfc=s2[1];
  var s3=useState(false);var actifsSeuls=s3[0];var setActifsSeuls=s3[1];

  function basculer(ligne){
    sb.update("comptes_syndicat",ligne.id,{actif:!ligne.actif}).then(function(r){
      if(r&&r.error){setMsg("Echec: "+(r.error.message||""));return;}
      recharger();
    });
  }

  function changerFonds(ligne,f){
    sb.update("comptes_syndicat",ligne.id,{fonds:f}).then(function(r){
      if(r&&r.error){setMsg("Echec: "+(r.error.message||"la colonne fonds existe-t-elle? (SQL fourni)"));return;}
      sb.log("budget","modification","Compte "+ligne.no_compte+" rattache au fonds "+f,"",syndicat.code||"");
      recharger();
    });
  }
  var fondsDispo=["operation","prevoyance","assurance"];
  comptes.forEach(function(c){if(c.fonds&&fondsDispo.indexOf(c.fonds)<0)fondsDispo.push(c.fonds);});

  function ajouterCompte(groupe){
    if(!nfc.no||!nfc.nom){setMsg("Numero et nom requis.");return;}
    if(comptes.some(function(x){return x.no_compte===nfc.no;})){setMsg("Le compte "+nfc.no+" existe deja.");return;}
    sb.insert("comptes_syndicat",{syndicat_id:syndicat.id,no_compte:nfc.no,nom_compte:nfc.nom,type_compte:nfc.type,groupe:groupe,actif:true}).then(function(r){
      if(!r||!r.data||!r.data.id){setMsg("ECHEC de l ajout: "+((r&&r.error&&r.error.message)||"erreur"));return;}
      setMsg("Compte "+nfc.no+" - "+nfc.nom+" ajoute.");
      sb.log("budget","creation","Compte GL ajoute: "+nfc.no+" "+nfc.nom,"",syndicat.code||"");
      setNfc({no:"",nom:"",type:"depense"});setAjoutGroupe(null);
      recharger();
      setTimeout(function(){setMsg("");},4000);
    });
  }

  // Groupes: ceux du modele + ceux des comptes en base (customs)
  var groupes=[];
  CHARTE_DEFAUT.forEach(function(c){if(groupes.indexOf(c.groupe)<0)groupes.push(c.groupe);});
  comptes.forEach(function(c){if(c.groupe&&groupes.indexOf(c.groupe)<0)groupes.push(c.groupe);});
  var nbActifs=comptes.filter(function(x){return x.actif;}).length;
  var TYPES_LBL={actif:"Actif",passif:"Passif",capitaux:"Capitaux",revenu:"Revenu",depense:"Depense",fonds:"Transfert interfonds",prevoyance:"Depense du fonds de prevoyance",autre:"Autre"};

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:T.navy}}>Plan comptable - {syndicat?syndicat.nom:""}</div>
          <div style={{fontSize:11,color:T.muted}}>{nbActifs} compte(s) actif(s) sur {comptes.length}. Modele de base fourni + vos comptes ajoutes. Les comptes barres (inactifs) n apparaissent pas au budget.</div>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.navy,cursor:"pointer"}}>
          <input type="checkbox" checked={actifsSeuls} onChange={function(e){setActifsSeuls(e.target.checked);}}/>
          Afficher uniquement les comptes actifs
        </label>
      </div>
      {msg&&<div style={{background:T.blueL,borderRadius:8,padding:"8px 12px",fontSize:12,color:T.blue,fontWeight:700,marginBottom:10}}>{msg}</div>}
      {groupes.map(function(g){
        var lignes=comptes.filter(function(c){return c.groupe===g&&(!actifsSeuls||c.actif);}).sort(function(a,b){return String(a.no_compte).localeCompare(String(b.no_compte));});
        if(lignes.length===0&&actifsSeuls)return null;
        return(
          <div key={g} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em"}}>{g}</div>
              <button onClick={function(){setAjoutGroupe(ajoutGroupe===g?null:g);setNfc({no:"",nom:"",type:(g.indexOf("Actifs")===0?"actif":g==="Passifs"?"passif":g==="Capitaux"?"capitaux":g==="Revenus"?"revenu":(g==="Apports aux fonds"||g==="Transferts interfonds")?"fonds":"depense")});}} style={{background:"none",border:"none",color:T.blue,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Ajouter un compte</button>
            </div>
            {ajoutGroupe===g&&(
              <div style={{display:"flex",gap:8,alignItems:"flex-end",marginBottom:10,background:T.blueL,borderRadius:8,padding:10,flexWrap:"wrap"}}>
                <div style={{width:90}}><Lbl l="Numero"/><input value={nfc.no} onChange={function(e){setNfc(Object.assign({},nfc,{no:e.target.value.replace(/\D/g,"").slice(0,6)}));}} style={INP} placeholder="5192"/></div>
                <div style={{flex:1,minWidth:200}}><Lbl l="Nom du compte"/><input value={nfc.nom} onChange={function(e){setNfc(Object.assign({},nfc,{nom:e.target.value}));}} style={INP} placeholder="ex: 021258-1 Operation"/></div>
                <div style={{width:150}}><Lbl l="Type"/><select value={nfc.type} onChange={function(e){setNfc(Object.assign({},nfc,{type:e.target.value}));}} style={INP}>{Object.keys(TYPES_LBL).map(function(t){return <option key={t} value={t}>{TYPES_LBL[t]}</option>;})}</select></div>
                <Btn sm onClick={function(){ajouterCompte(g);}}>Ajouter</Btn>
                <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setAjoutGroupe(null);}}>Annuler</Btn>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:6}}>
              {lignes.map(function(c){
                var actif=c.actif;
                return(
                  <div key={c.no_compte} onClick={function(){basculer(c);}} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,border:"1px solid "+(actif?T.accent+"55":T.border),background:actif?T.accentL:T.alt,cursor:"pointer",opacity:actif?1:0.55}}>
                    <div style={{width:34,height:20,borderRadius:10,background:actif?T.accent:T.border,position:"relative",flexShrink:0,transition:"background 0.15s"}}>
                      <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:actif?17:3,transition:"left 0.15s"}}/>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:T.navy,flexShrink:0}}>{c.no_compte}</span>
                    <span style={{fontSize:11,color:T.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textDecoration:actif?"none":"line-through",flex:1}}>{c.nom_compte}</span>
                    <select value={c.fonds||"operation"} onClick={function(ev){ev.stopPropagation();}} onChange={function(ev){ev.stopPropagation();changerFonds(c,ev.target.value);}} style={{fontSize:9,fontFamily:"inherit",border:"1px solid "+T.border,borderRadius:5,padding:"2px 3px",background:"#fff",color:T.muted,flexShrink:0,maxWidth:86}}>
                      {fondsDispo.map(function(f){return <option key={f} value={f}>{f==="operation"?"Operation":f==="prevoyance"?"Prevoyance":f==="assurance"?"Assurance":f}</option>;})}
                    </select>
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
  var s7=useState(null);var budRow=s7[0];var setBudRow=s7[1];
  var s8=useState([]);var membresCA=s8[0];var setMembresCA=s8[1];
  var s9=useState("");var approuvant=s9[0];var setApprouvant=s9[1];
  var s10=useState(null);var ajoutGrp=s10[0];var setAjoutGrp=s10[1];
  var s11=useState({no:"",nom:"",type:"depense"});var nCompte=s11[0];var setNCompte=s11[1];
  var s12=useState({});var budPrec=s12[0];var setBudPrec=s12[1];
  var s13=useState({});var reelPrec=s13[0];var setReelPrec=s13[1];

  // Gestion des comptes GL directement du budget: ajouter, ou rendre inactif
  function ajouterCompteGL(){
    if(!nCompte.no||!nCompte.nom||!syndicat)return;
    sb.insert("comptes_syndicat",{syndicat_id:syndicat.id,no_compte:nCompte.no,nom_compte:nCompte.nom,type_compte:nCompte.type,groupe:ajoutGrp||"Autres",actif:true,fonds:"operation"}).then(function(r){
      if(r&&r.error){setErr("ECHEC de l ajout du compte: "+(r.error.message||""));return;}
      setAjoutGrp(null);setNCompte({no:"",nom:"",type:"depense"});
      setMsg("Compte "+r.data.no_compte+" - "+r.data.nom_compte+" ajoute au plan comptable.");
      if(p.recharger)p.recharger();
      setTimeout(function(){setMsg("");},4000);
    }).catch(function(e){setErr("Erreur: "+(e&&e.message?e.message:""));});
  }
  function desactiverCompteGL(no){
    var c=comptes.find(function(x){return x.no_compte===no;});
    if(!c)return;
    sb.update("comptes_syndicat",c.id,{actif:false}).then(function(r){
      if(r&&r.error){setErr("ECHEC: "+(r.error.message||""));return;}
      setMsg("Compte "+no+" rendu INACTIF (reactivable dans Plan comptable). Son montant budgete est ignore.");
      if(p.recharger)p.recharger();
      setTimeout(function(){setMsg("");},4000);
    }).catch(function(){});
  }

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
    // Statut du budget (brouillon / approuve par le CA)
    sb.select("budgets",{eq:{syndicat_id:syndicat.id,annee_debut:exo.debut},limit:1}).then(function(r){
      setBudRow(r&&r.data&&r.data[0]?r.data[0]:null);
    }).catch(function(){setBudRow(null);});
    sb.select("membres_ca",{eq:{syndicat_id:syndicat.id,actif:true},limit:20}).then(function(r){
      if(r&&r.data)setMembresCA(r.data);
    }).catch(function(){});
    // ANNEE PRECEDENTE: budget et reel, pour comparer en preparant le nouveau budget
    var prevDebut=(parseInt(exo.debut.substring(0,4),10)-1)+exo.debut.substring(4);
    sb.select("budgets_gl",{eq:{syndicat_id:syndicat.id,exercice_debut:prevDebut},limit:200}).then(function(r){
      var m={};if(r&&r.data)r.data.forEach(function(x){m[x.no_compte]=Number(x.montant)||0;});
      setBudPrec(m);
    }).catch(function(){setBudPrec({});});
    Promise.all([
      sb.select("factures",{eq:{syndicat_id:syndicat.id},limit:1000}),
      sb.select("paiements",{eq:{syndicat_id:syndicat.id},limit:5000})
    ]).then(function(rs){
      var dansPrec=function(d){return d&&d>=prevDebut&&d<exo.debut;};
      var m={};
      ((rs[0]&&rs[0].data)||[]).forEach(function(f){
        if(f.statut==="annulee"||f.statut==="rejetee")return;
        if(!dansPrec(f.date_facture))return;
        var no=f.no_compte_gl||"5190";
        m[no]=(m[no]||0)+(Number(f.total)||Number(f.montant)||0);
      });
      var MAP_P={cotisation:"4110",speciale:"4130",frais:"4600",infraction:"4620"};
      ((rs[1]&&rs[1].data)||[]).forEach(function(pm){
        if((pm.statut||"")!=="paye")return;
        if(!dansPrec(pm.date_paiement))return;
        var no=MAP_P[pm.type_paiement||pm.type||"cotisation"]||"4110";
        m[no]=(m[no]||0)+(Number(pm.montant)||0);
      });
      setReelPrec(m);
    }).catch(function(){setReelPrec({});});
  },[syndicat&&syndicat.id,exo&&exo.debut]);

  var aPrecedent=Object.keys(budPrec).length>0||Object.keys(reelPrec).length>0;
  function reporterBudgetPrecedent(){
    setMontants(function(pr){
      var n=Object.assign({},pr);
      Object.keys(budPrec).forEach(function(no){if(n[no]===undefined||n[no]==="")n[no]=String(budPrec[no]);});
      return n;
    });
    setMsg("Budget de l annee precedente reporte dans les champs vides - ajustez puis sauvegardez.");
    setTimeout(function(){setMsg("");},5000);
  }

  var lignesBudget=comptes.filter(function(c){return c.actif&&["revenu","depense","fonds"].indexOf(c.type_compte)>=0;})
    .map(function(c){return {no:c.no_compte,nom:c.nom_compte,type:c.type_compte,groupe:c.groupe||"Autres",fonds:c.fonds||"operation"};})
    .sort(function(a,b){return String(a.no).localeCompare(String(b.no));});

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
      if(r&&r.error){setEnCours(false);setErr("ECHEC de la sauvegarde du budget: "+(r.error.message||r.error.hint||"erreur"));return;}
      // Statut: toute sauvegarde (re)passe le budget en BROUILLON - il devra etre (re)approuve par le CA
      var majB={syndicat_id:syndicat.id,annee_debut:exo.debut,statut:"brouillon",approuve_par:"",date_approbation:null};
      var opB=budRow&&budRow.id?sb.update("budgets",budRow.id,majB):sb.insert("budgets",majB);
      opB.then(function(rb){
        setEnCours(false);
        if(rb&&rb.data)setBudRow(rb.data);
        setMsg("Budget sauvegarde en BROUILLON ("+rows.length+" ligne(s)) pour "+exo.label+" - faites-le approuver par le CA pour confirmer les cotisations.");
        sb.log("budget","modification","Budget "+exo.debut+" sauvegarde en brouillon: "+cotisationsAnnuelles.toFixed(2)+" $ de cotisations annuelles","",syndicat.code||"");
        setTimeout(function(){setMsg("");},6000);
      }).catch(function(){setEnCours(false);setMsg("Budget sauvegarde, mais le statut brouillon n a pas pu etre enregistre.");});
    }).catch(function(e){setEnCours(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  function approuverBudget(){
    if(!syndicat||!exo)return;
    if(!approuvant){setErr("Choisissez qui approuve le budget (membre du CA).");return;}
    setErr("");
    var majB={syndicat_id:syndicat.id,annee_debut:exo.debut,statut:"approuve",approuve_par:approuvant,date_approbation:new Date().toISOString()};
    var opB=budRow&&budRow.id?sb.update("budgets",budRow.id,majB):sb.insert("budgets",majB);
    opB.then(function(rb){
      if(rb&&rb.error){setErr("ECHEC de l approbation: "+(rb.error.message||""));return;}
      if(rb&&rb.data)setBudRow(rb.data);
      setMsg("Budget "+exo.label+" APPROUVE par "+approuvant+" - vous pouvez maintenant appliquer les cotisations aux unites.");
      sb.log("budget","approbation","Budget "+exo.debut+" approuve par "+approuvant,"",syndicat.code||"");
      setTimeout(function(){setMsg("");},6000);
    }).catch(function(e){setErr("Erreur: "+(e&&e.message?e.message:""));});
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
        <Btn onClick={sauvegarderBudget} dis={enCours}>{enCours?"Sauvegarde...":"Sauvegarder en BROUILLON"}</Btn>
      </div>

      <div style={{background:budRow&&budRow.statut==="approuve"?T.accentL:T.amberL,border:"2px solid "+(budRow&&budRow.statut==="approuve"?T.accent:T.amber),borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        {budRow&&budRow.statut==="approuve"?(
          <span style={{fontSize:12,fontWeight:800,color:T.accent}}>BUDGET APPROUVE par {budRow.approuve_par||"le CA"}{budRow.date_approbation?" le "+String(budRow.date_approbation).substring(0,10):""} - les cotisations peuvent etre appliquees. Toute modification le repassera en brouillon.</span>
        ):(
          <span style={{fontSize:12,fontWeight:800,color:T.amber}}>{budRow?"BUDGET EN BROUILLON":"Aucun budget sauvegarde pour cet exercice"} - il doit etre APPROUVE par les administrateurs avant de confirmer les cotisations.</span>
        )}
        {(!budRow||budRow.statut!=="approuve")&&(
          <span style={{display:"flex",gap:8,alignItems:"center",marginLeft:"auto"}}>
            <select value={approuvant} onChange={function(e){setApprouvant(e.target.value);}} style={Object.assign({},INP,{width:230})}>
              <option value="">Approuve par (membre du CA)...</option>
              {membresCA.map(function(m){var n=((m.prenom||"")+" "+(m.nom||"")).trim();return <option key={m.id} value={n}>{n}{m.role_ca?" ("+m.role_ca+")":""}</option>;})}
            </select>
            <Btn sm onClick={approuverBudget} dis={!budRow}>Approuver le budget</Btn>
          </span>
        )}
      </div>
      {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
      {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <div style={{background:T.redL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Depenses budgetees</div><div style={{fontSize:18,fontWeight:800,color:T.red}}>{money(totDep)}</div></div>
        <div style={{background:T.purpleL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Transferts interfonds</div><div style={{fontSize:18,fontWeight:800,color:T.purple}}>{money(totFonds)}</div></div>
        <div style={{background:T.blueL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Autres revenus (-)</div><div style={{fontSize:18,fontWeight:800,color:T.blue}}>{money(totRevAutres)}</div></div>
        <div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.accent,fontWeight:700}}>COTISATIONS ANNUELLES</div><div style={{fontSize:18,fontWeight:800,color:T.accent}}>{money(cotisationsAnnuelles)}</div><div style={{fontSize:10,color:T.muted}}>{money(cotisationsAnnuelles/12)} /mois</div></div>
      </div>

      {(function(){
        // BUDGET PAR FONDS: revenus, depenses et SOLDE de chaque fonds (balance ou non)
        var fondsIds=["operation","prevoyance","assurance"];
        lignesBudget.forEach(function(c){if(fondsIds.indexOf(c.fonds)<0)fondsIds.push(c.fonds);});
        var LBL_F={operation:"Fonds d operation",prevoyance:"Fonds de prevoyance",assurance:"Fonds d auto-assurance"};
        var m=function(no){return parseFloat(montants[no])||0;};
        return(
          <div style={{background:T.surface,border:"2px solid "+T.navy+"33",borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:2}}>Budget par fonds</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Revenus, depenses et solde de chaque fonds. Un solde a 0 = le fonds balance; positif = surplus; negatif = deficit a corriger.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
              {fondsIds.map(function(fid){
                var lF=lignesBudget.filter(function(c){return c.fonds===fid;});
                var rev,dep;
                if(fid==="operation"){
                  rev=cotisationsAnnuelles+lF.filter(function(c){return c.type==="revenu"&&c.no!=="4100"&&c.no!=="4150";}).reduce(function(a,c){return a+m(c.no);},0);
                  dep=lF.filter(function(c){return c.type==="depense";}).reduce(function(a,c){return a+m(c.no);},0)
                    +lignesBudget.filter(function(c){return c.type==="fonds";}).reduce(function(a,c){return a+m(c.no);},0); // transferts VERS les autres fonds
                }else{
                  rev=lF.filter(function(c){return c.type==="fonds"||c.type==="revenu";}).reduce(function(a,c){return a+m(c.no);},0); // transferts recus + revenus propres
                  dep=lF.filter(function(c){return c.type==="depense";}).reduce(function(a,c){return a+m(c.no);},0);
                }
                var solde=Math.round((rev-dep)*100)/100;
                var balance=Math.abs(solde)<0.005;
                if(fid!=="operation"&&rev===0&&dep===0)return null;
                return(
                  <div key={fid} style={{border:"2px solid "+(balance?T.accent:solde>0?T.blue:T.red)+"66",borderRadius:10,padding:12,background:balance?T.accentL:solde>0?T.blueL:T.redL}}>
                    <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",marginBottom:8}}>{LBL_F[fid]||("Fonds "+fid)}</div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"2px 0"}}><span style={{color:T.muted}}>Revenus budgetes{fid==="operation"?" (incl. cotisations)":fid!=="operation"?" (incl. transferts)":""}</span><span style={{fontWeight:700,color:T.accent}}>{money(rev)}</span></div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"2px 0"}}><span style={{color:T.muted}}>Depenses prevues{fid==="operation"?" (incl. transferts)":""}</span><span style={{fontWeight:700,color:T.red}}>{money(dep)}</span></div>
                    <div style={{borderTop:"2px solid "+T.border,marginTop:6,paddingTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,fontWeight:800,color:T.navy}}>SOLDE</span>
                      <span style={{fontSize:15,fontWeight:800,color:balance?T.accent:solde>0?T.blue:T.red}}>{money(solde)}</span>
                    </div>
                    <div style={{fontSize:10,fontWeight:800,marginTop:4,color:balance?T.accent:solde>0?T.blue:T.red}}>{balance?"BALANCE":solde>0?"SURPLUS":"DEFICIT"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {lignesBudget.length===0&&<div style={{background:T.amberL,borderRadius:10,padding:14,fontSize:12,color:T.amber,fontWeight:600,marginBottom:12}}>Aucun compte actif - activez des comptes dans l onglet Plan comptable.</div>}

      {aPrecedent&&(
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
          <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={reporterBudgetPrecedent}>Reporter le budget de l annee precedente (champs vides)</Btn>
        </div>
      )}
      {groupes.map(function(g){
        var lignes=lignesBudget.filter(function(c){return c.groupe===g;});
        var sousTotal=lignes.reduce(function(a,c){return a+(parseFloat(montants[c.no])||0);},0);
        return(
          <div key={g} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center",gap:8}}>
              <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em"}}>{g}</div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <button onClick={function(){setAjoutGrp(ajoutGrp===g?null:g);setNCompte({no:"",nom:"",type:"depense"});}} style={{background:"none",border:"1px dashed "+T.accent,borderRadius:6,padding:"2px 10px",fontSize:10,fontWeight:700,color:T.accent,cursor:"pointer",fontFamily:"inherit"}}>+ Compte GL</button>
                <div style={{fontSize:11,fontWeight:800,color:T.navy}}>{money(sousTotal)}</div>
              </div>
            </div>
            {aPrecedent&&(
              <div style={{display:"flex",gap:10,padding:"2px 0",fontSize:9,fontWeight:800,color:T.muted,textTransform:"uppercase"}}>
                <span style={{width:44,flexShrink:0}}></span><span style={{flex:1}}></span>
                <span style={{width:86,textAlign:"right"}}>Budget prec.</span>
                <span style={{width:86,textAlign:"right"}}>Reel prec.</span>
                <span style={{width:130,textAlign:"right"}}>Budget {exo?exo.debut.substring(0,4):""}</span>
                <span style={{width:20}}></span>
              </div>
            )}
            {lignes.map(function(c){return(
              <div key={c.no} style={{display:"flex",alignItems:"center",gap:10,padding:"4px 0"}}>
                <span style={{fontSize:11,fontWeight:700,color:T.muted,width:44,flexShrink:0}}>{c.no}</span>
                <span style={{fontSize:12,color:T.text,flex:1}}>{c.nom}{c.no==="4100"||c.no==="4150"?<span style={{fontSize:9,color:T.muted}}> (calcule - n entre pas dans le total)</span>:null}</span>
                {aPrecedent&&<span style={{width:86,textAlign:"right",fontSize:11,color:T.muted}}>{budPrec[c.no]!==undefined?money(budPrec[c.no]):"-"}</span>}
                {aPrecedent&&<span style={{width:86,textAlign:"right",fontSize:11,fontWeight:700,color:reelPrec[c.no]?T.navy:T.muted}}>{reelPrec[c.no]?money(reelPrec[c.no]):"-"}</span>}
                <input type="number" step="0.01" value={montants[c.no]||""} onChange={function(e){setM(c.no,e.target.value);}} style={Object.assign({},INP,{width:130,textAlign:"right"})} placeholder="0.00" disabled={c.no==="4100"||c.no==="4150"}/>
                <button title="Rendre ce compte inactif" onClick={function(){desactiverCompteGL(c.no);}} style={{background:"none",border:"none",color:T.red,fontSize:13,fontWeight:800,cursor:"pointer",width:20,padding:0,fontFamily:"inherit"}}>x</button>
              </div>
            );})}
            {ajoutGrp===g&&(
              <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap",background:T.accentL,borderRadius:8,padding:10,marginTop:8}}>
                <div style={{width:90}}><Lbl l="No"/><input value={nCompte.no} onChange={function(e){setNCompte(Object.assign({},nCompte,{no:e.target.value.replace(/\D/g,"").slice(0,4)}));}} style={INP} placeholder="5250"/></div>
                <div style={{flex:1,minWidth:180}}><Lbl l="Nom du compte"/><input value={nCompte.nom} onChange={function(e){setNCompte(Object.assign({},nCompte,{nom:e.target.value}));}} style={INP} placeholder="Ex: Lavage de vitres"/></div>
                <div style={{width:150}}><Lbl l="Type"/><select value={nCompte.type} onChange={function(e){setNCompte(Object.assign({},nCompte,{type:e.target.value}));}} style={INP}><option value="depense">Depense</option><option value="revenu">Revenu</option><option value="fonds">Transfert interfonds</option></select></div>
                <Btn sm onClick={ajouterCompteGL} dis={!nCompte.no||!nCompte.nom}>Ajouter</Btn>
                <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setAjoutGrp(null);}}>Annuler</Btn>
              </div>
            )}
          </div>
        );
      })}

      <div style={{background:T.surface,border:"2px solid "+T.accent+"66",borderRadius:12,padding:16,marginTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.navy}}>Cotisations par unite (budget x quote-part / 12)</div>
            <div style={{fontSize:11,color:T.muted}}>{unites.length} unite(s) - fractions totales: {totalFraction.toFixed(3)} %</div>
          </div>
          <Btn onClick={appliquerCotisations} dis={applEnCours||unites.length===0||cotisationsAnnuelles<=0||!(budRow&&budRow.statut==="approuve")}>{applEnCours?"Application en cours...":(budRow&&budRow.statut==="approuve"?"Appliquer aux unites":"Approbation du CA requise avant d appliquer")}</Btn>
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

  var listeF=FONDS.slice();
  Object.keys(formes).forEach(function(k){
    if(!listeF.some(function(f){return f.id===k;}))listeF.push({id:k,l:"Fonds "+k.toUpperCase(),desc:"Fonds personnalise",c:"#1B5E3B",bg:"#E8F2EC"});
  });

  return(
    <div>
      <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>Comptes bancaires relies aux fonds</div>
      <div style={{fontSize:11,color:T.muted,marginBottom:14}}>La loi exige des comptes distincts pour le fonds de prevoyance et le fonds d auto-assurance. Chaque fonds est relie a son compte.</div>
      {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
      {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14}}>
        {listeF.map(function(fd){
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

// ===== Onglet ETATS FINANCIERS (budget vs reel + rapport AGA imprimable) =====
function imprimerHTML(titre, corpsHTML){
  var w=window.open("","_blank","width=900,height=700");
  if(!w)return;
  w.document.write("<html><head><title>"+titre+"</title><style>body{font-family:Georgia,serif;color:#1C1A17;margin:36px;font-size:13px}h1{font-size:19px;margin:0 0 2px}h2{font-size:14px;border-bottom:2px solid #13233A;padding-bottom:4px;margin-top:22px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #999;padding:5px 8px;font-size:12px;text-align:left}th{background:#EDEBE4}.tot{font-weight:bold;background:#E8F2EC}.muted{color:#666;font-size:11px}.right{text-align:right}</style></head><body>"+corpsHTML+"<script>window.print();</script></body></html>");
  w.document.close();
}
function dansExercice(dateStr,exo){
  return !!(dateStr&&exo&&String(dateStr).substring(0,10)>=exo.debut&&String(dateStr).substring(0,10)<=exo.fin);
}
function TabEtats(p){
  var syndicat=p.syndicat;var comptes=p.comptes;
  var s0=useState(null);var exo=s0[0];var setExo=s0[1];
  var s1=useState({});var budgets=s1[0];var setBudgets=s1[1];
  var s2=useState([]);var factures=s2[0];var setFactures=s2[1];
  var s3=useState([]);var paiements=s3[0];var setPaiements=s3[1];
  var s4=useState([]);var journal=s4[0];var setJournal=s4[1];
  var s5=useState([]);var banques=s5[0];var setBanques=s5[1];
  var s6=useState(false);var charge=s6[0];var setCharge=s6[1];

  var opts=optionsExercices(syndicat?syndicat.exercice:"");
  useEffect(function(){
    if(!syndicat)return;
    setExo(exerciceCourant(optionsExercices(syndicat.exercice)));
  },[syndicat&&syndicat.id]);

  useEffect(function(){
    if(!syndicat||!exo)return;
    setCharge(false);
    Promise.all([
      sb.select("budgets_gl",{eq:{syndicat_id:syndicat.id,exercice_debut:exo.debut},limit:300}),
      sb.select("factures",{eq:{syndicat_id:syndicat.id},limit:2000}),
      sb.select("paiements",{eq:{syndicat_id:syndicat.id},limit:5000}),
      sb.select("journal",{eq:{syndicat_id:syndicat.id},limit:2000}),
      sb.select("comptes_bancaires",{eq:{syndicat_id:syndicat.id},limit:10})
    ]).then(function(rs){
      var m={};if(rs[0]&&rs[0].data)rs[0].data.forEach(function(x){m[x.no_compte]=parseFloat(x.montant)||0;});
      setBudgets(m);
      setFactures((rs[1]&&rs[1].data)||[]);
      setPaiements((rs[2]&&rs[2].data)||[]);
      setJournal((rs[3]&&rs[3].data)||[]);
      setBanques((rs[4]&&rs[4].data)||[]);
      setCharge(true);
    }).catch(function(){setCharge(true);});
  },[syndicat&&syndicat.id,exo&&exo.debut]);

  if(!syndicat||!exo)return null;

  // ----- REEL par compte GL -----
  var reel={};
  function addReel(no,mnt){if(!no)no="5990";reel[no]=(reel[no]||0)+(Number(mnt)||0);}
  // Depenses reelles = factures approuvees ou payees de l exercice, par compte GL
  var factEx=factures.filter(function(f){return (f.statut==="approuvee"||f.statut==="payee")&&dansExercice(f.date_facture,exo);});
  factEx.forEach(function(f){addReel(f.no_compte_gl||"5990",parseFloat(f.total)||parseFloat(f.montant)||0);});
  // Revenus reels = paiements PAYES de l exercice (cotisations -> 4110, speciales -> 4130)
  var paieEx=paiements.filter(function(pm){return pm.statut==="paye"&&dansExercice(pm.date_paiement,exo);});
  paieEx.forEach(function(pm){addReel(pm.type==="speciale"?"4130":pm.type==="frais"?"4600":pm.type==="infraction"?"4620":"4110",pm.montant);});
  // Journal de l exercice (autres ecritures - presente a part)
  var jrnEx=journal.filter(function(j){return dansExercice(j.date_transaction,exo);});
  var jrnDebit=jrnEx.reduce(function(a,j){return a+(Number(j.montant_debit)||0);},0);
  var jrnCredit=jrnEx.reduce(function(a,j){return a+(Number(j.montant_credit)||0);},0);

  // ----- Budget des cotisations (calcule comme dans l onglet Budget) -----
  var cMap={};comptes.forEach(function(c){cMap[c.no_compte]=c;});
  var budDep=0,budFonds=0,budRevAutres=0;
  Object.keys(budgets).forEach(function(no){
    var c=cMap[no];if(!c)return;
    if(c.type_compte==="depense")budDep+=budgets[no];
    else if(c.type_compte==="fonds")budFonds+=budgets[no];
    else if(c.type_compte==="revenu"&&no!=="4100"&&no!=="4150")budRevAutres+=budgets[no];
  });
  var budCot=Math.max(0,budDep+budFonds-budRevAutres);

  // ----- Lignes du rapport: tout compte avec budget OU reel -----
  function budgetDe(no){
    if(no==="4110")return budCot; // cotisations regulieres = budget calcule
    return budgets[no]||0;
  }
  var nos={};
  Object.keys(budgets).forEach(function(no){nos[no]=true;});
  Object.keys(reel).forEach(function(no){nos[no]=true;});
  if(budCot>0||reel["4110"])nos["4110"]=true;
  var lignes=Object.keys(nos).map(function(no){
    var c=cMap[no];
    var type=c?c.type_compte:(no.charAt(0)==="4"?"revenu":no.charAt(0)==="7"?"prevoyance":"depense");
    return {no:no,nom:c?c.nom_compte:(no==="5990"?"Non classe (compte GL manquant)":"Compte "+no),type:type,groupe:c?(c.groupe||"Autres"):"Autres",budget:budgetDe(no),reel:reel[no]||0};
  }).filter(function(l){return (l.budget!==0||l.reel!==0)&&["revenu","depense","fonds","prevoyance"].indexOf(l.type)>=0;})
    .sort(function(a,b){return String(a.no).localeCompare(String(b.no));});

  var SECTIONS=[
    {titre:"REVENUS",types:["revenu"]},
    {titre:"DEPENSES D OPERATION",types:["depense"]},
    {titre:"TRANSFERTS INTERFONDS",types:["fonds"]},
    {titre:"DEPENSES DU FONDS DE PREVOYANCE",types:["prevoyance"]}
  ];
  function totalSection(sec,champ){
    return lignes.filter(function(l){return sec.types.indexOf(l.type)>=0;}).reduce(function(a,l){return a+l[champ];},0);
  }
  var totRevB=totalSection(SECTIONS[0],"budget"),totRevR=totalSection(SECTIONS[0],"reel");
  var totDepB=totalSection(SECTIONS[1],"budget"),totDepR=totalSection(SECTIONS[1],"reel");
  var totFdsB=totalSection(SECTIONS[2],"budget"),totFdsR=totalSection(SECTIONS[2],"reel");
  var resultatR=totRevR-totDepR-totFdsR;
  var resultatB=totRevB-totDepB-totFdsB;

  function pct(l){if(!l.budget)return "-";return Math.round(l.reel/l.budget*100)+" %";}

  var FONDS_LBL={operation:"Fonds d operation",prevoyance:"Fonds de prevoyance",assurance:"Fonds d auto-assurance"};

  function imprimerRapport(){
    var h="<h1>Etats financiers - "+syndicat.nom+"</h1>";
    h+="<div class='muted'>"+exo.label+" - Rapport budget vs reel prepare pour l assemblee generale annuelle. Genere le "+new Date().toLocaleDateString("fr-CA")+" par Predictek.</div>";
    SECTIONS.forEach(function(sec){
      var ls=lignes.filter(function(l){return sec.types.indexOf(l.type)>=0;});
      if(ls.length===0)return;
      h+="<h2>"+sec.titre+"</h2><table><tr><th>No</th><th>Compte</th><th class='right'>Budget</th><th class='right'>Reel</th><th class='right'>Ecart</th><th class='right'>%</th></tr>";
      ls.forEach(function(l){
        h+="<tr><td>"+l.no+"</td><td>"+l.nom+"</td><td class='right'>"+money(l.budget)+"</td><td class='right'>"+money(l.reel)+"</td><td class='right'>"+money(l.budget-l.reel)+"</td><td class='right'>"+pct(l)+"</td></tr>";
      });
      h+="<tr class='tot'><td></td><td>TOTAL "+sec.titre+"</td><td class='right'>"+money(totalSection(sec,"budget"))+"</td><td class='right'>"+money(totalSection(sec,"reel"))+"</td><td class='right'>"+money(totalSection(sec,"budget")-totalSection(sec,"reel"))+"</td><td></td></tr></table>";
    });
    h+="<h2>RESULTAT DE L EXERCICE</h2><table><tr><th></th><th class='right'>Budget</th><th class='right'>Reel</th></tr>";
    h+="<tr><td>Revenus</td><td class='right'>"+money(totRevB)+"</td><td class='right'>"+money(totRevR)+"</td></tr>";
    h+="<tr><td>Depenses d operation</td><td class='right'>("+money(totDepB)+")</td><td class='right'>("+money(totDepR)+")</td></tr>";
    h+="<tr><td>Transferts interfonds</td><td class='right'>("+money(totFdsB)+")</td><td class='right'>("+money(totFdsR)+")</td></tr>";
    h+="<tr class='tot'><td>EXCEDENT (INSUFFISANCE)</td><td class='right'>"+money(resultatB)+"</td><td class='right'>"+money(resultatR)+"</td></tr></table>";
    if(jrnEx.length>0){
      h+="<h2>AUTRES ECRITURES (JOURNAL)</h2><table><tr><th>Date</th><th>Description</th><th>Categorie</th><th class='right'>Debit</th><th class='right'>Credit</th></tr>";
      jrnEx.forEach(function(j){h+="<tr><td>"+(j.date_transaction||"")+"</td><td>"+(j.description||"")+"</td><td>"+(j.categorie||"")+"</td><td class='right'>"+(Number(j.montant_debit)>0?money(j.montant_debit):"")+"</td><td class='right'>"+(Number(j.montant_credit)>0?money(j.montant_credit):"")+"</td></tr>";});
      h+="<tr class='tot'><td></td><td>TOTAL</td><td></td><td class='right'>"+money(jrnDebit)+"</td><td class='right'>"+money(jrnCredit)+"</td></tr></table>";
    }
    if(banques.length>0){
      h+="<h2>COMPTES BANCAIRES PAR FONDS</h2><table><tr><th>Fonds</th><th>Institution</th><th class='right'>Solde d ouverture</th><th>En date du</th></tr>";
      banques.forEach(function(b){h+="<tr><td>"+(FONDS_LBL[b.fonds]||b.fonds)+"</td><td>"+(b.banque||"")+"</td><td class='right'>"+money(b.solde_ouverture)+"</td><td>"+(b.date_solde||"-")+"</td></tr>";});
      h+="</table>";
    }
    h+="<div class='muted' style='margin-top:20px'>Note: le reel des depenses provient des factures approuvees ou payees de l exercice; le reel des revenus provient des paiements encaisses (module Encaissements). Document de gestion - ne remplace pas des etats financiers verifies par un CPA.</div>";
    imprimerHTML("Etats financiers - "+syndicat.nom,h);
  }

  return(
    <div>
      <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap",marginBottom:14}}>
        <div style={{minWidth:340}}>
          <Lbl l="Exercice financier"/>
          <select value={exo.debut} onChange={function(e){var o=opts.find(function(x){return x.debut===e.target.value;});if(o)setExo(o);}} style={INP}>
            {opts.map(function(o){return <option key={o.debut} value={o.debut}>{o.label}</option>;})}
          </select>
        </div>
        <Btn onClick={imprimerRapport} dis={!charge}>Imprimer le rapport (AGA)</Btn>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <div style={{background:T.accentL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Revenus reels</div><div style={{fontSize:18,fontWeight:800,color:T.accent}}>{money(totRevR)}</div><div style={{fontSize:10,color:T.muted}}>Budget: {money(totRevB)}</div></div>
        <div style={{background:T.redL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Depenses reelles</div><div style={{fontSize:18,fontWeight:800,color:T.red}}>{money(totDepR)}</div><div style={{fontSize:10,color:T.muted}}>Budget: {money(totDepB)}</div></div>
        <div style={{background:T.purpleL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Transferts interfonds (reel)</div><div style={{fontSize:18,fontWeight:800,color:T.purple}}>{money(totFdsR)}</div><div style={{fontSize:10,color:T.muted}}>Budget: {money(totFdsB)}</div></div>
        <div style={{background:resultatR>=0?T.accentL:T.redL,border:"2px solid "+(resultatR>=0?T.accent:T.red),borderRadius:10,padding:12}}><div style={{fontSize:10,fontWeight:700,color:resultatR>=0?T.accent:T.red}}>EXCEDENT (INSUFFISANCE)</div><div style={{fontSize:18,fontWeight:800,color:resultatR>=0?T.accent:T.red}}>{money(resultatR)}</div><div style={{fontSize:10,color:T.muted}}>Budget: {money(resultatB)}</div></div>
      </div>

      {!charge&&<div style={{background:T.blueL,borderRadius:10,padding:14,fontSize:12,color:T.blue,fontWeight:600,marginBottom:12}}>Chargement des donnees de l exercice...</div>}
      {charge&&lignes.length===0&&<div style={{background:T.amberL,borderRadius:10,padding:14,fontSize:12,color:T.amber,fontWeight:600,marginBottom:12}}>Aucune donnee pour cet exercice: entrez un budget (onglet Budget et cotisations), approuvez des factures et encaissez des cotisations pour voir le reel.</div>}

      {SECTIONS.map(function(sec){
        var ls=lignes.filter(function(l){return sec.types.indexOf(l.type)>=0;});
        if(ls.length===0)return null;
        return(
          <div key={sec.titre} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>{sec.titre}</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.alt}}>
                {["No","Compte","Budget","Reel","Ecart","%"].map(function(hh,ix){return <th key={hh} style={{padding:"6px 10px",textAlign:ix>=2?"right":"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{hh}</th>;})}
              </tr></thead>
              <tbody>
                {ls.map(function(l){
                  var ecart=l.budget-l.reel;
                  var mauvais=(l.type==="revenu")?(l.reel<l.budget):(l.reel>l.budget);
                  return(
                    <tr key={l.no} style={{borderTop:"1px solid "+T.border}}>
                      <td style={{padding:"5px 10px",fontWeight:700,color:T.muted}}>{l.no}</td>
                      <td style={{padding:"5px 10px"}}>{l.nom}{l.no==="4110"?<span style={{fontSize:9,color:T.muted}}> (budget = cotisations calculees)</span>:null}</td>
                      <td style={{padding:"5px 10px",textAlign:"right"}}>{money(l.budget)}</td>
                      <td style={{padding:"5px 10px",textAlign:"right",fontWeight:700}}>{money(l.reel)}</td>
                      <td style={{padding:"5px 10px",textAlign:"right",fontWeight:700,color:mauvais?T.red:T.accent}}>{money(ecart)}</td>
                      <td style={{padding:"5px 10px",textAlign:"right",color:T.muted}}>{pct(l)}</td>
                    </tr>
                  );
                })}
                <tr style={{borderTop:"2px solid "+T.navy,background:T.alt}}>
                  <td style={{padding:"6px 10px"}}></td>
                  <td style={{padding:"6px 10px",fontWeight:800,color:T.navy}}>TOTAL</td>
                  <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800}}>{money(totalSection(sec,"budget"))}</td>
                  <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800}}>{money(totalSection(sec,"reel"))}</td>
                  <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800}}>{money(totalSection(sec,"budget")-totalSection(sec,"reel"))}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}

      {jrnEx.length>0&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Autres ecritures (journal) - {jrnEx.length} transaction(s)</div>
          <div style={{fontSize:11,color:T.muted}}>Debits: <b style={{color:T.red}}>{money(jrnDebit)}</b> - Credits: <b style={{color:T.accent}}>{money(jrnCredit)}</b>. Ces ecritures manuelles sont presentees a part du budget vs reel (detail dans l onglet Journal et dans le rapport imprime).</div>
        </div>
      )}

      {banques.length>0&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Comptes bancaires par fonds</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
            {banques.map(function(b){return(
              <div key={b.fonds} style={{background:T.alt,borderRadius:8,padding:10}}>
                <div style={{fontSize:11,fontWeight:700,color:T.navy}}>{FONDS_LBL[b.fonds]||b.fonds}</div>
                <div style={{fontSize:16,fontWeight:800,color:T.accent}}>{money(b.solde_ouverture)}</div>
                <div style={{fontSize:10,color:T.muted}}>{b.banque||""}{b.date_solde?" - solde au "+b.date_solde:" - solde d ouverture"}</div>
              </div>
            );})}
          </div>
        </div>
      )}

      <div style={{fontSize:10,color:T.muted,marginTop:8}}>Le reel des depenses provient des factures approuvees ou payees; le reel des revenus provient des paiements encaisses (module Encaissements). Document de gestion - ne remplace pas des etats financiers verifies par un CPA.</div>
    </div>
  );
}

// ===== Onglet COMPTABILITE PAR FONDS =====
function TabFonds(p){
  var syndicat=p.syndicat;var comptes=p.comptes;var recharger=p.recharger;
  var s0=useState(null);var exo=s0[0];var setExo=s0[1];
  var s1=useState([]);var factures=s1[0];var setFactures=s1[1];
  var s2=useState([]);var paiements=s2[0];var setPaiements=s2[1];
  var s3=useState([]);var journal=s3[0];var setJournal=s3[1];
  var s4=useState([]);var banques=s4[0];var setBanques=s4[1];
  var s5=useState({});var budgets=s5[0];var setBudgets=s5[1];
  var s6=useState(false);var charge=s6[0];var setCharge=s6[1];
  var s7=useState("");var msg=s7[0];var setMsg=s7[1];
  var s8=useState("");var err=s8[0];var setErr=s8[1];
  var s9=useState(false);var showAjout=s9[0];var setShowAjout=s9[1];
  var s10=useState("");var nomFonds=s10[0];var setNomFonds=s10[1];

  var opts=optionsExercices(syndicat?syndicat.exercice:"");
  useEffect(function(){
    if(!syndicat)return;
    setExo(exerciceCourant(optionsExercices(syndicat.exercice)));
  },[syndicat&&syndicat.id]);
  useEffect(function(){
    if(!syndicat||!exo)return;
    setCharge(false);
    Promise.all([
      sb.select("factures",{eq:{syndicat_id:syndicat.id},limit:2000}),
      sb.select("paiements",{eq:{syndicat_id:syndicat.id},limit:5000}),
      sb.select("journal",{eq:{syndicat_id:syndicat.id},limit:2000}),
      sb.select("comptes_bancaires",{eq:{syndicat_id:syndicat.id},limit:20}),
      sb.select("budgets_gl",{eq:{syndicat_id:syndicat.id,exercice_debut:exo.debut},limit:300})
    ]).then(function(rs){
      setFactures((rs[0]&&rs[0].data)||[]);
      setPaiements((rs[1]&&rs[1].data)||[]);
      setJournal((rs[2]&&rs[2].data)||[]);
      setBanques((rs[3]&&rs[3].data)||[]);
      var m={};if(rs[4]&&rs[4].data)rs[4].data.forEach(function(x){m[x.no_compte]=parseFloat(x.montant)||0;});
      setBudgets(m);
      setCharge(true);
    }).catch(function(){setCharge(true);});
  },[syndicat&&syndicat.id,exo&&exo.debut]);

  if(!syndicat||!exo)return null;

  var cMap={};comptes.forEach(function(c){cMap[c.no_compte]=c;});
  function fondsDe(no){var c=cMap[no];return (c&&c.fonds)||"operation";}

  // Liste des fonds: 3 standards + personnalises (comptes ou comptes bancaires)
  var FONDS_STD=[{id:"operation",l:"Fonds d OPERATION",c:"#1A56DB"},{id:"prevoyance",l:"Fonds de PREVOYANCE",c:"#6B3FA0"},{id:"assurance",l:"Fonds d AUTO-ASSURANCE",c:"#B86020"}];
  var listeFonds=FONDS_STD.slice();
  comptes.forEach(function(c){if(c.fonds&&!listeFonds.some(function(f){return f.id===c.fonds;}))listeFonds.push({id:c.fonds,l:"Fonds "+c.fonds.toUpperCase(),c:"#1B5E3B"});});
  banques.forEach(function(b){if(b.fonds&&!listeFonds.some(function(f){return f.id===b.fonds;}))listeFonds.push({id:b.fonds,l:"Fonds "+b.fonds.toUpperCase(),c:"#1B5E3B"});});

  var factEx=factures.filter(function(f){return (f.statut==="approuvee"||f.statut==="payee")&&dansExercice(f.date_facture,exo);});
  var paieEx=paiements.filter(function(pm){return pm.statut==="paye"&&dansExercice(pm.date_paiement,exo);});
  var jrnEx=journal.filter(function(j){return dansExercice(j.date_transaction,exo);});

  function calculFonds(fid){
    // Revenus reels: encaissements (cotisations 4110 / speciales 4130) selon le fonds du compte + credits du journal
    var rev=0;
    paieEx.forEach(function(pm){var no=pm.type==="speciale"?"4130":pm.type==="frais"?"4600":pm.type==="infraction"?"4620":"4110";if(fondsDe(no)===fid)rev+=Number(pm.montant)||0;});
    // Depenses reelles: factures selon le fonds du compte GL
    var dep=0;
    factEx.forEach(function(f){if(fondsDe(f.no_compte_gl||"5990")===fid)dep+=parseFloat(f.total)||parseFloat(f.montant)||0;});
    // Journal: ecritures manuelles (virements entre fonds, interets...) - via le fonds du compte si categorie correspond
    var jDep=0,jRev=0;
    jrnEx.forEach(function(j){
      var cat=(j.categorie||"").toLowerCase();
      var cible=cat.indexOf("prevoyance")>=0?"prevoyance":cat.indexOf("assurance")>=0?"assurance":"operation";
      if(cible!==fid)return;
      jDep+=Number(j.montant_debit)||0;jRev+=Number(j.montant_credit)||0;
    });
    // Apports BUDGETES vers ce fonds (comptes type fonds rattaches au fonds cible)
    var apportsBud=0;
    comptes.filter(function(c){return c.type_compte==="fonds"&&(c.fonds||"operation")===fid;}).forEach(function(c){apportsBud+=budgets[c.no_compte]||0;});
    var banque=banques.find(function(b){return b.fonds===fid;});
    var ouverture=banque?(parseFloat(banque.solde_ouverture)||0):0;
    return {rev:rev+jRev,dep:dep+jDep,apportsBud:apportsBud,ouverture:ouverture,banque:banque,solde:ouverture+rev+jRev-dep-jDep};
  }

  function ajouterFonds(){
    var slug=(nomFonds||"").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g,"").substring(0,20);
    if(!slug){setErr("Entrez un nom de fonds valide (lettres/chiffres).");return;}
    if(listeFonds.some(function(f){return f.id===slug;})){setErr("Ce fonds existe deja.");return;}
    sb.upsert("comptes_bancaires",[{syndicat_id:syndicat.id,fonds:slug,banque:"",institution:"",transit:"",no_compte:"",solde_ouverture:0,date_solde:null}],"syndicat_id,fonds").then(function(r){
      if(r&&r.error){setErr("ECHEC de la creation du fonds: "+(r.error.message||""));return;}
      setMsg("Fonds \""+slug+"\" cree. Rattachez-lui des comptes dans le Plan comptable (selecteur de fonds sur chaque compte) et configurez son compte bancaire.");
      sb.log("budget","creation","Fonds personnalise cree: "+slug,"",syndicat.code||"");
      setShowAjout(false);setNomFonds("");
      sb.select("comptes_bancaires",{eq:{syndicat_id:syndicat.id},limit:20}).then(function(r2){if(r2&&r2.data)setBanques(r2.data);});
      setTimeout(function(){setMsg("");},7000);
    });
  }

  return(
    <div>
      <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap",marginBottom:14}}>
        <div style={{minWidth:340}}>
          <Lbl l="Exercice financier"/>
          <select value={exo.debut} onChange={function(e){var o=opts.find(function(x){return x.debut===e.target.value;});if(o)setExo(o);}} style={INP}>
            {opts.map(function(o){return <option key={o.debut} value={o.debut}>{o.label}</option>;})}
          </select>
        </div>
        <Btn bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){setShowAjout(!showAjout);setErr("");}}>+ Ajouter un fonds</Btn>
      </div>
      {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
      {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}
      {showAjout&&(
        <div style={{display:"flex",gap:8,alignItems:"flex-end",background:T.blueL,borderRadius:10,padding:12,marginBottom:14,flexWrap:"wrap"}}>
          <div style={{minWidth:220}}><Lbl l="Nom du nouveau fonds"/><input value={nomFonds} onChange={function(e){setNomFonds(e.target.value);}} style={INP} placeholder="ex: travaux, ascenseur..."/></div>
          <Btn onClick={ajouterFonds}>Creer le fonds</Btn>
          <div style={{fontSize:10,color:T.muted}}>Un compte bancaire lui sera associe; rattachez ensuite ses comptes GL dans le Plan comptable.</div>
        </div>
      )}
      {!charge&&<div style={{background:T.blueL,borderRadius:10,padding:14,fontSize:12,color:T.blue,fontWeight:600,marginBottom:12}}>Chargement...</div>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
        {listeFonds.map(function(fd){
          var k=calculFonds(fd.id);
          return(
            <div key={fd.id} style={{background:T.surface,border:"2px solid "+fd.c+"44",borderRadius:12,padding:16}}>
              <div style={{fontSize:12,fontWeight:800,color:fd.c,marginBottom:10}}>{fd.l}</div>
              <div style={{display:"grid",gap:6,fontSize:12}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:T.muted}}>Solde d ouverture{k.banque&&k.banque.date_solde?" ("+k.banque.date_solde+")":""}</span><b>{money(k.ouverture)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:T.muted}}>+ Revenus de l exercice</span><b style={{color:T.accent}}>{money(k.rev)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:T.muted}}>- Depenses de l exercice</span><b style={{color:T.red}}>{money(k.dep)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between",borderTop:"2px solid "+fd.c+"44",paddingTop:6,marginTop:2}}><span style={{fontWeight:800,color:T.navy}}>SOLDE COURANT</span><span style={{fontWeight:800,fontSize:15,color:k.solde>=0?T.accent:T.red}}>{money(k.solde)}</span></div>
                {k.apportsBud>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:T.muted}}>Transferts interfonds budgetes vers ce fonds</span><span style={{color:T.purple,fontWeight:700}}>{money(k.apportsBud)}</span></div>}
                {!k.banque&&<div style={{fontSize:10,color:T.amber,fontWeight:600}}>Aucun compte bancaire configure pour ce fonds (Comptes bancaires).</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{fontSize:10,color:T.muted,marginTop:12}}>
        Revenus = encaissements (cotisations et speciales) et credits du journal rattaches au fonds; depenses = factures approuvees/payees selon le fonds du compte GL et debits du journal. Le rattachement compte-fonds se fait dans le Plan comptable. Enregistrez les virements entre fonds au Journal.
      </div>
    </div>
  );
}

// ===== MODULE PRINCIPAL =====
export default function BudgetCompta(props){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState((props&&props.onglet)||"budget");var ong=s2[0];var setOng=s2[1];
  useEffect(function(){setOng((props&&props.onglet)||"budget");},[props&&props.onglet]);
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

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat - creez d abord un syndicat via Configuration.</div>;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{ong==="budget"?"Budget et cotisations":ong==="etats"?"Etats financiers":ong==="fonds"?"Comptabilite par fonds":ong==="charte"?"Plan comptable":ong==="banques"?"Comptes bancaires":"Journal des transactions"}</div>
        <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>

      </div>
      <div style={{padding:20}}>
        {errInit&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{errInit}</div>}
        {ong==="budget"&&<TabBudget syndicat={sel} comptes={comptes} recharger={chargerComptes}/>}
        {ong==="etats"&&<TabEtats syndicat={sel} comptes={comptes}/>}
        {ong==="fonds"&&<TabFonds syndicat={sel} comptes={comptes} recharger={chargerComptes}/>}
        {ong==="charte"&&<TabCharte syndicat={sel} comptes={comptes} recharger={chargerComptes}/>}
        {ong==="banques"&&<TabBanques syndicat={sel}/>}
        {ong==="journal"&&<TabJournal syndicat={sel}/>}
      </div>
    </div>
  );
}
