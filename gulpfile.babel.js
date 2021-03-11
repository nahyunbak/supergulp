//설치하기
//import에 변수명 from 플러그인 써주기 
import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";


sass.compiler = require("node-sass")
//3대 변수를 routes에 설정: watch(지켜볼 파일)와 src(컴파일할 파일들)와 dest(종착지) 
const routes = {
    pug: {
        watch: "src/**/*.pug",
        src: "src/*.pug",
        dest: "build"
    },
    img: {
        src: "src/img/*",
        dest: "build/img"
    },
    scss:{
        watch: "src/scss/**/*.scss",
        src:"src/scss/style.scss",
        dest: "build/css"
    }, 
    js: {
        watch: "src/js/**/*.js",
        src: "src/js/main.js",
        dest: "build/js"
    }
};

//task를 
//상수 =함수 gulp .src(routes변수를 이용한 위치) . pipe(import한 기능 .pipe(gulp.dest(routes 변수를 이용한 위치)) 
//로 설정 



const pug = () => 
    gulp
    .src(routes.pug.src)
    .pipe(gpug())
    .pipe(gulp.dest(routes.pug.dest));

//clean: 지우기 
const clean = () => del(["build/", ".publish"]);

const webserver = () => 
    gulp.src("build").pipe(ws({ livereload: true, open: true}));

//gh: 깃허브 build폴더 안에 있는 모든 파일로 ghPages를 실행 
const gh = () => gulp.src("build/**/*").pipe(ghPages());

//상수 watch = 함수 gulp.watch(a, b)
//의미: a를(보통 특정 확장자의 파일들) 지켜봐서 변화가 생기면 b를 실행해라 
const watch = () => {
    gulp.watch(routes.pug.watch, pug);
    gulp.watch(routes.pug.watch, img);
    gulp.watch(routes.scss.watch, styles);
    gulp.watch(routes.js.watch, js);

};

const img = () => 
    gulp
    .src(routes.img.src)
    .pipe(image())
    .pipe(gulp.dest(routes.img.dest));

const styles = () => 
    gulp
    .src(routes.scss.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(
        autoprefixer({
            browsers: ["last 2 versions"]
        })
    )
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));

const js = () => 
    gulp
    .src(routes.js.src)
    .pipe(bro({
        transform: [babelify.configure({presets:["@babel/preset-env"]}), ["uglifyify", {global: true}]]
    })
    ).pipe(gulp.dest(routes.js.dest));

//시리즈에 task를 정리하여 넣은 것을 또 변수로 정리   
const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

const live = gulp.series([webserver, watch]);

//마지막에 export하기 
export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, gh, clean]);