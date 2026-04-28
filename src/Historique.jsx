import sb from "./lib/supabase";
import { useState, useEffect } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Bdg(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap",display:"inline-block"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} style={{background:p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",width:p.fw?"100%":"auto"}}>{p.children}</button>;}

// ===== CATEGORIES D'ACTIONS =====
var CATS={
  syndicat:{l:"Syndicat",c:T.navy,bg:"#E8EDF5"},
  coproprietaire:{l:"Coproprietaire",c:T.blue,bg:T.blueL},
  finance:{l:"Finance",c:T.accent,bg:T.accentL},
  document:{l:"Document",c:T.purple,bg:T.purpleL},
  ticket:{l:"Ticket",c:T.amber,bg:T.amberL},
  employe:{l:"Employe",c:"#0D7377",bg:"#E0F4F5"},
  systeme:{l:"Systeme",c:T.muted,bg:T.alt},
  securite:{l:"Securite",c:T.red,bg:T.redL},
};

var ACTIONS={
  creation:{l:"Creation",icon:"+"},
  modification:{l:"Modification",icon:"~"},
  suppression:{l:"Suppression",icon:"-"},
  connexion:{l:"Connexion",icon:"->"},
  deconnexion:{l:"Deconnexion",icon:"<-"},
  approbation:{l:"Approbation",icon:"V"},
  rejet:{l:"Rejet",icon:"X"},
  export:{l:"Export",icon:"^"},
  import:{l:"Import",icon:"v"},
  envoi:{l:"Envoi",icon:"@"},
};

// Storage key
var KEY = "predictek_historique_v1";

function loadHist(){
  try{
    var raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){return [];}
}

function saveHist(h){
  try{localStorage.setItem(KEY, JSON.stringify(h.slice(0,2000)));}catch(e){}
}

// Public function to add an entry from any module
if(!window.predictek_log){
  window.predictek_log = function(cat, action, description, details, syndicat){
    try{
      var entry = {
        id: Date.now(),
        ts: new Date().toISOString(),
        utilisateur: (function(){try{return JSON.parse(localStorage.getItem("predictek_current_user")||"{}").nom||"Systeme";}catch(e){return "Systeme";}}()),
        cat: cat||"systeme",
        action: action||"modification",
        description: description||"",
        details: details||"",
        syndicat: syndicat||"",
      };
      var h = loadHist();
      h.unshift(entry);
      saveHist(h);
    }catch(e){}
  };
}

export default function ModuleHistorique(){
  var s0=useState(loadHist());var hist=s0[0];var setHist=s0[1];
  var s1=useState("");var search=s1[0];var setSearch=s1[1];
  var s2=useState("tout");var filtCat=s2[0];var setFiltCat=s2[1];
  var s3=useState("tout");var filtAction=s3[0];var setFiltAction=s3[1];
  var s4=useState("");var filtDate=s4[0];var setFiltDate=s4[1];
  var s5=useState(null);var detail=s5[0];var setDetail=s5[1];

  function refresh(){setHist(loadHist());}

  function addDemo(){
    var demos=[
      {cat:"syndicat",action:"creation",description:"Creation du syndicat Piedmont",details:"36 unites, Ch. du Hibou, Stoneham",syndicat:"PIED"},
      {cat:"coproprietaire",action:"modification",description:"Modification des informations - Unite 531",details:"Courriel mis a jour: jf@email.com",syndicat:"PIED"},
      {cat:"finance",action:"approbation",description:"Approbation facture Predictek FC-2026-001",details:"Montant: 2759.40$",syndicat:"PIED"},
      {cat:"document",action:"creation",description:"Upload declaration de copropriete",details:"Declaration_Piedmont.pdf (2.3 MB)",syndicat:"PIED"},
      {cat:"ticket",action:"creation",description:"Nouveau ticket: Fuite toit parkin",details:"Priorite: haute - Unite: commun",syndicat:"PIED"},
      {cat:"employe",action:"creation",description:"Nouvel employe: Marie Tremblay",details:"Poste: Gestionnaire - Dept: Operations",syndicat:""},
      {cat:"securite",action:"connexion",description:"Connexion usager: admin@predictek.ca",details:"IP: 192.168.1.x",syndicat:""},
      {cat:"finance",action:"modification",description:"Modification budget 2025-2026",details:"Ligne Deneigement: 18 700$ -> 22 000$",syndicat:"PIED"},
      {cat:"systeme",action:"export",description:"Export rapport financier PDF",details:"Periode: Nov 2025 - Oct 2026",syndicat:"PIED"},
      {cat:"coproprietaire",action:"modification",description:"Activation portail - Unite 515",details:"Code acces genere et envoye par courriel",syndicat:"PIED"},
    ];
    var h = loadHist();
    demos.forEach(function(d,i){
      h.unshift({id:Date.now()-i*1000,ts:new Date(Date.now()-i*3600000).toISOString(),
        utilisateur:"JF Laroche",cat:d.cat,action:d.action,description:d.description,details:d.details,syndicat:d.syndicat});
    });
    saveHist(h);
    setHist(h);
  }

  var liste = hist.filter(function(e){
    if(search && !(e.description+e.details+e.syndicat+e.utilisateur).toLowerCase().includes(search.toLowerCase())) return false;
    if(filtCat!=="tout" && e.cat!==filtCat) return false;
    if(filtAction!=="tout" && e.action!==filtAction) return false;
    if(filtDate && !e.ts.startsWith(filtDate)) return false;
    return true;
  });

  // Stats
  var stats = {
    total: hist.length,
    auj: hist.filter(function(e){return e.ts.startsWith(new Date().toISOString().slice(0,10));}).length,
    utilisateurs: new Set(hist.map(function(e){return e.utilisateur;})).size,
    syndicats: new Set(hist.filter(function(e){return e.syndicat;}).map(function(e){return e.syndicat;})).size,
  };

  function fmt(iso){
    var d=new Date(iso);
    return d.toLocaleDateString("fr-CA")+' '+d.toLocaleTimeString("fr-CA",{hour:"2-digit",minute:"2-digit"});
  }

  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Historique des modifications</div>
          <div style={{fontSize:11,color:T.muted}}>Tracabilite complete - qui a fait quoi et quand</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={refresh}>Actualiser</Btn>
          {hist.length===0&&<Btn sm bg={T.purpleL} tc={T.purple} bdr={"1px solid "+T.purple} onClick={addDemo}>Ajouter exemples</Btn>}
          {hist.length>0&&<Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red} onClick={function(){saveHist([]);setHist([]);;}}>Vider</Btn>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[
          {l:"Total",v:stats.total,c:T.navy,bg:"#E8EDF5"},
          {l:"Aujourd hui",v:stats.auj,c:T.accent,bg:T.accentL},
          {l:"Utilisateurs",v:stats.utilisateurs,c:T.purple,bg:T.purpleL},
          {l:"Syndicats",v:stats.syndicats,c:T.blue,bg:T.blueL},
        ].map(function(s,i){return(
          <div key={i} style={{background:s.bg,borderRadius:10,padding:"11px 14px",border:"1px solid "+s.c+"33"}}>
            <div style={{fontSize:9,color:s.c,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{s.l}</div>
            <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
          </div>
        );})}
      </div>

      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:10,alignItems:"end"}}>
          <div>
            <div style={{fontSize:10,color:T.muted,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Rechercher</div>
            <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Mot-cle, utilisateur, syndicat..." style={INP}/>
          </div>
          <div>
            <div style={{fontSize:10,color:T.muted,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Categorie</div>
            <select value={filtCat} onChange={function(e){setFiltCat(e.target.value);}} style={INP}>
              <option value="tout">Toutes</option>
              {Object.entries(CATS).map(function(e){return <option key={e[0]} value={e[0]}>{e[1].l}</option>;})}
            </select>
          </div>
          <div>
            <div style={{fontSize:10,color:T.muted,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Action</div>
            <select value={filtAction} onChange={function(e){setFiltAction(e.target.value);}} style={INP}>
              <option value="tout">Toutes</option>
              {Object.entries(ACTIONS).map(function(e){return <option key={e[0]} value={e[0]}>{e[1].l}</option>;})}
            </select>
          </div>
          <div>
            <div style={{fontSize:10,color:T.muted,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Date</div>
            <input type="date" value={filtDate} onChange={function(e){setFiltDate(e.target.value);}} style={INP}/>
          </div>
        </div>
        {(search||filtCat!=="tout"||filtAction!=="tout"||filtDate)&&(
          <div style={{marginTop:10,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:T.muted}}>{liste.length} resultat(s)</span>
            <button onClick={function(){setSearch("");setFiltCat("tout");setFiltAction("tout");setFiltDate("");}} style={{background:"none",border:"none",fontSize:11,color:T.accent,cursor:"pointer",textDecoration:"underline",fontFamily:"inherit"}}>Effacer filtres</button>
          </div>
        )}
      </div>

      {liste.length===0?(
        <div style={{textAlign:"center",padding:60,color:T.muted,background:T.surface,borderRadius:10,border:"1px solid "+T.border}}>
          <div style={{fontSize:40,marginBottom:12}}>-</div>
          <div style={{fontSize:14,fontWeight:600,color:T.navy,marginBottom:8}}>Aucune entree dans l historique</div>
          <div style={{fontSize:12}}>{hist.length===0?"L historique s alimente automatiquement lors des actions dans Predictek.":"Aucun resultat pour ces filtres."}</div>
        </div>
      ):(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:T.navy}}>
                {["Date et heure","Utilisateur","Categorie","Action","Description","Syndicat","Details"].map(function(h){return(
                  <th key={h} style={{padding:"8px 12px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
                );})}
              </tr>
            </thead>
            <tbody>
              {liste.map(function(e){
                var cat=CATS[e.cat]||CATS.systeme;
                var act=ACTIONS[e.action]||ACTIONS.modification;
                return(
                  <tr key={e.id} onClick={function(){setDetail(e);}} style={{borderBottom:"1px solid "+T.border,cursor:"pointer",background:detail&&detail.id===e.id?T.accentL:T.surface}}>
                    <td style={{padding:"8px 12px",fontSize:11,color:T.muted,whiteSpace:"nowrap"}}>{fmt(e.ts)}</td>
                    <td style={{padding:"8px 12px",fontSize:11,fontWeight:500,color:T.text,whiteSpace:"nowrap"}}>{e.utilisateur}</td>
                    <td style={{padding:"8px 12px"}}><Bdg bg={cat.bg} c={cat.c}>{cat.l}</Bdg></td>
                    <td style={{padding:"8px 12px"}}><Bdg bg={e.action==="suppression"?T.redL:e.action==="creation"?T.accentL:T.alt} c={e.action==="suppression"?T.red:e.action==="creation"?T.accent:T.muted}>{act.icon} {act.l}</Bdg></td>
                    <td style={{padding:"8px 12px",fontSize:12,color:T.text,maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.description}</td>
                    <td style={{padding:"8px 12px"}}>{e.syndicat&&<Bdg bg={T.blueL} c={T.blue}>{e.syndicat}</Bdg>}</td>
                    <td style={{padding:"8px 12px",fontSize:11,color:T.muted,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{padding:"8px 14px",background:T.alt,borderTop:"1px solid "+T.border,fontSize:11,color:T.muted,display:"flex",justifyContent:"space-between"}}>
            <span>{liste.length} entree(s) affichee(s)</span>
            <span>Cliquez une ligne pour les details</span>
          </div>
        </div>
      )}

      {detail&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={function(e){if(e.target===e.currentTarget)setDetail(null);}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:24,width:500,maxWidth:"95vw"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <b style={{fontSize:15,color:T.text}}>Detail de l entree</b>
              <button onClick={function(){setDetail(null);}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:T.muted,lineHeight:1}}>x</button>
            </div>
            <div style={{display:"grid",gap:0}}>
              {[
                {l:"Date et heure",v:fmt(detail.ts)},
                {l:"Utilisateur",v:detail.utilisateur},
                {l:"Categorie",v:(CATS[detail.cat]||CATS.systeme).l},
                {l:"Action",v:(ACTIONS[detail.action]||ACTIONS.modification).l},
                {l:"Syndicat",v:detail.syndicat||"-"},
                {l:"Description",v:detail.description},
                {l:"Details",v:detail.details||"-"},
                {l:"ID entree",v:detail.id.toString()},
              ].map(function(item,i){return(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"9px 0",borderBottom:"1px solid "+T.border}}>
                  <span style={{fontSize:10,color:T.muted,flexShrink:0,marginRight:12,textTransform:"uppercase",fontWeight:600}}>{item.l}</span>
                  <span style={{fontSize:12,fontWeight:500,color:T.text,textAlign:"right"}}>{item.v}</span>
                </div>
              );})}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
