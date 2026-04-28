
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}{p.req&&<span style={{color:T.red}}> *</span>}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Badge(p){var C={actif:{bg:"#D4EDDA",tc:"#155724"},inactif:{bg:"#F0EDE8",tc:"#7C7568"},pap:{bg:"#EFF6FF",tc:"#1A56DB"},locataire:{bg:"#FEF3E2",tc:"#B86020"}};var c=C[p.t]||C.inactif;return <span style={{background:c.bg,color:c.tc,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{p.l}</span>;}

var VIDE_CP={unite:"",nom:"",prenom:"",nom2:"",courriel:"",telephone:"",adresse:"",ville:"",province:"QC",code_postal:"",fraction:0,cotisation_mensuelle:0,code_acces:"",pap:false,statut:"actif",locataire:false,nom_locataire:"",tel_locataire:"",ce_marque:"",ce_annee_install:"",ce_duree_vie:12,ce_expiry:"",ass_cie:"",ass_montant:"",ass_numero:"",ass_expiry:"",pap_date_exp:"",notes:""};

function FormulaireCP(p){
  var nf=p.nf;var setField=p.setField;var ong=p.ong;
  if(ong==="base")return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div><Lbl l="No unite" req/><input value={nf.unite||""} onChange={function(e){setField("unite",e.target.value.toUpperCase());}} style={INP} placeholder="101"/></div>
      <div><Lbl l="Fraction"/><input type="number" step="0.001" value={nf.fraction||""} onChange={function(e){setField("fraction",e.target.value);}} style={INP} placeholder="0.025"/></div>
      <div><Lbl l="Nom" req/><input value={nf.nom||""} onChange={function(e){setField("nom",e.target.value);}} style={INP} placeholder="Laroche"/></div>
      <div><Lbl l="Prenom"/><input value={nf.prenom||""} onChange={function(e){setField("prenom",e.target.value);}} style={INP} placeholder="Jean-Francois"/></div>
      <div style={{gridColumn:"1/-1"}}><Lbl l="Nom 2 (co-proprietaire)"/><input value={nf.nom2||""} onChange={function(e){setField("nom2",e.target.value);}} style={INP} placeholder="Deuxieme proprietaire si applicable"/></div>
      <div><Lbl l="Courriel"/><input type="email" value={nf.courriel||""} onChange={function(e){setField("courriel",e.target.value);}} style={INP} placeholder="prenom@email.com"/></div>
      <div><Lbl l="Telephone"/><input value={nf.telephone||""} onChange={function(e){setField("telephone",e.target.value);}} style={INP} placeholder="418-555-0000"/></div>
      <div style={{gridColumn:"1/-1"}}><Lbl l="Adresse unitaire (si differente)"/><input value={nf.adresse||""} onChange={function(e){setField("adresse",e.target.value);}} style={INP}/></div>
      <div><Lbl l="Cotisation mensuelle ($)"/><input type="number" step="0.01" value={nf.cotisation_mensuelle||""} onChange={function(e){setField("cotisation_mensuelle",e.target.value);}} style={INP} placeholder="250.00"/></div>
      <div><Lbl l="Code d acces portail"/><input value={nf.code_acces||""} onChange={function(e){setField("code_acces",e.target.value);}} style={INP} placeholder="Min. 4 caracteres"/></div>
      <div><Lbl l="Statut"/><select value={nf.statut||"actif"} onChange={function(e){setField("statut",e.target.value);}} style={INP}><option value="actif">Actif</option><option value="inactif">Inactif</option><option value="vendu">Vendu</option></select></div>
      <div style={{gridColumn:"1/-1",display:"flex",gap:20}}>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={function(){setField("pap",!nf.pap);}}>
          <div style={{width:18,height:18,borderRadius:4,border:"2px solid "+(nf.pap?T.accent:T.border),background:nf.pap?T.accent:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{nf.pap&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>V</span>}</div>
          <span style={{fontSize:12}}>PAP actif</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={function(){setField("locataire",!nf.locataire);}}>
          <div style={{width:18,height:18,borderRadius:4,border:"2px solid "+(nf.locataire?T.amber:T.border),background:nf.locataire?T.amber:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{nf.locataire&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>V</span>}</div>
          <span style={{fontSize:12}}>Locataire present</span>
        </div>
      </div>
      {nf.locataire&&(
        <div style={{gridColumn:"1/-1",background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:8,padding:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{gridColumn:"1/-1",fontSize:11,fontWeight:700,color:T.amber}}>Informations locataire</div>
          <div><Lbl l="Nom locataire"/><input value={nf.nom_locataire||""} onChange={function(e){setField("nom_locataire",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Tel locataire"/><input value={nf.tel_locataire||""} onChange={function(e){setField("tel_locataire",e.target.value);}} style={INP}/></div>
        </div>
      )}
      {nf.pap&&<div style={{gridColumn:"1/-1"}}><Lbl l="Expiration autorisation PAP"/><input type="date" value={nf.pap_date_exp||""} onChange={function(e){setField("pap_date_exp",e.target.value);}} style={INP}/></div>}
      <div style={{gridColumn:"1/-1"}}><Lbl l="Notes"/><textarea value={nf.notes||""} onChange={function(e){setField("notes",e.target.value);}} style={Object.assign({},INP,{minHeight:60,resize:"vertical"})} placeholder="Notes internes..."/></div>
    </div>
  );
  if(ong==="certificat")return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={{gridColumn:"1/-1",background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:8,padding:10,fontSize:11,color:T.blue}}>Certificat eau chaude - obligatoire selon reglementation provinciale</div>
      <div><Lbl l="Marque / modele"/><input value={nf.ce_marque||""} onChange={function(e){setField("ce_marque",e.target.value);}} style={INP} placeholder="Rheem, A.O. Smith..."/></div>
      <div><Lbl l="Annee installation"/><input type="number" value={nf.ce_annee_install||""} onChange={function(e){setField("ce_annee_install",e.target.value);}} style={INP} placeholder="2018"/></div>
      <div><Lbl l="Duree de vie (ans)"/><input type="number" value={nf.ce_duree_vie||12} onChange={function(e){setField("ce_duree_vie",e.target.value);}} style={INP} placeholder="12"/></div>
      <div><Lbl l="Date expiration certificat"/><input type="date" value={nf.ce_expiry||""} onChange={function(e){setField("ce_expiry",e.target.value);}} style={INP}/></div>
    </div>
  );
  if(ong==="assurance")return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={{gridColumn:"1/-1",background:T.purpleL,border:"1px solid #6B3FA044",borderRadius:8,padding:10,fontSize:11,color:"#6B3FA0"}}>Assurance responsabilite civile du coproprietaire - exigee par la declaration</div>
      <div><Lbl l="Compagnie d assurance"/><input value={nf.ass_cie||""} onChange={function(e){setField("ass_cie",e.target.value);}} style={INP} placeholder="Intact, Desjardins..."/></div>
      <div><Lbl l="No de police"/><input value={nf.ass_numero||""} onChange={function(e){setField("ass_numero",e.target.value);}} style={INP} placeholder="HO-123456"/></div>
      <div><Lbl l="Montant couverture ($)"/><input type="number" step="10000" value={nf.ass_montant||""} onChange={function(e){setField("ass_montant",e.target.value);}} style={INP} placeholder="1000000"/></div>
      <div><Lbl l="Date expiration"/><input type="date" value={nf.ass_expiry||""} onChange={function(e){setField("ass_expiry",e.target.value);}} style={INP}/></div>
    </div>
  );
  return null;
}

export default function GestionCopros(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var copros=s2[0];var setCopros=s2[1];
  var s3=useState(false);var showForm=s3[0];var setShowForm=s3[1];
  var s4=useState(VIDE_CP);var nf=s4[0];var setNf=s4[1];
  var s5=useState(null);var editId=s5[0];var setEditId=s5[1];
  var s6=useState("base");var ongForm=s6[0];var setOngForm=s6[1];
  var s7=useState("");var recherche=s7[0];var setRecherche=s7[1];
  var s8=useState(false);var saving=s8[0];var setSaving=s8[1];
  var s9=useState(null);var detail=s9[0];var setDetail=s9[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setCopros([]);
    sb.select("coproprietaires",{eq:{syndicat_id:sel.id},order:"unite.asc"}).then(function(res){
      if(res&&res.data)setCopros(res.data);
    }).catch(function(){});
  },[sel]);

  function setField(k,v){setNf(function(pr){var next=Object.assign({},pr);next[k]=v;return next;});}

  function sauvegarder(){
    if(!nf.unite||!nf.nom||!sel)return;
    setSaving(true);
    var row={syndicat_id:sel.id,unite:nf.unite,nom:nf.nom,prenom:nf.prenom||"",nom2:nf.nom2||"",courriel:nf.courriel||"",telephone:nf.telephone||"",adresse:nf.adresse||"",fraction:parseFloat(nf.fraction)||0,cotisation_mensuelle:parseFloat(nf.cotisation_mensuelle)||0,code_acces:nf.code_acces||"",pap:nf.pap||false,statut:nf.statut||"actif",locataire:nf.locataire||false,nom_locataire:nf.nom_locataire||"",tel_locataire:nf.tel_locataire||"",ce_marque:nf.ce_marque||"",ce_annee_install:parseInt(nf.ce_annee_install)||null,ce_duree_vie:parseInt(nf.ce_duree_vie)||12,ce_expiry:nf.ce_expiry||null,ass_cie:nf.ass_cie||"",ass_montant:parseFloat(nf.ass_montant)||null,ass_numero:nf.ass_numero||"",ass_expiry:nf.ass_expiry||null,pap_date_exp:nf.pap_date_exp||null,notes:nf.notes||""};
    var op=editId?sb.update("coproprietaires",editId,row):sb.insert("coproprietaires",row);
    op.then(function(res){
      if(editId){
        setCopros(function(prev){return prev.map(function(c){return c.id===editId?Object.assign({},c,row):c;});});
      }else if(res&&res.data){
        setCopros(function(prev){return prev.concat([res.data]);});
      }
      sb.log("coproprietaires",editId?"modification":"ajout",(editId?"Modification":"Ajout")+" Unite "+nf.unite+": "+nf.nom,"",sel.code||"");
      setShowForm(false);setNf(VIDE_CP);setEditId(null);setSaving(false);
    }).catch(function(){setSaving(false);});
  }

  function editer(c){
    setNf({unite:c.unite||"",nom:c.nom||"",prenom:c.prenom||"",nom2:c.nom2||"",courriel:c.courriel||"",telephone:c.telephone||"",adresse:c.adresse||"",fraction:c.fraction||0,cotisation_mensuelle:c.cotisation_mensuelle||0,code_acces:c.code_acces||"",pap:c.pap||false,statut:c.statut||"actif",locataire:c.locataire||false,nom_locataire:c.nom_locataire||"",tel_locataire:c.tel_locataire||"",ce_marque:c.ce_marque||"",ce_annee_install:c.ce_annee_install||"",ce_duree_vie:c.ce_duree_vie||12,ce_expiry:c.ce_expiry||"",ass_cie:c.ass_cie||"",ass_montant:c.ass_montant||"",ass_numero:c.ass_numero||"",ass_expiry:c.ass_expiry||"",pap_date_exp:c.pap_date_exp||"",notes:c.notes||""});
    setEditId(c.id);setShowForm(true);setOngForm("base");
  }

  function exporterCSV(){
    var lignes=["Unite,Nom,Prenom,Courriel,Telephone,Cotisation,PAP,Statut,CE Expiry,Ass Expiry"];
    copros.forEach(function(c){lignes.push([c.unite,c.nom,c.prenom||"",c.courriel||"",c.telephone||"",c.cotisation_mensuelle||0,c.pap?"Oui":"Non",c.statut,c.ce_expiry||"",c.ass_expiry||""].join(","));});
    var blob=new Blob([lignes.join("
")],{type:"text/csv"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;a.download="copropri-taires_"+(sel?sel.nom:"")+"_"+new Date().toISOString().substring(0,10)+".csv";a.click();URL.revokeObjectURL(url);
  }

  var filtres=copros.filter(function(c){return !recherche||c.unite.toLowerCase().includes(recherche.toLowerCase())||c.nom.toLowerCase().includes(recherche.toLowerCase())||(c.courriel&&c.courriel.toLowerCase().includes(recherche.toLowerCase()));});
  var actifs=filtres.filter(function(c){return c.statut==="actif";});
  var inactifs=filtres.filter(function(c){return c.statut!=="actif";});
  var aujourd_hui=new Date();
  var FORM_TABS=[{id:"base",l:"Informations"},{id:"certificat",l:"Cert. eau"},{id:"assurance",l:"Assurance"}];

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Gestion des coproprietaires</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {copros.length>0&&<Btn sm bg="#ffffff18" bdr="1px solid #ffffff40" onClick={exporterCSV}>Exporter CSV</Btn>}
          <Btn onClick={function(){setNf(VIDE_CP);setEditId(null);setShowForm(true);setOngForm("base");}}>+ Ajouter</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:T.navy}}>{copros.filter(function(c){return c.statut==="actif";}).length}</div><div style={{fontSize:10,color:T.muted}}>Actives</div></div>
          <div style={{background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:10,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:T.blue}}>{copros.filter(function(c){return c.pap;}).length}</div><div style={{fontSize:10,color:T.muted}}>PAP actifs</div></div>
          <div style={{background:T.amberL,border:"1px solid "+T.amber+"33",borderRadius:10,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:T.amber}}>{copros.filter(function(c){return c.ce_expiry&&Math.round((new Date(c.ce_expiry)-aujourd_hui)/(1000*60*60*24))<90;}).length}</div><div style={{fontSize:10,color:T.muted}}>CE a renouveler</div></div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:T.navy}}>{copros.reduce(function(a,c){return a+Number(c.cotisation_mensuelle||0);},0).toFixed(0)} $</div><div style={{fontSize:10,color:T.muted}}>Total mensuel</div></div>
        </div>

        <input value={recherche} onChange={function(e){setRecherche(e.target.value);}} placeholder="Rechercher par unite, nom, courriel..." style={Object.assign({},INP,{marginBottom:16})}/>

        {showForm&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>{editId?"Modifier Unite "+nf.unite:"Nouveau coproprietaire"}</div>
            <div style={{display:"flex",gap:4,marginBottom:16,background:T.alt,borderRadius:8,padding:4}}>
              {FORM_TABS.map(function(t){var a=ongForm===t.id;return <button key={t.id} onClick={function(){setOngForm(t.id);}} style={{background:a?"#fff":"transparent",border:"none",borderRadius:6,padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:400,color:a?T.navy:T.muted,boxShadow:a?"0 1px 3px rgba(0,0,0,0.1)":"none"}}>{t.l}</button>;})}
            </div>
            <FormulaireCP nf={nf} setField={setField} ong={ongForm}/>
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <Btn onClick={sauvegarder} dis={saving||!nf.nom||!nf.unite}>{saving?"Sauvegarde...":"Sauvegarder"}</Btn>
              <Btn onClick={function(){setShowForm(false);setEditId(null);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}

        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{background:T.alt}}>
                  {["Unite","Coproprietaire","Telephone","Cotisation","PAP","CE","Assurance","Statut","Action"].map(function(h){return <th key={h} style={{padding:"9px 10px",textAlign:"left",fontWeight:600,color:T.navy,whiteSpace:"nowrap"}}>{h}</th>;})}
                </tr>
              </thead>
              <tbody>
                {actifs.map(function(c){
                  var ceExp=c.ce_expiry?Math.round((new Date(c.ce_expiry)-aujourd_hui)/(1000*60*60*24)):null;
                  var assExp=c.ass_expiry?Math.round((new Date(c.ass_expiry)-aujourd_hui)/(1000*60*60*24)):null;
                  return(<tr key={c.id} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"8px 10px",fontWeight:700,color:T.navy}}>{c.unite}</td>
                    <td style={{padding:"8px 10px"}}>
                      <div style={{fontWeight:600}}>{c.nom}{c.prenom?" "+c.prenom:""}</div>
                      {c.courriel&&<div style={{fontSize:10,color:T.muted}}>{c.courriel}</div>}
                      {c.locataire&&<div style={{fontSize:10}}><Badge t="locataire" l="Locataire"/></div>}
                    </td>
                    <td style={{padding:"8px 10px",color:T.muted}}>{c.telephone||"-"}</td>
                    <td style={{padding:"8px 10px",fontWeight:600,color:T.accent}}>{Number(c.cotisation_mensuelle||0).toFixed(2)} $</td>
                    <td style={{padding:"8px 10px"}}>{c.pap?<Badge t="pap" l="PAP"/>:<span style={{color:T.muted,fontSize:11}}>Non</span>}</td>
                    <td style={{padding:"8px 10px",fontSize:11,color:ceExp!==null&&ceExp<90?ceExp<30?T.red:T.amber:T.muted}}>{c.ce_expiry?c.ce_expiry+(ceExp!==null&&ceExp<90?"  !":""):"-"}</td>
                    <td style={{padding:"8px 10px",fontSize:11,color:assExp!==null&&assExp<90?assExp<30?T.red:T.amber:T.muted}}>{c.ass_expiry?c.ass_expiry+(assExp!==null&&assExp<90?"  !":""):"-"}</td>
                    <td style={{padding:"8px 10px"}}><Badge t={c.statut||"actif"} l={c.statut||"actif"}/></td>
                    <td style={{padding:"8px 10px"}}><Btn sm onClick={function(){editer(c);}}>Modifier</Btn></td>
                  </tr>);
                })}
                {actifs.length===0&&<tr><td colSpan={9} style={{padding:24,textAlign:"center",color:T.muted}}>Aucun coproprietaire - cliquez "+ Ajouter"</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {inactifs.length>0&&<div style={{marginTop:16,fontSize:11,color:T.muted}}>{inactifs.length} unite(s) inactive(s) non affichee(s)</div>}
      </div>
    </div>
  );
}
