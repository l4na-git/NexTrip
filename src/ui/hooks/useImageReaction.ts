import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactionMeasurement } from '../../application/reactionMeasurement'
import type { ImageReaction } from '../../domain/reaction/imageReaction'
import { DEFAULT_SMILE_CONFIG } from '../../domain/reaction/config'
import { nextSmiles } from '../../domain/reaction/smileStart'
import { useSmileMeter, type SmileFrame } from './useSmileMeter'

const MAX_FACES = 5

// 誰かが笑顔になった瞬間。id は毎回増えるので、演出のきっかけ(key など)に使う
export type SmileStart = { id: number; faceIndexes: number[] }

// カメラ映像から画像ごとの反応を計測する。計測のルールは ReactionMeasurement に任せ、ここでは検出とつなぐだけにする。
// watchSmiles の間は、誰かが笑顔になった瞬間も返す(確認画面の演出用)
export function useImageReaction(video: HTMLVideoElement | null, enabled: boolean, watchSmiles = false) {
  const [measurement] = useState(() => new ReactionMeasurement(DEFAULT_SMILE_CONFIG))
  const [absent, setAbsent] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [smileStart, setSmileStart] = useState<SmileStart | null>(null)
  const smilingRef = useRef<boolean[]>([])
  const watchSmilesRef = useRef(watchSmiles)

  // 確認画面に戻ってきたとき、前回の笑顔で演出が出ないように捨てる(描画中に state を合わせる)
  const [prevWatchSmiles, setPrevWatchSmiles] = useState(watchSmiles)
  if (prevWatchSmiles !== watchSmiles) {
    setPrevWatchSmiles(watchSmiles)
    setSmileStart(null)
  }

  useEffect(() => {
    watchSmilesRef.current = watchSmiles
    smilingRef.current = []
  }, [watchSmiles])

  const onFrame = useCallback(
    (frame: SmileFrame) => {
      setAbsent(measurement.update(frame.timestamp, frame.group).absent)
      if (!watchSmilesRef.current) return
      const { smiling, started } = nextSmiles(smilingRef.current, frame.faces, DEFAULT_SMILE_CONFIG)
      smilingRef.current = smiling
      // 笑顔になった瞬間だけ state を変え、毎フレームの再描画を避ける
      if (started.length > 0) setSmileStart((prev) => ({ id: (prev?.id ?? 0) + 1, faceIndexes: started }))
    },
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
  return { status, noFace: status === 'ready' && absent, smileStart, finish, reset, retry }
}
