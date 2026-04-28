
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var TEMPLATES=[
  {
    id:"cotisation",
    l:"Avis de cotisation mensuelle",
    icon:"$",
    sujet:"Avis de cotisation - {mois} {annee} - Unite {unite}",
    corps:"Madame, Monsieur,\n\nVeuillez trouver ci-joint votre avis de cotisation mensuelle pour la periode de {mois} {annee}.\n\nMontant: {montant} $\nDate d echeance: {echeance}\nMode de paiement: {mode}\n\nPour toute question, contactez votre gestionnaire.\n\nCordialement,\nLe Conseil d administration\n{syndicat}"
  },
  {
    id:"convocation",
    l:"Convocation reunion CA",
    icon:"C",
    sujet:"Convocation - Reunion du Conseil d administration - {date}",
    corps:"Madame, Monsieur,\n\nVous etes convoque(e) a une reunion du Conseil d administration qui se tiendra:\n\nDate: {date}\nHeure: {heure}\nLieu: {lieu}\n\nOrdre du jour:\n{ordre_du_jour}\n\nVotre presence est importante pour le quorum.\n\nCordialement,\nLe Secretaire du CA\n{syndicat}"
  },
  {
    id:"retard",
    l:"Rappel paiement en retard",
    icon:"!",
    sujet:"RAPPEL - Paiement en retard - Unite {unite}",
    corps:"Madame, Monsieur,\n\nNous vous rappelons que votre cotisation du mois de {mois} est toujours en attente de paiement.\n\nMontant du: {montant} $\nDate d echeance initiale: {echeance}\n\nVeuillez regulariser votre situation dans les plus brefs delais.\nDes frais de retard pourraient s appliquer apres 30 jours.\n\nCordialement,\nLe Conseil d administration\n{syndicat}"
  },
  {
    id:"bienvenue",
    l:"Lettre de bienvenue coproprietaire",
    icon:"B",
    sujet:"Bienvenue dans votre syndicat de copropriete - Unite {unite}",
    corps:"Madame, Monsieur,\n\nAu nom du Conseil d administration, nous vous souhaitons la bienvenue dans notre syndicat.\n\nVos informations de connexion au portail coproprietaire:\nNumero d unite: {unite}\nCode d acces: {code_acces}\nPortail: https://app.predictek.ca\n\nVotre cotisation mensuelle est de {montant} $.\n\nN hesitez pas a nous contacter pour toute question.\n\nCordialement,\nLe Conseil d administration\n{syndicat}"
  },
  {
    id:"ago",
    l:"Convocation Assemblee generale (AGO)",
    icon:"A",
    sujet:"CONVOCATION - Assemblee generale ordinaire {annee} - {syndicat}",
    corps:"Madame, Monsieur,\n\nConformement a la declaration de copropriete et a la Loi sur la copropriete divise, vous etes convoque(e) a l assemblee generale ordinaire annuelle:\n\nDate: {date}\nHeure: {heure}\nLieu: {lieu}\n\nOrdre du jour:\n1. Ouverture de l assemblee et verification du quorum\n2. Adoption de l ordre du jour\n3. Adoption du proces-verbal de la derniere AGO\n4. Rapport annuel du Conseil d administration\n5. Adoption des etats financiers\n6. Adoption du budget\n7. Election des administrateurs\n8. Divers\n9. Fermeture de l assemblee\n\nNote: Le quorum est de {quorum}% des voix.\n\nCordialement,\nLe Secretaire du CA\n{syndicat}"
  },
];

function TemplateCard(p){
  var t=p.tmpl;var sel=p.sel;
  return(
    <button onClick={function(){p.onSelect(t);}} style={{background:sel?T.accentL:T.surface,border:"2px solid "+(sel?T.accent:T.border),borderRadius:10,padding:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%",marginBottom:8}}>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{width:30,height:30,borderRadius:6,background:sel?T.accent:T.alt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:sel?"#fff":T.muted,flexShrink:0}}>{t.icon}</div>
        <div style={{fontSize:12,fontWeight:sel?700:600,color:sel?T.accent:T.navy}}>{t.l}</div>
      </div>
    </button>
  );
}

function HistoriqueEnvois(p){
  var envois=p.envois||[];
  return(
    <div>
      <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>Historique des envois</div>
      {envois.length===0&&<div style={{textAlign:"center",padding:20,color:T.muted,fontSize:12}}>Aucun envoi pour ce syndicat</div>}
      {envois.map(function(e){return(
        <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 14px",background:T.surface,border:"1px solid "+T.border,borderRadius:8,marginBottom:6}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:T.navy,marginBottom:2}}>{e.sujet}</div>
            <div style={{fontSize:10,color:T.muted}}>{e.destinataires} destinataire(s) - {e.created_at?e.created_at.substring(0,16).replace("T"," "):"-"}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0,marginLeft:10}}>
            <span style={{background:e.statut==="envoye"?T.accentL:e.statut==="erreur"?T.redL:T.amberL,color:e.statut==="envoye"?T.accent:e.statut==="erreur"?T.red:T.amber,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{e.statut==="envoye"?"Envoye":e.statut==="erreur"?"Erreur":"En attente"}</span>
          </div>
        </div>
      );})}
    </div>
  );
}

export default function Communications(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var copros=s2[0];var setCopros=s2[1];
  var s3=useState(null);var tmpl=s3[0];var setTmpl=s3[1];
  var s4=useState("compose");var vue=s4[0];var setVue=s4[1];
  var s5=useState([]);var envois=s5[0];var setEnvois=s5[1];
  var s6=useState({sujet:"",corps:"",destinataires:"tous"});var msg=s6[0];var setMsg=s6[1];
  var s7=useState(false);var sending=s7[0];var setSending=s7[1];
  var s8=useState("");var sendResult=s8[0];var setSendResult=s8[1];
  var s9=useState("");var sgKey=s9[0];var setSgKey=s9[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
    try{var k=localStorage.getItem("predictek_sg_key");if(k)setSgKey(k);}catch(e){}
  },[]);

  useEffect(function(){
    if(!sel)return;
    setCopros([]);
    sb.select("coproprietaires",{eq:{syndicat_id:sel.id,statut:"actif"},order:"unite.asc"}).then(function(res){
      if(res&&res.data)setCopros(res.data);
    }).catch(function(){});
    sb.select("historique",{eq:{syndicat_code:sel.code,categorie:"communication"},order:"created_at.desc",limit:20}).then(function(res){
      if(res&&res.data)setEnvois(res.data.map(function(h){return {id:h.id,sujet:h.action,destinataires:h.details||"",statut:"envoye",created_at:h.created_at};}));
    }).catch(function(){});
  },[sel]);

  function selTemplate(t){
    setTmpl(t);
    var sujet=t.sujet.replace("{syndicat}",sel?sel.nom:"").replace("{mois",new Date().toLocaleDateString("fr-CA",{month:"long"})).replace("{annee}",new Date().getFullYear()).replace("{date}","").replace("{unite}","UNITE");
    var corps=t.corps.replace(/\{syndicat\}/g,sel?sel.nom:"").replace(/\{annee\}/g,new Date().getFullYear()).replace(/\{quorum\}/g,"25");
    setMsg(function(pr){return Object.assign({},pr,{sujet:sujet,corps:corps});});
  }

  function setM(k,v){setMsg(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function envoyerSimule(){
    if(!msg.sujet||!msg.corps)return;
    setSending(true);setSendResult("");
    var destinataires=msg.destinataires==="tous"?copros:copros.filter(function(c){return c.pap;});
    var nbEnv=destinataires.length||1;
    setTimeout(function(){
      setSendResult("Simulation: "+nbEnv+" courriel(s) envoye(s) avec succes. Configurez votre cle SendGrid pour un envoi reel.");
      sb.log("communication","envoi",msg.sujet,nbEnv+" destinataires",sel?sel.code:"");
      setSending(false);
    },1500);
  }

  function envoyerSendGrid(){
    if(!sgKey){setSendResult("Entrez votre cle API SendGrid ci-dessous.");return;}
    if(!msg.sujet||!msg.corps)return;
    setSending(true);setSendResult("");
    var destinataires=msg.destinataires==="tous"?copros:copros.filter(function(c){return c.pap;});
    var emails=destinataires.filter(function(c){return c.courriel;}).map(function(c){return {email:c.courriel,name:c.nom};});
    if(emails.length===0){setSendResult("Aucun courriel configure pour les destinataires selectionnes.");setSending(false);return;}
    fetch("https://api.sendgrid.com/v3/mail/send",{
      method:"POST",
      headers:{"Authorization":"Bearer "+sgKey,"Content-Type":"application/json"},
      body:JSON.stringify({
        personalizations:emails.map(function(e){return {to:[e]};}),
        from:{email:"noreply@predictek.ca",name:"Predictek - "+((sel?sel.nom:"")||"Syndicat")},
        subject:msg.sujet,
        content:[{type:"text/plain",value:msg.corps}]
      })
    }).then(function(res){
      if(res.status===202){
        setSendResult("Envoye avec succes a "+emails.length+" destinataire(s)!");
        try{localStorage.setItem("predictek_sg_key",sgKey);}catch(e){}
        sb.log("communication","envoi",msg.sujet,emails.length+" destinataires",sel?sel.code:"");
        setEnvois(function(prev){return [{id:Date.now(),sujet:msg.sujet,destinataires:emails.length,statut:"envoye",created_at:new Date().toISOString()}].concat(prev);});
      }else{
        res.json().then(function(d){setSendResult("Erreur SendGrid: "+(d.errors?d.errors[0].message:"Erreur inconnue"));}).catch(function(){setSendResult("Erreur lors de l envoi.");});
      }
      setSending(false);
    }).catch(function(e){setSendResult("Erreur reseau: "+e.message);setSending(false);});
  }

  var destCount=msg.destinataires==="tous"?copros.length:copros.filter(function(c){return c.pap;}).length;

  var TABS=[{id:"compose",l:"Composer"},{id:"historique",l:"Historique"}];

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Communications</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
          {TABS.map(function(t){var a=vue===t.id;return <button key={t.id} onClick={function(){setVue(t.id);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",padding:"6px 14px",color:a?"#fff":"#8da0bb",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:400}}>{t.l}</button>;})}
        </div>
      </div>

      <div style={{padding:20}}>
        {vue==="historique"&&<HistoriqueEnvois envois={envois}/>}

        {vue==="compose"&&(
          <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:20}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:10}}>Templates</div>
              {TEMPLATES.map(function(t){return <TemplateCard key={t.id} tmpl={t} sel={tmpl&&tmpl.id===t.id} onSelect={selTemplate}/>;})}
            </div>

            <div>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:16}}>
                <div style={{marginBottom:12}}>
                  <Lbl l="Sujet du courriel"/>
                  <input value={msg.sujet} onChange={function(e){setM("sujet",e.target.value);}} style={INP} placeholder="Objet du courriel..."/>
                </div>
                <div style={{marginBottom:12}}>
                  <Lbl l="Corps du message"/>
                  <textarea value={msg.corps} onChange={function(e){setM("corps",e.target.value);}} style={Object.assign({},INP,{minHeight:200,resize:"vertical",fontFamily:"Arial,sans-serif",lineHeight:1.6})} placeholder="Contenu du courriel..."/>
                </div>
                <div style={{marginBottom:16}}>
                  <Lbl l="Destinataires"/>
                  <select value={msg.destinataires} onChange={function(e){setM("destinataires",e.target.value);}} style={Object.assign({},INP,{width:280})}>
                    <option value="tous">Tous les coproprietaires ({copros.length})</option>
                    <option value="pap">Inscrits PAP seulement ({copros.filter(function(c){return c.pap;}).length})</option>
                    <option value="retard">En retard de paiement</option>
                  </select>
                  <div style={{fontSize:11,color:T.muted,marginTop:4}}>{destCount} destinataire(s) selectionne(s)</div>
                </div>

                {sendResult&&<div style={{background:sendResult.includes("succes")||sendResult.includes("Simulation")?T.accentL:T.redL,border:"1px solid "+(sendResult.includes("succes")||sendResult.includes("Simulation")?T.accent:T.red)+"44",borderRadius:8,padding:"10px 14px",fontSize:12,color:sendResult.includes("succes")||sendResult.includes("Simulation")?T.accent:T.red,marginBottom:12}}>{sendResult}</div>}

                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <Btn onClick={envoyerSimule} dis={sending||!msg.sujet}>{sending?"Envoi...":"Tester (simulation)"}</Btn>
                  <Btn onClick={envoyerSendGrid} dis={sending||!msg.sujet} bg={T.blue}>{sending?"Envoi...":"Envoyer via SendGrid"}</Btn>
                </div>
              </div>

              <div style={{background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:12,padding:16}}>
                <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:8}}>Configuration SendGrid</div>
                <div style={{fontSize:11,color:T.muted,marginBottom:10}}>Entrez votre cle API SendGrid pour activer l envoi reel. Elle sera sauvegardee localement.</div>
                <div style={{display:"flex",gap:8}}>
                  <input type="password" value={sgKey} onChange={function(e){setSgKey(e.target.value);}} style={Object.assign({},INP,{flex:1})} placeholder="SG.xxxxxxxxxxxxxxxxxx..."/>
                  <Btn sm onClick={function(){try{localStorage.setItem("predictek_sg_key",sgKey);}catch(e){}setSendResult("Cle SendGrid sauvegardee!");}} bg={T.blue}>Sauvegarder</Btn>
                </div>
                <div style={{fontSize:10,color:T.muted,marginTop:6}}>Obtenez votre cle sur sendgrid.com. Domaine expediteur requis: predictek.ca</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
