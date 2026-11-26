import { Button } from '../components/Button'
import { CameraPreview } from '../components/CameraPreview'
import { Screen } from '../components/Screen'
import { SmileBubbles } from '../components/SmileBubbles'
import { SMILE_SYMBOLS } from './smileSymbols'
import { ScreenHeader } from '../components/ScreenHeader'
import type { CameraErrorReason, CameraState } from '../hooks/useCamera'
import { canStartCandidate } from '../../application/cameraGate'
import type { SmileMeterStatus } from '../hooks/useSmileMeter'
import type { SmileStart } from '../hooks/useImageReaction'
import styles from './CheckScreen.module.css'

// カメラが使えない原因ごとの案内。確認を閉じただけなら再試行で許可を求め直せるので、設定への案内はその次に置く
const cameraErrorGuides: Record<CameraErrorReason, { title: string; lead: string; retryable: boolean }> = {
  denied: {
    title: 'カメラを許可してください',
    lead: '「もう一度試す」を押し、カメラの使用を求められたら「許可」を選んでください。確認が表示されない場合は、ブラウザの設定(サイトの権限)でこのサイトのカメラを許可してから、もう一度お試しください。',
    retryable: true,
  },
  inUse: {
    title: 'カメラを使えません',
    lead: '他のアプリがカメラを使っているか、カメラが切断された可能性があります。他のアプリを閉じて、「もう一度試す」を押してください。',
    retryable: true,
  },
  notFound: {
    title: 'カメラが見つかりません',
    lead: 'インカメラのある端末で開いてください。',
    retryable: false,
  },
  insecure: {
    title: 'このページではカメラを使えません',
    lead: 'カメラは HTTPS の安全な接続でのみ使えます。正しい URL(https://〜)で開き直してください。',
    retryable: false,
  },
  unknown: {
    title: 'カメラを起動できませんでした',
    lead: 'ブラウザの許可と他のアプリの使用状況を確認して、「もう一度試す」を押してください。',
    retryable: true,
  },
}

const tips = ['全員の顔が枠の中に入っているか', '明るさは十分か', '顔が隠れていないか']

type Props = {
  camera: CameraState
  // 表情を検出するモデルの読み込み状況。準備ができるまで次へ進ませない
  detector: SmileMeterStatus
  // 誰かが笑顔になった瞬間。笑顔に反応する演出のきっかけにする
  smileStart: SmileStart | null
  onVideo: (video: HTMLVideoElement | null) => void
  onRetry: () => void
  onConfirm: () => void
  // カメラが使えないときの操作。許可を変えたあとの取得のやり直しと、トップへの戻り
  onRetryCamera: () => void
  onBack: () => void
}

export function CheckScreen({ camera, detector, smileStart, onVideo, onRetry, onConfirm, onRetryCamera, onBack }: Props) {
  const guide = camera.error ? cameraErrorGuides[camera.reason ?? 'unknown'] : null
  const canStart = canStartCandidate(camera, detector === 'ready')
  return (
    <Screen orientation="landscape">
      <SmileBubbles smileStart={smileStart} symbols={SMILE_SYMBOLS} />
      <ScreenHeader />
      <div className={styles.body}>
        <section className={styles.explanation}>
          <div className={styles.text}>
            {guide ? (
              <>
                <h1 className={styles.title}>{guide.title}</h1>
                <p className={styles.panel} role="alert">
                  {guide.lead}
                </p>
              </>
            ) : (
              <>
                <h1 className={styles.title}>全員写っているか確認</h1>
                <p className={styles.lead}>
                  スマホの位置を調整して、参加する人全員がプレビューに写るようにしてください。
                </p>
                <ul className={`${styles.panel} ${styles.tips}`}>
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
            {guide?.retryable ? (
              <div className={`${styles.buttons} ${styles.split}`}>
                <Button variant="soft" onClick={onBack}>
                  やめる
                </Button>
                <Button onClick={onRetryCamera}>もう一度試す</Button>
              </div>
            ) : guide ? (
              // 試し直せないときは戻るしかないので、行き先をそのまま書く
              <Button variant="soft" onClick={onBack}>
                最初の画面に戻る
              </Button>
            ) : detector === 'error' ? (
              <>
                <p className={`${styles.panel} ${styles.error}`} role="alert">
                  表情を検出できませんでした。
                </p>
                <div className={`${styles.buttons} ${styles.split}`}>
                  <Button variant="soft" onClick={onBack}>
                    やめる
                  </Button>
                  <Button onClick={onRetry}>もう一度読み込む</Button>
                </div>
              </>
            ) : (
              <div className={`${styles.buttons} ${styles.split}`}>
                <Button variant="soft" onClick={onBack}>
                  やめる
                </Button>
                <Button disabled={!canStart} onClick={onConfirm}>
                  {canStart ? 'はじめる' : '準備中…'}
                </Button>
              </div>
            )}
          </div>
        </section>
        <CameraPreview {...camera} placeholder="カメラを起動中…" onVideo={onVideo} className={styles.preview} />
      </div>
    </Screen>
  )
}
