---
title:  "[译+改] React Fiber 中为何以及如何使用链表遍历组件树"
author: [Sylvenas]
categories: 'React'
img: './img/2015-03-25.jpg'
---

[原文链接](https://indepth.dev/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-to-walk-the-components-tree)

## 前置知识
Fiber 架构有两个主要的渲染阶段:
- reconciliation/render
- commit

在源码中 reconciliation 阶段也被视为 "render" 阶段. 在该阶段, React 会遍历整个组件树, 并且进行如下操作:
- 更新 state 和 props
- 调用生命周期方法
- 检索当前组件的子组件
- 比对新老子组件
- 计算出需要在 commit 阶段被执行的 DOM 更新

上述所有操作被称为 **Fiber 内部工作(work inside Fiber)**。 需要完成的工作类型取决于 `React Element` 的类型. 比如, 对于 `Class Component`, React 会进行实例化, 然而不会实例化 `Functional Component`。 如果感兴趣的话, [在这里](https://github.com/facebook/react/blob/340bfd9393e8173adca5380e6587e1ea1a23cefa/packages/shared/ReactWorkTags.js?source=post_page---------------------------#L29-L28) 你可以看到 `Fiber` 上所有的工作类型。 Andrew 也在演讲中提到了这些:

> 当处理 `UI` 的时候, 如果一次性执行太多的 `React` 工作, 那么可能会导致动画掉帧...

那么 '一次性执行' 指的是什么? 如果 React 以**同步的方式**遍历整个组件树, 并且对每个组件进行更新, 那么代码的执行时间有可能会超过 `16ms` 有效时间, 从而造成掉帧卡顿现象。

那么这个问题可以解决吗?

> 较新的浏览器以及 React Native 实现了相关 API, 来解决这个问题...

全局函数—— [requestIdleCallback](https://developers.google.com/web/updates/2015/08/using-requestidlecallback), 可以把函数加入到队列中, 等到浏览器空闲的时候再去调用，然而我们最好在这个时间范围内执行完毕，然后交还控制权给浏览器,不然会依然会导致UI阻塞,我们可以看下浏览器每一帧都执行了什么任务(Task), 花费了多少时间。

![](https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8078327500/0765/0701/0d25/29978cb29a7d1e3d1b17554762f9765b.png)

浏览器在一帧内可能会做执行下列任务，而且它们的执行顺序基本是固定的:
- 处理用户输入事件
- Javascript执行
- requestAnimation 调用
- 布局 Layout
- 绘制 Paint

上面说理想的一帧时间是 16ms (1000ms / 60)，如果浏览器处理完上述的任务(布局和绘制之后)，还有盈余时间，浏览器就会调用 requestIdleCallback 的回调。例如:

![](https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8078337702/b5ea/0f2a/4114/a6e95292a28c2b0d100da1a4bf1be6a6.png)

下面的例子告诉你如何使用它:

``` js
requestIdleCallback((deadline)=>{
    console.log(deadline.timeRemaining(), deadline.didTimeout)
});
```

如果在 `console` 控制台执行上述代码, Chrome 浏览器会打印 `49.9, false`. 这表明我有 `49.9ms` 去做任何我想做的工作, 并且时间还有富余, 否则 `deadline.didTimeout` 会变为 `true`. 记住, 一旦浏览器执行工作, `timeRemaining` 会立刻改变, 所以应该随时检查它。

> requestIdleCallback 在使用上其实是有局限性的, 不能频繁地调用它去实现平滑的 UI 渲染(当浏览器异常繁忙的时候，可能不会有盈余时间，这时候requestIdleCallback回调可能就不会被执行),另外由于只有较新的浏览器实现了该API, 所以 React 团队 不得不实现他们自己的版本。

假如我们将 React 更新组件的代码放到 `performWork` 函数, 使用 `requestIdleCallback` 去调度, 代码会变成下面这样:

``` js
requestIdleCallback((deadline) => {
    // while we have time, perform work for a part of the components tree
    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && nextComponent) {
        nextComponent = performWork(nextComponent);
    }
});
```

上述代码对于单个组件执行相关更新工作, 并且返回了指向下一个组件的引用. 不用再像之前的 [reconciliation](https://reactjs.org/docs/codebase-overview.html#stack-reconciler) 算法那样, 同步处理组件树. Andrew 也谈到了这个问题:

> 为了使用这些 API, 你需要一种可以将渲染工作拆分为单元

为了解决这个问题, React 重新实现了树的遍历算法, **原本的算法采用基于内置堆栈的同步递归策略, 而新的算法则是基于链表和指针的异步策略**。 Andrew 的文章也提到了:

> 如果只依赖内置的调用栈, 那么 React 会一直工作直到调用栈为空...， 如果可以中断调用栈并且手动操作调用栈的每一帧, 那不是美滋滋么? 这其实就是 React Fiber 的思想. **Fiber 专为 React 组件设计, 它重新实现了调用栈**。 你也可以把每个 Fiber 当作一个帧。

## 什么是堆栈?

我假设你已经熟悉了调用栈的相关概念. 给代码打个断点, 然后在浏览器调试窗口就可以看到它的调用栈. 下面是 维基百科 对它的解释:

> In computer science, a *call stack* is a stack data structure that stores information about the active subroutines of a computer program… the main reason for having call stack is *to keep track of the point* to which each active subroutine should return control when it finishes executing… A *call stack* is composed of *stack frames*… Each stack frame corresponds to a call to a subroutine which has not yet terminated with a *return*. For example, if a subroutine named DrawLine is currently running, having been called by a subroutine DrawSquare, the top part of the call stack might be laid out like in the adjacent picture.

![](https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8052460125/9d33/235b/893d/05c8ee9e54032622515a04108cc07220.png)

### 为什么栈和 React 有关?

我在文章的第一部分提到了, React 在 reconciliation/render 阶段遍历组件树并更新组件. 之前的算法采用的是基于内置调用栈进行同步递归遍历组件树的策略. 这篇文章 介绍了 [reconciliation](https://reactjs.org/docs/reconciliation.html?source=post_page---------------------------#recursing-on-children) 递归算法:

在文章的第一部分我们提到, React 在 reconciliation/render 阶段遍历组件树并更新组件. 之前的 reconciler 算法采用的是同步递归内置调用栈的策略. 官方文档 阐述了这个过程并且解释了递归算法。

默认情况下, 当递归遍历某个 DOM 节点的子节点时, React 只同时遍历两个子节点列表, 在遍历过程中找到它们的差异并生成一个 mutation(突变)。

你想想, 每次递归都会在栈中添加一个帧. 并且它是同步的. 假设有如下的组件树:

![](https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8052507630/540d/c408/5847/fd7b72a284a043b53052256c4446c4c5.png)

如下所示的 render 函数会返回一些对象. 你可以把这些对象看作 React 组件的实例:

``` js
const a1 = {name: 'a1'};
const b1 = {name: 'b1'};
const b2 = {name: 'b2'};
const b3 = {name: 'b3'};
const c1 = {name: 'c1'};
const c2 = {name: 'c2'};
const d1 = {name: 'd1'};
const d2 = {name: 'd2'};

a1.render = () => [b1, b2, b3];
b1.render = () => null;
b2.render = () => [c1];
b3.render = () => [c2];
c1.render = () => [d1, d2];
c2.render = () => null;
d1.render = () => null;
d2.render = () => null;
```

React 需要遍历整个组件树并对每一个组件进行更新操作. 为了简化这个过程, 在更新每个组件的时候, 只会打印当前组件的 name 属性的值以及返回它的子组件. 下面是递归的实现方式。

### 递归遍历
通过递归调用 walk 函数来遍历整个树, 代码如下所示:

``` js
walk(a1);

function walk(instance) {
    doWork(instance);
    const children = instance.render();
    if(children){
      children.forEach(walk);
    }
}

function doWork(o) {
    console.log(o.name);
}
```

上述代码会输出:
``` 
a1, b1, b2, c1, d1, d2, b3, c2
```

递归非常适合遍历树型结构. 但是它有一个最大的局限性, 那就是**不能将某个工作拆分为粒度更小的单元**。 我们不能暂停组件的更新工作并且在后续的某个时间段内恢复它. React 会一直通过这种方式来遍历, 直到处理完所有的组件并且调用栈为空(这可能耗时较长)。

这个问题的根源还在于JSX，JSX同时满足了**组件化与标签化**

``` jsx
<div>
   <Foo>
      <Bar />
   </Foo>
</div>
```

但**标签化是天然套嵌的结构，意味着它会最终编译成递归执行的代码**。递归不可避免会产生调用"栈"的堆叠，使用栈很方便，因为你无需自己跟踪“盒子堆”，栈替你这样做了,但是也要付出代价：存储详尽的信息可能占用大量的内存。每个函数调用都要占用一定的内存，如果栈很高，就意味着计算机存储了大量函数调用的信息，在这种情况下，你有两种选择：

- 重新编写代码，转而使用循环
- 使用**尾递归**

由于尾递归调用的使用条件苛刻，所以方案选择只能是转而使用循环， 事实上, React 采用了**单链表树状结构的遍历算法**。 这使得可以**暂停遍历并且抑制调用栈的增长**。

### 链表遍历

幸运的是, 我在 Sebastian Markbåge 的 [issue](https://github.com/facebook/react/issues/7942?source=post_page---------------------------#issue-182373497) 发现了关于这个算法的 代码片段. 要实现这个算法, 需要一个数据结构, 它有三个字段:

- child - 指向第一个子节点
- sibling - 指向第一个兄弟节点
- return - 指向父节点

在新的 reconciliation 算法条件下, 由 Fiber 来调用上述字段组成的数据结构. 在底层它代表一个 React Element. 我的下一篇文章会讲述更多的有关于它的知识.

> 注意，child属性仅仅指向“长子”，而次子是通过“长子”的sibling属性指向的，但是不管长子还是次子，都包含返回父元素的return 引用

如下所示的流程图展示了各个节点间的关系:

![](https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8052715769/9d42/293c/0e06/8a958ee002dba604ed7cd403c0b2521e.png)

因此我们首先定义节点的数据结构:
``` js
class Node {
    constructor(instance) {
        this.instance = instance;
        this.child = null;
        this.sibling = null;
        this.return = null;
    }
}
```

如下所示, 使用 `link` 函数将由 `render` 函数返回的子节点列表连结:

``` js
function link(parent, elements) {
    if (elements === null) elements = [];

    // 子元素数组倒叙遍历，依次添加父元素(return) 和 下一个兄弟元素(sibling)
    // 请注意最后一个子元素是没有 sibling 的
    parent.child = elements.reduceRight((previous, current) => {
        const node = new Node(current);
        node.return = parent;
        node.sibling = previous;
        return node;
    }, null);

    return parent.child;
}
```

link 方法从后往前遍历节点列表, 将它们以单链表的形式连接. 函数最终返回一个指针, 指向列表中的第一个节点. 如下代码所示:

``` js
const children = [{name: 'b1'}, {name: 'b2'}];
const parent = new Node({name: 'a1'});
const child = link(parent, children);

// the following two statements are true
console.log(child.instance.name === 'b1');
console.log(child.sibling.instance === children[1]);
```
同时, 我们也实现了一个 `doWork`辅助函数, 执行对单个节点的操作. 函数内部打印了组件的名称(component.name). 除此之外, 它检索了子节点列表, 并且将子节点和父节点/兄弟节点连结起来, 代码如下所示:

``` js
function doWork(node) {
    console.log(node.instance.name);
    const children = node.instance.render();
    return link(node, children);
}
```
好的, 现在我们实现了核心的遍历算法. 采用的是深度优先的策略, 代码如下所示:

``` js
function walk(o) {
    let root = o;
    let current = o;

    while (true) {
        // perform work for a node, retrieve & link the children
        let child = doWork(current);

        // if there's a child, set it as the current active node
        if (child) {
            current = child;
            continue;
        }

        // if we've returned to the top, exit the function
        if (current === root) {
            return;
        }

        // keep going up until we find the sibling
        while (!current.sibling) {

            // if we've returned to the top, exit the function
            if (!current.return || current.return === root) {
                return;
            }

            // set the parent as the current active node
            current = current.return;
        }

        // if found, set the sibling as the current active node
        current = current.sibling;
    }
}
```

尽管上面的代码实现不难理解, 你还是要自己 尝试一下. 上述算法的理念是保持对 current node(当前节点) 的引用, 并且在遍历树中的某一条路径的时候重新赋值, 直到遍历到尽头. 之后使用 return 指针返回父级节点，这是一种父级优先，深度优先的遍历算法。

[这里查看完整代码](https://gist.github.com/Sylvenas/e8aba3432a5ab2858e93deb1d03c08a6)

如果我们检查上述算法的调用栈, 就会看到:

![](https://d2.music.126.net/dmusic/obj/w5zCg8OAw6HDjzjDgMK_/8052870423/b407/2bb5/00b0/52d7a95267980b8d55385bfbdefd30c2.gif?download=1_ybVgRoNf-dBxR_OKxn4oKQ.gif)

可以看到, 调用栈并没有随着树的遍历而增长. 但是如果现在给 doWork 方法打个断点, 可以看到如下结果:

![](https://d2.music.126.net/dmusic/obj/w5zCg8OAw6HDjzjDgMK_/8052902015/2685/fea5/1137/18c4261173d73092d1e44712f912c70a.gif?download=1_ErzqXpJt5KkLKxHCn31hmA.gif)

用组件树的结构来表达，遍历的顺序如下：

![](https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8053983966/74a2/530c/746a/312ba32b547c6851d583b3642be0d7c1.png)

这看起来很像浏览器的调用栈. 因此通过这个算法, 我们有效地利用我们自己实现的调用栈替代了浏览器默认的调用栈. Andrew 也提到了这一点:

> Fiber 是调用栈的重新实现, 专为 React 组件设计. 你可以将一个 fiber 看作一个虚拟的栈帧.

因为我们现在通过保持对节点的引用来管理调用栈, 所以该节点可以看作一个顶级帧:

``` js
function walk(o) {
    let root = o;
    let current = o;

    while (true) {
            ...

            current = child;
            ...
            
            current = current.return;
            ...

            current = current.sibling;
    }
}
```
我们可以在任何时候中断或恢复遍历. 这正是使用 requestIdleCallback API 的前置条件.


## What is Fiber ?
Fiber 可以从两个角度理解：
### 一种流程控制原语
进程/线程是经常遇到的概念，还有一个概念“协程”,在[Ruby中的协程](https://ruby-doc.org/core-3.0.0/Fiber.html)就称为“Fiber”,其实很多语言都有类似的机制，例如 Lua 的Coroutine, 还有前端开发者比较熟悉的 ES6 新增的 `Generator`。'协程'只是一种控制流程的让出机制。要理解协程，你得和普通函数一起来看, 以Generator为例:

普通函数执行的过程中无法被中断和恢复：

``` js
const tasks = []
function run() {
  let task
  while (task = tasks.shift()) {
    execute(task)
  }
}
```

而 Generator 可以:

``` js
const tasks = []
function * run() {
  let task

  while (task = tasks.shift()) {
    // 🔴 判断是否有高优先级事件需要处理, 有的话让出控制权
    if (hasHighPriorityEvent()) {
      yield
    }

    // 处理完高优先级事件后，恢复函数调用栈，继续执行...
    execute(task)
  }
}
```

React Fiber 的思想和协程的概念是契合的: React render/reconciliation的过程可以被中断，可以将控制权交回浏览器，让位给高优先级的任务，浏览器空闲后再恢复render/reconciliation。

### 一种数据结构
Fiber的另外一种解读是'纤维': 这是一种数据结构或者说执行单元。React要实现遍历 component tree 从“递归”到“循环”的转换，必然需要一种特殊的数据结构，而这种结构就是上文中介绍的`Node`,核心是包含`child`,`return`,`sibling`三个用来表示关系的结构。

> Fiber 完整的数据结构可以[查看](https://github.com/lit-forest/Blog/issues/1)

## 总结
Fiber是一种模拟函数调用栈的方案，一种可以中断/继续的方案，而为了实现这个方案，react定义了一种包含`child`,`return`,`sibling`的数据结构,同时fiber中包含着虚拟dom的指针(stateNode)，来完成从“递归”到“循环”的替换。



