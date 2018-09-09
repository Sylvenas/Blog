---
title: "React setState"
author: [Sylvenas]
categories: "React"
img: './img/2016-12-01.jpeg'
---
Component state is a way of holding, processing and using information that is internal to a given Component and allows you to implement its logic. State is usually a POJO (Plain Old Java[Script] Object), and changing it is one of the few ways to make a Component re-render itself.     

It’s one of the most basic ideas behind React, yet it has some properties that make it tricky to use and might lead to unexpected behavior in your application.     

### Updating state   

Only place you can directly write to `this.state` should be the Components constructor (or, if you’re using class-properties plugin a babel-preset, the class declaration). In all the other places you should be using `this.setState` function, which will accept an Object that will be eventually merged into Components current state.    

While it is technically possible to alter state by writing to `this.state` directly, it will not lead to the Component re-rendering with new data, and generally lead to state inconsistency.    

### setState is asynchronous (*)   

The fact that setState causes reconciliation(the process of re-rendering the components tree) is base of the next property — setState is asynchronous. This allows us to have multiple calls to setState in a single scope and not trigger not needed re-renders of the whole tree.    

This is why you don’t see the new values in state right after you updated it.
```js
// assuming this.state = { value: 0 }
this.setState({
  value: 1
});
console.log(this.state.value); // 0
```     
React will also try to group or batch setState calls into a single call, which leads us to our first “gotcha”:    
```js
// assuming this.state = { value: 0 };
this.setState({ value: this.state.value + 1});
this.setState({ value: this.state.value + 1});
this.setState({ value: this.state.value + 1});
```
After all the above calls are processed `this.state.value` will be 1, not 3 like we would expect! To get around that …   

### setState accepts a function as its parameter

If you pass a function as the first argument of setState, React will call it with the at-call-time-current state and expect you to return an Object to merge into state. So updating our example above to:    
```js
// assuming this.state = { value: 0 };
this.setState((state) => ({ value: state.value + 1}));
this.setState((state) => ({ value: state.value + 1}));
this.setState((state) => ({ value: state.value + 1}));
``` 
Will give us `this.state.value = 3` like we expected in the first place. Remember to always use this syntax when updating state to a value, which is computed based on previous state!

### setState is … synchronous?

Remember how you just learnt that `setState` is asynchronous? Well, it [turns out that’s not always the case!](https://twitter.com/acdlite/status/817072056940408832) It depends on the execution context, for example:   
```js
render() {
    return <button onClick={this.inc}>Click to update</button>
}
  
inc() {
    console.log('before: ' + this.state.test);
    this.setState({
      test: this.state.test+1
    });
    console.log('after: ' + this.state.test);
}
```
```js
// click!
before: 1
after: 1
// click!
before: 2
after: 2
```
But if we add:   
```js
componentDidMount() {
  setInterval(this.inc, 1000);
}
```
we will see:    
```js
before: 1
after: 2
before: 2
after: 3
```
So, should we learn when to expect what behavior? Not really. It’s safe to assume that `setState` is indeed async, as [it will be so in the future, post-Fiber releases](https://twitter.com/acdlite/status/817075742915690496).

### setState accepts a callback

If you need to execute some function, or verify if the state did indeed update correctly you can pass a function as the second argument of `setState` call, the function will be executed once the state was updated. Remember that since all updates in a scope are batched, if you have multiple calls to `setState` each of their callbacks will be called with the fully-updated state.
Another way of making sure your code executes after an update happen would be placing it in `componentWillUpdate` or `componentDidUpdate` however, contrary to the callback those two are *not* called when `shouldComponentUpdate` prevents your component from updating (the store will be still updated though!)
```js
class App extends Component {
  constructor() {
    super();
    this.state = {
      value: 0
    };
  }
  handleClick(e) {
    this.setState((state) => ({ value: state.value + 1 }),()=>{
      console.log('call back',this.state.value)
    });
  }
  componentWillUpdate(){
    console.log('componentWillUpdate',this.state.value)
  }
  componentDidUpdate(){
    console.log('componentDidUpdate',this.state.value)
  }
  shouldComponentUpdate(){
    console.log('shouldComponentUpdate',this.state.value)
    return true;
  }
  render() {
    return (
      <div>
        <button onClick={this.handleClick.bind(this)}>click me</button>
      </div>
    );
  }
}
```
When click the button,we will see:
``` js
shouldComponentUpdate 0
componentWillUpdate 0
componentDidUpdate 1
call back 1
```

### Common errors
One of the most common errors when using Component state is setting its value based on props in constructor. Consider following code:    
```js
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: this.props.value };
  }
  
  render() {
    return <div>The value is: {this.state.value}</div>
  }
}
```
If the parent renders it as:
```js
<Component value={42} />
```
it will correctly render “The value is 42”. But if then the parent changes to:   
```js
<Component value={13} />
```
it will still think that `this.state.value` is 42 — that’s because React will not destroy Component and recreate it — it will reuse the once rendered component and will not re-run the constructor. To get around this problem you should not assign the props to state rather use `this.props.value` in the render method. If you do however decide to use the state (for example because the value from props is used in a very complex computation that you don’t want to run on every render), you should implement a solution which will update the state when needed, for example:   
```js
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: this.props.value };
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.value !== this.props.value) {
      this.setState({value: nextProps.value});
    }
  }
  render() {
    return <div>The value is: {this.state.value}</div>
  }
}
```
Rememeber that any `componentWill*` function is not a place to trigger side effect (such as making an AJAX call), so please use `componentDidUpdate(previousProps, previousState)` for those, also providing similar “guard” if as above as to not run the code when no change took place.

### Appendix

We can expect some changes to `setState` coming with React Fiber and beyond. As mentioned before, `setState` will be asynchronous in most cases (or deferred until end of the execution scope, post-Fiber goal). Another change is that using the function syntax it will be [possible to abort](https://twitter.com/nishb1/status/852542873803345920) an “in progress” `setState` call :
```js
this.setState((state) => {
  if(checkSomeConditions()) return undefined;
  else return { value: 42}
});
```