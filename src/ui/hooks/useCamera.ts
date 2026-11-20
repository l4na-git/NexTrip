import { useCallback, useEffect, useState } from 'react'

// カメラが使えない原因。画面側で案内を出し分けるために区別する
export type CameraErrorReason =
  | 'insecure' // HTTPS / localhost 以外で mediaDevices が使えない
  | 'denied' // 許可されていない
  | 'notFound' // カメラが見つからない
  | 'inUse' // 他のアプリが使用中、または途中で切断された
  | 'unknown'

export type CameraState = {
  stream: MediaStream | null
  error: boolean
  reason: CameraErrorReason | null
}

const initialState: CameraState = { stream: null, error: false, reason: null }

function toReason(e: unknown): CameraErrorReason {
  if (e instanceof TypeError) return 'insecure'
  switch (e instanceof DOMException ? e.name : '') {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'denied'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'notFound'
    case 'NotReadableError':
    case 'AbortError':
      return 'inUse'
    default:
      return 'unknown'
  }
}

// active の間だけインカメラを起動し、false になる(またはアンマウントされる)と停止する。
// 起動後にカメラが切断された場合も error になる。
// retry を呼ぶと、カメラの取得をやり直す(ブラウザの許可を変えたあとなど)。
export function useCamera(active: boolean): CameraState & { retry: () => void } {
  const [state, setState] = useState<CameraState>(initialState)
  const [attempt, setAttempt] = useState(0)
  // 停止したときに状態を空へ戻す(effect ではなく描画中に切り替えて、余計な再描画を避ける)
  const [prevActive, setPrevActive] = useState(active)
  if (prevActive !== active) {
    setPrevActive(active)
    if (!active) setState(initialState)
  }
  const retry = useCallback(() => setAttempt((n) => n + 1), [])

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
        // 許可の取り消しや切断、他アプリによる奪取で映像が止まったらエラーにする
        stream.getTracks().forEach((track) =>
          track.addEventListener('ended', () => {
            if (!cancelled) setState({ stream: null, error: true, reason: 'inUse' })
          }),
        )
        setState({ stream, error: false, reason: null })
      })
      .catch((e) => {
        if (!cancelled) setState({ stream: null, error: true, reason: toReason(e) })
      })

    // 再試行中はエラー表示を保ち、結果が出たときに切り替える(ちらつき防止)
    return () => {
      cancelled = true
      acquired?.getTracks().forEach((track) => track.stop())
    }
  }, [active, attempt])

  return { ...state, retry }
}
