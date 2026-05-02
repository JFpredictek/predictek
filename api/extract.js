export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(200).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  try {
    var apiKey = process.env.ANTHROPIC_API_KEY;
    if(!apiKey) return res.status(500).json({error:"ANTHROPIC_API_KEY non configuree"});
    var texte = (req.body && req.body.texte) || "";
    var mode = (req.body && req.body.mode) || "syndicat";
    if(!texte) return res.status(400).json({error:"Aucun texte fourni"});

    var prompt;

    if(mode === "reglements") {
      prompt = "Voici le texte d une declaration de copropriete quebecoise.\n\n"
        + texte.substring(0,12000)
        + "\n\nGenere un resume structure et concis des reglements importants. "
        + "Inclus: regles de vie (bruit, animaux, stationnement, renovations), restrictions d usage, "
        + "obligations des coproprietes, procedures importantes, sanctions prevues. "
        + "Format: liste claire par categorie, en francais, max 800 mots.";
      var r1 = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},
        body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1200,messages:[{role:"user",content:[{type:"text",text:prompt}]}]})
      });
      var raw1 = await r1.text();
      var d1; try{d1=JSON.parse(raw1);}catch(e){return res.status(500).json({error:"JSON invalide"});}
      if(d1.error) return res.status(500).json({error:d1.error.message});
      return res.status(200).json({ok:true,resume:(d1.content&&d1.content[0]&&d1.content[0].text)||""});
    }

    // Mode defaut: extraction infos syndicat depuis REQ et/ou declaration
    prompt = "Voici le texte extrait d un document officiel de syndicat de copropriete quebecois (REQ et/ou declaration).\n\n"
      + texte.substring(0,10000)
      + "\n\nReponds UNIQUEMENT avec un objet JSON valide sans texte autour. Cles requises:\n"
      + "- nom: nom officiel complet du syndicat\n"
      + "- immat: numero NEQ 11 chiffres (Registre entreprises du Quebec)\n"
      + "- adr: adresse du domicile inscrite au REQ (adresse postale du syndicat, pas l immeuble)\n"
      + "- ville: ville du domicile\n"
      + "- province: 2 lettres (QC)\n"
      + "- codePostal: code postal\n"
      + "- nbUnites: nombre total d unites (entier)\n"
      + "- gestionnaire: nom du gestionnaire si present\n"
      + "- quorumAGO: pourcentage entier requis pour AGO (ex: 50)\n"
      + "- anneeConstruction: annee de construction (entier ex: 1985)\n"
      + "- typeCopro: exactement l un de: horizontale, verticale, mixte\n"
      + "- admins: tableau des administrateurs ACTUELLEMENT EN FONCTION au REQ (NE PAS inclure les anciens administrateurs ni l'historique). "
      + "Pour chaque administrateur inclure: "
      + "{prenom, nom, adr (adresse personnelle), ville, province, codePostal, "
      + "role (exactement: president, secretaire, tresorier, ou administrateur), "
      + "dateDebut (date de debut de la charge au REQ format YYYY-MM-DD ou vide)}. "
      + "Le secretaire et le tresorier sont souvent inscrits separement du president - cherche bien TOUS les administrateurs. "
      + "Tableau vide si aucun trouve.\n"
      + "Valeur vide ou 0 si information absente.";

    var r2 = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:2000,messages:[{role:"user",content:[{type:"text",text:prompt}]}]})
    });
    var raw2 = await r2.text();
    var d2; try{d2=JSON.parse(raw2);}catch(e){return res.status(500).json({error:"JSON invalide: "+raw2.substring(0,100)});}
    if(d2.error) return res.status(500).json({error:d2.error.message,type:d2.error.type});
    var txt = (d2.content&&d2.content[0]&&d2.content[0].text)||"";
    try {
      var ex = JSON.parse(txt.replace(/```json|```/g,"").trim());
      return res.status(200).json({ok:true,data:ex});
    } catch(e){
      return res.status(200).json({ok:true,data:{},raw:txt.substring(0,500)});
    }
  } catch(e){
    return res.status(500).json({error:e.message||"Erreur inconnue"});
  }
}