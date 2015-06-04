module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    // sample configuration
    ttf2base64_and_otherfonts: {
      default: {
        files: [{
          src : ['test/less/*.less']//要监听的css目录
        }],
        options: {
          dest: 'test/font'
        }
      }
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'ttf2base64_and_otherfonts');

};
