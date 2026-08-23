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

// Formulaire d autorisation de travaux (memes cles que le portail coproprietaire)
var NATURES_TRAVAUX=[
  {k:"entrepreneurs",l:"Travaux qui necessitent un ou des entrepreneurs"},
  {k:"interieur",l:"Travaux d amelioration interieure"},
  {k:"structure",l:"Travaux qui affectent la structure, les murs exterieurs et/ou la toiture"},
  {k:"communes",l:"Travaux qui affectent les parties communes (terrains, arbres, rue privee)"},
  {k:"cheminee",l:"Travaux qui touchent la cheminee"},
  {k:"communes_restreint",l:"Travaux qui affectent les parties communes a usage restreint (balcon, trottoir, stationnement)"},
  {k:"plomberie",l:"Travaux qui touchent la plomberie"},
  {k:"electricite",l:"Travaux qui touchent le circuit electrique"},
  {k:"plafond",l:"Travaux qui touchent le plafond, la ventilation et/ou les murs"},
  {k:"permis",l:"Travaux qui necessitent un permis"}
];

function imprimerDemandeTravaux(t,syndic){
  var d=(t.donnees&&typeof t.donnees==="object")?t.donnees:{};
  var logo=(syndic&&syndic.logo_data)||"";
  if(!logo){try{logo=localStorage.getItem("predictek_logo")||"";}catch(e){}}
  var natures=(d.natures||[]).map(function(k){var n=NATURES_TRAVAUX.find(function(x){return x.k===k;});return n?n.l:k;});
  var lg=function(v){return (v||"").replace(/</g,"&lt;");};
  var ligne=function(lbl,val){return "<tr><td class='l'>"+lbl+"</td><td class='v'>"+lg(val)+"</td></tr>";};
  var statutTxt=t.statut==="resolu"||t.statut==="ferme"?"COMPLETEE":"EN COURS";
  var w=window.open("","_blank");
  if(!w)return;
  w.document.write("<html><head><title>Demande d autorisation de travaux</title><style>"
    +"body{font-family:ChiffresPredictek,Georgia,serif;color:#1C1A17;margin:36px;font-size:12px}"
    +".ent{display:flex;align-items:center;gap:14px;border-bottom:3px solid #1B5E3B;padding-bottom:12px;margin-bottom:6px}"
    +".ent img{height:52px}"
    +".ent .t1{font-size:19px;font-weight:bold;color:#13233A}"
    +".ent .t2{font-size:12px;color:#555}"
    +".syn{font-size:13px;font-weight:bold;color:#1B5E3B;margin:8px 0 14px}"
    +"h2{font-size:13px;background:#13233A;color:#fff;padding:6px 10px;border-radius:4px;margin:16px 0 6px}"
    +"table{width:100%;border-collapse:collapse}"
    +"td{border:1px solid #bbb;padding:6px 8px;vertical-align:top}"
    +"td.l{width:38%;background:#F5F3EE;font-weight:bold}"
    +".intro{background:#FEF3E2;border:1px solid #B86020;border-radius:6px;padding:9px 12px;font-size:11px;line-height:1.6}"
    +".eng{border:1px solid #bbb;border-radius:6px;padding:10px 12px;font-size:11px;line-height:1.7;margin-top:6px}"
    +"ul{margin:4px 0;padding-left:20px}li{margin-bottom:3px}"
    +".statut{float:right;font-size:11px;font-weight:bold;padding:3px 12px;border-radius:14px;border:2px solid "+(statutTxt==="COMPLETEE"?"#1B5E3B;color:#1B5E3B":"#B86020;color:#B86020")+"}"
    +"</style></head><body>"
    +"<div class='ent'>"+(logo?"<img src='"+logo+"'/>":"")+"<div><div class='t1'>Predictek</div><div class='t2'>Gestion de copropriete</div></div><div style='flex:1'></div><span class='statut'>"+statutTxt+"</span></div>"
    +"<div class='syn'>Syndicat: "+lg(syndic&&syndic.nom?syndic.nom:"")+(syndic&&syndic.adr?" - "+lg(syndic.adr)+(syndic.ville?", "+lg(syndic.ville):""):"")+"</div>"
    +"<div style='font-size:16px;font-weight:bold;margin-bottom:8px'>DEMANDE D AUTORISATION DE TRAVAUX</div>"
    +"<div class='intro'>Avant de commencer les travaux, l autorisation du conseil d administration est obligatoire. Des travaux realises sans autorisation peuvent etre sanctionnes et la remise en etat des lieux peut etre exigee aux frais du coproprietaire. Les renseignements de ce formulaire demeurent confidentiels; seuls les administrateurs du syndicat y ont acces. Tout changement a la demande initiale doit etre signale aux administrateurs.</div>"
    +"<h2>1. Renseignements sur le coproprietaire</h2><table>"
    +ligne("Nom du coproprietaire requerant",d.nom)
    +ligne("Adresse / unite",d.unite)
    +ligne("Telephone",d.telephone)
    +ligne("Date de la demande",d.dateDemande)
    +ligne("Travaux relies a une urgence?",d.urgence?"OUI":"Non")
    +"</table>"
    +"<h2>2. Renseignements sur les entrepreneurs (si applicable)</h2><table>"
    +ligne("Nom de ou des entrepreneurs",d.entNom)
    +ligne("Numero de licence RBQ",d.entRBQ)
    +ligne("Personne contact",d.entContact)
    +ligne("Telephone",d.entTel)
    +ligne("Courriel",d.entCourriel)
    +ligne("Police d assurance responsabilite civile",d.pieceAssurance?"Fournie (piece jointe au dossier)":"Non fournie")
    +ligne("Devis",d.pieceDevis?"Fourni (piece jointe au dossier)":"Non fourni")
    +"</table>"
    +"<h2>3. Nature des travaux</h2>"
    +(natures.length?"<ul>"+natures.map(function(n){return "<li>"+lg(n)+"</li>";}).join("")+"</ul>":"<div style='color:#777'>Aucune categorie cochee</div>")
    +"<h2>4. Description et calendrier</h2><table>"
    +ligne("Description detaillee (lieux, pieces, materiaux, impact sur le batiment)",d.description)
    +ligne("Impact sur les autres coproprietaires et mesures d attenuation",d.impact)
    +ligne("Date prevue - debut des travaux",d.dateDebut)
    +ligne("Date prevue - fin des travaux",d.dateFin)
    +"</table>"
    +"<h2>5. Engagement du coproprietaire</h2>"
    +"<div class='eng'>Je serai tenu responsable de tout dommage cause par mes entrepreneurs aux parties communes de l immeuble et je verrai a ce que les lieux communs soient laisses propres apres chaque journee de travail. Je m engage a permettre au representant du syndicat d inspecter les travaux realises. Si le syndicat le juge necessaire, je fournirai une expertise independante confirmant que les travaux respectent la declaration de copropriete (notamment pour l insonorisation). Je certifie que mes assurances personnelles couvrent les dommages en cas de sinistre.</div>"
    +"<table style='margin-top:10px'>"+ligne("Signature du coproprietaire (nom en lettres moulees)",d.signature)+ligne("Date",d.dateDemande)+"</table>"
    +(t.reponse?"<h2>Decision du syndicat</h2><div class='eng'>"+lg(t.reponse)+(t.date_reponse?"<br/><b>Date: "+String(t.date_reponse).substring(0,10)+"</b>":"")+"</div>":"")
    +"<div style='margin-top:18px;font-size:10px;color:#777'>Genere par Predictek - "+new Date().toLocaleDateString("fr-CA")+"</div>"
    +"</body></html>");
  w.document.close();
  setTimeout(function(){w.print();},400);
}
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
  var s10=useState([]);var gestionnaires=s10[0];var setGestionnaires=s10[1];
  var s11=useState([]);var membresCA=s11[0];var setMembresCA=s11[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(r){
      if(r&&r.data&&r.data.length>0){setSyndicats(r.data);setSel(r.data[0]);}
    }).catch(function(){});
    sb.select("usagers",{limit:200}).then(function(r){
      if(r&&r.data)setGestionnaires(r.data.filter(function(u){return u.actif!==false&&(u.role==="gestionnaire"||u.role==="admin");}));
    }).catch(function(){});
  },[]);

  function charger(){
    if(!sel)return;
    sb.select("tickets",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:500}).then(function(r){
      if(r&&r.data){
        setTickets(r.data);
        // Ouverture directe d un ticket clique depuis le Tableau CA
        try{
          var idOuvre=localStorage.getItem("predictek_ticket_ouvre");
          if(idOuvre){
            var tOuvre=r.data.find(function(t){return String(t.id)===idOuvre;});
            if(tOuvre){localStorage.removeItem("predictek_ticket_ouvre");setDetail(tOuvre);window.scrollTo(0,0);}
          }
        }catch(e){}
      }
      if(r&&r.error)setErr("Chargement impossible: "+(r.error.message||""));
    }).catch(function(){});
    sb.select("coproprietaires",{eq:{syndicat_id:sel.id},limit:2000}).then(function(r){
      if(r&&r.data)setCopros(r.data);
    }).catch(function(){});
    sb.select("membres_ca",{eq:{syndicat_id:sel.id,actif:true},limit:20}).then(function(r){
      if(r&&r.data)setMembresCA(r.data);
    }).catch(function(){});
  }
  useEffect(function(){setDetail(null);charger();},[sel&&sel.id]);

  function coproDe(t){
    return copros.find(function(c){return c.id===t.coproprietaire_id;})||null;
  }

  // Utilisateur courant (pour le verrou d assignation et l historique du ticket)
  var USER={};try{USER=JSON.parse(localStorage.getItem("predictek_user")||"{}")||{};}catch(e){}

  // Verrou: une fois le ticket ASSIGNE a une personne, seule cette personne (ou un admin)
  // peut y repondre, changer son statut ou le transferer. "Tous les membres du CA" = tout le monde.
  function estVerrouille(t){
    if(!t.assigne_nom||t.assigne_type==="ca_tous")return false;
    if((USER.role||"")==="admin")return false;
    return (USER.nom||"").trim().toLowerCase()!==(t.assigne_nom||"").trim().toLowerCase();
  }

  function majTicket(t,changes,logTxt,evenement){
    setSaving(true);setErr("");
    // Historique du ticket: chaque action est consignee (date, heure, usager, action)
    var hist=Array.isArray(t.historique)?t.historique.slice():[];
    hist.push({q:new Date().toISOString(),u:USER.nom||"Usager",a:evenement||logTxt});
    changes=Object.assign({},changes,{historique:hist});
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
    majTicket(t,ch,"Requete \""+(t.sujet||"").substring(0,60)+"\" (unite "+(t.unite||"")+"): statut -> "+st,"Statut change: "+st);
  }
  function changerPriorite(t,pr){
    majTicket(t,{priorite:pr},"Requete \""+(t.sujet||"").substring(0,60)+"\": priorite -> "+pr,"Priorite changee: "+pr);
  }
  function assigner(t,val){
    // val = "g:<index>" (gestionnaire), "ca_tous", "ca:<index>" (membre CA), "" (retirer)
    var ch={assigne_nom:"",assigne_courriel:"",assigne_type:""};
    if(val.indexOf("g:")===0){
      var g=gestionnaires[parseInt(val.slice(2))];
      if(g){ch.assigne_nom=((g.prenom||"")+" "+(g.nom||"")).trim();ch.assigne_courriel=g.courriel||"";ch.assigne_type="gestionnaire";}
    }else if(val==="ca_tous"){
      ch.assigne_nom="Tous les membres du CA";ch.assigne_courriel=membresCA.map(function(m){return m.courriel;}).filter(Boolean).join(", ").substring(0,300);ch.assigne_type="ca_tous";
    }else if(val.indexOf("ca:")===0){
      var m=membresCA[parseInt(val.slice(3))];
      if(m){ch.assigne_nom=((m.prenom||"")+" "+(m.nom||"")).trim();ch.assigne_courriel=m.courriel||"";ch.assigne_type="membre_ca";}
    }
    majTicket(t,ch,"Requete \""+(t.sujet||"").substring(0,60)+"\": assignee a "+(ch.assigne_nom||"personne (retiree)"),"Assignation: "+(ch.assigne_nom||"retiree"));
  }

  function envoyerReponse(t){
    if(!reponse.trim()){setErr("Ecrivez une reponse avant d envoyer.");return;}
    var ch={reponse:reponse.trim(),date_reponse:new Date().toISOString()};
    if(t.statut==="nouveau")ch.statut="en_cours";
    majTicket(t,ch,"Reponse envoyee a la requete \""+(t.sujet||"").substring(0,60)+"\" (unite "+(t.unite||"")+")","Reponse envoyee: "+reponse.trim().substring(0,120));
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
          var verrou=estVerrouille(t);
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

              {t.categorie==="travaux"&&t.donnees&&(function(){
                var d=typeof t.donnees==="object"?t.donnees:{};
                var natures=(d.natures||[]).map(function(k){var n=NATURES_TRAVAUX.find(function(x){return x.k===k;});return n?n.l:k;});
                var L=function(lb,v){return v?<div style={{display:"flex",gap:8,padding:"3px 0",borderBottom:"1px solid #DDD9CF66"}}><span style={{fontSize:10,fontWeight:700,color:T.muted,minWidth:190,textTransform:"uppercase"}}>{lb}</span><span style={{fontSize:12,color:T.text,flex:1}}>{v}</span></div>:null;};
                return(
                  <div style={{background:"#F8F7F3",border:"1px solid "+T.navy+"33",borderRadius:10,padding:14,marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase"}}>Formulaire - Demande d autorisation de travaux</div>
                      <Btn sm bg={T.navy} onClick={function(){imprimerDemandeTravaux(t,sel);}}>Imprimer le formulaire</Btn>
                    </div>
                    {L("Requerant",d.nom)}
                    {L("Telephone",d.telephone)}
                    {L("Urgence",d.urgence?"OUI":"Non")}
                    {L("Entrepreneur(s)",d.entNom)}
                    {L("Licence RBQ",d.entRBQ)}
                    {L("Contact entrepreneur",[d.entContact,d.entTel,d.entCourriel].filter(Boolean).join(" - "))}
                    {natures.length>0&&L("Nature des travaux",natures.join("; "))}
                    {L("Description",d.description)}
                    {L("Impact / mesures",d.impact)}
                    {L("Debut prevu",d.dateDebut)}
                    {L("Fin prevue",d.dateFin)}
                    {L("Signature",d.signature)}
                    <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                      {d.pieceAssurance&&<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){sb.lienFichier("preuves",d.pieceAssurance).then(function(u){if(u)window.open(u,"_blank");else setErr("Impossible d ouvrir la police d assurance.");});}}>Police d assurance de l entrepreneur</Btn>}
                      {d.pieceDevis&&<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){sb.lienFichier("preuves",d.pieceDevis).then(function(u){if(u)window.open(u,"_blank");else setErr("Impossible d ouvrir le devis.");});}}>Devis de l entrepreneur</Btn>}
                    </div>
                  </div>
                );
              })()}

              {t.reponse&&(
                <div style={{background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:8,padding:12,marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:800,color:T.blue,textTransform:"uppercase",marginBottom:4}}>Reponse du syndicat{t.date_reponse?" - "+fmtDate(t.date_reponse):""}</div>
                  <div style={{fontSize:12,color:T.text,whiteSpace:"pre-wrap"}}>{t.reponse}</div>
                </div>
              )}

              {verrou&&(
                <div style={{background:"#6B3FA015",border:"2px solid #6B3FA0",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#6B3FA0",fontWeight:700,marginBottom:12}}>
                  Ce ticket est ASSIGNE a {t.assigne_nom}. Seule cette personne (ou un administrateur Predictek) peut y repondre,
                  changer son statut ou le transferer a quelqu un d autre.
                </div>
              )}
              {!verrou&&<div style={{marginBottom:12}}>
                <Lbl l={t.reponse?"Modifier / completer la reponse (visible dans le portail du coproprietaire)":"Repondre (visible dans le portail du coproprietaire)"}/>
                <textarea value={reponse} onChange={function(e){setReponse(e.target.value);}} style={Object.assign({},INP,{minHeight:70,resize:"vertical"})} placeholder="Votre reponse au coproprietaire..."/>
                <div style={{marginTop:8}}><Btn onClick={function(){envoyerReponse(t);}} dis={saving||!reponse.trim()}>{saving?"Envoi...":"Enregistrer la reponse"}</Btn></div>
              </div>}

              <div style={{marginBottom:12,background:"#F8F7F3",border:"1px solid "+T.border,borderRadius:8,padding:"10px 12px"}}>
                <span style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",marginRight:8}}>{verrou?"Assigne a (seul "+(t.assigne_nom||"")+" peut transferer):":"Assigner / transferer a:"}</span>
                <select value={t.assigne_type==="gestionnaire"?"g:"+gestionnaires.findIndex(function(g){return ((g.prenom||"")+" "+(g.nom||"")).trim()===t.assigne_nom;}):t.assigne_type==="ca_tous"?"ca_tous":t.assigne_type==="membre_ca"?"ca:"+membresCA.findIndex(function(m){return ((m.prenom||"")+" "+(m.nom||"")).trim()===t.assigne_nom;}):""} onChange={function(e){assigner(t,e.target.value);}} disabled={saving||verrou} style={Object.assign({},INP,{width:300,display:"inline-block",opacity:verrou?0.6:1})}>
                  <option value="">Personne (non assigne)</option>
                  {gestionnaires.length>0&&<optgroup label="Gestionnaires Predictek">{gestionnaires.map(function(g,i){return <option key={"g"+i} value={"g:"+i}>{((g.prenom||"")+" "+(g.nom||"")).trim()+(g.courriel?" - "+g.courriel:"")}</option>;})}</optgroup>}
                  {membresCA.length>0&&<optgroup label="Conseil d administration"><option value="ca_tous">Tous les membres du CA</option>{membresCA.map(function(m,i){return <option key={"m"+i} value={"ca:"+i}>{((m.prenom||"")+" "+(m.nom||"")).trim()+(m.role_ca?" ("+m.role_ca+")":"")}</option>;})}</optgroup>}
                </select>
                {t.assigne_nom&&<span style={{marginLeft:10,background:"#6B3FA015",color:"#6B3FA0",borderRadius:20,padding:"3px 12px",fontSize:10,fontWeight:800}}>ASSIGNE: {t.assigne_nom}</span>}
              </div>

              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase"}}>Statut:</span>
                {STATUTS.filter(function(s){return s.id!==(t.statut||"nouveau");}).map(function(s){return <Btn key={s.id} sm bg={s.bg} tc={s.c} bdr={"1px solid "+s.c+"44"} onClick={function(){changerStatut(t,s.id);}} dis={saving||verrou}>{s.l}</Btn>;})}
              </div>
              <div style={{fontSize:10,color:T.muted,marginBottom:8}}>RESOLU = le probleme du coproprietaire est regle (avec la reponse envoyee). FERME = dossier classe sans intervention (doublon, non fonde, abandonne). Les deux arretent les rappels; seul le libelle change pour le coproprietaire.</div>

              {Array.isArray(t.historique)&&t.historique.length>0&&(
                <div style={{marginTop:12,background:"#F8F7F3",border:"1px solid "+T.border,borderRadius:10,padding:14}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase",marginBottom:8}}>Historique du ticket ({t.historique.length})</div>
                  {t.historique.slice().reverse().map(function(h,ix){
                    var quand=h.q?new Date(h.q).toLocaleString("fr-CA",{hour12:false}).replace(",","").substring(0,17):"-";
                    return(
                      <div key={ix} style={{display:"flex",gap:10,padding:"5px 0",borderTop:ix>0?"1px solid "+T.border:"none",fontSize:11,alignItems:"baseline"}}>
                        <span style={{color:T.muted,whiteSpace:"nowrap",fontWeight:600}}>{quand}</span>
                        <span style={{fontWeight:700,color:"#6B3FA0",whiteSpace:"nowrap"}}>{h.u||"?"}</span>
                        <span style={{color:T.text,flex:1}}>{h.a||""}</span>
                      </div>
                    );
                  })}
                  <div style={{fontSize:9,color:T.muted,marginTop:6}}>Creation du ticket: {fmtDate(t.created_at)} par le coproprietaire{c?" "+((c.prenom||"")+" "+(c.nom||"")).trim():""}.</div>
                </div>
              )}
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
              {t.categorie==="travaux"&&<span style={{background:T.navy,color:"#fff",borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800,flexShrink:0}}>TRAVAUX</span>}
              {t.assigne_nom&&<span style={{background:"#6B3FA015",color:"#6B3FA0",borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800,flexShrink:0}}>{t.assigne_nom}</span>}
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
