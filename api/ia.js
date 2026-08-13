// Predictek - Proxy IA generique (les cles API ne sont JAMAIS dans le navigateur)
// Utilise par: ModuleIA (analyse soumissions, PV, anomalies, chatbot) et ReconnaissanceDoc.
// Exige un utilisateur Predictek connecte (jeton Supabase valide).
// Body: { system?, messages, max_tokens?, fort? }  -> reponse: { texte }

var SB_URL = "https://yzbauupamxbwcnnuiunf.supabase.co";
var SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YmF1dXBhbXhid2NubnVpdW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzY0NzIsImV4cCI6MjA5MjgxMjQ3Mn0.ZcoZtbeej2wol4TFyuOUg4vv8QVAI5efKlWbLu4H6L4";

var MODEL_FORT = "claude-sonnet-4-5-20250929";
var MODEL_RAPIDE = "claude-haiku-4-5-20251001";

async function verifierConnecte(req){
  var auth = req.headers.authorization || "";
  var token = auth.indexOf("Bearer ") === 0 ? auth.slice(7) : "";
  if(!token || token === SB_ANON) return null;
  try{
    var r = await fetch(SB_URL + "/auth/v1/user", {headers: {"apikey": SB_ANON, "Authorization": "Bearer " + token}});
    if(!r.ok) return null;
    var u = await r.json();
    return (u && u.id) ? u : null;
  }catch(e){ return null; }
}

module.exports = async function(req, res){
  if(req.method !== "POST") return res.status(405).json({error: "POST requis"});

  var user = await verifierConnecte(req);
  if(!user) return res.status(401).json({error: "Connexion Predictek requise"});

  var apiKey = process.env.ANTHROPIC_API_KEY || "";
  if(!apiKey) return res.status(500).json({error: "ANTHROPIC_API_KEY manquante dans Vercel"});

  var b = req.body || {};
  if(!Array.isArray(b.messages) || b.messages.length === 0) return res.status(400).json({error: "messages requis"});
  if(b.messages.length > 40) return res.status(400).json({error: "trop de messages"});

  var corps = {
    model: b.fort ? MODEL_FORT : MODEL_RAPIDE,
    max_tokens: Math.min(parseInt(b.max_tokens, 10) || 1000, 4000),
    messages: b.messages
  };
  if(b.system) corps.system = String(b.system).substring(0, 8000);

  try{
    var r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {"Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01"},
      body: JSON.stringify(corps)
    });
    var d = await r.json();
    if(d && d.content){
      var texte = d.content.filter(function(c){return c.type === "text";}).map(function(c){return c.text;}).join("");
      return res.status(200).json({texte: texte});
    }
    return res.status(502).json({error: (d && d.error && d.error.message) || "Reponse IA invalide"});
  }catch(e){
    return res.status(502).json({error: "Erreur de connexion a l IA: " + (e && e.message ? e.message : "")});
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: "4.5mb" } } };
