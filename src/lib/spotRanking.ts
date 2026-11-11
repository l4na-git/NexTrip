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

// 文言の区切りは仮の値
export function reactionLabel(interest: number): string {
  if (interest >= 50) return '表情からの推定：反応が良い'
  if (interest >= 25) return '表情からの推定：関心が高そう'
  return '表情からの推定：もう少し検討'
}
