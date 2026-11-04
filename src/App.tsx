import { useCallback, useState } from 'react'
import { categories, destinations } from './data/candidates'
import { useCamera } from './hooks/useCamera'
import { useNeedsRotate } from './hooks/useNeedsRotate'
import { CandidateScreen } from './screens/CandidateScreen'
import { CheckScreen } from './screens/CheckScreen'
import { CompareScreen } from './screens/CompareScreen'
import { ConsentScreen } from './screens/ConsentScreen'
import { ResultScreen } from './screens/ResultScreen'
import { RotateScreen } from './screens/RotateScreen'
import { StartScreen } from './screens/StartScreen'

type ScreenName = 'start' | 'consent' | 'check' | 'candidate' | 'compare' | 'result'

// 関心度がもっとも高い候補を最初から選択しておく
const defaultDestinationId = destinations.reduce((a, b) => (b.interest > a.interest ? b : a)).id

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('start')
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [selectedId, setSelectedId] = useState(defaultDestinationId)
  const needsRotate = useNeedsRotate()
  // 同意後の確認〜比較の間だけカメラを起動する(向き案内で画面が切り替わっても止めない)
  const camera = useCamera(screen === 'check' || screen === 'candidate' || screen === 'compare')

  const handleNextCandidate = useCallback(() => {
    if (candidateIndex < categories.length - 1) {
      setCandidateIndex(candidateIndex + 1)
    } else {
      setScreen('compare')
    }
  }, [candidateIndex])

  // スマホが縦向きの間は、開始画面以外で「画面を横にしてください」を出す。画面の state は保持する。
  if (screen !== 'start' && needsRotate) {
    return <RotateScreen />
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
          onConfirm={() => {
            setCandidateIndex(0)
            setScreen('candidate')
          }}
        />
      )
    case 'candidate':
      return <CandidateScreen camera={camera} index={candidateIndex} onNext={handleNextCandidate} />
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
