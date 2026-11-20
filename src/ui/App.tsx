import { useCallback, useState } from 'react'
import type { Repositories } from '../domain/ports'
import { useCamera } from './hooks/useCamera'
import { useImageReaction } from './hooks/useImageReaction'
import { useNeedsRotate } from './hooks/useNeedsRotate'
import { useTripSession } from './hooks/useTripSession'
import { CandidateScreen } from './screens/CandidateScreen'
import { CheckScreen } from './screens/CheckScreen'
import { CompareScreen } from './screens/CompareScreen'
import { ConsentScreen } from './screens/ConsentScreen'
import { NoFaceScreen } from './screens/NoFaceScreen'
import { ResultScreen } from './screens/ResultScreen'
import { RotateScreen } from './screens/RotateScreen'
import { requiresLandscape } from './screens/screenName'
import { StartScreen } from './screens/StartScreen'

type Props = {
  repositories: Repositories
}

// 画面遷移のルールは useTripSession(application/tripSession)に任せ、
// ここでは状態に合わせた画面の出し分けと、カメラ・表情の検出の起動だけを行う
export default function App({ repositories }: Props) {
  const { state, catalog, percents, ranked, selectedSpot, dispatch } = useTripSession(repositories)
  const { phase } = state
  const needsRotate = useNeedsRotate()
  // 同意後の確認〜候補表示の間だけカメラを起動する(向き案内で画面が切り替わっても止めない)。
  // 比較画面はカメラを使わないので、計測が終わったら止める
  const camera = useCamera(phase === 'check' || phase === 'candidate')

  // カメラ映像から画像ごとの反応を計測する。
  // 同意の時点でモデルの読み込みを始め、確認画面でボタンを押す頃に準備が終わっているようにする
  const [video, setVideo] = useState<HTMLVideoElement | null>(null)
  const reaction = useImageReaction(video, phase === 'consent' || phase === 'check' || phase === 'candidate')
  const { finish, reset, retry } = reaction

  // index の画像の計測を確定して、次へ進む。
  // 「次の候補へ」とタイマーが重なって二重に届いた分は reducer が無視する
  const handleNextCandidate = useCallback(
    (index: number) => {
      dispatch({ type: 'IMAGE_FINISHED', index, reaction: finish() })
    },
    [dispatch, finish],
  )

  // 表情判定の途中でカメラが使えなくなったら、確認画面に戻す(確認画面で原因の案内と再試行を出す)
  if (phase === 'candidate' && camera.error) {
    dispatch({ type: 'CAMERA_LOST' })
  }

  // 表情の検出が途中で続けて失敗したら、確認画面に戻す(確認画面で「もう一度読み込む」を出す)
  if (phase === 'candidate' && reaction.status === 'error') {
    dispatch({ type: 'DETECTOR_FAILED' })
  }

  // スマホが縦向きの間は、横向きが前提の画面で「画面を横にしてください」を出す。画面の state は保持する。
  if (requiresLandscape(phase) && needsRotate) {
    return <RotateScreen />
  }

  // 候補表示中に誰も見つからなくなったら注意画面にする。見つかると同じ候補を最初からやり直す。
  if (phase === 'candidate' && reaction.noFace) {
    return <NoFaceScreen camera={camera} onVideo={setVideo} />
  }

  switch (phase) {
    case 'start':
      return <StartScreen onStart={() => dispatch({ type: 'START' })} />
    case 'consent':
      return (
        <ConsentScreen onAgree={() => dispatch({ type: 'AGREE' })} onDecline={() => dispatch({ type: 'DECLINE' })} />
      )
    case 'check':
      return (
        <CheckScreen
          camera={camera}
          detector={reaction.status}
          onRetry={retry}
          onRetryCamera={camera.retry}
          onBack={() => dispatch({ type: 'BACK_TO_START' })}
          onConfirm={() => {
            reset()
            dispatch({ type: 'CONFIRM_CHECK' })
          }}
        />
      )
    case 'candidate':
      return (
        <CandidateScreen
          camera={camera}
          atmosphereImages={catalog.images}
          index={state.candidateIndex}
          onNext={handleNextCandidate}
          onVideo={setVideo}
        />
      )
    case 'compare':
      return (
        <CompareScreen
          ranked={ranked}
          keywords={catalog.keywords}
          percents={percents}
          selectedId={state.selectedSpotId}
          onSelect={(spotId) => dispatch({ type: 'SELECT', spotId })}
          onDecide={() => dispatch({ type: 'DECIDE' })}
        />
      )
    case 'result':
      // 選んだスポットは比較画面で必ず決まる。データが空で決まらなかったときは何も出さない
      return selectedSpot ? <ResultScreen spot={selectedSpot} /> : null
  }
}
