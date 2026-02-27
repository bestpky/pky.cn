---
slug: functional-vs-class-component
title: 函数式组件和类组件有何不同
date: 2022-03-28
description: 函数式组件和类组件有何不同
tags:
  - 函数式组件
  - 类组件
  - React
---

> 函数式组件捕获了渲染所用的值。（Function components capture the rendered values.）

最大的区别是心智模型上的区别，思考这个组件：

```js
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user)
  }

  const handleClick = () => {
    setTimeout(showMessage, 3000)
  }

  return <button onClick={handleClick}>Follow</button>
}
```

它渲染了一个利用`setTimeout`来模拟网络请求，然后显示一个确认警告的按钮。例如，如果`props.user`是`yyz`，它会在三秒后显示`Followed yyz`

如果是类组件我们怎么写？一个简单的重构可能就象这样：

```js
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user)
  }

  handleClick = () => {
    setTimeout(this.showMessage, 3000)
  }

  render() {
    return <button onClick={this.handleClick}>Follow</button>
  }
}
```

问题来了，在这 3s 的时间内，如果`props.user`改变了，两个组件各自输出的`user`，是点击时候的？还是 3s 后`setTimeout`的回调执行时的？

直接说答案，函数式组件是前者，类组件是后者。

先不说为什么，你觉得那种对？

React 官方一直推崇的是`immutable`的思想，所以为什么主推`Hooks`。或者举个简单的例子，**如果我关注一个人，然后导航到了另一个人的账号，我的组件不应该混淆我关注了谁**

所以为什么我们的例子中类组件会有这样的表现？

让我们来仔细看看我们类组件中的 `showMessage` 方法：

```js
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
};
```

这个类方法从 `this.props.user` 中读取数据。在 React 中 Props 是不可变(immutable)的，所以他们永远不会改变。**然而，`this`是可变(mutable)的。**

事实上，这就是类组件 `this` 存在的意义。React 本身会随着时间的推移而改变，以便你可以在渲染方法以及生命周期方法中得到最新的实例。

所以如果在请求已经发出的情况下我们的组件进行了重新渲染，`this.props`将会改变。`showMessage`方法从一个“过于新”的`props`中得到了`user`。

这暴露了一个关于用户界面性质的一个有趣观察。如果我们说 UI 在概念上是当前应用状态的一个函数，**那么事件处理程序则是渲染结果的一部分 —— 就像视觉输出一样**。我们的事件处理程序“属于”一个拥有特定 props 和 state 的特定渲染。

然而，调用一个回调函数读取 `this.props` 的 timeout 会打断这种关联。我们的 `showMessage` 回调并没有与任何一个特定的渲染“绑定”在一起，所以它“失去”了正确的 props。从 this 中读取数据的这种行为，切断了这种联系。

---

其实类组件使用闭包也可以取得同样的效果，就像这样：

```js
class ProfilePage extends React.Component {
  render() {
    // Capture the props!
    const props = this.props

    // Note: we are *inside render*.
    // These aren't class methods.
    const showMessage = () => {
      alert('Followed ' + props.user)
    }

    const handleClick = () => {
      setTimeout(showMessage, 3000)
    }

    return <button onClick={handleClick}>Follow</button>
  }
}
```

但是看起来很奇怪。如果你在`render`方法中定义各种函数，而不是使用 class 的方法，那么使用类的意义在哪里

所以，请使用函数式组件吧，更符合 React 不可变的理念，`state`和`props`都是不可变的。

现在我们明白了 React 中函数式组件和类组件之间的巨大差别：

> **函数式组件捕获了渲染所使用的值。**

还有一点，在函数式组件中怎么实现类组件的`可变`，答案是`useRef`，你需要自己管理`current`

这是进入可变的命令式的世界的后门。你可能熟悉’DOM refs’，但是 ref 在概念上更为广泛通用。它只是一个你可以放东西进去的盒子。
