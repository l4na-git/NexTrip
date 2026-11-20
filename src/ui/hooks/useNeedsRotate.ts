import { useCallback, useSyncExternalStore } from 'react'

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

// タッチ操作が主体の端末(スマホ)が縦向きのときだけ true。PC では常に false。
export function useNeedsRotate() {
  const isTouch = useMediaQuery('(pointer: coarse) and (hover: none)')
  const isPortrait = useMediaQuery('(orientation: portrait)')
  return isTouch && isPortrait
}
