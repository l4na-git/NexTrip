import type { AtmosphereImage, Keyword, PlaceType } from '../data/atmosphere'
import type { ImageReaction } from './smile/imageReaction'

export type KeywordShare = {
  keywordId: string
  label: string
  // 全体に占める割合(整数、全キーワードの合計が 100)
  percent: number
}

type Reactions = Partial<Record<PlaceType, ImageReaction>>

// 各キーワードの重みを「そのキーワードを持つ画像の関心度の合計」とし、全体に占める割合を出す。
// 誰も笑わなかったときは空配列。
export function keywordShares(
  reactions: Reactions,
  images: AtmosphereImage[],
  keywords: Keyword[],
): KeywordShare[] {
  const weights = keywords.map((keyword) =>
    images.reduce(
      (sum, image) =>
        image.keywordIds.includes(keyword.id) ? sum + (reactions[image.id]?.interest ?? 0) : sum,
      0,
    ),
  )
  const total = weights.reduce((a, b) => a + b, 0)
  if (total <= 0) return []

  // 切り捨てた整数に、端数の大きい順に 1 ずつ足して、合計を 100 に合わせる(最大剰余法)
  const exact = weights.map((w) => (w / total) * 100)
  const percents = exact.map(Math.floor)
  let remainder = 100 - percents.reduce((a, b) => a + b, 0)
  exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
    .forEach(({ index }) => {
      if (remainder > 0 && weights[index] > 0) {
        percents[index] += 1
        remainder -= 1
      }
    })

  return keywords
    .map((keyword, index) => ({ keywordId: keyword.id, label: keyword.label, percent: percents[index] }))
    .filter((share) => share.percent > 0)
    .sort((a, b) => b.percent - a.percent)
}

// キーワード id から割合を引く。集計に出ないキーワードは 0。
export function percentById(shares: KeywordShare[]): Record<string, number> {
  return Object.fromEntries(shares.map((share) => [share.keywordId, share.percent]))
}

// スポットの関心度 = そのスポットのキーワードの割合の合計(最大 100)
export function destinationInterest(keywordIds: string[], percents: Record<string, number>): number {
  return Math.min(
    100,
    keywordIds.reduce((sum, id) => sum + (percents[id] ?? 0), 0),
  )
}
