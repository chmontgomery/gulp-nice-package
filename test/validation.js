'use strict';
var gutil = require('gulp-util'),
  validator = require('./../index.js'),
  assert = require('assert');

function createPackageFile(path) {
  return new gutil.File({
    contents: new Buffer(JSON.stringify(require(path)))
  });
}

function createInvalidPackageFile() {
  return createPackageFile('./fixtures/package-with-errors.json');
}

function createValidPackageFile() {
  return createPackageFile('./fixtures/package-valid.json');
}

it('should have invalid json file', function (cb) {
  var stream = validator();

  stream.on('data', function (file) {
    assert.ok(!file.nicePackage.valid);
    assert.deepEqual(file.nicePackage.errors, ["Missing required field: name"]);
    cb();
  });

  stream.write(createInvalidPackageFile());
});

it('should have valid json file', function (cb) {
  var stream = validator();

  stream.on('data', function (file) {
    assert.ok(file.nicePackage.valid);
    cb();
  });

  stream.write(createValidPackageFile());
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

    stream.write(createInvalidPackageFile());
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

    stream.write(createValidPackageFile());
    stream.end();
  });
});
