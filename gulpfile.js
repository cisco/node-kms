/**
 * gulpfile.js - Gulp-based build
 *
 * Copyright (c) 2015 Cisco Systems, Inc. See LICENSE file.
 */
"use strict";

var ARGV = require("yargs").
    usage("$0 [options] task [task ...]").
    option("browsers", {
      type: "string",
      describe: "browsers to run tests in",
      default: ""
    }).
    option("sauce", {
      type: "boolean",
      describe: "use SauceLabs for tests/reporting",
      default: false
    }).
    help("help").
    argv;

var webpack = require("webpack-stream"),
    clone = require("lodash.clone"),
    del = require("del"),
    doctoc = require("gulp-doctoc"),
    gulp = require("gulp"),
    istanbul = require("gulp-istanbul"),
    karma = require("karma"),
    merge = require("lodash.merge"),
    mocha = require("gulp-mocha"),
    runSequence = require("run-sequence");

// ### 'CONSTANTS' ###
var SOURCES = ["./lib/**/*.js", "!(./lib/old/**/*.js)"],
    TESTS = "./test/**/*-test.js";

// ### HELPERS ###
var MOCHA_CONFIG = {
  timeout: 600000
};

// ### LINT TASKS ###
function doEslint() {
  var eslint = require("gulp-eslint");

  return gulp.src([
    "lib/**/*.js",
    "test/**/*.js",
    "gulpfile.js"
  ])
    .pipe(eslint())
    .pipe(eslint.format());
}

gulp.task("eslint", function() {
  return doEslint();
});

gulp.task("test:lint", function() {
  var eslint = require("gulp-eslint");
  return doEslint()
    .pipe(eslint.failOnError());
});

// ### CLEAN TASKS ###
gulp.task("clean:coverage:nodejs", function() {
  del("coverage/nodejs");
});
gulp.task("clean:coverage:browser", function() {
  del("coverage/browser");
});
gulp.task("clean:coverage", function() {
  del("coverage");
});

gulp.task("clean:dist", function() {
  del("dist");
});

// ### DOCUMENTATION TASKS ###
gulp.task("doc:readme", function() {
  gulp.src("./README.md").
       pipe(doctoc({
         title: "<a name='toc'>"
       })).
       pipe(gulp.dest("./"));
});

// ### NODEJS TASKS ###
function doTestsNodejs() {
  return gulp.src(TESTS).
              pipe(mocha(MOCHA_CONFIG));
}

gulp.task("test:nodejs:single", function() {
  return doTestsNodejs();
});

gulp.task("cover:nodejs", function() {
  return gulp.src(SOURCES).
              pipe(istanbul()).
              pipe(istanbul.hookRequire()).
              on("finish", function() {
                doTestsNodejs().
                pipe(istanbul.writeReports({
                  dir: "./coverage/nodejs",
                  reporters: ["html", "text-summary"]
                }));
              });
});

gulp.task("test:nodejs", function(cb) {
  runSequence("test:lint",
              "test:nodejs:single",
              cb);
});

// ### BROWSER TASKS ###
function doBrowserify(suffix, plugins) {
  var pkg = require("./package.json");

  suffix = suffix || ".js";
  plugins = plugins || [];

  return gulp.src(require("path").resolve(pkg.main)).
         pipe(webpack({
           output: {
             filename: pkg.name + suffix
           },
           plugins: plugins,
           devtool: "source-map"
         })).
         pipe(gulp.dest("./dist"));
}

gulp.task("bundle", function() {
  return doBrowserify();
});

gulp.task("minify", function() {
  return doBrowserify(".min.js", [
    new webpack.webpack.optimize.UglifyJsPlugin({
      minimize: true
    })
  ]);
});

var KARMA_CONFIG = {
  frameworks: ["mocha"],
  basePath: ".",
  browserNoActivityTimeout: 600000,
  client: {
    mocha: MOCHA_CONFIG
  },
  preprocessors: {
    "test/**/*-test.js": ["webpack"]
  },
  reporters: ["mocha"],
  customLaunchers: {
    "SL_Chrome": {
      base: "SauceLabs",
      browserName: "chrome"
    },
    "SL_Firefox": {
      base: "SauceLabs",
      browserName: "firefox"
    },
    "SL_Safari_8": {
      base: "SauceLabs",
      platform: "OS X 10.10",
      browserName: "safari",
      version: "8"
    },
    "SL_Safari_9": {
      base: "SauceLabs",
      platform: "OS X 10.11",
      browserName: "safari",
      version: "9"
    },
    "SL_IE_10": {
      base: "SauceLabs",
      browserName: "internet explorer",
      version: "10"
    },
    "SL_IE_11": {
      base: "SauceLabs",
      browserName: "internet explorer",
      platform: "Windows 8.1",
      version: "11"
    },
    "SL_EDGE": {
      base: "SauceLabs",
      browserName: "microsoftedge",
      platform: "Windows 10"
    }
  },
  captureTimeout: 600000,
  sauceLabs: {
    testName: require("./package.json").name
  },
  files: [TESTS]
};
var KARMA_BROWSERS = {
  local: ["Chrome", "Firefox"],
  saucelabs: ["SL_Chrome", "SL_Firefox", "SL_Safari_8", "SL_Safari_9", "SL_IE_10", "SL_IE_11", "SL_EDGE"]
};
// allow for IE on windows
if (/^win/.test(process.platform)) {
  KARMA_BROWSERS.local.push("IE");
}
// allow for Safari on Mac OS X
if (/^darwin/.test(process.platform)) {
  KARMA_BROWSERS.local.push("Safari");
}

gulp.task("test:browser:single", function(done) {
  var browsers = ARGV.browsers.split(/\s*,\s*/g).
                 filter(function (v) { return v; });

  var config = merge({}, KARMA_CONFIG, {
    singleRun: true
  });
  if (ARGV.sauce) {
    config = merge(config, {
      reporters: ["mocha", "saucelabs"],
      browsers: KARMA_BROWSERS.saucelabs
    });
  } else {
    config.browsers = KARMA_BROWSERS.local;
  }
  if (browsers.length) {
    config.browsers = config.browsers.filter(function(b) {
      b = b.replace("SL_", "");
      return -1 !== browsers.indexOf(b);
    });
  }

  karma.server.start(config, done);
});

gulp.task("test:browser:watch", function(done) {
  var config = clone(KARMA_CONFIG);

  karma.server.start(config, done);
});

gulp.task("test:browser", function(cb) {
  runSequence("test:lint",
              "test:browser:single",
              cb);
});

// ### MAIN TASKS ###
gulp.task("test", function(cb) {
  runSequence("test:lint",
              "test:browser:single",
              "test:nodejs:single",
              cb);
});
gulp.task("coverage", function(cb) {
  runSequence("test:lint",
              "cover:nodejs",
              cb);
});
gulp.task("clean", ["clean:coverage", "clean:dist"]);
gulp.task("dist", function(cb) {
  runSequence("clean:dist",
              "test:lint",
              "test:browser",
              ["bundle", "minify"],
              cb);
});

// ### MAIN WATCHERS ###
gulp.task("watch:test", ["test"], function() {
  return gulp.watch([SOURCES, TESTS], ["test:nodejs", "test:browser"]);
});

// ### DEFAULT ###
gulp.task("default", ["test"]);
