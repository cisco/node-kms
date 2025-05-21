/**
 * webpack.config.js - Webpack configuration
 *
 * Copyright (c) 2025 Cisco Systems, Inc. See LICENSE file.
 */
"use strict";

const path = require('path');

module.exports = {
  mode: 'production',
  entry: './lib/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'node-kms.js',
    library: 'nodeKms',
    libraryTarget: 'umd',
    globalObject: 'this',
    chunkFormat: 'array-push'
  },
  target: 'web',
  optimization: {
    minimize: false
  }
};
