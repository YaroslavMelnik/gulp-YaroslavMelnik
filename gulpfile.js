let project_folder = require("path").basename(__dirname);
let source_folder = "#src";

let fs = require('fs');

let path = {
	build: {
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/img/",
		favicons: project_folder + "/img/favicons/",
		fonts: project_folder + "/fonts/",
		video: project_folder + "/video/"
	},
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		css: source_folder + "/scss/style.scss",
		js: source_folder + "/js/script.js",
		img: [source_folder + "/img/**/*.{jpg,png,jpeg,svg,gif,ico,webp}", "!" + source_folder + "/img/favicons/**/*.*"],
		favicons: source_folder + "/img/favicons/**/*.{jpg,jpeg,png,gif}",
		fontsOtf: source_folder + "/fonts/*.otf",
		fonts: source_folder + "/fonts/*.ttf",
		fontsWoff: source_folder + "/fonts/*.{woff,woff2}",
		svg: source_folder + '/img/**/*.svg',
		video: source_folder + '/video/**/*.*'
	},
	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,jpeg,svg,gif,ico,webp}",
		favicons: source_folder + "/img/favicons/**/*.*",
		fontsOtf: source_folder + "/fonts/*.otf",
		fonts: source_folder + "/fonts/*.ttf",
		fontsWoff: source_folder + "/fonts/*.{woff,woff2}",
		svg: source_folder + '/img/**/*.svg',
		video: source_folder + '/video/**/*.*'
	},
	clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	webpack = require('webpack-stream'),
	scss = require('gulp-sass'),
	sassglob = require('gulp-sass-glob'),
	autoprefixer = require('gulp-autoprefixer'),
	group_media = require('gulp-group-css-media-queries'),
	plumber = require("gulp-plumber"),
	clean_css = require('gulp-clean-css'),
	rename = require("gulp-rename"),
	uglify = require('gulp-uglify-es').default,
	imagemin = require('gulp-imagemin'),
	webp = require('imagemin-webp'),
	// webp = require('gulp-webp'),
	webphtml = require('gulp-webp-html'),
	webpcss = require("gulp-webpcss"),
	newer = require('gulp-newer'),
	svgSprite = require('gulp-svg-sprite'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fonter = require('gulp-fonter'),
	favicons = require('gulp-favicons'),
	debug = require('gulp-debug');


function browserSync() {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/"
		},
		port: 3000,
		notify: false
	})
}

function html() {
	return src(path.src.html)
		.pipe(plumber())
		.pipe(fileinclude())
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}

function css() {
	return src(path.src.css)
		.pipe(plumber())
		.pipe(sassglob())
		.pipe(
			scss({
				outputStyle: "expanded"
			})
		)
		.pipe(
			group_media()
		)
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ['last 5 versions'],
				cascade: true
			})
		)
		.pipe(webpcss(
			{
				webpClass: "._webp",
				noWebpClass: "._no-webp"
			}
		))
		.pipe(dest(path.build.css))
		.pipe(clean_css())
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}

// function js() {
// 	return src(path.src.js)
// 		.pipe(fileinclude())
// 		.pipe(dest(path.build.js))
// 		.pipe(
// 			uglify()
// 		)
// 		.pipe(
// 			rename({
// 				extname: ".min.js"
// 			})
// 		)
// 		.pipe(dest(path.build.js))
// 		.pipe(browsersync.stream())
// }

function js() {
	return src(path.src.js)
		.pipe(plumber())
		.pipe(webpack({
			mode: 'production',
			performance: { hints: false },
			module: {
				rules: [
					{
						test: /\.(js)$/,
						exclude: /(node_modules)/,
						loader: 'babel-loader',
						query: {
							presets: ['@babel/env'],
							plugins: ['babel-plugin-root-import']
						}
					}
				]
			}
		})).on('error', function handleError() {
			this.emit('end')
		})
		.pipe(rename('script.min.js'))
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}

function images() {
	return src(path.src.img)
		.pipe(newer(path.build.img))
		.pipe(
			imagemin([
				webp({
					quality: 75
				})
			])
		)
		.pipe(
			rename({
				extname: ".webp"
			})
		)
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(newer(path.build.img))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
}

// function images() {
// 	return src(path.src.img)
// 		.pipe(
// 			webp({
// 				quality: 70
// 			})
// 		)
// 		.pipe(dest(path.build.img))
// 		.pipe(src(path.src.img))
// 		.pipe(
// 			imagemin({
// 				interlaced: true,
// 				progressive: true,
// 				optimizationLevel: 3,
// 				svgoPlugins: [
// 					{
// 						removeViewBox: false
// 					}
// 				]
// 			})
// 		)
// 		.pipe(dest(path.build.img))
// 		.pipe(browsersync.stream())
// }

function Favicons(params) {
	return src(path.src.favicons)
		.pipe(plumber())
		.pipe(favicons({
			icons: {
				appleIcon: true,
				favicons: true,
				online: true,
				appleStartup: false,
				android: true,
				firefox: false,
				yandex: false,
				windows: true,
				coast: true,
				html: 'index.html',
				pipeHTML: true,
				replace: true
			}
		}))
		.pipe(dest(path.build.favicons))
		.pipe(debug({
			"title": "Favicons"
		}))
}

function otf2ttf(params) {
	return src(path.src.fontsOtf)
		.pipe(plumber())
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(source_folder + '/fonts/'));
}

function fonts(params) {
	src(path.src.fonts)
		.pipe(plumber())
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts))
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts))
}

function video(params) {
	return src(path.src.video)
		.pipe(plumber())
		.pipe(dest(path.build.video))
}



function fontsWoff(params) {
	return src(path.src.fontsWoff)
		.pipe(plumber())
		.pipe(dest(path.build.fonts))
}

// gulp.task('otf2ttf', function () {
// 	return gulp.src([source_folder + '/fonts/*.otf'])
// 		.pipe(fonter({
// 			formats: ['ttf']
// 		}))
// 		.pipe(dest(source_folder + '/fonts/'));
// })



// gulp.task('svgSprite', function () {
// 	return gulp.src([source_folder + '/iconsprite/*.svg'])
// 		.pipe(svgSprite({
// 			mode: {
// 				stack: {
// 					sprite: "../icons/icons.svg",
// 					example: true
// 				}
// 			},
// 		}
// 		))
// 		.pipe(dest(path.build.img))
// })

function svgsprite() {
	return src(path.src.svg)
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../icons/icons.svg",
					example: true
				}
			},
		}
		))
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
}

function fontsStyle() {
	let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
	if (file_content == '') {
		fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}

function cb() { }

function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
	gulp.watch([path.watch.fontsOtf], otf2ttf);
	gulp.watch([path.watch.fonts], fonts);
	gulp.watch([path.watch.fontsWoff], fontsWoff);
	gulp.watch([path.watch.svg], svgsprite);
	gulp.watch([path.watch.favicons], Favicons);
	gulp.watch([path.watch.video], video);
}

function clean() {
	return del(path.clean)
}


let build = gulp.series(clean, gulp.parallel(js, css, html, images, video, Favicons, otf2ttf, fonts, fontsWoff, svgsprite), gulp.parallel(fontsStyle));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.video = video;
exports.Favicons = Favicons;
exports.svgsprite = svgsprite;
exports.fontsStyle = fontsStyle;
exports.otf2ttf = otf2ttf;
exports.fontsWoff = fontsWoff;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;