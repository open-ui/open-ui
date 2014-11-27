var gulp = require('gulp'),
    pkg = require('./package.json'),
    browserSync = require('browser-sync'),
    del = require('del'),
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

function errorHandler (error) {
  console.log(error.toString());
  this.emit('end');
}	
	
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
        .pipe(gulp.dest('dist/'))
        .pipe(gulp.dest('../public-site/dist/css/')); // copy as resource for public website
});

gulp.task('build:templates', function() {
    return gulp.src('src/**/*.tpl.html', {
            base: './'
        })
		.pipe(plugins.plumber())
        .pipe(plugins.jshtml({
            invoke: '$ui.templateCache'
        })).on('error', errorHandler)
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.uglify())
        .pipe(plugins.concat(pkg.name + '.tpl.js'))
        .pipe(gulp.dest('dist/'));
});
gulp.task('build:js', ['build:templates'], function() {
    return gulp.src(['src/**/*.js', 'dist/**/*.tpl.js'], {
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
        .pipe(gulp.dest('dist/'))
        .pipe(gulp.dest('../public-site/dist/js/')); // copy as resource for public website
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
    gulp.watch(['src/**/*.tpl.html', 'src/**/*.js'], ['build:templates', 'build:js', 'clean', 'bump', 'document', 'zip']);
    return true;
});
gulp.task('document', ['build:templates', 'build:js'], function() {
    plugins.run('yuidoc').exec();
});
gulp.task('clean', ['build:templates', 'build:js'], function() {
    del('dist/**/*.tpl.js', function (err) {
		console.log('Files deleted');
	});
});
gulp.task('bump', function() {
    return gulp.src('./package.json')
        .pipe(plugins.plumber())
        .pipe(plugins.bump({
            type: 'patch'
        }))
        .pipe(gulp.dest('./'));
});
gulp.task('zip', ['clean', 'build:styles'], function() {
    return gulp.src(['dist/**/*.js', 'dist/**/*.css'])
        .pipe(plugins.zip(pkg.name + '.zip'))
        .pipe(gulp.dest('dist/'));
});
gulp.task('default', ['watch']);
gulp.task('travis', ['build:styles', 'build:js']);
