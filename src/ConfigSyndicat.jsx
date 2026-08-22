// Predictek - CONFIGURATION DU SYNDICAT (cote CA)
// Regroupe TOUTES les regles configurables du syndicat: avis d assurance (delais,
// avis de non-conformite automatique), approbation des factures, quorum et convocation,
// interets sur arrerages, et liens vers le plan comptable.
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

// ----- Extraction automatique d une police d assurance televersee -----
function lireReponseC(r){return r.text().then(function(t){try{return JSON.parse(t);}catch(e){return {error:"Reponse inattendue du serveur (code "+r.status+")"};}});}
function fichierPourExtractionC(file){
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

function Carte(p){
  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:18,marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:2}}>{p.titre}</div>
      <div style={{fontSize:11,color:T.muted,marginBottom:12}}>{p.desc}</div>
      {p.children}
    </div>
  );
}

export default function ConfigSyndicat(p){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState({});var f=s2[0];var setF=s2[1];
  var s3=useState("");var msg=s3[0];var setMsg=s3[1];
  var s4=useState("");var err=s4[0];var setErr=s4[1];
  var s5=useState({delaiConv:"15",taux:"0"});var glob=s5[0];var setGlob=s5[1];
  var s6=useState(false);var saving=s6[0];var setSaving=s6[1];
  var s7=useState([{max:"1000",nb:"1"},{max:"5000",nb:"2"},{max:"10000",nb:"3"}]);var paliers=s7[0];var setPaliers=s7[1];
  var s8=useState([]);var banques=s8[0];var setBanques=s8[1];
  var s9=useState([]);var policeDocs=s9[0];var setPoliceDocs=s9[1];
  var s10=useState(false);var uploadPolice=s10[0];var setUploadPolice=s10[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(r){
      if(r&&r.data&&r.data.length>0){setSyndicats(r.data);setSel(r.data[0]);}
    }).catch(function(){});
    sb.select("config_publique",{limit:100}).then(function(r){
      if(r&&r.data){
        var g={delaiConv:"15",taux:"0"};
        r.data.forEach(function(x){
          if(x.cle==="delai_convocation_jours")g.delaiConv=x.valeur;
          if(x.cle==="taux_interet_retard")g.taux=x.valeur;
        });
        setGlob(g);
      }
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setF({
      ass_avis_avant1:sel.ass_avis_avant1!==null&&sel.ass_avis_avant1!==undefined?String(sel.ass_avis_avant1):"90",
      ass_avis_avant2:sel.ass_avis_avant2!==null&&sel.ass_avis_avant2!==undefined?String(sel.ass_avis_avant2):"30",
      ass_avis_apres:sel.ass_avis_apres!==null&&sel.ass_avis_apres!==undefined?String(sel.ass_avis_apres):"15",
      ass_nc_auto:!!sel.ass_nc_auto,
      ass_nc_delai:sel.ass_nc_delai!==null&&sel.ass_nc_delai!==undefined?String(sel.ass_nc_delai):"30",
      approb_seuil:sel.approb_seuil!==null&&sel.approb_seuil!==undefined?String(sel.approb_seuil):"0",
      approb_nb_max:sel.approb_nb_max?String(sel.approb_nb_max):"3",
      quorum_ago:sel.quorum_ago?String(sel.quorum_ago):"50",
      etude_assurance_ans:sel.etude_assurance_ans?String(sel.etude_assurance_ans):"5",
      etude_prevoyance_ans:sel.etude_prevoyance_ans?String(sel.etude_prevoyance_ans):"5",
      etude_assurance_date:sel.etude_assurance_date||"",
      etude_prevoyance_date:sel.etude_prevoyance_date||"",
      ass_syn_compagnie:sel.ass_syn_compagnie||"",
      ass_syn_police:sel.ass_syn_police||"",
      ass_syn_montant:sel.ass_syn_montant||"",
      assurance_syndicat_exp:sel.assurance_syndicat_exp||"",
      ce_duree_vie_ans:sel.ce_duree_vie_ans?String(sel.ce_duree_vie_ans):"12",
      pap_methode:sel.pap_methode||"desjardins",
      pap_orig_id:sel.pap_orig_id||"",
      pap_nom_long:sel.pap_nom_long||sel.nom||"",
      pap_nom_court:sel.pap_nom_court||"",
      pap_no_fichier:sel.pap_no_fichier||"1",
      pap_centre:sel.pap_centre||"81510",
      pap_compte_id:sel.pap_compte_id||"",
      pap_f_methode:sel.pap_f_methode||"desjardins",
      pap_f_orig_id:sel.pap_f_orig_id||"",
      pap_f_nom_long:sel.pap_f_nom_long||sel.nom||"",
      pap_f_nom_court:sel.pap_f_nom_court||"",
      pap_f_no_fichier:sel.pap_f_no_fichier||"1",
      pap_f_compte_id:sel.pap_f_compte_id||"",
      frais_nsf:sel.frais_nsf!==null&&sel.frais_nsf!==undefined?String(sel.frais_nsf):"0",
      releve_jour:sel.releve_jour?String(sel.releve_jour):"0",
      logo_data:sel.logo_data||""
    });
    sb.select("comptes_bancaires",{eq:{syndicat_id:sel.id},limit:20}).then(function(r){
      if(r&&r.data)setBanques(r.data);else setBanques([]);
    }).catch(function(){setBanques([]);});
    chargerPolices(sel.id);
    try{
      var pl=JSON.parse(sel.approb_paliers||"");
      if(Array.isArray(pl)&&pl.length>0)setPaliers(pl.slice(0,3).map(function(x){return {max:String(x.max),nb:String(x.nb)};}));
    }catch(e){}
  },[sel&&sel.id]);

  function majPalier(i,k,v){
    setPaliers(function(pr){var n=pr.slice();n[i]=Object.assign({},n[i]);n[i][k]=v;return n;});
  }

  function sf(k,v){setF(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  // ----- Documents de la police d assurance du syndicat (upload + visualisation) -----
  function chargerPolices(sid){
    sb.select("documents",{eq:{syndicat_id:sid,niveau:"syndicat",type_doc:"assurance"},order:"created_at.desc",limit:50}).then(function(r){
      if(r&&r.data)setPoliceDocs(r.data.filter(function(d){return d.statut!=="supprime";}));else setPoliceDocs([]);
    }).catch(function(){setPoliceDocs([]);});
  }
  function televerserPolices(ev){
    var files=Array.prototype.slice.call(ev.target.files||[]);
    ev.target.value="";
    if(files.length===0||!sel)return;
    setUploadPolice(true);setErr("");
    var auj=new Date().toISOString().substring(0,10);
    Promise.all(files.map(function(file){
      var nomProp=String(file.name||"police.pdf").replace(/[^a-zA-Z0-9._-]/g,"_");
      var chemin=sel.id+"/police-syndicat/"+Date.now()+"-"+nomProp;
      return sb.uploadFichier("preuves",chemin,file).then(function(up){
        if(!up||!up.chemin)return {error:(up&&up.error&&up.error.message)||"televersement echoue",nom:file.name};
        return sb.insert("documents",{syndicat_id:sel.id,niveau:"syndicat",nom:"Police d assurance - "+file.name,type_doc:"assurance",description:"Police maitresse du syndicat (televersee via Configuration)",date_doc:auj,confidentiel:false,url:"storage:"+up.chemin,taille_kb:Math.round((file.size||0)/1024)}).then(function(r2){
          if(!r2||!r2.data||!r2.data.id)return {error:(r2&&r2.error&&r2.error.message)||"insertion echouee",nom:file.name};
          return {ok:true,nom:file.name};
        });
      });
    })).then(function(rs){
      setUploadPolice(false);
      var oks=rs.filter(function(r){return r.ok;}).length;
      var echecs=rs.filter(function(r){return r.error;});
      if(echecs.length>0)setErr("ECHEC du televersement pour "+echecs.map(function(x){return x.nom+" ("+x.error+")";}).join(", "));
      if(oks>0){
        setMsg(oks+" police(s) televersee(s) - extraction automatique en cours (compagnie, no de police, expiration)...");
        sb.log("configuration","ajout",oks+" police(s) d assurance du syndicat televersee(s)","",sel.code||"");
        extrairePolice(files[0]);
      }
      chargerPolices(sel.id);
    }).catch(function(e){setUploadPolice(false);setErr("ECHEC: "+(e&&e.message?e.message:""));});
  }

  function supprimerPolice(d){
    sb.update("documents",d.id,{statut:"supprime"}).then(function(r){
      if(r&&r.error){setErr("ECHEC de la suppression: "+(r.error.message||"la colonne statut existe-t-elle sur documents? (SQL fourni)"));return;}
      setMsg("Document retire: "+(d.nom||"")+".");
      sb.log("configuration","modification","Police d assurance retiree: "+(d.nom||""),"",sel.code||"");
      chargerPolices(sel.id);setTimeout(function(){setMsg("");},5000);
    });
  }

  // Extraction automatique de la police televersee: compagnie, no de police, expiration
  // -> preremplit la carte Assurance du syndicat (verifier puis Sauvegarder la configuration)
  function extrairePolice(file){
    fichierPourExtractionC(file).then(function(src){
      var corps=Object.assign({mode:"assurance"},src);
      return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify(corps)}).then(lireReponseC);
    }).then(function(resp){
      if(!resp||resp.error){setMsg("");setErr("Police televersee, mais extraction impossible ("+((resp&&resp.error)||"erreur")+") - remplissez compagnie / no de police / expiration manuellement ci-dessus.");return;}
      var d=resp.data||{};var pris=[];var majS={};
      if(d.compagnie){majS.ass_syn_compagnie=d.compagnie;pris.push(d.compagnie);}
      if(d.police){majS.ass_syn_police=d.police;pris.push("police "+d.police);}
      if(d.dateExp&&/^\d{4}-\d{2}-\d{2}$/.test(d.dateExp)){majS.assurance_syndicat_exp=d.dateExp;pris.push("expiration "+d.dateExp);}
      if(d.montantResponsabilite)majS.ass_syn_montant=String(d.montantResponsabilite);
      setF(function(pr){return Object.assign({},pr,majS);});
      if(pris.length>0){
        // Sauvegarde IMMEDIATE dans la base (pas besoin de cliquer Sauvegarder)
        sb.update("syndicats",sel.id,majS).then(function(r3){
          if(r3&&r3.error){setErr("Extrait ("+pris.join(", ")+") mais ECHEC de la sauvegarde automatique: "+(r3.error.message||"")+" - cliquez Sauvegarder la configuration.");return;}
          setSel(function(pr){return Object.assign({},pr,majS);});
          setMsg("Police televersee, EXTRAITE et SAUVEGARDEE: "+pris.join(", ")+". Verifiez les champs de la carte Assurance du syndicat.");
          sb.log("configuration","modification","Police du syndicat extraite: "+pris.join(", "),"",sel.code||"");
        });
      }else{
        setMsg("");setErr("Police televersee, mais aucune information lisible extraite"+(resp.raw?" (reponse IA: "+String(resp.raw).substring(0,120)+")":"")+" - remplissez compagnie / no de police / expiration manuellement.");
      }
      setTimeout(function(){setMsg("");},15000);
    }).catch(function(e){setMsg("");setErr("Police televersee, mais extraction impossible ("+(e&&e.message?e.message:"erreur")+") - remplissez les champs manuellement.");});
  }
  function voirPolice(d){
    if(d.url&&d.url.indexOf("storage:")===0){
      sb.lienFichier("preuves",d.url.substring(8)).then(function(u){
        if(u)window.open(u,"_blank");
        else setErr("Impossible de generer le lien du document.");
      });
    }else if(d.url){window.open(d.url,"_blank");}
    else setErr("Ce document n a pas de fichier joint (entree d inventaire seulement, issue de l onboarding).");
  }

  var FONDS_NOMS={operation:"Fonds d operation",prevoyance:"Fonds de prevoyance",assurance:"Fonds d auto-assurance",special:"Fonds de travaux speciaux"};
  function libBanque(b){
    var nomF=FONDS_NOMS[b.fonds]||("Fonds "+(b.fonds||""));
    var cpt=b.no_compte?" (***"+String(b.no_compte).slice(-4)+")":"";
    return (b.nom?b.nom+" - ":"")+nomF+(b.banque?" - "+b.banque:"")+cpt;
  }

  // Logo du syndicat: lecture du fichier image, reduction a 420px max, stockage en data URL
  function chargerLogo(ev){
    var file=ev.target.files&&ev.target.files[0];
    if(!file)return;
    if(file.size>4000000){setErr("Image trop lourde (max 4 Mo). Choisissez une image plus petite.");return;}
    setErr("");
    var rd=new FileReader();
    rd.onload=function(e2){
      var img=new Image();
      img.onload=function(){
        var maxW=420;
        var ratio=img.width>maxW?maxW/img.width:1;
        var cv=document.createElement("canvas");
        cv.width=Math.round(img.width*ratio);cv.height=Math.round(img.height*ratio);
        var cx=cv.getContext("2d");
        cx.drawImage(img,0,0,cv.width,cv.height);
        var data=cv.toDataURL("image/png");
        if(data.length>900000){data=cv.toDataURL("image/jpeg",0.85);}
        sf("logo_data",data);
        setMsg("Logo charge - cliquez Sauvegarder la configuration pour l enregistrer.");
        setTimeout(function(){setMsg("");},6000);
      };
      img.onerror=function(){setErr("ECHEC: ce fichier n est pas une image lisible (utilisez PNG ou JPG).");};
      img.src=e2.target.result;
    };
    rd.readAsDataURL(file);
    ev.target.value="";
  }

  function sauvegarder(){
    if(!sel||saving)return;
    setSaving(true);setErr("");setMsg("");
    var maj={
      ass_avis_avant1:parseInt(f.ass_avis_avant1)||90,
      ass_avis_avant2:parseInt(f.ass_avis_avant2)||30,
      ass_avis_apres:parseInt(f.ass_avis_apres)||15,
      ass_nc_auto:!!f.ass_nc_auto,
      ass_nc_delai:parseInt(f.ass_nc_delai)||30,
      approb_seuil:parseFloat(f.approb_seuil)||0,
      approb_nb_max:Math.max(1,parseInt(f.approb_nb_max)||3),
      approb_paliers:JSON.stringify(paliers.filter(function(x){return parseFloat(x.max)>0;}).map(function(x){return {max:parseFloat(x.max)||0,nb:Math.max(1,parseInt(x.nb)||1)};}).sort(function(a,b){return a.max-b.max;})),
      approb_requises:Math.max(1,parseInt(paliers[0]&&paliers[0].nb)||1),
      quorum_ago:parseInt(f.quorum_ago)||50,
      etude_assurance_ans:Math.max(1,parseInt(f.etude_assurance_ans)||5),
      etude_prevoyance_ans:Math.max(1,parseInt(f.etude_prevoyance_ans)||5),
      etude_assurance_date:f.etude_assurance_date||null,
      etude_prevoyance_date:f.etude_prevoyance_date||null,
      ass_syn_compagnie:f.ass_syn_compagnie||"",
      ass_syn_police:f.ass_syn_police||"",
      ass_syn_montant:f.ass_syn_montant||"",
      assurance_syndicat_exp:f.assurance_syndicat_exp||null,
      ce_duree_vie_ans:Math.max(1,parseInt(f.ce_duree_vie_ans)||12),
      pap_methode:f.pap_methode||"desjardins",
      pap_orig_id:(f.pap_orig_id||"").toUpperCase().slice(0,10),
      pap_nom_long:(f.pap_nom_long||"").slice(0,30),
      pap_nom_court:(f.pap_nom_court||"").slice(0,15),
      pap_no_fichier:String(parseInt(f.pap_no_fichier)||1),
      pap_centre:(f.pap_centre||"").replace(/\D/g,"").slice(0,5),
      pap_compte_id:f.pap_compte_id||null,
      pap_f_methode:f.pap_f_methode||"desjardins",
      pap_f_orig_id:(f.pap_f_orig_id||"").toUpperCase().slice(0,10),
      pap_f_nom_long:(f.pap_f_nom_long||"").slice(0,30),
      pap_f_nom_court:(f.pap_f_nom_court||"").slice(0,15),
      pap_f_no_fichier:String(parseInt(f.pap_f_no_fichier)||1),
      pap_f_compte_id:f.pap_f_compte_id||null,
      frais_nsf:parseFloat(f.frais_nsf)||0,
      releve_jour:Math.min(28,Math.max(0,parseInt(f.releve_jour)||0)),
      logo_data:f.logo_data||""
    };
    sb.update("syndicats",sel.id,maj).then(function(r){
      if(r&&r.error){setSaving(false);setErr("ECHEC de la sauvegarde: "+(r.error.message||"les colonnes ass_avis_* existent-elles? (SQL fourni)"));return;}
      return sb.upsert("config_publique",[
        {cle:"delai_convocation_jours",valeur:String(parseInt(glob.delaiConv)||15)},
        {cle:"taux_interet_retard",valeur:String(parseFloat(glob.taux)||0)}
      ],"cle").then(function(){
        setSaving(false);
        setSel(Object.assign({},sel,maj));
        setMsg("Configuration sauvegardee pour "+sel.nom+".");
        sb.log("configuration","modification","Configuration du syndicat mise a jour (avis assurance "+maj.ass_avis_avant1+"/"+maj.ass_avis_avant2+"/+"+maj.ass_avis_apres+"j"+(maj.ass_nc_auto?", NC auto "+maj.ass_nc_delai+"j":"")+", approbation par paliers, quorum "+maj.quorum_ago+"%)","",sel.code||"");
        setTimeout(function(){setMsg("");},5000);
      });
    }).catch(function(e){setSaving(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat - creez d abord un syndicat via Configuration Predictek.</div>;
  if(!sel)return null;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Configuration du syndicat</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Toutes les regles configurables au meme endroit</div>
        </div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{marginLeft:"auto"}}>
          <Btn onClick={sauvegarder} dis={saving}>{saving?"Sauvegarde...":"Sauvegarder la configuration"}</Btn>
        </div>
      </div>

      <div style={{padding:20,maxWidth:980}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <Carte titre="Avis d assurance ET de chauffe-eau des unites" desc="Chaque unite doit fournir sa preuve d assurance et l age de son chauffe-eau. Les MEMES delais d avis servent aux deux: le moteur de relances envoie les avis par courriel avant/apres l echeance de l assurance ET avant/apres la fin de vie du chauffe-eau (date d installation + duree de vie ci-dessous).">
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
            <div><Lbl l="1er avis AVANT l echeance (jours)"/><input type="number" min="0" value={f.ass_avis_avant1||""} onChange={function(e){sf("ass_avis_avant1",e.target.value);}} style={INP}/></div>
            <div><Lbl l="2e avis AVANT l echeance (jours)"/><input type="number" min="0" value={f.ass_avis_avant2||""} onChange={function(e){sf("ass_avis_avant2",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Relance APRES l echeance (jours)"/><input type="number" min="0" value={f.ass_avis_apres||""} onChange={function(e){sf("ass_avis_apres",e.target.value);}} style={INP}/></div>
            <div style={{background:T.blueL,borderRadius:8,padding:"6px 10px"}}><Lbl l="Duree de vie d un chauffe-eau (annees)"/><input type="number" min="1" max="30" value={f.ce_duree_vie_ans||""} onChange={function(e){sf("ce_duree_vie_ans",e.target.value);}} style={INP}/></div>
          </div>
          <div style={{display:"flex",gap:14,alignItems:"flex-end",flexWrap:"wrap",background:f.ass_nc_auto?T.amberL:T.alt,borderRadius:10,padding:12}}>
            <div>
              <Lbl l="Avis de non-conformite AUTOMATIQUE si non fournie"/>
              <button onClick={function(){sf("ass_nc_auto",!f.ass_nc_auto);}} style={{background:f.ass_nc_auto?T.amberL:T.alt,border:"2px solid "+(f.ass_nc_auto?T.amber:T.border),borderRadius:20,padding:"6px 16px",fontSize:11,fontWeight:800,color:f.ass_nc_auto?T.amber:T.muted,cursor:"pointer",fontFamily:"inherit"}}>{f.ass_nc_auto?"ACTIF":"Inactif"}</button>
            </div>
            {f.ass_nc_auto&&<div style={{width:220}}><Lbl l="Delai pour corriger sur l avis (jours)"/><input type="number" min="1" value={f.ass_nc_delai||""} onChange={function(e){sf("ass_nc_delai",e.target.value);}} style={INP}/></div>}
            <div style={{fontSize:10,color:T.muted,flex:1,minWidth:220}}>Si la preuve n est toujours pas fournie apres la relance post-echeance, un avis de non-conformite est cree automatiquement (module Avis de non-conformite). Activez seulement si votre reglement de l immeuble l exige et le permet.</div>
          </div>
        </Carte>

        <Carte titre="Approbation des factures - PAR PALIERS" desc="En dessous du seuil d approbation automatique, la facture est approuvee sans intervention. Au-dela, le nombre d approbations du CA requis depend du montant (avis courriel automatique aux membres du CA).">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
            <div><Lbl l="Approbation AUTOMATIQUE en dessous de ($)"/><input type="number" step="0.01" min="0" value={f.approb_seuil||""} onChange={function(e){sf("approb_seuil",e.target.value);}} style={INP} placeholder="0 = tout requiert approbation"/></div>
          </div>
          <table style={{width:"100%",maxWidth:520,borderCollapse:"collapse",fontSize:12,marginBottom:8}}>
            <thead><tr style={{background:T.alt}}>
              <th style={{padding:"6px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>Palier (montant et moins)</th>
              <th style={{padding:"6px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>Approbations requises</th>
            </tr></thead>
            <tbody>
              {paliers.map(function(pl,i){return(
                <tr key={i} style={{borderTop:"1px solid "+T.border}}>
                  <td style={{padding:"6px 10px"}}><input type="number" step="0.01" min="0" value={pl.max} onChange={function(e){majPalier(i,"max",e.target.value);}} style={INP} placeholder={i===0?"1000":i===1?"5000":"10000"}/></td>
                  <td style={{padding:"6px 10px"}}><input type="number" min="1" max="9" value={pl.nb} onChange={function(e){majPalier(i,"nb",e.target.value);}} style={INP}/></td>
                </tr>
              );})}
              <tr style={{borderTop:"1px solid "+T.border,background:T.amberL}}>
                <td style={{padding:"6px 10px",fontWeight:700,color:T.amber}}>AU-DELA du dernier palier</td>
                <td style={{padding:"6px 10px"}}><input type="number" min="1" max="9" value={f.approb_nb_max||""} onChange={function(e){sf("approb_nb_max",e.target.value);}} style={INP}/></td>
              </tr>
            </tbody>
          </table>
          <div style={{fontSize:10,color:T.muted}}>Exemple: 1000 $ et moins = 1 approbation; 5000 $ et moins = 2; 10 000 $ et moins = 3; au-dela = le nombre au-dela.</div>
        </Carte>

        <Carte titre="Assemblees" desc="Quorum requis aux assemblees (selon votre declaration de copropriete) et delai minimal de convocation.">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <div><Lbl l="Quorum AGO (%)"/><input type="number" min="10" max="90" value={f.quorum_ago||""} onChange={function(e){sf("quorum_ago",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Delai de convocation (jours) - global"/><input type="number" min="1" value={glob.delaiConv} onChange={function(e){setGlob(Object.assign({},glob,{delaiConv:e.target.value}));}} style={INP}/></div>
          </div>
        </Carte>

        <Carte titre="Interets sur les arrerages" desc="Taux annuel applique au calcul des arrerages dans Encaissements (selon votre declaration de copropriete).">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <div><Lbl l="Taux d interet annuel (%) - global"/><input type="number" step="0.01" min="0" value={glob.taux} onChange={function(e){setGlob(Object.assign({},glob,{taux:e.target.value}));}} style={INP}/></div>
          </div>
        </Carte>

        <Carte titre="Assurance du syndicat (police maitresse)" desc="Ces informations proviennent de la police televersee a la creation du syndicat et figurent sur l attestation du notaire - completez ce qui manque.">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
            <div><Lbl l="Compagnie d assurance"/><input value={f.ass_syn_compagnie||""} onChange={function(e){sf("ass_syn_compagnie",e.target.value);}} style={INP}/></div>
            <div><Lbl l="No de police"/><input value={f.ass_syn_police||""} onChange={function(e){sf("ass_syn_police",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Expiration de la police"/><input type="date" value={f.assurance_syndicat_exp||""} onChange={function(e){sf("assurance_syndicat_exp",e.target.value);}} style={INP}/></div>
          </div>
          <div style={{background:T.alt,borderRadius:10,padding:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:policeDocs.length>0?10:0}}>
              <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase"}}>Documents de la police ({policeDocs.length})</div>
              <label style={{display:"inline-block",background:T.blueL,color:T.blue,border:"1px solid "+T.blue+"44",borderRadius:7,padding:"6px 13px",fontSize:11,fontWeight:700,cursor:uploadPolice?"wait":"pointer",marginLeft:"auto"}}>
                {uploadPolice?"Televersement...":"+ Televerser une ou des police(s) (PDF)"}
                <input type="file" accept=".pdf,image/*" multiple onChange={televerserPolices} disabled={uploadPolice} style={{display:"none"}}/>
              </label>
            </div>
            {policeDocs.map(function(d){
              return(
                <div key={d.id} style={{display:"flex",alignItems:"center",gap:10,background:"#fff",border:"1px solid "+T.border,borderRadius:8,padding:"7px 12px",marginBottom:6}}>
                  <span style={{background:T.blueL,color:T.blue,borderRadius:20,padding:"1px 8px",fontSize:9,fontWeight:800}}>ASSURANCE</span>
                  <div style={{flex:1,minWidth:180}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.navy}}>{d.nom}</div>
                    <div style={{fontSize:10,color:T.muted}}>{d.date_doc?"Date: "+String(d.date_doc).substring(0,10):""}{d.taille_kb?" - "+d.taille_kb+" ko":""}{!d.url?" - INVENTAIRE SEULEMENT (fichier non joint a l onboarding)":""}</div>
                  </div>
                  {d.url?<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){voirPolice(d);}}>Visualiser</Btn>:null}
                  <Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){supprimerPolice(d);}}>Supprimer</Btn>
                </div>
              );
            })}
            {policeDocs.length===0&&<div style={{fontSize:11,color:T.muted,marginTop:8}}>Aucun document de police pour ce syndicat - televersez le PDF de la police maitresse ci-dessus.</div>}
          </div>
        </Carte>

        <Carte titre="Etudes reglementaires" desc="Etude aux fins d assurance et etude du fonds de prevoyance (Loi 16). L intervalle est propre a CE syndicat. Le moteur de relances alerte l administrateur 6 mois avant l echeance pour lancer l appel d offres.">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{background:T.alt,borderRadius:10,padding:12}}>
              <div style={{fontSize:11,fontWeight:800,color:T.navy,marginBottom:10,textTransform:"uppercase"}}>Etude aux fins d assurance</div>
              <div style={{marginBottom:10}}><Lbl l="Date de la derniere etude / validation"/><input type="date" value={f.etude_assurance_date||""} onChange={function(e){sf("etude_assurance_date",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Intervalle de renouvellement (annees)"/><input type="number" min="1" max="10" value={f.etude_assurance_ans||""} onChange={function(e){sf("etude_assurance_ans",e.target.value);}} style={INP}/></div>
              {f.etude_assurance_date&&parseInt(f.etude_assurance_ans)>0&&(function(){var d=new Date(f.etude_assurance_date+"T12:00:00");d.setFullYear(d.getFullYear()+parseInt(f.etude_assurance_ans));return <div style={{fontSize:10,color:T.amber,fontWeight:700,marginTop:8}}>Prochaine echeance: {d.toISOString().substring(0,10)}</div>;})()}
            </div>
            <div style={{background:T.alt,borderRadius:10,padding:12}}>
              <div style={{fontSize:11,fontWeight:800,color:T.navy,marginBottom:10,textTransform:"uppercase"}}>Etude du fonds de prevoyance (Loi 16)</div>
              <div style={{marginBottom:10}}><Lbl l="Date de la derniere etude / validation"/><input type="date" value={f.etude_prevoyance_date||""} onChange={function(e){sf("etude_prevoyance_date",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Intervalle de renouvellement (annees)"/><input type="number" min="1" max="10" value={f.etude_prevoyance_ans||""} onChange={function(e){sf("etude_prevoyance_ans",e.target.value);}} style={INP}/></div>
              {f.etude_prevoyance_date&&parseInt(f.etude_prevoyance_ans)>0&&(function(){var d=new Date(f.etude_prevoyance_date+"T12:00:00");d.setFullYear(d.getFullYear()+parseInt(f.etude_prevoyance_ans));return <div style={{fontSize:10,color:T.amber,fontWeight:700,marginTop:8}}>Prochaine echeance: {d.toISOString().substring(0,10)}</div>;})()}
            </div>
          </div>
        </Carte>

        <Carte titre="Logo du syndicat" desc="Ce logo apparait sur les avis de non-conformite, attestations, factures aux copros et tous les rapports de CE syndicat. Si aucun logo n est fourni, le logo Predictek (Configuration Predictek) est utilise.">
          <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{width:180,height:90,border:"1px dashed "+T.border,borderRadius:10,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              {f.logo_data?<img src={f.logo_data} alt="Logo" style={{maxWidth:"100%",maxHeight:"100%"}}/>:<span style={{fontSize:10,color:T.muted}}>Aucun logo - logo Predictek utilise</span>}
            </div>
            <div>
              <label style={{display:"inline-block",background:T.blueL,color:T.blue,border:"1px solid "+T.blue+"44",borderRadius:7,padding:"7px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                Choisir une image (PNG/JPG)
                <input type="file" accept="image/*" onChange={chargerLogo} style={{display:"none"}}/>
              </label>
              {f.logo_data&&<div style={{marginTop:8}}><Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){sf("logo_data","");}}>Retirer le logo</Btn></div>}
              <div style={{fontSize:10,color:T.muted,marginTop:8}}>L image est reduite automatiquement. N oubliez pas de cliquer Sauvegarder la configuration.</div>
            </div>
          </div>
        </Carte>

        <Carte titre="Prelevements automatises des coproprietaires (PAP / fichier EFT)" desc="Parametres du service de debits preautorises de votre institution. Le fichier EFT genere dans Encaissements - Prelevements utilise ces informations.">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:10}}>
            <div><Lbl l="Methode utilisee"/>
              <select value={f.pap_methode||"desjardins"} onChange={function(e){
                var v=e.target.value;
                setF(function(pr){var n=Object.assign({},pr);n.pap_methode=v;n.pap_centre=v==="desjardins"?"81510":"";return n;});
              }} style={INP}>
                <option value="desjardins">Debit pre-autorise Desjardins</option>
                <option value="bnc">Debit pre-autorise BNC</option>
                <option value="bmo">Debit pre-autorise BMO</option>
                <option value="cpa005">Autre institution (CPA-005)</option>
              </select>
            </div>
            <div><Lbl l="Nom d utilisateur / no d emetteur (10 car.)"/><input value={f.pap_orig_id||""} onChange={function(e){sf("pap_orig_id",e.target.value.toUpperCase().slice(0,10));}} style={INP}/></div>
            <div><Lbl l={"Centre de donnees"+(f.pap_methode==="desjardins"?" (Desjardins: 81510)":" (fourni par votre institution)")}/><input value={f.pap_centre||""} onChange={function(e){sf("pap_centre",e.target.value.replace(/\D/g,"").slice(0,5));}} style={INP}/></div>
            <div><Lbl l="Nom LONG de la copropriete (releve bancaire)"/><input value={f.pap_nom_long||""} onChange={function(e){sf("pap_nom_long",e.target.value.slice(0,30));}} style={INP}/></div>
            <div><Lbl l="Nom COURT du syndicat (transaction)"/><input value={f.pap_nom_court||""} onChange={function(e){sf("pap_nom_court",e.target.value.slice(0,15));}} style={INP}/></div>
            <div><Lbl l="No du prochain fichier a la banque"/><input value={f.pap_no_fichier||""} onChange={function(e){sf("pap_no_fichier",e.target.value.replace(/\D/g,"").slice(0,4));}} style={INP}/></div>
            <div style={{gridColumn:"span 2"}}><Lbl l="Compte de banque du syndicat (depot et retours)"/>
              <select value={f.pap_compte_id||""} onChange={function(e){sf("pap_compte_id",e.target.value);}} style={INP}>
                <option value="">Choisir un compte...</option>
                {banques.map(function(b){return <option key={b.id} value={b.id}>{libBanque(b)}</option>;})}
              </select>
            </div>
          </div>
          <div style={{fontSize:10,color:T.muted}}>Les comptes proviennent de Finances - Comptabilite - Comptes bancaires par fonds. Les fichiers generes sont conserves dans Encaissements - Prelevements (Voir les fichiers).</div>
        </Carte>

        <Carte titre="Paiements automatises AUX FOURNISSEURS (fichier EFT)" desc="Memes parametres, pour PAYER les factures fournisseurs par transfert electronique de fonds (credits). Le fichier se genere dans Finances - Factures a payer.">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:10}}>
            <div><Lbl l="Methode utilisee"/>
              <select value={f.pap_f_methode||"desjardins"} onChange={function(e){sf("pap_f_methode",e.target.value);}} style={INP}>
                <option value="desjardins">Debit pre-autorise Desjardins</option>
                <option value="bnc">Debit pre-autorise BNC</option>
                <option value="bmo">Debit pre-autorise BMO</option>
                <option value="cpa005">Autre institution (CPA-005)</option>
              </select>
            </div>
            <div><Lbl l="Nom d utilisateur / no d emetteur (10 car.)"/><input value={f.pap_f_orig_id||""} onChange={function(e){sf("pap_f_orig_id",e.target.value.toUpperCase().slice(0,10));}} style={INP} placeholder="Souvent le meme numero"/></div>
            <div><Lbl l="No du prochain fichier a la banque"/><input value={f.pap_f_no_fichier||""} onChange={function(e){sf("pap_f_no_fichier",e.target.value.replace(/\D/g,"").slice(0,4));}} style={INP}/></div>
            <div><Lbl l="Nom LONG de la copropriete"/><input value={f.pap_f_nom_long||""} onChange={function(e){sf("pap_f_nom_long",e.target.value.slice(0,30));}} style={INP}/></div>
            <div><Lbl l="Nom COURT du syndicat"/><input value={f.pap_f_nom_court||""} onChange={function(e){sf("pap_f_nom_court",e.target.value.slice(0,15));}} style={INP}/></div>
            <div><Lbl l="Compte de banque debite (paiements)"/>
              <select value={f.pap_f_compte_id||""} onChange={function(e){sf("pap_f_compte_id",e.target.value);}} style={INP}>
                <option value="">Choisir un compte...</option>
                {banques.map(function(b){return <option key={b.id} value={b.id}>{libBanque(b)}</option>;})}
              </select>
            </div>
          </div>
          <div style={{fontSize:10,color:T.muted}}>Chaque fournisseur paye par EFT doit avoir ses coordonnees bancaires dans sa fiche (module Fournisseurs).</div>
        </Carte>

        <Carte titre="Releve de compte mensuel des coproprietaires" desc="Chaque mois, le releve de compte (cotisation, paiements recus, solde) est envoye automatiquement par courriel a chaque coproprietaire, le jour choisi. Tant que le mode production n est pas actif, ces courriels sont rediriges vers l administrateur avec le prefixe [TEST].">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <div><Lbl l="Jour du mois de l envoi (1 a 28)"/>
              <select value={f.releve_jour||"0"} onChange={function(e){sf("releve_jour",e.target.value);}} style={INP}>
                <option value="0">Ne pas envoyer automatiquement</option>
                {Array.apply(null,{length:28}).map(function(_,i){return <option key={i+1} value={String(i+1)}>Le {i+1} de chaque mois</option>;})}
              </select>
            </div>
          </div>
        </Carte>

        <Carte titre="Frais pour fonds insuffisants (NSF)" desc="Lorsqu un prelevement rebondit (provision insuffisante), ce montant est refacture automatiquement au coproprietaire en plus de la cotisation (bouton Rebond NSF dans Encaissements).">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <div><Lbl l="Frais factures par votre banque ($)"/><input type="number" step="0.01" min="0" value={f.frais_nsf||""} onChange={function(e){sf("frais_nsf",e.target.value);}} style={INP}/></div>
          </div>
        </Carte>

        <Carte titre="Autres configurations" desc="Regles gerees dans leurs modules respectifs - acces direct.">
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){if(p&&p.onNavigate)p.onNavigate("plancomptable");}}>Plan comptable du syndicat</Btn>
            <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){if(p&&p.onNavigate)p.onNavigate("banques");}}>Comptes bancaires par fonds</Btn>
            <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){if(p&&p.onNavigate)p.onNavigate("fondsview");}}>Comptabilite par fonds</Btn>
          </div>
          <div style={{fontSize:10,color:T.muted,marginTop:10}}>Le logo de l entreprise et les informations du syndicat (adresse, courriels, exercice) se configurent dans Predictek - Configuration.</div>
        </Carte>
      </div>
    </div>
  );
}
