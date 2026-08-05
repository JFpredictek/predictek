// Gestion PAR UNITE - l unite est l entite centrale:
// 1-2 coproprietaires (50/50), locataire, contact d urgence, chauffe-eau, assurance.

import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Bdg(p){return <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap"}}>{p.children}</span>;}

function joursAvant(d){if(!d)return null;return Math.ceil((new Date(d)-new Date())/86400000);}

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
  function propsDe(u){
    return toutePersonneDe(u).filter(function(c){return c.statut!=="ancien";});
  }
  function anciensDe(u){
    return toutePersonneDe(u).filter(function(c){return c.statut==="ancien";});
  }

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
      // recharger les personnes
      sb.select("coproprietaires",{eq:{syndicat_id:sel.id},limit:2000}).then(function(res){if(res&&res.data)setCopros(res.data);}).catch(function(){});
      setMsgVente("Vente enregistree: a partir du "+vf.date_vente+", les cotisations et cotisations speciales sont au nom du nouveau proprietaire. L historique de l unite est conserve.");
      setVenteEnCours(false);setVenteId(null);
    }).catch(function(e){setMsgVente("Erreur: "+(e.message||"inconnue"));setVenteEnCours(false);});
  }

  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function editer(u){
    setEditId(u.id);
    setNf({fraction:u.fraction!=null?String(u.fraction):"",cotisation_mensuelle:u.cotisation_mensuelle!=null?String(u.cotisation_mensuelle):"",
      chauffe_eau:u.chauffe_eau||"",assurance_police:u.assurance_police||"",assurance_exp:u.assurance_exp||"",ass_cie:u.ass_cie||"",
      locataire:!!u.locataire,nom_locataire:u.nom_locataire||"",tel_locataire:u.tel_locataire||"",courriel_locataire:u.courriel_locataire||"",
      urg_nom:u.urg_nom||"",urg_lien:u.urg_lien||"",urg_tel:u.urg_tel||"",
      stationnement:u.stationnement||"",rangement:u.rangement||"",notes:u.notes||""});
  }

  function sauvegarder(){
    var row={fraction:parseFloat(nf.fraction)||0,cotisation_mensuelle:parseFloat(nf.cotisation_mensuelle)||0,
      chauffe_eau:nf.chauffe_eau||"",assurance_police:nf.assurance_police||"",assurance_exp:nf.assurance_exp||null,ass_cie:nf.ass_cie||"",
      locataire:!!nf.locataire,nom_locataire:nf.nom_locataire||"",tel_locataire:nf.tel_locataire||"",courriel_locataire:nf.courriel_locataire||"",
      urg_nom:nf.urg_nom||"",urg_lien:nf.urg_lien||"",urg_tel:nf.urg_tel||"",
      stationnement:nf.stationnement||"",rangement:nf.rangement||"",notes:nf.notes||""};
    sb.update("unites",editId,row).then(function(){
      setUnites(function(prev){return prev.map(function(u){return u.id===editId?Object.assign({},u,row):u;});});
      sb.log("unites","modification","Unite modifiee","",sel?sel.code||"":"");
      setEditId(null);
    }).catch(function(){});
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
          return(
            <div key={u.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:280}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                    <div style={{width:46,height:36,borderRadius:8,background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:"#fff"}}>{u.no_unite}</div>
                    <Bdg bg={T.blueL} c={T.blue}>{(parseFloat(u.fraction)||0).toFixed(3)} %</Bdg>
                    {Number(u.cotisation_mensuelle)>0&&<Bdg>{Number(u.cotisation_mensuelle).toFixed(2)} $/mois</Bdg>}
                    {u.locataire&&<Bdg bg={T.amberL} c={T.amber}>LOUE{u.nom_locataire?": "+u.nom_locataire:""}</Bdg>}
                    {u.assurance_exp&&(jrs<0
                      ?<Bdg bg={T.redL} c={T.red}>Assurance EXPIREE</Bdg>
                      :jrs<=90?<Bdg bg={T.amberL} c={T.amber}>Assurance expire dans {jrs} j</Bdg>
                      :<Bdg>Assurance OK jusqu au {u.assurance_exp}</Bdg>)}
                  </div>
                  <div style={{fontSize:12,color:T.navy,marginBottom:2}}>
                    <b>Proprietaire(s):</b> {props.length===0?"-":props.map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim()+(props.length>1?" ("+(c.part_pourcent||50)+" %)":"");}).join(" et ")}
                  </div>
                  {props.map(function(c,i){return (c.courriel||c.telephone)?<div key={i} style={{fontSize:10,color:T.muted}}>{((c.prenom||"")+" "+(c.nom||"")).trim()}: {c.courriel||"-"} {c.telephone?" | "+c.telephone:""}</div>:null;})}
                  <div style={{fontSize:11,color:T.muted,marginTop:4}}>
                    {u.urg_nom?"Urgence: "+u.urg_nom+(u.urg_lien?" ("+u.urg_lien+")":"")+(u.urg_tel?" "+u.urg_tel:""):"Urgence: -"}
                    {u.chauffe_eau?" | Chauffe-eau: "+u.chauffe_eau:""}
                    {u.stationnement?" | Stat.: "+u.stationnement:""}
                    {u.rangement?" | Rang.: "+u.rangement:""}
                  </div>
                  {u.notes?<div style={{fontSize:10,color:T.muted,marginTop:2,fontStyle:"italic"}}>{u.notes}</div>:null}
                  {anciensDe(u).length>0&&(
                    <div style={{fontSize:10,color:T.muted,marginTop:4}}>
                      Anciens proprietaires: {anciensDe(u).map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim()+" ("+(c.date_debut||"?")+" au "+(c.date_fin||"?")+")";}).join(", ")}
                    </div>
                  )}
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <Btn sm onClick={function(){enEdition?setEditId(null):editer(u);}}>{enEdition?"Fermer":"Modifier"}</Btn>
                  <Btn sm bg={T.amber} onClick={function(){venteId===u.id?setVenteId(null):ouvrirVente(u);}}>{venteId===u.id?"Annuler la vente":"Vente de l unite"}</Btn>
                </div>
              </div>

              {venteId===u.id&&(
                <div style={{marginTop:14,paddingTop:14,borderTop:"2px solid "+T.amber}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.amber,marginBottom:4}}>Vente de l unite {u.no_unite}</div>
                  <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Les proprietaires actuels seront archives a la date de vente (historique conserve). Les paiements et cotisations a partir de cette date seront au nom du nouveau proprietaire.</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
                    <div><Lbl l="Date de la vente"/><input type="date" value={vf.date_vente||""} onChange={function(e){setV("date_vente",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Nouveau prop. 1 - prenom"/><input value={vf.p1_prenom||""} onChange={function(e){setV("p1_prenom",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Nouveau prop. 1 - nom"/><input value={vf.p1_nom||""} onChange={function(e){setV("p1_nom",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Courriel"/><input value={vf.p1_courriel||""} onChange={function(e){setV("p1_courriel",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Telephone"/><input value={vf.p1_tel||""} onChange={function(e){setV("p1_tel",e.target.value);}} style={INP}/></div>
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
                    <div><Lbl l="Quote-part (%)"/><input type="number" step="0.001" value={nf.fraction} onChange={function(e){setN("fraction",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Cotisation ($/mois)"/><input type="number" step="0.01" value={nf.cotisation_mensuelle} onChange={function(e){setN("cotisation_mensuelle",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Stationnement"/><input value={nf.stationnement} onChange={function(e){setN("stationnement",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Rangement"/><input value={nf.rangement} onChange={function(e){setN("rangement",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Chauffe-eau (marque/annee)"/><input value={nf.chauffe_eau} onChange={function(e){setN("chauffe_eau",e.target.value);}} style={INP} placeholder="Giant 2019"/></div>
                    <div><Lbl l="No police assurance"/><input value={nf.assurance_police} onChange={function(e){setN("assurance_police",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Assureur"/><input value={nf.ass_cie} onChange={function(e){setN("ass_cie",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Expiration assurance"/><input type="date" value={nf.assurance_exp||""} onChange={function(e){setN("assurance_exp",e.target.value);}} style={INP}/></div>
                    <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginTop:18}} onClick={function(){setN("locataire",!nf.locataire);}}>
                      <div style={{width:18,height:18,borderRadius:4,border:"2px solid "+(nf.locataire?T.accent:T.border),background:nf.locataire?T.accent:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{nf.locataire&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>V</span>}</div>
                      <span style={{fontSize:12}}>Unite louee</span>
                    </div>
                    <div><Lbl l="Locataire"/><input value={nf.nom_locataire} onChange={function(e){setN("nom_locataire",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Tel locataire"/><input value={nf.tel_locataire} onChange={function(e){setN("tel_locataire",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Courriel locataire"/><input value={nf.courriel_locataire} onChange={function(e){setN("courriel_locataire",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Urgence - nom"/><input value={nf.urg_nom} onChange={function(e){setN("urg_nom",e.target.value);}} style={INP}/></div>
                    <div><Lbl l="Urgence - lien"/><input value={nf.urg_lien} onChange={function(e){setN("urg_lien",e.target.value);}} style={INP} placeholder="Fils, soeur..."/></div>
                    <div><Lbl l="Urgence - telephone"/><input value={nf.urg_tel} onChange={function(e){setN("urg_tel",e.target.value);}} style={INP}/></div>
                    <div style={{gridColumn:"1/-1"}}><Lbl l="Notes"/><input value={nf.notes} onChange={function(e){setN("notes",e.target.value);}} style={INP}/></div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <Btn onClick={sauvegarder}>Sauvegarder l unite</Btn>
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
