// GestionRoles v2.3
import { useState } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EFFA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",opacity:p.dis?0.5:1,fontFamily:"inherit"}}>{p.children}</button>;}

var ALL_MENUS=[
  {section:"Predictek",color:"#3CAF6E",items:[
    {id:"dashboard",l:"Accueil"},
    {id:"onboarding",l:"Configuration"},
    {id:"copros",l:"Coproprietaires"},
    {id:"gestion",l:"Gestion Auto"},
    {id:"usagers",l:"Utilisateurs"},
    {id:"employes",l:"Employes"},
    {id:"roles",l:"Roles"},
    {id:"crm",l:"CRM"},
    {id:"historique",l:"Historique"},
    {id:"ia",l:"IA"},
  ]},
  {section:"Conseil d administration",color:"#64B5F6",items:[
    {id:"tableau",l:"Tableau CA"},
    {id:"factures",l:"Factures"},
    {id:"budget",l:"Budget"},
    {id:"bons",l:"Bons travaux"},
    {id:"comm",l:"Communications"},
    {id:"docs",l:"Documents"},
    {id:"rapports",l:"Rapports"},
    {id:"assurances",l:"Assurances"},
    {id:"pv",l:"PV Reunion"},
    {id:"ca",l:"Membres CA"},
    {id:"fournisseurs",l:"Fournisseurs"},
    {id:"agenda",l:"Agenda"},
    {id:"t4",l:"T4 / R1"},
    {id:"carnet",l:"Carnet Loi 16"},
  ]},
  {section:"Portail Coproprietaire",color:"#FFB74D",items:[
    {id:"copro",l:"Mon portail"},
    {id:"releves",l:"Releves"},
    {id:"reconn",l:"Lire docs IA"},
    {id:"notif",l:"Notifications"},
  ]},
];

var NIVEAUX=[
  {id:"aucun",l:"Aucun acces",short:"--",color:T.muted},
  {id:"lecture",l:"Lecture seule",short:"R",color:T.blue},
  {id:"complet",l:"Acces complet",short:"RW",color:T.accent},
];

var ROLES_INIT=[
  {id:"admin",l:"Administrateur",color:T.purple,desc:"Acces total a tous les modules",
   perms:Object.fromEntries(ALL_MENUS.flatMap(function(s){return s.items.map(function(m){return [m.id,"complet"];});}))},
  {id:"gestionnaire",l:"Gestionnaire",color:T.blue,desc:"Gestion des syndicats assignes",
   perms:{dashboard:"complet",onboarding:"complet",copros:"complet",tableau:"complet",factures:"complet",budget:"complet",bons:"complet",comm:"complet",docs:"complet",rapports:"lecture",assurances:"lecture",pv:"complet",ca:"complet",fournisseurs:"complet",agenda:"complet",t4:"lecture",carnet:"complet",historique:"lecture",ia:"lecture",usagers:"aucun",employes:"aucun",roles:"aucun",crm:"lecture",gestion:"lecture",copro:"aucun",releves:"aucun",reconn:"aucun",notif:"aucun"}},
  {id:"comptable",l:"Comptable",color:T.accent,desc:"Budget, factures et rapports",
   perms:{dashboard:"complet",factures:"complet",budget:"complet",rapports:"complet",releves:"complet",t4:"complet",tableau:"lecture",historique:"lecture",copros:"lecture",comm:"aucun",docs:"lecture",bons:"lecture",assurances:"lecture",pv:"lecture",ca:"aucun",fournisseurs:"lecture",agenda:"aucun",carnet:"aucun",onboarding:"aucun",gestion:"aucun",usagers:"aucun",employes:"aucun",roles:"aucun",crm:"aucun",ia:"aucun",copro:"aucun",reconn:"aucun",notif:"aucun"}},
  {id:"support",l:"Support technique",color:T.amber,desc:"Assistance et consultation limitee",
   perms:{dashboard:"lecture",historique:"complet",usagers:"lecture",copros:"lecture",tableau:"aucun",factures:"aucun",budget:"aucun",bons:"aucun",comm:"aucun",docs:"aucun",rapports:"aucun",assurances:"aucun",pv:"aucun",ca:"aucun",fournisseurs:"aucun",agenda:"aucun",t4:"aucun",carnet:"aucun",onboarding:"aucun",gestion:"aucun",employes:"aucun",roles:"aucun",crm:"lecture",ia:"aucun",copro:"aucun",releves:"aucun",reconn:"aucun",notif:"aucun"}},
  {id:"lecture",l:"Lecture seule",color:T.muted,desc:"Consultation uniquement",
   perms:Object.fromEntries(ALL_MENUS.flatMap(function(s){return s.items.map(function(m){return [m.id,"lecture"];});}))},
];

var ROLE_VIDE={id:"",l:"",color:T.blue,desc:"",perms:Object.fromEntries(ALL_MENUS.flatMap(function(s){return s.items.map(function(m){return [m.id,"aucun"];});}))};

export default function GestionRoles(){
  var s0=useState(ROLES_INIT);var roles=s0[0];var setRoles=s0[1];
  var s1=useState(null);var editing=s1[0];var setEditing=s1[1];
  var s2=useState(null);var form=s2[0];var setForm=s2[1];

  function startEdit(role){
    setEditing(role.id);
    setForm(JSON.parse(JSON.stringify(role)));
  }
  function startNew(){
    setEditing("__new__");
    setForm(Object.assign({},ROLE_VIDE,{id:"role_"+Date.now()}));
  }
  function setPerm(menuId,val){
    setForm(function(f){
      var np=Object.assign({},f.perms);
      np[menuId]=val;
      return Object.assign({},f,{perms:np});
    });
  }
  function setAll(val){
    setForm(function(f){
      var np=Object.fromEntries(Object.keys(f.perms).map(function(k){return [k,val];}));
      return Object.assign({},f,{perms:np});
    });
  }
  function sauvegarder(){
    if(!form.l)return;
    if(editing==="__new__"){
      setRoles(function(prev){return prev.concat([form]);});
    }else{
      setRoles(function(prev){return prev.map(function(r){return r.id===editing?form:r;});});
    }
    setEditing(null);setForm(null);
  }
  function supprimer(id){
    if(["admin"].includes(id))return;
    setRoles(function(prev){return prev.filter(function(r){return r.id!==id;});});
    if(editing===id){setEditing(null);setForm(null);}
  }

  var nivIcon={aucun:"--",lecture:"R",complet:"RW"};
  var nivColor={aucun:T.muted,lecture:T.blue,complet:T.accent};

  return(
    <div style={{padding:20,fontFamily:"Georgia,serif",maxWidth:1200,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Gestion des roles et permissions</div>
          <div style={{fontSize:11,color:T.muted}}>{roles.length} roles definis - Configurez les acces menu par menu</div>
        </div>
        <Btn onClick={startNew}>+ Nouveau role</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:editing?"1fr 500px":"1fr",gap:16}}>
        <div>
          {roles.map(function(role){
            var complet=Object.values(role.perms).filter(function(v){return v==="complet";}).length;
            var lecture=Object.values(role.perms).filter(function(v){return v==="lecture";}).length;
            var total=Object.values(role.perms).length;
            return(
              <div key={role.id} style={{background:T.surface,border:"2px solid "+(editing===role.id?role.color:T.border),borderRadius:10,padding:16,marginBottom:12,transition:"border 0.15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:role.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,flexShrink:0}}>{role.l[0]}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:T.navy}}>{role.l}</div>
                      <div style={{fontSize:11,color:T.muted}}>{role.desc}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{background:T.accentL,color:T.accent,borderRadius:5,padding:"2px 8px",fontSize:10,fontWeight:700}}>{complet} complet</span>
                    <span style={{background:T.blueL,color:T.blue,borderRadius:5,padding:"2px 8px",fontSize:10,fontWeight:700}}>{lecture} lecture</span>
                    <span style={{background:T.alt,color:T.muted,borderRadius:5,padding:"2px 8px",fontSize:10,fontWeight:700}}>{total-complet-lecture} aucun</span>
                    <Btn sm onClick={function(){startEdit(role);}}>Modifier</Btn>
                    {role.id!=="admin"&&<Btn sm bg={T.redL} tc={T.red} onClick={function(){supprimer(role.id);}}>Supprimer</Btn>}
                  </div>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {ALL_MENUS.flatMap(function(s){return s.items;}).map(function(m){
                    var p=role.perms[m.id]||"aucun";
                    if(p==="aucun")return null;
                    return(
                      <span key={m.id} style={{background:p==="complet"?T.accentL:T.blueL,color:p==="complet"?T.accent:T.blue,borderRadius:4,padding:"2px 7px",fontSize:9,fontWeight:700}}>
                        {m.l} [{nivIcon[p]}]
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {editing&&form&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20,height:"fit-content",position:"sticky",top:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <b style={{fontSize:14,color:T.navy}}>{editing==="__new__"?"Nouveau role":"Modifier: "+form.l}</b>
              <button onClick={function(){setEditing(null);setForm(null);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.muted}}>x</button>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Nom du role</div>
              <input value={form.l} onChange={function(e){setForm(function(f){return Object.assign({},f,{l:e.target.value});});}} style={INP}/>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",marginBottom:4}}>Description</div>
              <input value={form.desc} onChange={function(e){setForm(function(f){return Object.assign({},f,{desc:e.target.value});});}} style={INP}/>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              <Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){setAll("complet");}}>Tout complet</Btn>
              <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){setAll("lecture");}}>Tout lecture</Btn>
              <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setAll("aucun");}}>Tout retirer</Btn>
            </div>
            <div style={{maxHeight:420,overflowY:"auto",marginBottom:14}}>
              {ALL_MENUS.map(function(section){return(
                <div key={section.section} style={{marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:section.color,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6,borderBottom:"1px solid "+section.color+"44",paddingBottom:4}}>{section.section}</div>
                  {section.items.map(function(m){
                    var cur=form.perms[m.id]||"aucun";
                    return(
                      <div key={m.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+T.border+"66"}}>
                        <span style={{fontSize:12,color:T.text}}>{m.l}</span>
                        <div style={{display:"flex",gap:4}}>
                          {NIVEAUX.map(function(n){
                            var active=cur===n.id;
                            return(
                              <button key={n.id} onClick={function(){setPerm(m.id,n.id);}} style={{padding:"3px 8px",fontSize:10,fontWeight:700,borderRadius:5,cursor:"pointer",background:active?n.color+"22":"transparent",color:active?n.color:T.muted,border:"1px solid "+(active?n.color+"44":T.border),transition:"all 0.1s"}}>
                                {n.short}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );})}
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setEditing(null);setForm(null);}}>Annuler</Btn>
              <Btn onClick={sauvegarder} dis={!form.l}>Sauvegarder</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
