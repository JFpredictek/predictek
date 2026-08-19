// CONCILIATION BANCAIRE (Finances - Comptabilite)
// 1. Choisir le COMPTE DE BANQUE et le MOIS
// 2. Televerser le RELEVE DE COMPTE (PDF ou photo) -> extraction automatique des transactions
// 3. Rapprochement AUTOMATIQUE avec les transactions du systeme (encaissements, avances,
//    fichiers EFT, factures payees, ecritures au journal) -> les ECARTS ressortent
// 4. Sauvegarde de la conciliation PAR COMPTE PAR MOIS (registre avec statut)
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Bdg(p){return <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap"}}>{p.children}</span>;}
var money=function(n){return (Number(n)||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

function lireReponseB(r){return r.text().then(function(t){try{return JSON.parse(t);}catch(e){return {error:"Reponse inattendue du serveur (code "+r.status+")"};}});}
function fichierPourExtractionB(file){
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
          var sc=Math.min(1,1800/Math.max(img.width,img.height));
          cv.width=Math.round(img.width*sc);cv.height=Math.round(img.height*sc);
          cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
          resolve({images:[cv.toDataURL("image/jpeg",0.85).split(",")[1]]});
        };
        img.onerror=function(){reject(new Error("Image illisible"));};
        img.src=ev.target.result;
      }
    };
    fr.readAsDataURL(file);
  });
}
function memeMontant(a,b){return Math.abs((Number(a)||0)-(Number(b)||0))<0.015;}
function joursEntre(d1,d2){
  var a=new Date(String(d1).substring(0,10)+"T12:00:00");
  var b=new Date(String(d2).substring(0,10)+"T12:00:00");
  if(isNaN(a.getTime())||isNaN(b.getTime()))return 999;
  return Math.abs(Math.round((a-b)/86400000));
}

var FONDS_NOMS={operation:"Fonds d operation",prevoyance:"Fonds de prevoyance",assurance:"Fonds d auto-assurance",special:"Fonds de travaux speciaux"};

export default function Conciliation(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var banques=s2[0];var setBanques=s2[1];
  var s3=useState("");var compteId=s3[0];var setCompteId=s3[1];
  var s4=useState(new Date().toISOString().substring(0,7));var mois=s4[0];var setMois=s4[1];
  var s5=useState("");var msg=s5[0];var setMsg=s5[1];
  var s6=useState("");var err=s6[0];var setErr=s6[1];
  var s7=useState(false);var enCours=s7[0];var setEnCours=s7[1];
  var s8=useState(null);var releve=s8[0];var setReleve=s8[1]; // {transactions, soldeDebut, soldeFin, ...}
  var s9=useState("");var cheminReleve=s9[0];var setCheminReleve=s9[1];
  var s10=useState(null);var resultat=s10[0];var setResultat=s10[1]; // rapprochement
  var s11=useState([]);var conciliations=s11[0];var setConciliations=s11[1];
  var s12=useState([]);var paiements=s12[0];var setPaiements=s12[1];
  var s13=useState([]);var avances=s13[0];var setAvances=s13[1];
  var s14=useState([]);var factures=s14[0];var setFactures=s14[1];
  var s15=useState([]);var journal=s15[0];var setJournal=s15[1];
  var s16=useState([]);var fichiersEft=s16[0];var setFichiersEft=s16[1];
  var s17=useState(null);var detail=s17[0];var setDetail=s17[1]; // conciliation passee ouverte

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  function chargerTout(){
    if(!sel)return;
    sb.select("comptes_bancaires",{eq:{syndicat_id:sel.id},limit:20}).then(function(r){
      if(r&&r.data){setBanques(r.data);if(r.data.length>0&&!r.data.some(function(b){return b.id===compteId;}))setCompteId(r.data[0].id);}
      else setBanques([]);
    }).catch(function(){setBanques([]);});
    sb.select("paiements",{eq:{syndicat_id:sel.id},order:"date_paiement.desc",limit:5000}).then(function(r){if(r&&r.data)setPaiements(r.data);}).catch(function(){});
    sb.select("avances_copros",{eq:{syndicat_id:sel.id},limit:500}).then(function(r){if(r&&r.data)setAvances(r.data);else setAvances([]);}).catch(function(){setAvances([]);});
    sb.select("factures",{eq:{syndicat_id:sel.id},limit:1000}).then(function(r){if(r&&r.data)setFactures(r.data);}).catch(function(){});
    sb.select("journal",{eq:{syndicat_id:sel.id},limit:2000}).then(function(r){if(r&&r.data)setJournal(r.data);}).catch(function(){});
    sb.select("fichiers_eft",{eq:{syndicat_id:sel.id},limit:200}).then(function(r){if(r&&r.data)setFichiersEft(r.data);else setFichiersEft([]);}).catch(function(){setFichiersEft([]);});
    sb.select("conciliations",{eq:{syndicat_id:sel.id},order:"mois.desc",limit:200}).then(function(r){
      if(r&&r.data)setConciliations(r.data);
      else setConciliations([]);
      if(r&&r.error)setErr("Chargement du registre impossible: "+(r.error.message||"la table conciliations existe-t-elle? (SQL fourni)"));
    }).catch(function(){setConciliations([]);});
  }
  useEffect(function(){chargerTout();setReleve(null);setResultat(null);},[sel&&sel.id]);

  var compte=banques.find(function(b){return b.id===compteId;});
  function libBanque(b){
    if(!b)return "?";
    return (b.nom?b.nom+" - ":"")+(FONDS_NOMS[b.fonds]||("Fonds "+(b.fonds||"")))+(b.banque?" - "+b.banque:"")+(b.no_compte?" (***"+String(b.no_compte).slice(-4)+")":"");
  }

  // ===== 1. TELEVERSEMENT + EXTRACTION DU RELEVE =====
  function televerserReleve(ev){
    var file=ev.target.files&&ev.target.files[0];
    ev.target.value="";
    if(!file||!sel)return;
    if(!compteId){setErr("Choisissez d abord le compte de banque concerne.");return;}
    setEnCours(true);setErr("");setReleve(null);setResultat(null);
    setMsg("Televersement du releve puis lecture automatique des transactions en cours (peut prendre jusqu a une minute)...");
    var nomProp=String(file.name||"releve.pdf").replace(/[^a-zA-Z0-9._-]/g,"_");
    var chemin=sel.id+"/releves/"+mois+"-"+Date.now()+"-"+nomProp;
    sb.uploadFichier("preuves",chemin,file).then(function(up){
      if(!up||!up.chemin){setEnCours(false);setMsg("");setErr("ECHEC du televersement: "+((up&&up.error&&up.error.message)||"erreur")+".");return null;}
      setCheminReleve(up.chemin);
      return fichierPourExtractionB(file);
    }).then(function(src){
      if(!src)return null;
      var corps=Object.assign({mode:"releve"},src);
      return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify(corps)}).then(lireReponseB);
    }).then(function(resp){
      if(resp===null)return;
      setEnCours(false);setMsg("");
      if(!resp||resp.error){setErr("Releve televerse, mais extraction impossible ("+((resp&&resp.error)||"erreur")+"). Reessayez avec un PDF plus leger ou une photo plus nette.");return;}
      var d=resp.data||{};
      var txs=Array.isArray(d.transactions)?d.transactions.filter(function(t){return (Number(t.retrait)||0)>0||(Number(t.depot)||0)>0;}):[];
      if(txs.length===0){setErr("Releve televerse, mais AUCUNE transaction lisible extraite - verifiez le document.");return;}
      var rel={institution:d.institution||"",compte:d.compte||"",periodeDebut:d.periodeDebut||"",periodeFin:d.periodeFin||"",
        soldeDebut:Number(d.soldeDebut)||0,soldeFin:Number(d.soldeFin)||0,transactions:txs};
      setReleve(rel);
      setMsg(txs.length+" transaction(s) extraite(s) du releve"+(d.periodeDebut?" ("+d.periodeDebut+" au "+d.periodeFin+")":"")+". Rapprochement automatique en cours...");
      rapprocher(rel);
    }).catch(function(e){setEnCours(false);setMsg("");setErr("ECHEC: "+(e&&e.message?e.message:"erreur"));});
  }

  // ===== 2. RAPPROCHEMENT AUTOMATIQUE =====
  // Cote systeme, pour CE compte et CE mois:
  // - DEPOTS: paiements payes (compte_bancaire_id = compte), avances recues, credits au journal
  //   + fichiers EFT type D (le lot arrive en UN depot a la banque)
  // - RETRAITS: factures fournisseurs payees (date de paiement du mois), debits au journal
  //   + fichiers EFT type C (paiements fournisseurs en un retrait)
  function elementsSysteme(){
    var items=[];
    // Paiements recus rattaches a ce compte (ou sans compte precise - tolere pour l historique)
    paiements.forEach(function(p){
      if(p.statut!=="paye")return;
      if(String(p.date_paiement||"").substring(0,7)!==mois)return;
      if(p.compte_bancaire_id&&p.compte_bancaire_id!==compteId)return;
      if(p.moyen==="credit_avance")return; // aucun mouvement bancaire
      items.push({k:"depot",src:"Encaissement",date:String(p.date_paiement).substring(0,10),montant:Number(p.montant)||0,lot:p.lot||"",desc:(p.description||"").substring(0,70),id:"p"+p.id,sansCompte:!p.compte_bancaire_id});
    });
    avances.forEach(function(a){
      if(a.statut==="annule")return;
      if(String(a.date_encaissement||"").substring(0,7)!==mois)return;
      if(a.compte_bancaire_id&&a.compte_bancaire_id!==compteId)return;
      items.push({k:"depot",src:"Avance",date:String(a.date_encaissement).substring(0,10),montant:Number(a.montant)||0,lot:"",desc:"Avance recue",id:"a"+a.id,sansCompte:!a.compte_bancaire_id});
    });
    factures.forEach(function(f){
      if(f.statut!=="payee")return;
      if(String(f.date_paiement||"").substring(0,7)!==mois)return;
      items.push({k:"retrait",src:"Facture fournisseur",date:String(f.date_paiement).substring(0,10),montant:Number(f.total)||0,lot:"",desc:(f.fournisseur_nom||"")+(f.no_facture?" #"+f.no_facture:""),id:"f"+f.id,sansCompte:true});
    });
    journal.forEach(function(j){
      if(String(j.date_transaction||"").substring(0,7)!==mois)return;
      var cat=String(j.categorie||"");
      // Eviter les doublons: les paiements fournisseurs du journal doublent les factures payees
      if(/paiement fournisseur/i.test(cat))return;
      if(/percues d avance/i.test(cat))return; // deja couvert par les avances
      if(Number(j.montant_credit)>0)items.push({k:"depot",src:"Journal",date:String(j.date_transaction).substring(0,10),montant:Number(j.montant_credit)||0,lot:"",desc:(j.description||"").substring(0,70),id:"jc"+j.id,sansCompte:true});
      if(Number(j.montant_debit)>0)items.push({k:"retrait",src:"Journal",date:String(j.date_transaction).substring(0,10),montant:Number(j.montant_debit)||0,lot:"",desc:(j.description||"").substring(0,70),id:"jd"+j.id,sansCompte:true});
    });
    return items;
  }
  // Groupes de lots (les prelevements PAP arrivent souvent en UN SEUL depot a la banque)
  function groupesLots(items){
    var lots={};
    items.forEach(function(it){
      if(it.k!=="depot"||!it.lot)return;
      if(!lots[it.lot])lots[it.lot]={lot:it.lot,montant:0,ids:[],date:it.date};
      lots[it.lot].montant=Math.round((lots[it.lot].montant+it.montant)*100)/100;
      lots[it.lot].ids.push(it.id);
    });
    return Object.keys(lots).map(function(k){return lots[k];});
  }

  function rapprocher(rel){
    var sys=elementsSysteme();
    var lots=groupesLots(sys);
    var eftD=fichiersEft.filter(function(fx){return fx.statut!=="annule"&&fx.type_dc==="D"&&String(fx.date_fichier||"").substring(0,7)===mois;});
    var eftC=fichiersEft.filter(function(fx){return fx.statut!=="annule"&&fx.type_dc==="C"&&String(fx.date_fichier||"").substring(0,7)===mois;});
    var sysLibres=sys.map(function(it){return Object.assign({pris:false},it);});
    var apparies=[];var ecartsBanque=[];
    rel.transactions.forEach(function(tx,ix){
      var mnt=Number(tx.retrait)>0?Number(tx.retrait):Number(tx.depot);
      var sens=Number(tx.retrait)>0?"retrait":"depot";
      var match=null;
      // 1. Lot PAP complet (un depot bancaire = somme du lot)
      if(sens==="depot"){
        var lotM=lots.find(function(l){return !l.pris&&memeMontant(l.montant,mnt)&&joursEntre(l.date,tx.date)<=6;});
        if(lotM){lotM.pris=true;sysLibres.forEach(function(it){if(lotM.ids.indexOf(it.id)>=0)it.pris=true;});match={type:"Lot d encaissements ("+lotM.ids.length+" lignes)",desc:lotM.lot,montant:lotM.montant};}
        if(!match){
          var fxD=eftD.find(function(fx){return !fx._pris&&memeMontant(fx.montant_total,mnt)&&joursEntre(fx.date_fichier,tx.date)<=6;});
          if(fxD){fxD._pris=true;match={type:"Fichier EFT (prelevements)",desc:fxD.nom_fichier,montant:Number(fxD.montant_total)};}
        }
      }else{
        var fxC=eftC.find(function(fx){return !fx._pris&&memeMontant(fx.montant_total,mnt)&&joursEntre(fx.date_fichier,tx.date)<=6;});
        if(fxC){fxC._pris=true;match={type:"Fichier EFT (paiements fournisseurs)",desc:fxC.nom_fichier,montant:Number(fxC.montant_total)};}
      }
      // 2. Transaction systeme individuelle (meme montant, +/- 6 jours; priorite au meme compte)
      if(!match){
        var cands=sysLibres.filter(function(it){return !it.pris&&it.k===sens&&memeMontant(it.montant,mnt)&&joursEntre(it.date,tx.date)<=6;});
        cands.sort(function(a,b){return (a.sansCompte?1:0)-(b.sansCompte?1:0)||joursEntre(a.date,tx.date)-joursEntre(b.date,tx.date);});
        if(cands.length>0){cands[0].pris=true;match={type:cands[0].src,desc:cands[0].desc,montant:cands[0].montant};}
      }
      if(match)apparies.push({tx:tx,sens:sens,montant:mnt,avec:match});
      else ecartsBanque.push({tx:tx,sens:sens,montant:mnt,ix:ix});
    });
    var ecartsSysteme=sysLibres.filter(function(it){return !it.pris;});
    var totDepotsRel=rel.transactions.reduce(function(a,t){return a+(Number(t.depot)||0);},0);
    var totRetraitsRel=rel.transactions.reduce(function(a,t){return a+(Number(t.retrait)||0);},0);
    var coherence=Math.round((rel.soldeDebut+totDepotsRel-totRetraitsRel-rel.soldeFin)*100)/100;
    setResultat({
      apparies:apparies,ecartsBanque:ecartsBanque,ecartsSysteme:ecartsSysteme,
      totDepots:Math.round(totDepotsRel*100)/100,totRetraits:Math.round(totRetraitsRel*100)/100,
      coherence:coherence,
      concilie:ecartsBanque.length===0&&ecartsSysteme.length===0
    });
    setMsg("");
  }

  // ===== 3. SAUVEGARDE (validation PAR COMPTE PAR MOIS) =====
  function sauverConciliation(){
    if(!releve||!resultat||!sel||enCours)return;
    setEnCours(true);setErr("");
    var statut=resultat.concilie?"conciliee":"ecarts";
    var row={syndicat_id:sel.id,compte_bancaire_id:compteId,mois:mois,fichier:cheminReleve,
      solde_debut:releve.soldeDebut,solde_fin:releve.soldeFin,
      nb_transactions:releve.transactions.length,
      nb_apparies:resultat.apparies.length,
      nb_ecarts:resultat.ecartsBanque.length+resultat.ecartsSysteme.length,
      transactions:releve.transactions,
      resultat:{ecartsBanque:resultat.ecartsBanque,ecartsSysteme:resultat.ecartsSysteme,totDepots:resultat.totDepots,totRetraits:resultat.totRetraits},
      statut:statut,date_conciliation:new Date().toISOString()};
    sb.insert("conciliations",row).then(function(r){
      setEnCours(false);
      if(!r||!r.data||!r.data.id){setErr("ECHEC de la sauvegarde: "+((r&&r.error&&r.error.message)||"la table conciliations existe-t-elle? (SQL fourni)"));return;}
      setMsg("Conciliation "+mois+" sauvegardee pour "+libBanque(compte)+" - statut: "+(statut==="conciliee"?"CONCILIEE (aucun ecart)":"AVEC ECARTS ("+row.nb_ecarts+")")+".");
      sb.log("comptabilite","creation","Conciliation bancaire "+mois+" ("+libBanque(compte)+"): "+row.nb_apparies+" appariees, "+row.nb_ecarts+" ecart(s)","",sel.code||"");
      setReleve(null);setResultat(null);
      chargerTout();setTimeout(function(){setMsg("");},10000);
    }).catch(function(e){setEnCours(false);setErr("ECHEC: "+(e&&e.message?e.message:""));});
  }
  function voirReleve(c){
    if(!c.fichier){setErr("Cette conciliation n a pas de releve joint.");return;}
    sb.lienFichier("preuves",c.fichier).then(function(u){if(u)window.open(u,"_blank");else setErr("Impossible de generer le lien du releve.");});
  }
  function retirerConciliation(c){
    sb.update("conciliations",c.id,{statut:"annulee"}).then(function(r){
      if(r&&r.error){setErr("ECHEC: "+(r.error.message||""));return;}
      sb.log("comptabilite","modification","Conciliation "+c.mois+" retiree","",sel.code||"");
      chargerTout();
    });
  }

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat.</div>;
  if(!sel)return null;

  var concilVisibles=conciliations.filter(function(c){return c.statut!=="annulee";});
  // Validation par compte par mois: y a-t-il deja une conciliation pour ce compte/mois?
  var dejaFaite=concilVisibles.find(function(c){return c.compte_bancaire_id===compteId&&c.mois===mois;});

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Conciliation bancaire</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Releve televerse, rapprochement automatique, ecarts ressortis - par compte, par mois</div>
        </div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:10}}>Nouvelle conciliation</div>
          <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div style={{width:280}}><Lbl l="Compte de banque"/>
              <select value={compteId} onChange={function(e){setCompteId(e.target.value);setReleve(null);setResultat(null);}} style={INP}>
                {banques.map(function(b){return <option key={b.id} value={b.id}>{libBanque(b)}</option>;})}
                {banques.length===0&&<option value="">Aucun compte configure</option>}
              </select>
            </div>
            <div style={{width:150}}><Lbl l="Mois"/><input type="month" value={mois} onChange={function(e){setMois(e.target.value);setReleve(null);setResultat(null);}} style={INP}/></div>
            <label style={{display:"inline-block",background:enCours?"#ccc":T.accent,color:"#fff",borderRadius:7,padding:"8px 18px",fontSize:12,fontWeight:600,cursor:enCours?"wait":"pointer"}}>
              {enCours?"Traitement...":"Televerser le releve de compte (PDF/photo)"}
              <input type="file" accept=".pdf,image/*" onChange={televerserReleve} disabled={enCours} style={{display:"none"}}/>
            </label>
            {dejaFaite&&<Bdg bg={dejaFaite.statut==="conciliee"?T.accentL:T.amberL} c={dejaFaite.statut==="conciliee"?T.accent:T.amber}>{dejaFaite.statut==="conciliee"?"DEJA CONCILIEE pour "+mois:"Deja traitee pour "+mois+" (avec ecarts)"}</Bdg>}
          </div>
          <div style={{fontSize:10,color:T.muted,marginTop:8}}>Le rapprochement compare le releve aux encaissements (y compris les LOTS et fichiers EFT), avances, factures fournisseurs payees et ecritures au journal du mois choisi.</div>
        </div>

        {releve&&resultat&&(
          <div style={{marginBottom:16}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:12}}>
              <div style={{background:T.blueL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Solde de depart (releve)</div><div style={{fontSize:15,fontWeight:800,color:T.blue}}>{money(releve.soldeDebut)}</div></div>
              <div style={{background:T.accentL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Depots</div><div style={{fontSize:15,fontWeight:800,color:T.accent}}>{money(resultat.totDepots)}</div></div>
              <div style={{background:T.amberL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Retraits</div><div style={{fontSize:15,fontWeight:800,color:T.amber}}>{money(resultat.totRetraits)}</div></div>
              <div style={{background:T.blueL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Solde de fin (releve)</div><div style={{fontSize:15,fontWeight:800,color:T.blue}}>{money(releve.soldeFin)}</div></div>
              <div style={{background:resultat.concilie?T.accentL:T.redL,borderRadius:10,padding:12}}>
                <div style={{fontSize:10,color:T.muted}}>Resultat</div>
                <div style={{fontSize:15,fontWeight:800,color:resultat.concilie?T.accent:T.red}}>{resultat.concilie?"CONCILIE":(resultat.ecartsBanque.length+resultat.ecartsSysteme.length)+" ECART(S)"}</div>
              </div>
            </div>
            {Math.abs(resultat.coherence)>0.015&&(
              <div style={{background:T.amberL,border:"1px solid "+T.amber+"66",borderRadius:8,padding:"8px 12px",fontSize:11,color:T.amber,fontWeight:700,marginBottom:10}}>
                ATTENTION: le releve lui-meme ne balance pas (depart + depots - retraits - fin = {money(resultat.coherence)}). L extraction a peut-etre manque une transaction - verifiez le document.
              </div>
            )}

            {resultat.ecartsBanque.length>0&&(
              <div style={{background:T.surface,border:"2px solid "+T.red,borderRadius:12,overflow:"hidden",marginBottom:12}}>
                <div style={{padding:"10px 14px",fontSize:12,fontWeight:800,color:T.red,background:T.redL}}>ECARTS - AU RELEVE mais INTROUVABLES dans le systeme ({resultat.ecartsBanque.length})</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <tbody>
                    {resultat.ecartsBanque.map(function(e2,ix){return(
                      <tr key={ix} style={{borderTop:"1px solid "+T.border}}>
                        <td style={{padding:"6px 14px",width:100}}>{e2.tx.date}</td>
                        <td style={{padding:"6px 14px"}}>{e2.tx.description}</td>
                        <td style={{padding:"6px 14px",width:90}}><Bdg bg={e2.sens==="depot"?T.accentL:T.amberL} c={e2.sens==="depot"?T.accent:T.amber}>{e2.sens==="depot"?"DEPOT":"RETRAIT"}</Bdg></td>
                        <td style={{padding:"6px 14px",textAlign:"right",fontWeight:800,color:T.red,width:110}}>{money(e2.montant)}</td>
                      </tr>
                    );})}
                  </tbody>
                </table>
                <div style={{padding:"8px 14px",fontSize:10,color:T.muted}}>A saisir dans le systeme (encaissement, facture, ecriture au journal) ou a questionner aupres de la banque (frais, erreurs).</div>
              </div>
            )}

            {resultat.ecartsSysteme.length>0&&(
              <div style={{background:T.surface,border:"2px solid "+T.amber,borderRadius:12,overflow:"hidden",marginBottom:12}}>
                <div style={{padding:"10px 14px",fontSize:12,fontWeight:800,color:T.amber,background:T.amberL}}>ECARTS - DANS LE SYSTEME mais ABSENTS du releve ({resultat.ecartsSysteme.length})</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <tbody>
                    {resultat.ecartsSysteme.map(function(it,ix){return(
                      <tr key={ix} style={{borderTop:"1px solid "+T.border}}>
                        <td style={{padding:"6px 14px",width:100}}>{it.date}</td>
                        <td style={{padding:"6px 14px"}}>{it.src}: {it.desc}{it.sansCompte?" (compte de banque non precise dans le systeme)":""}</td>
                        <td style={{padding:"6px 14px",width:90}}><Bdg bg={it.k==="depot"?T.accentL:T.amberL} c={it.k==="depot"?T.accent:T.amber}>{it.k==="depot"?"DEPOT":"RETRAIT"}</Bdg></td>
                        <td style={{padding:"6px 14px",textAlign:"right",fontWeight:800,color:T.amber,width:110}}>{money(it.montant)}</td>
                      </tr>
                    );})}
                  </tbody>
                </table>
                <div style={{padding:"8px 14px",fontSize:10,color:T.muted}}>Cheques non encaisses, depots en transit, ou transactions rattachees a un autre compte de banque.</div>
              </div>
            )}

            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,overflow:"hidden",marginBottom:12}}>
              <div style={{padding:"10px 14px",fontSize:12,fontWeight:800,color:T.accent,background:T.accentL}}>APPARIEES automatiquement ({resultat.apparies.length})</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <tbody>
                  {resultat.apparies.map(function(a2,ix){return(
                    <tr key={ix} style={{borderTop:"1px solid "+T.border}}>
                      <td style={{padding:"5px 14px",width:100}}>{a2.tx.date}</td>
                      <td style={{padding:"5px 14px"}}>{a2.tx.description}</td>
                      <td style={{padding:"5px 14px",color:T.accent,fontWeight:600}}>= {a2.avec.type}{a2.avec.desc?" - "+String(a2.avec.desc).substring(0,50):""}</td>
                      <td style={{padding:"5px 14px",textAlign:"right",fontWeight:700,color:T.navy,width:110}}>{money(a2.montant)}</td>
                    </tr>
                  );})}
                  {resultat.apparies.length===0&&<tr><td style={{padding:14,color:T.muted}}>Aucune transaction appariee.</td></tr>}
                </tbody>
              </table>
            </div>

            <Btn onClick={sauverConciliation} dis={enCours}>{enCours?"Sauvegarde...":"Sauvegarder la conciliation de "+mois+(resultat.concilie?" (CONCILIEE)":" (avec ecarts)")}</Btn>
          </div>
        )}

        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",fontSize:12,fontWeight:800,color:T.navy,borderBottom:"1px solid "+T.border}}>Registre des conciliations (validation par compte, par mois)</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:T.alt}}>
              {["Mois","Compte","Transactions","Appariees","Ecarts","Statut","Faite le",""].map(function(h,ix){return <th key={h+ix} style={{padding:"6px 10px",textAlign:ix>=2&&ix<=4?"right":"left",fontSize:9,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}
            </tr></thead>
            <tbody>
              {concilVisibles.map(function(c){
                var b=banques.find(function(x){return x.id===c.compte_bancaire_id;});
                return(
                  <tr key={c.id} style={{borderTop:"1px solid "+T.border,background:detail&&detail.id===c.id?T.blueL:"#fff"}}>
                    <td style={{padding:"6px 10px",fontWeight:800}}>{c.mois}</td>
                    <td style={{padding:"6px 10px"}}>{libBanque(b)}</td>
                    <td style={{padding:"6px 10px",textAlign:"right"}}>{c.nb_transactions}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",color:T.accent,fontWeight:700}}>{c.nb_apparies}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800,color:c.nb_ecarts>0?T.red:T.accent}}>{c.nb_ecarts}</td>
                    <td style={{padding:"6px 10px"}}><Bdg bg={c.statut==="conciliee"?T.accentL:T.redL} c={c.statut==="conciliee"?T.accent:T.red}>{c.statut==="conciliee"?"CONCILIEE":"AVEC ECARTS"}</Bdg></td>
                    <td style={{padding:"6px 10px",color:T.muted}}>{String(c.date_conciliation||"").substring(0,16).replace("T"," ")}</td>
                    <td style={{padding:"6px 10px"}}>
                      <div style={{display:"flex",gap:4,justifyContent:"flex-end",flexWrap:"wrap"}}>
                        <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){setDetail(detail&&detail.id===c.id?null:c);}}>{detail&&detail.id===c.id?"Fermer":"Details"}</Btn>
                        <Btn sm bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){voirReleve(c);}}>Releve</Btn>
                        <Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){retirerConciliation(c);}}>Retirer</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {concilVisibles.length===0&&<tr><td colSpan={8} style={{padding:20,textAlign:"center",color:T.muted}}>Aucune conciliation sauvegardee pour ce syndicat.</td></tr>}
            </tbody>
          </table>
          {detail&&(function(){
            var rr=detail.resultat||{};
            var eb=Array.isArray(rr.ecartsBanque)?rr.ecartsBanque:[];
            var es=Array.isArray(rr.ecartsSysteme)?rr.ecartsSysteme:[];
            return(
              <div style={{padding:"12px 14px",borderTop:"2px solid "+T.navy,background:T.bg}}>
                <div style={{fontSize:12,fontWeight:800,color:T.navy,marginBottom:8}}>Detail {detail.mois} - solde {money(detail.solde_debut)} a {money(detail.solde_fin)} - depots {money(rr.totDepots)} / retraits {money(rr.totRetraits)}</div>
                {eb.length>0&&<div style={{fontSize:11,color:T.red,fontWeight:700,marginBottom:4}}>Au releve, introuvables au systeme:</div>}
                {eb.map(function(e2,ix){return <div key={"b"+ix} style={{fontSize:11,color:T.navy,marginBottom:2}}>- {e2.tx.date} {e2.tx.description} ({e2.sens}) <b>{money(e2.montant)}</b></div>;})}
                {es.length>0&&<div style={{fontSize:11,color:T.amber,fontWeight:700,margin:"8px 0 4px"}}>Au systeme, absents du releve:</div>}
                {es.map(function(it,ix){return <div key={"s"+ix} style={{fontSize:11,color:T.navy,marginBottom:2}}>- {it.date} {it.src}: {it.desc} ({it.k}) <b>{money(it.montant)}</b></div>;})}
                {eb.length===0&&es.length===0&&<div style={{fontSize:11,color:T.accent,fontWeight:700}}>Aucun ecart - conciliation parfaite.</div>}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
