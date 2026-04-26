import { useState } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function F(p){return <div style={p.full?{gridColumn:"1/-1"}:{}}><Lbl l={p.l}/>{p.children}{p.hint&&<div style={{fontSize:10,color:T.muted,marginTop:3}}>{p.hint}</div>}</div>;}
export default function ParamsPredictek(){
  var s0=useState(function(){try{var s=localStorage.getItem("predictek_infos_entreprise");if(s)return JSON.parse(s);}catch(e){}return{nomLegal:"",nomCommercial:"Predictek",adr:"",ville:"",province:"QC",codePostal:"",tel:"",courriel:"",siteWeb:"",neq:"",noTPS:"",noDeclarantTPS:"",noTVQ:"",noDeclarantTVQ:"",exerciceDebut:"2025-11-01",exerciceFin:"2026-10-31",institutionBanque:"",noCompte:"",noTransit:"",noInstitution:"",courrielRemiseARC:"",courrielRemiseRQ:"",logo:null};});
  var info=s0[0];var setInfo=s0[1];
  var s1=useState("");var savedMsg=s1[0];var setSavedMsg=s1[1];
  var s2=useState("entreprise");var ong=s2[0];var setOng=s2[1];
  function si(k,v){setInfo(function(o){var n=Object.assign({},o);n[k]=v;return n;});}
  function sauvegarder(){try{localStorage.setItem("predictek_infos_entreprise",JSON.stringify(info));}catch(e){}setSavedMsg("Sauvegardes!");setTimeout(function(){setSavedMsg("");},3000);}
  function handleLogo(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){si("logo",ev.target.result);try{localStorage.setItem("predictek_logo",ev.target.result);}catch(e){}};reader.readAsDataURL(file);}
  function resetLogo(){si("logo",null);try{localStorage.removeItem("predictek_logo");}catch(e){}}
  var TABS_P=[{id:"entreprise",l:"Informations entreprise"},{id:"taxes",l:"TPS / TVQ"},{id:"banque",l:"Coordonnees bancaires"},{id:"logo",l:"Logo"}];
  return(
    <div style={{padding:20,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T.navy}}>Parametres Predictek</div>
          <div style={{fontSize:11,color:T.muted}}>Informations legales, fiscales et configuration</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {savedMsg&&<span style={{fontSize:11,fontWeight:600,color:T.accent,background:T.accentL,padding:"4px 10px",borderRadius:20}}>{savedMsg}</span>}
          <button onClick={sauvegarder} style={{background:T.accent,color:"#fff",border:"none",borderRadius:7,padding:"8px 18px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Sauvegarder</button>
        </div>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:16,background:T.surface,padding:4,borderRadius:10,border:"1px solid "+T.border}}>
        {TABS_P.map(function(t){var a=ong===t.id;return(<button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"7px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t.l}</button>);})}
      </div>
      {ong==="entreprise"&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>Informations de l entreprise</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <F l="Nom legal complet" full><input value={info.nomLegal} onChange={function(e){si("nomLegal",e.target.value);}} style={INP} placeholder="9999999 Canada Inc."/></F>
            <F l="Nom commercial" full><input value={info.nomCommercial} onChange={function(e){si("nomCommercial",e.target.value);}} style={INP} placeholder="Predictek"/></F>
            <F l="Adresse" full><input value={info.adr} onChange={function(e){si("adr",e.target.value);}} style={INP} placeholder="123 rue Principale"/></F>
            <F l="Ville"><input value={info.ville} onChange={function(e){si("ville",e.target.value);}} style={INP} placeholder="Quebec"/></F>
            <F l="Province"><select value={info.province} onChange={function(e){si("province",e.target.value);}} style={INP}><option>QC</option><option>ON</option><option>BC</option><option>AB</option></select></F>
            <F l="Code postal"><input value={info.codePostal} onChange={function(e){si("codePostal",e.target.value.toUpperCase());}} style={INP} placeholder="G1K 1A1"/></F>
            <F l="Telephone"><input value={info.tel} onChange={function(e){si("tel",e.target.value);}} style={INP} placeholder="418-555-0000"/></F>
            <F l="Courriel"><input value={info.courriel} onChange={function(e){si("courriel",e.target.value);}} style={INP} placeholder="info@predictek.ca"/></F>
            <F l="Site web"><input value={info.siteWeb} onChange={function(e){si("siteWeb",e.target.value);}} style={INP} placeholder="www.predictek.ca"/></F>
            <F l="NEQ — Registre entreprises Quebec" hint="10 chiffres"><input value={info.neq} onChange={function(e){si("neq",e.target.value);}} style={INP} placeholder="1234567890"/></F>
            <F l="Debut exercice financier"><input type="date" value={info.exerciceDebut} onChange={function(e){si("exerciceDebut",e.target.value);}} style={INP}/></F>
            <F l="Fin exercice financier"><input type="date" value={info.exerciceFin} onChange={function(e){si("exerciceFin",e.target.value);}} style={INP}/></F>
          </div>
        </div>
      )}
      {ong==="taxes"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>TPS — Agence du revenu Canada</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:14}}>Taxe sur les produits et services (5%)</div>
            <div style={{display:"grid",gap:10}}>
              <F l="Numero de TPS" hint="Format: 123456789 RT0001"><input value={info.noTPS} onChange={function(e){si("noTPS",e.target.value.toUpperCase());}} style={INP} placeholder="123456789 RT0001"/></F>
              <F l="Numero de declarant"><input value={info.noDeclarantTPS} onChange={function(e){si("noDeclarantTPS",e.target.value);}} style={INP} placeholder="0001"/></F>
              <F l="Courriel remises ARC"><input value={info.courrielRemiseARC} onChange={function(e){si("courrielRemiseARC",e.target.value);}} style={INP} placeholder="tps@predictek.ca"/></F>
            </div>
          </div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>TVQ — Revenu Quebec</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:14}}>Taxe de vente du Quebec (9.975%)</div>
            <div style={{display:"grid",gap:10}}>
              <F l="Numero de TVQ" hint="Format: 1234567890 TQ0001"><input value={info.noTVQ} onChange={function(e){si("noTVQ",e.target.value.toUpperCase());}} style={INP} placeholder="1234567890 TQ0001"/></F>
              <F l="Numero de declarant"><input value={info.noDeclarantTVQ} onChange={function(e){si("noDeclarantTVQ",e.target.value);}} style={INP} placeholder="0001"/></F>
              <F l="Courriel remises Revenu QC"><input value={info.courrielRemiseRQ} onChange={function(e){si("courrielRemiseRQ",e.target.value);}} style={INP} placeholder="tvq@predictek.ca"/></F>
            </div>
          </div>
          <div style={{gridColumn:"1/-1",background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:10,padding:14}}>
            <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:4}}>Frequence de remise TPS/TVQ</div>
            <div style={{fontSize:11,color:T.amber,lineHeight:1.8}}>Mensuelle: revenus sup. a 1 500 000$/an | Trimestrielle: 30 000$ a 1 500 000$ | Annuelle: inf. a 30 000$</div>
          </div>
        </div>
      )}
      {ong==="banque"&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:4}}>Coordonnees bancaires</div>
          <div style={{fontSize:11,color:T.muted,marginBottom:14}}>Pour remises DAS, TPS/TVQ et virements</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <F l="Institution financiere" full><input value={info.institutionBanque} onChange={function(e){si("institutionBanque",e.target.value);}} style={INP} placeholder="Desjardins / TD / BNC"/></F>
            <F l="No transit (5 chiffres)"><input value={info.noTransit} onChange={function(e){si("noTransit",e.target.value);}} style={INP} placeholder="00000"/></F>
            <F l="No institution (3 chiffres)"><input value={info.noInstitution} onChange={function(e){si("noInstitution",e.target.value);}} style={INP} placeholder="000"/></F>
            <F l="Numero de compte" full><input value={info.noCompte} onChange={function(e){si("noCompte",e.target.value);}} style={INP} placeholder="0000000000"/></F>
          </div>
          <div style={{marginTop:14,background:T.redL,borderRadius:8,padding:"9px 12px",fontSize:11,color:T.red}}>Ces informations sont sauvegardees localement dans votre navigateur uniquement.</div>
        </div>
      )}
      {ong==="logo"&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>Logo et apparence</div>
          <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
            <div style={{flexShrink:0,textAlign:"center"}}>
              <div style={{fontSize:10,color:T.muted,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Apercu</div>
              <div style={{width:100,height:100,borderRadius:12,background:info.logo?"#fff":"linear-gradient(135deg,#1B5E3B,#3CAF6E)",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid "+T.border,overflow:"hidden"}}>
                {info.logo?<img src={info.logo} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain",padding:4}}/>:<span style={{color:"#fff",fontWeight:900,fontSize:36,fontFamily:"Georgia,serif"}}>P</span>}
              </div>
            </div>
            <div style={{flex:1}}>
              <input type="file" accept="image/*" id="logoInputPP" onChange={handleLogo} style={{display:"none"}}/>
              <div style={{display:"grid",gap:10}}>
                <button onClick={function(){document.getElementById("logoInputPP").click();}} style={{background:T.accent,color:"#fff",border:"none",borderRadius:8,padding:"12px 20px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Choisir un logo (PNG / JPG / SVG)</button>
                {info.logo&&<button onClick={resetLogo} style={{background:T.redL,color:T.red,border:"1px solid "+T.red,borderRadius:8,padding:"10px 20px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Retirer le logo</button>}
              </div>
              <div style={{marginTop:12,background:info.logo?T.accentL:T.blueL,borderRadius:8,padding:"10px 14px",fontSize:11,color:info.logo?T.accent:T.blue}}>{info.logo?"Logo actif — visible dans la barre de navigation.":"Cliquez pour ajouter votre logo. Recommande: 200x200px."}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}