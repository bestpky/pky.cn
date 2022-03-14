import { trimEnd } from 'lodash'
import { useEffect, useRef } from 'react'

import { List } from './index'
import styles from './index.module.scss'

const TITLE_HEIGHT = 22

interface Props {
  list: List
  isRun: boolean
  updateList: (list: List) => void
}

export default function Carousel({ isRun, list, updateList }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timer: number

    function moveItems() {
      if (wrapperRef.current) {
        const items = Array.from(
          wrapperRef.current.children
        ) as HTMLDivElement[]
        items.forEach((item: HTMLDivElement, i) => {
          //  这里用top而不用translateY是因为transform取不到值
          item.style.top = `${+trimEnd(item.style.top, 'px') - TITLE_HEIGHT}px`
          item.style.opacity = i === 1 ? '1' : '0'
        })
      }
    }
    if (isRun) {
      timer = window.setInterval(() => {
        const temp = [...list]
        const out = temp.shift()
        if (out) {
          temp.push(out)
        }
        updateList(temp)
        moveItems()
      }, 1000)
    }
    return () => {
      console.log(timer)
      clearInterval(timer)
    }
  }, [isRun, list, updateList])
  return (
    <div>
      <div ref={wrapperRef} className={styles.box}>
        {list.map(({ id, title, info }, i) => (
          <div
            style={{ top: i * TITLE_HEIGHT }}
            className={styles.item}
            key={id}
          >
            <span>{title}</span>
            <span>{info}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
