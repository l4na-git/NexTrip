import { useCallback, useMemo, useState } from 'react'
import type { PlaceType } from '../domain/model'
import type { Repositories } from '../domain/ports'
import { useCamera } from './hooks/useCamera'
import { useNeedsRotate } from './hooks/useNeedsRotate'
import type { ImageReaction } from '../domain/reaction/imageReaction'
import { keywordShares, percentById } from '../domain/recommendation/keywordShare'
import { useImageReaction } from './hooks/useImageReaction'
import { rankSpots } from '../domain/recommendation/spotRanking'
import { CandidateScreen } from './screens/CandidateScreen'
import { CheckScreen } from './screens/CheckScreen'
import { CompareScreen } from './screens/CompareScreen'
import { ConsentScreen } from './screens/ConsentScreen'
import { NoFaceScreen } from './screens/NoFaceScreen'
import { ResultScreen } from './screens/ResultScreen'
import { RotateScreen } from './screens/RotateScreen'
import { requiresLandscape, type ScreenName } from './screens/screenName'
import { StartScreen } from './screens/StartScreen'

type Props = {
  repositories: Repositories
}

export default function App({ repositories }: Props) {
  const keywords = useMemo(() => repositories.keywords.list(), [repositories])
  const atmosphereImages = useMemo(() => repositories.images.list(), [repositories])
  const spots = useMemo(() => repositories.spots.list(), [repositories])
  const [screen, setScreen] = useState<ScreenName>('start')
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [selectedId, setSelectedId] = useState(spots[0].id)
  const needsRotate = useNeedsRotate()
  // 同意後の確認〜候補表示の間だけカメラを起動する(向き案内で画面が切り替わっても止めない)。
  // 比較画面はカメラを使わないので、計測が終わったら止める
  const camera = useCamera(screen === 'check' || screen === 'candidate')

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
    [atmosphereImages, keywords, reactions],
  )
  const ranked = useMemo(() => rankSpots(spots, percents), [percents, spots])

  const handleNextCandidate = useCallback(() => {
    const next = { ...reactions, [atmosphereImages[candidateIndex].id]: finish() }
    setReactions(next)
    if (candidateIndex < atmosphereImages.length - 1) {
      setCandidateIndex(candidateIndex + 1)
    } else {
      // 関心度がもっとも高い候補を最初から選択しておく
      const nextPercents = percentById(keywordShares(next, atmosphereImages, keywords))
      setSelectedId(rankSpots(spots, nextPercents)[0].spot.id)
      setScreen('compare')
    }
  }, [atmosphereImages, candidateIndex, finish, keywords, reactions, spots])

  // 表情判定の途中でカメラが使えなくなったら、トップに戻す(カメラは screen が変わると止まる)
  if (screen === 'candidate' && camera.error) {
    setScreen('start')
  }

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
      return <ConsentScreen onAgree={() => setScreen('check')} onDecline={() => setScreen('start')} />
    case 'check':
      return (
        <CheckScreen
          camera={camera}
          detector={reaction.status}
          onRetry={retry}
          onRetryCamera={camera.retry}
          onBack={() => setScreen('start')}
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
          atmosphereImages={atmosphereImages}
          index={candidateIndex}
          onNext={handleNextCandidate}
          onVideo={setVideo}
        />
      )
    case 'compare':
      return (
        <CompareScreen
          ranked={ranked}
          keywords={keywords}
          percents={percents}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDecide={() => setScreen('result')}
        />
      )
    case 'result':
      return <ResultScreen spot={spots.find((s) => s.id === selectedId)!} />
  }
}
