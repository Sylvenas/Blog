---
title: "发布订阅模式"
author: [Sylvenas]
categories: "design pattern"
img: './img/2018-01-06.jpeg'
---

### 发布订阅模式的概念
发布订阅模式Pub/Sub,它的主要概念为`定义一对多的关系，当一件事发布时会同时通知所有的订阅者`，在JavaScript和Jquery非常容易看到该模式的使用，例如Jquery里的`on`,下面的代码就可以想象成，`$('.someThing')`为订阅者，订阅了click,如果click事件发生了。发布者就会执行`doSomething`方法。
``` javascript
$('.SomeThing').on('click', function doSomething() {
    //doSomething
});
```
该模式的优点在于`解偶合`，发布者与订阅者不需要知道对方的存在。  
在使用的时候，当一个对象改变时，需要同时改变其他对象，但却不知道实际有多少个对象时，就可以考虑使用`Pub/Sub模式`。

### 发布订阅模式的实现过程
* 创建一个调度中心，用来调度各种发布者和订阅者。
* 创建一个缓存列表，用来存放订阅者以及订阅者接收数据的响应逻辑，并提供对象的取消订阅的方法。
* 提供一个供发布者发布数据的接口，可以接受发布的数据。

### Pub/Sub 简单示例
``` javascript
const ControlCenter = {
    subscribers: {},

    subscribe(type, fn) {
        if (!this.subscribers[type]) {
            this.subscribers[type] = [];
        }
        if (this.subscribers[type].indexOf(fn) == -1) {
            this.subscribers[type].push(fn);
        }
    },

    unsubscribe(type, fn) {
        let listeners = this.subscribers[type];

        if (!listeners) {
            return;
        }

        let index = listeners.indexOf(fn);

        if (index > -1) {
            listeners.splice(index, 1);
        }
    },

    publish(type, valObj) {
        if (!this.subscribers[type]) {
            return;
        }

        if (!valObj.type) {
            valObj.type = type;
        }

        let listeners = this.subscribers[type];

        for (let i = 0, ll = listeners.length; i < ll; i++) {
            listeners[i](valObj);
        }
    }
}
```
然后就可以使用了，首先订阅一个`test/foo`,并且当Task被触发时，会自动执行`foo函数`。   
``` javascript
function foo(evt) {
    console.log(evt.msg);
}

ControlCenter.subscribe('test/foo', foo);
```
然后来触发`test/foo`。
``` javascript
ControlCenter.publish('test/foo', { msg: 'hello,this is a msg' });
```
最后再取消关注`test/foo`。
``` js
ControlCenter.unsubscribe('test/foo', foo);

ControlCenter.publish('test/foo', { msg: 'this should not be seen' })
```
执行结果为：
``` javascript
'hello,this is a msg'
```

### 发布订阅模式的应用场景
* DOM事件    
一种典型的发布订阅者模式，一个事件('click')对一个dom节点进行监听；我们操作DOM节点，触发相应的事件，响应函数执。虽然dom节点和响应函数彼此之间，互相完全不了解，却不影响整个流程的完整进行。

* 自定义事件    
事件是与DOM交互的最常见的方式，但是事件的概念完全可以应用在非DOM代码中;

* 全局的发布订阅模式   
使用一个全局的`ControlCenter`对象做为调度中心，来管理全局的`发布者`和`订阅者`，完全解除了发布者和订阅者之间的耦合关系。

* 模块之间的通信   
现在流行的MVVM框架中，两个不相关联的模块之间的通信。典型的例子为`redux`中的最核心代码：[`createStore`](https://github.com/reactjs/redux/blob/master/src/createStore.js)类中的`subscriabe`和`dispatch`方法为典型的发布订阅模式。

### Pub/Sub 不适合处理的类型
`Pub/Sub`不适合用于一次性事件，所谓一次性事件，是指执行一次任务但可能产生多重结果（例如成功事件和失败事件），做不同的处理，`Ajax`请求就是很常见的一次性事件。这种最好使用Promise来处理。
