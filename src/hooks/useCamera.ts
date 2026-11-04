import { useEffect, useState } from 'react'

export type CameraState = {
  stream: MediaStream | null
  error: boolean
}

// active の間だけインカメラを起動し、false になる(またはアンマウントされる)と停止する。
export function useCamera(active: boolean): CameraState {
  const [state, setState] = useState<CameraState>({ stream: null, error: false })

  useEffect(() => {
    if (!active) return

    let cancelled = false
    let acquired: MediaStream | null = null

    // mediaDevices は HTTPS / localhost 以外では undefined になるため、Promise の中で扱う
    Promise.resolve()
      .then(() =>
        navigator.mediaDevices.getUserMedia({
          // 解像度が低いと枠に合わせて拡大されないため、大きめを要求する
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        }),
      )
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        acquired = stream
        setState({ stream, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ stream: null, error: true })
      })

    return () => {
      cancelled = true
      acquired?.getTracks().forEach((track) => track.stop())
      setState({ stream: null, error: false })
    }
  }, [active])

  return state
}
