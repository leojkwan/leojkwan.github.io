'use strict';

module.exports = function (grunt) {

  // Show elapsed time after tasks run to visualize performance
  require('time-grunt')(grunt);
  // Load all Grunt tasks that are listed in package.json automagically
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    /**
     * Shell commands for use in Grunt tasks.
     */

    shell: {
      jekyllBuild: {
        command: 'jekyll build'
      },
      jekyllServe: {
        command: 'jekyll serve'
      }
    },

    connect: {
      server: {
        options: {
          port: 4000,
          base: '_site'
        }
      }
    },

    /**
     * Uglifies shrinks my js.
     */

    uglify : {
      build: {
        src: 'src/js/*.js',
        dest: 'js/script.min.js'
      },
      dev: {
        options: {
          beautify:true,
          mangle: false,
          compress:false,
          preserveComments: 'all'
        },
        src: 'src/js/*.js',
        dest: 'js/script.min.js'
      }
    },
    /**
     * Live reload.
     */

     watch: {
       livereload: {
         files: [
           'src/js/*.js',
           'src/scss/*.scss',
           '_config.yml',
           'pages/**',
           '_includes/**',
           'index.html',
           '_layouts/**',
           '_posts/**'
         ],
         tasks: ['uglify:dev', 'concat', 'sass:dev', 'shell:jekyllBuild'],
         options: {
           livereload: true
         }
       },
       js: {
         files: ['src/js/*.js'],
         tasks: ['uglify:dev']
       },
       css: {
         files: ['src/scss/*.scss'],
         tasks: ['sass:dev']
       }
     },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: [
          'src/scss/poole.scss',
          'src/scss/lanyon.scss',
          'src/scss/syntax.scss',
          'src/scss/tags.scss'
       ],
       dest: 'src/scss/styles.scss'
      }
    },

    sass: {
      dev: {
        options: {
          outputStyle: 'expanded'
        },
        files: {
          'public/css/styles.css' : 'src/scss/styles.scss'
        }
      },
      build: {
        options: {
          outputStyle: 'compressed'
        },
        files: {
          'public/css/styles.css' : 'src/scss/styles.scss'
        }
      }
    }
  });

  // Load the plugins!
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-sass');

  // During dev, the javascript will stay beautiful! 'grunt'
  grunt.registerTask('default', ['uglify:dev', 'concat', 'sass:dev', 'shell:jekyllBuild', 'connect', 'watch']);

  // assets UGLIFY. Deploying to production.
  grunt.registerTask('build', ['uglify:build', 'concat', 'sass:build']);
};
