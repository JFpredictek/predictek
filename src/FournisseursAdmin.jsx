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

var CATS=["Deneigement","Paysagement","Plomberie","Electricite","Chauffage","Ascenseur","Nettoyage","Serrurerie","Peinture","Toiture","Construction","Autre"];

var FOURNISSEURS_INIT=[
  {id:1,nom:"Deneigement Express",cat:"Deneigement",tel:"418-555-1001",courriel:"info@deneigementexpress.com",contact:"Marc Gagnon",syndicats:["PIED","ERAB","BELV"],actif:true,note:4.8,nbContrats:12,totalFacture:89500,certifie:true,assurance:true,rbq:"5830-1234-01",notes:"Fiable, toujours ponctuel. Tarif preferentiel pour 3 syndicats et plus."},
  {id:2,nom:"Paysagement Horizon",cat:"Paysagement",tel:"418-555-2002",courriel:"contact@paysagementhorizon.com",contact:"Sophie Larose",syndicats:["PIED","ERAB"],actif:true,note:4.5,nbContrats:8,totalFacture:42300,certifie:true,assurance:true,rbq:"5830-2345-02",notes:"Bon travail. Parfois en retard en haute saison."},
  {id:3,nom:"Plomberie ProFlo",cat:"Plomberie",tel:"418-555-3003",courriel:"urgence@proflo.com",contact:"Denis Bouchard",syndicats:["PIED","BELV"],actif:true,note:4.9,nbContrats:23,totalFacture:67800,certifie:true,assurance:true,rbq:"5830-3456-03",notes:"Excellent. Disponible 24/7 pour urgences. Recommande."},
  {id:4,nom:"ElectroServ QC",cat:"Electricite",tel:"418-555-4004",courriel:"service@electroserv.com",contact:"Patrick Simard",syndicats:["PIED","ERAB","BELV"],actif:true,note:4.6,nbContrats:15,totalFacture:54200,certifie:true,assurance:true,rbq:"5830-4567-04",notes:"Maitre electricien. Bon rapport qualite-prix."},
  {id:5,nom:"AscenseurTech QC",cat:"Ascenseur",tel:"418-555-5005",courriel:"info@ascenseurtech.com",contact:"Lise Trottier",syndicats:["PIED"],actif:true,note:4.7,nbContrats:6,totalFacture:28900,certifie:true,assurance:true,rbq:"5830-5678-05",notes:"Specialiste ascenseurs. Inspection annuelle fiable."},
  {id:6,nom:"ChauFroid Expert",cat:"Chauffage",tel:"418-555-6006",courriel:"service@chaufroid.com",contact:"Alain Perron",syndicats:["PIED","ERAB","BELV"],actif:true,note:4.4,nbContrats:19,totalFacture:73100,certifie:true,assurance:true,rbq:"5830-6789-06",notes:"Competent. Delais parfois longs en hiver."},
  {id:7,nom:"Nettoyage Prestige",cat:"Nettoyage",tel:"418-555-7007",courriel:"info@nettoyageprestige.com",contact:"Julie Cote",syndicats:["ERAB","BELV"],actif:true,note:4.3,nbContrats:24,totalFacture:31600,certifie:false,assurance:true,rbq:"",notes:"Bon service regulier. Pas de certification RBQ (non requise)."},
  {id:8,nom:"Serrurier Express",cat:"Serrurerie",tel:"418-555-8008",courriel:"urgence@serrurier.com",contact:"Carl Morin",syndicats:["PIED","BELV"],actif:true,note:4.2,nbContrats:7,totalFacture:8400,certifie:false,assurance:true,rbq:"",notes:"Disponible rapidement. Utilise pour urgences surtout."},
  {id:9,nom:"Toitures Massicotte",cat:"Toiture",tel:"418-555-9009",courriel:"soumissions@massicotte.com",contact:"Richard Massicotte",syndicats:["ERAB"],actif:false,note:3.8,nbContrats:2,totalFacture:45000,certifie:true,assurance:true,rbq:"5830-7890-09",notes:"Contrat termine. Non renouvele suite a problemes de qualite."},
];

var BONS_GLOBAUX=[
  {id:1,syndicat:"PIED",fournisseur:"Plomberie ProFlo",unite:"527",desc:"Reparation fuite cuisine",date:"2026-04-22",mnt:485,statut:"approuve"},
  {id:2,syndicat:"ERAB",fournisseur:"ChauFroid Expert",unite:"12",desc:"Inspection systeme chauffage",date:"2026-04-18",mnt:320,statut:"complete"},
  {id:3,syndicat:"BELV",fournisseur:"ElectroServ QC",unite:"05",desc:"Remplacement panneau electrique",date:"2026-04-15",mnt:2400,statut:"complete"},
  {id:4,syndicat:"PIED",fournisseur:"Deneigement Express",unite:"commun",desc:"Deneigement urgence stationnement",date:"2026-04-10",mnt:850,statut:"complete"},
  {id:5,syndicat:"ERAB",fournisseur:"Paysagement Horizon",unite:"commun",desc:"Nettoyage printemps",date:"2026-04-08",mnt:1200,statut:"approuve"},
];

export default function FournisseursAdmin(){
  var s0=useState("repertoire");var ong=s0[0];var setOng=s0[1];
  var s1=useState(FOURNISSEURS_INIT);var fournisseurs=s1[0];var setFournisseurs=s1[1];
  var s2=useState(null);var sel=s2[0];var setSel=s2[1];
  var s3=useState("");var search=s3[0];var setSearch=s3[1];
  var s4=useState("tous");var filtreCat=s4[0];var setFiltreCat=s4[1];
  var s5=useState("tous");var filtreSynd=s5[0];var setFiltreSynd=s5[1];
  var s6=useState(false);var showN=s6[0];var setShowN=s6[1];
  var s7=useState({});var nf=s7[0];var setNf=s7[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  var SYNDS=["PIED","ERAB","BELV"];
  var actifs=fournisseurs.filter(function(f){return f.actif;});
  var totalFacture=actifs.reduce(function(a,f){return a+f.totalFacture;},0);
  var noteMoy=actifs.length>0?Math.round(actifs.reduce(function(a,f){return a+f.note;},0)/actifs.length*10)/10:0;

  var liste=fournisseurs.filter(function(f){
    if(search&&!(f.nom.toLowerCase().includes(search.toLowerCase())||f.cat.toLowerCase().includes(search.toLowerCase())))return false;
    if(filtreCat!=="tous"&&f.cat!==filtreCat)return false;
    if(filtreSynd!=="tous"&&!f.syndicats.includes(filtreSynd))return false;
    return true;
  });

  var selF=sel?fournisseurs.find(function(f){return f.id===sel;}):null;

  function etoiles(n){var s="";for(var i=0;i<5;i++)s+=i<Math.floor(n)?"*":i<n?"~":"_";return s;}

  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:17,fontWeight:800,color:T.navy}}>Fournisseurs — Vue globale Predictek</div>
          <div style={{fontSize:11,color:T.muted}}>Repertoire centralise — tous syndicats confondus</div>
        </div>
        <Btn onClick={function(){setNf({nom:"",cat:"Plomberie",tel:"",courriel:"",contact:"",syndicats:[],actif:true,note:0,nbContrats:0,totalFacture:0,certifie:false,assurance:false,rbq:"",notes:""});setShowN(true);}}>+ Nouveau fournisseur</Btn>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[
          {l:"Fournisseurs actifs",v:actifs.length,c:T.navy,bg:T.blueL},
          {l:"Total facture (cumul)",v:money(totalFacture),c:T.accent,bg:T.accentL},
          {l:"Note moyenne",v:noteMoy+"/5",c:noteMoy>=4.5?T.accent:noteMoy>=4?T.amber:T.red,bg:noteMoy>=4.5?T.accentL:noteMoy>=4?T.amberL:T.redL},
          {l:"Categories actives",v:new Set(actifs.map(function(f){return f.cat;})).size,c:T.purple,bg:T.purpleL},
        ].map(function(st,i){return(
          <div key={i} style={{background:st.bg,borderRadius:10,padding:"11px 13px",border:"1px solid "+st.c+"33"}}>
            <div style={{fontSize:9,color:st.c,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{st.l}</div>
            <div style={{fontSize:17,fontWeight:800,color:st.c}}>{st.v}</div>
          </div>
        );})}
      </div>

      <div style={{display:"flex",gap:3,marginBottom:14,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {[["repertoire","Repertoire"],["bons","Bons de travail globaux"],["performance","Performance"]].map(function(t){var a=ong===t[0];return(
          <button key={t[0]} onClick={function(){setOng(t[0]);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"7px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t[1]}</button>
        );})}
      </div>

      {ong==="repertoire"&&(
        <div>
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
            <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Rechercher..." style={{border:"1px solid "+T.border,borderRadius:20,padding:"4px 12px",fontSize:11,fontFamily:"inherit",outline:"none",width:180}}/>
            <select value={filtreCat} onChange={function(e){setFiltreCat(e.target.value);}} style={{border:"1px solid "+T.border,borderRadius:20,padding:"4px 10px",fontSize:11,fontFamily:"inherit",outline:"none",background:"#fff"}}>
              <option value="tous">Toutes categories</option>
              {CATS.map(function(c){return <option key={c} value={c}>{c}</option>;})}
            </select>
            <select value={filtreSynd} onChange={function(e){setFiltreSynd(e.target.value);}} style={{border:"1px solid "+T.border,borderRadius:20,padding:"4px 10px",fontSize:11,fontFamily:"inherit",outline:"none",background:"#fff"}}>
              <option value="tous">Tous syndicats</option>
              {SYNDS.map(function(s){return <option key={s} value={s}>{s}</option>;})}
            </select>
            <span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>{liste.length} fournisseur(s)</span>
          </div>

          <div style={{display:"flex",gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:T.navy}}>
                      {["Nom","Categorie","Contact","Syndicats","Note","Facture total","Cert.","Statut"].map(function(h){return <th key={h} style={{padding:"7px 10px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>;})}
                    </tr>
                  </thead>
                  <tbody>
                    {liste.map(function(f){return(
                      <tr key={f.id} onClick={function(){setSel(f.id);}} style={{borderBottom:"1px solid "+T.border,background:sel===f.id?T.accentL:f.actif?T.surface:T.alt,cursor:"pointer"}}>
                        <td style={{padding:"8px 10px",fontWeight:600,color:T.text,fontSize:12}}>{f.nom}</td>
                        <td style={{padding:"8px 10px"}}><Bdg bg={T.alt} c={T.muted}>{f.cat}</Bdg></td>
                        <td style={{padding:"8px 10px",fontSize:11,color:T.muted}}>{f.contact}</td>
                        <td style={{padding:"8px 10px"}}>
                          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                            {f.syndicats.map(function(s){return <Bdg key={s} bg={T.blueL} c={T.blue}>{s}</Bdg>;})}
                          </div>
                        </td>
                        <td style={{padding:"8px 10px"}}>
                          <span style={{fontSize:12,fontWeight:700,color:f.note>=4.5?T.accent:f.note>=4?T.amber:T.red}}>{f.note}</span>
                          <span style={{fontSize:9,color:T.muted}}>/5</span>
                        </td>
                        <td style={{padding:"8px 10px",fontSize:11,fontWeight:600,color:T.text}}>{money(f.totalFacture)}</td>
                        <td style={{padding:"8px 10px",textAlign:"center"}}>
                          {f.certifie&&<span style={{fontSize:9,fontWeight:700,color:T.accent,background:T.accentL,padding:"1px 5px",borderRadius:8}}>RBQ</span>}
                        </td>
                        <td style={{padding:"8px 10px"}}><Bdg bg={f.actif?T.accentL:T.redL} c={f.actif?T.accent:T.red}>{f.actif?"Actif":"Inactif"}</Bdg></td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>

            {selF&&(
              <div style={{width:280,flexShrink:0}}>
                <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:2}}>{selF.nom}</div>
                      <Bdg bg={T.alt} c={T.muted}>{selF.cat}</Bdg>
                    </div>
                    <button onClick={function(){setSel(null);}} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:16,lineHeight:1}}>x</button>
                  </div>
                  {[
                    {l:"Contact",v:selF.contact},
                    {l:"Telephone",v:selF.tel},
                    {l:"Courriel",v:selF.courriel},
                    {l:"No RBQ",v:selF.rbq||"—"},
                    {l:"Nb contrats",v:selF.nbContrats},
                    {l:"Total facture",v:money(selF.totalFacture)},
                  ].map(function(item,i){return(
                    <div key={i} style={{padding:"6px 0",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:10,color:T.muted}}>{item.l}</span>
                      <span style={{fontSize:11,fontWeight:500,color:T.text}}>{item.v}</span>
                    </div>
                  );})}
                  <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
                    <Bdg bg={selF.certifie?T.accentL:T.alt} c={selF.certifie?T.accent:T.muted}>{selF.certifie?"Certifie RBQ":"Non certifie"}</Bdg>
                    <Bdg bg={selF.assurance?T.accentL:T.redL} c={selF.assurance?T.accent:T.red}>{selF.assurance?"Assure":"Non assure"}</Bdg>
                  </div>
                  {selF.notes&&<div style={{marginTop:10,background:T.alt,borderRadius:7,padding:"8px 10px",fontSize:11,color:T.muted,lineHeight:1.5}}>{selF.notes}</div>}
                  <div style={{marginTop:10}}>
                    <Lbl l="Syndicats assignes"/>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {SYNDS.map(function(s){var on=selF.syndicats.includes(s);return(
                        <button key={s} onClick={function(){setFournisseurs(function(prev){return prev.map(function(f){if(f.id!==selF.id)return f;var ns=on?f.syndicats.filter(function(x){return x!==s;}):f.syndicats.concat([s]);return Object.assign({},f,{syndicats:ns});});});}} style={{padding:"3px 9px",border:"1px solid "+(on?T.accent:T.border),borderRadius:20,background:on?T.accentL:T.surface,color:on?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:on?600:400}}>{s}</button>
                      );})}
                    </div>
                  </div>
                  <div style={{marginTop:10,display:"flex",gap:6}}>
                    <Btn sm bg={selF.actif?T.redL:T.accentL} tc={selF.actif?T.red:T.accent} bdr={"1px solid "+(selF.actif?T.red:T.accent)} onClick={function(){setFournisseurs(function(prev){return prev.map(function(f){return f.id===selF.id?Object.assign({},f,{actif:!f.actif}):f;});});}}>
                      {selF.actif?"Desactiver":"Reactiver"}
                    </Btn>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {ong==="bons"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <b style={{fontSize:13,color:T.navy}}>Bons de travail — tous syndicats</b>
          </div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:T.navy}}>
                  {["Syndicat","Fournisseur","Unite","Description","Date","Montant","Statut"].map(function(h){return <th key={h} style={{padding:"7px 12px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>;})}
                </tr>
              </thead>
              <tbody>
                {BONS_GLOBAUX.map(function(b){return(
                  <tr key={b.id} style={{borderBottom:"1px solid "+T.border}}>
                    <td style={{padding:"9px 12px"}}><Bdg bg={T.blueL} c={T.blue}>{b.syndicat}</Bdg></td>
                    <td style={{padding:"9px 12px",fontSize:12,fontWeight:600,color:T.text}}>{b.fournisseur}</td>
                    <td style={{padding:"9px 12px",fontSize:11,color:T.muted}}>{b.unite}</td>
                    <td style={{padding:"9px 12px",fontSize:12,color:T.text}}>{b.desc}</td>
                    <td style={{padding:"9px 12px",fontSize:11,color:T.muted,whiteSpace:"nowrap"}}>{b.date}</td>
                    <td style={{padding:"9px 12px",fontSize:12,fontWeight:600}}>{money(b.mnt)}</td>
                    <td style={{padding:"9px 12px"}}><Bdg bg={b.statut==="complete"?T.accentL:T.amberL} c={b.statut==="complete"?T.accent:T.amber}>{b.statut==="complete"?"Complete":"Approuve"}</Bdg></td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ong==="performance"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {actifs.sort(function(a,b){return b.note-a.note;}).map(function(f){return(
              <div key={f.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:2}}>{f.nom}</div>
                    <Bdg bg={T.alt} c={T.muted}>{f.cat}</Bdg>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:800,color:f.note>=4.5?T.accent:f.note>=4?T.amber:T.red}}>{f.note}</div>
                    <div style={{fontSize:8,color:T.muted}}>sur 5</div>
                  </div>
                </div>
                <div style={{height:4,background:T.border,borderRadius:2,overflow:"hidden",marginBottom:10}}>
                  <div style={{width:(f.note/5*100)+"%",height:"100%",background:f.note>=4.5?T.accent:f.note>=4?T.amber:T.red,borderRadius:2}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.muted}}>
                  <span>{f.nbContrats} contrats</span>
                  <span>{money(f.totalFacture)}</span>
                </div>
                <div style={{marginTop:8,display:"flex",gap:3,flexWrap:"wrap"}}>
                  {f.syndicats.map(function(s){return <Bdg key={s} bg={T.blueL} c={T.blue}>{s}</Bdg>;})}
                </div>
              </div>
            );})}
          </div>
        </div>
      )}

      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouveau fournisseur" w={560}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <FRow l="Nom" full><input value={nf.nom||""} onChange={function(e){snf("nom",e.target.value);}} style={INP}/></FRow>
          <FRow l="Categorie">
            <select value={nf.cat||"Plomberie"} onChange={function(e){snf("cat",e.target.value);}} style={INP}>
              {CATS.map(function(c){return <option key={c} value={c}>{c}</option>;})}
            </select>
          </FRow>
          <FRow l="Contact"><input value={nf.contact||""} onChange={function(e){snf("contact",e.target.value);}} style={INP}/></FRow>
          <FRow l="Telephone"><input value={nf.tel||""} onChange={function(e){snf("tel",e.target.value);}} style={INP}/></FRow>
          <FRow l="Courriel" full><input value={nf.courriel||""} onChange={function(e){snf("courriel",e.target.value);}} style={INP}/></FRow>
          <FRow l="No RBQ"><input value={nf.rbq||""} onChange={function(e){snf("rbq",e.target.value);}} style={INP}/></FRow>
          <FRow l="Syndicats" full>
            <div style={{display:"flex",gap:6}}>
              {SYNDS.map(function(s){var on=(nf.syndicats||[]).includes(s);return(
                <button key={s} onClick={function(){var cur=nf.syndicats||[];snf("syndicats",on?cur.filter(function(x){return x!==s;}):cur.concat([s]));}} style={{padding:"4px 12px",border:"1px solid "+(on?T.accent:T.border),borderRadius:20,background:on?T.accentL:T.surface,color:on?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:on?600:400}}>{s}</button>
              );})}
            </div>
          </FRow>
          <FRow l="Notes" full><textarea value={nf.notes||""} onChange={function(e){snf("notes",e.target.value);}} rows={3} style={Object.assign({},INP,{resize:"vertical"})}/></FRow>
          <div style={{display:"flex",gap:14}}>
            <label style={{display:"flex",gap:6,alignItems:"center",fontSize:12,cursor:"pointer"}}>
              <input type="checkbox" checked={!!nf.certifie} onChange={function(e){snf("certifie",e.target.checked);}}/>Certifie RBQ
            </label>
            <label style={{display:"flex",gap:6,alignItems:"center",fontSize:12,cursor:"pointer"}}>
              <input type="checkbox" checked={!!nf.assurance} onChange={function(e){snf("assurance",e.target.checked);}}/>Assure
            </label>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){if(!nf.nom)return;setFournisseurs(function(prev){return prev.concat([Object.assign({},nf,{id:Date.now(),note:0,nbContrats:0,totalFacture:0})]);});setShowN(false);}}>Ajouter</Btn>
          <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}
