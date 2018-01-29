---
title: "构造函数模式"
author: [Sylvenas]
categories: "design pattern"
img: './img/2018-01-12.jpeg'
---
### 构造函数
在JavaScript中，构造函数通常是用开创建实例的，JavaScript中没有类的概念，但是有特殊的构造函数，可以通过`new`关键字来调用构造函数，约定成俗的构造函数的首字母大写。

### example
``` js 
function Dog(name, type) {
	this.name = name;
	this.type = type;
	this.sound = function (val) {
		console.log(val)
	}
}

var xiaobu = new Dog('小布', '拉布拉多');
var erhuo = new Dog('傻子', '哈士奇');

xiaobu instanceof Dog;   // true

xiaobu.sound === erhuo.sound;  // false
```
从上面的代码，我们能看到构造函数模式有一个严重的缺点，就是每次创建一个新的对象的时候，都要创建一个新的`sound`方法，这个却是非常没有必要的，因为一般来说，两个实例对象只是属性不一样，而方法是一样的，因此有些人表示这个问题好解决,我们可以把方法放到外面去：
``` js
function Dog(name, type) {
	this.name = name;
	this.type = type;
	this.sound = sound;
}

function sound(val) {
	console.log(val);
}
```
但是这样一改，却产生了一个仅仅供`Dog`使用的全部函数，这和构造函数模式本身的封装特性相悖，具体怎么做更好呢，请看下一篇的[原型模式]()。

### 不用new来创建对象
#### 用call,改变上下文
``` js
var xiaobu = new Object;
Dog.call(xiaobu, 'xiaobu', '拉布拉多');

xiaobu instanceof Dog   // false
```
用这种方法创建的`xiaobu`不是`Dog`的实例。

#### 作为函数调用
``` js
var xiaobu=Dog('xiaobu', '拉布拉多');
console.log(typeof xiaobu)  //undefined
console.log(window.sound('wang wang ...'));   // 'wang wang ...'
```
因为不是通过`new`关键字，而是直接调用`Dog`构造函数，此时`Dog`函数内的`this`指向`window`对象。