
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var MOIS_FR=["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"];
var JOURS_FR=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
var TYPE_COLORS={reunion:{bg:"#EFF6FF",tc:"#1A56DB",bdr:"#1A56DB"},echeance:{bg:"#FEF3E2",tc:"#B86020",bdr:"#B86020"},paiement:{bg:"#E8F2EC",tc:"#1B5E3B",bdr:"#1B5E3B"},travaux:{bg:"#F3EEFF",tc:"#6B3FA0",bdr:"#6B3FA0"},assurance:{bg:"#FEF3E2",tc:"#B86020",bdr:"#B86020"},autre:{bg:"#F0EDE8",tc:"#7C7568",bdr:"#DDD9CF"}};

function getJoursDuMois(annee,mois){
  var premier=new Date(annee,mois,1);
  var dernier=new Date(annee,mois+1,0);
  var jours=[];
  var debut=premier.getDay();
  for(var i=0;i<debut;i++)jours.push(null);
  for(var j=1;j<=dernier.getDate();j++)jours.push(j);
  while(jours.length%7!==0)jours.push(null);
  return jours;
}

function BadgeEvenement(p){
  var ev=p.ev;
  var c=TYPE_COLORS[ev.type]||TYPE_COLORS.autre;
  return <div style={{background:c.bg,color:c.tc,border:"1px solid "+c.bdr+"44",borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"pointer"}} onClick={function(){p.onClick(ev);}}>{ev.titre}</div>;
}

var VIDE_EV={titre:"",type:"reunion",date:"",heure:"",duree:60,description:"",syndicat_id:"",recurrence:"aucune"};

export default function AgendaCalendrier(){
  var today=new Date();
  var s0=useState(today.getFullYear());var annee=s0[0];var setAnnee=s0[1];
  var s1=useState(today.getMonth());var mois=s1[0];var setMois=s1[1];
  var s2=useState([]);var evenements=s2[0];var setEvenements=s2[1];
  var s3=useState([]);var syndicats=s3[0];var setSyndicats=s3[1];
  var s4=useState(null);var selSyndicat=s4[0];var setSelSyndicat=s4[1];
  var s5=useState(false);var showForm=s5[0];var setShowForm=s5[1];
  var s6=useState(VIDE_EV);var nf=s6[0];var setNf=s6[1];
  var s7=useState(null);var jourSel=s7[0];var setJourSel=s7[1];
  var s8=useState(null);var evDetail=s8[0];var setEvDetail=s8[1];
  var s9=useState(false);var saving=s9[0];var setSaving=s9[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSelSyndicat(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!selSyndicat)return;
    var debut=annee+"-"+String(mois+1).padStart(2,"0")+"-01";
    var finMois=new Date(annee,mois+1,0).getDate();
    var fin=annee+"-"+String(mois+1).padStart(2,"0")+"-"+String(finMois).padStart(2,"0");
    setEvenements([]);
    sb.select("reunions",{eq:{syndicat_id:selSyndicat.id},order:"date_reunion.asc"}).then(function(res){
      if(res&&res.data){
        var evs=res.data.filter(function(r){return r.date_reunion>=debut&&r.date_reunion<=fin;}).map(function(r){return {id:r.id,titre:(r.type||"CA")+" CA",type:"reunion",date:r.date_reunion,heure:r.heure||"19:00",description:r.lieu||"",source:"reunions"};});
        setEvenements(function(prev){return prev.concat(evs);});
      }
    }).catch(function(){});
    sb.select("factures",{eq:{syndicat_id:selSyndicat.id},order:"date_echeance.asc"}).then(function(res){
      if(res&&res.data){
        var evs=res.data.filter(function(f){return f.date_echeance&&f.date_echeance>=debut&&f.date_echeance<=fin&&f.statut!=="payee";}).map(function(f){return {id:"f"+f.id,titre:"Facture: "+f.fournisseur_nom,type:"echeance",date:f.date_echeance,heure:"",description:Number(f.total||0).toFixed(2)+" $",source:"factures"};});
        setEvenements(function(prev){return prev.concat(evs);});
      }
    }).catch(function(){});
    sb.select("carnet_entretien",{eq:{syndicat_id:selSyndicat.id}}).then(function(res){
      if(res&&res.data){
        var evs=res.data.filter(function(c){
          if(!c.annee_remplacement)return false;
          var anneeRempl=c.annee_remplacement||(c.annee_installation?parseInt(c.annee_installation)+parseInt(c.duree_vie_ans||20):null);
          return anneeRempl===annee;
        }).map(function(c){return {id:"c"+c.id,titre:"Remplacement: "+c.composante,type:"travaux",date:annee+"-06-01",heure:"",description:c.cout_remplacement?Number(c.cout_remplacement).toLocaleString("fr-CA")+" $":"",source:"carnet"};});
        setEvenements(function(prev){return prev.concat(evs);});
      }
    }).catch(function(){});
    sb.select("documents",{eq:{syndicat_id:selSyndicat.id,type_doc:"assurance"}}).then(function(res){
      if(res&&res.data){
        var evs=res.data.filter(function(d){return d.date_doc&&d.date_doc>=debut&&d.date_doc<=fin;}).map(function(d){return {id:"ass"+d.id,titre:"Assurance expire: "+d.nom,type:"assurance",date:d.date_doc,heure:"",description:"",source:"assurances"};});
        setEvenements(function(prev){return prev.concat(evs);});
      }
    }).catch(function(){});
  },[selSyndicat,annee,mois]);

  function setN(k,v){setNf(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}

  function sauvegarder(){
    if(!nf.titre||!nf.date||!selSyndicat)return;
    setSaving(true);
    var row={syndicat_id:selSyndicat.id,type:nf.type||"reunion",date_reunion:nf.date,heure:nf.heure||"",lieu:nf.description||"",notes:"",ordre_du_jour:""};
    sb.insert("reunions",row).then(function(res){
      if(res&&res.data){
        setEvenements(function(prev){return prev.concat([{id:res.data.id,titre:nf.titre,type:nf.type,date:nf.date,heure:nf.heure,description:nf.description,source:"reunions"}]);});
      }
      sb.log("agenda","creation","Evenement: "+nf.titre+" le "+nf.date,"",selSyndicat.code||"");
      setShowForm(false);setNf(VIDE_EV);setSaving(false);
    }).catch(function(){setSaving(false);});
  }

  var jours=getJoursDuMois(annee,mois);
  var evMap={};
  evenements.forEach(function(ev){
    if(!ev.date)return;
    var jour=parseInt(ev.date.split("-")[2]);
    var evMois=parseInt(ev.date.split("-")[1])-1;
    if(evMois!==mois)return;
    if(!evMap[jour])evMap[jour]=[];
    evMap[jour].push(ev);
  });

  function navMois(delta){
    var nm=mois+delta;var na=annee;
    if(nm<0){nm=11;na--;}else if(nm>11){nm=0;na++;}
    setMois(nm);setAnnee(na);
  }

  var evJourSel=jourSel?evMap[jourSel]||[]:[];
  var todayStr=today.toISOString().substring(0,10);

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Agenda et calendrier</div>
        {syndicats.length>0&&(
          <select value={selSyndicat?selSyndicat.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSelSyndicat(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{marginLeft:"auto"}}><Btn onClick={function(){setNf(Object.assign({},VIDE_EV,{syndicat_id:selSyndicat?selSyndicat.id:""}));setShowForm(true);}}>+ Ajouter evenement</Btn></div>
      </div>

      <div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){navMois(-1);}}>Precedent</Btn>
            <div style={{fontSize:16,fontWeight:800,color:T.navy}}>{MOIS_FR[mois]} {annee}</div>
            <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){navMois(1);}}>Suivant</Btn>
          </div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
              {JOURS_FR.map(function(j){return <div key={j} style={{padding:"8px 4px",textAlign:"center",fontSize:10,fontWeight:700,color:T.muted,background:T.alt,borderBottom:"1px solid "+T.border}}>{j}</div>;})}
              {jours.map(function(j,i){
                var isToday=j&&annee===today.getFullYear()&&mois===today.getMonth()&&j===today.getDate();
                var isSel=j&&j===jourSel;
                var evs=j?evMap[j]||[]:[];
                return(
                  <div key={i} onClick={function(){if(j){setJourSel(j===jourSel?null:j);setEvDetail(null);}}} style={{minHeight:80,padding:4,borderRight:"1px solid "+T.border,borderBottom:"1px solid "+T.border,background:isSel?T.blueL:isToday?T.accentL:"transparent",cursor:j?"pointer":"default",position:"relative"}}>
                    {j&&<div style={{fontSize:11,fontWeight:isToday||isSel?800:400,color:isToday?T.accent:isSel?T.blue:T.navy,marginBottom:4}}>{j}</div>}
                    {evs.slice(0,3).map(function(ev,ei){return <BadgeEvenement key={ei} ev={ev} onClick={setEvDetail}/>;  })}
                    {evs.length>3&&<div style={{fontSize:9,color:T.muted}}>+{evs.length-3} autres</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          {showForm&&(
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>Nouvel evenement</div>
              <div style={{display:"grid",gap:8}}>
                <div><Lbl l="Titre"/><input value={nf.titre} onChange={function(e){setN("titre",e.target.value);}} style={INP} placeholder="Reunion CA, Echeance..."/></div>
                <div><Lbl l="Type"/><select value={nf.type} onChange={function(e){setN("type",e.target.value);}} style={INP}><option value="reunion">Reunion</option><option value="echeance">Echeance</option><option value="paiement">Paiement</option><option value="travaux">Travaux</option><option value="autre">Autre</option></select></div>
                <div><Lbl l="Date"/><input type="date" value={nf.date} onChange={function(e){setN("date",e.target.value);}} style={INP}/></div>
                <div><Lbl l="Heure"/><input type="time" value={nf.heure} onChange={function(e){setN("heure",e.target.value);}} style={INP}/></div>
                <div><Lbl l="Lieu / Description"/><input value={nf.description} onChange={function(e){setN("description",e.target.value);}} style={INP} placeholder="Salle communautaire..."/></div>
              </div>
              <div style={{display:"flex",gap:6,marginTop:10}}>
                <Btn sm onClick={sauvegarder} dis={saving||!nf.titre||!nf.date}>{saving?"...":"Sauvegarder"}</Btn>
                <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setShowForm(false);}}>Annuler</Btn>
              </div>
            </div>
          )}

          {evDetail&&(
            <div style={{background:T.surface,border:"2px solid "+(TYPE_COLORS[evDetail.type]||TYPE_COLORS.autre).bdr+"44",borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{evDetail.titre}</div>
                <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setEvDetail(null);}}>X</Btn>
              </div>
              <div style={{fontSize:12,color:T.muted,marginBottom:6}}>{evDetail.date}{evDetail.heure?" a "+evDetail.heure:""}</div>
              {evDetail.description&&<div style={{fontSize:12,color:T.navy}}>{evDetail.description}</div>}
            </div>
          )}

          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:10}}>{jourSel?"Jour "+jourSel+" "+MOIS_FR[mois]:"Ce mois - tous les evenements"}</div>
            {(jourSel?evJourSel:evenements.sort(function(a,b){return (a.date||"").localeCompare(b.date||"");})).map(function(ev,i){
              var c=TYPE_COLORS[ev.type]||TYPE_COLORS.autre;
              return(
                <div key={i} onClick={function(){setEvDetail(ev);}} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid "+T.border,cursor:"pointer"}}>
                  <div style={{width:4,borderRadius:2,background:c.bdr,alignSelf:"stretch",flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.navy}}>{ev.titre}</div>
                    <div style={{fontSize:10,color:T.muted}}>{ev.date}{ev.heure?" "+ev.heure:""}</div>
                  </div>
                </div>
              );
            })}
            {(jourSel?evJourSel:evenements).length===0&&<div style={{fontSize:11,color:T.muted,textAlign:"center",padding:16}}>Aucun evenement ce mois</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
