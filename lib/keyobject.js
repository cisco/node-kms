/**!
 * lib/keyobject.js -- KMS Key Representation
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
 "use strict";

var cloneDeep = require("lodash.clonedeep"),
    jose = require("node-jose");

function KMSKeyObject(rep) {
  rep = cloneDeep(rep || {});
  // coerce date fields
  ["createDate", "expirationDate", "bindDate"].forEach(function(f) {
    if (f in rep && rep[f]) {
      rep[f] = "string" === typeof rep[f] ?
               new Date(Date.parse(rep[f])) :
               rep[f];
    }
  });

  Object.defineProperty(this, "uri", {
    get: function() { return rep.uri || ""; },
    enumerable: true
  });
  Object.defineProperty(this, "jwk", {
    get: function() { return rep.jwk || undefined; },
    enumerable: true
  });
  Object.defineProperty(this, "userId", {
    get: function() { return rep.userId || ""; },
    enumerable: true
  });
  Object.defineProperty(this, "clientId", {
    get: function() { return rep.clientId || ""; },
    enumerable: true
  });
  Object.defineProperty(this, "createDate", {
    get: function() { return rep.createDate || undefined; },
    enumerable: true
  });
  Object.defineProperty(this, "expirationDate", {
    get: function() { return rep.expirationDate || undefined; },
    enumerable: true
  });
  Object.defineProperty(this, "bindDate", {
    get: function() { return rep.bindDate || undefined; },
    enumerable: true
  });
  Object.defineProperty(this, "resourceUri", {
    get: function() { return rep.resourceUri || ""; },
    enumerable: true
  });
}

// ### Instance Methods ###
KMSKeyObject.prototype.asKey = function() {
  if (!this.jwk) {
    return Promise.reject(new Error("'jwk' not set"));
  }
  return jose.JWK.asKey(this.jwk);
};

KMSKeyObject.prototype.toJSON = function() {
  var self = this,
      json = {};
  Object.keys(this).forEach(function(f) {
    var v = self[f];
    if ("function" === typeof v || "undefined" === typeof v) {
      return;
    }
    if (v instanceof Date) {
      v = v.toISOString();
    }
    json[f] = cloneDeep(v);
  });

  return json;
};

// ### Class Functions ###
KMSKeyObject.fromObject = function(rep) {
  if (!rep) {
    throw new TypeError("representation required");
  }
  if (rep instanceof KMSKeyObject) {
    return rep;
  }
  return new KMSKeyObject(rep);
};

module.exports = KMSKeyObject;
