var gulp = require('gulp');
var validate = require('../../index');

gulp.task('validate-json', function () {
  return gulp.src('package.json')
    .pipe(validate());
});