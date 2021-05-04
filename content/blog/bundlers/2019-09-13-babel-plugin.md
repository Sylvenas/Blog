---
title: "babel plugin"
author: [Sylvenas]
categories: "bundlers"
img: "./img/2015-03-25.jpg"
---

## babel 简介

一句话阐述什么是 babel:
babel 是一个主要用于将 ES2015+版本的代码编译成向下兼容(比如 ES5/ES3)js 版本的编译器。

```js
// Babel Input: ES2015 arrow function
[1, 2, 3].map(n => n + 1);

// Babel Output: ES5 equivalent
[1, 2, 3].map(function(n) {
  return n + 1;
});
```

babel 编译的核心流程是：

- 先把代码解析为 AST 语法树，
- 遍历 AST 语法树并执行操作，
- 最后根据规则生成代码。

流程不复杂，复杂的是如何操作 AST 语法树，以及如何编写 babel 的插件。网上有很多帖子在讲如何编写 babel 插件，但是讲的都比较浅显，看过之后并不能真正意义上去编写 babel 插件。在实际的项目中，我们需要的插件不仅仅是替换字符串或者打印出什么那么简单，接下来本文会实现一个自动引入 [ErrorBoundary](https://reactjs.org/docs/error-boundaries.html),并包裹 jsx 的 plugin，来实际说明 babel-plugin 的开发过程

## Abstract Syntax Tree

### 词法分析和语法分析

JavaScript 是解释型语言，一般通过 `词法分析 -> 语法分析 -> 语法树`，就可以开始解释执行了

词法分析：也叫扫描，是将字符流转换为记号流(tokens)，它会读取我们的代码然后按照一定的规则合成一个个的标识

比如说：`var a = 2` ，这段代码通常会被分解成 `var`、`a`、`=`、`2`

```js
[
  { type: "Keyword", value: "var" },
  { type: "Identifier", value: "a" },
  { type: "Punctuator", value: "=" },
  { type: "Numeric", value: "2" }
];
```

当词法分析源代码的时候，它会一个一个字符的读取代码，所以很形象地称之为**扫描** - scans。当它遇到空格、操作符，或者特殊符号的时候，它会认为一个话已经完成了。

语法分析：也称解析器，将词法分析出来的数组转换成树的形式，同时验证语法。语法如果有错的话，抛出语法错误。
语法分析成 **抽象语法树**（Abstract Syntax Tree） ，我们可以在[这里](https://astexplorer.net/)在线查看 JavaScript 代码转换为 抽象语法树的结果。

```json
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "a"
          },
          "init": {
            "type": "Literal",
            "value": 2,
            "raw": "2"
          }
        }
      ],
      "kind": "var"
    }
  ],
  "sourceType": "script"
}
```

Abstract Syntax Tree 简称 AST，是源代码的抽象语法结构的树状表现形式。webpack、eslint 等很多工具库的核心都是通过抽象语法书这个概念来实现对代码的检查、分析等操作。今天我为大家分享一下 JavaScript 这类解释型语言的抽象语法树的概念。

我们常用的浏览器就是通过将 js 代码转化为抽象语法树来进行下一步的分析等其他操作。所以将 js 转化为抽象语法树更利于程序的分析。

## babel 与 AST

babel 转换代码其实本质上就是遍历与操作 AST
babel 的工作过程:
babel 的处理过程主要为 3 个：解析(parse)、转换(transform)、生成(generate)。

- 解析：主要包含两个过程：词法分析和语法分析，输入是代码字符串，输出是 AST。
- 转换：处理 AST。处理工具、插件等就是在这个过程中介入，将代码按照需求进行转换。
- 生成：遍历 AST，输出代码字符串。

解析和生成过程，都有 babel 都为我们处理得很好了，我们要做的就是在 **转换** 过程中修改 AST，进行个性化的定制开发。

### babel plugin 简介

babel 使用一种 **访问者模式** 来遍历整棵语法树，即遍历进入到每一个 `Node` 节点时，可以说我们在「访问」这个节点。访问者就是一个对象，定义了在一个树状结构中获取具体节点的方法。简单来说，我们可以在访问者中，使用 `Node` 的 `type` 来定义一个 `hook` 函数，每一次遍历到对应 `type` 的 `Node` 时，`hook` 函数就会被触发，我们可以在这个 `hook` 函数中，修改、查看、替换、删除这个节点。说起来很抽象，直接看下面的内容吧。

### 引入自定义 plugin

项目中，一般使用 `.babelrc` 来配置 babel，如下：

```json
{
  "presets": [["es2015"], ["stage-0"]]
}
```

上面的配置中，只有两个预设，并没有使用插件。首先加上插件的配置。由于是在本地开发，插件直接写的本地的`相对地址`:

```json
{
  "presets": [["es2015"], ["stage-0"]],
  "plugins": ["./my-babel-plugin"]
}
```

### babel plugin 的雏形

在引入 plugin 之后，下一步就是要写 `my-babel-plugin` 的具体实现了,`my-babel-plugin.js` 的模版代码如下

```js
module.exports = function({ types: t }) {
  return {
    visitor: {

  };
};
```

我们可以看到模块需要返回一个函数，而函数的返回值为包含 visitor 属性的对象，也就是我们上文提到的访问者对象；

函数的参数为 babel 对象，对象中的 `types` 是一个用于 AST 节点的 Lodash 式工具库，它包含了构造、验证以及变换 AST 节点的方法。 该工具库包含考虑周到的工具方法，对编写处理 AST 逻辑非常有用。我们单独把这个 `types` 拿出来。

### 自动引入 ErrorBoundary 组件

借助 [@babel/template](https://babeljs.io/docs/en/babel-template) ，可以直接把字符串格式的 JS 代码块，转换为 AST，然后在每个文件退出的时候，自动引入 `ErrorBoundary` 组件

```js
const babelTemplate = require("@babel/template");
const t = require("babel-types");

const visitor = {
  Program: {
    // Import ErrorBoundary at the beginning of the file
    exit(path) {
      // string code is converted to AST
      const impstm = template.default.ast(
        "import ErrorBoundary from '$components/ErrorBoundary'"
      );
      path.node.body.unshift(impstm);
    }
  }
};
```

> `$components/ErrorBoundary` 路径需要配合 webpack `alias` 使用

### 包裹返回的 jsx

- 添加对 return 表达式的监听
- 首先排除父函数是不是 render 函数的 return 表达式， return 的内容不是 jsx 的表达式
- 动态的创建 JSX openingElement & closeElement，包裹 原返回的 jsx，并插入到 AST 树中（记得删除原 jsx）

```js
visitor = {
  // ...
  // Wrap return jsxElement
  ReturnStatement (path) {
    const parentFunc = path.getFunctionParent();
    const oldJsx = path.node.argument;
    if (
      ! oldJsx ||
      ((! parentFunc.node.key || parentFunc.node.key.name! == "render") &&
        oldJsx.type! == "JSXElement")
    ) {
      return;
    }

    // Create the component tree wrapped by ErrorBoundary
    const openingElement = t.JSXOpeningElement (
      t.JSXIdentifier ("ErrorBoundary")
    );
    const closingElement = t.JSXClosingElement (
      t.JSXIdentifier ("ErrorBoundary")
    );
    const newJsx = t.JSXElement (openingElement, closingElement, oldJsx);

    // insert new jxsElement and delete old
    let newReturnStm = t.returnStatement (newJsx);
    path.remove ();
    path.parent.body.push(newReturnStm);
  }
};
```

> babel 遍历 AST 的算法是递归深度优先算法，在监测到每一个 return 表达式的时候，都会触发钩子函数。

### 转换结果

```jsx
class Button extends Component {
  render() {
    return <button>button</button>;
  }
}

↓ ↓ ↓ ↓ ↓ ↓

import ErrorBoundary from '$components/ErrorBoundary'
class Button extends Component {
  render() {
    return (
      <ErrorBoundary>
        <button>button</button>
      </ErrorBoundary>
    );
  }
}
```

## 参考资料

- [babel-handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)
- [babel-template](https://babeljs.io/docs/en/babel-template)
- [babel-types](https://github.com/babel/babel/blob/master/packages/babel-types/src/definitions/core.js)
