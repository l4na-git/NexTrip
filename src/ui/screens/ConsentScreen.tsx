import { Button } from '../components/Button'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import styles from './ConsentScreen.module.css'

const points = ['利用はこのセッション中だけ', '顔検出は端末内で処理', 'いつでも停止できます']

type Props = {
  onAgree: () => void
  onDecline: () => void
}

// 説明を読む画面なので縦向きで出す。横向きが前提のカメラ確認へ進むときに「画面を横にしてください」が出る
export function ConsentScreen({ onAgree, onDecline }: Props) {
  return (
    <Screen orientation="portrait">
      <ScreenHeader className={styles.header} />
      <section className={styles.explanation}>
        <h1 className={styles.title}>カメラ利用を確認</h1>
        <p className={styles.lead}>
          表情の変化を参考に、候補への反応を見やすくします。顔画像は保存しません。
        </p>
        <ul className={styles.points}>
          {points.map((point) => (
            <li key={point} className={styles.point}>
              <span className={styles.check} aria-hidden="true">
                ✓
              </span>
              {point}
            </li>
          ))}
        </ul>
      </section>
      <div className={styles.footer}>
        <p className={styles.note}>
          カメラを使わない場合、このアプリは利用できません。「同意しない」を選ぶとトップに戻ります。
        </p>
        <div className={styles.action}>
          <Button size="lg" fullWidth onClick={onAgree}>
            同意して始める
          </Button>
          <Button variant="soft" size="lg" fullWidth onClick={onDecline}>
            同意しない
          </Button>
        </div>
      </div>
    </Screen>
  )
}
