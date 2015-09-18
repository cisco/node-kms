/**
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
 "use strict";

var chai = require("chai");
var assert = chai.assert;

var KMS = require("../");

describe("Public API", function() {
  it("exports KeyObject", function() {
    assert.ok(KMS.KeyObject);
    assert.equal(typeof KMS.KeyObject, "function");
    assert.equal(typeof KMS.KeyObject.fromObject, "function");
  });
  it("exports Context", function() {
    assert.ok(KMS.Context);
    assert.equal(typeof KMS.Context, "function");
  });
  it("exports Request", function() {
    assert.ok(KMS.Request);
    assert.equal(typeof KMS.Request, "function");
  });
  it("exports Response", function() {
    assert.ok(KMS.Response);
    assert.equal(typeof KMS.Response, "function");
  });
});
