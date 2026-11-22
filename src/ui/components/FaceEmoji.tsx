import { useState } from 'react'
import type { SmileStart } from '../hooks/useImageReaction'
import styles from './FaceEmoji.module.css'

const EMOJIS = ['😊', '😄', '😆', '🥰']
// 同時に出す数の上限(検出する最大人数と同じ)
const MAX_SHOWN = 5

type Shown = { key: string; text: string; x: number; y: number }

type Props = {
  smileStart: SmileStart | null
}

// 笑顔になった人の頭の上に、絵文字を一瞬だけ出す。位置は出した瞬間のまま追いかけない
export function FaceEmoji({ smileStart }: Props) {
  const [shown, setShown] = useState<Shown[]>([])
  const [lastId, setLastId] = useState(smileStart?.id)

  if (smileStart && smileStart.id !== lastId) {
    setLastId(smileStart.id)
    const { id, points } = smileStart
    const added = points.map((p, i) => ({ key: `${id}-${i}`, text: EMOJIS[(id + i) % EMOJIS.length], ...p }))
    setShown((prev) => [...prev, ...added].slice(-MAX_SHOWN))
  }

  return (
    <div className={styles.layer} aria-hidden="true">
      {shown.map((s) => (
        <span
          key={s.key}
          className={styles.emoji}
          style={{ left: s.x, top: s.y }}
          onAnimationEnd={() => setShown((prev) => prev.filter((p) => p.key !== s.key))}
        >
          {s.text}
        </span>
      ))}
    </div>
  )
}
