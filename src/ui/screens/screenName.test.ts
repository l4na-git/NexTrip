import { describe, expect, it } from 'vitest'
import { requiresLandscape } from './screenName'

describe('requiresLandscape', () => {
  it('開始・比較・結果は縦向きでも見られる', () => {
    expect(requiresLandscape('start')).toBe(false)
    expect(requiresLandscape('compare')).toBe(false)
    expect(requiresLandscape('result')).toBe(false)
  })

  it('同意・確認・候補は横向きが前提', () => {
    expect(requiresLandscape('consent')).toBe(true)
    expect(requiresLandscape('check')).toBe(true)
    expect(requiresLandscape('candidate')).toBe(true)
  })
})
