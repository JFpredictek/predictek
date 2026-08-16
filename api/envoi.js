// ENVOI DE COURRIEL DIRECT (bons de travaux aux fournisseurs, etc.)
// SECURITE ESSAIS: tant que RELANCES_MODE n est pas "production" dans Vercel,
// tous les courriels sont REDIRIGES vers EMAIL_ADMIN avec un prefixe [TEST].
// SECURITE: exige un jeton de session Supabase valide (connexion requise).
export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

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

  var resendKey = process.env.RESEND_API_KEY || "";
  if(!resendKey) return res.status(500).json({error:"RESEND_API_KEY non configuree dans Vercel - courriel NON envoye."});
  var adminEmail = process.env.EMAIL_ADMIN || "jflaroche@cgocable.ca";
  var production = (process.env.RELANCES_MODE || "") === "production";
  var from = process.env.EMAIL_FROM || "Predictek <onboarding@resend.dev>";

  var destinataire = (req.body && req.body.destinataire) || "";
  var sujet = (req.body && req.body.sujet) || "";
  var corps = (req.body && req.body.corps) || "";
  if(!destinataire || !sujet || !corps) return res.status(400).json({error:"destinataire, sujet et corps requis"});
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(destinataire)) return res.status(400).json({error:"Adresse courriel du destinataire invalide: " + destinataire});

  var to = production ? destinataire : adminEmail;
  var sujetFinal = production ? sujet : "[TEST - destinataire reel: " + destinataire + "] " + sujet;
  try{
    var r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {"Content-Type":"application/json","Authorization":"Bearer " + resendKey},
      body: JSON.stringify({from: from, to: [to], subject: sujetFinal, text: corps})
    });
    if(!r.ok){
      var d = await r.text();
      return res.status(502).json({error:"Echec de l envoi (Resend): " + d.substring(0,300)});
    }
    return res.status(200).json({ok:true, production: production, envoye_a: to, redirection: production ? null : "MODE TEST: redirige vers " + adminEmail});
  }catch(e){
    return res.status(502).json({error:"Echec de l envoi: " + (e && e.message ? e.message : "erreur reseau")});
  }
}
