let gulp = require('gulp'),
  cheerio = require('gulp-cheerio');

gulp.task('+v', function() {
  
  // Get Build # as arg
  //var option, i = process.argv.indexOf("--set-build-version");
  
  
      
    //option = process.argv[i+1];

    return gulp.src('config.xml')
      .pipe(cheerio({
        parserOptions: {
          xmlMode: true
        },
        run: function ($, file, done) {
        
          var old_version = $('widget').attr('version');
          var new_version = parseInt(old_version.split('.')[2]) + 1;
          new_version = '0.2.' + new_version;
          $('widget').attr('version', new_version);
          console.log('Update from '+old_version+' to ' + new_version);
  
          done();
        }
    }))
    .pipe(gulp.dest('./'));
  });
