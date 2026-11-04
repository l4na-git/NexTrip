import { Button } from '../components/Button'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import styles from './ConsentScreen.module.css'

const points = ['利用はこのセッション中だけ', '顔検出は端末内で処理', 'いつでも停止できます']

type Props = {
  onAgree: () => void
}

export function ConsentScreen({ onAgree }: Props) {
  return (
    <Screen orientation="landscape">
      <ScreenHeader />
      <div className={styles.body}>
        <section className={styles.explanation}>
          <h1 className={styles.title}>カメラ利用を確認</h1>
          <p className={styles.lead}>
            表情の変化を参考に、候補への反応を見やすくします。顔画像は保存しません。
          </p>
          <ul className={styles.points}>
            {points.map((point) => (
              <li key={point} className={styles.point}>
                <span aria-hidden="true">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className={styles.action}>
        <Button onClick={onAgree}>同意して始める</Button>
      </div>
    </Screen>
  )
}
