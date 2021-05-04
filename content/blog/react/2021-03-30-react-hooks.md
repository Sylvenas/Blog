---
title: 'React Hooks 原理及实现'
author: [Sylvenas]
categories: 'React'
img: './img/2015-03-25.jpg'
catalogue: ['函数如何拥有状态','单向链表存储 hook list','循环链表存储 updater queue','计算最新的值']
---

React Hooks 主要用来解决两个问题，

- 组件之间复用逻辑
  社区中普遍采用的 [High-Order-Components](https://reactjs.org/docs/higher-order-components.html)和[render props](https://reactjs.org/docs/render-props.html),然而这两种方案分别会带来 “wrapper hell” 和代码难以理解/维护的问题。

![wrapper hell](https://d1.music.126.net/dmusic/obj/w5zCg8OAw6HDjzjDgMK_/8151104070/3cc4/6483/97d5/b4a91b516060489f7575f401ec69cd94.gif?download=20201012104934119.gif)

- 函数式组件如何拥有状态
  函数式组件在 `Hooks API` 出现之前，只能充当“渲染组件”的角色，然而鉴于 `ES6 Class` 本身的问题，以及复杂的 `Class Component` 难以维护的问题，所以 `FC` 组件维护状态是一个迫切的需求。

本篇文章主要介绍 `Hook` 的实现原理，我们不会从社区中广泛采用的“源码函数调用链路”出发，把整个 `Hook` 的创建/使用的源代码大概过一遍，就算理解了 `Hook` 的实现原理；我并不认同这种方案，主要因为只是读一遍代码，并没有自己实现，那么过不了多久，就完全抛之脑后了。所以本篇文章我们要自己实现一个 `Hook`。

> 纸上得来终觉浅，绝知此事要躬行。

## 函数如何拥有状态

看一个简单的函数：

```js
function computeCount() {
  let count = 0;
  return count + 1;
}
```

很明显这是个绝对的 “pure function”，任何时候，任何上下文调用该函数，都会返回固定结果：`1`。但是假设我们想在第一个调用该函数的时候返回 `1`，第二次返回 `2`，第三次返回 `3`，依次类推...

换句话说，我们想在下一次调用的时候，依赖上一次的计算结果，如果仅仅使用 `computeCount` 函数，很明显这是不可能的，除非使用“外部变量”，

```js
let outCount;

function computeCount() {
  let count = outCount || 0;
  outCount = count + 1;
  return count + 1;
}
```

同样的道理，在 React Function Component 中，如果不借助“外部变量”，我们就不可能实现组件重新渲染的时候，依据上一次 `state` 计算本次渲染的 `state`，所以必定存在着某个“外部变量”，在 React 中，这个外部变量就是 `fiber node`，不过本篇文章，我们不详细介绍 `state` 如何挂载到 `fiber node` 上了，仅仅使用简单的“外部变量”来保存 `state` 相关的信息。

> 这里不得不提一句，在函数式组件中插入状态(需要记忆函数内的 state)的概念，不是那么“函数式”，违背了 `pure function` 的理念，纯函数不应该依赖上文，也不应该每次调用的结果不一致。

## 单向链表存储 hook list

另外我们根据 [hooks-rules](https://reactjs.org/docs/hooks-rules.html) 文档知道知道 Hook 可以在一个函数内使用多次，换句话说可以拥有多个 hook，并且不能在循环，条件判断中使用，只能在函数在顶层调用，设定规则的原因是 Hook 是使用[链表数据结构](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph)存储的。

也就是，我们只要在“外部变量”中保存 `firstHook` 即可，第二个 hook 为 `firstHook.next`，第三个为 `firstHook.next.next`，以此类推，所以第一步，可以定义 hook 数据结构为：

```js
interface hook {
  memoizedState: any; // 保存当前 hook 的 state
  next: hook;         // next 指向下一个 hook
}
```

在 React 中使用最多，也是最简单的 hook 就是 `useState`，下面我们已实现 `useState`，同时保持和 React 相同的 API 为目标，来逐步推进：

```jsx
function TeamsInfo() {
  const [age, setAge] = useState(18);
  const [name, setName] = useState('income');

  console.log(`Age: ${age}; Name: ${name}`);
}
```

在这个例子中，使用**打印数据的方式替代 React 的渲染到页面的过程**，毕竟这个不是关注的重点。

`useState` 接收一个值作为初始值，然后返回一个数组，数组第一项是，对应的 `state`，也是后面需要不断计算和更新的 `state`，数组第二项为一个函数 `setState`，用来修改 `state`。

`setState` 第一次调用的时候会创建第一个 `hook`，第二次调用的时候产生第二个 `hook`，并挂载到第一个 `hook` 的 `next` 上，创建 `hooks` 链表，所以我们需要两个变量：

- `firstHook`存储创建的第一个 `hook`,
- `lastHook`用来标记当前的最后一个 hook，在下一次新增 hook 的时候，可以快速的挂载到当前的 lastHook 的 next 上，这样可以避免了循环 firstHook 获取最后一个 hook，时间复杂度从 O<sup>n</sup> 降低到 O<sup>1</sup>。

创建 `hook linked list` 的过程实现如下：

```js{10-14}
let firstHook: hook = null;
let lastHook: hook = null;

function mountHookLinkedList() {
  const hook = {
    memoizedState: null,
    next: null,
  };

  if (lastHook === null) {
    firstHook = lastHook = hook;
  } else {
    lastHook = lastHook.next = hook;
  }

  return lastHook;
}
```

创建 hook 的过程肯定是放在 `useState` 函数内的,现在 `useState` 函数为：

```js{2-3}
function useState(initialState: any): [any, Function] {
  const hook = mountHookLinkedList();
  hook.memoizedState = initialState;

  // TODO:
  let setState = () => {};

  return [hook.memoizedState, setState];
}
```

使用目前自定义的 useState:

```js
function TeamsInfo() {
  const [age, setAge] = useState(18);
  const [name, setName] = useState('income');

  console.log(`Age: ${age}; Name: ${name}`);

  return [setAge, setName];
}

const [setAge, setName] = TeamsInfo();
console.log(firstHook);
```

`firstHook` 的数据结构如下,其中 `memoizedState` 存储着初始值，`next` 属性指向 `name hook`，数据结构如下所示；

![](https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8155886335/4bed/bd29/7ec7/01e925dbbb77714a3f615e51dfa61091.png)

整个 `hook` 的链路如下：

![](https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8163787932/1456/1791/9c13/6eb05ae42e59c1daba85c5553fc0e3f2.png)

## 循环链表存储 updater queue

现在思考一下 `setState` 函数该如何实现，先观察一下 `React Hooks` 中 `setState` 的表现：

```js
function App() {
  const [count, setCount] = React.useState(0);

  function handleClick() {
    setCount((x) => x + 1);
    setCount((x) => x * 2);
  }

  return (
    <div className="App">
      <p>{count}</p>
      <button onClick={handleClick}>+</button>
    </div>
  );
}
```

第一次点击按钮之后，count 重新渲染为 2,计算过程为`0 + 1 = 1`，`1 * 2 = 2`：

请注意一个非常关键的点，点击按钮调用了两次 `setCount`， 但是只触发了一次更新，可以推断**setCount()函数调用本身并没有触发 count 的计算，count 的计算是发生在 React 再次渲染过程中调用 useState 重新计算得到的值**，也就是说`setCount`仅仅是存储了 count 的计算方法，而不是直接触发了数据计算。

> 这里不要混淆 class component 的合并 `this.setState`,请注意合并 `this.setState`，也并不是所有情况下都成立的，`this.setState((x)=> x + 1)`的调用方式就不会合并，读者可以自行做个简单的[测试](https://codesandbox.io/s/lucid-pike-88kx8?file=/src/App.js)。

因为可以连续调用`setState`，所以需要一个**队列**来保存所有 state 的计算方法，这个队列应该挂载到 hook 对象上，这样就能区分每个 hook 的计算逻辑，因为 `setState` 可能会触发很多次，为了性能考虑该队列采用循环链表的方式存储：

```js
interface queue {
  last: updater; // 最后一个updater
}

interface updater {
  action: Function | any; // 更新函数
  next: updater; // 下一个updater
}

function dispatchAction(queue, action) {
  const updater = { action, next: null };
  // 将updater对象添加到循环链表中
  const last = queue.last;
  if (last === null) {
    // 链表为空，将当前更新作为第一个，并保持循环
    updater.next = updater;
  } else {
    const first = last.next;
    if (first !== null) {
      // 在最新的updater对象后面插入新的updater对象
      updater.next = first;
    }
    last.next = updater;
  }
  // 将表头保持在最新的updater对象上
  queue.last = updater;
}
```

现在只需要把 `queue` 挂载到 `hook` 上,并通过 [bind](https://sylvenas.github.io/blog/2017/11/23/FP6-Curry-and-PartialApplication.html) 方法闭包 `queue` 到 `dispatcher` 函数中,这样在添加计算函数的时候，可以添加到指定的 `queue` 中：

```js{5}
function useState(initialState: any): [any, Function] {
  const hook = mountHookLinkedList();
  hook.memoizedState = initialState;

  const queue = (hook.queue = {
    last: null,
    dispatch: null,
  });

  const dispatcher = (queue.dispatch = dispatchAction.bind(null, queue));

  return [hook.memoizedState, dispatcher];
}
```

现在 `hook` 的创建以及 `updater` 队列的添加逻辑已经完成.

```js{12-14}
function TeamsInfo() {
  const [age, setAge] = useState(18);
  const [name, setName] = useState('income');

  console.log(`Age: ${age}; Name: ${name}`);

  return [setAge, setName];
}

const [setAge, setName] = TeamsInfo();

setAge((x) => x + 1);
setAge((x) => x + 11);
setAge((x) => x * 2);

console.log(firstHook);
```

所有的数据都挂载到了 `firstHook` 上，所以我们打印了 `firstHook` 的数据结构如下：

![](https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8156078893/8aa1/8f81/21d3/62dc163e9c7c21b99c3fc9342e0ffe18.png)

现在对着图片进行一次回顾，`firstHook` 的三个属性，`memoizedState`指向初始值 `18`，`queue` 存储了所有的数据计算 `updater` (注意 `queue` 是一个循环链表)，`next` 属性指向第二个 `hook`(name 相关)，第二个 `hook` 的数据结构和 `firstHook` 完类似。

在添加数据更新队列之后，目前 `hook` 链表如下：

![](https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8163959419/4d6b/dab9/15e2/c0040ff64e63c55103a8b49e9fbe99f6.png)

## 计算最新的值

由于 hooks 在每次重新渲染的时候(re-call the function)都是一样的，所以在重新渲染的时候没必要重新创建 hooks 的单向链表，只要根据 queue 的环形链表存储的计算逻辑进行循环计算即可，所以我们需要一个变量 `mounted` 存储是否是首次渲染:

```js{5}
// 首次渲染完成
let mounted: boolean = false;
function TeamsInfo() {
  // ...
  mounted = true;

  return [setAge, setName];
}
```

然后在第二，三，四...次渲染的时候，都会跳过创建 hook 的过程，直接进入计算逻辑：

```js{2-4}
function useState(initialState) {
  if (mounted) {
    return updateState();
  }
  // ...
}
```

`updateState` 函数的主要逻辑就是循环 `queue` 环形链表，根据初始值，计最终的结果，然后赋值给 `hook.memoizedState`，**并且要清空 queue 环形链，这样做的原因是本次渲染已经完成，下一个周期内的计算 state 的逻辑和本次未必相同，所以清空；下一个周期会重新添加 updater 到 queue cycle linked list**。

```js{6,11-24,28}
function updateState(): [any, Function] {
  if (currentUpdateHook === null) {
    currentUpdateHook = firstHook;
  }
  const queue = currentUpdateHook.queue;
  const last = queue.last;
  let first = last !== null ? last.next : null;

  let newState = currentUpdateHook.memoizedState;

  if (first !== null) {
    let update = first;
    do {
      // 执行每一次更新，去更新状态
      const action = update.action;
      // 函数则调用
      if (typeof action === 'function') {
        newState = action(newState);
      } else {
        newState = action;
      }
      update = update.next;
    } while (update !== null && update !== first);
  }

  currentUpdateHook.memoizedState = newState;
  // 关键代码，执行一轮调用之后要把更新队列清空，在下一轮的调用中重新添加队列
  queue.last = null;
  currentUpdateHook = currentUpdateHook.next;

  const dispatch = queue.dispatch;

  // 返回最新的状态和修改状态的方法
  return [newState, dispatch];
}
```

到现在为止我们已经完成了 hook 的创建，添加更新方法，re-render 计算最新的 state 的整个链路，hook 分为 mount 阶段和 update 阶段的链路图，如下所示：

![](https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8164082314/fb2f/7f50/4577/dbe0756881d058dbccef364c3c405dcf.png)

完整代码: [GitHub Gist](https://gist.github.com/Sylvenas/28d23025ff369ab63c95cd8a40122d4c)

### hook 链表存放在哪里？

从前面创建 hooks 单向链表的过程可以看出来，我们所有的数据的入口都是放在 `firstHook` 上，目前 `firstHook` 是作为一个函数“外部变量”存储在“全局环境”中的。

在 React 中，这个 `firstHook` 实际上是挂载到该组件对应的 `fiberNode.memoizedState` 属性上的，如图所示：

![](https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/8164187813/c844/e330/629b/07d5a006885d54a9c0e81b8a874b21cd.png)

`fiber node` 的数据结构本篇文章不再重复讲解，可以参考 [React Fiber 中为何以及如何使用链表遍历组件树
](/blog/2019/03/04/react-fiber.html)

### next
实现`useEffect`