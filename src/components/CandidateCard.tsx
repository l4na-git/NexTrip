import { keywords } from '../data/atmosphere'
import type { Destination } from '../data/candidates'
import { Placeholder } from './Placeholder'
import { StackedInterestBar, type Segment } from './StackedInterestBar'
import styles from './CandidateCard.module.css'

type Props = {
  destination: Destination
  // キーワード id ごとの、みんなの好みの割合
  percents: Record<string, number>
  selected: boolean
  onSelect: () => void
}

export function CandidateCard({ destination, percents, selected, onSelect }: Props) {
  const segments: Segment[] = destination.keywordIds
    .map((id) => ({
      id,
      label: keywords.find((k) => k.id === id)?.label ?? id,
      percent: percents[id] ?? 0,
    }))
    .sort((a, b) => b.percent - a.percent)

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <Placeholder label="［ 写真 ］" size="sm" radius={8} className={styles.photo} />
      <span className={styles.name}>{destination.name}</span>
      <span className={styles.reaction}>{destination.reaction}</span>
      <StackedInterestBar segments={segments} />
    </button>
  )
}
