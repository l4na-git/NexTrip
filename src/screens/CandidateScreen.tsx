import { useEffect, type CSSProperties } from 'react'
import { CameraPreview } from '../components/CameraPreview'
import { Placeholder } from '../components/Placeholder'
import { Screen } from '../components/Screen'
import { ScreenHeader } from '../components/ScreenHeader'
import { CANDIDATE_DURATION_MS, categories } from '../data/candidates'
import type { CameraState } from '../hooks/useCamera'
import styles from './CandidateScreen.module.css'

type Props = {
  camera: CameraState
  index: number
  onNext: () => void
}

export function CandidateScreen({ camera, index, onNext }: Props) {
  const category = categories[index]
  const total = categories.length

  // 候補ごとに 3 秒で自動的に次へ進む。index が変わるたびにタイマーを張り直す。
  useEffect(() => {
    const timer = window.setTimeout(onNext, CANDIDATE_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [index, onNext])

  return (
    <Screen orientation="landscape">
      <ScreenHeader />
      <div className={styles.body}>
        <Placeholder label={`［ 行き先写真：${category.name} ］`} size="lg" className={styles.photo} />
        <section className={styles.detail}>
          <div className={styles.info}>
            <p className={styles.count}>
              候補 {index + 1} / {total}
            </p>
            <h1 className={styles.name}>{category.name}</h1>
          </div>
          <CameraPreview
            {...camera}
            placeholder="ライブカメラ映像"
            variant="outline"
            radius={12}
            className={styles.camera}
          />
        </section>
      </div>

      <div className={styles.progress}>
        <ol className={styles.dots} aria-label={`候補 ${index + 1} / ${total}`}>
          {categories.map((c, i) => (
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
