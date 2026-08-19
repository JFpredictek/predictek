// Encaissements v3 - UNE SEULE PAGE, UN SEUL TABLEAU
// Toutes les creances au meme endroit: cotisations mensuelles, versements de
// cotisations speciales, factures aux copros (frais, avis d infraction, refacturation).
// - Cases a cocher -> encaissement de GROUPE (date + compte de banque + credits d avance)
// - Fichier EFT Desjardins genere a partir de la selection (ou du lot PAP du mois)
// - Avances (Sommes dues aux coproprietaires - Contributions percues d avance)
// - Filtres unite / type / statut; bouton + Emettre une facture dans le haut
// Les cotisations speciales se CREENT dans Finances - Recevables - Cotisations speciales.

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
// (logo du SYNDICAT si configure dans Configuration du syndicat, sinon logo Predictek)
function imprimerHTML(titre, corpsHTML, logoSyn){
  var w=window.open("","_blank","width=900,height=700");
  if(!w)return;
  var logo=logoSyn||"";
  if(!logo){try{logo=localStorage.getItem("predictek_logo")||"";}catch(e){}}
  var entete=logo?"<div style='border-bottom:3px solid #1B5E3B;padding-bottom:10px;margin-bottom:12px'><img src='"+logo+"' style='height:52px'/></div>":"";
  w.document.write("<html><head><title>"+titre+"</title><style>body{font-family:Georgia,serif;color:#1C1A17;margin:36px;font-size:13px}h1{font-size:19px;margin:0 0 2px}h2{font-size:14px;border-bottom:2px solid #13233A;padding-bottom:4px;margin-top:22px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #999;padding:5px 8px;font-size:12px;text-align:left}th{background:#EDEBE4}.tot{font-weight:bold;background:#E8F2EC}.muted{color:#666;font-size:11px}.right{text-align:right}</style></head><body>"+entete+corpsHTML+"<script>window.print();</script></body></html>");
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
  var s13=useState("0");var tauxInteret=s13[0];var setTauxInteret=s13[1];
  var s14=useState([]);var factCopros=s14[0];var setFactCopros=s14[1];
  var s15=useState(false);var showFC=s15[0];var setShowFC=s15[1];
  var s16=useState({unite:"",type_frais:"frais",description:"",montant:"",date_facture:new Date().toISOString().substring(0,10),date_echeance:""});var nfFC=s16[0];var setNfFC=s16[1];
  var s19=useState(false);var showEnc=s19[0];var setShowEnc=s19[1];
  var s20=useState({unite:"",type:"interets",montant:"",date:new Date().toISOString().substring(0,10),moyen:"prelevement",note:"",compte:""});var encF=s20[0];var setEncF=s20[1];
  var s21=useState([]);var banques=s21[0];var setBanques=s21[1];
  var s22=useState([]);var avances=s22[0];var setAvances=s22[1];
  var s23=useState([]);var fichiersEft=s23[0];var setFichiersEft=s23[1];
  var s24=useState({});var selRows=s24[0];var setSelRows=s24[1];
  var s25=useState("");var fUnite=s25[0];var setFUnite=s25[1];
  var s26=useState("tous");var fStatut=s26[0];var setFStatut=s26[1];
  var s27=useState("tous");var fType=s27[0];var setFType=s27[1];
  var s28=useState(null);var encModal=s28[0];var setEncModal=s28[1];
  var s29=useState({date:new Date().toISOString().substring(0,10),compte:"",credit:true});var encOpt=s29[0];var setEncOpt=s29[1];
  var s30=useState(null);var editFCId=s30[0];var setEditFCId=s30[1];
  var s31=useState(false);var showAv=s31[0];var setShowAv=s31[1];
  var s32=useState({unite:"",montant:"",date:new Date().toISOString().substring(0,10),compte:"",note:""});var avF=s32[0];var setAvF=s32[1];
  var s33=useState(new Date().toISOString().substring(0,10));var datePrel=s33[0];var setDatePrel=s33[1];
  var s34=useState(false);var showEft=s34[0];var setShowEft=s34[1];

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
    sb.select("factures_copros",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:1000}).then(function(r){if(r&&r.data)setFactCopros(r.data);}).catch(function(){});
    sb.select("comptes_bancaires",{eq:{syndicat_id:sel.id},limit:20}).then(function(r){if(r&&r.data)setBanques(r.data);else setBanques([]);}).catch(function(){setBanques([]);});
    sb.select("avances_copros",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:500}).then(function(r){if(r&&r.data)setAvances(r.data);else setAvances([]);}).catch(function(){setAvances([]);});
    sb.select("fichiers_eft",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:200}).then(function(r){if(r&&r.data)setFichiersEft(r.data);else setFichiersEft([]);}).catch(function(){setFichiersEft([]);});
  }
  useEffect(function(){chargerTout();setSelRows({});},[sel&&sel.id]);

  function propsDe(u){
    return copros.filter(function(c){return c.statut!=="ancien"&&((c.unite_id&&c.unite_id===u.id)||(!c.unite_id&&c.unite===u.no_unite));});
  }
  function paiementDe(u,typ,leMois){
    return paiements.find(function(p){
      return p.unite_id===u.id&&(p.type||"cotisation")===typ&&(p.mois?p.mois===leMois:String(p.date_paiement||"").substring(0,7)===leMois)&&p.statut!=="annule";
    });
  }
  function paiementDuMois(u,typ){return paiementDe(u,typ,mois);}
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

  function encaisser(u,moyen){
    var existant=paiementDuMois(u,"cotisation");
    var pr=propsDe(u)[0];
    var auj=new Date().toISOString().substring(0,10);
    var cpt=moyen==="pap"?(sel.pap_compte_id||null):null;
    var op=existant
      ?sb.update("paiements",existant.id,{statut:"paye",moyen:moyen,date_paiement:auj,compte_bancaire_id:cpt})
      :sb.insert("paiements",{syndicat_id:sel.id,unite_id:u.id,coproprietaire_id:pr?pr.id:null,type:"cotisation",mois:mois,date_paiement:auj,montant:Number(u.cotisation_mensuelle)||0,description:"Cotisation "+MNOMS[parseInt(mois.substring(5,7))]+" "+mois.substring(0,4)+" - unite "+u.no_unite,statut:"paye",moyen:moyen,compte_bancaire_id:cpt});
    op.then(function(r){
      if(r&&r.error){setErr("Echec: "+(r.error.message||""));return;}
      sb.log("encaissements","paiement","Unite "+u.no_unite+" - cotisation "+mois+" payee ("+moyen+")","",sel.code||"");
      chargerTout();
    });
  }
  function annulerPaiement(p){
    if(!p)return;
    sb.update("paiements",p.id,{statut:"en_attente",moyen:""}).then(function(){chargerTout();});
  }

  function sauverTaux(v){
    setTauxInteret(v);
    sb.upsert("config_publique",[{cle:"taux_interet_retard",valeur:String(parseFloat(v)||0)}],"cle").catch(function(){});
  }

  // ===== ENCAISSEMENT LIBRE, UNITE PAR UNITE =====
  function encaisserLibre(){
    if(!sel)return;
    var encU=unites.find(function(x){return x.no_unite===encF.unite;});
    if(!encU){setErr("Choisissez l unite.");return;}
    var mnt=parseFloat(encF.montant)||0;
    if(mnt<=0){setErr("Entrez un montant positif.");return;}
    if(!encF.compte&&banques.length>0){setErr("Choisissez le compte de banque qui recoit les fonds.");return;}
    setErr("");
    var pr=propsDe(encU)[0];
    var TYPES_LBL={cotisation:"Cotisation",speciale:"Cotisation speciale",interets:"Interets de retard",frais:"Frais",infraction:"Infraction / penalite",refacturation:"Refacturation",autre:"Autre encaissement"};
    sb.insert("paiements",{
      syndicat_id:sel.id,unite_id:encU.id,coproprietaire_id:pr?pr.id:null,
      type:encF.type,mois:(encF.date||"").substring(0,7),date_paiement:encF.date,
      montant:mnt,moyen:encF.moyen,statut:"paye",compte_bancaire_id:encF.compte||null,
      description:(TYPES_LBL[encF.type]||encF.type)+" - unite "+encU.no_unite+(encF.note?" - "+encF.note.substring(0,120):"")
    }).then(function(r){
      if(r&&r.error){setErr("ECHEC de l encaissement: "+(r.error.message||"")+". Rien n a ete enregistre.");return;}
      if(!(r&&r.data&&r.data.id)){setErr("ECHEC de l encaissement - rien n a ete enregistre.");return;}
      setMsg("Encaissement de "+money(mnt)+" ("+(TYPES_LBL[encF.type]||encF.type)+", "+encF.moyen+") enregistre pour l unite "+encU.no_unite+".");
      sb.log("encaissements","paiement","Unite "+encU.no_unite+": "+(TYPES_LBL[encF.type]||encF.type)+" "+mnt.toFixed(2)+" $ ("+encF.moyen+")","",sel.code||"");
      setShowEnc(false);
      chargerTout();
      setTimeout(function(){setMsg("");},5000);
    }).catch(function(e){setErr("ECHEC: "+(e&&e.message?e.message:"erreur"));});
  }

  // ----- Etat de compte -----
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
    imprimerHTML("Etat de compte unite "+u.no_unite,html,sel.logo_data||"");
  }

  var totMoisDu=unites.reduce(function(a,u){return a+(Number(u.cotisation_mensuelle)||0)+specialesDues(u,mois);},0);
  var totMoisPaye=unites.reduce(function(a,u){var p=paiementDuMois(u,"cotisation");var ps=paiementDuMois(u,"speciale");return a+(p&&p.statut==="paye"?Number(p.montant||0):0)+(ps&&ps.statut==="paye"?Number(ps.montant||0):0);},0);
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
    if(editFCId){
      sb.update("factures_copros",editFCId,{unite_id:u?u.id:null,unite:nfFC.unite,coproprietaire_id:pr?pr.id:null,
        destinataire_nom:u?propsDe(u).map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(" et "):"",
        type_frais:nfFC.type_frais,description:nfFC.description,
        montant:parseFloat(nfFC.montant)||0,date_facture:nfFC.date_facture,date_echeance:nfFC.date_echeance||null}).then(function(r){
        setEnCours(false);
        if(r&&r.error){setErr("ECHEC de la modification: "+(r.error.message||""));return;}
        setMsg("Facture modifiee.");
        sb.log("encaissements","modification","Facture copro modifiee: unite "+nfFC.unite+" - "+(parseFloat(nfFC.montant)||0)+" $","",sel.code||"");
        setShowFC(false);setEditFCId(null);setNfFC({unite:"",type_frais:"frais",description:"",montant:"",date_facture:new Date().toISOString().substring(0,10),date_echeance:""});
        chargerTout();setTimeout(function(){setMsg("");},6000);
      }).catch(function(e){setEnCours(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
      return;
    }
    var annee=nfFC.date_facture.substring(0,4);
    var no="FC-"+annee+"-"+String(factCopros.filter(function(f){return (f.no_facture||"").indexOf("FC-"+annee)===0;}).length+1).padStart(3,"0");
    var row={syndicat_id:sel.id,unite_id:u?u.id:null,unite:nfFC.unite,coproprietaire_id:pr?pr.id:null,
      destinataire_nom:u?propsDe(u).map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(" et "):"",
      no_facture:no,type_frais:nfFC.type_frais,description:nfFC.description,
      montant:parseFloat(nfFC.montant)||0,date_facture:nfFC.date_facture,date_echeance:nfFC.date_echeance||null,statut:"emise"};
    sb.insert("factures_copros",row).then(function(r){
      setEnCours(false);
      if(!r||!r.data||!r.data.id){setErr("ECHEC: "+((r&&r.error&&r.error.message)||"la table factures_copros existe-t-elle? (SQL fourni)"));return;}
      setMsg("Facture "+no+" emise a l unite "+nfFC.unite+" ("+money(row.montant)+"). Utilisez Envoyer pour la rendre visible au portail du copro.");
      sb.log("encaissements","creation","Facture copro "+no+": unite "+nfFC.unite+" - "+TYPES_FRAIS[nfFC.type_frais]+" "+row.montant+" $","",sel.code||"");
      setShowFC(false);setNfFC({unite:"",type_frais:"frais",description:"",montant:"",date_facture:new Date().toISOString().substring(0,10),date_echeance:""});
      chargerTout();setTimeout(function(){setMsg("");},6000);
    }).catch(function(e){setEnCours(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  // ----- Comptes de banque / avances -----
  var FONDS_NOMS={operation:"Fonds d operation",prevoyance:"Fonds de prevoyance",assurance:"Fonds d auto-assurance",special:"Fonds de travaux speciaux"};
  function libBanque(b){
    if(!b)return "?";
    var nomF=FONDS_NOMS[b.fonds]||("Fonds "+(b.fonds||""));
    return (b.nom?b.nom+" - ":"")+nomF+(b.banque?" - "+b.banque:"")+(b.no_compte?" (***"+String(b.no_compte).slice(-4)+")":"");
  }

  // ===== TABLEAU UNIFIE: toutes les creances =====
  // cot: cotisation mensuelle du mois | spe: versement de speciale du mois | fc: facture copro
  function lignesTableau(){
    var rows=[];
    unites.forEach(function(u){
      if(Number(u.cotisation_mensuelle)>0){
        var p=paiementDuMois(u,"cotisation");
        rows.push({key:"cot:"+u.id,k:"cot",u:u,p:p,unite:u.no_unite,unite_id:u.id,
          ref:"COT-"+mois,desc:"Cotisation "+MNOMS[parseInt(mois.substring(5,7))]+" "+mois.substring(0,4),
          date:mois+"-01",montant:p?Number(p.montant)||0:(Number(u.cotisation_mensuelle)||0),
          statut:p?(p.statut==="paye"?"paye":p.statut==="rejete"?"rejete":"a_encaisser"):"a_encaisser"});
      }
      var spDue=specialesDues(u,mois);
      if(spDue>0){
        var ps=paiementDuMois(u,"speciale");
        rows.push({key:"spe:"+u.id,k:"spe",u:u,p:ps,unite:u.no_unite,unite_id:u.id,
          ref:"SPE-"+mois,desc:"Cotisation speciale - versement de "+MNOMS[parseInt(mois.substring(5,7))],
          date:mois+"-01",montant:ps?Number(ps.montant)||0:spDue,
          statut:ps?(ps.statut==="paye"?"paye":ps.statut==="rejete"?"rejete":"a_encaisser"):"a_encaisser"});
      }
    });
    factCopros.forEach(function(f){
      rows.push({key:"fc:"+f.id,k:"fc",f:f,unite:f.unite,unite_id:f.unite_id,
        ref:f.no_facture,desc:(TYPES_FRAIS[f.type_frais]||f.type_frais)+" - "+(f.description||""),
        date:String(f.date_facture||"").substring(0,10),montant:Number(f.montant)||0,
        statut:f.statut==="payee"?"paye":f.statut==="annulee"?"annulee":f.statut==="envoyee"?"envoyee":"a_encaisser"});
    });
    return rows;
  }
  function lignesFiltrees(){
    return lignesTableau().filter(function(r){
      if(fUnite&&r.unite!==fUnite)return false;
      if(fType!=="tous"&&r.k!==fType)return false;
      if(fStatut==="a_encaisser"&&!(r.statut==="a_encaisser"||r.statut==="envoyee"||r.statut==="rejete"))return false;
      else if(fStatut!=="tous"&&fStatut!=="a_encaisser"&&r.statut!==fStatut)return false;
      return true;
    });
  }
  function encaissable(r){return r.statut==="a_encaisser"||r.statut==="envoyee"||r.statut==="rejete";}

  // Estimation de l application des credits d avance sur une selection de lignes
  function estimerCredits(items){
    var pool={};
    avances.forEach(function(a){if(a.statut!=="annule")pool[a.unite_id]=(pool[a.unite_id]||0)+(Number(a.solde)||0);});
    var total=0;var credit=0;
    items.forEach(function(r){
      if(!encaissable(r))return;
      var mnt=Number(r.montant)||0;total+=mnt;
      var d=Math.min(pool[r.unite_id]||0,mnt);
      credit+=d;pool[r.unite_id]=(pool[r.unite_id]||0)-d;
    });
    return {total:Math.round(total*100)/100,credit:Math.round(credit*100)/100,banque:Math.round((total-credit)*100)/100};
  }
  function itemsSelectionnes(){
    var rows=lignesTableau();
    return Object.keys(selRows).filter(function(k){return selRows[k];}).map(function(k){
      return rows.find(function(r){return r.key===k;});
    }).filter(Boolean).filter(encaissable);
  }

  // Envoi de la facture au coproprietaire (visible dans son portail, Mes factures)
  function envoyerFC(f){
    sb.update("factures_copros",f.id,{statut:"envoyee",date_envoi:new Date().toISOString()}).then(function(r){
      if(r&&r.error){setErr("ECHEC de l envoi: "+(r.error.message||""));return;}
      setMsg("Facture "+f.no_facture+" marquee ENVOYEE - visible dans le portail du coproprietaire (Mes factures). Utilisez Imprimer pour la version papier/courriel.");
      sb.log("encaissements","modification","Facture copro "+f.no_facture+" envoyee au coproprietaire","",sel.code||"");
      chargerTout();setTimeout(function(){setMsg("");},7000);
    });
  }

  function editerFC(f){
    setEditFCId(f.id);
    setNfFC({unite:f.unite||"",type_frais:f.type_frais||"frais",description:f.description||"",montant:String(f.montant||""),date_facture:String(f.date_facture||"").substring(0,10),date_echeance:String(f.date_echeance||"").substring(0,10)});
    setShowFC(true);setErr("");
    window.scrollTo(0,0);
  }

  // Paiement d une ligne cot/spe (encaissement groupe)
  function payerLignePaiement(r,dateEnc,compteId,moyen,lot,creditNote){
    var typ=r.k==="spe"?"speciale":"cotisation";
    var pr=propsDe(r.u)[0];
    var descBase=(typ==="speciale"?"Cotisation speciale ":"Cotisation ")+MNOMS[parseInt(mois.substring(5,7))]+" "+mois.substring(0,4)+" - unite "+r.u.no_unite+(creditNote||"");
    if(r.p){
      if(r.p.statut==="paye")return Promise.resolve({data:r.p});
      return sb.update("paiements",r.p.id,{statut:"paye",moyen:moyen,date_paiement:dateEnc,compte_bancaire_id:compteId||null,lot:lot||""});
    }
    return sb.insert("paiements",{syndicat_id:sel.id,unite_id:r.u.id,coproprietaire_id:pr?pr.id:null,type:typ,mois:mois,date_paiement:dateEnc,montant:Number(r.montant)||0,description:descBase,statut:"paye",moyen:moyen,compte_bancaire_id:compteId||null,lot:lot||""});
  }

  // ENCAISSEMENT DE GROUPE : date + compte de banque, credits d avance appliques (FIFO par unite)
  async function confirmerEncaissement(){
    if(!encModal||!sel||enCours)return;
    if(!encOpt.date){setErr("Choisissez la date de l encaissement.");return;}
    if(!encOpt.compte){setErr("Choisissez le compte de banque qui recoit les fonds.");return;}
    setEnCours(true);setErr("");
    var items=encModal.items;
    var lot="LOT-"+encOpt.date.replace(/-/g,"")+"-"+String(items.length)+"L";
    var avc=avances.filter(function(a){return a.statut!=="annule"&&Number(a.solde)>0;}).map(function(a){return Object.assign({},a);});
    var oks=0;var echecs=[];var totCredit=0;var totBanque=0;
    for(var i=0;i<items.length;i++){
      var r=items[i];
      if(!encaissable(r))continue;
      var mnt=Number(r.montant)||0;
      var creditUse=0;var appliques=[];
      if(encOpt.credit){
        for(var j=0;j<avc.length&&creditUse<mnt;j++){
          var a=avc[j];
          if(a.unite_id!==r.unite_id)continue;
          var prendre=Math.min(Number(a.solde)||0,mnt-creditUse);
          if(prendre<=0)continue;
          prendre=Math.round(prendre*100)/100;
          creditUse+=prendre;a.solde=Math.round((Number(a.solde)-prendre)*100)/100;
          appliques.push({av:a,prendre:prendre});
        }
      }
      creditUse=Math.round(creditUse*100)/100;
      var banquePart=Math.round((mnt-creditUse)*100)/100;
      var moyen=creditUse>=mnt&&mnt>0?"credit_avance":(creditUse>0?"banque_et_credit":"encaissement");
      var creditNote=creditUse>0?" (credit d avance applique: "+creditUse.toFixed(2)+" $)":"";
      var okLigne=true;
      if(r.k==="fc"){
        var r1=await sb.update("factures_copros",r.f.id,{statut:"payee",date_paiement:encOpt.date,compte_bancaire_id:encOpt.compte||null});
        if(r1&&r1.error){echecs.push(r.ref+": "+(r1.error.message||""));okLigne=false;}
        else{
          var typ=r.f.type_frais==="infraction"?"infraction":r.f.type_frais==="refacturation"?"refacturation":"frais";
          var r2=await sb.insert("paiements",{syndicat_id:sel.id,unite_id:r.f.unite_id,coproprietaire_id:r.f.coproprietaire_id,type:typ,mois:encOpt.date.substring(0,7),date_paiement:encOpt.date,montant:mnt,statut:"paye",moyen:moyen,compte_bancaire_id:encOpt.compte||null,lot:lot,description:"Facture "+r.f.no_facture+" - "+(r.f.description||"").substring(0,80)+creditNote});
          if(r2&&r2.error)echecs.push(r.ref+" (paiement): "+(r2.error.message||""));
        }
      }else{
        var r3=await payerLignePaiement(r,encOpt.date,encOpt.compte,moyen,lot,creditNote);
        if(r3&&r3.error){echecs.push(r.ref+" unite "+r.unite+": "+(r3.error.message||""));okLigne=false;}
      }
      if(!okLigne)continue;
      for(var k2=0;k2<appliques.length;k2++){
        var ap=appliques[k2];
        var apps=[];
        try{apps=Array.isArray(ap.av.applications)?ap.av.applications.slice():JSON.parse(ap.av.applications||"[]");}catch(e){apps=[];}
        apps.push({q:encOpt.date,facture:r.ref+" (unite "+r.unite+")",montant:ap.prendre});
        ap.av.applications=apps;
        var r4=await sb.update("avances_copros",ap.av.id,{solde:ap.av.solde,applications:apps,statut:ap.av.solde<=0.004?"epuise":"actif"});
        if(r4&&r4.error)echecs.push("avance ("+r.ref+"): "+(r4.error.message||""));
        await sb.insert("journal",{syndicat_id:sel.id,date_transaction:encOpt.date,description:"Application d avance - "+r.ref+" (unite "+(r.unite||"")+")",categorie:"Contributions percues d avance",montant_debit:ap.prendre,montant_credit:0,reference:"AV-APP-"+r.ref}).catch(function(){});
      }
      totCredit+=creditUse;totBanque+=banquePart;oks++;
    }
    setEnCours(false);
    if(echecs.length>0)setErr("ECHEC sur "+echecs.length+" ligne(s): "+echecs.join(" | "));
    if(oks>0){
      var cpt=banques.find(function(b){return b.id===encOpt.compte;});
      setMsg(oks+" ligne(s) encaissee(s) le "+encOpt.date+" - compte: "+libBanque(cpt)+" - depot bancaire "+money(totBanque)+(totCredit>0?" + credits d avance appliques "+money(totCredit):"")+".");
      sb.log("encaissements","paiement",oks+" lignes encaissees ("+lot+"): banque "+totBanque.toFixed(2)+" $, credits "+totCredit.toFixed(2)+" $","",sel.code||"");
    }
    setEncModal(null);setSelRows({});
    chargerTout();setTimeout(function(){setMsg("");},10000);
  }

  // AVANCE : encaisser un solde d avance (passif 2400/2410 - Contributions percues d avance)
  function encaisserAvanceCopro(){
    if(!sel)return;
    var u=unites.find(function(x){return x.no_unite===avF.unite;});
    var mnt=parseFloat(avF.montant)||0;
    if(!u){setErr("Choisissez l unite.");return;}
    if(mnt<=0){setErr("Entrez un montant positif.");return;}
    if(!avF.compte){setErr("Choisissez le compte de banque qui recoit l avance.");return;}
    setErr("");
    var pr=propsDe(u)[0];
    sb.insert("avances_copros",{syndicat_id:sel.id,unite_id:u.id,coproprietaire_id:pr?pr.id:null,montant:mnt,solde:mnt,date_encaissement:avF.date,compte_bancaire_id:avF.compte,note:avF.note||"",statut:"actif"}).then(function(r){
      if(!r||!r.data||!r.data.id){setErr("ECHEC de l avance: "+((r&&r.error&&r.error.message)||"la table avances_copros existe-t-elle? (SQL fourni)"));return null;}
      return sb.insert("journal",{syndicat_id:sel.id,date_transaction:avF.date,description:"Avance recue - unite "+u.no_unite+(avF.note?" - "+avF.note.substring(0,80):""),categorie:"Contributions percues d avance",montant_debit:0,montant_credit:mnt,reference:"AV-"+u.no_unite+"-"+avF.date});
    }).then(function(r2){
      if(r2===null)return;
      setMsg("Avance de "+money(mnt)+" encaissee pour l unite "+u.no_unite+" (Sommes dues aux coproprietaires - Contributions percues d avance). Elle sera appliquee sur les prochaines lignes encaissees de cette unite.");
      sb.log("encaissements","paiement","Avance unite "+u.no_unite+": "+mnt.toFixed(2)+" $","",sel.code||"");
      setShowAv(false);setAvF({unite:"",montant:"",date:new Date().toISOString().substring(0,10),compte:"",note:""});
      chargerTout();setTimeout(function(){setMsg("");},10000);
    }).catch(function(e){setErr("ECHEC: "+(e&&e.message?e.message:""));});
  }

  // REBOND NSF : le prelevement a rebondi - paiement rejete + facture des frais NSF
  function rebondNSF(u,p){
    var frais=Number(sel.frais_nsf)||0;
    sb.update("paiements",p.id,{statut:"rejete"}).then(function(r){
      if(r&&r.error){setErr("ECHEC: "+(r.error.message||""));return null;}
      if(frais<=0)return {data:{skip:true}};
      var pr=propsDe(u)[0];
      var annee=new Date().toISOString().substring(0,4);
      var no="FC-"+annee+"-"+String(factCopros.filter(function(fz){return (fz.no_facture||"").indexOf("FC-"+annee)===0;}).length+1).padStart(3,"0");
      return sb.insert("factures_copros",{syndicat_id:sel.id,unite_id:u.id,unite:u.no_unite,coproprietaire_id:pr?pr.id:null,
        destinataire_nom:propsDe(u).map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(" et "),
        no_facture:no,type_frais:"frais",description:"Frais pour fonds insuffisants (NSF) - prelevement rejete du "+String(p.date_paiement||"").substring(0,10),
        montant:frais,date_facture:new Date().toISOString().substring(0,10),statut:"emise"});
    }).then(function(r2){
      if(r2===null)return;
      if(r2&&r2.error){setErr("Paiement marque rejete, mais ECHEC de la facture NSF: "+(r2.error.message||""));return;}
      setMsg("Prelevement de l unite "+u.no_unite+" marque REJETE (NSF)."+(frais>0?" Facture de frais NSF de "+money(frais)+" emise au coproprietaire.":" Aucun frais NSF configure (Configuration du syndicat)."));
      sb.log("encaissements","modification","Rebond NSF unite "+u.no_unite+(frais>0?" - frais "+frais.toFixed(2)+" $ refactures":""),"",sel.code||"");
      chargerTout();setTimeout(function(){setMsg("");},9000);
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
    imprimerHTML("Facture "+f.no_facture,h,sel.logo_data||"");
  }

  // ----- FICHIER EFT (format Desjardins / CPA-005, valide sur un vrai fichier accepte) -----
  function pad(v,n,dir,ch){v=String(v==null?"":v);ch=ch||" ";if(v.length>n)return v.substring(0,n);var f="";for(var i=v.length;i<n;i++)f+=ch;return dir==="g"?f+v:v+f;}
  function dateJulienne(d){
    var dt=d?new Date(d+"T12:00:00"):new Date();
    var debut=new Date(dt.getFullYear(),0,0);
    var jour=Math.floor((dt-debut)/86400000);
    return "0"+String(dt.getFullYear()).substring(2)+pad(jour,3,"g","0");
  }
  function telecharger(nomFichier,contenu,type){
    var blob=new Blob([contenu],{type:type||"text/plain;charset=ascii"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);a.download=nomFichier;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
  }
  // Lignes du lot PAP par defaut (toutes les unites PAP avec montant du pour le mois)
  function lignesPrelevement(){
    return unites.filter(function(u){return u.pap_actif&&u.banque_institution&&u.banque_transit&&u.banque_compte;})
      .map(function(u){
        var montant=0;var refs=[];
        var p=paiementDuMois(u,"cotisation");
        if(Number(u.cotisation_mensuelle)>0&&(!p||p.statut!=="paye")){montant+=p?Number(p.montant)||0:Number(u.cotisation_mensuelle)||0;refs.push({k:"cot",u:u.id});}
        var spDue=specialesDues(u,mois);
        var ps=paiementDuMois(u,"speciale");
        if(spDue>0&&(!ps||ps.statut!=="paye")){montant+=ps?Number(ps.montant)||0:spDue;refs.push({k:"spe",u:u.id});}
        return {u:u,montant:Math.round(montant*100)/100,refs:refs};
      }).filter(function(l){return l.montant>0;});
  }
  // Lignes EFT a partir de la SELECTION du tableau (regroupees par unite)
  function lignesDepuisSelection(items){
    var parUnite={};var sansCoord=[];
    items.forEach(function(r){
      var u=r.u||unites.find(function(x){return x.id===r.unite_id;});
      if(!u){sansCoord.push("unite "+(r.unite||"?")+" introuvable");return;}
      if(!u.banque_institution||!u.banque_transit||!u.banque_compte){if(sansCoord.indexOf(u.no_unite)<0)sansCoord.push(u.no_unite);return;}
      if(!parUnite[u.id])parUnite[u.id]={u:u,montant:0,refs:[]};
      parUnite[u.id].montant=Math.round((parUnite[u.id].montant+(Number(r.montant)||0))*100)/100;
      parUnite[u.id].refs.push(r.k==="fc"?{k:"fc",id:r.f.id}:{k:r.k,u:u.id});
    });
    return {lignes:Object.keys(parUnite).map(function(k){return parUnite[k];}).filter(function(l){return l.montant>0;}),sansCoord:sansCoord};
  }
  function genererEFT(){
    setErr("");
    var origId=(sel.pap_orig_id||"").trim();
    var nomCourt=(sel.pap_nom_court||"").trim();
    var nomLong=(sel.pap_nom_long||sel.nom||"").trim();
    var centre=((sel.pap_centre||"81510").replace(/\D/g,"")||"81510");
    var cptSyn=banques.find(function(b){return b.id===sel.pap_compte_id;});
    if(!origId||!nomCourt){setErr("Configurez d abord les prelevements (nom d utilisateur, noms COURT et LONG) dans Configuration - Configuration du syndicat, carte Prelevements automatises.");return;}
    if(!cptSyn||!cptSyn.institution||!cptSyn.transit||!cptSyn.no_compte){setErr("Choisissez le compte de banque du syndicat (institution, transit et no de compte remplis) dans Configuration du syndicat, carte Prelevements automatises.");return;}
    var items=itemsSelectionnes();
    var lignes;var refsAll=[];
    if(items.length>0){
      var res=lignesDepuisSelection(items);
      if(res.sansCoord.length>0){setErr("Coordonnees bancaires MANQUANTES (module Unites) pour: "+res.sansCoord.join(", ")+". Retirez ces lignes de la selection ou completez les coordonnees.");return;}
      lignes=res.lignes;
      lignes.forEach(function(l){refsAll=refsAll.concat(l.refs);});
      if(lignes.length===0){setErr("La selection ne contient aucune ligne a prelever.");return;}
    }else{
      lignes=lignesPrelevement();
      lignes.forEach(function(l){refsAll=refsAll.concat(l.refs);});
      if(lignes.length===0){setErr("Aucune unite avec PAP actif, coordonnees bancaires completes et montant du pour "+mois+". Cochez des lignes du tableau pour un fichier sur mesure.");return;}
    }
    var noF=pad(parseInt(sel.pap_no_fichier)||1,4,"g","0");
    var dateJ=dateJulienne(datePrel);
    var L=1464;var recs=[];var cnt=1;
    recs.push(pad("A"+pad(cnt,9,"g","0")+pad(origId,10)+noF+dateJ+pad(centre,5,"g","0")+pad("",20)+"CAD",L));
    var totalCents=0;
    lignes.forEach(function(l){
      cnt++;
      var cents=Math.round(l.montant*100);totalCents+=cents;
      var seg="450"+pad(cents,10,"g","0")+dateJ
        +"0"+pad(String(l.u.banque_institution).replace(/\D/g,""),3,"g","0")+pad(String(l.u.banque_transit).replace(/\D/g,""),5,"g","0")+pad(l.u.banque_compte,12)
        +pad("0",22,"g","0")+pad("0",3,"g","0")
        +pad(nomCourt,15)
        +pad("Compte de paiement - Unite "+l.u.no_unite,30)
        +pad(nomLong,30)
        +pad(origId,10)
        +pad(String(l.u.no_unite).replace(/\D/g,"")||String(cnt),19,"g","0")
        +"0"+pad(String(cptSyn.institution).replace(/\D/g,""),3,"g","0")+pad(String(cptSyn.transit).replace(/\D/g,""),5,"g","0")+pad(cptSyn.no_compte,12);
      recs.push(pad("D"+pad(cnt,9,"g","0")+pad(origId,10)+noF+pad(seg,240),L));
    });
    cnt++;
    recs.push(pad("Z"+pad(cnt,9,"g","0")+pad(origId,10)+noF+pad(totalCents,14,"g","0")+pad(lignes.length,8,"g","0")+pad("0",14,"g","0")+pad("0",8,"g","0")+pad("0",14,"g","0")+pad("0",8,"g","0")+pad("0",14,"g","0")+pad("0",8,"g","0"),L));
    var contenu=recs.join("\n");
    var nomFichier=datePrel.replace(/-/g,"_")+"-"+noF+".txt";
    telecharger(nomFichier,contenu);
    var rowEft={syndicat_id:sel.id,type_dc:"D",no_fichier:noF,date_fichier:datePrel,nom_fichier:nomFichier,nb_transferts:lignes.length,montant_total:totalCents/100,contenu:contenu,statut:"genere",refs:refsAll};
    sb.insert("fichiers_eft",rowEft).then(function(r){
      if(!r||!r.data||!r.data.id){
        // Si la colonne refs n existe pas encore (SQL non execute), on reessaie sans elle
        var row2=Object.assign({},rowEft);delete row2.refs;
        return sb.insert("fichiers_eft",row2).then(function(r2){
          if(!r2||!r2.data||!r2.data.id){setErr("Fichier telecharge, mais ECHEC de l enregistrement au registre: "+((r&&r.error&&r.error.message)||"table fichiers_eft manquante (SQL fourni)"));return;}
          finirEft();
        });
      }
      finirEft();
      function finirEft(){
        var nSuiv=String((parseInt(sel.pap_no_fichier)||1)+1);
        sb.update("syndicats",sel.id,{pap_no_fichier:nSuiv}).then(function(){setSel(Object.assign({},sel,{pap_no_fichier:nSuiv}));});
        setSelRows({});
        chargerTout();
      }
    });
    setMsg("Fichier EFT "+nomFichier+" genere ("+(items.length>0?"a partir de la SELECTION":"lot PAP du mois")+"): "+lignes.length+" prelevement(s), total "+money(totalCents/100)+". Transmettez-le a votre institution puis confirmez les etapes au registre.");
    sb.log("encaissements","creation","Fichier EFT "+nomFichier+": "+lignes.length+" prelevements, "+(totalCents/100).toFixed(2)+" $","",sel.code||"");
    setTimeout(function(){setMsg("");},10000);
  }

  function retelechargerEft(fx){
    if(!fx.contenu){setErr("Ce fichier n a pas de contenu enregistre.");return;}
    telecharger(fx.nom_fichier||("EFT_"+fx.no_fichier+".txt"),fx.contenu);
  }

  // Confirmations du registre EFT. La confirmation de COMPLETION d un fichier D
  // encaisse automatiquement les lignes visees au compte configure.
  function confirmerEft(fx,champ){
    var maj={};maj[champ]=new Date().toISOString();
    sb.update("fichiers_eft",fx.id,maj).then(function(r){
      if(r&&r.error){setErr("ECHEC: "+(r.error.message||""));return;}
      sb.log("encaissements","modification","Fichier EFT "+(fx.nom_fichier||fx.no_fichier)+": "+champ.replace("confirme_","confirmation "),"",sel.code||"");
      if(champ==="confirme_completion"&&fx.type_dc==="D"){
        encaisserRefsEft(fx);
      }else{
        chargerTout();
      }
    });
  }
  async function encaisserRefsEft(fx){
    var dateEnc=String(fx.date_fichier||"").substring(0,10)||new Date().toISOString().substring(0,10);
    var refs=[];
    try{refs=Array.isArray(fx.refs)?fx.refs:JSON.parse(fx.refs||"[]");}catch(e){refs=[];}
    if(refs.length===0){
      // Ancien fichier sans refs: lot PAP classique du mois courant
      refs=unites.filter(function(u){return u.pap_actif&&Number(u.cotisation_mensuelle)>0;}).map(function(u){return {k:"cot",u:u.id};});
    }
    var ok=0;var echecs=[];
    for(var i=0;i<refs.length;i++){
      var rf=refs[i];
      if(rf.k==="fc"){
        var f=factCopros.find(function(x){return x.id===rf.id;});
        if(!f||f.statut==="payee"||f.statut==="annulee")continue;
        var ru=await sb.update("factures_copros",f.id,{statut:"payee",date_paiement:dateEnc,compte_bancaire_id:sel.pap_compte_id||null});
        if(ru&&ru.error){echecs.push(f.no_facture+": "+(ru.error.message||""));continue;}
        var typ=f.type_frais==="infraction"?"infraction":f.type_frais==="refacturation"?"refacturation":"frais";
        await sb.insert("paiements",{syndicat_id:sel.id,unite_id:f.unite_id,coproprietaire_id:f.coproprietaire_id,type:typ,mois:dateEnc.substring(0,7),date_paiement:dateEnc,montant:Number(f.montant)||0,statut:"paye",moyen:"pap",compte_bancaire_id:sel.pap_compte_id||null,lot:fx.nom_fichier||"",description:"Facture "+f.no_facture+" - "+(f.description||"").substring(0,80)+" (EFT "+(fx.nom_fichier||"")+")"});
        ok++;
      }else{
        var u=unites.find(function(x){return x.id===rf.u;});
        if(!u)continue;
        var typ2=rf.k==="spe"?"speciale":"cotisation";
        var existant=paiementDuMois(u,typ2);
        var mnt=rf.k==="spe"?specialesDues(u,mois):(Number(u.cotisation_mensuelle)||0);
        var pr=propsDe(u)[0];
        var rr;
        if(existant){
          if(existant.statut==="paye"){continue;}
          rr=await sb.update("paiements",existant.id,{statut:"paye",moyen:"pap",date_paiement:dateEnc,compte_bancaire_id:sel.pap_compte_id||null,lot:fx.nom_fichier||""});
        }else{
          rr=await sb.insert("paiements",{syndicat_id:sel.id,unite_id:u.id,coproprietaire_id:pr?pr.id:null,type:typ2,mois:mois,date_paiement:dateEnc,montant:mnt,description:(typ2==="speciale"?"Cotisation speciale ":"Cotisation ")+MNOMS[parseInt(mois.substring(5,7))]+" "+mois.substring(0,4)+" - unite "+u.no_unite+" (PAP - "+(fx.nom_fichier||"")+")",statut:"paye",moyen:"pap",compte_bancaire_id:sel.pap_compte_id||null,lot:fx.nom_fichier||""});
        }
        if(rr&&rr.error)echecs.push("unite "+u.no_unite+": "+(rr.error.message||""));else ok++;
      }
    }
    if(echecs.length>0)setErr("Completion: ECHEC sur "+echecs.length+" ligne(s): "+echecs.join(" | "));
    setMsg("Completion confirmee: "+ok+" ligne(s) encaissee(s) (PAP) au compte configure.");
    sb.log("encaissements","paiement","Completion EFT "+(fx.nom_fichier||"")+": "+ok+" lignes encaissees","",sel.code||"");
    chargerTout();setTimeout(function(){setMsg("");},9000);
  }
  function supprimerEft(fx){
    sb.update("fichiers_eft",fx.id,{statut:"annule"}).then(function(r){
      if(r&&r.error){setErr("ECHEC: "+(r.error.message||""));return;}
      sb.log("encaissements","modification","Fichier EFT "+(fx.nom_fichier||fx.no_fichier)+" retire du registre","",sel.code||"");
      chargerTout();
    });
  }
  function genererCSVBanque(){
    var lignes=lignesPrelevement();
    if(lignes.length===0){setErr("Aucune unite avec PAP actif, coordonnees bancaires completes et montant du pour "+mois+".");return;}
    var out=[["Unite","Institution","Transit","Compte","Montant","Date"]];
    lignes.forEach(function(l){out.push([l.u.no_unite,l.u.banque_institution,l.u.banque_transit,l.u.banque_compte,l.montant.toFixed(2),mois+"-01"]);});
    telecharger("Prelevements_"+(sel.code||"syndicat")+"_"+mois+".csv","\uFEFF"+out.map(function(r){return r.join(";");}).join("\r\n"),"text/csv;charset=utf-8");
    setMsg("Fichier CSV des prelevements genere ("+lignes.length+" ligne(s)) - format simple pour verification ou depot manuel.");
    setTimeout(function(){setMsg("");},6000);
  }

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat.</div>;
  if(!sel)return null;

  var lignesAff=lignesFiltrees();
  var itemsSel=itemsSelectionnes();
  var estSel=itemsSel.length>0?estimerCredits(itemsSel):null;
  var avActives=avances.filter(function(a){return a.statut!=="annule"&&Number(a.solde)>0;});
  var encaissablesAff=lignesAff.filter(encaissable);
  var fichiersVisibles=fichiersEft.filter(function(fx){return fx.statut!=="annule";});

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Encaissements</div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn sm onClick={function(){setShowFC(true);setEditFCId(null);setNfFC({unite:"",type_frais:"frais",description:"",montant:"",date_facture:new Date().toISOString().substring(0,10),date_echeance:""});setErr("");window.scrollTo(0,0);}}>+ Emettre une facture</Btn>
          <Btn sm bg={T.purple} onClick={function(){setShowAv(true);setErr("");window.scrollTo(0,0);}}>+ Encaisser une avance</Btn>
          <Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){setShowEnc(true);setEncF({unite:"",type:"interets",montant:"",date:new Date().toISOString().substring(0,10),moyen:"prelevement",note:"",compte:banques.length===1?banques[0].id:(sel.pap_compte_id||"")});setErr("");window.scrollTo(0,0);}}>+ Autre encaissement</Btn>
          <Btn sm bg="#ffffff22" tc="#fff" bdr="1px solid #ffffff44" onClick={genererMois} dis={enCours}>Generer les cotisations</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          <div style={{background:T.blueL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Du pour {mois} (cotisations + speciales)</div><div style={{fontSize:18,fontWeight:800,color:T.blue}}>{money(totMoisDu)}</div></div>
          <div style={{background:T.accentL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Encaisse pour {mois}</div><div style={{fontSize:18,fontWeight:800,color:T.accent}}>{money(totMoisPaye)}</div></div>
          <div style={{background:totArr>0?T.redL:T.alt,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Arrerages (exercice)</div><div style={{fontSize:18,fontWeight:800,color:totArr>0?T.red:T.muted}}>{money(totArr)}</div></div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:12}}>
            <div style={{fontSize:10,color:T.muted}}>Interets de retard (%/an)</div>
            <input type="number" step="0.1" value={tauxInteret} onChange={function(e){sauverTaux(e.target.value);}} style={Object.assign({},INP,{width:90,fontWeight:800})}/>
          </div>
        </div>

        {avActives.length>0&&(
          <div style={{background:T.purpleL,border:"1px solid "+T.purple+"33",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:T.purple,marginBottom:6}}>CREDITS D AVANCE (Sommes dues aux coproprietaires - Contributions percues d avance)</div>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              {avActives.map(function(a){
                var u=unites.find(function(x){return x.id===a.unite_id;});
                return <div key={a.id} style={{fontSize:11,color:T.navy}}><b>Unite {u?u.no_unite:"?"}</b>: {money(a.solde)} <span style={{color:T.muted}}>(recu le {String(a.date_encaissement||"").substring(0,10)}{a.note?" - "+a.note:""})</span></div>;
              })}
            </div>
            <div style={{fontSize:10,color:T.muted,marginTop:6}}>Appliques automatiquement lors de l encaissement des lignes de l unite (case a cocher dans la fenetre d encaissement).</div>
          </div>
        )}

        {showAv&&(
          <div style={{background:T.surface,border:"2px solid "+T.purple,borderRadius:12,padding:16,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,color:T.purple,marginBottom:2}}>Encaisser une avance (paiement anticipe)</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Le montant est comptabilise au passif (Sommes dues aux coproprietaires - Contributions percues d avance) puis applique sur des factures et cotisations plus tard.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:10}}>
              <div><Lbl l="Unite"/><select value={avF.unite} onChange={function(e){setAvF(Object.assign({},avF,{unite:e.target.value}));}} style={INP}>
                <option value="">Choisir...</option>
                {unites.map(function(u){return <option key={u.id} value={u.no_unite}>{u.no_unite}</option>;})}
              </select></div>
              <div><Lbl l="Montant ($)"/><input type="number" step="0.01" min="0" value={avF.montant} onChange={function(e){setAvF(Object.assign({},avF,{montant:e.target.value}));}} style={INP}/></div>
              <div><Lbl l="Date de reception"/><input type="date" value={avF.date} onChange={function(e){setAvF(Object.assign({},avF,{date:e.target.value}));}} style={INP}/></div>
              <div><Lbl l="Compte de banque recu"/><select value={avF.compte} onChange={function(e){setAvF(Object.assign({},avF,{compte:e.target.value}));}} style={INP}>
                <option value="">Choisir...</option>
                {banques.map(function(b){return <option key={b.id} value={b.id}>{libBanque(b)}</option>;})}
              </select></div>
              <div><Lbl l="Note (optionnel)"/><input value={avF.note} onChange={function(e){setAvF(Object.assign({},avF,{note:e.target.value}));}} style={INP} placeholder="Cheque post-date, depot..."/></div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn bg={T.purple} onClick={encaisserAvanceCopro}>Encaisser l avance</Btn>
              <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowAv(false);}}>Annuler</Btn>
            </div>
          </div>
        )}

        {showFC&&(
          <div style={{background:T.surface,border:"2px solid "+T.navy+"33",borderRadius:12,padding:16,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:10}}>{editFCId?"Modifier la facture":"Nouvelle facture a un coproprietaire"}</div>
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
              <div style={{gridColumn:"1/-1"}}><Lbl l="Description"/><input value={nfFC.description} onChange={function(e){setFC("description",e.target.value);}} style={INP}/></div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={creerFactureCopro} dis={enCours}>{enCours?"Traitement...":(editFCId?"Sauvegarder la modification":"Emettre la facture")}</Btn>
              <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowFC(false);setEditFCId(null);}}>Annuler</Btn>
            </div>
          </div>
        )}

        {showEnc&&(
          <div style={{background:T.surface,border:"2px solid "+T.accent,borderRadius:12,padding:16,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:2}}>Autre encaissement (interets, frais, rattrapage...)</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Tout type d encaissement, pour n importe quelle unite - chaque type est comptabilise a son compte GL.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:12}}>
              <div><Lbl l="Unite"/>
                <select value={encF.unite} onChange={function(e){setEncF(Object.assign({},encF,{unite:e.target.value}));}} style={INP}>
                  <option value="">Choisir...</option>
                  {unites.map(function(u){return <option key={u.id} value={u.no_unite}>{u.no_unite}</option>;})}
                </select>
              </div>
              <div><Lbl l="Type d encaissement"/>
                <select value={encF.type} onChange={function(e){setEncF(Object.assign({},encF,{type:e.target.value}));}} style={INP}>
                  <option value="cotisation">Cotisation (rattrapage)</option>
                  <option value="speciale">Cotisation speciale</option>
                  <option value="interets">Interets de retard</option>
                  <option value="frais">Frais</option>
                  <option value="infraction">Infraction / penalite</option>
                  <option value="refacturation">Refacturation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div><Lbl l="Montant ($)"/><input type="number" step="0.01" min="0" value={encF.montant} onChange={function(e){setEncF(Object.assign({},encF,{montant:e.target.value}));}} style={INP} placeholder="0.00"/></div>
              <div><Lbl l="Date de l encaissement"/><input type="date" value={encF.date} onChange={function(e){setEncF(Object.assign({},encF,{date:e.target.value}));}} style={INP}/></div>
              <div><Lbl l="Moyen"/>
                <select value={encF.moyen} onChange={function(e){setEncF(Object.assign({},encF,{moyen:e.target.value}));}} style={INP}>
                  <option value="prelevement">Prelevement bancaire</option>
                  <option value="cheque">Cheque</option>
                  <option value="virement">Virement Interac</option>
                  <option value="comptant">Comptant</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div><Lbl l="Compte de banque recu"/>
                <select value={encF.compte} onChange={function(e){setEncF(Object.assign({},encF,{compte:e.target.value}));}} style={INP}>
                  <option value="">Choisir...</option>
                  {banques.map(function(b){return <option key={b.id} value={b.id}>{libBanque(b)}</option>;})}
                </select>
              </div>
              <div style={{gridColumn:"span 2"}}><Lbl l="Note / reference (optionnel)"/><input value={encF.note} onChange={function(e){setEncF(Object.assign({},encF,{note:e.target.value}));}} style={INP} placeholder="No de cheque, periode visee..."/></div>
            </div>
            {(function(){var uE=unites.find(function(x){return x.no_unite===encF.unite;});if(!uE)return null;var c2=calculArrerages(uE);return c2.interets>0?<div style={{fontSize:11,fontWeight:700,color:T.amber,marginBottom:10}}>Interets de retard calcules pour l unite {uE.no_unite}: {money(c2.interets)} (arrerages {money(c2.arrerages)} x {tauxInteret}%/an / 12)</div>:null;})()}
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={encaisserLibre} dis={!(parseFloat(encF.montant)>0)}>Enregistrer l encaissement</Btn>
              <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowEnc(false);}}>Annuler</Btn>
            </div>
          </div>
        )}

        {itemsSel.length>0&&estSel&&(
          <div style={{background:T.navy,borderRadius:10,padding:"10px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{fontSize:12,fontWeight:800,color:"#fff"}}>{itemsSel.length} ligne(s) selectionnee(s) - total {money(estSel.total)}</div>
            {estSel.credit>0&&<div style={{fontSize:11,color:"#c9b8e8"}}>credits d avance applicables: {money(estSel.credit)}</div>}
            <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <Btn sm onClick={function(){setEncModal({items:itemsSel});setEncOpt({date:new Date().toISOString().substring(0,10),compte:banques.length===1?banques[0].id:(sel.pap_compte_id||""),credit:true});setErr("");window.scrollTo(0,0);}}>Encaisser la selection</Btn>
              <input type="date" value={datePrel} onChange={function(e){setDatePrel(e.target.value);}} style={{border:"none",borderRadius:6,padding:"5px 8px",fontSize:11,fontFamily:"inherit"}}/>
              <Btn sm bg={T.blue} onClick={genererEFT}>Creer le fichier EFT (selection)</Btn>
              <Btn sm bg="#ffffff22" tc="#fff" bdr="1px solid #ffffff44" onClick={function(){setSelRows({});}}>Tout decocher</Btn>
            </div>
          </div>
        )}

        {encModal&&(function(){
          var est2=estimerCredits(encModal.items);
          return(
          <div style={{background:T.surface,border:"2px solid "+T.accent,borderRadius:12,padding:16,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:2}}>Encaissement de {encModal.items.length} ligne(s) - {money(est2.total)}</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Peu importe le moyen de paiement: choisissez la DATE de l encaissement et le COMPTE DE BANQUE qui recoit les fonds.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
              <div><Lbl l="Date de l encaissement"/><input type="date" value={encOpt.date} onChange={function(e){setEncOpt(Object.assign({},encOpt,{date:e.target.value}));}} style={INP}/></div>
              <div><Lbl l="Compte de banque recu"/><select value={encOpt.compte} onChange={function(e){setEncOpt(Object.assign({},encOpt,{compte:e.target.value}));}} style={INP}>
                <option value="">Choisir...</option>
                {banques.map(function(b){return <option key={b.id} value={b.id}>{libBanque(b)}</option>;})}
              </select></div>
              <div style={{alignSelf:"end"}}>
                <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:T.navy,cursor:"pointer"}}>
                  <input type="checkbox" checked={!!encOpt.credit} onChange={function(e){setEncOpt(Object.assign({},encOpt,{credit:e.target.checked}));}}/>
                  Appliquer les credits d avance ({money(est2.credit)})
                </label>
              </div>
            </div>
            <div style={{background:T.accentL,borderRadius:8,padding:"8px 12px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:10}}>
              Depot bancaire: {money(encOpt.credit?est2.banque:est2.total)}{encOpt.credit&&est2.credit>0?" + application de credits d avance: "+money(est2.credit):""}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={confirmerEncaissement} dis={enCours}>{enCours?"Encaissement...":"Confirmer l encaissement"}</Btn>
              <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setEncModal(null);}}>Annuler</Btn>
            </div>
          </div>
          );
        })()}

        <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap",marginBottom:10}}>
          <div style={{width:150}}><Lbl l="Mois / annee"/>
            <input type="month" value={mois} onChange={function(e){setMois(e.target.value);setSelRows({});}} style={INP}/>
          </div>
          <div style={{width:120}}><Lbl l="Unite"/>
            <select value={fUnite} onChange={function(e){setFUnite(e.target.value);}} style={INP}>
              <option value="">Toutes</option>
              {unites.map(function(u){return <option key={u.id} value={u.no_unite}>{u.no_unite}</option>;})}
            </select>
          </div>
          <div style={{width:170}}><Lbl l="Type de creance"/>
            <select value={fType} onChange={function(e){setFType(e.target.value);}} style={INP}>
              <option value="tous">Tous les types</option>
              <option value="cot">Cotisations</option>
              <option value="spe">Cotisations speciales</option>
              <option value="fc">Factures (frais, infractions...)</option>
            </select>
          </div>
          <div style={{width:170}}><Lbl l="Statut"/>
            <select value={fStatut} onChange={function(e){setFStatut(e.target.value);}} style={INP}>
              <option value="tous">Tous les statuts</option>
              <option value="a_encaisser">A encaisser</option>
              <option value="envoyee">Envoyees</option>
              <option value="paye">Payees</option>
              <option value="rejete">Rejetees (NSF)</option>
              <option value="annulee">Annulees</option>
            </select>
          </div>
          {(fUnite||fType!=="tous"||fStatut!=="tous")&&<Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setFUnite("");setFType("tous");setFStatut("tous");}}>Effacer les filtres</Btn>}
          <div style={{marginLeft:"auto",fontSize:11,color:T.muted}}>
            {lignesAff.length} ligne(s) - a encaisser (affichees): <b style={{color:T.red}}>{money(lignesAff.filter(encaissable).reduce(function(a,r){return a+(Number(r.montant)||0);},0))}</b> - {nbPap} unite(s) PAP
          </div>
        </div>

        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden",marginBottom:16}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:T.alt}}>
              <th style={{padding:"8px 10px",width:30}}>
                <input type="checkbox" checked={encaissablesAff.length>0&&encaissablesAff.every(function(r){return selRows[r.key];})} onChange={function(e){
                  var n=Object.assign({},selRows);
                  encaissablesAff.forEach(function(r){if(e.target.checked)n[r.key]=true;else delete n[r.key];});
                  setSelRows(n);
                }}/>
              </th>
              {["Type","No / Ref","Unite","Description","Date","Statut"].map(function(h){return <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}
              <th style={{padding:"8px 10px",textAlign:"right",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>Montant</th>
              <th style={{padding:"8px 10px"}}></th>
            </tr></thead>
            <tbody>
              {lignesAff.map(function(r){
                var typeB=r.k==="cot"?{l:"COTISATION",bg:T.blueL,c:T.blue}:r.k==="spe"?{l:"SPECIALE",bg:T.purpleL,c:T.purple}:r.f.type_frais==="infraction"?{l:"INFRACTION",bg:T.redL,c:T.red}:{l:"FACTURE",bg:T.amberL,c:T.amber};
                var st=r.statut==="paye"?{l:"PAYE le "+String((r.p&&r.p.date_paiement)||(r.f&&r.f.date_paiement)||"").substring(0,10)+(r.p&&r.p.moyen?" ("+r.p.moyen+")":""),bg:T.accentL,c:T.accent}
                  :r.statut==="annulee"?{l:"ANNULEE",bg:T.alt,c:T.muted}
                  :r.statut==="rejete"?{l:"REJETE (NSF)",bg:T.redL,c:T.red}
                  :r.statut==="envoyee"?{l:"ENVOYEE le "+String((r.f&&r.f.date_envoi)||"").substring(0,10),bg:T.blueL,c:T.blue}
                  :r.k==="fc"?{l:"EMISE (a envoyer)",bg:T.amberL,c:T.amber}
                  :{l:"A ENCAISSER",bg:T.amberL,c:T.amber};
                var arr=r.k==="cot"&&r.u?calculArrerages(r.u):null;
                return(
                  <tr key={r.key} style={{borderTop:"1px solid "+T.border,background:selRows[r.key]?T.blueL:"#fff"}}>
                    <td style={{padding:"6px 10px"}}>
                      {encaissable(r)&&<input type="checkbox" checked={!!selRows[r.key]} onChange={function(e){var n=Object.assign({},selRows);if(e.target.checked)n[r.key]=true;else delete n[r.key];setSelRows(n);}}/>}
                    </td>
                    <td style={{padding:"6px 10px"}}><Bdg bg={typeB.bg} c={typeB.c}>{typeB.l}</Bdg></td>
                    <td style={{padding:"6px 10px",fontWeight:700}}>{r.ref}</td>
                    <td style={{padding:"6px 10px",fontWeight:700}}>{r.unite}{r.u&&r.u.pap_actif&&<span style={{fontSize:8,color:T.accent,fontWeight:800,marginLeft:4}}>PAP</span>}</td>
                    <td style={{padding:"6px 10px"}}>
                      <div style={{fontSize:11,color:T.navy}}>{(r.desc||"").substring(0,80)}</div>
                      {arr&&arr.arrerages>0&&<div style={{fontSize:10,color:T.red,fontWeight:700}}>Arrerages exercice: {money(arr.arrerages)}{arr.interets>0?" + interets "+money(arr.interets)+"/mois":""}</div>}
                    </td>
                    <td style={{padding:"6px 10px",fontSize:11}}>{r.date}</td>
                    <td style={{padding:"6px 10px"}}><Bdg bg={st.bg} c={st.c}>{st.l}</Bdg></td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800,color:T.navy}}>{money(r.montant)}</td>
                    <td style={{padding:"6px 10px"}}>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                        {r.k!=="fc"&&encaissable(r)&&r.u&&r.u.pap_actif&&<Btn sm bg={T.navy} onClick={function(){encaisser(r.u,"pap");}}>PAP</Btn>}
                        {r.k==="fc"&&r.f.statut==="emise"&&<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){envoyerFC(r.f);}}>Envoyer au copro</Btn>}
                        {r.k==="fc"&&encaissable(r)&&<Btn sm bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){editerFC(r.f);}}>Modifier</Btn>}
                        {r.k==="fc"&&<Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){imprimerFactureCopro(r.f);}}>Imprimer</Btn>}
                        {r.k==="fc"&&encaissable(r)&&<Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){annulerFactureCopro(r.f);}}>Annuler</Btn>}
                        
                        {r.k==="cot"&&r.u&&<Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){etatDeCompte(r.u);}}>Etat de compte</Btn>}
                        {r.k!=="fc"&&r.p&&r.p.statut==="paye"&&(r.p.moyen==="pap"||r.p.moyen==="prelevement")&&<Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){rebondNSF(r.u,r.p);}}>Rebond NSF</Btn>}
                        {r.k!=="fc"&&r.p&&r.p.statut==="paye"&&<Btn sm bg={T.amberL} tc={T.amber} bdr={"1px solid "+T.amber+"44"} onClick={function(){annulerPaiement(r.p);}}>Annuler</Btn>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {lignesAff.length===0&&<tr><td colSpan={9} style={{padding:30,textAlign:"center",color:T.muted}}>Aucune ligne pour ces filtres. Les cotisations mensuelles proviennent du module Budget (Appliquer aux unites); les speciales de Finances - Recevables - Cotisations speciales.</td></tr>}
            </tbody>
            {lignesAff.length>0&&(
              <tfoot><tr style={{background:T.alt,borderTop:"2px solid "+T.navy}}>
                <td colSpan={7} style={{padding:"7px 10px",fontWeight:800,color:T.navy}}>A ENCAISSER (lignes affichees)</td>
                <td style={{padding:"7px 10px",textAlign:"right",fontWeight:800,color:T.red}}>{money(lignesAff.filter(encaissable).reduce(function(a,r){return a+(Number(r.montant)||0);},0))}</td>
                <td></td>
              </tr></tfoot>
            )}
          </table>
        </div>

        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",borderBottom:showEft?"1px solid "+T.border:"none",cursor:"pointer"}} onClick={function(){setShowEft(!showEft);}}>
            <div style={{fontSize:12,fontWeight:800,color:T.navy}}>Prelevements automatises (fichiers EFT Desjardins) - {fichiersVisibles.length} fichier(s)</div>
            <div style={{fontSize:10,color:T.muted}}>Emetteur: {sel.pap_orig_id||"NON CONFIGURE"} - prochain fichier #{pad(parseInt(sel.pap_no_fichier)||1,4,"g","0")} - configuration dans Configuration du syndicat</div>
            <div style={{marginLeft:"auto",fontSize:11,color:T.blue,fontWeight:700}}>{showEft?"Replier":"Afficher"}</div>
          </div>
          {showEft&&(
            <div>
              <div style={{padding:"10px 14px",display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
                <div style={{width:160}}><Lbl l="Date du prelevement"/><input type="date" value={datePrel} onChange={function(e){setDatePrel(e.target.value);}} style={INP}/></div>
                <Btn onClick={genererEFT}>+ Creer le fichier EFT {itemsSel.length>0?"("+itemsSel.length+" ligne(s) selectionnee(s))":"(lot PAP du mois)"}</Btn>
                <Btn bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={genererCSVBanque}>Exporter en CSV (verification)</Btn>
                <div style={{fontSize:10,color:T.muted}}>Sans selection: toutes les unites PAP avec montant du pour {mois}. Avec selection: exactement les lignes cochees.</div>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead><tr style={{background:T.alt}}>
                  {["D/C","# Fichier","Date","Nom de fichier","# Transferts","Montant","Telecharger","Confirmer trx","Confirmer l acceptation","Confirmer la completion",""].map(function(h,ix){return <th key={h+ix} style={{padding:"6px 8px",textAlign:ix===4||ix===5?"right":"left",fontSize:9,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}
                </tr></thead>
                <tbody>
                  {fichiersVisibles.map(function(fx){
                    function fmtTs(ts){return ts?String(ts).substring(0,16).replace("T"," "):"";}
                    return(
                      <tr key={fx.id} style={{borderTop:"1px solid "+T.border}}>
                        <td style={{padding:"6px 8px",fontWeight:800,color:fx.type_dc==="C"?T.blue:T.navy}}>{fx.type_dc||"D"}</td>
                        <td style={{padding:"6px 8px",fontWeight:700}}>{fx.no_fichier}</td>
                        <td style={{padding:"6px 8px"}}>{String(fx.date_fichier||"").substring(0,10)}</td>
                        <td style={{padding:"6px 8px"}}>{fx.nom_fichier}</td>
                        <td style={{padding:"6px 8px",textAlign:"right"}}>{fx.nb_transferts}</td>
                        <td style={{padding:"6px 8px",textAlign:"right",fontWeight:800,color:T.accent}}>{money(fx.montant_total)}</td>
                        <td style={{padding:"6px 8px"}}><Btn sm bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){retelechargerEft(fx);}}>Telecharger</Btn></td>
                        <td style={{padding:"6px 8px"}}>{fx.confirme_trx?<span style={{color:T.accent,fontWeight:700}}>{fmtTs(fx.confirme_trx)}</span>:<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){confirmerEft(fx,"confirme_trx");}}>Confirmer</Btn>}</td>
                        <td style={{padding:"6px 8px"}}>{fx.confirme_acceptation?<span style={{color:T.accent,fontWeight:700}}>{fmtTs(fx.confirme_acceptation)}</span>:<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){confirmerEft(fx,"confirme_acceptation");}}>Confirmer</Btn>}</td>
                        <td style={{padding:"6px 8px"}}>{fx.confirme_completion?<span style={{color:T.accent,fontWeight:700}}>{fmtTs(fx.confirme_completion)}</span>:<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){confirmerEft(fx,"confirme_completion");}}>Confirmer</Btn>}</td>
                        <td style={{padding:"6px 8px"}}><Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){supprimerEft(fx);}}>Retirer</Btn></td>
                      </tr>
                    );
                  })}
                  {fichiersVisibles.length===0&&<tr><td colSpan={11} style={{padding:16,textAlign:"center",color:T.muted}}>Aucun fichier EFT genere pour ce syndicat.</td></tr>}
                </tbody>
              </table>
              <div style={{padding:"8px 14px",fontSize:10,color:T.muted}}>Confirmer la COMPLETION d un fichier D encaisse automatiquement les lignes visees (PAP) au compte configure. Un prelevement qui rebondit se traite avec le bouton Rebond NSF de la ligne payee.</div>
            </div>
          )}
        </div>

        <div style={{fontSize:10,color:T.muted}}>Les cotisations speciales se creent et se repartissent dans Finances - Recevables - Cotisations speciales; leurs versements du mois apparaissent automatiquement dans le tableau ci-dessus. L attestation pour notaire est dans le module Unites.</div>
      </div>
    </div>
  );
}
