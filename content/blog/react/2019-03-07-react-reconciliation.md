---
title:  "[译+改] React Fiber reconciliation algorithm "
author: [Sylvenas]
categories: 'React'
img: './img/2015-03-25.jpg'
---

[原文链接](https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react)

## From React Elements to Fiber nodes

从一个最简单 React 组件树开始，一个按钮，一个展示点击按钮数字 + 1

``` js
class ClickCounter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {count: 0};
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState((state) => {
            return {count: state.count + 1};
        });
    }

    render() {
        return [
            <button key="1" onClick={this.handleClick}>Update counter</button>,
            <span key="2">{this.state.count}</span>
        ]
    }
}
```

React中的每个组件都有一个UI表示，这个UI可以通过调用一个view或一个从render方法返回。这是ClickCounter组件的模板：

``` jsx
<button key="1" onClick={this.onClick}>Update counter</button>
<span key="2">{this.state.count}</span>
```

### React Elements
一旦模板通过JSX编译器编译，就会得到一堆React元素。这是从React组件的render方法返回的，而不是HTML。由于我们不需要使用JSX，因此我们的ClickCounter组件的render方法可以像这样重写：

> 此处可以参考[jsx](/blog/2018/09/11/react-jsx.html)的解析与实现

``` js
class ClickCounter {
    ...
    render() {
        return [
            React.createElement(
                'button',
                {
                    key: '1',
                    onClick: this.onClick
                },
                'Update counter'
            ),
            React.createElement(
                'span',
                {
                    key: '2'
                },
                this.state.count
            )
        ]
    }
}
```

在React在遇到JSX的时候会调用 React.createElement 会创建以下两个数据结构：
``` js
[
    {
        $$typeof: Symbol(react.element),
        type: 'button',
        key: "1",
        props: {
            children: 'Update counter',
            onClick: () => { ... }
        }
    },
    {
        $$typeof: Symbol(react.element),
        type: 'span',
        key: "2",
        props: {
            children: 0
        }
    }
]
```

可以看到 React 将 `$$typeof` 属性添加到这些对象，以将它们唯一地标识为 React 元素。然后我们可以通过 `type`，`key` 和 `props` 属性来描述元素。这些值取自传递给 `React.createElement` 函数的值。请注意 `React` 如何将文本内容表示为`span` 和 `button` 节点的子项，以及 `click` 处理程序如何成为按钮元素 `props` 的一部分。 React 元素上还有其他字段，如 `ref` 字段，超出了本文的范围，不再阐述。

同时 `ClickCouter` 元素没有任何的 `props` 或者 `key`:

``` js
{
    $$typeof: Symbol(react.element),
    key: null,
    props: {},
    ref: null,
    type: ClickCounter
}
```

> React Elements 在之前通常被称之为“Virtual DOM”，不管怎么说，所以的 虚拟DOM 本质上就是一个 "包含某些指定属性的对象"，也可以说是用来表示 React Elements 的一种数据结构，没什么神奇的。

### Fiber nodes

在前面的 [React Fiber 中为何以及如何使用链表遍历组件树](/blog/2019/03/04/react-fiber.html)章节中，我们已经介绍了 fiber 也是一种包含 child, return, sibling数据结，那么这种数据结构从何而来？答案是根据 React Elements 的结构创建的，核心代码在[createFiberFromTypeAndProps](https%3A//github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js%23L414),在随后的更新中，React重用fiber节点，并使用来自相应React元素的数据来更新必要的属性。如果不再从render方法返回相应的React元素，React可能还需要根据key来移动层次结构中的节点或删除它。

> 可以查看ChildReconciler函数的实现，来了解React为现有fiber节点执行的所有活动和相应函数的列表

因为React为每个React元素创建了一个fiber node，并且因为我们有一个这些元素的树，所以我们将拥有一个fiber node tree。对于我们的示例应用程序，它看起来像这样:

![fiber node tree](https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8052715769/9d42/293c/0e06/8a958ee002dba604ed7cd403c0b2521e.png)

这在上一篇文章中已经详细的介绍过了，相信不难理解。

## 当前树(current) 和 工作中的树(workInprogress)

在第一次渲染之后，React最终得到一个fiber tree，它反映了用于渲染UI的应用程序的状态。这棵树通常被称为current tree。当React开始处理更新时，它会构建一个所谓的workInProgress tree，它反映了要刷新到屏幕的未来状态。

所有work都在workInProgress tree中的fiber上执行。当React遍历current tree时，对于每个现有fiber节点，它会使用render方法返回的React元素中的数据创建一个备用(alternate)fiber节点，这些节点用于构成workInProgress tree(备用tree)。处理完更新并完成所有相关工作后，React将备用tree刷新到屏幕。一旦这个workInProgress tree在屏幕上呈现，它就会变成current tree。

React的核心原则之一是一致性。 React总是一次更新DOM - 它不会显示部分结果。 workInProgress tree对用户不可见，因此React可以先处理完所有组件，然后将其更改刷新到屏幕。

在源代码中，可以看到很多函数从current tree和workInProgress tree中获取fiber节点：

``` js
function updateHostComponent(current, workInProgress, renderExpirationTime) {...}
```

每个fiber节点都会通过 `alternate` 字段保持对另一个树的对应节点的引用。current tree中的节点指向workInProgress tree中的备用节点，反之亦然。

## side effect

我们可以将React中的一个组件视为一个使用state和props来计算UI的函数。每个其他活动，如改变DOM或调用生命周期方法，都应该被认为是side-effects，react文档中是这样描述的side-effects的：

> You’ve likely performed data fetching, subscriptions, or manually changing the DOM from React components before. We call these operations “side effects” (or “effects” for short) because they can affect other components and can’t be done during rendering.

大多数state和props的变更将会产生 side-effects。执行 effects是 work 的一部分，fiber节点除了可以处理更新之外还可以处理effect相关的内容，每个fiber节点都可以通过 effectTag 属性保存与之相关的 effects。

所以在fiber节点中effect相关的内容主要定义在render/reconciliation阶段结束之后，需要执行的其他操作，举例来说，在Host Component中需要处理添加元素，删除元素，修改元素等操作，在class component中需要调用 componentDidMount and componentDidUpdate 等生命周期。

### effect list

为了实现快速的更新，React 用借用Fiber node实现了带有side effect的单向链表，用来快速的实现遍历，迭代链表要比迭代tree数据结构快速的多，并且可以直接跳过没有side effect的节点。

Dan Abramove为effecs list提供了一个类比: 他喜欢将它想象成一棵圣诞树，“圣诞灯”将所有带有effects的节点绑定在一起。为了使这个effects list可视化，让我们想象下面的fiber node tree，其中橙色的节点都有一些effects需要处理。例如，我们的更新导致c2被插入到DOM中，d2和c1被用于更改属性，而b2被用于激活生命周期方法。effects list将它们链接在一起，以便React可以在以后跳过其他节点：

![](https://pic2.zhimg.com/80/v2-b805de025ddf9e4c56e3ac669cea102d_1440w.jpg)

你可以看到带有effects的节点是如何链接在一起的，当遍历节点时，React使用firstEffect指针来确定effects list的开始位置。所以上图可以表示为这样的线性列表

![](https://pic4.zhimg.com/80/v2-99b799d44b1f32c2d493ef61398ca8cf_1440w.png)

## Fiber tree 完整结构
每个React应用程序都有一个或多个作为container的DOM元素。在我们的例子中，它是带有id为“container”的div元素。

``` js
const domContainer = document.querySelector('#container');
ReactDOM.render(React.createElement(ClickCounter), domContainer);
```
React为每个container创建一个fiber root 对象，可以使用对DOM元素的引用来访问它：
``` js
const fiberRoot = query('#container')._reactRootContainer._internalRoot
```

**这个fiber root 是React保存对整个fiber tree引用的地方**。它存储在fiber tree的current属性中：
``` js
const hostRootFiberNode = fiberRoot.current
```

fiber tree以特殊类型的fiber节点（HostRoot）开始。它是在内部创建的，并充当最顶层组件的父级，HostRoot fiber节点通过stateNode属性指向FiberRoot：
``` js
fiberRoot.current.stateNode === fiberRoot; // true
```

可以通过fiber root访问最顶端的HostRoot的fiber node来探索fiber tree。或者，可以从组件实例中获取单个fiber节点，如下所示：

``` js
compInstance._reactInternalFiber
```
 
### Fiber node 数据结构
现在让我们看一下为ClickCounter组件创建的fiber节点的结构：

``` js
{
    stateNode: new ClickCounter,
    type: ClickCounter,
    alternate: null,
    key: null,
    updateQueue: null,
    memoizedState: {count: 0},
    pendingProps: {},
    memoizedProps: {},
    tag: 1,
    effectTag: 0,
    nextEffect: null
}
```

以及span节点：
``` js
{
    stateNode: new HTMLSpanElement,
    type: "span",
    alternate: null,
    key: "2",
    updateQueue: null,
    memoizedState: null,
    pendingProps: {children: 0},
    memoizedProps: {children: 0},
    tag: 5,
    effectTag: 0,
    nextEffect: null
}
```

fiber节点上有很多字段，我在前面的部分中描述了alternate字段(担任current & workInprogress tree的连接桥梁)，effectTag(副作用的类型)和nextEffect(指向下一个副作用)的用途。现在让我们看看为什么我们需要其他字段：

- **stateNode**：保存对组件的类实例，DOM节点或与fiber节点关联的其他React元素类型的引用。一般来说，可以认为这个属性用于保存与fiber相关的本地状态。

- **type**：定义与此fiber关联的功能或类。对于类组件，它指向构造函数；对于DOM元素，它指定HTML tag。可以使用这个字段来理解fiber节点与哪个元素相关。

- **tag**：定义fiber的类型。它在reconcile算法中用于确定需要完成的工作。如前所述，工作取决于React元素的类型，函数createFiberFromTypeAndProps将**React Element映射到相应的fiber节点类型**。在我们的应用程序中，ClickCounter组件的属性标记是1，表示ClassComponent，而span元素的属性标记是5，表示Host Component。[查看完整Tag](https://github.com/lit-forest/Blog/issues/1#issuecomment-807993919)。

- **updateQueue**：用于状态更新，回调函数，DOM更新的队列

- **memoizedState**：用于创建输出的fiber状态。处理更新时，它会反映当前在屏幕上呈现的状态。

- **memoizedProps**：在前一次渲染期间用于创建输出的props

- **pendingProps**：已从React元素中的新数据更新，并且需要应用于子组件或DOM元素的props

- **key**：具有一组children的唯一标识符，可帮助React确定哪些项已更改，已添加或从列表中删除。它与[此处](https://reactjs.org/docs/lists-and-keys.html#keys)描述的React的“list and key”功能有关。

可以在[此处](https://github.com/facebook/react/blob/6e4f7c788603dac7fccd227a4852c110b072fe16/packages/react-reconciler/src/ReactFiber.js#L78)找到fiber节点的完整结构。在上面的解释中省略了一堆字段，尤其跳过了前一篇文章介绍过的child，sibling和return，也跳过了特定于Scheduler的expirationTime，childExpirationTime和mode等字段类别


## reconciliation算法
前面介绍的React JSX原理，React Elemenet数据结构，Fiber链表数据结构，以及基于Fiber(child,return,sibling)结构的循环遍历方法，为了章节介绍reconciliation算法而准备的。

React把一次渲染分为两个阶段：render/reconciliation 和 commit。

- 在render/reconciliation阶段，React会根据setState和render函数的内容对Component进行预更新并指出UI中需要变更的内容。

在组件第一次执行render的时候，会根据JSX->React ELement->React Fiber Node的顺序生成一个fiber node节点，并且在后续的更新中不断的复用和更新该fiber节点(通过alternate互相指向current & workInProgress fiber tree)。

**render/reconciliation阶段的结果是：创建一颗新的带有side effect标记的fiber node tree，其中的side effect指出在下一个commit阶段需要做的工作**

- 在commit阶段，React会把fiber node中的effect应用到组件的实例，也就是遍历render阶段创建的effect list，并更新dom或者其他用户可见的变化

必须指出的是 render/reconciliation 阶段是可以异步进行的，React根据每一帧中剩余可用时间来出一个或者多个fiber node，在该当前贞剩余时间用完之后会停止工作(遍历fiber Node)，让出控制权给浏览器执行下一帧动画，布局等等(这也是为什么不卡顿的原因，因为浏览器一直可以正常的处理布局，重绘，动画等等，不会被老版本React中的递归diff阻塞);

同时在停止工作的时候，React会记录当前进度，以方便下一帧中，可以继续开始循环(有时候可能会丢弃已完成的工作并从头开始)。

**render/reconciliation阶段所做的工作仅仅是循环遍历fiber node,并通过diff找出需要进行的更新，但是并不会实际更新，也就是说不会产生任何用户可见的变化，所以在该阶段可以频繁的暂停和继续**

但是在 Commit 阶段，一定是同步进行的，因为该阶段会实际执行DOM更新等操作，如果出现暂停等等，会给用户卡顿的感觉，而这是不可接受的。

### 生命周期

React 生命周期中在render阶段会执行的是：
``` js
- [UNSAFE_]componentWillMount (已废弃)
- [UNSAFE_]componentWillReceiveProps (已废弃)
- getDerivedStateFromProps
- shouldComponentUpdate
- [UNSAFE_]componentWillUpdate (已废弃)
- render
```

为什么会废弃例如componentWillMount的生命周期呢？因为componentWillMount生命周期经常被滥用类似提前修改DOM，注入CSS等操作，而这会引起用户可见的变化，但是在 render/reconciliation 的过程是不算的暂停/继续，甚至重新开始的，也就是componentWillMount可能会被执行多次，这很明显是不可接受的。

以下是commit阶段执行的生命周期方法列表：
- getSnapshotBeforeUpdate
- componentDidMount
- componentDidUpdate
- componentWillUnmount

因为这些方法在同步commit阶段执行，所以它们可以包含副作用并获取DOM。

### reconciliation 算法 - render阶段
reconciliation 算法始终从 HostRoot fiber node 开始循环，入口函数在[renderRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L1132)，请注意，React 会跳过已经处理过的fiber node，直到找到未处理的node，例如：如果在某个组件中调用setState，则React将从 HostRoot fiber node 开始，但会快速跳过父节点，直到它到达调用了 setState 方法的组件。

#### work循环的主流程
所有fiber节点都会经过[work loop](https://github.com/facebook/react/blob/f765f022534958bcf49120bf23bc1aa665e8f651/packages/react-reconciler/src/ReactFiberScheduler.js%23L1136)中处理。这是循环的同步部分的实现：
``` js
function workLoop(isYieldy) {
  if (!isYieldy) {
    while (nextUnitOfWork !== null) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  } else {
    // commit 
  }
}
```
在上面的代码中，React 通过`nextUnitOfWork`这个“全局变量”保存从workInprogress tree中获取的需要处理的 fiber node。处理完当前fiber node之后，通过当前fiber node的“child，return，sibling”指向下一个需要处理的node，直到全部处理完，则进入commit阶段

有4个主要函数用于遍历fiber node 树(此时已经是链表的结构，并非真实的tree结构)并启动和完成工作:

- [performUnitOfWork](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L1056)
- [beginWork](https://github.com/facebook/react/blob/cbbc2b6c4d0d8519145560bd8183ecde55168b12/packages/react-reconciler/src/ReactFiberBeginWork.js#L1489)
- [completeUnitOfWork](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L879)
- [completeWork](https://github.com/facebook/react/blob/cbbc2b6c4d0d8519145560bd8183ecde55168b12/packages/react-reconciler/src/ReactFiberCompleteWork.js#L532)

要演示如何使用它们，请查看以下遍历fiber树的动画。已经在演示中使用了这些函数的简化实现。每个函数都需要一个fiber node进行处理，在React 遍历树时，可以看到当前正在处理的fiber node，可以清楚地看到算法如何从一个分支转到另一个分支。它首先完成 child 节点的工作，然后转移到parent身边.

![](https://pic2.zhimg.com/v2-4d6d43020835a41fd20492f29aea1a41_b.webp)

[视频地址](https://vimeo.com/302222454),您可以在其中暂停播放并检查当前节点和功能状态，可以简单的看到，这里适用的树(多向链表)遍历算法是**深度优先搜索(DFS)**

让我们从前两个函数performUnitOfWork和beginWork开始:
``` js
function performUnitOfWork(workInProgress) {
    let next = beginWork(workInProgress);
    if (next === null) {
        next = completeUnitOfWork(workInProgress);
    }
    return next;
}

function beginWork(workInProgress) {
    console.log('work performed for ' + workInProgress.name);
    return workInProgress.child;
}
```

performUnitOfWork函数接收 workInProgress fiber node，并通过调用 beginWork 函数启动工作，也就是说beginWork函数中包含着所有需要对fiber node的处理逻辑，这里处于演示的目的，仅仅打印fiber name，表示已经处理了该节点，beginWork 函数始终返回要在循环中处理的下一个child节点。

如果有下一个子节点，它将被赋值给workLoop函数中的nextUnitOfWork变量然后继续循环。

如果没有子节点，React知道它到达了纵向父子关系分支的末尾，因此它就完成当前节点的工作。一旦该节点完成，就要开始他的“弟弟”节点的处理工作，如果没有弟弟节点，表示横向的兄弟节点也处理到了尽头，则回到父亲节点那里。这是在completeUnitOfWork函数中完成的。

``` js
function completeUnitOfWork(workInProgress) {
    while (true) {
        let returnFiber = workInProgress.return;
        let siblingFiber = workInProgress.sibling;

        nextUnitOfWork = completeWork(workInProgress);

        if (siblingFiber !== null) {
            // If there is a sibling, return it
            // to perform work for this sibling
            return siblingFiber;
        } else if (returnFiber !== null) {
            // If there's no more work in this returnFiber,
            // continue the loop to complete the parent.
            workInProgress = returnFiber;
            continue;
        } else {
            // We've reached the root.
            return null;
        }
    }
}

function completeWork(workInProgress) {
    console.log('work completed for ' + workInProgress.name);
    return null;
}
```

当workInProgress fide node没有子节点时，React会进入`completeUnitOfWork`函数。完成当前fiber的工作后，它会检查是否有兄弟节点；如果找到，React退出该函数并返回指向兄弟节点的指针，兄弟节点将被赋值给nextUnitOfWork变量，React将从这个兄弟开始执行分支的工作。重要的是要理解，在这一点上，React只完成了前面兄弟姐妹的工作。它尚未完成父节点的工作，只有在完成所有子节点工作后，最后才能完成父节点和回溯的工作.

从实现中可以看出，performUnitOfWork 和 completeUnitOfWork主要用于迭代目的，而主要活动则在 beginWork 和 completeWork 函数中进行。

[完整代码链接](https://gist.github.com/Sylvenas/35a2df2bf603a6e54e65047122880a87)

#### reconciliation 算法 - commit阶段
这个阶段从[completeRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L2306)函数开始，这个阶段的主要工作内容就是更新DOM和调用生命周期函数。

在这个阶段，React拥有两个tree和一个side effect list，第一个current tree代表着当前屏幕上展示的UI对应的tree，第二个是workInProgress tree，这是render阶段执行完成之后，生成的即将展示到屏幕上的UI对应的tree。

还有一个重要的side effect list - 通过nextEffect指针链接的，workInProgress 树中节点的子集，请记住，**effects list 是render阶段运行的结果**。render阶段的重点是确定需要插入，更新或删除哪些节点，以及哪些组件需要调用其生命周期方法，其最终生成了effects list。

**side effect list 是提交阶段需要循环迭代的集合，而不是迭代整个workInProgress tree，因为需要update的 node 已经在render阶段明确的指出了，没必要再次全部迭代**

> 出于调试目的，可以通过fiber root的current属性访current tree，可以通过current tree中HostFiber节点的alternate属性访问finishedWork树。

提交阶段的主要的工作内容在[commitRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L523)函数中，主要内容是：

- 在标记了Snapshot effect的节点上使用getSnapshotBeforeUpdate生命周期方法
- 在标记了Deletion effect的节点上调用componentWillUnmount生命周期方法
- 执行所有DOM插入，更新和删除

- 将workInProgress tree设置为current tree

- 在标记了Placement effect的节点上调用componentDidMount生命周期方法
- 在标记了Update effect的节点上调用componentDidUpdate生命周期方法

在调用getSnapshotBeforeUpdate(方法名也非常的好理解：更新之前的快照)方法之后，React会提交执行所有的side effect这个过程分三步进行，

- 第一步，调用componentWillUnmount生命周期，以及执行所有的DOM更新，插入，删除等操作，注意此时的current tree还是老的树，所以componentWillUnmount可以获取老得state,props等等数据

- 第二步，把workInprogess tree 设置成 current tree

- 第三步，调用componentDidMount，componentDidUpdate等生命周期，这个时候已经是新的tree，所以可以获取新的数据。

`commitRoot`函数的主体内容：
``` js
function commitRoot(root, finishedWork) {
    commitBeforeMutationLifecycles()
    commitAllHostEffects();
    root.current = finishedWork;
    commitAllLifeCycles();
}
```
这些子函数中的每一个都实现了一个循环，该循环遍历effects list并检查effect的类型, 如果effect是函数类型的，则执行之。

##### commitBeforeMutationLifecycles函数
例如，这是在effect tree上迭代并检查节点是否具有Snapshot effect的代码:
``` js {4,6}
function commitBeforeMutationLifecycles() {
    while (nextEffect !== null) {
        const effectTag = nextEffect.effectTag;
        if (effectTag & Snapshot) {
            const current = nextEffect.alternate;
            commitBeforeMutationLifeCycles(current, nextEffect);
        }
        nextEffect = nextEffect.nextEffect;
    }
}
```

对于类组件，该effect意味着调用getSnapshotBeforeUpdate生命周期方法.

#### DOM updates
[commitAllHostEffects](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L376)是React执行DOM更新的函数。该函数主要根据DOM Effect Tag的类型执行相应的修改，删除，调换位置等操作

``` js
function commitAllHostEffects() {
    switch (primaryEffectTag) {
        case Placement: {
            commitPlacement(nextEffect);
            ...
        }
        case PlacementAndUpdate: {
            commitPlacement(nextEffect);
            commitWork(current, nextEffect);
            ...
        }
        case Update: {
            commitWork(current, nextEffect);
            ...
        }
        case Deletion: {
            commitDeletion(nextEffect);
            ...
        }
    }
}
```

##### Post-mutation lifecycle methods
[commitAllLifecycles](https://link.zhihu.com/?target=https%3A//github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js%23L465)是React调用其余的生命周期方法componentDidUpdate和componentDidMount的地方


## 总结
终于结束了，后面继续补充怎么生成side effect list相关的文章