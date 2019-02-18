---
title: "FP18：Semigroup"
author: [Sylvenas]
categories: "functional"
img: './img/2018-12-13.jpeg'
excerpt: '所谓`Semigroup`(半群)，其实就是含有concat方法的数据类型，典型的如字符串和数组...'
---
所谓`Semigroup`(半群)，其实就是含有concat方法的数据类型，典型的如字符串和数组，看代码：
``` js
const resStr = 'a'.concat('b').concat('b') 
// => 'abc'

const resArr = [1,2].concat([3,4]).concat([5,6])
// => [1,2,3,4,5,6]
```
实际上，我们还可以发现一个规律`Semigroup`是可以随意的合并操作的，什么意思呢？
``` js
const resStr = 'a'.concat('b'.concat('b'))
// => 'abc'

const resArr = ([1,2].concat([3,4])).concat([5,6])
// => [1,2,3,4,5,6]
```
无论前后的顺序如何，或者无论怎么组合，得到的结果是一致的。
完全类似于数据的加法运算：
``` js
1 + 2 + 3 
(1 + 2) + 3
1 + (2 + 3)
```
但是我们却不能直接使用`1.concat(2).concat(3)`这样的代码，因为number并没有实现`concat`方法，但是我们可以自己简单实现一个Sum的`Semigroup`。
``` js
const Sum = x => ({
    x,
    concat: ({ x: y }) =>
        Sum(x + y),
    inspect: () =>
        `Sum(${x})`
})
Sum.empty = () => Sum(0)
```
现在就可以直接这样使用Sum了：
``` js
const res1 = Sum(1).concat(Sum(2)).concat(Sum(3)).concat(Sum.empty())
// => Sum(6)
const res2 = Sum(1).concat(Sum(2).concat(Sum(3)))
// => Sum(6)
```
Sum的使用场景不是很多，仅仅是为了学习而建立的，下面看几个使用场景比较多的`Semigroup`
* All:
``` js
true && true  // true
true && false // false
{
    const All = x => ({
        x,
        concat: ({ x: y }) =>
            All(x && y),
        inspect: () =>
            `All(${x})`
    })
    
    All.empty = () => All(true)

    const res = All(true).concat(All(true)).concat(All.empty())
    console.log(res)
}
```
* First:
``` js
{
    const First = x => ({
        x,
        concat: _ =>
            First(x),
        inspect: () =>
            `First(${x})`
    })

    const res = First('bob').concat(First('smith'))
    console.log(res)
}
```
* Max & Min
``` js
{
    const Max = x => ({
        x,
        concat: ({ x: y }) =>
            Max(x > y ? x : y),
        inspect: () =>
            `Max(${x})`
    })

    Max.empty = () => Max(-Infinity)

    const Min = x => ({
        x,
        concat: ({ x: y }) =>
            Min(x < y ? x : y),
        inspect: () =>
            `Min(${x})`
    })

    Min.empty = () => Min(Infinity)
}
```

* Either
``` js
const Right = x =>
    ({
        chain: f => f(x),
        ap: other => other.map(x),
        traverse: (of, f) => f(x).map(Right),
        map: f => Right(f(x)),
        fold: (f, g) => g(x),
        concat: o =>
            o.fold(_ => Right(x),
                y => Right(x.concat(y))),
        inspect: () => `Right(${x})`
    })
const Left = x =>
    ({
        chain: f => Left(x),
        ap: other => Left(x),
        traverse: (of, f) => of(Left(x)),
        map: f => Left(x),
        fold: (f, g) => f(x),
        concat: o =>
            o.fold(_ => Left(x),
                y => o),
        inspect: () => `Left(${x})`
    })
const fromNullable = x =>
    x != null ? Right(x) : Left(null)
const tryCatch = f => {
    try {
        return Right(f())
    } catch (e) {
        return Left(e)
    }
}
// List from https://github.com/DrBoolean/immutable-ext
const stats = List.of({page:'home', view: 40},
                    {page:'about', view: 40},
                    {page:'blog'})
state.foldMap(x => 
        fromNullable(x.views).map(Sum),
        Right(Sum.empty()))
```
