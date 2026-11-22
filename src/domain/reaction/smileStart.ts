import type { SmileConfig } from './config'
import type { FaceSmile } from './score'

// 人ごとに、いま笑顔か(ヒステリシス付き)と、このフレームで笑顔になった人の位置(並び順)を返す。
// 確認画面の演出のきっかけ用で、計測には使わない。
// shortcut: 人の区別は検出の並び順。人が入れ替わると判定が一瞬ずれるが、演出なので許容する
export function nextSmiles(
  previous: boolean[],
  faces: FaceSmile[],
  { threshold, hysteresis }: Pick<SmileConfig, 'threshold' | 'hysteresis'>,
): { smiling: boolean[]; started: number[] } {
  const smiling = faces.map((face, i) => (previous[i] ? face.score >= threshold - hysteresis : face.score >= threshold))
  const started = smiling.flatMap((now, i) => (now && !previous[i] ? [i] : []))
  return { smiling, started }
}
