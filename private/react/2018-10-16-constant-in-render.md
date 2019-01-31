---
title:  "react 性能优化：constant in render"
author: [sylvenas]
categories: 'React'
img: './img/2018-10-16.jpeg'
---

props的常量问题，当我们给一个组件传递一个固定的数组的时候，也会发生性能问题，举例来说：
``` js
 class Item extends PureComponent{
	 render(){
		 return (
			 <li>
				{
					// something
				}
			 </li>
		)
	 }
 }

render(){
	return (
		<ul>
			{items.map(item=>(
				<Item
					key={item}
					item={item}
					onClick={console.log}
					statuses={['open','close']} 
				/>
			))}
		</ul>)
}
```
我们在使用Item组件的时候，看似传递了一个“常量”`['open','close']`作为选项集合，由于Item组件是一个纯组件，只要传递的item不会变化，就不会发生渲染，实际上每次Item组件都会发生重新渲染。

原因在于每次传递的statuses都是一个新的数组和传递箭头函数类似，因为pureComponent会使用浅比较，而`[] === []`,永远都是返回false，所以触发了重新渲染。

要解决这个问题，也很简单，只要在组件外面定义一个常量数组，以后都使用这个常量即可，代码如下：
``` js
const statuses = ['open','close'];

render(){
	return (
		<ul>
			{items.map(item=>(
				<Item
					key={item}
					item={item}
					onClick={console.log}
					statuses={statuses} 
				/>
			))}
		</ul>)
}
```