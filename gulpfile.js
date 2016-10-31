var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('default', ['scripts', 'scripts-minify']);

gulp.task('scripts', function() {
  return gulp.src(['Micro.js', './src/*.js'])
    .pipe(concat('micro.js'))
    .pipe(gulp.dest('./build/'));
});

gulp.task('scripts-minify', function() {
  return gulp.src(['Micro.js', './src/*.js'])
    .pipe(concat('micro.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/'));
});
