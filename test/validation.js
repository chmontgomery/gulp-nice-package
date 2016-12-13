'use strict';
var gutil = require('gulp-util'),
  validator = require('./../index.js'),
  assert = require('assert');

it('should have invalid json file', function (cb) {
  var stream = validator();

  stream.on('data', function (file) {
    assert.ok(!file.nicePackage.valid);
    assert.deepEqual(file.nicePackage.errors, ["Missing required field: name"]);
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

describe('failOnError', function () {
  it('should report an error when the json file is invalid', function (cb) {
    var errorReported = false;
    var stream = validator()
      .on('end', function () {
        assert.ok(errorReported);
        cb();
      });

    stream
      .pipe(validator.failOnError())
      .on('error', function (error) {
        errorReported = true;
        assert.strictEqual(error.message, 'Failed with 1 error(s), 3 warning(s), 2 recommendation(s)');
      });

    stream.write(new gutil.File({
      contents: new Buffer(JSON.stringify(require('./fixtures/package-with-errors.json')))
    }));
    stream.end();
  });

  it('should not report an error when the json file is valid', function (cb) {
    var errorReported = false;
    var stream = validator()
      .on('end', function () {
        assert.ok(!errorReported);
        cb();
      });

    stream
      .pipe(validator.failOnError())
      .on('error', function () {
        errorReported = true;
      });

    stream.write(new gutil.File({
      contents: new Buffer(JSON.stringify(require('./fixtures/package-valid.json')))
    }));
    stream.end();
  });
});
