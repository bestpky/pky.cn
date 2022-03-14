import { useEffect, useState } from 'react'
import classnames from 'classnames'

import styles from './index.module.scss'

export default function Demo1() {
    const [visible, setVisible] = useState(false)
    const [isShow, setIsShow] = useState(false)

    useEffect(() => {
        if (visible) {
            setTimeout(() => {
                setIsShow(true)
            }, 10)
        }
    }, [visible])

    return (
        <div className={styles.demo}>
            <div className={styles.sider}>
                <button
                    onClick={() => {
                        if (visible) {
                            setIsShow(false)
                            setTimeout(() => {
                                setVisible(false)
                            }, 300)
                        } else {
                            setVisible(true)
                        }
                    }}
                >
                    点击
                </button>
            </div>
            不使用react-transition-group
            {visible && (
                <div className={classnames(styles.drawer, styles.demo1, isShow && styles.show)}>
                    抽屉隐藏时会卸载元素
                </div>
            )}
        </div>
    )
}
