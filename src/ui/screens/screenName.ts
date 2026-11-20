import type { Phase } from '../../application/tripSession'

// カメラのプレビューと画像を並べて、みんなで見る画面は横向きが前提。
// 開始・比較・結果は、縦向きでも見られる。
const portraitScreens: Phase[] = ['start', 'compare', 'result']

export function requiresLandscape(screen: Phase) {
  return !portraitScreens.includes(screen)
}
