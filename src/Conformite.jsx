// Predictek - AVIS DE NON-CONFORMITE
// Violations du reglement de l immeuble: avis formel avec article du reglement et ECHEANCE
// pour corriger. A l echeance non corrigee, un AVIS D INFRACTION (avec penalite selon le
// reglement) peut etre emis en un clic. Avis imprimables; rappels par le moteur de relances.
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
  w.document.write("<html><head><title>"+titre+"</title><style>body{font-family:Georgia,serif;color:#1C1A17;margin:42px;font-size:13px;line-height:1.55}h1{font-size:18px;margin:0 0 2px}h2{font-size:14px;border-bottom:2px solid #13233A;padding-bottom:4px;margin-top:22px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #999;padding:6px 9px;font-size:12px;text-align:left}th{background:#EDEBE4;width:200px}.muted{color:#666;font-size:11px}.enc{border:2px solid #B83232;border-radius:8px;padding:12px;margin:14px 0;font-weight:bold}</style></head><body>"+corpsHTML+"<script>window.print();</script></body></html>");
  w.document.close();
}

var STATUTS=[
  {id:"emis",l:"EN COURS",c:"#B86020",bg:"#FEF3E2"},
  {id:"corrige",l:"CORRIGE",c:"#1B5E3B",bg:"#E8F2EC"},
  {id:"infraction_emise",l:"INFRACTION EMISE",c:"#B83232",bg:"#FDECEA"},
  {id:"annule",l:"ANNULE",c:"#7C7568",bg:"#EDEBE4"}
];
function stInfo(st){return STATUTS.find(function(x){return x.id===st;})||STATUTS[0];}
var NIVEAUX={avis:"AVIS DE NON-CONFORMITE",rappel:"RAPPEL",infraction:"AVIS D INFRACTION"};

var VIDE={unite:"",coproprietaire_id:"",objet:"",description:"",article_reglement:"",date_avis:new Date().toISOString().substring(0,10),echeance:"",notes:""};

export default function Conformite(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var avis=s2[0];var setAvis=s2[1];
  var s3=useState([]);var copros=s3[0];var setCopros=s3[1];
  var s4=useState([]);var unites=s4[0];var setUnites=s4[1];
  var s5=useState(false);var showForm=s5[0];var setShowForm=s5[1];
  var s6=useState(VIDE);var nf=s6[0];var setNf=s6[1];
  var s7=useState("");var err=s7[0];var setErr=s7[1];
  var s8=useState("");var msg=s8[0];var setMsg=s8[1];
  var s9=useState(false);var saving=s9[0];var setSaving=s9[1];
  var s10=useState(null);var infractionPour=s10[0];var setInfractionPour=s10[1];
  var s11=useState("");var penalite=s11[0];var setPenalite=s11[1];
  var s12=useState("actifs");var filtre=s12[0];var setFiltre=s12[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(r){
      if(r&&r.data&&r.data.length>0){setSyndicats(r.data);setSel(r.data[0]);}
    }).catch(function(){});
  },[]);

  function charger(){
    if(!sel)return;
    sb.select("avis_conformite",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:500}).then(function(r){
      if(r&&r.data)setAvis(r.data);
      if(r&&r.error)setErr("Chargement impossible: "+(r.error.message||"la table avis_conformite existe-t-elle? (SQL fourni)"));
    }).catch(function(){});
    sb.select("coproprietaires",{eq:{syndicat_id:sel.id},limit:2000}).then(function(r){if(r&&r.data)setCopros(r.data);}).catch(function(){});
    sb.select("unites",{eq:{syndicat_id:sel.id},order:"no_unite.asc",limit:1000}).then(function(r){if(r&&r.data)setUnites(r.data);}).catch(function(){});
  }
  useEffect(function(){charger();},[sel&&sel.id]);

  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function coprosDeUnite(noU){
    return copros.filter(function(c){return c.statut!=="ancien"&&(c.unite===noU||(function(){var u=unites.find(function(x){return x.no_unite===noU;});return u&&c.unite_id===u.id;})());});
  }

  function creerAvis(){
    if(saving||!sel)return;
    if(!nf.unite){setErr("Choisissez l unite visee.");return;}
    if(!nf.objet){setErr("L objet de l avis est requis.");return;}
    if(!nf.echeance){setErr("L echeance pour corriger est requise.");return;}
    setSaving(true);setErr("");
    var dest=coprosDeUnite(nf.unite);
    var destNom=dest.map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(" et ");
    var row={syndicat_id:sel.id,unite:nf.unite,coproprietaire_id:(dest[0]&&dest[0].id)||null,destinataire_nom:destNom,
      objet:nf.objet,description:nf.description||"",article_reglement:nf.article_reglement||"",
      niveau:"avis",date_avis:nf.date_avis,echeance:nf.echeance,statut:"emis",notes:nf.notes||""};
    sb.insert("avis_conformite",row).then(function(r){
      setSaving(false);
      if(!r||!r.data||!r.data.id){setErr("ECHEC de la creation: "+((r&&r.error&&r.error.message)||"erreur"));return;}
      setMsg("Avis de non-conformite emis pour l unite "+nf.unite+" - echeance "+nf.echeance+". Imprimez-le et transmettez-le au coproprietaire.");
      sb.log("conformite","creation","Avis de non-conformite: unite "+nf.unite+" - "+nf.objet.substring(0,60)+" (echeance "+nf.echeance+")","",sel.code||"");
      setShowForm(false);setNf(Object.assign({},VIDE,{date_avis:new Date().toISOString().substring(0,10)}));
      charger();setTimeout(function(){setMsg("");},6000);
    }).catch(function(e){setSaving(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  function marquerCorrige(a){
    sb.update("avis_conformite",a.id,{statut:"corrige",date_correction:new Date().toISOString().substring(0,10)}).then(function(r){
      if(r&&r.error){setErr("Echec: "+(r.error.message||""));return;}
      sb.log("conformite","modification","Avis unite "+a.unite+" corrige: "+a.objet.substring(0,60),"",sel.code||"");
      charger();
    });
  }
  function annuler(a){
    sb.update("avis_conformite",a.id,{statut:"annule"}).then(function(r){
      if(r&&r.error){setErr("Echec: "+(r.error.message||""));return;}
      sb.log("conformite","modification","Avis unite "+a.unite+" annule","",sel.code||"");
      charger();
    });
  }

  function emettreInfraction(a){
    if(saving)return;
    setSaving(true);setErr("");
    var row={syndicat_id:sel.id,unite:a.unite,coproprietaire_id:a.coproprietaire_id,destinataire_nom:a.destinataire_nom,
      objet:a.objet,description:a.description,article_reglement:a.article_reglement,
      niveau:"infraction",avis_parent_id:a.id,date_avis:new Date().toISOString().substring(0,10),
      echeance:null,statut:"emis",montant_penalite:parseFloat(penalite)||null,
      notes:"Fait suite a l avis du "+(a.date_avis||"")+" dont l echeance du "+(a.echeance||"")+" n a pas ete respectee."};
    sb.insert("avis_conformite",row).then(function(r){
      setSaving(false);
      if(!r||!r.data||!r.data.id){setErr("ECHEC de l emission: "+((r&&r.error&&r.error.message)||"erreur"));return;}
      sb.update("avis_conformite",a.id,{statut:"infraction_emise"}).then(function(){charger();});
      setMsg("AVIS D INFRACTION emis pour l unite "+a.unite+(penalite?" - penalite "+money(penalite):"")+". Imprimez-le et transmettez-le.");
      sb.log("conformite","creation","AVIS D INFRACTION: unite "+a.unite+" - "+a.objet.substring(0,60)+(penalite?" (penalite "+penalite+" $)":""),"",sel.code||"");
      setInfractionPour(null);setPenalite("");
      setTimeout(function(){setMsg("");},6000);
    }).catch(function(e){setSaving(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  function imprimerAvis(a){
    var titre=NIVEAUX[a.niveau]||"AVIS";
    var h="<div class='muted'>"+(sel.nom||"")+(sel.adr?" - "+sel.adr:"")+(sel.ville?", "+sel.ville:"")+"</div>";
    h+="<h1 style='margin-top:14px'>"+titre+"</h1>";
    h+="<div class='muted'>Date: "+(a.date_avis||"")+"</div>";
    h+="<table>";
    h+="<tr><th>Destinataire</th><td>"+(a.destinataire_nom||"Coproprietaire de l unite "+a.unite)+" (unite "+a.unite+")</td></tr>";
    h+="<tr><th>Objet</th><td>"+(a.objet||"")+"</td></tr>";
    if(a.article_reglement)h+="<tr><th>Disposition visee</th><td>"+a.article_reglement+"</td></tr>";
    if(a.description)h+="<tr><th>Description des faits</th><td>"+a.description+"</td></tr>";
    if(a.echeance)h+="<tr><th>Echeance pour corriger</th><td><b>"+a.echeance+"</b></td></tr>";
    if(a.montant_penalite)h+="<tr><th>Penalite</th><td><b>"+money(a.montant_penalite)+"</b> (selon le reglement de l immeuble)</td></tr>";
    h+="</table>";
    if(a.niveau==="infraction"){
      h+="<div class='enc'>Le present AVIS D INFRACTION fait suite a un avis de non-conformite demeure sans correction a l echeance. "+(a.notes||"")+"</div>";
      h+="<p>Le syndicat se reserve tous ses droits et recours, notamment ceux prevus a la declaration de copropriete et aux articles 1080 C.c.Q. et suivants.</p>";
    }else{
      h+="<p>Vous etes prie(e) de corriger la situation decrite ci-dessus au plus tard a l echeance indiquee. A defaut, un avis d infraction pourra etre emis et les penalites prevues au reglement de l immeuble pourront s appliquer, sans autre avis ni delai.</p>";
    }
    h+="<p>Veuillez agir en consequence.</p>";
    h+="<br/><p>Le Conseil d administration<br/>"+(sel.nom||"")+"</p>";
    h+="<div class='muted' style='margin-top:26px'>Genere par Predictek le "+new Date().toLocaleDateString("fr-CA")+".</div>";
    imprimerHTML(titre+" - unite "+a.unite,h);
  }

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat - creez d abord un syndicat via Configuration.</div>;
  if(!sel)return null;

  var auj=new Date().toISOString().substring(0,10);
  var actifs=avis.filter(function(a){return a.statut==="emis";});
  var echus=actifs.filter(function(a){return a.echeance&&a.echeance<auj;});
  var listeAff=avis.filter(function(a){
    if(filtre==="actifs")return a.statut==="emis";
    if(filtre==="echus")return a.statut==="emis"&&a.echeance&&a.echeance<auj;
    if(filtre==="tous")return true;
    return a.statut===filtre;
  });

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Avis de non-conformite</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Violations du reglement - echeances - avis d infraction et penalites</div>
        </div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{marginLeft:"auto"}}>
          <Btn onClick={function(){setShowForm(true);setErr("");}}>+ Emettre un avis</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
          <div style={{background:T.amberL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Avis en cours</div><div style={{fontSize:18,fontWeight:800,color:T.amber}}>{actifs.length}</div></div>
          <div style={{background:T.redL,border:"2px solid "+(echus.length>0?T.red:"transparent"),borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>ECHUS (infraction possible)</div><div style={{fontSize:18,fontWeight:800,color:T.red}}>{echus.length}</div></div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Total au registre</div><div style={{fontSize:18,fontWeight:800,color:T.navy}}>{avis.length}</div></div>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {[{id:"actifs",l:"En cours ("+actifs.length+")"},{id:"echus",l:"Echus ("+echus.length+")"},{id:"corrige",l:"Corriges"},{id:"infraction_emise",l:"Infractions emises"},{id:"tous",l:"Tous ("+avis.length+")"}].map(function(f){
            var a=filtre===f.id;
            return <button key={f.id} onClick={function(){setFiltre(f.id);}} style={{background:a?T.navy:T.surface,border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:700,color:a?"#fff":T.muted,cursor:"pointer",fontFamily:"inherit"}}>{f.l}</button>;
          })}
        </div>

        {showForm&&(
          <div style={{background:T.surface,border:"2px solid "+T.navy+"33",borderRadius:12,padding:20,marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:12}}>Emettre un avis de non-conformite</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
              <div><Lbl l="Unite visee" req/><select value={nf.unite} onChange={function(e){setN("unite",e.target.value);}} style={INP}>
                <option value="">Choisir...</option>
                {unites.map(function(u){return <option key={u.id} value={u.no_unite}>{u.no_unite}</option>;})}
              </select></div>
              <div><Lbl l="Date de l avis"/><input type="date" value={nf.date_avis} onChange={function(e){setN("date_avis",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Echeance pour corriger" req/><input type="date" value={nf.echeance} onChange={function(e){setN("echeance",e.target.value);}} style={INP}/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Objet" req/><input value={nf.objet} onChange={function(e){setN("objet",e.target.value);}} style={INP} placeholder="ex: Bruit excessif apres 22 h / animal non declare / objet sur le balcon..."/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Article du reglement vise"/><input value={nf.article_reglement} onChange={function(e){setN("article_reglement",e.target.value);}} style={INP} placeholder="ex: Art. 12.3 du reglement de l immeuble - Animaux"/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Description des faits"/><textarea value={nf.description} onChange={function(e){setN("description",e.target.value);}} style={Object.assign({},INP,{minHeight:60,resize:"vertical"})} placeholder="Dates, faits constates, plaintes recues..."/></div>
            </div>
            {nf.unite&&(
              <div style={{background:T.blueL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.blue,fontWeight:600,marginBottom:10}}>
                Destinataire(s): {coprosDeUnite(nf.unite).map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(", ")||"aucun coproprietaire trouve pour cette unite"}
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={creerAvis} dis={saving}>{saving?"Emission...":"Emettre l avis"}</Btn>
              <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowForm(false);setErr("");}}>Annuler</Btn>
            </div>
          </div>
        )}

        {listeAff.length===0&&!showForm&&(
          <div style={{background:T.surface,border:"1px dashed "+T.border,borderRadius:12,padding:30,textAlign:"center",color:T.muted,fontSize:13}}>
            Aucun avis {filtre==="actifs"?"en cours":""} pour {sel.nom}.
          </div>
        )}

        {listeAff.map(function(a){
          var st=stInfo(a.statut);
          var echu=a.statut==="emis"&&a.echeance&&a.echeance<auj;
          return(
            <div key={a.id} style={{background:T.surface,border:"1px solid "+T.border,borderLeft:"4px solid "+(echu?T.red:st.c),borderRadius:10,padding:"12px 16px",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <span style={{background:echu?T.redL:st.bg,color:echu?T.red:st.c,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800,flexShrink:0}}>{echu?"ECHU":st.l}</span>
                {a.niveau==="infraction"&&<span style={{background:T.redL,color:T.red,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800}}>INFRACTION{a.montant_penalite?" - "+money(a.montant_penalite):""}</span>}
                <div style={{flex:1,minWidth:220}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.navy}}>Unite {a.unite} - {a.objet}</div>
                  <div style={{fontSize:11,color:T.muted}}>{a.destinataire_nom||""}{a.article_reglement?" - "+a.article_reglement:""}</div>
                  <div style={{fontSize:10,color:echu?T.red:T.muted,fontWeight:echu?700:400}}>Emis le {a.date_avis||""}{a.echeance?" - echeance "+a.echeance:""}{a.date_correction?" - corrige le "+a.date_correction:""}</div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>
                  <Btn sm bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){imprimerAvis(a);}}>Imprimer</Btn>
                  {a.statut==="emis"&&<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){marquerCorrige(a);}}>Marquer corrige</Btn>}
                  {a.statut==="emis"&&a.niveau!=="infraction"&&<Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){setInfractionPour(infractionPour===a.id?null:a.id);setPenalite("");}}>Emettre une infraction</Btn>}
                  {a.statut==="emis"&&<Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){annuler(a);}}>Annuler</Btn>}
                </div>
              </div>
              {infractionPour===a.id&&(
                <div style={{display:"flex",gap:10,alignItems:"flex-end",background:T.redL,borderRadius:8,padding:12,marginTop:10,flexWrap:"wrap"}}>
                  <div style={{width:200}}><Lbl l="Penalite ($) selon le reglement"/><input type="number" step="0.01" value={penalite} onChange={function(e){setPenalite(e.target.value);}} style={INP} placeholder="ex: 100.00"/></div>
                  <Btn bg={T.red} onClick={function(){emettreInfraction(a);}} dis={saving}>{saving?"Emission...":"Confirmer l avis d infraction"}</Btn>
                  <div style={{fontSize:10,color:T.muted}}>Cree un avis d infraction lie et marque l avis initial INFRACTION EMISE.</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
