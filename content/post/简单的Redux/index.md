---
title: 简单的Redux
date: 2022-04-07
description: 简单的Redux
tags:
  - Redux
---

![](/post-imgs/redux流程图.png)

**combineReducers**

```js
function combineReducers(reducersMap) {

  /* reducerKeys = ['counter', 'info']*/
  const reducerKeys = Object.keys(reducersMap)

  /*返回合并后的新的reducer函数*/
  return function combination(state = {}, action) {
    /*生成的新的state*/
    const nextState = {}

    /*遍历执行所有的reducers，整合成为一个新的state*/
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i]
      const reducer = reducersMap[key]
      /*之前的 key 的 state*/
      const previousStateForKey = state[key]
      /*执行 分 reducer，获得新的state*/
      const nextStateForKey = reducer(previousStateForKey, action)

      nextState[key] = nextStateForKey
    }
    return nextState;
  }
}
```

用例

```js
const reducer = combineReducers({
  counter: counterReducer,
  info: InfoReducer
});

let initState = {
  counter: {
    count: 0
  },
  info: {
    name: '前端九部',
    description: '我们都是前端爱好者！'
  }
}

let store = createStore(reducer, initState);

store.subscribe(() => {
  let state = store.getState();
  console.log(state.counter.count, state.info.name, state.info.description);
});
/*自增*/
store.dispatch({
  type: 'INCREMENT'
});

/*修改 name*/
store.dispatch({
  type: 'SET_NAME',
  name: '前端九部2号'
});
```

**中间件**

中间件就是对`dispatch`的扩展，或者说重写

```js
const store = createStore(reducer);
const next = store.dispatch;

/*重写了store.dispatch*/
store.dispatch = (action) => {
  console.log('this state', store.getState());
  console.log('action', action);
  next(action);
  console.log('next state', store.getState());
}
```

**applyMiddleware**

用法

```js
/*接收旧的 createStore，返回新的 createStore*/
const newCreateStore = applyMiddleware(exceptionMiddleware, timeMiddleware, loggerMiddleware)(createStore);

/*返回了一个 dispatch 被重写过的 store*/
const store = newCreateStore(reducer);
```

实现

```js
const applyMiddleware = function (...middlewares) {
  /*返回一个重写createStore的方法*/
  return function rewriteCreateStoreFunc(oldCreateStore) {
     /*返回重写后新的 createStore*/
    return function newCreateStore(reducer, initState) {
      /*1. 生成store*/
      const store = oldCreateStore(reducer, initState);
      /*给每个 middleware 传下store，相当于 const logger = loggerMiddleware(store);*/
      /* const chain = [exception, time, logger]*/
      const chain = middlewares.map(middleware => middleware(store));
      let dispatch = store.dispatch;
      /* 实现 exception(time((logger(dispatch))))*/
      chain.reverse().map(middleware => {
        dispatch = middleware(dispatch);
      });

      /*2. 重写 dispatch*/
      store.dispatch = dispatch;
      return store;
    }
  }
}
```

