import { useState } from "react";
import sb from "./lib/supabase";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EFFA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
var money=function(n){return Math.abs(n||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",opacity:p.dis?0.5:1,fontFamily:"inherit"}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Card(p){return <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16,marginBottom:12}}>{p.children}</div>;}
function Badge(p){var colors={actif:{bg:T.accentL,c:T.accent},inactif:{bg:T.redL,c:T.red},conge:{bg:T.amberL,c:T.amber},essai:{bg:T.blueL,c:T.blue}};var col=colors[p.s]||colors.actif;return <span style={{background:col.bg,color:col.c,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{p.s}</span>;}

var ROLES_EMP=[
  {id:"admin",l:"Administrateur Predictek",desc:"Acces complet a tous les modules et syndicats",color:T.purple},
  {id:"gestionnaire",l:"Gestionnaire",desc:"Gestion des syndicats assignes - CA et operations",color:T.blue},
  {id:"comptable",l:"Comptable",desc:"Budget, factures, rapports financiers",color:T.accent},
  {id:"support",l:"Support technique",desc:"Acces limites - assistance utilisateurs",color:T.amber},
  {id:"lecture",l:"Lecture seule",desc:"Consultation uniquement, aucune modification",color:T.muted},
];

var ACCES_MENUS={
  admin:["dashboard","onboarding","copros","gestion","usagers","historique","ia","tableau","factures","budget","bons","comm","docs","rapports","assurances","pv","ca","fournisseurs","agenda","t4","carnet","copro","releves","crm","reconn","notif"],
  gestionnaire:["dashboard","copros","tableau","factures","budget","bons","comm","docs","rapports","assurances","pv","ca","fournisseurs","agenda","t4","carnet"],
  comptable:["dashboard","factures","budget","rapports","releves","t4"],
  support:["dashboard","historique","usagers"],
  lecture:["dashboard"],
};

var DEPTS=["Direction","Administration","Operations","Comptabilite","Terrain","Support"];
var STATUTS=["actif","inactif","conge","essai"];

var EMP_INIT=[];

var EMP_VIDE={prenom:"",nom:"",courriel:"",tel:"",poste:"",dept:"Administration",role:"gestionnaire",statut:"actif",salaire:"",dateEmbauche:"",notes:""};

function TabEmployes(){
  var s0=useState(EMP_INIT);var emps=s0[0];var setEmps=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState(false);var showForm=s2[0];var setShowForm=s2[1];
  var s3=useState(EMP_VIDE);var form=s3[0];var setForm=s3[1];
  var s4=useState("");var search=s4[0];var setSearch=s4[1];

  function sf(k,v){setForm(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  var filtered=emps.filter(function(e){
    var q=search.toLowerCase();
    return !q||(e.prenom+" "+e.nom).toLowerCase().includes(q)||e.courriel.toLowerCase().includes(q)||e.dept.toLowerCase().includes(q);
  });

  function sauvegarder(){
    if(!form.prenom||!form.nom||!form.courriel)return;
    if(form.id){
      setEmps(function(prev){return prev.map(function(e){return e.id===form.id?Object.assign({},form):e;});});
    }else{
      setEmps(function(prev){return prev.concat([Object.assign({},form,{id:Date.now()})]);});
    }
    setShowForm(false);setForm(EMP_VIDE);setSel(null);
  }

  function supprimer(id){
    setEmps(function(prev){return prev.filter(function(e){return e.id!==id;});});
    setSel(null);
  }

  return(
    <div style={{display:"grid",gridTemplateColumns:sel?"1fr 340px":"1fr",gap:16}}>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:T.navy,fontFamily:"Georgia,serif"}}>Employes Predictek</div>
            <div style={{fontSize:11,color:T.muted}}>{emps.filter(function(e){return e.statut==="actif";}).length} actifs sur {emps.length} employes</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Rechercher..." style={Object.assign({},INP,{width:200})}/>
            <Btn onClick={function(){setShowForm(true);setForm(EMP_VIDE);setSel(null);}}>+ Nouvel employe</Btn>
          </div>
        </div>
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:T.alt}}>
                {["Employe","Poste / Departement","Role acces","Salaire","Statut",""].map(function(h){return <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}
              </tr>
            </thead>
            <tbody>
              {filtered.map(function(e){
                var role=ROLES_EMP.find(function(r){return r.id===e.role;})||ROLES_EMP[0];
                return(
                  <tr key={e.id} onClick={function(){setSel(sel===e.id?null:e.id);}} style={{borderTop:"1px solid "+T.border,cursor:"pointer",background:sel===e.id?T.accentL:"#fff",transition:"background 0.1s"}}>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:34,height:34,borderRadius:"50%",background:role.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>{e.prenom[0]}{e.nom[0]}</div>
                        <div>
                          <div style={{fontWeight:600,fontSize:13,color:T.text}}>{e.prenom} {e.nom}</div>
                          <div style={{fontSize:10,color:T.muted}}>{e.courriel}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{fontSize:12,fontWeight:500,color:T.text}}>{e.poste}</div>
                      <div style={{fontSize:10,color:T.muted}}>{e.dept}</div>
                    </td>
                    <td style={{padding:"10px 12px"}}>
                      <span style={{background:role.color+"22",color:role.color,borderRadius:5,padding:"2px 8px",fontSize:10,fontWeight:700}}>{role.l}</span>
                    </td>
                    <td style={{padding:"10px 12px",fontSize:12,color:T.text}}>{e.salaire?money(e.salaire/52)+" /sem":"-"}</td>
                    <td style={{padding:"10px 12px"}}><Badge s={e.statut}/></td>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",gap:4}}>
                        <Btn sm onClick={function(ev){ev.stopPropagation();setForm(Object.assign({},e));setShowForm(true);setSel(null);}}>Modifier</Btn>
                        <Btn sm bg={T.redL} tc={T.red} onClick={function(ev){ev.stopPropagation();supprimer(e.id);}}>Retirer</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {showForm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
            <div style={{background:T.surface,borderRadius:14,padding:24,width:"min(580px,94vw)",maxHeight:"88vh",overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <b style={{fontSize:14,color:T.navy}}>{form.id?"Modifier employe":"Nouvel employe"}</b>
                <button onClick={function(){setShowForm(false);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.muted}}>x</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl l="Prenom"/><input value={form.prenom} onChange={function(e){sf("prenom",e.target.value);}} style={INP}/></div>
                <div><Lbl l="Nom"/><input value={form.nom} onChange={function(e){sf("nom",e.target.value);}} style={INP}/></div>
                <div><Lbl l="Courriel"/><input value={form.courriel} onChange={function(e){sf("courriel",e.target.value);}} style={INP}/></div>
                <div><Lbl l="Telephone"/><input value={form.tel} onChange={function(e){sf("tel",e.target.value);}} style={INP}/></div>
                <div><Lbl l="Poste"/><input value={form.poste} onChange={function(e){sf("poste",e.target.value);}} style={INP}/></div>
                <div><Lbl l="Departement"/><select value={form.dept} onChange={function(e){sf("dept",e.target.value);}} style={INP}>{DEPTS.map(function(d){return <option key={d}>{d}</option>;})}</select></div>
                <div><Lbl l="Role et acces systeme"/><select value={form.role} onChange={function(e){sf("role",e.target.value);}} style={INP}>{ROLES_EMP.map(function(r){return <option key={r.id} value={r.id}>{r.l}</option>;})}</select></div>
                <div><Lbl l="Statut"/><select value={form.statut} onChange={function(e){sf("statut",e.target.value);}} style={INP}>{STATUTS.map(function(s){return <option key={s}>{s}</option>;})}</select></div>
                <div><Lbl l="Salaire annuel ($)"/><input type="number" value={form.salaire} onChange={function(e){sf("salaire",parseFloat(e.target.value)||"");}} style={INP}/></div>
                <div><Lbl l="Date embauche"/><input type="date" value={form.dateEmbauche} onChange={function(e){sf("dateEmbauche",e.target.value);}} style={INP}/></div>
                <div style={{gridColumn:"1/-1"}}><Lbl l="Notes"/><textarea value={form.notes} onChange={function(e){sf("notes",e.target.value);}} style={Object.assign({},INP,{height:60,resize:"vertical"})}/></div>
              </div>
              {form.role&&(
                <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:8,padding:"8px 12px",marginTop:10,fontSize:11,color:T.accent}}>
                  <b>Acces systeme:</b> {(ACCES_MENUS[form.role]||[]).length} modules accessibles
                </div>
              )}
              <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}>
                <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowForm(false);}}>Annuler</Btn>
                <Btn onClick={sauvegarder} dis={!form.prenom||!form.nom||!form.courriel}>Sauvegarder</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
      {sel&&(function(){
        var e=emps.find(function(x){return x.id===sel;});
        if(!e)return null;
        var role=ROLES_EMP.find(function(r){return r.id===e.role;})||ROLES_EMP[0];
        var menus=ACCES_MENUS[e.role]||[];
        return(
          <Card>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{width:60,height:60,borderRadius:"50%",background:role.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:22,margin:"0 auto 8px"}}>{e.prenom[0]}{e.nom[0]}</div>
              <div style={{fontWeight:700,fontSize:15,color:T.navy}}>{e.prenom} {e.nom}</div>
              <div style={{fontSize:11,color:T.muted}}>{e.poste} - {e.dept}</div>
              <Badge s={e.statut}/>
            </div>
            <div style={{marginBottom:12}}>
              <Lbl l="Contact"/>
              <div style={{fontSize:12,color:T.text}}>{e.courriel}</div>
              <div style={{fontSize:12,color:T.muted}}>{e.tel}</div>
            </div>
            <div style={{marginBottom:12}}>
              <Lbl l="Remuneration"/>
              <div style={{fontSize:14,fontWeight:700,color:T.accent}}>{e.salaire?money(e.salaire)+" /an":"-"}</div>
              <div style={{fontSize:11,color:T.muted}}>{e.salaire?money(e.salaire/26)+" /paie (aux 2 sem)":""}</div>
            </div>
            <div style={{marginBottom:12}}>
              <Lbl l={"Role: "+role.l}/>
              <div style={{fontSize:11,color:T.muted,marginBottom:6}}>{role.desc}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {menus.slice(0,8).map(function(m){return <span key={m} style={{background:T.accentL,color:T.accent,borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:600}}>{m}</span>;})}
                {menus.length>8&&<span style={{fontSize:9,color:T.muted}}>+{menus.length-8} autres</span>}
              </div>
            </div>
            {e.notes&&<div style={{background:T.alt,borderRadius:6,padding:"6px 10px",fontSize:11,color:T.muted}}>{e.notes}</div>}
          </Card>
        );
      })()}
    </div>
  );
}

function TabPaies(){
  var s0=useState(null);var mois=s0[0];var setMois=s0[1];
  var MOIS=["Janvier 2025","Fevrier 2025","Mars 2025","Avril 2025","Mai 2025","Juin 2025"];
  return(
    <div>
      <div style={{fontSize:18,fontWeight:800,color:T.navy,fontFamily:"Georgia,serif",marginBottom:16}}>Gestion des paies</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {MOIS.map(function(m){return(
          <div key={m} onClick={function(){setMois(m===mois?null:m);}} style={{background:mois===m?T.accentL:T.surface,border:"1px solid "+(mois===m?T.accent:T.border),borderRadius:10,padding:14,cursor:"pointer",transition:"all 0.15s"}}>
            <div style={{fontWeight:700,fontSize:13,color:mois===m?T.accent:T.navy,marginBottom:4}}>{m}</div>
            <div style={{fontSize:11,color:T.muted}}>{EMP_INIT.length} employes</div>
            <div style={{fontSize:14,fontWeight:700,color:T.accent,marginTop:6}}>{money(EMP_INIT.reduce(function(s,e){return s+(e.salaire||0)/26;},0))}</div>
            <div style={{fontSize:9,color:T.muted}}>Total brut paie</div>
          </div>
        );})}
      </div>
      {mois&&(
        <Card>
          <div style={{fontWeight:700,fontSize:14,color:T.navy,marginBottom:12}}>Registre de paie - {mois}</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:T.alt}}>{["Employe","Salaire annuel","Brut /paie","TPS/RRQ (est.)","Net estime"].map(function(h){return <th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase"}}>{h}</th>;})}</tr></thead>
            <tbody>
              {EMP_INIT.filter(function(e){return e.statut==="actif";}).map(function(e){
                var brut=(e.salaire||0)/26;
                var ded=brut*0.23;
                return(
                  <tr key={e.id} style={{borderTop:"1px solid "+T.border}}>
                    <td style={{padding:"8px 10px",fontSize:12,fontWeight:600}}>{e.prenom} {e.nom}</td>
                    <td style={{padding:"8px 10px",fontSize:12}}>{money(e.salaire||0)}</td>
                    <td style={{padding:"8px 10px",fontSize:12,fontWeight:600,color:T.accent}}>{money(brut)}</td>
                    <td style={{padding:"8px 10px",fontSize:12,color:T.red}}>-{money(ded)}</td>
                    <td style={{padding:"8px 10px",fontSize:12,fontWeight:700}}>{money(brut-ded)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{textAlign:"right",marginTop:12,padding:"10px",background:T.accentL,borderRadius:8}}>
            <span style={{fontSize:13,fontWeight:700,color:T.accent}}>Total net: {money(EMP_INIT.filter(function(e){return e.statut==="actif";}).reduce(function(s,e){var b=(e.salaire||0)/26;return s+(b-b*0.23);},0))}</span>
          </div>
        </Card>
      )}
      <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:8,padding:"10px 14px",fontSize:11,color:T.amber,marginTop:12}}>
        Module de paies complet avec Supabase disponible - connectez votre base de donnees pour activer la gestion complete des bulletins de paie, T4 et releves 1.
      </div>
    </div>
  );
}

var TABS=[{id:"employes",l:"Employes"},{id:"paies",l:"Paies et remuneration"}];

export default function GestionEmployes(){
  var s0=useState("employes");var ong=s0[0];var setOng=s0[1];
  return(
    <div style={{padding:20,fontFamily:"Georgia,serif",maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:"2px solid "+T.border}}>
        {TABS.map(function(t){var a=ong===t.id;return(
          <button key={t.id} onClick={function(){setOng(t.id);}} style={{padding:"8px 18px",background:a?T.surface:"transparent",border:a?"1px solid "+T.border:"1px solid transparent",borderBottom:a?"2px solid "+T.accent:"none",borderRadius:"8px 8px 0 0",cursor:"pointer",fontFamily:"Georgia,serif",fontWeight:a?700:400,fontSize:13,color:a?T.accent:T.muted,marginBottom:-2}}>
            {t.l}
          </button>
        );})}
      </div>
      {ong==="employes"&&<TabEmployes/>}
      {ong==="paies"&&<TabPaies/>}
    </div>
  );
}
