import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactionMeasurement } from '../../application/reactionMeasurement'
import type { ImageReaction } from '../../domain/reaction/imageReaction'
import { DEFAULT_SMILE_CONFIG } from '../../domain/reaction/config'
import { nextSmiles } from '../../domain/reaction/smileStart'
import { useSmileMeter, type SmileFrame } from './useSmileMeter'

const MAX_FACES = 5

// 誰かが笑顔になった瞬間。id は毎回増えるので、演出のきっかけ(key など)に使う。
// points は笑顔になった人の顔の上端の、画面上の位置(px)
export type SmileStart = { id: number; faceIndexes: number[]; points: { x: number; y: number }[] }

// カメラ映像から画像ごとの反応を計測する。計測のルールは ReactionMeasurement に任せ、ここでは検出とつなぐだけにする。
// smileScope があるあいだは、誰かが笑顔になった瞬間も返す(演出用)。画面の名前などを渡し、変わったら前の笑顔は捨てる
export function useImageReaction(video: HTMLVideoElement | null, enabled: boolean, smileScope: string | null = null) {
  const [measurement] = useState(() => new ReactionMeasurement(DEFAULT_SMILE_CONFIG))
  const [absent, setAbsent] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [smileStart, setSmileStart] = useState<SmileStart | null>(null)
  const smilingRef = useRef<boolean[]>([])
  const watchSmilesRef = useRef(smileScope !== null)

  // 画面が変わったとき、前の画面の笑顔で演出が出ないように捨てる(描画中に state を合わせる)
  const [prevSmileScope, setPrevSmileScope] = useState(smileScope)
  if (prevSmileScope !== smileScope) {
    setPrevSmileScope(smileScope)
    setSmileStart(null)
  }

  useEffect(() => {
    watchSmilesRef.current = smileScope !== null
    smilingRef.current = []
  }, [smileScope])

  const onFrame = useCallback(
    (frame: SmileFrame) => {
      setAbsent(measurement.update(frame.timestamp, frame.group).absent)
      if (!watchSmilesRef.current) return
      const { smiling, started } = nextSmiles(smilingRef.current, frame.faces, DEFAULT_SMILE_CONFIG)
      smilingRef.current = smiling
      // 笑顔になった瞬間だけ state を変え、毎フレームの再描画を避ける
      if (started.length === 0) return
      // 映像はインカメラの鏡像で表示しているので、左右を反転して画面上の位置にする
      const rect = video?.getBoundingClientRect()
      const points = rect
        ? started.map((i) => ({
            x: rect.left + (1 - frame.tops[i].x) * rect.width,
            y: rect.top + frame.tops[i].y * rect.height,
          }))
        : []
      setSmileStart((prev) => ({ id: (prev?.id ?? 0) + 1, faceIndexes: started, points }))
    },
    [measurement, video],
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
