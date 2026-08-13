// Encaissements v1.0 - PAR UNITE
// - Cotisations du mois: generation, encaissement individuel et LOT PAP en 1 clic
// - Cotisations SPECIALES: creation (repartition automatique par quote-part) et suivi
// - Arrerages par unite (+ interets de retard au taux configure)
// - Etat de compte imprimable par unite
// - ATTESTATION DE CHARGES pour notaire (vente d unite, art. 1069 C.c.Q.)

import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Bdg(p){return <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap"}}>{p.children}</span>;}
var money=function(n){return (Number(n)||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var MNOMS=["","janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];
function pad2(n){return (n<10?"0":"")+n;}

// Mois AAAA-MM entre deux dates (inclusif du debut, jusqu au mois donne)
function moisEntre(debut, moisFin){
  var out=[];
  var d=new Date(debut.substring(0,7)+"-01T12:00:00");
  var fin=new Date(moisFin+"-01T12:00:00");
  var garde=0;
  while(d<=fin&&garde<240){
    out.push(d.getFullYear()+"-"+pad2(d.getMonth()+1));
    d.setMonth(d.getMonth()+1);garde++;
  }
  return out;
}

// Debut de l exercice courant a partir du texte d exercice du syndicat
var MOIS_FR={"jan":0,"fev":1,"mar":2,"avr":3,"mai":4,"jun":5,"juin":5,"jul":6,"juil":6,"aou":7,"sep":8,"oct":9,"nov":10,"dec":11};
function debutExerciceCourant(exerciceTxt){
  var m=String(exerciceTxt||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").match(/(\d{1,2})\s*([a-z]{3,5})/);
  var mois=0,jour=1;
  if(m){var cle=m[2].substring(0,4);var mm=MOIS_FR[cle]!==undefined?MOIS_FR[cle]:MOIS_FR[m[2].substring(0,3)];if(mm!==undefined){mois=mm;jour=parseInt(m[1])||1;}}
  var now=new Date();
  var d=new Date(now.getFullYear(),mois,jour);
  if(d>now)d=new Date(now.getFullYear()-1,mois,jour);
  return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());
}

// Impression d un document HTML dans une fenetre dediee
function imprimerHTML(titre, corpsHTML){
  var w=window.open("","_blank","width=900,height=700");
  if(!w)return;
  w.document.write("<html><head><title>"+titre+"</title><style>body{font-family:Georgia,serif;color:#1C1A17;margin:36px;font-size:13px}h1{font-size:19px;margin:0 0 2px}h2{font-size:14px;border-bottom:2px solid #13233A;padding-bottom:4px;margin-top:22px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #999;padding:5px 8px;font-size:12px;text-align:left}th{background:#EDEBE4}.tot{font-weight:bold;background:#E8F2EC}.muted{color:#666;font-size:11px}.right{text-align:right}</style></head><body>"+corpsHTML+"<script>window.print();</script></body></html>");
  w.document.close();
}

export default function Encaissements(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var unites=s2[0];var setUnites=s2[1];
  var s3=useState([]);var copros=s3[0];var setCopros=s3[1];
  var s4=useState([]);var paiements=s4[0];var setPaiements=s4[1];
  var s5=useState([]);var speciales=s5[0];var setSpeciales=s5[1];
  var s6=useState(new Date().toISOString().substring(0,7));var mois=s6[0];var setMois=s6[1];
  var s7=useState("");var msg=s7[0];var setMsg=s7[1];
  var s8=useState("");var err=s8[0];var setErr=s8[1];
  var s9=useState(false);var enCours=s9[0];var setEnCours=s9[1];
  var s10=useState("encaissements");var ong=s10[0];var setOng=s10[1];
  var s11=useState(null);var detailU=s11[0];var setDetailU=s11[1];
  var s12=useState({titre:"",montant_total:"",date_vote:new Date().toISOString().substring(0,10),nb_versements:"1",date_premier_versement:new Date().toISOString().substring(0,10),notes:""});
  var nfSp=s12[0];var setNfSp=s12[1];
  var s13=useState("0");var tauxInteret=s13[0];var setTauxInteret=s13[1];
  var s14=useState([]);var factCopros=s14[0];var setFactCopros=s14[1];
  var s15=useState(false);var showFC=s15[0];var setShowFC=s15[1];
  var s16=useState({unite:"",type_frais:"frais",description:"",montant:"",date_facture:new Date().toISOString().substring(0,10),date_echeance:""});var nfFC=s16[0];var setNfFC=s16[1];
  var s17=useState({origId:"",origNom:"",centre:"",noFichier:"1"});var dpa=s17[0];var setDpa=s17[1];
  var s18=useState(false);var showDpaCfg=s18[0];var setShowDpaCfg=s18[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
    sb.selectOne("config_publique",{eq:{cle:"taux_interet_retard"}}).then(function(r){
      if(r&&r.data&&r.data.valeur)setTauxInteret(r.data.valeur);
    }).catch(function(){});
  },[]);

  function chargerTout(){
    if(!sel)return;
    sb.select("unites",{eq:{syndicat_id:sel.id},order:"no_unite.asc",limit:1000}).then(function(r){if(r&&r.data)setUnites(r.data);}).catch(function(){});
    sb.select("coproprietaires",{eq:{syndicat_id:sel.id},limit:2000}).then(function(r){if(r&&r.data)setCopros(r.data);}).catch(function(){});
    sb.select("paiements",{eq:{syndicat_id:sel.id},order:"date_paiement.desc",limit:5000}).then(function(r){if(r&&r.data)setPaiements(r.data);}).catch(function(){});
    sb.select("cotisations_speciales",{eq:{syndicat_id:sel.id},order:"date_vote.desc",limit:100}).then(function(r){if(r&&r.data)setSpeciales(r.data);}).catch(function(){});
    sb.select("factures_copros",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:500}).then(function(r){if(r&&r.data)setFactCopros(r.data);}).catch(function(){});
    sb.selectOne("config_publique",{eq:{cle:"dpa_config"}}).then(function(r){
      if(r&&r.data&&r.data.valeur){try{setDpa(Object.assign({origId:"",origNom:"",centre:"",noFichier:"1"},JSON.parse(r.data.valeur)));}catch(e){}}
    }).catch(function(){});
  }
  useEffect(function(){chargerTout();},[sel&&sel.id]);

  function propsDe(u){
    return copros.filter(function(c){return c.statut!=="ancien"&&((c.unite_id&&c.unite_id===u.id)||(!c.unite_id&&c.unite===u.no_unite));});
  }
  function paiementDuMois(u,typ){
    return paiements.find(function(p){
      return p.unite_id===u.id&&(p.type||"cotisation")===typ&&(p.mois?p.mois===mois:String(p.date_paiement||"").substring(0,7)===mois)&&p.statut!=="annule";
    });
  }
  // Versements de cotisations speciales dus pour une unite dans un mois donne
  function specialesDues(u,leMois){
    var total=0;
    speciales.forEach(function(spx){
      var n=parseInt(spx.nb_versements)||1;
      var moisListe=[];
      var d=new Date(String(spx.date_premier_versement||spx.date_vote).substring(0,7)+"-01T12:00:00");
      for(var i=0;i<n;i++){moisListe.push(d.getFullYear()+"-"+pad2(d.getMonth()+1));d.setMonth(d.getMonth()+1);}
      if(moisListe.indexOf(leMois)>=0){
        var partUnite=(Number(spx.montant_total)||0)*(parseFloat(u.fraction)||0)/100;
        total+=partUnite/n;
      }
    });
    return Math.round(total*100)/100;
  }
  // Arrerages: attendu depuis le debut de l exercice courant - paye
  function calculArrerages(u){
    var debut=debutExerciceCourant(sel?sel.exercice:"");
    var listeMois=moisEntre(debut,mois);
    var attendu=listeMois.length*(Number(u.cotisation_mensuelle)||0);
    listeMois.forEach(function(mm){attendu+=specialesDues(u,mm);});
    var paye=paiements.filter(function(p){
      return p.unite_id===u.id&&p.statut==="paye"&&(p.mois?listeMois.indexOf(p.mois)>=0:listeMois.indexOf(String(p.date_paiement||"").substring(0,7))>=0);
    }).reduce(function(a,p){return a+Number(p.montant||0);},0);
    var arr=Math.max(0,Math.round((attendu-paye)*100)/100);
    var interets=Math.round(arr*(parseFloat(tauxInteret)||0)/100/12*100)/100; // interet mensuel simple
    return {attendu:attendu,paye:paye,arrerages:arr,interets:interets,nbMois:listeMois.length,debut:debut};
  }

  // Generer les lignes de cotisation du mois (en attente) pour les unites sans ligne
  function genererMois(){
    if(!sel||enCours)return;
    setEnCours(true);setMsg("");setErr("");
    var manquantes=unites.filter(function(u){return Number(u.cotisation_mensuelle)>0&&!paiementDuMois(u,"cotisation");});
    if(manquantes.length===0){setMsg("Toutes les unites ont deja leur ligne de cotisation pour "+mois+".");setEnCours(false);return;}
    Promise.all(manquantes.map(function(u){
      var pr=propsDe(u)[0];
      var due=Number(u.cotisation_mensuelle)||0;
      return sb.insert("paiements",{syndicat_id:sel.id,unite_id:u.id,coproprietaire_id:pr?pr.id:null,type:"cotisation",mois:mois,date_paiement:mois+"-01",montant:due,description:"Cotisation "+MNOMS[parseInt(mois.substring(5,7))]+" "+mois.substring(0,4)+" - unite "+u.no_unite,statut:"en_attente",moyen:""});
    })).then(function(rs){
      var ok=rs.filter(function(r){return r&&r.data&&r.data.id;}).length;
      var ech=rs.length-ok;
      if(ech>0)setErr(ech+" ligne(s) NON creee(s): "+((rs.find(function(r){return r&&r.error;})||{}).error||{}).message||"");
      setMsg(ok+" cotisation(s) generee(s) pour "+mois+".");
      sb.log("encaissements","creation",ok+" cotisations generees pour "+mois,"",sel.code||"");
      chargerTout();setEnCours(false);
    }).catch(function(e){setErr("Erreur: "+(e&&e.message?e.message:""));setEnCours(false);});
  }

  // LOT PAP: encaisse en 1 clic toutes les unites avec PAP actif
  function encaisserLotPAP(){
    if(!sel||enCours)return;
    setEnCours(true);setMsg("");setErr("");
    var cibles=unites.filter(function(u){return u.pap_actif&&Number(u.cotisation_mensuelle)>0;});
    if(cibles.length===0){setErr("Aucune unite avec PAP actif. Activez le PAP dans le module Unites.");setEnCours(false);return;}
    var auj=new Date().toISOString().substring(0,10);
    Promise.all(cibles.map(function(u){
      var existant=paiementDuMois(u,"cotisation");
      var pr=propsDe(u)[0];
      var due=Number(u.cotisation_mensuelle)||0;
      if(existant){
        if(existant.statut==="paye")return Promise.resolve({data:existant});
        return sb.update("paiements",existant.id,{statut:"paye",moyen:"pap",date_paiement:auj});
      }
      return sb.insert("paiements",{syndicat_id:sel.id,unite_id:u.id,coproprietaire_id:pr?pr.id:null,type:"cotisation",mois:mois,date_paiement:auj,montant:due,description:"Cotisation "+MNOMS[parseInt(mois.substring(5,7))]+" "+mois.substring(0,4)+" - unite "+u.no_unite+" (PAP)",statut:"paye",moyen:"pap"});
    })).then(function(rs){
      var ok=rs.filter(function(r){return r&&(r.data&&(r.data.id||r.data.statut))||(!r.error);}).length;
      setMsg("Lot PAP encaisse: "+ok+" unite(s) marquee(s) payee(s) pour "+mois+".");
      sb.log("encaissements","paiement","Lot PAP "+mois+": "+ok+" unites encaissees","",sel.code||"");
      chargerTout();setEnCours(false);
    }).catch(function(e){setErr("Erreur lot PAP: "+(e&&e.message?e.message:""));setEnCours(false);});
  }

  function encaisser(u,moyen){
    var existant=paiementDuMois(u,"cotisation");
    var pr=propsDe(u)[0];
    var auj=new Date().toISOString().substring(0,10);
    var op=existant
      ?sb.update("paiements",existant.id,{statut:"paye",moyen:moyen,date_paiement:auj})
      :sb.insert("paiements",{syndicat_id:sel.id,unite_id:u.id,coproprietaire_id:pr?pr.id:null,type:"cotisation",mois:mois,date_paiement:auj,montant:Number(u.cotisation_mensuelle)||0,description:"Cotisation "+MNOMS[parseInt(mois.substring(5,7))]+" "+mois.substring(0,4)+" - unite "+u.no_unite,statut:"paye",moyen:moyen});
    op.then(function(r){
      if(r&&r.error){setErr("Echec: "+(r.error.message||""));return;}
      sb.log("encaissements","paiement","Unite "+u.no_unite+" - cotisation "+mois+" payee ("+moyen+")","",sel.code||"");
      chargerTout();
    });
  }
  function annulerPaiement(u){
    var existant=paiementDuMois(u,"cotisation");
    if(!existant)return;
    sb.update("paiements",existant.id,{statut:"en_attente",moyen:""}).then(function(){chargerTout();});
  }

  function sauverTaux(v){
    setTauxInteret(v);
    sb.upsert("config_publique",[{cle:"taux_interet_retard",valeur:String(parseFloat(v)||0)}],"cle").catch(function(){});
  }

  // ----- Cotisations speciales -----
  function setSp(k,v){setNfSp(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}
  function creerSpeciale(){
    if(!sel||!nfSp.titre||!parseFloat(nfSp.montant_total)){setErr("Titre et montant total requis.");return;}
    setErr("");setMsg("");
    var row={syndicat_id:sel.id,titre:nfSp.titre,montant_total:parseFloat(nfSp.montant_total)||0,date_vote:nfSp.date_vote||null,nb_versements:parseInt(nfSp.nb_versements)||1,date_premier_versement:nfSp.date_premier_versement||null,notes:nfSp.notes||""};
    sb.insert("cotisations_speciales",row).then(function(r){
      if(!r||!r.data||!r.data.id){setErr("ECHEC de la creation: "+((r&&r.error&&r.error.message)||"erreur"));return;}
      setMsg("Cotisation speciale creee - repartie automatiquement par quote-part sur "+row.nb_versements+" versement(s).");
      sb.log("encaissements","creation","Cotisation speciale: "+row.titre+" ("+row.montant_total+" $)","",sel.code||"");
      setNfSp({titre:"",montant_total:"",date_vote:new Date().toISOString().substring(0,10),nb_versements:"1",date_premier_versement:new Date().toISOString().substring(0,10),notes:""});
      chargerTout();
    });
  }

  // ----- Etat de compte / attestation -----
  function etatDeCompte(u){
    var calc=calculArrerages(u);
    var props=propsDe(u);
    var lignes=paiements.filter(function(p){return p.unite_id===u.id&&p.statut!=="annule";}).slice(0,36);
    var html="<h1>Etat de compte - Unite "+u.no_unite+"</h1>"
      +"<div class='muted'>"+(sel?sel.nom:"")+" - genere le "+new Date().toLocaleDateString("fr-CA")+"</div>"
      +"<h2>Proprietaire(s)</h2><div>"+(props.map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim()+(props.length>1?" ("+(c.part_pourcent||50)+" %)":"");}).join(" et ")||"-")+"</div>"
      +"<h2>Sommaire depuis le debut de l exercice ("+calc.debut+")</h2>"
      +"<table><tr><th>Cotisations attendues ("+calc.nbMois+" mois + speciales)</th><td class='right'>"+money(calc.attendu)+"</td></tr>"
      +"<tr><th>Paiements recus</th><td class='right'>"+money(calc.paye)+"</td></tr>"
      +"<tr class='tot'><th>ARRERAGES</th><td class='right'>"+money(calc.arrerages)+"</td></tr>"
      +(calc.interets>0?"<tr><th>Interets de retard du mois ("+tauxInteret+" %/an)</th><td class='right'>"+money(calc.interets)+"</td></tr>":"")
      +"</table>"
      +"<h2>Historique des paiements</h2><table><tr><th>Mois</th><th>Description</th><th>Statut</th><th>Moyen</th><th class='right'>Montant</th></tr>"
      +lignes.map(function(p){return "<tr><td>"+(p.mois||String(p.date_paiement||"").substring(0,7))+"</td><td>"+(p.description||"")+"</td><td>"+(p.statut||"")+"</td><td>"+(p.moyen||"")+"</td><td class='right'>"+money(p.montant)+"</td></tr>";}).join("")
      +"</table>";
    imprimerHTML("Etat de compte unite "+u.no_unite,html);
  }

  function attestation(u){
    var calc=calculArrerages(u);
    var props=propsDe(u);
    var spList=speciales.map(function(spx){
      var part=(Number(spx.montant_total)||0)*(parseFloat(u.fraction)||0)/100;
      return "<tr><td>"+(spx.titre||"")+"</td><td>"+(spx.date_vote||"-")+"</td><td class='right'>"+money(spx.montant_total)+"</td><td class='right'>"+money(part)+"</td><td>"+(spx.nb_versements||1)+" versement(s)</td></tr>";
    }).join("");
    var html="<h1>ATTESTATION DE L ETAT DES CHARGES COMMUNES</h1>"
      +"<div class='muted'>Article 1069 du Code civil du Quebec - generee le "+new Date().toLocaleDateString("fr-CA")+"</div>"
      +"<h2>Syndicat</h2><div><b>"+(sel?sel.nom:"")+"</b><br/>"+((sel&&sel.adr)||"")+(sel&&sel.ville?", "+sel.ville:"")+"<br/>NEQ: "+((sel&&sel.immat)||"-")+"</div>"
      +"<h2>Unite visee</h2><table>"
      +"<tr><th>Numero d unite</th><td>"+u.no_unite+"</td></tr>"
      +"<tr><th>Cadastre</th><td>"+(u.cadastre||"-")+"</td></tr>"
      +"<tr><th>Quote-part des parties communes</th><td>"+(parseFloat(u.fraction)||0).toFixed(3)+" %</td></tr>"
      +"<tr><th>Proprietaire(s) actuel(s)</th><td>"+(props.map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(" et ")||"-")+"</td></tr>"
      +"<tr><th>Cotisation mensuelle courante</th><td>"+money(u.cotisation_mensuelle)+"</td></tr></table>"
      +"<h2>Etat des charges</h2><table>"
      +"<tr><th>Charges communes dues (arrerages) en date de ce jour</th><td class='right'><b>"+money(calc.arrerages)+"</b></td></tr>"
      +(calc.interets>0?"<tr><th>Interets de retard courus (mois courant)</th><td class='right'>"+money(calc.interets)+"</td></tr>":"")
      +"</table>"
      +"<h2>Cotisations speciales votees</h2>"
      +(speciales.length>0?"<table><tr><th>Objet</th><th>Date du vote</th><th class='right'>Montant total</th><th class='right'>Part de l unite</th><th>Modalites</th></tr>"+spList+"</table>":"<div>Aucune cotisation speciale en vigueur.</div>")
      +"<h2>Assurance du syndicat</h2><div>Expiration de la police: "+((sel&&sel.assurance_syndicat_exp)||"non renseignee")+"</div>"
      +"<br/><br/><div>_____________________________<br/>Signature d un administrateur ou du gestionnaire<br/><span class='muted'>Atteste en vertu de l article 1069 C.c.Q. Les montants sont etablis d apres les registres du syndicat en date de ce jour.</span></div>";
    imprimerHTML("Attestation de charges unite "+u.no_unite,html);
  }

  var totMoisDu=unites.reduce(function(a,u){return a+(Number(u.cotisation_mensuelle)||0)+specialesDues(u,mois);},0);
  var totMoisPaye=unites.reduce(function(a,u){var p=paiementDuMois(u,"cotisation");return a+(p&&p.statut==="paye"?Number(p.montant||0):0);},0);
  var totArr=unites.reduce(function(a,u){return a+calculArrerages(u).arrerages;},0);
  var nbPap=unites.filter(function(u){return u.pap_actif;}).length;

  // ----- FACTURES AUX COPROPRIETAIRES (frais, infractions, refacturation) -----
  var TYPES_FRAIS={frais:"Frais divers",infraction:"Avis d infraction (penalite)",refacturation:"Refacturation (dommages, cles...)"};
  function setFC(k,v){setNfFC(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}
  function creerFactureCopro(){
    if(enCours||!sel)return;
    if(!nfFC.unite){setErr("Choisissez l unite.");return;}
    if(!(parseFloat(nfFC.montant)>0)){setErr("Entrez un montant valide.");return;}
    if(!nfFC.description){setErr("La description est requise.");return;}
    setEnCours(true);setErr("");
    var u=unites.find(function(x){return x.no_unite===nfFC.unite;});
    var pr=u?propsDe(u)[0]:null;
    var annee=nfFC.date_facture.substring(0,4);
    var no="FC-"+annee+"-"+String(factCopros.filter(function(f){return (f.no_facture||"").indexOf("FC-"+annee)===0;}).length+1).padStart(3,"0");
    var row={syndicat_id:sel.id,unite_id:u?u.id:null,unite:nfFC.unite,coproprietaire_id:pr?pr.id:null,
      destinataire_nom:u?propsDe(u).map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(" et "):"",
      no_facture:no,type_frais:nfFC.type_frais,description:nfFC.description,
      montant:parseFloat(nfFC.montant)||0,date_facture:nfFC.date_facture,date_echeance:nfFC.date_echeance||null,statut:"emise"};
    sb.insert("factures_copros",row).then(function(r){
      setEnCours(false);
      if(!r||!r.data||!r.data.id){setErr("ECHEC: "+((r&&r.error&&r.error.message)||"la table factures_copros existe-t-elle? (SQL fourni)"));return;}
      setMsg("Facture "+no+" emise a l unite "+nfFC.unite+" ("+money(row.montant)+"). Imprimez-la et transmettez-la.");
      sb.log("encaissements","creation","Facture copro "+no+": unite "+nfFC.unite+" - "+TYPES_FRAIS[nfFC.type_frais]+" "+row.montant+" $","",sel.code||"");
      setShowFC(false);setNfFC({unite:"",type_frais:"frais",description:"",montant:"",date_facture:new Date().toISOString().substring(0,10),date_echeance:""});
      chargerTout();setTimeout(function(){setMsg("");},6000);
    }).catch(function(e){setEnCours(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }
  function payerFactureCopro(f){
    var auj=new Date().toISOString().substring(0,10);
    sb.update("factures_copros",f.id,{statut:"payee",date_paiement:auj}).then(function(r){
      if(r&&r.error){setErr("Echec: "+(r.error.message||""));return;}
      return sb.insert("paiements",{syndicat_id:sel.id,unite_id:f.unite_id,coproprietaire_id:f.coproprietaire_id,
        type:f.type_frais==="infraction"?"infraction":"frais",mois:auj.substring(0,7),date_paiement:auj,
        montant:Number(f.montant)||0,description:"Facture "+f.no_facture+" - "+(f.description||"").substring(0,80),statut:"paye",moyen:"facture_copro"});
    }).then(function(){
      sb.log("encaissements","paiement","Facture copro "+f.no_facture+" payee ("+f.montant+" $)","",sel.code||"");
      chargerTout();
    });
  }
  function annulerFactureCopro(f){
    sb.update("factures_copros",f.id,{statut:"annulee"}).then(function(){
      sb.log("encaissements","modification","Facture copro "+f.no_facture+" annulee","",sel.code||"");
      chargerTout();
    });
  }
  function imprimerFactureCopro(f){
    var h="<h1>"+(sel.nom||"")+"</h1><div class='muted'>"+(sel.adr||"")+(sel.ville?", "+sel.ville:"")+"</div>";
    h+="<h2 style='margin-top:18px'>FACTURE "+f.no_facture+"</h2>";
    h+="<table>";
    h+="<tr><th>Destinataire</th><td>"+(f.destinataire_nom||"Coproprietaire")+" - unite "+(f.unite||"")+"</td></tr>";
    h+="<tr><th>Type</th><td>"+(TYPES_FRAIS[f.type_frais]||f.type_frais)+"</td></tr>";
    h+="<tr><th>Description</th><td>"+(f.description||"")+"</td></tr>";
    h+="<tr><th>Date de la facture</th><td>"+(f.date_facture||"")+"</td></tr>";
    if(f.date_echeance)h+="<tr><th>Echeance de paiement</th><td><b>"+f.date_echeance+"</b></td></tr>";
    h+="<tr class='tot'><th>MONTANT DU</th><td><b>"+money(f.montant)+"</b></td></tr></table>";
    h+="<p style='margin-top:18px'>Priere d acquitter ce montant au plus tard a l echeance. Les montants impayes portent les interets et frais prevus a la declaration de copropriete.</p>";
    h+="<br/><p>Le Conseil d administration<br/>"+(sel.nom||"")+"</p>";
    imprimerHTML("Facture "+f.no_facture,h);
  }

  // ----- FICHIER DE PRELEVEMENTS BANCAIRES (DPA - standard Paiements Canada CPA-005) -----
  function pad(v,n,dir,ch){v=String(v==null?"":v);ch=ch||" ";if(v.length>n)return v.substring(0,n);var f="";for(var i=v.length;i<n;i++)f+=ch;return dir==="g"?f+v:v+f;}
  function dateJulienne(d){
    var dt=d?new Date(d+"T12:00:00"):new Date();
    var debut=new Date(dt.getFullYear(),0,0);
    var jour=Math.floor((dt-debut)/86400000);
    return "0"+String(dt.getFullYear()).substring(2)+pad(jour,3,"g","0");
  }
  function sauverDpaConfig(){
    sb.upsert("config_publique",[{cle:"dpa_config",valeur:JSON.stringify(dpa)}],"cle").then(function(r){
      if(r&&r.error){setErr("ECHEC sauvegarde config DPA: "+(r.error.message||""));return;}
      setMsg("Configuration DPA sauvegardee.");setShowDpaCfg(false);setTimeout(function(){setMsg("");},4000);
    });
  }
  function lignesPrelevement(){
    return unites.filter(function(u){return u.pap_actif&&u.banque_institution&&u.banque_transit&&u.banque_compte;})
      .map(function(u){
        var montant=(Number(u.cotisation_mensuelle)||0)+specialesDues(u,mois);
        var prs=propsDe(u);
        return {u:u,montant:Math.round(montant*100)/100,nom:prs.map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(" ").substring(0,30)||("Unite "+u.no_unite)};
      }).filter(function(l){return l.montant>0;});
  }
  function telecharger(nomFichier,contenu,type){
    var blob=new Blob([contenu],{type:type||"text/plain;charset=ascii"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);a.download=nomFichier;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
  }
  function genererDPA(){
    setErr("");
    if(!dpa.origId||!dpa.origNom){setErr("Configurez d abord le numero d emetteur (fourni par votre institution) - bouton Configuration DPA.");setShowDpaCfg(true);return;}
    var lignes=lignesPrelevement();
    if(lignes.length===0){setErr("Aucune unite avec PAP actif, coordonnees bancaires completes et montant du pour "+mois+".");return;}
    var noF=pad(parseInt(dpa.noFichier)||1,4,"g","0");
    var dateCrea=dateJulienne(null);
    var dateEch=dateJulienne(mois+"-01");
    var L=1464;
    var recs=[];var cnt=1;
    // Enregistrement A (entete)
    recs.push(pad("A"+pad(cnt,9,"g","0")+pad(dpa.origId,10)+noF+dateCrea+pad(dpa.centre||"",5,"g","0")+pad("",20)+"CAD",L));
    // Enregistrements D (debits) - code d operation CPA 316 = frais de copropriete
    var totalCents=0;
    lignes.forEach(function(l){
      cnt++;
      var cents=Math.round(l.montant*100);totalCents+=cents;
      var seg="316"+pad(cents,10,"g","0")+dateEch+"0"+pad(l.u.banque_institution,3,"g","0")+pad(l.u.banque_transit,5,"g","0")+pad(l.u.banque_compte,12)
        +pad("0",22,"g","0")+pad("0",3,"g","0")+pad(dpa.origNom,15)+pad(l.nom,30)+pad(dpa.origNom,30)
        +pad(dpa.origId,10)+pad("COTIS "+mois+" U"+l.u.no_unite,19)+pad("0",9,"g","0")+pad("",12)+pad("",15)+pad("0",22,"g","0")+pad("",2)+pad("0",11,"g","0");
      recs.push(pad("D"+pad(cnt,9,"g","0")+pad(dpa.origId,10)+noF+seg,L));
    });
    // Enregistrement Z (total)
    cnt++;
    recs.push(pad("Z"+pad(cnt,9,"g","0")+pad(dpa.origId,10)+noF+pad(totalCents,14,"g","0")+pad(lignes.length,8,"g","0")+pad("0",14,"g","0")+pad("0",8,"g","0"),L));
    telecharger("DPA_"+(sel.code||"syndicat")+"_"+mois+"_"+noF+".txt",recs.join("\r\n")+"\r\n");
    // Incremente le numero de fichier pour la prochaine generation
    var nSuiv=String((parseInt(dpa.noFichier)||1)+1);
    setDpa(Object.assign({},dpa,{noFichier:nSuiv}));
    sb.upsert("config_publique",[{cle:"dpa_config",valeur:JSON.stringify(Object.assign({},dpa,{noFichier:nSuiv}))}],"cle").catch(function(){});
    setMsg("Fichier DPA (CPA-005) genere: "+lignes.length+" prelevement(s), total "+money(totalCents/100)+". Transmettez-le a votre institution financiere.");
    sb.log("encaissements","creation","Fichier DPA "+mois+" genere: "+lignes.length+" prelevements, "+(totalCents/100).toFixed(2)+" $","",sel.code||"");
    setTimeout(function(){setMsg("");},8000);
  }
  function genererCSVBanque(){
    var lignes=lignesPrelevement();
    if(lignes.length===0){setErr("Aucune unite avec PAP actif, coordonnees bancaires completes et montant du pour "+mois+".");return;}
    var out=[["Unite","Nom","Institution","Transit","Compte","Montant","Date"]];
    lignes.forEach(function(l){out.push([l.u.no_unite,l.nom,l.u.banque_institution,l.u.banque_transit,l.u.banque_compte,l.montant.toFixed(2),mois+"-01"]);});
    telecharger("Prelevements_"+(sel.code||"syndicat")+"_"+mois+".csv","\uFEFF"+out.map(function(r){return r.join(";");}).join("\r\n"),"text/csv;charset=utf-8");
    setMsg("Fichier CSV des prelevements genere ("+lignes.length+" ligne(s)) - format simple pour verification ou depot manuel.");
    setTimeout(function(){setMsg("");},6000);
  }

  var TABS=[{id:"encaissements",l:"Encaissements du mois"},{id:"speciales",l:"Cotisations speciales"},{id:"factcopros",l:"Factures aux copros"},{id:"dpa",l:"Prelevements (DPA)"}];

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat.</div>;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Encaissements</div>
        <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <input type="month" value={mois} onChange={function(e){setMois(e.target.value);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"4px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}/>
        <div style={{display:"flex",marginLeft:"auto"}}>
          {TABS.map(function(t){var a=ong===t.id;return <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"3px solid #3CAF6E":"3px solid transparent",padding:"8px 16px",color:a?"#fff":"#9fb0c6",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:500}}>{t.l}</button>;})}
        </div>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        {ong==="encaissements"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
              <div style={{background:T.blueL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Du pour {mois}</div><div style={{fontSize:18,fontWeight:800,color:T.blue}}>{money(totMoisDu)}</div></div>
              <div style={{background:T.accentL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Encaisse pour {mois}</div><div style={{fontSize:18,fontWeight:800,color:T.accent}}>{money(totMoisPaye)}</div></div>
              <div style={{background:totArr>0?T.redL:T.alt,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Arrerages (exercice)</div><div style={{fontSize:18,fontWeight:800,color:totArr>0?T.red:T.muted}}>{money(totArr)}</div></div>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:12}}>
                <div style={{fontSize:10,color:T.muted}}>Interets de retard (%/an)</div>
                <input type="number" step="0.1" value={tauxInteret} onChange={function(e){sauverTaux(e.target.value);}} style={Object.assign({},INP,{width:90,fontWeight:800})}/>
              </div>
            </div>

            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              <Btn onClick={genererMois} dis={enCours}>Generer les cotisations de {mois}</Btn>
              <Btn bg={T.blue} onClick={encaisserLotPAP} dis={enCours}>{enCours?"Traitement...":"Encaisser le LOT PAP ("+nbPap+" unite(s))"}</Btn>
            </div>

            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:T.alt}}>
                  {["Unite","Proprietaire(s)","Cotisation","Speciale du mois","Statut "+mois,"Arrerages",""].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}
                </tr></thead>
                <tbody>
                  {unites.map(function(u){
                    var p=paiementDuMois(u,"cotisation");
                    var calc=calculArrerages(u);
                    var spDue=specialesDues(u,mois);
                    return(
                      <tr key={u.id} style={{borderTop:"1px solid "+T.border,background:detailU===u.id?T.accentL:"#fff"}}>
                        <td style={{padding:"7px 10px",fontWeight:800}}>{u.no_unite}{u.pap_actif&&<span style={{fontSize:8,color:T.accent,fontWeight:800,marginLeft:5}}>PAP</span>}</td>
                        <td style={{padding:"7px 10px",fontSize:11}}>{propsDe(u).map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(" et ")||"-"}</td>
                        <td style={{padding:"7px 10px",textAlign:"right"}}>{money(u.cotisation_mensuelle)}</td>
                        <td style={{padding:"7px 10px",textAlign:"right",color:spDue>0?T.purple:T.muted}}>{spDue>0?money(spDue):"-"}</td>
                        <td style={{padding:"7px 10px"}}>
                          {p&&p.statut==="paye"?<Bdg>PAYE le {String(p.date_paiement||"").substring(0,10)} ({p.moyen||"-"})</Bdg>
                            :p?<Bdg bg={T.amberL} c={T.amber}>EN ATTENTE</Bdg>
                            :<Bdg bg={T.alt} c={T.muted}>Non genere</Bdg>}
                        </td>
                        <td style={{padding:"7px 10px",textAlign:"right",fontWeight:700,color:calc.arrerages>0?T.red:T.accent}}>{calc.arrerages>0?money(calc.arrerages):"0,00 $"}</td>
                        <td style={{padding:"7px 10px"}}>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                            {(!p||p.statut!=="paye")&&<Btn sm onClick={function(){encaisser(u,"cheque");}}>Payer (cheque)</Btn>}
                            {(!p||p.statut!=="paye")&&<Btn sm bg={T.blue} onClick={function(){encaisser(u,"virement");}}>Virement</Btn>}
                            {p&&p.statut==="paye"&&<Btn sm bg={T.amberL} tc={T.amber} bdr={"1px solid "+T.amber+"44"} onClick={function(){annulerPaiement(u);}}>Annuler</Btn>}
                            <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){etatDeCompte(u);}}>Etat de compte</Btn>
                            <Btn sm bg={T.purple} onClick={function(){attestation(u);}}>Attestation notaire</Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {unites.length===0&&<tr><td colSpan={7} style={{padding:30,textAlign:"center",color:T.muted}}>Aucune unite - les cotisations proviennent du module Budget (Appliquer aux unites).</td></tr>}
                </tbody>
              </table>
            </div>
            <div style={{fontSize:10,color:T.muted,marginTop:8}}>Les cotisations mensuelles proviennent du module Budget (budget x quote-part / 12). Les arrerages sont calcules depuis le debut de l exercice courant.</div>
          </div>
        )}

        {ong==="speciales"&&(
          <div>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:18,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:10}}>Nouvelle cotisation speciale (repartie par quote-part automatiquement)</div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
                <div><Lbl l="Objet / titre"/><input value={nfSp.titre} onChange={function(e){setSp("titre",e.target.value);}} style={INP} placeholder="Refection de la toiture"/></div>
                <div><Lbl l="Montant TOTAL ($)"/><input type="number" step="0.01" value={nfSp.montant_total} onChange={function(e){setSp("montant_total",e.target.value);}} style={INP}/></div>
                <div><Lbl l="Date du vote (AG)"/><input type="date" value={nfSp.date_vote} onChange={function(e){setSp("date_vote",e.target.value);}} style={INP}/></div>
                <div><Lbl l="Nb versements"/><select value={nfSp.nb_versements} onChange={function(e){setSp("nb_versements",e.target.value);}} style={INP}>{["1","2","3","4","6","12","24"].map(function(x){return <option key={x} value={x}>{x}</option>;})}</select></div>
                <div><Lbl l="1er versement"/><input type="date" value={nfSp.date_premier_versement} onChange={function(e){setSp("date_premier_versement",e.target.value);}} style={INP}/></div>
              </div>
              {parseFloat(nfSp.montant_total)>0&&unites.length>0&&(
                <div style={{background:T.blueL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.blue,marginBottom:10}}>
                  Apercu: unite avec la plus grande quote-part = {money(Math.max.apply(null,unites.map(function(u){return (parseFloat(nfSp.montant_total)||0)*(parseFloat(u.fraction)||0)/100;})))} au total, reparti sur {nfSp.nb_versements} versement(s) mensuel(s).
                </div>
              )}
              <Btn onClick={creerSpeciale}>Creer la cotisation speciale</Btn>
            </div>

            {speciales.map(function(spx){
              return(
                <div key={spx.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:800,color:T.navy}}>{spx.titre}</div>
                      <div style={{fontSize:11,color:T.muted}}>Votee le {spx.date_vote||"-"} | {spx.nb_versements||1} versement(s) a partir de {String(spx.date_premier_versement||"").substring(0,10)||"-"}</div>
                    </div>
                    <div style={{fontSize:17,fontWeight:800,color:T.purple}}>{money(spx.montant_total)}</div>
                  </div>
                  <div style={{marginTop:8,maxHeight:170,overflowY:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead><tr style={{background:T.alt}}><th style={{padding:"4px 8px",textAlign:"left"}}>Unite</th><th style={{padding:"4px 8px",textAlign:"right"}}>Quote-part</th><th style={{padding:"4px 8px",textAlign:"right"}}>Part totale</th><th style={{padding:"4px 8px",textAlign:"right"}}>Par versement</th></tr></thead>
                      <tbody>
                        {unites.map(function(u){
                          var part=(Number(spx.montant_total)||0)*(parseFloat(u.fraction)||0)/100;
                          return <tr key={u.id} style={{borderTop:"1px solid "+T.border}}><td style={{padding:"3px 8px",fontWeight:700}}>{u.no_unite}</td><td style={{padding:"3px 8px",textAlign:"right"}}>{(parseFloat(u.fraction)||0).toFixed(3)} %</td><td style={{padding:"3px 8px",textAlign:"right"}}>{money(part)}</td><td style={{padding:"3px 8px",textAlign:"right",fontWeight:700}}>{money(part/(parseInt(spx.nb_versements)||1))}</td></tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            {speciales.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucune cotisation speciale.</div>}
          </div>
        )}

        {ong==="factcopros"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <div style={{fontSize:12,color:T.muted}}>
                {factCopros.length} facture(s) - impayees: <b style={{color:T.red}}>{money(factCopros.filter(function(f){return f.statut==="emise";}).reduce(function(a,f){return a+(Number(f.montant)||0);},0))}</b>
              </div>
              <Btn onClick={function(){setShowFC(true);setErr("");}}>+ Emettre une facture a un copro</Btn>
            </div>

            {showFC&&(
              <div style={{background:T.surface,border:"2px solid "+T.navy+"33",borderRadius:12,padding:16,marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:10}}>Nouvelle facture a un coproprietaire</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
                  <div><Lbl l="Unite"/><select value={nfFC.unite} onChange={function(e){setFC("unite",e.target.value);}} style={INP}>
                    <option value="">Choisir...</option>
                    {unites.map(function(u){return <option key={u.id} value={u.no_unite}>{u.no_unite}</option>;})}
                  </select></div>
                  <div><Lbl l="Type"/><select value={nfFC.type_frais} onChange={function(e){setFC("type_frais",e.target.value);}} style={INP}>
                    {Object.keys(TYPES_FRAIS).map(function(t){return <option key={t} value={t}>{TYPES_FRAIS[t]}</option>;})}
                  </select></div>
                  <div><Lbl l="Montant ($)"/><input type="number" step="0.01" value={nfFC.montant} onChange={function(e){setFC("montant",e.target.value);}} style={INP}/></div>
                  <div><Lbl l="Echeance"/><input type="date" value={nfFC.date_echeance} onChange={function(e){setFC("date_echeance",e.target.value);}} style={INP}/></div>
                  <div style={{gridColumn:"1/-1"}}><Lbl l="Description"/><input value={nfFC.description} onChange={function(e){setFC("description",e.target.value);}} style={INP} placeholder="ex: Penalite - avis d infraction du ... / Remplacement de cle / Reparation de dommages..."/></div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Btn onClick={creerFactureCopro} dis={enCours}>{enCours?"Emission...":"Emettre la facture"}</Btn>
                  <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowFC(false);}}>Annuler</Btn>
                </div>
              </div>
            )}

            {factCopros.length===0&&!showFC&&(
              <div style={{background:T.surface,border:"1px dashed "+T.border,borderRadius:12,padding:30,textAlign:"center",color:T.muted,fontSize:13}}>
                Aucune facture emise a un coproprietaire.<br/><span style={{fontSize:11}}>Frais divers, penalites d infraction, refacturation de dommages ou de cles.</span>
              </div>
            )}
            {factCopros.map(function(f){
              var st=f.statut==="payee"?{l:"PAYEE",c:T.accent,bg:T.accentL}:f.statut==="annulee"?{l:"ANNULEE",c:T.muted,bg:T.alt}:{l:"IMPAYEE",c:T.red,bg:T.redL};
              return(
                <div key={f.id} style={{background:T.surface,border:"1px solid "+T.border,borderLeft:"4px solid "+st.c,borderRadius:10,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <span style={{background:st.bg,color:st.c,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800,flexShrink:0}}>{st.l}</span>
                  <div style={{flex:1,minWidth:220}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{f.no_facture} - Unite {f.unite} - {TYPES_FRAIS[f.type_frais]||f.type_frais}</div>
                    <div style={{fontSize:11,color:T.muted}}>{f.destinataire_nom||""} - {f.description}</div>
                    <div style={{fontSize:10,color:T.muted}}>Emise le {f.date_facture}{f.date_echeance?" - echeance "+f.date_echeance:""}{f.date_paiement?" - payee le "+f.date_paiement:""}</div>
                  </div>
                  <div style={{fontSize:15,fontWeight:800,color:T.navy,flexShrink:0}}>{money(f.montant)}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>
                    <Btn sm bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){imprimerFactureCopro(f);}}>Imprimer</Btn>
                    {f.statut==="emise"&&<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){payerFactureCopro(f);}}>Marquer payee</Btn>}
                    {f.statut==="emise"&&<Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){annulerFactureCopro(f);}}>Annuler</Btn>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {ong==="dpa"&&(
          <div>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:8}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:T.navy}}>Retraits directs (debits preautorises) - {mois}</div>
                  <div style={{fontSize:11,color:T.muted}}>Fichier au standard Paiements Canada CPA-005 (code d operation 316 - frais de copropriete), a transmettre a votre institution financiere.</div>
                </div>
                <Btn sm bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){setShowDpaCfg(!showDpaCfg);}}>Configuration DPA</Btn>
              </div>
              {showDpaCfg&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,background:T.blueL,borderRadius:10,padding:12,marginBottom:10}}>
                  <div><Lbl l="No d emetteur (10 car., fourni par la banque)"/><input value={dpa.origId} onChange={function(e){setDpa(Object.assign({},dpa,{origId:e.target.value.toUpperCase().slice(0,10)}));}} style={INP}/></div>
                  <div><Lbl l="Nom d emetteur (syndicat)"/><input value={dpa.origNom} onChange={function(e){setDpa(Object.assign({},dpa,{origNom:e.target.value.slice(0,30)}));}} style={INP} placeholder={sel.nom}/></div>
                  <div><Lbl l="Centre de donnees (5 chiffres, optionnel)"/><input value={dpa.centre} onChange={function(e){setDpa(Object.assign({},dpa,{centre:e.target.value.replace(/\D/g,"").slice(0,5)}));}} style={INP}/></div>
                  <div><Lbl l="No du prochain fichier"/><input value={dpa.noFichier} onChange={function(e){setDpa(Object.assign({},dpa,{noFichier:e.target.value.replace(/\D/g,"").slice(0,4)}));}} style={INP}/></div>
                  <div style={{gridColumn:"1/-1"}}><Btn sm onClick={sauverDpaConfig}>Sauvegarder la configuration</Btn></div>
                </div>
              )}
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <Btn onClick={genererDPA}>Generer le fichier DPA (CPA-005)</Btn>
                <Btn bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={genererCSVBanque}>Exporter en CSV (verification)</Btn>
              </div>
            </div>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:T.alt}}>{["Unite","Coproprietaire(s)","Institution","Transit","Compte","Montant "+mois].map(function(h,ix){return <th key={h} style={{padding:"7px 10px",textAlign:ix===5?"right":"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}</tr></thead>
                <tbody>
                  {lignesPrelevement().map(function(l){return(
                    <tr key={l.u.id} style={{borderTop:"1px solid "+T.border}}>
                      <td style={{padding:"6px 10px",fontWeight:700}}>{l.u.no_unite}</td>
                      <td style={{padding:"6px 10px"}}>{l.nom}</td>
                      <td style={{padding:"6px 10px"}}>{l.u.banque_institution}</td>
                      <td style={{padding:"6px 10px"}}>{l.u.banque_transit}</td>
                      <td style={{padding:"6px 10px"}}>****{String(l.u.banque_compte||"").slice(-4)}</td>
                      <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800,color:T.accent}}>{money(l.montant)}</td>
                    </tr>
                  );})}
                  {lignesPrelevement().length===0&&<tr><td colSpan={6} style={{padding:20,textAlign:"center",color:T.muted}}>Aucune unite avec PAP ACTIF et coordonnees bancaires completes (module Unites) et montant du pour {mois}.</td></tr>}
                </tbody>
                <tfoot><tr style={{background:T.alt,borderTop:"2px solid "+T.navy}}>
                  <td colSpan={5} style={{padding:"7px 10px",fontWeight:800,color:T.navy}}>TOTAL ({lignesPrelevement().length} prelevement(s))</td>
                  <td style={{padding:"7px 10px",textAlign:"right",fontWeight:800,color:T.accent}}>{money(lignesPrelevement().reduce(function(a,l){return a+l.montant;},0))}</td>
                </tr></tfoot>
              </table>
            </div>
            <div style={{fontSize:10,color:T.muted,marginTop:8}}>Les coordonnees bancaires et le bouton PAP ACTIF se gerent sur chaque unite (module Unites). Le numero d emetteur DPA est fourni par votre institution lors de l adhesion au service de debits preautorises.</div>
          </div>
        )}
      </div>
    </div>
  );
}
