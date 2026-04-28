
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var MOIS_FR=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];

function formatDateFR(dateStr){
  if(!dateStr)return "";
  var d=new Date(dateStr);
  return d.getDate()+" "+MOIS_FR[d.getMonth()]+" "+d.getFullYear();
}

function GenererPV(p){
  var pv=p.pv;
  var win=window.open("","_blank");
  var pointsHtml=pv.points.map(function(pt,i){
    var decisionsHtml=pt.decisions.length>0?"<div style='margin-top:6px'><b>Decision(s):</b><ul>"+pt.decisions.map(function(d){return "<li>"+d+"</li>";}).join("")+"</ul></div>":"";
    var voteHtml=pt.vote?"<div style='margin-top:4px;color:#666;font-size:11px'>Vote: "+pt.vote+"</div>":"";
    return "<div style='margin-bottom:16px;padding:12px;border:1px solid #ddd;border-radius:6px'><div style='font-weight:bold;color:#13233A'>"+(i+1)+". "+pt.titre+"</div><div style='margin-top:6px;font-size:12px;color:#333'>"+pt.notes+"</div>"+voteHtml+decisionsHtml+"</div>";
  }).join("");

  win.document.write("<!DOCTYPE html><html><head><title>Proces-verbal</title><style>body{font-family:Arial,sans-serif;max-width:750px;margin:40px auto;padding:20px;color:#1C1A17;font-size:12px}h1{color:#13233A;font-size:18px;text-align:center;margin-bottom:4px}.centre{text-align:center;color:#555;margin-bottom:24px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f0f0f0;font-size:11px}.section{font-size:14px;font-weight:bold;color:#1B5E3B;margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid #1B5E3B}.sig{margin-top:50px;display:grid;grid-template-columns:1fr 1fr;gap:40px}.sig-bloc{border-top:1px solid #000;padding-top:8px;font-size:11px;color:#555}@media print{body{margin:20px}}</style></head><body>");
  win.document.write("<h1>PROCES-VERBAL</h1>");
  win.document.write("<div class='centre'>"+pv.typereunion+" - "+pv.syndicatNom+"</div>");
  win.document.write("<table><tr><td><b>Date:</b> "+formatDateFR(pv.dateReunion)+"</td><td><b>Heure:</b> "+pv.heure+"</td></tr><tr><td><b>Lieu:</b> "+pv.lieu+"</td><td><b>Type:</b> "+pv.typereunion+"</td></tr></table>");
  win.document.write("<div class='section'>Membres presents</div>");
  win.document.write("<table><thead><tr><th>Nom</th><th>Role</th><th>Present(e)</th></tr></thead><tbody>");
  pv.membres.forEach(function(m){win.document.write("<tr><td>"+m.nom+"</td><td>"+m.role+"</td><td>"+(m.present?"Oui":"Absent(e)")+"</td></tr>");});
  win.document.write("</tbody></table>");
  win.document.write("<div class='section'>Verification du quorum</div>");
  var presents=pv.membres.filter(function(m){return m.present;}).length;
  var quorum=presents>=2?"Quorum atteint ("+presents+" membres presents)":"Quorum non atteint";
  win.document.write("<p>"+quorum+"</p>");
  win.document.write("<div class='section'>Points a l ordre du jour</div>");
  win.document.write(pointsHtml);
  win.document.write("<div class='section'>Prochaine reunion</div>");
  win.document.write("<p>"+pv.prochaineReunion+"</p>");
  win.document.write("<div class='section'>Fermeture</div>");
  win.document.write("<p>Il n y a plus d autre point a discuter. La seance est levee a "+pv.heureFin+".</p>");
  win.document.write("<div class='sig'><div class='sig-bloc'>President(e)<br>&nbsp;<br>___________________________<br>"+pv.president+"</div><div class='sig-bloc'>Secretaire<br>&nbsp;<br>___________________________<br>"+pv.secretaire+"</div></div>");
  win.document.write("</body></html>");
  win.document.close();win.print();
}

var VIDE_POINT={titre:"",notes:"",vote:"",decisions:[""]};

export default function PVReunion(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var membres=s2[0];var setMembres=s2[1];
  var s3=useState([]);var reunions=s3[0];var setReunions=s3[1];
  var s4=useState(null);var reunionSel=s4[0];var setReunionSel=s4[1];
  var s5=useState({dateReunion:"",heure:"19:00",lieu:"",typereunion:"CA",president:"",secretaire:"",heureFin:"20:30",prochaineReunion:"A determiner",points:[Object.assign({},VIDE_POINT,{titre:"Ouverture de la seance",notes:"Le president declare la seance ouverte.",decisions:[]}),Object.assign({},VIDE_POINT,{titre:"Adoption de l ordre du jour",notes:"L ordre du jour est adopte tel que presente.",vote:"Unanimite",decisions:["Adoption de l ordre du jour"]}),Object.assign({},VIDE_POINT,{titre:"Divers",notes:"",decisions:[]}),Object.assign({},VIDE_POINT,{titre:"Fermeture de la seance",notes:"",decisions:[]})]});
  var pv=s5[0];var setPV=s5[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    sb.select("membres_ca",{eq:{syndicat_id:sel.id,actif:true},order:"role_ca.asc"}).then(function(res){
      if(res&&res.data){
        setMembres(res.data.map(function(m){return {id:m.id,nom:(m.prenom||"")+" "+m.nom,role:m.role_ca||"membre",present:true};}));
        var pres=res.data.find(function(m){return m.role_ca==="president";});
        var sec=res.data.find(function(m){return m.role_ca==="secretaire";});
        setPV(function(pr){return Object.assign({},pr,{president:pres?(pres.prenom||"")+" "+pres.nom:"",secretaire:sec?(sec.prenom||"")+" "+sec.nom:"",syndicatNom:sel.nom});});
      }
    }).catch(function(){});
    sb.select("reunions",{eq:{syndicat_id:sel.id},order:"date_reunion.desc",limit:10}).then(function(res){
      if(res&&res.data)setReunions(res.data);
    }).catch(function(){});
  },[sel]);

  function setPVField(k,v){setPV(function(pr){var n=Object.assign({},pr);n[k]=v;return n;});}
  function togglePresent(id){setMembres(function(prev){return prev.map(function(m){return m.id===id?Object.assign({},m,{present:!m.present}):m;});});}

  function addPoint(){setPV(function(pr){return Object.assign({},pr,{points:pr.points.concat([Object.assign({},VIDE_POINT,{decisions:[""]})])});});}
  function removePoint(i){setPV(function(pr){var pts=pr.points.filter(function(_,j){return j!==i;});return Object.assign({},pr,{points:pts});});}
  function setPoint(i,k,v){setPV(function(pr){var pts=pr.points.map(function(p,j){if(j!==i)return p;var n=Object.assign({},p);n[k]=v;return n;});return Object.assign({},pr,{points:pts});});}
  function setDecision(pi,di,v){setPV(function(pr){var pts=pr.points.map(function(p,j){if(j!==pi)return p;var decs=p.decisions.map(function(d,k){return k===di?v:d;});return Object.assign({},p,{decisions:decs});});return Object.assign({},pr,{points:pts});});}
  function addDecision(pi){setPV(function(pr){var pts=pr.points.map(function(p,j){if(j!==pi)return p;return Object.assign({},p,{decisions:p.decisions.concat([""])});});return Object.assign({},pr,{points:pts});});}

  function sauvegarderPV(){
    if(!sel)return;
    var contenu=JSON.stringify(Object.assign({},pv,{membres:membres}));
    sb.insert("documents",{niveau:"syndicat",syndicat_id:sel.id,nom:"PV - "+(pv.typereunion||"CA")+" - "+formatDateFR(pv.dateReunion),type_doc:"pv",description:"Proces-verbal "+pv.typereunion+" du "+formatDateFR(pv.dateReunion),date_doc:pv.dateReunion,url:contenu}).then(function(){
      sb.log("pv","creation","PV sauvegarde: "+pv.typereunion+" du "+formatDateFR(pv.dateReunion),"",sel.code||"");
    }).catch(function(){});
  }

  function chargerReunion(r){
    setPVField("dateReunion",r.date_reunion||"");
    setPVField("heure",r.heure||"19:00");
    setPVField("lieu",r.lieu||"");
    setPVField("typereunion",r.type||"CA");
    if(r.ordre_du_jour){
      var pts=r.ordre_du_jour.split(",").filter(function(x){return x.trim();}).map(function(titre){return Object.assign({},VIDE_POINT,{titre:titre.trim(),decisions:[]});});
      if(pts.length>0)setPVField("points",pts);
    }
    setReunionSel(r.id);
  }

  var pvAvecMembres=Object.assign({},pv,{membres:membres,syndicatNom:sel?sel.nom:""});

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Proces-verbal de reunion</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <Btn sm bg="#ffffff18" bdr="1px solid #ffffff40" onClick={sauvegarderPV}>Sauvegarder</Btn>
          <Btn onClick={function(){GenererPV({pv:pvAvecMembres});}}>Generer PDF</Btn>
        </div>
      </div>

      <div style={{padding:20,display:"grid",gridTemplateColumns:"280px 1fr",gap:20}}>
        <div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>Infos de la reunion</div>
            <div style={{display:"grid",gap:10}}>
              {reunions.length>0&&<div><Lbl l="Charger depuis reunions CA"/>
                <select value={reunionSel||""} onChange={function(e){var r=reunions.find(function(x){return x.id===e.target.value;});if(r)chargerReunion(r);}} style={INP}>
                  <option value="">-- Choisir --</option>
                  {reunions.map(function(r){return <option key={r.id} value={r.id}>{r.type} - {r.date_reunion}</option>;})}
                </select>
              </div>}
              <div><Lbl l="Type"/><select value={pv.typereunion} onChange={function(e){setPVField("typereunion",e.target.value);}} style={INP}><option value="CA">Conseil d administration</option><option value="AGO">Assemblee generale ordinaire</option><option value="AGE">Assemblee generale extraordinaire</option></select></div>
              <div><Lbl l="Date"/><input type="date" value={pv.dateReunion} onChange={function(e){setPVField("dateReunion",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Heure debut"/><input value={pv.heure} onChange={function(e){setPVField("heure",e.target.value);}} style={INP} placeholder="19:00"/></div>
              <div><Lbl l="Heure fin"/><input value={pv.heureFin} onChange={function(e){setPVField("heureFin",e.target.value);}} style={INP} placeholder="20:30"/></div>
              <div><Lbl l="Lieu"/><input value={pv.lieu} onChange={function(e){setPVField("lieu",e.target.value);}} style={INP} placeholder="Salle communautaire..."/></div>
              <div><Lbl l="President(e)"/><input value={pv.president} onChange={function(e){setPVField("president",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Secretaire"/><input value={pv.secretaire} onChange={function(e){setPVField("secretaire",e.target.value);}} style={INP}/></div>
              <div><Lbl l="Prochaine reunion"/><input value={pv.prochaineReunion} onChange={function(e){setPVField("prochaineReunion",e.target.value);}} style={INP} placeholder="A determiner..."/></div>
            </div>
          </div>

          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:12}}>Membres ({membres.length})</div>
            {membres.map(function(m){return(
              <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid "+T.border}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600}}>{m.nom}</div>
                  <div style={{fontSize:10,color:T.muted}}>{m.role}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={function(){togglePresent(m.id);}}>
                  <div style={{width:16,height:16,borderRadius:3,border:"2px solid "+(m.present?T.accent:T.border),background:m.present?T.accent:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{m.present&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>V</span>}</div>
                  <span style={{fontSize:10,color:m.present?T.accent:T.muted}}>{m.present?"Present":"Absent"}</span>
                </div>
              </div>
            );})}
            {membres.length===0&&<div style={{fontSize:11,color:T.muted}}>Ajoutez des membres CA dans le module MC</div>}
          </div>
        </div>

        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy}}>Points a l ordre du jour ({pv.points.length})</div>
            <Btn sm onClick={addPoint}>+ Ajouter point</Btn>
          </div>

          {pv.points.map(function(pt,i){return(
            <div key={i} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:T.navy}}>{i+1}. Point</div>
                {i>0&&<Btn sm bg={T.redL} tc={T.red} bdr={"1px solid "+T.red+"44"} onClick={function(){removePoint(i);}}>Retirer</Btn>}
              </div>
              <div style={{display:"grid",gap:8}}>
                <div><Lbl l="Titre du point"/><input value={pt.titre} onChange={function(e){setPoint(i,"titre",e.target.value);}} style={INP} placeholder="Ex: Adoption du budget 2025-2026"/></div>
                <div><Lbl l="Discussion / Notes"/><textarea value={pt.notes} onChange={function(e){setPoint(i,"notes",e.target.value);}} style={Object.assign({},INP,{minHeight:60,resize:"vertical"})} placeholder="Resume de la discussion..."/></div>
                <div><Lbl l="Resultat du vote (si applicable)"/><select value={pt.vote} onChange={function(e){setPoint(i,"vote",e.target.value);}} style={Object.assign({},INP,{width:220})}><option value="">Pas de vote</option><option value="Unanimite">Unanimite</option><option value="Majorite">Majorite</option><option value="Report">Reporte</option><option value="Rejete">Rejete</option></select></div>
                <div>
                  <Lbl l="Decisions / Resolutions"/>
                  {pt.decisions.map(function(d,j){return(
                    <div key={j} style={{display:"flex",gap:6,marginBottom:6}}>
                      <input value={d} onChange={function(e){setDecision(i,j,e.target.value);}} style={Object.assign({},INP,{flex:1})} placeholder="Ex: Il est resolu d approuver le budget..."/>
                    </div>
                  );})}
                  <button onClick={function(){addDecision(i);}} style={{background:"none",border:"1px dashed "+T.border,borderRadius:6,padding:"4px 12px",fontSize:11,color:T.muted,cursor:"pointer",fontFamily:"inherit"}}>+ Decision</button>
                </div>
              </div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}
