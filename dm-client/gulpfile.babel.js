'use strict';

import path from 'path';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import swPrecache from 'sw-precache';
import gulpLoadPlugins from 'gulp-load-plugins';
import pkg from './package.json';

const $ = gulpLoadPlugins();

const paths = {
  main: 'src/main',
  tmp: 'build/.tmp',
  dist: 'build/dist',
  vendors: [
    'node_modules/babel-polyfill/dist/polyfill.min.js',
    'node_modules/jquery/dist/jquery.slim.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/systemjs/dist/system.js',
    'node_modules/moment/min/moment-with-locales.min.js',
    'node_modules/markdown/lib/markdown.js'
  ]
};

const htmlMinifierConfig = {
  removeComments: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeOptionalTags: true
};

// Lint JavaScript
gulp.task('lint', () =>
  gulp.src(`${paths.main}/component/**/*.js`)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError())
);

// fonts
gulp.task('fonts', () =>
  gulp.src([`${paths.main}/fonts/**/*.*`, 'node_modules/bootstrap/dist/fonts/*.*'])
    .pipe($.newer(`${paths.dist}/fonts`))
    .pipe(gulp.dest(`${paths.dist}/fonts`))
);

// Optimize images
gulp.task('images', () =>
  gulp.src(`${paths.main}/images/**/*.{svg,png,jpg}`)
    .pipe($.newer(`${paths.tmp}/img`))
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      arithmetic:true
    }))
    .pipe($.size({title: 'images', showFiles: true}))
    .pipe(gulp.dest(`${paths.tmp}/img`))
    .pipe(gulp.dest(`${paths.dist}/img`))
);

gulp.task('images-webp', ['images'], () =>
  gulp.src(`${paths.tmp}/img/**/*.{png,jpg}`)
    .pipe($.webp())
    .pipe($.size({title: 'images'}))
    .pipe(gulp.dest(`${paths.dist}/img`))
);

// Copy all files at the root level(app) without html files
gulp.task('copy', () =>
  gulp.src(`${paths.main}/root/*`, { dot: true })
    .pipe(gulp.dest(`${paths.dist}`))
    .pipe($.size({title: 'copy'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  return gulp.src([`${paths.main}/component/**/*.less`, `${paths.main}/component/**/*.css`])
    .pipe($.newer(`${paths.tmp}/styles`))
    .pipe($.sourcemaps.init())
    .pipe($.less())
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest(`${paths.tmp}/styles`))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(`${paths.dist}/styles`));
});

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
gulp.task('scripts', () =>
    gulp.src(`${paths.main}/component/**/*.js`)
      .pipe($.newer(`${paths.tmp}/scripts`))
      .pipe($.sourcemaps.init())
      .pipe($.babel({
        "plugins": ["transform-es2015-modules-systemjs"]
      }))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest(`${paths.tmp}/scripts`))
      .pipe($.uglify({preserveComments: 'none'}))
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(`${paths.dist}/scripts`))
);

// Copy over the scripts that are used in importScripts as part of the generate-service-worker task.
gulp.task('vendors-scripts', () => {
  return gulp.src(paths.vendors)
    .pipe($.newer(`${paths.tmp}/scripts/vendors`))
    .pipe(gulp.dest(`${paths.tmp}/scripts/vendors`))
    .pipe($.if(!'*min.js', $.uglify({preserveComments: 'none'})))
    .pipe(gulp.dest(`${paths.dist}/scripts/vendors`));
});

// Scan your HTML for assets & optimize them
gulp.task('html-template', () => {
  return gulp.src(`${paths.main}/component/**/*.html`)
    .pipe($.htmlmin(htmlMinifierConfig))
    .pipe(gulp.dest(`${paths.tmp}`));
});

gulp.task('html', () => {
  return gulp.src([`${paths.main}/*.html`, `${paths.main}/component/**/*.html`])
    .pipe($.useref({
      searchPath: `{${paths.tmp},${paths.main}/component}`,
      noAssets: true
    }))
    .pipe($.if('*.html', $.htmlmin(htmlMinifierConfig)))
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest(paths.dist));
});

// Clean output directory
gulp.task('clean', () => del(['build'], {dot: true}));

// Watch files for changes
gulp.task('watch', ['default'], () => {
  gulp.watch([`${paths.main}/**/*.html`], ['html-template']);
  gulp.watch([`${paths.main}/**/*.less`], ['styles']);
  gulp.watch([`${paths.main}/**/*.js`], ['lint', 'scripts', 'vendors-scripts']);
  gulp.watch([`${paths.main}/**/*.{png,webp,svg,gif,jpg}`], ['images-webp']);
});

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'styles',
    ['lint', 'html', 'vendors-scripts', 'scripts', 'images', 'fonts', 'copy'],
    'generate-service-worker',
    cb
  )
);

// Copy over the scripts that are used in importScripts as part of the generate-service-worker task.
gulp.task('copy-sw-scripts', () => {
  return gulp.src(['node_modules/sw-toolbox/sw-toolbox.js', 'app/src/sw/runtime-caching.js'])
    .pipe(gulp.dest(`${paths.dist}/scripts/sw`));
});

// See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
// an in-depth explanation of what service workers are and why you should care.
// Generate a service worker file that will provide offline functionality for
// local resources. This should only be done for the 'dist' directory, to allow
// live reload to work as expected when serving from the 'app' directory.
gulp.task('generate-service-worker', ['copy-sw-scripts'], () => {
  const filepath = path.join(paths.dist, 'service-worker.js');
  return swPrecache.write(filepath, {
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: pkg.name || 'web-starter-kit',
    // sw-toolbox.js needs to be listed first. It sets up methods used in runtime-caching.js.
    importScripts: [
      'scripts/sw/sw-toolbox.js',
      'scripts/sw/runtime-caching.js'
    ],
    staticFileGlobs: [
      // Add/remove glob patterns to match your directory setup.
      `${paths.dist}/images/**/*`,
      `${paths.dist}/scripts/**/*.js`,
      `${paths.dist}/styles/**/*.css`,
      `${paths.dist}/*.{html,json}`
    ],
    // Translates a static file path to the relative URL that it's served from.
    // This is '/' rather than path.sep because the paths returned from
    // glob always use '/'.
    stripPrefix: paths.dist + '/'
  });
});
