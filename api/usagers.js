// Predictek - API gestion des usagers (creation de comptes reels + activation)
// SECURITE:
// - Reserve aux utilisateurs connectes dont le role (user_metadata) est "admin".
// - Utilise la cle SUPABASE_SERVICE_ROLE_KEY (env Vercel) qui ne quitte JAMAIS le serveur.
// Actions:
// - create: cree le compte Supabase Auth et envoie un courriel d invitation
//   (l utilisateur choisit son mot de passe via le lien).
// - toggle: active/desactive la connexion (ban) d un compte via son auth_id.

var SB_URL = "https://yzbauupamxbwcnnuiunf.supabase.co";
var SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YmF1dXBhbXhid2NubnVpdW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzY0NzIsImV4cCI6MjA5MjgxMjQ3Mn0.ZcoZtbeej2wol4TFyuOUg4vv8QVAI5efKlWbLu4H6L4";
var ORIGINS = ["https://predictek-d9sy.vercel.app","http://localhost:3000"];
var ROLES_VALIDES = ["admin","gestionnaire","ca","coproprietaire"];

async function verifierAdmin(req){
  var auth = req.headers.authorization || "";
  var token = auth.indexOf("Bearer ") === 0 ? auth.slice(7) : "";
  if(!token || token === SB_ANON) return null;
  try{
    var r = await fetch(SB_URL + "/auth/v1/user", {headers: {"apikey": SB_ANON, "Authorization": "Bearer " + token}});
    if(!r.ok) return null;
    var u = await r.json();
    if(!u || !u.id) return null;
    var role = (u.user_metadata && u.user_metadata.role) || "";
    return role === "admin" ? u : null;
  }catch(e){ return null; }
}

module.exports = async function(req, res){
  var origin = req.headers.origin || "";
  res.setHeader("Access-Control-Allow-Origin", ORIGINS.indexOf(origin) >= 0 ? origin : ORIGINS[0]);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if(req.method === "OPTIONS") return res.status(200).end();
  if(req.method !== "POST") return res.status(405).json({error:"POST uniquement"});

  var svc = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if(!svc) return res.status(500).json({error:"SUPABASE_SERVICE_ROLE_KEY non configuree dans Vercel"});

  var admin = await verifierAdmin(req);
  if(!admin) return res.status(403).json({error:"Acces reserve aux administrateurs. Reconnectez-vous."});

  var H = {"Content-Type":"application/json","apikey":svc,"Authorization":"Bearer "+svc};
  var action = (req.body && req.body.action) || "";

  if(action === "create"){
    var courriel = ((req.body && req.body.courriel) || "").trim().toLowerCase();
    var nom = ((req.body && req.body.nom) || "").trim();
    var prenom = ((req.body && req.body.prenom) || "").trim();
    var role = ((req.body && req.body.role) || "gestionnaire").trim();
    if(ROLES_VALIDES.indexOf(role) < 0) role = "gestionnaire";
    if(!courriel || courriel.indexOf("@") < 0) return res.status(400).json({error:"Courriel invalide"});
    try{
      var r = await fetch(SB_URL + "/auth/v1/invite", {
        method: "POST", headers: H,
        body: JSON.stringify({email: courriel, data: {nom: (prenom + " " + nom).trim() || courriel, role: role}})
      });
      var d = await r.json();
      if(!r.ok) return res.status(400).json({error: d.msg || d.error_description || d.message || "Erreur lors de la creation"});
      return res.status(200).json({ok:true, auth_id: d.id, courriel: courriel});
    }catch(e){
      return res.status(500).json({error:"Erreur serveur: " + e.message});
    }
  }

  if(action === "toggle"){
    var authId = (req.body && req.body.auth_id) || "";
    var actif = !!(req.body && req.body.actif);
    if(!authId) return res.status(400).json({error:"auth_id requis"});
    if(authId === admin.id && !actif) return res.status(400).json({error:"Impossible de desactiver votre propre compte"});
    try{
      var r2 = await fetch(SB_URL + "/auth/v1/admin/users/" + authId, {
        method: "PUT", headers: H,
        body: JSON.stringify({ban_duration: actif ? "none" : "876000h"})
      });
      var d2 = await r2.json();
      if(!r2.ok) return res.status(400).json({error: d2.msg || d2.error_description || d2.message || "Erreur lors du changement"});
      return res.status(200).json({ok:true});
    }catch(e){
      return res.status(500).json({error:"Erreur serveur: " + e.message});
    }
  }

  return res.status(400).json({error:"Action inconnue. Utilisez: create, toggle"});
};

module.exports.config = { api: { bodyParser: { sizeLimit: "100kb" } } };
