import { describe, expect, it } from 'vitest'
import { DEFAULT_SMILE_CONFIG } from './config'
import { ImageReactionRecorder, NoFaceWatcher } from './imageReaction'

// 100ms 間隔で、同じスコアを durationMs ぶん流す
function feed(recorder: ImageReactionRecorder, from: number, durationMs: number, score: number | null) {
  for (let t = from; t <= from + durationMs; t += 100) recorder.update(t, score)
  return from + durationMs + 100
}

describe('ImageReactionRecorder', () => {
  it('笑顔が続いた画像は関心度が高い', () => {
    const recorder = new ImageReactionRecorder(DEFAULT_SMILE_CONFIG)
    feed(recorder, 0, 3000, 0.9)
    const reaction = recorder.finish()
    expect(reaction.noFace).toBe(false)
    expect(reaction.interest).toBeGreaterThan(80)
  })

  it('finish() のあとは、次の画像の計測が最初から始まる', () => {
    const recorder = new ImageReactionRecorder(DEFAULT_SMILE_CONFIG)
    const next = feed(recorder, 0, 3000, 0.9)
    recorder.finish()
    feed(recorder, next, 3000, 0)
    expect(recorder.finish().interest).toBe(0)
  })

  it('顔が写らなかった画像は noFace になる', () => {
    const recorder = new ImageReactionRecorder(DEFAULT_SMILE_CONFIG)
    feed(recorder, 0, 3000, null)
    expect(recorder.finish()).toEqual({ interest: 0, noFace: true })
  })

  it('reset() で途中までの計測を捨てる', () => {
    const recorder = new ImageReactionRecorder(DEFAULT_SMILE_CONFIG)
    feed(recorder, 0, 1500, 0.9)
    recorder.reset()
    expect(recorder.finish().noFace).toBe(true)
  })
})

describe('NoFaceWatcher', () => {
  it('誰も写っていない状態が一定時間続くまでは、見つからないと判断しない', () => {
    const watcher = new NoFaceWatcher(1000)
    expect(watcher.update(0, null).absent).toBe(false)
    expect(watcher.update(900, null).absent).toBe(false)
    expect(watcher.update(1000, null).absent).toBe(true)
  })

  it('一瞬の検出落ちは数えない', () => {
    const watcher = new NoFaceWatcher(1000)
    watcher.update(0, null)
    watcher.update(500, 0.2)
    // 顔が戻ったので、ここから数え直す
    expect(watcher.update(1200, null).absent).toBe(false)
    expect(watcher.update(2100, null).absent).toBe(false)
    expect(watcher.update(2200, null).absent).toBe(true)
  })

  it('人が戻った最初のフレームだけ returned になる', () => {
    const watcher = new NoFaceWatcher(1000)
    watcher.update(0, null)
    watcher.update(1000, null)
    expect(watcher.update(1100, 0.3)).toEqual({ absent: false, returned: true })
    expect(watcher.update(1200, 0.3)).toEqual({ absent: false, returned: false })
  })
})
