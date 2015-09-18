/**!
 * lib/keyobject.js -- KMS Key Representation
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
 "use strict";

var jose = require("node-jose"),
    uuid = require("uuid");

var KMS = {
  KeyObject: require("./keyobject")
};

function KMSContext() {
  var sharedKey = null,
      clientInfo = {},
      serverInfo = {};

  Object.defineProperty(this, "ephemeralKey", {
    get: function() {
      // TODO: honor expiration
      return sharedKey;
    },
    set: function(key) {
      sharedKey = key ?
                  KMS.KeyObject.fromObject(key) :
                  null;
    },
    enumerable: true
  });
  Object.defineProperty(this, "clientInfo", {
    get: function() { return clientInfo; },
    set: function(info) {
      // TODO: validate client info
      clientInfo = info || {};
    },
    enumerable: true
  });
  Object.defineProperty(this, "serverInfo", {
    get: function() { return serverInfo; },
    set: function(info) {
      // TODO: validate server info
      serverInfo = info || {};
    },
    enumerable: true
  });

  Object.defineProperty(this, "requestId", {
    value: function() {
      return uuid();
    }
  });
}

KMSContext.prototype.createECDHKey = function() {
  var clientInfo = this.clientInfo;
  var ks = jose.JWK.createKeyStore();

  // TODO: make this more configurable
  var keyType = "EC",
      keyOrder = "P-256",
      expiresIn = 3600000;
  var promise = ks.generate(keyType, keyOrder);
  promise = promise.then(function(k) {
    var ts = new Date();
    var rep = {
     uri: "-internal/" + k.kid,
     jwk: k.toJSON(true),
     userId: (clientInfo && clientInfo.credential && clientInfo.credential.userId) ||
             "",
     clientId: (clientInfo && clientInfo.clientId) ||
               "",
     createDate: ts,
     expirationDate: new Date(ts.getTime() + expiresIn)
    };

    return new KMS.KeyObject(rep);
  });
  return promise;
};

KMSContext.prototype.deriveEphemeralKey = function(remote) {
  var local = this.ephemeralKey;
  if (!local || !local.jwk || "EC" !== local.jwk.kty) {
    return Promise.reject(new Error("invalid local ECDH key"));
  }
  remote = KMS.KeyObject.fromObject(remote);

  var promise;
  promise = Promise.all([local.asKey(), remote.asKey()]);
  promise = promise.then(function(keys) {
    var lkey = keys[0],
        rkey = keys[1];
    var props = {
      public: rkey.toObject()
    };
    var k = lkey.toObject(true);
    return jose.JWA.derive("ECDH-HKDF", k, props);
  });
  promise = promise.then(function(result) {
    var uri = remote.uri,
        created = remote.createDate,
        expires = remote.expirationDate;
    var shared = {
      uri: uri,
      createDate: created,
      expirationDate: expires,
      jwk: {
        kty: "oct",
        kid: uri,
        alg: "A256GCM",
        k: jose.util.base64url.encode(result)
      }
    };
    return new KMS.KeyObject(shared);
  });
  return promise;
};

module.exports = KMSContext;
