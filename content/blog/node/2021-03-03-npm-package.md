---
title: "npm package依赖管理"
author: [Sylvenas]
categories: "Node.js"
img: "./img/2018-03-06.jpeg"
---

## 前言

提起 npm，大家第一个想到的应该就是 `npm install` 了，但是 `npm install` 之后生成的 `node_modules` 大家有观察过吗？`package-lock.json` 文件的作用大家知道吗？除了 `dependencies` 和 `devDependencies`，其他的依赖有什么作用呢？接下来，本文将针对 npm 中的你可能忽略的细节和大家分享一些经验 。

## npm 安装机制

`A` 和 `B` 同时依赖 `C`，`C` 这个包会被安装在哪里呢？`C` 的版本相同和版本不同时安装会有什么差异呢？`package.json` 中包的前后顺序对于安装时有什么影响吗？这些问题平时大家可能没有注意过，今天我们就来一起研究一下吧。

### A 和 B 同时依赖 C，这个包会被安装在哪里呢？

假如有 `A` 和 `B` 两个包，两个包都依赖 `C` 这个包，**npm 2** 会依次递归安装 `A` 和 `B` 两个包及其子依赖包到 `node_modules` 中。执行完毕后，我们会看到 `./node_modules` 这层目录只含有这两个子目录：

```
node_modules/
├─┬ A
│ ├── C
├─┬ B
│ └── C
```

如果使用 **npm 3** 来进行安装的话，`./node_modules` 下的目录将会包含三个子目录：

```
node_modules/
├─┬ A
├─┬ B
├─┬ C
```

为什么会出现这样的区别呢？这就要从 npm 的工作方式说起了：

### npm 2 和 npm 3 模块安装机制的差异

虽然目前最新的 npm 版本是 `npm 7`，但 `npm 2` 到 `npm 3` 的版本变更中实现了目录打平，与其他版本相比差别较大。因此，让我们具体看下这两个版本的差异 ​。

`npm 2` 在安装依赖包时，采用简单的递归安装方法。执行 `npm install` 后，npm 根据 `dependencies` 和 `devDependencies` 属性中指定的包来确定第一层依赖，`npm 2` 会根据第一层依赖的子依赖，递归安装各个包到子依赖的 `node_modules` 中，直到子依赖不再依赖其他模块。执行完毕后，我们会看到 `./node_modules` 这层目录中包含有我们 package.json 文件中所有的依赖包，而这些依赖包的子依赖包都安装在了自己的 `node_modules` 中 ，形成类似于下面的依赖树：

![npm 2 package tree](https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8587922045/3070/cff1/36c5/97cd26e52a74d70cbb0dbb3d1ca882b9.png)

这样的目录有较为明显的好处：

- 1）层级结构非常明显，可以清楚的在第一层的 `node_modules` 中看到我们安装的所有包的子目录；

- 2）在已知自己所需包的名字以及版本号时，可以复制粘贴相应的文件到 `node_modules` 中，然后手动更改 `package.json` 中的配置；

- 3）如果想要删除某个包，只需要简单的删除 `package.json` 文件中相应的某一行，然后删除 `node_modules` 中该包的目录；

但是这样的层级结构也有较为明显的缺陷，当我的 `A`，`B`，`C` 三个包中有相同的依赖 `D` 时，执行 `npm install` 后，`D` 会被重复下载三次，而随着我们的项目越来越复杂，`node_modules` 中的依赖树也会越来越复杂，像 `D` 这样的包也会越来越多，造成了大量的冗余；在 `windows` 系统中，甚至会**因为目录的层级太深导致文件的路径过长，触发文件路径不能超过 280 个字符的错误**；

​ 为了解决以上问题，`npm 3` 的 `node_modules` 目录改成了更为扁平状的层级结构，尽量把依赖以及依赖的依赖平铺在 `node_modules` 文件夹下共享使用。

### npm 3 对于同一依赖的不同版本会怎么处理呢？

`npm 3` 会遍历所有的节点，逐个将模块放在 `node_modules` 的第一层，**当发现有重复模块时，则判断版本是否兼容，兼容则跳过不再重复安装， 不兼容则继续采用 `npm 2` 的处理方式，前面的放在跟目录 `node_modules` 目录中，后面的放在依赖树中**。举个例子： `A`，`B`，依赖 `D`(v 0.0.1)，`C` 依赖 `D`(v 0.0.2):

![npm 3 packages](https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8588051089/c213/9b56/cf72/997029c823a51d4bc2b4b8f1f9a96d02.png)

但是 `npm 3` 会带来一个新的问题：由于在执行 `npm install` 的时候，按照 `package.json` 里依赖的顺序依次解析，上图如果 `C` 的顺序在 `A，B` 的前边，`node_modules` 树则会改变，会出现下边的情况：

![](https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8588134162/be45/2d48/8f1d/ead5c23d4eb16e368685b5defb242fc6.png)

由此可见，`npm 3` 的整体思路是:**尽量平铺，发生冲突在 `package.json` 靠后的则采用树状结构**，但是 `npm 3` 并未完全解决冗余的问题，甚至还会带来新的问题。

### npm 3 冲突解决机制真的很完美吗？

当出现版本不兼容时，npm 会将依赖的包安装至当前包的 node_modules 下，有点 submodule 的意思，但也不是真的万无一失，还是有可能出现由于多版本共存导致的冲突。

还是拿上面的 A/B/C 三个依赖模块来举例，比如 `D v0.0.1` 中向 `window` 对象注册了一个属性，`D v0.0.2` 也向 `window` 中注册了一个属性，由于 `D v0.0.1` 和 `D v0.0.2` 差距很大，虽然注册的是同一个对象，但属性和其函数差距很大，当一个页面同时引入 A/B/C 模块时，`D v0.0.1` 和 `D v0.0.2` 都会加载，可能会出现一些意外的错误。对于使用者来说是不能接受的。

这种问题在 Java 生态中的包管理虽然也有，但形式会有所不同：

在 Maven 中（Java 生态的包管理工具），虽然依赖是树状结构的，但构建后的结果其实是平面（flat）的的。如果出现多个版本的 jar 包，运行时一般会将所有 jar 包都加载；不过由于 JAVA 中 ClassLoader 的 parent delegate 机制，同样的 Class 只会被加载一次，下 N 个 Jar 包内的的同名类（包名+类名）会被忽略，这样的好处是简单，如果出现版本冲突也清晰可见，冲突问题需要使用者自行处理。

Maven Build 对包（传递）依赖多版本的处理，如下图所示：

![](https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8599680522/e111/c7bc/86e1/65fc443ebfe767d05dfb58f9e773ce41.png)

npm 对于这种可能出现的版本冲突问题，也提供了一个解决办法：`peerDependencies`，npm 依赖分为 5 中没，常用的有三种，请看下一节依赖分类介绍：

## 依赖的区别与使用场景

npm 目前支持以下几类依赖包管理包括：

- dependencies
- devDependencies
- peerDependencies 同等依赖
- optionalDependencies 可选择的依赖包
- bundledDependencies 捆绑依赖包

下面我们来看一下这几种依赖的区别以及各自的应用场景：

### dependencies

`dependencies` 是无论在开发环境还是在生产环境都必须使用的依赖，是我们最常用的依赖包管理对象，例如 `React`，`Loadsh`，`Axios` 等，通过 `npm install XXX` 下载的包都会默认安装在 `dependencies` 对象中，也可以使用 `npm install XXX --save` 下载 `dependencies` 中的包；

```json
{
  "dependencies": {
    "foo": "1.0.0 - 2.9999.9999",
    "bar": ">=1.0.2 <2.1.2",
    "baz": ">1.0.2 <=2.3.4",
    "boo": "2.0.1",
    "qux": "<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0",
    "asd": "http://asdf.com/asdf.tar.gz",
    "til": "~1.2",
    "elf": "~1.2.3",
    "two": "2.x",
    "thr": "3.3.x",
    "lat": "latest",
    "dyl": "file:../dyl"
  }
}
```

### devDependencies

`devDependencies` 是指可以在**开发环境使用但是正式环境不需要**的依赖，例如 `eslint`，`debug` 等，通过 `npm install packageName --save-dev` 下载的包都会在 `devDependencies` 对象中；

```json
{
  "devDependencies": {
    "eslint": "^5.0.0"
  }
}
```

`dependencies` 和 `devDependencies` 区别是:在打包运行时，执行 `npm install` 时默认会把所有依赖全部安装，但是如果使用 `npm install --production` 时就只会安装 `dependencies` 中的依赖，如果是 `node` 服务项目，就可以采用这样的方式用于服务运行时安装和打包，减少包大小。

`dependencies` 和 `devDependencies` 的另一个核心区别是：当我们开发了某个 `packageA`,然后 publish 到 npm 以后，别人在使用`npm i packageA`的时候，**`packageA` 中的`dependencies`会被安装，而 `devDependencies` 不会被安装，这很重要**。

### peerDependencies

`peerDependencies` 用于指定你当前的插件兼容的宿主必须要安装的包的版本，这个是什么意思呢？举个例子 🌰：我们常用的 `react` 组件库 `ant-design@3.x` 的 `package.json` 中的配置如下：

```json
"peerDependencies": {
  "react": ">=16.9.0",
  "react-dom": ">=16.9.0"
},
```

假设我们创建了一个名为 `project` 的项目，在此项目中我们要使用 `ant-design@3.x` 这个插件，此时我们的项目就必须先安装 `React >= 16.9.0` 和 `React-dom >= 16.9.0` 的版本。

- 在 `npm 2` 中，当我们下载 `ant-design@3.x` 时，`peerDependencies` 中指定的依赖会随着 `ant-design@3.x` 一起被强制安装，所以我们不需要在宿主项目的 `package.json` 文件中指定 `peerDependencies` 中的依赖 (React)

- 在 `npm 3-6` 中，不会再强制安装 `peerDependencies` 中所指定的包，**而是通过警告的方式来提示我们**，此时就需要手动在 `package.json` 文件中手动添加依赖。

- 在 `npm 7` 中 `peerDependencies` 指定的依赖会被**默认强制安装** (这可真是戏剧性的一幕，天下大势，分久必合，合久必分...)

某项目 `A` ，依赖 `packageB` 和 `packageC`(c1:'1.0.5')，同时 `B` 中 `peerDependencies` 同样声明了 `packageC`(c2:'2.0.0')，此时 `c1` 和 `c2` 版本不兼容,则在安装 `packageB` 的时候，**npm 会提示 warn，要求手动安装 c2:'2.0.0'，并解决冲突，不然可能会遇到未知的 bug**。

```sh
npm WARN hidash@0.2.0 requires a peer of lodash@~1.3.1 but none is installed. You must install peer dependencies yourself.
```

`peerDependencies` 是开发 npm 包中及其重要的一环，比如：我们可以多个公用的基础包，放在 `peerDependencies` 中，这样可以“在一定程度上避免版本冲突”。

## 为什么会出现 package-lock.json 呢？

为什么会有 `package-lock.json` 文件呢？这个我们就要先从 `package.json` 文件说起了。

### package.json 的不足之处

`npm install` 执行后，会生成一个 `node_modules` 树，在理想情况下， 希望对于同一个 `package.json` 总是生成完全相同 `node_modules` 树。在某些情况下，确实如此。但在多数情况下，`npm` 无法做到这一点。有以下两个原因：

- 1）某些依赖项自上次安装以来，可能已发布了新版本 。比如：`A` 包在团队中第一个人安装的时候是 `1.0.5` 版本，`package.json` 中的配置项为 `A: '^1.0.5'` ；团队中第二个人把代码拉下来的时候，`A` 包的版本已经升级成了 `1.0.8`，根据 `package.json` 中的 [semver-range version](https://semver.org/) 规范，此时第二个人 `npm install` 后会自动更新 `A` 的版本为 `1.0.8`； 可能会造成因为依赖版本不同而导致的 `bug`；

- 2）针对 1）中的问题，可能有的小伙伴会想，把 `A` 的版本号固定为 `A: '1.0.5'` 不就可以了吗？但是这样的做法其实并没有解决问题， 比如 `A` 的某个依赖在第一个人下载的时候是 `2.1.3` 版本，但是第二个人下载的时候已经升级到了 `2.2.5` 版本，此时生成的 `node_modules` 树依旧不完全相同 ，**固定版本只是固定来自身的版本，依赖的版本无法固定,也不能要求所有人都采用固定版本的方案**。

### 针对 package.json 不足的解决方法

为了解决上述问题以及 `npm 3` 的问题，在 `npm 5.0` 版本后，`npm install` 后都会自动生成一个 `package-lock.json` 文件 ，当包中有 `package-lock.json` 文件时，`npm install` 执行时，如果 `package.json` 和 `package-lock.json` 中的版本兼容，会根据 `package-lock.json` 中的版本下载；如果不兼容，将会根据 `package.json` 的版本，更新 `package-lock.json` 中的版本，已保证 `package-lock.json` 中的版本兼容 `package.json`。

### package-lock.json 文件的作用

- 在团队开发中，确保每个团队成员安装的依赖版本是一致的，确定一棵唯一的 `node_modules` 树；

- `node_modules` 目录本身是不会被提交到代码库的，但是 `package-lock.json` 可以提交到代码库，如果开发人员想要回溯到某一天的目录状态，只需要把 `package.json` 和 `package-lock.json` 这两个文件回退到那一天即可 。

- 由于 `package-lock.json` 和 `node_modules` 中的依赖嵌套完全一致，可以更加清楚的了解树的结构及其变化。

- 在安装时，`npm` 会比较 `node_modules` 已有的包，和 `package-lock.json` 进行比较，如果重复的话，就跳过安装 ，从而优化了安装的过程。

## 总结

### npm & webpack

现在很多项目都会使用 `webpack` 来作为项目的构建工具，但是和 `java` 中的 `maven` `不同，webpack` 和 `npm` 是两套独立的工具，构建和包管理是分开的

也就是说，哪怕 `npm` 将冲突包作为“submodule”的形式安装在当前包内，但是 `webpack` 可不一定认。

比如上面 `A/B/C` 三个模块的例子，如果 `A` 模块的代码中 `import BObj from D module`，那么 `webpack` 构建之后，会让 `A` 引用哪一个 `B` 版本呢？`v0.0.1` 还是 `v0.0.1`？

这个场景相当复杂，本文就不介绍了，请阅读[TODO:]()

### 最后

npm 包管理的设计理念虽然很好，但不适合所有的场景，比如这种 `submodule` 的模式拿到 `java` 里就不可行，而且 `submodule` 的模式还是有一定的风险，只是风险降低了。一旦有多个依赖的代码在一个页面同时工作或交互，就很容易出问题。

无论是什么包管理工具，最安全的做法还是避免重复。在增加新依赖或是新建项目后，使用一些依赖分析检查工具检测一遍，修复重复/冲突的依赖。
