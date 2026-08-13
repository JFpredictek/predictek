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

  var syndicats = await sbGet(svc, "syndicats?select=id,nom,code,assurance_syndicat_exp,etude_assurance_date,etude_prevoyance_date,ass_avis_avant1,ass_avis_avant2,ass_avis_apres,ass_nc_auto,ass_nc_delai");
  var synMap = {}; syndicats.forEach(function(s){synMap[s.id]=s;});
  var copros = await sbGet(svc, "coproprietaires?select=*&statut=eq.actif&limit=2000");
  var unites = await sbGet(svc, "unites?select=*&limit=2000");
  var paiements = await sbGet(svc, "paiements?select=coproprietaire_id,statut&date_paiement=gte." + mois + "-01&limit=5000");
  var employes = await sbGet(svc, "employes?select=id,prenom,nom,poste,statut,permis_requis,permis_expiration&statut=eq.actif&limit=500");
  var assemblees = await sbGet(svc, "assemblees?select=id,syndicat_id,type,date_assemblee,statut,convocation_envoyee_le&statut=eq.planifiee&limit=200");
  var factAttente = await sbGet(svc, "factures?select=id,syndicat_id,fournisseur_nom,fournisseur,no_facture,total,montant,date_facture,statut&statut=eq.en_attente_approbation&limit=500");
  var avisConf = await sbGet(svc, "avis_conformite?select=id,syndicat_id,unite,coproprietaire_id,objet,echeance,statut,niveau&statut=eq.emis&limit=500");
  var membresCA = await sbGet(svc, "membres_ca?select=id,syndicat_id,prenom,nom,courriel,actif&actif=eq.true&limit=500");
  var configRaw = await sbGet(svc, "config_publique?select=cle,valeur");
  var cfgPub = {}; configRaw.forEach(function(x){cfgPub[x.cle]=x.valeur;});
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

  // REGLE 2b - Assurance au niveau de l UNITE: delais CONFIGURABLES par syndicat
  // (Configuration du syndicat). Rappel envoye a chaque proprietaire ACTIF de l unite;
  // apres l echeance + relance, un avis de non-conformite peut etre cree automatiquement.
  var avisNCACreer = [];
  unites.forEach(function(u){
    if(!u.assurance_exp) return;
    var syn = synMap[u.syndicat_id] || {nom:"votre syndicat", code:""};
    var avant1 = parseInt(syn.ass_avis_avant1, 10); if(!(avant1 >= 0)) avant1 = 90;
    var avant2 = parseInt(syn.ass_avis_avant2, 10); if(!(avant2 >= 0)) avant2 = 30;
    var apres = parseInt(syn.ass_avis_apres, 10); if(!(apres >= 0)) apres = 15;
    var jours = Math.ceil((new Date(u.assurance_exp) - maintenant) / 86400000);
    // Avis de non-conformite automatique: expiree depuis plus de (apres) jours
    if(jours <= -apres && syn.ass_nc_auto){
      var cleNC = "assnc_" + u.id + "_" + u.assurance_exp;
      if(!deja[cleNC]){
        avisNCACreer.push({cle: cleNC, u: u, syn: syn,
          delai: parseInt(syn.ass_nc_delai, 10) > 0 ? parseInt(syn.ass_nc_delai, 10) : 30});
      }
    }
    var typeA = jours < 0 ? "assurance_expiree" : jours <= avant2 ? "assurance_30" : jours <= avant1 ? "assurance_90" : null;
    if(!typeA) return;
    var proprietaires = copros.filter(function(c){return c.unite_id === u.id && c.courriel;});
    proprietaires.forEach(function(c){
      var cleU = typeA + "_" + c.id + "_" + u.assurance_exp;
      if(deja[cleU]) return;
      var dejaListe = aEnvoyer.some(function(x){return x.cle === cleU;});
      if(dejaListe) return;
      aEnvoyer.push({
        type: typeA, cle: cleU, copro: c, syn: syn,
        sujet: "[" + syn.nom + "] " + (jours < 0 ? "La preuve d assurance de l unite " + (u.no_unite||"") + " est EXPIREE" : "L assurance de l unite " + (u.no_unite||"") + " expire dans " + jours + " jours"),
        contexte: "l assurance responsabilite de l unite " + (u.no_unite||"") + " " + (jours < 0 ? "est expiree depuis le " + u.assurance_exp : "expire le " + u.assurance_exp) + "; une preuve d assurance valide doit etre transmise au syndicat"
      });
    });
  });

  // Creation des avis de non-conformite automatiques (assurance non fournie)
  for(var vNC = 0; vNC < avisNCACreer.length; vNC++){
    var nc = avisNCACreer[vNC];
    var prNC = copros.filter(function(c){return c.unite_id === nc.u.id || (!c.unite_id && c.unite === nc.u.no_unite);});
    var echNC = new Date(maintenant.getTime() + nc.delai * 86400000).toISOString().substring(0,10);
    var okNC = await sbPost(svc, "avis_conformite", {
      syndicat_id: nc.syn.id, unite: nc.u.no_unite || "",
      coproprietaire_id: (prNC[0] && prNC[0].id) || null,
      destinataire_nom: prNC.map(function(c){return ((c.prenom||"") + " " + (c.nom||"")).trim();}).join(" et "),
      objet: "Preuve d assurance non fournie",
      description: "La preuve d assurance de l unite " + (nc.u.no_unite||"") + " est expiree depuis le " + nc.u.assurance_exp + " et n a pas ete renouvelee malgre les avis. Transmettez votre certificat via le portail coproprietaire.",
      article_reglement: "Reglement de l immeuble - assurance obligatoire",
      niveau: "avis", date_avis: iso, echeance: echNC, statut: "emis",
      notes: "Genere automatiquement par le moteur de relances (configuration du syndicat)."
    });
    if(okNC){
      await sbPost(svc, "relances_envoyees", {syndicat_id: nc.syn.id, coproprietaire_id: (prNC[0] && prNC[0].id) || null,
        type: "assurance_nc_auto", cle: nc.cle, courriel: "", sujet: "Avis NC auto - assurance unite " + (nc.u.no_unite||""),
        statut: "creee", detail: "avis de non-conformite cree automatiquement, echeance " + echNC});
      await sbPost(svc, "historique", {utilisateur_nom: "Moteur de relances", categorie: "conformite", action: "creation",
        description: "Avis de non-conformite AUTOMATIQUE: assurance non fournie - unite " + (nc.u.no_unite||"") + " (echeance " + echNC + ")", details: "", syndicat_code: nc.syn.code || ""});
    }
  }

  // ============ ALERTES ADMINISTRATIVES (envoyees a l administrateur, jamais aux coproprietaires) ============
  var alertesAdmin = [];
  function ajouterMois(dateStr, nb){ var d = new Date(dateStr + "T12:00:00"); d.setMonth(d.getMonth() + nb); return d; }

  // REGLE 3 - Assurance du SYNDICAT: alerte a 90 jours, 30 jours, et expiree
  syndicats.forEach(function(s){
    if(!s.assurance_syndicat_exp) return;
    var j3 = Math.ceil((new Date(s.assurance_syndicat_exp) - maintenant) / 86400000);
    var niv3 = j3 < 0 ? "expiree" : j3 <= 30 ? "30j" : j3 <= 90 ? "90j" : null;
    if(!niv3) return;
    var cle3 = "ass_syn_" + niv3 + "_" + s.id + "_" + s.assurance_syndicat_exp;
    if(deja[cle3]) return;
    alertesAdmin.push({cle: cle3, type: "assurance_syndicat_" + niv3, syn: s,
      texte: "[" + s.nom + "] La police d assurance du SYNDICAT " + (j3 < 0 ? "est EXPIREE depuis le " + s.assurance_syndicat_exp : "expire dans " + j3 + " jours (le " + s.assurance_syndicat_exp + ")") + " - renouvellement a prevoir."});
  });

  // REGLE 4 - Etudes (assurance / prevoyance): appel d offres 6 mois avant l echeance de l intervalle
  var ansAss = parseInt(cfgPub.etude_assurance_ans, 10) || 5;
  var ansPrev = parseInt(cfgPub.etude_prevoyance_ans, 10) || 5;
  syndicats.forEach(function(s){
    [{d: s.etude_assurance_date, ans: ansAss, nom: "etude aux fins d assurance", t: "etude_assurance"},
     {d: s.etude_prevoyance_date, ans: ansPrev, nom: "etude du fonds de prevoyance (Loi 16)", t: "etude_prevoyance"}].forEach(function(e){
      if(!e.d || !/^\d{4}-\d{2}-\d{2}$/.test(e.d)) return;
      var seuil = ajouterMois(e.d, e.ans * 12 - 6);
      if(maintenant < seuil) return;
      var echeance = ajouterMois(e.d, e.ans * 12).toISOString().substring(0,10);
      var cle4 = e.t + "_" + s.id + "_" + e.d;
      if(deja[cle4]) return;
      alertesAdmin.push({cle: cle4, type: e.t + "_appel_offres", syn: s,
        texte: "[" + s.nom + "] Lancer l APPEL D OFFRES pour la prochaine " + e.nom + " : la derniere date du " + e.d + ", intervalle de " + e.ans + " ans (echeance vers le " + echeance + ")."});
    });
  });

  // REGLE 5 - Permis de conduire des employes (vehicule de compagnie): manquant, ou expire dans moins de 60 jours
  employes.forEach(function(emp){
    if(!emp.permis_requis) return;
    var nomEmp = ((emp.prenom||"") + " " + (emp.nom||"")).trim();
    if(!emp.permis_expiration){
      var cleM = "permis_manquant_" + emp.id + "_" + iso.substring(0,4);
      if(deja[cleM]) return;
      alertesAdmin.push({cle: cleM, type: "permis_manquant", syn: null,
        texte: "[Employes Predictek] " + nomEmp + " conduit un vehicule de compagnie mais la date d expiration de son permis est MANQUANTE - a valider (validation annuelle obligatoire)."});
      return;
    }
    var j5 = Math.ceil((new Date(emp.permis_expiration) - maintenant) / 86400000);
    if(j5 > 60) return;
    var cle5 = "permis_" + (j5 < 0 ? "expire" : "60j") + "_" + emp.id + "_" + emp.permis_expiration;
    if(deja[cle5]) return;
    alertesAdmin.push({cle: cle5, type: j5 < 0 ? "permis_expire" : "permis_60j", syn: null,
      texte: "[Employes Predictek] Le permis de conduire de " + nomEmp + " " + (j5 < 0 ? "est EXPIRE depuis le " + emp.permis_expiration : "expire dans " + j5 + " jours (le " + emp.permis_expiration + ")") + " - validation annuelle requise (vehicule de compagnie)."});
  });

  // REGLE 6 - Delai de convocation des assemblees: une assemblee PLANIFIEE (non convoquee)
  // doit etre convoquee au moins delai_convocation_jours avant sa date. Alerte a l approche du delai.
  var delaiConv = parseInt(cfgPub.delai_convocation_jours, 10) || 15;
  assemblees.forEach(function(a){
    if(!a.date_assemblee || a.convocation_envoyee_le) return;
    var syn6 = synMap[a.syndicat_id];
    var j6 = Math.ceil((new Date(a.date_assemblee + "T12:00:00") - maintenant) / 86400000);
    if(j6 < 0) return; // assemblee passee
    var marge = j6 - delaiConv; // jours restants avant que la convocation soit hors delai
    var niv6 = marge < 0 ? "hors_delai" : marge <= 3 ? "urgent" : marge <= 10 ? "approche" : null;
    if(!niv6) return;
    var cle6 = "convocation_" + niv6 + "_" + a.id;
    if(deja[cle6]) return;
    alertesAdmin.push({cle: cle6, type: "convocation_" + niv6, syn: syn6 || null,
      texte: "[" + (syn6 ? syn6.nom : "Syndicat") + "] Assemblee " + (a.type||"") + " du " + a.date_assemblee + " (dans " + j6 + " jours) NON CONVOQUEE - delai requis: " + delaiConv + " jours avant la date. "
        + (marge < 0 ? "DELAI DEPASSE de " + Math.abs(marge) + " jour(s): convoquez immediatement ou reportez l assemblee." : "Il reste " + marge + " jour(s) pour envoyer la convocation (module Assemblees).")});
  });

  // REGLE 8 - Avis de non-conformite: rappel au coproprietaire 3 jours avant l echeance,
  // et alerte ADMIN quand l echeance est depassee (un avis d infraction peut etre emis).
  avisConf.forEach(function(av){
    if(!av.echeance) return;
    var syn8 = synMap[av.syndicat_id] || {nom:"votre syndicat", code:""};
    var j8 = Math.ceil((new Date(av.echeance + "T12:00:00") - maintenant) / 86400000);
    var copro8 = copros.find(function(c){return c.id === av.coproprietaire_id && c.courriel;});
    if(j8 >= 0 && j8 <= 3 && copro8){
      var cle8 = "conf_rappel_" + av.id;
      if(!deja[cle8]) aEnvoyer.push({
        type: "conformite_rappel", cle: cle8, copro: copro8, syn: syn8,
        sujet: "[" + syn8.nom + "] RAPPEL - avis de non-conformite: echeance le " + av.echeance + " (unite " + (av.unite||"") + ")",
        contexte: "l avis de non-conformite concernant \"" + (av.objet||"") + "\" doit etre corrige au plus tard le " + av.echeance + "; a defaut, un avis d infraction pourra etre emis avec les penalites prevues au reglement de l immeuble"
      });
    }
    if(j8 < 0){
      var cle8b = "conf_echu_" + av.id;
      if(!deja[cle8b]) alertesAdmin.push({cle: cle8b, type: "conformite_echu", syn: syn8,
        texte: "[" + syn8.nom + "] Avis de non-conformite ECHU depuis " + Math.abs(j8) + " jour(s) - unite " + (av.unite||"") + ": " + (av.objet||"") + ". Un AVIS D INFRACTION peut etre emis (module Avis de non-conformite)."});
    }
  });

  // REGLE 7 - Factures en attente d approbation: courriel aux membres du CA (une fois par facture)
  var courrielsCA = [];
  syndicats.forEach(function(s7){
    var fs = factAttente.filter(function(f){return f.syndicat_id === s7.id;});
    if(fs.length === 0) return;
    var membres = membresCA.filter(function(m){return m.syndicat_id === s7.id && m.courriel;});
    if(membres.length === 0) return;
    var nouvelles = fs.filter(function(f){return !deja["approb_" + f.id];});
    if(nouvelles.length === 0) return;
    var listeTxt = fs.map(function(f){return "- " + (f.fournisseur_nom||f.fournisseur||"?") + (f.no_facture?" ("+f.no_facture+")":"") + " : " + (Number(f.total)||Number(f.montant)||0).toFixed(2) + " $" + (f.date_facture?" - facture du "+f.date_facture:"");}).join("\n");
    courrielsCA.push({syn: s7, membres: membres, nouvelles: nouvelles,
      sujet: "[" + s7.nom + "] " + fs.length + " facture(s) a approuver",
      corps: "Bonjour,\n\nDes factures attendent l approbation du conseil d administration dans Predictek:\n\n" + listeTxt
        + "\n\nConnectez-vous a Predictek (Finances - Payables - Factures) pour les approuver ou les rejeter.\n\nLe systeme Predictek (message automatise)"});
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

  // Envoi des courriels d approbation aux membres du CA
  var approbationsEnvoyees = 0;
  for(var q = 0; q < courrielsCA.length; q++){
    var cc = courrielsCA[q];
    var okCA = false;
    for(var mIx = 0; mIx < cc.membres.length; mIx++){
      var okM = resendKey ? await envoyerCourriel(cfg, cc.membres[mIx].courriel, cc.sujet, cc.corps) : false;
      okCA = okCA || okM;
    }
    for(var nIx = 0; nIx < cc.nouvelles.length; nIx++){
      var fN = cc.nouvelles[nIx];
      await sbPost(svc, "relances_envoyees", {
        syndicat_id: cc.syn.id, coproprietaire_id: null, type: "facture_approbation", cle: "approb_" + fN.id,
        courriel: cc.membres.map(function(m){return m.courriel;}).join(", ").substring(0,200), sujet: cc.sujet,
        statut: resendKey ? (okCA ? "envoyee" : "echec") : "simulee", detail: "avis aux " + cc.membres.length + " membre(s) du CA"
      });
      approbationsEnvoyees++;
    }
    await sbPost(svc, "historique", {
      utilisateur_nom: "Moteur de relances", categorie: "relances", action: "facture_approbation",
      description: cc.sujet + " - avis a " + cc.membres.length + " membre(s) du CA", details: "", syndicat_code: cc.syn.code || ""
    });
  }

  // Envoi des alertes administratives (un seul courriel groupe a l administrateur)
  var alertesEnvoyees = 0;
  if(alertesAdmin.length > 0){
    var corpsAlertes = "Alertes administratives Predictek - " + iso + "\n\n"
      + alertesAdmin.map(function(a){return "- " + a.texte;}).join("\n\n")
      + "\n\n(Message automatise par Predictek)";
    var okAl = resendKey ? await envoyerCourriel({resendKey: resendKey, from: cfg.from, admin: adminEmail, production: false}, adminEmail,
      "[Predictek] " + alertesAdmin.length + " alerte(s) administrative(s) - " + iso, corpsAlertes) : false;
    for(var k = 0; k < alertesAdmin.length; k++){
      var al = alertesAdmin[k];
      await sbPost(svc, "relances_envoyees", {
        syndicat_id: al.syn ? al.syn.id : null, coproprietaire_id: null, type: al.type, cle: al.cle,
        courriel: adminEmail, sujet: al.texte.substring(0, 200),
        statut: resendKey ? (okAl ? "envoyee" : "echec") : "simulee",
        detail: "alerte administrative"
      });
      await sbPost(svc, "historique", {
        utilisateur_nom: "Moteur de relances", categorie: "relances", action: al.type,
        description: al.texte, details: "", syndicat_code: al.syn ? (al.syn.code || "") : ""
      });
      alertesEnvoyees++;
    }
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
    relances: resultats.length, alertes_admin: alertesEnvoyees, avis_approbation: approbationsEnvoyees,
    mode: cfg.production ? "production" : "test",
    envoi_configure: !!resendKey, details: resultats,
    alertes: alertesAdmin.map(function(a){return a.texte;})
  });
};

module.exports.config = { api: { bodyParser: { sizeLimit: "100kb" } } };
