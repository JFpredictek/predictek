
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var CATEGORIES={coproprietaires:{l:"Coproprietaires",color:T.blue},factures:{l:"Factures",color:T.amber},bons_travail:{l:"Bons de travail",color:T.accent},usagers:{l:"Utilisateurs",color:"#6B3FA0"},assurances:{l:"Assurances",color:T.navy},carnet:{l:"Carnet Loi 16",color:"#6B3FA0"},membres_ca:{l:"Membres CA",color:T.accent},import:{l:"Import CSV",color:T.blue},communication:{l:"Communications",color:T.navy},pv:{l:"PV Reunion",color:T.navy},documents:{l:"Documents",color:T.amber},budget:{l:"Budget",color:T.accent}};

export default function Historique(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var logs=s2[0];var setLogs=s2[1];
  var s3=useState("tout");var catFiltre=s3[0];var setCatFiltre=s3[1];
  var s4=useState("");var recherche=s4[0];var setRecherche=s4[1];
  var s5=useState(50);var limite=s5[0];var setLimite=s5[1];
  var s6=useState(false);var loading=s6[0];var setLoading=s6[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setLoading(true);setLogs([]);
    sb.select("historique",{order:"created_at.desc",limit:limite}).then(function(res){
      if(res&&res.data)setLogs(res.data);
      setLoading(false);
    }).catch(function(){setLoading(false);});
  },[sel,limite]);

  function exporter(){
    var lignes=["Date,Categorie,Action,Description,Details"];
    filtres.forEach(function(l){lignes.push([l.created_at?l.created_at.substring(0,19):"",l.categorie||"",l.action||"",l.description||"",l.details||""].map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(","));});
    var blob=new Blob([lignes.join("
")],{type:"text/csv;charset=utf-8"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;a.download="historique_"+new Date().toISOString().substring(0,10)+".csv";a.click();URL.revokeObjectURL(url);
  }

  var filtres=logs.filter(function(l){
    var matchCat=catFiltre==="tout"||l.categorie===catFiltre;
    var matchText=!recherche||(l.action||"").toLowerCase().includes(recherche.toLowerCase())||(l.description||"").toLowerCase().includes(recherche.toLowerCase());
    return matchCat&&matchText;
  });

  var statsParCat={};logs.forEach(function(l){var c=l.categorie||"autre";if(!statsParCat[c])statsParCat[c]=0;statsParCat[c]++;});
  var top3=Object.entries(statsParCat).sort(function(a,b){return b[1]-a[1];}).slice(0,3);

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Historique et audit</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {logs.length>0&&<Btn sm bg="#ffffff18" bdr="1px solid #ffffff40" onClick={exporter}>Exporter CSV</Btn>}
        </div>
      </div>

      <div style={{padding:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:14}}><div style={{fontSize:11,color:T.muted}}>Total actions</div><div style={{fontSize:26,fontWeight:800,color:T.navy}}>{logs.length}</div></div>
          {top3.map(function(e){var cat=CATEGORIES[e[0]]||{l:e[0],color:T.muted};return(<div key={e[0]} style={{background:T.surface,border:"1px solid "+cat.color+"33",borderRadius:12,padding:14}}><div style={{fontSize:11,color:cat.color,fontWeight:600}}>{cat.l}</div><div style={{fontSize:22,fontWeight:800,color:T.navy}}>{e[1]}</div></div>);})}
        </div>

        <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
          <input value={recherche} onChange={function(e){setRecherche(e.target.value);}} placeholder="Rechercher dans l historique..." style={{flex:1,border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",outline:"none",minWidth:200}}/>
          <select value={catFiltre} onChange={function(e){setCatFiltre(e.target.value);}} style={{border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",outline:"none"}}>
            <option value="tout">Toutes categories</option>
            {Object.entries(CATEGORIES).map(function(e){return <option key={e[0]} value={e[0]}>{e[1].l}</option>;  })}
          </select>
        </div>

        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.alt}}>
                {["Date","Categorie","Action","Description","Details"].map(function(h){return <th key={h} style={{padding:"9px 12px",textAlign:"left",fontWeight:600,color:T.navy,whiteSpace:"nowrap"}}>{h}</th>;})}
              </tr></thead>
              <tbody>
                {filtres.map(function(l,i){
                  var cat=CATEGORIES[l.categorie]||{l:l.categorie||"",color:T.muted};
                  return(
                    <tr key={l.id||i} style={{borderBottom:"1px solid "+T.border}}>
                      <td style={{padding:"8px 12px",color:T.muted,whiteSpace:"nowrap",fontSize:11}}>{l.created_at?l.created_at.substring(0,16).replace("T"," "):"-"}</td>
                      <td style={{padding:"8px 12px"}}><span style={{background:cat.color+"22",color:cat.color,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{cat.l}</span></td>
                      <td style={{padding:"8px 12px",fontWeight:600,color:T.navy}}>{l.action||"-"}</td>
                      <td style={{padding:"8px 12px",color:T.muted,maxWidth:250,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.description||"-"}</td>
                      <td style={{padding:"8px 12px",color:T.muted,fontSize:11}}>{l.details||""}</td>
                    </tr>
                  );
                })}
                {filtres.length===0&&<tr><td colSpan={5} style={{padding:30,textAlign:"center",color:T.muted}}>{loading?"Chargement...":"Aucune action enregistree"}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {logs.length>=limite&&(
          <div style={{textAlign:"center",marginTop:16}}>
            <Btn onClick={function(){setLimite(limite+50);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Charger 50 de plus</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
