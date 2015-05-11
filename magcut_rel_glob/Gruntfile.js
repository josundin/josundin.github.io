module.exports = function(grunt) {
    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
          concat: {
            options: {
              separator: ';',
            },
            dist: {
              src: [ 'ext_js/jquery-1.9.1.min.js',
              'ext_js/jsfeat-min.js', 
              'ext_js/numeric-1.2.6.min.js',
              'ext_js/underscore.js',  
              'ext_js/vector.js', 
              'ext_js/profiler.js',
              'ext_js/UntidyPriorityQueue.js', 

              "js/imagewarp.js",
              'js/findDiff.js', 
              'js/findBlobs.js', 
              'js/blobMan.js', 
              'js/interactMouse.js', 
              'js/poisson.js'],
              dest: 'dist/magcut.js',
            },

            dist1: {
              src: [ 'ext_js/jquery-1.9.1.min.js',
              'ext_js/jsfeat-min.js',
              'ext_js/numeric-1.2.6.min.js',
              'ext_js/underscore.js',
              'ext_js/vector.js',
              'ext_js/profiler.js',
              'ext_js/UntidyPriorityQueue.js', 

              "js/orbObj.js",
              "js/imagewarp.js",
              'js/findDiff.js',
              'js/findBlobs.js',
              'js/blobMan.js',
              'js/interactMouse.js',
              'js/poisson.js',
              'js/layout.js'],
              dest: 'dist/magcutApp.js',
            },

            dist2: {
              src: [ 'js/relativeBlobTreshold.js','js/selectview.js', 'pipe/mainDemo.js', 'js/blobObj.js'],
              dest: 'dist/mainDemo.js',
            },

            dist3: {
              src: [ 'js/relativeBlobTreshold.js','js/selectview.js', 'pipe/mainApp.js', 'js/blobObj.js'],
              dest: 'dist/mainApp.js',
            }

          },
          uglify: {
            build: {
                src: 'dist/magcut.js',
                dest:'../josundin.github.io/magcut/magcut.min.js'
            },
            build1: {
                src: 'dist/magcutApp.js',
                dest:'../josundin.github.io/magcut/magcutApp.min.js'
            },
            build2: {
                src: 'dist/mainDemo.js',
                // dest:'dist/mainDemo.min.js'
                dest:'../josundin.github.io/magcut/mainDemo.min.js'      
            },
            build3: {
                src: 'dist/mainApp.js',
                // dest:'dist/mainApp.min.js'
                dest:'../josundin.github.io/magcut/mainApp.min.js'
            }
          }
    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    // grunt.registerTask('default', ['concat']);
    grunt.registerTask('default', [
        'concat',
        'uglify'
    ]);
};



