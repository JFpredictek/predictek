import { useState } from "react";
const T={bg:"#F5F3EE",surface:"#FFF",surfaceAlt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentMid:"#2D8653",accentLight:"#E8F2EC",accentPop:"#3CAF6E",gold:"#B8943A",red:"#B83232",redLight:"#FDECEA",amber:"#B86020",amberLight:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueLight:"#EFF6FF"};
const STATS={"515":["1","2"],"517":["3"],"519":["4"],"521":["5"],"523":["8"],"525":["10","11"],"527":["12","13"],"529":["14"],"531":["15"],"533":["17"],"535":["18"],"537":["20"],"539":["21","22"],"541":["23","24"],"543":["26"],"545":["27"],"547":["30"],"549":["32"],"551":["33"],"553":["34","35"],"555":["36","37"],"557":["38"],"559":["40"],"561":["42"],"563":["43"],"565":["45"],"567":["46","47"],"569":["48","49"],"571":["50"],"573":["52"],"575":["53"],"577":["55"],"579":["56"],"581":["57","58"],"583":["60"],"585":["59"]};
const ALL=[{u:"515",f:3.875,m:530.59,nom:"Michel Beaudoin"},{u:"517",f:2.666,m:365.05,nom:"Marilou Noreau"},{u:"519",f:2.666,m:365.05,nom:"Tommy Boulianne"},{u:"521",f:2.666,m:365.05,nom:"Jean-Francois Begin"},{u:"523",f:2.666,m:365.05,nom:"Joyce McCartney"},{u:"525",f:3.833,m:524.84,nom:"Simon Pellerin"},{u:"527",f:3.874,m:530.45,nom:"Fabienne Maltais"},{u:"529",f:2.133,m:292.06,nom:"K. Bolduc & A. Fortier"},{u:"531",f:2.133,m:292.06,nom:"J-F Laroche & M. Fredette"},{u:"533",f:2.389,m:327.12,nom:"D. Lemaire & K. Marchand"},{u:"535",f:2.133,m:292.06,nom:"Guillaume Rouillard"},{u:"537",f:2.133,m:292.06,nom:"Catherine Perreault"},{u:"539",f:3.840,m:525.80,nom:"Lucette Tremblay"},{u:"541",f:3.847,m:526.76,nom:"Emile Poulin"},{u:"543",f:2.133,m:292.06,nom:"Michel Salvas"},{u:"545",f:2.133,m:292.06,nom:"Julie Bergeron"},{u:"547",f:2.392,m:327.53,nom:"Denis Audet"},{u:"549",f:2.133,m:292.06,nom:"Nicolas Gignac"},{u:"551",f:2.133,m:292.06,nom:"M. Baril & M. Poisson"},{u:"553",f:3.865,m:529.22,nom:"Claude Pinard"},{u:"555",f:3.747,m:513.06,nom:"Robert Donnelly"},{u:"557",f:2.067,m:283.03,nom:"K. Villeneuve & J-S Gagnon"},{u:"559",f:2.067,m:283.03,nom:"B. Dufour & N. Massey"},{u:"561",f:2.328,m:318.77,nom:"Raymond April"},{u:"563",f:2.067,m:283.03,nom:"Luc-Andre Lussier"},{u:"565",f:2.067,m:283.03,nom:"M-A Gravel & C. Desjardins"},{u:"567",f:3.724,m:509.91,nom:"M-A Gravel & C. Desjardins"},{u:"569",f:3.569,m:488.69,nom:"Algest & A. Pelletier"},{u:"571",f:2.012,m:275.50,nom:"T. Martineau & C. Deschamps"},{u:"573",f:2.012,m:275.50,nom:"V. Tremblay & E. Blanchet"},{u:"575",f:2.264,m:310.00,nom:"Caroline Dompierre"},{u:"577",f:2.012,m:275.50,nom:"S. Gobeil & M-E Vaillancourt"},{u:"579",f:2.012,m:275.50,nom:"Sylvie Bergeron"},{u:"581",f:3.703,m:507.04,nom:"Doris Poitras"},{u:"583",f:4.353,m:596.04,nom:"S. Grondin & X. Grondin"},{u:"585",f:4.353,m:596.04,nom:"Y. Dusseault & A. Beauchesne"}];

function mkU(c,x){
  var b={u:c.u,f:c.f,m:c.m,props:[{prenom:c.nom.split(" ")[0],nom:c.nom.split(" ").slice(1).join(" "),tel:"",courriel:"",adresse:c.u+" ch. du Hibou",principal:true}],urgence:{nom:"",lien:"",tel:""},vehicules:[],stats:STATS[c.u]||[],casiers:[],animaux:[],loc:{actif:false,type:"long_terme",occ:[],debut:"",fin:"",loyer:""},banque:{inst:"815",transit:"06202",compte:"",tit:c.nom,ok:false,dateAut:""},ce:{marque:"",modele:"",serie:"",install:"",expiry:"",preuve:false,notes:""},ass:{cie:"",police:"",montant:2000000,expiry:"",preuve:false,notes:""},hist:[]};
  if(x){Object.keys(x).forEach(function(k){b[k]=x[k];});}
  return b;
}
const XTRA={
  "515":{props:[{prenom:"Michel",nom:"Beaudoin",tel:"418-555-0101",courriel:"m.beaudoin@email.com",adresse:"515 ch. du Hibou",principal:true}],urgence:{nom:"Sylvie Beaudoin",lien:"Conjointe",tel:"418-555-0102"},vehicules:[{plaque:"ABC-123",marque:"Toyota",modele:"Camry",couleur:"Gris",annee:"2022"}],banque:{inst:"815",transit:"06202",compte:"123456789",tit:"Michel Beaudoin",ok:true,dateAut:"2024-11-01"},ce:{marque:"Rheem",modele:"ECH2 50",serie:"SN515",install:"2019-03-15",expiry:"2029-03-15",preuve:true,notes:""},ass:{cie:"Intact",police:"POL-515",montant:2000000,expiry:"2026-12-31",preuve:true,notes:""},hist:[{date:"2019-08-15",vendeur:"Pierre Lavoie",acheteur:"Michel Beaudoin",prix:285000,notaire:"Me Gagnon",preuve:true}]},
  "531":{props:[{prenom:"Jean-Francois",nom:"Laroche",tel:"819-479-4203",courriel:"jf.laroche@email.com",adresse:"531 ch. du Hibou",principal:true},{prenom:"Maryse",nom:"Fredette",tel:"418-555-0532",courriel:"m.fredette@email.com",adresse:"531 ch. du Hibou",principal:false}],urgence:{nom:"Robert Laroche",lien:"Pere",tel:"418-555-0533"},vehicules:[{plaque:"GHI-789",marque:"Ford",modele:"F-150",couleur:"Blanc",annee:"2023"}],casiers:["C-12"],animaux:[{nom:"Luna",espece:"Chat",race:"Siamois",couleur:"Creme"}],banque:{inst:"815",transit:"06202",compte:"456789123",tit:"Jean-Francois Laroche",ok:true,dateAut:"2024-11-01"},ce:{marque:"AO Smith",modele:"GPVH-50",serie:"SN531",install:"2020-09-10",expiry:"2030-09-10",preuve:true,notes:""},ass:{cie:"SSQ",police:"POL-531",montant:2000000,expiry:"2026-08-01",preuve:true,notes:"President CA"},hist:[{date:"2014-05-20",vendeur:"Promoteur Piedmont",acheteur:"J-F Laroche",prix:248000,notaire:"Me Gagnon",preuve:true}]},
  "539":{props:[{prenom:"Lucette",nom:"Tremblay",tel:"418-555-0539",courriel:"l.tremblay@email.com",adresse:"539 ch. du Hibou",principal:true}],urgence:{nom:"Marc Tremblay",lien:"Fils",tel:"418-555-0540"},animaux:[{nom:"Minou",espece:"Chat",race:"Persan",couleur:"Blanc"},{nom:"Bijou",espece:"Chat",race:"Persan",couleur:"Gris"}],loc:{actif:true,type:"long_terme",occ:[{prenom:"Amelie",nom:"Cote",tel:"418-555-9001",courriel:"amelie.cote@email.com"}],debut:"2025-09-01",fin:"2026-08-31",loyer:1400},banque:{inst:"815",transit:"06202",compte:"321654987",tit:"Lucette Tremblay",ok:true,dateAut:"2024-11-01"},ce:{marque:"Giant",modele:"G6-E50",serie:"SN539",install:"2014-04-22",expiry:"2024-04-22",preuve:false,notes:"EXPIRE - action requise"},ass:{cie:"Promutuel",police:"POL-539",montant:2000000,expiry:"2026-06-15",preuve:false,notes:""},hist:[{date:"2010-11-01",vendeur:"Promoteur Piedmont",acheteur:"Rene Tremblay",prix:235000,notaire:"Me Lesage",preuve:true},{date:"2018-04-12",vendeur:"Rene Tremblay",acheteur:"Lucette Tremblay",prix:310000,notaire:"Me Gagnon",preuve:true}]},
  "583":{props:[{prenom:"Sebastien",nom:"Grondin",tel:"418-555-0583",courriel:"s.grondin@email.com",adresse:"583 ch. du Hibou",principal:true},{prenom:"Xavier",nom:"Grondin",tel:"418-555-0584",courriel:"x.grondin@email.com",adresse:"583 ch. du Hibou",principal:false}],loc:{actif:true,type:"court_terme",occ:[],debut:"",fin:"",loyer:300},banque:{inst:"815",transit:"06202",compte:"654321789",tit:"Sebastien Grondin",ok:true,dateAut:"2024-11-01"},ce:{marque:"Rheem",modele:"ECH2 40",serie:"SN583",install:"2022-01-15",expiry:"2032-01-15",preuve:true,notes:""},ass:{cie:"Belair",police:"POL-583",montant:1500000,expiry:"2026-10-01",preuve:true,notes:"Montant < 2M$"},hist:[{date:"2021-07-30",vendeur:"Claudette Simard",acheteur:"S. Grondin & X. Grondin",prix:378000,notaire:"Me Gagnon",preuve:true}]}
};
const DINIT=(function(){var m={};ALL.forEach(function(c){m[c.u]=mkU(c,XTRA[c.u]);});return m;})();

var money=function(n){if(!n&&n!==0)return"—";return(n<0?"-":"")+Math.abs(n).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var du=function(d){return d?Math.ceil((new Date(d)-new Date())/86400000):9999;};
var td=function(){return new Date().toISOString().slice(0,10);};
var ini=function(n){return n.split(" ").filter(function(w){return w.length>1;}).map(function(w){return w[0];}).join("").slice(0,2).toUpperCase();};

function expSt(d){
  if(!d)return{c:T.muted,l:"—",bg:"transparent",i:"—"};
  var j=du(d);
  if(j<0)return{c:T.red,l:"EXPIRE",bg:T.redLight,i:"X"};
  if(j<=30)return{c:T.red,l:j+"j",bg:T.redLight,i:"!"};
  if(j<=90)return{c:T.amber,l:j+"j",bg:T.amberLight,i:"~"};
  return{c:T.accent,l:"OK",bg:T.accentLight,i:"OK"};
}

function Badge(p){
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:20,background:p.bg||T.accentLight,color:p.c||T.accent,whiteSpace:"nowrap"}}>{p.children}</span>;
}

function Pill(p){
  return <span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:10,background:p.bg,color:p.c,border:"1px solid "+p.c+"40"}}>{p.l}</span>;
}

// ===================== FICHE DETAIL UNITE =====================
function FicheUnite(p){
  var d=p.data; var upd=p.onUpdate;
  var s=useState("info"); var tab=s[0]; var setTab=s[1];
  var inp={width:"100%",border:"1px solid "+T.border,borderRadius:6,padding:"6px 9px",fontSize:12,fontFamily:"inherit",background:T.surface,outline:"none",boxSizing:"border-box"};
  var TABS=["info","acces","location","banque","ce","assurance","mutations"];
  var TLABELS=["Proprietaires","Acces","Location","Bancaire","Chauffe-eau","Assurance","Mutations"];
  function sf(k,v){upd(function(prev){var n=Object.assign({},prev);n[d.u]=Object.assign({},n[d.u]);n[d.u][k]=v;return n;});}
  var ceS=expSt(d.ce?d.ce.expiry:"");
  var assS=expSt(d.ass?d.ass.expiry:"");
  return(
    <div style={{padding:"0 0 20px 0"}}>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {TABS.map(function(t,i){var a=tab===t;return(
          <button key={t} onClick={function(){setTab(t);}} style={{background:a?T.accent:T.surface,border:"1px solid "+(a?T.accent:T.border),borderRadius:7,padding:"5px 12px",color:a?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400}}>{TLABELS[i]}</button>
        );})}
      </div>
      {tab==="info"&&(
        <div>
          {d.props&&d.props.map(function(pr,i){return(
            <div key={i} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <b style={{fontSize:13,color:T.text}}>{pr.principal?"Proprietaire principal":"Co-proprietaire"}</b>
                {!pr.principal&&<Pill bg={T.surfaceAlt} c={T.muted} l="Secondaire"/>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Prenom</div><input value={pr.prenom||""} onChange={function(e){var np=d.props.map(function(x,j){return j===i?Object.assign({},x,{prenom:e.target.value}):x;});sf("props",np);}} style={inp}/></div>
                <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Nom</div><input value={pr.nom||""} onChange={function(e){var np=d.props.map(function(x,j){return j===i?Object.assign({},x,{nom:e.target.value}):x;});sf("props",np);}} style={inp}/></div>
                <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Telephone</div><input value={pr.tel||""} onChange={function(e){var np=d.props.map(function(x,j){return j===i?Object.assign({},x,{tel:e.target.value}):x;});sf("props",np);}} style={inp}/></div>
                <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Courriel</div><input value={pr.courriel||""} onChange={function(e){var np=d.props.map(function(x,j){return j===i?Object.assign({},x,{courriel:e.target.value}):x;});sf("props",np);}} style={inp}/></div>
              </div>
            </div>
          );})}
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
            <b style={{fontSize:12,color:T.text,display:"block",marginBottom:10}}>Contact urgence</b>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Nom</div><input value={d.urgence?d.urgence.nom:""} onChange={function(e){sf("urgence",Object.assign({},d.urgence,{nom:e.target.value}));}} style={inp}/></div>
              <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Lien</div><input value={d.urgence?d.urgence.lien:""} onChange={function(e){sf("urgence",Object.assign({},d.urgence,{lien:e.target.value}));}} style={inp}/></div>
              <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Telephone</div><input value={d.urgence?d.urgence.tel:""} onChange={function(e){sf("urgence",Object.assign({},d.urgence,{tel:e.target.value}));}} style={inp}/></div>
            </div>
          </div>
          {d.animaux&&d.animaux.length>0&&(
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
              <b style={{fontSize:12,color:T.text,display:"block",marginBottom:8}}>Animaux ({d.animaux.length}/2)</b>
              {d.animaux.map(function(a,i){return(
                <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
                  <span style={{fontSize:16}}>🐾</span>
                  <span style={{fontSize:12,color:T.text}}>{a.nom} — {a.espece} {a.race} ({a.couleur})</span>
                </div>
              );})}
            </div>
          )}
          {d.vehicules&&d.vehicules.length>0&&(
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
              <b style={{fontSize:12,color:T.text,display:"block",marginBottom:8}}>Vehicules</b>
              {d.vehicules.map(function(v,i){return(
                <div key={i} style={{fontSize:12,color:T.text,marginBottom:4}}>{v.plaque} — {v.annee} {v.marque} {v.modele} ({v.couleur})</div>
              );})}
            </div>
          )}
        </div>
      )}
      {tab==="banque"&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <b style={{fontSize:13}}>Prelevement bancaire</b>
            <Badge bg={d.banque&&d.banque.ok?T.accentLight:T.redLight} c={d.banque&&d.banque.ok?T.accent:T.red}>{d.banque&&d.banque.ok?"Autorise":"Non autorise"}</Badge>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Institution</div><input value={d.banque?d.banque.inst:""} onChange={function(e){sf("banque",Object.assign({},d.banque,{inst:e.target.value}));}} style={inp}/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Transit</div><input value={d.banque?d.banque.transit:""} onChange={function(e){sf("banque",Object.assign({},d.banque,{transit:e.target.value}));}} style={inp}/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>No compte</div><input value={d.banque?d.banque.compte:""} onChange={function(e){sf("banque",Object.assign({},d.banque,{compte:e.target.value}));}} style={inp}/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Titulaire</div><input value={d.banque?d.banque.tit:""} onChange={function(e){sf("banque",Object.assign({},d.banque,{tit:e.target.value}));}} style={inp}/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Date autorisation</div><input type="date" value={d.banque?d.banque.dateAut:""} onChange={function(e){sf("banque",Object.assign({},d.banque,{dateAut:e.target.value}));}} style={inp}/></div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:16}}>
              <input type="checkbox" checked={!!(d.banque&&d.banque.ok)} onChange={function(e){sf("banque",Object.assign({},d.banque,{ok:e.target.checked}));}} id={"bok"+d.u}/>
              <label htmlFor={"bok"+d.u} style={{fontSize:12,color:T.text,cursor:"pointer"}}>Autorisation confirmee</label>
            </div>
          </div>
          <div style={{background:T.accentLight,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:600}}>
            Cotisation mensuelle: {money(d.m)}
          </div>
        </div>
      )}
      {tab==="ce"&&(
        <div style={{background:T.surface,border:"1px solid "+(ceS.c===T.red?T.red:T.border),borderRadius:10,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <b style={{fontSize:13}}>Chauffe-eau</b>
            <Badge bg={ceS.bg} c={ceS.c}>{ceS.l}</Badge>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Marque</div><input value={d.ce?d.ce.marque:""} onChange={function(e){sf("ce",Object.assign({},d.ce,{marque:e.target.value}));}} style={inp}/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Modele</div><input value={d.ce?d.ce.modele:""} onChange={function(e){sf("ce",Object.assign({},d.ce,{modele:e.target.value}));}} style={inp}/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>No serie</div><input value={d.ce?d.ce.serie:""} onChange={function(e){sf("ce",Object.assign({},d.ce,{serie:e.target.value}));}} style={inp}/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Date install.</div><input type="date" value={d.ce?d.ce.install:""} onChange={function(e){var exp=e.target.value?new Date(e.target.value):null;var expStr="";if(exp){exp.setFullYear(exp.getFullYear()+10);expStr=exp.toISOString().slice(0,10);}sf("ce",Object.assign({},d.ce,{install:e.target.value,expiry:expStr}));}} style={inp}/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Expiration (10 ans)</div><input type="date" value={d.ce?d.ce.expiry:""} onChange={function(e){sf("ce",Object.assign({},d.ce,{expiry:e.target.value}));}} style={inp}/></div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:16}}>
              <input type="checkbox" checked={!!(d.ce&&d.ce.preuve)} onChange={function(e){sf("ce",Object.assign({},d.ce,{preuve:e.target.checked}));}} id={"cep"+d.u}/>
              <label htmlFor={"cep"+d.u} style={{fontSize:12,color:T.text,cursor:"pointer"}}>Preuve recue</label>
            </div>
          </div>
          {d.ce&&d.ce.notes&&<div style={{background:T.redLight,borderRadius:6,padding:"8px 12px",fontSize:11,color:T.red,marginTop:8}}>{d.ce.notes}</div>}
        </div>
      )}
      {tab==="assurance"&&(
        <div style={{background:T.surface,border:"1px solid "+(assS.c===T.red?T.red:T.border),borderRadius:10,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <b style={{fontSize:13}}>Assurance responsabilite civile</b>
            <Badge bg={assS.bg} c={assS.c}>{assS.l}</Badge>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Assureur</div><input value={d.ass?d.ass.cie:""} onChange={function(e){sf("ass",Object.assign({},d.ass,{cie:e.target.value}));}} style={inp}/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>No police</div><input value={d.ass?d.ass.police:""} onChange={function(e){sf("ass",Object.assign({},d.ass,{police:e.target.value}));}} style={inp}/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Montant (min 2M$)</div><input type="number" value={d.ass?d.ass.montant:2000000} onChange={function(e){sf("ass",Object.assign({},d.ass,{montant:parseInt(e.target.value)||0}));}} style={inp}/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Expiration</div><input type="date" value={d.ass?d.ass.expiry:""} onChange={function(e){sf("ass",Object.assign({},d.ass,{expiry:e.target.value}));}} style={inp}/></div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:16}}>
              <input type="checkbox" checked={!!(d.ass&&d.ass.preuve)} onChange={function(e){sf("ass",Object.assign({},d.ass,{preuve:e.target.checked}));}} id={"assp"+d.u}/>
              <label htmlFor={"assp"+d.u} style={{fontSize:12,color:T.text,cursor:"pointer"}}>Attestation recue</label>
            </div>
          </div>
          {d.ass&&d.ass.montant<2000000&&<div style={{background:T.redLight,borderRadius:6,padding:"8px 12px",fontSize:11,color:T.red,marginTop:8}}>Attention: montant inferieur au minimum requis de 2 000 000 $</div>}
        </div>
      )}
      {tab==="location"&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <b style={{fontSize:13}}>Statut locatif</b>
            <Badge bg={d.loc&&d.loc.actif?T.amberLight:T.accentLight} c={d.loc&&d.loc.actif?T.amber:T.accent}>{d.loc&&d.loc.actif?"Location active":"Proprietaire occupant"}</Badge>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <label style={{display:"flex",gap:6,alignItems:"center",fontSize:12,color:T.text,cursor:"pointer"}}>
              <input type="checkbox" checked={!!(d.loc&&d.loc.actif)} onChange={function(e){sf("loc",Object.assign({},d.loc,{actif:e.target.checked}));}}/>Unite louee
            </label>
          </div>
          {d.loc&&d.loc.actif&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
                <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Type</div>
                  <select value={d.loc.type||"long_terme"} onChange={function(e){sf("loc",Object.assign({},d.loc,{type:e.target.value}));}} style={inp}>
                    <option value="long_terme">Long terme</option>
                    <option value="court_terme">Court terme (Airbnb)</option>
                  </select>
                </div>
                <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Debut bail</div><input type="date" value={d.loc.debut||""} onChange={function(e){sf("loc",Object.assign({},d.loc,{debut:e.target.value}));}} style={inp}/></div>
                <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Fin bail</div><input type="date" value={d.loc.fin||""} onChange={function(e){sf("loc",Object.assign({},d.loc,{fin:e.target.value}));}} style={inp}/></div>
              </div>
              {d.loc.occ&&d.loc.occ.length>0&&(
                <div style={{background:T.surfaceAlt,borderRadius:8,padding:12,marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.text,marginBottom:8}}>Locataire(s)</div>
                  {d.loc.occ.map(function(o,i){return(
                    <div key={i} style={{fontSize:12,color:T.text,marginBottom:4}}>{o.prenom} {o.nom} — {o.tel} — {o.courriel}</div>
                  );})}
                </div>
              )}
              {d.loc.type==="court_terme"&&<div style={{background:T.amberLight,borderRadius:6,padding:"8px 12px",fontSize:11,color:T.amber}}>Art. 107.5: Penalite 300$/jour ou 125% du loyer mensuel si non autorisee</div>}
            </div>
          )}
        </div>
      )}
      {tab==="mutations"&&(
        <div>
          {d.hist&&d.hist.length>0?(
            d.hist.map(function(h,i){return(
              <div key={i} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <b style={{fontSize:13,color:T.text}}>{h.date} — {money(h.prix)}</b>
                  <Badge bg={h.preuve?T.accentLight:T.redLight} c={h.preuve?T.accent:T.red}>{h.preuve?"Doc recu":"Manquant"}</Badge>
                </div>
                <div style={{fontSize:12,color:T.muted}}>{h.vendeur} → {h.acheteur} | Notaire: {h.notaire}</div>
              </div>
            )})
          ):(
            <div style={{textAlign:"center",color:T.muted,fontSize:13,padding:30}}>Aucune mutation enregistree</div>
          )}
        </div>
      )}
      {tab==="acces"&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
          <b style={{fontSize:13,display:"block",marginBottom:12}}>Casiers & stationnements</b>
          {d.stats&&d.stats.length>0&&<div style={{marginBottom:12}}><div style={{fontSize:10,color:T.muted,marginBottom:4}}>Stationnements</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{d.stats.map(function(s){return <Badge key={s} bg={T.blueLight} c={T.blue}>P-{s}</Badge>;})}</div></div>}
          {d.casiers&&d.casiers.length>0&&<div><div style={{fontSize:10,color:T.muted,marginBottom:4}}>Casiers</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{d.casiers.map(function(c){return <Badge key={c} bg={T.accentLight} c={T.accent}>{c}</Badge>;})}</div></div>}
          {(!d.stats||d.stats.length===0)&&(!d.casiers||d.casiers.length===0)&&<div style={{color:T.muted,fontSize:12}}>Aucun acces enregistre</div>}
        </div>
      )}
    </div>
  );
}

// ===================== LIGNE TABLEAU DASHBOARD =====================
function LigneUnite(p){
  var d=p.data; var sel=p.sel; var onSel=p.onSel;
  var ceS=expSt(d.ce?d.ce.expiry:"");
  var assS=expSt(d.ass?d.ass.expiry:"");
  var bankOk=d.banque&&d.banque.ok;
  var hasLoc=d.loc&&d.loc.actif;
  var hasAnim=d.animaux&&d.animaux.length>0;
  var propName=d.props&&d.props[0]?d.props[0].prenom+" "+d.props[0].nom:d.u;
  var alerts=(ceS.c===T.red?1:0)+(assS.c===T.red?1:0)+(!bankOk?1:0)+(assS.c===T.amber?0.5:0)+(ceS.c===T.amber?0.5:0);
  var rowBg=sel?T.accentLight:(alerts>=2?T.redLight:alerts>=1?"#FFF9F0":T.surface);
  return(
    <tr onClick={onSel} style={{cursor:"pointer",background:rowBg,borderBottom:"1px solid "+T.border,transition:"background .1s"}}>
      <td style={{padding:"8px 10px",fontSize:12,fontWeight:700,color:T.navy,whiteSpace:"nowrap"}}>{d.u}</td>
      <td style={{padding:"8px 10px",fontSize:12,color:T.text,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{propName}{d.props&&d.props.length>1&&<span style={{fontSize:9,color:T.muted}}> +{d.props.length-1}</span>}</td>
      <td style={{padding:"8px 6px",fontSize:11,color:T.muted,textAlign:"right",whiteSpace:"nowrap"}}>{d.f.toFixed(3)}%</td>
      <td style={{padding:"8px 6px",fontSize:12,fontWeight:600,color:T.text,textAlign:"right",whiteSpace:"nowrap"}}>{money(d.m)}</td>
      <td style={{padding:"8px 6px",textAlign:"center"}}>
        <span style={{display:"inline-block",width:18,height:18,borderRadius:"50%",background:bankOk?T.accent:T.red,color:"#fff",fontSize:9,fontWeight:700,lineHeight:"18px",textAlign:"center"}}>{bankOk?"✓":"!"}</span>
      </td>
      <td style={{padding:"8px 6px",textAlign:"center"}}>
        <span style={{fontSize:10,fontWeight:600,color:ceS.c,background:ceS.bg,padding:"2px 6px",borderRadius:10,whiteSpace:"nowrap"}}>{ceS.l}</span>
      </td>
      <td style={{padding:"8px 6px",textAlign:"center"}}>
        <span style={{fontSize:10,fontWeight:600,color:assS.c,background:assS.bg,padding:"2px 6px",borderRadius:10,whiteSpace:"nowrap"}}>{assS.l}</span>
      </td>
      <td style={{padding:"8px 6px",textAlign:"center"}}>
        {hasLoc&&<span style={{fontSize:9,fontWeight:700,padding:"2px 5px",borderRadius:8,background:d.loc.type==="court_terme"?T.redLight:T.amberLight,color:d.loc.type==="court_terme"?T.red:T.amber}}>{d.loc.type==="court_terme"?"AirBnb":"Loue"}</span>}
        {!hasLoc&&<span style={{color:T.muted,fontSize:10}}>—</span>}
      </td>
      <td style={{padding:"8px 6px",textAlign:"center"}}>
        {hasAnim&&<span title={d.animaux.map(function(a){return a.nom;}).join(", ")}>🐾 {d.animaux.length}</span>}
        {!hasAnim&&<span style={{color:T.muted,fontSize:10}}>—</span>}
      </td>
      <td style={{padding:"8px 6px",textAlign:"center"}}>
        {alerts>0&&<span style={{fontSize:10,fontWeight:700,color:"#fff",background:T.red,padding:"2px 6px",borderRadius:10}}>{Math.ceil(alerts)}</span>}
        {alerts===0&&<span style={{fontSize:10,color:T.accent}}>✓</span>}
      </td>
    </tr>
  );
}

// ===================== MODULE PRINCIPAL =====================
export default function Piedmont(){
  var s1=useState(DINIT); var data=s1[0]; var setData=s1[1];
  var s2=useState(null); var sel=s2[0]; var setSel=s2[1];
  var s3=useState("tous"); var filtre=s3[0]; var setFiltre=s3[1];
  var s4=useState(""); var search=s4[0]; var setSearch=s4[1];

  var totalMensuel=ALL.reduce(function(acc,c){return acc+c.m;},0);
  var alertesCE=ALL.filter(function(c){var d=data[c.u];return d&&d.ce&&expSt(d.ce.expiry).c===T.red;}).length;
  var alertesAss=ALL.filter(function(c){var d=data[c.u];return d&&d.ass&&expSt(d.ass.expiry).c===T.red;}).length;
  var nonAut=ALL.filter(function(c){var d=data[c.u];return d&&!(d.banque&&d.banque.ok);}).length;
  var locataires=ALL.filter(function(c){var d=data[c.u];return d&&d.loc&&d.loc.actif;}).length;

  var liste=ALL.filter(function(c){
    var d=data[c.u];
    if(!d)return false;
    if(search){var q=search.toLowerCase();var nm=(d.props&&d.props[0]?d.props[0].prenom+" "+d.props[0].nom:"").toLowerCase();if(!c.u.includes(q)&&!nm.includes(q))return false;}
    if(filtre==="alertes"){var ceS=expSt(d.ce?d.ce.expiry:"");var assS=expSt(d.ass?d.ass.expiry:"");return ceS.c===T.red||assS.c===T.red||!(d.banque&&d.banque.ok);}
    if(filtre==="ce"){return d.ce&&expSt(d.ce.expiry).c===T.red;}
    if(filtre==="ass"){return d.ass&&expSt(d.ass.expiry).c===T.red;}
    if(filtre==="location"){return d.loc&&d.loc.actif;}
    if(filtre==="banque"){return !(d.banque&&d.banque.ok);}
    return true;
  });

  var selData=sel?data[sel]:null;

  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      {/* STATS RAPIDES */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:16}}>
        {[
          {l:"Unites",v:ALL.length,c:T.navy,bg:T.blueLight},
          {l:"Cotisations/mois",v:money(totalMensuel),c:T.accent,bg:T.accentLight},
          {l:"Non-autorises PAP",v:nonAut,c:nonAut>0?T.red:T.accent,bg:nonAut>0?T.redLight:T.accentLight},
          {l:"Alertes CE/Ass.",v:alertesCE+alertesAss,c:(alertesCE+alertesAss)>0?T.red:T.accent,bg:(alertesCE+alertesAss)>0?T.redLight:T.accentLight},
          {l:"Unites louees",v:locataires,c:locataires>0?T.amber:T.accent,bg:locataires>0?T.amberLight:T.accentLight},
        ].map(function(s,i){return(
          <div key={i} style={{background:s.bg,borderRadius:10,padding:"12px 14px",border:"1px solid "+s.c+"30"}}>
            <div style={{fontSize:10,color:s.c,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{s.l}</div>
            <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
          </div>
        );})}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        {/* FILTRES */}
        {[["tous","Tous (36)"],["alertes","Alertes"],["banque","PAP manquant"],["ce","CE expire"],["ass","Ass. expiree"],["location","Locataires"]].map(function(f){var a=filtre===f[0];return(
          <button key={f[0]} onClick={function(){setFiltre(f[0]);}} style={{background:a?T.navy:"#fff",border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"5px 12px",color:a?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{f[1]}</button>
        );})}
        <div style={{marginLeft:"auto"}}>
          <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Rechercher unité ou nom..." style={{border:"1px solid "+T.border,borderRadius:20,padding:"5px 14px",fontSize:11,fontFamily:"inherit",outline:"none",width:200}}/>
        </div>
      </div>

      <div style={{display:"flex",gap:12}}>
        {/* TABLEAU */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:T.navy}}>
                    {["Unite","Proprietaire","Fract.","Cotisation","PAP","Chauffe-eau","Assurance","Location","Animaux","Alertes"].map(function(h){return(
                      <th key={h} style={{padding:"8px 6px",fontSize:10,fontWeight:700,color:"#8da0bb",textAlign:h==="Unite"||h==="Proprietaire"?"left":"center",whiteSpace:"nowrap",letterSpacing:"0.05em"}}>{h}</th>
                    );})}
                  </tr>
                </thead>
                <tbody>
                  {liste.map(function(c){return(
                    <LigneUnite key={c.u} data={data[c.u]} sel={sel===c.u} onSel={function(){setSel(sel===c.u?null:c.u);}} />
                  );})}
                </tbody>
              </table>
            </div>
            {liste.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:13}}>Aucune unite trouvee</div>}
            <div style={{padding:"8px 14px",background:T.surfaceAlt,fontSize:11,color:T.muted,borderTop:"1px solid "+T.border}}>
              {liste.length} unite(s) affichee(s) sur 36
            </div>
          </div>
        </div>

        {/* FICHE DETAIL */}
        {sel&&selData&&(
          <div style={{width:480,flexShrink:0}}>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Unite {sel}</div>
                  <div style={{fontSize:13,color:T.text,marginTop:2}}>{selData.props&&selData.props[0]?selData.props[0].prenom+" "+selData.props[0].nom:""}</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:2}}>Fraction: {selData.f.toFixed(3)}% | Cotisation: {money(selData.m)}/mois</div>
                </div>
                <button onClick={function(){setSel(null);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.muted}}>x</button>
              </div>
              <FicheUnite data={selData} onUpdate={setData}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
