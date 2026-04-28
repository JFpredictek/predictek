
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};

function KPI(p){
  return(
    <div style={{background:p.bg||T.surface,border:"1px solid "+(p.bc||T.border),borderRadius:14,padding:16}}>
      <div style={{fontSize:11,color:T.muted,marginBottom:6}}>{p.titre}</div>
      <div style={{fontSize:26,fontWeight:800,color:p.couleur||T.navy}}>{p.valeur}</div>
      {p.sous&&<div style={{fontSize:11,color:T.muted,marginTop:4}}>{p.sous}</div>}
      {p.pct!==undefined&&(
        <div style={{marginTop:8}}>
          <div style={{background:T.alt,borderRadius:20,height:6,overflow:"hidden"}}>
            <div style={{height:"100%",width:Math.min(100,p.pct)+"%",background:p.pct>=80?T.accent:p.pct>=50?T.amber:T.red,borderRadius:20,transition:"width 0.8s"}}/>
          </div>
          <div style={{fontSize:10,color:T.muted,marginTop:3}}>{Math.round(p.pct)}%</div>
        </div>
      )}
    </div>
  );
}

function SectionReunions(p){
  var reunions=p.reunions||[];
  var aujourd_hui=new Date();
  var prochaines=reunions.filter(function(r){return new Date(r.date_reunion)>=aujourd_hui;}).slice(0,3);
  var passees=reunions.filter(function(r){return new Date(r.date_reunion)<aujourd_hui;}).slice(0,2);
  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:16}}>
      <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>Reunions CA</div>
      {prochaines.length===0&&<div style={{fontSize:11,color:T.muted,padding:"10px 0"}}>Aucune reunion planifiee prochainement</div>}
      {prochaines.map(function(r){
        var d=new Date(r.date_reunion);
        var jours=Math.round((d-aujourd_hui)/(1000*60*60*24));
        return(
          <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid "+T.border}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.navy}}>{r.type||"CA"} - {d.toLocaleDateString("fr-CA",{weekday:"short",day:"numeric",month:"short"})}</div>
              <div style={{fontSize:10,color:T.muted}}>{r.heure||"19:00"}{r.lieu?" - "+r.lieu:""}</div>
            </div>
            <span style={{fontSize:11,fontWeight:700,color:jours<=7?T.amber:T.accent,background:jours<=7?T.amberL:T.accentL,borderRadius:20,padding:"2px 10px"}}>{jours===0?"Aujourd hui":jours===1?"Demain":"Dans "+jours+"j"}</span>
          </div>
        );
      })}
      {passees.length>0&&passees.map(function(r){
        var d=new Date(r.date_reunion);
        return(
          <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",opacity:0.6}}>
            <div style={{fontSize:11,color:T.muted}}>{r.type||"CA"} - {d.toLocaleDateString("fr-CA")}</div>
            <span style={{fontSize:10,color:T.muted}}>Passee</span>
          </div>
        );
      })}
    </div>
  );
}

function SectionTickets(p){
  var tickets=p.tickets||[];
  var ouverts=tickets.filter(function(t){return t.statut!=="resolu";});
  var urgents=ouverts.filter(function(t){return t.priorite==="haute";});
  var COULEURS={nouveau:{bg:"#EFF6FF",tc:"#1A56DB"},en_cours:{bg:"#FEF3E2",tc:"#B86020"},resolu:{bg:"#D4EDDA",tc:"#155724"}};
  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:T.navy}}>Tickets CRM</div>
        <div style={{display:"flex",gap:8}}>
          <span style={{fontSize:11,color:T.muted}}>{ouverts.length} ouvert(s)</span>
          {urgents.length>0&&<span style={{fontSize:11,fontWeight:700,color:T.red,background:T.redL,borderRadius:20,padding:"1px 8px"}}>{urgents.length} urgent(s)</span>}
        </div>
      </div>
      {ouverts.slice(0,4).map(function(t){
        var c=COULEURS[t.statut]||COULEURS.nouveau;
        return(
          <div key={t.id} style={{padding:"8px 0",borderBottom:"1px solid "+T.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1,marginRight:8}}>
                <div style={{fontSize:11,fontWeight:600,color:T.navy}}>{t.sujet}</div>
                <div style={{fontSize:10,color:T.muted}}>Unite {t.unite||"-"}{t.created_at?" - "+t.created_at.substring(0,10):""}</div>
              </div>
              <span style={{background:c.bg,color:c.tc,borderRadius:20,padding:"1px 8px",fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>{t.statut}</span>
            </div>
          </div>
        );
      })}
      {ouverts.length===0&&<div style={{fontSize:11,color:T.muted,padding:"10px 0"}}>Aucun ticket ouvert</div>}
    </div>
  );
}

function SectionAlertes(p){
  var copros=p.copros||[];
  var aujourd_hui=new Date();
  var alertes=[];
  copros.forEach(function(c){
    if(c.ce_expiry){var d=new Date(c.ce_expiry);var j=Math.round((d-aujourd_hui)/(1000*60*60*24));if(j<90)alertes.push({id:"ce"+c.id,unite:c.unite,nom:c.nom,type:"Certificat eau",jours:j,couleur:j<30?"red":"amber"});}
    if(c.ass_expiry){var dA=new Date(c.ass_expiry);var jA=Math.round((dA-aujourd_hui)/(1000*60*60*24));if(jA<90)alertes.push({id:"ass"+c.id,unite:c.unite,nom:c.nom,type:"Assurance",jours:jA,couleur:jA<30?"red":"amber"});}
    if(c.pap&&c.pap_date_exp){var dP=new Date(c.pap_date_exp);var jP=Math.round((dP-aujourd_hui)/(1000*60*60*24));if(jP<60)alertes.push({id:"pap"+c.id,unite:c.unite,nom:c.nom,type:"PAP",jours:jP,couleur:jP<30?"red":"amber"});}
  });
  alertes.sort(function(a,b){return a.jours-b.jours;});
  return(
    <div style={{background:alertes.filter(function(a){return a.couleur==="red";}).length>0?T.redL:T.surface,border:"1px solid "+(alertes.filter(function(a){return a.couleur==="red";}).length>0?T.red+"44":T.border),borderRadius:14,padding:16}}>
      <div style={{fontSize:12,fontWeight:700,color:alertes.length>0?T.red:T.navy,marginBottom:12}}>
        Alertes expirations {alertes.length>0?"("+alertes.length+")":""}
      </div>
      {alertes.slice(0,4).map(function(a){return(
        <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #0001"}}>
          <div>
            <div style={{fontSize:11,fontWeight:600}}>{a.type} - Unite {a.unite}</div>
            <div style={{fontSize:10,color:T.muted}}>{a.nom}</div>
          </div>
          <span style={{fontSize:11,fontWeight:700,color:a.couleur==="red"?T.red:T.amber}}>{a.jours<0?"Expire":a.jours+"j"}</span>
        </div>
      );})}
      {alertes.length===0&&<div style={{fontSize:11,color:T.accent,padding:"10px 0"}}>Tout est a jour!</div>}
    </div>
  );
}

export default function TableauBordCA(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var copros=s2[0];var setCopros=s2[1];
  var s3=useState([]);var paiements=s3[0];var setPaiements=s3[1];
  var s4=useState([]);var reunions=s4[0];var setReunions=s4[1];
  var s5=useState([]);var tickets=s5[0];var setTickets=s5[1];
  var s6=useState([]);var budget=s6[0];var setBudget=s6[1];
  var s7=useState(false);var loading=s7[0];var setLoading=s7[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setLoading(true);
    var promises=[
      sb.select("coproprietaires",{eq:{syndicat_id:sel.id},order:"unite.asc"}),
      sb.select("paiements",{eq:{syndicat_id:sel.id},order:"date_paiement.desc",limit:200}),
      sb.select("reunions",{eq:{syndicat_id:sel.id},order:"date_reunion.asc",limit:10}),
      sb.select("tickets",{eq:{syndicat_id:sel.id},order:"created_at.desc",limit:20}),
      sb.select("budgets",{eq:{syndicat_id:sel.id},order:"annee_debut.desc",limit:1}),
    ];
    Promise.all(promises).then(function(results){
      if(results[0]&&results[0].data)setCopros(results[0].data);
      if(results[1]&&results[1].data)setPaiements(results[1].data);
      if(results[2]&&results[2].data)setReunions(results[2].data);
      if(results[3]&&results[3].data)setTickets(results[3].data);
      if(results[4]&&results[4].data)setBudget(results[4].data);
      setLoading(false);
    }).catch(function(){setLoading(false);});
  },[sel]);

  var aujourd_hui=new Date();
  var moisCourant=aujourd_hui.toISOString().substring(0,7);
  var paiesMois=paiements.filter(function(p){return p.date_paiement&&p.date_paiement.substring(0,7)===moisCourant;});
  var payes=paiesMois.filter(function(p){return p.statut==="paye";});
  var enAttente=paiesMois.filter(function(p){return p.statut==="en_attente";});
  var totalMois=paiesMois.reduce(function(a,p){return a+Number(p.montant);},0);
  var totalPaye=payes.reduce(function(a,p){return a+Number(p.montant);},0);
  var tauxPerception=totalMois>0?Math.round(totalPaye/totalMois*100):0;
  var coprosActifs=copros.filter(function(c){return c.statut==="actif";});
  var papInscrits=copros.filter(function(c){return c.pap;});
  var ticketsOuverts=tickets.filter(function(t){return t.statut!=="resolu";});
  var prochaine=reunions.filter(function(r){return new Date(r.date_reunion)>=aujourd_hui;})[0];

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Tableau de bord - Portail CA</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{marginLeft:"auto",fontSize:11,color:"#8da0bb"}}>{aujourd_hui.toLocaleDateString("fr-CA",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      </div>

      {loading&&<div style={{textAlign:"center",padding:40,color:T.muted,fontSize:12}}>Chargement des donnees...</div>}

      {!loading&&sel&&(
        <div style={{padding:20}}>
          <div style={{fontSize:16,fontWeight:800,color:T.navy,marginBottom:4}}>{sel.nom}</div>
          <div style={{fontSize:11,color:T.muted,marginBottom:20}}>{sel.adr||""}{sel.ville?", "+sel.ville:""} - {coprosActifs.length} unites actives</div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            <KPI titre="Taux de perception" valeur={tauxPerception+"%"} sous={payes.length+" / "+paiesMois.length+" paiements"} pct={tauxPerception} couleur={tauxPerception>=80?T.accent:tauxPerception>=50?T.amber:T.red} bg={tauxPerception>=80?T.accentL:tauxPerception>=50?T.amberL:T.redL} bc={tauxPerception>=80?T.accent+"44":tauxPerception>=50?T.amber+"44":T.red+"44"}/>
            <KPI titre="Recus ce mois" valeur={totalPaye.toFixed(0)+" $"} sous={"En attente: "+enAttente.reduce(function(a,p){return a+Number(p.montant);},0).toFixed(0)+" $"} couleur={T.accent}/>
            <KPI titre="Inscrits PAP" valeur={papInscrits.length+" / "+coprosActifs.length} sous="Prelevement automatique" couleur={T.blue} pct={coprosActifs.length>0?Math.round(papInscrits.length/coprosActifs.length*100):0}/>
            <KPI titre="Tickets ouverts" valeur={ticketsOuverts.length} sous={ticketsOuverts.filter(function(t){return t.priorite==="haute";}).length+" urgent(s)"} couleur={ticketsOuverts.length>0?T.amber:T.accent} bg={ticketsOuverts.length>3?T.amberL:T.surface}/>
          </div>

          {prochaine&&(
            <div style={{background:"linear-gradient(135deg,"+T.navy+",#1A3A5C)",borderRadius:14,padding:16,marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:11,color:"#8da0bb",marginBottom:4}}>Prochaine reunion</div>
                <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{prochaine.type||"CA"} - {new Date(prochaine.date_reunion).toLocaleDateString("fr-CA",{weekday:"long",day:"numeric",month:"long"})}</div>
                <div style={{fontSize:12,color:"#8da0bb"}}>{prochaine.heure||"19:00"}{prochaine.lieu?" - "+prochaine.lieu:""}</div>
              </div>
              <div style={{background:"#3CAF6E",borderRadius:10,padding:"10px 20px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:900,color:"#fff"}}>{Math.max(0,Math.round((new Date(prochaine.date_reunion)-aujourd_hui)/(1000*60*60*24)))}j</div>
                <div style={{fontSize:10,color:"#fff",opacity:0.8}}>restants</div>
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <SectionReunions reunions={reunions}/>
            <SectionTickets tickets={tickets}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <SectionAlertes copros={copros}/>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:16}}>
              <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>Resume coproprietaires</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{background:T.accentL,borderRadius:10,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:T.accent}}>{coprosActifs.length}</div>
                  <div style={{fontSize:10,color:T.muted}}>Unites actives</div>
                </div>
                <div style={{background:T.blueL,borderRadius:10,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:T.blue}}>{papInscrits.length}</div>
                  <div style={{fontSize:10,color:T.muted}}>PAP actifs</div>
                </div>
                <div style={{background:T.amberL,borderRadius:10,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:T.amber}}>{enAttente.length}</div>
                  <div style={{fontSize:10,color:T.muted}}>En attente</div>
                </div>
                <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:T.navy}}>{copros.filter(function(c){return c.locataire;}).length}</div>
                  <div style={{fontSize:10,color:T.muted}}>Locataires</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading&&syndicats.length===0&&(
        <div style={{textAlign:"center",padding:60,color:T.muted,fontSize:13}}>Aucun syndicat trouve. Creez d abord un syndicat dans le module Predictek.</div>
      )}
    </div>
  );
}
