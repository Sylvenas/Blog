---
title:  "react 性能优化：arrow function in react"
author: [sylvenas]
categories: 'React'
img: './img/2017-08-19.jpeg'
---
在react中最常见的一个操作就是把一个数组的数据map成一个react组件的数组，然后其中的每一个组件都要绑定事件，看一下下面的这个例子：
``` js

import React from "react";
import { render } from "react-dom";

class User extends React.PureComponent {
  render() {
    const { name, onDeleteClick, id } = this.props;
    console.log(`${name} just rendered`);
    return (
      <li>
        <input type="button" value="Delete" onClick={onDeleteClick} />
        {name}
      </li>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [
        { id: 1, name: "Cory" },
        { id: 2, name: "Meg" },
        { id: 3, name: "Bob" }
      ]
    };
  }

  deleteUser = id => () => {
    this.setState(prevState => {
      return {
        users: prevState.users.filter(user => user.id !== id)
      };
    });
  };

  render() {
    return (
      <div>
        <h1>Users</h1>
        <ul>
          {this.state.users.map(user => {
            return (
              <User
                key={user.id}
                name={user.name}
                id={user.id}
                onDeleteClick={this.deleteUser(user.id)}
              />
            );
          })}
        </ul>
      </div>
    );
  }
}

export default App;

render(<App />, document.getElementById("root"));
```
上面代码的关键在于`deleteUser`方法的使用，我们是使用了一个闭包来保存`user.id`的数据，然后在后面用户点击按钮的时候，能获取到用户点击的是哪一个`li`;

### So What’s the Problem?
上面的代码看上去及其简单，那么问题出现在哪里呢?

当我们点击删除按钮删除`Cory`的时候，我们发现`Meg`和`Bob`都重新渲染了，为何会这样？明明我们只是删除了`Cory`，和另外两个没有一点点关系的，并且`User`组件是`PureComponent`,也就是说，只有内部的`state`或者`props`发生改变的时候，才会触发重新渲染。`User`组件根本没有内部的`state`，那也就是只有一个可能，就是传递过来的`props`发生了变化。

再次分析一下，我们传递给`User`组件的数据，`key`,`name`,`id`,都不可能发生变化，那就只能是`onDeleteClick`发生了变化。

here is why ?当我们删除其中的一个user的时候，会触发App组件的`re-render`,在这个过程中，`this.deleteUser`方法会重新执行并返回一个新的函数，而这就是触发另外两个user `re-render`的原因，确实是收到了新的props。

### What’s the Solution?
那就是尽量在`render`方法中避免使用arrow function，而是抽取出`User`组件，在`User`组件的内部完成id的传输，看具体的代码：
``` js
import React from 'react';
import { render } from 'react-dom';

class User extends React.PureComponent {
  onDeleteClick = () => {
    // No bind needed since we can compose the relevant data for this item here
    this.props.onClick(this.props.user.id);
  };

  render() {
    console.log(`${this.props.user.name} just rendered`);
    return (
      <li>
        <input type="button" value="Delete" onClick={this.onDeleteClick} />
        {this.props.user.name}
      </li>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [
        { id: 1, name: 'Cory' },
        { id: 2, name: 'Meg' },
        { id: 3, name: 'Bob'}
      ],
    };
  }

  deleteUser = id => {
    this.setState(prevState => {
      return {
        users: prevState.users.filter(user => user.id !== id)
      };
    });
  };

  renderUser = user => {
    return <User key={user.id} user={user} onClick={this.deleteUser} />;
  }

  render() {
    return (
      <div>
        <h1>Users</h1>
        <ul>
          {this.state.users.map(this.renderUser)}
        </ul>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
```
在上面的这个代码中，我们在`render`方法中去掉了使用闭包来保存`id`的箭头函数，而是在`User`组件中`onDeleteClick`方法中来传递id,这样不管我们点击删除任何一个user的时候，都不会触发别的user的`re-render`;

#### Other Solution
我们也可以把id属性，绑定到html元素上的方式，来避免使用arrow function;

``` js
import React from 'react';
class App extends React.Component {  
  constructor() {    
    this.state = {      
      users: [        
        { id: 1, name: 'Cory' },         
        { id: 2, name: 'Meg' }      
      ]    
    };  
  }

  deleteUser = e => {   
    const id = e.target.value
    this.setState(prevState => {      
      return {
        users: prevState.users.filter( user => user.id !== id)
      }    
    })  
  }   
  render() {    
    return (      
      <div>        
        <h1>Users</h1>        
        <ul>        
        {           
          this.state.users.map( user => {            
            return (              
              <li key={user.id}>                
                <button                   
                  type="button"                   
                  value={user.id}                   
                  onClick={this.deleteUser}
                >
                  Delete
                </button>             
                  {user.name}              
              </li>            
            )          
          })        
        }        
        </ul>      
      </div>    
    );  
  }
}
export default App;
```
