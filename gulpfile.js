var gulp = require("gulp");

var jade = require("gulp-jade");
var stylus = require("gulp-stylus");
var webpack = require("gulp-webpack");
var named = require("vinyl-named");
var babel = require("gulp-babel");

gulp.task("views", function(){
	gulp.src("src/*.jade")
		.pipe(jade({
			pretty: true
		}).on("error", console.error))
		.pipe(gulp.dest("dist/public"));
});

gulp.task("scripts", function(){
	gulp.src(["src/js/client/index.js","src/js/client/jpeg-worker.js"])
		.pipe(named())
		.pipe(webpack(require("./webpack.config.js")))
		.pipe(gulp.dest("dist/public/js"));
});

gulp.task("server", function(){
	gulp.src("src/js/server/**/*.js")
		.pipe(babel({presets: ["es2015"]}).on("error", function(e){console.error(e.stack);}))
		.pipe(gulp.dest("dist"));
});

gulp.task("styles", function(){
	gulp.src("src/stylus/*")
		.pipe(stylus().on("error", console.error))
		.pipe(gulp.dest("dist/public/css"));
});

gulp.task("images", function(){
	gulp.src("src/images/*")
		.pipe(gulp.dest("dist/public/images"));
});

gulp.task("build", ["views", "server", "scripts", "styles", "images"]);

gulp.task("watch", ["build"], function(){
	gulp.watch("src/**/*", ["build"]);
});
