// Assemblees v1.0 - AGA / AGE
// - Creation d une assemblee avec ordre du jour et delai de convocation verifie
// - Convocation imprimable (envoi courriel a venir avec le domaine Resend)
// - FEUILLE DE PRESENCE: presences et procurations par unite, QUORUM CALCULE AUTOMATIQUEMENT
//   (somme des quotes-parts presentes/representees vs quorum extrait de la declaration)
// - VOTES PONDERES par quote-part, resolution par resolution, resultats sauvegardes

import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Bdg(p){return <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap"}}>{p.children}</span>;}

function imprimerHTML(titre, corpsHTML){
  var w=window.open("","_blank","width=900,height=700");
  if(!w)return;
  w.document.write("<html><head><title>"+titre+"</title><style>@font-face{font-family:ChiffresPredictek;src:local('Segoe UI'),local('Arial');unicode-range:U+0030-0039;}body{font-family:ChiffresPredictek,Georgia,serif;color:#1C1A17;margin:36px;font-size:13px}h1{font-size:19px;margin:0 0 2px}h2{font-size:14px;border-bottom:2px solid #13233A;padding-bottom:4px;margin-top:22px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #999;padding:5px 8px;font-size:12px;text-align:left}th{background:#EDEBE4}.muted{color:#666;font-size:11px}.right{text-align:right}pre{white-space:pre-wrap;font-family:Georgia,serif}</style></head><body>"+corpsHTML+"<script>window.print();</script></body></html>");
  w.document.close();
}

var VIDE_A={type:"AGA",date_assemblee:"",heure:"19:00",lieu:"",mode:"presentiel",lien_visio:"",ordre_du_jour:"1. Ouverture et verification du quorum\n2. Adoption de l ordre du jour\n3. Adoption du proces-verbal de la derniere assemblee\n4. Rapport du conseil d administration\n5. Presentation des etats financiers\n6. Adoption du budget et des cotisations\n7. Election des administrateurs\n8. Varia\n9. Levee de l assemblee"};

export default function Assemblees(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var assemblees=s2[0];var setAssemblees=s2[1];
  var s3=useState(false);var showForm=s3[0];var setShowForm=s3[1];
  var s4=useState(VIDE_A);var nf=s4[0];var setNf=s4[1];
  var s5=useState("");var msg=s5[0];var setMsg=s5[1];
  var s6=useState("");var err=s6[0];var setErr=s6[1];
  var s7=useState(null);var ouverte=s7[0];var setOuverte=s7[1];
  var s8=useState([]);var unites=s8[0];var setUnites=s8[1];
  var s9=useState([]);var copros=s9[0];var setCopros=s9[1];
  var s10=useState([]);var presences=s10[0];var setPresences=s10[1];
  var s11=useState([]);var votes=s11[0];var setVotes=s11[1];
  var s12=useState({resolution:"",majorite:"50"});var nv=s12[0];var setNv=s12[1];
  var s13=useState({});var voteEnCours=s13[0];var setVoteEnCours=s13[1];
  var s14=useState("15");var delaiConv=s14[0];var setDelaiConv=s14[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
    sb.selectOne("config_publique",{eq:{cle:"delai_convocation_jours"}}).then(function(r){
      if(r&&r.data&&r.data.valeur)setDelaiConv(r.data.valeur);
    }).catch(function(){});
  },[]);

  function chargerAssemblees(){
    if(!sel)return;
    sb.select("assemblees",{eq:{syndicat_id:sel.id},order:"date_assemblee.desc",limit:50}).then(function(r){
      if(r&&r.data)setAssemblees(r.data);
    }).catch(function(){});
    sb.select("unites",{eq:{syndicat_id:sel.id},order:"no_unite.asc",limit:1000}).then(function(r){if(r&&r.data)setUnites(r.data);}).catch(function(){});
    sb.select("coproprietaires",{eq:{syndicat_id:sel.id},limit:2000}).then(function(r){if(r&&r.data)setCopros(r.data);}).catch(function(){});
  }
  useEffect(function(){chargerAssemblees();setOuverte(null);},[sel&&sel.id]);

  function chargerPresences(a){
    sb.select("assemblees_presences",{eq:{assemblee_id:a.id},limit:2000}).then(function(r){
      if(r&&r.data)setPresences(r.data);
    }).catch(function(){});
    sb.select("assemblees_votes",{eq:{assemblee_id:a.id},order:"created_at.asc",limit:100}).then(function(r){
      if(r&&r.data)setVotes(r.data);
    }).catch(function(){});
  }

  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function propsDe(u){
    return copros.filter(function(c){return c.statut!=="ancien"&&((c.unite_id&&c.unite_id===u.id)||(!c.unite_id&&c.unite===u.no_unite));});
  }

  function joursAvantAssemblee(dateStr){
    if(!dateStr)return null;
    return Math.ceil((new Date(dateStr)-new Date())/86400000);
  }

  function creer(){
    if(!sel||!nf.date_assemblee){setErr("La date de l assemblee est requise.");return;}
    setErr("");setMsg("");
    var row={syndicat_id:sel.id,type:nf.type,date_assemblee:nf.date_assemblee,heure:nf.heure||"",lieu:nf.lieu||"",mode:nf.mode||"presentiel",lien_visio:nf.lien_visio||"",ordre_du_jour:nf.ordre_du_jour||"",statut:"planifiee",quorum_requis:parseInt(sel.quorum_ago)||50};
    sb.insert("assemblees",row).then(function(r){
      if(!r||!r.data||!r.data.id){setErr("ECHEC de la creation: "+((r&&r.error&&r.error.message)||"erreur - verifiez que les tables assemblees existent (SQL fourni)"));return;}
      setMsg("Assemblee "+nf.type+" creee pour le "+nf.date_assemblee+".");
      sb.log("assemblees","creation","Assemblee "+nf.type+" du "+nf.date_assemblee+" creee","",sel.code||"");
      setShowForm(false);setNf(VIDE_A);
      chargerAssemblees();
    });
  }

  function convoquer(a){
    var jrs=joursAvantAssemblee(a.date_assemblee);
    var delai=parseInt(delaiConv)||15;
    var avert=(jrs!==null&&jrs<delai)?"<div style='color:#B83232;font-weight:bold'>ATTENTION: la convocation est envoyee a "+jrs+" jour(s) de l assemblee - le delai recommande est de "+delai+" jours.</div>":"";
    var html="<h1>AVIS DE CONVOCATION - "+(a.type==="AGA"?"ASSEMBLEE GENERALE ANNUELLE":"ASSEMBLEE GENERALE EXTRAORDINAIRE")+"</h1>"
      +"<div class='muted'>"+(sel?sel.nom:"")+"</div>"+avert
      +"<h2>Date, heure et lieu</h2>"
      +"<table><tr><th>Date</th><td>"+a.date_assemblee+"</td></tr>"
      +"<tr><th>Heure</th><td>"+(a.heure||"-")+"</td></tr>"
      +"<tr><th>Lieu</th><td>"+(a.lieu||"-")+(a.mode!=="presentiel"?" ("+a.mode+(a.lien_visio?" - "+a.lien_visio:"")+")":"")+"</td></tr>"
      +"<tr><th>Quorum requis</th><td>"+(a.quorum_requis||50)+" % des voix (selon la declaration de copropriete)</td></tr></table>"
      +"<h2>Ordre du jour</h2><pre>"+(a.ordre_du_jour||"-")+"</pre>"
      +"<h2>Procuration</h2><div>Si vous ne pouvez assister, vous pouvez donner procuration a une personne de votre choix.</div>"
      +"<br/><table><tr><td style='width:50%'>Je, ______________________________, coproprietaire de l unite ________, donne procuration a ______________________________ pour me representer et voter en mon nom a l assemblee du "+a.date_assemblee+".</td><td>Signature: ______________________<br/><br/>Date: ______________________</td></tr></table>"
      +"<br/><div>Le conseil d administration<br/><span class='muted'>"+(sel?sel.nom:"")+"</span></div>";
    imprimerHTML("Convocation "+a.type+" "+a.date_assemblee,html);
    sb.update("assemblees",a.id,{statut:"convoquee",convocation_envoyee_le:new Date().toISOString()}).then(function(){
      sb.log("assemblees","convocation","Convocation "+a.type+" du "+a.date_assemblee+" generee","",sel.code||"");
      chargerAssemblees();
    });
  }

  // Presence / procuration d une unite (premier copro actif de l unite comme reference)
  function presenceDe(u){
    return presences.find(function(px){return px.unite_id===u.id;});
  }
  function basculerPresence(a,u,champ,valeur){
    var pr=presenceDe(u);
    var copro=propsDe(u)[0];
    if(pr){
      var maj={};maj[champ]=valeur;
      if(champ==="present"&&valeur)maj.procuration_a="";
      sb.update("assemblees_presences",pr.id,maj).then(function(){chargerPresences(a);});
    }else{
      var row={assemblee_id:a.id,syndicat_id:sel.id,unite_id:u.id,coproprietaire_id:copro?copro.id:null,fraction:parseFloat(u.fraction)||0,present:champ==="present"?valeur:false,procuration_a:champ==="procuration_a"?valeur:""};
      sb.insert("assemblees_presences",row).then(function(){chargerPresences(a);});
    }
  }

  // QUORUM: somme des quotes-parts presentes OU representees (procuration)
  function calculQuorum(a){
    var fracPresente=0;var nbPres=0;var nbProc=0;
    unites.forEach(function(u){
      var pr=presenceDe(u);
      if(!pr)return;
      if(pr.present){fracPresente+=parseFloat(u.fraction)||0;nbPres++;}
      else if(pr.procuration_a){fracPresente+=parseFloat(u.fraction)||0;nbProc++;}
    });
    var requis=parseInt(a.quorum_requis)||50;
    return {frac:Math.round(fracPresente*1000)/1000,requis:requis,atteint:fracPresente>=requis,nbPres:nbPres,nbProc:nbProc};
  }

  // VOTE PONDERE: pour chaque unite presente/representee -> pour / contre / abstention
  function lancerVote(a){
    if(!nv.resolution){setErr("Ecrivez la resolution a voter.");return;}
    setErr("");
    var q=calculQuorum(a);
    if(!q.atteint){setErr("QUORUM NON ATTEINT ("+q.frac+" % sur "+q.requis+" % requis) - le vote ne peut pas etre tenu.");return;}
    setVoteEnCours({resolution:nv.resolution,majorite:nv.majorite,choix:{}});
  }
  function choixVote(u,val){
    setVoteEnCours(function(pr){
      var n=Object.assign({},pr);n.choix=Object.assign({},pr.choix);n.choix[u.id]=val;return n;
    });
  }
  function terminerVote(a){
    var pour=0,contre=0,abst=0;
    unites.forEach(function(u){
      var pr=presenceDe(u);
      if(!pr||(!pr.present&&!pr.procuration_a))return;
      var f=parseFloat(u.fraction)||0;
      var c=voteEnCours.choix[u.id]||"abstention";
      if(c==="pour")pour+=f;else if(c==="contre")contre+=f;else abst+=f;
    });
    var exprimes=pour+contre;
    var seuil=parseFloat(voteEnCours.majorite)||50;
    // Majorite calculee sur les voix EXPRIMEES (abstentions exclues) - regle usuelle; 75/90 = voix de TOUS les copros
    var adopte=seuil>50?(pour>= (seuil/100)*100):(exprimes>0&&pour>exprimes*0.5);
    if(seuil>50)adopte=pour>=seuil; // majorites renforcees: % des voix de tous les coproprietaires
    var row={assemblee_id:a.id,syndicat_id:sel.id,resolution:voteEnCours.resolution,majorite_requise:seuil,pour:Math.round(pour*1000)/1000,contre:Math.round(contre*1000)/1000,abstention:Math.round(abst*1000)/1000,adopte:adopte};
    sb.insert("assemblees_votes",row).then(function(r){
      if(!r||!r.data||!r.data.id){setErr("ECHEC de l enregistrement du vote: "+((r&&r.error&&r.error.message)||"erreur"));return;}
      sb.log("assemblees","vote","Vote: "+voteEnCours.resolution.substring(0,80)+" -> "+(adopte?"ADOPTE":"REJETE")+" (pour "+row.pour+" %, contre "+row.contre+" %)","",sel.code||"");
      setVoteEnCours({});setNv({resolution:"",majorite:"50"});
      chargerPresences(a);
    });
  }

  function feuillePresence(a){
    var q=calculQuorum(a);
    var lignes=unites.map(function(u){
      var pr=presenceDe(u);
      var props=propsDe(u).map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(" et ");
      return "<tr><td>"+u.no_unite+"</td><td>"+props+"</td><td class='right'>"+(parseFloat(u.fraction)||0).toFixed(3)+" %</td><td>"+(pr&&pr.present?"PRESENT":"")+"</td><td>"+(pr&&pr.procuration_a?pr.procuration_a:"")+"</td><td></td></tr>";
    }).join("");
    var html="<h1>FEUILLE DE PRESENCE - "+a.type+" du "+a.date_assemblee+"</h1>"
      +"<div class='muted'>"+(sel?sel.nom:"")+" | Quorum requis: "+q.requis+" % | Quorum constate: "+q.frac+" % ("+(q.atteint?"ATTEINT":"NON ATTEINT")+")</div>"
      +"<table><tr><th>Unite</th><th>Proprietaire(s)</th><th class='right'>Quote-part</th><th>Present</th><th>Procuration a</th><th>Signature</th></tr>"+lignes+"</table>";
    imprimerHTML("Feuille de presence "+a.date_assemblee,html);
  }

  var STATUTS_LBL={planifiee:{l:"Planifiee",bg:T.blueL,c:T.blue},convoquee:{l:"Convoquee",bg:T.amberL,c:T.amber},tenue:{l:"Tenue",bg:T.accentL,c:T.accent},annulee:{l:"Annulee",bg:T.redL,c:T.red}};

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat.</div>;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Assemblees (AGA / AGE)</div>
        <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <span style={{fontSize:11,color:"#9fb0c6"}}>Quorum de la declaration: {sel&&sel.quorum_ago?sel.quorum_ago+" %":"non renseigne (50 % par defaut)"}</span>
        <div style={{marginLeft:"auto"}}>
          <Btn onClick={function(){setNf(VIDE_A);setShowForm(true);}}>+ Nouvelle assemblee</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        {showForm&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>Nouvelle assemblee</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
              <div><Lbl l="Type"/><select value={nf.type} onChange={function(e){setN("type",e.target.value);}} style={INP}><option value="AGA">AGA (annuelle)</option><option value="AGE">AGE (extraordinaire)</option></select></div>
              <div><Lbl l="Date"/><input type="date" value={nf.date_assemblee} onChange={function(e){setN("date_assemblee",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Heure"/><input type="time" value={nf.heure} onChange={function(e){setN("heure",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Mode"/><select value={nf.mode} onChange={function(e){setN("mode",e.target.value);}} style={INP}><option value="presentiel">Presentiel</option><option value="visio">Visioconference</option><option value="mixte">Mixte</option></select></div>
              <div style={{gridColumn:"span 2"}}><Lbl l="Lieu"/><input value={nf.lieu} onChange={function(e){setN("lieu",e.target.value);}} style={INP}/></div>
              <div style={{gridColumn:"span 2"}}><Lbl l="Lien visio (si applicable)"/><input value={nf.lien_visio} onChange={function(e){setN("lien_visio",e.target.value);}} style={INP}/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Ordre du jour"/><textarea value={nf.ordre_du_jour} onChange={function(e){setN("ordre_du_jour",e.target.value);}} style={Object.assign({},INP,{height:150,resize:"vertical"})}/></div>
            </div>
            {nf.date_assemblee&&joursAvantAssemblee(nf.date_assemblee)!==null&&joursAvantAssemblee(nf.date_assemblee)<(parseInt(delaiConv)||15)&&(
              <div style={{background:T.amberL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.amber,fontWeight:700,marginBottom:10}}>
                ATTENTION: l assemblee est dans {joursAvantAssemblee(nf.date_assemblee)} jour(s) - le delai de convocation recommande est de {delaiConv} jours.
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={creer}>Creer l assemblee</Btn>
              <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowForm(false);}}>Annuler</Btn>
            </div>
          </div>
        )}

        {assemblees.map(function(a){
          var st=STATUTS_LBL[a.statut]||STATUTS_LBL.planifiee;
          var estOuverte=ouverte===a.id;
          var q=estOuverte?calculQuorum(a):null;
          return(
            <div key={a.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{width:52,height:36,borderRadius:8,background:a.type==="AGA"?T.navy:T.purple,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:"#fff"}}>{a.type}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:T.navy}}>{a.date_assemblee} a {a.heure||"-"}</div>
                    <div style={{fontSize:11,color:T.muted}}>{a.lieu||"-"} | Quorum requis: {a.quorum_requis||50} %{a.convocation_envoyee_le?" | Convoquee le "+new Date(a.convocation_envoyee_le).toLocaleDateString("fr-CA"):""}</div>
                  </div>
                  <Bdg bg={st.bg} c={st.c}>{st.l}</Bdg>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <Btn sm bg={T.amber} onClick={function(){convoquer(a);}}>Convocation (imprimer)</Btn>
                  <Btn sm bg={T.blue} onClick={function(){if(estOuverte){setOuverte(null);}else{setOuverte(a.id);chargerPresences(a);}}}>{estOuverte?"Fermer":"Presences et votes"}</Btn>
                  {a.statut!=="tenue"&&<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){sb.update("assemblees",a.id,{statut:"tenue"}).then(function(){chargerAssemblees();});}}>Marquer tenue</Btn>}
                </div>
              </div>

              {estOuverte&&(
                <div style={{marginTop:14,paddingTop:14,borderTop:"2px solid "+T.blue+"44"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.navy}}>Feuille de presence</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{background:q.atteint?T.accentL:T.redL,border:"2px solid "+(q.atteint?T.accent:T.red),borderRadius:10,padding:"6px 16px",fontSize:13,fontWeight:800,color:q.atteint?T.accent:T.red}}>
                        QUORUM {q.atteint?"ATTEINT":"NON ATTEINT"}: {q.frac} % / {q.requis} % requis
                      </div>
                      <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){feuillePresence(a);}}>Imprimer</Btn>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:T.muted,marginBottom:8}}>{q.nbPres} present(s), {q.nbProc} procuration(s) sur {unites.length} unite(s)</div>
                  <div style={{maxHeight:300,overflowY:"auto",border:"1px solid "+T.border,borderRadius:8}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead><tr style={{background:T.alt,position:"sticky",top:0}}>
                        {["Unite","Proprietaire(s)","Quote-part","Present","Procuration a"].map(function(h){return <th key={h} style={{padding:"6px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}
                      </tr></thead>
                      <tbody>
                        {unites.map(function(u){
                          var pr=presenceDe(u);
                          return(
                            <tr key={u.id} style={{borderTop:"1px solid "+T.border,background:pr&&(pr.present||pr.procuration_a)?T.accentL:"#fff"}}>
                              <td style={{padding:"5px 10px",fontWeight:800}}>{u.no_unite}</td>
                              <td style={{padding:"5px 10px",fontSize:11}}>{propsDe(u).map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(" et ")||"-"}</td>
                              <td style={{padding:"5px 10px"}}>{(parseFloat(u.fraction)||0).toFixed(3)} %</td>
                              <td style={{padding:"5px 10px"}}>
                                <button onClick={function(){basculerPresence(a,u,"present",!(pr&&pr.present));}} style={{background:pr&&pr.present?T.accent:T.alt,color:pr&&pr.present?"#fff":T.muted,border:"none",borderRadius:14,padding:"3px 14px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{pr&&pr.present?"PRESENT":"Absent"}</button>
                              </td>
                              <td style={{padding:"5px 10px"}}>
                                <input value={pr&&pr.procuration_a?pr.procuration_a:""} disabled={!!(pr&&pr.present)} onChange={function(e){basculerPresence(a,u,"procuration_a",e.target.value);}} placeholder={pr&&pr.present?"(present)":"Nom du mandataire"} style={Object.assign({},INP,{padding:"3px 8px",fontSize:11})}/>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{marginTop:16}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:8}}>Votes ponderes par quote-part</div>
                    {votes.map(function(v,i){return(
                      <div key={v.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:v.adopte?T.accentL:T.redL,borderRadius:8,padding:"8px 12px",marginBottom:6,flexWrap:"wrap",gap:6}}>
                        <div style={{fontSize:12,fontWeight:600,color:T.navy,flex:1,minWidth:200}}>{v.resolution}</div>
                        <div style={{fontSize:11,fontWeight:800,color:v.adopte?T.accent:T.red}}>{v.adopte?"ADOPTEE":"REJETEE"} - pour {Number(v.pour).toFixed(1)} % | contre {Number(v.contre).toFixed(1)} % | abst. {Number(v.abstention).toFixed(1)} % (seuil {v.majorite_requise} %)</div>
                      </div>
                    );})}
                    {!voteEnCours.resolution?(
                      <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap",background:T.blueL,borderRadius:10,padding:12}}>
                        <div style={{flex:1,minWidth:240}}><Lbl l="Resolution a voter"/><input value={nv.resolution} onChange={function(e){setNv(Object.assign({},nv,{resolution:e.target.value}));}} style={INP}/></div>
                        <div style={{width:230}}><Lbl l="Majorite requise"/><select value={nv.majorite} onChange={function(e){setNv(Object.assign({},nv,{majorite:e.target.value}));}} style={INP}>
                          <option value="50">Majorite simple (voix exprimees)</option>
                          <option value="75">75 % des voix des coproprietaires</option>
                          <option value="90">90 % des voix des coproprietaires</option>
                        </select></div>
                        <Btn bg={T.blue} onClick={function(){lancerVote(a);}}>Ouvrir le vote</Btn>
                      </div>
                    ):(
                      <div style={{background:T.purpleL,border:"2px solid "+T.purple+"55",borderRadius:10,padding:12}}>
                        <div style={{fontSize:12,fontWeight:800,color:T.purple,marginBottom:8}}>VOTE EN COURS: {voteEnCours.resolution}</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:6,maxHeight:260,overflowY:"auto",marginBottom:10}}>
                          {unites.filter(function(u){var pr=presenceDe(u);return pr&&(pr.present||pr.procuration_a);}).map(function(u){
                            var c=voteEnCours.choix[u.id]||"";
                            return(
                              <div key={u.id} style={{display:"flex",alignItems:"center",gap:6,background:"#fff",borderRadius:8,padding:"5px 8px"}}>
                                <span style={{fontSize:11,fontWeight:800,width:40}}>{u.no_unite}</span>
                                {["pour","contre","abstention"].map(function(opt){
                                  var actif=c===opt;
                                  var coul=opt==="pour"?T.accent:opt==="contre"?T.red:T.muted;
                                  return <button key={opt} onClick={function(){choixVote(u,opt);}} style={{background:actif?coul:T.alt,color:actif?"#fff":T.muted,border:"none",borderRadius:12,padding:"3px 9px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{opt==="abstention"?"abst.":opt}</button>;
                                })}
                              </div>
                            );
                          })}
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <Btn bg={T.purple} onClick={function(){terminerVote(a);}}>Clore le vote et enregistrer</Btn>
                          <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setVoteEnCours({});}}>Annuler</Btn>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {assemblees.length===0&&!showForm&&<div style={{textAlign:"center",padding:40,color:T.muted,fontSize:12}}>Aucune assemblee - cliquez "+ Nouvelle assemblee".</div>}
      </div>
    </div>
  );
}
