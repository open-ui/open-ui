var gulp = require('gulp'),
    pkg = require('./package.json'),
    browserSync = require('browser-sync'),
    plugins = require("gulp-load-plugins")({
        pattern: ['gulp-*', 'gulp.*'],
        replaceString: /\bgulp[\-.]/
    }),
    banner = ['/**',
        ' * <%= pkg.title || pkg.name %>',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.homepage %>',
        ' * @copyright (c)<%= new Date().getFullYear() %> <%= pkg.author.name %>',
        ' * @license <%= pkg.licenses[0].type %> (<%= pkg.licenses[0].url %>)',
        ' */',
        ''
    ].join('\n');


gulp.task('build:styles', function() {
    return gulp.src(['src/**/*.less', '!src/**/*variables*.less'], {
            base: './'
        }) // exclude LESS variables, as these cant compile to CSS, so produce a blocker
        .pipe(plugins.plumber())
        .pipe(plugins.less())
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 version', 'ie 8', 'ie 9'],
            cascade: true
        }))
        .pipe(plugins.csslint({
            'box-sizing': false, // intentional
            'box-model': false, // intentional
            'adjoining-classes': false, // LESS artefact
            'compatible-vendor-prefixes': false, // handled by autoprefixer
            'outline-none': false, // ...!
            'import': false, // allows LESS importing
            'overqualified-elements': false, // allows class combinators
            'fallback-colors': false, // intentional browser support
            'bulletproof-font-face': false, // Subject to Google webfonts code..
            'known-properties': false // SVG related, e.g. 'stroke' otherwise not recognised
        }))
        .pipe(plugins.csslint.reporter())
        .pipe(plugins.concatCss(pkg.name + '.css')) // use concat css instead of concat to rebase @import statements to start
        .pipe(plugins.minifyCss())
        .pipe(plugins.rename(pkg.name + '.min.css'))
        .pipe(plugins.header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build:js', function() {
    return gulp.src('src/**/*.js', {
            base: './'
        })
        .pipe(plugins.plumber())
        .pipe(plugins.jshint({
            'multistr': true // inline templates
        }))
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.concat(pkg.name + '.js'))
        .pipe(plugins.uglify())
        .pipe(plugins.rename(pkg.name + '.min.js'))
        .pipe(plugins.header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('browser-sync', function() {
    var files = [
        'dist/*.css',
        'dist/*.js',
        '*.html'
    ];
    browserSync.init(files, {
        server: {
            baseDir: './'
        }
    });
});

gulp.task('watch', ['browser-sync'], function() {
    gulp.watch('src/**/*.less', ['build:styles', 'bump', 'zip']);
    gulp.watch('src/**/*.js', ['build:js', 'bump', 'document', 'zip']);
    return true;
});

gulp.task('document', function() {
    plugins.run('yuidoc').exec();
});

gulp.task('bump', function() {
    return gulp.src('./package.json')
        .pipe(plugins.plumber())
        .pipe(plugins.bump({
            type: 'patch'
        }))
        .pipe(gulp.dest('./'));
});
gulp.task('zip', function() {
    return gulp.src(['dist/**/*.js', 'dist/**/*.css'])
        .pipe(plugins.zip(pkg.name + '.zip'))
        .pipe(gulp.dest('dist/'));
});
gulp.task('replace', function() {
    return gulp.src('src/**/*.*', {
            base: './'
        })
        .pipe(plugins.plumber())
        .pipe(plugins.replace('oui', '$ui'))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['watch']);
gulp.task('travis', ['build:styles', 'build:js']);
