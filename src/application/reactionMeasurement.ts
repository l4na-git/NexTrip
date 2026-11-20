import type { SmileConfig } from '../domain/reaction/config'
import {
  ImageReactionRecorder,
  NO_FACE_HOLD_MS,
  NoFaceWatcher,
  type ImageReaction,
} from '../domain/reaction/imageReaction'

// 候補表示中の、画像 1 枚ごとの計測。
// 誰も写らない状態が続いたら知らせ、人が戻ったらその画像を最初から計測し直す(同じ画像から再開する)。
export class ReactionMeasurement {
  private recorder: ImageReactionRecorder
  private watcher: NoFaceWatcher

  constructor(config: SmileConfig, noFaceHoldMs = NO_FACE_HOLD_MS) {
    this.recorder = new ImageReactionRecorder(config)
    this.watcher = new NoFaceWatcher(noFaceHoldMs)
  }

  // 1 フレーム分を記録する。absent: 誰も見つからない状態が続いている
  update(timestampMs: number, groupScore: number | null): { absent: boolean } {
    this.recorder.update(timestampMs, groupScore)
    const { absent, returned } = this.watcher.update(timestampMs, groupScore)
    if (returned) this.recorder.reset()
    return { absent }
  }

  // いまの画像の計測を確定し、次の画像のために計測をやり直す
  finish(): ImageReaction {
    return this.recorder.finish()
  }

  // 計測をすべて捨てて、最初から始める
  reset() {
    this.recorder.reset()
    this.watcher.reset()
  }
}
