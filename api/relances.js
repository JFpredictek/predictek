// Predictek - Moteur de relances automatiques
// Declenche chaque jour par le cron Vercel (voir vercel.json) OU manuellement par un admin.
// PRINCIPE: les REGLES (dates, montants, seuils) decident qui est relance - deterministe et auditable.
// L IA (Claude) ne fait que REDIGER les courriels et le resume quotidien a l administrateur.
// SECURITE ESSAIS: tant que RELANCES_MODE n est pas "production" dans Vercel,
// TOUS les courriels sont rediriges vers EMAIL_ADMIN (aucun coproprietaire reel ne recoit rien).

var SB_URL = "https://yzbauupamxbwcnnuiunf.supabase.co";
var SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YmF1dXBhbXhid2NubnVpdW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzY0NzIsImV4cCI6MjA5MjgxMjQ3Mn0.ZcoZtbeej2wol4TFyuOUg4vv8QVAI5efKlWbLu4H6L4";

function svcHeaders(svc){return {"Content-Type":"application/json","apikey":svc,"Authorization":"Bearer "+svc,"Prefer":"return=representation"};}

async function sbGet(svc, path){
  try{
    var r = await fetch(SB_URL + "/rest/v1/" + path, {headers: svcHeaders(svc)});
    if(!r.ok) return [];
    var d = await r.json();
    return Array.isArray(d) ? d : [];
  }catch(e){ return []; }
}

async function sbPost(svc, table, row){
  try{
    var r = await fetch(SB_URL + "/rest/v1/" + table, {method:"POST", headers: svcHeaders(svc), body: JSON.stringify(row)});
    return r.ok;
  }catch(e){ return false; }
}

async function verifierAdmin(req){
  var auth = req.headers.authorization || "";
  var token = auth.indexOf("Bearer ") === 0 ? auth.slice(7) : "";
  if(!token || token === SB_ANON) return null;
  try{
    var r = await fetch(SB_URL + "/auth/v1/user", {headers: {"apikey": SB_ANON, "Authorization": "Bearer " + token}});
    if(!r.ok) return null;
    var u = await r.json();
    if(!u || !u.id) return null;
    return ((u.user_metadata && u.user_metadata.role) || "") === "admin" ? u : null;
  }catch(e){ return null; }
}

async function redigerIA(apiKey, consigne){
  try{
    var r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},
      body: JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:700,messages:[{role:"user",content:consigne}]})
    });
    var d = await r.json();
    if(d && d.content && d.content[0] && d.content[0].text) return d.content[0].text;
  }catch(e){}
  return null;
}

async function envoyerCourriel(cfg, destReel, sujet, corps){
  var to = cfg.production ? destReel : cfg.admin;
  var sujetFinal = cfg.production ? sujet : "[TEST - destinataire reel: " + destReel + "] " + sujet;
  try{
    var r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {"Content-Type":"application/json","Authorization":"Bearer " + cfg.resendKey},
      body: JSON.stringify({from: cfg.from, to: [to], subject: sujetFinal, text: corps})
    });
    return r.ok;
  }catch(e){ return false; }
}

module.exports = async function(req, res){
  // Acces: cron Vercel (CRON_SECRET) OU administrateur connecte
  var auth = req.headers.authorization || "";
  var cronOk = !!(process.env.CRON_SECRET && auth === "Bearer " + process.env.CRON_SECRET);
  var admin = null;
  if(!cronOk) admin = await verifierAdmin(req);
  if(!cronOk && !admin) return res.status(403).json({error:"Acces refuse (cron ou admin requis)"});

  var svc = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if(!svc) return res.status(500).json({error:"SUPABASE_SERVICE_ROLE_KEY manquante dans Vercel"});
  var resendKey = process.env.RESEND_API_KEY || "";
  var adminEmail = process.env.EMAIL_ADMIN || "jflaroche@cgocable.ca";
  var cfg = {
    resendKey: resendKey,
    from: process.env.EMAIL_FROM || "Predictek <onboarding@resend.dev>",
    admin: adminEmail,
    production: (process.env.RELANCES_MODE || "") === "production"
  };

  var maintenant = new Date();
  var iso = maintenant.toISOString().substring(0,10);
  var mois = iso.substring(0,7);
  var jourDuMois = parseInt(iso.substring(8,10), 10);

  var syndicats = await sbGet(svc, "syndicats?select=id,nom,code");
  var synMap = {}; syndicats.forEach(function(s){synMap[s.id]=s;});
  var copros = await sbGet(svc, "coproprietaires?select=*&statut=eq.actif&limit=2000");
  var paiements = await sbGet(svc, "paiements?select=coproprietaire_id,statut&date_paiement=gte." + mois + "-01&limit=5000");
  var dejaRaw = await sbGet(svc, "relances_envoyees?select=cle&limit=10000");
  var deja = {}; dejaRaw.forEach(function(x){deja[x.cle]=true;});

  var aEnvoyer = [];

  copros.forEach(function(c){
    if(!c.courriel) return;
    var syn = synMap[c.syndicat_id] || {nom:"votre syndicat", code:""};

    // REGLE 1 - Cotisation du mois non recue: rappels J+5, J+15, J+30
    if(Number(c.cotisation_mensuelle) > 0){
      var paye = paiements.some(function(pm){return pm.coproprietaire_id === c.id && (pm.statut||"") !== "annule";});
      if(!paye){
        var niveau = jourDuMois >= 30 ? "j30" : jourDuMois >= 15 ? "j15" : jourDuMois >= 5 ? "j5" : null;
        if(niveau){
          var cle = "cot_" + niveau + "_" + c.id + "_" + mois;
          if(!deja[cle]) aEnvoyer.push({
            type: "cotisation_" + niveau, cle: cle, copro: c, syn: syn,
            sujet: "[" + syn.nom + "] Rappel - cotisation de " + mois + " en attente (unite " + (c.unite||"") + ")",
            contexte: "la cotisation mensuelle de " + Number(c.cotisation_mensuelle).toFixed(2) + " $ pour le mois " + mois + " n a pas encore ete recue (rappel " + niveau.replace("j","J+") + ")"
          });
        }
      }
    }

    // REGLE 2 - Assurance responsabilite: rappels a 90 jours, 30 jours, et expiree
    if(c.assurance_exp){
      var jours = Math.ceil((new Date(c.assurance_exp) - maintenant) / 86400000);
      var typeA = jours < 0 ? "assurance_expiree" : jours <= 30 ? "assurance_30" : jours <= 90 ? "assurance_90" : null;
      if(typeA){
        var cleA = typeA + "_" + c.id + "_" + c.assurance_exp;
        if(!deja[cleA]) aEnvoyer.push({
          type: typeA, cle: cleA, copro: c, syn: syn,
          sujet: "[" + syn.nom + "] " + (jours < 0 ? "Votre preuve d assurance est EXPIREE" : "Votre assurance expire dans " + jours + " jours") + " (unite " + (c.unite||"") + ")",
          contexte: "l assurance responsabilite de l unite " + (jours < 0 ? "est expiree depuis le " + c.assurance_exp : "expire le " + c.assurance_exp) + "; une preuve d assurance valide doit etre transmise au syndicat"
        });
      }
    }
  });

  var apiKey = process.env.ANTHROPIC_API_KEY || "";
  var resultats = [];
  var MAX_PAR_JOUR = 50; // garde-fou

  for(var i = 0; i < aEnvoyer.length && i < MAX_PAR_JOUR; i++){
    var rl = aEnvoyer[i];
    var corps = null;
    if(apiKey){
      corps = await redigerIA(apiKey,
        "Redige un court courriel professionnel et courtois en francais quebecois (5 a 8 phrases, texte brut sans mise en forme), adresse a "
        + ((rl.copro.prenom||"") + " " + (rl.copro.nom||"")).trim()
        + ", coproprietaire de l unite " + (rl.copro.unite||"") + ". Objet du rappel: " + rl.contexte
        + ". Ton ferme mais respectueux. N invente aucun montant, numero ou date autre que ceux fournis. Termine par: Le Conseil d administration, "
        + rl.syn.nom + " (message automatise par Predictek). Reponds UNIQUEMENT avec le texte du courriel.");
    }
    if(!corps){
      corps = "Madame, Monsieur " + (rl.copro.nom||"") + ",\n\nCeci est un rappel: " + rl.contexte
        + ".\n\nMerci de regulariser la situation dans les meilleurs delais.\n\nLe Conseil d administration, " + rl.syn.nom
        + "\n(Message automatise par Predictek)";
    }
    var ok = resendKey ? await envoyerCourriel(cfg, rl.copro.courriel, rl.sujet, corps) : false;
    await sbPost(svc, "relances_envoyees", {
      syndicat_id: rl.copro.syndicat_id, coproprietaire_id: rl.copro.id, type: rl.type, cle: rl.cle,
      courriel: rl.copro.courriel, sujet: rl.sujet,
      statut: resendKey ? (ok ? "envoyee" : "echec") : "simulee",
      detail: cfg.production ? "" : "mode test: redirige vers " + adminEmail
    });
    await sbPost(svc, "historique", {
      utilisateur_nom: "Moteur de relances", categorie: "relances", action: rl.type,
      description: rl.sujet, details: "", syndicat_code: rl.syn.code || ""
    });
    resultats.push({type: rl.type, courriel: rl.copro.courriel, envoye: ok});
  }

  // Resume quotidien a l administrateur
  if(resendKey && resultats.length > 0){
    var resume = "Rapport du moteur de relances Predictek - " + iso + "\n\n"
      + resultats.length + " relance(s):\n"
      + resultats.map(function(x){return "- " + x.type + " -> " + x.courriel + (x.envoye ? "" : " (ECHEC D ENVOI)");}).join("\n")
      + (cfg.production ? "" : "\n\nMODE TEST ACTIF: tous les courriels ont ete rediriges vers " + adminEmail + ". Pour l envoi reel aux coproprietaires, ajouter RELANCES_MODE=production dans Vercel.");
    if(apiKey){
      var resumeIA = await redigerIA(apiKey, "Voici le rapport brut du moteur de relances d un logiciel de gestion de copropriete quebecois:\n\n" + resume + "\n\nRedige pour l administrateur un resume clair en francais (maximum 10 lignes) avec les points d attention (echecs, escalades J+30, assurances expirees). Reponds uniquement avec le resume.");
      if(resumeIA) resume = resumeIA + "\n\n--- Rapport brut ---\n" + resume;
    }
    await envoyerCourriel({resendKey: resendKey, from: cfg.from, admin: adminEmail, production: false}, adminEmail, "[Predictek] Rapport de relances - " + iso + " (" + resultats.length + ")", resume);
  }

  return res.status(200).json({
    ok: true, date: iso, coproprietaires_analyses: copros.length,
    relances: resultats.length, mode: cfg.production ? "production" : "test",
    envoi_configure: !!resendKey, details: resultats
  });
};

module.exports.config = { api: { bodyParser: { sizeLimit: "100kb" } } };
