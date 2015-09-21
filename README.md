# node-kms #

A JavaScript implementation of Key Management Service (KMS) for current web browsers and node.js-based servers.  The KMS API is described in [[draft-abiggs-saag-key-management-service-02](https://tools.ietf.org/html/draft-abiggs-saag-key-management-service-02)].

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<a name='toc'>

- [Installing](#installing)
- [Basics](#basics)
- [KeyObjects](#keyobjects)
  - [Creating](#creating)
  - [Importing/Exporting](#importingexporting)
  - [Obtaining a `node-jose` Key](#obtaining-a-node-jose-key)
- [Contexts](#contexts)
  - [Creating and Initializing](#creating-and-initializing)
  - [Generating an Ephemeral EC Key](#generating-an-ephemeral-ec-key)
  - [Deriving an Ephemeral Shared Key](#deriving-an-ephemeral-shared-key)
- [Requests](#requests)
  - [Creating](#creating-1)
  - [Wrapping](#wrapping)
- [Responses](#responses)
  - [Creating](#creating-2)
  - [Unwrapping](#unwrapping)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installing ##

To install the latest from [NPM](https://npmjs.com/):

```
  npm install node-kms
```

Or to install a specific release:

```
  npm install node-kms@0.3.0
```

Alternatively, the latest unpublished code can be installed directly from the repository:

```
  npm install git+ssh://git@github.com:cisco/node-kms.git
```

## Basics ##

Require the library as normal:

```
var KMS = require('node-kms');
```

This library uses [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) for many operations.

This library supports [Browserify](http://browserify.org/).  To use in a web browser, `require('node-kms')` and bundle with the rest of your app.

## KeyObjects ##

A KMS KeyObject wraps a JSON Web Key (JWK) to provide more semantics: a URI to locate it; the creating user and client; the date/time of when a key is created, bound, and/or expires; and the owning resource (once bound).

### Creating ###

To create an empty KeyObject:

```
var keyobj = new KMS.KeyObject();
```

None of the KMS.KeyObject properties are set.

Alternatively, to create a KeyObject from a JSON or POJO representation:

```
// {input} is one of:
// *  a JSON object (where date/times are RFC3339-encoded Strings)
// *  a POJO (where date/times are Date objects)
var keyobj = new.KeyObject(input);
```

### Importing/Exporting ###

**NOTE**: The JSON representation includes all properties for a KeyObject, including the full JWK (if present).  This can expose secret key material if not carefully handled; do not save to durable storage without protecting it (e.g., encrypting to a JWE).

To import a KeyObject from a JSON object:

```
// {input} is one of:
// *  a JSON object (where date/times are RFC3339-encoded Strings)
// *  a POJO (where date/times are Date objects)
// *  an existing KeyObject instance
keyobj = KMS.fromObject(input);
```

In the case where `input` is already a KeyObject, it is returned as-is.

To export a KeyObject to a JSON object:

```
var output = keyobj.toJSON();
```

### Obtaining a `node-jose` Key ###

To convert the `jwk` property of a KeyObject to a `node-jose` Key (to use for encryption or signatures):

```
var jwk;
keyobj.asKey().
    then(function(result) {
      // {result} is a jose.JWK.Key
      jwk = result;
    });
```

If `jwk` is not set on the KeyObject, the returned Promise is rejected.

## Contexts ##

The KMS.Context holds onto information necessary to wrap Requests and unwrap Responses.

### Creating and Initializing ###

To create an empty Context:

```
var kmsCtx = new KMS.Contet();
```

None of the Context properties are set.

To finish initializing the Context, set the `clientInfo` and `serverInfo` properties:

```
// {clientId} is a String containing an identifier for the client or session
// {userId} is a String containing the user's identifier
// {oauth2token} is a String containing an OAuth2 Bearer token
kmsCtx.clientInfo = {
  clientId: clientId,
  credential: {
    userId: userId,
    bearer: oauth2token
  }
};
// {serverPublicKey} is a JWK JSON object
kmsCtx.serverInfo = {
  key: serverPublicKey
};
```

### Generating an Ephemeral EC Key ###

To create a KeyObject representing the local ECDH key:

```
kmsCtx.createECDHKey().
    then(function(result) {
      // {result} is a KMS.KeyObject wrapping a "EC" JWK
      kmsCtx.ephemeralKey = result;
    })
```

### Deriving an Ephemeral Shared Key ###

To derive an ephemeral shared key -- such as the result of the ECDHE handshake:

```
// {remoteECDH} is a KMS.KeyObject wrapping a "EC" JWK
kmsCrx.deriveEphemeralKey(remoteECDH).
    then(function(result) {
      // {result} is a KMS.KeyObject wrapping a "oct" JWK
      kmsCtx.ephemeralKey = result;
    });
```

## Requests ##

The KMS.Request embodies a single request from a client to the KMS.

A Request instance has the following (read/write) properties:

* `body` -- the full (plaintext) JSON to be sent to the KMS
* `requestId` -- the unique id for this request
* `uri` -- the URI of the request (e.g., "/ecdhe/", "/resources", etc.)
* `method` -- the method (verb) for the request (e.g., "create", "retrieve", etc.)
* `wrapped` -- the wrapped (encrypted) `body`

When a new `body` is set, the previous `requestId`, `method`, and `uri` are remembered, overwriting any new values that might have been in the provided JSON.

### Creating ###

To create an empty request:

```
var request = new KMS.Request();
```

To create a request starting with a constructed body:

```
// {input} is a JSON object representing the request 
var request = new KMS.Request(input);
```

### Wrapping ###

To wrap (encrypt) the Request into a JWE for transmitting to a KMS server, using an ephemeral shared key:

```
var output;
request.wrap(kmsCtx).
    then(function(result) {
      // {result} is a String of the JWE in the Compact Serialization
      // request.wrapped is also set to {result}
      output = result;
    });
```

## Responses ##

The KMS.Response embodies a single response to a client from the KMS.

A Response instance has the following (read/write) properties:

* `body` -- the full (plaintext) JSON received from the KMS
* `requestId` -- the id for the corresponding request
* `status` -- the status code of the response
* `reason` -- the string reason (if any)
* `wrapped` -- the protected (encrypted or signed) `body`

### Creating ###

To create an empty KMS.Response:

```
var response = new KMS.Response();
```

To creat a KMS.Response with a received wrapped body:

```
// {input} is a String of the JWE (or JWS) using the Compact Serialization
var response = new KMS.Response(input);
```

### Unwrapping ###

To unwrap a response into the plaintext body:

```
var input;
response.unwrap(kmsCtx).
    then(function(result) {
      // {result} is the plaintext JSON object
      // response.body is also set to {result}
      input = result;
    });
```
