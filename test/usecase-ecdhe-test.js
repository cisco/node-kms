/**
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
 "use strict";

var chai = require("chai"),
    clone = require("lodash.clone"),
    omit = require("lodash.omit"),
    jose = require("node-jose"),
    uuid = require("uuid").v4;

var assert = chai.assert;

var KMS = require("../");
var config = require("./config");

function decryptWithKey(key, input) {
  var promise;
  promise = jose.JWK.asKey(key);
  promise = promise.then(function(jwk) {
    var jwe = jose.JWE.createDecrypt(jwk);
    return jwe.decrypt(input);
  });
  promise = promise.then(function(result) {
    result = result.plaintext;
    result = result.toString("utf8");
    result = JSON.parse(result);
    return result;
  });
  return promise;
}
function signWithKey(key, input) {
  var opts = {
    compact: true
  };
  var signer = {
    header: {
      alg: "RS256"
    },
    key: key
  };
  input = JSON.stringify(input);
  input = new Buffer(input, "utf8");
  var jws = jose.JWS.createSign(opts, signer);
  return jws.final(input);
}

describe("KMS/use cases/ECDHE", function() {
  var clientCtx,
      serverCtx,
      channel;

  before(function() {
    clientCtx = new KMS.Context();
    clientCtx.clientInfo = omit(config.clientInfo, "key");
    clientCtx.serverInfo = {
      key: clone(config.serverInfo.cert)
    };

    serverCtx = new KMS.Context();

    channel = {
      request: null,
      response: null
    };
  });

  it("generates ECDH key", function() {
    var promise = clientCtx.createECDHKey();
    promise = promise.then(function(result) {
      assert.ok(result instanceof KMS.KeyObject);
      clientCtx.ephemeralKey = result;
    });
    return promise;
  });
  it("Creates and Wraps ECDHE Request", function() {
    var kmsReq = new KMS.Request({
      uri: "/echde",
      method: "create",
      jwk: clientCtx.ephemeralKey.jwk
    });
    var promise = kmsReq.wrap(clientCtx, {
      serverKey: true
    });
    promise = promise.then(function(wrapped) {
      assert.equal(wrapped, kmsReq.wrapped);
      channel.request = wrapped;
    });
    return promise;
  });
  it("pretends to be a KMS", function() {
    var promise,
        request;

    promise = Promise.resolve(channel.request);
    // Decrypt the ECDHE request
    promise = promise.then(function(r) {
      return decryptWithKey(config.serverInfo.key, r);
    });
    // Generate server ECDH key
    promise = promise.then(function(r) {
      request = r;

      var serverCtx = new KMS.Context();
      return serverCtx.createECDHKey();
    });
    // create and sign response
    promise = promise.then(function(localEcdhe) {
      var kid = "/ecdhe/" + uuid();
      var key = localEcdhe.toJSON();
      key.uri = kid;
      var json = {
        status: 201,
        requestId: request.requestId,
        key: key
      };
      serverCtx.ephemeralKey = key;
      return signWithKey(config.serverInfo.key, json);
    });
    // "send" response + calculate shared key
    promise = promise.then(function(response) {
      channel.response = response;

      var derive = [
        serverCtx.ephemeralKey.asKey(),
        jose.JWK.asKey(request.jwk)
      ];
      derive = Promise.all(derive);
      derive = derive.then(function(keys) {
        var local = keys[0].toObject(true),
            remote = keys[1].toObject();
        return jose.JWA.derive("ECDH-HKDF", local, { public: remote });
      });
      return derive;
    });
    // remember shared key in server context
    promise = promise.then(function(shared) {
      var key = serverCtx.ephemeralKey.toJSON();
      key.jwk = {
        kty: "oct",
        kid: key.uri,
        alg: "A256GCM",
        k: jose.util.base64url.encode(shared)
      };
      serverCtx.ephemeralKey = key;
    });

    return promise;
  });

  it("Unwraps and Uses ECDHE Response", function() {
    var wrapped = channel.response;

    var response = new KMS.Response(wrapped);
    var promise = response.unwrap(clientCtx);
    promise = promise.then(function(result) {
      return clientCtx.deriveEphemeralKey(result.key);
    });
    promise = promise.then(function(shared) {
      var expected = serverCtx.ephemeralKey;
      assert.deepEqual(shared.jwk, expected.jwk);
      clientCtx.ephemeralKey = shared;
    });
    return promise;
  });
});
