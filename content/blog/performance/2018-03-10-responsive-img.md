---
title: "web image 加载优化方案--responsive-image"
author: [Sylvenas]
categories: "性能优化"
img: "./img/2018-03-10.jpeg"
---

所谓响应式的图片，就是让我们在不同的平台，不同的设备上使用的图片都不一样，设计师切图给我们的时候，一般都会把给我 1x,2x,3x,4x 的图片，有的时候，那么这几张图片我们该怎么使用呢？

这个时候就会有 HTML5 的 img,[srcset](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/img)属性出场的时候到了，srcset 可以让我们支持在一个 img 元素中预设多张图片，方便浏览器在不同的设备中选择最合适的那一张图片。

```html
<img src="small.jpg" srcset="medium.jpg 1000w, large.jpg 2000w" alt="yah" />
```

简单介绍一个 srcset 的使用方法：
以逗号分隔的一个或多个字符串列表表明一系列用户代理使用的可能的图像。每一个字符串由以下组成：

- 一个图像的 URL。
- 可选的，空格后跟以下的其一：

  - 一个宽度描述符，这是一个正整数，后面紧跟`'w'`符号。该整数宽度除以 sizes 属性给出的资源(source)大小来计算得到有效的像素密度，即换算成和 x 描述符等价的值。
  - 一个像素密度描述符，这是一个正浮点数，后面紧跟`'x'`符号。

- 如果没有指定源描述符，那它会被指定为默认的`1x`。

- 在相同的`srcset`属性中混合使用宽度描述符和像素密度描述符时，会导致该值无效。重复的描述符（比如，两个源 在相同的 srcset 两个源都是 '2x'）也是无效的。

### 第二个参数的说明

#### 如果为 1x，2x，3x 之类的

1x 表示是一倍屏，也是最常见的一种电脑屏幕了，2x 表示的两倍屏，一般现在 apple 的 macbook 都是两倍屏，现在新的手机，会出现 3 倍屏，4 倍屏之类的，这个很好理解，

#### 如果第二为 w 的应当如何理解

举例来说明：
如果我们要显示一张图片为 320px 宽度在 1x 屏幕上，并且我们现在手中有三张图片，分别是 small.jpg(500px wide),middle.jpg(1000px wide), large.jpg (2000px wide)。

那个浏览器该如何判断选用哪一张图片呢？先做个简单的计算
500 / 320 = 1.5625
1000 / 320 = 3.125
2000 / 320 = 6.25

如果是 1x 的屏幕，那么 1.5625 是最接近的一张，尽管这张图片`分辨率`也有一点点高,但是却是这三张图片里面最合适的了。

如果是 2x 的屏幕，尽管 1.5625 还是最接近的一张图片，但是这张图片对于 2x 的屏幕来说却是有一点不够清楚，会让用户觉得图片有点模糊，那么很明显这个时候 3.125 是更好的选择

#### Also, sizes

还有一个与`srcset`属性配合使用 sizes 属性，
表示资源大小的以逗号隔开的一个或多个字符串。每一个资源大小包括：

- 一个媒体条件。最后一项一定是被忽略的。
- 一个资源尺寸的值。

资源尺寸的值被用来指定图像的预期尺寸。当 srcset 使用 'w' 描述符时，用户代理使用当前图像大小来选择 srcset 中合适的一个图像 URL。 被选中的尺寸影响图像的显示大小（如果没有 CSS 样式被应用的话）。如果没有设置 srcset 属性，或者没值，那么 sizes 属性也将不起作用。

其实 sizes 属性并没有那么的必要，有时候使用起来或许还有点危险，因为这是相当于把 CSS 的一部分功能放进了 HTMl 标记中，举例来说：

`sizes="(min-width: 800px) 50vw, 100vw"`

这个属性的意思是，如果浏览器的窗口大于等于 800px 的情况下，那么该图片应该显示视口的一半宽度，否则应当显示为满屏。

#### Responsive&Webp images in HTML

最基本的`img`标签又一个`src`属性可以指向图片的 URL:

```html
<img src="image.jpg" alt="image description" />
```

但是你可以更进一步使用`srcset`属性，根据不同屏幕的像素密度因子制定不同清晰度的图片：

```html
<img srcset="image_1x.jpg 1x, image_2x.jpg 2x" src="image_1x.jpg" />
```

我们使用了两种不同的像素密度因子：`1x`和`2x`,根据实际的硬件设备，浏览器会选择正确的那个，同时使用`src`属性指向回退选项。

目前除了 IE,Edge 之外的大多数浏览器都实现了`srcset`属性。

但是对于相同的像素密度因子，无论显示大小如何，你的浏览器都会选择相同的图片，不过有时候我们却想在 web 端显示大而清晰的图片，而在手机端的时候，我们要选择小而清晰的图片。

`srcset`属性除了能接受像素密度因子，之外，还可以接受宽度单位`w`,相当于 CSS 像素。使用宽度，可以使浏览器能够显示我们想要的正确的图像。

```html
<img
  srcset="image-sm.jpg 600w, image-md.jpg 900w, image-lg.jpg 1440w"
  src="image_1x.jpg"
/>
```

但是这里又一个问题就是，有了宽度浏览器去决定要获取哪一个图片的时候，它还不知道我们的 CSS 设置，因为在这个时候，CSS 文件还没有请求到，这个时候浏览器只能假设我们要显示一个全宽的图片。

如果全宽的图像正是你想要的，那么 OK！但是如果你只想在一个`50vw`宽度的容器内显示图像呢，那么`sizes`属性可以为你解决这个问题

```html
<img
  srcset="image-sm.jpg 600w, image-md.jpg 900w, image-lg.jpg 1440w"
  sizes="50vw"
  src="image_1x.jpg"
/>
```

通过添加`sizes=50vw`属性，我们告诉浏览器图片将会被渲染在`50vw`的宽度内，基于这个信息，浏览器可以选择使用哪张图片了

但是如果你想在一个大屏幕上使用`50vw`来展示一张图片，然后在手机端使用`100vw`全屏来展示一张图片，这个时候该怎么做呢，`sizes`属性还支持媒体查询

你可以在`600px`一下的时候，使用全屏宽度来展示图片，如果宽度超过`600px`，就可以使用`50vw`来展示图片。

```html
<img
  srcset="image-sm.jpg 600w, image-md.jpg 900w, image-lg.jpg 1440w"
  size="(max-width: 600px) 100vw, 50vw"
  src="image_1x.jpg"
/>
```

这个解决方案，看上去很不错啦，不过我们发现我们的像素密度因子去哪了？如果我们使用上面的方案，我们会在`1x`和`2x`的屏幕上选择相同的图片。

<h4>picture元素</h4>

HTML5 的`picture`元素可以接受`source`和`img`元素作为子元素，我们可以使用`source`元素列出来我们想要提供给浏览器的其他图片。

```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" type="image/jpeg" alt="image description" />
</picture>
```

让我们在`picture`元素中添加`source`元素作为`WebP`格式的第一个选项，然后是指向常规 JPG 图像的`img`。 现在，当浏览器不支持 WebP 时，它将优雅地回退到`img` 元素(例如 Safari)。
`source`元素向我们打开了一个新世界，它可以接受媒体查询，首先在`media`属性中，我们使用媒体查询，然后在`srcset`属性中，放置合适的图像，尽可能的使用`source`元素增加我们的选项

```html
<picture>
  <source media="(min-width: 900px)" srcset="image-lg.webp" type="image/webp" />
  <source media="(min-width: 600px)" srcset="image-md.webp" type="image/webp" />
  <source srcset="image-sm.webp" type="image/webp" />
  <img src="image-lg.jpg" type="image/jpeg" alt="image description" />
</picture>
```

上面我们已经准备了三个 WebP 格式的图像，这取决于显示器的大小，并且一个 JPG 图像作为回退选项。

`srcset`属性的最后一个秘密是它也接受像素密度因子，我们可以决定在哪个屏幕上以及在哪个像素密度因子下提供不同的图像。方法就是在图像的`srcset`中，后跟一个空格和像素密度因子，例如：`1x`,`2x`,`3x`,`4x`.

```html
<picture>
  <source
    media="(min-width: 900px)"
    srcset="image-lg_1x.webp 1x, image-lg_2x.webp 2x"
    type="image/webp"
  />
  <source
    media="(min-width: 601px)"
    srcset="image-md_1x.webp 1x, image-md_2x.webp 2x"
    type="image/webp"
  />
  <source
    media="(max-width: 600px)"
    srcset="image-sm_1x.webp 1x, image-sm_1x.webp 1x"
    type="image/webp"
  />
  <img src="image-lg_1x.jpg" type="image/jpeg" alt="image description" />
</picture>
```

上面我们使用了 WebP 格式的图片和像素密度因子，但是有些浏览器不支持 WebP 格式，我们必须在`img`标签内设置回退选项。

```html
<picture>
  <source
    media="(min-width: 900px)"
    srcset="image-lg_1x.webp 1x, image-lg_2x.webp 2x"
    type="image/webp"
  />
  <source
    media="(min-width: 601px)"
    srcset="image-md_1x.webp 1x, image-md_2x.webp 2x"
    type="image/webp"
  />
  <source srcset="image-sm_1x.webp 1x, image-sm_2x.webp 2x" type="image/webp" />
  <img
    srcset="image-sm_1x.jpg 600w, image-md_1x.jpg 900w, image-lg_1x.jpg 1440w"
    src="image_lg_1x.jpg"
    type="image/jpeg"
    alt="image description"
  />
</picture>
```

我们用`picture`元素替换了`img`元素。在可能的情况下，我们希望根据显示尺寸和 2 种不同的像素密度，以三种不同的大小提供 WebP 格式的图像。如果览器不支持 `picture`元素或`WebP`格式，它将回落到具有三种不同大小`JPG`的标准`img`元素。

> 请注意，在`img`元素中，`srcset`属性应放置在`src`属性之前。否则，浏览器会首先下载`src`图像，如果在`srcset`中找到了更好的图像，它也会下载这个图像。这样我们最终会得到两个图像。

#### How To Use Responsive Images In CSS

借助 less 等预编译语言，配合 webp 是否支持的方案，可以写出如下代码：

```less
.retinabg(@file-2x; @reg-2x; @reg-1x; @type) when (isstring(@reg-2x)) {
  background-image: url("@{file-2x}.@{reg-1x}.@{type}");
  .webpa & {
    background-image: url("@{file-2x}.@{reg-1x}.@{type}.webp");
  }
  @media only screen and (min-device-pixel-ratio: 2),
    only screen and (min-resolution: 192dpi),
    only screen and (min-resolution: 2dppx) {
    background-image: url("@{file-2x}.@{reg-2x}.@{type}");
    .webpa & {
      background-image: url("@{file-2x}.@{reg-2x}.@{type}.webp");
    }
  }
}

.retinabg-test {
  .retinabg("./bg.jpg", "2x", "1x", "jpg");
}
```

编译之后的结果为：

```css
.retinabg-test {
  background-image: url("./bg.jpg.1x.jpg");
}
.webpa .retinabg-test {
  background-image: url("./bg.jpg.1x.jpg.webp");
}
@media only screen and (min-device-pixel-ratio: 2),
  only screen and (min-resolution: 192dpi),
  only screen and (min-resolution: 2dppx) {
  .retinabg-test {
    background-image: url("./bg.jpg.2x.jpg");
  }
  .webpa .retinabg-test {
    background-image: url("./bg.jpg.2x.jpg.webp");
  }
}
```

#### How To Generate Reponsive Images

上面提到了不同屏幕，尺寸，格式下的图片都需要不同的图片，不过设计师一般给我们的都是一张图片，应当如何处理呢，特别是存在大量图片的时候，我们需要一个能够批量处理图片的工具。

我们可以选择支持三个分界线的图片：`600px`,`900px`,`1440px`和两种像素密度因子(用来支持 retina 屏和普通屏)，这样就是由原来的一张图片转换为了 6 张图片，同时我们要尽可能的支持 WebP,那么这时候，就是 12 张图片了。

[ImageMagic](http://www.imagemagick.org/script/index.php)和[GraphicsMagick](http://www.graphicsmagick.org/)都是免费且强大的图片处理工具，并且现在都有 node.js 的版本，这是我们前端开发工程师擅长的领域。

[gm](https://github.com/aheckmann/gm)就是 node.js 版本的 GraphicsMagick,使用方法如下：
首先安装 GraphicsMagick 和 ImageMagick

```
brew install graphicsmagick
brew install imagemagick --with-webp
```

然后安装 gm:

```
npm install gm
```

然后我们就可以写代码批量处理某个文件夹的所有文件, gm 的 [API](http://aheckmann.github.io/gm/)很简单，直接看文档就可以了，不再具体说明。

```js
const fs = require("fs");
var path = require("path");

var gm = require("gm"),
  dir = __dirname + "/imgs",
  imageMagick = require("imagemagick");

var filePath = path.resolve("./imgs");

fs.readdir(filePath, function(err, files) {
  if (err) {
    console.warn(err);
  } else {
    //遍历读取到的文件列表
    files.forEach(function(filename) {
      //获取当前文件的绝对路径
      var filedir = path.join(filePath, filename);
      //根据文件路径获取文件信息，返回一个fs.Stats对象
      fs.stat(filedir, function(eror, stats) {
        if (eror) {
          console.warn("获取文件stats失败");
        } else {
          var isFile = stats.isFile(); //是文件
          if (isFile) {
            var name = filename.split(".")[0];
            var type = filename.split(".")[1];
            const createFun = createResponsiveImgs(filedir, name, type);
            createFun(200, "sm", "1x");
            createFun(400, "sm", "2x");
            createFun(400, "md", "1x");
            createFun(800, "md", "2x");
            createFun(800, "lg", "1x");
            createFun(1600, "lg", "2x");
          }
        }
      });
    });
  }
});

function createResponsiveImgs(filePath, fileName, fileType) {
  return function(size, name, density) {
    const file = gm(filePath);
    file
      .resize(size)
      .write(`resImg/${fileName}_${name}_${density}.${fileType}`, err => {
        if (err) return console.log(err);

        imageMagick.convert(
          [
            `resImg/${fileName}_${name}_${density}.${fileType}`,
            `resImg/${fileName}_${name}_${density}.webp`
          ],
          err => {
            if (err) throw err;
            console.log(fileName + "创建成功");
          }
        );
      });
  };
}
```

原文件的图像都在 imgs 文件夹内，新生成的图像在 resImg 文件夹内，新生成的图像具有一下命名结构：

**originName _ description _ density.type**

在我的项目中，原图片的大小为 486kb,新生成的 12 个图片中，最大的为 124kb,最小的为 7kb,这样计算的话，我们减少了`4-70`倍的大小，对于网速加载速度而言，自然会快很多，尤其是在不同的终端，不同的分辨率之下！
