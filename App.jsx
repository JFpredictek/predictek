import { useState } from "react";
const T={bg:"#F5F3EE",surface:"#FFF",surfaceAlt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentMid:"#2D8653",accentLight:"#E8F2EC",accentPop:"#3CAF6E",gold:"#B8943A",red:"#B83232",redLight:"#FDECEA",amber:"#B86020",amberLight:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueLight:"#EFF6FF"};
const STATS={"515":["1","2"],"517":["3"],"519":["4"],"521":["5"],"523":["8"],"525":["10","11"],"527":["12","13"],"529":["14"],"531":["15"],"533":["17"],"535":["18"],"537":["20"],"539":["21","22"],"541":["23","24"],"543":["26"],"545":["27"],"547":["30"],"549":["32"],"551":["33"],"553":["34","35"],"555":["36","37"],"557":["38"],"559":["40"],"561":["42"],"563":["43"],"565":["45"],"567":["46","47"],"569":["48","49"],"571":["50"],"573":["52"],"575":["53"],"577":["55"],"579":["56"],"581":["57","58"],"583":["60"],"585":["59"]};
const ALL=[{u:"515",f:3.875,m:530.59,nom:"Michel Beaudoin"},{u:"517",f:2.666,m:365.05,nom:"Marilou Noreau"},{u:"519",f:2.666,m:365.05,nom:"Tommy Boulianne"},{u:"521",f:2.666,m:365.05,nom:"Jean-François Bégin"},{u:"523",f:2.666,m:365.05,nom:"Joyce McCartney"},{u:"525",f:3.833,m:524.84,nom:"Simon Pellerin"},{u:"527",f:3.874,m:530.45,nom:"Fabienne Maltais"},{u:"529",f:2.133,m:292.06,nom:"K. Bolduc & A. Fortier"},{u:"531",f:2.133,m:292.06,nom:"J-F Laroche & M. Fredette"},{u:"533",f:2.389,m:327.12,nom:"D. Lemaire & K. Marchand"},{u:"535",f:2.133,m:292.06,nom:"Guillaume Rouillard"},{u:"537",f:2.133,m:292.06,nom:"Catherine Perreault"},{u:"539",f:3.840,m:525.80,nom:"Lucette Tremblay"},{u:"541",f:3.847,m:526.76,nom:"Emile Poulin"},{u:"543",f:2.133,m:292.06,nom:"Michel Salvas"},{u:"545",f:2.133,m:292.06,nom:"Julie Bergeron"},{u:"547",f:2.392,m:327.53,nom:"Denis Audet"},{u:"549",f:2.133,m:292.06,nom:"Nicolas Gignac"},{u:"551",f:2.133,m:292.06,nom:"M. Baril & M. Poisson"},{u:"553",f:3.865,m:529.22,nom:"Claude Pinard"},{u:"555",f:3.747,m:513.06,nom:"Robert Donnelly"},{u:"557",f:2.067,m:283.03,nom:"K. Villeneuve & J-S Gagnon"},{u:"559",f:2.067,m:283.03,nom:"B. Dufour & N. Massey"},{u:"561",f:2.328,m:318.77,nom:"Raymond April"},{u:"563",f:2.067,m:283.03,nom:"Luc-André Lussier"},{u:"565",f:2.067,m:283.03,nom:"M-A Gravel & C. Desjardins"},{u:"567",f:3.724,m:509.91,nom:"M-A Gravel & C. Desjardins"},{u:"569",f:3.569,m:488.69,nom:"Algest & A. Pelletier"},{u:"571",f:2.012,m:275.50,nom:"T. Martineau & C. Deschamps"},{u:"573",f:2.012,m:275.50,nom:"V. Tremblay & E. Blanchet"},{u:"575",f:2.264,m:310.00,nom:"Caroline Dompierre"},{u:"577",f:2.012,m:275.50,nom:"S. Gobeil & M-E Vaillancourt"},{u:"579",f:2.012,m:275.50,nom:"Sylvie Bergeron"},{u:"581",f:3.703,m:507.04,nom:"Doris Poitras"},{u:"583",f:4.353,m:596.04,nom:"S. Grondin & X. Grondin"},{u:"585",f:4.353,m:596.04,nom:"Y. Dusseault & A. Beauchesne"}];

function mkU(c,x){
  var b={u:c.u,f:c.f,m:c.m,props:[{prenom:c.nom.split(" ")[0],nom:c.nom.split(" ").slice(1).join(" "),tel:"",courriel:"",adresse:c.u+" ch. du Hibou",principal:true}],urgence:{nom:"",lien:"",tel:""},vehicules:[],stats:STATS[c.u]||[],casiers:[],animaux:[],loc:{actif:false,type:"long_terme",occ:[],debut:"",fin:"",loyer:""},banque:{inst:"815",transit:"06202",compte:"",tit:c.nom,ok:false,dateAut:""},ce:{marque:"",modele:"",serie:"",install:"",expiry:"",preuve:false,notes:""},ass:{cie:"",police:"",montant:2000000,expiry:"",preuve:false,notes:""},hist:[]};
  if(x){Object.keys(x).forEach(function(k){b[k]=x[k];});}
  return b;
}
const XTRA={
  "515":{props:[{prenom:"Michel",nom:"Beaudoin",tel:"418-555-0101",courriel:"m.beaudoin@email.com",adresse:"515 ch. du Hibou",principal:true}],urgence:{nom:"Sylvie Beaudoin",lien:"Conjointe",tel:"418-555-0102"},vehicules:[{plaque:"ABC-123",marque:"Toyota",modele:"Camry",couleur:"Gris",annee:"2022"}],banque:{inst:"815",transit:"06202",compte:"123456789",tit:"Michel Beaudoin",ok:true,dateAut:"2024-11-01"},ce:{marque:"Rheem",modele:"ECH2 50",serie:"SN515",install:"2019-03-15",expiry:"2029-03-15",preuve:true,notes:""},ass:{cie:"Intact",police:"POL-515",montant:2000000,expiry:"2026-12-31",preuve:true,notes:""},hist:[{date:"2019-08-15",vendeur:"Pierre Lavoie",acheteur:"Michel Beaudoin",prix:285000,notaire:"Me Gagnon",preuve:true}]},
  "531":{props:[{prenom:"Jean-François",nom:"Laroche",tel:"819-479-4203",courriel:"jf.laroche@email.com",adresse:"531 ch. du Hibou",principal:true},{prenom:"Maryse",nom:"Fredette",tel:"418-555-0532",courriel:"m.fredette@email.com",adresse:"531 ch. du Hibou",principal:false}],urgence:{nom:"Robert Laroche",lien:"Pere",tel:"418-555-0533"},vehicules:[{plaque:"GHI-789",marque:"Ford",modele:"F-150",couleur:"Blanc",annee:"2023"}],casiers:["C-12"],animaux:[{nom:"Luna",espece:"Chat",race:"Siamois",couleur:"Creme"}],banque:{inst:"815",transit:"06202",compte:"456789123",tit:"Jean-François Laroche",ok:true,dateAut:"2024-11-01"},ce:{marque:"AO Smith",modele:"GPVH-50",serie:"SN531",install:"2020-09-10",expiry:"2030-09-10",preuve:true,notes:""},ass:{cie:"SSQ",police:"POL-531",montant:2000000,expiry:"2026-08-01",preuve:true,notes:"President CA"},hist:[{date:"2014-05-20",vendeur:"Promoteur Piedmont",acheteur:"J-F Laroche & M. Fredette",prix:248000,notaire:"Me Gagnon",preuve:true}]},
  "539":{props:[{prenom:"Lucette",nom:"Tremblay",tel:"418-555-0539",courriel:"l.tremblay@email.com",adresse:"539 ch. du Hibou",principal:true}],urgence:{nom:"Marc Tremblay",lien:"Fils",tel:"418-555-0540"},animaux:[{nom:"Minou",espece:"Chat",race:"Persan",couleur:"Blanc"},{nom:"Bijou",espece:"Chat",race:"Persan",couleur:"Gris"}],loc:{actif:true,type:"long_terme",occ:[{prenom:"Amelie",nom:"Cote",tel:"418-555-9001",courriel:"amelie.cote@email.com"}],debut:"2025-09-01",fin:"2026-08-31",loyer:1400},banque:{inst:"815",transit:"06202",compte:"321654987",tit:"Lucette Tremblay",ok:true,dateAut:"2024-11-01"},ce:{marque:"Giant",modele:"G6-E50",serie:"SN539",install:"2014-04-22",expiry:"2024-04-22",preuve:false,notes:"EXPIRE - action requise"},ass:{cie:"Promutuel",police:"POL-539",montant:2000000,expiry:"2026-06-15",preuve:false,notes:""},hist:[{date:"2010-11-01",vendeur:"Promoteur Piedmont",acheteur:"René Tremblay",prix:235000,notaire:"Me Lesage",preuve:true},{date:"2018-04-12",vendeur:"René Tremblay (succ.)",acheteur:"Lucette Tremblay",prix:310000,notaire:"Me Gagnon",preuve:true}]},
  "583":{props:[{prenom:"Sébastien",nom:"Grondin",tel:"418-555-0583",courriel:"s.grondin@email.com",adresse:"583 ch. du Hibou",principal:true},{prenom:"Xavier",nom:"Grondin",tel:"418-555-0584",courriel:"x.grondin@email.com",adresse:"583 ch. du Hibou",principal:false}],loc:{actif:true,type:"court_terme",occ:[],debut:"",fin:"",loyer:300},banque:{inst:"815",transit:"06202",compte:"654321789",tit:"Sébastien Grondin",ok:true,dateAut:"2024-11-01"},ce:{marque:"Rheem",modele:"ECH2 40",serie:"SN583",install:"2022-01-15",expiry:"2032-01-15",preuve:true,notes:""},ass:{cie:"Belair",police:"POL-583",montant:1500000,expiry:"2026-10-01",preuve:true,notes:"Montant < 2M$"},hist:[{date:"2021-07-30",vendeur:"Claudette Simard",acheteur:"S. Grondin & X. Grondin",prix:378000,notaire:"Me Gagnon",preuve:true}]}
};
const DINIT=(function(){var m={};ALL.forEach(function(c){m[c.u]=mkU(c,XTRA[c.u]);});return m;})();

var money=function(n){if(!n&&n!==0)return"—";return(n<0?"-":"")+Math.abs(n).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var du=function(d){return d?Math.ceil((new Date(d)-new Date())/86400000):9999;};
var td=function(){return new Date().toISOString().slice(0,10);};
var ini=function(n){return n.split(" ").filter(function(w){return w.length>1;}).map(function(w){return w[0];}).join("").slice(0,2).toUpperCase();};
var ay=function(d,y){if(!d)return"";var dt=new Date(d);dt.setFullYear(dt.getFullYear()+y);return dt.toISOString().slice(0,10);};
function expSt(d){
  if(!d)return{c:T.muted,l:"Non renseigne",i:"—"};
  var j=du(d);
  if(j<0)return{c:T.red,l:"EXPIRE ("+Math.abs(j)+"j)",i:"X"};
  if(j<=30)return{c:T.red,l:"Dans "+j+"j",i:"!"};
  if(j<=90)return{c:T.amber,l:"Dans "+j+"j",i:"~"};
  return{c:T.accent,l:"Valide - "+d,i:"OK"};
}
function genCSV(data,filter){
  var rows=ALL.filter(function(c){return filter==="all"||c.u===filter;}).map(function(c){var d=data[c.u];var b=d?d.banque:{};return[c.u,b.tit||c.nom,b.compte||"",b.transit||"",b.inst||"",c.m.toFixed(2),b.ok?"Oui":"NON"].join(",");});
  var csv="Unite,Titulaire,Compte,Transit,Institution,Montant,Autorise\n"+rows.join("\n");
  var blob=new Blob([csv],{type:"text/csv"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="prelevements_"+td()+".csv";a.click();URL.revokeObjectURL(url);
}

function Btn(p){return <button onClick={p.onClick} style={{background:p.bg||T.accent,border:"none",borderRadius:7,padding:p.sm?"4px 9px":"8px 15px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",...(p.s||{})}}>{p.children}</button>;}
function Tag(p){return <span style={{fontSize:p.sz||10,padding:"2px 6px",borderRadius:20,background:(p.c||T.accent)+"18",color:p.c||T.accent,fontWeight:600,whiteSpace:"nowrap"}}>{p.l}</span>;}
function Card(p){return <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,...(p.s||{})}}>{p.children}</div>;}
function Row(p){return <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:p.last?"none":"1px solid "+T.border+"30"}}><span style={{fontSize:11,color:T.muted}}>{p.l}</span><span style={{fontSize:11,fontWeight:500,color:T.text}}>{p.v}</span></div>;}
function SH(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8,fontWeight:600}}>{p.l}</div>;}
function F(p){return <div style={p.s}><div style={{fontSize:10,color:T.muted,marginBottom:3}}>{p.l}</div>{p.children}</div>;}
var inp={width:"100%",border:"1px solid "+T.border,borderRadius:6,padding:"6px 9px",fontSize:12,fontFamily:"inherit",boxSizing:"border-box",background:T.surface,outline:"none"};
function Modal(p){
  if(!p.open)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"#00000060",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={function(e){if(e.target===e.currentTarget)p.onClose();}}>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,width:p.w||480,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <b style={{fontSize:14,color:T.text}}>{p.title}</b>
          <button onClick={p.onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.muted}}>x</button>
        </div>
        {p.children}
      </div>
    </div>
  );
}
function MBtns(p){
  return(
    <div style={{display:"flex",gap:8,marginTop:14}}>
      <Btn onClick={p.onSave}>Enregistrer</Btn>
      {p.onDelete&&<Btn onClick={p.onDelete} bg={T.redLight} tc={T.red}>Supprimer</Btn>}
      <Btn onClick={p.onCancel} bg={T.surfaceAlt} tc={T.muted} s={{border:"1px solid "+T.border}}>Annuler</Btn>
    </div>
  );
}

// Sub-tab components
function TabProps(p){
  var U=p.U,upd=p.upd,openM=p.openM;
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <SH l="Proprietaires"/>
          <Btn sm onClick={function(){openM("prop",{prenom:"",nom:"",tel:"",courriel:"",adresse:"",principal:false});}} bg={T.accentLight} tc={T.accent}>+ Ajouter</Btn>
        </div>
        {U.props.map(function(pp,i){return(
          <div key={i} style={{display:"flex",gap:8,padding:"8px",background:T.surfaceAlt,borderRadius:7,marginBottom:5}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:pp.principal?T.accent:T.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",flexShrink:0}}>{ini(pp.prenom+" "+pp.nom)}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:600,color:T.text}}>{pp.prenom} {pp.nom} {pp.principal&&<Tag l="Principal" c={T.accent}/>}</div>
              <div style={{fontSize:9,color:T.muted}}>{pp.tel} · {pp.courriel}</div>
              <div style={{fontSize:9,color:T.muted}}>{pp.adresse}</div>
            </div>
            <Btn sm onClick={function(){openM("prop",Object.assign({},pp),i);}} bg={T.surfaceAlt} tc={T.muted} s={{border:"1px solid "+T.border}}>Edit</Btn>
          </div>
        );})}
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <SH l="Contact Urgence"/>
            <Btn sm onClick={function(){openM("urg",Object.assign({},U.urgence));}} bg={T.accentLight} tc={T.accent}>Edit</Btn>
          </div>
          {U.urgence.nom?(
            <div style={{background:T.amberLight,borderRadius:7,padding:"8px",border:"1px solid "+T.amber+"30"}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text}}>{U.urgence.nom}</div>
              <div style={{fontSize:11,color:T.amber}}>{U.urgence.lien}</div>
              <div style={{fontSize:11,color:T.text}}>{U.urgence.tel}</div>
            </div>
          ):<div style={{fontSize:11,color:T.muted,padding:"6px",textAlign:"center"}}>Non renseigne</div>}
        </Card>
        <Card s={{background:T.blueLight,border:"1px solid "+T.blue+"20"}}>
          <div style={{fontSize:10,color:T.blue}}>Art.114.5 - Remettre une copie de la cle aux administrateurs.</div>
        </Card>
      </div>
    </div>
  );
}

function TabInfos(p){
  var U=p.U,openM=p.openM;
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <SH l="Vehicules"/>
          <Btn sm onClick={function(){openM("veh",{plaque:"",marque:"",modele:"",couleur:"",annee:""});}} bg={T.accentLight} tc={T.accent}>+ Ajouter</Btn>
        </div>
        {U.vehicules.length===0&&<div style={{fontSize:11,color:T.muted,textAlign:"center",padding:"6px"}}>Aucun</div>}
        {U.vehicules.map(function(v,i){return(
          <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"7px",background:T.surfaceAlt,borderRadius:7,marginBottom:5}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:600,color:T.text}}>{v.marque} {v.modele} {v.annee}</div>
              <div style={{fontSize:9,color:T.muted}}>{v.plaque} · {v.couleur}</div>
            </div>
            <Btn sm onClick={function(){openM("veh",Object.assign({},v),i);}} bg={T.surfaceAlt} tc={T.muted} s={{border:"1px solid "+T.border}}>Edit</Btn>
          </div>
        );})}
      </Card>
      <Card>
        <SH l="Stationnements & Casiers"/>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:9,color:T.muted,marginBottom:5}}>Stationnements (Art.13)</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {U.stats.map(function(s,i){return <div key={i} style={{background:T.navy,color:"#fff",borderRadius:5,padding:"5px 10px",fontSize:11,fontWeight:700}}>No.{s}</div>;})}
          </div>
        </div>
        <div>
          <div style={{fontSize:9,color:T.muted,marginBottom:5}}>Casiers</div>
          {U.casiers.length>0?U.casiers.map(function(c,i){return <div key={i} style={{background:"#2D3748",color:"#fff",borderRadius:5,padding:"5px 10px",fontSize:11,fontWeight:700,display:"inline-block",marginRight:5}}>{c}</div>;}):(<span style={{fontSize:11,color:T.muted}}>Aucun</span>)}
        </div>
      </Card>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <SH l="Animaux"/>
          <Btn sm onClick={function(){openM("animal",{nom:"",espece:"Chat",race:"",couleur:""});}} bg={T.accentLight} tc={T.accent}>+ Ajouter</Btn>
        </div>
        <div style={{background:T.amberLight,borderRadius:5,padding:"4px 8px",marginBottom:7,fontSize:9,color:T.amber}}>Art.114.16 Max 2 · Pitbulls interdits</div>
        {U.animaux.length>2&&<div style={{background:T.redLight,borderRadius:5,padding:"4px 8px",marginBottom:5,fontSize:9,color:T.red,fontWeight:700}}>VIOLATION: {U.animaux.length} animaux (max 2)</div>}
        {U.animaux.map(function(a,i){return(
          <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"7px",background:T.surfaceAlt,borderRadius:7,marginBottom:5}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:600,color:T.text}}>{a.nom}</div>
              <div style={{fontSize:9,color:T.muted}}>{a.espece} · {a.race}</div>
            </div>
            <Btn sm onClick={function(){openM("animal",Object.assign({},a),i);}} bg={T.surfaceAlt} tc={T.muted} s={{border:"1px solid "+T.border}}>Edit</Btn>
          </div>
        );})}
      </Card>
      <Card>
        <SH l="Fraction"/>
        <Row l="Adresse" v={p.sel+" chemin du Hibou"}/>
        <Row l="Fraction" v={p.cf.toFixed(3)+"%"}/>
        <Row l="Voix" v={p.cf.toFixed(3)}/>
        <Row l="Mensuel" v={money(p.cm)}/>
        <Row l="Annuel" v={money(p.cm*12)} last/>
      </Card>
    </div>
  );
}

function TabLoc(p){
  var U=p.U,openM=p.openM;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <b style={{fontSize:13,color:T.text}}>Location — Unité {p.sel}</b>
        <Btn onClick={function(){openM("loc",Object.assign({},U.loc));}}>Modifier</Btn>
      </div>
      {!U.loc.actif?(
        <Card s={{textAlign:"center",padding:28}}>
          <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:4}}>Occupee par le(s) proprietaire(s)</div>
          <div style={{fontSize:11,color:T.muted}}>Aucune location en cours</div>
        </Card>
      ):(
        <div>
          <div style={{background:U.loc.type==="court_terme"?T.redLight:T.accentLight,border:"1px solid "+(U.loc.type==="court_terme"?T.red:T.accent)+"30",borderRadius:10,padding:"12px 16px",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:U.loc.type==="court_terme"?T.red:T.accent,marginBottom:4}}>
              {U.loc.type==="court_terme"?"LOCATION COURT TERME (Airbnb)":"Location long terme"}
            </div>
            {U.loc.type==="court_terme"&&<div style={{fontSize:11,color:T.red,marginBottom:6}}>Art.107.5 Penalite: 300$/jour ou 125% du loyer</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[["Debut",U.loc.debut||"—"],["Fin",U.loc.fin||"—"],["Loyer",money(U.loc.loyer)]].map(function(k,i){return(
                <div key={i} style={{background:"rgba(255,255,255,0.5)",borderRadius:6,padding:"7px 9px"}}>
                  <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:2}}>{k[0]}</div>
                  <div style={{fontSize:12,fontWeight:600,color:T.text}}>{k[1]}</div>
                </div>
              );})}
            </div>
          </div>
          {U.loc.type==="long_terme"&&U.loc.occ.length>0&&(
            <Card s={{marginBottom:10}}>
              <SH l="Occupants"/>
              {U.loc.occ.map(function(o,i){return(
                <div key={i} style={{padding:"7px",background:T.surfaceAlt,borderRadius:6,marginBottom:5}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.text}}>{o.prenom} {o.nom}</div>
                  <div style={{fontSize:9,color:T.muted}}>{o.tel} · {o.courriel}</div>
                </div>
              );})}
            </Card>
          )}
          <div style={{background:T.blueLight,borderRadius:7,padding:"8px 12px",fontSize:10,color:T.blue}}>Art.77 — Syndicat doit etre avise dans les 15 jours. Reglement remis au locataire.</div>
        </div>
      )}
    </div>
  );
}

function TabBanque(p){
  var U=p.U,sel=p.sel,cm=p.cm,data=p.data,openM=p.openM;
  var nbOk=ALL.filter(function(c){return data[c.u]&&data[c.u].banque.ok;}).length;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <b style={{fontSize:13,color:T.text}}>Bancaire — Prelevement preautorise</b>
        <div style={{display:"flex",gap:7}}>
          <Btn onClick={function(){genCSV(data,sel);}} bg={T.navy} s={{fontSize:10}}>CSV Unite {sel}</Btn>
          <Btn onClick={function(){openM("banque",Object.assign({},U.banque));}}>Modifier</Btn>
        </div>
      </div>
      <Card s={{marginBottom:10,border:"1px solid "+(U.banque.ok?T.accent:T.amber)+"40"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:40,height:40,borderRadius:8,background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff",flexShrink:0}}>$</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.text}}>{U.banque.tit}</div>
            <Tag l={U.banque.ok?"Autorisation OK":"Autorisation manquante"} c={U.banque.ok?T.accent:T.amber}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:10}}>
          {[["Institution",U.banque.inst||"—"],["Transit",U.banque.transit||"—"],["No. compte",U.banque.compte||"—"],["Titulaire",U.banque.tit||"—"],["Montant",money(cm)],["Date autor.",U.banque.dateAut||"—"]].map(function(k,i){return(
            <div key={i} style={{background:T.surfaceAlt,borderRadius:6,padding:"7px 9px"}}>
              <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:2}}>{k[0]}</div>
              <div style={{fontSize:11,fontWeight:600,color:T.text,fontFamily:i<3?"monospace":"inherit"}}>{k[1]}</div>
            </div>
          );})}
        </div>
        {U.banque.ok&&<div style={{background:T.accentLight,borderRadius:6,padding:"7px 10px",fontSize:11,color:T.accent}}>Prelevement de {money(cm)} le 1er de chaque mois — {U.banque.inst}-{U.banque.transit}-{U.banque.compte}</div>}
      </Card>
      <Card s={{padding:0}}>
        <div style={{padding:"9px 12px",background:T.surfaceAlt,borderRadius:"10px 10px 0 0",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <b style={{fontSize:11,color:T.text}}>Tous prelevements — {nbOk}/36 autorises</b>
          <Btn onClick={function(){genCSV(data,"all");}} bg={T.navy} s={{fontSize:10}}>CSV 36 unites</Btn>
        </div>
        <div style={{maxHeight:200,overflowY:"auto"}}>
          {ALL.map(function(c,i){var d=data[c.u];var b=d?d.banque:{};return(
            <div key={i} style={{display:"grid",gridTemplateColumns:"40px 1.5fr 1fr 65px 50px",gap:5,alignItems:"center",padding:"5px 12px",borderBottom:i<ALL.length-1?"1px solid "+T.border+"30":"none",background:sel===c.u?T.accentLight:"transparent"}}>
              <span style={{fontSize:10,fontWeight:700,color:T.accent}}>{c.u}</span>
              <span style={{fontSize:9,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.tit||c.nom.split(" ")[0]}</span>
              <span style={{fontSize:9,fontFamily:"monospace",color:T.muted}}>{b.compte?"****"+b.compte.slice(-4):"—"}</span>
              <span style={{fontSize:10,fontWeight:600,color:T.accent}}>{c.m.toFixed(2)}$</span>
              <Tag l={b.ok?"OK":"—"} c={b.ok?T.accent:T.muted} sz={8}/>
            </div>
          );})}
        </div>
      </Card>
    </div>
  );
}

function TabCE(p){
  var U=p.U,sel=p.sel,openM=p.openM;
  var s=expSt(U.ce.expiry);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <b style={{fontSize:13,color:T.text}}>Chauffe-eau — Unité {sel}</b>
        <Btn onClick={function(){openM("ce",Object.assign({},U.ce));}}>Modifier</Btn>
      </div>
      <div style={{background:s.c+"10",border:"1px solid "+s.c+"30",borderRadius:9,padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:s.c,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,flexShrink:0}}>{s.i}</div>
        <div><div style={{fontSize:13,fontWeight:700,color:s.c}}>{s.l}</div><div style={{fontSize:10,color:T.muted}}>Art.114.11 — Remplacement obligatoire aux 10 ans</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:10}}>
        {[["Marque",U.ce.marque||"—"],["Modele",U.ce.modele||"—"],["No. serie",U.ce.serie||"—"],["Installation",U.ce.install||"—"],["Expiration",U.ce.expiry||"—"],["Age",U.ce.install?Math.floor((new Date()-new Date(U.ce.install))/86400000/365)+" ans":"—"]].map(function(k,i){return(
          <div key={i} style={{background:T.surfaceAlt,borderRadius:6,padding:"7px 9px"}}>
            <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:2}}>{k[0]}</div>
            <div style={{fontSize:11,fontWeight:500,color:T.text}}>{k[1]}</div>
          </div>
        );})}
      </div>
      <Card s={{borderLeft:"3px solid "+(U.ce.preuve?T.accent:T.amber)}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:2}}>Preuve de remplacement</div><div style={{fontSize:9,color:T.muted}}>Facture ou certificat de plombier</div></div>
          <Tag l={U.ce.preuve?"Preuve recue":"Manquante"} c={U.ce.preuve?T.accent:T.amber}/>
        </div>
        {U.ce.notes&&<div style={{marginTop:5,fontSize:10,color:T.amber}}>Note: {U.ce.notes}</div>}
      </Card>
    </div>
  );
}

function TabAss(p){
  var U=p.U,sel=p.sel,openM=p.openM;
  var s=expSt(U.ass.expiry);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <b style={{fontSize:13,color:T.text}}>Assurance responsabilite — Unité {sel}</b>
        <Btn onClick={function(){openM("ass",Object.assign({},U.ass));}}>Modifier</Btn>
      </div>
      <div style={{background:s.c+"10",border:"1px solid "+s.c+"30",borderRadius:9,padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:s.c,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,flexShrink:0}}>{s.i}</div>
        <div><div style={{fontSize:13,fontWeight:700,color:s.c}}>{s.l}</div><div style={{fontSize:10,color:T.muted}}>Art.60 — Minimum 2 000 000 $ de responsabilite civile</div></div>
      </div>
      {U.ass.montant<2000000&&<div style={{background:T.redLight,borderRadius:6,padding:"7px 10px",marginBottom:8,fontSize:11,color:T.red,fontWeight:700}}>VIOLATION Art.60 — {money(U.ass.montant)} inferieur au minimum legal</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:10}}>
        {[["Compagnie",U.ass.cie||"—"],["Police",U.ass.police||"—"],["Montant",U.ass.montant?(U.ass.montant/1000000).toFixed(1)+" M$":"—"],["Expiration",U.ass.expiry||"—"],["Statut",s.l],["Ass. additionnel",U.ass.preuve?"Confirme":"A confirmer"]].map(function(k,i){return(
          <div key={i} style={{background:T.surfaceAlt,borderRadius:6,padding:"7px 9px"}}>
            <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:2}}>{k[0]}</div>
            <div style={{fontSize:11,fontWeight:500,color:T.text}}>{k[1]}</div>
          </div>
        );})}
      </div>
      <Card s={{borderLeft:"3px solid "+(U.ass.preuve?T.accent:T.amber)}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:2}}>Certificat d'assurance</div><div style={{fontSize:9,color:T.muted}}>Syndicat doit figurer comme assure additionnel</div></div>
          <Tag l={U.ass.preuve?"Certificat recu":"Manquant"} c={U.ass.preuve?T.accent:T.amber}/>
        </div>
        {U.ass.notes&&<div style={{marginTop:5,fontSize:10,color:T.amber}}>Note: {U.ass.notes}</div>}
      </Card>
    </div>
  );
}

function TabHist(p){
  var U=p.U,sel=p.sel,openM=p.openM;
  var vendeur=U.props.map(function(pp){return pp.prenom+" "+pp.nom;}).join(" & ");
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <b style={{fontSize:13,color:T.text}}>Mutations & Historique — Unité {sel}</b>
        <Btn onClick={function(){openM("mutation",{date:td(),vendeur:vendeur,acheteur:"",prix:"",notaire:"Me Christine Gagnon",preuve:false});}}>+ Nouvelle vente</Btn>
      </div>
      <Card s={{marginBottom:10,borderLeft:"3px solid "+T.accent}}>
        <SH l="Proprietaire(s) actuel(s)"/>
        {U.props.map(function(pp,i){return(
          <div key={i} style={{display:"flex",gap:7,padding:"7px",background:T.accentLight,borderRadius:6,marginBottom:4}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff",flexShrink:0}}>{ini(pp.prenom+" "+pp.nom)}</div>
            <div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{pp.prenom} {pp.nom}</div><div style={{fontSize:9,color:T.muted}}>{pp.tel} · {pp.courriel}</div></div>
          </div>
        );})}
      </Card>
      {U.hist.length===0?(
        <Card s={{textAlign:"center",padding:22}}><div style={{fontSize:11,color:T.muted}}>Aucune mutation enregistree</div></Card>
      ):(
        <div>
          {[].concat(U.hist).reverse().map(function(h,i){return(
            <div key={i} style={{paddingLeft:22,position:"relative",marginBottom:7}}>
              {i<U.hist.length-1&&<div style={{position:"absolute",left:8,top:22,bottom:0,width:2,background:T.border}}/>}
              <div style={{position:"absolute",left:2,top:8,width:14,height:14,borderRadius:"50%",background:i===0?T.accent:T.border,border:"2px solid "+T.surface}}/>
              <Card s={{border:"1px solid "+(i===0?T.accent+"30":T.border)}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{h.date}</div><Tag l={i===0?"Actuelle":"Precedente"} c={i===0?T.accent:T.muted}/></div>
                  <div style={{fontSize:15,fontWeight:800,color:T.accent}}>{money(h.prix)}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                  {[["Vendeur",h.vendeur],["Acheteur",h.acheteur],["Notaire",h.notaire],["Preuve",h.preuve?"Disponible":"Manquante"]].map(function(k,j){return(
                    <div key={j} style={{background:T.surfaceAlt,borderRadius:5,padding:"5px 7px"}}>
                      <div style={{fontSize:9,color:T.muted,marginBottom:1}}>{k[0]}</div>
                      <div style={{fontSize:10,color:j===3?(h.preuve?T.accent:T.amber):T.text}}>{k[1]}</div>
                    </div>
                  );})}
                </div>
              </Card>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

// Modals component
function Modals(p){
  var modal=p.modal,form=p.form,fIdx=p.fIdx,setF=p.setF,close=p.close,U=p.U,upd=p.upd,sel=p.sel;
  function sf(k,v){setF(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}

  if(modal==="prop") return(
    <Modal open title={fIdx!==null?"Modifier":"Ajouter proprietaire"} onClose={close}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
        <F l="Prenom"><input value={form.prenom||""} onChange={function(e){sf("prenom",e.target.value);}} style={inp}/></F>
        <F l="Nom"><input value={form.nom||""} onChange={function(e){sf("nom",e.target.value);}} style={inp}/></F>
        <F l="Telephone"><input value={form.tel||""} onChange={function(e){sf("tel",e.target.value);}} style={inp}/></F>
        <F l="Courriel"><input value={form.courriel||""} onChange={function(e){sf("courriel",e.target.value);}} style={inp}/></F>
      </div>
      <F l="Adresse" s={{marginBottom:9}}><input value={form.adresse||""} onChange={function(e){sf("adresse",e.target.value);}} style={inp}/></F>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}><input type="checkbox" checked={!!form.principal} onChange={function(e){sf("principal",e.target.checked);}} style={{width:13,height:13}}/><label style={{fontSize:11,color:T.text}}>Proprietaire principal</label></div>
      <MBtns onSave={function(){var a=[].concat(U.props);if(fIdx!==null)a[fIdx]=form;else a.push(form);upd("props",a);close();}} onDelete={fIdx!==null?function(){upd("props",U.props.filter(function(_,i){return i!==fIdx;}));close();}:null} onCancel={close}/>
    </Modal>
  );
  if(modal==="urg") return(
    <Modal open title="Contact urgence" onClose={close}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
        <F l="Nom"><input value={form.nom||""} onChange={function(e){sf("nom",e.target.value);}} style={inp}/></F>
        <F l="Lien"><input value={form.lien||""} onChange={function(e){sf("lien",e.target.value);}} style={inp}/></F>
      </div>
      <F l="Telephone" s={{marginBottom:12}}><input value={form.tel||""} onChange={function(e){sf("tel",e.target.value);}} style={inp}/></F>
      <MBtns onSave={function(){upd("urgence",form);close();}} onCancel={close}/>
    </Modal>
  );
  if(modal==="veh") return(
    <Modal open title={fIdx!==null?"Modifier vehicule":"Ajouter vehicule"} onClose={close}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
        <F l="Plaque"><input value={form.plaque||""} onChange={function(e){sf("plaque",e.target.value.toUpperCase());}} style={{...inp,fontFamily:"monospace"}}/></F>
        <F l="Annee"><input value={form.annee||""} onChange={function(e){sf("annee",e.target.value);}} style={inp}/></F>
        <F l="Marque"><input value={form.marque||""} onChange={function(e){sf("marque",e.target.value);}} style={inp}/></F>
        <F l="Modele"><input value={form.modele||""} onChange={function(e){sf("modele",e.target.value);}} style={inp}/></F>
        <F l="Couleur"><input value={form.couleur||""} onChange={function(e){sf("couleur",e.target.value);}} style={inp}/></F>
      </div>
      <MBtns onSave={function(){var a=[].concat(U.vehicules);if(fIdx!==null)a[fIdx]=form;else a.push(form);upd("vehicules",a);close();}} onDelete={fIdx!==null?function(){upd("vehicules",U.vehicules.filter(function(_,i){return i!==fIdx;}));close();}:null} onCancel={close}/>
    </Modal>
  );
  if(modal==="animal") return(
    <Modal open title={fIdx!==null?"Modifier animal":"Ajouter animal"} onClose={close}>
      <div style={{background:T.amberLight,borderRadius:5,padding:"5px 8px",marginBottom:9,fontSize:10,color:T.amber}}>Art.114.16 Max 2 animaux. Pitbulls interdits.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
        <F l="Nom"><input value={form.nom||""} onChange={function(e){sf("nom",e.target.value);}} style={inp}/></F>
        <F l="Espece"><select value={form.espece||"Chat"} onChange={function(e){sf("espece",e.target.value);}} style={inp}><option>Chat</option><option>Chien</option><option>Oiseau</option><option>Autre</option></select></F>
        <F l="Race"><input value={form.race||""} onChange={function(e){sf("race",e.target.value);}} style={inp}/></F>
        <F l="Couleur"><input value={form.couleur||""} onChange={function(e){sf("couleur",e.target.value);}} style={inp}/></F>
      </div>
      <MBtns onSave={function(){var a=[].concat(U.animaux);if(fIdx!==null)a[fIdx]=form;else a.push(form);upd("animaux",a);close();}} onDelete={fIdx!==null?function(){upd("animaux",U.animaux.filter(function(_,i){return i!==fIdx;}));close();}:null} onCancel={close}/>
    </Modal>
  );
  if(modal==="loc") return(
    <Modal open title="Gestion location" onClose={close}>
      <div style={{display:"flex",gap:7,marginBottom:10}}>
        {[{v:false,l:"Proprietaire"},{v:true,l:"En location"}].map(function(o,i){return(
          <button key={i} onClick={function(){sf("actif",o.v);}} style={{flex:1,background:form.actif===o.v?T.accent:T.surfaceAlt,border:"1px solid "+(form.actif===o.v?T.accent:T.border),borderRadius:6,padding:"8px",color:form.actif===o.v?"#fff":T.muted,fontSize:11,fontWeight:form.actif===o.v?700:400,cursor:"pointer",fontFamily:"inherit"}}>{o.l}</button>
        );})}
      </div>
      {form.actif&&(
        <div>
          <F l="Type" s={{marginBottom:9}}><select value={form.type||"long_terme"} onChange={function(e){sf("type",e.target.value);}} style={inp}><option value="long_terme">Long terme (bail)</option><option value="court_terme">Court terme (Airbnb)</option></select></F>
          {form.type==="court_terme"&&<div style={{background:T.redLight,borderRadius:5,padding:"5px 8px",marginBottom:8,fontSize:10,color:T.red}}>Art.107.5 Penalite: 300$/jour ou 125% du loyer</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:9}}>
            <F l="Debut"><input type="date" value={form.debut||""} onChange={function(e){sf("debut",e.target.value);}} style={inp}/></F>
            <F l="Fin"><input type="date" value={form.fin||""} onChange={function(e){sf("fin",e.target.value);}} style={inp}/></F>
            <F l="Loyer ($)"><input type="number" value={form.loyer||""} onChange={function(e){sf("loyer",parseFloat(e.target.value)||0);}} style={inp}/></F>
          </div>
        </div>
      )}
      <MBtns onSave={function(){upd("loc",form);close();}} onCancel={close}/>
    </Modal>
  );
  if(modal==="banque") return(
    <Modal open title="Informations bancaires" onClose={close}>
      <div style={{background:T.blueLight,borderRadius:5,padding:"5px 8px",marginBottom:9,fontSize:10,color:T.blue}}>Art.199 — Prelevement preautorise obligatoire.</div>
      <F l="Titulaire" s={{marginBottom:9}}><input value={form.tit||""} onChange={function(e){sf("tit",e.target.value);}} style={inp}/></F>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:9}}>
        <F l="Institution"><input value={form.inst||""} onChange={function(e){sf("inst",e.target.value);}} style={{...inp,fontFamily:"monospace"}}/></F>
        <F l="Transit"><input value={form.transit||""} onChange={function(e){sf("transit",e.target.value);}} style={{...inp,fontFamily:"monospace"}}/></F>
        <F l="No. compte"><input value={form.compte||""} onChange={function(e){sf("compte",e.target.value);}} style={{...inp,fontFamily:"monospace"}}/></F>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
        <F l="Date autorisation"><input type="date" value={form.dateAut||""} onChange={function(e){sf("dateAut",e.target.value);}} style={inp}/></F>
        <div style={{display:"flex",alignItems:"center",gap:7,marginTop:16}}><input type="checkbox" checked={!!form.ok} onChange={function(e){sf("ok",e.target.checked);}} style={{width:13,height:13}}/><label style={{fontSize:11,color:T.text}}>Autorisation signee</label></div>
      </div>
      <MBtns onSave={function(){upd("banque",form);close();}} onCancel={close}/>
    </Modal>
  );
  if(modal==="ce") return(
    <Modal open title={"Chauffe-eau — Unite "+sel} onClose={close}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
        <F l="Marque"><input value={form.marque||""} onChange={function(e){sf("marque",e.target.value);}} style={inp}/></F>
        <F l="Modele"><input value={form.modele||""} onChange={function(e){sf("modele",e.target.value);}} style={inp}/></F>
        <F l="No. serie"><input value={form.serie||""} onChange={function(e){sf("serie",e.target.value);}} style={inp}/></F>
        <F l="Installation"><input type="date" value={form.install||""} onChange={function(e){var v=e.target.value;sf("install",v);sf("expiry",ay(v,10));}} style={inp}/></F>
        <F l="Expiration (auto)"><input type="date" value={form.expiry||""} onChange={function(e){sf("expiry",e.target.value);}} style={inp}/></F>
      </div>
      {form.install&&<div style={{background:T.accentLight,borderRadius:5,padding:"4px 8px",marginBottom:8,fontSize:10,color:T.accent}}>Expiration auto: {form.expiry} (Art.114.11)</div>}
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}><input type="checkbox" checked={!!form.preuve} onChange={function(e){sf("preuve",e.target.checked);}} style={{width:13,height:13}}/><label style={{fontSize:11,color:T.text}}>Preuve de remplacement recue</label></div>
      <F l="Notes" s={{marginBottom:12}}><input value={form.notes||""} onChange={function(e){sf("notes",e.target.value);}} style={inp}/></F>
      <MBtns onSave={function(){upd("ce",form);close();}} onCancel={close}/>
    </Modal>
  );
  if(modal==="ass") return(
    <Modal open title={"Assurance — Unite "+sel} onClose={close}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
        <F l="Compagnie"><input value={form.cie||""} onChange={function(e){sf("cie",e.target.value);}} style={inp}/></F>
        <F l="No. police"><input value={form.police||""} onChange={function(e){sf("police",e.target.value);}} style={inp}/></F>
        <F l="Montant ($)"><input type="number" value={form.montant||2000000} onChange={function(e){sf("montant",parseInt(e.target.value)||0);}} style={inp}/></F>
        <F l="Expiration"><input type="date" value={form.expiry||""} onChange={function(e){sf("expiry",e.target.value);}} style={inp}/></F>
      </div>
      {(form.montant||0)<2000000&&<div style={{background:T.redLight,borderRadius:5,padding:"4px 8px",marginBottom:8,fontSize:10,color:T.red}}>Inferieur au minimum legal de 2 000 000 $ (Art.60)</div>}
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}><input type="checkbox" checked={!!form.preuve} onChange={function(e){sf("preuve",e.target.checked);}} style={{width:13,height:13}}/><label style={{fontSize:11,color:T.text}}>Certificat recu (syndicat = assure additionnel)</label></div>
      <F l="Notes" s={{marginBottom:12}}><input value={form.notes||""} onChange={function(e){sf("notes",e.target.value);}} style={inp}/></F>
      <MBtns onSave={function(){upd("ass",form);close();}} onCancel={close}/>
    </Modal>
  );
  if(modal==="mutation") return(
    <Modal open title={"Mutation — Vente unite "+sel} w={520} onClose={close}>
      <div style={{background:T.amberLight,borderRadius:5,padding:"6px 9px",marginBottom:9,fontSize:10,color:T.amber}}>Art.74 — Syndicat avise dans 15 jours. Art.72 — Nouvel acquereur solidairement responsable.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
        <F l="Date vente"><input type="date" value={form.date||td()} onChange={function(e){sf("date",e.target.value);}} style={inp}/></F>
        <F l="Prix ($)"><input type="number" value={form.prix||""} onChange={function(e){sf("prix",parseFloat(e.target.value)||0);}} style={inp}/></F>
      </div>
      <F l="Vendeur(s)" s={{marginBottom:9}}><input value={form.vendeur||""} onChange={function(e){sf("vendeur",e.target.value);}} style={inp}/></F>
      <F l="Acheteur(s) *" s={{marginBottom:9}}><input value={form.acheteur||""} onChange={function(e){sf("acheteur",e.target.value);}} placeholder="Nom complet du ou des acheteurs" style={inp}/></F>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
        <F l="Notaire"><input value={form.notaire||"Me Christine Gagnon"} onChange={function(e){sf("notaire",e.target.value);}} style={inp}/></F>
        <div style={{display:"flex",alignItems:"center",gap:7,marginTop:16}}><input type="checkbox" checked={!!form.preuve} onChange={function(e){sf("preuve",e.target.checked);}} style={{width:13,height:13}}/><label style={{fontSize:11,color:T.text}}>Preuve d'achat recue</label></div>
      </div>
      {form.acheteur&&<div style={{background:T.redLight,borderRadius:5,padding:"6px 9px",marginBottom:9,fontSize:10,color:T.red}}>Mettra a jour le proprietaire avec: "{form.acheteur}"</div>}
      <MBtns onSave={function(){
        if(!form.acheteur)return;
        var hist=[].concat(U.hist,{date:form.date,vendeur:form.vendeur,acheteur:form.acheteur,prix:form.prix||0,notaire:form.notaire,preuve:form.preuve});
        upd("hist",hist);
        var parts=form.acheteur.split("&").map(function(n){return n.trim();});
        var newProps=parts.map(function(n,i){var sp=n.split(" ");return{prenom:sp[0],nom:sp.slice(1).join(" "),tel:"",courriel:"",adresse:sel+" ch. du Hibou",principal:i===0};});
        upd("props",newProps);
        upd("loc",{actif:false,type:"long_terme",occ:[],debut:"",fin:"",loyer:""});
        close();
      }} onCancel={close}/>
    </Modal>
  );
  return null;
}

export default function Piedmont(){
  var [data,setData]=useState(DINIT);
  var [sel,setSel]=useState("531");
  var [tab,setTab]=useState("props");
  var [search,setSearch]=useState("");
  var [modal,setModal]=useState(null);
  var [form,setForm]=useState({});
  var [fIdx,setFIdx]=useState(null);

  var U=data[sel];
  var copro=ALL.find(function(c){return c.u===sel;})||{};
  var filt=ALL.filter(function(c){return c.nom.toLowerCase().includes(search.toLowerCase())||c.u.includes(search);});

  function upd(k,v){setData(function(p){var n=Object.assign({},p);n[sel]=Object.assign({},n[sel]);n[sel][k]=v;return n;});}
  function openM(type,f,idx){setModal(type);setForm(f||{});setFIdx(idx!==undefined?idx:null);}
  function close(){setModal(null);}

  var ceS=expSt(U.ce.expiry);
  var assS=expSt(U.ass.expiry);
  var alerts=[];
  if(ceS.i==="X")alerts.push("CE expire");
  if(assS.i==="X")alerts.push("Assurance expire");
  if(!U.ce.preuve)alerts.push("Preuve CE manquante");
  if(!U.ass.preuve)alerts.push("Cert. ass. manquant");
  if(U.ass.montant<2000000)alerts.push("Ass. < 2M$ (Art.60)");
  if(U.loc.actif&&U.loc.type==="court_terme")alerts.push("Court terme (Art.107.5)");

  var nbCeOk=ALL.filter(function(c){var d=data[c.u];return d&&d.ce.preuve&&expSt(d.ce.expiry).i==="OK";}).length;
  var nbAssOk=ALL.filter(function(c){var d=data[c.u];return d&&d.ass.preuve&&expSt(d.ass.expiry).i==="OK"&&(d.ass.montant||0)>=2000000;}).length;
  var nbBq=ALL.filter(function(c){return data[c.u]&&data[c.u].banque.ok;}).length;

  var TABS=[{id:"props",l:"Proprietaires"},{id:"infos",l:"Infos & Acces"},{id:"loc",l:"Location"},{id:"banque",l:"Bancaire"},{id:"ce",l:"Chauffe-eau"},{id:"ass",l:"Assurance"},{id:"hist",l:"Mutations"}];

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"Georgia,serif",display:"flex",flexDirection:"column"}}>
      <div style={{background:T.surface,borderBottom:"1px solid "+T.border,padding:"0 18px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:26,height:26,borderRadius:6,background:"linear-gradient(135deg,"+T.accent+","+T.accentPop+")",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:14,fontFamily:"Georgia,serif"}}>P</span>
          </div>
          <div style={{fontSize:13,fontWeight:800,color:T.text,fontFamily:"Georgia,serif"}}>Predictek</div>
          <span style={{fontSize:9,color:T.accent,textTransform:"uppercase",letterSpacing:"0.1em"}}>Portail unités — Piedmont</span>
        </div>
        <Btn onClick={function(){genCSV(data,"all");}} bg={T.navy} s={{fontSize:10}}>CSV prélèvements 36 unités</Btn>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{width:250,background:T.surface,borderRight:"1px solid "+T.border,display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"9px 11px",borderBottom:"1px solid "+T.border}}>
            <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Unité ou nom..." style={{...inp,fontSize:11}}/>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            {filt.map(function(c,i){
              var d=data[c.u];
              var ceOk=d&&d.ce.preuve&&expSt(d.ce.expiry).i==="OK";
              var aOk=d&&d.ass.preuve&&expSt(d.ass.expiry).i==="OK"&&(d.ass.montant||0)>=2000000;
              var bad=!ceOk||!aOk;
              var s=sel===c.u;
              return(
                <div key={c.u} onClick={function(){setSel(c.u);setTab("props");}} style={{padding:"8px 11px",borderBottom:"1px solid "+T.border+"40",cursor:"pointer",background:s?T.accentLight:"transparent"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:bad?T.red:s?T.accent:T.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:bad||s?"#fff":T.muted,flexShrink:0}}>{c.u}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:10,fontWeight:600,color:s?T.accent:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nom}</div>
                      <div style={{fontSize:8,color:T.muted,display:"flex",gap:5,marginTop:1}}>
                        <span style={{color:ceOk?T.accent:T.red}}>CE:{ceOk?"OK":"X"}</span>
                        <span style={{color:aOk?T.accent:T.red}}>Ass:{aOk?"OK":"X"}</span>
                        {d&&d.banque.ok&&<span style={{color:T.accent}}>Bq:OK</span>}
                        {d&&d.loc.actif&&<span style={{color:d.loc.type==="court_terme"?T.red:T.accentMid}}>{d.loc.type==="court_terme"?"CT":"LT"}</span>}
                      </div>
                    </div>
                    <span style={{fontSize:9,fontWeight:700,color:T.accent,flexShrink:0}}>{c.m.toFixed(0)}$</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{padding:"9px 11px",borderTop:"1px solid "+T.border,background:T.surfaceAlt,fontSize:9,color:T.muted}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span>Prelevements</span><b style={{color:T.accent}}>{nbBq}/36</b></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span>CE conformes</span><b style={{color:T.accent}}>{nbCeOk}/36</b></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Ass. conformes</span><b style={{color:T.accent}}>{nbAssOk}/36</b></div>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"14px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:12,padding:"10px 14px",background:T.accentLight,borderRadius:9,border:"1px solid "+T.accent+"20"}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>{ini(U.props[0].prenom+" "+U.props[0].nom)}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>{U.props.map(function(pp){return pp.prenom+" "+pp.nom;}).join(" & ")}</div>
              <div style={{fontSize:10,color:T.muted}}>Unité {sel} · {copro.f?copro.f.toFixed(3):"-"}% · {sel} ch. du Hibou · Stat. {U.stats.join(", ")||"—"}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:17,fontWeight:800,color:T.accent}}>{copro.m?copro.m.toLocaleString("fr-CA",{minimumFractionDigits:2})+" $":"—"}</div>
              {U.loc.actif&&<Tag l={U.loc.type==="court_terme"?"Court terme!":"Loue"} c={U.loc.type==="court_terme"?T.red:T.accentMid}/>}
            </div>
          </div>

          {alerts.length>0&&(
            <div style={{background:T.redLight,border:"1px solid "+T.red+"30",borderRadius:7,padding:"7px 12px",marginBottom:10,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:11,color:T.red,fontWeight:700}}>Alertes:</span>
              {alerts.map(function(a,i){return <Tag key={i} l={a} c={T.red}/>;})}</div>
          )}

          <div style={{display:"flex",gap:1,borderBottom:"1px solid "+T.border,marginBottom:12,overflowX:"auto"}}>
            {TABS.map(function(t){return(
              <button key={t.id} onClick={function(){setTab(t.id);}} style={{background:"none",border:"none",borderBottom:tab===t.id?"2px solid "+T.accent:"2px solid transparent",color:tab===t.id?T.text:T.muted,padding:"7px 11px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:tab===t.id?600:400,whiteSpace:"nowrap"}}>{t.l}</button>
            );})}
          </div>

          {tab==="props"&&<TabProps U={U} upd={upd} openM={openM}/>}
          {tab==="infos"&&<TabInfos U={U} upd={upd} openM={openM} sel={sel} cf={copro.f||0} cm={copro.m||0}/>}
          {tab==="loc"&&<TabLoc U={U} upd={upd} openM={openM} sel={sel}/>}
          {tab==="banque"&&<TabBanque U={U} upd={upd} openM={openM} sel={sel} cm={copro.m||0} data={data}/>}
          {tab==="ce"&&<TabCE U={U} upd={upd} openM={openM} sel={sel}/>}
          {tab==="ass"&&<TabAss U={U} upd={upd} openM={openM} sel={sel}/>}
          {tab==="hist"&&<TabHist U={U} upd={upd} openM={openM} sel={sel}/>}
        </div>
      </div>

      <Modals modal={modal} form={form} fIdx={fIdx} setF={setForm} close={close} U={U} upd={upd} sel={sel}/>
    </div>
  );
}
