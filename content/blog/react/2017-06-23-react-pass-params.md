---
title:  "React Pass Params"
author: [Sylvens]
categories: 'React'
img: './img/2017-06-23.jpeg'
---

在react中经常会遇到onClick,onChange 等事件的传参问题，现在简单把react event中传递参数的方法，进行简单总结,举例如下：

### 1.bind
``` javascript
const names = ['zhao', 'qian', 'sun', 'li'];

class App extends Component {
  showName(name, event) {
    console.log(name, event)
  }

  render() {
    return (
      <div className="App">
        {names.map(item =>
          <button key={item} onClick={this.showName.bind(this, item)}>{item}</button>
        )}
      </div>
    );
  }
}
```
### 2.closure
``` javascript
const names = ['zhao', 'qian', 'sun', 'li'];

class App extends Component {
  showName = name => event => {
    console.log(name, event)
  }
  showName2 = function (name) {
    return function (event) {
      console.log(name, event);
    }
  }

  render() {
    return (
      <div className="App">
        {names.map(item =>
          <button key={item} onClick={this.showName(item)}>{item}</button>
        )}
      </div>
    );
  }
}
```
>showName和showName2 是等价的，前者是ES6写法(更简洁)，后者是ES5写法(传统闭包)。 
   
### 3.create new method    
``` javascript
const names = ['zhao', 'qian', 'sun', 'li'];

class App extends Component {
  showName = (name, event) => {
    console.log(name, event.target)
  }

  render() {
    return (
      <div className="App">
        {names.map(item =>
          <button key={item} onClick={(event) => this.showName(item, event)}>{item}</button>
        )}
      </div>
    );
  }
}
```
>在onClick中动态创建新函数    

### 4.make the param be a prop    
``` javascript
const names = ['zhao', 'qian', 'sun', 'li'];

class App extends Component {
  showName(name, event) {
    console.log(name, event)
  }
  render() {
    return (
      <div className="App">
        {names.map(item =>
          <Button key={item} onItemClick={this.showName} item={item} />
        )}
      </div>
    );
  }
}

class Button extends Component {
  handleClick = event => {
    this.props.onItemClick(this.props.item, event);
  }
  render() {
    return <button onClick={this.handleClick}>{this.props.item}</button>
  }
}
```
>这中处理方法虽然比较麻烦，看起来要多封装一个 *`Button`* 组件，但是细想一下，这才是react所最推崇的解决方案和思路，彻底的组件化拆分方案，把要传递的参数和处理函数当成 *`props`* 的一部分来传递。