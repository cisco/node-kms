/**
 * webpack.min.config.js - Webpack configuration for minified build
 *
 * Copyright (c) 2025 Cisco Systems, Inc. See LICENSE file.
 */
'use strict';

const config = require('./webpack.config.js');

// Create a new configuration for minified output
const minConfig = {
  ...config,
  output: {
    ...config.output,
    filename: 'node-kms.min.js'
  },
  optimization: {
    minimize: true
  }
};

module.exports = minConfig;
