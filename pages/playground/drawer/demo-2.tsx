import { useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import classnames from 'classnames'

import styles from './index.module.scss'
import slideStyle from './slide.module.scss'

export default function Demo2() {
    const [visible, setVisible] = useState(false)

    return (
        <div className={styles.demo}>
            <div className={styles.sider}>
                <button onClick={() => setVisible(!visible)}>点击</button>
            </div>
            使用react-transition-group
            <CSSTransition unmountOnExit in={visible} timeout={300} classNames={slideStyle}>
                <div className={classnames(styles.drawer)}>抽屉隐藏时会卸载元素</div>
            </CSSTransition>
        </div>
    )
}
