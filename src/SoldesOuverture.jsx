// SOLDES D OUVERTURE (Configuration)
// FEUILLE DE TRAVAIL: tous les comptes du BILAN (actifs, passifs, fonds) sont proposes
// directement - on inscrit les montants, pas besoin de choisir les comptes un a un.
// - Comptes de BANQUE: soldes saisis ici (les comptes se CREENT d abord dans Comptes bancaires)
// - Comptes a RECEVOIR: le montant s explose PAR UNITE (quelle unite doit quoi)
// - Comptes a PAYER (fournisseurs): le montant s explose PAR FOURNISSEUR (un ou plusieurs)
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
var money=function(n){return (Number(n)||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

var FONDS_NOMS={operation:"Fonds d operation",prevoyance:"Fonds de prevoyance",assurance:"Fonds d auto-assurance",special:"Fonds de travaux speciaux"};

// ===== Helpers d importation automatique (bilan / listes detaillees) =====
function lireReponseS(r){return r.text().then(function(t){try{return JSON.parse(t);}catch(e){return {error:"Reponse inattendue du serveur (code "+r.status+")"};}});}
function fichierPourExtractionS(file){
  return new Promise(function(resolve,reject){
    var isPdf=/pdf$/i.test(file.type)||/\.pdf$/i.test(file.name);
    var fr=new FileReader();
    fr.onerror=function(){reject(new Error("Lecture du fichier impossible"));};
    fr.onload=function(ev){
      var b64=String(ev.target.result).split(",")[1];
      if(isPdf){
        if(b64.length>4200000){reject(new Error("PDF trop volumineux pour l extraction (max ~3 Mo)"));return;}
        resolve({pdf:b64});
      }else{
        var img=new Image();
        img.onload=function(){
          var cv=document.createElement("canvas");
          var sc=Math.min(1,1600/Math.max(img.width,img.height));
          cv.width=Math.round(img.width*sc);cv.height=Math.round(img.height*sc);
          cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
          resolve({images:[cv.toDataURL("image/jpeg",0.8).split(",")[1]]});
        };
        img.onerror=function(){reject(new Error("Image illisible"));};
        img.src=ev.target.result;
      }
    };
    fr.readAsDataURL(file);
  });
}
function normS(s){
  return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
}

// Contributions PERCUES D AVANCE (montants anticipes payes par des copros): PASSIF
// detaille PAR UNITE - chaque montant devient une AVANCE appliquee automatiquement
// sur les prochaines cotisations/factures (module Encaissements, FIFO)
function estPercuDavance(compte){
  if(!compte)return false;
  var t=((compte.nom_compte||"")+" "+(compte.groupe||"")).toLowerCase();
  var no=String(compte.no_compte||"");
  return /percues d avance|percue d avance|percus d avance|percu d avance/.test(t)||(/dues aux coproprietaires/.test(t)&&/avance/.test(t))||no.indexOf("24")===0;
}

// Type de detail requis pour un compte
function detailPour(compte){
  if(!compte)return "";
  var t=((compte.nom_compte||"")+" "+(compte.groupe||"")).toLowerCase();
  var no=String(compte.no_compte||"");
  if(estPercuDavance(compte))return "unite";
  if(/recevoir|arrerage/.test(t)||no.indexOf("12")===0)return "unite";
  if(/fournisseur/.test(t)||no==="2210")return "fournisseur";
  if(/payes d avance|paye d avance|prepaye/.test(t)||no.indexOf("13")===0)return "fournisseur";
  return "";
}
function sensDefaut(compte){
  var ty=(compte&&compte.type_compte||"").toLowerCase();
  if(ty==="passif"||ty==="revenu"||ty==="capitaux"||ty==="fonds")return "credit";
  return "debit";
}
function estBilan(c){
  var ty=(c.type_compte||"").toLowerCase();
  return ty==="actif"||ty==="passif"||ty==="capitaux";
}

export default function SoldesOuverture(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var comptes=s2[0];var setComptes=s2[1];
  var s3=useState([]);var unites=s3[0];var setUnites=s3[1];
  var s4=useState([]);var fournisseurs=s4[0];var setFournisseurs=s4[1];
  var s5=useState([]);var lignes=s5[0];var setLignes=s5[1];
  var s6=useState([]);var banques=s6[0];var setBanques=s6[1];
  var s7=useState("");var msg=s7[0];var setMsg=s7[1];
  var s8=useState("");var err=s8[0];var setErr=s8[1];
  var s9=useState({});var valeurs=s9[0];var setValeurs=s9[1];       // no_compte -> montant (comptes simples)
  var s10=useState({});var details=s10[0];var setDetails=s10[1];    // no_compte -> [{cle,montant}] (unite ou fournisseur)
  var s11=useState({});var soldesBq=s11[0];var setSoldesBq=s11[1];  // compte bancaire id -> montant
  var s12=useState("");var dateSoldes=s12[0];var setDateSoldes=s12[1];
  var s13=useState(false);var saving=s13[0];var setSaving=s13[1];
  var s14=useState(null);var dragId=s14[0];var setDragId=s14[1];
  var s15=useState(false);var showAddC=s15[0];var setShowAddC=s15[1];
  var s16=useState({no:"",nom:"",type:"passif",groupe:""});var addC=s16[0];var setAddC=s16[1];

  // Groupes existants de la charte pour un type donne (menu deroulant du formulaire d ajout)
  function groupesPourType(ty){
    var out=[];
    comptes.forEach(function(c){
      if((c.type_compte||"").toLowerCase()!==ty)return;
      var g=c.groupe||"";
      if(g&&out.indexOf(g)<0)out.push(g);
    });
    return out.sort();
  }

  // Ajouter un compte de BILAN manquant (ex.: Du interfonds, Frais courus) sans quitter la page
  function ajouterCompteBilan(){
    var no=(addC.no||"").trim();var nom=(addC.nom||"").trim();
    if(!no||!nom){setErr("ECHEC: le numero ET le nom du compte sont obligatoires.");return;}
    if(comptes.some(function(c){return String(c.no_compte)===no;})){setErr("ECHEC: le compte "+no+" existe deja dans la charte.");return;}
    var grpDef=addC.type==="actif"?"Actifs - Autres":addC.type==="capitaux"?"Capitaux":"Passifs - Autres";
    sb.insert("comptes_syndicat",{syndicat_id:sel.id,no_compte:no,nom_compte:nom,type_compte:addC.type,groupe:(addC.groupe||"").trim()||grpDef,actif:true}).then(function(res){
      if(res&&res.error){setErr("ECHEC de l ajout du compte: "+(res.error.message||""));return;}
      setShowAddC(false);setAddC({no:"",nom:"",type:"passif",groupe:""});
      setMsg("Compte "+no+" - "+nom+" ajoute a la charte - inscrivez maintenant son solde ci-dessous.");
      charger();
    }).catch(function(e){setErr("ECHEC: "+((e&&e.message)||""));});
  }

  // ===== IMPORTATION AUTOMATIQUE: bilan + listes detaillees (recevoir/payer) =====
  var s17=useState(false);var importBusy=s17[0];var setImportBusy=s17[1];
  var s18=useState(null);var importResu=s18[0];var setImportResu=s18[1];
  var s19=useState("");var cibleDetail=s19[0];var setCibleDetail=s19[1];

  function comptesBilanCourants(){
    return comptes.filter(function(c){return estBilan(c)&&!/encaisse/i.test(c.nom_compte||"");});
  }
  function trouverBanque(nomLigne){
    var n=normS(nomLigne);
    var chiffres=String(nomLigne||"").replace(/\D/g,"");
    var hit=null;
    banques.forEach(function(b){
      if(hit)return;
      var noB=String(b.no_compte||"").replace(/\D/g,"");
      if(noB&&chiffres&&(chiffres.indexOf(noB)>=0||noB.indexOf(chiffres)>=0&&chiffres.length>=4))hit=b;
    });
    if(!hit)banques.forEach(function(b){
      if(hit)return;
      var nb=normS(b.nom||"");
      if(nb&&n.indexOf(nb)>=0)hit=b;
    });
    if(!hit){
      var mots={prevoyance:"prevoyance",assurance:"assurance",special:"special",operation:"operation",exploitation:"operation"};
      Object.keys(mots).forEach(function(k){
        if(hit)return;
        if(n.indexOf(k)>=0){
          var cands=banques.filter(function(b){return b.fonds===mots[k];});
          if(cands.length===1)hit=cands[0];
        }
      });
    }
    return hit;
  }
  function trouverCompte(nomLigne,section){
    var n=normS(nomLigne);
    var pool=comptesBilanCourants().filter(function(c){
      var ty=(c.type_compte||"").toLowerCase();
      if(section==="actif")return ty==="actif";
      if(section==="passif")return ty==="passif";
      if(section==="capitaux")return ty==="capitaux";
      return true;
    });
    var exact=pool.find(function(c){return normS(c.nom_compte)===n;});
    if(exact)return exact;
    var incl=pool.find(function(c){var cn=normS(c.nom_compte);return cn&&(n.indexOf(cn)>=0||cn.indexOf(n)>=0);});
    if(incl)return incl;
    // meilleur chevauchement de mots (au moins 2 mots significatifs communs)
    var mots=n.split(" ").filter(function(w){return w.length>3;});
    var best=null;var bestN=0;
    pool.forEach(function(c){
      var cm=normS(c.nom_compte).split(" ");
      var nb=mots.filter(function(w){return cm.indexOf(w)>=0;}).length;
      if(nb>bestN){bestN=nb;best=c;}
    });
    return bestN>=2?best:null;
  }

  function importerBilan(ev){
    var file=ev.target.files[0];ev.target.value="";
    if(!file||!sel)return;
    setImportBusy(true);setErr("");setImportResu(null);
    fichierPourExtractionS(file).then(function(src){
      var corps=Object.assign({mode:"bilan"},src);
      return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify(corps)}).then(lireReponseS);
    }).then(function(resp){
      setImportBusy(false);
      if(!resp||resp.error||!resp.lignes){setErr("ECHEC de l extraction du bilan: "+((resp&&(resp.error||resp.raw))||"reponse vide"));return;}
      if(resp.date)setDateSoldes(String(resp.date).substring(0,10));
      var appliquees=[];var aDetailler=[];var nonApparies=[];
      var nvSoldesBq={};var nvValeurs={};
      (resp.lignes||[]).forEach(function(l){
        var nom=l.nom||"";var mnt=Number(l.montant)||0;var section=(l.section||"").toLowerCase();
        if(mnt===0)return;
        if(/encaisse|banque|caisse/.test(normS(nom))){
          var b=trouverBanque(nom);
          if(b){nvSoldesBq[b.id]=String(mnt);appliquees.push({nom:nom,montant:mnt,vers:"Banque: "+(b.nom||FONDS_NOMS[b.fonds]||b.fonds)});return;}
          nonApparies.push({nom:nom,montant:mnt,section:section,groupe:l.groupe||""});return;
        }
        var c=trouverCompte(nom,section);
        if(!c){nonApparies.push({nom:nom,montant:mnt,section:section,groupe:l.groupe||""});return;}
        if(detailPour(c)){aDetailler.push({nom:nom,montant:mnt,compte:c.no_compte+" - "+c.nom_compte,dp:detailPour(c)});return;}
        nvValeurs[c.no_compte]=String((parseFloat(nvValeurs[c.no_compte])||0)+mnt);
        appliquees.push({nom:nom,montant:mnt,vers:c.no_compte+" - "+c.nom_compte});
      });
      setSoldesBq(function(pr){return Object.assign({},pr,nvSoldesBq);});
      setValeurs(function(pr){return Object.assign({},pr,nvValeurs);});
      setImportResu({type:"bilan",date:resp.date||"",appliquees:appliquees,aDetailler:aDetailler,nonApparies:nonApparies});
      window.scrollTo(0,0);
    }).catch(function(e){setImportBusy(false);setErr("ECHEC de l extraction: "+((e&&e.message)||""));});
  }

  function importerDetail(ev){
    var file=ev.target.files[0];ev.target.value="";
    if(!file||!sel)return;
    setImportBusy(true);setErr("");
    fichierPourExtractionS(file).then(function(src){
      var corps=Object.assign({mode:"soldes_detail"},src);
      return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify(corps)}).then(lireReponseS);
    }).then(function(resp){
      setImportBusy(false);
      if(!resp||resp.error||!resp.lignes){setErr("ECHEC de l extraction de la liste: "+((resp&&(resp.error||resp.raw))||"reponse vide"));return;}
      var ty=(resp.type==="payer")?"fournisseur":"unite";
      // Compte cible par defaut
      var cands=comptesBilanCourants().filter(function(c){return detailPour(c)===ty&&!estPercuDavance(c);});
      var def=ty==="unite"
        ? (cands.find(function(c){return /contribution/.test(normS(c.nom_compte));})||cands[0])
        : (cands.find(function(c){return /fournisseur/.test(normS(c.nom_compte));})||cands[0]);
      if(!def){setErr("ECHEC: aucun compte a detail par "+ty+" dans la charte.");return;}
      setCibleDetail(def.no_compte);
      // Nettoyage des cles (unites: apparier aux vraies unites)
      var lignesOk=[];var douteuses=[];
      (resp.lignes||[]).forEach(function(l){
        var mnt=Number(l.montant)||0;if(mnt===0)return;
        var cle=String(l.cle||"").trim();
        if(ty==="unite"){
          var u=unites.find(function(x){return String(x.no_unite)===cle||String(x.no_unite).replace(/^0+/,"")===cle.replace(/^0+/,"");});
          if(u)cle=u.no_unite;else douteuses.push(cle+" ("+(l.nom||"?")+")");
        }
        lignesOk.push({cle:cle,montant:String(mnt)});
      });
      setImportResu({type:"detail",dtype:ty,date:resp.date||"",lignes:lignesOk,douteuses:douteuses});
      window.scrollTo(0,0);
    }).catch(function(e){setImportBusy(false);setErr("ECHEC de l extraction: "+((e&&e.message)||""));});
  }

  function appliquerDetailImporte(){
    if(!importResu||importResu.type!=="detail"||!cibleDetail)return;
    setDetails(function(pr){var n=Object.assign({},pr);n[cibleDetail]=importResu.lignes.slice();return n;});
    setMsg(importResu.lignes.length+" ligne(s) placee(s) au compte "+cibleDetail+" - verifiez puis Sauvegardez.");
    setImportResu(null);
  }

  // Reordonner les comptes de banque par glisser-deposer (l ordre est memorise)
  function deposerBanque(cibleId){
    if(!dragId||dragId===cibleId){setDragId(null);return;}
    var arr=banques.slice();
    var de=arr.findIndex(function(x){return x.id===dragId;});
    var a=arr.findIndex(function(x){return x.id===cibleId;});
    if(de<0||a<0){setDragId(null);return;}
    var it=arr.splice(de,1)[0];
    arr.splice(a,0,it);
    setBanques(arr);setDragId(null);
    arr.forEach(function(b,i){
      sb.update("comptes_bancaires",b.id,{ordre:i}).then(function(res){
        if(res&&res.error)setErr("ECHEC de l enregistrement de l ordre des comptes: "+(res.error.message||"executez le bloc SQL fourni (colonne ordre)."));
      }).catch(function(e){setErr("ECHEC de l enregistrement de l ordre des comptes: "+((e&&e.message)||"executez le bloc SQL fourni (colonne ordre)."));});
    });
  }

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
    sb.select("fournisseurs",{order:"nom.asc",limit:1000}).then(function(r){if(r&&r.data)setFournisseurs(r.data);}).catch(function(){});
  },[]);

  function charger(){
    if(!sel)return;
    sb.select("comptes_syndicat",{eq:{syndicat_id:sel.id},order:"no_compte.asc",limit:500}).then(function(r){if(r&&r.data)setComptes(r.data.filter(function(c){return c.actif!==false;}));}).catch(function(){});
    sb.select("unites",{eq:{syndicat_id:sel.id},order:"no_unite.asc",limit:1000}).then(function(r){if(r&&r.data)setUnites(r.data);}).catch(function(){});
    sb.select("comptes_bancaires",{eq:{syndicat_id:sel.id},order:"ordre.asc,created_at.asc",limit:50}).then(function(r){
      var bq=(r&&r.data)?r.data.filter(function(b){return b.actif!==false;}):[];
      bq.sort(function(a,b){return (a.ordre||0)-(b.ordre||0)||String(a.created_at||"").localeCompare(String(b.created_at||""));});
      setBanques(bq);
      var sb2={};var dMax="";
      bq.forEach(function(b){sb2[b.id]=b.solde_ouverture!==null&&b.solde_ouverture!==undefined&&Number(b.solde_ouverture)!==0?String(b.solde_ouverture):"";if(b.date_solde&&String(b.date_solde)>dMax)dMax=String(b.date_solde).substring(0,10);});
      setSoldesBq(sb2);
      if(dMax)setDateSoldes(function(p){return p||dMax;});
    }).catch(function(){setBanques([]);});
    sb.select("soldes_ouverture",{eq:{syndicat_id:sel.id},limit:1000}).then(function(r){
      var rows=(r&&r.data)?r.data.filter(function(x){return x.statut!=="retire";}):[];
      setLignes(rows);
      // Prefill de la feuille de travail depuis l existant
      var v={};var d={};var dSo="";var dCr="";
      rows.forEach(function(l){
        if(l.unite||l.fournisseur){
          if(!d[l.no_compte])d[l.no_compte]=[];
          d[l.no_compte].push({cle:l.unite||l.fournisseur,montant:String(l.montant||"")});
        }else{
          v[l.no_compte]=String((parseFloat(v[l.no_compte])||0)+(Number(l.montant)||0));
        }
        if(l.date_solde&&String(l.date_solde).substring(0,10)>dSo)dSo=String(l.date_solde).substring(0,10);
        if(!l.date_solde&&l.created_at&&String(l.created_at).substring(0,10)>dCr)dCr=String(l.created_at).substring(0,10);
      });
      // Ramene TOUJOURS la date sauvegardee des soldes d ouverture au retour dans le module;
      // a defaut (anciens soldes sans date), la date de creation des lignes
      if(dSo)setDateSoldes(dSo);
      else if(dCr)setDateSoldes(function(p){return p||dCr;});
      setValeurs(v);setDetails(d);
      if(r&&r.error)setErr("Chargement impossible: "+(r.error.message||"la table soldes_ouverture existe-t-elle? (SQL fourni)"));
    }).catch(function(){setLignes([]);});
  }
  useEffect(function(){charger();},[sel&&sel.id]);

  function setVal(no,v){setValeurs(function(pr){var n=Object.assign({},pr);n[no]=v;return n;});}
  function majDetail(no,ix,k,v){
    setDetails(function(pr){
      var n=Object.assign({},pr);
      var liste=(n[no]||[]).slice();
      liste[ix]=Object.assign({},liste[ix]);liste[ix][k]=v;
      n[no]=liste;return n;
    });
  }
  function ajouterDetail(no){
    setDetails(function(pr){var n=Object.assign({},pr);n[no]=(n[no]||[]).concat([{cle:"",montant:""}]);return n;});
  }
  function retirerDetail(no,ix){
    setDetails(function(pr){var n=Object.assign({},pr);n[no]=(n[no]||[]).filter(function(_,j){return j!==ix;});return n;});
  }
  function totalDetail(no){
    return Math.round(((details[no]||[]).reduce(function(a,l){return a+(parseFloat(l.montant)||0);},0))*100)/100;
  }
  function montantCompte(c){
    return detailPour(c)?totalDetail(c.no_compte):(parseFloat(valeurs[c.no_compte])||0);
  }

  // Comptes du bilan proposes (l Encaisse est geree par la section Banques ci-dessus)
  var comptesBilan=comptes.filter(function(c){return estBilan(c)&&!/encaisse/i.test(c.nom_compte||"");});
  var groupes=[];
  comptesBilan.forEach(function(c){var g=c.groupe||"Autres";if(groupes.indexOf(g)<0)groupes.push(g);});

  var totBanques=banques.reduce(function(a,b){return a+(parseFloat(soldesBq[b.id])||0);},0);
  var totDebit=comptesBilan.filter(function(c){return sensDefaut(c)==="debit";}).reduce(function(a,c){return a+montantCompte(c);},0);
  var totCredit=comptesBilan.filter(function(c){return sensDefaut(c)==="credit";}).reduce(function(a,c){return a+montantCompte(c);},0);
  var ecart=Math.round(((totBanques+totDebit)-totCredit)*100)/100;

  // ===== SAUVEGARDE: banques + remplacement des lignes soldes_ouverture =====
  async function sauverTout(){
    if(!sel||saving)return;
    if(!dateSoldes){setErr("ECHEC: inscrivez d abord la DATE des soldes d ouverture (case Soldes en date du, dans le bandeau du haut) - aucun enregistrement sans date.");window.scrollTo(0,0);return;}
    // Validation des details: AUCUNE sauvegarde si un montant est inscrit sans son
    // unite/fournisseur, ou si une unite/un fournisseur est choisi sans montant
    var invalides=[];
    comptesBilan.forEach(function(c){
      var dp=detailPour(c);
      if(!dp)return;
      (details[c.no_compte]||[]).forEach(function(l,ix){
        var aMontant=String(l.montant||"").trim()!==""&&(parseFloat(l.montant)||0)!==0;
        var aCle=!!(l.cle&&String(l.cle).trim());
        if(aMontant&&!aCle)invalides.push(c.no_compte+" ligne "+(ix+1)+": montant inscrit sans "+(dp==="unite"?"UNITE":"FOURNISSEUR"));
        if(!aMontant&&aCle)invalides.push(c.no_compte+" ligne "+(ix+1)+": "+(dp==="unite"?"unite":"fournisseur")+" \""+l.cle+"\" sans MONTANT");
      });
    });
    if(invalides.length>0){setErr("ECHEC: aucune sauvegarde - corrigez d abord ces lignes: "+invalides.join(" | ")+". (Retirez la ligne avec X si elle est inutile.)");window.scrollTo(0,0);return;}
    setSaving(true);setErr("");setMsg("");
    var echecs=[];
    // 1. Soldes d ouverture des comptes de banque
    for(var i=0;i<banques.length;i++){
      var b=banques[i];
      var v=parseFloat(soldesBq[b.id])||0;
      var rB=await sb.update("comptes_bancaires",b.id,{solde_ouverture:v,date_solde:dateSoldes||null});
      if(rB&&rB.error)echecs.push("banque "+(b.nom||b.fonds)+": "+(rB.error.message||""));
    }
    // 2. Remplacement des lignes existantes
    for(var k=0;k<lignes.length;k++){
      var rR=await sb.update("soldes_ouverture",lignes[k].id,{statut:"retire"});
      if(rR&&rR.error)echecs.push("retrait ligne: "+(rR.error.message||""));
    }
    // 2b. Remplacement des AVANCES issues des soldes d ouverture (contributions percues d avance)
    var rAv=await sb.select("avances_copros",{eq:{syndicat_id:sel.id,note:"Solde d ouverture"},limit:500});
    if(rAv&&rAv.data){
      for(var k2=0;k2<rAv.data.length;k2++){
        if(rAv.data[k2].statut==="annule")continue;
        var rR2=await sb.update("avances_copros",rAv.data[k2].id,{statut:"annule"});
        if(rR2&&rR2.error)echecs.push("retrait avance: "+(rR2.error.message||""));
      }
    }
    // 3. Insertion des nouvelles lignes
    var inseres=0;var avancesCreees=0;
    for(var m=0;m<comptesBilan.length;m++){
      var c=comptesBilan[m];
      var dp=detailPour(c);
      if(dp){
        var liste=(details[c.no_compte]||[]).filter(function(l){return (parseFloat(l.montant)||0)!==0&&l.cle&&String(l.cle).trim();});
        for(var n2=0;n2<liste.length;n2++){
          var l2=liste[n2];
          var u=dp==="unite"?unites.find(function(x){return x.no_unite===l2.cle;}):null;
          var rI=await sb.insert("soldes_ouverture",{syndicat_id:sel.id,no_compte:c.no_compte,nom_compte:c.nom_compte,
            sens:sensDefaut(c),montant:parseFloat(l2.montant)||0,
            unite_id:u?u.id:null,unite:dp==="unite"?l2.cle:"",fournisseur:dp==="fournisseur"?l2.cle:"",
            date_solde:dateSoldes||null,note:"",statut:"actif"});
          if(rI&&rI.error)echecs.push(c.no_compte+": "+(rI.error.message||""));else inseres++;
          // Contributions percues d avance: creer l AVANCE correspondante (appliquee
          // automatiquement sur les prochaines cotisations dans Encaissements)
          if(estPercuDavance(c)&&u){
            var mAv=parseFloat(l2.montant)||0;
            var rA=await sb.insert("avances_copros",{syndicat_id:sel.id,unite_id:u.id,coproprietaire_id:null,montant:mAv,solde:mAv,date_encaissement:dateSoldes||null,compte_bancaire_id:null,note:"Solde d ouverture",statut:"actif"});
            if(rA&&rA.error)echecs.push("avance unite "+l2.cle+": "+(rA.error.message||""));else avancesCreees++;
          }
        }
      }else{
        var mnt=parseFloat(valeurs[c.no_compte])||0;
        if(mnt>0){
          var rI2=await sb.insert("soldes_ouverture",{syndicat_id:sel.id,no_compte:c.no_compte,nom_compte:c.nom_compte,
            sens:sensDefaut(c),montant:mnt,unite_id:null,unite:"",fournisseur:"",date_solde:dateSoldes||null,note:"",statut:"actif"});
          if(rI2&&rI2.error)echecs.push(c.no_compte+": "+(rI2.error.message||""));else inseres++;
        }
      }
    }
    setSaving(false);
    if(echecs.length>0){setErr("ECHEC sur "+echecs.length+" element(s): "+echecs.slice(0,5).join(" | ")+(echecs.length>5?" ...":""));}
    setMsg("Soldes d ouverture sauvegardes: "+banques.length+" compte(s) de banque + "+inseres+" ligne(s) GL"+(avancesCreees>0?" + "+avancesCreees+" avance(s) creee(s) (appliquees automatiquement sur les prochaines cotisations)":"")+(Math.abs(ecart)>0.01?" - ATTENTION: la balance ne balance pas (ecart "+money(ecart)+")":" - balance OK")+".");
    sb.log("comptabilite","modification","Soldes d ouverture sauvegardes ("+inseres+" lignes GL, ecart "+ecart.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,"\u202F").replace(".",",")+" $)","",sel.code||"");
    charger();setTimeout(function(){setMsg("");},10000);
  }

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat.</div>;
  if(!sel)return null;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Soldes d ouverture</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Feuille de travail: banques, comptes a recevoir PAR UNITE, comptes a payer PAR FOURNISSEUR</div>
        </div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
          <div><div style={{fontSize:9,color:"#9fb0c6",textTransform:"uppercase",fontWeight:700}}>Soldes en date du</div>
            <input type="date" value={dateSoldes} onChange={function(e){setDateSoldes(e.target.value);}} style={{border:"none",borderRadius:6,padding:"5px 8px",fontSize:12,fontFamily:"inherit"}}/>
          </div>
          <Btn onClick={sauverTout} dis={saving}>{saving?"Sauvegarde...":"Sauvegarder les soldes d ouverture"}</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
          <div style={{background:T.accentL,borderRadius:10,padding:12}}>
            <div style={{fontSize:10,color:T.muted}}>DEBITS - banques + autres actifs (a recevoir...)</div>
            <div style={{fontSize:16,fontWeight:800,color:T.accent}}>{money(totBanques+totDebit)}</div>
            <div style={{fontSize:9,color:T.muted,marginTop:2}}>Banques {money(totBanques)} + autres {money(totDebit)}</div>
          </div>
          <div style={{background:T.amberL,borderRadius:10,padding:12}}>
            <div style={{fontSize:10,color:T.muted}}>CREDITS (passifs, a payer, fonds...)</div>
            <div style={{fontSize:16,fontWeight:800,color:T.amber}}>{money(totCredit)}</div>
            <div style={{fontSize:9,color:T.muted,marginTop:2}}>Doit egaler les debits</div>
          </div>
          <div style={{background:Math.abs(ecart)<0.01?T.accentL:T.redL,borderRadius:10,padding:12}}>
            <div style={{fontSize:10,color:T.muted}}>Ecart (doit etre 0 pour balancer)</div>
            <div style={{fontSize:16,fontWeight:800,color:Math.abs(ecart)<0.01?T.accent:T.red}}>{money(ecart)}</div>
            <div style={{fontSize:9,fontWeight:700,color:Math.abs(ecart)<0.01?T.accent:T.red,marginTop:2}}>{Math.abs(ecart)<0.01?"BALANCE":(ecart>0?"Les DEBITS depassent les credits de "+money(ecart):"Les CREDITS depassent les debits de "+money(-ecart))}</div>
          </div>
        </div>

        <div style={{background:T.surface,border:"2px solid "+T.blue+"44",borderRadius:12,padding:16,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:800,color:T.blue,marginBottom:2}}>Comptes de banque (Encaisse)</div>
          <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Les comptes se CREENT dans Configuration - Comptes bancaires; leurs soldes d ouverture se saisissent ICI. Glissez-deposez une carte sur une autre pour changer l ordre d affichage (memorise).</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10}}>
            {banques.map(function(b){
              return(
                <div key={b.id} draggable onDragStart={function(){setDragId(b.id);}} onDragOver={function(e){e.preventDefault();}} onDrop={function(e){e.preventDefault();deposerBanque(b.id);}} style={{background:T.blueL,borderRadius:10,padding:12,cursor:"grab",border:dragId===b.id?"2px dashed "+T.blue:"2px solid transparent",opacity:dragId===b.id?0.6:1}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.navy}}><span title="Glisser pour reordonner" style={{color:T.muted,marginRight:6}}>=</span>{b.nom||FONDS_NOMS[b.fonds]||("Fonds "+(b.fonds||""))}{b.par_defaut?<span style={{color:"#B7950B"}}>{"\u0020\u2605"}</span>:null}</div>
                  <div style={{fontSize:9,color:T.muted,marginBottom:6}}>{FONDS_NOMS[b.fonds]||("Fonds "+(b.fonds||""))}{b.no_compte?" - ***"+String(b.no_compte).slice(-4):""}</div>
                  <input type="number" step="0.01" value={soldesBq[b.id]||""} onChange={function(e){var v=e.target.value;setSoldesBq(function(pr){var n=Object.assign({},pr);n[b.id]=v;return n;});}} style={INP}/>
                </div>
              );
            })}
            {banques.length===0&&<div style={{color:T.muted,fontSize:12,padding:10}}>Aucun compte de banque - creez-les d abord dans Configuration - Comptes bancaires.</div>}
          </div>
        </div>

        {/* ===== IMPORTATION AUTOMATIQUE ===== */}
        <div style={{background:T.surface,border:"2px solid "+T.purple+"44",borderRadius:12,padding:16,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:800,color:T.purple,marginBottom:2}}>Importation automatique (lecture IA)</div>
          <div style={{fontSize:11,color:T.muted,marginBottom:10}}>Televersez votre BILAN (PDF ou photo): la date et les montants se placent automatiquement dans la feuille. Televersez aussi vos listes detaillees de comptes a RECEVOIR (par unite) ou a PAYER (par fournisseur): les lignes se placent au bon compte.</div>
          <input type="file" id="soImpBilan" accept=".pdf,.jpg,.jpeg,.png" onChange={importerBilan} style={{display:"none"}}/>
          <input type="file" id="soImpDetail" accept=".pdf,.jpg,.jpeg,.png" onChange={importerDetail} style={{display:"none"}}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Btn dis={importBusy} bg={T.purple} onClick={function(){document.getElementById("soImpBilan").click();}}>{importBusy?"Lecture en cours...":"Televerser le BILAN"}</Btn>
            <Btn dis={importBusy} bg={T.purpleL} tc={T.purple} bdr={"1px solid "+T.purple+"44"} onClick={function(){document.getElementById("soImpDetail").click();}}>{importBusy?"Lecture en cours...":"Televerser une liste detaillee (recevoir / payer)"}</Btn>
          </div>

          {importResu&&importResu.type==="bilan"&&(
            <div style={{marginTop:12,background:T.purpleL,borderRadius:10,padding:12}}>
              <div style={{fontSize:12,fontWeight:800,color:T.purple,marginBottom:6}}>Bilan lu{importResu.date?" (en date du "+importResu.date+")":""}: {importResu.appliquees.length} montant(s) place(s) automatiquement</div>
              {importResu.appliquees.map(function(l,i){return <div key={"a"+i} style={{fontSize:11,color:T.navy,padding:"1px 0"}}>{l.nom} {"->"} <b>{l.vers}</b>: {money(l.montant)}</div>;})}
              {importResu.aDetailler.length>0&&(
                <div style={{marginTop:8}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.amber}}>A DETAILLER manuellement (ou par liste detaillee) - le bilan ne donne que le total:</div>
                  {importResu.aDetailler.map(function(l,i){return <div key={"d"+i} style={{fontSize:11,color:T.navy,padding:"1px 0"}}>{l.nom}: {money(l.montant)} {"->"} {l.compte} (par {l.dp==="unite"?"UNITE":"FOURNISSEUR"})</div>;})}
                </div>
              )}
              {importResu.nonApparies.length>0&&(
                <div style={{marginTop:8}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.red}}>NON APPARIES - aucun compte correspondant dans la charte (creez le compte puis re-televersez, ou inscrivez le montant a la main):</div>
                  {importResu.nonApparies.map(function(l,i){return(
                    <div key={"n"+i} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:T.navy,padding:"1px 0",flexWrap:"wrap"}}>
                      <span>{l.nom}: {money(l.montant)} ({l.section||"?"})</span>
                      <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){setAddC({no:"",nom:l.nom,type:l.section==="actif"?"actif":l.section==="capitaux"?"capitaux":"passif",groupe:l.groupe||""});setShowAddC(true);}}>Creer ce compte</Btn>
                    </div>
                  );})}
                </div>
              )}
              <div style={{marginTop:8}}><Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setImportResu(null);}}>Fermer ce resume</Btn></div>
            </div>
          )}

          {importResu&&importResu.type==="detail"&&(
            <div style={{marginTop:12,background:T.purpleL,borderRadius:10,padding:12}}>
              <div style={{fontSize:12,fontWeight:800,color:T.purple,marginBottom:6}}>Liste lue: {importResu.lignes.length} ligne(s) ({importResu.dtype==="unite"?"comptes a RECEVOIR par unite":"comptes a PAYER par fournisseur"})</div>
              {importResu.lignes.slice(0,40).map(function(l,i){return <div key={"l"+i} style={{fontSize:11,color:T.navy,padding:"1px 0"}}>{l.cle}: {money(parseFloat(l.montant)||0)}</div>;})}
              {importResu.lignes.length>40&&<div style={{fontSize:10,color:T.muted}}>... et {importResu.lignes.length-40} autre(s)</div>}
              {importResu.douteuses.length>0&&<div style={{fontSize:11,color:T.red,marginTop:6}}>ATTENTION - unites introuvables (verifiez apres application): {importResu.douteuses.join(", ")}</div>}
              <div style={{display:"flex",gap:8,alignItems:"center",marginTop:10,flexWrap:"wrap"}}>
                <span style={{fontSize:11,fontWeight:700,color:T.navy}}>Placer au compte:</span>
                <select value={cibleDetail} onChange={function(e){setCibleDetail(e.target.value);}} style={Object.assign({},INP,{width:320})}>
                  {comptesBilanCourants().filter(function(c){return detailPour(c)===importResu.dtype;}).map(function(c){return <option key={c.id} value={c.no_compte}>{c.no_compte} - {c.nom_compte}</option>;})}
                </select>
                <Btn onClick={appliquerDetailImporte}>Appliquer ces lignes</Btn>
                <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setImportResu(null);}}>Annuler</Btn>
              </div>
              <div style={{fontSize:10,color:T.muted,marginTop:6}}>L application REMPLACE les lignes de detail de ce compte dans la feuille (rien n est enregistre avant Sauvegarder).</div>
            </div>
          )}
        </div>

        {/* ===== AJOUT D UN COMPTE DE BILAN MANQUANT ===== */}
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:12,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{flex:1,fontSize:11,color:T.muted}}>Un compte manque a la feuille (ex.: Du interfonds par fonds, Frais courus - Fonds de prevoyance)? Ajoutez-le a la charte sans quitter la page.</div>
            <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){setShowAddC(!showAddC);}}>{showAddC?"Fermer":"+ Ajouter un compte de bilan"}</Btn>
          </div>
          {showAddC&&(
            <div style={{display:"grid",gridTemplateColumns:"120px 2fr 160px 1fr auto",gap:8,marginTop:10,alignItems:"end"}}>
              <div><Lbl l="Numero"/><input value={addC.no} onChange={function(e){var v=e.target.value;setAddC(function(pr){return Object.assign({},pr,{no:v});});}} style={INP}/></div>
              <div><Lbl l="Nom du compte"/><input value={addC.nom} onChange={function(e){var v=e.target.value;setAddC(function(pr){return Object.assign({},pr,{nom:v});});}} style={INP}/></div>
              <div><Lbl l="Type"/><select value={addC.type} onChange={function(e){var v=e.target.value;setAddC(function(pr){return Object.assign({},pr,{type:v,groupe:""});});}} style={INP}><option value="actif">Actif</option><option value="passif">Passif</option><option value="capitaux">Capitaux</option></select></div>
              <div><Lbl l="Groupe (choisir ou tout nouveau)"/>
                <select value={addC._autre?"__autre__":(addC.groupe||"")} onChange={function(e){var v=e.target.value;setAddC(function(pr){return v==="__autre__"?Object.assign({},pr,{_autre:true,groupe:""}):Object.assign({},pr,{_autre:false,groupe:v});});}} style={INP}>
                  <option value="">(Groupe par defaut du type)</option>
                  {groupesPourType(addC.type).map(function(g){return <option key={g} value={g}>{g}</option>;})}
                  <option value="__autre__">Nouveau groupe...</option>
                </select>
                {addC._autre&&<input value={addC.groupe} onChange={function(e){var v=e.target.value;setAddC(function(pr){return Object.assign({},pr,{groupe:v});});}} placeholder="Nom du nouveau groupe" style={Object.assign({},INP,{marginTop:6})}/>}
              </div>
              <Btn onClick={ajouterCompteBilan}>Ajouter</Btn>
            </div>
          )}
        </div>

        {groupes.map(function(g){
          var cs=comptesBilan.filter(function(c){return (c.groupe||"Autres")===g;});
          return(
            <div key={g} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
              <div style={{padding:"8px 14px",background:T.alt,fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase"}}>{g}</div>
              {cs.map(function(c){
                var dp=detailPour(c);
                var liste=details[c.no_compte]||[];
                return(
                  <div key={c.id} style={{borderTop:"1px solid "+T.border,padding:"8px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                      <div style={{flex:1,minWidth:240}}>
                        <span style={{fontSize:12,fontWeight:700,color:T.navy}}>{c.no_compte} - {c.nom_compte}</span>
                        <span style={{fontSize:9,color:sensDefaut(c)==="credit"?T.amber:T.accent,fontWeight:800,marginLeft:8}}>{sensDefaut(c)==="credit"?"CREDIT":"DEBIT"}</span>
                        {dp==="unite"&&<span style={{fontSize:9,color:T.blue,fontWeight:800,marginLeft:8}}>DETAIL PAR UNITE</span>}
                        {dp==="fournisseur"&&<span style={{fontSize:9,color:T.purple,fontWeight:800,marginLeft:8}}>DETAIL PAR FOURNISSEUR</span>}
                        {estPercuDavance(c)&&<div style={{fontSize:9,color:T.accent,fontWeight:700,marginTop:2}}>Montants ANTICIPES payes par des copros: inscrivez chaque unite - une AVANCE est creee et s appliquera automatiquement sur ses prochaines cotisations (Encaissements).</div>}
                      </div>
                      {!dp&&<div style={{width:150}}><input type="number" step="0.01" value={valeurs[c.no_compte]||""} onChange={function(e){setVal(c.no_compte,e.target.value);}} style={Object.assign({},INP,{textAlign:"right",fontWeight:700})}/></div>}
                      {dp&&(
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{fontSize:13,fontWeight:800,color:T.navy}}>{money(totalDetail(c.no_compte))}</div>
                          <Btn sm bg={dp==="unite"?T.blueL:T.purpleL} tc={dp==="unite"?T.blue:T.purple} bdr={"1px solid "+(dp==="unite"?T.blue:T.purple)+"44"} onClick={function(){ajouterDetail(c.no_compte);}}>+ {dp==="unite"?"Unite":"Fournisseur"}</Btn>
                        </div>
                      )}
                    </div>
                    {dp&&liste.length>0&&(
                      <div style={{marginTop:8,paddingLeft:14,borderLeft:"3px solid "+(dp==="unite"?T.blue:T.purple)+"44"}}>
                        {liste.map(function(l,ix){
                          return(
                            <div key={ix} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                              <div style={{width:220}}>
                                {dp==="unite"?(
                                  <select value={l.cle} onChange={function(e){majDetail(c.no_compte,ix,"cle",e.target.value);}} style={INP}>
                                    <option value="">Choisir l unite...</option>
                                    {unites.map(function(u){return <option key={u.id} value={u.no_unite}>Unite {u.no_unite}</option>;})}
                                  </select>
                                ):(
                                  <select value={l.cle} onChange={function(e){majDetail(c.no_compte,ix,"cle",e.target.value);}} style={INP}>
                                    <option value="">Choisir le fournisseur...</option>
                                    {fournisseurs.map(function(f){return <option key={f.id} value={f.nom}>{f.nom}</option>;})}
                                  </select>
                                )}
                              </div>
                              <div style={{width:140}}><input type="number" step="0.01" value={l.montant} onChange={function(e){majDetail(c.no_compte,ix,"montant",e.target.value);}} style={Object.assign({},INP,{textAlign:"right"})}/></div>
                              <span style={{color:T.red,cursor:"pointer",fontWeight:800,fontSize:14}} onClick={function(){retirerDetail(c.no_compte,ix);}}>x</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {comptesBilan.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucun compte de bilan dans la charte de ce syndicat.</div>}

        {/* ===== APERCU DU BILAN D OUVERTURE (calcule en direct) ===== */}
        <div style={{background:T.surface,border:"2px solid "+T.navy+"33",borderRadius:12,padding:16,marginTop:14}}>
          <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:2}}>Apercu du bilan d ouverture{dateSoldes?" au "+dateSoldes:""}</div>
          <div style={{fontSize:10,color:T.muted,marginBottom:12}}>Se calcule a mesure que vous inscrivez les montants - totaux par categorie, comme au bilan.</div>
          {[
            {titre:"ACTIFS",types:["actif"],avecBanques:true,c:T.accent},
            {titre:"PASSIF",types:["passif"],avecBanques:false,c:T.amber},
            {titre:"CAPITAUX (fonds)",types:["capitaux","fonds"],avecBanques:false,c:T.purple}
          ].map(function(sec){
            var cs=comptesBilan.filter(function(c){return sec.types.indexOf((c.type_compte||"").toLowerCase())>=0&&Math.abs(montantCompte(c))>0.004;});
            var gs=[];cs.forEach(function(c){var g=c.groupe||"Autres";if(gs.indexOf(g)<0)gs.push(g);});
            var totSec=cs.reduce(function(a,c){return a+montantCompte(c);},0)+(sec.avecBanques?totBanques:0);
            return(
              <div key={sec.titre} style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:800,color:sec.c,borderBottom:"2px solid "+sec.c+"55",paddingBottom:3,marginBottom:4}}>{sec.titre}</div>
                {sec.avecBanques&&banques.length>0&&(
                  <div style={{marginBottom:4}}>
                    <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",padding:"2px 0"}}>Encaisse</div>
                    {banques.filter(function(b){return Math.abs(parseFloat(soldesBq[b.id])||0)>0.004;}).map(function(b){return(
                      <div key={b.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.navy,padding:"1px 0 1px 12px"}}>
                        <span>Encaisse - {b.nom||FONDS_NOMS[b.fonds]||b.fonds}{b.no_compte?" ("+String(b.no_compte).slice(-4)+")":""}</span>
                        <span style={{fontWeight:700}}>{money(parseFloat(soldesBq[b.id])||0)}</span>
                      </div>
                    );})}
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.muted,padding:"1px 0 1px 12px",borderTop:"1px solid "+T.border}}>
                      <span>Sous-total encaisse</span><span style={{fontWeight:800}}>{money(totBanques)}</span>
                    </div>
                  </div>
                )}
                {gs.map(function(g){
                  var cg=cs.filter(function(c){return (c.groupe||"Autres")===g;});
                  var totG=cg.reduce(function(a,c){return a+montantCompte(c);},0);
                  return(
                    <div key={g} style={{marginBottom:4}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",padding:"2px 0"}}>{g}</div>
                      {cg.map(function(c){return(
                        <div key={c.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.navy,padding:"1px 0 1px 12px"}}>
                          <span>{c.no_compte} - {c.nom_compte}</span>
                          <span style={{fontWeight:700}}>{money(montantCompte(c))}</span>
                        </div>
                      );})}
                      {cg.length>1&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.muted,padding:"1px 0 1px 12px",borderTop:"1px solid "+T.border}}><span>Sous-total {g.toLowerCase()}</span><span style={{fontWeight:800}}>{money(totG)}</span></div>}
                    </div>
                  );
                })}
                {cs.length===0&&!(sec.avecBanques&&banques.length>0)&&<div style={{fontSize:10,color:T.muted,paddingLeft:12}}>Aucun montant inscrit.</div>}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:800,color:sec.c,borderTop:"2px solid "+sec.c+"55",marginTop:3,paddingTop:3}}>
                  <span>Total {sec.titre.toLowerCase()}</span><span>{money(totSec)}</span>
                </div>
              </div>
            );
          })}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:800,color:T.navy,borderTop:"3px double "+T.navy,paddingTop:6,marginTop:4}}>
            <span>Passif + capitaux</span><span>{money(totCredit)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:800,color:Math.abs(ecart)<0.01?T.accent:T.red,marginTop:2}}>
            <span>{Math.abs(ecart)<0.01?"BALANCE - actifs = passif + capitaux":"ECART avec les actifs (doit etre 0)"}</span><span>{money(Math.abs(ecart)<0.01?0:ecart)}</span>
          </div>
        </div>

        <div style={{display:"flex",gap:8,marginTop:8}}>
          <Btn onClick={sauverTout} dis={saving}>{saving?"Sauvegarde...":"Sauvegarder les soldes d ouverture"}</Btn>
        </div>
        <div style={{fontSize:10,color:T.muted,marginTop:8}}>Seuls les comptes avec un montant sont enregistres. La sauvegarde REMPLACE les soldes d ouverture precedents du syndicat.</div>
      </div>
    </div>
  );
}
