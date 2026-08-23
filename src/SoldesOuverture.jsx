// SOLDES D OUVERTURE (Configuration)
// FEUILLE DE TRAVAIL: tous les comptes du BILAN (actifs, passifs, fonds) sont proposes
// directement - on inscrit les montants, pas besoin de choisir les comptes un a un.
// - Comptes de BANQUE: soldes saisis ici (les comptes se CREENT d abord dans Comptes bancaires)
// - Comptes a RECEVOIR: le montant s explose PAR UNITE (quelle unite doit quoi)
// - Comptes a PAYER (fournisseurs): le montant s explose PAR FOURNISSEUR (un ou plusieurs)
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
var money=function(n){return (Number(n)||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

var FONDS_NOMS={operation:"Fonds d operation",prevoyance:"Fonds de prevoyance",assurance:"Fonds d auto-assurance",special:"Fonds de travaux speciaux"};

// Type de detail requis pour un compte
function detailPour(compte){
  if(!compte)return "";
  var t=((compte.nom_compte||"")+" "+(compte.groupe||"")).toLowerCase();
  var no=String(compte.no_compte||"");
  if(/recevoir|arrerage/.test(t)||no.indexOf("12")===0)return "unite";
  if(/fournisseur/.test(t)||no==="2210")return "fournisseur";
  if(/payes d avance|paye d avance|prepaye/.test(t)||no.indexOf("13")===0)return "fournisseur";
  return "";
}
function sensDefaut(compte){
  var ty=(compte&&compte.type_compte||"").toLowerCase();
  if(ty==="passif"||ty==="revenu"||ty==="capitaux"||ty==="fonds")return "credit";
  return "debit";
}
function estBilan(c){
  var ty=(c.type_compte||"").toLowerCase();
  return ty==="actif"||ty==="passif"||ty==="capitaux";
}

export default function SoldesOuverture(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var comptes=s2[0];var setComptes=s2[1];
  var s3=useState([]);var unites=s3[0];var setUnites=s3[1];
  var s4=useState([]);var fournisseurs=s4[0];var setFournisseurs=s4[1];
  var s5=useState([]);var lignes=s5[0];var setLignes=s5[1];
  var s6=useState([]);var banques=s6[0];var setBanques=s6[1];
  var s7=useState("");var msg=s7[0];var setMsg=s7[1];
  var s8=useState("");var err=s8[0];var setErr=s8[1];
  var s9=useState({});var valeurs=s9[0];var setValeurs=s9[1];       // no_compte -> montant (comptes simples)
  var s10=useState({});var details=s10[0];var setDetails=s10[1];    // no_compte -> [{cle,montant}] (unite ou fournisseur)
  var s11=useState({});var soldesBq=s11[0];var setSoldesBq=s11[1];  // compte bancaire id -> montant
  var s12=useState("");var dateSoldes=s12[0];var setDateSoldes=s12[1];
  var s13=useState(false);var saving=s13[0];var setSaving=s13[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
    sb.select("fournisseurs",{order:"nom.asc",limit:1000}).then(function(r){if(r&&r.data)setFournisseurs(r.data);}).catch(function(){});
  },[]);

  function charger(){
    if(!sel)return;
    sb.select("comptes_syndicat",{eq:{syndicat_id:sel.id},order:"no_compte.asc",limit:500}).then(function(r){if(r&&r.data)setComptes(r.data.filter(function(c){return c.actif!==false;}));}).catch(function(){});
    sb.select("unites",{eq:{syndicat_id:sel.id},order:"no_unite.asc",limit:1000}).then(function(r){if(r&&r.data)setUnites(r.data);}).catch(function(){});
    sb.select("comptes_bancaires",{eq:{syndicat_id:sel.id},limit:50}).then(function(r){
      var bq=(r&&r.data)?r.data.filter(function(b){return b.actif!==false;}):[];
      setBanques(bq);
      var sb2={};var dMax="";
      bq.forEach(function(b){sb2[b.id]=b.solde_ouverture!==null&&b.solde_ouverture!==undefined&&Number(b.solde_ouverture)!==0?String(b.solde_ouverture):"";if(b.date_solde&&String(b.date_solde)>dMax)dMax=String(b.date_solde).substring(0,10);});
      setSoldesBq(sb2);
      if(dMax)setDateSoldes(function(p){return p||dMax;});
    }).catch(function(){setBanques([]);});
    sb.select("soldes_ouverture",{eq:{syndicat_id:sel.id},limit:1000}).then(function(r){
      var rows=(r&&r.data)?r.data.filter(function(x){return x.statut!=="retire";}):[];
      setLignes(rows);
      // Prefill de la feuille de travail depuis l existant
      var v={};var d={};var dSo="";var dCr="";
      rows.forEach(function(l){
        if(l.unite||l.fournisseur){
          if(!d[l.no_compte])d[l.no_compte]=[];
          d[l.no_compte].push({cle:l.unite||l.fournisseur,montant:String(l.montant||"")});
        }else{
          v[l.no_compte]=String((parseFloat(v[l.no_compte])||0)+(Number(l.montant)||0));
        }
        if(l.date_solde&&String(l.date_solde).substring(0,10)>dSo)dSo=String(l.date_solde).substring(0,10);
        if(!l.date_solde&&l.created_at&&String(l.created_at).substring(0,10)>dCr)dCr=String(l.created_at).substring(0,10);
      });
      // Ramene TOUJOURS la date sauvegardee des soldes d ouverture au retour dans le module;
      // a defaut (anciens soldes sans date), la date de creation des lignes
      if(dSo)setDateSoldes(dSo);
      else if(dCr)setDateSoldes(function(p){return p||dCr;});
      setValeurs(v);setDetails(d);
      if(r&&r.error)setErr("Chargement impossible: "+(r.error.message||"la table soldes_ouverture existe-t-elle? (SQL fourni)"));
    }).catch(function(){setLignes([]);});
  }
  useEffect(function(){charger();},[sel&&sel.id]);

  function setVal(no,v){setValeurs(function(pr){var n=Object.assign({},pr);n[no]=v;return n;});}
  function majDetail(no,ix,k,v){
    setDetails(function(pr){
      var n=Object.assign({},pr);
      var liste=(n[no]||[]).slice();
      liste[ix]=Object.assign({},liste[ix]);liste[ix][k]=v;
      n[no]=liste;return n;
    });
  }
  function ajouterDetail(no){
    setDetails(function(pr){var n=Object.assign({},pr);n[no]=(n[no]||[]).concat([{cle:"",montant:""}]);return n;});
  }
  function retirerDetail(no,ix){
    setDetails(function(pr){var n=Object.assign({},pr);n[no]=(n[no]||[]).filter(function(_,j){return j!==ix;});return n;});
  }
  function totalDetail(no){
    return Math.round(((details[no]||[]).reduce(function(a,l){return a+(parseFloat(l.montant)||0);},0))*100)/100;
  }
  function montantCompte(c){
    return detailPour(c)?totalDetail(c.no_compte):(parseFloat(valeurs[c.no_compte])||0);
  }

  // Comptes du bilan proposes (l Encaisse est geree par la section Banques ci-dessus)
  var comptesBilan=comptes.filter(function(c){return estBilan(c)&&!/encaisse/i.test(c.nom_compte||"");});
  var groupes=[];
  comptesBilan.forEach(function(c){var g=c.groupe||"Autres";if(groupes.indexOf(g)<0)groupes.push(g);});

  var totBanques=banques.reduce(function(a,b){return a+(parseFloat(soldesBq[b.id])||0);},0);
  var totDebit=comptesBilan.filter(function(c){return sensDefaut(c)==="debit";}).reduce(function(a,c){return a+montantCompte(c);},0);
  var totCredit=comptesBilan.filter(function(c){return sensDefaut(c)==="credit";}).reduce(function(a,c){return a+montantCompte(c);},0);
  var ecart=Math.round(((totBanques+totDebit)-totCredit)*100)/100;

  // ===== SAUVEGARDE: banques + remplacement des lignes soldes_ouverture =====
  async function sauverTout(){
    if(!sel||saving)return;
    if(!dateSoldes){setErr("ECHEC: inscrivez d abord la DATE des soldes d ouverture (case Soldes en date du, dans le bandeau du haut) - aucun enregistrement sans date.");window.scrollTo(0,0);return;}
    // Validation des details
    var invalides=[];
    comptesBilan.forEach(function(c){
      var dp=detailPour(c);
      if(!dp)return;
      (details[c.no_compte]||[]).forEach(function(l){
        if((parseFloat(l.montant)||0)>0&&!l.cle)invalides.push(c.no_compte+" ("+(dp==="unite"?"unite":"fournisseur")+" manquant)");
      });
    });
    if(invalides.length>0){setErr("Lignes incompletes: "+invalides.join(", ")+".");return;}
    setSaving(true);setErr("");setMsg("");
    var echecs=[];
    // 1. Soldes d ouverture des comptes de banque
    for(var i=0;i<banques.length;i++){
      var b=banques[i];
      var v=parseFloat(soldesBq[b.id])||0;
      var rB=await sb.update("comptes_bancaires",b.id,{solde_ouverture:v,date_solde:dateSoldes||null});
      if(rB&&rB.error)echecs.push("banque "+(b.nom||b.fonds)+": "+(rB.error.message||""));
    }
    // 2. Remplacement des lignes existantes
    for(var k=0;k<lignes.length;k++){
      var rR=await sb.update("soldes_ouverture",lignes[k].id,{statut:"retire"});
      if(rR&&rR.error)echecs.push("retrait ligne: "+(rR.error.message||""));
    }
    // 3. Insertion des nouvelles lignes
    var inseres=0;
    for(var m=0;m<comptesBilan.length;m++){
      var c=comptesBilan[m];
      var dp=detailPour(c);
      if(dp){
        var liste=(details[c.no_compte]||[]).filter(function(l){return (parseFloat(l.montant)||0)>0&&l.cle;});
        for(var n2=0;n2<liste.length;n2++){
          var l2=liste[n2];
          var u=dp==="unite"?unites.find(function(x){return x.no_unite===l2.cle;}):null;
          var rI=await sb.insert("soldes_ouverture",{syndicat_id:sel.id,no_compte:c.no_compte,nom_compte:c.nom_compte,
            sens:sensDefaut(c),montant:parseFloat(l2.montant)||0,
            unite_id:u?u.id:null,unite:dp==="unite"?l2.cle:"",fournisseur:dp==="fournisseur"?l2.cle:"",
            date_solde:dateSoldes||null,note:"",statut:"actif"});
          if(rI&&rI.error)echecs.push(c.no_compte+": "+(rI.error.message||""));else inseres++;
        }
      }else{
        var mnt=parseFloat(valeurs[c.no_compte])||0;
        if(mnt>0){
          var rI2=await sb.insert("soldes_ouverture",{syndicat_id:sel.id,no_compte:c.no_compte,nom_compte:c.nom_compte,
            sens:sensDefaut(c),montant:mnt,unite_id:null,unite:"",fournisseur:"",date_solde:dateSoldes||null,note:"",statut:"actif"});
          if(rI2&&rI2.error)echecs.push(c.no_compte+": "+(rI2.error.message||""));else inseres++;
        }
      }
    }
    setSaving(false);
    if(echecs.length>0){setErr("ECHEC sur "+echecs.length+" element(s): "+echecs.slice(0,5).join(" | ")+(echecs.length>5?" ...":""));}
    setMsg("Soldes d ouverture sauvegardes: "+banques.length+" compte(s) de banque + "+inseres+" ligne(s) GL"+(Math.abs(ecart)>0.01?" - ATTENTION: la balance ne balance pas (ecart "+money(ecart)+")":" - balance OK")+".");
    sb.log("comptabilite","modification","Soldes d ouverture sauvegardes ("+inseres+" lignes GL, ecart "+ecart.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,"\u202F").replace(".",",")+" $)","",sel.code||"");
    charger();setTimeout(function(){setMsg("");},10000);
  }

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat.</div>;
  if(!sel)return null;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Soldes d ouverture</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Feuille de travail: banques, comptes a recevoir PAR UNITE, comptes a payer PAR FOURNISSEUR</div>
        </div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
        <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
          <div><div style={{fontSize:9,color:"#9fb0c6",textTransform:"uppercase",fontWeight:700}}>Soldes en date du</div>
            <input type="date" value={dateSoldes} onChange={function(e){setDateSoldes(e.target.value);}} style={{border:"none",borderRadius:6,padding:"5px 8px",fontSize:12,fontFamily:"inherit"}}/>
          </div>
          <Btn onClick={sauverTout} dis={saving}>{saving?"Sauvegarde...":"Sauvegarder les soldes d ouverture"}</Btn>
        </div>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          <div style={{background:T.blueL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Banques</div><div style={{fontSize:16,fontWeight:800,color:T.blue}}>{money(totBanques)}</div></div>
          <div style={{background:T.accentL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Autres DEBITS (actifs, a recevoir...)</div><div style={{fontSize:16,fontWeight:800,color:T.accent}}>{money(totDebit)}</div></div>
          <div style={{background:T.amberL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>CREDITS (passifs, a payer, fonds...)</div><div style={{fontSize:16,fontWeight:800,color:T.amber}}>{money(totCredit)}</div></div>
          <div style={{background:Math.abs(ecart)<0.01?T.accentL:T.redL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Ecart (doit etre 0 pour balancer)</div><div style={{fontSize:16,fontWeight:800,color:Math.abs(ecart)<0.01?T.accent:T.red}}>{money(ecart)}</div></div>
        </div>

        <div style={{background:T.surface,border:"2px solid "+T.blue+"44",borderRadius:12,padding:16,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:800,color:T.blue,marginBottom:2}}>Comptes de banque (Encaisse)</div>
          <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Les comptes se CREENT dans Configuration - Comptes bancaires; leurs soldes d ouverture se saisissent ICI.</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10}}>
            {banques.map(function(b){
              return(
                <div key={b.id} style={{background:T.blueL,borderRadius:10,padding:12}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.navy}}>{b.nom||FONDS_NOMS[b.fonds]||("Fonds "+(b.fonds||""))}</div>
                  <div style={{fontSize:9,color:T.muted,marginBottom:6}}>{FONDS_NOMS[b.fonds]||("Fonds "+(b.fonds||""))}{b.no_compte?" - ***"+String(b.no_compte).slice(-4):""}</div>
                  <input type="number" step="0.01" value={soldesBq[b.id]||""} onChange={function(e){var v=e.target.value;setSoldesBq(function(pr){var n=Object.assign({},pr);n[b.id]=v;return n;});}} style={INP}/>
                </div>
              );
            })}
            {banques.length===0&&<div style={{color:T.muted,fontSize:12,padding:10}}>Aucun compte de banque - creez-les d abord dans Configuration - Comptes bancaires.</div>}
          </div>
        </div>

        {groupes.map(function(g){
          var cs=comptesBilan.filter(function(c){return (c.groupe||"Autres")===g;});
          return(
            <div key={g} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
              <div style={{padding:"8px 14px",background:T.alt,fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase"}}>{g}</div>
              {cs.map(function(c){
                var dp=detailPour(c);
                var liste=details[c.no_compte]||[];
                return(
                  <div key={c.id} style={{borderTop:"1px solid "+T.border,padding:"8px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                      <div style={{flex:1,minWidth:240}}>
                        <span style={{fontSize:12,fontWeight:700,color:T.navy}}>{c.no_compte} - {c.nom_compte}</span>
                        <span style={{fontSize:9,color:sensDefaut(c)==="credit"?T.amber:T.accent,fontWeight:800,marginLeft:8}}>{sensDefaut(c)==="credit"?"CREDIT":"DEBIT"}</span>
                        {dp==="unite"&&<span style={{fontSize:9,color:T.blue,fontWeight:800,marginLeft:8}}>DETAIL PAR UNITE</span>}
                        {dp==="fournisseur"&&<span style={{fontSize:9,color:T.purple,fontWeight:800,marginLeft:8}}>DETAIL PAR FOURNISSEUR</span>}
                      </div>
                      {!dp&&<div style={{width:150}}><input type="number" step="0.01" value={valeurs[c.no_compte]||""} onChange={function(e){setVal(c.no_compte,e.target.value);}} style={Object.assign({},INP,{textAlign:"right",fontWeight:700})}/></div>}
                      {dp&&(
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{fontSize:13,fontWeight:800,color:T.navy}}>{money(totalDetail(c.no_compte))}</div>
                          <Btn sm bg={dp==="unite"?T.blueL:T.purpleL} tc={dp==="unite"?T.blue:T.purple} bdr={"1px solid "+(dp==="unite"?T.blue:T.purple)+"44"} onClick={function(){ajouterDetail(c.no_compte);}}>+ {dp==="unite"?"Unite":"Fournisseur"}</Btn>
                        </div>
                      )}
                    </div>
                    {dp&&liste.length>0&&(
                      <div style={{marginTop:8,paddingLeft:14,borderLeft:"3px solid "+(dp==="unite"?T.blue:T.purple)+"44"}}>
                        {liste.map(function(l,ix){
                          return(
                            <div key={ix} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                              <div style={{width:220}}>
                                {dp==="unite"?(
                                  <select value={l.cle} onChange={function(e){majDetail(c.no_compte,ix,"cle",e.target.value);}} style={INP}>
                                    <option value="">Choisir l unite...</option>
                                    {unites.map(function(u){return <option key={u.id} value={u.no_unite}>Unite {u.no_unite}</option>;})}
                                  </select>
                                ):(
                                  <select value={l.cle} onChange={function(e){majDetail(c.no_compte,ix,"cle",e.target.value);}} style={INP}>
                                    <option value="">Choisir le fournisseur...</option>
                                    {fournisseurs.map(function(f){return <option key={f.id} value={f.nom}>{f.nom}</option>;})}
                                  </select>
                                )}
                              </div>
                              <div style={{width:140}}><input type="number" step="0.01" value={l.montant} onChange={function(e){majDetail(c.no_compte,ix,"montant",e.target.value);}} style={Object.assign({},INP,{textAlign:"right"})}/></div>
                              <span style={{color:T.red,cursor:"pointer",fontWeight:800,fontSize:14}} onClick={function(){retirerDetail(c.no_compte,ix);}}>x</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {comptesBilan.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucun compte de bilan dans la charte de ce syndicat.</div>}

        <div style={{display:"flex",gap:8,marginTop:8}}>
          <Btn onClick={sauverTout} dis={saving}>{saving?"Sauvegarde...":"Sauvegarder les soldes d ouverture"}</Btn>
        </div>
        <div style={{fontSize:10,color:T.muted,marginTop:8}}>Seuls les comptes avec un montant sont enregistres. La sauvegarde REMPLACE les soldes d ouverture precedents du syndicat.</div>
      </div>
    </div>
  );
}
