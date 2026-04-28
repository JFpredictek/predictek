import sb from "./lib/supabase";
import { useState, useEffect } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",pop:"#3CAF6E",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
function Bdg(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap",display:"inline-block"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit",opacity:p.dis?0.6:1}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Modal(p){
  if(!p.show)return null;
  return(
    <div onClick={function(e){if(e.target===e.currentTarget)p.onClose();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:24,width:p.w||520,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <b style={{fontSize:14,color:T.text}}>{p.title}</b>
          <button onClick={p.onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.muted,lineHeight:1}}>x</button>
        </div>
        {p.children}
      </div>
    </div>
  );
}

var today=function(){return new Date().toISOString().slice(0,10);};
var daysLeft=function(d){return d?Math.ceil((new Date(d)-new Date())/86400000):9999;};

// ===== DONNEES =====
var ALERTES_INIT=[];

var MODELES_INIT=[];

var HISTORIQUE_INIT=[];

var PARAMETRES_INIT={convocationCA:false,convocationDelai:10,rapportMensuel:false,alerteCE:false,alerteAss:false,alertePAP:false};

// ===== PANEL ALERTES =====
function PanelAlertes(p){
  var s0=useState("toutes");var filtre=s0[0];var setFiltre=s0[1];
  var s1=useState(null);var selA=s1[0];var setSelA=s1[1];
  var s2=useState(false);var showEnv=s2[0];var setShowEnv=s2[1];

  function marquerLu(id){p.setAlertes(function(prev){return prev.map(function(a){return a.id===id?Object.assign({},a,{lu:true}):a;});});}
  function marquerToutLu(){p.setAlertes(function(prev){return prev.map(function(a){return Object.assign({},a,{lu:true});});});}

  var liste=p.alertes.filter(function(a){
    if(filtre==="non_lues")return !a.lu;
    if(filtre==="critique")return a.prio==="critique";
    if(filtre==="attention")return a.prio==="attention";
    return true;
  });

  var nonLues=p.alertes.filter(function(a){return !a.lu;}).length;
  var critiques=p.alertes.filter(function(a){return a.prio==="critique";}).length;

  var PRIO={
    critique:{c:T.red,bg:T.redL,l:"Critique"},
    attention:{c:T.amber,bg:T.amberL,l:"Attention"},
    info:{c:T.blue,bg:T.blueL,l:"Info"},
  };
  var TYPE_ICONS={
    ce_expire:"CE",ce_bientot:"CE",ass_expire:"Ass",ass_bientot:"Ass",
    pap_manquant:"PAP",reunion:"CA",rapport:"Rpt",cotisation:"Cot"
  };

  var selAlert=selA?p.alertes.find(function(a){return a.id===selA;}):null;

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[
          {l:"Non lues",v:nonLues,c:nonLues>0?T.red:T.accent,bg:nonLues>0?T.redL:T.accentL},
          {l:"Critiques",v:critiques,c:critiques>0?T.red:T.accent,bg:critiques>0?T.redL:T.accentL},
          {l:"Total alertes",v:p.alertes.length,c:T.navy,bg:T.blueL},
          {l:"Envoyes ce mois",v:HISTORIQUE_INIT.length,c:T.accent,bg:T.accentL},
        ].map(function(s,i){return(
          <div key={i} style={{background:s.bg,borderRadius:10,padding:"11px 13px",border:"1px solid "+s.c+"33"}}>
            <div style={{fontSize:9,color:s.c,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{s.l}</div>
            <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
          </div>
        );})}
      </div>

      <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center"}}>
        {[["toutes","Toutes"],["non_lues","Non lues ("+nonLues+")"],["critique","Critiques"],["attention","Attention"]].map(function(f){var a=filtre===f[0];return(
          <button key={f[0]} onClick={function(){setFiltre(f[0]);}} style={{background:a?T.navy:"#fff",border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"4px 12px",color:a?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{f[1]}</button>
        );})}
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          {nonLues>0&&<Btn sm bg={T.muted} onClick={marquerToutLu}>Tout marquer lu</Btn>}
        </div>
      </div>

      <div style={{display:"flex",gap:12}}>
        <div style={{flex:1}}>
          {liste.map(function(a){
            var pr=PRIO[a.prio]||PRIO.info;
            return(
              <div key={a.id} onClick={function(){setSelA(a.id);if(!a.lu)marquerLu(a.id);}} style={{background:selA===a.id?T.accentL:a.lu?T.surface:"#FFFBF0",border:"1px solid "+(selA===a.id?T.accent:a.lu?T.border:T.amber+"66"),borderRadius:10,padding:13,marginBottom:7,cursor:"pointer",display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{width:36,height:36,borderRadius:9,background:pr.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:9,fontWeight:800,color:pr.c}}>{TYPE_ICONS[a.type]||"?"}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <Bdg bg={pr.bg} c={pr.c}>{pr.l}</Bdg>
                      {!a.lu&&<span style={{width:7,height:7,borderRadius:"50%",background:T.red,display:"inline-block"}}/>}
                    </div>
                    <span style={{fontSize:10,color:T.muted}}>{a.date}</span>
                  </div>
                  <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:2}}>{a.unite!=="tous"?"Unite "+a.unite+" - ":""}{a.nom}</div>
                  <div style={{fontSize:11,color:T.muted}}>{a.detail}</div>
                </div>
              </div>
            );
          })}
          {liste.length===0&&<div style={{textAlign:"center",padding:40,color:T.muted,fontSize:13}}>Aucune alerte dans cette categorie</div>}
        </div>

        {selAlert&&(
          <div style={{width:300,flexShrink:0}}>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
              <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>Detail de l alerte</div>
              <div style={{background:T.alt,borderRadius:8,padding:12,marginBottom:12}}>
                <div style={{fontSize:10,color:T.muted,marginBottom:3}}>Alerte</div>
                <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:6}}>{selAlert.detail}</div>
                <div style={{fontSize:10,color:T.muted,marginBottom:3}}>Action recommandee</div>
                <div style={{fontSize:12,color:T.accent,fontWeight:500}}>{selAlert.action}</div>
              </div>
              <div style={{display:"grid",gap:7}}>
                <Btn onClick={function(){setShowEnv(true);}}>Envoyer notification</Btn>
                <Btn bg={T.blueL} tc={T.blue} onClick={function(){alert("Rapport genere! (demo)");}} >Generer rapport</Btn>
                {!selAlert.lu&&<Btn bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){marquerLu(selAlert.id);setSelA(null);}}>Marquer comme lu</Btn>}
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal show={showEnv} onClose={function(){setShowEnv(false);}} title="Envoyer une notification" w={540}>
        {selAlert&&(
          <div>
            <div style={{background:T.blueL,borderRadius:8,padding:"9px 13px",fontSize:12,color:T.blue,marginBottom:14}}>
              Notification pour: {selAlert.unite!=="tous"?"Unite "+selAlert.unite+" - ":""}{selAlert.nom}
            </div>
            <div style={{marginBottom:12}}>
              <Lbl l="Moyen d envoi"/>
              <div style={{display:"flex",gap:8}}>
                {[["courriel","Courriel"],["sms","SMS"],["portail","Portail"]].map(function(m){return(
                  <div key={m[0]} style={{flex:1,padding:"9px",border:"1px solid "+T.border,borderRadius:8,textAlign:"center",background:T.alt,fontSize:12,color:T.muted}}>{m[1]}</div>
                );})}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <Lbl l="Modele utilise"/>
              <div style={{background:T.alt,borderRadius:8,padding:"9px 12px",fontSize:12,color:T.text}}>{
                selAlert.type==="ce_expire"?"Alerte chauffe-eau expire":
                selAlert.type==="ass_expire"?"Rappel assurance RC":
                selAlert.type==="pap_manquant"?"Demande autorisation PAP":
                selAlert.type==="reunion"?"Convocation reunion CA":
                "Notification generale"
              }</div>
            </div>
            <div style={{marginBottom:16}}>
              <Lbl l="Apercu du message"/>
              <div style={{background:T.alt,borderRadius:8,padding:"11px 13px",fontSize:11,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap",maxHeight:160,overflowY:"auto",border:"1px solid "+T.border}}>{"Madame, Monsieur,\n\n"+selAlert.action+".\n\nCordialement,\nAdministration \nGere par Predictek"}</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={function(){
                p.setAlertes(function(prev){return prev.map(function(a){return a.id===selAlert.id?Object.assign({},a,{lu:true}):a;});});
                setShowEnv(false);
                setSelA(null);
                alert("Notification envoyee! (simulation - Supabase requis pour envoi reel)");
              }} style={{flex:1,background:T.accent,color:"#fff",border:"none",borderRadius:7,padding:"9px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Envoyer maintenant</button>
              <Btn onClick={function(){setShowEnv(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ===== PANEL MODELES =====
function PanelModeles(p){
  var s0=useState(null);var sel=s0[0];var setSel=s0[1];
  var s1=useState(false);var edit=s1[0];var setEdit=s1[1];
  var s2=useState({});var form=s2[0];var setForm=s2[1];
  function sf(k,v){setForm(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  var selM=sel?p.modeles.find(function(m){return m.id===sel;}):null;

  var TYPE_LABEL={
    cotisation_retard:"Cotisation en retard",
    ce_expire:"Chauffe-eau expire",
    ass_expire:"Assurance expiree",
    convocation_ca:"Convocation CA",
    rapport_mensuel:"Rapport mensuel",
    pap_manquant:"PAP manquant"
  };

  return(
    <div style={{display:"flex",gap:14}}>
      <div style={{width:260,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <b style={{fontSize:13,color:T.navy}}>Modeles de messages</b>
        </div>
        {p.modeles.map(function(m){return(
          <div key={m.id} onClick={function(){setSel(m.id);setEdit(false);}} style={{background:sel===m.id?T.accentL:T.surface,border:"1px solid "+(sel===m.id?T.accent:T.border),borderRadius:9,padding:12,marginBottom:7,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text}}>{m.nom}</div>
              <Bdg bg={m.actif?T.accentL:T.alt} c={m.actif?T.accent:T.muted}>{m.actif?"Actif":"Inactif"}</Bdg>
            </div>
            <div style={{fontSize:10,color:T.muted}}>{TYPE_LABEL[m.type]||m.type}</div>
            {m.auto&&<div style={{fontSize:9,color:T.blue,marginTop:3,fontWeight:600}}>Envoi auto: {m.delai}</div>}
          </div>
        );})}
      </div>

      <div style={{flex:1}}>
        {!selM&&<div style={{textAlign:"center",color:T.muted,padding:50,fontSize:13}}>Selectionnez un modele pour voir ou modifier</div>}
        {selM&&!edit&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <b style={{fontSize:14,color:T.navy}}>{selM.nom}</b>
              <div style={{display:"flex",gap:6}}>
                <Btn sm onClick={function(){setForm(Object.assign({},selM));setEdit(true);}}>Modifier</Btn>
                <Btn sm bg={selM.actif?T.red:T.accent} onClick={function(){p.setModeles(function(prev){return prev.map(function(m){return m.id===selM.id?Object.assign({},m,{actif:!m.actif}):m;});});}}>{selM.actif?"Desactiver":"Activer"}</Btn>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <Lbl l="Sujet du courriel"/>
              <div style={{background:T.alt,borderRadius:7,padding:"8px 11px",fontSize:12,color:T.text}}>{selM.sujet}</div>
            </div>
            {selM.auto&&(
              <div style={{marginBottom:10}}>
                <Lbl l="Envoi automatique"/>
                <Bdg bg={T.blueL} c={T.blue}>Declenchement: {selM.delai}</Bdg>
              </div>
            )}
            <div>
              <Lbl l="Corps du message"/>
              <div style={{background:T.alt,borderRadius:7,padding:"11px 13px",fontSize:12,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap",border:"1px solid "+T.border,maxHeight:300,overflowY:"auto"}}>{selM.corps}</div>
            </div>
            <div style={{marginTop:12,background:T.blueL,borderRadius:8,padding:"9px 13px",fontSize:11,color:T.blue}}>
              Variables disponibles: {"{{unite}} {{nom}} {{montant}} {{mois}} {{annee}} {{date}} {{heure}} {{lieu}} {{ordre_du_jour}}"}
            </div>
          </div>
        )}
        {selM&&edit&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
            <div style={{fontSize:14,fontWeight:700,color:T.navy,marginBottom:14}}>Modifier le modele</div>
            <div style={{marginBottom:10}}>
              <Lbl l="Nom du modele"/>
              <input value={form.nom||""} onChange={function(e){sf("nom",e.target.value);}} style={INP}/>
            </div>
            <div style={{marginBottom:10}}>
              <Lbl l="Sujet"/>
              <input value={form.sujet||""} onChange={function(e){sf("sujet",e.target.value);}} style={INP}/>
            </div>
            <div style={{marginBottom:10}}>
              <Lbl l="Corps du message"/>
              <textarea value={form.corps||""} onChange={function(e){sf("corps",e.target.value);}} rows={10} style={Object.assign({},INP,{resize:"vertical"})}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={function(){p.setModeles(function(prev){return prev.map(function(m){return m.id===selM.id?Object.assign({},m,form):m;});});setEdit(false);}}>Sauvegarder</Btn>
              <Btn onClick={function(){setEdit(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== PANEL PARAMETRES =====
function PanelParametres(p){
  var SECTIONS=[
    {
      titre:"Alertes chauffe-eau",
      items:[
        {k:"alerteCE90",l:"Alerte 90 jours avant expiration",desc:"Rappel de planification au CA"},
        {k:"alerteCE30",l:"Alerte 30 jours avant expiration",desc:"Notification au coproprietaire"},
        {k:"alerteCE7",l:"Alerte 7 jours avant expiration",desc:"Notification urgente"},
      ]
    },
    {
      titre:"Alertes assurance",
      items:[
        {k:"alerteAss90",l:"Rappel 90 jours",desc:"Premier rappel au coproprietaire"},
        {k:"alerteAss30",l:"Rappel 30 jours",desc:"Deuxieme rappel urgent"},
      ]
    },
    {
      titre:"Cotisations en retard",
      items:[
        {k:"rappelCot5",l:"Rappel J+5",desc:"Premier rappel automatique"},
        {k:"rappelCot15",l:"Rappel J+15",desc:"Deuxieme rappel"},
        {k:"rappelCot30",l:"Rappel J+30 + escalade CA",desc:"Avis formel avec copie CA"},
      ]
    },
    {
      titre:"Rapports et reunions",
      items:[
        {k:"rapportMensuel",l:"Rapport mensuel automatique",desc:"Envoye le "+p.params.rapportJour+"e jour du mois au CA"},
        {k:"convocationCA",l:"Convocation automatique reunions CA",desc:p.params.convocationDelai+" jours avant la reunion"},
      ]
    },
  ];

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
        <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
          <Lbl l="Parametres generaux"/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Courriel du CA</div>
            <input value={p.params.courrielCA} onChange={function(e){p.setParams(function(o){return Object.assign({},o,{courrielCA:e.target.value});});}} style={INP}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Jour du rapport mensuel</div>
            <input type="number" min="1" max="28" value={p.params.rapportJour} onChange={function(e){p.setParams(function(o){return Object.assign({},o,{rapportJour:parseInt(e.target.value)||5});});}} style={INP}/>
          </div>
          <div>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Moyen d envoi par defaut</div>
            <select value={p.params.moyenDefaut} onChange={function(e){p.setParams(function(o){return Object.assign({},o,{moyenDefaut:e.target.value});});}} style={INP}>
              <option value="courriel">Courriel</option>
              <option value="sms">SMS</option>
              <option value="portail">Portail seulement</option>
            </select>
          </div>
        </div>
        <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:10,padding:16}}>
          <Lbl l="Statut du systeme"/>
          <div style={{fontSize:13,fontWeight:700,color:T.accent,marginBottom:8}}>Systeme actif</div>
          <div style={{fontSize:11,color:T.muted,marginBottom:12,lineHeight:1.6}}>
            Les notifications automatiques sont actives selon vos parametres ci-dessous.
            Les envois reels par courriel et SMS necessitent Supabase + SendGrid (prochaine etape).
          </div>
          <div style={{background:T.amberL,borderRadius:8,padding:"9px 12px",fontSize:11,color:T.amber}}>
            Mode simulation - Les alertes s affichent dans l application mais les envois reels sont desactives jusqu a la connexion Supabase.
          </div>
        </div>
      </div>

      {SECTIONS.map(function(section,si){return(
        <div key={si} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16,marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>{section.titre}</div>
          {section.items.map(function(item){var on=p.params[item.k];return(
            <div key={item.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+T.border}}>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:T.text}}>{item.l}</div>
                <div style={{fontSize:10,color:T.muted,marginTop:2}}>{item.desc}</div>
              </div>
              <button onClick={function(){p.setParams(function(o){var n=Object.assign({},o);n[item.k]=!on;return n;});}} style={{width:44,height:24,borderRadius:12,background:on?T.accent:T.border,border:"none",cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?23:3,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
              </button>
            </div>
          );})}
        </div>
      );})}
    </div>
  );
}

// ===== PANEL HISTORIQUE =====
function PanelHistorique(){
  var TYPE_LABEL={
    cotisation_retard:"Cotisation en retard",
    ce_expire:"Chauffe-eau expire",
    ass_expire:"Assurance expiree",
    convocation_ca:"Convocation CA",
    rapport_mensuel:"Rapport mensuel",
    pap_manquant:"PAP manquant"
  };
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <b style={{fontSize:13,color:T.navy}}>Historique des envois</b>
      </div>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:T.navy}}>
              {["Date","Type","Destinataire","Moyen","Statut"].map(function(h){return <th key={h} style={{padding:"7px 12px",fontSize:9,fontWeight:700,color:"#8da0bb",textAlign:"left"}}>{h}</th>;})}
            </tr>
          </thead>
          <tbody>
            {HISTORIQUE_INIT.map(function(h){return(
              <tr key={h.id} style={{borderBottom:"1px solid "+T.border}}>
                <td style={{padding:"9px 12px",fontSize:12,color:T.muted,whiteSpace:"nowrap"}}>{h.date}</td>
                <td style={{padding:"9px 12px",fontSize:12,color:T.text,fontWeight:500}}>{TYPE_LABEL[h.type]||h.type}</td>
                <td style={{padding:"9px 12px",fontSize:12,color:T.text}}>{h.destinataire}</td>
                <td style={{padding:"9px 12px"}}><Bdg bg={T.blueL} c={T.blue}>{h.moyen}</Bdg></td>
                <td style={{padding:"9px 12px"}}><Bdg bg={T.accentL} c={T.accent}>{h.statut}</Bdg></td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== MODULE PRINCIPAL =====
export default function Notifications(){
  var s0=useState("alertes");var ong=s0[0];var setOng=s0[1];
  var s1=useState(ALERTES_INIT);var alertes=s1[0];var setAlertes=s1[1];
  var s2=useState(MODELES_INIT);var modeles=s2[0];var setModeles=s2[1];
  var s3=useState(PARAMETRES_INIT);var params=s3[0];var setParams=s3[1];

  var nonLues=alertes.filter(function(a){return !a.lu;}).length;
  var critiques=alertes.filter(function(a){return a.prio==="critique"&&!a.lu;}).length;

  var TABS=[
    {id:"alertes",l:"Alertes"+(nonLues>0?" ("+nonLues+")":"")},
    {id:"modeles",l:"Modeles de messages"},
    {id:"historique",l:"Historique"},
    {id:"parametres",l:"Parametres"},
  ];

  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:17,fontWeight:800,color:T.navy}}>Centre de notifications</div>
          <div style={{fontSize:11,color:T.muted}}>Alertes automatiques, rappels et communications</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {critiques>0&&<Bdg bg={T.redL} c={T.red} sz={12}>{critiques} critique(s) non lu(es)</Bdg>}
          <Bdg bg={params.moyenDefaut==="courriel"?T.blueL:T.accentL} c={params.moyenDefaut==="courriel"?T.blue:T.accent}>Envoi par: {params.moyenDefaut}</Bdg>
        </div>
      </div>

      <div style={{display:"flex",gap:3,marginBottom:16,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {TABS.map(function(t){var a=ong===t.id;return(
          <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"7px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t.l}</button>
        );})}
      </div>

      {ong==="alertes"&&<PanelAlertes alertes={alertes} setAlertes={setAlertes}/>}
      {ong==="modeles"&&<PanelModeles modeles={modeles} setModeles={setModeles}/>}
      {ong==="historique"&&<PanelHistorique/>}
      {ong==="parametres"&&<PanelParametres params={params} setParams={setParams}/>}
    </div>
  );
}
