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

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",opacity:p.dis?0.5:1,fontFamily:"inherit"}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Badge(p){var colors={actif:{bg:T.accentL,c:T.accent},inactif:{bg:T.redL,c:T.red},conge:{bg:T.amberL,c:T.amber},essai:{bg:T.blueL,c:T.blue}};var col=colors[p.s]||colors.actif;return <span style={{background:col.bg,color:col.c,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{p.s}</span>;}
function Sec(p){return <div style={{gridColumn:"1/-1",fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"2px solid "+T.border,paddingBottom:4,marginTop:p.first?0:8}}>{p.l}</div>;}

var DEPTS=["Direction","Administration","Operations","Comptabilite","Terrain","Support"];
var STATUTS=["actif","inactif","conge","essai"];
var EMP_VIDE={prenom:"",nom:"",courriel:"",tel:"",cellulaire:"",adresse:"",naissance:"",poste:"",dept:"Administration",statut:"actif",salaire:"",date_embauche:"",nas:"",reserve_assurance_pct:"4",urg_nom:"",urg_lien:"",urg_tel:"",notes:""};

export default function GestionEmployes(){
  var s0=useState([]);var emps=s0[0];var setEmps=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState(false);var showForm=s2[0];var setShowForm=s2[1];
  var s3=useState(EMP_VIDE);var form=s3[0];var setForm=s3[1];
  var s4=useState("");var search=s4[0];var setSearch=s4[1];
  var s5=useState("");var err=s5[0];var setErr=s5[1];
  var s6=useState("");var ok=s6[0];var setOk=s6[1];
  var s7=useState(false);var enCours=s7[0];var setEnCours=s7[1];

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
    if(form.nas&&!nasValide(form.nas)){setErr("NAS invalide (9 chiffres, verification Luhn).");return;}
    setEnCours(true);setErr("");setOk("");
    var ligne={
      prenom:form.prenom,nom:form.nom,courriel:form.courriel||"",tel:form.tel||"",
      cellulaire:form.cellulaire||"",adresse:form.adresse||"",naissance:form.naissance||null,
      poste:form.poste||"",dept:form.dept||"",statut:form.statut||"actif",
      salaire:parseFloat(form.salaire)||null,date_embauche:form.date_embauche||null,
      reserve_assurance_pct:parseFloat(form.reserve_assurance_pct)||null,
      urg_nom:form.urg_nom||"",urg_lien:form.urg_lien||"",urg_tel:form.urg_tel||"",
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
      setEnCours(false);
      if(r&&r.error){setErr("ECHEC de la sauvegarde: "+(r.error.message||r.error.hint||"erreur inconnue"));return;}
      setOk(form.id?"Employe modifie.":"Employe cree.");
      sb.log("employes",form.id?"modification":"creation","Dossier employe "+form.prenom+" "+form.nom,"","");
      setShowForm(false);setForm(EMP_VIDE);setSel(null);
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

  return(
    <div style={{padding:20,fontFamily:"Georgia,serif",maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Employes Predictek</div>
          <div style={{fontSize:11,color:T.muted}}>{emps.filter(function(e){return e.statut==="actif";}).length} actif(s) sur {emps.length} - dossiers persistes en base, NAS chiffres</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Rechercher..." style={Object.assign({},INP,{width:200})}/>
          <Btn onClick={function(){setShowForm(true);setForm(EMP_VIDE);setSel(null);setErr("");}}>+ Nouvel employe</Btn>
        </div>
      </div>

      {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:12,color:T.red,fontWeight:700}}>{err}</div>}
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
                        <Btn sm onClick={function(ev){ev.stopPropagation();setForm(Object.assign({},EMP_VIDE,e,{nas:"",salaire:e.salaire||"",reserve_assurance_pct:e.reserve_assurance_pct||"4"}));setShowForm(true);setSel(null);setErr("");}}>Modifier</Btn>
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
            <div style={{marginBottom:10}}><Lbl l="Contact"/><div style={{fontSize:12}}>{selE.courriel||"-"}</div><div style={{fontSize:12,color:T.muted}}>Tel: {selE.tel||"-"} | Cell: {selE.cellulaire||"-"}</div><div style={{fontSize:11,color:T.muted}}>{selE.adresse||""}</div></div>
            <div style={{marginBottom:10}}><Lbl l="Emploi"/><div style={{fontSize:12}}>Embauche: {selE.date_embauche||"-"}</div><div style={{fontSize:13,fontWeight:700,color:T.accent}}>{selE.salaire?money(selE.salaire)+" /an":"-"}</div><div style={{fontSize:11,color:T.muted}}>Reserve assurance: {selE.reserve_assurance_pct?selE.reserve_assurance_pct+" %":"-"}</div></div>
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
              <div><Lbl l="NAS (chiffre a la sauvegarde)"/><input type="text" inputMode="numeric" autoComplete="off" value={form.nas} onChange={function(e){sf("nas",fmtNAS(e.target.value));}} style={Object.assign({},INP,form.nas?(nasValide(form.nas)?{border:"2px solid #1B5E3B"}:{border:"2px solid #B83232"}):{})} placeholder="000-000-000" maxLength={11}/>{form.id&&<div style={{fontSize:9,color:T.muted,marginTop:2}}>Laisser vide pour conserver le NAS deja chiffre</div>}</div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Adresse"/><input value={form.adresse} onChange={function(e){sf("adresse",e.target.value);}} style={INP}/></div>
              <Sec l="Coordonnees"/>
              <div><Lbl l="Courriel"/><input value={form.courriel} onChange={function(e){sf("courriel",e.target.value.trim());}} style={Object.assign({},INP,form.courriel&&!courrielValide(form.courriel)?{border:"2px solid #B83232"}:{})}/></div>
              <div><Lbl l="Telephone"/><input value={form.tel} onChange={function(e){sf("tel",fmtTel(e.target.value));}} style={INP} maxLength={12}/></div>
              <div><Lbl l="Cellulaire"/><input value={form.cellulaire} onChange={function(e){sf("cellulaire",fmtTel(e.target.value));}} style={INP} maxLength={12}/></div>
              <Sec l="Emploi et remuneration"/>
              <div><Lbl l="Poste"/><input value={form.poste} onChange={function(e){sf("poste",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Departement"/><select value={form.dept} onChange={function(e){sf("dept",e.target.value);}} style={INP}>{DEPTS.map(function(d){return <option key={d}>{d}</option>;})}</select></div>
              <div><Lbl l="Statut"/><select value={form.statut} onChange={function(e){sf("statut",e.target.value);}} style={INP}>{STATUTS.map(function(st){return <option key={st}>{st}</option>;})}</select></div>
              <div><Lbl l="Date d embauche"/><input type="date" value={form.date_embauche||""} onChange={function(e){sf("date_embauche",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Salaire annuel ($)"/><input type="number" value={form.salaire} onChange={function(e){sf("salaire",e.target.value);}} style={INP}/></div>
              <div><Lbl l="% reserve assurance"/><select value={form.reserve_assurance_pct} onChange={function(e){sf("reserve_assurance_pct",e.target.value);}} style={INP}>{["0","2","4","6","8","10"].map(function(x){return <option key={x} value={x}>{x} %</option>;})}</select></div>
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
