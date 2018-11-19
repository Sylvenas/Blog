---
title: "webpack svg placeholder loader"
author: [Sylvenas]
categories: 'bundlers'
img: './img/2015-03-25.jpg'
excerpt: '使用webpack loader生成svg placeholder，并在项目的实践'
catalogue: ['svg-placeholder-loader','项目实战','Summary']
---

### svg-placeholder-loader
配合前面写的`webp-loader`,接下来接收到webp-loader传递过来的数据，继续把文件处理成一个svg格式的placeholder。
``` js
var loaderUtils = require("loader-utils");
var validateOptions = require("schema-utils");
var sqip = require("sqip");
var schema = require("./options.json");

// https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
function encodeSvgDataUri(svg) {
    var uriPayload = encodeURIComponent(svg)
        .replace(/%0A/g, "")
        .replace(/%20/g, " ")
        .replace(/%3D/g, "=")
        .replace(/%3A/g, ":")
        .replace(/%2F/g, "/")
        .replace(/%22/g, "'");

    return "data:image/svg+xml," + uriPayload;
}

module.exports = function (source) {
    // 接收webp-loader传递过来的buffer
    var contentBuffer = source.buffer;
    this.cacheable && this.cacheable(true);

    // 获取options并校验
    var options = loaderUtils.getOptions(this) || {};
    validateOptions(schema, options, "SQIP Loader");

    if (contentBuffer) {
        var content = contentBuffer.toString("utf8");
        var filePath = this.resourcePath;
        var contentIsUrlExport = /^module.exports = "data:(.*)base64,(.*)/.test(content);
        //var contentIsFileExport = /^module.exports = (.*)/.test(content);
        var src = "";

        // 对于base64格式的内联图片，不做任何处理，直接返回
        if (contentIsUrlExport) {
            src = content.match(/^module.exports = (.*)/)[1];
            if (options.skipPreviewIfBase64) {
                return 'module.exports = { "originSrc": ' + src + ', "preview": "" };';
            }
        }
        // svg格式的图片也不做处理，直接返回(svg不需要placeholder)
        if (filePath.split('.').pop() === 'svg') { 
            return 'module.exports = { "originSrc":__webpack_public_path__ +"' + source.url + '", "preview": "" };';
        }
    }
    // 处理loader options
    var numberOfPrimitives = "numberOfPrimitives" in options ? parseInt(options.numberOfPrimitives, 10) : 20;
    var mode = "mode" in options ? parseInt(options.mode, 10) : 0;
    var blur = "blur" in options ? parseInt(options.blur, 10) : 12;
    // 生成svg格式的占位符图片
    var sqipResult = sqip({
        filename: filePath,
        numberOfPrimitives: numberOfPrimitives,
        mode: mode,
        blur: blur
    });
    var encodedSvgDataUri = encodeSvgDataUri(sqipResult.final_svg);
    var dimensions = JSON.stringify(sqipResult.img_dimensions)
    // 拼接需要返回的module
    return 'module.exports = {' +
        '"originSrc": __webpack_public_path__ + "' + source.url +
        '" , "webpSrc": __webpack_public_path__ + "' + source.webpUrl +
        '" , "preview": "' + encodedSvgDataUri +
        '", "dimensions": ' + dimensions +
        ' };';
};
```
### 项目实战
一张原图片在经过`webp-loader`，`svg-placeholder-loader`的处理之后，最终导出的图片数据为：
``` js
import girl from './girl.jpeg';

console.log(girl)

// {
//     dimensions: {height: 1002, width: 668, type: "jpg"},
//     originSrc: "/static/media/girl.jpeg",
//     preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='........'",
//     webpSrc: "/static/media/girl.jpeg.webp",
// }
```
配合实际的React项目(绝不仅限于React项目，同样适用于Vue,Jquery的项目)来用就是：
webpack.config.js 配置：
``` js
{
    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
    use: [
        {
        loader: path.resolve('./picture-loader/svg-placeholder-loader.js'),
        options: {
            numberOfPrimitives: 20,
            }
        },
        {
        loader: path.resolve('./picture-loader/webp-loader.js'),
        options: {
            limit: 1000,
            name: 'static/media/[name].[ext]',
            },
        },
    ]
}
```
``` js
import girl from './girl.jpeg';

class App extends Component {
  render() {
    return <Picture img={girl} alt='my girl' className='my-girl' />
  }
}

export default App;

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import './picture.css'

class Picture extends PureComponent {
    constructor() {
        super();
        this.svg = React.createRef();
    }
    handleImgLoad = (event) => {
        this.svg.current.style.opacity = 0;
        event.target.style.opacity = 1;
    }
    render() {
        const { img, alt, className } = this.props;
        return (
            <div className='picture'>
                <img src={img.preview}
                    alt={alt}
                    className={'svg ' + className}
                    ref={this.svg} />
                <picture>
                    <source srcSet={img.webpSrc}
                        type="image/webp"/>
                    <img onLoad={this.handleImgLoad}
                        src={img.originSrc}
                        alt={alt}
                        className={'img ' + className}
                    />
                </picture>
            </div>
        )
    }
}

Picture.propTypes = {
    img: PropTypes.shape({
        preview: PropTypes.string.isRequired,
        originSrc: PropTypes.string.isRequired,
        webpSrc: PropTypes.string.isRequired,
    }),
    alt: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
}

export default Picture;
```

### Summary
经过上面的学习，webpack loader从开发到实战都应该有了一个清晰的认识,并且有了在项目中实战的例子

不过不得不说的是，使用loader一方面会方便我们处理图片，另一方面也会降低项目启动和打包的速度(尽管充分利用了异步和缓存)，我还是更倾向于配合gulp的watch功能，监听图片的新增实现图片的转换，会大大的提高webpack的处理速度。