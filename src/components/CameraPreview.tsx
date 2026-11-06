import { useCallback, useEffect, useRef } from 'react'
import type { CameraState } from '../hooks/useCamera'
import styles from './CameraPreview.module.css'

type Props = CameraState & {
  placeholder: string
  variant?: 'soft' | 'outline'
  radius?: number
  className?: string
  // 映像の <video> 要素を受け取る(表情の検出用)。毎回変わる関数を渡すと再取得が繰り返されるので、安定した関数を渡す
  onVideo?: (video: HTMLVideoElement | null) => void
}

export function CameraPreview({
  stream,
  error,
  placeholder,
  variant = 'soft',
  radius = 16,
  className,
  onVideo,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const setVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      videoRef.current = video
      onVideo?.(video)
    },
    [onVideo],
  )

  useEffect(() => {
    const video = videoRef.current
    if (video) video.srcObject = stream
  }, [stream])

  const message = error ? 'カメラを利用できません。ブラウザの許可を確認してください。' : placeholder

  // 映像の表示中は外側の枠をなくし、映像そのものに枠線を付けて縁に沿わせる
  return (
    <div
      className={[styles.preview, !stream && styles[variant], className].filter(Boolean).join(' ')}
      style={{ borderRadius: radius }}
    >
      {stream ? (
        <video
          ref={setVideo}
          className={styles.video}
          style={{ borderRadius: radius }}
          autoPlay
          muted
          playsInline
        />
      ) : (
        <p className={styles.message}>{message}</p>
      )}
    </div>
  )
}
