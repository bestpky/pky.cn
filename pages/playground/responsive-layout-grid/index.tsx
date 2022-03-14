import styles from './index.module.scss'

const mockArr = Array.from(Array(50), (v, k) => k)

export default function Layout() {
    return (
        <div className={styles.wrapper}>
            {mockArr.map(item => (
                <div key={item} className={styles.item}></div>
            ))}
        </div>
    )
}
