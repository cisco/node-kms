/**!
 * lib/response.js -- KMS (Generic) Response
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
 "use strict";

var clone = require("lodash.clone"),
    jose = require("node-jose");

function KMSResponse(wrapped) {
  wrapped = wrapped || "";
  var body = {};

  Object.defineProperty(this, "wrapped", {
    get: function() { return wrapped; },
    set: function(w) {
      // clear existing body before saving wrapped
      body = {};
      wrapped = String(w || "");
    },
    enumerable: true
  });
  Object.defineProperty(this, "body", {
    get: function() { return body; },
    set: function(b) { body = (b && clone(b)) || {}; },
    enumerable: true
  });

  Object.defineProperty(this, "status", {
    get: function() { return body.status || 0; },
    set: function(s) {
      s = parseInt(s);
      if (!isNaN(s)) {
        body.status = s;
      }
    },
    enumerable: true
  });
  Object.defineProperty(this, "reason", {
    get: function() { return body.reason || ""; },
    set: function(r) { body.reason = String(r || ""); },
    enumerable: true
  });
  Object.defineProperty(this, "requestId", {
    get: function() { return body.requestId || ""; },
    set: function(id) { body.requestId = String(id || ""); },
    enumerable: true
  });
}

KMSResponse.prototype.unwrap = function(ctx, opts) {
  opts = opts || {};

  var keystore = jose.JWK.createKeyStore(),
      waiting = [],
      key;

  // add ephemeral key (if any)
  key = ctx.ephemeralKey && ctx.ephemeralKey.jwk;
  if (key) {
    waiting.push(keystore.add(key));
  }
  // add server key (if any)
  key = ctx.serverInfo && ctx.serverInfo.key;
  if (key) {
    waiting.push(keystore.add(key));
  }

  var self = this;
  var promise = Promise.all(waiting);
  promise = promise.then(function() {
    var wrapped = self.wrapped;
    // count the dots
    switch ((wrapped.match(/\./g) || []).length) {
      case 2:   // signed
        return jose.JWS.createVerify(keystore).
               verify(wrapped);
      case 4:   // encrypted
        return jose.JWE.createDecrypt(keystore).
               decrypt(wrapped);
      default:  // bogus
        return Promise.reject(new Error("invalid wrapped"));
    }
  });
  promise = promise.then(function(result) {
    // parse result to JSON
    result = (result.plaintext || result.payload).toString("utf8");
    result = JSON.parse(result);
    // save it before returning it
    self.body = result;
    return result;
  });
  return promise;
};

module.exports = KMSResponse;
