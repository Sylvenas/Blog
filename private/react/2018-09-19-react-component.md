---
title:  "react 组件类型"
author: [sylvenas]
categories: 'React'
img: './img/2013-06-12.jpeg'
---
React Component分为两种类型的，`class Component`和`functional component`,两者的区别从名字也能看出来

### Functional Component VS Class Component
#### Functional Component
所谓函数式组件就是一个简单的JavaScript函数,该函数可以接受两个可选的参数，一个是`props`,一个是`context`。
![函数式组件](../../images/Stateful-vs-Stateless-Component-PropsvsState.jpg)
如果使用函数式组件，使用ES6的语法会更简洁
``` js
const Hello = ({ name }) => (<div>Hello, {name}!</div>);
```
functional component 不能像class component使用ref,来引用实例，因为函数式组件不会被实例化

> 函数式组件内部还是可以使用ref来引用组件本身的子组件的

``` js
const Hello = ({ name }) => {
	let input;
	const onClick = () => input.focus();
	return (
		<div>
			<input ref = { el => input = el}/>
			<button onClick={onClick}>Focus</button>
		</div>)
}
```

#### Class Component
类组件比函数式组件有更多的功能，与此同时而来的类组件也有更多的弊端(此处体现了任何事物都有两面性的哲学观点)，使用类组件的主要优势在于他们可以拥有内部的`state`
![函数式组件](../../images/React-Class-Component.jpg)
``` js
class Hello extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
                Hello {props}
            </div>
        )
    }
}
```
上面的例子非常简单，但有几个点需要注意一下：
* 构造函数在定义组件时是必选的 - 上面的例子中，组件没有`state`,构造函数似乎没有任何做有意义的事情，无论是否调用构造函数，`render()`中都是可以使用`this.props`的，但是[官方文档](https://reactjs.org/docs/state-and-lifecycle.html#adding-local-state-to-a-class)中写道：

>Class components should always call the base constructor with `props`.

作为最佳实践，建议所有的类组件都使用构造函数
* 如果使用构造函数 - 那么就必须使用`super`来调用父类的构造函数。否则会出现语法上的错误

* `super()`和`super(props)`的区别 - 如果要在构造函数中使用`this.props`，则应该使用`super(props)`,否则单独使用`super()`就足够了

### Stateful Components VS Stateless Components
还可以根据组件内是否有`state`来分类组件分为`有状态组件`和`无状态组件`

#### Stateful Components
有状态组件肯定都是`Class Component`，有状态组件一般都会在构造函数中初始化`state`:
``` js
constructor(props){
	super(props);
	this.state = { count : 0 };
}
```
或者是使用在ES中尚未纳入标准的`类字段`的特性，
``` js
class App extends Component {   
  /*
  // Not required anymore
  constructor() {
      super();
      this.state = {
        count: 1
      }
  }
  */  
  state = { count: 1 };

  handleCount(value) {
      this.setState((prevState) => ({count: prevState.count+value}));
  }

  render() {
    // omitted for brevity
  }
}
```
关于有状态组件中的`setState`方法，请详细查看[React setState]()文章。

#### Stateless Components
顾名思义无状态组件就是没有任何内部状态的纯函数组件，只接收`props`和`context`作为参数，并返回相应元素， 体现了函数式编程的思路。

可以使用类和函数创建无状态组件，除非要在组件中使用生命周期钩子，否则应该使用函数式无状态组件，无状态组件的好处包括易于编写、理解、测试，还可以避免使用`this`关键字，但是从React16开始，使用无状态组件而不是类组件将没有任何性能优势。

无状态组件的缺点是不能使用生命周期钩子，`shouldComponentUpdate`通常用于优化性能并手动控制是否需要重新渲染。

### Container Components VS Presentational Components
容器组件和展示组件是从使用用途的角度来划分的
#### Presentational Components
展示组件顾名思义只是展示UI使用的，通常是无状态组件，接受来自容器组件传递的props作为唯一的数据来源，并使用这个数据渲染UI

展示组件应该都是可以重用的，应该与行为层分离，展示组件通过props接收数据和事件的回调函数

除非需要内部state,否则展示组件都应该是functional component,如果组件需要状态，则关注点应该是在UI本身上，而不是数据，展示组件不与redux或者其他API进行交互。
#### Container Components
容器组件将处理行为部分，主要是处理数据获取，数据操作和事件监听，不应该包含任何DOM标记和样式；

如果是使用Redux,那么容器组件主要是包含dispatch action 和 getState的代码，或者可以再容器组件中请求数据，并将结果数据传递给展示组件

一般最顶层会有一个容器组件，它将处理数据并把数据传递给子展示组件，这适用于比较小的项目；
然而当项目比较大的时候，最好创建每个展示组件的容器组件，这里没有标准，只有最佳实践

另一方面这中组件拆分的方式，也会带来反面问题，代码库需要创建更多的文件和组件，量变引起质变，进而导致可用程度降低，那么最佳实践是到底怎么划分容器组件和展示组件呢？
容器组件：
* 更关心行为部分
* 负责渲染对应的表现形式
* 发起API请求并操作数据
* 定义事件处理器
* 写作类的形式
展示组件：
* 更关心视觉表现
* 负责渲染HTML标记(或其他组件)
* 以props的形式从父组件接收数据
* 通常写作无状态函数式组件

### PureComponent
React最近推出了新的Pure Component的概念，类似于纯函数的概念，如果一个组件给定了相同的props和state,则会展现相同的UI,那么这个组件被称为纯组件，函数式组件就是纯组件的很好的例子。
``` js
const HelloWorld = ({name}) =>(<div>{`hello ${name}`}</div>)
```
类组件也可以是纯组件，React.PureComponent和React.Component类似，只是实现`shouldComponentUpdate`方法策略不同，继承Component的组件在render之前会调用`shouldComponentUpdate`方法，该方法的默认返回值是true,以便最任何props的修改都触发重新渲染

但是，继承了PureComponent类的组件，它会在执行`shouldComponentUpdate`方法的时候进行一个`浅层次`(仅仅比较对象的第一层的数据是否相同，而不是递归的比较所有层次的对象嵌套)的比较

浅比较的实现代码如下：
``` js
'use strict';

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
	// SameValue algorithm
	if (x === y) { // Steps 1-5, 7-10
		// Steps 6.b-6.e: +0 != -0
		// Added the nonzero y check to make Flow happy, but it is redundant
		return x !== 0 || y !== 0 || 1 / x === 1 / y;
	} else {
		// Step 6.a: NaN == NaN
		return x !== x && y !== y;
	}
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA, objB) {
	if (is(objA, objB)) {
		return true;
	}

	if (typeof objA !== 'object' || objA === null ||
		typeof objB !== 'object' || objB === null) {
		return false;
	}

	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) {
		return false;
	}

	// Test for A's keys different from B.
	for (let i = 0; i < keysA.length; i++) {
		if (
			!hasOwnProperty.call(objB, keysA[i]) ||
			!is(objA[keysA[i]], objB[keysA[i]])
		) {
			return false;
		}
	}

	return true;
}
```
React.PureComponent用于优化性能，除非遇到某种性能问题，否则没有理由考虑使用它。
