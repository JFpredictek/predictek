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
        + "\n\nGenere un resume structure et concis des reglements importants pour les coproprietes. "
        + "Inclus: regles de vie (bruit, animaux, stationnement, renovations), restrictions d usage, "
        + "obligations des coproprietes, procedures importantes, sanctions prevues. "
        + "Format: liste claire par categorie, en francais, max 800 mots. "
        + "Ce resume sera consulte par les employes Predictek pour repondre aux questions des coproprietes.";
      var anthropicRes = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},
        body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1200,messages:[{role:"user",content:[{type:"text",text:prompt}]}]})
      });
      var rawText = await anthropicRes.text();
      var data;
      try { data = JSON.parse(rawText); }
      catch(e){ return res.status(500).json({error:"Reponse non-JSON: "+rawText.substring(0,150)}); }
      if(data.error) return res.status(500).json({error:data.error.message,type:data.error.type});
      var resume = (data.content&&data.content[0]&&data.content[0].text)||"";
      return res.status(200).json({ok:true,resume:resume});
    }

    // Mode defaut: extraction infos syndicat
    prompt = "Voici le texte extrait de documents officiels d un syndicat de copropriete quebecois:\n\n"
      + texte.substring(0,10000)
      + "\n\nExtrait les informations et reponds UNIQUEMENT avec un objet JSON valide sans texte autour. Cles: "
      + "nom (nom officiel du syndicat), immat (NEQ 11 chiffres), adr (adresse domicile au REQ), "
      + "ville, province (2 lettres), codePostal, nbUnites (entier), gestionnaire, "
      + "quorumAGO (pourcentage entier pour AGO, ex: 50), anneeConstruction (annee entiere, ex: 1985), "
      + "typeCopro (exactement: horizontale, verticale, ou mixte), "
      + "admins (tableau: [{prenom,nom,adr,ville,province,codePostal}]). Vide ou 0 si absent.";

    var anthropicRes2 = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1500,messages:[{role:"user",content:[{type:"text",text:prompt}]}]})
    });
    var rawText2 = await anthropicRes2.text();
    var data2;
    try { data2 = JSON.parse(rawText2); }
    catch(e){ return res.status(500).json({error:"Reponse non-JSON: "+rawText2.substring(0,150)}); }
    if(data2.error) return res.status(500).json({error:data2.error.message,type:data2.error.type});
    var txt = (data2.content&&data2.content[0]&&data2.content[0].text)||"";
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