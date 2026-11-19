import { keywords, type Spot } from '../data/atmosphere'
import { reactionLevel, type ReactionLevel } from '../lib/spotRanking'
import { Placeholder } from './Placeholder'
import { StackedInterestBar, type Segment } from './StackedInterestBar'
import styles from './CandidateCard.module.css'

const reactionText: Record<ReactionLevel, string> = {
  high: '表情からの推定：反応が良い',
  medium: '表情からの推定：関心が高そう',
  low: '表情からの推定：もう少し検討',
}

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
      <span className={styles.reaction}>{reactionText[reactionLevel(interest)]}</span>
      <StackedInterestBar segments={segments} />
    </button>
  )
}
