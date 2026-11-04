import type { Destination } from '../data/candidates'
import { InterestBar } from './InterestBar'
import { Placeholder } from './Placeholder'
import styles from './CandidateCard.module.css'

type Props = {
  destination: Destination
  selected: boolean
  onSelect: () => void
}

export function CandidateCard({ destination, selected, onSelect }: Props) {
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
      <InterestBar value={destination.interest} />
    </button>
  )
}
