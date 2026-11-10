import { useEffect, useRef, useState } from 'react'
import { createSmileDetector, type SmileDetector } from './detector'
import { groupSmileScore, type FaceSmile } from './score'

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
  // 検出のたびに呼ばれる。SmileTracker に流して計測する用途
  onFrame?: (frame: SmileFrame) => void
}

// video の映像を約 fps で検出し、最新のフレームを返す
export function useSmileMeter(video: HTMLVideoElement | null, options: Options) {
  const { enabled, maxFaces, fps = 15, attempt = 0, onFrame } = options
  const [status, setStatus] = useState<SmileMeterStatus>('idle')
  const [frame, setFrame] = useState<SmileFrame | null>(null)
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
      setFrame(null)
    }
  }, [enabled, attempt])

  useEffect(() => {
    if (status !== 'ready' || !video) return

    const interval = 1000 / fps
    let raf = 0
    let last = 0
    let lastVideoTime = -1

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const detector = detectorRef.current
      if (!detector || now - last < interval) return
      // 映像が準備できていない間と、新しいフレームが来ていない間は検出しない
      if (video.readyState < 2 || video.videoWidth === 0 || video.currentTime === lastVideoTime) return
      last = now
      lastVideoTime = video.currentTime

      const faces = detector.detect(video, now)
      const next: SmileFrame = { timestamp: now, faces, group: groupSmileScore(faces) }
      onFrameRef.current?.(next)
      setFrame(next)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [status, video, fps])

  return { status: enabled && status === 'idle' ? ('loading' as const) : status, frame }
}
