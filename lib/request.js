/**!
 * lib/request.js -- KMS (Generic) Request
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
 "use strict";

var clone = require("lodash.clone"),
    jose = require("node-jose");

function KMSRequest(body) {
  var wrapped = "";
  body = (body && clone(body)) || {};

  Object.defineProperty(this, "wrapped", {
    get: function() { return wrapped; },
    set: function(w) { wrapped = String(w || ""); },
    enumerable: true
  });
  Object.defineProperty(this, "body", {
    get: function() { return body; },
    set: function(b) {
      b = (b && clone(b)) || {};

      // carry forward requestId
      if ("requestId" in body) {
        b.requestId = body.requestId;
      }
      // carry forward uri
      if ("uri" in body) {
        b.uri = body.uri;
      }
      // carry forward method
      if ("method" in body) {
        b.method = body.method;
      }
      // clear any wrapped, then save
      wrapped = "";
      body = b;
    },
    enumerable: true
  });

  Object.defineProperty(this, "requestId", {
    get: function() { return body.requestId || ""; },
    set: function(id) {
      if (!id) {
        delete body.requestId;
      } else {
        body.requestId = id;
      }
    },
    enumerable: true
  });
  Object.defineProperty(this, "uri", {
    get: function() { return body.uri || ""; },
    set: function(uri) {
      if (!uri) {
        delete body.uri;
      } else {
        body.uri = uri;
      }
    },
    enumerable: true
  });
  Object.defineProperty(this, "method", {
    get: function() { return body.method || ""; },
    set: function(method) {
      if (!method) {
        delete body.method;
      } else {
        body.method = method;
      }
    },
    enumerable: true
  });
}

KMSRequest.prototype.wrap = function(ctx, opts) {
  opts = opts || {};

  // TODO: make this more configurable
  var self = this,
      promise;

  // set the requestId if not already set
  if (!this.requestId || opts.requestId) {
    this.requestId = opts.requestId || ctx.requestId();
  }

  var body = this.body;
  body.client = ctx.clientInfo;

  // prepare the key
  if (opts.serverKey) {
    promise = jose.JWK.asKey(ctx.serverInfo.key);
  } else {
    promise = ctx.ephemeralKey.asKey();
  }
  promise = promise.then(function(jwk) {
    var key = jwk;
    var cfg = {
      compact: true,
      contentAlg: opts.contentAlg || "A256GCM"
    };
    var jwe = jose.JWE.createEncrypt(cfg, key);
    return jwe.final(JSON.stringify(self.body), "utf8");
  });
  promise = promise.then(function(result) {
    // save wrapped
    self.wrapped = result;
    return result;
  });
  return promise;
};

module.exports = KMSRequest;
