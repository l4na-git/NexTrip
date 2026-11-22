import type { Repositories } from '../domain/ports'
import { useNeedsRotate } from './hooks/useNeedsRotate'
import { useTripController } from './hooks/useTripController'
import { toCandidateCards } from './presenters/candidateCards'
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

// セッションの状態に合わせて、画面を出し分けるだけにする。
// 画面遷移のルールは application、副作用の組み合わせは useTripController が持つ
export default function App({ repositories }: Props) {
  const { state, catalog, percents, ranked, selectedSpot, camera, detector, setVideo, actions } =
    useTripController(repositories)
  const { phase } = state
  const needsRotate = useNeedsRotate()

  // スマホが縦向きの間は、横向きが前提の画面で「画面を横にしてください」を出す。画面の state は保持する。
  if (requiresLandscape(phase) && needsRotate) {
    return <RotateScreen />
  }

  // 候補表示中に誰も見つからなくなったら注意画面にする。見つかると同じ候補を最初からやり直す。
  if (phase === 'candidate' && detector.noFace) {
    return <NoFaceScreen camera={camera} onVideo={setVideo} onStop={actions.backToStart} />
  }

  switch (phase) {
    case 'start':
      return <StartScreen onStart={actions.start} />
    case 'consent':
      return <ConsentScreen onAgree={actions.agree} onDecline={actions.decline} />
    case 'check':
      return (
        <CheckScreen
          camera={camera}
          detector={detector.status}
          smileStart={detector.smileStart}
          onVideo={setVideo}
          onRetry={actions.retryDetector}
          onRetryCamera={actions.retryCamera}
          onBack={actions.backToStart}
          onConfirm={actions.confirmCheck}
        />
      )
    case 'candidate':
      return (
        <CandidateScreen
          camera={camera}
          atmosphereImages={catalog.images}
          index={state.candidateIndex}
          onNext={actions.finishImage}
          onVideo={setVideo}
          smileStart={detector.smileStart}
          onStop={actions.backToStart}
          onResume={actions.resumeImage}
        />
      )
    case 'compare':
      return (
        <CompareScreen
          cards={toCandidateCards(ranked, catalog.keywords, percents)}
          selectedId={state.selectedSpotId}
          onSelect={actions.select}
          onDecide={actions.decide}
        />
      )
    case 'result':
      // 選んだスポットは比較画面で必ず決まる。データが空で決まらなかったときは何も出さない
      return selectedSpot ? <ResultScreen spot={selectedSpot} onRestart={actions.restart} /> : null
  }
}
