import { useEffect, useRef, useState } from 'react'

import { resizeWatch } from '../utils/resize-watch'

export function useWatchResize<T extends Element>(): [
  React.RefObject<T>,
  number
] {
  const elRef = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    let isUnmount = false
    let cancelFn: () => void
    if (elRef.current) {
      cancelFn = resizeWatch(elRef.current, (rect: DOMRect) => {
        !isUnmount && setWidth(rect.width)
      })
    }
    return () => {
      isUnmount = true
      cancelFn && cancelFn()
    }
  }, [elRef])
  return [elRef, width]
}
