import type { Phase } from '../../application/tripSession'

// カメラのプレビューと画像を並べて、みんなで見る画面は横向きが前提。
// 開始・同意・比較・結果は、縦向きでも見られる。
// 同意は説明を読む画面なので、開始画面から持ち替えずに縦のまま読めるようにする。
const portraitScreens: Phase[] = ['start', 'consent', 'compare', 'result']

export function requiresLandscape(screen: Phase) {
  return !portraitScreens.includes(screen)
}
