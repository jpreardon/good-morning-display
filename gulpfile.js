var gulp = require('gulp')
var del = require('del')
var babelify = require('babelify');


// The following requires were taken from the Browserify + Transforms
// recipe: https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-transforms.md
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var gutil = require('gulp-util')
var uglify = require('gulp-uglify')
var sourcemaps = require('gulp-sourcemaps')
var reactify = require('reactify')

var paths = {
  html : 'index.html',
  css : ['css/app.css', 'css/normalize.css', 'css/foundation.min.css'],
  scripts : 'scripts/main.js'
}

// Delete everything in the build directory
gulp.task('clean', function() {
  return del(['build/*'])
})

// Copy index.html
gulp.task('copy-html', ['clean'], function() {
  gulp.src(paths.html)
    .pipe(gulp.dest('build/'))
})

// Copy CSS
gulp.task('copy-css', ['clean'], function() {
  gulp.src(paths.css)
    .pipe( gulp.dest('build/css') )
})

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

// Copy Scripts (will run through babel at some point with .pipe(babelfy()) before the dest)
// From browserify + transforms recipe
gulp.task('copy-scripts', ['clean'], function() {

  var b = browserify({
    entries : 'scripts/main.js',
    debug : true,
    transform : babelify.configure({presets: ["es2015", "react"]})
  })

  return b.bundle()
    .pipe(source('scripts/main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
      //.pipe(uglify())
      .on('error', handleErrors)
    //.pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/'))
})

// The default task
gulp.task('default', ['copy-html', 'copy-css', 'copy-scripts'], function() {

})


// 1A) In the process of doing that, I want to send them through babel to convert JSX and ES6 to ES5
// spin up a local server and browser sync
// Watch for changed files and run through the build process each time (sync browser)
