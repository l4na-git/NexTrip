import type { SmileConfig } from './config'
import { interestPercent } from './interest'
import { SmileTracker } from './SmileTracker'

export type ImageReaction = {
  // 関心度(0〜100)
  interest: number
  // 顔が一度も検出されず、計測できなかった
  noFace: boolean
}

// 誰も写っていない状態がこの時間続いたら、人が見つからないと判断する
export const NO_FACE_HOLD_MS = 1000

// 画像 1 枚ぶんの笑顔を計測する。finish() で結果を確定し、次の画像のために計測をやり直す。
export class ImageReactionRecorder {
  private tracker: SmileTracker
  private config: SmileConfig

  constructor(config: SmileConfig) {
    this.config = config
    this.tracker = new SmileTracker(config)
  }

  update(timestampMs: number, groupScore: number | null) {
    this.tracker.update(timestampMs, groupScore)
  }

  reset() {
    this.tracker.reset()
  }

  finish(): ImageReaction {
    const result = this.tracker.result()
    this.tracker.reset()
    return { interest: interestPercent(result, this.config), noFace: result.noFace }
  }
}

// 誰も写っていない状態が holdMs 続いたかを判定する。一瞬の検出落ちは数えない。
export class NoFaceWatcher {
  private holdMs: number
  private since: number | null = null
  private absent = false

  constructor(holdMs: number) {
    this.holdMs = holdMs
  }

  // absent: 人が見つからない状態が続いている。returned: たったいま人が戻った。
  update(timestampMs: number, groupScore: number | null) {
    const wasAbsent = this.absent
    if (groupScore !== null) {
      this.since = null
      this.absent = false
    } else {
      this.since ??= timestampMs
      this.absent = timestampMs - this.since >= this.holdMs
    }
    return { absent: this.absent, returned: wasAbsent && !this.absent }
  }

  reset() {
    this.since = null
    this.absent = false
  }
}
