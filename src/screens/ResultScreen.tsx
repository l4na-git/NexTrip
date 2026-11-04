import { Button } from '../components/Button'
import { Placeholder } from '../components/Placeholder'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import type { Destination } from '../data/candidates'
import styles from './ResultScreen.module.css'

type Props = {
  destination: Destination
}

export function ResultScreen({ destination }: Props) {
  const openMap = () => {
    const query = encodeURIComponent(destination.name)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener')
  }

  const share = () => {
    if (navigator.share) {
      void navigator.share({ title: 'NexTrip', text: `${destination.name}に行こう` }).catch(() => {})
    }
  }

  return (
    <Screen orientation="landscape">
      <ScreenHeader />
      <div className={styles.body}>
        <section className={styles.decision}>
          <p className={styles.label}>みんなの反応を参考に決定</p>
          <h1 className={styles.title}>{destination.name}に行こう</h1>
          <p className={styles.meta}>
            {destination.eta}｜{destination.price}
          </p>
          <div className={styles.actions}>
            <Button onClick={openMap}>地図を開く</Button>
            <Button variant="soft" onClick={share}>
              共有
            </Button>
          </div>
        </section>
        <Placeholder label="［ 地図・目的地ピン ］" className={styles.map} />
      </div>
    </Screen>
  )
}
