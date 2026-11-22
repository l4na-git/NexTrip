// 笑顔になった瞬間に浮かべる数
const MIN_PER_SMILE = 3
const MAX_PER_SMILE = 5
// 横幅を区切る数。1 回に出すものは別々の区画に置き、重ならないようにする
const SLOTS = 8

export type Bubble = { key: string; symbol: string; left: number; delay: number }

// id から決まる疑似乱数(0〜1)。描画中に Math.random を呼ばずに、毎回ちがう並びにする
function seeded(seed: number) {
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

// 1 回分。数・区画・区画内の位置・出るタイミングをばらす
export function burst(id: number, symbols: string[]): Bubble[] {
  const random = seeded(id)
  const count = MIN_PER_SMILE + Math.floor(random() * (MAX_PER_SMILE - MIN_PER_SMILE + 1))
  const slots = Array.from({ length: SLOTS }, (_, i) => i)
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[slots[i], slots[j]] = [slots[j], slots[i]]
  }
  const width = 100 / SLOTS
  return slots.slice(0, count).map((slot, i) => ({
    key: `${id}-${i}`,
    symbol: symbols[Math.floor(random() * symbols.length)],
    // 区画の端どうしで隣と重ならないよう、区画の内側 (20%〜80%) に置く
    left: (slot + 0.2 + random() * 0.6) * width,
    delay: random() * 0.8,
  }))
}
