import type { Keyword } from '../../domain/model'
import { reactionLevel, type RankedSpot, type ReactionLevel } from '../../domain/recommendation/spotRanking'

// 比較画面のカード 1 枚に表示する内容。カードはこれを描くだけにする
export type CandidateCardView = {
  spotId: string
  name: string
  // 表情からの推定の文言
  reaction: string
  // キーワードごとの内訳。割合の大きい順で、バー全体の長さがスポットの関心度になる
  segments: { id: string; label: string; percent: number }[]
}

const reactionText: Record<ReactionLevel, string> = {
  high: '表情からの推定：反応が良い',
  medium: '表情からの推定：関心が高そう',
  low: '表情からの推定：もう少し検討',
}

// 順位づけしたスポットと、キーワードごとの割合から、比較画面のカードの内容を作る
export function toCandidateCards(
  ranked: RankedSpot[],
  keywords: Keyword[],
  percents: Record<string, number>,
): CandidateCardView[] {
  const labelOf = new Map(keywords.map((k) => [k.id, k.label]))
  return ranked.map(({ spot, interest }) => ({
    spotId: spot.id,
    name: spot.name,
    reaction: reactionText[reactionLevel(interest)],
    segments: spot.keywordIds
      .map((id) => ({ id, label: labelOf.get(id) ?? id, percent: percents[id] ?? 0 }))
      .sort((a, b) => b.percent - a.percent),
  }))
}
