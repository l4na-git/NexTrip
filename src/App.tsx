import { useCallback, useState } from 'react'
import { atmosphereImages, type PlaceType } from './data/atmosphere'
import { destinations } from './data/candidates'
import { useCamera } from './hooks/useCamera'
import { useNeedsRotate } from './hooks/useNeedsRotate'
import type { ImageReaction } from './lib/smile/imageReaction'
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

// 関心度がもっとも高い候補を最初から選択しておく
const defaultDestinationId = destinations.reduce((a, b) => (b.interest > a.interest ? b : a)).id

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('start')
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [selectedId, setSelectedId] = useState(defaultDestinationId)
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
  // 画像ごとの反応。結果画面で集計に使う予定(キーワード集計は次の区切り)
  const [, setReactions] = useState<Partial<Record<PlaceType, ImageReaction>>>({})

  const handleNextCandidate = useCallback(() => {
    const result = finish()
    const id = atmosphereImages[candidateIndex].id
    setReactions((prev) => ({ ...prev, [id]: result }))
    if (candidateIndex < atmosphereImages.length - 1) {
      setCandidateIndex(candidateIndex + 1)
    } else {
      setScreen('compare')
    }
  }, [candidateIndex, finish])

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
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDecide={() => setScreen('result')}
        />
      )
    case 'result':
      return <ResultScreen destination={destinations.find((d) => d.id === selectedId)!} />
  }
}
