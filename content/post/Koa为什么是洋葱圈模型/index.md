---
slug: koa-onion-model
title: koa为什么是洋葱圈模型
date: 2022-03-29
description: koa为什么是洋葱圈模型
tags:
  - koa
---

![](/post-imgs/koa洋葱.png)

koa 的洋葱圈模型指的是它中间件里 next 方法前后代码的执行顺序，会倒回来执行，例如：

先自定义两个中间件：

**logTime：打印时间戳**

```js
module.exports = function () {
  return async function (ctx, next) {
    console.log('next前，打印时间戳:', new Date().getTime())
    await next()
    console.log('next后，打印时间戳:', new Date().getTime())
  }
}
```

**logUrl：打印路由**

```js
module.exports = function () {
  return async function (ctx, next) {
    console.log('next前，打印url:', ctx.url)
    await next()
    console.log('next后，打印url:', ctx.url)
  }
}
```

在 index.js 中 use：

```js
const Koa = require('koa')
const app = new Koa()

const logTime = require('./middleware/logTime')
const logUrl = require('./middleware/logUrl')

// logTime
app.use(logTime())

// logUrl
app.use(logUrl())

// response
app.use(async (ctx) => {
  ctx.body = 'Hello World'
})

app.listen(3000)
```

打印顺序会是:

1. next 前，打印时间戳
2. next 前，打印 url
3. next 后，打印 url
4. next 前，打印时间戳

**为什么 koa 要这么设计**

正常不应该是中间件按顺序从开始到结束执行吗？

确实，如果说使用中间件的场景不存在前后依赖的情况，从头到尾按顺序链式调用完全没问题。但如果存在依赖的情况呢？**如果只链式执行一次，怎么能让前面的中间件能使用之后的中间件所添加的东西呢？**

比如上面两个例子，我在 logUrl 的中间件里，对 url 进行了处理，加上了一个时间戳，然后我想在 logTime 的中间件里拿到这个时间戳并打印

如果只链式执行一次的话，显然无法实现

### 实现思路

假设我们有 3 个 async 函数:

```js
async function m1(next) {
  console.log('m1')
  await next()
}

async function m2(next) {
  console.log('m2')
  await next()
}

async function m3() {
  console.log('m3')
}
```

我们希望能够构造出一个函数，实现的效果是让三个函数依次执行。首先考虑想让 m2 执行完毕后，`await next()`去执行 m3 函数，那么显然，需要构造一个 next 函数，作用是调用 m3，然后作为参数传给 m2

```js
let next1 = async function () {
  await m3()
}

m2(next1)

// 输出：m2,m3
```

进一步，考虑从 m1 开始执行，那么，m1 的 next 参数需要是一个执行 m2 的函数，并且给 m2 传入的参数是 m3,下面来模拟：

```js
let next1 = async function () {
  await m3()
}

let next2 = async function () {
  await m2(next1)
}

m1(next2)

// 输出：m1,m2,m3
```

那么对于 n 个 async 函数，希望他们按顺序依次执行呢？可以看到，产生 nextn 的过程能够抽象为一个函数：

```js
function createNext(middleware, oldNext) {
  return async function () {
    await middleware(oldNext)
  }
}

let next1 = createNext(m3, null)
let next2 = createNext(m2, next1)
let next3 = createNext(m1, next2)

next3()
```

进一步精简：

```js
let middlewares = [m1, m2, m3]
let len = middlewares.length

// 最后一个中间件的next设置为一个立即resolve的promise函数
let next = async function () {
  return Promise.resolve()
}
for (let i = len - 1; i >= 0; i--) {
  next = createNext(middlewares[i], next)
}

next()

// 输出m1, m2, m3
```

Ok，大功告成 🎉koa 的智慧用这么简短的代码就实现了，你悟到了吗？
