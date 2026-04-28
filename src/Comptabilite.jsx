import { useState } from "react";
var T={bg:"#F5F3EE",surface:"#FFF",alt:"#EDEBE4",border:"#DDD9CF",text:"#1C1A17",muted:"#7C7568",accent:"#1B5E3B",accentL:"#E8F2EC",pop:"#3CAF6E",red:"#B83232",redL:"#FDECEA",amber:"#B86020",amberL:"#FEF3E2",navy:"#13233A",blue:"#1A56DB",blueL:"#EFF6FF",purple:"#6B3FA0",purpleL:"#F3EEFF"};
var INP={width:"100%",border:"1px solid #DDD9CF",borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",background:"#FFF",outline:"none",boxSizing:"border-box"};
var money=function(n){return(n<0?"-":"")+Math.abs(n||0).toLocaleString("fr-CA",{minimumFractionDigits:2,maximumFractionDigits:2})+" $";};
var today=function(){return new Date().toISOString().slice(0,10);};
var TPS=0.05; var TVQ=0.09975;
function Bdg(p){return <span style={{fontSize:p.sz||10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:p.bg||T.accentL,color:p.c||T.accent,whiteSpace:"nowrap",display:"inline-block"}}>{p.children}</span>;}
function Btn(p){return <button onClick={p.onClick} style={{background:p.bg||T.accent,border:p.bdr||"none",borderRadius:7,padding:p.sm?"5px 11px":"8px 16px",color:p.tc||"#fff",fontSize:p.sm?10:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{p.children}</button>;}
function Lbl(p){return <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:5}}>{p.l}</div>;}
function Th(p){return <th style={{padding:"8px 12px",textAlign:p.r?"right":"left",fontSize:10,fontWeight:700,color:p.light?"#8da0bb":T.muted,background:p.dark?T.navy:T.alt,whiteSpace:"nowrap"}}>{p.children}</th>;}
function Td(p){return <td style={{padding:"8px 12px",fontSize:12,color:p.c||T.text,fontWeight:p.bold?700:400,textAlign:p.r?"right":"left",borderBottom:"1px solid "+T.border,whiteSpace:p.wrap?"normal":"nowrap",background:p.bg||"transparent"}}>{p.children}</td>;}
function Modal(p){
  if(!p.show)return null;
  return(
    <div onClick={function(e){if(e.target===e.currentTarget)p.onClose();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:14,padding:24,width:p.w||540,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <b style={{fontSize:15,color:T.text}}>{p.title}</b>
          <button onClick={p.onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:T.muted,lineHeight:1}}>x</button>
        </div>
        {p.children}
      </div>
    </div>
  );
}
function FRow(p){return <div style={p.full?{gridColumn:"1/-1"}:{}}><Lbl l={p.l}/>{p.children}</div>;}
function StatCard(p){return(
  <div style={{background:p.bg||T.accentL,borderRadius:10,padding:"13px 15px",border:"1px solid "+(p.c||T.accent)+"33"}}>
    <div style={{fontSize:9,color:p.c||T.accent,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.07em"}}>{p.l}</div>
    <div style={{fontSize:20,fontWeight:800,color:p.c||T.accent}}>{p.v}</div>
    {p.sub&&<div style={{fontSize:10,color:(p.c||T.accent)+"99",marginTop:2}}>{p.sub}</div>}
  </div>
);}

// ===== PLAN DE COMPTES =====
var COMPTES_PLAN=[
  // ACTIF
  {no:"1010",nom:"Caisse",type:"actif",cat:"Actif a court terme",solde:0},
  {no:"1020",nom:"Banque - Compte operations",type:"actif",cat:"Actif a court terme",solde:0},
  {no:"1100",nom:"Comptes clients - Syndicats",type:"actif",cat:"Actif a court terme",solde:0},
  {no:"1110",nom:"TPS a recevoir",type:"actif",cat:"Actif a court terme",solde:0},
  {no:"1111",nom:"TVQ a recevoir",type:"actif",cat:"Actif a court terme",solde:0},
  {no:"1200",nom:"Fournitures de bureau",type:"actif",cat:"Actif a court terme",solde:0},
  {no:"1500",nom:"Equipement informatique",type:"actif",cat:"Actif a long terme",solde:0},
  {no:"1510",nom:"Amortissement cumule - Equipement",type:"actif",cat:"Actif a long terme",solde:0},
  // PASSIF
  {no:"2010",nom:"Comptes fournisseurs",type:"passif",cat:"Passif a court terme",solde:0},
  {no:"2100",nom:"TPS a remettre",type:"passif",cat:"Passif a court terme",solde:0},
  {no:"2101",nom:"TVQ a remettre",type:"passif",cat:"Passif a court terme",solde:0},
  {no:"2200",nom:"Salaires a payer",type:"passif",cat:"Passif a court terme",solde:0},
  {no:"2210",nom:"DAS a remettre - Federal",type:"passif",cat:"Passif a court terme",solde:0},
  {no:"2211",nom:"DAS a remettre - Provincial",type:"passif",cat:"Passif a court terme",solde:0},
  {no:"2220",nom:"RQAP a remettre",type:"passif",cat:"Passif a court terme",solde:0},
  {no:"2230",nom:"RRQ a remettre",type:"passif",cat:"Passif a court terme",solde:0},
  {no:"2240",nom:"CNESST a remettre",type:"passif",cat:"Passif a court terme",solde:0},
  {no:"3000",nom:"Capital - Jean-Francois Laroche",type:"capitaux",cat:"Capitaux propres",solde:0},
  {no:"3100",nom:"Benefices non repartis",type:"capitaux",cat:"Capitaux propres",solde:0},
  // PRODUITS
  {no:"4010",nom:"Honoraires de gestion - Syndicats",type:"produit",cat:"Produits d exploitation",solde:0},
  {no:"4020",nom:"Services additionnels",type:"produit",cat:"Produits d exploitation",solde:0},
  {no:"4030",nom:"Frais administratifs facturas",type:"produit",cat:"Produits d exploitation",solde:0},
  // CHARGES
  {no:"5010",nom:"Salaires - Gestionnaires",type:"charge",cat:"Charges d exploitation",solde:0},
  {no:"5011",nom:"Salaires - Terrain",type:"charge",cat:"Charges d exploitation",solde:0},
  {no:"5020",nom:"Charges sociales patronales",type:"charge",cat:"Charges d exploitation",solde:0},
  {no:"5030",nom:"Loyer bureau",type:"charge",cat:"Charges d exploitation",solde:0},
  {no:"5040",nom:"Telecommunications",type:"charge",cat:"Charges d exploitation",solde:0},
  {no:"5050",nom:"Logiciels et abonnements",type:"charge",cat:"Charges d exploitation",solde:0},
  {no:"5060",nom:"Fournitures de bureau",type:"charge",cat:"Charges d exploitation",solde:0},
  {no:"5070",nom:"Deplacement et kilometrage",type:"charge",cat:"Charges d exploitation",solde:0},
  {no:"5080",nom:"Formation et developpement",type:"charge",cat:"Charges d exploitation",solde:0},
  {no:"5090",nom:"Assurance entreprise",type:"charge",cat:"Charges d exploitation",solde:0},
  {no:"5100",nom:"Honoraires professionnels",type:"charge",cat:"Charges d exploitation",solde:0},
  {no:"5200",nom:"Amortissement - Equipement",type:"charge",cat:"Charges d exploitation",solde:0},
];

// ===== FACTURES CLIENTS =====
var FACTURES_CLIENTS=[];

// ===== EMPLOYES =====
var EMPLOYES=[];

// ===== PAIES =====
var PAIES_INIT=[];

// ===== JOURNAL =====
var JOURNAL_INIT=[];

// ===== TAB FACTURATION =====
function TabFacturation(){
  var s0=useState(FACTURES_CLIENTS);var factures=s0[0];var setFactures=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({});var nf=s2[0];var setNf=s2[1];
  var s3=useState(null);var sel=s3[0];var setSel=s3[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  var totalHT=factures.filter(function(f){return f.statut!=="brouillon";}).reduce(function(a,f){return a+f.mntHT;},0);
  var totalTPS=factures.filter(function(f){return f.statut!=="brouillon";}).reduce(function(a,f){return a+f.tps;},0);
  var totalTVQ=factures.filter(function(f){return f.statut!=="brouillon";}).reduce(function(a,f){return a+f.tvq;},0);
  var totalTTC=factures.filter(function(f){return f.statut!=="brouillon";}).reduce(function(a,f){return a+f.mntTTC;},0);
  var enAttente=factures.filter(function(f){return f.statut==="envoye";}).reduce(function(a,f){return a+f.mntTTC;},0);
  var paye=factures.filter(function(f){return f.statut==="paye";}).reduce(function(a,f){return a+f.mntTTC;},0);

  var CLIENTS=["Syndicat Piedmont","Syndicat Les Erables","Syndicat Belvedere","Syndicat Mont-Royal"];
  var ST={paye:{c:T.accent,bg:T.accentL,l:"Paye"},envoye:{c:T.amber,bg:T.amberL,l:"Envoye"},brouillon:{c:T.muted,bg:T.alt,l:"Brouillon"}};

  function calcTaxes(ht){
    var tp=Math.round(ht*TPS*100)/100;
    var tv=Math.round(ht*TVQ*100)/100;
    return{tps:tp,tvq:tv,ttc:Math.round((ht+tp+tv)*100)/100};
  }

  function printFacture(f){
    var win=window.open("","_blank");
    if(!win)return;
    win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+f.no+'</title>');
    win.document.write('<style>body{font-family:Arial,sans-serif;margin:40px;color:#1C1A17}');
    win.document.write('.header{display:flex;justify-content:space-between;margin-bottom:30px}');
    win.document.write('.logo{font-size:24px;font-weight:900;color:#1B5E3B}.sub{font-size:12px;color:#7C7568}');
    win.document.write('table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#13233A;color:#fff;padding:8px 12px;text-align:left;font-size:12px}td{padding:8px 12px;border-bottom:1px solid #eee;font-size:12px}');
    win.document.write('.total-row{background:#F5F3EE;font-weight:bold}.ttc{font-size:16px;color:#1B5E3B;font-weight:800}');
    win.document.write('@media print{button{display:none}}</style></head><body>');
    win.document.write('<button onclick="window.print()" style="background:#1B5E3B;color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;margin-bottom:20px">Imprimer</button>');
    win.document.write('<div class="header"><div><div class="logo">Predictek</div><div class="sub">Gestion de copropriete</div><div class="sub">123 rue Principale, Quebec QC G1K 1A1</div><div class="sub">TPS: 123456789 RT0001 | TVQ: 1234567890 TQ0001</div></div>');
    win.document.write('<div style="text-align:right"><div style="font-size:22px;font-weight:800;color:#13233A">FACTURE</div><div style="font-size:16px;color:#1B5E3B;font-weight:700">'+f.no+'</div><div class="sub">Date: '+f.date+'</div><div class="sub">Echeance: '+f.echeance+'</div></div></div>');
    win.document.write('<div style="background:#F5F3EE;padding:12px 16px;border-radius:8px;margin-bottom:20px"><div style="font-weight:700;margin-bottom:4px">Facture a:</div><div style="font-size:14px">'+f.client+'</div></div>');
    win.document.write('<table><thead><tr><th>Description</th><th style="text-align:right">Montant</th></tr></thead><tbody>');
    win.document.write('<tr><td>'+f.desc+'</td><td style="text-align:right">'+money(f.mntHT)+'</td></tr>');
    win.document.write('</tbody></table>');
    win.document.write('<table style="width:300px;margin-left:auto"><tbody>');
    win.document.write('<tr><td>Sous-total</td><td style="text-align:right">'+money(f.mntHT)+'</td></tr>');
    win.document.write('<tr><td>TPS (5%)</td><td style="text-align:right">'+money(f.tps)+'</td></tr>');
    win.document.write('<tr><td>TVQ (9.975%)</td><td style="text-align:right">'+money(f.tvq)+'</td></tr>');
    win.document.write('<tr class="total-row"><td class="ttc">TOTAL</td><td class="ttc" style="text-align:right">'+money(f.mntTTC)+'</td></tr>');
    win.document.write('</tbody></table>');
    win.document.write('<div style="margin-top:30px;font-size:12px;color:#7C7568">Payable dans 30 jours. Merci de votre confiance.</div>');
    win.document.write('</body></html>');
    win.document.close();
  }

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        <StatCard l="Revenus HT (2026)" v={money(totalHT)} c={T.accent} bg={T.accentL}/>
        <StatCard l="TPS per-ue" v={money(totalTPS)} c={T.blue} bg={T.blueL}/>
        <StatCard l="TVQ per-ue" v={money(totalTVQ)} c={T.purple} bg={T.purpleL}/>
        <StatCard l="En attente paiement" v={money(enAttente)} c={T.amber} bg={T.amberL}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <b style={{fontSize:14,color:T.navy}}>Factures clients</b>
        <Btn onClick={function(){setNf({client:CLIENTS[0],date:today(),echeance:"",desc:"",mntHT:""});setShowN(true);}}>+ Nouvelle facture</Btn>
      </div>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["No","Client","Date","Echeance","Description","HT","TPS","TVQ","TTC","Statut","Actions"].map(function(h){return <Th key={h} dark light r={["HT","TPS","TVQ","TTC"].includes(h)}>{h}</Th>;})}</tr></thead>
          <tbody>
            {factures.map(function(f){var st=ST[f.statut]||ST.brouillon;return(
              <tr key={f.id}>
                <Td bold>{f.no}</Td>
                <Td>{f.client}</Td>
                <Td>{f.date}</Td>
                <Td>{f.echeance}</Td>
                <Td wrap>{f.desc}</Td>
                <Td r bold>{money(f.mntHT)}</Td>
                <Td r>{money(f.tps)}</Td>
                <Td r>{money(f.tvq)}</Td>
                <Td r bold c={T.navy}>{money(f.mntTTC)}</Td>
                <Td><Bdg bg={st.bg} c={st.c}>{st.l}</Bdg></Td>
                <Td>
                  <div style={{display:"flex",gap:4}}>
                    <Btn sm bg={T.navy} onClick={function(){printFacture(f);}}>PDF</Btn>
                    {f.statut==="brouillon"&&<Btn sm onClick={function(){setFactures(function(prev){return prev.map(function(x){return x.id===f.id?Object.assign({},x,{statut:"envoye"}):x;});});}}> Envoyer</Btn>}
                    {f.statut==="envoye"&&<Btn sm bg={T.accent} onClick={function(){setFactures(function(prev){return prev.map(function(x){return x.id===f.id?Object.assign({},x,{statut:"paye",datePmt:today()}):x;});});}}> Paye</Btn>}
                  </div>
                </Td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouvelle facture" w={520}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <FRow l="Client" full><select value={nf.client||CLIENTS[0]} onChange={function(e){snf("client",e.target.value);}} style={INP}>{CLIENTS.map(function(c){return <option key={c}>{c}</option>;})}</select></FRow>
          <FRow l="Date"><input type="date" value={nf.date||""} onChange={function(e){snf("date",e.target.value);}} style={INP}/></FRow>
          <FRow l="Echeance"><input type="date" value={nf.echeance||""} onChange={function(e){snf("echeance",e.target.value);}} style={INP}/></FRow>
          <FRow l="Description" full><input value={nf.desc||""} onChange={function(e){snf("desc",e.target.value);}} style={INP}/></FRow>
          <FRow l="Montant HT ($)" full>
            <input type="number" value={nf.mntHT||""} onChange={function(e){var ht=parseFloat(e.target.value)||0;var tx=calcTaxes(ht);snf("mntHT",ht);snf("tps",tx.tps);snf("tvq",tx.tvq);snf("mntTTC",tx.ttc);}} style={INP}/>
          </FRow>
          {nf.mntHT>0&&(
            <div style={{gridColumn:"1/-1",background:T.accentL,borderRadius:8,padding:"10px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span>TPS (5%):</span><b>{money(nf.tps)}</b>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span>TVQ (9.975%):</span><b>{money(nf.tvq)}</b>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:800,color:T.navy,marginTop:6,paddingTop:6,borderTop:"1px solid "+T.border}}>
                <span>TOTAL TTC:</span><b>{money(nf.mntTTC)}</b>
              </div>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){
            var no="FC-2026-00"+(factures.length+1);
            setFactures(function(prev){return prev.concat([Object.assign({},nf,{id:Date.now(),no:no,statut:"brouillon",datePmt:""})]);});
            setShowN(false);
          }}>Creer la facture</Btn>
          <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ===== TAB PAIE =====
function TabPaie(){
  var s0=useState(PAIES_INIT);var paies=s0[0];var setPaies=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState(null);var selEmp=s2[0];var setSelEmp=s2[1];
  var s3=useState({});var sim=s3[0];var setSim=s3[1];

  function calcPaie(brut){
    var impFed=Math.round(brut*0.15*100)/100;
    var impProv=Math.round(brut*0.10*100)/100;
    var rrq=Math.round(brut*0.055*100)/100;
    var rqap=Math.round(brut*0.017*100)/100;
    var ae=Math.round(brut*0.01649*100)/100;
    var net=Math.round((brut-impFed-impProv-rrq-rqap-ae)*100)/100;
    var chargePatronale=Math.round((rrq*1.1+ae*1.4+brut*0.0160)*100)/100;
    return{impFed:impFed,impProv:impProv,rrq:rrq,rqap:rqap,ae:ae,net:net,chargePatronale:chargePatronale};
  }

  var totalBrut=paies.reduce(function(a,p){return a+p.salaireBrut;},0);
  var totalNet=paies.reduce(function(a,p){return a+p.salaireNet;},0);
  var totalRetenues=totalBrut-totalNet;

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        <StatCard l="Salaires bruts (periode)" v={money(totalBrut)} c={T.navy} bg={T.blueL}/>
        <StatCard l="Salaires nets a payer" v={money(totalNet)} c={T.accent} bg={T.accentL}/>
        <StatCard l="Retenues totales" v={money(totalRetenues)} c={T.amber} bg={T.amberL} sub="Imp. + RRQ + RQAP + AE"/>
        <StatCard l="Employes actifs" v={EMPLOYES.filter(function(e){return e.actif;}).length} c={T.purple} bg={T.purpleL}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <b style={{fontSize:14,color:T.navy}}>Registre de paie</b>
            <Btn sm onClick={function(){setSim({employe:EMPLOYES[0].nom,salaireBrut:"",periode:today()});setShowN(true);}}>+ Generer paie</Btn>
          </div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Employe","Periode","Brut","Imp.Fed","Imp.Prov","RRQ","RQAP","AE","Net","Statut"].map(function(h){return <Th key={h} dark light r={["Brut","Imp.Fed","Imp.Prov","RRQ","RQAP","AE","Net"].includes(h)}>{h}</Th>;})}</tr></thead>
              <tbody>
                {paies.map(function(p){return(
                  <tr key={p.id}>
                    <Td bold>{p.employe}</Td>
                    <Td>{p.periode}</Td>
                    <Td r bold>{money(p.salaireBrut)}</Td>
                    <Td r c={T.red}>{money(p.impotFed)}</Td>
                    <Td r c={T.red}>{money(p.impotProv)}</Td>
                    <Td r c={T.amber}>{money(p.rrq)}</Td>
                    <Td r c={T.amber}>{money(p.rqap)}</Td>
                    <Td r c={T.amber}>{money(p.assEmploi)}</Td>
                    <Td r bold c={T.accent}>{money(p.salaireNet)}</Td>
                    <Td><Bdg bg={p.statut==="paye"?T.accentL:T.amberL} c={p.statut==="paye"?T.accent:T.amber}>{p.statut==="paye"?"Paye":"Approuve"}</Bdg></Td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16,marginBottom:14}}>
            <b style={{fontSize:13,color:T.navy,display:"block",marginBottom:12}}>DAS a remettre</b>
            {[
              {l:"Impot federal (employes)",v:paies.reduce(function(a,p){return a+p.impotFed;},0),c:T.red},
              {l:"Impot provincial (employes)",v:paies.reduce(function(a,p){return a+p.impotProv;},0),c:T.red},
              {l:"RRQ (employes + patron)",v:paies.reduce(function(a,p){return a+p.rrq*2.1;},0),c:T.amber},
              {l:"RQAP (employes + patron)",v:paies.reduce(function(a,p){return a+p.rqap*1.4;},0),c:T.amber},
              {l:"Assurance-emploi (x2.212)",v:paies.reduce(function(a,p){return a+p.assEmploi*2.212;},0),c:T.amber},
            ].map(function(item,i){return(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+T.border}}>
                <span style={{fontSize:11,color:T.muted}}>{item.l}</span>
                <span style={{fontSize:12,fontWeight:700,color:item.c}}>{money(item.v)}</span>
              </div>
            );})}
            <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,marginTop:4}}>
              <span style={{fontSize:12,fontWeight:700}}>Total DAS</span>
              <span style={{fontSize:14,fontWeight:800,color:T.navy}}>{money(paies.reduce(function(a,p){return a+p.impotFed+p.impotProv+p.rrq*2.1+p.rqap*1.4+p.assEmploi*2.212;},0))}</span>
            </div>
            <div style={{marginTop:12}}>
              <Btn fw onClick={function(){alert("Formulaire DAS - Remise CRA generee! (PDF)");}} bg={T.navy}>Preparer remise DAS</Btn>
            </div>
          </div>

          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
            <b style={{fontSize:13,color:T.navy,display:"block",marginBottom:12}}>Employes</b>
            {EMPLOYES.map(function(e){return(
              <div key={e.id} style={{padding:"8px 0",borderBottom:"1px solid "+T.border}}>
                <div style={{fontSize:12,fontWeight:600,color:T.text}}>{e.nom}</div>
                <div style={{fontSize:10,color:T.muted}}>{e.poste} | {money(e.salaire)}/an</div>
              </div>
            );})}
          </div>
        </div>
      </div>

      <Modal show={showN} onClose={function(){setShowN(false);}} title="Generer un bulletin de paie" w={500}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <FRow l="Employe" full>
            <select value={sim.employe||""} onChange={function(e){setSelEmp(e.target.value);setSim(function(o){return Object.assign({},o,{employe:e.target.value});});}} style={INP}>
              {EMPLOYES.map(function(e){return <option key={e.id}>{e.nom}</option>;})}
            </select>
          </FRow>
          <FRow l="Salaire brut ($)">
            <input type="number" value={sim.salaireBrut||""} onChange={function(e){
              var brut=parseFloat(e.target.value)||0;
              var calc=calcPaie(brut);
              setSim(function(o){return Object.assign({},o,{salaireBrut:brut},calc);});
            }} style={INP}/>
          </FRow>
          <FRow l="Periode debut"><input type="date" value={sim.periode||""} onChange={function(e){setSim(function(o){return Object.assign({},o,{periode:e.target.value});});}} style={INP}/></FRow>
        </div>
        {sim.salaireBrut>0&&(
          <div style={{background:T.alt,borderRadius:10,padding:14,marginBottom:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {l:"Salaire brut",v:money(sim.salaireBrut),c:T.navy},
                {l:"Net a payer",v:money(sim.net),c:T.accent},
                {l:"Impot federal",v:"-"+money(sim.impFed),c:T.red},
                {l:"Impot provincial",v:"-"+money(sim.impProv),c:T.red},
                {l:"RRQ (employe)",v:"-"+money(sim.rrq),c:T.amber},
                {l:"RQAP",v:"-"+money(sim.rqap),c:T.amber},
                {l:"Ass. emploi",v:"-"+money(sim.ae),c:T.amber},
                {l:"Charge patronale",v:money(sim.chargePatronale),c:T.purple},
              ].map(function(item,i){return(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+T.border}}>
                  <span style={{fontSize:11,color:T.muted}}>{item.l}</span>
                  <span style={{fontSize:12,fontWeight:700,color:item.c}}>{item.v}</span>
                </div>
              );})}
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){
            if(!sim.salaireBrut)return;
            setPaies(function(prev){return prev.concat([{id:Date.now(),employe:sim.employe,periode:sim.periode+"/...",salaireBrut:sim.salaireBrut,impotFed:sim.impFed,impotProv:sim.impProv,rrq:sim.rrq,rqap:sim.rqap,assEmploi:sim.ae,salaireNet:sim.net,statut:"approuve",date:""}]);});
            setShowN(false);
          }}>Approuver la paie</Btn>
          <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ===== TAB JOURNAL =====
function TabJournal(){
  var s0=useState(JOURNAL_INIT);var ecritures=s0[0];var setEcritures=s0[1];
  var s1=useState(false);var showN=s1[0];var setShowN=s1[1];
  var s2=useState({date:today(),desc:"",lignes:[{cpt:"",mnt:"",sens:"debit"},{cpt:"",mnt:"",sens:"credit"}]});
  var nf=s2[0];var setNf=s2[1];

  var totalDebit=ecritures.reduce(function(a,e){return a+e.debit.reduce(function(b,d){return b+d.mnt;},0);},0);
  var totalCredit=ecritures.reduce(function(a,e){return a+e.credit.reduce(function(b,c){return b+c.mnt;},0);},0);

  function getCptNom(no){var c=COMPTES_PLAN.find(function(x){return x.no===no;});return c?no+" - "+c.nom:no;}

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
        <StatCard l="Total debits" v={money(totalDebit)} c={T.navy} bg={T.blueL}/>
        <StatCard l="Total credits" v={money(totalCredit)} c={T.accent} bg={T.accentL}/>
        <StatCard l="Balance" v={money(totalDebit-totalCredit)} c={Math.abs(totalDebit-totalCredit)<0.01?T.accent:T.red} bg={Math.abs(totalDebit-totalCredit)<0.01?T.accentL:T.redL} sub={Math.abs(totalDebit-totalCredit)<0.01?"Equilibree":"Desequilibre!"}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <b style={{fontSize:14,color:T.navy}}>Journal general</b>
        <Btn sm onClick={function(){setShowN(true);}}>+ Ecriture</Btn>
      </div>
      {ecritures.map(function(e){return(
        <div key={e.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:14,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <span style={{fontWeight:700,color:T.navy,fontSize:13,marginRight:12}}>{e.no}</span>
              <span style={{fontSize:12,color:T.text}}>{e.desc}</span>
            </div>
            <span style={{fontSize:11,color:T.muted}}>{e.date}</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:T.alt}}><Th>Compte</Th><Th r>Debit</Th><Th r>Credit</Th></tr></thead>
            <tbody>
              {e.debit.map(function(d,i){return(<tr key={"d"+i}><Td>{getCptNom(d.cpt)}</Td><Td r bold c={T.navy}>{money(d.mnt)}</Td><Td r>-</Td></tr>);})}
              {e.credit.map(function(c,i){return(<tr key={"c"+i}><Td><span style={{paddingLeft:24}}>{getCptNom(c.cpt)}</span></Td><Td r>-</Td><Td r bold c={T.accent}>{money(c.mnt)}</Td></tr>);})}
            </tbody>
          </table>
        </div>
      );})}
      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouvelle ecriture comptable" w={580}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <FRow l="Date"><input type="date" value={nf.date} onChange={function(e){setNf(function(o){return Object.assign({},o,{date:e.target.value});});}} style={INP}/></FRow>
          <FRow l="Description" full><input value={nf.desc} onChange={function(e){setNf(function(o){return Object.assign({},o,{desc:e.target.value});});}} style={INP}/></FRow>
        </div>
        <Lbl l="Lignes d ecriture"/>
        {nf.lignes.map(function(l,i){return(
          <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,marginBottom:8}}>
            <select value={l.cpt} onChange={function(e){setNf(function(o){var ls=[...o.lignes];ls[i]=Object.assign({},ls[i],{cpt:e.target.value});return Object.assign({},o,{lignes:ls});});}} style={INP}>
              <option value="">-- Choisir un compte --</option>
              {COMPTES_PLAN.map(function(c){return <option key={c.no} value={c.no}>{c.no} - {c.nom}</option>;})}
            </select>
            <input type="number" placeholder="Montant" value={l.mnt} onChange={function(e){setNf(function(o){var ls=[...o.lignes];ls[i]=Object.assign({},ls[i],{mnt:parseFloat(e.target.value)||0});return Object.assign({},o,{lignes:ls});});}} style={INP}/>
            <select value={l.sens} onChange={function(e){setNf(function(o){var ls=[...o.lignes];ls[i]=Object.assign({},ls[i],{sens:e.target.value});return Object.assign({},o,{lignes:ls});});}} style={INP}>
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        );})}
        <Btn sm bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border} onClick={function(){setNf(function(o){return Object.assign({},o,{lignes:o.lignes.concat([{cpt:"",mnt:"",sens:"debit"}])});});}}>+ Ajouter ligne</Btn>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <Btn onClick={function(){
            var debits=nf.lignes.filter(function(l){return l.sens==="debit"&&l.cpt&&l.mnt;});
            var credits=nf.lignes.filter(function(l){return l.sens==="credit"&&l.cpt&&l.mnt;});
            var no="JG-"+(ecritures.length+5).toString().padStart(3,"0");
            setEcritures(function(prev){return prev.concat([{id:Date.now(),date:nf.date,no:no,desc:nf.desc,debit:debits.map(function(l){return{cpt:l.cpt,mnt:l.mnt};}),credit:credits.map(function(l){return{cpt:l.cpt,mnt:l.mnt};})}]);});
            setShowN(false);
          }}>Enregistrer</Btn>
          <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ===== TAB ETATS FINANCIERS =====
function TabEtats(){
  var s0=useState("resultats");var ong=s0[0];var setOng=s0[1];

  var produits=COMPTES_PLAN.filter(function(c){return c.type==="produit";});
  var charges=COMPTES_PLAN.filter(function(c){return c.type==="charge";});
  var actifs=COMPTES_PLAN.filter(function(c){return c.type==="actif";});
  var passifs=COMPTES_PLAN.filter(function(c){return c.type==="passif";});
  var capitaux=COMPTES_PLAN.filter(function(c){return c.type==="capitaux";});

  var totalProduits=produits.reduce(function(a,c){return a+c.solde;},0);
  var totalCharges=charges.reduce(function(a,c){return a+c.solde;},0);
  var beneficeNet=totalProduits-totalCharges;

  var totalActif=actifs.reduce(function(a,c){return a+c.solde;},0);
  var totalPassif=passifs.reduce(function(a,c){return a+c.solde;},0);
  var totalCapitaux=capitaux.reduce(function(a,c){return a+c.solde;},0);

  function printEtat(titre,contenu){
    var win=window.open("","_blank");
    if(!win)return;
    win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+titre+'</title>');
    win.document.write('<style>body{font-family:Arial,sans-serif;margin:40px;color:#1C1A17}h2{color:#13233A}table{width:100%;border-collapse:collapse;margin:16px 0}th{background:#13233A;color:#fff;padding:8px 12px;text-align:left;font-size:12px}td{padding:7px 12px;border-bottom:1px solid #eee;font-size:12px}.total{background:#F5F3EE;font-weight:800;font-size:14px}.section{background:#E8F2EC;font-weight:700;font-size:13px;color:#1B5E3B}@media print{button{display:none}}</style></head><body>');
    win.document.write('<button onclick="window.print()" style="background:#1B5E3B;color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;margin-bottom:20px">Imprimer</button>');
    win.document.write('<h2>'+titre+'</h2><div style="color:#7C7568;font-size:12px;margin-bottom:20px">Predictek | Au 30 avril 2026</div>');
    win.document.write(contenu);
    win.document.write('</body></html>');
    win.document.close();
  }

  function Section(p){return(
    <tr style={{background:T.accentL}}>
      <td colSpan={3} style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:T.accent}}>{p.l}</td>
    </tr>
  );}
  function LigneEtat(p){return(
    <tr>
      <td style={{padding:"6px 12px 6px 24px",fontSize:12,color:T.muted}}>{p.no}</td>
      <td style={{padding:"6px 12px",fontSize:12,color:T.text}}>{p.nom}</td>
      <td style={{padding:"6px 12px",fontSize:12,fontWeight:500,textAlign:"right",color:p.c||T.text}}>{money(p.v)}</td>
    </tr>
  );}
  function TotalEtat(p){return(
    <tr style={{background:T.alt,borderTop:"2px solid "+T.border}}>
      <td colSpan={2} style={{padding:"9px 12px",fontSize:13,fontWeight:700,color:T.navy}}>{p.l}</td>
      <td style={{padding:"9px 12px",fontSize:14,fontWeight:800,textAlign:"right",color:p.c||T.navy}}>{money(p.v)}</td>
    </tr>
  );}

  return(
    <div>
      <div style={{display:"flex",gap:3,marginBottom:16,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {[["resultats","Etat des resultats"],["bilan","Bilan"],["balance","Balance de verification"],["tps","Rapport TPS/TVQ"]].map(function(t){var a=ong===t[0];return(
          <button key={t[0]} onClick={function(){setOng(t[0]);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"7px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t[1]}</button>
        );})}
      </div>

      {ong==="resultats"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <b style={{fontSize:14,color:T.navy}}>Etat des resultats - Exercice 2025-2026</b>
            <Btn sm bg={T.navy} onClick={function(){
              var html='<table><thead><tr><th>No</th><th>Compte</th><th style="text-align:right">Montant</th></tr></thead><tbody>';
              html+='<tr class="section"><td colspan="3">PRODUITS</td></tr>';
              produits.forEach(function(c){html+='<tr><td>'+c.no+'</td><td>'+c.nom+'</td><td style="text-align:right">'+money(c.solde)+'</td></tr>';});
              html+='<tr class="total"><td colspan="2">Total produits</td><td style="text-align:right">'+money(totalProduits)+'</td></tr>';
              html+='<tr class="section"><td colspan="3">CHARGES</td></tr>';
              charges.forEach(function(c){html+='<tr><td>'+c.no+'</td><td>'+c.nom+'</td><td style="text-align:right">'+money(c.solde)+'</td></tr>';});
              html+='<tr class="total"><td colspan="2">Total charges</td><td style="text-align:right">'+money(totalCharges)+'</td></tr>';
              html+='<tr class="total"><td colspan="2">BENEFICE NET</td><td style="text-align:right;color:#1B5E3B">'+money(beneficeNet)+'</td></tr>';
              html+='</tbody></table>';
              printEtat("Etat des resultats - Predictek",html);
            }}>Imprimer PDF</Btn>
          </div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr><Th dark light>No</Th><Th dark light>Compte</Th><Th dark light r>Montant</Th></tr></thead>
              <tbody>
                <Section l="PRODUITS D EXPLOITATION"/>
                {produits.map(function(c){return <LigneEtat key={c.no} no={c.no} nom={c.nom} v={c.solde} c={T.accent}/>;}) }
                <TotalEtat l="Total produits" v={totalProduits} c={T.accent}/>
                <Section l="CHARGES D EXPLOITATION"/>
                {charges.map(function(c){return <LigneEtat key={c.no} no={c.no} nom={c.nom} v={c.solde} c={T.red}/>;}) }
                <TotalEtat l="Total charges" v={totalCharges} c={T.red}/>
                <tr style={{background:T.navy}}>
                  <td colSpan={2} style={{padding:"12px",fontSize:15,fontWeight:800,color:"#fff"}}>BENEFICE NET</td>
                  <td style={{padding:"12px",fontSize:16,fontWeight:800,textAlign:"right",color:"#3CAF6E"}}>{money(beneficeNet)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ong==="bilan"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <b style={{fontSize:14,color:T.navy}}>Bilan - Au 30 avril 2026</b>
            <Btn sm bg={T.navy} onClick={function(){alert("Impression PDF bilan - a venir");}}>Imprimer PDF</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
              <div style={{background:T.navy,color:"#fff",padding:"10px 14px",fontWeight:700,fontSize:13}}>ACTIF</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <tbody>
                  <Section l="Actif a court terme"/>
                  {actifs.filter(function(c){return c.cat==="Actif a court terme";}).map(function(c){return <LigneEtat key={c.no} no={c.no} nom={c.nom} v={c.solde}/>;}) }
                  <Section l="Actif a long terme"/>
                  {actifs.filter(function(c){return c.cat==="Actif a long terme";}).map(function(c){return <LigneEtat key={c.no} no={c.no} nom={c.nom} v={c.solde}/>;}) }
                  <TotalEtat l="TOTAL ACTIF" v={totalActif}/>
                </tbody>
              </table>
            </div>
            <div>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden",marginBottom:14}}>
                <div style={{background:T.navy,color:"#fff",padding:"10px 14px",fontWeight:700,fontSize:13}}>PASSIF</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <tbody>
                    <Section l="Passif a court terme"/>
                    {passifs.map(function(c){return <LigneEtat key={c.no} no={c.no} nom={c.nom} v={c.solde}/>;}) }
                    <TotalEtat l="Total passif" v={totalPassif}/>
                  </tbody>
                </table>
              </div>
              <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
                <div style={{background:T.accent,color:"#fff",padding:"10px 14px",fontWeight:700,fontSize:13}}>CAPITAUX PROPRES</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <tbody>
                    {capitaux.map(function(c){return <LigneEtat key={c.no} no={c.no} nom={c.nom} v={c.solde}/>;}) }
                    <LigneEtat no="3200" nom="Benefice net de la periode" v={beneficeNet} c={T.accent}/>
                    <TotalEtat l="Total capitaux propres" v={totalCapitaux+beneficeNet} c={T.accent}/>
                    <TotalEtat l="TOTAL PASSIF + CAPITAUX" v={totalPassif+totalCapitaux+beneficeNet}/>
                  </tbody>
                </table>
              </div>
              {Math.abs(totalActif-(totalPassif+totalCapitaux+beneficeNet))>0.01&&(
                <div style={{background:T.redL,borderRadius:8,padding:"9px 14px",fontSize:11,color:T.red,marginTop:10}}>Bilan desequilibre - Verifier les ecritures</div>
              )}
              {Math.abs(totalActif-(totalPassif+totalCapitaux+beneficeNet))<=0.01&&(
                <div style={{background:T.accentL,borderRadius:8,padding:"9px 14px",fontSize:11,color:T.accent,marginTop:10}}>Bilan equilibre</div>
              )}
            </div>
          </div>
        </div>
      )}

      {ong==="balance"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <b style={{fontSize:14,color:T.navy}}>Balance de verification - 30 avril 2026</b>
            <Btn sm bg={T.navy} onClick={function(){alert("PDF balance de verification - a venir");}}>Imprimer PDF</Btn>
          </div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <Th dark light>No</Th>
                  <Th dark light>Nom du compte</Th>
                  <Th dark light>Type</Th>
                  <Th dark light r>Debit</Th>
                  <Th dark light r>Credit</Th>
                </tr>
              </thead>
              <tbody>
                {COMPTES_PLAN.map(function(c){
                  var isDebit=c.type==="actif"||c.type==="charge";
                  var debit=isDebit&&c.solde>0?c.solde:0;
                  var credit=!isDebit&&c.solde>0?c.solde:isDebit&&c.solde<0?Math.abs(c.solde):0;
                  if(debit===0&&credit===0)return null;
                  return(
                    <tr key={c.no}>
                      <Td>{c.no}</Td>
                      <Td>{c.nom}</Td>
                      <Td><Bdg bg={T.alt} c={T.muted}>{c.type}</Bdg></Td>
                      <Td r bold={debit>0} c={debit>0?T.navy:T.muted}>{debit>0?money(debit):"-"}</Td>
                      <Td r bold={credit>0} c={credit>0?T.accent:T.muted}>{credit>0?money(credit):"-"}</Td>
                    </tr>
                  );
                })}
                <tr style={{background:T.navy}}>
                  <td colSpan={3} style={{padding:"10px 12px",fontSize:13,fontWeight:700,color:"#fff"}}>TOTAUX</td>
                  <td style={{padding:"10px 12px",textAlign:"right",fontSize:14,fontWeight:800,color:"#3CAF6E"}}>{money(COMPTES_PLAN.filter(function(c){return c.type==="actif"||c.type==="charge";}).reduce(function(a,c){return a+(c.solde>0?c.solde:0);},0))}</td>
                  <td style={{padding:"10px 12px",textAlign:"right",fontSize:14,fontWeight:800,color:"#3CAF6E"}}>{money(COMPTES_PLAN.filter(function(c){return c.type!=="actif"&&c.type!=="charge";}).reduce(function(a,c){return a+(c.solde>0?c.solde:0);},0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ong==="tps"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <b style={{fontSize:14,color:T.navy}}>Rapport TPS/TVQ - Periode avril 2026</b>
            <Btn sm bg={T.navy} onClick={function(){alert("Rapport TPS/TVQ PDF - a venir");}}>Imprimer</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
              <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:14}}>TPS - Agence du revenu Canada</div>
              {[
                {l:"TPS percue sur ventes",v:FACTURES_CLIENTS.reduce(function(a,f){return a+f.tps;},0),c:T.accent},
                {l:"TPS payee sur achats (ITCs)",v:910.00,c:T.red},
              ].map(function(item,i){return(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid "+T.border}}>
                  <span style={{fontSize:12,color:T.muted}}>{item.l}</span>
                  <span style={{fontSize:13,fontWeight:700,color:item.c}}>{money(item.v)}</span>
                </div>
              );})}
              <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",marginTop:4}}>
                <span style={{fontSize:13,fontWeight:700}}>TPS nette a remettre</span>
                <span style={{fontSize:15,fontWeight:800,color:T.navy}}>{money(FACTURES_CLIENTS.reduce(function(a,f){return a+f.tps;},0)-910)}</span>
              </div>
            </div>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
              <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:14}}>TVQ - Revenu Quebec</div>
              {[
                {l:"TVQ percue sur ventes",v:FACTURES_CLIENTS.reduce(function(a,f){return a+f.tvq;},0),c:T.accent},
                {l:"TVQ payee sur achats (ITRs)",v:1816.28,c:T.red},
              ].map(function(item,i){return(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid "+T.border}}>
                  <span style={{fontSize:12,color:T.muted}}>{item.l}</span>
                  <span style={{fontSize:13,fontWeight:700,color:item.c}}>{money(item.v)}</span>
                </div>
              );})}
              <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",marginTop:4}}>
                <span style={{fontSize:13,fontWeight:700}}>TVQ nette a remettre</span>
                <span style={{fontSize:15,fontWeight:800,color:T.navy}}>{money(FACTURES_CLIENTS.reduce(function(a,f){return a+f.tvq;},0)-1816.28)}</span>
              </div>
            </div>
          </div>
          <div style={{background:T.amberL,border:"1px solid "+T.amber+"44",borderRadius:10,padding:14,marginTop:14}}>
            <div style={{fontSize:13,fontWeight:700,color:T.amber,marginBottom:6}}>Remises a effectuer</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              {[
                {l:"TPS - ARC",v:money(FACTURES_CLIENTS.reduce(function(a,f){return a+f.tps;},0)-910),date:"2026-05-31"},
                {l:"TVQ - Revenu Quebec",v:money(FACTURES_CLIENTS.reduce(function(a,f){return a+f.tvq;},0)-1816.28),date:"2026-05-31"},
                {l:"DAS - Federal/Provincial",v:money(5000),date:"2026-04-25"},
              ].map(function(item,i){return(
                <div key={i} style={{background:"#fff",borderRadius:8,padding:"10px 14px"}}>
                  <div style={{fontSize:10,color:T.amber,fontWeight:700,marginBottom:4}}>{item.l}</div>
                  <div style={{fontSize:14,fontWeight:800,color:T.navy}}>{item.v}</div>
                  <div style={{fontSize:10,color:T.muted}}>Echeance: {item.date}</div>
                </div>
              );})}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ===== PLAN DE COMPTES PREDICTEK =====
var COMPTES=[
  {no:"1010",nom:"Caisse",type:"actif",cat:"Actif court terme",solde:8450.00},
  {no:"1020",nom:"Banque - Compte operations",type:"actif",cat:"Actif court terme",solde:42380.75},
  {no:"1100",nom:"Comptes clients - Syndicats",type:"actif",cat:"Actif court terme",solde:18200.00},
  {no:"1110",nom:"TPS a recevoir",type:"actif",cat:"Actif court terme",solde:910.00},
  {no:"1111",nom:"TVQ a recevoir",type:"actif",cat:"Actif court terme",solde:1816.28},
  {no:"1200",nom:"Fournitures de bureau",type:"actif",cat:"Actif court terme",solde:340.00},
  {no:"1500",nom:"Equipement informatique",type:"actif",cat:"Actif long terme",solde:12000.00},
  {no:"1510",nom:"Amortissement cumule - Equipement",type:"actif",cat:"Actif long terme",solde:-2400.00},
  {no:"2010",nom:"Comptes fournisseurs",type:"passif",cat:"Passif court terme",solde:3200.00},
  {no:"2100",nom:"TPS a remettre",type:"passif",cat:"Passif court terme",solde:2100.00},
  {no:"2101",nom:"TVQ a remettre",type:"passif",cat:"Passif court terme",solde:4190.25},
  {no:"2200",nom:"Salaires a payer",type:"passif",cat:"Passif court terme",solde:4800.00},
  {no:"2210",nom:"DAS a remettre - Federal",type:"passif",cat:"Passif court terme",solde:1840.00},
  {no:"2211",nom:"DAS a remettre - Provincial",type:"passif",cat:"Passif court terme",solde:1120.00},
  {no:"2220",nom:"RQAP a remettre",type:"passif",cat:"Passif court terme",solde:210.00},
  {no:"2230",nom:"RRQ a remettre",type:"passif",cat:"Passif court terme",solde:680.00},
  {no:"3000",nom:"Capital - Proprietaire",type:"capitaux",cat:"Capitaux propres",solde:25000.00},
  {no:"3100",nom:"Benefices non repartis",type:"capitaux",cat:"Capitaux propres",solde:38157.78},
  {no:"4010",nom:"Honoraires de gestion - Syndicats",type:"produit",cat:"Produits",solde:86400.00},
  {no:"4020",nom:"Services additionnels",type:"produit",cat:"Produits",solde:8200.00},
  {no:"4030",nom:"Frais administratifs",type:"produit",cat:"Produits",solde:2400.00},
  {no:"5010",nom:"Salaires - Gestionnaires",type:"charge",cat:"Charges",solde:48000.00},
  {no:"5011",nom:"Salaires - Terrain",type:"charge",cat:"Charges",solde:22000.00},
  {no:"5020",nom:"Charges sociales patronales",type:"charge",cat:"Charges",solde:10800.00},
  {no:"5030",nom:"Loyer bureau",type:"charge",cat:"Charges",solde:7200.00},
  {no:"5040",nom:"Telecommunications",type:"charge",cat:"Charges",solde:1800.00},
  {no:"5050",nom:"Logiciels et abonnements",type:"charge",cat:"Charges",solde:3600.00},
  {no:"5060",nom:"Fournitures de bureau",type:"charge",cat:"Charges",solde:840.00},
  {no:"5070",nom:"Deplacement et kilometrage",type:"charge",cat:"Charges",solde:2400.00},
  {no:"5080",nom:"Formation et developpement",type:"charge",cat:"Charges",solde:1200.00},
  {no:"5090",nom:"Assurance entreprise",type:"charge",cat:"Charges",solde:2400.00},
  {no:"5100",nom:"Honoraires professionnels",type:"charge",cat:"Charges",solde:3600.00},
  {no:"5200",nom:"Amortissement - Equipement",type:"charge",cat:"Charges",solde:2400.00},
];

var ECRITURES_INIT=[];

// ===== TAB SOLDES OUVERTURE =====
function TabSoldesOuverture(){
  var s0=useState(COMPTES.map(function(c){return Object.assign({},c,{soldeOuv:c.solde});}));var comptes=s0[0];var setComptes=s0[1];
  var s1=useState("");var filterType=s1[0];var setFilterType=s1[1];
  var s2=useState("");var savedMsg=s2[0];var setSavedMsg=s2[1];

  function upd(no,val){setComptes(function(prev){return prev.map(function(c){return c.no===no?Object.assign({},c,{soldeOuv:parseFloat(val)||0}):c;});});}

  var totalActif=comptes.filter(function(c){return c.type==="actif";}).reduce(function(a,c){return a+c.soldeOuv;},0);
  var totalPassif=comptes.filter(function(c){return c.type==="passif";}).reduce(function(a,c){return a+c.soldeOuv;},0);
  var totalCapitaux=comptes.filter(function(c){return c.type==="capitaux";}).reduce(function(a,c){return a+c.soldeOuv;},0);
  var balance=totalActif-(totalPassif+totalCapitaux);
  var balanced=Math.abs(balance)<0.01;

  var liste=filterType?comptes.filter(function(c){return c.type===filterType;}):comptes;
  var groups={};
  liste.forEach(function(c){if(!groups[c.cat])groups[c.cat]=[];groups[c.cat].push(c);});

  function sauvegarder(){
    try{localStorage.setItem("predictek_soldes_ouv",JSON.stringify(comptes));}catch(e){}
    setSavedMsg("Soldes sauvegardes!");
    setTimeout(function(){setSavedMsg("");},3000);
  }

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        <StatCard l="Total actif" v={money(totalActif)} c={T.accent} bg={T.accentL}/>
        <StatCard l="Total passif" v={money(totalPassif)} c={T.red} bg={T.redL}/>
        <StatCard l="Capitaux propres" v={money(totalCapitaux)} c={T.purple} bg={T.purpleL}/>
        <StatCard l="Balance" v={money(balance)} c={balanced?T.accent:T.red} bg={balanced?T.accentL:T.redL} sub={balanced?"Equilibree":"Desequilibre!"}/>
      </div>
      {!balanced&&<div style={{background:T.redL,borderRadius:8,padding:"9px 14px",fontSize:12,color:T.red,marginBottom:14}}>Bilan desequilibre de {money(Math.abs(balance))} - Verifiez vos soldes d ouverture.</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",gap:6}}>
          {[["","Tous"],["actif","Actif"],["passif","Passif"],["capitaux","Capitaux"],["produit","Produits"],["charge","Charges"]].map(function(f){var a=filterType===f[0];return(
            <button key={f[0]} onClick={function(){setFilterType(f[0]);}} style={{background:a?T.navy:"#fff",border:"1px solid "+(a?T.navy:T.border),borderRadius:20,padding:"4px 12px",color:a?"#fff":T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{f[1]}</button>
          );})}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {savedMsg&&<Bdg bg={T.accentL} c={T.accent}>{savedMsg}</Bdg>}
          <Btn sm onClick={sauvegarder}>Sauvegarder</Btn>
        </div>
      </div>
      {Object.keys(groups).map(function(cat){return(
        <div key={cat} style={{marginBottom:16}}>
          <div style={{background:T.navy,color:"#fff",padding:"8px 14px",fontSize:11,fontWeight:700,borderRadius:"8px 8px 0 0"}}>{cat}</div>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr><Th dark light>No</Th><Th dark light>Nom du compte</Th><Th dark light r>Solde d ouverture ($)</Th></tr></thead>
              <tbody>
                {groups[cat].map(function(c){return(
                  <tr key={c.no}>
                    <Td c={T.muted}>{c.no}</Td>
                    <Td>{c.nom}</Td>
                    <td style={{padding:"6px 12px",textAlign:"right"}}>
                      <input type="number" value={c.soldeOuv} onChange={function(e){upd(c.no,e.target.value);}} style={{width:140,border:"1px solid "+T.border,borderRadius:6,padding:"4px 8px",fontSize:12,fontFamily:"inherit",textAlign:"right",outline:"none"}} step="0.01"/>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      );})}
    </div>
  );
}

// ===== TAB GRAND LIVRE =====
function TabGrandLivre(){
  var s0=useState(COMPTES[1].no);var selCpt=s0[0];var setSelCpt=s0[1];
  var s1=useState("2026-01-01");var dateDebut=s1[0];var setDateDebut=s1[1];
  var s2=useState("2026-12-31");var dateFin=s2[0];var setDateFin=s2[1];

  var cpt=COMPTES.find(function(c){return c.no===selCpt;})||COMPTES[0];
  var isDebitNormal=cpt.type==="actif"||cpt.type==="charge";

  // Build ledger entries from journal
  var lignes=[];
  var solde=cpt.soldeOuv||cpt.solde||0;
  var soldeInit=solde;

  ECRITURES_INIT.forEach(function(e){
    if(e.date<dateDebut||e.date>dateFin)return;
    e.debit.forEach(function(d){
      if(d.cpt===selCpt){
        var delta=isDebitNormal?d.mnt:-d.mnt;
        solde+=delta;
        lignes.push({date:e.date,no:e.no,desc:e.desc,debit:d.mnt,credit:0,solde:solde});
      }
    });
    e.credit.forEach(function(c){
      if(c.cpt===selCpt){
        var delta=isDebitNormal?-c.mnt:c.mnt;
        solde+=delta;
        lignes.push({date:e.date,no:e.no,desc:e.desc,debit:0,credit:c.mnt,solde:solde});
      }
    });
  });

  lignes.sort(function(a,b){return a.date>b.date?1:-1;});

  var totalDebit=lignes.reduce(function(a,l){return a+l.debit;},0);
  var totalCredit=lignes.reduce(function(a,l){return a+l.credit;},0);

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:12,marginBottom:18,alignItems:"end"}}>
        <div>
          <Lbl l="Compte"/>
          <select value={selCpt} onChange={function(e){setSelCpt(e.target.value);}} style={INP}>
            {COMPTES.map(function(c){return <option key={c.no} value={c.no}>{c.no} - {c.nom}</option>;})}
          </select>
        </div>
        <div><Lbl l="Du"/><input type="date" value={dateDebut} onChange={function(e){setDateDebut(e.target.value);}} style={INP}/></div>
        <div><Lbl l="Au"/><input type="date" value={dateFin} onChange={function(e){setDateFin(e.target.value);}} style={INP}/></div>
      </div>
      <div style={{background:T.navy,color:"#fff",padding:"12px 16px",borderRadius:"10px 10px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <span style={{fontSize:16,fontWeight:800}}>{cpt.no} - {cpt.nom}</span>
          <Bdg bg={"#ffffff20"} c={"#fff"} sz={10} style={{marginLeft:8}}>{cpt.type}</Bdg>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:"#8da0bb"}}>Solde a la cloture</div>
          <div style={{fontSize:18,fontWeight:800,color:"#3CAF6E"}}>{money(solde)}</div>
        </div>
      </div>
      <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <Th dark light>Date</Th>
              <Th dark light>Ref.</Th>
              <Th dark light>Description</Th>
              <Th dark light r>Debit</Th>
              <Th dark light r>Credit</Th>
              <Th dark light r>Solde</Th>
            </tr>
          </thead>
          <tbody>
            <tr style={{background:T.alt}}>
              <Td c={T.muted}>-</Td>
              <Td c={T.muted}>-</Td>
              <Td bold>Solde d ouverture</Td>
              <Td r>-</Td>
              <Td r>-</Td>
              <Td r bold c={T.navy}>{money(soldeInit)}</Td>
            </tr>
            {lignes.map(function(l,i){return(
              <tr key={i}>
                <Td c={T.muted}>{l.date}</Td>
                <Td c={T.accent}>{l.no}</Td>
                <Td>{l.desc}</Td>
                <Td r c={l.debit>0?T.navy:T.muted}>{l.debit>0?money(l.debit):"-"}</Td>
                <Td r c={l.credit>0?T.red:T.muted}>{l.credit>0?money(l.credit):"-"}</Td>
                <Td r bold c={l.solde>=0?T.navy:T.red}>{money(l.solde)}</Td>
              </tr>
            );})}
            <tr style={{background:T.alt,borderTop:"2px solid "+T.border}}>
              <td colSpan={3} style={{padding:"9px 12px",fontSize:12,fontWeight:700,color:T.navy}}>TOTAUX</td>
              <Td r bold c={T.navy}>{money(totalDebit)}</Td>
              <Td r bold c={T.red}>{money(totalCredit)}</Td>
              <Td r bold c={solde>=0?T.accent:T.red}>{money(solde)}</Td>
            </tr>
          </tbody>
        </table>
        {lignes.length===0&&(
          <div style={{textAlign:"center",padding:40,color:T.muted,fontSize:13}}>Aucune ecriture pour ce compte dans la periode selectionnee.</div>
        )}
      </div>
    </div>
  );
}

// ===== TAB BUDGET PREDICTEK =====
function TabBudget(){
  var MOIS=["Jan","Fev","Mar","Avr","Mai","Jun","Jul","Aou","Sep","Oct","Nov","Dec"];
  var s0=useState({});
  var budget=s0[0];var setBudget=s0[1];
  var s1=useState("produits");var section=s1[0];var setSection=s1[1];

  var PRODUITS=["Honoraires de gestion","Services additionnels"];
  var CHARGES=["Salaires gestionnaires","Salaires terrain","Charges sociales","Loyer bureau","Telecommunications","Logiciels et abonnements","Assurance entreprise","Honoraires professionnels"];

  var REEL_ANNUEL={
    "Honoraires de gestion":0,"Services additionnels":0,
    "Salaires gestionnaires":0,"Salaires terrain":0,"Charges sociales":0,
    "Loyer bureau":0,"Telecommunications":0,"Logiciels et abonnements":0,
    "Assurance entreprise":0,"Honoraires professionnels":0,
  };

  function ligneTotal(k){return budget[k]?budget[k].reduce(function(a,v){return a+v;},0):0;}
  function totalSection(keys){return keys.reduce(function(a,k){return a+ligneTotal(k);},0);}

  var totalProdBudget=totalSection(PRODUITS);
  var totalChargBudget=totalSection(CHARGES);
  var beneficeBudget=totalProdBudget-totalChargBudget;
  var totalProdReel=PRODUITS.reduce(function(a,k){return a+(REEL_ANNUEL[k]||0);},0);
  var totalChargReel=CHARGES.reduce(function(a,k){return a+(REEL_ANNUEL[k]||0);},0);
  var beneficeReel=totalProdReel-totalChargReel;

  function upd(k,i,val){setBudget(function(prev){var n=Object.assign({},prev);n[k]=n[k].slice();n[k][i]=parseFloat(val)||0;return n;});}

  function BudgetTable(p){
    return(
      <div style={{marginBottom:20}}>
        <div style={{background:p.color,color:"#fff",padding:"9px 14px",fontSize:12,fontWeight:700,borderRadius:"8px 8px 0 0"}}>{p.title}</div>
        <div style={{overflowX:"auto",border:"1px solid "+T.border,borderRadius:"0 0 8px 8px"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
            <thead>
              <tr style={{background:T.alt}}>
                <Th>Poste</Th>
                {MOIS.map(function(m){return <Th key={m} r>{m}</Th>;})}
                <Th r>Total budget</Th>
                <Th r>Reel YTD</Th>
                <Th r>Ecart</Th>
              </tr>
            </thead>
            <tbody>
              {p.keys.map(function(k){
                var total=ligneTotal(k);
                var reel=REEL_ANNUEL[k]||0;
                var ecart=reel-total;
                return(
                  <tr key={k}>
                    <Td bold>{k}</Td>
                    {(budget[k]||[]).map(function(val,i){return(
                      <td key={i} style={{padding:"4px 6px",textAlign:"right",borderBottom:"1px solid "+T.border}}>
                        <input type="number" value={val} onChange={function(e){upd(k,i,e.target.value);}} style={{width:68,border:"1px solid "+T.border,borderRadius:5,padding:"3px 5px",fontSize:11,fontFamily:"inherit",textAlign:"right",outline:"none"}}/>
                      </td>
                    );})}
                    <Td r bold c={T.navy}>{money(total)}</Td>
                    <Td r c={T.accent}>{money(reel)}</Td>
                    <Td r bold c={ecart>=0?T.accent:T.red}>{money(ecart)}</Td>
                  </tr>
                );
              })}
              <tr style={{background:T.alt,borderTop:"2px solid "+T.border}}>
                <td style={{padding:"9px 12px",fontSize:12,fontWeight:700,color:p.color}}>TOTAL</td>
                {MOIS.map(function(m,i){var sum=p.keys.reduce(function(a,k){return a+(budget[k]?budget[k][i]:0);},0);return <td key={i} style={{padding:"9px 6px",textAlign:"right",fontSize:12,fontWeight:700,color:p.color}}>{money(sum)}</td>;})}
                <Td r bold c={p.color}>{money(totalSection(p.keys))}</Td>
                <Td r bold c={p.color}>{money(p.keys.reduce(function(a,k){return a+(REEL_ANNUEL[k]||0);},0))}</Td>
                <td style={{padding:"9px 12px"}}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
        <StatCard l="Revenus budgetes" v={money(totalProdBudget)} c={T.accent} bg={T.accentL}/>
        <StatCard l="Charges budgetees" v={money(totalChargBudget)} c={T.red} bg={T.redL}/>
        <StatCard l="Benefice projete" v={money(beneficeBudget)} c={beneficeBudget>=0?T.accent:T.red} bg={beneficeBudget>=0?T.accentL:T.redL} sub={"Reel: "+money(beneficeReel)}/>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:16,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {[["produits","Produits"],["charges","Charges"]].map(function(t){var a=section===t[0];return(
          <button key={t[0]} onClick={function(){setSection(t[0]);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"7px 14px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400}}>{t[1]}</button>
        );})}
      </div>
      {section==="produits"&&<BudgetTable title="PRODUITS D EXPLOITATION" color={T.accent} keys={PRODUITS}/>}
      {section==="charges"&&<BudgetTable title="CHARGES D EXPLOITATION" color={T.red} keys={CHARGES}/>}
    </div>
  );
}

// ===== TAB EMPLOYES =====
function TabEmployes(){
  var EMPLOYES_INIT=[];
  var s0=useState(EMPLOYES_INIT);var employes=s0[0];var setEmployes=s0[1];
  var s1=useState(null);var sel=s1[0];var setSel=s1[1];
  var s2=useState(false);var showN=s2[0];var setShowN=s2[1];
  var s3=useState({});var nf=s3[0];var setNf=s3[1];
  function snf(k,v){setNf(function(o){var n=Object.assign({},o);n[k]=v;return n;});}

  var actifs=employes.filter(function(e){return e.actif;});
  var totalMasseSal=actifs.reduce(function(a,e){return a+e.salaire;},0);

  var selE=sel?employes.find(function(e){return e.id===sel;}):null;

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        <StatCard l="Employes actifs" v={actifs.length} c={T.navy} bg={T.blueL}/>
        <StatCard l="Masse salariale" v={money(totalMasseSal)} c={T.accent} bg={T.accentL} sub="annuelle"/>
        <StatCard l="Masse salariale" v={money(totalMasseSal/26)} c={T.purple} bg={T.purpleL} sub="par periode (26)"/>
        <StatCard l="Charges patronales" v={money(totalMasseSal*0.15)} c={T.amber} bg={T.amberL} sub="estimees ~15%"/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <b style={{fontSize:14,color:T.navy}}>Registre des employes</b>
        <Btn sm onClick={function(){setNf({nom:"",prenom:"",poste:"",dept:"Operations",type:"TP",salaire:"",dateEmbauche:today(),tel:"",courriel:"",naiss:"",nas:"",adresse:"",federal:"M",provincial:"M",rrq:true,rqap:true,vacances:3,actif:true,notes:""});setShowN(true);}}>+ Nouvel employe</Btn>
      </div>
      <div style={{display:"flex",gap:14}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr><Th dark light>Employe</Th><Th dark light>Poste</Th><Th dark light>Dept</Th><Th dark light r>Salaire annuel</Th><Th dark light>Embauche</Th><Th dark light>Vacances</Th><Th dark light>Statut</Th></tr></thead>
              <tbody>
                {employes.map(function(e){return(
                  <tr key={e.id} onClick={function(){setSel(e.id);}} style={{borderBottom:"1px solid "+T.border,background:sel===e.id?T.accentL:e.actif?T.surface:T.alt,cursor:"pointer"}}>
                    <Td bold>{e.prenom} {e.nom}</Td>
                    <Td c={T.muted}>{e.poste}</Td>
                    <Td><Bdg bg={T.blueL} c={T.blue}>{e.dept}</Bdg></Td>
                    <Td r bold>{money(e.salaire)}</Td>
                    <Td c={T.muted}>{e.dateEmbauche}</Td>
                    <Td>{e.vacances} sem.</Td>
                    <Td><Bdg bg={e.actif?T.accentL:T.redL} c={e.actif?T.accent:T.red}>{e.actif?"Actif":"Inactif"}</Bdg></Td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>

        {selE&&(
          <div style={{width:320,flexShrink:0}}>
            <div style={{background:T.surface,border:"1px solid "+T.border,borderRadius:10,padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:T.navy}}>{selE.prenom} {selE.nom}</div>
                  <div style={{fontSize:12,color:T.muted}}>{selE.poste}</div>
                </div>
                <button onClick={function(){setSel(null);}} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:18,lineHeight:1}}>x</button>
              </div>
              <div style={{display:"grid",gap:0}}>
                {[
                  {l:"Departement",v:selE.dept},
                  {l:"Type",v:selE.type==="TP"?"Temps plein":"Temps partiel"},
                  {l:"Salaire annuel",v:money(selE.salaire)},
                  {l:"Salaire bimensuel",v:money(Math.round(selE.salaire/26*100)/100)},
                  {l:"Date d embauche",v:selE.dateEmbauche},
                  {l:"Semaines vacances",v:selE.vacances+" semaines"},
                  {l:"Telephone",v:selE.tel||"-"},
                  {l:"Courriel",v:selE.courriel||"-"},
                  {l:"Date de naissance",v:selE.naiss||"-"},
                  {l:"Adresse",v:selE.adresse||"-"},
                  {l:"Code federal",v:selE.federal},
                  {l:"Code provincial",v:selE.provincial},
                  {l:"RRQ",v:selE.rrq?"Cotisant":"Exempte"},
                  {l:"RQAP",v:selE.rqap?"Cotisant":"Exempte"},
                ].map(function(item,i){return(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"7px 0",borderBottom:"1px solid "+T.border}}>
                    <span style={{fontSize:10,color:T.muted,flexShrink:0,marginRight:8}}>{item.l}</span>
                    <span style={{fontSize:11,fontWeight:500,color:T.text,textAlign:"right",wordBreak:"break-word"}}>{item.v}</span>
                  </div>
                );})}
              </div>
              {selE.notes&&<div style={{marginTop:10,background:T.alt,borderRadius:7,padding:"8px 10px",fontSize:11,color:T.muted}}>{selE.notes}</div>}
              <div style={{marginTop:12,display:"flex",gap:6}}>
                <Btn sm fw bg={selE.actif?T.redL:T.accentL} tc={selE.actif?T.red:T.accent} bdr={"1px solid "+(selE.actif?T.red:T.accent)} onClick={function(){setEmployes(function(prev){return prev.map(function(e){return e.id===selE.id?Object.assign({},e,{actif:!e.actif}):e;});});}}>
                  {selE.actif?"Desactiver":"Reactiver"}
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal show={showN} onClose={function(){setShowN(false);}} title="Nouvel employe" w={580}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><Lbl l="Prenom"/><input value={nf.prenom||""} onChange={function(e){snf("prenom",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Nom"/><input value={nf.nom||""} onChange={function(e){snf("nom",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Poste"/><input value={nf.poste||""} onChange={function(e){snf("poste",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Departement"/>
            <select value={nf.dept||"Operations"} onChange={function(e){snf("dept",e.target.value);}} style={INP}>
              {["Administration","Operations","Terrain","Comptabilite","Direction"].map(function(d){return <option key={d}>{d}</option>;})}
            </select>
          </div>
          <div><Lbl l="Salaire annuel ($)"/><input type="number" value={nf.salaire||""} onChange={function(e){snf("salaire",parseFloat(e.target.value)||0);}} style={INP}/></div>
          <div><Lbl l="Date d embauche"/><input type="date" value={nf.dateEmbauche||""} onChange={function(e){snf("dateEmbauche",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Telephone"/><input value={nf.tel||""} onChange={function(e){snf("tel",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Courriel"/><input value={nf.courriel||""} onChange={function(e){snf("courriel",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Date de naissance"/><input type="date" value={nf.naiss||""} onChange={function(e){snf("naiss",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Semaines de vacances"/>
            <select value={nf.vacances||3} onChange={function(e){snf("vacances",parseInt(e.target.value));}} style={INP}>
              {[2,3,4,5,6].map(function(n){return <option key={n} value={n}>{n} semaines</option>;})}
            </select>
          </div>
          <div style={{gridColumn:"1/-1"}}><Lbl l="Adresse"/><input value={nf.adresse||""} onChange={function(e){snf("adresse",e.target.value);}} style={INP}/></div>
          <div><Lbl l="Code fiscal federal"/>
            <select value={nf.federal||"M"} onChange={function(e){snf("federal",e.target.value);}} style={INP}><option value="M">M - Marie</option><option value="C">C - Celibataire</option><option value="E">E - Exempte</option></select>
          </div>
          <div><Lbl l="Code fiscal provincial"/>
            <select value={nf.provincial||"M"} onChange={function(e){snf("provincial",e.target.value);}} style={INP}><option value="M">M - Marie</option><option value="C">C - Celibataire</option><option value="E">E - Exempte</option></select>
          </div>
                    <div style={{gridColumn:"1/-1",background:"#FEF3E2",border:"1px solid #B8602044",borderRadius:8,padding:"10px 14px",fontSize:11,color:"#B86020",marginBottom:4}}>Informations confidentielles - T4 et Releve 1</div>
          <div><Lbl l="NAS (No assurance sociale)" hint="9 chiffres - confidentiel"/><input value={nf.nas||""} onChange={function(e){snf("nas",e.target.value.replace(/\D/g,"").slice(0,9));}} style={INP} placeholder="000 000 000" maxLength={9}/></div>
          <div><Lbl l="Type de remuneration"/><select value={nf.typeRem||"annuel"} onChange={function(e){snf("typeRem",e.target.value);}} style={INP}><option value="annuel">Salaire annuel</option><option value="horaire">Taux horaire</option></select></div>
          <div><Lbl l="Taux horaire ($)" hint="Si remuneration horaire"/><input type="number" step="0.01" value={nf.tauxHoraire||""} onChange={function(e){snf("tauxHoraire",parseFloat(e.target.value)||0);}} style={INP} placeholder="22.50"/></div>
          <div><Lbl l="Heures assurables/semaine" hint="Pour calcul AE - max 35h"/><input type="number" min="0" max="60" value={nf.heuresAssurables||""} onChange={function(e){snf("heuresAssurables",parseInt(e.target.value)||0);}} style={INP} placeholder="35"/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl l="Notes"/><textarea value={nf.notes||""} onChange={function(e){snf("notes",e.target.value);}} rows={2} style={Object.assign({},INP,{resize:"vertical"})}/></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={function(){if(!nf.nom||!nf.prenom)return;setEmployes(function(prev){return prev.concat([Object.assign({},nf,{id:Date.now(),type:"TP",nas:"***-***-***",actif:true})]);});setShowN(false);}}>Ajouter l employe</Btn>
          <Btn onClick={function(){setShowN(false);}} bg={T.alt} tc={T.muted} bdr={"1px solid "+T.border}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
}



// ===== MODULE PRINCIPAL =====
export default function Comptabilite(){
  var s0=useState("facturation");var ong=s0[0];var setOng=s0[1];
  var TABS=[
    {id:"facturation",l:"Facturation clients"},
    {id:"paie",l:"Paie et DAS"},
    {id:"employes",l:"Employes"},
    {id:"journal",l:"Journal comptable"},
    {id:"soldes",l:"Soldes d ouverture"},
    {id:"grandlivre",l:"Grand livre"},
    {id:"budget",l:"Budget"},
    {id:"etats",l:"Etats financiers"},
  ];
  return(
    <div style={{padding:16,fontFamily:"Georgia,serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.navy}}>Comptabilite Predictek</div>
          <div style={{fontSize:11,color:T.muted}}>Module interne - Facturation, paie, taxes et etats financiers</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Bdg bg={T.accentL} c={T.accent}>Exercice 2025-2026</Bdg>
          <Bdg bg={T.blueL} c={T.blue}>TPS: 123456789 RT0001</Bdg>
          <Bdg bg={T.purpleL} c={T.purple}>TVQ: 1234567890 TQ0001</Bdg>
        </div>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:16,background:T.surface,padding:5,borderRadius:10,border:"1px solid "+T.border}}>
        {TABS.map(function(t){var a=ong===t.id;return(
          <button key={t.id} onClick={function(){setOng(t.id);}} style={{background:a?T.navy:"transparent",border:"none",borderRadius:7,padding:"8px 16px",color:a?"#fff":T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:a?600:400,whiteSpace:"nowrap"}}>{t.l}</button>
        );})}
      </div>
      {ong==="facturation"&&<TabFacturation/>}
      {ong==="paie"&&<TabPaie/>}
      {ong==="employes"&&<TabEmployes/>}
      {ong==="journal"&&<TabJournal/>}
      {ong==="soldes"&&<TabSoldesOuverture/>}
      {ong==="grandlivre"&&<TabGrandLivre/>}
      {ong==="budget"&&<TabBudget/>}
      {ong==="etats"&&<TabEtats/>}
    </div>
  );
}
