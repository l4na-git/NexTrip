import { useEffect, type CSSProperties } from 'react'
import { CameraPreview } from '../components/CameraPreview'
import { Placeholder } from '../components/Placeholder'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import { CANDIDATE_DURATION_MS } from '../../application/timing'
import type { AtmosphereImage } from '../../domain/model'
import type { CameraState } from '../hooks/useCamera'
import styles from './CandidateScreen.module.css'

type Props = {
  camera: CameraState
  atmosphereImages: AtmosphereImage[]
  index: number
  onNext: () => void
  onVideo: (video: HTMLVideoElement | null) => void
}

export function CandidateScreen({ camera, atmosphereImages, index, onNext, onVideo }: Props) {
  const image = atmosphereImages[index]
  const total = atmosphereImages.length

  // 候補ごとに 3 秒で自動的に次へ進む。index が変わるたびにタイマーを張り直す。
  useEffect(() => {
    const timer = window.setTimeout(onNext, CANDIDATE_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [index, onNext])

  return (
    <Screen orientation="landscape">
      <ScreenHeader />
      <div className={styles.body}>
        <Placeholder label={`［ 画像：${image.label} ］`} size="lg" className={styles.photo} />
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
            key={index}
            className={styles.fill}
            style={{ '--duration': `${CANDIDATE_DURATION_MS}ms` } as CSSProperties}
          />
        </div>
        <button type="button" className={styles.next} onClick={onNext}>
          {index + 1} / {total}&emsp;次の候補へ ›
        </button>
      </div>
    </Screen>
  )
}
