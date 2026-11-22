import type { CandidateCardView } from '../presenters/candidateCards'
import { Placeholder } from './Placeholder'
import { StackedInterestBar } from './StackedInterestBar'
import styles from './CandidateCard.module.css'

type Props = {
  card: CandidateCardView
  selected: boolean
  onSelect: () => void
}

export function CandidateCard({ card, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className={styles.photoArea}>
        <Placeholder label="［ 写真 ］" size="sm" radius={8} className={styles.photo} />
      </span>
      <span className={styles.name}>{card.name}</span>
      <span className={styles.reaction}>{card.reaction}</span>
      <StackedInterestBar segments={card.segments} />
    </button>
  )
}
