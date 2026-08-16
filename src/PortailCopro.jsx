
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

// ----- Extraction automatique de la preuve d assurance televersee -----
function lireReponseP(r){return r.text().then(function(t){try{return JSON.parse(t);}catch(e){return {error:"Reponse inattendue du serveur (code "+r.status+")"};}});}
function fichierPourExtractionP(file){
  return new Promise(function(resolve,reject){
    var isPdf=/pdf$/i.test(file.type)||/\.pdf$/i.test(file.name);
    var fr=new FileReader();
    fr.onerror=function(){reject(new Error("Lecture du fichier impossible"));};
    fr.onload=function(ev){
      var b64=String(ev.target.result).split(",")[1];
      if(isPdf){
        if(b64.length>4200000){reject(new Error("PDF trop volumineux (max ~3 Mo)"));return;}
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
function Badge(p){var C={paye:{bg:"#D4EDDA",tc:"#155724"},en_attente:{bg:"#FEF3E2",tc:"#B86020"},retard:{bg:"#F8D7DA",tc:"#721C24"},nouveau:{bg:"#EFF6FF",tc:"#1A56DB"},en_cours:{bg:"#FEF3E2",tc:"#B86020"},resolu:{bg:"#D4EDDA",tc:"#155724"}};var c=C[p.s]||{bg:"#F0EDE8",tc:"#7C7568"};return <span style={{background:c.bg,color:c.tc,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{p.l}</span>;}

function EcranLogin(p){
  var s0=useState("");var unite=s0[0];var setUnite=s0[1];
  var s1=useState("");var code=s1[0];var setCode=s1[1];
  var s2=useState("");var err=s2[0];var setErr=s2[1];
  var s3=useState(false);var loading=s3[0];var setLoading=s3[1];

  function login(){
    if(!unite.trim()||!code.trim()){setErr("Veuillez entrer votre unite et code d acces.");return;}
    setLoading(true);setErr("");
    sb.select("coproprietaires",{eq:{unite:unite.trim().toUpperCase()}}).then(function(res){
      if(res&&res.data&&res.data.length>0){
        // SECURITE: le code d acces DOIT correspondre exactement - aucune connexion sans code defini.
        var cp=res.data.find(function(x){return x.code_acces&&x.code_acces===code.trim();});
        if(cp){
          p.onLogin(cp);
        }else{
          setErr("Code d acces invalide. Si vous n avez pas encore de code, contactez votre gestionnaire.");
        }
      }else{
        setErr("Unite "+unite.toUpperCase()+" non trouvee dans ce systeme.");
      }
      setLoading(false);
    }).catch(function(){setErr("Erreur de connexion. Verifiez votre reseau.");setLoading(false);});
  }

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#13233A 0%,#1B5E3B 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif"}}>
      <div style={{background:"#fff",borderRadius:16,padding:40,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:32}}>P</span>
          </div>
          <div style={{fontSize:20,fontWeight:800,color:"#13233A"}}>Portail Coproprietaire</div>
          <div style={{fontSize:12,color:"#7C7568",marginTop:6}}>Acces securise a votre espace personnel</div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#7C7568",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Numero d unite</div>
          <input value={unite} onChange={function(e){setUnite(e.target.value.toUpperCase());}} onKeyDown={function(e){if(e.key==="Enter")login();}} style={INP} placeholder="Ex: 101, 3A, PH2..."/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:"#7C7568",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Code d acces</div>
          <input type="password" value={code} onChange={function(e){setCode(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")login();}} style={INP} placeholder="Votre code personnel"/>
        </div>
        {err&&<div style={{background:"#F8D7DA",color:"#721C24",borderRadius:8,padding:"10px 14px",fontSize:12,marginBottom:16}}>{err}</div>}
        <button onClick={login} disabled={loading} style={{width:"100%",background:loading?"#ccc":"linear-gradient(135deg,#1B5E3B,#3CAF6E)",border:"none",borderRadius:10,padding:"14px",color:"#fff",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
          {loading?"Verification...":"Se connecter"}
        </button>
        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:"#7C7568"}}>Votre code d acces se trouve dans votre avis de bienvenue. Pour assistance: contactez votre gestionnaire.</div>
      </div>
    </div>
  );
}

function Tableau(p){
  var copro=p.copro;
  var s0=useState([]);var paiements=s0[0];var setPaiements=s0[1];
  var s1=useState([]);var tickets=s1[0];var setTickets=s1[1];
  var sMI=useState(null);var monInfo=sMI[0];var setMonInfo=sMI[1];
  var sMI2=useState("");var msgInfo=sMI2[0];var setMsgInfo=sMI2[1];
  var s2=useState([]);var docs=s2[0];var setDocs=s2[1];
  var s3=useState("accueil");var ong=s3[0];var setOng=s3[1];
  var s4s=useState(null);var syndic=s4s[0];var setSyndic=s4s[1];
  var s5r=useState(false);var voirReglements=s5r[0];var setVoirReglements=s5r[1];
  var sU=useState(null);var uni=sU[0];var setUni=sU[1];
  var sUF=useState(null);var fUni=sUF[0];var setFUni=sUF[1];
  var sUM=useState("");var msgUni=sUM[0];var setMsgUni=sUM[1];
  var sUA=useState(null);var fichAss=sUA[0];var setFichAss=sUA[1];
  var sUC=useState(null);var fichCE=sUC[0];var setFichCE=sUC[1];
  var sAE=useState("");var assExtraitMsg=sAE[0];var setAssExtraitMsg=sAE[1];
  var sAX=useState({});var assExtr=sAX[0];var setAssExtr=sAX[1];
  var sFC=useState([]);var facturesCop=sFC[0];var setFacturesCop=sFC[1];
  var sDS=useState([]);var docsSyn=sDS[0];var setDocsSyn=sDS[1];

  useEffect(function(){
    if(!copro)return;
    sb.select("paiements",{eq:{coproprietaire_id:copro.id},order:"date_paiement.desc",limit:24}).then(function(res){
      if(res&&res.data)setPaiements(res.data);
    }).catch(function(){});
    sb.select("tickets",{eq:{coproprietaire_id:copro.id},order:"created_at.desc",limit:10}).then(function(res){
      if(res&&res.data)setTickets(res.data);
    }).catch(function(){});
    sb.select("documents",{eq:{niveau:"coproprietaire",coproprietaire_id:copro.id},order:"created_at.desc"}).then(function(res){
      if(res&&res.data)setDocs(res.data);
    }).catch(function(){});
    if(copro.syndicat_id){
      sb.selectOne("syndicats",{eq:{id:copro.syndicat_id}}).then(function(res){
        if(res&&res.data)setSyndic(res.data);
      }).catch(function(){});
      // Fiche de l UNITE du coproprietaire (occupation, urgence, assurance)
      var chargerUni=function(r){
        if(r&&r.data){
          var u=Array.isArray(r.data)?r.data[0]:r.data;
          if(u){setUni(u);setFUni({occupation:u.occupation||"proprietaire",nom_locataire:u.nom_locataire||"",tel_locataire:u.tel_locataire||"",courriel_locataire:u.courriel_locataire||"",urg_nom:u.urg_nom||"",urg_lien:u.urg_lien||"",urg_tel:u.urg_tel||"",urg_courriel:u.urg_courriel||"",assurance_exp:u.assurance_exp||"",chauffe_eau:u.chauffe_eau||"",ce_date_install:u.ce_date_install||""});}
        }
      };
      if(copro.unite_id){
        sb.selectOne("unites",{eq:{id:copro.unite_id}}).then(chargerUni).catch(function(){});
      }else if(copro.unite){
        sb.select("unites",{eq:{syndicat_id:copro.syndicat_id,no_unite:copro.unite},limit:1}).then(chargerUni).catch(function(){});
      }
      // Factures emises au coproprietaire (frais, infractions, refacturation)
      sb.select("factures_copros",{eq:{syndicat_id:copro.syndicat_id},order:"date_facture.desc",limit:50}).then(function(r){
        if(r&&r.data)setFacturesCop(r.data.filter(function(f){return f.coproprietaire_id===copro.id||(f.unite&&f.unite===copro.unite);}));
      }).catch(function(){});
      // Documents du SYNDICAT accessibles a tous les coproprietaires (certificat d assurance
      // de la copropriete, PV, assemblees, budgets...) - les confidentiels sont exclus
      sb.select("documents",{eq:{niveau:"syndicat",syndicat_id:copro.syndicat_id},order:"created_at.desc",limit:100}).then(function(r){
        if(r&&r.data)setDocsSyn(r.data.filter(function(d){return !d.confidentiel;}));
      }).catch(function(){});
    }
  },[copro]);

  // Extraction automatique de la preuve d assurance (compagnie, police, dates)
  function extraireAssurancePortail(file){
    setAssExtraitMsg("Lecture automatique de la preuve d assurance en cours...");
    setAssExtr({});
    fichierPourExtractionP(file).then(function(src){
      var corps=Object.assign({mode:"assurance"},src);
      return fetch("/api/extract",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify(corps)}).then(lireReponseP);
    }).then(function(resp){
      if(!resp||resp.error){setAssExtraitMsg("Extraction impossible ("+((resp&&resp.error)||"erreur")+") - entrez la date d expiration manuellement, le document sera quand meme depose.");return;}
      var d=resp.data||{};var pris=[];var ex={};
      if(d.compagnie){ex.ass_cie=d.compagnie;pris.push(d.compagnie);}
      if(d.police){ex.assurance_police=d.police;pris.push("police "+d.police);}
      if(d.dateDebut&&/^\d{4}-\d{2}-\d{2}$/.test(d.dateDebut)){ex.assurance_debut=d.dateDebut;pris.push("debut "+d.dateDebut);}
      if(d.dateExp&&/^\d{4}-\d{2}-\d{2}$/.test(d.dateExp)){setFUni(function(pr){return Object.assign({},pr,{assurance_exp:d.dateExp});});pris.push("expiration "+d.dateExp);}
      setAssExtr(ex);
      setAssExtraitMsg(pris.length>0?"Extrait automatiquement: "+pris.join(", ")+" - verifiez puis cliquez Sauvegarder.":"Aucune information lisible dans ce document - entrez la date d expiration manuellement.");
    }).catch(function(e){setAssExtraitMsg("Extraction impossible ("+(e&&e.message?e.message:"erreur")+") - entrez la date manuellement, le document sera quand meme depose.");});
  }

  function sauverUnite(){
    if(!uni||!fUni)return;
    setMsgUni("Sauvegarde...");
    var maj={occupation:fUni.occupation||"proprietaire",
      locataire:(fUni.occupation==="locataire"||fUni.occupation==="court_terme"),
      nom_locataire:fUni.nom_locataire||"",tel_locataire:fUni.tel_locataire||"",courriel_locataire:fUni.courriel_locataire||"",
      urg_nom:fUni.urg_nom||"",urg_lien:fUni.urg_lien||"",urg_tel:fUni.urg_tel||"",urg_courriel:fUni.urg_courriel||"",
      assurance_exp:fUni.assurance_exp||null,
      chauffe_eau:fUni.chauffe_eau||"",ce_date_install:fUni.ce_date_install||null};
    if(assExtr.ass_cie)maj.ass_cie=assExtr.ass_cie;
    if(assExtr.assurance_police)maj.assurance_police=assExtr.assurance_police;
    if(assExtr.assurance_debut)maj.assurance_debut=assExtr.assurance_debut;
    var etapes=Promise.resolve();
    if(fichAss){
      var ext=(fichAss.name.match(/\.[a-zA-Z0-9]+$/)||[".pdf"])[0];
      var ch=copro.syndicat_id+"/portail/"+copro.id+"-assurance-unite-"+Date.now()+ext;
      etapes=etapes.then(function(){return sb.uploadFichier("preuves",ch,fichAss).then(function(up){if(up&&up.chemin)maj.assurance_doc=ch;});});
    }
    if(fichCE){
      var extC=(fichCE.name.match(/\.[a-zA-Z0-9]+$/)||[".jpg"])[0];
      var chC=copro.syndicat_id+"/portail/"+copro.id+"-chauffe-eau-"+Date.now()+extC;
      etapes=etapes.then(function(){return sb.uploadFichier("preuves",chC,fichCE).then(function(up){if(up&&up.chemin)maj.ce_photo=chC;});});
    }
    etapes.then(function(){
      return sb.update("unites",uni.id,maj);
    }).then(function(r){
      if(r&&r.data&&r.data.id){
        setUni(Object.assign({},uni,maj));setFichAss(null);setFichCE(null);
        setMsgUni("Fiche de l unite mise a jour.");
        return;
      }
      // Acces direct refuse par la securite: la demande part au gestionnaire avec TOUS les details
      var desc="Le coproprietaire demande la mise a jour de la fiche de l unite "+(copro.unite||"")+": "
        +"occupation="+maj.occupation
        +(maj.nom_locataire?", occupant="+maj.nom_locataire+" ("+(maj.tel_locataire||"")+" "+(maj.courriel_locataire||"")+")":"")
        +", urgence="+(maj.urg_nom||"-")+(maj.urg_lien?" ("+maj.urg_lien+")":"")+" "+(maj.urg_tel||"")+" "+(maj.urg_courriel||"")
        +(maj.assurance_exp?", assurance expire le "+maj.assurance_exp:"")
        +(maj.assurance_doc?", preuve d assurance deposee: storage:"+maj.assurance_doc:"")
        +(maj.chauffe_eau?", chauffe-eau: "+maj.chauffe_eau+(maj.ce_date_install?" installe "+maj.ce_date_install:""):"")
        +(maj.ce_photo?", photo chauffe-eau deposee: storage:"+maj.ce_photo:"");
      return sb.insert("tickets",{coproprietaire_id:copro.id,syndicat_id:copro.syndicat_id,unite:copro.unite,
        sujet:"Mise a jour de la fiche de l unite "+(copro.unite||""),description:desc,statut:"nouveau",priorite:"normale"}).then(function(r2){
        if(r2&&r2.data&&r2.data.id){setMsgUni("Demande transmise au gestionnaire (mise a jour en attente de validation).");setTickets(function(prev){return [r2.data].concat(prev);});}
        else setMsgUni("ECHEC de la sauvegarde - contactez votre gestionnaire.");
      });
    }).catch(function(e){setMsgUni("ECHEC: "+(e&&e.message?e.message:"erreur"));});
  }

  var payes=paiements.filter(function(p){return p.statut==="paye";});
  var enAttente=paiements.filter(function(p){return p.statut==="en_attente";});
  var totalDu=enAttente.reduce(function(a,p){return a+Number(p.montant);},0);

  var TABS=[{id:"accueil",l:"Mon compte"},{id:"paiements",l:"Paiements"},{id:"tickets",l:"Demandes"},{id:"docs",l:"Documents"}];

  function soumettreTicket(sujet,description){
    if(!sujet.trim())return;
    sb.insert("tickets",{coproprietaire_id:copro.id,syndicat_id:copro.syndicat_id,unite:copro.unite,sujet:sujet,description:description,statut:"nouveau",priorite:"normale"}).then(function(res){
      if(res&&res.data)setTickets(function(prev){return [res.data].concat(prev);});
    }).catch(function(){});
  }

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:18}}>P</span>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>Portail Coproprietaire</div>
            <div style={{fontSize:10,color:"#3CAF6E"}}>Unite {copro.unite} - {copro.nom}</div>
          </div>
        </div>
        <Btn sm bg="#ffffff18" bdr="1px solid #ffffff30" onClick={p.onLogout}>Deconnexion</Btn>
      </div>

      <div style={{display:"flex",gap:0,borderBottom:"1px solid "+T.border,background:T.surface,overflowX:"auto"}}>
        {TABS.map(function(t){var a=ong===t.id;return(
          <button key={t.id} onClick={function(){setOng(t.id);}} style={{padding:"12px 20px",background:"transparent",border:"none",borderBottom:a?"3px solid "+T.accent:"3px solid transparent",color:a?T.accent:T.muted,fontSize:12,fontWeight:a?700:400,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{t.l}</button>
        );})}
      </div>

      <div style={{padding:20,maxWidth:800,margin:"0 auto"}}>
        {ong==="accueil"&&(
          <div>
            <div style={{background:T.surface,border:"2px solid #1B5E3B33",borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:T.navy,marginBottom:4}}>Mes informations</div>
              <div style={{fontSize:11,color:T.muted,marginBottom:10}}>Tenez vos coordonnees a jour - elles servent aux communications officielles du syndicat.</div>
              {(function(){
                var mi=monInfo||{courriel:copro.courriel||"",telephone:copro.telephone||""};
                return(
                  <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
                    <div style={{minWidth:220}}><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>COURRIEL</div><input value={mi.courriel} onChange={function(e){setMonInfo(Object.assign({},mi,{courriel:e.target.value}));}} style={{width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                    <div style={{minWidth:160}}><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>TELEPHONE</div><input value={mi.telephone} onChange={function(e){setMonInfo(Object.assign({},mi,{telephone:e.target.value}));}} style={{width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                    <Btn onClick={function(){
                      setMsgInfo("Sauvegarde...");
                      sb.update("coproprietaires",copro.id,{courriel:(mi.courriel||"").trim(),telephone:(mi.telephone||"").trim()}).then(function(r){
                        if(r&&r.data&&r.data.id){setMsgInfo("Informations mises a jour.");copro.courriel=mi.courriel;copro.telephone=mi.telephone;return;}
                        // Acces direct refuse: on transmet la demande au gestionnaire
                        return sb.insert("tickets",{coproprietaire_id:copro.id,syndicat_id:copro.syndicat_id,unite:copro.unite,
                          sujet:"Mise a jour de mes coordonnees (unite "+(copro.unite||"")+")",
                          description:"Nouveau courriel: "+(mi.courriel||"")+" | Nouveau telephone: "+(mi.telephone||""),
                          statut:"nouveau",priorite:"normale"}).then(function(r2){
                          if(r2&&r2.data&&r2.data.id){setMsgInfo("Demande de mise a jour transmise au gestionnaire.");setTickets(function(prev){return [r2.data].concat(prev);});}
                          else setMsgInfo("ECHEC - contactez votre gestionnaire.");
                        });
                      }).catch(function(){setMsgInfo("ECHEC - contactez votre gestionnaire.");});
                    }}>Sauvegarder</Btn>
                    {msgInfo&&<span style={{fontSize:11,fontWeight:700,color:msgInfo.indexOf("ECHEC")===0?"#B83232":"#1B5E3B"}}>{msgInfo}</span>}
                  </div>
                );
              })()}
            </div>

            <div style={{fontSize:16,fontWeight:800,color:T.navy,marginBottom:4}}>Bonjour, {copro.prenom||copro.nom} !</div>
            <div style={{fontSize:12,color:T.muted,marginBottom:20}}>Bienvenue dans votre espace personnel. Voici un resume de votre compte.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
              <div style={{background:totalDu>0?T.amberL:T.accentL,border:"1px solid "+(totalDu>0?T.amber:T.accent)+"44",borderRadius:12,padding:16}}>
                <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Solde en attente</div>
                <div style={{fontSize:26,fontWeight:800,color:totalDu>0?T.amber:T.accent}}>{totalDu.toFixed(2)} $</div>
                <div style={{fontSize:11,color:T.muted,marginTop:4}}>{enAttente.length} paiement(s) en attente</div>
              </div>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16}}>
                <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Cotisation mensuelle</div>
                <div style={{fontSize:26,fontWeight:800,color:T.navy}}>{Number(copro.cotisation_mensuelle||0).toFixed(2)} $</div>
                <div style={{fontSize:11,color:T.muted,marginTop:4}}>{copro.pap?"Prelevement automatique actif":"Paiement manuel"}</div>
              </div>
            </div>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>Mes informations</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12}}>
                <div><span style={{color:T.muted}}>Unite: </span><span style={{fontWeight:600}}>{copro.unite}</span></div>
                <div><span style={{color:T.muted}}>Fraction: </span><span style={{fontWeight:600}}>{copro.fraction||"-"}</span></div>
                <div><span style={{color:T.muted}}>Courriel: </span><span>{copro.courriel||"-"}</span></div>
                <div><span style={{color:T.muted}}>Telephone: </span><span>{copro.telephone||"-"}</span></div>
                {copro.adresse&&<div style={{gridColumn:"1/-1"}}><span style={{color:T.muted}}>Adresse: </span><span>{copro.adresse}</span></div>}
              </div>
            </div>

            {fUni&&(
              <div style={{background:T.surface,border:"2px solid #13233A33",borderRadius:12,padding:16,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:800,color:T.navy,marginBottom:4}}>Mon unite</div>
                <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Tenez votre fiche a jour: statut d occupation, personne a contacter en cas d urgence, assurance et chauffe-eau.</div>

                <div style={{fontSize:10,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Statut d occupation</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  <div>
                    <div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>OCCUPATION</div>
                    <select value={fUni.occupation} onChange={function(e){setFUni(Object.assign({},fUni,{occupation:e.target.value}));}} style={INP}>
                      <option value="proprietaire">Proprietaire occupant</option>
                      <option value="locataire">Louee (locataire)</option>
                      <option value="court_terme">Location court terme</option>
                      <option value="resident">Resident (non locataire)</option>
                    </select>
                  </div>
                  {fUni.occupation!=="proprietaire"&&fUni.occupation!=="court_terme"&&(
                    <div><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>{fUni.occupation==="resident"?"NOM DU RESIDENT":"NOM DU LOCATAIRE"}</div><input value={fUni.nom_locataire} onChange={function(e){setFUni(Object.assign({},fUni,{nom_locataire:e.target.value}));}} style={INP}/></div>
                  )}
                  {fUni.occupation!=="proprietaire"&&fUni.occupation!=="court_terme"&&(
                    <div><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>TELEPHONE DE L OCCUPANT</div><input value={fUni.tel_locataire} onChange={function(e){setFUni(Object.assign({},fUni,{tel_locataire:e.target.value}));}} style={INP}/></div>
                  )}
                  {fUni.occupation!=="proprietaire"&&fUni.occupation!=="court_terme"&&(
                    <div><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>COURRIEL DE L OCCUPANT</div><input value={fUni.courriel_locataire} onChange={function(e){setFUni(Object.assign({},fUni,{courriel_locataire:e.target.value}));}} style={INP}/></div>
                  )}
                </div>

                <div style={{fontSize:10,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Contact en cas d urgence</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  <div><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>NOM</div><input value={fUni.urg_nom} onChange={function(e){setFUni(Object.assign({},fUni,{urg_nom:e.target.value}));}} style={INP}/></div>
                  <div><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>LIEN (fils, soeur...)</div><input value={fUni.urg_lien} onChange={function(e){setFUni(Object.assign({},fUni,{urg_lien:e.target.value}));}} style={INP}/></div>
                  <div><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>TELEPHONE</div><input value={fUni.urg_tel} onChange={function(e){setFUni(Object.assign({},fUni,{urg_tel:e.target.value}));}} style={INP}/></div>
                  <div><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>COURRIEL</div><input value={fUni.urg_courriel} onChange={function(e){setFUni(Object.assign({},fUni,{urg_courriel:e.target.value}));}} style={INP}/></div>
                </div>

                <div style={{fontSize:10,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Mon assurance responsabilite</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  <div><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>EXPIRE LE</div><input type="date" value={fUni.assurance_exp||""} onChange={function(e){setFUni(Object.assign({},fUni,{assurance_exp:e.target.value}));}} style={INP}/></div>
                  <div>
                    <div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>PREUVE D ASSURANCE (PDF/photo)</div>
                    <input type="file" accept=".pdf,image/*" onChange={function(e){
                      var fA=e.target.files&&e.target.files[0]?e.target.files[0]:null;
                      setFichAss(fA);
                      if(fA)extraireAssurancePortail(fA);else{setAssExtraitMsg("");setAssExtr({});}
                    }} style={{fontSize:11,fontFamily:"inherit"}}/>
                    {fichAss&&<div style={{fontSize:10,color:T.accent,marginTop:3}}>{fichAss.name}</div>}
                  </div>
                  {assExtraitMsg&&<div style={{gridColumn:"1/-1",fontSize:11,fontWeight:700,color:assExtraitMsg.indexOf("impossible")>=0||assExtraitMsg.indexOf("Aucune")>=0?T.amber:T.accent,background:assExtraitMsg.indexOf("impossible")>=0?T.amberL:T.accentL,borderRadius:7,padding:"6px 10px"}}>{assExtraitMsg}</div>}
                </div>

                <div style={{fontSize:10,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Mon chauffe-eau</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
                  <div><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>MARQUE / MODELE</div><input value={fUni.chauffe_eau} onChange={function(e){setFUni(Object.assign({},fUni,{chauffe_eau:e.target.value}));}} style={INP}/></div>
                  <div><div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>INSTALLE (mois-annee)</div><input type="month" value={fUni.ce_date_install?String(fUni.ce_date_install).substring(0,7):""} onChange={function(e){setFUni(Object.assign({},fUni,{ce_date_install:e.target.value}));}} style={INP}/></div>
                  <div>
                    <div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>PREUVE / FACTURE (PDF/photo)</div>
                    <input type="file" accept=".pdf,image/*" onChange={function(e){setFichCE(e.target.files&&e.target.files[0]?e.target.files[0]:null);}} style={{fontSize:11,fontFamily:"inherit"}}/>
                    {fichCE&&<div style={{fontSize:10,color:T.accent,marginTop:3}}>{fichCE.name}</div>}
                  </div>
                </div>

                <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <Btn onClick={sauverUnite}>Sauvegarder ma fiche d unite</Btn>
                  {msgUni&&<span style={{fontSize:11,fontWeight:700,color:msgUni.indexOf("ECHEC")===0?"#B83232":"#1B5E3B"}}>{msgUni}</span>}
                </div>
              </div>
            )}

            {facturesCop.length>0&&(
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:10}}>Mes factures</div>
                {facturesCop.map(function(fc){
                  var payee=fc.statut==="payee";
                  return(
                    <div key={fc.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+T.border,flexWrap:"wrap"}}>
                      <div style={{flex:1,minWidth:180}}>
                        <div style={{fontSize:12,fontWeight:600,color:T.navy}}>{fc.no_facture||""} - {fc.type_frais==="infraction"?"Penalite d infraction":fc.type_frais==="refacturation"?"Refacturation":"Frais"}</div>
                        <div style={{fontSize:10,color:T.muted}}>{fc.description||""}{fc.date_echeance?" - echeance "+fc.date_echeance:""}</div>
                      </div>
                      <span style={{fontSize:13,fontWeight:700,color:T.navy}}>{Number(fc.montant||0).toFixed(2)} $</span>
                      <Badge s={payee?"paye":"en_attente"} l={payee?"Payee"+(fc.date_paiement?" le "+fc.date_paiement:""):fc.statut==="annulee"?"Annulee":"A payer"}/>
                    </div>
                  );
                })}
              </div>
            )}
            {tickets.filter(function(t){return t.statut!=="resolu";}).length>0&&(
              <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:12,padding:14}}>
                <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:8}}>Demandes en cours</div>
                {tickets.filter(function(t){return t.statut!=="resolu";}).slice(0,3).map(function(t){return(
                  <div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+T.amber+"22",fontSize:12}}>
                    <span>{t.sujet}</span><Badge s={t.statut} l={t.statut}/>
                  </div>
                );})}
              </div>
            )}
          </div>
        )}

        {ong==="paiements"&&(
          <div>
            <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:16}}>Historique des paiements</div>
            {paiements.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucun paiement enregistre</div>}
            {paiements.map(function(p){return(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:T.surface,border:"1px solid "+T.border,borderRadius:10,marginBottom:8}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:T.navy}}>{p.description||"Cotisation"}</div>
                  <div style={{fontSize:11,color:T.muted}}>{p.date_paiement}</div>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <span style={{fontSize:14,fontWeight:700,color:T.navy}}>{Number(p.montant).toFixed(2)} $</span>
                  <Badge s={p.statut} l={p.statut==="paye"?"Paye":p.statut==="en_attente"?"En attente":"Retard"}/>
                </div>
              </div>
            );})}
          </div>
        )}

        {ong==="tickets"&&<TabTickets copro={copro} syndic={syndic} tickets={tickets} setTickets={setTickets} onSubmit={soumettreTicket}/>}

        {ong==="docs"&&(
          <div>
            <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:16}}>Mes documents</div>

            {/* La preuve d assurance et le chauffe-eau se gerent dans MON COMPTE > Mon unite */}

            <div style={{background:T.surface,border:"2px solid "+T.navy+"33",borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:T.navy,marginBottom:8}}>Documents du syndicat</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {syndic&&syndic.declaration_doc?(
                  <Btn sm bg={T.navy} onClick={function(){sb.lienFichier("preuves",syndic.declaration_doc).then(function(url){if(url)window.open(url,"_blank");});}}>Declaration de copropriete (acte complet)</Btn>
                ):(
                  <span style={{fontSize:11,color:T.muted}}>Declaration de copropriete: pas encore deposee par le gestionnaire.</span>
                )}
                {syndic&&syndic.reglements_resume&&(
                  <Btn sm bg={T.blue} onClick={function(){setVoirReglements(!voirReglements);}}>{voirReglements?"Masquer le resume des reglements":"Resume des reglements de l immeuble"}</Btn>
                )}
              </div>
              {voirReglements&&syndic&&syndic.reglements_resume&&(
                <div style={{marginTop:10,background:T.blueL,borderRadius:8,padding:12,fontSize:12,color:"#1C1A17",whiteSpace:"pre-wrap",lineHeight:1.55,maxHeight:400,overflowY:"auto"}}>{syndic.reglements_resume}</div>
              )}
              {docsSyn.length>0&&(
                <div style={{marginTop:12}}>
                  {docsSyn.map(function(d){
                    var estAss=d.type_doc==="assurance"||/assurance/i.test(d.nom||"");
                    return(
                      <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"7px 0",borderTop:"1px solid "+T.border,flexWrap:"wrap"}}>
                        <div style={{flex:1,minWidth:180}}>
                          <div style={{fontSize:12,fontWeight:600,color:T.navy}}>
                            {estAss&&<span style={{background:T.accentL,color:T.accent,borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:800,marginRight:6}}>ASSURANCE</span>}
                            {d.nom}
                          </div>
                          <div style={{fontSize:10,color:T.muted}}>{d.type_doc||"Document"}{d.date_doc?" - "+d.date_doc:""}{estAss&&syndic&&syndic.assurance_syndicat_exp?" - police du syndicat expire le "+syndic.assurance_syndicat_exp:""}</div>
                        </div>
                        {d.url&&<Btn sm bg={T.blue} onClick={function(){
                          if(d.url.indexOf("storage:")===0){sb.lienFichier("preuves",d.url.substring(8)).then(function(u){if(u)window.open(u,"_blank");});}
                          else window.open(d.url,"_blank");
                        }}>Ouvrir</Btn>}
                      </div>
                    );
                  })}
                </div>
              )}
              {docsSyn.length===0&&<div style={{fontSize:10,color:T.muted,marginTop:8}}>Le certificat d assurance de la copropriete et les autres documents partages (PV, assemblees...) apparaitront ici des que le gestionnaire les depose dans Documents (niveau syndicat, non confidentiel).</div>}
            </div>

            {docs.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucun autre document personnel pour l instant</div>}
            {docs.map(function(d){return(
              <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:T.surface,border:"1px solid "+T.border,borderRadius:10,marginBottom:8}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:T.navy}}>{d.nom}</div>
                  <div style={{fontSize:11,color:T.muted}}>{d.type_doc||"Document"}{d.date_doc?" - "+d.date_doc:""}</div>
                </div>
                {d.url&&<Btn sm bg={T.blue} onClick={function(){window.open(d.url,"_blank");}}>Ouvrir</Btn>}
              </div>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}

// Types de travaux du formulaire d autorisation (modele generique Predictek)
var NATURES_TRAVAUX=[
  {k:"entrepreneurs",l:"Travaux qui necessitent un ou des entrepreneurs"},
  {k:"interieur",l:"Travaux d amelioration interieure"},
  {k:"structure",l:"Travaux qui affectent la structure, les murs exterieurs et/ou la toiture"},
  {k:"communes",l:"Travaux qui affectent les parties communes (terrains, arbres, rue privee)"},
  {k:"cheminee",l:"Travaux qui touchent la cheminee"},
  {k:"communes_restreint",l:"Travaux qui affectent les parties communes a usage restreint (balcon, trottoir, stationnement)"},
  {k:"plomberie",l:"Travaux qui touchent la plomberie"},
  {k:"electricite",l:"Travaux qui touchent le circuit electrique"},
  {k:"plafond",l:"Travaux qui touchent le plafond, la ventilation et/ou les murs"},
  {k:"permis",l:"Travaux qui necessitent un permis"}
];

// Impression du formulaire officiel, aux couleurs de l entreprise (logo) et du syndicat
function imprimerDemandeTravaux(t,syndic){
  var d=(t.donnees&&typeof t.donnees==="object")?t.donnees:{};
  var logo=(syndic&&syndic.logo_data)||"";
  if(!logo){try{logo=localStorage.getItem("predictek_logo")||"";}catch(e){}}
  var natures=(d.natures||[]).map(function(k){var n=NATURES_TRAVAUX.find(function(x){return x.k===k;});return n?n.l:k;});
  var lg=function(v){return (v||"").replace(/</g,"&lt;");};
  var ligne=function(lbl,val){return "<tr><td class='l'>"+lbl+"</td><td class='v'>"+lg(val)+"</td></tr>";};
  var statutTxt=t.statut==="resolu"||t.statut==="ferme"?"COMPLETEE":"EN COURS";
  var w=window.open("","_blank");
  if(!w)return;
  w.document.write("<html><head><title>Demande d autorisation de travaux</title><style>"
    +"body{font-family:Georgia,serif;color:#1C1A17;margin:36px;font-size:12px}"
    +".ent{display:flex;align-items:center;gap:14px;border-bottom:3px solid #1B5E3B;padding-bottom:12px;margin-bottom:6px}"
    +".ent img{height:52px}"
    +".ent .t1{font-size:19px;font-weight:bold;color:#13233A}"
    +".ent .t2{font-size:12px;color:#555}"
    +".syn{font-size:13px;font-weight:bold;color:#1B5E3B;margin:8px 0 14px}"
    +"h2{font-size:13px;background:#13233A;color:#fff;padding:6px 10px;border-radius:4px;margin:16px 0 6px}"
    +"table{width:100%;border-collapse:collapse}"
    +"td{border:1px solid #bbb;padding:6px 8px;vertical-align:top}"
    +"td.l{width:38%;background:#F5F3EE;font-weight:bold}"
    +".intro{background:#FEF3E2;border:1px solid #B86020;border-radius:6px;padding:9px 12px;font-size:11px;line-height:1.6}"
    +".eng{border:1px solid #bbb;border-radius:6px;padding:10px 12px;font-size:11px;line-height:1.7;margin-top:6px}"
    +"ul{margin:4px 0;padding-left:20px}li{margin-bottom:3px}"
    +".statut{float:right;font-size:11px;font-weight:bold;padding:3px 12px;border-radius:14px;border:2px solid "+(statutTxt==="COMPLETEE"?"#1B5E3B;color:#1B5E3B":"#B86020;color:#B86020")+"}"
    +"</style></head><body>"
    +"<div class='ent'>"+(logo?"<img src='"+logo+"'/>":"")+"<div><div class='t1'>Predictek</div><div class='t2'>Gestion de copropriete</div></div><div style='flex:1'></div><span class='statut'>"+statutTxt+"</span></div>"
    +"<div class='syn'>Syndicat: "+lg(syndic&&syndic.nom?syndic.nom:"")+(syndic&&syndic.adr?" - "+lg(syndic.adr)+(syndic.ville?", "+lg(syndic.ville):""):"")+"</div>"
    +"<div style='font-size:16px;font-weight:bold;margin-bottom:8px'>DEMANDE D AUTORISATION DE TRAVAUX</div>"
    +"<div class='intro'>Avant de commencer les travaux, l autorisation du conseil d administration est obligatoire. Des travaux realises sans autorisation peuvent etre sanctionnes et la remise en etat des lieux peut etre exigee aux frais du coproprietaire. Les renseignements de ce formulaire demeurent confidentiels; seuls les administrateurs du syndicat y ont acces. Tout changement a la demande initiale doit etre signale aux administrateurs.</div>"
    +"<h2>1. Renseignements sur le coproprietaire</h2><table>"
    +ligne("Nom du coproprietaire requerant",d.nom)
    +ligne("Adresse / unite",d.unite)
    +ligne("Telephone",d.telephone)
    +ligne("Date de la demande",d.dateDemande)
    +ligne("Travaux relies a une urgence?",d.urgence?"OUI":"Non")
    +"</table>"
    +"<h2>2. Renseignements sur les entrepreneurs (si applicable)</h2><table>"
    +ligne("Nom de ou des entrepreneurs",d.entNom)
    +ligne("Numero de licence RBQ",d.entRBQ)
    +ligne("Personne contact",d.entContact)
    +ligne("Telephone",d.entTel)
    +ligne("Courriel",d.entCourriel)
    +ligne("Police d assurance responsabilite civile",d.pieceAssurance?"Fournie (piece jointe au dossier)":"Non fournie")
    +ligne("Devis",d.pieceDevis?"Fourni (piece jointe au dossier)":"Non fourni")
    +"</table>"
    +"<h2>3. Nature des travaux</h2>"
    +(natures.length?"<ul>"+natures.map(function(n){return "<li>"+lg(n)+"</li>";}).join("")+"</ul>":"<div style='color:#777'>Aucune categorie cochee</div>")
    +"<h2>4. Description et calendrier</h2><table>"
    +ligne("Description detaillee (lieux, pieces, materiaux, impact sur le batiment)",d.description)
    +ligne("Impact sur les autres coproprietaires et mesures d attenuation",d.impact)
    +ligne("Date prevue - debut des travaux",d.dateDebut)
    +ligne("Date prevue - fin des travaux",d.dateFin)
    +"</table>"
    +"<h2>5. Engagement du coproprietaire</h2>"
    +"<div class='eng'>Je serai tenu responsable de tout dommage cause par mes entrepreneurs aux parties communes de l immeuble et je verrai a ce que les lieux communs soient laisses propres apres chaque journee de travail. Je m engage a permettre au representant du syndicat d inspecter les travaux realises. Si le syndicat le juge necessaire, je fournirai une expertise independante confirmant que les travaux respectent la declaration de copropriete (notamment pour l insonorisation). Je certifie que mes assurances personnelles couvrent les dommages en cas de sinistre.</div>"
    +"<table style='margin-top:10px'>"+ligne("Signature du coproprietaire (nom en lettres moulees)",d.signature)+ligne("Date",d.dateDemande)+"</table>"
    +(t.reponse?"<h2>Decision du syndicat</h2><div class='eng'>"+lg(t.reponse)+(t.date_reponse?"<br/><b>Date: "+t.date_reponse.substring(0,10)+"</b>":"")+"</div>":"")
    +"<div style='margin-top:18px;font-size:10px;color:#777'>Genere par Predictek - "+new Date().toLocaleDateString("fr-CA")+"</div>"
    +"</body></html>");
  w.document.close();
  setTimeout(function(){w.print();},400);
}

// Formulaire complet de demande d autorisation de travaux (portail coproprietaire)
function FormTravaux(p){
  var copro=p.copro;
  var dEx=(p.ticket&&p.ticket.donnees&&typeof p.ticket.donnees==="object")?p.ticket.donnees:null;
  var s0=useState(dEx?Object.assign({engage:true},dEx):{nom:((copro.prenom||"")+" "+(copro.nom||"")).trim(),unite:copro.unite||"",telephone:copro.telephone||copro.cellulaire||"",dateDemande:new Date().toISOString().substring(0,10),urgence:false,entNom:"",entRBQ:"",entContact:"",entTel:"",entCourriel:"",natures:[],description:"",impact:"",dateDebut:"",dateFin:"",signature:"",engage:false});
  var f=s0[0];var setF=s0[1];
  var s1=useState(null);var fAss=s1[0];var setFAss=s1[1];
  var s2=useState(null);var fDevis=s2[0];var setFDevis=s2[1];
  var s3=useState("");var msg=s3[0];var setMsg=s3[1];
  var s4=useState(false);var envoi=s4[0];var setEnvoi=s4[1];
  function sf(k,v){setF(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  function toggleNature(k){setF(function(o){var n=Object.assign({},o);n.natures=o.natures.indexOf(k)>=0?o.natures.filter(function(x){return x!==k;}):o.natures.concat([k]);return n;});}

  function soumettre(){
    if(!f.description.trim()){setMsg("ECHEC: decrivez les travaux (section Description).");return;}
    if(f.natures.length===0){setMsg("ECHEC: cochez au moins une nature de travaux.");return;}
    if(!f.engage||!f.signature.trim()){setMsg("ECHEC: cochez l engagement et inscrivez votre nom en guise de signature.");return;}
    setEnvoi(true);setMsg("Envoi de la demande en cours...");
    var donnees=Object.assign({},f);
    var etapes=Promise.resolve();
    if(fAss){
      var extA=(fAss.name.match(/\.[a-zA-Z0-9]+$/)||[".pdf"])[0];
      var chA=copro.syndicat_id+"/travaux/"+copro.id+"-assurance-"+Date.now()+extA;
      etapes=etapes.then(function(){return sb.uploadFichier("preuves",chA,fAss).then(function(up){if(up&&up.chemin)donnees.pieceAssurance=chA;});});
    }
    if(fDevis){
      var extD=(fDevis.name.match(/\.[a-zA-Z0-9]+$/)||[".pdf"])[0];
      var chD=copro.syndicat_id+"/travaux/"+copro.id+"-devis-"+Date.now()+extD;
      etapes=etapes.then(function(){return sb.uploadFichier("preuves",chD,fDevis).then(function(up){if(up&&up.chemin)donnees.pieceDevis=chD;});});
    }
    etapes.then(function(){
      var corps={
        coproprietaire_id:copro.id,syndicat_id:copro.syndicat_id,unite:copro.unite,
        sujet:"Demande d autorisation de travaux - unite "+(copro.unite||""),
        description:"Formulaire officiel soumis via le portail. "+f.description.substring(0,300),
        priorite:f.urgence?"urgente":"normale",
        categorie:"travaux",donnees:donnees
      };
      if(p.ticket){
        // modification de la demande existante - consignee a l historique du ticket
        corps.historique=(Array.isArray(p.ticket.historique)?p.ticket.historique:[]).concat([{q:new Date().toISOString(),u:((copro.prenom||"")+" "+(copro.nom||"")).trim()||"Coproprietaire",a:"Demande de travaux modifiee par le coproprietaire"}]);
        return sb.update("tickets",p.ticket.id,corps);
      }
      corps.statut="nouveau";
      return sb.insert("tickets",corps);
    }).then(function(r){
      setEnvoi(false);
      if(r&&r.data&&r.data.id){p.onCree(r.data);}
      else setMsg("ECHEC de l "+(p.ticket?"enregistrement des modifications":"envoi de la demande")+((r&&r.error&&r.error.message)?" ("+r.error.message+")":"")+". Rien n a ete enregistre.");
    }).catch(function(e){setEnvoi(false);setMsg("ECHEC: "+(e&&e.message?e.message:"erreur reseau"));});
  }

  var SEC={background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:12};
  var TIT={fontSize:12,fontWeight:800,color:"#fff",background:T.navy,borderRadius:6,padding:"5px 10px",marginBottom:12,display:"inline-block"};
  var LBL={fontSize:10,color:T.muted,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"};

  return(
    <div style={{marginBottom:16}}>
      <div style={{background:T.amberL,border:"1px solid #B8602055",borderRadius:10,padding:"10px 14px",fontSize:11,color:"#B86020",lineHeight:1.6,marginBottom:12}}>
        <b>Important:</b> l autorisation du conseil d administration est obligatoire AVANT de commencer les travaux.
        Des travaux realises sans autorisation peuvent etre sanctionnes et la remise en etat peut etre exigee a vos frais.
        Vos renseignements demeurent confidentiels (administrateurs seulement).
      </div>

      <div style={SEC}>
        <div style={TIT}>1. Renseignements sur le coproprietaire</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><div style={LBL}>Nom du requerant</div><input value={f.nom} onChange={function(e){sf("nom",e.target.value);}} style={INP}/></div>
          <div><div style={LBL}>Unite / adresse</div><input value={f.unite} onChange={function(e){sf("unite",e.target.value);}} style={INP}/></div>
          <div><div style={LBL}>Telephone</div><input value={f.telephone} onChange={function(e){sf("telephone",e.target.value);}} style={INP}/></div>
          <div><div style={LBL}>Date de la demande</div><input type="date" value={f.dateDemande} onChange={function(e){sf("dateDemande",e.target.value);}} style={INP}/></div>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,marginTop:10,fontSize:12,cursor:"pointer"}}>
          <input type="checkbox" checked={f.urgence} onChange={function(e){sf("urgence",e.target.checked);}}/>
          Ces travaux sont relies a une <b>urgence</b>
        </label>
      </div>

      <div style={SEC}>
        <div style={TIT}>2. Entrepreneurs (si applicable)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><div style={LBL}>Nom de ou des entrepreneurs</div><input value={f.entNom} onChange={function(e){sf("entNom",e.target.value);}} style={INP}/></div>
          <div><div style={LBL}>Licence RBQ (si applicable)</div><input value={f.entRBQ} onChange={function(e){sf("entRBQ",e.target.value);}} style={INP}/></div>
          <div><div style={LBL}>Personne contact</div><input value={f.entContact} onChange={function(e){sf("entContact",e.target.value);}} style={INP}/></div>
          <div><div style={LBL}>Telephone</div><input value={f.entTel} onChange={function(e){sf("entTel",e.target.value);}} style={INP}/></div>
          <div><div style={LBL}>Courriel</div><input value={f.entCourriel} onChange={function(e){sf("entCourriel",e.target.value);}} style={INP}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
          <div>
            <div style={LBL}>Police d assurance resp. civile de l entrepreneur (PDF/photo)</div>
            <input type="file" accept=".pdf,image/*" onChange={function(e){setFAss(e.target.files&&e.target.files[0]?e.target.files[0]:null);}} style={{fontSize:11,fontFamily:"inherit"}}/>
          </div>
          <div>
            <div style={LBL}>Devis (PDF/photo)</div>
            <input type="file" accept=".pdf,image/*" onChange={function(e){setFDevis(e.target.files&&e.target.files[0]?e.target.files[0]:null);}} style={{fontSize:11,fontFamily:"inherit"}}/>
          </div>
        </div>
      </div>

      <div style={SEC}>
        <div style={TIT}>3. Nature des travaux (cochez tout ce qui s applique)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {NATURES_TRAVAUX.map(function(n){return(
            <label key={n.k} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:11,cursor:"pointer",padding:"4px 0"}}>
              <input type="checkbox" checked={f.natures.indexOf(n.k)>=0} onChange={function(){toggleNature(n.k);}} style={{marginTop:2}}/>
              {n.l}
            </label>
          );})}
        </div>
      </div>

      <div style={SEC}>
        <div style={TIT}>4. Description et calendrier</div>
        <div style={{marginBottom:10}}>
          <div style={LBL}>Description detaillee (lieux, pieces, impact sur le batiment, materiaux utilises...)</div>
          <textarea value={f.description} onChange={function(e){sf("description",e.target.value);}} rows={4} style={Object.assign({},INP,{resize:"vertical"})} placeholder="Le plus de details possible. Photos, croquis ou instructions: joignez-les en pieces jointes ci-dessus."/>
        </div>
        <div style={{marginBottom:10}}>
          <div style={LBL}>Impact sur les autres coproprietaires et mesures pour reduire le desagrement</div>
          <textarea value={f.impact} onChange={function(e){sf("impact",e.target.value);}} rows={3} style={Object.assign({},INP,{resize:"vertical"})}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><div style={LBL}>Date prevue - debut des travaux</div><input type="date" value={f.dateDebut} onChange={function(e){sf("dateDebut",e.target.value);}} style={INP}/></div>
          <div><div style={LBL}>Date prevue - fin des travaux</div><input type="date" value={f.dateFin} onChange={function(e){sf("dateFin",e.target.value);}} style={INP}/></div>
        </div>
      </div>

      <div style={SEC}>
        <div style={TIT}>5. Engagement</div>
        <div style={{fontSize:11,color:T.muted,lineHeight:1.7,marginBottom:10}}>
          Je serai tenu responsable de tout dommage cause par mes entrepreneurs aux parties communes et je verrai
          a ce que les lieux communs soient laisses propres apres chaque journee de travail. Je m engage a permettre
          au representant du syndicat d inspecter les travaux. Si le syndicat le juge necessaire, je fournirai une
          expertise independante confirmant le respect de la declaration de copropriete (notamment l insonorisation).
          Je certifie que mes assurances personnelles couvrent les dommages en cas de sinistre.
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,cursor:"pointer",marginBottom:10}}>
          <input type="checkbox" checked={f.engage} onChange={function(e){sf("engage",e.target.checked);}}/>
          <b>J ai lu et j accepte cet engagement</b>
        </label>
        <div style={{maxWidth:340}}>
          <div style={LBL}>Signature (votre nom en lettres moulees)</div>
          <input value={f.signature} onChange={function(e){sf("signature",e.target.value);}} style={INP} placeholder="Ex: JEAN TREMBLAY"/>
        </div>
      </div>

      {msg&&<div style={{background:msg.indexOf("ECHEC")===0?T.redL:T.blueL,borderRadius:8,padding:"9px 13px",fontSize:12,fontWeight:700,color:msg.indexOf("ECHEC")===0?T.red:T.blue,marginBottom:10}}>{msg}</div>}
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={soumettre} dis={envoi}>{envoi?"Envoi en cours...":(p.ticket?"Enregistrer les modifications":"Soumettre ma demande d autorisation")}</Btn>
        <Btn onClick={p.onAnnuler} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} dis={envoi}>Annuler</Btn>
      </div>
    </div>
  );
}

function TabTickets(p){
  var copro=p.copro;var tickets=p.tickets;var setTickets=p.setTickets;
  var s0=useState(false);var showN=s0[0];var setShowN=s0[1];
  var s1=useState("");var sujet=s1[0];var setSujet=s1[1];
  var s2=useState("");var desc=s2[0];var setDesc=s2[1];
  var s3=useState("normale");var prio=s3[0];var setPrio=s3[1];
  var s4=useState(false);var showT=s4[0];var setShowT=s4[1];
  var s5=useState("");var msgT=s5[0];var setMsgT=s5[1];
  var s6=useState(null);var ticketEdit=s6[0];var setTicketEdit=s6[1];
  var s7=useState(null);var editSimpleId=s7[0];var setEditSimpleId=s7[1];

  function soumettre(){
    if(!sujet.trim())return;
    setMsgT("");
    var corps={coproprietaire_id:copro.id,syndicat_id:copro.syndicat_id,unite:copro.unite,sujet:sujet,description:desc,priorite:prio};
    var op;
    if(editSimpleId){
      var tOrig=tickets.find(function(x){return x.id===editSimpleId;})||{};
      corps.historique=(Array.isArray(tOrig.historique)?tOrig.historique:[]).concat([{q:new Date().toISOString(),u:((copro.prenom||"")+" "+(copro.nom||"")).trim()||"Coproprietaire",a:"Demande modifiee par le coproprietaire"}]);
      op=sb.update("tickets",editSimpleId,corps);
    }
    else{corps.statut="nouveau";op=sb.insert("tickets",corps);}
    op.then(function(res){
      if(res&&res.error){setMsgT("ECHEC de l envoi de la demande ("+(res.error.message||"erreur")+"). Rien n a ete enregistre.");return;}
      if(res&&res.data&&res.data.id){
        if(editSimpleId)setTickets(function(prev){return prev.map(function(t){return t.id===editSimpleId?Object.assign({},t,res.data):t;});});
        else setTickets(function(prev){return [res.data].concat(prev);});
        setShowN(false);setSujet("");setDesc("");setPrio("normale");setEditSimpleId(null);
        setMsgT(editSimpleId?"Demande modifiee.":"Demande envoyee au syndicat - suivez son statut ici.");
      }else{
        setMsgT("ECHEC de l envoi de la demande - rien n a ete enregistre. Reessayez ou contactez votre gestionnaire.");
      }
    }).catch(function(e){setMsgT("ECHEC: "+(e&&e.message?e.message:"erreur reseau")+". Rien n a ete enregistre.");});
  }

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:14,fontWeight:700,color:T.navy}}>Mes demandes</div>
        <div style={{display:"flex",gap:8}}>
          <Btn bg={T.navy} onClick={function(){setShowT(true);setShowN(false);setMsgT("");}}>+ Autorisation de travaux</Btn>
          <Btn onClick={function(){setShowN(true);setShowT(false);}}>+ Nouvelle demande</Btn>
        </div>
      </div>
      {msgT&&<div style={{background:msgT.indexOf("ECHEC")===0?T.redL:T.accentL,border:"1px solid "+(msgT.indexOf("ECHEC")===0?T.red:T.accent)+"44",borderRadius:8,padding:"9px 13px",fontSize:12,fontWeight:700,color:msgT.indexOf("ECHEC")===0?T.red:T.accent,marginBottom:12}}>{msgT}</div>}
      {(showT||ticketEdit)&&<FormTravaux copro={copro} ticket={ticketEdit} onAnnuler={function(){setShowT(false);setTicketEdit(null);}} onCree={function(tk){
        if(ticketEdit)setTickets(function(prev){return prev.map(function(t){return t.id===tk.id?Object.assign({},t,tk):t;});});
        else setTickets(function(prev){return [tk].concat(prev);});
        setShowT(false);setTicketEdit(null);
        setMsgT(ticketEdit?"Demande d autorisation de travaux modifiee.":"Demande d autorisation de travaux soumise. Le conseil d administration l etudiera; suivez son statut ici.");
      }}/>}
      {showN&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>{editSimpleId?"Modifier ma demande":"Nouvelle demande"}</div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:5,textTransform:"uppercase"}}>Sujet</div>
            <input value={sujet} onChange={function(e){setSujet(e.target.value);}} style={INP} placeholder="Decrivez brievement votre demande..."/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:5,textTransform:"uppercase"}}>Description detaillee</div>
            <textarea value={desc} onChange={function(e){setDesc(e.target.value);}} style={Object.assign({},INP,{minHeight:80,resize:"vertical"})} placeholder="Details supplementaires, date souhaitee, etc."/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:5,textTransform:"uppercase"}}>Priorite</div>
            <select value={prio} onChange={function(e){setPrio(e.target.value);}} style={Object.assign({},INP,{width:180})}>
              <option value="basse">Basse</option>
              <option value="normale">Normale</option>
              <option value="haute">Haute - urgente</option>
            </select>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={soumettre} dis={!sujet.trim()}>{editSimpleId?"Enregistrer les modifications":"Soumettre"}</Btn>
            <Btn onClick={function(){setShowN(false);setEditSimpleId(null);setSujet("");setDesc("");setPrio("normale");}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
          </div>
        </div>
      )}
      {tickets.length===0&&!showN&&!showT&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucune demande - cliquez "+ Nouvelle demande" ou "+ Autorisation de travaux"</div>}
      {tickets.map(function(t){
        var complete=t.statut==="resolu"||t.statut==="ferme";
        var travaux=t.categorie==="travaux";
        var dateFin=t.date_resolution||t.date_reponse;
        return(
        <div key={t.id} style={{padding:"14px 16px",background:T.surface,border:"1px solid "+(travaux?"#13233A55":T.border),borderRadius:10,marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8,flexWrap:"wrap"}}>
            <div style={{fontSize:12,fontWeight:700,color:T.navy,flex:1,minWidth:200}}>
              {travaux&&<span style={{background:T.navy,color:"#fff",borderRadius:5,padding:"1px 8px",fontSize:9,fontWeight:800,marginRight:7,verticalAlign:"middle"}}>TRAVAUX</span>}
              {t.sujet}
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{background:complete?"#D4EDDA":T.amberL,color:complete?"#155724":"#B86020",borderRadius:20,padding:"2px 12px",fontSize:10,fontWeight:800}}>
                {complete?"COMPLETEE"+(dateFin?" le "+String(dateFin).substring(0,10):""):"EN COURS"}
              </span>
              {!complete&&<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){
                if(travaux){setTicketEdit(t);setShowT(false);setShowN(false);}
                else{setSujet(t.sujet||"");setDesc(t.description||"");setPrio(t.priorite||"normale");setEditSimpleId(t.id);setShowN(true);setShowT(false);setTicketEdit(null);}
                setMsgT("");window.scrollTo(0,0);
              }}>Modifier</Btn>}
              {travaux&&<Btn sm bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){imprimerDemandeTravaux(t,p.syndic);}}>Imprimer</Btn>}
            </div>
          </div>
          {t.description&&<div style={{fontSize:11,color:T.muted}}>{t.description}</div>}
          {t.reponse&&(
            <div style={{background:"#EFF6FF",border:"1px solid #1A56DB33",borderRadius:8,padding:"8px 10px",marginTop:8}}>
              <div style={{fontSize:9,fontWeight:800,color:"#1A56DB",textTransform:"uppercase",marginBottom:2}}>Reponse du syndicat{t.date_reponse?" - "+new Date(t.date_reponse).toLocaleDateString("fr-CA"):""}</div>
              <div style={{fontSize:11,color:"#1C1A17",whiteSpace:"pre-wrap"}}>{t.reponse}</div>
            </div>
          )}
          <div style={{fontSize:10,color:T.muted,marginTop:6}}>Soumis le {t.created_at?new Date(t.created_at).toLocaleDateString("fr-CA"):"-"} - Priorite: {t.priorite}</div>
        </div>
      );})}
    </div>
  );
}

// ===== MODE APERCU GESTION (depannage) =====
// Les employes Predictek (admin / gestionnaire) peuvent ouvrir le portail
// comme n importe quel coproprietaire, SANS code d acces, pour voir
// exactement ce qu il voit et faire du depannage. Un bandeau visible
// indique le mode apercu en tout temps.
function SelecteurApercu(p){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState("");var synId=s1[0];var setSynId=s1[1];
  var s2=useState([]);var copros=s2[0];var setCopros=s2[1];
  var s3=useState("");var coproId=s3[0];var setCoproId=s3[1];
  var s4=useState(false);var voirLogin=s4[0];var setVoirLogin=s4[1];
  var s5=useState("");var err=s5[0];var setErr=s5[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(r){
      if(r&&r.data){setSyndicats(r.data);if(r.data.length>0)setSynId(r.data[0].id);}
    }).catch(function(){setErr("Impossible de charger les syndicats.");});
  },[]);
  useEffect(function(){
    if(!synId)return;
    setCopros([]);setCoproId("");
    sb.select("coproprietaires",{eq:{syndicat_id:synId},order:"unite.asc",limit:1000}).then(function(r){
      if(r&&r.data){setCopros(r.data);if(r.data.length>0)setCoproId(r.data[0].id);}
    }).catch(function(){setErr("Impossible de charger les coproprietaires.");});
  },[synId]);

  if(voirLogin)return(
    <div>
      <div style={{background:"#B86020",color:"#fff",padding:"8px 16px",fontSize:12,fontWeight:700,fontFamily:"Georgia,serif",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>MODE APERCU - Voici l ecran de connexion que voient les coproprietaires.</span>
        <button onClick={function(){setVoirLogin(false);}} style={{background:"#ffffff25",border:"1px solid #ffffff50",borderRadius:6,padding:"4px 12px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Retour</button>
      </div>
      <EcranLogin onLogin={p.onChoisir}/>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",padding:20}}>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:16,padding:32,width:"100%",maxWidth:520}}>
        <div style={{fontSize:16,fontWeight:800,color:T.navy,marginBottom:4}}>Apercu du portail coproprietaire</div>
        <div style={{fontSize:12,color:T.muted,marginBottom:18,lineHeight:1.6}}>
          Mode reserve a l equipe Predictek (depannage). Choisissez un coproprietaire pour voir son portail
          exactement comme lui, sans code d acces. Attention: les actions posees dans l apercu sont REELLES
          (une requete soumise sera enregistree a son nom).
        </div>
        {err&&<div style={{background:T.redL,borderRadius:8,padding:"9px 13px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>Syndicat</div>
          <select value={synId} onChange={function(e){setSynId(e.target.value);}} style={INP}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id}>{s.nom}</option>;})}
          </select>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>Coproprietaire ({copros.length})</div>
          <select value={coproId} onChange={function(e){setCoproId(e.target.value);}} style={INP}>
            {copros.map(function(c){return <option key={c.id} value={c.id}>{"Unite "+(c.unite||"?")+" - "+((c.prenom||"")+" "+(c.nom||"")).trim()}</option>;})}
          </select>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn onClick={function(){
            var c=copros.find(function(x){return x.id===coproId;});
            if(!c){setErr("Choisissez un coproprietaire.");return;}
            p.onChoisir(Object.assign({},c,{_apercu:true}));
          }} dis={!coproId}>Ouvrir son portail</Btn>
          <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setVoirLogin(true);}}>Voir l ecran de connexion</Btn>
        </div>
        {copros.length===0&&synId&&<div style={{fontSize:11,color:T.muted,marginTop:12}}>Aucun coproprietaire dans ce syndicat.</div>}
      </div>
    </div>
  );
}

export default function PortailCopro(p){
  var s0=useState(null);var copro=s0[0];var setCopro=s0[1];
  var estGestion=p&&(p.role==="admin"||p.role==="gestionnaire");
  function handleLogout(){setCopro(null);}
  if(!copro){
    if(estGestion)return <SelecteurApercu onChoisir={setCopro}/>;
    return <EcranLogin onLogin={setCopro}/>;
  }
  return(
    <div>
      {copro._apercu&&(
        <div style={{background:"#B86020",color:"#fff",padding:"8px 16px",fontSize:12,fontWeight:700,fontFamily:"Georgia,serif",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span>MODE APERCU (depannage) - Vous voyez le portail de {((copro.prenom||"")+" "+(copro.nom||"")).trim()} (unite {copro.unite||"?"}). Les actions posees ici sont reelles.</span>
          <button onClick={function(){setCopro(null);}} style={{background:"#ffffff25",border:"1px solid #ffffff50",borderRadius:6,padding:"4px 12px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Changer de coproprietaire</button>
        </div>
      )}
      <Tableau copro={copro} onLogout={handleLogout}/>
    </div>
  );
}
