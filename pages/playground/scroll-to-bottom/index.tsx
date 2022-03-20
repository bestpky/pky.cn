import classNames from 'classnames'
import React from 'react'

import { useScrollPagination } from '@lib/hooks/use-pagination'

import styles from './index.module.scss'

export default function ScrollToBottom() {
  const { list, containerRef } = useScrollPagination<HTMLDivElement>()
  return (
    <div className="container flex-center">
      <div ref={containerRef} className={classNames(styles.wrapper)}>
        {list.map((item) => (
          <div key={item} />
        ))}
      </div>
    </div>
  )
}
