---
title: "negative margin"
author: [Sylvenas]
categories: "CSS"
img: './img/2015-07-05.jpeg'
---
作为前端开发人员，我们都在使用margin,不过在使用负margin的时候，有时候会变得非常的头疼，有些人认为负margin是常规武器，有些人确认为负margin是魔鬼的代名词。

常见的negative margin如下：
``` css
.content{
    margin-left:-100px;
}
```
关于negative margin必须有一下几个要点需要澄清：
* **negative margin是一个完全合法的CSS。**W3C里有说明"_Negative values for margin properties are allowed…_",[查看W3C标准](http://www.w3.org/TR/CSS2/box.html#margin-properties)
* **negative margin绝不是黑科技。**有很多不理解负margin作用的人，会认为negative margin 表现的莫名其妙，完全是个黑科技。
* **不影响文档流。**negative margin被应用到元素上的时候，不会破坏正常文档流(当然，元素本身是float元素的除外)。所以被应用negative margin的元素后面的元素也会正常的进行布局
* **negative margin在被应用到正常文档流和float元素上的时候，表现大不一样。**

### negative margin的工作原理

#### negative margin 在普通元素上的表现
![普通元素负边距](../images/negative-margin.gif)
所谓的普通元素，也就是没有被使用`float`属性的元素，上面的图片说明了普通元素是如何被negative margin影响的。

* 当一个普通元素应用了 **top/left** 方向的negative margin的时候，这个时候该元素会被朝着 **top/left**方向推动，举例如下：
``` css
/* 会把mydiv1元素向上移动 10px */
#mydiv1{
        margin-top : -10px;
    }
```
* 但是当一个元素应用了 **bottom/right**方向的negative margin的时候，这个时候该元素却不会想你想象的一样被向 **down/right**方向推动。实际上，它会把相邻的下一个元素`拉向`该元素，并且覆盖该元素，而自己本身不会有任何移动。
``` css
/* 紧邻 mydiv1 的元素会向上移动 10px,但是 mydiv1 本身却没有任何移动 */
#mydiv1{
        margin-bottom : -10px;
    }
```
* 如果元素的宽度是auto,那么给该元素添加`left/right`方向的negative margin，则会增加元素的宽度。

#### negative margin 在浮动元素上的表现
浮动框的上边缘会去贴当前行盒的上边缘或是之前浮动框的下边缘，左浮动框的左边缘会去贴包含框的左边缘，或者他之前的左浮动框的右边缘。如果当前行剩余的空间容不下一个浮动框，他就会换行。（右浮动同理）

一句话描述就是，只要空间够且无阻碍，浮动框边缘一定是要挨着包含框content边缘的。

考虑如下的HTML:
``` html
<div id='mydiv1'>First</div>
<div id='mydiv2'>Second</div>
```
* 第一个元素应用`float:left`,如果应用如下的样式：
``` css
/* A negative margin is applied opposite the float */
#mydiv1 {float:left; margin-right:-100px;}
```
实际上这个时候`mydiv1`的任务会被`mydiv2`的内容完全覆盖住。
* 两个元素都应用`float:left`和`margin-right:-20px`，这个时候`mydiv1`的宽度会比实际宽度小`20px`,但是这个时候有趣的内容是`mydiv1`的内容却不会收到宽度减少的影响。
* 如果negative margin的值等于元素本身的宽度，则这个元素将会被完全覆盖住

#### 对浮动元素的影响
绝对定位的框完全脱离普通流，所以他对其他任何框都不会产生影响，也就意味着，他的margin-left和margin-top会让他左右和上下移动，而margin-right和margin-bottom则不会产生任何影响。

### negative margin的实际应用场景
#### 去除列表的右边框
![网易严选官网](../../images/negative-margin-yanxuan.png)
上面的图片是典型的电商网站的商品展示页面，一般的HTML结构如下
``` html
<div class="container">
    <ul class="list">
        <li>我是一个列表</li>
        <li>我是一个列表</li>
        <li>我是一个列表</li>
        <li>我是一个列表</li>
        <li>我是一个列表</li>
        <li>我是一个列表</li>
        <li>我是一个列表</li>
        <li>我是一个列表</li>
        <li>我是一个列表</li>
        <li>我是一个列表</li>
    </ul>
</div>
```
这个时候就有一个需求就是让每一行的最后一个卡片的`margin-right`重置为0,要不然ul的宽度不够，则第四个元素会被`挤下去`

一般这个时候我们可以使用CSS的`li:nth-child(4n){ margin-right:0 }`选择器，或者使用flex box方案解决，但是这两种都有兼容性的问题。

这个时候negative margin 可以隐式的增加元素宽度的特性就有发挥的空间了,这个时候设置父元素的`margin-right`的`负的li margin-right的值`
``` css
.list{
    margin-right: -10px;
}
```

### Resources
More info on negative margins.

* Search This, [The Positive Side of Negative Margins](http://www.search-this.com/2007/08/01/the-positive-side-of-negative-margins/)
* Severn Solutions, [CSS Negative Margins Algebra](http://www.severnsolutions.co.uk/twblog/archive/2004/07/01/cssnegativemarginsalgebra)
* A List Apart, [Creating Liquid Layouts with Negative Margins](http://www.alistapart.com/articles/negativemargins/)
* W3.org, [Margin Properties](http://www.w3.org/TR/1998/REC-CSS2-19980512/box.html#margin-properties)
* Branbell, [Using Negative Margins](http://www.brainbell.com/tutorials/HTML_and_CSS/Using_Negative_Margins.htm)
* devarticles, [Swapping Column Positions in Web Page Layouts with Negative Margins](http://www.devarticles.com/c/a/Web-Style-Sheets/Swapping-Column-Positions-in-Web-Page-Layouts-with-Negative-Margins/)
* Simplebits, [Exceptionally Negative](http://www.simplebits.com/notebook/2005/05/23/negative.html)
* brunildo, [Horizontal Negative Margins](http://www.brunildo.org/test/NegMOutH.html)
* Ben Nadel, [Negative CSS Margins Are Not Cool](http://www.bennadel.com/blog/1174-Negative-CSS-Margins-Are-Not-Cool.htm)