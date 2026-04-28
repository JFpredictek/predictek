import sb from "./lib/supabase";
import { useState, useEffect } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
var money=function(n){return Math.abs(n||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var today=function(){return new Date().toISOString().slice(0,10);};
function Bdg(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap",display:"inline-block"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit",width:p.fw?"100%":"auto"}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Modal(p){if(!p.show)return null;return(<div onClick={function(e){if(e.target===e.currentTarget)p.onClose();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}><div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:24,width:p.w||540,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><b style={{fontSize:15,color:T.text}}>{p.title}</b><button onClick={p.onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:T.muted,lineHeight:1}}>x</button></div>{p.children}</div></div>);}

// ===== TICKETS =====
function TabTickets(){
  var s0=useState([]);var tickets=s0[0];var setTickets=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({});var nf=s2[0];var setNf=s2[1];
  var s3=useState("");var search=s3[0];var setSearch=s3[1];
  var s4=useState("tous");var filtre=s4[0];var setFiltre=s4[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  var CATS=["copro_question","copro_plainte","copro_reparation","copro_autorisation","admin_approbation","interne_bug","interne_amelioration"];
  var PRIOS=["basse","normale","haute","urgence"];
  var STATUTS={nouveau:{c:T.blue,bg:T.blueL,l:"Nouveau"},en_cours:{c:T.amber,bg:T.amberL,l:"En cours"},ferme:{c:T.accent,bg:T.accentL,l:"Ferme"}};
  var liste=tickets.filter(function(t){
    if(search&&!(t.sujet+t.cat).toLowerCase().includes(search.toLowerCase()))return false;
    if(filtre!=="tous"&&t.statut!==filtre)return false;
    return true;
  });
  function creer(){
    if(!nf.sujet)return;
    setTickets(function(p){return [{id:Date.now(),sujet:nf.sujet,cat:nf.cat||"copro_question",prio:nf.prio||"normale",statut:"nouveau",date:today(),msg:nf.msg||"",syndicat:""}].concat(p);});
    setShowN(false);setNf({});
  }
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {["tous","nouveau","en_cours","ferme"].map(function(f){var a=filtre===f;return(<button key={f} onClick={function(){setFiltre(f);}} style={{background:a?T.navy:"#fff",border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"4px 12px",color:a?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>{f==="tous"?"Tous":f.replace("_"," ")}</button>);}) }
          <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Chercher..." style={{border:"1px solid "+T.border,borderRadius:20,padding:"4px 12px",fontSize:11,fontFamily:"inherit",outline:"none",width:160}}/>
        </div>
        <Btn sm onClick={function(){setNf({});setShowN(true);}}>+ Nouveau ticket</Btn>
      </div>
      {liste.length===0?(
        <div style={{textAlign:"center",padding:60,color:T.muted,fontSize:13,background:T.surface,borderRadius:10,border:"1px solid "+T.border}}>
          <div style={{fontSize:32,marginBottom:12}}>-</div>
          <div style={{fontWeight:600,color:T.navy,marginBottom:6}}>Aucun ticket</div>
          <div>Cliquez "+ Nouveau ticket" pour creer le premier ticket de support.</div>
        </div>
      ):(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:T.navy}}>{["#","Sujet","Categorie","Priorite","Statut","Date","Actions"].map(function(h){return <th key={h} style={{padding:"8px 12px",fontSize:10,fontWeight:700,color:"#8da0bb",textAlign:"left"}}>{h}</th>;})}</tr></thead>
            <tbody>
              {liste.map(function(t){var st=STATUTS[t.statut]||STATUTS.nouveau;return(
                <tr key={t.id} style={{borderBottom:"1px solid "+T.border}}>
                  <td style={{padding:"8px 12px",fontSize:11,color:T.muted}}>#{t.id.toString().slice(-4)}</td>
                  <td style={{padding:"8px 12px",fontSize:12,fontWeight:600,color:T.text,maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.sujet}</td>
                  <td style={{padding:"8px 12px"}}><Bdg bg={T.alt} c={T.muted}>{t.cat}</Bdg></td>
                  <td style={{padding:"8px 12px"}}><Bdg bg={t.prio==="urgence"?T.redL:t.prio==="haute"?T.amberL:T.accentL} c={t.prio==="urgence"?T.red:t.prio==="haute"?T.amber:T.accent}>{t.prio}</Bdg></td>
                  <td style={{padding:"8px 12px"}}><Bdg bg={st.bg} c={st.c}>{st.l}</Bdg></td>
                  <td style={{padding:"8px 12px",fontSize:11,color:T.muted}}>{t.date}</td>
                  <td style={{padding:"8px 12px",display:"flex",gap:4}}>
                    {t.statut==="nouveau"&&<Btn sm bg={T.amber} onClick={function(){setTickets(function(p){return p.map(function(x){return x.id===t.id?Object.assign({},x,{statut:"en_cours"}):x;});});}}>Prendre</Btn>}
                    {t.statut==="en_cours"&&<Btn sm onClick={function(){setTickets(function(p){return p.map(function(x){return x.id===t.id?Object.assign({},x,{statut:"ferme"}):x;});});}}>Fermer</Btn>}
                    <Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red} onClick={function(){setTickets(function(p){return p.filter(function(x){return x.id!==t.id;});});}}>X</Btn>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      )}
      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouveau ticket">
        <div style={{display:"grid",gap:10,marginBottom:14}}>
          <div><Lbl l="Sujet"/><input value={nf.sujet||""} onChange={function(e){snf("sujet",e.target.value);}} style={INP} placeholder="Decrivez le probleme..."/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><Lbl l="Categorie"/><select value={nf.cat||"copro_question"} onChange={function(e){snf("cat",e.target.value);}} style={INP}>{CATS.map(function(c){return <option key={c} value={c}>{c}</option>;})}</select></div>
            <div><Lbl l="Priorite"/><select value={nf.prio||"normale"} onChange={function(e){snf("prio",e.target.value);}} style={INP}>{PRIOS.map(function(c){return <option key={c} value={c}>{c}</option>;})}</select></div>
          </div>
          <div><Lbl l="Description"/><textarea value={nf.msg||""} onChange={function(e){snf("msg",e.target.value);}} rows={3} style={Object.assign({},INP,{resize:"vertical"})}/></div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={creer}>Creer le ticket</Btn><Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn></div>
      </Modal>
    </div>
  );
}

// ===== CONTACTS =====
function TabContacts(){
  var s0=useState([]);var contacts=s0[0];var setContacts=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({});var nf=s2[0];var setNf=s2[1];
  var s3=useState("");var search=s3[0];var setSearch=s3[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  var liste=contacts.filter(function(c){return !search||( c.nom+c.prenom+c.courriel).toLowerCase().includes(search.toLowerCase());});
  function creer(){if(!nf.nom)return;setContacts(function(p){return [{id:Date.now(),nom:nf.nom,prenom:nf.prenom||"",courriel:nf.courriel||"",tel:nf.tel||"",type:nf.type||"coproprietaire",syndicat:nf.syndicat||""}].concat(p);});setShowN(false);setNf({});}
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Chercher un contact..." style={Object.assign({},INP,{width:240})}/>
        <Btn sm onClick={function(){setNf({});setShowN(true);}}>+ Nouveau contact</Btn>
      </div>
      {liste.length===0?(
        <div style={{textAlign:"center",padding:60,color:T.muted,fontSize:13,background:T.surface,borderRadius:10,border:"1px solid "+T.border}}>
          <div style={{fontSize:32,marginBottom:12}}>-</div>
          <div style={{fontWeight:600,color:T.navy,marginBottom:6}}>Aucun contact</div>
          <div>Cliquez "+ Nouveau contact" pour ajouter votre premier contact.</div>
        </div>
      ):(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:T.navy}}>{["Nom","Courriel","Telephone","Type","Syndicat"].map(function(h){return <th key={h} style={{padding:"8px 12px",fontSize:10,fontWeight:700,color:"#8da0bb",textAlign:"left"}}>{h}</th>;})}</tr></thead>
            <tbody>{liste.map(function(c){return(<tr key={c.id} style={{borderBottom:"1px solid "+T.border}}><td style={{padding:"8px 12px",fontSize:12,fontWeight:600,color:T.navy}}>{c.prenom} {c.nom}</td><td style={{padding:"8px 12px",fontSize:11,color:T.muted}}>{c.courriel||"-"}</td><td style={{padding:"8px 12px",fontSize:11,color:T.muted}}>{c.tel||"-"}</td><td style={{padding:"8px 12px"}}><Bdg bg={T.blueL} c={T.blue}>{c.type}</Bdg></td><td style={{padding:"8px 12px",fontSize:11,color:T.muted}}>{c.syndicat||"-"}</td></tr>);})}</tbody>
          </table>
        </div>
      )}
      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouveau contact">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><Lbl l="Prenom"/><input value={nf.prenom||""} onChange={function(e){snf("prenom",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Nom"/><input value={nf.nom||""} onChange={function(e){snf("nom",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Courriel"/><input value={nf.courriel||""} onChange={function(e){snf("courriel",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Telephone"/><input value={nf.tel||""} onChange={function(e){snf("tel",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Type"/><select value={nf.type||"coproprietaire"} onChange={function(e){snf("type",e.target.value);}} style={INP}><option value="coproprietaire">Coproprietaire</option><option value="fournisseur">Fournisseur</option><option value="ca">Membre CA</option><option value="autre">Autre</option></select></div>
          <div><Lbl l="Syndicat"/><input value={nf.syndicat||""} onChange={function(e){snf("syndicat",e.target.value);}} style={INP} placeholder="Code syndicat"/></div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={creer}>Ajouter</Btn><Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn></div>
      </Modal>
    </div>
  );
}

// ===== BONS DE TRAVAIL =====
function TabBons(){
  var s0=useState([]);var bons=s0[0];var setBons=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({});var nf=s2[0];var setNf=s2[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  var STATUTS={nouveau:{c:T.blue,bg:T.blueL,l:"Nouveau"},approuve:{c:T.amber,bg:T.amberL,l:"Approuve"},complete:{c:T.accent,bg:T.accentL,l:"Complete"}};
  function creer(){if(!nf.titre)return;setBons(function(p){return [{id:Date.now(),titre:nf.titre,fournisseur:nf.fournisseur||"",montant:parseFloat(nf.montant)||0,statut:"nouveau",date:today(),syndicat:nf.syndicat||"",prio:nf.prio||"normale"}].concat(p);});setShowN(false);setNf({});}
  return(
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        <Btn sm onClick={function(){setNf({});setShowN(true);}}>+ Nouveau bon</Btn>
      </div>
      {bons.length===0?(
        <div style={{textAlign:"center",padding:60,color:T.muted,fontSize:13,background:T.surface,borderRadius:10,border:"1px solid "+T.border}}>
          <div style={{fontSize:32,marginBottom:12}}>-</div>
          <div style={{fontWeight:600,color:T.navy,marginBottom:6}}>Aucun bon de travail</div>
          <div>Cliquez "+ Nouveau bon" pour creer un bon de travail.</div>
        </div>
      ):(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:T.navy}}>{["Titre","Fournisseur","Montant","Syndicat","Priorite","Statut","Date"].map(function(h){return <th key={h} style={{padding:"8px 12px",fontSize:10,fontWeight:700,color:"#8da0bb",textAlign:"left"}}>{h}</th>;})}</tr></thead>
            <tbody>{bons.map(function(b){var st=STATUTS[b.statut]||STATUTS.nouveau;return(<tr key={b.id} style={{borderBottom:"1px solid "+T.border}}><td style={{padding:"8px 12px",fontSize:12,fontWeight:600,color:T.text}}>{b.titre}</td><td style={{padding:"8px 12px",fontSize:11,color:T.muted}}>{b.fournisseur||"-"}</td><td style={{padding:"8px 12px",fontSize:12,fontWeight:600}}>{b.montant>0?money(b.montant):"-"}</td><td style={{padding:"8px 12px",fontSize:11,color:T.muted}}>{b.syndicat||"-"}</td><td style={{padding:"8px 12px"}}><Bdg bg={b.prio==="urgence"?T.redL:T.amberL} c={b.prio==="urgence"?T.red:T.amber}>{b.prio}</Bdg></td><td style={{padding:"8px 12px"}}><Bdg bg={st.bg} c={st.c}>{st.l}</Bdg></td><td style={{padding:"8px 12px",fontSize:11,color:T.muted}}>{b.date}</td></tr>);})}</tbody>
          </table>
        </div>
      )}
      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouveau bon de travail">
        <div style={{display:"grid",gap:10,marginBottom:14}}>
          <div><Lbl l="Titre"/><input value={nf.titre||""} onChange={function(e){snf("titre",e.target.value);}} style={INP} placeholder="Description des travaux..."/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><Lbl l="Fournisseur"/><input value={nf.fournisseur||""} onChange={function(e){snf("fournisseur",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Montant ($)"/><input type="number" value={nf.montant||""} onChange={function(e){snf("montant",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Syndicat"/><input value={nf.syndicat||""} onChange={function(e){snf("syndicat",e.target.value);}} style={INP} placeholder="Code syndicat"/></div>
            <div><Lbl l="Priorite"/><select value={nf.prio||"normale"} onChange={function(e){snf("prio",e.target.value);}} style={INP}><option value="normale">Normale</option><option value="haute">Haute</option><option value="urgence">URGENCE</option></select></div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={creer}>Creer</Btn><Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn></div>
      </Modal>
    </div>
  );
}

// ===== MODULE PRINCIPAL CRM =====
export default function CRM(){
  var s0=useState("tickets");var ong=s0[0];var setOng=s0[1];
  var TABS=[{id:"tickets",l:"Tickets support"},{id:"contacts",l:"Contacts"},{id:"bons",l:"Bons de travail"}];
  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{fontSize:18,fontWeight:800,color:T.navy,marginBottom:4}}>CRM Support Predictek</div>
      <div style={{fontSize:11,color:T.muted,marginBottom:16}}>Gestion des tickets, contacts et bons de travail</div>
      <div style={{display:"flex",gap:3,marginBottom:16,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {TABS.map(function(t){var a=ong===t.id;return(<button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"8px 16px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400}}>{t.l}</button>);})}
      </div>
      {ong==="tickets"&&<TabTickets/>}
      {ong==="contacts"&&<TabContacts/>}
      {ong==="bons"&&<TabBons/>}
    </div>
  );
}
