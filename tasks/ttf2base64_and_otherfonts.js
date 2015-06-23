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
    fs = require('fs'),
    grunt = require('grunt'),
    mime = require('mime'),
    fontFormat = {
      ttf: 'truetype',
      woff: 'woff',
      eot: 'embedded-opentype',
      svg: 'svg'
    };

//转换ttf字体文件
var transferTtf = function(ttfFile, dest, oldSrc) {
  //variable
  var buffer = fs.readFileSync(dest + '/' + path.basename(ttfFile)),
    outputFileSrc = dest + '/' + path.basename(ttfFile, 'ttf'),
    ttf = new Uint8Array(buffer);

  //functions
  var _2woff = function() {
      var woff = new Buffer(ttf2woff(ttf).buffer);
      fs.writeFileSync(outputFileSrc + 'woff', woff);
      return oldSrc.replace('ttf', 'woff').replace('truetype', fontFormat.woff);
    },
    _2eot = function() {
      var eot = new Buffer(ttf2eot(ttf).buffer);
      fs.writeFileSync(outputFileSrc + 'eot', eot);
      return oldSrc.replace('ttf', 'eot').replace('truetype', fontFormat.eot);
    },
    _2svg = function() {
      var svg = new Buffer(ttf2svg(buffer));
      fs.writeFileSync(outputFileSrc + 'svg', svg);
      return oldSrc.replace('ttf', 'svg').replace('truetype', fontFormat.svg);
    }
  return {
    ttf2woff: _2woff,
    ttf2eot: _2eot,
    ttf2svg: _2svg
  };
};

/**
 * Base64 encodes an image and builds the data URI string
 *
 * @returns {string} base64 encoded string
 */
var fontFile2Base64 = function(filepath, format) {
  var mimeType = mime.lookup(filepath);
  var buffer = fs.readFileSync(filepath);
  var ret = 'data:';
  ret += mimeType;
  ret += ';base64,';
  ret += buffer.toString('base64');
  return 'url(\'' + ret + '\') format(\''+ fontFormat[format] +'\')';
};

//转换css
var transferCss = function(src, options) {
  var dir = path.dirname(src) + '/',
    outputCss = dir + path.basename(src, path.extname(src)) + '!@!base64!@!' + path.extname(src),
    RE_CSS_URLFUNC = /(?:url\(["']?)(.*?)(?:(format\(['"]truetype['"]\))["']?)/mgi,
    content  = grunt.file.read(src),
    matches = content.match(RE_CSS_URLFUNC),
    fontSrc, font, format, i;

  matches = matches.filter(function(u) {
    return !u.match('(data:|http)');
  });

  matches.forEach(function(src) {
    fontSrc = src.replace(/\'/g,'').replace(/\"/g,'').replace('url(', '').replace(') format(truetype)', '');
    fontSrc = options.dest + '/' + path.basename(fontSrc);
    font = new transferTtf(fontSrc, options.dest, src);
    content = content.replace(src,
      '!@!base64code!@!, '
      + src + ', '
      + font.ttf2woff() + ', '
      + font.ttf2eot() + ', '
      + font.ttf2svg()
    );
  });
  //fontFile2Base64(fontSrc)
  //fontSrc = path.base
  for(i in options.transfer2base64type) {
    format = options.transfer2base64type[i];
    fs.writeFileSync(outputCss.replace('!@!base64!@!', '_base64_' + format) ,
      content.replace('!@!base64code!@!', fontFile2Base64(fontSrc.replace('ttf', format), format)));
  }

  return 'base64_css_file';
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
