import { useEffect, useRef } from 'react'
import type { CameraState } from '../hooks/useCamera'
import styles from './CameraPreview.module.css'

type Props = CameraState & {
  placeholder: string
  variant?: 'soft' | 'outline'
  radius?: number
  className?: string
}

export function CameraPreview({
  stream,
  error,
  placeholder,
  variant = 'soft',
  radius = 16,
  className,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

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
          ref={videoRef}
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
