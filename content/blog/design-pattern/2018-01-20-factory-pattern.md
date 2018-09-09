---
title: "工厂模式"
author: [Sylvenas]
categories: "design pattern"
img: './img/2018-01-20.jpeg'
---
### Simple Factory Pattern Intro 
简单工厂模式的定义为定义一个工厂类，它可以根据参数的不同返回不同类的实例；简单工厂模式不属于GOF 23个经典设计模式之一，它的设计思想很简单，其基本流程如下：
* 将需要创建的各种不同类型的对象的相关代码封装到不同的类中，这些类称为具体产品类。
* 提供一个工厂方法用来创建产品，该方法可以根据所传入的参数不同创建不同的具体产品对象。
* 客户端调用工厂方法并传入相应的参数。

### Simple Factory Pattern Example
* 封装产品生产
``` js
function LineChart() {
	this.type = '折线图';
}

function PieChart() {
	this.type = '饼状图';
}
```
* 创建工厂方法
``` js
function Chart(type) {
	let chart;
	switch (type) {
		case 'line':
			chart = new LineChart();
			break;
		case 'pie':
			chart = new PieChart();
			break;
		default:
			break;
	}
	return chart;
}
```
* 传入不同的参数生产产品
``` js
let chart = new Chart('line');
```

### 简单工厂模式优缺点
#### 优点
* 工厂方法必须包含必要的判断逻辑，可以决定在什么时候创建哪一个产品类的实例，客户端免除了直接创建产品对象的职责，而仅仅"消费"产品，实现了对象创建和使用的分离。
* 使用者无须知道所创建的具体产品类的名称，只需要知道具体产品类所对应的参数即可，可以在一定程度上减少使用者的记忆量。

#### 缺点
* 工厂类集中了所有产品类的创建逻辑，一旦工厂类出现的异常，整个系统都要受到影响。
* 系统扩展困难，一旦添加新产品就不得不修改工厂类逻辑，当产品类型较多的时候，可能会造成工厂逻辑过于复杂。

#### 简单工厂模式适用场景
* 工厂类负责创建的对象比较少，由于创建的对象比较少，则不会导致工厂类的逻辑过于复杂。
* 客户端只知道传入工厂的参数，对于如何创建对象并不关心。

### Factory Pattern Intro
工厂模式定义一个用于创建对象的接口，这个接口由子类决定实例化哪一个类，该模式使类色实例化延迟到子类，而子类可以重写接口方法以便创建的时候制定自己的对象类型。换句更加通俗易懂的话来说就是：事先定义好每条流水线，每条流水线生产的东西是不一样的，然后工厂统一管理流水线，工厂通过订单类型来决定生产何种产品。

### Factory Pattern Example
我们通过一个创建dom节点的例子，来看一下什么是工厂模式，以及工厂模式的工作流程：
#### 创建图表库的例子
* 预定义工厂流水线
``` js
const productFactory = {
	line: function () {
		this.type = '折线图';
	},
	pie: function () {
		this.type = '饼状图';
	}
};
```
* 工厂方法统一管理流水线
``` js
function Chart(type) {
	return new productFactory[type]()
}
```
* 封装生产产品实例
``` js
function Factory() {
	const productFactory = {
		line: function () {
			this.type = '折线图';
		},
		pie: function () {
			this.type = '饼状图';
		}
	};

	return function Chart(type) {
		return new productFactory[type]()
	}
}
const factory = Factory();
let chart = factory('pie');
```

#### 创建DOM节点例子
* 预定义工厂流水线
``` js
function createInput(type) {
	let el = document.createElement('input');
	el.type = type;
	return el;
};
const controls = {
	text: function (options) {
		let el = createInput(options.type);

		if (typeof options.value != 'undefined') {
			el.value = options.value;
		}
		return el;
	},
	checkbox: function (options) {
		let el = createInput(options.type);

		if (typeof options.checked != 'undefined') {
			el.checked = options.checked;
		}
		return el;
	}
};
```
* 工厂统一管理流水线
``` js
function create(options) {
	let type = options.type ? options.type.toLowerCase() : undefined;

	if (!type || !controls[type]) {
		throw {
			message: type + ' is not supported.'
		}
	}

	return controls[type](options);
}
```
* 根据订单生产指定产品
``` js
let text = create({ type: 'text', value: 'hello world' });
```
### 工厂模式优缺点
#### 优点
* 工厂方法在创建客户需要的产品的同时，隐藏了哪个具体产品类将要被实例化，用户只需知道所需产品对应的工厂，无须关心具体产品类的名称。
* 在系统需要加入新的产品类的时候，完全无须修改工厂方法，只需要添加一个具体的产品类就可以了，增强了系统的可扩展性，符合"开闭原则"。

#### 缺点
* 在添加新的产品时，需要增加产品类的个数，在一定程度上增加了系统的复杂性。
* 考虑了扩展性则必然增加了代码复杂性，不宜与理解和测试。

### 工厂模式适用场景
* 对象的创建十分复杂。
* 需要依赖不同环境创建不同实例。
* 处理大量具有类似属性的小对象。