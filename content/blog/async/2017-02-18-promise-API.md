---
title: "Promise API"
author: [Sylvenas]
categories: 'Async'
img: './img/2015-02-18.jpeg'
catalogue: ['resolve和reject','Promise.then','Promise.catch','Promiseall','Promiserace','Promisefinally']
---

可以这么说，resolve和reject撑起了Promise的半边天，我们平时用的最多的就是这两个API

### resolve和reject
我们知道Promise是一个构造函数，用来实例化一个Promise实例，
这个Promise构造函数，用一个函数来作为参数,这个作为参数的函数又有两个参数,当然这两个参数都不是必填项:
* 第一个参数是`resolve`
* 第二个参数是`reject`

Promise有三个状态：`等待`，`成功`，`失败`
异步是一个耗时的过程，当在执行异步的时候，就是Promise的等待过程
当异步函数执行完，
如果异步执行成功，我们就调用`resolve`，将等待切换到成功

如果异步执行失败，我们就调用`reject`，将等待切换到失败

>类似于，有个判断，如果成功就执行resolve，如果失败就执行reject，需要我们手动切换

过程不可逆，失败就是失败，不会再变，反之亦然

resolve, reject是形参，不是必须命名为resolve, reject，但是为了代码的可读性，最好如此
如下写法也可以:

``` js
new Promise((aaa, bbb) => {
 if (success) {
     aaa(data)
 } else {
     bbb(data)
 }
```
### 使用场景
* 异步都可以使用Promise进行包装
* ajax请求，图片加载
* 定时器
* UI交互(点击事件等)

#### ajax请求
上面介绍了Promise的ajax请求的实现：
图片加载：
``` js
new Promise((resolve, reject) => {
    const url ='http://www.qdtalk.com/wp-content/uploads/2018/11/bryan-goff-528709-unsplash-1.jpg'
    const image = new Image();
    image.onload = () => {
        resolve(image);
    };
    image.onerror = () => {
        reject(new Error("图片加载失败"));
    };
    //对image添加一些属性
    image.src = url;
    image.alt = '这是陌上寒个人博客的banner';
}).then(res=>{
    console.log('图片加载成功，即将返回一个图片dom');
    console.log(res);//=>  <img src="http://www.qdtalk.com/wp-content/uploads/2018/11/bryan-goff-528709-unsplash-1.jpg" alt="这是陌上寒个人博客的banner">
})
```
这个栗子有点“hello world”，有以下场景可能会用到

* 当在处理图片懒加载的时候，
* 图片过大，可能加载失败
* 页面图片过多(页面就是由图片堆起来的)通过图片的加载，来实现加载的进度条。

#### 定时器
我想定时器就没有必要通过Promie包装了，因为它本身就有一个回调函数
``` js
setTimeout((a, b) => {
    console.log(a);//=>第一个参数
    console.log(b);//=>第二个参数
}, 1000, '第一个参数', '第二个参数');
```
所以说用Promise包装定时器意义不大

#### UI交互
我们举个简单的例子,弹窗提醒：
![弹窗例子]('../../images/modal.png')
当我触发某一个动作的时候，会弹出这个模态框，当你点击了确定或者取消都会进行与之相关的操作，我们在这里应用了Promise进行包装
代码如下,重点看js代码
``` js
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>promise</title>
  <link rel="stylesheet" href="https://qdtalk.com/weixin/style1229.css">
</head>

<body>
  <button id="myBtn">出现弹窗</button>

  <div class="modal-wap">
    <header>标题</header>
    <article>
      这是内容
    </article>
    <footer>
      <button id="confirm">确定</button>
      <button id="cancel">取消</button>
    </footer>
  </div>
  <script>
    function dom$(id) {
      return document.getElementById(id);
    }

    function modelFun() {
      return new Promise((resolve, reject) => {
        dom$('confirm').onclick = () => {
          resolve()
        }
        dom$('cancel').onclick = () => {
          reject()
        }
      })
    }
    dom$('myBtn').onclick = () => {
      document.querySelector('.modal-wap').style.display = 'block'
      modelFun().then(() => {
          console.log('你点击了确定');
        }, () => {
          console.log('你点击了取消');
        })
        .finally(() => {
          document.querySelector('.modal-wap').style.display = 'none'
        })
    }
  </script>
</body>

</html>
```
点击“出现弹窗”按钮，出现模态框，模态框有两个按钮，取消和确定   

我们对这个模态框进行了包装，如果点击了确定就执行resolve，如果点击了取消就执行reject,然后就会执行then方法
then方法，不是我们今天要介绍的内容，简单说：它也有两个参数，一个是resolve，另一个是reject
点了不同的按钮，执行了不同的事件

最后执行finally，不管是点击了取消还是确定，只要状态切换，都会关闭模态框

### Promise.then
我们展开promise的原型链，看看有哪些实例方法:
![弹窗例子]('../../images/promise-prototype.png')

promise是Promise的一个实例，我们展开promise的原型链，可以看到

promise具有then方法，catch方法，还有finally方法

也就是说，这些方法是定义在原型对象Promise.prototype上的。

then方法的作用是为`Promise`实例添加状态改变时的回调函数。then方法可以有两个参数(第二个可选)，

* 第一个是resolve状态的回调函数
* 第二个是reject状态的回调函数(可选)

then方法返回的是一个新的Promise实例(不是原来那个Promise实例)我们前面说过Promise接收一个函数作为参数，这个函数有两个参数，第二个参数可选，分别是resolve和reject，这两个参数分别和then方法的两个参数对应。
then方法其实并不简单，我们看几个栗子
观察如下代码，想一想最后输出什么？

``` js
Promise.reject('出错啦')
  .then(res => console.log(`res1:${res}`), err => console.log(`err1:${err}`))
  .then(res => console.log(`res2:${res}`), err => console.log(`err2:${err}`));
```
下面直接告诉你答案：
``` js
// =>err1:出错啦
// =>res2:undefined
```
可能和你想的不一样，或者看着输出反推，也没找出个所以然，
我们一起分析一下原因
`Promise.reject()`方法也会返回一个新的`Promise`实例，该实例的状态为`rejected`。
以下两种写法等价:
``` js
const p1 = Promise.reject('出错啦')
//和下面的方法等效
const p2 = new Promise((resolve, reject) => {
    reject('出错啦')
})
```
`resolve`和`reject`当传入一个字符串作为参数时，则会返回一个新的Promise实例
如果是`resolve`，新的Promise对象的状态为`resolve`
如果是`reject`，新的Promise对象的状态为`reject`
上面的`p1`和`p2`都会返回一个新的Promise实例，并且状态为`reject`

``` js
const p1 = Promise.reject('出错啦')
p1.then(res => {
    console.log(`res1:${res}`)//“这里不执行”
}, err => {
    console.log(`err1:${err}`)//=>err1:出错啦
})
//最后输出err1:出错啦
```
因为p1返回的Promise实例状态为reject，所以执行了then下面第二个参数的方法
到这里可能会有一个疑问，then方法的第二个参数可选，在这里如果不用第二个参数会怎么样呢？
``` js
const p1 = Promise.reject('出错啦')
p1.then(res => {
    console.log(`res1:${res}`)
})
// .catch(err=>{
//   console.log(`err:${err}`)
// })
//=>Uncaught (in promise) 出错啦
```
**会报一个未捕获的错，当省略第二个参数时，catch的存在就很有意义** ，关于catch我们稍后讨论
上面对第一个then的输出做了讨论，我们继续看第二then
在解释第二个then之前，我们先看另一个例子：
#### 关于返回值
``` js
const p3 = new Promise((resolve, reject) => {
          reject('出错啦');
      })
  //第一个then
  .then(res => {
      console.log(`resolve-then1：${res}`);//“不执行这里”
      return 1;
  }, err => {
      console.log(`reject-then1：${err}`);//=>reject-then1：出错啦
      return 1
  })
  //第二个then
  .then(res => {
      console.log(`resolve-then2：${res}`);//=>resolve-then2：1
      throw new Error('抛出一个错')
  }, err => {
      console.log(`reject-then2：${err}`);//“不执行这里”
      throw new Error('抛出一个错')
  })
  //第三个then
  .then(res => {
      console.log(`resolve-then3：${res}`);//“不执行这里”
  }, err => {
      console.log(`reject-then3：${err}`);//=>reject-then3：Error: 抛出一个错
  })
  //第四个then
  .then(res => {
      console.log(`resolve-then4：${res}`);//=>resolve-then4：undefined
  }, err => {
      console.log(`reject-then4：${err}`);//“不执行这里”
  })
  //第五个then
  .then(res => {
      console.log(`resolve-then5：${res}`);//=>resolve-then5：undefined
  }, err => {
      console.log(`reject-then5：${err}`);//“不执行这里”
  })
```
输出,具体位置，参见上面的代码
``` js
//=>reject-then1：出错啦
//=>resolve-then2：1
//=>reject-then3：Error: 抛出一个错
//=>resolve-then4：undefined
//=>resolve-then5：undefined
```
then方法返回一个Promise，而它的行为与then中的回调函数的返回值有关：
* 如果then中的回调函数返回一个值，那么then返回的Promise将会成为接受状态，并且将返回的值作为接受状态的回调函数的参数值。
* 如果then中的回调函数抛出一个错误，那么then返回的Promise将会成为拒绝状态，并且将抛出的错误作为拒绝状态的回调函数的参数值。
* 如果then中的回调函数返回一个已经是接受状态的Promise，那么then返回的Promise也会成为接受状态，并且将那个Promise的接受状态的回调函数的参数值作为该被返回的Promise的接受状态回调函数的参数值。
* 如果then中的回调函数返回一个已经是拒绝状态的Promise，那么then返回的Promise也会成为拒绝状态，并且将那个Promise的拒绝状态的回调函数的参数值作为该被返回的Promise的拒绝状态回调函数的参数值。
* 如果then中的回调函数返回一个未定状态(pending)的Promise，那么then返回Promise的状态也是未定的，并且它的终态与那个Promise的终态相同；同时，它变为终态时调用的回调函数参数与那个Promise变为终态时的回调函数的参数是相同的。

我们分析一下p3:  
p3直接执行的reject(‘出错啦’)，返回的是一个promise对象，状态为reject    
所以第一个then执行的第二个参数方法,输出`reject-then1`：出错啦，然后return 1    
我们看第二个then的输出，可以发现，第一个then的return值会作为下第二个then的回调函数的参数值，第二个then又执行了`throw Error`  
第二个then的`throw Error`，使得第三个then下的Promise对象状态为reject，所以第三个then输出`reject-then3：Error`: 抛出一个错  
第三个then没有返回值，也没有执行`throw Error`，结果导致第四个then输出`resolve-then4：undefined`   
第四个then和第三个then一样，没有返回值，所以第五个then输出的结果和第四个一样`resolve-then5：undefined`  

我们做一下总结:
* 如果前一个Promise对象是resolve状态，则后一个Promise对象执行第一个参数方法(resolve)
* 如果前一个Promise对象是reject状态，则后一个Promise对象执行第二个参数方法(reject)
* 如果前一个Promise对象抛出异常(throw error)，则后一个Promise对象执行第二个参数方法(reject)
* 如果前一个Promise对象返回具体的值，则此数值将作为后一个Promise对象的输入，执行第一个参数方法(resolve)
* 如果前一个Promise对象没有返回状态(resolve或者reject)，也没有抛错(throw error)，也没有返回具体数值，我们则认为它返回 了一个undefined，则undefined将作为后一个Promise对象的输入，执行第一个参数方法(resolve)

回头看一下前面的例子：
``` js
Promise.reject('出错啦')
  .then(res => console.log(`res1:${res}`), err => console.log(`err1:${err}`))
  .then(res => console.log(`res2:${res}`), err => console.log(`err2:${err}`));
```
现在看来似乎简单了
因为前面是reject状态，所以第一个then执行第二个参数方法`err => console.log(err1:${err})`
因为第一个then方法，没有返回状态，没有抛错，没有返会具体值，所以返回的是undefined，第二个then执行
`res => console.log(res2:${res}`

### Promise.catch
花了大量篇幅介绍then方法，其实then方法懂了，catch自然也就明白了，因为，catch就是then方法的语法糖
catch方法是.then(null, rejection)或.then(undefined, rejection)的别名
也就是说，catch也是then，它用于捕获错误，它的参数也就是then的第二个参数。
我们将上面的例子做一下改动:
``` js
const p4 = new Promise((resolve, reject) => {
    reject('出错啦');
})
.catch(err => {
    console.log(`catch1：${err}`);//=>catch1：出错啦
    return 1;
})
.then(res => {
    console.log(`then1：${res}`);//=>then1：1
    throw new Error('抛出一个错')
})
.catch(err => {
    console.log(`catch2：${err}`);//=>catch2：Error: 抛出一个错
})
.then(res => {
    console.log(`then2：${res}`);//=>then2：undefined
})
```
如果上面的关于then的介绍看懂了，catch自然是小菜一碟
### Promise.all
Promise.all就是用于将多个Promise实例包装成一个新的Promise实例，Promise.all接收一个数组作为参数，数组的每一项都返回Promise的实例：
``` js
const p = Promise.all([p3, p1, p2])
  .then(arr => {
    console.log(arr);
    console.log('Promise.all成功啦');   
  })
  .catch(err=>{
    console.log(err,'Promise.all错啦');
  })
```
p1,p2,p3都是返回promise实例，Promise.all不关心他们的执行顺序,**如果他们都返回成功的状态，Promise.all则返回成功的状态**，输出一个数组，是这三个p1,p2,p3的返回值，**数组的顺序和他们的执行顺序无关，和他们作为参数排列的顺序有关**

**如果有一个返回失败(reject)，Promise.all则返回失败(reject)的状态**，此时第一个被reject的实例的返回值，会传递给P的回调函数。
三个promise实例参数之间是"并"的关系，全部成功，Promise.all就返回成功，有一个失败，Promise.all就返回失败
换个角度说，一个promise的执行结果依赖于另外几个promise的执行结果，

* 几个ajax全部执行完了，才能渲染页面，
* 几个ajax全部执行完了，才能做一些数据的计算操作，
* 不关心执行顺序，只关心集体的执行结果

### Promise.race
Promise中的竞态，用法和Promise.all类似，对应参数的要求和Promise.all相同，传入一个数组作为参数，参数要返回一个Promise实例
race就是竞争的意思，数组内的Promise实例，谁执行的快，就返回谁的执行结果，不管是成功还是失败

``` js
const p = Promise.race([p3, p1, p2])
  .then(res => {
    console.log(res);
    console.log('Promise.all成功啦');   
  })
  .catch(err=>{
    console.log(err,'Promise.all错啦');
  })
```
通过输出我们发现
p1是第一个完成的，所以p的返回结果就是p1的执行结果
而且就算完成，但是 进程不会立即停止，还会继续执行下去。

race的使用场景：
搜了一下，很多文章都说是用来解决网络超时的提示，类似于下面这样：
``` js
const p3 = axios.get('https://easy-mock.com/mock/5b0525349ae34e7a89352191/example/mock')
  .then(({
    data
  }) => {
    console.log('p3成功啦');
    return data.data
  })
const p4 = new Promise(function (resolve, reject) {
  setTimeout(() => reject(new Error('网络连接超时')), 50)
})
const p = Promise.race([p3, p4])
  .then(res => console.log(res))
  .catch(err => console.log(err));
```
p3的ajax和50ms的定时器比较，看谁执行的快，如果超过了50ms，p3的ajax还没返回，就告知用户网络连接超时

这里有个问题，就算提示超时了，p3还在继续执行，它并没有停下来，直到有状态返回

个人观点：race可以用来为ajax请求的时长划定范围，如果ajax请求时长超过xxxms会执行某个方法，或者ajax请求时长不超过xxms会执行某个方法，总之，race的应用空间不是很大

### Promise.finally
`finally`方法用于指定不管`Promise`对象最后状态如何，都会执行的操作。该方法是ES2018引入标准的。
``` js
const p = Promise.race([p3, p4])
    .then(res => console.log(res))
    .catch(err => console.log(err))
    .finally(() => {
      console.log("finally的执行与状态无关")
    });
```
当`promise`得到状态(不论成功或失败)后就会执行`finally`函数
