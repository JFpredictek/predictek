// SOLDES D OUVERTURE (Finances - Comptabilite)
// Saisie des soldes de depart de TOUS les comptes GL du syndicat, pas seulement les banques:
// - Comptes a RECEVOIR detailles PAR UNITE (sommes dues par les coproprietaires)
// - Comptes a PAYER detailles PAR FOURNISSEUR
// - Tout autre compte GL de la charte (montant simple)
// Les soldes d ouverture des comptes de BANQUE se saisissent dans Comptes bancaires
// (Configuration) - ils sont rappeles ici a titre indicatif dans la balance.
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
var money=function(n){return (Number(n)||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};

// Detection du detail requis selon le compte choisi
function detailPour(compte){
  if(!compte)return "";
  var t=((compte.nom_compte||"")+" "+(compte.groupe||"")).toLowerCase();
  var no=String(compte.no_compte||"");
  if(/recevoir|arrerage/.test(t)||no.indexOf("12")===0)return "unite";
  if(/fournisseur|a payer|payable/.test(t)||no.indexOf("22")===0)return "fournisseur";
  return "";
}
function sensDefaut(compte){
  if(!compte)return "debit";
  var ty=(compte.type_compte||"").toLowerCase();
  if(ty==="passif"||ty==="revenu"||ty==="capitaux"||ty==="fonds")return "credit";
  return "debit";
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
  var s9=useState({no_compte:"",sens:"debit",montant:"",unite:"",fournisseur:"",date_solde:"",note:""});var nf=s9[0];var setNf=s9[1];
  var s10=useState(false);var saving=s10[0];var setSaving=s10[1];

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
    sb.select("soldes_ouverture",{eq:{syndicat_id:sel.id},order:"no_compte.asc",limit:1000}).then(function(r){
      if(r&&r.data)setLignes(r.data.filter(function(x){return x.statut!=="retire";}));
      else setLignes([]);
      if(r&&r.error)setErr("Chargement impossible: "+(r.error.message||"la table soldes_ouverture existe-t-elle? (SQL fourni)"));
    }).catch(function(){setLignes([]);});
    sb.select("comptes_bancaires",{eq:{syndicat_id:sel.id},limit:20}).then(function(r){if(r&&r.data)setBanques(r.data);else setBanques([]);}).catch(function(){setBanques([]);});
  }
  useEffect(function(){charger();},[sel&&sel.id]);

  function setF(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}
  var compteSel=comptes.find(function(c){return c.no_compte===nf.no_compte;});
  var detail=detailPour(compteSel);

  function ajouter(){
    if(saving||!sel)return;
    if(!compteSel){setErr("Choisissez le compte GL.");return;}
    var mnt=parseFloat(nf.montant)||0;
    if(mnt<=0){setErr("Entrez un montant positif.");return;}
    if(detail==="unite"&&!nf.unite){setErr("Ce compte se detaille PAR UNITE - choisissez l unite qui doit la somme.");return;}
    if(detail==="fournisseur"&&!nf.fournisseur){setErr("Ce compte se detaille PAR FOURNISSEUR - choisissez ou saisissez le fournisseur.");return;}
    setSaving(true);setErr("");
    var u=detail==="unite"?unites.find(function(x){return x.no_unite===nf.unite;}):null;
    sb.insert("soldes_ouverture",{
      syndicat_id:sel.id,no_compte:compteSel.no_compte,nom_compte:compteSel.nom_compte,
      sens:nf.sens||sensDefaut(compteSel),montant:mnt,
      unite_id:u?u.id:null,unite:detail==="unite"?nf.unite:"",
      fournisseur:detail==="fournisseur"?nf.fournisseur:"",
      date_solde:nf.date_solde||null,note:nf.note||"",statut:"actif"
    }).then(function(r){
      setSaving(false);
      if(!r||!r.data||!r.data.id){setErr("ECHEC de l ajout: "+((r&&r.error&&r.error.message)||"la table soldes_ouverture existe-t-elle? (SQL fourni)"));return;}
      setMsg("Solde d ouverture ajoute: "+compteSel.no_compte+" - "+money(mnt)+(nf.unite?" (unite "+nf.unite+")":"")+(nf.fournisseur?" ("+nf.fournisseur+")":"")+".");
      sb.log("comptabilite","creation","Solde d ouverture "+compteSel.no_compte+" "+mnt.toFixed(2)+" $"+(nf.unite?" unite "+nf.unite:"")+(nf.fournisseur?" "+nf.fournisseur:""),"",sel.code||"");
      setNf({no_compte:"",sens:"debit",montant:"",unite:"",fournisseur:"",date_solde:nf.date_solde,note:""});
      charger();setTimeout(function(){setMsg("");},7000);
    }).catch(function(e){setSaving(false);setErr("ECHEC: "+(e&&e.message?e.message:""));});
  }
  function retirer(l){
    sb.update("soldes_ouverture",l.id,{statut:"retire"}).then(function(r){
      if(r&&r.error){setErr("ECHEC: "+(r.error.message||""));return;}
      sb.log("comptabilite","modification","Solde d ouverture retire: "+l.no_compte+" "+(Number(l.montant)||0).toFixed(2)+" $","",sel.code||"");
      charger();
    });
  }

  // Regroupement par compte + balance
  var parCompte={};
  lignes.forEach(function(l){
    var k=l.no_compte;
    if(!parCompte[k])parCompte[k]={no:l.no_compte,nom:l.nom_compte,lignes:[],total:0,sens:l.sens};
    parCompte[k].lignes.push(l);
    parCompte[k].total=Math.round((parCompte[k].total+(Number(l.montant)||0))*100)/100;
  });
  var groupes=Object.keys(parCompte).sort().map(function(k){return parCompte[k];});
  var totDebit=lignes.filter(function(l){return l.sens!=="credit";}).reduce(function(a,l){return a+(Number(l.montant)||0);},0);
  var totCredit=lignes.filter(function(l){return l.sens==="credit";}).reduce(function(a,l){return a+(Number(l.montant)||0);},0);
  var totBanques=banques.reduce(function(a,b){return a+(Number(b.solde_ouverture)||0);},0);
  var FONDS_NOMS={operation:"Fonds d operation",prevoyance:"Fonds de prevoyance",assurance:"Fonds d auto-assurance",special:"Fonds de travaux speciaux"};
  var ecart=Math.round(((totDebit+totBanques)-totCredit)*100)/100;

  if(syndicats.length===0)return <div style={{padding:40,textAlign:"center",fontFamily:"Georgia,serif",color:T.muted}}>Aucun syndicat.</div>;
  if(!sel)return null;

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Soldes d ouverture</div>
          <div style={{fontSize:10,color:"#9fb0c6"}}>Soldes de depart de tous les comptes GL - recevoir par unite, payer par fournisseur</div>
        </div>
        <select value={sel.id} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
          {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
        </select>
      </div>

      <div style={{padding:20}}>
        {msg&&<div style={{background:T.accentL,border:"2px solid "+T.accent,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.accent,fontWeight:700,marginBottom:12}}>{msg}</div>}
        {err&&<div style={{background:T.redL,border:"2px solid "+T.red,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,fontWeight:700,marginBottom:12}}>{err}</div>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          <div style={{background:T.blueL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Banques (Comptes bancaires - Configuration)</div><div style={{fontSize:16,fontWeight:800,color:T.blue}}>{money(totBanques)}</div></div>
          <div style={{background:T.accentL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Autres DEBITS (actifs, a recevoir...)</div><div style={{fontSize:16,fontWeight:800,color:T.accent}}>{money(totDebit)}</div></div>
          <div style={{background:T.amberL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>CREDITS (passifs, a payer, fonds...)</div><div style={{fontSize:16,fontWeight:800,color:T.amber}}>{money(totCredit)}</div></div>
          <div style={{background:Math.abs(ecart)<0.01?T.accentL:T.redL,borderRadius:10,padding:12}}><div style={{fontSize:10,color:T.muted}}>Ecart (debits + banques - credits)</div><div style={{fontSize:16,fontWeight:800,color:Math.abs(ecart)<0.01?T.accent:T.red}}>{money(ecart)}</div></div>
        </div>

        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:800,color:T.navy,marginBottom:10}}>Ajouter un solde d ouverture</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
            <div><Lbl l="Compte GL (charte du syndicat)"/>
              <select value={nf.no_compte} onChange={function(e){
                var c=comptes.find(function(x){return x.no_compte===e.target.value;});
                setNf(Object.assign({},nf,{no_compte:e.target.value,sens:sensDefaut(c),unite:"",fournisseur:""}));
              }} style={INP}>
                <option value="">Choisir...</option>
                {comptes.map(function(c){return <option key={c.id} value={c.no_compte}>{c.no_compte} - {c.nom_compte}</option>;})}
              </select>
            </div>
            <div><Lbl l="Sens"/>
              <select value={nf.sens} onChange={function(e){setF("sens",e.target.value);}} style={INP}>
                <option value="debit">Debit (actif, du au syndicat)</option>
                <option value="credit">Credit (passif, du par le syndicat)</option>
              </select>
            </div>
            <div><Lbl l="Montant ($)"/><input type="number" step="0.01" min="0" value={nf.montant} onChange={function(e){setF("montant",e.target.value);}} style={INP}/></div>
            <div><Lbl l="Date du solde"/><input type="date" value={nf.date_solde} onChange={function(e){setF("date_solde",e.target.value);}} style={INP}/></div>
            {detail==="unite"&&(
              <div><Lbl l="Unite qui doit la somme (REQUIS)"/>
                <select value={nf.unite} onChange={function(e){setF("unite",e.target.value);}} style={INP}>
                  <option value="">Choisir...</option>
                  {unites.map(function(u){return <option key={u.id} value={u.no_unite}>Unite {u.no_unite}</option>;})}
                </select>
              </div>
            )}
            {detail==="fournisseur"&&(
              <div><Lbl l="Fournisseur (REQUIS)"/>
                <select value={nf.fournisseur} onChange={function(e){setF("fournisseur",e.target.value);}} style={INP}>
                  <option value="">Choisir...</option>
                  {fournisseurs.map(function(f){return <option key={f.id} value={f.nom}>{f.nom}</option>;})}
                </select>
              </div>
            )}
            <div style={{gridColumn:detail?"span 2":"span 3"}}><Lbl l="Note (optionnel)"/><input value={nf.note} onChange={function(e){setF("note",e.target.value);}} style={INP}/></div>
          </div>
          {detail==="unite"&&<div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:8}}>Ce compte est un COMPTE A RECEVOIR: une ligne par unite qui doit une somme au syndicat.</div>}
          {detail==="fournisseur"&&<div style={{fontSize:10,color:T.amber,fontWeight:700,marginBottom:8}}>Ce compte est un COMPTE A PAYER: une ligne par fournisseur a qui le syndicat doit une somme.</div>}
          <Btn onClick={ajouter} dis={saving}>{saving?"Ajout...":"Ajouter le solde"}</Btn>
        </div>

        <div style={{background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:10,padding:"10px 14px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:800,color:T.blue,marginBottom:6}}>SOLDES D OUVERTURE DES BANQUES (saisis dans Configuration - Comptes bancaires)</div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {banques.map(function(b){return <div key={b.id} style={{fontSize:11,color:T.navy}}><b>{FONDS_NOMS[b.fonds]||("Fonds "+(b.fonds||""))}</b>: {money(b.solde_ouverture)} {b.date_solde?<span style={{color:T.muted}}>au {String(b.date_solde).substring(0,10)}</span>:null}</div>;})}
            {banques.length===0&&<div style={{fontSize:11,color:T.muted}}>Aucun compte bancaire configure.</div>}
          </div>
        </div>

        {groupes.map(function(g){
          return(
            <div key={g.no} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
              <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:10,background:T.alt}}>
                <div style={{fontSize:12,fontWeight:800,color:T.navy}}>{g.no} - {g.nom}</div>
                <div style={{marginLeft:"auto",fontSize:13,fontWeight:800,color:g.sens==="credit"?T.amber:T.accent}}>{money(g.total)} <span style={{fontSize:9,color:T.muted}}>{g.sens==="credit"?"CREDIT":"DEBIT"}</span></div>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <tbody>
                  {g.lignes.map(function(l){
                    return(
                      <tr key={l.id} style={{borderTop:"1px solid "+T.border}}>
                        <td style={{padding:"6px 14px",width:180,fontWeight:700}}>{l.unite?"Unite "+l.unite:(l.fournisseur||"-")}</td>
                        <td style={{padding:"6px 14px",color:T.muted}}>{l.date_solde?"au "+String(l.date_solde).substring(0,10):""}{l.note?" - "+l.note:""}</td>
                        <td style={{padding:"6px 14px",textAlign:"right",fontWeight:800,color:T.navy,width:120}}>{money(l.montant)}</td>
                        <td style={{padding:"6px 14px",width:80,textAlign:"right"}}><Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){retirer(l);}}>Retirer</Btn></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
        {groupes.length===0&&<div style={{textAlign:"center",padding:30,color:T.muted,fontSize:12}}>Aucun solde d ouverture saisi pour ce syndicat.</div>}
      </div>
    </div>
  );
}
