import classNames from 'classnames'
import React from 'react'

import PageHead from '@shared/PageHead'

import styles from './index.module.scss'

export default function About() {
  return (
    <>
      <PageHead />
      <div className={classNames('max-w-3xl', styles.playground)}>
        <nav>nav</nav>
        <div>div</div>
      </div>
    </>
  )
}
