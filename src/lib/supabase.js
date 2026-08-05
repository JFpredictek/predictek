// Predictek - Client Supabase
var SUPABASE_URL = "https://yzbauupamxbwcnnuiunf.supabase.co";
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YmF1dXBhbXhid2NubnVpdW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzY0NzIsImV4cCI6MjA5MjgxMjQ3Mn0.ZcoZtbeej2wol4TFyuOUg4vv8QVAI5efKlWbLu4H6L4";

var _token = null;
try { _token = localStorage.getItem("predictek_token"); } catch(e) {}

var sb = {
  _h: function() {
    return {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + (_token || SUPABASE_KEY),
      "Prefer": "return=representation"
    };
  },
  _rest: function(table) {
    return SUPABASE_URL + "/rest/v1/" + table;
  },
  select: async function(table, opts) {
    var url = this._rest(table) + "?select=" + (opts && opts.cols ? opts.cols : "*");
    if(opts && opts.eq) {
      Object.keys(opts.eq).forEach(function(k) {
        url += "&" + k + "=eq." + encodeURIComponent(opts.eq[k]);
      });
    }
    if(opts && opts.order) url += "&order=" + opts.order;
    if(opts && opts.limit) url += "&limit=" + opts.limit;
    try {
      var r = await fetch(url, {headers: this._h()});
      var d = await r.json();
      return {data: Array.isArray(d) ? d : [], error: d.message ? d : null};
    } catch(e) { return {data: [], error: e}; }
  },
  selectOne: async function(table, opts) {
    var res = await this.select(table, Object.assign({}, opts, {limit: 1}));
    return {data: res.data && res.data[0] ? res.data[0] : null, error: res.error};
  },
  insert: async function(table, row) {
    try {
      var r = await fetch(this._rest(table), {
        method: "POST", headers: this._h(), body: JSON.stringify(row)
      });
      var d = await r.json();
      return {data: Array.isArray(d) ? d[0] : d, error: d.message ? d : null};
    } catch(e) { return {data: null, error: e}; }
  },
  update: async function(table, id, changes) {
    try {
      var r = await fetch(this._rest(table) + "?id=eq." + id, {
        method: "PATCH", headers: this._h(), body: JSON.stringify(changes)
      });
      var d = await r.json();
      return {data: Array.isArray(d) ? d[0] : d, error: d.message ? d : null};
    } catch(e) { return {data: null, error: e}; }
  },
  delete: async function(table, id) {
    try {
      await fetch(this._rest(table) + "?id=eq." + id, {
        method: "DELETE", headers: this._h()
      });
      return {error: null};
    } catch(e) { return {error: e}; }
  },
  // Insere ou met a jour selon la colonne de conflit (ex: syndicat_id)
  upsert: async function(table, rows, onConflict) {
    try {
      var url = this._rest(table) + (onConflict ? "?on_conflict=" + onConflict : "");
      var h = this._h();
      h["Prefer"] = "resolution=merge-duplicates,return=representation";
      var r = await fetch(url, {
        method: "POST", headers: h, body: JSON.stringify(rows)
      });
      var d = await r.json();
      return {data: Array.isArray(d) ? d : null, error: d && d.message ? d : null};
    } catch(e) { return {data: null, error: e}; }
  },
  login: async function(email, password) {
    try {
      var r = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: {"Content-Type":"application/json","apikey":SUPABASE_KEY},
        body: JSON.stringify({email: email, password: password})
      });
      var d = await r.json();
      if(d.access_token) {
        _token = d.access_token;
        try {
          localStorage.setItem("predictek_token", d.access_token);
          if(d.refresh_token) localStorage.setItem("predictek_refresh", d.refresh_token);
          localStorage.setItem("predictek_user", JSON.stringify({
            id: d.user.id,
            email: d.user.email,
            nom: d.user.user_metadata ? (d.user.user_metadata.nom || d.user.email) : d.user.email,
            role: d.user.user_metadata ? (d.user.user_metadata.role || "employe") : "employe"
          }));
        } catch(e) {}
        return {data: d, error: null};
      }
      return {data: null, error: {message: d.error_description || d.msg || "Identifiants invalides"}};
    } catch(e) { return {data: null, error: {message: "Erreur de connexion"}}; }
  },
  logout: function() {
    _token = null;
    try {
      localStorage.removeItem("predictek_token");
      localStorage.removeItem("predictek_refresh");
      localStorage.removeItem("predictek_user");
    } catch(e) {}
  },
  getToken: function() { return _token; },
  // En-tetes pour les appels aux API internes (/api/extract, /api/nas)
  apiHeaders: function() {
    var h = {"Content-Type": "application/json"};
    if(_token) h["Authorization"] = "Bearer " + _token;
    return h;
  },
  resetPassword: async function(email) {
    try {
      var r = await fetch(SUPABASE_URL + "/auth/v1/recover", {
        method: "POST",
        headers: {"Content-Type":"application/json","apikey":SUPABASE_KEY},
        body: JSON.stringify({email: email})
      });
      if(r.ok) return {error: null};
      var d = await r.json();
      return {error: {message: d.error_description || d.msg || "Erreur lors de l envoi"}};
    } catch(e) { return {error: {message: "Erreur de connexion"}}; }
  },
  // Televerse un fichier dans le coffre prive (bucket) Supabase Storage
  uploadFichier: async function(bucket, chemin, file) {
    try {
      var r = await fetch(SUPABASE_URL + "/storage/v1/object/" + bucket + "/" + chemin, {
        method: "POST",
        headers: {"apikey": SUPABASE_KEY, "Authorization": "Bearer " + (_token || SUPABASE_KEY), "x-upsert": "true", "Content-Type": file.type || "application/octet-stream"},
        body: file
      });
      if(r.ok) return {chemin: chemin, error: null};
      var d = await r.json();
      return {chemin: null, error: {message: (d && (d.message || d.error)) || "Erreur de televersement"}};
    } catch(e) { return {chemin: null, error: {message: "Erreur de connexion"}}; }
  },
  // Genere un lien temporaire (1 h) vers un fichier du coffre prive
  lienFichier: async function(bucket, chemin) {
    try {
      var r = await fetch(SUPABASE_URL + "/storage/v1/object/sign/" + bucket + "/" + chemin, {
        method: "POST", headers: this._h(), body: JSON.stringify({expiresIn: 3600})
      });
      var d = await r.json();
      if(d && d.signedURL) return SUPABASE_URL + "/storage/v1" + d.signedURL;
    } catch(e) {}
    return null;
  },
  // Definit un nouveau mot de passe a partir d un jeton de recuperation (lien courriel)
  setNewPassword: async function(recoveryToken, newPwd) {
    try {
      var r = await fetch(SUPABASE_URL + "/auth/v1/user", {
        method: "PUT",
        headers: {"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":"Bearer "+recoveryToken},
        body: JSON.stringify({password: newPwd})
      });
      var d = await r.json();
      if(r.ok) return {error: null};
      return {error: {message: d.error_description || d.msg || "Erreur lors du changement"}};
    } catch(e) { return {error: {message: "Erreur de connexion"}}; }
  },
  // Verifie la session au chargement: rafraichit le jeton s il est expire
  checkSession: async function() {
    if(!_token) return null;
    var exp = 0;
    try { exp = JSON.parse(atob(_token.split(".")[1])).exp || 0; } catch(e) {}
    var now = Math.floor(Date.now() / 1000);
    if(exp - now > 60) return this.getUser();
    var refresh = null;
    try { refresh = localStorage.getItem("predictek_refresh"); } catch(e) {}
    if(!refresh) { this.logout(); return null; }
    try {
      var r = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: {"Content-Type":"application/json","apikey":SUPABASE_KEY},
        body: JSON.stringify({refresh_token: refresh})
      });
      var d = await r.json();
      if(d.access_token) {
        _token = d.access_token;
        try {
          localStorage.setItem("predictek_token", d.access_token);
          if(d.refresh_token) localStorage.setItem("predictek_refresh", d.refresh_token);
        } catch(e) {}
        return this.getUser();
      }
    } catch(e) {}
    this.logout();
    return null;
  },
  setUser: function(user) {
    try {
      localStorage.setItem("predictek_user", JSON.stringify(user));
    } catch(e) {}
  },
  getUser: function() {
    try {
      var u = localStorage.getItem("predictek_user");
      return u ? JSON.parse(u) : null;
    } catch(e) { return null; }
  },
  log: async function(cat, action, description, details, syndicat_code) {
    var user = this.getUser();
    try {
      await this.insert("historique", {
        utilisateur_nom: user ? user.nom : "Systeme",
        categorie: cat || "systeme",
        action: action || "modification",
        description: description || "",
        details: details || "",
        syndicat_code: syndicat_code || ""
      });
    } catch(e) {}
  }
};

export default sb;
