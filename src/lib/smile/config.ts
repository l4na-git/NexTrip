export type SmileConfig = {
  // 笑顔と判定するスコア(0〜1)
  threshold: number
  // 笑顔から抜けるときは threshold - hysteresis を下回る必要がある(判定のちらつき防止)
  hysteresis: number
  // スコアの指数移動平均の係数(0〜1)。大きいほど最新の値に素早く追従する
  smoothing: number
  // 1 フレームで加算する時間の上限(ms)。タブの停止などで空いた時間を笑顔に数えない
  maxGapMs: number
  // 関心度に占める「笑顔だった時間」と「笑顔の強さ」の重み
  weights: {
    time: number
    intensity: number
  }
}

// 仮の初期値。閾値確認用のテストサイト(/threshold.html)で実測して決める
export const DEFAULT_SMILE_CONFIG: SmileConfig = {
  threshold: 0.5,
  hysteresis: 0.1,
  smoothing: 0.5,
  maxGapMs: 200,
  weights: { time: 0.5, intensity: 0.5 },
}
