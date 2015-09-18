/**
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
 "use strict";

var chai = require("chai"),
    cloneDeep = require("lodash.clonedeep");

var KMS = {
  KeyObject: require("../lib/keyobject"),
  Context: require("../lib/context")
};

var assert = chai.assert;

describe("KMS/Context", function() {
  var clientInfo = {
    key: {
      uri: "-internal/c3370144-5b1e-40c3-a4ef-21ff63f85dd5",
      createDate: "2014-11-06T16:35:05Z",
      expirationDat: "2014-11-06T1735:05Z",
      jwk: {
        kid: "c3370144-5b1e-40c3-a4ef-21ff63f85dd5",
        kty: "EC",
        crv: "P-256",
        x: "jzs-vcNXzSPAtCmgchsQ2uqYcky43XokijoyTC6-FX0",
        y: "QM4cPEYv0xS1oWtg19i0xjvn3nhY3rU9cklDfc1GR6M",
        d: "WhCpx09Cb8Ge5j07D4rVx_kPl7TyApHnnZuRX7eGsEc"
      }
    },
    clientId: "tester-web_e1fa9c13-108e-4fd0-a793-00f2644e6ad0",
    credential: {
      userId: "414baf5d-649b-4b4d-9a5a-0eec960c3db2",
      bearer: "IOAO1WboYGJLDb6W-sU7YQ.54k0eIaQDLYOr8uD9ZuEDeKzLRQnkAopV7vsQ0dOrv0"
    }
  };

  describe("ctor", function() {
    it("creates an empty Context", function() {
      var kmsCtx = new KMS.Context();
      assert.isNull(kmsCtx.ephemeralKey);
      assert.deepEqual(kmsCtx.clientInfo, {});
      assert.deepEqual(kmsCtx.serverInfo, {});
    });
  });
  describe("#ephemeralKey", function() {
    var ephemeral = {
      "uri": "/ecdhe/ea9f3858-1240-4328-ae22-a15f6072306f",
      "jwk": {
        "kty": "EC",
        "crv": "P-256",
        "x": "8mdasnEZac2LWxMwKExikKU5LLacLQlcOt7A6n1ZGUC",
        "y": "lxs7ln5LtZUE_GE7yzc6BZOwBxtOftdsr8HVh-14ksS"
      },
      "userId": "842e2d82-7e71-4040-8eb9-d977fe888807",
      "clientId": "android_a6aa012a-0795-4fb4-bddb-f04abda9e34f",
      "createDate": new Date("2014-10-09T15:54:48Z"),
      "expirationDate": new Date("2014-10-09T16:54:48Z")
    };

    it("gets/sets ephemeralKey", function() {
      var kmsCtx = new KMS.Context();
      assert.isNull(kmsCtx.ephemeralKey);

      var keyobj = new KMS.KeyObject(ephemeral);
      kmsCtx.ephemeralKey = keyobj;
      assert.deepEqual(kmsCtx.ephemeralKey, keyobj);

      kmsCtx.ephemeralKey = null;
      assert.isNull(kmsCtx.ephemeralKey);
    });
    it("gets/sets as JSON", function() {
      var kmsCtx = new KMS.Context();
      assert.isNull(kmsCtx.ephemeralKey);

      var json = cloneDeep(ephemeral, function(value) {
        return (value instanceof Date) ?
               value.toISOString() :
               undefined;
      });
      var keyobj = new KMS.KeyObject(json);
      kmsCtx.ephemeralKey = json;
      assert.deepEqual(kmsCtx.ephemeralKey, keyobj);

      kmsCtx.ephemeralKey = null;
      assert.isNull(kmsCtx.ephemeralKey);
    });
    it("gets/sets as POJO", function() {
      var kmsCtx = new KMS.Context();
      assert.isNull(kmsCtx.ephemeralKey);

      var keyobj = new KMS.KeyObject(ephemeral);
      kmsCtx.ephemeralKey = ephemeral;
      assert.deepEqual(kmsCtx.ephemeralKey, keyobj);

      kmsCtx.ephemeralKey = null;
      assert.isNull(kmsCtx.ephemeralKey);
    });
  });
  describe("#requestId", function() {
    it("gets a new id each time", function() {
      var kmsCtx = new KMS.Context();

      var seq1 = kmsCtx.requestId(),
          seq2 = kmsCtx.requestId();
      assert.ok(seq1);
      assert.ok(seq2);
      assert.notEqual(seq1, seq2);
    });
  });

  describe("#createECDHKey", function() {
    it("does it", function() {
      var kmsCtx = new KMS.Context();
      kmsCtx.clientInfo = clientInfo;

      var promise = kmsCtx.createECDHKey();
      promise = promise.then(function(result) {
        assert.ok(result instanceof KMS.KeyObject);
        assert.equal(result.clientId, clientInfo.clientId);
        assert.equal(result.userId, clientInfo.credential.userId);

        var jwk = result.jwk;
        assert.ok(jwk);
        assert.equal(jwk.kty, "EC");
        assert.equal(jwk.crv, "P-256");
        assert.ok(jwk.x);
        assert.ok(jwk.y);
        assert.ok(jwk.d);
      });
      return promise;
    });
  });

  describe("#deriveEphemeralKey", function() {
    it("does it", function() {
      var kmsCtx = new KMS.Context();
      kmsCtx.ephemeralKey = clientInfo.key;

      var promise;
      var remote = {
        "uri": "/ecdhe/5d9a92dd-b22d-4bcf-bacb-72775cea11c7",
        "jwk": {
          "kid": "5d9a92dd-b22d-4bcf-bacb-72775cea11c7",
          "kty": "EC",
          "crv": "P-256",
          "x": "eyDfB_DWmIcKjkLvBZUx-Z7W436DaikKQDpOCt7rFYQ",
          "y": "icbVIugK8rnSXRVERLRvoWZu1s4dzivMJa70pEYG6Fs"
        },
        "createDate": "2014-10-09T15:54:48Z",
        "expirationDate": "2014-10-09T16:54:48Z"
      };
      promise = kmsCtx.deriveEphemeralKey(remote);
      promise = promise.then(function(ephemeral) {
        assert.ok(ephemeral instanceof KMS.KeyObject);
        assert.equal(ephemeral.uri, remote.uri);
        assert.deepEqual(ephemeral.createDate,
                         new Date(remote.createDate));
        assert.deepEqual(ephemeral.expirationDate,
                         new Date(remote.expirationDate));
        assert.equal(ephemeral.jwk.k,
                     "II4BqHTDSRBKp0QoMYXORF75-1xud9i5_BkZeXaAS3s");
      });
      return promise;
    });
  });
});
