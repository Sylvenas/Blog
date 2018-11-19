---
title: "webpack loader"
author: [Sylvenas]
categories: 'bundlers'
img: './img/2015-03-25.jpg'
excerpt: 'webpack loader实现的基本原理'
catalogue: ['webpack原理','webpack的核心概念','webpack构建流程','webpack-loader','Writing A Loader','loader的常用API','Summary']
---

### Webpack原理
本质上来说webpack是运行在node.js之上的一个JavaScript程序,通过配置文件指令程序应当从哪里入手、遇到各种文件应当怎么处理、遇到导入的文件，怎么根据路径加载，以及在处理各种文件的过程中，做各种优化和处理;

一切文件：JavaScript、CSS、SCSS、图片、模板，在 Webpack 眼中都是一个个模块，这样的好处是能清晰的描述出各个模块之间的依赖关系，以方便 Webpack对模块进行组合和打包。 经过Webpack的处理，最终会输出浏览器能使用的静态资源。

#### webpack的核心概念
* `entry`: 一个可执行模块或库的入口文件
* `chunk`:多个文件组成的一个代码块，例如把一个可执行模块和它所有依赖的模块组合和成一个chunk，这体现了webpack的打包机制
* `loader`:文件转换器，例如把ES6转换为ES5，SCSS转换为CSS
* `plugin`:插件，用于扩展webpack的功能，在webpack构建生命周期的节点上加入扩展hook为webpack加入功能。

#### webpack构建流程
从启动webpack构建到输出结果经历了一系列过程，它们是：

* 解析webpack配置参数，合并从`shell`传入和`webpack.config.js`文件里配置的参数，生产最后的配置结果
* 注册所有配置的插件，好让插件监听webpack构建生命周期的事件节点，以做出对应的反应
* 从配置的`entry`入口文件开始解析文件构建AST语法树，找出每个文件所依赖的文件，递归下去。
* 在解析文件递归的过程中根据`文件类型`和`loader`配置找出合适的loader用来对文件进行转换。
* 递归完后得到每个文件的最终结果，根据entry配置生成代码块`chunk`。
* 输出所有`chunk`到文件系统。

需要注意的是，在构建生命周期中有一系列插件在合适的时机做了合适的事情，eg:`UglifyJsPlugin`会在loader转换递归完后对结果再使用`UglifyJs`压缩覆盖之前的结果。

### webpack-loader
Loader 就像是一个流水工厂，能把源文件经过转化后输出新的结果，并且一个文件还可以链式的经过多个工厂加工

以处理 SCSS 文件为例：

* SCSS 源代码会先交给`sass-loader`把SCSS转换成CSS；
* 把`sass-loader`输出的CSS交给`css-loader`处理，找出CSS中依赖的资源、压缩CSS等；
* 把`css-loader`输出的 CSS 交给`style-loader`处理，转换成通过脚本加载的 JavaScript 代码；

可以看出以上的处理过程需要有顺序的链式执行，先`sass-loader`再`css-loader`再`style-loader`。

> loader有点类似RxJs的管道机制，同时透露着函数式编程的理念

#### loader的职责
由上面的例子可以看出：
* 一个 Loader 的职责是单一的，只需要完成一种转换。
* 如果一个源文件需要经历多步转换才能正常使用，就通过多个 Loader 去转换。
* 在调用多个 Loader 去转换一个文件时，每个 Loader 会链式的顺序执行，
* 第一个 Loader 将会拿到需处理的原内容，上一个 Loader 处理后的结果会传给下一个接着处理，最后的 Loader 将处理后的最终结果返回给 Webpack。

所以，在你开发一个 `Loader` 时，请保持其职责的单一性，你只需关心输入和输出。

### Writing A Loader
从上面的介绍可以看出loader就是一个Node.js的模块，这个模块需要导出一个函数，而这个函数的作用就是对接收的内容进行处理，并把处理的结果返回给下一个模块。
那么一个最简单的loader的内容就是：
``` js
module.exports = function(source) {
  // source 为 compiler 传递给 Loader 的一个文件的原内容
  // 该函数需要返回处理后的内容，这里简单起见，直接把原内容返回了，相当于该 Loader 没有做任何转换,仅仅是打印了source
  console.log(source)
  return source;
};
```
使用一个具体的例子来说：
如果我们想把某个txt文件中的`{{name}}`替换为某个具体的人名，可以这样写,代码很简单
``` js
const loaderUtils = require("loader-utils");
const schema = require("./name-options.json");
const validateOptions = require("schema-utils");

module.exports = function (source) {
    // 获取options配置项
    const options = loaderUtils.getOptions(this) || {};
    // 校验配置项是否符合规则
    validateOptions(schema, options, "name Loader");
    // 替换字符串
    const result = source.replace(/{{name}}/, options.name)
    // 拼接结果返回给webpack
    return `module.exports = '${result}'`;
};
```

> 最后的结果要手动拼接module.exports的原因是：loader最后会创建为一个模块，而当我们require一个模块的时候，我们需要实际上加载的时候最后镜多loader处理之后的那个模块，而**return `module.exports = '${result}'`**就是为了创建这个供其他应用程序require的模块，只不过和我们平时写的模块的唯一区别就是需要我们手动拼接创建

现在`name-loader`已经开发完成，接下来只要按照[官方文档](https://webpack.js.org/contribute/writing-a-loader/)的说明的使用方法，加载一下这个loader就可以了:
``` js
module.exports = {
  //...
  module: {
    rules: [
      {
        test: [/\.tpl$/],
        use: [
            {
            loader: path.resolve('./picture-loader/name-loader.js'),
            options: {
                name: 'James'
                }
            },
            ]
        },
    ]
  }
};
```
接下来我们测试一下在实际项目中怎么使用`.tpl`格式的文件：
``` tpl
Hello,I am {{name}}.
```

``` js
import React, { Component } from 'react';
import tpl from './test-name.tpl';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>{tpl}</h1>
      </div>
    );
  }
}

export default App;
```
现在在项目中已经具体使用我们的loader了

### loader的常用API
#### 获取loader的options
借助webpack提供的`loader-utils`工具包可以通过`getOptions`方法直接获取到用户设置的options
``` js
const loaderUtils = require('loader-utils');
const options = loaderUtils.getOptions(this);
```
#### 处理二进制数据
webpack默认的传递给loader的内容是UTF-8格式编码的字符串，但是有些场景下loader是处理二进制的文件的，例如图片，那么我们就需要告诉webpack,传递给loader二进制的数据给我们的loader,实现方式为`module.exporst.raw = true`
``` js
module.exports = function(source){
  source instanceof Buffer === true
  return source
}

module.exporst.raw = true
```
#### 异步与同步
上面的介绍和例子中，我们的loader都是同步处理数据的，但是JavaScript中异步才是绝大多数情况，例如:某个loader需要读写硬盘才能得到结果，如果采用同步的方式，则会阻塞整个构建，导致构建非常缓慢，webpack提供了异步处理结果的方式：
``` js
module.exports = function(source) {
    // 告诉 Webpack 本次转换是异步的，Loader 会在 callback 中回调结果
    var loaderCallback = this.async();
    someAsyncOperation(source, function(err, result, sourceMaps, ast) {
        // 通过 callback 返回异步执行后的结果
        loaderCallback(err, result, sourceMaps, ast);
    });
};
```
> 由于node.js的单线程，建议尽量都把loader写成异步的方式，避免长时间的同步的计算

#### 缓存
某些情况下，某些转换操作需要大奖的极端非常耗时，如果每次构建都要重复执行转换，这样效率非常低下，所以可以尽量使用缓存：
``` js
module.exports = function (source) {
    this.cacheable && this.cacheable();
    // ...
}
```
#### emitFile
在dev环境下往memory中写入一个文件，在prod环境下，向磁盘写入文件，这个功能在file-loader和图片处理中非常的常见
``` js
this.emitFile(name: string, content: Buffer|string, sourceMap: {...})
```
#### 请求路径
如果我们想要获取资源在请求的时候的原路径，可以使用`this.resource`属性获取，并且包含资源的`query`
请求：
``` js
import girl from './girl.jpg?size=360'
```
在loader中获取请求的路径：
``` js
module.exports = function (source) {
    const resource = this.resource
}
```
> 相对而言options是一个基础的统一的配置项，query可以定制请求的资源的配置项，eg:responsive image中请求不同大小的图片

### Summary
一个loader从本质上来说就做了以下三件事：
* 将源文件的内容转换为JavaScript值，可能是字符串，eg:name-loader，把模块的内容转换为字符串
* 将引用的具体的文件，转换为对文件的请求，eg:url-loader把对图片的请求转换为对图片路径
* 将构建的结果，手动拼接为JavaScript的模块，并导出提供给应用程序的其他部分使用
