---
title: "Rxjs Observable"
author: [Sylvenas]
categories: "Rxjs"
img: './img/2017-10-26.jpeg'
---

### pull versus push
*拉取* 和 *推送* 是数据生产者和数据消费者之间进行通信的两种不同的机制。  

**What is pull?**在拉取体系中，总是由数据的消费者决定何时何地从生产者那里获取数据。生产者对数据何时何地传递给消费者毫不知情，只是在被动的生产数据（数据是由消费者主动拉取的，数据生产者因为消费者的拉取数据而被动的生产数据）。     

每一个`JavaScript`函数都是一个拉取系统，函数是数据的生产者，函数的调用者调用函数之后，函数会返回调用者一个值，也就是相当于，函数的调用者，从函数拉取的一个数据。

ES2015新增的[generator functions and iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*),是另外一种拉取系统。方法的调用者调用`iterator.next()`可以从`iterators`（数据生产者）拉取多个值。

**What is push?**在推送系统中，数据的生产者决定什么时候给消费者推送数据，而消费者完全不知道什么时候会接收到数据，消费者是被动的接收数据。

`Promise`是现在JavaScript中最典型的推送系统，作为数据生产者的`Promise`通过`resolve()`方法向数据的消费者推送数据；与函数正好相反，`Promise`决定着什么时候向消费者推送数据，而函数只能等待消费者来拉取数据。

| | 生产者 | 消费者 |
| --- | --- | --- |
| **Pull** | **被动:** 在被请求的时候生产数据 | **主动:** 决定何时请求数据 |
| **Push** | **主动:** 决定何时推送数据给消费者 | **被动:** 接收到数据以后处理 |

Rxjs为JavaScript引入了一个新的推送系统 -- **Observable**,`Observable`是数据的生产者，把生产的数据推送给`Observer`(数据的消费者)。

- **Function** 调用函数后，函数会进行同步计算并返回一个单一值
- **generator** 每次调用生成器之后，会同步计算并返回一个值，可以多次连续调用
- **Promise** 调用之后异步计算并推送一个值（也有可能不推送）
- **Observable** 可以使用同步的方法计算结果，也可以通过异步的方法计算结果，并返回结果（可以是一个也可以是多个）

### Observable是函数概念的扩展
`Observable`既不像`EventEmitter`,也不像`Promise`。Observable中的Subject进行多路推送时与EventEmitter行为上有些类似，但是实际上Observable与EventEmitter并不相同。

> Observable更像是一个不需要参数的函数，但是它拓展了函数的概念使得它可以返回多个值。

看看下面的例子
``` javascript{2,8}
function foo() {
    console.log('Hello');
    return 42;
}

var x = foo.call(); // same as foo()
console.log(x);
var y = foo.call(); // same as foo()
console.log(y);
```
打印结果如下：
```none
"Hello"
42
"Hello"
42
```
我们可以使用Observable重写上面的逻辑：
``` js
var foo = Rx.Observable.create(function (observer) {
    console.log('Hello');
    observer.next(42);
});

foo.subscribe(function (x) {
    console.log(x);
});
foo.subscribe(function (y) {
    console.log(y);
});
```
输出的结果是一样的：
```none
"Hello"
42
"Hello"
42
```
Observable和函数都是在运行时进行求值运算的。如果不运行函数，`console.log('Hello')`就不会运行；如果不`subscribe`（订阅）Observable,`console.log('Hello')`也不会执行；函数的调用和对Observable的订阅都是互相独立的，函数的两次调用，会产生两个独立的作用域，对Observable的两次subscribe也会产生两个独立的作用域。

> Subscribing to an Observable is analogous to calling a Function.（订阅一个Observable和调用一个函数，这两个行为很类似）

一些人认为Observable是异步的，但是这个观点是错误的，如果你像下面这样调用函数：
``` js
console.log('before');
console.log(foo.call());
console.log('after');
```
输出的结果为：
``` none
"before"
"Hello"
42
"after"
```
使用Observable实现同样的逻辑
``` js
console.log('before');
foo.subscribe(function (x) {
  console.log(x);
});
console.log('after');
```
输出结果为：
``` none
"before"
"Hello"
42
"after"
```
**订阅Observable这个行为完全是同步的，和调用方法一样**

> Observable生产数据的却是既可以同步的，也可以是异步的

那么Observable和函数的关键区别在什么地方呢？**Observable(可观察对象)可以进行多次`return`操作，也就是说可以返回多个值**，很明显函数，不能这样做。
``` js
function foo() {
  console.log('Hello');
  return 42;
  return 100; // dead code. will never happen
}
```
函数只能return一个值，但是Observable可以这样做：
``` js
var foo = Rx.Observable.create(function (observer) {
  console.log('Hello');
  observer.next(42);
  observer.next(100); // "return" another value
  observer.next(200); // "return" yet another
});

console.log('before');
foo.subscribe(function (x) {
  console.log(x);
});
console.log('after');
```     
上面的代码会同步的输出：
``` none
"before"
"Hello"
42
100
200
"after"
```
但是同样的你也可以，异步的`return`数据：
``` js
var foo = Rx.Observable.create(function (observer) {
  console.log('Hello');
  observer.next(42);
  observer.next(100);
  observer.next(200);
  setTimeout(() => {
    observer.next(300); // happens asynchronously
  }, 1000);
});

console.log('before');
foo.subscribe(function (x) {
  console.log(x);
});
console.log('after');
```
输出结果为：
``` none
"before"
"Hello"
42
100
200
"after"
300
```
结论：
- `func.call()` 意味着 "*同步的返回给我一个值*"
- `observable.subscribe()` 意味着 "*不管是同步还是异步的，给我一个或者多个值*"

### Observable详述
Rxjs提供了一个工厂方法`Rx.Observable.create()`来`实例化`一个可观察对象（Observable）；Observable被Observe(观察者)`订阅`；在`执行`时可以调用观察者的`next`/`error`/`complete`方法；并且执行的过程可以被`终止`。

Observable的核心内容为
- **Createing** Observable
- **Subscribing** Observable
- **Executing** Observable
- **Disposing** Observable

#### Creating Observable
`Rx.Observable.create`是`Observable`构造函数的别名，接收一个参数：`subscribe`函数。
下面的例子会创建一个Observable,每一秒钟向其订阅者发送一个`hi`字符串。
``` js
var observable = Rx.Observable.create(function subscribe(observer) {
  var id = setInterval(() => {
    observer.next('hi')
  }, 1000);
});
```
> 除了可以使用create函数创建Observable,我们还可以使用[创建操作符](http://reactivex.io/rxjs/manual/overview.html#creation-operators)，如：of,from,interval等来创建Observable。

上面的例子中，`subscribe`函数是定义Observable最核心的部分，接下来我们来了解订阅的含义。

#### Subscribing to Observables
上面例子中的可观察对象observable，可以以如下方式`订阅`。
``` js
observable.subscribe(x => console.log(x));
```
`observable.subscribe`和`Observable.create(function subscribe(observer){...}`中的subscribe同名并非巧合。虽然在Rxjs中它们并不是同一个对象，但是在工程中，我们可以在概念上视两者为等价物。

多个不同的Observer在订阅同一个Observable的时候，它们的subscribe都是不同的，当我们我们传入observer作为参数调用`observable.subscribe()`函数的时候，`Observable.create(function subscribe(observer)){...}`中`subscribe`函数的参数就是我们传入的observer，每一次`observable.sunscribe()`被调用的时候，都是互相独立，互不影响的。

> 当订阅一个Observable的时候，和调用函数类似，我们需要提供一个回调函数来接收data

订阅机制与处理函数的`addEventListener`/`removeEventListener`API不同。虽然我们把Observe传入了`Observable.subscribe()`中，但是观察者并不需要在Observable中进行注册，Observable也不需要维护订阅者列表。

#### Executing Observables
Observable只有被订阅的时候才会执行，执行的逻辑在`Observable.create(function subscribe(observer){....})`内，执行之后会同步或者异步的返回一个或者多个值。

Observable在执行的过程中，可以发送三种不同类型的通知：
- "Next"通知：给next传入一个数字、字符串、对象等等
- "Error"通知：传递一个JavaScript Error 或者 异常
- "Complete"通知：不传递值

"Next"通知是最常用和最重要的通知，其中包含着Observable传递给Observer的数据；在Observable的执行阶段，错误和完成通知，只能发送这两个中的一个，即要么执行完成，要出报错了。

在Observable的执行过程中，0或者多个"Next"通知会被推送。在发生了错误或者完成通知推送之后，Observable不会再推送任何通知给Observer。

下面代码展示了Observable 在执行过程中推送3个“Next” 通知然后结束：
``` js
var observable = Rx.Observable.create(function subscribe(observer) {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
});
```
Observable 严格遵守 Observable 契约，后面值为4的“Next” 通知永远不会被推送：
``` js
var observable = Rx.Observable.create(function subscribe(observer) {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
  observer.next(4); // Is not delivered because it would violate the contract
});
```
使用`try/catch`块包裹 `subscribe` 代码是一个很赞的想法，如果捕获了异常，可以推送错误通知：
``` js
var observable = Rx.Observable.create(function subscribe(observer) {
  try {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
  } catch (err) {
    observer.error(err); // delivers an error if it caught one
  }
});
```

#### Disposing Observable Executions
---
Observable的执行可能是无限的，作为观察者可能需要**主动终止连接的契约**,我们需要特定的API去终止执行过程。因为特定的观察者都有特定的执行过程，一旦观察者获得想要的数据之后就需要终止执行过程以避免带来计算时对内存的浪费。

在调用`observable.subscribe`方法时，会反悔一个`Subscription`对象
``` js
var subscription = observable.subscribe(x => console.log(x));
```
Subscription对象表示执行过程，通过极其简单的API,你可以终止执行过程。详情请阅读`Subscription`[相关文档](http://reactivex.io/rxjs/manual/overview.html#subscription),你可以通过调用`subscription.unsubscribe()`来结束连接契约。
``` js
var observable = Rx.Observable.from([10, 20, 30]);
var subscription = observable.subscribe(x => console.log(x));
// Later:
subscription.unsubscribe();
```
> 在Observable被订阅之后，代表执行过程的Subscription对象将被返回，调用该对象的unsubscribe()方法，可以终止连接。

每一个Observable都需要在`create()`的过程中定义终止的逻辑。在`function subscribe()`中返回自定义的`unsubscribe`就可以实现：
``` js
var observable = Rx.Observable.create(function subscribe(observer) {
  // Keep track of the interval resource
  var intervalID = setInterval(() => {
    observer.next('hi');
  }, 1000);

  // Provide a way of canceling and disposing the interval resource
  return function unsubscribe() {
    clearInterval(intervalID);
  };
});
```
类似于`observable.subscribe` 和 `Observable.create(function subscribe() {...})`的关系，我们在`subscribe`中返回的 `unsubscribe` 也与`subscription.unsubscribe`在概念上等价。事实上，如果我们除去Rx的包装，纯粹的JavaScript代码简单清晰：
``` js
function subscribe(observer) {
  var intervalID = setInterval(() => {
    observer.next('hi');
  }, 1000);

  return function unsubscribe() {
    clearInterval(intervalID);
  };
}

var unsubscribe = subscribe({next: (x) => console.log(x)});

// Later:
unsubscribe(); // dispose the resources
```
我们定义Rxjs中的Observable、Observer、Subscription这些概念的目的是为了在Observable的约束范围内，安全、兼容的调用操作符。
