import { useCallback, useState } from 'react'
import { DEFAULT_SMILE_CONFIG } from './config'
import {
  ImageReactionRecorder,
  NO_FACE_HOLD_MS,
  NoFaceWatcher,
  type ImageReaction,
} from './imageReaction'
import { useSmileMeter, type SmileFrame } from './useSmileMeter'

const MAX_FACES = 5

// カメラ映像から画像ごとの反応を計測する。誰も見つからない状態の検知もここで行う。
export function useImageReaction(video: HTMLVideoElement | null, enabled: boolean) {
  const [recorder] = useState(() => new ImageReactionRecorder(DEFAULT_SMILE_CONFIG))
  const [watcher] = useState(() => new NoFaceWatcher(NO_FACE_HOLD_MS))
  const [absent, setAbsent] = useState(false)

  const onFrame = useCallback(
    (frame: SmileFrame) => {
      recorder.update(frame.timestamp, frame.group)
      const { absent, returned } = watcher.update(frame.timestamp, frame.group)
      // 人が戻ったら、その画像は最初から計測し直す
      if (returned) recorder.reset()
      setAbsent(absent)
    },
    [recorder, watcher],
  )

  const { status } = useSmileMeter(video, { enabled, maxFaces: MAX_FACES, onFrame })

  // いまの画像の計測を確定し、次の画像のために計測をやり直す
  const finish = useCallback((): ImageReaction => recorder.finish(), [recorder])

  const reset = useCallback(() => {
    recorder.reset()
    watcher.reset()
    setAbsent(false)
  }, [recorder, watcher])

  // 読み込み中と失敗時は、見つからないのか判定できないので false
  return { status, noFace: status === 'ready' && absent, finish, reset }
}
