---
title: "higher-order component(HOC)"
author: [Sylvenas]
categories: "React"
img: './img/2017-07-11.jpeg'
---
在函数式编程中，有一个概念叫做[高阶函数](),高阶函数通常意义上来说会对传入的函数进行增强，返回一个添加了额外功能的新函数。

当高阶函数的概念应用到React组件上的时候，被称为高阶组件，首先来看一下高阶组件长什么样子：
``` js
const hoc = InnerComponent => EnhancedComponent
```
高阶组件其实就是一个函数，它接收组件作为参数，对组件进行增强后返回。

>个人觉得其实应该叫`组件工厂`更为合理

具体看一下高阶组件的实现方法：
``` js
function HOC(InnerComponent) {  
  return class extends React.Component {
	state = {
			// ... some state
	}  
    render() {      
      return <InnerComponent {...this.props} {...this.state}/>    
    }  
  } 
}
```
其实`HOC`就是接收一个组件作为参数,然后新生成一个组件，不管这个新的组件内做了什么操作，获取了什么数据，统统通过`props`传递给`InnerComponent`,并返回新生成的组件

> 这里也可以理解为 props proxy

### 高阶组件的主要用途

#### 操作props
由于`InnerComponent`的所有的`props`都是由`HOC`函数返回的新组件所提供的，所以我们可以通过高阶组件自由的操作传递给`InnerComponent`的`props`。

可以对props执行编辑、删除、新增等等操作,下面的例子展示了把state转换为props传给给InnerComponent,也可以对原有的props,进行新增一个属性之后传递给InnerComponent。
``` js
function HOC(InnerComponent) {  
  return class extends React.Component {
	state = {
		// ... some state
	}  
    render() {
	  const newProps={...this.props, a : 1};
      return <InnerComponent {...this.state} {...newProps}/>    
    }  
  } 
}
```
#### 在高阶组件中处理数据逻辑以及partial applocation的使用
``` js
const withData = url => InnerComponent => {
  return class extends Component {
    constructor() {
      super();
      this.state = {
        data: []
      };
    }
    render() {
      return (<InnerComponent{...this.state} {...this.props} />)
    }
    componentDidMount() {
      const endPoint = typeof url === 'function'
        ? url(this.props)
        : url;

      fetch(endPoint)
        .then(res => res.json())
        .then(data => this.setState({
          data
        }))
    }
  }
}

const List = ({ data: gists, ...props }) => (
  <ul>
    {gists.map(gist => <li key={gist.id}>{gist.updated_at}</li>)}
  </ul>
)


const withGists = withData(props => `https://api.github.com/users/${props.username}/gists`)

const ListWithGists = withGists(List)

export default ListWithGists
```
#### 在高阶组件中处理ref指向不符合预期
有时候我们想要使用ref来获取实例或者DOM节点，看下面的例子：
``` js
class Input extends Component {
    state = { value: 'init-value' }
    onchange = ({ target }) => { this.setState({ value: target.value }) }
    render() {
        return <input name='input1' {...this.state} onChange={this.onchange}/>
    }
}
function HOC(InnerComponent) {
    return class extends React.Component {
        render() {
			const { props }=this;
            return <InnerComponent {...props} />
        }
    }
}

const InputHoc = HOC(Input);

class Test extends Component{
	textRef = React.createRef();
	render(){
		return <InputHoc ref={this.textRef} />
	}
	componentDidMounted(){
		console.log(this.textRef) 
	}
}
```
这个时候我们会发现实际上我们获取到的`this.textRef`并不是指向原本的我们想要获取的`InnerComponent`的实例，而是指向了`HOC`函数返回的新的包装组件。

而这就是所说的高阶组件会导致`ref`指向不符合预期的问题，那么如何解决这个问题呢？

我们只要在`HOC`函数中添加一个新的`ref`属性，来指向我们的目标`InnerComponent`即可，看代码：
``` js
function HOC(InnerComponent) {
    return class extends React.Component {
        innerRef = React.createRef()

        render() {
            const props = Object.assign(
                {},
                this.props,
                { ref: this.innerRef }
            )
            return <InnerComponent {...props} />
        }
    }
}
```
此时在`Test`组件中，我们使用`this.textRef.current.innerRef`即可指向我们的`InnerComponent`组件的`ref`

### solution
高阶组件在React工具链中使用的比较多，最为典型的就是React-Redux库提供的[connect](https://github.com/reduxjs/react-redux/blob/master/src/connect/connect.js)方法,其实和我们上面例子中的`withData`思路类似，只不过接收的参数不是url,而是`mapStateToProps`、`mapDispatchToProps`等参数

高阶组件还有一种方式实现，就是新创建的组件继承`InnerComponent`,简单的代码如下：
``` js
function HOC(InnerComponent){
  return class extends InnerComponent{
    render(){
      if (this.props.loading) return <Loading/>
      return super.render()
    }
  }
}
```
这种使用方式甚至可以通过`super.render()`获取到`InnerComponent`的`element tree`,配合`React.cloneElement`方法，继而可以对tree进行编辑，删除等等(注意不要修改共享状态，尽量使用纯函数)，不过这种实现高阶组件的方式，在React社区不是特别的流行，不做过多介绍