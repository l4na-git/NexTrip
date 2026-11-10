import { useCallback, useMemo, useState } from 'react'
import { atmosphereImages, keywords, type PlaceType } from './data/atmosphere'
import { destinations } from './data/candidates'
import { useCamera } from './hooks/useCamera'
import { useNeedsRotate } from './hooks/useNeedsRotate'
import type { ImageReaction } from './lib/smile/imageReaction'
import { bestDestinationId, keywordShares, percentById } from './lib/keywordShare'
import { useImageReaction } from './lib/smile/useImageReaction'
import { CandidateScreen } from './screens/CandidateScreen'
import { CheckScreen } from './screens/CheckScreen'
import { CompareScreen } from './screens/CompareScreen'
import { ConsentScreen } from './screens/ConsentScreen'
import { NoFaceScreen } from './screens/NoFaceScreen'
import { ResultScreen } from './screens/ResultScreen'
import { RotateScreen } from './screens/RotateScreen'
import { requiresLandscape, type ScreenName } from './screens/screenName'
import { StartScreen } from './screens/StartScreen'

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('start')
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [selectedId, setSelectedId] = useState(destinations[0].id)
  const needsRotate = useNeedsRotate()
  // 同意後の確認〜比較の間だけカメラを起動する(向き案内で画面が切り替わっても止めない)
  const camera = useCamera(screen === 'check' || screen === 'candidate' || screen === 'compare')

  // カメラ映像から画像ごとの反応を計測する。モデルは確認画面から読み込んでおく
  const [video, setVideo] = useState<HTMLVideoElement | null>(null)
  // 同意の時点で読み込みを始め、確認画面でボタンを押す頃に準備が終わっているようにする
  const reaction = useImageReaction(
    video,
    screen === 'consent' || screen === 'check' || screen === 'candidate',
  )
  const { finish, reset, retry } = reaction
  // 画像ごとの反応と、そこから集計したキーワードごとの割合
  const [reactions, setReactions] = useState<Partial<Record<PlaceType, ImageReaction>>>({})
  const percents = useMemo(
    () => percentById(keywordShares(reactions, atmosphereImages, keywords)),
    [reactions],
  )

  const handleNextCandidate = useCallback(() => {
    const next = { ...reactions, [atmosphereImages[candidateIndex].id]: finish() }
    setReactions(next)
    if (candidateIndex < atmosphereImages.length - 1) {
      setCandidateIndex(candidateIndex + 1)
    } else {
      // 関心度がもっとも高い候補を最初から選択しておく
      const nextPercents = percentById(keywordShares(next, atmosphereImages, keywords))
      setSelectedId(bestDestinationId(destinations, nextPercents))
      setScreen('compare')
    }
  }, [candidateIndex, finish, reactions])

  // スマホが縦向きの間は、横向きが前提の画面で「画面を横にしてください」を出す。画面の state は保持する。
  if (requiresLandscape(screen) && needsRotate) {
    return <RotateScreen />
  }

  // 候補表示中に誰も見つからなくなったら注意画面にする。見つかると同じ候補を最初からやり直す。
  if (screen === 'candidate' && reaction.noFace) {
    return <NoFaceScreen camera={camera} onVideo={setVideo} />
  }

  switch (screen) {
    case 'start':
      return <StartScreen onStart={() => setScreen('consent')} />
    case 'consent':
      return <ConsentScreen onAgree={() => setScreen('check')} />
    case 'check':
      return (
        <CheckScreen
          camera={camera}
          detector={reaction.status}
          onRetry={retry}
          onConfirm={() => {
            setCandidateIndex(0)
            setReactions({})
            reset()
            setScreen('candidate')
          }}
        />
      )
    case 'candidate':
      return (
        <CandidateScreen
          camera={camera}
          index={candidateIndex}
          onNext={handleNextCandidate}
          onVideo={setVideo}
        />
      )
    case 'compare':
      return (
        <CompareScreen
          percents={percents}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDecide={() => setScreen('result')}
        />
      )
    case 'result':
      return <ResultScreen destination={destinations.find((d) => d.id === selectedId)!} />
  }
}
