import { describe, expect, it } from 'vitest'
import { burst } from './smileBubbleBurst'

describe('burst: 笑顔 1 回分の浮かべるもの', () => {
  it('3〜5 個を、別々の区画(12.5% 幅)に置く', () => {
    for (let id = 1; id <= 200; id++) {
      const bubbles = burst(id, ['a', 'b'])
      expect(bubbles.length).toBeGreaterThanOrEqual(3)
      expect(bubbles.length).toBeLessThanOrEqual(5)
      const slots = bubbles.map((b) => Math.floor(b.left / 12.5))
      expect(new Set(slots).size).toBe(bubbles.length)
      bubbles.forEach((b) => expect(b.delay).toBeLessThan(0.8))
    }
  })
})
