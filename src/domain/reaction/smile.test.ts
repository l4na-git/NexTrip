import { describe, expect, it } from 'vitest'
import { DEFAULT_SMILE_CONFIG, type SmileConfig } from './config'
import { interestPercent } from './interest'
import { faceSmileScore, groupSmileScore } from './score'
import { SmileTracker } from './SmileTracker'

// 平滑化なし・100ms 間隔で、指定したスコアの列を流して結果を返す
function run(scores: (number | null)[], overrides: Partial<SmileConfig> = {}) {
  const config = { ...DEFAULT_SMILE_CONFIG, smoothing: 1, ...overrides }
  const tracker = new SmileTracker(config)
  scores.forEach((score, i) => tracker.update(i * 100, score))
  return { tracker, config, result: tracker.result() }
}

describe('score', () => {
  it('1 人分は左右の平均になる', () => {
    expect(faceSmileScore(0.2, 0.6)).toBeCloseTo(0.4)
  })

  it('複数人は写っている全員の平均になる', () => {
    const faces = [
      { left: 0, right: 0, score: 0 },
      { left: 1, right: 1, score: 1 },
      { left: 0.5, right: 0.5, score: 0.5 },
    ]
    expect(groupSmileScore(faces)).toBeCloseTo(0.5)
  })

  it('誰も写っていなければ null になる', () => {
    expect(groupSmileScore([])).toBeNull()
  })
})

describe('SmileTracker', () => {
  it('常に閾値以上なら笑顔の割合は 1 になる', () => {
    const { result } = run(Array(11).fill(0.8))
    expect(result.smileRatio).toBe(1)
    expect(result.smileSeconds).toBeCloseTo(1)
    expect(result.meanIntensity).toBeCloseTo(0.8)
    expect(result.peak).toBeCloseTo(0.8)
  })

  it('常に閾値未満なら笑顔の割合は 0 になる', () => {
    const { result } = run(Array(11).fill(0.2))
    expect(result.smileRatio).toBe(0)
    expect(result.smileMs).toBe(0)
    expect(result.meanIntensity).toBeCloseTo(0.2)
    expect(result.meanSmilingIntensity).toBe(0)
    expect(result.noFace).toBe(false)
  })

  it('半分の時間だけ笑うと割合は約 0.5 になる', () => {
    // 先頭の 1 点は時間差が 0 なので、実際に積算されるのは 20 区間
    const scores = [0.2, ...Array(10).fill(0.2), ...Array(10).fill(0.8)]
    const { result } = run(scores)
    expect(result.smileRatio).toBeCloseTo(0.5)
    expect(result.meanSmilingIntensity).toBeCloseTo(0.8)
  })

  it('ヒステリシスで、閾値付近の揺れでも判定がちらつかない', () => {
    // threshold 0.5 / hysteresis 0.1: 一度笑顔に入ったら 0.4 を下回るまで続く
    const { result } = run([0.6, 0.45, 0.55, 0.45, 0.55, 0.45])
    expect(result.smileRatio).toBe(1)
  })

  it('閾値 - ヒステリシスを下回ると笑顔から抜ける', () => {
    const { result } = run([0.6, 0.6, 0.3, 0.3])
    expect(result.smileMs).toBe(100)
    expect(result.observedMs).toBe(300)
  })

  it('平滑化で、一瞬のスコアの跳ねを抑える', () => {
    const smoothed = run([0.1, 0.1, 0.9, 0.1, 0.1], { smoothing: 0.3 }).result
    const raw = run([0.1, 0.1, 0.9, 0.1, 0.1], { smoothing: 1 }).result
    expect(smoothed.peak).toBeLessThan(raw.peak)
  })

  it('顔なしの時間は分母に入らない', () => {
    const { result } = run([0.8, 0.8, null, null, null, 0.8, 0.8])
    expect(result.smileRatio).toBe(1)
    expect(result.observedMs).toBe(200)
  })

  it('顔が一度も検出されなければ計測できなかったことになる', () => {
    const { result, config } = run([null, null, null])
    expect(result.noFace).toBe(true)
    expect(result.smileRatio).toBe(0)
    expect(interestPercent(result, config)).toBe(0)
  })

  it('maxGapMs を超える間隔は上限で打ち切る', () => {
    const tracker = new SmileTracker({ ...DEFAULT_SMILE_CONFIG, smoothing: 1, maxGapMs: 200 })
    tracker.update(0, 0.8)
    tracker.update(5000, 0.8)
    expect(tracker.result().observedMs).toBe(200)
  })

  it('reset で積算を捨てる', () => {
    const { tracker } = run(Array(5).fill(0.8))
    tracker.reset()
    expect(tracker.result().noFace).toBe(true)
    expect(tracker.result().observedMs).toBe(0)
  })
})

describe('interestPercent', () => {
  it('時間と強さを重みで合成する', () => {
    // 割合 1.0 / 平均の強さ 0.8 を 0.5 : 0.5 で合成して 90
    const { result, config } = run(Array(11).fill(0.8))
    expect(interestPercent(result, config)).toBe(90)
  })

  it('重みを変えると結果も変わる', () => {
    const { result } = run(Array(11).fill(0.8))
    const timeOnly = { ...DEFAULT_SMILE_CONFIG, weights: { time: 1, intensity: 0 } }
    const intensityOnly = { ...DEFAULT_SMILE_CONFIG, weights: { time: 0, intensity: 1 } }
    expect(interestPercent(result, timeOnly)).toBe(100)
    expect(interestPercent(result, intensityOnly)).toBe(80)
  })

  it('0〜100 に収まる', () => {
    const { result, config } = run(Array(11).fill(1))
    expect(interestPercent(result, config)).toBeLessThanOrEqual(100)
    const low = run(Array(11).fill(0))
    expect(interestPercent(low.result, low.config)).toBeGreaterThanOrEqual(0)
  })

  it('重みの合計が 0 なら 0 を返す', () => {
    const { result } = run(Array(11).fill(0.8))
    const zero = { ...DEFAULT_SMILE_CONFIG, weights: { time: 0, intensity: 0 } }
    expect(interestPercent(result, zero)).toBe(0)
  })
})
