export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

// SECURITE: cet endpoint exige un jeton de session Supabase valide (connexion requise).
var SB_URL = "https://yzbauupamxbwcnnuiunf.supabase.co";
var SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YmF1dXBhbXhid2NubnVpdW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzY0NzIsImV4cCI6MjA5MjgxMjQ3Mn0.ZcoZtbeej2wol4TFyuOUg4vv8QVAI5efKlWbLu4H6L4";
var ORIGINS = ["https://predictek-d9sy.vercel.app","http://localhost:3000"];

async function verifierJeton(req) {
  var auth = req.headers.authorization || "";
  var token = auth.indexOf("Bearer ") === 0 ? auth.slice(7) : "";
  if(!token || token === SB_ANON) return null;
  try {
    var r = await fetch(SB_URL + "/auth/v1/user", {headers: {"apikey": SB_ANON, "Authorization": "Bearer " + token}});
    if(!r.ok) return null;
    var u = await r.json();
    return u && u.id ? u : null;
  } catch(e) { return null; }
}

export default async function handler(req, res) {
  var origin = req.headers.origin || "";
  res.setHeader("Access-Control-Allow-Origin", ORIGINS.indexOf(origin) >= 0 ? origin : ORIGINS[0]);
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type,Authorization");
  if(req.method==="OPTIONS") return res.status(200).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  var usager = await verifierJeton(req);
  if(!usager) return res.status(401).json({error:"Connexion requise. Veuillez vous reconnecter."});
  try {
    var apiKey = process.env.ANTHROPIC_API_KEY;
    if(!apiKey) return res.status(500).json({error:"ANTHROPIC_API_KEY non configuree"});
    var texte = (req.body && req.body.texte) || "";
    var pdfB64 = (req.body && req.body.pdf) || "";
    var mode = (req.body && req.body.mode) || "syndicat";
    var unites = (req.body && req.body.unites) || [];
    if(!texte && !pdfB64) return res.status(400).json({error:"Aucun texte ni PDF fourni"});

    // LOG pour debug - retourner aussi le texte recu dans la reponse
    var texteLen = texte.length;
    var textePreview = texte.substring(0, 500);

    if(mode === "reglements") {
      var promptR = "Voici le texte d une declaration de copropriete quebecoise.\n\n" + texte.substring(0,12000) + "\n\nGenere un resume structure des reglements importants. Format: liste par categorie, francais, max 800 mots.";
      var rR = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1200,messages:[{role:"user",content:[{type:"text",text:promptR}]}]})});
      var rawR = await rR.text();
      var dR; try{dR=JSON.parse(rawR);}catch(e){return res.status(500).json({error:"JSON invalide"});}
      if(dR.error) return res.status(500).json({error:dR.error.message});
      return res.status(200).json({ok:true,resume:(dR.content&&dR.content[0]&&dR.content[0].text)||""});
    }

    var prompt = "Voici le texte extrait de documents officiels d un syndicat de copropriete quebecois (REQ et/ou declaration).\n\n"
      + texte.substring(0,12000)
      + "\n\nReponds UNIQUEMENT avec un objet JSON valide. Cles requises:\n"
      + "nom, immat (NEQ 11 chiffres), adr (domicile REQ), ville, province, codePostal, nbUnites (entier), gestionnaire, "
      + "quorumAGO (% entier pour AGO ex:50), anneeConstruction (entier ex:1985), typeCopro (horizontale/verticale/mixte), "
      + "admins (tableau ADMINS ACTUELS EN FONCTION uniquement: [{prenom,nom,adr,ville,province,codePostal,role,dateDebut}]). "
      + "Si un champ est absent mettre valeur vide ou 0.";

    var contenu;
    if(pdfB64 && mode==="quoteparts"){
      var promptQP = "Voici la declaration de copropriete d un syndicat quebecois (PDF, possiblement numerise). "
        + "Un fichier Excel a ete importe avec ces quotes-parts par unite (en %): " + JSON.stringify(unites) + ". "
        + "Trouve dans la declaration la quote-part (fraction des parties communes) de CHAQUE unite listee et compare. "
        + "Tolere les ecarts d arrondi inferieurs ou egaux a 0.002. "
        + "Reponds UNIQUEMENT avec un objet JSON valide: "
        + "{\"concordance\":true ou false,\"nbValides\":entier,\"ecarts\":[{\"unite\":\"...\",\"excel\":\"valeur du fichier\",\"declaration\":\"valeur de la declaration\"}],\"note\":\"courte remarque (ex: unites introuvables dans la declaration)\"}. "
        + "Si la declaration ne contient pas de quotes-parts lisibles, mets concordance:false et explique dans note.";
      contenu = [{type:"document",source:{type:"base64",media_type:"application/pdf",data:pdfB64}},{type:"text",text:promptQP}];
    } else if(pdfB64){
      var promptPdf = "Voici le document officiel PDF d un syndicat de copropriete quebecois (REQ et/ou declaration). Lis-le attentivement, y compris s il s agit d un document numerise."
        + "\n\nReponds UNIQUEMENT avec un objet JSON valide. Cles requises:\n"
        + "nom, immat (NEQ 11 chiffres), adr (domicile REQ), ville, province, codePostal, nbUnites (entier), gestionnaire, "
        + "quorumAGO (% entier pour AGO ex:50), anneeConstruction (entier ex:1985), typeCopro (horizontale/verticale/mixte), "
        + "admins (tableau ADMINS ACTUELS EN FONCTION uniquement: [{prenom,nom,adr,ville,province,codePostal,role,dateDebut}]). "
        + "Si un champ est absent mettre valeur vide ou 0.";
      contenu = [{type:"document",source:{type:"base64",media_type:"application/pdf",data:pdfB64}},{type:"text",text:promptPdf}];
    } else {
      contenu = [{type:"text",text:prompt}];
    }
    var r2 = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:2000,messages:[{role:"user",content:contenu}]})});
    var raw2 = await r2.text();
    var d2; try{d2=JSON.parse(raw2);}catch(e){return res.status(500).json({error:"JSON invalide: "+raw2.substring(0,100)});}
    if(d2.error) return res.status(500).json({error:d2.error.message,type:d2.error.type});
    var txt = (d2.content&&d2.content[0]&&d2.content[0].text)||"";
    try {
      var ex = JSON.parse(txt.replace(/```json|```/g,"").trim());
      return res.status(200).json({ok:true, data:ex, debug:{texteLen:texteLen, textePreview:textePreview}});
    } catch(e){
      return res.status(200).json({ok:true,data:{},raw:txt.substring(0,500), debug:{texteLen:texteLen,textePreview:textePreview}});
    }
  } catch(e){
    return res.status(500).json({error:e.message||"Erreur inconnue"});
  }
}