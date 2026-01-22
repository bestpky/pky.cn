---
title: 【干货】滚动翻页通用方案（RxJS助力版）
date: 2025-12-24
description: 一套基于 RxJS 的滚动翻页通用方案,采用命令式设计,支持防抖、高度自检测、并发控制等特性,实现数据层与控制层的完美解耦
tags:
  - React
  - RxJS
  - 性能优化
---

# 【干货】滚动翻页通用方案（RxJS 助力版）

## Feature

- [x] 防抖（RxJS debounceTime，默认 300ms）

- [x] 初始化时内容高度自检测（无滚动条自动加载）

- [x] 没有更多数据后不触发请求（hasMoreRef 判断）

- [x] 防止并发请求（isLoading 标志位）

- [x] 支持同步和异步加载函数（Promise.resolve 统一处理）

- [x] 自动资源清理（组件卸载时取消订阅）

- [x] 支持从顶部加载历史消息（scrollTop === 0 触发）

- [x] 列表去重（uniqBy 避免重复数据）

- [x] 命令式 page 管理（请求成功后才更新 pageRef）

- [x] 关注点分离（数据层与滚动控制层解耦）

## 对比 useState+useEffect 响应式的翻页方案

### 传统响应式方案的典型实现

```tsx
const [page, setPage] = useState(1)
const [list, setList] = useState([])
const [hasMore, setHasMore] = useState(true)

// 监听 page 变化，自动请求
useEffect(() => {
  loadData(page)
}, [page])

// 滚动到底部时
const handleScroll = () => {
  if (reachBottom && hasMore) {
    setPage((prev) => prev + 1) // 触发 useEffect
  }
}
```

### 响应式方案存在的问题

1. **Page 状态管理的先有鸡还是先有蛋问题**

   - `page` 变化触发 `useEffect` 请求数据
   - 如果请求失败，`page` 已经 +1 了，需要手动 -1 回退吗？
   - 如果用户快速滚动，`page` 可能连续变化，导致多个请求并发
   - 状态和副作用的因果关系不清晰

2. **依赖数组容易出错**

   - `useEffect` 依赖 `page`、`searchParams` 等多个状态
   - 任何一个依赖变化都会触发请求
   - 容易出现闭包陷阱（stale closure）
   - exhaustive-deps 规则让依赖数组越来越长

3. **逻辑耦合度高**

   - 数据加载逻辑和滚动事件处理混在一起
   - 难以单独测试和复用
   - 代码可读性差，维护成本高

4. **第一页高度不足问题**

   - 如果第一页数据较少，无法产生滚动条
   - 用户无法触发滚动事件，无法加载更多
   - 需要额外的状态和逻辑来检测和处理
   - 增加了实现复杂度

5. **防抖和节流不优雅**

   - 需要手动实现 debounce/throttle
   - 或者引入 lodash 等工具库
   - 清理定时器的逻辑容易遗漏

6. **并发请求控制困难**
   - 需要额外的 loading 状态
   - 滚动事件和状态变化可能同时触发请求
   - 难以保证请求的顺序性

## 思路：命令式 + RxJS 的解决方案

### 核心设计理念

1. **从响应式改为命令式**

   - 不使用 `page` 作为 state，改用 `pageRef`
   - 不让 `page` 变化触发 `useEffect`，而是主动调用加载函数
   - 请求成功后才更新 `pageRef.current`，避免回退问题

2. **关注点分离**

   - **数据层**：`useListData` hook 负责数据加载、状态管理
   - **控制层**：`ScrollPaginationController` 负责滚动事件监听和触发时机
   - 两层通过 `onLoadMore` 回调解耦，可独立测试和复用

3. **用 RxJS 优雅处理事件流**

   - 用 `fromEvent` 创建滚动事件流
   - 用 `debounceTime` 实现防抖（省去手动管理定时器）
   - 用 `filter` 过滤无效事件（loading 中、无更多数据等）
   - 声明式编程，代码更清晰

4. **统一处理初始化和滚动加载**
   - `setupAutoLoadCheck` 解决第一页高度不足问题
   - `setupScrollObservable` 处理正常滚动加载
   - 两者都调用同一个 `loadMore` 方法，逻辑统一

### 方案对比

| 维度      | 响应式方案             | 命令式 + RxJS 方案          |
| --------- | ---------------------- | --------------------------- |
| Page 管理 | State，变化触发 effect | Ref，请求成功后更新         |
| 依赖数组  | 复杂，容易出错         | 简单，明确                  |
| 防抖实现  | 手动管理定时器         | RxJS debounceTime           |
| 高度不足  | 需要额外逻辑           | 自动检测和加载              |
| 并发控制  | 依赖多个 state         | isLoading 标志位            |
| 代码组织  | 耦合在一起             | 数据层和控制层分离          |
| 可复用性  | 难以复用               | Controller 和 hook 都可复用 |

## 实现

先说怎么分离查询列表逻辑和处理滚动事件逻辑

首先我们希望有一个滚动事件的控制器，文件名就叫`scroll-pagination-controller.ts`

它的入参必不可少的是滚动的容器、加载下一页的方法，还有没有更多数据之后应该再触发滚动加载，应该不请求下一页了，所以还需要一个是否有更多数据的参数

然后何时调用这个控制器呢？因为这个控制器的逻辑是给滚动容器注册监听，所以有容器 dom 就可以调用了，一般在`useEffect`里，这里直接上代码

```tsx
// 使用 ScrollPaginationController 管理滚动加载
useEffect(() => {
  const container = scrollContainerRef.current
  if (!container || !onLoadMore || !hasMoreRef) return

  // 创建滚动控制器
  scrollControllerRef.current = new ScrollPaginationController({
    container,
    onLoadMore,
    hasMoreRef,
  })

  // 清理
  return () => {
    scrollControllerRef.current?.destroy()
  }
}, [])
```

这里有个细节要注意下，`hasMoreRef`和`onLoadMore`两个入参是组件的`props`，应该要加进 `useEffect` 的依赖数组的，这里为了防止 `ScrollPaginationController` 多次实例化所以不加，实际上 `hasMoreRef` 是个 `ref` 可以不加，但是 `onLoadMore` 是个函数 `props`，不加是有一定安全隐患的，这里确保了这个场景下没问题才不加的

上面说的是翻页控制器的调用，入参的两个参数 `onLoadMore` 和 `hasMoreRef` 关乎数据层的逻辑，可以把他们封装在前面说的获取列表数据的一个 `hook` 里，这个 `hook` 和控制器都是可以提出来在不同的项目中复用的，所以是一套方法论的同喜

来看下 `onLoadMore` 的实现，这里就主动地去调请求方法了，`page` 参数改用 `ref` 作为入参，体现了和响应式的区别

```ts
const onLoadMore = useCallback(async () => {
  if (!hasMoreRef.current) return
  await loadMessages(currentPageRef.current + 1)
}, [loadMessages])
```

再看看 `loadMessages` 方法的实现

```ts
const loadMessages = useCallback(
  async (pageNo: number = 1) => {
    if (!validateParams()) return

    setLoading(true)

    try {
      const params = buildLoadParams(pageNo, pageSize)
      const response = await loadApi(params)
      if (response) {
        currentPageRef.current = pageNo
        setConversations((prev) => {
          const newList =
            pageNo === 1
              ? response.list
              : uniqBy([...response.list, ...prev.list], 'msgId')
          const totalLoaded = newList.length
          hasMoreRef.current = totalLoaded < response.total
          return {
            list: newList,
            total: response.total,
          }
        })

        // 当加载第一页时,滚动到底部
        if (pageNo === 1 && scrollToBottom) {
          scrollToBottom()
        }
      }
    } finally {
      setLoading(false)
    }
  },
  [validateParams, buildLoadParams, loadApi, pageSize, scrollToBottom]
)
```

它做的几件事：

1. 参数校验，确保必要参数存在
2. 设置 loading 状态
3. 调用 API 获取数据
4. 请求成功后才更新 `currentPageRef.current`（避免先有鸡还是先有蛋的问题）
5. 根据是否第一页，决定是替换列表还是追加到列表前面（历史消息加载场景）
6. 用 `uniqBy` 去重，避免重复数据
7. 计算是否还有更多数据，更新 `hasMoreRef.current`
8. 第一页加载完成后自动滚动到底部

到这里，基本就可以知道列表数据 `hook` 怎么组织了，就叫他 `useListData` 吧

重点来了，滚动控制器 `ScrollPaginationController` 的实现

```ts
import { fromEvent, Subscription } from 'rxjs'
import { debounceTime, filter } from 'rxjs/operators'

type Params = {
  container: HTMLElement
  onLoadMore: () => void | Promise<void>
  hasMoreRef: { current: boolean }
}

export class ScrollPaginationController {
  private container: HTMLElement
  private onLoadMore: () => void | Promise<void>
  private isLoading: boolean = false
  private hasMoreRef: { current: boolean }
  private subscription?: Subscription

  constructor(params: Params) {
    const { container, onLoadMore, hasMoreRef } = params
    this.container = container
    this.onLoadMore = onLoadMore
    this.hasMoreRef = hasMoreRef

    this.setupScrollObservable(300)
    this.setupAutoLoadCheck()
  }

  private setupScrollObservable(debounceMs: number) {
    // 创建滚动事件流
    this.subscription = fromEvent(this.container, 'scroll')
      .pipe(
        debounceTime(debounceMs), // 防抖
        filter(() => this.checkIfShouldLoad()) // 只处理需要加载的情况
      )
      .subscribe(() => {
        this.loadMore()
      })
  }

  private setupAutoLoadCheck() {
    // 监听容器大小变化,自动检查是否需要加载更多
    const checkAndLoad = () => {
      if (!this.hasMoreRef.current || this.isLoading) return

      const hasScrollbar =
        this.container.scrollHeight > this.container.clientHeight

      if (!hasScrollbar) {
        this.loadMore()
      }
    }

    setTimeout(checkAndLoad, 100)
  }

  private checkIfShouldLoad(): boolean {
    // 如果正在加载或没有更多数据,不加载
    if (this.isLoading || !this.hasMoreRef.current) {
      return false
    }

    const { scrollTop } = this.container

    // 只检查是否滚动到顶部(用于从顶部加载历史消息)
    return scrollTop === 0
  }

  private loadMore() {
    if (this.isLoading) return

    this.isLoading = true

    // Promise.resolve 确保无论 onLoadMore 是同步还是异步都能统一处理
    Promise.resolve(this.onLoadMore()).finally(() => {
      this.isLoading = false
    })
  }

  public destroy() {
    this.subscription?.unsubscribe()
  }
}
```

它做的几件事：

1. **初始化滚动事件流**（`setupScrollObservable`）

   - 使用 RxJS 的 `fromEvent` 创建滚动事件流
   - 通过 `debounceTime` 实现防抖（默认 300ms），避免频繁触发
   - 使用 `filter` 过滤掉不需要加载的情况（正在加载中、没有更多数据、未滚动到触发位置）
   - 满足条件时调用 `loadMore` 加载下一页

2. **初始化自动加载检查**（`setupAutoLoadCheck`）

   - 解决第一页列表高度不足以产生滚动条的问题
   - 在初始化 100ms 后检查容器是否有滚动条
   - 如果没有滚动条且还有更多数据，自动触发加载
   - 这样可以一直加载到有滚动条为止

3. **判断是否应该加载**（`checkIfShouldLoad`）

   - 检查是否正在加载中（避免重复请求）
   - 检查是否还有更多数据（通过 `hasMoreRef.current`）
   - 检查滚动位置是否到达触发点（这里是顶部，适用于历史消息加载场景）

4. **执行加载**（`loadMore`）

   - 设置 `isLoading` 标志防止并发请求
   - 使用 `Promise.resolve` 包装 `onLoadMore`，统一处理同步和异步函数
   - 在 `finally` 中重置 `isLoading` 状态，确保无论成功失败都能解锁

5. **清理资源**（`destroy`）
   - 取消订阅滚动事件流，避免内存泄漏
   - 在组件卸载时调用

## 总结

这套滚动翻页方案的核心优势：

1. **命令式而非响应式**：避免了 page 状态管理的复杂性，请求成功后才更新 page
2. **关注点分离**：数据加载逻辑（useListData）和滚动控制逻辑（ScrollPaginationController）解耦
3. **自动高度检测**：解决了第一页内容不足无法产生滚动条的问题
4. **RxJS 加持**：利用响应式编程优雅地处理防抖、过滤等逻辑
5. **通用可复用**：控制器和 hook 都可以在不同项目中复用

需要注意的点：

1. **依赖数组问题**：useEffect 中的 `onLoadMore` 作为 props 理应加入依赖数组，但为了避免重复创建控制器，可以拆分成两个 effect，一个初始化，一个通过 `updateCallbacks` 更新回调函数
2. **ref 的使用**：`hasMoreRef` 和 `currentPageRef` 使用 ref 而非 state，避免了闭包陷阱
3. **加载状态管理**：通过 `isLoading` 标志防止并发请求，保证数据一致性

适用场景：

- 聊天消息列表（从顶部加载历史消息）
- 瀑布流布局（从底部加载更多）
- 任何需要滚动翻页的列表场景

只需调整 `checkIfShouldLoad` 中的滚动位置判断逻辑即可适配不同场景（顶部加载、底部加载、双向加载等）。
