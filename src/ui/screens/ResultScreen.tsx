import { Button } from '../components/Button'
import { Placeholder } from '../components/Placeholder'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import type { Spot } from '../../domain/model'
import styles from './ResultScreen.module.css'

type Props = {
  spot: Spot
  onRestart: () => void
}

export function ResultScreen({ spot, onRestart }: Props) {
  const openMap = () => {
    const query = encodeURIComponent(`${spot.lat},${spot.lng}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener')
  }

  const share = () => {
    if (navigator.share) {
      void navigator.share({ title: 'NexTrip', text: `${spot.name}に行こう` }).catch(() => {})
    }
  }

  return (
    <Screen orientation="landscape">
      <ScreenHeader />
      <div className={styles.body}>
        <section className={styles.decision}>
          <p className={styles.label}>みんなの反応を参考に決定</p>
          <h1 className={styles.title}>{spot.name}に行こう</h1>
          <div className={styles.actions}>
            <Button onClick={openMap}>地図を開く</Button>
            <Button variant="soft" onClick={share}>
              共有
            </Button>
          </div>
        </section>
        <Placeholder label="［ 地図・目的地ピン ］" className={styles.map} />
      </div>
      {/* 計測結果を捨てる操作なので、「地図を開く」から離れた右下に、目立ちすぎないサブの見た目で置く */}
      <div className={styles.footer}>
        <Button variant="soft" onClick={onRestart}>
          最初の画面に戻る
        </Button>
      </div>
    </Screen>
  )
}
