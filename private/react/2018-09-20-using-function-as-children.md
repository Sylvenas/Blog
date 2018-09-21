---
title:  "react component using function as children"
author: [sylvenas]
categories: 'React'
img: './img/2013-06-12.jpeg'
---
React社区对`函数子组件`的模式达成了共识，这个模式的主要概念是，不按组件的形式传递子组件，而是定义一个可以从父组件接收参数的函数。

这种模式本质上来说和[`high order component`]()的目的是一样的，都是为了抽取公共逻辑，不过实现的方式却大不相同，几乎所有的用高阶组件实现的效果，使用`函数子组件`的模式也能实现

下面通过一个实例来看一下这个模式的思路

### Function as Children
