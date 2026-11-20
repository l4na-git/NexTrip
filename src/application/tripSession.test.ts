import { describe, expect, it } from 'vitest'
import type { AtmosphereImage, Keyword, Spot } from '../domain/model'
import {
  initialTripSession,
  interestsOf,
  keywordPercents,
  reduceTripSession,
  type Catalog,
  type Phase,
  type TripSessionEvent,
  type TripSessionState,
} from './tripSession'

const keywords: Keyword[] = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
]

const image = (id: string, keywordIds: string[]): AtmosphereImage => ({
  id,
  placeType: 'sea',
  label: id,
  image: { src: null },
  keywordIds,
})

const spot = (id: string, keywordIds: string[]): Spot => ({
  id,
  name: id,
  placeType: 'sea',
  keywordIds,
  lat: 0,
  lng: 0,
})

const catalog: Catalog = {
  images: [image('img-a', ['a']), image('img-b', ['b'])],
  keywords,
  spots: [spot('spot-a', ['a']), spot('spot-b', ['b'])],
}

const reaction = (interest: number) => ({ interest, noFace: false })

const run = (events: TripSessionEvent[], from: TripSessionState = initialTripSession) =>
  events.reduce((state, event) => reduceTripSession(state, event, catalog), from)

const at = (phase: Phase): TripSessionState => ({ ...initialTripSession, phase })

// README の「画面遷移」の図に沿って確かめる。
// 「誰も見つかりません」は候補表示の上に重ねて出す表示なので、ここでは扱わない。
describe('reduceTripSession: 画面遷移', () => {
  it('開始 → 同意 → 確認 → 候補表示 と進む', () => {
    expect(run([{ type: 'START' }]).phase).toBe('consent')
    expect(run([{ type: 'START' }, { type: 'AGREE' }]).phase).toBe('check')
    expect(run([{ type: 'START' }, { type: 'AGREE' }, { type: 'CONFIRM_CHECK' }]).phase).toBe('candidate')
  })

  it('同意しない場合はトップに戻る', () => {
    expect(run([{ type: 'DECLINE' }], at('consent')).phase).toBe('start')
  })

  it('確認画面からトップに戻れる', () => {
    expect(run([{ type: 'BACK_TO_START' }], at('check')).phase).toBe('start')
  })

  it('全部の画像を見終わると比較画面に進む', () => {
    const state = run([{ type: 'IMAGE_FINISHED', index: 0, reaction: reaction(10) }], at('candidate'))
    expect(state.phase).toBe('candidate')
    expect(state.candidateIndex).toBe(1)
    expect(run([{ type: 'IMAGE_FINISHED', index: 1, reaction: reaction(10) }], state).phase).toBe('compare')
  })

  it('比較画面で決めると結果画面に進む', () => {
    expect(run([{ type: 'DECIDE' }], at('compare')).phase).toBe('result')
  })

  it('候補表示中にカメラが使えなくなると、確認画面に戻る', () => {
    expect(run([{ type: 'CAMERA_LOST' }], at('candidate')).phase).toBe('check')
  })

  it('いまの画面で起こりえないイベントは無視する', () => {
    const start = at('start')
    expect(run([{ type: 'DECIDE' }, { type: 'CONFIRM_CHECK' }, { type: 'CAMERA_LOST' }], start)).toBe(start)
    const compare = at('compare')
    expect(run([{ type: 'IMAGE_FINISHED', index: 0, reaction: reaction(50) }], compare)).toBe(compare)
  })
})

describe('reduceTripSession: 計測と選択', () => {
  it('確認画面で確定すると、前回の計測結果を捨てて最初の画像から始める', () => {
    const previous: TripSessionState = {
      phase: 'check',
      candidateIndex: 1,
      reactions: { 'img-a': reaction(80) },
      selectedSpotId: 'spot-a',
    }
    expect(run([{ type: 'CONFIRM_CHECK' }], previous)).toEqual({ ...initialTripSession, phase: 'candidate' })
  })

  it('画像ごとの計測結果を、画像の id で記録する', () => {
    const state = run(
      [
        { type: 'IMAGE_FINISHED', index: 0, reaction: reaction(20) },
        { type: 'IMAGE_FINISHED', index: 1, reaction: reaction(70) },
      ],
      at('candidate'),
    )
    expect(state.reactions).toEqual({ 'img-a': reaction(20), 'img-b': reaction(70) })
  })

  it('比較画面に進むとき、関心度がもっとも高いスポットを選んでおく', () => {
    const state = run(
      [
        { type: 'IMAGE_FINISHED', index: 0, reaction: reaction(20) },
        { type: 'IMAGE_FINISHED', index: 1, reaction: reaction(70) },
      ],
      at('candidate'),
    )
    expect(state.selectedSpotId).toBe('spot-b')
  })

  it('同じ画像の計測が二重に届いても、次の画像を飛ばさない', () => {
    // 「次の候補へ」とタイマーがほぼ同時に動いたときを想定する
    const state = run(
      [
        { type: 'IMAGE_FINISHED', index: 0, reaction: reaction(20) },
        { type: 'IMAGE_FINISHED', index: 0, reaction: reaction(0) },
      ],
      at('candidate'),
    )
    expect(state.candidateIndex).toBe(1)
    expect(state.reactions).toEqual({ 'img-a': reaction(20) })
  })

  it('比較画面で選んだスポットに切り替わる', () => {
    expect(run([{ type: 'SELECT', spotId: 'spot-a' }], at('compare')).selectedSpotId).toBe('spot-a')
  })
})

describe('集計', () => {
  it('計測結果から関心度だけを取り出す', () => {
    expect(interestsOf({ 'img-a': reaction(30), 'img-b': { interest: 0, noFace: true } })).toEqual({
      'img-a': 30,
      'img-b': 0,
    })
  })

  it('計測結果から、キーワードごとの割合を出す', () => {
    expect(keywordPercents({ 'img-a': reaction(30), 'img-b': reaction(10) }, catalog)).toEqual({ a: 75, b: 25 })
  })
})
