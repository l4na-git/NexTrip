import styles from './StackedInterestBar.module.css'

export type Segment = {
  id: string
  label: string
  percent: number
}

type Props = {
  // 割合の大きい順。バー全体の長さが関心度になる
  segments: Segment[]
}

// 区切りの濃さ(大きい順)。キーワードが多いときは最後の濃さを使う
const shades = [1, 0.7, 0.45, 0.3]
const shadeOf = (index: number) => shades[Math.min(index, shades.length - 1)]

export function StackedInterestBar({ segments }: Props) {
  const total = Math.min(
    100,
    segments.reduce((sum, s) => sum + s.percent, 0),
  )
  return (
    <div className={styles.wrap}>
      <div
        className={styles.track}
        role="meter"
        aria-label="関心度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={total}
      >
        {segments.map((s, i) =>
          s.percent > 0 ? (
            <div
              key={s.id}
              className={styles.segment}
              style={{ width: `${s.percent}%`, opacity: shadeOf(i) }}
            />
          ) : null,
        )}
      </div>
      <ul className={styles.legend}>
        {segments.map((s, i) => (
          <li key={s.id} className={styles.item}>
            <span className={styles.dot} style={{ opacity: shadeOf(i) }} aria-hidden="true" />
            {s.label} {s.percent}%
          </li>
        ))}
      </ul>
    </div>
  )
}
