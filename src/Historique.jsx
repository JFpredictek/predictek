import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A"};

function Btn(p){return <button onClick={p.onClick} style={{background:p.bg||"#1B5E3B",border:"none",borderRadius:7,padding:"5px 12px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

export default function Historique(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var logs=s2[0];var setLogs=s2[1];
  var s3=useState("tout");var cat=s3[0];var setCat=s3[1];
  var s4=useState("");var q=s4[0];var setQ=s4[1];
  var s5=useState(50);var lim=s5[0];var setLim=s5[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setLogs([]);
    sb.select("historique",{order:"created_at.desc",limit:lim}).then(function(res){
      if(res&&res.data)setLogs(res.data);
    }).catch(function(){});
  },[sel,lim]);

  var filtres=logs.filter(function(l){
    var mc=cat==="tout"||l.categorie===cat;
    var mq=!q||(l.action||"").toLowerCase().includes(q.toLowerCase())||(l.description||"").toLowerCase().includes(q.toLowerCase());
    return mc&&mq;
  });

  function exporter(){
    var rows=["Date,Categorie,Action,Description"];
    filtres.forEach(function(l){rows.push((l.created_at?l.created_at.substring(0,16):"")+","+(l.categorie||"")+","+(l.action||"")+","+(l.description||""));});
    var a=document.createElement("a");
    a.href="data:text/plain,"+encodeURIComponent(rows.join("\n"));
    a.download="historique.csv";
    a.click();
  }

  var CATS={coproprietaires:"Copros",factures:"Factures",bons_travail:"Travaux",usagers:"Usagers",membres_ca:"Membres CA",communication:"Comms",documents:"Docs",budget:"Budget"};

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Historique et audit</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{marginLeft:"auto"}}>
          {logs.length>0&&<Btn onClick={exporter}>Exporter CSV</Btn>}
        </div>
      </div>
      <div style={{padding:20}}>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <input value={q} onChange={function(e){setQ(e.target.value);}} placeholder="Rechercher..." style={{flex:1,border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",outline:"none"}}/>
          <select value={cat} onChange={function(e){setCat(e.target.value);}} style={{border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",outline:"none"}}>
            <option value="tout">Toutes</option>
            {Object.keys(CATS).map(function(k){return <option key={k} value={k}>{CATS[k]}</option>;})}
          </select>
        </div>
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:T.alt}}>
              {["Date","Categorie","Action","Description"].map(function(h){return <th key={h} style={{padding:"9px 12px",textAlign:"left",fontWeight:600,color:T.navy}}>{h}</th>;})}
            </tr></thead>
            <tbody>
              {filtres.map(function(l,i){return(
                <tr key={l.id||i} style={{borderBottom:"1px solid "+T.border}}>
                  <td style={{padding:"8px 12px",color:T.muted,fontSize:11,whiteSpace:"nowrap"}}>{l.created_at?l.created_at.substring(0,16).replace("T"," "):"-"}</td>
                  <td style={{padding:"8px 12px",color:T.muted,fontSize:11}}>{l.categorie||"-"}</td>
                  <td style={{padding:"8px 12px",fontWeight:600,color:T.navy}}>{l.action||"-"}</td>
                  <td style={{padding:"8px 12px",color:T.muted,maxWidth:300,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.description||"-"}</td>
                </tr>
              );})
              {filtres.length===0&&<tr><td colSpan={4} style={{padding:24,textAlign:"center",color:T.muted}}>Aucune action</td></tr>}
            </tbody>
          </table>
        </div>
        {logs.length>=lim&&<div style={{textAlign:"center",marginTop:12}}><Btn onClick={function(){setLim(lim+50);}}>Charger plus</Btn></div>}
      </div>
    </div>
  );
}
