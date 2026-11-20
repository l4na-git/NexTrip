import { describe, expect, it } from 'vitest'
import { DEFAULT_SMILE_CONFIG } from '../domain/reaction/config'
import { ReactionMeasurement } from './reactionMeasurement'

const HOLD_MS = 1000

// 100ms 間隔で、同じスコアを durationMs ぶん流す。次に流し始める時刻を返す
function feed(measurement: ReactionMeasurement, from: number, durationMs: number, score: number | null) {
  let absent = false
  for (let t = from; t <= from + durationMs; t += 100) absent = measurement.update(t, score).absent
  return { next: from + durationMs + 100, absent }
}

describe('ReactionMeasurement', () => {
  it('笑顔が続いた画像は、関心度が高くなる', () => {
    const measurement = new ReactionMeasurement(DEFAULT_SMILE_CONFIG, HOLD_MS)
    feed(measurement, 0, 3000, 0.9)
    expect(measurement.finish().interest).toBeGreaterThan(80)
  })

  it('誰も写らない状態が続くと absent になる', () => {
    const measurement = new ReactionMeasurement(DEFAULT_SMILE_CONFIG, HOLD_MS)
    expect(feed(measurement, 0, 500, null).absent).toBe(false)
    expect(feed(measurement, 0, HOLD_MS, null).absent).toBe(true)
  })

  it('人が戻ったら、その画像はいなくなる前の計測を捨てて、最初から計測し直す', () => {
    const measurement = new ReactionMeasurement(DEFAULT_SMILE_CONFIG, HOLD_MS)
    // 笑顔のあと、いなくなり、無表情で戻る
    let { next } = feed(measurement, 0, 1500, 0.9)
    ;({ next } = feed(measurement, next, HOLD_MS, null))
    feed(measurement, next, 1500, 0)
    // いなくなる前の笑顔は数えない
    expect(measurement.finish().interest).toBe(0)
  })

  it('一瞬の検出落ちでは、計測を捨てない', () => {
    const measurement = new ReactionMeasurement(DEFAULT_SMILE_CONFIG, HOLD_MS)
    let { next } = feed(measurement, 0, 1500, 0.9)
    ;({ next } = feed(measurement, next, 300, null))
    feed(measurement, next, 1500, 0.9)
    expect(measurement.finish().interest).toBeGreaterThan(80)
  })

  it('reset で、計測と見つからない状態の両方を捨てる', () => {
    const measurement = new ReactionMeasurement(DEFAULT_SMILE_CONFIG, HOLD_MS)
    feed(measurement, 0, HOLD_MS, null)
    measurement.reset()
    expect(measurement.update(HOLD_MS + 100, null).absent).toBe(false)
    expect(measurement.finish().noFace).toBe(true)
  })
})
