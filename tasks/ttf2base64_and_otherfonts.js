/*
 * grunt-ttf2base64-and-otherfonts
 * https://github.com/leon776/grunt-ttf2base64-and-otherfonts
 *
 * Copyright (c) 2015 xiaoweili
 * Licensed under the MIT license.
 */

'use strict';
var ttf2woff = require('ttf2woff'),
    ttf2eot = require('ttf2eot'),
    ttf2svg = require('ttf2svg'),
    path = require('path'),
    grunt = require('grunt'),
    fs = require('fs'),
    mime = require('mime');
//转换ttf字体文件
var transferTtf = function(ttfFile, dest) {
  var buffer = fs.readFileSync(dest + '/' + path.basename(ttfFile));
  var ttf = new Uint8Array(buffer);
  var mimeType = mime.lookup(ttfFile);
  var _2woff = function() {
      var woff = new Buffer(ttf2woff(ttf).buffer);
      fs.writeFileSync(dest + path.basename(ttfFile, '.ttf') + '.woff', woff);
      return woff;
    },
    _2eot = function() {
      var eot = new Buffer(ttf2eot(ttf).buffer);
      fs.writeFileSync(dest + path.basename(ttfFile, '.ttf') + '.eot', eot);
      return eot;
    },
    _2svg = function() {
      //var svg = ttf2svg(buffer);
      var svg = new Buffer(ttf2svg(buffer));
      fs.writeFileSync(dest + path.basename(ttfFile, '.ttf') + '.svg', svg);
      return svg;
    },
    /**
     * Base64 encodes an image and builds the data URI string
     *
     * @param {string} mimeType - Mime type of the image
     * @param {string} img - The source image
     * @returns {string} base64 encoded string
     */
    _2base64 = function() {
      //var base64 = buffer.toString('base64');
      //fs.writeFileSync(dest + path.basename(ttfFile, '.ttf') + '.64.txt', base64);
      var ret = 'data:';
      ret += mimeType;
      ret += ';base64,';
      ret += buffer.toString('base64');
      return ret;
    };
  return {
    ttf2woff: _2woff,
    ttf2eot: _2eot,
    ttf2svg: _2svg,
    ttf2base64: _2base64
  };
};
//转换css
var transferCss = function(src, options) {
  var dir = path.dirname(src) + '/';
  var RE_CSS_URLFUNC = /(?:url\(["']?)(.*?)(?:(\.ttf)["']?\))/mgi,
      content  = grunt.file.read(src),
      matches = content.match(RE_CSS_URLFUNC);
  matches = matches.filter(function(u) {
    return !u.match('(data:|http)');
  });

  matches.forEach(function(src) {
    //console.log(options);
    src = src.replace(/\'/g,'').replace(/\"/g,'').replace(/\)/g,'').replace(/url\(/g,'');
    var font = new transferTtf(src, options.dest);
    content = content.replace(new RegExp(src, 'g'), font.ttf2base64());

  });

  fs.writeFileSync(dir + path.basename(src, path.extname(src)) + '-base64'+path.extname(src) , content);

  //grunt.log.subhead('SRC: '+uris.length+' file uri found on '+src);
/*
  // Process urls
  uris.forEach(function(uri) {

    content = content.replace(new RegExp(uri, 'g'), '123');

  });
  */
  return {};
};
module.exports = function (grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('ttf2base64_and_otherfonts', 'grunt-ttf2base64-and-otherfonts', function () {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({});
    //console.log(ttf2woff);
    // Iterate over all specified file groups.
    this.files.forEach(function (file) {
      // Concat specified files.
      var src = file.src.filter(function (filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function (filepath) {
        var css = new transferCss(filepath, options);
        // Read file source.
        //var transfer = new transferTtf(filepath, file.dest);
        //transfer.ttf2woff();
        //transfer.ttf2eot();
        //transfer.ttf2svg();
        //transfer.ttf2base64();
        //return grunt.file.read(filepath);
      });

      // Write the destination file.
      //grunt.file.write(file.dest, src);
      // Print a success message.
      //grunt.log.writeln('File "' + file.dest + '" created.');
    });
  });

};
