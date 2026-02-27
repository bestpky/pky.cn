---
slug: react15-architecture
title: React15架构的设计思路
date: 2022-04-14
description: React15架构的设计思路
tags:
  - React 15
---

## 前言

虽然现在已经是2022年了，React已经更新到18了，为什么在这里还要提React15呢，早已过时了。

是的，老的架构早已被fiber重构，这里就当是怀旧吧，一起看看最初的React是怎么运行的，也可以把它当做一个阅读React源码的起步。

## 基本概念

### Component（组件）

`Component`就是我们经常实现的组件，可以是`类组件`（`class component`）或者`函数式组件`（`functional component`），下面是一个类组件和一个函数式组件

```js
// Component
class Welcome extends React.Component {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }
}

// functional component
function Welcome(props) {
    return <h1>Hello, {props.name}</h1>;
}
```

### instance（组件实例）

熟悉`面向对象编程`的人肯定知道`类`和`实例`的关系，这里也是一样的，`组件实例`其实就是一个`组件类`实例化的结果，概念虽然简单，但是在`react`这里却容易弄不明白，为什么这么说呢？因为大家在`react`的使用过程中并不会自己去实例化一个`组件实例`，这个过程其实是`react`内部帮我们完成的，因此我们真正接触`组件实例`的机会并不多。我们更多接触到的是下面要介绍的`element`，因为我们通常写的`jsx`其实就是`element`的一种表示方式而已(后面详细介绍)。虽然`组件实例`用的不多，但是偶尔也会用到，其实就是`ref`。`ref`可以指向一个`dom节点`或者一个`类组件(class component)`的实例，但是不能用于`函数式组件`，因为`函数式组件`不能`实例化`。这里简单介绍下`ref`，我们只需要知道`ref`可以指向一个`组件实例`即可。

### element

就是一个纯对象（`plain object`），而且这个纯对象包含两个属性：`type:(string|ReactClass)`和`props:Object`，注意`element`并不是`组件实例`，而是一个纯对象。**虽然`element`不是`组件实例`，但是又跟组件实例有关系，`element`是对`组件实例`或者`dom节点`的描述**。如果`type`是`string`类型，则表示`dom节点`，如果`type`是`function`或者`class`类型，则表示`组件实例`。比如下面两个`element`分别描述了一个`dom节点`和一个`组件实例`：

```js
// 描述dom节点
{
  type: 'button',
  props: {
    className: 'button button-blue',
    children: {
      type: 'b',
      props: {
        children: 'OK!'
      }
    }
  }
}

// 描述组件实例
{
  type: Button,
  props: {
    color: 'blue',
    children: 'OK!'
  }
}
```

### jsx

写React就离不开jsx，像这样

```jsx
const foo = <div id="foo">Hello!</div>;
```

以上节点可以用纯对象字面量来表示，像这样

```js
const foo = {
  type: 'div',
  props: {
    id: 'foo',
    children: 'Hello!'
  }
}
```

那么React是如何将JSX语法转换为纯对象的呢？其实就是利用`Babel`编译生成的，我们只要在使用`jsx`的代码里加上个`编译指示(pragma)`即可，可以参考这里[Babel如何编译jsx](https://link.juejin.cn?target=https%3A%2F%2Fbabeljs.io%2Fdocs%2Fen%2Fbabel-plugin-transform-react-jsx)。比如我们将`编译指示`设置为指向`createElement`函数：`/** @jsx createElement */`，那么前面那段`jsx`代码就会编译为：

```js
var foo = createElement('div', {id:"foo"}, 'Hello!');
```

可以看出，`jsx`的编译过程其实就是从`<`、`>`这种`标签式`写法到`函数调用式`写法的一种转化而已。有了这个前提，我们只需要简单实现下`createElement`函数不就可以构造出`element`了嘛，我们后面自己实现`简版react`也会用到这个函数：

```js
function createElement(type, props, ...children) {
    props = Object.assign({}, props)
    props.children = []
        .concat(...children)
        .filter(child => child != null && child !== false)
        .map(child => (child instanceof Object ? child : createTextElement(child)))
    return { type, props }
}
```

## 虚拟dom和diff算法

`虚拟dom`就是前面介绍的`element`。

`react`给我们提供了`声明式`的组件写法，当组件的`props`或者`state`变化时组件自动更新。整个页面其实可以对应到一棵`dom`节点树，每次组件`props`或者`state`变更首先会反映到`虚拟dom`树，然后最终反应到页面`dom`节点树的渲染。

那么`虚拟dom`跟`diff算法`又有什么关系呢？之所以有`diff`算法其实是为了提升`渲染`效率，试想下，如果每次组件的`state`或者`props`变化后都把所有相关`dom`节点删掉再重新创建，那效率肯定非常低，所以在`react`内部存在两棵`虚拟dom`树，分别表示`现状`以及`下一个状态`，`setState`调用后就会触发`diff`算法的执行，而好的`diff`算法肯定是尽可能复用已有的`dom`节点，避免重新创建的开销。

diff算法官方叫reconcile，调解的意思。

## 设计思路

先看我们要实现的最终效果

```jsx
// 声明编译指示
/** @jsx DiyReact.createElement */

import DiyReact from './react'

export class App extends DiyReact.Component {
    constructor(props) {
        super(props)
        this.state = {
            list: ['a', 'b', 'c']
        }
    }
  	componentDidMount() {
        console.log('execute componentDidMount');
    }
    render() {
        return (
            <ul>
                {this.state.list.map(item => (
                    <li onClick={() => console.log(item)} key={item}>
                        {item}
                    </li>
                ))}
            </ul>
        )
    }
}

DiyReact.render(<App />, document.getElementById('root'))
```

可以看到我们要实现`render`、`createElement`以及`Component`三个API即可，`createElement`在上面已经实现过了。

### 实现render

注意这个`render`相当于`ReactDOM.render`，不是`组件`的`render`方法，`组件`的`render`方法在后面`Component`实现部分。

```js
import reconcile from './reconcile'

// rootInstance用来缓存一帧虚拟dom
let rootInstance = null

export default function render(element, parentDom) {
    // prevInstance指向前一帧
    const prevInstance = rootInstance
    // element参数指向新生成的虚拟dom树
    const nextInstance = reconcile(parentDom, prevInstance, element)
    // 调用完reconcile算法(即diff算法)后将rooInstance指向最新一帧
    rootInstance = nextInstance
}

```

`render`函数实现很简单，只是进行了两帧`虚拟dom`的对比(reconcile)，然后将`rootInstance`指向新的`虚拟dom`。细心点会发现，新的`虚拟dom`为`element`，即最开始介绍的`element`，而`reconcile`后的`虚拟dom`是`instance`，不过这个`instance`并不是`组件实例`，这点看后面`instantiate`的实现。总之`render`方法其实就是调用了`reconcile`方法进行了两帧`虚拟dom`的对比而已。

### 实现instantiate

那么前面的`instance`到底跟`element`有什么不同呢？其实`instance`指示简单的是把`element`重新包了一层，并把对应的`dom`也给包了进来，这也不难理解，毕竟我们调用`reconcile`进行`diff`比较的时候需要把跟新应用到真实的`dom`上，因此需要跟`dom`关联起来，下面实现的`instantiate`函数就干这个事的。注意由于`element`包括`dom`类型和`Component`类型(由`type`字段判断，不明白的话可以回过头看一下第一节的`element`相关介绍)，因此需要分情况处理：

`dom`类型的`element.type`为`string`类型，对应的`instance`结构为`{element, dom, childInstances}`。

`Component`类型的`element.type`为`ReactClass`类型，对应的`instance`结构为`{dom, element, childInstance, publicInstance}`，注意这里的`publicInstance`就是前面介绍的`组件实例`。

```js
import { updateDomProperties } from './update-dom'
import { TEXT_ELEMENT } from './create-element'

function instantiate(element) {
    const { type, props = {} } = element
    const isDomElement = typeof type === 'string'
    const isClassElement = !!(type.prototype && type.prototype.isReactComponent)
    if (isDomElement) {
        // dom元素
        const isTextElement = type === TEXT_ELEMENT
        const dom = isTextElement ? document.createTextNode('') : document.createElement(type)
        updateDomProperties(dom, [], element.props)
        const children = props.children || []
        const childInstances = children.map(instantiate)
        const childDoms = childInstances.map(childInstance => childInstance.dom)
        childDoms.forEach(childDom => dom.appendChild(childDom))
        const instance = { element, dom, childInstances }
        return instance
    } else if (isClassElement) {
        // 类组件
        const instance = {}
        const publicInstance = createPublicInstance(element, instance)
        const childElement = publicInstance.render()
        const childInstance = instantiate(childElement)
        Object.assign(instance, { dom: childInstance.dom, element, childInstance, publicInstance })
        return instance
    } else {
        // 函数组件
        const childElement = type(element.props)
        const childInstance = instantiate(childElement)
        const instance = {
            dom: childInstance.dom,
            element,
            childInstance,
            fn: type
        }
        return instance
    }
}

function createPublicInstance(element, instance) {
    const { type, props } = element
    const publicInstance = new type(props)
    publicInstance.__internalInstance = instance
    return publicInstance
}
```

需要注意，由于`dom节点`和`组件实例`都可能有孩子节点，因此`instantiate`函数中有递归实例化的逻辑。

### 实现reconcile(diff算法)

大致流程：

1. 如果是新增`instance`，那么需要实例化一个`instance`并且`appendChild`；
2. 如果是不是新增`instance`，而是删除`instance`，那么需要`removeChild`；
3. 如果既不是新增也不是删除`instance`，那么需要看`instance`的`type`是否变化，如果有变化，那节点就无法复用了，也需要实例化`instance`，然后`replaceChild`；
4. 如果`type`没变化就可以复用已有节点了，这种情况下要判断是原生`dom`节点还是我们自定义实现的`react`节点，两种情况下处理方式不同。

```js
import instantiate from './instantiate'
import { updateDomProperties } from './update-dom'

/**
 * diff算法
 * @param {*} parentDom 父节点
 * @param {*} instance 旧的实例
 * @param {*} element 新的虚拟dom
 */
export default function reconcile(parentDom, instance, element) {
    if (instance === null) {
        const newInstance = instantiate(element)
        executeInsFunc(newInstance, 'componentWillMount')
        parentDom.appendChild(newInstance.dom)
        executeInsFunc(newInstance, 'componentDidMount')
        return newInstance
    } else if (element === null) {
        executeInsFunc(instance, 'componentWillUnmount')
        parentDom.removeChild(instance.dom)
        return null
    } else if (instance.element.type !== element.type) {
        const newInstance = instantiate(element)
        executeInsFunc(newInstance, 'componentDidMount')
        parentDom.replaceChild(newInstance.dom, instance.dom)
        return newInstance
    } else if (typeof element.type === 'string') {
        updateDomProperties(instance.dom, instance.element.props, element.props)
        instance.childInstances = reconcileChildren(instance, element)
        instance.element = element
        return instance
    } else {
        if (instance.publicInstance && instance.publicInstance.shouldcomponentUpdate) {
            if (!instance.publicInstance.shouldcomponentUpdate()) {
                return
            }
        }
        executeInsFunc(instance, 'componentWillUpdate')
        let newChildElement
        if (instance.publicInstance) {
            // 类组件
            instance.publicInstance.props = element.props
            newChildElement = instance.publicInstance.render()
        } else {
            // 函数式组件
            newChildElement = instance.fn(element.props)
        }

        const oldChildInstance = instance.childInstance
        const newChildInstance = reconcile(parentDom, oldChildInstance, newChildElement)
        executeInsFunc(instance, 'componentDidUpdate')
        instance.dom = newChildInstance.dom
        instance.childInstance = newChildInstance
        instance.element = element
        return instance
    }
}

function reconcileChildren(instance, element) {
    const { dom, childInstances } = instance
    const newChildElements = element.props.children || []
    const count = Math.max(childInstances.length, newChildElements.length)
    const newChildInstances = []
    for (let i = 0; i < count; i++) {
        newChildInstances[i] = reconcile(dom, childInstances[i], newChildElements[i])
    }
    return newChildInstances.filter(instance => instance !== null)
}

function executeInsFunc(instance, funcName) {
    if (instance['publicInstance'] && instance['publicInstance'][funcName]) {
        instance['publicInstance'][funcName]()
    }
}
```

看完`reconcile`算法后肯定有人会好奇，为什么这种算法叫做`stack`算法，这里简单解释一下。从前面的实现可以看到，每次组件的`state`更新都会触发`reconcile`的执行，而`reconcile`的执行也是一个递归过程，而且一开始直到递归执行完所有节点才停止，因此称为`stack`算法。由于是个递归过程，因此该`diff`算法一旦开始就必须执行完，因此可能会阻塞线程，又由于js是单线程的，因此这时就可能会影响用户的输入或者ui的渲染帧频，降低用户体验。不过`react16`中升级为了`fiber`架构，这一问题得到了解决。

### 实现Component

```js
import reconcile from './reconcile'

export default class Component {
    constructor(props) {
        this.props = props
        this.state = this.state || {}
    }

    setState(partialState) {
        this.state = Object.assign({}, this.state, partialState)
        // 更新实例
        const parentDom = this.__internalInstance.dom.parentNode
        const element = this.__internalInstance.element
        reconcile(parentDom, this.__internalInstance, element)
    }
}
// 标记区分类组件和函数组件
Component.prototype.isReactComponent = {}

```

### 整体代码

在[这里](https://github.com/bestpky/mini-fe-lib/tree/main/react-15)。200多行代码而已，其实也没那么复杂。
