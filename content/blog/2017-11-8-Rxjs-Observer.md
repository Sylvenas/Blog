---
title: "Rxjs Observer"
author: [Sylvenas]
categories: "Rxjs"
img: './img/2017-11-08.jpeg'
---

### Observer
**what is Observer?** Observer(观察者)是Observable(可观察对象)推送的数据的消费者。在Rxjs中，Observer是由回调组成的对象，对象的键名分别为：`next`、`error`和`complete`，以此接受Observable推送的不同类型的通知，下面的代码是Observer的一个简单示例：
``` js{2-4}
var observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};
```
Observer的使用，只需要在`subscribe`Observable时，把observer作为参数传递给`subscribe`方法即可。
``` js
observable.subscribe(observer);
```
>Observers are just objects with three callbacks, one for each type of notification that an Observable may deliver.

在Rxjs中，Observer中的`next`,`error`,`complete`三个处理逻辑是可以部分缺失的，即使缺失了部分，Observable仍能正常运行的，只不过是对应的处理逻辑会被忽略，因为没有定义相应的处理逻辑，Observable也就无法处理的。

下面例子中的Observer就缺少了`complete`的处理逻辑：
```js
var observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
};
```
在`subscribe`Observable的时候，可以直接把函数作为参数传递给`subscribe`方法，而不用传入整个Observer对象,当只传入一个函数的时候，Rxjs在内部会创建一个只含有`next`处理逻辑的Observer。
```js
observable.subscribe(x => console.log('Observer got a next value: ' + x));
```
当然你也可以把`next`,`error`,`complete`的回调函数作为参数全部传入`subscribe`方法：
```js
observable.subscribe(
  x => console.log('Observer got a next value: ' + x),
  err => console.error('Observer got an error: ' + err),
  () => console.log('Observer got a complete notification')
);
```
上面的例子，在Observable的内部，依然可以正常的调用`observer.next`,`observer.error`,`observer.complete`三个方法。
