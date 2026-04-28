
import sb from "./lib/supabase";
import { useState } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",red:"#B83232"};

var ICONES={syndicats:"S",coproprietaires:"CP",factures:"FA",tickets:"CRM",reunions:"CA",membres_ca:"MC",fournisseurs:"F",documents:"DO",employes:"EMP"};
var LABELS={syndicats:"Syndicat",coproprietaires:"Coproprietaire",factures:"Facture",tickets:"Ticket CRM",reunions:"Reunion",membres_ca:"Membre CA",fournisseurs:"Fournisseur",documents:"Document",employes:"Employe"};
var COULEURS={syndicats:T.accent,coproprietaires:T.blue,factures:T.amber,tickets:T.red,reunions:T.blue,membres_ca:"#6B3FA0",fournisseurs:T.navy,documents:T.amber,employes:T.navy};

export default function RechercheGlobale(p){
  var onNavigate=p.onNavigate;
  var s0=useState("");var query=s0[0];var setQuery=s0[1];
  var s1=useState([]);var resultats=s1[0];var setResultats=s1[1];
  var s2=useState(false);var loading=s2[0];var setLoading=s2[1];
  var s3=useState(false);var open=s3[0];var setOpen=s3[1];

  function rechercher(q){
    setQuery(q);
    if(q.trim().length<2){setResultats([]);setOpen(false);return;}
    setLoading(true);setOpen(true);
    var terme=q.trim().toLowerCase();
    var promises=[
      sb.select("syndicats",{order:"nom.asc",limit:3}).then(function(res){
        if(!res||!res.data)return [];
        return res.data.filter(function(r){return (r.nom||"").toLowerCase().includes(terme)||(r.code||"").toLowerCase().includes(terme)||(r.ville||"").toLowerCase().includes(terme);}).map(function(r){return {table:"syndicats",id:r.id,titre:r.nom,sous:r.ville||"",nav:"copros"};});
      }),
      sb.select("coproprietaires",{order:"nom.asc",limit:5}).then(function(res){
        if(!res||!res.data)return [];
        return res.data.filter(function(r){return (r.nom||"").toLowerCase().includes(terme)||(r.unite||"").toLowerCase().includes(terme)||(r.courriel||"").toLowerCase().includes(terme);}).map(function(r){return {table:"coproprietaires",id:r.id,titre:(r.prenom||"")+" "+r.nom,sous:"Unite "+r.unite,nav:"copros"};});
      }),
      sb.select("factures",{order:"created_at.desc",limit:3}).then(function(res){
        if(!res||!res.data)return [];
        return res.data.filter(function(r){return (r.fournisseur_nom||"").toLowerCase().includes(terme)||(r.no_facture||"").toLowerCase().includes(terme);}).map(function(r){return {table:"factures",id:r.id,titre:r.fournisseur_nom,sous:"No: "+(r.no_facture||"-")+" - "+Number(r.total||0).toFixed(2)+" $",nav:"factures"};});
      }),
      sb.select("tickets",{order:"created_at.desc",limit:3}).then(function(res){
        if(!res||!res.data)return [];
        return res.data.filter(function(r){return (r.sujet||"").toLowerCase().includes(terme)||(r.unite||"").toLowerCase().includes(terme);}).map(function(r){return {table:"tickets",id:r.id,titre:r.sujet,sous:"Unite "+r.unite+" - "+r.statut,nav:"crm"};});
      }),
      sb.select("membres_ca",{order:"nom.asc",limit:3}).then(function(res){
        if(!res||!res.data)return [];
        return res.data.filter(function(r){return (r.nom||"").toLowerCase().includes(terme)||(r.prenom||"").toLowerCase().includes(terme)||(r.courriel||"").toLowerCase().includes(terme);}).map(function(r){return {table:"membres_ca",id:r.id,titre:(r.prenom||"")+" "+r.nom,sous:r.role_ca||"Membre",nav:"ca"};});
      }),
      sb.select("fournisseurs",{order:"nom.asc",limit:3}).then(function(res){
        if(!res||!res.data)return [];
        return res.data.filter(function(r){return (r.nom||"").toLowerCase().includes(terme)||(r.categorie||"").toLowerCase().includes(terme);}).map(function(r){return {table:"fournisseurs",id:r.id,titre:r.nom,sous:r.categorie||"",nav:"fournisseurs"};});
      }),
    ];
    Promise.all(promises).then(function(groups){
      var all=[];groups.forEach(function(g){all=all.concat(g||[]);});
      setResultats(all.slice(0,12));
      setLoading(false);
    }).catch(function(){setLoading(false);});
  }

  function selecter(r){
    setQuery("");setResultats([]);setOpen(false);
    if(onNavigate)onNavigate(r.nav);
  }

  function handleBlur(){setTimeout(function(){setOpen(false);},200);}

  return(
    <div style={{position:"relative",flex:1,maxWidth:400}}>
      <div style={{position:"relative"}}>
        <input
          value={query}
          onChange={function(e){rechercher(e.target.value);}}
          onFocus={function(){if(resultats.length>0)setOpen(true);}}
          onBlur={handleBlur}
          placeholder="Rechercher syndicat, coproprietaire, facture..."
          style={{width:"100%",background:"#ffffff18",border:"1px solid #ffffff30",borderRadius:20,padding:"6px 14px 6px 36px",color:"#fff",fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
        />
        <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#8da0bb",fontSize:12}}>?</div>
        {loading&&<div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#8da0bb",fontSize:10}}>...</div>}
      </div>
      {open&&resultats.length>0&&(
        <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,background:T.surface,border:"1px solid "+T.border,borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",zIndex:1000,maxHeight:400,overflow:"auto"}}>
          {resultats.map(function(r,i){
            var couleur=COULEURS[r.table]||T.navy;
            return(
              <div key={i} onClick={function(){selecter(r);}} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid "+T.alt,background:"transparent"}} onMouseEnter={function(e){e.currentTarget.style.background=T.alt;}} onMouseLeave={function(e){e.currentTarget.style.background="transparent";}}>
                <div style={{width:28,height:28,borderRadius:6,background:couleur+"22",border:"1px solid "+couleur+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:couleur,flexShrink:0}}>{ICONES[r.table]||"?"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:T.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.titre}</div>
                  <div style={{fontSize:10,color:T.muted}}>{LABELS[r.table]||r.table}{r.sous?" - "+r.sous:""}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {open&&query.length>=2&&resultats.length===0&&!loading&&(
        <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16,textAlign:"center",fontSize:12,color:T.muted,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",zIndex:1000}}>
          Aucun resultat pour "{query}"
        </div>
      )}
    </div>
  );
}
