import { Button } from '../components/Button'
import { CandidateCard } from '../components/CandidateCard'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import type { CandidateCardView } from '../presenters/candidateCards'
import styles from './CompareScreen.module.css'

type Props = {
  // 関心度の高い順のカード
  cards: CandidateCardView[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDecide: () => void
}

export function CompareScreen({ cards, selectedId, onSelect, onDecide }: Props) {
  return (
    <Screen orientation="landscape">
      <ScreenHeader />
      <h1 className={styles.title}>候補を比べる</h1>
      <div className={styles.cards}>
        {cards.map((card) => (
          <CandidateCard
            key={card.spotId}
            card={card}
            selected={card.spotId === selectedId}
            onSelect={() => onSelect(card.spotId)}
          />
        ))}
      </div>
      <div className={styles.action}>
        <Button onClick={onDecide}>この候補に決める</Button>
      </div>
    </Screen>
  )
}
