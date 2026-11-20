import { useCallback, useState } from 'react'
import { ReactionMeasurement } from '../../application/reactionMeasurement'
import type { ImageReaction } from '../../domain/reaction/imageReaction'
import { DEFAULT_SMILE_CONFIG } from '../../domain/reaction/config'
import { useSmileMeter, type SmileFrame } from './useSmileMeter'

const MAX_FACES = 5

// カメラ映像から画像ごとの反応を計測する。計測のルールは ReactionMeasurement に任せ、ここでは検出とつなぐだけにする
export function useImageReaction(video: HTMLVideoElement | null, enabled: boolean) {
  const [measurement] = useState(() => new ReactionMeasurement(DEFAULT_SMILE_CONFIG))
  const [absent, setAbsent] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const onFrame = useCallback(
    (frame: SmileFrame) => setAbsent(measurement.update(frame.timestamp, frame.group).absent),
    [measurement],
  )

  const { status } = useSmileMeter(video, { enabled, maxFaces: MAX_FACES, attempt, onFrame })

  // いまの画像の計測を確定し、次の画像のために計測をやり直す
  const finish = useCallback((): ImageReaction => measurement.finish(), [measurement])

  const reset = useCallback(() => {
    measurement.reset()
    setAbsent(false)
  }, [measurement])

  // 読み込みに失敗したあとに、もう一度読み込む
  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  // 読み込み中と失敗時は、見つからないのか判定できないので false
  return { status, noFace: status === 'ready' && absent, finish, reset, retry }
}
