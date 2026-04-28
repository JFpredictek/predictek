
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Badge(p){var C={pv:{bg:"#EFF6FF",tc:"#1A56DB"},budget:{bg:"#E8F2EC",tc:"#1B5E3B"},contrat:{bg:"#FEF3E2",tc:"#B86020"},assurance:{bg:"#F3EEFF",tc:"#6B3FA0"},carnet:{bg:"#FFF5E6",tc:"#B86020"},autre:{bg:"#F0EDE8",tc:"#7C7568"}};var c=C[p.t]||C.autre;return <span style={{background:c.bg,color:c.tc,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{p.l||p.t}</span>;}

var TYPE_DOCS=[
  {id:"pv",l:"Proces-verbal"},
  {id:"budget",l:"Budget"},
  {id:"contrat",l:"Contrat fournisseur"},
  {id:"assurance",l:"Assurance"},
  {id:"carnet",l:"Carnet entretien Loi 16"},
  {id:"declaration",l:"Declaration de copropriete"},
  {id:"regl",l:"Reglement immeuble"},
  {id:"plan",l:"Plan et certificat"},
  {id:"avis",l:"Avis / Correspondance"},
  {id:"autre",l:"Autre"},
];

function DocCard(p){
  var d=p.doc;
  return(
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:T.surface,border:"1px solid "+T.border,borderRadius:10,marginBottom:8}}>
      <div style={{width:40,height:40,borderRadius:8,background:T.alt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:18}}>{d.nom&&d.nom.toLowerCase().endsWith(".pdf")?"P":d.nom&&d.nom.toLowerCase().endsWith(".xlsx")?"X":"D"}</span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.nom}</div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <Badge t={d.type_doc||"autre"} l={TYPE_DOCS.find(function(t){return t.id===d.type_doc;})?TYPE_DOCS.find(function(t){return t.id===d.type_doc;}).l:d.type_doc||"Autre"}/>
          {d.date_doc&&<span style={{fontSize:11,color:T.muted}}>{d.date_doc}</span>}
          {d.taille_kb&&<span style={{fontSize:11,color:T.muted}}>{d.taille_kb} KB</span>}
          {d.confidentiel&&<span style={{fontSize:10,color:T.red,fontWeight:700}}>CONFIDENTIEL</span>}
        </div>
        {d.description&&<div style={{fontSize:11,color:T.muted,marginTop:3}}>{d.description}</div>}
      </div>
      <div style={{display:"flex",gap:6,flexShrink:0}}>
        {d.url&&<Btn sm bg={T.blue} onClick={function(){window.open(d.url,"_blank");}}>Ouvrir</Btn>}
        <Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){p.onDelete(d.id);}}>X</Btn>
      </div>
    </div>
  );
}

function TabDocuments(p){
  var niveau=p.niveau;var titre=p.titre;var syndicatId=p.syndicatId;
  var s0=useState([]);var docs=s0[0];var setDocs=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({nom:"",type_doc:"autre",description:"",date_doc:"",confidentiel:false});var nf=s2[0];var setNf=s2[1];
  var s3=useState("");var filtre=s3[0];var setFiltre=s3[1];
  var s4=useState("tout");var typeFiltre=s4[0];var setTypeFiltre=s4[1];

  useEffect(function(){
    var opts={eq:{niveau:niveau},order:"created_at.desc"};
    if(syndicatId)opts.eq.syndicat_id=syndicatId;
    sb.select("documents",opts).then(function(res){
      if(res&&res.data)setDocs(res.data);
    }).catch(function(){});
  },[niveau,syndicatId]);

  function setN(k,v){setNf(function(pr){
    if(k==="nom")return Object.assign({},pr,{nom:v});
    if(k==="type_doc")return Object.assign({},pr,{type_doc:v});
    if(k==="description")return Object.assign({},pr,{description:v});
    if(k==="date_doc")return Object.assign({},pr,{date_doc:v});
    if(k==="confidentiel")return Object.assign({},pr,{confidentiel:v});
    return pr;
  });}

  function handleFile(e){
    var file=e.target.files[0];
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      setN("nom",file.name);
      setNf(function(pr){return Object.assign({},pr,{nom:file.name,taille_kb:Math.round(file.size/1024),url:ev.target.result});});
    };
    reader.readAsDataURL(file);
  }

  function ajouter(){
    if(!nf.nom)return;
    var row={niveau:niveau,nom:nf.nom,type_doc:nf.type_doc,description:nf.description,date_doc:nf.date_doc||null,confidentiel:nf.confidentiel,url:nf.url||"",taille_kb:nf.taille_kb||0};
    if(syndicatId)row.syndicat_id=syndicatId;
    sb.insert("documents",row).then(function(res){
      if(res&&res.data)setDocs(function(prev){return [res.data].concat(prev);});
      setShowN(false);setNf({nom:"",type_doc:"autre",description:"",date_doc:"",confidentiel:false});
      sb.log("documents","ajout","Document ajoute: "+nf.nom,"",syndicatId?"":nf.nom);
    }).catch(function(){});
  }

  function supprimer(id){
    sb.delete("documents",id).then(function(){
      setDocs(function(prev){return prev.filter(function(d){return d.id!==id;});});
    }).catch(function(){});
  }

  var docsFiltres=docs.filter(function(d){
    var matchType=typeFiltre==="tout"||d.type_doc===typeFiltre;
    var matchTexte=!filtre||d.nom.toLowerCase().includes(filtre.toLowerCase())||(d.description&&d.description.toLowerCase().includes(filtre.toLowerCase()));
    return matchType&&matchTexte;
  });

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:T.navy}}>{titre}</div>
          <div style={{fontSize:11,color:T.muted}}>{docs.length} document(s)</div>
        </div>
        <Btn onClick={function(){setShowN(true);}}>+ Ajouter un document</Btn>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input value={filtre} onChange={function(e){setFiltre(e.target.value);}} placeholder="Rechercher..." style={Object.assign({},INP,{flex:1,minWidth:160})}/>
        <select value={typeFiltre} onChange={function(e){setTypeFiltre(e.target.value);}} style={Object.assign({},INP,{width:180})}>
          <option value="tout">Tous les types</option>
          {TYPE_DOCS.map(function(t){return <option key={t.id} value={t.id}>{t.l}</option>;})}
        </select>
      </div>

      {showN&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>Nouveau document</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}>
              <Lbl l="Fichier"/>
              <input type="file" id={"fileUp"+niveau} onChange={handleFile} style={{display:"none"}} accept=".pdf,.PDF,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png"/>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Btn onClick={function(){document.getElementById("fileUp"+niveau).click();}}>{nf.nom?"Changer":"Choisir un fichier"}</Btn>
                {nf.nom&&<span style={{fontSize:11,color:T.muted}}>{nf.nom}</span>}
              </div>
            </div>
            <div>
              <Lbl l="Type de document"/>
              <select value={nf.type_doc} onChange={function(e){setN("type_doc",e.target.value);}} style={INP}>
                {TYPE_DOCS.map(function(t){return <option key={t.id} value={t.id}>{t.l}</option>;})}
              </select>
            </div>
            <div>
              <Lbl l="Date du document"/>
              <input type="date" value={nf.date_doc} onChange={function(e){setN("date_doc",e.target.value);}} style={INP}/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <Lbl l="Description (optionnel)"/>
              <input value={nf.description} onChange={function(e){setN("description",e.target.value);}} style={INP} placeholder="Notes ou description..."/>
            </div>
            <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={function(){setN("confidentiel",!nf.confidentiel);}}>
              <div style={{width:18,height:18,borderRadius:4,border:"2px solid "+(nf.confidentiel?T.red:T.border),background:nf.confidentiel?T.redL:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {nf.confidentiel&&<span style={{fontSize:11,fontWeight:700,color:T.red}}>V</span>}
              </div>
              <span style={{fontSize:12,color:T.red,fontWeight:600}}>Document confidentiel</span>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={ajouter} dis={!nf.nom}>Ajouter</Btn>
            <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
          </div>
        </div>
      )}

      {docsFiltres.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12,background:T.surface,border:"1px solid "+T.border,borderRadius:10}}>Aucun document{filtre?" pour cette recherche":""} - cliquez "+ Ajouter un document"</div>}
      {docsFiltres.map(function(d){return <DocCard key={d.id} doc={d} onDelete={supprimer}/>;})}
    </div>
  );
}

export default function GestionDocuments(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState("predictek");var niveau=s2[0];var setNiveau=s2[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  var NIVEAUX=[
    {id:"predictek",l:"Documents Predictek",desc:"Contrats, politiques, templates internes"},
    {id:"syndicat",l:"Documents Syndicat / CA",desc:"PV, budgets, contrats fournisseurs, Loi 16"},
    {id:"coproprietaire",l:"Documents Coproprietaires",desc:"Avis, relev-s, correspondances"},
  ];

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Gestion documentaire</div>
        {niveau!=="predictek"&&syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"240px 1fr",minHeight:"calc(100vh - 52px)"}}>
        <div style={{background:T.surface,borderRight:"1px solid "+T.border,padding:16}}>
          <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:12}}>Niveau d acces</div>
          {NIVEAUX.map(function(n){var a=niveau===n.id;return(
            <button key={n.id} onClick={function(){setNiveau(n.id);}} style={{width:"100%",textAlign:"left",background:a?T.accentL:"transparent",border:a?"1px solid "+T.accent+"44":"1px solid transparent",borderRadius:8,padding:"10px 12px",cursor:"pointer",marginBottom:6,fontFamily:"inherit"}}>
              <div style={{fontSize:12,fontWeight:a?700:600,color:a?T.accent:T.navy}}>{n.l}</div>
              <div style={{fontSize:10,color:T.muted,marginTop:3,lineHeight:1.4}}>{n.desc}</div>
            </button>
          );})}
        </div>
        <div style={{padding:20}}>
          {niveau==="predictek"&&<TabDocuments niveau="predictek" titre="Documents Predictek" syndicatId={null}/>}
          {niveau==="syndicat"&&<TabDocuments niveau="syndicat" titre={"Documents - "+(sel?sel.nom:"")} syndicatId={sel?sel.id:null}/>}
          {niveau==="coproprietaire"&&<TabDocuments niveau="coproprietaire" titre={"Documents copropri-taires - "+(sel?sel.nom:"")} syndicatId={sel?sel.id:null}/>}
        </div>
      </div>
    </div>
  );
}
