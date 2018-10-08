---
title:  "react component using function as children"
author: [sylvenas]
categories: 'React'
img: './img/2013-06-12.jpeg'
---
React社区对`函数子组件`的模式达成了共识，这个模式的主要概念是，不按组件的形式传递子组件，而是定义一个可以从父组件接收参数的函数。

这种模式本质上来说和[`high order component`]()的目的是一样的，都是为了抽取公共逻辑，不过实现的方式却大不相同，几乎所有的用高阶组件实现的效果，使用`函数子组件`的模式也能实现。

>这个模式初次看上去比较怪异，甚至有点违背react的思路，不过确是非常的强大

### Function as Children
下面通过和高阶组件类似的查询用户的github gists 列表的案例，来看一下这个模式的思路
``` js
render() {
    return (
      <div>
        <LoadContent>
          {
            ({ loading }) => <span>{loading}</span>
          }
        </LoadContent>
      </div>
    )
  }
```
我们把一个普通函数，作为子组件传递给了LoadContent组件，所以关键就在于`LoadContent`的实现方法上了：
``` js
class LoadContent extends Component {
  state = {
    loading: true,
    error: false,
    data: [],
  };

  componentDidMount() {
    fetch(this.props.url)
      // we should check status code here and throw for errors so our catch will work.
      .then(res => res.json())
      .then((data) => this.setState({ data, loading: false }))
      .catch((err) => this.setState({ loading: false, error: true }))
  }

  render() {
    return (
      <div>
        {this.props.children({
          ...this.props,
          ...this.state,
        })}
      </div>
    );
  }
}
```
关键代码就在于`LoadContent`组件的render方法中不是像平常的组件一样，使用`this.props.children`渲染子组件，而是调用子组件(`this.props.children(...)`),同时使用url来传递我们想要的参数，同样可以达到封装重用代码的目的。
现在我们可以这样使用`LoadContent`组件：
``` js
<LoadContent url="https://yourendpoint.com">
  {
    ({ loading, error, data }) => {
      if (loading) return <span>Loading...</span>
      if (error) return <span>Error loading</span>

      return (
        <div>
          {data.map((item) => <div>{item}</div>)}
        </div>
      )
    }
  }
</LoadContent>
```
### Render Props
上面的例子中，可以把函数作为children传递，然后调用`children()`,同样的我们可以在props中传递函数，在组件内部决定怎么使用该props。举例来说：
``` js
 render() {
    return (
      <div>
        <ComplexList
          data={["1", "2", "3", "4"]}
          renderHeader={({ loading }) => <span>{loading}</span>}
          renderListItem={(item) => <div>{item}</div>}
        >
          <div>Some data</div>
        </ComplexList>
      </div>
    );
  }
```
看一下`ComplexList`组件的实现
``` js
class ComplexList extends Component {
  render() {
    return (
      <div>
        <div className="header">
          {this.props.renderHeader(this.props)}
        </div>
        <div className="footer">
          {this.props.data.map(item => this.props.renderListItem)}
        </div>
        <div className="footer">
          {this.props.children}
        </div>
      </div>
    );
  }
}
```

通过props传递渲染的函数，可以让我们自由的定义子组件的展示逻辑和展示样式，这是一种很强大的组件组合的方式，很多react ui库都是采用的这种方式，来提供给用户自定义数据展现方式，例如[ant-design](https://ant.design/components/table-cn/#components-table-demo-jsx)的`Table`组件。

上述的两种方式可以结合起来使用就是：
``` js
render() {
  <LoadContent url="https://yourendpoint.com">
    {
      ({ loading, error, data }) => {

        if (loading) return <span>Loading...</span>
        if (error) return <span>Error loading</span>

        return (
          <ComplexList
            data={data}
            renderHeader={() => <span>{loading ? "Loading..." : "Header Content" }</span>}
            renderListItem={(item) => <div>{item}</div>}
          >
            <div>We have {data.length} items</div>
          </ComplexList>
        )
      }
    }
  </LoadContent>
}
```

### solution
使用这种方式在每次re-render的时候，都会重新生成一个函数，并传递，这在一定程度会上导致性能下降，

也不能在组件内使用`shouldComponentUpdate`方法，因为在进行浅比较的时候，会发现每次传递的props都不一样，因为每次都是一个新的函数。

不过总体来说，这也是一种构建复杂组件的方式，也有很多优秀的react组件库大量使用这种方式，典型的例子比如:[react-motion](https://github.com/chenglou/react-motion)
