import type { AtmosphereImage, Keyword, Spot } from '../domain/model'
import type { ImageReaction } from '../domain/reaction/imageReaction'
import { keywordShares, percentById, type ImageInterests } from '../domain/recommendation/keywordShare'
import { rankSpots, type RankedSpot } from '../domain/recommendation/spotRanking'

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
  // index は計測した画像の位置。いまの画像と違うもの(二重に届いた古いイベント)は無視する
  | { type: 'IMAGE_FINISHED'; index: number; reaction: ImageReaction }
  | { type: 'CAMERA_LOST' }
  | { type: 'DETECTOR_FAILED' }
  | { type: 'SELECT'; spotId: string }
  | { type: 'DECIDE' }

export const initialTripSession: TripSessionState = {
  phase: 'start',
  candidateIndex: 0,
  reactions: {},
  selectedSpotId: null,
}

// カメラを動かす画面。確認〜候補表示の間だけ動かし、比較画面に進んだら(計測が終わったら)止める
export function needsCamera(phase: Phase): boolean {
  return phase === 'check' || phase === 'candidate'
}

// 表情の検出(モデル)を用意しておく画面。
// 同意の時点で読み込みを始め、確認画面でボタンを押す頃に準備が終わっているようにする
export function needsDetector(phase: Phase): boolean {
  return phase === 'consent' || phase === 'check' || phase === 'candidate'
}

// 画像ごとの計測結果から、推薦に使う関心度だけを取り出す
export function interestsOf(reactions: TripSessionState['reactions']): ImageInterests {
  return Object.fromEntries(Object.entries(reactions).map(([id, reaction]) => [id, reaction?.interest ?? 0]))
}

// キーワードの id ごとの、みんなの好みの割合
export function keywordPercents(reactions: TripSessionState['reactions'], catalog: Catalog) {
  return percentById(keywordShares(interestsOf(reactions), catalog.images, catalog.keywords))
}

// 計測結果から出す提案。比較画面に出す内容と、最初に選んでおくスポットは、どちらもここから決める
export type Proposal = {
  // キーワードの id ごとの、みんなの好みの割合
  percents: Record<string, number>
  // 関心度の高い順のスポット(上位のみ)
  ranked: RankedSpot[]
}

export function selectProposal(reactions: TripSessionState['reactions'], catalog: Catalog): Proposal {
  const percents = keywordPercents(reactions, catalog)
  return { percents, ranked: rankSpots(catalog.spots, percents) }
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
        if (event.index !== state.candidateIndex) return state
        const image = catalog.images[state.candidateIndex]
        const reactions = { ...state.reactions, [image.id]: event.reaction }
        if (state.candidateIndex < catalog.images.length - 1) {
          return { ...state, reactions, candidateIndex: state.candidateIndex + 1 }
        }
        // 関心度がもっとも高い候補を最初から選択しておく
        const top = selectProposal(reactions, catalog).ranked[0]
        return { ...state, reactions, phase: 'compare', selectedSpotId: top?.spot.id ?? null }
      })
    case 'CAMERA_LOST':
      // 表情判定の途中でカメラが使えなくなったら、確認画面に戻して原因の案内と再試行を出す。
      // 計測は確認画面で確定したときに最初からやり直す
      return from('candidate', () => ({ ...state, phase: 'check' }))
    case 'DETECTOR_FAILED':
      // 表情の検出が途中で止まったら、確認画面に戻してモデルの読み込みをやり直せるようにする
      return from('candidate', () => ({ ...state, phase: 'check' }))
    case 'SELECT':
      return from('compare', () => ({ ...state, selectedSpotId: event.spotId }))
    case 'DECIDE':
      return from('compare', () => ({ ...state, phase: 'result' }))
  }
}
