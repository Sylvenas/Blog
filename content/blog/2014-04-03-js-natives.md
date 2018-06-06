---
title:  "JS内置对象理解"
author: [sylvenas]
categories: 'JavaScript'
img: './img/2014-04-03.jpg'
---
JavaScript有很多个内置对象，像是String,Number这类，我们深入了解一下内置对象，下面列出JS中常见的内置对象。
* String
* Boolean
* Number
* Object
* Function
* Array
* Date
* Error
* RegExp
* Symbol   // ES6
如果在浏览器中,还有各类的HTMLDomElement,ES6中也有许多新的内置对象。

这些内置对象怎么这么像函数呢？其实你可以把他们理解为构造函数。
``` js
var s = new String('I am a String');
typeof s;              //=> 'object'
s instanceof Object;   //=> true
```
我们使用之前用过`typeof`检查一下，发现`s`是一个`object`,可以认为内置对象也是`Object`的子类型，`typeof`只能显示值的类型，因此只能显示`object`,`function`,`symbol`等。

### [[Class]]属性
既然`typeof`无能为力，那如何确定其他内置对象的类型呢。这些内置对象都有一个内置的隐藏属性`[[Class]]`,需要用`Object.prototype.toString()`方法来判断。

``` js
Object.prototype.toString.call([]);  // "[object Array]"
```
返回值中的'Array'就是`[[Class]]`的属性了，但是这个方法一样有些奇怪的地方。
``` js
Object.prototype.toString.call(undefined);         //=> "[object Undefined]"
Object.prototype.toString.call(null);              //=> "[object Null ]"
Object.prototype.toString.call(1);                 //=> "[object Number]"
Object.prototype.toString.call('build-in type');   //=> "[object String]"
```
`WTF`...JavaScript这个语言中检测方法怎么都不按照基本法则啊！`1`和`'build-in type'`明明是内置类型，怎么也成`object`了？？那是因为内置类型会被装箱(Boxing Wrappers),那么什么是装箱呢？

### Boxing Wrappers
前面我们看到在检查内置类型的时候，它们变成了对象，这种行为就叫装箱。那装箱有什么用呢？我猜你可能使用过这个功能但全然没注意过这个问题。
``` js
'abc'.length;          // 3
'lower'.toUpperCase(); // 'LOWER'
```
我们要知道JS中的所有内置方法都保存在某个`构造函数的prototype对象`中，但是像 `'abc'`,`1` 这种内置类型并不是对象，没有属性也没有方法，自然也没有`[[proto]](__proto__)`，不能依靠原型链向上调用方法，因此在执行某些方法时，JS会把内置类型装箱成对象，让其获取调用原型链上的方法的能力。

看到这里你一定想到了一个好主意，就是如果你须要在一个`for`循环中 使用`'abc'.length`，那JS不是每次都要进行装箱，你可以预先构造一个`new String('abc')` 对象，这样是不是可以加速运行代码了？有趣的问题，你可千万不要这么做，因为这个问题早期的开发者早就想到了，因此他们已经做了优化，而如果你想来个预优化处理很可能适得其反。所以建议你不要使用构造函数创建一个内置类型对应的内置对象，而是让JS自己去装箱。

### Unboxing
既然能装箱，必然也有拆箱的方法，那就是调用`valueOf()`这个函数，可以将一个内置对象的primitive值取出。
``` js
valueOf(new String('abc')); // 'abc'
```
这是一种显式的拆箱方法。