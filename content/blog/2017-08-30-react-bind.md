---
title:  "React Bind"
author: [sylvenas]
categories: 'React'
img: './img/2017-08-30.jpeg'
---

在应用react开发中，大家经常遇到各种this的问题，其中最常见的情况，也是很多新手容易些的代码([在线地址](https://stackblitz.com/edit/react-lczb2u?embed=1&file=index.js))是：

``` javascript 
class App extends React.Component {
    constructor() {
        super();
        this.state = { count: 0 };
    }
    increase() {
        this.setState({
            count: this.state.count + 1
        })
    }
    render() {
        return (
            <div>
                <h1>{this.state.count}</h1>
                <button onClick={this.increase}>increaseOne</button>
            </div>
        );
    }
}
```
上面的代码会报错提示：
``` javascript
Cannot read property 'setState' of null
```
新手可能在疑惑为何会报错？

原因在于，这里只是把 this.increase、this.decrease 传给 onClick, 真正调用的时候（click event）并没有指定context，从而导致在方法内部的this为null。

React团队在使用ES6开发react的时候中，决定不自动绑定。你可以在找到这篇[官方博客](https://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#autobinding)中看看他们这样做的原因。

现在我们总结一下如何在JSX中调用ES6 class 中的方法:

### 1.使用Function.prototype.bind()
由于ES6 class 中的方法都是纯javascript函数，所以集成了Function 原型中的bind方法，所以现在在JSX内部调用increase函数的时候，它内部的this,会指向类的实例，在MDN中有更多的关于bind方法的介绍。 
     
``` javascript
class App extends React.Component {
  constructor() {
    super();
    this.state = { count: 0 };
  }
  increase() {
    this.setState({
      count: this.state.count + 1
    })
  }
  render() {
    return (
      <div>
        <h1>{this.state.count}</h1>
        <button onClick={this.increase.bind(this)}>increaseOne</button>
      </div>
    );
  }
}
```
---
### 2.在构造函数中bind this
``` javascript
class App extends React.Component {
  constructor() {
    super();
    this.state = { count: 0 };
    this.increase = this.increase.bind(this);
  }
  increase() {
    this.setState({
      count: this.state.count + 1
    })
  }
  render() {
    return (
      <div>
        <h1>{this.state.count}</h1>
        <button onClick={this.increase}>increaseOne</button>
      </div>
    );
  }
}
```
---
### 3.在构造函数中使用箭头函数
ES6箭头函数定义时，会自动保留上下文，我们可以借助这个特性，让 increase 方法以下列方法在构造函数中重新定义
``` javascript
class App extends React.Component {
  constructor() {
    super();
    this.state = { count: 0 };
    this._increase = () => this.increase();
  }
  increase() {
    this.setState({
      count: this.state.count + 1
    })
  }
  render() {
    return (
      <div>
        <h1>{this.state.count}</h1>
        <button onClick={this._increase}>increaseOne</button>
      </div>
    );
  }
}
```
---
### 4.使用箭头函数和类属性
我们使用class  属性定义，而不在像方法三种在构造函数中定义类的方法
``` javascript
class App extends React.Component {
  constructor() {
    super();
    this.state = { count: 0 };
  }
  increase = () => {
    this.setState({
      count: this.state.count + 1
    })
  }
  render() {
    return (
      <div>
        <h1>{this.state.count}</h1>
        <button onClick={this.increase}>increaseOne</button>
      </div>
    );
  }
}
```
---
### 5.函数绑定语法
ES7有一个函数绑定语法的[提案](https://github.com/tc39/proposal-bind-operator)，详细实现的技术原理，直接查看链接里的源代码，下面只介绍使用方法。
``` javascript
class App extends React.Component {
  constructor() {
    super();
    this.state = { count: 0 };
    this.increase =::this.increase;
  }
  increase() {
    this.setState({
      count: this.state.count + 1
    })
  }
  render() {
    return (
      <div>
        <h1>{this.state.count}</h1>
        <button onClick={this.increase}>increaseOne</button>
      </div>
    );
  }
}
```
---
### 6.JSX中直接使用即时绑定
``` javascript
class App extends React.Component {
  constructor() {
    super();
    this.state = { count: 0 };
  }
  increase() {
    this.setState({
      count: this.state.count + 1
    })
  }
  render() {
    return (
      <div>
        <h1>{this.state.count}</h1>
        <button onClick={::this.increase}>increaseOne</button>
      </div>
    );
  }
}
```
参考资料：   
[1]: [About autobinding in official React blog](http://en.wikipedia.org/wiki/Syntax_highlighting)   
[2]: [Autobinding, React and ES6 Classes](http://link.zhihu.com/?target=http%3A//www.ian-thomas.net/autobinding-react-and-es6-classes/)   
[3]: [Function Bind Syntax in official Babel blog](http://link.zhihu.com/?target=http%3A//babeljs.io/blog/2015/05/14/function-bind)   
[4]: [Function.prototype.bind()](http://link.zhihu.com/?target=https%3A//developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)       
[5]: [Experimental ES7 Class Properties](http://link.zhihu.com/?target=https%3A//gist.github.com/jeffmo/054df782c05639da2adb)    
[6]: [Experimental ES7 Function Bind Syntax](http://link.zhihu.com/?target=https%3A//github.com/zenparsing/es-function-bind)   
