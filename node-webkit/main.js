
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
    mime = require('mime'),
    gui = require('nw.gui'),
    shell = gui.Shell,
    fontFormat = {
        ttf: 'truetype',
        woff: 'woff',
        eot: 'embedded-opentype',
        svg: 'svg'
    };

global.$ = $;

//转换ttf字体文件
var transferTtf = function(ttfFilePath, dest) {
    //variable
    var buffer = fs.readFileSync(ttfFilePath),
        outputFileSrc = dest + '/' + path.basename(ttfFilePath, 'ttf'),
        ttf = new Uint8Array(buffer);
    //functions
    var _2woff = function() {
            var woff = new Buffer(ttf2woff(ttf).buffer);
            fs.writeFileSync(outputFileSrc + 'woff', woff);
        },
        _2eot = function() {
            var eot = new Buffer(ttf2eot(ttf).buffer);
            fs.writeFileSync(outputFileSrc + 'eot', eot);
        },
        _2svg = function() {
            var svg = new Buffer(ttf2svg(buffer));
            fs.writeFileSync(outputFileSrc + 'svg', svg);
        };
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
var fontFile2Base64 = function(filepath) {
    var mimeType = mime.lookup(filepath);
    var buffer = fs.readFileSync(filepath);
    var ret = 'data:';
    ret += mimeType;
    ret += ';base64,';
    ret += buffer.toString('base64');
    return ret;
};

var App = (function() {
    var preventDefault = function() {
            $(document).on({
                dragleave:function(e){    //拖离
                    e.preventDefault();
                },
                drop:function(e){  //拖后放
                    e.preventDefault();
                },
                dragenter:function(e){    //拖进
                    e.preventDefault();
                },
                dragover:function(e){    //拖来拖去
                    e.preventDefault();
                }
            });
        },
        domDragOn = function(obj) {
            $(obj).addClass('on');
            $(obj).children('.label-area').hide();
            $(obj).children('p').show();
        },
        domDragEnd = function(obj) {
            $(obj).removeClass('on');
            $(obj).children('p').hide();
            $(obj).children('.label-area').show();
        },
        includeCss = function(type, app) {
            var bCode = $('#base64Code');
            if(bCode.val()) {
                bCode.val(type ? _cssCode(app.fileType, app.base64code) : app.base64code);
            }
            function _cssCode(type, code) {
                var format = fontFormat[type.replace('.', '')];
                return format ? 'src: url("' + code + '") format("'+ format +'");' :
                     'background-image: url("' + code + '");';
            }
        },
        copy = function(app) {
            var val = $('#base64Code').val();
            clipboard.set(val, 'text');
            if(val) {
                app.tip('base64编码复制到剪贴板成功', 'alert-info');
            } else {
                app.tip('请先上传文件', 'alert-error');
            }
        },
        clipboard = gui.Clipboard.get();
    var App = function(option) {
        this.option = option;
    };
    App.prototype.bindEvent = function() {
        var self = this;
        $('#fontFile').change(function() {
            self._fileUpload(this.files);
        });
        $('#filePathDialog').change(function() {
            $('#dest').val(this.value);
            self.dest = this.value;
        });
        $('#dest').change(function() {
            self.dest = this.value;
        });
        $('#submit').click(function() {
            self.transferTtf();
        });
        $('#copyBase64Code').click(function() {
            copy(self);
        });
        $('#clearBase64Code').click(function() {
            $('#base64Code').val('');
        });
        $('#withCssBase64Code').click(function() {
            includeCss(this.checked, self);
        });
        //拖拽上传
        this.dragBox.bind('dragenter', function(e) {
            domDragOn(this);
        });
        this.dragBox.bind('dragleave', function(e) {
            domDragEnd(this);
        });
        this.dragBox.bind('drop', function(e) {
            domDragEnd(this);
            self.selectTtfFile(window.event);
        });
    };
    App.prototype.selectTtfFile = function(e) {
        var fileList = e.dataTransfer.files; //获取文件对象
        //检测是否是拖拽文件到页面的操作
        if(fileList.length === 0){
            return false;
        }
        this._fileUpload(fileList);
    };
    App.prototype.transferTtf = function() {
        //console.log(fs.existsSync(this.dest))
        if(this.dest === '') {
            this.tip('请选择字体文件输出路径', 'alert-error');
        } else if(!fs.existsSync(this.dest)) {
            this.tip('输出目录不存在', 'alert-error');
        } else {
            var transfer = new transferTtf(this.uplaodFilePath, this.dest);
            transfer.ttf2woff();
            transfer.ttf2svg();
            transfer.ttf2eot();
            this.tip('字体文件创建成功', 'alert-success');
        }
    };
    App.prototype.tip = function(txt, cls) {
        $('#alert').html(txt)[0].className = 'alert ' + cls;
    };
    App.prototype._fileUpload = function(files) {
        $('#base64Code').val(fontFile2Base64(files[0].path));
        this.base64code = fontFile2Base64(files[0].path);
        this.fileType = path.extname(files[0].name);
        this.dragBox.children('.label-area').html(files[0].path);
        this.tip(path.extname(files[0].name).replace('.','') + '文件读取成功', 'alert-info');
        if(path.extname(files[0].name) === '.ttf') {
            $('#submit').attr('disabled', false);
            this.uplaodFilePath = files[0].path;
        } else {
            this.tip('非TTF字体只能转换base64', 'alert-info');
            $('#submit').attr('disabled', true);
        }
        if($('#withCssBase64Code')[0].checked) {
            includeCss(true, this);
        }
    };
    App.prototype.init = function() {
        preventDefault();
        this.dragBox = $('#' + this.option.dragBox);
        this.dest = $('#dest').val();
        this.uplaodFilePath = '';
        this.bindEvent();
    };
    return App;
})();


$(document).ready(function() {
    var app = new App({
        dragBox : 'dragUpload'
    });
    app.init();
});
