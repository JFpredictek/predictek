import { useState } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
var today=function(){return new Date().toISOString().slice(0,10);};
var now=function(){return new Date().toLocaleString("fr-CA",{hour12:false}).replace(",","");};
function Bdg(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap",display:"inline-block"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit",width:p.fw?"100%":"auto",opacity:p.dis?0.6:1}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Modal(p){
  if(!p.show)return null;
  return(
    <div onClick={function(e){if(e.target===e.currentTarget)p.onClose();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:24,width:p.w||560,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <b style={{fontSize:15,color:T.text}}>{p.title}</b>
          <button onClick={p.onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:T.muted,lineHeight:1}}>x</button>
        </div>
        {p.children}
      </div>
    </div>
  );
}

var HISTORIQUE_INIT=[];

var TEMPLATES=[];

var DESTINATAIRES=[];

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
      date:now(),
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

        {sent&&<div style={{background:T.accentL,borderRadius:8,padding:"9px 14px",fontSize:12,color:T.accent,marginBottom:10,fontWeight:600}}>Communication envoyee (simulation) — apparait dans l historique ci-dessous.</div>}

        <div style={{background:T.amberL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.amber,marginBottom:12}}>
          Mode simulation — Les envois reels necessitent SendGrid (courriel) et Twilio (SMS). Chaque envoi est loggue dans l historique.
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
          <Btn sm fw onClick={function(){if(!testDest||!testMsg)return;alert("Test envoye (simulation) a: "+testDest+"\nConnectez SendGrid/Twilio pour envois reels.");}} dis={!testDest||!testMsg}>Envoyer test</Btn>
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

export default function ModuleCommunications(){
  var s0=useState("envoi");var ong=s0[0];var setOng=s0[1];
  var TABS=[];
  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Communications Predictek</div>
          <div style={{fontSize:11,color:T.muted}}>Courriel, SMS et notifications portail — SendGrid + Twilio</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <Bdg bg={T.blueL} c={T.blue}>SendGrid</Bdg>
          <Bdg bg={T.accentL} c={T.accent}>Twilio</Bdg>
          <Bdg bg={T.amberL} c={T.amber}>Simulation</Bdg>
        </div>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:16,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {TABS.map(function(t){var a=ong===t.id;return(
          <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"8px 16px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t.l}</button>
        );})}
      </div>
      {ong==="envoi"&&<TabEnvoiManuel/>}
      {ong==="historique"&&<TabHistorique/>}
      {ong==="config"&&<TabConfig/>}
    </div>
  );
}
