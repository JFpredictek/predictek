import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={navy:"#13233A",bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B"};

export default function Historique(){
  var s0=useState([]);var logs=s0[0];var setLogs=s0[1];
  var s1=useState("tout");var cat=s1[0];var setCat=s1[1];
  var s2=useState("");var q=s2[0];var setQ=s2[1];
  var s3=useState(50);var lim=s3[0];var setLim=s3[1];
  var s4=useState("tous");var usr=s4[0];var setUsr=s4[1];

  useEffect(function(){
    sb.select("historique",{order:"created_at.desc",limit:lim}).then(function(res){
      if(res&&res.data)setLogs(res.data);
    }).catch(function(){});
  },[lim]);

  var utilisateurs=[];
  logs.forEach(function(l){var n=l.utilisateur_nom||"";if(n&&utilisateurs.indexOf(n)<0)utilisateurs.push(n);});
  utilisateurs.sort();

  var filtres=logs.filter(function(l){
    if(cat!=="tout"&&l.categorie!==cat)return false;
    if(usr!=="tous"&&(l.utilisateur_nom||"")!==usr)return false;
    if(q&&!((l.action||"")+" "+(l.description||"")).toLowerCase().includes(q.toLowerCase()))return false;
    return true;
  });

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Historique et audit</div>
        <input value={q} onChange={function(e){setQ(e.target.value);}} placeholder="Rechercher..." style={{flex:1,maxWidth:300,border:"1px solid #ffffff30",borderRadius:6,padding:"5px 10px",background:"#ffffff18",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none"}}/>
        <select value={usr} onChange={function(e){setUsr(e.target.value);}} style={{background:"#ffffff18",border:"1px solid #ffffff30",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          <option value="tous" style={{color:"#000"}}>Tous les utilisateurs</option>
          {utilisateurs.map(function(u){return <option key={u} value={u} style={{color:"#000"}}>{u}</option>;})}
        </select>
        <select value={cat} onChange={function(e){setCat(e.target.value);}} style={{background:"#ffffff18",border:"1px solid #ffffff30",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          <option value="tout" style={{color:"#000"}}>Toutes</option>
          <option value="factures" style={{color:"#000"}}>Factures</option>
          <option value="coproprietaires" style={{color:"#000"}}>Copros</option>
          <option value="membres_ca" style={{color:"#000"}}>Membres CA</option>
          <option value="bons_travail" style={{color:"#000"}}>Travaux</option>
          <option value="communication" style={{color:"#000"}}>Comms</option>
        </select>
      </div>
      <div style={{padding:20}}>
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:T.alt}}>
              <th style={{padding:"9px 12px",textAlign:"left",fontWeight:600,color:T.navy}}>Date</th>
              <th style={{padding:"9px 12px",textAlign:"left",fontWeight:600,color:T.navy}}>Utilisateur</th>
              <th style={{padding:"9px 12px",textAlign:"left",fontWeight:600,color:T.navy}}>Categorie</th>
              <th style={{padding:"9px 12px",textAlign:"left",fontWeight:600,color:T.navy}}>Action</th>
              <th style={{padding:"9px 12px",textAlign:"left",fontWeight:600,color:T.navy}}>Description</th>
            </tr></thead>
            <tbody>
              {filtres.length===0&&(
                <tr><td colSpan={5} style={{padding:24,textAlign:"center",color:T.muted}}>Aucune action</td></tr>
              )}
              {filtres.map(function(l,i){
                return(
                  <tr key={l.id||i} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"8px 12px",color:T.muted,fontSize:11}}>{l.created_at?new Date(l.created_at).toLocaleString("fr-CA",{hour12:false}).replace(",","").substring(0,17):"-"}</td>
                    <td style={{padding:"8px 12px",fontWeight:600,color:T.navy,fontSize:11}}>{l.utilisateur_nom||"-"}</td>
                    <td style={{padding:"8px 12px",color:T.muted,fontSize:11}}>{l.categorie||"-"}</td>
                    <td style={{padding:"8px 12px",fontWeight:600,color:T.navy}}>{l.action||"-"}</td>
                    <td style={{padding:"8px 12px",color:T.muted}}>
                      {l.description||"-"}
                      {l.details&&<div style={{fontSize:10,color:"#8a8375",marginTop:3,whiteSpace:"pre-wrap",wordBreak:"break-word",background:"#F5F3EE",borderRadius:5,padding:"4px 8px"}}>{l.details.split(" | ").join("\n")}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {logs.length>=lim&&(
          <div style={{textAlign:"center",marginTop:12}}>
            <button onClick={function(){setLim(lim+50);}} style={{background:T.alt,border:"1px solid "+T.border,borderRadius:7,padding:"6px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit",color:T.muted}}>Charger plus</button>
          </div>
        )}
      </div>
    </div>
  );
}
