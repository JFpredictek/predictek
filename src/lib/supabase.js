// lib/supabase.js - Connexion centrale Supabase
// Remplacez SUPABASE_URL et SUPABASE_ANON_KEY par vos valeurs

var SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";
var SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

// Client Supabase leger (sans SDK - appels fetch directs)
var sb = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
  token: null,

  headers: function() {
    var h = {
      "Content-Type": "application/json",
      "apikey": this.key,
      "Authorization": "Bearer " + (this.token || this.key),
      "Prefer": "return=representation"
    };
    return h;
  },

  // SELECT
  from: function(table) {
    var self = this;
    var _filters = [];
    var _select = "*";
    var _order = null;
    var _limit = null;

    var q = {
      select: function(cols) { _select = cols || "*"; return q; },
      eq: function(col, val) { _filters.push(col + "=eq." + encodeURIComponent(val)); return q; },
      order: function(col, opts) { _order = col + (opts && opts.ascending === false ? ".desc" : ".asc"); return q; },
      limit: function(n) { _limit = n; return q; },
      then: function(resolve, reject) {
        var url = self.url + "/rest/v1/" + table + "?select=" + _select;
        if(_filters.length) url += "&" + _filters.join("&");
        if(_order) url += "&order=" + _order;
        if(_limit) url += "&limit=" + _limit;
        fetch(url, { headers: self.headers() })
          .then(function(r) { return r.json(); })
          .then(function(data) { resolve({ data: data, error: null }); })
          .catch(function(e) { resolve({ data: null, error: e }); });
        return q;
      }
    };
    return q;
  },

  // INSERT
  insert: function(table, rows) {
    var self = this;
    var data = Array.isArray(rows) ? rows : [rows];
    return fetch(self.url + "/rest/v1/" + table, {
      method: "POST",
      headers: self.headers(),
      body: JSON.stringify(data)
    }).then(function(r) { return r.json(); })
      .then(function(d) { return { data: d, error: null }; })
      .catch(function(e) { return { data: null, error: e }; });
  },

  // UPDATE
  update: function(table, id, changes) {
    var self = this;
    return fetch(self.url + "/rest/v1/" + table + "?id=eq." + id, {
      method: "PATCH",
      headers: self.headers(),
      body: JSON.stringify(changes)
    }).then(function(r) { return r.json(); })
      .then(function(d) { return { data: d, error: null }; })
      .catch(function(e) { return { data: null, error: e }; });
  },

  // DELETE
  delete: function(table, id) {
    var self = this;
    return fetch(self.url + "/rest/v1/" + table + "?id=eq." + id, {
      method: "DELETE",
      headers: self.headers()
    }).then(function(r) { return { data: null, error: null }; })
      .catch(function(e) { return { data: null, error: e }; });
  },

  // AUTH - Connexion
  signIn: function(email, password) {
    var self = this;
    return fetch(self.url + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": self.key },
      body: JSON.stringify({ email: email, password: password })
    }).then(function(r) { return r.json(); })
      .then(function(d) {
        if(d.access_token) {
          self.token = d.access_token;
          try { localStorage.setItem("predictek_token", d.access_token);
                localStorage.setItem("predictek_user", JSON.stringify(d.user)); } catch(e) {}
          return { data: d, error: null };
        }
        return { data: null, error: { message: d.error_description || "Connexion echouee" } };
      })
      .catch(function(e) { return { data: null, error: e }; });
  },

  // AUTH - Deconnexion
  signOut: function() {
    this.token = null;
    try { localStorage.removeItem("predictek_token"); localStorage.removeItem("predictek_user"); } catch(e) {}
  },

  // AUTH - Recuperer session
  getSession: function() {
    try {
      var token = localStorage.getItem("predictek_token");
      var user = JSON.parse(localStorage.getItem("predictek_user") || "null");
      if(token && user) { this.token = token; return { token: token, user: user }; }
    } catch(e) {}
    return null;
  }
};

export default sb;
