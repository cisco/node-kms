/**
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
 "use strict";

var chai = require("chai"),
    clone = require("lodash.clone"),
    omit = require("lodash.omit"),
    jose = require("node-jose");

var KMS = {
  Context: require("../lib/context"),
  Request: require("../lib/request")
};
var config = require("./config");

var assert = chai.assert;

describe("KMS/Request", function() {
  describe("ctor", function() {
    it("creates an empty Request", function() {
      var kmsReq = new KMS.Request();
      assert.deepEqual(kmsReq.body, {});
      assert.equal(kmsReq.requestId, "");
      assert.equal(kmsReq.uri, "");
      assert.equal(kmsReq.method, "");
    });
    it("creates a Request from a body", function() {
      var body = {
        "client": {
          "clientId": "android_a6aa012a-0795-4fb4-bddb-f04abda9e34f",
          "credential": {
            "userId": "842e2d82-7e71-4040-8eb9-d977fe888807",
            "bearer": "ZWU5NGE2YWYtMGE2NC0..."
          }
        },
        "method": "create",
        "uri": "/ecdhe",
        "requestId": "someid",
        "jwk": {
          "kty": "EC",
          "crv": "P-256",
          "x": "VoFkf6Wk5kDQ1ob6csBmiMPHU8jALwdtaap35Fsj20M",
          "y": "XymwN6u2PmsKbIPy5iij6qZ-mIyej5dvZWB_75lnRgQ"
        }
      };
      var kmsReq = new KMS.Request(body);
      assert.deepEqual(kmsReq.body, body);
      assert.equal(kmsReq.requestId, "someid");
      assert.equal(kmsReq.uri, "/ecdhe");
      assert.equal(kmsReq.method, "create");
    });
  });

  describe("#method", function() {
    it("get/sets property", function() {
      var kmsReq = new KMS.Request();
      assert.equal(kmsReq.method, "");

      kmsReq.method = "create";
      assert.equal(kmsReq.method, "create");

      kmsReq.method = "update";
      assert.equal(kmsReq.method, "update");

      kmsReq.method = null;
      assert.equal(kmsReq.method, "");
    });
  });
  describe("#uri", function() {
    it("gets/sets property", function() {
      var kmsReq = new KMS.Request();
      assert.equal(kmsReq.uri, "");

      kmsReq.uri = "/ecdhe";
      assert.equal(kmsReq.uri, "/ecdhe");

      kmsReq.uri = "/some/other/path";
      assert.equal(kmsReq.uri, "/some/other/path");

      kmsReq.uri = null;
      assert.equal(kmsReq.uri, "");
    });
  });
  describe("#requestId", function() {
    it("gets/sets property", function() {
      var kmsReq = new KMS.Request();
      assert.equal(kmsReq.requestId, "");

      kmsReq.requestId = "someid";
      assert.equal(kmsReq.requestId, "someid");

      kmsReq.requestId = null;
      assert.equal(kmsReq.requestId, "");
    });
  });
  describe("#body", function() {
    it("gets/sets property", function() {
      var kmsReq = new KMS.Request();
      assert.deepEqual(kmsReq.body, {});

      var body = {
        "jwk": {
          "kty": "EC",
          "crv": "P-256",
          "x": "VoFkf6Wk5kDQ1ob6csBmiMPHU8jALwdtaap35Fsj20M",
          "y": "XymwN6u2PmsKbIPy5iij6qZ-mIyej5dvZWB_75lnRgQ"
        }
      };
      kmsReq.body = body;
      assert.deepEqual(kmsReq.body, body);

      kmsReq.body = null;
      assert.deepEqual(kmsReq.body, {});
    });
    it("preserves core sub-properties across sets", function() {
      var kmsReq = new KMS.Request({
        "client": {
          "clientId": "android_a6aa012a-0795-4fb4-bddb-f04abda9e34f",
          "credential": {
            "userId": "842e2d82-7e71-4040-8eb9-d977fe888807",
            "bearer": "ZWU5NGE2YWYtMGE2NC0..."
          }
        },
        "method": "create",
        "uri": "/ecdhe",
        "requestId": "someid",
        "jwk": {
          "kty": "EC",
          "crv": "P-256",
          "x": "VoFkf6Wk5kDQ1ob6csBmiMPHU8jALwdtaap35Fsj20M",
          "y": "XymwN6u2PmsKbIPy5iij6qZ-mIyej5dvZWB_75lnRgQ"
        }
      });
      var body = {
        "method": "delete",
        "uri": "/ecdhe/some-ecdhe-uri"
      };
      kmsReq.body = body;
      assert.deepEqual(kmsReq.body, {
        "method": "create",
        "uri": "/ecdhe",
        "requestId": "someid"
      });
    });
  });

  describe("#wrap", function() {
    function decryptIt(jwk, jwe) {
      var promise = jose.JWK.asKey(jwk);
      promise = promise.then(function(key) {
        var dec = jose.JWE.createDecrypt(key);
        return dec.decrypt(jwe);
      });
      return promise;
    }

    var kmsCtx;
    before(function() {
      kmsCtx = new KMS.Context();
      kmsCtx.clientInfo = omit(config.clientInfo, "key");
      kmsCtx.serverInfo = {
        key: clone(config.serverInfo.cert)
      };
      kmsCtx.ephemeralKey = config.sharedKey;
    });

    it("gets/sets wrapped", function() {
      var kmsReq = new KMS.Request();
      assert.equal(kmsReq.wrapped, "");

      // NOTE: wrapped is not validated when set, so junk is OK
      kmsReq.wrapped = "header.encrypted_key.iv.ciphertext.tag";
      assert.equal(kmsReq.wrapped, "header.encrypted_key.iv.ciphertext.tag");

      kmsReq.wrapped = null;
      assert.equal(kmsReq.wrapped, "");
    });
    it("wraps with server key", function() {
      // partial from draft-biggs-saag-key-management-service
      var body = {
        "method": "create",
        "uri": "/ecdhe",
        "jwk": {
          "kty": "EC",
          "crv": "P-256",
          "x": "VoFkf6Wk5kDQ1ob6csBmiMPHU8jALwdtaap35Fsj20M",
          "y": "XymwN6u2PmsKbIPy5iij6qZ-mIyej5dvZWB_75lnRgQ"
        }
      };
      var kmsReq = new KMS.Request(body);

      var promise = kmsReq.wrap(kmsCtx, { serverKey: true });
      promise = promise.then(function(result) {
        assert.equal(typeof result, "string");
        assert.equal(result, kmsReq.wrapped);

        // try to decrypt
        return decryptIt(config.serverInfo.key, result);
      });
      promise = promise.then(function(result) {
        result = result.plaintext;
        result = JSON.parse(result.toString("utf8"));

        var expected = {
          "client": {
            clientId: "tester-web_e1fa9c13-108e-4fd0-a793-00f2644e6ad0",
            credential: {
              userId: "414baf5d-649b-4b4d-9a5a-0eec960c3db2",
              bearer: "IOAO1WboYGJLDb6W-sU7YQ.54k0eIaQDLYOr8uD9ZuEDeKzLRQnkAopV7vsQ0dOrv0"
            }
          },
          "requestId": result.requestId,
          "method": "create",
          "uri": "/ecdhe",
          "jwk": {
            "kty": "EC",
            "crv": "P-256",
            "x": "VoFkf6Wk5kDQ1ob6csBmiMPHU8jALwdtaap35Fsj20M",
            "y": "XymwN6u2PmsKbIPy5iij6qZ-mIyej5dvZWB_75lnRgQ"
          }
        };
        assert.deepEqual(result, expected);
        assert.deepEqual(kmsReq.body, expected);
      });
      return promise;
    });
    it("wraps with ephemeral key", function() {
      var kmsCtx = new KMS.Context();
      kmsCtx.clientInfo = omit(config.clientInfo, "key");
      kmsCtx.serverInfo = {
        key: clone(config.serverInfo.cert)
      };
      kmsCtx.ephemeralKey = config.sharedKey;

      var body = {
        "method": "create",
        "uri": "/keys",
        "count": 10
      };
      var kmsReq = new KMS.Request(body);

      var promise = kmsReq.wrap(kmsCtx, { serverKey: false });
      promise = promise.then(function(result) {
        assert.equal(typeof result, "string");
        assert.equal(result, kmsReq.wrapped);

        // try to decrypt
        return decryptIt(config.sharedKey.jwk, result);
      });
      promise = promise.then(function(result) {
        result = result.plaintext;
        result = JSON.parse(result.toString("utf8"));

        var expected = {
          "client": {
            clientId: "tester-web_e1fa9c13-108e-4fd0-a793-00f2644e6ad0",
            credential: {
              userId: "414baf5d-649b-4b4d-9a5a-0eec960c3db2",
              bearer: "IOAO1WboYGJLDb6W-sU7YQ.54k0eIaQDLYOr8uD9ZuEDeKzLRQnkAopV7vsQ0dOrv0"
            }
          },
          "requestId": result.requestId,
          "method": "create",
          "uri": "/keys",
          "count": 10
        };
        assert.deepEqual(result, expected);
        assert.deepEqual(kmsReq.body, expected);
      });
      return promise;
    });
    it("wraps with a body-specified requestId", function() {
      var kmsCtx = new KMS.Context(),
          requestId = kmsCtx.requestId();
      kmsCtx.clientInfo = omit(config.clientInfo, "key");
      kmsCtx.serverInfo = {
        key: clone(config.serverInfo.cert)
      };
      kmsCtx.ephemeralKey = config.sharedKey;

      var body = {
        "requestId": requestId,
        "method": "create",
        "uri": "/keys",
        "count": 10
      };
      var kmsReq = new KMS.Request(body);

      var promise = kmsReq.wrap(kmsCtx, { serverKey: false });
      promise = promise.then(function(result) {
        assert.equal(typeof result, "string");
        assert.equal(result, kmsReq.wrapped);

        // try to decrypt
        return decryptIt(config.sharedKey.jwk, result);
      });
      promise = promise.then(function(result) {
        result = result.plaintext;
        result = JSON.parse(result.toString("utf8"));

        var expected = {
          "client": {
            clientId: "tester-web_e1fa9c13-108e-4fd0-a793-00f2644e6ad0",
            credential: {
              userId: "414baf5d-649b-4b4d-9a5a-0eec960c3db2",
              bearer: "IOAO1WboYGJLDb6W-sU7YQ.54k0eIaQDLYOr8uD9ZuEDeKzLRQnkAopV7vsQ0dOrv0"
            }
          },
          "requestId": result.requestId,
          "method": "create",
          "uri": "/keys",
          "count": 10
        };
        assert.equal(result.requestId, requestId);
        assert.deepEqual(result, expected);
        assert.deepEqual(kmsReq.body, expected);
      });
      return promise;
    });
    it("wraps with an explicit requestId", function() {
      var kmsCtx = new KMS.Context(),
          requestId = kmsCtx.requestId();
      kmsCtx.clientInfo = omit(config.clientInfo, "key");
      kmsCtx.serverInfo = {
        key: clone(config.serverInfo.cert)
      };
      kmsCtx.ephemeralKey = config.sharedKey;

      var body = {
        "method": "create",
        "uri": "/keys",
        "count": 10
      };
      var kmsReq = new KMS.Request(body);
      kmsReq.requestId = requestId;

      var promise = kmsReq.wrap(kmsCtx, { serverKey: false });
      promise = promise.then(function(result) {
        assert.equal(typeof result, "string");
        assert.equal(result, kmsReq.wrapped);

        // try to decrypt
        return decryptIt(config.sharedKey.jwk, result);
      });
      promise = promise.then(function(result) {
        result = result.plaintext;
        result = JSON.parse(result.toString("utf8"));

        var expected = {
          "client": {
            clientId: "tester-web_e1fa9c13-108e-4fd0-a793-00f2644e6ad0",
            credential: {
              userId: "414baf5d-649b-4b4d-9a5a-0eec960c3db2",
              bearer: "IOAO1WboYGJLDb6W-sU7YQ.54k0eIaQDLYOr8uD9ZuEDeKzLRQnkAopV7vsQ0dOrv0"
            }
          },
          "requestId": result.requestId,
          "method": "create",
          "uri": "/keys",
          "count": 10
        };
        assert.equal(result.requestId, requestId);
        assert.deepEqual(result, expected);
        assert.deepEqual(kmsReq.body, expected);
      });
      return promise;
    });
  });
});
