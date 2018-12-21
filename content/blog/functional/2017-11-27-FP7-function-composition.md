---
title: "FP7：What is Function Composition?"
author: [Sylvenas]
categories: "functional"
img: './img/2017-11-27.jpeg'
excerpt: '函数组合就是组合两到多个函数来生成一个新函数的过程。将函数组合在一起，就像将一连串管道扣合在一起，让数据流过一样。'
---
**函数组合** 就是组合两到多个函数来生成一个新函数的过程。将函数组合在一起，就像将一连串管道扣合在一起，让数据流过一样。

简而言之，函数`f`和`g`的组合可以被定义为`f(g(x))`,从内到外(从又向左)求值。也就是说，求值顺序是：  
1. `x`
2. `g`
3. `f`

下面我们在代码中近距离观察一下这个概念。想象一个场景，你想把一个人的全名转换为URL Slug，给每个用户一个个人信息页面。为了实现此需求，你需要经历一连串的操作：

1. 将姓名用空格分隔(`split`)到一个数组中
2. 将姓名映射(`map`)为小写
3. 用破折号连接(`join`)
4. 编码URI

如下是一个简单的实现：
``` js
const toSlug = input => encodeURIComponent(
  input
  .split(' ')
  .map(str => str.toLowerCase())
  .join('-')
);
```
还不错...但是我们想要可读性更强一点会怎么样呢？

假设每个操作都有一个对应的可组合的函数。上述代码可以这样写：
``` js
const toSlug = input => encodeURIComponent(
  join('-')(
    map(toLowerCase)(
      split(' ')(
        input
      )
    )
  )
);

console.log(toSlug('JS Cheerleader')); // 'js-cheerleader'
```
这看起来比第一个版本更加晦涩难懂，但是先忍一下，我们就要解决。

为了实现上述的代码，我们将组合几种常用的工具，比如：`split()`、`join()`和`map()`,如下为实现：
``` js
//const curry = fn => (...args) => fn.bind(null, ...args);
const curry = function(fn) {
  return function(...args) {
    return fn.bind(null, ...args);
  }
}

const map = curry((fn, arr) => arr.map(fn));

const join = curry((str, arr) => arr.join(str));

const toLowerCase = str => str.toLowerCase();

const split = curry((splitOn, str) => str.split(splitOn));
```
除了`toLowerCase`外，所有这些函数都可以从loadsh/fp中直接获取到。可以向这样使用它们：
``` js
import { curry, map, join, split } from 'lodash/fp';
```
这里我们偷个懒，直接使用这个简写版本，注意这里`curry`并不是一个真正的柯里化函数，而是一个偏应用。关于柯里化和偏应用请查看[Partial Application And Curry]()。

回到我们的`toSlug`实现，这里有些东西让我真的很不喜欢：
``` js
const toSlug = input => encodeURIComponent(
  join('-')(
    map(toLowerCase)(
      split(' ')(
        input
      )
    )
  )
);

console.log(toSlug('JS Cheerleader')); // 'js-cheerleader'
```
对我来说嵌套太多了，这段代码不是特别让人难以弄懂。我们可以用一个自动组合函数的函数来扁平话嵌套，就是说，这个函数会从一个函数得到输出，经过计算之后，把值传递给下一个函数，以此类推...

细想一下，好像JavaScript数组中有个函数可以做差不多的事情。这个函数就是`reduce()`,它用一系列值作为参数，对每个值应用一个函数，最后累加成一个结果。值本身也可以是函数。但是`reduce()`是从左向右进行叠加，为了匹配上面的组合行为，我们需要一个从右向左之行的函数--`reduceRight()`:
``` js
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
```
和`reduce()`一样,`reduceRight`方法带有一个`reducer`函数和一个初始值(`x`)为参数。我们可以用它从右向左迭代数组，将函数依次应用到每个数组元素上，最后得到累加值(`v`)

用`compose`，我们就可以不需要嵌套来重写上面的组合：
``` js
const toSlug = compose(
  encodeURIComponent,
  join('-'),
  map(toLowerCase),
  split(' ')
);
```
可以使用lodash提供的`compose()`方法：
``` js
import { compose } from 'lodash/fp';
```
当以数学形式的组合从内到外的角度来思考时，`compose(..)`是不错的。不过，我们完全也可以从左向右的顺序来思考，这种形式通常被称为`pipe()`. lodash称之为`flow()`:
``` js
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const fn1 = s => s.toLowerCase();
const fn2 = s => s.split('').reverse().join('');
const fn3 = s => s + '!'

const newFunc = pipe(fn1, fn2, fn3);
const result = newFunc('Time'); // emit!
```
可以看到，这个实现与`compose()`几乎完全一样。唯一不同之处是，这里使用`.reduce()`,而不是`.reduceRight()`,即从左向右累加！

下面我们看一下用`pipe()`实现的`toSlug()`函数：
```js
const toSlug = pipe(
      split(' '),
      map(toLowerCase),
      join('-'),
      encodeURIComponent
    );

console.log(toSlug('JS Cheerleader')); // 'js-cheerleader'
```
这个版本，看起来简单清爽多了。

精通函数式编程的开发人员会使用大量的函数组合，而我经常使用函数组合来消除临时变量。仔细查看`pipe()`版本的`toSlug()`,你会发现一些特殊之处。

在命令式编程中，在一些变量上执行转换时，在转换的每个步骤中都会找到对变量的引用。而上面的`pipe()`是采用**points-free(无值)**的风格写的，就是说完全找不到它要操作的参数。

我经常将`pipe`用在单元测试和Redux状态reducer这类事情上，用来消除中间变量。中间变量的存在只用来保存一个操作到下一个操作之间的临时值。

这玩意听起来比较古怪，不过对着你不断的熟悉和应用函数式编程，你会发现在函数式编程中，你是在和相当抽象、广义的函数打交道，而在这样的函数中，事物的名字并没有那么重要，重要的是数据流，名称只会碍事。

现在你应该对函数式编程是什么样子，以及怎么利用`partial application`和`curry`如何与`函数组合`协作来帮助你编写可读性更强的程序有点感觉了。

