import { useState } from 'react'
import type { SmileStart } from '../hooks/useImageReaction'
import styles from './SmileBubbles.module.css'
import { burst, type Bubble } from './smileBubbleBurst'

// 同時に浮かぶ数の上限。笑い続けても画面がにぎやかになりすぎないようにする
const MAX_BUBBLES = 10

type Props = {
  smileStart: SmileStart | null
  symbols: string[]
}

// 笑顔になった瞬間に、画面の背景を下から上へいくつか浮かべる(文字やボタンの後ろに置く)
export function SmileBubbles({ smileStart, symbols }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [lastId, setLastId] = useState(smileStart?.id)

  if (smileStart && smileStart.id !== lastId) {
    setLastId(smileStart.id)
    const added = burst(smileStart.id, symbols)
    setBubbles((prev) => [...prev, ...added].slice(-MAX_BUBBLES))
  }

  return (
    <div className={styles.layer} aria-hidden="true">
      {bubbles.map((b) => (
        <span
          key={b.key}
          className={styles.bubble}
          style={{ left: `${b.left}%`, animationDelay: `${b.delay}s` }}
          onAnimationEnd={() => setBubbles((prev) => prev.filter((p) => p.key !== b.key))}
        >
          {b.symbol}
        </span>
      ))}
    </div>
  )
}
