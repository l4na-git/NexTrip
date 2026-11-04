import { Button } from '../components/Button'
import { CandidateCard } from '../components/CandidateCard'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import { destinations } from '../data/candidates'
import styles from './CompareScreen.module.css'

type Props = {
  selectedId: string
  onSelect: (id: string) => void
  onDecide: () => void
}

export function CompareScreen({ selectedId, onSelect, onDecide }: Props) {
  return (
    <Screen orientation="landscape">
      <ScreenHeader />
      <h1 className={styles.title}>候補を比べる</h1>
      <div className={styles.cards}>
        {destinations.map((destination) => (
          <CandidateCard
            key={destination.id}
            destination={destination}
            selected={destination.id === selectedId}
            onSelect={() => onSelect(destination.id)}
          />
        ))}
      </div>
      <div className={styles.action}>
        <Button onClick={onDecide}>この候補に決める</Button>
      </div>
    </Screen>
  )
}
