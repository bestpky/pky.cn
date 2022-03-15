import { ResizeObserver } from '@juggle/resize-observer'

type FindIterator<T> = (item: T, index: number, obj: T[]) => unknown
/**
 * 从数组里去掉一个元素
 * @template T
 * @param {T[]} from 数组
 * @param {T} item 元素
 * @returns {number?} 如果执行了删除，则返回index
 */
export function remove<T, U extends FindIterator<T>>(
  from: T[],
  item: T | U
): number | undefined {
  const index =
    typeof item === 'function' ? from.findIndex(item as U) : from.indexOf(item)
  if (index !== -1) {
    from.splice(index, 1)
    return index
  }
  return undefined
}

export type Callback = (rect: DOMRect, oldRect: DOMRect) => unknown

interface Item {
  callbacks: Callback[]
  contentRect: DOMRect
}

const elAndCbMap: Map<Element, Item> = new Map()
const ro = new ResizeObserver((entries) => {
  const elAndCbEntries = Array.from(elAndCbMap.entries())
  entries.forEach((entry) => {
    const i = elAndCbEntries.findIndex(([el]) => el === entry.target)
    if (i !== -1) {
      const [, item] = elAndCbEntries[i]
      const { contentRect: oldRect, callbacks: fns } = item
      item.contentRect = entry.contentRect
      fns.forEach((fn) => {
        fn(item.contentRect, oldRect)
      })
    }
  })
})

export function resizeWatch(el: Element, callback: Callback) {
  const item: Item = elAndCbMap.get(el) ?? {
    contentRect: el.getBoundingClientRect(),
    callbacks: [] as Callback[],
  }
  const fns = item.callbacks
  fns.push(callback)
  elAndCbMap.set(el, item)
  ro.observe(el)
  return () => {
    remove(fns, (cb: Callback) => cb === callback)
    console.log(fns)
    if (!fns.length) {
      elAndCbMap.delete(el)
      ro.unobserve(el)
    }
  }
}
