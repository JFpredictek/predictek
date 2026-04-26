import { useState } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Bdg(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap",display:"inline-block"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit",width:p.fw?"100%":"auto",opacity:p.dis?0.6:1}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Card(p){return <div style={{background:T.surface,border:"1px solid "+(p.bc||T.border),borderRadius:12,padding:p.p||16,marginBottom:14}}>{p.children}</div>;}
function Spinner(){return <div style={{display:"inline-block",width:16,height:16,border:"2px solid #ffffff40",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite",verticalAlign:"middle",marginRight:6}}/>;}

async function callClaude(system, user, maxTokens){
  maxTokens = maxTokens || 1000;
  var resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: system,
      messages: [{role: "user", content: user}]
    })
  });
  var data = await resp.json();
  if(data.content && data.content[0]) return data.content[0].text;
  throw new Error(data.error ? data.error.message : "Erreur API");
}

// ===== TAB ANALYSE SOUMISSIONS =====
function TabAnalyseSoumissions(){
  var s0=useState([]);var soumissions=s0[0];var soumissions=s0[0];
  var soumissions=s0[0];var setSoumissions=s0[1];
  var s1=useState("");var analyse=s1[0];var setAnalyse=s1[1];
  var s2=useState(false);var loading=s2[0];var setLoading=s2[1];
  var s3=useState("");var ctx=s3[0];var setCtx=s3[1];
  var s4=useState(null);var editId=s4[0];var setEditId=s4[1];
  var s5=useState({});var nf=s5[0];var setNf=s5[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  async function lancer(){
    setLoading(true);setAnalyse("");
    var sys="Tu es un expert en gestion de copropriete au Quebec. Tu analyses des soumissions de fournisseurs pour le Syndicat Piedmont, un syndicat de copropriete de 36 unites a Stoneham QC. Reponds en francais, de facon professionnelle et structuree. Utilise des points et sous-points clairs.";
    var prompt="Analyse et compare ces "+soumissions.length+" soumissions pour des travaux de "+soumissions[0].cat+". Contexte additionnel: "+(ctx||"Aucun contexte specifique.")+"\n\nSOUMISSIONS:\n"+soumissions.map(function(s,i){return (i+1)+". "+s.fournisseur+"\n   Prix: "+s.prix+"$\n   Delai intervention: "+s.delai+"\n   Garantie: "+s.garantie+"\n   Certifie RBQ: "+(s.certifie?"Oui":"Non")+"\n   Experience: "+s.experience+"\n   Notes: "+s.note;}).join("\n\n")+"\n\nFournis:\n1. Tableau comparatif (prix, delai, garantie, certification)\n2. Analyse risques/benefices de chaque option\n3. Recommandation claire avec justification\n4. Points de negociation suggeres\n5. Decision recommandee au CA";
    try{
      var res=await callClaude(sys,prompt,1500);
      setAnalyse(res);
    }catch(e){setAnalyse("Erreur: "+e.message);}
    setLoading(false);
  }

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <b style={{fontSize:13,color:T.navy}}>Soumissions ({soumissions.length})</b>
            <Btn sm onClick={function(){setNf({fournisseur:"",cat:"Deneigement",prix:"",delai:"",garantie:"",certifie:true,experience:"",note:""});setEditId("new");}}>+ Ajouter</Btn>
          </div>
          {soumissions.map(function(s){return(
            <div key={s.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:12,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{s.fournisseur}</div>
                <div style={{display:"flex",gap:4}}>
                  <Bdg bg={s.certifie?T.accentL:T.redL} c={s.certifie?T.accent:T.red}>{s.certifie?"RBQ":"Sans RBQ"}</Bdg>
                  <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setNf(Object.assign({},s));setEditId(s.id);}}>Edit</Btn>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,fontSize:11,color:T.muted}}>
                <span>Prix: <b style={{color:T.navy}}>{s.prix.toLocaleString("fr-CA")} $</b></span>
                <span>Delai: <b style={{color:T.text}}>{s.delai}</b></span>
                <span>Garantie: {s.garantie}</span>
                <span>Experience: {s.experience}</span>
              </div>
              {s.note&&<div style={{fontSize:10,color:T.muted,marginTop:5,fontStyle:"italic"}}>{s.note}</div>}
            </div>
          );})}
          {editId&&(
            <div style={{background:T.accentL,border:"1px solid "+T.accent,borderRadius:10,padding:12,marginBottom:8}}>
              <Lbl l={editId==="new"?"Nouvelle soumission":"Modifier"}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <div style={{gridColumn:"1/-1"}}><input value={nf.fournisseur||""} onChange={function(e){snf("fournisseur",e.target.value);}} placeholder="Nom du fournisseur" style={INP}/></div>
                <input type="number" value={nf.prix||""} onChange={function(e){snf("prix",parseFloat(e.target.value)||0);}} placeholder="Prix ($)" style={INP}/>
                <input value={nf.delai||""} onChange={function(e){snf("delai",e.target.value);}} placeholder="Delai (ex: 48h)" style={INP}/>
                <input value={nf.garantie||""} onChange={function(e){snf("garantie",e.target.value);}} placeholder="Garantie" style={INP}/>
                <input value={nf.experience||""} onChange={function(e){snf("experience",e.target.value);}} placeholder="Experience" style={INP}/>
                <div style={{gridColumn:"1/-1"}}><input value={nf.note||""} onChange={function(e){snf("note",e.target.value);}} placeholder="Notes" style={INP}/></div>
                <label style={{display:"flex",gap:6,alignItems:"center",fontSize:12,cursor:"pointer",gridColumn:"1/-1"}}>
                  <input type="checkbox" checked={!!nf.certifie} onChange={function(e){snf("certifie",e.target.checked);}}/>Certifie RBQ
                </label>
              </div>
              <div style={{display:"flex",gap:6}}>
                <Btn sm onClick={function(){
                  if(editId==="new"){setSoumissions(function(p){return p.concat([Object.assign({},nf,{id:Date.now(),cat:nf.cat||"Service"})]);});}
                  else{setSoumissions(function(p){return p.map(function(s){return s.id===editId?Object.assign({},s,nf):s;});});}
                  setEditId(null);
                }}>Sauvegarder</Btn>
                <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setEditId(null);}}>Annuler</Btn>
              </div>
            </div>
          )}
          <div style={{marginTop:8}}>
            <Lbl l="Contexte additionnel (optionnel)"/>
            <textarea value={ctx} onChange={function(e){setCtx(e.target.value);}} placeholder="Ex: Budget maximum 21 000$, priorite a la rapidite d intervention, historique de problemes avec certains fournisseurs..." rows={3} style={Object.assign({},INP,{resize:"vertical"})}/>
          </div>
          <div style={{marginTop:10}}>
            <Btn fw dis={loading||soumissions.length<2} onClick={lancer}>
              {loading&&<Spinner/>}{loading?"Analyse en cours...":"Analyser avec l IA Predictek"}
            </Btn>
          </div>
        </div>
        <div>
          <b style={{fontSize:13,color:T.navy,display:"block",marginBottom:10}}>Rapport d analyse IA</b>
          {!analyse&&!loading&&(
            <div style={{background:T.alt,borderRadius:10,padding:30,textAlign:"center",color:T.muted,fontSize:12}}>
              Ajoutez au moins 2 soumissions et cliquez "Analyser" pour obtenir une recommandation detaillee.
            </div>
          )}
          {loading&&(
            <div style={{background:T.purpleL,borderRadius:10,padding:30,textAlign:"center",color:T.purple,fontSize:12}}>
              <div style={{fontSize:24,marginBottom:8}}>IA</div>
              <div>Analyse des soumissions en cours...</div>
            </div>
          )}
          {analyse&&(
            <div style={{background:T.surface,border:"1px solid "+T.accent,borderRadius:10,padding:14,fontSize:12,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap",maxHeight:500,overflowY:"auto"}}>
              {analyse}
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html:"@keyframes spin{to{transform:rotate(360deg)}}"}}></style>
    </div>
  );
}

// ===== TAB REDACTION PV =====
function TabRedactionPV(){
  var s0=useState("");var notes=s0[0];var setNotes=s0[1];
  var s1=useState("");var pv=s1[0];var setPV=s1[1];
  var s2=useState(false);var loading=s2[0];var setLoading=s2[1];
  var s3=useState({date:"",heure:"19:00",lieu:"",president:"",secretaire:"",type:"CA",presences:""});
  var meta=s3[0];var setMeta=s3[1];
  function sm(k,v){setMeta(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  var EXEMPLE_NOTES="Points discutes:\n1. Approbation PV derniere reunion - approuve unanimement\n2. Rapport financier: solde exploitation 7361$, prevoyance 64235$\n3. Travaux deneigement: soumission Express acceptee 22000$\n4. Plainte unite 539 bruit chauffage - plombier appele\n5. Renouvellement assurance syndicat - hausse 8% prevue\n6. AGO fixee au 22 octobre 2026 - ordre du jour a preparer\n7. Projet peinture corridor: 3 soumissions a obtenir\nVotes: Resolution 2026-04-001 autorisant travaux deneigement - 5 pour, 0 contre";

  async function generer(){
    setLoading(true);setPV("");
    var sys="Tu es un secretaire professionnel specialise en gestion de copropriete au Quebec. Tu rediges des proces-verbaux de reunions de conseil d administration de syndicats de copropriete selon les exigences de la Loi sur la copropriete divise (CCQ). Tes PV sont formels, complets, et juridiquement valides. Reponds UNIQUEMENT avec le PV formate, sans commentaire.";
    var prompt="Redige un proces-verbal complet et formel pour la reunion suivante.\n\nINFORMATIONS:\n- Type: Reunion du "+meta.type+"\n- Date: "+meta.date+" a "+meta.heure+"\n- Lieu: "+meta.lieu+"\n- President de seance: "+meta.president+"\n- Secretaire: "+meta.secretaire+"\n- Personnes presentes: "+meta.presences+"\n- Syndicat: Syndicat Piedmont, "+meta.type+" compose de 5 membres\n\nNOTES DE REUNION:\n"+notes+"\n\nRedige un PV complet avec:\n- En-tete officiel\n- Verification du quorum\n- Adoption de l ordre du jour\n- Rapport du president\n- Points discutes avec decisions et votes\n- Resolutions numerotees\n- Levee de la seance\n- Signatures requises";
    try{
      var res=await callClaude(sys,prompt,2000);
      setPV(res);
    }catch(e){setPV("Erreur: "+e.message);}
    setLoading(false);
  }

  function imprimer(){
    var win=window.open("","_blank");
    if(!win)return;
    win.document.write("<!DOCTYPE html><html><head><meta charset='utf-8'><title>PV Reunion CA</title><style>body{font-family:Arial,sans-serif;margin:40px;line-height:1.6;color:#1C1A17}pre{white-space:pre-wrap;font-family:Arial,sans-serif}@media print{button{display:none}}</style></head><body>");
    win.document.write("<button onclick='window.print()' style='background:#1B5E3B;color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;margin-bottom:20px'>Imprimer</button>");
    win.document.write("<pre>"+pv+"</pre></body></html>");
    win.document.close();
  }

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <Card>
            <b style={{fontSize:13,color:T.navy,display:"block",marginBottom:12}}>Informations de la reunion</b>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div><Lbl l="Type"/><select value={meta.type} onChange={function(e){sm("type",e.target.value);}} style={INP}><option value="CA">Conseil d administration</option><option value="AGO">Assemblee generale ordinaire</option><option value="AGE">Assemblee generale extraordinaire</option></select></div>
              <div><Lbl l="Date"/><input type="date" value={meta.date} onChange={function(e){sm("date",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Heure"/><input value={meta.heure} onChange={function(e){sm("heure",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Lieu"/><input value={meta.lieu} onChange={function(e){sm("lieu",e.target.value);}} style={INP}/></div>
              <div><Lbl l="President de seance"/><input value={meta.president} onChange={function(e){sm("president",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Secretaire"/><input value={meta.secretaire} onChange={function(e){sm("secretaire",e.target.value);}} style={INP}/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Personnes presentes"/><input value={meta.presences} onChange={function(e){sm("presences",e.target.value);}} style={INP} placeholder="Noms separ-s par virgule"/></div>
            </div>
          </Card>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <b style={{fontSize:13,color:T.navy}}>Notes de reunion</b>
              <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setNotes(EXEMPLE_NOTES);}}>Exemple</Btn>
            </div>
            <textarea value={notes} onChange={function(e){setNotes(e.target.value);}} placeholder={"Entrez vos notes de reunion:\n- Points discutes\n- Decisions prises\n- Votes (pour/contre/abstention)\n- Resolutions adoptees\n- Actions a suivre..."} rows={12} style={Object.assign({},INP,{resize:"vertical"})}/>
          </Card>
          <Btn fw dis={loading||!notes.trim()} onClick={generer}>
            {loading&&<Spinner/>}{loading?"Generation en cours...":"Generer le PV avec l IA"}
          </Btn>
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <b style={{fontSize:13,color:T.navy}}>Proces-verbal genere</b>
            {pv&&<Btn sm onClick={imprimer}>Imprimer PDF</Btn>}
          </div>
          {!pv&&!loading&&<div style={{background:T.alt,borderRadius:10,padding:40,textAlign:"center",color:T.muted,fontSize:12}}>Le PV genere apparaitra ici. Entrez vos notes et cliquez "Generer".</div>}
          {loading&&<div style={{background:T.purpleL,borderRadius:10,padding:40,textAlign:"center",color:T.purple,fontSize:13}}>
            <div style={{fontSize:24,marginBottom:8}}>IA</div>Redaction du PV en cours...
          </div>}
          {pv&&<div style={{background:T.surface,border:"1px solid "+T.accent,borderRadius:10,padding:16,fontSize:11,color:T.text,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:620,overflowY:"auto",fontFamily:"Georgia,serif"}}>{pv}</div>}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html:"@keyframes spin{to{transform:rotate(360deg)}}"}}></style>
    </div>
  );
}

// ===== TAB DETECTION ANOMALIES =====
function TabDetectionAnomalies(){
  var FACTURES_ANOM_INIT=[];
  var s0=useState([]);var factures=s0[0];var setFactures=s0[1];
  var s1=useState({});var resultats=s1[0];var setResultats=s1[1];
  var s2=useState(null);var loading=s2[0];var setLoading=s2[1];

  async function analyserFacture(f){
    setLoading(f.id);
    var sys="Tu es un expert en detection de fraude et d anomalies financieres pour des syndicats de copropriete au Quebec. Analyse les factures fournisseurs pour detecter des problemes potentiels. Reponds en JSON UNIQUEMENT avec ce format exact: {\"score\": 0-100, \"niveau\": \"normal|attention|suspect\", \"anomalies\": [\"anomalie 1\", \"anomalie 2\"], \"recommandation\": \"action recommandee\"}. Score 0-30=normal, 31-60=attention, 61-100=suspect.";
    var prompt="Analyse cette facture fournisseur pour un syndicat de copropriete:\nFournisseur: "+f.four+"\nDate: "+f.date+"\nMontant: "+f.mnt+"$\nDescription: "+f.desc+"\nContrat en vigueur: "+f.contrat+"\n\nContexte:\n- Budget annuel deneigement: 22 000$\n- Budget reparations urgentes: 5 000$/an\n- Seuil approbation CA: 500$\n- Montant moyen factures ce fournisseur: 750$";
    try{
      var res=await callClaude(sys,prompt,400);
      var clean=res;while(clean.indexOf("\u0060\u0060\u0060json")>=0){clean=clean.replace("\u0060\u0060\u0060json","");}while(clean.indexOf("\u0060\u0060\u0060")>=0){clean=clean.replace("\u0060\u0060\u0060","");}clean=clean.trim();
      var parsed=JSON.parse(clean);
      setResultats(function(prev){var n=Object.assign({},prev);n[f.id]=parsed;return n;});
    }catch(e){setResultats(function(prev){var n=Object.assign({},prev);n[f.id]={score:0,niveau:"normal",anomalies:[],recommandation:"Analyse impossible: "+e.message};return n;});}
    setLoading(null);
  }

  async function analyserToutes(){
    for(var i=0;i<factures.length;i++){
      await analyserFacture(factures[i]);
      await new Promise(function(r){setTimeout(r,500);});
    }
  }

  var NIVEAU={normal:{c:T.accent,bg:T.accentL,l:"Normal"},attention:{c:T.amber,bg:T.amberL,l:"Attention"},suspect:{c:T.red,bg:T.redL,l:"Suspect"}};

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <b style={{fontSize:14,color:T.navy}}>Detection d anomalies - Factures fournisseurs</b>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>L IA analyse chaque facture et detecte les irregularites potentielles</div>
        </div>
        <Btn dis={loading!==null} onClick={analyserToutes}>{loading!==null&&<Spinner/>}Analyser toutes</Btn>
      </div>
      <div style={{display:"grid",gap:10}}>
        {factures.map(function(f){
          var res=resultats[f.id];
          var niv=res?NIVEAU[res.niveau]||NIVEAU.normal:null;
          return(
            <div key={f.id} style={{background:T.surface,border:"1px solid "+(res?niv.bg:T.border),borderRadius:10,padding:14,display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:12,alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:2}}>{f.four}</div>
                <div style={{fontSize:11,color:T.muted}}>{f.desc}</div>
                <div style={{fontSize:10,color:T.muted,marginTop:2}}>Contrat: {f.contrat}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:14,fontWeight:800,color:T.navy}}>{f.mnt.toLocaleString("fr-CA")} $</div>
                <div style={{fontSize:10,color:T.muted}}>{f.date}</div>
              </div>
              <div style={{textAlign:"center"}}>
                {res?(
                  <div>
                    <div style={{fontSize:22,fontWeight:900,color:niv.c}}>{res.score}</div>
                    <div style={{fontSize:9,color:niv.c,fontWeight:700}}>SCORE</div>
                  </div>
                ):<div style={{fontSize:11,color:T.muted}}>-</div>}
              </div>
              <div>
                {res?(
                  <div>
                    <Bdg bg={niv.bg} c={niv.c}>{niv.l}</Bdg>
                    {res.anomalies&&res.anomalies.length>0&&(
                      <div style={{marginTop:6}}>
                        {res.anomalies.map(function(a,i){return <div key={i} style={{fontSize:10,color:niv.c,marginTop:2}}>- {a}</div>;})}
                      </div>
                    )}
                    {res.recommandation&&<div style={{fontSize:10,color:T.muted,marginTop:4,fontStyle:"italic"}}>{res.recommandation}</div>}
                  </div>
                ):<div style={{fontSize:11,color:T.muted}}>Non analyse</div>}
              </div>
              <Btn sm dis={loading===f.id} onClick={function(){analyserFacture(f);}}>
                {loading===f.id?<Spinner/>:"Analyser"}
              </Btn>
            </div>
          );
        })}
      </div>
      <style dangerouslySetInnerHTML={{__html:"@keyframes spin{to{transform:rotate(360deg)}}"}}></style>
    </div>
  );
}

// ===== TAB CHATBOT COPROPRI-TAIRE =====
function TabChatbot(){
  var s0=useState([]);var msgs=s0[0];var setMsgs=s0[1];
  var s1=useState("");var input=s1[0];var setInput=s1[1];
  var s2=useState(false);var loading=s2[0];var setLoading=s2[1];
  var s3=useState("531");var unite=s3[0];

  var syndicatParams=(function(){try{var keys=Object.keys(localStorage).filter(function(k){return k.startsWith("predictek_syndicat_");});if(keys.length>0){var s=JSON.parse(localStorage.getItem(keys[0]));return {nom:s.nom||"",tel:s.courrielUrgences||s.telUrgences||"Voir configuration syndicat",president:s.president||""};}return {nom:"",tel:"Voir configuration syndicat",president:""};}catch(e){return {nom:"",tel:"Voir configuration syndicat",president:""};}}());
  var SYSTEM="Tu es l assistant virtuel du syndicat "+syndicatParams.nom+". Tu aides les coproprietaires avec leurs questions sur la copropriete, les regles de l immeuble, les procedures et leurs droits et obligations selon la Loi sur la copropriete divise (CCQ). Tu es professionnel, courtois et precis. Tu reponds en francais. Pour les urgences, diriger vers: "+syndicatParams.tel+". Ne fournis pas de conseils juridiques specifiques. Rappelle-toi que tu ne dois pas divulguer d informations sur les autres unites ou coproprietaires.";

  async function envoyer(){
    if(!input.trim())return;
    var msg=input.trim();
    setInput("");
    var newMsgs=msgs.concat([{role:"user",content:msg}]);
    setMsgs(newMsgs);
    setLoading(true);
    try{
      var resp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:SYSTEM,messages:newMsgs})
      });
      var data=await resp.json();
      var reply=data.content&&data.content[0]?data.content[0].text:"Desolee, je n ai pas pu traiter votre demande.";
      setMsgs(newMsgs.concat([{role:"assistant",content:reply}]));
    }catch(e){setMsgs(newMsgs.concat([{role:"assistant",content:"Erreur de connexion. Veuillez reessayer."}]));}
    setLoading(false);
  }

  var QUESTIONS_RAPIDES=["Quelles sont les heures de silence?","Comment soumettre une demande de reparation?","Comment acceder a mes documents de copropriete?","Quelles sont les regles pour les animaux?","Qui contacter en cas d urgence?"];

  return(
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,height:560}}>
      <div style={{display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,background:T.navy,padding:"10px 14px",borderRadius:"10px 10px 0 0"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:14,fontWeight:900,color:"#fff"}}>IA</span>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Assistant virtuel Predictek</div>
            <div style={{fontSize:10,color:"#3CAF6E"}}>Propulse par IA Predictek</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:10,color:"#8da0bb"}}>Unite:</span>
            <div style={{background:"#ffffff20",border:"1px solid #ffffff30",borderRadius:6,padding:"2px 10px",color:"#fff",fontSize:11,fontFamily:"inherit",fontWeight:700}}>Unite 531</div>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:12,background:T.alt,display:"flex",flexDirection:"column",gap:10}}>
          {msgs.length===0&&(
            <div style={{textAlign:"center",color:T.muted,padding:30,fontSize:12}}>
              Bonjour! Je suis votre assistant virtuel.<br/>Comment puis-je vous aider aujourd hui?
            </div>
          )}
          {msgs.map(function(m,i){var isUser=m.role==="user";return(
            <div key={i} style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"80%",background:isUser?T.navy:T.surface,color:isUser?"#fff":T.text,borderRadius:isUser?"12px 12px 3px 12px":"12px 12px 12px 3px",padding:"9px 13px",fontSize:12,lineHeight:1.6,border:isUser?"none":"1px solid "+T.border}}>
                {m.content}
              </div>
            </div>
          );})}
          {loading&&(
            <div style={{display:"flex",justifyContent:"flex-start"}}>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:"12px 12px 12px 3px",padding:"9px 13px",fontSize:12,color:T.muted}}>
                Redaction en cours...
              </div>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:8,padding:10,background:T.surface,borderRadius:"0 0 10px 10px",border:"1px solid "+T.border,borderTop:"none"}}>
          <input value={input} onChange={function(e){setInput(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&!loading)envoyer();}} placeholder="Votre question..." style={Object.assign({},INP,{flex:1})} disabled={loading}/>
          <Btn dis={loading||!input.trim()} onClick={envoyer}>Envoyer</Btn>
        </div>
      </div>
      <div>
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:12}}>
          <b style={{fontSize:12,color:T.navy,display:"block",marginBottom:10}}>Questions frequentes</b>
          {QUESTIONS_RAPIDES.map(function(q,i){return(
            <button key={i} onClick={function(){setInput(q);}} style={{display:"block",width:"100%",textAlign:"left",background:T.alt,border:"1px solid "+T.border,borderRadius:7,padding:"8px 10px",fontSize:11,color:T.text,cursor:"pointer",fontFamily:"inherit",marginBottom:6}}>
              {q}
            </button>
          );})}
        </div>
        <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:10,padding:12}}>
          <div style={{fontSize:11,fontWeight:700,color:T.amber,marginBottom:6}}>Urgences</div>
          <div style={{fontSize:11,color:T.amber,lineHeight:1.6}}>
            Fuite/feu/bris:<br/><b>Voir config syndicat</b><br/><span style={{fontSize:10}}>Configure dans Parametres syndicat</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MODULE PRINCIPAL =====
export default function ModuleIA(){
  var s0=useState("soumissions");var ong=s0[0];var setOng=s0[1];
  var TABS=[
    {id:"soumissions",l:"Analyse soumissions"},
    {id:"pv",l:"Redaction PV"},
    {id:"anomalies",l:"Detection anomalies"},
    {id:"chatbot",l:"Chatbot coproprietaire"},
  ];
  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Intelligence artificielle Predictek</div>
          <div style={{fontSize:11,color:T.muted}}>Outils IA pour optimiser la gestion de vos syndicats - Propulse par Claude</div>
        </div>
        <Bdg bg={T.purpleL} c={T.purple}>Claude Sonnet 4</Bdg>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:16,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {TABS.map(function(t){var a=ong===t.id;return(
          <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"8px 16px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t.l}</button>
        );})}
      </div>
      {ong==="soumissions"&&<TabAnalyseSoumissions/>}
      {ong==="pv"&&<TabRedactionPV/>}
      {ong==="anomalies"&&<TabDetectionAnomalies/>}
      {ong==="chatbot"&&<TabChatbot/>}
    </div>
  );
}
