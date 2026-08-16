// Predictek - SINISTRES ET FRANCHISE D ASSURANCE
// Registre des sinistres du syndicat (obligation depuis la loi 141): consigner chaque
// sinistre, aviser l assureur, suivre la reclamation et l utilisation du fonds
// d auto-assurance (franchise). Rapport imprimable par sinistre.
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}{p.req&&<span style={{color:T.red}}> *</span>}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
var money=function(n){return (Number(n)||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

function imprimerHTML(titre, corpsHTML){
  var w=window.open("","_blank","width=900,height=700");
  if(!w)return;
  w.document.write("<html><head><title>"+titre+"</title><style>body{font-family:Georgia,serif;color:#1C1A17;margin:36px;font-size:13px}h1{font-size:19px;margin:0 0 2px}h2{font-size:14px;border-bottom:2px solid #13233A;padding-bottom:4px;margin-top:22px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #999;padding:5px 8px;font-size:12px;text-align:left}th{background:#EDEBE4;width:220px}.muted{color:#666;font-size:11px}</style></head><body>"+corpsHTML+"<script>window.print();</script></body></html>");
  w.document.close();
}

var TYPES=[{id:"degat_eau",l:"Degat d eau"},{id:"incendie",l:"Incendie / fumee"},{id:"vol",l:"Vol / effraction"},{id:"vandalisme",l:"Vandalisme"},{id:"structure",l:"Structure / infiltration"},{id:"autre",l:"Autre"}];
var STATUTS=[{id:"ouvert",l:"OUVERT",c:"#B83232",bg:"#FDECEA"},{id:"avise",l:"ASSUREUR AVISE",c:"#B86020",bg:"#FEF3E2"},{id:"reclame",l:"RECLAMATION EN COURS",c:"#1A56DB",bg:"#EFF6FF"},{id:"regle",l:"REGLE",c:"#1B5E3B",bg:"#E8F2EC"},{id:"ferme",l:"FERME SANS RECLAMATION",c:"#7C7568",bg:"#EDEBE4"}];
function stInfo(s){return STATUTS.find(function(x){return x.id===s;})||STATUTS[0];}
function typeLbl(t){var x=TYPES.find(function(y){return y.id===t;});return x?x.l:t||"";}

var VIDE={date_sinistre:"",type:"degat_eau",lieu:"",description:"",unites_touchees:"",cause:"",responsable_presume:"",montant_estime:"",franchise:"",assureur:"",no_police:"",no_reclamation:"",date_avis_assureur:"",statut:"ouvert",montant_regle:"",paye_fonds_assurance:false,notes:""};

export default function Sinistres(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var sinistres=s2[0];var setSinistres=s2[1];
  var s3=useState(false);var showForm=s3[0];var setShowForm=s3[1];
  var s4=useState(VIDE);var nf=s4[0];var setNf=s4[1];
  var s5=useState(null);var editId=s5[0];var setEditId=s5[1];
  var s6=useState("");var err=s6[0];var setErr=s6[1];
  var s7=useState("");var msg=s7[0];var setMsg=s7[1];
  var s8=useState(false);var saving=s8[0];var setSaving=s8[1];
  var s9=useState(null);var fichier=s9[0];var setFichier=s9[1];
  var s10=useState(null);var detail=s10[0];var setDetail=s10[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(r){
      if(r&&r.data&&r.data.length>0){setSyndicats(r.data);setSel(r.data[0]);}
    }).catch(function(){});
  },[]);

  function charger(){
    if(!sel)return;
    sb.select("sinistres",{eq:{syndicat_id:sel.id},order:"date_sinistre.desc",limit:200}).then(function(r){
      if(r&&r.data)setSinistres(r.data);
      if(r&&r.error)setErr("Chargement impossible: "+(r.error.message||"la table sinistres existe-t-elle? (SQL fourni)"));
    }).catch(function(){});
  }
  useEffect(function(){setDetail(null);charger();},[sel&&sel.id]);

  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function ouvrirNouveau(){
    setNf(Object.assign({},VIDE,{assureur:"",franchise:""}));
    setEditId(null);setFichier(null);setErr("");setShowForm(true);setDetail(null);
  }
  function ouvrirModif(x){
    setNf(Object.assign({},VIDE,x,{montant_estime:x.montant_estime||"",franchise:x.franchise||"",montant_regle:x.montant_regle||""}));
    setEditId(x.id);setFichier(null);setErr("");setShowForm(true);setDetail(null);
  }

  function sauvegarder(){
    if(!sel||saving)return;
    if(!nf.date_sinistre){setErr("La date du sinistre est requise.");return;}
    if(!nf.description){setErr("La description est requise.");return;}
    setSaving(true);setErr("");setMsg("");
    var row={
      syndicat_id:sel.id,date_sinistre:nf.date_sinistre,type:nf.type||"autre",lieu:nf.lieu||"",
      description:nf.description,unites_touchees:nf.unites_touchees||"",cause:nf.cause||"",
      responsable_presume:nf.responsable_presume||"",
      montant_estime:parseFloat(nf.montant_estime)||null,franchise:parseFloat(nf.franchise)||null,
      assureur:nf.assureur||"",no_police:nf.no_police||"",no_reclamation:nf.no_reclamation||"",
      date_avis_assureur:nf.date_avis_assureur||null,statut:nf.statut||"ouvert",
      montant_regle:parseFloat(nf.montant_regle)||null,paye_fonds_assurance:!!nf.paye_fonds_assurance,
      notes:nf.notes||""
    };
    var op=editId?sb.update("sinistres",editId,row):sb.insert("sinistres",row);
    op.then(function(r){
      if(!r||r.error||!(r.data&&(r.data.id||editId))){
        setSaving(false);
        setErr("ECHEC de la sauvegarde: "+((r&&r.error&&(r.error.message||r.error.hint))||"verifiez que la table sinistres existe (SQL fourni)"));
        return;
      }
      var sid=editId||(r.data&&r.data.id);
      var suite=Promise.resolve();
      if(fichier&&sid){
        var ext=(fichier.name.split(".").pop()||"pdf").toLowerCase();
        var chemin=sel.id+"/sinistres/"+sid+"."+ext;
        suite=sb.uploadFichier("preuves",chemin,fichier).then(function(up){
          if(up&&up.chemin)return sb.update("sinistres",sid,{fichier:up.chemin});
          setErr("Sinistre sauvegarde mais le televersement du document a echoue: "+((up&&up.error&&up.error.message)||""));
        });
      }
      suite.then(function(){
        setSaving(false);setShowForm(false);
        setMsg(editId?"Sinistre mis a jour.":"Sinistre consigne au registre.");
        sb.log("sinistres",editId?"modification":"creation","Sinistre "+(editId?"modifie":"consigne")+": "+typeLbl(row.type)+" du "+row.date_sinistre+" - "+row.description.substring(0,60),"",sel.code||"");
        charger();
        setTimeout(function(){setMsg("");},5000);
      });
    }).catch(function(e){setSaving(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  function changerStatut(x,st){
    sb.update("sinistres",x.id,{statut:st}).then(function(r){
      if(r&&r.error){setErr("Echec: "+(r.error.message||""));return;}
      sb.log("sinistres","modification","Sinistre du "+x.date_sinistre+": statut "+(x.statut||"")+" -> "+st,"",sel.code||"");
      charger();
      setDetail(function(pr){return pr&&pr.id===x.id?Object.assign({},pr,{statut:st}):pr;});
    });
  }

  function voirDocument(x){
    if(!x.fichier)return;
    sb.lienFichier("preuves",x.fichier).then(function(url){
      if(url)window.open(url,"_blank");
      else setErr("Impossible de generer le lien du document.");
    });
  }

  function imprimerRapport(x){
    var st=stInfo(x.statut);
    var franchiseTxt=x.franchise!==null&&x.franchise!==undefined&&x.franchise!==""?money(x.franchise):"non renseignee";
    var h="<h1>Rapport de sinistre</h1><div class='muted'>"+sel.nom+" - genere le "+new Date().toLocaleDateString("fr-CA")+" par Predictek</div>";
    h+="<h2>SINISTRE</h2><table>";
    h+="<tr><th>Date du sinistre</th><td>"+(x.date_sinistre||"")+"</td></tr>";
    h+="<tr><th>Type</th><td>"+typeLbl(x.type)+"</td></tr>";
    h+="<tr><th>Lieu</th><td>"+(x.lieu||"")+"</td></tr>";
    h+="<tr><th>Description</th><td>"+(x.description||"")+"</td></tr>";
    h+="<tr><th>Unites touchees</th><td>"+(x.unites_touchees||"Parties communes seulement")+"</td></tr>";
    h+="<tr><th>Cause</th><td>"+(x.cause||"A determiner")+"</td></tr>";
    h+="<tr><th>Responsable presume</th><td>"+(x.responsable_presume||"A determiner")+"</td></tr>";
    h+="<tr><th>Statut</th><td>"+st.l+"</td></tr></table>";
    h+="<h2>ASSURANCE ET FRANCHISE</h2><table>";
    h+="<tr><th>Assureur</th><td>"+(x.assureur||"")+"</td></tr>";
    h+="<tr><th>No de police</th><td>"+(x.no_police||"")+"</td></tr>";
    h+="<tr><th>Assureur avise le</th><td>"+(x.date_avis_assureur||"NON AVISE")+"</td></tr>";
    h+="<tr><th>No de reclamation</th><td>"+(x.no_reclamation||"-")+"</td></tr>";
    h+="<tr><th>Dommages estimes</th><td>"+(x.montant_estime?money(x.montant_estime):"A evaluer")+"</td></tr>";
    h+="<tr><th>Franchise</th><td>"+franchiseTxt+"</td></tr>";
    if(x.montant_estime&&x.franchise)h+="<tr><th>Part assureur (estimee)</th><td>"+money(Math.max(0,x.montant_estime-x.franchise))+"</td></tr>";
    h+="<tr><th>Montant regle</th><td>"+(x.montant_regle?money(x.montant_regle):"-")+"</td></tr>";
    h+="<tr><th>Franchise payee par le fonds d auto-assurance</th><td>"+(x.paye_fonds_assurance?"OUI (comptes 8200/8201)":"Non")+"</td></tr></table>";
    if(x.notes)h+="<h2>NOTES DE SUIVI</h2><div>"+String(x.notes).replace(/</g,"&lt;").replace(/\n/g,"<br/>")+"</div>";
    h+="<div class='muted' style='margin-top:20px'>Registre des sinistres tenu par le syndicat conformement a ses obligations (art. 1070 C.c.Q. et loi 141). La franchise est assumee par le syndicat via le fonds d auto-assurance; recours possible contre le coproprietaire responsable (art. 1074.2 C.c.Q.).</div>";
    imprimerHTML("Sinistre "+(x.date_sinistre||""),h);
  }

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat - creez d abord un syndicat via Configuration.</div>;
  if(!sel)return null;

  var ouverts=sinistres.filter(function(x){return x.statut!=="regle"&&x.statut!=="ferme";});
  var totalFranchises=sinistres.filter(function(x){return x.paye_fonds_assurance;}).reduce(function(a,x){return a+(parseFloat(x.franchise)||0);},0);

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Sinistres et franchise</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Registre des sinistres - avis a l assureur - fonds d auto-assurance</div>
        </div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{marginLeft:"auto"}}>
          <Btn onClick={ouvrirNouveau}>+ Consigner un sinistre</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
          <div style={{background:T.redL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Sinistres actifs</div><div style={{fontSize:18,fontWeight:800,color:T.red}}>{ouverts.length}</div></div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Total au registre</div><div style={{fontSize:18,fontWeight:800,color:T.navy}}>{sinistres.length}</div></div>
          <div style={{background:T.amberL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Franchises payees (fonds d auto-assurance)</div><div style={{fontSize:18,fontWeight:800,color:T.amber}}>{money(totalFranchises)}</div></div>
        </div>

        {showForm&&(
          <div style={{background:T.surface,border:"2px solid "+T.navy+"33",borderRadius:12,padding:20,marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:12}}>{editId?"Modifier le sinistre":"Consigner un sinistre"}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
              <div><Lbl l="Date du sinistre" req/><input type="date" value={nf.date_sinistre||""} onChange={function(e){setN("date_sinistre",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Type" req/><select value={nf.type} onChange={function(e){setN("type",e.target.value);}} style={INP}>{TYPES.map(function(t){return <option key={t.id} value={t.id}>{t.l}</option>;})}</select></div>
              <div><Lbl l="Lieu (partie commune, etage...)"/><input value={nf.lieu||""} onChange={function(e){setN("lieu",e.target.value);}} style={INP}/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Description" req/><textarea value={nf.description||""} onChange={function(e){setN("description",e.target.value);}} style={Object.assign({},INP,{minHeight:60,resize:"vertical"})} placeholder="Ce qui s est passe, dommages constates..."/></div>
              <div><Lbl l="Unites touchees"/><input value={nf.unites_touchees||""} onChange={function(e){setN("unites_touchees",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Cause"/><input value={nf.cause||""} onChange={function(e){setN("cause",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Responsable presume"/><input value={nf.responsable_presume||""} onChange={function(e){setN("responsable_presume",e.target.value);}} style={INP}/></div>
            </div>
            <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em",margin:"6px 0"}}>Assurance et montants</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
              <div><Lbl l="Assureur"/><input value={nf.assureur||""} onChange={function(e){setN("assureur",e.target.value);}} style={INP}/></div>
              <div><Lbl l="No de police"/><input value={nf.no_police||""} onChange={function(e){setN("no_police",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Assureur avise le"/><input type="date" value={nf.date_avis_assureur||""} onChange={function(e){setN("date_avis_assureur",e.target.value);}} style={INP}/></div>
              <div><Lbl l="No de reclamation"/><input value={nf.no_reclamation||""} onChange={function(e){setN("no_reclamation",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Dommages estimes ($)"/><input type="number" step="0.01" value={nf.montant_estime||""} onChange={function(e){setN("montant_estime",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Franchise ($)"/><input type="number" step="0.01" value={nf.franchise||""} onChange={function(e){setN("franchise",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Montant regle ($)"/><input type="number" step="0.01" value={nf.montant_regle||""} onChange={function(e){setN("montant_regle",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Statut"/><select value={nf.statut} onChange={function(e){setN("statut",e.target.value);}} style={INP}>{STATUTS.map(function(s){return <option key={s.id} value={s.id}>{s.l}</option>;})}</select></div>
            </div>
            {nf.montant_estime&&nf.franchise&&parseFloat(nf.montant_estime)>0&&(
              <div style={{background:T.blueL,borderRadius:8,padding:"8px 12px",fontSize:12,color:T.blue,fontWeight:600,marginBottom:10}}>
                {parseFloat(nf.montant_estime)<=parseFloat(nf.franchise)
                  ?"Dommages ("+money(nf.montant_estime)+") INFERIEURS a la franchise ("+money(nf.franchise)+"): reclamation a l assureur generalement non avantageuse - le fonds d auto-assurance assume."
                  :"Part assureur estimee: "+money(parseFloat(nf.montant_estime)-parseFloat(nf.franchise))+" - franchise de "+money(nf.franchise)+" assumee par le syndicat (fonds d auto-assurance)."}
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div>
                <Lbl l="Franchise payee par le fonds d auto-assurance?"/>
                <button onClick={function(){setN("paye_fonds_assurance",!nf.paye_fonds_assurance);}} style={{background:nf.paye_fonds_assurance?T.accentL:T.alt,border:"2px solid "+(nf.paye_fonds_assurance?T.accent:T.border),borderRadius:20,padding:"6px 16px",fontSize:11,fontWeight:800,color:nf.paye_fonds_assurance?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit"}}>{nf.paye_fonds_assurance?"OUI":"NON"}</button>
              </div>
              <div>
                <Lbl l={"Document (photos, rapport, reclamation)"+(editId?" - remplace l existant":"")}/>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={function(e){setFichier(e.target.files&&e.target.files[0]?e.target.files[0]:null);}} style={{fontSize:11,fontFamily:"inherit"}}/>
              </div>
            </div>
            <div style={{marginBottom:12}}><Lbl l="Notes de suivi"/><textarea value={nf.notes||""} onChange={function(e){setN("notes",e.target.value);}} style={Object.assign({},INP,{minHeight:50,resize:"vertical"})} placeholder="Appels, visites d expert, decisions du CA..."/></div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={sauvegarder} dis={saving}>{saving?"Sauvegarde...":(editId?"Mettre a jour":"Consigner au registre")}</Btn>
              <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowForm(false);setErr("");}}>Annuler</Btn>
            </div>
          </div>
        )}

        {detail&&(function(){
          var x=detail;var st=stInfo(x.statut);
          return(
            <div style={{background:T.surface,border:"2px solid "+st.c+"55",borderRadius:12,padding:20,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:10}}>
                <div>
                  <span style={{background:st.bg,color:st.c,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800}}>{st.l}</span>
                  <div style={{fontSize:15,fontWeight:800,color:T.navy,marginTop:6}}>{typeLbl(x.type)} - {x.date_sinistre}</div>
                  <div style={{fontSize:12,color:T.muted}}>{x.lieu}</div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {x.fichier&&<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){voirDocument(x);}}>Voir le document</Btn>}
                  <Btn sm onClick={function(){imprimerRapport(x);}}>Imprimer le rapport</Btn>
                  <Btn sm bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){ouvrirModif(x);}}>Modifier</Btn>
                  <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setDetail(null);}}>Fermer</Btn>
                </div>
              </div>
              <div style={{fontSize:12,color:T.text,marginBottom:10}}>{x.description}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8,fontSize:12}}>
                <div><span style={{color:T.muted}}>Unites touchees: </span>{x.unites_touchees||"Parties communes"}</div>
                <div><span style={{color:T.muted}}>Cause: </span>{x.cause||"A determiner"}</div>
                <div><span style={{color:T.muted}}>Responsable presume: </span>{x.responsable_presume||"A determiner"}</div>
                <div><span style={{color:T.muted}}>Assureur: </span>{x.assureur||"-"}{x.no_police?" ("+x.no_police+")":""}</div>
                <div><span style={{color:T.muted}}>Avise le: </span><span style={{color:x.date_avis_assureur?T.text:T.red,fontWeight:x.date_avis_assureur?400:700}}>{x.date_avis_assureur||"NON AVISE"}</span></div>
                <div><span style={{color:T.muted}}>Reclamation: </span>{x.no_reclamation||"-"}</div>
                <div><span style={{color:T.muted}}>Dommages estimes: </span>{x.montant_estime?money(x.montant_estime):"A evaluer"}</div>
                <div><span style={{color:T.muted}}>Franchise: </span>{x.franchise?money(x.franchise):"-"}{x.paye_fonds_assurance?" (fonds d auto-assurance)":""}</div>
                <div><span style={{color:T.muted}}>Montant regle: </span>{x.montant_regle?money(x.montant_regle):"-"}</div>
              </div>
              {x.notes&&<div style={{background:T.alt,borderRadius:8,padding:10,fontSize:11,color:T.text,marginTop:10,whiteSpace:"pre-wrap"}}>{x.notes}</div>}
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:12,alignItems:"center"}}>
                <span style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase"}}>Changer le statut:</span>
                {STATUTS.filter(function(s){return s.id!==x.statut;}).map(function(s){return <Btn key={s.id} sm bg={s.bg} tc={s.c} bdr={"1px solid "+s.c+"44"} onClick={function(){changerStatut(x,s.id);}}>{s.l}</Btn>;})}
              </div>
            </div>
          );
        })()}

        {sinistres.length===0&&!showForm&&(
          <div style={{background:T.surface,border:"1px dashed "+T.border,borderRadius:12,padding:30,textAlign:"center",color:T.muted,fontSize:13}}>
            Aucun sinistre au registre pour {sel.nom}.<br/>
            <span style={{fontSize:11}}>Consignez chaque sinistre des sa survenance: c est la base de l avis a l assureur, du suivi de la franchise et du registre officiel.</span>
          </div>
        )}

        {sinistres.map(function(x){
          var st=stInfo(x.statut);
          return(
            <div key={x.id} onClick={function(){setDetail(x);setShowForm(false);window.scrollTo(0,0);}} style={{background:T.surface,border:"1px solid "+T.border,borderLeft:"4px solid "+st.c,borderRadius:10,padding:"12px 16px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <span style={{background:st.bg,color:st.c,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800,flexShrink:0}}>{st.l}</span>
              <div style={{flex:1,minWidth:220}}>
                <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{typeLbl(x.type)} - {x.date_sinistre}{x.lieu?" - "+x.lieu:""}</div>
                <div style={{fontSize:11,color:T.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:600}}>{x.description}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:12,fontWeight:800,color:T.navy}}>{x.montant_estime?money(x.montant_estime):""}</div>
                <div style={{fontSize:10,color:x.date_avis_assureur?T.muted:T.red,fontWeight:x.date_avis_assureur?400:700}}>{x.date_avis_assureur?"Assureur avise "+x.date_avis_assureur:"ASSUREUR NON AVISE"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
