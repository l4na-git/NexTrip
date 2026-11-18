import { describe, expect, it } from 'vitest'
import type { Spot } from '../data/atmosphere'
import { rankSpots, reactionLabel } from './spotRanking'

const spot = (id: string, keywordIds: string[]): Spot => ({
  id,
  name: id,
  placeType: 'sea',
  keywordIds,
  lat: 0,
  lng: 0,
})

const spots = [spot('s1', ['a']), spot('s2', ['b', 'c']), spot('s3', ['c']), spot('s4', ['a', 'b'])]

describe('rankSpots', () => {
  it('関心度の高い順に並ぶ', () => {
    const ranked = rankSpots(spots, { a: 10, b: 30, c: 20 }, 4)
    expect(ranked.map((r) => r.spot.id)).toEqual(['s2', 's4', 's3', 's1'])
    expect(ranked.map((r) => r.interest)).toEqual([50, 40, 20, 10])
  })

  it('上位 count 件だけ返す(既定は 3 件)', () => {
    expect(rankSpots(spots, { a: 10, b: 30, c: 20 })).toHaveLength(3)
    expect(rankSpots(spots, { a: 10, b: 30, c: 20 }, 2)).toHaveLength(2)
  })

  it('同点は元の並びを保つ', () => {
    const ranked = rankSpots(spots, { a: 20, b: 20, c: 20 }, 4)
    expect(ranked.map((r) => r.spot.id)).toEqual(['s2', 's4', 's1', 's3'])
  })

  it('全員 0 のときは、元の並びの先頭から返す', () => {
    expect(rankSpots(spots, {}).map((r) => r.spot.id)).toEqual(['s1', 's2', 's3'])
  })
})

describe('reactionLabel', () => {
  it('関心度の区切りで文言が切り替わる', () => {
    expect(reactionLabel(50)).toContain('反応が良い')
    expect(reactionLabel(49)).toContain('関心が高そう')
    expect(reactionLabel(25)).toContain('関心が高そう')
    expect(reactionLabel(24)).toContain('もう少し検討')
    expect(reactionLabel(0)).toContain('もう少し検討')
  })
})
