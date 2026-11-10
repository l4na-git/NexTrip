import { describe, expect, it } from 'vitest'
import type { AtmosphereImage, Keyword } from '../data/atmosphere'
import {
  bestDestinationId,
  destinationInterest,
  keywordShares,
  percentById,
} from './keywordShare'

const keywords: Keyword[] = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
  { id: 'c', label: 'C' },
]

const image = (id: AtmosphereImage['id'], keywordIds: string[]): AtmosphereImage => ({
  id,
  placeType: id,
  image: { src: null },
  keywordIds,
})

const images = [image('sea', ['a', 'b']), image('cafe', ['b', 'c']), image('onsen', ['c'])]

const sum = (shares: { percent: number }[]) => shares.reduce((a, s) => a + s.percent, 0)

describe('keywordShares', () => {
  it('1 画像だけ反応があれば、その画像のキーワードで合計 100% になる', () => {
    const shares = keywordShares({ sea: { interest: 80, noFace: false } }, images, keywords)
    expect(shares.map((s) => s.keywordId).sort()).toEqual(['a', 'b'])
    expect(sum(shares)).toBe(100)
  })

  it('複数の画像で共通のキーワードは割合が大きくなる', () => {
    const shares = keywordShares(
      { sea: { interest: 50, noFace: false }, cafe: { interest: 50, noFace: false } },
      images,
      keywords,
    )
    expect(shares[0].keywordId).toBe('b')
    expect(shares[0].percent).toBeGreaterThan(shares[1].percent)
  })

  it('端数があっても合計が 100 になる', () => {
    const shares = keywordShares(
      {
        sea: { interest: 33, noFace: false },
        cafe: { interest: 33, noFace: false },
        onsen: { interest: 33, noFace: false },
      },
      images,
      keywords,
    )
    expect(sum(shares)).toBe(100)
  })

  it('割合の大きい順に並ぶ', () => {
    const shares = keywordShares(
      { sea: { interest: 10, noFace: false }, onsen: { interest: 90, noFace: false } },
      images,
      keywords,
    )
    expect(shares.map((s) => s.percent)).toEqual([...shares.map((s) => s.percent)].sort((a, b) => b - a))
    expect(shares[0].keywordId).toBe('c')
  })

  it('reactions に無い画像は無視される', () => {
    const shares = keywordShares({ onsen: { interest: 60, noFace: false } }, images, keywords)
    expect(shares).toEqual([{ keywordId: 'c', label: 'C', percent: 100 }])
  })

  it('関心度がすべて 0(noFace を含む)のときは空', () => {
    expect(keywordShares({}, images, keywords)).toEqual([])
    expect(
      keywordShares({ sea: { interest: 0, noFace: true }, cafe: { interest: 0, noFace: false } }, images, keywords),
    ).toEqual([])
  })
})

describe('percentById', () => {
  it('集計にないキーワードは 0 になる', () => {
    const percents = percentById([{ keywordId: 'a', label: 'A', percent: 100 }])
    expect(percents.a).toBe(100)
    expect(percents.b ?? 0).toBe(0)
  })
})

describe('destinationInterest', () => {
  it('スポットのキーワードの割合の合計になる', () => {
    expect(destinationInterest(['a', 'b'], { a: 40, b: 25, c: 35 })).toBe(65)
  })

  it('100 を超えない', () => {
    expect(destinationInterest(['a', 'b'], { a: 70, b: 70 })).toBe(100)
  })

  it('集計にないキーワードは 0 として数える', () => {
    expect(destinationInterest(['x'], { a: 100 })).toBe(0)
  })
})

describe('bestDestinationId', () => {
  const destinations = [
    { id: 'first', keywordIds: ['a'] },
    { id: 'second', keywordIds: ['b', 'c'] },
  ]

  it('関心度が最大のスポットを返す', () => {
    expect(bestDestinationId(destinations, { a: 20, b: 40, c: 40 })).toBe('second')
  })

  it('同点・全員 0 のときは先頭', () => {
    expect(bestDestinationId(destinations, {})).toBe('first')
    expect(bestDestinationId(destinations, { a: 50, b: 50 })).toBe('first')
  })
})
