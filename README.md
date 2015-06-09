# grunt-ttf2base64-and-otherfonts

> grunt-ttf2base64-and-otherfonts

## Getting Started
This plugin requires Grunt.

```shell
npm install grunt-ttf2base64-and-otherfonts --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-ttf2base64-and-otherfonts');
```

## The "ttf2base64_and_otherfonts" task

A simple plugin change ttf file to base64 code and other font files, then updata css like this:

before:
```css
@font-face {
    font-family: 'icon';
    src: url('../font/icon.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}
```
after:
```css
@font-face {
    font-family: 'icon';
    src: url('data:application/x-font-ttf;base64,WxhdG4ACAAEAAAAAP....') format('truetype'), 
	url('../font/icon.ttf') format('truetype'), 
	url('../font/icon.woff') format('woff'), 
	url('../font/icon.eot') format('embedded-opentype'), 
	url('../font/icon.svg') format('svg');
    font-weight: normal;
    font-style: normal;
}
```


### Overview
In your project's Gruntfile, add a section named `ttf2base64_and_otherfonts` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  ttf2base64_and_otherfonts: {
    default: {
      files: [{
          src : ['test/less/ico.less']//要转换的css文件
      }],
      options: {
          dest: 'test/font'//字体文件输出目录
      }
    }
  },
})
```

### Options

#### options.dest
Type: `String`
Default value: `',  '`

A string value that is font file output dir.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  ttf2base64_and_otherfonts: {
    default: {
      files: [{
          src : ['test/less/ico.less']//要转换的css文件
      }],
      options: {
          dest: 'test/font'//字体文件输出目录
      }
    }
  },
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 xiaoweili. Licensed under the MIT license.
