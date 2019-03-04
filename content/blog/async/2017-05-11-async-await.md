---
title: "async & await"
author: [Sylvenas]
categories: 'Async'
img: './img/2015-05-11.jpeg'
catalogue: ['Generator','Generator之yield','generator实战']
---
关于异步的实现，上面的一节中的需求：有接口1，接口2，接口3，要求按照顺序输出接口1，接口2，接口3的返回值
如果用async函数来实现，可以这样写：
``` js
async function getData() {
  await loadData1()
  await loadData2()
  await loadData3()
}
getData()
```
`async`就像是Generator中的`*`，`await`就相当于Generator中的`yield`，同样的await只能在使用了async的函数内使用。

### Generator + Promise
看一个简单的基于Promise实现的ajax的例子：
``` js
function foo(x, y){
    return request(`http://some.url?x=${x}&y=${y}`)
}

foo(1,2)
    .then(x => console.log(x), err => console.log(err))
```
那么如果我们想用Generator包装一下这个ajax请求呢，我们可以使用yield把foo函数返回的promise返回出来，然后等待这个promise的决议，然后把决议之后的结果在通过yield的双向通道传递给Generator函数，听起来非常的绕口，我们看一下代码：
``` js
function foo(x, y){
    return request(`http://some.url?x=${x}&y=${y}`)
}

function *main(){
    try {
        var text = yield foo(1, 2);
        console.log(text);
    }catch(err){
        console.log(err);
    }
}

const it = main();
const promise = it.next().value;

promise.then(x => it.next(x), err => it.throw(err))
```
实际上这并没有那么痛苦，对吧，但是如果有一个方法能够帮助我们实现重复(即循环)的执行迭代控制，每次生成一个promise,待其决议之后再继续，那该多好啊，这是时候，async/await就会登场了

> 实际上async/await组合就是Generator + Promise的语法糖

### async函数的返回值
``` js
async function doSth() {
    const hello = 'hello';
}
console.log(doSth()); // => Promise {<resolved>:undefined}
```
async 自动把函数转换为 Promise，返回的是一个Promise对象

### async的实战
还是那个需求稍微修改一下：接口2的请求依赖接口1的返回值，接口3依赖接口2的返回值
``` js
// 一个函数p11，返回一个axios，Promise对象
function p11() {
    return axios('https://easy-mock.com/mock/5b0525349ae34e7a89352191/example/promise1')
        .then(({
        data
    }) => {
        if (data.data.name) {
            return data.data.name
        }
    })
}
// 一个函数p22，返回一个axios，Promise对象
function p22() {
  return axios('https://easy-mock.com/mock/5b0525349ae34e7a89352191/example/promise2')
    .then(({
      data
    }) => {
      if (data.data.name) {
        return data.data.name
      }
    })
}
// 一个函数p33，返回一个axios，Promise对象
function p33() {
  return axios('https://easy-mock.com/mock/5b0525349ae34e7a89352191/example/mock')
    .then(({
      data
    }) => {
      if (data.success) {
        return data.data.projects
      }
    })
}
```
#### 基于Promise的实现：
``` js
p11()
  .then(res1 => {
    console.log(res1);
    return p22()
  })
  .then(res2 => {
    console.log(res2);
    return p33()
  }).then(res3 => {
    console.log(res3);
    return res3
  })
```
#### 基于async的处理
``` js
async function asyncFun() {
  const RES1 = await p11();
  console.log(RES1);
  const RES2 = await p22();
  console.log(RES2);
  const RES3 = await p33();
  console.log(RES3);
  return RES3;
}
asyncFun()
```
await的存在 使异步变成了同步
**在处理异步的时候，await后面要根的是一个返回Promise的函数**,如果不是就需要使用Promise包装一下
就像上面的p11,p22,p33,函数都是返回一个axios（axios返回一个Promise对象)

#### async函数处理报错
看到了，async中没有`then、catch`，怎么处理报错信息呢？
天无绝人之路，使用`try catch`:
``` js
async function asyncFUn() {
  const RES1 = await p11();
  console.log(RES1);
  const RES2 = await p22();
  console.log(RES2);
  const RES3 = await p33();
  console.log(RES3);
  return RES3;
}
try {
  asyncFUn()
} catch (error) {
  console.log(error);
}
```
### 总结
我们说起异步，之前首先想到的是回调函数，但是回调函数存在各种问题   

ES6中出现了Promise，解决了回调函数问题，Promise中我们又介绍了几个常用的API
Promise.all()、Promise.race()、Promise.finally()、Promise.then()、Promise.catch()

我们后来又介绍了Generator，通过Generator引出了async await
async就是Generator的语法糖，简化了Generator的使用方法
async无法取代Promise，async的使用依赖于Promise

有人说async await是处理异步的终极方案，这个说法有些极端

处理异步的方法我们介绍很多，没有最好的，只有最合适的，会的多了，选择也就多了，代码质量自然就会高

