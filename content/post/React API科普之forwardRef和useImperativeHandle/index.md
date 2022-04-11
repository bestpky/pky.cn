---
title: React API科普之forwardRef和useImperativeHandle
date: 2022-04-06
description: React API科普之forwardRef和useImperativeHandle
tags:
  - react
  - forwardRef
  - useImperativeHandle
---

## React.forwardRef

> `React.forwardRef`会创建一个 React 组件，这个组件能够将其接受的 ref 属性转发到其组件树下的另一个组件中。
> 这种技术并不常见，但在以下两种场景中特别有用：
> （1）转发 `refs` 到 DOM 组件
> （2）在高阶组件中转发 `refs`

React.forwardRef 接受渲染函数作为参数。React 将使用 props 和 ref 作为参数来调用此函数。此函数应返回 React 节点。 FancyButton 使用 React.forwardRef 来获取传递给它的 ref，然后转发到它渲染的 DOM button。这样，使用 FancyButton 的组件可以获取底层 DOM 节点 button 的 ref，并在必要时访问，就像其直接使用 DOM button 一样。

```jsx
const FancyButton = React.forwardRef(
  (
    props,
    ref // Step:3
  ) => (
    // Step: 4
    <button ref={ref} className="FancyButton">
      {props.children}
    </button>
  )
)

const ref = React.createRef() // Step:1
<FancyButton ref={ref}>Click me!</FancyButton> // Step:2
```

在上述的示例中，React 会将 FancyButton 元素的 ref 作为第二个参数传递给 React.forwardRef 函数中的渲染函数。该渲染函数会将 ref 传递给 button 元素。 因此，当 React 附加了 ref 属性之后，ref.current 将直接指向 button DOM 元素实例。

## React.useImperativeHandle

```js
useImperativeHandle(ref, createHandle, [deps])
```

> `useImperativeHandle` 可以让你在使用 ref 时自定义暴露给父组件的实例值。在大多数情况下，应当避免使用 ref
> 这样的命令式代码。 `useImperativeHandle` 应当与 `forwardRef` 一起使用。

```js
function FancyInput(props, ref) {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input ref={inputRef} ... />;
}
FancyInput = forwardRef(FancyInput);

```
