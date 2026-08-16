// Predictek - COMPTABILITE DE L ENTREPRISE
// Livres comptables de Predictek inc. - COMPLETEMENT DISTINCTS de la comptabilite des syndicats.
// Plan comptable d entreprise (salaires PAR POSTE), journal, etat des resultats imprimable,
// import automatique des revenus depuis la Facturation clients. Reserve aux administrateurs.
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
var money=function(n){return (Number(n)||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

// Plan comptable ENTREPRISE par defaut (societe de gestion de copropriete quebecoise)
var CHARTE_ENTREPRISE=[
  {no:"1000",nom:"Encaisse",type:"actif",groupe:"Actifs"},
  {no:"1100",nom:"Comptes clients (syndicats)",type:"actif",groupe:"Actifs"},
  {no:"1200",nom:"TPS a recevoir (CTI)",type:"actif",groupe:"Actifs"},
  {no:"1210",nom:"TVQ a recevoir (RTI)",type:"actif",groupe:"Actifs"},
  {no:"1500",nom:"Equipement informatique",type:"actif",groupe:"Actifs"},
  {no:"1600",nom:"Vehicules",type:"actif",groupe:"Actifs"},
  {no:"2000",nom:"Comptes fournisseurs",type:"passif",groupe:"Passifs"},
  {no:"2100",nom:"TPS a payer",type:"passif",groupe:"Passifs"},
  {no:"2110",nom:"TVQ a payer",type:"passif",groupe:"Passifs"},
  {no:"2200",nom:"DAS a payer (RRQ, RQAP, AE, FSS)",type:"passif",groupe:"Passifs"},
  {no:"2300",nom:"Marge de credit",type:"passif",groupe:"Passifs"},
  {no:"3000",nom:"Capital-actions",type:"capitaux",groupe:"Capitaux"},
  {no:"3100",nom:"Benefices non repartis",type:"capitaux",groupe:"Capitaux"},
  {no:"4000",nom:"Honoraires de gestion (syndicats)",type:"revenu",groupe:"Revenus"},
  {no:"4100",nom:"Frais de demarrage / integration",type:"revenu",groupe:"Revenus"},
  {no:"4200",nom:"Services additionnels (assemblees, rapports)",type:"revenu",groupe:"Revenus"},
  {no:"4500",nom:"Revenus d interets",type:"revenu",groupe:"Revenus"},
  {no:"4900",nom:"Autres revenus",type:"revenu",groupe:"Revenus"},
  {no:"5010",nom:"Salaires - Gestionnaire de copropriete",type:"depense",groupe:"Depenses - Salaires par poste"},
  {no:"5020",nom:"Salaires - Adjoint(e) administratif(ve)",type:"depense",groupe:"Depenses - Salaires par poste"},
  {no:"5030",nom:"Salaires - Comptable / technicien comptable",type:"depense",groupe:"Depenses - Salaires par poste"},
  {no:"5040",nom:"Salaires - Concierge / entretien menager",type:"depense",groupe:"Depenses - Salaires par poste"},
  {no:"5050",nom:"Salaires - Surintendant",type:"depense",groupe:"Depenses - Salaires par poste"},
  {no:"5060",nom:"Salaires - Maintenance",type:"depense",groupe:"Depenses - Salaires par poste"},
  {no:"5070",nom:"Salaires - Direction",type:"depense",groupe:"Depenses - Salaires par poste"},
  {no:"5080",nom:"Salaires - Support technique",type:"depense",groupe:"Depenses - Salaires par poste"},
  {no:"5090",nom:"Salaires - Autres postes",type:"depense",groupe:"Depenses - Salaires par poste"},
  {no:"5100",nom:"Charges patronales (RRQ, RQAP, AE, FSS, CNESST)",type:"depense",groupe:"Depenses - Salaires par poste"},
  {no:"5200",nom:"Loyer et charges du bureau",type:"depense",groupe:"Depenses d exploitation"},
  {no:"5210",nom:"Assurances de l entreprise",type:"depense",groupe:"Depenses d exploitation"},
  {no:"5220",nom:"Telecommunications et internet",type:"depense",groupe:"Depenses d exploitation"},
  {no:"5230",nom:"Logiciels et infonuagique",type:"depense",groupe:"Depenses d exploitation"},
  {no:"5240",nom:"Fournitures de bureau",type:"depense",groupe:"Depenses d exploitation"},
  {no:"5250",nom:"Honoraires professionnels (CPA, avocat)",type:"depense",groupe:"Depenses d exploitation"},
  {no:"5260",nom:"Frais bancaires et interets",type:"depense",groupe:"Depenses d exploitation"},
  {no:"5270",nom:"Vehicules - essence et entretien",type:"depense",groupe:"Depenses d exploitation"},
  {no:"5280",nom:"Publicite et marketing",type:"depense",groupe:"Depenses d exploitation"},
  {no:"5290",nom:"Formation",type:"depense",groupe:"Depenses d exploitation"},
  {no:"5300",nom:"Deplacements et repas d affaires",type:"depense",groupe:"Depenses d exploitation"},
  {no:"5900",nom:"Autres depenses",type:"depense",groupe:"Depenses d exploitation"}
];
var TYPES_LBL={actif:"Actif",passif:"Passif",capitaux:"Capitaux",revenu:"Revenu",depense:"Depense"};

function imprimerHTML(titre, corpsHTML){
  var w=window.open("","_blank","width=900,height=700");
  if(!w)return;
  w.document.write("<html><head><title>"+titre+"</title><style>body{font-family:Georgia,serif;color:#1C1A17;margin:36px;font-size:13px}h1{font-size:19px;margin:0 0 2px}h2{font-size:14px;border-bottom:2px solid #13233A;padding-bottom:4px;margin-top:22px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #999;padding:5px 8px;font-size:12px;text-align:left}th{background:#EDEBE4}.tot{font-weight:bold;background:#E8F2EC}.muted{color:#666;font-size:11px}.right{text-align:right}</style></head><body>"+corpsHTML+"<script>window.print();</script></body></html>");
  w.document.close();
}

function fichierFactureB64(file){
  return new Promise(function(resolve,reject){
    var isPdf=/pdf$/i.test(file.type)||/\.pdf$/i.test(file.name);
    var fr=new FileReader();
    fr.onerror=function(){reject(new Error("Lecture du fichier impossible"));};
    fr.onload=function(ev){
      var b64=String(ev.target.result).split(",")[1];
      if(isPdf){
        if(b64.length>4200000){reject(new Error("PDF trop volumineux (max ~3 Mo)"));return;}
        resolve({pdf:b64,ext:"pdf"});
      }else{
        var img=new Image();
        img.onload=function(){
          var cv=document.createElement("canvas");
          var sc=Math.min(1,1600/Math.max(img.width,img.height));
          cv.width=Math.round(img.width*sc);cv.height=Math.round(img.height*sc);
          cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
          resolve({images:[cv.toDataURL("image/jpeg",0.8).split(",")[1]],ext:"jpg"});
        };
        img.onerror=function(){reject(new Error("Image illisible"));};
        img.src=ev.target.result;
      }
    };
    fr.readAsDataURL(file);
  });
}

// Poste d employe -> compte de salaire (depenses par poste)
var POSTE_COMPTE={"Gestionnaire de copropriete":"5010","Adjoint(e) administratif(ve)":"5020","Comptable / technicien comptable":"5030","Concierge / entretien menager":"5040","Surintendant":"5050","Homme/femme de maintenance":"5060","Direction":"5070","Support technique":"5080"};
function compteDuPoste(poste){return POSTE_COMPTE[poste]||"5090";}

export default function PredictekCompta(){
  var s0=useState([]);var comptes=s0[0];var setComptes=s0[1];
  var s1=useState([]);var journal=s1[0];var setJournal=s1[1];
  var s2=useState("resultats");var ong=s2[0];var setOng=s2[1];
  var s3=useState(String(new Date().getFullYear()));var annee=s3[0];var setAnnee=s3[1];
  var s4=useState("");var msg=s4[0];var setMsg=s4[1];
  var s5=useState("");var err=s5[0];var setErr=s5[1];
  var s6=useState(false);var showN=s6[0];var setShowN=s6[1];
  var s7=useState({date_transaction:new Date().toISOString().substring(0,10),no_compte:"5230",description:"",debit:"",credit:"",reference:""});var nf=s7[0];var setNf=s7[1];
  var s8=useState([]);var factures=s8[0];var setFactures=s8[1];
  var s9=useState([]);var emps=s9[0];var setEmps=s9[1];
  var s10=useState(null);var ajoutGroupe=s10[0];var setAjoutGroupe=s10[1];
  var s11=useState({no:"",nom:"",type:"depense"});var nfc=s11[0];var setNfc=s11[1];
  var s12=useState(false);var enCours=s12[0];var setEnCours=s12[1];
  var s13=useState([]);var depenses=s13[0];var setDepenses=s13[1];
  var s14=useState(false);var showD=s14[0];var setShowD=s14[1];
  var s15=useState({fournisseur:"",no_facture:"",date_facture:"",sous_total:"",tps:"",tvq:"",total:"",no_compte:"5900",notes:""});var nfD=s15[0];var setNfD=s15[1];
  var s16=useState(null);var facFile=s16[0];var setFacFile=s16[1];
  var s17=useState(null);var apercuD=s17[0];var setApercuD=s17[1];
  var s18=useState("");var extraitMsg=s18[0];var setExtraitMsg=s18[1];
  var s19=useState(new Date().toISOString().substring(0,7));var moisPaie=s19[0];var setMoisPaie=s19[1];

  function charger(){
    sb.select("predictek_comptes",{limit:300}).then(function(r){
      var rows=(r&&r.data)||[];
      if(r&&r.error){setErr("Comptes inaccessibles: "+(r.error.message||"la table predictek_comptes existe-t-elle? (SQL fourni)"));return;}
      if(rows.length===0){
        var seed=CHARTE_ENTREPRISE.map(function(c){return {no_compte:c.no,nom_compte:c.nom,type_compte:c.type,groupe:c.groupe,actif:true};});
        sb.upsert("predictek_comptes",seed,"no_compte").then(function(r2){
          if(r2&&r2.error){setErr("Impossible d initialiser le plan comptable: "+(r2.error.message||""));return;}
          setComptes(r2&&r2.data?r2.data:[]);
        });
      }else setComptes(rows);
    }).catch(function(){});
    sb.select("predictek_journal",{order:"date_transaction.desc",limit:2000}).then(function(r){
      if(r&&r.data)setJournal(r.data);
    }).catch(function(){});
    sb.select("factures_clients",{order:"created_at.desc",limit:1000}).then(function(r){
      if(r&&r.data)setFactures(r.data);
    }).catch(function(){});
    sb.select("employes",{eq:{statut:"actif"},limit:500}).then(function(r){
      if(r&&r.data)setEmps(r.data);
    }).catch(function(){});
    sb.select("predictek_depenses",{order:"created_at.desc",limit:1000}).then(function(r){
      if(r&&r.data)setDepenses(r.data);
    }).catch(function(){});
  }
  useEffect(function(){charger();},[]);

  var cMap={};comptes.forEach(function(c){cMap[c.no_compte]=c;});
  var jrnAnnee=journal.filter(function(j){return (j.date_transaction||"").substring(0,4)===annee;});

  // ----- Etat des resultats (journal de l annee) -----
  function soldeCompte(no){
    var c=cMap[no];if(!c)return 0;
    var lignes=jrnAnnee.filter(function(j){return j.no_compte===no;});
    var deb=lignes.reduce(function(a,j){return a+(Number(j.debit)||0);},0);
    var cre=lignes.reduce(function(a,j){return a+(Number(j.credit)||0);},0);
    // Convention: revenus au credit, depenses au debit
    return c.type_compte==="revenu"?cre-deb:deb-cre;
  }
  var comptesRevenus=comptes.filter(function(c){return c.actif&&c.type_compte==="revenu";}).sort(function(a,b){return a.no_compte.localeCompare(b.no_compte);});
  var comptesDepenses=comptes.filter(function(c){return c.actif&&c.type_compte==="depense";}).sort(function(a,b){return a.no_compte.localeCompare(b.no_compte);});
  var totRev=comptesRevenus.reduce(function(a,c){return a+soldeCompte(c.no_compte);},0);
  var totDep=comptesDepenses.reduce(function(a,c){return a+soldeCompte(c.no_compte);},0);
  var resultat=totRev-totDep;

  // ----- References automatiques -----
  var factPayeesAnnee=factures.filter(function(f){return f.statut==="payee"&&(f.date_paiement||f.date_facture||"").substring(0,4)===annee;});
  var revFacturation=factPayeesAnnee.reduce(function(a,f){return a+(Number(f.sous_total)||0);},0);
  var dejaImportees=journal.filter(function(j){return j.source==="facturation";}).map(function(j){return j.reference;});
  var aImporter=factPayeesAnnee.filter(function(f){return dejaImportees.indexOf(f.no_facture)<0;});
  var masseSalariale=emps.reduce(function(a,e){var sal=parseFloat(e.salaire)||0;return a+sal+sal*((parseFloat(e.reserve_vacances_pct)||0)/100);},0);

  function importerFacturation(){
    if(aImporter.length===0||enCours)return;
    setEnCours(true);setErr("");setMsg("");
    var seq=Promise.resolve();var ok=0;
    aImporter.forEach(function(f){
      seq=seq.then(function(){
        return sb.insert("predictek_journal",{
          date_transaction:f.date_paiement||f.date_facture,no_compte:"4000",
          description:"Honoraires "+(f.client_nom||"")+" - "+(f.periode||""),
          debit:0,credit:Number(f.sous_total)||0,reference:f.no_facture,source:"facturation"
        }).then(function(r){if(r&&r.data&&r.data.id)ok++;});
      });
    });
    seq.then(function(){
      setEnCours(false);
      setMsg(ok+" facture(s) payee(s) importee(s) au compte 4000 (avant taxes).");
      sb.log("compta_predictek","creation",ok+" revenus de facturation importes au journal Predictek","","");
      charger();
      setTimeout(function(){setMsg("");},5000);
    }).catch(function(e){setEnCours(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  // ----- Journal -----
  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}
  function ajouterEcriture(){
    if(!nf.description||!nf.no_compte){setErr("Compte et description requis.");return;}
    if(!(parseFloat(nf.debit)>0)&&!(parseFloat(nf.credit)>0)){setErr("Entrez un montant au debit OU au credit.");return;}
    setErr("");
    sb.insert("predictek_journal",{
      date_transaction:nf.date_transaction,no_compte:nf.no_compte,description:nf.description,
      debit:parseFloat(nf.debit)||0,credit:parseFloat(nf.credit)||0,reference:nf.reference||"",source:"manuel"
    }).then(function(r){
      if(!r||!r.data||!r.data.id){setErr("ECHEC de l ecriture: "+((r&&r.error&&r.error.message)||"erreur"));return;}
      sb.log("compta_predictek","creation","Ecriture: "+nf.description.substring(0,60)+" ("+(nf.debit||nf.credit)+" $)","","");
      setShowN(false);setNf({date_transaction:new Date().toISOString().substring(0,10),no_compte:nf.no_compte,description:"",debit:"",credit:"",reference:""});
      charger();
    });
  }

  // ----- Plan comptable -----
  function basculerCompte(c){
    sb.update("predictek_comptes",c.id,{actif:!c.actif}).then(function(r){
      if(r&&r.error){setErr("Echec: "+(r.error.message||""));return;}
      charger();
    });
  }
  function ajouterCompte(groupe){
    if(!nfc.no||!nfc.nom){setErr("Numero et nom requis.");return;}
    if(comptes.some(function(x){return x.no_compte===nfc.no;})){setErr("Le compte "+nfc.no+" existe deja.");return;}
    sb.insert("predictek_comptes",{no_compte:nfc.no,nom_compte:nfc.nom,type_compte:nfc.type,groupe:groupe,actif:true}).then(function(r){
      if(!r||!r.data||!r.data.id){setErr("ECHEC de l ajout: "+((r&&r.error&&r.error.message)||""));return;}
      setMsg("Compte "+nfc.no+" ajoute.");setNfc({no:"",nom:"",type:"depense"});setAjoutGroupe(null);
      charger();setTimeout(function(){setMsg("");},4000);
    });
  }

  // ----- DEPENSES FOURNISSEURS (reconnaissance IA comme le module des syndicats) -----
  var comptesDepListe=comptesDepenses.map(function(c){return {no:c.no_compte,nom:c.nom_compte};});
  function setD(k,v){setNfD(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function extraireDepense(file){
    setExtraitMsg("Extraction automatique de la facture en cours...");
    fichierFactureB64(file).then(function(src){
      var corps={mode:"facture",comptes:comptesDepListe};
      if(src.pdf)corps.pdf=src.pdf;if(src.images)corps.images=src.images;
      return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify(corps)}).then(function(r){return r.json();});
    }).then(function(resp){
      if(!resp||resp.error){setExtraitMsg("Extraction impossible ("+((resp&&resp.error)||"erreur")+") - saisissez manuellement.");return;}
      var d=resp.data||{};var pris=[];
      if(d.fournisseur){setD("fournisseur",d.fournisseur);pris.push(d.fournisseur);}
      if(d.numero){setD("no_facture",d.numero);pris.push("#"+d.numero);}
      if(d.date&&/^\d{4}-\d{2}-\d{2}$/.test(d.date))setD("date_facture",d.date);
      if(d.sousTotal)setD("sous_total",Number(d.sousTotal));
      if(d.tps)setD("tps",Number(d.tps));
      if(d.tvq)setD("tvq",Number(d.tvq));
      if(d.total){setD("total",Number(d.total));pris.push(Number(d.total).toFixed(2)+" $");}
      if(d.description)setD("notes",d.description);
      if(d.noCompteGL&&comptesDepListe.some(function(c){return c.no===String(d.noCompteGL);})){setD("no_compte",String(d.noCompteGL));var cg=comptesDepListe.find(function(c){return c.no===String(d.noCompteGL);});pris.push("Compte "+d.noCompteGL+" ("+(cg?cg.nom:"")+")");}
      setExtraitMsg(pris.length>0?"Extrait automatiquement: "+pris.join(", ")+" - verifiez avant de sauvegarder.":"Aucune information lisible - saisissez manuellement.");
    }).catch(function(e){setExtraitMsg("Extraction impossible ("+e.message+") - saisissez manuellement.");});
  }

  function sauverDepense(){
    if(enCours)return;
    if(!nfD.fournisseur){setErr("Le nom du fournisseur est requis.");return;}
    if(!nfD.date_facture){setErr("La date de la facture est requise.");return;}
    setEnCours(true);setErr("");setMsg("");
    var row={fournisseur:nfD.fournisseur,no_facture:nfD.no_facture||"",date_facture:nfD.date_facture,
      sous_total:parseFloat(nfD.sous_total)||0,tps:parseFloat(nfD.tps)||0,tvq:parseFloat(nfD.tvq)||0,
      total:parseFloat(nfD.total)||((parseFloat(nfD.sous_total)||0)+(parseFloat(nfD.tps)||0)+(parseFloat(nfD.tvq)||0)),
      no_compte:nfD.no_compte||"5900",statut:"a_payer",notes:nfD.notes||""};
    sb.insert("predictek_depenses",row).then(function(r){
      if(!r||!r.data||!r.data.id){setEnCours(false);setErr("ECHEC de la sauvegarde: "+((r&&r.error&&r.error.message)||"verifiez que la table predictek_depenses existe (SQL fourni)"));return null;}
      var depId=r.data.id;
      var suite=Promise.resolve();
      if(facFile){
        var ext=(facFile.name.split(".").pop()||"pdf").toLowerCase().replace(/[^a-z0-9]/g,"");
        var chemin="predictek/depenses/"+depId+"."+ext;
        suite=sb.uploadFichier("preuves",chemin,facFile).then(function(up){
          if(up&&up.chemin)return sb.update("predictek_depenses",depId,{fichier:up.chemin});
        });
      }
      // Ecriture au journal: debit du compte de depense (montant avant taxes)
      return suite.then(function(){
        return sb.insert("predictek_journal",{date_transaction:row.date_facture,no_compte:row.no_compte,
          description:"Fournisseur "+row.fournisseur+(row.no_facture?" - "+row.no_facture:""),
          debit:row.sous_total||row.total,credit:0,reference:row.no_facture||("DEP-"+depId.substring(0,8)),source:"fournisseur"});
      }).then(function(){
        setEnCours(false);setShowD(false);setFacFile(null);setApercuD(null);setExtraitMsg("");
        setNfD({fournisseur:"",no_facture:"",date_facture:"",sous_total:"",tps:"",tvq:"",total:"",no_compte:"5900",notes:""});
        setMsg("Depense fournisseur enregistree et portee au journal (compte "+row.no_compte+").");
        sb.log("compta_predictek","creation","Depense fournisseur: "+row.fournisseur+" "+(row.total||0)+" $ (compte "+row.no_compte+")","","");
        charger();setTimeout(function(){setMsg("");},5000);
      });
    }).catch(function(e){setEnCours(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  function basculerDepensePayee(d){
    var st=d.statut==="payee"?"a_payer":"payee";
    sb.update("predictek_depenses",d.id,{statut:st,date_paiement:st==="payee"?new Date().toISOString().substring(0,10):null}).then(function(){charger();});
  }
  function voirDepense(d){
    if(!d.fichier)return;
    sb.lienFichier("preuves",d.fichier).then(function(u){if(u)window.open(u,"_blank");else setErr("Impossible de generer le lien du document.");});
  }

  // ----- PAIES (comptabilisation mensuelle par poste) -----
  var paieRef="PAIE-"+moisPaie;
  var paieDejaFaite=journal.some(function(j){return j.source==="paie"&&j.reference===paieRef;});
  function lignesPaie(){
    var m={};
    emps.forEach(function(e){
      var cpt=compteDuPoste(e.poste||"");
      var sal=parseFloat(e.salaire)||0;
      var mensuel=(sal+sal*((parseFloat(e.reserve_vacances_pct)||0)/100))/12;
      if(!m[cpt])m[cpt]={compte:cpt,nb:0,montant:0};
      m[cpt].nb++;m[cpt].montant+=mensuel;
    });
    return Object.keys(m).map(function(k){return m[k];}).filter(function(x){return x.montant>0;}).sort(function(a,b){return a.compte.localeCompare(b.compte);});
  }
  function comptabiliserPaie(){
    if(enCours||paieDejaFaite)return;
    var lignes=lignesPaie();
    if(lignes.length===0){setErr("Aucun employe actif avec salaire.");return;}
    setEnCours(true);setErr("");setMsg("");
    var seq=Promise.resolve();var ok=0;
    lignes.forEach(function(l){
      seq=seq.then(function(){
        return sb.insert("predictek_journal",{date_transaction:moisPaie+"-28",no_compte:l.compte,
          description:"Paie "+moisPaie+" - "+l.nb+" employe(s) (salaire + reserve vacances)",
          debit:Math.round(l.montant*100)/100,credit:0,reference:paieRef,source:"paie"}).then(function(r){if(r&&r.data&&r.data.id)ok++;});
      });
    });
    seq.then(function(){
      setEnCours(false);
      setMsg("Paie de "+moisPaie+" comptabilisee: "+ok+" ecriture(s) par poste. Les charges patronales (compte 5100) restent a saisir selon vos remises.");
      sb.log("compta_predictek","creation","Paie "+moisPaie+" comptabilisee ("+ok+" postes)","","");
      charger();setTimeout(function(){setMsg("");},6000);
    }).catch(function(e){setEnCours(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  function imprimerResultats(){
    var h="<h1>Etat des resultats - Predictek inc.</h1><div class='muted'>Exercice "+annee+" (journal de l entreprise) - genere le "+new Date().toLocaleDateString("fr-CA")+"</div>";
    h+="<h2>REVENUS</h2><table><tr><th>No</th><th>Compte</th><th class='right'>Montant</th></tr>";
    comptesRevenus.forEach(function(c){var sld=soldeCompte(c.no_compte);if(sld===0)return;h+="<tr><td>"+c.no_compte+"</td><td>"+c.nom_compte+"</td><td class='right'>"+money(sld)+"</td></tr>";});
    h+="<tr class='tot'><td></td><td>TOTAL DES REVENUS</td><td class='right'>"+money(totRev)+"</td></tr></table>";
    h+="<h2>DEPENSES</h2><table><tr><th>No</th><th>Compte</th><th class='right'>Montant</th></tr>";
    comptesDepenses.forEach(function(c){var sld=soldeCompte(c.no_compte);if(sld===0)return;h+="<tr><td>"+c.no_compte+"</td><td>"+c.nom_compte+"</td><td class='right'>"+money(sld)+"</td></tr>";});
    h+="<tr class='tot'><td></td><td>TOTAL DES DEPENSES</td><td class='right'>"+money(totDep)+"</td></tr></table>";
    h+="<h2>RESULTAT</h2><table><tr class='tot'><td>BENEFICE (PERTE) DE L EXERCICE</td><td class='right'>"+money(resultat)+"</td></tr></table>";
    h+="<div class='muted' style='margin-top:16px'>Document de gestion base sur le journal interne - ne remplace pas des etats financiers prepares par un CPA.</div>";
    imprimerHTML("Etat des resultats Predictek "+annee,h);
  }

  var TABS=[{id:"resultats",l:"Etat des resultats"},{id:"depenses",l:"Depenses fournisseurs"},{id:"paies",l:"Paies"},{id:"journal",l:"Journal"},{id:"plan",l:"Plan comptable"}];
  var annees=[];for(var a=new Date().getFullYear()-2;a<=new Date().getFullYear()+1;a++)annees.push(String(a));

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Comptabilite Predictek</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Livres de l entreprise - distincts de la comptabilite des syndicats</div>
        </div>
        <select value={annee} onChange={function(e){setAnnee(e.target.value);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {annees.map(function(x){return <option key={x} value={x} style={{color:"#000"}}>Exercice {x}</option>;})}
        </select>
        <div style={{display:"flex",marginLeft:"auto"}}>
          {TABS.map(function(t){var act=ong===t.id;return <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:act?"#ffffff18":"transparent",border:"none",borderBottom:act?"3px solid #3CAF6E":"3px solid transparent",padding:"8px 16px",color:act?"#fff":"#9fb0c6",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:act?700:500}}>{t.l}</button>;})}
        </div>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
          <div style={{background:T.accentL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Revenus (journal {annee})</div><div style={{fontSize:18,fontWeight:800,color:T.accent}}>{money(totRev)}</div></div>
          <div style={{background:T.redL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Depenses (journal {annee})</div><div style={{fontSize:18,fontWeight:800,color:T.red}}>{money(totDep)}</div></div>
          <div style={{background:resultat>=0?T.accentL:T.redL,border:"2px solid "+(resultat>=0?T.accent:T.red),borderRadius:10,padding:12}}><div style={{fontSize:10,fontWeight:700,color:resultat>=0?T.accent:T.red}}>BENEFICE (PERTE)</div><div style={{fontSize:18,fontWeight:800,color:resultat>=0?T.accent:T.red}}>{money(resultat)}</div></div>
          <div style={{background:T.purpleL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Masse salariale estimee (employes actifs)</div><div style={{fontSize:18,fontWeight:800,color:T.purple}}>{money(masseSalariale)}</div><div style={{fontSize:9,color:T.muted}}>salaires + reserve vacances / an</div></div>
        </div>

        {ong==="resultats"&&(
          <div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
              <Btn onClick={imprimerResultats}>Imprimer l etat des resultats</Btn>
              {aImporter.length>0&&(
                <Btn bg={T.blue} onClick={importerFacturation} dis={enCours}>{enCours?"Import...":"Importer "+aImporter.length+" facture(s) payee(s) -> compte 4000"}</Btn>
              )}
              <div style={{fontSize:11,color:T.muted}}>Facturation clients payee en {annee}: <b style={{color:T.navy}}>{money(revFacturation)}</b> (avant taxes){dejaImportees.length>0?" - "+dejaImportees.length+" deja au journal":""}</div>
            </div>
            {[{titre:"REVENUS",liste:comptesRevenus,tot:totRev,c:T.accent},{titre:"DEPENSES",liste:comptesDepenses,tot:totDep,c:T.red}].map(function(sec){
              return(
                <div key={sec.titre} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>{sec.titre} {annee}</div>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <tbody>
                      {sec.liste.map(function(c){
                        var sld=soldeCompte(c.no_compte);
                        if(sld===0)return null;
                        return(
                          <tr key={c.no_compte} style={{borderTop:"1px solid "+T.border}}>
                            <td style={{padding:"5px 10px",fontWeight:700,color:T.muted,width:60}}>{c.no_compte}</td>
                            <td style={{padding:"5px 10px"}}>{c.nom_compte}</td>
                            <td style={{padding:"5px 10px",textAlign:"right",fontWeight:700}}>{money(sld)}</td>
                          </tr>
                        );
                      })}
                      {sec.liste.every(function(c){return soldeCompte(c.no_compte)===0;})&&(
                        <tr><td colSpan={3} style={{padding:14,textAlign:"center",color:T.muted,fontSize:12}}>Aucune ecriture en {annee} - ajoutez des ecritures au Journal{sec.titre==="REVENUS"?" ou importez la facturation":""}.</td></tr>
                      )}
                      <tr style={{borderTop:"2px solid "+T.navy,background:T.alt}}>
                        <td style={{padding:"6px 10px"}}></td>
                        <td style={{padding:"6px 10px",fontWeight:800,color:T.navy}}>TOTAL {sec.titre}</td>
                        <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800,color:sec.c}}>{money(sec.tot)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {ong==="depenses"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <div style={{fontSize:12,color:T.muted}}>{depenses.length} depense(s) - a payer: <b style={{color:T.red}}>{money(depenses.filter(function(d){return d.statut!=="payee";}).reduce(function(a,d){return a+(Number(d.total)||0);},0))}</b></div>
              <Btn onClick={function(){setShowD(true);setExtraitMsg("");}}>+ Ajouter une depense (facture)</Btn>
            </div>

            {showD&&(
              <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap",background:T.surface,border:"2px solid "+T.navy+"33",borderRadius:12,padding:16,marginBottom:14}}>
                {apercuD&&(
                  <div style={{flex:"2 1 500px",minWidth:380,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden",background:"#525659"}}>
                    <div style={{background:T.navy,padding:"6px 10px",fontSize:11,fontWeight:700,color:"#fff"}}>Apercu de la facture</div>
                    <div style={{height:"70vh",minHeight:480,overflow:"auto",display:"flex",alignItems:"flex-start",justifyContent:"center"}}>
                      {apercuD.isPdf
                        ?<iframe title="apercu-dep" src={apercuD.url+"#view=FitH&navpanes=0"} style={{width:"100%",height:"100%",border:"none"}}/>
                        :<img src={apercuD.url} alt="Facture" style={{maxWidth:"100%"}}/>}
                    </div>
                  </div>
                )}
                <div style={{flex:"1 1 320px",minWidth:290,maxWidth:440,display:"grid",gridTemplateColumns:"1fr",gap:10}}>
                  <div style={{background:T.blueL,border:"2px dashed "+T.blue+"66",borderRadius:10,padding:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.blue,marginBottom:4}}>Televersez la facture (PDF ou photo) - les champs se remplissent automatiquement</div>
                    <input type="file" accept=".pdf,image/*" onChange={function(e){var f=e.target.files&&e.target.files[0];if(f){setFacFile(f);extraireDepense(f);try{setApercuD({url:URL.createObjectURL(f),isPdf:/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)});}catch(ex){}}}} style={{fontSize:11,fontFamily:"inherit"}}/>
                    {extraitMsg&&<div style={{fontSize:11,color:T.blue,fontWeight:600,marginTop:6}}>{extraitMsg}</div>}
                  </div>
                  <div><Lbl l="Fournisseur"/><input value={nfD.fournisseur} onChange={function(e){setD("fournisseur",e.target.value);}} style={INP}/></div>
                  <div><Lbl l="No facture"/><input value={nfD.no_facture} onChange={function(e){setD("no_facture",e.target.value);}} style={INP}/></div>
                  <div><Lbl l="Date facture"/><input type="date" value={nfD.date_facture} onChange={function(e){setD("date_facture",e.target.value);}} style={INP}/></div>
                  <div><Lbl l="Sous-total ($)"/><input type="number" step="0.01" value={nfD.sous_total} onChange={function(e){var st=parseFloat(e.target.value)||0;var tps=Math.round(st*0.05*100)/100;var tvq=Math.round(st*0.09975*100)/100;setD("sous_total",st);setD("tps",tps);setD("tvq",tvq);setD("total",Math.round((st+tps+tvq)*100)/100);}} style={INP}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div><Lbl l="TPS"/><input type="number" step="0.01" value={nfD.tps} onChange={function(e){setD("tps",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="TVQ"/><input type="number" step="0.01" value={nfD.tvq} onChange={function(e){setD("tvq",e.target.value);}} style={INP}/></div>
                  </div>
                  <div><Lbl l="Total ($)"/><input type="number" step="0.01" value={nfD.total} onChange={function(e){setD("total",e.target.value);}} style={INP}/></div>
                  <div><Lbl l="Compte de depense"/><select value={nfD.no_compte} onChange={function(e){setD("no_compte",e.target.value);}} style={INP}>
                    {comptesDepListe.map(function(c){return <option key={c.no} value={c.no}>{c.no} - {c.nom}</option>;})}
                  </select></div>
                  <div><Lbl l="Notes"/><textarea value={nfD.notes} onChange={function(e){setD("notes",e.target.value);}} style={Object.assign({},INP,{minHeight:44,resize:"vertical"})}/></div>
                  <div style={{display:"flex",gap:8}}>
                    <Btn onClick={sauverDepense} dis={enCours}>{enCours?"Sauvegarde...":"Sauvegarder la depense"}</Btn>
                    <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowD(false);setFacFile(null);setApercuD(null);setExtraitMsg("");}}>Annuler</Btn>
                  </div>
                </div>
              </div>
            )}

            {depenses.length===0&&!showD&&(
              <div style={{background:T.surface,border:"1px dashed "+T.border,borderRadius:12,padding:30,textAlign:"center",color:T.muted,fontSize:13}}>
                Aucune depense fournisseur.<br/><span style={{fontSize:11}}>Televersez vos factures: extraction automatique et suggestion du compte de depense, comme pour les syndicats.</span>
              </div>
            )}
            {depenses.map(function(d){
              var payee=d.statut==="payee";
              return(
                <div key={d.id} style={{background:T.surface,border:"1px solid "+T.border,borderLeft:"4px solid "+(payee?T.accent:T.amber),borderRadius:10,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <span style={{background:payee?T.accentL:T.amberL,color:payee?T.accent:T.amber,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800,flexShrink:0}}>{payee?"PAYEE":"A PAYER"}</span>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{d.fournisseur}{d.no_facture?" - "+d.no_facture:""}</div>
                    <div style={{fontSize:11,color:T.muted}}>{d.date_facture} - compte {d.no_compte}{cMap[d.no_compte]?" ("+cMap[d.no_compte].nom_compte+")":""}{payee&&d.date_paiement?" - payee le "+d.date_paiement:""}</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:800,color:T.navy,flexShrink:0}}>{money(d.total)}</div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    {d.fichier&&<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){voirDepense(d);}}>Voir</Btn>}
                    <Btn sm bg={payee?T.alt:T.accentL} tc={payee?T.muted:T.accent} bdr={"1px solid "+T.border} onClick={function(){basculerDepensePayee(d);}}>{payee?"Remettre a payer":"Marquer payee"}</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {ong==="paies"&&(
          <div>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap",marginBottom:12}}>
                <div style={{width:170}}><Lbl l="Mois de paie"/><input type="month" value={moisPaie} onChange={function(e){setMoisPaie(e.target.value);}} style={INP}/></div>
                <Btn onClick={comptabiliserPaie} dis={enCours||paieDejaFaite}>{paieDejaFaite?"Paie de "+moisPaie+" deja comptabilisee":(enCours?"En cours...":"Comptabiliser la paie de "+moisPaie)}</Btn>
                <div style={{fontSize:11,color:T.muted}}>Base: salaires annuels des employes actifs / 12 + reserve de vacances, ventiles PAR POSTE (comptes 5010-5090).</div>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:T.alt}}>{["Compte","Poste","Employes","Montant mensuel"].map(function(h,ix){return <th key={h} style={{padding:"6px 10px",textAlign:ix>=2?"right":"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}</tr></thead>
                <tbody>
                  {lignesPaie().map(function(l){return(
                    <tr key={l.compte} style={{borderTop:"1px solid "+T.border}}>
                      <td style={{padding:"5px 10px",fontWeight:700,color:T.navy}}>{l.compte}</td>
                      <td style={{padding:"5px 10px"}}>{cMap[l.compte]?cMap[l.compte].nom_compte:""}</td>
                      <td style={{padding:"5px 10px",textAlign:"right"}}>{l.nb}</td>
                      <td style={{padding:"5px 10px",textAlign:"right",fontWeight:700}}>{money(l.montant)}</td>
                    </tr>
                  );})}
                  {lignesPaie().length===0&&<tr><td colSpan={4} style={{padding:16,textAlign:"center",color:T.muted}}>Aucun employe actif avec salaire (module Employes).</td></tr>}
                </tbody>
              </table>
              <div style={{fontSize:10,color:T.muted,marginTop:8}}>Les charges patronales (RRQ, RQAP, AE, FSS, CNESST) se saisissent au compte 5100 selon vos remises reelles.</div>
            </div>
            <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Paies comptabilisees</div>
            {journal.filter(function(j){return j.source==="paie";}).length===0&&<div style={{fontSize:12,color:T.muted}}>Aucune paie comptabilisee.</div>}
            {(function(){
              var m={};
              journal.filter(function(j){return j.source==="paie";}).forEach(function(j){
                if(!m[j.reference])m[j.reference]={ref:j.reference,total:0,nb:0};
                m[j.reference].total+=Number(j.debit)||0;m[j.reference].nb++;
              });
              return Object.keys(m).sort().reverse().map(function(k){
                return <div key={k} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:"10px 16px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:700,color:T.navy}}>{m[k].ref}</span>
                  <span style={{fontSize:11,color:T.muted}}>{m[k].nb} poste(s)</span>
                  <span style={{fontSize:13,fontWeight:800,color:T.purple}}>{money(m[k].total)}</span>
                </div>;
              });
            })()}
          </div>
        )}

        {ong==="journal"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:12,color:T.muted}}>{jrnAnnee.length} ecriture(s) en {annee} - {journal.length} au total</div>
              <Btn onClick={function(){setShowN(true);}}>+ Nouvelle ecriture</Btn>
            </div>
            {showN&&(
              <div style={{background:T.surface,border:"2px solid "+T.navy+"33",borderRadius:12,padding:16,marginBottom:14}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
                  <div><Lbl l="Date"/><input type="date" value={nf.date_transaction} onChange={function(e){setN("date_transaction",e.target.value);}} style={INP}/></div>
                  <div style={{gridColumn:"2/4"}}><Lbl l="Compte"/><select value={nf.no_compte} onChange={function(e){setN("no_compte",e.target.value);}} style={INP}>
                    {comptes.filter(function(c){return c.actif;}).sort(function(a,b){return a.no_compte.localeCompare(b.no_compte);}).map(function(c){return <option key={c.no_compte} value={c.no_compte}>{c.no_compte} - {c.nom_compte}</option>;})}
                  </select></div>
                  <div style={{gridColumn:"1/-1"}}><Lbl l="Description"/><input value={nf.description} onChange={function(e){setN("description",e.target.value);}} style={INP}/></div>
                  <div><Lbl l="Debit ($) - depenses"/><input type="number" step="0.01" value={nf.debit} onChange={function(e){setN("debit",e.target.value);}} style={INP}/></div>
                  <div><Lbl l="Credit ($) - revenus"/><input type="number" step="0.01" value={nf.credit} onChange={function(e){setN("credit",e.target.value);}} style={INP}/></div>
                  <div><Lbl l="Reference"/><input value={nf.reference} onChange={function(e){setN("reference",e.target.value);}} style={INP} placeholder="No facture, cheque..."/></div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Btn onClick={ajouterEcriture}>Enregistrer l ecriture</Btn>
                  <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowN(false);setErr("");}}>Annuler</Btn>
                </div>
              </div>
            )}
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:T.alt}}>{["Date","Compte","Description","Debit","Credit","Ref.","Source"].map(function(h){return <th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}</tr></thead>
                <tbody>
                  {jrnAnnee.map(function(j){return(
                    <tr key={j.id} style={{borderTop:"1px solid "+T.border}}>
                      <td style={{padding:"6px 10px",whiteSpace:"nowrap",color:T.muted}}>{j.date_transaction}</td>
                      <td style={{padding:"6px 10px",fontWeight:700,color:T.navy,whiteSpace:"nowrap"}}>{j.no_compte}{cMap[j.no_compte]?" - "+cMap[j.no_compte].nom_compte.substring(0,24):""}</td>
                      <td style={{padding:"6px 10px"}}>{j.description}</td>
                      <td style={{padding:"6px 10px",textAlign:"right",color:T.red,fontWeight:600}}>{Number(j.debit)>0?money(j.debit):""}</td>
                      <td style={{padding:"6px 10px",textAlign:"right",color:T.accent,fontWeight:600}}>{Number(j.credit)>0?money(j.credit):""}</td>
                      <td style={{padding:"6px 10px",color:T.muted}}>{j.reference}</td>
                      <td style={{padding:"6px 10px"}}><span style={{background:j.source==="facturation"?T.blueL:T.alt,color:j.source==="facturation"?T.blue:T.muted,borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:800}}>{j.source==="facturation"?"FACTURATION":"MANUEL"}</span></td>
                    </tr>
                  );})}
                  {jrnAnnee.length===0&&<tr><td colSpan={7} style={{padding:20,textAlign:"center",color:T.muted}}>Aucune ecriture en {annee}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {ong==="plan"&&(
          <div>
            <div style={{fontSize:11,color:T.muted,marginBottom:12}}>{comptes.filter(function(c){return c.actif;}).length} compte(s) actif(s) sur {comptes.length}. Les salaires sont ventiles PAR POSTE (comptes 5010 a 5090). Cliquez un compte pour l activer / desactiver.</div>
            {(function(){
              var groupes=[];
              comptes.forEach(function(c){if(c.groupe&&groupes.indexOf(c.groupe)<0)groupes.push(c.groupe);});
              return groupes.map(function(g){
                var lignes=comptes.filter(function(c){return c.groupe===g;}).sort(function(a,b){return a.no_compte.localeCompare(b.no_compte);});
                return(
                  <div key={g} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em"}}>{g}</div>
                      <button onClick={function(){setAjoutGroupe(ajoutGroupe===g?null:g);setNfc({no:"",nom:"",type:lignes[0]?lignes[0].type_compte:"depense"});}} style={{background:"none",border:"none",color:T.blue,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Ajouter un compte</button>
                    </div>
                    {ajoutGroupe===g&&(
                      <div style={{display:"flex",gap:8,alignItems:"flex-end",marginBottom:10,background:T.blueL,borderRadius:8,padding:10,flexWrap:"wrap"}}>
                        <div style={{width:90}}><Lbl l="Numero"/><input value={nfc.no} onChange={function(e){setNfc(Object.assign({},nfc,{no:e.target.value.replace(/\D/g,"").slice(0,6)}));}} style={INP}/></div>
                        <div style={{flex:1,minWidth:200}}><Lbl l="Nom du compte"/><input value={nfc.nom} onChange={function(e){setNfc(Object.assign({},nfc,{nom:e.target.value}));}} style={INP}/></div>
                        <div style={{width:130}}><Lbl l="Type"/><select value={nfc.type} onChange={function(e){setNfc(Object.assign({},nfc,{type:e.target.value}));}} style={INP}>{Object.keys(TYPES_LBL).map(function(t){return <option key={t} value={t}>{TYPES_LBL[t]}</option>;})}</select></div>
                        <Btn sm onClick={function(){ajouterCompte(g);}}>Ajouter</Btn>
                        <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setAjoutGroupe(null);}}>Annuler</Btn>
                      </div>
                    )}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:6}}>
                      {lignes.map(function(c){
                        var actif=c.actif;
                        return(
                          <div key={c.no_compte} onClick={function(){basculerCompte(c);}} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,border:"1px solid "+(actif?T.accent+"55":T.border),background:actif?T.accentL:T.alt,cursor:"pointer",opacity:actif?1:0.55}}>
                            <div style={{width:34,height:20,borderRadius:10,background:actif?T.accent:T.border,position:"relative",flexShrink:0}}>
                              <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:actif?17:3,transition:"left 0.15s"}}/>
                            </div>
                            <span style={{fontSize:11,fontWeight:700,color:T.navy,flexShrink:0}}>{c.no_compte}</span>
                            <span style={{fontSize:11,color:T.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textDecoration:actif?"none":"line-through"}}>{c.nom_compte}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
