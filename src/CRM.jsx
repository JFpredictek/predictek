import { useState, useMemo, useRef } from "react";

const T={bg:"#F5F3EE",surface:"#FFF",surfaceAlt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentMid:"#2D8653",accentLight:"#E8F2EC",accentPop:"#3CAF6E",gold:"#B8943A",goldLight:"#FAF3E0",red:"#B83232",redLight:"#FDECEA",amber:"#B86020",amberLight:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueLight:"#EFF6FF",purple:"#6B3FA0",purpleLight:"#F3EEFF",teal:"#0E7490",tealLight:"#ECFEFF"};

//  BASE DE CONNAISSANCES 
const BASE_LEGALE = "ACTE DE COPROPRIETE PIEDMONT & CODE CIVIL DU QUEBEC:\n" +
"" +
"" +
"" +
"Art.74 Acte: Avis de mutation dans les 15 jours de la publication de l'acte.\n" +
"" +
"" +
"" +
"" +
"" +
"" +
"Art.114.16 Acte: Maximum 2 animaux domestiques. Pitbulls et races dangereuses interdits.\n" +
"" +
"" +
"" +
"" +
"" +
"" +
"" +
"" +
"" +
"" +
"" +
"" +
"";

const FOURNISSEURS_MINI=[
  {id:1,nom:"",tel:"418-555-1001",cats:["deneigement"],note:0},
  {id:2,nom:"Paysagement Horizon",tel:"418-555-1002",cats:["paysagement"],note:0},
  {id:3,nom:"Plomberie ProFlo",tel:"418-555-1003",cats:["plomberie"],note:0},
  {id:4,nom:"AscenseurTech QC",tel:"418-555-1004",cats:["ascenseur","inspection"],note:0},
  {id:5,nom:"Travaux Escaliers inc.",tel:"418-555-1005",cats:["menuiserie","toiture"],note:0},
];
const CAT_FOUR_MAP={
  copro_reparation:["plomberie","electricite","menuiserie","toiture","nettoyage"],
  copro_autorisation:["menuiserie","paysagement","inspection"],
  admin_approbation:["deneigement","paysagement","ascenseur","inspection"],
};

const SYNDICATS=[
  {id:1,nom:"Syndicat Piedmont",court:"Piedmont",unites:36,plan:"Pro"},
  {id:2,nom:"Condos du Vieux-Port",court:"Vieux-Port",unites:32,plan:"Essentiel"},
  {id:3,nom:"Tour des Laurentides",court:"Laurentides",unites:128,plan:"Prestige"},
];

const AGENTS=[
  {id:1,nom:"",initiales:"JL",role:"Super Admin",couleur:T.gold},
  {id:2,nom:"Marie-Claude Bouchard",initiales:"MB",role:"Admin",couleur:T.navy},
  {id:3,nom:"Patrick Simard",initiales:"PS",role:"Utilisateur",couleur:T.blue},
];

const CATEGORIES={
  copro_question:{label:"Question",icon:"",couleur:T.blue,canAI:true,desc:""},
  copro_plainte:{label:"Plainte",icon:"!",couleur:T.red,canAI:false,desc:"Plainte contre un voisin ou une situation"},
  copro_reparation:{label:"",icon:"W",couleur:T.amber,canAI:false,desc:""},
  copro_autorisation:{label:"Autorisation",icon:"A",couleur:T.purple,canAI:true,desc:"Demande d'autorisation (travaux, animal, location...)"},
  copro_document:{label:"Document",icon:"D",couleur:T.accentMid,canAI:true,desc:"Demande de document ou information"},
  admin_decision:{label:"",icon:"C",couleur:T.accent,canAI:false,desc:""},
  admin_approbation:{label:"Approbation",icon:"V",couleur:T.accentMid,canAI:false,desc:"Approbation requise (facture, travaux...)"},
  admin_rapport:{label:"Rapport",icon:"R",couleur:T.navy,canAI:true,desc:""},
  interne_bug:{label:"Bug technique",icon:"B",couleur:T.red,canAI:false,desc:""},
  interne_support:{label:"Support",icon:"S",couleur:T.purple,canAI:true,desc:"Question de support sur l'utilisation"},
};

const ASSIGN_MODES={
  manual:{label:"Manuel",desc:"Un agent Predictek assigne manuellement"},
  auto_type:{label:"Auto par type",desc:""},
  round_robin:{label:"Round-robin",desc:"Rotation automatique entre les agents disponibles"},
};

const STATUTS={
  nouveau:{label:"Nouveau",c:T.blue,bg:T.blueLight},
  ai_repond:{label:"",c:T.purple,bg:T.purpleLight},
  en_cours:{label:"En cours",c:T.amber,bg:T.amberLight},
  attente_client:{label:"Att. client",c:T.gold,bg:T.goldLight},
  resolu:{label:"",c:T.accent,bg:T.accentLight},
  ferme:{label:"",c:T.muted,bg:T.surfaceAlt},
};

const TICKETS_INIT=[
  {id:1001,synd:1,cat:"copro_question",sujet:"",msg:"",auteur:"Michel Beaudoin",unite:"515",canal:"portail",statut:"resolu",priorite:"normale",agent:1,dateCreation:"2026-04-15 09:23",dateMaj:"2026-04-15 09:31",aiReponsible:true,messages:[{from:"ai",date:"2026-04-15 09:31",txt:""}]},
  {id:1002,synd:1,cat:"copro_plainte",sujet:"",msg:"",auteur:"",unite:"531",canal:"portail",statut:"en_cours",priorite:"haute",agent:2,dateCreation:"2026-04-19 22:41",dateMaj:"2026-04-20 10:15",aiReponsible:false,messages:[{from:"agent",nom:"Marie-Claude Bouchard",date:"2026-04-20 10:15",txt:""}]},
  {id:1003,synd:1,cat:"copro_autorisation",sujet:"Demande installation thermopompe murale",msg:"",auteur:"Simon Pellerin",unite:"525",canal:"courriel",statut:"nouveau",priorite:"normale",agent:null,dateCreation:"2026-04-21 14:05",dateMaj:"2026-04-21 14:05",aiReponsible:true,messages:[]},
  {id:1004,synd:1,cat:"admin_approbation",sujet:"",msg:"",auteur:"",unite:null,canal:"manuel",statut:"en_cours",priorite:"haute",agent:1,dateCreation:"2026-04-20 08:00",dateMaj:"2026-04-20 08:00",aiReponsible:false,messages:[]},
  {id:1005,synd:2,cat:"copro_question",sujet:"",msg:"",auteur:"Lucie Tremblay",unite:"204",canal:"portail",statut:"ai_repond",priorite:"normale",agent:null,dateCreation:"2026-04-22 11:30",dateMaj:"2026-04-22 11:30",aiReponsible:true,messages:[]},
  {id:1006,synd:1,cat:"copro_reparation",sujet:"Fuite d'eau dans le plafond du salon",msg:"",auteur:"Fabienne Maltais",unite:"527",canal:"portail",statut:"en_cours",priorite:"urgente",agent:2,dateCreation:"2026-04-22 18:45",dateMaj:"2026-04-22 18:45",aiReponsible:false,messages:[{from:"agent",nom:"Marie-Claude Bouchard",date:"2026-04-22 19:10",txt:""}],bon:{fourId:3,fourNom:"Plomberie ProFlo",bonId:101,titre:"",statut:"envoye",dateCreation:"2026-04-22"}},
  {id:1007,synd:3,cat:"interne_bug",sujet:"",msg:"",auteur:"",unite:null,canal:"manuel",statut:"nouveau",priorite:"haute",agent:3,dateCreation:"2026-04-22 09:15",dateMaj:"2026-04-22 09:15",aiReponsible:false,messages:[]},
  {id:1008,synd:1,cat:"copro_document",sujet:"",msg:"",auteur:"Lucette Tremblay",unite:"539",canal:"courriel",statut:"nouveau",priorite:"haute",agent:null,dateCreation:"2026-04-22 16:20",dateMaj:"2026-04-22 16:20",aiReponsible:true,messages:[]},
];

const ASSIGN_CONFIG_INIT={
  mode:"auto_type",
  type_rules:{
    copro_question:null,copro_autorisation:null,copro_document:null,admin_rapport:null,interne_support:null,
    copro_plainte:2,copro_reparation:2,admin_decision:1,admin_approbation:1,interne_bug:3,
  },
  round_robin_agents:[1,2,3],
  round_robin_next:0,
  ai_auto_reply:true,
  ai_confidence_threshold:75,
};

const td=()=>new Date().toISOString().slice(0,10);
const now=()=>new Date().toLocaleString("fr-CA",{dateStyle:"short",timeStyle:"short"});
const ini=n=>n.split(" ").filter(w=>w.length>1).map(w=>w[0]).join("").slice(0,2).toUpperCase();

function Tag({l,c,sz}){return <span style={{fontSize:sz||10,padding:"2px 7px",borderRadius:20,background:(c||T.accent)+"18",color:c||T.accent,fontWeight:600,whiteSpace:"nowrap"}}>{l}</span>;}
function Card({children,s}){return <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,...(s||{})}}>{children}</div>;}
function Av({ini:i,c,sz}){var size=sz||32;return <div style={{width:size,height:size,borderRadius:"50%",background:c||T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color:"#fff",flexShrink:0}}>{i}</div>;}
function SH({l,s}){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8,fontWeight:600,...(s||{})}}>{l}</div>;}
var inp={width:"100%",border:"1px solid "+T.border,borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",boxSizing:"border-box",background:T.surface,outline:"none"};
function Btn({onClick,children,bg,tc,sm,s,border}){return <button onClick={onClick} style={{background:bg||T.accent,border:border||"none""4px 10px":"8px 15px",color:tc||"#fff""pointer",fontFamily:"inherit",...(s||{})}}>{children}</button>;}
function Modal({open,onClose,title,w,children}){
  if(!open)return null;
  return <div style={{position:"fixed",inset:0,background:"#00000060",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:22,width:w||520,maxWidth:"95vw",maxHeight:"92vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <b style={{fontSize:15,color:T.text}}>{title}</b>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer""");
  const [aiLoading,setAiLoading]=useState(false);
  const [note,setNote]=useState("");
  const [subTab,setSubTab]=useState("conversation");
  const [selFour,setSelFour]=useState(null);
  const cat=CATEGORIES[ticket.cat]||{};
  const statut=STATUTS[ticket.statut]||{};
  const agent=AGENTS.find(a=>a.id===ticket.agent);
  const synd=SYNDICATS.find(s=>s.id===ticket.synd);

  async function genAI(){
    setAiLoading(true);
    const prompt = "" +
      ""+ticket.auteur+(ticket.unite?""+ticket.unite+", "+synd.nom+")":(" ("+synd.nom+")"))+".\n\n" +
      "DEMANDE: "+ticket.sujet+"\n"+ticket.msg+"\n\n" +
      ""+BASE_LEGALE+"\n\n" +
      "" +
      "" +
      "";
    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:"",messages:[{role:"user""Erreur de g????????????????????????????????n????????????????????????????????ration.";
      setReply(txt);
    } catch(e){setReply("");}
    setAiLoading(false);
  }

  function sendReply(isAI){
    if(!reply.trim())return;
    const newMsg={from:isAI?"ai":"agent""Predictek IA":AGENTS[0].nom,date:now(),txt:reply};
    onUpdate(ticket.id,{messages:[...ticket.messages,newMsg],statut:"attente_client",dateMaj:now()});
    setReply("");
  }

  function addNote(){
    if(!note.trim())return;
    const newMsg={from:"note",nom:AGENTS[0].nom,date:now(),txt:note};
    onUpdate(ticket.id,{messages:[...ticket.messages,newMsg],dateMaj:now()});
    setNote("");
  }

  const prioColor={urgente:T.red,haute:T.amber,normale:T.accent,basse:T.muted};

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%""14px 18px",borderBottom:"1px solid "+T.border,background:T.surfaceAlt}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:6,marginBottom:5,flexWrap:"wrap"}}>
              <span style={{fontSize:10,color:T.muted,fontFamily:"monospace"}}>#{ticket.id}</span>
              <Tag l={cat.label||ticket.cat} c={cat.couleur||T.muted}/>
              <Tag l={statut.label} c={statut.c}/>
              <Tag l={ticket.priorite} c={prioColor[ticket.priorite]||T.muted}/>
              <Tag l={ticket.canal} c={T.muted}/>
              {ticket.aiReponsible&&<Tag l="" c={T.purple}/>}
            </div>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:3}}>{ticket.sujet}</div>
            <div style={{fontSize:11,color:T.muted}}>{ticket.auteur}{ticket.unite?""+ticket.unite:"""""none",border:"none",fontSize:18,cursor:"pointer",color:T.muted,marginLeft:10}}>x</button>
        </div>
        {/* Actions rapides */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[{v:"en_cours",l:"En cours"},{v:"attente_client",l:"Att. client"},{v:"resolu",l:""},{v:"ferme",l:""}].map(st=>(
            <button key={st.v} onClick={()=>onUpdate(ticket.id,{statut:st.v,dateMaj:now()})}
              style={{background:ticket.statut===st.v?STATUTS[st.v].c:T.surfaceAlt,border:"1px solid ""3px 9px""#fff":T.muted,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
              {st.l}
            </button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:5,alignItems:"center"}}>
            <span style={{fontSize:10,color:T.muted}}>Agent:</span>
            <select value={ticket.agent||""} onChange={e=>onUpdate(ticket.id,{agent:parseInt(e.target.value)||null})}
              style={{border:"1px solid "+T.border,borderRadius:6,padding:"3px 7px",fontSize:10,fontFamily:"inherit",background:T.surface}}>
              <option value="""flex",gap:1,borderBottom:"1px solid "+T.border,padding:"0 18px",background:T.surface}}>
        {[{id:"conversation",l:"Conversation"},{id:"details",l:""},{id:"ia",l:"Assistant IA"},{id:"bon",l:"Bon de travail"}].map(t=>(
          <button key={t.id} onClick={()=>setSubTab(t.id)}
            style={{background:"none",border:"none""2px solid "+T.accent:"2px solid transparent""8px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit""auto",padding:"16px 18px"}}>
        {subTab==="conversation"&&(
          <div>
            {/* Message original */}
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <Av ini={ini(ticket.auteur)} c={T.navy} sz={34}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
                  <b style={{fontSize:12,color:T.text}}>{ticket.auteur}</b>
                  {ticket.unite&&<Tag l={""+ticket.unite} c={T.muted}/>}
                  <span style={{fontSize:10,color:T.muted}}>{ticket.dateCreation}</span>
                </div>
                <div style={{background:T.surfaceAlt,borderRadius:"0 10px 10px 10px",padding:"10px 14px",fontSize:12,color:T.text,lineHeight:1.6}}>{ticket.msg}</div>
              </div>
            </div>

            {/* Fil de messages */}
            {ticket.messages.map((m,i)=>{
              const isAI=m.from==="ai";
              const isNote=m.from==="note";
              const isAgent=m.from==="agent";
              if(isNote) return(
                <div key={i} style={{margin:"10px 0",padding:"8px 12px",background:T.goldLight,borderRadius:8,border:"1px dashed "+T.gold+"50""flex""row-reverse":"row"}}>
                  {isAI&&<div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,"+T.purple+","+T.blue+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>IA</div>}
                  {isAgent&&<Av ini={ini(m.nom||"P")} c={T.accent} sz={34}/>}
                  <div style={{flex:1,maxWidth:"80%"}}>
                    <div style={{display:"flex",gap:7,alignItems:"center""row-reverse":"row""Predictek IA":m.nom}</b>
                      <span style={{fontSize:9,color:T.muted}}>{m.date}</span>
                      {isAI&&<Tag l="" c={T.purple} sz={8}/>}
                    </div>
                    <div style={{background:isAI?"linear-gradient(135deg,"+T.purpleLight+","+T.blueLight+")""1px solid ""30""30""10px 0 10px 10px":"0 10px 10px 10px",padding:"10px 14px",fontSize:12,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.txt}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {subTab==="details"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[["Syndicat""????????????????????????????????????????????????"],["Canal",ticket.canal],["",ticket.priorite],["",agent?agent.nom:""],["",ticket.dateCreation],["",ticket.dateMaj],["",ticket.aiReponsible?"":""],["Nb messages",ticket.messages.length]].map(([l,v],i)=>(
                <div key={i} style={{background:T.surfaceAlt,borderRadius:7,padding:"8px 11px"}}>
                  <div style={{fontSize:9,color:T.muted,textTransform:"uppercase""10":T.surfaceAlt,borderRadius:8,padding:"10px 14px",border:"1px solid ""30""bon"&&(function(){
          var bon=ticket.bon||null;
          var matchingFours=FOURNISSEURS_MINI.filter(function(f){
            var cats=CAT_FOUR_MAP[ticket.cat]||[];
            return f.cats.some(function(c){return cats.indexOf(c)>=0;});
          });
          var SETAPES={cree:{l:"",c:T.muted},envoye:{l:"",c:T.blue},accepte:{l:"",c:T.accentMid},en_cours:{l:"En cours",c:T.amber},inspecte:{l:"",c:T.purple},termine:{l:"",c:T.accent},facture:{l:"",c:T.gold},paye:{l:"",c:T.accentPop}};
          var etapes=["cree","envoye","accepte","en_cours","inspecte","termine","facture","paye""1px solid "+T.accent+"30",borderRadius:10,padding:"12px 16px",marginBottom:14}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:4,textTransform:"uppercase",fontWeight:600,letterSpacing:"0.08em""flex",gap:8,alignItems:"center""flex""flex",gap:8,marginTop:10}}>
                      {["accepte","en_cours","inspecte","termine"].filter(function(e){return etapes.indexOf(e)>etapes.indexOf(bon.statut);}).slice(0,2).map(function(e){return(
                        <Btn key={e} sm onClick={function(){onUpdate(ticket.id,{bon:Object.assign({},bon,{statut:e}),dateMaj:now()});}} bg={T.accentLight} tc={T.accent} s={{border:"1px solid "+T.accent+"30""10px 14px""1px solid "+T.amber+"30",borderRadius:10,padding:"12px 16px""uppercase",letterSpacing:"0.08em""flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:9,marginBottom:6,cursor:"pointer",border:"2px solid "", ")}</div>
                          </div>
                          <div style={{fontSize:13,color:T.gold}}>{"".repeat(Math.floor(f.note))} <span style={{fontSize:10,color:T.muted}}>{f.note}</span></div>
                          {selFour===f.id&&<Tag l="" c={T.accent}/>}
                        </div>
                      );})}
                    </div>
                  )}
                  <Btn onClick={function(){
                    if(!selFour)return;
                    var f=FOURNISSEURS_MINI.find(function(x){return x.id===selFour;});
                    var bonId=Math.floor(Math.random()*900)+100;
                    var newBon={fourId:selFour,fourNom:f?f.nom:"",bonId:bonId,titre:ticket.sujet+""+ticket.unite,statut:"envoye",dateCreation:now().split(",")[0]};
                    var newMsg={from:"agent",nom:"Predictek",date:now(),txt:"Bon de travail #"+bonId+" cree et envoye a ""?")+". "};
                    onUpdate(ticket.id,{bon:newBon,statut:"en_cours",dateMaj:now(),messages:ticket.messages.concat([newMsg])});
                  }} s={{width:"100%"}}>
                    Creer et envoyer le bon de travail
                  </Btn>
                </div>
              )}
            </div>
          );
        })()}

        {subTab==="ia"&&(
          <div>
            <div style={{background:"linear-gradient(135deg,"+T.purpleLight+","+T.blueLight+")",borderRadius:10,padding:"12px 16px",marginBottom:14,border:"1px solid "+T.purple+"20""linear-gradient(135deg,"+T.purple+","+T.blue+")"} s={{width:"100%""G????????????????????????????????n????????????????????????????????ration en cours...":""}
                </Btn>
                {aiLoading&&<div style={{textAlign:"center",padding:"20px""10px 14px""1px solid "+T.border,padding:"14px 18px",background:T.surface}}>
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          {["","Note interne""none",borderRadius:5,padding:"3px 10px""#fff":T.amber,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              {t}
            </button>
          ))}
        </div>
        <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={3}
          placeholder=""
          style={{...inp,height:70,resize:"vertical",marginBottom:8,lineHeight:1.6}}/>
        <div style={{display:"flex""linear-gradient(135deg,"+T.purple+","+T.blue+")""");}}} bg={T.goldLight} tc={T.amber} s={{fontSize:11,border:"1px solid "+T.gold+"30"}}>Note interne</Btn>
        </div>
      </div>
    </div>
  );
}

//  MODAL NOUVEAU TICKET 
function ModalNouveauTicket({open,onClose,onSave}){
  const [form,setForm]=useState({synd:1,cat:"copro_question",sujet:"",msg:"",auteur:"",unite:"",canal:"manuel",priorite:"normale",agent:""});
  function sf(k,v){setForm(p=>({...p,[k]:v}));}
  function save(){
    if(!form.sujet||!form.msg||!form.auteur)return;
    const cat=CATEGORIES[form.cat];
    onSave({...form,id:Date.now()%10000+2000,statut:"nouveau""copro_question",sujet:"",msg:"",auteur:"",unite:"",canal:"manuel",priorite:"normale",agent:""});
  }
  return(
    <Modal open={open} onClose={onClose} title="Nouveau ticket" w={560}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <F l="Syndicat">
          <select value={form.synd} onChange={e=>sf("synd",parseInt(e.target.value))} style={inp}>
            {SYNDICATS.map(s=><option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
        </F>
        <F l="">
          <select value={form.cat} onChange={e=>sf("cat",e.target.value)} style={inp}>
            {Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
        </F>
        <F l="Auteur / Demandeur">
          <input value={form.auteur} onChange={e=>sf("auteur",e.target.value)} placeholder="Nom complet" style={inp}/>
        </F>
        <F l="">
          <input value={form.unite} onChange={e=>sf("unite",e.target.value)} placeholder="ex: 531" style={inp}/>
        </F>
        <F l="Canal">
          <select value={form.canal} onChange={e=>sf("canal",e.target.value)} style={inp}>
            <option value="portail""courriel">Courriel</option>
            <option value="manuel">Saisie manuelle</option>
            <option value="telephone""Priorit????????????????????????????????">
          <select value={form.priorite} onChange={e=>sf("priorite",e.target.value)} style={inp}>
            <option value="urgente">Urgente</option>
            <option value="haute">Haute</option>
            <option value="normale">Normale</option>
            <option value="basse">Basse</option>
          </select>
        </F>
      </div>
      <F l="Sujet *" s={{marginBottom:10}}>
        <input value={form.sujet} onChange={e=>sf("sujet",e.target.value)} placeholder="" style={inp}/>
      </F>
      <F l="Message / Description *" s={{marginBottom:10}}>
        <textarea value={form.msg} onChange={e=>sf("msg",e.target.value)} rows={4}
          placeholder="" style={{...inp,height:90,resize:"vertical"}}/>
      </F>
      <F l="" s={{marginBottom:16}}>
        <select value={form.agent} onChange={e=>sf("agent",e.target.value)} style={inp}>
          <option value="">Assignation automatique</option>
          {AGENTS.map(a=><option key={a.id} value={a.id}>{a.nom}</option>)}
        </select>
      </F>
      {CATEGORIES[form.cat]&&CATEGORIES[form.cat].canAI&&(
        <div style={{background:T.purpleLight,borderRadius:7,padding:"7px 11px""flex""1px solid "+T.border}>Annuler</Btn>
      </div>
    </Modal>
  );
}

//  VUE CONFIGURATION ASSIGNATION 
function VueConfig({config,setConfig}){
  function sf(k,v){setConfig(p=>({...p,[k]:v}));}
  function setRule(cat,agentId){setConfig(p=>({...p,type_rules:{...p.type_rules,[cat]:agentId||null}}));}
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <SH l="Mode d'assignation global"/>
        {Object.entries(ASSIGN_MODES).map(([k,v])=>(
          <div key={k} onClick={()=>sf("mode",k)}
            style={{display:"flex",alignItems:"flex-start",gap:8,padding:"9px 11px",borderRadius:8,marginBottom:5,cursor:"pointer""1px solid ""30":T.border)}}>
            <div style={{width:14,height:14,borderRadius:"50%",border:"2px solid ""transparent""R????????????????????????????????ponse automatique par IA"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center""ai_auto_reply""pointer",position:"relative",flexShrink:0}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute""left .2s",boxShadow:"0 1px 3px #0003"}}/>
          </div>
        </div>
        <div>
          <div style={{fontSize:11,color:T.muted,marginBottom:5}}>Seuil de confiance minimum: <b style={{color:T.purple}}>{config.ai_confidence_threshold}%</b></div>
          <input type="range" min={50} max={95} value={config.ai_confidence_threshold}
            onChange={e=>sf("ai_confidence_threshold",parseInt(e.target.value))}
            style={{width:"100%",accentColor:T.purple}}/>
          <div style={{display:"flex",justifyContent:"space-between""8px 11px"", ")}
        </div>
      </Card>
      {config.mode==="auto_type"&&(
        <Card s={{gridColumn:"span 2"}}>
          <SH l=""/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
            {Object.entries(CATEGORIES).map(([k,v])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",background:T.surfaceAlt,borderRadius:8}}>
                <div style={{width:24,height:24,borderRadius:6,background:v.couleur+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:v.couleur,flexShrink:0}}>{v.icon}</div>
                <span style={{fontSize:11,color:T.text,flex:1}}>{v.label}</span>
                {v.canAI&&<Tag l="IA" c={T.purple} sz={8}/>}
                <select value={config.type_rules[k]||"""1px solid "+T.border,borderRadius:5,padding:"3px 6px",fontSize:10,fontFamily:"inherit",background:T.surface}}>
                  <option value=""" ")[0]}</option>)}
                </select>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

//  APP PRINCIPALE 
export default function CRM(){
  const [tickets,setTickets]=useState(TICKETS_INIT);
  const [config,setConfig]=useState(ASSIGN_CONFIG_INIT);
  const [selTicket,setSelTicket]=useState(null);
  const [tab,setTab]=useState("tickets");
  const [filtres,setFiltres]=useState({synd:"tous",cat:"tous",statut:"tous",agent:"tous",priorite:"tous",q:""});
  const [modalNew,setModalNew]=useState(false);
  const [viewMode,setViewMode]=useState("liste""tous"||t.synd===parseInt(filtres.synd);
    const okC=filtres.cat==="tous"||t.cat===filtres.cat;
    const okSt=filtres.statut==="tous"||t.statut===filtres.statut;
    const okA=filtres.agent==="tous"||(filtres.agent==="none"&&!t.agent)||(t.agent===parseInt(filtres.agent));
    const okP=filtres.priorite==="tous"||t.priorite===filtres.priorite;
    const okQ=filtres.q===""||t.sujet.toLowerCase().includes(filtres.q.toLowerCase())||t.auteur.toLowerCase().includes(filtres.q.toLowerCase());
    return okS&&okC&&okSt&&okA&&okP&&okQ;
  }),[tickets,filtres]);

  // Stats
  const stats={
    total:tickets.length,
    nouveaux:tickets.filter(t=>t.statut==="nouveau").length,
    enCours:tickets.filter(t=>["en_cours","ai_repond"].includes(t.statut)).length,
    urgents:tickets.filter(t=>t.priorite==="urgente"&&t.statut!=="resolu"&&t.statut!=="ferme").length,
    aiHandled:tickets.filter(t=>t.aiReponsible).length,
    nonAssignes:tickets.filter(t=>!t.agent&&!["resolu","ferme"].includes(t.statut)).length,
  };

  const prioColor={urgente:T.red,haute:T.amber,normale:T.accent,basse:T.muted};

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"Georgia,serif",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:T.navy,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,"+T.accent+","+T.accentPop+")",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:900,fontSize:15,fontFamily:"Georgia,serif"}}>P</span>
          </div>
          <div style={{fontSize:13,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>Predictek</div>
          <div style={{width:1,height:22,background:"#ffffff20",margin:"0 6px""flex",alignItems:"center",gap:8}}>
          {stats.urgents>0&&<div style={{background:T.red,borderRadius:20,padding:"3px 10px",fontSize:10,color:"#fff""s":""}</div>}
          {stats.nonAssignes>0&&<div style={{background:T.amber,borderRadius:20,padding:"3px 10px",fontSize:10,color:"#fff""s":""}</div>}
          <Av ini="JL" c={T.gold} sz={28}/>
          <span style={{fontSize:10,color:"#8da0bb""1px solid "+T.border,padding:"0 20px",display:"flex",gap:2}}>
        {[{id:"tickets",l:"Tickets"},{id:"stats",l:"Statistiques"},{id:"config_crm",l:"Configuration"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{background:"none",border:"none""2px solid "+T.accent:"2px solid transparent""11px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit""tickets""#fff",fontSize:9,borderRadius:20,padding:"1px 5px",fontWeight:700}}>{stats.nouveaux}</span>:null}
          </button>
        ))}
      </div>

      {tab==="tickets"&&(
        <div style={{display:"flex",flex:1,overflow:"hidden""flex",flexDirection:"column""1px solid "+T.border:"none"}}>
            {/* KPIs */}
            <div style={{padding:"12px 16px",borderBottom:"1px solid "+T.border,background:T.surface}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:12}}>
                {[{l:"Total",v:stats.total,c:T.navy},{l:"Nouveaux",v:stats.nouveaux,c:T.blue},{l:"En cours",v:stats.enCours,c:T.amber},{l:"Urgents",v:stats.urgents,c:T.red},{l:"",v:stats.aiHandled,c:T.purple},{l:"",v:stats.nonAssignes,c:T.amber}].map((k,i)=>(
                  <div key={i} style={{background:T.surfaceAlt,borderRadius:8,padding:"7px 10px",borderLeft:"3px solid "+k.c}}>
                    <div style={{fontSize:8,color:T.muted,textTransform:"uppercase",marginBottom:2}}>{k.l}</div>
                    <div style={{fontSize:18,fontWeight:700,color:k.c}}>{k.v}</div>
                  </div>
                ))}
              </div>
              {/* Filtres */}
              <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
                <input value={filtres.q} onChange={e=>sf("q",e.target.value)} placeholder="Rechercher..."
                  style={{...inp,width:150,fontSize:11}}/>
                {[
                  {k:"synd",opts:[{v:"tous",l:"Tous syndicats"},...SYNDICATS.map(s=>({v:s.id,l:s.court}))]},
                  {k:"statut",opts:[{v:"tous",l:"Tous statuts"},...Object.entries(STATUTS).map(([k,v])=>({v:k,l:v.label}))]},
                  {k:"cat",opts:[{v:"tous",l:""},...Object.entries(CATEGORIES).map(([k,v])=>({v:k,l:v.label}))]},
                  {k:"priorite",opts:[{v:"tous",l:""},{v:"urgente",l:"Urgente"},{v:"haute",l:"Haute"},{v:"normale",l:"Normale"},{v:"basse",l:"Basse"}]},
                  {k:"agent",opts:[{v:"tous",l:"Tous agents"},{v:"none",l:""},...AGENTS.map(a=>({v:a.id,l:a.initiales}))]},
                ].map(({k,opts})=>(
                  <select key={k} value={filtres[k]} onChange={e=>sf(k,e.target.value)}
                    style={{...inp,width:"auto",fontSize:10,padding:"4px 8px"}}>
                    {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ))}
                <Btn onClick={()=>setModalNew(true)} s={{marginLeft:"auto",fontSize:11}}>+ Nouveau ticket</Btn>
              </div>
            </div>

            {/* Liste tickets */}
            <div style={{flex:1,overflowY:"auto"}}>
              {filtered.length===0&&<div style={{textAlign:"center",padding:"40px""12px 16px",borderBottom:"1px solid "+T.border+"70",cursor:"pointer""urgente""05":"transparent""3px solid "+T.accent:t.priorite==="urgente""3px solid "+T.red:"3px solid transparent",transition:"background .1s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:5,marginBottom:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:9,color:T.muted,fontFamily:"monospace"}}>#{t.id}</span>
                          <Tag l={cat.label||t.cat} c={cat.couleur||T.muted} sz={9}/>
                          <Tag l={st.label} c={st.c} sz={9}/>
                          <Tag l={t.priorite} c={prioColor[t.priorite]||T.muted} sz={9}/>
                          {t.aiReponsible&&<Tag l="IA" c={T.purple} sz={8}/>}
                        {t.bon&&<Tag l={"BT #"" ???????????????????????????????? Unit???????????????????????????????? "+t.unite:""""}</div>
                      </div>
                      <div style={{textAlign:"right""50%",background:T.border,display:"flex",alignItems:"center",justifyContent:"center"" ")[0]}</div>
                        {t.messages.length>0&&<div style={{fontSize:9,color:T.muted}}>{t.messages.length} msg</div>}
                      </div>
                    </div>
                    <div style={{fontSize:10,color:T.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap""flex",flexDirection:"column",overflow:"hidden"}}>
              <DetailTicket ticket={selTicket} onUpdate={updTicket} onClose={()=>setSelTicket(null)}/>
            </div>
          )}
        </div>
      )}

      {tab==="stats"&&(
        <div style={{padding:"22px 26px",maxWidth:1200,margin:"0 auto",width:"100%"}}>
          <h2 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>Statistiques CRM</h2>
          <p style={{color:T.muted,fontSize:12,marginBottom:18}}>Vue globale de tous les tickets et de la performance de l'IA</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
            {[
              {l:"",v:tickets.filter(t=>t.aiReponsible).length+"/"+tickets.length,pct:Math.round(tickets.filter(t=>t.aiReponsible).length/tickets.length*100),c:T.purple},
              {l:"",v:tickets.filter(t=>["resolu","ferme"].includes(t.statut)).length+"/"+tickets.length,pct:Math.round(tickets.filter(t=>["resolu","ferme"].includes(t.statut)).length/tickets.length*100),c:T.accent},
              {l:"Tickets urgents ouverts",v:stats.urgents,pct:Math.round(stats.urgents/tickets.length*100),c:T.red},
            ].map((k,i)=>(
              <Card key={i} s={{borderLeft:"4px solid "+k.c}}>
                <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",marginBottom:5}}>{k.l}</div>
                <div style={{fontSize:24,fontWeight:700,color:k.c,marginBottom:8}}>{k.v}</div>
                <div style={{background:T.surfaceAlt,borderRadius:5,height:7,overflow:"hidden"}}>
                  <div style={{width:k.pct+"%",height:"100%",background:k.c,borderRadius:5}}/>
                </div>
                <div style={{fontSize:9,color:T.muted,marginTop:4}}>{k.pct}%</div>
              </Card>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <SH l=""/>
              {Object.entries(CATEGORIES).map(([k,v])=>{
                const n=tickets.filter(t=>t.cat===k).length;
                if(!n)return null;
                return(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
                    <div style={{width:24,height:24,borderRadius:6,background:v.couleur+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:v.couleur,flexShrink:0}}>{v.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:11,color:T.text}}>{v.label}</span>
                        <span style={{fontSize:11,fontWeight:600,color:v.couleur}}>{n}</span>
                      </div>
                      <div style={{background:T.surfaceAlt,borderRadius:3,height:5,overflow:"hidden"}}>
                        <div style={{width:(n/tickets.length*100)+"%",height:"100%",background:v.couleur,borderRadius:3}}/>
                      </div>
                    </div>
                    {v.canAI&&<Tag l="IA" c={T.purple} sz={8}/>}
                  </div>
                );
              })}
            </Card>
            <Card>
              <SH l="Tickets par syndicat"/>
              {SYNDICATS.map(s=>{
                const n=tickets.filter(t=>t.synd===s.id).length;
                const resolus=tickets.filter(t=>t.synd===s.id&&["resolu","ferme"].includes(t.statut)).length;
                return(
                  <div key={s.id} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between""hidden"}}>
                      <div style={{width:(resolus/Math.max(n,1)*100)+"%",height:"100%",background:T.accent,borderRadius:5}}/>
                    </div>
                  </div>
                );
              })}
              <Card s={{marginTop:14,background:T.purpleLight,border:"1px solid "+T.purple+"20"}}>
                <SH l="Performance IA""config_crm"&&(
        <div style={{padding:"22px 26px",maxWidth:1200,margin:"0 auto",width:"100%"}}>
          <h2 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>Configuration du CRM</h2>
          <p style={{color:T.muted,fontSize:12,marginBottom:18}}>Mode d'assignation, r????????????????????????????????ponse IA automatique, r????????????????????????????????gles par cat????????????????????????????????gorie</p>
          <VueConfig config={config} setConfig={setConfig}/>
        </div>
      )}

      <ModalNouveauTicket open={modalNew} onClose={()=>setModalNew(false)} onSave={addTicket}/>
    </div>
  );
}
