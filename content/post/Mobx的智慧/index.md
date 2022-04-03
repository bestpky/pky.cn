---
title: Mobx的智慧
date: 2022-03-31
description: Mobx的智慧
tags:
  - Mobx
  - 依赖收集
---

先看调用：

```js
import { autorun, observable } from 'mobx'

const obj = { a: 1 }
const observedObj = observable(obj)
autorun(() => {
  console.log(observedObj.a)
})

observedObj.a = 2 // 2
```

对象obj**被观察**`(observable)`了，**修改**`(set)`属性a，会触发`autorun`里**使用到了**`(get)`属性a的函数的执行。

怎么做到的？

这里有一个**依赖收集**的概念，mobx和vue都有这个概念，什么是依赖收集？

你可以理解成，`autorun`函数就是在做依赖收集，它的参数是一个函数，这个函数里**使用到了**对象的某些属性，触发了`[getter]`操作，在`[getter]`操作里做什么呢？把这个函数放进发布订阅的队列中，等到触发了`[setter]`操作时再执行。

说得简单点就是上面这样，其实就是利用了`Object.defineProperty`或ES6的`proxy`，再加上发布订阅，就这么简单。

拿`proxy`来举例，依赖收集是这样做的：

```js
const observable = obj => {
    return new Proxy(obj, {
        get: (target, key) => {
            if (typeof target[key] === 'object') {
              	// 嵌套对象用递归
                return observable(target[key])
            } else {
                // 这里面去做依赖收集
              	// some code...
                return target[key]
            }
        },
    }
}
```

前面说了依赖收集的逻辑里用发布订阅，你可能有疑问，发布订阅里做订阅需要一个string或number类型的id，像这样：

```js
const em = new EventEmitter()
em.on(id, func)
```

那这里哪来这个`id`？你可能第一时间想到的是对象的`key`，但嵌套对象的情况有可能`key`相同，那么`id`就不唯一，所以不能用对象的`key`

那么在`proxy`的`get`方法里，除了能拿到对象的`key`，还能拿到什么，`target`!

也就是这个对象，对象是一定不`===`的啊，但对象又不能做`em.on(id, func)`的`id`，你可能想到全局维护一个**自增**的`id`和一个**字典**来关联`id`和`target`的每个`key`，用**对象**做**字典**的`key`，很容易想到这个**字典**就是一个`Map`结构啦，最好用`WeakMap`，避免性能问题，像这样：

```js
const map = new WeakMap()
map.set(target, {
  [key]: id
})
```

还有一个最重要的问题，`autorun`里的函数是怎么的就在`get`方法里被推进发布订阅的队列呢，明明在两个不同的地方啊？这也是我觉得mobx智慧的地方，这里就需要一个全局变量来做一个**桥梁**，把这个全局变量叫`currentFn`吧，`autorun`很简单，调用它就是把里面的函数赋值给`currentFn`，然后在`get`方法里就能拿到这个函数了，因为它是全局的。

最后，直接上代码吧，就几十行代码实现`autorun`, `observable`这两个方法

```js
const em = new EventEmitter()
let currentFn
let obId = 1
const map = new WeakMap()

const autorun = fn => {
    const warpFn = () => {
        currentFn = warpFn
        fn()
        currentFn = null
    }
    warpFn()
}

const observable = obj => {
    return new Proxy(obj, {
        get: (target, key) => {
            if (typeof target[key] === 'object') {
                return observable(target[key])
            } else {
                if (currentFn) {
                    const id = String(obId++)
                    if (!map.get(target)) {
                        map.set(target, {
                            [key]: id
                        })
                    }
                    em.on(id, currentFn)
                }
                return target[key]
            }
        },
        set: (target, key, value) => {
            if (target[key] !== value) {
                target[key] = value
                const mapObj = map.get(target)
                if (mapObj && mapObj[key]) {
                    em.emit(mapObj[key])
                }
            }
            return true
        }
    })
}
```

附上源码地址，里面包含测试用例哦：

[简版mobx](https://github.com/bestpky/mini-fe-lib/tree/main/mobx)

