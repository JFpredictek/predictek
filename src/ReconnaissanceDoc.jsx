
import { useState } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"6px 14px":"10px 20px",color:p.tc||"#fff",fontSize:p.sm?11:13,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>{p.children}</button>;}

var PROMPTS={
  req: "Tu es un expert en documents corporatifs quebecois. Analyse cette image du Registre des entreprises du Quebec (REQ) et extrais les informations suivantes en JSON STRICT (aucun texte avant ou apres le JSON):{  \"type_document\": \"REQ\",  \"nom_legal\": \"...\"  \"neq\": \"numero 10 chiffres ou null\",  \"date_constitution\": \"YYYY-MM-DD ou null\",  \"forme_juridique\": \"...\"  \"adresse\": \"...\"  \"ville\": \"...\"  \"province\": \"QC\"  \"code_postal\": \"...\"  \"administrateurs\": [    {\"nom\": \"...\"  \"prenom\": \"...\"  \"role\": \"president ou administrateur\"  \"adresse\": \"...\"}  ],  \"statut\": \"actif ou autre\",  \"date_extraction\": \"aujourd hui\"}",

  declaration: "Tu es un expert en copropriete divise au Quebec. Analyse cette image de la Declaration de copropriete et extrais les informations suivantes en JSON STRICT:{  \"type_document\": \"DECLARATION_COPROPRIETE\",  \"nom_syndicat\": \"...\",  \"adresse_immeuble\": \"...\",  \"ville\": \"...\",  \"nb_unites\": 0,  \"fractions\": [{\"unite\": \"101\", \"fraction\": 0.025}],  \"fonds_prevoyance_pct\": 0,  \"quorum_ca\": \"...\",  \"quorum_ago\": 0,  \"date_acte\": \"YYYY-MM-DD ou null\",  \"notaire\": \"...\",  \"no_acte\": \"...\",  \"regles_principales\": [\"regle 1\", \"regle 2\"]}",

  facture: "Tu es un expert-comptable. Analyse cette image de facture et extrais les informations suivantes en JSON STRICT:{  \"type_document\": \"FACTURE\",  \"fournisseur\": \"nom de l entreprise\",  \"adresse_fournisseur\": \"...\",  \"telephone_fournisseur\": \"...\",  \"no_facture\": \"...\",  \"date_facture\": \"YYYY-MM-DD\",  \"date_echeance\": \"YYYY-MM-DD ou null\",  \"description\": \"description generale des services\",  \"lignes\": [{\"description\": \"...\", \"quantite\": 1, \"prix_unitaire\": 0.00, \"montant\": 0.00}],  \"sous_total\": 0.00,  \"tps\": 0.00,  \"tvq\": 0.00,  \"total\": 0.00,  \"no_tps\": \"...\",  \"no_tvq\": \"...\",  \"categorie_comptable\": \"entretien, administration, electricite, etc.\",  \"mode_paiement\": \"cheque, virement, etc.\"}",

  auto: "Tu es un expert en documents corporatifs et comptables quebecois. Identifie d abord le type de document dans cette image (REQ, declaration de copropriete, facture, contrat, assurance, certificat, autre), puis extrais toutes les informations pertinentes en JSON STRICT:{  \"type_document\": \"REQ | DECLARATION_COPROPRIETE | FACTURE | CONTRAT | ASSURANCE | CERTIFICAT | AUTRE\",  \"confiance\": \"haute | moyenne | faible\",  \"donnees\": { toutes les donnees pertinentes selon le type }}"
};

var TYPES_DOC=[
  {id:"auto",l:"Detection automatique",icon:"A",desc:"Claude identifie le type et extrait tout",color:T.purple,bg:T.purpleL},
  {id:"req",l:"Registre entreprises (REQ)",icon:"R",desc:"NEQ, administrateurs, adresse officielle",color:T.blue,bg:T.blueL},
  {id:"declaration",l:"Declaration de copropriete",icon:"D",desc:"Fractions, reglement, quorum, notaire",color:T.accent,bg:T.accentL},
  {id:"facture",l:"Facture fournisseur",icon:"F",desc:"Montants, TPS/TVQ, categorie comptable",color:T.amber,bg:T.amberL},
];

function ChampResultat(p){
  if(!p.v||p.v==="null"||p.v==="")return null;
  return(
    <div style={{marginBottom:8}}>
      <div style={{fontSize:10,color:T.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{p.l}</div>
      <div style={{fontSize:12,color:T.navy,background:T.alt,borderRadius:6,padding:"6px 10px"}}>{p.v}</div>
    </div>
  );
}

function ResultatREQ(p){
  var d=p.data;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        <ChampResultat l="Nom legal" v={d.nom_legal}/>
        <ChampResultat l="NEQ" v={d.neq}/>
        <ChampResultat l="Forme juridique" v={d.forme_juridique}/>
        <ChampResultat l="Date constitution" v={d.date_constitution}/>
        <ChampResultat l="Adresse" v={d.adresse}/>
        <ChampResultat l="Ville" v={d.ville}/>
        <ChampResultat l="Code postal" v={d.code_postal}/>
        <ChampResultat l="Statut" v={d.statut}/>
      </div>
      {d.administrateurs&&d.administrateurs.length>0&&(
        <div>
          <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:8}}>Administrateurs ({d.administrateurs.length})</div>
          {d.administrateurs.map(function(a,i){return(
            <div key={i} style={{background:T.alt,borderRadius:8,padding:"10px 12px",marginBottom:6}}>
              <div style={{fontSize:12,fontWeight:700,color:T.navy}}>{a.prenom} {a.nom}</div>
              <div style={{fontSize:11,color:T.muted}}>{a.role}{a.adresse?" - "+a.adresse:""}</div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

function ResultatDeclaration(p){
  var d=p.data;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        <ChampResultat l="Nom syndicat" v={d.nom_syndicat}/>
        <ChampResultat l="Nb unites" v={d.nb_unites?String(d.nb_unites):null}/>
        <ChampResultat l="Adresse immeuble" v={d.adresse_immeuble}/>
        <ChampResultat l="Ville" v={d.ville}/>
        <ChampResultat l="Date acte" v={d.date_acte}/>
        <ChampResultat l="Notaire" v={d.notaire}/>
        <ChampResultat l="No acte" v={d.no_acte}/>
        <ChampResultat l="Fonds prevoyance" v={d.fonds_prevoyance_pct?d.fonds_prevoyance_pct+"%":null}/>
        <ChampResultat l="Quorum CA" v={d.quorum_ca}/>
        <ChampResultat l="Quorum AGO" v={d.quorum_ago?d.quorum_ago+"%":null}/>
      </div>
      {d.fractions&&d.fractions.length>0&&(
        <div>
          <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:8}}>Fractions ({d.fractions.length} unites)</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {d.fractions.slice(0,16).map(function(f,i){return(
              <div key={i} style={{background:T.alt,borderRadius:6,padding:"6px 8px",textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:700,color:T.navy}}>{f.unite}</div>
                <div style={{fontSize:10,color:T.muted}}>{typeof f.fraction==="number"?(f.fraction*100).toFixed(2)+"%":f.fraction}</div>
              </div>
            );})}
            {d.fractions.length>16&&<div style={{fontSize:10,color:T.muted,padding:"6px 8px"}}>+{d.fractions.length-16} autres...</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultatFacture(p){
  var d=p.data;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        <ChampResultat l="Fournisseur" v={d.fournisseur}/>
        <ChampResultat l="No facture" v={d.no_facture}/>
        <ChampResultat l="Date facture" v={d.date_facture}/>
        <ChampResultat l="Date echeance" v={d.date_echeance}/>
        <ChampResultat l="Categorie comptable" v={d.categorie_comptable}/>
        <ChampResultat l="Mode paiement" v={d.mode_paiement}/>
        <ChampResultat l="No TPS" v={d.no_tps}/>
        <ChampResultat l="No TVQ" v={d.no_tvq}/>
      </div>
      {d.lignes&&d.lignes.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:8}}>Detail des lignes</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:T.alt}}><th style={{padding:"6px 8px",textAlign:"left",color:T.navy}}>Description</th><th style={{padding:"6px 8px",textAlign:"right",color:T.navy}}>Qte</th><th style={{padding:"6px 8px",textAlign:"right",color:T.navy}}>Prix unit.</th><th style={{padding:"6px 8px",textAlign:"right",color:T.navy}}>Montant</th></tr></thead>
            <tbody>
              {d.lignes.map(function(l,i){return(
                <tr key={i} style={{borderBottom:"1px solid "+T.border}}>
                  <td style={{padding:"6px 8px"}}>{l.description}</td>
                  <td style={{padding:"6px 8px",textAlign:"right"}}>{l.quantite}</td>
                  <td style={{padding:"6px 8px",textAlign:"right"}}>{l.prix_unitaire?Number(l.prix_unitaire).toFixed(2)+" $":"-"}</td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontWeight:600}}>{l.montant?Number(l.montant).toFixed(2)+" $":"-"}</td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      )}
      <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:10,padding:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,textAlign:"right"}}>
          {d.sous_total&&<div><div style={{fontSize:10,color:T.muted}}>Sous-total</div><div style={{fontSize:14,fontWeight:600,color:T.navy}}>{Number(d.sous_total).toFixed(2)} $</div></div>}
          {d.tps&&<div><div style={{fontSize:10,color:T.muted}}>TPS (5%)</div><div style={{fontSize:14,fontWeight:600,color:T.navy}}>{Number(d.tps).toFixed(2)} $</div></div>}
          {d.tvq&&<div><div style={{fontSize:10,color:T.muted}}>TVQ (9.975%)</div><div style={{fontSize:14,fontWeight:600,color:T.navy}}>{Number(d.tvq).toFixed(2)} $</div></div>}
          {d.total&&<div><div style={{fontSize:10,color:T.muted}}>TOTAL</div><div style={{fontSize:18,fontWeight:800,color:T.accent}}>{Number(d.total).toFixed(2)} $</div></div>}
        </div>
      </div>
    </div>
  );
}

function ResultatAuto(p){
  var d=p.data;
  var inner=d.donnees||d;
  var type=d.type_document||"AUTRE";
  return(
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
        <div style={{background:type==="REQ"?T.blueL:type==="DECLARATION_COPROPRIETE"?T.accentL:type==="FACTURE"?T.amberL:T.purpleL,border:"1px solid #0002",borderRadius:8,padding:"8px 16px"}}>
          <div style={{fontSize:10,color:T.muted}}>Type detecte</div>
          <div style={{fontSize:14,fontWeight:800,color:T.navy}}>{type.replace(/_/g," ")}</div>
        </div>
        {d.confiance&&<div style={{fontSize:12,color:d.confiance==="haute"?T.accent:d.confiance==="moyenne"?T.amber:T.red,fontWeight:700,background:d.confiance==="haute"?T.accentL:d.confiance==="moyenne"?T.amberL:T.redL,borderRadius:20,padding:"4px 14px"}}>Confiance: {d.confiance}</div>}
      </div>
      {type==="REQ"&&<ResultatREQ data={inner}/>}
      {type==="DECLARATION_COPROPRIETE"&&<ResultatDeclaration data={inner}/>}
      {type==="FACTURE"&&<ResultatFacture data={inner}/>}
      {type!=="REQ"&&type!=="DECLARATION_COPROPRIETE"&&type!=="FACTURE"&&(
        <div style={{background:T.alt,borderRadius:10,padding:14}}>
          <div style={{fontSize:11,color:T.muted,marginBottom:8}}>Donnees extraites:</div>
          <pre style={{fontSize:11,color:T.navy,whiteSpace:"pre-wrap",fontFamily:"monospace"}}>{JSON.stringify(inner,null,2)}</pre>
        </div>
      )}
    </div>
  );
}

export default function ReconnaissanceDoc(){
  var s0=useState("auto");var typeDoc=s0[0];var setTypeDoc=s0[1];
  var s1=useState(null);var fichier=s1[0];var setFichier=s1[1];
  var s2=useState(null);var apercu=s2[0];var setApercu=s2[1];
  var s3=useState(null);var resultat=s3[0];var setResultat=s3[1];
  var s4=useState(false);var analyse=s4[0];var setAnalyse=s4[1];
  var s5=useState("");var erreur=s5[0];var setErreur=s5[1];
  var s6=useState(null);var jsonBrut=s6[0];var setJsonBrut=s6[1];
  var s7=useState(false);var showJson=s7[0];var setShowJson=s7[1];

  function handleFichier(e){
    var f=e.target.files[0];
    if(!f)return;
    setFichier(f);setResultat(null);setErreur("");setJsonBrut(null);
    var reader=new FileReader();
    reader.onload=function(ev){setApercu(ev.target.result);};
    reader.readAsDataURL(f);
  }

  function analyserDocument(){
    if(!fichier||!apercu)return;
    setAnalyse(true);setErreur("");setResultat(null);
    var base64data=apercu.split(",")[1];
    var mediaType=fichier.type||"image/jpeg";
    var isPDF=fichier.name.toLowerCase().endsWith(".pdf")||mediaType==="application/pdf";
    var prompt=PROMPTS[typeDoc]||PROMPTS.auto;

    var body={
      model:"claude-opus-4-5",
      max_tokens:2000,
      messages:[{
        role:"user",
        content:[
          isPDF?{type:"document",source:{type:"base64",media_type:"application/pdf",data:base64data}}:{type:"image",source:{type:"base64",media_type:mediaType,data:base64data}},
          {type:"text",text:prompt}
        ]
      }]
    };

    fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    }).then(function(res){return res.json();}).then(function(data){
      var texte="";
      if(data.content&&data.content.length>0){
        texte=data.content.filter(function(c){return c.type==="text";}).map(function(c){return c.text;}).join("");
      }
      setJsonBrut(texte);
      try{
        var clean=texte.trim();if(clean.indexOf("{")>=0){clean=clean.substring(clean.indexOf("{"),clean.lastIndexOf("}")+1);}clean=clean.trim();
        var parsed=JSON.parse(clean);
        setResultat(parsed);
      }catch(e){
        setErreur("Impossible de parser la reponse. Verifiez le JSON brut ci-dessous.");
        setShowJson(true);
      }
      setAnalyse(false);
    }).catch(function(e){
      setErreur("Erreur API: "+e.message);
      setAnalyse(false);
    });
  }

  function copierJSON(){
    if(resultat)navigator.clipboard.writeText(JSON.stringify(resultat,null,2));
  }

  function appliquerDonnees(){
    if(!resultat)return;
    var ev=new CustomEvent("predictek_doc_extrait",{detail:{type:typeDoc,data:resultat}});
    window.dispatchEvent(ev);
    alert("Donnees transmises au module correspondant!");
  }

  var typeSelectionne=TYPES_DOC.find(function(t){return t.id===typeDoc;})||TYPES_DOC[0];

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,"+T.purple+",#9C6FD0)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{color:"#fff",fontWeight:900,fontSize:16}}>IA</span>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Reconnaissance de documents</div>
          <div style={{fontSize:10,color:"#8da0bb"}}>Extraction automatique par Intelligence Artificielle</div>
        </div>
      </div>

      <div style={{padding:20,maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>

          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>1. Type de document</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
              {TYPES_DOC.map(function(t){var a=typeDoc===t.id;return(
                <button key={t.id} onClick={function(){setTypeDoc(t.id);}} style={{background:a?t.bg:T.surface,border:"2px solid "+(a?t.color:T.border),borderRadius:10,padding:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.15s"}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                    <div style={{width:28,height:28,borderRadius:6,background:a?t.color:"#0002",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{color:a?"#fff":T.muted,fontSize:12,fontWeight:800}}>{t.icon}</span>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:a?t.color:T.navy}}>{t.l}</span>
                  </div>
                  <div style={{fontSize:10,color:T.muted,paddingLeft:36}}>{t.desc}</div>
                </button>
              );})}
            </div>

            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>2. Importer le document</div>
            <div style={{border:"2px dashed "+(fichier?typeSelectionne.color:T.border),borderRadius:12,padding:20,textAlign:"center",marginBottom:16,background:fichier?typeSelectionne.bg:T.surface,transition:"all 0.2s"}}>
              <input type="file" id="docInput" accept=".pdf,.PDF,.jpg,.jpeg,.png,.webp" onChange={handleFichier} style={{display:"none"}}/>
              {!fichier?(
                <div>
                  <div style={{fontSize:32,marginBottom:8}}>D</div>
                  <div style={{fontSize:13,color:T.muted,marginBottom:12}}>PDF ou image (JPG, PNG)</div>
                  <Btn onClick={function(){document.getElementById("docInput").click();}}>Choisir un fichier</Btn>
                </div>
              ):(
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:typeSelectionne.color,marginBottom:8}}>{fichier.name}</div>
                  <div style={{fontSize:11,color:T.muted,marginBottom:12}}>{Math.round(fichier.size/1024)} KB</div>
                  {apercu&&fichier.type.startsWith("image")&&(
                    <img src={apercu} alt="Apercu" style={{maxWidth:"100%",maxHeight:200,borderRadius:8,border:"1px solid "+T.border,marginBottom:12}}/>
                  )}
                  {apercu&&fichier.name.toLowerCase().endsWith(".pdf")&&(
                    <div style={{background:T.alt,borderRadius:8,padding:12,fontSize:11,color:T.muted,marginBottom:12}}>PDF importe - pret pour analyse</div>
                  )}
                  <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                    <Btn onClick={analyserDocument} dis={analyse} bg={typeSelectionne.color}>
                      {analyse?"Analyse en cours...":"Analyser le document"}
                    </Btn>
                    <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setFichier(null);setApercu(null);setResultat(null);setErreur("");document.getElementById("docInput").value="";}}>Changer</Btn>
                  </div>
                </div>
              )}
            </div>

            {analyse&&(
              <div style={{background:T.purpleL,border:"1px solid "+T.purple+"44",borderRadius:10,padding:16,textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:T.purple,marginBottom:6}}>Analyse en cours...</div>
                <div style={{fontSize:11,color:T.muted}}>Claude Vision lit et interprete votre document. Cela prend 10-30 secondes selon la complexite.</div>
              </div>
            )}

            {erreur&&(
              <div style={{background:T.redL,border:"1px solid "+T.red+"44",borderRadius:10,padding:14}}>
                <div style={{fontSize:12,fontWeight:700,color:T.red,marginBottom:4}}>Erreur</div>
                <div style={{fontSize:11,color:T.red}}>{erreur}</div>
              </div>
            )}
          </div>

          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>3. Donnees extraites</div>
            {!resultat&&!analyse&&(
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:40,textAlign:"center",color:T.muted}}>
                <div style={{fontSize:32,marginBottom:8}}>D</div>
                <div style={{fontSize:13}}>Les donnees extraites apparaitront ici apres l analyse</div>
                <div style={{fontSize:11,marginTop:8}}>Importez un document et cliquez "Analyser"</div>
              </div>
            )}

            {resultat&&(
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.navy}}>Extraction reussie</div>
                  <div style={{display:"flex",gap:8}}>
                    <Btn sm bg={T.blueL} tc={T.blue} bdr={"1px solid "+T.blue+"44"} onClick={copierJSON}>Copier JSON</Btn>
                    <Btn sm onClick={appliquerDonnees}>Appliquer</Btn>
                    <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowJson(!showJson);}}>JSON brut</Btn>
                  </div>
                </div>

                {(typeDoc==="req")&&<ResultatREQ data={resultat}/>}
                {(typeDoc==="declaration")&&<ResultatDeclaration data={resultat}/>}
                {(typeDoc==="facture")&&<ResultatFacture data={resultat}/>}
                {(typeDoc==="auto")&&<ResultatAuto data={resultat}/>}

                {showJson&&jsonBrut&&(
                  <div style={{marginTop:16,background:T.navy,borderRadius:8,padding:14,overflow:"auto",maxHeight:300}}>
                    <pre style={{fontSize:10,color:"#3CAF6E",fontFamily:"monospace",whiteSpace:"pre-wrap",margin:0}}>{jsonBrut}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{background:T.blueL,border:"1px solid "+T.blue+"33",borderRadius:12,padding:16,marginTop:20}}>
          <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:8}}>Fonctionnement - Claude Vision</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,fontSize:11,color:T.muted}}>
            <div><b style={{color:T.navy}}>PDF et images</b><br/>Supporte PDF, JPG, PNG, WEBP. Resolution optimale pour lecture.</div>
            <div><b style={{color:T.navy}}>Extraction precise</b><br/>Claude lit le texte meme sur documents numerises ou photos.</div>
            <div><b style={{color:T.navy}}>JSON structure</b><br/>Donnees propres, directement utilisables dans Predictek.</div>
            <div><b style={{color:T.navy}}>Bouton Appliquer</b><br/>Transf-re les donn-es au module correspondant (syndicat, facture...).</div>
          </div>
        </div>
      </div>
    </div>
  );
}
