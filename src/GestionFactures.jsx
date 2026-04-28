
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var STATUTS={recue:{l:"Recue",bg:"#EFF6FF",tc:"#1A56DB"},en_attente_approbation:{l:"En attente CA",bg:"#FEF3E2",tc:"#B86020"},approuvee:{l:"Approuvee",bg:"#D4EDDA",tc:"#155724"},rejetee:{l:"Rejetee",bg:"#F8D7DA",tc:"#721C24"},payee:{l:"Payee",bg:"#D4EDDA",tc:"#155724"},annulee:{l:"Annulee",bg:"#F0EDE8",tc:"#7C7568"}};
function StatutBadge(p){var s=STATUTS[p.s]||STATUTS.recue;return <span style={{background:s.bg,color:s.tc,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{s.l}</span>;}

var CODES_GL_DEPENSES=[
  {no:"5010",nom:"Honoraires - gestion"},
  {no:"5020",nom:"Honoraires - comptabilite"},
  {no:"5030",nom:"Honoraires - juridiques"},
  {no:"5040",nom:"Assurances - immeuble"},
  {no:"5050",nom:"Electricite - parties communes"},
  {no:"5060",nom:"Gaz naturel - chauffage"},
  {no:"5070",nom:"Eau et egouts"},
  {no:"5080",nom:"Entretien - menage et nettoyage"},
  {no:"5090",nom:"Entretien - deneigement"},
  {no:"5100",nom:"Entretien - espaces verts"},
  {no:"5110",nom:"Entretien - ascenseur"},
  {no:"5120",nom:"Entretien - piscine"},
  {no:"5130",nom:"Reparations - plomberie"},
  {no:"5140",nom:"Reparations - electricite"},
  {no:"5150",nom:"Reparations - structure"},
  {no:"5160",nom:"Securite - systeme alarme"},
  {no:"5170",nom:"Frais bancaires"},
  {no:"5180",nom:"Telephone et communications"},
  {no:"5190",nom:"Depenses diverses"},
  {no:"6010",nom:"Fonds prevoyance - toiture"},
  {no:"6020",nom:"Fonds prevoyance - fenetres"},
  {no:"6030",nom:"Fonds prevoyance - ascenseur"},
  {no:"6040",nom:"Fonds prevoyance - chauffage"},
  {no:"6050",nom:"Fonds prevoyance - autres"},
];

// Codification GL automatique par mots-cles
function codeGLAuto(fournisseur, description){
  var t=(fournisseur+" "+description).toLowerCase();
  if(t.includes("hydro")||t.includes("electri"))return "5050";
  if(t.includes("gaz")||t.includes("chauffage"))return "5060";
  if(t.includes("eau")||t.includes("aqueduc"))return "5070";
  if(t.includes("menage")||t.includes("nettoyage")||t.includes("cleaning"))return "5080";
  if(t.includes("deneig")||t.includes("neige")||t.includes("snow"))return "5090";
  if(t.includes("gazon")||t.includes("paysag")||t.includes("landscape"))return "5100";
  if(t.includes("ascenseur")||t.includes("elevator"))return "5110";
  if(t.includes("piscine")||t.includes("pool"))return "5120";
  if(t.includes("plomberie")||t.includes("plumber"))return "5130";
  if(t.includes("electrien")||t.includes("electricien"))return "5140";
  if(t.includes("toiture")||t.includes("toit")||t.includes("roof"))return "6010";
  if(t.includes("fenetre")||t.includes("window"))return "6020";
  if(t.includes("securite")||t.includes("alarme")||t.includes("security"))return "5160";
  if(t.includes("comptable")||t.includes("cpa")||t.includes("audit"))return "5020";
  if(t.includes("avocat")||t.includes("notaire")||t.includes("juridique"))return "5030";
  if(t.includes("gestion")||t.includes("management")||t.includes("administration"))return "5010";
  if(t.includes("assurance")||t.includes("insurance"))return "5040";
  if(t.includes("telephone")||t.includes("internet")||t.includes("bell")||t.includes("videotron"))return "5180";
  if(t.includes("banque")||t.includes("frais bancaire"))return "5170";
  return "5190";
}

function CarteFacture(p){
  var f=p.facture;
  var depasse=f.date_echeance&&new Date(f.date_echeance)<new Date()&&f.statut!=="payee"&&f.statut!=="annulee";
  return(
    <div style={{background:T.surface,border:"1px solid "+(depasse?T.red:T.border),borderRadius:12,padding:16,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
            <StatutBadge s={f.statut}/>
            {f.source==="email"&&<span style={{background:T.purpleL,color:T.purple,borderRadius:20,padding:"1px 8px",fontSize:9,fontWeight:700}}>COURRIEL</span>}
            {depasse&&<span style={{background:T.redL,color:T.red,borderRadius:20,padding:"1px 8px",fontSize:9,fontWeight:700}}>EN RETARD</span>}
          </div>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>{f.fournisseur_nom}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,fontSize:11,color:T.muted}}>
            {f.no_facture&&<div>No: <span style={{color:T.navy,fontWeight:600}}>{f.no_facture}</span></div>}
            <div>Date: <span style={{color:T.navy}}>{f.date_facture||"-"}</span></div>
            <div>Echeance: <span style={{color:depasse?T.red:T.navy,fontWeight:depasse?700:400}}>{f.date_echeance||"-"}</span></div>
            {f.no_compte_gl&&<div>GL: <span style={{color:T.accent,fontWeight:600}}>{f.no_compte_gl}</span></div>}
            {f.categorie_depense&&<div>Cat.: <span style={{color:T.navy}}>{f.categorie_depense}</span></div>}
            {f.source==="email"&&f.email_source&&<div>De: <span style={{color:T.purple}}>{f.email_source}</span></div>}
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0,marginLeft:16}}>
          <div style={{fontSize:20,fontWeight:800,color:T.navy}}>{Number(f.total||0).toFixed(2)} $</div>
          {f.tps>0&&<div style={{fontSize:10,color:T.muted}}>TPS: {Number(f.tps).toFixed(2)} $ | TVQ: {Number(f.tvq).toFixed(2)} $</div>}
          <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
            <Btn sm onClick={function(){p.onVoir(f);}}>Voir</Btn>
            {(f.statut==="recue"||f.statut==="en_attente_approbation")&&<Btn sm bg={T.amberL} tc={T.amber} bdr={"1px solid "+T.amber+"44"} onClick={function(){p.onApprouver(f);}}>Approuver</Btn>}
            {f.statut==="approuvee"&&<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){p.onPayer(f.id);}}>Marquer payee</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormFacture(p){
  var nf=p.nf;var sf=p.setField;
  var glSuggere=codeGLAuto(nf.fournisseur_nom||"",nf.description||"");
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={{gridColumn:"1/-1"}}><Lbl l="Fournisseur"/><input value={nf.fournisseur_nom||""} onChange={function(e){sf("fournisseur_nom",e.target.value);}} style={INP} placeholder="Nom de l entreprise..."/></div>
      <div><Lbl l="No facture"/><input value={nf.no_facture||""} onChange={function(e){sf("no_facture",e.target.value);}} style={INP} placeholder="INV-2024-001"/></div>
      <div><Lbl l="Date facture"/><input type="date" value={nf.date_facture||""} onChange={function(e){sf("date_facture",e.target.value);}} style={INP}/></div>
      <div><Lbl l="Date echeance"/><input type="date" value={nf.date_echeance||""} onChange={function(e){sf("date_echeance",e.target.value);}} style={INP}/></div>
      <div><Lbl l="Sous-total ($)"/><input type="number" step="0.01" value={nf.sous_total||""} onChange={function(e){var st=parseFloat(e.target.value)||0;var tps=Math.round(st*0.05*100)/100;var tvq=Math.round(st*0.09975*100)/100;sf("sous_total",st);sf("tps",tps);sf("tvq",tvq);sf("total",Math.round((st+tps+tvq)*100)/100);}} style={INP} placeholder="0.00"/></div>
      <div><Lbl l="TPS (5%)"/><input type="number" step="0.01" value={nf.tps||""} onChange={function(e){sf("tps",parseFloat(e.target.value)||0);}} style={INP}/></div>
      <div><Lbl l="TVQ (9.975%)"/><input type="number" step="0.01" value={nf.tvq||""} onChange={function(e){sf("tvq",parseFloat(e.target.value)||0);}} style={INP}/></div>
      <div><Lbl l="Total ($)"/><input type="number" step="0.01" value={nf.total||""} onChange={function(e){sf("total",parseFloat(e.target.value)||0);}} style={INP} placeholder="0.00"/></div>
      <div style={{gridColumn:"1/-1"}}>
        <Lbl l={"Compte GL - Suggere: "+glSuggere}/>
        <select value={nf.no_compte_gl||glSuggere} onChange={function(e){sf("no_compte_gl",e.target.value);}} style={INP}>
          {CODES_GL_DEPENSES.map(function(g){return <option key={g.no} value={g.no}>{g.no} - {g.nom}</option>;})}
        </select>
      </div>
      <div style={{gridColumn:"1/-1"}}><Lbl l="Description / notes"/><textarea value={nf.description||""} onChange={function(e){sf("description",e.target.value);}} style={Object.assign({},INP,{minHeight:60,resize:"vertical"})} placeholder="Description des travaux ou services..."/></div>
      <div><Lbl l="No TPS fournisseur"/><input value={nf.no_tps_fournisseur||""} onChange={function(e){sf("no_tps_fournisseur",e.target.value);}} style={INP} placeholder="123456789 RT0001"/></div>
      <div><Lbl l="No TVQ fournisseur"/><input value={nf.no_tvq_fournisseur||""} onChange={function(e){sf("no_tvq_fournisseur",e.target.value);}} style={INP} placeholder="1234567890 TQ0001"/></div>
    </div>
  );
}

function ModalApprobation(p){
  var f=p.facture;
  var s0=useState([]);var membres=s0[0];var setMembres=s0[1];
  var s1=useState([]);var approbations=s1[0];var setApprobations=s1[1];
  var s2=useState("");var commentaire=s2[0];var setCommentaire=s2[1];

  useEffect(function(){
    if(!f)return;
    if(p.syndicatId){
      sb.select("membres_ca",{eq:{syndicat_id:p.syndicatId,actif:true},order:"role_ca.asc"}).then(function(res){
        if(res&&res.data)setMembres(res.data);
      }).catch(function(){});
    }
    sb.select("approbations_ca",{eq:{facture_id:f.id},order:"date_decision.asc"}).then(function(res){
      if(res&&res.data)setApprobations(res.data);
    }).catch(function(){});
  },[f]);

  function voter(decision){
    var row={facture_id:f.id,decision:decision,commentaire:commentaire,membre_nom:"Vous"};
    sb.insert("approbations_ca",row).then(function(res){
      if(res&&res.data)setApprobations(function(prev){return prev.concat([res.data]);});
      var nbApprouves=approbations.filter(function(a){return a.decision==="approuve";}).length+(decision==="approuve"?1:0);
      var nbRequis=f.nb_approbations_requises||1;
      if(decision==="approuve"&&nbApprouves>=nbRequis){
        sb.update("factures",f.id,{statut:"approuvee",nb_approbations_recues:nbApprouves,date_approbation:new Date().toISOString()}).then(function(){
          p.onUpdate(f.id,"approuvee");
        }).catch(function(){});
      }else if(decision==="rejete"){
        sb.update("factures",f.id,{statut:"rejetee"}).then(function(){
          p.onUpdate(f.id,"rejetee");
        }).catch(function(){});
      }else{
        sb.update("factures",f.id,{nb_approbations_recues:nbApprouves}).catch(function(){});
      }
      setCommentaire("");
    }).catch(function(){});
  }

  if(!f)return null;
  var nbApprouves=approbations.filter(function(a){return a.decision==="approuve";}).length;
  var nbRequis=f.nb_approbations_requises||1;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div style={{background:T.surface,borderRadius:16,padding:24,width:"100%",maxWidth:560,maxHeight:"80vh",overflow:"auto"}}>
        <div style={{fontSize:15,fontWeight:800,color:T.navy,marginBottom:4}}>Approbation de facture</div>
        <div style={{fontSize:12,color:T.muted,marginBottom:16}}>{f.fournisseur_nom} - {Number(f.total||0).toFixed(2)} $</div>

        <div style={{background:T.alt,borderRadius:10,padding:14,marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12}}>
            <div><span style={{color:T.muted}}>No facture: </span>{f.no_facture||"-"}</div>
            <div><span style={{color:T.muted}}>Date: </span>{f.date_facture||"-"}</div>
            <div><span style={{color:T.muted}}>Echeance: </span>{f.date_echeance||"-"}</div>
            <div><span style={{color:T.muted}}>Compte GL: </span><span style={{color:T.accent,fontWeight:600}}>{f.no_compte_gl||"-"}</span></div>
            <div style={{gridColumn:"1/-1"}}><span style={{color:T.muted}}>Description: </span>{f.description||"-"}</div>
          </div>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:8}}>Progression ({nbApprouves}/{nbRequis} approbation(s))</div>
          <div style={{background:T.alt,borderRadius:20,height:8,overflow:"hidden",marginBottom:8}}>
            <div style={{height:"100%",width:Math.min(100,nbRequis>0?Math.round(nbApprouves/nbRequis*100):0)+"%",background:nbApprouves>=nbRequis?T.accent:T.amber,borderRadius:20,transition:"width 0.5s"}}/>
          </div>
          {approbations.map(function(a){return(
            <div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+T.border,fontSize:11}}>
              <span style={{fontWeight:600}}>{a.membre_nom||"Membre CA"}</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {a.commentaire&&<span style={{color:T.muted}}>{a.commentaire}</span>}
                <span style={{fontWeight:700,color:a.decision==="approuve"?T.accent:a.decision==="rejete"?T.red:T.amber}}>{a.decision==="approuve"?"Approuve":a.decision==="rejete"?"Rejete":"Info requise"}</span>
              </div>
            </div>
          );})}
        </div>

        {membres.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:8}}>Membres CA ({membres.length})</div>
            {membres.map(function(m){return(
              <div key={m.id} style={{fontSize:11,color:T.muted,padding:"4px 0"}}>{m.prenom} {m.nom} - {m.role_ca}</div>
            );})}
          </div>
        )}

        <div style={{marginBottom:12}}>
          <Lbl l="Commentaire (optionnel)"/>
          <input value={commentaire} onChange={function(e){setCommentaire(e.target.value);}} style={INP} placeholder="Raison de la decision..."/>
        </div>

        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn onClick={function(){voter("approuve");}} bg={T.accent}>Approuver</Btn>
          <Btn onClick={function(){voter("rejete");}} bg={T.red}>Rejeter</Btn>
          <Btn onClick={function(){voter("info_requise");}} bg={T.amber}>Demander info</Btn>
          <Btn onClick={p.onClose} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Fermer</Btn>
        </div>
      </div>
    </div>
  );
}

var VIDE_F={fournisseur_nom:"",no_facture:"",date_facture:"",date_echeance:"",sous_total:"",tps:"",tvq:"",total:"",no_compte_gl:"5190",description:"",no_tps_fournisseur:"",no_tvq_fournisseur:"",nb_approbations_requises:1};

export default function GestionFactures(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var factures=s2[0];var setFactures=s2[1];
  var s3=useState(false);var showForm=s3[0];var setShowForm=s3[1];
  var s4=useState(VIDE_F);var nf=s4[0];var setNf=s4[1];
  var s5=useState(null);var factureAppro=s5[0];var setFactureAppro=s5[1];
  var s6=useState("toutes");var filtreStatut=s6[0];var setFiltreStatut=s6[1];
  var s7=useState(false);var saving=s7[0];var setSaving=s7[1];
  var s8=useState("liste");var vue=s8[0];var setVue=s8[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    sb.select("factures",{eq:{syndicat_id:sel.id},order:"date_reception.desc",limit:100}).then(function(res){
      if(res&&res.data)setFactures(res.data);
    }).catch(function(){});
  },[sel]);

  function setField(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function sauvegarder(){
    if(!nf.fournisseur_nom||!sel)return;
    setSaving(true);
    var glFinal=nf.no_compte_gl||codeGLAuto(nf.fournisseur_nom,nf.description||"");
    var glNom=CODES_GL_DEPENSES.find(function(g){return g.no===glFinal;});
    var row={syndicat_id:sel.id,fournisseur_nom:nf.fournisseur_nom,no_facture:nf.no_facture||"",date_facture:nf.date_facture||null,date_echeance:nf.date_echeance||null,sous_total:parseFloat(nf.sous_total)||0,tps:parseFloat(nf.tps)||0,tvq:parseFloat(nf.tvq)||0,total:parseFloat(nf.total)||0,no_compte_gl:glFinal,categorie_depense:glNom?glNom.nom:"Depenses diverses",description:nf.description||"",no_tps_fournisseur:nf.no_tps_fournisseur||"",no_tvq_fournisseur:nf.no_tvq_fournisseur||"",source:"manuel",statut:parseFloat(nf.total||0)>1000?"en_attente_approbation":"approuvee",nb_approbations_requises:parseFloat(nf.total||0)>5000?2:1};
    sb.insert("factures",row).then(function(res){
      if(res&&res.data)setFactures(function(prev){return [res.data].concat(prev);});
      sb.log("factures","ajout","Facture ajoutee: "+nf.fournisseur_nom+" - "+nf.total+" $","GL: "+glFinal,sel.code||"");
      setShowForm(false);setNf(VIDE_F);setSaving(false);
    }).catch(function(){setSaving(false);});
  }

  function marquerPayee(id){
    sb.update("factures",id,{statut:"payee",date_paiement:new Date().toISOString().substring(0,10)}).then(function(){
      setFactures(function(prev){return prev.map(function(f){return f.id===id?Object.assign({},f,{statut:"payee"}):f;});});
    }).catch(function(){});
  }

  function updateStatut(id, statut){
    setFactures(function(prev){return prev.map(function(f){return f.id===id?Object.assign({},f,{statut:statut}):f;});});
    setFactureAppro(null);
  }

  var filtrees=factures.filter(function(f){return filtreStatut==="toutes"||f.statut===filtreStatut;});
  var totalEnAttente=factures.filter(function(f){return f.statut==="en_attente_approbation";}).reduce(function(a,f){return a+Number(f.total||0);},0);
  var totalApprouve=factures.filter(function(f){return f.statut==="approuvee";}).reduce(function(a,f){return a+Number(f.total||0);},0);
  var totalPaye=factures.filter(function(f){return f.statut==="payee";}).reduce(function(a,f){return a+Number(f.total||0);},0);

  var FILTRES=[{id:"toutes",l:"Toutes"},{id:"recue",l:"Recues"},{id:"en_attente_approbation",l:"En attente CA"},{id:"approuvee",l:"Approuvees"},{id:"payee",l:"Payees"},{id:"rejetee",l:"Rejetees"}];

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Gestion des factures</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <Btn sm bg="#ffffff18" bdr="1px solid #ffffff40" onClick={function(){setVue(vue==="liste"?"stats":"liste");}}>
            {vue==="liste"?"Stats":"Liste"}
          </Btn>
          <Btn onClick={function(){setNf(VIDE_F);setShowForm(true);}}>+ Ajouter facture</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:12,padding:14}}>
            <div style={{fontSize:11,color:T.muted}}>En attente approbation</div>
            <div style={{fontSize:22,fontWeight:800,color:T.amber}}>{factures.filter(function(f){return f.statut==="en_attente_approbation";}).length}</div>
            <div style={{fontSize:11,color:T.muted}}>{totalEnAttente.toFixed(0)} $</div>
          </div>
          <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:12,padding:14}}>
            <div style={{fontSize:11,color:T.muted}}>Approuvees a payer</div>
            <div style={{fontSize:22,fontWeight:800,color:T.accent}}>{factures.filter(function(f){return f.statut==="approuvee";}).length}</div>
            <div style={{fontSize:11,color:T.muted}}>{totalApprouve.toFixed(0)} $</div>
          </div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:14}}>
            <div style={{fontSize:11,color:T.muted}}>Payees ce mois</div>
            <div style={{fontSize:22,fontWeight:800,color:T.navy}}>{factures.filter(function(f){return f.statut==="payee"&&f.date_paiement&&f.date_paiement.substring(0,7)===new Date().toISOString().substring(0,7);}).length}</div>
            <div style={{fontSize:11,color:T.muted}}>{totalPaye.toFixed(0)} $</div>
          </div>
          <div style={{background:T.redL,border:"1px solid "+T.red+"44",borderRadius:12,padding:14}}>
            <div style={{fontSize:11,color:T.muted}}>En retard</div>
            <div style={{fontSize:22,fontWeight:800,color:T.red}}>{factures.filter(function(f){return f.date_echeance&&new Date(f.date_echeance)<new Date()&&f.statut!=="payee"&&f.statut!=="annulee";}).length}</div>
            <div style={{fontSize:11,color:T.muted}}>facture(s)</div>
          </div>
        </div>

        <div style={{background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:12,padding:14,marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:6}}>Courriel de reception des factures</div>
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,background:"#fff",borderRadius:8,padding:"6px 14px",border:"1px solid "+T.blue+"44"}}>
              factures@{sel?sel.code||"syndicat":"syndicat"}.predictek.ca
            </div>
            <div style={{fontSize:11,color:T.muted}}>Les fournisseurs envoient leurs factures directement a cette adresse. Claude les lit, extrait les donnees, code le GL et les place pour approbation automatiquement.</div>
          </div>
        </div>

        {showForm&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>Nouvelle facture</div>
            <FormFacture nf={nf} setField={setField}/>
            <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:8,padding:10,margin:"12px 0",fontSize:11,color:T.amber}}>
              Seuil d approbation: factures &gt; 1 000 $ requierent 1 approbation CA. &gt; 5 000 $ requierent 2 approbations.
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <Btn onClick={sauvegarder} dis={saving||!nf.fournisseur_nom}>{saving?"Sauvegarde...":"Sauvegarder"}</Btn>
              <Btn onClick={function(){setShowForm(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {FILTRES.map(function(f){var a=filtreStatut===f.id;return(
            <button key={f.id} onClick={function(){setFiltreStatut(f.id);}} style={{background:a?T.navy:"transparent",border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"5px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit",color:a?"#fff":T.muted,fontWeight:a?700:400}}>{f.l}</button>
          );})}
        </div>

        {filtrees.map(function(f){return(
          <CarteFacture key={f.id} facture={f}
            onVoir={function(){}}
            onApprouver={function(fac){setFactureAppro(fac);}}
            onPayer={marquerPayee}
          />
        );})}
        {filtrees.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucune facture dans cette categorie</div>}
      </div>

      {factureAppro&&(
        <ModalApprobation
          facture={factureAppro}
          syndicatId={sel?sel.id:null}
          onClose={function(){setFactureAppro(null);}}
          onUpdate={updateStatut}
        />
      )}
    </div>
  );
}
