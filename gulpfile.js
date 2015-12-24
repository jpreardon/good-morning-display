var gulp = require('gulp')
var del = require('del')

// The following requires were taken from the Wes Bos's files
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var gutil = require('gulp-util')
var uglify = require('gulp-uglify')
var babelify = require('babelify');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var historyApiFallback = require('connect-history-api-fallback')
var watchify = require('watchify')
var notify = require('gulp-notify')

var paths = {
  html : 'index.html',
  styles : 'css/**/*',
  scripts : 'scripts/main.js'
}

// Delete everything in the build directory
gulp.task('clean', function() {
  return del(['build/*'])
})

// Copy Styles
gulp.task('styles', function() {
  gulp.src(paths.styles)
    .pipe( gulp.dest('build/css') )
})

// Stolen from Wes Bos's file
function buildScript(file, watch) {
  var props = {
    entries: ['./scripts/' + file],
    debug : true,
    transform:  babelify.configure({presets: ["es2015", "react"]})
  };

  // watchify() if watch requested, otherwise run browserify() once
  var bundler = watch ? watchify(browserify(props)) : browserify(props);

  function rebundle() {
    var stream = bundler.bundle();
    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(gulp.dest('./build/scripts/'))
      // If you also want to uglify it
      // .pipe(buffer())
      // .pipe(uglify())
      // .pipe(rename('app.min.js'))
      // .pipe(gulp.dest('./build'))
      .pipe(reload({stream:true}))
  }

  // listen for an update and run rebundle
  bundler.on('update', function() {
    rebundle()
    gutil.log('Rebundle...')
  })

  // run it once the first time buildScript is called
  return rebundle();
}

gulp.task('browser-sync', function() {
    browserSync({
        // we need to disable clicks and forms for when we test multiple rooms
        server : {},
        middleware : [ historyApiFallback() ],
        ghostMode : false
    })
})

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

gulp.task('scripts', function() {
  return buildScript('main.js', false); // this will run once because we set watch to false
});

gulp.task('misc', function() {
  gulp.src(['js/foundation.min.js', 'js/vendor/jquery.js'])
    .pipe( gulp.dest('build/scripts') )
})

// The default task
gulp.task('default', ['clean', 'styles', 'scripts', 'misc', 'browser-sync'], function() {
  gulp.watch('css/**/*', ['styles'])
  return buildScript('main.js', true)
})
