import type { Spot } from '../data/atmosphere'
import { destinationInterest } from './keywordShare'

export type RankedSpot = {
  spot: Spot
  // 関心度(0〜100)。スポットのキーワードの割合の合計
  interest: number
}

// 関心度の高い順に、上位 count 件のスポットを返す。同点は元の並びを保つ。
export function rankSpots(spots: Spot[], percents: Record<string, number>, count = 3): RankedSpot[] {
  return spots
    .map((spot) => ({ spot, interest: destinationInterest(spot.keywordIds, percents) }))
    .sort((a, b) => b.interest - a.interest)
    .slice(0, count)
}

export type ReactionLevel = 'high' | 'medium' | 'low'

// 関心度から反応の区分を返す。表示する文言は表示層が決める。区分の閾値は仮の値
export function reactionLevel(interest: number): ReactionLevel {
  if (interest >= 50) return 'high'
  if (interest >= 25) return 'medium'
  return 'low'
}
