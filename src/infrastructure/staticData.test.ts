import { describe, expect, it } from 'vitest'
import {
  atmosphereImages,
  keywords,
  spots,
  staticImageRepository,
  staticKeywordRepository,
  staticSpotRepository,
} from './staticData'

describe('static data', () => {
  const keywordIds = new Set(keywords.map((k) => k.id))

  it('画像は6件で、id が重複しない', () => {
    expect(atmosphereImages).toHaveLength(6)
    expect(new Set(atmosphereImages.map((i) => i.id)).size).toBe(6)
  })

  it('画像とスポットの keywordIds がすべて keywords に存在する', () => {
    for (const item of [...atmosphereImages, ...spots]) {
      for (const id of item.keywordIds) expect(keywordIds.has(id)).toBe(true)
    }
  })

  it('各 placeType にスポットが1件以上ある', () => {
    for (const image of atmosphereImages) {
      expect(spots.some((s) => s.placeType === image.id)).toBe(true)
    }
  })

  it('リポジトリ経由で同じデータを取得できる', () => {
    expect(staticImageRepository.list()).toBe(atmosphereImages)
    expect(staticKeywordRepository.list()).toBe(keywords)
    expect(staticSpotRepository.list()).toBe(spots)
  })
})
