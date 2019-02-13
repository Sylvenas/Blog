---
title: "FP6：Partial Application And Curry"
author: [Sylvenas]
categories: "functional"
img: './img/2017-11-23.jpeg'
excerpt: '我们可以在一定程度上认为函数求值的过程，也可以认为就是函数消元的过程，当所有的元都被消完之后，那么就可以求的函数值。'
---

在了解什么是偏应用函数和柯里化之前，我们先复习一下中学数学中的高斯消元法的简单应用：   
设函数`f(x,y) = x + y`；在`y = 1`的时候，函数可以修改为`f(x) = x + 1`；  
上面的基本思路就是把`二元`变成`一元`，同理我们可以把三元函数`降元`为二元，甚至把多元函数`降元`为一元函数。

那么我们可以在一定程度上认为函数求值的过程，也可以认为就是函数消元的过程，当所有的元都被消完之后，那么就可以求的函数值。

在函数式编程中，我们也可以采用类似的思路去解决我们的问题，下面我们看几个关于函数参数的例子：
### All for One
我们先看一个简单的例子：
``` js
['1', '2', '3'].map(parseInt)
```
上面的代码执行的结果很多人在第一次接触的时候，都会弄错，我认识的想当一部人认为上面的结果是`[1, 2, 3]`,但是实际上面代码运行的结果为：`[1, NaN, NaN]`,这是因为`map`函数会向传入它的函数，传递三个参数：`currentValue`,`index`,`array`,而`parseInt`函数是可以接收两个参数的，这样说明一下，上面的结果也就不难理解了。

那么把上面的问题概括一下，可以描述为：如果一个函数本身可以接收多个参数，但是某些情况下，我们只想给该函数传入一个参数的情况下调用该函数。

我们设计一个简单的小助手来包装一个函数，使得只有一个参数能够被传入该函数：
``` js
function unary(fn) {
  return function onlyOneArg(arg) {
    return fn(arg);
  }
}
```
`uncay(...)`创建一个函数，这个函数会把除了第一个参数之外的所有参数全部忽略。在应用`parseInt`函数的时候，传入的第二个参数`index`会被自己忽略。
``` js
['1', '2', '3'].map(unary(parseInt));
// [1, 2, 3]
```
### One on One
说到只有一个参数的函数，函数式编程中有一个常见的最基础的函数，它接收一个参数，什么都不做，直接把该参数返回：
``` js
function identity(v) {
    return v;
}
```
这个函数看起来超级简单，甚至没有什么用处。但是，请记住任何函数在函数式编程中都是有用武之地的。就像演艺界中：没有小角色，只有小演员。
例如：设想你用一个正则表达式来分割一个字符串，但是结果数组中可能包含一个空值，我们可以使用`Array.prototype.filter`和`identity`来过滤空值。
``` js
var words = "   Now is the time for all...  ".split( /\s|\b/ );
words.filter( identity );
// ["Now","is","the","time","for","all","..."]
```
另一个例子是，我们可以把`identity(...)`作为转换函数的默认参数。
``` js
function output(msg,formatFn = identity) {
    msg = formatFn( msg );
    console.log( msg );
}

function upper(txt) {
    return txt.toUpperCase();
}

output( "Hello World", upper );     // HELLO WORLD
output( "Hello World" );            // Hello World
```
### Unchanging One
有些API不允许给方法传递一个值，只能传递一个函数作为参数，即使这个函数也只是返回一个值，JavaScript中的`Promises`是一个典型的案例：
``` js
// doesn't work:
p1.then( foo ).then( p2 ).then( bar );

// instead:
p1.then( foo ).then( function(){ return p2; } ).then( bar );
```
但是我们依然可以创建一个函数式的工具来帮我实现这个：
``` js
function constant(v) {
    return function value(){
        return v;
    };
}

p1.then( foo ).then( constant( p2 ) ).then( bar );
```

### Some Now, Some Later and Partial Application
如果一个函数可以接收多个参数，你可能会想先指定部分参数，余下的参数稍后在指定，来看这个函数：
``` js
function ajax(url,data,callback) {
    // ..
}
```
想象一个场景，你要发起多个已知URl的API请求，但是这些请求的数据和处理响应信息的毁掉函数要稍后才能知道。

当然你可以等这些参数都确定下来之后，在发起`ajax(...)`请求，并且到那时候在饮用全局URL常量。但我们还有另一个选择，就是创建一个已经预设URL实参的函数引用。

我们将创建一个新函数，其内部仍然发起`ajax(...)`请求，此外在等待接收另外两个参数的同时，我们将手动将`ajax(...)`第一个参数设置成你的API的地址。
``` js
function getPerson(data,cb) {
    ajax( "http://some.api/person", data, cb );
}

function getOrder(data,cb) {
    ajax( "http://some.api/order", data, cb );
}
```
手动指定这些函数完全是有可能的，但是很明显这是个冗长乏味的过程，尤其是预设参数可能还会变化的情况，例如：
``` js
function getCurrentUser(cb) {
    getPerson( { user: CURRENT_USER_ID }, cb );
}
```
函数式编程的核心思路之一，就是在做同一种事情的时候找到一种通用的模式，并试着将这种抽象的模式转换为可重用的函数。实际上，这种思路早已是大多数开发人员的本能反应了，这种思路也不是函数式编程所独有的。但是对于函数式编程而言，这个思路的重要性是毋庸置疑的。

为了实现这个预设第一个参数的函数，我们不能仅仅着眼与前面手动实现的方式，还要在整体概念上概括一下到底发生了什么？

用一句话来说明发生的事情：`getOrder(data,cb)`是`ajax(url,data,cb)`函数的**偏应用函数(partial application)**,该术语描述的概念是：**在函数调用时(function call-site)，将实参应用于(apply)形参**。如你所见：我们一开始仅应用了部分实参，--先将`"http://some.api/person"`实参应用到`url`形参,剩下的参数稍后在应用。

该模式严格的说法是：偏函数严格来讲是一个减少函数参数个数(function.length)的过程;这里的参数个数指的是函数期望传入的形参的数量。我们通过`getOrder(...)`把原函数`ajax(...)`的参数个数从3个减少到2个。

让我们来定义一个`partial(...)`的工具函数：
``` js
function partial(fn,...presetArgs) {
    return function partiallyApplied(...laterArgs){
        return fn( ...presetArgs, ...laterArgs );
    };
}

// or the ES6 => arrow form
const partial =
    (fn,...presetArgs) =>
        (...laterArgs) =>
            fn( ...presetArgs, ...laterArgs );
```
`partial(...)`函数接收`fn`参数，`fn`是将要被我们`偏应用(oartially apply)`实参的函数。接着`fn`形参之后，`presetArgs`数组手机了后面传入的部分参数，保存起来稍后使用。

我们创建并`return`了新的内部函数(为了清晰明了，我们把它命令为`partiallyApplied(...)`),该函数接收`laterArgs`数组
作为稍后要传递的剩余参数。

你注意到在`partiallyApplied(...)`函数内部的`fn`和`presetArgs`的引用了吗？它们是怎么工作的呢？在函数`partial(...)`执行结束之后，内部函数为何还能访问到`fn`和`presetArgs`?很明显，在JavaScript中这就是**闭包(closure)** .内部函数`partiallyApplied(...)`封闭了`fn`和`presetArgs`变量，所以无论该函数在哪里运行，我们都可以访问到这些变量。

当`partiallyApplied(...)`函数稍后在某处执行时，该函数使用被闭包作用(closed over)的`fn`引用来执行原函数，首先传入(被闭包作用的)`presetArgs`数组中所有偏应用(partial application)实参，然后传入刚刚被传入的`laterArgs`数组中的实参。

现在我们用`partial(..)`函数来制造一些之前我们提到的偏函数：
``` js
var getPerson = partial( ajax, "http://some.api/person" );

var getOrder = partial( ajax, "http://some.api/order" );
```
请暂停并思考一下`getPerson(...)`函数的外形和内在，它相当于下面这样的：
``` js
var getPerson = function partiallyApplied(...laterArgs) {
    return ajax( "http://some.api/person", ...laterArgs );
};
```
那我们仔细思考一下`getCurrentUser(...)`函数又该是怎么样的呢？
``` js
// version 1
var getCurrentUser = partial(
    ajax,
    "http://some.api/person",
    { user: CURRENT_USER_ID }
);

// version 2
var getCurrentUser = partial( getPerson, { user: CURRENT_USER_ID } );
```
我们可以(version1)直接指定`url`和`data`两个实参来定义`getCurrentUser(...)`函数，也可以(版本2)将`getCurrentUser(...)`函数定义为`getPerson(...)`的偏应用，该偏应用仅指定一个`data`实参。

因为version2重用了已经定义好的函数，所有在表达上更清晰一些，这也更符合函数式编程的精神。

我们在看另外一个偏应用的例子：设想一个`add(...)`函数，它接收两个参数，并返回二者之和：
``` js
function add(x, y) {
  return x + y;
}
```
现在我们有一个数字数组，并要给数组中的每个数字加一个确定的数值，我们讲使用`Array.prototype.map()`函数。
``` js
[1, 2, 3].map(function adder(val) {
  return add(3, val);
})
// [4,5,6]
```
因为`add(..)`函数签名不是我们预期传递给`map(..)`函数的，所以我们不能直接把它传入`map(..)`函数，这样以来，偏应用就有了用武之地：我们可以偏应用`add(..)`函数的第一个参数，以符合`map(..)`函数的预期。
``` js
[1, 2, 3].map( partial( add, 3 ) );
// [4,5,6]

```

#### bind(...)
JavaScript函数有一个内置的`bind(..)`函数，该函数有两个功能：预设`this`关键字的上下文，一级偏应用实参。

我认为将这两个功能混合进一个函数是非常糟糕的决定。有时候你不关心`this`的绑定，而只是要偏应用实参。在上面的例子中，如果我们要偏应用`url`:
``` js
var getPerson = ajax.bind( null, "http://some.api/person" );
```
>传递的第一个参数null,看上去是真的很糟糕

### One at a Time and Curry
我们现在来看一个和偏应用(partial application)很类似的技术，该技术将一个期望接收多个参数的函数拆解城连续的链式函数(chained function)，每个链式函数只接收一个单一参数(function.length===1),并返回接收下一个参数的函数。

而这就是柯里化(currying)技术。

在计算机科学中，**柯里化(currying)**,又译为**加里化**，是把接收多个参数的函数变换成接收一个单一参数(最初函数的第一个参数)的函数，并且返回接受余下的参数而且返回结果的心函数的技术。这个技术是由Christopher Strachey以逻辑学家Haskell Brooks Curry命名的，尽管它是Moses Schönfinkel和Friedrich Ludwig Gottlob Frege发明的。

在直觉上，柯里化声称*"如果你固定某些参数，你将得到接受雨轩参数的一个函数"*。例如上面上面提到的`消元`的例子。
从数学的角度来看，柯里化也可以理解为一个逐次消元的过程，把函数的元全消掉，那就可以得到函数的值，值也就是0元函数。

在理论计算机科学中，柯里化提出了简单的理论模型，比如：只接受一个单一参数的lambda演算中，研究带有多个参数的函数的方式。

比如我们有一个函数如下：
``` js
var babyAnimals = function (a, b) {
    var result = 'I love '.concat(a).concat(' and ').concat(b);
    return result
}

var result = babyAnimals('panda', 'sloth')
// I love panda and sloth  
```
那么我们可以把它转换成一个currying(柯里化)函数，如下：
``` js{2-5}
var babyAnimals = function (a) {
    return function (b) {
        var result = 'I love '.concat(a).concat(' and ').concat(b);
        return result;
    }
}

var babyPanda = babyAnimals('panda');
babyPanda('sloth');
// I love panda and sloth  
babyPanda('cat');
// I love panda and cat  
```
`babyAnimals`是一个柯里化的函数，它被设计成了在函数本身完全执行之前，第一个参数已经被**预填充** 了,那么这样带来的显而易见的好处就是,`babyPanda`可以添加别的小动物，可以很方便的表达我除了对panda的爱之外对其他种类小动物的爱。

currying不是原生的JavaScript提供的功能，但是我们可以编写一个(currier)函数把任何给定的函数转换为自己的curried版本，下面是一个简单的实现：
``` js{2,5,7,8}
var currier = function (fn) {
    if (typeof fn !== 'function') {
        throw new Error('Expected the argument to be a function.')
    }
    var args = Array.prototype.slice.call(arguments, 1);

    return function () {
        return fn.apply(this, args.concat(
            Array.prototype.slice.call(arguments, 0)
        ));
    }
}
```
现在我们可以把任何函数作为`currier`函数的参数，来生成函数的柯里化版本。
``` js{7}
var sequence = function (start, end) {
  var result = [];
  for (var i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}
var seq5 = currier(sequence, 3);
seq5(5); // [3,4,5]
```
> 柯里化和偏应用很类似，都可以预填充部分数据，但是，两者的不同之处在于，柯里化函数会明确的返回一个期望**只接收下一个参数**的函数，而偏应用则是返回一个可以**接收余下所有参数**的函数。
>
> 柯里化在每次调用时都会生成嵌套的一元函数。在底层，函数的最终结果是由这些一元函数的逐步组合产生的。同时，柯里化的变体允许同时传递一部分参数。因此，可以完全控制函数求值的时间和方式。
>
> 部门应用将函数的参数与一些预设值绑定(赋值)，从而产生一个拥有更少参数的心函数。该函数的闭包中包含了这些已赋值的参数，在之后的调用中被完全求值。


例如：一个原函数期望接收5个参数，那么这个函数的柯里化形式只会接收第一个参数，并且返回一个用来接收第二个参数的函数。并且这个被返回的函数也只能接收第二个参数，并返回一个接收第三个参数的函数，以此类推；但是这个原函数的偏应用函数，可以先固定前面的某几个参数，然后接收剩下的全部的参数。


### Real World Currying Examples
柯里化技术使用的分厂广泛，通常用于创建可抽象函数行为的函数包装器，可预设其参数或者部门求值。其优势源于具有较少参数的纯函数比较多参数的函数更易使用。两种方法都有助于向函数提供正确的参数，这样函数就不必在减少为一元函数时公然地访问其作用域之外的对象。这种分离参数获取逻辑的方式使得函数具有更好的可重用性。更重要的是，它简化了函数组合。

#### 扩展JavaScript原生对象的方法
``` js
const Log = console.log;

const partial = (fn, ...presetArgs) => {
	const placeholder = '_';

	const bound = function () {

		let position = 0;
		const length = presetArgs.length;
		const args = Array(length);

		for (let i = 0; i < length; i++) {
			args[i] = presetArgs[i] === placeholder ?
				arguments[position++] : presetArgs[i]
		}

		while (position < arguments.length) {
			args.push(arguments[position++])
		}

		return fn.apply(this, args)
	};

	return bound;
}

String.prototype.first = partial(String.prototype.substring, 0, '_');

String.prototype.last = partial(String.prototype.slice, '_');

String.prototype.asName = partial(String.prototype.replace, /(\w+)\s(\w+)/, '$2, $1')

Array.prototype.compute = partial(Array.prototype.map)

Log('abcdef'.first(3).last(-1));

Log('zhao tao'.asName());

Log([1, 2].compute(x => x * 3))
```
#### JavaScript Bind
`Function.prototype.bind()`可以直接实现currying的功能
``` js{4}
var add = function (a, b) {
  return a + b;
}
var inc = add.bind(undefined, 1);
var a = inc(2);  // 3
```

#### React and Redux
[react-redux connect()]()function 也是一个柯里化函数
``` js
export default connect(mapStateToProps)(TodoApp)
```

#### Event Handling
react中事件传参
``` js
const handleChange = (fieldName) => (event) => {
  saveField(fieldName, event.target.value)
}
<input type="text" onChange={handleChange('email')} ... />
```

#### Rendering HTML
``` js
renderHtmlTag = tagName => content => `<${tagName}>${content}</${tagName}>`

renderDiv = renderHtmlTag('div')
renderH1 = renderHtmlTag('h1')

console.log(
  renderDiv('this is a really cool div'),
  renderH1('and this is an even cooler h1')
)
```

### Why Currying and Partial Application?
无论是柯里化风格(`sum(1)(2)(3)`)还是偏应用风格(`partial(sum,1,2)(3)`),它们看起来比原函数还要复杂奇怪很多，那么在函数式编程时，我们为什么要这么做呢？答案有一下几个方面：

首先是显而易见的理由，使用柯里化和便应用可以将指定分离的时机和地方独立开来，而传统的函数调用则需要预先确定所有的尸参。如果你在代码某一处只获取了部分实参，然后在另一处确定部分实参，这个时候柯里化和偏应用就能派上用场。

另一个最能体现柯里化应用的是，当函数只有一个形参的时候，我么能够比较容易的组合它们。因此，如果一个函数最终需要三个实参，那么它被柯里化以后会变成需要三次调用，每次嗲用需要一个实参的函数。当我们组合函数的时候，这种单元函数的形式会让我们处理器来更简单。
