// Predictek - REGISTRE DE LA COPROPRIETE (art. 1070 C.c.Q.)
// Vue CONSOLIDEE en lecture seule de tout ce que le syndicat doit tenir a disposition
// des coproprietaires: noms et adresses des coproprietaires et locataires, PV et
// resolutions d assemblees, declaration et reglements, etats financiers et budgets,
// contrats, assurances, carnet d entretien. + Exports (impression complete, CSV).
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
var money=function(n){return (Number(n)||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

function imprimerHTML(titre, corpsHTML){
  var w=window.open("","_blank","width=900,height=700");
  if(!w)return;
  w.document.write("<html><head><title>"+titre+"</title><style>body{font-family:Georgia,serif;color:#1C1A17;margin:36px;font-size:13px}h1{font-size:19px;margin:0 0 2px}h2{font-size:14px;border-bottom:2px solid #13233A;padding-bottom:4px;margin-top:22px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #999;padding:5px 8px;font-size:11px;text-align:left}th{background:#EDEBE4}.tot{font-weight:bold;background:#E8F2EC}.muted{color:#666;font-size:11px}.right{text-align:right}pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:11px}</style></head><body>"+corpsHTML+"<script>window.print();</script></body></html>");
  w.document.close();
}

function telechargerCSV(nomFichier, lignes){
  // BOM pour qu Excel ouvre les accents correctement
  var contenu="\uFEFF"+lignes.map(function(l){return l.map(function(v){var s=String(v===null||v===undefined?"":v);return s.indexOf(";")>=0||s.indexOf("\"")>=0||s.indexOf("\n")>=0?"\""+s.replace(/"/g,"\"\"")+"\"":s;}).join(";");}).join("\r\n");
  var blob=new Blob([contenu],{type:"text/csv;charset=utf-8"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=nomFichier;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
}

var ROLES_CA={president:"President(e)",vice_president:"Vice-president(e)",secretaire:"Secretaire",tresorier:"Tresorier(e)",membre:"Membre"};

function Section(p){
  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,marginBottom:10,overflow:"hidden"}}>
      <div onClick={p.onToggle} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",cursor:"pointer",background:p.ouvert?T.alt:T.surface}}>
        <div>
          <span style={{fontSize:12,fontWeight:800,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em"}}>{p.titre}</span>
          <span style={{fontSize:11,color:T.muted,marginLeft:10}}>{p.sousTitre}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {p.actions}
          <span style={{fontSize:14,color:T.muted}}>{p.ouvert?"\u25B4":"\u25BE"}</span>
        </div>
      </div>
      {p.ouvert&&<div style={{padding:16,borderTop:"1px solid "+T.border}}>{p.children}</div>}
    </div>
  );
}

function TableSimple(p){
  return(
    <div style={{overflowX:"auto",maxHeight:p.h||400,overflowY:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{background:T.alt,position:"sticky",top:0}}>
          {p.cols.map(function(c){return <th key={c} style={{padding:"6px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",whiteSpace:"nowrap"}}>{c}</th>;})}
        </tr></thead>
        <tbody>
          {p.rows.map(function(r,i){return(
            <tr key={i} style={{borderTop:"1px solid "+T.border}}>
              {r.map(function(v,j){return <td key={j} style={{padding:"5px 10px",color:j===0?T.navy:T.text,fontWeight:j===0?700:400}}>{v}</td>;})}
            </tr>
          );})}
          {p.rows.length===0&&<tr><td colSpan={p.cols.length} style={{padding:16,textAlign:"center",color:T.muted,fontSize:12}}>{p.vide||"Aucune donnee"}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function Registre1070(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState({});var d=s2[0];var setD=s2[1];
  var s3=useState(false);var charge=s3[0];var setCharge=s3[1];
  var s4=useState({copros:true});var ouverts=s4[0];var setOuverts=s4[1];
  var s5=useState(false);var voirRegl=s5[0];var setVoirRegl=s5[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(r){
      if(r&&r.data&&r.data.length>0){setSyndicats(r.data);setSel(r.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setCharge(false);
    Promise.all([
      sb.select("coproprietaires",{eq:{syndicat_id:sel.id},order:"unite.asc",limit:2000}),
      sb.select("unites",{eq:{syndicat_id:sel.id},order:"no_unite.asc",limit:1000}),
      sb.select("membres_ca",{eq:{syndicat_id:sel.id,actif:true},order:"role_ca.asc",limit:50}),
      sb.select("documents",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:500}),
      sb.select("assemblees",{eq:{syndicat_id:sel.id},order:"date_assemblee.desc",limit:100}),
      sb.select("assemblees_votes",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:500}),
      sb.select("budgets_gl",{eq:{syndicat_id:sel.id},limit:1000}),
      sb.select("carnet_entretien",{eq:{syndicat_id:sel.id},limit:500}),
      sb.select("bons_travail",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:300}),
      sb.select("cotisations_speciales",{eq:{syndicat_id:sel.id},order:"date_vote.desc",limit:100})
    ]).then(function(rs){
      setD({
        copros:(rs[0]&&rs[0].data)||[],unites:(rs[1]&&rs[1].data)||[],ca:(rs[2]&&rs[2].data)||[],
        docs:((rs[3]&&rs[3].data)||[]).filter(function(x){return x.statut!=="supprime";}),assemblees:(rs[4]&&rs[4].data)||[],votes:(rs[5]&&rs[5].data)||[],
        budgets:(rs[6]&&rs[6].data)||[],carnet:(rs[7]&&rs[7].data)||[],bons:(rs[8]&&rs[8].data)||[],
        speciales:(rs[9]&&rs[9].data)||[]
      });
      setCharge(true);
    }).catch(function(){setCharge(true);});
  },[sel&&sel.id]);

  function bascule(k){setOuverts(function(pr){var n=Object.assign({},pr);n[k]=!n[k];return n;});}

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat - creez d abord un syndicat via Configuration.</div>;
  if(!sel)return null;

  var copros=(d.copros||[]).filter(function(c){return c.statut!=="ancien";});
  var anciens=(d.copros||[]).filter(function(c){return c.statut==="ancien";});
  var unites=d.unites||[];
  var locatives=unites.filter(function(u){return u.occupation==="locataire"||u.occupation==="court_terme"||u.occupation==="resident"||u.locataire;});
  function typeOcc(u){return u.occupation==="court_terme"?"Location court terme (identite non tenue)":u.occupation==="resident"?"Resident (non locataire)":"Locataire";}
  function nomOcc(u){return u.occupation==="court_terme"?"-":(u.nom_locataire||"-");}
  var pvs=(d.docs||[]).filter(function(x){return x.type_doc==="pv";});
  var assuranceDocs=(d.docs||[]).filter(function(x){return x.type_doc==="assurance";});
  var autresDocs=(d.docs||[]).filter(function(x){return x.type_doc!=="pv"&&x.type_doc!=="assurance";});
  var exercices=[];
  (d.budgets||[]).forEach(function(b){
    var e=exercices.find(function(x){return x.debut===b.exercice_debut;});
    if(!e){e={debut:b.exercice_debut,fin:b.exercice_fin,nb:0,total:0};exercices.push(e);}
    e.nb++;
    if(b.type_compte==="depense"||b.type_compte==="fonds")e.total+=parseFloat(b.montant)||0;
  });
  exercices.sort(function(a,b){return String(b.debut).localeCompare(String(a.debut));});

  function coprosDeUnite(u){
    return copros.filter(function(c){return (c.unite_id&&c.unite_id===u.id)||(!c.unite_id&&c.unite===u.no_unite);});
  }
  function uniteDe(c){
    return unites.find(function(u){return (c.unite_id&&u.id===c.unite_id)||(!c.unite_id&&u.no_unite===c.unite);})||{};
  }
  function urgenceDe(c){
    var u=uniteDe(c);
    if(!u.urg_nom&&!u.urg_tel)return "";
    return (u.urg_nom||"")+(u.urg_lien?" ("+u.urg_lien+")":"")+(u.urg_tel?" - "+u.urg_tel:"");
  }

  function voirDeclaration(){
    if(!sel.declaration_doc)return;
    sb.lienFichier("preuves",sel.declaration_doc).then(function(url){
      if(url)window.open(url,"_blank");
      else alert("Impossible de generer le lien du document (droits ou fichier manquant).");
    });
  }

  function exporterCoprosCSV(){
    var lignes=[["Unite","Fraction (%)","Nom","Prenom","Courriel","Telephone","Adresse","Stationnement","Rangement","Urgence - nom","Urgence - lien","Urgence - telephone","Urgence - courriel","Statut"]];
    copros.forEach(function(c){var u=uniteDe(c);lignes.push([c.unite||"",c.fraction||"",c.nom||"",c.prenom||"",c.courriel||"",c.telephone||"",c.adresse||"",u.stationnement||"",u.rangement||"",u.urg_nom||"",u.urg_lien||"",u.urg_tel||"",u.urg_courriel||"",c.statut||""]);});
    telechargerCSV("registre-coproprietaires-"+(sel.code||"syndicat")+".csv",lignes);
    sb.log("registre","export","Export CSV du registre des coproprietaires ("+copros.length+")","",sel.code||"");
  }

  function exporterLocatairesCSV(){
    var lignes=[["Unite","Type d occupation","Nom du locataire ou resident","Telephone","Courriel"]];
    locatives.forEach(function(u){lignes.push([u.no_unite||"",typeOcc(u),u.occupation==="court_terme"?"":(u.nom_locataire||""),u.tel_locataire||"",u.courriel_locataire||""]);});
    telechargerCSV("registre-locataires-"+(sel.code||"syndicat")+".csv",lignes);
    sb.log("registre","export","Export CSV du registre des locataires ("+locatives.length+")","",sel.code||"");
  }

  function imprimerRegistre(){
    var h="<h1>Registre de la copropriete (art. 1070 C.c.Q.)</h1>";
    h+="<div class='muted'>"+sel.nom+(sel.immat?" - NEQ "+sel.immat:"")+(sel.annee_constitution?" - constitue en "+sel.annee_constitution:"")+" - genere le "+new Date().toLocaleDateString("fr-CA")+" par Predictek</div>";

    h+="<h2>1. COPROPRIETAIRES ("+copros.length+")</h2><table><tr><th>Unite</th><th>Fraction</th><th>Nom</th><th>Courriel</th><th>Telephone</th><th>Stat.</th><th>Rang.</th><th>Urgence</th></tr>";
    copros.forEach(function(c){var uC=uniteDe(c);h+="<tr><td>"+(c.unite||"")+"</td><td class='right'>"+(c.fraction?Number(c.fraction).toFixed(3)+" %":"")+"</td><td>"+((c.prenom||"")+" "+(c.nom||"")).trim()+"</td><td>"+(c.courriel||"")+"</td><td>"+(c.telephone||"")+"</td><td>"+(uC.stationnement||"-")+"</td><td>"+(uC.rangement||"-")+"</td><td>"+(urgenceDe(c)||"-")+"</td></tr>";});
    h+="</table>";

    h+="<h2>2. LOCATAIRES, RESIDENTS ET OCCUPATION ("+locatives.length+" unite(s))</h2>";
    if(locatives.length===0)h+="<div class='muted'>Aucune unite louee ou occupee par un tiers.</div>";
    else{
      h+="<table><tr><th>Unite</th><th>Type</th><th>Locataire / resident</th><th>Telephone</th></tr>";
      locatives.forEach(function(u){h+="<tr><td>"+(u.no_unite||"")+"</td><td>"+typeOcc(u)+"</td><td>"+nomOcc(u)+"</td><td>"+(u.tel_locataire||"")+"</td></tr>";});
      h+="</table>";
    }

    h+="<h2>3. CONSEIL D ADMINISTRATION ("+(d.ca||[]).length+" membre(s) actif(s))</h2><table><tr><th>Role</th><th>Nom</th><th>Courriel</th><th>Debut de mandat</th></tr>";
    (d.ca||[]).forEach(function(m){h+="<tr><td>"+(ROLES_CA[m.role_ca]||m.role_ca||"Membre")+"</td><td>"+((m.prenom||"")+" "+(m.nom||"")).trim()+"</td><td>"+(m.courriel||"")+"</td><td>"+(m.date_debut_mandat||"")+"</td></tr>";});
    h+="</table>";

    h+="<h2>4. DECLARATION DE COPROPRIETE ET REGLEMENTS</h2>";
    h+="<div class='muted'>"+(sel.declaration_doc?"Acte complet conserve dans Predictek (Documents du syndicat).":"Declaration non televersee.")+(sel.quorum_ago?" Quorum d assemblee: "+sel.quorum_ago+" %.":"")+"</div>";
    if(sel.reglements_resume)h+="<pre>"+String(sel.reglements_resume).replace(/</g,"&lt;")+"</pre>";

    h+="<h2>5. ASSEMBLEES, PROCES-VERBAUX ET RESOLUTIONS</h2>";
    h+="<table><tr><th>Date</th><th>Type</th><th>Statut</th><th>Lieu</th></tr>";
    (d.assemblees||[]).forEach(function(a){h+="<tr><td>"+(a.date_assemblee||"")+"</td><td>"+(a.type||"")+"</td><td>"+(a.statut||"")+"</td><td>"+(a.lieu||"")+"</td></tr>";});
    if((d.assemblees||[]).length===0)h+="<tr><td colspan='4' class='muted'>Aucune assemblee enregistree</td></tr>";
    h+="</table>";
    if((d.votes||[]).length>0){
      h+="<table><tr><th>Resolution</th><th class='right'>Pour</th><th class='right'>Contre</th><th class='right'>Abst.</th><th>Resultat</th></tr>";
      (d.votes||[]).forEach(function(v){h+="<tr><td>"+(v.resolution||"")+"</td><td class='right'>"+(v.pour||0)+" %</td><td class='right'>"+(v.contre||0)+" %</td><td class='right'>"+(v.abstention||0)+" %</td><td>"+(v.adopte?"ADOPTEE":"REJETEE")+"</td></tr>";});
      h+="</table>";
    }
    if(pvs.length>0){
      h+="<table><tr><th>Proces-verbal</th><th>Date</th></tr>";
      pvs.forEach(function(x){h+="<tr><td>"+(x.nom||"")+"</td><td>"+(x.date_doc||"")+"</td></tr>";});
      h+="</table>";
    }

    h+="<h2>6. BUDGETS ET ETATS FINANCIERS</h2>";
    if(exercices.length===0)h+="<div class='muted'>Aucun budget enregistre.</div>";
    else{
      h+="<table><tr><th>Exercice</th><th class='right'>Lignes budgetaires</th><th class='right'>Depenses + apports budgetes</th></tr>";
      exercices.forEach(function(e){h+="<tr><td>"+e.debut+" au "+(e.fin||"")+"</td><td class='right'>"+e.nb+"</td><td class='right'>"+money(e.total)+"</td></tr>";});
      h+="</table><div class='muted'>Le detail budget vs reel est disponible dans Budget et comptabilite, onglet Etats financiers.</div>";
    }
    if((d.speciales||[]).length>0){
      h+="<table><tr><th>Cotisation speciale</th><th>Date du vote</th><th class='right'>Montant total</th></tr>";
      (d.speciales||[]).forEach(function(cs){h+="<tr><td>"+(cs.titre||"")+"</td><td>"+(cs.date_vote||"")+"</td><td class='right'>"+money(cs.montant_total)+"</td></tr>";});
      h+="</table>";
    }

    h+="<h2>7. ASSURANCES</h2>";
    h+="<div class='muted'>Police du syndicat: "+(sel.assurance_syndicat_exp?"expiration le "+sel.assurance_syndicat_exp:"expiration non renseignee")+". "+assuranceDocs.length+" document(s) d assurance au dossier.</div>";

    h+="<h2>8. CARNET D ENTRETIEN ET TRAVAUX</h2>";
    h+="<div class='muted'>"+(d.carnet||[]).length+" element(s) au carnet d entretien - "+(d.bons||[]).length+" bon(s) de travail.</div>";

    h+="<h2>9. AUTRES DOCUMENTS AU REGISTRE ("+autresDocs.length+")</h2>";
    if(autresDocs.length>0){
      h+="<table><tr><th>Document</th><th>Type</th><th>Date</th></tr>";
      autresDocs.forEach(function(x){h+="<tr><td>"+(x.nom||"")+"</td><td>"+(x.type_doc||"")+"</td><td>"+(x.date_doc||"")+"</td></tr>";});
      h+="</table>";
    }

    h+="<div class='muted' style='margin-top:20px'>Ce registre est tenu conformement a l article 1070 du Code civil du Quebec et doit etre mis a la disposition des coproprietaires.</div>";
    imprimerHTML("Registre 1070 - "+sel.nom,h);
    sb.log("registre","impression","Registre 1070 imprime","",sel.code||"");
  }

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Registre de la copropriete</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Article 1070 C.c.Q. - a la disposition des coproprietaires</div>
        </div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{marginLeft:"auto"}}>
          <Btn onClick={imprimerRegistre} dis={!charge}>Imprimer le registre complet</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        {!charge&&<div style={{background:T.blueL,borderRadius:10,padding:14,fontSize:12,color:T.blue,fontWeight:600,marginBottom:12}}>Chargement du registre...</div>}

        <Section titre="1. Coproprietaires" sousTitre={copros.length+" actif(s)"+(anciens.length>0?" - "+anciens.length+" ancien(s)":"")} ouvert={!!ouverts.copros} onToggle={function(){bascule("copros");}}
          actions={<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(e){e.stopPropagation();exporterCoprosCSV();}}>Exporter CSV</Btn>}>
          <TableSimple cols={["Unite","Fraction","Nom","Courriel","Telephone","Stationnement","Rangement","Urgence"]}
            rows={copros.map(function(c){var u=uniteDe(c);return [c.unite||"",c.fraction?Number(c.fraction).toFixed(3)+" %":"",((c.prenom||"")+" "+(c.nom||"")).trim(),c.courriel||"",c.telephone||"",u.stationnement||"-",u.rangement||"-",urgenceDe(c)||"-"];})}
            vide="Aucun coproprietaire"/>
        </Section>

        <Section titre="2. Locataires, residents et occupation" sousTitre={locatives.length+" unite(s) occupee(s) par un tiers sur "+unites.length} ouvert={!!ouverts.loc} onToggle={function(){bascule("loc");}}
          actions={<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(e){e.stopPropagation();exporterLocatairesCSV();}}>Exporter CSV</Btn>}>
          <TableSimple cols={["Unite","Type","Locataire","Telephone","Proprietaire(s)"]}
            rows={locatives.map(function(u){return [u.no_unite||"",typeOcc(u),nomOcc(u),u.tel_locataire||"",coprosDeUnite(u).map(function(c){return ((c.prenom||"")+" "+(c.nom||"")).trim();}).join(", ")];})}
            vide="Aucune unite louee ou occupee par un tiers"/>
        </Section>

        <Section titre="3. Conseil d administration" sousTitre={(d.ca||[]).length+" membre(s) actif(s)"} ouvert={!!ouverts.ca} onToggle={function(){bascule("ca");}}>
          <TableSimple cols={["Role","Nom","Courriel","Cellulaire","Debut de mandat"]}
            rows={(d.ca||[]).map(function(m){return [ROLES_CA[m.role_ca]||m.role_ca||"Membre",((m.prenom||"")+" "+(m.nom||"")).trim(),m.courriel||"",m.cellulaire||"",m.date_debut_mandat||""];})}
            vide="Aucun membre du CA"/>
        </Section>

        <Section titre="4. Declaration et reglements" sousTitre={sel.declaration_doc?"Acte complet au dossier":"Declaration non televersee"} ouvert={!!ouverts.decl} onToggle={function(){bascule("decl");}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
            {sel.declaration_doc&&<Btn sm onClick={voirDeclaration}>Voir l acte complet</Btn>}
            {sel.reglements_resume&&<Btn sm bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){setVoirRegl(!voirRegl);}}>{voirRegl?"Masquer le resume des reglements":"Voir le resume des reglements"}</Btn>}
          </div>
          <div style={{fontSize:11,color:T.muted}}>
            {sel.annee_constitution?"Constitution: "+sel.annee_constitution+". ":""}
            {sel.immat?"NEQ: "+sel.immat+". ":""}
            {sel.quorum_ago?"Quorum d assemblee: "+sel.quorum_ago+" %. ":""}
            {sel.exercice?"Exercice financier: "+sel.exercice+".":""}
          </div>
          {voirRegl&&sel.reglements_resume&&<pre style={{whiteSpace:"pre-wrap",fontFamily:"inherit",fontSize:11,color:T.text,background:T.alt,borderRadius:8,padding:12,marginTop:10,maxHeight:400,overflowY:"auto"}}>{sel.reglements_resume}</pre>}
          {!sel.declaration_doc&&!sel.reglements_resume&&<div style={{fontSize:12,color:T.muted}}>Televersez la declaration lors de la configuration du syndicat pour l ajouter au registre.</div>}
        </Section>

        <Section titre="5. Assemblees, PV et resolutions" sousTitre={(d.assemblees||[]).length+" assemblee(s) - "+(d.votes||[]).length+" resolution(s) - "+pvs.length+" PV"} ouvert={!!ouverts.asb} onToggle={function(){bascule("asb");}}>
          <TableSimple cols={["Date","Type","Statut","Lieu"]}
            rows={(d.assemblees||[]).map(function(a){return [a.date_assemblee||"",a.type||"",a.statut||"",a.lieu||""];})}
            vide="Aucune assemblee enregistree" h={200}/>
          {(d.votes||[]).length>0&&(
            <div style={{marginTop:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T.navy,marginBottom:6}}>Resolutions votees</div>
              <TableSimple cols={["Resolution","Pour","Contre","Abst.","Resultat"]}
                rows={(d.votes||[]).map(function(v){return [v.resolution||"",(v.pour||0)+" %",(v.contre||0)+" %",(v.abstention||0)+" %",v.adopte?"ADOPTEE":"REJETEE"];})} h={200}/>
            </div>
          )}
          {pvs.length>0&&(
            <div style={{marginTop:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T.navy,marginBottom:6}}>Proces-verbaux archives</div>
              <TableSimple cols={["Document","Date"]} rows={pvs.map(function(x){return [x.nom||"",x.date_doc||""];})} h={160}/>
            </div>
          )}
        </Section>

        <Section titre="6. Budgets et etats financiers" sousTitre={exercices.length+" exercice(s) budgete(s)"+((d.speciales||[]).length>0?" - "+(d.speciales||[]).length+" cotisation(s) speciale(s)":"")} ouvert={!!ouverts.bud} onToggle={function(){bascule("bud");}}>
          <TableSimple cols={["Exercice","Lignes budgetaires","Depenses + apports budgetes"]}
            rows={exercices.map(function(e){return [e.debut+" au "+(e.fin||""),String(e.nb),money(e.total)];})}
            vide="Aucun budget enregistre"/>
          {(d.speciales||[]).length>0&&(
            <div style={{marginTop:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T.navy,marginBottom:6}}>Cotisations speciales</div>
              <TableSimple cols={["Titre","Date du vote","Montant total"]} rows={(d.speciales||[]).map(function(cs){return [cs.titre||"",cs.date_vote||"",money(cs.montant_total)];})} h={160}/>
            </div>
          )}
          <div style={{fontSize:10,color:T.muted,marginTop:8}}>Le detail budget vs reel se trouve dans Budget et comptabilite, onglet Etats financiers.</div>
        </Section>

        <Section titre="7. Assurances" sousTitre={(sel.assurance_syndicat_exp?"Police du syndicat: exp. "+sel.assurance_syndicat_exp:"Expiration non renseignee")+" - "+assuranceDocs.length+" document(s)"} ouvert={!!ouverts.ass} onToggle={function(){bascule("ass");}}>
          <TableSimple cols={["Document","Date","Description"]}
            rows={assuranceDocs.map(function(x){return [x.nom||"",x.date_doc||"",x.description||""];})}
            vide="Aucun document d assurance - ajoutez-les via le module Assurances"/>
          <div style={{fontSize:11,color:T.muted,marginTop:8}}>
            Assurances des unites: {unites.filter(function(u){return u.assurance_exp&&new Date(u.assurance_exp)>=new Date();}).length} valide(s), {unites.filter(function(u){return u.assurance_exp&&new Date(u.assurance_exp)<new Date();}).length} expiree(s), {unites.filter(function(u){return !u.assurance_exp;}).length} sans preuve.
          </div>
        </Section>

        <Section titre="8. Carnet d entretien et travaux" sousTitre={(d.carnet||[]).length+" element(s) au carnet - "+(d.bons||[]).length+" bon(s) de travail"} ouvert={!!ouverts.trav} onToggle={function(){bascule("trav");}}>
          <TableSimple cols={["Bon de travail","Statut","Fournisseur","Date"]}
            rows={(d.bons||[]).slice(0,50).map(function(b){return [b.titre||b.description||"",b.statut||"",b.fournisseur_nom||"",(b.created_at||"").substring(0,10)];})}
            vide="Aucun bon de travail" h={220}/>
          <div style={{fontSize:10,color:T.muted,marginTop:8}}>Le carnet d entretien detaille (Loi 16) se trouve dans le module Carnet entretien.</div>
        </Section>

        <Section titre="9. Autres documents" sousTitre={autresDocs.length+" document(s)"} ouvert={!!ouverts.docs} onToggle={function(){bascule("docs");}}>
          <TableSimple cols={["Document","Type","Date","Description"]}
            rows={autresDocs.map(function(x){return [x.nom||"",x.type_doc||"",x.date_doc||"",x.description||""];})}
            vide="Aucun autre document" h={260}/>
        </Section>
      </div>
    </div>
  );
}
