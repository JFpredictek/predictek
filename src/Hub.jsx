import { useState } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",pop:"#3CAF6E",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
var money=function(n){return Math.abs(n||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
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
var SYNDICATS_INIT=[
  {
    id:1, nom:"Syndicat Piedmont", code:"PIED",
    adr:"Ch. du Hibou, Stoneham QC G3C 1T1",
    president:"Jean-Francois Laroche", courriel:"jf.laroche@email.com",
    tel:"819-479-4203", immat:"1144524577",
    anneeConstruction:2013, nbUnites:36,
    cotisationMensuelle:14297.28,
    soldeOp:7361.88, soldePrev:64235.01, soldeAss:36178.37,
    alertesCE:1, alertesAss:2, alertesPAP:3, alertesCarnet:2,
    facturesEnAttente:2, montantFactures:1685.00,
    prochReunion:"2026-05-15",
    gestionnaire:"Jean-Francois Laroche",
    statut:"actif",
    scoreFinancier:88, scoreConformite:74, scoreEntretien:82,
    exercice:"1 nov au 31 oct",
    nbCoprosPortail:3,
    dernierRapport:"2026-04-05",
  },
  {
    id:2, nom:"Syndicat Les Erables", code:"ERAB",
    adr:"345 rue des Erables, Quebec QC G1V 2K8",
    president:"Marie-Claude Vachon", courriel:"mc.vachon@email.com",
    tel:"418-654-3210", immat:"1187234512",
    anneeConstruction:2008, nbUnites:24,
    cotisationMensuelle:9850.00,
    soldeOp:12450.00, soldePrev:38900.00, soldeAss:18200.00,
    alertesCE:3, alertesAss:1, alertesPAP:1, alertesCarnet:1,
    facturesEnAttente:1, montantFactures:3200.00,
    prochReunion:"2026-06-10",
    gestionnaire:"Marie-Claude Vachon",
    statut:"actif",
    scoreFinancier:92, scoreConformite:81, scoreEntretien:68,
    exercice:"1 jan au 31 dec",
    nbCoprosPortail:8,
    dernierRapport:"2026-04-05",
  },
  {
    id:3, nom:"Syndicat Belvedere", code:"BELV",
    adr:"78 ave du Belvedere, Levis QC G6V 5P2",
    president:"Robert Champagne", courriel:"r.champagne@email.com",
    tel:"418-833-7744", immat:"1201456789",
    anneeConstruction:2018, nbUnites:18,
    cotisationMensuelle:7200.00,
    soldeOp:5100.00, soldePrev:22400.00, soldeAss:11800.00,
    alertesCE:0, alertesAss:0, alertesPAP:2, alertesCarnet:0,
    facturesEnAttente:3, montantFactures:5670.00,
    prochReunion:"2026-05-28",
    gestionnaire:"Robert Champagne",
    statut:"actif",
    scoreFinancier:76, scoreConformite:95, scoreEntretien:98,
    exercice:"1 nov au 31 oct",
    nbCoprosPortail:12,
    dernierRapport:"2026-04-05",
  },
  {
    id:4, nom:"Syndicat Mont-Royal", code:"MONT",
    adr:"221 rue Mont-Royal, Montreal QC H2T 2S8",
    president:"", courriel:"",
    tel:"", immat:"",
    anneeConstruction:0, nbUnites:0,
    cotisationMensuelle:0,
    soldeOp:0, soldePrev:0, soldeAss:0,
    alertesCE:0, alertesAss:0, alertesPAP:0, alertesCarnet:0,
    facturesEnAttente:0, montantFactures:0,
    prochReunion:"",
    gestionnaire:"",
    statut:"setup",
    scoreFinancier:0, scoreConformite:0, scoreEntretien:0,
    exercice:"",
    nbCoprosPortail:0,
    dernierRapport:"",
  },
];

var USAGERS_INIT=[
  {id:1,nom:"Marie Tremblay",courriel:"m.tremblay@predictek.com",role:"Admin",syndicats:["PIED","ERAB","BELV","MONT"],actif:true,derniereConnexion:"2026-04-25"},
  {id:2,nom:"Jean-Philippe Roy",courriel:"jp.roy@predictek.com",role:"Gestionnaire",syndicats:["PIED","ERAB"],actif:true,derniereConnexion:"2026-04-24"},
  {id:3,nom:"Sarah Bolduc",courriel:"s.bolduc@predictek.com",role:"Gestionnaire",syndicats:["BELV"],actif:true,derniereConnexion:"2026-04-22"},
  {id:4,nom:"Carlos Mendes",courriel:"c.mendes@predictek.com",role:"Terrain",syndicats:["PIED","BELV"],actif:true,derniereConnexion:"2026-04-20"},
  {id:5,nom:"Amelie Caron",courriel:"a.caron@predictek.com",role:"Gestionnaire",syndicats:[],actif:false,derniereConnexion:"2026-03-01"},
];

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
        <div style={{fontSize:10,color:T.muted}}>{s.gestionnaire||"—"}</div>
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
            {l:"President",v:s.president||"—"},
            {l:"Courriel",v:s.courriel||"—"},
            {l:"Telephone",v:s.tel||"—"},
            {l:"Immatriculation",v:s.immat||"—"},
            {l:"Annee construction",v:s.anneeConstruction||"—"},
            {l:"Exercice financier",v:s.exercice||"—"},
            {l:"Gestionnaire Predictek",v:s.gestionnaire||"—"},
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
    var lines=text.trim().split("\n");
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
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Importez votre fichier Excel/CSV avec les informations des coproprietaires. Ce n est pas obligatoire — vous pouvez les ajouter manuellement plus tard.</div>
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
            <input id="csvCreer" type="file" accept=".csv,.txt,.xlsx" onChange={handleCSV} style={{display:"none"}}/>
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

      {etape===3&&(
        <div>
          <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:16}}>Confirmation</div>
          <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:10,padding:16,marginBottom:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {l:"Nom",v:form.nom},{l:"Code",v:form.code},
                {l:"President",v:form.president||"—"},{l:"Immatriculation",v:form.immat||"—"},
                {l:"Exercice",v:form.exercice},{l:"Gestionnaire",v:form.gestionnaire||"—"},
                {l:"Adresse",v:form.adr||"—"},{l:"Coproprietaires CSV",v:nbImport>0?nbImport+" detectes":"A ajouter manuellement"},
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
                <td style={{padding:"9px 12px",fontSize:11,color:T.muted}}>{u.derniereConnexion||"—"}</td>
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
  courrielCopropriétaires:"info@syndicatpiedmont.com",
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
    {id:3,nom:"Reglement 2024-001 — Animaux",type:"reglement",date:"2024-03-20",taille:"120 KB",dispo:true},
    {id:4,nom:"Reglement 2024-002 — Stationnement",type:"reglement",date:"2024-06-15",taille:"95 KB",dispo:false},
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

  function sp(k,v){setParams(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  function sauvegarder(){
    try{localStorage.setItem("predictek_params_"+syndicat,JSON.stringify(params));}catch(e){}
    setSavedMsg("Parametres sauvegardes!");
    setTimeout(function(){setSavedMsg("");},3000);
  }
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
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Parametres — {params.nom}</div>
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
              <div style={{gridColumn:"1/-1"}}><Lbl l="Adresse de l immeuble"/><input value={params.adr} onChange={function(e){sp("adr",e.target.value);}} style={INP}/></div>
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
            <CardSub>Selon la declaration de copropriete — le nombre de membres doit etre impair (3, 5, 7 ou 9)</CardSub>
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
                {k:"courrielCopropriétaires",l:"Courriel communications coproprietaires",ph:"info@syndicat.com",desc:"Adresse de contact general pour les coproprietaires"},
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
                {k:"autoAlertesConformite",l:"Alertes conformite automatiques",desc:"CE, assurance, PAP — 90 jours, 30 jours, 7 jours avant expiration"},
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
  var STEPS=["Syndicat","CA","Copropriétaires","Soldes","Documents","Carnet","Attestation","Confirmation"];
  return(
    <div style={{display:"flex",marginBottom:24,overflowX:"auto"}}>
      {STEPS.map(function(s,i){
        var done=p.step>i+1;var current=p.step===i+1;var future=p.step<i+1;
        return(
          <div key={i} style={{display:"flex",alignItems:"center",flexShrink:0}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:80}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:done?T.accent:current?T.navy:T.border,display:"flex",alignItems:"center",justifyContent:"center",color:done||current?"#fff":T.muted,fontSize:done?16:12,fontWeight:700,marginBottom:4}}>
                {done?"✓":i+1}
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
  var lines=text.trim().split("\n");
  if(lines.length<2)return{ok:false,msg:"Fichier vide ou invalide",rows:[]};
  var headers=lines[0].split(",").map(function(h){return h.trim().replace(/"/g,"").toLowerCase();});
  var rows=[];
  var errors=[];
  for(var i=1;i<lines.length;i++){
    var cols=lines[i].split(",").map(function(c){return c.trim().replace(/"/g,"");});
    if(cols.length<3)continue;
    var row={};
    headers.forEach(function(h,j){row[h]=cols[j]||"";});
    // Normalize common field names
    var unite=row["unite"]||row["unit"]||row["no_unite"]||row["numero"]||"";
    var prenom=row["prenom"]||row["first_name"]||row["firstname"]||"";
    var nom=row["nom"]||row["last_name"]||row["lastname"]||row["name"]||"";
    var courriel=row["courriel"]||row["email"]||row["e-mail"]||"";
    var tel=row["tel"]||row["telephone"]||row["phone"]||"";
    var fraction=parseFloat(row["fraction"]||row["quote_part"]||row["quotient"]||"0")||0;
    var cotisation=parseFloat(row["cotisation"]||row["mensualite"]||row["contribution"]||"0")||0;
    if(!unite){errors.push("Ligne "+(i+1)+": numero d unite manquant");continue;}
    rows.push({unite:unite,prenom:prenom,nom:nom,courriel:courriel,tel:tel,fraction:fraction,cotisation:cotisation,pap:false,ce:"",ass:"",loc:false,animaux:0});
  }
  return{ok:rows.length>0,msg:rows.length+" coproprietaires importes"+(errors.length>0?" ("+errors.length+" erreurs)":""),rows:rows,errors:errors};
}

// COMPOSANTES CARNET (Loi 16)
var COMPOSANTES_LOI16=[
  {cat:"Structure",nom:"Fondations et structure principale",dureeVie:50,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Structure",nom:"Balcons et terrasses",dureeVie:30,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Enveloppe",nom:"Toiture — membrane et structure",dureeVie:25,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Enveloppe",nom:"Fenetres et portes exterieures — parties communes",dureeVie:30,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Enveloppe",nom:"Revetement exterieur",dureeVie:30,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Mecanique",nom:"Systeme de chauffage — parties communes",dureeVie:20,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Mecanique",nom:"Systeme de ventilation — parties communes",dureeVie:20,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Mecanique",nom:"Tuyauterie et plomberie — parties communes",dureeVie:40,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Mecanique",nom:"Systeme electrique — parties communes",dureeVie:40,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Mecanique",nom:"Ascenseur(s)",dureeVie:25,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
  {cat:"Securite",nom:"Systeme de detection incendie",dureeVie:15,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Securite",nom:"Systeme de gicleurs",dureeVie:25,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
  {cat:"Securite",nom:"Systeme d acces et interphone",dureeVie:15,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
  {cat:"Amenagements",nom:"Stationnement — surface et structure",dureeVie:20,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
  {cat:"Amenagements",nom:"Paysagement et amenagements exterieurs",dureeVie:20,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
  {cat:"Amenagements",nom:"Eclairage — parties communes",dureeVie:15,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Interieur",nom:"Corridors et hall d entree",dureeVie:20,anneeInstall:"",etat:"bon",notes:"",obligatoire:true},
  {cat:"Interieur",nom:"Peinture — parties communes",dureeVie:10,anneeInstall:"",etat:"bon",notes:"",obligatoire:false},
];

function Onboarding(p){
  var s0=useState(1);var step=s0[0];var setStep=s0[1];
  var s1=useState({
    // Etape 1 — Syndicat
    nom:"",code:"",adr:"",ville:"",province:"QC",codePostal:"",immat:"",
    anneeConstruction:"",nbUnites:"",exercice:"1 nov au 31 oct",
    quorumCA:"majorite",quorumAGO:25,
    // Etape 2 — CA
    nbMembresCA:5,president:"",secretaire:"",tresorier:"",membresCA:[],
    courrielCA:"",courrielFactures:"",courrielCopros:"",courrielUrgences:"",
    // Etape 4 — Soldes
    soldeOp:"",soldePrev:"",soldeAss:"",dateOuverture:"",
    budgetAnnuel:"",cotisationMoyenne:"",
    // Etape 5 — Documents
    documents:[],
    // Etape 6 — Carnet
    composantes:COMPOSANTES_LOI16.map(function(c,i){return Object.assign({},c,{id:i});}),
    inspecteur:"",dateInspection:"",
    // Etape 7 — Attestation
    attestationAcceptee:false,
  });
  var data=s1[0];var setData=s1[1];
  var s2=useState([]);var copros=s2[0];var setCopros=s2[1];
  var s3=useState("");var csvMsg=s3[0];var setCSVMsg=s3[1];
  var s4=useState([]);var csvErrors=s4[0];var setCSVErrors=s4[1];
  var s5=useState("");var newMembre=s5[0];var setNewMembre=s5[1];
  var fileRef=useRef(null);
  var docRef=useRef(null);
  var anneeConstruction=parseInt(data.anneeConstruction)||new Date().getFullYear();

  function sd(k,v){setData(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
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
          <div style={{fontSize:18,fontWeight:800}}>Nouveau syndicat — Configuration initiale</div>
          <div style={{fontSize:11,color:"#8da0bb",marginTop:2}}>Completez les 8 etapes pour activer votre syndicat dans Predictek</div>
        </div>
        <div style={{fontSize:22,fontWeight:900,color:T.accent}}>Predictek</div>
      </div>

      <StepIndicator step={step}/>

      {step===1&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 1 — Informations du syndicat</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Ces informations proviennent de votre declaration de copropriete et du Registre foncier du Quebec.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field l="Nom officiel du syndicat" full hint="Ex: Syndicat des coproprietaires du Ch. du Hibou"><input value={data.nom} onChange={function(e){sd("nom",e.target.value);}} style={INP} placeholder="Syndicat Piedmont"/></Field>
            <Field l="Code court (4 lettres)" hint="Identifiant interne Predictek"><input value={data.code} onChange={function(e){sd("code",e.target.value.toUpperCase().slice(0,4));}} style={INP} placeholder="PIED" maxLength={4}/></Field>
            <Field l="Annee de construction"><input type="number" value={data.anneeConstruction} onChange={function(e){sd("anneeConstruction",e.target.value);}} style={INP} placeholder="2013"/></Field>
            <Field l="Adresse de l immeuble" full><input value={data.adr} onChange={function(e){sd("adr",e.target.value);}} style={INP} placeholder="123 Chemin du Hibou"/></Field>
            <Field l="Ville"><input value={data.ville} onChange={function(e){sd("ville",e.target.value);}} style={INP} placeholder="Stoneham-et-Tewkesbury"/></Field>
            <Field l="Province"><select value={data.province} onChange={function(e){sd("province",e.target.value);}} style={INP}><option>QC</option><option>ON</option><option>BC</option><option>AB</option></select></Field>
            <Field l="Code postal"><input value={data.codePostal} onChange={function(e){sd("codePostal",e.target.value.toUpperCase());}} style={INP} placeholder="G3C 1T1"/></Field>
            <Field l="Numero immatriculation REQ" hint="11 chiffres — registre entreprises Quebec"><input value={data.immat} onChange={function(e){sd("immat",e.target.value);}} style={INP} placeholder="1144524577"/></Field>
            <Field l="Exercice financier"><select value={data.exercice} onChange={function(e){sd("exercice",e.target.value);}} style={INP}><option value="1 nov au 31 oct">1 nov au 31 oct</option><option value="1 jan au 31 dec">1 jan au 31 dec</option><option value="1 avr au 31 mars">1 avr au 31 mars</option><option value="1 juil au 30 juin">1 juil au 30 juin</option></select></Field>
            <Field l="Quorum AGO (% des voix)"><input type="number" min="10" max="75" value={data.quorumAGO} onChange={function(e){sd("quorumAGO",parseInt(e.target.value)||25);}} style={INP}/></Field>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}>
            <Btn dis={!data.nom||!data.code||!data.ville} onClick={function(){setStep(2);}}>Continuer →</Btn>
          </div>
        </div>
      )}

      {step===2&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 2 — Conseil d administration</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Composition du CA selon la declaration de copropriete. Le nombre de membres doit etre impair.</div>
          <div style={{marginBottom:14}}>
            <Lbl l="Nombre de membres du CA"/>
            <div style={{display:"flex",gap:10,marginBottom:4}}>
              {[3,5,7,9].map(function(n){var a=data.nbMembresCA===n;return(
                <button key={n} onClick={function(){sd("nbMembresCA",n);}} style={{width:56,height:56,borderRadius:10,border:"2px solid "+(a?T.accent:T.border),background:a?T.accentL:T.surface,color:a?T.accent:T.muted,fontSize:20,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{n}</button>
              );})}
            </div>
            <div style={{fontSize:11,color:T.muted}}>Quorum: {Math.ceil(data.nbMembresCA/2)} membres requis</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <Field l="President"><input value={data.president} onChange={function(e){sd("president",e.target.value);}} style={INP}/></Field>
            <Field l="Secretaire"><input value={data.secretaire} onChange={function(e){sd("secretaire",e.target.value);}} style={INP}/></Field>
            <Field l="Tresorier"><input value={data.tresorier} onChange={function(e){sd("tresorier",e.target.value);}} style={INP}/></Field>
          </div>
          <div style={{marginBottom:14}}>
            <Lbl l="Liste complete des membres du CA"/>
            <div style={{minHeight:40,background:T.alt,borderRadius:8,padding:"6px 8px",display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
              {data.membresCA.map(function(m,i){return(
                <span key={i} style={{display:"inline-flex",alignItems:"center",gap:6,background:T.surface,border:"1px solid "+T.border,borderRadius:20,padding:"3px 10px",fontSize:11}}>
                  {m}<button onClick={function(){sd("membresCA",data.membresCA.filter(function(_,j){return j!==i;}));}} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:13,lineHeight:1,padding:0}}>x</button>
                </span>
              );})}
              {data.membresCA.length===0&&<span style={{fontSize:11,color:T.muted,padding:"4px 8px"}}>Ajoutez les membres du CA</span>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={newMembre} onChange={function(e){setNewMembre(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&newMembre.trim()){sd("membresCA",data.membresCA.concat([newMembre.trim()]));setNewMembre("");}}} placeholder="Nom du membre..." style={Object.assign({},INP,{flex:1})}/>
              <Btn sm onClick={function(){if(newMembre.trim()){sd("membresCA",data.membresCA.concat([newMembre.trim()]));setNewMembre("");}}}> Ajouter</Btn>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <Field l="Courriel du CA"><input value={data.courrielCA} onChange={function(e){sd("courrielCA",e.target.value);}} style={INP} placeholder="ca@syndicat.com"/></Field>
            <Field l="Courriel factures fournisseurs" hint="Traitement automatique"><input value={data.courrielFactures} onChange={function(e){sd("courrielFactures",e.target.value);}} style={INP} placeholder="factures@syndicat.com"/></Field>
            <Field l="Courriel coproprietaires"><input value={data.courrielCopros} onChange={function(e){sd("courrielCopros",e.target.value);}} style={INP} placeholder="info@syndicat.com"/></Field>
            <Field l="Courriel urgences 24/7"><input value={data.courrielUrgences} onChange={function(e){sd("courrielUrgences",e.target.value);}} style={INP} placeholder="urgence@syndicat.com"/></Field>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(1);}}>← Retour</Btn>
            <Btn dis={!data.president} onClick={function(){setStep(3);}}>Continuer →</Btn>
          </div>
        </div>
      )}

      {step===3&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 3 — Import des coproprietaires</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Importez votre registre en format CSV. Vous pouvez aussi saisir manuellement.</div>

          <div style={{background:T.blueL,border:"1px solid "+T.blue+"44",borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:8}}>Format CSV accepte (colonnes flexibles)</div>
            <div style={{fontSize:11,color:T.blue,fontFamily:"monospace",lineHeight:1.9}}>
              unite, prenom, nom, courriel, telephone, fraction, cotisation<br/>
              531, Jean-Francois, Laroche, jf@email.com, 819-479-4203, 2.133, 292.06<br/>
              539, Lucette, Tremblay, l.tremblay@email.com, 418-555-0539, 3.840, 525.80
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
              {csvErrors.slice(0,5).map(function(e,i){return <div key={i}>• {e}</div>;})}
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
                  <thead><tr style={{background:T.navy}}>{["Unite","Prenom","Nom","Courriel","Tel","Fraction","Cotisation"].map(function(h){return <th key={h} style={{padding:"6px 10px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left"}}>{h}</th>;})}</tr></thead>
                  <tbody>
                    {copros.map(function(c,i){return(
                      <tr key={i} style={{borderBottom:"1px solid "+T.border,background:i%2===0?T.surface:T.alt}}>
                        <td style={{padding:"6px 10px",fontWeight:700,color:T.navy,fontSize:11}}>{c.unite}</td>
                        <td style={{padding:"6px 10px",fontSize:11}}>{c.prenom}</td>
                        <td style={{padding:"6px 10px",fontSize:11}}>{c.nom}</td>
                        <td style={{padding:"6px 10px",fontSize:10,color:T.muted}}>{c.courriel}</td>
                        <td style={{padding:"6px 10px",fontSize:10,color:T.muted}}>{c.tel}</td>
                        <td style={{padding:"6px 10px",fontSize:11,textAlign:"right"}}>{c.fraction?c.fraction+"%":""}</td>
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
              <Lbl l="OU — Saisir le nombre d unites manuellement"/>
              <input type="number" value={data.nbUnites} onChange={function(e){sd("nbUnites",e.target.value);}} style={INP} placeholder="Nombre d unites (ex: 36)"/>
              <div style={{fontSize:10,color:T.muted,marginTop:3}}>Vous pourrez ajouter les coproprietaires plus tard.</div>
            </div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(2);}}>← Retour</Btn>
            <Btn dis={copros.length===0&&!data.nbUnites} onClick={function(){setStep(4);}}>Continuer →</Btn>
          </div>
        </div>
      )}

      {step===4&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 4 — Soldes d ouverture et budget</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Entrez les soldes bancaires au debut de l exercice actif. Ces valeurs seront les soldes d ouverture dans la comptabilite.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <Field l="Date d ouverture de l exercice"><input type="date" value={data.dateOuverture} onChange={function(e){sd("dateOuverture",e.target.value);}} style={INP}/></Field>
            <div/>
            <Field l="Solde — Compte d exploitation ($)" hint="Argent disponible pour les operations courantes"><input type="number" value={data.soldeOp} onChange={function(e){sd("soldeOp",e.target.value);}} style={INP} placeholder="Ex: 7361.88" step="0.01"/></Field>
            <Field l="Solde — Fonds de prevoyance ($)" hint="Reserve pour travaux majeurs (Loi 16 — obligatoire)"><input type="number" value={data.soldePrev} onChange={function(e){sd("soldePrev",e.target.value);}} style={INP} placeholder="Ex: 64235.01" step="0.01"/></Field>
            <Field l="Solde — Fonds d assurance ($)" hint="Reserve pour la franchise d assurance"><input type="number" value={data.soldeAss} onChange={function(e){sd("soldeAss",e.target.value);}} style={INP} placeholder="Ex: 36178.37" step="0.01"/></Field>
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
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(3);}}>← Retour</Btn>
            <Btn onClick={function(){setStep(5);}}>Continuer →</Btn>
          </div>
        </div>
      )}

      {step===5&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 5 — Documents officiels</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Importez les documents fondamentaux du syndicat. La declaration de copropriete est obligatoire.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[{cat:"declaration",l:"Declaration de copropriete",desc:"Document fondateur — acte notarie",obligatoire:true},{cat:"reglement",l:"Reglement de l immeuble",desc:"Regles de vie approuvees en assemblee",obligatoire:true},{cat:"police",l:"Police d assurance",desc:"Assurance syndicat en vigueur",obligatoire:false},{cat:"financier",l:"Etats financiers annuels",desc:"Derniers etats financiers verifies",obligatoire:false},{cat:"carnet_prev",l:"Etude du fonds de prevoyance",desc:"Etude actuarielle Loi 16",obligatoire:false},{cat:"autre",l:"Autre document",desc:"Tout autre document pertinent",obligatoire:false}].map(function(dtype){
              var uploaded=data.documents.filter(function(d){return d.cat===dtype.cat;});
              return(
                <div key={dtype.cat} style={{background:T.surface,border:"1px solid "+(uploaded.length>0?T.accent:dtype.obligatoire?T.amber:T.border),borderRadius:10,padding:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:T.text}}>{dtype.l}{dtype.obligatoire&&<span style={{color:T.red,marginLeft:4}}>*</span>}</div>
                      <div style={{fontSize:10,color:T.muted}}>{dtype.desc}</div>
                    </div>
                    {uploaded.length>0&&<span style={{fontSize:16,color:T.accent}}>✓</span>}
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
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(4);}}>← Retour</Btn>
            <Btn onClick={function(){setStep(6);}}>Continuer →</Btn>
          </div>
        </div>
      )}

      {step===6&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 6 — Carnet d entretien (Loi 16)</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Requis par la Loi 16 pour tous les syndicats de copropriete au Quebec. Listez les composantes de l immeuble avec leur date d installation et etat actuel.</div>
          <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:8,padding:"9px 14px",marginBottom:14,fontSize:11,color:T.amber}}>
            <b>Loi 16 — Article 1070.2 CCQ:</b> Tout syndicat doit tenir un carnet d entretien de l immeuble incluant toutes les composantes majeures avec leur duree de vie prevue et leur etat actuel.
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
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(5);}}>← Retour</Btn>
            <Btn onClick={function(){setStep(7);}}>Continuer →</Btn>
          </div>
        </div>
      )}

      {step===7&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 7 — Attestation de copropriete</div>
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
                  <span style={{color:T.accent,fontWeight:700,flexShrink:0,marginTop:1}}>✓</span>
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
                  <div style={{color:T.muted}}>{today()} — {data.ville||"[Ville]"}</div>
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
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(6);}}>← Retour</Btn>
            <Btn dis={!data.attestationAcceptee} onClick={function(){setStep(8);}}>Continuer →</Btn>
          </div>
        </div>
      )}

      {step===8&&(
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.navy,marginBottom:4}}>Etape 8 — Confirmation et activation</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:20}}>Verifiez le resume de la configuration avant d activer le syndicat.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {[
              {titre:"Syndicat",items:[{l:"Nom",v:data.nom},{l:"Code",v:data.code},{l:"Immatriculation",v:data.immat||"—"},{l:"Construction",v:data.anneeConstruction},{l:"Exercice",v:data.exercice}]},
              {titre:"CA",items:[{l:"Membres",v:data.nbMembresCA+" membres"},{l:"President",v:data.president||"—"},{l:"Secretaire",v:data.secretaire||"—"},{l:"Tresorier",v:data.tresorier||"—"}]},
              {titre:"Copropriétaires",items:[{l:"Importes",v:copros.length||data.nbUnites||"0"},{l:"Cotisations/mois",v:totalCot>0?money(totalCot):"—"},{l:"Fraction totale",v:totalFraction>0?totalFraction.toFixed(3)+"%":"—"}]},
              {titre:"Finances",items:[{l:"Exploitation",v:money(parseFloat(data.soldeOp)||0)},{l:"Prevoyance",v:money(parseFloat(data.soldePrev)||0)},{l:"Assurance",v:money(parseFloat(data.soldeAss)||0)},{l:"Budget annuel",v:data.budgetAnnuel?money(parseFloat(data.budgetAnnuel)):"—"}]},
              {titre:"Documents",items:[{l:"Importes",v:data.documents.length+" document(s)"},{l:"Declaration",v:data.documents.find(function(d){return d.cat==="declaration";})?"✓ Presente":"⚠ Manquante"},{l:"Reglement",v:data.documents.find(function(d){return d.cat==="reglement";})?"✓ Present":"—"}]},
              {titre:"Carnet Loi 16",items:[{l:"Composantes",v:data.composantes.length+" total"},{l:"Completees",v:compOk+"/"+compOblig+" obligatoires"},{l:"Inspecteur",v:data.inspecteur||"—"},{l:"Date inspection",v:data.dateInspection||"—"}]},
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
            <Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setStep(7);}}>← Retour</Btn>
            <Btn bg={T.accent} onClick={terminer} style={{fontSize:14,padding:"12px 28px"}}>Activer le syndicat {data.nom}</Btn>
          </div>
        </div>
      )}
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

  var actifs=syndicats.filter(function(s){return s.statut==="actif";});
  var totalUnites=actifs.reduce(function(a,s){return a+s.nbUnites;},0);
  var totalCot=actifs.reduce(function(a,s){return a+s.cotisationMensuelle;},0);
  var totalAlertes=actifs.reduce(function(a,s){return a+s.alertesCE+s.alertesAss+s.alertesPAP+s.alertesCarnet;},0);
  var totalFact=actifs.reduce(function(a,s){return a+s.facturesEnAttente;},0);
  var scoreMoyen=actifs.length>0?Math.round(actifs.reduce(function(a,s){return a+Math.round((s.scoreFinancier+s.scoreConformite+s.scoreEntretien)/3);},0)/actifs.length):0;

  var TABS=[{id:"syndicats",l:"Syndicats"},{id:"usagers",l:"Usagers Predictek"},{id:"rapports",l:"Rapports consolides"}];

  if(creer){
    return(
      <div style={{fontFamily:"Georgia,serif"}}>
        <div style={{background:T.navy,display:"flex",alignItems:"center",gap:12,padding:"12px 20px"}}>
          <Btn sm bg={"#ffffff20"} tc={"#fff"} bdr={"1px solid #ffffff40"} onClick={function(){setCreer(false);}}>Annuler</Btn>
        </div>
        <Onboarding onTermine={function(nouveau){setSyndicats(function(prev){return prev.filter(function(s){return s.code!==nouveau.code;}).concat([Object.assign({},nouveau,{statut:"actif"})]);});setCreer(false);}}/>
      </div>
    );
  }

  if(showParams&&detail){
    var selSP=syndicats.find(function(s){return s.id===detail;});
    return(
      <div style={{fontFamily:"Georgia,serif"}}>
        <div style={{background:T.navy,display:"flex",alignItems:"center",gap:12,padding:"12px 20px"}}>
          <Btn sm bg={"#ffffff20"} tc={"#fff"} bdr={"1px solid #ffffff40"} onClick={function(){setShowParams(false);}}>Retour au syndicat</Btn>
          <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{selSP?selSP.nom:""} — Parametres</span>
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
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Administration Predictek</div>
          <div style={{fontSize:11,color:T.muted}}>Vue globale — {actifs.length} syndicat(s) actif(s)</div>
        </div>
        {ong==="syndicats"&&<Btn onClick={function(){setCreer(true);}}>+ Nouveau syndicat</Btn>}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:16}}>
        {[
          {l:"Syndicats actifs",v:actifs.length,c:T.navy,bg:T.blueL},
          {l:"Total unites",v:totalUnites,c:T.accent,bg:T.accentL},
          {l:"Cotisations/mois",v:money(totalCot),c:T.blue,bg:T.blueL},
          {l:"Alertes actives",v:totalAlertes,c:totalAlertes>0?T.red:T.accent,bg:totalAlertes>0?T.redL:T.accentL},
          {l:"Score moyen sante",v:scoreMoyen+"%",c:scoreMoyen>=85?T.accent:scoreMoyen>=70?T.amber:T.red,bg:scoreMoyen>=85?T.accentL:scoreMoyen>=70?T.amberL:T.redL},
        ].map(function(st,i){return(
          <div key={i} style={{background:st.bg,borderRadius:10,padding:"11px 13px",border:"1px solid "+st.c+"33"}}>
            <div style={{fontSize:9,color:st.c,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{st.l}</div>
            <div style={{fontSize:17,fontWeight:800,color:st.c}}>{st.v}</div>
          </div>
        );})}
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

      {ong==="usagers"&&<GestionUsagers syndicats={syndicats}/>}

      {ong==="rapports"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {actifs.map(function(s){return(
              <div key={s.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.navy}}>{s.nom}</div>
                  <ScoreGlobal s={s}/>
                </div>
                <div style={{fontSize:11,color:T.muted,marginBottom:8}}>Dernier rapport: {s.dernierRapport||"—"}</div>
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
