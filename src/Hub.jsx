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
        <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={p.onRetour}>Retour</Btn>
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

// ===== MODULE PRINCIPAL HUB =====
export default function Hub(){
  var s0=useState("syndicats");var ong=s0[0];var setOng=s0[1];
  var s1=useState(SYNDICATS_INIT);var syndicats=s1[0];var setSyndicats=s1[1];
  var s2=useState(null);var detail=s2[0];var setDetail=s2[1];
  var s3=useState(false);var creer=s3[0];var setCreer=s3[1];
  var s4=useState(null);var setup=s4[0];var setSetup=s4[1];

  var actifs=syndicats.filter(function(s){return s.statut==="actif";});
  var totalUnites=actifs.reduce(function(a,s){return a+s.nbUnites;},0);
  var totalCot=actifs.reduce(function(a,s){return a+s.cotisationMensuelle;},0);
  var totalAlertes=actifs.reduce(function(a,s){return a+s.alertesCE+s.alertesAss+s.alertesPAP+s.alertesCarnet;},0);
  var totalFact=actifs.reduce(function(a,s){return a+s.facturesEnAttente;},0);
  var scoreMoyen=actifs.length>0?Math.round(actifs.reduce(function(a,s){return a+Math.round((s.scoreFinancier+s.scoreConformite+s.scoreEntretien)/3);},0)/actifs.length):0;

  var TABS=[{id:"syndicats",l:"Syndicats"},{id:"usagers",l:"Usagers Predictek"},{id:"rapports",l:"Rapports consolides"}];

  if(creer){
    return(
      <div style={{padding:20,fontFamily:"Georgia,serif"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={function(){setCreer(false);}} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:20,lineHeight:1}}>x</button>
          <div style={{fontSize:16,fontWeight:800,color:T.navy}}>Nouveau syndicat</div>
        </div>
        <CreerSyndicat
          onCreer={function(nouveau){setSyndicats(function(prev){return prev.filter(function(s){return s.statut==="actif";}).concat([nouveau]);});setCreer(false);}}
          onAnnuler={function(){setCreer(false);}}
        />
      </div>
    );
  }

  if(detail){
    var selS=syndicats.find(function(s){return s.id===detail;});
    return(
      <div style={{padding:16,fontFamily:"Georgia,serif"}}>
        {selS&&<DetailSyndicat syndicat={selS} onRetour={function(){setDetail(null);}}/>}
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
