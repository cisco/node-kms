/**
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
 "use strict";

var chai = require("chai"),
    clone = require("lodash.clone"),
    omit = require("lodash.omit");

var KMS = {
  Context: require("../lib/context"),
  Response: require("../lib/response")
};
var config = require("./config");

var assert = chai.assert;

describe("KMS/Response", function() {
  describe("ctor", function() {
    it("creates an empty Response", function() {
      var kmsRsp = new KMS.Response();
      assert.equal(kmsRsp.wrapped, "");
      assert.deepEqual(kmsRsp.body, {});
      assert.equal(kmsRsp.status, 0);
      assert.equal(kmsRsp.reason, "");
      assert.equal(kmsRsp.requestId, "");
    });
    it("creates a Response from a wrapped", function() {
      var wrapped = "eyJhbGciOiJSU0ExXzUiLCJraWQiOiJrbXMuZXhhbXBsZSIsImVuYyI6IkEyNTZHQ00ifQ" +
                    "." +
                    "C-ahGqjtglQYo-AQ6ytfmJOQO29DCBhaYKx7n_QapLbDMe3XEgQEstPxw5JuphO9oBl7Hok4pjn-e0k1qnNNzcP4T3IFkXsvqtXNZt_mYuwTVuh02FMf5In-s7-B0PPxwe79cfVaWork88faWu2dqqSF6Xb8Gfl1bq4hdqSPpQs3AkDUAyDHkxEhl3tBH-V6gyju8_8oQ6O1q_BhcPFg6cZsTQqKZDGwzpHHbosoZVSao4O9NFo-QEsIxUTbpzpMeDN4cLjzxpmiodD2jp2ncePKCwCDysSG0rrGgNJgxeSkRPxT-h5nRDFoPzMjrni1pHQIhyaFxOHVqspy7r_SXA" +
                    "." +
                    "VitTtnfsjOj1qbhj.zq3_dix20_MVYboUQVJp9i0m7q-2HKmL5bVsJ8ilqT3OZEMcED7KkX9LMa5MDKMMi6USVsqAhnXFxHBhd07TWvxKP1rBfzuoSoNfdlB1LZQPXYxLk4Hk1fuRgEwN3BZ2tdYZUVhPq25OgctDLNVyDvoR-kyVKK9U2PvqU_LiJPdNRkwwwKwc2YTVNIXjSVgQpRkIFhW5rJSmZJrFRo8xQS5Cr6BRC-hp5-ysi-3OERqwJWN4vZNGWVtxD4RpPFoo1YQZSNocz9x6STg1_lDBffSPF57WbDTVuv1B8pupkoLgEMQ61x5jWsLki90MmhLn-jliVU9h-fbdf9tPNDS_Pg2t9g7O_Y9KQjcWR9Wm_OWlmC5Un2F0FybW58uQusqtJXAaitiRPhx_dHqpijRSXsdi0hAd1mPyY3MKWF8gq3PdmGauEFyqDwkIgak4jMUMJUVUaFJJhNKIV1LFdAGjW6nj2_lhOF4NkVTeG8gKnSx8vAJ1TYFYEmOL5WB6PUbhIpZdihOJpz71" +
                    "." +
                    "kXkDo2m6JE2tVnSEYDg70w";
      var kmsRsp = new KMS.Response(wrapped);
      assert.equal(kmsRsp.wrapped, wrapped);
      assert.deepEqual(kmsRsp.body, {});
      assert.equal(kmsRsp.status, 0);
      assert.equal(kmsRsp.reason, "");
      assert.equal(kmsRsp.requestId, "");
    });
  });

  describe("#unwrap", function() {
    var kmsCtx;
    before(function() {
      kmsCtx = new KMS.Context();
      kmsCtx.clientInfo = omit(config.clientInfo, "key");
      kmsCtx.serverInfo = {
        key: clone(config.serverInfo.cert)
      };
      kmsCtx.ephemeralKey = config.sharedKey;
    });
    it("unwraps with server key", function() {
      var wrapped = "eyJhbGciOiJSUzI1NiIsImtpZCI6Imttcy5leGFtcGxlIn0" +
                    "." +
                    "eyJzdGF0dXMiOjIwMSwicmVxdWVzdElkIjoiODIzNDlhNDEtMGU1Ni00N2E4LTk1OWYtOTk5NDYzZWY5NTc0Iiwia2V5Ijp7InVyaSI6Ii9lY2RoZS9lYTlmMzg1OC0xMjQwLTQzMjgtYWUyMi1hMTVmNjA3MjMwNmYiLCJqd2siOnsia3R5IjoiRUMiLCJjcnYiOiJQLTI1NiIsIngiOiI4bWRhc25FWmFjMkxXeE13S0V4aWtLVTVMTGFjTFFsY090N0E2bjFaR1VDIiwieSI6Imx4czdsbjVMdFpVRV9HRTd5emM2QlpPd0J4dE9mdGRzcjhIVmgtMTRrc1MifSwidXNlcklkIjoiODQyZTJkODItN2U3MS00MDQwLThlYjktZDk3N2ZlODg4ODA3IiwiY2xpZW50SWQiOiJhbmRyb2lkX2E2YWEwMTJhLTA3OTUtNGZiNC1iZGRiLWYwNGFiZGE5ZTM0ZiIsImNyZWF0ZURhdGUiOiIyMDE0LTEwLTA5VDE1OjU0OjQ4WiIsImV4cGlyYXRpb25EYXRlIjoiMjAxNC0xMC0wOVQxNjo1NDo0OFoifX0" +
                    "." +
                    "HsJBfmUPUYxD8BX3HE4vHsU3qzkNvdYhE6sTD7r6Kh6quqcd-gUMOe96OlEpLyWTmmH9Yopb-Urlc0NCIbevpCN6I-QaP5wijjNmTQtZtrUF0EvcoJQIgPey_ahrqDHD7YAGAmOmkJfrfRZKjW95BgDg4_6SPyzHu71BrdDqS9AKXPTfMuA_t9cmDobfL-99770h4Pvw4WxN0VMJvcF4pIPssHsU-iKRyKEiFxQt1kwCpYt8tqexIZaIvB9UnmVeULJsqUN1Ui4pZYsdl3zZ9JXFMPKAdB3xKSM5zQTfRx49oatqF0xEVeCnyQJ7KHEZEgfTX3ide_bC8lr4N_miEA";
      var kmsRsp = new KMS.Response(wrapped);

      var promise = kmsRsp.unwrap(kmsCtx);
      promise = promise.then(function(result) {
        var json = {
          "status": 201,
          "requestId": "82349a41-0e56-47a8-959f-999463ef9574",
          "key": {
            "uri": "/ecdhe/ea9f3858-1240-4328-ae22-a15f6072306f",
            "jwk": {
              "kty": "EC",
              "crv": "P-256",
              "x": "8mdasnEZac2LWxMwKExikKU5LLacLQlcOt7A6n1ZGUC",
              "y": "lxs7ln5LtZUE_GE7yzc6BZOwBxtOftdsr8HVh-14ksS"
            },
            "userId": "842e2d82-7e71-4040-8eb9-d977fe888807",
            "clientId": "android_a6aa012a-0795-4fb4-bddb-f04abda9e34f",
            "createDate": "2014-10-09T15:54:48Z",
            "expirationDate": "2014-10-09T16:54:48Z"
          }
        };
        assert.deepEqual(result, json);
        assert.deepEqual(kmsRsp.body, json);
        assert.equal(kmsRsp.status, 201);
        assert.equal(kmsRsp.reason, "");
        assert.equal(kmsRsp.requestId, "82349a41-0e56-47a8-959f-999463ef9574");
      });
      return promise;
    });
    it("unwraps with ephemeral key", function() {
      var wrapped = "eyJhbGciOiJkaXIiLCJraWQiOiIvZWNkaGUvYTQ3NTI0MTEtZGQ1Zi00ODNjLThkOTMtZTgyMjFmNmFiNGE2IiwiZW5jIjoiQTI1NkdDTSJ9" +
                    "." +
                    "." +
                    "yy2PuLwzsv5dpTvE" +
                    "." +
                    "o7KCl8FCevJloKrrVlo0w00Ze3GrazCbXHVsFZTp2QCnvmiWNtX77MZizvDUH5gs8fhryVU8GevfJuO98kBkt2y36NPZdPoEHdS19FNGlXnZTXZHs53Fx6DguoEXRG6zxZbUQqf6swveRUhMzTCO2iakP74CCAxVl3U6V1Oi8ASV6nioZmGPOYgpXvFaqtIY5uYUCNQIs60GK6DBiQZb2E7ByQIorBKIoGAA6ts2KHjBJPwgS1YSF-9qgQWjazoXuw-ab95WxUOoeRRMiewH7OIKWSEk45dMoyfGZELM9mWUZBWIhGTFOhssQ6IuT3OMzeflcgsyTgMR6KUJVYpvCoqskZTy-ORaYkrSHLfY7RAeh1ONlemF5baamEZKFOy_XyzX2kCZ2T3h_zPm5p97KkQ3yj21pnT2KYERcnlZ8yvH6PYZgNbw_foH9F2GONbPwDRBUrvi5l7l1VF84t2kRvY6dwgTGB_6OfDDWIiHfGo" +
                    "." +
                    "LzEjepG_ronHKGBRCf9wag";
      var kmsRsp = new KMS.Response(wrapped);

      var promise = kmsRsp.unwrap(kmsCtx);
      promise = promise.then(function(result) {
        var json = {
          status: 201,
          requestId: "4f782388-f76e-477f-ad3d-a4c7cf5ceac8",
          resource: {
            uri: "/resources/7f35c3eb-95d6-4558-a7fc-1942e5f03094",
            authorizationUris: [
              "/authorizations/50e9056d-0700-4919-b55f-84cd78a2a65e",
              "/authorizations/db4c95ab-3fbf-42a8-989f-f53c1f13cc9a"
            ],
            keyUris: [
              "/keys/b4cba4da-a984-4af2-b54f-3ca04acfe461",
              "/keys/2671413c-ab80-4f19-a0a4-ae07e1a94e90"
            ]
          }
        };
        assert.deepEqual(result, json);
        assert.deepEqual(kmsRsp.body, json);
        assert.equal(kmsRsp.status, 201);
        assert.equal(kmsRsp.reason, "");
        assert.equal(kmsRsp.requestId, "4f782388-f76e-477f-ad3d-a4c7cf5ceac8");
      });
      return promise;
    });
  });
});
