'use strict';

module.exports = function (grunt) {

  // Show elapsed time after tasks run to visualize performance
  require('time-grunt')(grunt);
  // Load all Grunt tasks that are listed in package.json automagically
  require('load-grunt-tasks')(grunt);


  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

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
         js: {
           files: ['src/js/*.js'],
           tasks: ['uglify:dev']
         }
       },

       /**
        * Concatenate css files.
        */
      //  cssmin: {
      //    options: {
      //      shorthandCompacting: false,
      //      roundingPrecision: -1
      //    },
      //    target: {
      //      files: {
      //        'public/styles.css': [
      //          'public/css/style.css',
      //          'public/css/poole.css',
      //          'public/css/lanyon.css',
      //          'public/css/syntax.css'
      //        ]
      //      }
      //    }
      //  }

      concat: {
        options: {
          separator: ';',
        },
        dist: {
          src: [
            'src/scss/style.scss',
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
        }
      }
  });

  // Load the plugins!
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-sass');


  // During dev, the javascript will stay beautiful! 'grunt'
  grunt.registerTask('default', ['uglify:dev', 'concat', 'sass:dev']);

  // When deploying to prod.
  grunt.registerTask('build', ['uglify:build']);
};
