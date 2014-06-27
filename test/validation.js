'use strict';
var gutil = require('gulp-util'),
  validator = require('./../index.js'),
  assert = require('assert');

it('should have invalid json file', function (cb) {
  var stream = validator();

  stream.on('data', function (file) {
    assert.ok(!file.nicePackage.valid);
    assert.deepEqual(file.nicePackage.errors, ["Missing required field: author"]);
    cb();
  });

  stream.write(new gutil.File({
    contents: new Buffer(JSON.stringify(require('./fixtures/package-with-errors.json')))
  }));
});

it('should have valid json file', function (cb) {
  var stream = validator();

  stream.on('data', function (file) {
    assert.ok(file.nicePackage.valid);
    cb();
  });

  stream.write(new gutil.File({
    contents: new Buffer(JSON.stringify(require('./fixtures/package-valid.json')))
  }));
});