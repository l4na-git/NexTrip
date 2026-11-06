import styles from './ThresholdPage.module.css'

type Props = {
  label: string
  value: number | null
  // 笑顔と判定する閾値と、笑顔から抜ける閾値(任意)
  threshold?: number
  exit?: number
}

export function Meter({ label, value, threshold, exit }: Props) {
  const percent = (v: number) => `${Math.min(Math.max(v, 0), 1) * 100}%`
  return (
    <div className={styles.meterRow}>
      <span className={styles.meterLabel}>{label}</span>
      <div className={styles.meterTrack}>
        {value !== null && <div className={styles.meterFill} style={{ width: percent(value) }} />}
        {exit !== undefined && <div className={styles.meterExit} style={{ left: percent(exit) }} />}
        {threshold !== undefined && (
          <div className={styles.meterThreshold} style={{ left: percent(threshold) }} />
        )}
      </div>
      <span className={styles.meterValue}>{value === null ? '--' : value.toFixed(2)}</span>
    </div>
  )
}
