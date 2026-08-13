// Predictek - FACTURATION CLIENTS
// Predictek facture ses syndicats clients: tarification par syndicat (par unite ou forfait),
// generation des factures mensuelles avec TPS/TVQ, suivi (envoyee, payee, en retard),
// facture imprimable. Reserve aux administrateurs Predictek.
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
var money=function(n){return (Number(n)||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

var TPS=0.05, TVQ=0.09975;
var INFOS_DEFAUT={nom:"Predictek inc.",adresse:"",ville:"",province:"QC",code_postal:"",tel:"",courriel:"",no_tps:"",no_tvq:""};
var STATUTS=[
  {id:"brouillon",l:"BROUILLON",c:"#7C7568",bg:"#EDEBE4"},
  {id:"envoyee",l:"ENVOYEE",c:"#1A56DB",bg:"#EFF6FF"},
  {id:"payee",l:"PAYEE",c:"#1B5E3B",bg:"#E8F2EC"},
  {id:"annulee",l:"ANNULEE",c:"#B83232",bg:"#FDECEA"}
];
function stInfo(st){return STATUTS.find(function(x){return x.id===st;})||STATUTS[0];}
function pad2(n){return (n<10?"0":"")+n;}
var MNOMS={"01":"janvier","02":"fevrier","03":"mars","04":"avril","05":"mai","06":"juin","07":"juillet","08":"aout","09":"septembre","10":"octobre","11":"novembre","12":"decembre"};

function imprimerFacture(infos, f){
  var w=window.open("","_blank","width=900,height=700");
  if(!w)return;
  var moisTxt=(MNOMS[f.periode.substring(5,7)]||"")+" "+f.periode.substring(0,4);
  var h="<table style='width:100%;border:none;margin-bottom:24px'><tr>";
  h+="<td style='border:none;vertical-align:top'><h1>"+(infos.nom||"Predictek inc.")+"</h1><div class='muted'>"+(infos.adresse||"")+(infos.ville?"<br/>"+infos.ville+", "+(infos.province||"QC")+" "+(infos.code_postal||""):"")+(infos.tel?"<br/>"+infos.tel:"")+(infos.courriel?"<br/>"+infos.courriel:"")+"</div></td>";
  h+="<td style='border:none;vertical-align:top;text-align:right'><div style='font-size:22px;font-weight:bold;color:#13233A'>FACTURE</div><div class='muted'>No: <b>"+(f.no_facture||"")+"</b><br/>Date: "+(f.date_facture||"")+"<br/>Echeance: "+(f.date_echeance||"")+"</div></td></tr></table>";
  h+="<div style='background:#EDEBE4;border-radius:8px;padding:12px;margin-bottom:20px'><div class='muted'>FACTURE A</div><div style='font-size:14px;font-weight:bold'>"+(f.client_nom||"")+"</div></div>";
  h+="<table><tr><th>Description</th><th class='right'>Quantite</th><th class='right'>Tarif</th><th class='right'>Montant</th></tr>";
  h+="<tr><td>"+(f.description||("Services de gestion de copropriete - "+moisTxt))+"</td><td class='right'>"+(f.nb_unites||1)+"</td><td class='right'>"+money(f.tarif)+"</td><td class='right'>"+money(f.sous_total)+"</td></tr>";
  h+="<tr><td colspan='3' class='right'>Sous-total</td><td class='right'>"+money(f.sous_total)+"</td></tr>";
  h+="<tr><td colspan='3' class='right'>TPS (5 %)"+(infos.no_tps?" - "+infos.no_tps:"")+"</td><td class='right'>"+money(f.tps)+"</td></tr>";
  h+="<tr><td colspan='3' class='right'>TVQ (9,975 %)"+(infos.no_tvq?" - "+infos.no_tvq:"")+"</td><td class='right'>"+money(f.tvq)+"</td></tr>";
  h+="<tr class='tot'><td colspan='3' class='right'>TOTAL</td><td class='right'>"+money(f.total)+"</td></tr></table>";
  h+="<div class='muted' style='margin-top:24px'>Paiement du au plus tard le "+(f.date_echeance||"")+". Merci de votre confiance.</div>";
  w.document.write("<html><head><title>Facture "+(f.no_facture||"")+"</title><style>body{font-family:Georgia,serif;color:#1C1A17;margin:40px;font-size:13px}h1{font-size:20px;margin:0 0 4px;color:#1B5E3B}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #999;padding:7px 10px;font-size:12px;text-align:left}th{background:#EDEBE4}.tot{font-weight:bold;background:#E8F2EC;font-size:14px}.muted{color:#666;font-size:11px}.right{text-align:right}</style></head><body>"+h+"<script>window.print();</script></body></html>");
  w.document.close();
}

export default function Facturation(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState([]);var tarifs=s1[0];var setTarifs=s1[1];
  var s2=useState([]);var factures=s2[0];var setFactures=s2[1];
  var s3=useState([]);var unites=s3[0];var setUnites=s3[1];
  var s4=useState("factures");var ong=s4[0];var setOng=s4[1];
  var s5=useState(INFOS_DEFAUT);var infos=s5[0];var setInfos=s5[1];
  var s6=useState(new Date().toISOString().substring(0,7));var periode=s6[0];var setPeriode=s6[1];
  var s7=useState("");var msg=s7[0];var setMsg=s7[1];
  var s8=useState("");var err=s8[0];var setErr=s8[1];
  var s9=useState(false);var enCours=s9[0];var setEnCours=s9[1];

  function charger(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(r){if(r&&r.data)setSyndicats(r.data);}).catch(function(){});
    sb.select("facturation_tarifs",{limit:500}).then(function(r){
      if(r&&r.data)setTarifs(r.data);
      if(r&&r.error)setErr("Tarifs inaccessibles: "+(r.error.message||"la table facturation_tarifs existe-t-elle? (SQL fourni)"));
    }).catch(function(){});
    sb.select("factures_clients",{order:"created_at.desc",limit:1000}).then(function(r){
      if(r&&r.data)setFactures(r.data);
    }).catch(function(){});
    sb.select("unites",{limit:5000}).then(function(r){if(r&&r.data)setUnites(r.data);}).catch(function(){});
    sb.selectOne("config_publique",{eq:{cle:"facturation_infos"}}).then(function(r){
      if(r&&r.data&&r.data.valeur){try{setInfos(Object.assign({},INFOS_DEFAUT,JSON.parse(r.data.valeur)));}catch(e){}}
    }).catch(function(){});
  }
  useEffect(function(){charger();},[]);

  function nbUnites(sid){
    var s=syndicats.find(function(x){return x.id===sid;});
    var n=unites.filter(function(u){return u.syndicat_id===sid;}).length;
    return n>0?n:((s&&parseInt(s.nb_unites))||0);
  }
  function tarifDe(sid){return tarifs.find(function(t){return t.syndicat_id===sid;})||null;}
  function montantMensuel(tf,sid){
    if(!tf)return 0;
    return tf.mode==="forfait"?(parseFloat(tf.forfait)||0):(parseFloat(tf.tarif_unite)||0)*nbUnites(sid);
  }

  // ----- Tarification -----
  function majTarif(sid,changes){
    var existant=tarifDe(sid);
    var row=Object.assign({syndicat_id:sid,mode:"par_unite",tarif_unite:0,forfait:0,actif:true},existant||{},changes);
    delete row.id;delete row.created_at;
    sb.upsert("facturation_tarifs",[row],"syndicat_id").then(function(r){
      if(r&&r.error){setErr("ECHEC de la sauvegarde du tarif: "+(r.error.message||""));return;}
      setErr("");
      sb.select("facturation_tarifs",{limit:500}).then(function(r2){if(r2&&r2.data)setTarifs(r2.data);});
    }).catch(function(e){setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  function sauverInfos(){
    sb.upsert("config_publique",[{cle:"facturation_infos",valeur:JSON.stringify(infos)}],"cle").then(function(r){
      if(r&&r.error){setErr("ECHEC de la sauvegarde des informations: "+(r.error.message||""));return;}
      setMsg("Informations d entreprise sauvegardees.");
      sb.log("facturation","modification","Infos de facturation Predictek mises a jour","","");
      setTimeout(function(){setMsg("");},4000);
    });
  }

  // ----- Generation des factures du mois -----
  function genererFactures(){
    if(enCours)return;
    var clients=tarifs.filter(function(t){return t.actif&&montantMensuel(t,t.syndicat_id)>0;});
    if(clients.length===0){setErr("Aucun client avec un tarif actif - configurez la tarification d abord.");return;}
    var dejaFaites=factures.filter(function(f){return f.periode===periode&&f.statut!=="annulee";}).map(function(f){return f.syndicat_id;});
    var aFaire=clients.filter(function(t){return dejaFaites.indexOf(t.syndicat_id)<0;});
    if(aFaire.length===0){setErr("Toutes les factures de "+periode+" sont deja generees ("+dejaFaites.length+" client(s)).");return;}
    setEnCours(true);setErr("");setMsg("");
    var annee=periode.substring(0,4);
    var noBase=factures.filter(function(f){return (f.no_facture||"").indexOf("PRED-"+annee)===0;}).length;
    var auj=new Date();
    var dateFact=auj.toISOString().substring(0,10);
    var ech=new Date(auj.getTime()+30*86400000).toISOString().substring(0,10);
    var moisTxt=(MNOMS[periode.substring(5,7)]||"")+" "+annee;
    var seq=Promise.resolve();var crees=0;var echecs=[];
    aFaire.forEach(function(t,ix){
      seq=seq.then(function(){
        var s=syndicats.find(function(x){return x.id===t.syndicat_id;});
        var nbU=nbUnites(t.syndicat_id);
        var tarif=t.mode==="forfait"?(parseFloat(t.forfait)||0):(parseFloat(t.tarif_unite)||0);
        var sousTotal=Math.round(montantMensuel(t,t.syndicat_id)*100)/100;
        var tps=Math.round(sousTotal*TPS*100)/100;
        var tvq=Math.round(sousTotal*TVQ*100)/100;
        var row={
          syndicat_id:t.syndicat_id,client_nom:(s&&s.nom)||"Client",
          no_facture:"PRED-"+annee+"-"+pad2(0)+String(noBase+crees+echecs.length+1).padStart(2,"0"),
          periode:periode,date_facture:dateFact,date_echeance:ech,
          description:"Services de gestion de copropriete - "+moisTxt+(t.mode==="forfait"?" (forfait mensuel)":" ("+nbU+" unites x "+money(tarif)+")"),
          nb_unites:t.mode==="forfait"?1:nbU,tarif:tarif,
          sous_total:sousTotal,tps:tps,tvq:tvq,total:Math.round((sousTotal+tps+tvq)*100)/100,
          statut:"brouillon"
        };
        row.no_facture="PRED-"+annee+"-"+String(noBase+crees+echecs.length+1).padStart(3,"0");
        return sb.insert("factures_clients",row).then(function(r){
          if(r&&r.data&&r.data.id)crees++;
          else echecs.push((s&&s.nom)||"?");
        });
      });
    });
    seq.then(function(){
      setEnCours(false);
      if(crees>0){
        setMsg(crees+" facture(s) generee(s) pour "+moisTxt+"."+(echecs.length>0?" ECHECS: "+echecs.join(", "):""));
        sb.log("facturation","creation",crees+" facture(s) clients generee(s) pour "+periode,"","");
      }else{
        setErr("Aucune facture creee."+(echecs.length>0?" ECHECS: "+echecs.join(", "):""));
      }
      charger();
      setTimeout(function(){setMsg("");},6000);
    }).catch(function(e){setEnCours(false);setErr("Erreur: "+(e&&e.message?e.message:""));});
  }

  function changerStatutFacture(f,st){
    var ch={statut:st};
    if(st==="payee")ch.date_paiement=new Date().toISOString().substring(0,10);
    sb.update("factures_clients",f.id,ch).then(function(r){
      if(r&&r.error){setErr("Echec: "+(r.error.message||""));return;}
      sb.log("facturation","modification","Facture "+f.no_facture+" ("+f.client_nom+"): "+f.statut+" -> "+st,"","");
      charger();
    });
  }

  // ----- Stats -----
  var auj=new Date().toISOString().substring(0,10);
  var actives=factures.filter(function(f){return f.statut!=="annulee";});
  var aRecevoir=actives.filter(function(f){return f.statut==="envoyee"||f.statut==="brouillon";}).reduce(function(a,f){return a+(Number(f.total)||0);},0);
  var enRetard=actives.filter(function(f){return f.statut==="envoyee"&&f.date_echeance&&f.date_echeance<auj;});
  var mrr=tarifs.filter(function(t){return t.actif;}).reduce(function(a,t){return a+montantMensuel(t,t.syndicat_id);},0);
  var encaisse=actives.filter(function(f){return f.statut==="payee";}).reduce(function(a,f){return a+(Number(f.total)||0);},0);

  var TABS=[{id:"factures",l:"Factures"},{id:"tarifs",l:"Tarification"},{id:"entreprise",l:"Infos entreprise"}];

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Facturation clients</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Predictek facture ses syndicats clients - TPS/TVQ - suivi des paiements</div>
        </div>
        <div style={{display:"flex",marginLeft:"auto"}}>
          {TABS.map(function(t){var a=ong===t.id;return <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"3px solid #3CAF6E":"3px solid transparent",padding:"8px 16px",color:a?"#fff":"#9fb0c6",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:500}}>{t.l}</button>;})}
        </div>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
          <div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.accent,fontWeight:700}}>REVENU MENSUEL (tarifs actifs)</div><div style={{fontSize:18,fontWeight:800,color:T.accent}}>{money(mrr)}</div><div style={{fontSize:10,color:T.muted}}>{money(mrr*12)} /an</div></div>
          <div style={{background:T.blueL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>A recevoir</div><div style={{fontSize:18,fontWeight:800,color:T.blue}}>{money(aRecevoir)}</div></div>
          <div style={{background:T.redL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>En retard (echeance depassee)</div><div style={{fontSize:18,fontWeight:800,color:T.red}}>{enRetard.length} facture(s)</div></div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Encaisse (total)</div><div style={{fontSize:18,fontWeight:800,color:T.navy}}>{money(encaisse)}</div></div>
        </div>

        {ong==="tarifs"&&(
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>Tarification par syndicat client</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:14}}>Par unite: tarif x nombre d unites du syndicat. Forfait: montant fixe par mois. Les changements se sauvegardent immediatement.</div>
            {syndicats.length===0&&<div style={{background:T.amberL,borderRadius:10,padding:14,fontSize:12,color:T.amber,fontWeight:600}}>Aucun syndicat client - creez d abord un syndicat via Configuration.</div>}
            {syndicats.map(function(s){
              var tf=tarifDe(s.id);
              var nbU=nbUnites(s.id);
              var mensuel=montantMensuel(tf,s.id);
              var actif=tf?tf.actif:false;
              return(
                <div key={s.id} style={{background:T.surface,border:"1px solid "+(actif?T.accent+"55":T.border),borderRadius:10,padding:14,marginBottom:10,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:180}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{s.nom}</div>
                    <div style={{fontSize:11,color:T.muted}}>{nbU} unite(s)</div>
                  </div>
                  <div style={{width:150}}>
                    <Lbl l="Mode"/>
                    <select value={tf?tf.mode:"par_unite"} onChange={function(e){majTarif(s.id,{mode:e.target.value});}} style={INP}>
                      <option value="par_unite">Par unite</option>
                      <option value="forfait">Forfait mensuel</option>
                    </select>
                  </div>
                  {(!tf||tf.mode!=="forfait")?(
                    <div style={{width:140}}><Lbl l="$ / unite / mois"/><input type="number" step="0.01" defaultValue={tf?tf.tarif_unite:""} onBlur={function(e){majTarif(s.id,{tarif_unite:parseFloat(e.target.value)||0});}} style={INP} placeholder="ex: 15.00"/></div>
                  ):(
                    <div style={{width:140}}><Lbl l="Forfait $ / mois"/><input type="number" step="0.01" defaultValue={tf?tf.forfait:""} onBlur={function(e){majTarif(s.id,{forfait:parseFloat(e.target.value)||0});}} style={INP} placeholder="ex: 500.00"/></div>
                  )}
                  <div style={{width:130,textAlign:"right"}}>
                    <div style={{fontSize:10,color:T.muted}}>Mensuel (avant taxes)</div>
                    <div style={{fontSize:16,fontWeight:800,color:mensuel>0?T.accent:T.muted}}>{money(mensuel)}</div>
                  </div>
                  <button onClick={function(){majTarif(s.id,{actif:!actif});}} style={{background:actif?T.accentL:T.alt,border:"2px solid "+(actif?T.accent:T.border),borderRadius:20,padding:"6px 16px",fontSize:11,fontWeight:800,color:actif?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit"}}>{actif?"CLIENT ACTIF":"Inactif"}</button>
                </div>
              );
            })}
          </div>
        )}

        {ong==="entreprise"&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20,maxWidth:640}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>Informations de Predictek (en-tete des factures)</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:14}}>Ces informations apparaissent sur toutes les factures emises aux clients, avec vos numeros de taxes.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Nom legal"/><input value={infos.nom||""} onChange={function(e){setInfos(Object.assign({},infos,{nom:e.target.value}));}} style={INP}/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Adresse"/><input value={infos.adresse||""} onChange={function(e){setInfos(Object.assign({},infos,{adresse:e.target.value}));}} style={INP}/></div>
              <div><Lbl l="Ville"/><input value={infos.ville||""} onChange={function(e){setInfos(Object.assign({},infos,{ville:e.target.value}));}} style={INP}/></div>
              <div><Lbl l="Code postal"/><input value={infos.code_postal||""} onChange={function(e){setInfos(Object.assign({},infos,{code_postal:e.target.value}));}} style={INP}/></div>
              <div><Lbl l="Telephone"/><input value={infos.tel||""} onChange={function(e){setInfos(Object.assign({},infos,{tel:e.target.value}));}} style={INP}/></div>
              <div><Lbl l="Courriel"/><input value={infos.courriel||""} onChange={function(e){setInfos(Object.assign({},infos,{courriel:e.target.value}));}} style={INP}/></div>
              <div><Lbl l="No TPS"/><input value={infos.no_tps||""} onChange={function(e){setInfos(Object.assign({},infos,{no_tps:e.target.value}));}} style={INP} placeholder="123456789 RT0001"/></div>
              <div><Lbl l="No TVQ"/><input value={infos.no_tvq||""} onChange={function(e){setInfos(Object.assign({},infos,{no_tvq:e.target.value}));}} style={INP} placeholder="1234567890 TQ0001"/></div>
            </div>
            <Btn onClick={sauverInfos}>Sauvegarder</Btn>
          </div>
        )}

        {ong==="factures"&&(
          <div>
            <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap",marginBottom:14}}>
              <div style={{width:180}}>
                <Lbl l="Periode a facturer"/>
                <input type="month" value={periode} onChange={function(e){setPeriode(e.target.value);}} style={INP}/>
              </div>
              <Btn onClick={genererFactures} dis={enCours}>{enCours?"Generation...":"Generer les factures du mois"}</Btn>
              <div style={{fontSize:11,color:T.muted}}>Une facture par client actif - les clients deja factures pour la periode sont ignores.</div>
            </div>

            {factures.length===0&&(
              <div style={{background:T.surface,border:"1px dashed "+T.border,borderRadius:12,padding:30,textAlign:"center",color:T.muted,fontSize:13}}>
                Aucune facture emise.<br/>
                <span style={{fontSize:11}}>Configurez la tarification de vos clients (onglet Tarification), puis generez les factures du mois.</span>
              </div>
            )}

            {factures.map(function(f){
              var st=stInfo(f.statut);
              var retard=f.statut==="envoyee"&&f.date_echeance&&f.date_echeance<auj;
              return(
                <div key={f.id} style={{background:T.surface,border:"1px solid "+T.border,borderLeft:"4px solid "+(retard?T.red:st.c),borderRadius:10,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <span style={{background:retard?T.redL:st.bg,color:retard?T.red:st.c,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:800,flexShrink:0}}>{retard?"EN RETARD":st.l}</span>
                  <div style={{flex:1,minWidth:220}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{f.no_facture} - {f.client_nom}</div>
                    <div style={{fontSize:11,color:T.muted}}>{f.description}</div>
                    <div style={{fontSize:10,color:T.muted}}>Emise le {f.date_facture} - echeance {f.date_echeance}{f.date_paiement?" - PAYEE le "+f.date_paiement:""}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:15,fontWeight:800,color:T.navy}}>{money(f.total)}</div>
                    <div style={{fontSize:10,color:T.muted}}>dont taxes {money((Number(f.tps)||0)+(Number(f.tvq)||0))}</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>
                    <Btn sm bg={T.alt} tc={T.navy} bdr={"1px solid "+T.border} onClick={function(){imprimerFacture(infos,f);}}>Imprimer</Btn>
                    {f.statut==="brouillon"&&<Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={function(){changerStatutFacture(f,"envoyee");}}>Marquer envoyee</Btn>}
                    {(f.statut==="envoyee"||f.statut==="brouillon")&&<Btn sm bg={T.accentL} tc={T.accent} bdr={"1px solid "+T.accent+"44"} onClick={function(){changerStatutFacture(f,"payee");}}>Marquer payee</Btn>}
                    {f.statut!=="annulee"&&f.statut!=="payee"&&<Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){changerStatutFacture(f,"annulee");}}>Annuler</Btn>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
