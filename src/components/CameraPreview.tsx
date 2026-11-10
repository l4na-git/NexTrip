import { useLayoutEffect, useRef } from 'react'
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

// 画面が切り替わるたびに <video> を作り直すと、最初のフレームが出るまでプレビューが白く抜ける。
// 同じ映像ストリームには同じ <video> を使い回し、画面の切り替えで付け替えるだけにする。
const videos = new WeakMap<MediaStream, HTMLVideoElement>()

function videoFor(stream: MediaStream) {
  let video = videos.get(stream)
  if (!video) {
    video = document.createElement('video')
    video.className = styles.video
    video.autoplay = true
    video.muted = true
    video.playsInline = true
    video.srcObject = stream
    videos.set(stream, video)
  }
  return video
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
  const holderRef = useRef<HTMLDivElement>(null)

  // 描画の前に付け替えて、切り替えの瞬間も映像が途切れないようにする
  useLayoutEffect(() => {
    const holder = holderRef.current
    if (!stream || !holder) return

    const video = videoFor(stream)
    video.style.borderRadius = `${radius}px`
    holder.appendChild(video)
    void video.play().catch(() => {})
    onVideo?.(video)

    return () => {
      onVideo?.(null)
      if (video.parentNode === holder) holder.removeChild(video)
    }
  }, [stream, radius, onVideo])

  const message = error ? 'カメラを利用できません。ブラウザの許可を確認してください。' : placeholder

  // 映像の表示中は外側の枠をなくし、映像そのものに枠線を付けて縁に沿わせる。
  // 映像(<video>)は上の効果で、この枠の中に付ける。
  return (
    <div
      ref={holderRef}
      className={[styles.preview, !stream && styles[variant], className].filter(Boolean).join(' ')}
      style={{ borderRadius: radius }}
    >
      {!stream && <p className={styles.message}>{message}</p>}
    </div>
  )
}
