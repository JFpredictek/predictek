
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Badge(p){var C={paye:{bg:"#D4EDDA",tc:"#155724"},en_attente:{bg:"#FEF3E2",tc:"#B86020"},retard:{bg:"#F8D7DA",tc:"#721C24"},nouveau:{bg:"#EFF6FF",tc:"#1A56DB"},en_cours:{bg:"#FEF3E2",tc:"#B86020"},resolu:{bg:"#D4EDDA",tc:"#155724"}};var c=C[p.s]||{bg:"#F0EDE8",tc:"#7C7568"};return <span style={{background:c.bg,color:c.tc,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{p.l}</span>;}

function EcranLogin(p){
  var s0=useState("");var unite=s0[0];var setUnite=s0[1];
  var s1=useState("");var code=s1[0];var setCode=s1[1];
  var s2=useState("");var err=s2[0];var setErr=s2[1];
  var s3=useState(false);var loading=s3[0];var setLoading=s3[1];

  function login(){
    if(!unite.trim()||!code.trim()){setErr("Veuillez entrer votre unite et code d acces.");return;}
    setLoading(true);setErr("");
    sb.select("coproprietaires",{eq:{unite:unite.trim().toUpperCase()}}).then(function(res){
      if(res&&res.data&&res.data.length>0){
        var cp=res.data[0];
        if(cp.code_acces&&cp.code_acces===code.trim()){
          p.onLogin(cp);
        }else if(!cp.code_acces&&code.trim().length>=4){
          p.onLogin(cp);
        }else{
          setErr("Code d acces invalide.");
        }
      }else{
        setErr("Unite "+unite.toUpperCase()+" non trouvee dans ce systeme.");
      }
      setLoading(false);
    }).catch(function(){setErr("Erreur de connexion. Verifiez votre reseau.");setLoading(false);});
  }

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#13233A 0%,#1B5E3B 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif"}}>
      <div style={{background:"#fff",borderRadius:16,padding:40,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:32}}>P</span>
          </div>
          <div style={{fontSize:20,fontWeight:800,color:"#13233A"}}>Portail Coproprietaire</div>
          <div style={{fontSize:12,color:"#7C7568",marginTop:6}}>Acces securise a votre espace personnel</div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#7C7568",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Numero d unite</div>
          <input value={unite} onChange={function(e){setUnite(e.target.value.toUpperCase());}} onKeyDown={function(e){if(e.key==="Enter")login();}} style={INP} placeholder="Ex: 101, 3A, PH2..."/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:"#7C7568",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Code d acces</div>
          <input type="password" value={code} onChange={function(e){setCode(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")login();}} style={INP} placeholder="Votre code personnel"/>
        </div>
        {err&&<div style={{background:"#F8D7DA",color:"#721C24",borderRadius:8,padding:"10px 14px",fontSize:12,marginBottom:16}}>{err}</div>}
        <button onClick={login} disabled={loading} style={{width:"100%",background:loading?"#ccc":"linear-gradient(135deg,#1B5E3B,#3CAF6E)",border:"none",borderRadius:10,padding:"14px",color:"#fff",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
          {loading?"Verification...":"Se connecter"}
        </button>
        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:"#7C7568"}}>Votre code d acces se trouve dans votre avis de bienvenue. Pour assistance: contactez votre gestionnaire.</div>
      </div>
    </div>
  );
}

function Tableau(p){
  var copro=p.copro;
  var s0=useState([]);var paiements=s0[0];var setPaiements=s0[1];
  var s1=useState([]);var tickets=s1[0];var setTickets=s1[1];
  var s2=useState([]);var docs=s2[0];var setDocs=s2[1];
  var s3=useState("accueil");var ong=s3[0];var setOng=s3[1];

  useEffect(function(){
    if(!copro)return;
    sb.select("paiements",{eq:{coproprietaire_id:copro.id},order:"date_paiement.desc",limit:24}).then(function(res){
      if(res&&res.data)setPaiements(res.data);
    }).catch(function(){});
    sb.select("tickets",{eq:{coproprietaire_id:copro.id},order:"created_at.desc",limit:10}).then(function(res){
      if(res&&res.data)setTickets(res.data);
    }).catch(function(){});
    sb.select("documents",{eq:{niveau:"coproprietaire",coproprietaire_id:copro.id},order:"created_at.desc"}).then(function(res){
      if(res&&res.data)setDocs(res.data);
    }).catch(function(){});
  },[copro]);

  var payes=paiements.filter(function(p){return p.statut==="paye";});
  var enAttente=paiements.filter(function(p){return p.statut==="en_attente";});
  var totalDu=enAttente.reduce(function(a,p){return a+Number(p.montant);},0);

  var TABS=[{id:"accueil",l:"Mon compte"},{id:"paiements",l:"Paiements"},{id:"tickets",l:"Demandes"},{id:"docs",l:"Documents"}];

  function soumettreTicket(sujet,description){
    if(!sujet.trim())return;
    sb.insert("tickets",{coproprietaire_id:copro.id,syndicat_id:copro.syndicat_id,unite:copro.unite,sujet:sujet,description:description,statut:"nouveau",priorite:"normale"}).then(function(res){
      if(res&&res.data)setTickets(function(prev){return [res.data].concat(prev);});
    }).catch(function(){});
  }

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:18}}>P</span>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>Portail Coproprietaire</div>
            <div style={{fontSize:10,color:"#3CAF6E"}}>Unite {copro.unite} - {copro.nom}</div>
          </div>
        </div>
        <Btn sm bg="#ffffff18" bdr="1px solid #ffffff30" onClick={p.onLogout}>Deconnexion</Btn>
      </div>

      <div style={{display:"flex",gap:0,borderBottom:"1px solid "+T.border,background:T.surface,overflowX:"auto"}}>
        {TABS.map(function(t){var a=ong===t.id;return(
          <button key={t.id} onClick={function(){setOng(t.id);}} style={{padding:"12px 20px",background:"transparent",border:"none",borderBottom:a?"3px solid "+T.accent:"3px solid transparent",color:a?T.accent:T.muted,fontSize:12,fontWeight:a?700:400,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{t.l}</button>
        );})}
      </div>

      <div style={{padding:20,maxWidth:800,margin:"0 auto"}}>
        {ong==="accueil"&&(
          <div>
            <div style={{fontSize:16,fontWeight:800,color:T.navy,marginBottom:4}}>Bonjour, {copro.prenom||copro.nom} !</div>
            <div style={{fontSize:12,color:T.muted,marginBottom:20}}>Bienvenue dans votre espace personnel. Voici un resume de votre compte.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
              <div style={{background:totalDu>0?T.amberL:T.accentL,border:"1px solid "+(totalDu>0?T.amber:T.accent)+"44",borderRadius:12,padding:16}}>
                <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Solde en attente</div>
                <div style={{fontSize:26,fontWeight:800,color:totalDu>0?T.amber:T.accent}}>{totalDu.toFixed(2)} $</div>
                <div style={{fontSize:11,color:T.muted,marginTop:4}}>{enAttente.length} paiement(s) en attente</div>
              </div>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16}}>
                <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Cotisation mensuelle</div>
                <div style={{fontSize:26,fontWeight:800,color:T.navy}}>{Number(copro.cotisation_mensuelle||0).toFixed(2)} $</div>
                <div style={{fontSize:11,color:T.muted,marginTop:4}}>{copro.pap?"Prelevement automatique actif":"Paiement manuel"}</div>
              </div>
            </div>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>Mes informations</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12}}>
                <div><span style={{color:T.muted}}>Unite: </span><span style={{fontWeight:600}}>{copro.unite}</span></div>
                <div><span style={{color:T.muted}}>Fraction: </span><span style={{fontWeight:600}}>{copro.fraction||"-"}</span></div>
                <div><span style={{color:T.muted}}>Courriel: </span><span>{copro.courriel||"-"}</span></div>
                <div><span style={{color:T.muted}}>Telephone: </span><span>{copro.telephone||"-"}</span></div>
                {copro.adresse&&<div style={{gridColumn:"1/-1"}}><span style={{color:T.muted}}>Adresse: </span><span>{copro.adresse}</span></div>}
              </div>
            </div>
            {tickets.filter(function(t){return t.statut!=="resolu";}).length>0&&(
              <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:12,padding:14}}>
                <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:8}}>Demandes en cours</div>
                {tickets.filter(function(t){return t.statut!=="resolu";}).slice(0,3).map(function(t){return(
                  <div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+T.amber+"22",fontSize:12}}>
                    <span>{t.sujet}</span><Badge s={t.statut} l={t.statut}/>
                  </div>
                );})}
              </div>
            )}
          </div>
        )}

        {ong==="paiements"&&(
          <div>
            <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:16}}>Historique des paiements</div>
            {paiements.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucun paiement enregistre</div>}
            {paiements.map(function(p){return(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:T.surface,border:"1px solid "+T.border,borderRadius:10,marginBottom:8}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:T.navy}}>{p.description||"Cotisation"}</div>
                  <div style={{fontSize:11,color:T.muted}}>{p.date_paiement}</div>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <span style={{fontSize:14,fontWeight:700,color:T.navy}}>{Number(p.montant).toFixed(2)} $</span>
                  <Badge s={p.statut} l={p.statut==="paye"?"Paye":p.statut==="en_attente"?"En attente":"Retard"}/>
                </div>
              </div>
            );})}
          </div>
        )}

        {ong==="tickets"&&<TabTickets copro={copro} tickets={tickets} setTickets={setTickets} onSubmit={soumettreTicket}/>}

        {ong==="docs"&&(
          <div>
            <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:16}}>Mes documents</div>
            {docs.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucun document disponible pour l instant</div>}
            {docs.map(function(d){return(
              <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:T.surface,border:"1px solid "+T.border,borderRadius:10,marginBottom:8}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:T.navy}}>{d.nom}</div>
                  <div style={{fontSize:11,color:T.muted}}>{d.type_doc||"Document"}{d.date_doc?" - "+d.date_doc:""}</div>
                </div>
                {d.url&&<Btn sm bg={T.blue} onClick={function(){window.open(d.url,"_blank");}}>Ouvrir</Btn>}
              </div>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}

function TabTickets(p){
  var copro=p.copro;var tickets=p.tickets;var setTickets=p.setTickets;
  var s0=useState(false);var showN=s0[0];var setShowN=s0[1];
  var s1=useState("");var sujet=s1[0];var setSujet=s1[1];
  var s2=useState("");var desc=s2[0];var setDesc=s2[1];
  var s3=useState("normale");var prio=s3[0];var setPrio=s3[1];

  function soumettre(){
    if(!sujet.trim())return;
    sb.insert("tickets",{coproprietaire_id:copro.id,syndicat_id:copro.syndicat_id,unite:copro.unite,sujet:sujet,description:desc,statut:"nouveau",priorite:prio}).then(function(res){
      if(res&&res.data)setTickets(function(prev){return [res.data].concat(prev);});
      setShowN(false);setSujet("");setDesc("");setPrio("normale");
    }).catch(function(){});
  }

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:T.navy}}>Mes demandes</div>
        <Btn onClick={function(){setShowN(true);}}>+ Nouvelle demande</Btn>
      </div>
      {showN&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>Nouvelle demande</div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:5,textTransform:"uppercase"}}>Sujet</div>
            <input value={sujet} onChange={function(e){setSujet(e.target.value);}} style={INP} placeholder="Decrivez brievement votre demande..."/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:5,textTransform:"uppercase"}}>Description detaillee</div>
            <textarea value={desc} onChange={function(e){setDesc(e.target.value);}} style={Object.assign({},INP,{minHeight:80,resize:"vertical"})} placeholder="Details supplementaires, date souhaitee, etc."/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:5,textTransform:"uppercase"}}>Priorite</div>
            <select value={prio} onChange={function(e){setPrio(e.target.value);}} style={Object.assign({},INP,{width:180})}>
              <option value="basse">Basse</option>
              <option value="normale">Normale</option>
              <option value="haute">Haute - urgente</option>
            </select>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={soumettre} dis={!sujet.trim()}>Soumettre</Btn>
            <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
          </div>
        </div>
      )}
      {tickets.length===0&&!showN&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucune demande - cliquez "+ Nouvelle demande"</div>}
      {tickets.map(function(t){return(
        <div key={t.id} style={{padding:"14px 16px",background:T.surface,border:"1px solid "+T.border,borderRadius:10,marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div style={{fontSize:12,fontWeight:700,color:T.navy,flex:1}}>{t.sujet}</div>
            <Badge s={t.statut} l={t.statut==="nouveau"?"Nouveau":t.statut==="en_cours"?"En cours":"Resolu"}/>
          </div>
          {t.description&&<div style={{fontSize:11,color:T.muted}}>{t.description}</div>}
          <div style={{fontSize:10,color:T.muted,marginTop:6}}>Soumis le {t.created_at?t.created_at.substring(0,10):"-"} - Priorite: {t.priorite}</div>
        </div>
      );})}
    </div>
  );
}

export default function PortailCopro(){
  var s0=useState(null);var copro=s0[0];var setCopro=s0[1];
  function handleLogout(){setCopro(null);}
  if(!copro)return <EcranLogin onLogin={setCopro}/>;
  return <Tableau copro={copro} onLogout={handleLogout}/>;
}
