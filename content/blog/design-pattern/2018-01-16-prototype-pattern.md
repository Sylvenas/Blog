---
title: "原型模式"
author: [Sylvenas]
categories: "design pattern"
img: './img/2018-01-16.jpeg'
---
### 什么是原型链
发现很多文章都是先讲`prototype`,这里我们换个思路来介绍，我们先讲`__proto__`。JS中每个对象(除了null和undefined)都有一个私有的只读属性`__proto__`。

当我们调用一个对象(obj)的某个方法或者属性(fn)的时候，首先会在该对象本身去查找是否具有这个属性(`obj.fn`)，如果找到，则直接返回；

如果没有找到则去查找`obj.__proto__`属性上有没有该属性(`obj.__proto__.fn`)，`__proto__`属性就是指向该对象的构造函数的原型，如果该对象的构造函数上找到了该属性，则返回该属性；

如果没有，那么继续查找该对象的构造函数的构造函数的原型上是否有`fn`属性，也就是查找`obj.__proto__.__proto__.fn`上是否存在;

这个过程就叫做遍历原型链，直到原型链的顶端，也就是`Object.prototype`,而`Object`对象的原型指向为`null`，(`Object.getPrototypeOf(Object.prototype) === null`),根据定义，null没有原型,作为原型链的最后一个环节，如果整个原型链上都找不到，那么返回'undefined'。

上面描述的整个链状向上遍历的关系，就叫做原型链，JavaScript正是基于这个特性实现的`“继承”`(我认为在JavaScript中叫`组合`更为合理)。

#### 举例说明
当我们有一个构造函数`Animal`,它的原型属性`Animal.prototype`上存在一个方法`move`
``` js
function Animal(type) {
	this.type = type;
}

Animal.prototype.move = function () {
	console.log('I am moving');
}

var animal = new Animal('dog')

console.log(animal.__proto__ === Animal.prototype);    // true
console.log(animal.type);                              // dog
console.log(animal.move())							   // 'I am moving'

console.log(Animal.prototype.constructor === Animal)   // true

console.log(Animal.__proto__ === Function.prototype)  // true

console.log(Animal.prototype.__proto__ === Object.prototype)  // true
```
* 构造函数`Animal`的原型属性`Animal.prototype`里有共有的方法，所有构造函数声明的实例(animal)都可以共享这个方法。

* 原型对象`Animal.prototype`保存着实例共享的方法，有一个指针`constructor`指回该构造函数(`Animal.prototype.constructor === Animal`)。

* `animal`是构造函数`Animal`的实例，`animal`对象也有属性`__proto__`,指向`Animal`的原型对象(`Animal.prototype`)--(`animal.__proto__ === Animal.prototype`)。

* 构造函数`Animal`除了是方法，它也是个对象啊，它也有`__proto__`属性，指向`Animal`的构造函数`Function`的原型对象`Function.prototype`。(`Animal.__proto__ === Function.prototype`)。

* 构造函数`Animal`的原型属性`Animal.prototype`也是对象，那么`Animal.prototype.__proto__`又指向哪里呢，很明显指向`Animal.prototype`的构造函数的原型对象`Object.prototype`。(`Animal.prototype.__proto__ === Object.prototype`)。

总结：
* 对象有属性`__proto__`,指向该对象的构造函数的原型对象。
* 方法除了有`__proto__`还有属性`prototype`,`prototype`指向该方法的原型对象。

原型链也会有终点，终点就在`Object.prototype.__proto__ === null`，那么既然`Object.prototype`也是一个对象，那么`Object.prototype.__proto__`就应该指向`Object.prototype`,不过很遗憾，尽管`Object.prototype`也是一个对象，但是这个对象却不是由`Object`构造函数所创建的，而是有JS引擎(eg:V8)按照ECMAScript规范创建的。

原型链有一个例外就是，`Function`的原型指向`Function`的原型对象，也就是`Function.__proto__ === Function.prototype`。这是一个[鸡生蛋，蛋生鸡](http://www.ecma-international.org/ecma-262/5.1/#sec-15%EF%BC%8C_%E9%B8%A1%E5%92%8C%E8%9B%8B_%E7%9A%84%E9%97%AE%E9%A2%98%E5%B0%B1%E6%98%AF%E8%BF%99%E4%B9%88%E5%87%BA%E7%8E%B0%E5%92%8C%E8%AE%BE%E8%AE%A1%E7%9A%84%EF%BC%9A**%60Function%60%E7%BB%A7%E6%89%BF%60Function%60%E6%9C%AC%E8%BA%AB%EF%BC%8C%60Function.prototype%60%E7%BB%A7%E6%89%BF%60Object.prototype%60%E3%80%82)的过程,说不清楚，还是看看规范吧。

#### 实现继承
现在我们有一个子构造函数`Dog`,它啥都没有，需要让它的实例继承`Animal`的所有属性和方法
``` js
Dog.prototype = new Animal();
Dog.prototype.constructor = Dog;
```
因为`new Animal()`的`__proto__`指向`Animal.prototype`这样的效果相当于：
``` js
Dog.prototype.__proto__ === Animal.prototype   //true
```
当我们`new Dog()`的时候，那么就是
``` js
new Dog().__proto__ === Dog.prototype   //true
```
根据向上遍历原型链的规则,`var dog = new Dog()`，当访问`dog`的`move`方法时，会依次查询`dog本身`，`Dog.prototype`,`Animal.prototype`,最终找到`move`方法。

但是有一点需要注意的是，整个原型链是动态的，也就是无论`Dog`生成了多少个实例，一旦更新了原型链上的属性、方法，则所有实例上的属性和方法，将跟随着改变，因为他们指向同一个引用。

我们还可以使用ES5的`Object.create`方法串起原型链,`const newObj = Object.create({ a: 1 }, { b: { value: 1, writable: false, configurable: true } })`方法的作用为，新创建的`newObj`对象的`__proto__`指向`{a:1}`,而第二个参数为属性描述符，会被添加到`newObj`对象的本身属性上，而不是原型属性上。
``` js
const newObj = Object.create({ a: 1 }, { b: { value: 1, writable: false, configurable: true } })
console.log(newObj);             // {b:1}
console.log(newObj.__proto__);   // {a:1}
```
用在上面的例子中则是：
``` js
function Animal(type) {
	this.type = type;
}

Animal.prototype.move = function () {
	console.log('I am moving');
}

function Dog() { }

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const dog = new Dog('金毛');
console.log(dog.type);       // undefined
console.log(dog.move());     // 'I am moving'
```
这样做很明显`dog`无法继承`Animal`构造函数中定义的属性和方法,例如`dog.type`,因为我们仅仅将`Animal`的原型对象添加到了`Dog`的原型上，那么我们可以这样解决：
``` js
function Dog() {
	Animal.call(this);
}
```
扩展一下，这个思路为我们提供了多父类继承的方法：
``` js
function MyClass() {
	SuperClass.call(this);
	OtherSuperClass.call(this);
}

// inherit one class
MyClass.prototype = Object.create(SuperClass.prototype);
// mixin another
Object.assign(MyClass.prototype, OtherSuperClass.prototype);
// re-assign constructor
MyClass.prototype.constructor = MyClass;

MyClass.prototype.myMethod = function () {
	// do a thing
};
```

### 原型模式
原型模式是指用原型实例指向创建对象的种类，并且通过拷贝这些原型创建新的对象，原型模式在JavaScript里的使用简直是无处不在，其它很多模式有很多也是基于`prototype`的,上面的讲解中，我们多次提到了`类`的概念，但是JavaScript本质上避免了`class`的概念，ES6中的`class`只是个语法糖，本质上还是使用原型，关于这一点我们从JavaScript的作者Brendan Eich后来的访谈中也能看出些许：
>"我并非骄傲，只不过是很高兴我选择 Scheme 式的一等函数以及 Self 式（尽管很怪异）的原型作为主要因素。至于 Java 的影响，主要是把数据分成基本类型和对象类型两种（比如字符串和 String 对象），以及引入了Y2K 日期问题，这真是不幸。我把最终进入 JavaScript 中的一些"不幸"类似 Java 的特性加入到如下列表中":

* 构造器函数和`new`关键字
* `class`关键字加上单一祖先的`extend`作为主要继承机制
* 用户的偏好是把`class`当作一个`静态`类型(实际上完全不是)。

JavaScript只是简单的从现有对象进行拷贝来创建新的对象，我们应该尽量使用[对象组合](https://lit-forest.github.io/blog/2017/12/10/composing-software-intro.html)的方式去构建对象，在JavaScript中应该尽量避免使用`继承`的思路。

使用`继承`脑袋去思考`原型`只会把简单的问题弄得越来越复杂。
