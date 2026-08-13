// Gestion PAR UNITE - l unite est l entite centrale:
// 1-2 coproprietaires (50/50), locataire/resident, urgence, chauffe-eau, assurance,
// informations bancaires de prelevement. La cotisation mensuelle est EN LECTURE SEULE:
// elle proviendra du module Budget (budget annuel x quote-part / 12).

import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Bdg(p){return <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap"}}>{p.children}</span>;}
function SecTitre(p){return <div style={{gridColumn:"1/-1",fontSize:11,fontWeight:800,color:p.c||T.navy,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"2px solid "+(p.c||T.navy)+"33",paddingBottom:4,marginTop:p.first?0:6}}>{p.l}</div>;}
// Petit bloc d information theme sur la fiche
function InfoBloc(p){
  return(
    <div style={{background:p.bg||T.alt,borderRadius:8,padding:"8px 10px",minWidth:0}}>
      <div style={{fontSize:9,fontWeight:800,color:p.c||T.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{p.titre}</div>
      <div style={{fontSize:11,color:"#1C1A17",lineHeight:1.45,wordBreak:"break-word"}}>{p.children}</div>
    </div>
  );
}

function fmtTel(v){var d=(v||"").replace(/\D/g,"").slice(0,10);if(d.length>6)return d.slice(0,3)+"-"+d.slice(3,6)+"-"+d.slice(6);if(d.length>3)return d.slice(0,3)+"-"+d.slice(3);return d;}
function joursAvant(d){if(!d)return null;return Math.ceil((new Date(d)-new Date())/86400000);}
function lireReponse(r){return r.text().then(function(t){try{return JSON.parse(t);}catch(e){return {error:"Reponse inattendue du serveur (code "+r.status+")"};}});}

// Convertit un fichier (pdf ou image) en base64; les images sont recompressees en JPEG
function fichierPourExtraction(file){
  return new Promise(function(resolve,reject){
    var isPdf=/pdf$/i.test(file.type)||/\.pdf$/i.test(file.name);
    var fr=new FileReader();
    fr.onerror=function(){reject(new Error("Lecture du fichier impossible"));};
    fr.onload=function(ev){
      var b64=String(ev.target.result).split(",")[1];
      if(isPdf){
        if(b64.length>4200000){reject(new Error("PDF trop volumineux pour l extraction automatique (max ~3 Mo)"));return;}
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

export default function Unites(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var unites=s2[0];var setUnites=s2[1];
  var s3=useState([]);var copros=s3[0];var setCopros=s3[1];
  var s4=useState(null);var editId=s4[0];var setEditId=s4[1];
  var s5=useState({});var nf=s5[0];var setNf=s5[1];
  var s6=useState("");var q=s6[0];var setQ=s6[1];
  var s7=useState(null);var venteId=s7[0];var setVenteId=s7[1];
  var s8=useState({});var vf=s8[0];var setVf=s8[1];
  var s9=useState(false);var venteEnCours=s9[0];var setVenteEnCours=s9[1];
  var s10=useState("");var msgVente=s10[0];var setMsgVente=s10[1];
  var s11=useState(null);var ceFile=s11[0];var setCeFile=s11[1];
  var s12=useState(null);var assFile=s12[0];var setAssFile=s12[1];
  var sCh=useState(null);var chequeFile=sCh[0];var setChequeFile=sCh[1];
  var sCh2=useState("");var chExtrait=sCh2[0];var setChExtrait=sCh2[1];
  var sDpa=useState(null);var dpaFile=sDpa[0];var setDpaFile=sDpa[1];
  var s13=useState("");var msgEdit=s13[0];var setMsgEdit=s13[1];
  var s14=useState(false);var editEnCours=s14[0];var setEditEnCours=s14[1];
  var s15=useState("");var assExtrait=s15[0];var setAssExtrait=s15[1];

  function voirFichier(chemin){
    sb.lienFichier("preuves",chemin).then(function(url){
      if(url)window.open(url,"_blank");
      else setMsgEdit("Impossible de generer le lien du fichier.");
    });
  }

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    sb.select("unites",{eq:{syndicat_id:sel.id},order:"no_unite.asc",limit:1000}).then(function(res){
      if(res&&res.data)setUnites(res.data);
    }).catch(function(){});
    sb.select("coproprietaires",{eq:{syndicat_id:sel.id},limit:2000}).then(function(res){
      if(res&&res.data)setCopros(res.data);
    }).catch(function(){});
  },[sel]);

  function toutePersonneDe(u){
    return copros.filter(function(c){return (c.unite_id&&c.unite_id===u.id)||(!c.unite_id&&c.unite===u.no_unite);});
  }
  function propsDe(u){return toutePersonneDe(u).filter(function(c){return c.statut!=="ancien";});}
  function anciensDe(u){return toutePersonneDe(u).filter(function(c){return c.statut==="ancien";});}

  function setV(k,v){setVf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function ouvrirVente(u){
    setVenteId(u.id);setMsgVente("");
    setVf({date_vente:new Date().toISOString().substring(0,10),p1_prenom:"",p1_nom:"",p1_courriel:"",p1_tel:"",p2_prenom:"",p2_nom:"",p2_courriel:"",p2_tel:""});
  }

  // TRANSACTION DE VENTE: cloture les proprietaires actuels a la date de vente
  // (fiches conservees avec statut "ancien" -> historique intact), cree le/les nouveaux.
  function executerVente(u){
    if(venteEnCours)return;
    if(!vf.p1_nom){setMsgVente("Le nom du nouveau proprietaire est requis.");return;}
    if(!vf.date_vente){setMsgVente("La date de vente est requise.");return;}
    setVenteEnCours(true);setMsgVente("");
    var actuels=propsDe(u);
    var frac=parseFloat(u.fraction)||0;
    var cot=parseFloat(u.cotisation_mensuelle)||0;
    var deux=!!(vf.p2_nom&&vf.p2_nom.trim());
    var nouveaux=[];
    var baseN={syndicat_id:u.syndicat_id,unite:u.no_unite,unite_id:u.id,adresse:u.adresse||"",code_acces:"",statut:"actif",pap:false,date_debut:vf.date_vente,assurance_police:"",assurance_exp:null};
    if(deux){
      nouveaux.push(Object.assign({},baseN,{prenom:vf.p1_prenom||"",nom:vf.p1_nom,courriel:vf.p1_courriel||"",telephone:vf.p1_tel||"",part_pourcent:50,fraction:Math.round(frac/2*1000)/1000,cotisation_mensuelle:Math.round(cot/2*100)/100}));
      nouveaux.push(Object.assign({},baseN,{prenom:vf.p2_prenom||"",nom:vf.p2_nom,courriel:vf.p2_courriel||"",telephone:vf.p2_tel||"",part_pourcent:50,fraction:Math.round(frac/2*1000)/1000,cotisation_mensuelle:Math.round(cot/2*100)/100}));
    }else{
      nouveaux.push(Object.assign({},baseN,{prenom:vf.p1_prenom||"",nom:vf.p1_nom,courriel:vf.p1_courriel||"",telephone:vf.p1_tel||"",part_pourcent:100,fraction:frac,cotisation_mensuelle:cot}));
    }
    Promise.all(actuels.map(function(c){
      return sb.update("coproprietaires",c.id,{statut:"ancien",date_fin:vf.date_vente,cotisation_mensuelle:0});
    })).then(function(){
      return Promise.all(nouveaux.map(function(n){return sb.insert("coproprietaires",n);}));
    }).then(function(rs){
      var ok=rs.every(function(r){return r&&r.data&&r.data.id;});
      if(!ok){setMsgVente("Erreur lors de la creation du nouveau proprietaire. Verifiez et reessayez.");setVenteEnCours(false);return;}
      sb.log("unites","vente","Vente unite "+u.no_unite+" le "+vf.date_vente+": "+actuels.map(function(c){return (c.prenom||"")+" "+(c.nom||"");}).join(", ")+" -> "+nouveaux.map(function(n){return (n.prenom||"")+" "+n.nom;}).join(", "),"",sel?sel.code||"":"");
      sb.select("coproprietaires",{eq:{syndicat_id:sel.id},limit:2000}).then(function(res){if(res&&res.data)setCopros(res.data);}).catch(function(){});
      setMsgVente("Vente enregistree: a partir du "+vf.date_vente+", les cotisations et cotisations speciales sont au nom du nouveau proprietaire. L historique de l unite est conserve.");
      setVenteEnCours(false);setVenteId(null);
    }).catch(function(e){setMsgVente("Erreur: "+(e.message||"inconnue"));setVenteEnCours(false);});
  }

  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function editer(u){
    setEditId(u.id);
    setCeFile(null);setAssFile(null);setChequeFile(null);setDpaFile(null);setChExtrait("");setMsgEdit("");setAssExtrait("");
    setNf({fraction:u.fraction!=null?String(u.fraction):"",
      chauffe_eau:u.chauffe_eau||"",ce_date_install:u.ce_date_install?String(u.ce_date_install).substring(0,7):"",
      assurance_police:u.assurance_police||"",assurance_debut:u.assurance_debut||"",assurance_exp:u.assurance_exp||"",ass_cie:u.ass_cie||"",
      occupation:u.occupation||(u.locataire?"locataire":"proprietaire"),
      nom_locataire:u.nom_locataire||"",tel_locataire:u.tel_locataire||"",courriel_locataire:u.courriel_locataire||"",
      urg_nom:u.urg_nom||"",urg_lien:u.urg_lien||"",urg_tel:u.urg_tel||"",urg_courriel:u.urg_courriel||"",pap_actif:!!u.pap_actif,
      banque_institution:u.banque_institution||"",banque_transit:u.banque_transit||"",banque_compte:u.banque_compte||"",
      stationnement:u.stationnement||"",rangement:u.rangement||"",notes:u.notes||""});
  }

  // Extraction automatique de la preuve d assurance televisee (police, assureur, dates)
  function extraireCheque(file){
    setChExtrait("Lecture du specimen de cheque en cours...");
    fichierPourExtraction(file).then(function(src){
      var corps=Object.assign({mode:"cheque"},src);
      return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify(corps)}).then(lireReponse);
    }).then(function(resp){
      if(!resp||resp.error){setChExtrait("Extraction impossible ("+((resp&&resp.error)||"erreur")+") - saisissez les champs manuellement.");return;}
      var d=resp.data||{};var pris=[];
      if(d.institution&&/^\d{3}$/.test(String(d.institution))){setN("banque_institution",String(d.institution));pris.push("institution "+d.institution);}
      if(d.transit&&/^\d{5}$/.test(String(d.transit))){setN("banque_transit",String(d.transit));pris.push("transit "+d.transit);}
      if(d.compte){var cpt=String(d.compte).replace(/\D/g,"").slice(0,12);if(cpt.length>=5){setN("banque_compte",cpt);pris.push("compte ****"+cpt.slice(-4));}}
      setChExtrait(pris.length>0?"Extrait du specimen: "+pris.join(", ")+(d.banque?" ("+d.banque+")":"")+" - verifiez avant de sauvegarder.":"Aucune information lisible sur ce specimen - saisissez manuellement.");
    }).catch(function(e){setChExtrait("Extraction impossible ("+e.message+") - saisissez manuellement.");});
  }

  function extraireAssurance(file){
    setAssExtrait("Extraction automatique des informations d assurance en cours...");
    fichierPourExtraction(file).then(function(src){
      var corps=Object.assign({mode:"assurance"},src);
      return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify(corps)}).then(lireReponse);
    }).then(function(resp){
      if(!resp||resp.error){setAssExtrait("Extraction impossible ("+((resp&&resp.error)||"erreur")+") - saisissez les champs manuellement.");return;}
      var d=resp.data||{};
      var pris=[];
      setNf(function(pr){
        var n=Object.assign({},pr);
        if(d.police){n.assurance_police=d.police;pris.push("police "+d.police);}
        if(d.compagnie){n.ass_cie=d.compagnie;pris.push(d.compagnie);}
        if(d.dateDebut&&/^\d{4}-\d{2}-\d{2}$/.test(d.dateDebut)){n.assurance_debut=d.dateDebut;pris.push("debut "+d.dateDebut);}
        if(d.dateExp&&/^\d{4}-\d{2}-\d{2}$/.test(d.dateExp)){n.assurance_exp=d.dateExp;pris.push("expiration "+d.dateExp);}
        return n;
      });
      setAssExtrait(pris.length>0?"Extrait automatiquement: "+pris.join(", ")+" - verifiez avant de sauvegarder.":"Aucune information lisible dans ce document - saisissez manuellement.");
    }).catch(function(e){setAssExtrait("Extraction impossible ("+e.message+") - saisissez les champs manuellement.");});
  }

  function sauvegarder(){
    if(editEnCours)return;
    setEditEnCours(true);setMsgEdit("");
    // NOTE: cotisation_mensuelle N EST PAS modifiable ici - elle proviendra du module Budget.
    var row={fraction:parseFloat(nf.fraction)||0,
      chauffe_eau:nf.chauffe_eau||"",ce_date_install:nf.ce_date_install?nf.ce_date_install+"-01":null,
      assurance_police:nf.assurance_police||"",assurance_debut:nf.assurance_debut||null,assurance_exp:nf.assurance_exp||null,ass_cie:nf.ass_cie||"",
      occupation:nf.occupation||"proprietaire",locataire:(nf.occupation==="locataire"||nf.occupation==="court_terme"),
      nom_locataire:nf.nom_locataire||"",tel_locataire:nf.tel_locataire||"",courriel_locataire:nf.courriel_locataire||"",
      urg_nom:nf.urg_nom||"",urg_lien:nf.urg_lien||"",urg_tel:nf.urg_tel||"",urg_courriel:nf.urg_courriel||"",
      pap_actif:!!nf.pap_actif,
      banque_institution:nf.banque_institution||"",banque_transit:nf.banque_transit||"",banque_compte:nf.banque_compte||"",
      stationnement:nf.stationnement||"",rangement:nf.rangement||"",notes:nf.notes||""};
    var uid=editId;
    var etapes=Promise.resolve();
    if(ceFile){
      etapes=etapes.then(function(){
        var ext=(ceFile.name.match(/\.[a-zA-Z0-9]+$/)||[".jpg"])[0];
        return sb.uploadFichier("preuves",(sel?sel.id:"x")+"/"+uid+"/chauffe-eau"+ext,ceFile).then(function(r){
          if(r.error)throw new Error("Photo chauffe-eau: "+r.error.message);
          row.ce_photo=r.chemin;
        });
      });
    }
    if(assFile){
      etapes=etapes.then(function(){
        var ext=(assFile.name.match(/\.[a-zA-Z0-9]+$/)||[".pdf"])[0];
        return sb.uploadFichier("preuves",(sel?sel.id:"x")+"/"+uid+"/assurance"+ext,assFile).then(function(r){
          if(r.error)throw new Error("Preuve assurance: "+r.error.message);
          row.assurance_doc=r.chemin;
        });
      });
    }
    if(chequeFile){
      etapes=etapes.then(function(){
        var ext=(chequeFile.name.match(/\.[a-zA-Z0-9]+$/)||[".pdf"])[0];
        return sb.uploadFichier("preuves",(sel?sel.id:"x")+"/"+uid+"/specimen-cheque"+ext,chequeFile).then(function(r){
          if(r.error)throw new Error("Specimen de cheque: "+r.error.message);
          row.cheque_doc=r.chemin;
        });
      });
    }
    if(dpaFile){
      etapes=etapes.then(function(){
        var ext=(dpaFile.name.match(/\.[a-zA-Z0-9]+$/)||[".pdf"])[0];
        return sb.uploadFichier("preuves",(sel?sel.id:"x")+"/"+uid+"/formulaire-dpa"+ext,dpaFile).then(function(r){
          if(r.error)throw new Error("Formulaire DPA: "+r.error.message);
          row.dpa_doc=r.chemin;
        });
      });
    }
    etapes.then(function(){
      return sb.update("unites",uid,row);
    }).then(function(res){
      if(res&&res.error){setMsgEdit("ECHEC de la sauvegarde: "+(res.error.message||"erreur"));setEditEnCours(false);return;}
      // Journal detaille: chaque champ modifie, de quoi a quoi
      var orig=unites.find(function(x){return x.id===uid;})||{};
      var diffs=[];
      Object.keys(row).forEach(function(k){
        var av=orig[k];var ap=row[k];
        if(String(av==null?"":av)!==String(ap==null?"":ap))diffs.push(k+": \""+(av==null?"":av)+"\" -> \""+(ap==null?"":ap)+"\"");
      });
      setUnites(function(prev){return prev.map(function(u){return u.id===uid?Object.assign({},u,row):u;});});
      sb.log("unites","modification","Unite "+(orig.no_unite||"")+" modifiee ("+diffs.length+" champ(s))",diffs.join(" | ").substring(0,1800),sel?sel.code||"":"");
      setCeFile(null);setAssFile(null);setEditEnCours(false);setEditId(null);
    }).catch(function(e){setMsgEdit("ECHEC: "+(e.message||"erreur inconnue"));setEditEnCours(false);});
  }

  var liste=unites.filter(function(u){
    if(!q)return true;
    var props=propsDe(u).map(function(c){return (c.prenom||"")+" "+(c.nom||"");}).join(" ");
    return ((u.no_unite||"")+" "+props+" "+(u.nom_locataire||"")).toLowerCase().indexOf(q.toLowerCase())>=0;
  });
  var totalFraction=unites.reduce(function(a,u){return a+(parseFloat(u.fraction)||0);},0);

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat.</div>;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Gestion par unite</div>
        <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <input value={q} onChange={function(e){setQ(e.target.value);}} placeholder="Chercher unite, proprietaire, locataire..." style={{flex:1,maxWidth:300,border:"1px solid #ffffff30",borderRadius:6,padding:"5px 10px",background:"#ffffff18",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none"}}/>
        <span style={{fontSize:11,color:"#8da0bb"}}>{unites.length} unite(s) - fractions: {totalFraction.toFixed(3)}%</span>
      </div>

      <div style={{padding:20}}>
        {msgVente&&!venteId&&<div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:600,marginBottom:14}}>{msgVente}</div>}
        {liste.map(function(u){
          var props=propsDe(u);
          var jrs=joursAvant(u.assurance_exp);
          var enEdition=editId===u.id;
          var occLbl=u.occupation==="locataire"||(!u.occupation&&u.locataire)?"Louee":u.occupation==="resident"?"Resident":u.occupation==="court_terme"?"Location court terme":"Proprietaire occupant";
          return(
            <div key={u.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:10}}>
                <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{width:52,height:38,borderRadius:8,background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#fff"}}>{u.no_unite}</div>
                  <Bdg bg={T.blueL} c={T.blue}>{(parseFloat(u.fraction)||0).toFixed(3)} %</Bdg>
                  {Number(u.cotisation_mensuelle)>0&&<Bdg>{Number(u.cotisation_mensuelle).toFixed(2)} $/mois</Bdg>}
                  {(u.occupation==="locataire"||(!u.occupation&&u.locataire))&&<Bdg bg={T.amberL} c={T.amber}>LOUEE{u.nom_locataire?": "+u.nom_locataire:""}</Bdg>}
                  {u.occupation==="resident"&&<Bdg bg={T.blueL} c={T.blue}>RESIDENT{u.nom_locataire?": "+u.nom_locataire:""}</Bdg>}
                  {u.occupation==="court_terme"&&<Bdg bg={T.purpleL} c={T.purple}>LOCATION COURT TERME</Bdg>}
                  {u.assurance_exp&&(jrs<0
                    ?<Bdg bg={T.redL} c={T.red}>Assurance EXPIREE</Bdg>
                    :jrs<=90?<Bdg bg={T.amberL} c={T.amber}>Assurance expire dans {jrs} j</Bdg>
                    :<Bdg>Assurance OK</Bdg>)}
                  {u.pap_actif?<Bdg bg={T.accentL} c={T.accent}>PAP ACTIF</Bdg>:<Bdg bg={T.alt} c={T.muted}>PAP inactif</Bdg>}
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <Btn sm onClick={function(){enEdition?setEditId(null):editer(u);}}>{enEdition?"Fermer":"Modifier"}</Btn>
                  <Btn sm bg={T.amber} onClick={function(){venteId===u.id?setVenteId(null):ouvrirVente(u);}}>{venteId===u.id?"Annuler la vente":"Vente de l unite"}</Btn>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:8}}>
                <InfoBloc titre="Proprietaire(s)" bg={T.accentL} c={T.accent}>
                  {props.length===0?"-":props.map(function(c,i){return(
                    <div key={i} style={{marginBottom:i<props.length-1?4:0}}>
                      <b>{((c.prenom||"")+" "+(c.nom||"")).trim()}</b>{props.length>1?" ("+(c.part_pourcent||50)+" %)":""}
                      <div style={{fontSize:10,color:T.muted}}>{c.courriel||"-"}{c.telephone?" | "+c.telephone:""}</div>
                    </div>
                  );})}
                </InfoBloc>
                <InfoBloc titre="Occupation" bg={T.blueL} c={T.blue}>
                  {occLbl}
                  {u.nom_locataire?<div>{u.nom_locataire}<div style={{fontSize:10,color:T.muted}}>{u.courriel_locataire||"-"}{u.tel_locataire?" | "+u.tel_locataire:""}</div></div>:null}
                </InfoBloc>
                <InfoBloc titre="Chauffe-eau" bg={T.purpleL} c={T.purple}>
                  {u.chauffe_eau||u.ce_date_install?(
                    <div>{u.chauffe_eau||"-"}{u.ce_date_install?<div style={{fontSize:10,color:T.muted}}>Installe {String(u.ce_date_install).substring(0,7)}</div>:null}
                    {u.ce_photo&&<button onClick={function(){voirFichier(u.ce_photo);}} style={{background:"none",border:"none",padding:0,fontSize:10,fontWeight:700,color:T.purple,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Voir la photo</button>}</div>
                  ):"-"}
                </InfoBloc>
                <InfoBloc titre="Assurance" bg={jrs!==null&&jrs<0?T.redL:T.accentL} c={jrs!==null&&jrs<0?T.red:T.accent}>
                  {u.assurance_police||u.assurance_exp?(
                    <div>{u.ass_cie||""} {u.assurance_police?"#"+u.assurance_police:""}
                      <div style={{fontSize:10,color:T.muted}}>{u.assurance_debut?"du "+u.assurance_debut:""} {u.assurance_exp?"au "+u.assurance_exp:""}</div>
                      {u.assurance_doc&&<button onClick={function(){voirFichier(u.assurance_doc);}} style={{background:"none",border:"none",padding:0,fontSize:10,fontWeight:700,color:T.accent,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Voir la preuve</button>}
                    </div>
                  ):"-"}
                </InfoBloc>
                <InfoBloc titre="Urgence" bg={T.amberL} c={T.amber}>
                  {u.urg_nom?(<div>{u.urg_nom}{u.urg_lien?" ("+u.urg_lien+")":""}<div style={{fontSize:10,color:T.muted}}>{u.urg_tel||""}{u.urg_courriel?" | "+u.urg_courriel:""}</div></div>):"-"}
                </InfoBloc>
                <InfoBloc titre="Divers">
                  {u.stationnement?"Stat. "+u.stationnement:""}{u.rangement?(u.stationnement?" | ":"")+"Rang. "+u.rangement:""}
                  {u.banque_institution||u.banque_compte||u.pap_actif!==undefined?<div style={{fontSize:10,fontWeight:700,color:u.pap_actif?T.accent:T.muted}}>{u.pap_actif?"PAP actif":(u.banque_institution?"PAP inactif (coordonnees fournies)":"PAP inactif")}</div>:null}
                  {!u.stationnement&&!u.rangement&&!u.banque_institution?"-":null}
                </InfoBloc>
              </div>
              {u.notes?<div style={{fontSize:10,color:T.muted,marginTop:6,fontStyle:"italic"}}>{u.notes}</div>:null}
              {anciensDe(u).length>0&&(
                <div style={{fontSize:10,color:T.muted,marginTop:4}}>
                  Anciens proprietaires: {anciensDe(u).map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim()+" ("+(c.date_debut||"?")+" au "+(c.date_fin||"?")+")";}).join(", ")}
                </div>
              )}

              {venteId===u.id&&(
                <div style={{marginTop:14,paddingTop:14,borderTop:"2px solid "+T.amber}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.amber,marginBottom:4}}>Vente de l unite {u.no_unite}</div>
                  <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Les proprietaires actuels seront archives a la date de vente (historique conserve). Les paiements et cotisations a partir de cette date seront au nom du nouveau proprietaire.</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
                    <div><Lbl l="Date de la vente"/><input type="date" value={vf.date_vente||""} onChange={function(e){setV("date_vente",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Nouveau prop. 1 - prenom"/><input value={vf.p1_prenom||""} onChange={function(e){setV("p1_prenom",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Nouveau prop. 1 - nom"/><input value={vf.p1_nom||""} onChange={function(e){setV("p1_nom",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Courriel"/><input value={vf.p1_courriel||""} onChange={function(e){setV("p1_courriel",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Telephone"/><input value={vf.p1_tel||""} onChange={function(e){setV("p1_tel",fmtTel(e.target.value));}} style={INP} maxLength={12}/></div>
                    <div><Lbl l="Prop. 2 - prenom (optionnel)"/><input value={vf.p2_prenom||""} onChange={function(e){setV("p2_prenom",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Prop. 2 - nom (optionnel)"/><input value={vf.p2_nom||""} onChange={function(e){setV("p2_nom",e.target.value);}} style={INP} placeholder="Si 2 proprietaires: 50/50"/></div>
                    <div><Lbl l="Prop. 2 - courriel"/><input value={vf.p2_courriel||""} onChange={function(e){setV("p2_courriel",e.target.value);}} style={INP}/></div>
                  </div>
                  {msgVente&&<div style={{background:msgVente.indexOf("Vente enregistree")===0?T.accentL:T.redL,border:"1px solid "+(msgVente.indexOf("Vente enregistree")===0?T.accent:T.red)+"44",borderRadius:8,padding:"8px 12px",fontSize:12,color:msgVente.indexOf("Vente enregistree")===0?T.accent:T.red,marginBottom:10}}>{msgVente}</div>}
                  <div style={{display:"flex",gap:8}}>
                    <Btn bg={T.amber} dis={venteEnCours} onClick={function(){executerVente(u);}}>{venteEnCours?"Transaction en cours...":"Confirmer la vente"}</Btn>
                    <Btn onClick={function(){setVenteId(null);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
                  </div>
                </div>
              )}

              {enEdition&&(
                <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid "+T.border}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
                    <SecTitre l="Unite" first/>
                    <div><Lbl l="Quote-part (%)"/><input type="number" step="0.001" value={nf.fraction} onChange={function(e){setN("fraction",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Cotisation ($/mois) - lecture seule"/><input value={u.cotisation_mensuelle?Number(u.cotisation_mensuelle).toFixed(2):"-"} readOnly style={Object.assign({},INP,{background:T.alt,color:T.muted})}/><div style={{fontSize:9,color:T.muted,marginTop:2}}>Calculee par le module Budget (quote-part x budget)</div></div>
                    <div><Lbl l="Stationnement"/><input value={nf.stationnement} onChange={function(e){setN("stationnement",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Rangement"/><input value={nf.rangement} onChange={function(e){setN("rangement",e.target.value);}} style={INP}/></div>

                    <SecTitre l="Occupation" c={T.blue}/>
                    <div><Lbl l="Occupation de l unite"/><select value={nf.occupation||"proprietaire"} onChange={function(e){setN("occupation",e.target.value);}} style={INP}>
                      <option value="proprietaire">Proprietaire occupant</option>
                      <option value="locataire">Louee (locataire)</option>
                      <option value="court_terme">Location COURT TERME (Airbnb etc. - pas de nom requis)</option>
                      <option value="resident">Resident (non locataire)</option>
                    </select></div>
                    {nf.occupation!=="court_terme"?<div><Lbl l={nf.occupation==="resident"?"Nom du resident":"Nom du locataire"}/><input value={nf.nom_locataire} onChange={function(e){setN("nom_locataire",e.target.value);}} style={INP}/></div>:<div style={{alignSelf:"end",fontSize:10,color:T.muted}}>Location court terme: aucun nom de locataire conserve.</div>}
                    <div><Lbl l="Telephone"/><input value={nf.tel_locataire} onChange={function(e){setN("tel_locataire",fmtTel(e.target.value));}} style={INP} maxLength={12}/></div>
                    <div><Lbl l="Courriel"/><input value={nf.courriel_locataire} onChange={function(e){setN("courriel_locataire",e.target.value.trim());}} style={INP}/></div>

                    <SecTitre l="Chauffe-eau" c={T.purple}/>
                    <div><Lbl l="Marque / modele"/><input value={nf.chauffe_eau} onChange={function(e){setN("chauffe_eau",e.target.value);}} style={INP} placeholder="Giant 60 gal"/></div>
                    <div><Lbl l="Installation (mois-annee)"/><input type="month" value={nf.ce_date_install||""} onChange={function(e){setN("ce_date_install",e.target.value);}} style={INP}/></div>
                    <div style={{gridColumn:"span 2"}}><Lbl l="Photo du chauffe-eau (preuve)"/><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><input type="file" accept="image/*,.pdf" onChange={function(e){setCeFile(e.target.files&&e.target.files[0]?e.target.files[0]:null);}} style={{fontSize:11,fontFamily:"inherit"}}/>{ceFile&&<span style={{fontSize:10,color:T.accent}}>{ceFile.name}</span>}{u.ce_photo&&<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){voirFichier(u.ce_photo);}}>Voir le document actuel</Btn>}</div></div>

                    <SecTitre l="Assurance" c={T.accent}/>
                    <div style={{gridColumn:"span 2"}}><Lbl l="Preuve d assurance (les champs se remplissent automatiquement)"/><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><input type="file" accept=".pdf,image/*" onChange={function(e){var f=e.target.files&&e.target.files[0]?e.target.files[0]:null;setAssFile(f);if(f)extraireAssurance(f);}} style={{fontSize:11,fontFamily:"inherit"}}/>{assFile&&<span style={{fontSize:10,color:T.accent}}>{assFile.name}</span>}{u.assurance_doc&&<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){voirFichier(u.assurance_doc);}}>Voir le document actuel</Btn>}</div></div>
                    <div><Lbl l="No police"/><input value={nf.assurance_police} onChange={function(e){setN("assurance_police",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Assureur"/><input value={nf.ass_cie} onChange={function(e){setN("ass_cie",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Debut"/><input type="date" value={nf.assurance_debut||""} onChange={function(e){setN("assurance_debut",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Expiration"/><input type="date" value={nf.assurance_exp||""} onChange={function(e){setN("assurance_exp",e.target.value);}} style={INP}/></div>
                    {assExtrait&&<div style={{gridColumn:"1/-1",background:T.blueL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.blue,fontWeight:600}}>{assExtrait}</div>}

                    <SecTitre l="Urgence" c={T.amber}/>
                    <div><Lbl l="Nom"/><input value={nf.urg_nom} onChange={function(e){setN("urg_nom",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Lien"/><input value={nf.urg_lien} onChange={function(e){setN("urg_lien",e.target.value);}} style={INP} placeholder="Fils, soeur..."/></div>
                    <div><Lbl l="Telephone"/><input value={nf.urg_tel} onChange={function(e){setN("urg_tel",fmtTel(e.target.value));}} style={INP} maxLength={12}/></div>
                    <div><Lbl l="Courriel"/><input value={nf.urg_courriel||""} onChange={function(e){setN("urg_courriel",e.target.value.trim());}} style={INP} placeholder="urgence@exemple.com"/></div>

                    <SecTitre l="Prelevement bancaire (PAP)" c={T.navy}/>
                    <div><Lbl l="Institution (3 chiffres)"/><input value={nf.banque_institution} onChange={function(e){setN("banque_institution",e.target.value.replace(/\D/g,"").slice(0,3));}} style={INP} placeholder="815"/></div>
                    <div><Lbl l="Transit (5 chiffres)"/><input value={nf.banque_transit} onChange={function(e){setN("banque_transit",e.target.value.replace(/\D/g,"").slice(0,5));}} style={INP} placeholder="30040"/></div>
                    <div><Lbl l="No de compte"/><input value={nf.banque_compte} onChange={function(e){setN("banque_compte",e.target.value.replace(/\D/g,"").slice(0,12));}} style={INP}/></div>
                    <div style={{alignSelf:"end"}}>
                      <Lbl l="Prelevement (PAP)"/>
                      <button onClick={function(){setN("pap_actif",!nf.pap_actif);}} style={{background:nf.pap_actif?T.accentL:T.alt,border:"2px solid "+(nf.pap_actif?T.accent:T.border),borderRadius:20,padding:"5px 16px",fontSize:11,fontWeight:800,color:nf.pap_actif?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit"}}>{nf.pap_actif?"PAP ACTIF":"PAP INACTIF"}</button>
                    </div>
                    <div style={{gridColumn:"span 2"}}>
                      <Lbl l="Specimen de cheque (les champs bancaires se remplissent automatiquement)"/>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <input type="file" accept=".pdf,image/*" onChange={function(e){var f=e.target.files&&e.target.files[0]?e.target.files[0]:null;setChequeFile(f);if(f)extraireCheque(f);}} style={{fontSize:11,fontFamily:"inherit"}}/>
                        {u.cheque_doc&&<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){voirFichier(u.cheque_doc);}}>Voir le specimen actuel</Btn>}
                      </div>
                      {chExtrait&&<div style={{fontSize:10,color:T.blue,fontWeight:600,marginTop:4}}>{chExtrait}</div>}
                    </div>
                    <div style={{gridColumn:"span 2"}}>
                      <Lbl l="Formulaire d adhesion DPA signe (obligatoire - regles de Paiements Canada)"/>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <input type="file" accept=".pdf,image/*" onChange={function(e){var f=e.target.files&&e.target.files[0]?e.target.files[0]:null;setDpaFile(f);}} style={{fontSize:11,fontFamily:"inherit"}}/>
                        {dpaFile&&<span style={{fontSize:10,color:T.accent}}>{dpaFile.name}</span>}
                        {u.dpa_doc&&<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){voirFichier(u.dpa_doc);}}>Voir le formulaire actuel</Btn>}
                      </div>
                    </div>
                    <div style={{gridColumn:"1/-1",fontSize:9,color:T.muted}}>Les informations bancaires appartiennent a l UNITE (transferees a la vente si le nouveau proprietaire les fournit). Le PAP ne devrait etre ACTIF qu avec un formulaire DPA signe au dossier.</div>

                    <div style={{gridColumn:"1/-1"}}><Lbl l="Notes"/><input value={nf.notes} onChange={function(e){setN("notes",e.target.value);}} style={INP}/></div>
                  </div>
                  {msgEdit&&<div style={{background:T.redL,border:"1px solid "+T.red+"44",borderRadius:8,padding:"8px 12px",fontSize:12,color:T.red,marginBottom:10}}>{msgEdit}</div>}
                  <div style={{display:"flex",gap:8}}>
                    <Btn onClick={sauvegarder} dis={editEnCours}>{editEnCours?"Sauvegarde en cours...":"Sauvegarder l unite"}</Btn>
                    <Btn onClick={function(){setEditId(null);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {liste.length===0&&<div style={{textAlign:"center",padding:40,color:T.muted,fontSize:12}}>{unites.length===0?"Aucune unite - creez un syndicat via l onboarding (les unites seront creees automatiquement).":"Aucun resultat pour cette recherche."}</div>}
      </div>
    </div>
  );
}
