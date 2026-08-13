// Predictek - REQUETES DES COPROPRIETAIRES (cote gestion)
// Les coproprietaires soumettent leurs demandes dans le portail (table tickets).
// Ce module permet au gestionnaire / CA de les traiter: statuts, priorites,
// reponse ecrite (visible dans le portail du coproprietaire), conversion en bon de travail.
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var STATUTS=[
  {id:"nouveau",l:"NOUVEAU",c:"#B83232",bg:"#FDECEA"},
  {id:"en_cours",l:"EN COURS",c:"#B86020",bg:"#FEF3E2"},
  {id:"resolu",l:"RESOLU",c:"#1B5E3B",bg:"#E8F2EC"},
  {id:"ferme",l:"FERME",c:"#7C7568",bg:"#EDEBE4"}
];
var PRIORITES={urgente:{l:"URGENTE",c:"#B83232",bg:"#FDECEA"},haute:{l:"HAUTE",c:"#B86020",bg:"#FEF3E2"},normale:{l:"Normale",c:"#1A56DB",bg:"#EFF6FF"},basse:{l:"Basse",c:"#7C7568",bg:"#EDEBE4"}};
function stInfo(s){return STATUTS.find(function(x){return x.id===s;})||STATUTS[0];}
function prioInfo(pr){return PRIORITES[pr]||PRIORITES.normale;}
function fmtDate(iso){if(!iso)return "-";try{return new Date(iso).toLocaleString("fr-CA",{dateStyle:"short",timeStyle:"short"});}catch(e){return String(iso).substring(0,10);}}

export default function RequetesCopros(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var tickets=s2[0];var setTickets=s2[1];
  var s3=useState([]);var copros=s3[0];var setCopros=s3[1];
  var s4=useState("actifs");var filtre=s4[0];var setFiltre=s4[1];
  var s5=useState(null);var detail=s5[0];var setDetail=s5[1];
  var s6=useState("");var reponse=s6[0];var setReponse=s6[1];
  var s7=useState("");var msg=s7[0];var setMsg=s7[1];
  var s8=useState("");var err=s8[0];var setErr=s8[1];
  var s9=useState(false);var saving=s9[0];var setSaving=s9[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(r){
      if(r&&r.data&&r.data.length>0){setSyndicats(r.data);setSel(r.data[0]);}
    }).catch(function(){});
  },[]);

  function charger(){
    if(!sel)return;
    sb.select("tickets",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:500}).then(function(r){
      if(r&&r.data)setTickets(r.data);
      if(r&&r.error)setErr("Chargement impossible: "+(r.error.message||""));
    }).catch(function(){});
    sb.select("coproprietaires",{eq:{syndicat_id:sel.id},limit:2000}).then(function(r){
      if(r&&r.data)setCopros(r.data);
    }).catch(function(){});
  }
  useEffect(function(){setDetail(null);charger();},[sel&&sel.id]);

  function coproDe(t){
    return copros.find(function(c){return c.id===t.coproprietaire_id;})||null;
  }

  function majTicket(t,changes,logTxt){
    setSaving(true);setErr("");
    sb.update("tickets",t.id,changes).then(function(r){
      setSaving(false);
      if(r&&r.error){setErr("ECHEC de la mise a jour: "+(r.error.message||""));return;}
      sb.log("requetes","modification",logTxt,"",sel.code||"");
      setMsg("Requete mise a jour.");
      setTimeout(function(){setMsg("");},4000);
      charger();
      setDetail(function(pr){return pr&&pr.id===t.id?Object.assign({},pr,changes):pr;});
    }).catch(function(e){setSaving(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  function changerStatut(t,st){
    var ch={statut:st};
    if(st==="resolu"||st==="ferme")ch.date_resolution=new Date().toISOString();
    majTicket(t,ch,"Requete \""+(t.sujet||"").substring(0,60)+"\" (unite "+(t.unite||"")+"): statut -> "+st);
  }
  function changerPriorite(t,pr){
    majTicket(t,{priorite:pr},"Requete \""+(t.sujet||"").substring(0,60)+"\": priorite -> "+pr);
  }
  function envoyerReponse(t){
    if(!reponse.trim()){setErr("Ecrivez une reponse avant d envoyer.");return;}
    var ch={reponse:reponse.trim(),date_reponse:new Date().toISOString()};
    if(t.statut==="nouveau")ch.statut="en_cours";
    majTicket(t,ch,"Reponse envoyee a la requete \""+(t.sujet||"").substring(0,60)+"\" (unite "+(t.unite||"")+")");
    setReponse("");
  }

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat - creez d abord un syndicat via Configuration.</div>;
  if(!sel)return null;

  var nbParStatut={};STATUTS.forEach(function(s){nbParStatut[s.id]=tickets.filter(function(t){return (t.statut||"nouveau")===s.id;}).length;});
  var listes=tickets.filter(function(t){
    var st=t.statut||"nouveau";
    if(filtre==="actifs")return st==="nouveau"||st==="en_cours";
    if(filtre==="tous")return true;
    return st===filtre;
  });

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Requetes des coproprietaires</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Demandes soumises dans le portail - reponses visibles par le coproprietaire</div>
        </div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {[{id:"actifs",l:"A traiter ("+(nbParStatut.nouveau+nbParStatut.en_cours)+")"}].concat(STATUTS.map(function(s){return {id:s.id,l:s.l+" ("+nbParStatut[s.id]+")"};})).concat([{id:"tous",l:"Tous ("+tickets.length+")"}]).map(function(f){
            var actif=filtre===f.id;
            return <button key={f.id} onClick={function(){setFiltre(f.id);}} style={{background:actif?T.navy:T.surface,border:"1px solid "+(actif?T.navy:T.border),borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:700,color:actif?"#fff":T.muted,cursor:"pointer",fontFamily:"inherit"}}>{f.l}</button>;
          })}
        </div>

        {detail&&(function(){
          var t=detail;var st=stInfo(t.statut||"nouveau");var pr=prioInfo(t.priorite);var c=coproDe(t);
          return(
            <div style={{background:T.surface,border:"2px solid "+st.c+"55",borderRadius:12,padding:20,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:10}}>
                <div style={{flex:1,minWidth:250}}>
                  <div style={{display:"flex",gap:6,marginBottom:6}}>
                    <span style={{background:st.bg,color:st.c,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800}}>{st.l}</span>
                    <span style={{background:pr.bg,color:pr.c,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800}}>{pr.l}</span>
                  </div>
                  <div style={{fontSize:15,fontWeight:800,color:T.navy}}>{t.sujet}</div>
                  <div style={{fontSize:11,color:T.muted}}>Unite {t.unite||"-"}{c?" - "+((c.prenom||"")+" "+(c.nom||"")).trim():""}{c&&c.courriel?" - "+c.courriel:""}{c&&c.telephone?" - "+c.telephone:""}</div>
                  <div style={{fontSize:10,color:T.muted}}>Soumise le {fmtDate(t.created_at)}{t.date_resolution?" - resolue le "+fmtDate(t.date_resolution):""}</div>
                </div>
                <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setDetail(null);setReponse("");}}>Fermer</Btn>
              </div>
              {t.description&&<div style={{background:T.alt,borderRadius:8,padding:12,fontSize:12,color:T.text,marginBottom:12,whiteSpace:"pre-wrap"}}>{t.description}</div>}

              {t.reponse&&(
                <div style={{background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:8,padding:12,marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:800,color:T.blue,textTransform:"uppercase",marginBottom:4}}>Reponse du syndicat{t.date_reponse?" - "+fmtDate(t.date_reponse):""}</div>
                  <div style={{fontSize:12,color:T.text,whiteSpace:"pre-wrap"}}>{t.reponse}</div>
                </div>
              )}

              <div style={{marginBottom:12}}>
                <Lbl l={t.reponse?"Modifier / completer la reponse (visible dans le portail du coproprietaire)":"Repondre (visible dans le portail du coproprietaire)"}/>
                <textarea value={reponse} onChange={function(e){setReponse(e.target.value);}} style={Object.assign({},INP,{minHeight:70,resize:"vertical"})} placeholder="Votre reponse au coproprietaire..."/>
                <div style={{marginTop:8}}><Btn onClick={function(){envoyerReponse(t);}} dis={saving||!reponse.trim()}>{saving?"Envoi...":"Enregistrer la reponse"}</Btn></div>
              </div>

              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase"}}>Statut:</span>
                {STATUTS.filter(function(s){return s.id!==(t.statut||"nouveau");}).map(function(s){return <Btn key={s.id} sm bg={s.bg} tc={s.c} bdr={"1px solid "+s.c+"44"} onClick={function(){changerStatut(t,s.id);}} dis={saving}>{s.l}</Btn>;})}
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase"}}>Priorite:</span>
                {Object.keys(PRIORITES).filter(function(k){return k!==(t.priorite||"normale");}).map(function(k){return <Btn key={k} sm bg={PRIORITES[k].bg} tc={PRIORITES[k].c} bdr={"1px solid "+PRIORITES[k].c+"44"} onClick={function(){changerPriorite(t,k);}} dis={saving}>{PRIORITES[k].l}</Btn>;})}
              </div>
            </div>
          );
        })()}

        {listes.length===0&&(
          <div style={{background:T.surface,border:"1px dashed "+T.border,borderRadius:12,padding:30,textAlign:"center",color:T.muted,fontSize:13}}>
            Aucune requete {filtre==="actifs"?"a traiter":""} pour {sel.nom}.<br/>
            <span style={{fontSize:11}}>Les coproprietaires soumettent leurs demandes depuis leur portail (onglet Demandes).</span>
          </div>
        )}

        {listes.map(function(t){
          var st=stInfo(t.statut||"nouveau");var pr=prioInfo(t.priorite);var c=coproDe(t);
          return(
            <div key={t.id} onClick={function(){setDetail(t);setReponse("");window.scrollTo(0,0);}} style={{background:T.surface,border:"1px solid "+T.border,borderLeft:"4px solid "+st.c,borderRadius:10,padding:"12px 16px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <span style={{background:st.bg,color:st.c,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800,flexShrink:0}}>{st.l}</span>
              <span style={{background:pr.bg,color:pr.c,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800,flexShrink:0}}>{pr.l}</span>
              <div style={{flex:1,minWidth:220}}>
                <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{t.sujet}</div>
                <div style={{fontSize:11,color:T.muted}}>Unite {t.unite||"-"}{c?" - "+((c.prenom||"")+" "+(c.nom||"")).trim():""} - {fmtDate(t.created_at)}</div>
              </div>
              <div style={{fontSize:10,color:t.reponse?T.accent:T.muted,fontWeight:t.reponse?700:400,flexShrink:0}}>{t.reponse?"Reponse envoyee":"Sans reponse"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
