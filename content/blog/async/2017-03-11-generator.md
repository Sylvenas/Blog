---
title: "Generator"
author: [Sylvenas]
categories: 'Async'
img: './img/2015-03-11.jpeg'
catalogue: ['Generator','Generator之yield','generator实战']
---
说起javascript异步，我想你一定会想起ES7的`async`，甚至要排在Promise之前，从今天起我们来聊一聊async    
要说async，就不得不提Generator生成器（好多知识都是一环扣一环，很是无奈），async就是Generator的语法糖

### Generator
Generator写法很像一个函数，但是区别于普通函数，一个例子：
``` js
function doSth1() {
  return '这是普通函数'
}
const it1 = doSth1()
console.log(it1); //=>这是普通函数


//一个生成器doSth
function* doSth() {
  yield '郭靖抓鸡';
  yield '郭靖杀鸡';
  yield '黄蓉拔毛';
  yield '黄蓉炖鸡';
  yield '洪七公吃鸡';
  return "洪七公说：这只鸡真好吃"
}
// 通过一个遍历器控制这个生成器的执行
const it = doSth()
console.log(it); 
```
it是一个迭代器，我们没有像打印普通函数那样打印出我们想要的结果   
普通的函数一旦执行，就不会停下来，直到执行完毕（不考虑debugger，alert，throw err，死循环等情况）   

Generator生成器，可以做到，它可以让一个函数的执行暂停    
Generator生成器不会自行启动，需要使用遍历器的`next()`,来控制`Generator`生成器的执行:
``` js
console.log(it.next()); // => {value: "郭靖抓鸡", done: false}
console.log(it.next()); // => {value: "郭靖杀鸡", done: false}
console.log(it.next()); // => {value: "黄蓉拔毛", done: false}
console.log(it.next()); // => {value: "黄蓉炖鸡", done: false}
console.log(it.next()); // => {value: "洪七公吃鸡", done: false}
console.log(it.next()); // => {value: "洪七公说：这只鸡真好吃", done: true}
```

>我们打断一下，先声明一个知识点，在函数中，return不是必须存在的，但是如果我们没有为函数执行return，函数会隐式存在一个return undefined，Genterator函数也是如此

### Generator之yield
第一次调用next,是对Generator生成器进行启动操作，Generator生成器启动，执行，当遇到内部的yield时就会暂停

生成器中的yield有点像普通函数中的return,但是普通函数中当遇到return,就意味着函数执行完毕，以此作为输出

而yield不会完全停止函数的执行

> 可以这么理解，Generator从一开始就是暂停的，通过第一次调用next方法打破其暂停状态，当遇到yield时，会执行yeild后面的表达式，并返回执行之后的值，然后再次进入暂停状态

调用第一个`it.next()`，向Generator提出申请，我要的下一个值是什么？第一个`yield`，对其进行回复，就是`yield` ‘郭靖抓鸡’;然后Generato暂停了，等待下一次询问
然后调用第二个`it.next()`，向Generator提出申请，我要的下一个值是什么？第二个`yield`，对其进行回复，就是`yield` ‘郭靖杀鸡’;然后又停了
…
当调用第六个`it.next()`时，Generator已经没有`yield`了，怎么回答呢？它用return进行回答，终极回答
如果没有return呢，这就是我们前面说的隐式的return undefined
仔细看代码，你会发现，next和`yield`有一个对应关系，如果要使Generator执行完毕（done：true），next的数量要比`yield`的数量多一个
为什么会存在这种情况呢？
因为第一个`it.next()`是用来启动Generator生成器，启动后，遇到了第一个`yield`，停下来了，
第二个`it.next()`是用来启动第一个`yield`，以此类推，这样就导致他们“错位”了
直到Generator的return（显式或隐式）最后执行完毕

再看一个例子：
``` js
function* doSth(params) {
  return params +(yield "黄蓉")
}
const it = doSth('郭靖')
console.log(it.next())//=>{value: "黄蓉", done: false}
console.log(it.next('吃饭'))//=>{value: "郭靖吃饭", done: true}
```
`next()`支持传递参数，但是不会在第一个`next()`中传递参数，因为第一个`next()`是用来启动Generator的

> 规范和浏览器都会默默的丢弃传递给第一个next的任何东西，因此启动生成器的第一个next一定不要传递任何参数

第一个`next()`执行，启动了 doSth(),遇到第一个yield停下来，yield把“黄蓉”返给第一个`next()`
第二个`next()`执行，启动了第一个yield，并把"吃饭"传递给正在等待的yield，然后继续执行，遇到了return，执行完毕

**我们可以看到Generator实际上一个消息双向传递的机制，`yield someData`作为一个表达式可以发出消息响应`next(..)`调用，`next(..)`也可以向暂停的yield表达式发送值。**

### generator实战
需求如下：现在有接口1，接口2，接口3，要求按照顺序输出接口1，接口2，接口3的返回值
现在简单模拟一下数据请求：
``` js
function loadData1() {
  $.ajax({
    url: "url1",
    success: ({
      data,
      success
    }) => {
      if (success) {
        console.log(data);
      }
    }
  });
}

function loadData2() {
  $.ajax({
    url: "url2",
    success: ({
      data
    }) => {
      console.log(data);
    }
  });
}

function loadData3() {
  $.ajax({
    url: "url3",
    success: ({
      data,
      success
    }) => {
      if (success) {
        console.log(data);
      }
    }
  });
}
```
#### 回调函数
常规做法，即loadData1执行成功后，执行loadData2，loadData2执行成功后执行loadData3
``` js
function getData() {
  $.ajax({
    url: "https://easy-mock.com/mock/5b0525349ae34e7a89352191/example/promise1",
    success: ({
      data,
      success
    }) => {
      if (success) {
        console.log(data);
        $.ajax({
          url: "https://easy-mock.com/mock/5b0525349ae34e7a89352191/example/promise2",
          success: ({
            data
          }) => {
            console.log(data);
            if (data.name) {
              $.ajax({
                url: "https://easy-mock.com/mock/5b0525349ae34e7a89352191/example/mock",
                success: ({
                  data,
                  success
                }) => {
                  if (success) {
                    console.log(data);
                  }
                }
              });
            }
          }
        });
      }
    }
  });
}
getData()
```
这就是典型的**回调地狱**

#### Promise
来一个Promise实现的，顺便对前面的Promise进行复习
``` js
/*
*对ajax的请求做了一个简单的封装
*@ajaxUrl,接口地址，公共部分已经抽取
*@successCb，ajax请求成功后的回调函数
*/
function ajaxFun(ajaxUrl, successCb) {
  $.ajax({
    url: ajaxUrl,
    success: res => successCb(res)
  });
}
//promise
new Promise((resolve, reject) => {
    ajaxFun("promise1", ({
      data,
      success
    }) => {
      if (success) {
        console.log('接口一', data);
        resolve(data)
      }
    })
  })
  .then(() => {
    ajaxFun("promise2", ({
      data
    }) => {
      if (data.name) {
        console.log('接口二', data);
      }
    })
  })
  .then(() => {
    ajaxFun("mock", ({
      data,
      success
    }) => {
      if (success) {
        console.log('接口三', data);
      }
    })
  })
```

#### Generator的实现
``` js
function loadData1() {
  ajaxFun("promise1", ({
    data,
    success
  }) => {
    if (success) {
      console.log('接口一', data);
      it.next()//“接口一成功返回后，执行下一步”
    }
  })
}

function loadData2() {
  ajaxFun("promise2", ({
    data
  }) => {
    if (data.name) {
      console.log('接口二', data);
      it.next()//“接口二成功返回后，执行下一步”
    }
  })
}

function loadData3() {
  ajaxFun("mock", ({
    data,
    success
  }) => {
    if (success) {
      console.log('接口三', data);
    }
  })
}
function* getData() {
  yield loadData1()
  yield loadData2()
  yield loadData3()
}
const it = getData()
it.next()//“启动生成器”
``` 
先弄一个遍历器出来，然后通过`it.next()`,启动遍历器    
执行第一个接口请求，当第一个接口请求成功了，继续`next()`,以此类推    
我想很少有人会通过Generator实现多个异步同步执行，但是`async`可以，后面会介绍`async`函数的用法   


