export default async function handler(req, res) {
  if(req.method === "OPTIONS"){
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers","Content-Type");
    return res.status(200).end();
  }
  if(req.method !== "POST"){return res.status(405).json({error:"Method not allowed"});}
  try{
    var docs = req.body && req.body.docs || [];
    if(docs.length===0){return res.status(400).json({error:"Aucun document fourni"});}
    var content = docs.map(function(d){
      return {type:"document",source:{type:"base64",media_type:"application/pdf",data:d.b64}};
    });
    content.push({type:"text",text:"Analyse ce document de syndicat de copropriete quebecois. Reponds uniquement avec un objet JSON valide sans texte autour. Cles: nom, immat, adr, ville, province, codePostal, nbUnites, gestionnaire. Valeur vide si absent."});
    var response = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:content}]})
    });
    var data = await response.json();
    if(data.error){return res.status(500).json({error:data.error.message});}
    var txt = data.content && data.content[0] && data.content[0].text || "";
    var extracted = JSON.parse(txt.replace(/```json|```/g,"").trim());
    return res.status(200).json({ok:true,data:extracted});
  }catch(e){
    return res.status(500).json({error:e.message||"Erreur inconnue"});
  }
}
