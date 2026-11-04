import styles from './InterestBar.module.css'

type Props = {
  value: number
}

export function InterestBar({ value }: Props) {
  return (
    <div
      className={styles.track}
      role="meter"
      aria-label="関心度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div className={styles.fill} style={{ width: `${value}%` }} />
    </div>
  )
}
