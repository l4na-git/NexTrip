export type ScreenName = 'start' | 'consent' | 'check' | 'candidate' | 'compare' | 'result'

// カメラのプレビューと画像を並べて、みんなで見る画面は横向きが前提。
// 開始・比較・結果は、縦向きでも見られる。
const portraitScreens: ScreenName[] = ['start', 'compare', 'result']

export function requiresLandscape(screen: ScreenName) {
  return !portraitScreens.includes(screen)
}
