export const config = { api: { bodyParser: { sizeLimit: '25mb' }, responseLimit: '25mb' } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(200).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  try {
    var apiKey = process.env.ANTHROPIC_API_KEY;
    if(!apiKey) return res.status(500).json({error:"ANTHROPIC_API_KEY non configuree"});

    var docs = (req.body && req.body.docs) || [];
    if(!docs.length) return res.status(400).json({error:"Aucun document fourni"});

    var content = docs.map(function(d){
      return {type:"document",source:{type:"base64",media_type:"application/pdf",data:d.b64}};
    });
    content.push({type:"text",text:"Analyse ce document de syndicat de copropriete quebecois. Reponds uniquement avec un objet JSON valide sans texte autour. Cles: nom, immat, adr, ville, province, codePostal, nbUnites, gestionnaire. Valeur vide si absent."});

    var anthropicRes = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:600,messages:[{role:"user",content:content}]})
    });

    var rawText = await anthropicRes.text();
    var data;
    try { data = JSON.parse(rawText); }
    catch(e){ return res.status(500).json({error:"Reponse non-JSON: "+rawText.substring(0,150)}); }

    if(data.error) return res.status(500).json({error:data.error.message, type:data.error.type});

    var txt = (data.content&&data.content[0]&&data.content[0].text)||"";
    try {
      var ex = JSON.parse(txt.replace(/```json|```/g,"").trim());
      return res.status(200).json({ok:true,data:ex});
    } catch(e){
      return res.status(200).json({ok:true,data:{},raw:txt.substring(0,300)});
    }
  } catch(e){
    return res.status(500).json({error:e.message||"Erreur inconnue"});
  }
}