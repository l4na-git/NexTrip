import { useMemo, useState } from 'react'
import { interruptionOf, needsCamera, needsDetector } from '../../application/tripSession'
import type { Repositories } from '../../domain/ports'
import { useCamera } from './useCamera'
import { useImageReaction } from './useImageReaction'
import { useTripSession } from './useTripSession'

// セッションと、カメラ・表情の検出をつなぐ。
// どの画面で何を動かすか、外の状態が変わったときにどのイベントを送るかは application が決め、
// ここでは副作用(計測の確定・リセット)をイベントと正しい順番で組み合わせるだけにする
export function useTripController(repositories: Repositories) {
  const { state, catalog, percents, ranked, selectedSpot, dispatch } = useTripSession(repositories)
  const camera = useCamera(needsCamera(state.phase))
  const [video, setVideo] = useState<HTMLVideoElement | null>(null)
  const reaction = useImageReaction(video, needsDetector(state.phase))
  const { finish, reset, retry: retryDetector } = reaction
  const { retry: retryCamera } = camera

  // 計測中にカメラや検出が使えなくなったら、イベントを送る。
  // 描画中に送り、候補表示がエラーの状態で一度描かれるのを避ける(React では同じコンポーネント内なら許される)
  const interruption = interruptionOf(state.phase, {
    cameraError: camera.error,
    detectorFailed: reaction.status === 'error',
  })
  if (interruption) dispatch(interruption)

  const actions = useMemo(
    () => ({
      start: () => dispatch({ type: 'START' }),
      agree: () => dispatch({ type: 'AGREE' }),
      decline: () => dispatch({ type: 'DECLINE' }),
      backToStart: () => dispatch({ type: 'BACK_TO_START' }),
      // 前回の計測を捨ててから、候補表示を始める
      confirmCheck: () => {
        reset()
        dispatch({ type: 'CONFIRM_CHECK' })
      },
      // index の画像の計測を確定してから、次へ進む。
      // 「次の候補へ」とタイマーが重なって二重に届いた分は reducer が無視する
      finishImage: (index: number) => dispatch({ type: 'IMAGE_FINISHED', index, reaction: finish() }),
      // やめるかの確認から戻ったら、いまの画像を測り直す
      resumeImage: reset,
      select: (spotId: string) => dispatch({ type: 'SELECT', spotId }),
      decide: () => dispatch({ type: 'DECIDE' }),
      restart: () => dispatch({ type: 'RESTART' }),
      retryCamera,
      retryDetector,
    }),
    [dispatch, finish, reset, retryCamera, retryDetector],
  )

  return {
    state,
    catalog,
    percents,
    ranked,
    selectedSpot,
    camera,
    detector: { status: reaction.status, noFace: reaction.noFace },
    setVideo,
    actions,
  }
}
