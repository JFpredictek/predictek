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

module.exports = async function(req, res){
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if(req.method === "OPTIONS") return res.status(200).end();
  if(req.method !== "POST") return res.status(405).json({error:"POST uniquement"});

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
