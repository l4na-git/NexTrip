import { useEffect, useState, type CSSProperties } from 'react'
import { CameraPreview } from '../components/CameraPreview'
import { Placeholder } from '../components/Placeholder'
import { Screen } from '../components/Screen'
import { SmileBubbles } from '../components/SmileBubbles'
import { ScreenHeader } from '../components/ScreenHeader'
import { StopDialog } from '../components/StopDialog'
import { CANDIDATE_DURATION_MS } from '../../application/timing'
import type { AtmosphereImage } from '../../domain/model'
import type { CameraState } from '../hooks/useCamera'
import type { SmileStart } from '../hooks/useImageReaction'
import styles from './CandidateScreen.module.css'
import { SMILE_SYMBOLS } from './smileSymbols'

type Props = {
  camera: CameraState
  atmosphereImages: AtmosphereImage[]
  index: number
  // 見ていた画像の位置を渡して、次へ進む
  onNext: (index: number) => void
  onVideo: (video: HTMLVideoElement | null) => void
  // 誰かが笑顔になった瞬間。笑顔に反応する演出のきっかけにする
  smileStart: SmileStart | null
  onStop: () => void
  // いまの候補の計測を捨てて、最初から測り直す
  onResume: () => void
}

export function CandidateScreen({
  camera,
  atmosphereImages,
  index,
  onNext,
  onVideo,
  smileStart,
  onStop,
  onResume,
}: Props) {
  const image = atmosphereImages[index]
  const total = atmosphereImages.length
  const [confirming, setConfirming] = useState(false)
  // 確認から戻るたびに増やし、タイマーと進捗バーを 3 秒から張り直す
  const [round, setRound] = useState(0)

  // 候補ごとに 3 秒で自動的に次へ進む。index が変わるたびにタイマーを張り直す。
  // やめるかの確認中は進めない
  useEffect(() => {
    if (confirming) return
    const timer = window.setTimeout(() => onNext(index), CANDIDATE_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [index, onNext, confirming, round])

  const onOpenChange = (open: boolean) => {
    setConfirming(open)
    if (!open) {
      onResume()
      setRound((n) => n + 1)
    }
  }

  return (
    <Screen orientation="landscape">
      <SmileBubbles smileStart={smileStart} symbols={SMILE_SYMBOLS} />
      <div className={styles.top}>
        <ScreenHeader />
        <StopDialog onStop={onStop} onOpenChange={onOpenChange} />
      </div>
      <div className={styles.body}>
        <div className={styles.photoArea}>
          <Placeholder label={`［ 画像：${image.label} ］`} size="lg" className={styles.photo} />
        </div>
        <section className={styles.detail}>
          <div className={styles.info}>
            <p className={styles.count}>
              候補 {index + 1} / {total}
            </p>
            <h1 className={styles.name}>{image.label}</h1>
          </div>
          <CameraPreview
            {...camera}
            placeholder="ライブカメラ映像"
            variant="outline"
            onVideo={onVideo}
            radius={12}
            className={styles.camera}
          />
        </section>
      </div>

      <div className={styles.progress}>
        <ol className={styles.dots} aria-label={`候補 ${index + 1} / ${total}`}>
          {atmosphereImages.map((c, i) => (
            <li
              key={c.id}
              className={`${styles.dot} ${i < index ? styles.done : ''} ${i === index ? styles.current : ''}`}
              aria-current={i === index ? 'step' : undefined}
            />
          ))}
        </ol>
        <div className={styles.track} aria-hidden="true">
          <div
            key={`${index}-${round}`}
            className={styles.fill}
            style={{ '--duration': `${CANDIDATE_DURATION_MS}ms` } as CSSProperties}
          />
        </div>
        <button type="button" className={styles.next} onClick={() => onNext(index)}>
          {index + 1} / {total}&emsp;次の候補へ ›
        </button>
      </div>
    </Screen>
  )
}
