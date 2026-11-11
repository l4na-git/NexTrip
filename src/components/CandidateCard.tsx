import { keywords, type Spot } from '../data/atmosphere'
import { reactionLabel } from '../lib/spotRanking'
import { Placeholder } from './Placeholder'
import { StackedInterestBar, type Segment } from './StackedInterestBar'
import styles from './CandidateCard.module.css'

type Props = {
  spot: Spot
  // スポットの関心度(0〜100)
  interest: number
  // キーワード id ごとの、みんなの好みの割合
  percents: Record<string, number>
  selected: boolean
  onSelect: () => void
}

export function CandidateCard({ spot, interest, percents, selected, onSelect }: Props) {
  const segments: Segment[] = spot.keywordIds
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
      <span className={styles.name}>{spot.name}</span>
      <span className={styles.reaction}>{reactionLabel(interest)}</span>
      <StackedInterestBar segments={segments} />
    </button>
  )
}
