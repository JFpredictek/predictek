// GestionEmployes v3.0 - Dossiers employes COMPLETS, persistes dans Supabase (table employes)
// NAS chiffre via /api/nas (jamais stocke en clair), contact d urgence, % reserve assurance, cellulaire.
import { useState, useEffect } from "react";
import sb from "./lib/supabase";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EFFA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
var money=function(n){return Math.abs(n||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

function fmtNAS(v){var d=(v||"").replace(/\D/g,"").slice(0,9);return d.replace(/(\d{3})(?=\d)/g,"$1-");}
function nasValide(v){var d=(v||"").replace(/\D/g,"");if(d.length!==9)return false;var s=0;for(var i=0;i<9;i++){var x=parseInt(d[i],10);if(i%2===1){x*=2;if(x>9)x-=9;}s+=x;}return s%10===0;}
function fmtTel(v){var d=(v||"").replace(/\D/g,"").slice(0,10);if(d.length>6)return d.slice(0,3)+"-"+d.slice(3,6)+"-"+d.slice(6);if(d.length>3)return d.slice(0,3)+"-"+d.slice(3);return d;}
function courrielValide(v){return !v||/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);}
function fmtCP(v){var x=(v||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6);return x.length>3?x.slice(0,3)+" "+x.slice(3):x;}

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",opacity:p.dis?0.5:1,fontFamily:"inherit"}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Badge(p){var colors={actif:{bg:T.accentL,c:T.accent},inactif:{bg:T.redL,c:T.red},conge:{bg:T.amberL,c:T.amber},essai:{bg:T.blueL,c:T.blue}};var col=colors[p.s]||colors.actif;return <span style={{background:col.bg,color:col.c,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{p.s}</span>;}
function Sec(p){return <div style={{gridColumn:"1/-1",fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"2px solid "+T.border,paddingBottom:4,marginTop:p.first?0:8}}>{p.l}</div>;}

var DEPTS=["Direction","Administration","Operations","Comptabilite","Terrain","Support"];
// Postes standardises - serviront a comptabiliser les salaires PAR POSTE dans la comptabilite Predictek
var POSTES=["Gestionnaire de copropriete","Adjoint(e) administratif(ve)","Comptable / technicien comptable","Concierge / entretien menager","Surintendant","Homme/femme de maintenance","Direction","Support technique","Autre"];
var STATUTS=["actif","inactif","conge","essai"];
var EMP_VIDE={prenom:"",nom:"",courriel:"",tel:"",cellulaire:"",no_civique:"",rue:"",ville:"",province:"QC",code_postal:"",naissance:"",poste:"",dept:"Administration",statut:"actif",salaire:"",date_embauche:"",nas:"",reserve_vacances_pct:"4",urg_nom:"",urg_lien:"",urg_tel:"",permis_requis:false,permis_expiration:"",notes:""};

export default function GestionEmployes(){
  var s0=useState([]);var emps=s0[0];var setEmps=s0[1];
  var sMS=useState(false);var voirMasse=sMS[0];var setVoirMasse=sMS[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState(false);var showForm=s2[0];var setShowForm=s2[1];
  var s3=useState(EMP_VIDE);var form=s3[0];var setForm=s3[1];
  var s4=useState("");var search=s4[0];var setSearch=s4[1];
  var s5=useState("");var err=s5[0];var setErr=s5[1];
  var s6=useState("");var ok=s6[0];var setOk=s6[1];
  var s7=useState(false);var enCours=s7[0];var setEnCours=s7[1];
  var s8r=useState([]);var ruesSugg=s8r[0];var setRuesSugg=s8r[1];
  var s9f=useState(null);var cvFile=s9f[0];var setCvFile=s9f[1];
  var s10f=useState(null);var permisFile=s10f[0];var setPermisFile=s10f[1];

  function charger(){
    sb.select("employes",{order:"nom.asc"}).then(function(r){
      if(r&&r.data)setEmps(r.data);
      if(r&&r.error)setErr("Chargement impossible: "+(r.error.message||""));
    }).catch(function(e){setErr("Erreur: "+(e&&e.message?e.message:""));});
  }
  useEffect(function(){charger();},[]);

  function sf(k,v){setForm(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  var filtered=emps.filter(function(e){var q=search.toLowerCase();return !q||((e.prenom||"")+" "+(e.nom||"")).toLowerCase().includes(q)||(e.courriel||"").toLowerCase().includes(q)||(e.dept||"").toLowerCase().includes(q);});

  function sauvegarder(){
    if(enCours)return;
    if(!form.prenom||!form.nom){setErr("Prenom et nom requis.");return;}
    if(form.courriel&&!courrielValide(form.courriel)){setErr("Courriel invalide.");return;}
    var avertNas=(form.nas&&!nasValide(form.nas))?"ATTENTION: le NAS saisi semble invalide (verification Luhn) - il a ete enregistre quand meme, verifiez-le. ":"";
    setEnCours(true);setErr("");setOk("");
    var ligne={
      prenom:form.prenom,nom:form.nom,courriel:form.courriel||"",tel:form.tel||"",
      cellulaire:form.cellulaire||"",
      adresse:((form.no_civique||"")+" "+(form.rue||"")).trim(),
      no_civique:form.no_civique||"",rue:form.rue||"",ville:form.ville||"",province:form.province||"QC",code_postal:form.code_postal||"",
      naissance:form.naissance||null,
      poste:form.poste||"",dept:form.dept||"",statut:form.statut||"actif",
      salaire:parseFloat(form.salaire)||null,date_embauche:form.date_embauche||null,
      reserve_vacances_pct:parseFloat(form.reserve_vacances_pct)||null,
      urg_nom:form.urg_nom||"",urg_lien:form.urg_lien||"",urg_tel:form.urg_tel||"",
      permis_requis:!!form.permis_requis,permis_expiration:form.permis_expiration||null,
      notes:form.notes||""
    };
    var apres=function(){
      var nasDigits=(form.nas||"").replace(/\D/g,"");
      // Chiffrement du NAS cote serveur, jamais stocke en clair
      var pNas=nasDigits.length===9
        ? fetch("/api/nas",{method:"POST",headers:sb.apiHeaders(),body:JSON.stringify({action:"encrypt",nas:nasDigits})})
            .then(function(r){return r.json();}).then(function(d){return d&&d.encrypted?d.encrypted:null;}).catch(function(){return null;})
        : Promise.resolve(undefined);
      return pNas;
    };
    apres().then(function(nasChiffre){
      if(nasChiffre)ligne.nas_chiffre=nasChiffre;
      if(nasChiffre===null){setErr("ATTENTION: le chiffrement du NAS a echoue - fiche sauvegardee SANS le NAS. Reessayez plus tard.");}
      var op=form.id?sb.update("employes",form.id,ligne):sb.insert("employes",ligne);
      return op;
    }).then(function(r){
      if(r&&r.error){setEnCours(false);setErr("ECHEC de la sauvegarde: "+(r.error.message||r.error.hint||"erreur inconnue"));return null;}
      var empId=(r&&r.data&&r.data.id)||form.id;
      if(!empId){setEnCours(false);setErr("ECHEC: identifiant introuvable apres la sauvegarde.");return null;}
      // Pieces jointes: CV et permis de conduire au coffre
      var etapes=Promise.resolve();var maj={};
      if(cvFile){
        etapes=etapes.then(function(){
          var ext=(cvFile.name.match(/\.[a-zA-Z0-9]+$/)||[".pdf"])[0];
          return sb.uploadFichier("preuves","employes/"+empId+"/cv"+ext,cvFile).then(function(rU){
            if(rU.error)throw new Error("CV: "+rU.error.message);
            maj.cv_doc=rU.chemin;
          });
        });
      }
      if(permisFile){
        etapes=etapes.then(function(){
          var ext=(permisFile.name.match(/\.[a-zA-Z0-9]+$/)||[".pdf"])[0];
          return sb.uploadFichier("preuves","employes/"+empId+"/permis"+ext,permisFile).then(function(rU){
            if(rU.error)throw new Error("Permis: "+rU.error.message);
            maj.permis_doc=rU.chemin;
          });
        });
      }
      return etapes.then(function(){
        if(Object.keys(maj).length>0)return sb.update("employes",empId,maj);
      }).then(function(){return true;});
    }).then(function(okFin){
      if(okFin===null||okFin===undefined&&err)return;
      setEnCours(false);
      setOk(avertNas+(form.id?"Employe modifie.":"Employe cree."));
      var diffsE=[];
      if(form.id){
        var origE=emps.find(function(x){return x.id===form.id;})||{};
        Object.keys(ligne).forEach(function(k){
          if(k==="nas_chiffre")return;
          var av=origE[k];var ap=ligne[k];
          if(String(av==null?"":av)!==String(ap==null?"":ap))diffsE.push(k+": \""+(av==null?"":av)+"\" -> \""+(ap==null?"":ap)+"\"");
        });
      }
      sb.log("employes",form.id?"modification":"creation","Dossier employe "+form.prenom+" "+form.nom+(form.id?" ("+diffsE.length+" champ(s) modifie(s))":""),diffsE.join(" | ").substring(0,1800),"");
      setShowForm(false);setForm(EMP_VIDE);setSel(null);setCvFile(null);setPermisFile(null);
      charger();
      setTimeout(function(){setOk("");},4000);
    }).catch(function(e){setEnCours(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  function desactiver(e){
    sb.update("employes",e.id,{statut:e.statut==="actif"?"inactif":"actif"}).then(function(r){
      if(r&&r.error){setErr("Echec: "+(r.error.message||""));return;}
      sb.log("employes","modification","Employe "+e.prenom+" "+e.nom+" -> "+(e.statut==="actif"?"inactif":"actif"),"","");
      charger();
    });
  }

  var selE=sel?emps.find(function(x){return x.id===sel;}):null;

  // ----- Masse salariale par poste (comptabilite Predictek) -----
  function masseParPoste(){
    var actifs=emps.filter(function(e){return e.statut==="actif";});
    var m={};
    actifs.forEach(function(e){
      var poste=e.poste||"(poste non defini)";
      if(!m[poste])m[poste]={poste:poste,nb:0,salaires:0,vacances:0};
      var sal=parseFloat(e.salaire)||0;
      m[poste].nb++;
      m[poste].salaires+=sal;
      m[poste].vacances+=sal*((parseFloat(e.reserve_vacances_pct)||0)/100);
    });
    return Object.keys(m).map(function(k){return m[k];}).sort(function(a,b){return b.salaires-a.salaires;});
  }

  function imprimerMasse(){
    var lignes=masseParPoste();
    var totS=lignes.reduce(function(a,l){return a+l.salaires;},0);
    var totV=lignes.reduce(function(a,l){return a+l.vacances;},0);
    var w=window.open("","_blank","width=900,height=700");
    if(!w)return;
    var h="<h1>Masse salariale par poste - Predictek</h1><div class='muted'>Employes actifs seulement - genere le "+new Date().toLocaleDateString("fr-CA")+"</div>";
    h+="<table><tr><th>Poste</th><th class='right'>Employes</th><th class='right'>Salaires annuels</th><th class='right'>Reserve vacances</th><th class='right'>Cout annuel estime</th><th class='right'>Mensuel</th></tr>";
    lignes.forEach(function(l){h+="<tr><td>"+l.poste+"</td><td class='right'>"+l.nb+"</td><td class='right'>"+money(l.salaires)+"</td><td class='right'>"+money(l.vacances)+"</td><td class='right'>"+money(l.salaires+l.vacances)+"</td><td class='right'>"+money((l.salaires+l.vacances)/12)+"</td></tr>";});
    h+="<tr class='tot'><td>TOTAL</td><td class='right'>"+lignes.reduce(function(a,l){return a+l.nb;},0)+"</td><td class='right'>"+money(totS)+"</td><td class='right'>"+money(totV)+"</td><td class='right'>"+money(totS+totV)+"</td><td class='right'>"+money((totS+totV)/12)+"</td></tr></table>";
    h+="<div class='muted' style='margin-top:14px'>Cout annuel estime = salaires + reserve de vacances. Les charges patronales (RRQ, RQAP, AE, FSS, CNESST) s ajoutent selon les taux en vigueur.</div>";
    w.document.write("<html><head><title>Masse salariale par poste</title><style>@font-face{font-family:ChiffresPredictek;src:local('Segoe UI'),local('Arial');unicode-range:U+0030-0039;}body{font-family:ChiffresPredictek,Georgia,serif;color:#1C1A17;margin:36px;font-size:13px}h1{font-size:19px;margin:0 0 2px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #999;padding:5px 8px;font-size:12px;text-align:left}th{background:#EDEBE4}.tot{font-weight:bold;background:#E8F2EC}.muted{color:#666;font-size:11px}.right{text-align:right}</style></head><body>"+h+"<script>window.print();</script></body></html>");
    w.document.close();
  }

  return(
    <div style={{padding:20,fontFamily:"Georgia,serif",maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Employes Predictek</div>
          <div style={{fontSize:11,color:T.muted}}>{emps.filter(function(e){return e.statut==="actif";}).length} actif(s) sur {emps.length} - dossiers persistes en base, NAS chiffres</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Rechercher..." style={Object.assign({},INP,{width:200})}/>
          <Btn bg={voirMasse?T.navy:T.alt} tc={voirMasse?"#fff":T.navy} bdr={"1px solid "+T.border} onClick={function(){setVoirMasse(!voirMasse);}}>Masse salariale par poste</Btn>
          <Btn onClick={function(){setShowForm(true);setForm(EMP_VIDE);setSel(null);setErr("");}}>+ Nouvel employe</Btn>
        </div>
      </div>

      {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:12,color:T.red,fontWeight:700}}>{err}</div>}
      {voirMasse&&(function(){
        var lignes=masseParPoste();
        var totS=lignes.reduce(function(a,l){return a+l.salaires;},0);
        var totV=lignes.reduce(function(a,l){return a+l.vacances;},0);
        return(
          <div style={{background:T.surface,border:"2px solid "+T.navy+"33",borderRadius:12,padding:16,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:T.navy}}>Masse salariale par poste (employes actifs)</div>
                <div style={{fontSize:11,color:T.muted}}>Salaires + reserve de vacances = cout annuel estime. Ventile par poste pour les depenses Predictek.</div>
              </div>
              <Btn sm onClick={imprimerMasse} dis={lignes.length===0}>Imprimer</Btn>
            </div>
            {lignes.length===0?(
              <div style={{fontSize:12,color:T.muted,padding:10}}>Aucun employe actif avec salaire.</div>
            ):(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:T.alt}}>{["Poste","Employes","Salaires annuels","Reserve vacances","Cout annuel estime","Mensuel"].map(function(h,ix){return <th key={h} style={{padding:"6px 10px",textAlign:ix===0?"left":"right",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}</tr></thead>
                <tbody>
                  {lignes.map(function(l){return(
                    <tr key={l.poste} style={{borderTop:"1px solid "+T.border}}>
                      <td style={{padding:"6px 10px",fontWeight:700,color:T.navy}}>{l.poste}</td>
                      <td style={{padding:"6px 10px",textAlign:"right"}}>{l.nb}</td>
                      <td style={{padding:"6px 10px",textAlign:"right"}}>{money(l.salaires)}</td>
                      <td style={{padding:"6px 10px",textAlign:"right"}}>{money(l.vacances)}</td>
                      <td style={{padding:"6px 10px",textAlign:"right",fontWeight:700}}>{money(l.salaires+l.vacances)}</td>
                      <td style={{padding:"6px 10px",textAlign:"right",color:T.accent,fontWeight:700}}>{money((l.salaires+l.vacances)/12)}</td>
                    </tr>
                  );})}
                  <tr style={{borderTop:"2px solid "+T.navy,background:T.alt}}>
                    <td style={{padding:"6px 10px",fontWeight:800,color:T.navy}}>TOTAL</td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800}}>{lignes.reduce(function(a,l){return a+l.nb;},0)}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800}}>{money(totS)}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800}}>{money(totV)}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800}}>{money(totS+totV)}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800,color:T.accent}}>{money((totS+totV)/12)}</td>
                  </tr>
                </tbody>
              </table>
            )}
            <div style={{fontSize:10,color:T.muted,marginTop:8}}>Les charges patronales (RRQ, RQAP, AE, FSS, CNESST) s ajoutent selon les taux en vigueur.</div>
          </div>
        );
      })()}
      {ok&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:12,color:T.accent,fontWeight:700}}>{ok}</div>}

      <div style={{display:"grid",gridTemplateColumns:selE?"1fr 340px":"1fr",gap:16}}>
        <div>
          {emps.length===0?(
            <div style={{background:T.alt,border:"1px solid "+T.border,borderRadius:10,padding:40,textAlign:"center",color:T.muted}}>
              <div style={{fontSize:14,fontWeight:600,color:T.navy,marginBottom:6}}>Aucun employe</div>
              <div style={{fontSize:12,marginBottom:16}}>Ajoutez votre premier employe - le dossier sera conserve en base de donnees.</div>
              <Btn onClick={function(){setShowForm(true);setForm(EMP_VIDE);}}>+ Ajouter un employe</Btn>
            </div>
          ):(
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:T.alt}}>{["Employe","Poste / Departement","Cellulaire","Salaire","Statut",""].map(function(h){return <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}</tr></thead>
                <tbody>{filtered.map(function(e){return(
                  <tr key={e.id} onClick={function(){setSel(sel===e.id?null:e.id);}} style={{borderTop:"1px solid "+T.border,cursor:"pointer",background:sel===e.id?T.accentL:"#fff"}}>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:34,height:34,borderRadius:"50%",background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>{(e.prenom||" ")[0]}{(e.nom||" ")[0]}</div>
                        <div><div style={{fontWeight:600,fontSize:13,color:T.text}}>{e.prenom} {e.nom}</div><div style={{fontSize:10,color:T.muted}}>{e.courriel}</div></div>
                      </div>
                    </td>
                    <td style={{padding:"10px 12px"}}><div style={{fontSize:12,fontWeight:500}}>{e.poste||"-"}</div><div style={{fontSize:10,color:T.muted}}>{e.dept||""}</div></td>
                    <td style={{padding:"10px 12px",fontSize:12}}>{e.cellulaire||e.tel||"-"}</td>
                    <td style={{padding:"10px 12px",fontSize:12}}>{e.salaire?money(e.salaire)+" /an":"-"}</td>
                    <td style={{padding:"10px 12px"}}><Badge s={e.statut}/></td>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",gap:4}}>
                        <Btn sm onClick={function(ev){ev.stopPropagation();setForm(Object.assign({},EMP_VIDE,e,{nas:"",salaire:e.salaire||"",reserve_vacances_pct:e.reserve_vacances_pct||"4",permis_expiration:e.permis_expiration||""}));setCvFile(null);setPermisFile(null);setShowForm(true);setSel(null);setErr("");}}>Modifier</Btn>
                        <Btn sm bg={e.statut==="actif"?T.redL:T.accentL} tc={e.statut==="actif"?T.red:T.accent} onClick={function(ev){ev.stopPropagation();desactiver(e);}}>{e.statut==="actif"?"Desactiver":"Reactiver"}</Btn>
                      </div>
                    </td>
                  </tr>
                );})}</tbody>
              </table>
            </div>
          )}
        </div>

        {selE&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16,height:"fit-content"}}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:20,margin:"0 auto 8px"}}>{(selE.prenom||" ")[0]}{(selE.nom||" ")[0]}</div>
              <div style={{fontWeight:700,fontSize:15,color:T.navy}}>{selE.prenom} {selE.nom}</div>
              <div style={{fontSize:11,color:T.muted,marginBottom:4}}>{selE.poste||"-"} - {selE.dept||"-"}</div>
              <Badge s={selE.statut}/>
            </div>
            <div style={{marginBottom:10}}><Lbl l="Contact"/><div style={{fontSize:12}}>{selE.courriel||"-"}</div><div style={{fontSize:12,color:T.muted}}>Tel: {selE.tel||"-"} | Cell: {selE.cellulaire||"-"}</div><div style={{fontSize:11,color:T.muted}}>{(selE.adresse||"")+(selE.ville?", "+selE.ville:"")+(selE.code_postal?" "+selE.code_postal:"")}</div></div>
            <div style={{marginBottom:10}}><Lbl l="Emploi"/><div style={{fontSize:12}}>Embauche: {selE.date_embauche||"-"}</div><div style={{fontSize:13,fontWeight:700,color:T.accent}}>{selE.salaire?money(selE.salaire)+" /an":"-"}</div><div style={{fontSize:11,color:T.muted}}>Reserve vacances: {selE.reserve_vacances_pct?selE.reserve_vacances_pct+" %":"-"}</div></div>
            <div style={{marginBottom:10}}><Lbl l="Documents"/>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {selE.cv_doc&&<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){sb.lienFichier("preuves",selE.cv_doc).then(function(u){if(u)window.open(u,"_blank");});}}>CV</Btn>}
                {selE.permis_doc&&<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){sb.lienFichier("preuves",selE.permis_doc).then(function(u){if(u)window.open(u,"_blank");});}}>Permis de conduire</Btn>}
                {!selE.cv_doc&&!selE.permis_doc&&<span style={{fontSize:11,color:T.muted}}>-</span>}
              </div>
              {selE.permis_requis&&(function(){
                var exp=selE.permis_expiration?new Date(selE.permis_expiration):null;
                var ok=exp&&exp>new Date();
                return <div style={{marginTop:5,fontSize:11,fontWeight:700,color:ok?T.accent:T.red}}>{ok?"Permis valide jusqu au "+selE.permis_expiration:"PERMIS A VALIDER (vehicule de compagnie) - "+(selE.permis_expiration?"expire le "+selE.permis_expiration:"date d expiration manquante")}</div>;
              })()}
            </div>
            <div style={{marginBottom:10}}><Lbl l="NAS"/><div style={{fontSize:12,color:selE.nas_chiffre?T.accent:T.muted,fontWeight:600}}>{selE.nas_chiffre?"Enregistre (chiffre)":"Non fourni"}</div></div>
            <div style={{marginBottom:10}}><Lbl l="Urgence"/>{selE.urg_nom?(<div style={{fontSize:12}}>{selE.urg_nom} ({selE.urg_lien||"-"})<div style={{color:T.muted}}>{selE.urg_tel||""}</div></div>):(<div style={{fontSize:12,color:T.muted}}>-</div>)}</div>
            {selE.notes&&<div style={{background:T.alt,borderRadius:6,padding:"6px 10px",fontSize:11,color:T.muted}}>{selE.notes}</div>}
          </div>
        )}
      </div>

      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
          <div style={{background:T.surface,borderRadius:14,padding:24,width:"min(640px,94vw)",maxHeight:"88vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <b style={{fontSize:14,color:T.navy}}>{form.id?"Modifier le dossier employe":"Nouveau dossier employe"}</b>
              <button onClick={function(){setShowForm(false);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.muted}}>x</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Sec l="Identite" first/>
              <div><Lbl l="Prenom *"/><input value={form.prenom} onChange={function(e){sf("prenom",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Nom *"/><input value={form.nom} onChange={function(e){sf("nom",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Date de naissance"/><input type="date" value={form.naissance||""} onChange={function(e){sf("naissance",e.target.value);}} style={INP}/></div>
              <div><Lbl l="NAS (chiffre a la sauvegarde)"/><input type="text" inputMode="numeric" autoComplete="off" value={form.nas} onChange={function(e){sf("nas",fmtNAS(e.target.value));}} style={Object.assign({},INP,form.nas?(nasValide(form.nas)?{border:"2px solid #1B5E3B"}:{border:"2px solid #B83232"}):{})} maxLength={11}/>{form.id&&<div style={{fontSize:9,color:T.muted,marginTop:2}}>Laisser vide pour conserver le NAS deja chiffre</div>}</div>
              <div><Lbl l="No civique"/><input value={form.no_civique||""} onChange={function(e){sf("no_civique",e.target.value.replace(/[^0-9A-Za-z-]/g,""));}} style={INP}/></div>
              <div><Lbl l="Code postal (propose rue et ville)"/><input value={form.code_postal||""} onChange={function(e){var cp=fmtCP(e.target.value);sf("code_postal",cp);var six=cp.replace(" ","");
                if(six.length===6){
                  // Code postal COMPLET: geocoder.ca donne la rue et la ville exactes
                  fetch("https://geocoder.ca/?postal="+six+"&json=1").then(function(r){return r.ok?r.json():null;}).then(function(d){
                    if(d&&d.standard){
                      if(d.standard.staddress)setRuesSugg([d.standard.staddress]);
                      if(d.standard.staddress&&!form.rue)sf("rue",d.standard.staddress);
                      if(d.standard.city)sf("ville",d.standard.city);
                      if(d.standard.prov)sf("province",d.standard.prov);
                    }
                  }).catch(function(){});
                } else if(six.length>=3){
                  fetch("https://api.zippopotam.us/ca/"+six.substring(0,3)).then(function(r){return r.ok?r.json():null;}).then(function(d){if(d&&d.places&&d.places[0]){if(!form.ville)sf("ville",d.places[0]["place name"]);sf("province",d.places[0]["state abbreviation"]||"QC");}}).catch(function(){});
                }}} style={INP} placeholder="J2B 4W4" maxLength={7}/></div>
              <div><Lbl l="Rue (proposee selon le code postal)"/><input list="ruesSuggListe" value={form.rue||""} onChange={function(e){sf("rue",e.target.value);}} style={INP}/><datalist id="ruesSuggListe">{ruesSugg.map(function(rr){return <option key={rr} value={rr}/>;})}</datalist></div>
              <div><Lbl l="Ville"/><input value={form.ville||""} onChange={function(e){sf("ville",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Province"/><select value={form.province||"QC"} onChange={function(e){sf("province",e.target.value);}} style={INP}><option>QC</option><option>ON</option><option>NB</option><option>NS</option><option>AB</option><option>BC</option><option>MB</option><option>SK</option><option>PE</option><option>NL</option></select></div>
              <Sec l="Coordonnees"/>
              <div><Lbl l="Courriel"/><input value={form.courriel} onChange={function(e){sf("courriel",e.target.value.trim());}} style={Object.assign({},INP,form.courriel&&!courrielValide(form.courriel)?{border:"2px solid #B83232"}:{})}/></div>
              <div><Lbl l="Telephone"/><input value={form.tel} onChange={function(e){sf("tel",fmtTel(e.target.value));}} style={INP} maxLength={12}/></div>
              <div><Lbl l="Cellulaire"/><input value={form.cellulaire} onChange={function(e){sf("cellulaire",fmtTel(e.target.value));}} style={INP} maxLength={12}/></div>
              <Sec l="Emploi et remuneration"/>
              <div><Lbl l="Poste (comptabilise par poste dans les depenses)"/><select value={form.poste||""} onChange={function(e){sf("poste",e.target.value);}} style={INP}><option value="">Choisir un poste...</option>{POSTES.map(function(po){return <option key={po} value={po}>{po}</option>;})}</select></div>
              <div><Lbl l="Departement"/><select value={form.dept} onChange={function(e){sf("dept",e.target.value);}} style={INP}>{DEPTS.map(function(d){return <option key={d}>{d}</option>;})}</select></div>
              <div><Lbl l="Statut"/><select value={form.statut} onChange={function(e){sf("statut",e.target.value);}} style={INP}>{STATUTS.map(function(st){return <option key={st}>{st}</option>;})}</select></div>
              <div><Lbl l="Date d embauche"/><input type="date" value={form.date_embauche||""} onChange={function(e){sf("date_embauche",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Salaire annuel ($)"/><input type="number" value={form.salaire} onChange={function(e){sf("salaire",e.target.value);}} style={INP}/></div>
              <div><Lbl l="% reserve pour vacances"/><select value={form.reserve_vacances_pct} onChange={function(e){sf("reserve_vacances_pct",e.target.value);}} style={INP}>{["0","2","4","6","8","10","12"].map(function(x){return <option key={x} value={x}>{x} %</option>;})}</select></div>
              <Sec l="Documents et permis"/>
              <div><Lbl l="CV (piece jointe)"/><input type="file" accept=".pdf,.doc,.docx,image/*" onChange={function(e){setCvFile(e.target.files&&e.target.files[0]?e.target.files[0]:null);}} style={{fontSize:11,fontFamily:"inherit"}}/>{cvFile&&<div style={{fontSize:10,color:T.accent}}>{cvFile.name}</div>}</div>
              <div><Lbl l="Conduit un vehicule de compagnie?"/><button onClick={function(){sf("permis_requis",!form.permis_requis);}} style={{background:form.permis_requis?T.accentL:T.alt,border:"2px solid "+(form.permis_requis?T.accent:T.border),borderRadius:20,padding:"6px 16px",fontSize:11,fontWeight:800,color:form.permis_requis?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit"}}>{form.permis_requis?"OUI - permis obligatoire":"NON"}</button></div>
              <div><Lbl l="Permis de conduire (piece jointe)"/><input type="file" accept=".pdf,image/*" onChange={function(e){setPermisFile(e.target.files&&e.target.files[0]?e.target.files[0]:null);}} style={{fontSize:11,fontFamily:"inherit"}}/>{permisFile&&<div style={{fontSize:10,color:T.accent}}>{permisFile.name}</div>}</div>
              <div><Lbl l="Expiration du permis (validation ANNUELLE)"/><input type="date" value={form.permis_expiration||""} onChange={function(e){sf("permis_expiration",e.target.value);}} style={INP}/></div>
              <Sec l="Contact en cas d urgence"/>
              <div><Lbl l="Nom du contact"/><input value={form.urg_nom} onChange={function(e){sf("urg_nom",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Lien (conjoint, parent...)"/><input value={form.urg_lien} onChange={function(e){sf("urg_lien",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Telephone du contact"/><input value={form.urg_tel} onChange={function(e){sf("urg_tel",fmtTel(e.target.value));}} style={INP} maxLength={12}/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Notes"/><textarea value={form.notes} onChange={function(e){sf("notes",e.target.value);}} style={Object.assign({},INP,{height:60,resize:"vertical"})}/></div>
            </div>
            {err&&<div style={{background:T.redL,borderRadius:8,padding:"8px 12px",marginTop:10,fontSize:11,color:T.red,fontWeight:700}}>{err}</div>}
            <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}>
              <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowForm(false);}}>Annuler</Btn>
              <Btn onClick={sauvegarder} dis={enCours||!form.prenom||!form.nom}>{enCours?"Sauvegarde...":"Sauvegarder"}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
