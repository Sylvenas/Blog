---
title: "Argument vs Parameter"
author: [Sylvenas]
categories: "JavaScript"
img: './img/2015-09-23.jpeg'
---
### Argument vs Parameter
在试用函数的时候常常遇到这两个名词，翻译上有很多种，常见的有`形参`和`实参`却让挺多的人容易混淆，为了以后的清晰明了，做个总结😄。

引用[stack overflow](https://stackoverflow.com/questions/1788923/parameter-vs-argument/1788926#1788926)上的回答，

> An argument is an expression used when calling the method.

> A parameter is the variable which is part of the method's signature (method declaration).

那么翻译过来就是:

> Argument 是用于调用函数的具体的数据

> Parameter 是函数签名的一部分，是函数的描述的一部分

抛弃了以前的`形参`和`实参`，在函数调用的时候把`实参`赋值给`形参`的描述，来单纯的理解，`Argument`就是函数调用的时候的具体参数，`Parameter`就是函数的描述的一部分。

实际上在JavaScript中也没有函数签名这一说法，因为函数签名是用来做参数类型检查，重载等等，而这些JavaScript根本就没有，在使用参数的时候只需要遍历`arguments`这个类数组对象就可以了。