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
    var imagesIn = (req.body && req.body.images) || [];
    if(!texte && !pdfB64 && imagesIn.length===0) return res.status(400).json({error:"Aucun texte, PDF ou image fourni"});

    // LOG pour debug - retourner aussi le texte recu dans la reponse
    var texteLen = texte.length;
    var textePreview = texte.substring(0, 500);

    if(mode === "reglements") {
      var promptR = "Voici le texte d une declaration de copropriete quebecoise.\n\n" + texte.substring(0,30000) + "\n\nGenere un resume structure des reglements importants. Format: liste par categorie, francais, max 800 mots.";
      var rR = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1200,messages:[{role:"user",content:[{type:"text",text:promptR}]}]})});
      var rawR = await rR.text();
      var dR; try{dR=JSON.parse(rawR);}catch(e){return res.status(500).json({error:"JSON invalide"});}
      if(dR.error) return res.status(500).json({error:dR.error.message});
      return res.status(200).json({ok:true,resume:(dR.content&&dR.content[0]&&dR.content[0].text)||""});
    }

    var prompt = "Voici le texte extrait de documents officiels d un syndicat de copropriete quebecois (REQ et/ou declaration).\n\n"
      + texte.substring(0,30000)
      + "\n\nReponds UNIQUEMENT avec un objet JSON valide. Cles requises:\n"
      + "nom, immat (NEQ 11 chiffres), adr (domicile REQ), ville, province, codePostal, nbUnites (entier), gestionnaire, "
      + "quorumAGO (% entier pour AGO - cherche dans les extraits de la declaration le quorum requis aux assemblees generales; s il est exprime comme majorite des voix des presents ou majorite simple, mets 50), anneeConstitution (entier: annee de CONSTITUTION du syndicat = annee de publication de la declaration de copropriete INITIALE au registre foncier, c est-a-dire l acte notarie ORIGINAL; si le document mentionne plusieurs dates comme des modifications ou refontes, prends TOUJOURS la date la PLUS ANCIENNE), typeCopro (horizontale/verticale/mixte),"
      + "admins (tableau ADMINS ACTUELS EN FONCTION uniquement: [{prenom,nom,adr,ville,province,codePostal,role,dateDebut}]). "
      + "IMPORTANT pour role: croise la liste des administrateurs avec la section des fonctions/dirigeants du REQ. "
      + "role DOIT etre exactement une de ces valeurs: president, vice-president, secretaire, tresorier, administrateur. "
      + "Si le document indique la fonction d une personne (ex: President, Secretaire, Tresorier), utilise-la; sinon mets administrateur. "
      + "Si un champ est absent mettre valeur vide ou 0.";

    var contenu;
    if(mode==="quoteparts_liste"){
      // Extraction brute des quotes-parts visibles (texte OU images de pages numerisees).
      // La comparaison avec le fichier Excel est faite cote client (deterministe).
      var promptQL = "Voici un extrait de la declaration de copropriete d un syndicat quebecois. "
        + "Liste TOUTES les quotes-parts (fractions des parties communes, en %) que tu peux lire, avec le numero d unite ou de fraction associe. "
        + "Cherche les tableaux de fractions/quotes-parts. "
        + "Reponds UNIQUEMENT avec un objet JSON valide: {\"trouvees\":[{\"unite\":\"numero\",\"fraction\":\"valeur en % (ex: 2.778)\"}]}. "
        + "Si aucune quote-part n est visible, reponds {\"trouvees\":[]}.";
      if(imagesIn.length>0){
        contenu = imagesIn.slice(0,8).map(function(im){return {type:"image",source:{type:"base64",media_type:"image/jpeg",data:im}};});
        contenu.push({type:"text",text:promptQL});
      } else if(texte){
        contenu = [{type:"text",text:promptQL+"\n\nEXTRAIT:\n"+texte.substring(0,30000)}];
      } else {
        return res.status(400).json({error:"Aucun texte ou image fourni"});
      }
    } else if(mode==="assurance"){
      var promptAss = "Voici une preuve d assurance (police d assurance habitation/copropriete quebecoise). "
        + "Extrais les informations suivantes. Reponds UNIQUEMENT avec un objet JSON valide (chaine vide si absent): "
        + "{\"compagnie\":\"nom de l assureur\",\"police\":\"numero de police\",\"dateDebut\":\"AAAA-MM-JJ\",\"dateExp\":\"AAAA-MM-JJ (date d expiration/fin de la periode)\",\"assure\":\"nom de l assure\",\"montantResponsabilite\":\"montant de responsabilite civile si visible\"}";
      if(pdfB64){
        contenu = [{type:"document",source:{type:"base64",media_type:"application/pdf",data:pdfB64}},{type:"text",text:promptAss}];
      } else if(imagesIn.length>0){
        contenu = imagesIn.slice(0,8).map(function(im){return {type:"image",source:{type:"base64",media_type:"image/jpeg",data:im}};});
        contenu.push({type:"text",text:promptAss});
      } else {
        return res.status(400).json({error:"Aucun document fourni"});
      }
    } else if(mode==="date_document"){
      var promptDD = "Voici un document officiel d un syndicat de copropriete quebecois (etude d evaluation aux fins d assurance, etude du fonds de prevoyance, ou autre rapport professionnel). "
        + "Extrais les informations suivantes. Reponds UNIQUEMENT avec un objet JSON valide (chaine vide si absent): "
        + "{\"typeDocument\":\"courte description du type de document\",\"date\":\"AAAA-MM-JJ (date de production/signature de l etude ou du rapport)\",\"firme\":\"nom de la firme/professionnel\",\"montant\":\"valeur principale si applicable (ex: valeur de reconstruction)\"}";
      if(pdfB64){
        contenu = [{type:"document",source:{type:"base64",media_type:"application/pdf",data:pdfB64}},{type:"text",text:promptDD}];
      } else if(imagesIn.length>0){
        contenu = imagesIn.slice(0,8).map(function(im){return {type:"image",source:{type:"base64",media_type:"image/jpeg",data:im}};});
        contenu.push({type:"text",text:promptDD});
      } else {
        return res.status(400).json({error:"Aucun document fourni"});
      }
    } else if(mode==="facture"){
      var promptFac = "Voici une facture de fournisseur (Quebec, Canada). "
        + "Extrais les informations suivantes. Reponds UNIQUEMENT avec un objet JSON valide (chaine vide ou 0 si absent): "
        + "{\"fournisseur\":\"nom du fournisseur\",\"numero\":\"numero de facture\",\"date\":\"AAAA-MM-JJ\",\"echeance\":\"AAAA-MM-JJ\",\"sousTotal\":nombre,\"tps\":nombre,\"tvq\":nombre,\"total\":nombre (montant total TTC),\"description\":\"description courte des biens/services\",\"categorie\":\"une valeur parmi: entretien, reparation, deneigement, paysagement, assurance, energie, administration, autre\"}";
      if(pdfB64){
        contenu = [{type:"document",source:{type:"base64",media_type:"application/pdf",data:pdfB64}},{type:"text",text:promptFac}];
      } else if(imagesIn.length>0){
        contenu = imagesIn.slice(0,8).map(function(im){return {type:"image",source:{type:"base64",media_type:"image/jpeg",data:im}};});
        contenu.push({type:"text",text:promptFac});
      } else {
        return res.status(400).json({error:"Aucun document fourni"});
      }
    } else if(mode==="quoteparts"){
      var promptQP = "Voici la declaration de copropriete d un syndicat quebecois (PDF ou pages numerisees). "
        + "Un fichier Excel a ete importe avec ces quotes-parts par unite (en %): " + JSON.stringify(unites) + ". "
        + "Trouve dans la declaration la quote-part (fraction des parties communes) de CHAQUE unite listee et compare. "
        + "Tolere les ecarts d arrondi inferieurs ou egaux a 0.002. "
        + "Reponds UNIQUEMENT avec un objet JSON valide: "
        + "{\"concordance\":true ou false,\"nbValides\":entier,\"ecarts\":[{\"unite\":\"...\",\"excel\":\"valeur du fichier\",\"declaration\":\"valeur de la declaration\"}],\"note\":\"courte remarque (ex: unites introuvables dans la declaration)\"}. "
        + "Si les pages fournies ne contiennent pas de quotes-parts lisibles, mets concordance:false et explique dans note.";
      if(pdfB64){
        contenu = [{type:"document",source:{type:"base64",media_type:"application/pdf",data:pdfB64}},{type:"text",text:promptQP}];
      } else if(imagesIn.length>0){
        contenu = imagesIn.slice(0,8).map(function(im){return {type:"image",source:{type:"base64",media_type:"image/jpeg",data:im}};});
        contenu.push({type:"text",text:promptQP});
      } else {
        return res.status(400).json({error:"Aucun PDF ou image fourni pour la validation des quotes-parts"});
      }
    } else if(pdfB64){
      var promptPdf = "Voici le document officiel PDF d un syndicat de copropriete quebecois (REQ et/ou declaration). Lis-le attentivement, y compris s il s agit d un document numerise."
        + "\n\nReponds UNIQUEMENT avec un objet JSON valide. Cles requises:\n"
        + "nom, immat (NEQ 11 chiffres), adr (domicile REQ), ville, province, codePostal, nbUnites (entier), gestionnaire, "
        + "quorumAGO (% entier pour AGO - cherche dans les extraits de la declaration le quorum requis aux assemblees generales; s il est exprime comme majorite des voix des presents ou majorite simple, mets 50), anneeConstitution (entier: annee de CONSTITUTION du syndicat = annee de publication de la declaration de copropriete INITIALE au registre foncier, c est-a-dire l acte notarie ORIGINAL; si le document mentionne plusieurs dates comme des modifications ou refontes, prends TOUJOURS la date la PLUS ANCIENNE), typeCopro (horizontale/verticale/mixte),"
        + "admins (tableau ADMINS ACTUELS EN FONCTION uniquement: [{prenom,nom,adr,ville,province,codePostal,role,dateDebut}]). "
      + "IMPORTANT pour role: croise la liste des administrateurs avec la section des fonctions/dirigeants du REQ. "
      + "role DOIT etre exactement une de ces valeurs: president, vice-president, secretaire, tresorier, administrateur. "
      + "Si le document indique la fonction d une personne (ex: President, Secretaire, Tresorier), utilise-la; sinon mets administrateur. "
        + "Si un champ est absent mettre valeur vide ou 0.";
      contenu = [{type:"document",source:{type:"base64",media_type:"application/pdf",data:pdfB64}},{type:"text",text:promptPdf}];
    } else if(Array.isArray(req.body.images)&&req.body.images.length>0){
      contenu = req.body.images.slice(0,8).map(function(im){return {type:"image",source:{type:"base64",media_type:"image/jpeg",data:im}};});
      contenu.push({type:"text",text:"Voici des pages numerisees de la declaration de copropriete d un syndicat quebecois. Lis-les attentivement."
        + "\n\nReponds UNIQUEMENT avec un objet JSON valide. Cles requises (mets vide ou 0 si absent):\n"
        + "anneeConstitution (annee de publication de la declaration de copropriete INITIALE au registre foncier - l acte notarie ORIGINAL; si plusieurs dates sont visibles comme des modifications ou refontes, prends TOUJOURS la plus ancienne), "
        + "quorumAGO (quorum des assemblees generales en % entier; majorite des voix des presents ou majorite simple = 50), "
        + "nbUnites (entier), typeCopro (horizontale/verticale/mixte), "
        + "reglements (resume en francais des reglements de gestion, restrictions, penalites et regles de vie visibles sur ces pages, max 250 mots; chaine vide si aucun)."});
    } else {
      contenu = [{type:"text",text:prompt}];
    }
    var r2 = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:3500,messages:[{role:"user",content:contenu}]})});
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