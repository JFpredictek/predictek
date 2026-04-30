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
    if(!texte) return res.status(400).json({error:"Aucun texte fourni"});

    var prompt = "Voici le texte extrait de documents officiels d un syndicat de copropriete quebecois (REQ et/ou declaration de copropriete):\n\n"
      + texte.substring(0,10000)
      + "\n\nExtrait les informations et reponds UNIQUEMENT avec un objet JSON valide sans texte autour. Cles requises:\n"
      + "nom: nom officiel du syndicat,\n"
      + "immat: numero NEQ 11 chiffres (REQ),\n"
      + "adr: adresse du domicile inscrite au REQ (pas l adresse de l immeuble),\n"
      + "ville: ville du domicile,\n"
      + "province: 2 lettres (QC),\n"
      + "codePostal: code postal du domicile,\n"
      + "nbUnites: nombre total d unites (entier),\n"
      + "gestionnaire: nom du gestionnaire si present,\n"
      + "quorumAGO: pourcentage entier requis pour AGO selon declaration (ex: 50),\n"
      + "anneeConstruction: annee de construction selon declaration (entier ex: 1985),\n"
      + "admins: tableau des administrateurs du REQ, chaque element contient: {prenom, nom, adr, ville, province, codePostal}. Tableau vide si non trouve.\n"
      + "Valeur vide ou 0 si information absente.";

    var anthropicRes = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1500,messages:[{role:"user",content:[{type:"text",text:prompt}]}]})
    });
    var rawText = await anthropicRes.text();
    var data;
    try { data = JSON.parse(rawText); }
    catch(e){ return res.status(500).json({error:"Reponse non-JSON: "+rawText.substring(0,150)}); }
    if(data.error) return res.status(500).json({error:data.error.message,type:data.error.type});
    var txt = (data.content&&data.content[0]&&data.content[0].text)||"";
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