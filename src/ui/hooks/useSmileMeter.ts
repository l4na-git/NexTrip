import { useEffect, useRef, useState } from 'react'
import { createSmileDetector, type SmileDetector } from '../../infrastructure/mediapipe/smileDetector'
import { createFailureCounter } from './failureCounter'
import { groupSmileScore, type FaceSmile } from '../../domain/reaction/score'

export type SmileFrame = {
  timestamp: number
  faces: FaceSmile[]
  // 写っている全員の平均。誰も写っていなければ null
  group: number | null
}

export type SmileMeterStatus = 'idle' | 'loading' | 'ready' | 'error'

type Options = {
  enabled: boolean
  maxFaces: number
  fps?: number
  // 読み込みに失敗したあと、値を変えると読み込みをやり直す
  attempt?: number
  // 検出のたびに呼ばれる。SmileTracker に流して計測する用途。
  // 最新の関数への差し替えは effect で行うため、useCallback などでメモ化して渡すこと
  // (毎回新しい関数を渡すと、差し替えが済むまでの間は古い関数にフレームが届く)
  onFrame?: (frame: SmileFrame) => void
}

// video の映像を約 fps で検出し、結果は onFrame で渡す。
// フレームを state に持つと検出のたびに呼び出し側が再描画されるため、状態は status のみ返す
export function useSmileMeter(video: HTMLVideoElement | null, options: Options) {
  const { enabled, maxFaces, fps = 15, attempt = 0, onFrame } = options
  const [status, setStatus] = useState<SmileMeterStatus>('idle')
  const detectorRef = useRef<SmileDetector | null>(null)
  const onFrameRef = useRef(onFrame)
  const maxFacesRef = useRef(maxFaces)

  useEffect(() => {
    onFrameRef.current = onFrame
    maxFacesRef.current = maxFaces
    void detectorRef.current?.setMaxFaces(maxFaces)
  }, [onFrame, maxFaces])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    createSmileDetector(maxFacesRef.current)
      .then((detector) => {
        if (cancelled) {
          detector.close()
          return
        }
        detectorRef.current = detector
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      detectorRef.current?.close()
      detectorRef.current = null
      setStatus('idle')
    }
  }, [enabled, attempt])

  useEffect(() => {
    if (status !== 'ready' || !video) return

    const interval = 1000 / fps
    let raf = 0
    let last = 0
    let lastVideoTime = -1
    // 映像の切り替わりなどで一時的に失敗することがあるので、約 1 秒ぶん続いたときだけ止める
    const detectFailures = createFailureCounter(Math.max(1, Math.round(fps)))
    let onFrameErrorLogged = false

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const detector = detectorRef.current
      if (!detector || now - last < interval) return
      // 映像が準備できていない間と、新しいフレームが来ていない間は検出しない
      if (video.readyState < 2 || video.videoWidth === 0 || video.currentTime === lastVideoTime) return
      last = now
      lastVideoTime = video.currentTime

      let faces: FaceSmile[]
      try {
        faces = detector.detect(video, now)
      } catch (e) {
        // 失敗したフレームは飛ばす。続くときは error にして、読み込みのやり直しを促す
        if (detectFailures.fail()) {
          console.error('[useSmileMeter] 表情の検出が続けて失敗したため、検出を止めます', e)
          cancelAnimationFrame(raf)
          setStatus('error')
        }
        return
      }
      detectFailures.succeed()

      const next: SmileFrame = { timestamp: now, faces, group: groupSmileScore(faces) }
      try {
        onFrameRef.current?.(next)
      } catch (e) {
        // 呼び出し側の不具合は、モデルを読み込み直しても直らないので error にはしない。ログは 1 回だけ出す
        if (!onFrameErrorLogged) {
          onFrameErrorLogged = true
          console.error('[useSmileMeter] onFrame で例外が発生しました', e)
        }
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [status, video, fps])

  return { status: enabled && status === 'idle' ? ('loading' as const) : status }
}
