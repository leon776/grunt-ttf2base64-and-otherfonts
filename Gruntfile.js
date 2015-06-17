module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['test/less/*-base64.less', 'test/font/*.svg', 'test/font/*.woff', 'test/font/*.eot']
    },
    // sample configuration
    ttf2base64_and_otherfonts: {
      default: {
        files: [{
          src : ['test/less/ico.less']//要监听的css文件
        }],
        options: {
          dest: 'test/font'//字体文件读取/输出目录
        }
      }
    },
    // Unit tests.
    nodeunit: {
      tests: ['test/test*.js']
    }
  });
  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'ttf2base64_and_otherfonts');
  grunt.registerTask('test', ['clean', 'default', 'nodeunit']);

};
