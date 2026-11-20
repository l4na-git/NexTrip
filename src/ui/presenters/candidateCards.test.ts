import { describe, expect, it } from 'vitest'
import type { Keyword, Spot } from '../../domain/model'
import { toCandidateCards } from './candidateCards'

const keywords: Keyword[] = [
  { id: 'a', label: 'のんびり' },
  { id: 'b', label: '開放的' },
]

const spot = (id: string, keywordIds: string[]): Spot => ({
  id,
  name: `${id} の名前`,
  placeType: 'sea',
  keywordIds,
  lat: 0,
  lng: 0,
})

describe('toCandidateCards', () => {
  it('順位の順に、スポットの名前と id を並べる', () => {
    const cards = toCandidateCards(
      [
        { spot: spot('s1', ['a']), interest: 60 },
        { spot: spot('s2', ['b']), interest: 40 },
      ],
      keywords,
      { a: 60, b: 40 },
    )
    expect(cards.map((c) => [c.spotId, c.name])).toEqual([
      ['s1', 's1 の名前'],
      ['s2', 's2 の名前'],
    ])
  })

  it('関心度の区分に応じた文言を付ける', () => {
    const card = (interest: number) =>
      toCandidateCards([{ spot: spot('s', ['a']), interest }], keywords, {})[0].reaction
    expect(card(50)).toBe('表情からの推定：反応が良い')
    expect(card(25)).toBe('表情からの推定：関心が高そう')
    expect(card(0)).toBe('表情からの推定：もう少し検討')
  })

  it('内訳は、スポットのキーワードを割合の大きい順に、ラベル付きで並べる', () => {
    const [card] = toCandidateCards([{ spot: spot('s', ['a', 'b']), interest: 70 }], keywords, { a: 20, b: 50 })
    expect(card.segments).toEqual([
      { id: 'b', label: '開放的', percent: 50 },
      { id: 'a', label: 'のんびり', percent: 20 },
    ])
  })

  it('集計に出ないキーワードは 0%、ラベルがなければ id を出す', () => {
    const [card] = toCandidateCards([{ spot: spot('s', ['x']), interest: 0 }], keywords, {})
    expect(card.segments).toEqual([{ id: 'x', label: 'x', percent: 0 }])
  })
})
