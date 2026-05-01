import sb from "./lib/supabase";
import { useState, useRef, useEffect } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",pop:"#3CAF6E",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
var money=function(n){return Math.abs(n||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var today=function(){return new Date().toISOString().slice(0,10);};
var now_ts=function(){return new Date().toLocaleString("fr-CA",{hour12:false}).replace(",","");};

function Bdg(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap",display:"inline-block"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} style={{background:p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function FRow(p){return <div style={p.full?{gridColumn:"1/-1"}:{}}><Lbl l={p.l}/>{p.children}</div>;}
function Modal(p){
  if(!p.show)return null;
  return(
    <div onClick={function(e){if(e.target===e.currentTarget)p.onClose();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:24,width:p.w||540,maxWidth:"94vw",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <b style={{fontSize:14,color:T.text}}>{p.title}</b>
          <button onClick={p.onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.muted,lineHeight:1}}>x</button>
        </div>
        {p.children}
      </div>
    </div>
  );
}

// ===== DONNEES SYNDICATS =====
var SYNDICATS_INIT=[];

var USAGERS_INIT=[];

// ===== SCORE SANTE =====
function ScoreBarre(p){
  var c=p.v>=85?T.accent:p.v>=70?T.amber:T.red;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:10,color:T.muted}}>{p.l}</span>
        <span style={{fontSize:11,fontWeight:700,color:c}}>{p.v}%</span>
      </div>
      <div style={{height:5,background:T.border,borderRadius:3,overflow:"hidden"}}>
        <div style={{width:p.v+"%",height:"100%",background:c,borderRadius:3}}/>
      </div>
    </div>
  );
}

function ScoreGlobal(p){
  var score=Math.round((p.s.scoreFinancier+p.s.scoreConformite+p.s.scoreEntretien)/3);
  var c=score>=85?T.accent:score>=70?T.amber:T.red;
  return(
    <div style={{width:48,height:48,borderRadius:"50%",background:c+"22",border:"2px solid "+c,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",flexShrink:0}}>
      <div style={{fontSize:14,fontWeight:800,color:c,lineHeight:1}}>{score}</div>
      <div style={{fontSize:7,color:c,fontWeight:600}}>sante</div>
    </div>
  );
}

// ===== CARTE SYNDICAT =====
function CarteSyndicat(p){
  var s=p.syndicat;
  var totalAlertes=s.alertesCE+s.alertesAss+s.alertesPAP+s.alertesCarnet;
  var totalSoldes=s.soldeOp+s.soldePrev+s.soldeAss;

  if(s.statut==="setup"){
    return(
      <div style={{background:T.surface,border:"2px dashed "+T.border,borderRadius:12,padding:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:200,cursor:"pointer"}} onClick={p.onSetup}>
        <div style={{width:44,height:44,borderRadius:"50%",background:T.accentL,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
          <span style={{fontSize:22,color:T.accent,fontWeight:300,lineHeight:1}}>+</span>
        </div>
        <div style={{fontSize:13,fontWeight:600,color:T.accent,marginBottom:4}}>{s.nom}</div>
        <div style={{fontSize:11,color:T.muted,textAlign:"center"}}>Cliquez pour configurer ce syndicat</div>
      </div>
    );
  }

  return(
    <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,cursor:"pointer",transition:"box-shadow 0.1s"}} onClick={p.onClick}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <div style={{fontSize:9,fontWeight:800,color:"#fff",background:T.navy,padding:"2px 7px",borderRadius:4,letterSpacing:"0.05em"}}>{s.code}</div>
            <Bdg bg={T.accentL} c={T.accent}>{s.statut==="actif"?"Actif":"Inactif"}</Bdg>
          </div>
          <div style={{fontSize:14,fontWeight:700,color:T.navy}}>{s.nom}</div>
          <div style={{fontSize:10,color:T.muted,marginTop:2}}>{s.nbUnites} unites | {s.adr.split(",")[1]||""}</div>
        </div>
        <ScoreGlobal s={s}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <div style={{background:T.accentL,borderRadius:8,padding:"8px 10px"}}>
          <div style={{fontSize:9,color:T.accent,fontWeight:600,marginBottom:2}}>COTISATIONS/MOIS</div>
          <div style={{fontSize:13,fontWeight:700,color:T.accent}}>{money(s.cotisationMensuelle)}</div>
        </div>
        <div style={{background:T.blueL,borderRadius:8,padding:"8px 10px"}}>
          <div style={{fontSize:9,color:T.blue,fontWeight:600,marginBottom:2}}>SOLDE TOTAL</div>
          <div style={{fontSize:13,fontWeight:700,color:T.blue}}>{money(totalSoldes)}</div>
        </div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {totalAlertes>0&&<Bdg bg={T.redL} c={T.red}>{totalAlertes} alerte(s)</Bdg>}
        {s.facturesEnAttente>0&&<Bdg bg={T.amberL} c={T.amber}>{s.facturesEnAttente} facture(s)</Bdg>}
        {s.prochReunion&&<Bdg bg={T.purpleL} c={T.purple}>CA: {s.prochReunion}</Bdg>}
      </div>

      <div style={{display:"grid",gap:5}}>
        <ScoreBarre l="Financier" v={s.scoreFinancier}/>
        <ScoreBarre l="Conformite" v={s.scoreConformite}/>
        <ScoreBarre l="Entretien" v={s.scoreEntretien}/>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10,paddingTop:8,borderTop:"1px solid "+T.border}}>
        <div style={{fontSize:10,color:T.muted}}>{s.gestionnaire||"-"}</div>
        <div style={{fontSize:10,color:T.muted}}>{s.nbCoprosPortail} portail(s) actif(s)</div>
      </div>
    </div>
  );
}

// ===== VUE DETAIL SYNDICAT =====
function DetailSyndicat(p){
  var s=p.syndicat;
  var totalSoldes=s.soldeOp+s.soldePrev+s.soldeAss;
  var totalAlertes=s.alertesCE+s.alertesAss+s.alertesPAP+s.alertesCarnet;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:10,fontWeight:800,color:"#fff",background:T.navy,padding:"3px 9px",borderRadius:5}}>{s.code}</div>
            <Bdg bg={T.accentL} c={T.accent}>{s.statut}</Bdg>
          </div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>{s.nom}</div>
          <div style={{fontSize:12,color:T.muted}}>{s.adr}</div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn sm bg={T.purple} tc={"#fff"} onClick={p.onParams}>Parametres</Btn><Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={p.onRetour}>Retour</Btn></div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[
          {l:"Unites",v:s.nbUnites,c:T.navy,bg:T.blueL},
          {l:"Cotisations/mois",v:money(s.cotisationMensuelle),c:T.accent,bg:T.accentL},
          {l:"Solde total",v:money(totalSoldes),c:T.blue,bg:T.blueL},
          {l:"Alertes totales",v:totalAlertes,c:totalAlertes>0?T.red:T.accent,bg:totalAlertes>0?T.redL:T.accentL},
        ].map(function(st,i){return(
          <div key={i} style={{background:st.bg,borderRadius:10,padding:"11px 13px",border:"1px solid "+st.c+"33"}}>
            <div style={{fontSize:9,color:st.c,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{st.l}</div>
            <div style={{fontSize:17,fontWeight:800,color:st.c}}>{st.v}</div>
          </div>
        );})}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
          <Lbl l="Informations generales"/>
          {[
            {l:"President",v:s.president||"-"},
            {l:"Courriel",v:s.courriel||"-"},
            {l:"Telephone",v:s.tel||"-"},
            {l:"Immatriculation",v:s.immat||"-"},
            {l:"Annee construction",v:s.anneeConstruction||"-"},
            {l:"Exercice financier",v:s.exercice||"-"},
            {l:"Gestionnaire Predictek",v:s.gestionnaire||"-"},
          ].map(function(item,i){return(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+T.border}}>
              <span style={{fontSize:11,color:T.muted}}>{item.l}</span>
              <span style={{fontSize:12,fontWeight:500,color:T.text,textAlign:"right",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis"}}>{item.v}</span>
            </div>
          );})}
        </div>

        <div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:12}}>
            <Lbl l="Score de sante"/>
            <div style={{display:"grid",gap:10,marginTop:8}}>
              <ScoreBarre l="Financier" v={s.scoreFinancier}/>
              <ScoreBarre l="Conformite coproprietaires" v={s.scoreConformite}/>
              <ScoreBarre l="Entretien (Loi 16)" v={s.scoreEntretien}/>
            </div>
          </div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
            <Lbl l="Comptes bancaires"/>
            {[
              {l:"Compte operation",v:s.soldeOp},
              {l:"Fonds prevoyance",v:s.soldePrev},
              {l:"Fonds assurance",v:s.soldeAss},
            ].map(function(c,i){return(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<2?"1px solid "+T.border:"none"}}>
                <span style={{fontSize:11,color:T.muted}}>{c.l}</span>
                <span style={{fontSize:12,fontWeight:600,color:T.accent}}>{money(c.v)}</span>
              </div>
            );})}
            <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,marginTop:4,borderTop:"2px solid "+T.border}}>
              <span style={{fontSize:12,fontWeight:700,color:T.navy}}>Total</span>
              <span style={{fontSize:13,fontWeight:800,color:T.navy}}>{money(totalSoldes)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {l:"CE expire",v:s.alertesCE,c:s.alertesCE>0?T.red:T.accent,bg:s.alertesCE>0?T.redL:T.accentL},
          {l:"Ass. expiree",v:s.alertesAss,c:s.alertesAss>0?T.red:T.accent,bg:s.alertesAss>0?T.redL:T.accentL},
          {l:"PAP manquant",v:s.alertesPAP,c:s.alertesPAP>0?T.amber:T.accent,bg:s.alertesPAP>0?T.amberL:T.accentL},
          {l:"Carnet entretien",v:s.alertesCarnet,c:s.alertesCarnet>0?T.amber:T.accent,bg:s.alertesCarnet>0?T.amberL:T.accentL},
        ].map(function(al,i){return(
          <div key={i} style={{background:al.bg,borderRadius:9,padding:"10px 12px",border:"1px solid "+al.c+"33",textAlign:"center"}}>
            <div style={{fontSize:9,color:al.c,fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>{al.l}</div>
            <div style={{fontSize:22,fontWeight:800,color:al.c}}>{al.v}</div>
          </div>
        );})}
      </div>
    </div>
  );
}

// ===== CREATION SYNDICAT =====
function CreerSyndicat(p){
  var s0=useState(1);var etape=s0[0];var setEtape=s0[1];
  var s1=useState({nom:"",code:"",adr:"",president:"",courriel:"",tel:"",immat:"",anneeConstruction:"",nbUnites:"",exercice:"1 nov au 31 oct",gestionnaire:""});
  var form=s1[0];var setForm=s1[1];
  var s2=useState("");var importMsg=s2[0];var setImportMsg=s2[1];
  var s3=useState(0);var nbImport=s3[0];var setNbImport=s3[1];
  function sf(k,v){setForm(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  function parseCSV(text){
    var lines=text.trim().split("");
    if(lines.length<2)return 0;
    return lines.length-1;
  }

  function handleCSV(e){
    var file=e.target.files[0];
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      var nb=parseCSV(ev.target.result);
      if(nb>0){setNbImport(nb);setImportMsg(nb+" coproprietaires detectes dans le fichier CSV");}
      else{setImportMsg("Erreur: format CSV invalide");}
    };
    reader.readAsText(file);
  }

  var ETAPES=["Informations","Registre","Confirmation"];

  return(
    <div style={{maxWidth:600,margin:"0 auto"}}>
      <div style={{display:"flex",gap:0,marginBottom:24,background:T.alt,borderRadius:10,padding:4}}>
        {ETAPES.map(function(et,i){var a=etape===i+1;var done=etape>i+1;return(
          <div key={i} style={{flex:1,textAlign:"center",padding:"8px",borderRadius:8,background:a?T.navy:done?T.accentL:"transparent"}}>
            <div style={{fontSize:11,fontWeight:a||done?700:400,color:a?"#fff":done?T.accent:T.muted}}>{i+1}. {et}</div>
          </div>
        );})}
      </div>

      {etape===1&&(
        <div>
          <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:16}}>Informations du syndicat</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <FRow l="Nom du syndicat" full><input value={form.nom} onChange={function(e){sf("nom",e.target.value);}} style={INP} placeholder="ex: Syndicat Les Erables"/></FRow>
            <FRow l="Code (4 lettres)"><input value={form.code} onChange={function(e){sf("code",e.target.value.toUpperCase().slice(0,4));}} style={INP} placeholder="ERAB" maxLength={4}/></FRow>
            <FRow l="Annee construction"><input type="number" value={form.anneeConstruction} onChange={function(e){sf("anneeConstruction",e.target.value);}} style={INP} placeholder="2013"/></FRow>
            <FRow l="Adresse" full><input value={form.adr} onChange={function(e){sf("adr",e.target.value);}} style={INP} placeholder="123 rue des Erables, Quebec QC"/></FRow>
            <FRow l="Immatriculation"><input value={form.immat} onChange={function(e){sf("immat",e.target.value);}} style={INP} placeholder="1144524577"/></FRow>
            <FRow l="Exercice financier">
              <select value={form.exercice} onChange={function(e){sf("exercice",e.target.value);}} style={INP}>
                <option value="1 nov au 31 oct">1 nov au 31 oct</option>
                <option value="1 jan au 31 dec">1 jan au 31 dec</option>
                <option value="1 avr au 31 mars">1 avr au 31 mars</option>
              </select>
            </FRow>
            <FRow l="Nom du president"><input value={form.president} onChange={function(e){sf("president",e.target.value);}} style={INP}/></FRow>
            <FRow l="Courriel president"><input value={form.courriel} onChange={function(e){sf("courriel",e.target.value);}} style={INP}/></FRow>
            <FRow l="Telephone"><input value={form.tel} onChange={function(e){sf("tel",e.target.value);}} style={INP}/></FRow>
            <FRow l="Gestionnaire Predictek"><input value={form.gestionnaire} onChange={function(e){sf("gestionnaire",e.target.value);}} style={INP}/></FRow>
          </div>
          <Btn onClick={function(){if(form.nom&&form.code)setEtape(2);}}>Continuer</Btn>
        </div>
      )}

      {etape===2&&(
        <div>
          <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:8}}>Importer le registre des coproprietaires</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Importez votre fichier Excel/CSV avec les informations des coproprietaires. Ce n est pas obligatoire - vous pouvez les ajouter manuellement plus tard.</div>
          <div style={{background:T.blueL,borderRadius:10,padding:14,marginBottom:16,border:"1px solid "+T.blue+"44"}}>
            <div style={{fontSize:12,fontWeight:600,color:T.blue,marginBottom:8}}>Format CSV attendu (colonnes):</div>
            <div style={{fontSize:11,color:T.blue,fontFamily:"monospace",lineHeight:1.8}}>
              Unite | Prenom | Nom | Courriel | Telephone | Fraction % | Cotisation | PAP (Oui/Non) | CE expiry | Assurance expiry
            </div>
          </div>
          <div style={{border:"2px dashed "+T.border,borderRadius:10,padding:30,textAlign:"center",marginBottom:14,background:T.alt,cursor:"pointer"}} onClick={function(){document.getElementById("csvCreer").click();}}>
            <div style={{fontSize:24,marginBottom:8,color:T.muted}}>CSV</div>
            <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:4}}>Cliquez pour selectionner votre fichier</div>
            <div style={{fontSize:11,color:T.muted}}>Formats acceptes: .csv, .txt</div>
            <input id="csvCreer" type="file" accept=".xlsx,.csv,.txt" onChange={handleCSV} style={{display:"none"}}/>
          </div>
          {importMsg&&(
            <div style={{background:importMsg.includes("Erreur")?T.redL:T.accentL,color:importMsg.includes("Erreur")?T.red:T.accent,borderRadius:8,padding:"9px 13px",fontSize:12,marginBottom:14}}>{importMsg}</div>
          )}
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={function(){setEtape(3);}}>Continuer{nbImport>0?" ("+nbImport+" copros)":""}</Btn>
            <Btn onClick={function(){setEtape(1);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Retour</Btn>
          </div>
        </div>
      )}

      {etape===3&&({syndicats&&syndicats.length>1&&(<div style={{marginBottom:14}}><div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:6}}>Syndicat cible</div><select value={selId||""} onChange={function(e){setSelId(e.target.value);}} style={{width:"100%",border:"1px solid "+T.border,borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit"}}><option value="">Selectionnez un syndicat...</option>{syndicats.map(function(s){return(<option key={s.id} value={s.id}>{s.nom}</option>);})}</select></div>)}
        <div>
          <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:16}}>Confirmation</div>
          <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:10,padding:16,marginBottom:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {l:"Nom",v:form.nom},{l:"Code",v:form.code},
                {l:"President",v:form.president||"-"},{l:"Immatriculation",v:form.immat||"-"},
                {l:"Exercice",v:form.exercice},{l:"Gestionnaire",v:form.gestionnaire||"-"},
                {l:"Adresse",v:form.adr||"-"},{l:"Coproprietaires CSV",v:nbImport>0?nbImport+" detectes":"A ajouter manuellement"},
              ].map(function(item,i){return(
                <div key={i}>
                  <div style={{fontSize:9,color:T.accent,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{item.l}</div>
                  <div style={{fontSize:12,fontWeight:600,color:T.text}}>{item.v}</div>
                </div>
              );})}
            </div>
          </div>
          <div style={{background:T.amberL,borderRadius:8,padding:"9px 13px",fontSize:11,color:T.amber,marginBottom:16}}>
            Apres la creation, le syndicat sera actif dans Predictek. Vous pourrez configurer les comptes bancaires, le budget et le carnet d entretien dans le Portail du CA.
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={function(){
              var nouveau=Object.assign({},form,{
                id:Date.now(),nbUnites:nbImport||0,cotisationMensuelle:0,
                soldeOp:0,soldePrev:0,soldeAss:0,alertesCE:0,alertesAss:0,
                alertesPAP:0,alertesCarnet:0,facturesEnAttente:0,montantFactures:0,
                prochReunion:"",statut:"actif",scoreFinancier:50,
                scoreConformite:50,scoreEntretien:50,nbCoprosPortail:0,
                dernierRapport:"",anneeConstruction:parseInt(form.anneeConstruction)||0,
                nbUnites:nbImport||0,
              });
              p.onCreer(nouveau);
            }}>Creer le syndicat</Btn>
            <Btn onClick={function(){setEtape(2);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Retour</Btn>
            <Btn onClick={p.onAnnuler} bg={T.redL} tc={T.red} bdr={"1px solid "+T.red}>Annuler</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== GESTION USAGERS PREDICTEK =====
function GestionUsagers(p){
  var s0=useState(USAGERS_INIT);var usagers=s0[0];var setUsagers=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({});var nf=s2[0];var setNf=s2[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  var ROLES=["Admin","Gestionnaire","Terrain","Lecture seule"];
  var CODES=p.syndicats.filter(function(s){return s.statut==="actif";}).map(function(s){return s.code;});

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <b style={{fontSize:13,color:T.navy}}>Usagers Predictek</b>
        <Btn sm onClick={function(){setNf({nom:"",courriel:"",role:"Gestionnaire",syndicats:[],actif:true});setShowN(true);}}>+ Nouvel usager</Btn>
      </div>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:T.navy}}>
              {["Nom","Courriel","Role","Syndicats","Statut","Derniere connexion","Action"].map(function(h){return <th key={h} style={{padding:"7px 12px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>;})}
            </tr>
          </thead>
          <tbody>
            {usagers.map(function(u){return(
              <tr key={u.id} style={{borderBottom:"1px solid "+T.border,background:u.actif?T.surface:T.alt}}>
                <td style={{padding:"9px 12px",fontSize:12,fontWeight:600,color:T.text}}>{u.nom}</td>
                <td style={{padding:"9px 12px",fontSize:11,color:T.muted}}>{u.courriel}</td>
                <td style={{padding:"9px 12px"}}>
                  <Bdg bg={u.role==="Admin"?T.purpleL:u.role==="Gestionnaire"?T.blueL:T.accentL} c={u.role==="Admin"?T.purple:u.role==="Gestionnaire"?T.blue:T.accent}>{u.role}</Bdg>
                </td>
                <td style={{padding:"9px 12px"}}>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {u.syndicats.map(function(code){return <Bdg key={code} bg={T.alt} c={T.muted}>{code}</Bdg>;})}
                    {u.syndicats.length===0&&<span style={{fontSize:10,color:T.muted}}>Aucun</span>}
                  </div>
                </td>
                <td style={{padding:"9px 12px"}}><Bdg bg={u.actif?T.accentL:T.redL} c={u.actif?T.accent:T.red}>{u.actif?"Actif":"Inactif"}</Bdg></td>
                <td style={{padding:"9px 12px",fontSize:11,color:T.muted}}>{u.derniereConnexion||"-"}</td>
                <td style={{padding:"9px 12px"}}>
                  <Btn sm bg={u.actif?T.redL:T.accentL} tc={u.actif?T.red:T.accent} bdr={"1px solid "+(u.actif?T.red:T.accent)} onClick={function(){setUsagers(function(prev){return prev.map(function(x){return x.id===u.id?Object.assign({},x,{actif:!x.actif}):x;});});}}>
                    {u.actif?"Desactiver":"Reactiver"}
                  </Btn>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouvel usager Predictek" w={500}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <FRow l="Nom complet" full><input value={nf.nom||""} onChange={function(e){snf("nom",e.target.value);}} style={INP}/></FRow>
          <FRow l="Courriel" full><input value={nf.courriel||""} onChange={function(e){snf("courriel",e.target.value);}} style={INP}/></FRow>
          <FRow l="Role" full>
            <select value={nf.role||"Gestionnaire"} onChange={function(e){snf("role",e.target.value);}} style={INP}>
              {ROLES.map(function(r){return <option key={r} value={r}>{r}</option>;})}
            </select>
          </FRow>
          <FRow l="Acces aux syndicats" full>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
              {CODES.map(function(code){var sel=(nf.syndicats||[]).includes(code);return(
                <button key={code} onClick={function(){var cur=nf.syndicats||[];snf("syndicats",sel?cur.filter(function(c){return c!==code;}):cur.concat([code]));}} style={{padding:"4px 10px",border:"1px solid "+(sel?T.accent:T.border),borderRadius:20,background:sel?T.accentL:T.surface,color:sel?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:sel?600:400}}>{code}</button>
              );})}
            </div>
          </FRow>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){
            if(!nf.nom||!nf.courriel)return;
            setUsagers(function(prev){return prev.concat([Object.assign({},nf,{id:Date.now(),actif:true,derniereConnexion:""})]);});
            setShowN(false);
          }}>Creer l usager</Btn>
          <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}

function CardTitle(p){return <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:4}}>{p.children}</div>;}
function CardSub(p){return <div style={{fontSize:11,color:T.muted,marginBottom:16}}>{p.children}</div>;}
function Tag(p){return <span style={{display:"inline-flex",alignItems:"center",gap:6,background:T.alt,borderRadius:20,padding:"3px 10px",fontSize:11,color:T.text,margin:"2px"}}>{p.children}<button onClick={p.onRemove} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:13,lineHeight:1,padding:0}}>x</button></span>;}
function Toggle(p){return(
  <button onClick={p.onClick} style={{width:44,height:24,borderRadius:12,background:p.on?T.accent:T.border,border:"none",cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
    <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:p.on?23:3,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
  </button>
);}

var PARAMS_DEFAUT={
  // Identite
  nom:"Syndicat Piedmont",
  adr:"Chemin du Hibou",
  ville:"Stoneham-et-Tewkesbury",
  province:"QC",
  codePostal:"G3C 1T1",
  immat:"1144524577",
  exercice:"1 nov au 31 oct",
  anneeConstruction:"2013",
  nbUnites:"36",
  // CA
  nbMembresCA:5,
  president:"Jean-Francois Laroche",
  secretaire:"Maryse Fredette",
  tresorier:"Claude Pinard",
  membresCA:["Jean-Francois Laroche","Maryse Fredette","Claude Pinard","Robert Donnelly","Emile Poulin"],
  // Courriels
  courrielCA:"ca@syndicatpiedmont.com",
  courrielFacturesFournisseurs:"factures@syndicatpiedmont.com",
  courrielCoproprietaires:"info@syndicatpiedmont.com",
  courrielUrgences:"urgence@syndicatpiedmont.com",
  courrielComptabilite:"comptabilite@predictek.com",
  // Traitement auto
  autoFacturesFournisseurs:true,
  autoNotifCA:true,
  autoNotifCopros:true,
  autoRappelsCotisations:true,
  autoAlertesConformite:true,
  // Quorum
  quorumCA:"majorite",
  quorumAGO:25,
  // Documents
  documents:[
    {id:1,nom:"Declaration de copropriete",type:"declaration",date:"2013-09-01",taille:"2.4 MB",dispo:true},
    {id:2,nom:"Reglement de l immeuble",type:"reglement",date:"2023-01-15",taille:"850 KB",dispo:true},
    {id:3,nom:"Reglement 2024-001 - Animaux",type:"reglement",date:"2024-03-20",taille:"120 KB",dispo:true},
    {id:4,nom:"Reglement 2024-002 - Stationnement",type:"reglement",date:"2024-06-15",taille:"95 KB",dispo:false},
  ],
};

function ParamsSyndicat(p){
  var syndicat = p.syndicat || "PIED";
  var s0=useState(PARAMS_DEFAUT);var params=s0[0];var setParams=s0[1];
  var s1=useState("identite");var ong=s1[0];var setOng=s1[1];
  var s2=useState("");var newMembre=s2[0];var setNewMembre=s2[1];
  var s3=useState("");var newCourrielInput=s3[0];var setNewCourrielInput=s3[1];
  var s4=useState("");var savedMsg=s4[0];var setSavedMsg=s4[1];
  var s5=useState(false);var showUpload=s5[0];var setShowUpload=s5[1];
  var s6=useState({nom:"",type:"declaration",dispo:true});var uploadForm=s6[0];var setUploadForm=s6[1];
  var s7=useState(false);var iaLoading=s7[0];var setIaLoading=s7[1];
  var s8=useState("");var iaError=s8[0];var setIaError=s8[1];
  var s9=useState("");var iaSuccess=s9[0];var setIaSuccess=s9[1];

  function extraireIA(){
    if(iaLoading)return;
    setIaLoading(true);setIaError("");setIaSuccess("");
    var files=[];
    if(window._reqFile)files.push({b:window._reqFile,t:"REQ"});
    if(window._acteFile)files.push({b:window._acteFile,t:"Acte"});
    if(files.length===0){setIaLoading(false);setIaError("Selectionnez un PDF REQ ou declaration.");return;}
    Promise.all(files.map(function(item){
      return new Promise(function(resolve){
        var r=new FileReader();
        r.onload=function(ev){resolve({b64:ev.target.result.split(",")[1],t:item.t});};
        r.readAsDataURL(item.b);
      });
    })).then(function(docs){
      return fetch("/api/extract",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({docs:docs})});
    }).then(function(r){
      if(r.status===413){setIaError("PDF trop volumineux - utilisez un fichier de moins de 20MB.");setIaLoading(false);throw "413";}
      return r.json();
    }).then(function(resp){
      if(!resp)return;
      if(resp.error){setIaError("Erreur: "+resp.error);setIaLoading(false);return;}
      if(!resp.ok){setIaError("Erreur serveur.");setIaLoading(false);return;}
      try{
        var ex=resp.data;
        if(ex.nom)sd("nom",ex.nom);
        if(ex.immat)sd("immat",ex.immat);
        if(ex.adr)sd("adr",ex.adr);
        if(ex.ville)sd("ville",ex.ville);
        if(ex.province&&ex.province.length===2)sd("province",ex.province);
        if(ex.codePostal)sd("codePostal",ex.codePostal);
        if(ex.nbUnites&&parseInt(ex.nbUnites)>0)sd("nbUnites",parseInt(ex.nbUnites));
        if(ex.gestionnaire)sd("gestionnaire",ex.gestionnaire);
        var n=Object.values(ex).filter(function(v){return v&&v!==""&&v!==0;}).length;
        setIaSuccess(n+" champs extraits - verifiez et completez si necessaire");
      }catch(e){setIaError("Reponse IA non lisible. Remplissez les champs manuellement.");}
      setIaLoading(false);
    }).catch(function(e){setIaError("Erreur: "+e.message);setIaLoading(false);});
  }

  var s7=useState(false);var iaLoading=s7[0];var setIaLoading=s7[1];
  var s8=useState("");var iaError=s8[0];var setIaError=s8[1];
  var s9=useState("");var iaSuccess=s9[0];var setIaSuccess=s9[1];

  function handleDoc(e){
    var file=e.target.files[0];
    if(!file)return;
    var newDoc={id:Date.now(),nom:uploadForm.nom||file.name,type:uploadForm.type,date:new Date().toISOString().slice(0,10),taille:file.size>1048576?(file.size/1048576).toFixed(1)+" MB":(file.size/1024).toFixed(0)+" KB",dispo:uploadForm.dispo};
    sp("documents",params.documents.concat([newDoc]));
    setShowUpload(false);
    setSavedMsg("Document ajoute: "+newDoc.nom);
    setTimeout(function(){setSavedMsg("");},3000);
  }

  var TABS=[
    {id:"identite",l:"Identite syndicat"},
    {id:"ca",l:"Conseil d administration"},
    {id:"courriels",l:"Courriels et automatisation"},
    {id:"documents",l:"Documents officiels"},
  ];

  var TYPE_DOC={declaration:{l:"Declaration",bg:T.purpleL,c:T.purple},reglement:{l:"Reglement",bg:T.blueL,c:T.blue},police:{l:"Assurance",bg:T.amberL,c:T.amber},financier:{l:"Financier",bg:T.accentL,c:T.accent},autre:{l:"Autre",bg:T.alt,c:T.muted}};

  return(
    <div style={{padding:20,fontFamily:"Georgia,serif",maxWidth:860,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Parametres - {params.nom}</div>
          <div style={{fontSize:11,color:T.muted}}>Configuration du syndicat | Code: {syndicat}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {savedMsg&&<Bdg bg={T.accentL} c={T.accent}>{savedMsg}</Bdg>}
          <Btn onClick={sauvegarder}>Sauvegarder</Btn>
        </div>
      </div>

      <div style={{display:"flex",gap:3,marginBottom:20,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {TABS.map(function(t){var a=ong===t.id;return(
          <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"7px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t.l}</button>
        );})}
      </div>

      {ong==="identite"&&(
        <div>
          <Card>
            <CardTitle>Informations generales</CardTitle>
            <CardSub>Informations de base du syndicat telles qu inscrites au Registre foncier</CardSub>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Nom du syndicat"/><input value={params.nom} onChange={function(e){sp("nom",e.target.value);}} style={INP}/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Adresse du syndicat"/><input value={params.adr} onChange={function(e){sp("adr",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Ville"/><input value={params.ville} onChange={function(e){sp("ville",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Province"/><input value={params.province} onChange={function(e){sp("province",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Code postal"/><input value={params.codePostal} onChange={function(e){sp("codePostal",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Immatriculation REQ"/><input value={params.immat} onChange={function(e){sp("immat",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Annee de construction"/><input value={params.anneeConstruction} onChange={function(e){sp("anneeConstruction",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Nombre d unites"/><input type="number" value={params.nbUnites} onChange={function(e){sp("nbUnites",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Exercice financier"/>
                <select value={params.exercice} onChange={function(e){sp("exercice",e.target.value);}} style={INP}>
                  <option value="1 nov au 31 oct">1 nov au 31 oct</option>
                  <option value="1 jan au 31 dec">1 jan au 31 dec</option>
                  <option value="1 avr au 31 mars">1 avr au 31 mars</option>
                  <option value="1 juil au 30 juin">1 juil au 30 juin</option>
                </select>
              </div>
            </div>
          </Card>
          <Card>
            <CardTitle>Quorum</CardTitle>
            <CardSub>Regles de quorum selon la declaration de copropriete</CardSub>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <Lbl l="Quorum reunion CA"/>
                <select value={params.quorumCA} onChange={function(e){sp("quorumCA",e.target.value);}} style={INP}>
                  <option value="majorite">Majorite simple (50%+1)</option>
                  <option value="2tiers">Deux tiers (66.7%)</option>
                  <option value="tous">Unanimite</option>
                </select>
              </div>
              <div>
                <Lbl l="Quorum AGO (% des voix)"/>
                <input type="number" min="10" max="75" value={params.quorumAGO} onChange={function(e){sp("quorumAGO",parseInt(e.target.value)||25);}} style={INP}/>
                <div style={{fontSize:10,color:T.muted,marginTop:3}}>Minimum requis pour tenir l assemblee</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {ong==="ca"&&(
        <div>
          <Card>
            <CardTitle>Composition du conseil d administration</CardTitle>
            <CardSub>Selon la declaration de copropriete - le nombre de membres doit etre impair (3, 5, 7 ou 9)</CardSub>
            <div style={{marginBottom:16}}>
              <Lbl l="Nombre de membres du CA"/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[3,5,7,9].map(function(n){var a=params.nbMembresCA===n;return(
                  <button key={n} onClick={function(){sp("nbMembresCA",n);}} style={{width:60,height:60,borderRadius:10,border:"2px solid "+(a?T.accent:T.border),background:a?T.accentL:T.surface,color:a?T.accent:T.muted,fontSize:20,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{n}</button>
                );})}
              </div>
              <div style={{fontSize:11,color:T.muted,marginTop:8}}>Actuellement: {params.nbMembresCA} membres | Quorum CA: {Math.ceil(params.nbMembresCA/2)} presents requis</div>
            </div>
          </Card>
          <Card>
            <CardTitle>Membres du CA</CardTitle>
            <CardSub>Noms des administrateurs selon la derniere election</CardSub>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div><Lbl l="President"/><input value={params.president} onChange={function(e){sp("president",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Secretaire"/><input value={params.secretaire} onChange={function(e){sp("secretaire",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Tresorier"/><input value={params.tresorier} onChange={function(e){sp("tresorier",e.target.value);}} style={INP}/></div>
            </div>
            <Lbl l="Tous les membres du CA"/>
            <div style={{marginBottom:10,minHeight:36,background:T.alt,borderRadius:8,padding:"6px 8px",display:"flex",flexWrap:"wrap"}}>
              {params.membresCA.map(function(m,i){return(
                <Tag key={i} onRemove={function(){sp("membresCA",params.membresCA.filter(function(_,j){return j!==i;}));}}>
                  {m}
                </Tag>
              );})}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={newMembre} onChange={function(e){setNewMembre(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&newMembre.trim()){sp("membresCA",params.membresCA.concat([newMembre.trim()]));setNewMembre("");}}} placeholder="Ajouter un membre..." style={Object.assign({},INP,{flex:1})}/>
              <Btn sm onClick={function(){if(newMembre.trim()){sp("membresCA",params.membresCA.concat([newMembre.trim()]));setNewMembre("");}}}> Ajouter</Btn>
            </div>
            {params.membresCA.length>params.nbMembresCA&&(
              <div style={{background:T.amberL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.amber,marginTop:10}}>
                Attention: {params.membresCA.length} membres listes mais le CA est configure pour {params.nbMembresCA} membres.
              </div>
            )}
            {params.membresCA.length<params.nbMembresCA&&(
              <div style={{background:T.redL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.red,marginTop:10}}>
                Poste(s) vacant(s): {params.nbMembresCA-params.membresCA.length} poste(s) a combler.
              </div>
            )}
          </Card>
        </div>
      )}

      {ong==="courriels"&&(
        <div>
          <Card>
            <CardTitle>Adresses courriel du syndicat</CardTitle>
            <CardSub>Ces adresses sont utilisees pour les communications automatiques et la reception des factures</CardSub>
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:12}}>
              {[
                {k:"courrielCA",l:"Courriel du CA (notifications, PV, reunions)",ph:"ca@syndicat.com",desc:"Recoit les convocations, PV et alertes destinees aux administrateurs"},
                {k:"courrielFacturesFournisseurs",l:"Courriel reception factures fournisseurs",ph:"factures@syndicat.com",desc:"Les fournisseurs envoient leurs factures a cette adresse pour traitement automatique"},
                {k:"courrielCoproprietaires",l:"Courriel communications coproprietaires",ph:"info@syndicat.com",desc:"Adresse de contact general pour les coproprietaires"},
                {k:"courrielUrgences",l:"Courriel urgences 24/7",ph:"urgence@syndicat.com",desc:"Notifie immediatement le CA en cas d urgence"},
                {k:"courrielComptabilite",l:"Courriel comptabilite Predictek",ph:"comptabilite@predictek.com",desc:"Recoit les factures Predictek et les rapports financiers"},
              ].map(function(item){return(
                <div key={item.k} style={{background:T.alt,borderRadius:10,padding:14}}>
                  <Lbl l={item.l}/>
                  <input value={params[item.k]||""} onChange={function(e){sp(item.k,e.target.value);}} placeholder={item.ph} style={INP}/>
                  <div style={{fontSize:10,color:T.muted,marginTop:5}}>{item.desc}</div>
                </div>
              );})}
            </div>
          </Card>

          <Card>
            <CardTitle>Automatisation des communications</CardTitle>
            <CardSub>Activez ou desactivez les envois automatiques pour ce syndicat</CardSub>
            <div style={{display:"grid",gap:0}}>
              {[
                {k:"autoFacturesFournisseurs",l:"Reception et traitement automatique des factures fournisseurs",desc:"Les factures recues par courriel sont automatiquement creees dans le systeme et envoyees pour approbation au CA"},
                {k:"autoNotifCA",l:"Notifications automatiques au CA",desc:"Rappels de reunions, alertes de conformite, factures en attente"},
                {k:"autoNotifCopros",l:"Notifications automatiques aux coproprietaires",desc:"Avis de convocations, rappels cotisations, documents disponibles"},
                {k:"autoRappelsCotisations",l:"Rappels cotisations en retard",desc:"J+5, J+15, J+30 automatiquement"},
                {k:"autoAlertesConformite",l:"Alertes conformite automatiques",desc:"CE, assurance, PAP - 90 jours, 30 jours, 7 jours avant expiration"},
              ].map(function(item,i){return(
                <div key={item.k} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"14px 0",borderBottom:i<4?"1px solid "+T.border:"none"}}>
                  <div style={{flex:1,paddingRight:16}}>
                    <div style={{fontSize:13,fontWeight:500,color:T.text,marginBottom:3}}>{item.l}</div>
                    <div style={{fontSize:11,color:T.muted}}>{item.desc}</div>
                  </div>
                  <Toggle on={params[item.k]} onClick={function(){sp(item.k,!params[item.k]);}}/>
                </div>
              );})}
            </div>
            <div style={{marginTop:16,background:T.amberL,borderRadius:8,padding:"10px 14px",fontSize:11,color:T.amber}}>
              Note: Les envois reels par courriel necessitent la connexion Supabase + SendGrid (prochaine etape). En mode demo, les alertes s affichent dans le module Notifications.
            </div>
          </Card>
        </div>
      )}

      {ong==="documents"&&(
        <div>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <CardTitle>Documents officiels du syndicat</CardTitle>
                <CardSub style={{marginBottom:0}}>Declaration de copropriete, reglements votes, polices d assurance. Ces documents sont accessibles aux coproprietaires via leur portail.</CardSub>
              </div>
              <Btn sm onClick={function(){setUploadForm({nom:"",type:"declaration",dispo:true});setShowUpload(true);}}>+ Ajouter document</Btn>
            </div>

            <div style={{display:"grid",gap:10}}>
              {params.documents.map(function(doc,i){var tp=TYPE_DOC[doc.type]||TYPE_DOC.autre;return(
                <div key={doc.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:T.alt,borderRadius:10,padding:"12px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:40,height:40,borderRadius:8,background:tp.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:9,fontWeight:800,color:tp.c}}>PDF</span>
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:T.text}}>{doc.nom}</div>
                      <div style={{fontSize:10,color:T.muted}}>{doc.date} | {doc.taille}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <Bdg bg={tp.bg} c={tp.c}>{tp.l}</Bdg>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:10,color:T.muted}}>Copros:</span>
                      <Toggle on={doc.dispo} onClick={function(){sp("documents",params.documents.map(function(d,j){return j===i?Object.assign({},d,{dispo:!d.dispo}):d;}));}}/>
                    </div>
                    <Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red} onClick={function(){sp("documents",params.documents.filter(function(_,j){return j!==i;}));}}>Retirer</Btn>
                  </div>
                </div>
              );})}
              {params.documents.length===0&&(
                <div style={{textAlign:"center",padding:40,color:T.muted,fontSize:13}}>Aucun document. Ajoutez votre declaration de copropriete.</div>
              )}
            </div>

            <div style={{marginTop:16,background:T.blueL,borderRadius:8,padding:"10px 14px",fontSize:11,color:T.blue}}>
              Les documents marques "Copros: actif" apparaissent dans l onglet Documents du Portail Coproprietaire. Les coproprietaires peuvent les consulter mais pas les modifier.
            </div>
          </Card>

          {showUpload&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={function(e){if(e.target===e.currentTarget)setShowUpload(false);}}>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:24,width:480,maxWidth:"94vw"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <b style={{fontSize:14,color:T.text}}>Ajouter un document</b>
                  <button onClick={function(){setShowUpload(false);}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:T.muted,lineHeight:1}}>x</button>
                </div>
                <div style={{display:"grid",gap:12,marginBottom:14}}>
                  <div><Lbl l="Nom du document"/><input value={uploadForm.nom} onChange={function(e){setUploadForm(function(o){return Object.assign({},o,{nom:e.target.value});});}} placeholder="ex: Declaration de copropriete 2013" style={INP}/></div>
                  <div><Lbl l="Type de document"/>
                    <select value={uploadForm.type} onChange={function(e){setUploadForm(function(o){return Object.assign({},o,{type:e.target.value});});}} style={INP}>
                      <option value="declaration">Declaration de copropriete</option>
                      <option value="reglement">Reglement vote</option>
                      <option value="police">Police d assurance</option>
                      <option value="financier">Document financier</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:T.alt,borderRadius:8,padding:"10px 14px"}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:500}}>Visible aux coproprietaires</div>
                      <div style={{fontSize:10,color:T.muted}}>Disponible dans le Portail Coproprietaire</div>
                    </div>
                    <Toggle on={uploadForm.dispo} onClick={function(){setUploadForm(function(o){return Object.assign({},o,{dispo:!o.dispo});});}}/>
                  </div>
                  <div>
                    <Lbl l="Fichier (PDF recommande)"/>
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" id="docUpload" onChange={handleDoc} style={{width:"100%",border:"1px solid "+T.border,borderRadius:7,padding:8,fontFamily:"inherit",fontSize:12,boxSizing:"border-box"}}/>
                  </div>
                </div>
                <div style={{background:T.amberL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.amber,marginBottom:14}}>
                  Note: En mode demo, le fichier est enregistre localement. Avec Supabase, les documents seront stockes dans le nuage.
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Btn onClick={function(){document.getElementById("docUpload").click();}}>Selectionner et ajouter</Btn>
                  <Btn onClick={function(){setShowUpload(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function StepIndicator(p){
  var STEPS=["Syndicat","CA","Coproprietaires","Soldes","Documents","Carnet","Attestation","Confirmation"];
  return(
    <div style={{display:"flex",marginBottom:24,overflowX:"auto"}}>
      {STEPS.map(function(s,i){
        var done=p.step>i+1;var current=p.step===i+1;var future=p.step<i+1;
        return(
          <div key={i} style={{display:"flex",alignItems:"center",flexShrink:0}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:80}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:done?T.accent:current?T.navy:T.border,display:"flex",alignItems:"center",justifyContent:"center",color:done||current?"#fff":T.muted,fontSize:done?16:12,fontWeight:700,marginBottom:4}}>
                {done?"-":i+1}
              </div>
              <div style={{fontSize:9,fontWeight:current?700:400,color:current?T.navy:done?T.accent:T.muted,textAlign:"center",lineHeight:1.2}}>{s}</div>
            </div>
            {i<STEPS.length-1&&<div style={{width:24,height:2,background:done?T.accent:T.border,flexShrink:0,marginBottom:16}}/>}
          </div>
        );
      })}
    </div>
  );
}

// CSV Parser
function parseCSV(text){
  var lines=text.trim().split("");
  if(lines.length<2)return{ok:false,msg:"Fichier vide ou invalide",rows:[]};
  var headers=lines[0].split(",").map(function(h){return h.trim().replace(/"/g,"").toLowerCase();});var rows=[];var errors=[];for(var i=1;i<lines.length;i++){var cols=lines[i].split(",").map(function(c){return c.trim().replace(/"/g,"");});if(cols.length<3)continue;var row={};headers.forEach(function(h,j){row[h]=cols[j]||"";});
    // Normalize common field names
    var unite=row["unite"]||row["unit"]||row["no_unite"]||row["numero"]||"";
    var prenom=row["prenom"]||row["first_name"]||row["firstname"]||"";
    var nom=row["nom"]||row["last_name"]||row["lastname"]||row["name"]||"";
    var courriel=row["courriel"]||row["email"]||row["e-mail"]||"";
    var tel=row["tel"]||row["telephone"]||row["phone"]||"";
    var fraction=parseFloat(row["fraction"]||row["quote_part"]||row["quotient"]||row["quotepart"]||"0")||0;
    var cadastre=row["cadastre"]||row["no_cadastre"]||row["numero_cadastre"]||"";
    var quotePart=parseFloat(row["quote_part"]||row["quotepart"]||row["quote part"]||row["fraction"]||"0")||0;
    var cotisation=parseFloat(row["cotisation"]||row["mensualite"]||row["contribution"]||"0")||0;
    if(!unite){errors.push("Ligne "+(i+1)+": numero d unite manquant");continue;}
    rows.push({unite:unite,prenom:prenom,nom:nom,courriel:courriel,tel:tel,fraction:fraction,quotePart:quotePart,cadastre:cadastre,cotisation:cotisation,pap:false,ce:"",ass:"",loc:false,animaux:0});
  }
  return{ok:rows.length>0,msg:rows.length+" coproprietaires importes"+(errors.length>0?" ("+errors.length+" erreurs)":""),rows:rows,errors:errors};
}

// COMPOSANTES CARNET (Loi 16)
var COMPOSANTES_LOI16=[
  {cat:"Structure",nom:"Fondations et structure principale",dureeVie:50,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Structure",nom:"Balcons et terrasses",dureeVie:30,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Enveloppe",nom:"Toiture - membrane et structure",dureeVie:25,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Enveloppe",nom:"Fenetres et portes exterieures - parties communes",dureeVie:30,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Enveloppe",nom:"Revetement exterieur",dureeVie:30,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Mecanique",nom:"Systeme de chauffage - parties communes",dureeVie:20,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Mecanique",nom:"Systeme de ventilation - parties communes",dureeVie:20,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Mecanique",nom:"Tuyauterie et plomberie - parties communes",dureeVie:40,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Mecanique",nom:"Systeme electrique - parties communes",dureeVie:40,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Mecanique",nom:"Ascenseur(s)",dureeVie:25,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
  {cat:"Securite",nom:"Systeme de detection incendie",dureeVie:15,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Securite",nom:"Systeme de gicleurs",dureeVie:25,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
  {cat:"Securite",nom:"Systeme d acces et interphone",dureeVie:15,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
  {cat:"Amenagements",nom:"Stationnement - surface et structure",dureeVie:20,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
  {cat:"Amenagements",nom:"Paysagement et amenagements exterieurs",dureeVie:20,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
  {cat:"Amenagements",nom:"Eclairage - parties communes",dureeVie:15,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Interieur",nom:"Corridors et hall d entree",dureeVie:20,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Interieur",nom:"Peinture - parties communes",dureeVie:10,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
];


// Helpers Onboarding
var FINP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Field(p){
  return(
    <div style={p.full?{gridColumn:"1/-1"}:{}}>
      {p.l&&<div style={{fontSize:10,color:"#7C7568",textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>}
      {p.children}
      {p.hint&&<div style={{fontSize:10,color:"#7C7568",marginTop:3}}>{p.hint}</div>}
    </div>
  );
}
function Check(p){
  return(
    <div style={{display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer",marginBottom:8}} onClick={p.onChange}>
      <div style={{width:18,height:18,borderRadius:4,border:"2px solid "+(p.checked?"#1B5E3B":"#DDD9CF"),background:p.checked?"#1B5E3B":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
        {p.checked&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>V</span>}
      </div>
      <div>
        {p.label&&<div style={{fontSize:12,fontWeight:600,color:"#1C1A17",lineHeight:1.4}}>{p.label}</div>}
        {p.desc&&<div style={{fontSize:11,color:"#7C7568",marginTop:2,lineHeight:1.4}}>{p.desc}</div>}
      </div>
    </div>
  );
}

function Onboarding(p){
  var s0=useState(1);var step=s0[0];var setStep=s0[1];
  var s1=useState({
    // Etape 1 - Syndicat
    reqNom:"",acteNom:"",nom:"",code:"",adr:"",ville:"",province:"QC",codePostal:"",immat:"",
    anneeConstruction:"",nbUnites:"",exercice:"1 nov au 31 oct",
    quorumCA:"majorite",quorumAGO:25,typeCopro:"horizontale",
    // Etape 1b - Courriels syndicat (deplacs de tape 2)
    courrielCA:"",courrielFactures:"",courrielCopros:"",courrielUrgences:"",
    gestionnaire:"",
    // Etape 2 - CA
    nbMembresCA:3,
    admins:[
      {nom:"",prenom:"",adr:"",ville:"",province:"QC",codePostal:"",courriel:"",mobile:"",dateDebut:"",nas:""},
      {nom:"",prenom:"",adr:"",ville:"",province:"QC",codePostal:"",courriel:"",mobile:"",dateDebut:"",nas:""},
      {nom:"",prenom:"",adr:"",ville:"",province:"QC",codePostal:"",courriel:"",mobile:"",dateDebut:"",nas:""},
    ],
    // Etape 4 - Soldes
    soldeOp:"",soldePrev:"",soldeAss:"",dateOuverture:"",
    budgetAnnuel:"",cotisationMoyenne:"",
    // Etape 5 - Documents
    documents:[],
    // Etape 6 - Carnet
    composantes:COMPOSANTES_LOI16.map(function(c,i){return Object.assign({},c,{id:i});}),
    inspecteur:"",dateInspection:"",
    // Etape 7 - Attestation
    attestationAcceptee:false,
  });
  var data=s1[0];var setData=s1[1];
  var s2=useState([]);var copros=s2[0];var setCopros=s2[1];
  var s3=useState("");var csvMsg=s3[0];var setCSVMsg=s3[1];
  var s4=useState([]);var csvErrors=s4[0];var setCSVErrors=s4[1];
  var s5=useState("");var newMembre=s5[0];var setNewMembre=s5[1];
  var s6=useState(false);var iaLoading=s6[0];var setIaLoading=s6[1];
  var s7=useState("");var iaError=s7[0];var setIaError=s7[1];
  var s8=useState("");var iaSuccess=s8[0];var setIaSuccess=s8[1];
  var fileRef=useRef(null);
  var docRef=useRef(null);
  var anneeConstruction=parseInt(data.anneeConstruction)||new Date().getFullYear();

  function sd(k,v){setData(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  function sadmin(i,k,v){setData(function(o){
    var admins=o.admins.slice();
    admins[i]=Object.assign({},admins[i]);
    admins[i][k]=v;
    return Object.assign({},o,{admins:admins});
  });}
  function setNbAdmins(n){setData(function(o){
    var cur=o.admins.slice();
    while(cur.length<n) cur.push({nom:"",prenom:"",adr:"",ville:"",province:"QC",codePostal:"",courriel:"",mobile:"",dateDebut:"",nas:""});
    while(cur.length>n) cur.pop();
    return Object.assign({},o,{nbMembresCA:n,admins:cur});
  });}
  function extraireIA(){
    if(iaLoading)return;
    setIaLoading(true);setIaError("");setIaSuccess("");
    var files=[];
    if(window._reqFile)files.push(window._reqFile);
    if(window._acteFile)files.push(window._acteFile);
    if(files.length===0){setIaLoading(false);setIaError("Selectionnez un PDF.");return;}
    function lirePDF(file){
      return new Promise(function(resolve,reject){
        var reader=new FileReader();
        reader.onload=function(ev){
          var arr=new Uint8Array(ev.target.result);
          function run(){
            pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            pdfjsLib.getDocument({data:arr}).promise.then(function(pdf){
              var ps=[];for(var p=1;p<=Math.min(pdf.numPages,20);p++)ps.push(p);
              return Promise.all(ps.map(function(n){return pdf.getPage(n).then(function(pg){return pg.getTextContent().then(function(tc){return tc.items.map(function(i){return i.str;}).join(" ");});});}));
            }).then(function(texts){resolve(texts.join("\n"));}).catch(reject);
          }
          if(typeof pdfjsLib!=="undefined"){run();}else{
            var s=document.createElement("script");
            s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            s.onload=run;document.head.appendChild(s);
          }
        };
        reader.readAsArrayBuffer(file);
      });
    }
    Promise.all(files.map(lirePDF)).then(function(textes){
      var texte=textes.join("\n\n");
      if(!texte.trim()){setIaError("PDF illisible.");setIaLoading(false);return Promise.reject("vide");}
      return fetch("/api/extract",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({texte:texte})});
    }).then(function(r){if(!r)return;return r.json();})
    .then(function(resp){
      if(!resp)return;
      if(resp.error){setIaError("Erreur: "+resp.error);setIaLoading(false);return;}
      var ex=resp.data||{};
      if(ex.nom)sd("nom",ex.nom);
      if(ex.immat)sd("immat",ex.immat);
      if(ex.adr)sd("adr",ex.adr);
      if(ex.ville)sd("ville",ex.ville);
      if(ex.province&&ex.province.length===2)sd("province",ex.province);
      if(ex.codePostal)sd("codePostal",ex.codePostal);
      if(ex.nbUnites&&parseInt(ex.nbUnites)>0)sd("nbUnites",parseInt(ex.nbUnites));
      if(ex.gestionnaire)sd("gestionnaire",ex.gestionnaire);
      if(ex.quorumAGO&&parseInt(ex.quorumAGO)>0)sd("quorumAGO",parseInt(ex.quorumAGO));
      if(ex.anneeConstruction&&parseInt(ex.anneeConstruction)>1900)sd("anneeConstruction",parseInt(ex.anneeConstruction));
      if(ex.typeCopro&&["horizontale","verticale","mixte"].includes(ex.typeCopro))sd("typeCopro",ex.typeCopro);
      if(ex.admins&&Array.isArray(ex.admins)&&ex.admins.length>0){
        setData(function(o){var na=ex.admins.map(function(a){return{nom:a.nom||"",prenom:a.prenom||"",adr:a.adr||"",ville:a.ville||"",province:a.province||"QC",codePostal:a.codePostal||"",courriel:"",mobile:"",dateDebut:a.dateDebut||"",nas:"",role:a.role||"administrateur"};});return Object.assign({},o,{nbMembresCA:ex.admins.length,admins:na});});
      }
      var n=Object.values(ex).filter(function(v){return v&&v!==""&&v!==0&&!Array.isArray(v);}).length;
      setIaSuccess(n+" champs extraits");
      setIaLoading(false);
    }).catch(function(e){if(e!=="vide")setIaError("Erreur: "+(e&&e.message?e.message:String(e)));setIaLoading(false);});
  }

  function sdComp(i,k,v){setData(function(o){var comps=o.composantes.slice();comps[i]=Object.assign({},comps[i]);comps[i][k]=v;return Object.assign({},o,{composantes:comps});});}

  function handleCSV(e){
    var file=e.target.files[0];
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      var result=parseCSV(ev.target.result);
      if(result.ok){setCopros(result.rows);setCSVMsg(result.msg);setCSVErrors(result.errors||[]);}
      else{setCSVMsg("Erreur: "+result.msg);setCopros([]);}
    };
    reader.readAsText(file);
  }

  function handleDoc(e){
    var file=e.target.files[0];
    if(!file)return;
    var types={".pdf":"PDF",".doc":"Word",".docx":"Word",".jpg":"Image",".png":"Image"};
    var ext=file.name.toLowerCase().match(/\.[^.]+$/);
    var type=ext?types[ext[0]]||"Document":"Document";
    var newDoc={id:Date.now(),nom:file.name,type:type,taille:file.size>1048576?(file.size/1048576).toFixed(1)+" MB":(file.size/1024).toFixed(0)+" KB",date:today(),dispo:true,cat:"general"};
    sd("documents",data.documents.concat([newDoc]));
  }

  function terminer(){
    var syndicat={
      id:Date.now(),
      nom:data.nom,code:data.code,
      adr:data.adr+", "+data.ville+" "+data.province+" "+data.codePostal,
      immat:data.immat,anneeConstruction:anneeConstruction,
      nbUnites:copros.length||parseInt(data.nbUnites)||0,
      exercice:data.exercice,
      president:data.president,secretaire:data.secretaire,tresorier:data.tresorier,
      nbMembresCA:data.nbMembresCA,membresCA:data.membresCA,
      courrielCA:data.courrielCA,courrielFactures:data.courrielFactures,
      soldeOp:parseFloat(data.soldeOp)||0,soldePrev:parseFloat(data.soldePrev)||0,soldeAss:parseFloat(data.soldeAss)||0,
      copros:copros,documents:data.documents,composantes:data.composantes,
      statut:"actif",dateCreation:today(),
      scoreFinancier:75,scoreConformite:80,scoreEntretien:85,
      cotisationMensuelle:copros.reduce(function(a,c){return a+(parseFloat(c.cotisation)||0);},0)||parseFloat(data.cotisationMoyenne)*copros.length||0,
    };
    try{localStorage.setItem("predictek_syndicat_"+data.code,JSON.stringify(syndicat));}catch(e){}
    if(p.onTermine)p.onTermine(syndicat);
  }

  var totalCot=copros.reduce(function(a,c){return a+(parseFloat(c.cotisation)||0);},0);
  var totalFraction=copros.reduce(function(a,c){return a+(parseFloat(c.fraction)||0);},0);
  var compOk=data.composantes.filter(function(c){return c.obligatoire&&c.anneeInstall;}).length;
  var compOblig=data.composantes.filter(function(c){return c.obligatoire;}).length;

  return(
    <div style={{padding:20,fontFamily:"Georgia,serif",maxWidth:900,margin:"0 auto"}}>
      <div style={{background:T.navy,color:"#fff",borderRadius:12,padding:"16px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:18,fontWeight:800}}>Nouveau syndicat - Configuration initiale</div>
          <div style={{fontSize:11,color:"#8da0bb",marginTop:2}}>Completez les 8 etapes pour activer votre syndicat dans Predictek</div>
        </div>
        <div style={{fontSize:22,fontWeight:900,color:T.accent}}>Predictek</div>
      </div>

      <StepIndicator step={step}/>

      {step===1&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 1 - Acte de copropriete et informations du syndicaticat</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Importez votre acte de copropriete (PDF) - les informations seront extraites automatiquement. Vous pourrez les modifier avant de continuer.</div>
          <div style={{background:"#F0F7FF",border:"1px solid #1A56DB33",borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:2}}>Documents officiels du syndicat</div>
                <div style={{fontSize:11,color:T.muted}}>Optionnel  Importez vos PDF pour remplir automatiquement les champs avec l'IA</div>
              </div>
              {(data.reqNom||data.acteNom)&&!iaLoading&&(
                <button onClick={extraireIA} style={{background:"linear-gradient(135deg,#1A56DB,#3CAF6E)",border:"none",borderRadius:8,padding:"8px 16px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:16}}></span> Extraire avec l'IA
                </button>
              )}
              {iaLoading&&(
                <div style={{background:"#EFF6FF",border:"1px solid #1A56DB44",borderRadius:8,padding:"8px 14px",fontSize:11,color:"#1A56DB",fontWeight:600}}>
                  IA en cours d'analyse...
                </div>
              )}
            </div>
            {iaError&&(
              <div style={{background:"#FDECEA",border:"1px solid #B8323244",borderRadius:6,padding:"6px 12px",fontSize:11,color:"#B83232",marginBottom:10}}>{iaError}</div>
            )}
            {iaSuccess&&(
              <div style={{background:"#E8F2EC",border:"1px solid #1B5E3B44",borderRadius:6,padding:"6px 12px",fontSize:11,color:"#1B5E3B",marginBottom:10,fontWeight:600}}> {iaSuccess}</div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{background:"#EFF6FF",border:"2px dashed "+(data.reqNom?"#1A56DB":"#1A56DB66"),borderRadius:8,padding:12,textAlign:"center",transition:"all 0.2s"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#1A56DB",marginBottom:3}}>Registre entreprises du Quebec (REQ)</div>
                <div style={{fontSize:10,color:"#7C7568",marginBottom:8}}>NEQ, administrateurs, adresse du domicile</div>
                <input type="file" accept=".pdf,.PDF" id="reqUpload" onChange={function(e){var f=e.target.files[0];if(f){sd("reqNom",f.name);window._reqFile=f;}}} style={{display:"none"}}/>
                <button onClick={function(){document.getElementById("reqUpload").click();}} style={{background:"#1A56DB",border:"none",borderRadius:6,padding:"6px 12px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  {data.reqNom?" Changer":"Â° Slectionner PDF"}
                </button>
                {data.reqNom&&<div style={{fontSize:10,color:"#1A56DB",marginTop:5,fontWeight:600}}> {data.reqNom}</div>}
              </div>
              <div style={{background:"#E8F2EC",border:"2px dashed "+(data.acteNom?"#1B5E3B":"#1B5E3B66"),borderRadius:8,padding:12,textAlign:"center",transition:"all 0.2s"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#1B5E3B",marginBottom:3}}>Declaration de copropriete</div>
                <div style={{fontSize:10,color:"#7C7568",marginBottom:8}}>Quorum AGO, annee construction, structure legale</div>
                <input type="file" accept=".pdf,.PDF" id="acteUpload" onChange={function(e){var f=e.target.files[0];if(f){sd("acteNom",f.name);window._acteFile=f;}}} style={{display:"none"}}/>
                <button onClick={function(){document.getElementById("acteUpload").click();}} style={{background:"#1B5E3B",border:"none",borderRadius:6,padding:"6px 12px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  {data.acteNom?" Changer":"Â° Slectionner PDF"}
                </button>
                {data.acteNom&&<div style={{fontSize:10,color:"#1B5E3B",marginTop:5,fontWeight:600}}> {data.acteNom}</div>}
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field l="Nom officiel du syndicat" full hint="Nom tel qu il apparait dans votre acte de copropriete"><input value={data.nom} onChange={function(e){sd("nom",e.target.value);}} style={INP} placeholder="Syndicat Piedmont"/></Field>
            <Field l="Code court (4 lettres)" hint="Identifiant interne Predictek"><input value={data.code} onChange={function(e){sd("code",e.target.value.toUpperCase().slice(0,4));}} style={INP} placeholder="PIED" maxLength={4}/></Field>
            <Field l="Anne de construction (dclaration)"><input type="number" value={data.anneeConstruction} onChange={function(e){sd("anneeConstruction",e.target.value);}} style={INP} placeholder="2013"/></Field>
            <Field l="Adresse du syndicat" full hint="Adresse du domicile tel qu inscrit au REQ"><input value={data.adr} onChange={function(e){sd("adr",e.target.value);}} style={INP} placeholder="123 Chemin du Hibou"/></Field>
            <Field l="Ville"><input value={data.ville} onChange={function(e){sd("ville",e.target.value);}} style={INP} placeholder="Stoneham-et-Tewkesbury"/></Field>
            <Field l="Province"><select value={data.province} onChange={function(e){sd("province",e.target.value);}} style={INP}><option>QC</option><option>ON</option><option>BC</option><option>AB</option></select></Field>
            <Field l="Code postal"><input value={data.codePostal} onChange={function(e){sd("codePostal",e.target.value.toUpperCase());}} style={INP} placeholder="G3C 1T1"/></Field>
            <Field l="Numero immatriculation REQ" hint="11 chiffres - registre entreprises Quebec"><input value={data.immat} onChange={function(e){sd("immat",e.target.value);}} style={INP} placeholder="1144524577"/></Field>
            <Field l="Exercice financier"><select value={data.exercice} onChange={function(e){sd("exercice",e.target.value);}} style={INP}><option value="1 nov au 31 oct">1 nov au 31 oct</option><option value="1 jan au 31 dec">1 jan au 31 dec</option><option value="1 avr au 31 mars">1 avr au 31 mars</option><option value="1 juil au 30 juin">1 juil au 30 juin</option></select></Field>
            <Field l="Quorum AGO % (dclaration)"><input type="number" min="10" max="75" value={data.quorumAGO} onChange={function(e){sd("quorumAGO",parseInt(e.target.value)||25);}} style={INP}/></Field>
          </div>
          <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:10,padding:14,marginTop:16,marginBottom:4}}>
            <div style={{fontSize:13,fontWeight:700,color:T.amber,marginBottom:6}}>Structure lgale de la coproprit</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Dtermine par la dclaration de coproprit  a des impacts juridiques importants sur la gestion</div>
            <div style={{display:"flex",gap:10}}>
              {[
                {v:"horizontale",l:"Horizontale",desc:"Units cÂ´te  cÂ´te (maisons, condos au sol)"},
                {v:"verticale",l:"Verticale",desc:"Units superposes (tours, immeubles)"},
                {v:"mixte",l:"Mixte",desc:"Combinaison des deux types"},
              ].map(function(t){var a=data.typeCopro===t.v;return(
                <div key={t.v} onClick={function(){sd("typeCopro",t.v);}} style={{flex:1,border:"2px solid "+(a?T.amber:T.border),borderRadius:8,padding:"10px 12px",cursor:"pointer",background:a?T.amberL:"#fff",transition:"all 0.15s"}}>
                  <div style={{fontWeight:700,fontSize:12,color:a?T.amber:T.text,marginBottom:2}}>{t.l}</div>
                  <div style={{fontSize:10,color:T.muted}}>{t.desc}</div>
                </div>
              );})}
            </div>
          </div>
          <div style={{marginTop:16}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>Courriels du syndicat</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Ces adresses seront utilisees pour les communications automatiques</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Field l="Courriel du CA" hint="Communications CA"><input value={data.courrielCA} onChange={function(e){sd("courrielCA",e.target.value);}} style={INP} placeholder="ca@syndicat.com"/></Field>
              <Field l="Courriel factures fournisseurs" hint="Traitement automatique"><input value={data.courrielFactures} onChange={function(e){sd("courrielFactures",e.target.value);}} style={INP} placeholder="factures@syndicat.com"/></Field>
              <Field l="Courriel copropietaires"><input value={data.courrielCopros} onChange={function(e){sd("courrielCopros",e.target.value);}} style={INP} placeholder="copros@syndicat.com"/></Field>
              <Field l="Courriel urgences 24/7"><input value={data.courrielUrgences} onChange={function(e){sd("courrielUrgences",e.target.value);}} style={INP} placeholder="urgences@syndicat.com"/></Field>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}>
            <Btn dis={!data.nom||!data.code||!data.ville} onClick={function(){setStep(2);}}>Continuer -</Btn>
          </div>
        </div>
      )}

      {step===2&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 2 - Administrateurs du CA</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Selon le REQ et la declaration de copropriete. Le NAS est chiffre et securise.</div>
          <div style={{marginBottom:16}}>
            <Lbl l="Nombre d administrateurs"/>
            <div style={{display:"flex",gap:10,marginBottom:4}}>{[3,5,7,9].map(function(n){var a=data.nbMembresCA===n;return(
              <button key={n} onClick={function(){setNbAdmins(n);}} style={{width:52,height:52,borderRadius:10,border:"2px solid "+(a?T.accent:T.border),background:a?T.accentL:T.surface,fontWeight:700,fontSize:16,cursor:"pointer",color:a?T.accent:T.text}}>{n}</button>
            );})}</div>
            <div style={{fontSize:11,color:T.muted}}>Nombre impair requis  {data.nbMembresCA} administrateur(s) selectionne(s)</div>
          </div>
          <div style={{marginBottom:8}}>
            {data.admins.map(function(admin,i){return(
              <div key={i} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:10}}>Administrateur {i+1}{i===0?" (President / Representant)":i===1?" (Secretaire)":i===2?" (Tresorier)":""}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <Field l="Prenom"><input value={admin.prenom} onChange={function(e){sadmin(i,"prenom",e.target.value);}} style={INP}/></Field>
                  <Field l="Nom"><input value={admin.nom} onChange={function(e){sadmin(i,"nom",e.target.value);}} style={INP}/></Field>
                  <Field l="Adresse postale" full><input value={admin.adr} onChange={function(e){sadmin(i,"adr",e.target.value);}} style={INP} placeholder="123 rue Exemple"/></Field>
                  <Field l="Ville"><input value={admin.ville} onChange={function(e){sadmin(i,"ville",e.target.value);}} style={INP}/></Field>
                  <Field l="Province"><select value={admin.province} onChange={function(e){sadmin(i,"province",e.target.value);}} style={INP}><option>QC</option><option>ON</option><option>BC</option><option>AB</option><option>MB</option><option>SK</option><option>NB</option><option>NS</option><option>PE</option><option>NL</option></select></Field>
                  <Field l="Code postal"><input value={admin.codePostal} onChange={function(e){sadmin(i,"codePostal",e.target.value.toUpperCase());}} style={INP} placeholder="G1A 1A1"/></Field>
                  <Field l="Courriel"><input type="email" value={admin.courriel} onChange={function(e){sadmin(i,"courriel",e.target.value);}} style={INP} placeholder="nom@exemple.com"/></Field>
                  <Field l="Mobile"><input type="tel" value={admin.mobile} onChange={function(e){sadmin(i,"mobile",e.target.value);}} style={INP} placeholder="418-555-0000"/></Field>
                  <Field l="Debut du mandat"><input type="date" value={admin.dateDebut} onChange={function(e){sadmin(i,"dateDebut",e.target.value);}} style={INP}/></Field>
                  <Field l="NAS (chiffre)" hint="Stocke chiffre - jamais affiche en clair"><input type="password" value={admin.nas} onChange={function(e){sadmin(i,"nas",e.target.value);}} style={INP} placeholder="000-000-000" maxLength={11}/></Field>
                </div>
              </div>
            );})}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(1);}}>- Retour</Btn>
            <Btn dis={!data.admins[0]||!data.admins[0].nom} onClick={function(){setStep(3);}}>Continuer -</Btn>
          </div>
        </div>
      )}

      {step===3&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 3 - Import des coproprietaires</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Importez votre registre en format CSV. Vous pouvez aussi saisir manuellement.</div>

          <div style={{background:T.blueL,border:"1px solid "+T.blue+"44",borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:8}}>Format CSV accepte (colonnes flexibles)</div>
            <div style={{fontSize:11,color:T.blue,fontFamily:"monospace",lineHeight:1.9}}>
              unite, cadastre, prenom, nom, courriel, telephone, quote_part, cotisation<br/>
              531, 1234567, Jean-Francois, Laroche, jf@email.com, 819-479-4203, 2.133, 292.06<br/>
              539, 1234568, Lucette, Tremblay, l.tremblay@email.com, 418-555-0539, 3.840, 525.80
            </div>
            <div style={{fontSize:10,color:T.blue,marginTop:6}}>Colonnes obligatoires: unite. Toutes les autres sont optionnelles.</div>
          </div>

          <div style={{border:"2px dashed "+T.border,borderRadius:12,padding:30,textAlign:"center",background:T.alt,cursor:"pointer",marginBottom:14}} onClick={function(){fileRef.current&&fileRef.current.click();}}>
            <div style={{fontSize:32,marginBottom:8}}>CSV</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:4}}>Cliquez pour importer votre fichier CSV</div>
            <div style={{fontSize:11,color:T.muted}}>Formats acceptes: .csv, .txt</div>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCSV} style={{display:"none"}}/>
          </div>

          {csvMsg&&(
            <div style={{background:csvMsg.includes("Erreur")?T.redL:T.accentL,color:csvMsg.includes("Erreur")?T.red:T.accent,borderRadius:8,padding:"9px 13px",fontSize:12,marginBottom:10,fontWeight:600}}>{csvMsg}</div>
          )}
          {csvErrors.length>0&&(
            <div style={{background:T.amberL,borderRadius:8,padding:"9px 13px",fontSize:11,color:T.amber,marginBottom:10}}>
              {csvErrors.slice(0,5).map(function(e,i){return <div key={i}>- {e}</div>;})}
            </div>
          )}

          {copros.length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{copros.length} coproprietaires importes</div>
                <div style={{fontSize:12,color:T.muted}}>Total cotisations: <b>{money(totalCot)}/mois</b> | Total fractions: <b>{totalFraction.toFixed(3)}%</b></div>
              </div>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden",maxHeight:280,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:T.navy}}>{["Unite","Cadastre","Prenom","Nom","Courriel","Tel","Quote-part %","Cotisation"].map(function(h){return <th key={h} style={{padding:"6px 10px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left"}}>{h}</th>;})}</tr></thead>
                  <tbody>
                    {copros.map(function(c,i){return(
                      <tr key={i} style={{borderBottom:"1px solid "+T.border,background:i%2===0?T.surface:T.alt}}>
                        <td style={{padding:"6px 10px",fontWeight:700,color:T.navy,fontSize:11}}>{c.unite}</td>
                        <td style={{padding:"6px 10px",fontSize:10,color:T.muted}}>{c.cadastre||"-"}</td>
                        <td style={{padding:"6px 10px",fontSize:11}}>{c.prenom}</td>
                        <td style={{padding:"6px 10px",fontSize:11}}>{c.nom}</td>
                        <td style={{padding:"6px 10px",fontSize:10,color:T.muted}}>{c.courriel}</td>
                        <td style={{padding:"6px 10px",fontSize:10,color:T.muted}}>{c.tel}</td>
                        <td style={{padding:"6px 10px",fontSize:11,textAlign:"right"}}>{c.quotePart?c.quotePart+"%":c.fraction?c.fraction+"%":""}</td>
                        <td style={{padding:"6px 10px",fontSize:11,textAlign:"right",fontWeight:600}}>{c.cotisation?money(c.cotisation):""}</td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {copros.length===0&&(
            <div style={{marginBottom:14}}>
              <Lbl l="OU - Saisir le nombre d unites manuellement"/>
              <input type="number" value={data.nbUnites} onChange={function(e){sd("nbUnites",e.target.value);}} style={INP} placeholder="Nombre d unites (ex: 36)"/>
              <div style={{fontSize:10,color:T.muted,marginTop:3}}>Vous pourrez ajouter les coproprietaires plus tard.</div>
            </div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(2);}}>- Retour</Btn>
            <Btn dis={copros.length===0&&!data.nbUnites} onClick={function(){setStep(4);}}>Continuer -</Btn>
          </div>
        </div>
      )}

      {step===4&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 4 - Soldes d ouverture et budget</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Entrez les soldes bancaires au debut de l exercice actif. Ces valeurs seront les soldes d ouverture dans la comptabilite.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <Field l="Date d ouverture de l exercice"><input type="date" value={data.dateOuverture} onChange={function(e){sd("dateOuverture",e.target.value);}} style={INP}/></Field>
            <div/>
            <Field l="Solde - Compte d exploitation ($)" hint="Argent disponible pour les operations courantes"><input type="number" value={data.soldeOp} onChange={function(e){sd("soldeOp",e.target.value);}} style={INP} placeholder="Ex: 7361.88" step="0.01"/></Field>
            <Field l="Solde - Fonds de prevoyance ($)" hint="Reserve pour travaux majeurs (Loi 16 - obligatoire)"><input type="number" value={data.soldePrev} onChange={function(e){sd("soldePrev",e.target.value);}} style={INP} placeholder="Ex: 64235.01" step="0.01"/></Field>
            <Field l="Solde - Fonds d assurance ($)" hint="Reserve pour la franchise d assurance"><input type="number" value={data.soldeAss} onChange={function(e){sd("soldeAss",e.target.value);}} style={INP} placeholder="Ex: 36178.37" step="0.01"/></Field>
            <Field l="Budget annuel total ($)" hint="Total des depenses budgetees pour l exercice"><input type="number" value={data.budgetAnnuel} onChange={function(e){sd("budgetAnnuel",e.target.value);}} style={INP} placeholder="Ex: 142800" step="0.01"/></Field>
          </div>
          {(data.soldeOp||data.soldePrev||data.soldeAss)&&(
            <div style={{background:T.accentL,borderRadius:10,padding:14,marginBottom:14,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[{l:"Exploitation",v:parseFloat(data.soldeOp)||0},{l:"Prevoyance",v:parseFloat(data.soldePrev)||0},{l:"Assurance",v:parseFloat(data.soldeAss)||0},{l:"Total",v:(parseFloat(data.soldeOp)||0)+(parseFloat(data.soldePrev)||0)+(parseFloat(data.soldeAss)||0)}].map(function(s,i){return(
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:T.accent,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:14,fontWeight:800,color:T.navy}}>{money(s.v)}</div>
                </div>
              );})}
            </div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(3);}}>- Retour</Btn>
            <Btn onClick={function(){setStep(5);}}>Continuer -</Btn>
          </div>
        </div>
      )}

      {step===5&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 5 - Documents officiels</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Importez les documents fondamentaux du syndicat. La declaration de copropriete est obligatoire.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[{cat:"declaration",l:"Declaration de copropriete",desc:"Document fondateur - acte notarie",obligatoire:true},{cat:"reglement",l:"Reglement de l immeuble",desc:"Regles de vie approuvees en assemblee",obligatoire:true},{cat:"police",l:"Police d assurance",desc:"Assurance syndicat en vigueur",obligatoire:false},{cat:"financier",l:"Etats financiers annuels",desc:"Derniers etats financiers verifies",obligatoire:false},{cat:"carnet_prev",l:"Etude du fonds de prevoyance",desc:"Etude actuarielle Loi 16",obligatoire:false},{cat:"autre",l:"Autre document",desc:"Tout autre document pertinent",obligatoire:false}].map(function(dtype){
              var uploaded=data.documents.filter(function(d){return d.cat===dtype.cat;});
              return(
                <div key={dtype.cat} style={{background:T.surface,border:"1px solid "+(uploaded.length>0?T.accent:dtype.obligatoire?T.amber:T.border),borderRadius:10,padding:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:T.text}}>{dtype.l}{dtype.obligatoire&&<span style={{color:T.red,marginLeft:4}}>*</span>}</div>
                      <div style={{fontSize:10,color:T.muted}}>{dtype.desc}</div>
                    </div>
                    {uploaded.length>0&&<span style={{fontSize:16,color:T.accent}}>-</span>}
                  </div>
                  {uploaded.map(function(d,i){return(
                    <div key={i} style={{fontSize:10,color:T.accent,background:T.accentL,borderRadius:5,padding:"3px 8px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span>{d.nom} ({d.taille})</span>
                      <button onClick={function(){sd("documents",data.documents.filter(function(x){return x.id!==d.id;}));}} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:12,lineHeight:1}}>x</button>
                    </div>
                  );})}
                  <button onClick={function(){var inp=document.createElement("input");inp.type="file";inp.accept=".pdf,.doc,.docx,.jpg,.png";inp.onchange=function(e){var file=e.target.files[0];if(!file)return;var newDoc={id:Date.now(),nom:file.name,type:"Document",taille:file.size>1048576?(file.size/1048576).toFixed(1)+" MB":(file.size/1024).toFixed(0)+" KB",date:today(),dispo:true,cat:dtype.cat};sd("documents",data.documents.concat([newDoc]));};inp.click();}} style={{width:"100%",background:T.alt,border:"1px dashed "+T.border,borderRadius:7,padding:"5px",fontSize:11,color:T.muted,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>+ Ajouter fichier</button>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(4);}}>- Retour</Btn>
            <Btn onClick={function(){setStep(6);}}>Continuer -</Btn>
          </div>
        </div>
      )}

      {step===6&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 6 - Carnet d entretien (Loi 16)</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Requis par la Loi 16 pour tous les syndicats de copropriete au Quebec. Listez les composantes de l immeuble avec leur date d installation et etat actuel.</div>
          <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:8,padding:"9px 14px",marginBottom:14,fontSize:11,color:T.amber}}>
            <b>Loi 16 - Article 1070.2 CCQ:</b> Tout syndicat doit tenir un carnet d entretien de l immeuble incluant toutes les composantes majeures avec leur duree de vie prevue et leur etat actuel.
          </div>
          <div style={{marginBottom:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field l="Nom de l inspecteur / expert"><input value={data.inspecteur} onChange={function(e){sd("inspecteur",e.target.value);}} style={INP} placeholder="Nom, titre, no de licence"/></Field>
            <Field l="Date d inspection"><input type="date" value={data.dateInspection} onChange={function(e){sd("dateInspection",e.target.value);}} style={INP}/></Field>
          </div>
          <div style={{fontSize:11,color:T.muted,marginBottom:10}}><b style={{color:T.accent}}>{compOk}/{compOblig}</b> composantes obligatoires completees</div>
          {["Structure","Enveloppe","Mecanique","Securite","Amenagements","Interieur"].map(function(cat){
            var comps=data.composantes.filter(function(c){return c.cat===cat;});
            return(
              <div key={cat} style={{marginBottom:12}}>
                <div style={{background:T.navy,color:"#fff",padding:"7px 12px",fontSize:11,fontWeight:700,borderRadius:"8px 8px 0 0",textTransform:"uppercase",letterSpacing:"0.05em"}}>{cat}</div>
                <div style={{border:"1px solid "+T.border,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
                  {comps.map(function(comp){
                    var idx=data.composantes.findIndex(function(c){return c.id===comp.id;});
                    var anneeRest=comp.anneeInstall?Math.max(0,(parseInt(comp.anneeInstall)||anneeConstruction)+comp.dureeVie-new Date().getFullYear()):null;
                    return(
                      <div key={comp.id} style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr 1fr 1.5fr",gap:8,padding:"8px 12px",borderBottom:"1px solid "+T.border,alignItems:"center",background:comp.obligatoire&&!comp.anneeInstall?"#FFFBF0":T.surface}}>
                        <div>
                          <div style={{fontSize:11,fontWeight:600,color:T.text}}>{comp.nom}{comp.obligatoire&&<span style={{color:T.red,marginLeft:4,fontSize:9}}>REQUIS</span>}</div>
                          <div style={{fontSize:9,color:T.muted}}>Duree de vie: {comp.dureeVie} ans</div>
                        </div>
                        <div>
                          <div style={{fontSize:9,color:T.muted,marginBottom:2}}>Annee install.</div>
                          <input type="number" value={comp.anneeInstall||""} onChange={function(e){sdComp(idx,"anneeInstall",e.target.value);}} placeholder={anneeConstruction.toString()} style={{width:"100%",border:"1px solid "+T.border,borderRadius:5,padding:"3px 6px",fontSize:11,fontFamily:"inherit",outline:"none"}}/>
                        </div>
                        <div>
                          <div style={{fontSize:9,color:T.muted,marginBottom:2}}>Etat</div>
                          <select value={comp.etat} onChange={function(e){sdComp(idx,"etat",e.target.value);}} style={{width:"100%",border:"1px solid "+T.border,borderRadius:5,padding:"3px 4px",fontSize:11,fontFamily:"inherit",outline:"none"}}>
                            <option value="excellent">Excellent</option>
                            <option value="bon">Bon</option>
                            <option value="moyen">Moyen</option>
                            <option value="deficient">Deficient</option>
                          </select>
                        </div>
                        <div style={{textAlign:"center"}}>
                          {anneeRest!==null&&(
                            <div>
                              <div style={{fontSize:15,fontWeight:800,color:anneeRest<=5?T.red:anneeRest<=10?T.amber:T.accent}}>{anneeRest}</div>
                              <div style={{fontSize:9,color:T.muted}}>ans restants</div>
                            </div>
                          )}
                        </div>
                        <div>
                          <input value={comp.notes||""} onChange={function(e){sdComp(idx,"notes",e.target.value);}} placeholder="Notes..." style={{width:"100%",border:"1px solid "+T.border,borderRadius:5,padding:"3px 6px",fontSize:10,fontFamily:"inherit",outline:"none"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(5);}}>- Retour</Btn>
            <Btn onClick={function(){setStep(7);}}>Continuer -</Btn>
          </div>
        </div>
      )}

      {step===7&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 7 - Attestation de copropriete</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Generez et acceptez l attestation reglementaire du syndicat. Requise selon la Loi 16 et les exigences des preteurs hypothecaires.</div>

          <div style={{background:T.surface,border:"2px solid "+T.navy,borderRadius:12,padding:20,marginBottom:16,fontFamily:"Georgia,serif"}}>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:900,color:T.navy,textTransform:"uppercase",letterSpacing:"0.05em"}}>ATTESTATION DE COPROPRIETE</div>
              <div style={{fontSize:12,color:T.muted,marginTop:4}}>En vertu de l article 1070 et suivants du Code civil du Quebec</div>
              <div style={{width:60,height:2,background:T.navy,margin:"12px auto"}}/>
            </div>

            <div style={{fontSize:12,color:T.text,lineHeight:1.9,marginBottom:14}}>
              <b>Le syndicat {data.nom||"[Nom du syndicat]"}</b>, immatricule sous le numero <b>{data.immat||"[Immatriculation]"}</b> au Registre des entreprises du Quebec, ci-apres designe le "Syndicat", represente par son conseil d administration elu, atteste ce qui suit:
            </div>

            <div style={{display:"grid",gap:8,marginBottom:14}}>
              {[
                "Le Syndicat est legalement constitue et en bonne et due forme selon les lois du Quebec",
                "L immeuble situe au "+( data.adr?data.adr+", "+data.ville+" "+data.province+" "+data.codePostal:"[Adresse]")+" est compose de "+(copros.length||data.nbUnites||"[N]")+" unites de copropriete",
                "Le Syndicat est a jour dans le paiement de ses cotisations et charges communes",
                "Le Syndicat tient a jour son carnet d entretien conformement a l article 1070.2 CCQ (Loi 16)",
                "Le fonds de prevoyance est maintenu conformement aux exigences legales",
                "Aucune procedure judiciaire impliquant le Syndicat n est en cours au moment de la presente attestation",
                "L assurance du batiment est en vigueur et conforme aux exigences minimales",
                "Le registre des coproprietaires est tenu a jour et accessible",
              ].map(function(item,i){return(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:11,color:T.text}}>
                  <span style={{color:T.accent,fontWeight:700,flexShrink:0,marginTop:1}}>-</span>
                  <span>{item}</span>
                </div>
              );})}
            </div>

            <div style={{borderTop:"1px solid "+T.border,paddingTop:14,marginTop:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,fontSize:11,color:T.text}}>
                <div>
                  <div style={{fontWeight:700,marginBottom:4}}>President du conseil d administration</div>
                  <div style={{color:T.muted,marginBottom:2}}>{data.president||"[Nom du president]"}</div>
                  <div style={{borderBottom:"1px solid "+T.border,marginTop:20,marginBottom:4}}/>
                  <div style={{fontSize:9,color:T.muted}}>Signature</div>
                </div>
                <div>
                  <div style={{fontWeight:700,marginBottom:4}}>Date et lieu</div>
                  <div style={{color:T.muted}}>{today()} - {data.ville||"[Ville]"}</div>
                  <div style={{marginTop:8,fontWeight:700,marginBottom:4}}>Secretaire</div>
                  <div style={{color:T.muted}}>{data.secretaire||"[Nom du secretaire]"}</div>
                </div>
              </div>
              <div style={{marginTop:14,background:T.amberL,borderRadius:7,padding:"8px 12px",fontSize:10,color:T.amber}}>
                Cette attestation est valide pour une periode de 30 jours a compter de la date d emission. Pour les transactions immobilieres, une nouvelle attestation doit etre demandee par le coproprietaire vendeur.
              </div>
            </div>
          </div>

          <Check checked={data.attestationAcceptee} onChange={function(){sd("attestationAcceptee",!data.attestationAcceptee);}} label="Je certifie que les informations contenues dans cette attestation sont exactes et completes" desc="En cochant cette case, vous confirmez l exactitude des informations au nom du conseil d administration du syndicat."/>

          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(6);}}>- Retour</Btn>
            <Btn dis={!data.attestationAcceptee} onClick={function(){setStep(8);}}>Continuer -</Btn>
          </div>
        </div>
      )}

      {step===8&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 8 - Confirmation et activation</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:20}}>Verifiez le resume de la configuration avant d activer le syndicat.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {[
              {titre:"Syndicat",items:[{l:"Nom",v:data.nom},{l:"Code",v:data.code},{l:"Immatriculation",v:data.immat||"-"},{l:"Construction",v:data.anneeConstruction},{l:"Exercice",v:data.exercice}]},
              {titre:"CA",items:[{l:"Membres",v:data.nbMembresCA+" membres"},{l:"President",v:data.president||"-"},{l:"Secretaire",v:data.secretaire||"-"},{l:"Tresorier",v:data.tresorier||"-"}]},
              {titre:"Coproprietaires",items:[{l:"Importes",v:copros.length||data.nbUnites||"0"},{l:"Cotisations/mois",v:totalCot>0?money(totalCot):"-"},{l:"Fraction totale",v:totalFraction>0?totalFraction.toFixed(3)+"%":"-"}]},
              {titre:"Finances",items:[{l:"Exploitation",v:money(parseFloat(data.soldeOp)||0)},{l:"Prevoyance",v:money(parseFloat(data.soldePrev)||0)},{l:"Assurance",v:money(parseFloat(data.soldeAss)||0)},{l:"Budget annuel",v:data.budgetAnnuel?money(parseFloat(data.budgetAnnuel)):"-"}]},
              {titre:"Documents",items:[{l:"Importes",v:data.documents.length+" document(s)"},{l:"Declaration",v:data.documents.find(function(d){return d.cat==="declaration";})?"- Presente":"- Manquante"},{l:"Reglement",v:data.documents.find(function(d){return d.cat==="reglement";})?"- Present":"-"}]},
              {titre:"Carnet Loi 16",items:[{l:"Composantes",v:data.composantes.length+" total"},{l:"Completees",v:compOk+"/"+compOblig+" obligatoires"},{l:"Inspecteur",v:data.inspecteur||"-"},{l:"Date inspection",v:data.dateInspection||"-"}]},
            ].map(function(section){return(
              <div key={section.titre} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
                <div style={{fontSize:11,fontWeight:700,color:T.navy,marginBottom:10,paddingBottom:6,borderBottom:"1px solid "+T.border}}>{section.titre}</div>
                {section.items.map(function(item,i){return(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0"}}>
                    <span style={{color:T.muted}}>{item.l}</span>
                    <span style={{fontWeight:600,color:T.text}}>{item.v}</span>
                  </div>
                );})}
              </div>
            );})}
          </div>
          <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:12,color:T.accent}}>
            <b>Pret a activer!</b> Le syndicat {data.nom} sera cree et accessible dans tous les modules Predictek. Toutes les donnees importees seront disponibles immediatement.
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(7);}}>- Retour</Btn>
            <Btn bg={T.accent} onClick={terminer} style={{fontSize:14,padding:"12px 28px"}}>Activer le syndicat {data.nom}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}



// ===== PARAMS PREDICTEK =====


function ParamsPredictek(){
  var NC={muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF"};
  var NI={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
  var NL={fontSize:10,color:"#7C7568",textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5};
  function load(k,d){try{var v=localStorage.getItem("predictek_params_"+k);return v?JSON.parse(v):d;}catch(e){return d;}}
  function save(k,v){try{localStorage.setItem("predictek_params_"+k,JSON.stringify(v));}catch(e){}}
  var s0=useState(function(){return load("entreprise",{nomLegal:"",nomCommercial:"Predictek",adr:"",ville:"",province:"QC",codePostal:"",siteWeb:"",courriel:"",telephone:"",neq:"",exerciceDebut:"01-11",exerciceFin:"31-10"});});
  var infos=s0[0];var setInfos=s0[1];
  var s1=useState(function(){return load("fiscalite",{noTPS:"",noTVQ:"",noDeclarant:"",freqTPS:"trimestrielle",freqTVQ:"trimestrielle",inscritTPS:true,inscritTVQ:true});});
  var fisc=s1[0];var setFisc=s1[1];
  var s2=useState(function(){return load("banque",{institution:"",transit:"",noInstitution:"",noCompte:"",nomCompte:""});});
  var banque=s2[0];var setBanque=s2[1];
  var s3=useState(function(){return load("logo",{url:"",nom:""});});
  var logo=s3[0];var setLogo=s3[1];
  var s4=useState("entreprise");var ong=s4[0];var setOng=s4[1];
  var s5=useState("");var ok=s5[0];var setOk=s5[1];

  var setI=function(k,v){setInfos(function(p){return Object.assign({},p,{[k]:v});});};
  var setF=function(k,v){setFisc(function(p){return Object.assign({},p,{[k]:v});});};
  var setB=function(k,v){setBanque(function(p){return Object.assign({},p,{[k]:v});});};

  function sauver(){
    save("entreprise",infos);save("fiscalite",fisc);save("banque",banque);save("logo",logo);
    try{if(logo.url)localStorage.setItem("predictek_logo",logo.url);}catch(e){}
    setOk("Sauvegarde!");setTimeout(function(){setOk("");},3000);
  }
  function handleLogo(e){
    var file=e.target.files[0];if(!file)return;
    var r=new FileReader();
    r.onload=function(ev){setLogo({url:ev.target.result,nom:file.name});try{localStorage.setItem("predictek_logo",ev.target.result);}catch(x){}};
    r.readAsDataURL(file);
  }

  var TABS=[{id:"entreprise",l:"Entreprise"},{id:"fiscalite",l:"TPS / TVQ"},{id:"banque",l:"Banque"},{id:"logo",l:"Logo"}];
  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:NC.navy}}>Parametres Predictek</div>
          <div style={{fontSize:11,color:NC.muted}}>Informations de votre entreprise</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {ok&&<span style={{fontSize:11,color:NC.accent,fontWeight:600,background:NC.accentL,padding:"4px 12px",borderRadius:20}}>{ok}</span>}
          <button onClick={sauver} style={{background:NC.accent,border:"none",borderRadius:7,padding:"8px 18px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Sauvegarder</button>
        </div>
      </div>

      <div style={{display:"flex",gap:3,marginBottom:16,background:NC.surface,padding:4,borderRadius:10,border:"1px solid "+NC.border}}>
        {TABS.map(function(t){var a=ong===t.id;return(<button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?NC.navy:"transparent",border:"none",borderRadius:7,padding:"7px 16px",color:a?"#fff":NC.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400}}>{t.l}</button>);})}
      </div>

      {ong==="entreprise"&&(
        <div style={{background:NC.surface,border:"1px solid "+NC.border,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:NC.navy,marginBottom:14}}>Informations legales et coordonnees</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{gridColumn:"1/-1"}}><div style={NL}>Nom legal</div><input value={infos.nomLegal} onChange={function(e){setI("nomLegal",e.target.value);}} style={NI} placeholder="9XXX-XXXX Quebec inc."/></div>
            <div><div style={NL}>Nom commercial</div><input value={infos.nomCommercial} onChange={function(e){setI("nomCommercial",e.target.value);}} style={NI} placeholder="Predictek"/></div>
            <div><div style={NL}>NEQ</div><input value={infos.neq} onChange={function(e){setI("neq",e.target.value);}} style={NI} placeholder="1234567890"/></div>
            <div style={{gridColumn:"1/-1"}}><div style={NL}>Adresse</div><input value={infos.adr} onChange={function(e){setI("adr",e.target.value);}} style={NI} placeholder="123 rue Principale"/></div>
            <div><div style={NL}>Ville</div><input value={infos.ville} onChange={function(e){setI("ville",e.target.value);}} style={NI} placeholder="Quebec"/></div>
            <div><div style={NL}>Province</div><select value={infos.province} onChange={function(e){setI("province",e.target.value);}} style={NI}><option>QC</option><option>ON</option><option>BC</option><option>AB</option></select></div>
            <div><div style={NL}>Code postal</div><input value={infos.codePostal} onChange={function(e){setI("codePostal",e.target.value.toUpperCase());}} style={NI} placeholder="G1A 1A1"/></div>
            <div><div style={NL}>Telephone</div><input value={infos.telephone} onChange={function(e){setI("telephone",e.target.value);}} style={NI} placeholder="418-555-0000"/></div>
            <div><div style={NL}>Courriel</div><input value={infos.courriel} onChange={function(e){setI("courriel",e.target.value);}} style={NI} placeholder="info@predictek.ca"/></div>
            <div><div style={NL}>Site web</div><input value={infos.siteWeb} onChange={function(e){setI("siteWeb",e.target.value);}} style={NI} placeholder="app.predictek.ca"/></div>
            <div><div style={NL}>Debut exercice</div><input value={infos.exerciceDebut} onChange={function(e){setI("exerciceDebut",e.target.value);}} style={NI} placeholder="01-11"/></div>
            <div><div style={NL}>Fin exercice</div><input value={infos.exerciceFin} onChange={function(e){setI("exerciceFin",e.target.value);}} style={NI} placeholder="31-10"/></div>
          </div>
        </div>
      )}

      {ong==="fiscalite"&&(
        <div style={{background:NC.surface,border:"1px solid "+NC.border,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:NC.navy,marginBottom:14}}>Taxes et parametres fiscaux</div>
          <div style={{display:"grid",gap:12}}>
            <div style={{background:NC.accentL,borderRadius:10,padding:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{fontSize:12,fontWeight:700,color:NC.accent,gridColumn:"1/-1"}}>TPS - Federal (5%)</div>
              <div><div style={NL}>Numero TPS</div><input value={fisc.noTPS} onChange={function(e){setF("noTPS",e.target.value.toUpperCase());}} style={NI} placeholder="123456789 RT0001"/></div>
              <div><div style={NL}>Frequence</div><select value={fisc.freqTPS} onChange={function(e){setF("freqTPS",e.target.value);}} style={NI}><option value="mensuelle">Mensuelle</option><option value="trimestrielle">Trimestrielle</option><option value="annuelle">Annuelle</option></select></div>
              <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8}}><input type="checkbox" id="cbTPS" checked={!!fisc.inscritTPS} onChange={function(e){setF("inscritTPS",e.target.checked);}}/><label htmlFor="cbTPS" style={{fontSize:12}}>Inscrit a la TPS</label></div>
            </div>
            <div style={{background:NC.blueL,borderRadius:10,padding:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{fontSize:12,fontWeight:700,color:NC.blue,gridColumn:"1/-1"}}>TVQ - Provincial (9.975%)</div>
              <div><div style={NL}>Numero TVQ</div><input value={fisc.noTVQ} onChange={function(e){setF("noTVQ",e.target.value.toUpperCase());}} style={NI} placeholder="1234567890 TQ0001"/></div>
              <div><div style={NL}>No declarant</div><input value={fisc.noDeclarant} onChange={function(e){setF("noDeclarant",e.target.value);}} style={NI} placeholder="1234567890"/></div>
              <div><div style={NL}>Frequence</div><select value={fisc.freqTVQ} onChange={function(e){setF("freqTVQ",e.target.value);}} style={NI}><option value="mensuelle">Mensuelle</option><option value="trimestrielle">Trimestrielle</option><option value="annuelle">Annuelle</option></select></div>
              <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8}}><input type="checkbox" id="cbTVQ" checked={!!fisc.inscritTVQ} onChange={function(e){setF("inscritTVQ",e.target.checked);}}/><label htmlFor="cbTVQ" style={{fontSize:12}}>Inscrit a la TVQ</label></div>
            </div>
          </div>
        </div>
      )}

      {ong==="banque"&&(
        <div style={{background:NC.surface,border:"1px solid "+NC.border,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:NC.navy,marginBottom:14}}>Coordonnees bancaires</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><div style={NL}>Institution</div><input value={banque.institution} onChange={function(e){setB("institution",e.target.value);}} style={NI} placeholder="Desjardins, RBC..."/></div>
            <div><div style={NL}>Nom du compte</div><input value={banque.nomCompte} onChange={function(e){setB("nomCompte",e.target.value);}} style={NI} placeholder="Compte operations"/></div>
            <div><div style={NL}>Transit (5 chiffres)</div><input value={banque.transit} onChange={function(e){setB("transit",e.target.value);}} style={NI} placeholder="12345"/></div>
            <div><div style={NL}>No institution (3 chiffres)</div><input value={banque.noInstitution} onChange={function(e){setB("noInstitution",e.target.value);}} style={NI} placeholder="815"/></div>
            <div style={{gridColumn:"1/-1"}}><div style={NL}>No de compte</div><input value={banque.noCompte} onChange={function(e){setB("noCompte",e.target.value);}} style={NI} placeholder="1234567"/></div>
          </div>
        </div>
      )}

      {ong==="logo"&&(
        <div style={{background:NC.surface,border:"1px solid "+NC.border,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:NC.navy,marginBottom:14}}>Logo et identite visuelle</div>
          <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
            <div style={{width:120,height:120,borderRadius:14,background:logo.url?"#fff":"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid "+NC.border,overflow:"hidden",flexShrink:0}}>
              {logo.url?<img src={logo.url} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain",padding:8}}/>:<span style={{color:"#fff",fontWeight:900,fontSize:48,fontFamily:"Georgia,serif"}}>P</span>}
            </div>
            <div style={{flex:1}}>
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" id="lgUp" onChange={handleLogo} style={{display:"none"}}/>
              <div style={{display:"grid",gap:10,marginBottom:12}}>
                <button onClick={function(){document.getElementById("lgUp").click();}} style={{background:NC.accent,border:"none",borderRadius:7,padding:"8px 18px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{logo.url?"Remplacer":"Choisir un logo"}</button>
                {logo.url&&<button onClick={function(){setLogo({url:"",nom:""});try{localStorage.removeItem("predictek_logo");}catch(e){};}} style={{background:NC.redL,border:"none",borderRadius:7,padding:"8px 18px",color:NC.red,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Retirer</button>}
              </div>
              {logo.nom&&<div style={{fontSize:11,color:NC.muted,marginBottom:8}}>{logo.nom}</div>}
              <div style={{background:NC.alt,borderRadius:8,padding:"10px 14px",fontSize:11,color:NC.muted}}>PNG, JPG ou SVG. Min 200x200px.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




var HISTORIQUE_INIT=[
  {id:1,date:"2026-04-25 09:15",type:"courriel",dest:"jf.laroche@email.com",sujet:"Rapport mensuel avril 2026",statut:"simule",syndicat:"PIED",moyen:"courriel"},
  {id:2,date:"2026-04-24 14:30",type:"sms",dest:"+1 418-555-0539",sujet:"Rappel cotisation en retard - Unite 539",statut:"simule",syndicat:"PIED",moyen:"sms"},
  {id:3,date:"2026-04-22 10:00",type:"courriel",dest:"ca@syndicatpiedmont.com",sujet:"Convocation reunion CA - 15 mai 2026",statut:"simule",syndicat:"PIED",moyen:"courriel"},
  {id:4,date:"2026-04-20 16:45",type:"courriel",dest:"m.beaudoin@email.com",sujet:"Alerte chauffe-eau - Unite 515",statut:"simule",syndicat:"PIED",moyen:"courriel"},
  {id:5,date:"2026-04-18 11:20",type:"portail",dest:"Coproprietaires portail actif (3)",sujet:"Avis travaux deneigement",statut:"simule",syndicat:"PIED",moyen:"portail"},
];
var TEMPLATES=[
  {id:1,cat:"Cotisations",nom:"Rappel cotisation J+5",sujet:"[{{syndicat}}] Cotisation en retard - Unite {{unite}}",corps:"Madame, Monsieur,Nous constatons que votre cotisation mensuelle pour l unite {{unite}} d un montant de {{montant}} $ n a pas ete recue.Merci de regulariser sous 10 jours.Cordialement,Administration {{syndicat}}Gere par Predictek",moyens:["courriel"],auto:true},
  {id:2,cat:"Conformite",nom:"Alerte chauffe-eau expire",sujet:"[{{syndicat}}] Action requise - Chauffe-eau Unite {{unite}}",corps:"Madame, Monsieur,Votre chauffe-eau de l unite {{unite}} est arrive a son terme de vie.Vous devez proceder a son remplacement dans les 60 jours et nous transmettre la preuve d installation.Cordialement,Administration {{syndicat}}",moyens:["courriel","sms"],auto:false},
  {id:3,cat:"Reunions",nom:"Convocation CA",sujet:"[{{syndicat}}] Convocation - Reunion CA le {{date}}",corps:"Madame, Monsieur,Vous etes convoques a la reunion du CA le {{date}} a {{heure}} - {{lieu}}.Ordre du jour:{{ordre_du_jour}}Merci de confirmer votre presence.Cordialement,{{president}}, President{{syndicat}}",moyens:["courriel"],auto:false},
  {id:4,cat:"Documents",nom:"Nouveau document disponible",sujet:"[{{syndicat}}] Nouveau document disponible sur votre portail",corps:"Madame, Monsieur,Un nouveau document est maintenant disponible sur votre portail coproprietaire:{{nom_document}}Connectez-vous sur app.predictek.ca pour y acceder.Cordialement,Administration {{syndicat}}",moyens:["courriel","portail"],auto:true},
  {id:5,cat:"Urgences",nom:"Alerte urgence immeuble",sujet:"URGENT - {{syndicat}}: {{titre_urgence}}",corps:"ALERTE URGENCE{{description}}Action requise: {{action}}Contacter immediatement: {{contact_urgence}}Administration {{syndicat}}",moyens:["courriel","sms"],auto:false},
  {id:6,cat:"Finances",nom:"Rapport mensuel CA",sujet:"[{{syndicat}}] Rapport mensuel - {{mois}} {{annee}}",corps:"Rapport mensuel - {{mois}} {{annee}}Soldes:- Exploitation: {{solde_op}} $- Prevoyance: {{solde_prev}} $Cotisations recues: {{cot_recues}} $Factures approuvees: {{fact_approuvees}}Rapport genere automatiquement par Predictek",moyens:["courriel"],auto:true},
];
var DESTINATAIRES=[
  {id:1,nom:"Jean-Francois Laroche",unite:"531",courriel:"jf.laroche@email.com",tel:"819-479-4203",groupes:["CA","president"]},
  {id:2,nom:"Maryse Fredette",unite:"",courriel:"m.fredette@email.com",tel:"418-555-0301",groupes:["CA","secretaire"]},
  {id:3,nom:"Michel Beaudoin",unite:"515",courriel:"m.beaudoin@email.com",tel:"418-555-0101",groupes:["copros_portail"]},
  {id:4,nom:"Lucette Tremblay",unite:"539",courriel:"l.tremblay@email.com",tel:"418-555-0539",groupes:["copros_portail","retard"]},
  {id:5,nom:"CA Syndicat Piedmont",unite:"",courriel:"ca@syndicatpiedmont.com",tel:"",groupes:["CA","liste_ca"]},
];

function TabEnvoiManuel(){
  var s0=useState(null);var tmpl=s0[0];var setTmpl=s0[1];
  var s1=useState({sujet:"",corps:"",moyens:["courriel"],destType:"individuel",destId:"1",destGroupe:"CA",schedule:"maintenant",schedulDate:today()});
  var form=s1[0];var setForm=s1[1];
  var s2=useState(HISTORIQUE_INIT);var hist=s2[0];var setHist=s2[1];
  var s3=useState(false);var sent=s3[0];var setSent=s3[1];
  function sf(k,v){setForm(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  function appliquerTemplate(t){
    setTmpl(t);
    sf("sujet",t.sujet.replace(/{{syndicat}}/g,"Syndicat Piedmont").replace(/{{unite}}/g,"XXX").replace(/{{date}}/g,"15 mai 2026").replace(/{{mois}}/g,"Avril").replace(/{{annee}}/g,"2026"));
    sf("corps",t.corps.replace(/{{syndicat}}/g,"Syndicat Piedmont"));
    sf("moyens",t.moyens);
  }

  function envoyer(){
    var dest=form.destType==="individuel"?DESTINATAIRES.find(function(d){return d.id===parseInt(form.destId);}):null;
    var entry={
      id:Date.now(),
      date:now_ts(),
      type:form.moyens[0],
      dest:dest?dest.nom+" ("+dest.courriel+")":(form.destGroupe==="CA"?"Conseil CA":form.destGroupe==="copros_portail"?"Copros portail actif":"Tous"),
      sujet:form.sujet,
      statut:"simule",
      syndicat:"PIED",
      moyen:form.moyens.join("+"),
    };
    setHist(function(p){return [entry].concat(p);});
    setSent(true);
    setTimeout(function(){setSent(false);},3000);
  }

  var MOYEN_COLORS={courriel:{c:T.blue,bg:T.blueL},sms:{c:T.accent,bg:T.accentL},portail:{c:T.purple,bg:T.purpleL}};

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr",gap:16}}>
      <div>
        <div style={{marginBottom:14}}>
          <Lbl l="Choisir un modele"/>
          <div style={{display:"grid",gap:6}}>
            {["Cotisations","Conformite","Reunions","Finances","Urgences","Documents"].map(function(cat){
              var tpls=TEMPLATES.filter(function(t){return t.cat===cat;});
              return(
                <div key={cat}>
                  <div style={{fontSize:9,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4,marginTop:4}}>{cat}</div>
                  {tpls.map(function(t){return(
                    <button key={t.id} onClick={function(){appliquerTemplate(t);}} style={{display:"block",width:"100%",textAlign:"left",background:tmpl&&tmpl.id===t.id?T.accentL:T.surface,border:"1px solid "+(tmpl&&tmpl.id===t.id?T.accent:T.border),borderRadius:7,padding:"7px 10px",fontSize:11,color:T.text,cursor:"pointer",fontFamily:"inherit",marginBottom:4}}>
                      <div style={{fontWeight:600}}>{t.nom}</div>
                      <div style={{display:"flex",gap:4,marginTop:3}}>
                        {t.moyens.map(function(m){var mc=MOYEN_COLORS[m]||{c:T.muted,bg:T.alt};return <Bdg key={m} bg={mc.bg} c={mc.c}>{m}</Bdg>;})}
                        {t.auto&&<Bdg bg={T.purpleL} c={T.purple}>Auto</Bdg>}
                      </div>
                    </button>
                  );})}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <div style={{marginBottom:10}}>
          <Lbl l="Destinataires"/>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <button onClick={function(){sf("destType","individuel");}} style={{flex:1,padding:"6px",border:"1px solid "+(form.destType==="individuel"?T.accent:T.border),borderRadius:7,background:form.destType==="individuel"?T.accentL:T.surface,color:form.destType==="individuel"?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>Individuel</button>
            <button onClick={function(){sf("destType","groupe");}} style={{flex:1,padding:"6px",border:"1px solid "+(form.destType==="groupe"?T.accent:T.border),borderRadius:7,background:form.destType==="groupe"?T.accentL:T.surface,color:form.destType==="groupe"?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>Groupe</button>
          </div>
          {form.destType==="individuel"?(
            <select value={form.destId} onChange={function(e){sf("destId",e.target.value);}} style={INP}>
              {DESTINATAIRES.map(function(d){return <option key={d.id} value={d.id}>{d.nom}{d.unite?" ("+d.unite+")":""}</option>;})}
            </select>
          ):(
            <select value={form.destGroupe} onChange={function(e){sf("destGroupe",e.target.value);}} style={INP}>
              <option value="CA">Conseil d administration (5 membres)</option>
              <option value="copros_portail">Coproprietaires portail actif (3)</option>
              <option value="tous_copros">Tous les coproprietaires (15)</option>
              <option value="retard">Coproprietaires en retard (2)</option>
            </select>
          )}
        </div>

        <div style={{marginBottom:10}}>
          <Lbl l="Moyens d envoi"/>
          <div style={{display:"flex",gap:8}}>
            {["courriel","sms","portail"].map(function(m){
              var on=form.moyens.includes(m);
              var mc=MOYEN_COLORS[m]||{c:T.muted,bg:T.alt};
              return(
                <button key={m} onClick={function(){sf("moyens",on?form.moyens.filter(function(x){return x!==m;}):form.moyens.concat([m]));}} style={{flex:1,padding:"8px",border:"1px solid "+(on?mc.c:T.border),borderRadius:7,background:on?mc.bg:T.surface,color:on?mc.c:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:on?600:400,textTransform:"capitalize"}}>{m}</button>
              );
            })}
          </div>
        </div>

        <div style={{marginBottom:10}}>
          <Lbl l="Sujet"/>
          <input value={form.sujet} onChange={function(e){sf("sujet",e.target.value);}} style={INP}/>
        </div>

        <div style={{marginBottom:10}}>
          <Lbl l="Message"/>
          <textarea value={form.corps} onChange={function(e){sf("corps",e.target.value);}} rows={8} style={Object.assign({},INP,{resize:"vertical"})}/>
        </div>

        <div style={{marginBottom:14,display:"flex",gap:8}}>
          <div style={{flex:1}}>
            <Lbl l="Envoi"/>
            <select value={form.schedule} onChange={function(e){sf("schedule",e.target.value);}} style={INP}>
              <option value="maintenant">Maintenant</option>
              <option value="planifie">Date planifiee</option>
            </select>
          </div>
          {form.schedule==="planifie"&&<div style={{flex:1}}>
            <Lbl l="Date d envoi"/>
            <input type="datetime-local" value={form.schedulDate} onChange={function(e){sf("schedulDate",e.target.value);}} style={INP}/>
          </div>}
        </div>

        {sent&&<div style={{background:T.accentL,borderRadius:8,padding:"9px 14px",fontSize:12,color:T.accent,marginBottom:10,fontWeight:600}}>Communication envoyee (simulation) - apparait dans l historique ci-dessous.</div>}

        <div style={{background:T.amberL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.amber,marginBottom:12}}>
          Mode simulation - Les envois reels necessitent SendGrid (courriel) et Twilio (SMS). Chaque envoi est loggue dans l historique.
        </div>

        <Btn fw dis={!form.sujet||!form.corps||form.moyens.length===0} onClick={envoyer}>
          {form.schedule==="planifie"?"Planifier l envoi":"Envoyer maintenant"}
        </Btn>

        <div style={{marginTop:16}}>
          <Lbl l="Historique recent"/>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:9,overflow:"hidden"}}>
            {hist.slice(0,5).map(function(h,i){return(
              <div key={h.id} style={{padding:"8px 12px",borderBottom:i<4?"1px solid "+T.border:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:T.text}}>{h.sujet.length>45?h.sujet.slice(0,45)+"...":h.sujet}</div>
                  <div style={{fontSize:10,color:T.muted}}>{h.dest} | {h.date}</div>
                </div>
                <Bdg bg={T.accentL} c={T.accent}>{h.moyen}</Bdg>
              </div>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabHistorique(){
  var s0=useState("tous");var filtre=s0[0];var setFiltre=s0[1];
  var hist=HISTORIQUE_INIT;
  var MOYEN_COLORS={courriel:{c:T.blue,bg:T.blueL},sms:{c:T.accent,bg:T.accentL},portail:{c:T.purple,bg:T.purpleL}};
  var liste=filtre==="tous"?hist:hist.filter(function(h){return h.moyen===filtre||h.moyen.includes(filtre);});
  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {["tous","courriel","sms","portail"].map(function(f){var a=filtre===f;return(
          <button key={f} onClick={function(){setFiltre(f);}} style={{background:a?T.navy:"#fff",border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"4px 12px",color:a?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>{f}</button>
        );})}
        <span style={{marginLeft:"auto",fontSize:11,color:T.muted}}>{liste.length} envoi(s)</span>
      </div>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:T.navy}}>
              {["Date","Sujet","Destinataire","Syndicat","Moyen","Statut"].map(function(h){return <th key={h} style={{padding:"8px 12px",fontSize:10,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>;})}
            </tr>
          </thead>
          <tbody>
            {liste.map(function(h){var mc=MOYEN_COLORS[h.moyen]||{c:T.muted,bg:T.alt};return(
              <tr key={h.id} style={{borderBottom:"1px solid "+T.border}}>
                <td style={{padding:"9px 12px",fontSize:11,color:T.muted,whiteSpace:"nowrap"}}>{h.date}</td>
                <td style={{padding:"9px 12px",fontSize:12,color:T.text,maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.sujet}</td>
                <td style={{padding:"9px 12px",fontSize:11,color:T.muted}}>{h.dest}</td>
                <td style={{padding:"9px 12px"}}><Bdg bg={T.blueL} c={T.blue}>{h.syndicat}</Bdg></td>
                <td style={{padding:"9px 12px"}}><Bdg bg={mc.bg} c={mc.c}>{h.moyen}</Bdg></td>
                <td style={{padding:"9px 12px"}}><Bdg bg={T.accentL} c={T.accent}>{h.statut}</Bdg></td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabConfig(){
  var s0=useState({
    sendgridKey:"SG.xxxx-demo",sendgridFrom:"noreply@predictek.ca",sendgridNom:"Predictek",
    twilioSid:"AC-demo",twilioToken:"demo",twilioFrom:"+18191234567",
    modeSimulation:true,
    courrielAdminErreurs:"admin@predictek.com",
    loggerTout:true,
  });
  var cfg=s0[0];var setCfg=s0[1];
  var s1=useState("");var testDest=s1[0];var setTestDest=s1[1];
  var s2=useState("");var testMsg=s2[0];var setTestMsg=s2[1];
  function sc(k,v){setCfg(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  return(
    <div>
      <div style={{background:cfg.modeSimulation?T.amberL:T.accentL,border:"1px solid "+(cfg.modeSimulation?T.amber:T.accent)+"44",borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:cfg.modeSimulation?T.amber:T.accent}}>
            {cfg.modeSimulation?"Mode simulation actif":"Mode production actif"}
          </div>
          <div style={{fontSize:11,color:cfg.modeSimulation?T.amber:T.accent,marginTop:2}}>
            {cfg.modeSimulation?"Les envois sont logges mais non transmis reellement":"Les courriels et SMS sont envoyes en temps reel"}
          </div>
        </div>
        <button onClick={function(){sc("modeSimulation",!cfg.modeSimulation);}} style={{width:50,height:26,borderRadius:13,background:cfg.modeSimulation?T.amber:T.accent,border:"none",cursor:"pointer",position:"relative"}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:cfg.modeSimulation?3:27,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:14}}>Configuration SendGrid (Courriel)</div>
          <div style={{display:"grid",gap:10}}>
            <div><Lbl l="Cle API SendGrid"/><input value={cfg.sendgridKey} onChange={function(e){sc("sendgridKey",e.target.value);}} style={INP} type="password" placeholder="SG.xxxxxxxxxxxx"/></div>
            <div><Lbl l="Adresse d expedition"/><input value={cfg.sendgridFrom} onChange={function(e){sc("sendgridFrom",e.target.value);}} style={INP} placeholder="noreply@predictek.ca"/></div>
            <div><Lbl l="Nom expediteur"/><input value={cfg.sendgridNom} onChange={function(e){sc("sendgridNom",e.target.value);}} style={INP}/></div>
          </div>
          <div style={{marginTop:12,background:T.blueL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.blue}}>
            SendGrid gratuit: 100 courriels/jour. Plan Essentials: 14.95$/mois pour 50 000/mois.
          </div>
        </div>

        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:14}}>Configuration Twilio (SMS)</div>
          <div style={{display:"grid",gap:10}}>
            <div><Lbl l="Account SID"/><input value={cfg.twilioSid} onChange={function(e){sc("twilioSid",e.target.value);}} style={INP} type="password" placeholder="ACxxxxxxxxxxxx"/></div>
            <div><Lbl l="Auth Token"/><input value={cfg.twilioToken} onChange={function(e){sc("twilioToken",e.target.value);}} style={INP} type="password"/></div>
            <div><Lbl l="Numero expediteur"/><input value={cfg.twilioFrom} onChange={function(e){sc("twilioFrom",e.target.value);}} style={INP} placeholder="+18191234567"/></div>
          </div>
          <div style={{marginTop:12,background:T.blueL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.blue}}>
            Twilio: ~0.0079 USD/SMS. Environ 8$/mois pour 1000 SMS.
          </div>
        </div>

        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:14}}>Test d envoi</div>
          <div style={{display:"grid",gap:8,marginBottom:10}}>
            <div><Lbl l="Destinataire (courriel ou tel)"/><input value={testDest} onChange={function(e){setTestDest(e.target.value);}} style={INP} placeholder="test@email.com ou +14181234567"/></div>
            <div><Lbl l="Message test"/><input value={testMsg} onChange={function(e){setTestMsg(e.target.value);}} style={INP} placeholder="Ceci est un test Predictek"/></div>
          </div>
          <Btn sm fw onClick={function(){if(!testDest||!testMsg)return;alert("Test envoye (simulation) a: "+testDest+"Connectez SendGrid/Twilio pour envois reels.");}} dis={!testDest||!testMsg}>Envoyer test</Btn>
        </div>

        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:14}}>Options</div>
          {[
            {k:"loggerTout",l:"Logger tous les envois",desc:"Conserve l historique complet"},
            {k:"modeSimulation",l:"Mode simulation",desc:"Desactiver pour envois reels"},
          ].map(function(item){return(
            <div key={item.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+T.border}}>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:T.text}}>{item.l}</div>
                <div style={{fontSize:10,color:T.muted}}>{item.desc}</div>
              </div>
              <button onClick={function(){sc(item.k,!cfg[item.k]);}} style={{width:44,height:24,borderRadius:12,background:cfg[item.k]?T.accent:T.border,border:"none",cursor:"pointer",position:"relative",flexShrink:0}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:cfg[item.k]?23:3,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
              </button>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}


function StatCard(p){return(
  <div style={{background:p.bg||T.accentL,borderRadius:10,padding:"13px 15px",border:"1px solid "+(p.c||T.accent)+"33"}}>
    <div style={{fontSize:9,color:p.c||T.accent,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.07em"}}>{p.l}</div>
    <div style={{fontSize:20,fontWeight:800,color:p.c||T.accent}}>{p.v}</div>
    {p.sub&&<div style={{fontSize:10,color:(p.c||T.accent)+"99",marginTop:2}}>{p.sub}</div>}
  </div>
);}
function Th(p){return <th style={{padding:"8px 12px",textAlign:p.r?"right":"left",fontSize:10,fontWeight:700,color:p.light?"#8da0bb":T.muted,background:p.dark?T.navy:T.alt,whiteSpace:"nowrap",borderBottom:"1px solid "+T.border}}>{p.children}</th>;}
function Td(p){return <td style={{padding:"8px 12px",fontSize:12,color:p.c||T.text,fontWeight:p.bold?700:400,textAlign:p.r?"right":"left",borderBottom:"1px solid "+T.border,background:p.bg||"transparent"}}>{p.children}</td>;}

function TabEmployes(){
  var EMPLOYES_INIT=[];
  var s0=useState(EMPLOYES_INIT);var employes=s0[0];var setEmployes=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState(false);var showN=s2[0];var setShowN=s2[1];
  var s3=useState({});var nf=s3[0];var setNf=s3[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  var actifs=employes.filter(function(e){return e.actif;});
  var totalMasseSal=actifs.reduce(function(a,e){return a+e.salaire;},0);

  var selE=sel?employes.find(function(e){return e.id===sel;}):null;

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        <StatCard l="Employes actifs" v={actifs.length} c={T.navy} bg={T.blueL}/>
        <StatCard l="Masse salariale" v={money(totalMasseSal)} c={T.accent} bg={T.accentL} sub="annuelle"/>
        <StatCard l="Masse salariale" v={money(totalMasseSal/26)} c={T.purple} bg={T.purpleL} sub="par periode (26)"/>
        <StatCard l="Charges patronales" v={money(totalMasseSal*0.15)} c={T.amber} bg={T.amberL} sub="estimees ~15%"/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <b style={{fontSize:14,color:T.navy}}>Registre des employes</b>
        <Btn sm onClick={function(){setNf({nom:"",prenom:"",poste:"",dept:"Operations",type:"TP",salaire:"",dateEmbauche:today(),tel:"",courriel:"",naiss:"",nas:"",adresse:"",federal:"M",provincial:"M",rrq:true,rqap:true,vacances:3,actif:true,notes:""});setShowN(true);}}>+ Nouvel employe</Btn>
      </div>
      <div style={{display:"flex",gap:14}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr><Th dark light>Employe</Th><Th dark light>Poste</Th><Th dark light>Dept</Th><Th dark light r>Salaire annuel</Th><Th dark light>Embauche</Th><Th dark light>Vacances</Th><Th dark light>Statut</Th></tr></thead>
              <tbody>
                {employes.map(function(e){return(
                  <tr key={e.id} onClick={function(){setSel(e.id);}} style={{borderBottom:"1px solid "+T.border,background:sel===e.id?T.accentL:e.actif?T.surface:T.alt,cursor:"pointer"}}>
                    <Td bold>{e.prenom} {e.nom}</Td>
                    <Td c={T.muted}>{e.poste}</Td>
                    <Td><Bdg bg={T.blueL} c={T.blue}>{e.dept}</Bdg></Td>
                    <Td r bold>{money(e.salaire)}</Td>
                    <Td c={T.muted}>{e.dateEmbauche}</Td>
                    <Td>{e.vacances} sem.</Td>
                    <Td><Bdg bg={e.actif?T.accentL:T.redL} c={e.actif?T.accent:T.red}>{e.actif?"Actif":"Inactif"}</Bdg></Td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>

        {selE&&(
          <div style={{width:320,flexShrink:0}}>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:T.navy}}>{selE.prenom} {selE.nom}</div>
                  <div style={{fontSize:12,color:T.muted}}>{selE.poste}</div>
                </div>
                <button onClick={function(){setSel(null);}} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:18,lineHeight:1}}>x</button>
              </div>
              <div style={{display:"grid",gap:0}}>
                {[
                  {l:"Departement",v:selE.dept},
                  {l:"Type",v:selE.type==="TP"?"Temps plein":"Temps partiel"},
                  {l:"Salaire annuel",v:money(selE.salaire)},
                  {l:"Salaire bimensuel",v:money(Math.round(selE.salaire/26*100)/100)},
                  {l:"Date d embauche",v:selE.dateEmbauche},
                  {l:"Semaines vacances",v:selE.vacances+" semaines"},
                  {l:"Telephone",v:selE.tel||"-"},
                  {l:"Courriel",v:selE.courriel||"-"},
                  {l:"Date de naissance",v:selE.naiss||"-"},
                  {l:"Adresse",v:selE.adresse||"-"},
                  {l:"Code federal",v:selE.federal},
                  {l:"Code provincial",v:selE.provincial},
                  {l:"RRQ",v:selE.rrq?"Cotisant":"Exempte"},
                  {l:"RQAP",v:selE.rqap?"Cotisant":"Exempte"},
                ].map(function(item,i){return(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"7px 0",borderBottom:"1px solid "+T.border}}>
                    <span style={{fontSize:10,color:T.muted,flexShrink:0,marginRight:8}}>{item.l}</span>
                    <span style={{fontSize:11,fontWeight:500,color:T.text,textAlign:"right",wordBreak:"break-word"}}>{item.v}</span>
                  </div>
                );})}
              </div>
              {selE.notes&&<div style={{marginTop:10,background:T.alt,borderRadius:7,padding:"8px 10px",fontSize:11,color:T.muted}}>{selE.notes}</div>}
              <div style={{marginTop:12,display:"flex",gap:6}}>
                <Btn sm fw bg={selE.actif?T.redL:T.accentL} tc={selE.actif?T.red:T.accent} bdr={"1px solid "+(selE.actif?T.red:T.accent)} onClick={function(){setEmployes(function(prev){return prev.map(function(e){return e.id===selE.id?Object.assign({},e,{actif:!e.actif}):e;});});}}>
                  {selE.actif?"Desactiver":"Reactiver"}
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouvel employe" w={580}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><Lbl l="Prenom"/><input value={nf.prenom||""} onChange={function(e){snf("prenom",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Nom"/><input value={nf.nom||""} onChange={function(e){snf("nom",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Poste"/><input value={nf.poste||""} onChange={function(e){snf("poste",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Departement"/>
            <select value={nf.dept||"Operations"} onChange={function(e){snf("dept",e.target.value);}} style={INP}>
              {["Administration","Operations","Terrain","Comptabilite","Direction"].map(function(d){return <option key={d}>{d}</option>;})}
            </select>
          </div>
          <div><Lbl l="Salaire annuel ($)"/><input type="number" value={nf.salaire||""} onChange={function(e){snf("salaire",parseFloat(e.target.value)||0);}} style={INP}/></div>
          <div><Lbl l="Date d embauche"/><input type="date" value={nf.dateEmbauche||""} onChange={function(e){snf("dateEmbauche",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Telephone"/><input value={nf.tel||""} onChange={function(e){snf("tel",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Courriel"/><input value={nf.courriel||""} onChange={function(e){snf("courriel",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Date de naissance"/><input type="date" value={nf.naiss||""} onChange={function(e){snf("naiss",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Semaines de vacances"/>
            <select value={nf.vacances||3} onChange={function(e){snf("vacances",parseInt(e.target.value));}} style={INP}>
              {[2,3,4,5,6].map(function(n){return <option key={n} value={n}>{n} semaines</option>;})}
            </select>
          </div>
          <div style={{gridColumn:"1/-1"}}><Lbl l="Adresse"/><input value={nf.adresse||""} onChange={function(e){snf("adresse",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Code fiscal federal"/>
            <select value={nf.federal||"M"} onChange={function(e){snf("federal",e.target.value);}} style={INP}><option value="M">M - Marie</option><option value="C">C - Celibataire</option><option value="E">E - Exempte</option></select>
          </div>
          <div><Lbl l="Code fiscal provincial"/>
            <select value={nf.provincial||"M"} onChange={function(e){snf("provincial",e.target.value);}} style={INP}><option value="M">M - Marie</option><option value="C">C - Celibataire</option><option value="E">E - Exempte</option></select>
          </div>
          <div style={{gridColumn:"1/-1"}}><Lbl l="Notes"/><textarea value={nf.notes||""} onChange={function(e){snf("notes",e.target.value);}} rows={2} style={Object.assign({},INP,{resize:"vertical"})}/></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){if(!nf.nom||!nf.prenom)return;setEmployes(function(prev){return prev.concat([Object.assign({},nf,{id:Date.now(),type:"TP",nas:"***-***-***",actif:true})]);});setShowN(false);}}>Ajouter l employe</Btn>
          <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}

function TabEquipeAcces(){
  var s0=useState("employes");var eOng=s0[0];var setEOng=s0[1];
  var ETABS=[{id:"employes",l:"Employes Predictek"},{id:"usagers",l:"Usagers systeme"}];
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><div style={{fontSize:14,fontWeight:800,color:T.navy}}>Equipe et acces</div><div style={{fontSize:11,color:T.muted}}>Employes Predictek et acces au systeme</div></div>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:14,background:T.surface,padding:4,borderRadius:9,border:"1px solid "+T.border,width:"fit-content"}}>
        {ETABS.map(function(t){var a=eOng===t.id;return(<button key={t.id} onClick={function(){setEOng(t.id);}} style={{background:a?"#6B3FA0":"transparent",border:"none",borderRadius:7,padding:"6px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400}}>{t.l}</button>);})}
      </div>
      {eOng==="employes"&&<TabEmployes/>}
      {eOng==="usagers"&&<GestionUsagers syndicats={[]}/>}
    </div>
  );
}

function TabCommunicationsHub(){
  var s0=useState("envoi");var cOng=s0[0];var setCOng=s0[1];
  var CTABS=[{id:"envoi",l:"Envoi"},{id:"historique",l:"Historique"},{id:"config",l:"Configuration"}];
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{fontSize:14,fontWeight:800,color:T.navy}}>Communications Predictek</div><div style={{fontSize:11,color:T.muted}}>Courriel, SMS et portail - geres par l equipe Predictek</div></div>
        <div style={{display:"flex",gap:6}}>
          <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:T.blueL,color:T.blue}}>SendGrid</span>
          <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:T.accentL,color:T.accent}}>Twilio</span>
        </div>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:14,background:T.surface,padding:4,borderRadius:9,border:"1px solid "+T.border}}>
        {CTABS.map(function(t){var a=cOng===t.id;return(<button key={t.id} onClick={function(){setCOng(t.id);}} style={{background:a?T.blue:"transparent",border:"none",borderRadius:7,padding:"6px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400}}>{t.l}</button>);})}
      </div>
      {cOng==="envoi"&&<TabEnvoiManuel/>}
      {cOng==="historique"&&<TabHistorique/>}
      {cOng==="config"&&<TabConfig/>}
    </div>
  );
}





// ===== MODULE PRINCIPAL HUB =====
export default function Hub(){
  var s0=useState("syndicats");var ong=s0[0];var setOng=s0[1];
  var s1=useState(SYNDICATS_INIT);var syndicats=s1[0];var setSyndicats=s1[1];
  var s2=useState(null);var detail=s2[0];var setDetail=s2[1];
  var s3=useState(false);var creer=s3[0];var setCreer=s3[1];
  var s4=useState(null);var setup=s4[0];var setSetup=s4[1];
  var s5=useState(false);var showParams=s5[0];var setShowParams=s5[1];

  useEffect(function(){
    sb.select("syndicats",{order:"created_at.desc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){
        setSyndicats(res.data.map(function(s){
          return {
            id:s.id,code:s.code,nom:s.nom,adr:s.adr||"",
            ville:s.ville||"",province:s.province||"QC",
            immat:s.immat||"",nbUnites:s.nb_unites||0,
            president:s.president||"",courriel:s.courriel||"",
            tel:s.tel||"",telUrgences:s.tel_urgences||"",
            statut:s.statut||"actif",
            cotisationMensuelle:0,alertesCE:0,alertesAss:0,
            alertesPAP:0,alertesCarnet:0
          };
        }));
      }
    }).catch(function(){});
  },[]);

  var actifs=syndicats.filter(function(s){return s.statut==="actif";});
  var totalUnites=actifs.reduce(function(a,s){return a+s.nbUnites;},0);
  var totalCot=actifs.reduce(function(a,s){return a+s.cotisationMensuelle;},0);
  var totalAlertes=actifs.reduce(function(a,s){return a+s.alertesCE+s.alertesAss+s.alertesPAP+s.alertesCarnet;},0);
  var totalFact=actifs.reduce(function(a,s){return a+s.facturesEnAttente;},0);
  var scoreMoyen=actifs.length>0?Math.round(actifs.reduce(function(a,s){return a+Math.round((s.scoreFinancier+s.scoreConformite+s.scoreEntretien)/3);},0)/actifs.length):0;

  var TABS=[{id:"syndicats",l:"Syndicats"},{id:"equipe",l:"Equipe et acces"},{id:"comms_hub",l:"Communications"},{id:"params_predictek",l:"Parametres"},{id:"rapports",l:"Rapports"}];

  if(creer){
    return(
      <div style={{fontFamily:"Georgia,serif"}}>
        <div style={{background:T.navy,display:"flex",alignItems:"center",gap:12,padding:"12px 20px"}}>
          <Btn sm bg={"#ffffff20"} tc={"#fff"} bdr={"1px solid #ffffff40"} onClick={function(){setCreer(false);}}>Annuler</Btn>
        </div>
        <Onboarding onTermine={function(nouveau){
          var saved=Object.assign({},nouveau,{statut:"actif",cotisationMensuelle:0,alertesCE:0,alertesAss:0,alertesPAP:0,alertesCarnet:0});
          setSyndicats(function(prev){return prev.filter(function(s){return s.code!==nouveau.code;}).concat([saved]);});
          setCreer(false);
          sb.insert("syndicats",{code:nouveau.code,nom:nouveau.nom,adr:nouveau.adr||"",ville:nouveau.ville||"",province:nouveau.province||"QC",immat:nouveau.immat||"",nb_unites:nouveau.nbUnites||0,president:nouveau.president||"",courriel:nouveau.courriel||"",tel:nouveau.tel||"",statut:"actif"}).then(function(res){
            if(res&&res.data&&res.data.id){
              setSyndicats(function(prev){return prev.map(function(s){return s.code===nouveau.code?Object.assign({},s,{id:res.data.id}):s;});});
              sb.log("syndicat","creation","Nouveau syndicat: "+nouveau.nom,"",nouveau.code);
            }
          }).catch(function(){});
        }}/>
      </div>
    );
  }

  if(showParams&&detail){
    var selSP=syndicats.find(function(s){return s.id===detail;});
    return(
      <div style={{fontFamily:"Georgia,serif"}}>
        <div style={{background:T.navy,display:"flex",alignItems:"center",gap:12,padding:"12px 20px"}}>
          <Btn sm bg={"#ffffff20"} tc={"#fff"} bdr={"1px solid #ffffff40"} onClick={function(){setShowParams(false);}}>Retour au syndicat</Btn>
          <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{selSP?selSP.nom:""} - Parametres</span>
        </div>
        {selSP&&<ParamsSyndicat syndicat={selSP.code}/>}
      </div>
    );
  }
  if(detail){
    var selS=syndicats.find(function(s){return s.id===detail;});
    return(
      <div style={{padding:16,fontFamily:"Georgia,serif"}}>
        {selS&&<DetailSyndicat syndicat={selS} onRetour={function(){setDetail(null);setShowParams(false);}} onParams={function(){setShowParams(true);}}/>}
      </div>
    );
  }

  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Configuration Predictek</div>
          <div style={{fontSize:11,color:T.muted}}>Vue globale - {actifs.length} syndicat(s) actif(s)</div>
        </div>
        {ong==="syndicats"&&<Btn onClick={function(){setCreer(true);}}>+ Nouveau syndicat</Btn>}
      </div>

      {totalFact>0&&(
        <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.amber}}>{totalFact} facture(s) en attente d approbation sur l ensemble des syndicats</div>
          <Bdg bg={T.amberL} c={T.amber}>{money(actifs.reduce(function(a,s){return a+s.montantFactures;},0))}</Bdg>
        </div>
      )}

      <div style={{display:"flex",gap:3,marginBottom:16,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {TABS.map(function(t){var a=ong===t.id;return(
          <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"7px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t.l}</button>
        );})}
      </div>

      {ong==="syndicats"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {syndicats.map(function(s){return(
            <CarteSyndicat key={s.id} syndicat={s} onClick={function(){setDetail(s.id);}} onSetup={function(){setCreer(true);}}/>
          );})}
        </div>
      )}

      
      {ong==="equipe"&&<TabEquipeAcces/>}
      {ong==="comms_hub"&&<TabCommunicationsHub/>}
      {ong==="params_predictek"&&<ParamsPredictek/>}

      {ong==="rapports"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {actifs.map(function(s){return(
              <div key={s.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.navy}}>{s.nom}</div>
                  <ScoreGlobal s={s}/>
                </div>
                <div style={{fontSize:11,color:T.muted,marginBottom:8}}>Dernier rapport: {s.dernierRapport||"-"}</div>
                <div style={{display:"grid",gap:6}}>
                  <ScoreBarre l="Financier" v={s.scoreFinancier}/>
                  <ScoreBarre l="Conformite" v={s.scoreConformite}/>
                  <ScoreBarre l="Entretien" v={s.scoreEntretien}/>
                </div>
                <div style={{marginTop:10}}>
                  <Btn sm fw onClick={function(){alert("Rapport "+s.nom+" genere! (Supabase requis pour envoi reel)");}}>Generer rapport</Btn>
                </div>
              </div>
            );})}
          </div>
        </div>
      )}
    </div>
  );
}
