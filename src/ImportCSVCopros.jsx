
import sb from "./lib/supabase";
import { useState } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var COLONNES_ATTENDUES=[
  {key:"unite",l:"Unite",req:true,ex:"101"},
  {key:"nom",l:"Nom",req:true,ex:"Laroche"},
  {key:"prenom",l:"Prenom",req:false,ex:"Jean-Francois"},
  {key:"courriel",l:"Courriel",req:false,ex:"jf@email.com"},
  {key:"telephone",l:"Telephone",req:false,ex:"418-555-0000"},
  {key:"cotisation_mensuelle",l:"Cotisation ($)",req:false,ex:"250.00"},
  {key:"fraction",l:"Fraction",req:false,ex:"0.0250"},
  {key:"code_acces",l:"Code acces",req:false,ex:"1234"},
];

function parseCSV(texte){
  var lignes=texte.split("").map(function(l){return l.trim();}).filter(function(l){return l.length>0;});
  if(lignes.length<2)return {erreur:"Le fichier doit avoir au moins 2 lignes (entete + donnees)",lignes:[]};
  var sep=lignes[0].includes(";")?";":",";
  var entetes=lignes[0].split(sep).map(function(h){return h.trim().replace(/"/g,"").toLowerCase();});var data=[];for(var i=1;i<lignes.length;i++){var cols=lignes[i].split(sep).map(function(c){return c.trim().replace(/"/g,"");});var row={};entetes.forEach(function(h,j){row[h]=cols[j]||"";});
    data.push(row);
  }
  return {entetes:entetes,lignes:data,erreur:null};
}

function detecterColonne(entetes, possibles){
  for(var i=0;i<possibles.length;i++){
    var found=entetes.find(function(h){return h.includes(possibles[i]);});
    if(found)return found;
  }
  return null;
}

function mapperColonnes(entetes){
  var mapping={};
  mapping.unite=detecterColonne(entetes,["unite","unit","no_","numero"]);
  mapping.nom=detecterColonne(entetes,["nom","name","last"]);
  mapping.prenom=detecterColonne(entetes,["prenom","prenom","first"]);
  mapping.courriel=detecterColonne(entetes,["courriel","email","mail"]);
  mapping.telephone=detecterColonne(entetes,["telephone","tel","phone","cell"]);
  mapping.cotisation_mensuelle=detecterColonne(entetes,["cotisation","montant","amount","cot"]);
  mapping.fraction=detecterColonne(entetes,["fraction","quote","part"]);
  mapping.code_acces=detecterColonne(entetes,["code","acces","access","pwd","pass"]);
  return mapping;
}

export default function ImportCSVCopros(p){
  var syndicatId=p.syndicatId;var syndicatNom=p.syndicatNom;var onImport=p.onImport;
  var s0=useState(null);var fichier=s0[0];var setFichier=s0[1];
  var s1=useState(null);var parse=s1[0];var setParse=s1[1];
  var s2=useState(null);var mapping=s2[0];var setMapping=s2[1];
  var s3=useState([]);var apercu=s3[0];var setApercu=s3[1];
  var s4=useState([]);var erreurs=s4[0];var setErreurs=s4[1];
  var s5=useState(false);var importing=s5[0];var setImporting=s5[1];
  var s6=useState(null);var resultat=s6[0];var setResultat=s6[1];

  function handleFile(e){
    var f=e.target.files[0];
    if(!f)return;
    setFichier(f);setParse(null);setMapping(null);setApercu([]);setErreurs([]);setResultat(null);
    var reader=new FileReader();
    reader.onload=function(ev){
      var texte=ev.target.result;
      var parsed=parseCSV(texte);
      if(parsed.erreur){setErreurs([parsed.erreur]);return;}
      setParse(parsed);
      var map=mapperColonnes(parsed.entetes);
      setMapping(map);
      var errs=[];
      if(!map.unite)errs.push("Colonne 'unite' non trouvee. Nommez-la: unite, unit, no_unite");
      if(!map.nom)errs.push("Colonne 'nom' non trouvee. Nommez-la: nom, name");
      setErreurs(errs);
      var prev=parsed.lignes.slice(0,5).map(function(row){
        return {unite:map.unite?row[map.unite]:"?",nom:map.nom?row[map.nom]:"?",prenom:map.prenom?row[map.prenom]:"",courriel:map.courriel?row[map.courriel]:"",cotisation_mensuelle:map.cotisation_mensuelle?parseFloat(row[map.cotisation_mensuelle])||0:0};
      });
      setApercu(prev);
    };
    reader.readAsText(f,"UTF-8");
  }

  function setMapField(dest,src){setMapping(function(pr){var n=Object.assign({},pr);n[dest]=src;return n;});}

  function importer(){
    if(!parse||!mapping||!syndicatId)return;
    setImporting(true);
    var rows=parse.lignes.map(function(row){
      return {syndicat_id:syndicatId,unite:(mapping.unite?row[mapping.unite]:"").toUpperCase(),nom:mapping.nom?row[mapping.nom]:"",prenom:mapping.prenom?row[mapping.prenom]:"",courriel:mapping.courriel?row[mapping.courriel]:"",telephone:mapping.telephone?row[mapping.telephone]:"",cotisation_mensuelle:mapping.cotisation_mensuelle?parseFloat(row[mapping.cotisation_mensuelle])||0:0,fraction:mapping.fraction?parseFloat(row[mapping.fraction])||0:0,code_acces:mapping.code_acces?row[mapping.code_acces]:"",statut:"actif",pap:false};
    }).filter(function(r){return r.unite&&r.nom;});

    var ok=0;var fail=0;
    var promises=rows.map(function(r){
      return sb.insert("coproprietaires",r).then(function(res){if(res&&res.data)ok++;else fail++;}).catch(function(){fail++;});
    });

    Promise.all(promises).then(function(){
      setResultat({ok:ok,fail:fail,total:rows.length});
      setImporting(false);
      sb.log("import","csv","Import CSV coproprietaires: "+ok+" reussis, "+fail+" echecs","",syndicatId);
      if(onImport)onImport(ok);
    });
  }

  return(
    <div style={{fontFamily:"Georgia,serif",padding:20}}>
      <div style={{fontSize:14,fontWeight:800,color:T.navy,marginBottom:4}}>Import CSV - Coproprietaires</div>
      <div style={{fontSize:11,color:T.muted,marginBottom:20}}>Syndicat: {syndicatNom||"Non selectionne"}</div>

      <div style={{background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:12,padding:16,marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:8}}>Format CSV attendu</div>
        <div style={{fontFamily:"monospace",fontSize:11,color:T.navy,background:"#fff",borderRadius:6,padding:10}}>
          unite,nom,prenom,courriel,telephone,cotisation_mensuelle,fraction,code_acces<br/>
          101,Laroche,Jean-Francois,jf@email.com,418-555-0001,250.00,0.0250,1234<br/>
          102,Tremblay,Marie,mt@email.com,418-555-0002,275.00,0.0278,5678<br/>
          103,Gagnon,Pierre,pg@email.com,,300.00,0.0300,
        </div>
        <div style={{fontSize:10,color:T.muted,marginTop:8}}>Separateur: virgule (,) ou point-virgule (;). Encodage: UTF-8. La premiere ligne doit etre l entete.</div>
      </div>

      <div style={{border:"2px dashed "+(fichier?T.accent:T.border),borderRadius:12,padding:24,textAlign:"center",marginBottom:20,background:fichier?T.accentL:T.surface}}>
        <input type="file" id="csvFile" accept=".csv,.txt,.tsv" onChange={handleFile} style={{display:"none"}}/>
        {!fichier?(
          <div>
            <div style={{fontSize:32,marginBottom:8,color:T.muted}}>CSV</div>
            <div style={{fontSize:12,color:T.muted,marginBottom:12}}>Fichier CSV ou TXT</div>
            <Btn onClick={function(){document.getElementById("csvFile").click();}}>Choisir le fichier CSV</Btn>
          </div>
        ):(
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.accent,marginBottom:4}}>{fichier.name}</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:8}}>{parse?parse.lignes.length+" lignes detectees":""}</div>
            <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setFichier(null);setParse(null);setMapping(null);setApercu([]);setErreurs([]);document.getElementById("csvFile").value="";}}>Changer</Btn>
          </div>
        )}
      </div>

      {erreurs.length>0&&(
        <div style={{background:T.redL,border:"1px solid "+T.red+"44",borderRadius:10,padding:14,marginBottom:16}}>
          {erreurs.map(function(e,i){return <div key={i} style={{fontSize:12,color:T.red,marginBottom:4}}>Erreur: {e}</div>;})}
        </div>
      )}

      {parse&&mapping&&erreurs.length===0&&(
        <div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>Correspondance des colonnes</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {COLONNES_ATTENDUES.map(function(col){return(
                <div key={col.key} style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{fontSize:11,fontWeight:600,color:col.req?T.navy:T.muted,minWidth:120}}>{col.l}{col.req?" *":""}</div>
                  <select value={mapping[col.key]||""} onChange={function(e){setMapField(col.key,e.target.value||null);}} style={Object.assign({},INP,{flex:1,fontSize:11})}>
                    <option value="">-- Ignorer --</option>
                    {parse.entetes.map(function(h){return <option key={h} value={h}>{h}</option>;  })}
                  </select>
                  {mapping[col.key]&&<span style={{fontSize:10,color:T.accent,fontWeight:700}}>OK</span>}
                </div>
              );})}
            </div>
          </div>

          {apercu.length>0&&(
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:8}}>Apercu (5 premieres lignes)</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead><tr style={{background:T.alt}}>{["Unite","Nom","Prenom","Courriel","Cotisation"].map(function(h){return <th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:600,color:T.navy}}>{h}</th>;})}</tr></thead>
                  <tbody>
                    {apercu.map(function(r,i){return(
                      <tr key={i} style={{borderBottom:"1px solid "+T.border}}>
                        <td style={{padding:"6px 8px",fontWeight:700}}>{r.unite}</td>
                        <td style={{padding:"6px 8px"}}>{r.nom}</td>
                        <td style={{padding:"6px 8px"}}>{r.prenom}</td>
                        <td style={{padding:"6px 8px",color:T.muted}}>{r.courriel}</td>
                        <td style={{padding:"6px 8px",color:T.accent,fontWeight:600}}>{r.cotisation_mensuelle?r.cotisation_mensuelle.toFixed(2)+" $":"-"}</td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
              <div style={{fontSize:11,color:T.muted,marginTop:8}}>Total: {parse.lignes.length} coproprietaires a importer</div>
            </div>
          )}

          {!resultat&&(
            <Btn onClick={importer} dis={importing||!mapping.unite||!mapping.nom}>
              {importing?"Import en cours...":"Importer "+parse.lignes.length+" coproprietaires"}
            </Btn>
          )}
        </div>
      )}

      {resultat&&(
        <div style={{background:resultat.fail===0?T.accentL:T.amberL,border:"1px solid "+(resultat.fail===0?T.accent:T.amber)+"44",borderRadius:12,padding:20,textAlign:"center"}}>
          <div style={{fontSize:20,fontWeight:800,color:resultat.fail===0?T.accent:T.amber,marginBottom:8}}>{resultat.ok} / {resultat.total} importes</div>
          {resultat.fail>0&&<div style={{fontSize:12,color:T.amber}}>{resultat.fail} echec(s) - doublons possibles</div>}
          <div style={{fontSize:12,color:T.muted,marginTop:4}}>Import termine!</div>
        </div>
      )}
    </div>
  );
}
