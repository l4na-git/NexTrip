import { Button } from '../components/Button'
import { CameraPreview } from '../components/CameraPreview'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import type { CameraState } from '../hooks/useCamera'
import { canStartCandidate } from '../lib/cameraGate'
import type { SmileMeterStatus } from '../lib/smile/useSmileMeter'
import styles from './CheckScreen.module.css'

const tips = ['全員の顔が枠の中に入っているか', '明るさは十分か', '顔が隠れていないか']

type Props = {
  camera: CameraState
  // 表情を検出するモデルの読み込み状況。準備ができるまで次へ進ませない
  detector: SmileMeterStatus
  onRetry: () => void
  onConfirm: () => void
  // カメラが使えないときの操作。許可を変えたあとの取得のやり直しと、トップへの戻り
  onRetryCamera: () => void
  onBack: () => void
}

export function CheckScreen({ camera, detector, onRetry, onConfirm, onRetryCamera, onBack }: Props) {
  return (
    <Screen orientation="landscape">
      <ScreenHeader />
      <div className={styles.body}>
        <section className={styles.explanation}>
          <div className={styles.text}>
            {camera.error ? (
              <>
                <h1 className={styles.title}>カメラを許可してください</h1>
                <p className={styles.lead}>
                  アドレスバーのカメラのアイコンから許可して、「もう一度試す」を押してください。他のアプリがカメラを使っていないかも確認してください。
                </p>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
          <div className={styles.action}>
            {camera.error ? (
              <div className={styles.buttons}>
                <Button variant="soft" onClick={onBack}>
                  トップに戻る
                </Button>
                <Button onClick={onRetryCamera}>もう一度試す</Button>
              </div>
            ) : detector === 'error' ? (
              <>
                <p className={styles.error} role="alert">
                  表情の検出を準備できませんでした。
                </p>
                <Button onClick={onRetry}>もう一度読み込む</Button>
              </>
            ) : (
              <Button disabled={!canStartCandidate(camera, detector === 'ready')} onClick={onConfirm}>
                {canStartCandidate(camera, detector === 'ready') ? '全員写っています' : '準備中…'}
              </Button>
            )}
          </div>
        </section>
        <CameraPreview {...camera} placeholder="カメラを起動中…" className={styles.preview} />
      </div>
    </Screen>
  )
}
