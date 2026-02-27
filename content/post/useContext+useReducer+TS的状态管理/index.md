---
slug: usecontext-usereducer-ts-state
title: useContext+useReducer+TS的状态管理
date: 2022-04-05
description: useContext+useReducer+TS的状态管理
tags:
  - react状态管理
  - useContext
  - useReducer
  - Typescript
---

## 前言

谈到 React 状态管理，你可能会想到很多知名方案，如`Redux`、`Mobx`等，但其实很多时候需要那么复杂么？
React 在`hooks`之后官方的 API 就有实现状态管理的方案，那就是`useContext`+`useRedux`，十分轻量化，本篇介绍在 Typescript 中的使用，纯属干货。

最终我们要实现一个简单计数器像这样：

![](/post-imgs/counter.gif)

+和－两个按钮是两个子组件，共享一个全局状态 counter，counter 存在于 store.tsx 中

一个简单的目录结构：

![](/post-imgs/store目录结构.png)

直接上代码：

```tsx
// store.tsx
import React, {
  FC,
  ReducerAction,
  createContext,
  useContext,
  useReducer,
} from 'react'

import { DispatchAction, IContextType, IStore } from './types'

const store: IStore = {
  counter: 1,
}

export const Context = createContext<IContextType<IStore, ReducerAction<R>>>({
  state: store,
  dispatch: () => 1,
})

export enum ActionTypes {
  RESET = 'RESET',
}

type R = (
  state: IStore,
  partialState: Partial<IStore> | DispatchAction<ActionTypes>
) => IStore

const reducer: R = (state = store, action) => {
  if ('type' in action) {
    switch (action.type) {
      case ActionTypes.RESET:
        return { ...state, counter: 0 }
      default:
        return state
    }
  } else {
    return { ...state, ...action }
  }
}

export const Provider: FC = ({ children }) => {
  const [state, dispatch] = useReducer<R>(reducer, store)
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  )
}

export const useStore = () => useContext(Context)
```

类型定义：

```typescript
// types.ts
import { Dispatch } from 'react'

export interface IContextType<S, R> {
  state: S
  dispatch: Dispatch<R>
}

export type DispatchAction<T> = {
  type: T
  payload?: Record<string, unknown>
}

export interface IStore {
  counter: number
}
```

index.tsx

```tsx
// index.tsx
import React from 'react'

import { LeftBtn } from './leftBtn'
import { RightBtn } from './rightBtn'
import { ActionTypes, Provider, useStore } from './store'

const Page = () => {
  const {
    state: { counter },
    dispatch,
  } = useStore()
  return (
    <div>
      <div>
        {counter}
      </div>
      <div>
        <LeftBtn />
        <RightBtn />
        <button onClick={() => dispatch({ type: ActionTypes.RESET })}>
          RESET
        </button>
      </div>
    </div>
  )
}

const App = () => (
  <Provider>
    <Page />
  </Provider>
)

export default App
```

```tsx
// leftBtn.tsx
import React from 'react'

import { useStore } from './store'

export const LeftBtn = () => {
  const {
    state: { counter },
    dispatch,
  } = useStore()

  return <button onClick={() => dispatch({ counter: counter - 1 })}>-</button>
}
```

```tsx
// rightBtn.tsx
import React from 'react'

import { useStore } from './store'

export const RightBtn = () => {
  const {
    state: { counter },
    dispatch,
  } = useStore()

  return (
    <button
      onClick={() => dispatch({ counter: counter + 1 })}
    >
      +
    </button>
  )
}
```

结束，就这么简单。

可以不需要状态管理库，也完美支持TS。

需要注意的一点是，这里我定义的`dispatch`方法接收`Partial<IStore> | DispatchAction<ActionTypes>`类型的参数，`Partial<IStore>`很好理解，类似`object.assign`的合并更新，但有时你会遇到问题：

比如在`useEffect`里使用，如果你更新的`state`依赖旧的`state`，那么需要把这个`state`加进依赖，这样会导致死循环的问题，这时就要发挥`useReducer`这个API的作用了

可以看到上面例子中的RESET按钮`dispatch`的是一个`{ type: ActionTypes.RESET }`，是一个字符串，这样就不关旧`state`的事啦，如何更新`state`的逻辑在`store`里，还支持传`payload`，自由性很高

最后，这个demo在[playground](/playground/context-store)里有哦

