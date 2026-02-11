import React from 'react'

import { useWatchResize } from '@pky/hooks'

import styles from './index.module.scss'

const mockArr = Array.from(Array(50), (v, k) => k)

export default function Layout() {
  // const { width: clientWidth } = useWindowResize()
  // const containerWidth = clientWidth -  225
  // resize事件只有window才有，而且性能差
  const [wrapperRef, containerWidth] = useWatchResize<HTMLDivElement>()
  const width = useAutoFix(containerWidth, 120, 20)
  const height = 0.8 * width
  const style = {
    width: `${width}px`,
    height: `${height}px`,
  }
  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {mockArr.map((item) => (
        <div key={item} className={styles.item} style={style}></div>
      ))}
    </div>
  )
}

function useAutoFix(containerWidth, defaultWidth, margin) {
  const num = Math.floor(containerWidth / defaultWidth)
  const width = (containerWidth - num * margin) / num
  return width
}
