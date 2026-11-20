import type { AtmosphereImage, Keyword, Spot } from '../domain/model'
import type { ImageReaction } from '../domain/reaction/imageReaction'
import { keywordShares, percentById, type ImageInterests } from '../domain/recommendation/keywordShare'
import { rankSpots } from '../domain/recommendation/spotRanking'

// 1 回のセッション(同意 → 確認 → 画像を見る → 比べる → 決める)の流れ。
// 画面遷移のルールはここにまとめ、React や画面の部品には依存させない。

export type Phase = 'start' | 'consent' | 'check' | 'candidate' | 'compare' | 'result'

// セッションで使うデータ。Repository から読み込んだもの
export type Catalog = {
  images: AtmosphereImage[]
  keywords: Keyword[]
  spots: Spot[]
}

export type TripSessionState = {
  phase: Phase
  // 候補表示で、いま見ている画像の位置
  candidateIndex: number
  // 画像の id ごとの計測結果
  reactions: Partial<Record<string, ImageReaction>>
  // 比較画面で選んでいるスポット
  selectedSpotId: string | null
}

export type TripSessionEvent =
  | { type: 'START' }
  | { type: 'AGREE' }
  | { type: 'DECLINE' }
  | { type: 'BACK_TO_START' }
  | { type: 'CONFIRM_CHECK' }
  | { type: 'IMAGE_FINISHED'; reaction: ImageReaction }
  | { type: 'CAMERA_LOST' }
  | { type: 'SELECT'; spotId: string }
  | { type: 'DECIDE' }

export const initialTripSession: TripSessionState = {
  phase: 'start',
  candidateIndex: 0,
  reactions: {},
  selectedSpotId: null,
}

// 画像ごとの計測結果から、推薦に使う関心度だけを取り出す
export function interestsOf(reactions: TripSessionState['reactions']): ImageInterests {
  return Object.fromEntries(Object.entries(reactions).map(([id, reaction]) => [id, reaction?.interest ?? 0]))
}

// キーワードの id ごとの、みんなの好みの割合
export function keywordPercents(reactions: TripSessionState['reactions'], catalog: Catalog) {
  return percentById(keywordShares(interestsOf(reactions), catalog.images, catalog.keywords))
}

// イベントから次の状態を返す。いまの画面で起こりえないイベントは無視する
export function reduceTripSession(
  state: TripSessionState,
  event: TripSessionEvent,
  catalog: Catalog,
): TripSessionState {
  const from = (phase: Phase, next: () => TripSessionState) => (state.phase === phase ? next() : state)

  switch (event.type) {
    case 'START':
      return from('start', () => ({ ...state, phase: 'consent' }))
    case 'AGREE':
      return from('consent', () => ({ ...state, phase: 'check' }))
    case 'DECLINE':
      return from('consent', () => ({ ...state, phase: 'start' }))
    case 'BACK_TO_START':
      return from('check', () => ({ ...state, phase: 'start' }))
    case 'CONFIRM_CHECK':
      // 計測は毎回最初からやり直す
      return from('check', () => ({ ...initialTripSession, phase: 'candidate' }))
    case 'IMAGE_FINISHED':
      return from('candidate', () => {
        const image = catalog.images[state.candidateIndex]
        const reactions = { ...state.reactions, [image.id]: event.reaction }
        if (state.candidateIndex < catalog.images.length - 1) {
          return { ...state, reactions, candidateIndex: state.candidateIndex + 1 }
        }
        // 関心度がもっとも高い候補を最初から選択しておく
        const top = rankSpots(catalog.spots, keywordPercents(reactions, catalog))[0]
        return { ...state, reactions, phase: 'compare', selectedSpotId: top?.spot.id ?? null }
      })
    case 'CAMERA_LOST':
      // 表情判定の途中でカメラが使えなくなったら、確認画面に戻して原因の案内と再試行を出す。
      // 計測は確認画面で確定したときに最初からやり直す
      return from('candidate', () => ({ ...state, phase: 'check' }))
    case 'SELECT':
      return from('compare', () => ({ ...state, selectedSpotId: event.spotId }))
    case 'DECIDE':
      return from('compare', () => ({ ...state, phase: 'result' }))
  }
}
