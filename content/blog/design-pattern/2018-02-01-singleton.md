---
title:  "单例模式"
author: [sylvenas]
categories: 'design pattern'
img: './img/2018-02-01.jpeg'
excerpt: '单例模式又被称为单体模式，在面向对象思想中，单例就是保证一个类只有一个实例，实现的方法一般是在类的内部提供一个`getInstance`方法用来创建实例...'
---
### 单例模式
单例模式又被称为单体模式，在面向对象思想中，单例就是保证一个类只有一个实例，实现的方法一般是在类的内部提供一个`getInstance`方法用来创建实例(在类的外部不允许使用`new`关键字创建实例)，先判断类的实例是否存在，如果存在直接返回，如果不存在就创建了再返回，这样就可以确保一个类只有一个实例对象；

从上面的描述，我们可以看出单例模式的核心在于系统中某些变量有且只有一个，暴露出来供外部使用。

>由于在js中创建对象实例的方法有很多不一定非要通过`class`、`new`等概念。

### 对象字面量模式
对象字面量模式是项目开发中使用频率非常高的模式，例如：我们在一个多人项目开发中，通常会抽象出很多公用的模块和方法等，那么最常见的一个工具类，一般定义为：
``` js
var utils = {
	formatDate: function () { },
	ajax: function () { },
	curry: function (fn) { },
	// ....
}
```
那么我们在其他地方要使用某个方法的时候直接`utils.curry(..)`即可，但是有一点我们必须明确下来，就是整个项目中`utils`对象有且只能有一个，如果有两个开发同学，分别写了一个`utils`，那我们其他的人就会迷惑，甚至用错。

### JS面向对象单例模式
#### 饿汉模式
上面的代码我们是直接创建了一个对象字面量来确保只有一个`utils`的实例，那么如何实现面向对象式的单例模式呢，例如我们每个公司只能有一个CEO,那么这段代码可以这样写：
``` js{10,13}
var getCEO = (function () {
	var instance;
	var createCEO = function () {
		return instance = {
			name: '霸道总裁',
			age: '35',
			sex: 'male'
		}
	}
	instance = createCEO();
	return {
		getInstance: function () {
			return instance;
		}
	}
}())
```
上面的方法我们通过方法自执行，直接创建好了一个`instance`,然后外面如果要用的情况下则直接把这个已经创建好的`CEO`的实例`return`出去就可以了。

但是这个思路有个缺点就是不管我们会不会用到这个`instance`,都会事先创建`instance`对象，消耗一定的内存，那么可不可以在当我们需要的时候在创建这个`instance`呢
#### 懒汉模式
``` js{12}
var getCEO = (function () {
	var instance;
	var createCEO = function () {
		return instance = {
			name: '霸道总裁',
			age: '35',
			sex: 'male'
		}
	}
	return {
		getInstance: function () {
			return instance || (instance = createCEO())
		}
	}
}())

var ceo1 = getCEO.getInstance();
var ceo2 = getCEO.getInstance();

console.log(ceo1, ceo2, ceo1 === ceo2);  // true
```
懒汉模式的优点在于只有使用时次啊会将类实例化，这在一定程度上节约了资源。
缺点在于第一次需要`instance`的时候，会速度稍慢。

### 单例模式的优点
* 利用对象字面量可以声明一个命名空间，例如：`utils`中包含了很多常用的方法，但是我们之暴露出去一个全局的`utils`对象，来替代暴露出去`formatDate`,`ajax`等等一众的方法，这样可以方便我们很好的解决命名冲突的问题，一级更好的维护代码，更好的控制代码。
* 在需要同一个对象的时候，我们通过`懒汉模式`和`饿汉模式`来仅仅创建一个实例，比每次都重新`new`一个新的减少了大量的创建过程和内存消耗，有利于提升性能。

### 单例模式的缺点
* 扩展性不好，对一个单例对象里的某个变量或者方法进行重写，会全部影响其他的正在使用该方法的代码，例如：我们`utils.formatDate = otherFunction`,那么这个时候可能整个系统其他的地方会出现很多错误。
* 灵活性不足，当我们需要扩展`utils.formatDate`的时候，但是其他地方却不想变动，这个时候单例模式就不好处理了。

