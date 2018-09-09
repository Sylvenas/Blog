---
title:  "Ajax call when session time out"
author: [Sylvenas]
categories: 'http'
img: './img/2015-03-25.jpg'
---
### 1.问题重新
通过ajax请求后端数据的时候，如果后端返回的状态吗是302，则约定为登陆过期，需要跳转到登录页，重新登录，前端代码如下：
``` javascript
axios.interceptors.response.use(function(res) {
    // 判断登录状态是否过期
    if (res.data.result == 302) {
        //跳转到登陆界面
        //...
    }
    return res;
}, function(error) {
    return Promise.reject(error);
});
```
这个逻辑看上去没有问题，但是在IE浏览器下会出现BUG,现象是跳转到登录页，登陆之后，会再次调转到登录页，问题的原因就在于，IE浏览器缓存了上次的get请求的返回值，那么就会进入是否过期的判断，然后就会再次跳转到登录页。

### 2.解决方案

#### 1.axios
给每一个get请求增加一个时间戳,在axios请求之前进行添加
``` javascript
 axios.interceptors.request.use(function (config) {
    if (config.method === 'get') {
        Object.assign(config.params, { date: Date.parse(new Date()) / 1000 })
    }
    return config;
}, function (error) {
    // Do something with request error 
    return Promise.reject(error);
});
```
#### 2.jQuery
``` javascript
$.ajaxSetup({
    cache: false
})
```

