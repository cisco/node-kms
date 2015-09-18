/**
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
 "use strict";

var chai = require("chai");

var KMS = {
  KeyObject: require("../lib/keyobject")
};

var assert = chai.assert;

describe("KMS/KeyObject", function() {
  describe("ctor", function() {
    it("creates an empty KeyObject", function() {
      var keyobj = new KMS.KeyObject();
      assert.equal(keyobj.uri, "");
      assert.equal(keyobj.userId, "");
      assert.equal(keyobj.clientId, "");
      assert.equal(keyobj.resourceUri, "");
      assert.ok(!keyobj.createDate);
      assert.ok(!keyobj.expirationDate);
      assert.ok(!keyobj.bindDate);
      assert.ok(!keyobj.jwk);
    });
    it("creates a KeyObject from a POJO", function() {
      var rep = {
        "uri": "/keys/52100fa4-c222-46d0-994d-1ca885e4a3a2",
        "jwk": {
          "kid": "52100fa4-c222-46d0-994d-1ca885e4a3a2",
          "kty": "oct",
          "k": "ZMpktzGq1g6_r4fKVdnx9OaYr4HjxPjIs7l7SwAsgsg"
        },
        "userId": "842e2d82-7e71-4040-8eb9-d977fe888807",
        "clientId": "android_a6aa012a-0795-4fb4-bddb-f04abda9e34f",
        "createDate": new Date("2014-10-09T15:54:48Z"),
        "bindDate": new Date("2014-10-09T15:55:34Z"),
        "expirationDate": new Date("2014-10-10T15:55:34Z"),
        "resourceUri": "/resources/7f35c3eb-95d6-4558-a7fc-1942e5f03094"
      };
      var keyobj = new KMS.KeyObject(rep);
      assert.equal(keyobj.uri, rep.uri);
      assert.equal(keyobj.userId, rep.userId);
      assert.equal(keyobj.clientId, rep.clientId);
      assert.equal(keyobj.resourceUri, rep.resourceUri);
      assert.deepEqual(keyobj.createDate, rep.createDate);
      assert.deepEqual(keyobj.expirationDate, rep.expirationDate);
      assert.deepEqual(keyobj.bindDate, rep.bindDate);
      assert.deepEqual(keyobj.jwk, rep.jwk);
    });
    it("creates a KeyObject from a JSON-Object", function() {
      var rep = {
        "uri": "/keys/52100fa4-c222-46d0-994d-1ca885e4a3a2",
        "jwk": {
          "kid": "52100fa4-c222-46d0-994d-1ca885e4a3a2",
          "kty": "oct",
          "k": "ZMpktzGq1g6_r4fKVdnx9OaYr4HjxPjIs7l7SwAsgsg"
        },
        "userId": "842e2d82-7e71-4040-8eb9-d977fe888807",
        "clientId": "android_a6aa012a-0795-4fb4-bddb-f04abda9e34f",
        "createDate": "2014-10-09T15:54:48Z",
        "bindDate": "2014-10-09T15:55:34Z",
        "expirationDate": "2014-10-10T15:55:34Z",
        "resourceUri": "/resources/7f35c3eb-95d6-4558-a7fc-1942e5f03094"
      };
      var keyobj = new KMS.KeyObject(rep);
      assert.equal(keyobj.uri, rep.uri);
      assert.equal(keyobj.userId, rep.userId);
      assert.equal(keyobj.clientId, rep.clientId);
      assert.equal(keyobj.resourceUri, rep.resourceUri);
      assert.deepEqual(keyobj.createDate, new Date(rep.createDate));
      assert.deepEqual(keyobj.expirationDate, new Date(rep.expirationDate));
      assert.deepEqual(keyobj.bindDate, new Date(rep.bindDate));
      assert.deepEqual(keyobj.jwk, rep.jwk);
    });
  });

  describe("#fromObject", function() {
    it("coerces a POJO to a KeyObject", function() {
      var rep = {
        "uri": "/keys/52100fa4-c222-46d0-994d-1ca885e4a3a2",
        "jwk": {
          "kid": "52100fa4-c222-46d0-994d-1ca885e4a3a2",
          "kty": "oct",
          "k": "ZMpktzGq1g6_r4fKVdnx9OaYr4HjxPjIs7l7SwAsgsg"
        },
        "userId": "842e2d82-7e71-4040-8eb9-d977fe888807",
        "clientId": "android_a6aa012a-0795-4fb4-bddb-f04abda9e34f",
        "createDate": new Date("2014-10-09T15:54:48Z"),
        "bindDate": new Date("2014-10-09T15:55:34Z"),
        "expirationDate": new Date("2014-10-10T15:55:34Z"),
        "resourceUri": "/resources/7f35c3eb-95d6-4558-a7fc-1942e5f03094"
      };
      var keyobj = KMS.KeyObject.fromObject(rep);
      assert.equal(keyobj.uri, rep.uri);
      assert.equal(keyobj.userId, rep.userId);
      assert.equal(keyobj.clientId, rep.clientId);
      assert.equal(keyobj.resourceUri, rep.resourceUri);
      assert.deepEqual(keyobj.createDate, rep.createDate);
      assert.deepEqual(keyobj.expirationDate, rep.expirationDate);
      assert.deepEqual(keyobj.bindDate, rep.bindDate);
      assert.deepEqual(keyobj.jwk, rep.jwk);
    });
    it("coerces a JSON-Object to a KeyObject", function() {
      var rep = {
        "uri": "/keys/52100fa4-c222-46d0-994d-1ca885e4a3a2",
        "jwk": {
          "kid": "52100fa4-c222-46d0-994d-1ca885e4a3a2",
          "kty": "oct",
          "k": "ZMpktzGq1g6_r4fKVdnx9OaYr4HjxPjIs7l7SwAsgsg"
        },
        "userId": "842e2d82-7e71-4040-8eb9-d977fe888807",
        "clientId": "android_a6aa012a-0795-4fb4-bddb-f04abda9e34f",
        "createDate": "2014-10-09T15:54:48Z",
        "bindDate": "2014-10-09T15:55:34Z",
        "expirationDate": "2014-10-10T15:55:34Z",
        "resourceUri": "/resources/7f35c3eb-95d6-4558-a7fc-1942e5f03094"
      };
      var keyobj = KMS.KeyObject.fromObject(rep);
      assert.equal(keyobj.uri, rep.uri);
      assert.equal(keyobj.userId, rep.userId);
      assert.equal(keyobj.clientId, rep.clientId);
      assert.equal(keyobj.resourceUri, rep.resourceUri);
      assert.deepEqual(keyobj.createDate, new Date(rep.createDate));
      assert.deepEqual(keyobj.expirationDate, new Date(rep.expirationDate));
      assert.deepEqual(keyobj.bindDate, new Date(rep.bindDate));
      assert.deepEqual(keyobj.jwk, rep.jwk);
    });
    it("coerces a KeyObject to a KeyObject (identity)", function() {
      var rep = new KMS.KeyObject();
      var keyobj = KMS.KeyObject.fromObject(rep);
      assert.equal(keyobj.uri, rep.uri);
      assert.equal(keyobj.userId, rep.userId);
      assert.equal(keyobj.clientId, rep.clientId);
      assert.equal(keyobj.resourceUri, rep.resourceUri);
      assert.deepEqual(keyobj.createDate, rep.createDate);
      assert.deepEqual(keyobj.expirationDate, rep.expirationDate);
      assert.deepEqual(keyobj.bindDate, rep.bindDate);
      assert.deepEqual(keyobj.jwk, rep.jwk);
    });
  });

  describe("#asKey", function() {
    it("converts 'jwk' to JWK.Key", function() {
      var json = {
        "uri": "/keys/52100fa4-c222-46d0-994d-1ca885e4a3a2",
        "jwk": {
          "kid": "52100fa4-c222-46d0-994d-1ca885e4a3a2",
          "kty": "oct",
          "k": "ZMpktzGq1g6_r4fKVdnx9OaYr4HjxPjIs7l7SwAsgsg"
        },
        "userId": "842e2d82-7e71-4040-8eb9-d977fe888807",
        "clientId": "android_a6aa012a-0795-4fb4-bddb-f04abda9e34f",
        "createDate": "2014-10-09T15:54:48Z",
        "bindDate": "2014-10-09T15:55:34Z",
        "expirationDate": "2014-10-10T15:55:34Z",
        "resourceUri": "/resources/7f35c3eb-95d6-4558-a7fc-1942e5f03094"
      };
      var keyobj = new KMS.KeyObject(json);
      return keyobj.asKey().
        then(function(jwk) {
          assert.deepEqual(jwk.toJSON(true), json.jwk);
        });
    });
    it("fails if 'jwk' is not set", function() {
      var keyobj = new KMS.KeyObject();
      return keyobj.asKey().
        then(function() {
          assert.ok(false, "unexpected success");
        }, function(err) {
          assert.equal(err.message, "'jwk' not set");
        });
    });
  });

  describe("#toJSON", function() {
    it("returns a JSON-Object", function() {
      var json = {
        "uri": "/keys/52100fa4-c222-46d0-994d-1ca885e4a3a2",
        "jwk": {
          "kid": "52100fa4-c222-46d0-994d-1ca885e4a3a2",
          "kty": "oct",
          "k": "ZMpktzGq1g6_r4fKVdnx9OaYr4HjxPjIs7l7SwAsgsg"
        },
        "userId": "842e2d82-7e71-4040-8eb9-d977fe888807",
        "clientId": "android_a6aa012a-0795-4fb4-bddb-f04abda9e34f",
        "createDate": "2014-10-09T15:54:48Z",
        "bindDate": "2014-10-09T15:55:34Z",
        "expirationDate": "2014-10-10T15:55:34Z",
        "resourceUri": "/resources/7f35c3eb-95d6-4558-a7fc-1942e5f03094"
      };
      var keyobj = new KMS.KeyObject(json);
      // Dates cause some headache -- stringify to compare
      assert.equal(JSON.stringify(keyobj.toJSON()),
                   JSON.stringify(keyobj));
    });
  });
});
