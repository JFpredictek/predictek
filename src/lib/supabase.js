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
      localStorage.removeItem("predictek_user");
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
