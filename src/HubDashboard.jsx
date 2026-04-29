
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0"};

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

function KPIBadge(p){return <div style={{background:p.bg||T.alt,borderRadius:8,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:6}}><span style={{fontSize:16,fontWeight:800,color:p.color||T.navy}}>{p.val}</span><span style={{fontSize:10,color:T.muted}}>{p.l}</span></div>;}

function CarteSyndicat(p){
  var s=p.syndicat;var stats=p.stats||{};
  var alertCount=(stats.ceExpires||0)+(stats.assExpires||0)+(stats.facturesRetard||0);
  return(
    <div style={{background:T.surface,border:"1px solid "+(alertCount>0?T.amber:T.border),borderRadius:14,padding:20,cursor:"pointer",transition:"box-shadow 0.2s"}} onClick={function(){p.onSelect(s);}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:800,color:T.navy,marginBottom:2}}>{s.nom}</div>
          <div style={{fontSize:11,color:T.muted}}>{s.adr?s.adr+", ":""}{s.ville||""}</div>
          {s.immat&&<div style={{fontSize:10,color:T.muted}}>NEQ: {s.immat}</div>}
        </div>
        {alertCount>0&&<span style={{background:T.amberL,color:T.amber,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,flexShrink:0}}>{alertCount} alerte(s)</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
        <div style={{textAlign:"center",background:T.accentL,borderRadius:8,padding:10}}>
          <div style={{fontSize:20,fontWeight:800,color:T.accent}}>{stats.nbCopros||0}</div>
          <div style={{fontSize:9,color:T.muted,textTransform:"uppercase"}}>Unites</div>
        </div>
        <div style={{textAlign:"center",background:stats.tauxPerception<80?T.amberL:T.accentL,borderRadius:8,padding:10}}>
          <div style={{fontSize:20,fontWeight:800,color:stats.tauxPerception<80?T.amber:T.accent}}>{stats.tauxPerception||0}%</div>
          <div style={{fontSize:9,color:T.muted,textTransform:"uppercase"}}>Perception</div>
        </div>
        <div style={{textAlign:"center",background:stats.facturesEnAttente>0?T.amberL:T.alt,borderRadius:8,padding:10}}>
          <div style={{fontSize:20,fontWeight:800,color:stats.facturesEnAttente>0?T.amber:T.muted}}>{stats.facturesEnAttente||0}</div>
          <div style={{fontSize:9,color:T.muted,textTransform:"uppercase"}}>Factures</div>
        </div>
      </div>
      {alertCount>0&&(
        <div style={{background:T.amberL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.amber}}>
          {stats.ceExpires>0&&<div>CE à renouveler: {stats.ceExpires}</div>}
          {stats.assExpires>0&&<div>Assurances à renouveler: {stats.assExpires}</div>}
          {stats.facturesRetard>0&&<div>Factures en retard: {stats.facturesRetard}</div>}
        </div>
      )}
    </div>
  );
}

export default function HubDashboard(p){
  var onNavigate=p.onNavigate;
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState({});var stats=s1[0];var setStats=s1[1];
  var s2=useState(false);var loading=s2[0];var setLoading=s2[1];
  var s3=useState("dashboard");var vue=s3[0];var setVue=s3[1];

  useEffect(function(){
    setLoading(true);
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(!res||!res.data){setLoading(false);return;}
      setSyndicats(res.data);
      var promises=res.data.map(function(s){
        return Promise.all([
          sb.select("coproprietaires",{eq:{syndicat_id:s.id}}),
          sb.select("paiements",{eq:{syndicat_id:s.id},limit:100}),
          sb.select("factures",{eq:{syndicat_id:s.id},limit:50}),
        ]).then(function(results){
          var copros=results[0]&&results[0].data?results[0].data:[];
          var paies=results[1]&&results[1].data?results[1].data:[];
          var facts=results[2]&&results[2].data?results[2].data:[];
          var mois=new Date().toISOString().substring(0,7);
          var paiesMois=paies.filter(function(p){return p.date_paiement&&p.date_paiement.substring(0,7)===mois;});
          var totalMois=paiesMois.reduce(function(a,p){return a+Number(p.montant||0);},0);
          var payesMois=paiesMois.filter(function(p){return p.statut==="paye";}).reduce(function(a,p){return a+Number(p.montant||0);},0);
          var today=new Date();
          var ceExpires=copros.filter(function(c){return c.ce_expiry&&Math.round((new Date(c.ce_expiry)-today)/(1000*60*60*24))<60;}).length;
          var assExpires=copros.filter(function(c){return c.ass_expiry&&Math.round((new Date(c.ass_expiry)-today)/(1000*60*60*24))<60;}).length;
          var facturesRetard=facts.filter(function(f){return f.date_echeance&&new Date(f.date_echeance)<today&&f.statut!=="payee"&&f.statut!=="annulee";}).length;
          var facturesEnAttente=facts.filter(function(f){return f.statut==="en_attente_approbation";}).length;
          var totalCot=copros.filter(function(c){return c.statut==="actif";}).reduce(function(a,c){return a+Number(c.cotisation_mensuelle||0);},0);
          return {id:s.id,totalCot:totalCot,nbCopros:copros.filter(function(c){return c.statut==="actif";}).length,tauxPerception:totalMois>0?Math.round(payesMois/totalMois*100):0,ceExpires:ceExpires,assExpires:assExpires,facturesRetard:facturesRetard,facturesEnAttente:facturesEnAttente};
        });
      });
      Promise.all(promises).then(function(allStats){
        var statsMap={};allStats.forEach(function(st){statsMap[st.id]=st;});
        setStats(statsMap);setLoading(false);
      }).catch(function(){setLoading(false);});
    }).catch(function(){setLoading(false);});
  },[]);

  var totalSyndicats=syndicats.length;
  var totalUnites=Object.values(stats).reduce(function(a,s){return a+(s.nbCopros||0);},0);
  var totalAlertes=Object.values(stats).reduce(function(a,s){return a+(s.ceExpires||0)+(s.assExpires||0)+(s.facturesRetard||0);},0);
  var totalFacturesAttente=Object.values(stats).reduce(function(a,s){return a+(s.facturesEnAttente||0);},0);
  var totalCotisations=Object.values(stats).reduce(function(a,s){return a+(s.totalCot||0);},0);

  var RACCOURCIS=[
    {l:"Ajouter un syndicat",icon:"P",nav:"hub",color:T.accent},
    {l:"Copropriétaires",icon:"CP",nav:"copros",color:T.blue},
    {l:"Factures",icon:"FA",nav:"factures",color:T.amber},
    {l:"Bons de travail",icon:"BT",nav:"bons",color:T.accent},
    {l:"Communications",icon:"CO",nav:"comm",color:T.navy},
    {l:"Rapports",icon:"RF",nav:"rapports",color:T.purple},
  ];

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:"linear-gradient(135deg,"+T.navy+" 0%,#1A3A5C 100%)",padding:"24px 24px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:4}}>Predictek</div>
            <div style={{fontSize:12,color:"#8da0bb"}}>Plateforme de gestion de copropriété</div>
          </div>
          <div style={{fontSize:11,color:"#8da0bb",textAlign:"right"}}>{new Date().toLocaleDateString("fr-CA",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
          {[
            {l:"Syndicats actifs",v:totalSyndicats,color:"#3CAF6E"},
            {l:"Unités totales",v:totalUnites,color:"#64B5F6"},
            {l:"Cotisations /mois",v:totalCotisations.toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $",color:"#1B5E3B"},
            {l:"Alertes actives",v:totalAlertes,color:totalAlertes>0?"#B83232":"#3CAF6E"},
            {l:"Factures en attente",v:totalFacturesAttente,color:totalFacturesAttente>0?"#B86020":"#7C7568"},
          ].map(function(k,i){return(
            <div key={i} style={{background:"#ffffff12",borderRadius:12,padding:14,border:"1px solid #ffffff15"}}>
              <div style={{fontSize:28,fontWeight:900,color:k.color}}>{loading?"...":k.v}</div>
              <div style={{fontSize:11,color:"#8da0bb"}}>{k.l}</div>
            </div>
          );})
          }
        </div>
      </div>

      <div style={{padding:20}}>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Raccourcis rapides</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {RACCOURCIS.map(function(r){return(
              <button key={r.nav} onClick={function(){if(onNavigate)onNavigate(r.nav);}} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                <div style={{width:26,height:26,borderRadius:6,background:r.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:r.color}}>{r.icon}</div>
                <span style={{fontSize:12,fontWeight:600,color:T.navy}}>{r.l}</span>
              </button>
            );})}
          </div>
        </div>

        <div style={{fontSize:12,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>
          Mes syndicats ({totalSyndicats})
        </div>

        {loading&&<div style={{textAlign:"center",padding:40,color:T.muted}}>Chargement des données...</div>}

        {!loading&&syndicats.length===0&&(
          <div style={{background:T.surface,border:"2px dashed "+T.border,borderRadius:14,padding:40,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:12}}>P</div>
            <div style={{fontSize:16,fontWeight:700,color:T.navy,marginBottom:8}}>Bienvenue dans Predictek !</div>
            <div style={{fontSize:13,color:T.muted,marginBottom:20}}>Commencez par créer votre premier syndicat.</div>
            <Btn onClick={function(){if(onNavigate)onNavigate("hub");}}>Créer mon premier syndicat</Btn>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
          {syndicats.map(function(s){return <CarteSyndicat key={s.id} syndicat={s} stats={stats[s.id]||{}} onSelect={function(){if(onNavigate)onNavigate("tableau");}}/>;  })}
        </div>
      </div>
    </div>
  );
}
