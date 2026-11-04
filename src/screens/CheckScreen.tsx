import { Button } from '../components/Button'
import { CameraPreview } from '../components/CameraPreview'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import type { CameraState } from '../hooks/useCamera'
import styles from './CheckScreen.module.css'

const tips = ['全員の顔が枠の中に入っているか', '明るさは十分か', '顔が隠れていないか']

type Props = {
  camera: CameraState
  onConfirm: () => void
}

export function CheckScreen({ camera, onConfirm }: Props) {
  return (
    <Screen orientation="landscape">
      <ScreenHeader />
      <div className={styles.body}>
        <section className={styles.explanation}>
          <div className={styles.text}>
            <h1 className={styles.title}>みんなが写っているか確認</h1>
            <p className={styles.lead}>
              スマホの位置を調整して、参加する人全員がプレビューに写るようにしてください。
            </p>
            <ul className={styles.tips}>
              {tips.map((tip) => (
                <li key={tip} className={styles.tip}>
                  <span aria-hidden="true">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.action}>
            <Button onClick={onConfirm}>全員写っています</Button>
          </div>
        </section>
        <CameraPreview {...camera} placeholder="カメラを起動中…" className={styles.preview} />
      </div>
    </Screen>
  )
}
