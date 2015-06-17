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
var transferTtf = function(ttfFile, dest, oldSrc) {
  //variable
  var buffer = fs.readFileSync(dest + '/' + path.basename(ttfFile)),
    outputFileSrc = dest + '/' + path.basename(ttfFile, 'ttf'),
    ttf = new Uint8Array(buffer),
    mimeType = mime.lookup(ttfFile);

  //functions
  var _2woff = function() {
      var woff = new Buffer(ttf2woff(ttf).buffer);
      fs.writeFileSync(outputFileSrc + 'woff', woff);
      return oldSrc.replace('ttf', 'woff').replace('truetype', 'woff');
    },
    _2eot = function() {
      var eot = new Buffer(ttf2eot(ttf).buffer);
      fs.writeFileSync(outputFileSrc + 'eot', eot);
      return oldSrc.replace('ttf', 'eot').replace('truetype', 'embedded-opentype');
    },
    _2svg = function() {
      var svg = new Buffer(ttf2svg(buffer));
      fs.writeFileSync(outputFileSrc + 'svg', svg);
      return oldSrc.replace('ttf', 'svg').replace('truetype', 'svg');
    },
    /**
     * Base64 encodes an image and builds the data URI string
     *
     * @returns {string} base64 encoded string
     */
    _2base64 = function() {
      var ret = 'data:';
      ret += mimeType;
      ret += ';base64,';
      ret += buffer.toString('base64');
      return 'url(\'' + ret + '\') format(\'truetype\')';
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
  var dir = path.dirname(src) + '/',
    outputCss = dir + path.basename(src, path.extname(src)) + '-base64'+path.extname(src),
    RE_CSS_URLFUNC = /(?:url\(["']?)(.*?)(?:(format\(['"]truetype['"]\))["']?)/mgi,
    content  = grunt.file.read(src),
    matches = content.match(RE_CSS_URLFUNC);

  matches = matches.filter(function(u) {
    return !u.match('(data:|http)');
  });

  matches.forEach(function(src) {
    var fontSrc = src.replace(/\'/g,'').replace(/\"/g,'').replace('url(', '').replace(') format(truetype)', '');
    console.log(src)
    var font = new transferTtf(options.dest + '/' +path.basename(fontSrc), options.dest, src);
    content = content.replace(src,
      font.ttf2base64() + ', '
      + src + ', '
      + font.ttf2woff() + ', '
      + font.ttf2eot() + ', '
      + font.ttf2svg()
    );
  });

  fs.writeFileSync(outputCss , content);

  return outputCss;
};
module.exports = function (grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('ttf2base64_and_otherfonts', 'grunt-ttf2base64-and-otherfonts', function () {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({}), tmp;
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
        tmp = transferCss(filepath, options);
        grunt.log.writeln('File "' + tmp + '" created.');
      });
    });
  });

};
