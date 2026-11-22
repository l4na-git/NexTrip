import { useState } from 'react'
import type { SmileStart } from '../hooks/useImageReaction'
import styles from './SmileBubbles.module.css'

// 同時に浮かぶ数の上限。笑い続けても画面がにぎやかになりすぎないようにする
const MAX_BUBBLES = 3

type Bubble = { id: number; symbol: string; left: number }

type Props = {
  smileStart: SmileStart | null
  symbols: string[]
}

// 笑顔になった瞬間に 1 つだけ、画面の背景を下から上へ浮かべる(文字やボタンの後ろに置く)
export function SmileBubbles({ smileStart, symbols }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [lastId, setLastId] = useState(smileStart?.id)

  if (smileStart && smileStart.id !== lastId) {
    setLastId(smileStart.id)
    const { id } = smileStart
    // 横位置は id から決めて、続けて出ても重ならないようにばらす
    const bubble = { id, symbol: symbols[id % symbols.length], left: 10 + ((id * 37) % 80) }
    setBubbles((prev) => [...prev, bubble].slice(-MAX_BUBBLES))
  }

  return (
    <div className={styles.layer} aria-hidden="true">
      {bubbles.map((b) => (
        <span
          key={b.id}
          className={styles.bubble}
          style={{ left: `${b.left}%` }}
          onAnimationEnd={() => setBubbles((prev) => prev.filter((p) => p.id !== b.id))}
        >
          {b.symbol}
        </span>
      ))}
    </div>
  )
}
