import { describe, expect, it } from 'vitest'
import { nextSmiles } from './smileStart'

const config = { threshold: 0.5, hysteresis: 0.1 }
const faces = (...scores: number[]) => scores.map((score) => ({ left: score, right: score, score }))

describe('nextSmiles: 笑顔になった瞬間', () => {
  it('閾値を超えた最初のフレームだけ、笑顔になった人として返す', () => {
    const first = nextSmiles([], faces(0.6, 0.2), config)
    expect(first).toEqual({ smiling: [true, false], started: [0] })

    const second = nextSmiles(first.smiling, faces(0.7, 0.2), config)
    expect(second.started).toEqual([])
  })

  it('笑顔のあいだは threshold - hysteresis まで下がっても笑顔のまま', () => {
    const kept = nextSmiles([true], faces(0.45), config)
    expect(kept).toEqual({ smiling: [true], started: [] })

    const ended = nextSmiles(kept.smiling, faces(0.35), config)
    expect(ended.smiling).toEqual([false])
    expect(nextSmiles(ended.smiling, faces(0.6), config).started).toEqual([0])
  })
})
