// Predictek - API chiffrement NAS (AES-256-GCM)
// La cle NAS_SECRET_KEY doit etre definie dans les variables d'environnement Vercel.
// SECURITE: cet endpoint ne DECHIFFRE JAMAIS un NAS complet vers le client.
// Le dechiffrement complet se fera uniquement dans les API serveur (ex: generation T4).

var crypto = require("crypto");

function getKey(){
  var hex = process.env.NAS_SECRET_KEY || "";
  if(hex.length !== 64) return null;
  return Buffer.from(hex, "hex");
}

// Validation Luhn (le NAS canadien utilise l'algorithme de Luhn)
function validerNAS(nas){
  var digits = nas.replace(/\D/g, "");
  if(digits.length !== 9) return false;
  var sum = 0;
  for(var i = 0; i < 9; i++){
    var d = parseInt(digits[i], 10);
    if(i % 2 === 1){
      d = d * 2;
      if(d > 9) d = d - 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function chiffrer(nas, key){
  var iv = crypto.randomBytes(12);
  var cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  var enc = Buffer.concat([cipher.update(nas, "utf8"), cipher.final()]);
  var tag = cipher.getAuthTag();
  var payload = {
    v: 1,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: enc.toString("base64")
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// Dechiffrement INTERNE seulement - exporte pour usage par d'autres API serveur (T4)
function dechiffrer(encrypted, key){
  var payload = JSON.parse(Buffer.from(encrypted, "base64").toString("utf8"));
  var decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(payload.iv, "base64"));
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(payload.data, "base64")), decipher.final()]).toString("utf8");
}

// SECURITE: cet endpoint exige un jeton de session Supabase valide (connexion requise).
var SB_URL = "https://yzbauupamxbwcnnuiunf.supabase.co";
var SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YmF1dXBhbXhid2NubnVpdW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzY0NzIsImV4cCI6MjA5MjgxMjQ3Mn0.ZcoZtbeej2wol4TFyuOUg4vv8QVAI5efKlWbLu4H6L4";
var ORIGINS = ["https://predictek-d9sy.vercel.app","http://localhost:3000"];

async function verifierJeton(req){
  var auth = req.headers.authorization || "";
  var token = auth.indexOf("Bearer ") === 0 ? auth.slice(7) : "";
  if(!token || token === SB_ANON) return null;
  try{
    var r = await fetch(SB_URL + "/auth/v1/user", {headers: {"apikey": SB_ANON, "Authorization": "Bearer " + token}});
    if(!r.ok) return null;
    var u = await r.json();
    return u && u.id ? u : null;
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

  var usager = await verifierJeton(req);
  if(!usager) return res.status(401).json({error:"Connexion requise. Veuillez vous reconnecter."});

  var key = getKey();
  if(!key) return res.status(500).json({error:"NAS_SECRET_KEY non configuree dans Vercel (64 caracteres hex requis)"});

  var action = (req.body && req.body.action) || "";

  if(action === "encrypt"){
    var nas = ((req.body && req.body.nas) || "").replace(/\D/g, "");
    if(nas.length !== 9) return res.status(400).json({error:"NAS invalide: 9 chiffres requis"});
    if(!validerNAS(nas)) return res.status(400).json({error:"NAS invalide: echec de la validation (verifiez les chiffres)"});
    try{
      var encrypted = chiffrer(nas, key);
      return res.status(200).json({
        encrypted: encrypted,
        masked: "***-***-" + nas.slice(6),
        valid: true
      });
    }catch(e){
      return res.status(500).json({error:"Erreur chiffrement: " + e.message});
    }
  }

  if(action === "verify"){
    // Verifie qu'un blob chiffre est lisible et retourne la version masquee (jamais le NAS complet)
    var enc = (req.body && req.body.encrypted) || "";
    if(!enc) return res.status(400).json({error:"Champ encrypted requis"});
    try{
      var nasClair = dechiffrer(enc, key);
      return res.status(200).json({masked: "***-***-" + nasClair.slice(6), valid: validerNAS(nasClair)});
    }catch(e){
      return res.status(400).json({error:"Blob illisible ou cle incorrecte"});
    }
  }

  return res.status(400).json({error:"Action inconnue. Utilisez: encrypt, verify"});
};

module.exports.config = { api: { bodyParser: { sizeLimit: "100kb" } } };
