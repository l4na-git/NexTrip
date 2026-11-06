import type { SmileConfig } from './config'

export type SmileResult = {
  // 顔が検出されていた時間(ms)
  observedMs: number
  // 笑顔と判定されていた時間(ms)
  smileMs: number
  // 笑顔だった時間(秒)
  smileSeconds: number
  // 顔が検出されていた時間のうち、笑顔だった時間の割合(0〜1)
  smileRatio: number
  // 顔が検出されていた間の、笑顔スコアの平均(0〜1)
  meanIntensity: number
  // 笑顔と判定されていた間だけの、笑顔スコアの平均(0〜1)
  meanSmilingIntensity: number
  // 最大の笑顔スコア(0〜1)
  peak: number
  // 顔が一度も検出されず、計測できなかった
  noFace: boolean
}

// 時刻を引数で受け取るので、カメラなしでテストできる。顔が検出されたフレームだけを積算する。
export class SmileTracker {
  private lastTimestamp: number | null = null
  private lastHadFace = false
  private smoothed: number | null = null
  private smiling = false
  private observedMs = 0
  private smileMs = 0
  private intensityMs = 0
  private smilingIntensityMs = 0
  private peak = 0

  private config: SmileConfig

  constructor(config: SmileConfig) {
    this.config = config
  }

  setConfig(config: SmileConfig) {
    this.config = config
  }

  reset() {
    this.lastTimestamp = null
    this.lastHadFace = false
    this.smoothed = null
    this.smiling = false
    this.observedMs = 0
    this.smileMs = 0
    this.intensityMs = 0
    this.smilingIntensityMs = 0
    this.peak = 0
  }

  // groupScore が null のフレーム(誰も写っていない)は時間に数えず、平滑化の状態も捨てる。
  // 顔が戻った最初のフレームも、直前に顔がなかった区間は数えない。
  update(timestampMs: number, groupScore: number | null) {
    const dt =
      this.lastTimestamp === null || !this.lastHadFace
        ? 0
        : Math.min(Math.max(timestampMs - this.lastTimestamp, 0), this.config.maxGapMs)
    this.lastTimestamp = timestampMs
    this.lastHadFace = groupScore !== null

    if (groupScore === null) {
      this.smoothed = null
      this.smiling = false
      return
    }

    const { smoothing, threshold, hysteresis } = this.config
    this.smoothed =
      this.smoothed === null ? groupScore : smoothing * groupScore + (1 - smoothing) * this.smoothed
    const value = this.smoothed

    this.smiling = this.smiling ? value >= threshold - hysteresis : value >= threshold

    this.observedMs += dt
    this.intensityMs += value * dt
    if (this.smiling) {
      this.smileMs += dt
      this.smilingIntensityMs += value * dt
    }
    this.peak = Math.max(this.peak, value)
  }

  // 平滑化後の現在値と、いま笑顔と判定されているか(ライブ表示用)
  current() {
    return { value: this.smoothed, smiling: this.smiling }
  }

  result(): SmileResult {
    const { observedMs, smileMs } = this
    return {
      observedMs,
      smileMs,
      smileSeconds: smileMs / 1000,
      smileRatio: observedMs > 0 ? smileMs / observedMs : 0,
      meanIntensity: observedMs > 0 ? this.intensityMs / observedMs : 0,
      meanSmilingIntensity: smileMs > 0 ? this.smilingIntensityMs / smileMs : 0,
      peak: this.peak,
      noFace: observedMs === 0,
    }
  }
}
