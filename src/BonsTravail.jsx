
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var STATUTS_BT={nouveau:{l:"Nouveau",bg:"#EFF6FF",tc:"#1A56DB"},soumis:{l:"Soumis",bg:"#FEF3E2",tc:"#B86020"},approuve:{l:"Approuve",bg:"#D4EDDA",tc:"#155724"},en_cours:{l:"En cours",bg:"#E8F2EC",tc:"#1B5E3B"},termine:{l:"Termine",bg:"#D4EDDA",tc:"#155724"},annule:{l:"Annule",bg:"#F0EDE8",tc:"#7C7568"}};
var PRIORITES={basse:{l:"Basse",c:"#7C7568"},normale:{l:"Normale",c:"#1A56DB"},haute:{l:"Haute",c:"#B86020"},urgente:{l:"Urgente",c:"#B83232"}};

function CardBon(p){
  var b=p.bon;
  var s=STATUTS_BT[b.statut]||STATUTS_BT.nouveau;
  var prio=PRIORITES[b.priorite]||PRIORITES.normale;
  return(
    <div style={{background:T.surface,border:"1px solid "+(b.priorite==="urgente"?T.red:T.border),borderRadius:12,padding:16,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
            <span style={{background:s.bg,color:s.tc,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{s.l}</span>
            <span style={{fontSize:11,fontWeight:700,color:prio.c}}>Priorite: {prio.l}</span>
            {b.no_bon&&<span style={{fontSize:10,color:T.muted}}>No: {b.no_bon}</span>}
          </div>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>{b.titre}</div>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>{b.description}</div>
          <div style={{display:"flex",gap:12,fontSize:11,color:T.muted,flexWrap:"wrap"}}>
            {b.fournisseur_nom&&<span>Fournisseur: <b style={{color:T.navy}}>{b.fournisseur_nom}</b></span>}
            {b.unite&&<span>Unite: <b style={{color:T.navy}}>{b.unite}</b></span>}
            {b.date_debut&&<span>Debut: {b.date_debut}</span>}
            {b.date_fin&&<span>Fin prevue: {b.date_fin}</span>}
            {b.cout_estime&&<span>Cout: <b style={{color:T.accent}}>{Number(b.cout_estime).toFixed(2)} $</b></span>}
            {b.cout_final&&<span>Final: <b style={{color:T.navy}}>{Number(b.cout_final).toFixed(2)} $</b></span>}
          </div>
          {b.envoye_le&&<div style={{fontSize:10,color:T.accent,fontWeight:700,marginTop:4}}>ENVOYE au fournisseur le {String(b.envoye_le).substring(0,16).replace("T"," ")}{b.envoye_a?" ("+b.envoye_a+")":""}</div>}
          {(function(){var ph=[];try{ph=Array.isArray(b.photos)?b.photos:JSON.parse(b.photos||"[]");}catch(e){ph=[];}
            return ph.length>0?<div style={{fontSize:10,color:T.blue,fontWeight:700,marginTop:4}}>{ph.length} photo(s)/piece(s) jointe(s): {ph.map(function(c,ix){return <span key={ix} style={{textDecoration:"underline",cursor:"pointer",marginRight:6}} onClick={function(){p.onPhoto(c);}}>Piece {ix+1}</span>;})}</div>:null;})()}
          {b.notes&&<div style={{fontSize:11,color:T.muted,marginTop:6,fontStyle:"italic"}}>{b.notes}</div>}
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:12,flexWrap:"wrap"}}>
          <Btn sm onClick={function(){p.onEdit(b);}}>Modifier</Btn>
          <Btn sm bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){p.onImprimer(b);}}>Imprimer (PDF)</Btn>
          {b.fournisseur_nom&&<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){p.onEnvoyer(b);}}>{b.envoye_le?"Renvoyer au fournisseur":"Envoyer au fournisseur"}</Btn>}
          {b.statut==="nouveau"&&<Btn sm bg={T.amberL} tc={T.amber} bdr={"1px solid "+T.amber+"44"} onClick={function(){p.onChangeStatut(b.id,"soumis");}}>Soumettre</Btn>}
          {b.statut==="soumis"&&<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){p.onChangeStatut(b.id,"approuve");}}>Approuver</Btn>}
          {b.statut==="approuve"&&<Btn sm bg={T.blue} onClick={function(){p.onChangeStatut(b.id,"en_cours");}}>Demarrer</Btn>}
          {b.statut==="en_cours"&&<Btn sm onClick={function(){p.onChangeStatut(b.id,"termine");}}>Terminer</Btn>}
        </div>
      </div>
    </div>
  );
}

var VIDE_B={titre:"",description:"",priorite:"normale",statut:"nouveau",fournisseur_nom:"",unite:"",date_debut:"",date_fin:"",cout_estime:"",cout_final:"",no_bon:"",notes:""};

export default function BonsTravail(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var bons=s2[0];var setBons=s2[1];
  var s3=useState(false);var showForm=s3[0];var setShowForm=s3[1];
  var s4=useState(VIDE_B);var nf=s4[0];var setNf=s4[1];
  var s5=useState(null);var editId=s5[0];var setEditId=s5[1];
  var s6=useState("actifs");var vue=s6[0];var setVue=s6[1];
  var s7=useState(false);var saving=s7[0];var setSaving=s7[1];
  var s8=useState([]);var fournisseurs=s8[0];var setFournisseurs=s8[1];
  var s9=useState([]);var unitesSyn=s9[0];var setUnitesSyn=s9[1];
  var s10=useState(false);var uniteLibre=s10[0];var setUniteLibre=s10[1];
  var s11=useState("");var errB=s11[0];var setErrB=s11[1];
  var s12=useState("");var msgB=s12[0];var setMsgB=s12[1];
  var s13=useState([]);var fichiersBon=s13[0];var setFichiersBon=s13[1];
  var s14=useState([]);var photosExist=s14[0];var setPhotosExist=s14[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
    sb.select("fournisseurs",{eq:{actif:true},order:"nom.asc"}).then(function(res){
      if(res&&res.data)setFournisseurs(res.data);
    }).catch(function(){});
    // Prefill depuis la fiche fournisseur (bouton + Bon de travaux du module Fournisseurs)
    try{
      var pre=localStorage.getItem("predictek_bon_prefill");
      if(pre){
        localStorage.removeItem("predictek_bon_prefill");
        var d=JSON.parse(pre);
        if(d&&d.fournisseur){setNf(Object.assign({},VIDE_B,{fournisseur_nom:d.fournisseur}));setEditId(null);setShowForm(true);}
      }
    }catch(e){}
  },[]);

  useEffect(function(){
    if(!sel)return;
    setBons([]);
    sb.select("bons_travail",{eq:{syndicat_id:sel.id},order:"created_at.desc"}).then(function(res){
      if(res&&res.data)setBons(res.data);
    }).catch(function(){});
    sb.select("unites",{eq:{syndicat_id:sel.id},order:"no_unite.asc",limit:1000}).then(function(res){
      if(res&&res.data)setUnitesSyn(res.data);else setUnitesSyn([]);
    }).catch(function(){setUnitesSyn([]);});
  },[sel]);

  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  async function sauvegarder(){
    if(saving)return;
    if(!sel){setErrB("ECHEC: aucun syndicat selectionne (le syndicat se choisit dans le bandeau du haut).");return;}
    if(!nf.titre){setErrB("Le titre du bon est requis.");return;}
    setSaving(true);setErrB("");setMsgB("");
    // Numero de PO a compteur automatique, prefixe du code client (syndicat)
    var no=nf.no_bon||("PO-"+String(sel.code||"SYN").toUpperCase()+"-"+String(bons.length+1).padStart(4,"0"));
    // Televersement des photos / fichiers joints (camera, bibliotheque ou fichier)
    var photos=photosExist.slice();
    for(var i=0;i<fichiersBon.length;i++){
      var file=fichiersBon[i];
      var nomProp=String(file.name||("photo-"+(i+1)+".jpg")).replace(/[^a-zA-Z0-9._-]/g,"_");
      var chemin=sel.id+"/bons/"+Date.now()+"-"+i+"-"+nomProp;
      var up=await sb.uploadFichier("preuves",chemin,file);
      if(up&&up.chemin)photos.push(up.chemin);
      else{setSaving(false);setErrB("ECHEC du televersement de "+file.name+": "+((up&&up.error&&up.error.message)||"erreur")+". Rien n a ete sauvegarde.");return;}
    }
    var row={syndicat_id:sel.id,titre:nf.titre,description:nf.description||"",priorite:nf.priorite||"normale",statut:nf.statut||"nouveau",fournisseur_nom:nf.fournisseur_nom||"",unite:nf.unite||"",date_debut:nf.date_debut||null,date_fin:nf.date_fin||null,cout_estime:parseFloat(nf.cout_estime)||null,cout_final:parseFloat(nf.cout_final)||null,no_bon:no,notes:nf.notes||"",photos:photos};
    var op=editId?sb.update("bons_travail",editId,row):sb.insert("bons_travail",row);
    op.then(function(res){
      if(res&&res.error&&String(res.error.message||"").indexOf("photos")>=0){
        // Colonne photos absente (SQL non execute): on sauvegarde sans les photos et on le DIT
        var row2=Object.assign({},row);delete row2.photos;
        var op2=editId?sb.update("bons_travail",editId,row2):sb.insert("bons_travail",row2);
        return op2.then(function(res2){finir(res2,row2," ATTENTION: la colonne photos n existe pas encore dans la base (SQL fourni) - le bon est sauvegarde SANS les photos.");});
      }
      finir(res,row,"");
    }).catch(function(e){setSaving(false);setErrB("ECHEC de la sauvegarde: "+(e&&e.message?e.message:"erreur"));});
    function finir(res,rowOk,avert){
      setSaving(false);
      if(res&&res.error){setErrB("ECHEC de la sauvegarde du bon: "+(res.error.message||""));return;}
      if(!editId&&!(res&&res.data&&res.data.id)){setErrB("ECHEC: le bon n a PAS ete enregistre"+((res&&res.error&&res.error.message)?" ("+res.error.message+")":"")+".");return;}
      if(editId){setBons(function(prev){return prev.map(function(b){return b.id===editId?Object.assign({},b,rowOk):b;});});}
      else if(res&&res.data){setBons(function(prev){return [res.data].concat(prev);});}
      sb.log("bons_travail",editId?"modification":"creation",(editId?"Modification":"Creation")+" bon "+no+": "+nf.titre,"",sel.code||"");
      setMsgB("Bon "+no+" sauvegarde."+avert);
      setShowForm(false);setNf(VIDE_B);setEditId(null);setFichiersBon([]);setPhotosExist([]);
      setTimeout(function(){setMsgB("");},8000);
    }
  }

  function editer(b){
    setNf({titre:b.titre||"",description:b.description||"",priorite:b.priorite||"normale",statut:b.statut||"nouveau",fournisseur_nom:b.fournisseur_nom||"",unite:b.unite||"",date_debut:b.date_debut||"",date_fin:b.date_fin||"",cout_estime:b.cout_estime||"",cout_final:b.cout_final||"",no_bon:b.no_bon||"",notes:b.notes||""});
    setUniteLibre(!!b.unite&&b.unite!=="Parties communes"&&!unitesSyn.some(function(u){return u.no_unite===b.unite;}));
    var ph=[];try{ph=Array.isArray(b.photos)?b.photos.slice():JSON.parse(b.photos||"[]");}catch(e){ph=[];}
    setPhotosExist(ph);setFichiersBon([]);
    setEditId(b.id);setShowForm(true);setErrB("");
  }

  function voirPhoto(chemin){
    sb.lienFichier("preuves",chemin).then(function(u){
      if(u)window.open(u,"_blank");
    });
  }

  // Impression du bon (PO) - via la fenetre d impression (Enregistrer en PDF)
  function imprimerBon(b){
    var fo=fournisseurs.find(function(x){return String(x.nom||"").trim().toLowerCase()===String(b.fournisseur_nom||"").trim().toLowerCase();});
    var logo=(sel&&sel.logo_data)||"";
    if(!logo){try{logo=localStorage.getItem("predictek_logo")||"";}catch(e){}}
    var ph=[];try{ph=Array.isArray(b.photos)?b.photos:JSON.parse(b.photos||"[]");}catch(e){ph=[];}
    Promise.all(ph.slice(0,6).map(function(c){return sb.lienFichier("preuves",c);})).then(function(urls){
      var w=window.open("","_blank","width=900,height=700");
      if(!w)return;
      var esc=function(v){return String(v||"").replace(/</g,"&lt;");};
      var h="<html><head><title>Bon de travail "+esc(b.no_bon)+"</title><style>"
        +"body{font-family:Georgia,serif;color:#1C1A17;margin:36px;font-size:12px}"
        +"h1{font-size:18px;margin:8px 0 2px}"
        +"table{width:100%;border-collapse:collapse;margin-top:10px}"
        +"td{border:1px solid #bbb;padding:7px 10px;vertical-align:top}"
        +"td.l{width:34%;background:#F5F3EE;font-weight:bold}"
        +".muted{color:#666;font-size:10px}"
        +"img.ph{max-width:280px;max-height:220px;margin:6px 8px 0 0;border:1px solid #999;border-radius:4px}"
        +"</style></head><body>"
        +(logo?"<div style='border-bottom:3px solid #1B5E3B;padding-bottom:10px;margin-bottom:8px'><img src='"+logo+"' style='height:52px'/></div>":"")
        +"<h1>BON DE TRAVAIL "+esc(b.no_bon)+"</h1>"
        +"<div class='muted'>"+esc(sel?sel.nom:"")+(sel&&sel.adr?" - "+esc(sel.adr):"")+(sel&&sel.ville?", "+esc(sel.ville):"")+"</div>"
        +"<table>"
        +"<tr><td class='l'>Fournisseur</td><td>"+esc(b.fournisseur_nom||"-")+(fo&&fo.courriel?" ("+esc(fo.courriel)+")":"")+(fo&&fo.telephone?" - "+esc(fo.telephone):"")+"</td></tr>"
        +"<tr><td class='l'>Unite / emplacement</td><td>"+esc(b.unite||"-")+"</td></tr>"
        +"<tr><td class='l'>Date prevue</td><td>"+esc(b.date_debut||"-")+"</td></tr>"
        +"<tr><td class='l'>Fin prevue</td><td>"+esc(b.date_fin||"-")+"</td></tr>"
        +"<tr><td class='l'>Travaux</td><td><b>"+esc(b.titre||"")+"</b></td></tr>"
        +"<tr><td class='l'>Description</td><td>"+esc(b.description||"")+"</td></tr>"
        +(b.cout_estime?"<tr><td class='l'>Cout estime</td><td>"+Number(b.cout_estime).toFixed(2)+" $</td></tr>":"")
        +(b.notes?"<tr><td class='l'>Notes</td><td>"+esc(b.notes)+"</td></tr>":"")
        +"<tr><td class='l'>Priorite</td><td>"+esc((PRIORITES[b.priorite]||{}).l||b.priorite)+"</td></tr>"
        +"</table>";
      var imgs=(urls||[]).filter(Boolean);
      if(imgs.length>0){
        h+="<div style='margin-top:12px;font-weight:bold'>Photos jointes ("+imgs.length+")</div>";
        imgs.forEach(function(u){h+="<img class='ph' src='"+u+"'/>";});
      }
      var USER={};try{USER=JSON.parse(localStorage.getItem("predictek_user")||"{}")||{};}catch(e){}
      var creeLe=b.created_at?new Date(b.created_at).toLocaleString("fr-CA",{hour12:false}).replace(",","").substring(0,17):"";
      h+="<br/><table>"
        +"<tr><td class='l'>Demandeur</td><td>"+esc(USER.nom||"")+(creeLe?" - bon cree le "+creeLe:"")+"</td></tr>"
        +"<tr><td class='l'>Signature du fournisseur</td><td style='height:40px'></td></tr>"
        +"</table>";
      h+="<div class='muted' style='margin-top:14px'>Genere par Predictek le "+new Date().toLocaleDateString("fr-CA")+". Utilisez Imprimer - Enregistrer en PDF.</div>";
      h+="<script>window.print();</script></body></html>";
      w.document.write(h);
      w.document.close();
    });
  }

  // Envoi DIRECT du bon (PO) au fournisseur par courriel (serveur), avec trace
  // horodatee de l envoi, comme les invitations. En mode essais, le courriel est
  // redirige vers l administrateur avec un prefixe [TEST].
  function envoyerBon(b){
    var fo=fournisseurs.find(function(x){return String(x.nom||"").trim().toLowerCase()===String(b.fournisseur_nom||"").trim().toLowerCase();});
    var courriel=fo&&fo.courriel?fo.courriel:"";
    if(!courriel){setErrB("Ce fournisseur n a pas de courriel dans sa fiche (module Fournisseurs). Ajoutez-le d abord.");return;}
    setErrB("");setMsgB("Envoi du bon "+(b.no_bon||"")+" en cours...");
    var sujet="Bon de travail "+(b.no_bon||"")+" - "+(sel?sel.nom:"");
    var corps="Bonjour,\n\nVeuillez trouver ci-dessous le bon de travaux.\n\n"
      +"No de PO: "+(b.no_bon||"")+"\n"
      +"Syndicat: "+(sel?sel.nom:"")+"\n"
      +(b.unite?"Unite / emplacement: "+b.unite+"\n":"")
      +(b.date_debut?"Date prevue: "+b.date_debut+"\n":"")
      +(b.date_fin?"Fin prevue: "+b.date_fin+"\n":"")
      +"Travaux: "+(b.titre||"")+"\n"
      +(b.description?"Description: "+b.description+"\n":"")
      +(b.cout_estime?"Cout estime: "+Number(b.cout_estime).toFixed(2)+" $\n":"")
      +"\nMerci de confirmer la reception et la date d execution.\n\n"+(sel?sel.nom:"");
    fetch("/api/envoi",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify({destinataire:courriel,sujet:sujet,corps:corps})})
      .then(function(r){return r.json().catch(function(){return {error:"Reponse inattendue du serveur"};});})
      .then(function(d){
        if(!d||d.error){setMsgB("");setErrB("ECHEC de l envoi du bon: "+((d&&d.error)||"erreur")+".");return;}
        var quand=new Date().toISOString();
        sb.update("bons_travail",b.id,{envoye_le:quand,envoye_a:courriel}).then(function(r2){
          if(r2&&r2.error){setErrB("Courriel envoye, mais ECHEC de la trace d envoi: "+(r2.error.message||"colonnes envoye_le/envoye_a manquantes (SQL fourni)"));return;}
          setBons(function(prev){return prev.map(function(x){return x.id===b.id?Object.assign({},x,{envoye_le:quand,envoye_a:courriel}):x;});});
          setMsgB("Bon "+(b.no_bon||"")+" ENVOYE a "+courriel+(d.redirection?" - "+d.redirection:"")+".");
          sb.log("bons_travail","envoi","Bon "+(b.no_bon||"")+" envoye a "+courriel+(d.production?"":" (mode TEST)"),"",sel.code||"");
          setTimeout(function(){setMsgB("");},9000);
        });
      })
      .catch(function(e){setMsgB("");setErrB("ECHEC de l envoi: "+(e&&e.message?e.message:"erreur reseau"));});
  }

  function changerStatut(id,statut){
    sb.update("bons_travail",id,{statut:statut}).then(function(){
      setBons(function(prev){return prev.map(function(b){return b.id===id?Object.assign({},b,{statut:statut}):b;});});
    }).catch(function(){});
  }

  var VUES=[{id:"actifs",l:"Actifs"},{id:"termines",l:"Termines"},{id:"tous",l:"Tous"}];
  var filtres=bons.filter(function(b){
    if(vue==="actifs")return b.statut!=="termine"&&b.statut!=="annule";
    if(vue==="termines")return b.statut==="termine";
    return true;
  });

  var totEstime=filtres.filter(function(b){return b.cout_estime;}).reduce(function(a,b){return a+Number(b.cout_estime||0);},0);
  var totFinal=filtres.filter(function(b){return b.cout_final;}).reduce(function(a,b){return a+Number(b.cout_final||0);},0);
  var urgents=bons.filter(function(b){return b.priorite==="urgente"&&b.statut!=="termine"&&b.statut!=="annule";}).length;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Bons de travail</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
          {VUES.map(function(v){var a=vue===v.id;return <button key={v.id} onClick={function(){setVue(v.id);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",padding:"6px 14px",color:a?"#fff":"#8da0bb",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:400}}>{v.l}</button>;})}
        </div>
        <Btn onClick={function(){setNf(VIDE_B);setEditId(null);setFichiersBon([]);setPhotosExist([]);setErrB("");setShowForm(true);}}>+ Nouveau bon</Btn>
      </div>

      <div style={{padding:20}}>
        {msgB&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msgB}</div>}
        {errB&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{errB}</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Actifs</div><div style={{fontSize:26,fontWeight:800,color:T.navy}}>{bons.filter(function(b){return b.statut!=="termine"&&b.statut!=="annule";}).length}</div></div>
          <div style={{background:urgents>0?T.redL:T.surface,border:"1px solid "+(urgents>0?T.red+"44":T.border),borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Urgents</div><div style={{fontSize:26,fontWeight:800,color:urgents>0?T.red:T.muted}}>{urgents}</div></div>
          <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Cout estime</div><div style={{fontSize:20,fontWeight:800,color:T.accent}}>{totEstime.toFixed(0)} $</div></div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Cout final</div><div style={{fontSize:20,fontWeight:800,color:T.navy}}>{totFinal.toFixed(0)} $</div></div>
        </div>

        {showForm&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>{editId?"Modifier le bon":"Nouveau bon de travail"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:12}}>
              <div><Lbl l="Fournisseur assigne"/><select value={nf.fournisseur_nom} onChange={function(e){setN("fournisseur_nom",e.target.value);}} style={INP}><option value="">Choisir...</option>{fournisseurs.map(function(f){return <option key={f.id}>{f.nom}</option>;})}</select></div>
              <div><Lbl l="Unite concernee"/>
                <select value={uniteLibre?"__autre":(nf.unite||"")} onChange={function(e){
                  var v=e.target.value;
                  if(v==="__autre"){setUniteLibre(true);setN("unite","");}
                  else{setUniteLibre(false);setN("unite",v);}
                }} style={INP}>
                  <option value="">Choisir...</option>
                  <option value="Parties communes">Parties communes</option>
                  {unitesSyn.map(function(u){return <option key={u.id} value={u.no_unite}>Unite {u.no_unite}</option>;})}
                  <option value="__autre">Autre (saisir librement)</option>
                </select>
                {uniteLibre&&<input value={nf.unite} onChange={function(e){setN("unite",e.target.value);}} style={Object.assign({},INP,{marginTop:6})}/>}
              </div>
              <div><Lbl l="Date debut prevue"/><input type="date" value={nf.date_debut} onChange={function(e){setN("date_debut",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Date fin prevue"/><input type="date" value={nf.date_fin} onChange={function(e){setN("date_fin",e.target.value);}} style={INP}/></div>
              <div><Lbl l="No de bon (PO) - automatique si vide"/><input value={nf.no_bon} onChange={function(e){setN("no_bon",e.target.value);}} style={INP} placeholder={"PO-"+String((sel&&sel.code)||"SYN").toUpperCase()+"-"+String(bons.length+1).padStart(4,"0")}/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Titre"/><input value={nf.titre} onChange={function(e){setN("titre",e.target.value);}} style={INP}/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Description"/><textarea value={nf.description} onChange={function(e){setN("description",e.target.value);}} style={Object.assign({},INP,{minHeight:70,resize:"vertical"})}/></div>
              <div><Lbl l="Priorite"/><select value={nf.priorite} onChange={function(e){setN("priorite",e.target.value);}} style={INP}>{Object.entries(PRIORITES).map(function(e){return <option key={e[0]} value={e[0]}>{e[1].l}</option>;})}</select></div>
              <div><Lbl l="Statut"/><select value={nf.statut} onChange={function(e){setN("statut",e.target.value);}} style={INP}>{Object.entries(STATUTS_BT).map(function(e){return <option key={e[0]} value={e[0]}>{e[1].l}</option>;})}</select></div>
              <div><Lbl l="Cout estime ($)"/><input type="number" step="100" value={nf.cout_estime} onChange={function(e){setN("cout_estime",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Cout final ($) si connu"/><input type="number" step="0.01" value={nf.cout_final} onChange={function(e){setN("cout_final",e.target.value);}} style={INP}/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Notes"/><textarea value={nf.notes} onChange={function(e){setN("notes",e.target.value);}} style={Object.assign({},INP,{minHeight:50,resize:"vertical"})}/></div>
              <div style={{gridColumn:"1/-1",background:T.blueL,borderRadius:10,padding:12}}>
                <Lbl l="Photos et pieces jointes (une ou plusieurs)"/>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                  <label style={{display:"inline-block",background:"#fff",color:T.blue,border:"1px solid "+T.blue+"44",borderRadius:7,padding:"6px 13px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                    Prendre une photo (camera)
                    <input type="file" accept="image/*" capture="environment" onChange={function(e){var fs=Array.prototype.slice.call(e.target.files||[]);if(fs.length>0)setFichiersBon(fichiersBon.concat(fs));e.target.value="";}} style={{display:"none"}}/>
                  </label>
                  <label style={{display:"inline-block",background:"#fff",color:T.blue,border:"1px solid "+T.blue+"44",borderRadius:7,padding:"6px 13px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                    Choisir depuis la bibliotheque / un fichier
                    <input type="file" accept="image/*,.pdf" multiple onChange={function(e){var fs=Array.prototype.slice.call(e.target.files||[]);if(fs.length>0)setFichiersBon(fichiersBon.concat(fs));e.target.value="";}} style={{display:"none"}}/>
                  </label>
                </div>
                {(fichiersBon.length>0||photosExist.length>0)&&(
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                    {photosExist.map(function(c,ix){return(
                      <div key={"e"+ix} style={{background:"#fff",border:"1px solid "+T.border,borderRadius:8,padding:"5px 10px",fontSize:11,display:"flex",alignItems:"center",gap:8}}>
                        <span style={{color:T.blue,cursor:"pointer",textDecoration:"underline"}} onClick={function(){voirPhoto(c);}}>Piece {ix+1} (deja jointe)</span>
                        <span style={{color:T.red,cursor:"pointer",fontWeight:800}} onClick={function(){setPhotosExist(photosExist.filter(function(_,j){return j!==ix;}));}}>x</span>
                      </div>
                    );})}
                    {fichiersBon.map(function(fl,ix){return(
                      <div key={"n"+ix} style={{background:"#fff",border:"1px solid "+T.accent+"66",borderRadius:8,padding:"5px 10px",fontSize:11,display:"flex",alignItems:"center",gap:8}}>
                        <span style={{color:T.accent,fontWeight:700}}>{fl.name||("photo "+(ix+1))}</span>
                        <span style={{color:T.red,cursor:"pointer",fontWeight:800}} onClick={function(){setFichiersBon(fichiersBon.filter(function(_,j){return j!==ix;}));}}>x</span>
                      </div>
                    );})}
                  </div>
                )}
                <div style={{fontSize:10,color:T.muted,marginTop:8}}>Les pieces sont televersees a la sauvegarde du bon et apparaissent sur le bon imprime (PDF).</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={sauvegarder} dis={saving||!nf.titre}>{saving?"Sauvegarde...":"Sauvegarder"}</Btn>
              <Btn onClick={function(){setShowForm(false);setEditId(null);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}

        {filtres.map(function(b){return <CardBon key={b.id} bon={b} onEdit={editer} onChangeStatut={changerStatut} onEnvoyer={envoyerBon} onImprimer={imprimerBon} onPhoto={voirPhoto}/>;  })}
        {filtres.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucun bon de travail dans cette categorie</div>}
      </div>
    </div>
  );
}
