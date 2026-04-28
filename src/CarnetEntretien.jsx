
import sb from "./lib/supabase";
import { useState, useEffect } from "react";

var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",amber:"#B86020",amberL:"#FEF3E2",red:"#B83232",redL:"#FDECEA",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};

function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Btn(p){return <button onClick={p.onClick} disabled={p.dis} style={{background:p.dis?"#ccc":p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 12px":"8px 18px",color:p.tc||"#fff",fontSize:p.sm?11:12,fontWeight:600,cursor:p.dis?"not-allowed":"pointer",fontFamily:"inherit"}}>{p.children}</button>;}

var COMPOSANTES_DEFAUT=[
  {composante:"Toiture",categorie:"Structure",duree_vie_ans:25,cout_remplacement:80000},
  {composante:"Fenetres et portes exterieures",categorie:"Enveloppe",duree_vie_ans:30,cout_remplacement:45000},
  {composante:"Revetement exterieur",categorie:"Enveloppe",duree_vie_ans:30,cout_remplacement:35000},
  {composante:"Fondations et drain",categorie:"Structure",duree_vie_ans:50,cout_remplacement:25000},
  {composante:"Systeme de chauffage central",categorie:"Mecanique",duree_vie_ans:20,cout_remplacement:30000},
  {composante:"Chauffe-eau collectif",categorie:"Mecanique",duree_vie_ans:15,cout_remplacement:8000},
  {composante:"Plomberie commune",categorie:"Mecanique",duree_vie_ans:40,cout_remplacement:20000},
  {composante:"Systeme electrique commun",categorie:"Electrique",duree_vie_ans:40,cout_remplacement:15000},
  {composante:"Ascenseur",categorie:"Mecanique",duree_vie_ans:25,cout_remplacement:60000},
  {composante:"Stationnement interieur",categorie:"Structure",duree_vie_ans:30,cout_remplacement:40000},
  {composante:"Amenagement paysager",categorie:"Exterieur",duree_vie_ans:15,cout_remplacement:12000},
  {composante:"Piscine et equipements",categorie:"Amenites",duree_vie_ans:20,cout_remplacement:35000},
  {composante:"Systeme incendie (gicleurs)",categorie:"Securite",duree_vie_ans:25,cout_remplacement:18000},
  {composante:"Intercom et acces securise",categorie:"Securite",duree_vie_ans:15,cout_remplacement:8000},
  {composante:"Corridors et aires communes",categorie:"Interieur",duree_vie_ans:20,cout_remplacement:25000},
  {composante:"Toits-terrasses",categorie:"Structure",duree_vie_ans:20,cout_remplacement:30000},
];

var ETATS=["excellent","bon","moyen","mauvais","critique"];
var ETAT_COLORS={excellent:{bg:"#D4EDDA",tc:"#155724"},bon:{bg:"#E8F2EC",tc:"#1B5E3B"},moyen:{bg:"#FEF3E2",tc:"#B86020"},mauvais:{bg:"#F8D7DA",tc:"#721C24"},critique:{bg:"#F8D7DA",tc:"#721C24"}};

function EtatBadge(p){var c=ETAT_COLORS[p.e]||ETAT_COLORS.bon;return <span style={{background:c.bg,color:c.tc,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,textTransform:"capitalize"}}>{p.e}</span>;}

function calcAnneesRestantes(comp){
  if(!comp.annee_installation||!comp.duree_vie_ans)return null;
  var anneeRempl=comp.annee_remplacement||(parseInt(comp.annee_installation)+parseInt(comp.duree_vie_ans));
  return anneeRempl-new Date().getFullYear();
}

function calcCotisationAnnuelle(composantes){
  var total=0;
  composantes.forEach(function(c){
    if(!c.cout_remplacement||!c.annee_installation||!c.duree_vie_ans)return;
    var restants=calcAnneesRestantes(c);
    if(restants===null||restants<=0)return;
    total+=Number(c.cout_remplacement)/restants;
  });
  return Math.round(total);
}

function LigneComposante(p){
  var c=p.comp;var edit=p.edit;
  var restants=calcAnneesRestantes(c);
  var anneeRempl=c.annee_remplacement||(c.annee_installation?parseInt(c.annee_installation)+parseInt(c.duree_vie_ans||20):null);
  var urgence=restants!==null&&restants<5;
  var proche=restants!==null&&restants>=5&&restants<10;
  return(
    <tr style={{borderBottom:"1px solid "+T.border,background:urgence?"#FFF5F5":proche?"#FFFDF0":"transparent"}}>
      <td style={{padding:"8px 10px"}}>
        <div style={{fontSize:12,fontWeight:600,color:T.navy}}>{c.composante}</div>
        <div style={{fontSize:10,color:T.muted}}>{c.categorie}</div>
      </td>
      <td style={{padding:"8px 10px",textAlign:"center"}}><EtatBadge e={c.etat||"bon"}/></td>
      <td style={{padding:"8px 10px",textAlign:"center",fontSize:12,color:T.muted}}>{c.annee_installation||"-"}</td>
      <td style={{padding:"8px 10px",textAlign:"center",fontSize:12,color:T.muted}}>{c.duree_vie_ans||"-"}ans</td>
      <td style={{padding:"8px 10px",textAlign:"center",fontSize:12,fontWeight:600,color:urgence?T.red:proche?T.amber:T.navy}}>{anneeRempl||"-"}</td>
      <td style={{padding:"8px 10px",textAlign:"center",fontSize:12,fontWeight:700,color:urgence?T.red:proche?T.amber:T.accent}}>
        {restants===null?"-":restants<=0?"EXPIRE":restants+" ans"}
      </td>
      <td style={{padding:"8px 10px",textAlign:"right",fontSize:12}}>
        {c.cout_remplacement?Number(c.cout_remplacement).toLocaleString("fr-CA")+" $":"-"}
      </td>
      <td style={{padding:"8px 10px"}}>
        <Btn sm onClick={function(){p.onEdit(c);}}>Modifier</Btn>
      </td>
    </tr>
  );
}

var VIDE_NF={composante:"",categorie:"Structure",annee_installation:new Date().getFullYear()-10,duree_vie_ans:25,cout_remplacement:"",etat:"bon",notes:""};

export default function CarnetEntretien(){
  var s0=useState([]);var syndicats=s0[0];var setSyndicats=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState([]);var composantes=s2[0];var setComposantes=s2[1];
  var s3=useState(false);var showForm=s3[0];var setShowForm=s3[1];
  var s4=useState(VIDE_NF);var nf=s4[0];var setNf=s4[1];
  var s5=useState(null);var editId=s5[0];var setEditId=s5[1];
  var s6=useState("liste");var vue=s6[0];var setVue=s6[1];
  var s7=useState(false);var saving=s7[0];var setSaving=s7[1];

  useEffect(function(){
    sb.select("syndicats",{order:"nom.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){setSyndicats(res.data);setSel(res.data[0]);}
    }).catch(function(){});
  },[]);

  useEffect(function(){
    if(!sel)return;
    setComposantes([]);
    sb.select("carnet_entretien",{eq:{syndicat_id:sel.id},order:"categorie.asc"}).then(function(res){
      if(res&&res.data&&res.data.length>0){
        setComposantes(res.data);
      }
    }).catch(function(){});
  },[sel]);

  function setN(k,v){setNf(function(pr){
    if(k==="composante")return Object.assign({},pr,{composante:v});
    if(k==="categorie")return Object.assign({},pr,{categorie:v});
    if(k==="annee_installation")return Object.assign({},pr,{annee_installation:v});
    if(k==="duree_vie_ans")return Object.assign({},pr,{duree_vie_ans:v});
    if(k==="annee_remplacement")return Object.assign({},pr,{annee_remplacement:v});
    if(k==="cout_remplacement")return Object.assign({},pr,{cout_remplacement:v});
    if(k==="etat")return Object.assign({},pr,{etat:v});
    if(k==="notes")return Object.assign({},pr,{notes:v});
    return pr;
  });}

  function sauvegarder(){
    if(!nf.composante||!sel)return;
    setSaving(true);
    var row={syndicat_id:sel.id,composante:nf.composante,categorie:nf.categorie||"Autre",annee_installation:parseInt(nf.annee_installation)||null,duree_vie_ans:parseInt(nf.duree_vie_ans)||null,annee_remplacement:parseInt(nf.annee_remplacement)||null,cout_remplacement:parseFloat(nf.cout_remplacement)||null,etat:nf.etat||"bon",notes:nf.notes||""};
    var op=editId?sb.update("carnet_entretien",editId,row):sb.insert("carnet_entretien",row);
    op.then(function(res){
      if(editId){
        setComposantes(function(prev){return prev.map(function(c){return c.id===editId?Object.assign({},c,row):c;});});
      }else if(res&&res.data){
        setComposantes(function(prev){return prev.concat([res.data]);});
      }
      setShowForm(false);setNf(VIDE_NF);setEditId(null);setSaving(false);
      sb.log("carnet","ajout",(editId?"Modification":"Ajout")+" composante: "+nf.composante,"",sel.code||"");
    }).catch(function(){setSaving(false);});
  }

  function editer(c){
    setNf({composante:c.composante||"",categorie:c.categorie||"Structure",annee_installation:c.annee_installation||"",duree_vie_ans:c.duree_vie_ans||25,annee_remplacement:c.annee_remplacement||"",cout_remplacement:c.cout_remplacement||"",etat:c.etat||"bon",notes:c.notes||""});
    setEditId(c.id);setShowForm(true);
  }

  function initialiserDefaut(){
    if(!sel)return;
    if(!window.confirm("Initialiser le carnet avec "+COMPOSANTES_DEFAUT.length+" composantes types? Les composantes existantes seront conservees."))return;
    var rows=COMPOSANTES_DEFAUT.map(function(c){return Object.assign({},c,{syndicat_id:sel.id,etat:"bon",annee_installation:new Date().getFullYear()-Math.round(c.duree_vie_ans/3),notes:""});});
    Promise.all(rows.map(function(r){return sb.insert("carnet_entretien",r);})).then(function(results){
      var newC=results.filter(function(r){return r&&r.data;}).map(function(r){return r.data;});
      setComposantes(function(prev){return prev.concat(newC);});
    }).catch(function(){});
  }

  function imprimer(){
    var cotisAnn=calcCotisationAnnuelle(composantes);
    var urgentes=composantes.filter(function(c){var r=calcAnneesRestantes(c);return r!==null&&r<5;});
    var win=window.open("","_blank");
    var lignes=composantes.map(function(c){
      var anneeRempl=c.annee_remplacement||(c.annee_installation?parseInt(c.annee_installation)+parseInt(c.duree_vie_ans||20):"-");
      var restants=calcAnneesRestantes(c);
      return "<tr><td>"+c.composante+"</td><td>"+c.categorie+"</td><td>"+(c.etat||"bon")+"</td><td>"+(c.annee_installation||"-")+"</td><td>"+(c.duree_vie_ans||"-")+"</td><td>"+anneeRempl+"</td><td>"+(restants===null?"-":restants<=0?"EXPIRE":restants+" ans")+"</td><td style='text-align:right'>"+(c.cout_remplacement?Number(c.cout_remplacement).toLocaleString("fr-CA")+" $":"-")+"</td></tr>";
    }).join("");
    win.document.write("<html><head><title>Carnet entretien Loi 16</title><style>body{font-family:Arial,sans-serif;margin:20px;font-size:12px}h2{color:#13233A}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ddd;padding:6px 8px}th{background:#f0f0f0;font-size:11px}.total{font-weight:bold;background:#e8f2ec;font-size:13px}.alerte{background:#FFF5F5}.info{background:#f8f9fa;padding:10px;border-radius:6px;margin:10px 0}</style></head><body>");
    win.document.write("<h2>Carnet d entretien - Loi 16</h2>");
    win.document.write("<p><b>Syndicat:</b> "+(sel?sel.nom:"")+" | <b>Date:</b> "+new Date().toLocaleDateString("fr-CA")+"</p>");
    win.document.write("<div class='info'><b>Cotisation annuelle recommandee au fonds de prevoyance:</b> "+cotisAnn.toLocaleString("fr-CA")+" $ | <b>Composantes urgentes (&lt;5 ans):</b> "+urgentes.length+"</div>");
    win.document.write("<table><thead><tr><th>Composante</th><th>Categorie</th><th>Etat</th><th>Installation</th><th>Duree vie</th><th>Remplacement</th><th>Restants</th><th>Cout ($)</th></tr></thead><tbody>"+lignes+"</tbody></table>");
    win.document.write("</body></html>");
    win.document.close();win.print();
  }

  var cotisAnn=calcCotisationAnnuelle(composantes);
  var urgentes=composantes.filter(function(c){var r=calcAnneesRestantes(c);return r!==null&&r<5;});
  var proches=composantes.filter(function(c){var r=calcAnneesRestantes(c);return r!==null&&r>=5&&r<10;});
  var coutTotal=composantes.reduce(function(a,c){return a+Number(c.cout_remplacement||0);},0);

  var categories=composantes.reduce(function(acc,c){var cat=c.categorie||"Autre";if(!acc[cat])acc[cat]=[];acc[cat].push(c);return acc;},{});

  return(
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <div style={{background:T.navy,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>Carnet d entretien - Loi 16</div>
        {syndicats.length>0&&(
          <select value={sel?sel.id:""} onChange={function(e){var s=syndicats.find(function(x){return x.id===e.target.value;});if(s)setSel(s);}} style={{background:"#ffffff18",border:"1px solid #ffffff40",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,fontFamily:"inherit"}}>
            {syndicats.map(function(s){return <option key={s.id} value={s.id} style={{color:"#000"}}>{s.nom}</option>;})}
          </select>
        )}
        <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
          {["liste","resume"].map(function(v){var a=vue===v;return <button key={v} onClick={function(){setVue(v);}} style={{background:a?"#ffffff18":"transparent",border:"none",borderBottom:a?"2px solid #3CAF6E":"2px solid transparent",padding:"6px 14px",color:a?"#fff":"#8da0bb",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:a?700:400,textTransform:"capitalize"}}>{v==="liste"?"Liste":"Resume"}</button>;})}
        </div>
      </div>

      <div style={{padding:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:14}}>
            <div style={{fontSize:11,color:T.muted}}>Composantes</div>
            <div style={{fontSize:26,fontWeight:800,color:T.navy}}>{composantes.length}</div>
          </div>
          <div style={{background:urgentes.length>0?T.redL:T.surface,border:"1px solid "+(urgentes.length>0?T.red+"44":T.border),borderRadius:12,padding:14}}>
            <div style={{fontSize:11,color:T.muted}}>Urgentes &lt;5 ans</div>
            <div style={{fontSize:26,fontWeight:800,color:urgentes.length>0?T.red:T.muted}}>{urgentes.length}</div>
          </div>
          <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:12,padding:14}}>
            <div style={{fontSize:11,color:T.muted}}>Cotisation annuelle recommandee</div>
            <div style={{fontSize:20,fontWeight:800,color:T.accent}}>{cotisAnn.toLocaleString("fr-CA")} $</div>
          </div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:14}}>
            <div style={{fontSize:11,color:T.muted}}>Valeur totale actifs</div>
            <div style={{fontSize:20,fontWeight:800,color:T.navy}}>{coutTotal.toLocaleString("fr-CA")} $</div>
          </div>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <Btn onClick={function(){setNf(VIDE_NF);setEditId(null);setShowForm(true);}}>+ Ajouter composante</Btn>
          {composantes.length===0&&<Btn onClick={initialiserDefaut} bg={T.blue}>Initialiser avec composantes types</Btn>}
          {composantes.length>0&&<Btn onClick={imprimer} bg={T.navy}>Rapport PDF Loi 16</Btn>}
        </div>

        {showForm&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>{editId?"Modifier la composante":"Nouvelle composante"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Nom de la composante"/><input value={nf.composante} onChange={function(e){setN("composante",e.target.value);}} style={INP} placeholder="Ex: Toiture, Chauffe-eau..."/></div>
              <div><Lbl l="Categorie"/><select value={nf.categorie} onChange={function(e){setN("categorie",e.target.value);}} style={INP}>{["Structure","Enveloppe","Mecanique","Electrique","Securite","Interieur","Exterieur","Amenites","Autre"].map(function(c){return <option key={c}>{c}</option>;})}</select></div>
              <div><Lbl l="Etat actuel"/><select value={nf.etat} onChange={function(e){setN("etat",e.target.value);}} style={INP}>{ETATS.map(function(e){return <option key={e} value={e} style={{textTransform:"capitalize"}}>{e.charAt(0).toUpperCase()+e.slice(1)}</option>;})}</select></div>
              <div><Lbl l="Annee d installation"/><input type="number" min="1950" max="2030" value={nf.annee_installation} onChange={function(e){setN("annee_installation",e.target.value);}} style={INP} placeholder="2005"/></div>
              <div><Lbl l="Duree de vie (ans)"/><input type="number" min="5" max="100" value={nf.duree_vie_ans} onChange={function(e){setN("duree_vie_ans",e.target.value);}} style={INP} placeholder="25"/></div>
              <div><Lbl l="Annee remplacement prevue" hint="Laissez vide = calcul automatique"/><input type="number" min="2020" max="2100" value={nf.annee_remplacement} onChange={function(e){setN("annee_remplacement",e.target.value);}} style={INP} placeholder="Calcule auto..."/></div>
              <div><Lbl l="Cout de remplacement ($)"/><input type="number" step="1000" value={nf.cout_remplacement} onChange={function(e){setN("cout_remplacement",e.target.value);}} style={INP} placeholder="50000"/></div>
              <div style={{gridColumn:"1/-1"}}><Lbl l="Notes"/><input value={nf.notes} onChange={function(e){setN("notes",e.target.value);}} style={INP} placeholder="Observations, derniere inspection..."/></div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={sauvegarder} dis={saving||!nf.composante}>{saving?"Sauvegarde...":"Sauvegarder"}</Btn>
              <Btn onClick={function(){setShowForm(false);setEditId(null);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
            </div>
          </div>
        )}

        {vue==="liste"&&(
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,overflow:"hidden"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{background:T.alt}}>
                    {["Composante","Etat","Installation","Duree vie","Remplacement","Restants","Cout ($)","Action"].map(function(h){return <th key={h} style={{padding:"9px 10px",textAlign:h==="Cout ($)"?"right":"left",fontWeight:600,color:T.navy,whiteSpace:"nowrap"}}>{h}</th>;})}
                  </tr>
                </thead>
                <tbody>
                  {composantes.map(function(c){return <LigneComposante key={c.id} comp={c} onEdit={editer}/>;})  }
                  {composantes.length===0&&(
                    <tr><td colSpan={8} style={{padding:30,textAlign:"center",color:T.muted,fontSize:12}}>
                      Aucune composante - cliquez "+ Ajouter" ou "Initialiser avec composantes types"
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {vue==="resume"&&(
          <div>
            {urgentes.length>0&&(
              <div style={{background:T.redL,border:"1px solid "+T.red+"44",borderRadius:12,padding:16,marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:T.red,marginBottom:10}}>Remplacement urgent - moins de 5 ans</div>
                {urgentes.map(function(c){var r=calcAnneesRestantes(c);return(<div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+T.red+"22"}}>
                  <span style={{fontSize:12,fontWeight:600}}>{c.composante}</span>
                  <span style={{fontSize:12,color:T.red,fontWeight:700}}>{r<=0?"EXPIRE":r+" ans"} - {c.cout_remplacement?Number(c.cout_remplacement).toLocaleString("fr-CA")+" $":"-"}</span>
                </div>);})}
              </div>
            )}
            {Object.keys(categories).sort().map(function(cat){
              var comps=categories[cat];
              var coutCat=comps.reduce(function(a,c){return a+Number(c.cout_remplacement||0);},0);
              return(<div key={cat} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:12,padding:16,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.navy}}>{cat}</div>
                  <div style={{fontSize:12,color:T.muted}}>{comps.length} composante(s) - {coutCat.toLocaleString("fr-CA")} $</div>
                </div>
                {comps.map(function(c){
                  var r=calcAnneesRestantes(c);
                  var urgent=r!==null&&r<5;
                  return(<div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid "+T.border}}>
                    <div style={{flex:1}}>
                      <span style={{fontSize:12,fontWeight:600,color:urgent?T.red:T.text}}>{c.composante}</span>
                      {c.notes&&<span style={{fontSize:10,color:T.muted,marginLeft:8}}>{c.notes}</span>}
                    </div>
                    <div style={{display:"flex",gap:12,alignItems:"center",fontSize:11,color:T.muted}}>
                      <span style={{color:urgent?T.red:r!==null&&r<10?T.amber:T.muted,fontWeight:urgent||r<10?700:400}}>{r===null?"-":r<=0?"EXPIRE":r+" ans"}</span>
                      <span style={{color:T.navy,fontWeight:600}}>{c.cout_remplacement?Number(c.cout_remplacement).toLocaleString("fr-CA")+" $":"-"}</span>
                    </div>
                  </div>);
                })}
              </div>);
            })}
            <div style={{background:T.accentL,border:"1px solid "+T.accent+"44",borderRadius:12,padding:16}}>
              <div style={{fontSize:13,fontWeight:700,color:T.accent,marginBottom:8}}>Cotisation recommandee au fonds de prevoyance</div>
              <div style={{fontSize:28,fontWeight:900,color:T.accent}}>{cotisAnn.toLocaleString("fr-CA")} $ / an</div>
              <div style={{fontSize:11,color:T.muted,marginTop:6}}>Calcule sur la base du cout de remplacement divise par les annees restantes pour chaque composante. Conforme aux exigences de la Loi 16.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
