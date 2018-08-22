---
title:  "How To Keep Your Footer At The Bottom Of The Page With CSS"
author: [sylvenas]
categories: 'CSS'
img: './img/2015-06-07.jpeg'
---
如何将`footer`固定在底部是一个非常经典的问题，这个问题 **乍看起来非常简单**，但是实际上相当棘手，在所有的"隐蔽大坑"的难题中，简直就是教科书一般的存在。

而我们想要达成的效果是：
* 1、当页面内容尚未充满的时候，页脚固定在底部。
* 2、页面填充满后，页脚随页面内容的增加而填充在主体内容的下方。

几乎所有的经典的解决方案都是给页脚设置固定的高度，然后按照某些特定的结构来写，可以先来看一下这些经典的解决方案，假定有如下的HTML结构
``` html
<html>
    <body>
        <div class="container">
            <header class="header"> header </header>
            <main class="main">main content</main>
            <footer class="footer"> footer </footer>
        </div>
    </body>
</html>
```
这个时候可以使用如下几种方法的的CSS代码使footer位于底部：
#### 绝对定位方法
通过footer的绝对定位沉底和main的padding-bottom:100px预留出足够的空间防止main的内容过多的时候覆盖footer
``` css
* {
    margin:0;
    padding:0;
}
html,body {
    height: 100%;
}

.container {
    min-height: 100%;
    position: relative;
}

.header{
    height: 100px;
}

.main {
    padding-bottom: 100px;
}

.footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100px;
}
```
#### calc动态计算方法
把main的最小高度设置为：视窗的高度-header高度-footer高度
``` css
* {
    margin: 0;
    padding: 0;
}

.header {
    height: 100px;
}

.main {
    min-height: calc(100vh - 200px);
}

.footer {
    width: 100%;
    height: 100px;
}
```
#### 负margin-top方法
核心是把main的最小高度设置为100%-header的高度，并预留`padding-bottom`的空间，然后通过负margin-top把footer`拉上来`,
``` css
* {
    margin: 0;
    padding: 0;
}

html.body {
    height: 100%;
}

.container {
    height: 100%;
}

.header {
    height: 100px;
}

.main {
    min-height: calc(100vh - 100px);
    padding-bottom: 100px;
}

.footer {
    height: 100px;
    margin-top: -100px;
}
```
总结一下上面的三种办法，都需要把footer,设定为某个固定的高度，如果说想要在footer不固定高度的情况下，纯CSS实现这个效果，在CSS3之前几乎是不可能的。CSS3提出的flex box弹性盒模型，可以解决这个问题，核心就在于让main的grow为1；
``` css
* {
    margin: 0;
    padding: 0;
}

.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}
.main {
    flex-grow: 1;
}
```