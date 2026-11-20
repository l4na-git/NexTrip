import type { SmileConfig } from './config'
import type { SmileResult } from './SmileTracker'

// 「笑顔だった時間の割合」と「笑顔の強さ」を重みで合成した 0〜100。InterestBar にそのまま渡せる。
export function interestPercent(result: SmileResult, config: SmileConfig): number {
  const { time, intensity } = config.weights
  const total = time + intensity
  if (result.noFace || total <= 0) return 0
  const value = (time * result.smileRatio + intensity * result.meanIntensity) / total
  return Math.round(Math.min(Math.max(value, 0), 1) * 100)
}
