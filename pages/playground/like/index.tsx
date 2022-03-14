import classnames from 'classnames'
import React from 'react'
import { useState } from 'react'

import styles from './index.module.scss'

const Like = () => {
  const [flag, setFlag] = useState(false)
  const [flag1, setFlag1] = useState(false)
  return (
    <div className={classnames('max-w-3xl container', styles.wrapper)}>
      <span
        onClick={() => setFlag(!flag)}
        className={classnames(
          styles.like,
          styles.heart,
          flag && styles.animate
        )}
      />

      <span
        onClick={() => setFlag1(!flag1)}
        className={classnames(
          styles.like,
          styles.thumb,
          flag1 && styles.animate
        )}
      />
    </div>
  )
}

export default Like
