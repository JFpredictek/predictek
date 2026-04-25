import { useState } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",pop:"#3CAF6E",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
var money=function(n){return Math.abs(n||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var today=function(){return new Date().toISOString().slice(0,10);};
function Bdg(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap",display:"inline-block"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} style={{background:p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function FRow(p){return <div style={p.full?{gridColumn:"1/-1"}:{}}><Lbl l={p.l}/>{p.children}</div>;}
function Modal(p){
  if(!p.show)return null;
  return(
    <div onClick={function(e){if(e.target===e.currentTarget)p.onClose();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:24,width:p.w||520,maxWidth:"94vw",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <b style={{fontSize:14,color:T.text}}>{p.title}</b>
          <button onClick={p.onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.muted,lineHeight:1}}>x</button>
        </div>
        {p.children}
      </div>
    </div>
  );
}

var FOURNISSEURS_SYND=[
  {id:1,nom:"Deneigement Express",cat:"Deneigement",tel:"418-555-1001",courriel:"info@deneigementexpress.com",contact:"Marc Gagnon",note:4.8,certifie:true,assurance:true},
  {id:2,nom:"Paysagement Horizon",cat:"Paysagement",tel:"418-555-2002",courriel:"contact@paysagementhorizon.com",contact:"Sophie Larose",note:4.5,certifie:true,assurance:true},
  {id:3,nom:"Plomberie ProFlo",cat:"Plomberie",tel:"418-555-3003",courriel:"urgence@proflo.com",contact:"Denis Bouchard",note:4.9,certifie:true,assurance:true},
  {id:4,nom:"ElectroServ QC",cat:"Electricite",tel:"418-555-4004",courriel:"service@electroserv.com",contact:"Patrick Simard",note:4.6,certifie:true,assurance:true},
  {id:5,nom:"AscenseurTech QC",cat:"Ascenseur",tel:"418-555-5005",courriel:"info@ascenseurtech.com",contact:"Lise Trottier",note:4.7,certifie:true,assurance:true},
  {id:6,nom:"ChauFroid Expert",cat:"Chauffage",tel:"418-555-6006",courriel:"service@chaufroid.com",contact:"Alain Perron",note:4.4,certifie:true,assurance:true},
];

var BONS_INIT=[
  {id:1,fournisseur:"Plomberie ProFlo",cat:"Plomberie",unite:"527",desc:"Reparation fuite sous evier cuisine",date:"2026-04-22",mnt:485,statut:"approuve",prio:"haute",notes:"Fuite visible, risque de degat"},
  {id:2,fournisseur:"Deneigement Express",cat:"Deneigement",unite:"commun",desc:"Deneigement urgence stationnement apres tempete",date:"2026-04-10",mnt:850,statut:"complete",prio:"urgence",notes:"Intervention dans les 2h"},
  {id:3,fournisseur:"ElectroServ QC",cat:"Electricite",unite:"commun",desc:"Remplacement eclairage hall entree",date:"2026-04-05",mnt:320,statut:"complete",prio:"normale",notes:""},
  {id:4,fournisseur:"AscenseurTech QC",cat:"Ascenseur",unite:"commun",desc:"Inspection annuelle ascenseur",date:"2026-03-31",mnt:2200,statut:"complete",prio:"normale",notes:"Rapport inspection remis"},
  {id:5,fournisseur:"ChauFroid Expert",cat:"Chauffage",unite:"539",desc:"Bruit dans canalisation chauffage",date:"2026-04-24",mnt:0,statut:"nouveau",prio:"normale",notes:"Diagnostic requis"},
];

var CONTRATS_INIT=[
  {id:1,fournisseur:"Deneigement Express",type:"Annuel",debut:"2025-11-01",fin:"2026-04-30",mntAnnuel:22000,statut:"actif",renouvellement:"auto"},
  {id:2,fournisseur:"Paysagement Horizon",type:"Saisonnier",debut:"2026-04-01",fin:"2026-10-31",mntAnnuel:8500,statut:"actif",renouvellement:"manuel"},
  {id:3,fournisseur:"AscenseurTech QC",type:"Entretien",debut:"2026-01-01",fin:"2026-12-31",mntAnnuel:4800,statut:"actif",renouvellement:"auto"},
];

export default function FournisseursCA(){
  var s0=useState("bons");var ong=s0[0];var setOng=s0[1];
  var s1=useState(BONS_INIT);var bons=s1[0];var setBons=s1[1];
  var s2=useState(null);var sel=s2[0];var setSel=s2[1];
  var s3=useState(false);var showN=s3[0];var setShowN=s3[1];
  var s4=useState(false);var showSoum=s4[0];var setShowSoum=s4[1];
  var s5=useState({});var nf=s5[0];var setNf=s5[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  var nouveaux=bons.filter(function(b){return b.statut==="nouveau";}).length;
  var approuves=bons.filter(function(b){return b.statut==="approuve";}).length;
  var mntTotal=bons.reduce(function(a,b){return a+b.mnt;},0);

  var selB=sel?bons.find(function(b){return b.id===sel;}):null;

  function approuver(id){
    setBons(function(prev){return prev.map(function(b){return b.id===id?Object.assign({},b,{statut:"approuve"}):b;});});
  }
  function completer(id){
    setBons(function(prev){return prev.map(function(b){return b.id===id?Object.assign({},b,{statut:"complete"}):b;});});
  }

  var PRIO_ST={urgence:{c:T.red,bg:T.redL},haute:{c:T.amber,bg:T.amberL},normale:{c:T.accent,bg:T.accentL}};
  var BON_ST={nouveau:{c:T.blue,bg:T.blueL,l:"Nouveau"},approuve:{c:T.amber,bg:T.amberL,l:"Approuve"},complete:{c:T.accent,bg:T.accentL,l:"Complete"}};

  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T.navy}}>Fournisseurs — Syndicat Piedmont</div>
          <div style={{fontSize:11,color:T.muted}}>Gestion locale des fournisseurs et bons de travail</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn sm bg={T.purple} onClick={function(){setShowSoum(true);}}>Appel offres</Btn>
          <Btn sm onClick={function(){setNf({fournisseur:FOURNISSEURS_SYND[0].nom,cat:"Plomberie",unite:"",desc:"",date:today(),mnt:"",prio:"normale",notes:""});setShowN(true);}}>+ Bon de travail</Btn>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[
          {l:"Fournisseurs assignes",v:FOURNISSEURS_SYND.length,c:T.navy,bg:T.blueL},
          {l:"Bons en cours",v:nouveaux+approuves,c:nouveaux>0?T.red:T.amber,bg:nouveaux>0?T.redL:T.amberL},
          {l:"Contrats actifs",v:CONTRATS_INIT.length,c:T.accent,bg:T.accentL},
          {l:"Total bons (2026)",v:money(mntTotal),c:T.navy,bg:T.blueL},
        ].map(function(st,i){return(
          <div key={i} style={{background:st.bg,borderRadius:10,padding:"11px 13px",border:"1px solid "+st.c+"33"}}>
            <div style={{fontSize:9,color:st.c,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{st.l}</div>
            <div style={{fontSize:17,fontWeight:800,color:st.c}}>{st.v}</div>
          </div>
        );})}
      </div>

      <div style={{display:"flex",gap:3,marginBottom:14,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {[["bons","Bons de travail"],["fournisseurs","Nos fournisseurs"],["contrats","Contrats"]].map(function(t){var a=ong===t[0];return(
          <button key={t[0]} onClick={function(){setOng(t[0]);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"7px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t[1]}</button>
        );})}
      </div>

      {ong==="bons"&&(
        <div style={{display:"flex",gap:12}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:T.navy}}>
                    {["Fournisseur","Unite","Description","Date","Montant","Priorite","Statut","Action"].map(function(h){return <th key={h} style={{padding:"7px 10px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>;})}
                  </tr>
                </thead>
                <tbody>
                  {bons.map(function(b){var st=BON_ST[b.statut]||BON_ST.nouveau;var pr=PRIO_ST[b.prio]||PRIO_ST.normale;return(
                    <tr key={b.id} onClick={function(){setSel(b.id);}} style={{borderBottom:"1px solid "+T.border,background:sel===b.id?T.accentL:T.surface,cursor:"pointer"}}>
                      <td style={{padding:"8px 10px",fontWeight:600,fontSize:12,color:T.text}}>{b.fournisseur}</td>
                      <td style={{padding:"8px 10px",fontSize:11,color:T.muted}}>{b.unite}</td>
                      <td style={{padding:"8px 10px",fontSize:12,color:T.text,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.desc}</td>
                      <td style={{padding:"8px 10px",fontSize:11,color:T.muted,whiteSpace:"nowrap"}}>{b.date}</td>
                      <td style={{padding:"8px 10px",fontSize:12,fontWeight:600}}>{b.mnt>0?money(b.mnt):"A definir"}</td>
                      <td style={{padding:"8px 10px"}}><Bdg bg={pr.bg} c={pr.c}>{b.prio}</Bdg></td>
                      <td style={{padding:"8px 10px"}}><Bdg bg={st.bg} c={st.c}>{st.l}</Bdg></td>
                      <td style={{padding:"8px 10px"}} onClick={function(e){e.stopPropagation();}}>
                        <div style={{display:"flex",gap:4}}>
                          {b.statut==="nouveau"&&<Btn sm onClick={function(){approuver(b.id);}}>Approuver</Btn>}
                          {b.statut==="approuve"&&<Btn sm bg={T.blueL} tc={T.blue} onClick={function(){completer(b.id);}}>Completer</Btn>}
                        </div>
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          </div>

          {selB&&(
            <div style={{width:260,flexShrink:0}}>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <b style={{fontSize:13,color:T.navy}}>Detail bon #{selB.id}</b>
                  <button onClick={function(){setSel(null);}} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:16,lineHeight:1}}>x</button>
                </div>
                {[
                  {l:"Fournisseur",v:selB.fournisseur},
                  {l:"Categorie",v:selB.cat},
                  {l:"Unite",v:selB.unite},
                  {l:"Date",v:selB.date},
                  {l:"Montant",v:selB.mnt>0?money(selB.mnt):"A definir"},
                ].map(function(item,i){return(
                  <div key={i} style={{padding:"6px 0",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:10,color:T.muted}}>{item.l}</span>
                    <span style={{fontSize:11,fontWeight:500,color:T.text}}>{item.v}</span>
                  </div>
                );})}
                <div style={{marginTop:10}}>
                  <Lbl l="Description"/>
                  <div style={{fontSize:12,color:T.text,background:T.alt,borderRadius:7,padding:"8px 10px",lineHeight:1.5}}>{selB.desc}</div>
                </div>
                {selB.notes&&<div style={{marginTop:8,fontSize:11,color:T.muted,background:T.amberL,borderRadius:7,padding:"7px 10px"}}>{selB.notes}</div>}
                <div style={{marginTop:12,display:"flex",gap:6}}>
                  {selB.statut==="nouveau"&&<Btn sm onClick={function(){approuver(selB.id);setSel(null);}}>Approuver</Btn>}
                  {selB.statut==="approuve"&&<Btn sm bg={T.blueL} tc={T.blue} onClick={function(){completer(selB.id);setSel(null);}}>Marquer complete</Btn>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {ong==="fournisseurs"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {FOURNISSEURS_SYND.map(function(f){return(
            <div key={f.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>{f.nom}</div>
                  <Bdg bg={T.alt} c={T.muted}>{f.cat}</Bdg>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:800,color:f.note>=4.5?T.accent:T.amber}}>{f.note}</div>
                  <div style={{fontSize:8,color:T.muted}}>sur 5</div>
                </div>
              </div>
              <div style={{fontSize:11,color:T.muted,marginBottom:4}}>{f.contact}</div>
              <div style={{fontSize:11,color:T.blue,marginBottom:4}}>{f.tel}</div>
              <div style={{fontSize:11,color:T.muted,marginBottom:10,wordBreak:"break-all"}}>{f.courriel}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
                <Bdg bg={f.certifie?T.accentL:T.alt} c={f.certifie?T.accent:T.muted}>{f.certifie?"RBQ":"Sans RBQ"}</Bdg>
                <Bdg bg={f.assurance?T.accentL:T.redL} c={f.assurance?T.accent:T.red}>{f.assurance?"Assure":"Non assure"}</Bdg>
              </div>
              <Btn sm fw onClick={function(){setNf({fournisseur:f.nom,cat:f.cat,unite:"",desc:"",date:today(),mnt:"",prio:"normale",notes:""});setShowN(true);}}>Creer bon de travail</Btn>
            </div>
          );})}
        </div>
      )}

      {ong==="contrats"&&(
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:T.navy}}>
                {["Fournisseur","Type","Debut","Fin","Montant annuel","Renouvellement","Statut"].map(function(h){return <th key={h} style={{padding:"7px 12px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left"}}>{h}</th>;})}
              </tr>
            </thead>
            <tbody>
              {CONTRATS_INIT.map(function(c){return(
                <tr key={c.id} style={{borderBottom:"1px solid "+T.border}}>
                  <td style={{padding:"10px 12px",fontWeight:600,fontSize:12,color:T.text}}>{c.fournisseur}</td>
                  <td style={{padding:"10px 12px"}}><Bdg bg={T.alt} c={T.muted}>{c.type}</Bdg></td>
                  <td style={{padding:"10px 12px",fontSize:11,color:T.muted}}>{c.debut}</td>
                  <td style={{padding:"10px 12px",fontSize:11,color:T.muted}}>{c.fin}</td>
                  <td style={{padding:"10px 12px",fontSize:12,fontWeight:600}}>{money(c.mntAnnuel)}</td>
                  <td style={{padding:"10px 12px"}}><Bdg bg={c.renouvellement==="auto"?T.accentL:T.amberL} c={c.renouvellement==="auto"?T.accent:T.amber}>{c.renouvellement==="auto"?"Auto":"Manuel"}</Bdg></td>
                  <td style={{padding:"10px 12px"}}><Bdg bg={T.accentL} c={T.accent}>{c.statut}</Bdg></td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouveau bon de travail" w={500}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <FRow l="Fournisseur" full>
            <select value={nf.fournisseur||""} onChange={function(e){snf("fournisseur",e.target.value);}} style={INP}>
              {FOURNISSEURS_SYND.map(function(f){return <option key={f.id} value={f.nom}>{f.nom} ({f.cat})</option>;})}
            </select>
          </FRow>
          <FRow l="Unite"><input value={nf.unite||""} onChange={function(e){snf("unite",e.target.value);}} style={INP} placeholder="ex: 527 ou commun"/></FRow>
          <FRow l="Date"><input type="date" value={nf.date||""} onChange={function(e){snf("date",e.target.value);}} style={INP}/></FRow>
          <FRow l="Priorite">
            <select value={nf.prio||"normale"} onChange={function(e){snf("prio",e.target.value);}} style={INP}>
              <option value="normale">Normale</option>
              <option value="haute">Haute</option>
              <option value="urgence">URGENCE</option>
            </select>
          </FRow>
          <FRow l="Montant estime ($)"><input type="number" value={nf.mnt||""} onChange={function(e){snf("mnt",parseFloat(e.target.value)||0);}} style={INP} placeholder="0 si inconnu"/></FRow>
          <FRow l="Description" full><textarea value={nf.desc||""} onChange={function(e){snf("desc",e.target.value);}} rows={3} style={Object.assign({},INP,{resize:"vertical"})}/></FRow>
          <FRow l="Notes internes" full><input value={nf.notes||""} onChange={function(e){snf("notes",e.target.value);}} style={INP}/></FRow>
        </div>
        {nf.prio==="urgence"&&<div style={{background:T.redL,borderRadius:8,padding:"9px 13px",fontSize:11,color:T.red,marginBottom:12}}>URGENCE: Le fournisseur sera contacte immediatement.</div>}
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){
            if(!nf.desc)return;
            setBons(function(prev){return prev.concat([Object.assign({},nf,{id:Date.now(),statut:"nouveau",cat:FOURNISSEURS_SYND.find(function(f){return f.nom===nf.fournisseur;})?FOURNISSEURS_SYND.find(function(f){return f.nom===nf.fournisseur;}).cat:"Autre"})]);});
            setShowN(false);
          }}>Creer le bon</Btn>
          <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>

      <Modal show={showSoum} onClose={function(){setShowSoum(false);}} title="Appel d offres" w={480}>
        <div style={{background:T.blueL,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.blue,marginBottom:14}}>
          Creez un appel d offres pour recevoir des soumissions de plusieurs fournisseurs. L IA analysera les soumissions et recommandera la meilleure option (fonctionnalite IA — prochaine version).
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <FRow l="Type de travaux" full>
            <select style={INP}>
              <option>Deneigement 2026-2027</option>
              <option>Paysagement</option>
              <option>Entretien batiment</option>
              <option>Autre</option>
            </select>
          </FRow>
          <FRow l="Budget prevu"><input type="number" style={INP} placeholder="Ex: 20000"/></FRow>
          <FRow l="Date limite soumissions"><input type="date" style={INP}/></FRow>
          <FRow l="Description" full><textarea rows={3} style={Object.assign({},INP,{resize:"vertical"})} placeholder="Decrivez les travaux requis..."/></FRow>
        </div>
        <div style={{background:T.amberL,borderRadius:8,padding:"9px 13px",fontSize:11,color:T.amber,marginBottom:14}}>Envoi des appels d offres aux fournisseurs certifies disponibles dans votre categorie.</div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){alert("Appel d offres cree! Fournisseurs notifies. (Supabase requis pour envoi reel)");setShowSoum(false);}}>Envoyer l appel d offres</Btn>
          <Btn onClick={function(){setShowSoum(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}
