import { debounce } from '@pky/fe-utils'
import { useEffect, useRef } from 'react'

/**
 * 滚动到底部
 * @param action 执行的函数
 * @returns
 */
const useBottom = <T extends Element>(action: () => void) => {
  const containerRef = useRef<T>(null)
  useEffect(() => {
    function doInBottom(e: WheelEvent) {
      const { scrollTop, clientHeight, scrollHeight } =
        e.target as HTMLDivElement
      if (scrollTop + clientHeight + 10 > scrollHeight) {
        return action()
      }
    }
    const debounceDoInBottom = debounce((e: WheelEvent) => {
      doInBottom(e)
    }, 300)
    const dom = containerRef.current
    if (dom) {
      dom.addEventListener('scroll', debounceDoInBottom)
      return () => {
        dom.removeEventListener('scroll', debounceDoInBottom)
      }
    }
  }, [action])
  return containerRef
}

export default useBottom
