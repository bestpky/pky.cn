import classNames from 'classnames'
import React from 'react'

import Demo1 from './demo-1'
import Demo2 from './demo-2'
import styles from './index.module.scss'

const Drawer = () => {
  return (
    <div className={classNames('max-w-3xl container', styles.wrapper)}>
      <Demo1 />
      <div style={{ marginBottom: 40 }}></div>
      <Demo2 />
    </div>
  )
}

export default Drawer
