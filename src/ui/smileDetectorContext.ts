import { createContext, useContext } from 'react'
import type { SmileDetectorFactory } from '../application/ports'

// 使う検出器の実装は composition root(main.tsx)で選び、この Context で渡す
export const SmileDetectorContext = createContext<SmileDetectorFactory | null>(null)

export function useSmileDetectorFactory(): SmileDetectorFactory {
  const factory = useContext(SmileDetectorContext)
  if (!factory) throw new Error('SmileDetectorContext が設定されていません。main.tsx で実装を渡してください')
  return factory
}
