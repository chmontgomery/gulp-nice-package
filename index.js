'use strict';
var gutil = require('gulp-util'),
  PJV = require('package-json-validator').PJV,
  through = require('through2');

function printErrors(results) {
  if (results) {

    if (results.critical) {
      gutil.log(gutil.colors.red('Critical Error: ' + results.critical));
    }

    if (results.errors) {
      gutil.log(gutil.colors.underline.red('Errors:'));

      results.errors.forEach(function (error) {
        gutil.log('  ' + gutil.colors.red(error));
      });
    }

    if (results.warnings) {
      gutil.log(gutil.colors.underline.yellow('Warnings:'));

      results.warnings.forEach(function (warn) {
        gutil.log('  ' + gutil.colors.yellow(warn));
      });
    }

    if (results.recommendations) {
      gutil.log(gutil.colors.underline('Recommendations:'));

      results.recommendations.forEach(function (rec) {
        gutil.log('  ' + rec);
      });
    }

    if (results.valid) {
      gutil.log(gutil.colors.green('package.json is valid'));
    } else {
      gutil.log(gutil.colors.red('package.json is INVALID'));
    }

  } else {
    throw new gutil.PluginError('gulp-nice-package', 'Failed to get results from validator');
  }
}

var nicePackagePlugin = function (spec, options) {

  function validate(file, enc, cb) {

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-nice-package', 'Streaming not supported'));
      return cb();
    }

    var results = PJV.validate(file.contents.toString(), spec, options);

    printErrors.call(this, results);

    file.nicePackage = results;

    this.push(file);
    cb();
  }

  return through.obj(validate);
};

nicePackagePlugin.failOnError = function () {
  return through.obj(function (file, enc, cb) {
    var error = null;

    function size(arr) {
      return arr ? arr.length : 0;
    }

    if (file.nicePackage.valid === false) {
      error = new gutil.PluginError(
        'gulp-nice-package',
        'Failed with ' +
            size(file.nicePackage.errors) + ' error(s), ' +
            size(file.nicePackage.warnings) + ' warning(s), ' +
            size(file.nicePackage.recommendations) + ' recommendation(s)'
      );
    }

    return cb(error, file);
  });
};

module.exports = nicePackagePlugin;
