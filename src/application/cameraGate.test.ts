import { describe, expect, it } from 'vitest'
import { canStartCandidate } from './cameraGate'

const stream = {} as MediaStream

describe('canStartCandidate', () => {
  it('カメラが使えて検出の準備ができていれば進める', () => {
    expect(canStartCandidate({ stream, error: false }, true)).toBe(true)
  })

  it('カメラを拒否した(エラー)場合は進めない', () => {
    expect(canStartCandidate({ stream: null, error: true }, true)).toBe(false)
  })

  it('カメラの映像がまだ取れていない場合は進めない', () => {
    expect(canStartCandidate({ stream: null, error: false }, true)).toBe(false)
  })

  it('表情検出の準備ができていない場合は進めない', () => {
    expect(canStartCandidate({ stream, error: false }, false)).toBe(false)
  })
})
