import { CameraPreview } from '../components/CameraPreview'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import { StopDialog } from '../components/StopDialog'
import type { CameraState } from '../hooks/useCamera'
import styles from './NoFaceScreen.module.css'

type Props = {
  camera: CameraState
  onVideo: (video: HTMLVideoElement | null) => void
  onStop: () => void
}

// 候補表示中に誰も写らなくなったときの注意画面(仮)。人が見つかると自動で候補表示に戻る。
export function NoFaceScreen({ camera, onVideo, onStop }: Props) {
  return (
    <Screen orientation="landscape">
      <div className={styles.top}>
        <ScreenHeader />
        <StopDialog onStop={onStop} />
      </div>
      <div className={styles.body}>
        <section className={styles.text} role="alert">
          <span className={styles.mark} aria-hidden="true">
            ?
          </span>
          <h1 className={styles.title}>誰も見つかりません。</h1>
          <p className={styles.lead}>カメラに顔が映る位置に集まってください。見つかると、同じ候補から再開します。</p>
        </section>
        <CameraPreview
          {...camera}
          placeholder="カメラを起動中…"
          onVideo={onVideo}
          className={styles.preview}
        />
      </div>
    </Screen>
  )
}
