import { describe, expect, it } from 'vitest'
import {
  staticImageRepository,
  staticKeywordRepository,
  staticSpotRepository,
} from './staticData'

// リポジトリ経由で検証する。実装を差し替えても、同じ検証を使い回せる。
describe('static data', () => {
  const images = staticImageRepository.list()
  const keywords = staticKeywordRepository.list()
  const spots = staticSpotRepository.list()
  const keywordIds = new Set(keywords.map((k) => k.id))

  it('画像は6件、キーワードは8件、スポットは7件ある', () => {
    expect(images).toHaveLength(6)
    expect(keywords).toHaveLength(8)
    expect(spots).toHaveLength(7)
  })

  it('画像の id が重複しない', () => {
    expect(new Set(images.map((i) => i.id)).size).toBe(images.length)
  })

  it('画像とスポットの keywordIds がすべて keywords に存在する', () => {
    for (const item of [...images, ...spots]) {
      for (const id of item.keywordIds) expect(keywordIds.has(id)).toBe(true)
    }
  })

  it('各 placeType にスポットが1件以上ある', () => {
    for (const image of images) {
      expect(spots.some((s) => s.placeType === image.placeType)).toBe(true)
    }
  })

  it('list() を呼ぶたびに同じ内容を返す', () => {
    expect(staticImageRepository.list()).toEqual(images)
    expect(staticKeywordRepository.list()).toEqual(keywords)
    expect(staticSpotRepository.list()).toEqual(spots)
  })
})
