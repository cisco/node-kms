"use strict";

module.exports = {
  env: {
    node: true,
    mocha: true
  },
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    "no-shadow": 0,
    "no-underscore-dangle": 0,
    "strict": [2, "global"],
    "yoda": 0
  }
};
