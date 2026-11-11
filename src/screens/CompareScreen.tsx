import { Button } from '../components/Button'
import { CandidateCard } from '../components/CandidateCard'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import type { RankedSpot } from '../lib/spotRanking'
import styles from './CompareScreen.module.css'

type Props = {
  // 関心度の高い順のスポット
  ranked: RankedSpot[]
  // キーワード id ごとの、みんなの好みの割合
  percents: Record<string, number>
  selectedId: string
  onSelect: (id: string) => void
  onDecide: () => void
}

export function CompareScreen({ ranked, percents, selectedId, onSelect, onDecide }: Props) {
  return (
    <Screen orientation="landscape">
      <ScreenHeader />
      <h1 className={styles.title}>候補を比べる</h1>
      <div className={styles.cards}>
        {ranked.map(({ spot, interest }) => (
          <CandidateCard
            key={spot.id}
            spot={spot}
            interest={interest}
            percents={percents}
            selected={spot.id === selectedId}
            onSelect={() => onSelect(spot.id)}
          />
        ))}
      </div>
      <div className={styles.action}>
        <Button onClick={onDecide}>この候補に決める</Button>
      </div>
    </Screen>
  )
}
