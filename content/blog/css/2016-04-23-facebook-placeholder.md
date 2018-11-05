---
title:  "facebook placeholder"
author: [sylvenas]
categories: 'CSS'
img: './img/2016-04-23.jpeg'
---
偶然间看到facebook的网页版和手机版在网速比较慢的时候，都会有一个`loading`的过程，但是这个loading,完全不同于一般的一个小圈圈在页面上转，而是如下的一个`占位`+`动画`：
<div style="text-align:center;margin-top:20px" align="center">
  <img style="height:200px;" src="../../images/facebook-placeholder.gif" />
</div>

经过在一番搜索和实践之后，找到了两种常见的实现方法：
### 空余background方法
先看一下效果，可以完美的实现和facebook一样的效果：  
<div style="text-align:center;margin-top:20px" align="center">
  <img style="height:200px;" src="../../images/facebook-placeholder.gif" />
</div>
看看代码：
``` html
<div className='app-wrap'>
    <div className="animated-background">
        <div>
            <div className="background-masker header-top"></div>
            <div className="background-masker header-left"></div>
            <div className="background-masker header-right"></div>
            <div className="background-masker header-bottom"></div>
        </div>
        <div>
            <div className="background-masker subheader-left"></div>
            <div className="background-masker subheader-right"></div>
            <div className="background-masker subheader-bottom"></div>
        </div>
        <div>
            <div className="background-masker content-top"></div>
            <div className="background-masker content-first-end"></div>
            <div className="background-masker content-second-line"></div>
            <div className="background-masker content-second-end"></div>
            <div className="background-masker content-third-line"></div>
            <div className="background-masker content-third-end"></div>
        </div>
    </div>
</div>
```

``` css
.app-wrap{
  margin-top:100px;
  margin-left: 200px;
  border:1px solid #345;
  padding: 20px;
  width:500px;
  position: relative;
  }
@keyframes placeHolderShimmer{
    0%{
        background-position: -468px 0
    }
    100%{
        background-position: 468px 0
    }
}

.animated-background {
    animation-duration: 1s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: placeHolderShimmer;
    animation-timing-function: linear;
    background: #f6f7f8;
    background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
    background-size: 800px 104px;
    height: 96px;
    width:100%;
    position: relative;
}


.background-masker {
    background: #fff;
    position: absolute;
}

/* Every thing below this is just positioning */

.background-masker.header-top,
.background-masker.header-bottom,
.background-masker.subheader-bottom {
    top: 0;
    left: 40px;
    right: 0;
    height: 10px;
}

.background-masker.header-left,
.background-masker.subheader-left,
.background-masker.header-right,
.background-masker.subheader-right {
    top: 10px;
    left: 40px;
    height: 8px;
    width: 10px;
}

.background-masker.header-bottom {
    top: 18px;
    height: 6px;
}

.background-masker.subheader-left,
.background-masker.subheader-right {
    top: 24px;
    height: 6px;
}


.background-masker.header-right,
.background-masker.subheader-right {
    width: auto;
    left: 300px;
    right: 0;
}

.background-masker.subheader-right {
    left: 230px;
}

.background-masker.subheader-bottom {
    top: 30px;
    height: 10px;
}

.background-masker.content-top,
.background-masker.content-second-line,
.background-masker.content-third-line,
.background-masker.content-second-end,
.background-masker.content-third-end,
.background-masker.content-first-end {
    top: 40px;
    left: 0;
    right: 0;
    height: 6px;
}

.background-masker.content-top {
    height:20px;
}

.background-masker.content-first-end,
.background-masker.content-second-end,
.background-masker.content-third-end{
    width: auto;
    left: 380px;
    right: 0;
    top: 60px;
    height: 8px;
}

.background-masker.content-second-line  {
    top: 68px;
}

.background-masker.content-second-end {
    left: 420px;
    top: 74px;
}

.background-masker.content-third-line {
    top: 82px;
}

.background-masker.content-third-end {
    left: 300px;
    top: 88px;
}
```

可以看出上面的实现方法，不是把我们要展现的元素，显示出来，而是反其道而行之，写出我们想要的元素周边的所有空隙，把我们想要的元素预留出来，用来播放`background`的动画，是不是很奇妙。

很明显这种效果是最棒的，但是这种写法却很费时间，有时候我们要展现的元素比较复杂的时候，我们很难实现，那么有没有一种稍微简单一点的方法呢，这就是下面要说的`纯backgound动画`

### 纯background动画
先看一下效果：
<div style="text-align:center;margin-top:20px" align="center">
  <img style="height:200px;" src="../../images/facebook-placeholder-02.gif" />
</div>

看看代码实现：
``` html
<div className='app-wrap'>
    <div>
        <div className='animation-pluse header-author'></div>
        <div className='animation-pluse header-title1'></div>
        <div className='animation-pluse header-title2'></div>
    </div>
    <div>
        <div className='animation-pluse content-1'></div>
        <div className='animation-pluse content-2'></div>
        <div className='animation-pluse content-3'></div>
    </div>
</div>
```
样式：
``` css
.animation-pluse{
  animation: pulse 1.5s infinite ease-in-out;
}
@keyframes pulse {
  0%{
    background-color: rgba(165,165,165,.1)
  }
  50%{
    background-color: rgba(165,165,165,.3)
  }
  100%{
    background-color: rgba(165,165,165,.1)
  }
}

.header-author{
  height:40px;
  width:40px;
  display: inline-block;
}
.header-title1{
  height:8px;
  width:250px;
  display: inline-block;
  position: absolute;
  top: 30px;
  left: 70px;
}
.header-title2{
  height: 6px;
    width: 200px;
    display: inline-block;
    position: absolute;
    top: 50px;
    left: 70px;
}
.content-1{
    height: 8px;
    width: 380px;
    margin-top:10px;
}
.content-2{
    height: 8px;
    width: 420px;
    margin-top:10px;
}
.content-3{
    height: 8px;
    width: 300px;
    margin-top:10px;
}
```
可以看出这个是一个缓慢的闪烁的效果，虽然不如第一种方法漂亮，不过可以使用原有的html结构和通过删除css等方式来控制`placeholder`和实际content之间的切换