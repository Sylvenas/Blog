---
title: "composing software introduction"
author: [Sylvenas]
categories: "composing software"
img: './img/2017-12-10.jpg'
excerpt: '在我高中第一节程序设计课上，我被告知软件开发是"将复杂问题转化为较小问题，并组合简单的解决方案并形成完整的解决方案以解决复杂的问题的行为"。'
---

在我高中第一节程序设计课上，我被告知软件开发是"将复杂问题转化为较小问题，并组合简单的解决方案并形成完整的解决方案以解决复杂的问题的行为"。

我感觉这些年最大的遗憾之一就是未能早日理解这句话的意思。我太晚才弄明白软件设计的本质。

我接触过不少的开发人员，在和他们的交流中我了解到我并非个例。很少有现职软件开发人员很好地掌握了软件开发的本质。他们不知道手头现有的最重要的工具，或者如何善加利用它们。所有人一直在努力回答软件开发领域中最重要的两个问题：

* 什么是函数组合
* 什么是对象组合

在工作中，就算你不知道上面的两个概念，你也不可能避开他们，并且你一直在做上面的两件事情-不过做的很糟糕。或许你编写的代码有更多的bug，或许让其他开发人员很难理解。这是个大问题，代价非常昂贵，很多时候维护软件所花费的时间，比重新开发他们还要多。

### You Compose Software Every Day
如果你是软件开发人员，无论你知道与否，其实你每天都在组合函数和数据结构。你要么有意识的做，要么在漫不经心的修修补补。

软件开发过程就是将大问题分解成较小的问题，创建解决这些小问题的组件，然后将这些小组件组合在一起，形成一个完整的应用程序。

#### 函数组合
函数组合是将一个函数应用到另一个函数输出的过程。在数学中，假设两个函数：`f`和`g`,`(f·g)(x) = f(g(x))`。这个圆点就是组合运算符。它通常被念成为"...与...组合"或者"...组合...之后"。你可以直接说"f与g组合等于x的g的f",我们在`g`之后说`f`，是因为`g`先被求值，然后其输出作为一个参数传递给`f`。

每次像这样编写代码时，就是在组合函数：
``` js
const g = n => n + 1;
const f = n => n * 2;

const doStuff = x => {
  const afterG = g(x);
  const afterF = f(afterG);
  return afterF;
};

doStuff(20); // 42
```
每次使用`promise`的时候，就是在组合函数：
``` js
const g = n => n + 1;
const f = n => n * 2;

const wait = time => new Promise(
  (resolve, reject) => setTimeout(
    () => resolve(20),
    time
  )
);

wait(300)
  .then(() => 20)
  .then(g)
  .then(f)
  .then(value => console.log(value)) // 42
```
同样，每次链接数组方法调用、lodash方法、observable(Rxjs等)，都是组合函数。如果你正在使用方法链，就是在组合函数。如果将返回值传递给其他函数，那么就是在组合。如果在一个序列中调用两个方法，就是使用`this`为输入数据来组合。

如果我们能有意识的去组合函数，我们可以做的更好，我们可以将`doStuff()`函数改进为一行搞定：
``` js
const g = n => n + 1;
const f = n => n * 2;

const doStuffBetter = x => f(g(x));

doStuffBetter(20); // 42
```
对这种形式的一个常见的异议是，它更难调试。例如，我们如何使用函数组合的方式来写这个方法呢？
``` js
const doStuff = x => {
  const afterG = g(x);
  console.log(`after g: ${ afterG }`);
  const afterF = f(afterG);
  console.log(`after f: ${ afterF }`);
  return afterF;
};

doStuff(20); // =>
/*
"after g: 21"
"after f: 42"
*/
```
首先，我们来把log`after f`,`after g`的操作抽象待一个`trace`的小工具中：
``` js
const trace = label => value => {
  console.log(`${ label }: ${ value }`);
  return value;
};
```
那么我们现在可以这样来使用：
``` js
const doStuff = x => {
  const afterG = g(x);
  trace('after g')(afterG);
  const afterF = f(afterG);
  trace('after f')(afterF);
  return afterF;
};

doStuff(20); // =>
/*
"after g: 21"
"after f: 42"
*/
```
如果使用lodash和ramda等热门的函数式编程库，可以让函数组合刚方便。你可以使用lodash的`pipe`方法来组合函数：
``` js
import pipe from 'lodash/fp/flow';

const doStuffBetter = pipe(
  g,
  trace('after g'),
  f,
  trace('after f')
);

doStuffBetter(20); // =>
/*
"after g: 21"
"after f: 42"
*/
```
如果你不想引入lodash，你可以这样定义`pipe`:
``` js
// pipe(...fns: [...Function]) => x => y
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
```

`pipe()`创建一个函数的管道，把一个函数的输出传递给另一个函数作为输入，当使用pipe的时候，最大的特点是不需要中间变量。编写不涉及中间变量的代码的风格叫做`point-free style`，减少了中间变量也就减少了很多不必要的复杂性。

减少复杂性的几个好处：
* 工作记忆
人脑平均只有少量共享资源用于[工作记忆(Working Memeory)](http://www.nature.com/neuro/journal/v17/n3/fig_tab/nn.3655_F2.html)中的离散量子，而每个变量潜在地消耗这些量子之一。随着更多变量的添加，我们精确回忆每个变量含义的能力就会降低。工作记忆模型通常涉及4-7个离散量子。超过这些数字的话，错误率就会显着增加。

使用管道的形式，我们消除了3个变量 - 腾出几乎一半的可用工作记忆去做其他事情。这显著降低了我们的认知负担。在将数据分割成工作记忆方面，软件开发人员趋向于比普通人做得更好一些，不过也不是好很多，因为分割会削弱贮存的重要性。
* 信噪比
简洁的代码也提高了代码的信噪比。就像收听收音机一样 - 当收音机没有正确调到电台时，会产生很多干扰噪音，更难听到音乐。当将其调到正确的电台时，噪点就消失，会得到更强的音乐信号。

代码是一样的。更简洁的代码表达可以提高理解能力。有些代码给了我们有用的信息，有些代码只占用空间。如果你可以减少所用代码量，而不会减少它传输的含义，那么可以使代码更容易被其它需要读它的人解​​析和理解。

* 减少bug
看看函数前后。看起来好像函数在节食减肥一样。这很重要，因为额外的代码意味着额外的可能产生的bug。

>较少的代码=较少的可能产生bug的地方=较少的bug

### 组合对象
如下都是基础数据类型：
``` js
const firstName = 'Claude';
const lastName = 'Debussy';
```
而如下是一个符合数据类型：
``` js
const fullName = {
  firstName,
  lastName
};
```
同样，所有`Array`,`Set`,`Map`,`WeakMap`,`TypedArray`等都是符合数据类型。任何时候，只要你构建任何非基础类型数据结构，就是在执行某种对象组合。

类继承可以用于构造组合对象，但它是一种有限制性和脆弱的模式。更建议使用更加灵活的方式来组合对象构建，而不是用死板的、紧耦合的类继承方式。

>"组合对象是通过将对象放在一起，使得后者是前者的一部分而形成的。" ~[《计算机科学中的分类方法：从拓扑学角度》](https://www.amazon.com/Categorical-Methods-Computer-Science-Topology/dp/0387517227/ref=as_li_ss_tl?ie=UTF8&qid=1495077930&sr=8-3&keywords=Categorical+Methods+in+Computer+Science:+With+Aspects+from+Topology&linkCode=ll1&tag=eejs-20&linkId=095afed5272832b74357f63b41410cb7)。

类继承只是组合对象的一种方式。所有类都生成组合对象，但并非所有组合对象都是由类或者类继承生成的。"对象组合由于类继承"意味着你应该从小组件生成组合对象，而不是从类层次结构中祖先继承所有的属性。后者会导致面向对象程序设计中众多众所周知的问题：

* **紧耦合问题**：由于派生类完全依赖于基类的实现，所以类继承是面向对象设计中可用的最紧密的耦合。
* **脆弱的基类问题**：由于紧耦合，对基类的更改会潜在破坏大量后代类，尤其是在引用第三方的类库的时候，作者并不会考虑我们怎么根据他的代码做了多少扩展。
* **层级不灵活的问题**：对于单祖先分类法，加以足够的时间和演化，所有类别分类法最终对新的用例都是错的。
* **重复的必要性问题**：由于层级不灵活，新的用例通常是通过重复而不是扩展来实现，导致很多个类似的类的出现。一旦出现重复，那么新的派生类不知道应该从哪里继承，或者为什么选择这个。
* **大猩猩/香蕉问题**："...面向对象语言的问题是它们总是可以得到语言运行环境的所有的隐藏信息。你想要一个香蕉，但是你所得到的却是一只拿着香蕉的大猩猩和整座森林。"~[《编程人生》](http://www.amazon.com/gp/product/1430219483?ie=UTF8&camp=213733&creative=393185&creativeASIN=1430219483&linkCode=shr&tag=eejs-20&linkId=3MNWRRZU3C4Q4BDN) by Joe。

最常见的对象组合方式称为`mixin`组合。很类似鸡尾酒，可以先拿一种你喜欢的酒，然后再添加各种你喜欢的饮料、汽水、果汁等等。

使用类继承创建组合：
``` js
class Foo {
  constructor () {
    this.a = 'a'
  }
}

class Bar extends Foo {
  constructor (options) {
    super(options);
    this.b = 'b'
  }
}

const myBar = new Bar(); // {a: 'a', b: 'b'}
```
使用mixin组合创建对象：
``` js
const a = {
  a: 'a'
};

const b = {
  b: 'b'
};

const c = {...a, ...b}; // {a: 'a', b: 'b'}
```
稍后我们会继续探讨其他风格的对象组合。现在，你应该理解的是：
* 1.能做到这一点的方法不止一种。
* 2.有些方法比其他方法更好。
* 3.为你手头的工作选择最简单、最灵活的方式

### 总结
本文并非讨论函数式编程(FP)对面向对象编程(OOP)或一种语言对另外一种语言。组件可以采取函数、数据结构、类等形式...不同的编程语言倾向于为组件提供不同的原子元素。Java提供对象，haskell提供函数等...但是不论你喜欢什么编程语言和什么样的范式，你都不能摆脱函数组合和数据结构。

我们将多讨论函数式编程，因为函数是JavaScript中用于组合的最简单的事情，函数式编程社区已经投入了大量的时间和精力来规范化函数组合技术。

我们不会说函数式编程比面向对象编程更好，或者建议你使用哪一种。OOP和和FP是一种假对立。我所见过的所有优秀的JavaScript应用程序或者类库，都充分利用和广泛混合了FP和OOP。

我们将使用对象组合来生成函数式编程的数据类型，而用函数式编程来生成OOP的对象。

无论你如果编写软件，都应该很好的组合。

>软件开发的本质是组合

不了解组合的软件开发人员就像一个不了解螺栓或钉子的室内建筑师。创建软件而不知道组合就像室内建筑师把墙壁用胶带和疯狂的胶水粘在一起一样。

现在是时候简化了，而简化的最简单的方法就是触及本质。