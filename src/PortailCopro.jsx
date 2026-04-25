import { useState } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",surfaceAlt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentLight:"#E8F2EC",accentPop:"#3CAF6E",red:"#B83232",redLight:"#FDECEA",amber:"#B86020",amberLight:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueLight:"#EFF6FF",purple:"#6B3FA0",purpleLight:"#F3EEFF"};
var money=function(n){if(!n&&n!==0)return"—";return Math.abs(n).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var td=function(){return new Date().toISOString().slice(0,10);};
function Badge(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentLight,color:p.c||T.accent,whiteSpace:"nowrap"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:"none",borderRadius:8,padding:p.sm?"5px 12px":"10px 20px",color:"#fff",fontSize:p.sm?11:13,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit",width:p.fw?"100%":"auto",opacity:p.dis?0.6:1}}>{p.children}</button>;}
function Card(p){return <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:p.p||16,marginBottom:p.mb||0}}>{p.children}</div>;}

// ===== DONNEES SIMULATION =====
var UNITES={
  "531":{
    u:"531",nom:"Jean-Francois Laroche",nom2:"Maryse Fredette",
    tel:"819-479-4203",courriel:"jf.laroche@email.com",
    adresse:"531 ch. du Hibou, Stoneham QC G3C 1T1",
    fraction:2.133,cotisation:292.06,role:"President CA",
    banque:{ok:true,inst:"815",transit:"06202"},
    ce:{expiry:"2030-09-10",marque:"AO Smith"},
    ass:{cie:"SSQ",expiry:"2026-08-01",montant:2000000},
    stats:["15"],casiers:["C-12"],
    animaux:[{nom:"Luna",espece:"Chat"}],
    vehicules:[{plaque:"GHI-789",marque:"Ford",modele:"F-150",annee:"2023"}],
    paiements:[
      {date:"2026-04-01",desc:"Cotisation avril 2026",montant:292.06,statut:"paye"},
      {date:"2026-03-01",desc:"Cotisation mars 2026",montant:292.06,statut:"paye"},
      {date:"2026-02-01",desc:"Cotisation fevrier 2026",montant:292.06,statut:"paye"},
      {date:"2026-01-01",desc:"Cotisation janvier 2026",montant:292.06,statut:"paye"},
    ],
    docs:[
      {nom:"Declaration de copropriete",date:"2013-09-01",type:"legal"},
      {nom:"Reglement de l immeuble",date:"2023-01-15",type:"legal"},
      {nom:"PV AGO janvier 2026",date:"2026-01-25",type:"pv"},
      {nom:"PV CA mars 2026",date:"2026-03-18",type:"pv"},
      {nom:"Police assurance syndicat 2025-2026",date:"2025-11-01",type:"assurance"},
      {nom:"Budget 2025-2026",date:"2025-11-01",type:"financier"},
    ]
  },
  "539":{
    u:"539",nom:"Lucette Tremblay",nom2:"",
    tel:"418-555-0539",courriel:"l.tremblay@email.com",
    adresse:"539 ch. du Hibou, Stoneham QC G3C 1T1",
    fraction:3.840,cotisation:525.80,role:"Coproprietaire",
    banque:{ok:true,inst:"815",transit:"06202"},
    ce:{expiry:"2024-04-22",marque:"Giant"},
    ass:{cie:"Promutuel",expiry:"2026-06-15",montant:2000000},
    stats:["21","22"],casiers:[],animaux:[{nom:"Minou",espece:"Chat"},{nom:"Bijou",espece:"Chat"}],vehicules:[],
    loc:{actif:true,locataire:"Amelie Cote",tel:"418-555-9001",debut:"2025-09-01",fin:"2026-08-31"},
    paiements:[
      {date:"2026-04-01",desc:"Cotisation avril 2026",montant:525.80,statut:"paye"},
      {date:"2026-03-01",desc:"Cotisation mars 2026",montant:525.80,statut:"paye"},
    ],
    docs:[
      {nom:"Declaration de copropriete",date:"2013-09-01",type:"legal"},
      {nom:"Reglement de l immeuble",date:"2023-01-15",type:"legal"},
      {nom:"PV AGO janvier 2026",date:"2026-01-25",type:"pv"},
    ]
  }
};

var FOURNISSEURS_CAT={
  "plomberie":"Plomberie ProFlo",
  "electricite":"ElectroServ QC",
  "chauffage":"ChauFroid Expert",
  "serrurerie":"Serrurier Express",
  "urgence_eau":"Plomberie ProFlo",
  "ascenseur":"AscenseurTech QC",
  "nettoyage":"Nettoyage Prestige",
  "paysagement":"Paysagement Horizon",
  "deneigement":"Deneigement Express",
  "autre":"Predictek Support"
};

var TICKETS_INIT=[];

var AVIS_INIT=[];

// ===== ECRAN LOGIN =====
function LoginScreen(p){
  var s1=useState(""); var unite=s1[0]; var setUnite=s1[1];
  var s2=useState(""); var code=s2[0]; var setCode=s2[1];
  var s3=useState(""); var err=s3[0]; var setErr=s3[1];
  var inp={width:"100%",border:"1px solid "+T.border,borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
  function login(){
    if(UNITES[unite]&&code==="1234"){p.onLogin(unite);}
    else{setErr("Unite ou code invalide. Essayez: 531 ou 539, code: 1234");}
  }
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f1d2e 0%,#1B5E3B 100%)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:T.surface,borderRadius:16,padding:40,width:380,boxShadow:"0 20px 60px #00000040"}}>
        <div style={{textAlign:"center",marginBottom:30}}>
          <div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:24,fontFamily:"Georgia,serif"}}>P</span>
          </div>
          <div style={{fontSize:20,fontWeight:800,color:T.navy,fontFamily:"Georgia,serif"}}>Predictek</div>
          <div style={{fontSize:12,color:T.muted,marginTop:2}}>Portail Coproprietaire</div>
          <div style={{fontSize:11,color:T.accent,marginTop:4}}>Syndicat Piedmont</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Numero d unite</div>
          <input value={unite} onChange={function(e){setUnite(e.target.value);setErr("");}} placeholder="ex: 531" style={inp} onKeyDown={function(e){if(e.key==="Enter")login();}}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Code d acces</div>
          <input type="password" value={code} onChange={function(e){setCode(e.target.value);setErr("");}} placeholder="••••" style={inp} onKeyDown={function(e){if(e.key==="Enter")login();}}/>
        </div>
        {err&&<div style={{background:T.redLight,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.red,marginBottom:14}}>{err}</div>}
        <Btn onClick={login} fw>Se connecter</Btn>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:T.muted}}>Demo: unite 531 ou 539 | code: 1234</div>
      </div>
    </div>
  );
}

// ===== SOUMETTRE DEMANDE =====
function SoumettreDemande(p){
  var s1=useState({titre:"",cat:"plomberie",prio:"normale",desc:""}); var form=s1[0]; var setForm=s1[1];
  var s2=useState(false); var envoye=s2[0]; var setEnvoye=s2[1];
  function sf(k,v){setForm(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}
  var inp={width:"100%",border:"1px solid "+T.border,borderRadius:8,padding:"9px 12px",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
  var CATS=[];
  function soumettre(){
    if(!form.titre||!form.desc){return;}
    var fournisseur=FOURNISSEURS_CAT[form.cat]||"Predictek Support";
    var ticket={
      id:Date.now(),unite:p.unite,titre:form.titre,cat:form.cat,prio:form.prio,
      statut:form.cat==="urgence_eau"?"urgent":"nouveau",date:td(),
      fournisseur:fournisseur,desc:form.desc,
      updates:[
        {date:td(),msg:"Demande recue et enregistree dans le systeme CRM"},
        {date:td(),msg:"Assignee automatiquement a: "+fournisseur+(form.prio==="haute"||form.cat==="urgence_eau"?" — PRIORITE HAUTE: contact dans l heure":"")}
      ]
    };
    p.onAjouter(ticket);
    setEnvoye(true);
  }
  if(envoye)return(
    <div style={{textAlign:"center",padding:40}}>
      <div style={{width:60,height:60,borderRadius:"50%",background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
        <span style={{fontSize:28,color:T.accent}}>ok</span>
      </div>
      <div style={{fontSize:18,fontWeight:700,color:T.navy,marginBottom:8}}>Demande envoyee!</div>
      <div style={{fontSize:13,color:T.muted,marginBottom:6}}>Assignee a: <b style={{color:T.text}}>{FOURNISSEURS_CAT[form.cat]}</b></div>
      <div style={{fontSize:12,color:T.muted,marginBottom:24}}>Vous recevrez une confirmation par courriel sous peu.</div>
      <Btn onClick={function(){setEnvoye(false);setForm({titre:"",cat:"plomberie",prio:"normale",desc:""});p.onRetour();}}>Voir mes demandes</Btn>
    </div>
  );
  return(
    <div>
      <div style={{fontSize:16,fontWeight:700,color:T.navy,marginBottom:16}}>Nouvelle demande de service</div>
      <div style={{display:"grid",gap:14}}>
        <div>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Titre de la demande *</div>
          <input value={form.titre} onChange={function(e){sf("titre",e.target.value);}} placeholder="ex: Fuite sous l evier" style={inp}/>
        </div>
        <div>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Categorie *</div>
          <select value={form.cat} onChange={function(e){sf("cat",e.target.value);}} style={inp}>
            {CATS.map(function(c){return <option key={c[0]} value={c[0]}>{c[1]}</option>;})}
          </select>
        </div>
        <div>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Priorite</div>
          <div style={{display:"flex",gap:8}}>
            {[["normale","Normale"],["haute","Haute"],["urgence","URGENCE"]].map(function(pr){var a=form.prio===pr[0];return(
              <button key={pr[0]} onClick={function(){sf("prio",pr[0]);}} style={{flex:1,padding:"8px",border:"2px solid "+(a?pr[0]==="urgence"?T.red:pr[0]==="haute"?T.amber:T.accent:T.border),borderRadius:8,background:a?pr[0]==="urgence"?T.redLight:pr[0]==="haute"?T.amberLight:T.accentLight:T.surface,color:a?pr[0]==="urgence"?T.red:pr[0]==="haute"?T.amber:T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:a?700:400}}>{pr[1]}</button>
            );})}
          </div>
        </div>
        <div>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Description detaillee *</div>
          <textarea value={form.desc} onChange={function(e){sf("desc",e.target.value);}} placeholder="Decrivez le probleme en detail..." rows={4} style={Object.assign({},inp,{resize:"vertical"})}/>
        </div>
        {form.cat==="urgence_eau"&&<div style={{background:T.redLight,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:600}}>URGENCE: Un technicien sera contacte immediatement. Pour urgence extreme, appelez le 418-555-0911.</div>}
        <div style={{background:T.accentLight,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent}}>Sera assigne automatiquement a: <b>{FOURNISSEURS_CAT[form.cat]}</b></div>
        <Btn onClick={soumettre} dis={!form.titre||!form.desc} fw>Envoyer la demande</Btn>
      </div>
    </div>
  );
}

// ===== MES DEMANDES =====
function MesDemandes(p){
  var s1=useState(null); var sel=s1[0]; var setSel=s1[1];
  var mine=p.tickets.filter(function(t){return t.unite===p.unite;});
  function stColor(s){if(s==="urgent")return{c:T.red,bg:T.redLight,l:"URGENT"};if(s==="nouveau")return{c:T.amber,bg:T.amberLight,l:"Nouveau"};if(s==="en_cours")return{c:T.blue,bg:T.blueLight,l:"En cours"};if(s==="ferme")return{c:T.muted,bg:T.surfaceAlt,l:"Ferme"};return{c:T.muted,bg:T.surfaceAlt,l:s};}
  var selT=sel?mine.find(function(t){return t.id===sel;}):null;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:T.navy}}>Mes demandes de service</div>
        <Btn sm onClick={p.onNouvelle}>+ Nouvelle demande</Btn>
      </div>
      {mine.length===0&&<Card><div style={{textAlign:"center",padding:30,color:T.muted,fontSize:13}}>Aucune demande. Tout va bien!</div></Card>}
      <div style={{display:"flex",gap:12}}>
        <div style={{flex:1}}>
          {mine.map(function(t){var st=stColor(t.statut);return(
            <div key={t.id} onClick={function(){setSel(t.id);}} style={{background:sel===t.id?T.accentLight:T.surface,border:"1px solid "+(sel===t.id?T.accent:T.border),borderRadius:10,padding:14,marginBottom:8,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>{t.titre}</div>
                <Badge bg={st.bg} c={st.c}>{st.l}</Badge>
              </div>
              <div style={{fontSize:11,color:T.muted}}>{t.date} | {t.cat} | {t.fournisseur}</div>
            </div>
          );})}
        </div>
        {selT&&(
          <div style={{width:320,flexShrink:0}}>
            <Card>
              <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:4}}>{selT.titre}</div>
              <div style={{fontSize:11,color:T.muted,marginBottom:12}}>{selT.date} | Ref: #{selT.id}</div>
              <div style={{fontSize:12,color:T.text,marginBottom:10,lineHeight:1.6,background:T.surfaceAlt,borderRadius:8,padding:10}}>{selT.desc}</div>
              <div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:8,textTransform:"uppercase"}}>Suivi</div>
              {selT.updates.map(function(u,i){return(
                <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:i===0?T.accent:T.muted,marginTop:3,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:11,color:T.muted}}>{u.date}</div>
                    <div style={{fontSize:12,color:T.text}}>{u.msg}</div>
                  </div>
                </div>
              );})}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== MON COMPTE =====
function MonCompte(p){
  var d=UNITES[p.unite];
  var ceJ=d.ce&&d.ce.expiry?Math.ceil((new Date(d.ce.expiry)-new Date())/86400000):9999;
  var assJ=d.ass&&d.ass.expiry?Math.ceil((new Date(d.ass.expiry)-new Date())/86400000):9999;
  function stJ(j){if(j<0)return{c:T.red,l:"EXPIRE"};if(j<=90)return{c:T.amber,l:j+"j restants"};return{c:T.accent,l:"OK"};}
  var ceS=stJ(ceJ); var assS=stJ(assJ);
  return(
    <div>
      <div style={{fontSize:16,fontWeight:700,color:T.navy,marginBottom:16}}>Mon compte</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card mb={0}>
          <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:12,textTransform:"uppercase"}}>Informations</div>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>{d.nom}</div>
          {d.nom2&&<div style={{fontSize:13,color:T.muted,marginBottom:8}}>{d.nom2}</div>}
          <div style={{fontSize:12,color:T.muted,marginBottom:4}}>{d.tel}</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:4}}>{d.courriel}</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:12}}>{d.adresse}</div>
          {d.role&&<Badge bg={T.purpleLight} c={T.purple}>{d.role}</Badge>}
        </Card>
        <Card mb={0}>
          <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:12,textTransform:"uppercase"}}>Mon unite {p.unite}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            <div style={{background:T.accentLight,borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:T.accent}}>Fraction</div>
              <div style={{fontSize:16,fontWeight:700,color:T.accent}}>{d.fraction.toFixed(3)}%</div>
            </div>
            <div style={{background:T.blueLight,borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:T.blue}}>Cotisation</div>
              <div style={{fontSize:16,fontWeight:700,color:T.blue}}>{money(d.cotisation)}</div>
              <div style={{fontSize:9,color:T.blue}}>par mois</div>
            </div>
          </div>
          {d.stats&&d.stats.length>0&&<div style={{marginBottom:8}}><div style={{fontSize:10,color:T.muted,marginBottom:4}}>Stationnement(s)</div><div style={{display:"flex",gap:4}}>{d.stats.map(function(s){return <Badge key={s} bg={T.blueLight} c={T.blue}>P-{s}</Badge>;})}</div></div>}
          {d.casiers&&d.casiers.length>0&&<div><div style={{fontSize:10,color:T.muted,marginBottom:4}}>Casier(s)</div><div style={{display:"flex",gap:4}}>{d.casiers.map(function(c){return <Badge key={c} bg={T.accentLight} c={T.accent}>{c}</Badge>;})}</div></div>}
        </Card>
        <Card mb={0}>
          <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:12,textTransform:"uppercase"}}>Conformite</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+T.border}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.text}}>Chauffe-eau</div>
              <div style={{fontSize:11,color:T.muted}}>{d.ce.marque} | Exp: {d.ce.expiry}</div>
            </div>
            <Badge bg={ceS.c===T.red?T.redLight:ceS.c===T.amber?T.amberLight:T.accentLight} c={ceS.c}>{ceS.l}</Badge>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+T.border}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.text}}>Assurance RC</div>
              <div style={{fontSize:11,color:T.muted}}>{d.ass.cie} | Exp: {d.ass.expiry}</div>
            </div>
            <Badge bg={assS.c===T.red?T.redLight:assS.c===T.amber?T.amberLight:T.accentLight} c={assS.c}>{assS.l}</Badge>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0"}}>
            <div><div style={{fontSize:12,fontWeight:600,color:T.text}}>Prelevement auto</div></div>
            <Badge bg={d.banque.ok?T.accentLight:T.redLight} c={d.banque.ok?T.accent:T.red}>{d.banque.ok?"Autorise":"Non autorise"}</Badge>
          </div>
        </Card>
        <Card mb={0}>
          <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:12,textTransform:"uppercase"}}>Mes paiements</div>
          {d.paiements.slice(0,4).map(function(pm,i){return(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<3?"1px solid "+T.border:"none"}}>
              <div>
                <div style={{fontSize:12,color:T.text}}>{pm.desc}</div>
                <div style={{fontSize:10,color:T.muted}}>{pm.date}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>{money(pm.montant)}</div>
                <Badge bg={T.accentLight} c={T.accent}>Paye</Badge>
              </div>
            </div>
          );})}
        </Card>
        {d.animaux&&d.animaux.length>0&&<Card mb={0}>
          <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:10,textTransform:"uppercase"}}>Animaux ({d.animaux.length}/2)</div>
          {d.animaux.map(function(a,i){return <div key={i} style={{fontSize:13,color:T.text,marginBottom:4}}>{a.nom} — {a.espece}</div>;})}
        </Card>}
        {d.vehicules&&d.vehicules.length>0&&<Card mb={0}>
          <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:10,textTransform:"uppercase"}}>Vehicules</div>
          {d.vehicules.map(function(v,i){return <div key={i} style={{fontSize:12,color:T.text,marginBottom:4}}>{v.plaque} — {v.annee} {v.marque} {v.modele}</div>;})}
        </Card>}
      </div>
    </div>
  );
}

// ===== DOCUMENTS =====
function MesDocuments(p){
  var d=UNITES[p.unite];
  var TYPES={legal:{l:"Legal",bg:T.purpleLight,c:T.purple},pv:{l:"PV",bg:T.blueLight,c:T.blue},assurance:{l:"Assurance",bg:T.amberLight,c:T.amber},financier:{l:"Financier",bg:T.accentLight,c:T.accent}};
  return(
    <div>
      <div style={{fontSize:16,fontWeight:700,color:T.navy,marginBottom:16}}>Documents du syndicat</div>
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:T.surfaceAlt}}>{["Document","Type","Date","Action"].map(function(h){return <th key={h} style={{padding:"8px 12px",fontSize:10,color:T.muted,fontWeight:600,textAlign:"left"}}>{h}</th>;})}</tr></thead>
          <tbody>
            {d.docs.map(function(doc,i){var tp=TYPES[doc.type]||{l:doc.type,bg:T.surfaceAlt,c:T.muted};return(
              <tr key={i} style={{borderBottom:"1px solid "+T.border}}>
                <td style={{padding:"10px 12px",fontSize:13,color:T.text,fontWeight:500}}>{doc.nom}</td>
                <td style={{padding:"10px 12px"}}><Badge bg={tp.bg} c={tp.c}>{tp.l}</Badge></td>
                <td style={{padding:"10px 12px",fontSize:12,color:T.muted}}>{doc.date}</td>
                <td style={{padding:"10px 12px"}}><span style={{fontSize:12,color:T.blue,cursor:"pointer",fontWeight:600}}>Voir</span></td>
              </tr>
            );})}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ===== AVIS ET COMMUNICATIONS =====
function MesAvis(){
  var TYPES={info:{bg:T.blueLight,c:T.blue,l:"Info"},reunion:{bg:T.purpleLight,c:T.purple,l:"Reunion"},urgent:{bg:T.redLight,c:T.red,l:"Important"}};
  return(
    <div>
      <div style={{fontSize:16,fontWeight:700,color:T.navy,marginBottom:16}}>Avis et communications</div>
      {AVIS_INIT.map(function(a){var tp=TYPES[a.type]||{bg:T.surfaceAlt,c:T.muted,l:a.type};return(
        <Card key={a.id} mb={12}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                <Badge bg={tp.bg} c={tp.c}>{tp.l}</Badge>
                <span style={{fontSize:11,color:T.muted}}>{a.date}</span>
              </div>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>{a.titre}</div>
            </div>
          </div>
          <div style={{fontSize:13,color:T.muted,lineHeight:1.6}}>{a.corps}</div>
        </Card>
      );})}
    </div>
  );
}

// ===== MODULE PRINCIPAL =====
export default function PortailCopro(){
  var s1=useState(null); var unite=s1[0]; var setUnite=s1[1];
  var s2=useState("accueil"); var onglet=s2[0]; var setOnglet=s2[1];
  var s3=useState(TICKETS_INIT); var tickets=s3[0]; var setTickets=s3[1];
  var s4=useState(false); var nouvelleD=s4[0]; var setNouvelleD=s4[1];

  if(!unite)return <LoginScreen onLogin={function(u){setUnite(u);}}/>;

  var d=UNITES[unite];
  var mesTickets=tickets.filter(function(t){return t.unite===unite;});
  var ticketsOuverts=mesTickets.filter(function(t){return t.statut!=="ferme";}).length;
  var urgences=mesTickets.filter(function(t){return t.statut==="urgent";}).length;

  var TABS=[];

  function onAjouter(ticket){
    setTickets(function(prev){return prev.concat([ticket]);});
    setNouvelleD(false);
    setOnglet("demandes");
  }

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"Georgia,serif"}}>
      <div style={{background:T.navy,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",height:52}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:14,fontFamily:"Georgia,serif"}}>P</span>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>Predictek — Portail Coproprietaire</div>
            <div style={{fontSize:9,color:"#3CAF6E"}}>Syndicat Piedmont | Unite {unite}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {urgences>0&&<Badge bg={T.redLight} c={T.red}>{urgences} urgence(s)</Badge>}
          <div style={{fontSize:12,color:"#8da0bb"}}>{d.nom}</div>
          <button onClick={function(){setUnite(null);setOnglet("accueil");}} style={{background:"#ffffff18",border:"none",borderRadius:6,padding:"4px 10px",color:"#8da0bb",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Deconnexion</button>
        </div>
      </div>

      <div style={{background:T.surface,borderBottom:"1px solid "+T.border,display:"flex",gap:0,padding:"0 20px"}}>
        {TABS.map(function(t){var a=onglet===t.id&&!nouvelleD;return(
          <button key={t.id} onClick={function(){setOnglet(t.id);setNouvelleD(false);}} style={{background:"none",border:"none",borderBottom:"2px solid "+(a?T.accent:"transparent"),padding:"12px 16px",color:a?T.accent:T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:400,whiteSpace:"nowrap"}}>{t.l}</button>
        );})}
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:20}}>
        {onglet==="accueil"&&!nouvelleD&&(
          <div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:20,fontWeight:800,color:T.navy,marginBottom:4}}>Bonjour, {d.nom.split(" ")[0]}!</div>
              <div style={{fontSize:13,color:T.muted}}>Unite {unite} | {d.adresse}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
              {[
                {l:"Cotisation mensuelle",v:money(d.cotisation),c:T.blue,bg:T.blueLight},
                {l:"Demandes en cours",v:ticketsOuverts,c:ticketsOuverts>0?T.amber:T.accent,bg:ticketsOuverts>0?T.amberLight:T.accentLight},
                {l:"Nouveaux avis",v:AVIS_INIT.length,c:T.purple,bg:T.purpleLight},
              ].map(function(s,i){return(
                <div key={i} style={{background:s.bg,borderRadius:12,padding:"16px 18px",border:"1px solid "+s.c+"30"}}>
                  <div style={{fontSize:10,color:s.c,fontWeight:600,marginBottom:6,textTransform:"uppercase"}}>{s.l}</div>
                  <div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
                </div>
              );})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Card mb={0}>
                <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>Acces rapide</div>
                <div style={{display:"grid",gap:8}}>
                  {[
                    {l:"Soumettre une demande de service",ic:"Demande",onClick:function(){setNouvelleD(true);}},
                    {l:"Voir mes demandes en cours",ic:"Suivi",onClick:function(){setOnglet("demandes");}},
                    {l:"Mes documents",ic:"Docs",onClick:function(){setOnglet("documents");}},
                    {l:"Avis du syndicat",ic:"Avis",onClick:function(){setOnglet("avis");}},
                  ].map(function(item,i){return(
                    <button key={i} onClick={item.onClick} style={{display:"flex",alignItems:"center",gap:12,background:T.surfaceAlt,border:"1px solid "+T.border,borderRadius:8,padding:"10px 14px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
                      <div style={{width:30,height:30,borderRadius:8,background:T.navy,color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{item.ic}</div>
                      <span style={{fontSize:13,color:T.text,fontWeight:500}}>{item.l}</span>
                    </button>
                  );})}
                </div>
              </Card>
              <Card mb={0}>
                <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>Dernier avis</div>
                {AVIS_INIT.slice(0,2).map(function(a,i){var tp={info:{c:T.blue},reunion:{c:T.purple},urgent:{c:T.red}}[a.type]||{c:T.muted};return(
                  <div key={i} style={{padding:"10px 0",borderBottom:i<1?"1px solid "+T.border:"none"}}>
                    <div style={{fontSize:12,fontWeight:600,color:tp.c,marginBottom:2}}>{a.titre}</div>
                    <div style={{fontSize:11,color:T.muted}}>{a.date}</div>
                  </div>
                );})}
                <button onClick={function(){setOnglet("avis");}} style={{marginTop:10,background:"none",border:"none",color:T.accent,fontSize:12,cursor:"pointer",fontFamily:"inherit",padding:0,fontWeight:600}}>Voir tous les avis</button>
              </Card>
            </div>
          </div>
        )}
        {nouvelleD&&<Card><SoumettreDemande unite={unite} onAjouter={onAjouter} onRetour={function(){setNouvelleD(false);setOnglet("demandes");}}/></Card>}
        {onglet==="demandes"&&!nouvelleD&&<MesDemandes unite={unite} tickets={tickets} onNouvelle={function(){setNouvelleD(true);}}/>}
        {onglet==="compte"&&!nouvelleD&&<MonCompte unite={unite}/>}
        {onglet==="documents"&&!nouvelleD&&<MesDocuments unite={unite}/>}
        {onglet==="avis"&&!nouvelleD&&<MesAvis/>}
      </div>
    </div>
  );
}
