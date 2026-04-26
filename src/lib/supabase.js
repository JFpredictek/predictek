// Predictek - Client Supabase leger (sans SDK npm)
var SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";
var SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

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

  // SELECT rows
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

  // SELECT single row
  selectOne: async function(table, opts) {
    var res = await this.select(table, Object.assign({}, opts, {limit: 1}));
    return {data: res.data && res.data[0] ? res.data[0] : null, error: res.error};
  },

  // INSERT
  insert: async function(table, row) {
    try {
      var r = await fetch(this._rest(table), {
        method: "POST", headers: this._h(), body: JSON.stringify(row)
      });
      var d = await r.json();
      return {data: Array.isArray(d) ? d[0] : d, error: d.message ? d : null};
    } catch(e) { return {data: null, error: e}; }
  },

  // UPDATE
  update: async function(table, id, changes) {
    try {
      var r = await fetch(this._rest(table) + "?id=eq." + id, {
        method: "PATCH", headers: this._h(), body: JSON.stringify(changes)
      });
      var d = await r.json();
      return {data: Array.isArray(d) ? d[0] : d, error: d.message ? d : null};
    } catch(e) { return {data: null, error: e}; }
  },

  // DELETE
  delete: async function(table, id) {
    try {
      await fetch(this._rest(table) + "?id=eq." + id, {
        method: "DELETE", headers: this._h()
      });
      return {error: null};
    } catch(e) { return {error: e}; }
  },

  // AUTH login
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
          localStorage.setItem("predictek_user", JSON.stringify({
            id: d.user.id, email: d.user.email,
            nom: d.user.user_metadata ? (d.user.user_metadata.nom || d.user.email) : d.user.email,
            role: d.user.user_metadata ? (d.user.user_metadata.role || "employe") : "employe"
          }));
        } catch(e) {}
        return {data: d, error: null};
      }
      return {data: null, error: {message: d.error_description || "Identifiants invalides"}};
    } catch(e) { return {data: null, error: {message: "Erreur de connexion au serveur"}}; }
  },

  // AUTH logout
  logout: function() {
    _token = null;
    try {
      localStorage.removeItem("predictek_token");
      localStorage.removeItem("predictek_user");
    } catch(e) {}
  },

  // Get current user
  getUser: function() {
    try {
      var u = localStorage.getItem("predictek_user");
      return u ? JSON.parse(u) : null;
    } catch(e) { return null; }
  },

  // Log to historique table
  log: async function(cat, action, description, details, syndicat_code) {
    var user = this.getUser();
    await this.insert("historique", {
      utilisateur_nom: user ? user.nom : "Systeme",
      categorie: cat || "systeme",
      action: action || "modification",
      description: description || "",
      details: details || "",
      syndicat_code: syndicat_code || ""
    });
  }
};

export default sb;
