import sb from "./lib/supabase";
import { useState, useRef, useEffect } from "react";
import Communications from "./Communications";
import GestionUtilisateurs from "./GestionUtilisateurs";
import GestionEmployes from "./GestionEmployes";

// Normalise un role de CA (texte libre du REQ/IA) vers les valeurs standard de l app
function normRole(r){
  var s=(r||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  if(s.indexOf("vice")>=0)return "vice";
  if(s.indexOf("presid")>=0)return "president";
  if(s.indexOf("tresor")>=0)return "tresorier";
  if(s.indexOf("secret")>=0)return "secretaire";
  return "membre";
}

// ===== Validation et formatage des champs (a l epreuve des erreurs) =====
function fmtNAS(v){var d=(v||"").replace(/\D/g,"").slice(0,9);return d.replace(/(\d{3})(?=\d)/g,"$1-");}
function nasValide(v){var d=(v||"").replace(/\D/g,"");if(d.length!==9)return false;var s=0;for(var i=0;i<9;i++){var x=parseInt(d[i],10);if(i%2===1){x*=2;if(x>9)x-=9;}s+=x;}return s%10===0;}
function fmtTel(v){var d=(v||"").replace(/\D/g,"").slice(0,10);if(d.length>6)return d.slice(0,3)+"-"+d.slice(3,6)+"-"+d.slice(6);if(d.length>3)return d.slice(0,3)+"-"+d.slice(3);return d;}
function courrielValide(v){return !v||/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);}
function fmtCP(v){var s=(v||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6);return s.length>3?s.slice(0,3)+" "+s.slice(3):s;}
function fmtNEQ(v){return (v||"").replace(/\D/g,"").slice(0,11);}

// Lit une reponse d API en tolerant les erreurs non-JSON (ex: 413 fichier trop gros)
function lireReponseAPI(r){
  return r.text().then(function(t){
    try{return JSON.parse(t);}catch(e){
      if(r.status===413)return {error:"Le PDF est trop volumineux pour le serveur (limite ~4 Mo). Compressez le PDF ou n envoyez que les pages pertinentes."};
      return {error:"Reponse inattendue du serveur (code "+r.status+")"};
    }
  });
}

// ===== Outils PDF (declaration de copropriete) =====
// Charge le PDF de la declaration (window._acteFile) avec pdf.js
function chargerActe(){
  return new Promise(function(resolve,reject){
    if(!window._acteFile){reject(new Error("Aucune declaration PDF importee a l etape 1."));return;}
    var lancer=function(){
      var fr=new FileReader();
      fr.onerror=function(){reject(new Error("Lecture du PDF impossible"));};
      fr.onload=function(ev){
        window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        window.pdfjsLib.getDocument({data:new Uint8Array(ev.target.result)}).promise.then(resolve).catch(reject);
      };
      fr.readAsArrayBuffer(window._acteFile);
    };
    if(typeof window.pdfjsLib==="undefined"){
      var sc=document.createElement("script");
      sc.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      sc.onload=lancer;sc.onerror=function(){reject(new Error("PDF.js indisponible - verifiez la connexion internet"));};
      document.head.appendChild(sc);
    }else{lancer();}
  });
}
// Texte de chaque page (tableau indexe 0 = page 1). Une page numerisee retourne une chaine vide.
function textesParPage(pdf,maxPages){
  var n=Math.min(pdf.numPages,maxPages||300);
  var proms=[];
  for(var i=1;i<=n;i++){
    (function(num){
      proms.push(pdf.getPage(num).then(function(pg){
        return pg.getTextContent().then(function(tc){
          return tc.items.map(function(it){return it.str;}).join(" ");
        });
      }).catch(function(){return "";}));
    })(i);
  }
  return Promise.all(proms);
}
// Rend un lot de pages en images JPEG base64
function rendreLot(pdf,pages){
  return Promise.all(pages.filter(function(nn){return nn>=1&&nn<=pdf.numPages;}).map(function(nn){
    return pdf.getPage(nn).then(function(pg){
      var vp=pg.getViewport({scale:1.5});
      var cv=document.createElement("canvas");cv.width=vp.width;cv.height=vp.height;
      return pg.render({canvasContext:cv.getContext("2d"),viewport:vp}).promise.then(function(){
        var d=cv.toDataURL("image/jpeg",0.72).split(",")[1];
        cv.width=1;cv.height=1;
        return d;
      });
    });
  }));
}
// Analyse par vision IA TOUT le document numerise, lot par lot (sequentiel).
// traiterLot(data) recoit la reponse de chaque lot; stop() true = arret anticipe.
// onProgress(pageDebut,pageFin,total) informe l utilisateur.
function visionToutLeDocument(pdf,corpsRequete,traiterLot,stop,onProgress){
  var total=Math.min(pdf.numPages,240);
  var TAILLE=6;
  var lots=[];
  for(var d=1;d<=total;d+=TAILLE){
    var pg=[];for(var k=d;k<Math.min(d+TAILLE,total+1);k++)pg.push(k);
    lots.push(pg);
  }
  var chaine=Promise.resolve();
  lots.forEach(function(lot){
    chaine=chaine.then(function(){
      if(stop&&stop())return;
      if(onProgress)onProgress(lot[0],lot[lot.length-1],total);
      return rendreLot(pdf,lot).then(function(images){
        var corps=Object.assign({},corpsRequete,{images:images});
        return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify(corps)}).then(lireReponseAPI);
      }).then(function(resp){
        if(resp&&!resp.error&&resp.data)traiterLot(resp.data);
      });
    });
  });
  return chaine;
}
// Convertit un fichier (pdf ou image) en base64 pour l extraction IA
function fichierB64PourIA(file){
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

// Comparaison DETERMINISTE des quotes-parts (Excel vs declaration) - tolerance 0.002
function comparerQuoteparts(trouvees,liste){
  var map={};
  (trouvees||[]).forEach(function(t){
    var k=String(t.unite||"").replace(/\D/g,"");
    var v=parseFloat(String(t.fraction||"").replace(",",".").replace(/[^0-9.]/g,""));
    if(k&&!isNaN(v)&&map[k]===undefined)map[k]=v;
  });
  var ecarts=[],nb=0,manquantes=[];
  (liste||[]).forEach(function(c){
    var k=String(c.unite||"").replace(/\D/g,"");
    var exc=parseFloat(String(c.fraction||"").replace(",","."));
    var dec=map[k];
    if(dec===undefined||isNaN(dec)){manquantes.push(c.unite);return;}
    if(Math.abs(dec-exc)<=0.002)nb++;
    else ecarts.push({unite:c.unite,excel:c.fraction,declaration:String(dec)});
  });
  return {concordance:ecarts.length===0&&manquantes.length===0&&nb>0,nbValides:nb,ecarts:ecarts,
    note:manquantes.length>0?manquantes.length+" unite(s) introuvable(s) dans la declaration ("+manquantes.slice(0,8).join(", ")+(manquantes.length>8?"...":"")+")":""};
}

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",pop:"#3CAF6E",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
var money=function(n){return Math.abs(n||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var today=function(){return new Date().toISOString().slice(0,10);};
var now_ts=function(){return new Date().toLocaleString("fr-CA",{hour12:false}).replace(",","");};

function Bdg(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap",display:"inline-block"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} style={{background:p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function FRow(p){return <div style={p.full?{gridColumn:"1/-1"}:{}}><Lbl l={p.l}/>{p.children}</div>;}
function Modal(p){
  if(!p.show)return null;
  return(
    <div onClick={function(e){if(e.target===e.currentTarget)p.onClose();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:24,width:p.w||540,maxWidth:"94vw",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <b style={{fontSize:14,color:T.text}}>{p.title}</b>
          <button onClick={p.onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.muted,lineHeight:1}}>x</button>
        </div>
        {p.children}
      </div>
    </div>
  );
}

// ===== DONNEES SYNDICATS =====
var SYNDICATS_INIT=[];

var USAGERS_INIT=[];

// ===== SCORE SANTE =====
// ===== CARTE SYNDICAT (donnees reelles seulement) =====
function CarteSyndicat(p){
  var s=p.syndicat;

  if(s.statut==="setup"){
    return(
      <div style={{background:T.surface,border:"2px dashed "+T.border,borderRadius:12,padding:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:160,cursor:"pointer"}} onClick={p.onSetup}>
        <div style={{width:44,height:44,borderRadius:"50%",background:T.accentL,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
          <span style={{fontSize:22,color:T.accent,fontWeight:300,lineHeight:1}}>+</span>
        </div>
        <div style={{fontSize:13,fontWeight:600,color:T.accent,marginBottom:4}}>{s.nom}</div>
        <div style={{fontSize:11,color:T.muted,textAlign:"center"}}>Cliquez pour configurer ce syndicat</div>
      </div>
    );
  }

  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,cursor:"pointer"}} onClick={p.onClick}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <div style={{fontSize:9,fontWeight:800,color:"#fff",background:T.navy,padding:"2px 7px",borderRadius:4,letterSpacing:"0.05em"}}>{s.code}</div>
        <Bdg bg={s.statut==="actif"?T.accentL:T.alt} c={s.statut==="actif"?T.accent:T.muted}>{s.statut==="actif"?"Actif":s.statut||"-"}</Bdg>
      </div>
      <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:2}}>{s.nom}</div>
      <div style={{fontSize:11,color:T.muted,marginBottom:12}}>{(s.adr||"")+((s.adr&&s.ville)?", ":"")+(s.ville||"")}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <div style={{background:T.accentL,borderRadius:8,padding:"8px 10px"}}>
          <div style={{fontSize:9,color:T.accent,fontWeight:600,marginBottom:2}}>UNITES</div>
          <div style={{fontSize:16,fontWeight:800,color:T.accent}}>{s.nbUnites||0}</div>
        </div>
        <div style={{background:T.blueL,borderRadius:8,padding:"8px 10px"}}>
          <div style={{fontSize:9,color:T.blue,fontWeight:600,marginBottom:2}}>NEQ</div>
          <div style={{fontSize:12,fontWeight:700,color:T.blue,marginTop:3}}>{s.immat||"-"}</div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:"1px solid "+T.border}}>
        <div style={{fontSize:10,color:T.muted}}>{s.courriel||"-"}</div>
        <div style={{fontSize:10,color:T.muted}}>{s.tel||""}</div>
      </div>
    </div>
  );
}

// ===== VUE DETAIL SYNDICAT (donnees reelles seulement) =====
function DetailSyndicat(p){
  var s=p.syndicat;
  var sCA=useState([]);var membresCA=sCA[0];var setMembresCA=sCA[1];
  useEffect(function(){
    if(!s||!s.id)return;
    sb.select("membres_ca",{eq:{syndicat_id:s.id},limit:20}).then(function(r){
      if(r&&r.data)setMembresCA(r.data);
    }).catch(function(){});
  },[s&&s.id]);
  var roleLbl={president:"President(e)",vice:"Vice-president(e)",tresorier:"Tresorier(e)",secretaire:"Secretaire",membre:"Membre"};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:10,fontWeight:800,color:"#fff",background:T.navy,padding:"3px 9px",borderRadius:5}}>{s.code}</div>
            <Bdg bg={T.accentL} c={T.accent}>{s.statut}</Bdg>
          </div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>{s.nom}</div>
          <div style={{fontSize:12,color:T.muted}}>{s.adr||""}{s.ville?", "+s.ville:""}</div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn sm bg={T.purple} tc={"#fff"} onClick={p.onParams}>Parametres</Btn><Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={p.onRetour}>Retour</Btn></div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[
          {l:"Unites",v:s.nbUnites||0,c:T.navy,bg:T.blueL},
          {l:"NEQ",v:s.immat||"-",c:T.accent,bg:T.accentL},
          {l:"Statut",v:s.statut||"-",c:T.blue,bg:T.blueL},
        ].map(function(st,i){return(
          <div key={i} style={{background:st.bg,borderRadius:10,padding:"11px 13px",border:"1px solid "+st.c+"33"}}>
            <div style={{fontSize:9,color:st.c,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{st.l}</div>
            <div style={{fontSize:17,fontWeight:800,color:st.c}}>{st.v}</div>
          </div>
        );})}
      </div>

      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:14,maxWidth:520}}>
        <Lbl l="Informations generales"/>
        {[
          {l:"President",v:s.president||"-"},
          {l:"Courriel",v:s.courriel||"-"},
          {l:"Telephone",v:s.tel||"-"},
          {l:"Immatriculation",v:s.immat||"-"},
          {l:"Annee de constitution",v:s.anneeConstitution||"-"},
          {l:"Quorum AGO",v:s.quorumAGO?s.quorumAGO+" %":"-"},
          {l:"Exercice financier",v:s.exercice||"-"},
        ].map(function(item,i){return(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+T.border}}>
            <span style={{fontSize:11,color:T.muted}}>{item.l}</span>
            <span style={{fontSize:12,fontWeight:500,color:T.text,textAlign:"right",maxWidth:220,overflow:"hidden",textOverflow:"ellipsis"}}>{item.v}</span>
          </div>
        );})}
      </div>

      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:14,maxWidth:520}}>
        <Lbl l="Conseil d administration"/>
        {membresCA.length===0&&<div style={{fontSize:11,color:T.muted,padding:"6px 0"}}>Aucun membre du CA en base pour ce syndicat.</div>}
        {membresCA.map(function(m,i){return(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<membresCA.length-1?"1px solid "+T.border:"none"}}>
            <span style={{fontSize:12,fontWeight:600,color:T.text}}>{((m.prenom||"")+" "+(m.nom||"")).trim()}</span>
            <span style={{fontSize:11,color:T.muted}}>{roleLbl[m.role_ca]||m.role_ca||"Membre"}</span>
          </div>
        );})}
      </div>

      <div style={{background:T.blueL,borderRadius:10,padding:"10px 14px",fontSize:11,color:T.blue,maxWidth:520}}>
        Les soldes et budgets se gerent dans le module Budget (section CA). Les unites et quotes-parts dans le module Unites.
      </div>
    </div>
  );
}

function CardTitle(p){return <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:4}}>{p.children}</div>;}
function CardSub(p){return <div style={{fontSize:11,color:T.muted,marginBottom:16}}>{p.children}</div>;}
function Tag(p){return <span style={{display:"inline-flex",alignItems:"center",gap:6,background:T.alt,borderRadius:20,padding:"3px 10px",fontSize:11,color:T.text,margin:"2px"}}>{p.children}<button onClick={p.onRemove} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:13,lineHeight:1,padding:0}}>x</button></span>;}
function Toggle(p){return(
  <button onClick={p.onClick} style={{width:44,height:24,borderRadius:12,background:p.on?T.accent:T.border,border:"none",cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
    <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:p.on?23:3,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
  </button>
);}

// Parametres d un syndicat - donnees REELLES chargees et sauvegardees en base
function ParamsSyndicat(p){
  var code = p.syndicat || "";
  var s0=useState(null);var f=s0[0];var setF=s0[1];
  var s1=useState("");var msg=s1[0];var setMsg=s1[1];
  var s2=useState("");var err=s2[0];var setErr=s2[1];
  var s3=useState(false);var enCours=s3[0];var setEnCours=s3[1];
  var s4=useState(0);var nbU=s4[0];var setNbU=s4[1];

  useEffect(function(){
    sb.selectOne("syndicats",{eq:{code:code}}).then(function(r){
      if(r&&r.data){
        setF(r.data);
        window._origParamsSyndicat=Object.assign({},r.data);
        sb.select("unites",{eq:{syndicat_id:r.data.id},cols:"id",limit:1000}).then(function(ru){
          if(ru&&ru.data)setNbU(ru.data.length);
        }).catch(function(){});
      }
      else setErr("Syndicat introuvable en base de donnees (code "+code+").");
    }).catch(function(e){setErr("Erreur de chargement: "+(e&&e.message?e.message:""));});
  },[code]);

  function ch(k,v){setF(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  function sauvegarder(){
    if(!f||enCours)return;
    setEnCours(true);setMsg("");setErr("");
    var maj={nom:f.nom||"",adr:f.adr||"",ville:f.ville||"",province:f.province||"QC",code_postal:f.code_postal||"",immat:f.immat||"",courriel:f.courriel||"",tel:f.tel||"",quorum_ago:parseInt(f.quorum_ago)||null,annee_constitution:parseInt(f.annee_constitution)||null,type_copro:f.type_copro||"",exercice:f.exercice||""};
    sb.update("syndicats",f.id,maj).then(function(r){
      setEnCours(false);
      if(r&&r.error){setErr("ECHEC de la sauvegarde: "+(r.error.message||r.error.hint||"erreur inconnue"));return;}
      setMsg("Parametres sauvegardes avec succes");
      var orig=window._origParamsSyndicat||{};
      var diffs=[];
      Object.keys(maj).forEach(function(k){
        var av=orig[k];var ap=maj[k];
        if(String(av==null?"":av)!==String(ap==null?"":ap))diffs.push(k+": \""+(av==null?"":av)+"\" -> \""+(ap==null?"":ap)+"\"");
      });
      window._origParamsSyndicat=Object.assign({},orig,maj);
      sb.log("syndicat","modification","Parametres du syndicat "+(f.nom||code)+" modifies ("+diffs.length+" champ(s))",diffs.join(" | ").substring(0,1800),code);
      setTimeout(function(){setMsg("");},4000);
    }).catch(function(e){setEnCours(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  if(err&&!f)return <div style={{padding:30,fontFamily:"Georgia,serif",color:T.red,fontSize:13,fontWeight:600}}>{err}</div>;
  if(!f)return <div style={{padding:30,fontFamily:"Georgia,serif",color:T.muted,fontSize:13}}>Chargement des parametres...</div>;

  return(
    <div style={{padding:20,fontFamily:"Georgia,serif",maxWidth:780,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Parametres - {f.nom||code}</div>
          <div style={{fontSize:11,color:T.muted}}>Code: {code} | {nbU} unite(s) en base</div>
        </div>
        <Btn dis={enCours} onClick={sauvegarder}>{enCours?"Sauvegarde...":"Sauvegarder"}</Btn>
      </div>
      {msg&&<div style={{background:"#E8F2EC",border:"2px solid #1B5E3B",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#1B5E3B",fontWeight:700}}>{msg}</div>}
      {err&&<div style={{background:"#FDECEA",border:"2px solid #B83232",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#B83232",fontWeight:700}}>{err}</div>}

      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:18,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>Identite du syndicat</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{gridColumn:"1/-1"}}><Lbl l="Nom du syndicat"/><input value={f.nom||""} onChange={function(e){ch("nom",e.target.value);}} style={INP}/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl l="Adresse"/><input value={f.adr||""} onChange={function(e){ch("adr",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Ville"/><input value={f.ville||""} onChange={function(e){ch("ville",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Province"/><select value={f.province||"QC"} onChange={function(e){ch("province",e.target.value);}} style={INP}><option>QC</option><option>ON</option><option>NB</option></select></div>
          <div><Lbl l="Code postal"/><input value={f.code_postal||""} onChange={function(e){ch("code_postal",fmtCP(e.target.value));}} style={INP} placeholder="G1A 1A1"/></div>
          <div><Lbl l="NEQ (immatriculation)"/><input value={f.immat||""} onChange={function(e){ch("immat",fmtNEQ(e.target.value));}} style={INP} placeholder="11 chiffres"/></div>
          <div><Lbl l="Courriel du syndicat"/><input value={f.courriel||""} onChange={function(e){ch("courriel",e.target.value.trim());}} style={Object.assign({},INP,f.courriel&&!courrielValide(f.courriel)?{border:"2px solid #B83232"}:{})}/></div>
          <div><Lbl l="Telephone"/><input value={f.tel||""} onChange={function(e){ch("tel",fmtTel(e.target.value));}} style={INP} placeholder="418-555-0000" maxLength={12}/></div>
        </div>
      </div>

      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:18,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>Constitution et regles</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><Lbl l="Annee de constitution"/><input type="number" value={f.annee_constitution||""} onChange={function(e){ch("annee_constitution",e.target.value);}} style={INP} placeholder="ex: 1987"/></div>
          <div><Lbl l="Quorum AGO (%)"/><input type="number" min="10" max="100" value={f.quorum_ago||""} onChange={function(e){ch("quorum_ago",e.target.value);}} style={INP} placeholder="ex: 50"/></div>
          <div><Lbl l="Type de copropriete"/><select value={f.type_copro||""} onChange={function(e){ch("type_copro",e.target.value);}} style={INP}><option value="">-</option><option value="horizontale">Horizontale</option><option value="verticale">Verticale</option><option value="mixte">Mixte</option></select></div>
          <div><Lbl l="Exercice financier"/><input value={f.exercice||""} onChange={function(e){ch("exercice",e.target.value);}} style={INP} placeholder="ex: 1 nov au 31 oct"/></div>
          <div><Lbl l="Nombre d unites (calcule)"/><input value={nbU||f.nb_unites||0} readOnly style={Object.assign({},INP,{background:T.alt,color:T.muted})}/></div>
          <div><Lbl l="Statut"/><input value={f.statut||""} readOnly style={Object.assign({},INP,{background:T.alt,color:T.muted})}/></div>
        </div>
      </div>

      {f.reglements_resume&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:18,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:8}}>Reglements extraits de la declaration</div>
          <div style={{fontSize:12,color:T.text,whiteSpace:"pre-wrap",lineHeight:1.5}}>{f.reglements_resume}</div>
        </div>
      )}

      <div style={{background:T.blueL,borderRadius:10,padding:"10px 14px",fontSize:11,color:T.blue}}>
        Les membres du CA se gerent dans la section Conseil d administration (module Membres CA). Les documents officiels se gerent dans le module Documents. Les unites et quotes-parts dans le module Unites.
      </div>
    </div>
  );
}



function StepIndicator(p){
  var STEPS=["Syndicat","CA","Coproprietaires","Documents","Confirmation"];
  return(
    <div style={{display:"flex",marginBottom:24,overflowX:"auto"}}>
      {STEPS.map(function(s,i){
        var done=p.step>i+1;var current=p.step===i+1;var future=p.step<i+1;
        return(
          <div key={i} style={{display:"flex",alignItems:"center",flexShrink:0}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:80}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:done?T.accent:current?T.navy:T.border,display:"flex",alignItems:"center",justifyContent:"center",color:done||current?"#fff":T.muted,fontSize:done?16:12,fontWeight:700,marginBottom:4}}>
                {done?"-":i+1}
              </div>
              <div style={{fontSize:9,fontWeight:current?700:400,color:current?T.navy:done?T.accent:T.muted,textAlign:"center",lineHeight:1.2}}>{s}</div>
            </div>
            {i<STEPS.length-1&&<div style={{width:24,height:2,background:done?T.accent:T.border,flexShrink:0,marginBottom:16}}/>}
          </div>
        );
      })}
    </div>
  );
}

// CSV Parser
function parseCSV(text){
  if(!text)return{ok:false,msg:"Fichier vide",rows:[],errors:[]};
  var rawLines=text.split("\n");
  var lines=[];
  for(var i=0;i<rawLines.length;i++){var l=rawLines[i].trim();if(l.length>0)lines.push(l);}
  if(lines.length<2)return{ok:false,msg:"Aucune donnee",rows:[],errors:[]};
  var sep=lines[0].indexOf("\t")>=0?"\t":";";
  if(lines[0].indexOf(",")>=0&&lines[0].indexOf("\t")<0)sep=",";
  function splitLine(l){var cells=l.split(sep);return cells.map(function(c){return c.trim().replace(/^["']|["']$/g,"");});}
  var headers=splitLine(lines[0]).map(function(h){return h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\u2019\u0027]/g," ").replace(/\s+/g," ").trim();});
  function col(row,keys){for(var k=0;k<keys.length;k++){var v=row[keys[k]];if(v!==undefined&&v!=="")return v;}return "";}
  var rows=[],errors=[];
  for(var i=1;i<lines.length;i++){
    var cells=splitLine(lines[i]);
    if(cells.length<2)continue;
    var row={};
    for(var j=0;j<headers.length;j++)row[headers[j]]=cells[j]||"";
    var unite=col(row,["nom de l unite","unite","unit","no_unite","numero"]);
    if(!unite)continue;
    if(unite.toLowerCase().indexOf("total")>=0)continue;
    var nomComplet=col(row,["proprietaire1 nom","proprietaire 1 nom","nom"]);
    var prenom="",nom=nomComplet;
    if(nomComplet&&nomComplet.indexOf(" ")>0){var pts=nomComplet.split(" ");prenom=pts[0];nom=pts.slice(1).join(" ");}
    var courriel=col(row,["proprietaire1 courriel","proprietaire 1 courriel","courriel","email"]);
    var tel=col(row,["proprietaire1 telephone","proprietaire 1 telephone","telephone","tel"]);
    var mobile=col(row,["proprietaire1 telephone cellulaire","cellulaire","mobile"]);
    var adr=col(row,["proprietaire1 adresse","proprietaire 1 adresse","adresse"]);
    var langue=col(row,["proprietaire1 langue","langue"]);
    var estCAval=col(row,["proprietaire1 est membre du conseil?","est membre du conseil?"]);
    var estOccupantVal=col(row,["proprietaire1 est occupant?","est occupant?"]);
    var prop2nom=col(row,["proprietaire2 nom","proprietaire 2 nom"]);
    var prop2courriel=col(row,["proprietaire2 courriel","proprietaire 2 courriel"]);
    var prop2tel=col(row,["proprietaire2 telephone","proprietaire 2 telephone"]);
    var fraction=col(row,["fraction totale (%)","fraction totale","fraction de l unite (%)","fraction","quote_part"]).replace(/[%\s]/g,"").replace(",",".");
    var cadastre=col(row,["cadastre de l unite","cadastre","no_cadastre"]);
    var cotisation=col(row,["cotisation","mensualite"]).replace(/[$\s]/g,"").replace(",",".");
    var stationnement=col(row,["stationnement"]);
    var rangement=col(row,["rangement"]);
    var acces=col(row,["acces","acc s"]);
    var vehicule=col(row,["vehicule","v hicule"]);
    var assurancePolice=col(row,["numero de police","numero police"]);
    var assuranceExp=col(row,["expiration assurance","expiration"]);
    var locNom=col(row,["locataire1 nom","locataire nom"]);
    var locCourriel=col(row,["locataire1 courriel"]);
    var locTel=col(row,["locataire1 telephone"]);
    var chauffeEau=col(row,["annee de fabrication du chauffe eau","chauffe eau"]);
    var foyer=col(row,["foyer"]);
    var mobilite=col(row,["mobilite reduite","mobilite"]);
    var estCAb=(estCAval.toLowerCase().indexOf("oui")>=0||estCAval==="1"||estCAval.toLowerCase()==="true");
    var estOccupantb=(estOccupantVal.toLowerCase().indexOf("oui")>=0||estOccupantVal==="1");
    rows.push({unite:unite,prenom:prenom,nom:nom,courriel:courriel,tel:tel,mobile:mobile,adr:adr,langue:langue,estCA:estCAb,estOccupant:estOccupantb,prop2nom:prop2nom,prop2courriel:prop2courriel,prop2tel:prop2tel,fraction:fraction,quotePart:fraction,cadastre:cadastre,cotisation:cotisation,stationnement:stationnement,rangement:rangement,acces:acces,vehicule:vehicule,assurancePolice:assurancePolice,assuranceExp:assuranceExp,locNom:locNom,locCourriel:locCourriel,locTel:locTel,chauffeEau:chauffeEau,foyer:foyer,mobilite:mobilite,urgenceNom:col(row,["proprietaire1 telephone (urgences)","urgence nom"]),urgenceTel:col(row,["proprietaire1 telephone (urgences)","urgence tel"]),urgNom:"",urgTel:"",urgLien:"",pap:false,ce:"",ass:"",loc:!!locNom,animaux:0});
  }
  var sumF=rows.reduce(function(a,r){var f=parseFloat(r.fraction)||0;return a+(f<0.9?f:0);},0);
  var multF=(sumF>0&&sumF<=1.5)?100:1;
  rows.forEach(function(r){var f=parseFloat(r.fraction);if(f&&(multF===1||f<0.9)){var v=(f*multF).toFixed(3);r.fraction=v;r.quotePart=v;}});
  return{ok:rows.length>0,msg:rows.length+" coproprietaires importes"+(errors.length>0?" ("+errors.length+" erreurs)":""),rows:rows,errors:errors};
}
function Field(p){
  return(
    <div style={p.full?{gridColumn:"1/-1"}:{}}>
      {p.l&&<div style={{fontSize:10,color:"#7C7568",textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>}
      {p.children}
      {p.hint&&<div style={{fontSize:10,color:"#7C7568",marginTop:3}}>{p.hint}</div>}
    </div>
  );
}
function Check(p){
  return(
    <div style={{display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer",marginBottom:8}} onClick={p.onChange}>
      <div style={{width:18,height:18,borderRadius:4,border:"2px solid "+(p.checked?"#1B5E3B":"#DDD9CF"),background:p.checked?"#1B5E3B":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
        {p.checked&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>V</span>}
      </div>
      <div>
        {p.label&&<div style={{fontSize:12,fontWeight:600,color:"#1C1A17",lineHeight:1.4}}>{p.label}</div>}
        {p.desc&&<div style={{fontSize:11,color:"#7C7568",marginTop:2,lineHeight:1.4}}>{p.desc}</div>}
      </div>
    </div>
  );
}

function Onboarding(p){
  var s0=useState(1);var step=s0[0];var setStep=s0[1];
  var s1=useState({
    // Etape 1 - Syndicat
    reqNom:"",acteNom:"",nom:"",code:"",adr:"",ville:"",province:"QC",codePostal:"",immat:"",
    anneeConstruction:"",nbUnites:"",exercice:"1 nov au 31 oct",
    quorumCA:"majorite",quorumAGO:25,typeCopro:"horizontale",
    // Etape 1b - Courriels syndicat (deplacs de tape 2)
    courrielCA:"",courrielFactures:"",courrielCopros:"",courrielUrgences:"",
    gestionnaire:"",
    // Etape 2 - CA
    nbMembresCA:3,
    admins:[
      {nom:"",prenom:"",adr:"",ville:"",province:"QC",codePostal:"",courriel:"",mobile:"",dateDebut:"",nas:""},
      {nom:"",prenom:"",adr:"",ville:"",province:"QC",codePostal:"",courriel:"",mobile:"",dateDebut:"",nas:""},
      {nom:"",prenom:"",adr:"",ville:"",province:"QC",codePostal:"",courriel:"",mobile:"",dateDebut:"",nas:""},
    ],
    // Etape 4 - Soldes
    
    
    // Etape 5 - Documents
    documents:[],
    // Etape 6 - Carnet
    composantes:[],
    inspecteur:"",dateInspection:"",
    // Etape 7 - Attestation
    attestationAcceptee:false,
  });
  var data=s1[0];var setData=s1[1];
  var s2=useState([]);var copros=s2[0];var setCopros=s2[1];
  var s3=useState("");var csvMsg=s3[0];var setCSVMsg=s3[1];
  var s4=useState([]);var csvErrors=s4[0];var setCSVErrors=s4[1];
  var s5=useState("");var newMembre=s5[0];var setNewMembre=s5[1];
  var s6=useState(false);var iaLoading=s6[0];var setIaLoading=s6[1];
  var sPg=useState(null);var iaProg=sPg[0];var setIaProg=sPg[1];
  var sDm=useState("");var docMsg=sDm[0];var setDocMsg=sDm[1];
  var sQP=useState(null);var qpResult=sQP[0];var setQpResult=sQP[1];
  var s7=useState("");var iaError=s7[0];var setIaError=s7[1];
  var s8=useState("");var iaSuccess=s8[0];var setIaSuccess=s8[1];
  var fileRef=useRef(null);
  var docRef=useRef(null);
  var anneeConstruction=parseInt(data.anneeConstruction)||new Date().getFullYear();

  function sd(k,v){setData(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  function sadmin(i,k,v){setData(function(o){
    var admins=o.admins.slice();
    admins[i]=Object.assign({},admins[i]);
    admins[i][k]=v;
    return Object.assign({},o,{admins:admins});
  });}
  function setNbAdmins(n){setData(function(o){
    var cur=o.admins.slice();
    while(cur.length<n) cur.push({nom:"",prenom:"",adr:"",ville:"",province:"QC",codePostal:"",courriel:"",mobile:"",dateDebut:"",nas:""});
    while(cur.length>n) cur.pop();
    return Object.assign({},o,{nbMembresCA:n,admins:cur});
  });}
  // Analyse AUTOMATIQUE de la declaration des le televersement:
  // texte lisible -> extraction texte + reglements; scan -> vision IA sur TOUT le document avec progression.
  // Analyse VISION complete du document (quorum, constitution, reglements) - utilisee pour les scans
  // et comme COMPLEMENT automatique si l extraction texte n a pas tout trouve.
  function lancerVisionComplete(pdf){
        var acc={reglements:[]};
        setIaLoading(true);setIaError("");
        setIaSuccess("Analyse complete par vision IA (page par page)...");
        return visionToutLeDocument(pdf,{mode:"syndicat"},function(dd){
          if(dd.anneeConstitution&&(!acc.anneeConstitution||parseInt(dd.anneeConstitution)<parseInt(acc.anneeConstitution)))acc.anneeConstitution=dd.anneeConstitution;
          if(dd.quorumAGO&&!acc.quorumAGO)acc.quorumAGO=dd.quorumAGO;
          if(dd.nbUnites&&!acc.nbUnites)acc.nbUnites=dd.nbUnites;
          if(dd.typeCopro&&!acc.typeCopro)acc.typeCopro=dd.typeCopro;
          if(dd.reglements&&String(dd.reglements).trim().length>10)acc.reglements.push(String(dd.reglements).trim());
        },null,function(p1,p2,tot){
          setIaProg({fait:p2,total:tot});
        }).then(function(){
          setData(function(o){
            var u=Object.assign({},o);
            if(acc.anneeConstitution&&parseInt(acc.anneeConstitution)>1900)u.anneeConstruction=parseInt(acc.anneeConstitution);
            if(acc.quorumAGO&&parseInt(acc.quorumAGO)>0)u.quorumAGO=parseInt(acc.quorumAGO);
            if(acc.nbUnites&&parseInt(acc.nbUnites)>0&&!u.nbUnites)u.nbUnites=parseInt(acc.nbUnites);
            if(acc.typeCopro&&["horizontale","verticale","mixte"].indexOf(acc.typeCopro)>=0)u.typeCopro=acc.typeCopro;
            if(acc.reglements.length>0){var nvR=acc.reglements.join("\n\n").substring(0,12000);if(!u.reglementsResume||nvR.length>u.reglementsResume.length)u.reglementsResume=nvR;}
            return u;
          });
          var trouve=[];
          if(acc.quorumAGO)trouve.push("quorum "+acc.quorumAGO+" %");
          if(acc.anneeConstitution)trouve.push("constitution "+acc.anneeConstitution);
          if(acc.nbUnites)trouve.push(acc.nbUnites+" unites");
          if(acc.reglements.length>0)trouve.push("reglements extraits");
          setIaSuccess(trouve.length>0?"Analyse complete de la declaration terminee: "+trouve.join(", "):"Analyse terminee - rien de lisible. Scan de trop faible qualite?");
          setIaProg(null);setIaLoading(false);
        });
  }

  function analyserActeAuto(){
    if(!window._acteFile)return;
    setIaLoading(true);setIaError("");setIaSuccess("Lecture de la declaration...");setIaProg(null);
    chargerActe().then(function(pdf){
      return textesParPage(pdf).then(function(txts){
        var totalTexte=txts.join("").replace(/\s+/g,"").length;
        var moyenneParPage=totalTexte/Math.max(1,Math.min(pdf.numPages,txts.length));
        // Vrai texte seulement si la densite est credible (sinon: scan avec bribes -> vision)
        if(totalTexte>500&&moyenneParPage>150){
          setIaProg(null);
          return Promise.resolve(extraireIA()).then(function(){
            var ex=window._dernierEx||{};
            var quorumOk=ex.quorumAGO&&parseInt(ex.quorumAGO)>0;
            var anneeOk=(ex.anneeConstitution||ex.anneeConstruction)&&parseInt(ex.anneeConstitution||ex.anneeConstruction)>1900;
            if(quorumOk&&anneeOk)return null;
            // Il manque le quorum ou l annee: COMPLEMENT automatique par vision sur tout le document
            setIaSuccess("Quorum ou annee de constitution introuvables dans le texte - complement automatique par vision IA...");
            return lancerVisionComplete(pdf);
          });
        }
        return lancerVisionComplete(pdf);
      });
    }).catch(function(e){setIaError("Erreur: "+e.message);setIaLoading(false);setIaProg(null);});
  }

  function extraireIA(){
    if(iaLoading)return Promise.resolve();
    setIaLoading(true);setIaError("");setIaSuccess("");
    var files=[];
    if(window._reqFile)files.push(window._reqFile);
    if(window._acteFile)files.push(window._acteFile);
    if(files.length===0){setIaError("Selectionnez au moins un PDF.");setIaLoading(false);return;}
    function lirePDF(file){
      return new Promise(function(res,rej){
        var reader=new FileReader();
        reader.onerror=function(){rej(new Error("Lecture impossible"));};
        reader.onload=function(ev){
          var arr=new Uint8Array(ev.target.result);
          function run(){
            pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            pdfjsLib.getDocument({data:arr}).promise.then(function(pdf){
              var pages=[];for(var p=1;p<=Math.min(pdf.numPages,300);p++)pages.push(p);
              return Promise.all(pages.map(function(n){
                return pdf.getPage(n).then(function(pg){
                  return pg.getTextContent().then(function(tc){
                    return tc.items.map(function(it){return it.str;}).join(" ");
                  });
                });
              }));
            }).then(function(t){res(t.join("\n"));}).catch(rej);
          }
          if(typeof pdfjsLib==="undefined"){
            var s=document.createElement("script");
            s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            s.onload=run;s.onerror=function(){rej(new Error("PDF.js indisponible"));};
            document.head.appendChild(s);
          }else{run();}
        };
        reader.readAsArrayBuffer(file);
      });
    }
    return Promise.all(files.map(lirePDF)).then(function(textes){
      // Assemblage intelligent: REQ complet + debut de la declaration (identite)
      // + extraits cibles sur les assemblees/quorum/majorites (souvent loin dans l acte)
      var idx=0;
      var texteREQ=window._reqFile?(textes[idx++]||""):"";
      var texteActe=window._acteFile?(textes[idx]||""):"";
      window._texteActeComplet=texteActe;
      window._texteREQComplet=texteREQ;
      var extraitsActe="";
      if(texteActe){
        var phrases=texteActe.split(/\.\s+/);
        var gard=[];
        for(var pi=0;pi<phrases.length;pi++){
          if(/quorum|assembl|majorit|vote|convoc/i.test(phrases[pi])){
            if(pi>0)gard.push(phrases[pi-1]);
            gard.push(phrases[pi]);
            if(pi+1<phrases.length)gard.push(phrases[pi+1]);
          }
        }
        extraitsActe=gard.join(". ").substring(0,9000);
      }
      var texte="";
      if(texteREQ)texte+=texteREQ.substring(0,12000);
      if(texteActe){
        texte+="\n\n=== DEBUT DE LA DECLARATION DE COPROPRIETE ===\n"+texteActe.substring(0,4000);
        if(extraitsActe)texte+="\n\n=== EXTRAITS PERTINENTS DE LA DECLARATION (assemblees, quorum, majorites, votes) ===\n"+extraitsActe;
      }
      if(!texte||texte.trim().length<20){
        setIaError("PDF non-textuel (image scannee). Saisissez manuellement.");
        setIaLoading(false);return null;
      }
      window._dernierEx=null;
      return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify({texte:texte,mode:"syndicat"})});
    }).then(function(r){
      if(!r)return;
      if(!r.ok){setIaError("Erreur serveur "+r.status);setIaLoading(false);return;}
      return r.json();
    }).then(function(resp){
      if(!resp)return;
      if(resp.error){setIaError(resp.error);setIaLoading(false);return;}
      var ex=resp.data||{};
      window._dernierEx=ex;
      setData(function(old){
        var u=Object.assign({},old);
        if(ex.nom)u.nom=ex.nom;
        if(ex.immat)u.immat=ex.immat;
        if(ex.adr)u.adr=ex.adr;
        if(ex.ville)u.ville=ex.ville;
        if(ex.province&&ex.province.length===2)u.province=ex.province;
        if(ex.codePostal)u.codePostal=ex.codePostal;
        if(ex.nbUnites&&parseInt(ex.nbUnites)>0)u.nbUnites=parseInt(ex.nbUnites);
        if(ex.gestionnaire)u.gestionnaire=ex.gestionnaire;
        if(ex.quorumAGO&&parseInt(ex.quorumAGO)>0)u.quorumAGO=parseInt(ex.quorumAGO);
        var anCst=ex.anneeConstitution||ex.anneeConstruction;if(anCst&&parseInt(anCst)>1900)u.anneeConstruction=parseInt(anCst);
        if(ex.typeCopro&&["horizontale","verticale","mixte"].indexOf(ex.typeCopro)>=0)u.typeCopro=ex.typeCopro;
                      if(!u.code&&(ex.nom||ex.adr)){var stopw=["syndicat","syndicats","de","des","du","la","le","les","copropriete","coproprietaires","sdc","l","d","et"];var mts=(ex.nom||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9 ]/g," ").split(/\s+/).filter(function(m){return m.length>1&&stopw.indexOf(m.toLowerCase())<0;});var bs=mts.length>0?mts[0].charAt(0).toUpperCase()+mts[0].slice(1).toLowerCase():"";var nm=((ex.adr||"").match(/\d+/)||[""])[0];if(bs||nm)u.code=(bs+nm).slice(0,20);}
        if(ex.admins&&Array.isArray(ex.admins)&&ex.admins.length>0){
          u.nbMembresCA=ex.admins.length;
          u.admins=ex.admins.map(function(a){
            return {nom:a.nom||"",prenom:a.prenom||"",adr:a.adr||"",ville:a.ville||"",province:a.province||"QC",codePostal:a.codePostal||"",courriel:"",mobile:"",dateDebut:a.dateDebut||"",nas:"",role:normRole(a.role)};
          });
        }
        return u;
      });
      var champs=["nom","immat","adr","ville","province","codePostal","nbUnites","gestionnaire","quorumAGO","anneeConstruction","typeCopro"];
      var n=champs.filter(function(k){return ex[k]&&ex[k]!==""&&ex[k]!==0;}).length;
      if(ex.admins&&ex.admins.length>0)n+=ex.admins.length;
      var dbg=resp.debug?" (texte: "+resp.debug.texteLen+" chars)":"";setIaSuccess(n+" champs extraits avec succes - verifiez et completez"+dbg);
      // Passe DEDIEE aux administrateurs: relit le REQ AU COMPLET (PDF original, toutes les pages)
      // pour ne manquer AUCUN administrateur ni melanger les adresses et dates de debut de charge.
      if(window._reqFile){
        fichierB64PourIA(window._reqFile).then(function(src){
          var corpsAd=src.pdf?{pdf:src.pdf,mode:"req_admins"}:{texte:(window._texteREQComplet||""),mode:"req_admins"};
          return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify(corpsAd)});
        }).then(lireReponseAPI).then(function(ra){
          if(!ra||!ra.ok||!ra.data||!Array.isArray(ra.data.admins)||ra.data.admins.length===0)return;
          var da=ra.data;
          setData(function(old){
            var u=Object.assign({},old);
            u.nbMembresCA=da.admins.length;
            u.admins=da.admins.map(function(a){
              return {nom:a.nom||"",prenom:a.prenom||"",adr:a.adr||"",ville:a.ville||"",province:a.province||"QC",codePostal:a.codePostal||"",courriel:"",mobile:"",dateDebut:a.dateDebut||"",nas:"",role:normRole(a.role)};
            });
            if(da.adrSyndicat)u.adr=da.adrSyndicat;
            if(da.villeSyndicat)u.ville=da.villeSyndicat;
            if(da.codePostalSyndicat)u.codePostal=fmtCP(da.codePostalSyndicat);
            return u;
          });
          setIaSuccess("Lecture complete du REQ: "+da.admins.length+" administrateur(s) avec adresses et dates de debut de charge - verifiez a l etape Administrateurs.");
        }).catch(function(){});
      }
      // Extraction automatique des reglements: TOUTE la declaration, par segments successifs
      if(window._texteActeComplet&&window._texteActeComplet.length>500){
        var texteRg=window._texteActeComplet;
        var TAILLE_SEG=26000;
        var segments=[];
        for(var sg=0;sg<texteRg.length&&segments.length<10;sg+=TAILLE_SEG)segments.push(texteRg.substring(sg,sg+TAILLE_SEG));
        var resumes=[];
        var chaineRg=Promise.resolve();
        segments.forEach(function(seg,iSeg){
          chaineRg=chaineRg.then(function(){
            setIaSuccess("Extraction des reglements: section "+(iSeg+1)+" sur "+segments.length+"...");
            return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify({texte:seg,mode:"reglements"})})
              .then(lireReponseAPI).then(function(rr){
                if(rr&&rr.ok&&rr.resume&&rr.resume.trim().length>20)resumes.push(rr.resume.trim());
              }).catch(function(){});
          });
        });
        chaineRg.then(function(){
          if(resumes.length>0){
            var complet=resumes.join("\n\n").substring(0,24000);
            setData(function(o){return Object.assign({},o,{reglementsResume:complet});});
            setIaSuccess("Extraction terminee - reglements captes sur l ENSEMBLE de la declaration ("+segments.length+" section(s) analysee(s)).");
          }
        });
      }console.log("EXTRACT DEBUG:",resp.debug,"DATA:",ex);
      setIaLoading(false);
    }).catch(function(e){
      setIaError("Erreur: "+(e&&e.message?e.message:String(e)));
      setIaLoading(false);
    });
  }
  function sdComp(i,k,v){setData(function(o){var comps=o.composantes.slice();comps[i]=Object.assign({},comps[i]);comps[i][k]=v;return Object.assign({},o,{composantes:comps});});}

  function handleCSV(e){
    var file=e.target.files[0];
    if(file&&file.name&&file.name.toLowerCase().match(/\.xlsx?$/)){if(typeof XLSX==="undefined"){var s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onload=function(){handleCSV(e);};document.head.appendChild(s);return;}var xr=new FileReader();xr.onload=function(ev){var wb=XLSX.read(ev.target.result,{type:"array"});var ws=wb.Sheets[wb.SheetNames[0]];var result=parseCSV(XLSX.utils.sheet_to_csv(ws,{FS:"\t"}));if(result.ok){setCopros(result.rows);setCSVMsg(result.msg);setCSVErrors(result.errors||[]);}else{setCSVMsg("Erreur: "+result.msg);setCopros([]);}};xr.readAsArrayBuffer(file);return;}
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      var result=parseCSV(ev.target.result);
      if(result.ok){setCopros(result.rows);setCSVMsg(result.msg);setCSVErrors(result.errors||[]);}
      else{setCSVMsg("Erreur: "+result.msg);setCopros([]);}
    };
    reader.readAsText(file);
  }

  function handleDoc(e){
    var file=e.target.files[0];
    if(!file)return;
    var types={".pdf":"PDF",".doc":"Word",".docx":"Word",".jpg":"Image",".png":"Image"};
    var ext=file.name.toLowerCase().match(/\.[^.]+$/);
    var type=ext?types[ext[0]]||"Document":"Document";
    var newDoc={id:Date.now(),nom:file.name,type:type,taille:file.size>1048576?(file.size/1048576).toFixed(1)+" MB":(file.size/1024).toFixed(0)+" KB",date:today(),dispo:true,cat:"general"};
    sd("documents",data.documents.concat([newDoc]));
  }

  function terminer(){
    var syndicat={
      id:Date.now(),
      nom:data.nom,code:data.code,
      adr:data.adr,ville:data.ville,province:data.province,codePostal:data.codePostal,
      immat:data.immat,anneeConstruction:anneeConstruction,
      quorumAGO:parseInt(data.quorumAGO)||null,typeCopro:data.typeCopro||"",
      reglementsResume:data.reglementsResume||"",
      nbUnites:copros.length||parseInt(data.nbUnites)||0,
      exercice:data.exercice,
      president:data.president||nomPourRole("president").replace("-",""),secretaire:data.secretaire||nomPourRole("secretaire").replace("-",""),tresorier:data.tresorier||nomPourRole("tresorier").replace("-",""),
      nbMembresCA:data.nbMembresCA,membresCA:data.membresCA,admins:data.admins||[],
      courriel:data.courrielCA||"",courrielCA:data.courrielCA,courrielFactures:data.courrielFactures,
      assSyndicatExp:data.assSyndicatExp||null,etudeAssuranceDate:data.etudeAssuranceDate||null,etudePrevoyanceDate:data.etudePrevoyanceDate||null,
      soldeOp:parseFloat(data.soldeOp)||0,soldePrev:parseFloat(data.soldePrev)||0,soldeAss:parseFloat(data.soldeAss)||0,
      copros:copros,documents:data.documents,composantes:data.composantes,
      statut:"actif",dateCreation:today(),
      cotisationMensuelle:copros.reduce(function(a,c){return a+(parseFloat(c.cotisation)||0);},0)||parseFloat(data.cotisationMoyenne)*copros.length||0,
    };
    // Copie locale SANS les NAS (jamais de NAS en clair dans le navigateur)
    try{
      var pourStockage=Object.assign({},syndicat,{admins:(syndicat.admins||[]).map(function(a){var c=Object.assign({},a);delete c.nas;return c;})});
      localStorage.setItem("predictek_syndicat_"+data.code,JSON.stringify(pourStockage));
    }catch(e){}
    if(p.onTermine)p.onTermine(syndicat);
  }


  // Nom de l administrateur qui occupe un role donne (pour le resume etape 5)
  var nomPourRole=function(r){
    var a=(data.admins||[]).find(function(x){return x&&x.role===r&&(x.nom||x.prenom);});
    return a?((a.prenom||"")+" "+(a.nom||"")).trim():"-";
  };
  var totalFraction=copros.reduce(function(a,c){return a+(parseFloat(c.fraction)||0);},0);

  return(
    <div style={{padding:20,fontFamily:"Georgia,serif",maxWidth:900,margin:"0 auto"}}>
      <div style={{background:T.navy,color:"#fff",borderRadius:12,padding:"16px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:18,fontWeight:800}}>Nouveau syndicat - Configuration initiale</div>
          <div style={{fontSize:11,color:"#8da0bb",marginTop:2}}>Completez les 5 etapes pour activer votre syndicat dans Predictek</div>
        </div>
        <div style={{fontSize:22,fontWeight:900,color:T.accent}}>Predictek</div>
      </div>

      <StepIndicator step={step}/>

      {step===1&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 1 - Acte de copropriete et informations du syndicat</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Importez le REQ et la declaration PDF - toutes les informations sont extraites automatiquement. Vous pourrez les modifier avant de continuer.</div>
          <div style={{background:"#F0F7FF",border:"1px solid #1A56DB33",borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:2}}>Documents officiels du syndicat</div>
                <div style={{fontSize:11,color:T.muted}}>Optionnel  Importez vos PDF pour remplir automatiquement les champs avec l'IA</div>
              </div>
              {(data.reqNom||data.acteNom)&&!iaLoading&&(
                <button onClick={function(){if(window._acteFile)analyserActeAuto();else extraireIA();}} style={{background:"linear-gradient(135deg,#1A56DB,#3CAF6E)",border:"none",borderRadius:8,padding:"8px 16px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  Relancer l analyse IA
                </button>
              )}
              {iaLoading&&(
                <div style={{background:"#EFF6FF",border:"1px solid #1A56DB44",borderRadius:8,padding:"10px 14px",fontSize:11,color:"#1A56DB",fontWeight:600,minWidth:280}}>
                  {iaSuccess||"IA en cours d analyse..."}
                  <div style={{height:12,background:"#d6e4ff",borderRadius:6,overflow:"hidden",marginTop:8}}>
                    <div style={{height:"100%",background:"linear-gradient(90deg,#1A56DB,#3CAF6E)",borderRadius:6,width:(iaProg&&iaProg.total?Math.round(iaProg.fait/iaProg.total*100):35)+"%",transition:"width 0.7s"}}/>
                  </div>
                  {iaProg&&iaProg.total?(
                    <div style={{fontSize:10,color:"#1A56DB",marginTop:4,fontWeight:700}}>{iaProg.fait} / {iaProg.total} pages analysees ({Math.round(iaProg.fait/iaProg.total*100)} %)</div>
                  ):(
                    <div style={{fontSize:10,color:"#7C7568",marginTop:4}}>Cela peut prendre 1 a 3 minutes selon la taille du document...</div>
                  )}
                
              </div>
              )}
            </div>
            {iaError&&(
              <div style={{background:"#FDECEA",border:"1px solid #B8323244",borderRadius:6,padding:"6px 12px",fontSize:11,color:"#B83232",marginBottom:10}}>{iaError}</div>
            )}
            {iaSuccess&&(
              <div style={{background:"#E8F2EC",border:"1px solid #1B5E3B44",borderRadius:6,padding:"6px 12px",fontSize:11,color:"#1B5E3B",marginBottom:10,fontWeight:600}}> {iaSuccess}</div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{background:"#FFF8EE",border:"2px solid #E8A020",borderRadius:8,padding:12}}>
                <div style={{fontSize:11,fontWeight:700,color:"#B86020",marginBottom:3}}>Registre entreprises du Quebec (REQ)</div>
                <div style={{fontSize:10,color:"#7C7568",marginBottom:8}}>Etat de renseignements PDF - analyse automatique des le televersement</div>
                <input type="file" accept=".pdf,.PDF" id="pdfREQ" style={{display:"none"}} onChange={function(e){
                  var file=e.target.files&&e.target.files[0];
                  if(!file)return;
                  if(file.size>3000000){setIaError("PDF trop volumineux pour le serveur (max 3 Mo). Compressez-le (ex: ilovepdf.com/compress_pdf) ou collez le texte du REQ.");return;}
                  setIaError("");setIaSuccess("");setIaLoading(true);
                  var fr=new FileReader();
                  fr.onload=function(ev){
                    var b64=ev.target.result.split(",")[1];
                    fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify({pdf:b64,mode:"syndicat"})})
                    .then(lireReponseAPI)
                    .then(function(resp){
                      if(!resp||resp.error){setIaError(resp&&resp.error?resp.error:"Erreur");setIaLoading(false);return;}
                      var ex=resp.data||{};
                      setData(function(o){
                        var u=Object.assign({},o);
                        if(ex.nom)u.nom=ex.nom;
                        if(ex.immat)u.immat=ex.immat;
                        if(ex.adr)u.adr=ex.adr;
                        if(ex.ville)u.ville=ex.ville;
                        if(ex.province&&ex.province.length===2)u.province=ex.province;
                        if(ex.codePostal)u.codePostal=ex.codePostal;
                        if(ex.nbUnites&&parseInt(ex.nbUnites)>0)u.nbUnites=parseInt(ex.nbUnites);
                        if(ex.gestionnaire)u.gestionnaire=ex.gestionnaire;
                        if(ex.quorumAGO&&parseInt(ex.quorumAGO)>0)u.quorumAGO=parseInt(ex.quorumAGO);
                        var anCst=ex.anneeConstitution||ex.anneeConstruction;if(anCst&&parseInt(anCst)>1900)u.anneeConstruction=parseInt(anCst);
                        if(ex.typeCopro&&["horizontale","verticale","mixte"].indexOf(ex.typeCopro)>=0)u.typeCopro=ex.typeCopro;
                      if(!u.code&&(ex.nom||ex.adr)){var stopw=["syndicat","syndicats","de","des","du","la","le","les","copropriete","coproprietaires","sdc","l","d","et"];var mts=(ex.nom||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9 ]/g," ").split(/\s+/).filter(function(m){return m.length>1&&stopw.indexOf(m.toLowerCase())<0;});var bs=mts.length>0?mts[0].charAt(0).toUpperCase()+mts[0].slice(1).toLowerCase():"";var nm=((ex.adr||"").match(/\d+/)||[""])[0];if(bs||nm)u.code=(bs+nm).slice(0,20);}
                        if(ex.admins&&Array.isArray(ex.admins)&&ex.admins.length>0){
                          u.nbMembresCA=ex.admins.length;
                          u.admins=ex.admins.map(function(a){return {nom:a.nom||"",prenom:a.prenom||"",adr:a.adr||"",ville:a.ville||"",province:a.province||"QC",codePostal:a.codePostal||"",courriel:"",mobile:"",dateDebut:a.dateDebut||"",nas:"",role:normRole(a.role)};});
                        }
                        return u;
                      });
                      var ks=["nom","immat","adr","ville","province","codePostal","nbUnites","gestionnaire","quorumAGO","anneeConstruction","typeCopro"];
                      var n=ks.filter(function(k){return ex[k]&&ex[k]!=="";}).length;
                      if(ex.admins&&ex.admins.length>0)n+=ex.admins.length;
                      setIaSuccess(n+" champs extraits du PDF - verifiez et completez");
                      setIaLoading(false);
                    }).catch(function(err){setIaError("Erreur: "+err.message);setIaLoading(false);});
                  };
                  fr.readAsDataURL(file);
                }}/>
                <button onClick={function(){document.getElementById("pdfREQ").click();}} style={{background:"#fff",border:"1px solid #E8A020",borderRadius:6,padding:"5px 12px",fontSize:10,fontWeight:700,color:"#B86020",cursor:"pointer",marginBottom:6,marginRight:6}}>
                  Selectionner le PDF du REQ (scan accepte)
                </button>
              </div>
              <div style={{background:"#E8F2EC",border:"2px dashed "+(data.acteNom?"#1B5E3B":"#1B5E3B66"),borderRadius:8,padding:12,textAlign:"center",transition:"all 0.2s"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#1B5E3B",marginBottom:3}}>Declaration de copropriete</div>
                <div style={{fontSize:10,color:"#7C7568",marginBottom:8}}>Quorum AGO, annee construction, structure legale</div>
                <input type="file" accept=".pdf,.PDF" id="acteUpload" onChange={function(e){var f=e.target.files[0];if(f){sd("acteNom",f.name);window._acteFile=f;var fr=new FileReader();fr.onload=function(ev){window._acteB64=ev.target.result.split(",")[1];};fr.readAsDataURL(f);setTimeout(analyserActeAuto,80);}}} style={{display:"none"}}/>
                <button onClick={function(){document.getElementById("acteUpload").click();}} style={{background:"#1B5E3B",border:"none",borderRadius:6,padding:"6px 12px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  {data.acteNom?" Changer":" Selectionner PDF"}
                </button>
                {data.acteNom&&<div style={{fontSize:10,color:"#1B5E3B",marginTop:5,fontWeight:600}}> {data.acteNom}</div>}
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field l="Nom officiel du syndicat" full hint="Nom tel qu il apparait dans votre acte de copropriete"><input value={data.nom} onChange={function(e){sd("nom",e.target.value);}} style={INP} placeholder="Syndicat Piedmont"/></Field>
            <Field l="Code client" hint="Genere automatiquement: nom + no civique (ex: Piedmont531)"><div style={{display:"flex",gap:6}}><input value={data.code} onChange={function(e){sd("code",e.target.value.replace(/[^A-Za-z0-9]/g,"").slice(0,20));}} style={Object.assign({},INP,{flex:1})} placeholder="Piedmont531" maxLength={20}/><button onClick={function(){
                var stop=["syndicat","syndicats","de","des","du","la","le","les","copropriete","coproprietaires","coproprietes","sdc","phase","condominiums","condominium","condo","condos","l","d","et","au","aux"];
                var mots=(data.nom||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9 ]/g," ").split(/\s+/).filter(function(m){return m.length>1&&stop.indexOf(m.toLowerCase())<0;});
                var base=mots.length>0?mots[0].charAt(0).toUpperCase()+mots[0].slice(1).toLowerCase():"";
                var num=((data.adr||"").match(/\d+/)||[""])[0];
                if(base||num){sd("code",(base+num).slice(0,20));}
              }} style={{background:"#1B5E3B",color:"#fff",border:"none",borderRadius:6,padding:"0 12px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>Auto</button></div></Field>
            <Field l="Annee de constitution"><input type="number" value={data.anneeConstruction} onChange={function(e){sd("anneeConstruction",e.target.value);}} style={INP} placeholder="2013"/></Field>
            <Field l="Adresse du syndicat" full hint="Adresse du domicile tel qu inscrit au REQ"><input value={data.adr} onChange={function(e){sd("adr",e.target.value);}} style={INP} placeholder="123 Chemin du Hibou"/></Field>
            <Field l="Ville"><input value={data.ville} onChange={function(e){sd("ville",e.target.value);}} style={INP} placeholder="Stoneham-et-Tewkesbury"/></Field>
            <Field l="Province"><select value={data.province} onChange={function(e){sd("province",e.target.value);}} style={INP}><option>QC</option><option>ON</option><option>BC</option><option>AB</option></select></Field>
            <Field l="Code postal"><input value={data.codePostal} onChange={function(e){sd("codePostal",e.target.value.toUpperCase());}} style={INP} placeholder="G3C 1T1"/></Field>
            <Field l="Numero immatriculation REQ" hint="11 chiffres - registre entreprises Quebec"><input value={data.immat} onChange={function(e){sd("immat",fmtNEQ(e.target.value));}} style={INP} placeholder="1144524577"/></Field>
            <Field l="Exercice financier"><select value={data.exercice} onChange={function(e){sd("exercice",e.target.value);}} style={INP}><option value="1 nov au 31 oct">1 nov au 31 oct</option><option value="1 jan au 31 dec">1 jan au 31 dec</option><option value="1 avr au 31 mars">1 avr au 31 mars</option><option value="1 juil au 30 juin">1 juil au 30 juin</option></select></Field>
            <Field l="Quorum AGO % (dclaration)"><input type="number" min="10" max="75" value={data.quorumAGO} onChange={function(e){sd("quorumAGO",parseInt(e.target.value)||25);}} style={INP}/></Field>
          </div>
          <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:10,padding:14,marginTop:16,marginBottom:4}}>
            <div style={{fontSize:13,fontWeight:700,color:T.amber,marginBottom:6}}>Structure lgale de la coproprit</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Dtermine par la dclaration de coproprit  a des impacts juridiques importants sur la gestion</div>
            <div style={{display:"flex",gap:10}}>
              {[
                {v:"horizontale",l:"Horizontale",desc:"Units cte  cte (maisons, condos au sol)"},
                {v:"verticale",l:"Verticale",desc:"Units superposes (tours, immeubles)"},
                {v:"mixte",l:"Mixte",desc:"Combinaison des deux types"},
              ].map(function(t){var a=data.typeCopro===t.v;return(
                <div key={t.v} onClick={function(){sd("typeCopro",t.v);}} style={{flex:1,border:"2px solid "+(a?T.amber:T.border),borderRadius:8,padding:"10px 12px",cursor:"pointer",background:a?T.amberL:"#fff",transition:"all 0.15s"}}>
                  <div style={{fontWeight:700,fontSize:12,color:a?T.amber:T.text,marginBottom:2}}>{t.l}</div>
                  <div style={{fontSize:10,color:T.muted}}>{t.desc}</div>
                </div>
              );})}
            </div>
          </div>
          <div style={{marginTop:16}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>Courriels du syndicat</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Ces adresses seront utilisees pour les communications automatiques</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Field l="Courriel OFFICIEL du syndicat" hint="Adresse principale - affichee dans les parametres et les communications"><input value={data.courrielCA} onChange={function(e){sd("courrielCA",e.target.value.trim());}} style={Object.assign({},INP,data.courrielCA&&!courrielValide(data.courrielCA)?{border:"2px solid #B83232"}:{})} placeholder="ca@syndicat.com"/></Field>
              <Field l="Courriel factures fournisseurs" hint="Traitement automatique des factures recues"><input value={data.courrielFactures} onChange={function(e){sd("courrielFactures",e.target.value.trim());}} style={INP} placeholder="factures@syndicat.com"/></Field>
              <Field l="Courriel urgences 24/7"><input value={data.courrielUrgences} onChange={function(e){sd("courrielUrgences",e.target.value.trim());}} style={INP} placeholder="urgences@syndicat.com"/></Field>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}>
            <Btn dis={iaLoading||!data.nom||!data.code||!data.ville} onClick={function(){setStep(2);}}>{iaLoading?"Analyse en cours - patientez...":"Continuer -"}</Btn>
          </div>
        </div>
      )}

      {step===2&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 2 - Administrateurs du CA</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Selon le REQ et la declaration de copropriete. Le NAS est chiffre et securise.</div>
          <div style={{marginBottom:16}}>
            <Lbl l="Nombre d administrateurs"/>
            <div style={{display:"flex",gap:10,marginBottom:4}}>{<div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={function(){if(data.nbMembresCA>1)setNbAdmins(data.nbMembresCA-1);}} style={{width:36,height:36,borderRadius:8,border:"2px solid "+T.border,background:T.surface,fontWeight:700,fontSize:20,cursor:"pointer",color:T.text,lineHeight:1}}>-</button><div style={{minWidth:40,textAlign:"center",fontWeight:700,fontSize:20,color:T.navy}}>{data.nbMembresCA}</div><button onClick={function(){setNbAdmins(data.nbMembresCA+1);}} style={{width:36,height:36,borderRadius:8,border:"2px solid "+T.accent,background:T.accentL,fontWeight:700,fontSize:20,cursor:"pointer",color:T.accent,lineHeight:1}}>+</button><div style={{fontSize:11,color:T.muted,marginLeft:4}}>administrateur(s)</div></div>}</div>
            <div style={{fontSize:11,color:T.muted}}>Nombre impair requis  {data.nbMembresCA} administrateur(s) selectionne(s)</div>
          </div>
          <div style={{marginBottom:8}}>
            {data.admins.map(function(admin,i){return(
              <div key={i} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:10}}>Administrateur {i+1}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <Field l="Prenom"><input value={admin.prenom} onChange={function(e){sadmin(i,"prenom",e.target.value);}} style={INP}/></Field>
                  <Field l="Nom"><input value={admin.nom} onChange={function(e){sadmin(i,"nom",e.target.value);}} style={INP}/></Field>
                  <Field l="Role au CA" full><select value={admin.role||"membre"} onChange={function(e){sadmin(i,"role",e.target.value);}} style={INP}>
                    <option value="president">President(e)</option>
                    <option value="vice">Vice-president(e)</option>
                    <option value="tresorier">Tresorier(e)</option>
                    <option value="secretaire">Secretaire</option>
                    <option value="membre">Membre / Administrateur</option>
                  </select></Field>
                  <Field l="Adresse postale" full><input value={admin.adr} onChange={function(e){sadmin(i,"adr",e.target.value);}} style={INP} placeholder="123 rue Exemple"/></Field>
                  <Field l="Ville"><input value={admin.ville} onChange={function(e){sadmin(i,"ville",e.target.value);}} style={INP}/></Field>
                  <Field l="Province"><select value={admin.province} onChange={function(e){sadmin(i,"province",e.target.value);}} style={INP}><option>QC</option><option>ON</option><option>BC</option><option>AB</option><option>MB</option><option>SK</option><option>NB</option><option>NS</option><option>PE</option><option>NL</option></select></Field>
                  <Field l="Code postal"><input value={admin.codePostal} onChange={function(e){sadmin(i,"codePostal",fmtCP(e.target.value));}} style={INP} placeholder="G1A 1A1"/></Field>
                  <Field l="Courriel"><input type="email" value={admin.courriel} onChange={function(e){sadmin(i,"courriel",e.target.value.trim());}} style={Object.assign({},INP,admin.courriel&&!courrielValide(admin.courriel)?{border:"2px solid #B83232"}:{})} placeholder="nom@exemple.com"/>{admin.courriel&&!courrielValide(admin.courriel)&&<div style={{fontSize:10,color:"#B83232",marginTop:2}}>Format de courriel invalide</div>}</Field>
                  <Field l="Mobile"><input type="tel" value={admin.mobile} onChange={function(e){sadmin(i,"mobile",fmtTel(e.target.value));}} style={INP} placeholder="418-555-0000" maxLength={12}/></Field>
                  <Field l="Debut du mandat"><input type="date" value={admin.dateDebut} onChange={function(e){sadmin(i,"dateDebut",e.target.value);}} style={INP}/></Field>
                  <Field l="NAS" hint="Visible pendant la saisie - chiffre des l activation, jamais stocke en clair"><input type="text" inputMode="numeric" autoComplete="off" value={admin.nas} onChange={function(e){sadmin(i,"nas",fmtNAS(e.target.value));}} style={Object.assign({},INP,admin.nas?(nasValide(admin.nas)?{border:"2px solid #1B5E3B"}:{border:"2px solid #B83232"}):{})} placeholder="000-000-000" maxLength={11}/>{admin.nas&&!nasValide(admin.nas)&&<div style={{fontSize:10,color:"#B83232",marginTop:2}}>NAS invalide - 9 chiffres requis (verification Luhn)</div>}</Field>
                </div>
              </div>
            );})}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(1);}}>- Retour</Btn>
            <Btn dis={!data.admins[0]||!data.admins[0].nom||data.admins.some(function(a){return (a.nas&&!nasValide(a.nas))||(a.courriel&&!courrielValide(a.courriel));})} onClick={function(){setStep(3);}}>Continuer -</Btn>
          </div>
        </div>
      )}

      {step===3&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 3 - Import des coproprietaires</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Importez votre registre en format CSV. Vous pouvez aussi saisir manuellement.</div>

          <div style={{background:T.blueL,border:"1px solid "+T.blue+"44",borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:8}}>Formats Excel (.xlsx) et CSV acceptes - colonnes flexibles</div>
            <div style={{fontSize:11,color:T.blue,fontFamily:"monospace",lineHeight:1.9}}>
              unite, cadastre, prenom, nom, courriel, telephone, quote_part, cotisation<br/>
              101, 1234567, Jean, Untel, jean@exemple.com, 000-000-0000, 2.133, 292.06<br/>
              102, 1234568, Marie, Modele, marie@exemple.com, 000-000-0000, 3.840, 525.80
            </div>
            <div style={{fontSize:10,color:T.blue,marginTop:6}}>Colonnes obligatoires: unite. Toutes les autres sont optionnelles.</div>
          </div>

          <div style={{border:"2px dashed "+T.border,borderRadius:12,padding:30,textAlign:"center",background:T.alt,cursor:"pointer",marginBottom:14}} onClick={function(){fileRef.current&&fileRef.current.click();}}>
            <div style={{fontSize:32,marginBottom:8}}>CSV</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:4}}>Cliquez pour importer votre fichier Excel ou CSV</div>
            <div style={{fontSize:11,color:T.muted}}>Formats acceptes: .xlsx, .xls, .csv</div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleCSV} style={{display:"none"}}/>
          </div>

          {csvMsg&&(
            <div style={{background:csvMsg.includes("Erreur")?T.redL:T.accentL,color:csvMsg.includes("Erreur")?T.red:T.accent,borderRadius:8,padding:"9px 13px",fontSize:12,marginBottom:10,fontWeight:600}}>{csvMsg}</div>
          )}
          {csvErrors.length>0&&(
            <div style={{background:T.amberL,borderRadius:8,padding:"9px 13px",fontSize:11,color:T.amber,marginBottom:10}}>
              {csvErrors.slice(0,5).map(function(e,i){return <div key={i}>- {e}</div>;})}
            </div>
          )}

          {copros.length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{copros.length} coproprietaires importes</div>
                <div style={{fontSize:12,color:T.muted}}>Total fractions: <b>{totalFraction.toFixed(3)}%</b></div>
              </div>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflowX:"auto"}}>
                <table style={{width:"100%",minWidth:2400,borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:T.navy}}>
                      {["Unite","Cadastre","Prenom","Nom","Courriel","Tel","Mobile","Adresse","Langue","CA","Occupant","Quote-part %","Prop. 2","Prop.2 courriel","Prop.2 tel","Stationnement","Rangement","Acces","Vehicule","Police assurance","Exp. assurance","Locataire","Loc. courriel","Loc. tel","Chauffe-eau","Foyer","Mobilite","Urgence"].map(function(h){return(
                        <th key={h} style={{padding:"6px 8px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
                      );})}
                    </tr>
                  </thead>
                  <tbody>
                    {copros.map(function(c,i){return(
                      <tr key={i} style={{borderBottom:"1px solid "+T.border,background:i%2===0?T.surface:T.alt}}>
                        <td style={{padding:"5px 8px",fontWeight:700,color:T.navy,fontSize:11,whiteSpace:"nowrap"}}>{c.unite||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,color:T.muted,whiteSpace:"nowrap"}}>{c.cadastre||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:11,whiteSpace:"nowrap"}}>{c.prenom||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:11,whiteSpace:"nowrap"}}>{c.nom||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,color:T.muted,whiteSpace:"nowrap"}}>{c.courriel||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,color:T.muted,whiteSpace:"nowrap"}}>{c.tel||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,color:T.muted,whiteSpace:"nowrap"}}>{c.mobile||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,color:T.muted,whiteSpace:"nowrap"}}>{c.adr||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.langue||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,fontWeight:700,color:c.estCA?"#1B5E3B":T.muted}}>{c.estCA?"Oui":"Non"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,color:T.muted}}>{c.estOccupant?"Oui":"Non"}</td>
                        <td style={{padding:"5px 8px",fontSize:11,textAlign:"right",fontWeight:600,whiteSpace:"nowrap"}}>{c.quotePart?c.quotePart+"%":"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.prop2nom||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,color:T.muted,whiteSpace:"nowrap"}}>{c.prop2courriel||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,color:T.muted,whiteSpace:"nowrap"}}>{c.prop2tel||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.stationnement||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.rangement||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.acces||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.vehicule||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.assurancePolice||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.assuranceExp||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.locNom||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,color:T.muted,whiteSpace:"nowrap"}}>{c.locCourriel||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,color:T.muted,whiteSpace:"nowrap"}}>{c.locTel||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.chauffeEau||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.foyer||"-"}</td>
                        <td style={{padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}}>{c.mobilite||"-"}</td>
                        <td style={{padding:"3px 6px",whiteSpace:"nowrap"}}>
                          <input value={c.urgNom||""} onChange={function(e){var v=e.target.value;setCopros(function(prev){return prev.map(function(x,j){return j===i?Object.assign({},x,{urgNom:v}):x;});});}} placeholder="Nom" style={{width:90,border:"1px solid "+T.border,borderRadius:5,padding:"3px 6px",fontSize:10,fontFamily:"inherit",marginRight:3}}/>
                          <input value={c.urgLien||""} onChange={function(e){var v=e.target.value;setCopros(function(prev){return prev.map(function(x,j){return j===i?Object.assign({},x,{urgLien:v}):x;});});}} placeholder="Lien" style={{width:70,border:"1px solid "+T.border,borderRadius:5,padding:"3px 6px",fontSize:10,fontFamily:"inherit",marginRight:3}}/>
                          <input value={c.urgTel||""} onChange={function(e){var v=e.target.value;setCopros(function(prev){return prev.map(function(x,j){return j===i?Object.assign({},x,{urgTel:v}):x;});});}} placeholder="Telephone" style={{width:100,border:"1px solid "+T.border,borderRadius:5,padding:"3px 6px",fontSize:10,fontFamily:"inherit"}}/>
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {copros.length>0&&(
            <div style={{marginBottom:14,background:"#F0F7F2",border:"1px solid #1B5E3B44",borderRadius:8,padding:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"#1B5E3B",marginBottom:6}}>Validation croisee avec la declaration de copropriete</div>
              {!window._acteB64&&<div style={{fontSize:11,color:"#B86020"}}>Aucune declaration fournie a l etape 1 - retournez a l etape 1 pour l importer si vous souhaitez valider les quote-parts.</div>}
              {window._acteB64&&(
                <div>
                  <div style={{fontSize:10,color:T.muted,marginBottom:6}}>La declaration COMPLETE est analysee automatiquement (texte ou scan). Aucun numero de page a fournir.</div>
                  <button onClick={function(){
                    if(qpResult&&qpResult.loading)return;
                    var unitesEnvoi=copros.map(function(c){return {unite:c.unite,fraction:c.fraction};});
                    var attendu=unitesEnvoi.length;
                    setQpResult({loading:true,msg:"Lecture de la declaration..."});
                    var trouvees=[];
                    chargerActe().then(function(pdf){
                      return textesParPage(pdf).then(function(txts){
                        var totalTexte=txts.join("").replace(/\s+/g,"").length;
                        if(totalTexte>500){
                          // Declaration TEXTUELLE: reperer les pages contenant des quotes-parts/fractions
                          var cibles=[];
                          txts.forEach(function(t,i){
                            if(/quote|fraction|parties communes/i.test(t)&&/\d+[.,]\d{2,}/.test(t))cibles.push(i);
                          });
                          if(cibles.length===0)txts.forEach(function(t,i){if(/quote|fraction/i.test(t))cibles.push(i);});
                          var texte=cibles.map(function(i){return "PAGE "+(i+1)+":\n"+txts[i];}).join("\n\n").substring(0,29000);
                          if(!texte){setQpResult({error:"Aucune page de quotes-parts reperee dans le texte de la declaration."});return null;}
                          setQpResult({loading:true,msg:"Analyse des quotes-parts ("+cibles.length+" page(s) reperee(s))..."});
                          return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify({texte:texte,mode:"quoteparts_liste"})}).then(lireReponseAPI).then(function(resp){
                            if(!resp||resp.error){setQpResult({error:(resp&&resp.error)||"Erreur"});return null;}
                            trouvees=(resp.data&&resp.data.trouvees)||[];
                            return true;
                          });
                        }
                        // Declaration NUMERISEE: vision IA sur tout le document, arret des que tout est trouve
                        return visionToutLeDocument(pdf,{mode:"quoteparts_liste"},function(dd){
                          if(dd&&Array.isArray(dd.trouvees))trouvees=trouvees.concat(dd.trouvees);
                        },function(){
                          return trouvees.length>=attendu&&attendu>0;
                        },function(p1,p2,tot){
                          setQpResult({loading:true,msg:"Vision IA: pages "+p1+"-"+p2+" sur "+tot+" ("+trouvees.length+"/"+attendu+" quotes-parts trouvees)..."});
                        }).then(function(){return true;});
                      });
                    }).then(function(ok){
                      if(!ok)return;
                      setQpResult(comparerQuoteparts(trouvees,unitesEnvoi));
                    }).catch(function(e){setQpResult({error:e.message});});
                  }} disabled={qpResult&&qpResult.loading} style={{background:"#1B5E3B",color:"#fff",border:"none",borderRadius:6,padding:"7px 16px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                    {qpResult&&qpResult.loading?(qpResult.msg||"Validation en cours..."):"Valider les quote-parts avec la declaration"}
                  </button>
                </div>
              )}
              {qpResult&&qpResult.error&&<div style={{marginTop:8,fontSize:11,color:"#B83232"}}>Erreur: {qpResult.error}</div>}
              {qpResult&&!qpResult.loading&&!qpResult.error&&qpResult.concordance===true&&(
                <div style={{marginTop:8,fontSize:12,fontWeight:700,color:"#155724",background:"#D4EDDA",borderRadius:6,padding:"6px 12px",display:"inline-block"}}>Toutes les quote-parts concordent avec la declaration ({qpResult.nbValides||copros.length} unites)</div>
              )}
              {qpResult&&!qpResult.loading&&!qpResult.error&&qpResult.concordance===false&&(
                <div style={{marginTop:8}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#B86020",marginBottom:6}}>Ecarts detectes ({(qpResult.ecarts||[]).length}):</div>
                  <table style={{borderCollapse:"collapse",fontSize:11}}>
                    <thead><tr><th style={{padding:"4px 10px",textAlign:"left",color:T.muted}}>Unite</th><th style={{padding:"4px 10px",textAlign:"right",color:T.muted}}>Fichier Excel</th><th style={{padding:"4px 10px",textAlign:"right",color:T.muted}}>Declaration</th></tr></thead>
                    <tbody>
                      {(qpResult.ecarts||[]).map(function(ec,i){return(
                        <tr key={i} style={{background:"#FFF3CD"}}><td style={{padding:"4px 10px",fontWeight:700}}>{ec.unite}</td><td style={{padding:"4px 10px",textAlign:"right"}}>{ec.excel}</td><td style={{padding:"4px 10px",textAlign:"right"}}>{ec.declaration}</td></tr>
                      );})}
                    </tbody>
                  </table>
                  {qpResult.note&&<div style={{fontSize:10,color:T.muted,marginTop:4}}>{qpResult.note}</div>}
                </div>
              )}
            </div>
          )}
          {copros.length===0&&(
            <div style={{marginBottom:14}}>
              <Lbl l="OU - Saisir le nombre d unites manuellement"/>
              <input type="number" value={data.nbUnites} onChange={function(e){sd("nbUnites",e.target.value);}} style={INP} placeholder="Nombre d unites (ex: 36)"/>
              <div style={{fontSize:10,color:T.muted,marginTop:3}}>Vous pourrez ajouter les coproprietaires plus tard.</div>
            </div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(2);}}>- Retour</Btn>
            <Btn dis={copros.length===0&&!data.nbUnites} onClick={function(){setStep(4);}}>Continuer -</Btn>
          </div>
        </div>
      )}

      {step===4&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 4 - Documents officiels</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:10}}>Importez les documents fondamentaux du syndicat. Les dates cles (expiration d assurance, dates des etudes) sont extraites automatiquement.</div>
          {docMsg&&<div style={{background:"#EFF6FF",border:"1px solid #1A56DB44",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#1A56DB",fontWeight:600,marginBottom:10}}>{docMsg}</div>}
          {!data.reglementsResume&&(data.acteNom||window._acteFile)&&(
            <div style={{background:"#FEF3E2",border:"2px solid #B86020",borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{fontSize:11,color:"#B86020",fontWeight:700,flex:1,minWidth:220}}>Les reglements de la declaration n ont pas encore ete extraits.</div>
              <button disabled={iaLoading} onClick={function(){
                if(!window._acteFile){setDocMsg("Retournez a l etape 1 pour reimporter la declaration.");return;}
                setDocMsg("Relance de l analyse de la declaration...");
                analyserActeAuto();
              }} style={{background:"#B86020",color:"#fff",border:"none",borderRadius:6,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:iaLoading?"not-allowed":"pointer"}}>{iaLoading?"Analyse en cours...":"Relancer l extraction des reglements"}</button>
            </div>
          )}
          {iaLoading&&(
            <div style={{background:"#EFF6FF",border:"1px solid #1A56DB44",borderRadius:8,padding:"10px 14px",fontSize:11,color:"#1A56DB",fontWeight:600,marginBottom:10}}>
              {iaSuccess||"Analyse en cours..."}
              {iaProg&&iaProg.total?<div style={{fontSize:10,marginTop:3,fontWeight:700}}>{iaProg.fait} / {iaProg.total} pages ({Math.round(iaProg.fait/iaProg.total*100)} %)</div>:null}
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[{cat:"declaration",l:"Declaration de copropriete",desc:"Document fondateur - acte notarie",obligatoire:true},{cat:"reglement",l:"Reglement de l immeuble",desc:"Regles de vie approuvees en assemblee",obligatoire:true},{cat:"police",l:"Police d assurance",desc:"Assurance syndicat - l expiration est extraite automatiquement",obligatoire:false},{cat:"etude_assurance",l:"Etude aux fins d assurance",desc:"Evaluation de la valeur de reconstruction - la date est extraite pour planifier l appel d offres",obligatoire:false},{cat:"financier",l:"Etats financiers annuels",desc:"Derniers etats financiers verifies",obligatoire:false},{cat:"carnet_prev",l:"Etude du fonds de prevoyance",desc:"Etude Loi 16 - la date est extraite pour planifier le renouvellement",obligatoire:false},{cat:"autre",l:"Autre document",desc:"Tout autre document pertinent",obligatoire:false}].map(function(dtype){
              var uploaded=data.documents.filter(function(d){return d.cat===dtype.cat;});
                  var viaEtape1=(dtype.cat==="declaration"&&data.acteNom)?true:(dtype.cat==="reglement"&&data.reglementsResume)?true:false;
              return(
                <div key={dtype.cat} style={{background:T.surface,border:"1px solid "+((uploaded.length>0||viaEtape1)?T.accent:dtype.obligatoire?T.amber:T.border),borderRadius:10,padding:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:T.text}}>{dtype.l}{dtype.obligatoire&&<span style={{color:T.red,marginLeft:4}}>*</span>}</div>
                      <div style={{fontSize:10,color:T.muted}}>{dtype.desc}</div>
                          {viaEtape1&&<div style={{fontSize:10,color:"#155724",background:"#D4EDDA",borderRadius:5,padding:"2px 8px",display:"inline-block",marginTop:3,fontWeight:600}}>{dtype.cat==="declaration"?"Fournie a l etape 1: "+data.acteNom:"Reglements extraits automatiquement de la declaration"}</div>}
                    </div>
                    {(uploaded.length>0||viaEtape1)&&<span style={{fontSize:16,color:T.accent}}>OK</span>}
                  </div>
                  {uploaded.map(function(d,i){return(
                    <div key={i} style={{fontSize:10,color:T.accent,background:T.accentL,borderRadius:5,padding:"3px 8px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span>{d.nom} ({d.taille})</span>
                      <button onClick={function(){sd("documents",data.documents.filter(function(x){return x.id!==d.id;}));}} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:12,lineHeight:1}}>x</button>
                    </div>
                  );})}
                  <button onClick={function(){var inp=document.createElement("input");inp.type="file";inp.accept=".pdf,.doc,.docx,.jpg,.png";inp.onchange=function(e){var file=e.target.files[0];if(!file)return;var newDoc={id:Date.now(),nom:file.name,type:"Document",taille:file.size>1048576?(file.size/1048576).toFixed(1)+" MB":(file.size/1024).toFixed(0)+" KB",date:today(),dispo:true,cat:dtype.cat};sd("documents",data.documents.concat([newDoc]));
                    // Extraction automatique des dates cles selon le type de document
                    if(dtype.cat==="police"||dtype.cat==="etude_assurance"||dtype.cat==="carnet_prev"){
                      setDocMsg("Extraction automatique de "+file.name+" en cours...");
                      fichierB64PourIA(file).then(function(src){
                        var mode=dtype.cat==="police"?"assurance":"date_document";
                        return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify(Object.assign({mode:mode},src))}).then(lireReponseAPI);
                      }).then(function(resp){
                        if(!resp||resp.error){setDocMsg("Extraction impossible pour "+file.name+" ("+((resp&&resp.error)||"erreur")+")");return;}
                        var d=resp.data||{};
                        if(dtype.cat==="police"&&d.dateExp&&/^\d{4}-\d{2}-\d{2}$/.test(d.dateExp)){
                          sd("assSyndicatExp",d.dateExp);
                          setDocMsg("Police d assurance: expiration extraite -> "+d.dateExp+(d.compagnie?" ("+d.compagnie+")":""));
                        }else if(dtype.cat==="etude_assurance"&&d.date&&/^\d{4}-\d{2}-\d{2}$/.test(d.date)){
                          sd("etudeAssuranceDate",d.date);
                          setDocMsg("Etude aux fins d assurance: date extraite -> "+d.date+(d.firme?" ("+d.firme+")":"")+". L appel d offres sera planifie selon l intervalle configure.");
                        }else if(dtype.cat==="carnet_prev"&&d.date&&/^\d{4}-\d{2}-\d{2}$/.test(d.date)){
                          sd("etudePrevoyanceDate",d.date);
                          setDocMsg("Etude du fonds de prevoyance: date extraite -> "+d.date+(d.firme?" ("+d.firme+")":""));
                        }else{
                          setDocMsg("Aucune date lisible dans "+file.name+" - vous pourrez la saisir dans les parametres du syndicat.");
                        }
                      }).catch(function(err){setDocMsg("Extraction impossible ("+err.message+")");});
                    }
                  };inp.click();}} style={{width:"100%",background:T.alt,border:"1px dashed "+T.border,borderRadius:7,padding:"5px",fontSize:11,color:T.muted,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>+ Ajouter fichier</button>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(3);}}>- Retour</Btn>
            <Btn onClick={function(){setStep(5);}}>Continuer -</Btn>
          </div>
        </div>
      )}

      {step===5&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 5 - Confirmation et activation</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:20}}>Verifiez le resume de la configuration avant d activer le syndicat.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {[
              {titre:"Syndicat",items:[{l:"Nom",v:data.nom},{l:"Code",v:data.code},{l:"Immatriculation",v:data.immat||"-"},{l:"Annee de constitution",v:data.anneeConstruction||"-"},{l:"Quorum AGO",v:data.quorumAGO?data.quorumAGO+" %":"-"},{l:"Exercice",v:data.exercice}]},
              {titre:"Conseil d administration",items:(data.admins||[]).filter(function(a){return a&&(a.nom||a.prenom);}).map(function(a){var rl={president:"President(e)",vice:"Vice-president(e)",tresorier:"Tresorier(e)",secretaire:"Secretaire",membre:"Membre"};return {l:rl[a.role]||"Membre",v:((a.prenom||"")+" "+(a.nom||"")).trim()};})},
              {titre:"Unites et quotes-parts",items:[{l:"Unites importees",v:copros.length||data.nbUnites||"0"},{l:"Fraction totale",v:totalFraction>0?totalFraction.toFixed(3)+" %":"-"},{l:"Quotes-parts validees",v:qpResult&&qpResult.concordance===true?"Oui":"A valider"}]},
              {titre:"Documents et dates cles",items:[{l:"Importes",v:data.documents.length+" document(s)"},{l:"Declaration",v:(data.documents.find(function(d){return d.cat==="declaration";})||data.acteNom)?"- Presente":"- Manquante"},{l:"Reglements",v:(data.reglementsResume?"- Extraits de la declaration":(data.documents.find(function(d){return d.cat==="reglement";})?"- Fichier fourni":"-"))},{l:"Assurance syndicat expire",v:data.assSyndicatExp||"-"},{l:"Etude assurance (date)",v:data.etudeAssuranceDate||"-"},{l:"Etude prevoyance (date)",v:data.etudePrevoyanceDate||"-"}]},
            ].map(function(section){return(
              <div key={section.titre} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
                <div style={{fontSize:11,fontWeight:700,color:T.navy,marginBottom:10,paddingBottom:6,borderBottom:"1px solid "+T.border}}>{section.titre}</div>
                {section.items.map(function(item,i){return(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0"}}>
                    <span style={{color:T.muted}}>{item.l}</span>
                    <span style={{fontWeight:600,color:T.text}}>{item.v}</span>
                  </div>
                );})}
              </div>
            );})}
          </div>
          {data.reglementsResume&&(
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:T.navy,marginBottom:8,paddingBottom:6,borderBottom:"1px solid "+T.border}}>Reglements extraits de la declaration (conserves avec le syndicat)</div>
              <div style={{fontSize:11,color:T.text,whiteSpace:"pre-wrap",lineHeight:1.5,maxHeight:180,overflowY:"auto"}}>{data.reglementsResume}</div>
            </div>
          )}
          <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:12,color:T.accent}}>
            <b>Pret a activer!</b> Le syndicat {data.nom} sera cree et accessible dans tous les modules Predictek.
          </div>
          <div style={{background:T.blueL,borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:11,color:T.blue}}>
            Prochaines etapes apres l activation: creer le BUDGET (les cotisations mensuelles par unite seront calculees a partir du budget et des quotes-parts), puis les soldes bancaires et le carnet d entretien Loi 16.
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(4);}}>- Retour</Btn>
            <Btn bg={T.accent} onClick={terminer} style={{fontSize:14,padding:"12px 28px"}}>Activer le syndicat {data.nom}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}



// ===== PARAMS PREDICTEK =====


function ParamsPredictek(){
  var NC={muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF"};
  var NI={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
  var NL={fontSize:10,color:"#7C7568",textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5};
  function load(k,d){try{var v=localStorage.getItem("predictek_params_"+k);return v?JSON.parse(v):d;}catch(e){return d;}}
  function save(k,v){try{localStorage.setItem("predictek_params_"+k,JSON.stringify(v));}catch(e){}}
  var s0=useState(function(){return load("entreprise",{nomLegal:"",nomCommercial:"Predictek",adr:"",ville:"",province:"QC",codePostal:"",siteWeb:"",courriel:"",telephone:"",neq:"",exerciceDebut:"01-11",exerciceFin:"31-10"});});
  var infos=s0[0];var setInfos=s0[1];
  var s1=useState(function(){return load("fiscalite",{noTPS:"",noTVQ:"",noDeclarant:"",freqTPS:"trimestrielle",freqTVQ:"trimestrielle",inscritTPS:true,inscritTVQ:true});});
  var fisc=s1[0];var setFisc=s1[1];
  var s2=useState(function(){return load("banque",{institution:"",transit:"",noInstitution:"",noCompte:"",nomCompte:""});});
  var banque=s2[0];var setBanque=s2[1];
  var s3=useState(function(){return load("logo",{url:"",nom:""});});
  var logo=s3[0];var setLogo=s3[1];
  var s4=useState("entreprise");var ong=s4[0];var setOng=s4[1];
  var s5=useState("");var ok=s5[0];var setOk=s5[1];
  var s6i=useState({etudeAssurance:"5",etudePrevoyance:"5"});var interv=s6i[0];var setInterv=s6i[1];
  useEffect(function(){
    sb.select("config_publique",{}).then(function(r){
      if(r&&r.data){
        var n={};
        r.data.forEach(function(x){
          if(x.cle==="etude_assurance_ans")n.etudeAssurance=x.valeur;
          if(x.cle==="etude_prevoyance_ans")n.etudePrevoyance=x.valeur;
        });
        if(Object.keys(n).length>0)setInterv(function(pr){return Object.assign({},pr,n);});
      }
    }).catch(function(){});
  },[]);

  var setI=function(k,v){setInfos(function(p){return Object.assign({},p,{[k]:v});});};
  var setF=function(k,v){setFisc(function(p){return Object.assign({},p,{[k]:v});});};
  var setB=function(k,v){setBanque(function(p){return Object.assign({},p,{[k]:v});});};

  function sauver(){
    save("entreprise",infos);save("fiscalite",fisc);save("banque",banque);save("logo",logo);
    sb.upsert("config_publique",[{cle:"etude_assurance_ans",valeur:String(parseInt(interv.etudeAssurance)||5)},{cle:"etude_prevoyance_ans",valeur:String(parseInt(interv.etudePrevoyance)||5)}],"cle").catch(function(){});
    try{if(logo.url)localStorage.setItem("predictek_logo",logo.url);}catch(e){}
    // Le logo est publie en base pour apparaitre dans l entete et au login de TOUS les usagers
    if(logo.url){
      sb.upsert("config_publique",[{cle:"logo",valeur:logo.url}],"cle").then(function(r){
        if(r&&r.error)setOk("Sauvegarde locale OK mais publication du logo ECHOUEE: "+(r.error.message||""));
        else {setOk("Sauvegarde! Logo publie pour tous les usagers.");setTimeout(function(){setOk("");},4000);}
      });
    } else {
      setOk("Sauvegarde!");setTimeout(function(){setOk("");},3000);
    }
  }
  function handleLogo(e){
    var file=e.target.files[0];if(!file)return;
    var r=new FileReader();
    r.onload=function(ev){setLogo({url:ev.target.result,nom:file.name});try{localStorage.setItem("predictek_logo",ev.target.result);}catch(x){}};
    r.readAsDataURL(file);
  }

  var TABS=[{id:"entreprise",l:"Entreprise"},{id:"fiscalite",l:"TPS / TVQ"},{id:"banque",l:"Banque"},{id:"logo",l:"Logo"}];
  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:NC.navy}}>Parametres Predictek</div>
          <div style={{fontSize:11,color:NC.muted}}>Informations de votre entreprise</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {ok&&<span style={{fontSize:11,color:NC.accent,fontWeight:600,background:NC.accentL,padding:"4px 12px",borderRadius:20}}>{ok}</span>}
          <button onClick={sauver} style={{background:NC.accent,border:"none",borderRadius:7,padding:"8px 18px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Sauvegarder</button>
        </div>
      </div>

      <div style={{display:"flex",gap:3,marginBottom:16,background:NC.surface,padding:4,borderRadius:10,border:"1px solid "+NC.border}}>
        {TABS.map(function(t){var a=ong===t.id;return(<button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?NC.navy:"transparent",border:"none",borderRadius:7,padding:"7px 16px",color:a?"#fff":NC.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400}}>{t.l}</button>);})}
      </div>

      {ong==="entreprise"&&(
        <div>
        <div style={{background:NC.surface,border:"1px solid "+NC.border,borderRadius:12,padding:20,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:NC.navy,marginBottom:4}}>Intervalles reglementaires (tous les syndicats)</div>
          <div style={{fontSize:11,color:NC.muted,marginBottom:12}}>Frequence de renouvellement des etudes - utilisee pour planifier les appels d offres automatiquement.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><div style={NL}>Etude aux fins d assurance (ans)</div><select value={interv.etudeAssurance} onChange={function(e){setInterv(function(pr){return Object.assign({},pr,{etudeAssurance:e.target.value});});}} style={NI}>{["1","2","3","4","5","6","7","8","9","10"].map(function(x){return <option key={x} value={x}>{x} an(s)</option>;})}</select></div>
            <div><div style={NL}>Etude du fonds de prevoyance (ans)</div><select value={interv.etudePrevoyance} onChange={function(e){setInterv(function(pr){return Object.assign({},pr,{etudePrevoyance:e.target.value});});}} style={NI}>{["1","2","3","4","5","6","7","8","9","10"].map(function(x){return <option key={x} value={x}>{x} an(s)</option>;})}</select></div>
          </div>
        </div>
        <div style={{background:NC.surface,border:"1px solid "+NC.border,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:NC.navy,marginBottom:14}}>Informations legales et coordonnees</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{gridColumn:"1/-1"}}><div style={NL}>Nom legal</div><input value={infos.nomLegal} onChange={function(e){setI("nomLegal",e.target.value);}} style={NI} placeholder="9XXX-XXXX Quebec inc."/></div>
            <div><div style={NL}>Nom commercial</div><input value={infos.nomCommercial} onChange={function(e){setI("nomCommercial",e.target.value);}} style={NI} placeholder="Predictek"/></div>
            <div><div style={NL}>NEQ</div><input value={infos.neq} onChange={function(e){setI("neq",e.target.value);}} style={NI} placeholder="1234567890"/></div>
            <div style={{gridColumn:"1/-1"}}><div style={NL}>Adresse</div><input value={infos.adr} onChange={function(e){setI("adr",e.target.value);}} style={NI} placeholder="123 rue Principale"/></div>
            <div><div style={NL}>Ville</div><input value={infos.ville} onChange={function(e){setI("ville",e.target.value);}} style={NI} placeholder="Quebec"/></div>
            <div><div style={NL}>Province</div><select value={infos.province} onChange={function(e){setI("province",e.target.value);}} style={NI}><option>QC</option><option>ON</option><option>BC</option><option>AB</option></select></div>
            <div><div style={NL}>Code postal</div><input value={infos.codePostal} onChange={function(e){setI("codePostal",e.target.value.toUpperCase());}} style={NI} placeholder="G1A 1A1"/></div>
            <div><div style={NL}>Telephone</div><input value={infos.telephone} onChange={function(e){setI("telephone",e.target.value);}} style={NI} placeholder="418-555-0000"/></div>
            <div><div style={NL}>Courriel</div><input value={infos.courriel} onChange={function(e){setI("courriel",e.target.value);}} style={NI} placeholder="info@predictek.ca"/></div>
            <div><div style={NL}>Site web</div><input value={infos.siteWeb} onChange={function(e){setI("siteWeb",e.target.value);}} style={NI} placeholder="app.predictek.ca"/></div>
            <div><div style={NL}>Debut exercice</div><input value={infos.exerciceDebut} onChange={function(e){setI("exerciceDebut",e.target.value);}} style={NI} placeholder="01-11"/></div>
            <div><div style={NL}>Fin exercice</div><input value={infos.exerciceFin} onChange={function(e){setI("exerciceFin",e.target.value);}} style={NI} placeholder="31-10"/></div>
          </div>
        </div>
        </div>
      )}

      {ong==="fiscalite"&&(
        <div style={{background:NC.surface,border:"1px solid "+NC.border,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:NC.navy,marginBottom:14}}>Taxes et parametres fiscaux</div>
          <div style={{display:"grid",gap:12}}>
            <div style={{background:NC.accentL,borderRadius:10,padding:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{fontSize:12,fontWeight:700,color:NC.accent,gridColumn:"1/-1"}}>TPS - Federal (5%)</div>
              <div><div style={NL}>Numero TPS</div><input value={fisc.noTPS} onChange={function(e){setF("noTPS",e.target.value.toUpperCase());}} style={NI} placeholder="123456789 RT0001"/></div>
              <div><div style={NL}>Frequence</div><select value={fisc.freqTPS} onChange={function(e){setF("freqTPS",e.target.value);}} style={NI}><option value="mensuelle">Mensuelle</option><option value="trimestrielle">Trimestrielle</option><option value="annuelle">Annuelle</option></select></div>
              <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8}}><input type="checkbox" id="cbTPS" checked={!!fisc.inscritTPS} onChange={function(e){setF("inscritTPS",e.target.checked);}}/><label htmlFor="cbTPS" style={{fontSize:12}}>Inscrit a la TPS</label></div>
            </div>
            <div style={{background:NC.blueL,borderRadius:10,padding:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{fontSize:12,fontWeight:700,color:NC.blue,gridColumn:"1/-1"}}>TVQ - Provincial (9.975%)</div>
              <div><div style={NL}>Numero TVQ</div><input value={fisc.noTVQ} onChange={function(e){setF("noTVQ",e.target.value.toUpperCase());}} style={NI} placeholder="1234567890 TQ0001"/></div>
              <div><div style={NL}>No declarant</div><input value={fisc.noDeclarant} onChange={function(e){setF("noDeclarant",e.target.value);}} style={NI} placeholder="1234567890"/></div>
              <div><div style={NL}>Frequence</div><select value={fisc.freqTVQ} onChange={function(e){setF("freqTVQ",e.target.value);}} style={NI}><option value="mensuelle">Mensuelle</option><option value="trimestrielle">Trimestrielle</option><option value="annuelle">Annuelle</option></select></div>
              <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8}}><input type="checkbox" id="cbTVQ" checked={!!fisc.inscritTVQ} onChange={function(e){setF("inscritTVQ",e.target.checked);}}/><label htmlFor="cbTVQ" style={{fontSize:12}}>Inscrit a la TVQ</label></div>
            </div>
          </div>
        </div>
      )}

      {ong==="banque"&&(
        <div style={{background:NC.surface,border:"1px solid "+NC.border,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:NC.navy,marginBottom:14}}>Coordonnees bancaires</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><div style={NL}>Institution</div><input value={banque.institution} onChange={function(e){setB("institution",e.target.value);}} style={NI} placeholder="Desjardins, RBC..."/></div>
            <div><div style={NL}>Nom du compte</div><input value={banque.nomCompte} onChange={function(e){setB("nomCompte",e.target.value);}} style={NI} placeholder="Compte operations"/></div>
            <div><div style={NL}>Transit (5 chiffres)</div><input value={banque.transit} onChange={function(e){setB("transit",e.target.value);}} style={NI} placeholder="12345"/></div>
            <div><div style={NL}>No institution (3 chiffres)</div><input value={banque.noInstitution} onChange={function(e){setB("noInstitution",e.target.value);}} style={NI} placeholder="815"/></div>
            <div style={{gridColumn:"1/-1"}}><div style={NL}>No de compte</div><input value={banque.noCompte} onChange={function(e){setB("noCompte",e.target.value);}} style={NI} placeholder="1234567"/></div>
          </div>
        </div>
      )}

      {ong==="logo"&&(
        <div style={{background:NC.surface,border:"1px solid "+NC.border,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:NC.navy,marginBottom:14}}>Logo et identite visuelle</div>
          <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
            <div style={{width:120,height:120,borderRadius:14,background:logo.url?"#fff":"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid "+NC.border,overflow:"hidden",flexShrink:0}}>
              {logo.url?<img src={logo.url} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain",padding:8}}/>:<span style={{color:"#fff",fontWeight:900,fontSize:48,fontFamily:"Georgia,serif"}}>P</span>}
            </div>
            <div style={{flex:1}}>
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" id="lgUp" onChange={handleLogo} style={{display:"none"}}/>
              <div style={{display:"grid",gap:10,marginBottom:12}}>
                <button onClick={function(){document.getElementById("lgUp").click();}} style={{background:NC.accent,border:"none",borderRadius:7,padding:"8px 18px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{logo.url?"Remplacer":"Choisir un logo"}</button>
                {logo.url&&<button onClick={function(){setLogo({url:"",nom:""});try{localStorage.removeItem("predictek_logo");}catch(e){};}} style={{background:NC.redL,border:"none",borderRadius:7,padding:"8px 18px",color:NC.red,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Retirer</button>}
              </div>
              {logo.nom&&<div style={{fontSize:11,color:NC.muted,marginBottom:8}}>{logo.nom}</div>}
              <div style={{background:NC.alt,borderRadius:8,padding:"10px 14px",fontSize:11,color:NC.muted}}>PNG, JPG ou SVG. Min 200x200px.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Equipe et acces: modules REELS (employes en base + invitations Supabase)
function TabEquipeAcces(){
  var s0=useState("employes");var eOng=s0[0];var setEOng=s0[1];
  var ETABS=[{id:"employes",l:"Employes Predictek"},{id:"usagers",l:"Usagers systeme"}];
  return(
    <div>
      <div style={{display:"flex",gap:3,marginBottom:14,background:T.surface,padding:4,borderRadius:9,border:"1px solid "+T.border,width:"fit-content"}}>
        {ETABS.map(function(t){var a=eOng===t.id;return(<button key={t.id} onClick={function(){setEOng(t.id);}} style={{background:a?"#6B3FA0":"transparent",border:"none",borderRadius:7,padding:"6px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400}}>{t.l}</button>);})}
      </div>
      {eOng==="employes"&&<GestionEmployes/>}
      {eOng==="usagers"&&<GestionUtilisateurs/>}
    </div>
  );
}

// Communications: module REEL branche a la base (plus de donnees de demonstration)
function TabCommunicationsHub(){
  return <Communications/>;
}






// ===== MODULE PRINCIPAL HUB =====
export default function Hub(){
  var s0=useState("syndicats");var ong=s0[0];var setOng=s0[1];
  var s1=useState(SYNDICATS_INIT);var syndicats=s1[0];var setSyndicats=s1[1];
  var s2=useState(null);var detail=s2[0];var setDetail=s2[1];
  var s3=useState(false);var creer=s3[0];var setCreer=s3[1];
  var s4=useState(null);var setup=s4[0];var setSetup=s4[1];
  var s5=useState(false);var showParams=s5[0];var setShowParams=s5[1];
  var s6=useState("");var errSync=s6[0];var setErrSync=s6[1];
  var s7=useState([]);var recup=s7[0];var setRecup=s7[1];
  var s8=useState(false);var persistEnCours=s8[0];var setPersistEnCours=s8[1];
  var s9=useState("");var okSync=s9[0];var setOkSync=s9[1];

  // Sauvegarde COMPLETE d un syndicat en base, avec erreurs VISIBLES (plus d echec silencieux)
  function persisterSyndicat(nouveau){
    if(persistEnCours)return;
    setPersistEnCours(true);
    setErrSync("");setOkSync("");
    var normDate=function(v){
      if(!v)return null;
      var s=String(v).trim();
      if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
      var d=new Date(s);
      return isNaN(d.getTime())?null:d.toISOString().substring(0,10);
    };
    sb.insert("syndicats",{code:nouveau.code,nom:nouveau.nom,adr:nouveau.adr||"",ville:nouveau.ville||"",province:nouveau.province||"QC",code_postal:nouveau.codePostal||"",immat:nouveau.immat||"",nb_unites:nouveau.nbUnites||0,president:nouveau.president||"",courriel:nouveau.courriel||"",tel:nouveau.tel||"",annee_constitution:parseInt(nouveau.anneeConstruction)||null,quorum_ago:nouveau.quorumAGO||null,type_copro:nouveau.typeCopro||"",exercice:nouveau.exercice||"",reglements_resume:nouveau.reglementsResume||"",assurance_syndicat_exp:nouveau.assSyndicatExp||null,etude_assurance_date:nouveau.etudeAssuranceDate||null,etude_prevoyance_date:nouveau.etudePrevoyanceDate||null,statut:"actif"}).then(function(res){
      if(!res||!res.data||!res.data.id){
        var msg=(res&&res.error&&(res.error.message||res.error.hint))||"raison inconnue";
        setErrSync("ECHEC de la sauvegarde du syndicat "+(nouveau.nom||"")+" en base de donnees ("+msg+"). Vos donnees restent dans la sauvegarde locale du navigateur - utilisez le bouton Recuperer ci-dessous apres correction.");
        setRecup(function(prev){return prev.indexOf(nouveau.code)<0?prev.concat([nouveau.code]):prev;});
        setPersistEnCours(false);
        return;
      }
      var sid=res.data.id;
      // La declaration COMPLETE est conservee au coffre - disponible au portail coproprietaire
      if(window._acteFile){
        (function(){
          var fA=window._acteFile;
          var extA=(fA.name.match(/\.[a-zA-Z0-9]+$/)||[".pdf"])[0];
          sb.uploadFichier("preuves",sid+"/declaration/declaration"+extA,fA).then(function(rU){
            if(rU&&rU.chemin)sb.update("syndicats",sid,{declaration_doc:rU.chemin}).catch(function(){});
          }).catch(function(){});
        })();
      }
      setSyndicats(function(prev){return prev.map(function(s){return s.code===nouveau.code?Object.assign({},s,{id:sid}):s;});});
      setRecup(function(prev){return prev.filter(function(c){return c!==nouveau.code;});});
      sb.log("syndicat","creation","Nouveau syndicat: "+nouveau.nom,"",nouveau.code);
      // MODELE PAR UNITE: chaque ligne Excel = une UNITE (quote-part, locataire,
      // urgence, chauffe-eau, assurance), avec 1 ou 2 proprietaires rattaches (50/50).
      var lignes=(nouveau.copros||[]);
      var totalUnites=lignes.length;
      var nbFiches=0;
      var promUnites=lignes.map(function(c){
        var deux=!!(c.prop2nom&&String(c.prop2nom).trim());
        var frac=parseFloat(c.fraction)||0;
        var cot=parseFloat(c.cotisation)||0;
        var uniteRow={
          syndicat_id:sid,no_unite:(c.unite||"").toUpperCase(),cadastre:c.cadastre||"",
          fraction:frac,cotisation_mensuelle:cot,adresse:c.adr||"",
          stationnement:c.stationnement||"",rangement:c.rangement||"",
          chauffe_eau:c.chauffeEau||"",assurance_police:c.assurancePolice||"",assurance_exp:normDate(c.assuranceExp),
          locataire:!!c.locNom,nom_locataire:c.locNom||"",tel_locataire:c.locTel||"",courriel_locataire:c.locCourriel||"",
          occupation:(c.locNom?"locataire":"proprietaire"),
          urg_nom:c.urgNom||"",urg_lien:c.urgLien||"",urg_tel:c.urgTel||"",notes:""
        };
        return sb.insert("unites",uniteRow).then(function(ru){
          if(!ru||!ru.data||!ru.data.id)return (ru&&ru.error&&ru.error.message)||"erreur creation unite "+(c.unite||"");
          var uid=ru.data.id;
          var basePers={
            syndicat_id:sid,unite:(c.unite||"").toUpperCase(),unite_id:uid,
            adresse:c.adr||"",code_acces:"",statut:"actif",pap:false,
            assurance_police:c.assurancePolice||"",assurance_exp:normDate(c.assuranceExp)
          };
          var personnes=[];
          if(deux){
            var p2=String(c.prop2nom).trim();var p2prenom="";var p2nom=p2;
            if(p2.indexOf(" ")>0){var pts=p2.split(" ");p2prenom=pts[0];p2nom=pts.slice(1).join(" ");}
            personnes.push(Object.assign({},basePers,{nom:c.nom||"",prenom:c.prenom||"",courriel:c.courriel||"",telephone:c.tel||c.mobile||"",part_pourcent:50,fraction:Math.round(frac/2*1000)/1000,cotisation_mensuelle:Math.round(cot/2*100)/100}));
            personnes.push(Object.assign({},basePers,{nom:p2nom,prenom:p2prenom,courriel:c.prop2courriel||"",telephone:c.prop2tel||"",part_pourcent:50,fraction:Math.round(frac/2*1000)/1000,cotisation_mensuelle:Math.round(cot/2*100)/100}));
          }else{
            personnes.push(Object.assign({},basePers,{nom:c.nom||"",prenom:c.prenom||"",courriel:c.courriel||"",telephone:c.tel||c.mobile||"",part_pourcent:100,fraction:frac,cotisation_mensuelle:cot}));
          }
          nbFiches+=personnes.length;
          return Promise.all(personnes.map(function(pp){
            return sb.insert("coproprietaires",pp).then(function(r){return r&&r.data&&r.data.id?"ok":(r&&r.error&&r.error.message)||"erreur proprietaire";}).catch(function(e){return e.message||"erreur";});
          })).then(function(rs){
            var err=rs.find(function(x){return x!=="ok";});
            return err||"ok";
          });
        }).catch(function(e){return e.message||"erreur";});
      });
      Promise.all(promUnites).then(function(rs){
        var echecs=rs.filter(function(x){return x!=="ok";});
        if(echecs.length>0){
          setErrSync(echecs.length+"/"+totalUnites+" unite(s) NON sauvegardee(s): "+echecs[0]);
        }else{
          setOkSync("Syndicat "+(nouveau.nom||"")+" sauvegarde au complet: "+totalUnites+" unites, "+nbFiches+" fiche(s) de proprietaires, "+((nouveau.admins||[]).filter(function(a){return a.nom||a.prenom;}).length)+" administrateurs, "+((nouveau.documents||[]).length)+" document(s).");
          try{localStorage.removeItem("predictek_syndicat_"+nouveau.code);}catch(e){}
        }
        setPersistEnCours(false);
      });
      (nouveau.admins||[]).forEach(function(a){
        if(!a.nom&&!a.prenom)return;
        var rowCA={
          syndicat_id:sid,nom:a.nom||"",prenom:a.prenom||"",role_ca:normRole(a.role),
          unite:"",courriel:a.courriel||"",cellulaire:a.mobile||"",
          adresse_civique:a.adr||"",ville:a.ville||"",province:a.province||"QC",code_postal:a.codePostal||"",
          date_debut_mandat:a.dateDebut||null,date_fin_mandat:null,actif:true
        };
        var nasDigits=(a.nas||"").replace(/\D/g,"");
        if(nasDigits.length===9){
          fetch("/api/nas",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify({action:"encrypt",nas:nasDigits})})
            .then(function(r){return r.json();})
            .then(function(d){
              if(d&&d.encrypted)rowCA.nas_chiffre=d.encrypted;
              sb.insert("membres_ca",rowCA).catch(function(){});
            })
            .catch(function(){sb.insert("membres_ca",rowCA).catch(function(){});});
        }else{
          sb.insert("membres_ca",rowCA).catch(function(){});
        }
      });
      (nouveau.documents||[]).forEach(function(d){
        var kb=0;var t=(d.taille||"");
        if(t.indexOf("MB")>=0)kb=Math.round(parseFloat(t)*1024);
        else if(t.indexOf("KB")>=0)kb=Math.round(parseFloat(t));
        sb.insert("documents",{
          syndicat_id:sid,niveau:"syndicat",nom:d.nom||"",type_doc:d.cat||"general",
          description:"Ajoute lors de l onboarding",date_doc:null,confidentiel:false,url:"",taille_kb:kb
        }).catch(function(){});
      });
      sb.log("syndicat","onboarding","Donnees onboarding sauvegardees: "+((nouveau.copros||[]).length)+" copros, "+((nouveau.admins||[]).length)+" admins, "+((nouveau.documents||[]).length)+" documents","",nouveau.code);
    }).catch(function(e){
      setErrSync("Erreur de connexion lors de la sauvegarde: "+(e&&e.message?e.message:"inconnue")+". Vos donnees restent dans la sauvegarde locale - bouton Recuperer ci-dessous.");
      setRecup(function(prev){return prev.indexOf(nouveau.code)<0?prev.concat([nouveau.code]):prev;});
      setPersistEnCours(false);
    });
  }

  function recupererLocal(code){
    try{
      var raw=localStorage.getItem("predictek_syndicat_"+code);
      if(!raw){setErrSync("Aucune sauvegarde locale trouvee pour "+code);return;}
      var obj=JSON.parse(raw);
      var saved=Object.assign({},obj,{statut:"actif",cotisationMensuelle:obj.cotisationMensuelle||0,alertesCE:0,alertesAss:0,alertesPAP:0,alertesCarnet:0});
      setSyndicats(function(prev){return prev.filter(function(s){return s.code!==code;}).concat([saved]);});
      persisterSyndicat(saved);
    }catch(e){setErrSync("Sauvegarde locale illisible: "+e.message);}
  }

  useEffect(function(){
    sb.select("syndicats",{order:"created_at.desc"}).then(function(res){
      // Reperer les syndicats sauvegardes localement mais absents de la base (echec anterieur)
      try{
        var codesDB=(res&&res.data?res.data:[]).map(function(s){return s.code;});
        var manquants=[];
        for(var li=0;li<localStorage.length;li++){
          var k=localStorage.key(li);
          if(k&&k.indexOf("predictek_syndicat_")===0){
            var cde=k.replace("predictek_syndicat_","");
            if(cde&&codesDB.indexOf(cde)<0)manquants.push(cde);
          }
        }
        setRecup(manquants);
      }catch(e){}
      if(res&&res.data&&res.data.length>0){
        var base=res.data.map(function(s){
          return {
            id:s.id,code:s.code,nom:s.nom,adr:s.adr||"",
            ville:s.ville||"",province:s.province||"QC",
            immat:s.immat||"",nbUnites:s.nb_unites||0,
            president:s.president||"",courriel:s.courriel||"",
            tel:s.tel||"",telUrgences:s.tel_urgences||"",
            statut:s.statut||"actif",
            anneeConstitution:s.annee_constitution||"",quorumAGO:s.quorum_ago||"",
            exercice:s.exercice||"",
            cotisationMensuelle:0,alertesCE:0,alertesAss:0,
            alertesPAP:0,alertesCarnet:0
          };
        });
        setSyndicats(base);
        // Compter les VRAIES unites (table unites) et corriger l affichage + la BD au besoin
        base.forEach(function(s){
          sb.select("unites",{eq:{syndicat_id:s.id},cols:"id",limit:1000}).then(function(ru){
            var n=ru&&ru.data?ru.data.length:0;
            if(n>0){
              setSyndicats(function(prev){return prev.map(function(x){return x.id===s.id?Object.assign({},x,{nbUnites:n}):x;});});
              if(n!==s.nbUnites)sb.update("syndicats",s.id,{nb_unites:n}).catch(function(){});
            }
          }).catch(function(){});
        });
      }
    }).catch(function(){});
  },[]);

  var actifs=syndicats.filter(function(s){return s.statut==="actif";});
  var totalUnites=actifs.reduce(function(a,s){return a+s.nbUnites;},0);
  var totalCot=actifs.reduce(function(a,s){return a+s.cotisationMensuelle;},0);
  var totalAlertes=actifs.reduce(function(a,s){return a+s.alertesCE+s.alertesAss+s.alertesPAP+s.alertesCarnet;},0);
  var totalFact=actifs.reduce(function(a,s){return a+(s.facturesEnAttente||0);},0);

  var TABS=[{id:"syndicats",l:"Syndicats"},{id:"equipe",l:"Equipe et acces"},{id:"comms_hub",l:"Communications"},{id:"params_predictek",l:"Parametres"}];

  if(creer){
    return(
      <div style={{fontFamily:"Georgia,serif"}}>
        <div style={{background:T.navy,display:"flex",alignItems:"center",gap:12,padding:"12px 20px"}}>
          <Btn sm bg={"#ffffff20"} tc={"#fff"} bdr={"1px solid #ffffff40"} onClick={function(){setCreer(false);}}>Annuler</Btn>
        </div>
        <Onboarding onTermine={function(nouveau){
          var saved=Object.assign({},nouveau,{statut:"actif",cotisationMensuelle:0,alertesCE:0,alertesAss:0,alertesPAP:0,alertesCarnet:0});
          setSyndicats(function(prev){return prev.filter(function(s){return s.code!==nouveau.code;}).concat([saved]);});
          setCreer(false);
          persisterSyndicat(saved);
        }}/>
      </div>
    );
  }

  if(showParams&&detail){
    var selSP=syndicats.find(function(s){return s.id===detail;});
    return(
      <div style={{fontFamily:"Georgia,serif"}}>
        <div style={{background:T.navy,display:"flex",alignItems:"center",gap:12,padding:"12px 20px"}}>
          <Btn sm bg={"#ffffff20"} tc={"#fff"} bdr={"1px solid #ffffff40"} onClick={function(){setShowParams(false);}}>Retour au syndicat</Btn>
          <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{selSP?selSP.nom:""} - Parametres</span>
        </div>
        {selSP&&<ParamsSyndicat syndicat={selSP.code}/>}
      </div>
    );
  }
  if(detail){
    var selS=syndicats.find(function(s){return s.id===detail;});
    return(
      <div style={{padding:16,fontFamily:"Georgia,serif"}}>
        {selS&&<DetailSyndicat syndicat={selS} onRetour={function(){setDetail(null);setShowParams(false);}} onParams={function(){setShowParams(true);}}/>}
      </div>
    );
  }

  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Configuration Predictek</div>
          <div style={{fontSize:11,color:T.muted}}>Vue globale - {actifs.length} syndicat(s) actif(s)</div>
        </div>
        {ong==="syndicats"&&<Btn onClick={function(){setCreer(true);}}>+ Nouveau syndicat</Btn>}
      </div>

      {errSync&&(
        <div style={{background:"#FDECEA",border:"2px solid #B83232",borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:12,color:"#B83232",fontWeight:600}}>{errSync}</div>
      )}
      {okSync&&(
        <div style={{background:"#E8F2EC",border:"2px solid #1B5E3B",borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:12,color:"#1B5E3B",fontWeight:600}}>{okSync}</div>
      )}
      {recup.length>0&&(
        <div style={{background:"#FEF3E2",border:"2px solid #B86020",borderRadius:10,padding:"12px 16px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:"#B86020",marginBottom:8}}>Syndicat(s) sauvegarde(s) localement mais ABSENT(S) de la base de donnees:</div>
          {recup.map(function(c){return(
            <div key={c} style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <span style={{fontSize:12,fontWeight:700}}>{c}</span>
              <Btn sm dis={persistEnCours} onClick={function(){recupererLocal(c);}}>{persistEnCours?"Sauvegarde en cours...":"Recuperer et sauvegarder en base"}</Btn>
              <Btn sm bg={"#EDEBE4"} tc={"#7C7568"} bdr={"1px solid #DDD9CF"} onClick={function(){try{localStorage.removeItem("predictek_syndicat_"+c);}catch(e){}setRecup(function(prev){return prev.filter(function(x){return x!==c;});});}}>Ignorer et supprimer cette sauvegarde</Btn>
            </div>
          );})}
        </div>
      )}
      {totalFact>0&&(
        <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.amber}}>{totalFact} facture(s) en attente d approbation sur l ensemble des syndicats</div>
          <Bdg bg={T.amberL} c={T.amber}>{money(actifs.reduce(function(a,s){return a+s.montantFactures;},0))}</Bdg>
        </div>
      )}

      <div style={{display:"flex",gap:3,marginBottom:16,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {TABS.map(function(t){var a=ong===t.id;return(
          <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"7px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t.l}</button>
        );})}
      </div>

      {ong==="syndicats"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {syndicats.map(function(s){return(
            <CarteSyndicat key={s.id} syndicat={s} onClick={function(){setDetail(s.id);}} onSetup={function(){setCreer(true);}}/>
          );})}
        </div>
      )}

      
      {ong==="equipe"&&<TabEquipeAcces/>}
      {ong==="comms_hub"&&<TabCommunicationsHub/>}
      {ong==="params_predictek"&&<ParamsPredictek/>}

    </div>
  );
}
